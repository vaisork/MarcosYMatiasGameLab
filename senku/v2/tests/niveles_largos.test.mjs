import test from 'node:test';
import assert from 'node:assert/strict';
import { escenaTaqueria } from '../src/data/escenas/taqueria.mjs';
import { escenaDesierto } from '../src/data/escenas/desierto.mjs';
import { ANCHO_GATO_JUEGO, ALTURA_GATO_JUEGO, solapanRecogible } from '../src/core/fisica.mjs';

test('taquería cubre tres pantallas con plataformas de datos', () => {
  assert.ok(escenaTaqueria.limites.w >= 3 * 1280);
  assert.ok(escenaTaqueria.plataformas.some((p) => p.x >= 1280 && p.tipo === 'plataforma'));
  assert.ok(escenaTaqueria.plataformas.some((p) => p.x >= 2560 && p.tipo === 'plataforma'));
});

test('desierto cubre cinco pantallas y cada Churu queda junto a un apoyo real', () => {
  assert.ok(escenaDesierto.limites.w >= 5 * 1280);
  const gato = { x: 0, y: 0, w: ANCHO_GATO_JUEGO, h: ALTURA_GATO_JUEGO };
  for (const churu of escenaDesierto.objetos.filter((o) => o.tipo === 'churu')) {
    const accesible = escenaDesierto.plataformas.some((p) => {
      gato.x = Math.max(p.x, Math.min(churu.x, p.x + p.w - gato.w));
      gato.y = p.y - gato.h;
      return solapanRecogible(gato, churu);
    });
    assert.ok(accesible, churu.id);
  }
  assert.equal(escenaDesierto.secretos.length, 2);
});
