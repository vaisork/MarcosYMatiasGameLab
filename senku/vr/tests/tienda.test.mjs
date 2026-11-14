import test from 'node:test';
import assert from 'node:assert/strict';
import { comprar, crearEstadoTienda } from '../src/tienda.mjs';

test('compra cuerda y aumenta el precio por nivel', () => {
  const primero = comprar({ churus: 120, niveles: crearEstadoTienda() }, 'cuerda');
  assert.deepEqual(primero, { churus: 80, niveles: { cuerda: 1, salto: 0, vuelo: 0 }, precio: 40 });
  const segundo = comprar(primero, 'cuerda');
  assert.equal(segundo.churus, 0);
  assert.equal(segundo.niveles.cuerda, 2);
  assert.equal(comprar(segundo, 'cuerda'), null);
});

test('compra salto y vuela una sola vez', () => {
  const salto = comprar({ churus: 30, niveles: crearEstadoTienda() }, 'salto');
  assert.equal(salto.niveles.salto, 1);
  assert.equal(comprar({ churus: 500, niveles: salto.niveles }, 'vuelo').niveles.vuelo, 1);
  assert.equal(comprar({ churus: 500, niveles: { ...salto.niveles, vuelo: 1 } }, 'vuelo'), null);
});

test('no compra si faltan churus o la mejora no existe', () => {
  const estado = { churus: 29, niveles: crearEstadoTienda() };
  assert.equal(comprar(estado, 'salto'), null);
  assert.equal(comprar(estado, 'inventada'), null);
  assert.equal(estado.churus, 29);
});
test('cuerda y salto topan en nivel 5', () => {
  assert.equal(comprar({ churus: 9999, niveles: { cuerda: 5 } }, 'cuerda'), null);
  assert.ok(comprar({ churus: 9999, niveles: { salto: 4 } }, 'salto'));
});
