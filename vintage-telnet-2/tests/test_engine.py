"""Functional API journeys; authored technical fixtures are never player content."""
import json
from pathlib import Path
import tempfile
import unittest
from werkzeug.security import generate_password_hash
from server.app import create_app
from server import mechanics

class Clock:
 def __init__(self):self.now=12*3600
 def __call__(self):return self.now
class FixedRandom:
 def random(self):return 0

class JourneyTests(unittest.TestCase):
 def test_home_screen_manifest_and_icons_are_public_and_scoped_to_game(self):
  import struct
  def get(path):
   response=self.client.get(path);self.addCleanup(response.close);return response
  html=get('/').get_data(as_text=True)
  self.assertIn('rel="manifest"',html);self.assertIn('rel="apple-touch-icon"',html)
  response=get('/client/manifest.webmanifest')
  self.assertEqual(response.status_code,200);self.assertEqual(response.mimetype,'application/manifest+json')
  manifest=json.loads(response.get_data(as_text=True))
  self.assertEqual(manifest['start_url'],'/');self.assertEqual(manifest['display'],'standalone')
  for icon in manifest['icons']:
   asset=get(icon['src']);self.assertEqual(asset.status_code,200)
   self.assertEqual(asset.mimetype,'image/png');self.assertEqual(asset.data[:8],b'\x89PNG\r\n\x1a\n')
   width,height=struct.unpack('>II',asset.data[16:24]);self.assertEqual(f'{width}x{height}',icon['sizes'])
  apple=get('/client/icons/apple-touch-icon.png')
  self.assertEqual(struct.unpack('>II',apple.data[16:24]),(180,180))
  self.assertEqual(get('/favicon.ico').mimetype,'image/png')
  self.assertEqual(get('/client/icons/server.env').status_code,404)

 def test_director_expel_blocks_sessions_and_preserves_progress_on_return(self):
  cid=self.create();store=self.app.extensions['store']
  stale=self.app.test_client()
  with self.client.session_transaction() as source:cookie=dict(source)
  with stale.session_transaction() as target:target.update(cookie)
  path='/api/master/account/access';body={'character_id':cid,'blocked':True}
  with store.transaction() as db:before=store.load(db.execute('SELECT * FROM characters WHERE id=?',(cid,)).fetchone())['state']
  self.assertEqual(self.post(self.client,path,body).status_code,403)
  self.assertEqual(self.master.post(path,json=body).status_code,403)
  self.assertEqual(self.post(self.master,path,{**body,'blocked':'yes'}).status_code,400)
  self.assertEqual(self.post(self.master,path,body).status_code,200)
  response=self.client.post('/api/action',json={'id':'mirar','csrf_token':cookie['csrf']})
  self.assertEqual(response.status_code,403)
  self.assertFalse(self.client.get('/api/state').json['authenticated'])
  self.assertEqual(self.post(self.client,'/api/account/login',{'username':'tester','password':'testpass123'}).status_code,403)
  self.assertEqual(self.master.get('/api/master/state').json['approved'][0]['blocked'],1)
  self.assertEqual(self.post(self.master,path,{**body,'blocked':False}).status_code,200)
  self.assertFalse(stale.get('/api/state').json['authenticated'])
  self.assertEqual(self.post(self.client,'/api/account/login',{'username':'tester','password':'testpass123'}).status_code,200)
  with store.transaction() as db:
   after=store.load(db.execute('SELECT * FROM characters WHERE id=?',(cid,)).fetchone())['state']
   for key in ('level','xp','inventory','known','visited','bestiary','quests','attributes'):
    self.assertEqual(after[key],before[key])

 def test_director_changes_account_password_without_changing_characters(self):
  cid=self.create();store=self.app.extensions['store']
  with store.transaction() as db:before=dict(db.execute('SELECT * FROM characters WHERE id=?',(cid,)).fetchone())
  path='/api/master/account/password';data={'character_id':cid,'password':'new-test-password','confirmation':'new-test-password'}
  self.assertEqual(self.post(self.client,path,data).status_code,403)
  self.assertEqual(self.master.post(path,json=data).status_code,403)
  for extra in ({'password':'short','confirmation':'short'},{'confirmation':'different'},{'character_id':999999}):
   self.assertIn(self.post(self.master,path,{**data,**extra}).status_code,(400,404))
  changed=self.post(self.master,path,data)
  self.assertEqual(changed.status_code,200)
  self.assertNotIn('new-test-password',changed.get_data(as_text=True))
  with store.transaction() as db:
   self.assertEqual(dict(db.execute('SELECT * FROM characters WHERE id=?',(cid,)).fetchone()),before)
   self.assertNotIn('new-test-password',db.execute('SELECT password_hash FROM accounts').fetchone()[0])
   self.assertEqual(db.execute("SELECT count(*) FROM audit WHERE action='account_password_change'").fetchone()[0],1)
  self.post(self.client,'/api/account/logout',{})
  self.assertEqual(self.post(self.client,'/api/account/login',{'username':'tester','password':'testpass123'}).status_code,401)
  self.assertEqual(self.post(self.client,'/api/account/login',{'username':'tester','password':'new-test-password'}).status_code,200)

 def test_director_sees_actual_level_species_and_class(self):
  cid=self.create()
  store=self.app.extensions['store']
  with store.transaction() as db:
   character=store.load(db.execute('SELECT * FROM characters WHERE id=?',(cid,)).fetchone())
   character['state']['level']=7;character['state']['portrait']='/client/art/players/vaison-anime-nivel-1-v1.webp';store.save(db,character)
  response=self.master.get('/api/master/state')
  self.assertEqual(response.status_code,200)
  entry=next(c for c in response.json['approved'] if c['id']==cid)
  self.assertEqual(entry['level'],7)
  self.assertEqual(entry['species'],'humano')
  self.assertEqual(entry['class_id'],'juramentado')
  self.assertEqual(entry['portrait'],'/client/art/players/vaison-anime-nivel-1-v1.webp')

 def test_personal_portrait_is_persistent_and_rejects_external_urls(self):
  self.create()
  store=self.app.extensions['store']
  for portrait,expected in [('/client/art/players/senku-anime-v1.webp',True),('https://example.com/face.webp',False),('/client/art/players/../secret.webp',False)]:
   with store.transaction() as db:
    character=store.load(db.execute('SELECT * FROM characters').fetchone())
    character['state']['portrait']=portrait;store.save(db,character)
   snapshot=self.client.get('/api/state').json['character']
   self.assertEqual('portrait' in snapshot,expected)
   if expected:self.assertEqual(snapshot['portrait'],portrait)

 def test_gender_choice_preserves_existing_character_and_survives_login(self):
  cid=self.create();before=self.client.get('/api/state').json['character']
  self.assertIsNone(before['gender'])
  changed=self.post(self.client,'/api/character/profile',{'gender':'femenino'})
  self.assertEqual(changed.status_code,200)
  self.assertEqual(changed.json['character']['gender'],'femenino')
  self.assertEqual(self.post(self.client,'/api/character/profile',{'gender':'masculino'}).status_code,409)  # chosen once, at creation or first time
  for key in ('id','species','class_id','location','hp','level','seals','equipment'):
   self.assertEqual(changed.json['character'][key],before[key])
  self.post(self.client,'/api/account/logout',{})
  result=self.post(self.client,'/api/account/login',{'username':'tester','password':'testpass123'})
  self.assertEqual(result.json['character']['gender'],'femenino')
  self.assertEqual(result.json['character']['id'],cid)

 def test_gender_is_validated_and_requires_an_owned_character(self):
  self.assertEqual(self.post(self.client,'/api/character/profile',{'gender':'masculino'}).status_code,401)
  self.create()
  for invalid in ('', 'inventado', None, ['masculino']):
   self.assertEqual(self.post(self.client,'/api/character/profile',{'gender':invalid}).status_code,400)
  self.assertIsNone(self.client.get('/api/state').json['character']['gender'])

 def test_new_character_keeps_selected_gender_before_and_after_approval(self):
  self.post(self.client,'/api/account/register',{'username':'tester','password':'testpass123'})
  response=self.post(self.client,'/api/character/create',{'name':'Camino','species':'humano','class_id':'juramentado','gender':'masculino'})
  self.assertEqual(response.status_code,201);self.assertEqual(response.json['character']['gender'],'masculino')
  self.post(self.master,'/api/master/login',{'password':'private-master-test'})
  self.post(self.master,'/api/master/approve',{'character_id':response.json['character']['id']})
  self.assertEqual(self.client.get('/api/state').json['character']['gender'],'masculino')

 def test_dialogue_updates_after_world_action_without_hiding_other_topics(self):
  path=Path(self.app.config['CONTENT_DIR'])/'world.json';content=json.loads(path.read_text())
  content['npcs']['worker']['states']=[{'requires_flags':['bridge_saved'],'overrides':{'topics':{'trabajo':'La tabla que dejaste sostiene el paso; ahora puedo terminar el banco.'}}}]
  path.write_text(json.dumps(content))
  self.create();self.action('mover','salir')
  before=self.action('hablar','worker',topic='trabajo')
  self.assertIn('necesita un tablón',before['narrative'][0]['text'])
  self.action('mover','norte');self.action('repair');self.action('mover','sur')
  after=self.action('hablar','worker',topic='trabajo')
  self.assertIn('La tabla que dejaste',after['narrative'][0]['text'])
  self.assertNotIn('necesita un tablón',after['narrative'][0]['text'])
  self.assertIn('Ahora el paso está seguro.',self.action('hablar','worker',topic='secreto')['narrative'][0]['text'])

 def test_conversation_recall_is_once_per_visit_and_retry_keeps_its_result(self):
  path=Path(self.app.config['CONTENT_DIR'])/'world.json';content=json.loads(path.read_text())
  content['npcs']['worker']['memory']={'bridge_saved':'La tabla que dejaste mantiene firme el paso.'}
  content['npcs']['worker']['topics']['banco']='El banco conserva la marca del cepillo.'
  path.write_text(json.dumps(content));self.create();self.action('mover','salir');self.action('mover','norte');self.action('repair');self.action('mover','sur')
  body={'id':'hablar','target':'worker','topic':'trabajo','request_id':'recollection-first'}
  first=self.post(self.client,'/api/action',body).json
  self.assertEqual(sum(e['kind']=='discovery' for e in first['narrative']),1)
  retry=self.post(self.client,'/api/action',body).json;self.assertEqual(retry['narrative'],first['narrative'])
  second=self.action('hablar','worker',topic='banco');self.assertFalse(any(e['kind']=='discovery' for e in second['narrative']))
  self.action('mover','norte');self.action('mover','sur')
  again=self.action('hablar','worker',topic='banco');self.assertEqual(sum(e['kind']=='discovery' for e in again['narrative']),1)

 def test_new_conversation_memory_can_appear_without_leaving_the_room(self):
  path=Path(self.app.config['CONTENT_DIR'])/'world.json';content=json.loads(path.read_text())
  npc=content['npcs']['worker'];npc['memory']={'bridge_saved':'El paso está firme.','tool_returned':'La herramienta volvió al banco.'}
  npc['topics']['herramienta']={'text':'Dejo la herramienta donde la encontramos.','set_flags':['tool_returned']}
  path.write_text(json.dumps(content));self.create();self.action('mover','salir');self.action('mover','norte');self.action('repair');self.action('mover','sur')
  self.action('hablar','worker',topic='trabajo')
  result=self.action('hablar','worker',topic='herramienta')
  self.assertIn('La herramienta volvió al banco.',[e['text'] for e in result['narrative']])

 def test_tester_travel_requires_director_permission_and_preserves_progress(self):
  cid=self.create();self.assertNotIn('tester',self.client.get('/api/state').json)
  self.assertEqual(self.post(self.client,'/api/character/tester/travel',{'destination':'town'}).status_code,403)
  self.assertEqual(self.post(self.client,'/api/master/tester',{'character_id':cid,'enabled':True}).status_code,403)
  self.assertEqual(self.post(self.master,'/api/master/tester',{'character_id':cid,'enabled':True}).status_code,200)
  before=self.client.get('/api/state').json;self.assertTrue(before['tester']['enabled'])
  self.assertEqual(self.post(self.client,'/api/character/tester/travel',{'destination':'secret'}).status_code,400)
  result=self.post(self.client,'/api/character/tester/travel',{'destination':'town','recover':True})
  self.assertEqual(result.status_code,200);after=result.json
  self.assertEqual(after['character']['location'],'town');self.assertEqual(after['map']['edges'],before['map']['edges'])
  self.assertEqual({n['id'] for n in after['map']['nodes']}-{n['id'] for n in before['map']['nodes']},{'town'})
  for key in ('seals','xp','level','equipment','attributes'):self.assertEqual(after['character'][key],before['character'][key])
  self.assertEqual(after['inventory'],before['inventory']);self.assertEqual(after['bestiary'],before['bestiary'])
  other=self.app.test_client();self.post(other,'/api/account/register',{'username':'other','password':'testpass123'})
  response=self.post(other,'/api/character/create',{'name':'Camino','species':'humano','class_id':'juramentado'})
  self.post(self.master,'/api/master/approve',{'character_id':response.json['character']['id']})
  self.assertEqual(self.post(other,'/api/character/tester/travel',{'destination':'town'}).status_code,403)
  self.assertEqual(self.post(self.master,'/api/master/tester',{'character_id':cid,'enabled':False}).status_code,200)
  self.assertNotIn('tester',self.client.get('/api/state').json)
  self.assertEqual(self.post(self.client,'/api/character/tester/travel',{'destination':'town'}).status_code,403)

 def test_tester_recovery_leaves_shared_combat_and_other_character_untouched(self):
  cid=self.create();self.post(self.master,'/api/master/tester',{'character_id':cid,'enabled':True})
  store=self.app.extensions['store']
  with store.transaction() as db:
   char=store.load(db.execute('SELECT * FROM characters WHERE id=?',(cid,)).fetchone())
   char['state'].update(hp=12,fatigue=80,wound='grave',rest_budget=0,combat={'creature':'espinajo_rastrojo','profile':{'hp':30},'hp':20,'round':0,'next_round':999999,'prepared':False,'cooldown':0})
   char['state']['wildlife_target']='town:espinajo_rastrojo'
   store.save(db,char);world=store.world(db);world['encounters']={'town:espinajo_rastrojo':cid};world['creature_states']={'town:espinajo_rastrojo':{'attention':[cid,999],'stage':'warning'}};store.save_world(db,world)
  result=self.post(self.client,'/api/character/tester/travel',{'destination':'town','recover':True})
  self.assertEqual(result.status_code,200);self.assertEqual(result.json['character']['hp'],result.json['character']['hp_max'])
  self.assertEqual(result.json['character']['fatigue'],0);self.assertIsNone(result.json['character']['wound']);self.assertIsNone(result.json['character']['combat'])
  with store.transaction() as db:
   self.assertEqual(store.world(db)['encounters'],{'town:espinajo_rastrojo':cid})
   self.assertEqual(store.world(db)['creature_states']['town:espinajo_rastrojo'],{'attention':[999],'stage':'warning'})
   self.assertEqual(db.execute("SELECT count(*) FROM audit WHERE action='tester_travel'").fetchone()[0],1)
  self.assertEqual(self.client.post('/api/character/tester/travel',json={'destination':'town'}).status_code,403)

 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);root=Path(self.temp.name);(root/'content').mkdir();self.clock=Clock()
  regions={s:{'name':s,'species':s,'settlement':'town','weather':['Despejado'],'home':{'description':'La ventana de tu hogar mira al trabajo de la plaza.','examine':{'mesa':'La mesa conserva las marcas de tus herramientas.'}}} for s in ('humano','felaryn','dravak','marevyn','vesperi')}
  rooms={'town':{'id':'town','name':'Plaza de prueba','region':'humano','kind':'settlement','description':'La plaza se abre entre el taller y la puerta del campo.','day':'El taller trabaja con la puerta abierta.','night':'La última lámpara permanece en el taller.','clear':'El polvo revela las rodadas recientes.','rain':'El agua borra las rodadas.','exits':{'norte':'field'},'npcs':['worker'],'shop':['food'],'recovery_service':True,'memories':[{'requires_flags':['bridge_saved'],'text':'La pasarela sigue firme gracias al tablón que dejaste.'}]},
   'field':{'id':'field','name':'Campo de prueba','region':'humano','kind':'wilderness','description':'El campo cae hacia una zanja y vuelve hacia la puerta de la plaza.','exits':{'sur':'town'},'signals':[{'creature':'espinajo_rastrojo','text':'Una criatura baja acomoda el cuerpo frente a la zanja.'}],'actions':[{'id':'repair','label':'Afirmar el tablón','text':'El tablón deja de ceder.','set_flags':['bridge_saved'],'forbids_flags':['bridge_saved'],'journal':'Aseguraste la pasarela del campo.'}]},
   'secret':{'id':'secret','name':'SECRET HIDDEN','region':'humano','kind':'interior','description':'Hidden fixture','exits':{}}}
  content={'regions':regions,'rooms':rooms,'npcs':{'worker':{'name':'La trabajadora','home_room':'town','description':'Sostiene una tabla sobre el banco.','topics':{'trabajo':'El campo necesita un tablón firme.','secreto':{'requires_flags':['bridge_saved'],'text':'Ahora el paso está seguro.'}}}},'creatures':{'espinajo_rastrojo':{'name':'Espinajo de prueba','description':'Su postura muestra que defiende la zanja.','warning':'Se prepara para cargar: tienes una intervención antes del contacto.'}},'items':{'food':{'name':'Provisión de prueba','kind':'consumable','effect':'basic_provision','price':8}},'quests':{'valdren_recado_forja':{'name':'Revisar el paso','accept_room':'town','required_rooms':['field'],'required_flags':['bridge_saved'],'payout':6}}}
  (root/'content/world.json').write_text(json.dumps(content))
  self.app=create_app({'TESTING':True,'DATA_DIR':str(root/'data'),'CONTENT_DIR':str(root/'content'),'CLOCK':self.clock,'RNG':FixedRandom(),'DM_PASSWORD_HASH':generate_password_hash('private-master-test')})
  self.client=self.app.test_client();self.master=self.app.test_client();self.sequence=0
 def post(self,client,path,data):
  csrf=client.get('/api/state').json['csrf_token'];return client.post(path,json=dict(data,csrf_token=csrf))
 def create(self,class_id='juramentado',approve=True):
  self.assertEqual(self.post(self.client,'/api/account/register',{'username':'tester','password':'testpass123'}).status_code,201)
  response=self.post(self.client,'/api/character/create',{'name':'Camino','species':'humano','class_id':class_id});self.assertEqual(response.status_code,201);cid=response.json['character']['id']
  if approve:
   self.assertEqual(self.post(self.master,'/api/master/login',{'password':'private-master-test'}).status_code,200)
   self.assertEqual(self.post(self.master,'/api/master/approve',{'character_id':cid}).status_code,200)
  return cid
 def action(self,id,target=None,**extra):
  self.sequence+=1;data={'id':id,'request_id':f'test-action-{self.sequence}'}
  if target is not None:data['target']=target
  data.update(extra);response=self.post(self.client,'/api/action',data);self.assertEqual(response.status_code,200,response.json);return response.json
 def wildlife_fixture(self,creature,**context):
  file=Path(self.temp.name)/'content/world.json';data=json.loads(file.read_text())
  data['creatures'][creature]={'name':creature,'description':'Una presencia animal observada.'}
  data['rooms']['field']['signals']=[{'creature':creature,'text':'La criatura está junto a su refugio.'}]
  data['rooms']['field']['combat_context']=context;file.write_text(json.dumps(data))
  self.create();self.action('mover','salir');self.action('mover','norte')
 def test_mordelinde_escapes_without_reward_and_returns_after_threat_leaves(self):
  self.wildlife_fixture('mordelinde');state=self.action('combatir','mordelinde')
  self.assertIsNone(state['character']['combat']);self.assertEqual(state['character']['xp'],0);self.assertEqual(state['character']['hp'],100)
  self.assertFalse(any(a['id']=='combatir' for a in state['actions']))
  self.assertFalse(any('refugio' in l['text'] for l in state['scene'] if l['kind']=='danger'))
  self.action('mover','sur');returned=self.action('mover','norte')
  self.assertTrue(any(a['id']=='combatir' for a in returned['actions']))
 def test_cornered_mordelinde_defends_and_opening_escape_ends_without_victory(self):
  self.wildlife_fixture('mordelinde',creature_cornered=True,escape_can_be_opened=True)
  file=Path(self.temp.name)/'content/world.json';data=json.loads(file.read_text())
  actual=json.loads((Path(__file__).resolve().parents[1]/'content/world.json').read_text())['creatures']['mordelinde']
  data['creatures']['mordelinde'].update(warning=actual['warning'],combat_intro=actual['combat_intro']);file.write_text(json.dumps(data))
  started=self.action('combatir','mordelinde')
  self.assertEqual(started['narrative'][0]['text'],actual['combat_intro'])
  self.clock.now+=4;damaged=self.client.get('/api/state').json
  self.assertLess(damaged['character']['hp'],100);self.action('abrir_salida');self.clock.now+=4
  released=self.client.get('/api/state').json;self.assertIsNone(released['character']['combat'])
  self.assertEqual(released['character']['xp'],0);self.assertEqual(released['character']['hp'],damaged['character']['hp'])
  self.action('mover','sur');self.action('mover','norte');reapproach=self.action('combatir','mordelinde')
  self.assertIsNone(reapproach['character']['combat']);self.assertEqual(reapproach['character']['xp'],0)
 def test_cornalomo_warning_allows_safe_retreat_before_committed_encounter(self):
  self.wildlife_fixture('cornalomo');warning=self.action('acercarse','cornalomo')
  self.assertIsNone(warning['character']['combat']);self.assertEqual(warning['character']['hp'],100)
  self.action('retirarse','cornalomo');self.assertFalse(any(a['id']=='combatir' for a in self.client.get('/api/state').json['actions']))
  self.action('acercarse','cornalomo');committed=self.action('combatir','cornalomo');self.assertIsNotNone(committed['character']['combat'])
  self.action('huir');self.clock.now+=4;escaped=self.client.get('/api/state').json
  self.assertIsNone(escaped['character']['combat']);self.assertEqual(escaped['room']['id'],'town');self.clock.now+=8
  self.assertIsNone(self.client.get('/api/state').json['character']['combat'])
 def test_committing_to_combat_replaces_the_peaceful_approach_warning(self):
  self.wildlife_fixture('cornalomo')
  file=Path(self.temp.name)/'content/world.json';data=json.loads(file.read_text())
  data['creatures']['cornalomo'].update(warning='Todavía puedes retirarte antes del contacto.',combat_intro='El Cornalomo planta las patas y gira hacia ti.')
  file.write_text(json.dumps(data))
  warning=self.action('acercarse','cornalomo')
  self.assertEqual(warning['narrative'][0]['text'],'Todavía puedes retirarte antes del contacto.')
  self.assertIsNone(warning['character']['combat'])
  started=self.action('combatir','cornalomo')
  self.assertEqual(started['narrative'][0]['text'],'El Cornalomo planta las patas y gira hacia ti.')
  self.assertIsNotNone(started['character']['combat'])
  self.assertEqual(started['character']['hp'],warning['character']['hp'])
  self.assertIn('huir',[a['id'] for a in started['actions']])
  self.assertNotIn('retirarse',[a['id'] for a in started['actions']])
 def test_authored_time_weather_and_npc_guards_are_server_authoritative(self):
  file=Path(self.temp.name)/'content/world.json';data=json.loads(file.read_text())
  data['rooms']['field']['actions'][0].update(requires_time=['día'],forbids_weather=['lluvia'])
  data['rooms']['town']['actions']=[{'id':'assist','label':'Ayudar a la trabajadora','text':'La ayuda queda hecha.','requires_npc':'worker'}]
  data['npcs']['worker']['schedule']=['día'];file.write_text(json.dumps(data))
  self.create();self.action('mover','salir');self.action('mover','norte')
  self.clock.now=23*3600
  self.assertEqual(self.post(self.client,'/api/action',{'id':'repair','request_id':'night-repair'}).status_code,409)
  self.action('mover','sur');self.assertEqual(self.post(self.client,'/api/action',{'id':'assist','request_id':'absent-assist'}).status_code,409)
  self.clock.now=12*3600;self.action('assist');self.action('mover','norte')
  data['regions']['humano']['weather']=['Lluvia'];file.write_text(json.dumps(data))
  self.assertEqual(self.post(self.client,'/api/action',{'id':'repair','request_id':'rain-repair'}).status_code,409)
  data['regions']['humano']['weather']=['Despejado'];file.write_text(json.dumps(data));self.action('repair')
 def test_scene_prioritizes_danger_memory_and_persistent_physical_state(self):
  file=Path(self.temp.name)/'content/world.json';data=json.loads(file.read_text())
  field=data['rooms']['field'];field.update(day='Actividad rutinaria.',rain='La lluvia cambia el suelo.',memories=[{'requires_flags':['bridge_saved'],'text':'Recuerdas el trabajo terminado.'}],states=[{'requires_flags':['bridge_saved'],'overrides':{'description':'La pasarela está firme.','examine':{'tablón':'La sujeción reparada permanece fija.'}}}])
  file.write_text(json.dumps(data));self.create();self.action('mover','salir');self.action('mover','norte');fixed=self.action('repair')
  self.assertEqual(len(fixed['scene']),3);self.assertEqual(fixed['scene'][0]['text'],'La pasarela está firme.')
  self.assertEqual({line['kind'] for line in fixed['scene']},{'world','danger','discovery'})
  self.assertNotIn('Actividad rutinaria.',str(fixed['scene']));self.assertIn('Actividad rutinaria.',str(self.action('observar')['narrative']))
  self.assertIn('reparada',str(self.action('examinar','tablón')['narrative']))
 def test_pending_dm_gate_and_no_secret_or_cross_account_authority(self):
  cid=self.create(approve=False);state=self.client.get('/api/state').json
  self.assertTrue(state['pending_approval']);self.assertNotIn('room',state);self.assertNotIn('SECRET HIDDEN',json.dumps(state))
  self.assertEqual(self.post(self.client,'/api/action',{'id':'mirar','request_id':'blocked-1'}).status_code,403)
  self.assertEqual(self.post(self.client,'/api/master/approve',{'character_id':cid}).status_code,403)
  self.assertEqual(self.client.post('/api/master/login',json={'password':'private-master-test'}).status_code,403)
 def test_complete_narrative_choice_economy_home_reconnect_idempotent(self):
  self.create();home=self.client.get('/api/state').json['room']['id'];self.action('mover','salir')
  self.assertNotIn('secreto',[a.get('topic') for a in self.client.get('/api/state').json['actions']])
  self.action('aceptar','valdren_recado_forja');self.action('mover','norte');state=self.action('repair')
  self.assertIn('Aseguraste',state['journal'][0]);self.action('mover','sur')
  self.assertIn('secreto',[a.get('topic') for a in self.client.get('/api/state').json['actions']])
  data={'id':'cobrar','target':'valdren_recado_forja','request_id':'same-payment'}
  first=self.post(self.client,'/api/action',data);second=self.post(self.client,'/api/action',data)
  for key in ('character','inventory','journal','map','narrative'):
   self.assertEqual(first.json[key],second.json[key])
  self.assertEqual(first.json['character']['seals'],26)
  self.assertEqual(self.post(self.client,'/api/action',dict(data,id='mirar')).status_code,409)
  bought=self.action('comprar','food');self.assertEqual(bought['character']['seals'],18)
  self.action('mover','hogar');self.assertEqual(self.client.get('/api/state').json['room']['id'],home)
  self.post(self.client,'/api/account/logout',{});self.post(self.client,'/api/account/login',{'username':'tester','password':'testpass123'})
  resumed=self.client.get('/api/state').json;self.assertEqual(resumed['room']['id'],home);self.assertEqual(resumed['character']['seals'],18);self.assertEqual(len(resumed['inventory']),2)
  self.assertNotIn('SECRET HIDDEN',json.dumps(resumed));self.assertEqual(len(resumed['map']['nodes']),3)
 def test_combat_authoritative_round_and_gating(self):
  self.create('arcano');self.action('mover','salir');self.action('mover','norte');start=self.action('combatir','espinajo_rastrojo')
  self.assertTrue(start['character']['combat']['prepared']);self.action('capacidad')
  self.assertEqual(self.post(self.client,'/api/action',{'id':'huir','request_id':'double-intervention'}).status_code,409)
  self.assertEqual(self.post(self.client,'/api/action',{'id':'mover','target':'sur','request_id':'no-free-escape'}).status_code,409)
  self.clock.now+=4;state=self.client.get('/api/state').json
  self.assertEqual(state['character']['combat']['round'],1);self.assertFalse(state['character']['combat']['prepared']);self.assertEqual(state['character']['combat']['cooldown'],4)
  self.assertEqual(self.client.get('/api/state').json['character']['combat']['round'],1)
  self.clock.now+=60;state=self.client.get('/api/state').json;self.assertIsNone(state['character']['combat']);self.assertGreater(state['character']['xp'],0);self.assertEqual(state['character']['seals'],20)
 def test_rest_and_provision_preserve_budget(self):
  self.create()
  with self.app.extensions['store'].transaction() as db:
   char=self.app.extensions['store'].load(db.execute('SELECT * FROM characters').fetchone());char['state']['hp']=60;char['state']['fatigue']=60;self.app.extensions['store'].save(db,char)
  self.action('descansar');self.action('descansar');third=self.action('descansar');self.assertEqual(third['character']['hp'],72)
  self.action('mover','salir');self.action('comprar','food');used=self.action('usar','food');self.assertEqual(used['character']['hp'],90)
  self.assertEqual(self.post(self.client,'/api/action',{'id':'descansar','request_id':'rest-exhausted'}).status_code,409)
  after=self.client.get('/api/state').json;self.assertEqual(after['character']['hp'],90)
  rest=next(a for a in after['actions'] if a['id']=='descansar');self.assertTrue(rest['disabled']);self.assertIn('provisión',rest['reason'])
  self.assertEqual(after['character']['fatigue'],0)
 def test_another_account_advances_offline_combat_without_duplicating_enemy(self):
  self.create('arcano');self.action('mover','salir');self.action('mover','norte');self.action('combatir','espinajo_rastrojo')
  other=self.app.test_client();self.post(other,'/api/account/register',{'username':'another','password':'otherpass123'})
  created=self.post(other,'/api/character/create',{'name':'Otra persona','species':'humano','class_id':'artifice'})
  self.post(self.master,'/api/master/approve',{'character_id':created.json['character']['id']})
  for number,direction in enumerate(('salir','norte')):
   self.assertEqual(self.post(other,'/api/action',{'id':'mover','target':direction,'request_id':f'other-step-{number}'}).status_code,200)
  available=other.get('/api/state').json
  self.assertTrue(any(a['id']=='combatir' for a in available['actions']))
  # Watching can advance the shared encounter but does not join it or earn XP.
  self.clock.now+=60
  shared=other.get('/api/state').json
  self.assertFalse(any(a['id']=='combatir' for a in shared['actions']))
  owner=self.client.get('/api/state').json;self.assertIsNone(owner['character']['combat']);self.assertGreater(owner['character']['xp'],0)
  self.assertEqual(shared['character']['xp'],0)

 def test_concurrent_duplicate_action_records_one_transition(self):
  import concurrent.futures
  import threading
  self.create();self.action('mover','salir');self.action('mover','norte')
  with self.client.session_transaction() as source:cookie_state=dict(source)
  barrier=threading.Barrier(2)
  def submit():
   client=self.app.test_client()
   with client.session_transaction() as target:target.update(cookie_state)
   barrier.wait()
   return client.post('/api/action',json={'id':'repair','request_id':'concurrent-single-choice','csrf_token':cookie_state['csrf']})
  with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
   responses=list(pool.map(lambda _:submit(),range(2)))
  self.assertEqual([r.status_code for r in responses],[200,200])
  with self.app.extensions['store'].transaction() as db:
   self.assertEqual(db.execute("SELECT count(*) FROM requests WHERE request_id='concurrent-single-choice'").fetchone()[0],1)
   character=self.app.extensions['store'].load(db.execute('SELECT * FROM characters').fetchone())
   self.assertEqual(character['state']['flags'].count('bridge_saved'),1);self.assertEqual(len(character['state']['journal']),1)

 def test_flee_preserves_shared_creature_damage_and_death_preserves_progress(self):
  self.create();self.action('mover','salir');self.action('mover','norte');self.action('combatir','espinajo_rastrojo')
  self.clock.now+=4;self.client.get('/api/state');self.action('huir');self.clock.now+=4;fled=self.client.get('/api/state').json
  self.assertIsNone(fled['character']['combat']);self.assertEqual(fled['room']['id'],'town')
  self.action('mover','norte');self.action('combatir','espinajo_rastrojo')
  with self.app.extensions['store'].transaction() as db:
   character=self.app.extensions['store'].load(db.execute('SELECT * FROM characters').fetchone())
   self.assertEqual(character['state']['combat']['hp'],31)
   character['state']['hp']=1;character['state']['xp']=25;self.app.extensions['store'].save(db,character)
  self.clock.now+=4;dead=self.client.get('/api/state').json
  self.assertIsNone(dead['character']['combat']);self.assertEqual(dead['character']['location'],'town');self.assertEqual(dead['character']['hp'],60);self.assertEqual(dead['character']['fatigue'],40)
  self.assertEqual(dead['character']['xp'],25);self.assertEqual(dead['character']['seals'],20)

 def test_weather_two_hour_phase_and_night_does_not_repeat_day_clear_activity(self):
  root=Path(self.app.config['CONTENT_DIR']);path=root/'world.json';content=json.loads(path.read_text())
  content['regions']['humano']['weather']={'despejado':'Cielo despejado sobre la plaza.','lluvia':'El agua vuelve al canal de la plaza.'}
  content['regions']['humano']['weather_offset']=0
  content['rooms']['town']['clear']=content['rooms']['town']['day'];path.write_text(json.dumps(content))
  self.create();self.action('mover','salir');initial=self.client.get('/api/state').json
  self.clock.now+=3599;self.assertEqual(self.client.get('/api/state').json['ambient']['weather'],initial['ambient']['weather'])
  self.clock.now=14*3600;self.assertEqual(self.client.get('/api/state').json['ambient']['weather'],'Lluvia')
  self.clock.now=20*3600;night=self.action('mirar');self.assertEqual(night['ambient']['time_of_day'],'Noche')
  self.assertNotIn(content['rooms']['town']['day'],[line['text'] for line in night['scene']])

 def test_attribute_spend_requires_confirmation_cost_threshold_and_preserves_missing_hp(self):
  self.create()
  with self.app.extensions['store'].transaction() as db:
   character=self.app.extensions['store'].load(db.execute('SELECT * FROM characters').fetchone());character['state']['attributes']['resistencia']=19;character['state']['pa']=1;character['state']['hp']=60;self.app.extensions['store'].save(db,character)
  body={'id':'atributo','target':'resistencia','request_id':'confirmed-attribute-spend'}
  self.assertEqual(self.post(self.client,'/api/action',body).status_code,409)
  self.assertEqual(self.client.get('/api/state').json['character']['pa'],1)
  changed=self.post(self.client,'/api/action',dict(body,confirmed=True)).json
  self.assertEqual(changed['character']['pa'],0);self.assertEqual(changed['character']['attributes']['resistencia'],20);self.assertEqual(changed['character']['hp'],62.5)
  self.assertEqual(self.post(self.client,'/api/action',dict(body,confirmed=True)).json['character']['pa'],0)
  self.assertFalse(any(a['id']=='atributo' for a in changed['actions']))

 def test_same_origin_csrf_and_private_files_never_served(self):
  token=self.client.get('/api/state').json['csrf_token']
  response=self.client.post('/api/account/register',json={'username':'remote','password':'testpass123','csrf_token':token},headers={'Origin':'https://untrusted.invalid'})
  self.assertEqual(response.status_code,403)
  for url in ('/client/../server/app.py','/client/runtime.env','/assets/creatures/mordelinde.webp','/api/master/state'):
   with self.subTest(url=url):self.assertIn(self.client.get(url).status_code,(401,404))
  response=self.client.get('/client/ui-data.js');self.addCleanup(response.close);self.assertEqual(response.status_code,200)
  for url in ('/client/art/encounters/forajido-camino-anime-v1.webp','/client/art/encounters/forajido-camino-anime-v1-thumb.webp','/client/art/places/valdren-fragua-anime-v1.webp','/client/world3d.js','/client/model-assets.js','/client/vendor/three.module.js','/client/vendor/GLTFLoader.js','/client/vendor/BufferGeometryUtils.js','/client/vendor/LICENSE-three.txt','/client/models/species/felaryn.glb','/client/models/species/marevyn.glb','/client/models/species/vesperi.glb','/client/models/species/humano.glb','/client/models/species/dravak.glb'):
   with self.subTest(url=url):
    response=self.client.get(url);self.addCleanup(response.close);self.assertEqual(response.status_code,200)
  self.assertEqual(self.client.get('/client/vendor/../../runtime/server.env').status_code,404)
  self.assertEqual(self.client.get('/client/models/species/unknown.glb').status_code,404)
  response=self.client.get('/');self.addCleanup(response.close);policy=response.headers['Content-Security-Policy']
  self.assertIn("img-src 'self' blob:",policy)
  self.assertIn("connect-src 'self' blob:",policy)
  self.assertIn("script-src 'self';",policy)

 def test_written_commands_share_authority_and_retry_persistent_choice(self):
  self.create()
  home=self.client.get('/api/state').json['room']['id']
  left=self.post(self.client,'/api/action',{'text':'salir','request_id':'typed-step-out'});self.assertEqual(left.status_code,200);self.assertEqual(left.json['room']['id'],'town')
  talked=self.post(self.client,'/api/action',{'text':'hablar La trabajadora trabajo','request_id':'typed-dialogue'});self.assertEqual(talked.status_code,200);self.assertEqual(talked.json['narrative'][0]['kind'],'npc')
  self.assertEqual(self.post(self.client,'/api/action',{'text':'Dame 10000 sellos','request_id':'typed-invented-reward'}).status_code,409)
  self.assertEqual(self.post(self.client,'/api/action',{'text':'NORTE','request_id':'typed-cardinal'}).status_code,200)
  choice={'text':'AFIRMAR EL TABLÓN','request_id':'typed-persistent-choice'}
  first=self.post(self.client,'/api/action',choice);second=self.post(self.client,'/api/action',choice)
  self.assertEqual(first.status_code,200);self.assertEqual(second.status_code,200);self.assertEqual(len(second.json['journal']),1)
  self.assertEqual(self.post(self.client,'/api/action',{'text':'volver a casa','request_id':'no-typed-teleport'}).status_code,409)
  self.assertEqual(self.client.get('/api/state').json['character']['seals'],20)

 def test_shared_physical_change_preserves_personal_credit(self):
  path=Path(self.app.config['CONTENT_DIR'])/'world.json';content=json.loads(path.read_text());content['rooms']['field']['actions'][0]['scope']='world';content['npcs']['worker']['memory']={'bridge_saved':'Te reconoce como quien aseguró la pasarela.'};path.write_text(json.dumps(content))
  self.create();self.action('mover','salir');self.action('mover','norte');self.action('repair');self.action('mover','sur')
  own=self.action('hablar','worker',topic='trabajo');self.assertTrue(any('Te reconoce' in line['text'] for line in own['narrative']))
  other=self.app.test_client();self.post(other,'/api/account/register',{'username':'observer','password':'otherpass123'})
  created=self.post(other,'/api/character/create',{'name':'Observadora','species':'humano','class_id':'sombra'});self.post(self.master,'/api/master/approve',{'character_id':created.json['character']['id']})
  moved=self.post(other,'/api/action',{'id':'mover','target':'salir','request_id':'observer-arrival'}).json
  self.assertTrue(any('pasarela sigue firme' in line['text'] for line in moved['scene']))
  talked=self.post(other,'/api/action',{'id':'hablar','target':'worker','topic':'trabajo','request_id':'observer-dialogue'}).json
  self.assertFalse(any('Te reconoce' in line['text'] for line in talked['narrative']))

 def test_narrative_clock_and_owned_home(self):
  self.create();self.action('mover','salir');self.action('mirar');day=self.client.get('/api/state').json
  self.clock.now=22*3600;night=self.action('mirar');self.assertNotEqual(day['narrative'],night['narrative']);self.assertEqual(night['ambient']['time_of_day'],'Noche')
  self.assertEqual(self.post(self.client,'/api/action',{'id':'mover','target':'home:999','request_id':'foreign-home'}).status_code,409)

class FormulaTests(unittest.TestCase):
 def test_closed_formulas_weapon_profiles_and_class_separation(self):
  s=mechanics.new_state('humano','juramentado','home',0)
  self.assertEqual(mechanics.hp_max(s),100);self.assertEqual(mechanics.xp_next(1),100);self.assertEqual(mechanics.xp_next(5),176)
  self.assertEqual({v['damage'] for v in mechanics.WEAPONS.values()},{7,8,9,10})
  self.assertEqual([mechanics.CLASSES[k]['cooldown'] for k in ('juramentado','arcano','sombra','artifice')],[2,4,4,2])
  s['hp']=60;self.assertEqual(mechanics.rest(s),10);self.assertEqual(mechanics.rest(s),2);self.assertEqual(mechanics.rest(s),0)

if __name__=='__main__':unittest.main()

class SignatureTests(unittest.TestCase):
 def test_four_signature_outcomes_on_the_same_prepared_attack(self):
  outcomes={}
  for cls in mechanics.CLASSES:
   s=mechanics.new_state('humano',cls,'home',0);s['_class']=cls
   s['combat']={'profile':dict(mechanics.PROFILES['espinajo_rastrojo']),'hp':40,'prepared':True,'round':0,'cooldown':0,'intervention':{'id':'capacidad'}}
   lines,result=mechanics.resolve_round(s,{'name':'Prueba territorial'},FixedRandom())
   outcomes[cls]=(s['hp'],s['combat']['hp'],s['combat']['cooldown'])
  self.assertEqual(outcomes['juramentado'],(94,40,2))
  self.assertEqual(outcomes['arcano'],(92,40,4))
  self.assertEqual(outcomes['sombra'],(92,40,4))
  self.assertEqual(outcomes['artifice'],(92,34,2))
  class EnemyMiss:
   def random(self):return .99
  s=mechanics.new_state('humano','sombra','home',0);s['_class']='sombra';s['combat']={'profile':dict(mechanics.PROFILES['espinajo_rastrojo']),'hp':40,'prepared':True,'round':0,'cooldown':0,'intervention':{'id':'capacidad'}}
  mechanics.resolve_round(s,{'name':'Prueba territorial'},EnemyMiss());self.assertTrue(s['combat']['opening'])
