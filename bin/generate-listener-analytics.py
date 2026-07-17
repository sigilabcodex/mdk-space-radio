#!/usr/bin/env python3
"""Generate privacy-safe listener aggregates from Icecast snapshot rows."""

import argparse
import datetime as dt
import json
import os
import sqlite3
import sys
import tempfile
from pathlib import Path

DEFAULT_DATABASE = Path("/opt/swr-radio/data/analytics.sqlite3")
DEFAULT_OUTPUT = Path("/home/mdk/web/radio.mdkband.com/public_html/stats/listener-analytics.json")
EXPECTED_SAMPLE_SECONDS = 60
MAX_INTEGRATION_GAP_SECONDS = 150


def parse_time(value):
    return dt.datetime.fromisoformat(str(value).replace("Z", "+00:00")).astimezone(dt.timezone.utc)


def iso_time(value):
    return value.astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def utc_now():
    return dt.datetime.now(dt.timezone.utc)


def connect_database(path):
    connection = sqlite3.connect(path, timeout=5)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA busy_timeout = 5000")
    return connection


def read_rows(connection, start, end, mount):
    return [dict(row) for row in connection.execute("""
        SELECT sampled_at, mount, listeners, listener_peak_source, bitrate_kbps,
               source_format, server_up, source_up, error_code
        FROM listener_snapshots
        WHERE mount = ? AND sampled_at >= ? AND sampled_at <= ?
        ORDER BY sampled_at
    """, (mount, iso_time(start), iso_time(end)))]


def valid(row):
    return row["server_up"] == 1 and row["source_up"] == 1 and row["listeners"] is not None


def integrate_listener_time(rows, max_gap_seconds=MAX_INTEGRATION_GAP_SECONDS):
    listener_seconds = 0.0
    observed_seconds = 0.0
    for current, following in zip(rows, rows[1:]):
        if not valid(current) or not valid(following):
            continue
        elapsed = (parse_time(following["sampled_at"]) - parse_time(current["sampled_at"])).total_seconds()
        if elapsed <= 0 or elapsed > max_gap_seconds:
            continue
        listener_seconds += current["listeners"] * elapsed
        observed_seconds += elapsed
    return listener_seconds, observed_seconds


def build_series(rows, start, end, bucket_seconds):
    bucket_count = int((end - start).total_seconds() // bucket_seconds)
    buckets = [[] for _ in range(bucket_count)]
    health = [[] for _ in range(bucket_count)]
    for row in rows:
        index = int((parse_time(row["sampled_at"]) - start).total_seconds() // bucket_seconds)
        if 0 <= index < bucket_count:
            health[index].append(row)
            if valid(row):
                buckets[index].append(row["listeners"])
    output = []
    for index, values in enumerate(buckets):
        bucket_start = start + dt.timedelta(seconds=index * bucket_seconds)
        bucket_end = bucket_start + dt.timedelta(seconds=bucket_seconds)
        output.append({
            "from": iso_time(bucket_start),
            "to": iso_time(bucket_end),
            "listeners": round(sum(values) / len(values), 3) if values else None,
            "peak": max(values) if values else None,
            "sample_count": len(values),
            "error_count": sum(1 for row in health[index] if row["error_code"]),
        })
    return output


def expected_and_missing(rows, start, end, sample_seconds=EXPECTED_SAMPLE_SECONDS):
    if not rows:
        return 0, 0, None
    coverage_start = max(start, parse_time(rows[0]["sampled_at"]))
    expected = int((end - coverage_start).total_seconds() // sample_seconds) + 1
    valid_count = sum(valid(row) for row in rows)
    return expected, max(0, expected - valid_count), coverage_start


def freshness(latest, now, stale_after_seconds):
    if latest is None:
        return {"status": "no_data", "sampled_at": None, "age_seconds": None,
                "stale_after_seconds": stale_after_seconds}
    age = max(0, round((now - parse_time(latest["sampled_at"])).total_seconds()))
    return {"status": "fresh" if age <= stale_after_seconds else "stale",
            "sampled_at": latest["sampled_at"], "age_seconds": age,
            "stale_after_seconds": stale_after_seconds}


def collect_aggregates(connection, mount="/strange-waves.mp3", generated_at=None,
                       sample_seconds=EXPECTED_SAMPLE_SECONDS, stale_after_seconds=150,
                       max_gap_seconds=MAX_INTEGRATION_GAP_SECONDS):
    now = parse_time(generated_at) if generated_at else utc_now()
    start_7d = now - dt.timedelta(days=7)
    start_24h = now - dt.timedelta(hours=24)
    rows_7d = read_rows(connection, start_7d, now, mount)
    rows_24h = [row for row in rows_7d if parse_time(row["sampled_at"]) >= start_24h]
    latest = rows_7d[-1] if rows_7d else None
    valid_24h = [row for row in rows_24h if valid(row)]
    valid_7d = [row for row in rows_7d if valid(row)]
    listener_seconds, observed_seconds = integrate_listener_time(rows_24h, max_gap_seconds)
    expected, missing, coverage_start = expected_and_missing(rows_24h, start_24h, now, sample_seconds)
    latest_is_fresh = latest is not None and (now - parse_time(latest["sampled_at"])).total_seconds() <= stale_after_seconds
    listeners_now = latest["listeners"] if latest_is_fresh and valid(latest) else None

    return {
        "schema_version": "1.0",
        "generated_at": iso_time(now),
        "mount": mount,
        "methodology": {
            "listener_hours": "Sum of listeners × duration to the next consecutive valid sample.",
            "listener_hours_is_not_sessions": True,
            "sample_interval_seconds": sample_seconds,
            "max_integrated_gap_seconds": max_gap_seconds,
            "series_24h_bucket_seconds": 300,
            "series_7d_bucket_seconds": 3600,
            "unknown_values": "Unknown listener values remain null and gaps longer than the integration limit are excluded.",
        },
        "listeners_now": listeners_now,
        "peak_24h": max((row["listeners"] for row in valid_24h), default=None),
        "peak_7d": max((row["listeners"] for row in valid_7d), default=None),
        "average_24h": round(listener_seconds / observed_seconds, 3) if observed_seconds else None,
        "estimated_listener_hours_24h": round(listener_seconds / 3600, 3) if observed_seconds else None,
        "observed_duration_seconds_24h": round(observed_seconds),
        "series_24h": build_series(rows_24h, start_24h, now, 300),
        "series_7d": build_series(rows_7d, start_7d, now, 3600),
        "sample_count": len(valid_24h),
        "total_snapshot_count_24h": len(rows_24h),
        "missing_sample_count": missing,
        "expected_sample_count": expected,
        "coverage_start_24h": iso_time(coverage_start) if coverage_start else None,
        "freshness": freshness(latest, now, stale_after_seconds),
        "source_health": {
            "server_up": bool(latest["server_up"]) if latest else None,
            "source_up": bool(latest["source_up"]) if latest and latest["source_up"] is not None else None,
            "error_code": latest["error_code"] if latest else "no_data",
            "bitrate_kbps": latest["bitrate_kbps"] if latest and valid(latest) else None,
            "source_format": latest["source_format"] if latest and valid(latest) else None,
            "listener_peak_source": latest["listener_peak_source"] if latest and valid(latest) else None,
        },
    }


def atomic_write_json(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    handle = tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent,
                                         prefix=f".{path.name}.", delete=False)
    try:
        with handle:
            json.dump(data, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
            handle.flush()
            os.fchmod(handle.fileno(), 0o644)
            os.fsync(handle.fileno())
        os.replace(handle.name, path)
        directory = os.open(path.parent, os.O_RDONLY | os.O_DIRECTORY)
        try:
            os.fsync(directory)
        finally:
            os.close(directory)
    except Exception:
        Path(handle.name).unlink(missing_ok=True)
        raise


def build_parser():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", type=Path, default=DEFAULT_DATABASE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--mount", default="/strange-waves.mp3")
    parser.add_argument("--generated-at", help="UTC override for deterministic generation")
    parser.add_argument("--sample-interval", type=int, default=EXPECTED_SAMPLE_SECONDS)
    parser.add_argument("--stale-after", type=int, default=150)
    parser.add_argument("--max-gap", type=int, default=MAX_INTEGRATION_GAP_SECONDS)
    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    try:
        connection = connect_database(args.database)
        try:
            data = collect_aggregates(
                connection, mount=args.mount, generated_at=args.generated_at,
                sample_seconds=args.sample_interval, stale_after_seconds=args.stale_after,
                max_gap_seconds=args.max_gap,
            )
        finally:
            connection.close()
        atomic_write_json(args.output, data)
        print(f"Wrote listener analytics to {args.output}")
        return 0
    except (OSError, sqlite3.Error, ValueError) as error:
        print(f"Cannot generate listener analytics: {error}", file=sys.stderr)
        return 3


if __name__ == "__main__":
    sys.exit(main())
