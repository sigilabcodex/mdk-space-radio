import contextlib
import fcntl
import importlib.util
import io
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "bin" / "archive-failover.py"
FIXTURES = ROOT / "tests" / "fixtures" / "archive-failover"
SPEC = importlib.util.spec_from_file_location("archive_failover", SCRIPT)
archive_failover = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(archive_failover)


def fixture(name):
    return (FIXTURES / name).read_text(encoding="utf-8")


def curl_result(report, returncode=0):
    return subprocess.CompletedProcess(
        args=["/usr/bin/curl"], returncode=returncode, stdout=report, stderr=""
    )


class ArchiveFailoverTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.cache = self.root / "cache"
        self.logs = self.root / "logs"
        self.cache.mkdir()
        self.logs.mkdir()

        self.remote = self.cache / "playlist.m3u"
        self.local = self.cache / "emergency-local.m3u"
        self.active = self.cache / "active-playlist.m3u"
        self.state = self.cache / "archive-failover-state.json"
        self.lock = self.cache / "archive-failover.lock"
        self.log = self.logs / "archive-failover.log"

        self.remote.write_text("remote-track\n", encoding="utf-8")
        self.local.write_text("local-track\n", encoding="utf-8")
        self.active.write_text("previous-track\n", encoding="utf-8")

        replacements = {
            "ROOT": self.root,
            "REMOTE_PLAYLIST": self.remote,
            "LOCAL_PLAYLIST": self.local,
            "ACTIVE_PLAYLIST": self.active,
            "STATE_FILE": self.state,
            "LOG_FILE": self.log,
            "LOCK_FILE": self.lock,
        }
        patchers = [
            mock.patch.object(archive_failover, name, value)
            for name, value in replacements.items()
        ]
        for patcher in patchers:
            patcher.start()
            self.addCleanup(patcher.stop)

    def write_state(self, mode, successes=0, failures=0):
        self.state.write_text(
            json.dumps({
                "mode": mode,
                "consecutive_successes": successes,
                "consecutive_failures": failures,
                "last_check": None,
                "last_http_code": None,
                "last_switch": None,
            }),
            encoding="utf-8",
        )

    def read_state(self):
        return json.loads(self.state.read_text(encoding="utf-8"))

    def run_cycle(self, success, report=None):
        report = report or ("206|audio/mpeg|65536" if success else "503|text/html|100")
        with mock.patch.object(
            archive_failover, "probe_archive", return_value=(success, report)
        ), contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(archive_failover.main(), 0)
        return self.read_state()

    def test_missing_state_defaults_to_local(self):
        self.assertFalse(self.state.exists())
        self.assertEqual(archive_failover.load_state(), {
            "mode": "local",
            "consecutive_successes": 0,
            "consecutive_failures": 0,
            "last_check": None,
            "last_http_code": None,
            "last_switch": None,
        })

    def test_one_failed_cycle_does_not_switch_remote_to_local(self):
        self.write_state("remote")
        state = self.run_cycle(False)
        self.assertEqual(state["mode"], "remote")
        self.assertEqual(state["consecutive_failures"], 1)
        self.assertEqual(self.active.read_text(encoding="utf-8"), "previous-track\n")

    def test_two_failed_cycles_switch_remote_to_local(self):
        self.write_state("remote")
        self.run_cycle(False)
        state = self.run_cycle(False)
        self.assertEqual(state["mode"], "local")
        self.assertEqual(state["consecutive_failures"], 2)
        self.assertEqual(self.active.read_bytes(), self.local.read_bytes())

    def test_one_or_two_successful_cycles_do_not_switch_local_to_remote(self):
        self.write_state("local")
        first = self.run_cycle(True)
        second = self.run_cycle(True)
        self.assertEqual(first["mode"], "local")
        self.assertEqual(second["mode"], "local")
        self.assertEqual(second["consecutive_successes"], 2)
        self.assertEqual(self.active.read_text(encoding="utf-8"), "previous-track\n")

    def test_three_successful_cycles_switch_local_to_remote(self):
        self.write_state("local")
        self.run_cycle(True)
        self.run_cycle(True)
        state = self.run_cycle(True)
        self.assertEqual(state["mode"], "remote")
        self.assertEqual(state["consecutive_successes"], 3)
        self.assertEqual(self.active.read_bytes(), self.remote.read_bytes())

    def test_success_resets_consecutive_failures(self):
        self.write_state("remote", failures=1)
        state = self.run_cycle(True)
        self.assertEqual(state["consecutive_failures"], 0)
        self.assertEqual(state["consecutive_successes"], 1)

    def test_failure_resets_consecutive_successes(self):
        self.write_state("local", successes=2)
        state = self.run_cycle(False)
        self.assertEqual(state["consecutive_successes"], 0)
        self.assertEqual(state["consecutive_failures"], 1)

    def test_playlist_replacement_is_atomic_from_callers_perspective(self):
        before = self.active.read_bytes()
        replacement_observations = []
        real_replace = archive_failover.os.replace

        def observe_replace(source, destination):
            if Path(destination) == self.active:
                replacement_observations.append(self.active.read_bytes())
                result = real_replace(source, destination)
                replacement_observations.append(self.active.read_bytes())
                return result
            return real_replace(source, destination)

        with mock.patch.object(archive_failover.os, "replace", side_effect=observe_replace):
            with contextlib.redirect_stdout(io.StringIO()):
                archive_failover.activate(self.local, "local")

        self.assertEqual(replacement_observations, [before, self.local.read_bytes()])
        self.assertEqual(self.active.read_bytes(), self.local.read_bytes())
        self.assertEqual(list(self.cache.glob(".active-playlist.*.m3u")), [])

    def test_missing_or_empty_candidate_playlist_is_rejected(self):
        missing = self.cache / "missing.m3u"
        empty = self.cache / "empty.m3u"
        empty.write_text("#EXTM3U\n# comment only\n", encoding="utf-8")
        for candidate in (missing, empty):
            with self.subTest(candidate=candidate.name):
                with self.assertRaisesRegex(RuntimeError, "Playlist inválida o vacía"):
                    archive_failover.activate(candidate, "local")

    def test_probe_accepts_current_status_type_and_byte_combinations(self):
        reports = [
            fixture("audio-success.txt").strip(),
            "206|audio/mpeg|1",
            "200|application/octet-stream|12",
            "206|audio/ogg|9",
        ]
        for report in reports:
            with self.subTest(report=report):
                with mock.patch.object(
                    archive_failover.subprocess, "run", return_value=curl_result(report)
                ):
                    self.assertEqual(archive_failover.probe_archive(), (True, report))

    def test_probe_rejects_zero_bytes_html_status_and_curl_errors(self):
        html_size = len(fixture("html-200.html").encode("utf-8"))
        reports = [
            fixture("audio-zero-bytes.txt").strip(),
            f"200|text/html|{html_size}",
            f"503|text/html|{len(fixture('html-503.html').encode('utf-8'))}",
            "404|audio/mpeg|100",
        ]
        for report in reports:
            with self.subTest(report=report):
                with mock.patch.object(
                    archive_failover.subprocess, "run", return_value=curl_result(report)
                ):
                    self.assertEqual(archive_failover.probe_archive(), (False, report))
        with mock.patch.object(
            archive_failover.subprocess,
            "run",
            return_value=curl_result("206|audio/mpeg|100", returncode=28),
        ):
            self.assertEqual(
                archive_failover.probe_archive(), (False, "206|audio/mpeg|100")
            )

    def test_mislabeled_html_body_is_not_inspected_by_current_probe(self):
        self.assertIn("<html", fixture("html-200.html").lower())
        report = f"200|audio/mpeg|{len(fixture('html-200.html').encode('utf-8'))}"
        with mock.patch.object(
            archive_failover.subprocess, "run", return_value=curl_result(report)
        ):
            self.assertEqual(archive_failover.probe_archive(), (True, report))

    def test_probe_invokes_one_configured_mp3_url(self):
        with mock.patch.object(
            archive_failover.subprocess,
            "run",
            return_value=curl_result(fixture("audio-success.txt").strip()),
        ) as run:
            archive_failover.probe_archive()
        self.assertEqual(run.call_count, 1)
        command = run.call_args.args[0]
        self.assertEqual(command[-1], archive_failover.PROBE_URL)
        self.assertEqual(command.count(archive_failover.PROBE_URL), 1)
        self.assertTrue(archive_failover.PROBE_URL.endswith(".mp3"))

    def test_current_playlist_targets_are_plain_local_and_canonical_remote(self):
        deployed_root = Path("/opt/swr-radio")
        self.assertEqual(
            Path("/opt/swr-radio/cache/emergency-local.m3u"),
            deployed_root / "cache" / "emergency-local.m3u",
        )
        self.assertEqual(
            Path("/opt/swr-radio/cache/playlist.m3u"),
            deployed_root / "cache" / "playlist.m3u",
        )

        spec = importlib.util.spec_from_file_location("archive_failover_targets", SCRIPT)
        unpatched = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(unpatched)
        self.assertEqual(unpatched.LOCAL_PLAYLIST, deployed_root / "cache/emergency-local.m3u")
        self.assertEqual(unpatched.REMOTE_PLAYLIST, deployed_root / "cache/playlist.m3u")

    def test_malformed_json_state_falls_back_to_defaults(self):
        self.state.write_text(fixture("malformed-state.json"), encoding="utf-8")
        self.assertEqual(archive_failover.load_state()["mode"], "local")
        self.assertEqual(archive_failover.load_state()["consecutive_successes"], 0)
        self.assertEqual(archive_failover.load_state()["consecutive_failures"], 0)

    def test_structurally_invalid_json_state_is_a_known_unhandled_weakness(self):
        self.state.write_text("[1]\n", encoding="utf-8")
        with self.assertRaises(TypeError):
            archive_failover.load_state()

    def test_lock_prevents_overlapping_run(self):
        self.write_state("remote")
        with self.lock.open("w", encoding="utf-8") as held_lock:
            fcntl.flock(held_lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            with mock.patch.object(archive_failover, "probe_archive") as probe:
                self.assertEqual(archive_failover.main(), 0)
            probe.assert_not_called()


if __name__ == "__main__":
    unittest.main()
