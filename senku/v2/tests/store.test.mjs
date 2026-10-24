import test from 'node:test';
import assert from 'node:assert/strict';
import { memoria } from './ayuda.mjs';
import { CLAVE, VERSION, estadoNuevo, normalizar, cargar, guardar, almacenDelNavegador } from '../src/core/store.mjs';

const bloqueado = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); } };

test('estado nuevo es válido y estable', () => {
  assert.deepEqual(normalizar(estadoNuevo()), estadoNuevo());
});
test('guardar y cargar ida y vuelta', () => {
  const a = memoria();
  const e = {
    ...estadoNuevo(), churus: 12, coleccionados: ['objeto-prueba-a', 'objeto-prueba-b'],
    habilidades: { disparar: true, lanzagranadas: true },
    trajes: ['original', 'rata'], equipado: 'rata',
    progreso: { escena: 'desierto' }, origen: { legacy: true },
  };
  assert.equal(guardar(a, e), true);
  const persistido = JSON.parse(a.getItem(CLAVE));
  assert.deepEqual(persistido, e);
  assert.deepEqual(cargar(a).estado, e);
  // Cambiar los objetos en memoria no modifica la partida ya serializada.
  e.churus = 99;
  e.coleccionados.push('sin-guardar');
  const cargado = cargar(a).estado;
  assert.deepEqual(cargado, persistido);
  cargado.habilidades.disparar = false;
  cargado.progreso.escena = 'taqueria';
  assert.deepEqual(cargar(a).estado, persistido);
});
test('almacenamiento bloqueado: no lanza', () => {
  assert.equal(guardar(bloqueado, estadoNuevo()), false);
  assert.equal(cargar(bloqueado).motivo, 'almacenamiento_bloqueado');
});
test('JSON corrupto y datos inválidos', () => {
  for (const crudo of ['', '  ', '{no']) {
    assert.deepEqual(cargar(memoria({ [CLAVE]: crudo })), { estado: null, motivo: 'corrupto' });
  }
  for (const datos of [null, false, 42, '', [], {}, { version: 0 }, { version: '1' }]) {
    assert.deepEqual(cargar(memoria({ [CLAVE]: JSON.stringify(datos) })), { estado: null, motivo: 'invalido' });
  }
});
test('sin partida guardada: devuelve un motivo sin lanzar ni escribir', () => {
  const a = memoria();
  assert.deepEqual(cargar(a), { estado: null, motivo: 'sin_guardado' });
  assert.equal(a.getItem(CLAVE), null);
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
