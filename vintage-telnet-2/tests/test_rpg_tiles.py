import importlib.util
import json
from pathlib import Path
import struct
import unittest

ROOT = Path(__file__).resolve().parents[1]
_spec = importlib.util.spec_from_file_location("tiled_to_scene_mod", ROOT / 'scripts' / 'tiled-to-scene.py')
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)
scene_to_tiled = _mod.scene_to_tiled
tiled_to_scene = _mod.tiled_to_scene

SCENES_DIR = ROOT / 'client-rpg' / 'scenes'
TILED_DIR = ROOT / 'client-rpg' / 'tiled'
TILESETS_DIR = ROOT / 'client-rpg' / 'tilesets'
SPRITES_DIR = ROOT / 'client-rpg' / 'sprites'


class RpgTilesTests(unittest.TestCase):
    def test_roundtrip_scene_and_tmj_identical(self):
        """Ida y vuelta tmj <-> scene idéntica sin pérdidas."""
        scene_files = sorted(SCENES_DIR.glob('*.json'))
        self.assertGreaterEqual(len(scene_files), 3)

        for scene_file in scene_files:
            with self.subTest(room=scene_file.stem):
                scene = json.loads(scene_file.read_text(encoding='utf-8'))
                # 1. scene -> tmj -> scene
                tmj = scene_to_tiled(scene, tilesets_dir=TILESETS_DIR)
                scene_roundtrip = tiled_to_scene(tmj, tilesets_dir=TILESETS_DIR, room_fallback=scene['room'])
                self.assertEqual(scene, scene_roundtrip)

                # 2. Check saved file client-rpg/tiled/<room>.tmj
                tmj_file = TILED_DIR / f'{scene_file.stem}.tmj'
                self.assertTrue(tmj_file.is_file(), f"Missing tmj file: {tmj_file}")
                saved_tmj = json.loads(tmj_file.read_text(encoding='utf-8'))
                scene_from_saved = tiled_to_scene(saved_tmj, tilesets_dir=TILESETS_DIR, room_fallback=scene['room'])
                self.assertEqual(scene, scene_from_saved)

                # 3. tmj -> scene -> tmj
                tmj_roundtrip = scene_to_tiled(scene_from_saved, tilesets_dir=TILESETS_DIR)
                self.assertEqual(saved_tmj, tmj_roundtrip)

    def test_all_ground_characters_in_scenes_exist_in_tileset(self):
        """Todo carácter de ground de las escenas existe en tilesets/edran.json."""
        tileset_path = TILESETS_DIR / 'edran.json'
        self.assertTrue(tileset_path.is_file(), f"Missing tileset: {tileset_path}")
        tileset = json.loads(tileset_path.read_text(encoding='utf-8'))

        self.assertIn('image', tileset)
        self.assertEqual(tileset.get('tile'), 16)
        self.assertIn('map', tileset)
        tile_map = tileset['map']

        scene_files = sorted(SCENES_DIR.glob('*.json'))
        self.assertGreaterEqual(len(scene_files), 3)

        for scene_file in scene_files:
            scene = json.loads(scene_file.read_text(encoding='utf-8'))
            for row in scene['layers']['ground']:
                for char in row:
                    with self.subTest(scene=scene_file.stem, char=char):
                        self.assertIn(
                            char,
                            tile_map,
                            f"Ground character '{char}' from scene {scene_file.stem} missing in {tileset_path.name}"
                        )
                        self.assertIsInstance(tile_map[char], int)
                        self.assertGreaterEqual(tile_map[char], 0)

    def test_atlas_exists_and_dimensions_are_multiples_of_16(self):
        """Atlas existe, mide múltiplo de 16 y ocupa <40 KB."""
        atlas_path = SPRITES_DIR / 'edran-tiles.png'
        self.assertTrue(atlas_path.is_file(), f"Missing atlas: {atlas_path}")

        size_bytes = atlas_path.stat().st_size
        self.assertLess(size_bytes, 40 * 1024, f"Atlas exceeds 40 KB: {size_bytes} bytes")
        self.assertGreater(size_bytes, 0)

        data = atlas_path.read_bytes()
        self.assertEqual(data[:8], b'\x89PNG\r\n\x1a\n', "File is not a valid PNG")
        # PNG IHDR chunk starts at byte 12; width and height at bytes 16:24
        width, height = struct.unpack('>II', data[16:24])

        self.assertGreater(width, 0)
        self.assertGreater(height, 0)
        self.assertEqual(width % 16, 0, f"Atlas width {width} is not a multiple of 16")
        self.assertEqual(height % 16, 0, f"Atlas height {height} is not a multiple of 16")

    def test_credits_file_attribution(self):
        """Archivo de créditos y licencia CC0 para Ninja Adventure existe."""
        cred_path = SPRITES_DIR / 'CREDITOS.md'
        self.assertTrue(cred_path.is_file(), f"Missing credits: {cred_path}")
        text = cred_path.read_text(encoding='utf-8')
        self.assertIn('Ninja Adventure', text)
        self.assertIn('Pixel-boy', text)
        self.assertIn('CC0', text)


if __name__ == '__main__':
    unittest.main()
