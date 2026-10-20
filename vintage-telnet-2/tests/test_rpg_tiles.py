import os
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

    def test_preview_cli_generates_scaled_scene_pngs(self):
        """El modo --preview genera vistas PNG a escala x3 de cada escena."""
        import subprocess
        import tempfile
        if subprocess.run(['python3', '-c', 'import PIL'], capture_output=True).returncode:
            self.skipTest('Pillow no instalado: herramienta de arte, no runtime')
        pack = Path(os.environ.get('NINJA_ADVENTURE_DIR', Path.home() / 'proyectos' / 'entregas' / 'equipo' / 'assets-rpg' / 'Ninja Adventure - Asset Pack'))
        if not pack.is_dir():
            self.skipTest('Pack Ninja Adventure ausente (sólo en la máquina de arte; no se publica)')
        with tempfile.TemporaryDirectory() as tmpdir:
            script_path = ROOT / 'scripts' / 'build-rpg-tileset.py'
            res = subprocess.run(['python3', str(script_path), '--preview', tmpdir], capture_output=True, text=True)
            self.assertEqual(res.returncode, 0, f"build-rpg-tileset.py failed:\n{res.stderr}")
            for scene_file in sorted(SCENES_DIR.glob('*.json')):
                png_path = Path(tmpdir) / f"{scene_file.stem}.png"
                self.assertTrue(png_path.is_file(), f"Missing preview: {png_path}")
                data = png_path.read_bytes()
                self.assertEqual(data[:8], b'\x89PNG\r\n\x1a\n')
                width, height = struct.unpack('>II', data[16:24])
                scene_data = json.loads(scene_file.read_text(encoding='utf-8'))
                expected_w = scene_data['size'][0] * 16 * 3
                expected_h = scene_data['size'][1] * 16 * 3
                self.assertEqual(width, expected_w)
                self.assertEqual(height, expected_h)

    def test_background_actions_roundtrip_and_validation(self):
        """background_actions opcional se conserva en ida/vuelta y valida formato."""
        base_scene_file = next(SCENES_DIR.glob('*.json'))
        base_scene = json.loads(base_scene_file.read_text(encoding='utf-8'))
        scene_with_actions = dict(base_scene)
        scene_with_actions['background_actions'] = {
            'edran_recoger_caja': 'backgrounds/edran_canal_repisa_caja.webp'
        }

        # 1. scene -> tmj -> scene
        tmj = scene_to_tiled(scene_with_actions, tilesets_dir=TILESETS_DIR)
        prop = next((p for p in tmj['properties'] if p['name'] == 'background_actions'), None)
        self.assertIsNotNone(prop)
        self.assertEqual(prop['type'], 'string')
        self.assertEqual(json.loads(prop['value']), scene_with_actions['background_actions'])

        restored_scene = tiled_to_scene(tmj, tilesets_dir=TILESETS_DIR, room_fallback=scene_with_actions['room'])
        self.assertEqual(restored_scene, scene_with_actions)

        # 2. tmj -> scene -> tmj
        restored_tmj = scene_to_tiled(restored_scene, tilesets_dir=TILESETS_DIR)
        self.assertEqual(tmj, restored_tmj)

        # 3. Escena sin background_actions no añade la propiedad
        tmj_plain = scene_to_tiled(base_scene, tilesets_dir=TILESETS_DIR)
        self.assertNotIn('background_actions', [p['name'] for p in tmj_plain['properties']])
        restored_plain = tiled_to_scene(tmj_plain, tilesets_dir=TILESETS_DIR, room_fallback=base_scene['room'])
        self.assertNotIn('background_actions', restored_plain)
        self.assertEqual(base_scene, restored_plain)

        # 4. Validaciones de forma y rutas
        invalid_cases = [
            'not_a_dict',
            [('edran_recoger_caja', 'backgrounds/edran_canal_repisa_caja.webp')],
            {123: 'backgrounds/edran_canal_repisa_caja.webp'},
            {'': 'backgrounds/edran_canal_repisa_caja.webp'},
            {'edran_recoger_caja': 'bad_path.png'},
            {'edran_recoger_caja': '../malicious.webp'},
            {'edran_recoger_caja': '/client-rpg/backgrounds/edran_canal_repisa_caja.webp'},
            {'edran_recoger_caja': 'backgrounds/edran_canal_repisa_caja.png'},
        ]
        for bad in invalid_cases:
            with self.subTest(invalid=bad):
                bad_scene = dict(base_scene, background_actions=bad)
                with self.assertRaises(ValueError):
                    scene_to_tiled(bad_scene, tilesets_dir=TILESETS_DIR)

        # 5. Validación en tiled_to_scene con JSON corrupto o tipo inválido
        bad_tmj = dict(tmj, properties=[
            {'name': 'room', 'type': 'string', 'value': 'test'},
            {'name': 'tileset', 'type': 'string', 'value': 'edran'},
            {'name': 'background_actions', 'type': 'string', 'value': '{invalid_json'},
        ])
        with self.assertRaises(ValueError):
            tiled_to_scene(bad_tmj, tilesets_dir=TILESETS_DIR)

        bad_tmj_type = dict(tmj, properties=[
            {'name': 'room', 'type': 'string', 'value': 'test'},
            {'name': 'tileset', 'type': 'string', 'value': 'edran'},
            {'name': 'background_actions', 'type': 'int', 'value': 42},
        ])
        with self.assertRaises(ValueError):
            tiled_to_scene(bad_tmj_type, tilesets_dir=TILESETS_DIR)

    def test_battle_background_roundtrip_and_validation(self):
        """battle_background opcional se conserva en ida/vuelta y valida whitelist."""
        base_scene_file = next(SCENES_DIR.glob('*.json'))
        base_scene = json.loads(base_scene_file.read_text(encoding='utf-8'))
        scene_with_bb = dict(base_scene)
        scene_with_bb['battle_background'] = 'backgrounds/edran_canal_battle.webp'

        # 1. scene -> tmj -> scene
        tmj = scene_to_tiled(scene_with_bb, tilesets_dir=TILESETS_DIR)
        prop = next((p for p in tmj['properties'] if p['name'] == 'battle_background'), None)
        self.assertIsNotNone(prop)
        self.assertEqual(prop['type'], 'string')
        self.assertEqual(prop['value'], 'backgrounds/edran_canal_battle.webp')

        restored_scene = tiled_to_scene(tmj, tilesets_dir=TILESETS_DIR, room_fallback=scene_with_bb['room'])
        self.assertEqual(restored_scene, scene_with_bb)

        # 2. tmj -> scene -> tmj
        restored_tmj = scene_to_tiled(restored_scene, tilesets_dir=TILESETS_DIR)
        self.assertEqual(tmj, restored_tmj)

        # 3. Escena sin battle_background no añade la propiedad
        tmj_plain = scene_to_tiled(base_scene, tilesets_dir=TILESETS_DIR)
        self.assertNotIn('battle_background', [p['name'] for p in tmj_plain['properties']])
        restored_plain = tiled_to_scene(tmj_plain, tilesets_dir=TILESETS_DIR, room_fallback=base_scene['room'])
        self.assertNotIn('battle_background', restored_plain)
        self.assertEqual(base_scene, restored_plain)

        # 4. Coexistencia con background_actions
        scene_with_both = dict(base_scene)
        scene_with_both['battle_background'] = 'backgrounds/edran_canal_battle.webp'
        scene_with_both['background_actions'] = {'edran_recoger_caja': 'backgrounds/edran_canal_repisa_caja.webp'}
        tmj_both = scene_to_tiled(scene_with_both, tilesets_dir=TILESETS_DIR)
        restored_both = tiled_to_scene(tmj_both, tilesets_dir=TILESETS_DIR, room_fallback=scene_with_both['room'])
        self.assertEqual(restored_both, scene_with_both)

        # 5. Validaciones de tipos no string, URLs y traversal en scene_to_tiled
        invalid_cases = [
            123,
            ['backgrounds/edran_canal_battle.webp'],
            {'path': 'backgrounds/edran_canal_battle.webp'},
            '',
            'https://example.com/battle.webp',
            'http://malicious.org/bg.webp',
            '../traversal.webp',
            'backgrounds/../secret.webp',
            '/client-rpg/backgrounds/edran_canal_battle.webp',
            'backgrounds/edran_canal_battle.png',
            'backgrounds/edran canal battle.webp',
        ]
        for bad in invalid_cases:
            with self.subTest(invalid=bad):
                bad_scene = dict(base_scene, battle_background=bad)
                with self.assertRaises(ValueError):
                    scene_to_tiled(bad_scene, tilesets_dir=TILESETS_DIR)

        # 6. Validación en tiled_to_scene con tipo no string o ruta inválida
        bad_tmj_type = dict(tmj, properties=[
            {'name': 'room', 'type': 'string', 'value': 'test'},
            {'name': 'tileset', 'type': 'string', 'value': 'edran'},
            {'name': 'battle_background', 'type': 'int', 'value': 42},
        ])
        with self.assertRaises(ValueError):
            tiled_to_scene(bad_tmj_type, tilesets_dir=TILESETS_DIR)

        bad_tmj_path = dict(tmj, properties=[
            {'name': 'room', 'type': 'string', 'value': 'test'},
            {'name': 'tileset', 'type': 'string', 'value': 'edran'},
            {'name': 'battle_background', 'type': 'string', 'value': '../evil.webp'},
        ])
        with self.assertRaises(ValueError):
            tiled_to_scene(bad_tmj_path, tilesets_dir=TILESETS_DIR)


if __name__ == '__main__':
    unittest.main()
