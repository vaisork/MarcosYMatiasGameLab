import test from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { CARTELES } from '../src/carteles.mjs';

test('la ciudad ofrece los ocho carteles solicitados con texturas WebP ligeras', async () => {
  assert.equal(CARTELES.length, 8);
  assert.deepEqual(CARTELES.map(({ id }) => id), [
    'churus', 'busqueda', 'senku2', 'vaisgard', 'taqueria', 'luke', 'ultragato', 'neon',
  ]);
  assert.equal(CARTELES.filter(({ neon }) => neon).length, 1);
  assert.ok(CARTELES.some(({ lineas }) => lineas.includes('GATO MECÁNICO')));
  assert.ok(CARTELES.some(({ lineas }) => lineas.includes('¡Ratones de cuerda!')));

  for (const { textura } of CARTELES) {
    assert.match(textura, /\.webp$/);
    const archivo = new URL(`../texturas/${textura}`, import.meta.url);
    const { size } = await stat(archivo);
    assert.ok(size > 0 && size <= 150 * 1024, `${textura}: ${size} bytes`);
  }
});
