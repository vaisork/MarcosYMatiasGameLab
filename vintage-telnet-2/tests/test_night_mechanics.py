"""Integrated world extensions: material trade, gates and human combat."""
import unittest
from pathlib import Path
from server.content import Content
from server.engine import Engine,RuleError
from server import mechanics as m

class ZeroRandom:
 def random(self):return 0

class NightMechanicsTests(unittest.TestCase):
 def setUp(self):
  self.content=Content(Path(__file__).resolve().parents[1]/'content')
  self.now=12*3600;self.engine=Engine(self.content,lambda:self.now,ZeroRandom())
  self.state=m.new_state('humano','juramentado','home:1',self.now)
  self.state.update(location='valdren_fragua',seals=50)
  self.character={'id':1,'name':'Prueba','species':'humano','class_id':'juramentado','state':self.state}
  self.world={'flags':[],'deaths':{}}
 def act(self,id,target=None,**kwargs):self.engine.apply(self.character,self.world,dict(id=id,target=target,**kwargs))
 def test_honing_consumes_material_once_and_changes_actual_round_damage(self):
  self.content.rooms['valdren_fragua']['honing_material']='semillas_camino'
  self.engine.add_item(self.state,'semillas_camino');weapon=self.state['inventory'][0]
  before=weapon['damage']
  offer=next(a for a in self.engine.actions(self.character,self.world) if a['id']=='afinar' and a['target']==weapon['id'])
  self.assertIn(f"daño base {before} → {before+1}",offer['confirmation'])
  self.assertIn('12 sellos y 1 '+self.content.items['semillas_camino']['name'],offer['confirmation'])
  self.assertEqual(self.state['seals'],50)
  with self.assertRaises(RuleError):self.act('afinar',weapon['id'])
  self.assertEqual(self.state['seals'],50)
  self.act('afinar',weapon['id'],confirmed=True)
  self.assertEqual(weapon['damage'],before+1);self.assertEqual(self.state['seals'],38)
  self.assertFalse(any(i['id']=='semillas_camino' for i in self.state['inventory']))
  with self.assertRaises(RuleError):self.act('afinar',weapon['id'],confirmed=True)
  self.assertEqual(self.state['seals'],38)
  self.state['_class']='juramentado';self.state['combat']={'profile':dict(m.PROFILES['mordelinde']),'hp':28,'round':0,'prepared':False}
  lines,_=m.resolve_round(self.state,{'name':'Rival'},ZeroRandom(),respond=False)
  self.assertTrue(any(f'{before+1} de daño' in e['text'] for e in lines))
 def test_entry_permission_then_return_and_own_origin_bypass(self):
  room=self.content.rooms['valdren_fragua'];direction=next(iter(room['exits']));destination=room['exits'][direction]
  room['exit_requirements']={direction:{'requires_flags':['permiso_prueba'],'text':'Pide permiso.'}}
  room['actions']=[{'id':'pedir_permiso_prueba','label':'Pedir permiso','text':'Puedes entrar.','set_flags':['permiso_prueba'],'forbids_flags':['permiso_prueba']}]
  self.assertTrue(next(a for a in self.engine.actions(self.character,self.world) if a['id']=='mover' and a['target']==direction)['disabled'])
  with self.assertRaises(RuleError):self.act('mover',direction)
  self.act('pedir_permiso_prueba');self.act('mover',direction);self.assertEqual(self.state['location'],destination)
  self.state['location']='valdren_fragua';self.state['flags']=[]
  self.assertFalse(next(a for a in self.engine.actions(self.character,self.world) if a['id']=='mover' and a['target']==direction)['disabled'])
 def test_human_is_evaluable_combatible_and_not_animal_bestiary(self):
  self.content.creatures['forajido_camino']={'name':'Forajido','description':'Bloquea el sendero.','combatant_kind':'human','victory_flags':['camino_libre']}
  room=self.content.rooms['valdren_fragua'];room['signals']=[{'creature':'forajido_camino','text':'Una persona corta el camino.'}]
  self.engine.observe(self.state,room,self.world);self.assertNotIn('forajido_camino',self.state['bestiary'])
  self.act('examinar_criatura','forajido_camino');self.assertNotIn('bestiario',str(self.state['events']))
  self.act('evaluar','forajido_camino');self.act('combatir','forajido_camino')
  completed_combat=self.state['combat']
  self.now+=16;self.engine.tick(self.character,self.world)
  self.assertIsNone(self.state['combat']);self.assertIn('camino_libre',self.state['flags'])
  self.assertIn('victoria:valdren_fragua:forajido_camino',self.state['flags'])
  self.assertNotIn('forajido_camino',self.state['bestiary']);self.assertEqual(self.state['seals'],54)
  self.assertEqual([line['amount'] for line in self.state['ledger'] if line['kind']=='combat_seals'],[4])
  self.assertNotIn('no entrega sellos',str(self.state['events']))
  self.engine.tick(self.character,self.world);self.assertEqual(self.state['seals'],54)
  self.engine.victory(self.character,self.world,completed_combat,self.content.creatures['forajido_camino'])
  self.assertEqual(self.state['seals'],54);self.assertEqual(sum(line['kind']=='combat_seals' for line in self.state['ledger']),1)
 def test_death_restarts_exhausted_rest_budget_without_erasing_progress(self):
  self.state.update(hp=0,rest_budget=0,xp=33,fatigue=90)
  self.state['combat']={'creature':'forajido_camino','profile':dict(m.PROFILES['forajido_camino'])}
  self.engine.death(self.character,self.world)
  self.assertEqual(self.state['hp'],60);self.assertIsNone(self.state['rest_budget'])
  self.assertEqual(self.state['xp'],33);self.assertEqual(self.state['seals'],50)
  self.assertEqual(m.rest(self.state),10);self.assertEqual(m.rest(self.state),2)
  self.assertEqual(m.rest(self.state),0);self.assertEqual(self.state['hp'],72)
 def test_shared_encounter_does_not_depend_on_first_visitors_private_flags(self):
  import copy
  class CountingZero:
   def __init__(self):self.calls=0
   def random(self):self.calls+=1;return 0
  rng=CountingZero();self.engine.rng=rng;self.world['version']=1
  self.state['location']='nhal_sendero_altura';self.state['flags'].append('nhal_rodeo_visible_conocido')
  self.character.update(name='Conoce el rodeo',status='active')
  second=copy.deepcopy(self.character);second['id']=2;second['state']['flags']=[]
  self.engine.encounter(self.character,self.world)
  self.assertEqual(self.world['wildlife']['nhal_sendero_altura']['signal']['creature'],'forajido_camino')
  self.assertFalse(any(a['id']=='combatir' and a.get('target')=='forajido_camino' for a in self.engine.actions(self.character,self.world)))
  self.assertTrue(any(a['id']=='combatir' and a.get('target')=='forajido_camino' for a in self.engine.actions(second,self.world)))
  self.world['deaths']['nhal_sendero_altura:forajido_camino']=self.now+300
  self.now+=301;self.engine.encounter(self.character,self.world)
  cached=copy.deepcopy(self.world['wildlife']);calls=rng.calls
  for _ in range(3):self.engine.snapshot(second,self.world)
  self.assertEqual(rng.calls,calls);self.assertEqual(self.world['wildlife'],cached)
  self.assertEqual(calls,4)  # two spawns, each one roll for the rival and one for its level
  self.assertTrue(any(a['id']=='combatir' and a.get('target')=='forajido_camino' for a in self.engine.actions(second,self.world)))
 def test_recovery_requires_present_caregiver_and_only_charges_for_effect(self):
  self.state['location']='hoshai_sala_cuidados';self.state.update(hp=50,fatigue=45,wound='moderada',rest_budget=0,seals=18)
  npc=self.content.npcs['hoshai_ena'];npc['requires_flags']=['caregiver_available']
  self.assertFalse(any(a['id']=='recuperacion' for a in self.engine.actions(self.character,self.world)))
  with self.assertRaises(RuleError):self.act('recuperacion')
  self.assertEqual(self.state['seals'],18);self.assertEqual(self.state['hp'],50)
  self.state['flags'].append('caregiver_available');self.act('recuperacion')
  self.assertEqual(self.state['seals'],0);self.assertEqual(self.state['hp'],90)
  self.assertEqual(self.state['wound'],'leve');self.assertEqual(self.state['fatigue'],0);self.assertIsNone(self.state['rest_budget'])
  self.state.update(hp=100,wound=None,seals=18)
  unavailable=next(a for a in self.engine.actions(self.character,self.world) if a['id']=='recuperacion')
  self.assertTrue(unavailable['disabled']);self.assertEqual(unavailable['reason'],'No necesitas atención ahora.')
  with self.assertRaises(RuleError):self.act('recuperacion')
  self.assertEqual(self.state['seals'],18)
 def test_insufficient_balance_disables_purchase_upgrade_repair_without_debit(self):
  self.state['seals']=0;self.engine.add_item(self.state,'fibra_espinajo')
  actions=self.engine.actions(self.character,self.world)
  upgrade=next(a for a in actions if a['id']=='afinar');purchase=next(a for a in actions if a['id']=='comprar')
  self.assertTrue(upgrade['disabled']);self.assertEqual(upgrade['reason'],'Te faltan 12 sellos.')
  self.assertTrue(purchase['disabled']);self.assertEqual(purchase['reason'],f"Te faltan {purchase['cost']} sellos.")
  with self.assertRaises(RuleError):self.act('afinar',upgrade['target'],confirmed=True)
  with self.assertRaises(RuleError):self.act('comprar',purchase['target'])
  weapon=self.state['inventory'][0];weapon['condition']='damaged_event'
  repair=next(a for a in self.engine.actions(self.character,self.world) if a['id']=='reparar')
  self.assertTrue(repair['disabled']);self.assertEqual(repair['reason'],'Te faltan 8 sellos.')
  with self.assertRaises(RuleError):self.act('reparar',weapon['id'])
  self.assertEqual(self.state['seals'],0);self.assertFalse(weapon.get('honed',False));self.assertEqual(weapon['condition'],'damaged_event')
 def test_seen_clue_opens_its_follow_up_at_the_explaining_place(self):
  class Fixed:
   def __init__(self,value):self.value=value
   def random(self):return self.value
  traces=self.content.regions['edran']['search']['traces']
  index=next(i for i,t in enumerate(traces) if isinstance(t,dict) and t['flag']=='pista_huella_partida')
  self.state['location']='edran_camino_carros';self.engine.rng=Fixed(.5+(index+.5)/len(traces)*.25)
  self.engine.search(self.character,self.world)
  self.assertEqual(self.state['events'][0]['text'],traces[index]['text'])
  self.assertIn('pista_huella_partida',self.state['flags'])
  self.state['location']='edran_prado';self.engine.rng=ZeroRandom()
  self.assertIn('pista_comparar_huellas',[a['id'] for a in self.engine.actions(self.character,self.world)])
  self.act('pista_comparar_huellas')
  self.assertIn('edran_rastro_grande',self.state['flags'])
  self.assertNotIn('pista_comparar_huellas',[a['id'] for a in self.engine.actions(self.character,self.world)])
 def test_search_uses_both_authored_empty_and_trace_variants(self):
  class Fixed:
   def __init__(self,value):self.value=value
   def random(self):return self.value
  search=self.content.regions['lethra']['search']
  # First and last variant of each list, using the same proportional selection as Engine.search.
  for value,kind,start,span in ((.76,'empty',.75,.25),(.99,'empty',.75,.25),(.51,'traces',.5,.25),(.74,'traces',.5,.25)):
   options=search[kind];index=min(int((value-start)/span*len(options)),len(options)-1)
   self.state['location']='lethra_tierra_esponjosa';self.engine.rng=Fixed(value)
   self.engine.search(self.character,self.world)
   expected=options[index]['text'] if isinstance(options[index],dict) else options[index]
   self.assertEqual(self.state['events'][0]['text'],expected)
   self.now+=61
 def test_four_unique_quests_pay_announced_reward_even_after_other_errands(self):
  self.state['ledger']=[{'family':'valdren_paid_errands','at':self.now,'amount':6} for _ in range(5)]
  for index in range(4):
   qid='unique_'+str(index)
   self.content.quests[qid]={'name':'Encargo local','accept_room':'valdren_fragua','payout':8,'family':'local_test','repeatable':False}
   self.act('aceptar',qid);self.act('cobrar',qid)
   with self.assertRaises(RuleError):self.act('cobrar',qid)
  self.assertEqual(self.state['seals'],82)
  self.assertEqual([e['amount'] for e in self.state['ledger'] if e.get('family')=='local_test'],[8]*4)
 def test_tracker_exposes_only_instances_and_visited_return_names(self):
  self.character['status']='active';self.world['version']=1
  self.content.quests['hidden_test']={'name':'Encargo aceptado','accept_room':'valdren_cobertizo','payout':8,'repeatable':False,'accept_text':'Revisa la carga.','required_rooms':['korven_taller_juntas'],'required_flags':['secret_flag']}
  self.content.quests['unaccepted_test']={'name':'SECRETO SIN ACEPTAR','accept_room':'valdren_cobertizo','payout':6}
  self.state['quests']['hidden_test']={'status':'accepted','visited':[],'actions':[]}
  tracker=self.engine.snapshot(self.character,self.world)['quests']
  self.assertEqual(len(tracker),1);entry=tracker[0]
  self.assertNotIn('return_room_name',entry);self.assertEqual(entry['summary'],'Revisa la carga.')
  self.assertNotIn('secret_flag',str(tracker));self.assertNotIn('korven_taller_juntas',str(tracker))
  self.assertNotIn('SECRETO SIN ACEPTAR',str(tracker))
  self.state['visited'].append('valdren_cobertizo');self.state['quests']['hidden_test']['status']='ready'
  self.assertEqual(self.engine.snapshot(self.character,self.world)['quests'][0]['return_room_name'],self.content.rooms['valdren_cobertizo']['name'])
  self.state['quests']['valdren_recado_forja']={'status':'ready','visited':[],'actions':[]}
  self.state['ledger']=[{'family':'valdren_paid_errands','at':self.now,'amount':6} for _ in range(2)]
  repeated=next(q for q in self.engine.snapshot(self.character,self.world)['quests'] if q['id']=='valdren_recado_forja')
  self.assertEqual(repeated['reward'],6);self.assertEqual(repeated['reward_current'],3)
 def test_local_buyer_only_accepts_declared_materials(self):
  self.state['location']='valdren_cuidado';self.content.rooms['valdren_cuidado']['buy_items']=['semillas_camino']
  self.engine.add_item(self.state,'semillas_camino');self.engine.add_item(self.state,'piedra_veteada')
  sellable=[a.get('target') for a in self.engine.actions(self.character,self.world) if a['id']=='vender']
  self.assertIn('semillas_camino',sellable);self.assertNotIn('piedra_veteada',sellable)
  with self.assertRaises(RuleError):self.act('vender','piedra_veteada')
  self.act('vender','semillas_camino');self.assertEqual(self.state['seals'],52)
 def test_defense_reasons_do_not_promise_effect_at_default_attributes(self):
  self.state['combat']={'creature':'forajido_camino','profile':dict(m.PROFILES['forajido_camino']),'hp':28,'round':0,'prepared':False,'cooldown':0}
  actions=self.engine.actions(self.character,self.world)
  self.assertIn('no dan ventaja',next(a['reason'] for a in actions if a.get('target')=='esquivar'))
  self.assertIn('no reducen',next(a['reason'] for a in actions if a.get('target')=='resistir'))
  self.assertIn('10%',next(a['reason'] for a in actions if a.get('target')=='bloquear'))
  self.state['attributes']['resistencia']=20
  self.assertIn('5.5%',next(a['reason'] for a in self.engine.actions(self.character,self.world) if a.get('target')=='resistir'))
 def test_arcane_cancellation_uses_basic_accuracy_minus_ten(self):
  self.state=m.new_state('humano','arcano','home:1',self.now)
  self.state['_class']='arcano';self.state['combat']={'profile':dict(m.PROFILES['espinajo_rastrojo']),'hp':40,'prepared':True,'round':0,'cooldown':0,'intervention':{'id':'capacidad'}}
  m.resolve_round(self.state,{'name':'Espinajo'},ZeroRandom(),respond=False)
  self.assertFalse(self.state['combat']['prepared'])
  self.assertEqual(self.state['combat']['_response']['accuracy'],40)
 def test_new_paid_quest_records_memory_and_cannot_be_accepted_again(self):
  self.content.quests['local_test']={'name':'Revisión local','accept_room':'valdren_fragua','required_rooms':[], 'required_actions':[],'payout':8}
  self.act('aceptar','local_test');self.act('cobrar','local_test')
  self.assertEqual(self.state['seals'],58);self.assertIn('encargo_pagado:local_test',self.state['flags'])
  with self.assertRaises(RuleError):self.act('aceptar','local_test')
  with self.assertRaises(RuleError):self.act('cobrar','local_test')
  self.assertEqual(self.state['seals'],58)
 def test_item_delivery_is_not_repeatable_and_validates_before_consuming(self):
  self.engine.add_item(self.state,'semillas_camino');room=self.content.rooms['valdren_fragua']
  room['actions']=[{'id':'entregar_test','label':'Entregar semillas','text':'Recibes una provisión.','requires_items':{'semillas_camino':1},'consume_items':{'semillas_camino':1},'give_items':{'provision_basica':1},'set_flags':['entrega_test'],'forbids_flags':['entrega_test']}]
  self.act('entregar_test');self.assertTrue(any(i['id']=='provision_basica' for i in self.state['inventory']))
  with self.assertRaises(RuleError):self.act('entregar_test')
  self.engine.add_item(self.state,'semillas_camino')
  with self.assertRaises(RuleError):self.engine.effects(self.state,self.world,{'consume_items':{'semillas_camino':1},'give_items':{'invalid_item':1}})
  self.assertTrue(any(i['id']=='semillas_camino' for i in self.state['inventory']))


class HoningApiTests(unittest.TestCase):
 def test_confirmed_upgrade_is_idempotent_and_survives_reconnect(self):
  import tempfile
  import test_engine as fixtures
  from server.app import create_app
  from werkzeug.security import generate_password_hash
  from collections import deque
  with tempfile.TemporaryDirectory() as directory:
   clock=fixtures.Clock();root=Path(__file__).resolve().parents[1]
   app=create_app({'TESTING':True,'DATA_DIR':directory,'CONTENT_DIR':str(root/'content'),'CLOCK':clock,'RNG':ZeroRandom(),'DM_PASSWORD_HASH':generate_password_hash('private-master-test')})
   self.client=app.test_client();self.master=app.test_client();self.sequence=0
   self.post=lambda client,path,payload:fixtures.JourneyTests.post(self,client,path,payload)
   fixtures.JourneyTests.create(self)
   def act(id,target=None,**extra):return fixtures.JourneyTests.action(self,id,target,**extra)
   def walk(target):
    start=self.client.get('/api/state').json['room']['id']
    if start.startswith('home:'):act('mover','salir');start=self.client.get('/api/state').json['room']['id']
    queue=deque([(start,[])]);seen={start}
    while queue:
     place,path=queue.popleft()
     if place==target:
      for direction in path:act('mover',direction)
      return
     for direction,to in Content(root/'content').rooms[place]['exits'].items():
      if to not in seen:seen.add(to);queue.append((to,path+[direction]))
    self.fail('Unreachable '+target)
   walk('edran_arboleda');act('buscar');act('combatir','espinajo_rastrojo');clock.now+=24;self.client.get('/api/state');walk('valdren_fragua')
   state=self.client.get('/api/state').json;weapon=state['inventory'][0]
   payload={'id':'afinar','target':weapon['id'],'confirmed':True,'request_id':'once-only-honing'}
   first=self.post(self.client,'/api/action',payload);self.assertEqual(first.status_code,200,first.json)
   duplicate=self.post(self.client,'/api/action',payload);self.assertEqual(duplicate.status_code,200,duplicate.json)
   updated=self.client.get('/api/state').json
   self.assertEqual(updated['character']['seals'],state['character']['seals']-12)
   self.assertEqual(updated['inventory'][0]['damage'],weapon['damage']+1)
   self.post(self.client,'/api/account/logout',{});self.post(self.client,'/api/account/login',{'username':'tester','password':'testpass123'})
   restored=self.client.get('/api/state').json
   self.assertTrue(restored['inventory'][0]['honed']);self.assertEqual(restored['character']['seals'],updated['character']['seals'])

if __name__=='__main__':unittest.main()

class SpeciesSecretsTests(unittest.TestCase):
 """Each species perceives its own secrets; the six investigations continue for everyone."""
 SECRETS={'humano':['secreto_h_estacas','secreto_h_piedra','secreto_h_carga_pendiente'],'felaryn':['secreto_f_nudo','secreto_f_apoyos','secreto_f_eco'],
          'dravak':['secreto_d_vibracion','secreto_d_espesor','secreto_d_junta'],'marevyn':['secreto_m_corrientes','secreto_m_fibra','lethra_secreto_barquita'],
          'vesperi':['secreto_v_senal','secreto_v_pausa','secreto_v_fundas']}
 def setUp(self):
  self.content=Content(Path(__file__).resolve().parents[1]/'content')
  self.where={a['id']:rid for rid,room in self.content.rooms.items() for a in room.get('actions',[])}
 def engine(self,hour):return Engine(self.content,lambda:hour*3600,ZeroRandom())
 def offered(self,species,action_id,hour=12):
  state=m.new_state(species,'juramentado','home:1',hour*3600);state['location']=self.where[action_id]
  # Satisfy discovery prerequisites before testing the species guard itself.
  authored=next(a for a in self.content.rooms[state['location']]['actions'] if a['id']==action_id)
  state['examined']={state['location']:authored.get('requires_examined',[])}
  return action_id in [a['id'] for a in self.engine(hour).actions({'state':state,'species':species},{'flags':[],'deaths':{}})]
 def test_each_species_gets_only_its_own_three(self):
  for species,ids in self.SECRETS.items():
   for action_id in ids:
    hour=23 if action_id in ('secreto_v_senal','secreto_v_fundas') else 12
    self.assertTrue(self.offered(species,action_id,hour),(species,action_id))
    for other in self.SECRETS:
     if other!=species:self.assertFalse(self.offered(other,action_id,hour),(other,action_id))
 def test_secret_is_personal_and_counted(self):
  engine=self.engine(12);world={'flags':[],'deaths':{}}
  first,second=(m.new_state('dravak','juramentado',f'home:{i}',43200) for i in (1,2))
  for state in (first,second):state['location']='korven_roca_cascaron'
  engine.apply({'state':first,'species':'dravak'},world,{'id':'secreto_d_junta'})
  self.assertIn('sec_d_junta',first['flags']);self.assertNotIn('sec_d_junta',second['flags']);self.assertNotIn('sec_d_junta',world['flags'])
  self.assertTrue(self.offered('dravak','secreto_d_junta'))
  self.assertIn('sec_d_junta',self.content.secrets)
 def test_second_steps_wait_for_the_first_investigation(self):
  pairs={'pista2_estacas_exteriores':'edran_rastro_grande','pista2_cuna_conducto':'edran_conduccion_vieja','pista2_marcas_desde_abajo':'hoshai_marcas_altas',
         'pista2_anotaciones_oma':'korven_presion_abajo','pista2_barro_raices':'lethra_rastro_largo','pista2_brotes_altos':'nhal_rastro_alto'}
  for action_id,needed in pairs.items():
   for species in self.SECRETS:
    state=m.new_state(species,'juramentado','home:1',43200);state['location']=self.where[action_id]
    ids=lambda:[a['id'] for a in self.engine(12).actions({'state':state,'species':species},{'flags':[],'deaths':{}})]
    self.assertNotIn(action_id,ids());state['flags'].append(needed);self.assertIn(action_id,ids(),(species,action_id))
