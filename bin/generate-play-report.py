#!/usr/bin/env python3
"""Generate static MDK Space Radio play-history HTML and JSON reports."""

import argparse
import datetime as dt
import html
import json
import os
import sqlite3
import tempfile
from pathlib import Path
from string import Template

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATABASE = Path("/opt/swr-radio/data/play-history.sqlite3")
DEFAULT_TEMPLATE = ROOT / "web/stats/index.template.html"
DEFAULT_CSS = ROOT / "web/stats/stats.css"
DEFAULT_HTML = Path("/home/mdk/web/radio.mdkband.com/public_html/stats/index.html")
DEFAULT_JSON = Path("/home/mdk/web/radio.mdkband.com/public_html/stats/stats.json")


def parse_time(value):
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))


def seconds_since(now, value):
    if not value:
        return None
    return max(0, round((now - parse_time(value)).total_seconds()))


def collect_statistics(connection, generated_at=None):
    connection.row_factory = sqlite3.Row
    now = parse_time(generated_at) if generated_at else dt.datetime.now(dt.timezone.utc)
    generated_at = now.astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z")

    catalog_tracks = connection.execute("""
        SELECT t.track_id, t.track_title, t.release_id, t.track_number, t.display,
               r.release_title
        FROM catalog_tracks t JOIN catalog_releases r USING (release_id)
        WHERE t.radio_ready = 1
        ORDER BY r.release_id, t.track_number, t.track_id
    """).fetchall()
    catalog_size = len(catalog_tracks)
    releases = connection.execute("""
        SELECT r.release_id, r.release_title, COUNT(t.track_id) AS track_count
        FROM catalog_releases r
        JOIN catalog_tracks t USING (release_id)
        WHERE t.radio_ready = 1
        GROUP BY r.release_id, r.release_title
        ORDER BY r.release_id
    """).fetchall()
    plays = connection.execute("""
        SELECT id, event_uid, started_at, track_id, release_id, display, track_title
        FROM play_events ORDER BY started_at, id
    """).fetchall()
    total = len(plays)
    period_start = plays[0]["started_at"] if plays else None
    period_end = plays[-1]["started_at"] if plays else None

    play_times = {}
    for play in plays:
        play_times.setdefault(play["track_id"], []).append(play["started_at"])

    track_rows = []
    for track in catalog_tracks:
        times = play_times.get(track["track_id"], [])
        last = times[-1] if times else None
        track_rows.append({
            "track_id": track["track_id"],
            "track_title": track["track_title"],
            "release_id": track["release_id"],
            "release_title": track["release_title"],
            "track_number": track["track_number"],
            "plays": len(times),
            "last_played_at": last,
            "current_drought_seconds": seconds_since(now, last),
        })

    played_tracks = [row for row in track_rows if row["plays"]]
    never_played = [row for row in track_rows if not row["plays"]]
    most_played = sorted(played_tracks, key=lambda row: (-row["plays"], row["track_id"]))
    least_played = sorted(played_tracks, key=lambda row: (row["plays"], row["track_id"]))
    last_play = dict(plays[-1]) if plays else None

    album_counts = {}
    for play in plays:
        album_counts[play["release_id"]] = album_counts.get(play["release_id"], 0) + 1
    album_ranking = []
    for release in releases:
        count = album_counts.get(release["release_id"], 0)
        expected = (total * release["track_count"] / catalog_size) if catalog_size else 0
        album_ranking.append({
            "release_id": release["release_id"],
            "release_title": release["release_title"],
            "track_count": release["track_count"],
            "plays": count,
            "plays_per_track": count / release["track_count"] if release["track_count"] else 0,
            "expected_plays": expected,
            "observed_expected_ratio": count / expected if expected else None,
            "deviation": count - expected,
        })
    album_ranking.sort(key=lambda row: (-row["plays"], row["release_id"]))

    repeat_windows = {}
    release_sequence = [play["release_id"] for play in plays]
    for window in (3, 5, 10):
        count = 0
        examples = []
        for index, release_id in enumerate(release_sequence):
            preceding = release_sequence[max(0, index - window):index]
            if release_id in preceding:
                count += 1
                if len(examples) < 20:
                    examples.append({"position": index + 1, "release_id": release_id})
        repeat_windows[str(window)] = {"count": count, "examples": examples}

    return {
        "generated_at": generated_at,
        "tracking_notice": "Statistics cover only plays recorded since tracking began.",
        "period": {"start": period_start, "end": period_end},
        "summary": {
            "total_plays": total,
            "unique_tracks_played": len(play_times),
            "unique_albums_played": len(album_counts),
            "catalog_tracks": catalog_size,
            "catalog_albums": len(releases),
        },
        "tracks": track_rows,
        "never_played": never_played,
        "most_played": most_played,
        "least_played_among_played": least_played,
        "last_play": last_play,
        "album_ranking": album_ranking,
        "near_album_repetitions": repeat_windows,
        "recent_plays": [dict(row) for row in reversed(plays[-200:])],
        "methodology": {
            "play_definition": "One committed source-track start event equals one play.",
            "album_expected": "Expected album plays are proportional to eligible catalog track count.",
            "near_repetition": "A play repeats an album within N positions when that album occurs among the preceding N plays.",
            "drought": "Current drought is elapsed UTC time since the track's last recorded play.",
            "limitations": [
                "Tracking is not retrospective; unrecorded historical broadcasts are excluded.",
                "Never-played means never played during the covered tracking period.",
                "Source callback or catalog outages may cause missing events.",
            ],
        },
    }


def format_timestamp(value):
    if not value:
        return "—"
    exact = html.escape(str(value), quote=True)
    fallback = html.escape(f"{value} UTC")
    return f'<time class="local-time" datetime="{exact}">{fallback}</time>'


def format_duration(seconds):
    if seconds is None:
        return "—"
    days, remainder = divmod(int(seconds), 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes = remainder // 60
    return f"{days}d {hours}h {minutes}m" if days else f"{hours}h {minutes}m"


def track_table(rows, table_id):
    body = []
    for row in rows:
        search = " ".join(str(row.get(key) or "") for key in
                          ("track_id", "track_title", "release_id", "release_title"))
        body.append(
            f'<tr data-search="{html.escape(search, quote=True)}" '
            f'data-release="{html.escape(str(row.get("release_id") or ""), quote=True)}">'
            f'<td><code>{html.escape(str(row.get("track_id") or ""))}</code></td>'
            f'<td>{html.escape(str(row.get("track_title") or ""))}</td>'
            f'<td>{html.escape(str(row.get("release_id") or ""))}: '
            f'{html.escape(str(row.get("release_title") or ""))}</td>'
            f'<td>{int(row.get("plays") or 0)}</td>'
            f'<td>{format_timestamp(row.get("last_played_at"))}</td>'
            f'<td>{html.escape(format_duration(row.get("current_drought_seconds")))}</td></tr>'
        )
    return (f'<table id="{html.escape(table_id, quote=True)}"><thead><tr>'
            '<th>Track ID</th><th>Track</th><th>Album</th><th>Plays</th>'
            '<th>Last play</th><th>Current drought</th></tr></thead><tbody>'
            + "".join(body) + "</tbody></table>")


def album_table(rows):
    body = []
    for row in rows:
        ratio = "—" if row["observed_expected_ratio"] is None else f'{row["observed_expected_ratio"]:.3f}'
        body.append(
            f'<tr data-search="{html.escape((row["release_id"] + " " + row["release_title"]), quote=True)}">'
            f'<td>{html.escape(row["release_id"])}</td><td>{html.escape(row["release_title"])}</td>'
            f'<td>{row["track_count"]}</td><td>{row["plays"]}</td>'
            f'<td>{row["plays_per_track"]:.3f}</td><td>{row["expected_plays"]:.3f}</td>'
            f'<td>{ratio}</td><td>{row["deviation"]:+.3f}</td></tr>'
        )
    return ('<table id="albums"><thead><tr><th>ID</th><th>Album</th><th>Tracks</th>'
            '<th>Plays</th><th>Plays/track</th><th>Expected</th><th>Observed/expected</th>'
            '<th>Deviation</th></tr></thead><tbody>' + "".join(body) + "</tbody></table>")


def recent_table(rows):
    body = []
    for row in rows:
        search = " ".join(str(row.get(key) or "") for key in
                          ("track_id", "track_title", "release_id", "display"))
        body.append(
            f'<tr data-search="{html.escape(search, quote=True)}">'
            f'<td>{format_timestamp(row.get("started_at"))}</td>'
            f'<td><code>{html.escape(str(row.get("track_id") or ""))}</code></td>'
            f'<td>{html.escape(str(row.get("track_title") or ""))}</td>'
            f'<td>{html.escape(str(row.get("release_id") or ""))}</td></tr>'
        )
    return ('<table id="recent"><thead><tr><th>Started</th><th>Track ID</th>'
            '<th>Track</th><th>Album</th></tr></thead><tbody>' + "".join(body) + "</tbody></table>")


def render_html(stats, template_text, css_text):
    summary = stats["summary"]
    repeats = stats["near_album_repetitions"]
    last = stats["last_play"]
    generated_at = format_timestamp(stats["generated_at"])
    if last is None:
        tracking_status = (
            '<p class="notice">Tracking will begin with the first recorded play.</p>'
        )
        period_status = (
            f'<p>No playback events have been recorded yet. · Updated: {generated_at}</p>'
        )
        last_play = "No plays recorded yet."
    else:
        tracking_status = (
            '<p class="notice">Tracking begins at '
            f'<strong>{format_timestamp(stats["period"]["start"])}</strong>. '
            'Earlier broadcasts are not included.</p>'
        )
        period_status = (
            f'<p>Period end: {format_timestamp(stats["period"]["end"])} · '
            f'Updated: {generated_at}</p>'
        )
        last_play = (
            f'{html.escape(last["track_title"])} · '
            f'{format_timestamp(last["started_at"])}'
        )
    values = {
        "css": css_text,
        "tracking_status": tracking_status,
        "period_status": period_status,
        "total_plays": str(summary["total_plays"]),
        "unique_tracks": str(summary["unique_tracks_played"]),
        "unique_albums": str(summary["unique_albums_played"]),
        "catalog_tracks": str(summary["catalog_tracks"]),
        "catalog_albums": str(summary["catalog_albums"]),
        "last_play": last_play,
        "repeat_3": str(repeats["3"]["count"]),
        "repeat_5": str(repeats["5"]["count"]),
        "repeat_10": str(repeats["10"]["count"]),
        "most_played_table": track_table(stats["most_played"], "most-played"),
        "least_played_table": track_table(stats["least_played_among_played"], "least-played"),
        "never_played_table": track_table(stats["never_played"], "never-played"),
        "album_table": album_table(stats["album_ranking"]),
        "recent_table": recent_table(stats["recent_plays"]),
    }
    return Template(template_text).substitute(values)


def atomic_write(path, content):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    handle = tempfile.NamedTemporaryFile(
        mode="w", encoding="utf-8", dir=path.parent, prefix=f".{path.name}.", delete=False
    )
    try:
        with handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
            os.chmod(handle.name, 0o644)
        os.replace(handle.name, path)
    except Exception:
        Path(handle.name).unlink(missing_ok=True)
        raise


def generate(database, template, css, html_output, json_output, generated_at=None):
    connection = sqlite3.connect(f"file:{Path(database)}?mode=ro", uri=True)
    try:
        stats = collect_statistics(connection, generated_at)
    finally:
        connection.close()
    template_text = Path(template).read_text(encoding="utf-8")
    css_text = Path(css).read_text(encoding="utf-8")
    rendered = render_html(stats, template_text, css_text)
    atomic_write(json_output, json.dumps(stats, ensure_ascii=False, indent=2) + "\n")
    atomic_write(html_output, rendered)
    return stats


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", type=Path, default=DEFAULT_DATABASE)
    parser.add_argument("--template", type=Path, default=DEFAULT_TEMPLATE)
    parser.add_argument("--css", type=Path, default=DEFAULT_CSS)
    parser.add_argument("--html-output", type=Path, default=DEFAULT_HTML)
    parser.add_argument("--json-output", type=Path, default=DEFAULT_JSON)
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    try:
        stats = generate(args.database, args.template, args.css,
                         args.html_output, args.json_output)
    except (OSError, sqlite3.Error, KeyError, ValueError) as exc:
        print(f"Report generation failed: {exc}", file=__import__("sys").stderr)
        return 2
    print(f'Wrote {stats["summary"]["total_plays"]} plays to {args.html_output} and {args.json_output}')
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
