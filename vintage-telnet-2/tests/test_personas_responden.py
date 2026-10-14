"""Conversations with existing ambient occupants, using isolated player states."""
import copy
from pathlib import Path
import unittest

from server.content import Content
from server.engine import Engine, RuleError
from server import mechanics as m


ROOMS = (
    'valdren_plaza', 'valdren_huertos', 'valdren_pozo',
    'valdren_patio_carros', 'valdren_graneros', 'edran_cobertizo_campo',
    'khariel_centro', 'hoshai_lavadero_roca', 'hoshai_deposito_comun',
    'hoshai_terraza_cargas', 'narevia_centro', 'lethra_juncal_abierto',
    'lethra_ribera_firme', 'lethra_embarcadero_camino', 'lethra_muelle_vecinal',
)


class PersonasRespondenTests(unittest.TestCase):
    def test_every_conversation_return_memory_and_daytime_presence(self):
        content = Content(Path(__file__).resolve().parents[1] / 'content')
        for room_id in ROOMS:
            with self.subTest(room=room_id):
                now = 12 * 3600
                engine = Engine(content, lambda: now)
                engine.rng.random = lambda: .99
                world = {'flags': [], 'deaths': {}, 'version': 0}
                state = m.new_state('humano', 'juramentado', 'home:test', now)
                char = dict(id=1, name='Visita', species='humano',
                            class_id='juramentado', state=state)
                engine.visit(state, room_id)
                room = content.rooms[room_id]
                first_id = room_id + '_conversar'
                return_id = first_id + '_revisita'
                flag = first_id + '_hecho'
                first = next(a for a in room['actions'] if a['id'] == first_id)
                again = next(a for a in room['actions'] if a['id'] == return_id)
                memory = next(v for v in room['memories'] if flag in v.get('requires_flags', []))
                before = copy.deepcopy({k: state[k] for k in ('inventory', 'seals', 'xp')})
                def act(action):
                    engine.apply(char, world, {'id': action})
                def available():
                    return {a['id'] for a in engine.actions(char, world)}
                self.assertIn(first_id, available())
                self.assertNotIn(return_id, available())
                self.assertFalse(engine.allowed(memory, state, world))
                with self.assertRaises(RuleError):
                    act(return_id)
                act(first_id)
                self.assertIn(first['text'], [e['text'] for e in state['events']])
                self.assertIn(flag, state['flags'])
                self.assertNotIn(flag, world['flags'])
                self.assertNotIn(first_id, available())
                self.assertIn(return_id, available())
                with self.assertRaises(RuleError):
                    act(first_id)
                engine.visit(state, room_id)
                self.assertIn(memory['text'], [e['text'] for e in engine.narrative(char, world)])
                act(return_id)
                self.assertIn(again['text'], [e['text'] for e in state['events']])
                self.assertEqual(before, {k: state[k] for k in before})
                self.assertEqual(world['flags'], [])
                now = 22 * 3600
                self.assertNotIn(return_id, available())
                with self.assertRaises(RuleError):
                    act(return_id)
                state['flags'].remove(flag)
                self.assertNotIn(first_id, available())
                with self.assertRaises(RuleError):
                    act(first_id)
