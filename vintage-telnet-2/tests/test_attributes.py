"""Tests for attribute effects out of combat, PA progression, and requires_attribute guard."""
import unittest
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine, RuleError, allowed

class FixedRandom:
    def __init__(self, value=0.0):
        self.value = value
    def random(self):
        return self.value
    def randint(self, a, b):
        return a

class SequenceRandom:
    def __init__(self, values):
        self.values = iter(values)
    def random(self):
        return next(self.values)
    def randint(self, a, b):
        return next(self.values)

class AttributeEffectsTests(unittest.TestCase):
    def setUp(self):
        self.content = Content(Path(__file__).resolve().parents[1] / 'content')
        self.engine = Engine(self.content, lambda: 12 * 3600, FixedRandom(0.0))

    def test_attribute_effects_exposed_in_snapshot(self):
        self.assertEqual(len(m.ATTRIBUTE_EFFECTS), 8)
        for attr in m.ATTRIBUTES:
            self.assertIn(attr, m.ATTRIBUTE_EFFECTS)
            self.assertTrue(m.ATTRIBUTE_EFFECTS[attr].endswith('.'))

        char = {'id': 1, 'name': 'Aventurero', 'species': 'humano', 'class_id': 'juramentado', 'status': 'approved',
                'state': m.new_state('humano', 'juramentado', 'valdren_plaza', 0)}
        world = {'version': 1, 'flags': [], 'deaths': {}}
        snap = self.engine.snapshot(char, world)

        self.assertIn('attribute_effects', snap['character'])
        self.assertIn('attribute_effects', snap)
        self.assertEqual(snap['character']['attribute_effects'], m.ATTRIBUTE_EFFECTS)
        self.assertEqual(snap['attribute_effects'], m.ATTRIBUTE_EFFECTS)

    def test_requires_attribute_guard_in_allowed(self):
        item_req = {'id': 'test_action', 'requires_attribute': {'fuerza': 12}}
        state = {'species': 'humano', 'class_id': 'juramentado', 'flags': [], 'attributes': {'fuerza': 10}}
        world = {'flags': []}

        # Below requirement: not allowed
        self.assertFalse(allowed(item_req, state, world))

        # Meets requirement: allowed
        state['attributes']['fuerza'] = 12
        self.assertTrue(allowed(item_req, state, world))

        # Multiple attributes requirement
        item_multi = {'id': 'test_multi', 'requires_attribute': {'fuerza': 12, 'agilidad': 11}}
        state['attributes']['agilidad'] = 10
        self.assertFalse(allowed(item_multi, state, world))
        state['attributes']['agilidad'] = 11
        self.assertTrue(allowed(item_multi, state, world))

        # Plural alias requires_attributes
        item_plural = {'id': 'test_plural', 'requires_attributes': {'intelecto': 13}}
        state['attributes']['intelecto'] = 12
        self.assertFalse(allowed(item_plural, state, world))
        state['attributes']['intelecto'] = 13
        self.assertTrue(allowed(item_plural, state, world))

    def test_level_up_grants_pa_and_allocation(self):
        char = {'id': 1, 'name': 'Aventurero', 'species': 'humano', 'class_id': 'juramentado', 'status': 'approved',
                'state': m.new_state('humano', 'juramentado', 'valdren_plaza', 0)}
        state = char['state']
        state['pa'] = 0
        state['level'] = 1
        state['xp'] = m.xp_next(1) + 10

        combat = {'creature': 'mordelinde', 'profile': dict(m.PROFILES['mordelinde']), 'round': 1}
        state['combat'] = combat
        creature = m.PROFILES['mordelinde']
        world = {'version': 1, 'flags': [], 'deaths': {}}

        # Victory grants level up and 2 PA
        self.engine.victory(char, world, combat, creature)
        self.assertEqual(state['level'], 2)
        self.assertEqual(state['pa'], 2)

        # Allocate PA via action 'atributo'
        initial_fuerza = state['attributes']['fuerza']
        intent = {'id': 'atributo', 'target': 'fuerza', 'confirmed': True}
        self.engine.apply(char, world, intent)
        self.assertEqual(state['attributes']['fuerza'], initial_fuerza + 1)
        self.assertEqual(state['pa'], 1)

        # Unconfirmed allocation fails
        with self.assertRaises(RuleError):
            self.engine.apply(char, world, {'id': 'atributo', 'target': 'fuerza', 'confirmed': False})

        # Insufficient PA fails
        state['pa'] = 0
        with self.assertRaises(RuleError):
            self.engine.apply(char, world, {'id': 'atributo', 'target': 'fuerza', 'confirmed': True})

        # Invalid attribute name fails
        state['pa'] = 5
        with self.assertRaises(RuleError):
            self.engine.apply(char, world, {'id': 'atributo', 'target': 'invalido', 'confirmed': True})

    def test_perception_in_search_and_examine(self):
        char = {'id': 1, 'name': 'Aventurero', 'species': 'humano', 'class_id': 'sombra', 'status': 'approved',
                'state': m.new_state('humano', 'sombra', 'valdren_plaza', 0)}
        char['state']['location'] = 'lethra_ribera_seca'
        world = {'version': 1, 'flags': [], 'deaths': {}, 'search_stock': {}}

        # Low perception search vs high perception search
        char['state']['attributes']['percepcion'] = 10
        # Roll 0.55 at percepcion 10 is trace (>0.50); at percepcion 15 (threshold 0.65), 0.55 is a find
        engine_roll = Engine(self.content, lambda: 12 * 3600, FixedRandom(0.55))
        engine_roll.search(char, world)
        self.assertEqual(char['state']['events'][0]['kind'], 'trace')

        char['state']['attributes']['percepcion'] = 15
        char['state']['searches'] = {}
        world['search_stock'] = {}
        engine_roll.search(char, world)
        self.assertEqual(char['state']['events'][0]['kind'], 'discovery')

        # Perception extra clue in examine
        room = self.content.rooms['lethra_ribera_seca']
        room['examine']['roca_marca'] = {
            'text': 'Una roca lisa junto a la senda.',
            'pista_percepcion': 'Bajo la piedra descubres un símbolo de ruta grabado.',
            'percepcion_min': 12
        }
        char['state']['attributes']['percepcion'] = 10
        lines = self.engine.narrative(char, world, mode='examinar', target='roca_marca')
        self.assertEqual(len(lines), 1)
        self.assertEqual(lines[0]['text'], 'Una roca lisa junto a la senda.')

        char['state']['attributes']['percepcion'] = 12
        lines = self.engine.narrative(char, world, mode='examinar', target='roca_marca')
        self.assertEqual(len(lines), 2)
        self.assertEqual(lines[1]['text'], 'Bajo la piedra descubres un símbolo de ruta grabado.')

    def test_intelecto_in_examine(self):
        char = {'id': 1, 'name': 'Aventurero', 'species': 'humano', 'class_id': 'arcano', 'status': 'approved',
                'state': m.new_state('humano', 'arcano', 'valdren_plaza', 0)}
        char['state']['location'] = 'lethra_ribera_seca'
        world = {'version': 1, 'flags': [], 'deaths': {}}
        room = self.content.rooms['lethra_ribera_seca']
        room['examine']['inscripcion_antigua'] = {
            'text': 'Una placa de cobre con letras desgastadas.',
            'texto_intelecto': 'Descifras que advierte sobre las crecidas repentinas del río.',
            'intelecto_min': 11
        }
        char['state']['attributes']['intelecto'] = 9
        lines = self.engine.narrative(char, world, mode='examinar', target='inscripcion_antigua')
        self.assertEqual(len(lines), 1)

        char['state']['attributes']['intelecto'] = 13
        lines = self.engine.narrative(char, world, mode='examinar', target='inscripcion_antigua')
        self.assertEqual(len(lines), 2)
        self.assertEqual(lines[1]['text'], 'Descifras que advierte sobre las crecidas repentinas del río.')

    def test_voluntad_calm_creature_and_fatigue(self):
        char = {'id': 1, 'name': 'Aventurero', 'species': 'humano', 'class_id': 'juramentado', 'status': 'approved',
                'state': m.new_state('humano', 'juramentado', 'valdren_plaza', 0)}
        char['state']['location'] = 'lethra_ribera_seca'
        world = {'version': 1, 'flags': [], 'deaths': {}, 'creature_states': {},
                 'wildlife': {'lethra_ribera_seca': {'signal': {'creature': 'cienfango'}, 'until': 9999999}}}

        # Higher voluntad reduces fatigue cost
        state = char['state']
        state['attributes']['voluntad'] = 10
        cost_normal = m.fatigue_cost(state, 10)
        state['attributes']['voluntad'] = 20
        cost_reduced = m.fatigue_cost(state, 10)
        self.assertLess(cost_reduced, cost_normal)

        # Calmar creature action
        state['attributes']['voluntad'] = 12
        actions = self.engine.actions(char, world)
        calm_actions = [a for a in actions if a['id'] == 'calmar']
        self.assertTrue(len(calm_actions) > 0)

        cid = calm_actions[0]['target']
        self.engine.apply(char, world, {'id': 'calmar', 'target': cid})
        key = f"{state['location']}:{cid}"
        self.assertEqual(world['creature_states'][key]['stage'], 'sheltered')
        self.assertIn('sosiega', state['events'][0]['text'])

    def test_soft_check_never_blocks_progress(self):
        char = {'id': 1, 'name': 'Aventurero', 'species': 'humano', 'class_id': 'juramentado', 'status': 'approved',
                'state': m.new_state('humano', 'juramentado', 'hogar_valdren', 0)}
        char['state']['location'] = 'valdren_plaza'
        world = {'version': 1, 'flags': [], 'deaths': {}}
        test_act = {
          'id': 'mover_viga',
          'label': 'Mover viga pesada',
          'requires_attribute': {'fuerza': 11},
          'text': 'Mueves la viga con un empuje limpio.',
          'set_flags': ['viga_movida'],
          'soft_check': {
            'attribute': 'fuerza',
            'dc': 15,
            'success_text': 'Mueves la viga con un empuje limpio.',
            'fail_text': 'La viga pesa mucho, pero tras resbalar un poco logras apartarla.',
            'fail_fatigue': 5
          }
        }
        self.content.rooms['valdren_plaza']['actions'].append(test_act)
        try:
            char['state']['attributes']['fuerza'] = 11
            # Random roll 1 + 11 = 12 < 15 -> fails soft check
            char['state']['fatigue'] = 0
            self.engine.apply(char, world, {'id': 'mover_viga'})
            self.assertIn('viga_movida', char['state']['flags'])
            self.assertIn('La viga pesa mucho', char['state']['events'][0]['text'])
            self.assertGreater(char['state']['fatigue'], 0)
        finally:
            self.content.rooms['valdren_plaza']['actions'].remove(test_act)

    def test_regional_actions_present(self):
        regions_and_actions = [
            ('korven', 'korven_loma_cascajo', 'korven_apartar_derrumbes', 'fuerza'),
            ('hoshai', 'hoshai_estribacion', 'hoshai_saltar_arroyo', 'agilidad'),
            ('lethra', 'lethra_ribera_seca', 'lethra_avanzar_entre_tallos', 'agilidad'),
            ('edran', 'valdren_plaza', 'edran_descifrar_placa_plaza', 'intelecto'),
            ('nhal', 'nhal_suelo_hojas', 'nhal_rastrear_hojas', 'percepcion'),
            ('veyra', 'veyra_plaza_rutas', 'veyra_orientar_viajeros', 'presencia'),
        ]
        for region_id, room_id, action_id, expected_attr in regions_and_actions:
            room = self.content.rooms.get(room_id)
            self.assertIsNotNone(room, f"Room {room_id} not found")
            action = next((a for a in room.get('actions', []) if a['id'] == action_id), None)
            self.assertIsNotNone(action, f"Action {action_id} not found in {room_id}")
            self.assertIn(expected_attr, action.get('requires_attribute', {}))

    def test_backwards_compatibility_old_state(self):
        # Legacy state missing pa and attributes
        old_state = {
            'level': 1, 'xp': 0, 'hp': 100, 'fatigue': 0, 'wound': None,
            'seals': 20, 'location': 'valdren_plaza', 'home': 'valdren_plaza',
            'inventory': [], 'equipment': {}, 'flags': [], 'visited': ['valdren_plaza'],
            'known': ['valdren_plaza'], 'routes': [], 'bestiary': {}, 'journal': [],
            'visits': {'valdren_plaza': 1}, 'combat': None, 'victories': [], 'quests': {},
            'ledger': []
        }
        char = {'id': 99, 'name': 'Viejo', 'species': 'humano', 'class_id': 'juramentado', 'status': 'approved', 'state': old_state}
        world = {'version': 1, 'flags': [], 'deaths': {}}

        snap = self.engine.snapshot(char, world)
        self.assertEqual(snap['character']['pa'], 0)
        self.assertIn('attribute_effects', snap['character'])
        self.assertEqual(m.hp_max(old_state), 100)
        self.assertGreater(m.fatigue_cost(old_state, 10), 0)

if __name__ == '__main__':
    unittest.main()
