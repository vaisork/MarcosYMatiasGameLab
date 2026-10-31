import test from 'node:test';
import assert from 'node:assert/strict';
import { avanzarReloj, crearPartida, finalizarPartida, iniciarBonus, DURACION, TOPE_CHURUS } from '../src/bonus_camioneta.mjs';
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

test('premio suma la cuenta exacta y persiste saldo y destino (la reja del parque)', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), churus: 41 });
  const partida = { ...crearPartida(), fase: 'fin', churus: 17 };
  const premio = finalizarPartida(almacen, partida);
  assert.equal(premio.guardado, true);
  assert.equal(cargar(almacen).estado.churus, 58);
  assert.equal(cargar(almacen).estado.progreso.escena, 'reja');
});

test('premio se limita a 30 y no se duplica al recargar la pantalla final', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), churus: 10 });
  const partida = { ...crearPartida(), fase: 'fin', churus: TOPE_CHURUS + 9 };
  assert.equal(finalizarPartida(almacen, partida).estado.churus, 40);
  assert.equal(finalizarPartida(almacen, partida).guardado, false);
  assert.equal(cargar(almacen).estado.churus, 40);
});

test('recorrido completo llega al resumen, muestra Churus y permite seguir', () => {
  class Nodo {
    constructor() { this.listeners = {}; this.style = {}; this.hidden = false; this.dataset = {}; this.textContent = ''; }
    addEventListener(tipo, fn) { this.listeners[tipo] = fn; }
    replaceChildren(...hijos) { this.replacementCount = (this.replacementCount || 0) + 1; this.children = hijos; }
    fire(tipo) { this.listeners[tipo]?.({ preventDefault() {}, currentTarget: this }); }
  }
  const nodos = new Map(['canvas', '#marcador', '#reloj', '#combustible', '#velo', '#sonido'].map((id) => [id, new Nodo()]));
  const gradiente = { addColorStop() {} };
  nodos.get('canvas').clientWidth = 390; nodos.get('canvas').clientHeight = 844;
  nodos.get('canvas').getContext = () => new Proxy({}, { get: (_, nombre) => {
    if (nombre === 'createLinearGradient' || nombre === 'createRadialGradient') return () => gradiente;
    return () => {};
  } });
  const documento = { querySelector: (id) => nodos.get(id), querySelectorAll: () => [], createElement: () => new Nodo() };
  const almacen = memoria(); guardar(almacen, { ...estadoNuevo(), churus: 5 });
  let frame, ahora = 0;
  const ventana = {
    localStorage: almacen, innerWidth: 390, innerHeight: 844, devicePixelRatio: 1, location: {},
    addEventListener() {}, removeEventListener() {}, requestAnimationFrame: (fn) => { frame = fn; return 1; },
    cancelAnimationFrame() {},
  };
  iniciarBonus(documento, ventana);
  for (ahora = 0; ahora <= 49_000 && frame; ahora += 50) { const siguiente = frame; frame = null; siguiente(ahora); }

  const velo = nodos.get('#velo');
  const [cuenta, titulo, premio, continuar] = velo.children;
  assert.equal(velo.replacementCount, 1);
  assert.equal(nodos.get('#reloj').textContent, '0');
  assert.equal(cuenta.hidden, true);
  assert.equal(titulo.hidden, false);
  assert.match(premio.textContent, /^Ganaste [1-9]\d* Churus$/);
  assert.equal(continuar.hidden, false);
  assert.equal(continuar.type, 'button');
  assert.equal(continuar.textContent, 'Seguir al desierto');
  assert.equal(cargar(almacen).estado.churus, 5 + Number(premio.textContent.match(/\d+/)[0]));
  continuar.fire('click');
  assert.equal(ventana.location.href, './index.html?cinematica=familia');
});
