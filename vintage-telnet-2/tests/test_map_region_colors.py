import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class MapRegionColorsTest(unittest.TestCase):
    def test_every_region_has_distinct_map_color(self):
        regions = set(json.loads((ROOT / "content/spatial.json").read_text())["homes"])
        block = re.search(r"regionColors=\{([^}]*)\}", (ROOT / "client/world3d.js").read_text()).group(1)
        colors = dict(re.findall(r"(\w+):(0x[0-9a-f]+)", block))
        self.assertEqual(regions, set(colors))
        self.assertEqual(len(set(colors.values())), len(colors))

    def test_cumbres_has_2d_wash_north_of_painting(self):
        self.assertIn("world-art-cumbres", (ROOT / "client/app.js").read_text())
        self.assertIn("world-art-cumbres", (ROOT / "client/style.css").read_text())


if __name__ == "__main__":
    unittest.main()
