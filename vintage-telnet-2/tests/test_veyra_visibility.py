"""Local visibility follows authoritative time/weather without moving the real player."""
import unittest
from pathlib import Path
from server.content import Content
from server.engine import Engine
from server import mechanics as m

class VeyraVisibilityTests(unittest.TestCase):
 def test_hill_orientation_respects_day_weather_and_night(self):
  content=Content(Path(__file__).resolve().parents[1]/'content')
  state=m.new_state('marevyn','juramentado','home:test',43200)
  state['location']='veyra_colina_vista'
  char={'id':999,'species':'marevyn','class_id':'juramentado','state':state}
  world={'flags':[],'deaths':{}}
  checked=set()
  for hour in range(24):
   engine=Engine(content,lambda hour=hour:hour*3600)
   room=engine.room(char,world);ambient=engine.ambient(room,world)
   phase,weather=ambient['time_of_day'],ambient['weather']
   if phase=='Noche':
    self.assertIn('oscuridad',room['description']);self.assertIn('oscuridad',room['examine']['hitos']);self.assertNotIn('convergen',room['return'])
    self.assertNotIn('Desde la colina ves caminos',room['description'])
    checked.add(('night',weather))
   elif phase=='Día':
    if weather=='Niebla':
     self.assertIn('niebla tapa',room['description']);self.assertIn('No se puede seguir ninguna ruta',room['description']);self.assertIn('poste más cercano',room['day']);self.assertIn('impide comprobar',room['examine']['hitos']);self.assertNotIn('convergen',room['return'])
    elif weather=='Lluvia':
     self.assertIn('lluvia esconde',room['description']);self.assertIn('No distingues',room['examine']['hitos']);self.assertNotIn('convergen',room['return'])
    else:self.assertEqual(room['description'],content.rooms['veyra_colina_vista']['description'])
    checked.add(('day',weather))
   self.assertIn('huerta',room['description'])
   self.assertEqual(room['exits'],content.rooms['veyra_colina_vista']['exits'])
  self.assertEqual(checked,{(phase,weather) for phase in ('day','night') for weather in ('Niebla','Lluvia','Viento')})

 def test_irrigation_changes_shared_place_without_payout_or_repeating(self):
  content=Content(Path(__file__).resolve().parents[1]/'content')
  state=m.new_state('marevyn','juramentado','home:test',43200);state['location']='veyra_huerta_baja'
  char={'id':999,'species':'marevyn','class_id':'juramentado','state':state};world={'flags':[],'deaths':{}}
  dry=next(hour for hour in range(8,18) if Engine(content,lambda hour=hour:hour*3600).ambient(content.rooms[state['location']],world)['weather']!='Lluvia')
  engine=Engine(content,lambda:dry*3600)
  before=(state['seals'],state['xp'],len(state['inventory']))
  engine.apply(char,world,{'id':'veyra_colocar_tabla_riego'})
  self.assertEqual(before,(state['seals'],state['xp'],len(state['inventory'])))
  self.assertIn('veyra_tabla_riego_colocada',world['flags'])
  self.assertNotIn('veyra_colocar_tabla_riego',[a['id'] for a in engine.actions(char,world)])
  other=m.new_state('humano','juramentado','home:other',43200);other['location']='veyra_huerta_baja'
  otherchar={'id':1000,'species':'humano','class_id':'juramentado','state':other}
  room=engine.room(otherchar,world)
  self.assertIn('sigue encajada',room['return']);self.assertNotIn('encajaste',room['return'])
  self.assertIn('queda sujeta',room['examine']['tabla'])
  self.assertNotIn('veyra_colocar_tabla_riego',[a['id'] for a in engine.actions(otherchar,world)])
  rain=next(hour for hour in range(8,18) if Engine(content,lambda hour=hour:hour*3600).ambient(content.rooms[state['location']],{})['weather']=='Lluvia')
  rainy=Engine(content,lambda:rain*3600);freshworld={'flags':[],'deaths':{}}
  self.assertIn('puede esperar',rainy.room(otherchar,freshworld)['examine']['tabla'])
  self.assertNotIn('veyra_colocar_tabla_riego',[a['id'] for a in rainy.actions(otherchar,freshworld)])
