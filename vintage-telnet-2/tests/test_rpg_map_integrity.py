"""Structural integrity of the shared RPG world, without saves or network access."""
import json
from pathlib import Path
import unittest

from server.content import Content, TABLES
from server.engine import Engine
from server import mechanics


ROOT = Path(__file__).resolve().parents[1]


class RpgMapIntegrityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        paths = [ROOT / 'content/world.json',
                 *sorted((ROOT / 'content/regions').glob('*.json'))]
        cls.documents = {path: json.loads(path.read_text(encoding='utf-8'))
                         for path in paths}
        cls.data = {table: {key: value for doc in cls.documents.values()
                           for key, value in doc.get(table, {}).items()}
                    for table in TABLES}
        cls.rooms = cls.data['rooms']

    def test_json_keys_are_unique_before_loading(self):
        # json.loads normally discards an earlier duplicate, hiding broken IDs.
        def unique(pairs):
            result = {}
            for key, value in pairs:
                self.assertNotIn(key, result, f'Duplicate JSON key: {key}')
                result[key] = value
            return result

        paths = [*self.documents, *sorted((ROOT / 'client-rpg/scenes').glob('*.json'))]
        for path in paths:
            with self.subTest(file=str(path.relative_to(ROOT))):
                json.loads(path.read_text(encoding='utf-8'), object_pairs_hook=unique)

    def test_catalog_ids_are_unique_across_files_and_match_keys(self):
        for table in TABLES:
            seen = set()
            for path, document in self.documents.items():
                for key, value in document.get(table, {}).items():
                    with self.subTest(file=path.name, table=table, id=key):
                        self.assertNotIn(key, seen, 'Duplicate ID, even if definitions agree')
                        self.assertEqual(value.get('id', key), key)
                    seen.add(key)

    def test_action_ids_are_unique_within_each_room(self):
        for room_id, room in self.rooms.items():
            with self.subTest(room=room_id):
                ids = [action['id'] for action in room.get('actions', [])]
                self.assertEqual(len(ids), len(set(ids)), ids)

    def test_exit_destinations_exist(self):
        for room_id, room in self.rooms.items():
            for direction, destination in room['exits'].items():
                with self.subTest(room=room_id, direction=direction):
                    self.assertIn(destination, self.rooms)

    def test_exits_have_a_return_unless_explicitly_one_way(self):
        for room_id, room in self.rooms.items():
            exits = room['exits']
            # Optional data annotation: directions, never a hard-coded room exemption.
            one_way = room.get('one_way_exits', [])
            with self.subTest(room=room_id):
                self.assertIsInstance(one_way, list)
                self.assertEqual(len(one_way), len(set(one_way)))
                self.assertTrue(set(one_way).issubset(exits), one_way)
            for direction, destination in exits.items():
                with self.subTest(room=room_id, direction=direction, destination=destination):
                    self.assertIn(destination, self.rooms)
                    if direction not in one_way:
                        # CONTENT_CONTRACT: bends need not use opposite cardinal directions.
                        self.assertIn(room_id, self.rooms[destination]['exits'].values(),
                                      'Missing return exit or explicit one_way_exits annotation')

    def test_all_rooms_are_reachable_from_each_initial_home(self):
        content = Content(ROOT / 'content')
        engine = Engine(content, lambda: 43200)
        for species in ('humano', 'felaryn', 'dravak', 'marevyn', 'vesperi'):
            with self.subTest(species=species):
                state = mechanics.new_state(species, 'juramentado', 'qa-home', 43200)
                home = engine.room({'name': 'QA', 'species': species, 'state': state})
                self.assertEqual(home['id'], state['location'])
                self.assertTrue(home['description'].strip())
                graph = {**self.rooms, home['id']: home}
                pending = [state['location']]
                visited = set()
                while pending:
                    room_id = pending.pop()
                    if room_id in visited:
                        continue
                    visited.add(room_id)
                    self.assertIn(room_id, graph)
                    pending.extend(graph[room_id]['exits'].values())
                self.assertEqual(set(self.rooms) - visited, set(), 'Unreachable authored rooms')

    def test_item_npc_creature_and_room_references_exist(self):
        scalar = {'home_room': 'rooms', 'room': 'rooms', 'accept_room': 'rooms',
                  'next': 'rooms', 'settlement': 'rooms', 'npc': 'npcs',
                  'requires_npc': 'npcs', 'recovery_npc': 'npcs', 'item': 'items',
                  'honing_material': 'items', 'creature': 'creatures'}
        multiple = {'npcs': 'npcs', 'required_rooms': 'rooms', 'discover_rooms': 'rooms',
                    'arrivals': 'rooms', 'shop': 'items', 'buy_items': 'items',
                    'requires_items': 'items', 'consume_items': 'items',
                    'give_items': 'items', 'absent_creatures': 'creatures',
                    'adversary_prose': 'creatures'}

        def check(value, path):
            if isinstance(value, dict):
                for field, child in value.items():
                    location = f'{path}.{field}'
                    if field in scalar or field in multiple:
                        table = scalar.get(field) or multiple[field]
                        refs = [child] if field in scalar else child
                        for ref in refs:
                            with self.subTest(path=location, reference=ref):
                                self.assertIn(ref, self.data[table])
                    check(child, location)
            elif isinstance(value, list):
                for index, child in enumerate(value):
                    check(child, f'{path}[{index}]')

        # Includes conditional actions/topics, loot, shops and quest requirements.
        for table, entries in self.data.items():
            for key, entry in entries.items():
                check(entry, f'{table}.{key}')

    def test_scene_entity_ids_exist_and_are_unique(self):
        for path in sorted((ROOT / 'client-rpg/scenes').glob('*.json')):
            scene = json.loads(path.read_text(encoding='utf-8'))
            with self.subTest(scene=path.name):
                self.assertEqual(scene['room'], path.stem)
                self.assertIn(scene['room'], self.rooms)
            for table in ('npcs', 'creatures'):
                with self.subTest(scene=path.name, table=table):
                    ids = [entity['id'] for entity in scene.get(table, [])]
                    self.assertEqual(len(ids), len(set(ids)), ids)
                    self.assertTrue(set(ids).issubset(self.data[table]), ids)

    def test_every_room_has_a_nonblank_description(self):
        for room_id, room in self.rooms.items():
            descriptions = [room.get('description')]
            descriptions.extend(state['overrides']['description']
                                for state in room.get('states', [])
                                if 'description' in state.get('overrides', {}))
            for index, description in enumerate(descriptions):
                with self.subTest(room=room_id, variant=index):
                    self.assertIsInstance(description, str)
                    self.assertTrue(description.strip(), 'Empty room description')
