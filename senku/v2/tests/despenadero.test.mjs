import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearCuerpo, ANCHO_GATO_JUEGO, ALTURA_GATO_JUEGO } from '../src/core/fisica.mjs';
import { crearAnclador, anguloMira, ANGULO_MIN, ANGULO_MAX, PERIODO_MIRA } from '../src/core/anclador.mjs';
import { resolverParedes } from '../src/core/garras.mjs';
import { pasoMovilidad } from '../src/core/movilidad.mjs';
import { validarEscena } from '../src/core/escenas.mjs';
import { escenaDespenadero, puntoControlPara } from '../src/data/escenas/despenadero.mjs';

const DT = 1 / 60;
const escena = validarEscena(escenaDespenadero).escena;
const plats = escena.plataformas;
const limites = escena.limites;

function gato(x, y) {
  return crearCuerpo({ x, y, w: ANCHO_GATO_JUEGO, h: ALTURA_GATO_JUEGO });
}

function correr(cuerpo, anclador, entrada, segundos, opciones) {
  const eventos = [];
  for (let t = 0; t < segundos; t += DT) {
    eventos.push(...pasoMovilidad(cuerpo, anclador, entrada, plats, limites, DT, opciones));
  }
  return eventos;
}

// Mantiene el botón hasta que la mira llegue a `grados` y lo suelta.
function apuntarYDisparar(cuerpo, anclador, grados, opciones) {
  correr(cuerpo, anclador, { anclar: true }, DT, opciones);
  let pasos = 0;
  while (anclador.angulo < grados && pasos++ < 200) {
    pasoMovilidad(cuerpo, anclador, { anclar: true }, plats, limites, DT, opciones);
  }
  return correr(cuerpo, anclador, {}, 1.5, opciones);
}

test('la escena del despeñadero es válida y tiene anclador, garras y salida a la cima', () => {
  assert.equal(validarEscena(escenaDespenadero).valida, true);
  const tipos = escenaDespenadero.objetos.map((o) => o.tipo);
  assert.ok(tipos.includes('anclador') && tipos.includes('garras'));
  assert.equal(escenaDespenadero.disparadores[0].destino, 'cima');
});

test('la mira oscila entre el ángulo mínimo y el máximo', () => {
  assert.equal(Math.round(anguloMira(0)), ANGULO_MIN);
  assert.equal(Math.round(anguloMira(PERIODO_MIRA / 2)), ANGULO_MAX);
});

test('el abismo no se puede cruzar saltando', () => {
  const senku = gato(800, 510);
  correr(senku, null, {}, 0.3);
  correr(senku, null, { derecha: true, salto: true }, 2.5);
  assert.ok(senku.y + senku.h > escenaDespenadero.alturaCaida, 'debe caer al abismo');
});

test('con el anclador cruza el abismo y cae en la repisa junto al risco', () => {
  const senku = gato(830, 510);
  const anclador = crearAnclador();
  correr(senku, anclador, {}, 0.3, { tieneAnclador: true });
  const eventos = apuntarYDisparar(senku, anclador, 15, { tieneAnclador: true });
  assert.ok(eventos.includes('enganchar'), `eventos: ${eventos}`);
  assert.ok(eventos.includes('llegar'));
  correr(senku, anclador, {}, 1.5, { tieneAnclador: true });
  assert.equal(senku.enSuelo, true);
  assert.ok(senku.x >= 1380 && senku.x + senku.w <= 1540, `x=${senku.x}`);
  assert.equal(senku.y + senku.h, 560);
});

test('sin garras la pared es sólida y no se trepa; con garras trepa y corona la meseta', () => {
  const sin = gato(1440, 470);
  correr(sin, null, {}, 0.2);
  correr(sin, null, { derecha: true, salto: true }, 2);
  assert.ok(sin.x + sin.w <= 1540, 'la pared lo detiene');
  assert.ok(sin.y + sin.h >= 560 - 1, 'no sube');

  const con = gato(1440, 470);
  correr(con, null, {}, 0.2, { tieneGarras: true });
  const eventos = correr(con, null, { derecha: true, salto: true }, 3, { tieneGarras: true });
  assert.ok(eventos.includes('agarrar'));
  assert.ok(eventos.includes('coronar'));
  assert.equal(con.y + con.h, 200, 'queda sobre la meseta');
});

test('agarrado, alejarse con salto impulsa hacia afuera', () => {
  const senku = gato(1444, 400);
  senku.agarrado = { pared: 'pared-risco', lado: 1 };
  senku.x = 1540 - senku.w;
  const eventos = correr(senku, null, { izquierda: true, salto: true }, DT, { tieneGarras: true });
  assert.ok(eventos.includes('saltar-pared'));
  assert.ok(senku.vx < 0 && senku.vy < 0);
});

test('desde la meseta se ancla a la torre, queda agarrado y trepa a la cumbre', () => {
  const senku = gato(3180, 310);
  const anclador = crearAnclador();
  const opciones = { tieneAnclador: true, tieneGarras: true };
  correr(senku, anclador, {}, 0.3, opciones);
  const eventos = apuntarYDisparar(senku, anclador, 5, opciones);
  assert.ok(eventos.includes('enganchar') && eventos.includes('agarrar'), `eventos: ${eventos}`);
  const subida = correr(senku, anclador, { salto: true }, 4, opciones);
  assert.ok(subida.includes('coronar'));
  assert.equal(senku.y + senku.h, 150);
});

test('el gancho que toca roca normal rebota sin jalar', () => {
  const senku = gato(1700, 110);
  const anclador = crearAnclador();
  senku.mirando = 1;
  correr(senku, anclador, {}, 0.2, { tieneAnclador: true });
  // Hacia arriba casi vertical, sin pared en rango: falla o rebota, nunca jala.
  const eventos = apuntarYDisparar(senku, anclador, 79, { tieneAnclador: true });
  assert.ok(!eventos.includes('enganchar'));
  assert.equal(anclador.estado, 'guardado');
});

test('resolverParedes empuja al lado más cercano', () => {
  const c = gato(1480, 400);
  c.vx = 300;
  const r = resolverParedes(c, plats.filter((p) => p.tipo === 'pared'));
  assert.equal(r.lado, 1);
  assert.equal(c.x + c.w, 1540);
  assert.equal(c.vx, 0);
});

test('punto de control según lo más lejos alcanzado', () => {
  assert.deepEqual(puntoControlPara(escenaDespenadero, 200), { x: 120, y: 510 });
  assert.deepEqual(puntoControlPara(escenaDespenadero, 2000), { x: 1680, y: 110 });
});
