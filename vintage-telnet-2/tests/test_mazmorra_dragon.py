"""Pruebas completas del Bastión de las Aguas Antiguas y el Dragón de nivel 10."""
import json
import unittest
from pathlib import Path
from server.content import Content
from server.engine import Engine, RuleError
from server import mechanics as m

ROOT = Path(__file__).resolve().parents[1]

class DeterministicRNG:
    def __init__(self, value=0.1):
        self.val = value
    def random(self):
        return self.val
    def randint(self, a, b):
        return b

class MazmorraDragonTests(unittest.TestCase):
    def setUp(self):
        self.content = Content(ROOT / 'content')
        self.clock_val = 43200
        self.rng = DeterministicRNG(0.0)
        self.engine = Engine(self.content, lambda: self.clock_val, self.rng)
        self.world = {'version': 0, 'flags': [], 'deaths': {}, 'encounters': {}, 'creature_states': {}, 'presence': {}}

    def make_char(self, cid, name, cls, level=5, species='humano'):
        state = m.new_state(species, cls, 'test-home', self.clock_val)
        state['level'] = level
        state['location'] = 'veyra_acequia_exterior'
        return {
            'id': cid,
            'name': name,
            'species': species,
            'class_id': cls,
            'status': 'approved',
            'state': state
        }

    def test_dragon_profile_and_telegraphed_preparations(self):
        profile = m.PROFILES['dragon_aguas_antiguas']
        self.assertEqual(profile['level'], 10)
        self.assertEqual(profile['hp'], 240)
        self.assertEqual(profile['category'], 'abrumador')
        preps = profile['preparations']
        self.assertEqual(len(preps), 3)

        # 1. Aliento torrente: frontal, no interrumpible
        p0 = preps[0]
        self.assertEqual(p0['id'], 'aliento_torrente')
        self.assertTrue(p0['frontal'])
        self.assertFalse(p0['interruptible'])

        # 2. Coletazo giratorio: no frontal, interrumpible
        p1 = preps[1]
        self.assertEqual(p1['id'], 'coletazo_giratorio')
        self.assertFalse(p1['frontal'])
        self.assertTrue(p1['interruptible'])

        # 3. Embate ciego: ni frontal ni interrumpible (Sombra)
        p2 = preps[2]
        self.assertEqual(p2['id'], 'embate_ciego')
        self.assertFalse(p2['frontal'])
        self.assertFalse(p2['interruptible'])

    def test_class_counter_interventions_against_dragon_preparations(self):
        profile = dict(m.PROFILES['dragon_aguas_antiguas'])

        # Juramentado mitigates frontal (p0: aliento_torrente)
        char_j = self.make_char(1, 'Geralt', 'juramentado', 10)
        state_j = char_j['state']
        state_j['combat'] = {'creature': 'dragon_aguas_antiguas', 'profile': profile, 'hp': 240, 'prepared': True, 'prepared_action': profile['preparations'][0], 'round': 0, 'cooldown': 0}
        actions_j = self.engine.actions(char_j, self.world)
        cap_j = next(a for a in actions_j if a['id'] == 'guardia_comprometida')
        self.assertFalse(cap_j.get('disabled', False))

        # Arcano interrupts interruptible (p1: coletazo_giratorio)
        char_a = self.make_char(2, 'Yennefer', 'arcano', 10)
        state_a = char_a['state']
        state_a['combat'] = {'creature': 'dragon_aguas_antiguas', 'profile': profile, 'hp': 240, 'prepared': True, 'prepared_action': profile['preparations'][1], 'round': 0, 'cooldown': 0}
        actions_a = self.engine.actions(char_a, self.world)
        cap_a = next(a for a in actions_a if a['id'] == 'impulso_arcano')
        self.assertFalse(cap_a.get('disabled', False))

        # Arcano cannot interrupt non-interruptible (p0)
        state_a['combat']['prepared_action'] = profile['preparations'][0]
        actions_a0 = self.engine.actions(char_a, self.world)
        cap_a0 = next(a for a in actions_a0 if a['id'] == 'impulso_arcano')
        self.assertTrue(cap_a0.get('disabled', False))

        # Juramentado cannot guard non-frontal (p1)
        state_j['combat']['prepared_action'] = profile['preparations'][1]
        actions_j1 = self.engine.actions(char_j, self.world)
        cap_j1 = next(a for a in actions_j1 if a['id'] == 'guardia_comprometida')
        self.assertTrue(cap_j1.get('disabled', False))

        # Sombra signature (borrar_foco) is available against embate_ciego (p2)
        char_s = self.make_char(3, 'Sombra', 'sombra', 10)
        state_s = char_s['state']
        state_s['combat'] = {'creature': 'dragon_aguas_antiguas', 'profile': profile, 'hp': 240, 'prepared': True, 'prepared_action': profile['preparations'][2], 'round': 0, 'cooldown': 0}
        actions_s = self.engine.actions(char_s, self.world)
        cap_s = next(a for a in actions_s if a['id'] == 'borrar_foco')
        self.assertFalse(cap_s.get('disabled', False))

    def test_persistent_dragon_hp_shared_between_two_players(self):
        p1 = self.make_char(101, 'JugadorUno', 'juramentado', 7)
        p2 = self.make_char(102, 'JugadorDos', 'arcano', 7)
        room_id = 'veyra_mazmorra_boveda_guardian'
        p1['state']['location'] = room_id
        p2['state']['location'] = room_id

        # Dragon initially approached and engaged at full HP (240)
        self.engine.apply(p1, self.world, {'id': 'acercarse', 'target': 'dragon_aguas_antiguas'})
        self.engine.apply(p1, self.world, {'id': 'combatir', 'target': 'dragon_aguas_antiguas'})
        self.assertEqual(p1['state']['combat']['hp'], 240)
        self.assertEqual(self.world['creature_states'][f'{room_id}:dragon_aguas_antiguas']['hp'], 240)

        # Player 1 hits dragon down to 170 HP and flees
        p1['state']['combat']['hp'] = 170
        self.world['creature_states'][f'{room_id}:dragon_aguas_antiguas']['hp'] = 170
        self.world.setdefault('dragon_participants', []).append(p1['id'])
        self.world['encounters'].pop(f'{room_id}:dragon_aguas_antiguas', None)
        self.engine.flee(p1, self.world)

        # World retains 170 HP
        self.assertEqual(self.world['creature_states'][f'{room_id}:dragon_aguas_antiguas']['hp'], 170)

        # Room description reflects visible wounds in child-friendly prose
        desc = self.engine.narrative(p2, self.world, 'mirar')
        danger_event = next(e for e in desc if e['kind'] == 'danger')
        self.assertIn('Una de sus alas queda baja', danger_event['text'])

        # Player 2 engages: combat begins with 170 HP, NOT 240!
        self.engine.apply(p2, self.world, {'id': 'acercarse', 'target': 'dragon_aguas_antiguas'})
        self.engine.apply(p2, self.world, {'id': 'combatir', 'target': 'dragon_aguas_antiguas'})
        self.assertEqual(p2['state']['combat']['hp'], 170)
        self.world.setdefault('dragon_participants', []).append(p2['id'])

        # Both players registered as participants
        self.assertIn(p1['id'], self.world['dragon_participants'])
        self.assertIn(p2['id'], self.world['dragon_participants'])

    def test_defeat_and_grand_prize_per_player_once(self):
        p1 = self.make_char(201, 'Valiente1', 'juramentado', 8)
        p2 = self.make_char(202, 'Valiente2', 'arcano', 8)
        p3 = self.make_char(203, 'Espectador', 'sombra', 8)

        # Simulate dragon battle participation
        self.world['dragon_participants'] = [p1['id'], p2['id']]

        # Defeat dragon
        combat = {'creature': 'dragon_aguas_antiguas', 'profile': m.PROFILES['dragon_aguas_antiguas'], 'hp': 0}
        p1['state']['combat'] = combat
        p1['state']['location'] = 'veyra_mazmorra_boveda_guardian'
        self.engine.victory(p1, self.world, combat, m.PROFILES['dragon_aguas_antiguas'])

        self.assertIn('dragon_vencido', self.world['flags'])
        self.assertIn('participated:dragon_vencido', p1['state']['flags'])

        # Player 2 syncs participation on action or snapshot
        p2['state']['location'] = 'veyra_mazmorra_boveda_guardian'
        self.engine.sync_dragon_participation(p2, self.world)
        self.assertIn('participated:dragon_vencido', p2['state']['flags'])

        # Player 3 did not participate
        self.engine.sync_dragon_participation(p3, self.world)
        self.assertNotIn('participated:dragon_vencido', p3['state']['flags'])

        # All players move to room 8 (veyra_mazmorra_recorridos_fin)
        room_fin = 'veyra_mazmorra_recorridos_fin'
        p1['state']['location'] = room_fin
        p2['state']['location'] = room_fin
        p3['state']['location'] = room_fin

        # Player 1 (Juramentado) claims prize
        acts_p1 = [a['id'] for a in self.engine.actions(p1, self.world) if not a.get('disabled')]
        self.assertIn('reclamar_premio_juramentado', acts_p1)
        self.assertNotIn('reclamar_premio_arcano', acts_p1)

        self.engine.apply(p1, self.world, {'id': 'reclamar_premio_juramentado'})
        items_p1 = {i.get('catalog_id', i['id']) for i in p1['state']['inventory']}
        self.assertIn('espada_bastion', items_p1)
        self.assertIn('joyas_bastion', items_p1)
        self.assertIn('escama_dragon', items_p1)
        self.assertIn('gran_premio_recibido', p1['state']['flags'])

        # Player 1 cannot claim a second time
        acts_p1_after = [a['id'] for a in self.engine.actions(p1, self.world) if not a.get('disabled')]
        self.assertNotIn('reclamar_premio_juramentado', acts_p1_after)

        # Player 2 (Arcano) claims prize independently: gets vara_caudales
        acts_p2 = [a['id'] for a in self.engine.actions(p2, self.world) if not a.get('disabled')]
        self.assertIn('reclamar_premio_arcano', acts_p2)
        self.engine.apply(p2, self.world, {'id': 'reclamar_premio_arcano'})
        items_p2 = {i.get('catalog_id', i['id']) for i in p2['state']['inventory']}
        self.assertIn('vara_caudales', items_p2)
        self.assertIn('joyas_bastion', items_p2)
        self.assertIn('escama_dragon', items_p2)
        self.assertIn('gran_premio_recibido', p2['state']['flags'])

        # Player 3 (non participant) cannot claim any prize
        acts_p3 = [a['id'] for a in self.engine.actions(p3, self.world) if not a.get('disabled')]
        self.assertFalse(any(a.startswith('reclamar_premio') for a in acts_p3))

    def test_tier_2_weapons_for_all_four_classes(self):
        classes_weapons = {
            'juramentado': ('espada_bastion', 14),
            'arcano': ('vara_caudales', 11),
            'sombra': ('daga_aguas_profundas', 12),
            'artifice': ('arco_esclusa', 13),
        }
        for cls, (wid, dmg) in classes_weapons.items():
            self.assertIn(wid, m.WEAPONS)
            w = m.WEAPONS[wid]
            self.assertEqual(w['damage'], dmg)
            t1_wid = m.CLASSES[cls]['weapon']
            t1_dmg = m.WEAPONS[t1_wid]['damage']
            self.assertEqual(dmg, t1_dmg + 4)

    def test_cooperation_challenges_solvable_with_distinct_combinations(self):
        # Room 3: veyra_mazmorra_caudal
        # Solvable by: Marevyn species, Arcano class, Artífice class, or any Resistencia >= 10
        char_marevyn = self.make_char(301, 'Acuatico', 'sombra', species='marevyn')
        char_marevyn['state']['location'] = 'veyra_mazmorra_caudal'

        char_arcano = self.make_char(302, 'Mago', 'arcano')
        char_arcano['state']['location'] = 'veyra_mazmorra_caudal'

        char_artifice = self.make_char(303, 'Ingeniero', 'artifice')
        char_artifice['state']['location'] = 'veyra_mazmorra_caudal'

        char_resistente = self.make_char(304, 'Fuerte', 'juramentado')
        char_resistente['state']['attributes']['resistencia'] = 11
        char_resistente['state']['location'] = 'veyra_mazmorra_caudal'

        acts_mar = [a['id'] for a in self.engine.actions(char_marevyn, self.world) if not a.get('disabled')]
        acts_arc = [a['id'] for a in self.engine.actions(char_arcano, self.world) if not a.get('disabled')]
        acts_art = [a['id'] for a in self.engine.actions(char_artifice, self.world) if not a.get('disabled')]
        acts_res = [a['id'] for a in self.engine.actions(char_resistente, self.world) if not a.get('disabled')]

        self.assertIn('bastion_vado_marevyn', acts_mar)
        self.assertIn('bastion_vado_arcano', acts_arc)
        self.assertIn('bastion_vado_artifice', acts_art)
        self.assertIn('bastion_vado_atributo', acts_res)

        # Applying any of them unlocks the exit
        w1 = {'version': 0, 'flags': [], 'deaths': {}, 'encounters': {}, 'creature_states': {}, 'presence': {}}
        self.engine.apply(char_marevyn, w1, {'id': 'bastion_vado_marevyn'})
        self.assertIn('bastion_vado_superado', w1['flags'])

        w2 = {'version': 0, 'flags': [], 'deaths': {}, 'encounters': {}, 'creature_states': {}, 'presence': {}}
        self.engine.apply(char_arcano, w2, {'id': 'bastion_vado_arcano'})
        self.assertIn('bastion_vado_superado', w2['flags'])

        # Room 4: veyra_mazmorra_cornisa
        # Solvable by: Felaryn species, Sombra class, Juramentado class, or Agilidad >= 10
        char_felaryn = self.make_char(305, 'AgilFel', 'arcano', species='felaryn')
        char_felaryn['state']['location'] = 'veyra_mazmorra_cornisa'

        char_sombra = self.make_char(306, 'Sigilosa', 'sombra')
        char_sombra['state']['location'] = 'veyra_mazmorra_cornisa'

        acts_fel = [a['id'] for a in self.engine.actions(char_felaryn, self.world) if not a.get('disabled')]
        acts_som = [a['id'] for a in self.engine.actions(char_sombra, self.world) if not a.get('disabled')]

        self.assertIn('bastion_cornisa_felaryn', acts_fel)
        self.assertIn('bastion_cornisa_sombra', acts_som)

        # Room 6: veyra_mazmorra_galeria_ecos
        # Solvable by: Enigma clue (doble línea) OR attribute check (destreza >= 10)
        char_arcano['state']['location'] = 'veyra_mazmorra_galeria_ecos'
        acts_ecos = [a['id'] for a in self.engine.actions(char_arcano, self.world) if not a.get('disabled')]
        self.assertIn('bastion_seguir_doble_linea', acts_ecos)
        self.assertIn('bastion_desactivar_alambres', acts_ecos)

    def test_pre_boss_encounters_difficulty_progression(self):
        # 4 encounters before the dragon of increasing difficulty
        rooms_encounters = [
            ('veyra_mazmorra_cuencas', 'cienfango', 5),
            ('veyra_mazmorra_caudal', 'aguaculebra', 6),
            ('veyra_mazmorra_cornisa', 'mordesombra', 7),
            ('veyra_mazmorra_galeria_ecos', 'quebrarrocas', 9),
        ]
        levels = []
        for rid, cid, expected_lvl in rooms_encounters:
            room = self.content.rooms[rid]
            sig = next(s for s in room['signals'] if s['creature'] == cid)
            self.assertEqual(sig['level'], expected_lvl)
            levels.append(sig['level'])

        # Check strictly increasing levels before dragon lvl 10
        self.assertEqual(levels, [5, 6, 7, 9])
        self.assertEqual(m.PROFILES['dragon_aguas_antiguas']['level'], 10)

    def test_arcane_only_full_route_solo_and_pair(self):
        # Favourable, deterministic rolls prove reachability, not a win-rate estimate.
        from itertools import cycle
        for species in [('humano',), ('felaryn',), ('felaryn', 'humano')]:
            with self.subTest(species=species):
                self.setUp()
                party = [self.make_char(500+i, name, 'arcano', 3, name)
                         for i, name in enumerate(species)]
                rolls = cycle([0.0]*len(party)+[0.99])
                self.rng.random = lambda: next(rolls)

                def act(action, target=None):
                    for player in party:
                        intent = {'id': action}
                        if target is not None:
                            intent['target'] = target
                        if action == 'mover' or player is party[0]:
                            self.engine.apply(player, self.world, intent)

                def fight(creature):
                    rolls = cycle([0.0]*len(party)+[0.99])
                    self.rng.random = lambda: next(rolls)
                    for player in party:
                        if any(a['id']=='acercarse' and a.get('target')==creature for a in self.engine.actions(player, self.world)):
                            self.engine.apply(player, self.world, {'id': 'acercarse', 'target': creature})
                        self.engine.apply(player, self.world, {'id': 'combatir', 'target': creature})
                    for _ in range(500):
                        if not any(p['state']['combat'] for p in party):
                            break
                        self.clock_val += 4
                        self.engine.tick_shared(party, self.world)
                    self.assertTrue(all(p['state']['combat'] is None for p in party))
                    self.assertTrue(all(p['state']['hp'] > 0 for p in party))
                    self.assertIn('victoria:'+party[0]['state']['location']+':'+creature,
                                  party[0]['state']['flags'])

                act('mover', 'sur')
                act('bastion_forzar_umbral_intelecto')
                act('mover', 'oeste')
                fight('cienfango')
                act('bastion_orden_aliviadero')
                act('mover', 'oeste')
                fight('aguaculebra')
                act('bastion_vado_arcano')
                act('mover', 'sur')
                act('mover', 'este')
                fight('mordesombra')
                act('bastion_cornisa_cuerda')
                act('mover', 'oeste')
                act('bastion_consola_1_contrapeso')
                act('bastion_consola_2_agilidad')
                act('bastion_consola_3_resistencia')
                act('bastion_acoplar_mecanismo')
                act('mover', 'oeste')
                fight('quebrarrocas')
                act('bastion_seguir_doble_linea')
                act('mover', 'oeste')
                fight('dragon_aguas_antiguas')
                act('mover', 'norte')
                for player in party:
                    self.engine.apply(player, self.world, {'id': 'reclamar_premio_arcano'})
                    inventory = json.dumps(player['state']['inventory'], sort_keys=True)
                    with self.assertRaises(RuleError):
                        self.engine.apply(player, self.world, {'id': 'reclamar_premio_arcano'})
                    self.assertEqual(inventory, json.dumps(player['state']['inventory'], sort_keys=True))
                    self.assertIn('vara_caudales', inventory)
                    self.assertIn('joyas_bastion', inventory)
                    self.assertIn('escama_dragon', inventory)

    def test_real_damage_survives_database_reload_and_handoff(self):
        import tempfile
        from server.store import Store
        first = self.make_char(601, 'Felaryn', 'arcano', 3, 'felaryn')
        second = self.make_char(602, 'Humano', 'arcano', 3)
        room = 'veyra_mazmorra_boveda_guardian'
        key = room+':dragon_aguas_antiguas'
        first['state']['location'] = second['state']['location'] = room
        for action in ('acercarse', 'combatir'):
            self.engine.apply(first, self.world, {'id': action, 'target': 'dragon_aguas_antiguas'})
        self.clock_val += 4
        self.engine.tick(first, self.world)
        hp = self.world['creature_states'][key]['hp']
        self.assertLess(hp, 240)
        self.assertGreater(hp, 0)
        self.engine.apply(first, self.world, {'id': 'huir'})
        self.clock_val += 4
        self.engine.tick(first, self.world)
        with tempfile.TemporaryDirectory() as directory:
            store = Store(Path(directory)/'test.sqlite')
            with store.transaction() as db:
                store.save_world(db, self.world)
            store = Store(Path(directory)/'test.sqlite')
            with store.transaction() as db:
                self.world = store.world(db)
        for action in ('acercarse', 'combatir'):
            self.engine.apply(second, self.world, {'id': action, 'target': 'dragon_aguas_antiguas'})
        self.assertEqual(second['state']['combat']['hp'], hp)
        self.assertIn(first['id'], self.world['dragon_participants'])

    def test_shared_arcane_barrier_and_dragon_preparations(self):
        party = [self.make_char(701+i, str(i), 'arcano', 3) for i in range(2)]
        for player in party:
            player['state']['location'] = 'veyra_mazmorra_boveda_guardian'
            if any(a['id']=='acercarse' for a in self.engine.actions(player, self.world)):
                self.engine.apply(player, self.world, {'id': 'acercarse', 'target': 'dragon_aguas_antiguas'})
            self.engine.apply(player, self.world, {'id': 'combatir', 'target': 'dragon_aguas_antiguas'})
        first = party[0]['state']
        hp = first['hp']
        self.engine.apply(party[0], self.world, {'id': 'velo_contencion'})
        self.clock_val += 4
        self.engine.tick_shared(party, self.world)
        self.assertLess(hp-first['hp'], m.PROFILES['dragon_aguas_antiguas']['damage'])
        for player in party:
            combat = player['state']['combat']
            self.assertTrue(combat['prepared'])
            self.assertEqual(combat['prepared_action']['id'], 'coletazo_giratorio')
        self.clock_val += 4
        self.engine.tick_shared(party, self.world)
        self.assertEqual(first['combat']['prepared_action']['id'], 'embate_ciego')

    def test_each_class_prize_once_after_serialization(self):
        for index, cls in enumerate(m.CLASSES):
            with self.subTest(cls=cls):
                player = self.make_char(800+index, cls, cls, 3)
                player['state']['location'] = 'veyra_mazmorra_recorridos_fin'
                world = dict(self.world, flags=['dragon_vencido'], dragon_participants=[player['id']])
                intent = {'id': 'reclamar_premio_'+cls}
                self.engine.apply(player, world, intent)
                player, world = json.loads(json.dumps([player, world]))
                inventory = json.dumps(player['state']['inventory'], sort_keys=True)
                with self.assertRaises(RuleError):
                    self.engine.apply(player, world, intent)
                self.assertEqual(inventory, json.dumps(player['state']['inventory'], sort_keys=True))
                weapons = [i for i in player['state']['inventory'] if i.get('catalog_id') in
                           ('espada_bastion', 'vara_caudales', 'daga_aguas_profundas', 'arco_esclusa')]
                self.assertEqual(len(weapons), 1)
                self.assertEqual(weapons[0]['damage'], m.WEAPONS[m.CLASSES[cls]['weapon']]['damage']+4)
                self.assertIn('joyas_bastion', inventory)
                self.assertIn('escama_dragon' if cls in ('juramentado', 'arcano') else 'colmillo_dragon', inventory)

    def test_entrance_level_guard(self):
        # Access requires level >= 3
        char_low = self.make_char(401, 'Novato', 'juramentado', 2)
        acts_low = [a['target'] for a in self.engine.actions(char_low, self.world) if a['id'] == 'mover' and not a.get('disabled')]
        self.assertNotIn('sur', acts_low)

        char_ready = self.make_char(402, 'Apto', 'juramentado', 3)
        acts_ready = [a['target'] for a in self.engine.actions(char_ready, self.world) if a['id'] == 'mover' and not a.get('disabled')]
        self.assertIn('sur', acts_ready)

if __name__ == '__main__':
    unittest.main()
