"""Portrait assets and the first-conversation resident registry."""
import json
from pathlib import Path
import unittest

import test_real_content as fixtures


class ResidentTests(unittest.TestCase):
 setUp=fixtures.RealContentTests.setUp
 post=fixtures.RealContentTests.post
 create=fixtures.RealContentTests.create
 action=fixtures.RealContentTests.action
 walk=fixtures.RealContentTests.walk

 def test_every_authored_resident_has_full_size_portrait_and_thumbnail(self):
  residents=[npc for npc in self.content.npcs.values() if npc.get('portrait')]
  self.assertEqual(len(self.content.npcs),45)
  self.assertEqual(len(residents),45)
  for npc in residents:
   with self.subTest(npc=npc['id']):
    portrait=self.root/npc['portrait'].lstrip('/')
    thumbnail=portrait.with_name(portrait.stem+'-thumb.webp')
    self.assertTrue(portrait.is_file(),portrait)
    self.assertTrue(thumbnail.is_file(),thumbnail)

 def test_first_conversation_persists_resident_with_art_without_catalog_pollution(self):
  self.create();self.walk('valdren_fragua')
  first=self.action('hablar','edran_daro',topic='pueblo')
  self.assertTrue(any('Habitantes' in event['text'] for event in first['narrative']))
  dialogue=next(event for event in first['narrative'] if event['kind']=='npc')
  self.assertEqual(dialogue['portrait'],'/client/art/residents/edran_daro-anime-v1.webp')
  self.assertEqual(dialogue['thumbnail'],'/client/art/residents/edran_daro-anime-v1-thumb.webp')
  snapshot=self.client.get('/api/state').json
  resident=next(person for person in snapshot['residents'] if person['id']=='edran_daro')
  self.assertEqual(resident['name'],'Daro')
  self.assertEqual(resident['region'],'Llanos de Edran')
  self.assertTrue(resident['role']);self.assertTrue(resident['description'])
  self.assertNotIn('edran_daro',{entry['id'] for entry in snapshot['bestiary']})
  self.assertNotIn('edran_daro',{entry['id'] for entry in snapshot['rivals']})

  character_id=snapshot['character']['id'];store=self.app.extensions['store']
  with store.transaction() as db:
   row=db.execute('SELECT state FROM characters WHERE id=?',(character_id,)).fetchone()
  self.assertIn('edran_daro',json.loads(row['state'])['known_residents'])
  second=self.action('hablar','edran_daro',topic='trabajo')
  self.assertFalse(any('Habitantes' in event['text'] for event in second['narrative'] if event['kind']=='discovery'))
  self.assertEqual(sum(person['id']=='edran_daro' for person in self.client.get('/api/state').json['residents']),1)


if __name__=='__main__':unittest.main()
