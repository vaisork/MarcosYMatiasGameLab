"""Tests for Cumbres Veladas Area 2 (La Ciudadela de los Nidos / Riscos de Vhis)."""
import unittest
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine
from server import achievements

ROOT = Path(__file__).resolve().parents[1]

class CumbresArea2Tests(unittest.TestCase):
    def setUp(self):
        self.content = Content(ROOT / 'content')
        self.now = 100000
        self.engine = Engine(self.content, lambda: self.now)
        self.state = m.new_state('humano', 'arcano', 'home:humano', self.now)
        self.state['location'] = 'cumbres_plaza_escamas'
        self.state.setdefault('examined', {})
        self.character = {'id': 1, 'name': 'UV.Diaz', 'species': 'humano', 'class_id': 'arcano', 'state': self.state}
        self.world = {'version': 0, 'flags': [], 'deaths': {}, 'weather': {}, 'encounters': {}, 'legends': {}}

    def test_walk_area2_rooms(self):
        rooms = [
            'cumbres_balcon_vhis',
            'cumbres_terrazas_vuelo',
            'cumbres_galeria_resonadores',
            'cumbres_nidos_altos',
            'cumbres_plaza_escamas',
            'cumbres_taller_basalto',
            'cumbres_bastion_termico',
            'cumbres_residencia_pyrrok',
            'cumbres_puerta_clanes',
            'cumbres_salon_ceniza'
        ]
        for room_id in rooms:
            self.state['location'] = room_id
            room = self.engine.room(self.character, self.world)
            self.assertEqual(room['id'], room_id)
            self.assertTrue(room['name'])
            self.assertTrue(room['description'])

    def test_npcs_dialogue_in_area2(self):
        # Vhis-Kael at plaza
        self.state['location'] = 'cumbres_plaza_escamas'
        actions = self.engine.actions(self.character, self.world)
        hablar = next((a for a in actions if a['id'] == 'hablar' and a.get('target') == 'cumbres_vhis_kael'), None)
        self.assertIsNotNone(hablar)

        # Artifice at taller
        self.state['location'] = 'cumbres_taller_basalto'
        actions = self.engine.actions(self.character, self.world)
        hablar_art = next((a for a in actions if a['id'] == 'hablar' and a.get('target') == 'cumbres_artifice_pyrrok'), None)
        self.assertIsNotNone(hablar_art)

    def test_mystery_valvula_ciudadela_closure(self):
        self.state['location'] = 'cumbres_bastion_termico'
        self.state['examined'].setdefault('cumbres_bastion_termico', []).append('valvula')

        actions = self.engine.actions(self.character, self.world)
        calibrar = next((a for a in actions if a['id'] == 'cumbres_calibrar_valvula_ciudadela'), None)
        self.assertIsNotNone(calibrar)

        self.engine.apply(self.character, self.world, {'id': 'cumbres_calibrar_valvula_ciudadela'})
        self.assertIn('misterio_ciudadela_resuelto', self.state['flags'])
        self.assertTrue(any('Cierre:' in j for j in self.state['journal']))
        self.assertTrue(any(i['id'] == 'lingote_basalto_caliente' for i in self.state['inventory']))

    def test_boss_vaelok_forjador_victory_and_legend(self):
        self.state['location'] = 'cumbres_salon_ceniza'
        self.state['level'] = 25
        combat = {
            'creature': 'vaelok_forjador',
            'profile': m.PROFILES['vaelok_forjador'],
            'round': 1,
            'hp': 10
        }
        self.state['combat'] = combat
        creature = self.content.creatures['vaelok_forjador']

        self.engine.victory(self.character, self.world, combat, creature)
        self.assertIn('victoria:cumbres_salon_ceniza:vaelok_forjador', self.state['flags'])
        self.assertIn('cumbres_puerta_archivo_abierta', self.state['flags'])

        # Check legend recorded
        self.assertIn('vaelok_forjador', self.world['legends'])
        self.assertEqual(self.world['legends']['vaelok_forjador']['by'], ['UV.Diaz'])

        # Check boss achievement
        unlocked = achievements.update(self.state, self.content, self.world)
        unlocked_ids = {u['id'] for u in unlocked}
        self.assertIn('jefe_vaelok', unlocked_ids)

if __name__ == '__main__':
    unittest.main()
