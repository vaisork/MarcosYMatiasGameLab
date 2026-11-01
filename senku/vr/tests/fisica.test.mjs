import test from 'node:test';
import assert from 'node:assert/strict';
import { paso, crearCuerda, soltar, resolverCajas, AJUSTES } from '../src/fisica.mjs';

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const jugadora = (x = 0, y = 20, z = 0, vx = 0) => ({ pos: { x, y, z }, vel: { x: vx, y: 0, z: 0 }, enSuelo: false });

test('la gravedad actúa en caída libre', () => {
  const e = jugadora();
  for (let i = 0; i < 30; i++) paso(e, [], 1 / 60);
  assert.ok(e.vel.y < -5, `vel.y=${e.vel.y}`);
  assert.ok(e.pos.y < 20);
});

test('la cuerda tensa no se alarga (y se acorta un poco)', () => {
  const ancla = { x: 0, y: 40, z: 0 };
  const e = jugadora(15, 30, 0, 8);
  const c = crearCuerda(e.pos, ancla);
  const inicial = c.largo;
  for (let i = 0; i < 600; i++) {
    paso(e, [c], 1 / 72);
    assert.ok(dist(e.pos, ancla) <= c.largo + 1e-6, 'se pasó del largo');
  }
  assert.ok(c.largo < inicial && c.largo >= AJUSTES.largoMin);
});

test('dos cuerdas a la vez se respetan', () => {
  const a = { x: -10, y: 40, z: 0 }, b = { x: 10, y: 40, z: 0 };
  const e = jugadora(0, 25, 0, 5);
  const cs = [crearCuerda(e.pos, a), crearCuerda(e.pos, b)];
  for (let i = 0; i < 300; i++) paso(e, cs, 1 / 72);
  for (const c of cs) assert.ok(dist(e.pos, c.ancla) <= c.largo + 0.05);
});

test('al soltar conserva la velocidad (y gana impulso)', () => {
  const e = jugadora(0, 20, 0, 10);
  e.vel.z = 4;
  const antes = { ...e.vel };
  soltar(e);
  assert.ok(e.vel.x >= antes.x && e.vel.z >= antes.z);
  const dot = (e.vel.x * antes.x + e.vel.z * antes.z) / (Math.hypot(e.vel.x, e.vel.z) * Math.hypot(antes.x, antes.z));
  assert.ok(dot > 0.999, 'cambió de dirección');
  // Sin cuerdas, el siguiente paso solo cambia la velocidad por gravedad (y algo de aire).
  const vx = e.vel.x;
  paso(e, [], 1 / 72);
  assert.ok(Math.abs(e.vel.x - vx) < 0.01);
});

test('aterriza suave en el suelo y sobre azoteas', () => {
  const e = jugadora(0, 5, 0);
  e.vel.y = -30;
  for (let i = 0; i < 60; i++) paso(e, [], 1 / 60);
  assert.equal(e.pos.y, AJUSTES.suelo);
  assert.ok(e.enSuelo && e.vel.y === 0);

  const techo = { min: { x: -5, y: 0, z: -5 }, max: { x: 5, y: 12, z: 5 } };
  const t = jugadora(0, 12.5, 0);
  t.vel.y = -3;
  resolverCajas(t, [techo]);
  assert.ok(t.enSuelo && t.pos.y >= 12 + AJUSTES.suelo - 1e-9 && t.vel.y === 0);
});
