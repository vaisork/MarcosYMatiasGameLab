"""Pruebas de regresión para los hallazgos 1 a 5 de revisión de código
y hallazgo 03 de informe de auditoría.
"""
import json
import tempfile
import unittest
from pathlib import Path
from werkzeug.security import generate_password_hash

from server.app import create_app
from server.content import Content
from server.engine import Engine, RuleError
from server import mechanics as m

ROOT = Path(__file__).resolve().parents[1]

class AuditoriaFixesTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.app = create_app({
            'TESTING': True,
            'DATA_DIR': self.tmp.name,
            'DM_PASSWORD_HASH': generate_password_hash('director-clave-segura'),
            'CLOCK': lambda: 100000
        })
        self.client = self.app.test_client()
        self.store = self.app.extensions['store']

    def post(self, c, path, data):
        with c.session_transaction() as s:
            token = s.get('csrf')
        if not token:
            c.get('/api/state')
        with c.session_transaction() as s:
            token = s['csrf']
        return c.post(path, json=data, headers={'X-CSRF-Token': token})

    def test_hallazgo_1_cuenta_historica_reclamada_invalida_sesiones_y_retira_password(self):
        # 1. Crear cuenta histórica 'vaisork' con contraseña común y sesión activa
        with self.store.transaction() as db:
            cur = db.execute("INSERT INTO accounts(username, password_hash) VALUES(?,?)",
                             ('vaisork', generate_password_hash('clave_jugador_antigua')))
            acc_id = cur.lastrowid
            db.execute("INSERT INTO account_access(account_id, blocked, session_version) VALUES(?,0,0)", (acc_id,))

        # Sesión previa del jugador antiguo
        old_player = self.app.test_client()
        with old_player.session_transaction() as s:
            s['account_id'] = acc_id
            s['account_version'] = 0

        # 2. Primer login legítimo del DM reclamando la identidad reservada
        dm_client = self.app.test_client()
        r = self.post(dm_client, '/api/account/login', {'username': 'vaisork', 'password': 'director-clave-segura'})
        self.assertEqual(r.status_code, 200)

        # 3. Comprobar que en BD se retiró la contraseña ordinaria y se incrementó session_version
        with self.store.transaction() as db:
            acc = db.execute("SELECT password_hash FROM accounts WHERE id=?", (acc_id,)).fetchone()
            self.assertEqual(acc['password_hash'], '!reserved_dm')
            access = db.execute("SELECT session_version FROM account_access WHERE account_id=?", (acc_id,)).fetchone()
            self.assertGreater(access['session_version'], 0)

        # 4. Intentar login con la clave ordinaria anterior debe fallar
        intruder = self.app.test_client()
        r_fail = self.post(intruder, '/api/account/login', {'username': 'vaisork', 'password': 'clave_jugador_antigua'})
        self.assertEqual(r_fail.status_code, 401)

        # 5. La sesión anterior del jugador antiguo queda invalidada en /api/state
        r_old = old_player.get('/api/state')
        self.assertEqual(r_old.status_code, 200)
        self.assertFalse(r_old.json.get('authenticated'))
        with old_player.session_transaction() as s:
            self.assertNotIn('account_id', s)
            self.assertNotIn('master', s)

    def test_hallazgo_2_bloquear_o_invalidar_dm_revoca_master(self):
        # 1. Login DM
        dm1 = self.app.test_client()
        r = self.post(dm1, '/api/master/login', {'username': 'vaisork', 'password': 'director-clave-segura'})
        self.assertEqual(r.status_code, 200)
        with dm1.session_transaction() as s:
            self.assertTrue(s.get('master'))
            self.assertIn('master_account_id', s)
            self.assertIn('master_version', s)
            dm_acc_id = s['master_account_id']

        # Comprobar acceso master activo
        r_state = dm1.get('/api/master/state')
        self.assertEqual(r_state.status_code, 200)
        self.assertTrue(r_state.json.get('authenticated'))

        # 2. Bloquear la cuenta del director en BD (o por revocación)
        with self.store.transaction() as db:
            db.execute("UPDATE account_access SET blocked=1 WHERE account_id=?", (dm_acc_id,))

        # 3. GET /api/master/state debe revocar master y devolver 401
        r_blocked = dm1.get('/api/master/state')
        self.assertEqual(r_blocked.status_code, 401)
        self.assertFalse(r_blocked.json.get('authenticated'))
        with dm1.session_transaction() as s:
            self.assertNotIn('master', s)

        # 4. Rutas protegidas /api/master/* deben ser rechazadas con 403
        r_post = self.post(dm1, '/api/master/tester', {'character_id': 1, 'enabled': True})
        self.assertEqual(r_post.status_code, 403)

    def test_hallazgo_3_cambio_password_vaisork_dm_rechazado(self):
        # Login DM
        dm = self.app.test_client()
        r_log = self.post(dm, '/api/account/login', {'username': 'vaisork', 'password': 'director-clave-segura'})
        self.assertEqual(r_log.status_code, 200)
        vaisork_cid = r_log.json['character']['id']

        # Intentar cambiar contraseña de Vaisork desde la API DM
        r = self.post(dm, '/api/master/account/password', {
            'character_id': vaisork_cid,
            'password': 'nueva-clave-invalida',
            'confirmation': 'nueva-clave-invalida'
        })
        self.assertEqual(r.status_code, 400)
        self.assertIn('server.env', r.json.get('message', ''))

    def test_hallazgo_4_cambio_password_jugador_invalida_sesiones_anteriores(self):
        # 1. Registrar jugador común
        player = self.app.test_client()
        r_reg = self.post(player, '/api/account/register', {'username': 'aventurero1', 'password': 'clave-jugador-1'})
        self.assertEqual(r_reg.status_code, 201)
        r_char = self.post(player, '/api/character/create', {'name': 'Aventurero', 'species': 'humano', 'class_id': 'juramentado'})
        self.assertEqual(r_char.status_code, 201)
        char_id = r_char.json['character']['id']

        # Aprobar jugador desde DM
        dm = self.app.test_client()
        self.post(dm, '/api/master/login', {'username': 'vaisork', 'password': 'director-clave-segura'})
        self.post(dm, '/api/master/approve', {'character_id': char_id})

        # Jugador juega normalmente
        r_state1 = player.get('/api/state')
        self.assertTrue(r_state1.json.get('authenticated'))

        # 2. DM cambia la contraseña del jugador
        r_pwd = self.post(dm, '/api/master/account/password', {
            'character_id': char_id,
            'password': 'nueva-clave-super-segura',
            'confirmation': 'nueva-clave-super-segura'
        })
        self.assertEqual(r_pwd.status_code, 200)
        self.assertTrue(r_pwd.json.get('changed'))

        # 3. Sesión previa del jugador queda invalidada en el siguiente acceso
        r_state2 = player.get('/api/state')
        self.assertFalse(r_state2.json.get('authenticated'))
        with player.session_transaction() as s:
            self.assertNotIn('account_id', s)

    def test_hallazgo_5_compra_pieza_base_no_se_apila_con_pieza_fusionada(self):
        engine = Engine(Content(ROOT / 'content'), lambda: 12 * 3600)
        state = m.new_state('humano', 'juramentado', 1, 12 * 3600)
        state['location'] = 'valdren_fragua'
        state['seals'] = 1000
        # Pila de 2 armaduras base
        state['inventory'] = [
            {'id': 'gorro_cuero', 'catalog_id': 'gorro_cuero', 'name': 'Gorro de cuero', 'kind': 'armor', 'slot': 'head', 'quantity': 2, 'armor': 1, 'price': 20, 'sell_price': 7},
            {'id': 'espina_espinajo', 'catalog_id': 'espina_espinajo', 'name': 'Espina de Espinajo', 'kind': 'material', 'quantity': 5}
        ]
        character = {'id': 1, 'name': 'Tester', 'species': 'humano', 'class_id': 'juramentado', 'state': state}
        world = {'flags': []}

        # Fusión a +1
        engine.apply(character, world, {'id': 'fusionar', 'target': 'gorro_cuero', 'confirmed': True})
        fused = next(i for i in state['inventory'] if (i.get('catalog_id') or i['id']) == 'gorro_cuero')
        self.assertEqual(fused['fusion'], 1)
        self.assertEqual(fused['quantity'], 1)
        self.assertTrue(fused['name'].endswith(' +1'))
        self.assertIn(':', fused['id'])
        self.assertEqual(fused['catalog_id'], 'gorro_cuero')

        # Compra de nueva pieza base
        engine.add_item(state, 'gorro_cuero')

        # Comprobar que no se apiló con la pieza fusionada
        items_gorro = [i for i in state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'gorro_cuero']
        self.assertEqual(len(items_gorro), 2)
        fused_item = next(i for i in items_gorro if i.get('fusion', 0) == 1)
        base_item = next(i for i in items_gorro if i.get('fusion', 0) == 0)
        self.assertEqual(fused_item['quantity'], 1)
        self.assertEqual(base_item['quantity'], 1)
        self.assertEqual(base_item['id'], 'gorro_cuero')

    def test_hallazgo_informe_03_aviso_peligro_boveda_guardian_y_senal_dragon(self):
        content = Content(ROOT / 'content')

        # 1. Aviso claro antes de entrar a veyra_mazmorra_boveda_guardian (en veyra_mazmorra_galeria_ecos)
        ecos_room = content.rooms['veyra_mazmorra_galeria_ecos']
        desc_ecos = ecos_room.get('description', '') + ' ' + str(ecos_room.get('examine', {})) + ' ' + str(ecos_room.get('exit_requirements', {}))
        self.assertIn('peligro', desc_ecos.lower())
        self.assertIn('nivel alto', desc_ecos.lower())
        self.assertIn('pociones', desc_ecos.lower())

        # 2. Aviso en la señal del dragón
        guardian_room = content.rooms['veyra_mazmorra_boveda_guardian']
        dragon_signal = next(s for s in guardian_room.get('signals', []) if s.get('creature') == 'dragon_aguas_antiguas')
        sig_text = dragon_signal.get('text', '')
        self.assertIn('peligro', sig_text.lower())
        self.assertIn('nivel alto', sig_text.lower())
        self.assertIn('pociones', sig_text.lower())

if __name__ == '__main__':
    unittest.main()
