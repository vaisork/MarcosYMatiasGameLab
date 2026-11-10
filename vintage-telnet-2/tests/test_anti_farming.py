"""Tests for anti-farming XP mechanics in combat victories."""
import unittest
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine

ROOT = Path(__file__).resolve().parents[1]

class AntiFarmingTests(unittest.TestCase):
    def setUp(self):
        self.content = Content(ROOT / 'content')
        self.now = 100000
        self.engine = Engine(self.content, lambda: self.now)
        self.state = m.new_state('humano', 'arcano', 'edran_surcos', self.now)
        self.character = {'id': 1, 'name': 'Marcos', 'species': 'humano', 'class_id': 'arcano', 'state': self.state}
        self.world = {'version': 0, 'flags': [], 'deaths': {}, 'weather': {}, 'encounters': {}}

    def _setup_combat(self, player_level, creature_level, creature_id='mordelinde', category='comparable'):
        self.state['level'] = player_level
        self.state['location'] = 'edran_surcos'
        combat = {
            'creature': creature_id,
            'profile': {
                'level': creature_level,
                'family': creature_id,
                'category': category,
                'hp': 20,
                'damage': 5,
                'accuracy': 50,
                'reduction': 0
            },
            'round': 1,
            'hp': 10
        }
        self.state['combat'] = combat
        creature = {'id': creature_id, 'name': 'Criatura de prueba', 'combatant_kind': 'animal'}
        return combat, creature

    def test_comparable_level_awards_full_xp(self):
        combat, creature = self._setup_combat(player_level=2, creature_level=2)
        xp_before = self.state['xp']
        self.engine.victory(self.character, self.world, combat, creature)
        gain = self.state['xp'] - xp_before
        self.assertGreater(gain, 0)
        # Should match standard formula without level gap discount
        expected = m.rounded(min(m.xp_next(2) * 0.12, 0.25 * m.xp_next(2)) * 1.0)
        self.assertEqual(gain, expected)

    def test_five_levels_gap_awards_severely_reduced_xp(self):
        # Level 6 vs Level 1 (delta = 5 -> multiplier 0.15)
        combat, creature = self._setup_combat(player_level=6, creature_level=1)
        xp_before = self.state['xp']
        self.engine.victory(self.character, self.world, combat, creature)
        gain = self.state['xp'] - xp_before
        expected = m.rounded(min(m.xp_next(1) * 0.12, 0.25 * m.xp_next(6)) * 0.15)
        self.assertEqual(gain, expected)
        self.assertLessEqual(gain, 2)

    def test_eight_or_more_levels_gap_awards_zero_xp(self):
        # Marcos (level 21) killing a level 1 creature (delta = 20 >= 8 -> multiplier 0.0)
        combat, creature = self._setup_combat(player_level=21, creature_level=1)
        xp_before = self.state['xp']
        self.engine.victory(self.character, self.world, combat, creature)
        gain = self.state['xp'] - xp_before
        self.assertEqual(gain, 0)

    def test_room_overhunting_reduces_and_zeros_xp_within_hour(self):
        # Even at equal levels, repeated kills in the same room decay within 3600 seconds
        gains = []
        for i in range(5):
            combat, creature = self._setup_combat(player_level=2, creature_level=2, creature_id='mordelinde')
            combat['profile']['family'] = f'fam_{i}'  # ensure family multiplier stays 1.0
            xp_before = self.state['xp']
            self.now += 60  # 1 minute between fights
            self.engine.victory(self.character, self.world, combat, creature)
            gains.append(self.state['xp'] - xp_before)

        # 1st and 2nd should have full multiplier (1.0)
        self.assertGreater(gains[0], 0)
        self.assertEqual(gains[0], gains[1])
        # 3rd should be halved (0.50)
        self.assertLess(gains[2], gains[1])
        # 4th should be quartered (0.25)
        self.assertLess(gains[3], gains[2])
        # 5th should yield 0 XP (overhunted)
        self.assertEqual(gains[4], 0)

    def test_room_hunting_recovers_after_one_hour(self):
        # 4 kills in room
        for i in range(4):
            combat, creature = self._setup_combat(player_level=2, creature_level=2, creature_id='mordelinde')
            combat['profile']['family'] = f'fam_{i}'
            self.now += 60
            self.engine.victory(self.character, self.world, combat, creature)

        # 5th immediate kill yields 0
        combat, creature = self._setup_combat(player_level=2, creature_level=2, creature_id='mordelinde')
        combat['profile']['family'] = 'fam_over'
        xp_before = self.state['xp']
        self.engine.victory(self.character, self.world, combat, creature)
        self.assertEqual(self.state['xp'] - xp_before, 0)

        # Advance clock by 3601 seconds
        self.now += 3601
        combat, creature = self._setup_combat(player_level=2, creature_level=2, creature_id='mordelinde')
        combat['profile']['family'] = 'fam_rested'
        xp_before = self.state['xp']
        self.engine.victory(self.character, self.world, combat, creature)
        gain_after = self.state['xp'] - xp_before
        self.assertGreater(gain_after, 0)

if __name__ == '__main__':
    unittest.main()
