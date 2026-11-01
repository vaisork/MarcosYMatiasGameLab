import hashlib
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content" / "regions"
SCENES = ROOT / "client-rpg" / "scenes"
BACKGROUNDS = ROOT / "client-rpg" / "backgrounds"


class RpgBattleBackgroundsTests(unittest.TestCase):
    def test_every_room_with_an_rpg_scene_resolves_to_an_existing_battle_background(self):
        rooms = {}
        for path in CONTENT.glob("*.json"):
            region_data = json.loads(path.read_text())
            for room_id in region_data["rooms"]:
                self.assertNotIn(room_id, rooms)
                rooms[room_id] = path.stem

        scene_ids = {path.stem for path in SCENES.glob("*.json")}
        self.assertTrue(scene_ids <= set(rooms))
        self.assertTrue(scene_ids)

        for room_id in scene_ids:
            region = rooms[room_id]
            with self.subTest(room=room_id):
                scene = json.loads((SCENES / f"{room_id}.json").read_text())
                background = scene.get(
                    "battle_background", f"backgrounds/{region}_battle.webp"
                )
                self.assertTrue(background.startswith("backgrounds/"))
                self.assertTrue((ROOT / "client-rpg" / background).is_file(), background)

    def test_new_regional_battle_assets_have_matching_sidecars(self):
        for region in ("hoshai", "lethra", "nhal"):
            with self.subTest(region=region):
                background = BACKGROUNDS / f"{region}_battle.webp"
                sidecar = json.loads(background.with_suffix(".webp.json").read_text())
                payload = background.read_bytes()
                self.assertEqual(sidecar["asset_id"], f"{region}_battle")
                self.assertEqual(sidecar["generation_tool"], "native image_gen")
                self.assertEqual(sidecar["dimensions"], [1280, 960])
                self.assertLessEqual(len(payload), 250000)
                self.assertEqual(sidecar["bytes"], len(payload))
                self.assertEqual(sidecar["sha256"], hashlib.sha256(payload).hexdigest())


if __name__ == "__main__":
    unittest.main()
