"""Tests for DM username, Vaisork player account, and immortal combat status."""
import json
import tempfile
import unittest
from werkzeug.security import generate_password_hash
from server.app import create_app
from server import mechanics
from server.engine import Engine
from server.content import Content

class VaisorkTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.app = create_app({
            'TESTING': True,
            'DATA_DIR': self.tmp.name,
            'DM_PASSWORD_HASH': generate_password_hash('director-pass-123'),
            'CLOCK': lambda: 123456
        })
        self.client = self.app.test_client()
        self.store = self.app.extensions['store']

    def post(self, c, path, data):
        with c.session_transaction() as s:
            token = s.get('csrf')
        if not token:
            c.get('/api/state')
        with c.session_transaction() as s:
            token = s['csrf']
        return c.post(path, json=data, headers={'X-CSRF-Token': token})

    def test_dm_login_credentials(self):
        # Correct credentials
        r = self.post(self.client, '/api/master/login', {'username': 'vaisork', 'password': 'director-pass-123'})
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json.get('authenticated'))
        with self.client.session_transaction() as s:
            self.assertTrue(s.get('master'))

        # Case-insensitive DM username
        c2 = self.app.test_client()
        r = self.post(c2, '/api/master/login', {'username': 'VAISORK', 'password': 'director-pass-123'})
        self.assertEqual(r.status_code, 200)

        # Incorrect username
        c3 = self.app.test_client()
        r = self.post(c3, '/api/master/login', {'username': 'wrong_user', 'password': 'director-pass-123'})
        self.assertEqual(r.status_code, 401)
        self.assertEqual(r.json.get('message'), 'Acceso DM no autorizado.')

        # Incorrect password
        c4 = self.app.test_client()
        r = self.post(c4, '/api/master/login', {'username': 'vaisork', 'password': 'wrong_password'})
        self.assertEqual(r.status_code, 401)
        self.assertEqual(r.json.get('message'), 'Acceso DM no autorizado.')

        # Missing username
        c5 = self.app.test_client()
        r = self.post(c5, '/api/master/login', {'password': 'director-pass-123'})
        self.assertEqual(r.status_code, 401)
        self.assertEqual(r.json.get('message'), 'Acceso DM no autorizado.')

    def test_reserved_account_register_rejected(self):
        for name in ('vaisork', 'Vaisork', 'VAISORK', '  vaisork  '):
            c = self.app.test_client()
            r = self.post(c, '/api/account/register', {'username': name, 'password': 'valid-pass-123'})
            self.assertEqual(r.status_code, 400)
            self.assertEqual(r.json.get('error'), 'rule')
            self.assertEqual(r.json.get('message'), 'Ese nombre de cuenta está reservado.')

        # Also when DM_USERNAME is custom
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        custom_app = create_app({
            'TESTING': True,
            'DATA_DIR': tmp.name,
            'DM_USERNAME': 'CustomDM',
            'DM_PASSWORD_HASH': generate_password_hash('pass-123'),
            'CLOCK': lambda: 123456
        })
        c_custom = custom_app.test_client()
        for name in ('customdm', 'CustomDM', 'vaisork'):
            r = self.post(c_custom, '/api/account/register', {'username': name, 'password': 'valid-pass-123'})
            self.assertEqual(r.status_code, 400)

    def test_player_login_creates_account_and_character_once_and_activates_master(self):
        # Wrong password fails
        r_fail = self.post(self.client, '/api/account/login', {'username': 'vaisork', 'password': 'wrong-password'})
        self.assertEqual(r_fail.status_code, 401)
        self.assertEqual(r_fail.json.get('message'), 'Cuenta o contraseña incorrecta.')

        # First login with DM credentials creates account and Vaisork character
        r = self.post(self.client, '/api/account/login', {'username': 'Vaisork', 'password': 'director-pass-123'})
        self.assertEqual(r.status_code, 200)
        data = r.json
        self.assertTrue(data.get('authenticated'))
        self.assertEqual(data['account']['username'], 'vaisork')
        self.assertEqual(len(data['characters']), 1)
        self.assertEqual(data['character']['name'], 'Vaisork')
        self.assertEqual(data['character']['species'], 'humano')
        self.assertEqual(data['character']['class_id'], 'juramentado')
        self.assertEqual(data['character']['status'], 'approved')
        self.assertEqual(data['character']['level'], 10)
        self.assertEqual(data['character']['portrait'], '/client/art/players/vaisork-anime-v1.webp')
        self.assertTrue(data['character'].get('vaisork'))

        # session['master'] is active
        with self.client.session_transaction() as s:
            self.assertTrue(s.get('master'))
        # Can access master routes directly
        master_state = self.client.get('/api/master/state')
        self.assertEqual(master_state.status_code, 200)
        self.assertTrue(master_state.json.get('authenticated'))

        # Verify DB contents
        with self.store.transaction() as db:
            char_rows = db.execute("SELECT * FROM characters WHERE name='Vaisork'").fetchall()
            self.assertEqual(len(char_rows), 1)
            char = self.store.load(char_rows[0])
            s = char['state']
            self.assertTrue(s.get('vaisork'))
            self.assertIn('vaisork', s.get('flags', []))
            self.assertEqual(s.get('level'), 10)
            self.assertEqual(s.get('portrait'), '/client/art/players/vaisork-anime-v1.webp')

        # Second login does NOT recreate character
        c2 = self.app.test_client()
        r2 = self.post(c2, '/api/account/login', {'username': 'vaisork', 'password': 'director-pass-123'})
        self.assertEqual(r2.status_code, 200)
        with self.store.transaction() as db:
            count = db.execute("SELECT COUNT(*) FROM characters WHERE name='Vaisork'").fetchone()[0]
            self.assertEqual(count, 1)

    def test_vaisork_cannot_be_defeated_in_combat(self):
        # Login as Vaisork
        r = self.post(self.client, '/api/account/login', {'username': 'vaisork', 'password': 'director-pass-123'})
        self.assertEqual(r.status_code, 200)

        with self.store.transaction() as db:
            char_row = db.execute("SELECT * FROM characters WHERE name='Vaisork'").fetchone()
            vaisork_char = self.store.load(char_row)

        state = vaisork_char['state']
        self.assertTrue(mechanics.is_vaisork(state))

        # 1. resolve_round with fatal creature damage
        deadly_creature = {
            'id': 'deadly_beast',
            'name': 'Bestia Devastadora',
            'profile': {'hp': 100, 'accuracy': 100, 'damage': 9999, 'reduction': 0, 'level': 20}
        }
        state['combat'] = {
            'creature': 'deadly_beast',
            'profile': deadly_creature['profile'],
            'round': 1,
            'hp': 100,
            'cooldown': 0,
            'prepared': False
        }
        state['hp'] = 50

        class FixedRandom:
            def random(self): return 0.01

        events, outcome = mechanics.resolve_round(state, deadly_creature, FixedRandom(), respond=True)
        # Outcome is never 'death'
        self.assertNotEqual(outcome, 'death')
        self.assertEqual(outcome, 'ongoing')
        # HP never drops below 1
        self.assertGreaterEqual(state['hp'], 1)

        # 2. engine.death call does not defeat Vaisork
        e = Engine(Content(self.app.config['CONTENT_DIR']), lambda: 123456)
        with self.store.transaction() as db:
            world = self.store.world(db)
        original_location = state['location']
        state['hp'] = 0  # Even if set to 0 or negative
        e.death(vaisork_char, world)

        # Life never drops below 1, defeat not applied
        self.assertGreaterEqual(vaisork_char['state']['hp'], 1)
        self.assertEqual(vaisork_char['state']['location'], original_location)
        self.assertNotIn('last_recovery', vaisork_char['state'])

        # Compare with normal mortal character
        mortal_state = mechanics.new_state('humano', 'juramentado', 'home:999', 123456)
        mortal_state['combat'] = {
            'creature': 'deadly_beast',
            'profile': deadly_creature['profile'],
            'round': 1,
            'hp': 100,
            'cooldown': 0,
            'prepared': False
        }
        mortal_state['hp'] = 10
        _, mortal_outcome = mechanics.resolve_round(mortal_state, deadly_creature, FixedRandom(), respond=True)
        self.assertEqual(mortal_outcome, 'death')
        self.assertLessEqual(mortal_state['hp'], 0)
