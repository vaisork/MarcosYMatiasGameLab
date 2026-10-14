"""Walk both choices with fresh isolated states, real actions and local exams."""
from collections import deque
from pathlib import Path
import copy
import unittest

from server.content import Content
from server.engine import Engine, RuleError
from server import mechanics as m


CASES = [
    ('korven_notas', 'korven_oma', 'la nota que siempre vuelve',
     ['korven_registro_cauce', 'korven_mirador_grietas', 'korven_plataforma_escucha'],
     ['doblez', 'borde de nota'], ['comparacion', 'ejemplo']),
    ('nhal_bancos', 'nhal_leris', 'un sitio sin tener que hablar',
     ['nhal_patio_relato', 'nhal_cocina_raices', 'nhal_claro_silencio'],
     ['sitio libre', 'hoja doblada'], ['circulo', 'rincon']),
    ('veyra_recados', 'veyra_arel', 'decirlo una sola vez',
     ['veyra_patio_senales', 'veyra_plaza_rutas', 'veyra_huerta_baja'],
     ['letra apretada', 'reverso de tabla'], ['copia', 'turnos']),
]


class RegionalDiscoveryArcsTests(unittest.TestCase):
    def act(self, action, target=None, **extra):
        self.engine.apply(self.char, self.world, dict(id=action, target=target, **extra))

    def walk(self, destination):
        queue = deque([(self.state['location'], [])])
        seen = {self.state['location']}
        while queue:
            room, path = queue.popleft()
            if room == destination:
                for direction in path:
                    moves = self.engine.actions(self.char, self.world)
                    move = next(a for a in moves if a['id'] == 'mover' and a.get('target') == direction)
                    if move.get('disabled'):
                        permit = next(a for a in moves if a['id'].startswith('pedir_permiso'))
                        self.act(permit['id'])
                    self.act('mover', direction)
                return
            for direction, neighbor in self.content.rooms[room]['exits'].items():
                if neighbor not in seen:
                    seen.add(neighbor)
                    queue.append((neighbor, path + [direction]))
        self.fail(f'No route to {destination}')

    def test_every_arc_both_decisions_and_day_night_observations(self):
        for key, npc, topic, rooms, targets, choices in CASES:
            for choice in choices:
                for hour, phase in [(12, 'day'), (22, 'night')]:
                    with self.subTest(arc=key, choice=choice, hour=hour):
                        self.content = Content(Path(__file__).resolve().parents[1] / 'content')
                        self.now = 12 * 3600
                        self.engine = Engine(self.content, lambda: self.now)
                        # Deterministic absence of random wildlife, no story flags seeded.
                        self.engine.rng.random = lambda: .99
                        self.world = {'flags': [], 'deaths': {}, 'version': 0}
                        self.state = m.new_state('humano', 'juramentado', 'home:test', self.now)
                        self.char = dict(id=1, name='Lectura', species='humano',
                                         class_id='juramentado', state=self.state)
                        self.engine.visit(self.state, rooms[0])
                        before = copy.deepcopy({k: self.state[k] for k in ('inventory', 'seals', 'xp')})
                        start = self.engine.room(self.char, self.world)
                        self.assertTrue(any(key + '_pedido' in a.get('set_flags', [])
                                            for a in self.content.npcs[npc]['topics'].values()
                                            if isinstance(a, dict)))
                        with self.assertRaises(RuleError):
                            self.act(key + '_' + choice)
                        self.act('hablar', npc, topic=topic)
                        self.assertEqual(len(self.state['journal']), 1)
                        self.walk(rooms[1])
                        with self.assertRaises(RuleError):
                            self.act(key + '_comparar')
                        self.act('mirar')
                        self.act('observar')
                        self.assertNotIn(targets[0], self.state.get('examined', {}).get(rooms[1], []))
                        self.act('examinar', targets[0])
                        self.act(key + '_comparar')
                        self.assertEqual(len(self.state['journal']), 2)
                        self.walk(rooms[2])
                        self.now = hour * 3600
                        with self.assertRaises(RuleError):
                            self.act(key + '_observar_' + phase)
                        self.act('examinar', targets[1])
                        opposite = 'night' if phase == 'day' else 'day'
                        with self.assertRaises(RuleError):
                            self.act(key + '_observar_' + opposite)
                        self.act(key + '_observar_' + phase)
                        self.assertEqual(len(self.state['journal']), 3)
                        self.act('examinar', 'broma pequeña')
                        egg = self.state['events'][0]['text']
                        self.assertGreater(len(egg), 60)
                        self.now = 12 * 3600
                        self.walk(rooms[0])
                        self.act(key + '_' + choice)
                        self.assertEqual(len(self.state['journal']), 4)
                        selected = key + '_' + choice
                        other = key + '_' + next(c for c in choices if c != choice)
                        self.assertIn(selected, self.state['flags'])
                        self.assertNotIn(other, self.state['flags'])
                        with self.assertRaises(RuleError):
                            self.act(other)
                        with self.assertRaises(RuleError):
                            self.act(selected)
                        self.walk(rooms[1])
                        self.walk(rooms[0])
                        person = next(p for p in self.engine.people(
                            self.engine.room(self.char, self.world), self.state, self.world,
                            self.engine.ambient(start, self.world)) if p['id'] == npc)
                        self.assertEqual(person['description'], self.content.npcs[npc]['memory'][selected])
                        self.act('hablar', npc, topic=topic)
                        self.assertEqual(len(self.state['journal']), 4)
                        for room_id in rooms:
                            self.walk(room_id)
                            room = self.engine.room(self.char, self.world)
                            memories = [v for v in room['memories']
                                        if self.engine.allowed(v, self.state, self.world)]
                            self.assertIn(person['description'], memories[-1]['text'])
                        self.assertEqual(before, {k: self.state[k] for k in before})
                        self.assertEqual(self.world['flags'], [])
