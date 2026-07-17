#!/usr/bin/env python3
"""Sample privacy-safe aggregate listener telemetry from Icecast into SQLite."""

import argparse
import datetime as dt
import json
import logging
import socket
import sqlite3
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

DEFAULT_DATABASE = Path("/opt/swr-radio/data/analytics.sqlite3")
DEFAULT_STATUS_URL = "http://127.0.0.1:8000/status-json.xsl"
DEFAULT_MOUNT = "/strange-waves.mp3"
LOGGER = logging.getLogger("mdk.listener-analytics")

SCHEMA = """
CREATE TABLE IF NOT EXISTS listener_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sampled_at TEXT NOT NULL,
    mount TEXT NOT NULL,
    listeners INTEGER CHECK (listeners IS NULL OR listeners >= 0),
    listener_peak_source INTEGER CHECK (listener_peak_source IS NULL OR listener_peak_source >= 0),
    bitrate_kbps INTEGER CHECK (bitrate_kbps IS NULL OR bitrate_kbps >= 0),
    source_format TEXT,
    server_up INTEGER NOT NULL CHECK (server_up IN (0, 1)),
    source_up INTEGER CHECK (source_up IS NULL OR source_up IN (0, 1)),
    error_code TEXT,
    UNIQUE (sampled_at, mount)
);
CREATE INDEX IF NOT EXISTS listener_snapshots_sampled_at_idx
    ON listener_snapshots(sampled_at);
"""


class PayloadError(ValueError):
    pass


def utc_now():
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def normalize_timestamp(value):
    if value is None:
        return utc_now()
    try:
        parsed = dt.datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError(f"Invalid sampled_at timestamp: {value!r}") from exc
    if parsed.tzinfo is None:
        raise ValueError("sampled_at must include a timezone")
    return parsed.astimezone(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def normalize_mount(value):
    value = str(value or "").strip()
    if not value:
        raise ValueError("mount must not be empty")
    path = urllib.parse.urlparse(value).path if "://" in value else value
    return "/" + path.lstrip("/")


def connect_database(path):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path, timeout=5)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA busy_timeout = 5000")
    connection.execute("PRAGMA journal_mode = WAL")
    connection.executescript(SCHEMA)
    return connection


def fetch_status(url=DEFAULT_STATUS_URL, timeout=8):
    request = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        raw = response.read()
    return json.loads(raw.decode("utf-8"))


def source_mount(source):
    for key in ("listenurl", "mount"):
        value = source.get(key)
        if value:
            return normalize_mount(value)
    return None


def sources_from_status(status):
    if not isinstance(status, dict) or not isinstance(status.get("icestats"), dict):
        raise PayloadError("missing icestats object")
    sources = status["icestats"].get("source")
    if sources is None:
        return []
    if isinstance(sources, dict):
        return [sources]
    if isinstance(sources, list) and all(isinstance(item, dict) for item in sources):
        return sources
    raise PayloadError("icestats.source must be an object, array, or null")


def select_source(status, mount):
    mount = normalize_mount(mount)
    for source in sources_from_status(status):
        if source_mount(source) == mount:
            return source
    return None


def nonnegative_integer(value, field):
    if value is None or value == "":
        return None
    if isinstance(value, bool):
        raise PayloadError(f"{field} is not numeric")
    try:
        number = float(value)
    except (TypeError, ValueError) as exc:
        raise PayloadError(f"{field} is not numeric") from exc
    if number < 0 or not number.is_integer():
        raise PayloadError(f"{field} must be a non-negative integer")
    return int(number)


def source_format(source):
    value = source.get("server_type") or source.get("subtype")
    if not value:
        return None
    value = str(value).strip().lower()
    return {"audio/mpeg": "mp3", "audio/aac": "aac", "audio/ogg": "ogg"}.get(value, value[:64])


def snapshot_from_status(status, sampled_at, mount):
    sampled_at = normalize_timestamp(sampled_at)
    mount = normalize_mount(mount)
    source = select_source(status, mount)
    if source is None:
        return {
            "sampled_at": sampled_at, "mount": mount, "listeners": None,
            "listener_peak_source": None, "bitrate_kbps": None, "source_format": None,
            "server_up": 1, "source_up": 0, "error_code": "missing_mount",
        }
    try:
        listeners = nonnegative_integer(source.get("listeners"), "listeners")
        if listeners is None:
            raise PayloadError("listeners is missing")
        peak = nonnegative_integer(source.get("listener_peak"), "listener_peak")
        bitrate = nonnegative_integer(source.get("bitrate"), "bitrate")
    except PayloadError:
        raise
    return {
        "sampled_at": sampled_at, "mount": mount, "listeners": listeners,
        "listener_peak_source": peak, "bitrate_kbps": bitrate,
        "source_format": source_format(source), "server_up": 1, "source_up": 1,
        "error_code": None,
    }


def error_snapshot(sampled_at, mount, error_code, server_up, source_up=None):
    return {
        "sampled_at": normalize_timestamp(sampled_at), "mount": normalize_mount(mount),
        "listeners": None, "listener_peak_source": None, "bitrate_kbps": None,
        "source_format": None, "server_up": int(server_up), "source_up": source_up,
        "error_code": str(error_code)[:64],
    }


def insert_snapshot(connection, snapshot):
    fields = ("sampled_at", "mount", "listeners", "listener_peak_source", "bitrate_kbps",
              "source_format", "server_up", "source_up", "error_code")
    with connection:
        connection.execute("""
            INSERT INTO listener_snapshots
                (sampled_at, mount, listeners, listener_peak_source, bitrate_kbps,
                 source_format, server_up, source_up, error_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(sampled_at, mount) DO UPDATE SET
                listeners=excluded.listeners,
                listener_peak_source=excluded.listener_peak_source,
                bitrate_kbps=excluded.bitrate_kbps,
                source_format=excluded.source_format,
                server_up=excluded.server_up,
                source_up=excluded.source_up,
                error_code=excluded.error_code
        """, tuple(snapshot[field] for field in fields))


def sample_once(connection, fetcher=None, sampled_at=None, mount=DEFAULT_MOUNT,
                status_url=DEFAULT_STATUS_URL, timeout=8):
    sampled_at = normalize_timestamp(sampled_at)
    fetcher = fetcher or fetch_status
    try:
        status = fetcher(status_url, timeout)
        snapshot = snapshot_from_status(status, sampled_at, mount)
    except (TimeoutError, socket.timeout):
        snapshot = error_snapshot(sampled_at, mount, "timeout", server_up=0)
    except json.JSONDecodeError:
        snapshot = error_snapshot(sampled_at, mount, "invalid_json", server_up=1)
    except urllib.error.HTTPError as error:
        snapshot = error_snapshot(sampled_at, mount, f"http_{error.code}", server_up=0)
    except (urllib.error.URLError, ConnectionError, OSError):
        snapshot = error_snapshot(sampled_at, mount, "connection_error", server_up=0)
    except PayloadError:
        snapshot = error_snapshot(sampled_at, mount, "invalid_payload", server_up=1)
    insert_snapshot(connection, snapshot)
    return snapshot


def purge_older_than(connection, cutoff):
    cutoff = normalize_timestamp(cutoff)
    with connection:
        cursor = connection.execute("DELETE FROM listener_snapshots WHERE sampled_at < ?", (cutoff,))
    return cursor.rowcount


def build_parser():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", type=Path, default=DEFAULT_DATABASE)
    parser.add_argument("--status-url", default=DEFAULT_STATUS_URL)
    parser.add_argument("--mount", default=DEFAULT_MOUNT)
    parser.add_argument("--timeout", type=float, default=8)
    parser.add_argument("--sampled-at", help="UTC override for tests/backfills")
    maintenance = parser.add_mutually_exclusive_group()
    maintenance.add_argument("--purge-older-than", metavar="UTC", help="Maintenance only; do not sample")
    maintenance.add_argument("--purge-days", type=int, metavar="DAYS",
                             help="Maintenance only; purge rows older than this many days")
    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    try:
        connection = connect_database(args.database)
        try:
            if args.purge_older_than or args.purge_days is not None:
                if args.purge_days is not None:
                    if args.purge_days <= 0:
                        raise ValueError("--purge-days must be positive")
                    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=args.purge_days)
                    cutoff = cutoff.replace(microsecond=0).isoformat().replace("+00:00", "Z")
                else:
                    cutoff = normalize_timestamp(args.purge_older_than)
                count = purge_older_than(connection, cutoff)
                print(json.dumps({"purged": count, "before": cutoff}))
                return 0
            snapshot = sample_once(
                connection, sampled_at=args.sampled_at, mount=args.mount,
                status_url=args.status_url, timeout=args.timeout,
            )
            if snapshot["error_code"]:
                LOGGER.warning("Icecast sample recorded with %s", snapshot["error_code"])
            print(json.dumps(snapshot, separators=(",", ":")))
            return 0
        finally:
            connection.close()
    except (sqlite3.Error, ValueError) as error:
        LOGGER.error("Cannot record listener snapshot: %s", error)
        return 3


if __name__ == "__main__":
    sys.exit(main())
