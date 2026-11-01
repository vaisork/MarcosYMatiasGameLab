import copy
from datetime import datetime, timezone
from pathlib import Path
import unittest

from server import daily_errands, mechanics
from server.content import Content
from server.engine import Engine


class DailyErrandsTests(unittest.TestCase):
    def setUp(self):
        self.content = Content(Path(__file__).resolve().parents[1] / 'content')
        self.now = datetime(2026, 10, 31, 12, tzinfo=timezone.utc).timestamp()
        self.engine = Engine(self.content, lambda: self.now, timezone='UTC')
        self.region = 'edran'
        self.character = {
            'id': 1, 'name': 'Marcos', 'species': 'humano',
            'state': mechanics.new_state('humano', 'juramentado', 'home:test', self.now),
        }
        self.world = {'flags': [], 'deaths': {}, 'version': 1}

    def test_generation_is_deterministic_three_and_region_bound(self):
        date = daily_errands.current_date(self.engine)
        first = daily_errands.generate(self.engine, date, self.region)
        self.assertEqual(first, daily_errands.generate(self.engine, date, self.region))
        self.assertEqual(len(first), 3)
        self.assertEqual(len({item['id'] for item in first}), 3)
        self.assertNotEqual(first, daily_errands.generate(self.engine, date, 'hoshai'))
        self.assertTrue(all(len(daily_errands.generate(self.engine, date, region)) == 3 for region in self.content.regions))

    def test_recados_reward_once_and_finish_streak(self):
        date = daily_errands.current_date(self.engine)
        errands = daily_errands.generate(self.engine, date, self.region)
        state = self.character['state']
        state['events'] = []
        total_reward = 0
        for errand in errands:
            creature = None
            if errand['kind'] == 'visit':
                state['location'] = errand['target']
                intent = {'id': 'mover'}
            elif errand['kind'] == 'examine':
                intent = {'id': 'examinar', 'target': 'cualquier detalle'}
            elif errand['kind'] == 'talk':
                intent = {'id': 'hablar', 'target': errand['target']}
            else:
                creature = errand['target']
                state['location'] = next(room['id'] for room in self.content.rooms.values() if room['region'] == self.region)
                state.setdefault('events', []).append({'kind': 'reward', 'text': 'Vences a una criatura.'})
                intent = {'id': 'atacar'}
            daily_errands.record_action(self.engine, self.character, intent, self.region)
            if creature:
                daily_errands.record_victory(self.engine, self.character, creature, state['location'])
            total_reward += mechanics.EXPLORATION_XP['behavior']
        self.assertEqual(state['xp'], total_reward)
        self.assertEqual(len(state['daily_errands']['completed']), 3)
        self.assertEqual(state['daily_errand_streak'], 1)
        daily_errands.record_action(self.engine, self.character, intent, self.region)
        self.assertEqual(state['xp'], total_reward)
        self.assertEqual(daily_errands.snapshot(self.engine, self.character)['streak'], 1)

    def test_snapshot_does_not_persist_or_penalize_a_missed_day(self):
        state = self.character['state']
        state['daily_errand_streak'] = 4
        state['daily_errand_last_complete_date'] = '2026-10-29'
        before = copy.deepcopy(state)
        today = daily_errands.snapshot(self.engine, self.character)
        self.assertEqual(today['streak'], 0)
        self.assertEqual(len(today['errands']), 3)
        self.assertEqual(state, before)


if __name__ == '__main__':
    unittest.main()
