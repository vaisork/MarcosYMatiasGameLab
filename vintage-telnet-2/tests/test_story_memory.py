"""Completed public help changes subsequent dialogue without rewarding it twice."""
import copy
import unittest
from pathlib import Path
from server.content import Content
from server.engine import Engine,RuleError
from server import mechanics as m

class StoryMemory(unittest.TestCase):
 def setUp(self):
  self.e=Engine(Content(Path(__file__).resolve().parents[1]/'content'),lambda:43200)
  self.s=m.new_state('vesperi','juramentado','home:story',43200)
  self.c={'id':99,'name':'Lector','species':'vesperi','class_id':'juramentado','status':'approved','state':self.s}
  self.w={'flags':[],'deaths':{},'version':0}
 def act(self,id,target=None,**kw):self.e.apply(self.c,self.w,{'id':id,'target':target,**kw})
 def test_finished_figure_closes_request_for_worker_and_uninvolved_visitor(self):
  self.s['location']='nhal_taller_cortezas';self.act('hablar','nhal_desi',topic='pata');initial=self.s['events'][0]['text']
  self.act('nhal_sujetar_figura');self.assertIn('nhal_figura_firme',self.w['flags'])
  self.assertNotIn('nhal_sujetar_figura',[a['id'] for a in self.e.actions(self.c,self.w)])
  before=(self.s['xp'],self.s['seals'],copy.deepcopy(self.s['inventory']))
  for topic in ('figura','pata'):
   self.act('hablar','nhal_desi',topic=topic);self.assertNotEqual(self.s['events'][0]['text'],initial)
   self.assertNotIn('necesito que alguien',self.s['events'][0]['text'].lower())
  self.assertEqual(before,(self.s['xp'],self.s['seals'],self.s['inventory']))
  visitor=m.new_state('vesperi','juramentado','home:observer',43200);visitor['location']=self.s['location']
  people=self.e.people(self.e.room(self.c,self.w),visitor,self.w,self.e.ambient(self.e.room(self.c,self.w),self.w))
  desi=next(n for n in people if n['id']=='nhal_desi')
  self.assertEqual(desi['topics']['pata'],self.e.content.npcs['nhal_desi']['states'][0]['overrides']['topics']['pata'])
 def test_written_story_replaces_pending_memory_on_the_same_visit(self):
  self.s['location']='nhal_umbral_elin';self.act('nhal_escuchar_elin')
  self.s['location']='nhal_patio_relato';self.act('hablar','nhal_leris',topic='relato')
  self.act('nhal_ampliar_relato');self.assertIn('nhal_relato_ampliado',self.w['flags'])
  people=self.e.people(self.e.room(self.c,self.w),self.s,self.w,self.e.ambient(self.e.room(self.c,self.w),self.w))
  leris=next(n for n in people if n['id']=='nhal_leris')
  self.assertNotIn('espera que atribuyas',leris['memory']['nhal_voz_escuchada'])
  self.assertIn('espera que atribuyas',self.e.content.npcs['nhal_leris']['memory']['nhal_voz_escuchada'])
  self.s['dialogue_memories']={};before=(self.s['xp'],self.s['seals'],copy.deepcopy(self.s['inventory']))
  self.act('hablar','nhal_leris',topic='relato');first=copy.deepcopy(self.s['events'])
  self.assertNotIn('espera que atribuyas',str(first));self.assertNotIn('Ve a escucharla',str(first))
  self.act('hablar','nhal_leris',topic='relato');self.assertEqual(len(self.s['events']),1)
  self.assertEqual(before,(self.s['xp'],self.s['seals'],self.s['inventory']))
  with self.assertRaises(RuleError):self.act('nhal_ampliar_relato')

if __name__=='__main__':unittest.main()
