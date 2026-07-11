import importlib.util
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("record_play_history", ROOT / "bin/record-play-history.py")
recorder = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(recorder)


def manifest(extra_tracks=None):
    tracks = [
        {"track_id": "A-1", "release_id": "A", "track_number": 1,
         "title": "Álpha", "radio_ready": True, "stream_url": "https://audio.test/a1.mp3"},
        {"track_id": "A-2", "release_id": "A", "track_number": 2,
         "title": "Beta", "radio_ready": True, "stream_url": "https://audio.test/a2.mp3"},
        {"track_id": "B-1", "release_id": "B", "track_number": 1,
         "title": "Gamma", "radio_ready": True, "stream_url": "https://audio.test/b1.mp3"},
    ]
    tracks.extend(extra_tracks or [])
    return {
        "schema_version": "1.0",
        "releases": [
            {"release_id": "A", "title": "Álbum A", "artist": "MDK"},
            {"release_id": "B", "title": "Album B", "artist": "MDK"},
        ],
        "tracks": tracks,
    }


def event(uid="event-1", track_id="A-1", started="2026-01-01T00:00:00Z"):
    return {"event_uid": uid, "track_id": track_id, "started_at": started,
            "observed_at": started}


class RecorderTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.db = self.root / "history.sqlite3"
        self.connection = recorder.connect_database(self.db)
        self.addCleanup(self.connection.close)

    def sync(self, value=None):
        return recorder.sync_catalog(self.connection, value or manifest(), "2026-01-01T00:00:00Z")

    def test_schema_creation_and_pragmas(self):
        tables = {row[0] for row in self.connection.execute(
            "SELECT name FROM sqlite_master WHERE type='table'")}
        self.assertTrue({"catalog_releases", "catalog_tracks", "play_events"} <= tables)
        self.assertEqual(self.connection.execute("PRAGMA foreign_keys").fetchone()[0], 1)
        self.assertEqual(self.connection.execute("PRAGMA journal_mode").fetchone()[0], "wal")
        self.assertEqual(self.connection.execute("PRAGMA busy_timeout").fetchone()[0], 5000)

    def test_catalog_sync(self):
        self.assertEqual(self.sync(), (2, 3))
        self.assertEqual(self.connection.execute("SELECT COUNT(*) FROM catalog_tracks").fetchone()[0], 3)
        count = self.connection.execute(
            "SELECT track_count FROM catalog_releases WHERE release_id='A'").fetchone()[0]
        self.assertEqual(count, 2)

    def test_catalog_requires_track_id(self):
        value = manifest()
        del value["tracks"][0]["track_id"]
        with self.assertRaisesRegex(recorder.InputError, "track_id"):
            self.sync(value)

    def test_normal_insert_and_duplicate_event_uid(self):
        self.sync()
        self.assertTrue(recorder.insert_event(self.connection, event()))
        self.assertFalse(recorder.insert_event(self.connection, event()))
        self.assertEqual(self.connection.execute("SELECT COUNT(*) FROM play_events").fetchone()[0], 1)

    def test_consecutive_same_track_with_distinct_uids(self):
        self.sync()
        self.assertTrue(recorder.insert_event(self.connection, event("one")))
        self.assertTrue(recorder.insert_event(
            self.connection, event("two", started="2026-01-01T00:04:00Z")))
        self.assertEqual(self.connection.execute("SELECT COUNT(*) FROM play_events").fetchone()[0], 2)

    def test_unknown_track_is_rejected(self):
        self.sync()
        with self.assertRaises(recorder.UnknownTrackError):
            recorder.insert_event(self.connection, event(track_id="missing"))

    def test_spool_success(self):
        self.sync()
        spool = self.root / "spool"
        path = recorder.spool_event(spool, event())
        self.assertTrue(path.exists())
        result = recorder.consume_spool(self.connection, spool)
        self.assertEqual(result, {"processed": 1, "duplicates": 0, "failed": 0})
        self.assertFalse(path.exists())

    def test_invalid_spool_moves_to_failed(self):
        self.sync()
        spool = self.root / "spool"
        path = recorder.spool_event(spool, {"not": "an event"})
        result = recorder.consume_spool(self.connection, spool)
        self.assertEqual(result["failed"], 1)
        self.assertFalse(path.exists())
        self.assertEqual(len(list((spool / "failed").glob("*.json"))), 1)

    def test_retry_failed_after_catalog_recovery(self):
        self.sync()
        spool = self.root / "spool"
        recorder.spool_event(spool, event(track_id="C-1"))
        self.assertEqual(recorder.consume_spool(self.connection, spool)["failed"], 1)
        self.connection.execute("""
            INSERT INTO catalog_releases
            (release_id, release_title, track_count, catalog_seen_at)
            VALUES ('C', 'Recovered', 1, '2026-01-01T00:00:00Z')
        """)
        self.connection.execute("""
            INSERT INTO catalog_tracks
            (track_id, release_id, track_title, display, radio_ready, catalog_seen_at)
            VALUES ('C-1', 'C', 'Recovered', 'Recovered | C: Recovered', 1,
                    '2026-01-01T00:00:00Z')
        """)
        self.connection.commit()
        result = recorder.consume_spool(self.connection, spool, retry_failed=True)
        self.assertEqual(result, {"processed": 1, "duplicates": 0, "failed": 0})

    def test_spool_files_are_consumed_in_filename_order(self):
        self.sync()
        spool = self.root / "spool"
        spool.mkdir()
        (spool / "002.json").write_text(json.dumps(event("two", "A-2")), encoding="utf-8")
        (spool / "001.json").write_text(json.dumps(event("one", "A-1")), encoding="utf-8")
        recorder.consume_spool(self.connection, spool)
        uids = [row[0] for row in self.connection.execute("SELECT event_uid FROM play_events ORDER BY id")]
        self.assertEqual(uids, ["one", "two"])


if __name__ == "__main__":
    unittest.main()
