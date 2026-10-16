"""Real catalog: distinct weapons, safe sales and exceptional repairs."""
import unittest
from pathlib import Path
from server.content import Content
from server.engine import Engine,RuleError
from server.mechanics import new_state

class ForgeTests(unittest.TestCase):
 def setUp(self):
  self.engine=Engine(Content(Path(__file__).resolve().parents[1]/'content'),lambda:12*3600)
  self.state=new_state('humano','juramentado',1,12*3600)
  self.state['location']='valdren_fragua';self.state['seals']=300
  self.character={'id':1,'name':'Prueba','species':'humano','class_id':'juramentado','state':self.state}
  self.world={'flags':[]}
 def act(self,id,target=None,**kwargs):self.engine.apply(self.character,self.world,dict(id=id,target=target,**kwargs))
 def test_purchases_are_independent_and_sales_require_confirmation(self):
  self.act('comprar','varita_aprendiz');self.act('comprar','varita_aprendiz')
  first,second=self.state['inventory'][1:]
  self.assertNotEqual(first['id'],second['id']);self.assertEqual(self.state['seals'],220)
  self.assertEqual(self.state['equipment']['weapon'],'espada_juramento')
  with self.assertRaises(RuleError):self.act('vender',first['id'])
  self.assertEqual(self.state['seals'],220)
  self.act('vender',first['id'],confirmed=True)
  self.assertEqual(self.state['seals'],234);self.assertIn(second,self.state['inventory'])
  with self.assertRaises(RuleError):self.act('vender','espada_juramento',confirmed=True)
 def test_last_usable_weapon_cannot_be_sold(self):
  self.act('desequipar','weapon')
  with self.assertRaises(RuleError):self.act('vender','espada_juramento',confirmed=True)
  self.assertEqual(self.state['seals'],300)
  offer=next(a for a in self.engine.actions(self.character,self.world) if a['id']=='vender' and a['target']=='espada_juramento')
  self.assertTrue(offer['disabled']);self.assertIn('única arma',offer['reason'])
 def test_exceptional_repair_is_once_and_does_not_equip(self):
  item=self.state['inventory'][0];self.act('desequipar','weapon');item['condition']='damaged_event'
  with self.assertRaises(RuleError):self.act('equipar',item['id'])
  self.state['seals']=7
  with self.assertRaises(RuleError):self.act('reparar',item['id'])
  self.assertEqual(item['condition'],'damaged_event');self.assertEqual(self.state['seals'],7)
  self.state['seals']=8;self.act('reparar',item['id'])
  self.assertEqual(self.state['seals'],0);self.assertEqual(item['condition'],'intact')
  self.assertIsNone(self.state['equipment']['weapon'])
  with self.assertRaises(RuleError):self.act('reparar',item['id'])
 def test_remote_purchase_and_repair_unavailable(self):
  self.state['location']='valdren_plaza'
  with self.assertRaises(RuleError):self.act('comprar','varita_aprendiz')
  self.state['inventory'][0]['condition']='damaged_event'
  with self.assertRaises(RuleError):self.act('reparar','espada_juramento')

if __name__=='__main__':unittest.main()
