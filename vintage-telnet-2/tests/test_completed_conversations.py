import unittest
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine
class CompletedConversations(unittest.TestCase):
 def test_completed_errands_replace_stale_requests_without_replaying_rewards(self):
  engine=Engine(Content(Path(__file__).resolve().parents[1]/'content'),lambda:43200)
  cases=[('nhal_mercado_setas','nhal_varo','recipiente','nhal_entrega_elin_completada','Elin conserva'),('nhal_umbral_elin','nhal_elin','entrega','nhal_entrega_elin_completada','El recipiente que trajiste'),('hoshai_campamento_lona','hoshai_seran','acuerdo','hoshai_polea_devuelta','ya está devuelta')]
  for room,npc,topic,flag,expected in cases:
   with self.subTest(npc=npc):
    s=m.new_state('vesperi','juramentado','home:test',43200);s['location']=room;s['flags'].append(flag)
    if npc=='hoshai_seran':s['flags'].append('hoshai_polea_acordada')
    char={'id':999,'name':'Prueba','species':'vesperi','class_id':'juramentado','state':s};world={'flags':[],'weather':{},'deaths':{}}
    before=(s['seals'],s['xp'],len(s['inventory']))
    engine.apply(char,world,{'id':'hablar','target':npc,'topic':topic})
    self.assertIn(expected,' '.join(e['text'] for e in s['events']))
    daily=s.get('daily_errands',{}).get('completed',[])
    self.assertEqual((before[0],before[1]+(m.EXPLORATION_XP['behavior'] if f'talk:{npc}' in daily else 0),before[2]),(s['seals'],s['xp'],len(s['inventory'])))
    self.assertNotIn('set_flags',engine.people(engine.room(char),s,world,engine.ambient(engine.room(char),world))[0]['topics'][topic])
 def test_forced_return_does_not_invent_a_peaceful_agreement(self):
  from server.engine import RuleError
  engine=Engine(Content(Path(__file__).resolve().parents[1]/'content'),lambda:43200)
  s=m.new_state('felaryn','juramentado','home:test',43200);s['location']='hoshai_campamento_lona';s['flags'].extend(['hoshai_polea_devuelta','hoshai_polea_por_fuerza','hoshai_seran_escuchado']);char={'id':999,'name':'Prueba','species':'felaryn','class_id':'juramentado','state':s};world={'flags':[],'weather':{},'deaths':{}}
  with self.assertRaises(RuleError):engine.apply(char,world,{'id':'hablar','target':'hoshai_seran','topic':'acuerdo'})
  engine.apply(char,world,{'id':'hablar','target':'hoshai_seran','topic':'cuenta'})
  self.assertIn('La polea volvió',' '.join(e['text'] for e in s['events']))
