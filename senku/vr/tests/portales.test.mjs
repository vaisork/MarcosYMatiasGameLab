import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirPortal, crearEstadoPortales, salirPortal, portalExpirado, ultraActivo } from '../src/portales.mjs';

test('carteles emparejados abren sus mundos por 60 segundos', () => {
  for (const [cartel, mundo] of [['churus-azotea', 'churus'], ['vaisgard-oeste', 'vaisgard'], ['taqueria-sur', 'taqueria']]) {
    const estado = crearEstadoPortales();
    const portal = abrirPortal(estado, cartel, 1000);
    assert.equal(portal.mundo, mundo);
    assert.equal(portal.sale, 61000);
    assert.equal(abrirPortal(estado, cartel, 2000), null);
    assert.equal(portalExpirado(estado, 60999), false);
    assert.equal(portalExpirado(estado, 61000), true);
    assert.equal(salirPortal(estado, 61000), 60000);
  }
});

test('Ultra Gato dura 15 segundos y cartel enfría por 60', () => {
  const estado = crearEstadoPortales();
  assert.equal(abrirPortal(estado, 'ultragato', 1000).sale, 16000);
  assert.equal(ultraActivo(estado, 15999), true);
  assert.equal(ultraActivo(estado, 16000), false);
  assert.equal(abrirPortal(estado, 'ultragato', 60999), null);
  assert.equal(abrirPortal(estado, 'ultragato', 61000).sale, 76000);
});

test('cartel desconocido no hace nada', () => {
  const estado = crearEstadoPortales();
  assert.equal(abrirPortal(estado, 'xx', 0), null);
  assert.equal(salirPortal(estado, 0), 0);
});
