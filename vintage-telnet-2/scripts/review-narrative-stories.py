"""Read whole story paths on a fresh API database; never uses production players."""
import sys,json,tempfile,uuid
from pathlib import Path
from collections import deque
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root))
from server.app import create_app
from server.content import Content
from werkzeug.security import generate_password_hash
class Clock:
 now=12*3600
 def __call__(self):return self.now
class RNG:
 def random(self):return .9
mode=sys.argv[1] if len(sys.argv)>1 else 'all'
clock=Clock();content=Content(root/'content');events=[];moves=0
with tempfile.TemporaryDirectory(prefix='vt-story-reader-') as tmp:
 app=create_app({'TESTING':True,'DATA_DIR':tmp,'CONTENT_DIR':str(root/'content'),'CLOCK':clock,'RNG':RNG(),'DM_PASSWORD_HASH':generate_password_hash('isolated-story-review')})
 client=app.test_client();dm=app.test_client()
 def post(c,path,data):
  csrf=c.get('/api/state').json['csrf_token'];r=c.post(path,json=dict(data,csrf_token=csrf));assert r.status_code in (200,201),(path,data.get('id'),data.get('target'),r.json);return r.json
 def state():return client.get('/api/state').json
 def act(id,target=None,**extra):
  global moves
  clock.now+=3
  s=post(client,'/api/action',{'id':id,'target':target,'request_id':str(uuid.uuid4()),**extra})
  moves+=id=='mover';events.append({'action':id,'target':target,'topic':extra.get('topic'),'room':s['room']['id'],'narrative':s['narrative'],'scene':s.get('scene'),'quests':s['quests'],'hp':s['character']['hp'],'seals':s['character']['seals']});return s
 def walk(dest):
  start=state()['room']['id']
  if start.startswith('home:'):act('mover','salir');start=state()['room']['id']
  q=deque([(start,[])]);seen={start}
  while q:
   here,path=q.popleft()
   if here==dest:break
   for direction,to in content.rooms[here].get('exits',{}).items():
    if to not in seen:seen.add(to);q.append((to,path+[direction]))
  else:raise AssertionError(dest)
  for direction in path:
   s=state();move=next(a for a in s['actions'] if a['id']=='mover' and a.get('target')==direction)
   if move.get('disabled'):
    permit=next(a for a in s['actions'] if a['id'].startswith('pedir_permiso'));act(permit['id'],permit.get('target'))
   act('mover',direction)
 def talk(npc,topic):return act('hablar',npc,topic=topic)
 def accept(qid):walk(content.quests[qid]['accept_room']);act('aceptar',qid)
 def paid(qid):
  walk(content.quests[qid]['accept_room']);s=act('cobrar',qid);assert next(q for q in s['quests'] if q['id']==qid)['status']=='paid'
 post(client,'/api/account/register',{'username':'story-reader-'+mode,'password':'temporary-story-reader'})
 c=post(client,'/api/character/create',{'name':'Lectura '+mode,'species':'humano','class_id':'juramentado','gender':'femenino'})
 post(dm,'/api/master/login',{'username':'vaisork','password':'isolated-story-review'});post(dm,'/api/master/approve',{'character_id':c['character']['id']})
 act('mover','salir')
 if mode=='all':
  accept('valdren_recado_forja');walk('valdren_cobertizo');talk('edran_bren','rueda');act('edran_comprobar_rueda');paid('valdren_recado_forja');talk('edran_daro','trabajo')
  accept('valdren_revision_cobertizos');walk('valdren_graneros');act('examinar','esquina');walk('edran_cobertizo_campo');act('examinar','estacas');paid('valdren_revision_cobertizos')
  accept('valdren_estado_vado');walk('edran_puente_juncos');act('examinar','apoyos');walk('edran_hito_campos');act('examinar','losa');paid('valdren_estado_vado')
  accept('khariel_polea');walk('hoshai_campamento_lona');act('hablar_adversario','forajido_camino',topic='qué quieres');talk('hoshai_seran','cuenta');talk('hoshai_seran','acuerdo');walk('hoshai_cajas_camino');act('hoshai_recoger_polea');walk('hoshai_taller_apoyos');act('hoshai_entregar_polea');paid('khariel_polea');talk('hoshai_daren','polea')
  accept('khariel_cornisa');walk('hoshai_deposito_comun');walk('hoshai_balcon_valle');act('examinar','cornisa');act('hoshai_marcar_cornisa');walk('hoshai_mercado_cintas');talk('hoshai_luma','cornisa');paid('khariel_cornisa')
  accept('brumak_taza');talk('korven_taren','medidas');walk('korven_horno_reposo');act('examinar','recipiente');act('korven_recomendar_base');walk('korven_entrante_piezas');talk('korven_taren','recomendación');paid('brumak_taza');talk('korven_taren','recomendación')
  accept('narevia_preparativos');walk('lethra_plataforma_secado');act('examinar','costuras');act('lethra_elegir_cubierto');walk('lethra_cocina_reunion');talk('lethra_nima','preparativos');paid('narevia_preparativos')
  accept('velmora_recipiente');walk('nhal_umbral_elin');talk('nhal_elin','entrega');walk('nhal_taller_cortezas');talk('nhal_desi','apoyo');walk('nhal_secadero_sombra');act('nhal_preparar_recipiente');walk('nhal_umbral_elin');act('nhal_entregar_recipiente');paid('velmora_recipiente');talk('nhal_varo','recipiente')
  accept('vaisgard_aviso_carga');walk('veyra_puerta_piedra');talk('veyra_tov','aviso');walk('veyra_archivo_cargas');talk('veyra_nera','aviso_preciso');paid('vaisgard_aviso_carga')
  accept('vaisgard_toldo');act('examinar','costura');act('veyra_preparar_perchas');paid('vaisgard_toldo');talk('veyra_seli','reparación')
 elif mode=='branches':
  accept('khariel_cornisa');walk('hoshai_deposito_comun');walk('hoshai_balcon_valle');act('examinar','cornisa');act('hoshai_pedir_revision');walk('hoshai_mercado_cintas');talk('hoshai_luma','cornisa');paid('khariel_cornisa');talk('hoshai_luma','cornisa')
  accept('brumak_taza');talk('korven_taren','medidas');walk('korven_horno_reposo');act('examinar','recipiente');act('korven_recomendar_aro');walk('korven_entrante_piezas');talk('korven_taren','recomendación');paid('brumak_taza');talk('korven_taren','recomendación')
  accept('narevia_preparativos');walk('lethra_plataforma_secado');act('examinar','costuras');act('lethra_elegir_paño');walk('lethra_cocina_reunion');talk('lethra_nima','preparativos');paid('narevia_preparativos');walk('lethra_cocina_reunion');talk('lethra_nima','preparativos')
  accept('vaisgard_aviso_carga');walk('veyra_puerta_piedra');talk('veyra_tov','aviso');walk('veyra_archivo_cargas');talk('veyra_nera','pedir_comprobacion');paid('vaisgard_aviso_carga');walk('veyra_archivo_cargas');talk('veyra_nera','cargas')
  accept('vaisgard_toldo');act('examinar','costura');walk('vaisgard_mercado');act('veyra_recibir_fibra_toldo');walk('veyra_calle_toldos');act('veyra_atar_toldo_prestado');paid('vaisgard_toldo');talk('veyra_seli','reparación')
 elif mode=='blind':
  walk('nhal_taller_cortezas');talk('nhal_desi','figura');talk('nhal_desi','pata');act('nhal_sujetar_figura');talk('nhal_desi','figura');talk('nhal_desi','pata');talk('nhal_desi','apoyo')
  walk('nhal_patio_relato');talk('nhal_leris','relato');walk('nhal_umbral_elin');act('nhal_escuchar_elin');talk('nhal_elin','recipiente');walk('nhal_patio_relato');act('nhal_ampliar_relato');talk('nhal_leris','relato');talk('nhal_leris','raspon');walk('nhal_umbral_elin');act('nhal_devolver_recipiente');talk('nhal_elin','leris')
  walk('korven_almacen_entrada');talk('korven_ruma','balanza');walk('korven_almacen_fondo');act('korven_recoger_placa');walk('korven_almacen_entrada');act('korven_devolver_placa');talk('korven_ruma','balanza')
  walk('valdren_cobertizo');talk('edran_bren','rueda');act('edran_comprobar_rueda');walk('edran_casa_camino');act('edran_leer_nota');act('edran_corregir_mensaje');walk('valdren_comedor');talk('edran_elva','noticia');walk('valdren_plaza');act('mover','hogar')
 else:raise AssertionError(mode)
 final=state();assert not final['character']['combat'];assert final['character']['hp']>0
 result={'mode':mode,'scope':'Real Flask API; new temporary database; clock/RNG controlled; no production data or seeded story flags.','moves':moves,'actions':len(events),'events':events,'final_room':final['room']['id'],'final_quests':final['quests'],'final_hp':final['character']['hp']}
 print(json.dumps({'mode':mode,'moves':moves,'actions':len(events),'paid':sum(q['status']=='paid' for q in final['quests']),'scope':result['scope']}))
