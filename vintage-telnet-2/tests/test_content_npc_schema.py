import json
from pathlib import Path
import tempfile
import unittest

from server.content import Content


class NpcContentSchemaTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'regions').mkdir()

    def write_region(self, name, document):
        (self.root / 'regions' / f'{name}.json').write_text(
            json.dumps(document), encoding='utf-8'
        )

    def test_region_npc_loads_with_matching_id_and_existing_home(self):
        self.write_region('one', {
            'regions': {'one': {'settlement': 'room_one'}},
            'rooms': {'room_one': {'id': 'room_one', 'region': 'one'}},
            'npcs': {'npc_one': {'id': 'npc_one', 'home_room': 'room_one'}},
        })

        content = Content(self.root)

        self.assertEqual(content.npcs['npc_one']['home_room'], 'room_one')

    def test_duplicate_npc_id_is_rejected_even_when_records_match(self):
        record = {'id': 'npc_one', 'home_room': 'room_one'}
        self.write_region('one', {
            'regions': {'one': {'settlement': 'room_one'}},
            'rooms': {'room_one': {'id': 'room_one', 'region': 'one'}},
            'npcs': {'npc_one': record},
        })
        self.write_region('two', {
            'regions': {'two': {'settlement': 'room_two'}},
            'rooms': {'room_two': {'id': 'room_two', 'region': 'two'}},
            'npcs': {'npc_one': record},
        })

        with self.assertRaisesRegex(ValueError, 'Duplicate NPC ID npc_one'):
            Content(self.root)

    def test_npc_id_must_match_catalog_key(self):
        self.write_region('one', {
            'regions': {'one': {'settlement': 'room_one'}},
            'rooms': {'room_one': {'id': 'room_one', 'region': 'one'}},
            'npcs': {'npc_one': {'id': 'other', 'home_room': 'room_one'}},
        })

        with self.assertRaisesRegex(ValueError, 'NPC identity mismatch: npc_one'):
            Content(self.root)

    def test_npc_home_room_must_exist(self):
        self.write_region('one', {
            'regions': {'one': {'settlement': 'room_one'}},
            'rooms': {'room_one': {'id': 'room_one', 'region': 'one'}},
            'npcs': {'npc_one': {'id': 'npc_one', 'home_room': 'missing'}},
        })

        with self.assertRaisesRegex(ValueError, 'Unknown home room for NPC npc_one: missing'):
            Content(self.root)


if __name__ == '__main__':
    unittest.main()
