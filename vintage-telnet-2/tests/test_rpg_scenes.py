"""Presentation scenes may position only real rooms, exits and local entities."""
import json
from pathlib import Path
import unittest

from server.content import Content


class RpgSceneTests(unittest.TestCase):
    def test_every_content_room_has_a_scene_and_all_exits(self):
        """The RPG client map covers every authored room and its complete exit contract."""
        import importlib.util
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        scene_dir = root / 'client-rpg/scenes'
        tiled_dir = root / 'client-rpg/tiled'
        scene_ids = {path.stem for path in scene_dir.glob('*.json')}
        self.assertEqual(scene_ids, set(content.rooms))
        spec = importlib.util.spec_from_file_location('tiled_to_scene', root / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)
        for room_id, room in content.rooms.items():
            with self.subTest(room=room_id):
                scene_path = scene_dir / f'{room_id}.json'
                tiled_path = tiled_dir / f'{room_id}.tmj'
                self.assertTrue(scene_path.is_file(), f'Missing scene {scene_path}')
                self.assertTrue(tiled_path.is_file(), f'Missing Tiled source {tiled_path}')
                scene = json.loads(scene_path.read_text(encoding='utf-8'))
                tiled = json.loads(tiled_path.read_text(encoding='utf-8'))
                self.assertEqual(scene['room'], room_id)
                self.assertEqual({e['direction'] for e in scene['exits']}, set(room.get('exits', {})))
                self.assertEqual(converter.tiled_to_scene(tiled), scene)

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

    def test_scenes_roundtrip_and_reachable_exits(self):
        import importlib.util
        from collections import deque
        root = Path(__file__).resolve().parents[1]
        spec = importlib.util.spec_from_file_location('tiled_to_scene', root / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)
        for path in (root / 'client-rpg/scenes').glob('*.json'):
            scene = json.loads(path.read_text())
            with self.subTest(scene=path.stem):
                # Background is optional while a scene awaits illustration.
                if 'background' in scene:
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
            ('edran_loma', [(6, 1), (9, 13), (18, 8), (8, 8), (10, 8)], [(14, 2), (16, 3), (1, 5), (15, 12), (16, 7), (17, 9), (10, 10)]),
            ('edran_prado', [(12, 5), (1, 5), (10, 13), (9, 11), (5, 6), (8, 9)], [(10, 0), (18, 4), (1, 12), (10, 2), (4, 3)]),
            ('edran_ladera_piedra', [(9, 1), (18, 8), (12, 6), (9, 4), (10, 5)], [(5, 2), (5, 6), (5, 9), (6, 10), (10, 13), (13, 4), (7, 6), (5, 8)]),
            ('edran_linde_piedra', [(10, 7), (10, 1), (10, 13), (10, 5), (10, 8)], [(6, 6), (1, 7), (18, 7), (6, 5), (7, 5)]),
            ('edran_sendero_juncos', [(10, 7), (1, 6), (18, 6)], [(10, 1), (10, 12), (7, 4), (1, 7), (19, 7)]),
            ('edran_puente_juncos', [(10, 4), (4, 5), (17, 5), (8, 13), (10, 5), (8, 10)], [(10, 1), (10, 6), (14, 10), (17, 6), (5, 10)]),
        ):
            with self.subTest(geometry=room_id):
                solid = scenes[room_id]['layers']['solid']
                for x, y in free_pts:
                    self.assertEqual(solid[y][x], '.', f'{room_id} point ({x},{y}) should be walkable')
                for x, y in blocked_pts:
                    self.assertEqual(solid[y][x], '1', f'{room_id} obstacle ({x},{y}) should be blocked')

    def test_korven_01_sources_borders_and_art_footprints(self):
        """Only canonical portals cross borders; baskets, benches and rock stay solid."""
        import importlib.util
        import hashlib
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        spec = importlib.util.spec_from_file_location('tiled', root / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)
        footprints = {
            # Shelter, tent supports, grain racks, houses, cart and workshop benches.
            'korven_borde_tierra': ([(5, 6), (10, 1), (11, 13)], [(4, 3), (7, 5), (14, 8)]),
            'korven_senda_viento': ([(8, 13), (18, 4), (12, 6)], [(9, 4), (12, 2), (11, 10)]),
            'korven_almacen_grano': ([(1, 7), (10, 7), (18, 7)], [(4, 3), (15, 11), (10, 0)]),
            'brumak_centro': ([(10, 1), (1, 7), (18, 7), (10, 13)], [(4, 4), (14, 3), (14, 11)]),
            'korven_peldanos_cortos': ([(1, 6), (18, 6), (12, 6), (10, 13)], [(12, 2), (15, 4), (10, 0)]),
            'korven_taller_juntas': ([(6, 8), (10, 10), (10, 13)], [(3, 7), (17, 7), (10, 2)]),
        }
        exits_total = 0
        for room_id, (free, blocked) in footprints.items():
            with self.subTest(room=room_id):
                scene = json.loads((root / 'client-rpg/scenes' / f'{room_id}.json').read_text())
                tiled = json.loads((root / 'client-rpg/tiled' / f'{room_id}.tmj').read_text())
                self.assertEqual(converter.tiled_to_scene(tiled), scene)
                self.assertEqual(converter.scene_to_tiled(scene), tiled)
                room = content.rooms[room_id]
                self.assertEqual({e['direction'] for e in scene['exits']}, set(room['exits']))
                self.assertEqual(len(scene['exits']), len(room['exits']))
                exits_total += len(scene['exits'])
                self.assertEqual({n['id'] for n in scene['npcs']}, set(room.get('npcs', [])))
                fauna = {s['creature'] for s in room.get('signals', []) + room.get('wildlife_pool', [])}
                self.assertEqual({c['id'] for c in scene['creatures']}, fauna)
                actors = [tuple(a['at']) for a in scene['npcs'] + scene['creatures']]
                self.assertEqual(len(actors), len(set(actors)))
                self.assertFalse(set(actors) & {tuple(a) for a in scene['spawn'].values()})
                solid = scene['layers']['solid']
                portals = {(x, y) for e in scene['exits']
                           for x in range(e['rect'][0], e['rect'][0] + e['rect'][2])
                           for y in range(e['rect'][1], e['rect'][1] + e['rect'][3])}
                for y in range(15):
                    for x in range(20):
                        if x in (0, 19) or y in (0, 14):
                            self.assertEqual(solid[y][x] == '.', (x, y) in portals, (x, y))
                for x, y in free:
                    self.assertEqual(solid[y][x], '.', (x, y))
                for x, y in blocked:
                    self.assertEqual(solid[y][x], '1', (x, y))
                paths = [scene['background']]
                if fauna:
                    self.assertEqual(scene['battle_background'], 'backgrounds/korven_battle.webp')
                    paths.append(scene['battle_background'])
                for relative in paths:
                    asset = root / 'client-rpg' / relative
                    meta = json.loads(asset.with_suffix('.webp.json').read_text())
                    self.assertEqual(meta['dimensions'], [1280, 960])
                    self.assertEqual(meta['sha256'], hashlib.sha256(asset.read_bytes()).hexdigest())
                    self.assertEqual(meta['bytes'], asset.stat().st_size)
                    self.assertLessEqual(asset.stat().st_size, 250000)
        self.assertEqual(exits_total, 14)

    def test_korven_02_sources_borders_and_art_footprints(self):
        """Only canonical portals cross borders; sacks, tables and stone stay solid."""
        import importlib.util
        import hashlib
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        spec = importlib.util.spec_from_file_location('tiled', root / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)
        footprints = {
            'korven_almacen_entrada': ([(10, 7), (1, 7), (14, 6)], [(4, 3), (17, 3), (4, 11)]),
            'korven_almacen_balanzas': ([(14, 7), (18, 7), (6, 7)], [(3, 3), (17, 3), (5, 11)]),
            'korven_almacen_cruce': ([(10, 5), (10, 9), (18, 7)], [(4, 3), (16, 3), (4, 11)]),
            'korven_almacen_lateral': ([(9, 7), (1, 7), (10, 12)], [(4, 3), (16, 3), (16, 11)]),
            'korven_almacen_fondo': ([(10, 7), (10, 2), (18, 7)], [(4, 3), (16, 3), (10, 12)]),
            'korven_calle_fachadas': ([(10, 7), (10, 2), (18, 7)], [(3, 3), (16, 3), (3, 11)]),
            'korven_sala_cuidados': ([(8, 7), (1, 7), (13, 6)], [(4, 3), (17, 3), (17, 11)]),
        }
        exits_total = 0
        for room_id, (free, blocked) in footprints.items():
            with self.subTest(room=room_id):
                scene = json.loads((root / 'client-rpg/scenes' / f'{room_id}.json').read_text())
                tiled = json.loads((root / 'client-rpg/tiled' / f'{room_id}.tmj').read_text())
                self.assertEqual(converter.tiled_to_scene(tiled), scene)
                self.assertEqual(converter.scene_to_tiled(scene), tiled)
                room = content.rooms[room_id]
                self.assertEqual({e['direction'] for e in scene['exits']}, set(room['exits']))
                self.assertEqual(len(scene['exits']), len(room['exits']))
                exits_total += len(scene['exits'])
                self.assertEqual({n['id'] for n in scene['npcs']}, set(room.get('npcs', [])))
                fauna = {s['creature'] for s in room.get('signals', []) + room.get('wildlife_pool', [])}
                self.assertEqual({c['id'] for c in scene['creatures']}, fauna)
                actors = [tuple(a['at']) for a in scene['npcs'] + scene['creatures']]
                self.assertEqual(len(actors), len(set(actors)))
                self.assertFalse(set(actors) & {tuple(a) for a in scene['spawn'].values()})
                solid = scene['layers']['solid']
                portals = {(x, y) for e in scene['exits']
                           for x in range(e['rect'][0], e['rect'][0] + e['rect'][2])
                           for y in range(e['rect'][1], e['rect'][1] + e['rect'][3])}
                for y in range(15):
                    for x in range(20):
                        if x in (0, 19) or y in (0, 14):
                            self.assertEqual(solid[y][x] == '.', (x, y) in portals, (x, y))
                for x, y in free:
                    self.assertEqual(solid[y][x], '.', (x, y))
                for x, y in blocked:
                    self.assertEqual(solid[y][x], '1', (x, y))
                paths = [scene['background']]
                if fauna:
                    self.assertEqual(scene['battle_background'], 'backgrounds/korven_battle.webp')
                    paths.append(scene['battle_background'])
                for relative in paths:
                    asset = root / 'client-rpg' / relative
                    meta = json.loads(asset.with_suffix('.webp.json').read_text())
                    self.assertEqual(meta['dimensions'], [1280, 960])
                    self.assertEqual(meta['sha256'], hashlib.sha256(asset.read_bytes()).hexdigest())
                    self.assertEqual(meta['bytes'], asset.stat().st_size)
                    self.assertLessEqual(asset.stat().st_size, 250000)
        self.assertEqual(exits_total, 15)
        for sprite_name in ('ruma', 'neru'):
            asset = root / 'client-rpg/sprites' / f'{sprite_name}.png'
            meta = json.loads(asset.with_suffix('.png.json').read_text())
            self.assertEqual(meta['dimensions'], [192, 384])
            self.assertEqual(meta['sha256'], hashlib.sha256(asset.read_bytes()).hexdigest())
            self.assertEqual(meta['bytes'], asset.stat().st_size)

    def test_korven_03_sources_borders_and_art_footprints(self):
        """Only canonical portals cross borders; cistern, wash basins, chasm and stone stay solid."""
        import importlib.util
        import hashlib
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        spec = importlib.util.spec_from_file_location('tiled', root / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)
        footprints = {
            'korven_cisterna_comun': ([(10, 3), (1, 7), (18, 7)], [(10, 6), (10, 7), (4, 1)]),
            'korven_patio_lavado': ([(10, 7), (18, 7), (10, 13)], [(3, 3), (16, 3), (4, 11)]),
            'korven_deposito_cubiertas': ([(10, 7), (10, 1), (8, 6)], [(3, 3), (17, 3), (4, 11)]),
            'korven_mirador_grietas': ([(10, 7), (1, 7), (10, 13)], [(3, 2), (17, 2), (17, 11)]),
            'korven_cauce_observacion': ([(10, 7), (10, 1), (18, 7)], [(3, 3), (17, 3), (3, 11)]),
            'korven_plataforma_escucha': ([(10, 7), (1, 7), (10, 1)], [(3, 3), (17, 3), (17, 11)]),
            'korven_registro_cauce': ([(10, 7), (10, 13), (13, 6)], [(3, 3), (17, 3), (3, 11)]),
        }
        exits_total = 0
        for room_id, (free, blocked) in footprints.items():
            with self.subTest(room=room_id):
                scene = json.loads((root / 'client-rpg/scenes' / f'{room_id}.json').read_text())
                tiled = json.loads((root / 'client-rpg/tiled' / f'{room_id}.tmj').read_text())
                self.assertEqual(converter.tiled_to_scene(tiled), scene)
                self.assertEqual(converter.scene_to_tiled(scene), tiled)
                room = content.rooms[room_id]
                represented_exits = {direction for direction, target in room['exits'].items()
                                     if (root / 'client-rpg/scenes' / f'{target}.json').is_file()}
                self.assertEqual({e['direction'] for e in scene['exits']}, represented_exits)
                self.assertEqual(len(scene['exits']), len(represented_exits))
                exits_total += len(scene['exits'])
                self.assertEqual({n['id'] for n in scene['npcs']}, set(room.get('npcs', [])))
                fauna = {s['creature'] for s in room.get('signals', []) + room.get('wildlife_pool', [])}
                self.assertEqual({c['id'] for c in scene['creatures']}, fauna)
                actors = [tuple(a['at']) for a in scene['npcs'] + scene['creatures']]
                self.assertEqual(len(actors), len(set(actors)))
                self.assertFalse(set(actors) & {tuple(a) for a in scene['spawn'].values()})
                solid = scene['layers']['solid']
                portals = {(x, y) for e in scene['exits']
                           for x in range(e['rect'][0], e['rect'][0] + e['rect'][2])
                           for y in range(e['rect'][1], e['rect'][1] + e['rect'][3])}
                for y in range(15):
                    for x in range(20):
                        if x in (0, 19) or y in (0, 14):
                            self.assertEqual(solid[y][x] == '.', (x, y) in portals, (x, y))
                for x, y in free:
                    self.assertEqual(solid[y][x], '.', (x, y))
                for x, y in blocked:
                    self.assertEqual(solid[y][x], '1', (x, y))
                paths = [scene['background']]
                if fauna:
                    self.assertEqual(scene['battle_background'], 'backgrounds/korven_battle.webp')
                    paths.append(scene['battle_background'])
                for relative in paths:
                    asset = root / 'client-rpg' / relative
                    meta = json.loads(asset.with_suffix('.webp.json').read_text())
                    self.assertEqual(meta['dimensions'], [1280, 960])
                    self.assertEqual(meta['sha256'], hashlib.sha256(asset.read_bytes()).hexdigest())
                    self.assertEqual(meta['bytes'], asset.stat().st_size)
                    self.assertLessEqual(asset.stat().st_size, 250000)
        self.assertEqual(exits_total, 14)
        for sprite_name in ('oma',):
            asset = root / 'client-rpg/sprites' / f'{sprite_name}.png'
            meta = json.loads(asset.with_suffix('.png.json').read_text())
            self.assertEqual(meta['dimensions'], [192, 384])
            self.assertEqual(meta['sha256'], hashlib.sha256(asset.read_bytes()).hexdigest())
            self.assertEqual(meta['bytes'], asset.stat().st_size)

    def test_korven_04_sources_borders_and_art_footprints(self):
        """Only canonical portals cross borders; benches, cairns, chasm and stone stay solid."""
        import importlib.util
        import hashlib
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        spec = importlib.util.spec_from_file_location('tiled', root / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)
        footprints = {
            'korven_asiento_revision': ([(10, 7), (1, 7), (18, 7), (10, 1)], [(3, 3), (17, 3), (10, 14)]),
            'korven_meseta_relevo': ([(10, 7), (10, 1), (10, 13)], [(3, 3), (17, 3), (1, 7), (18, 7)]),
            'korven_hendidura_transito': ([(10, 7), (1, 7), (18, 7)], [(3, 2), (17, 2), (10, 1), (10, 13)]),
            'korven_hitos_paso': ([(10, 7), (1, 7), (18, 7)], [(3, 2), (17, 2), (10, 1), (10, 13)]),
            'korven_pared_sotavento': ([(10, 7), (1, 7), (18, 7)], [(3, 2), (17, 2), (10, 1), (10, 13)]),
            'korven_meseta_baja': ([(10, 7), (1, 7), (18, 7), (10, 13)], [(3, 2), (17, 2), (10, 1)]),
        }
        exits_total = 0
        for room_id, (free, blocked) in footprints.items():
            with self.subTest(room=room_id):
                scene = json.loads((root / 'client-rpg/scenes' / f'{room_id}.json').read_text())
                tiled = json.loads((root / 'client-rpg/tiled' / f'{room_id}.tmj').read_text())
                self.assertEqual(converter.tiled_to_scene(tiled), scene)
                self.assertEqual(converter.scene_to_tiled(scene), tiled)
                room = content.rooms[room_id]
                self.assertEqual({e['direction'] for e in scene['exits']}, set(room['exits']))
                self.assertEqual(len(scene['exits']), len(room['exits']))
                exits_total += len(scene['exits'])
                self.assertEqual({n['id'] for n in scene['npcs']}, set(room.get('npcs', [])))
                fauna = {s['creature'] for s in room.get('signals', []) + room.get('wildlife_pool', [])}
                self.assertEqual({c['id'] for c in scene['creatures']}, fauna)
                actors = [tuple(a['at']) for a in scene['npcs'] + scene['creatures']]
                self.assertEqual(len(actors), len(set(actors)))
                self.assertFalse(set(actors) & {tuple(a) for a in scene['spawn'].values()})
                solid = scene['layers']['solid']
                portals = {(x, y) for e in scene['exits']
                           for x in range(e['rect'][0], e['rect'][0] + e['rect'][2])
                           for y in range(e['rect'][1], e['rect'][1] + e['rect'][3])}
                for y in range(15):
                    for x in range(20):
                        if x in (0, 19) or y in (0, 14):
                            self.assertEqual(solid[y][x] == '.', (x, y) in portals, (x, y))
                for x, y in free:
                    self.assertEqual(solid[y][x], '.', (x, y))
                for x, y in blocked:
                    self.assertEqual(solid[y][x], '1', (x, y))
                paths = [scene['background']]
                if fauna:
                    self.assertEqual(scene['battle_background'], 'backgrounds/korven_battle.webp')
                    paths.append(scene['battle_background'])
                for relative in paths:
                    asset = root / 'client-rpg' / relative
                    meta = json.loads(asset.with_suffix('.webp.json').read_text())
                    self.assertEqual(meta['dimensions'], [1280, 960])
                    self.assertEqual(meta['sha256'], hashlib.sha256(asset.read_bytes()).hexdigest())
                    self.assertEqual(meta['bytes'], asset.stat().st_size)
                    self.assertLessEqual(asset.stat().st_size, 250000)
        self.assertEqual(exits_total, 14)

    def test_korven_05_sources_borders_and_art_footprints(self):
        """Only canonical portals cross borders; riverbed, gravel ridge, shell rock, kiln and sample alcove stay solid."""
        import importlib.util
        import hashlib
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        spec = importlib.util.spec_from_file_location('tiled', root / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)
        footprints = {
            'korven_cauce_duro': ([(10, 7), (1, 7), (18, 7), (10, 13)], [(3, 2), (17, 2), (10, 1)]),
            'korven_loma_cascajo': ([(10, 7), (1, 7), (18, 7)], [(3, 2), (17, 2), (10, 1), (10, 13)]),
            'korven_roca_cascaron': ([(10, 7), (10, 1)], [(3, 3), (17, 3), (1, 7), (18, 7), (10, 14)]),
            'korven_desvio_horno': ([(10, 7), (10, 1), (10, 13)], [(3, 3), (17, 3), (1, 7), (18, 7)]),
            'korven_horno_reposo': ([(10, 7), (10, 1), (1, 7)], [(18, 7), (10, 14), (17, 3), (17, 12)]),
            'korven_entrante_piezas': ([(10, 7), (18, 7), (8, 6)], [(1, 7), (10, 1), (10, 14), (3, 3), (3, 12)]),
        }
        exits_total = 0
        for room_id, (free, blocked) in footprints.items():
            with self.subTest(room=room_id):
                scene = json.loads((root / 'client-rpg/scenes' / f'{room_id}.json').read_text())
                tiled = json.loads((root / 'client-rpg/tiled' / f'{room_id}.tmj').read_text())
                self.assertEqual(converter.tiled_to_scene(tiled), scene)
                self.assertEqual(converter.scene_to_tiled(scene), tiled)
                room = content.rooms[room_id]
                self.assertEqual({e['direction'] for e in scene['exits']}, set(room['exits']))
                self.assertEqual(len(scene['exits']), len(room['exits']))
                exits_total += len(scene['exits'])
                self.assertEqual({n['id'] for n in scene['npcs']}, set(room.get('npcs', [])))
                fauna = {s['creature'] for s in room.get('signals', []) + room.get('wildlife_pool', [])}
                self.assertEqual({c['id'] for c in scene['creatures']}, fauna)
                actors = [tuple(a['at']) for a in scene['npcs'] + scene['creatures']]
                self.assertEqual(len(actors), len(set(actors)))
                self.assertFalse(set(actors) & {tuple(a) for a in scene['spawn'].values()})
                solid = scene['layers']['solid']
                portals = {(x, y) for e in scene['exits']
                           for x in range(e['rect'][0], e['rect'][0] + e['rect'][2])
                           for y in range(e['rect'][1], e['rect'][1] + e['rect'][3])}
                for y in range(15):
                    for x in range(20):
                        if x in (0, 19) or y in (0, 14):
                            self.assertEqual(solid[y][x] == '.', (x, y) in portals, (x, y))
                for x, y in free:
                    self.assertEqual(solid[y][x], '.', (x, y))
                for x, y in blocked:
                    self.assertEqual(solid[y][x], '1', (x, y))
                paths = [scene['background']]
                if fauna:
                    self.assertEqual(scene['battle_background'], 'backgrounds/korven_battle.webp')
                    paths.append(scene['battle_background'])
                for relative in paths:
                    asset = root / 'client-rpg' / relative
                    meta = json.loads(asset.with_suffix('.webp.json').read_text())
                    self.assertEqual(meta['dimensions'], [1280, 960])
                    self.assertEqual(meta['sha256'], hashlib.sha256(asset.read_bytes()).hexdigest())
                    self.assertEqual(meta['bytes'], asset.stat().st_size)
                    self.assertLessEqual(asset.stat().st_size, 250000)
        self.assertEqual(exits_total, 11)
        for sprite_name in ('taren',):
            asset = root / 'client-rpg/sprites' / f'{sprite_name}.png'
            meta = json.loads(asset.with_suffix('.png.json').read_text())
            self.assertEqual(meta['dimensions'], [192, 384])
            self.assertEqual(meta['sha256'], hashlib.sha256(asset.read_bytes()).hexdigest())
            self.assertEqual(meta['bytes'], asset.stat().st_size)

    def test_korven_complete_region_and_boundary_exits(self):
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        korven_rooms = [r for r in content.rooms if r.startswith('korven_') or r == 'brumak_centro']
        self.assertTrue(korven_rooms)

        for rid in korven_rooms:
            scene_path = root / 'client-rpg/scenes' / f'{rid}.json'
            self.assertTrue(scene_path.is_file(), f'Falta escena {scene_path}')
            scene = json.loads(scene_path.read_text(encoding='utf-8'))
            self.assertEqual(scene['room'], rid)

            content_exits = set(content.rooms[rid].get('exits', {}))
            scene_exits = {e['direction'] for e in scene.get('exits', [])}
            self.assertEqual(scene_exits, content_exits, f'Discrepancia de salidas en {rid}')

            solid = scene['layers']['solid']
            for d, pos in scene.get('spawn', {}).items():
                x, y = pos
                self.assertTrue(0 <= x < 20 and 0 <= y < 15, f'Spawn {d} fuera de límites en {rid}: {pos}')
                self.assertEqual(solid[y][x], '.', f'Spawn {d} bloqueado en {rid}: {pos}')

        boundaries = [
            ('korven_borde_tierra', 'sur', 'edran_linde_piedra', 'norte'),
            ('korven_meseta_relevo', 'norte', 'hoshai_garganta_oeste', 'sur'),
            ('korven_loma_cascajo', 'este', 'veyra_terraplen_roca', 'oeste'),
        ]
        for src, out_dir, dst, in_dir in boundaries:
            self.assertEqual(content.rooms[src]['exits'][out_dir], dst)
            self.assertEqual(content.rooms[dst]['exits'][in_dir], src)

        korven_npcs = {'korven_ved', 'korven_beran', 'korven_ruma', 'korven_neru', 'korven_oma', 'korven_taren'}
        present_npcs = {npc for rid in korven_rooms for npc in content.rooms[rid].get('npcs', [])}
        self.assertTrue(korven_npcs <= present_npcs)

    def test_korven_grieta_scenes_sources_and_reachable_exits(self):
        """Grieta rooms use canonical actors, complete exits and walkable Tiled source maps."""
        import importlib.util
        import hashlib
        from collections import deque
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        spec = importlib.util.spec_from_file_location('tiled_to_scene', root / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)
        room_ids = sorted(rid for rid in content.rooms if rid.startswith('korven_grieta_'))
        self.assertEqual(len(room_ids), 16)
        for room_id in ['korven_cauce_observacion', *room_ids]:
            room = content.rooms[room_id]
            scene_path = root / 'client-rpg/scenes' / f'{room_id}.json'
            tiled_path = root / 'client-rpg/tiled' / f'{room_id}.tmj'
            with self.subTest(room=room_id):
                scene = json.loads(scene_path.read_text(encoding='utf-8'))
                tiled = json.loads(tiled_path.read_text(encoding='utf-8'))
                self.assertEqual(converter.tiled_to_scene(tiled), scene)
                self.assertEqual(converter.scene_to_tiled(scene), tiled)
                if room_id.startswith('korven_grieta_'):
                    self.assertEqual(scene['background'], f'backgrounds/{room_id}.webp')
                    expected_battle = ('backgrounds/korven_grieta_sierpe_battle.webp'
                                       if room_id == 'korven_grieta_corazon'
                                       else 'backgrounds/korven_grieta_battle.webp')
                    self.assertEqual(scene['battle_background'], expected_battle)
                    for relative in (scene['background'], scene['battle_background']):
                        asset = root / 'client-rpg' / relative
                        self.assertTrue(asset.is_file(), relative)
                        meta = json.loads(asset.with_suffix('.webp.json').read_text())
                        self.assertEqual(meta['dimensions'], [1280, 960])
                        self.assertEqual(meta['asset_id'], asset.stem)
                        self.assertEqual(meta['sha256'], hashlib.sha256(asset.read_bytes()).hexdigest())
                        self.assertEqual(meta['bytes'], asset.stat().st_size)
                        self.assertLessEqual(asset.stat().st_size, 250000)
                self.assertEqual({e['direction'] for e in scene['exits']}, set(room.get('exits', {})))
                self.assertEqual({n['id'] for n in scene['npcs']}, set(room.get('npcs', [])))
                expected = {s['creature'] for s in room.get('signals', []) + room.get('wildlife_pool', [])}
                self.assertEqual({c['id'] for c in scene['creatures']}, expected)
                solid = scene['layers']['solid']
                actors = scene['npcs'] + scene['creatures']
                points = [tuple(p) for p in scene['spawn'].values()] + [tuple(a['at']) for a in actors]
                self.assertEqual(len(points), len(set(points)))
                queue = deque([tuple(scene['spawn']['default'])])
                seen = set(queue)
                while queue:
                    x, y = queue.popleft()
                    for nx, ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
                        if 0 <= nx < 20 and 0 <= ny < 15 and solid[ny][nx] == '.' and (nx,ny) not in seen:
                            seen.add((nx,ny)); queue.append((nx,ny))
                for at in points:
                    self.assertEqual(solid[at[1]][at[0]], '.')
                    self.assertIn(at, seen)
                portals = set()
                for ex in scene['exits']:
                    x,y,w,h = ex['rect']
                    portal = {(px,py) for py in range(y,y+h) for px in range(x,x+w)}
                    portals |= portal
                    self.assertTrue(portal & seen, ex['direction'])
                for y in range(15):
                    for x in range(20):
                        if x in (0,19) or y in (0,14):
                            self.assertEqual(solid[y][x] == '.', (x,y) in portals, (room_id,x,y))
        channel = json.loads((root / 'client-rpg/scenes/korven_cauce_observacion.json').read_text())
        self.assertEqual(content.rooms['korven_cauce_observacion']['exits']['sur'], 'korven_grieta_boca')
        self.assertEqual({e['direction'] for e in channel['exits']}, {'norte','este','sur'})

        creature_ids = sorted({s['creature'] for rid in room_ids
                               for s in content.rooms[rid].get('signals', [])})
        self.assertEqual(len(creature_ids), 10)
        for creature_id in creature_ids:
            for suffix, dimensions in (('', [48, 48]), ('-battle', [256, 256]
                    if creature_id in {'tejecristal', 'quebrarrocas_canoso', 'sierpe_veta_madre'}
                    else [192, 192])):
                asset = root / 'client-rpg/sprites' / f'{creature_id}{suffix}.png'
                meta = json.loads(asset.with_suffix('.png.json').read_text())
                self.assertEqual(meta['dimensions'], dimensions)
                self.assertEqual(meta['sha256'], hashlib.sha256(asset.read_bytes()).hexdigest())
                self.assertEqual(meta['bytes'], asset.stat().st_size)

    def test_lethra_complete_region_and_boundary_exits(self):
        from collections import deque
        import importlib.util
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        rooms = [rid for rid, room in content.rooms.items() if room.get('region') == 'lethra']
        self.assertEqual(len(rooms), 27)
        spec = importlib.util.spec_from_file_location('tiled_to_scene', root / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)

        for rid in rooms:
            scene_path = root / 'client-rpg/scenes' / f'{rid}.json'
            tiled_path = root / 'client-rpg/tiled' / f'{rid}.tmj'
            self.assertTrue(scene_path.is_file(), f'Falta escena {scene_path}')
            self.assertTrue(tiled_path.is_file(), f'Falta fuente Tiled {tiled_path}')
            scene = json.loads(scene_path.read_text(encoding='utf-8'))
            room = content.rooms[rid]
            with self.subTest(room=rid):
                self.assertEqual(scene['room'], rid)
                self.assertEqual({e['direction'] for e in scene['exits']}, set(room.get('exits', {})))
                self.assertEqual({n['id'] for n in scene['npcs']}, set(room.get('npcs', [])))
                creatures = {s['creature'] for s in room.get('signals', []) + room.get('wildlife_pool', [])}
                self.assertEqual({c['id'] for c in scene['creatures']}, creatures)
                tiled = json.loads(tiled_path.read_text(encoding='utf-8'))
                self.assertEqual(converter.tiled_to_scene(tiled), scene)

                solid = scene['layers']['solid']
                for direction, (x, y) in scene['spawn'].items():
                    self.assertEqual(solid[y][x], '.', f'Spawn {direction} bloqueado en {rid}')
                for exit in scene['exits']:
                    x, y, width, height = exit['rect']
                    self.assertTrue(all(solid[cy][cx] == '.'
                                        for cy in range(y, y + height)
                                        for cx in range(x, x + width)), (rid, exit))

                for start in scene['spawn'].values():
                    seen = {tuple(start)}
                    queue = deque(seen)
                    while queue:
                        x, y = queue.popleft()
                        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                            if (0 <= nx < 20 and 0 <= ny < 15 and solid[ny][nx] == '.'
                                    and (nx, ny) not in seen):
                                seen.add((nx, ny))
                                queue.append((nx, ny))
                    for exit in scene['exits']:
                        x, y, width, height = exit['rect']
                        self.assertTrue(any((cx, cy) in seen
                                            for cy in range(y, y + height)
                                            for cx in range(x, x + width)), (rid, start, exit))
                    for actor in scene['npcs'] + scene['creatures']:
                        self.assertIn(tuple(actor['at']), seen, (rid, start, actor))

        boundaries = [
            ('lethra_ribera_seca', 'norte', 'veyra_hondonada_canales', 'sur'),
            ('lethra_hito_tierra', 'oeste', 'edran_puente_juncos', 'este'),
            ('lethra_relevo_raices', 'norte', 'nhal_ribera_relevo', 'sur'),
        ]
        for src, out_dir, dst, in_dir in boundaries:
            self.assertEqual(content.rooms[src]['exits'][out_dir], dst)
            self.assertEqual(content.rooms[dst]['exits'][in_dir], src)

    def test_nhal_complete_region_and_boundary_exits(self):
        from collections import deque
        import importlib.util
        root = Path(__file__).resolve().parents[1]
        content = Content(root / 'content')
        rooms = [rid for rid, room in content.rooms.items() if room.get('region') == 'nhal']
        self.assertEqual(len(rooms), 27)
        spec = importlib.util.spec_from_file_location('tiled_to_scene', root / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)

        for rid in rooms:
            scene_path = root / 'client-rpg/scenes' / f'{rid}.json'
            tiled_path = root / 'client-rpg/tiled' / f'{rid}.tmj'
            self.assertTrue(scene_path.is_file(), f'Falta escena {scene_path}')
            self.assertTrue(tiled_path.is_file(), f'Falta fuente Tiled {tiled_path}')
            scene = json.loads(scene_path.read_text(encoding='utf-8'))
            room = content.rooms[rid]
            with self.subTest(room=rid):
                self.assertEqual(scene['room'], rid)
                self.assertEqual({e['direction'] for e in scene['exits']}, set(room.get('exits', {})))
                self.assertEqual({n['id'] for n in scene['npcs']}, set(room.get('npcs', [])))
                creatures = {s['creature'] for s in room.get('signals', []) + room.get('wildlife_pool', [])}
                self.assertEqual({c['id'] for c in scene['creatures']}, creatures)
                tiled = json.loads(tiled_path.read_text(encoding='utf-8'))
                self.assertEqual(converter.tiled_to_scene(tiled), scene)

                solid = scene['layers']['solid']
                for direction, (x, y) in scene['spawn'].items():
                    self.assertEqual(solid[y][x], '.', f'Spawn {direction} bloqueado en {rid}')
                for exit in scene['exits']:
                    x, y, width, height = exit['rect']
                    self.assertTrue(all(solid[cy][cx] == '.'
                                        for cy in range(y, y + height)
                                        for cx in range(x, x + width)), (rid, exit))

                for start in scene['spawn'].values():
                    seen = {tuple(start)}
                    queue = deque(seen)
                    while queue:
                        x, y = queue.popleft()
                        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                            if (0 <= nx < 20 and 0 <= ny < 15 and solid[ny][nx] == '.'
                                    and (nx, ny) not in seen):
                                seen.add((nx, ny))
                                queue.append((nx, ny))
                    for exit in scene['exits']:
                        x, y, width, height = exit['rect']
                        self.assertTrue(any((cx, cy) in seen
                                            for cy in range(y, y + height)
                                            for cx in range(x, x + width)), (rid, start, exit))
                    for actor in scene['npcs'] + scene['creatures']:
                        self.assertIn(tuple(actor['at']), seen, (rid, start, actor))

        boundaries = [
            ('nhal_arbol_umbral', 'oeste', 'veyra_lindero_arboles', 'este'),
            ('nhal_relevo_altura', 'oeste', 'hoshai_estacion_cuerda', 'este'),
            ('nhal_ribera_relevo', 'sur', 'lethra_relevo_raices', 'norte'),
        ]
        for src, out_dir, dst, in_dir in boundaries:
            self.assertEqual(content.rooms[src]['exits'][out_dir], dst)
            self.assertEqual(content.rooms[dst]['exits'][in_dir], src)
