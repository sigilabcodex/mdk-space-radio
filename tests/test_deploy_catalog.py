import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("deploy_catalog", ROOT / "bin/deploy-catalog.py")
deploy_catalog = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(deploy_catalog)


def valid_manifest():
    releases = [{"release_id": f"MDK{i:03d}", "release_number": i} for i in range(1, 150)]
    releases.append({
        "release_id": "MDK150", "release_number": 150, "track_count": 10,
        "track_ids": [f"MDK150-D01-T{i:02d}" for i in range(1, 11)],
        "archive_identifier": "mdk150-council-of-the-perplexed",
    })
    tracks = [{
        "track_id": f"OLD-{i}", "release_id": "MDK001", "radio_ready": True
    } for i in range(1109)]
    tracks[-10:] = [{
        "track_id": f"MDK150-D01-T{i:02d}", "release_id": "MDK150", "radio_ready": True
    } for i in range(1, 11)]
    return {"schema_version": "1.0", "release_count": 150, "track_count": 1109,
            "releases": releases, "tracks": tracks}


class DeployCatalogValidationTest(unittest.TestCase):
    def validate(self, data):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "manifest.json"
            path.write_text(json.dumps(data), encoding="utf-8")
            return deploy_catalog.validate_manifest(path)

    def test_accepts_expected_catalog(self):
        self.assertEqual(self.validate(valid_manifest())["track_count"], 1109)

    def test_rejects_wrong_identifier(self):
        data = valid_manifest()
        data["releases"][-1]["archive_identifier"] = "wrong"
        with self.assertRaisesRegex(ValueError, "archive_identifier"):
            self.validate(data)

    def test_rejects_wrong_mdk150_track_count(self):
        data = valid_manifest()
        data["tracks"][-1]["release_id"] = "MDK001"
        with self.assertRaisesRegex(ValueError, "exactly 10"):
            self.validate(data)

    def test_rejects_declared_count_mismatch(self):
        data = valid_manifest()
        data["track_count"] = 1099
        with self.assertRaisesRegex(ValueError, "expected/declared"):
            self.validate(data)


if __name__ == "__main__":
    unittest.main()
