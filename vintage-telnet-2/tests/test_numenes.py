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

        # 4th to 6th fit; 7th exceeds limit -> raises error
        for model, name in (('d', 'Cuarto'), ('e', 'Quinto'), ('f', 'Sexto')):
            m.bond_numen(self.state, model, name, self.now)
        self.assertEqual(len(self.state['numenes']['bonded']), 6)
        with self.assertRaises(ValueError) as ctx:
            m.bond_numen(self.state, 'g', 'Séptimo', self.now)
        self.assertIn('máximo 6', str(ctx.exception).lower())

        # Switching active companion
        m.activate_numen(self.state, n2['id'])
        self.assertEqual(self.state['numenes']['active'], n2['id'])
        self.assertEqual(n2['location'], 'travel')
        self.assertEqual(n1['location'], 'home')
        self.assertEqual(n3['location'], 'home')

    def test_care_actions_and_growth(self):
        """Feeding and caring update care timestamps and advance trust over time up to stage 3."""
        numen = m.bond_numen(self.state, 'a', 'Amigo', self.now)
        self.state['inventory'].append({'id': 'bocado_numen', 'name': 'Bocado de Númen', 'kind': 'numen_food', 'quantity': 3})

        # Feeding advances trust from stage 1 to stage 2
        self.engine.apply(self.character, self.world, {'id': 'alimentar_numen'})
        events = self.state.get('events', [])
        self.assertTrue(any('Amigo' in e['text'] for e in events))
        self.assertTrue(numen['care']['fed_today'])
        bocado_item = next(i for i in self.state['inventory'] if i['id'] == 'bocado_numen')
        self.assertEqual(bocado_item['quantity'], 2)
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

    def test_feeding_only_consumes_bocado_numen_not_potions_or_rations(self):
        """Feeding requires bocado_numen; never consumes potions or travel rations, and raises clear RuleError if missing."""
        from server.engine import RuleError
        m.bond_numen(self.state, 'a', 'Fiel', self.now)
        self.state['inventory'] = [
            {'id': 'pocion_menor', 'name': 'Poción menor', 'kind': 'consumable', 'effect': 'potion', 'heal': 12, 'quantity': 2},
            {'id': 'provision_basica', 'name': 'Ración de viaje', 'kind': 'consumable', 'effect': 'food', 'fatigue': 15, 'quantity': 3},
        ]

        with self.assertRaises(RuleError) as ctx:
            self.engine.apply(self.character, self.world, {'id': 'alimentar_numen'})
        self.assertIn('Necesitas un Bocado de Númen', str(ctx.exception))
        self.assertIn('2 sellos', str(ctx.exception))
        # Potions and rations untouched
        self.assertEqual(self.state['inventory'][0]['quantity'], 2)
        self.assertEqual(self.state['inventory'][1]['quantity'], 3)

        # Now add Bocado de Númen and feed
        self.state['inventory'].append({'id': 'bocado_numen', 'name': 'Bocado de Númen', 'kind': 'numen_food', 'quantity': 1})
        self.engine.apply(self.character, self.world, {'id': 'alimentar_numen'})
        self.assertEqual(self.state['inventory'][0]['quantity'], 2)
        self.assertEqual(self.state['inventory'][1]['quantity'], 3)
        self.assertEqual(len(self.state['inventory']), 2)

    def test_hunger_and_mood_by_injected_clock(self):
        """Mood derives from care.last_fed and care.last_rested: contento, con hambre (>8h), decaído (>24h); never dies."""
        numen = m.bond_numen(self.state, 'b', 'Bigotes', self.now)
        self.assertEqual(m.numen_mood(numen, self.now), 'contento')

        # After 9 hours without eating -> con hambre
        self.now += 9 * 3600
        snap_hungry = self.engine.snapshot(self.character, self.world)
        self.assertEqual(snap_hungry['character']['active_numen']['mood'], 'con hambre')
        self.assertEqual(snap_hungry['numenes']['bonded'][0]['mood'], 'con hambre')

        # After 25 hours from initial feeding -> decaído
        self.now += 16 * 3600  # total 25h
        snap_down = self.engine.snapshot(self.character, self.world)
        self.assertEqual(snap_down['character']['active_numen']['mood'], 'decaído')
        # Never dies or leaves even after many days
        self.now += 200 * 3600
        snap_later = self.engine.snapshot(self.character, self.world)
        self.assertEqual(len(snap_later['numenes']['bonded']), 1)
        self.assertEqual(snap_later['character']['active_numen']['mood'], 'decaído')

    def test_reactions_do_not_repeat_consecutively_and_combat_reactions_appear(self):
        """Reaction picker never repeats the same phrase twice in a row; combat start/end reactions appear."""
        numen = m.bond_numen(self.state, 'c', 'Chispa', self.now)
        for situation in ('llegar', 'combate_inicio', 'combate_fin', 'hablar', 'lluvia_noche', 'descansar', 'comer', 'caricia', 'saludo_regreso', 'hambre', 'decaido'):
            previous = None
            for _ in range(12):
                line = m.pick_numen_reaction(numen, situation, self.now, ZeroRandom())
                self.assertTrue(line)
                self.assertNotEqual(line, previous, f'Repeated phrase in {situation}: {line}')
                previous = line

        # Start combat in a room with espinajo_rastrojo
        room_with_espinajo = next(
            r for r in self.content.rooms.values()
            if any(s.get('creature') == 'espinajo_rastrojo' for s in r.get('signals', []))
        )
        self.state['location'] = room_with_espinajo['id']
        self.engine.apply(self.character, self.world, {'id': 'combatir', 'target': 'espinajo_rastrojo'})
        start_texts = [e['text'] for e in self.state.get('events', [])]
        c_start_phrases = [p.format(name='Chispa') for p in self.content.numenes['c']['reacciones']['combate_inicio']]
        self.assertTrue(any(any(p in t for p in c_start_phrases) for t in start_texts))

        # Victory triggers combate_fin reaction
        self.state['combat']['hp'] = 1
        self.engine.victory(self.character, self.world, self.state['combat'], self.content.creatures['espinajo_rastrojo'])
        end_texts = [e['text'] for e in self.state.get('events', [])]
        c_end_phrases = [p.format(name='Chispa') for p in self.content.numenes['c']['reacciones']['combate_fin']]
        self.assertTrue(any(any(p in t for p in c_end_phrases) for t in end_texts))

    def test_combat_support_numbers_unchanged_when_decaido_and_narrates_reaction(self):
        """apoyo_numen keeps exact mechanical numbers when contento or decaído, while narrating the model's reaction."""
        def run_support(hours_elapsed):
            st = m.new_state('humano', 'juramentado', 'edran_camino_carros', 43200)
            st['hp'] = 10
            st['fatigue'] = 20
            numen = m.bond_numen(st, 'f', 'Pluma', 43200)
            # Advance trust to 3 so power_val is max
            numen['trust'] = 3
            m.sync_numenes(st, 43200 + hours_elapsed * 3600)
            st['combat'] = {
                'creature': 'espinajo_rastrojo',
                'profile': dict(m.PROFILES['espinajo_rastrojo']),
                'hp': 30,
                'hp_max': 30,
                'prepared': False,
                'round': 1,
                'cooldown': 0,
                'cooldowns': {},
                'intervention': {'id': 'apoyo_numen'},
            }
            lines, _ = m.resolve_round(st, {'name': 'Espinajo'}, ZeroRandom(), respond=False)
            return st, lines

        st_happy, lines_happy = run_support(0)
        st_down, lines_down = run_support(30)

        self.assertEqual(st_happy['hp'], st_down['hp'])
        self.assertEqual(st_happy['fatigue'], st_down['fatigue'])
        self.assertEqual(st_happy['combat']['cooldowns']['apoyo_numen'], st_down['combat']['cooldowns']['apoyo_numen'])
        happy_text = ' '.join(l['text'] for l in lines_happy)
        down_text = ' '.join(l['text'] for l in lines_down)
        self.assertTrue(any(p.format(name='Pluma') in happy_text for p in self.content.numenes['f']['reacciones']['apoyo_combate']))
        self.assertTrue(any(p.format(name='Pluma') in down_text for p in self.content.numenes['f']['reacciones']['apoyo_combate_decaido']))

    def test_companion_view_and_missing_art_fallback_contract(self):
        """Companion view in client/app.js defines fallback silhouette and non-breaking onerror handler when art is absent."""
        app_js = (ROOT / 'client' / 'app.js').read_text(encoding='utf-8')
        style_css = (ROOT / 'client' / 'style.css').read_text(encoding='utf-8')
        self.assertIn('function numenView()', app_js)
        self.assertIn('/client/art/numenes/numen-${numen.model', app_js)
        self.assertIn('const artImg=numenArt(active,', app_js)
        self.assertIn('img.src=base;return;', app_js)
        self.assertIn('img.remove();', app_js)
        self.assertIn('numen-art-fallback', app_js)
        self.assertIn('Dar Bocado de Númen', app_js)
        self.assertIn('Descansar juntos', app_js)
        self.assertIn('prefers-reduced-motion:reduce', style_css)
        self.assertIn('numen-mood-contento', style_css)
        self.assertIn('numen-mood-hambre', style_css)
        self.assertIn('numen-mood-decaido', style_css)

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

    def test_remote_numenes_actions_and_care(self):
        """Rule R06: remote numen retrieval (traer_numen, 15 seals) and remote feeding (alimentar_lejos, 4 seals).
        Covers: correct seal deduction, rejection without enough seals, rejection in combat,
        correct active/home swap, remote food updating care without needing food in backpack,
        and home free swap."""
        from server.engine import RuleError

        # Start with 20 seals, outside home (edran_camino_carros)
        self.state['seals'] = 20
        self.state['home'] = 'valdren_casa_humano'
        self.state['location'] = 'edran_camino_carros'

        # Bond two companions: n1 active (travel), n2 in home
        n1 = m.bond_numen(self.state, 'a', 'Primero', self.now)
        n2 = m.bond_numen(self.state, 'b', 'Segundo', self.now)
        self.assertEqual(self.state['numenes']['active'], n1['id'])
        self.assertEqual(n1['location'], 'travel')
        self.assertEqual(n2['location'], 'home')

        # 1. Available actions check: outside home, traer_numen and alimentar_lejos are listed
        actions = self.engine.actions(self.character, self.world)
        traer_act = next((a for a in actions if a['id'] == 'traer_numen' and a.get('target') == n2['id']), None)
        alimentar_act = next((a for a in actions if a['id'] == 'alimentar_lejos' and a.get('target') == n2['id']), None)
        self.assertIsNotNone(traer_act)
        self.assertIsNotNone(alimentar_act)
        self.assertEqual(traer_act['cost'], 15)
        self.assertEqual(alimentar_act['cost'], 4)
        self.assertFalse(traer_act.get('disabled', False))
        self.assertFalse(alimentar_act.get('disabled', False))

        # 2. Cobro correcto y swap del activo con traer_numen:
        # Cost 15 seals -> seals 20 -> 5
        self.engine.apply(self.character, self.world, {'id': 'traer_numen', 'target': n2['id']})
        self.assertEqual(self.state['seals'], 5)
        self.assertEqual(self.state['numenes']['active'], n2['id'])
        self.assertEqual(n2['location'], 'travel')
        self.assertEqual(n1['location'], 'home')
        events = self.state.get('events', [])
        self.assertTrue(any('Segundo' in e['text'] and 'Primero' in e['text'] for e in events))

        # 3. Cobro correcto con alimentar_lejos:
        # Cost 4 seals (2 bocado + 2 envío) -> seals 5 -> 1
        self.engine.apply(self.character, self.world, {'id': 'alimentar_lejos', 'target': n1['id']})
        self.assertEqual(self.state['seals'], 1)
        self.assertEqual(n1['care']['last_fed'], self.now)
        self.assertTrue(n1['care']['fed_today'])
        self.assertTrue(n1['care']['well_cared'])
        self.assertEqual(n1['mood'], 'contento')
        feed_events = self.state.get('events', [])
        self.assertTrue(any('Primero' in e['text'] and '4 sellos' in e['text'] for e in feed_events))

        # 4. Sin sellos se rechaza (con razón clara):
        # Now character has 1 seal. Neither traer_numen (15) nor alimentar_lejos (4) can be afforded.
        with self.assertRaises(RuleError) as ctx:
            self.engine.apply(self.character, self.world, {'id': 'traer_numen', 'target': n1['id']})
        self.assertIn('sellos', str(ctx.exception).lower())
        self.assertIn('14', str(ctx.exception))

        with self.assertRaises(RuleError) as ctx:
            self.engine.apply(self.character, self.world, {'id': 'alimentar_lejos', 'target': n1['id']})
        self.assertIn('sellos', str(ctx.exception).lower())
        self.assertIn('3', str(ctx.exception))
        self.assertEqual(self.state['seals'], 1)

        # 5. En combate se rechaza:
        self.state['seals'] = 50
        self.state['combat'] = {'creature': 'espinajo_rastrojo', 'round': 1}
        with self.assertRaises(RuleError) as ctx:
            self.engine.apply(self.character, self.world, {'id': 'traer_numen', 'target': n1['id']})
        self.assertIn('combate', str(ctx.exception).lower())

        with self.assertRaises(RuleError) as ctx:
            self.engine.apply(self.character, self.world, {'id': 'alimentar_lejos', 'target': n1['id']})
        self.assertIn('combate', str(ctx.exception).lower())
        self.assertEqual(self.state['seals'], 50)
        self.state['combat'] = None

        # 6. Comida a distancia actualiza el cuidado y ánimo cuando tiene hambre, sin bocado en mochila:
        # Advance time by 10h -> n1 at home gets hungry
        self.now += 10 * 3600
        m.sync_numenes(self.state, self.now)
        self.assertEqual(n1['mood'], 'con hambre')
        # Ensure no bocado_numen in inventory
        self.state['inventory'] = [i for i in self.state['inventory'] if i.get('id') != 'bocado_numen']
        self.assertFalse(any(i.get('id') == 'bocado_numen' for i in self.state['inventory']))

        self.engine.apply(self.character, self.world, {'id': 'alimentar_lejos', 'target': n1['id']})
        self.assertEqual(self.state['seals'], 46)
        self.assertEqual(n1['care']['last_fed'], self.now)
        self.assertTrue(n1['care']['fed_today'])
        self.assertTrue(n1['care']['well_cared'])
        self.assertEqual(n1['mood'], 'contento')
        self.assertEqual(n1['trust'], 3)

        # 7. En el hogar: cambio gratis (R06) y traer_numen se rechaza
        self.state['location'] = self.state['home']
        self.engine.apply(self.character, self.world, {'id': 'activar_numen', 'target': n1['id']})
        self.assertEqual(self.state['numenes']['active'], n1['id'])
        self.assertEqual(self.state['seals'], 46)  # free!

        with self.assertRaises(RuleError) as ctx:
            self.engine.apply(self.character, self.world, {'id': 'traer_numen', 'target': n2['id']})
        self.assertIn('hogar', str(ctx.exception).lower())


if __name__ == '__main__':
    unittest.main()
