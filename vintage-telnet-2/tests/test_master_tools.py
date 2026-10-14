import json
import tempfile
import unittest
from pathlib import Path
from werkzeug.security import generate_password_hash
from server.app import create_app
from server import mechanics

class MasterToolsTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
  self.app=create_app({'TESTING':True,'DATA_DIR':self.tmp.name,'DM_PASSWORD_HASH':generate_password_hash('test-director'),'CLOCK':lambda:123456})
  self.dm=self.app.test_client();self.player=self.app.test_client();self.store=self.app.extensions['store'];self.seq=0
  self.post(self.player,'/api/account/register',{'username':'tester','password':'testpass123'})
  r=self.post(self.player,'/api/character/create',{'name':'Tester','species':'humano','class_id':'juramentado'});self.cid=r.json['character']['id']
  self.post(self.dm,'/api/master/login',{'password':'test-director'})
  self.post(self.dm,'/api/master/approve',{'character_id':self.cid})
 def post(self,c,path,data):
  with c.session_transaction() as s:token=s.get('csrf')
  if not token:c.get('/api/state')
  with c.session_transaction() as s:token=s['csrf']
  return c.post(path,json=data,headers={'X-CSRF-Token':token})
 def manage(self,operation,**kwargs):
  self.seq+=1;return self.post(self.dm,'/api/master/character/manage',dict(character_id=self.cid,operation=operation,confirmed=True,request_id=f'master-test-{self.seq}',**kwargs))
 def raw(self):
  with self.store.transaction() as db:return self.store.load(db.execute('SELECT * FROM characters WHERE id=?',(self.cid,)).fetchone())['state']
 def test_authorization_validation_and_read_has_no_side_effect(self):
  path=f'/api/master/character/{self.cid}';before=self.raw()
  self.assertEqual(self.player.get(path).status_code,403)
  detail=self.dm.get(path);self.assertEqual(detail.status_code,200);self.assertEqual(before,self.raw())
  self.assertNotIn('password',detail.get_data(as_text=True));self.assertTrue(detail.json['destinations'])
  base=dict(character_id=self.cid,operation='xp',confirmed=True,amount=12,request_id='security-test')
  endpoint='/api/master/character/manage'
  self.assertEqual(self.post(self.player,endpoint,base).status_code,403)
  self.assertEqual(self.dm.post(endpoint,json=base).status_code,403)
  for patch in ({'confirmed':False},{'amount':1.2},{'amount':True},{'amount':-1},{'operation':'stats'},{'request_id':'a'}):
   self.assertEqual(self.post(self.dm,endpoint,{**base,**patch}).status_code,400)
  self.assertEqual(before,self.raw())
 def test_xp_normal_progress_and_idempotency(self):
  with self.store.transaction() as db:
   char=self.store.load(db.execute('SELECT * FROM characters WHERE id=?',(self.cid,)).fetchone());char['state']['xp']=10;self.store.save(db,char)
  before=self.raw();amount=sum(mechanics.xp_next(n) for n in range(1,5))+17
  body=dict(character_id=self.cid,operation='xp',amount=amount,confirmed=True,request_id='earned-xp-gift')
  r=self.post(self.dm,'/api/master/character/manage',body);self.assertEqual(r.status_code,200);s=self.raw()
  self.assertEqual((s['level'],s['xp'],s['pa'],s['pp']),(5,27,8,1))
  self.assertEqual(self.post(self.dm,'/api/master/character/manage',body).json['replayed'],True);self.assertEqual(s,self.raw())
  self.assertEqual(self.post(self.dm,'/api/master/character/manage',{**body,'amount':1}).status_code,409)
  for key in ('known','quests','attributes','inventory','seals'):self.assertEqual(before[key],s[key])
 def test_gifts_correction_preserves_original_items_and_unique_weapons(self):
  original=self.raw();item='provision_basica';old=sum(i['quantity'] for i in original['inventory'] if i['id']==item)
  gift=self.manage('item',target=item,amount=3);self.assertEqual(gift.status_code,200)
  grant=gift.json['grants'][0];self.assertEqual(grant['remaining'],3)
  self.assertEqual(self.manage('remove_item',target=grant['id'],amount=4).status_code,409)
  self.assertEqual(self.manage('remove_item',target=grant['id'],amount=3).status_code,200)
  self.assertEqual(sum(i['quantity'] for i in self.raw()['inventory'] if i['id']==item),old)
  weapons=self.manage('item',target='espada_juramento',amount=2);self.assertEqual(weapons.status_code,200)
  new=[i for i in weapons.json['inventory'] if i.get('catalog_id')=='espada_juramento'];self.assertEqual(len({i['id'] for i in new}),len(new))
  self.assertEqual(self.manage('item',target='caja_cunas',amount=1).status_code,400)
 def test_consumed_gift_does_not_authorize_removing_earned_replacement(self):
  gift=self.manage('item',target='provision_basica',amount=3);grant=gift.json['grants'][0]
  with self.store.transaction() as db:
   char=self.store.load(db.execute('SELECT * FROM characters WHERE id=?',(self.cid,)).fetchone())
   char['state']['inventory']=[i for i in char['state']['inventory'] if not (i.get('catalog_id')=='provision_basica' and ':dm:' in i['id'])]
   from server.engine import Engine
   from server.content import Content
   e=Engine(Content(self.app.config['CONTENT_DIR']),lambda:123456)
   for _ in range(3):e.add_item(char['state'],'provision_basica')
   self.store.save(db,char)
  before=self.raw();self.assertEqual(self.manage('remove_item',target=grant['id'],amount=1).status_code,409);self.assertEqual(before,self.raw())
 def test_distinct_gift_stacks_and_authored_material_consumption(self):
  first=self.manage('item',target='fibra_espinajo',amount=3).json['grants'][0]
  second=self.manage('item',target='fibra_espinajo',amount=2).json['grants'][0]
  self.assertEqual(self.manage('remove_item',target=first['id'],amount=3).status_code,200)
  self.assertEqual(self.manage('remove_item',target=second['id'],amount=2).status_code,200)
  last=self.manage('item',target='fibra_espinajo',amount=2).json['grants'][0]
  with self.store.transaction() as db:
   char=self.store.load(db.execute('SELECT * FROM characters WHERE id=?',(self.cid,)).fetchone())
   from server.engine import Engine
   from server.content import Content
   e=Engine(Content(self.app.config['CONTENT_DIR']),lambda:123456);world=self.store.world(db)
   self.assertTrue(e.allowed({'requires_items':{'fibra_espinajo':2}},char['state'],world))
   e.effects(char['state'],world,{'consume_items':{'fibra_espinajo':1}});self.store.save(db,char)
  self.assertEqual(self.manage('remove_item',target=last['id'],amount=1).status_code,200)
  self.assertEqual(self.manage('remove_item',target=last['id'],amount=1).status_code,409)
 def test_correction_of_equipped_armor_clears_damage_reduction(self):
  gift=self.manage('item',target='fibra_espinajo',amount=1).json['grants'][0]
  with self.store.transaction() as db:
   char=self.store.load(db.execute('SELECT * FROM characters WHERE id=?',(self.cid,)).fetchone())
   item=next(i for i in char['state']['inventory'] if ':dm:' in i['id']);item.update(kind='armor',armor_reduction=.2)
   char['state']['equipment']['armor']=item['id'];char['state']['armor_reduction']=.2;self.store.save(db,char)
  self.assertEqual(self.manage('remove_item',target=gift['id'],amount=1).status_code,200)
  self.assertIsNone(self.raw()['equipment']['armor']);self.assertEqual(self.raw()['armor_reduction'],0)
 def test_heal_travel_seals_portrait_preserve_world_encounters(self):
  with self.store.transaction() as db:
   char=self.store.load(db.execute('SELECT * FROM characters WHERE id=?',(self.cid,)).fetchone());char['state'].update(hp=1,fatigue=80,wound='grave');self.store.save(db,char)
   world=self.store.world(db);world['encounters']={'shared-test':{'hp':5}};self.store.save_world(db,world)
  before=self.raw();r=self.manage('heal');self.assertEqual(r.status_code,200);s=self.raw();self.assertEqual((s['hp'],s['fatigue'],s['wound']),(mechanics.hp_max(s),0,None))
  r=self.manage('travel',target='valdren_plaza');self.assertEqual(r.status_code,200);self.assertEqual(self.raw()['routes'],before['routes'])
  self.assertEqual(self.manage('travel',target='fake').status_code,400)
  self.assertEqual(self.manage('seals',amount=50).status_code,200);self.assertEqual(self.raw()['seals'],before['seals']+50)
  self.assertEqual(self.manage('portrait',target='/etc/passwd').status_code,400)
  options=r.json['portraits']
  if options:self.assertEqual(self.manage('portrait',target=options[0]['id']).status_code,200)
  with self.store.transaction() as db:self.assertEqual(self.store.world(db)['encounters'],{'shared-test':{'hp':5}})
  for key in ('quests','bestiary','attributes','inventory'):self.assertEqual(before[key],self.raw()[key])
