"""One combatant ID can speak locally without changing its mechanical identity."""
import copy
from pathlib import Path
import unittest
from server.content import Content
from server.engine import Engine,RuleError
from server import mechanics as m

class ZeroRandom:
 def random(self):return 0

class NarrativeContextTests(unittest.TestCase):
 def setUp(self):
  self.content=Content(Path(__file__).resolve().parents[1]/'content');self.now=43200
  self.engine=Engine(self.content,lambda:self.now,ZeroRandom());self.world={'flags':[],'deaths':{},'version':0}
  self.cid='forajido_camino';self.camp='hoshai_campamento_lona';self.road='valdren_fragua'
  for rid in (self.camp,self.road):self.content.rooms[rid]['signals']=[{'creature':self.cid,'text':'Una persona disputa el paso.'}]
  self.content.rooms[self.camp]['adversary_prose']={self.cid:{'name':'Seran','description':'Seran mantiene la cuenta del transporte junto a la polea.','warning':'Seran pide aclarar la cuenta.','dialogue':{'reclamo':'Falta pagar el transporte. Habla con Daren.','cuenta':'No sustituye la conversación existente.'},'combat_intro':'Seran se prepara para defender la caja.','defeat_text':'Seran deja de disputar la caja; la cuenta queda pendiente.','seal_reward':999,'combatant_kind':'animal','material':'fiber','illustration':'https://invalid.example/secret.webp','profile':{'hp':1}}}
 def character(self,rid,id=1):
  state=m.new_state('humano','juramentado','home:test',self.now);state.update(location=rid,known=[rid],visited=[rid]);state['visits'][rid]=1
  return {'id':id,'name':'Review','species':'humano','class_id':'juramentado','status':'approved','state':state}
 def test_local_prose_reaches_actions_parser_examination_dialogue_combat_and_rewards(self):
  local=self.character(self.camp);ordinary=self.character(self.road,2)
  actions=self.engine.actions(local,self.world);self.assertTrue(any(a['label']=='Hablar con Seran · reclamo' for a in actions))
  self.assertEqual(self.engine.parse_intent(local,self.world,{'text':'hablar con Seran cuenta'})['id'],'hablar')
  parsed=self.engine.parse_intent(local,self.world,{'text':'hablar con Seran reclamo'});self.engine.apply(local,self.world,parsed)
  self.assertIn('Seran: Falta pagar',str(local['state']['events']));self.assertIsNone(local['state']['combat'])
  self.engine.apply(local,self.world,{'id':'examinar_criatura','target':self.cid});self.assertIn('cuenta del transporte',str(local['state']['events']))
  self.engine.apply(local,self.world,{'id':'combatir','target':self.cid})
  combat=local['state']['combat'];self.assertEqual(combat['profile'],m.PROFILES[self.cid])
  self.assertEqual(local['state']['events'][0]['text'],'Seran se prepara para defender la caja.')
  snap=self.engine.snapshot(local,self.world);self.assertEqual(snap['character']['combat']['name'],'Seran')
  self.assertNotIn('invalid.example',str(snap));self.assertNotIn(self.cid,local['state']['bestiary'])
  self.now+=4;self.engine.tick(local,self.world);self.assertIn('Seran',str(local['state']['events']));self.assertNotIn('Salteador de cargas',str(local['state']['events']))
  self.now+=12;self.engine.tick(local,self.world);self.assertIn('cuenta queda pendiente',str(local['state']['events']))
  self.assertEqual(local['state']['seals'],24);self.assertEqual(local['state']['ledger'][-1]['amount'],4)
  self.assertNotIn(self.cid,local['state']['bestiary'])
  self.engine.apply(ordinary,self.world,{'id':'combatir','target':self.cid})
  self.assertEqual(ordinary['state']['combat']['profile'],m.PROFILES[self.cid]);self.assertIn('salteador',str(ordinary['state']['events']).lower())
  self.assertEqual(self.engine.snapshot(ordinary,self.world)['character']['combat']['name'],self.content.creatures[self.cid]['name'])
  self.now+=16;self.engine.tick(ordinary,self.world);self.assertEqual(ordinary['state']['seals'],24)
  self.assertNotIn(self.cid,ordinary['state']['bestiary'])
 def test_cooperative_round_keeps_contextual_name_and_unchanged_individual_reward(self):
  players=[self.character(self.camp,id) for id in (1,2)]
  for player in players:self.engine.apply(player,self.world,{'id':'combatir','target':self.cid})
  self.now+=4;self.engine.tick_shared(players,self.world)
  for player in players:
   self.assertIn('Seran',str(player['state']['events']));self.assertNotIn('Salteador de cargas',str(player['state']['events']))
  self.now+=12;self.engine.tick_shared(players,self.world)
  self.assertEqual([p['state']['seals'] for p in players],[24,24])
  for player in players:self.assertNotIn(self.cid,player['state']['bestiary'])
 def test_paid_quest_summary_uses_completed_prose_without_changing_progress(self):
  player=self.character(self.road);qid='valdren_recado_forja'
  self.content.quests[qid]['paid_text']='La información de Bren ya volvió al taller.'
  player['state']['quests'][qid]={'status':'paid'}
  player['state']['ledger']=[{'kind':'errand','quest':qid,'at':self.now,'amount':6}]
  before=copy.deepcopy((player,self.world))
  snap=self.engine.snapshot(player,self.world);entry=next(q for q in snap['quests'] if q['id']==qid)
  self.assertEqual(entry['summary'],'La información de Bren ya volvió al taller.');self.assertEqual(entry['paid_amount'],6)
  self.assertEqual((player,self.world),before)
  self.content.quests[qid].pop('paid_text');entry=next(q for q in self.engine.snapshot(player,self.world)['quests'] if q['id']==qid)
  self.assertEqual(entry['summary'],'Este encargo ya está completado.');self.assertEqual((player,self.world),before)
 def test_required_examination_must_happen_in_its_room_after_acceptance(self):
  player=self.character(self.road);qid='valdren_recado_forja';right='edran_hito_campos'
  quest=self.content.quests[qid];quest.update(required_rooms=[right],required_flags=[],required_actions=[{'id':'examinar','target':'losa','room':right}])
  self.content.rooms[self.road].setdefault('examine',{})['losa']='Una losa de otro sitio.'
  self.engine.apply(player,self.world,{'id':'aceptar','target':qid})
  self.engine.apply(player,self.world,{'id':'examinar','target':'losa'})
  self.assertEqual(player['state']['quests'][qid]['actions'][-1]['room'],self.road)
  from collections import deque
  queue=deque([(self.road,[])]);seen={self.road}
  while queue:
   source,path=queue.popleft()
   if source==right:break
   for direction,destination in self.content.rooms[source]['exits'].items():
    if destination not in seen:seen.add(destination);queue.append((destination,path+[direction]))
  for direction in path:self.engine.apply(player,self.world,{'id':'mover','target':direction})
  self.assertEqual(player['state']['location'],right)
  self.assertEqual(player['state']['quests'][qid]['status'],'accepted','Visiting the right room cannot validate an examination elsewhere')
  self.engine.apply(player,self.world,{'id':'examinar','target':'losa'})
  self.assertEqual(player['state']['quests'][qid]['status'],'ready')
 def test_absent_quest_npc_blocks_acceptance_and_payment_without_mutation(self):
  player=self.character('korven_entrante_piezas');qid='brumak_taza';self.now=22*3600
  player['state']['events']=[{'kind':'world','text':'El último recuerdo se conserva.'}]
  offer=next(a for a in self.engine.actions(player,self.world) if a.get('target')==qid)
  self.assertTrue(offer['disabled']);self.assertIn('no está aquí',offer['reason']);self.assertIn('horario aquí es de día',offer['reason'])
  before=copy.deepcopy((player,self.world))
  with self.assertRaises(RuleError):self.engine.apply(player,self.world,{'id':'aceptar','target':qid})
  self.assertEqual((player,self.world),before)
  player['state']['quests'][qid]={'status':'ready','visited':[],'actions':[]};before=copy.deepcopy((player,self.world))
  with self.assertRaises(RuleError):self.engine.apply(player,self.world,{'id':'cobrar','target':qid})
  self.assertEqual((player,self.world),before)
  self.now=12*3600;self.engine.apply(player,self.world,{'id':'cobrar','target':qid})
  self.assertEqual(player['state']['quests'][qid]['status'],'paid');self.assertEqual(player['state']['seals'],28)
 def test_historical_actions_without_room_are_not_backfilled_and_ready_paid_remain(self):
  player=self.character('edran_hito_campos');state=player['state'];qid='valdren_recado_forja';right=state['location']
  self.content.quests[qid].update(required_rooms=[right],required_flags=[],required_actions=[{'id':'examinar','target':'losa','room':right}])
  old={'id':'examinar','target':'losa'};state['quests'][qid]={'status':'accepted','visited':[right],'actions':[old.copy()]}
  self.engine.update_quests(state,self.world,{'id':'mirar'})
  self.assertEqual(state['quests'][qid]['status'],'accepted');self.assertEqual(state['quests'][qid]['actions'][0],old)
  self.engine.apply(player,self.world,{'id':'examinar','target':'losa'});self.assertEqual(state['quests'][qid]['status'],'ready')
  for status in ('ready','paid'):
   state['quests'][qid]={'status':status,'visited':[right],'actions':[old.copy()]};before=copy.deepcopy(state['quests'])
   self.engine.update_quests(state,self.world,{'id':'mirar'});self.engine.snapshot(player,self.world)
   self.assertEqual(state['quests'],before)
 def test_prose_whitelist_does_not_modify_catalog_or_allow_asset_override(self):
  base=copy.deepcopy(self.content.creatures[self.cid]);prose=self.engine.creature_prose(self.content.rooms[self.camp],self.cid)
  for field in ('combatant_kind','seal_reward','illustration','material'):
   self.assertEqual(prose.get(field),base.get(field))
  self.assertNotIn('profile',prose);self.assertEqual(self.content.creatures[self.cid],base)
  self.assertEqual(self.engine.creature_prose(self.content.rooms[self.road],self.cid),base)
if __name__=='__main__':unittest.main()
