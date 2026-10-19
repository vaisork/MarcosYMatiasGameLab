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

    def test_edran_campo_encounters_have_explicit_walkable_positions(self):
        """Pool and signalled fauna must not fall back to a position over water."""
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        for room_id in ('edran_estanque', 'edran_lindero', 'edran_parcela_vieja',
                        'edran_zanja_antigua', 'edran_bajo_humedo', 'edran_sauces'):
            with self.subTest(room=room_id):
                room = content.rooms[room_id]
                expected = {s['creature'] for s in
                            room.get('signals', []) + room.get('wildlife_pool', [])}
                scene = json.loads((root / 'client-rpg/scenes' / f'{room_id}.json').read_text())
                self.assertEqual({c['id'] for c in scene['creatures']}, expected)
                for creature in scene['creatures']:
                    x, y = creature['at']
                    self.assertIn(scene['layers']['solid'][y][x], '.0 ')

    def test_edran_caminos_geometry_and_complete_fauna_slots(self):
        """Final artwork paths retain their bends, both cart routes and furniture."""
        import importlib.util
        from collections import deque
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        spec = importlib.util.spec_from_file_location('tiled_to_scene', root / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)
        scenes = {}
        for suffix in ('sendero_regreso', 'arboleda', 'cobertizo_campo',
                       'camino_carros', 'reparo', 'era'):
            room_id = 'edran_' + suffix
            scene = json.loads((root / 'client-rpg/scenes' / f'{room_id}.json').read_text())
            scenes[suffix] = scene
            with self.subTest(room=room_id):
                room = content.rooms[room_id]
                self.assertEqual({e['direction'] for e in scene['exits']}, set(room['exits']))
                self.assertEqual(scene['npcs'], [])
                expected = {s['creature'] for s in room.get('signals', []) + room.get('wildlife_pool', [])}
                self.assertEqual({e['id'] for e in scene['creatures']}, expected)
                tiled = json.loads((root / 'client-rpg/tiled' / f'{room_id}.tmj').read_text())
                self.assertEqual(converter.tiled_to_scene(tiled), scene)
                start = tuple(scene['spawn']['default'])
                queue = deque([start]); seen = {start}
                while queue:
                    x, y = queue.popleft()
                    for nx, ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
                        if 0 <= nx < 20 and 0 <= ny < 15 and scene['layers']['solid'][ny][nx] == '.' and (nx,ny) not in seen:
                            seen.add((nx,ny)); queue.append((nx,ny))
                for entity in scene['creatures']:
                    self.assertIn(tuple(entity['at']), seen)
        # These cells distinguish the painted routes from a generic crossroads.
        for suffix, free, blocked in (
            ('sendero_regreso', [(1,3),(4,7),(10,9),(16,6),(18,3)], [(10,5),(10,7),(10,14)]),
            ('arboleda', [(10,1),(1,7),(7,10),(10,13)], [(4,3),(15,4),(16,11)]),
            ('cobertizo_campo', [(1,7),(10,8),(18,7)], [(7,4),(13,4),(3,11),(15,11),(10,14)]),
            ('camino_carros', [(9,1),(4,6),(15,6),(10,11),(10,13)], [(9,6),(17,10)]),
            ('reparo', [(11,1),(5,5),(6,6),(18,7),(11,13)], [(3,4),(6,4),(7,5),(2,5)]),
            ('era', [(10,1),(10,7),(3,9),(1,10),(11,13)], [(5,5),(6,5),(0,6)]),
        ):
            with self.subTest(geometry=suffix):
                solid = scenes[suffix]['layers']['solid']
                for x, y in free:
                    self.assertEqual(solid[y][x], '.', (suffix,x,y))
                for x, y in blocked:
                    self.assertEqual(solid[y][x], '1', (suffix,x,y))
