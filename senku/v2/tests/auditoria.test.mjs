// Auditoría 30/10/2026: un caso por cada error corregido en main.mjs, el bonus y el index.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { arrancarSenku2 } from '../src/main.mjs';
import { cargar, guardar, estadoNuevo } from '../src/core/store.mjs';
import { golpearJefe } from '../src/core/jefe_gato.mjs';
import { memoria } from './ayuda.mjs';

function elementoFalso(extra = {}) {
  const oyentes = {};
  return {
    hidden: true, textContent: '', style: {}, oyentes,
    setAttribute() {}, removeAttribute() {}, focus() {}, remove() {}, before() {},
    addEventListener: (tipo, fn) => { (oyentes[tipo] ||= []).push(fn); },
    removeEventListener: (tipo, fn) => { oyentes[tipo] = (oyentes[tipo] || []).filter((f) => f !== fn); },
    querySelector: () => null,
    ...extra,
  };
}

function iniciar(almacen = memoria(), search = '') {
  const lienzo = elementoFalso({ getContext: () => null });
  const elementos = {
    'lienzo-juego': lienzo, 'btn-subir': elementoFalso(), 'btn-gancho': elementoFalso(),
    'aviso-viaje': elementoFalso(),
  };
  const capas = [];
  const documento = {
    getElementById: (id) => elementos[id] || null,
    querySelector: () => null,
    createElement: () => {
      const botones = { '#final-seguir': elementoFalso(), '#final-volver': elementoFalso() };
      const capa = elementoFalso({ querySelector: (sel) => botones[sel] || null, botones });
      capas.push(capa);
      return capa;
    },
    body: { appendChild() {} },
  };
  const oyentes = {};
  const temporizadores = [];
  const ventana = {
    localStorage: almacen,
    location: { href: '', search },
    addEventListener: (tipo, fn) => { (oyentes[tipo] ||= []).push(fn); },
    removeEventListener: (tipo, fn) => { oyentes[tipo] = (oyentes[tipo] || []).filter((f) => f !== fn); },
    requestAnimationFrame: () => 1, cancelAnimationFrame() {},
    setTimeout: (fn) => { temporizadores.push(fn); return temporizadores.length; }, clearTimeout() {},
    setInterval: () => 1, clearInterval() {},
  };
  const juego = arrancarSenku2({ documento, ventana });
  const tecla = (code) => { for (const fn of oyentes.keydown || []) fn({ code, key: code, preventDefault() {} }); };
  return { juego, elementos, ventana, oyentes, temporizadores, capas, tecla, lienzo };
}

function conLlave() {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), coleccionados: ['llave-camioneta'] });
  return almacen;
}

test('al abordar la camioneta, saltar (Espacio) o tocar la pantalla no se brinca el bonus', () => {
  const { juego, ventana, tecla, lienzo } = iniciar(conLlave());
  Object.assign(juego.senku, { x: 150, y: 510, vy: 0 });
  juego.avanzarPaso(0);
  assert.equal(juego.intentarSubir(), true);
  tecla('Space');
  for (const fn of lienzo.oyentes.pointerdown || []) fn({});
  assert.equal(juego.escena.id, 'taqueria', 'sigue la animación de abordar');
  juego.avanzarPaso(2.5);
  juego.avanzarPaso(2.5);
  assert.equal(ventana.location.href, './bonus-camioneta.html');
  juego.detener();
});

test('la cinemática de la familia sí se salta con Espacio o un toque', () => {
  for (const modo of ['tecla', 'toque']) {
    const { juego, tecla, lienzo } = iniciar(memoria(), '?cinematica=familia');
    if (modo === 'tecla') tecla('Space');
    else for (const fn of lienzo.oyentes.pointerdown) fn({});
    assert.equal(juego.escena.id, 'reja', modo);
    juego.detener();
  }
});

test('al recargar en el despeñadero con el anclador, el botón táctil Gancho aparece', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), coleccionados: ['anclador-despenadero'], progreso: { escena: 'despenadero' } });
  const { juego, elementos } = iniciar(almacen);
  assert.equal(juego.escena.id, 'despenadero');
  assert.equal(elementos['btn-gancho'].hidden, false);
  juego.detener();
});

test('recargar en el desierto continúa en el desierto (no regresa al inicio de la reja)', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), progreso: { escena: 'desierto' } });
  const { juego } = iniciar(almacen);
  assert.equal(juego.escena.id, 'desierto');
  assert.equal(cargar(almacen).estado.progreso.escena, 'desierto');
  juego.detener();
});

test('una escena guardada desconocida arranca en la taquería y se corrige el guardado', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), progreso: { escena: 'casa' } });
  const { juego } = iniciar(almacen);
  assert.equal(juego.escena.id, 'taqueria');
  assert.equal(cargar(almacen).estado.progreso.escena, 'taqueria');
  juego.detener();
});

test('«Jugar el capítulo otra vez» revive enemigos, llave y jefe; conserva churus y garras', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), churus: 40, progreso: { escena: 'cima' },
    coleccionados: ['taqueria:derrotado:rata-suelo-3', 'llave-camioneta', 'garras-despenadero',
      'anclador-despenadero', 'lanzador-cima', 'churu-1'] });
  const { juego, temporizadores, capas } = iniciar(almacen);
  juego.senku.x = 1500;
  juego.avanzarPaso(1 / 60);
  const jefe = juego.jefe;
  assert.ok(jefe && jefe.estado !== 'dormido');
  jefe.hp = 1;
  golpearJefe(jefe, 1);
  juego.avanzarPaso(1 / 60);
  assert.ok(juego.estadoJugador().coleccionados.includes('jefe-gato-mecanico'));
  assert.equal(temporizadores.length, 1);
  temporizadores[0]();
  const final = capas.find((c) => c.botones);
  const volver = capas.at(-1).botones['#final-volver'];
  assert.ok(final && volver.oyentes.click, 'pantalla final con botón de volver a jugar');
  volver.oyentes.click[0]();

  assert.equal(juego.escena.id, 'ciudad'); // vuelve al inicio del capítulo
  const col = juego.estadoJugador().coleccionados;
  for (const id of ['jefe-gato-mecanico', 'llave-camioneta', 'taqueria:derrotado:rata-suelo-3', 'anclador-despenadero', 'lanzador-cima']) {
    assert.equal(col.includes(id), false, id);
  }
  assert.ok(col.includes('garras-despenadero') && col.includes('churu-1'));
  assert.equal(juego.estadoJugador().churus, 40);
  assert.ok(juego.enemigos.every((e) => e.vivo), 'los enemigos regresan');
  assert.equal(cargar(almacen).estado.progreso.escena, 'ciudad');
  juego.detener();
});

test('detener() retira todos los oyentes de teclado (incluida la tecla N de música)', () => {
  const { juego, oyentes } = iniciar();
  assert.ok(oyentes.keydown.length >= 2);
  juego.detener();
  assert.equal(oyentes.keydown.length, 0);
});

test('index.html: un toque (pointerdown + touchstart) en Pausa hace un solo clic', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const script = html.match(/<script>([\s\S]*?vincularBotonInmediato[\s\S]*?)<\/script>/)[1];
  const botones = {};
  const documento = {
    addEventListener: (tipo, fn) => { if (tipo === 'DOMContentLoaded') documento.listo = fn; },
    getElementById: (id) => (botones[id] ||= { clics: 0, oyentes: {},
      click() { this.clics += 1; },
      addEventListener(tipo, fn) { this.oyentes[tipo] = fn; } }),
  };
  new Function('document', 'performance', script)(documento, { now: () => 1000 });
  documento.listo();
  const pausa = botones['btn-pausa'];
  pausa.oyentes.pointerdown({ type: 'pointerdown', pointerType: 'touch', cancelable: true });
  pausa.oyentes.touchstart({ type: 'touchstart', cancelable: true, preventDefault() {} });
  assert.equal(pausa.clics, 1);
});
