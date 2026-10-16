"""Exploration rewards through real engine actions and serialized isolated state."""
import json
from pathlib import Path
import random
import unittest
from server.content import Content
from server.engine import Engine
from server import mechanics as m

class ExplorationXPTests(unittest.TestCase):
 def setUp(self):
  self.content=Content(Path(__file__).resolve().parents[1]/'content')
  self.engine=Engine(self.content,lambda:43200,random.Random(1))
  self.state=m.new_state('humano','juramentado','home:test',43200)
  self.character={'id':1,'name':'Prueba','species':'humano','state':self.state}
  self.world={'flags':[],'deaths':{}}
  self.engine.apply(self.character,self.world,{'id':'mover','target':'salir'})
  self.room=self.content.rooms[self.state['location']]
  self.room['actions']=[]
  self.state['events']=[]
 def act(self,**item):
  action={'id':'prueba','label':'Prueba','text':'Prueba',**item}
  self.room['actions']=[action]
  self.engine.apply(self.character,self.world,{'id':'prueba'})
 def gained(self,before):
  return sum(m.xp_next(n) for n in range(1,self.state['level']))+self.state['xp']-before
 def total(self):return sum(m.xp_next(n) for n in range(1,self.state['level']))+self.state['xp']
 def test_first_room_and_return(self):
  self.assertEqual(self.state['xp'],1)
  self.engine.apply(self.character,self.world,{'id':'mover','target':'hogar'})
  self.engine.apply(self.character,self.world,{'id':'mover','target':'salir'})
  self.assertEqual(self.state['xp'],1)
 def test_secret_persisted_and_idempotent(self):
  self.content.secrets['test']={'flag':'secret_test'}
  before=self.total();self.act(set_flags=['secret_test']);self.assertEqual(self.gained(before),10)
  self.character['state']=self.state=json.loads(json.dumps(self.state))
  self.act(set_flags=['secret_test']);self.assertEqual(self.gained(before),10)
 def test_journal_clue_once(self):
  before=self.total();self.act(journal='Una pista.');self.act(journal='Una pista.')
  self.assertEqual(self.gained(before),3)
 def test_story_final_step_and_shared_participation(self):
  self.content.stories['test']={'steps':[{'flag':'start'},{'flag':'finish'}]}
  self.world['flags'].append('finish');before=self.total()
  self.act();self.assertEqual(self.gained(before),0)
  self.act(set_flags=['finish'],scope='world');self.act(set_flags=['finish'],scope='world')
  self.assertEqual(self.gained(before),25)
 def test_generic_closing_flag_and_journal(self):
  before=self.total();self.act(set_flags=['test_hilo_completado']);self.act(set_flags=['test_hilo_completado'])
  self.assertEqual(self.gained(before),25)
  before=self.total();self.act(journal='Cierre: el arco termina.');self.act(journal='Cierre: el arco termina.')
  self.assertEqual(self.gained(before),28)
 def test_quest_ready_paid_repeat_only_once(self):
  self.content.quests['test']={'name':'Prueba','accept_room':self.room['id'],'payout':1,'required_flags':['quest_done'],'required_rooms':[]}
  self.state['quests']['test']={'status':'accepted','visited':[],'actions':[]}
  before=self.total();self.act(set_flags=['quest_done']);self.assertEqual(self.gained(before),15)
  self.engine.apply(self.character,self.world,{'id':'cobrar','target':'test'})
  self.state['quests']['test']={'status':'accepted','visited':[],'actions':[]}
  self.act();self.assertEqual(self.gained(before),15)
 def test_behavior_new_text_once_and_no_get_reward(self):
  cid=next(cid for cid,c in self.content.creatures.items() if c.get('warning') and c.get('combatant_kind')!='human')
  self.room['signals']=[{'creature':cid,'text':'Una señal.'}]
  self.content.creatures[cid].update(warning='Dato uno.',presagio='Dato dos.',habitat='Dato uno.')
  before=self.total()
  for _ in range(3):self.engine.apply(self.character,self.world,{'id':'examinar_criatura','target':cid})
  self.assertEqual(self.gained(before),6)
 def test_old_state_no_backfill_and_new_reward(self):
  self.state.pop('exploration_xp');self.state['journal']=['Pista antigua.']
  self.state['flags'].append('old_hilo_completado')
  self.state['quests']['old']={'status':'paid'}
  before=self.total();self.engine.apply(self.character,self.world,{'id':'inventario'})
  self.assertEqual(self.gained(before),0)
  self.act(journal='Pista nueva.');self.assertEqual(self.gained(before),3)
 def test_level_up_uses_existing_curve_and_attribute_points(self):
  self.state['xp']=99;self.act(journal='Pista para avanzar.')
  self.assertEqual((self.state['level'],self.state['xp'],self.state['pa']),(2,2,2))
  self.assertTrue(any('Alcanzas nivel 2' in e['text'] for e in self.state['events']))
  self.assertTrue(any('+3 experiencia:' in e['text'] for e in self.state['events']))
 def test_initial_region_calibration_by_species(self):
  # Isolated balance fixture: regional rooms, journals, secrets and one ending.
  # Uses actual engine narrative transitions, without combat or seeded rewards.
  results={}
  for species in ('humano','felaryn','dravak','marevyn','vesperi'):
   content=Content(Path(__file__).resolve().parents[1]/'content')
   engine=Engine(content,lambda:43200,random.Random(1))
   region,_=engine.region_for(species)
   state=m.new_state(species,'juramentado','home:balance',43200)
   char={'id':1,'name':'Balance','species':species,'state':state}
   world={'flags':[],'deaths':{}}
   engine.apply(char,world,{'id':'mover','target':'salir'})
   regional_actions=[a for r in content.rooms.values() if r['region']==region for a in r.get('actions',[])]
   for rid,room in content.rooms.items():
    if room['region']!=region or rid==state['location']:continue
    current=content.rooms[state['location']]
    current['actions']=[{'id':'balance_walk','label':'Ir','text':'Recorrido aislado','next':rid}]
    engine.apply(char,world,{'id':'balance_walk'})
   regional_flags=set()
   memories=set()
   for action in regional_actions:
    regional_flags.update(action.get('set_flags',[]))
    if action.get('journal'):memories.add(action['journal'])
   for text in memories:
    content.rooms[state['location']]['actions']=[{'id':'balance_clue','label':'Pista','text':'Pista aislada','journal':text}]
    engine.apply(char,world,{'id':'balance_clue'})
   secret_flags=[secret['flag'] for secret in content.secrets.values() if secret.get('flag') in regional_flags]
   content.rooms[state['location']]['actions']=[{'id':'balance_secret','label':'Secretos','text':'Secretos aislados','set_flags':secret_flags}]
   engine.apply(char,world,{'id':'balance_secret'})
   content.rooms[state['location']]['actions']=[{'id':'balance_end','label':'Cerrar','text':'Cierre aislado','set_flags':['balance_hilo_completado'],'journal':'El hilo ha terminado.'}]
   engine.apply(char,world,{'id':'balance_end'})
   self.assertIn(state['level'],(2,3),species)
   results[species]=(region,state['level'],state['xp'])
  print('Calibración aislada (salas, diarios, secretos + un cierre):',results)

 def test_closing_journal_and_flag_share_one_closure_reward(self):
  before=self.total();self.act(set_flags=['same_arco_cerrado'],journal='Cierre: volvemos a casa.')
  self.assertEqual(self.gained(before),28)
  self.act(set_flags=['same_arco_cerrado'],journal='Cierre: volvemos a casa.')
  self.assertEqual(self.gained(before),28)
 def test_idle_tick_does_not_migrate_or_award_old_achievements(self):
  self.state.pop('exploration_xp');self.state['journal']=['Cierre: antiguo.']
  before=json.loads(json.dumps(self.state));self.engine.tick(self.character,self.world)
  self.assertEqual(self.state,before)
