"""Segunda entrada a Las Cumbres Veladas por la cantera de Veyra (Tratado IV de Quellor)."""
import unittest
from pathlib import Path
from server import mechanics as m
from server.content import Content
from server.engine import Engine
from server.achievements import update

ROOT = Path(__file__).resolve().parents[1]


class CumbresCanteraTests(unittest.TestCase):
    def setUp(self):
        self.engine = Engine(Content(ROOT / 'content'), lambda: 100000)
        self.state = m.new_state('humano', 'arcano', 'home:humano', 100000)
        self.character = {'id': 1, 'name': 'UV.Diaz', 'species': 'humano', 'class_id': 'arcano', 'state': self.state}
        self.world = {'version': 0, 'flags': [], 'deaths': {}, 'weather': {}, 'encounters': {}, 'legends': {}}

    def ids(self, room):
        self.state['location'] = room
        return {a['id'] for a in self.engine.actions(self.character, self.world)}

    def test_examine_pared_tibia_en_cantera_vieja(self):
        self.state['location'] = 'veyra_cantera_callada'
        room = self.engine.room(self.character, self.world)
        self.assertIn('pared_tibia', room.get('examine', {}))
        self.assertIn('azufre limpio', room['examine']['pared_tibia'])

    def test_saludar_pared_oculto_hasta_leer_tratado_quellor_4(self):
        self.assertNotIn('veyra_saludar_pared_tibia', self.ids('veyra_cantera_callada'))
        self.state['flags'].append('leido_tratado_quellor_4')
        self.assertIn('veyra_saludar_pared_tibia', self.ids('veyra_cantera_callada'))

    def test_paso_completo_lecturas_y_hazana_al_cruzar(self):
        # 1. En la cantera vieja, con el Tratado IV leído
        self.state['flags'].append('leido_tratado_quellor_4')
        self.state['location'] = 'veyra_cantera_callada'
        self.engine.apply(self.character, self.world, {'id': 'veyra_saludar_pared_tibia'})

        # Ha abierto el paso y entrado a la galería de vapor
        self.assertEqual(self.state['location'], 'cantera_galeria_vapor')
        self.assertIn('paso_cantera_cumbres_abierto', self.state['flags'])

        # 2. Lectura en la galería del vapor
        self.assertIn('cantera_leer_marcas_canteros', self.ids('cantera_galeria_vapor'))
        self.engine.apply(self.character, self.world, {'id': 'cantera_leer_marcas_canteros'})
        self.assertIn('leido_marcas_canteros_veyra', self.state['flags'])
        self.assertTrue(any('canteros de Veyra' in j for j in self.state['journal']))

        # 3. Avanzar al cauce térmico subterráneo
        self.engine.apply(self.character, self.world, {'id': 'mover', 'target': 'norte'})
        self.assertEqual(self.state['location'], 'cantera_cauce_termico')

        # Lectura de la laja de Quellor en el cauce
        self.assertIn('cantera_leer_laja_rio', self.ids('cantera_cauce_termico'))
        self.engine.apply(self.character, self.world, {'id': 'cantera_leer_laja_rio'})
        self.assertIn('leido_laja_rio_resuello', self.state['flags'])
        self.assertTrue(any('laja de Quellor' in j for j in self.state['journal']))

        # 4. Emerger al Santuario del Resuello Compartido
        self.assertIn('cantera_emerger_santuario', self.ids('cantera_cauce_termico'))
        self.engine.apply(self.character, self.world, {'id': 'cantera_emerger_santuario'})
        self.assertEqual(self.state['location'], 'cumbres_santuario_resuello')
        self.assertIn('paso_cantera_cumbres_cruzado', self.state['flags'])

        # Hazaña desbloqueada
        unlocked = update(self.state, self.engine.content, self.world)
        unlocked_ids = {u['id'] for u in unlocked} | set(self.state.get('achievements', []))
        self.assertIn('segunda_entrada_cumbres', unlocked_ids)

    def test_regreso_desde_santuario_a_cantera_vieja(self):
        # El jugador está en el Santuario del Resuello y baja por el cauce
        self.state['location'] = 'cumbres_santuario_resuello'
        self.assertIn('cumbres_bajar_cauce_cantera', self.ids('cumbres_santuario_resuello'))
        self.engine.apply(self.character, self.world, {'id': 'cumbres_bajar_cauce_cantera'})
        self.assertEqual(self.state['location'], 'cantera_cauce_termico')

        # Baja al sur a la galería del vapor
        self.engine.apply(self.character, self.world, {'id': 'mover', 'target': 'sur'})
        self.assertEqual(self.state['location'], 'cantera_galeria_vapor')

        # Vuelve a la cantera de Veyra por la hendidura
        self.assertIn('cantera_volver_veyra', self.ids('cantera_galeria_vapor'))
        self.engine.apply(self.character, self.world, {'id': 'cantera_volver_veyra'})
        self.assertEqual(self.state['location'], 'veyra_cantera_callada')


if __name__ == '__main__':
    unittest.main()
