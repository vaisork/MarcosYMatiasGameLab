import sys
from collections import deque
from pathlib import Path
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
from werkzeug.security import generate_password_hash
from server.app import create_app
from server.content import Content
import test_engine as fixtures

class HilosOrigenTests(unittest.TestCase):
    post = fixtures.JourneyTests.post
    action = fixtures.JourneyTests.action

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.clock = fixtures.Clock()
        self.sequence = 0
        self.root = Path(__file__).resolve().parents[1]
        self.content = Content(self.root / 'content')
        self.app = create_app({
            'TESTING': True,
            'DATA_DIR': self.temp.name,
            'CONTENT_DIR': str(self.root / 'content'),
            'CLOCK': self.clock,
            'RNG': fixtures.FixedRandom(),
            'DM_PASSWORD_HASH': generate_password_hash('private-master-test')
        })
        self.client = self.app.test_client()
        self.master = self.app.test_client()

    def create_character(self, name='Vaison', species='humano', class_id='juramentado'):
        self.sequence += 1
        username = f'user_{name.lower()}_{self.sequence}'
        self.assertEqual(self.post(self.client, '/api/account/register', {'username': username, 'password': 'testpass123'}).status_code, 201)
        response = self.post(self.client, '/api/character/create', {'name': name, 'species': species, 'class_id': class_id})
        self.assertEqual(response.status_code, 201)
        cid = response.json['character']['id']
        self.assertEqual(self.post(self.master, '/api/master/login', {'username': 'vaisork', 'password': 'private-master-test'}).status_code, 200)
        self.assertEqual(self.post(self.master, '/api/master/approve', {'character_id': cid}).status_code, 200)
        return cid

    def walk(self, target):
        current = self.client.get('/api/state').json['room']['id']
        if current.startswith('home:'):
            self.action('mover', 'salir')
            current = self.client.get('/api/state').json['room']['id']
        queue = deque([(current, [])])
        seen = {current}
        while queue:
            room, path = queue.popleft()
            if room == target:
                for direction in path:
                    self.action('mover', direction)
                return
            for direction, destination in self.content.rooms[room]['exits'].items():
                if destination not in seen:
                    seen.add(destination)
                    queue.append((destination, path + [direction]))
        self.fail('Unreachable actual authored room ' + target)

    def test_hilo_edran_humano(self):
        """Vaison (humano) completa el hilo de Edran con el atajo de especie."""
        self.create_character(name='Vaison', species='humano', class_id='juramentado')
        self.walk('valdren_huertos')
        # Easter egg
        self.action('examinar', 'espantapajaros')
        egg = self.action('edran_easter_espantapajaros')
        self.assertTrue(any('espantapájaros' in j for j in egg['journal']))

        # Semilla en plaza
        self.walk('valdren_plaza')
        self.action('examinar', 'hendidura')
        step1 = self.action('edran_hilo_extraer_ficha')
        self.assertTrue(any('ficha de boj' in j for j in step1['journal']))

        # Paso 2 con atajo humano
        self.walk('valdren_huertos')
        actions = [a['id'] for a in self.client.get('/api/state').json['actions']]
        self.assertIn('edran_hilo_mirar_estaquillas', actions)
        step2 = self.action('edran_hilo_mirar_estaquillas')
        self.assertTrue(any('tres cortes' in j for j in step2['journal']))

        # Paso 3: Iria en casa de semillas
        self.walk('valdren_casa_semillas')
        step3 = self.action('hablar', 'edran_iria', topic='ficha_espiga')
        self.assertTrue(any('Iria reconoció la ficha' in j for j in step3['journal']))

        # Paso 4: Cierre en comedor de Elva
        self.walk('valdren_comedor')
        self.action('examinar', 'repisa')
        final = self.action('edran_hilo_concluir')
        self.assertTrue(any('dibujo de infancia' in j for j in final['journal']))
        self.assertTrue(any('Korven' in e['text'] for e in final['narrative']))

        # Frase nueva en Iria tras el cierre
        self.walk('valdren_casa_semillas')
        iria_post = self.action('hablar', 'edran_iria', topic='promesa_hermano')
        self.assertTrue(any('corteza' in e['text'] for e in iria_post['narrative']))

        # Memoria en la plaza
        self.walk('valdren_plaza')
        state = self.client.get('/api/state').json
        self.assertTrue(any('promesa de infancia' in e['text'] for e in state['scene']))
        exam_hendidura = self.action('examinar', 'hendidura')
        self.assertTrue(any('vacía' in e['text'] for e in exam_hendidura['narrative']))

    def test_hilo_edran_otra_especie(self):
        """Senku (felaryn) completa el hilo de Edran por la ruta larga."""
        self.create_character(name='Senku', species='felaryn', class_id='sombra')
        # Para entrar a Valdren desde fuera, pide permiso a Lina en la salida de huertos
        self.walk('edran_salida_huertos')
        self.action('pedir_permiso_valdren')
        self.walk('valdren_plaza')
        self.action('examinar', 'hendidura')
        step1 = self.action('edran_hilo_extraer_ficha')
        self.assertTrue(any('ficha de boj' in j for j in step1['journal']))

        # No tiene el atajo humano disponible
        self.walk('valdren_huertos')
        actions = [a['id'] for a in self.client.get('/api/state').json['actions']]
        self.assertNotIn('edran_hilo_mirar_estaquillas', actions)

        # Ruta larga: examinar estaquillas y hablar con Lina en la salida de huertos
        self.action('examinar', 'estaquillas')
        self.walk('edran_salida_huertos')
        step2 = self.action('hablar', 'edran_lina', topic='marca_estaquillas')
        self.assertTrue(any('familia de Iria' in j for j in step2['journal']))

        # Continuación idéntica
        self.walk('valdren_casa_semillas')
        self.action('hablar', 'edran_iria', topic='ficha_espiga')
        self.walk('valdren_comedor')
        self.action('examinar', 'repisa')
        final = self.action('edran_hilo_concluir')
        self.assertTrue(any('dibujo de infancia' in j for j in final['journal']))

    def test_hilo_hoshai_felaryn(self):
        """Senku (felaryn) completa el hilo de Hoshai con el atajo de especie."""
        self.create_character(name='Senku', species='felaryn', class_id='sombra')
        # Easter egg
        self.walk('hoshai_lavadero_roca')
        self.action('examinar', 'salamandra')
        egg = self.action('hoshai_easter_salamandra')
        self.assertTrue(any('salamandra' in j for j in egg['journal']))

        # Semilla en plaza de Khariel
        self.walk('khariel_centro')
        self.action('examinar', 'apoyo_alto')
        step1 = self.action('hoshai_hilo_revisar_campanilla')
        self.assertTrue(any('cera de la campanilla' in j for j in step1['journal']))

        # Paso 2 con atajo felaryn en taller de apoyos
        self.walk('hoshai_taller_apoyos')
        actions = [a['id'] for a in self.client.get('/api/state').json['actions']]
        self.assertIn('hoshai_hilo_observar_viga_felaryn', actions)
        step2 = self.action('hoshai_hilo_observar_viga_felaryn')
        self.assertTrue(any('instinto felaryn' in j for j in step2['journal']))

        # Paso 3: Balcón del valle
        self.walk('hoshai_balcon_valle')
        self.action('examinar', 'caja_grieta')
        step3 = self.action('hoshai_hilo_abrir_cajita')
        self.assertTrue(any('cajita del balcón' in j for j in step3['journal']))

        # Paso 4: Cierre con Luma en mercado de cintas
        self.walk('hoshai_mercado_cintas')
        final = self.action('hablar', 'hoshai_luma', topic='cinta_azul_plumas')
        self.assertTrue(any('cinta que su sobrina tejió' in j for j in final['journal']))
        self.assertTrue(any('Veyra' in e['text'] for e in final['narrative']))

        # Frase nueva tras cierre en Luma y Daren
        luma_post = self.action('hablar', 'hoshai_luma', topic='recuerdo_sobrina')
        self.assertTrue(any('cinta azul' in e['text'] for e in luma_post['narrative']))
        self.walk('hoshai_taller_apoyos')
        daren_post = self.action('hablar', 'hoshai_daren', topic='noticia_cinta')
        self.assertTrue(any('plumas' in e['text'] for e in daren_post['narrative']))

        # Memoria en la plaza
        self.walk('khariel_centro')
        state = self.client.get('/api/state').json
        self.assertTrue(any('campanilla' in e['text'] for e in state['scene']))
        exam_apoyo = self.action('examinar', 'apoyo_alto')
        self.assertTrue(any('sin la' in e['text'].lower() for e in exam_apoyo['narrative']))

    def test_hilo_hoshai_otra_especie(self):
        """Vaison (humano) completa el hilo de Hoshai por la ruta larga."""
        self.create_character(name='Vaison', species='humano', class_id='juramentado')
        self.walk('khariel_centro')
        self.action('examinar', 'apoyo_alto')
        self.action('hoshai_hilo_revisar_campanilla')

        # No tiene atajo felaryn disponible
        self.walk('hoshai_taller_apoyos')
        actions = [a['id'] for a in self.client.get('/api/state').json['actions']]
        self.assertNotIn('hoshai_hilo_observar_viga_felaryn', actions)

        # Ruta larga: examinar raspones y hablar con Daren
        self.action('examinar', 'raspones')
        step2 = self.action('hablar', 'hoshai_daren', topic='marcas_taller')
        self.assertTrue(any('sobrina solía subir' in j for j in step2['journal']))

        # Continuación idéntica
        self.walk('hoshai_balcon_valle')
        self.action('examinar', 'caja_grieta')
        self.action('hoshai_hilo_abrir_cajita')
        self.walk('hoshai_mercado_cintas')
        final = self.action('hablar', 'hoshai_luma', topic='cinta_azul_plumas')
        self.assertTrue(any('cinta que su sobrina tejió' in j for j in final['journal']))

    def test_hilo_lethra_marevyn(self):
        """Alivision (marevyn) completa el hilo de Lethra con el atajo de especie."""
        self.create_character(name='Alivision', species='marevyn', class_id='arcano')
        # Easter egg
        self.walk('narevia_centro')
        self.action('examinar', 'pilote')
        egg = self.action('lethra_easter_luciernagas')
        self.assertTrue(any('luciérnagas' in j for j in egg['journal']))

        # Semilla en plaza de Narevia
        self.action('examinar', 'boya_tallada')
        step1 = self.action('lethra_hilo_levantar_boya')
        self.assertTrue(any('base de la boya' in j for j in step1['journal']))

        # Paso 2 con atajo marevyn en patio de barcas
        self.walk('lethra_cuidado_barcas')
        actions = [a['id'] for a in self.client.get('/api/state').json['actions']]
        self.assertIn('lethra_hilo_tacto_marevyn', actions)
        step2 = self.action('lethra_hilo_tacto_marevyn')
        self.assertTrue(any('membranas marevyn' in j for j in step2['journal']))

        # Paso 3: Taller de fibras de Mira
        self.walk('lethra_taller_fibras')
        self.action('examinar', 'cesto_mimbre')
        step3 = self.action('lethra_hilo_abrir_cesto')
        self.assertTrue(any('flauta de caña' in j for j in step3['journal']))

        # Paso 4: Cierre con Nima en cocina de reunión
        self.walk('lethra_cocina_reunion')
        final = self.action('hablar', 'lethra_nima', topic='flauta_cana')
        self.assertTrue(any('flauta de caña' in j for j in final['journal']))
        self.assertTrue(any('Edran' in e['text'] for e in final['narrative']))

        # Frase nueva tras cierre en Nima y Mira
        nima_post = self.action('hablar', 'lethra_nima', topic='cancion_hermanas')
        self.assertTrue(any('melodía' in e['text'] for e in nima_post['narrative']))
        self.walk('lethra_taller_fibras')
        mira_post = self.action('hablar', 'lethra_mira', topic='recuerdo_flauta')
        self.assertTrue(any('desafinada' in e['text'] for e in mira_post['narrative']))

        # Memoria en la plaza
        self.walk('narevia_centro')
        state = self.client.get('/api/state').json
        self.assertTrue(any('concha anaranjada' in e['text'] for e in state['scene']))

    def test_hilo_lethra_otra_especie(self):
        """Vaison (humano) completa el hilo de Lethra por la ruta larga."""
        self.create_character(name='Vaison', species='humano', class_id='juramentado')
        self.walk('narevia_centro')
        self.action('examinar', 'boya_tallada')
        self.action('lethra_hilo_levantar_boya')

        # No tiene atajo marevyn disponible
        self.walk('lethra_cuidado_barcas')
        actions = [a['id'] for a in self.client.get('/api/state').json['actions']]
        self.assertNotIn('lethra_hilo_tacto_marevyn', actions)

        # Ruta larga: examinar madeja y hablar con Sola
        self.action('examinar', 'madeja_humeda')
        step2 = self.action('hablar', 'lethra_sola', topic='boya_concha')
        self.assertTrue(any('boya la fabricó ella' in j for j in step2['journal']))

        # Continuación idéntica
        self.walk('lethra_taller_fibras')
        self.action('examinar', 'cesto_mimbre')
        self.action('lethra_hilo_abrir_cesto')
        self.walk('lethra_cocina_reunion')
        final = self.action('hablar', 'lethra_nima', topic='flauta_cana')
        self.assertTrue(any('flauta de caña' in j for j in final['journal']))

if __name__ == '__main__':
    unittest.main()
