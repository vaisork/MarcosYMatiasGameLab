"""Los Tratados de Quellor: lecturas nuevas para quien ya leyó las seis crónicas de las Cumbres."""
import unittest
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine
from server.achievements import update

ROOT = Path(__file__).resolve().parents[1]
SALAS = ['cumbres_galeria_segunda_edad', 'cumbres_hornacina_tratados', 'cumbres_boveda_dorada', 'cumbres_cripta_sabios']


class TratadosQuellorTests(unittest.TestCase):
    def setUp(self):
        self.engine = Engine(Content(ROOT / 'content'), lambda: 100000)
        self.state = m.new_state('humano', 'arcano', 'home:humano', 100000)
        self.character = {'id': 1, 'name': 'UV.Diaz', 'species': 'humano', 'class_id': 'arcano', 'state': self.state}
        self.world = {'version': 0, 'flags': [], 'deaths': {}, 'weather': {}, 'encounters': {}, 'legends': {}}

    def ids(self, room):
        self.state['location'] = room
        return {a['id'] for a in self.engine.actions(self.character, self.world)}

    def test_ocultos_hasta_leer_la_cronica_seis(self):
        self.assertNotIn('cumbres_leer_aviso_archivista', self.ids('cumbres_paso_escamas'))
        self.assertNotIn('cumbres_leer_tratado_quellor_1', self.ids(SALAS[0]))

    def test_cuatro_tratados_y_cierre_con_hazana(self):
        self.state['flags'].append('leido_cronica_cumbres_6')
        self.assertIn('cumbres_leer_aviso_archivista', self.ids('cumbres_paso_escamas'))
        self.assertNotIn('cumbres_ordenar_tratados_quellor', self.ids('cumbres_camara_sabiduria'))
        for n, room in enumerate(SALAS, 1):
            self.assertIn(f'cumbres_leer_tratado_quellor_{n}', self.ids(room))
            self.engine.apply(self.character, self.world, {'id': f'cumbres_leer_tratado_quellor_{n}'})
        self.assertIn('cumbres_ordenar_tratados_quellor', self.ids('cumbres_camara_sabiduria'))
        self.engine.apply(self.character, self.world, {'id': 'cumbres_ordenar_tratados_quellor'})
        self.assertIn('hilo_tratados_quellor_concluido', self.state['flags'])
        self.assertTrue(any(i.get('catalog_id', i['id']) == 'pluma_ceniza' for i in self.state['inventory']))
        self.assertIn('tratados_quellor', self.state['achievements'] + [a['id'] for a in update(self.state, self.engine.content, self.world)])
        self.assertNotIn('cumbres_ordenar_tratados_quellor', self.ids('cumbres_camara_sabiduria'))


if __name__ == '__main__':
    unittest.main()
