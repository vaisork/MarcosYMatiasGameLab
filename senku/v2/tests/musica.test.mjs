import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PIEZAS, PIEZA_POR_ESCENA, frecuencia, duracionEnTiempos, crearMusica } from '../src/audio/musica.mjs';

test('frecuencias de referencia', () => {
  assert.equal(frecuencia('A4'), 440);
  assert.ok(Math.abs(frecuencia('C5') - 523.25) < 0.01);
  assert.equal(frecuencia('-'), 0);
});

test('en cada pieza melodía y bajo duran lo mismo y caben en compases completos', () => {
  for (const [nombre, p] of Object.entries(PIEZAS)) {
    const mel = duracionEnTiempos(p.melodia);
    assert.equal(mel, duracionEnTiempos(p.bajo), nombre);
    assert.equal(mel % p.compas, 0, nombre);
    for (const [n] of [...p.melodia, ...p.bajo]) frecuencia(n);
  }
});

test('todas las escenas tienen música', () => {
  for (const id of ['ciudad', 'taqueria', 'reja', 'desierto', 'despenadero', 'cima']) assert.ok(PIEZAS[PIEZA_POR_ESCENA[id]], id);
});

test('sin Web Audio no falla', () => {
  const musica = crearMusica({});
  musica.tocar('fiesta');
  assert.equal(musica.actual, 'fiesta');
  musica.detener();
});
