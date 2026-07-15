import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]


def load_module(name, relative):
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


generate_m3u = load_module("generate_m3u_release_metadata", "bin/generate-m3u.py")
update_now_playing = load_module("update_now_playing_release_metadata", "bin/update-now-playing.py")
deploy_catalog = load_module("deploy_catalog_release_metadata", "bin/deploy-catalog.py")


class ReleaseMetadataTest(unittest.TestCase):
    def test_normalizes_crlf_unicode_markdown_and_safe_html(self):
        text = "# Heading\r\n\r\n<p>First <strong>verse</strong><br>second verse</p><script>ignore()</script><style>ignore-too</style>\r\n\r\n- [link](https://example.test/a)"
        normalized = generate_m3u.normalize_release_text(text)
        self.assertEqual(normalized, "Heading\n\nFirst verse\nsecond verse\n\nlink https://example.test/a")
        self.assertNotIn("ignore", normalized)
        self.assertEqual(generate_m3u.fragment_release_text(None), [])

    def test_fragments_preserve_short_text_stanzas_urls_and_long_sentences(self):
        short = generate_m3u.fragment_release_text("Small but real text.")
        self.assertEqual(short, [{"kind": "paragraph", "text": "Small but real text.", "index": 0}])
        poem = generate_m3u.fragment_release_text("line one\nline two\nline three")
        self.assertEqual(poem[0]["kind"], "stanza")
        self.assertIn("line two", poem[0]["text"])
        split_poem = generate_m3u.fragment_release_text(
            "\n".join(f"verse {index}: {'x' * 35}" for index in range(12)), maximum=140
        )
        self.assertGreater(len(split_poem), 1)
        self.assertTrue(all(len(item["text"]) <= 140 for item in split_poem))
        long = " ".join([
            "This is a complete sentence designed to remain coherent while it is grouped with its neighbours.",
            "Visit https://example.test/very/long/path?still=whole for more context before the next sentence arrives.",
            "The final sentence closes the paragraph without inventing any additional material.",
        ])
        fragments = generate_m3u.fragment_release_text(long, maximum=150)
        self.assertGreaterEqual(len(fragments), 2)
        self.assertTrue(any("https://example.test/very/long/path?still=whole" in item["text"] for item in fragments))
        self.assertEqual([item["index"] for item in fragments], list(range(len(fragments))))

    def test_producer_parser_accepts_aliases_combinations_and_ambiguous_lines(self):
        cases = {
            "Produced by M.": (["M"], "M", "Produced by M"),
            "Produced by Diego Madero": (["D"], "D", "Produced by Diego Madero"),
            "Produced by Mik Schuppin & Kai Kraatz": (["M", "K"], "MK", "Produced by Mik Schuppin & Kai Kraatz"),
            "Produced by D/K": (["D", "K"], "DK", "Produced by D/K"),
            "Produced by Diego, Kai;": (["D", "K"], "DK", "Produced by Diego, Kai"),
            "Produced by Mik + Diego and Kai.": (["M", "D", "K"], "MDK", "Produced by Mik + Diego and Kai"),
            "Produced by MDK": (["M", "D", "K"], "MDK", "Produced by MDK"),
            "Produced and cover art by D.": (["D"], "D", "Produced and cover art by D"),
            "Mixing by D.\nMastering by K.": ([], None, None),
            "Produced with D.": ([], None, None),
        }
        for credits, expected in cases.items():
            with self.subTest(credits=credits):
                self.assertEqual(generate_m3u.parse_producer(credits), expected)

    def test_real_catalog_coverage_and_mdk092_mdk100(self):
        manifest = json.loads((ROOT / "catalog/radio-manifest.json").read_text(encoding="utf-8"))
        sidecar = generate_m3u.build_release_metadata_map(manifest)
        self.assertEqual(len(sidecar), 150)
        self.assertEqual(sum(bool(item["release_text"]) for item in sidecar.values()), 150)
        self.assertEqual(sidecar["MDK092"]["producer_codes"], [])
        self.assertEqual(sidecar["MDK100"]["producer_codes"], ["D"])
        profiles = {item["producer_profile"] for item in sidecar.values()}
        self.assertTrue({"M", "D", "K", None}.issubset(profiles))

    def test_sidecar_is_reproducible_and_not_duplicated_in_track_map(self):
        manifest = {
            "schema_version": "1.0",
            "releases": [{
                "release_id": "MDK009", "release_number": 9, "title": "Release", "artist": "MDK",
                "release_date": "2026-01-02", "cover_url": "https://example.test/cover.jpg",
                "bandcamp_url": "https://example.test/album", "archive_item_url": "https://example.test/archive",
                "description": "First paragraph.\n\nSecond paragraph.", "credits": "Produced by D.",
            }],
            "tracks": [{
                "track_id": "MDK009-D01-T01", "release_id": "MDK009", "track_number": 1,
                "title": "Track", "radio_ready": True, "stream_url": "https://example.test/track.mp3",
            }],
        }
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            manifest_path = root / "manifest.json"
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
            outputs = []
            for name in ("one", "two"):
                playlist, track_map, sidecar = root / f"{name}.m3u", root / f"{name}-map.json", root / f"{name}-release.json"
                generate_m3u.generate(manifest_path, playlist, track_map, seed=7, release_metadata_map_output=sidecar)
                outputs.append((track_map.read_bytes(), sidecar.read_bytes()))
                self.assertNotIn("release_text", next(iter(json.loads(track_map.read_text()).values())))
            self.assertEqual(outputs[0][1], outputs[1][1])

    def test_fragment_index_is_stable_by_20_second_bucket(self):
        first = generate_m3u.deterministic_fragment_index("MDK009", "MDK009-D01-T01", 21, 5)
        self.assertEqual(first, generate_m3u.deterministic_fragment_index("MDK009", "MDK009-D01-T01", 39.9, 5))
        self.assertIsNone(generate_m3u.deterministic_fragment_index("MDK009", "track", 0, 0))

    def test_now_playing_enriches_current_release_and_falls_back_when_sidecar_missing(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            track_map = root / "track-map.json"
            sidecar = root / "release-map.json"
            output = root / "now-playing.json"
            track_map.write_text(json.dumps({"Track | MDK009: Release": {
                "release_id": "MDK009", "track_id": "MDK009-D01-T01", "track_title": "Track",
                "release_title": "Release", "source_url": "https://example.test/track.mp3",
            }}), encoding="utf-8")
            sidecar.write_text(json.dumps({"MDK009": {
                "release_text": "Text", "release_text_source": "catalog.description", "release_text_source_url": None,
                "release_text_fragments": [{"index": 0, "kind": "paragraph", "text": "Text"}],
                "producer_codes": ["D"], "producer_profile": "D", "producer_label": "Produced by D",
            }}), encoding="utf-8")
            globals_patch = {
                "MAP_PATH": track_map, "RELEASE_METADATA_MAP_PATH": sidecar, "OUT_PATH": output,
                "STATE_PATH": root / "state.json", "TRANSMISSION_LOG_PATH": root / "log.json",
                "DURATION_CACHE_PATH": root / "duration.json", "COVERS_DIR": root / "covers",
                "fetch_json": lambda *_: {"icestats": {"source": {"title": "MDK - Track | MDK009: Release"}}},
                "download_if_missing": lambda *_: False, "get_duration": lambda *_: None,
            }
            with mock.patch.dict(update_now_playing.main.__globals__, globals_patch):
                update_now_playing.main()
                now = json.loads(output.read_text(encoding="utf-8"))
                self.assertEqual(now["producer_profile"], "D")
                self.assertEqual(now["release_text_fragments"][0]["text"], "Text")

                sidecar.unlink()
                with self.assertLogs(update_now_playing.LOGGER, "WARNING"):
                    update_now_playing.main()
                fallback = json.loads(output.read_text(encoding="utf-8"))
                self.assertEqual(fallback["release_text"], "")
                self.assertEqual(fallback["producer_codes"], [])

    def test_deploy_sidecar_is_included_in_backup_and_rollback(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            paths = {
                "catalog": root / "catalog.json", "manifest": root / "manifest.json", "playlist": root / "playlist.m3u",
                "track_map": root / "track-map.json", "release_map": root / "release-map.json",
            }
            for path in paths.values(): path.write_text(f"old:{path.name}", encoding="utf-8")
            backups = root / "backups"
            backup_files = ((paths["catalog"], "catalog.json"), (paths["manifest"], "manifest.json"),
                            (paths["playlist"], "playlist.m3u"), (paths["track_map"], "track-map.json"),
                            (paths["release_map"], "release-map.json"))
            staged = {name: root / f"new-{name}" for name in paths}
            for path in staged.values(): path.write_text(f"new:{path.name}", encoding="utf-8")
            with mock.patch.multiple(deploy_catalog, CATALOG=paths["catalog"], MANIFEST=paths["manifest"], PLAYLIST=paths["playlist"],
                                     MAP=paths["track_map"], RELEASE_METADATA_MAP=paths["release_map"], BACKUPS=backups,
                                     BACKUP_FILES=backup_files):
                backup = deploy_catalog.snapshot()
                deploy_catalog.install(staged["manifest"], staged["playlist"], staged["track_map"], staged["release_map"])
                self.assertEqual(paths["release_map"].read_text(), "new:new-release_map")
                deploy_catalog.restore(backup)
            self.assertEqual(paths["release_map"].read_text(), "old:release-map.json")

    def test_deploy_rollback_restores_initial_absence_of_sidecar(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            paths = {
                "catalog": root / "catalog.json", "manifest": root / "manifest.json", "playlist": root / "playlist.m3u",
                "track_map": root / "track-map.json", "release_map": root / "release-map.json",
            }
            for name, path in paths.items():
                if name != "release_map":
                    path.write_text(f"old:{path.name}", encoding="utf-8")
            backups = root / "backups"
            backup_files = ((paths["catalog"], "catalog.json"), (paths["manifest"], "manifest.json"),
                            (paths["playlist"], "playlist.m3u"), (paths["track_map"], "track-map.json"),
                            (paths["release_map"], "release-map.json"))
            with mock.patch.multiple(deploy_catalog, CATALOG=paths["catalog"], MANIFEST=paths["manifest"], PLAYLIST=paths["playlist"],
                                     MAP=paths["track_map"], RELEASE_METADATA_MAP=paths["release_map"], BACKUPS=backups,
                                     BACKUP_FILES=backup_files):
                backup = deploy_catalog.snapshot()
                self.assertTrue((backup / "release-map.json.absent").is_file())
                paths["release_map"].write_text("new-sidecar", encoding="utf-8")
                deploy_catalog.restore(backup)
            self.assertFalse(paths["release_map"].exists())


if __name__ == "__main__":
    unittest.main()
