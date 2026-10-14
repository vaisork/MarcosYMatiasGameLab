"""Exercise shipped authored catalog through the real API, without network sockets."""
from collections import deque
from pathlib import Path
import tempfile
import unittest
from werkzeug.security import generate_password_hash
from server.app import create_app
from server.content import Content
import test_engine as fixtures

class RealContentTests(unittest.TestCase):
 post=fixtures.JourneyTests.post
 create=fixtures.JourneyTests.create
 action=fixtures.JourneyTests.action
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
  self.clock=fixtures.Clock();self.sequence=0;self.root=Path(__file__).resolve().parents[1]
  self.content=Content(self.root/'content')
  self.app=create_app({'TESTING':True,'DATA_DIR':self.temp.name,'CONTENT_DIR':str(self.root/'content'),'CLOCK':self.clock,'RNG':fixtures.FixedRandom(),'DM_PASSWORD_HASH':generate_password_hash('private-master-test')})
  self.client=self.app.test_client();self.master=self.app.test_client()
 def walk(self,target):
  current=self.client.get('/api/state').json['room']['id']
  if current.startswith('home:'):self.action('mover','salir');current=self.client.get('/api/state').json['room']['id']
  queue=deque([(current,[])]);seen={current}
  while queue:
   room,path=queue.popleft()
   if room==target:
    for direction in path:self.action('mover',direction)
    return
   for direction,destination in self.content.rooms[room]['exits'].items():
    if destination not in seen:seen.add(destination);queue.append((destination,path+[direction]))
  self.fail('Unreachable actual authored room '+target)
 def test_real_errand_social_economy_home_and_reconnect(self):
  self.create();initial=self.client.get('/api/state').json;home=initial['room']['id']
  self.assertTrue(all('target' not in exit for exit in initial['room']['exits']))
  self.walk('valdren_fragua');self.action('aceptar','valdren_recado_forja');self.walk('valdren_cobertizo')
  self.walk('valdren_fragua')
  self.assertFalse(any(a['id']=='cobrar' for a in self.client.get('/api/state').json['actions']))
  self.walk('valdren_cobertizo')
  self.action('hablar','edran_bren',topic='rueda');social=self.action('edran_comprobar_rueda')
  self.assertTrue(social['journal']);self.walk('valdren_fragua');paid=self.action('cobrar','valdren_recado_forja')
  self.assertEqual(paid['character']['seals'],26)
  self.walk('valdren_comedor');bought=self.action('comprar','provision_basica');self.assertEqual(bought['character']['seals'],18)
  self.walk('valdren_plaza');self.action('mover','hogar')
  self.post(self.client,'/api/account/logout',{});self.post(self.client,'/api/account/login',{'username':'tester','password':'testpass123'})
  restored=self.client.get('/api/state').json;self.assertEqual(restored['room']['id'],home);self.assertEqual(restored['character']['seals'],18)
  self.assertTrue(restored['journal']);self.assertLess(len(restored['map']['nodes']),len(self.content.rooms))
 def test_real_fauna_observation_retreat_and_major_warning(self):
  self.create();self.walk('edran_bajo_humedo');self.action('observar')
  sheltered=self.action('combatir','mordelinde');self.assertIsNone(sheltered['character']['combat']);self.assertEqual(sheltered['character']['xp'],0)
  self.walk('edran_prado');warning=self.action('acercarse','cornalomo');self.assertIsNone(warning['character']['combat'])
  retreat=self.action('retirarse','cornalomo');self.assertEqual(retreat['character']['hp'],100)
  self.assertTrue({'mordelinde','cornalomo'}.issubset({entry['id'] for entry in retreat['bestiary']}))
 def test_pinzajunco_can_be_examined_without_combat(self):
  self.create();self.walk('lethra_juncal_abierto')
  initial=self.client.get('/api/state').json
  self.assertIn('pinzajunco',{entry['id'] for entry in initial['bestiary']})
  self.assertTrue(any(a['id']=='examinar_criatura' and a.get('target')=='pinzajunco' for a in initial['actions']))
  # Light combat is optional (user decision 2026-10-09): examining never forces a fight.
  self.assertIsNone(initial['character']['combat'])
  examined=self.action('examinar_criatura','pinzajunco')
  self.assertTrue(any('pinza' in e['text'].lower() for e in examined['narrative']))
  self.assertTrue(any('bestiario' in e['text'] for e in examined['narrative']))
  self.assertIsNone(examined['character']['combat'])
  self.assertEqual(examined['character']['xp'],initial['character']['xp'])
  self.assertEqual(examined['character']['seals'],initial['character']['seals'])
  observed=self.action('observar')
  self.assertFalse(any(e['text'].startswith('Añades Pinzajunco') for e in observed['narrative']))

 def test_search_returns_persistent_items_without_repeat_farming(self):
  self.create();self.walk('lethra_tierra_esponjosa')
  before=self.client.get('/api/state').json
  payload={'id':'buscar','request_id':'search-one'}
  first=self.post(self.client,'/api/action',payload);self.assertEqual(first.status_code,200)
  same=self.post(self.client,'/api/action',payload);self.assertEqual(same.status_code,200)
  state=self.client.get('/api/state').json
  self.assertEqual(next(i['quantity'] for i in state['inventory'] if i['id']=='fibra_junco'),1)
  self.assertEqual(state['character']['xp'],before['character']['xp']);self.assertEqual(state['character']['seals'],before['character']['seals'])
  self.assertTrue(state['journal']);self.assertTrue(next(a for a in state['actions'] if a['id']=='buscar')['disabled'])
  self.clock.now+=61;again=self.action('buscar')
  self.assertEqual(next(i['quantity'] for i in again['inventory'] if i['id']=='fibra_junco'),1)
  self.assertTrue(any(e['kind'].upper()=='TRACE' for e in again['narrative']))
  self.clock.now+=1801;renewed=self.action('buscar')
  self.assertEqual(next(i['quantity'] for i in renewed['inventory'] if i['id']=='fibra_junco'),2)
  self.post(self.client,'/api/account/logout',{});self.post(self.client,'/api/account/login',{'username':'tester','password':'testpass123'})
  restored=self.client.get('/api/state').json;self.assertEqual(next(i['quantity'] for i in restored['inventory'] if i['id']=='fibra_junco'),2)
 def test_random_encounter_has_combat_and_get_never_rerolls(self):
  class Counting:
   count=0
   def random(self):self.count+=1;return 0
  rng=Counting();self.app.config['RNG']=rng;self.create();self.walk('edran_arboleda')
  first=self.client.get('/api/state').json;count=rng.count
  self.assertTrue(any(a['id']=='combatir' and a.get('target')=='espinajo_rastrojo' for a in first['actions']))
  self.assertIsNone(first['character']['combat'])
  for _ in range(3):self.client.get('/api/state')
  self.assertEqual(rng.count,count)
  started=self.action('combatir','espinajo_rastrojo');self.assertIsNotNone(started['character']['combat'])
  self.action('capacidad');self.clock.now+=4
  response=self.client.get('/api/state').json
  self.assertTrue(any('guardia' in e['text'].lower() for e in response['narrative']))
 def test_random_major_in_lethra_warns_before_fighting(self):
  class Major:
   def random(self):return .69
  self.app.config['RNG']=Major();self.create();self.walk('lethra_tierra_esponjosa')
  state=self.client.get('/api/state').json
  self.assertTrue(any(a['id']=='acercarse' and a.get('target')=='dorsalodo' for a in state['actions']))
  self.assertFalse(any(a['id']=='combatir' and a.get('target')=='dorsalodo' for a in state['actions']))
  warned=self.action('acercarse','dorsalodo');self.assertIsNone(warned['character']['combat'])
  self.assertTrue(any('retirarte' in e['text'] for e in warned['narrative']))
  retreated=self.action('retirarse','dorsalodo');self.assertIsNone(retreated['character']['combat'])
  self.assertEqual(retreated['character']['hp'],state['character']['hp'])
 def test_random_empty_and_search_empty_are_real_outcomes(self):
  class Empty:
   def random(self):return .9
  self.app.config['RNG']=Empty();self.create();self.walk('lethra_tierra_esponjosa')
  state=self.client.get('/api/state').json
  self.assertFalse(any(a['id']=='examinar_criatura' for a in state['actions']))
  searched=self.action('buscar');self.assertEqual(searched['inventory'],state['inventory'])
  self.assertTrue(any('no encuentras' in e['text'].lower() for e in searched['narrative']))

 def test_bestiary_art_is_only_in_discovered_entries(self):
  self.create();initial=self.client.get('/api/state').json
  self.assertEqual(initial['bestiary'],[])
  self.walk('lethra_juncal_abierto');state=self.client.get('/api/state').json
  entry=next(entry for entry in state['bestiary'] if entry['id']=='pinzajunco')
  self.assertEqual(entry['illustration'],'/client/art/bestiary/pinzajunco-anime-v2.webp')
  asset=self.client.get(entry['illustration']);self.assertEqual(asset.status_code,200);self.assertEqual(asset.mimetype,'image/webp');self.assertIn("img-src 'self'",asset.headers['Content-Security-Policy']);asset.close()
  self.assertEqual(self.client.get('/client/art/bestiary/../../runtime/server.env').status_code,404)
  for node in state['map']['nodes']:
   self.assertTrue(set(node.get('unexplored_directions',[])).issubset({'norte','sur','este','oeste','hogar','salir'}))

 def test_all_actual_regions_reachable_and_species_private_homes(self):
  self.assertGreaterEqual(len(self.content.rooms),150)
  reached=set();queue=['valdren_plaza']
  while queue:
   current=queue.pop()
   if current in reached:continue
   reached.add(current);queue.extend(self.content.rooms[current]['exits'].values())
  self.assertEqual(reached,set(self.content.rooms))
  for species in ('humano','felaryn','dravak','marevyn','vesperi'):
   from server.engine import Engine
   region_id,region=Engine(self.content,self.clock).region_for(species)
   self.assertTrue(region['home']['description']);self.assertIn(region['settlement'],reached)

 def test_defeat_abroad_uses_actual_local_safe_settlement_without_false_route(self):
  from server.engine import Engine
  from server.mechanics import new_state, PROFILES
  state=new_state('humano','juramentado',99,self.clock.now)
  location='hoshai_estribacion'
  state['location']=location;state['known']=[location];state['visited']=[location];state['routes']=[]
  state['combat']={'creature':'cornalomo','profile':dict(PROFILES['cornalomo']),'hp':120};state['xp']=17;state['seals']=31
  character={'id':99,'name':'Viaje','species':'humano','class_id':'juramentado','state':state}
  world={'flags':[],'deaths':{},'encounters':{location+':cornalomo':99}}
  Engine(self.content,self.clock).death(character,world)
  self.assertEqual(state['location'],'vaisgard_mercado')
  self.assertEqual(state['last_recovery']['from'],location)
  self.assertEqual(state['last_recovery']['distance'],4)
  self.assertIn('pueblo más cercano',state['events'][-1]['text'])
  self.assertEqual(state['routes'],[]);self.assertEqual(state['xp'],17);self.assertEqual(state['seals'],31)
  self.assertEqual(state['hp'],60);self.assertEqual(state['fatigue'],40)

 def test_nearest_recovery_crosses_regional_borders_by_real_paths(self):
  from server.engine import Engine
  engine=Engine(self.content,self.clock)
  for location,expected in [('hoshai_estribacion',('vaisgard_mercado',4)),('edran_puente_juncos',('narevia_centro',3)),('nhal_relevo_altura',('khariel_centro',4)),('korven_meseta_relevo',('brumak_centro',3))]:
   with self.subTest(location=location):self.assertEqual(engine.nearest_settlement(location),expected)

 def test_actual_prepared_combat_class_response_material_and_trade(self):
  self.create('artifice');self.walk('edran_surcos')
  started=self.action('combatir','espinajo_rastrojo');self.assertTrue(started['character']['combat']['prepared'])
  self.action('capacidad');self.clock.now+=4;response=self.client.get('/api/state').json
  self.assertFalse(response['character']['combat']['prepared']);self.assertEqual(response['character']['combat']['cooldown'],2)
  self.clock.now+=40;won=self.client.get('/api/state').json
  self.assertIsNone(won['character']['combat']);self.assertGreater(won['character']['xp'],0);self.assertEqual(won['character']['seals'],20)
  self.assertTrue(any(item['id']=='fibra_espinajo' for item in won['inventory']))
  self.walk('valdren_comedor');sold=self.action('vender','fibra_espinajo');self.assertEqual(sold['character']['seals'],24)

 def test_real_forge_repair_retries_and_relogin_preserve_single_charge(self):
  import json
  from server.store import Store
  cid=self.create();self.walk('valdren_fragua')
  # A fixture models an explicitly authorized exceptional event; routine play never damages gear.
  with self.app.extensions['store'].transaction() as db:
   char=Store.load(db.execute('SELECT * FROM characters WHERE id=?',(cid,)).fetchone())
   char['state']['inventory'][0]['condition']='damaged_event'
   char['state']['equipment']['weapon']=None
   Store.save(db,char)
  payload={'id':'reparar','target':'espada_juramento','request_id':'exceptional-repair-retry'}
  first=self.post(self.client,'/api/action',payload)
  self.assertEqual(first.status_code,200,first.json)
  again=self.post(self.client,'/api/action',payload)
  self.assertEqual(again.status_code,200)
  self.assertEqual(again.json['character']['seals'],12)
  self.assertEqual(again.json['inventory'][0]['condition'],'intact')
  self.assertIsNone(again.json['character']['equipment']['weapon'])
  rejected=self.post(self.client,'/api/action',dict(payload,request_id='second-repair-intact'))
  self.assertEqual(rejected.status_code,409)
  self.post(self.client,'/api/account/logout',{})
  self.post(self.client,'/api/account/login',{'username':'tester','password':'testpass123'})
  restored=self.client.get('/api/state').json
  self.assertEqual(restored['character']['seals'],12)
  self.assertEqual(restored['inventory'][0]['condition'],'intact')
  with self.app.extensions['store'].transaction() as db:
   char=Store.load(db.execute('SELECT * FROM characters WHERE id=?',(cid,)).fetchone())
   self.assertEqual(sum(line['kind']=='repair' for line in char['state']['ledger']),1)

 def test_real_map_guides_learned_route_from_narevia_back_to_private_home(self):
  self.create();home=self.client.get('/api/state').json['room']['id']
  self.walk('narevia_centro');snapshot=self.client.get('/api/state').json
  home_node=next(node for node in snapshot['map']['nodes'] if node['id']==home)
  self.assertEqual(home_node['kind'],'home');self.assertNotEqual(home_node['name'],snapshot['room']['name'])
  self.assertFalse(any(node['region']=='nhal' for node in snapshot['map']['nodes']))
  queue=deque([(snapshot['room']['id'],[])]);seen=set();path=None
  while queue:
   current,steps=queue.popleft()
   if current in seen:continue
   seen.add(current)
   if current==home:path=steps;break
   for route in snapshot['map']['routes']:
    if route['from']==current:queue.append((route['to'],steps+[route]))
  self.assertIsNotNone(path);self.assertGreater(len(path),1)
  for step in path:
   arrived=self.action('mover',step['direction'])
   self.assertEqual(arrived['room']['id'],step['to'])
  self.assertEqual(arrived['room']['id'],home)

 def test_map_commerce_only_describes_known_locations_not_current_open_hours(self):
  self.create();initial=self.client.get('/api/state').json
  self.assertNotIn('valdren_fragua',{node['id'] for node in initial['map']['nodes']})
  self.assertFalse(any(node.get('commerce') for node in initial['map']['nodes']))
  self.walk('valdren_fragua');self.walk('valdren_comedor');state=self.client.get('/api/state').json
  nodes={node['id']:node for node in state['map']['nodes']}
  self.assertTrue(nodes['valdren_fragua']['commerce']['buys_weapons'])
  self.assertFalse(nodes['valdren_fragua']['commerce']['buys_materials'])
  self.assertTrue(nodes['valdren_comedor']['commerce']['buys_materials'])
  self.assertEqual(nodes['valdren_comedor']['commerce']['buyer_name'],self.content.npcs['edran_elva']['name'])
  self.assertNotIn('open',nodes['valdren_comedor']['commerce'])
