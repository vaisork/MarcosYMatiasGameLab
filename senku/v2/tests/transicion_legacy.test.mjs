import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUTA_LEGACY_JUEGO = path.resolve(__dirname, '../../legacy/juego.html');
const RUTA_V2_INDEX = path.resolve(__dirname, '../index.html');

test('transición de Senku 1 a Senku 2: archivo destino v2/index.html existe', () => {
  assert.ok(fs.existsSync(RUTA_V2_INDEX), 'El archivo destino ../v2/index.html debe existir');
  const contenidoV2 = fs.readFileSync(RUTA_V2_INDEX, 'utf-8');
  assert.ok(contenidoV2.includes('Senku 2'), 'El archivo destino debe ser Senku 2');
});

test('transición de Senku 1 a Senku 2: regla de salto en setScene de juego.html', () => {
  assert.ok(fs.existsSync(RUTA_LEGACY_JUEGO), 'senku/legacy/juego.html debe existir');
  const codigo = fs.readFileSync(RUTA_LEGACY_JUEGO, 'utf-8');

  // Verifica la instrucción exacta de transición
  const patron = /if\s*\(\s*s\s*===\s*'taco'\s*&&\s*!.*legacy=1.*\.test\(location\.search\)\s*\)\s*\{\s*save\(\);\s*location\.href\s*=\s*'\.\.\/v2\/index\.html';\s*return;?\s*\}/;
  assert.match(codigo, patron, 'Debe incluir la redirección a ../v2/index.html al entrar a taco sin ?legacy=1');
});

test('lógica de transición: redirige sin ?legacy=1 y permite taco con ?legacy=1', () => {
  function simularSetScene(s, search) {
    let guardado = false;
    let destino = null;
    let escenaEstablecida = null;

    const fakeLocation = { search, href: '' };
    const fakeSave = () => { guardado = true; };

    // Ejecuta la lógica idéntica a la insertada en juego.html
    if (s === 'taco' && !/[?&]legacy=1/.test(fakeLocation.search)) {
      fakeSave();
      fakeLocation.href = '../v2/index.html';
      return { redirigido: true, guardado, destino: fakeLocation.href, escena: escenaEstablecida };
    }
    escenaEstablecida = s;
    return { redirigido: false, guardado, destino: fakeLocation.href, escena: escenaEstablecida };
  }

  // 1. Entrada normal a la taquería desde el autobús: debe guardar y redirigir a Senku 2
  const pasoNormal = simularSetScene('taco', '');
  assert.equal(pasoNormal.redirigido, true);
  assert.equal(pasoNormal.guardado, true);
  assert.equal(pasoNormal.destino, '../v2/index.html');

  // 2. Con ?legacy=1: Senku 1 sigue igual (no redirige, entra a la escena taco de Senku 1)
  const pasoLegacy = simularSetScene('taco', '?legacy=1');
  assert.equal(pasoLegacy.redirigido, false);
  assert.equal(pasoLegacy.guardado, false);
  assert.equal(pasoLegacy.escena, 'taco');

  // 3. Con otros parámetros como ?foo=bar&legacy=1
  const pasoLegacyMultiple = simularSetScene('taco', '?test=true&legacy=1');
  assert.equal(pasoLegacyMultiple.redirigido, false);
  assert.equal(pasoLegacyMultiple.escena, 'taco');

  // 4. Otras escenas nunca redirigen a v2
  for (const esc of ['house', 'street', 'bus']) {
    const res = simularSetScene(esc, '');
    assert.equal(res.redirigido, false);
    assert.equal(res.escena, esc);
  }
});
