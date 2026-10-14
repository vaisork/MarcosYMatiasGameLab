"""Frozen physical geography and discovery privacy; no production state fixtures."""
import json,tempfile,unittest
from pathlib import Path
from collections import deque
from server.content import Content
from server.engine import Engine
from server import mechanics

ROOT=Path(__file__).resolve().parents[1]
class SpatialWorldTests(unittest.TestCase):
 def setUp(self):
  self.content=Content(ROOT/'content');self.engine=Engine(self.content,lambda:43200)
  self.world={'version':0,'flags':[],'deaths':{},'encounters':{}}
 def character(self,species='humano'):
  return {'id':1,'name':'Cartógrafa','species':species,'class_id':'juramentado','status':'approved','state':mechanics.new_state(species,'juramentado','test-home',43200)}
 def test_every_room_and_regional_home_has_a_unique_frozen_position(self):
  s=self.content.spatial;self.assertEqual(set(s['positions']),set(self.content.rooms));self.assertEqual(set(s['homes']),set(self.content.regions))
  positions=list(s['positions'].values())+list(s['homes'].values());self.assertEqual(len({tuple(p) for p in positions}),len(positions))
 def test_straight_streets_align_and_bent_corridors_preserve_their_ports(self):
  opposite={'norte':'sur','sur':'norte','este':'oeste','oeste':'este'};positions=self.content.spatial['positions'];bends={frozenset([b['from'],b['to']]) for b in self.content.spatial['bends']}
  for rid,room in self.content.rooms.items():
   x,y=positions[rid]
   for d,to in room['exits'].items():
    tx,ty=positions[to];self.assertTrue({'norte':ty<y,'sur':ty>y,'este':tx>x,'oeste':tx<x}[d],(rid,d,to))
    if self.content.rooms[to]['exits'].get(opposite[d])==rid:
     self.assertEqual(x,tx) if d in ('norte','sur') else self.assertEqual(y,ty)
    else:self.assertIn(frozenset([rid,to]),bends)
 def test_all_existing_places_and_six_towns_remain_connected(self):
  queue=deque(['valdren_plaza']);seen=set(queue)
  while queue:
   for to in self.content.rooms[queue.popleft()]['exits'].values():
    if to not in seen:seen.add(to);queue.append(to)
  self.assertEqual(seen,set(self.content.rooms));self.assertEqual(len(seen),191)
 def test_snapshot_never_exports_hidden_places_or_global_spatial_table(self):
  char=self.character();home=self.engine.snapshot(char,self.world)['map']
  self.assertEqual(len(home['nodes']),1);self.assertIn('position',home['nodes'][0]);self.assertNotIn('valdren_plaza',json.dumps(home))
  self.engine.apply(char,self.world,{'id':'mover','target':'salir'});s=self.engine.snapshot(char,self.world)['map'];self.assertEqual({n['id'] for n in s['nodes']},{'test-home','valdren_plaza'})
  self.assertNotIn('valdren_fragua',json.dumps(s));self.assertNotIn('positions',s)
  self.assertEqual(next(n for n in s['nodes'] if n['id']=='valdren_plaza')['position'],self.content.spatial['positions']['valdren_plaza'])
 def test_coordinate_identity_survives_reordering_and_more_discovery(self):
  char=self.character();state=char['state'];state['known']+=['valdren_plaza','valdren_huertos'];state['visited']+=['valdren_plaza','valdren_huertos'];state['routes']=[['test-home','valdren_plaza'],['valdren_plaza','valdren_huertos']]
  before={n['id']:n['position'] for n in self.engine.snapshot(char,self.world)['map']['nodes']}
  state['known']=list(reversed(state['known']))+['valdren_pozo'];state['visited']+=['valdren_pozo']
  after={n['id']:n['position'] for n in self.engine.snapshot(char,self.world)['map']['nodes']}
  self.assertTrue(all(after[k]==v for k,v in before.items()))

 def test_learned_road_geometry_is_frozen_and_only_learned_roads_are_exported(self):
  char=self.character();self.engine.apply(char,self.world,{'id':'mover','target':'salir'})
  before=self.engine.snapshot(char,self.world)['map']['routes']
  self.assertEqual(len(before),2);self.assertTrue(all('points' in route for route in before))
  self.assertEqual(before[0]['points'],list(reversed(before[1]['points'])))
  char['state']['known'].append('valdren_pozo')
  self.assertEqual(self.engine.snapshot(char,self.world)['map']['routes'],before)
  self.assertEqual(len(self.content.spatial_roads),424)
 def test_authored_positions_cannot_silently_fall_back_to_unfrozen_roads(self):
  with tempfile.TemporaryDirectory() as root:
   Path(root,'world.json').write_text(json.dumps(self.content.data))
   Path(root,'spatial.json').write_text(json.dumps({**self.content.spatial,'roads':[]}))
   with self.assertRaisesRegex(ValueError,'every existing connection'):Content(root)
 def test_old_content_without_spatial_data_still_loads(self):
  with tempfile.TemporaryDirectory() as root:
   Path(root,'world.json').write_text(json.dumps(self.content.data))
   content=Content(root);self.assertEqual(content.spatial,{});self.assertEqual(content.spatial_roads,{})

class SpatialJourneyTests(unittest.TestCase):
 """Real HTTP handlers and SQLite, with a fresh temporary account."""
 from test_real_content import RealContentTests as _Fixture
 setUp=_Fixture.setUp
 post=_Fixture.post
 create=_Fixture.create
 action=_Fixture.action
 def test_six_towns_and_return_keep_learned_geometry(self):
  self.create();self.action('mover','salir');saved={};moves=0
  for destination in ['khariel_centro','brumak_centro','narevia_centro','velmora_centro','vaisgard_mercado','valdren_plaza']:
   current=self.client.get('/api/state').json['room']['id'];queue=deque([(current,[])]);seen={current}
   while queue:
    room,path=queue.popleft()
    if room==destination:break
    for direction,target in self.content.rooms[room]['exits'].items():
     if target not in seen:seen.add(target);queue.append((target,path+[direction]))
   else:self.fail('Unreachable town')
   for direction in path:
    snapshot=self.client.get('/api/state').json
    movement=next(a for a in snapshot['actions'] if a['id']=='mover' and a['target']==direction)
    if movement.get('disabled'):
     permission=next(a for a in snapshot['actions'] if a['id'].startswith('pedir_permiso') and not a.get('disabled'))
     self.action(permission['id'])
    self.action('mover',direction);moves+=1
    snapshot=self.client.get('/api/state').json
    for route in snapshot['map']['routes']:
     key=(route['from'],route['to']);self.assertIn('points',route)
     if key in saved:self.assertEqual(saved[key],route['points'])
     saved[key]=route['points']
   self.assertEqual(snapshot['room']['id'],destination)
  self.assertGreater(moves,60)
  self.action('mover','hogar');self.assertTrue(self.client.get('/api/state').json['room']['id'].startswith('home:'))
