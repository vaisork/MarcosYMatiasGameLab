import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { estadoNuevo, guardar, cargar } from '../src/core/store.mjs';
import { desdeLegacy, iniciar } from '../src/core/migracion.mjs';
import { TRAJES, normalizarTrajesDeLegacy } from '../src/data/trajes.mjs';
import { memoria } from './ayuda.mjs';

test('catálogo contiene los 14 trajes, precios acordados y rutas de arte existentes', () => {
  const precios = { explorador: 10, vaquero: 25, ninja: 50, magico: 75, especial: 100,
    chef: 120, mexicano: 150, espacial: 180, dinosaurio: 200, playa: 230, sigilo: 260, punk: 300 };
  assert.equal(Object.keys(TRAJES).length, 14);
  assert.deepEqual(Object.fromEntries(Object.entries(TRAJES).filter(([id]) => id !== 'original' && id !== 'rata').map(([id, t]) => [id, t.precio])), precios);
  assert.equal(TRAJES.original.siempreDesbloqueado, true);
  assert.equal(TRAJES.rata.siempreDesbloqueado, false);
  assert.deepEqual(TRAJES.rata.equivaleA, ['secreto_legacy']);
  for (const [id, traje] of Object.entries(TRAJES)) {
    assert.equal(traje.id, id);
    assert.equal(traje.precio, id in precios ? precios[id] : null);
    assert.equal(traje.condicion, id === 'rata' ? 'Encontrar y hablar con la rata de la taquería' : null);
    for (const campo of ['menu', 'sprite']) {
      assert.ok(traje[campo].startsWith('assets/personajes/'));
      assert.ok(fs.existsSync(new URL(`../${traje[campo]}`, import.meta.url)));
    }
  }
  assert.equal(TRAJES.original.nombre, 'Traje inicial');
  assert.equal(TRAJES.rata.nombre, 'Traje exclusivo');
  assert.match(TRAJES.rata.condicion, /hablar/);
});

test('original siempre está desbloqueado; normalizar no regala rata', () => {
  assert.deepEqual(normalizarTrajesDeLegacy(estadoNuevo()), estadoNuevo());
  assert.deepEqual(normalizarTrajesDeLegacy({ ...estadoNuevo(), trajes: [] }), estadoNuevo());
  const sinDesbloqueo = { ...estadoNuevo(), equipado: 'secreto_legacy' };
  assert.deepEqual(normalizarTrajesDeLegacy(sinDesbloqueo), estadoNuevo());
});

test('migración conserva rata equipada, compatibilidad y datos de progreso', () => {
  const estado = desdeLegacy(memoria({ senku_secret: '1', senku_skin: 'secret',
    senku_churus: '42', senku_collected: '["c1"]' }));
  const antes = structuredClone(estado);
  Object.freeze(estado.trajes);
  Object.freeze(estado);
  const nuevo = normalizarTrajesDeLegacy(estado);
  assert.equal(nuevo.equipado, 'rata');
  assert.deepEqual(nuevo.trajes, ['original', 'secreto_legacy', 'rata']);
  assert.equal(nuevo.churus, 42);
  assert.deepEqual(nuevo.coleccionados, ['c1']);
  assert.deepEqual(nuevo.progreso, estado.progreso);
  assert.deepEqual(nuevo.origen, { legacy: true });
  assert.notEqual(nuevo, estado);
  assert.notEqual(nuevo.trajes, estado.trajes);
  assert.deepEqual(estado, antes);
});

test('conceder rata marca compatibilidad y no fuerza equiparla', () => {
  const estado = { ...estadoNuevo(), trajes: ['original', 'rata'] };
  const nuevo = normalizarTrajesDeLegacy(estado);
  assert.deepEqual(nuevo.trajes, ['original', 'rata', 'secreto_legacy']);
  assert.equal(nuevo.equipado, 'original');
  assert.deepEqual(estado.trajes, ['original', 'rata']);
});

test('normalización idempotente sin duplicados, conserva otros desbloqueos', () => {
  const estado = { ...estadoNuevo(), trajes: ['original', 'secreto_legacy', 'rata', 'rata', 'otro'], equipado: 'otro' };
  const primero = normalizarTrajesDeLegacy(estado);
  const segundo = normalizarTrajesDeLegacy(primero);
  assert.deepEqual(primero.trajes, ['original', 'secreto_legacy', 'rata', 'otro']);
  assert.equal(primero.equipado, 'otro');
  assert.deepEqual(segundo, primero);
  assert.notEqual(segundo, primero);
});

test('el consumidor puede normalizar después de iniciar, guardar y recargar sin tocar Legacy', () => {
  const legacy = { senku_secret: '1', senku_skin: 'secret', senku_churus: '8' };
  const almacen = memoria(legacy);
  const estado = normalizarTrajesDeLegacy(iniciar(almacen).estado);
  assert.equal(guardar(almacen, estado), true);
  assert.deepEqual(cargar(almacen).estado, estado);
  assert.deepEqual(normalizarTrajesDeLegacy(iniciar(almacen).estado), estado);
  for (const [clave, valor] of Object.entries(legacy)) assert.equal(almacen.getItem(clave), valor);
});

test('normalizar rechaza listas inválidas sin lanzar', () => {
  for (const estado of [null, undefined, [], {}, { trajes: null }, { trajes: [3] }, { trajes: [''] }]) {
    assert.deepEqual(normalizarTrajesDeLegacy(estado), { error: 'estado_invalido' });
  }
});
