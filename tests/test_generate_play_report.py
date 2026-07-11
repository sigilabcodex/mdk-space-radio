import importlib.util
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


recorder = load("record_for_report", ROOT / "bin/record-play-history.py")
report = load("generate_play_report", ROOT / "bin/generate-play-report.py")


MANIFEST = {
    "schema_version": "1.0",
    "releases": [
        {"release_id": "A", "title": "Álbum <A>", "artist": "MDK"},
        {"release_id": "B", "title": "Album B", "artist": "MDK"},
    ],
    "tracks": [
        {"track_id": "A-1", "release_id": "A", "track_number": 1,
         "title": "Café <script>alert(1)</script>", "radio_ready": True,
         "stream_url": "https://audio.test/a1.mp3"},
        {"track_id": "A-2", "release_id": "A", "track_number": 2,
         "title": "Deux", "radio_ready": True, "stream_url": "https://audio.test/a2.mp3"},
        {"track_id": "B-1", "release_id": "B", "track_number": 1,
         "title": "Three", "radio_ready": True, "stream_url": "https://audio.test/b1.mp3"},
        {"track_id": "B-2", "release_id": "B", "track_number": 2,
         "title": "Never", "radio_ready": True, "stream_url": "https://audio.test/b2.mp3"},
    ],
}


class ReportTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.db = self.root / "history.sqlite3"
        self.connection = recorder.connect_database(self.db)
        self.addCleanup(self.connection.close)
        recorder.sync_catalog(self.connection, MANIFEST, "2026-01-01T00:00:00Z")

    def add(self, uid, track_id, minute):
        timestamp = f"2026-01-01T00:{minute:02d}:00Z"
        recorder.insert_event(self.connection, {
            "event_uid": uid, "track_id": track_id,
            "started_at": timestamp, "observed_at": timestamp,
        })

    def populated_stats(self):
        for index, track_id in enumerate(("A-1", "A-1", "A-2", "B-1", "A-1")):
            self.add(f"e{index}", track_id, index)
        return report.collect_statistics(self.connection, "2026-01-02T00:00:00Z")

    def test_track_statistics_never_played_and_drought(self):
        stats = self.populated_stats()
        self.assertEqual(stats["summary"]["total_plays"], 5)
        self.assertEqual(stats["summary"]["unique_tracks_played"], 3)
        self.assertEqual([row["track_id"] for row in stats["never_played"]], ["B-2"])
        a1 = next(row for row in stats["tracks"] if row["track_id"] == "A-1")
        self.assertEqual(a1["plays"], 3)
        self.assertEqual(a1["current_drought_seconds"], 86160)

    def test_normalized_album_statistics(self):
        stats = self.populated_stats()
        albums = {row["release_id"]: row for row in stats["album_ranking"]}
        self.assertEqual(albums["A"]["plays"], 4)
        self.assertEqual(albums["A"]["plays_per_track"], 2)
        self.assertEqual(albums["A"]["expected_plays"], 2.5)
        self.assertEqual(albums["A"]["observed_expected_ratio"], 1.6)

    def test_near_album_repetition_windows(self):
        stats = self.populated_stats()
        self.assertEqual(stats["near_album_repetitions"]["3"]["count"], 3)
        self.assertEqual(stats["near_album_repetitions"]["5"]["count"], 3)
        self.assertEqual(stats["near_album_repetitions"]["10"]["count"], 3)

    def test_empty_database(self):
        empty_db = self.root / "empty.sqlite3"
        empty_connection = recorder.connect_database(empty_db)
        self.addCleanup(empty_connection.close)
        stats = report.collect_statistics(empty_connection, "2026-01-02T00:00:00Z")
        self.assertEqual(stats["summary"]["total_plays"], 0)
        self.assertEqual(stats["summary"]["catalog_tracks"], 0)
        self.assertEqual(stats["never_played"], [])

    def test_catalog_without_plays(self):
        stats = report.collect_statistics(self.connection, "2026-01-02T00:00:00Z")
        self.assertEqual(stats["summary"]["total_plays"], 0)
        self.assertIsNone(stats["period"]["start"])
        self.assertIsNone(stats["last_play"])
        self.assertEqual(len(stats["never_played"]), 4)
        self.assertEqual(len(stats["album_ranking"]), 2)

    def test_unicode_and_html_escaping(self):
        self.add("one", "A-1", 0)
        stats = report.collect_statistics(self.connection, "2026-01-02T00:00:00Z")
        rendered = report.render_html(
            stats,
            (ROOT / "web/stats/index.template.html").read_text(encoding="utf-8"),
            (ROOT / "web/stats/stats.css").read_text(encoding="utf-8"),
        )
        self.assertIn("Café", rendered)
        self.assertIn("&lt;script&gt;alert(1)&lt;/script&gt;", rendered)
        self.assertNotIn("<script>alert(1)</script>", rendered)
        self.assertIn("Álbum &lt;A&gt;", rendered)

    def test_generation_publishes_json_and_html_atomically(self):
        self.add("one", "A-1", 0)
        html_output = self.root / "public" / "index.html"
        json_output = self.root / "public" / "stats.json"
        with mock.patch.object(report.os, "replace", wraps=report.os.replace) as replace:
            stats = report.generate(
                self.db, ROOT / "web/stats/index.template.html",
                ROOT / "web/stats/stats.css", html_output, json_output,
                "2026-01-02T00:00:00Z",
            )
        self.assertEqual(stats["summary"]["total_plays"], 1)
        self.assertEqual(json.loads(json_output.read_text())["summary"]["total_plays"], 1)
        self.assertIn("<!doctype html>", html_output.read_text())
        destinations = [Path(call.args[1]) for call in replace.call_args_list]
        self.assertEqual(destinations, [json_output, html_output])
        self.assertTrue(all(source.parent == destination.parent
                            for source, destination in (map(Path, call.args) for call in replace.call_args_list)))


if __name__ == "__main__":
    unittest.main()
