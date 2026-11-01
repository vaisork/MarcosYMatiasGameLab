import copy
from datetime import datetime, timezone
from pathlib import Path
import unittest

from server import daily_errands, mechanics
from server.content import Content
from server.engine import Engine


class DailyErrandsTests(unittest.TestCase):
    def setUp(self):
        self.content = Content(Path(__file__).resolve().parents[1] / 'content')
        self.now = datetime(2026, 10, 31, 12, tzinfo=timezone.utc).timestamp()
        self.engine = Engine(self.content, lambda: self.now, timezone='UTC')
        self.region = 'edran'
        self.character = {
            'id': 1, 'name': 'Marcos', 'species': 'humano',
            'state': mechanics.new_state('humano', 'juramentado', 'home:test', self.now),
        }
        self.world = {'flags': [], 'deaths': {}, 'version': 1}

    def test_generation_is_deterministic_three_and_region_bound(self):
        date = daily_errands.current_date(self.engine)
        first = daily_errands.generate(self.engine, date, self.region)
        self.assertEqual(first, daily_errands.generate(self.engine, date, self.region))
        self.assertEqual(len(first), 3)
        self.assertEqual(len({item['id'] for item in first}), 3)
        self.assertNotEqual(first, daily_errands.generate(self.engine, date, 'hoshai'))
        self.assertTrue(all(len(daily_errands.generate(self.engine, date, region)) == 3 for region in self.content.regions))

    def test_recados_reward_once_and_finish_streak(self):
        date = daily_errands.current_date(self.engine)
        errands = daily_errands.generate(self.engine, date, self.region)
        state = self.character['state']
        state['events'] = []
        total_reward = 0
        for errand in errands:
            creature = None
            if errand['kind'] == 'visit':
                state['location'] = errand['target']
                intent = {'id': 'mover'}
            elif errand['kind'] == 'examine':
                intent = {'id': 'examinar', 'target': 'cualquier detalle'}
            elif errand['kind'] == 'talk':
                intent = {'id': 'hablar', 'target': errand['target']}
            elif errand['kind'] == 'defeat':
                creature = errand['target']
                state['location'] = next(room['id'] for room in self.content.rooms.values() if room['region'] == self.region)
                state.setdefault('events', []).append({'kind': 'reward', 'text': 'Vences a una criatura.'})
                intent = {'id': 'atacar'}
            elif errand['kind'] == 'deliver':
                template=self.content.quest_templates[errand['template_id']];state['location']=template['destination_room'];intent={'id':'hablar','target':template['target_npc']}
            elif errand['kind'] == 'observe_creature':
                template=self.content.quest_templates[errand['template_id']];state['location']=template['destination_room'];intent={'id':'examinar_criatura','target':template['creature']}
            elif errand['kind'] == 'escort_numen':
                template=self.content.quest_templates[errand['template_id']];state['location']=template['destination_room'];state['numenes']={'active':'test','bonded':[{'id':'test'}]};intent={'id':'mover'}
            elif errand['kind'] == 'bring_material':
                template=self.content.quest_templates[errand['template_id']];state['location']=template['destination_room'];state['inventory'].append({'id':template['item'],'quantity':1});intent={'id':'hablar','target':template['target_npc']}
            daily_errands.record_action(self.engine, self.character, intent, self.region)
            if creature:
                daily_errands.record_victory(self.engine, self.character, creature, state['location'])
            total_reward += next(entry['reward'] for entry in daily_errands.snapshot(self.engine,self.character)['errands'] if entry['id']==errand['id'])
        self.assertEqual(state['xp'], total_reward)
        self.assertEqual(len(state['daily_errands']['completed']), 3)
        self.assertEqual(state['daily_errand_streak'], 1)
        daily_errands.record_action(self.engine, self.character, intent, self.region)
        self.assertEqual(state['xp'], total_reward)
        self.assertEqual(daily_errands.snapshot(self.engine, self.character)['streak'], 1)

    def test_all_authored_template_references_are_valid_and_reject_unknown_ids(self):
        content=self.content
        content.validate_quest_templates()
        self.assertEqual({template['kind'] for template in content.quest_templates.values()}, {'deliver','observe_creature','escort_numen','bring_material'})
        for template_id,template in content.quest_templates.items():
            fields=['board_room','destination_room','board_npc']
            fields += ['target_npc'] if 'target_npc' in template else []
            fields += ['creature'] if 'creature' in template else []
            fields += ['item'] if 'item' in template else []
            for field in fields:
                original=template[field]
                template[field]='missing_reference'
                with self.subTest(template=template_id,field=field),self.assertRaises(ValueError):content.validate_quest_templates()
                template[field]=original

    def test_each_new_template_completes_with_real_action_and_level_scaled_rewards(self):
        templates=self.content.quest_templates
        for template_id,template in templates.items():
            date=None;errand=None
            for day in range(1,32):
                candidate_date=f'2026-10-{day:02d}'
                candidate=next((entry for entry in daily_errands.generate(self.engine,candidate_date,'edran') if entry.get('template_id')==template_id),None)
                if candidate:date,errand=candidate_date,candidate;break
            self.assertIsNotNone(errand,template_id)
            self.now=datetime.fromisoformat(date).replace(tzinfo=timezone.utc).timestamp()
            state=mechanics.new_state('humano','juramentado','home:test',self.now);state['level']=3;state['location']=template['destination_room'];state['events']=[]
            self.character['state']=state
            if template['kind']=='deliver':intent={'id':'hablar','target':template['target_npc']}
            elif template['kind']=='observe_creature':intent={'id':'examinar_criatura','target':template['creature']}
            elif template['kind']=='escort_numen':
                state['numenes']={'active':'test','bonded':[{'id':'test'}]};intent={'id':'mover'}
            else:
                state['inventory'].append({'id':template['item'],'quantity':2});intent={'id':'hablar','target':template['target_npc']}
            daily_errands.record_action(self.engine,self.character,intent,'edran')
            self.assertIn(errand['id'],state['daily_errands']['completed'],template_id)
            self.assertEqual(state['xp'],template['base_xp']*3,template_id)
            self.assertEqual(state['seals'],20+template['base_seals']*3,template_id)
            if template['kind']=='bring_material':self.assertEqual(next(i for i in state['inventory'] if i['id']==template['item'])['quantity'],1)

    def test_snapshot_does_not_persist_or_penalize_a_missed_day(self):
        state = self.character['state']
        state['daily_errand_streak'] = 4
        state['daily_errand_last_complete_date'] = '2026-10-29'
        before = copy.deepcopy(state)
        today = daily_errands.snapshot(self.engine, self.character)
        self.assertEqual(today['streak'], 0)
        self.assertEqual(len(today['errands']), 3)
        self.assertEqual(state, before)


if __name__ == '__main__':
    unittest.main()
