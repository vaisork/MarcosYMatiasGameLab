// Pedidos de Matías (31/10/2026) para el juego principal: curarse en cada escena y mejores
// controles para esquivar al Gato Mecánico (sin bajar su dificultad).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  crearCuerpo, actualizarCuerpo, deslizInvulnerable, VELOCIDAD_HORIZONTAL_DEFECTO,
  DESLIZ_INVULNERABLE, DESLIZ_RECARGA,
} from '../src/core/fisica.mjs';
import { mapearCodigoTecla, ACCIONES } from '../src/core/entrada.mjs';
import { HP_JEFE, DANO } from '../src/core/jefe_gato.mjs';
import { escenaCiudad } from '../src/data/escenas/ciudad.mjs';
import { escenaTaqueria } from '../src/data/escenas/taqueria.mjs';
import { escenaReja } from '../src/data/escenas/reja.mjs';
import { escenaDesierto } from '../src/data/escenas/desierto.mjs';
import { escenaDespenadero } from '../src/data/escenas/despenadero.mjs';
import { escenaCima } from '../src/data/escenas/cima.mjs';

const DT = 1 / 60;
const ESCENAS = [escenaCiudad, escenaTaqueria, escenaReja, escenaDesierto, escenaDespenadero, escenaCima];
const SUELO = [{ x: -5000, y: 600, w: 20000, h: 100 }];
const enSuelo = (x = 400) => crearCuerpo({ x, y: 600 - 90, w: 96, h: 90, enSuelo: true });

test('cada escena tiene 1 o 2 botiquines, con id propio y tomables de pie', () => {
  const ids = [];
  for (const escena of ESCENAS) {
    const botiquines = escena.objetos.filter((o) => o.tipo === 'botiquin');
    assert.ok(botiquines.length >= 1 && botiquines.length <= 2, `${escena.id}: ${botiquines.length} botiquines`);
    for (const b of botiquines) {
      ids.push(b.id);
      // Tomable de pie: hay una plataforma debajo a menos de la altura de Senku (90 px).
      const apoyo = escena.plataformas.some((p) => p.tipo !== 'anclaje' && b.x + b.w > p.x && b.x < p.x + p.w
        && b.y < p.y && b.y + b.h > p.y - 90);
      assert.ok(apoyo, `${b.id} se toma de pie sobre una plataforma`);
    }
  }
  assert.equal(new Set(ids).size, ids.length, 'ningún botiquín comparte id (recoger uno no borra otro)');
});

test('HUD de vida muestra vida actual y máxima; jugar otra vez devuelve los botiquines', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="texto-vida"[^]*id="texto-vida-max"/);
  const main = readFileSync(new URL('../src/main.mjs', import.meta.url), 'utf8');
  assert.match(main, /id\.startsWith\('botiquin'\)/);
});

test('el Gato Mecánico conserva su dificultad', () => {
  assert.equal(HP_JEFE, 20);
  assert.deepEqual(DANO, { contacto: 10, embestida: 20, onda: 15, tornillo: 10 });
});

test('Senku corre 15-20 % más rápido que antes (360 px/s)', () => {
  assert.ok(VELOCIDAD_HORIZONTAL_DEFECTO >= 360 * 1.15 && VELOCIDAD_HORIZONTAL_DEFECTO <= 360 * 1.2);
  const c = enSuelo();
  for (let i = 0; i < 60; i++) actualizarCuerpo(c, { derecha: true }, SUELO, null, DT);
  assert.ok(c.vx > 400, `vx ${c.vx}`);
});

test('en el aire cambia de dirección más rápido que en el suelo', () => {
  const giro = (aire) => {
    const c = aire ? crearCuerpo({ x: 400, y: 0, w: 96, h: 90, vx: 420 }) : enSuelo();
    if (!aire) c.vx = 420;
    let pasos = 0;
    while (c.vx > 0 && pasos < 100) { actualizarCuerpo(c, { izquierda: true }, aire ? [] : SUELO, null, DT); pasos++; }
    return pasos;
  };
  assert.ok(giro(true) < giro(false), `aire ${giro(true)} vs suelo ${giro(false)}`);
});

test('coyote time ~0.1 s y búfer de salto ~0.1 s', () => {
  // Coyote: sale del borde y salta 0.06 s después: sí salta.
  const borde = [{ x: 0, y: 600, w: 500, h: 100 }];
  const c = crearCuerpo({ x: 380, y: 510, w: 96, h: 90, enSuelo: true });
  let t = 0;
  while (c.x < 500) { actualizarCuerpo(c, { derecha: true }, borde, null, DT); t += DT; }
  for (let i = 0; i < 3; i++) actualizarCuerpo(c, { derecha: true }, borde, null, DT);
  actualizarCuerpo(c, { salto: true }, borde, null, DT);
  assert.ok(c.vy < -400, 'salta en el aire justo después del borde');
  // Tarde (0.25 s): ya no.
  const d = crearCuerpo({ x: 380, y: 510, w: 96, h: 90, enSuelo: true });
  while (d.x < 500) actualizarCuerpo(d, { derecha: true }, borde, null, DT);
  for (let i = 0; i < 15; i++) actualizarCuerpo(d, {}, borde, null, DT);
  actualizarCuerpo(d, { salto: true }, borde, null, DT);
  assert.ok(d.vy > 0, 'sin salto tarde');
  // Búfer: pulsar salto 0.08 s antes de tocar el suelo salta al aterrizar.
  const e = crearCuerpo({ x: 400, y: 480, w: 96, h: 90, vy: 400 });
  actualizarCuerpo(e, { salto: true }, SUELO, null, DT);
  let salto = false;
  for (let i = 0; i < 6; i++) { actualizarCuerpo(e, { salto: true }, SUELO, null, DT); if (e.vy < -400) salto = true; }
  assert.ok(salto, 'el salto pedido en el aire se cumple al aterrizar');
});

test('salto variable: soltar pronto da un salto más bajo', () => {
  const cima = (mantener) => {
    const c = enSuelo();
    let min = c.y;
    for (let i = 0; i < 90; i++) { actualizarCuerpo(c, { salto: i * DT < mantener }, SUELO, null, DT); min = Math.min(min, c.y); }
    return 510 - min;
  };
  assert.ok(cima(0.05) < cima(1) * 0.7, `corto ${cima(0.05)} vs largo ${cima(1)}`);
});

test('desliz: dash corto, 0.3 s intocable y recarga de 0.8 s', () => {
  const c = enSuelo();
  actualizarCuerpo(c, { desliz: true }, SUELO, null, DT);
  assert.ok(deslizInvulnerable(c));
  for (let i = 0; i < 11; i++) actualizarCuerpo(c, { desliz: true }, SUELO, null, DT);
  assert.ok(c.x - 400 >= 120, `avanza ${c.x - 400}px`);
  assert.ok(c.enSuelo, 'sigue en el suelo');
  for (let t = 12 * DT; t < DESLIZ_INVULNERABLE + 2 * DT; t += DT) actualizarCuerpo(c, {}, SUELO, null, DT);
  assert.equal(deslizInvulnerable(c), false, 'la invulnerabilidad dura 0.3 s');
  // Pulsar otra vez antes de la recarga no hace nada.
  actualizarCuerpo(c, { desliz: true }, SUELO, null, DT);
  assert.equal(deslizInvulnerable(c), false);
  actualizarCuerpo(c, {}, SUELO, null, DT);
  for (let t = 0; t < DESLIZ_RECARGA; t += DT) actualizarCuerpo(c, {}, SUELO, null, DT);
  actualizarCuerpo(c, { izquierda: true, desliz: true }, SUELO, null, DT);
  assert.ok(deslizInvulnerable(c) && c.vx < 0, 'tras la recarga se desliza hacia donde apunta');
});

test('desliz con Shift o L y botón táctil junto a SALTA; el jefe no daña durante el desliz', () => {
  assert.equal(mapearCodigoTecla('ShiftLeft'), ACCIONES.DESLIZ);
  assert.equal(mapearCodigoTecla('KeyL'), ACCIONES.DESLIZ);
  assert.equal(mapearCodigoTecla('KeyK'), ACCIONES.ANCLAR, 'K sigue siendo el gancho');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="btn-desliz"[^]*id="btn-salto"/);
  const main = readFileSync(new URL('../src/main.mjs', import.meta.url), 'utf8');
  assert.match(main, /deslizInvulnerable\(senku\) \? 0 : danoAJugador\(jefe, senku\)/);
  assert.match(main, /desliz: documento\.getElementById\('btn-desliz'\)/);
});
