"""Pruebas de la segunda mazmorra de Korven y sus mecánicas aprobadas."""
import json
import unittest
from pathlib import Path

from server import mechanics as m
from server.content import Content
from server.engine import Engine, signal_present


ROOT = Path(__file__).resolve().parents[1]
WORLD_EMPTY = lambda: {'version': 0, 'flags': [], 'deaths': {}, 'encounters': {},
                       'creature_states': {}, 'presence': []}


class FixedRng:
    def random(self):
        return 0


class GrietaMadreTests(unittest.TestCase):
    def setUp(self):
        self.content = Content(ROOT / 'content')
        self.now = 43200
        self.engine = Engine(self.content, lambda: self.now, FixedRng())
        self.world = WORLD_EMPTY()

    def make_char(self, cid=1, cls='arcano', level=20, species='humano'):
        state = m.new_state(species, cls, 'brumak_centro', self.now)
        state.update(level=level, location='korven_cauce_observacion')
        return {'id': cid, 'name': f'Jugador{cid}', 'species': species,
                'class_id': cls, 'status': 'approved', 'state': state}

    def action_ids(self, character):
        return {a['id'] for a in self.engine.actions(character, self.world) if not a.get('disabled')}

    def move(self, character, direction):
        self.engine.apply(character, self.world, {'id': 'mover', 'target': direction})

    def engage(self, character, creature):
        if any(a['id'] == 'acercarse' and a.get('target') == creature
               for a in self.engine.actions(character, self.world)):
            self.engine.apply(character, self.world, {'id': 'acercarse', 'target': creature})
        self.engine.apply(character, self.world, {'id': 'combatir', 'target': creature})

    def win(self, character, creature):
        combat = {'creature': creature, 'profile': dict(m.PROFILES[creature]), 'hp': 0}
        character['state']['combat'] = combat
        self.engine.victory(character, self.world, combat, self.content.creatures[creature])

    def test_profiles_levels_categories_and_boss_preparations(self):
        expected = {
            'tallagrietas': (11, 'peligroso'), 'cuarzarana': (12, 'peligroso'),
            'vetasierpe': (13, 'peligroso'), 'rodacanto': (14, 'peligroso'),
            'espinacuarzo': (15, 'peligroso'), 'brasaluz': (16, 'peligroso'),
            'callaecos': (17, 'peligroso'), 'quebrarrocas_canoso': (16, 'abrumador'),
            'tejecristal': (17, 'abrumador'), 'sierpe_veta_madre': (20, 'abrumador'),
        }
        preparation_ids = {
            'tallagrietas': ['latigazo_pared'], 'cuarzarana': ['lluvia_esquirlas'],
            'vetasierpe': ['abrazo_anillos'], 'rodacanto': ['rodada_canto'],
            'espinacuarzo': ['erizar_puas'], 'brasaluz': ['vaho_tibio'],
            'callaecos': ['salto_silencio'],
            'quebrarrocas_canoso': ['empuje_anclado', 'zarpazo_losa', 'temblor_lecho'],
            'tejecristal': ['hilos_cuarzo', 'embestida_patas', 'telar_que_canta'],
            'sierpe_veta_madre': ['rodada_anillos', 'lluvia_cristal', 'pulso_veta', 'mordida_cuarzo'],
        }
        self.assertEqual(set(expected), set(m.PROFILES) & set(expected))
        for creature, (level, category) in expected.items():
            with self.subTest(creature=creature):
                profile = m.PROFILES[creature]
                self.assertEqual((profile['level'], profile['category']), (level, category))
                preparations = profile.get('preparations', [profile.get('prepared_action')])
                self.assertEqual([p['id'] for p in preparations], preparation_ids[creature])
        for creature in ('quebrarrocas_canoso', 'tejecristal', 'sierpe_veta_madre'):
            preparations = m.PROFILES[creature]['preparations']
            self.assertTrue(any(p['interruptible'] for p in preparations))
            self.assertTrue(any(not p['interruptible'] for p in preparations))
            self.assertTrue(any(p['frontal'] for p in preparations))
        self.assertEqual(m.PROFILES['sierpe_veta_madre']['hp'], 300)
        profile = m.PROFILES['sierpe_veta_madre']
        self.assertEqual(m.preparations_for(profile, 151), profile['preparations'])
        phase2 = m.preparations_for(profile, 150)
        self.assertEqual([p['id'] for p in phase2],
                         ['pulso_veta', 'lluvia_cristal', 'pulso_veta', 'rodada_anillos'])
        self.assertEqual(phase2[0]['accuracy'], profile['preparations_fase2'][0]['accuracy'] + 4)
        bosses = {'quebrarrocas_canoso': 'korven_grieta_nido',
                  'tejecristal': 'korven_grieta_telar',
                  'sierpe_veta_madre': 'korven_grieta_corazon'}
        for creature, room_id in bosses.items():
            player = self.make_char()
            player['state']['location'] = room_id
            self.world['creature_states'][f'{room_id}:{creature}'] = {'hp': 100}
            narrative = self.engine.narrative(player, self.world, 'mirar')
            self.assertTrue(any(text in event['text'] for event in narrative
                                for text in m.PROFILES[creature]['desgaste']))
        player['state']['combat'] = {'creature': 'sierpe_veta_madre', 'profile': profile,
                                     'hp': 151, 'round': 0, 'prepared': False, 'cooldown': 0}
        events, _ = m.resolve_round(player['state'], self.content.creatures['sierpe_veta_madre'],
                                    FixedRng(), respond=False)
        self.assertTrue(any(profile['aviso_fase2'] in event['text'] for event in events))

    def test_entry_requires_world_flag_and_level_and_all_three_actions_open_it(self):
        player = self.make_char(level=9)
        gate = self.content.rooms['korven_cauce_observacion']['exit_requirements']['sur']
        self.assertFalse(self.engine.allowed(gate, player['state'], self.world))
        player['state']['level'] = 10
        self.assertFalse(self.engine.allowed(gate, player['state'], self.world))
        for action_id, flag, species, attributes in (
            ('grieta_seguir_notas', 'korven_misterio_cauce_resuelto', 'humano', {}),
            ('grieta_sentir_vibracion', 'sec_d_vibracion', 'dravak', {}),
            ('grieta_ver_polvo', 'korven_presion_abajo', 'humano', {'percepcion': 13}),
        ):
            with self.subTest(action=action_id):
                person = self.make_char(cid=10, level=10, species=species)
                person['state']['flags'].append(flag)
                person['state']['attributes'].update(attributes)
                before = set(self.world['flags'])
                self.engine.apply(person, self.world, {'id': action_id})
                self.assertIn('korven_grieta_abierta', self.world['flags'])
                self.assertTrue(self.engine.allowed(gate, person['state'], self.world))
                self.world['flags'] = list(before)

    def test_descent_and_heart_level_and_flag_gates(self):
        player = self.make_char(level=11)
        gate = self.content.rooms['korven_grieta_ecos']['exit_requirements']['sur']
        self.assertFalse(self.engine.allowed(gate, player['state'], self.world))
        player['state']['level'] = 12
        self.assertTrue(self.engine.allowed(gate, player['state'], self.world))
        heart_gate = self.content.rooms['korven_grieta_antecamara']['exit_requirements']['sur']
        self.assertFalse(self.engine.allowed(heart_gate, player['state'], self.world))
        player['state']['flags'].append('grieta_sello_abierto')
        self.assertFalse(self.engine.allowed(heart_gate, player['state'], self.world))
        player['state']['level'] = 16
        self.assertTrue(self.engine.allowed(heart_gate, player['state'], self.world))

    def test_echo_puzzle_requires_callaecos_and_correct_order(self):
        player = self.make_char()
        player['state']['location'] = 'korven_grieta_sorda'
        self.assertNotIn('eco_golpe_larga', self.action_ids(player))
        player['state']['flags'].append('victoria:korven_grieta_sorda:callaecos')
        self.assertIn('eco_golpe_larga', self.action_ids(player))
        self.engine.apply(player, self.world, {'id': 'eco_mediana_antes'})
        self.assertNotIn('grieta_eco_1', player['state']['flags'])
        self.engine.apply(player, self.world, {'id': 'eco_golpe_larga'})
        self.engine.apply(player, self.world, {'id': 'eco_golpe_mediana'})
        self.engine.apply(player, self.world, {'id': 'eco_golpe_corta'})
        self.assertIn('grieta_veta_eco', player['state']['flags'])

    def test_each_pair_opens_seal_but_one_veta_does_not(self):
        pairs = (('grieta_veta_clara', 'grieta_veta_tibia', 'sello_clara_tibia'),
                 ('grieta_veta_clara', 'grieta_veta_eco', 'sello_clara_eco'),
                 ('grieta_veta_tibia', 'grieta_veta_eco', 'sello_tibia_eco'))
        for first, second, action in pairs:
            with self.subTest(action=action):
                player = self.make_char()
                player['state']['location'] = 'korven_grieta_antecamara'
                player['state']['flags'] = [first]
                self.assertFalse(any(a.startswith('sello_') for a in self.action_ids(player)))
                player['state']['flags'].append(second)
                self.assertIn(action, self.action_ids(player))
                self.engine.apply(player, self.world, {'id': action})
                self.assertIn('grieta_sello_abierto', player['state']['flags'])

    def test_boss_victories_hide_boss_and_common_creature_returns_after_300_seconds(self):
        for creature, room in (('quebrarrocas_canoso', 'korven_grieta_nido'),
                               ('tejecristal', 'korven_grieta_telar'),
                               ('sierpe_veta_madre', 'korven_grieta_corazon')):
            with self.subTest(creature=creature):
                player = self.make_char()
                player['state']['location'] = room
                self.win(player, creature)
                self.assertIn(f'victoria:{room}:{creature}', player['state']['flags'])
                self.assertTrue(set(self.content.creatures[creature].get('victory_flags', [])) <= set(player['state']['flags']))
                self.assertFalse(signal_present(next(s for s in self.content.rooms[room]['signals'] if s['creature'] == creature),
                                                self.content.rooms[room], self.world, self.now))
        player = self.make_char()
        player['state']['location'] = 'korven_grieta_ecos'
        self.win(player, 'tallagrietas')
        signal = self.content.rooms['korven_grieta_ecos']['signals'][0]
        self.assertFalse(signal_present(signal, self.content.rooms['korven_grieta_ecos'], self.world, self.now))
        self.now += 300
        self.assertTrue(signal_present(signal, self.content.rooms['korven_grieta_ecos'], self.world, self.now))

    def test_sierpe_hp_survives_retry_reload_and_is_shared(self):
        first = self.make_char(1)
        first['state']['location'] = 'korven_grieta_corazon'
        self.engage(first, 'sierpe_veta_madre')
        key = 'korven_grieta_corazon:sierpe_veta_madre'
        first['state']['combat']['hp'] = 217
        self.world['creature_states'][key]['hp'] = 217
        self.engine.flee(first, self.world)
        restored_world = json.loads(json.dumps(self.world))
        after_reload = Engine(self.content, lambda: self.now, FixedRng())
        second = self.make_char(2, cls='sombra')
        second['state']['location'] = 'korven_grieta_corazon'
        self.engage(second, 'sierpe_veta_madre')
        self.assertEqual(second['state']['combat']['hp'], 217)
        third = self.make_char(3, cls='artifice')
        third['state']['location'] = 'korven_grieta_corazon'
        self.engage(third, 'sierpe_veta_madre')
        self.assertEqual(third['state']['combat']['hp'], 217)

    def test_prize_once_per_class_with_exact_items(self):
        weapons = {'juramentado': ('espada_veta_madre', 21), 'arcano': ('baculo_cuarzo_cantor', 18),
                   'sombra': ('colmillos_geoda', 18), 'artifice': ('arco_cristal_hondo', 20)}
        for index, (cls, (weapon, damage)) in enumerate(weapons.items(), 1):
            with self.subTest(cls=cls):
                player = self.make_char(index, cls)
                player['state']['location'] = 'korven_grieta_lecho'
                player['state']['flags'].append('victoria:korven_grieta_corazon:sierpe_veta_madre')
                action = 'reclamar_premio_grieta_' + cls
                self.engine.apply(player, self.world, {'id': action})
                ids = [i.get('catalog_id', i['id']) for i in player['state']['inventory']]
                self.assertIn(weapon, ids)
                won_weapon = next(i for i in player['state']['inventory']
                                  if i.get('catalog_id', i['id']) == weapon)
                self.assertEqual(won_weapon['damage'], damage)
                self.assertIn('amuleto_veta_tibia', ids)
                self.assertEqual(sum(i.get('quantity', 1) for i in player['state']['inventory']
                                     if i.get('catalog_id', i['id']) == 'escama_veta'), 3)
                self.assertNotIn(action, self.action_ids(player))

    def test_world_calming_states_are_visible_to_other_player(self):
        self.world['flags'].append('korven_grieta_en_calma')
        observer = self.make_char(2)
        for room_id in ('korven_cauce_observacion', 'korven_plataforma_escucha',
                        'korven_cisterna_comun'):
            with self.subTest(room=room_id):
                room = self.content.rooms[room_id]
                observer['state']['location'] = room_id
                state = next(s for s in room['states'] if 'korven_grieta_en_calma' in s.get('requires_flags', []))
                self.assertTrue(self.engine.allowed(state, observer['state'], self.world))
                actual = self.engine.room(observer, self.world)
                for key, value in state['overrides'].items():
                    self.assertEqual(actual[key], value)
        observer['state']['location'] = 'korven_mirador_grietas'
        self.now = 22 * 3600
        self.assertIn('hilos de luz', self.engine.room(observer, self.world)['night'])
        observer['state']['location'] = 'korven_grieta_corazon'
        self.assertNotIn('combatir', {a['id'] for a in self.engine.actions(observer, self.world)})

    def test_exploration_xp_matches_design(self):
        player = self.make_char(level=10)
        player['state']['location'] = 'korven_grieta_ecos'
        self.win(player, 'tallagrietas')
        self.assertEqual(player['state']['xp'], 61)
        player = self.make_char(2, level=18)
        player['state']['location'] = 'korven_grieta_corazon'
        self.win(player, 'sierpe_veta_madre')
        self.assertEqual(player['state']['xp'], 120)

    def test_arcane_solo_route_from_boca_to_prize(self):
        player = self.make_char(level=20)
        player['state']['location'] = 'korven_cauce_observacion'
        player['state']['flags'].append('korven_misterio_cauce_resuelto')
        self.engine.apply(player, self.world, {'id': 'grieta_seguir_notas'})
        self.move(player, 'sur')
        self.move(player, 'sur')
        self.win(player, 'tallagrietas')
        self.move(player, 'oeste')
        self.win(player, 'cuarzarana')
        self.move(player, 'oeste')
        self.win(player, 'vetasierpe')
        self.move(player, 'este')
        self.move(player, 'este')
        self.move(player, 'este')
        self.win(player, 'rodacanto')
        self.move(player, 'oeste')
        self.move(player, 'sur')
        self.move(player, 'oeste')
        self.win(player, 'espinacuarzo')
        self.move(player, 'sur')
        self.win(player, 'tejecristal')
        self.move(player, 'sur')
        self.move(player, 'este')
        self.move(player, 'norte')
        self.win(player, 'callaecos')
        for action in ('eco_golpe_larga', 'eco_golpe_mediana', 'eco_golpe_corta'):
            self.engine.apply(player, self.world, {'id': action})
        self.move(player, 'sur')
        self.engine.apply(player, self.world, {'id': 'sello_clara_eco'})
        self.move(player, 'sur')
        self.engage(player, 'sierpe_veta_madre')
        self.assertEqual(player['state']['combat']['hp'], 300)
        self.win(player, 'sierpe_veta_madre')
        self.move(player, 'sur')
        self.engine.apply(player, self.world, {'id': 'reclamar_premio_grieta_arcano'})
        ids = {i.get('catalog_id', i['id']) for i in player['state']['inventory']}
        self.assertTrue({'baculo_cuarzo_cantor', 'amuleto_veta_tibia', 'escama_veta'} <= ids)


if __name__ == '__main__':
    unittest.main()
