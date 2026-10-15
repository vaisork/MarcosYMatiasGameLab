"""Tests for the fusion system requested by Matías:
- Valid fusion (weapons, armor, block)
- Maximum +3 limit
- Rejection of different items or single item
- Applied damage and defense bonuses
- Conservation of active equipment
- Intent parser support for 'fusionar <objeto>'
"""
import unittest
from pathlib import Path
from server.content import Content
from server.engine import Engine, RuleError
from server import mechanics as m

class Zero:
    def random(self): return 0.0

class FusionTests(unittest.TestCase):
    def setUp(self):
        self.engine = Engine(Content(Path(__file__).resolve().parents[1] / 'content'), lambda: 12 * 3600)
        self.state = m.new_state('humano', 'juramentado', 1, 12 * 3600)
        self.state['location'] = 'valdren_fragua'
        self.state['seals'] = 500
        self.character = {'id': 1, 'name': 'Prueba', 'species': 'humano', 'class_id': 'juramentado', 'state': self.state}
        self.world = {'flags': []}

    def act(self, id, target=None, **kwargs):
        return self.engine.apply(self.character, self.world, dict(id=id, target=target, **kwargs))

    def test_fusion_valida_armas(self):
        # Buy two identical weapons
        self.act('comprar', 'varita_aprendiz')
        self.act('comprar', 'varita_aprendiz')
        w1, w2 = [i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'varita_aprendiz']
        self.assertNotEqual(w1['id'], w2['id'])

        # Confirmation required
        with self.assertRaises(RuleError):
            self.act('fusionar', w1['id'])

        # Valid fusion at forge with Daro present
        self.act('fusionar', w1['id'], confirmed=True)
        varitas = [i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'varita_aprendiz']
        self.assertEqual(len(varitas), 1)
        upgraded = varitas[0]
        self.assertEqual(upgraded['id'], w1['id'])
        self.assertEqual(upgraded['fusion'], 1)
        self.assertTrue(upgraded['name'].endswith(' +1'))
        self.assertIn('Daro funde las dos hojas en una sola, más firme.', self.state['events'][0]['text'])

        # Buy another copy to fuse to +2 outside the forge
        self.state['location'] = 'valdren_plaza'
        self.state['inventory'].append(dict(self.engine.content.items['varita_aprendiz'], catalog_id='varita_aprendiz', id='varita_aprendiz:test2', quantity=1, condition='intact'))
        self.act('fusionar', upgraded['id'], confirmed=True)
        self.assertEqual(upgraded['fusion'], 2)
        self.assertTrue(upgraded['name'].endswith(' +2'))
        self.assertIn('Fundes las dos hojas en una sola, más firme.', self.state['events'][0]['text'])

    def test_fusion_valida_armaduras_y_bloqueo(self):
        # Two armor pieces as a stack
        self.state['inventory'].append({
            'id': 'gorro_cuero', 'catalog_id': 'gorro_cuero', 'name': 'Gorro de cuero',
            'kind': 'armor', 'slot': 'cabeza', 'armor_reduction': 0.04, 'quantity': 2, 'condition': 'intact'
        })
        self.act('fusionar', 'gorro_cuero', confirmed=True)
        armor = next(i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'gorro_cuero')
        self.assertEqual(armor['fusion'], 1)
        self.assertEqual(armor['name'], 'Gorro de cuero +1')
        self.assertEqual(armor['quantity'], 1)

        # Two block pieces
        self.state['inventory'].append({'id': 'escudo_madera:1', 'catalog_id': 'escudo_madera', 'name': 'Escudo de madera', 'kind': 'block', 'quantity': 1, 'condition': 'intact'})
        self.state['inventory'].append({'id': 'escudo_madera:2', 'catalog_id': 'escudo_madera', 'name': 'Escudo de madera', 'kind': 'block', 'quantity': 1, 'condition': 'intact'})
        self.act('fusionar', 'escudo_madera:1', confirmed=True)
        shield = next(i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'escudo_madera')
        self.assertEqual(shield['fusion'], 1)
        self.assertEqual(shield['name'], 'Escudo de madera +1')

    def test_maximo_mas_tres(self):
        # Item already at +3
        self.state['inventory'].append({
            'id': 'punal_camino:1', 'catalog_id': 'punal_camino', 'name': 'Puñal de camino +3',
            'kind': 'weapon', 'damage': 6, 'fusion': 3, 'quantity': 1, 'condition': 'intact'
        })
        self.state['inventory'].append({
            'id': 'punal_camino:2', 'catalog_id': 'punal_camino', 'name': 'Puñal de camino',
            'kind': 'weapon', 'damage': 6, 'quantity': 1, 'condition': 'intact'
        })
        # Actions should not offer fusion for +3
        actions = self.engine.actions(self.character, self.world)
        self.assertFalse(any(a['id'] == 'fusionar' and a['target'] == 'punal_camino:1' for a in actions))

        # Direct attempt must be rejected with 409
        with self.assertRaises(RuleError) as ctx:
            self.act('fusionar', 'punal_camino:1', confirmed=True)
        self.assertIn('máximo', str(ctx.exception))
        self.assertEqual(ctx.exception.status, 409)

    def test_rechaza_objetos_distintos_o_uno_solo(self):
        # Single item with quantity 1
        sword = self.state['inventory'][0]  # starting espada_juramento
        with self.assertRaises(RuleError) as ctx:
            self.act('fusionar', sword['id'], confirmed=True)
        self.assertIn('dos objetos iguales', str(ctx.exception))

        # Different item kinds or different catalog_ids
        self.state['inventory'].append({
            'id': 'provision_basica', 'catalog_id': 'provision_basica', 'name': 'Provisión básica',
            'kind': 'consumable', 'quantity': 2
        })
        with self.assertRaises(RuleError) as ctx:
            self.act('fusionar', 'provision_basica', confirmed=True)
        self.assertIn('armas, armaduras o escudos', str(ctx.exception))

    def test_bonificacion_aplicada(self):
        # Weapon damage bonus: +2 per fusion level
        weapon_base = {'id': 'w_base', 'catalog_id': 'espada_test', 'name': 'Espada prueba', 'kind': 'weapon', 'damage': 10, 'quantity': 1}
        weapon_fused = {'id': 'w_fused', 'catalog_id': 'espada_test', 'name': 'Espada prueba +1', 'kind': 'weapon', 'damage': 10, 'fusion': 1, 'quantity': 1}
        self.state['inventory'].extend([weapon_base, weapon_fused])

        # Test with base weapon equipped
        self.state['equipment']['weapon'] = 'w_base'
        combat = {'profile': {'hp': 100, 'level': 1, 'accuracy': 50, 'damage': 5, 'reduction': 0}, 'hp': 100, 'round': 0, 'intervention': {'id': 'atacar'}}
        self.state['combat'] = combat
        creature = {'id': 'test_creature', 'name': 'Rival de prueba'}
        m.resolve_round(self.state, creature, Zero(), respond=False)
        dmg_base = 100 - combat['hp']

        # Test with fused (+1) weapon equipped
        self.state['equipment']['weapon'] = 'w_fused'
        combat['hp'] = 100
        self.state['combat'] = combat
        m.resolve_round(self.state, creature, Zero(), respond=False)
        dmg_fused = 100 - combat['hp']

        # Exactly +2 damage from fusion level 1
        self.assertEqual(dmg_fused, dmg_base + 2)

        # Armor defense bonus: +0.02 armor_reduction per fusion level
        armor_base = {'id': 'a_base', 'catalog_id': 'peto_test', 'name': 'Peto', 'kind': 'armor', 'slot': 'torso', 'armor_reduction': 0.10, 'quantity': 1}
        armor_fused = {'id': 'a_fused', 'catalog_id': 'peto_test', 'name': 'Peto +1', 'kind': 'armor', 'slot': 'torso', 'armor_reduction': 0.10, 'fusion': 1, 'quantity': 1}
        self.state['inventory'].extend([armor_base, armor_fused])

        self.state['equipment']['torso'] = 'a_base'
        red_base = m.armor_total(self.state)
        self.assertAlmostEqual(red_base, 0.10)

        self.state['equipment']['torso'] = 'a_fused'
        red_fused = m.armor_total(self.state)
        self.assertAlmostEqual(red_fused, 0.12)

    def test_equipo_activo_conservado(self):
        # Case A: Equipped weapon is fused directly
        self.act('comprar', 'varita_aprendiz')
        self.act('comprar', 'varita_aprendiz')
        w1, w2 = [i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'varita_aprendiz']
        self.act('equipar', w1['id'])
        self.assertEqual(self.state['equipment']['weapon'], w1['id'])

        self.act('fusionar', w1['id'], confirmed=True)
        self.assertEqual(self.state['equipment']['weapon'], w1['id'])
        self.assertEqual(w1['fusion'], 1)

        # Case B: Consumed weapon was the equipped one, upgraded was unequipped
        self.act('comprar', 'espada_larga')
        self.act('comprar', 'espada_larga')
        e1, e2 = [i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'espada_larga']
        self.act('equipar', e1['id'])
        self.assertEqual(self.state['equipment']['weapon'], e1['id'])

        # Target e2 to be upgraded; e1 (which was equipped) is consumed!
        self.act('fusionar', e2['id'], confirmed=True)
        # Active weapon slot transfers to the upgraded e2
        self.assertEqual(self.state['equipment']['weapon'], e2['id'])
        self.assertEqual(e2['fusion'], 1)

    def test_parser_fusionar(self):
        # Have two identical items in inventory
        self.state['inventory'].append({
            'id': 'dagas_gemelas:1', 'catalog_id': 'dagas_gemelas', 'name': 'Dagas gemelas',
            'kind': 'weapon', 'damage': 8, 'quantity': 1, 'condition': 'intact'
        })
        self.state['inventory'].append({
            'id': 'dagas_gemelas:2', 'catalog_id': 'dagas_gemelas', 'name': 'Dagas gemelas',
            'kind': 'weapon', 'damage': 8, 'quantity': 1, 'condition': 'intact'
        })
        intent = self.engine.parse_intent(self.character, self.world, {'text': 'fusionar dagas gemelas', 'confirmed': True})
        self.assertEqual(intent['id'], 'fusionar')
        self.assertEqual(intent['target'], 'dagas_gemelas:1')
        self.assertTrue(intent['confirmed'])

if __name__ == '__main__':
    unittest.main()
