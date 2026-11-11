"""Las Cumbres Veladas must feel populated: wilderness rooms roll wildlife like earlier regions."""
import random
import unittest
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine

ROOT = Path(__file__).resolve().parents[1]


class CumbresEnemigosTests(unittest.TestCase):
    def setUp(self):
        self.content = Content(ROOT / 'content')
        self.now = 100000
        self.engine = Engine(self.content, lambda: self.now, rng=random.Random(7))
        self.state = m.new_state('humano', 'arcano', 'home:humano', self.now)
        self.character = {'id': 1, 'name': 'Marcos', 'species': 'humano', 'class_id': 'arcano', 'state': self.state}
        self.world = {'version': 0, 'flags': [], 'deaths': {}, 'weather': {}, 'encounters': {}, 'legends': {}}
        self.wild = [r for r in self.content.rooms.values() if r['region'] == 'cumbres' and r['kind'] == 'wilderness' and not r.get('safe')]

    def signals_at(self, room_id):
        self.state['location'] = room_id
        self.engine.encounter(self.character, self.world)
        return self.engine.room(self.character, self.world).get('signals', [])

    def test_most_wilderness_rooms_hold_a_rival(self):
        pooled = [r for r in self.wild if r.get('wildlife_pool')]
        self.assertGreaterEqual(len(pooled), 25)
        occupied = sum(1 for r in self.wild if self.signals_at(r['id']))
        self.assertGreaterEqual(occupied / len(self.wild), .6, f'{occupied}/{len(self.wild)} salas con enemigos')

    def test_pool_spawns_keep_area_level_not_more_difficult(self):
        for room in self.wild:
            for signal in room.get('wildlife_pool', []):
                self.assertEqual(signal['level'], m.PROFILES[signal['creature']]['level'])

    def test_room_repopulates_after_anti_farming_triggers(self):
        room_id = 'cumbres_tunel_basalto'
        # Five recent victories in this room: anti-farming zeroes XP but must not empty the room.
        self.state['room_victories'] = [{'room': room_id, 'at': self.now} for _ in range(5)]
        seen = 0
        for _ in range(10):
            self.now += 301
            seen += bool(self.signals_at(room_id))
        self.assertGreaterEqual(seen, 5)


if __name__ == '__main__':
    unittest.main()
