import unittest
from server import mechanics as m
class RNG:
 def random(self):return 0
class CreatureDepthTests(unittest.TestCase):
 def round(self,prepared):
  state=m.new_state('humano','arcano','home',0);state['_class']='arcano';profile=dict(m.PROFILES['espinajo_rastrojo' if prepared else 'cascapedernal']);state['combat']={'profile':profile,'hp':profile['hp'],'prepared':prepared,'round':0,'cooldown':0,'intervention':{'id':'capacidad'}}
  events,_=m.resolve_round(state,{'name':'Prueba'},RNG());return state,events
 def test_arcane_reports_actual_preparation_result(self):
  state,events=self.round(True);self.assertFalse(state['combat']['prepared']);self.assertEqual(state['combat']['_response']['accuracy'],40);self.assertIn('Rompes su preparación',events[0]['text'])
  state,events=self.round(False);self.assertEqual(state['combat']['_response']['accuracy'],25);self.assertNotIn('preparación',events[0]['text']);self.assertIn('esta ronda',events[0]['text'])
 def test_observations_and_withdrawals_preserve_regional_identity(self):
  self.assertIn('frontal',m.threat_observation('espinajo_rastrojo'));self.assertIn('salida',m.threat_observation('mordelinde'))
  texts=[m.peaceful_withdrawal(c) for c in ('cornalomo','dorsalodo','rasgacorteza')];self.assertEqual(len(set(texts)),3);self.assertIn('agua',texts[1]);self.assertIn('tronco',texts[2])

class RegionalIntentionTests(unittest.TestCase):
 def test_four_intentions_change_available_class_responses_without_numeric_inflation(self):
  pairs=set()
  for cid in m.REGIONAL_INTENTIONS:
   profile=m.PROFILES[cid];prepared=profile['prepared_action'];pairs.add((prepared['frontal'],prepared['interruptible']))
   for key in ('hp','accuracy','damage','reduction','level','category'):self.assertEqual(profile[key],m.PROFILES['cornalomo'][key])
   self.assertEqual(prepared['accuracy'],profile['accuracy']);self.assertTrue(prepared['tell']);self.assertIn(prepared['tell'],m.threat_observation(cid))
  self.assertEqual(len(pairs),4);self.assertNotIn('prepared',m.PROFILES['cornalomo'])
 def test_guard_and_arcane_follow_angle_and_interruptibility(self):
  from server.engine import Engine
  from server.content import Content
  from pathlib import Path
  e=Engine(Content(Path(__file__).resolve().parents[1]/'content'),lambda:43200,RNG())
  for cid in m.REGIONAL_INTENTIONS:
   for cls in ('juramentado','arcano'):
    state=m.new_state('humano',cls,'valdren_plaza',0);state['_class']=cls;state['combat']={'creature':cid,'profile':dict(m.PROFILES[cid]),'hp':120,'prepared':True,'round':0,'cooldown':0};char={'id':999,'name':'Prueba regional','species':'humano','class_id':cls,'state':state};sig_id=m.CLASSES[cls]['signature_id'];cap=next(a for a in e.actions(char,{'flags':[],'deaths':{}}) if a['id'] in ('capacidad',sig_id));p=state['combat']['profile']['prepared_action'];self.assertEqual(cap['disabled'],not p['frontal'] if cls=='juramentado' else not p['interruptible'])
 def test_uninterruptible_artifice_reports_damage_without_promising_interruption(self):
  state=m.new_state('humano','artifice','home',0);state['_class']='artifice';state['combat']={'profile':dict(m.PROFILES['quebrarrocas']),'hp':120,'prepared':True,'round':0,'cooldown':0,'intervention':{'id':'capacidad'}}
  events,_=m.resolve_round(state,{'name':'Quebrarrocas'},RNG());text=' '.join(e['text'] for e in events);self.assertIn('Empuje anclado',text);self.assertIn('No puedes interrumpirlo',text);self.assertNotIn('carga',text)
 def test_guard_forced_against_lateral_attack_does_not_claim_damage_reduction(self):
  state=m.new_state('humano','juramentado','home',0);state['_class']='juramentado';state['combat']={'profile':dict(m.PROFILES['dorsalodo']),'hp':120,'prepared':True,'round':0,'cooldown':0,'intervention':{'id':'capacidad'}}
  events,_=m.resolve_round(state,{'name':'Dorsalodo'},RNG());self.assertEqual(state['combat']['_response']['guard'],0);self.assertIn('no reduce',events[0]['text'])
 def test_artifice_hint_states_ordinary_reply_and_noninterruptible_choice(self):
  self.assertIn('precisión ordinaria',m.capability_hint('artifice',m.PROFILES['rasgacumbres']['prepared_action']))
  self.assertIn('sólo hará daño',m.capability_hint('artifice',m.PROFILES['dorsalodo']['prepared_action']))
  self.assertNotIn('preparación',m.capability_hint('arcano'))
