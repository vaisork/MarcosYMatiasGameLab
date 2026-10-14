"""Tests for class combat actions, scaling, cooldowns, compatibility and requires_classes."""
import unittest
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine

class FixedRandom:
    def __init__(self, value=0.0):
        self.value = value
    def random(self):
        return self.value

class SequenceRandom:
    def __init__(self, values):
        self.values = iter(values)
    def random(self):
        return next(self.values)

class ClassCombatTests(unittest.TestCase):
    def setUp(self):
        self.content = Content(Path(__file__).resolve().parents[1] / 'content')
        self.engine = Engine(self.content, lambda: 12 * 3600, FixedRandom(0.0))

    def test_differentiated_initial_attributes(self):
        jura = m.new_state('humano', 'juramentado', 'home:test', 0)
        arca = m.new_state('humano', 'arcano', 'home:test', 0)
        somb = m.new_state('humano', 'sombra', 'home:test', 0)
        arti = m.new_state('humano', 'artifice', 'home:test', 0)

        # Check total attributes sum to 80 (moderate differentiation)
        for state in (jura, arca, somb, arti):
            self.assertEqual(sum(state['attributes'].values()), 80)
            self.assertEqual(state['hp'], 100)
            self.assertEqual(m.hp_max(state), 100)

        # Distinct profiles
        self.assertGreater(jura['attributes']['fuerza'], arca['attributes']['fuerza'])
        self.assertGreater(arca['attributes']['intelecto'], jura['attributes']['intelecto'])
        self.assertGreater(somb['attributes']['agilidad'], arti['attributes']['agilidad'])
        self.assertGreater(arti['attributes']['destreza'], jura['attributes']['destreza'])

    def test_class_damage_scaling(self):
        # Arcano scales with intelecto/voluntad
        arca = m.new_state('humano', 'arcano', 'home', 0); arca['_class'] = 'arcano'
        arca['combat'] = {'profile': dict(m.PROFILES['mordelinde']), 'hp': 28, 'round': 0, 'cooldown': 0, 'intervention': {'id': 'atacar'}}
        arca['attributes']['intelecto'] = 20
        arca['attributes']['voluntad'] = 20
        # raw calculation: varita (7) + .48*(20-10) + .12*(20-10) = 7 + 4.8 + 1.2 = 13
        m.resolve_round(arca, {'name': 'Mordelinde'}, FixedRandom(0.0), respond=False)
        self.assertEqual(arca['combat']['hp'], 28 - 13)

        # Sombra scales with agilidad/percepcion
        somb = m.new_state('humano', 'sombra', 'home', 0); somb['_class'] = 'sombra'
        somb['combat'] = {'profile': dict(m.PROFILES['mordelinde']), 'hp': 28, 'round': 0, 'cooldown': 0, 'intervention': {'id': 'atacar'}}
        somb['attributes']['agilidad'] = 20
        somb['attributes']['percepcion'] = 20
        # raw calculation: punal (8) + .48*10 + .12*10 = 8 + 6 = 14
        m.resolve_round(somb, {'name': 'Mordelinde'}, FixedRandom(0.0), respond=False)
        self.assertEqual(somb['combat']['hp'], 28 - 14)

    def test_juramentado_actions(self):
        # 1. Guardia Comprometida reduces 50% damage on frontal hit
        state = m.new_state('humano', 'juramentado', 'home', 0); state['_class'] = 'juramentado'
        profile = dict(m.PROFILES['espinajo_rastrojo']) # damage 8, reduction 0.10
        state['combat'] = {'profile': profile, 'hp': 40, 'prepared': True, 'round': 0, 'cooldown': 0, 'intervention': {'id': 'guardia_comprometida'}}
        lines, outcome = m.resolve_round(state, {'name': 'Espinajo'}, FixedRandom(0.0), respond=True)
        # 8 * 0.50 = 4 damage taken
        self.assertEqual(state['hp'], 96)
        self.assertTrue(any('Guardia Comprometida' in l['text'] for l in lines))

        # 2. Paso de Ruptura interrupts preparation and deals damage
        state2 = m.new_state('humano', 'juramentado', 'home', 0); state2['_class'] = 'juramentado'
        state2['combat'] = {'profile': dict(profile), 'hp': 40, 'prepared': True, 'round': 0, 'cooldown': 0, 'intervention': {'id': 'paso_ruptura'}}
        lines2, outcome2 = m.resolve_round(state2, {'name': 'Espinajo'}, FixedRandom(0.0), respond=False)
        self.assertFalse(state2['combat']['prepared'])
        self.assertLess(state2['combat']['hp'], 40)
        self.assertTrue(any('Paso de Ruptura' in l['text'] or 'paso de ruptura' in l['text'] for l in lines2))

    def test_arcano_actions(self):
        # 1. Velo de Contención absorbs incoming damage
        state = m.new_state('humano', 'arcano', 'home', 0); state['_class'] = 'arcano'
        profile = dict(m.PROFILES['espinajo_rastrojo']) # damage 8
        state['combat'] = {'profile': profile, 'hp': 40, 'prepared': False, 'round': 0, 'cooldown': 0, 'intervention': {'id': 'velo_contencion'}}
        lines, outcome = m.resolve_round(state, {'name': 'Espinajo'}, FixedRandom(0.0), respond=True)
        # Damage 8 fully absorbed by barrier (barrier >= 20)
        self.assertEqual(state['hp'], 100)
        self.assertTrue(any('Velo de Contención' in l['text'] or 'velo' in l['text'].lower() for l in lines))

        # 2. Impulso Arcano cancels preparation
        state2 = m.new_state('humano', 'arcano', 'home', 0); state2['_class'] = 'arcano'
        state2['combat'] = {'profile': dict(profile), 'hp': 40, 'prepared': True, 'round': 0, 'cooldown': 0, 'intervention': {'id': 'impulso_arcano'}}
        lines2, outcome2 = m.resolve_round(state2, {'name': 'Espinajo'}, FixedRandom(0.0), respond=False)
        self.assertFalse(state2['combat']['prepared'])
        self.assertEqual(state2['combat']['_response']['accuracy'], profile['accuracy'] - 10)

        # 3. Destello Frío drops accuracy by 30 and guarantees flee
        state3 = m.new_state('humano', 'arcano', 'home', 0); state3['_class'] = 'arcano'
        state3['combat'] = {'profile': dict(profile), 'hp': 40, 'prepared': False, 'round': 0, 'cooldown': 0, 'intervention': {'id': 'destello_frio'}}
        lines3, outcome3 = m.resolve_round(state3, {'name': 'Espinajo'}, FixedRandom(0.0), respond=False)
        self.assertEqual(state3['combat']['_response']['accuracy'], profile['accuracy'] - 30)
        # Next round attempt to flee
        state3['combat']['intervention'] = {'id': 'huir'}
        lines_flee, outcome_flee = m.resolve_round(state3, {'name': 'Espinajo'}, FixedRandom(0.99), respond=False)
        self.assertEqual(outcome_flee, 'fled')

    def test_sombra_actions(self):
        # 1. Borrar el Foco gives opening when rival misses
        state = m.new_state('humano', 'sombra', 'home', 0); state['_class'] = 'sombra'
        profile = dict(m.PROFILES['espinajo_rastrojo'])
        state['combat'] = {'profile': profile, 'hp': 40, 'prepared': False, 'round': 0, 'cooldown': 0, 'intervention': {'id': 'borrar_foco'}}
        # Random roll 0.99 causes enemy miss (accuracy clamp max 90)
        lines, outcome = m.resolve_round(state, {'name': 'Espinajo'}, FixedRandom(0.99), respond=True)
        self.assertTrue(state['combat']['opening'])

        # 2. Golpe a la Apertura consumes opening and deals enhanced damage
        state['combat']['intervention'] = {'id': 'golpe_apertura'}
        lines2, outcome2 = m.resolve_round(state, {'name': 'Espinajo'}, FixedRandom(0.0), respond=False)
        self.assertFalse(state['combat'].get('opening', False))
        self.assertLess(state['combat']['hp'], 30)

        # 3. Distracción cancels charge/preparation and lowers accuracy
        state3 = m.new_state('humano', 'sombra', 'home', 0); state3['_class'] = 'sombra'
        state3['combat'] = {'profile': dict(profile), 'hp': 40, 'prepared': True, 'round': 0, 'cooldown': 0, 'intervention': {'id': 'distraccion'}}
        lines3, outcome3 = m.resolve_round(state3, {'name': 'Espinajo'}, FixedRandom(0.0), respond=False)
        self.assertFalse(state3['combat']['prepared'])
        self.assertEqual(state3['combat']['_response']['accuracy'], profile['accuracy'] - 15)

    def test_artifice_actions(self):
        profile = dict(m.PROFILES['espinajo_rastrojo'])
        # 1. Tiro de Interrupción interrupts preparation
        state = m.new_state('humano', 'artifice', 'home', 0); state['_class'] = 'artifice'
        state['combat'] = {'profile': profile, 'hp': 40, 'prepared': True, 'round': 0, 'cooldown': 0, 'intervention': {'id': 'tiro_interrupcion'}}
        lines, outcome = m.resolve_round(state, {'name': 'Espinajo'}, FixedRandom(0.0), respond=False)
        self.assertFalse(state['combat']['prepared'])
        self.assertLess(state['combat']['hp'], 40)

        # 2. Traba de Campo reduces damage and inflicts trap damage
        state2 = m.new_state('humano', 'artifice', 'home', 0); state2['_class'] = 'artifice'
        state2['combat'] = {'profile': profile, 'hp': 40, 'prepared': True, 'round': 0, 'cooldown': 0, 'intervention': {'id': 'traba_campo'}}
        lines2, outcome2 = m.resolve_round(state2, {'name': 'Espinajo'}, FixedRandom(0.0), respond=False)
        self.assertEqual(state2['combat']['hp'], 36) # 40 - 4 trap damage
        self.assertGreaterEqual(state2['combat']['_response']['reduction'], 0.25)

        # 3. Bálsamo de Campo heals 15 HP and reduces fatigue
        state3 = m.new_state('humano', 'artifice', 'home', 0); state3['_class'] = 'artifice'
        state3['hp'] = 70; state3['fatigue'] = 50
        state3['combat'] = {'profile': profile, 'hp': 40, 'prepared': False, 'round': 0, 'cooldown': 0, 'intervention': {'id': 'balsamo_campo'}}
        lines3, outcome3 = m.resolve_round(state3, {'name': 'Espinajo'}, FixedRandom(0.0), respond=False)
        self.assertEqual(state3['hp'], 85)
        self.assertLess(state3['fatigue'], 50)

    def test_cooldowns_and_exposure_in_actions(self):
        # Character actions in combat exposes all 2-3 class actions with id, label, description
        state = m.new_state('humano', 'arcano', 'home', 0)
        state['combat'] = {'creature': 'mordelinde', 'profile': dict(m.PROFILES['mordelinde']), 'hp': 28, 'round': 0, 'cooldown': 0}
        char = {'id': 1, 'name': 'Prueba', 'species': 'humano', 'class_id': 'arcano', 'state': state}
        acts = self.engine.actions(char, {'flags': [], 'deaths': {}})
        
        act_ids = [a['id'] for a in acts]
        self.assertIn('impulso_arcano', act_ids)
        self.assertIn('velo_contencion', act_ids)
        self.assertIn('destello_frio', act_ids)

        # Check required fields
        for aid in ('impulso_arcano', 'velo_contencion', 'destello_frio'):
            item = next(a for a in acts if a['id'] == aid)
            self.assertIn('label', item)
            self.assertIn('description', item)
            self.assertIn('disabled', item)
            self.assertIn('reason', item)
            self.assertFalse(item['disabled'])

        # After using destello_frio, it goes on cooldown
        state['combat']['intervention'] = {'id': 'destello_frio'}
        m.resolve_round(state, {'name': 'Mordelinde'}, FixedRandom(0.0), respond=False)
        acts_after = self.engine.actions(char, {'flags': [], 'deaths': {}})
        destello_after = next(a for a in acts_after if a['id'] == 'destello_frio')
        self.assertTrue(destello_after['disabled'])
        self.assertIn('Recarga', destello_after['reason'])

    def test_legacy_capacidad_compatibility(self):
        # When an older client sends action='capacidad', it maps to signature action
        state = m.new_state('humano', 'juramentado', 'home', 0); state['_class'] = 'juramentado'
        state['combat'] = {'profile': dict(m.PROFILES['espinajo_rastrojo']), 'hp': 40, 'prepared': True, 'round': 0, 'cooldown': 0, 'intervention': {'id': 'capacidad'}}
        lines, outcome = m.resolve_round(state, {'name': 'Espinajo'}, FixedRandom(0.0), respond=False)
        self.assertEqual(state['combat']['_response']['guard'], 0.50)
        self.assertTrue(any('Guardia Comprometida' in l['text'] for l in lines))

    def test_requires_classes_in_room_actions(self):
        room = {
            'id': 'test_room',
            'region': 'lethra',
            'kind': 'interior',
            'actions': [
                {'id': 'revelar_runa', 'label': 'Revelar inscripción oculta', 'requires_classes': ['arcano']},
                {'id': 'forzar_reja', 'label': 'Forzar reja pesada', 'requires_classes': ['juramentado']},
            ]
        }
        self.content.rooms['test_room'] = room
        self.content.regions['lethra'] = {'search': False}

        # Arcano sees revelar_runa, does not see forzar_reja
        arc_state = m.new_state('humano', 'arcano', 'home:1', 0)
        arc_state['location'] = 'test_room'
        arc_char = {'id': 1, 'name': 'Prueba', 'species': 'humano', 'class_id': 'arcano', 'state': arc_state}
        arc_acts = [a['id'] for a in self.engine.actions(arc_char, {'flags': [], 'deaths': {}})]
        self.assertIn('revelar_runa', arc_acts)
        self.assertNotIn('forzar_reja', arc_acts)

        # Juramentado sees forzar_reja, does not see revelar_runa
        jur_state = m.new_state('humano', 'juramentado', 'home:2', 0)
        jur_state['location'] = 'test_room'
        jur_char = {'id': 2, 'name': 'Prueba', 'species': 'humano', 'class_id': 'juramentado', 'state': jur_state}
        jur_acts = [a['id'] for a in self.engine.actions(jur_char, {'flags': [], 'deaths': {}})]
        self.assertIn('forzar_reja', jur_acts)
        self.assertNotIn('revelar_runa', jur_acts)

if __name__ == '__main__':
    unittest.main()
