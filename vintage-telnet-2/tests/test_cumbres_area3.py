"""Tests for Cumbres Veladas Area 3 (El Archivo de las Cinco Edades)."""
import unittest
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine
from server import achievements

ROOT = Path(__file__).resolve().parents[1]

class CumbresArea3Tests(unittest.TestCase):
    def setUp(self):
        self.content = Content(ROOT / 'content')
        self.now = 100000
        self.engine = Engine(self.content, lambda: self.now)
        self.state = m.new_state('humano', 'arcano', 'home:humano', self.now)
        self.state['location'] = 'cumbres_atrio_edades'
        self.state.setdefault('examined', {})
        self.character = {'id': 1, 'name': 'UV.Diaz', 'species': 'humano', 'class_id': 'arcano', 'state': self.state}
        self.world = {'version': 0, 'flags': [], 'deaths': {}, 'weather': {}, 'encounters': {}, 'legends': {}}

    def test_walk_area3_rooms(self):
        rooms = [
            'cumbres_atrio_edades',
            'cumbres_galeria_primera_edad',
            'cumbres_galeria_segunda_edad',
            'cumbres_ala_ecos_quellor',
            'cumbres_sala_prismas',
            'cumbres_hornacina_tratados',
            'cumbres_terraza_observador',
            'cumbres_boveda_dorada',
            'cumbres_cripta_sabios',
            'cumbres_santuario_escriba'
        ]
        for room_id in rooms:
            self.state['location'] = room_id
            room = self.engine.room(self.character, self.world)
            self.assertEqual(room['id'], room_id)
            self.assertTrue(room['name'])
            self.assertTrue(room['description'])

    def test_read_chapters_3_and_4(self):
        # Read Chapter 3 at galeria primera edad
        self.state['location'] = 'cumbres_galeria_primera_edad'
        actions = self.engine.actions(self.character, self.world)
        leer3 = next((a for a in actions if a['id'] == 'leer_cronica_cumbres_3'), None)
        self.assertIsNotNone(leer3)
        self.engine.apply(self.character, self.world, {'id': 'leer_cronica_cumbres_3'})
        self.assertIn('leido_cronica_cumbres_3', self.state['flags'])
        self.assertTrue(any('cinco corrientes eólicas' in j for j in self.state['journal']))

        # Read Chapter 4 at ala de los ecos de quellor
        self.state['location'] = 'cumbres_ala_ecos_quellor'
        actions = self.engine.actions(self.character, self.world)
        leer4 = next((a for a in actions if a['id'] == 'leer_cronica_cumbres_4'), None)
        self.assertIsNotNone(leer4)
        self.engine.apply(self.character, self.world, {'id': 'leer_cronica_cumbres_4'})
        self.assertIn('leido_cronica_cumbres_4', self.state['flags'])
        self.assertTrue(any('Dragón de las Aguas en Veyra' in j for j in self.state['journal']))

    def test_mystery_prismas_astronomicos_closure(self):
        self.state['location'] = 'cumbres_sala_prismas'
        self.state['examined'].setdefault('cumbres_sala_prismas', []).append('prismas')

        actions = self.engine.actions(self.character, self.world)
        alinear = next((a for a in actions if a['id'] == 'cumbres_alinear_prismas_astronomicos'), None)
        self.assertIsNotNone(alinear)

        self.engine.apply(self.character, self.world, {'id': 'cumbres_alinear_prismas_astronomicos'})
        self.assertIn('misterio_archivo_resuelto', self.state['flags'])
        self.assertTrue(any('Cierre:' in j for j in self.state['journal']))
        self.assertTrue(any(i['id'] == 'nucleo_runico_basalto' for i in self.state['inventory']))

    def test_boss_oros_khar_escriba_victory_and_legend(self):
        self.state['location'] = 'cumbres_santuario_escriba'
        self.state['level'] = 28
        combat = {
            'creature': 'oros_khar_escriba',
            'profile': m.PROFILES['oros_khar_escriba'],
            'round': 1,
            'hp': 10
        }
        self.state['combat'] = combat
        creature = self.content.creatures['oros_khar_escriba']

        self.engine.victory(self.character, self.world, combat, creature)
        self.assertIn('victoria:cumbres_santuario_escriba:oros_khar_escriba', self.state['flags'])
        self.assertIn('cumbres_archivo_superado', self.state['flags'])

        # Check legend recorded
        self.assertIn('oros_khar_escriba', self.world['legends'])
        self.assertEqual(self.world['legends']['oros_khar_escriba']['by'], ['UV.Diaz'])

        # Check boss achievement
        unlocked = achievements.update(self.state, self.content, self.world)
        unlocked_ids = {u['id'] for u in unlocked}
        self.assertIn('jefe_oros_khar', unlocked_ids)

if __name__ == '__main__':
    unittest.main()
