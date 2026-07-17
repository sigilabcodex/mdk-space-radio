import datetime as dt
import importlib.util
import json
import stat
import sqlite3
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests/fixtures"


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


sampler = load_module("sample_listener_analytics", ROOT / "bin/sample-listener-analytics.py")
generator = load_module("generate_listener_analytics", ROOT / "bin/generate-listener-analytics.py")


def fixture(name):
    return json.loads((FIXTURES / name).read_text())


class ListenerSamplerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.database = Path(self.temp.name) / "analytics.sqlite3"
        self.connection = sampler.connect_database(self.database)
        self.addCleanup(self.connection.close)

    def test_schema_contains_only_aggregate_fields_and_index(self):
        columns = {row[1] for row in self.connection.execute("PRAGMA table_info(listener_snapshots)")}
        self.assertEqual(columns, {
            "id", "sampled_at", "mount", "listeners", "listener_peak_source",
            "bitrate_kbps", "source_format", "server_up", "source_up", "error_code",
        })
        forbidden = {"ip", "user_agent", "cookie", "referrer", "hostname", "session_id"}
        self.assertFalse(columns & forbidden)
        indexes = {row[1] for row in self.connection.execute("PRAGMA index_list(listener_snapshots)")}
        self.assertIn("listener_snapshots_sampled_at_idx", indexes)

    def test_active_mount_with_listeners(self):
        row = sampler.snapshot_from_status(
            fixture("icecast-active.json"), "2026-07-17T01:00:00Z", "/strange-waves.mp3")
        self.assertEqual(row["listeners"], 7)
        self.assertEqual(row["listener_peak_source"], 27)
        self.assertEqual(row["bitrate_kbps"], 160)
        self.assertEqual(row["source_format"], "mp3")
        self.assertEqual((row["server_up"], row["source_up"], row["error_code"]), (1, 1, None))

    def test_zero_listeners_is_real_zero(self):
        row = sampler.snapshot_from_status(
            fixture("icecast-zero-listeners.json"), "2026-07-17T01:00:00Z", "/strange-waves.mp3")
        self.assertEqual(row["listeners"], 0)
        self.assertEqual(row["source_up"], 1)

    def test_multiple_mounts_selects_only_mdk_mount(self):
        row = sampler.snapshot_from_status(
            fixture("icecast-multiple-mounts.json"), "2026-07-17T01:00:00Z", "/strange-waves.mp3")
        self.assertEqual(row["listeners"], 3)

    def test_icecast_without_source_records_unknown_listener_value(self):
        row = sampler.snapshot_from_status(
            fixture("icecast-no-source.json"), "2026-07-17T01:00:00Z", "/strange-waves.mp3")
        self.assertIsNone(row["listeners"])
        self.assertEqual((row["server_up"], row["source_up"], row["error_code"]),
                         (1, 0, "missing_mount"))

    def test_invalid_json_is_recorded_without_false_zero(self):
        def invalid_json(_url, _timeout):
            json.loads((FIXTURES / "icecast-invalid.json").read_text())

        row = sampler.sample_once(self.connection, invalid_json, "2026-07-17T01:00:00Z")
        self.assertIsNone(row["listeners"])
        self.assertEqual(row["error_code"], "invalid_json")
        self.assertEqual(self.connection.execute(
            "SELECT COUNT(*) FROM listener_snapshots").fetchone()[0], 1)

    def test_timeout_is_recorded_without_false_zero(self):
        def timeout(_url, _seconds):
            raise TimeoutError()

        row = sampler.sample_once(self.connection, timeout, "2026-07-17T01:00:00Z")
        self.assertIsNone(row["listeners"])
        self.assertEqual((row["server_up"], row["source_up"], row["error_code"]),
                         (0, None, "timeout"))

    def test_duplicate_execution_upserts_one_row(self):
        def active(_url, _timeout):
            return fixture("icecast-active.json")

        for _ in range(2):
            sampler.sample_once(self.connection, active, "2026-07-17T01:00:00Z")
        self.assertEqual(self.connection.execute(
            "SELECT COUNT(*) FROM listener_snapshots").fetchone()[0], 1)

    def test_manual_retention_purge(self):
        for timestamp in ("2026-01-01T00:00:00Z", "2026-07-17T00:00:00Z"):
            row = sampler.snapshot_from_status(fixture("icecast-active.json"), timestamp,
                                               "/strange-waves.mp3")
            sampler.insert_snapshot(self.connection, row)
        self.assertEqual(sampler.purge_older_than(self.connection, "2026-04-18T00:00:00Z"), 1)

    def test_cli_records_timeout_as_successful_health_snapshot(self):
        original = sampler.fetch_status
        sampler.fetch_status = lambda _url, _timeout: (_ for _ in ()).throw(TimeoutError())
        try:
            code = sampler.main([
                "--database", str(self.database),
                "--sampled-at", "2026-07-17T01:00:00Z",
            ])
        finally:
            sampler.fetch_status = original
        self.assertEqual(code, 0)
        row = self.connection.execute(
            "SELECT listeners, error_code FROM listener_snapshots").fetchone()
        self.assertEqual((row[0], row[1]), (None, "timeout"))


class ListenerAggregateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.database = Path(self.temp.name) / "analytics.sqlite3"
        self.connection = sampler.connect_database(self.database)
        self.addCleanup(self.connection.close)

    def insert(self, timestamp, listeners=None, error=None):
        if error:
            row = sampler.error_snapshot(timestamp, "/strange-waves.mp3", error, server_up=0)
        else:
            row = sampler.snapshot_from_status(fixture("icecast-active.json"), timestamp,
                                               "/strange-waves.mp3")
            row["listeners"] = listeners
        sampler.insert_snapshot(self.connection, row)

    def test_listener_hours_and_average_use_elapsed_time(self):
        self.insert("2026-07-17T00:00:00Z", 2)
        self.insert("2026-07-17T00:01:00Z", 4)
        self.insert("2026-07-17T00:02:00Z", 0)
        data = generator.collect_aggregates(
            self.connection, generated_at="2026-07-17T00:02:00Z")
        self.assertEqual(data["peak_24h"], 4)
        self.assertAlmostEqual(data["estimated_listener_hours_24h"], 0.1)
        self.assertAlmostEqual(data["average_24h"], 3.0)
        self.assertEqual(data["sample_count"], 3)
        self.assertEqual(data["missing_sample_count"], 0)

    def test_gap_is_not_filled_or_integrated(self):
        self.insert("2026-07-17T00:00:00Z", 2)
        self.insert("2026-07-17T00:05:00Z", 10)
        self.insert("2026-07-17T00:06:00Z", 10)
        data = generator.collect_aggregates(
            self.connection, generated_at="2026-07-17T00:06:00Z")
        self.assertAlmostEqual(data["estimated_listener_hours_24h"], 10 / 60, places=3)
        self.assertEqual(data["average_24h"], 10)
        self.assertEqual(data["missing_sample_count"], 4)

    def test_error_snapshot_breaks_integration_and_current_value(self):
        self.insert("2026-07-17T00:00:00Z", 4)
        self.insert("2026-07-17T00:01:00Z", error="timeout")
        data = generator.collect_aggregates(
            self.connection, generated_at="2026-07-17T00:01:00Z")
        self.assertIsNone(data["listeners_now"])
        self.assertIsNone(data["estimated_listener_hours_24h"])
        self.assertEqual(data["source_health"]["error_code"], "timeout")

    def test_series_has_fixed_reasonable_intervals(self):
        self.insert("2026-07-17T00:00:00Z", 5)
        data = generator.collect_aggregates(
            self.connection, generated_at="2026-07-17T00:01:00Z")
        self.assertEqual(len(data["series_24h"]), 288)
        self.assertEqual(len(data["series_7d"]), 168)
        populated = [point for point in data["series_24h"] if point["listeners"] is not None]
        self.assertEqual(len(populated), 1)

    def test_atomic_json_output(self):
        self.insert("2026-07-17T00:00:00Z", 5)
        data = generator.collect_aggregates(
            self.connection, generated_at="2026-07-17T00:01:00Z")
        output = Path(self.temp.name) / "nested/listener-analytics.json"
        generator.atomic_write_json(output, data)
        self.assertEqual(json.loads(output.read_text())["peak_24h"], 5)
        self.assertEqual(stat.S_IMODE(output.stat().st_mode), 0o644)


class ListenerAnalyticsUnitTests(unittest.TestCase):
    def test_systemd_schedule_lock_and_retention_policy(self):
        service = (ROOT / "systemd/mdk-listener-analytics.service").read_text()
        timer = (ROOT / "systemd/mdk-listener-analytics.timer").read_text()
        self.assertIn("/usr/bin/flock --nonblock", service)
        self.assertIn("status-json.xsl", service)
        self.assertIn("--mount /strange-waves.mp3", service)
        self.assertIn("OnCalendar=*-*-* *:*:00", timer)
        self.assertNotIn("purge", service + timer)


if __name__ == "__main__":
    unittest.main()
