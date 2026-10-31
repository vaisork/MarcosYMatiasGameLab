"""Veyra scenes preserve the authored exits and keep every route walkable."""
from collections import deque
import importlib.util
import json
from pathlib import Path
import unittest

from server.content import Content


ROOT = Path(__file__).resolve().parents[1]
OPPOSITE = {'norte': 'sur', 'sur': 'norte', 'este': 'oeste', 'oeste': 'este'}
BOUNDARIES = {
    ('veyra_puerta_campos', 'sur', 'edran_hito_campos'),
    ('veyra_pastos_exteriores', 'oeste', 'edran_vista_cuenca'),
    ('veyra_rampa_grava', 'norte', 'hoshai_estribacion'),
    ('veyra_terraplen_roca', 'oeste', 'korven_loma_cascajo'),
    ('veyra_hondonada_canales', 'sur', 'lethra_ribera_seca'),
    ('veyra_lindero_arboles', 'este', 'nhal_arbol_umbral'),
}
ILLUSTRATED = {
    'vaisgard_mercado', 'veyra_acequia_exterior', 'veyra_archivo_cargas',
    'veyra_barrio_cargas', 'veyra_calle_toldos', 'veyra_cantera_callada',
    'veyra_colina_vista', 'veyra_hondonada_canales', 'veyra_huerta_baja',
    'veyra_lindero_arboles',
}


class RpgVeyraTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.content = Content(ROOT / 'content')
        cls.rooms = {rid: room for rid, room in cls.content.rooms.items()
                     if room['region'] == 'veyra'}

    def test_complete_scenes_entities_borders_and_tiled_sources(self):
        spec = importlib.util.spec_from_file_location('tiled', ROOT / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)
        self.assertEqual(len(self.rooms), 32)
        authored = {p.stem for p in (ROOT / 'client-rpg/scenes').glob('*.json')
                    if p.stem.startswith('veyra_') or p.stem == 'vaisgard_mercado'}
        self.assertEqual(authored, set(self.rooms))
        boundaries, asymmetric, npcs = set(), set(), set()
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
                expected_background = f'backgrounds/{rid}.webp' if rid in ILLUSTRATED else None
                self.assertEqual(scene.get('background'), expected_background)
                if expected_background:
                    self.assertTrue((ROOT / 'client-rpg' / expected_background).is_file())
                self.assertEqual({e['direction'] for e in scene['exits']}, set(room['exits']))
                self.assertEqual(len(scene['exits']), len(room['exits']))
                self.assertEqual(set(scene['spawn']), {'default', *room['exits']})
                self.assertEqual({n['id'] for n in scene['npcs']}, set(room.get('npcs', [])))
                fauna = {s['creature'] for s in room.get('signals', []) + room.get('wildlife_pool', [])}
                self.assertEqual({c['id'] for c in scene['creatures']}, fauna)
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
                            self.assertEqual(solid[y][x] == '.', (x, y) in portals, (rid, x, y))
                for direction, target in room['exits'].items():
                    if self.content.rooms[target]['exits'].get(OPPOSITE[direction]) != rid:
                        asymmetric.add((rid, direction, target))
                    if target not in self.rooms:
                        self.assertEqual(self.content.rooms[target]['exits'][OPPOSITE[direction]], rid)
                        boundaries.add((rid, direction, target))
                for start in scene['spawn'].values():
                    seen = {tuple(start)}
                    queue = deque(seen)
                    while queue:
                        x, y = queue.popleft()
                        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                            if 0 <= nx < 20 and 0 <= ny < 15 and solid[ny][nx] == '.' and (nx, ny) not in seen:
                                seen.add((nx, ny))
                                queue.append((nx, ny))
                    for exit in scene['exits']:
                        x, y, width, height = exit['rect']
                        self.assertTrue(any((cx, cy) in seen
                                            for cy in range(y, y + height)
                                            for cx in range(x, x + width)), (rid, start, exit))
                    for actor in scene['npcs'] + scene['creatures']:
                        self.assertIn(tuple(actor['at']), seen, (rid, start, actor))
                npcs.update(n['id'] for n in scene['npcs'])
                exit_count += len(scene['exits'])
        self.assertEqual(exit_count, 73)
        self.assertEqual(boundaries, BOUNDARIES)
        self.assertEqual(asymmetric, {
            ('veyra_mazmorra_recorridos_fin', 'este', 'veyra_acequia_exterior'),
        })
        self.assertEqual(npcs, {'veyra_arel', 'veyra_bela', 'veyra_doma',
                               'veyra_nera', 'veyra_seli', 'veyra_tov'})

    def test_bastion_dragon_scene_keeps_server_state_authoritative(self):
        room_id = 'veyra_mazmorra_boveda_guardian'
        scene = json.loads((ROOT / 'client-rpg/scenes' / f'{room_id}.json').read_text())
        room = self.rooms[room_id]
        self.assertIn({'id': 'dragon_aguas_antiguas', 'at': [6, 6]}, scene['creatures'])
        self.assertEqual(room['exits']['norte'], 'veyra_mazmorra_recorridos_fin')
        self.assertEqual(room['exit_requirements']['norte']['requires_flags'], ['dragon_vencido'])
        signal = next(s for s in room['signals'] if s['creature'] == 'dragon_aguas_antiguas')
        self.assertIn('dragon_vencido', signal['forbids_flags'])
        state = next(s for s in room['states'] if 'dragon_vencido' in s['requires_flags'])
        self.assertEqual(state['overrides']['art_variant'], 'agua-libre')
