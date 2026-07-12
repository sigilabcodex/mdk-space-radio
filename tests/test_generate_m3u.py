import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "bin" / "generate-m3u.py"
SPEC = importlib.util.spec_from_file_location("generate_m3u", SCRIPT)
generate_m3u = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(generate_m3u)


def release(**changes):
    value = {
        "release_id": "rel-1", "release_number": 1, "title": "Release",
        "artist": "MDK", "release_date": "2026-01-02",
        "cover_url": "https://example.test/cover.jpg",
        "bandcamp_url": "https://mdk.test/album/release",
        "archive_item_url": "https://archive.test/details/rel-1",
    }
    value.update(changes)
    return value


def track(**changes):
    value = {
        "track_id": "track-1", "release_id": "rel-1", "track_number": 1,
        "title": "Track", "radio_ready": True,
        "stream_url": "https://audio.test/track.mp3",
        "flac_url": "https://audio.test/track.flac",
    }
    value.update(changes)
    return value


class GenerateM3UTest(unittest.TestCase):
    def run_manifest(self, manifest, seed=1):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        directory = Path(temp.name)
        manifest_path = directory / "input.json"
        output = directory / "nested" / "playlist.m3u"
        map_output = directory / "other" / "map.json"
        manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
        count = generate_m3u.generate(manifest_path, output, map_output, seed)
        return count, output.read_text(), json.loads(map_output.read_text()), directory

    def test_legacy_manifest_and_url_aliases(self):
        manifest = {"releases": [dict(release(
            publication_status="verified",
            archive_details_url="https://archive.test/legacy",
        ), tracks=[
            {"title": "IA MP3", "ia_mp3_url": "https://audio.test/ia.mp3"},
            {"title": "MP3", "mp3_url": "https://audio.test/plain.mp3"},
            {"title": "IA FLAC", "ia_flac_url": "https://audio.test/ia.flac"},
            {"title": "FLAC", "flac_url": "https://audio.test/plain.flac"},
        ]), dict(release(
            release_id="hidden", publication_status="draft",
        ), tracks=[{"title": "Hidden", "mp3_url": "https://audio.test/hidden.mp3"}])]}
        count, playlist, metadata, _ = self.run_manifest(manifest)
        self.assertEqual(count, 4)
        self.assertIn("annotate:", playlist)
        item = metadata["IA MP3 | rel-1: Release"]
        self.assertEqual(item["archive_details_url"], "https://archive.test/legacy")
        self.assertEqual(item["source_format"], "mp3")
        self.assertEqual(metadata["IA FLAC | rel-1: Release"]["source_format"], "flac")
        self.assertNotIn("Hidden | hidden: Release", metadata)
        self.assertNotIn("track_id=", playlist)

    def test_v1_metadata_stream_preference_and_track_id(self):
        count, playlist, metadata, _ = self.run_manifest({
            "schema_version": "1.0", "releases": [release()], "tracks": [track()]
        })
        self.assertEqual(count, 1)
        item = metadata["Track | rel-1: Release"]
        self.assertEqual(item["track_id"], "track-1")
        self.assertEqual(item["source_url"], "https://audio.test/track.mp3")
        self.assertEqual(item["archive_item_url"], release()["archive_item_url"])
        self.assertEqual(item["archive_details_url"], release()["archive_item_url"])
        self.assertEqual(item["release_date"], "2026-01-02")
        self.assertEqual(item["cover_url"], "https://example.test/cover.jpg")
        self.assertEqual(item["bandcamp_url"], "https://mdk.test/album/release")
        self.assertIn('track_id="track-1"', playlist)
        self.assertIn('release_id="rel-1"', playlist)
        self.assertIn('source_url="https://audio.test/track.mp3"', playlist)

    def test_v1_annotate_history_metadata_is_liquidsoap_escaped(self):
        _, playlist, _, _ = self.run_manifest({
            "schema_version": "1.0", "releases": [release(release_id='rel"\\one')],
            "tracks": [track(track_id='track"\\one', release_id='rel"\\one')],
        })
        self.assertIn('track_id="track\\"\\\\one"', playlist)
        self.assertIn('release_id="rel\\"\\\\one"', playlist)

    def test_v1_requires_track_id_even_when_not_radio_ready(self):
        with self.assertRaisesRegex(ValueError, "non-empty track_id"):
            generate_m3u.build_outputs({
                "schema_version": "1.0", "releases": [release()],
                "tracks": [track(track_id=None, radio_ready=False)],
            })

    def test_unique_display_is_unchanged(self):
        _, playlist, metadata, _ = self.run_manifest({
            "schema_version": "1.0", "releases": [release()], "tracks": [track()]
        })
        display = "Track | rel-1: Release"
        self.assertEqual(list(metadata), [display])
        self.assertIn(f"#EXTINF:-1,{display}\n", playlist)

    def test_v1_collision_uses_track_id_and_preserves_both_tracks(self):
        _, playlist, metadata, _ = self.run_manifest({
            "schema_version": "1.0", "releases": [release()], "tracks": [
                track(track_id="track-1", stream_url="https://audio.test/one.mp3"),
                track(track_id="track-2", stream_url="https://audio.test/two.mp3"),
            ]
        })
        original = "Track | rel-1: Release"
        alternative = f"{original} [track-2]"
        self.assertEqual(set(metadata), {original, alternative})
        self.assertEqual(metadata[original]["track_id"], "track-1")
        self.assertEqual(metadata[alternative]["track_id"], "track-2")
        self.assertEqual(metadata[alternative]["track_title"], "Track")
        self.assertIn(f"#EXTINF:-1,{original}\n", playlist)
        self.assertIn(f"#EXTINF:-1,{alternative}\n", playlist)
        self.assertEqual(playlist.count("\nannotate:"), 2)

    def test_legacy_collision_uses_track_number(self):
        legacy_release = dict(release(
            publication_status="ready",
            archive_details_url="https://archive.test/legacy",
        ), tracks=[
            {"title": "Same", "track_number": 1,
             "mp3_url": "https://audio.test/one.mp3"},
            {"title": "Same", "track_number": 2,
             "mp3_url": "https://audio.test/two.mp3"},
        ])
        _, playlist, metadata, _ = self.run_manifest({"releases": [legacy_release]})
        original = "Same | rel-1: Release"
        alternative = f"{original} [track 2]"
        self.assertEqual(set(metadata), {original, alternative})
        self.assertEqual(metadata[alternative]["track_title"], "Same")
        self.assertIn(f"#EXTINF:-1,{original}\n", playlist)
        self.assertIn(f"#EXTINF:-1,{alternative}\n", playlist)

    def test_v1_flac_fallback_and_radio_ready_filter(self):
        count, _, metadata, _ = self.run_manifest({
            "schema_version": "1.0", "releases": [release()], "tracks": [
                track(track_id="flac", title="FLAC", stream_url=None),
                track(track_id="off", title="Off", radio_ready=False),
            ]
        })
        self.assertEqual(count, 1)
        self.assertEqual(metadata["FLAC | rel-1: Release"]["source_format"], "flac")

    def test_unicode_quotes_backslashes_and_newlines_are_escaped(self):
        manifest = {"schema_version": "1.0", "releases": [release(
            title='Álbum "X"\\Y\nNext', artist='MДK "A"'
        )], "tracks": [track(title='Canción "Q"\\Z\r\nNext')]}
        _, playlist, metadata, _ = self.run_manifest(manifest)
        self.assertIn("Canción", playlist)
        self.assertNotIn("\\nNext", playlist)
        self.assertIn('\\"Q\\"\\\\Z', playlist)
        self.assertTrue(any(key.startswith("Canción \"Q\"\\Z  Next |") for key in metadata))

    def test_zero_tracks_fails_without_outputs(self):
        temp = tempfile.TemporaryDirectory(); self.addCleanup(temp.cleanup)
        directory = Path(temp.name)
        manifest = directory / "manifest.json"
        manifest.write_text(json.dumps({"schema_version": "1.0", "tracks": [], "releases": []}))
        with self.assertRaisesRegex(ValueError, "zero"):
            generate_m3u.generate(manifest, directory / "out", directory / "map", 1)
        self.assertFalse((directory / "out").exists())
        self.assertFalse((directory / "map").exists())

    def test_missing_release_fails(self):
        with self.assertRaisesRegex(ValueError, "missing release"):
            generate_m3u.build_outputs({"schema_version": "1.0", "releases": [], "tracks": [track()]})

    def test_duplicate_track_id_fails(self):
        with self.assertRaisesRegex(ValueError, "Duplicate track_id"):
            generate_m3u.build_outputs({
                "schema_version": "1.0", "releases": [release()],
                "tracks": [track(), track(title="Other")],
            })

    def test_collision_fails_when_alternative_already_exists(self):
        first_release = dict(release(
            publication_status="ready",
            archive_details_url="https://archive.test/legacy",
        ), tracks=[
            {"title": "Same", "track_number": 1,
             "mp3_url": "https://audio.test/one.mp3"},
        ])
        blocker_release = dict(release(
            title="Release [track 2]", publication_status="ready",
            archive_details_url="https://archive.test/legacy",
        ), tracks=[
            {"title": "Same", "track_number": 3,
             "mp3_url": "https://audio.test/blocker.mp3"},
        ])
        colliding_release = dict(release(
            publication_status="ready",
            archive_details_url="https://archive.test/legacy",
        ), tracks=[
            {"title": "Same", "track_number": 2,
             "mp3_url": "https://audio.test/two.mp3"},
        ])
        with self.assertRaisesRegex(ValueError, "remains unresolved"):
            generate_m3u.build_outputs({
                "releases": [first_release, blocker_release, colliding_release]
            })

    def test_invalid_url_fails(self):
        with self.assertRaisesRegex(ValueError, "Invalid HTTP"):
            generate_m3u.build_outputs({
                "schema_version": "1.0", "releases": [release()],
                "tracks": [track(stream_url="file:///secret")],
            })

    def test_custom_outputs_and_cli_do_not_write_runtime_defaults(self):
        temp = tempfile.TemporaryDirectory(); self.addCleanup(temp.cleanup)
        directory = Path(temp.name)
        manifest = directory / "manifest.json"
        output = directory / "playlist.m3u"
        map_output = directory / "map.json"
        manifest.write_text(json.dumps({
            "schema_version": "1.0", "releases": [release()], "tracks": [track()]
        }))
        with mock.patch.object(generate_m3u.os, "replace", wraps=generate_m3u.os.replace) as replace:
            generate_m3u.main(["--manifest", str(manifest), "--output", str(output),
                               "--map-output", str(map_output), "--seed", "4"])
        self.assertTrue(output.exists() and map_output.exists())
        destinations = [Path(call.args[1]) for call in replace.call_args_list]
        self.assertEqual(destinations, [map_output, output])
        self.assertNotIn(generate_m3u.DEFAULT_OUTPUT, destinations)
        self.assertNotIn(generate_m3u.DEFAULT_MAP_OUTPUT, destinations)

    def test_seed_is_deterministic(self):
        manifest = {"schema_version": "1.0", "releases": [release()], "tracks": [
            track(track_id=f"t-{i}", title=f"Track {i}", stream_url=f"https://audio.test/{i}.mp3")
            for i in range(20)
        ]}
        _, first, _, _ = self.run_manifest(manifest, seed=77)
        _, second, _, _ = self.run_manifest(manifest, seed=77)
        _, third, _, _ = self.run_manifest(manifest, seed=78)
        self.assertEqual(first, second)
        self.assertNotEqual(first, third)

    def test_1099_track_copy_under_tmp(self):
        manifest = {"schema_version": "1.0", "releases": [release()], "tracks": [
            track(track_id=f"track-{i}", title=f"Track {i}",
                  stream_url=f"https://audio.test/{i}.mp3")
            for i in range(1099)
        ]}
        count, playlist, metadata, directory = self.run_manifest(manifest)
        self.assertTrue(str(directory).startswith("/tmp/"))
        self.assertEqual(count, 1099)
        self.assertEqual(playlist.count("\nannotate:"), 1099)
        self.assertEqual(len(metadata), 1099)


if __name__ == "__main__":
    unittest.main()
