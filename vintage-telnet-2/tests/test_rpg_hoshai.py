"""Hoshai presentation preserves the authored world, including its three borders."""
from collections import deque
import importlib.util
import json
from pathlib import Path
import unittest

from server.content import Content
from tests import test_rpg_parity


ROOT = Path(__file__).resolve().parents[1]
OPPOSITE = {'norte': 'sur', 'sur': 'norte', 'este': 'oeste', 'oeste': 'este'}
BOUNDARIES = {
    ('hoshai_garganta_oeste', 'sur', 'korven_meseta_relevo'),
    ('hoshai_estribacion', 'sur', 'veyra_rampa_grava'),
    ('hoshai_estacion_cuerda', 'este', 'nhal_relevo_altura'),
}


class RpgHoshaiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.content = Content(ROOT / 'content')
        cls.rooms = {rid: room for rid, room in cls.content.rooms.items()
                     if room['region'] == 'hoshai'}

    def test_complete_scenes_entities_borders_and_tiled_sources(self):
        spec = importlib.util.spec_from_file_location('tiled', ROOT / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)
        self.assertEqual(len(self.rooms), 29)
        authored = {p.stem for p in (ROOT / 'client-rpg/scenes').glob('*.json')
                    if p.stem.startswith('hoshai_') or p.stem == 'khariel_centro'}
        self.assertEqual(authored, set(self.rooms))
        boundaries, npcs = set(), set()
        exit_count = 0
        for rid, room in self.rooms.items():
            with self.subTest(room=rid):
                scene = json.loads((ROOT / 'client-rpg/scenes' / f'{rid}.json').read_text())
                tiled = json.loads((ROOT / 'client-rpg/tiled' / f'{rid}.tmj').read_text())
                self.assertEqual(converter.tiled_to_scene(tiled), scene)
                self.assertEqual(converter.scene_to_tiled(scene), tiled)
                self.assertEqual(scene['room'], rid)
                self.assertEqual(scene['size'], [20, 15])
                self.assertEqual(scene['tile'], 16)
                self.assertEqual({e['direction'] for e in scene['exits']}, set(room['exits']))
                self.assertEqual(len(scene['exits']), len(room['exits']))
                self.assertTrue({'default', *room['exits']} <= set(scene['spawn']))
                self.assertEqual({n['id'] for n in scene['npcs']}, set(room.get('npcs', [])))
                fauna = {s['creature'] for s in room.get('signals', []) + room.get('wildlife_pool', [])}
                self.assertEqual({c['id'] for c in scene['creatures']}, fauna)
                npcs.update(n['id'] for n in scene['npcs'])
                actors = [tuple(a['at']) for a in scene['npcs'] + scene['creatures']]
                self.assertEqual(len(actors), len(set(actors)))
                self.assertFalse(set(actors) & {tuple(p) for p in scene['spawn'].values()})
                solid = scene['layers']['solid']
                portals = {(x, y) for e in scene['exits']
                           for x in range(e['rect'][0], e['rect'][0] + e['rect'][2])
                           for y in range(e['rect'][1], e['rect'][1] + e['rect'][3])}
                for y in range(15):
                    for x in range(20):
                        if x in (0, 19) or y in (0, 14):
                            self.assertEqual(solid[y][x] == '.', (x, y) in portals, (x, y))
                for direction, target in room['exits'].items():
                    self.assertEqual(self.content.rooms[target]['exits'][OPPOSITE[direction]], rid)
                    if target not in self.rooms:
                        boundaries.add((rid, direction, target))
                exit_count += len(scene['exits'])
        self.assertEqual(exit_count, 59)
        self.assertEqual(boundaries, BOUNDARIES)
        self.assertEqual(npcs, {'hoshai_daren', 'hoshai_luma', 'hoshai_yesa',
                               'hoshai_iria', 'hoshai_seran', 'hoshai_ena'})

    def test_all_rooms_and_exits_with_authoritative_actions(self):
        # Existing fixture: temporary SQLite, approved tester, fixed daytime.
        fixture = test_rpg_parity.RpgParityTests()
        self.addCleanup(fixture.doCleanups)
        fixture.setUp()

        def move(direction, target):
            state = fixture.act(fixture.offered('mover', direction))
            self.assertEqual(state['character']['location'], target)
            self.assertEqual(state['room']['id'], target)

        # Walk from Edran through Korven; never teleport into the new region.
        start = fixture.state()['character']['location']
        queue, seen = deque([(start, [])]), {start}
        while queue:
            rid, route = queue.popleft()
            if rid == 'korven_meseta_relevo':
                break
            for direction, target in self.content.rooms[rid]['exits'].items():
                if target not in seen:
                    seen.add(target)
                    queue.append((target, route + [(direction, target)]))
        else:
            self.fail('No route from Edran to the northern Korven border')
        for direction, target in route:
            move(direction, target)
        move('norte', 'hoshai_garganta_oeste')

        visited, crossed, talked = set(), set(), set()

        def visit(rid):
            visited.add(rid)
            # Exercise the HTTP scene route that the RPG uses; compare its data.
            with fixture.client.get(f'/client-rpg/scenes/{rid}.json') as response:
                self.assertEqual(response.status_code, 200)
                scene = response.json
            self.assertEqual(scene['room'], rid)
            self.assertEqual({e['direction'] for e in scene['exits']}, set(self.rooms[rid]['exits']))
            for npc in self.rooms[rid].get('npcs', []):
                actions = [a for a in fixture.state()['actions']
                           if a['id'] == 'hablar' and a.get('target') == npc and not a.get('disabled')]
                self.assertTrue(actions, npc)
                result = fixture.act({k: v for k, v in actions[0].items()
                                      if k in ('id', 'target', 'topic', 'confirmed')})
                self.assertTrue(result['narrative'], npc)
                talked.add(npc)
            for direction, target in self.rooms[rid]['exits'].items():
                move(direction, target)
                crossed.add((rid, direction, target))
                if target in self.rooms and target not in visited:
                    visit(target)
                move(OPPOSITE[direction], rid)

        visit('hoshai_garganta_oeste')
        self.assertEqual(visited, set(self.rooms))
        self.assertEqual(crossed, {(rid, d, t) for rid, room in self.rooms.items()
                                   for d, t in room['exits'].items()})
        self.assertTrue(BOUNDARIES <= crossed)
        self.assertEqual(len(talked), 6)
