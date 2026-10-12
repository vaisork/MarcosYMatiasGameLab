"""Result prose reflects actual transitions instead of invented outcomes."""
from pathlib import Path
import unittest
from server.content import Content
from server.engine import Engine,RuleError
from server import mechanics as m

class ZeroRandom:
 def random(self):return 0

class NarrativeResultTests(unittest.TestCase):
 def setUp(self):
  self.content=Content(Path(__file__).resolve().parents[1]/'content')
  self.now=43200;self.e=Engine(self.content,lambda:self.now,ZeroRandom())
  self.s=m.new_state('humano','juramentado','home:review',self.now)
  self.s['location']='valdren_fragua';self.s['seals']=50
  self.char={'id':999,'name':'Review','species':'humano','class_id':'juramentado','status':'approved','state':self.s}
  self.w={'flags':[],'deaths':{},'version':0}
 def act(self,id,target=None,**extra):self.e.apply(self.char,self.w,{'id':id,'target':target,**extra})
 def human(self):
  self.content.creatures['forajido_camino']['dialogue']={'exigencia':'Quiero la carga, no una pelea.','salida':'Tienes el desvío a tu espalda.'}
  self.content.rooms['valdren_fragua']['signals']=[{'creature':'forajido_camino','text':'Un salteador exige una carga.'}]
 def test_human_conversation_uses_authored_voice_without_commitment_or_payment(self):
  self.human();before=self.s['seals'];weapon=self.s['equipment']['weapon']
  intent=self.e.parse_intent(self.char,self.w,{'text':'hablar con Salteador de cargas exigencia'})
  self.e.apply(self.char,self.w,intent)
  self.assertIn('Quiero la carga',self.s['events'][0]['text']);self.assertEqual(self.s['events'][0]['kind'],'npc')
  self.assertIsNone(self.s['combat']);self.assertEqual(self.s['seals'],before);self.assertEqual(self.s['equipment']['weapon'],weapon)
  self.assertTrue(any(action['id']=='mover' for action in self.e.actions(self.char,self.w)))
  self.assertNotIn('forajido_camino',self.s['bestiary'])
  self.act('combatir','forajido_camino')
  with self.assertRaises(RuleError):self.act('hablar_adversario','forajido_camino',topic='exigencia')
 def test_human_defeat_has_authored_result_without_claiming_death(self):
  self.human();self.content.creatures['forajido_camino']['defeat_text']='El salteador baja el palo y se aparta del paso.'
  self.act('combatir','forajido_camino');self.now+=16;self.e.tick(self.char,self.w)
  self.assertIn('baja el palo',str(self.s['events']));self.assertEqual(self.s['seals'],54)
  self.assertNotIn('muerto',str(self.s['events']));self.assertNotIn('forajido_camino',self.s['bestiary'])
 def test_delivery_has_real_speaker_consequence_and_reduced_payment_explanation(self):
  quest=self.content.quests['valdren_recado_forja'];quest['required_rooms']=[];quest['required_actions']=[];quest['required_flags']=[]
  quest['accept_dialogue']='Pregunta por la medida y vuelve con la respuesta.';quest['delivery_text']='La medida vuelve al taller.';quest['payment_dialogue']='Ahora puedo ajustar esa pieza.'
  self.act('aceptar','valdren_recado_forja');self.assertTrue(self.s['events'][0]['text'].startswith('Daro:'))
  self.s['ledger']=[{'family':'valdren_paid_errands','at':self.now} for _ in range(2)]
  self.act('cobrar','valdren_recado_forja')
  self.assertIn('La medida vuelve',str(self.s['events']));self.assertIn('Daro: Ahora puedo',str(self.s['events']))
  self.assertIn('última hora',str(self.s['events']));self.assertEqual(self.s['seals'],53)
  with self.assertRaises(RuleError):self.act('cobrar','valdren_recado_forja')
 def test_absent_speaker_and_unknown_human_do_not_create_dialogue(self):
  quest=self.content.quests['valdren_recado_forja'];quest['accept_dialogue']='Ven, te explicaré el trabajo.'
  self.content.npcs['edran_daro']['home_room']='valdren_plaza'
  import copy
  before=copy.deepcopy(self.s)
  with self.assertRaises(RuleError):self.act('aceptar','valdren_recado_forja')
  self.assertEqual(self.s,before)
  self.assertFalse(any(line['kind']=='npc' for line in self.s['events']))
  self.assertNotIn('Ven, te explicaré',str(self.s['events']))
  with self.assertRaises(RuleError):self.act('hablar_adversario','forajido_camino',topic='exigencia')
  self.assertEqual(self.s['seals'],50)
 def test_purchase_reports_balance_without_equipping_or_restoring_health(self):
  room=self.content.rooms['valdren_fragua'];room['shop']=['provision_basica']
  self.s['hp']=70;before=self.s['equipment'].copy();self.act('comprar','provision_basica')
  self.assertIn('Te quedan 42 sellos',str(self.s['events']));self.assertEqual(self.s['hp'],70);self.assertEqual(self.s['equipment'],before)
  self.assertTrue(any(item.get('catalog_id',item['id'])=='provision_basica' for item in self.s['inventory']))
if __name__=='__main__':unittest.main()
