import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resumenCapitulo } from '../src/core/resumen.mjs';
import { escenaTaqueria } from '../src/data/escenas/taqueria.mjs';
import { escenaReja } from '../src/data/escenas/reja.mjs';
import { escenaDesierto } from '../src/data/escenas/desierto.mjs';
import { escenaDespenadero } from '../src/data/escenas/despenadero.mjs';

const escenas = [escenaTaqueria, escenaReja, escenaDesierto, escenaDespenadero];

test('cuenta churus, enemigos vencidos y secretos encontrados del capítulo', () => {
  const r = resumenCapitulo({
    churus: 37,
    coleccionados: ['taqueria:derrotado:a', 'reja:derrotado:b', 'secreto-nido', 'secreto-parque-alto', 'llave'],
  }, escenas);
  assert.equal(r.churus, 37);
  assert.equal(r.enemigos, 2);
  assert.equal(r.secretosEncontrados, 2);
  assert.ok(r.secretosTotales >= 5, `hay ${r.secretosTotales} secretos`);
});

test('sin partida devuelve ceros', () => {
  assert.deepEqual(resumenCapitulo(null, []), { churus: 0, enemigos: 0, secretosEncontrados: 0, secretosTotales: 0 });
});
