"""Every regional search find needs its discovery text (Cumbres crashed «buscar» without it)."""
import json
import unittest
from pathlib import Path


class SearchFindsText(unittest.TestCase):
    def test_every_find_has_text(self):
        for path in sorted((Path(__file__).parents[1] / 'content' / 'regions').glob('*.json')):
            for rid, region in json.loads(path.read_text(encoding='utf-8'))['regions'].items():
                for find in region.get('search', {}).get('finds', []):
                    self.assertTrue(find.get('text'), f'{rid}: {find["item"]} sin text')


if __name__ == '__main__':
    unittest.main()
