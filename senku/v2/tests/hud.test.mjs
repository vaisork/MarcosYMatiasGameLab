import test from 'node:test';
import assert from 'node:assert/strict';
import { estadoNuevo, normalizar, guardar, cargar } from '../src/core/store.mjs';
import { actualizarControlesHabilidades } from '../src/main.mjs';
import { memoria } from './ayuda.mjs';

test('habilidades: guardados nuevos y anteriores ocultan armas; sólo true las desbloquea', () => {
  assert.deepEqual(estadoNuevo().habilidades, { disparar: false, lanzagranadas: false });
  assert.deepEqual(normalizar({ version: 1 }).habilidades, estadoNuevo().habilidades);
  assert.deepEqual(normalizar({ version: 1, habilidades: { disparar: 'true', lanzagranadas: 1 } }).habilidades,
    estadoNuevo().habilidades);
  const botones = { 'btn-disparar': {}, 'btn-lanzagranadas': {}, 'btn-salto': { hidden: false } };
  const documento = { getElementById: (id) => botones[id] };
  for (const disparar of [false, true]) for (const lanzagranadas of [false, true]) {
    const estado = { ...estadoNuevo(), habilidades: { disparar, lanzagranadas } };
    const almacen = memoria();
    assert.equal(guardar(almacen, estado), true);
    const recargado = cargar(almacen).estado;
    assert.deepEqual(recargado.habilidades, estado.habilidades);
    actualizarControlesHabilidades(documento, recargado);
    assert.equal(botones['btn-disparar'].hidden, !disparar);
    assert.equal(botones['btn-lanzagranadas'].hidden, !lanzagranadas);
    assert.equal(botones['btn-salto'].hidden, false);
  }
  actualizarControlesHabilidades(documento, {});
  assert.equal(botones['btn-disparar'].hidden, true);
  assert.equal(botones['btn-lanzagranadas'].hidden, true);
});
