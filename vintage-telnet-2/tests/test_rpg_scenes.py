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

    def test_edran_canal_scenes_canonical_geometry_and_entities(self):
        """Final artwork canal rooms retain canonical exits, NPCs, forajido and obstacles."""
        import importlib.util
        from collections import deque
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        spec = importlib.util.spec_from_file_location('tiled_to_scene', root / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)

        canal_rooms = [
            'edran_canal_entrada', 'edran_canal_herramientas',
            'edran_canal_bifurcacion', 'edran_canal_refugio',
            'edran_canal_compuerta', 'edran_canal_repisa'
        ]
        scenes = {}
        for room_id in canal_rooms:
            scene_path = root / 'client-rpg/scenes' / f'{room_id}.json'
            self.assertTrue(scene_path.is_file(), f'Missing scene file {scene_path}')
            scene = json.loads(scene_path.read_text(encoding='utf-8'))
            scenes[room_id] = scene
            room = content.rooms[room_id]

            with self.subTest(room=room_id):
                # Canonical exits match content
                self.assertEqual({e['direction'] for e in scene['exits']}, set(room.get('exits', {})))

                # Tiled roundtrip lossless
                tiled_path = root / 'client-rpg/tiled' / f'{room_id}.tmj'
                self.assertTrue(tiled_path.is_file(), f'Missing tmj file {tiled_path}')
                tiled = json.loads(tiled_path.read_text(encoding='utf-8'))
                self.assertEqual(converter.tiled_to_scene(tiled), scene)
                self.assertEqual(converter.scene_to_tiled(scene), tiled)

                # Background file exists and is within 250 KB
                bg_path = root / 'client-rpg' / scene['background']
                self.assertTrue(bg_path.is_file(), f'Missing bg {bg_path}')
                self.assertLessEqual(bg_path.stat().st_size, 250000)

                # Connectivity: all spawns, npcs, creatures and exits reachable
                start = tuple(scene['spawn']['default'])
                queue = deque([start])
                seen = {start}
                while queue:
                    x, y = queue.popleft()
                    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                        if 0 <= nx < 20 and 0 <= ny < 15 and scene['layers']['solid'][ny][nx] == '.' and (nx, ny) not in seen:
                            seen.add((nx, ny))
                            queue.append((nx, ny))

                for arrival, at in scene['spawn'].items():
                    self.assertIn(tuple(at), seen, f'{room_id} spawn {arrival} unreachable')
                for npc in scene.get('npcs', []):
                    self.assertIn(tuple(npc['at']), seen, f'{room_id} npc {npc} unreachable')
                for creature in scene.get('creatures', []):
                    self.assertIn(tuple(creature['at']), seen, f'{room_id} creature {creature} unreachable')
                for ex in scene['exits']:
                    x, y, w, h = ex['rect']
                    self.assertTrue(any((i, j) in seen for i in range(x, x + w) for j in range(y, y + h)),
                                    f'{room_id} exit {ex} unreachable')

        # Canonical NPCs: Nela only in entrada, Oren only in refugio
        self.assertEqual(scenes['edran_canal_entrada']['npcs'], [{'id': 'edran_nela', 'at': [10, 7]}])
        self.assertEqual(scenes['edran_canal_refugio']['npcs'], [{'id': 'edran_oren', 'at': [12, 8]}])
        for r in ('edran_canal_herramientas', 'edran_canal_bifurcacion', 'edran_canal_compuerta', 'edran_canal_repisa'):
            self.assertEqual(scenes[r]['npcs'], [], f'{r} should not have NPCs')

        # Canonical creatures: forajido_camino only in compuerta
        self.assertEqual(scenes['edran_canal_compuerta']['creatures'], [{'id': 'forajido_camino', 'at': [13, 10]}])
        for r in ('edran_canal_entrada', 'edran_canal_herramientas', 'edran_canal_bifurcacion', 'edran_canal_refugio', 'edran_canal_repisa'):
            self.assertEqual(scenes[r]['creatures'], [], f'{r} should not have creatures')

        # Repisa background variant
        repisa = scenes['edran_canal_repisa']
        self.assertEqual(repisa['background'], 'backgrounds/edran_canal_repisa.webp')
        self.assertEqual(repisa.get('background_actions'), {'edran_recoger_caja': 'backgrounds/edran_canal_repisa_caja.webp'})
        caja_bg = root / 'client-rpg' / repisa['background_actions']['edran_recoger_caja']
        self.assertTrue(caja_bg.is_file(), f'Missing variant bg {caja_bg}')
        self.assertLessEqual(caja_bg.stat().st_size, 250000)

        # The offered canal encounter must retain its underground environment.
        compuerta = scenes['edran_canal_compuerta']
        self.assertEqual(compuerta.get('battle_background'), 'backgrounds/edran_canal_battle.webp')
        battle_bg = root / 'client-rpg' / compuerta['battle_background']
        self.assertTrue(battle_bg.is_file())
        self.assertLessEqual(battle_bg.stat().st_size, 250000)

        # Distinguishing obstacles and dry path points per room
        for room_id, free_pts, blocked_pts in (
            ('edran_canal_entrada', [(1, 4), (18, 6), (10, 13), (10, 7)], [(12, 4), (1, 1), (18, 12), (8, 8), (12, 8), (8, 5)]),
            ('edran_canal_herramientas', [(10, 1), (10, 7), (3, 8), (16, 8), (3, 6), (16, 6), (3, 10), (15, 10), (4, 11), (14, 11), (14, 5), (15, 5), (16, 5)], [(4, 4), (16, 4), (10, 13), (7, 5)]),
            ('edran_canal_bifurcacion', [(1, 6), (18, 6), (9, 13), (10, 7)], [(12, 4), (10, 2), (3, 11), (10, 6), (16, 6), (17, 6)]),
            ('edran_canal_refugio', [(9, 1), (9, 7), (12, 8), (4, 7), (5, 8), (14, 8), (15, 9), (12, 10), (6, 5), (13, 5), (4, 6)], [(14, 5), (15, 6), (3, 7), (10, 13), (7, 11), (9, 11), (12, 11)]),
            ('edran_canal_compuerta', [(1, 9), (18, 9), (9, 9), (13, 10)], [(10, 6), (10, 12), (0, 6), (5, 8)]),
            ('edran_canal_repisa', [(1, 9), (6, 9), (11, 8), (16, 9), (16, 10), (15, 11)], [(13, 5), (8, 6), (18, 9), (8, 7), (9, 7), (10, 7), (11, 7), (5, 8), (9, 8), (10, 8)]),
        ):
            with self.subTest(geometry=room_id):
                solid = scenes[room_id]['layers']['solid']
                for x, y in free_pts:
                    self.assertEqual(solid[y][x], '.', f'{room_id} point ({x},{y}) should be walkable')
                for x, y in blocked_pts:
                    self.assertEqual(solid[y][x], '1', f'{room_id} obstacle ({x},{y}) should be blocked')

    def test_edran_norte_scenes_canonical_geometry_and_entities(self):
        """Final artwork Edran Norte rooms retain canonical exits, Aren, fauna and obstacles."""
        import importlib.util
        from collections import deque
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        spec = importlib.util.spec_from_file_location('tiled_to_scene', root / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)

        norte_rooms = [
            'edran_terraplen', 'edran_casa_camino', 'edran_calzada',
            'edran_hito_campos', 'edran_vista_cuenca'
        ]
        scenes = {}
        total_exits = 0
        for room_id in norte_rooms:
            scene_path = root / 'client-rpg/scenes' / f'{room_id}.json'
            self.assertTrue(scene_path.is_file(), f'Missing scene file {scene_path}')
            scene = json.loads(scene_path.read_text(encoding='utf-8'))
            scenes[room_id] = scene
            room = content.rooms[room_id]

            with self.subTest(room=room_id):
                # Canonical exits match content
                room_exits = set(room.get('exits', {}))
                self.assertEqual({e['direction'] for e in scene['exits']}, room_exits)
                total_exits += len(scene['exits'])

                # Tiled roundtrip lossless
                tiled_path = root / 'client-rpg/tiled' / f'{room_id}.tmj'
                self.assertTrue(tiled_path.is_file(), f'Missing tmj file {tiled_path}')
                tiled = json.loads(tiled_path.read_text(encoding='utf-8'))
                self.assertEqual(converter.tiled_to_scene(tiled), scene)
                self.assertEqual(converter.scene_to_tiled(scene), tiled)

                # Background file exists and is within 250 KB
                bg_path = root / 'client-rpg' / scene['background']
                self.assertTrue(bg_path.is_file(), f'Missing bg {bg_path}')
                self.assertLessEqual(bg_path.stat().st_size, 250000)

                # Connectivity: all spawns, npcs, creatures and exits reachable
                start = tuple(scene['spawn']['default'])
                queue = deque([start])
                seen = {start}
                while queue:
                    x, y = queue.popleft()
                    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                        if 0 <= nx < 20 and 0 <= ny < 15 and scene['layers']['solid'][ny][nx] == '.' and (nx, ny) not in seen:
                            seen.add((nx, ny))
                            queue.append((nx, ny))

                for arrival, at in scene['spawn'].items():
                    self.assertIn(tuple(at), seen, f'{room_id} spawn {arrival} unreachable')
                for npc in scene.get('npcs', []):
                    self.assertIn(tuple(npc['at']), seen, f'{room_id} npc {npc} unreachable')
                for creature in scene.get('creatures', []):
                    self.assertIn(tuple(creature['at']), seen, f'{room_id} creature {creature} unreachable')
                for ex in scene['exits']:
                    x, y, w, h = ex['rect']
                    self.assertTrue(any((i, j) in seen for i in range(x, x + w) for j in range(y, y + h)),
                                    f'{room_id} exit {ex} unreachable')

        # Total exits across the 5 northern rooms is exactly 11
        self.assertEqual(total_exits, 11)

        # Canonical NPC: Aren only in Casa del camino on raised floor below work table
        self.assertEqual(scenes['edran_casa_camino']['npcs'], [{'id': 'edran_aren', 'at': [14, 7]}])
        for r in ('edran_terraplen', 'edran_calzada', 'edran_hito_campos', 'edran_vista_cuenca'):
            self.assertEqual(scenes[r]['npcs'], [], f'{r} should not have NPCs')

        # Complete wildlife pools match content
        for room_id in ('edran_terraplen', 'edran_calzada', 'edran_hito_campos', 'edran_vista_cuenca'):
            expected_creatures = {s['creature'] for s in content.rooms[room_id].get('wildlife_pool', [])}
            actual_creatures = {c['id'] for c in scenes[room_id]['creatures']}
            self.assertEqual(actual_creatures, expected_creatures, f'Creature pool mismatch in {room_id}')

        # Distinguishing obstacles and walkable path points per room
        for room_id, free_pts, blocked_pts in (
            ('edran_terraplen', [(10, 1), (10, 7), (9, 8), (10, 13)], [(6, 6), (7, 6), (6, 7), (7, 7), (8, 7), (2, 4), (17, 4)]),
            ('edran_casa_camino', [(10, 1), (10, 8), (14, 7), (10, 13), (8, 6), (13, 10)], [(2, 2), (14, 4), (16, 6), (7, 8), (13, 8), (3, 13), (6, 13), (17, 7), (18, 7)]),
            ('edran_calzada', [(9, 1), (12, 3), (10, 7), (8, 8), (10, 10), (10, 13)], [(2, 4), (17, 4), (2, 10), (17, 10), (7, 3), (8, 3)]),
            ('edran_hito_campos', [(10, 1), (10, 4), (10, 8), (18, 7), (10, 13), (15, 8)], [(8, 3), (8, 4), (12, 3), (12, 4), (6, 7), (7, 7), (12, 6), (13, 6), (14, 6)]),
            ('edran_vista_cuenca', [(1, 8), (10, 8), (18, 8)], [(10, 2), (10, 12), (0, 2), (19, 12), (1, 7), (18, 7)]),
        ):
            with self.subTest(geometry=room_id):
                solid = scenes[room_id]['layers']['solid']
                for x, y in free_pts:
                    self.assertEqual(solid[y][x], '.', f'{room_id} point ({x},{y}) should be walkable')
                for x, y in blocked_pts:
                    self.assertEqual(solid[y][x], '1', f'{room_id} obstacle ({x},{y}) should be blocked')

    def test_edran_restante_scenes_canonical_geometry_and_entities(self):
        """Final artwork Edran Restante rooms retain canonical exits, fauna, obstacles and Tiled roundtrip."""
        import importlib.util
        from collections import deque
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        spec = importlib.util.spec_from_file_location('tiled_to_scene', root / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)

        restante_rooms = [
            'edran_loma', 'edran_prado', 'edran_ladera_piedra',
            'edran_linde_piedra', 'edran_sendero_juncos', 'edran_puente_juncos'
        ]
        scenes = {}
        total_exits = 0
        for room_id in restante_rooms:
            scene_path = root / 'client-rpg/scenes' / f'{room_id}.json'
            self.assertTrue(scene_path.is_file(), f'Missing scene file {scene_path}')
            scene = json.loads(scene_path.read_text(encoding='utf-8'))
            scenes[room_id] = scene
            room = content.rooms[room_id]

            with self.subTest(room=room_id):
                # Canonical exits match content
                room_exits = set(room.get('exits', {}))
                self.assertEqual({e['direction'] for e in scene['exits']}, room_exits)
                total_exits += len(scene['exits'])

                # Tiled roundtrip lossless
                tiled_path = root / 'client-rpg/tiled' / f'{room_id}.tmj'
                self.assertTrue(tiled_path.is_file(), f'Missing tmj file {tiled_path}')
                tiled = json.loads(tiled_path.read_text(encoding='utf-8'))
                self.assertEqual(converter.tiled_to_scene(tiled), scene)
                self.assertEqual(converter.scene_to_tiled(scene), tiled)

                # Background file exists and is within 250 KB
                bg_path = root / 'client-rpg' / scene['background']
                self.assertTrue(bg_path.is_file(), f'Missing bg {bg_path}')
                self.assertLessEqual(bg_path.stat().st_size, 250000)

                # Connectivity: all spawns, creatures and exits reachable
                start = tuple(scene['spawn']['default'])
                queue = deque([start])
                seen = {start}
                while queue:
                    x, y = queue.popleft()
                    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                        if 0 <= nx < 20 and 0 <= ny < 15 and scene['layers']['solid'][ny][nx] == '.' and (nx, ny) not in seen:
                            seen.add((nx, ny))
                            queue.append((nx, ny))

                for arrival, at in scene['spawn'].items():
                    self.assertIn(tuple(at), seen, f'{room_id} spawn {arrival} unreachable')
                for npc in scene.get('npcs', []):
                    self.assertIn(tuple(npc['at']), seen, f'{room_id} npc {npc} unreachable')
                for creature in scene.get('creatures', []):
                    self.assertIn(tuple(creature['at']), seen, f'{room_id} creature {creature} unreachable')
                for ex in scene['exits']:
                    x, y, w, h = ex['rect']
                    self.assertTrue(any((i, j) in seen for i in range(x, x + w) for j in range(y, y + h)),
                                    f'{room_id} exit {ex} unreachable')

        # Total exits across the 6 restante rooms is exactly 14
        self.assertEqual(total_exits, 14)

        # No NPCs in these 6 rooms
        for r in restante_rooms:
            self.assertEqual(scenes[r]['npcs'], [], f'{r} should not have NPCs')

        # Complete wildlife pools and signals match content
        for room_id in restante_rooms:
            expected_creatures = {s['creature'] for s in content.rooms[room_id].get('signals', []) + content.rooms[room_id].get('wildlife_pool', [])}
            actual_creatures = {c['id'] for c in scenes[room_id]['creatures']}
            self.assertEqual(actual_creatures, expected_creatures, f'Creature pool mismatch in {room_id}')
            # Creatures must not occupy spawn cells
            spawn_cells = {tuple(at) for at in scenes[room_id]['spawn'].values()}
            for c in scenes[room_id]['creatures']:
                self.assertNotIn(tuple(c['at']), spawn_cells, f'Creature {c} on spawn in {room_id}')

        # Distinguishing obstacles and walkable path points per room
        for room_id, free_pts, blocked_pts in (
            ('edran_loma', [(6, 1), (9, 13), (18, 7), (8, 8)], [(14, 2), (16, 3), (1, 5), (15, 12)]),
            ('edran_prado', [(12, 5), (1, 5), (10, 13), (9, 11)], [(10, 0), (18, 4), (1, 12)]),
            ('edran_ladera_piedra', [(9, 1), (18, 7), (12, 6)], [(5, 2), (5, 6), (5, 9), (6, 10), (10, 13)]),
            ('edran_linde_piedra', [(10, 7), (10, 1), (10, 13)], [(6, 6), (1, 7), (18, 7)]),
            ('edran_sendero_juncos', [(10, 7), (1, 6), (18, 7)], [(10, 1), (10, 12)]),
            ('edran_puente_juncos', [(10, 4), (4, 5), (17, 5), (8, 13)], [(10, 1), (10, 6), (14, 10)]),
        ):
            with self.subTest(geometry=room_id):
                solid = scenes[room_id]['layers']['solid']
                for x, y in free_pts:
                    self.assertEqual(solid[y][x], '.', f'{room_id} point ({x},{y}) should be walkable')
                for x, y in blocked_pts:
                    self.assertEqual(solid[y][x], '1', f'{room_id} obstacle ({x},{y}) should be blocked')
