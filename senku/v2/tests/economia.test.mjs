import test from 'node:test';
import assert from 'node:assert/strict';
import { estadoNuevo, guardar, cargar } from '../src/core/store.mjs';
import { desdeLegacy } from '../src/core/migracion.mjs';
import { ganarChurus, gastarChurus, comprarTraje, equipar } from '../src/core/economia.mjs';
import { TRAJES } from '../src/data/trajes.mjs';
import { memoria } from './ayuda.mjs';

// Cifras solo para pruebas de aritmética: no son decisiones de precios del juego.
const catalogo = { ...TRAJES, rata: { ...TRAJES.rata, precio: 7 } };
const conSaldo = (churus = 10) => ({ ...estadoNuevo(), churus });
const invalidas = [-1, 0.5, NaN, Infinity, -Infinity, '1', null, undefined, true, 1n, {}, Number.MAX_SAFE_INTEGER + 1];

function congelar(estado) {
  for (const valor of Object.values(estado)) if (valor && typeof valor === 'object') Object.freeze(valor);
  return Object.freeze(estado);
}

test('ganar acredita fuentes distintas una sola vez, incluso después de guardar y cargar', () => {
  const inicial = conSaldo();
  const primero = ganarChurus(inicial, 3, 'taqueria/churu-1');
  const segundo = ganarChurus(primero, 2, 'taqueria/churu-2');
  assert.equal(segundo.churus, 15);
  assert.deepEqual(segundo.coleccionados, ['taqueria/churu-1', 'taqueria/churu-2']);
  assert.deepEqual(ganarChurus(segundo, 99, 'taqueria/churu-1'), { error: 'fuente_duplicada' });
  const almacen = memoria();
  assert.equal(guardar(almacen, segundo), true);
  assert.deepEqual(ganarChurus(cargar(almacen).estado, 3, 'taqueria/churu-1'), { error: 'fuente_duplicada' });
  assert.deepEqual(inicial, conSaldo());
});

test('una fuente heredada de Legacy no puede cobrarse otra vez', () => {
  const estado = desdeLegacy(memoria({ senku_collected: '["c1"]', senku_churus: '4' }));
  assert.deepEqual(ganarChurus(estado, 5, 'c1'), { error: 'fuente_duplicada' });
  assert.equal(estado.churus, 4);
});

test('gastar nunca produce saldo negativo; admite gastar exactamente el saldo', () => {
  for (let saldo = 0; saldo <= 10; saldo++) {
    const estado = congelar(conSaldo(saldo));
    for (let cantidad = 0; cantidad <= 11; cantidad++) {
      const resultado = gastarChurus(estado, cantidad);
      if (cantidad > saldo) assert.deepEqual(resultado, { error: 'saldo_insuficiente' });
      else assert.equal(resultado.churus, saldo - cantidad);
    }
    assert.equal(estado.churus, saldo);
  }
});

test('cantidades no enteras, negativas o no numéricas se rechazan sin lanzar', () => {
  const estado = congelar(conSaldo());
  for (const cantidad of invalidas) {
    assert.deepEqual(ganarChurus(estado, cantidad, 'c1'), { error: 'cantidad_invalida' });
    assert.deepEqual(gastarChurus(estado, cantidad), { error: 'cantidad_invalida' });
  }
  assert.deepEqual(estado, conSaldo());
});

test('cero es válido y consume su fuente; fallos no consumen fuentes', () => {
  const estado = conSaldo();
  assert.deepEqual(ganarChurus(estado, -1, 'c1'), { error: 'cantidad_invalida' });
  const cero = ganarChurus(estado, 0, 'c1');
  assert.equal(cero.churus, estado.churus);
  assert.deepEqual(ganarChurus(cero, 1, 'c1'), { error: 'fuente_duplicada' });
  const gasto = gastarChurus(estado, 0);
  assert.deepEqual(gasto, estado);
  assert.notEqual(gasto, estado);
});

test('ids de fuente vacíos o de otro tipo se rechazan', () => {
  for (const id of ['', ' ', null, undefined, 1, {}, [], Symbol('c1')]) {
    assert.deepEqual(ganarChurus(conSaldo(), 1, id), { error: 'fuente_invalida' });
  }
});

test('límites enteros seguros evitan pérdida de precisión del saldo', () => {
  const estado = conSaldo(Number.MAX_SAFE_INTEGER - 1);
  const lleno = ganarChurus(estado, 1, 'c1');
  assert.equal(lleno.churus, Number.MAX_SAFE_INTEGER);
  assert.deepEqual(ganarChurus(lleno, 1, 'c2'), { error: 'saldo_fuera_de_rango' });
  assert.deepEqual(lleno.coleccionados, ['c1']);
  assert.equal(gastarChurus(lleno, Number.MAX_SAFE_INTEGER).churus, 0);
});

test('compra descuenta una vez, desbloquea ambas identidades y no cambia el equipado', () => {
  const inicial = congelar(conSaldo(7));
  const comprado = comprarTraje(inicial, 'rata', catalogo);
  assert.equal(comprado.churus, 0);
  assert.deepEqual(comprado.trajes, ['original', 'rata', 'secreto_legacy']);
  assert.equal(comprado.equipado, 'original');
  const repetido = comprarTraje(congelar(comprado), 'rata', catalogo);
  assert.deepEqual(repetido, comprado);
  assert.notEqual(repetido, comprado);
  const almacen = memoria();
  assert.equal(guardar(almacen, comprado), true);
  assert.deepEqual(comprarTraje(cargar(almacen).estado, 'rata', catalogo), comprado);
});

test('poseer secreto_legacy impide volver a pagar por rata y conserva equipado', () => {
  const estado = desdeLegacy(memoria({ senku_secret: '1', senku_skin: 'secret' }));
  const resultado = comprarTraje(estado, 'rata', catalogo);
  assert.equal(resultado.churus, 0);
  assert.equal(resultado.equipado, 'rata');
  assert.ok(resultado.trajes.includes('secreto_legacy'));
});

test('saldo insuficiente no desbloquea ni descuenta parcialmente', () => {
  const estado = congelar(conSaldo(6));
  assert.deepEqual(comprarTraje(estado, 'rata', catalogo), { error: 'saldo_insuficiente' });
  assert.deepEqual(estado, conSaldo(6));
});

test('precio null siempre bloquea la compra sin cambiar nada', () => {
  const estado = congelar(conSaldo());
  assert.deepEqual(comprarTraje(estado, 'rata', TRAJES), { error: 'precio_no_definido' });
  assert.deepEqual(comprarTraje(estado, 'original'), { error: 'precio_no_definido' });
  assert.deepEqual(comprarTraje(comprarTraje(estado, 'rata', catalogo), 'rata', TRAJES), { error: 'precio_no_definido' });
  assert.deepEqual(estado, conSaldo());
});

test('precios inválidos no desbloquean ni alteran el saldo; precio cero sí es válido', () => {
  const estado = congelar(conSaldo());
  for (const precio of invalidas.filter((v) => v !== null)) {
    assert.deepEqual(comprarTraje(estado, 'rata', { rata: { precio } }), { error: 'precio_invalido' });
  }
  const gratis = comprarTraje(estado, 'rata', { rata: { precio: 0 } });
  assert.equal(gratis.churus, estado.churus);
  assert.ok(gratis.trajes.includes('rata'));
  assert.deepEqual(estado, conSaldo());
});

test('catálogos malformados e ids desconocidos no lanzan ni usan propiedades heredadas', () => {
  for (const valor of [null, [], 3, 'rata']) {
    assert.deepEqual(comprarTraje(conSaldo(), 'rata', valor), { error: 'catalogo_invalido' });
  }
  for (const traje of [null, [], 7, 'rata']) {
    assert.deepEqual(comprarTraje(conSaldo(), 'rata', { rata: traje }), { error: 'catalogo_invalido' });
  }
  for (const id of ['desconocido', 'toString', '__proto__', '', ' ', undefined, null, {}, Symbol('rata')]) {
    assert.deepEqual(comprarTraje(conSaldo(), id, catalogo), { error: 'traje_desconocido' });
    assert.deepEqual(equipar(conSaldo(), id), { error: 'traje_desconocido' });
  }
  assert.deepEqual(comprarTraje(conSaldo(), 'rata', Object.create(catalogo)), { error: 'traje_desconocido' });
});

test('equipar exige desbloqueo, resuelve el alias y permite volver a original', () => {
  assert.deepEqual(equipar(conSaldo(), 'rata'), { error: 'traje_bloqueado' });
  const comprado = comprarTraje(conSaldo(), 'rata', catalogo);
  const equipado = equipar(comprado, 'rata');
  assert.equal(equipado.equipado, 'rata');
  assert.equal(equipado.churus, comprado.churus);
  assert.deepEqual(equipar(comprado, 'secreto_legacy'), equipado);
  assert.equal(equipar(equipado, 'original').equipado, 'original');
  const desconocido = { ...conSaldo(), trajes: ['original', 'inventado'] };
  assert.deepEqual(equipar(desconocido, 'inventado'), { error: 'traje_desconocido' });
});

test('todas las operaciones conservan el estado de entrada y sus datos ajenos', () => {
  const estado = congelar({ ...conSaldo(), progreso: { escena: 'otra' }, origen: { legacy: true } });
  const antes = structuredClone(estado);
  for (const resultado of [ganarChurus(estado, 1, 'c1'), gastarChurus(estado, 1),
    comprarTraje(estado, 'rata', catalogo), equipar(estado, 'original')]) {
    assert.notEqual(resultado, estado);
    assert.deepEqual(resultado.progreso, antes.progreso);
    assert.deepEqual(resultado.origen, antes.origen);
    assert.equal(resultado.version, estado.version);
  }
  assert.deepEqual(estado, antes);
});

test('estados inválidos no lanzan ni se convierten en créditos', () => {
  const estados = [null, undefined, [], {}, 1, 'estado',
    ...invalidas.map((churus) => ({ ...estadoNuevo(), churus })),
    { ...conSaldo(), version: 2 }, { ...conSaldo(), coleccionados: null },
    { ...conSaldo(), coleccionados: [1] }, { ...conSaldo(), trajes: null },
    { ...conSaldo(), trajes: [1] }];
  for (const estado of estados) {
    assert.deepEqual(ganarChurus(estado, 1, 'c1'), { error: 'estado_invalido' });
    assert.deepEqual(gastarChurus(estado, 1), { error: 'estado_invalido' });
    assert.deepEqual(comprarTraje(estado, 'rata', catalogo), { error: 'estado_invalido' });
    assert.deepEqual(equipar(estado, 'original'), { error: 'estado_invalido' });
  }
});
