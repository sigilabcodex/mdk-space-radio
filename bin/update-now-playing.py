#!/usr/bin/env python3
import json
import html
import logging
import re
import time
import subprocess
import urllib.request
from pathlib import Path

STATUS_URL = "http://127.0.0.1:8000/status-json.xsl"
MAP_PATH = Path("/opt/swr-radio/cache/playlist-nowplaying-map.json")
RELEASE_METADATA_MAP_PATH = Path("/opt/swr-radio/cache/release-metadata-map.json")

STATE_PATH = Path("/opt/swr-radio/cache/now-playing-state.json")
DURATION_CACHE_PATH = Path("/opt/swr-radio/cache/track-duration-cache.json")
TRANSMISSION_LOG_PATH = Path("/opt/swr-radio/cache/transmission-log.json")

PUBLIC_ROOT = Path("/home/mdk/web/radio.mdkband.com/public_html")
OUT_PATH = PUBLIC_ROOT / "now-playing.json"
COVERS_DIR = PUBLIC_ROOT / "covers"

STATION_NAME = "MDK Space Radio"
LOGGER = logging.getLogger(__name__)
EMPTY_RELEASE_METADATA = {
    "release_text": "",
    "release_text_source": None,
    "release_text_source_url": None,
    "release_text_fragments": [],
    "producer_codes": [],
    "producer_profile": None,
    "producer_label": None,
}

def fetch_json(url, timeout=10):
    with urllib.request.urlopen(url, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))

def safe_ext_from_url(url):
    lower = (url or "").lower()
    for ext in [".jpg", ".jpeg", ".png", ".webp"]:
        if ext in lower:
            return ".jpg" if ext == ".jpeg" else ext
    return ".jpg"

def download_if_missing(url, dest):
    if not url or dest.exists():
        return dest.exists()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MDK-Space-Radio/1.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
        if len(data) > 1024:
            dest.write_bytes(data)
            return True
    except Exception:
        return False
    return False

def normalize_title(title):
    title = title or ""
    title = html.unescape(title)
    title = title.replace("—", "-")
    title = title.replace("–", "-")
    title = re.sub(r"\s+", " ", title).strip()
    return title

def candidate_keys(icecast_title):
    t = normalize_title(icecast_title)
    candidates = [t]

    if t.startswith("MDK - "):
        candidates.append(t[len("MDK - "):])

    candidates.append(t.replace("MDK - MDK - ", "MDK - "))
    candidates.append(t.replace("MDK - MDK | ", "MDK - "))

    return list(dict.fromkeys(candidates))

def read_json_file(path, default):
    try:
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        pass
    return default

def load_release_metadata_map():
    try:
        data = json.loads(RELEASE_METADATA_MAP_PATH.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return data
        raise ValueError("release metadata map is not an object")
    except FileNotFoundError:
        LOGGER.warning("Release metadata map is missing: %s", RELEASE_METADATA_MAP_PATH)
    except Exception as error:
        LOGGER.warning("Release metadata map is unavailable: %s", error)
    return {}

def release_metadata_fields(release_metadata_map, release_id):
    item = release_metadata_map.get(release_id)
    if not isinstance(item, dict):
        if release_id:
            LOGGER.warning("Release metadata is missing for %s", release_id)
        return dict(EMPTY_RELEASE_METADATA)
    return {
        "release_text": item.get("release_text") if isinstance(item.get("release_text"), str) else "",
        "release_text_source": item.get("release_text_source") if isinstance(item.get("release_text_source"), str) else None,
        "release_text_source_url": item.get("release_text_source_url") if isinstance(item.get("release_text_source_url"), str) else None,
        "release_text_fragments": item.get("release_text_fragments") if isinstance(item.get("release_text_fragments"), list) else [],
        "producer_codes": item.get("producer_codes") if isinstance(item.get("producer_codes"), list) else [],
        "producer_profile": item.get("producer_profile") if isinstance(item.get("producer_profile"), str) else None,
        "producer_label": item.get("producer_label") if isinstance(item.get("producer_label"), str) else None,
    }

def write_json_file(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def transmission_event(match, started_at_unix, started_at):
    return {
        "started_at": started_at,
        "started_at_unix": started_at_unix,
        "track_title": match.get("track_title"),
        "release_id": match.get("release_id"),
        "release_title": match.get("release_title"),
        "artist": match.get("artist"),
        "source_url": match.get("source_url"),
        "archive_details_url": match.get("archive_details_url"),
        "bandcamp_url": match.get("bandcamp_url"),
    }

def same_transmission_event(a, b):
    if a.get("source_url") and b.get("source_url"):
        return a.get("source_url") == b.get("source_url")
    return (
        a.get("track_title"),
        a.get("release_id"),
        a.get("release_title"),
    ) == (
        b.get("track_title"),
        b.get("release_id"),
        b.get("release_title"),
    )

def read_transmission_log():
    log = read_json_file(TRANSMISSION_LOG_PATH, [])
    if isinstance(log, list):
        return log
    return []

def append_transmission_event(match, started_at_unix, started_at):
    event = transmission_event(match, started_at_unix, started_at)
    log = read_transmission_log()

    if log and same_transmission_event(log[0], event):
        return log[:12]

    log = [event] + log
    log = log[:12]
    write_json_file(TRANSMISSION_LOG_PATH, log)
    return log

def ffprobe_duration_seconds(url):
    if not url:
        return None

    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                url,
            ],
            capture_output=True,
            text=True,
            timeout=20,
        )
        value = result.stdout.strip()
        if not value:
            return None
        seconds = float(value)
        if seconds > 0:
            return round(seconds, 3)
    except Exception:
        return None

    return None

def get_duration(source_url):
    cache = read_json_file(DURATION_CACHE_PATH, {})
    if source_url in cache:
        return cache[source_url]

    duration = ffprobe_duration_seconds(source_url)
    if duration:
        cache[source_url] = duration
        write_json_file(DURATION_CACHE_PATH, cache)

    return duration

def format_seconds(seconds):
    if seconds is None:
        return None
    seconds = max(0, int(seconds))
    m, s = divmod(seconds, 60)
    h, m = divmod(m, 60)
    if h:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"

def main():
    now_ts = time.time()

    now = {
        "station": STATION_NAME,
        "ok": False,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now_ts)),
        "transmission_log": read_transmission_log()[:12],
    }

    try:
        status = fetch_json(STATUS_URL)
        source = status.get("icestats", {}).get("source", {})
        icecast_title = source.get("title") or ""

        now.update({
            "ok": True,
            "station": STATION_NAME,
            "icecast_title": icecast_title,
            "listeners": source.get("listeners"),
            "listener_peak": source.get("listener_peak"),
            "bitrate": source.get("bitrate"),
            "server_name": source.get("server_name") or STATION_NAME,
            "stream_url": "https://radio.mdkband.com/stream.mp3",
            "status_url": "https://radio.mdkband.com/status.json",
        })

        metadata_map = json.loads(MAP_PATH.read_text(encoding="utf-8"))
        release_metadata_map = load_release_metadata_map()

        normalized_map = {normalize_title(k): v for k, v in metadata_map.items()}

        match = None
        for key in candidate_keys(icecast_title):
            normalized_key = normalize_title(key)
            if key in metadata_map:
                match = metadata_map[key]
                break
            if normalized_key in normalized_map:
                match = normalized_map[normalized_key]
                break

        if match:
            now.update(match)
            now["station"] = STATION_NAME

            release_id = match.get("release_id") or "unknown"
            now.update(release_metadata_fields(release_metadata_map, release_id))
            cover_url = match.get("cover_url")
            ext = safe_ext_from_url(cover_url)
            cover_file = COVERS_DIR / f"{release_id}{ext}"

            if download_if_missing(cover_url, cover_file):
                now["local_cover_url"] = f"/covers/{cover_file.name}"
                now["absolute_cover_url"] = f"https://radio.mdkband.com/covers/{cover_file.name}"
            elif cover_url:
                now["absolute_cover_url"] = cover_url

            state = read_json_file(STATE_PATH, {})
            source_url = match.get("source_url")
            current_key = icecast_title or source_url or ""

            if state.get("current_key") != current_key:
                started_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now_ts))
                state = {
                    "current_key": current_key,
                    "started_at_unix": now_ts,
                    "started_at": started_at,
                }
                write_json_file(STATE_PATH, state)
                now["transmission_log"] = append_transmission_event(match, now_ts, started_at)

            started_at_unix = float(state.get("started_at_unix", now_ts))
            if not now["transmission_log"]:
                now["transmission_log"] = append_transmission_event(
                    match,
                    started_at_unix,
                    state.get("started_at") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(started_at_unix)),
                )

            elapsed = max(0, now_ts - started_at_unix)

            duration = get_duration(source_url)
            progress_percent = None
            remaining = None

            if duration:
                progress_percent = min(100, max(0, (elapsed / duration) * 100))
                remaining = max(0, duration - elapsed)

            now.update({
                "track_started_at": state.get("started_at"),
                "track_elapsed_seconds": round(elapsed, 3),
                "track_elapsed_display": format_seconds(elapsed),
                "track_duration_seconds": duration,
                "track_duration_display": format_seconds(duration),
                "track_remaining_seconds": round(remaining, 3) if remaining is not None else None,
                "track_remaining_display": format_seconds(remaining) if remaining is not None else None,
                "progress_percent": round(progress_percent, 2) if progress_percent is not None else None,
            })

        write_json_file(OUT_PATH, now)

    except Exception as e:
        now["error"] = str(e)
        write_json_file(OUT_PATH, now)
        raise

if __name__ == "__main__":
    main()
