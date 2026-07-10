#!/usr/bin/env python3
import json
import random
from pathlib import Path

MANIFEST = Path("/opt/swr-radio/data/radio-manifest.json")
OUT = Path("/opt/swr-radio/cache/playlist.m3u")
MAP = Path("/opt/swr-radio/cache/playlist-nowplaying-map.json")

def liq_escape(value):
    value = "" if value is None else str(value)
    return value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").replace("\r", " ")

data = json.loads(MANIFEST.read_text(encoding="utf-8"))

items = []
nowplaying = {}

for release in data.get("releases", []):
    status = release.get("publication_status")
    if status not in ("ready", "verified"):
        continue

    release_id = release.get("release_id", "")
    release_number = release.get("release_number")
    release_title = release.get("title", "")
    artist = release.get("artist", "MDK")

    for track in release.get("tracks", []):
        mp3 = track.get("ia_mp3_url") or track.get("mp3_url")
        flac = track.get("ia_flac_url") or track.get("flac_url")
        url = mp3 or flac

        if not url:
            continue

        track_number = track.get("track_number", 0)
        track_title = track.get("title", "Untitled")

        display = f"{track_title} | {release_id}: {release_title}"

        annotated = (
            f'annotate:'
            f'title="{liq_escape(display)}",'
            f'artist="{liq_escape(artist)}",'
            f'album="{liq_escape(release_title)}",'
            f'comment="{liq_escape(release.get("archive_details_url", ""))}"'
            f':{url}'
        )

        items.append((display, annotated))

        nowplaying[display] = {
            "station": "MDK Space Radio",
            "artist": artist,
            "title": f"{artist} - {display}",
            "track_title": track_title,
            "track_number": track_number,
            "release_id": release_id,
            "release_number": release_number,
            "release_title": release_title,
            "release_date": release.get("release_date"),
            "cover_url": release.get("cover_url"),
            "archive_details_url": release.get("archive_details_url"),
            "bandcamp_url": release.get("bandcamp_url"),
            "source_url": url,
            "source_format": "mp3" if url == mp3 else "flac",
        }

random.shuffle(items)

OUT.parent.mkdir(parents=True, exist_ok=True)

with OUT.open("w", encoding="utf-8") as f:
    f.write("#EXTM3U\n")
    for display, annotated in items:
        f.write(f"#EXTINF:-1,{display}\n")
        f.write(f"{annotated}\n")

MAP.write_text(json.dumps(nowplaying, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"Wrote {len(items)} tracks to {OUT}")
print(f"Wrote metadata map to {MAP}")
