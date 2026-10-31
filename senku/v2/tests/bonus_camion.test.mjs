import test from 'node:test';
import assert from 'node:assert/strict';
import {
  avanzarMundo,
  avanzarReloj,
  crearPartida,
  finalizarPartida,
  iniciarBonus,
  nivelEnCamion,
  CAPAS_PARALAJE,
  DURACION,
  TIPOS_OBSTACULO,
  TOPE_CHURUS,
} from '../src/bonus_camion.mjs';
import { arrancarSenku2 } from '../src/main.mjs';
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

test('premio suma la cuenta exacta y persiste saldo y destino de la taquería', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), churus: 19, progreso: { escena: 'ciudad' } });
  const partida = { ...crearPartida(), fase: 'fin', churus: 14 };
  const premio = finalizarPartida(almacen, partida);
  assert.equal(premio.guardado, true);
  assert.equal(cargar(almacen).estado.churus, 33);
  assert.equal(cargar(almacen).estado.progreso.escena, 'taqueria');
});

test('premio se limita a 30 y no se duplica al recargar la pantalla final', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), churus: 12 });
  const partida = { ...crearPartida(), fase: 'fin', churus: TOPE_CHURUS + 11 };
  assert.equal(finalizarPartida(almacen, partida).estado.churus, 42);
  assert.equal(finalizarPartida(almacen, partida).guardado, false);
  assert.equal(cargar(almacen).estado.churus, 42);
});

test('Senku salta entre cajas bajas, cajas medias y techo del camión con partículas y esquiva obstáculos', () => {
  assert.equal(CAPAS_PARALAJE, 3);
  assert.deepEqual(TIPOS_OBSTACULO, ['letrero', 'rama', 'cable']);
  assert.equal(nivelEnCamion(0.2), 0);
  assert.equal(nivelEnCamion(0.5), 1);
  assert.equal(nivelEnCamion(0.8), 2);

  const partida = { ...crearPartida(), fase: 'jugando' };
  avanzarMundo(partida, 0.4, { derecha: true, salto: true }, 390);
  assert.ok(partida.salto > 0, 'inicia salto sobre el camión');
  assert.ok(partida.particulas.length > 0, 'emite partículas al saltar');

  // Colisión con letrero, rama o cable sin salto produce sacudida e invulnerabilidad
  const conObstaculo = {
    ...crearPartida(),
    fase: 'jugando',
    senkuX: 0.48,
    nivel: 1,
    salto: 0,
    objetos: [{ tipo: 'letrero', x: 390 * (0.15 + 0.48 * 0.45), nivel: 1, altura: 26, recogido: false }],
  };
  avanzarMundo(conObstaculo, 0.01, {}, 390);
  assert.ok(conObstaculo.sacudida > 0);
  assert.ok(conObstaculo.invulnerable > 0);
});

test('recorrido completo llega al resumen, muestra Churus y permite seguir a la taquería', () => {
  class Nodo {
    constructor() {
      this.listeners = {};
      this.style = {};
      this.hidden = false;
      this.dataset = {};
      this.textContent = '';
    }
    addEventListener(tipo, fn) { this.listeners[tipo] = fn; }
    replaceChildren(...hijos) {
      this.replacementCount = (this.replacementCount || 0) + 1;
      this.children = hijos;
    }
    fire(tipo) { this.listeners[tipo]?.({ preventDefault() {}, currentTarget: this }); }
  }
  const nodos = new Map(['canvas', '#marcador', '#reloj', '#combustible', '#velo', '#sonido'].map((id) => [id, new Nodo()]));
  const gradiente = { addColorStop() {} };
  nodos.get('canvas').clientWidth = 390;
  nodos.get('canvas').clientHeight = 844;
  nodos.get('canvas').getContext = () => new Proxy({}, {
    get: (_, nombre) => {
      if (nombre === 'createLinearGradient' || nombre === 'createRadialGradient') return () => gradiente;
      return () => {};
    },
  });
  const documento = {
    querySelector: (id) => nodos.get(id),
    querySelectorAll: () => [],
    createElement: () => new Nodo(),
  };
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), churus: 7 });
  let frame;
  let ahora = 0;
  const ventana = {
    localStorage: almacen,
    innerWidth: 390,
    innerHeight: 844,
    devicePixelRatio: 1,
    location: {},
    addEventListener() {},
    removeEventListener() {},
    requestAnimationFrame: (fn) => { frame = fn; return 1; },
    cancelAnimationFrame() {},
  };
  iniciarBonus(documento, ventana);
  for (ahora = 0; ahora <= 49_000 && frame; ahora += 50) {
    const siguiente = frame;
    frame = null;
    siguiente(ahora);
  }

  const velo = nodos.get('#velo');
  const [cuenta, consejo, titulo, premio, continuar] = velo.children;
  assert.equal(velo.replacementCount, 1);
  assert.equal(nodos.get('#reloj').textContent, '0');
  assert.equal(cuenta.hidden, true);
  assert.match(consejo.textContent, /juntar churus/i);
  assert.equal(titulo.hidden, false);
  assert.match(premio.textContent, /^Ganaste [1-9]\d* Churus$/);
  assert.equal(continuar.hidden, false);
  assert.equal(continuar.type, 'button');
  assert.equal(continuar.textContent, 'Seguir a la taquería');
  assert.equal(cargar(almacen).estado.churus, 7 + Number(premio.textContent.match(/\d+/)[0]));
  assert.equal(cargar(almacen).estado.progreso.escena, 'taqueria');
  continuar.fire('click');
  assert.equal(ventana.location.href, './index.html');
});

test('conexión ciudad → camión: al subir al camión en la ciudad abre bonus-camion.html', () => {
  const almacen = memoria();
  const eventos = {};
  const elementos = {
    'lienzo-juego': { getContext: () => null, style: {}, setAttribute() {} },
    'btn-subir': { hidden: true },
    'aviso-viaje': { hidden: true, textContent: '' },
  };
  const documento = {
    getElementById: (id) => elementos[id] || null,
    querySelector: () => null,
    body: {},
  };
  const ventana = {
    localStorage: almacen,
    location: { href: '', search: '?escena=ciudad' },
    addEventListener: (tipo, fn) => { (eventos[tipo] ||= []).push(fn); },
    removeEventListener() {},
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
  };
  const juego = arrancarSenku2({ documento, ventana });
  assert.equal(juego.escena.id, 'ciudad');
  Object.assign(juego.senku, { x: 1040, y: 558, vy: 0 });
  juego.avanzarPaso(0);
  assert.equal(elementos['btn-subir'].hidden, false);
  assert.equal(juego.intentarSubir(), true);
  juego.avanzarPaso(2.5);
  assert.match(juego.avisoViaje(), /sube al camión/);
  juego.avanzarPaso(3);
  assert.equal(ventana.location.href, './bonus-camion.html');
  juego.detener();
});
