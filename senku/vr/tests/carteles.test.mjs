import test from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { CARTELES, CARTEL_ANIMACION } from '../src/carteles.mjs';

test('la ciudad ofrece veinte anuncios sobre catorce texturas WebP ligeras', async () => {
  assert.equal(CARTELES.length, 20);
  assert.equal(new Set(CARTELES.map(({ textura }) => textura)).size, 14);
  assert.equal(CARTELES.filter(({ nuevo }) => nuevo).length, 6);
  assert.equal(CARTELES.filter(({ neon }) => neon).length, 3);
  assert.equal(CARTELES.filter(({ marquesina }) => marquesina).length, 3);
  assert.equal(CARTELES.filter(({ kiosco }) => kiosco).length, 3);
  assert.equal(CARTELES.filter(({ giro }) => giro).length, 1);
  assert.deepEqual(CARTEL_ANIMACION, { marquesinas: 3, neones: 3, giratorios: 1, kioscos: 3 });

  for (const anuncio of CARTELES) {
    assert.ok(Array.isArray(anuncio.ubicacion), `${anuncio.id}: falta ubicación`);
    assert.ok(anuncio.lineas.length >= 2, `${anuncio.id}: falta texto`);
  }
  for (const textura of new Set(CARTELES.map(({ textura }) => textura))) {
    assert.match(textura, /\.webp$/);
    const archivo = new URL(`../texturas/${textura}`, import.meta.url);
    const { size } = await stat(archivo);
    assert.ok(size > 0 && size < 150 * 1024, `${textura}: ${size} bytes`);
  }
});
