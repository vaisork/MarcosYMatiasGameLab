import test from 'node:test';
import assert from 'node:assert/strict';
import { PODER, NOMBRE_PODER, crearBarra, barraLlena, cargarBarra, dispararPoder, masCercano, crearRatoncito, pasoRatoncito, tocaRatoncito } from '../src/poder.mjs';
import { crearEnemigo, golpear } from '../src/enemigos.mjs';

test('la barrita se carga por tipo (negro +1, café +2, hámster +3) con tope 6', () => {
  assert.equal(typeof NOMBRE_PODER, 'string');
  const b = crearBarra();
  assert.equal(cargarBarra(b, 'negro'), false); assert.equal(b.carga, 1);
  assert.equal(cargarBarra(b, 'cafe'), false); assert.equal(b.carga, 3);
  assert.equal(cargarBarra(b, 'hamster'), true, 'justo se llenó'); assert.equal(b.carga, 6);
  assert.ok(barraLlena(b));
  const c = { carga: 5 };
  assert.equal(cargarBarra(c, 'hamster'), true); assert.equal(c.carga, PODER.lleno, 'tope');
  assert.equal(cargarBarra(c, 'negro'), false, 'llena no avisa otra vez'); assert.equal(c.carga, 6);
});

test('disparar vacía la barrita: 5 ratoncitos, 6 columpiándose, 0 si no está llena', () => {
  const b = crearBarra();
  assert.equal(dispararPoder(b), 0);
  b.carga = 4; assert.equal(dispararPoder(b), 0); assert.equal(b.carga, 4, 'no se gasta');
  b.carga = 6; assert.equal(dispararPoder(b), 5); assert.equal(b.carga, 0);
  b.carga = 6; assert.equal(dispararPoder(b, true), 6); assert.equal(b.carga, 0);
});

test('objetivo: el ratón vivo más cercano dentro de 25 m', () => {
  const a = crearEnemigo('negro', { x: 10, y: 0, z: 0 });
  const b = crearEnemigo('cafe', { x: 4, y: 0, z: 0 });
  const lejos = crearEnemigo('hamster', { x: 30, y: 0, z: 0 });
  const p = { x: 0, y: 0, z: 0 };
  assert.equal(masCercano(p, [a, b, lejos]), b);
  golpear(b); golpear(b); // vencido (poof): ya no cuenta
  assert.equal(masCercano(p, [a, b, lejos]), a);
  assert.equal(masCercano(p, [lejos]), null, 'fuera de alcance');
});

test('el ratoncito busca al ratón y le pega; sin objetivo vuela 3 s y se acaba', () => {
  const e = crearEnemigo('negro', { x: 6, y: 0, z: 8 });
  const r = crearRatoncito({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: -PODER.vel }); // sale hacia el otro lado
  let pego = false;
  for (let i = 0; i < 300 && !pego; i++) {
    assert.ok(pasoRatoncito(r, e.pos, 1 / 72), 'se acabó antes de pegar');
    pego = tocaRatoncito(r, e.pos, 0.5);
  }
  assert.ok(pego, 'nunca le pegó');
  assert.ok(Math.abs(Math.hypot(r.vel.x, r.vel.y, r.vel.z) - PODER.vel) < 1e-9, 'misma rapidez');
  const s = crearRatoncito({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: -PODER.vel });
  let n = 0;
  while (pasoRatoncito(s, null, 0.1)) n++;
  assert.equal(n, Math.round(PODER.vida / 0.1) - 1);
  assert.ok(Math.abs(s.pos.z + PODER.vel * PODER.vida) < 1e-6, 'sin objetivo va derecho');
});

test('la carga se guarda: sobrevive al reinicio, no se vacía sola y solo disparar la gasta', () => {
  const b = crearBarra();
  cargarBarra(b, 'hamster'); cargarBarra(b, 'hamster');
  const guardado = String(b.carga); // lo que va a localStorage
  const vuelta = crearBarra(guardado); // salir del juego y volver
  assert.equal(vuelta.carga, PODER.lleno);
  assert.ok(barraLlena(vuelta), 'sigue lista para disparar');
  assert.equal(dispararPoder(vuelta), PODER.proyectiles);
  assert.equal(crearBarra(String(vuelta.carga)).carga, 0, 'disparar sí la vacía');
  assert.equal(crearBarra('4').carga, 4, 'carga a medias también se guarda');
  for (const malo of [null, '', 'abc', '-3']) assert.equal(crearBarra(malo).carga, 0, `guardado ${malo}`);
  assert.equal(crearBarra('99').carga, PODER.lleno, 'tope');
});
