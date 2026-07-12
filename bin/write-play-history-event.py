#!/usr/bin/env python3
"""Atomically write one Liquidsoap play-start event to the spool."""

import argparse
import datetime as dt
import json
import os
import sys
import tempfile
import uuid
from pathlib import Path

DEFAULT_SPOOL = Path("/opt/swr-radio/cache/play-history-spool")


class EventError(ValueError):
    pass


def value(argument, environment, name, default=None):
    return argument if argument is not None else environment.get(f"MDK_{name.upper()}", default)


def required_text(raw, name):
    if not isinstance(raw, str) or not raw.strip():
        raise EventError(f"{name} must be a non-empty string")
    return raw.strip()


def event_uid_value(raw):
    event_uid = required_text(raw, "event_uid")
    if len(event_uid) > 128:
        raise EventError("event_uid is too long")
    boot_id, separator, counter = event_uid.rpartition(":")
    if separator == "" or not counter.isascii() or not counter.isdigit():
        raise EventError("event_uid must use <UUID>:<positive-counter>")
    try:
        parsed_boot_id = uuid.UUID(boot_id)
    except (ValueError, AttributeError) as exc:
        raise EventError("event_uid boot ID must be a valid UUID") from exc
    if str(parsed_boot_id) != boot_id.lower() or int(counter) < 1:
        raise EventError("event_uid must use a canonical UUID and positive counter")
    return f"{parsed_boot_id}:{int(counter)}"


def utc_timestamp(raw, name):
    raw = required_text(raw, name)
    try:
        parsed = dt.datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError as exc:
        try:
            parsed = dt.datetime.fromtimestamp(float(raw), tz=dt.timezone.utc)
        except (ValueError, OverflowError) as epoch_exc:
            raise EventError(
                f"{name} must be a valid ISO-8601 timestamp or Unix epoch"
            ) from epoch_exc
    if parsed.tzinfo is None:
        raise EventError(f"{name} must include a timezone")
    return parsed.astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def build_event(args, environment=None):
    environment = os.environ if environment is None else environment
    started_at = utc_timestamp(value(args.started_at, environment, "started_at"), "started_at")
    observed_raw = value(args.observed_at, environment, "observed_at", started_at)
    event = {
        "event_uid": event_uid_value(value(args.event_uid, environment, "event_uid")),
        "track_id": required_text(value(args.track_id, environment, "track_id"), "track_id"),
        "started_at": started_at,
        "observed_at": utc_timestamp(observed_raw, "observed_at"),
        "detection_source": required_text(
            value(args.detection_source, environment, "detection_source", "liquidsoap"),
            "detection_source",
        ),
    }
    for name in ("release_id", "source_url", "title"):
        optional = value(getattr(args, name), environment, name)
        if optional is not None and str(optional) != "":
            event[name] = str(optional)
    return event


def safe_name():
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    return f"{stamp}-{uuid.uuid4().hex}.json"


def write_event(spool_dir, event):
    spool_dir = Path(spool_dir)
    spool_dir.mkdir(parents=True, exist_ok=True)
    destination = spool_dir / safe_name()
    temporary = None
    try:
        handle = tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=spool_dir, prefix=".event-", delete=False
        )
        temporary = Path(handle.name)
        with handle:
            json.dump(event, handle, ensure_ascii=False, separators=(",", ":"))
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(handle.name, destination)
        temporary = None
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
    return destination


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--spool-dir", type=Path, default=DEFAULT_SPOOL)
    parser.add_argument("--event-uid")
    parser.add_argument("--track-id")
    parser.add_argument("--started-at")
    parser.add_argument("--observed-at")
    parser.add_argument("--detection-source")
    parser.add_argument("--release-id")
    parser.add_argument("--source-url")
    parser.add_argument("--title")
    return parser.parse_args(argv)


def main(argv=None, environment=None):
    try:
        args = parse_args(argv)
        event = build_event(args, environment)
        destination = write_event(args.spool_dir, event)
    except (EventError, OSError, TypeError) as exc:
        print(f"Cannot spool play-history event: {exc}", file=sys.stderr)
        return 2
    print(destination)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
