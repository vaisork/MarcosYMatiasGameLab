"""E3: journeys through the authored specialization missions."""
from pathlib import Path
import tempfile
import unittest
from werkzeug.security import generate_password_hash

from server.app import create_app
from server.content import Content
from server.store import Store
import test_engine as fixtures


ROOT = Path(__file__).resolve().parents[1]


class EspecializacionesContentTests(unittest.TestCase):
    post = fixtures.JourneyTests.post
    create = fixtures.JourneyTests.create
    action = fixtures.JourneyTests.action

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.clock = fixtures.Clock()
        self.sequence = 0
        self.content = Content(ROOT / 'content')
        self.app = create_app({
            'TESTING': True,
            'DATA_DIR': self.temp.name,
            'CONTENT_DIR': str(ROOT / 'content'),
            'CLOCK': self.clock,
            'RNG': fixtures.FixedRandom(),
            'DM_PASSWORD_HASH': generate_password_hash('private-master-test'),
        })
        self.client = self.app.test_client()
        self.master = self.app.test_client()

    def put_state(self, cid, **changes):
        store = self.app.extensions['store']
        with store.transaction() as db:
            character = Store.load(db.execute('SELECT * FROM characters WHERE id=?', (cid,)).fetchone())
            character['state'].update(changes)
            Store.save(db, character)

    def put_world_flags(self, *flags):
        store = self.app.extensions['store']
        with store.transaction() as db:
            world = Store.world(db)
            world['flags'].extend(flag for flag in flags if flag not in world['flags'])
            Store.save_world(db, world)

    def saved_state(self, cid):
        store = self.app.extensions['store']
        with store.transaction() as db:
            return Store.load(db.execute('SELECT * FROM characters WHERE id=?', (cid,)).fetchone())['state']

    def at(self, cid, room, **state):
        self.put_state(cid, location=room, **state)
        return self.client.get('/api/state').json

    def test_arcane_mission_requires_level_class_and_grieta_calm_then_completes(self):
        cid = self.create('arcano')
        self.put_world_flags('korven_grieta_en_calma', 'grieta_veta_eco')
        state = self.at(cid, 'korven_grieta_lecho', level=19)
        self.assertNotIn('ecos_escuchar_muda', {a['id'] for a in state['actions']})

        state = self.at(cid, 'korven_grieta_lecho', level=20)
        self.assertIn('ecos_escuchar_muda', {a['id'] for a in state['actions']})
        self.action('ecos_escuchar_muda')
        for room, action_id in (
            ('korven_grieta_ecos', 'ecos_cristal_tibio'),
            ('korven_grieta_sorda', 'ecos_cristal_sordo'),
            ('korven_grieta_geodas', 'ecos_cristal_geoda'),
        ):
            state = self.at(cid, room)
            self.assertIn(action_id, {a['id'] for a in state['actions']})
            self.action(action_id)

        state = self.at(cid, 'korven_grieta_lecho')
        self.assertIn('ecos_unir_cristales', {a['id'] for a in state['actions']})
        completed = self.action('ecos_unir_cristales')
        self.assertEqual(completed['character']['especializacion']['id'], 'arcano_ecos')
        self.assertIn('especializacion:arcano_ecos', self.saved_state(cid)['flags'])
        self.assertTrue(any('Cierre:' in entry for entry in completed['journal']))

    def test_heroic_mission_visits_five_gates_and_completes_at_arels_plaza(self):
        cid = self.create('juramentado')
        # The derived rank flags model a Heroic candidate who already earned
        # an errand rank and a Defender rank before starting the oath.
        self.put_state(cid, level=20, flags=[
            'encargo_pagado:valdren_recado_forja',
            'victoria:edran_prado:cornalomo',
            'rango:escudero',
            'rango:defensor:valdren',
            'rango:defensor',
        ])
        state = self.at(cid, 'veyra_patio_senales')
        self.assertIn('Arel', [person['name'] for person in state['room']['npcs']])
        self.action('hablar', 'veyra_arel', topic='juramento')
        for room, action_id in (
            ('veyra_puerta_campos', 'juramento_puerta_campos'),
            ('veyra_puerta_alta', 'juramento_puerta_alta'),
            ('veyra_puerta_piedra', 'juramento_puerta_piedra'),
            ('veyra_puerta_juncos', 'juramento_puerta_juncos'),
            ('veyra_puerta_sombra', 'juramento_puerta_sombra'),
        ):
            state = self.at(cid, room)
            self.assertIn(action_id, {a['id'] for a in state['actions']})
            self.action(action_id)
        state = self.at(cid, 'veyra_plaza_rutas')
        self.assertIn('juramento_pronunciar', {a['id'] for a in state['actions']})
        completed = self.action('juramento_pronunciar')
        self.assertEqual(completed['character']['especializacion']['id'], 'juramentado_heroico')
        self.assertIn('especializacion:juramentado_heroico', self.saved_state(cid)['flags'])
        self.assertTrue(any('Cierre:' in entry for entry in completed['journal']))

    def test_title_recognition_uses_existing_npc_memory_flags(self):
        expected = {
            ('edran', 'edran_daro', 'rango:defensor:valdren'),
            ('hoshai', 'hoshai_seran', 'rango:defensor:khariel'),
            ('korven', 'korven_oma', 'rango:defensor:brumak'),
            ('lethra', 'lethra_nima', 'rango:defensor:narevia'),
            ('nhal', 'nhal_leris', 'rango:defensor:velmora'),
            ('veyra', 'veyra_arel', 'rango:heroe'),
            ('veyra', 'veyra_arel', 'rango:campeon:veyra'),
        }
        for region, npc, flag in expected:
            with self.subTest(npc=npc, flag=flag):
                self.assertIn(flag, self.content.npcs[npc].get('memory', {}))

        cid = self.create('juramentado')
        self.put_state(cid, location='veyra_patio_senales', flags=['rango:heroe'])
        response = self.action('hablar', 'veyra_arel', topic='mensajes')
        self.assertTrue(any('Héroe de Vaisgard' in line['text'] for line in response['narrative']))


if __name__ == '__main__':
    unittest.main()
