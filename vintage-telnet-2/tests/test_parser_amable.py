"""Friendly commands retain room and species guards."""
import random
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
  for text in ('mira','mirar','MÍRA','l','L'):
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
 def test_examine_spaces_and_underscores_equivalence(self):
  self.place('khariel_centro','felaryn')
  intent1=self.command('examinar apoyo alto')
  self.assertEqual(intent1['id'],'examinar')
  self.assertEqual(intent1['target'],'apoyo_alto')
  intent2=self.command('examinar apoyo_alto')
  self.assertEqual(intent2['id'],'examinar')
  self.assertEqual(intent2['target'],'apoyo_alto')
  labels=[a['label'] for a in self.e.actions(self.c,self.w) if not a.get('disabled')]
  self.assertIn('Examinar apoyo alto',labels)
  self.assertNotIn('Examinar apoyo_alto',labels)
  self.place('narevia_centro','marevyn')
  intent3=self.command('examinar boya tallada')
  self.assertEqual(intent3['id'],'examinar')
  self.assertEqual(intent3['target'],'boya_tallada')
  intent4=self.command('examinar boya_tallada')
  self.assertEqual(intent4['id'],'examinar')
  self.assertEqual(intent4['target'],'boya_tallada')
  self.content.rooms['lethra_orilla_silente']['examine']['apoyo_alto']='Un saliente de piedra.'
  self.place('lethra_orilla_silente','felaryn')
  with self.assertRaises(RuleError) as caught:self.command('accion inexistente')
  error=str(caught.exception)
  self.assertIn('Examinar apoyo alto',error)
  self.assertNotIn('_',error)
 def test_inventory_abbreviations(self):
  for text in ('i','inv','inventario','I','INV','el inventario'):
   self.assertEqual(self.e.parse_intent(self.c,self.w,{'text':text})['id'],'inventario')
 def test_examine_abbreviations_and_articles(self):
  self.place('khariel_centro','felaryn')
  for text in ('x apoyo alto','x el apoyo alto','X APOYO ALTO','examinar el apoyo alto','examinar un apoyo alto','x un apoyo alto'):
   intent=self.command(text)
   self.assertEqual(intent['id'],'examinar')
   self.assertEqual(intent['target'],'apoyo_alto')
 def test_movement_cardinals_vertical_and_articles(self):
  room=self.content.rooms['lethra_orilla_silente']
  room['exits']['arriba']='lethra_banco_barro'
  room['exits']['abajo']='lethra_raices_observacion'
  for text,target in [('norte','norte'),('n','norte'),
                      ('ir al norte','norte'),('al norte','norte'),
                      ('oeste','oeste'),('o','oeste'),
                      ('arriba','arriba'),('ar','arriba'),('ir arriba','arriba'),
                      ('abajo','abajo'),('ab','abajo'),('ir al abajo','abajo')]:
   intent=self.e.parse_intent(self.c,self.w,{'text':text})
   self.assertEqual(intent['id'],'mover')
   self.assertEqual(intent['target'],target)
 def test_choose_by_number(self):
  choices=self.e.actions(self.c,self.w)
  self.assertGreater(len(choices),1)
  intent1=self.e.parse_intent(self.c,self.w,{'text':'1'})
  self.assertEqual(intent1['id'],choices[0]['id'])
  intent2=self.e.parse_intent(self.c,self.w,{'text':'2'})
  self.assertEqual(intent2['id'],choices[1]['id'])
 def test_close_match_suggestion_without_execution(self):
  self.place('khariel_centro','felaryn')
  examined_before=dict(self.c['state'].get('examined',{}))
  with self.assertRaises(RuleError) as caught:
   self.command('exminar compueta')
  msg=str(caught.exception)
  self.assertIn('¿Quisiste decir',msg)
  self.assertEqual(self.c['state'].get('examined',{}),examined_before)
  with self.assertRaises(RuleError) as caught2:
   self.command('abrir puerta magica inexistente')
  msg2=str(caught2.exception)
  self.assertNotIn('¿Quisiste decir',msg2)
  self.assertIn('No entiendo esas palabras.',msg2)
