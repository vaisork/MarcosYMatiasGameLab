"""Behavior discovery through the API, using isolated characters and SQLite."""
import copy
import unittest
from server.engine import Engine, RuleError
import test_real_content as fixtures

class BestiaryBehaviorTests(unittest.TestCase):
 setUp=fixtures.RealContentTests.setUp
 post=fixtures.RealContentTests.post
 create=fixtures.RealContentTests.create
 action=fixtures.RealContentTests.action
 def prepare(self):
  self.create()
  self.store=self.app.extensions['store'];self.engine=Engine(self.content,self.clock)
  with self.store.transaction() as db:
   char=self.store.load(db.execute('SELECT * FROM characters').fetchone())
   char['state']['location']='lethra_juncal_abierto'
   self.store.save(db,char)
  self.cid='pinzajunco'
 def entry(self,snapshot):return next(e for e in snapshot['bestiary'] if e['id']==self.cid)
 def raw(self):
  with self.store.transaction() as db:return self.store.load(db.execute('SELECT * FROM characters').fetchone())
 def test_each_examination_learns_one_authored_fact_and_persists(self):
  self.prepare()
  first=self.action('mirar');self.assertEqual(self.entry(first)['behavior'],[])
  creature=self.engine.content.creatures[self.cid]
  expected=[creature[f] for f in ('warning','presagio','habitat') if creature.get(f)]
  for index,text in enumerate(expected,1):
   snapshot=self.action('examinar_criatura',self.cid)
   self.assertEqual(self.entry(snapshot)['behavior'],expected[:index])
   self.assertEqual([e['text'] for e in snapshot['narrative'] if e['text'].startswith('Aprendes algo nuevo: ')],['Aprendes algo nuevo: '+text])
   self.assertEqual(self.raw()['state']['bestiary'][self.cid]['behavior'],expected[:index])
   self.assertEqual(self.entry(self.client.get('/api/state').json)['behavior'],expected[:index])
  done=self.action('examinar_criatura',self.cid)
  self.assertEqual(self.entry(done)['behavior'],expected)
  self.assertIn('Ya conoces todos',str(done['narrative']))
  self.post(self.client,'/api/account/logout',{})
  self.post(self.client,'/api/account/login',{'username':'tester','password':'testpass123'})
  self.assertEqual(self.entry(self.client.get('/api/state').json)['behavior'],expected)
 def test_old_entry_read_does_not_mutate_and_observation_learns(self):
  self.prepare();self.action('mirar')
  with self.store.transaction() as db:
   char=self.store.load(db.execute('SELECT * FROM characters').fetchone())
   char['state']['bestiary'][self.cid].pop('behavior',None);self.store.save(db,char)
  self.assertEqual(self.entry(self.client.get('/api/state').json)['behavior'],[])
  self.assertNotIn('behavior',self.raw()['state']['bestiary'][self.cid])
  snapshot=self.action('observar')
  self.assertEqual(len(self.entry(snapshot)['behavior']),1)
  available=[f for f in ('warning','presagio','habitat') if self.engine.content.creatures[self.cid].get(f)]
  self.assertEqual(len(self.entry(self.action('examinar_criatura',self.cid))['behavior']),min(2,len(available)))
 def test_live_presence_local_prose_deduplication_and_humans(self):
  self.prepare();self.action('mirar');char=self.raw();world={'flags':[],'deaths':{}}
  room=self.engine.content.rooms['lethra_juncal_abierto']
  room['adversary_prose']={self.cid:{'warning':'Dato local de prueba.'}}
  nxt=[self.engine.content.creatures[self.cid][f] for f in ('presagio','habitat') if self.engine.content.creatures[self.cid].get(f)][:1]
  for expected in (['Dato local de prueba.'],['Dato local de prueba.']+nxt):
   self.engine.apply(char,world,{'id':'examinar_criatura','target':self.cid})
   self.assertEqual(char['state']['bestiary'][self.cid]['behavior'],expected)
  world['deaths']['lethra_juncal_abierto:pinzajunco']=self.clock.now+300
  before=copy.deepcopy(char['state']['bestiary'])
  with self.assertRaises(RuleError):self.engine.apply(char,world,{'id':'examinar_criatura','target':self.cid})
  self.engine.apply(char,world,{'id':'observar'})
  self.assertEqual(char['state']['bestiary'],before)
  self.engine.learn_creature_behavior(char['state'],room,'forajido_camino')
  self.assertNotIn('forajido_camino',char['state']['bestiary'])
 def test_catalog_habitat_and_presagio_are_used_verbatim(self):
  self.prepare();state=self.raw()['state'];cid='mordijunco';creature=self.engine.content.creatures[cid]
  state['bestiary'][cid]={'description':creature['description']}
  room=self.engine.content.rooms['lethra_juncal_abierto']
  expected=[creature[f] for f in ('warning','presagio','habitat')]
  for _ in expected:self.engine.learn_creature_behavior(state,room,cid)
  self.assertEqual(state['bestiary'][cid]['behavior'],expected)
