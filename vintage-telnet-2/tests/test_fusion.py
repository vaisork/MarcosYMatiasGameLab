"""Tests for the fusion system:
- Fusión exclusiva con el herrero en la forja (forge_service)
- Rechazo fuera de la forja, sin sellos o sin materiales
- Costo en sellos según precio y nivel destino (+1: 25%, +2: 50%, +3: 100%)
- Requisito de materiales en varias unidades (+1: 5 espinas, +2: 5 placas, +3: 3 escamas)
- El herrero indica qué falta y dónde conseguirlo
- Consumo exacto de sellos y materiales
- Aumento de potencia (+2 daño / +0.02 armadura) y valor de venta (sell_price +50% por nivel)
- Conservación de equipo activo y parseo de intención
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
        # Comprar dos varitas (precio 40 cada una) y añadir materiales para +1
        self.act('comprar', 'varita_aprendiz')
        self.act('comprar', 'varita_aprendiz')
        self.state['inventory'].append({'id': 'espina_espinajo', 'catalog_id': 'espina_espinajo', 'name': 'Espina de Espinajo', 'kind': 'material', 'quantity': 5})
        w1, w2 = [i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'varita_aprendiz']
        self.assertNotEqual(w1['id'], w2['id'])

        # Exige confirmación previa
        with self.assertRaises(RuleError):
            self.act('fusionar', w1['id'])

        # Fusión válida en la forja con Daro
        seals_before = self.state['seals']
        self.act('fusionar', w1['id'], confirmed=True)
        varitas = [i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'varita_aprendiz']
        self.assertEqual(len(varitas), 1)
        upgraded = varitas[0]
        self.assertEqual(upgraded['id'], w1['id'])
        self.assertEqual(upgraded['fusion'], 1)
        self.assertTrue(upgraded['name'].endswith(' +1'))
        # 25% de 40 = 10 sellos consumidos
        self.assertEqual(self.state['seals'], seals_before - 10)
        # 5 espinas consumidas exactamente
        self.assertFalse(any((i.get('catalog_id') or i['id']) == 'espina_espinajo' for i in self.state['inventory']))
        self.assertIn('Daro cobra 10 sellos', self.state['events'][0]['text'])

        # Progresión a +2: requiere otra varita, 20 sellos (50% de 40) y 5 Placa de Cascapedernal
        self.act('comprar', 'varita_aprendiz')
        self.state['inventory'].append({'id': 'placa_cascapedernal', 'catalog_id': 'placa_cascapedernal', 'name': 'Placa de Cascapedernal', 'kind': 'material', 'quantity': 5})
        seals_before = self.state['seals']
        self.act('fusionar', upgraded['id'], confirmed=True)
        self.assertEqual(upgraded['fusion'], 2)
        self.assertTrue(upgraded['name'].endswith(' +2'))
        self.assertEqual(self.state['seals'], seals_before - 20)
        self.assertEqual(upgraded['sell_price'], 28)

        # Progresión a +3: requiere otra varita, 40 sellos (100% de 40) y 3 Gran escama de dragón
        self.act('comprar', 'varita_aprendiz')
        self.state['inventory'].append({'id': 'escama_dragon', 'catalog_id': 'escama_dragon', 'name': 'Gran escama de dragón', 'kind': 'material', 'quantity': 3})
        seals_before = self.state['seals']
        self.act('fusionar', upgraded['id'], confirmed=True)
        self.assertEqual(upgraded['fusion'], 3)
        self.assertTrue(upgraded['name'].endswith(' +3'))
        self.assertEqual(self.state['seals'], seals_before - 40)
        self.assertEqual(upgraded['sell_price'], 35)

    def test_rechaza_fuera_de_la_forja(self):
        self.act('comprar', 'varita_aprendiz')
        self.act('comprar', 'varita_aprendiz')
        self.state['inventory'].append({'id': 'espina_espinajo', 'catalog_id': 'espina_espinajo', 'name': 'Espina de Espinajo', 'kind': 'material', 'quantity': 5})
        w1 = [i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'varita_aprendiz'][0]

        # Fuera de la forja no se ofrece la acción
        self.state['location'] = 'valdren_plaza'
        actions = self.engine.actions(self.character, self.world)
        self.assertFalse(any(a['id'] == 'fusionar' for a in actions))

        # Y la ejecución directa es rechazada con 409
        with self.assertRaises(RuleError) as ctx:
            self.act('fusionar', w1['id'], confirmed=True)
        self.assertEqual(ctx.exception.status, 409)
        self.assertIn('forja', str(ctx.exception).lower())

    def test_rechaza_sin_sellos_o_sin_materiales(self):
        self.act('comprar', 'varita_aprendiz')
        self.act('comprar', 'varita_aprendiz')
        w1 = [i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'varita_aprendiz'][0]

        # Sin materiales: el herrero rechaza y dice qué falta y dónde se consigue (+1: espina_espinajo en Edran)
        with self.assertRaises(RuleError) as ctx:
            self.act('fusionar', w1['id'], confirmed=True)
        self.assertEqual(ctx.exception.status, 409)
        self.assertIn('Espina de Espinajo', str(ctx.exception))
        self.assertIn('Edran', str(ctx.exception))

        # Con materiales pero sin sellos suficientes (coste 10 sellos para +1)
        self.state['inventory'].append({'id': 'espina_espinajo', 'catalog_id': 'espina_espinajo', 'name': 'Espina de Espinajo', 'kind': 'material', 'quantity': 5})
        self.state['seals'] = 4
        with self.assertRaises(RuleError) as ctx:
            self.act('fusionar', w1['id'], confirmed=True)
        self.assertEqual(ctx.exception.status, 409)
        self.assertIn('pide 10 sellos', str(ctx.exception))

        # Ahora fusionamos a +1 y comprobamos mensaje de falta de material para +2 (Placa de Cascapedernal en Korven)
        self.state['seals'] = 100
        self.act('fusionar', w1['id'], confirmed=True)
        self.act('comprar', 'varita_aprendiz')
        with self.assertRaises(RuleError) as ctx:
            self.act('fusionar', w1['id'], confirmed=True)
        self.assertEqual(ctx.exception.status, 409)
        self.assertIn('Placa de Cascapedernal', str(ctx.exception))
        self.assertIn('Korven', str(ctx.exception))

    def test_consume_sellos_y_materiales_exactos(self):
        self.state['seals'] = 100
        self.act('comprar', 'varita_aprendiz')
        self.act('comprar', 'varita_aprendiz')
        # Proporcionar 8 espinas (pide 5 para +1)
        self.state['inventory'].append({'id': 'espina_espinajo', 'catalog_id': 'espina_espinajo', 'name': 'Espina de Espinajo', 'kind': 'material', 'quantity': 8})
        w1 = [i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'varita_aprendiz'][0]

        seals_before = self.state['seals']
        self.act('fusionar', w1['id'], confirmed=True)

        # Costo para varita (precio 40): 40 * 0.25 = 10 sellos
        self.assertEqual(self.state['seals'], seals_before - 10)
        # Materiales restantes: 8 - 5 = 3
        mat = next(i for i in self.state['inventory'] if (i.get('catalog_id') or i['id']) == 'espina_espinajo')
        self.assertEqual(mat['quantity'], 3)

    def test_confirmacion_muestra_costo_y_materiales(self):
        self.act('comprar', 'varita_aprendiz')
        self.act('comprar', 'varita_aprendiz')
        self.state['inventory'].append({'id': 'espina_espinajo', 'catalog_id': 'espina_espinajo', 'name': 'Espina de Espinajo', 'kind': 'material', 'quantity': 5})
        w1 = [i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'varita_aprendiz'][0]

        actions = self.engine.actions(self.character, self.world)
        fuse_act = next(a for a in actions if a['id'] == 'fusionar' and a['target'] == w1['id'])
        self.assertIn('10 sellos', fuse_act['label'])
        self.assertIn('+1', fuse_act['label'])
        self.assertIn('10 sellos', fuse_act['confirmation'])
        self.assertIn('5 Espina de Espinajo', fuse_act['confirmation'])
        self.assertFalse(fuse_act['disabled'])

    def test_valor_de_venta_y_potencia_suben(self):
        # Varita de aprendiz: precio catálogo 40, sell_price 14, daño 7
        self.act('comprar', 'varita_aprendiz')
        self.act('comprar', 'varita_aprendiz')
        self.act('comprar', 'varita_aprendiz')  # Tercera para permitir vender sin quedar desarmado
        self.state['inventory'].append({'id': 'espina_espinajo', 'catalog_id': 'espina_espinajo', 'name': 'Espina de Espinajo', 'kind': 'material', 'quantity': 5})
        w1 = [i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'varita_aprendiz'][0]

        self.act('fusionar', w1['id'], confirmed=True)
        upgraded = next(i for i in self.state['inventory'] if i['id'] == w1['id'])
        self.assertEqual(upgraded['fusion'], 1)

        # sell_price base 14 sube un 50% por nivel (+1 -> 21 sellos)
        self.assertEqual(upgraded['sell_price'], 21)

        # Al vender la pieza fusionada, se cobra el nuevo sell_price
        seals_before = self.state['seals']
        self.act('vender', upgraded['id'], confirmed=True)
        self.assertEqual(self.state['seals'], seals_before + 21)

    def test_fusion_valida_armaduras_y_bloqueo(self):
        # Dos piezas de armadura en stack + 5 materiales
        self.state['inventory'].append({
            'id': 'gorro_cuero', 'catalog_id': 'gorro_cuero', 'name': 'Gorro de cuero',
            'kind': 'armor', 'slot': 'cabeza', 'armor_reduction': 0.04, 'quantity': 2, 'condition': 'intact', 'price': 30, 'sell_price': 10
        })
        self.state['inventory'].append({'id': 'espina_espinajo', 'catalog_id': 'espina_espinajo', 'name': 'Espina de Espinajo', 'kind': 'material', 'quantity': 5})
        self.act('fusionar', 'gorro_cuero', confirmed=True)
        armor = next(i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'gorro_cuero')
        self.assertEqual(armor['fusion'], 1)
        self.assertEqual(armor['name'], 'Gorro de cuero +1')
        self.assertEqual(armor['quantity'], 1)
        self.assertEqual(armor['sell_price'], 15)  # 10 * 1.5

        # Dos piezas de bloqueo
        self.state['inventory'].append({'id': 'escudo_madera:1', 'catalog_id': 'escudo_madera', 'name': 'Escudo de madera', 'kind': 'block', 'quantity': 1, 'condition': 'intact', 'price': 30, 'sell_price': 10})
        self.state['inventory'].append({'id': 'escudo_madera:2', 'catalog_id': 'escudo_madera', 'name': 'Escudo de madera', 'kind': 'block', 'quantity': 1, 'condition': 'intact', 'price': 30, 'sell_price': 10})
        self.state['inventory'].append({'id': 'espina_espinajo', 'catalog_id': 'espina_espinajo', 'name': 'Espina de Espinajo', 'kind': 'material', 'quantity': 5})
        self.act('fusionar', 'escudo_madera:1', confirmed=True)
        shield = next(i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'escudo_madera')
        self.assertEqual(shield['fusion'], 1)
        self.assertEqual(shield['name'], 'Escudo de madera +1')
        self.assertEqual(shield['sell_price'], 15)

    def test_maximo_mas_tres(self):
        self.state['inventory'].append({
            'id': 'punal_camino:1', 'catalog_id': 'punal_camino', 'name': 'Puñal de camino +3',
            'kind': 'weapon', 'damage': 6, 'fusion': 3, 'quantity': 1, 'condition': 'intact'
        })
        self.state['inventory'].append({
            'id': 'punal_camino:2', 'catalog_id': 'punal_camino', 'name': 'Puñal de camino',
            'kind': 'weapon', 'damage': 6, 'quantity': 1, 'condition': 'intact'
        })
        actions = self.engine.actions(self.character, self.world)
        self.assertFalse(any(a['id'] == 'fusionar' and a['target'] == 'punal_camino:1' for a in actions))

        with self.assertRaises(RuleError) as ctx:
            self.act('fusionar', 'punal_camino:1', confirmed=True)
        self.assertIn('máximo', str(ctx.exception))
        self.assertEqual(ctx.exception.status, 409)

    def test_rechaza_objetos_distintos_o_uno_solo(self):
        sword = self.state['inventory'][0]
        with self.assertRaises(RuleError) as ctx:
            self.act('fusionar', sword['id'], confirmed=True)
        self.assertIn('dos objetos iguales', str(ctx.exception))

        self.state['inventory'].append({
            'id': 'provision_basica', 'catalog_id': 'provision_basica', 'name': 'Provisión básica',
            'kind': 'consumable', 'quantity': 2
        })
        with self.assertRaises(RuleError) as ctx:
            self.act('fusionar', 'provision_basica', confirmed=True)
        self.assertIn('armas, armaduras o escudos', str(ctx.exception))

    def test_bonificacion_aplicada(self):
        weapon_base = {'id': 'w_base', 'catalog_id': 'espada_test', 'name': 'Espada prueba', 'kind': 'weapon', 'damage': 10, 'quantity': 1}
        weapon_fused = {'id': 'w_fused', 'catalog_id': 'espada_test', 'name': 'Espada prueba +1', 'kind': 'weapon', 'damage': 10, 'fusion': 1, 'quantity': 1}
        self.state['inventory'].extend([weapon_base, weapon_fused])

        self.state['equipment']['weapon'] = 'w_base'
        combat = {'profile': {'hp': 100, 'level': 1, 'accuracy': 50, 'damage': 5, 'reduction': 0}, 'hp': 100, 'round': 0, 'intervention': {'id': 'atacar'}}
        self.state['combat'] = combat
        creature = {'id': 'test_creature', 'name': 'Rival de prueba'}
        m.resolve_round(self.state, creature, Zero(), respond=False)
        dmg_base = 100 - combat['hp']

        self.state['equipment']['weapon'] = 'w_fused'
        combat['hp'] = 100
        self.state['combat'] = combat
        m.resolve_round(self.state, creature, Zero(), respond=False)
        dmg_fused = 100 - combat['hp']
        self.assertEqual(dmg_fused, dmg_base + 2)

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
        # Case A: el arma equipada es el objetivo de fusión
        self.act('comprar', 'varita_aprendiz')
        self.act('comprar', 'varita_aprendiz')
        self.state['inventory'].append({'id': 'espina_espinajo', 'catalog_id': 'espina_espinajo', 'name': 'Espina de Espinajo', 'kind': 'material', 'quantity': 5})
        w1, w2 = [i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'varita_aprendiz']
        self.act('equipar', w1['id'])
        self.assertEqual(self.state['equipment']['weapon'], w1['id'])

        self.act('fusionar', w1['id'], confirmed=True)
        self.assertEqual(self.state['equipment']['weapon'], w1['id'])
        self.assertEqual(w1['fusion'], 1)

        # Case B: el arma consumida era la equipada
        self.act('comprar', 'espada_larga')
        self.act('comprar', 'espada_larga')
        self.state['inventory'].append({'id': 'espina_espinajo', 'catalog_id': 'espina_espinajo', 'name': 'Espina de Espinajo', 'kind': 'material', 'quantity': 5})
        e1, e2 = [i for i in self.state['inventory'] if (i.get('catalog_id') or i['id'].split(':')[0]) == 'espada_larga']
        self.act('equipar', e1['id'])
        self.assertEqual(self.state['equipment']['weapon'], e1['id'])

        self.act('fusionar', e2['id'], confirmed=True)
        self.assertEqual(self.state['equipment']['weapon'], e2['id'])
        self.assertEqual(e2['fusion'], 1)

    def test_parser_fusionar(self):
        self.state['inventory'].append({
            'id': 'dagas_gemelas:1', 'catalog_id': 'dagas_gemelas', 'name': 'Dagas gemelas',
            'kind': 'weapon', 'damage': 8, 'quantity': 1, 'condition': 'intact', 'price': 50
        })
        self.state['inventory'].append({
            'id': 'dagas_gemelas:2', 'catalog_id': 'dagas_gemelas', 'name': 'Dagas gemelas',
            'kind': 'weapon', 'damage': 8, 'quantity': 1, 'condition': 'intact', 'price': 50
        })
        self.state['inventory'].append({'id': 'espina_espinajo', 'catalog_id': 'espina_espinajo', 'name': 'Espina de Espinajo', 'kind': 'material', 'quantity': 5})
        intent = self.engine.parse_intent(self.character, self.world, {'text': 'fusionar dagas gemelas', 'confirmed': True})
        self.assertEqual(intent['id'], 'fusionar')
        self.assertEqual(intent['target'], 'dagas_gemelas:1')
        self.assertTrue(intent['confirmed'])

if __name__ == '__main__':
    unittest.main()
