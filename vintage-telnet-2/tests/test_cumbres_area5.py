"""Tests for Cumbres Veladas Area 5 (La Caldera del Primer Aliento)."""
import unittest
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine
from server import achievements

ROOT = Path(__file__).resolve().parents[1]

class CumbresArea5Tests(unittest.TestCase):
    def setUp(self):
        self.content = Content(ROOT / 'content')
        self.now = 100000
        self.engine = Engine(self.content, lambda: self.now)
        self.state = m.new_state('humano', 'arcano', 'home:humano', self.now)
        self.state['location'] = 'cumbres_descenso_crater'
        self.state.setdefault('examined', {})
        self.character = {'id': 1, 'name': 'UV.Diaz', 'species': 'humano', 'class_id': 'arcano', 'state': self.state}
        self.world = {'version': 0, 'flags': [], 'deaths': {}, 'weather': {}, 'encounters': {}, 'legends': {}}

    def test_walk_area5_rooms(self):
        rooms = [
            'cumbres_descenso_crater',
            'cumbres_ribera_lava_fria',
            'cumbres_hornos_creacion',
            'cumbres_lago_basalto',
            'cumbres_fosa_primordial',
            'cumbres_altar_termico',
            'cumbres_paso_dragon_blanco',
            'cumbres_camara_sabiduria',
            'cumbres_santuario_resuello',
            'cumbres_trono_caldera'
        ]
        for room_id in rooms:
            self.state['location'] = room_id
            room = self.engine.room(self.character, self.world)
            self.assertEqual(room['id'], room_id)
            self.assertTrue(room['name'])
            self.assertTrue(room['description'])

    def test_read_chapter_6_and_erudito_achievement(self):
        # Set flags for chapters 1 to 5
        for i in range(1, 6):
            self.state['flags'].append(f'leido_cronica_cumbres_{i}')

        self.state['location'] = 'cumbres_altar_termico'
        actions = self.engine.actions(self.character, self.world)
        leer6 = next((a for a in actions if a['id'] == 'leer_cronica_cumbres_6'), None)
        self.assertIsNotNone(leer6)
        self.engine.apply(self.character, self.world, {'id': 'leer_cronica_cumbres_6'})
        self.assertIn('leido_cronica_cumbres_6', self.state['flags'])
        self.assertTrue(any('profecía del pacto renovado' in j for j in self.state['journal']))

        # Now all 6 chapters are read -> erudito_cumbres achievement is automatically unlocked by apply()
        self.assertIn('erudito_cumbres', self.state['achievements'])
        self.assertTrue(any('Nuevo logro: Erudito de las Cumbres' in ev['text'] for ev in self.state.get('events', [])))

    def test_mystery_resuello_compartido_closure(self):
        self.state['location'] = 'cumbres_santuario_resuello'
        self.state['examined'].setdefault('cumbres_santuario_resuello', []).append('poza_resuello')

        actions = self.engine.actions(self.character, self.world)
        meditar = next((a for a in actions if a['id'] == 'cumbres_meditar_resuello_compartido'), None)
        self.assertIsNotNone(meditar)

        self.engine.apply(self.character, self.world, {'id': 'cumbres_meditar_resuello_compartido'})
        self.assertIn('misterio_caldera_resuelto', self.state['flags'])
        self.assertTrue(any('Cierre:' in j for j in self.state['journal']))
        self.assertTrue(any(i['id'] == 'fragmento_primer_aliento' for i in self.state['inventory']))

    def test_boss_archidragon_ignis_aethel_victory_and_legend(self):
        self.state['location'] = 'cumbres_trono_caldera'
        self.state['level'] = 35
        combat = {
            'creature': 'archidragon_ignis_aethel',
            'profile': m.PROFILES['archidragon_ignis_aethel'],
            'round': 1,
            'hp': 10
        }
        self.state['combat'] = combat
        creature = self.content.creatures['archidragon_ignis_aethel']

        self.engine.victory(self.character, self.world, combat, creature)
        self.assertIn('victoria:cumbres_trono_caldera:archidragon_ignis_aethel', self.state['flags'])
        self.assertIn('cumbres_primer_aliento_renovado', self.state['flags'])

        # Check legend recorded
        self.assertIn('archidragon_ignis_aethel', self.world['legends'])
        self.assertEqual(self.world['legends']['archidragon_ignis_aethel']['by'], ['UV.Diaz'])

        # Check boss achievement
        unlocked = achievements.update(self.state, self.content, self.world)
        unlocked_ids = {u['id'] for u in unlocked}
        self.assertIn('jefe_ignis_aethel', unlocked_ids)

if __name__ == '__main__':
    unittest.main()
