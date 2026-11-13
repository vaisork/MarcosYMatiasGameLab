import test from 'node:test';
import assert from 'node:assert/strict';
import { MOVIL, detectarSwipe, detectarSacudida, masCercanoEnfrente, listoZarpazo, sacudidaDoble } from '../src/movil.mjs';

test('swipe requiere distancia y velocidad mínimas dentro del tiempo límite', () => {
  assert.ok(detectarSwipe({ x: 0, y: 0, t: 10 }, { x: 100, y: 0, t: 100 }));
  assert.ok(!detectarSwipe({ x: 0, y: 0, t: 10 }, { x: 20, y: 0, t: 100 }));
  assert.ok(!detectarSwipe({ x: 0, y: 0, t: 10 }, { x: 100, y: 0, t: 400 }));
  assert.ok(!detectarSwipe({ x: 0, y: 0, t: 10 }, { x: 40, y: 0, t: 300 }));
});

test('sacudida compara aceleración entre muestras y permite calibrar umbral', () => {
  assert.ok(!detectarSacudida(null, { x: 0, y: 0, z: 0 }));
  assert.ok(detectarSacudida({ x: 0, y: 0, z: 0 }, { x: 0, y: 15, z: 0 }));
  assert.ok(!detectarSacudida({ x: 0, y: 0, z: 0 }, { x: 0, y: 4, z: 0 }));
  assert.ok(detectarSacudida({ x: 0, y: 0, z: 0 }, { x: 0, y: 4, z: 0 }, 3));
});

test('elige ratón activo más cercano dentro del cono y a menos de 2.5 m', () => {
  const origen = { x: 0, y: 1, z: 0 }, dir = { x: 0, y: 0, z: -1 };
  const ratones = [
    { estado: 'camina', pos: { x: 0, y: 0, z: -2 } },
    { estado: 'golpeado', pos: { x: 0.2, y: 0, z: -1 } },
    { estado: 'muerto', pos: { x: 0, y: 0, z: -0.5 } },
    { estado: 'camina', pos: { x: 0, y: 0.7, z: -2.5 } },
    { estado: 'camina', pos: { x: 2, y: 0, z: 0 } },
  ];
  assert.equal(masCercanoEnfrente(origen, dir, ratones), ratones[1]);
  assert.equal(masCercanoEnfrente(origen, dir, [ratones[0]]), ratones[0]);
  assert.equal(masCercanoEnfrente(origen, dir, [ratones[3]]), null, '2.5 m exactos quedan fuera');
  assert.ok(MOVIL.alcance === 2.5);
});

test('unifica cooldown de los zarpazos de celular', () => {
  assert.ok(listoZarpazo(350, 0));
  assert.ok(!listoZarpazo(349, 0));
});

test('una sola sacudida (un paso) no da zarpazo; dos seguidas sí', () => {
  const picos = [];
  assert.equal(sacudidaDoble(picos, 0), false);
  assert.equal(sacudidaDoble(picos, 500), false);   // la anterior ya caducó
  assert.equal(sacudidaDoble(picos, 650), true);
  assert.equal(picos.length, 0);
});
