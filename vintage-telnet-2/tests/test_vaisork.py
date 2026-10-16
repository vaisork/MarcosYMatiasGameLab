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
        self.assertEqual(data['character']['level'], 100)
        self.assertEqual(data['character']['portrait'], '/client/art/players/vaisork-anime-v1.webp')
        self.assertTrue(data['character'].get('vaisork'))
        self.assertEqual(data['character']['attributes'], {a: 100 for a in mechanics.ATTRIBUTES})
        self.assertEqual(data['character']['hp'], mechanics.hp_max(data['character']))

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
            self.assertEqual(s.get('level'), 100)
            self.assertEqual(s.get('portrait'), '/client/art/players/vaisork-anime-v1.webp')
            self.assertEqual(s.get('attributes'), {a: 100 for a in mechanics.ATTRIBUTES})
            self.assertEqual(s.get('hp'), mechanics.hp_max(s))

        # Second login does NOT recreate character
        c2 = self.app.test_client()
        r2 = self.post(c2, '/api/account/login', {'username': 'vaisork', 'password': 'director-pass-123'})
        self.assertEqual(r2.status_code, 200)
        with self.store.transaction() as db:
            count = db.execute("SELECT COUNT(*) FROM characters WHERE name='Vaisork'").fetchone()[0]
            self.assertEqual(count, 1)

    def test_senku_login_is_idempotent_and_preserves_other_numenes(self):
        credentials = {'username': 'vaisork', 'password': 'director-pass-123'}
        first = self.post(self.client, '/api/account/login', credentials)
        senku = first.json['character']['numenes']['bonded'][0]
        self.assertEqual((senku['name'], senku['model'], senku['variant']), ('Senku', 'b', 'senku'))
        self.assertEqual(senku['trust'], 3)
        self.assertEqual(senku['mood'], 'contento')
        self.assertEqual(first.json['character']['numenes']['active'], senku['id'])
        with self.store.transaction() as db:
            row = db.execute("SELECT * FROM characters WHERE name='Vaisork'").fetchone()
            state = json.loads(row['state'])
            other = mechanics.bond_numen(state, 'a', 'Otro', 1)
            mechanics.activate_numen(state, other['id'])
            state['numenes']['bonded'][0]['care']['last_fed'] = 1
            db.execute('UPDATE characters SET state=? WHERE id=?', (json.dumps(state), row['id']))
        second = self.post(self.client, '/api/account/login', credentials).json['character']['numenes']
        self.assertEqual(len(second['bonded']), 2)
        self.assertEqual(second['active'], senku['id'])
        self.assertEqual(second['bonded'][0]['care']['last_fed'], 123456)
        self.assertEqual(second['bonded'][1]['name'], 'Otro')

    def test_senku_resync_preserves_a_full_roster(self):
        credentials = {'username': 'vaisork', 'password': 'director-pass-123'}
        self.post(self.client, '/api/account/login', credentials)
        with self.store.transaction() as db:
            row = db.execute("SELECT * FROM characters WHERE name='Vaisork'").fetchone()
            state = json.loads(row['state'])
            state['numenes'] = {'active': None, 'bonded': [], 'encounters': {}}
            for model in ('a', 'c', 'd'):
                mechanics.bond_numen(state, model, 'Otro ' + model, 1)
            db.execute('UPDATE characters SET state=? WHERE id=?', (json.dumps(state), row['id']))
        result = self.post(self.client, '/api/account/login', credentials).json['character']['numenes']
        self.assertEqual([n['model'] for n in result['bonded']], ['a', 'c', 'd', 'b'])
        self.assertEqual(result['active'], result['bonded'][-1]['id'])

    def test_master_numenes_are_private_and_mood_is_current(self):
        player = self.app.test_client()
        self.post(player, '/api/account/register', {'username': 'normal', 'password': 'valid-pass-123'})
        self.post(player, '/api/character/create', {'name': 'Normal', 'species': 'humano', 'class_id': 'juramentado', 'gender': 'masculino'})
        with self.store.transaction() as db:
            row = db.execute("SELECT * FROM characters WHERE name='Normal'").fetchone()
            state = json.loads(row['state'])
            companion = mechanics.bond_numen(state, 'b', 'Nube', 123456 - 10 * 3600)
            companion['variant'] = 'senku'
            db.execute("UPDATE characters SET state=?,status='approved' WHERE id=?", (json.dumps(state), row['id']))
            cid = row['id']
        self.post(self.client, '/api/account/login', {'username': 'vaisork', 'password': 'director-pass-123'})
        master = self.client.get('/api/master/state').json
        character = next(c for c in master['approved'] if c['id'] == cid)
        self.assertEqual(character['numenes'], [{
            'id': companion['id'], 'model': 'b', 'variant': 'senku', 'name': 'Nube',
            'species_name': mechanics.NUMENES_MODELS['b']['species_name'],
            'active': True, 'mood': 'con hambre'}])
        self.assertEqual(player.get('/api/master/state').status_code, 401)
        public_state = player.get('/api/state').json
        self.assertNotIn('approved', public_state)
        self.assertNotIn('Senku', json.dumps(public_state))
        self.assertNotIn('Vaisork', json.dumps(public_state))

    def test_normal_player_has_no_senku(self):
        self.post(self.client, '/api/account/register', {'username': 'normal', 'password': 'valid-pass-123'})
        self.post(self.client, '/api/character/create', {'name': 'Normal', 'species': 'humano', 'class_id': 'juramentado', 'gender': 'masculino'})
        with self.store.transaction() as db:
            row = db.execute("SELECT * FROM characters WHERE name='Normal'").fetchone()
            self.assertIsNotNone(row)
            self.assertEqual(json.loads(row['state']).get('numenes', {}).get('bonded', []), [])

    def test_vaisork_cannot_be_defeated_in_combat(self):
        # Login as Vaisork
        r = self.post(self.client, '/api/account/login', {'username': 'vaisork', 'password': 'director-pass-123'})
        self.assertEqual(r.status_code, 200)

        with self.store.transaction() as db:
            char_row = db.execute("SELECT * FROM characters WHERE name='Vaisork'").fetchone()
            vaisork_char = self.store.load(char_row)

        state = vaisork_char['state']
        self.assertTrue(mechanics.is_vaisork(state))
        self.assertEqual(state['level'], 100)
        self.assertEqual(state['attributes'], {a: 100 for a in mechanics.ATTRIBUTES})
        self.assertEqual(state['hp'], mechanics.hp_max(state))

        # 1. resolve_round with fatal creature damage: damage is 0, hp never drops
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
        initial_hp = state['hp']

        class FixedRandom:
            def random(self): return 0.01

        events, outcome = mechanics.resolve_round(state, deadly_creature, FixedRandom(), respond=True)
        # Outcome is never 'death'
        self.assertNotEqual(outcome, 'death')
        self.assertEqual(outcome, 'ongoing')
        # Incoming damage is 0: HP never decreases
        self.assertEqual(state['hp'], initial_hp)
        self.assertIsNone(state.get('wound'))
        self.assertTrue(any('0 de daño' in ev.get('text', '') for ev in events))

        # Also test with character having only flag "vaisork"
        flagged_state = mechanics.new_state('humano', 'juramentado', 'home:1', 123456)
        flagged_state['flags'].append('vaisork')
        flagged_state['combat'] = {
            'creature': 'deadly_beast',
            'profile': deadly_creature['profile'],
            'round': 1,
            'hp': 100,
            'cooldown': 0,
            'prepared': False
        }
        initial_flagged_hp = flagged_state['hp']
        flagged_events, flagged_outcome = mechanics.resolve_round(flagged_state, deadly_creature, FixedRandom(), respond=True)
        self.assertEqual(flagged_outcome, 'ongoing')
        self.assertEqual(flagged_state['hp'], initial_flagged_hp)
        self.assertIsNone(flagged_state.get('wound'))
        self.assertTrue(any('0 de daño' in ev.get('text', '') for ev in flagged_events))

        # 2. engine.death call does not defeat Vaisork
        e = Engine(Content(self.app.config['CONTENT_DIR']), lambda: 123456)
        with self.store.transaction() as db:
            world = self.store.world(db)
        original_location = state['location']
        state['hp'] = initial_hp
        e.death(vaisork_char, world)

        # Defeat not applied, location unchanged
        self.assertEqual(vaisork_char['state']['hp'], initial_hp)
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
