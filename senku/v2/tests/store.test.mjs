import test from 'node:test';
import assert from 'node:assert/strict';
import { memoria } from './ayuda.mjs';
import { CLAVE, VERSION, estadoNuevo, normalizar, cargar, guardar, almacenDelNavegador } from '../src/core/store.mjs';

const bloqueado = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); } };

test('estado nuevo es válido y estable', () => {
  assert.deepEqual(normalizar(estadoNuevo()), estadoNuevo());
});
test('guardar y cargar ida y vuelta', () => {
  const a = memoria(); const e = { ...estadoNuevo(), churus: 12, coleccionados: ['a', 'b'] };
  assert.equal(guardar(a, e), true);
  assert.deepEqual(cargar(a).estado, e);
});
test('almacenamiento bloqueado: no lanza', () => {
  assert.equal(guardar(bloqueado, estadoNuevo()), false);
  assert.equal(cargar(bloqueado).motivo, 'almacenamiento_bloqueado');
});
test('JSON corrupto y datos inválidos', () => {
  assert.equal(cargar(memoria({ [CLAVE]: '{no' })).motivo, 'corrupto');
  assert.equal(cargar(memoria({ [CLAVE]: '[1]' })).motivo, 'invalido');
});
test('versión futura no se interpreta ni se pisa', () => {
  const a = memoria({ [CLAVE]: JSON.stringify({ version: VERSION + 1, churus: 5 }) });
  assert.equal(cargar(a).motivo, 'version_futura');
});
test('normalizar repara valores raros', () => {
  const e = normalizar({ version: 1, churus: -3, trajes: ['x', 'x', 3], equipado: 'no_tengo', coleccionados: 'mal' });
  assert.equal(e.churus, 0);
  assert.deepEqual(e.trajes, ['original', 'x']);
  assert.equal(e.equipado, 'original');
  assert.deepEqual(e.coleccionados, []);
});
test('guardar rechaza estado inválido', () => {
  assert.equal(guardar(memoria(), { version: 99 }), false);
});
test('almacenDelNavegador devuelve null si localStorage falla', () => {
  assert.equal(almacenDelNavegador({ get localStorage() { throw new Error('x'); } }), null);
  assert.equal(almacenDelNavegador({}), null);
});
