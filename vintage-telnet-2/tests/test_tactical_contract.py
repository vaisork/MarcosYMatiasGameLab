"""Tactical contract: authored preparations and cooperative Shadow ownership."""
import unittest
from server import mechanics as m
from server.engine import Engine
from server.content import Content
from pathlib import Path
import test_multiplayer as multi

class SequenceRandom:
 def __init__(self,values):self.values=iter(values)
 def random(self):return next(self.values)

class TacticalContractTests(unittest.TestCase):
 def test_non_interruptible_preparation_keeps_attack_and_nonfrontal_guard_is_unavailable(self):
  for cls in ('arcano','artifice','juramentado'):
   state=m.new_state('humano',cls,'home',0);state['_class']=cls;state['location']='edran_arboleda'
   profile=dict(m.PROFILES['espinajo_rastrojo']);profile['prepared_action']={'name':'Ataque lateral','accuracy':60,'interruptible':False,'frontal':False}
   state['combat']={'creature':'espinajo_rastrojo','profile':profile,'hp':40,'prepared':True,'round':0,'cooldown':0,'intervention':{'id':'capacidad'}}
   char={'id':1,'species':'humano','class_id':cls,'state':state}
   engine=Engine(Content(Path(__file__).resolve().parents[1]/'content'),lambda:0)
   choice=state['combat'].pop('intervention')
   sig_id=m.CLASSES[cls]['signature_id']
   action=next(a for a in engine.actions(char,{'flags':[],'deaths':{}}) if a['id'] in ('capacidad',sig_id))
   state['combat']['intervention']=choice
   self.assertEqual(action['disabled'],cls!='artifice')
   m.resolve_round(state,{'name':'Rival'},SequenceRandom([0]),respond=False)
   self.assertTrue(state['combat']['prepared']);self.assertEqual(state['combat']['_response']['accuracy'],60)
   if cls=='juramentado':self.assertEqual(state['combat']['_response']['guard'],0)
   if cls=='artifice':self.assertLess(state['combat']['hp'],40)

class CooperativeShadowTests(unittest.TestCase):
 setUp=multi.MultiplayerTests.setUp
 post=multi.MultiplayerTests.post
 create=multi.MultiplayerTests.create
 action=multi.MultiplayerTests.action
 other=multi.MultiplayerTests.other
 step=multi.MultiplayerTests.step
 def test_secondary_shadow_gets_and_consumes_only_own_opening(self):
  self.create();shadow=self.other('shadow-secondary','sombra')
  for client in (self.client,shadow):self.step(client,'mover','salir');self.step(client,'mover','norte')
  self.action('combatir','espinajo_rastrojo');self.step(shadow,'combatir','espinajo_rastrojo');self.step(shadow,'capacidad')
  self.app.config['RNG']=SequenceRandom([.99,.99,.70,.60,.99])
  self.clock.now+=4;self.client.get('/api/state')
  store=self.app.extensions['store']
  with store.transaction() as db:
   characters=[store.load(row) for row in db.execute('SELECT * FROM characters ORDER BY id')]
   self.assertFalse(characters[0]['state']['combat'].get('opening',False))
   self.assertTrue(characters[1]['state']['combat'].get('opening',False))
  self.clock.now+=4;state=shadow.get('/api/state').json
  self.assertEqual(state['character']['combat']['hp'],31,'60% roll hits only with the secondary Shadow opening')
  with store.transaction() as db:
   characters=[store.load(row) for row in db.execute('SELECT * FROM characters ORDER BY id')]
   self.assertFalse(characters[0]['state']['combat'].get('opening',False))
   self.assertFalse(characters[1]['state']['combat'].get('opening',False))

if __name__=='__main__':unittest.main()
