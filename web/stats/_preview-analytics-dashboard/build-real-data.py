#!/usr/bin/env python3
"""Build the read-only real-data snapshot for the isolated analytics preview."""

import json
import sqlite3
import subprocess
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
DATABASE = ROOT / "data/play-history.sqlite3"
MANIFEST = ROOT / "data/radio-manifest.json"
NOW_PLAYING = Path("/home/mdk/web/radio.mdkband.com/public_html/now-playing.json")
STATS = Path("/home/mdk/web/radio.mdkband.com/public_html/stats/stats.json")
PUBLIC_COVERS = Path("/home/mdk/web/radio.mdkband.com/public_html/covers")


def utc(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def iso_mtime(path):
    return datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat().replace("+00:00", "Z")


def main():
    manifest = json.loads(MANIFEST.read_text())
    now = json.loads(NOW_PLAYING.read_text())
    report = json.loads(STATS.read_text())
    releases = {item["release_id"]: item for item in manifest["releases"]}
    tracks = {item["track_id"]: item for item in manifest["tracks"]}

    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    events = [dict(row) for row in connection.execute(
        "SELECT started_at, track_id, release_id, track_title FROM play_events ORDER BY started_at"
    )]
    release_counts = Counter(event["release_id"] for event in events)
    track_counts = Counter(event["track_id"] for event in events)

    def cover_name(release_id):
        for suffix in (".jpg", ".png"):
            source = PUBLIC_COVERS / f"{release_id}{suffix}"
            if source.exists():
                return f"covers/{release_id}.webp", source
        return None, None

    def release_record(release_id, plays):
        item = releases[release_id]
        name, source = cover_name(release_id)
        return {
            "release_id": release_id,
            "title": item["title"],
            "artist": item.get("artist", "MDK"),
            "broadcast_plays": plays,
            "cover": name,
            "cover_source": item.get("cover_url"),
        }, source

    top_releases, cover_sources = [], {}
    for release_id, plays in sorted(release_counts.items(), key=lambda pair: (-pair[1], pair[0]))[:6]:
        item, source = release_record(release_id, plays)
        top_releases.append(item)
        if source:
            cover_sources[release_id] = source

    top_tracks = []
    for track_id, plays in sorted(track_counts.items(), key=lambda pair: (-pair[1], pair[0]))[:6]:
        track = tracks[track_id]
        release = releases[track["release_id"]]
        name, source = cover_name(track["release_id"])
        top_tracks.append({
            "track_id": track_id,
            "title": track["title"],
            "release_id": track["release_id"],
            "release_title": release["title"],
            "broadcast_plays": plays,
            "duration_seconds": track.get("duration_seconds"),
            "cover": name,
        })
        if source:
            cover_sources[track["release_id"]] = source

    current_release = now.get("release_id")
    current_cover, source = cover_name(current_release)
    if source:
        cover_sources[current_release] = source

    cutoff = utc(now["updated_at"]) - timedelta(hours=24)
    markers = [event for event in events if utc(event["started_at"]) >= cutoff]
    marker_step = max(1, len(markers) // 10)
    markers = markers[::marker_step][-10:]

    recent = []
    for entry in now.get("transmission_log", [])[:8]:
        name, source = cover_name(entry["release_id"])
        if source:
            cover_sources[entry["release_id"]] = source
        recent.append({**entry, "cover": name, "kind": "track"})

    output = {
        "snapshot_at": now["updated_at"],
        "sources": {
            "now_playing": "/now-playing.json",
            "play_history": str(DATABASE),
            "report": "/stats/stats.json",
            "catalog": str(MANIFEST),
        },
        "live": {
            "ok": now.get("ok", False),
            "listeners_now": now.get("listeners"),
            "listener_peak_lifetime": now.get("listener_peak"),
            "bitrate_kbps": now.get("bitrate"),
            "format": now.get("source_format"),
        },
        "now_playing": {
            "track_id": now.get("track_id"),
            "track_title": now.get("track_title"),
            "release_id": current_release,
            "release_title": now.get("release_title"),
            "artist": now.get("artist"),
            "cover": current_cover,
            "cover_source": now.get("cover_url"),
            "started_at": now.get("track_started_at"),
            "elapsed_seconds": now.get("track_elapsed_seconds"),
            "duration_seconds": now.get("track_duration_seconds"),
            "progress_percent": now.get("progress_percent"),
            "connections": now.get("listeners"),
        },
        "play_history": {
            "tracking_start": report["period"]["start"],
            "tracking_end": report["period"]["end"],
            "total_plays": report["summary"]["total_plays"],
            "unique_tracks": report["summary"]["unique_tracks_played"],
            "unique_releases": report["summary"]["unique_albums_played"],
            "top_releases": top_releases,
            "top_tracks": top_tracks,
            "track_markers_24h": markers,
            "recent_transmissions": recent,
        },
        "health": [
            {"name": "Icecast", "status": "signal", "detail": "Live status relayed by now-playing.json", "observed_at": now["updated_at"]},
            {"name": "Liquidsoap", "status": "inferred", "detail": "Track transitions are arriving", "observed_at": report["period"]["end"]},
            {"name": "Now-playing updater", "status": "signal", "detail": "Public snapshot refreshed", "observed_at": now["updated_at"]},
            {"name": "Play-history consumer", "status": "inferred", "detail": "Latest SQLite event", "observed_at": report["period"]["end"]},
            {"name": "Report generator", "status": "signal", "detail": "Static report refreshed", "observed_at": report["generated_at"]},
        ],
        "artifact_mtimes": {
            "database": iso_mtime(DATABASE),
            "now_playing": iso_mtime(NOW_PLAYING),
            "report": iso_mtime(STATS),
        },
    }

    covers_dir = HERE / "covers"
    covers_dir.mkdir(exist_ok=True)
    for release_id, source in cover_sources.items():
        destination = covers_dir / f"{release_id}.webp"
        subprocess.run([
            "convert", str(source), "-auto-orient", "-thumbnail", "240x240^",
            "-gravity", "center", "-extent", "240x240", "-quality", "76", str(destination)
        ], check=True)
    (HERE / "real-data.json").write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
