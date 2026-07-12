#!/usr/bin/env python3
import argparse
import json
import os
import random
import tempfile
from pathlib import Path
from urllib.parse import urlparse

DEFAULT_MANIFEST = Path("/opt/swr-radio/data/radio-manifest.json")
DEFAULT_OUTPUT = Path("/opt/swr-radio/cache/playlist.m3u")
DEFAULT_MAP_OUTPUT = Path("/opt/swr-radio/cache/playlist-nowplaying-map.json")
STATION_NAME = "MDK Space Radio"


def liq_escape(value):
    value = "" if value is None else str(value)
    return (value.replace("\\", "\\\\").replace('"', '\\"')
            .replace("\n", " ").replace("\r", " "))


def line_escape(value):
    return ("" if value is None else str(value)).replace("\n", " ").replace("\r", " ")


def valid_http_url(value):
    if not isinstance(value, str):
        return False
    parsed = urlparse(value)
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def require_url(value, description):
    if not valid_http_url(value):
        raise ValueError(f"Invalid HTTP(S) URL for {description}: {value!r}")
    return value


def validate_optional_urls(release, archive_url):
    for description, value in (
        ("archive", archive_url),
        ("cover", release.get("cover_url")),
        ("Bandcamp", release.get("bandcamp_url")),
    ):
        if value is not None and value != "":
            require_url(value, description)


def metadata_entry(release, track, url, source_format, archive_url, track_id=None):
    release_id = release.get("release_id", "")
    release_title = release.get("title", "")
    artist = release.get("artist", "MDK")
    track_title = track.get("title", "Untitled")
    display = line_escape(f"{track_title} | {release_id}: {release_title}")
    entry = {
        "station": STATION_NAME,
        "artist": artist,
        "title": f"{artist} - {display}",
        "track_title": line_escape(track_title),
        "track_number": track.get("track_number", 0),
        "release_id": release_id,
        "release_number": release.get("release_number"),
        "release_title": line_escape(release_title),
        "release_date": release.get("release_date"),
        "cover_url": release.get("cover_url"),
        "archive_details_url": archive_url,
        "bandcamp_url": release.get("bandcamp_url"),
        "source_url": url,
        "source_format": source_format,
    }
    if track_id is not None:
        entry["track_id"] = track_id
    if archive_url is not None:
        entry["archive_item_url"] = archive_url
    return display, entry


def annotated_line(display, entry):
    fields = [
        f'title="{liq_escape(display)}"',
        f'artist="{liq_escape(entry["artist"])}"',
        f'album="{liq_escape(entry["release_title"])}"',
        f'comment="{liq_escape(entry.get("archive_item_url") or entry.get("archive_details_url") or "")}"',
    ]
    if "track_id" in entry:
        fields.extend((
            f'track_id="{liq_escape(entry["track_id"])}"',
            f'release_id="{liq_escape(entry["release_id"])}"',
            f'source_url="{liq_escape(entry["source_url"])}"',
        ))
    return f'annotate:{",".join(fields)}:{entry["source_url"]}'


def add_item(items, nowplaying, release, track, url, source_format, archive_url,
             track_id=None):
    require_url(url, f'track {track_id or track.get("title", "Untitled")}')
    validate_optional_urls(release, archive_url)
    original_display, entry = metadata_entry(
        release, track, url, source_format, archive_url, track_id=track_id
    )
    display = original_display
    if display in nowplaying:
        if track_id is not None:
            display = f"{original_display} [{track_id}]"
        else:
            display = f'{original_display} [track {track.get("track_number", 0)}]'
        if display in nowplaying:
            raise ValueError(
                "Duplicate display remains unresolved after deterministic suffix: "
                f"original={original_display!r}, alternative={display!r}"
            )
        entry["title"] = f'{entry["artist"]} - {display}'
    nowplaying[display] = entry
    items.append((display, annotated_line(display, entry)))


def build_legacy(data):
    items, nowplaying = [], {}
    for release in data.get("releases", []):
        if release.get("publication_status") not in ("ready", "verified"):
            continue
        archive_url = release.get("archive_details_url")
        for track in release.get("tracks", []):
            mp3 = track.get("ia_mp3_url") or track.get("mp3_url")
            flac = track.get("ia_flac_url") or track.get("flac_url")
            url = mp3 or flac
            if not url:
                continue
            add_item(items, nowplaying, release, track, url,
                     "mp3" if mp3 else "flac", archive_url)
    return items, nowplaying


def build_v1(data):
    items, nowplaying = [], {}
    releases = {}
    for release in data.get("releases", []):
        release_id = release.get("release_id")
        if release_id in releases:
            raise ValueError(f"Duplicate release_id: {release_id!r}")
        releases[release_id] = release

    tracks = data.get("tracks", [])
    seen_track_ids = set()
    for track in tracks:
        track_id = track.get("track_id")
        if not isinstance(track_id, str) or not track_id.strip():
            raise ValueError("Every schema 1.0 track must have a non-empty track_id")
        if track_id in seen_track_ids:
            raise ValueError(f"Duplicate track_id: {track_id!r}")
        seen_track_ids.add(track_id)

    for track in tracks:
        if track.get("radio_ready") is not True:
            continue
        track_id = track["track_id"]
        release_id = track.get("release_id")
        if release_id not in releases:
            raise ValueError(
                f"Track {track_id!r} references missing release {release_id!r}"
            )
        release = releases[release_id]
        stream = track.get("stream_url")
        flac = track.get("flac_url")
        url = stream or flac
        if not url:
            continue
        archive_url = release.get("archive_item_url")
        add_item(items, nowplaying, release, track, url,
                 "mp3" if stream else "flac", archive_url, track_id=track_id)
    return items, nowplaying


def build_outputs(data):
    if data.get("schema_version") == "1.0":
        items, nowplaying = build_v1(data)
    else:
        items, nowplaying = build_legacy(data)
    if not items:
        raise ValueError("Manifest produced zero playable tracks")
    return items, nowplaying


def render_playlist(items):
    lines = ["#EXTM3U"]
    for display, annotated in items:
        lines.extend((f"#EXTINF:-1,{display}", annotated))
    return "\n".join(lines) + "\n"


def write_temp(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    handle = tempfile.NamedTemporaryFile(
        mode="w", encoding="utf-8", dir=path.parent,
        prefix=f".{path.name}.", delete=False
    )
    try:
        with handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        return Path(handle.name)
    except Exception:
        Path(handle.name).unlink(missing_ok=True)
        raise


def generate(manifest, output, map_output, seed=None):
    data = json.loads(manifest.read_text(encoding="utf-8"))
    items, nowplaying = build_outputs(data)
    (random.shuffle(items) if seed is None else random.Random(seed).shuffle(items))

    playlist_temp = map_temp = None
    try:
        playlist_temp = write_temp(output, render_playlist(items))
        map_temp = write_temp(
            map_output, json.dumps(nowplaying, ensure_ascii=False, indent=2) + "\n"
        )
        os.replace(map_temp, map_output)
        map_temp = None
        os.replace(playlist_temp, output)
        playlist_temp = None
    finally:
        if playlist_temp is not None:
            playlist_temp.unlink(missing_ok=True)
        if map_temp is not None:
            map_temp.unlink(missing_ok=True)
    return len(items)


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="Generate the MDK Space Radio playlist")
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--map-output", type=Path, default=DEFAULT_MAP_OUTPUT)
    parser.add_argument("--seed", type=int)
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    count = generate(args.manifest, args.output, args.map_output, args.seed)
    print(f"Wrote {count} tracks to {args.output}")
    print(f"Wrote metadata map to {args.map_output}")


if __name__ == "__main__":
    main()
