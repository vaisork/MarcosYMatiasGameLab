import test from 'node:test';
import assert from 'node:assert/strict';
import { crearVuelo, sustentacion, actualizarVuelo, resolverChoque, guardarCheckpoint } from '../fisica.mjs';

test('levantar las alas aumenta la sustentación y puede frenar la caída', () => {
  assert.ok(sustentacion(40, 1) > sustentacion(40, -1));
  const vuelo = crearVuelo(); vuelo.vy = -1;
  for (let i = 0; i < 72; i++) actualizarVuelo(vuelo, { pitch: 1 }, 1 / 72);
  assert.ok(vuelo.vy > -1);
});

test('el alabeo gira el rumbo y el picado gana velocidad', () => {
  const vuelo = crearVuelo();
  actualizarVuelo(vuelo, { roll: 1, pitch: -1 }, .2);
  assert.ok(vuelo.yaw > -.35);
  assert.ok(vuelo.velocidad > 38);
});

test('un choque reaparece en el último aro y conserva el contador', () => {
  const vuelo = crearVuelo();
  guardarCheckpoint(vuelo, { x: 15, y: 900, z: 40, yaw: 1 });
  vuelo.x = 90; vuelo.y = 1; vuelo.z = 200;
  assert.equal(resolverChoque(vuelo, 2), true);
  assert.deepEqual([vuelo.x, vuelo.y, vuelo.z, vuelo.yaw], [15, 900, 40, 1]);
  assert.equal(vuelo.choques, 1);
  assert.equal(vuelo.aros, 1);
});
