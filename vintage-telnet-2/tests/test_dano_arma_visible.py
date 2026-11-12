import unittest
from server import mechanics as m


class DanoArmaVisible(unittest.TestCase):
    def test_golpe_nombra_arma_equipada(self):
        baculo = {'id': 'baculo_cuarzo_cantor', 'name': 'Báculo de Cuarzo Cantor', 'focus': True}
        text = m.weapon_prose(baculo, 'hit', 'Sierpe', 18, 1, max_hp=100)
        self.assertIn('18 de daño con tu Báculo de Cuarzo Cantor', text)

    def test_golpe_final_nombra_arma(self):
        text = m.weapon_prose({'id': 'punal_camino', 'name': 'Puñal de camino'}, 'final', 'Sierpe', 9, 2)
        self.assertIn('Puñal de camino', text)
        self.assertIn('9 de daño', text)


if __name__ == '__main__':
    unittest.main()
