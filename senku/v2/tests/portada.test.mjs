import { test } from 'node:test';
import assert from 'node:assert/strict';
import { debeMostrarPortada, mostrarPortada } from '../src/ui/portada.mjs';

test('la portada se salta con parámetros de prueba', () => {
  assert.equal(debeMostrarPortada({ search: '' }), true);
  assert.equal(debeMostrarPortada({ search: '?escena=cima' }), false);
});

test('sin DOM arranca el juego directo', () => {
  let arrancado = false;
  mostrarPortada(null, { alJugar: () => { arrancado = true; } });
  assert.equal(arrancado, true);
});
