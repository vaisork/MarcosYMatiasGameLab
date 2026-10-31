import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dibujarTramosPintados } from '../src/render/canvas.mjs';
import { validarEscena } from '../src/core/escenas.mjs';

const ctxFalso = () => ({ dibujos: [], drawImage(img, x, y, w, h) { this.dibujos.push([img, x, y, w, h]); } });
const catalogo = (cargadas) => ({ pedidas: [], obtener(r) { this.pedidas.push(r); return cargadas.includes(r) ? r : null; } });
const escena = { arte: { tramos: [0, 1, 2, 3].map((i) => ({ ruta: `t${i}.webp`, x: i * 1280, w: 1280 })) } };

test('dibuja sólo los tramos a la vista, desplazados por la cámara', () => {
  const ctx = ctxFalso();
  const ok = dibujarTramosPintados(ctx, catalogo(['t0.webp', 't1.webp', 't2.webp', 't3.webp']), escena, 1000);
  assert.equal(ok, true);
  assert.deepEqual(ctx.dibujos.map((d) => [d[0], d[1]]), [['t0.webp', -1000], ['t1.webp', 280]]);
});

test('si falta un tramo visible usa el respaldo y precarga el siguiente', () => {
  const ctx = ctxFalso();
  const cat = catalogo(['t0.webp']);
  assert.equal(dibujarTramosPintados(ctx, cat, escena, 1000), false);
  assert.equal(ctx.dibujos.length, 0);
  assert.ok(cat.pedidas.includes('t2.webp'));
});

test('validarEscena conserva el arte por tramos', () => {
  const base = { id: 'x', nombre: 'X', limites: { x: 0, y: 0, w: 2560, h: 720 }, puntoEntrada: { x: 0, y: 0 },
    plataformas: [{ id: 'suelo', x: 0, y: 600, w: 2560, h: 120 }] };
  assert.equal(validarEscena(base).escena.arte, null);
  assert.deepEqual(validarEscena({ ...base, ...escena }).escena.arte, escena.arte);
});
