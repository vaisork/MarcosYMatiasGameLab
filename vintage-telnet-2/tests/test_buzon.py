"""Buzón de quejas y mejoras: solo UV.Diaz escribe, lee respuestas y recibe un aviso por respuesta."""
import json
import tempfile
import unittest
from pathlib import Path

from server import social


class BuzonTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.old = social.BUZON_DIR
        social.BUZON_DIR = Path(self.tmp.name)
        self.marcos = {'id': 7, 'name': 'UV.Diaz', 'state': {'location': 'cumbres_salon_ceniza', 'level': 23}}

    def tearDown(self):
        social.BUZON_DIR = self.old
        self.tmp.cleanup()

    def test_only_uv_diaz_can_use_it(self):
        other = {'id': 8, 'name': 'Otro', 'state': {}}
        with self.assertRaises(ValueError):
            social.run(None, {}, other, None, 'buzón hola', 1000.0)

    def test_message_reply_and_single_notice(self):
        self.assertTrue(social.run(None, {}, self.marcos, None, 'Buzón los dragones regeneran vida?', 1000.0))
        saved = json.loads((social.BUZON_DIR / 'buzon.jsonl').read_text(encoding='utf-8'))
        self.assertEqual(saved['text'], 'los dragones regeneran vida?')
        (social.BUZON_DIR / 'buzon-respuestas.json').write_text(json.dumps({saved['id']: 'Ya no: conservan el daño.'}), encoding='utf-8')
        social.buzon_notice(self.marcos)
        social.buzon_notice(self.marcos)
        notices = [e for e in self.marcos['state']['events'] if 'respondió en tu buzón' in e['text']]
        self.assertEqual(len(notices), 1)
        social.run(None, {}, self.marcos, None, 'buzon', 1001.0)
        self.assertIn('Claudi: Ya no: conservan el daño.', self.marcos['state']['events'][-1]['text'])

    def test_fs_gato_can_write_to_the_same_mailbox(self):
        character = {'id': 9, 'name': 'Fs gato', 'state': {}}
        self.assertTrue(social.run(None, {}, character, None, 'buzón el menú no responde', 1000.0))
        saved = json.loads((social.BUZON_DIR / 'buzon.jsonl').read_text(encoding='utf-8'))
        self.assertEqual(saved['name'], 'Fs gato')
        self.assertEqual(saved['text'], 'el menú no responde')

    def test_help_mentions_buzon_only_for_uv_diaz(self):
        import random, sys
        sys.path.insert(0, str(Path(__file__).parent))
        from test_cumbres_reto import marcos, ROOT
        from server.content import Content
        from server.engine import Engine
        engine = Engine(Content(ROOT / 'content'), lambda: 100000, rng=random.Random(1))
        world = {'version': 0, 'flags': [], 'deaths': {}, 'weather': {}, 'encounters': {}, 'legends': {}, 'creature_states': {}}
        for name, shown in (('UV.Diaz', True), ('Fs gato', True), ('Otro', False)):
            state = marcos()
            character = {'id': 6, 'name': name, 'species': 'humano', 'class_id': 'arcano', 'status': 'approved', 'state': state}
            engine.apply(character, world, {'id': 'ayuda', 'target': ''})
            self.assertEqual('buzón' in state['events'][0]['text'].casefold(), shown)


if __name__ == '__main__':
    unittest.main()
