#!/usr/bin/env python3
"""Synchronize the radio catalog and record idempotent play events."""

import argparse
import datetime as dt
import json
import os
import re
import sqlite3
import sys
import tempfile
import uuid
from pathlib import Path

DEFAULT_DATABASE = Path("/opt/swr-radio/data/play-history.sqlite3")
DEFAULT_MANIFEST = Path("/opt/swr-radio/data/radio-manifest.json")
DEFAULT_SPOOL = Path("/opt/swr-radio/cache/play-history-spool")

SCHEMA = """
CREATE TABLE IF NOT EXISTS catalog_releases (
    release_id TEXT PRIMARY KEY,
    release_title TEXT NOT NULL,
    release_date TEXT,
    artist TEXT,
    track_count INTEGER NOT NULL DEFAULT 0,
    cover_url TEXT,
    bandcamp_url TEXT,
    archive_item_url TEXT,
    catalog_seen_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS catalog_tracks (
    track_id TEXT PRIMARY KEY,
    release_id TEXT NOT NULL REFERENCES catalog_releases(release_id),
    track_number INTEGER,
    track_title TEXT NOT NULL,
    display TEXT NOT NULL,
    source_url TEXT,
    radio_ready INTEGER NOT NULL,
    catalog_seen_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS play_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_uid TEXT NOT NULL UNIQUE,
    started_at TEXT NOT NULL,
    observed_at TEXT NOT NULL,
    track_id TEXT NOT NULL REFERENCES catalog_tracks(track_id),
    release_id TEXT NOT NULL,
    display TEXT NOT NULL,
    track_title TEXT NOT NULL,
    source_url TEXT,
    detection_source TEXT NOT NULL DEFAULT 'liquidsoap'
);
CREATE INDEX IF NOT EXISTS play_events_started_at_idx ON play_events(started_at);
CREATE INDEX IF NOT EXISTS play_events_track_started_idx ON play_events(track_id, started_at);
CREATE INDEX IF NOT EXISTS play_events_release_started_idx ON play_events(release_id, started_at);
"""


class InputError(ValueError):
    pass


class UnknownTrackError(InputError):
    pass


def utc_now():
    return dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def normalize_timestamp(value, field):
    if not isinstance(value, str) or not value.strip():
        raise InputError(f"{field} must be a non-empty ISO-8601 string")
    candidate = value.strip()
    try:
        parsed = dt.datetime.fromisoformat(candidate.replace("Z", "+00:00"))
    except ValueError as exc:
        raise InputError(f"{field} is not valid ISO-8601: {candidate!r}") from exc
    if parsed.tzinfo is None:
        raise InputError(f"{field} must include a timezone")
    return parsed.astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def connect_database(path):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path, timeout=5)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA busy_timeout = 5000")
    connection.execute("PRAGMA journal_mode = WAL")
    connection.executescript(SCHEMA)
    return connection


def load_manifest(path):
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise InputError(f"Cannot read manifest {path}: {exc}") from exc
    if data.get("schema_version") != "1.0":
        raise InputError("Play history requires manifest schema_version 1.0")
    return data


def sync_catalog(connection, manifest, seen_at=None):
    seen_at = seen_at or utc_now()
    releases = {}
    for release in manifest.get("releases", []):
        release_id = release.get("release_id")
        if not release_id:
            raise InputError("Every release must have release_id")
        if release_id in releases:
            raise InputError(f"Duplicate release_id: {release_id!r}")
        releases[release_id] = release

    tracks = manifest.get("tracks", [])
    seen_tracks = set()
    counts = {release_id: 0 for release_id in releases}
    for track in tracks:
        track_id = track.get("track_id")
        if not track_id:
            raise InputError("Every schema 1.0 track must have track_id")
        if track_id in seen_tracks:
            raise InputError(f"Duplicate track_id: {track_id!r}")
        seen_tracks.add(track_id)
        release_id = track.get("release_id")
        if release_id not in releases:
            raise InputError(f"Track {track_id!r} references missing release {release_id!r}")
        if track.get("radio_ready") is True:
            counts[release_id] += 1

    with connection:
        # Preserve historical foreign-key targets, but exclude tracks absent from
        # the latest catalog until an upsert below marks them active again.
        connection.execute("UPDATE catalog_tracks SET radio_ready = 0")
        for release_id, release in releases.items():
            connection.execute("""
                INSERT INTO catalog_releases
                    (release_id, release_title, release_date, artist, track_count,
                     cover_url, bandcamp_url, archive_item_url, catalog_seen_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(release_id) DO UPDATE SET
                    release_title=excluded.release_title,
                    release_date=excluded.release_date,
                    artist=excluded.artist,
                    track_count=excluded.track_count,
                    cover_url=excluded.cover_url,
                    bandcamp_url=excluded.bandcamp_url,
                    archive_item_url=excluded.archive_item_url,
                    catalog_seen_at=excluded.catalog_seen_at
            """, (
                release_id, str(release.get("title") or ""), release.get("release_date"),
                release.get("artist") or "MDK", counts[release_id], release.get("cover_url"),
                release.get("bandcamp_url"), release.get("archive_item_url"), seen_at,
            ))
        for track in tracks:
            release = releases[track["release_id"]]
            title = str(track.get("title") or "Untitled").replace("\n", " ").replace("\r", " ")
            display = f'{title} | {track["release_id"]}: {release.get("title") or ""}'
            connection.execute("""
                INSERT INTO catalog_tracks
                    (track_id, release_id, track_number, track_title, display,
                     source_url, radio_ready, catalog_seen_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(track_id) DO UPDATE SET
                    release_id=excluded.release_id,
                    track_number=excluded.track_number,
                    track_title=excluded.track_title,
                    display=excluded.display,
                    source_url=excluded.source_url,
                    radio_ready=excluded.radio_ready,
                    catalog_seen_at=excluded.catalog_seen_at
            """, (
                track["track_id"], track["release_id"], track.get("track_number"), title,
                display, track.get("stream_url") or track.get("flac_url"),
                int(track.get("radio_ready") is True), seen_at,
            ))
    return len(releases), len(tracks)


def validate_event(event):
    if not isinstance(event, dict):
        raise InputError("Event JSON must be an object")
    event_uid = event.get("event_uid")
    track_id = event.get("track_id")
    if not isinstance(event_uid, str) or not event_uid.strip():
        raise InputError("event_uid must be a non-empty string")
    if not isinstance(track_id, str) or not track_id.strip():
        raise InputError("track_id must be a non-empty string")
    return {
        "event_uid": event_uid.strip(),
        "track_id": track_id.strip(),
        "started_at": normalize_timestamp(event.get("started_at"), "started_at"),
        "observed_at": normalize_timestamp(event.get("observed_at") or utc_now(), "observed_at"),
        "detection_source": str(event.get("detection_source") or "liquidsoap"),
    }


def insert_event(connection, event):
    event = validate_event(event)
    track = connection.execute("""
        SELECT track_id, release_id, display, track_title, source_url
        FROM catalog_tracks WHERE track_id = ? AND radio_ready = 1
    """, (event["track_id"],)).fetchone()
    if track is None:
        raise UnknownTrackError(f'Unknown or non-radio-ready track_id: {event["track_id"]!r}')
    with connection:
        cursor = connection.execute("""
            INSERT OR IGNORE INTO play_events
                (event_uid, started_at, observed_at, track_id, release_id, display,
                 track_title, source_url, detection_source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            event["event_uid"], event["started_at"], event["observed_at"],
            track["track_id"], track["release_id"], track["display"],
            track["track_title"], track["source_url"], event["detection_source"],
        ))
    return cursor.rowcount == 1


def read_event(args):
    if args.event_json is not None:
        raw = args.event_json
    elif args.event_file is not None:
        try:
            raw = args.event_file.read_text(encoding="utf-8")
        except OSError as exc:
            raise InputError(f"Cannot read event file {args.event_file}: {exc}") from exc
    else:
        raw = sys.stdin.read()
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise InputError(f"Invalid event JSON: {exc}") from exc


def safe_spool_name(event):
    uid = str(event.get("event_uid") or "event")
    uid = re.sub(r"[^A-Za-z0-9_.-]+", "_", uid)[:80]
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    return f"{stamp}-{uid}-{uuid.uuid4().hex}.json"


def spool_event(spool_dir, event):
    spool_dir = Path(spool_dir)
    spool_dir.mkdir(parents=True, exist_ok=True)
    target = spool_dir / safe_spool_name(event)
    handle = tempfile.NamedTemporaryFile(
        mode="w", encoding="utf-8", dir=spool_dir, prefix=".event-", delete=False
    )
    try:
        with handle:
            json.dump(event, handle, ensure_ascii=False, separators=(",", ":"))
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(handle.name, target)
    except Exception:
        Path(handle.name).unlink(missing_ok=True)
        raise
    return target


def consume_spool(connection, spool_dir, retry_failed=False):
    spool_dir = Path(spool_dir)
    failed_dir = spool_dir / "failed"
    failed_dir.mkdir(parents=True, exist_ok=True)
    source_dir = failed_dir if retry_failed else spool_dir
    processed = duplicates = failed = 0
    for path in sorted(source_dir.glob("*.json")):
        try:
            event = json.loads(path.read_text(encoding="utf-8"))
            inserted = insert_event(connection, event)
        except (OSError, json.JSONDecodeError, InputError, sqlite3.IntegrityError):
            failed += 1
            if source_dir != failed_dir:
                destination = failed_dir / path.name
                if destination.exists():
                    destination = failed_dir / f"{path.stem}-{uuid.uuid4().hex}{path.suffix}"
                os.replace(path, destination)
            continue
        if inserted:
            processed += 1
        else:
            duplicates += 1
        path.unlink()
    return {"processed": processed, "duplicates": duplicates, "failed": failed}


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", type=Path, default=DEFAULT_DATABASE)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--event-file", type=Path, help="read one event JSON object from FILE")
    source.add_argument("--event-json", help="read one event from this JSON argument")
    parser.add_argument("--sync-only", action="store_true", help="synchronize catalog and exit")
    parser.add_argument("--spool", action="store_true", help="atomically spool the event instead of inserting it")
    parser.add_argument("--spool-dir", type=Path, default=DEFAULT_SPOOL)
    parser.add_argument("--consume-spool", action="store_true", help="consume queued events in filename order")
    parser.add_argument("--retry-failed", action="store_true", help="retry events currently under failed/")
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    try:
        if args.spool:
            event = read_event(args)
            validate_event(event)
            path = spool_event(args.spool_dir, event)
            print(f"Spooled event to {path}")
            return 0

        connection = connect_database(args.database)
        try:
            releases, tracks = sync_catalog(connection, load_manifest(args.manifest))
            if args.sync_only:
                print(f"Synchronized {releases} releases and {tracks} tracks")
                return 0
            if args.consume_spool or args.retry_failed:
                result = consume_spool(connection, args.spool_dir, args.retry_failed)
                print(json.dumps(result, sort_keys=True))
                return 0 if result["failed"] == 0 else 5
            inserted = insert_event(connection, read_event(args))
            print("Inserted event" if inserted else "Event already recorded")
            return 0
        finally:
            connection.close()
    except UnknownTrackError as exc:
        print(f"Unknown track: {exc}", file=sys.stderr)
        return 4
    except InputError as exc:
        print(f"Input error: {exc}", file=sys.stderr)
        return 2
    except (OSError, sqlite3.Error) as exc:
        print(f"Storage error: {exc}", file=sys.stderr)
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
