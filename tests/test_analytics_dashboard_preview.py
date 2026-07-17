import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PREVIEW = ROOT / "web/stats/_preview-analytics-dashboard"


class AnalyticsDashboardPreviewTests(unittest.TestCase):
    def test_preview_is_isolated_and_complete(self):
        expected = {"index.html", "styles.css", "app.js", "real-data.json", "demo-data.json",
                    "AUDIT.md"}
        self.assertTrue(expected.issubset({path.name for path in PREVIEW.iterdir()}))
        self.assertNotIn("_preview-analytics-dashboard", (ROOT / "web/stats/index.template.html").read_text())

    def test_demo_and_real_data_are_separate_and_labeled(self):
        real = json.loads((PREVIEW / "real-data.json").read_text())
        demo = json.loads((PREVIEW / "demo-data.json").read_text())
        analytics = json.loads((ROOT / "tests/fixtures/listener-analytics-preview.json").read_text())
        self.assertEqual(demo["label"], "DEMO DATA")
        self.assertNotIn("listener_series_24h", demo)
        self.assertNotIn("listening_hours", demo["kpis"])
        self.assertNotIn("kpis", real)
        self.assertIn("listeners_now", real["live"])
        self.assertIn("track_markers_24h", real["play_history"])
        self.assertEqual(analytics["mount"], "/strange-waves.mp3")
        self.assertTrue(analytics["methodology"]["listener_hours_is_not_sessions"])
        self.assertEqual([item["label"] for item in demo["session_duration"]],
                         ["<30 s", "30 s–5 min", "5–30 min", "30–60 min", ">60 min"])

    def test_all_snapshot_covers_are_local_real_derivatives(self):
        real = json.loads((PREVIEW / "real-data.json").read_text())
        covers = {real["now_playing"]["cover"]}
        covers.update(item["cover"] for item in real["play_history"]["top_releases"])
        covers.update(item["cover"] for item in real["play_history"]["top_tracks"])
        self.assertTrue(all((PREVIEW / cover).is_file() for cover in covers))
        self.assertTrue(all(item.get("cover_source") for item in real["play_history"]["top_releases"]))

    def test_accessibility_and_responsive_contract(self):
        html = (PREVIEW / "index.html").read_text()
        css = (PREVIEW / "styles.css").read_text()
        app = (PREVIEW / "app.js").read_text()
        self.assertIn('href="#main"', html)
        self.assertIn('aria-current="page"', html)
        self.assertIn('role="img"', html)
        self.assertIn('rel="icon" href="data:image/svg+xml,', html)
        self.assertIn("loadJson('/stats/listener-analytics.json')", app)
        self.assertNotIn("loadJson('listener-analytics.json')", app)
        self.assertNotIn("fetch('listener-analytics.json')", app)
        self.assertIn("load_status:'unknown'", app)
        self.assertIn("listeners_now:null", app)
        self.assertIn("Listener analytics unavailable · current audience metrics are unknown.", app)
        self.assertNotIn("Modeled listener line", html)
        self.assertIn("prefers-reduced-motion:reduce", css)
        for breakpoint in (1100, 760, 520):
            self.assertIn(f"max-width:{breakpoint}px", css)

    def test_privacy_language_avoids_unique_people_claims(self):
        text = ((PREVIEW / "index.html").read_text() + (PREVIEW / "app.js").read_text()).lower()
        self.assertIn("no claim of unique people", text)
        self.assertNotIn("unique visitors", text)
        for term in ("web visits", "player starts", "stream connections", "listening sessions", "current listeners"):
            self.assertIn(term, text)


if __name__ == "__main__":
    unittest.main()
