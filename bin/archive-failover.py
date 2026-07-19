#!/usr/bin/env python3

from __future__ import annotations

import fcntl
import json
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/opt/swr-radio")
REMOTE_PLAYLIST = ROOT / "cache/playlist.m3u"
LOCAL_PLAYLIST = ROOT / "cache/emergency-local-enriched.m3u"
ACTIVE_PLAYLIST = ROOT / "cache/active-playlist.m3u"

STATE_FILE = ROOT / "cache/archive-failover-state.json"
LOG_FILE = ROOT / "logs/archive-failover.log"
LOCK_FILE = ROOT / "cache/archive-failover.lock"

# Probar un archivo musical real, no sólo la portada de Archive.org.
PROBE_URL = (
    "https://archive.org/download/"
    "mdk079-thex-tc-jet/"
    "06%20-%20A%20new%20day.mp3"
)

FAILURES_TO_LOCAL = 2
SUCCESSES_TO_REMOTE = 3

ANNOTATE_FIELD = re.compile(
    r'([A-Za-z_][A-Za-z0-9_]*)="((?:\\.|[^"\\])*)"'
)
REQUIRED_LOCAL_FIELDS = ("track_id", "release_id", "title", "artist", "album")


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def log(message: str) -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    line = f"{now()} {message}\n"
    with LOG_FILE.open("a", encoding="utf-8") as handle:
        handle.write(line)
    print(line, end="")


def load_state() -> dict:
    default = {
        "mode": "local",
        "consecutive_successes": 0,
        "consecutive_failures": 0,
        "last_check": None,
        "last_http_code": None,
        "last_switch": None,
    }

    try:
        loaded = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        default.update(loaded)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        pass

    return default


def atomic_write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    fd, temporary = tempfile.mkstemp(
        prefix=f".{path.name}.",
        dir=path.parent,
    )

    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())

        os.replace(temporary, path)

        directory_fd = os.open(path.parent, os.O_DIRECTORY)
        try:
            os.fsync(directory_fd)
        finally:
            os.close(directory_fd)
    finally:
        try:
            os.unlink(temporary)
        except FileNotFoundError:
            pass


def valid_playlist(path: Path) -> bool:
    try:
        lines = [
            line.strip()
            for line in path.read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.startswith("#")
        ]
    except OSError:
        return False

    return len(lines) > 0


def invalid_local_playlist(path: Path, reason: str) -> RuntimeError:
    return RuntimeError(f"Invalid local enriched playlist {path}: {reason}")


def parse_annotate_source(path: Path, line: str, line_number: int) -> tuple[dict, str]:
    if not line.startswith("annotate:"):
        raise invalid_local_playlist(
            path,
            f"line {line_number}: every media entry must use annotate:",
        )

    source = line[len("annotate:"):]
    quoted = False
    escaped = False
    separator = None

    for index, character in enumerate(source):
        if escaped:
            escaped = False
        elif quoted and character == "\\":
            escaped = True
        elif character == '"':
            quoted = not quoted
        elif character == ":" and not quoted:
            separator = index
            break

    if separator is None or quoted:
        raise invalid_local_playlist(
            path,
            f"line {line_number}: malformed annotate quoting or missing media separator",
        )

    raw_fields = source[:separator]
    media = source[separator + 1:]
    fields = {}
    position = 0

    while position < len(raw_fields):
        match = ANNOTATE_FIELD.match(raw_fields, position)
        if match is None:
            raise invalid_local_playlist(
                path,
                f"line {line_number}: malformed annotate field or quote structure",
            )

        key, value = match.groups()
        if key in fields:
            raise invalid_local_playlist(
                path,
                f"line {line_number}: duplicate annotate field {key}",
            )
        fields[key] = value
        position = match.end()

        if position == len(raw_fields):
            break
        if raw_fields[position] != ",":
            raise invalid_local_playlist(
                path,
                f"line {line_number}: malformed annotate field separator",
            )
        position += 1
        if position == len(raw_fields):
            raise invalid_local_playlist(
                path,
                f"line {line_number}: malformed annotate trailing comma",
            )

    if not fields or not media:
        raise invalid_local_playlist(
            path,
            f"line {line_number}: annotate entry is missing fields or media path",
        )

    return fields, media


def validate_local_enriched_playlist(path: Path) -> int:
    if not path.is_file():
        raise invalid_local_playlist(path, "source must exist and be a regular file")

    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as error:
        raise invalid_local_playlist(path, f"cannot read source: {error}") from error

    meaningful = [line.strip() for line in lines if line.strip()]
    if not meaningful:
        raise invalid_local_playlist(path, "source must be nonempty")
    if meaningful[0] != "#EXTM3U":
        raise invalid_local_playlist(path, "first meaningful line must be #EXTM3U")

    pending_duration = None
    pending_line = None
    entry_count = 0
    track_ids = set()
    media_paths = set()

    for line_number, raw_line in enumerate(lines, start=1):
        line = raw_line.strip()
        if not line or line == "#EXTM3U":
            continue

        if line.startswith("#EXTINF:"):
            if pending_duration is not None:
                raise invalid_local_playlist(
                    path,
                    f"line {line_number}: previous #EXTINF has no media entry",
                )
            match = re.fullmatch(r"#EXTINF:([^,]+),.*", line)
            try:
                duration = float(match.group(1)) if match else None
            except ValueError:
                duration = None
            if duration is None or not math.isfinite(duration) or duration <= 0:
                raise invalid_local_playlist(
                    path,
                    f"line {line_number}: #EXTINF duration must be a positive number",
                )
            pending_duration = duration
            pending_line = line_number
            continue

        if line.startswith("#"):
            continue

        if pending_duration is None:
            raise invalid_local_playlist(
                path,
                f"line {line_number}: media entry must have a preceding #EXTINF line",
            )

        fields, media = parse_annotate_source(path, line, line_number)
        for field in REQUIRED_LOCAL_FIELDS:
            if not fields.get(field, "").strip():
                raise invalid_local_playlist(
                    path,
                    f"line {line_number}: annotate entry requires nonempty {field}",
                )

        media_path = Path(media)
        if media.startswith(("http://", "https://")) or not media_path.is_absolute():
            raise invalid_local_playlist(
                path,
                f"line {line_number}: media must be an absolute local path",
            )
        if not media_path.is_file():
            raise invalid_local_playlist(
                path,
                f"line {line_number}: local media must exist and be a regular file",
            )

        track_id = fields["track_id"]
        if track_id in track_ids:
            raise invalid_local_playlist(
                path,
                f"line {line_number}: Duplicate track_id {track_id}",
            )
        if media in media_paths:
            raise invalid_local_playlist(
                path,
                f"line {line_number}: Duplicate local media path {media}",
            )

        track_ids.add(track_id)
        media_paths.add(media)
        entry_count += 1
        pending_duration = None
        pending_line = None

    if pending_duration is not None:
        raise invalid_local_playlist(
            path,
            f"line {pending_line}: #EXTINF has no following media entry",
        )
    if entry_count == 0:
        raise invalid_local_playlist(path, "source must contain at least one entry")

    return entry_count


def activate(source: Path, mode: str) -> None:
    if mode == "local":
        try:
            validate_local_enriched_playlist(source)
        except RuntimeError as error:
            log(f"SWITCH-BLOCKED mode=local source={source} reason={error}")
            raise
    elif not valid_playlist(source):
        raise RuntimeError(f"Playlist inválida o vacía: {source}")

    ACTIVE_PLAYLIST.parent.mkdir(parents=True, exist_ok=True)

    fd, temporary = tempfile.mkstemp(
        prefix=".active-playlist.",
        suffix=".m3u",
        dir=ACTIVE_PLAYLIST.parent,
    )

    try:
        with os.fdopen(fd, "wb") as output:
            with source.open("rb") as input_file:
                shutil.copyfileobj(input_file, output)

            output.flush()
            os.fsync(output.fileno())

        os.chmod(temporary, 0o600)
        os.replace(temporary, ACTIVE_PLAYLIST)

        directory_fd = os.open(ACTIVE_PLAYLIST.parent, os.O_DIRECTORY)
        try:
            os.fsync(directory_fd)
        finally:
            os.close(directory_fd)
    finally:
        try:
            os.unlink(temporary)
        except FileNotFoundError:
            pass

    log(f"SWITCH mode={mode} source={source} active={ACTIVE_PLAYLIST}")


def probe_archive() -> tuple[bool, str]:
    command = [
        "/usr/bin/curl",
        "-4",
        "--location",
        "--silent",
        "--show-error",
        "--range",
        "0-65535",
        "--max-time",
        "20",
        "--output",
        "/dev/null",
        "--write-out",
        "%{http_code}|%{content_type}|%{size_download}",
        PROBE_URL,
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=25,
            check=False,
        )
    except subprocess.TimeoutExpired:
        return False, "timeout"

    report = result.stdout.strip()
    parts = report.split("|")

    code = parts[0] if len(parts) > 0 else "000"
    content_type = parts[1].lower() if len(parts) > 1 else ""
    size_text = parts[2] if len(parts) > 2 else "0"

    try:
        size = float(size_text)
    except ValueError:
        size = 0

    audio_type = (
        content_type.startswith("audio/")
        or content_type == "application/octet-stream"
    )

    success = (
        result.returncode == 0
        and code in {"200", "206"}
        and audio_type
        and size > 0
    )

    return success, report or f"curl-exit-{result.returncode}"


def main() -> int:
    LOCK_FILE.parent.mkdir(parents=True, exist_ok=True)

    with LOCK_FILE.open("w", encoding="utf-8") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return 0

        state = load_state()
        success, report = probe_archive()

        state["last_check"] = now()
        state["last_http_code"] = report

        if success:
            state["consecutive_successes"] += 1
            state["consecutive_failures"] = 0
            log(
                "PROBE ok "
                f"result={report} "
                f"successes={state['consecutive_successes']} "
                f"mode={state['mode']}"
            )
        else:
            state["consecutive_failures"] += 1
            state["consecutive_successes"] = 0
            log(
                "PROBE failed "
                f"result={report} "
                f"failures={state['consecutive_failures']} "
                f"mode={state['mode']}"
            )

        if (
            state["mode"] != "local"
            and state["consecutive_failures"] >= FAILURES_TO_LOCAL
        ):
            activate(LOCAL_PLAYLIST, "local")
            state["mode"] = "local"
            state["last_switch"] = now()

        elif (
            state["mode"] != "remote"
            and state["consecutive_successes"] >= SUCCESSES_TO_REMOTE
        ):
            activate(REMOTE_PLAYLIST, "remote")
            state["mode"] = "remote"
            state["last_switch"] = now()

        # Protección adicional: asegurar una playlist activa en el primer arranque.
        if not valid_playlist(ACTIVE_PLAYLIST):
            source = (
                REMOTE_PLAYLIST
                if state["mode"] == "remote"
                else LOCAL_PLAYLIST
            )
            activate(source, state["mode"])
            state["last_switch"] = now()

        atomic_write_json(STATE_FILE, state)
        return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        log(f"FATAL {type(error).__name__}: {error}")
        raise
