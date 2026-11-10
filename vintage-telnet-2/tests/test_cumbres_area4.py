"""Tests for Cumbres Veladas Area 4 (Las Rutas de las Cumbres y Desfiladeros Celestes)."""
import unittest
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine
from server import achievements

ROOT = Path(__file__).resolve().parents[1]

class CumbresArea4Tests(unittest.TestCase):
    def setUp(self):
        self.content = Content(ROOT / 'content')
        self.now = 100000
        self.engine = Engine(self.content, lambda: self.now)
        self.state = m.new_state('humano', 'arcano', 'home:humano', self.now)
        self.state['location'] = 'cumbres_ascenso_crestas'
        self.state.setdefault('examined', {})
        self.character = {'id': 1, 'name': 'UV.Diaz', 'species': 'humano', 'class_id': 'arcano', 'state': self.state}
        self.world = {'version': 0, 'flags': [], 'deaths': {}, 'weather': {}, 'encounters': {}, 'legends': {}}

    def test_walk_area4_rooms(self):
        rooms = [
            'cumbres_ascenso_crestas',
            'cumbres_paso_torbellinos',
            'cumbres_cornisa_aethelgard',
            'cumbres_baluarte_viento',
            'cumbres_nido_nubes',
            'cumbres_espolon_helado',
            'cumbres_aguja_relampago',
            'cumbres_puente_hielo_ceniza',
            'cumbres_mirador_vaisgard',
            'cumbres_puerta_falla'
        ]
        for room_id in rooms:
            self.state['location'] = room_id
            room = self.engine.room(self.character, self.world)
            self.assertEqual(room['id'], room_id)
            self.assertTrue(room['name'])
            self.assertTrue(room['description'])

    def test_read_chapter_5(self):
        self.state['location'] = 'cumbres_cornisa_aethelgard'
        actions = self.engine.actions(self.character, self.world)
        leer5 = next((a for a in actions if a['id'] == 'leer_cronica_cumbres_5'), None)
        self.assertIsNotNone(leer5)
        self.engine.apply(self.character, self.world, {'id': 'leer_cronica_cumbres_5'})
        self.assertIn('leido_cronica_cumbres_5', self.state['flags'])
        self.assertTrue(any('testigo oculto' in j for j in self.state['journal']))

    def test_mystery_baluarte_viento_closure(self):
        self.state['location'] = 'cumbres_baluarte_viento'
        self.state['examined'].setdefault('cumbres_baluarte_viento', []).append('clavija')

        actions = self.engine.actions(self.character, self.world)
        anclar = next((a for a in actions if a['id'] == 'cumbres_anclar_cadenas_baluarte'), None)
        self.assertIsNotNone(anclar)

        self.engine.apply(self.character, self.world, {'id': 'cumbres_anclar_cadenas_baluarte'})
        self.assertIn('misterio_rutas_resuelto', self.state['flags'])
        self.assertTrue(any('Cierre:' in j for j in self.state['journal']))
        self.assertTrue(any(i['id'] == 'cristal_ventisca_zephyros' for i in self.state['inventory']))

    def test_boss_zephyros_ventisca_victory_and_legend(self):
        self.state['location'] = 'cumbres_puerta_falla'
        self.state['level'] = 31
        combat = {
            'creature': 'zephyros_ventisca',
            'profile': m.PROFILES['zephyros_ventisca'],
            'round': 1,
            'hp': 10
        }
        self.state['combat'] = combat
        creature = self.content.creatures['zephyros_ventisca']

        self.engine.victory(self.character, self.world, combat, creature)
        self.assertIn('victoria:cumbres_puerta_falla:zephyros_ventisca', self.state['flags'])
        self.assertIn('cumbres_ventisca_superada', self.state['flags'])

        # Check legend recorded
        self.assertIn('zephyros_ventisca', self.world['legends'])
        self.assertEqual(self.world['legends']['zephyros_ventisca']['by'], ['UV.Diaz'])

        # Check boss achievement
        unlocked = achievements.update(self.state, self.content, self.world)
        unlocked_ids = {u['id'] for u in unlocked}
        self.assertIn('jefe_zephyros', unlocked_ids)

if __name__ == '__main__':
    unittest.main()
