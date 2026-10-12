"""Room art follows authored personal/shared flags without changing game state."""
import copy
import hashlib
import json
from pathlib import Path
import unittest
from server.content import Content
from server.engine import Engine
from server import mechanics as m

ROOT=Path(__file__).resolve().parents[1]

class PlaceArtTests(unittest.TestCase):
 def setUp(self):
  self.content=Content(ROOT/'content');self.engine=Engine(self.content,lambda:43200)
  self.manifest=json.loads((ROOT/'client/art/place-variants.json').read_text())
 def test_variant_uses_the_same_effective_flags_as_room_text_and_is_read_only(self):
  for entry in self.manifest:
   for shared in (False,True):
    with self.subTest(room=entry['room'],shared=shared):
     state=m.new_state('humano','juramentado','home:art',43200);state['location']=entry['room']
     player={'id':1,'name':'Lector','species':'humano','class_id':'juramentado','status':'approved','state':state}
     world={'flags':[],'deaths':{},'version':0}
     self.assertNotIn('art_variant',self.engine.snapshot(player,world)['room'])
     (world if shared else state)['flags'].append(entry['flag'])
     before=copy.deepcopy((player,world,self.content.rooms[entry['room']]))
     snapshot=self.engine.snapshot(player,world)
     self.assertEqual(snapshot['room']['art_variant'],entry['variant'])
     self.assertEqual(snapshot['room']['description'],self.engine.room(player,world)['description'])
     self.assertNotIn('art_variant',self.content.rooms[entry['room']])
     self.assertEqual(before,(player,world,self.content.rooms[entry['room']]))
     (world if shared else state)['flags'].remove(entry['flag'])
     self.assertNotIn('art_variant',self.engine.snapshot(player,world)['room'])
 def test_final_assets_match_delivery_hashes_and_are_small_valid_webp(self):
  for entry in self.manifest:
   for asset in entry['files']:
    with self.subTest(path=asset['path']):
     payload=(ROOT/asset['path']).read_bytes()
     self.assertEqual(hashlib.sha256(payload).hexdigest(),asset['sha256'])
     self.assertEqual(len(payload),asset['bytes']);self.assertLess(len(payload),1024*1024)
     self.assertEqual(payload[:4],b'RIFF');self.assertEqual(payload[8:12],b'WEBP')
