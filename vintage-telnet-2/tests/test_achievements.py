"""Achievement book derives cosmetic progress and persists unlock receipts."""
import unittest
from pathlib import Path

from server.achievements import ACHIEVEMENTS, book, goals, update
from server.content import Content
from server.mechanics import new_state
import test_real_content as fixtures


class AchievementRulesTests(unittest.TestCase):
    def setUp(self):
        self.content = Content(Path(__file__).resolve().parents[1] / 'content')
        self.state = new_state('humano', 'juramentado', 'home:humano', 100)
        self.world = {'flags': [], 'dragon_participants': []}

    def test_catalog_has_forty_cosmetic_achievements(self):
        self.assertEqual(len(ACHIEVEMENTS), 40)
        self.state.update(level=10, visited=[f'room-{i}' for i in range(60)],
                          flags=[f'victoria:room:creature-{i}' for i in range(20)])
        before = (self.state['xp'], self.state['seals'])
        unlocked = update(self.state, self.content, self.world)
        self.assertTrue(unlocked)
        self.assertEqual((self.state['xp'], self.state['seals']), before)
        self.assertEqual(book(self.state, self.content, self.world)['total'], 40)

    def test_goals_are_current_world_suggestions(self):
        current = goals(self.state, self.content, self.world)
        self.assertEqual([goal['period'] for goal in current], ['Ahora', 'Esta semana', 'Gran aventura'])
        self.assertTrue(all(goal['title'] and goal['text'] for goal in current))

    def test_social_progress_uses_saved_activity_counts(self):
        self.state['social_stats'] = {'decir': 1, 'dar': 1, 'cooperative_battles': 1, 'grupo': 1}
        unlocked = {entry['id'] for entry in update(self.state, self.content, self.world)}
        self.assertTrue({'social_1', 'social_3', 'social_kinds_4'}.issubset(unlocked))


class AchievementPersistenceTests(unittest.TestCase):
    setUp = fixtures.RealContentTests.setUp
    post = fixtures.RealContentTests.post
    create = fixtures.RealContentTests.create

    def test_unlock_notice_is_saved_once_in_character_state(self):
        self.create()
        store = self.app.extensions['store']
        with store.transaction() as db:
            row = db.execute('SELECT * FROM characters').fetchone()
            character = store.load(row)
            character['state']['visited'] = ['home:humano', *list(self.content.rooms)[:4]]
            store.save(db, character)
        first = self.client.get('/api/state').json
        self.assertEqual(first['character']['goal_book']['total'], 40)
        self.assertEqual(first['character']['goal_book']['entries'][0]['id'], 'explore_5')
        self.assertTrue(any('Nuevo logro: Primeros pasos' in event['text'] for event in first['narrative']))
        with store.transaction() as db:
            saved = store.load(db.execute('SELECT * FROM characters').fetchone())['state']
        self.assertIn('explore_5', saved['achievements'])
        second = self.client.get('/api/state').json
        self.assertEqual(sum('Nuevo logro: Primeros pasos' in event['text'] for event in second['narrative']), 1)


if __name__ == '__main__':
    unittest.main()
