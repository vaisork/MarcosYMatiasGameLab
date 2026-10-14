"""Evaluation, persistent clue memories and local examination gates."""
from pathlib import Path
import unittest
from unittest.mock import patch
from server.content import Content
from server.engine import Engine, RuleError
from server import mechanics as m

class EvaluationCluesTests(unittest.TestCase):
 def setUp(self):
  self.content=Content(Path(__file__).resolve().parents[1]/'content')
  self.engine=Engine(self.content,lambda:43200)
  self.world={'flags':[],'deaths':{},'version':0}
  self.state=m.new_state('humano','juramentado','home:test',43200)
  self.char={'id':1,'name':'Prueba','species':'humano','class_id':'juramentado','state':self.state}
 def act(self,action,target=None):self.engine.apply(self.char,self.world,{'id':action,'target':target})
 def test_evaluation_matches_static_and_spawned_combat_profiles(self):
  room=next(r for r in self.content.rooms.values() if r['name']=='Ribera seca')
  for cid,level,spawned in [('pinzajunco',6,True),('pinzajunco',None,False),('cornalomo',6,False)]:
   with self.subTest(creature=cid,level=level,spawned=spawned):
    self.state.update(location=room['id'],combat=None)
    self.world={'flags':[],'deaths':{},'version':0}
    signal={'creature':cid,'text':'Señal de prueba.'}
    if level is not None:signal['level']=level
    room['signals']=[] if spawned else [signal]
    if spawned:self.world['wildlife']={room['id']:{'signal':signal,'until':44000}}
    self.state['bestiary'][cid]={'id':cid}
    expected=m.scaled(m.PROFILES[cid],level)
    self.act('evaluar',cid)
    self.assertIn(f"nivel {expected['level']}.",self.state['events'][0]['text'])
    self.state['wildlife_target']=f"{room['id']}:{cid}"
    self.act('combatir',cid)
    self.assertEqual(self.state['combat']['profile'],expected)
 def test_search_remembers_flagged_clues_once_with_text_and_place(self):
  self.state['location']='edran_prado'
  traces=self.content.regions['edran']['search']['traces']
  clue=next(t for t in traces if isinstance(t,dict) and t.get('flag')=='pista_huella_partida')
  roll=.5+.25*(traces.index(clue)+.5)/len(traces)
  with patch.object(self.engine,'encounter'),patch.object(self.engine.rng,'random',return_value=roll):
   for _ in range(2):self.engine.search(self.char,self.world)
  self.assertEqual(self.state['flags'].count(clue['flag']),1)
  self.assertEqual(self.state['journal'],[f"En Prado de las Marcas Anchas: {clue['text']}"])
 def test_examination_remembers_clue_without_mutating_reads(self):
  self.state['location']='edran_prado';room=self.content.rooms['edran_prado']
  clue=next(t for t in self.content.regions['edran']['search']['traces'] if isinstance(t,dict))
  room['examine']['marcas']=clue
  self.engine.narrative(self.char,self.world,'examinar','marcas')
  self.assertEqual(self.state['journal'],[]);self.assertNotIn(clue['flag'],self.state['flags'])
  for _ in range(2):self.act('examinar','marcas')
  self.assertEqual(self.state['flags'].count(clue['flag']),1)
  self.assertEqual(self.state['journal'],[f"En {room['name']}: {clue['text']}"])
  self.act('examinar','sendero');self.assertEqual(len(self.state['journal']),1)
 def test_secrets_require_their_local_clue_examination(self):
  cases=[('hoshai_mirador_nudo','secreto_f_nudo','nudo','felaryn'),('lethra_cruce_canales','secreto_m_corrientes','hoja','marevyn'),('veyra_archivo_cargas','secreto_h_carga_pendiente','estantes','humano')]
  for rid,action,target,species in cases:
   with self.subTest(room=rid):
    self.state['location']=rid;self.char['species']=species;self.state['species']=species;self.state['examined']={'elsewhere':[target]}
    self.assertNotIn(action,[a['id'] for a in self.engine.actions(self.char,self.world)])
    with self.assertRaises(RuleError):self.act(action)
    self.act('mirar');self.act('observar')
    self.assertNotIn(action,[a['id'] for a in self.engine.actions(self.char,self.world)])
    self.act('examinar',target)
    self.assertIn(action,[a['id'] for a in self.engine.actions(self.char,self.world)])
    self.act(action)
    secret=next(a for a in self.content.rooms[rid]['actions'] if a['id']==action)
    self.assertTrue(set(secret['set_flags']).issubset(self.state['flags']))
    self.assertNotIn(action,[a['id'] for a in self.engine.actions(self.char,self.world)])
