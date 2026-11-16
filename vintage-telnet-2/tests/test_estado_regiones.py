import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/estado_regiones.py"


class EstadoRegionesTests(unittest.TestCase):
    def run_script(self, root=ROOT):
        return subprocess.run([sys.executable, str(SCRIPT), "--root", str(root)],
                              check=True, capture_output=True, text=True).stdout

    def test_real_catalog_lists_seven_regions(self):
        output = self.run_script()
        self.assertIn("Generado:", output)
        self.assertIn("Commit:", output)
        for region in ("edran", "hoshai", "korven", "lethra", "nhal", "veyra", "cumbres"):
            self.assertIn(f"`{region}`", output)

    def test_detects_simulated_missing_creature_illustration(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / "content/regions").mkdir(parents=True)
            (root / "client/art/bestiary").mkdir(parents=True)
            (root / "content/world.json").write_text(json.dumps({"creatures": {
                "test_beast": {"id": "test_beast", "name": "Bestia de prueba",
                               "region": "test", "illustration": "/client/art/bestiary/missing.webp"}
            }}), encoding="utf-8")
            (root / "content/regions/test.json").write_text(json.dumps({
                "regions": {"test": {"id": "test", "name": "Región de prueba", "search": {"finds": []}}},
                "rooms": {"test_room": {"id": "test_room", "name": "Sala", "region": "test"}},
                "npcs": {},
            }), encoding="utf-8")
            output = self.run_script(root)
        self.assertIn("criatura sin ilustración: Bestia de prueba (`test_beast`)", output)


if __name__ == "__main__":
    unittest.main()
