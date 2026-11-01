import test from 'node:test';
import assert from 'node:assert/strict';
import { avanzarRuta, nivelAnochecer, pasoPaloma } from '../src/vida.mjs';

test('los coches recorren rutas cerradas sin salirse de su vuelta', () => {
  assert.equal(avanzarRuta(99, 1, 4, 100), 3);
  assert.equal(avanzarRuta(3, 0.5, -4, 100), 1);
  assert.equal(avanzarRuta(0, 1, 2, 0), 0);
});

test('el anochecer entra tarde y sube con suavidad', () => {
  assert.equal(nivelAnochecer(0), 0);
  assert.equal(nivelAnochecer(24), 0);
  assert.ok(nivelAnochecer(90) > 0.2 && nivelAnochecer(90) < 0.8);
  assert.equal(nivelAnochecer(240), 1);
});

test('las palomas suben y se alejan al acercarse Senku', () => {
  const p = { x: 3, y: 2, z: 0, vx: 0, vz: 0, vxObjetivo: 0, vzObjetivo: 0, fase: 1, huyendo: 0 };
  const antes = Math.hypot(p.x, p.z);
  pasoPaloma(p, { x: 0, z: 0 }, 0.25);
  assert.ok(Math.hypot(p.x, p.z) > antes);
  assert.ok(p.y > 2);
  assert.ok(p.huyendo > 0);
});
