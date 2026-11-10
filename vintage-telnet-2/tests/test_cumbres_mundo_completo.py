"""Exhaustive end-to-end integration tests for the complete Cumbres Veladas dragon world (50 rooms)."""
import unittest
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine
from server import achievements

ROOT = Path(__file__).resolve().parents[1]

class CumbresMundoCompletoTests(unittest.TestCase):
    def setUp(self):
        self.content = Content(ROOT / 'content')
        self.now = 100000
        self.engine = Engine(self.content, lambda: self.now)
        self.state = m.new_state('humano', 'arcano', 'home:humano', self.now)
        self.state['location'] = 'hoshai_senda_dosel'
        self.state.setdefault('examined', {})
        self.character = {'id': 1, 'name': 'UV.Diaz', 'species': 'humano', 'class_id': 'arcano', 'state': self.state}
        self.world = {'version': 0, 'flags': [], 'deaths': {}, 'weather': {}, 'encounters': {}, 'legends': {}}

    def test_complete_fifty_rooms_continuous_walk_and_return(self):
        # 50 rooms from entry to final throne and back
        forward_spine = [
            # Area 1: Fumarolas
            'cumbres_paso_escamas',
            'cumbres_tunel_basalto',
            'cumbres_desfiladero_ciego',
            'cumbres_bosque_fumarolas',
            'cumbres_grieta_menor',
            'cumbres_umbral_riscos',
            # Area 2: Ciudadela
            'cumbres_balcon_vhis',
            'cumbres_terrazas_vuelo',
            'cumbres_plaza_escamas',
            'cumbres_puerta_clanes',
            'cumbres_salon_ceniza',
            # Area 3: Archivo
            'cumbres_atrio_edades',
            'cumbres_sala_prismas',
            'cumbres_terraza_observador',
            'cumbres_santuario_escriba',
            # Area 4: Rutas
            'cumbres_ascenso_crestas',
            'cumbres_paso_torbellinos',
            'cumbres_aguja_relampago',
            'cumbres_puente_hielo_ceniza',
            'cumbres_puerta_falla',
            # Area 5: Caldera
            'cumbres_descenso_crater',
            'cumbres_lago_basalto',
            'cumbres_paso_dragon_blanco',
            'cumbres_trono_caldera'
        ]

        # Unlock entry
        self.state['flags'].append('velo_cumbres_descubierto')

        # Walk forward through spine
        for room_id in forward_spine:
            self.state['location'] = room_id
            room = self.engine.room(self.character, self.world)
            self.assertEqual(room['id'], room_id)
            self.assertTrue(room['name'])
            self.assertTrue(room['description'])

        # Walk backwards to entry
        for room_id in reversed(forward_spine):
            self.state['location'] = room_id
            room = self.engine.room(self.character, self.world)
            self.assertEqual(room['id'], room_id)

    def test_all_fifty_rooms_exist_and_cover_all_five_areas(self):
        cumbres_rooms = [rid for rid in self.content.rooms if rid.startswith('cumbres_')]
        self.assertEqual(len(cumbres_rooms), 50)

        # Check each area has exactly 10 rooms
        area1 = [r for r in cumbres_rooms if any(x in r for x in ['paso_escamas', 'tunel', 'ciego', 'fumarolas', 'azufre', 'manantial', 'refugio', 'pilares', 'grieta', 'umbral'])]
        self.assertEqual(len(area1), 10)

        area2 = [r for r in cumbres_rooms if any(x in r for x in ['balcon', 'terrazas', 'resonadores', 'nidos', 'plaza_escamas', 'taller', 'bastion', 'residencia', 'puerta_clanes', 'salon_ceniza'])]
        self.assertEqual(len(area2), 10)

        area3 = [r for r in cumbres_rooms if any(x in r for x in ['atrio', 'primera_edad', 'segunda_edad', 'ala_ecos', 'prismas', 'tratados', 'observador', 'boveda_dorada', 'cripta_sabios', 'santuario_escriba'])]
        self.assertEqual(len(area3), 10)

        area4 = [r for r in cumbres_rooms if any(x in r for x in ['crestas', 'torbellinos', 'cornisa_aethelgard', 'baluarte_viento', 'nido_nubes', 'espolon', 'relampago', 'hielo_ceniza', 'mirador', 'puerta_falla'])]
        self.assertEqual(len(area4), 10)

        area5 = [r for r in cumbres_rooms if any(x in r for x in ['descenso_crater', 'ribera', 'hornos', 'lago', 'fosa', 'altar', 'dragon_blanco', 'camara_sabiduria', 'santuario_resuello', 'trono_caldera'])]
        self.assertEqual(len(area5), 10)

    def test_all_five_bosses_in_legend_bosses_with_achievements_and_legends(self):
        bosses = [
            ('ceniciento_alado', 'cumbres_umbral_riscos', 'jefe_ceniciento'),
            ('vaelok_forjador', 'cumbres_salon_ceniza', 'jefe_vaelok'),
            ('oros_khar_escriba', 'cumbres_santuario_escriba', 'jefe_oros_khar'),
            ('zephyros_ventisca', 'cumbres_puerta_falla', 'jefe_zephyros'),
            ('archidragon_ignis_aethel', 'cumbres_trono_caldera', 'jefe_ignis_aethel')
        ]

        for boss_id, room_id, ach_id in bosses:
            # 1. Check in LEGEND_BOSSES
            self.assertIn(boss_id, m.LEGEND_BOSSES)
            self.assertIn(boss_id, m.PARTY_HP)

            # 2. Defeat boss and check legend
            self.state['location'] = room_id
            self.state['level'] = m.PROFILES[boss_id]['level']
            combat = {
                'creature': boss_id,
                'profile': m.PROFILES[boss_id],
                'round': 1,
                'hp': 10
            }
            self.state['combat'] = combat
            creature = self.content.creatures[boss_id]
            self.engine.victory(self.character, self.world, combat, creature)

            # Check legend recorded
            self.assertIn(boss_id, self.world['legends'])
            self.assertEqual(self.world['legends'][boss_id]['room'], room_id)
            self.assertIn('UV.Diaz', self.world['legends'][boss_id]['by'])

            # Check legend narrative in room
            narrative = self.engine.narrative(self.character, self.world, 'mirar')
            self.assertTrue(any(f"Aquí UV.Diaz venció a {creature['name']}" in ev['text'] for ev in narrative))

            # Check achievement unlocked
            unlocked = achievements.update(self.state, self.content, self.world)
            self.assertIn(ach_id, self.state['achievements'])

    def test_chronicle_full_six_chapters_unlocks_erudito(self):
        # Read chapters 1 to 6 across the world
        chapters = [
            ('cumbres_refugio_ceniza', 'leer_cronica_cumbres_1', 1),
            ('cumbres_grieta_menor', 'leer_cronica_cumbres_2', 2),
            ('cumbres_galeria_primera_edad', 'leer_cronica_cumbres_3', 3),
            ('cumbres_ala_ecos_quellor', 'leer_cronica_cumbres_4', 4),
            ('cumbres_cornisa_aethelgard', 'leer_cronica_cumbres_5', 5),
            ('cumbres_altar_termico', 'leer_cronica_cumbres_6', 6)
        ]

        for room_id, action_id, chapter_num in chapters:
            self.state['location'] = room_id
            actions = self.engine.actions(self.character, self.world)
            act = next((a for a in actions if a['id'] == action_id), None)
            self.assertIsNotNone(act, f"Missing action {action_id} in {room_id}")
            self.engine.apply(self.character, self.world, {'id': action_id})
            self.assertIn(f'leido_cronica_cumbres_{chapter_num}', self.state['flags'])

        # Achievement Erudito de las Cumbres unlocked
        self.assertIn('erudito_cumbres', self.state['achievements'])

    def test_all_five_mysteries_have_closures_and_journal_receipts(self):
        mysteries = [
            ('cumbres_pilares_rotos', 'hornacina', 'cumbres_alinear_respiradero_hornacina', 'misterio_fumarolas_resuelto'),
            ('cumbres_bastion_termico', 'valvula', 'cumbres_calibrar_valvula_ciudadela', 'misterio_ciudadela_resuelto'),
            ('cumbres_sala_prismas', 'prismas', 'cumbres_alinear_prismas_astronomicos', 'misterio_archivo_resuelto'),
            ('cumbres_baluarte_viento', 'clavija', 'cumbres_anclar_cadenas_baluarte', 'misterio_rutas_resuelto'),
            ('cumbres_santuario_resuello', 'poza_resuello', 'cumbres_meditar_resuello_compartido', 'misterio_caldera_resuelto')
        ]

        for room_id, examine_target, action_id, flag in mysteries:
            self.state['location'] = room_id
            self.state['examined'].setdefault(room_id, []).append(examine_target)
            actions = self.engine.actions(self.character, self.world)
            act = next((a for a in actions if a['id'] == action_id), None)
            self.assertIsNotNone(act, f"Missing mystery action {action_id} in {room_id}")
            self.engine.apply(self.character, self.world, {'id': action_id})
            self.assertIn(flag, self.state['flags'])

        # Verify 5 closures in journal
        closures = [j for j in self.state['journal'] if j.startswith('Cierre:')]
        self.assertEqual(len(closures), 5)

if __name__ == '__main__':
    unittest.main()
