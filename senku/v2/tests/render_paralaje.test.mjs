import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dibujarParalajeTaqueria,
  dibujarParalajeReja,
  dibujarParalajeDesierto,
} from '../src/render/canvas.mjs';

const escenas = [
  [dibujarParalajeTaqueria, 'ciudad'],
  [dibujarParalajeReja, 'reja'],
  [dibujarParalajeDesierto, 'desierto'],
];

for (const [dibujar, escena] of escenas) {
  test(`paralaje ${escena} usa tres capas ilustradas y repite cada una`, () => {
    const rutas = [];
    const dibujos = [];
    const catalogo = { obtener(ruta) { rutas.push(ruta); return { ruta, naturalWidth: 1280 }; } };
    const ctx = { drawImage(...args) { dibujos.push(args); } };

    dibujar(ctx, 320, 0, 1280, catalogo);

    assert.deepEqual(rutas, ['cielo', 'lejano', 'medio'].map(
      (capa) => `assets/fondos/paralaje/${escena}_${capa}.webp`
    ));
    assert.equal(dibujos.length, 9);
    assert.deepEqual(dibujos.slice(0, 3).map((args) => args.slice(1, 3)), [
      [-1312, 0], [-32, 0], [1248, 0],
    ]);
    assert.deepEqual(dibujos.slice(3, 6).map((args) => args.slice(1, 3)), [
      [-1376, 0], [-96, 0], [1184, 0],
    ]);
    assert.deepEqual(dibujos.slice(6).map((args) => args.slice(1, 3)), [
      [-1472, 0], [-192, 0], [1088, 0],
    ]);
    assert.ok(dibujos.every((args) => args[3] === 1280 && args[4] === 720));
  });
}
