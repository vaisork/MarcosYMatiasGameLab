import test from 'node:test';
import assert from 'node:assert/strict';
import { TIPOS, crearEnemigo, golpear, esZarpazo, pasoEnemigo, tocaEnemigo, crearVida, recibirDano, tocaPared, escalar, soltarEscalada, ESCALADA, ZARPAZO } from '../src/enemigos.mjs';

test('golpes por tipo y churus que sueltan: 1/2/3', () => {
  for (const [tipo, golpes] of [['negro', 1], ['cafe', 2], ['hamster', 3]]) {
    const e = crearEnemigo(tipo, { x: 0, y: 0, z: 0 });
    for (let k = 1; k < golpes; k++) assert.deepEqual(golpear(e), { vencido: false, churus: 0 });
    assert.equal(e.estado, golpes > 1 ? 'golpeado' : 'camina');
    assert.deepEqual(golpear(e), { vencido: true, churus: TIPOS[tipo].churus });
    assert.equal(e.estado, 'poof');
    assert.equal(golpear(e), null, 'ya vencido no cuenta');
  }
});

test('zarpazo: mano rápida y cerca', () => {
  assert.ok(esZarpazo(4, 0.5));
  assert.ok(!esZarpazo(1, 0.5), 'lenta');
  assert.ok(!esZarpazo(4, ZARPAZO.alcance + 0.5), 'lejos');
});

test('el ratón se acerca a Senku en su nivel y no entra a edificios', () => {
  const caja = { min: { x: 2, y: 0, z: -5 }, max: { x: 6, y: 10, z: 5 } };
  const e = crearEnemigo('negro', { x: 0, y: 0, z: 0 });
  const senku = { x: 10, y: 1, z: 0 };
  let camino = false;
  for (let i = 0; i < 120; i++) camino = pasoEnemigo(e, senku, 1 / 72, [caja]) || camino;
  assert.ok(camino && e.pos.x > 0.5, 'avanzó');
  assert.ok(e.pos.x < caja.min.x, `se metió al edificio: x=${e.pos.x}`);
  assert.ok(Math.abs(e.dir) < 1e-9 ? false : true, 'gira hacia Senku');
  // Senku en una azotea alta: el ratón de la calle no la persigue.
  const q = crearEnemigo('cafe', { x: 0, y: 0, z: 0 });
  assert.equal(pasoEnemigo(q, { x: 5, y: 20, z: 0 }, 1 / 72, []), false);
  // Ratón de azotea no se baja.
  const a = crearEnemigo('hamster', { x: 4, y: 10, z: 0 }, caja);
  for (let i = 0; i < 300; i++) pasoEnemigo(a, { x: 20, y: 11, z: 0 }, 1 / 72, [caja]);
  assert.ok(a.pos.x <= caja.max.x, 'cayó de la azotea');
});

test('golpeado se queda quieto un rato y poof termina en muerto', () => {
  const e = crearEnemigo('cafe', { x: 0, y: 0, z: 0 });
  golpear(e);
  assert.equal(pasoEnemigo(e, { x: 5, y: 1, z: 0 }, 0.1), false);
  for (let i = 0; i < 5; i++) pasoEnemigo(e, { x: 5, y: 1, z: 0 }, 0.1);
  assert.equal(e.estado, 'camina');
  golpear(e);
  for (let i = 0; i < 5; i++) pasoEnemigo(e, { x: 5, y: 1, z: 0 }, 0.1);
  assert.equal(e.estado, 'muerto');
});

test('tocar a Senku quita un corazón, con invulnerabilidad; a 0 se queda en 0', () => {
  const e = crearEnemigo('negro', { x: 0, y: 0, z: 0 });
  assert.ok(tocaEnemigo(e, { x: 0.5, y: 1, z: 0 }));
  assert.ok(!tocaEnemigo(e, { x: 3, y: 1, z: 0 }));
  const j = crearVida();
  assert.ok(recibirDano(j)); assert.equal(j.vida, 2);
  assert.ok(!recibirDano(j), 'invulnerable');
  j.invulnerable = 0; recibirDano(j); j.invulnerable = 0; recibirDano(j);
  assert.equal(j.vida, 0);
  j.invulnerable = 0; assert.ok(!recibirDano(j)); assert.equal(j.vida, 0);
});

test('tocaPared: solo junto a la pared, no en el interior ni sobre la azotea', () => {
  const caja = { min: { x: 0, y: 0, z: 0 }, max: { x: 10, y: 20, z: 10 } };
  assert.equal(tocaPared({ x: -0.2, y: 5, z: 5 }, [caja]), caja);
  assert.equal(tocaPared({ x: 0.2, y: 5, z: 5 }, [caja]), caja, 'mano un poco dentro');
  assert.equal(tocaPared({ x: 5, y: 5, z: 5 }, [caja]), null, 'muy adentro');
  assert.equal(tocaPared({ x: -2, y: 5, z: 5 }, [caja]), null, 'lejos');
  assert.equal(tocaPared({ x: -0.2, y: 21, z: 5 }, [caja]), null, 'arriba del techo');
});

test('escalar: el cuerpo va al revés de la mano y al soltar sale lanzado', () => {
  const e = { pos: { x: 0, y: 5, z: 0 }, vel: { x: 1, y: -3, z: 0 } };
  escalar(e, { x: 0, y: -0.3, z: 0.1 }); // mano baja 30 cm → cuerpo sube 30 cm
  assert.deepEqual(e.pos, { x: 0, y: 5.3, z: -0.1 });
  assert.deepEqual(e.vel, { x: 0, y: 0, z: 0 });
  soltarEscalada(e, { x: 0, y: -4, z: 0 });
  assert.ok(e.vel.y > 4 && e.vel.y <= ESCALADA.velMax, `vel.y=${e.vel.y}`);
  soltarEscalada(e, { x: 0, y: -40, z: 0 });
  assert.ok(Math.abs(e.vel.y - ESCALADA.velMax) < 1e-9, 'tope');
});
