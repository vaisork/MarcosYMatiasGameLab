"""Two presentations share one approved character and the authoritative engine."""
from collections import deque
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock

from werkzeug.security import generate_password_hash
from server.app import create_app
from server.content import Content


class RpgParityTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.clock = Mock(return_value=12 * 3600)
        self.app = create_app({
            'TESTING': True, 'DATA_DIR': temp.name,
            'CONTENT_DIR': str(Path(__file__).resolve().parents[1] / 'content'),
            'CLOCK': self.clock, 'RNG': Mock(random=Mock(return_value=0)),
            'DM_PASSWORD_HASH': generate_password_hash('isolated-director-password'),
        })
        self.client = self.app.test_client()
        self.master = self.app.test_client()
        self.sequence = 0
        self.post(self.client, '/api/account/register',
                  {'username': 'parity-tester', 'password': 'isolated-test-password'}, 201)
        created = self.post(self.client, '/api/character/create',
                            {'name': 'Paridad', 'species': 'humano', 'class_id': 'artifice'}, 201)
        self.cid = created['character']['id']
        self.post(self.master, '/api/master/login',
                  {'username': 'vaisork', 'password': 'isolated-director-password'})
        self.post(self.master, '/api/master/approve', {'character_id': self.cid})
        self.home = self.state()['character']['location']
        self.post(self.master, '/api/master/tester', {'character_id': self.cid, 'enabled': True})
        self.travel('valdren_plaza')
        content = Content(Path(self.app.config['CONTENT_DIR']))
        queue = deque([('valdren_plaza', [])])
        seen = {'valdren_plaza'}
        while queue:
            room, directions = queue.popleft()
            if room == 'edran_salida_huertos':
                for direction in directions:
                    self.act(self.offered('mover', direction))
                break
            for direction, target in content.rooms[room]['exits'].items():
                if target not in seen:
                    seen.add(target)
                    queue.append((target, directions + [direction]))
        self.assertEqual(self.state()['character']['location'], 'edran_salida_huertos')

    def post(self, client, path, body, status=200):
        token = client.get('/api/state').json['csrf_token']
        response = client.post(path, json=body, headers={'X-CSRF-Token': token})
        self.assertEqual(response.status_code, status, response.json)
        return response.json

    def state(self):
        response = self.client.get('/api/state')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['character']['id'], self.cid)
        return response.json

    def parity(self, expected):
        # Inventory is top-level in the API; equipment belongs to character.
        for _ in range(2):
            actual = self.state()
            for key in ('character', 'inventory', 'map', 'bestiary', 'quests', 'numenes', 'secrets'):
                self.assertEqual(actual[key], expected[key], key)
        return actual

    def travel(self, destination):
        return self.post(self.client, '/api/character/tester/travel',
                         {'destination': destination, 'recover': True})

    def offered(self, action, target=None):
        choices = [a for a in self.state()['actions']
                   if a['id'] == action and a.get('target') == target and not a.get('disabled')]
        self.assertTrue(choices, (action, target))
        return {key: value for key, value in choices[0].items()
                if key in ('id', 'target', 'confirmed')}

    def act(self, body):
        self.sequence += 1
        payload = dict(body, request_id=f'rpg-parity-{self.sequence:04}')
        return self.parity(self.post(self.client, '/api/action', payload))

    def route(self):
        self.parity(self.state())
        first = self.act({'text': 'este'})
        self.assertEqual(first['character']['location'], 'edran_acequia')
        second = self.act(self.offered('mover', 'norte'))
        self.assertEqual(second['character']['location'], 'edran_surcos')
        return second

    def test_alternating_clients_real_route_and_retries(self):
        before = self.state()
        payload = {'text': 'este', 'request_id': 'parity-retry-movement'}
        moved = self.post(self.client, '/api/action', payload)
        self.assertEqual(moved['character']['location'], 'edran_acequia')
        self.assertGreater(moved['character']['xp'], before['character']['xp'])
        self.post(self.client, '/api/action', payload)
        self.parity(moved)
        self.post(self.client, '/api/action',
                  {'text': 'oeste', 'request_id': payload['request_id']}, 409)
        self.parity(moved)
        self.act(self.offered('mover', 'norte'))
        self.assertEqual(self.state()['character']['location'], 'edran_surcos')
        self.act({'text': 'sur'})
        self.act(self.offered('mover', 'oeste'))
        self.assertEqual(self.state()['character']['location'], 'edran_salida_huertos')

    def test_combat_rounds_victory_material_sale_and_retry(self):
        before = self.route()
        attack = dict(self.offered('combatir', 'espinajo_rastrojo'),
                      request_id='parity-retry-combat')
        started = self.parity(self.post(self.client, '/api/action', attack))
        combat = started['character']['combat']
        for key in ('round', 'next_round', 'hp', 'hp_max', 'prepared_action'):
            self.assertIn(key, combat)
        self.assertEqual(combat['round'], 0)
        self.assertEqual(combat['hp'], combat['hp_max'])
        self.assertTrue(combat['prepared_action'])
        self.act({'text': 'Tiro de Interrupción'})
        self.clock.return_value += 4
        settled = self.parity(self.state())
        self.assertEqual(settled['character']['combat']['round'], 1)
        self.assertLess(settled['character']['combat']['hp'], combat['hp'])
        self.clock.return_value += 40
        won = self.parity(self.state())
        self.assertIsNone(won['character']['combat'])
        self.assertGreater(won['character']['xp'], before['character']['xp'])
        self.assertTrue(any(i['id'] == 'fibra_espinajo' for i in won['inventory']))
        self.post(self.client, '/api/action', attack)
        self.parity(won)
        self.travel('valdren_comedor')
        payload = dict(self.offered('vender', 'fibra_espinajo'), request_id='parity-retry-sale')
        before_sale = self.state()
        sold = self.post(self.client, '/api/action', payload)
        self.assertGreater(sold['character']['seals'], before_sale['character']['seals'])
        self.assertNotEqual(sold['inventory'], before_sale['inventory'])
        self.post(self.client, '/api/action', payload)
        self.parity(sold)

    def test_flee_keeps_progress_and_uses_real_exit(self):
        before = self.route()
        attack = next(a for a in self.state()['actions']
                      if a['id'] == 'combatir' and a.get('target') == 'espinajo_rastrojo')
        self.act({'text': attack['label']})
        self.act(self.offered('huir'))
        self.clock.return_value += 4
        fled = self.parity(self.state())
        self.assertIsNone(fled['character']['combat'])
        self.assertEqual(fled['character']['location'], 'edran_acequia')
        for key in ('xp', 'level', 'seals', 'equipment'):
            self.assertEqual(fled['character'][key], before['character'][key])
        self.assertEqual(fled['inventory'], before['inventory'])

    def test_defeat_is_resolved_by_engine_and_can_return_home(self):
        before = self.route()
        # Only initial health is a fixture; rounds, damage and recovery use the engine.
        store = self.app.extensions['store']
        with store.transaction() as db:
            character = store.load(db.execute('SELECT * FROM characters WHERE id=?', (self.cid,)).fetchone())
            character['state']['hp'] = 1
            store.save(db, character)
        self.act(self.offered('combatir', 'espinajo_rastrojo'))
        self.clock.return_value += 4
        recovered = self.parity(self.state())
        self.assertIsNone(recovered['character']['combat'])
        self.assertGreater(recovered['character']['hp'], 0)
        self.assertLessEqual(recovered['character']['hp'], recovered['character']['hp_max'])
        self.assertEqual(recovered['map']['recovery']['from'], 'edran_surcos')
        self.assertEqual(recovered['map']['recovery']['to'], recovered['character']['location'])
        for key in ('xp', 'level', 'seals', 'equipment'):
            self.assertEqual(recovered['character'][key], before['character'][key])
        self.assertEqual(recovered['inventory'], before['inventory'])
        self.travel('valdren_plaza')
        home = self.act(self.offered('mover', 'hogar'))
        self.assertEqual(home['character']['location'], self.home)
