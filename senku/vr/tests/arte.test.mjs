import test from 'node:test';
import assert from 'node:assert/strict';
import { PALETA_CIUDAD, crearPerfilLejano, luzVertice } from '../src/arte.mjs';

test('la paleta mantiene la tarde cálida y separa el horizonte del cielo', () => {
  assert.equal(PALETA_CIUDAD.horizonte, '#f2b47f');
  assert.notEqual(PALETA_CIUDAD.cieloAlto, PALETA_CIUDAD.horizonte);
  assert.ok(PALETA_CIUDAD.mar && PALETA_CIUDAD.montaña);
});

test('el perfil de rascacielos es determinista y mantiene medidas positivas', () => {
  const a = crearPerfilLejano(42), b = crearPerfilLejano(42);
  assert.deepEqual(a, b);
  assert.equal(a.length, 56);
  assert.equal(crearPerfilLejano(42, 40).length, 40);
  assert.ok(a.every((p) => p.ancho > 0 && p.fondo > 0 && p.alto >= 12 && p.color >= 0 && p.color < 5));
});

test('la luz horneada oscurece bases y esquinas; las cubiertas reciben más luz', () => {
  const params = { x: 0, z: 0, nx: 0, ny: 1, nz: 0 };
  const techo = luzVertice({ ...params, y: 1 });
  const base = luzVertice({ ...params, y: 0 });
  const esquina = luzVertice({ ...params, y: 1, x: 0.5, z: 0.5 });
  assert.ok(techo > base);
  assert.ok(esquina < techo);
  assert.ok(esquina > 0.4);
});
