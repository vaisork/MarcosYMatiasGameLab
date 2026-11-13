"""Cumbres must challenge a strong player (Marcos, nivel 23, 2026-11-10) without one-shot kills."""
import random
import unittest
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine

ROOT = Path(__file__).resolve().parents[1]


def marcos(level=23):
    """Marcos' real build read from the Pi: arcano de los ecos, Grieta gear, many potions."""
    state = m.new_state('humano', 'arcano', 'home:humano', 0)
    state.update(level=level, fatigue=0, armor_reduction=.27, especializacion={'id': 'arcano_ecos'},
                 attributes={'fuerza': 15, 'resistencia': 17, 'agilidad': 15, 'percepcion': 19, 'intelecto': 19, 'voluntad': 12, 'destreza': 16, 'presencia': 11})
    state['inventory'] = [
        {'id': 'baculo', 'name': 'Báculo', 'kind': 'weapon', 'damage': 18, 'focus': True, 'bonus': {'vida': 25, 'precision': 3}},
        {'id': 'amuleto', 'name': 'Amuleto', 'kind': 'accessory', 'bonus': {'vida': 25, 'esquiva': 4}},
        {'id': 'anillo', 'name': 'Anillo', 'kind': 'accessory', 'bonus': {'dano': 2}},
        {'id': 'pocion_menor', 'kind': 'consumable', 'effect': 'potion', 'heal': .25, 'name': 'Poción menor', 'quantity': 36}]
    state['equipment'] = {'weapon': 'baculo', 'amuleto': 'amuleto', 'anillo': 'anillo'}
    state['hp'] = m.hp_max(state)
    return state


def fight(cid, seed, level=23):
    """Attack every round; drink a potion under 40% life. Returns outcome, rounds, lowest hp, potions, biggest hit."""
    state = marcos(level)
    profile = m.scaled(m.PROFILES[cid], None, state['level'])
    preps = m.preparations_for(profile, profile['hp'])
    prepared = preps[0] if preps else profile.get('prepared_action')
    state['combat'] = {'creature': cid, 'profile': profile, 'hp': profile['hp'], 'round': 0,
                       'prepared': bool(prepared), 'prepared_action': prepared, 'cooldown': 0}
    rng, low, potions, biggest = random.Random(seed), state['hp'], 0, 0
    for rounds in range(1, 300):
        if state['hp'] < .4 * m.hp_max(state) and any(i['id'] == 'pocion_menor' for i in state['inventory']):
            state['combat']['intervention'] = {'id': 'usar', 'target': 'pocion_menor'}
            potions += 1
        before = state['hp']
        _, outcome = m.resolve_round(state, {'name': cid}, rng)
        biggest, low = max(biggest, before - state['hp']), min(low, state['hp'])
        if outcome != 'ongoing':
            return outcome, rounds, low, potions, biggest
    return 'timeout', rounds, low, potions, biggest


class CumbresRetoTests(unittest.TestCase):
    def summary(self, cid, n=30):
        results = [fight(cid, seed) for seed in range(n)]
        wins = [r for r in results if r[0] == 'victory']
        hp = m.hp_max(marcos())
        return (len(wins) / n, sum(r[1] for r in wins) / len(wins), min(r[2] for r in wins) / hp,
                sum(r[3] for r in wins) / len(wins), max(r[4] for r in results) / hp)

    def test_regular_creature_is_winnable_but_costs_life(self):
        win, rounds, lowest, potions, biggest = self.summary('draco_forja')
        self.assertGreaterEqual(win, .9)
        self.assertGreaterEqual(rounds, 12)
        self.assertLess(lowest, .5)  # he feels it: drops below half life at some point
        self.assertGreaterEqual(potions, 1)
        self.assertLess(biggest, .25)  # no one-shot

    def test_boss_is_a_feat(self):
        win, rounds, lowest, potions, biggest = self.summary('vaelok_forjador')
        self.assertGreaterEqual(win, .8)
        self.assertGreaterEqual(rounds, 30)
        self.assertGreaterEqual(potions, 6)
        self.assertLess(biggest, .25)

    def test_creatures_never_fall_below_player_level(self):
        for cid in ('plumacresta_ceniza', 'ceniciento_alado'):
            base = m.PROFILES[cid]
            self.assertEqual(m.scaled(base, base['level'], 10)['hp'], base['hp'])
            high = m.scaled(base, base['level'], 30)
            self.assertEqual(high['level'], 30)
            self.assertGreater(high['hp'], base['hp'])
            self.assertLess(high['damage'], base['damage'] * 1.3)  # gentle: tracks player growth
        self.assertEqual(m.scaled(m.PROFILES['cornalomo'], 5, 30), m.PROFILES['cornalomo'])

    def test_boss_keeps_damage_after_a_fall_or_flight(self):
        # Javier 12/11: que Marcos farmee; el jefe conserva el daño entre intentos.
        content = Content(ROOT / 'content')
        engine = Engine(content, lambda: 100000, rng=random.Random(3))
        world = {'version': 0, 'flags': [], 'deaths': {}, 'weather': {}, 'encounters': {}, 'legends': {},
                 'creature_states': {'cumbres_salon_ceniza:vaelok_forjador': {'hp': 161}}}
        state = marcos()
        state['location'] = 'cumbres_salon_ceniza'
        character = {'id': 6, 'name': 'Marcos', 'species': 'humano', 'class_id': 'arcano', 'status': 'approved', 'state': state}
        if any(a['id'] == 'acercarse' and a.get('target') == 'vaelok_forjador' for a in engine.actions(character, world)):
            engine.apply(character, world, {'id': 'acercarse', 'target': 'vaelok_forjador'})
        engine.apply(character, world, {'id': 'combatir', 'target': 'vaelok_forjador'})
        self.assertEqual(state['combat']['hp'], 161)


    def test_each_fall_softens_the_creature_until_victory(self):
        content = Content(ROOT / 'content')
        engine = Engine(content, lambda: 100000, rng=random.Random(3))
        world = {'version': 0, 'flags': [], 'deaths': {}, 'weather': {}, 'encounters': {}, 'legends': {}, 'creature_states': {}}
        state = marcos()
        state['location'] = 'cumbres_salon_ceniza'
        state['alivio'] = {'vaelok_forjador': 5}
        character = {'id': 6, 'name': 'Marcos', 'species': 'humano', 'class_id': 'arcano', 'status': 'approved', 'state': state}
        if any(a['id'] == 'acercarse' and a.get('target') == 'vaelok_forjador' for a in engine.actions(character, world)):
            engine.apply(character, world, {'id': 'acercarse', 'target': 'vaelok_forjador'})
        engine.apply(character, world, {'id': 'combatir', 'target': 'vaelok_forjador'})
        full = m.scaled(m.PROFILES['vaelok_forjador'], None, state['level'])
        self.assertEqual(state['combat']['hp'], round(full['hp'] * .7))
        self.assertTrue(any('30% menos' in e['text'] for e in state['events']))
        engine.death(character, world)
        self.assertEqual(state['alivio']['vaelok_forjador'], 3)


if __name__ == '__main__':
    unittest.main()
