"""Brother-mode social actions through two authenticated game clients."""
import test_engine as fixture


class SocialTests(fixture.unittest.TestCase):
    setUp = fixture.JourneyTests.setUp
    post = fixture.JourneyTests.post
    create = fixture.JourneyTests.create
    action = fixture.JourneyTests.action
    def other(self, name):
        client = self.app.test_client()
        self.post(client, '/api/account/register', {'username':name.lower(), 'password':'isolated-pass-123'})
        created = self.post(client, '/api/character/create', {'name':name, 'species':'humano', 'class_id':'artifice'})
        self.post(self.master, '/api/master/approve', {'character_id':created.json['character']['id']})
        return client

    def social(self, client, text):
        self.sequence += 1
        result = self.post(client, '/api/action', {'id':'social','text':text,'request_id':f'social-action-{self.sequence}'})
        self.assertEqual(result.status_code, 200, result.json)
        return result.json

    def common_room(self, other):
        for client, request_id in ((self.client,'home-exit-main'),(other,'home-exit-other')):
            result = self.post(client, '/api/action', {'id':'mover','target':'salir','request_id':request_id})
            self.assertEqual(result.status_code,200,result.json)
        main_state=self.client.get('/api/state').json;other_state=other.get('/api/state').json
        self.assertNotIn('Vaisork', {p['name'] for p in main_state['social']['online_players']})
        self.assertEqual({p['name'] for p in main_state['social']['online_players']},{'Matias'})
        self.assertEqual({p['name'] for p in other_state['social']['online_players']},{'Camino'})

    def test_group_follow_and_shared_movement(self):
        self.create()
        other = self.other('Matias')
        self.common_room(other)
        result = self.social(self.client, 'grupo invitar Matias')
        self.assertIn('Matias', result['social']['online_players'][0]['name'])
        self.social(other, 'grupo aceptar')
        self.social(self.client, 'seguir Matias')
        self.post(other, '/api/action', {'id':'mover','target':'norte','request_id':'leader-moves-north'})
        state = self.client.get('/api/state').json
        self.assertEqual(state['character']['location'], 'field')
        self.assertEqual(state['social']['group'][0]['name'], 'Camino')
        self.post(self.client, '/api/action', {'id':'mover','target':'sur','request_id':'follower-moves-alone'})
        self.post(other, '/api/action', {'id':'mover','target':'sur','request_id':'leader-return'})
        self.post(other, '/api/action', {'id':'mover','target':'norte','request_id':'leader-moves-again'})
        self.assertEqual(self.client.get('/api/state').json['character']['location'],'town')

    def test_whisper_who_gift_confirmation_and_single_transfer(self):
        self.create()
        other = self.other('Matias')
        self.common_room(other)
        self.social(self.client, 'susurrar Matias Hola, ¿jugamos juntos?')
        received = other.get('/api/state').json
        self.assertEqual(received['social']['whispers'][-1]['text'], 'Hola, ¿jugamos juntos?')
        self.assertEqual(self.social(self.client, 'quién')['social']['online_players'][0]['name'], 'Matias')
        with self.app.extensions['store'].transaction() as db:
            row = db.execute("SELECT * FROM characters WHERE name='Camino'").fetchone()
            char = self.app.extensions['store'].load(row)
            char['state']['inventory'].append({'id':'gift-test-1','name':'Piedra luminosa','kind':'material','quantity':1})
            self.app.extensions['store'].save(db, char)
        prepared = self.social(self.client, 'dar Piedra luminosa a Matias')
        self.assertEqual(prepared['social']['gift_pending']['to'], 'Matias')
        self.social(self.client, 'confirmar regalo')
        with self.app.extensions['store'].transaction() as db:
            chars = {row['name']:self.app.extensions['store'].load(row) for row in db.execute('SELECT * FROM characters')}
        self.assertNotIn('gift-test-1', [i['id'] for i in chars['Camino']['state']['inventory']])
        self.assertIn('gift-test-1', [i['id'] for i in chars['Matias']['state']['inventory']])

    def test_social_targets_must_be_online_and_whispers_are_rate_limited(self):
        self.create()
        self.client.get('/api/state')
        other = self.other('Matias')
        error = self.post(self.client, '/api/action', {'id':'social','text':'susurrar Matias Hola','request_id':'offline-whisper'});
        self.assertEqual(error.status_code, 400)
        self.common_room(other)
        for index in range(5):
            self.social(self.client, f'susurrar Matias mensaje {index}')
        self.sequence += 1
        limited = self.post(self.client, '/api/action', {'id':'social','text':'susurrar Matias sexto','request_id':f'social-action-{self.sequence}'})
        self.assertEqual(limited.status_code, 400)
        self.assertIn('Espera', limited.json['message'])


if __name__ == '__main__':
    import unittest
    unittest.main()
