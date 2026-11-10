"""Tests for Cumbres Veladas Delivery 1 (Area 1: Bosque de las Fumarolas y Túnel de entrada)."""
import unittest
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine
from server import achievements

ROOT = Path(__file__).resolve().parents[1]

class CumbresEntrega1Tests(unittest.TestCase):
    def setUp(self):
        self.content = Content(ROOT / 'content')
        self.now = 100000
        self.engine = Engine(self.content, lambda: self.now)
        self.state = m.new_state('humano', 'arcano', 'home:humano', self.now)
        self.state['location'] = 'hoshai_senda_dosel'
        self.state.setdefault('examined', {})
        self.character = {'id': 1, 'name': 'UV.Diaz', 'species': 'humano', 'class_id': 'arcano', 'state': self.state}
        self.world = {'version': 0, 'flags': [], 'deaths': {}, 'weather': {}, 'encounters': {}, 'legends': {}}

    def test_hoshai_senda_dosel_exit_gate_requires_discovery(self):
        # North exit should be gated initially
        actions = self.engine.actions(self.character, self.world)
        mover_norte = next((a for a in actions if a['id'] == 'mover' and a.get('target') == 'norte'), None)
        self.assertIsNotNone(mover_norte)
        self.assertTrue(mover_norte.get('disabled'))

        # Discovering via examining hendidura_norte
        self.state['examined'].setdefault('hoshai_senda_dosel', []).append('hendidura_norte')
        actions = self.engine.actions(self.character, self.world)
        observar_action = next((a for a in actions if a['id'] == 'observar_hendidura_cumbres'), None)
        self.assertIsNotNone(observar_action)

        self.engine.apply(self.character, self.world, {'id': 'observar_hendidura_cumbres'})
        self.assertIn('velo_cumbres_descubierto', self.state['flags'])

        # Now the north exit is open
        actions = self.engine.actions(self.character, self.world)
        mover_norte = next((a for a in actions if a['id'] == 'mover' and a.get('target') == 'norte'), None)
        self.assertFalse(mover_norte.get('disabled'))

    def test_discovery_via_escama_dragon(self):
        self.state['inventory'].append({'id': 'escama_dragon', 'name': 'Escama de dragón', 'catalog_id': 'escama_dragon', 'quantity': 1})
        actions = self.engine.actions(self.character, self.world)
        descubrir = next((a for a in actions if a['id'] == 'descubrir_paso_escamas_dragon'), None)
        self.assertIsNotNone(descubrir)

        self.engine.apply(self.character, self.world, {'id': 'descubrir_paso_escamas_dragon'})
        self.assertIn('velo_cumbres_descubierto', self.state['flags'])
        self.assertIn('cumbres_descubiertas', self.state['flags'])

    def test_achievement_tras_el_velo_de_las_cumbres(self):
        self.state['flags'].append('velo_cumbres_descubierto')
        self.state['flags'].append('cumbres_descubiertas')
        unlocked = achievements.update(self.state, self.content, self.world)
        unlocked_ids = {u['id'] for u in unlocked}
        self.assertIn('cumbres_descubiertas', unlocked_ids)
        self.assertIn('cumbres_descubiertas', self.state['achievements'])

    def test_walk_area1_rooms(self):
        # Test navigation across all 10 rooms of Area 1
        path = [
            'cumbres_paso_escamas',
            'cumbres_tunel_basalto',
            'cumbres_desfiladero_ciego',
            'cumbres_bosque_fumarolas',
            'cumbres_claros_azufre',
            'cumbres_pilares_rotos',
            'cumbres_grieta_menor',
            'cumbres_refugio_ceniza',
            'cumbres_manantial_tibio',
            'cumbres_bosque_fumarolas',
            'cumbres_grieta_menor',
            'cumbres_umbral_riscos'
        ]
        self.state['flags'].append('velo_cumbres_descubierto')
        for room_id in path:
            self.state['location'] = room_id
            room = self.engine.room(self.character, self.world)
            self.assertEqual(room['id'], room_id)
            self.assertTrue(room['name'])
            self.assertTrue(room['description'])

    def test_read_chronicle_chapters_1_and_2(self):
        # Read Chapter 1 at refugio
        self.state['location'] = 'cumbres_refugio_ceniza'
        actions = self.engine.actions(self.character, self.world)
        leer1 = next((a for a in actions if a['id'] == 'leer_cronica_cumbres_1'), None)
        self.assertIsNotNone(leer1)
        self.engine.apply(self.character, self.world, {'id': 'leer_cronica_cumbres_1'})
        self.assertIn('leido_cronica_cumbres_1', self.state['flags'])
        self.assertTrue(any('Aliento firme, piedra templada' in j for j in self.state['journal']))

        # Read Chapter 2 at grieta menor
        self.state['location'] = 'cumbres_grieta_menor'
        actions = self.engine.actions(self.character, self.world)
        leer2 = next((a for a in actions if a['id'] == 'leer_cronica_cumbres_2'), None)
        self.assertIsNotNone(leer2)
        self.engine.apply(self.character, self.world, {'id': 'leer_cronica_cumbres_2'})
        self.assertIn('leido_cronica_cumbres_2', self.state['flags'])
        self.assertTrue(any('Forja de la Escama Viva' in j for j in self.state['journal']))

    def test_mystery_hornacina_azufre_closure(self):
        self.state['location'] = 'cumbres_pilares_rotos'
        self.state['examined'].setdefault('cumbres_pilares_rotos', []).append('hornacina')

        actions = self.engine.actions(self.character, self.world)
        alinear = next((a for a in actions if a['id'] == 'cumbres_alinear_respiradero_hornacina'), None)
        self.assertIsNotNone(alinear)

        xp_before = self.state['xp']
        self.engine.apply(self.character, self.world, {'id': 'cumbres_alinear_respiradero_hornacina'})
        self.assertIn('misterio_fumarolas_resuelto', self.state['flags'])
        self.assertTrue(any(j.startswith('Cierre:') for j in self.state['journal']))
        # Give items received
        self.assertTrue(any(i['id'] == 'lingote_basalto_caliente' for i in self.state['inventory']))

    def test_boss_ceniciento_alado_victory_and_legend(self):
        self.state['location'] = 'cumbres_umbral_riscos'
        self.state['level'] = 22
        combat = {
            'creature': 'ceniciento_alado',
            'profile': m.PROFILES['ceniciento_alado'],
            'round': 1,
            'hp': 10
        }
        self.state['combat'] = combat
        creature = self.content.creatures['ceniciento_alado']

        self.engine.victory(self.character, self.world, combat, creature)
        self.assertIn('victoria:cumbres_umbral_riscos:ceniciento_alado', self.state['flags'])
        self.assertIn('cumbres_umbral_despejado', self.state['flags'])

        # Check legend recorded in world
        self.assertIn('ceniciento_alado', self.world['legends'])
        self.assertEqual(self.world['legends']['ceniciento_alado']['by'], ['UV.Diaz'])

        # Check legend is narrated when visiting the room
        narrative = self.engine.narrative(self.character, self.world, 'mirar')
        self.assertTrue(any('Aquí UV.Diaz venció a Ceniciento Alado' in ev['text'] for ev in narrative))

        # Check boss achievement
        unlocked = achievements.update(self.state, self.content, self.world)
        unlocked_ids = {u['id'] for u in unlocked}
        self.assertIn('jefe_ceniciento', unlocked_ids)

if __name__ == '__main__':
    unittest.main()
