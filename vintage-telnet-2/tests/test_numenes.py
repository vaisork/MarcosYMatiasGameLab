"""Tests for Númenes pilot implementation in Vintage Telnet 2.

Covers R01-R10 historical rules: voluntary bonding, legible rejection without penalty,
max 3 bonded / 1 active, custom naming, care, growth, combat support cooldown,
persistence across defeat/respawn, and universal class compatibility.
"""
from pathlib import Path
import unittest
from server.content import Content
from server.engine import Engine
from server import mechanics as m

ROOT = Path(__file__).resolve().parents[1]


class ZeroRandom:
    def random(self):
        return 0.0


class NumenesPilotTests(unittest.TestCase):
    def setUp(self):
        self.now = 43200
        self.content = Content(ROOT / 'content')
        self.engine = Engine(self.content, lambda: self.now)
        self.world = {'flags': [], 'deaths': {}, 'version': 0}
        self.state = m.new_state('humano', 'juramentado', 'edran_camino_carros', self.now)
        self.character = {
            'id': 1,
            'name': 'Valerius',
            'species': 'humano',
            'class_id': 'juramentado',
            'status': 'approved',
            'state': self.state
        }

    def test_all_eight_numenes_loaded(self):
        """All 8 candidate models are loaded from content/numenes.json."""
        self.assertEqual(len(self.content.numenes), 8)
        for model_id in ('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'):
            self.assertIn(model_id, self.content.numenes)
            data = self.content.numenes[model_id]
            self.assertIn('species_name', data)
            self.assertIn('room', data)
            self.assertIn('base', data)
            self.assertIn('anomaly', data)
            self.assertIn('power_name', data)
            self.assertIn('power_desc', data)
            self.assertIn('step1', data)
            self.assertIn('step2', data)
            self.assertIn('rejection', data)

    def test_encounter_telegraph_and_observation(self):
        """Entering candidate room telegraphes presence and allows peaceful observation."""
        self.state['location'] = 'edran_camino_carros'
        narrative = self.engine.narrative(self.character, self.world)
        narrative_texts = ' '.join(e['text'] for e in narrative)
        self.assertIn('perro', narrative_texts.lower())

        actions = self.engine.actions(self.character, self.world)
        obs_action = next((a for a in actions if a['id'] == 'observar_numen' and a.get('target') == 'a'), None)
        self.assertIsNotNone(obs_action)

        # Apply observation
        self.engine.apply(self.character, self.world, {'id': 'observar_numen', 'target': 'a'})
        events = self.state.get('events', [])
        self.assertTrue(len(events) > 0)
        encounters = self.state['numenes']['encounters']
        self.assertIn('a', encounters)
        self.assertEqual(encounters['a']['stage'], 1)

    def test_rejection_legible_and_non_punitive(self):
        """Forcing an encounter results in gentle non-punitive retreat without damage or penalties."""
        self.state['location'] = 'edran_camino_carros'
        self.engine.apply(self.character, self.world, {'id': 'observar_numen', 'target': 'a'})

        hp_before = self.state['hp']
        fatigue_before = self.state['fatigue']

        # Abrupt action
        self.engine.apply(self.character, self.world, {'id': 'forzar_numen', 'target': 'a'})
        events = self.state.get('events', [])
        self.assertTrue(any('retrocede' in e['text'].lower() or 'distancia' in e['text'].lower() or 'piedra' in e['text'].lower() for e in events))
        self.assertEqual(self.state['hp'], hp_before)
        self.assertEqual(self.state['fatigue'], fatigue_before)
        self.assertTrue(self.state['numenes']['encounters']['a']['rejected'])

        # Calming gives space
        self.engine.apply(self.character, self.world, {'id': 'calmar_numen', 'target': 'a'})
        self.assertFalse(self.state['numenes']['encounters']['a']['rejected'])
        self.assertEqual(self.state['numenes']['encounters']['a']['stage'], 1)

    def test_voluntary_bonding_and_custom_naming(self):
        """Patient multi-step approach leads to voluntary bond with player-chosen name."""
        self.state['location'] = 'edran_camino_carros'
        self.engine.apply(self.character, self.world, {'id': 'observar_numen', 'target': 'a'})
        self.engine.apply(self.character, self.world, {'id': 'aproximar_numen', 'target': 'a'})
        self.assertEqual(self.state['numenes']['encounters']['a']['stage'], 2)

        self.engine.apply(self.character, self.world, {'id': 'confiar_numen', 'target': 'a'})
        self.assertEqual(self.state['numenes']['encounters']['a']['stage'], 3)

        # Bond action with name
        self.engine.apply(self.character, self.world, {'id': 'vincular_numen', 'target': 'a', 'name': 'Centella'})
        events = self.state.get('events', [])
        self.assertTrue(any('Centella' in e['text'] for e in events))

        bonded = self.state['numenes']['bonded']
        self.assertEqual(len(bonded), 1)
        active = bonded[0]
        self.assertEqual(active['name'], 'Centella')
        self.assertEqual(active['model'], 'a')
        self.assertEqual(active['trust'], 1)
        self.assertEqual(active['trust_stage'], 'vínculo_naciente')
        self.assertEqual(active['location'], 'travel')
        self.assertEqual(self.state['numenes']['active'], active['id'])

    def test_max_three_bonded_and_single_active_limit(self):
        """Rule R06/I01: At most 3 bonded companions, exactly 1 active in travel."""
        # 1st: bonding model a
        n1 = m.bond_numen(self.state, 'a', 'Primero', self.now)
        self.assertEqual(self.state['numenes']['active'], n1['id'])
        self.assertEqual(n1['location'], 'travel')

        # 2nd: bonding model b
        n2 = m.bond_numen(self.state, 'b', 'Segundo', self.now)
        self.assertEqual(self.state['numenes']['active'], n1['id'])  # 1st remains active
        self.assertEqual(n2['location'], 'home')

        # 3rd: bonding model c
        n3 = m.bond_numen(self.state, 'c', 'Tercero', self.now)
        self.assertEqual(self.state['numenes']['active'], n1['id'])
        self.assertEqual(n3['location'], 'home')
        self.assertEqual(len(self.state['numenes']['bonded']), 3)

        # 4th: exceeds limit -> raises error
        with self.assertRaises(ValueError) as ctx:
            m.bond_numen(self.state, 'd', 'Cuarto', self.now)
        self.assertIn('máximo tres', str(ctx.exception).lower())

        # Switching active companion
        m.activate_numen(self.state, n2['id'])
        self.assertEqual(self.state['numenes']['active'], n2['id'])
        self.assertEqual(n2['location'], 'travel')
        self.assertEqual(n1['location'], 'home')
        self.assertEqual(n3['location'], 'home')

    def test_care_actions_and_growth(self):
        """Feeding and caring update care timestamps and advance trust over time up to stage 3."""
        numen = m.bond_numen(self.state, 'a', 'Amigo', self.now)
        self.state['inventory'].append({'id': 'item_rac', 'name': 'Ración de viaje', 'kind': 'consumable', 'quantity': 2})

        # Feeding advances trust from stage 1 to stage 2
        self.engine.apply(self.character, self.world, {'id': 'alimentar_numen'})
        events = self.state.get('events', [])
        self.assertTrue(any('Amigo' in e['text'] for e in events))
        self.assertTrue(numen['care']['fed_today'])
        self.assertEqual(self.state['inventory'][0]['quantity'], 1)
        self.assertEqual(numen['trust'], 2)
        self.assertEqual(numen['trust_stage'], 'confianza_estable')

        # Caring
        self.engine.apply(self.character, self.world, {'id': 'cuidar_numen'})
        self.assertTrue(numen['care']['well_cared'])

        # Growth on subsequent care routine (advances to stage 3: armonía profunda)
        m.care_numen(self.state, 'alimentar', self.now + 86400)
        self.assertEqual(numen['trust'], 3)
        self.assertEqual(numen['trust_stage'], 'armonía_profunda')

        # Capped at stage 3
        m.care_numen(self.state, 'alimentar', self.now + 172800)
        self.assertEqual(numen['trust'], 3)

    def test_combat_support_cooldown_and_survival(self):
        """Númen provides subtle support in combat with cooldown; companion never takes damage."""
        numen = m.bond_numen(self.state, 'a', 'Guardián', self.now)
        profile = dict(m.PROFILES['espinajo_rastrojo'])
        self.state['combat'] = {
            'creature': 'espinajo_rastrojo',
            'profile': profile,
            'hp': 30,
            'hp_max': 30,
            'prepared': False,
            'round': 1,
            'cooldown': 0,
            'cooldowns': {}
        }

        # Check combat action availability
        actions = self.engine.actions(self.character, self.world)
        support_action = next((a for a in actions if a['id'] == 'apoyo_numen'), None)
        self.assertIsNotNone(support_action)
        self.assertFalse(support_action.get('disabled', False))

        # Use support action
        self.state['combat']['intervention'] = {'id': 'apoyo_numen'}
        creature = {'name': 'Espinajo'}
        lines, outcome = m.resolve_round(self.state, creature, ZeroRandom(), respond=False)
        self.assertTrue(any('Guardián' in l['text'] for l in lines))
        self.assertGreater(self.state['combat']['cooldowns']['apoyo_numen'], 0)

        # Next round it is on cooldown
        actions_after = self.engine.actions(self.character, self.world)
        support_after = next((a for a in actions_after if a['id'] == 'apoyo_numen'), None)
        self.assertTrue(support_after.get('disabled', False))
        self.assertIn('recarga', support_after.get('reason', '').lower())

    def test_persistence_through_death_and_respawn(self):
        """Rule R07/R08: Companion survives character defeat and remains bonded in state."""
        numen = m.bond_numen(self.state, 'a', 'Leal', self.now)
        self.state['location'] = 'edran_camino_carros'
        self.state['combat'] = {'creature': 'espinajo_rastrojo', 'round': 1}

        self.engine.death(self.character, self.world)
        events = self.state.get('events', [])
        # Event confirms companion is safe
        self.assertTrue(any('Leal' in e['text'] and 'a salvo' in e['text'] for e in events))

        # State preserves bonded numen
        bonded = self.state['numenes']['bonded']
        self.assertEqual(len(bonded), 1)
        self.assertEqual(bonded[0]['name'], 'Leal')
        self.assertEqual(self.state['numenes']['active'], numen['id'])

    def test_universal_class_compatibility(self):
        """Rule R04: All 4 character classes can bond with and receive support from any Númen."""
        for class_id in ('juramentado', 'arcano', 'sombra', 'artifice'):
            state = m.new_state('humano', class_id, 'edran_camino_carros', self.now)
            numen = m.bond_numen(state, 'f', f'Ave-{class_id}', self.now)
            self.assertEqual(numen['name'], f'Ave-{class_id}')
            self.assertEqual(state['numenes']['active'], numen['id'])
            active = m.get_active_numen(state)
            self.assertIsNotNone(active)
            self.assertEqual(active['power_name'], 'Calma Cercana')

    def test_numen_name_validation_and_renaming(self):
        """Server trims whitespace, validates 2-24 chars without < > or control chars, and allows renaming."""
        from server.engine import RuleError
        self.state['location'] = 'edran_camino_carros'
        self.engine.apply(self.character, self.world, {'id': 'observar_numen', 'target': 'a'})
        self.engine.apply(self.character, self.world, {'id': 'aproximar_numen', 'target': 'a'})
        self.engine.apply(self.character, self.world, {'id': 'confiar_numen', 'target': 'a'})

        # Invalid names rejected on bonding
        for bad_name in (None, '', 'A', '   X   ', 'NombreDemasiadoLargoParaElNumen', 'Mal<Nombre', 'Mal>Nombre', 'Mal\nNombre', 'Mal\x00Nombre'):
            with self.assertRaises(RuleError):
                self.engine.apply(self.character, self.world, {'id': 'vincular_numen', 'target': 'a', 'name': bad_name})
        self.assertEqual(len(self.state['numenes']['bonded']), 0)

        # Valid name with surrounding spaces is trimmed
        self.engine.apply(self.character, self.world, {'id': 'vincular_numen', 'target': 'a', 'name': '  Relámpago  '})
        bonded = self.state['numenes']['bonded']
        self.assertEqual(len(bonded), 1)
        self.assertEqual(bonded[0]['name'], 'Relámpago')
        numen_id = bonded[0]['id']

        # Action nombrar_numen is exposed while active
        actions = self.engine.actions(self.character, self.world)
        rename_act = next((a for a in actions if a['id'] == 'nombrar_numen' and a.get('target') == numen_id), None)
        self.assertIsNotNone(rename_act)

        # Invalid name rejected on renaming
        for bad_name in ('', 'Z', 'A' * 25, '<script>', 'Con>Mayor', 'Control\tChar'):
            with self.assertRaises(RuleError):
                self.engine.apply(self.character, self.world, {'id': 'nombrar_numen', 'target': numen_id, 'name': bad_name})
        self.assertEqual(bonded[0]['name'], 'Relámpago')

        # Renaming active numen succeeds and trims spaces
        self.engine.apply(self.character, self.world, {'id': 'nombrar_numen', 'target': numen_id, 'name': '  Trueno Fiel  '})
        self.assertEqual(bonded[0]['name'], 'Trueno Fiel')
        self.assertTrue(any('Trueno Fiel' in e['text'] for e in self.state.get('events', [])))

        # Second bonded numen (resting at home) can also be renamed by id
        n2 = m.bond_numen(self.state, 'b', 'Compañero', self.now)
        self.engine.apply(self.character, self.world, {'id': 'nombrar_numen', 'target': n2['id'], 'name': 'Sombra Azul'})
        self.assertEqual(n2['name'], 'Sombra Azul')


if __name__ == '__main__':
    unittest.main()
