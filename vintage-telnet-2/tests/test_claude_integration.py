"""MUD delivery invariants; only isolated characters and deterministic RNG."""
import unittest,random,copy
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine
ROOT=Path(__file__).resolve().parents[1]
class ClaudeIntegrationTests(unittest.TestCase):
 def setUp(self):
  self.content=Content(ROOT/'content');self.now=43200;self.engine=Engine(self.content,lambda:self.now)
  self.state=m.new_state('marevyn','juramentado','home:test',self.now)
  self.char={'id':9,'status':'approved','name':'Revisión','species':'marevyn','class_id':'juramentado','state':self.state}
  self.world={'version':0,'flags':[],'deaths':{},'weather':{}}
 @unittest.skip("Superseded by class combat redesign (Phase 1)")
 def test_prose_preserves_combat_state_outcomes_and_rng(self):
  ns=dict(vars(m));exec((ROOT/'tests/fixtures/combat_before_claude.py.txt').read_text(),ns);before=ns['resolve_round']
  cases=0
  for cls in m.CLASSES:
   for seed in range(30):
    for action in ['atacar','esquivar','bloquear','resistir','huir','capacidad']:
     for respond in [True,False]:
      state=m.new_state('humano',cls,'home:test',0);state['_class']=cls
      state['combat']={'hp':25,'profile':{'level':2,'hp':30,'damage':7,'accuracy':65,'reduction':.1,'evasion':0},'round':seed%7,'cooldown':0,'prepared':False,'intervention':{'id':action}}
      creature={'id':'mordelinde','name':'Mordelinde'};a=copy.deepcopy(state);b=copy.deepcopy(state);ra=random.Random(seed);rb=random.Random(seed)
      ea,oa=before(a,creature,ra,respond);eb,ob=m.resolve_round(b,creature,rb,respond)
      self.assertEqual(a,b);self.assertEqual(oa,ob);self.assertEqual(ra.getstate(),rb.getstate());cases+=1
  self.assertEqual(cases,1440)
 def test_rescued_boat_is_not_still_in_the_bottom(self):
  self.state['location']='lethra_orilla_silente';self.world['flags']=['lethra_barquita_rescatada']
  room=self.engine.room(self.char,self.world)
  self.assertFalse(self.engine.allowed(room['examine']['fondo'],self.state,self.world))
  self.assertIn('barquita',room['examine']['raíces'])
  self.assertNotIn('sol',next(a for a in room['actions'] if a['id']=='lethra_secreto_barquita')['text'])
 def test_deliberate_look_full_and_danger_first_on_return(self):
  self.state['location']='edran_surcos';self.state['visits']['edran_surcos']=4
  lines=self.engine.narrative(self.char,self.world,'navigation')
  self.assertEqual(lines[0]['text'],self.engine.room(self.char,self.world)['brief'])
  self.assertEqual(lines[1]['kind'].upper(),'DANGER')
  self.assertEqual(self.engine.narrative(self.char,self.world,'mirar')[0]['kind'].upper(),'LOOK')
 def test_echo_does_not_mutate_polling_and_is_finite(self):
  self.state['location']='valdren_plaza';self.state['arrived_at']=self.now;self.state['visits']['valdren_plaza']=1
  self.assertTrue(self.content.rooms['valdren_plaza'].get('echoes'))
  echoes=self.content.rooms['valdren_plaza']['echoes'];texts={x['text'] if isinstance(x,dict) else x for x in echoes}
  initial=self.engine.narrative(self.char,self.world,'navigation');self.assertFalse(texts & {x['text'] for x in initial})
  self.now+=70;before=copy.deepcopy(self.state);lines=self.engine.narrative(self.char,self.world,'navigation');self.assertEqual(self.state,before)
  self.assertTrue(texts & {x['text'] for x in lines})
  self.now+=75*len(echoes);self.assertFalse(texts & {x['text'] for x in self.engine.narrative(self.char,self.world,'navigation')})
 def test_secrets_count_personal_participation_only(self):
  self.world['flags']=['lethra_barquita_rescatada'];self.assertEqual(self.engine.snapshot(self.char,self.world)['secrets']['found'],0)
  self.state['flags'].append('participated:lethra_barquita_rescatada');self.assertEqual(self.engine.snapshot(self.char,self.world)['secrets']['found'],1)
