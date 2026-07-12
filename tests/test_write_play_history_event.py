import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
BOOT_ID = "12345678-1234-4abc-8def-1234567890ab"
SPEC = importlib.util.spec_from_file_location(
    "write_play_history_event", ROOT / "bin/write-play-history-event.py"
)
writer = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(writer)


class WritePlayHistoryEventTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.spool = Path(self.temp.name) / "nested" / "spool"

    def arguments(self, *extra):
        return [
            "--spool-dir", str(self.spool),
            "--event-uid", f"{BOOT_ID}:1",
            "--track-id", "MDK001-D01-T01",
            "--started-at", "2026-07-12T01:02:03Z",
            *extra,
        ]

    def test_arguments_write_complete_atomic_event(self):
        with mock.patch.object(writer.os, "replace", wraps=writer.os.replace) as replace:
            result = writer.main(self.arguments(
                "--observed-at", "2026-07-11T21:02:04-04:00",
                "--detection-source", "liquidsoap",
                "--release-id", "MDK001", "--source-url", "https://audio.test/a.mp3",
                "--title", "Érste",
            ), {})
        self.assertEqual(result, 0)
        files = list(self.spool.glob("*.json"))
        self.assertEqual(len(files), 1)
        event = json.loads(files[0].read_text(encoding="utf-8"))
        self.assertEqual(event["event_uid"], f"{BOOT_ID}:1")
        self.assertEqual(event["track_id"], "MDK001-D01-T01")
        self.assertEqual(event["started_at"], "2026-07-12T01:02:03Z")
        self.assertEqual(event["observed_at"], "2026-07-12T01:02:04Z")
        self.assertEqual(event["title"], "Érste")
        source, destination = map(Path, replace.call_args.args)
        self.assertEqual(source.parent, self.spool)
        self.assertEqual(destination.parent, self.spool)
        self.assertNotIn(BOOT_ID, destination.name)
        self.assertNotIn("MDK001", destination.name)
        self.assertFalse(source.exists())

    def test_environment_input_and_observed_default(self):
        result = writer.main(["--spool-dir", str(self.spool)], {
            "MDK_EVENT_UID": f"{BOOT_ID}:2",
            "MDK_TRACK_ID": "MDK001-D01-T02",
            "MDK_STARTED_AT": "2026-07-12T02:00:00+00:00",
            "MDK_DETECTION_SOURCE": "liquidsoap",
        })
        self.assertEqual(result, 0)
        event = json.loads(next(self.spool.glob("*.json")).read_text())
        self.assertEqual(event["observed_at"], "2026-07-12T02:00:00Z")

    def test_unix_epoch_is_normalized_to_utc(self):
        result = writer.main(["--spool-dir", str(self.spool)], {
            "MDK_EVENT_UID": f"{BOOT_ID}:3",
            "MDK_TRACK_ID": "MDK001-D01-T03",
            "MDK_STARTED_AT": "1783821723.25",
            "MDK_OBSERVED_AT": "1783821724.5",
        })
        self.assertEqual(result, 0)
        event = json.loads(next(self.spool.glob("*.json")).read_text())
        self.assertTrue(event["started_at"].endswith("Z"))
        self.assertTrue(event["observed_at"].endswith("Z"))
        self.assertNotIn("+00:00", event["started_at"])

    def test_empty_event_uid_fails_without_file(self):
        args = self.arguments()
        args[args.index(f"{BOOT_ID}:1")] = " "
        self.assertNotEqual(writer.main(args, {}), 0)
        self.assertFalse(self.spool.exists())

    def test_event_uid_requires_uuid_and_positive_counter(self):
        invalid_values = (
            "boot:1", f"{BOOT_ID}:0", f"{BOOT_ID}:-1", f"{BOOT_ID}:x",
            f"{{{BOOT_ID}}}:1", "x" * 129,
        )
        for invalid in invalid_values:
            with self.subTest(event_uid=invalid):
                args = self.arguments()
                args[args.index(f"{BOOT_ID}:1")] = invalid
                self.assertNotEqual(writer.main(args, {}), 0)
        self.assertFalse(self.spool.exists())

    def test_empty_track_id_fails_without_file(self):
        args = self.arguments()
        args[args.index("MDK001-D01-T01")] = ""
        self.assertNotEqual(writer.main(args, {}), 0)
        self.assertFalse(self.spool.exists())

    def test_invalid_timestamp_fails(self):
        args = self.arguments()
        args[args.index("2026-07-12T01:02:03Z")] = "not-a-time"
        self.assertNotEqual(writer.main(args, {}), 0)
        self.assertFalse(self.spool.exists())

    def test_temporary_file_is_cleaned_on_replace_error(self):
        args = writer.parse_args(self.arguments())
        event = writer.build_event(args, {})
        with mock.patch.object(writer.os, "replace", side_effect=OSError("failure")):
            with self.assertRaises(OSError):
                writer.write_event(self.spool, event)
        self.assertEqual(list(self.spool.iterdir()), [])

    def test_temporary_file_is_cleaned_on_serialization_error(self):
        args = writer.parse_args(self.arguments())
        event = writer.build_event(args, {})
        with mock.patch.object(writer.json, "dump", side_effect=TypeError("failure")):
            with self.assertRaises(TypeError):
                writer.write_event(self.spool, event)
        self.assertEqual(list(self.spool.iterdir()), [])

    def test_temporary_file_is_cleaned_on_fsync_error(self):
        args = writer.parse_args(self.arguments())
        event = writer.build_event(args, {})
        with mock.patch.object(writer.os, "fsync", side_effect=OSError("failure")):
            with self.assertRaises(OSError):
                writer.write_event(self.spool, event)
        self.assertEqual(list(self.spool.iterdir()), [])


if __name__ == "__main__":
    unittest.main()
