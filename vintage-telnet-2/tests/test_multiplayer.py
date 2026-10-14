"""Local communication and one physical cooperative enemy, using authenticated API actions."""
import json
from pathlib import Path
import unittest
import test_engine as fixture
class MultiplayerTests(unittest.TestCase):
 setUp=fixture.JourneyTests.setUp
 post=fixture.JourneyTests.post
 create=fixture.JourneyTests.create
 action=fixture.JourneyTests.action
 def other(self,name,class_id='artifice'):
  c=self.app.test_client();self.post(c,'/api/account/register',{'username':name,'password':'isolated-pass-123'})
  created=self.post(c,'/api/character/create',{'name':name,'species':'humano','class_id':class_id})
  self.post(self.master,'/api/master/approve',{'character_id':created.json['character']['id']})
  return c
 def step(self,c,id,target=None,**extra):
  self.sequence+=1;body={'id':id,'request_id':f'multi-action-{self.sequence}'}
  if target is not None:body['target']=target
  body.update(extra);r=self.post(c,'/api/action',body);self.assertEqual(r.status_code,200,r.json);return r.json
 def test_presence_and_local_chat_expire_and_do_not_cross_rooms_or_repeat(self):
  self.create();other=self.other('local-reader');self.action('mover','salir');self.step(other,'mover','salir')
  self.assertEqual(len(self.client.get('/api/state').json['presence']),1)
  payload={'text':'decir Nos vemos junto al taller.','request_id':'unique-local-message'}
  self.assertEqual(self.post(self.client,'/api/action',payload).status_code,200)
  self.assertEqual(self.post(self.client,'/api/action',payload).status_code,200)
  self.assertEqual(len(other.get('/api/state').json['chat']),1)
  self.step(other,'mover','norte');self.assertFalse(other.get('/api/state').json['chat'])
  self.assertFalse(self.client.get('/api/state').json['presence'])
  self.step(other,'mover','sur');self.assertEqual(len(other.get('/api/state').json['chat']),1)
  self.clock.now+=31;self.assertFalse(self.client.get('/api/state').json['presence'])
  self.action('decir',text='Sólo sigue quien está presente.');state=other.get('/api/state').json
  self.assertEqual(len(state['chat']),1,'Expired recipient must not receive a message retroactively')
  self.clock.now+=600;self.assertFalse(other.get('/api/state').json['chat'])
  self.post(other,'/api/account/logout',{});self.assertFalse(self.client.get('/api/state').json['presence'])
 def test_cooperative_one_enemy_one_response_and_unique_material_with_observer(self):
  file=Path(self.temp.name)/'content/world.json';data=json.loads(file.read_text());data['creatures']['espinajo_rastrojo']['material']='fiber';data['items']['fiber']={'name':'Fibra de prueba','kind':'material','sell_price':4};file.write_text(json.dumps(data))
  self.create();partner=self.other('partner');observer=self.other('observer','sombra')
  for c in (self.client,partner,observer):self.step(c,'mover','salir');self.step(c,'mover','norte')
  self.action('combatir','espinajo_rastrojo');self.step(partner,'combatir','espinajo_rastrojo')
  self.clock.now+=4;a=self.client.get('/api/state').json;b=partner.get('/api/state').json
  self.assertEqual(a['character']['combat']['hp'],23);self.assertEqual(b['character']['combat']['hp'],23)
  self.assertEqual(a['character']['hp'],92);self.assertEqual(b['character']['hp'],100)
  self.clock.now+=8;a=self.client.get('/api/state').json;b=partner.get('/api/state').json;c=observer.get('/api/state').json
  self.assertIsNone(a['character']['combat']);self.assertIsNone(b['character']['combat'])
  self.assertEqual(a['character']['xp'],19);self.assertEqual(b['character']['xp'],19);self.assertEqual(c['character']['xp'],8)
  material=sum(item.get('quantity',0) for state in (a,b,c) for item in state['inventory'] if item['id']=='fiber');self.assertEqual(material,1)
  self.assertEqual(self.client.get('/api/state').json['character']['xp'],19,'Polling cannot award a second victory')
 def test_human_victory_guarantees_each_eligible_reward_once_without_bestiary(self):
  file=Path(self.temp.name)/'content/world.json';data=json.loads(file.read_text())
  data['creatures']['forajido_camino']={'name':'Salteador','combatant_kind':'human','seal_reward':4}
  data['rooms']['field']['signals']=[{'creature':'forajido_camino','text':'Un salteador amenaza la carga.'}];file.write_text(json.dumps(data))
  self.create();partner=self.other('human-partner');observer=self.other('human-observer','sombra')
  for c in (self.client,partner,observer):self.step(c,'mover','salir');self.step(c,'mover','norte')
  self.action('combatir','forajido_camino');self.step(partner,'combatir','forajido_camino')
  self.clock.now+=12;states=[c.get('/api/state').json for c in (self.client,partner,observer)]
  self.assertEqual([s['character']['seals'] for s in states],[24,24,20])
  for s in states:self.assertFalse(any(entry['id']=='forajido_camino' for entry in s['bestiary']))
  for s in states[:2]:self.assertNotIn('no entrega sellos',str(s['narrative']))
  for c in (self.client,partner):self.assertEqual(c.get('/api/state').json['character']['seals'],24)
  with self.app.extensions['store'].transaction() as db:
   chars=[self.app.extensions['store'].load(row) for row in db.execute('SELECT * FROM characters ORDER BY id')]
   self.assertEqual([sum(line['kind']=='combat_seals' for line in c['state']['ledger']) for c in chars],[1,1,0])
 def test_four_day_phases_and_existing_day_guards(self):
  self.create();expected=[(6,'Amanecer'),(12,'Día'),(18,'Atardecer'),(22,'Noche')]
  for hour,phase in expected:
   self.clock.now=hour*3600;self.assertEqual(self.client.get('/api/state').json['ambient']['time_of_day'],phase)
  # Production default is Mexico City (UTC-6): 20:00 UTC is 14:00 local, still day.
  self.app.config['TIMEZONE']='America/Mexico_City';self.clock.now=20*3600
  self.assertEqual(self.client.get('/api/state').json['ambient']['time_of_day'],'Día')
  self.app.config['TIMEZONE']='UTC'
  from server.engine import Engine
  from server.content import Content
  with self.app.extensions['store'].transaction() as db:
   character=self.app.extensions['store'].load(db.execute('SELECT * FROM characters').fetchone())
   world=self.app.extensions['store'].world(db)
  self.clock.now=6*3600;engine=Engine(Content(Path(self.temp.name)/'content'),self.clock)
  self.assertTrue(engine.allowed({'requires_time':['amanecer']},character['state'],world))
  self.assertFalse(engine.allowed({'requires_time':['día']},character['state'],world))
 def test_primary_flee_uses_real_exit_and_enemy_transfers_to_remaining_participant(self):
  self.create();partner=self.other('remaining')
  for client in (self.client,partner):
   self.step(client,'mover','salir');self.step(client,'mover','norte')
  self.action('combatir','espinajo_rastrojo');self.step(partner,'combatir','espinajo_rastrojo')
  self.action('huir');self.clock.now+=4
  left=self.client.get('/api/state').json;remaining=partner.get('/api/state').json
  self.assertEqual(left['room']['id'],'town');self.assertIsNone(left['character']['combat'])
  self.assertEqual(left['character']['hp'],100);self.assertEqual(remaining['character']['hp'],92)
  self.assertEqual(remaining['character']['combat']['hp'],32)
  self.assertEqual(remaining['room']['id'],'field')
if __name__=='__main__':unittest.main()
