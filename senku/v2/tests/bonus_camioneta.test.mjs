import test from 'node:test';
import assert from 'node:assert/strict';
import { avanzarReloj, crearPartida, finalizarPartida, DURACION, TOPE_CHURUS } from '../src/bonus_camioneta.mjs';
import { cargar, estadoNuevo, guardar } from '../src/core/store.mjs';
import { memoria } from './ayuda.mjs';

test('cuenta 3 segundos y corre 45 segundos exactos antes del resumen', () => {
  let partida = crearPartida();
  partida = avanzarReloj(partida, 3);
  assert.equal(partida.fase, 'jugando');
  assert.equal(partida.restante, DURACION);
  partida = avanzarReloj(partida, 44.99);
  assert.equal(partida.fase, 'jugando');
  partida = avanzarReloj(partida, 0.01);
  assert.equal(partida.fase, 'fin');
  assert.equal(partida.restante, 0);
  assert.equal(avanzarReloj(partida, 3).fase, 'fin');
});

test('premio suma la cuenta exacta y persiste saldo y destino del desierto', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), churus: 41 });
  const partida = { ...crearPartida(), fase: 'fin', churus: 17 };
  const premio = finalizarPartida(almacen, partida);
  assert.equal(premio.guardado, true);
  assert.equal(cargar(almacen).estado.churus, 58);
  assert.equal(cargar(almacen).estado.progreso.escena, 'desierto');
});

test('premio se limita a 30 y no se duplica al recargar la pantalla final', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), churus: 10 });
  const partida = { ...crearPartida(), fase: 'fin', churus: TOPE_CHURUS + 9 };
  assert.equal(finalizarPartida(almacen, partida).estado.churus, 40);
  assert.equal(finalizarPartida(almacen, partida).guardado, false);
  assert.equal(cargar(almacen).estado.churus, 40);
});
