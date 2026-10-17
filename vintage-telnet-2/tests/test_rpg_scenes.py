"""Presentation scenes may position only real rooms, exits and local entities."""
import json
from pathlib import Path
import unittest

from server.content import Content


class RpgSceneTests(unittest.TestCase):
    def test_scenes_match_authored_world_and_map_bounds(self):
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        for path in sorted((root / 'client-rpg' / 'scenes').glob('*.json')):
            with self.subTest(scene=path.name):
                scene = json.loads(path.read_text(encoding='utf-8'))
                self.assertIn(path.stem, content.rooms)
                self.assertEqual(scene['room'], path.stem)
                room = content.rooms[path.stem]
                size = scene['size']
                self.assertEqual(len(size), 2)
                for value in size:
                    self.assertIs(type(value), int)
                    self.assertGreater(value, 0)
                width, height = size
                self.assertIs(type(scene['tile']), int)
                self.assertGreater(scene['tile'], 0)
                layers = scene['layers']
                self.assertTrue({'ground', 'solid'}.issubset(layers))
                for name, rows in layers.items():
                    self.assertEqual(len(rows), height, name)
                    for row in rows:
                        self.assertIsInstance(row, str, name)
                        self.assertEqual(len(row), width, name)

                def point(at):
                    self.assertEqual(len(at), 2)
                    x, y = at
                    self.assertIs(type(x), int)
                    self.assertIs(type(y), int)
                    self.assertTrue(0 <= x < width and 0 <= y < height, at)

                self.assertIn('default', scene['spawn'])
                for at in scene['spawn'].values():
                    point(at)
                for exit in scene['exits']:
                    self.assertIn(exit['direction'], room.get('exits', {}))
                    rect = exit['rect']
                    self.assertEqual(len(rect), 4)
                    x, y, w, h = rect
                    for value in rect:
                        self.assertIs(type(value), int)
                    self.assertGreater(w, 0)
                    self.assertGreater(h, 0)
                    point([x, y])
                    point([x + w - 1, y + h - 1])
                    for row in range(y, y + h):
                        for col in range(x, x + w):
                            # Empty collision tiles: '.', '0' or a blank; other tiles block.
                            self.assertIn(layers['solid'][row][col], '.0 ', exit['direction'])
                for npc in scene.get('npcs', []):
                    self.assertIn(npc['id'], room.get('npcs', []))
                    point(npc['at'])
                creatures = {s['creature'] for s in
                             room.get('signals', []) + room.get('wildlife_pool', [])}
                for creature in scene.get('creatures', []):
                    self.assertIn(creature['id'], creatures)
                    point(creature['at'])

    def test_painted_scenes_roundtrip_and_reachable_exits(self):
        import importlib.util
        from collections import deque
        root = Path(__file__).resolve().parents[1]
        spec = importlib.util.spec_from_file_location('tiled_to_scene', root / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)
        for path in (root / 'client-rpg/scenes').glob('*.json'):
            scene = json.loads(path.read_text())
            with self.subTest(scene=path.stem):
                background = root / 'client-rpg' / scene['background']
                self.assertTrue(background.is_file())
                self.assertLessEqual(background.stat().st_size, 250000)
                scene['foreground'] = f'backgrounds/{path.stem}-front.webp'
                self.assertEqual(converter.tiled_to_scene(converter.scene_to_tiled(scene)), scene)
                solid = scene['layers']['solid']
                queue = deque([tuple(scene['spawn']['default'])]);seen = set(queue)
                while queue:
                    x, y = queue.popleft()
                    for nx, ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
                        if 0 <= nx < 20 and 0 <= ny < 15 and solid[ny][nx] == '.' and (nx,ny) not in seen:
                            seen.add((nx,ny));queue.append((nx,ny))
                for at in list(scene['spawn'].values()) + [e['at'] for e in scene['npcs']+scene['creatures']]:
                    self.assertIn(tuple(at), seen)
                for e in scene['exits']:
                    x,y,w,h=e['rect']
                    self.assertTrue(any((i,j) in seen for i in range(x,x+w) for j in range(y,y+h)))
