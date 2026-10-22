import test from 'node:test';
import assert from 'node:assert/strict';
import { CLAVE } from '../src/core/store.mjs';
import { CLAVES_LEGACY, hayLegacy, desdeLegacy, iniciar } from '../src/core/migracion.mjs';
import { memoria } from './ayuda.mjs';

const legacy = { senku_churus: '42', senku_skin: 'secret', senku_secret: '1', senku_collected: '["c1","c2","c1"]' };

test('sin Legacy ni guardado: partida nueva', () => {
  const a = memoria(); const r = iniciar(a);
  assert.equal(r.origen, 'nuevo'); assert.equal(r.estado.churus, 0); assert.equal(r.estado.origen.legacy, false);
});
test('migra Churus, traje secreto equipado y recolectables', () => {
  const e = desdeLegacy(memoria(legacy));
  assert.equal(e.churus, 42);
  assert.deepEqual(e.trajes, ['original', 'secreto_legacy']);
  assert.equal(e.equipado, 'secreto_legacy');
  assert.deepEqual(e.coleccionados, ['c1', 'c2']);
  assert.equal(e.origen.legacy, true);
});
test('traje dorado de Legacy no se migra como traje', () => {
  const e = desdeLegacy(memoria({ senku_churus: '500', senku_skin: 'gold' }));
  assert.deepEqual(e.trajes, ['original']); assert.equal(e.equipado, 'original');
});
test('heredarChurus=false deja el saldo en 0 pero conserva lo demás', () => {
  const e = desdeLegacy(memoria(legacy), { heredarChurus: false });
  assert.equal(e.churus, 0); assert.equal(e.equipado, 'secreto_legacy');
});
test('traje equipado "secret" sin desbloqueo se ignora', () => {
  const e = desdeLegacy(memoria({ senku_skin: 'secret' }));
  assert.equal(e.equipado, 'original');
});
test('migración de una sola vez: la segunda carga usa el guardado propio', () => {
  const a = memoria(legacy);
  assert.equal(iniciar(a).origen, 'legacy');
  a.setItem('senku_churus', '999'); // Legacy sigue jugándose; no debe volver a migrarse
  const r = iniciar(a);
  assert.equal(r.origen, 'guardado'); assert.equal(r.estado.churus, 42);
});
test('nunca escribe claves de Legacy', () => {
  const a = memoria(legacy); const escritas = [];
  const espia = { getItem: a.getItem, setItem: (k, v) => { escritas.push(k); a.setItem(k, v); } };
  iniciar(espia);
  assert.deepEqual(escritas, [CLAVE]);
  for (const c of CLAVES_LEGACY) assert.equal(a.getItem(c), legacy[c]);
});
test('datos de Legacy rotos no rompen la migración', () => {
  const e = desdeLegacy(memoria({ senku_churus: 'abc', senku_collected: '{no' }));
  assert.equal(e.churus, 0); assert.deepEqual(e.coleccionados, []);
});
test('guardado corrupto o futuro: partida nueva SIN sobrescribir', () => {
  const a = memoria({ [CLAVE]: '{no', ...legacy });
  const r = iniciar(a);
  assert.equal(r.origen, 'nuevo_sin_guardar'); assert.equal(a.getItem(CLAVE), '{no');
});
test('hayLegacy con almacenamiento bloqueado', () => {
  assert.equal(hayLegacy({ getItem() { throw new Error('x'); } }), false);
});
