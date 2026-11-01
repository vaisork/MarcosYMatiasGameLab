"""Tests for connecting content/vaisork.json (DM sheet, NPC topics, and room traces)."""
import json
from pathlib import Path
import tempfile
import unittest
from werkzeug.security import generate_password_hash
from server.app import create_app
from server.content import Content
from server.engine import Engine
from server import mechanics as m


class VaisorkMundoTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(__file__).resolve().parents[1]
        self.raw_vaisork = json.loads((self.root / 'content' / 'vaisork.json').read_text(encoding='utf-8'))
        self.content = Content(self.root / 'content')
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.app = create_app({
            'TESTING': True,
            'DATA_DIR': self.tmp.name,
            'CONTENT_DIR': str(self.root / 'content'),
            'DM_PASSWORD_HASH': generate_password_hash('dm-secret-123'),
            'CLOCK': lambda: 12 * 3600,
        })
        self.player = self.app.test_client()
        self.dm = self.app.test_client()

    def post(self, client, path, data):
        with client.session_transaction() as sess:
            token = sess.get('csrf')
        if not token:
            client.get('/api/state')
        with client.session_transaction() as sess:
            token = sess['csrf']
        return client.post(path, json=data, headers={'X-CSRF-Token': token})

    def test_all_vecinos_npcs_and_rastros_rooms_exist(self):
        self.assertTrue(self.raw_vaisork.get('vecinos'))
        self.assertTrue(self.raw_vaisork.get('rastros'))
        for npc_id, entry in self.raw_vaisork['vecinos'].items():
            with self.subTest(npc=npc_id):
                self.assertIn(npc_id, self.content.npcs)
                topic = entry.get('tema', 'vaisork')
                self.assertEqual(self.content.npcs[npc_id].get('topics', {}).get(topic), entry['texto'])
        for trace in self.raw_vaisork['rastros']:
            room_id = trace['room']
            key = trace['examine_key']
            with self.subTest(room=room_id, examine_key=key):
                self.assertIn(room_id, self.content.rooms)
                self.assertEqual(self.content.rooms[room_id].get('examine', {}).get(key), trace['text'])

    def test_npc_exposes_and_answers_vaisork_topic(self):
        engine = Engine(self.content, lambda: 12 * 3600)
        world = {'flags': [], 'deaths': {}, 'version': 0}
        state = m.new_state('humano', 'juramentado', 'home:test', 12 * 3600)
        npc_id = 'edran_daro'
        room_id = self.content.npcs[npc_id]['home_room']
        engine.visit(state, room_id)
        char = {'id': 1, 'name': 'Viajero', 'species': 'humano', 'class_id': 'juramentado', 'status': 'approved', 'state': state}

        actions = engine.actions(char, world)
        self.assertTrue(any(a['id'] == 'hablar' and a.get('target') == npc_id and a.get('topic') == 'vaisork' for a in actions))
        snap = engine.snapshot(char, world)
        npc_snap = next(n for n in snap['room']['npcs'] if n['id'] == npc_id)
        self.assertIn('vaisork', npc_snap['topics'])

        engine.apply(char, world, {'id': 'hablar', 'target': npc_id, 'topic': 'vaisork'})
        expected = self.raw_vaisork['vecinos'][npc_id]['texto']
        self.assertTrue(any(expected in ev['text'] for ev in state['events']))

    def test_examining_rastro_returns_text_without_rewards_or_items(self):
        engine = Engine(self.content, lambda: 12 * 3600)
        world = {'flags': [], 'deaths': {}, 'version': 0}
        state = m.new_state('humano', 'juramentado', 'home:test', 12 * 3600)
        trace = self.raw_vaisork['rastros'][0]
        engine.visit(state, trace['room'])
        char = {'id': 1, 'name': 'Viajero', 'species': 'humano', 'class_id': 'juramentado', 'status': 'approved', 'state': state}

        actions = engine.actions(char, world)
        self.assertTrue(any(a['id'] == 'examinar' and a.get('target') == trace['examine_key'] for a in actions))
        before_inv = list(state['inventory'])
        before_seals = state['seals']
        before_xp = state['xp']

        engine.apply(char, world, {'id': 'examinar', 'target': trace['examine_key']})
        self.assertTrue(any(trace['text'] in ev['text'] for ev in state['events']))
        self.assertEqual(state['inventory'], before_inv)
        self.assertEqual(state['seals'], before_seals)
        daily_bonus=len(state.get('daily_errands',{}).get('completed',[]))*m.EXPLORATION_XP['behavior']
        self.assertEqual(state['xp'], before_xp+daily_bonus)

    def test_ficha_dm_only_for_master_session_and_cleaned_prose(self):
        # Normal player session
        self.post(self.player, '/api/account/register', {'username': 'jugador1', 'password': 'password123'})
        player_state = self.player.get('/api/state')
        self.assertEqual(player_state.status_code, 200)
        self.assertNotIn('vaisork', player_state.json)
        self.assertNotIn('ficha_dm', player_state.json)

        master_state_unauth = self.player.get('/api/master/state')
        self.assertIn(master_state_unauth.status_code, (401, 403))
        self.assertNotIn('vaisork', master_state_unauth.json)

        master_ficha_unauth = self.player.get('/api/master/vaisork')
        self.assertEqual(master_ficha_unauth.status_code, 403)

        # Master session
        login = self.post(self.dm, '/api/master/login', {'username': 'vaisork', 'password': 'dm-secret-123'})
        self.assertEqual(login.status_code, 200)
        dm_state = self.dm.get('/api/master/state')
        self.assertEqual(dm_state.status_code, 200)
        ficha = dm_state.json.get('vaisork')
        self.assertIsInstance(ficha, dict)
        for key in ('titulo', 'quien_es', 'como_se_ve', 'lo_que_se_dice', 'lo_que_nunca_dice', 'frases'):
            self.assertTrue(ficha.get(key), f'Missing {key} in ficha_dm')
        self.assertNotIn('Su apariencia debe respetar los retratos existentes', ficha['como_se_ve'])
        self.assertEqual(ficha.get('portrait'), '/client/art/players/vaisork-anime-v1.webp')
        self.assertEqual(ficha.get('full_body'), '/client/art/players/vaisork-anime-cuerpo-completo-v1.webp')

        dm_ficha = self.dm.get('/api/master/vaisork')
        self.assertEqual(dm_ficha.status_code, 200)
        self.assertEqual(dm_ficha.json.get('titulo'), ficha['titulo'])


if __name__ == '__main__':
    unittest.main()
