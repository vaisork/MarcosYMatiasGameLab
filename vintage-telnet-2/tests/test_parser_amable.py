"""Friendly commands retain room and species guards."""
import unittest
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine, RuleError

class FriendlyParserTests(unittest.TestCase):
 def setUp(self):
  self.content=Content(Path(__file__).resolve().parents[1]/'content');self.e=Engine(self.content,lambda:43200)
  self.w={'flags':[],'weather':{},'deaths':{}};self.place('lethra_orilla_silente','marevyn')
 def place(self,room,species):
  s=m.new_state(species,'juramentado','home:test',43200);s['location']=room
  self.c={'id':999,'name':'Prueba','species':species,'class_id':'juramentado','state':s}
 def command(self,text):
  intent=self.e.parse_intent(self.c,self.w,{'text':text});self.e.apply(self.c,self.w,intent);return intent
 def test_look_aliases(self):
  for text in ('mira','mirar','MÍRA'):
   self.assertEqual(self.command(text)['id'],'mirar')
   self.assertIn(self.content.rooms[self.c['state']['location']]['description'],' '.join(e['text'] for e in self.c['state']['events']))
 def test_greeting_and_existing_conversation(self):
  npc=next(n for n in self.content.npcs.values() if n['name']=='Daro');self.place(npc['home_room'],'humano')
  topics=[a['topic'] for a in self.e.actions(self.c,self.w) if a['id']=='hablar' and a['target']==npc['id']]
  before=list(self.c['state']['flags']);self.command('hablar con Daro');text=self.c['state']['events'][0]['text']
  self.assertIn('Hola',text)
  for topic in topics:self.assertIn(topic,text)
  self.assertEqual(before,self.c['state']['flags'])
  self.assertEqual(self.command('hablar con Daro '+topics[0])['id'],'hablar')
  with self.assertRaises(RuleError):self.command('hablar con Seran')
 def test_local_suggestions(self):
  with self.assertRaises(RuleError) as caught:self.command('abrir puerta inexistente')
  suggestions=str(caught.exception).split('Puedes probar: ')[1].rstrip('.').split('; ')
  self.assertEqual(len(suggestions),3)
  labels=[a['label'] for a in self.e.actions(self.c,self.w) if not a.get('disabled')]
  for suggestion in suggestions:self.assertIn(suggestion,labels)
  self.assertNotIn('barquita',str(caught.exception))
 def test_help_inventory(self):
  self.command('ayuda');self.assertIn('examinar',self.c['state']['events'][0]['text'])
  self.command('inventario')
  for item in self.c['state']['inventory']:self.assertIn(item['name'],self.c['state']['events'][0]['text'])
 def test_jump_species_guard(self):
  room=next(r['id'] for r in self.content.rooms.values() if any(a['id']=='hoshai_secreto_repisa' for a in r.get('actions',[])))
  self.place(room,'felaryn');self.assertEqual(self.command('saltar a la repisa')['id'],'hoshai_secreto_repisa')
  self.place(room,'marevyn')
  with self.assertRaisesRegex(RuleError,'Tu especie'):self.command('saltar a la repisa')
  self.assertNotIn('hoshai_marca_repisa',self.c['state']['flags'])
 def test_water_alias_and_flags(self):
  action={'id':'test_agua','label':'Entrar en el agua','requires_species':['marevyn'],'set_flags':['test_nado'],'text':'Prueba.'}
  self.content.rooms['lethra_orilla_silente']['actions'].append(action)
  self.assertEqual(self.command('nadar')['id'],'test_agua');self.assertIn('test_nado',self.c['state']['flags'])
  self.place('lethra_orilla_silente','felaryn')
  with self.assertRaisesRegex(RuleError,'Tu especie'):self.command('nadar')
  self.place('lethra_orilla_silente','marevyn')
  action['requires_flags']=['test_permiso']
  with self.assertRaises(RuleError):self.command('nadar')
 def test_boat_examination_gate(self):
  def visible():return any(a['id']=='lethra_secreto_barquita' for a in self.e.actions(self.c,self.w))
  self.assertFalse(visible())
  with self.assertRaises(RuleError):self.e.apply(self.c,self.w,{'id':'lethra_secreto_barquita'})
  self.command('observar');self.assertFalse(visible())
  self.command('examinar raíces');self.assertFalse(visible())
  self.command('examinar fondo');self.assertTrue(visible())
  self.command('Sacar la barquita y dejarla en la raíz');self.assertFalse(visible())
  self.assertIn('lethra_barquita_rescatada',self.w['flags'])
 def test_forbidden_examination(self):
  self.place('lethra_orilla_silente','felaryn')
  with self.assertRaises(RuleError):self.command('examinar fondo')
  self.assertNotIn('examined',self.c['state'])
