import unittest
from types import SimpleNamespace

from server.engine import Engine


class SearchResultTests(unittest.TestCase):
    def run_search(self, search, roll):
        room = {'id': 'test-road', 'region': 'test', 'kind': 'road', 'description': 'Hay marcas recientes junto al camino.'}
        engine = object.__new__(Engine)
        engine.encounter = lambda character, world: None
        engine.room = lambda character, world: room
        engine.clock = lambda: 100
        engine.rng = SimpleNamespace(random=lambda: roll)
        engine.content = SimpleNamespace(regions={'test': {'search': search} if search is not None else {}}, items={})
        character = {'state': {'location': room['id'], 'flags': [], 'attributes': {}}}
        engine.search(character, {})
        return character['state']['events'][0]['text']

    def test_search_without_region_table_describes_the_place(self):
        self.assertIn('marcas recientes', self.run_search(None, 0.9))

    def test_search_with_empty_result_lists_describes_the_place(self):
        self.assertIn('marcas recientes', self.run_search({'finds': [], 'traces': [], 'empty': []}, 0.9))


if __name__ == '__main__':
    unittest.main()
