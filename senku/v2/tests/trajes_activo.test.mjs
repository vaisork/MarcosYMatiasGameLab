import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ID_ORIGINAL,
  ID_RATA,
  ID_SECRETO_LEGACY,
  CATALOGO_TRAJES,
  obtenerDefinicionTraje,
  esMismoTraje,
  tieneTraje,
  obtenerPrecioTraje,
  equiparTraje,
  obtenerTrajeActivo,
  obtenerAspectoSenku,
  alternarTraje,
  desbloquearTraje,
} from '../src/core/trajes_activo.mjs';

import { estadoNuevo, normalizar } from '../src/core/store.mjs';
import { desdeLegacy } from '../src/core/migracion.mjs';
import { memoria } from './ayuda.mjs';

test('catálogo: el traje de rata es el mismo secreto de Legacy y los precios pendientes son null', () => {
  assert.ok(CATALOGO_TRAJES[ID_ORIGINAL], 'debe existir traje original');
  assert.ok(CATALOGO_TRAJES[ID_RATA], 'debe existir traje de rata');

  // Regla dura: valores creativos pendientes en null
  assert.equal(CATALOGO_TRAJES[ID_ORIGINAL].precio, null);
  assert.equal(CATALOGO_TRAJES[ID_RATA].precio, null);
  assert.equal(obtenerPrecioTraje(ID_ORIGINAL), null);
  assert.equal(obtenerPrecioTraje(ID_RATA), null);
  assert.equal(obtenerPrecioTraje(ID_SECRETO_LEGACY), null);

  // Equivalencia con Legacy declarada
  assert.ok(
    CATALOGO_TRAJES[ID_RATA].equivaleA.includes(ID_SECRETO_LEGACY),
    'el traje de rata debe declarar su equivalencia con secreto_legacy'
  );

  // obtenerDefinicionTraje resuelve tanto 'rata' como 'secreto_legacy' a la misma definición
  const defRata = obtenerDefinicionTraje(ID_RATA);
  const defSecreto = obtenerDefinicionTraje(ID_SECRETO_LEGACY);
  assert.equal(defRata.id, ID_RATA);
  assert.equal(defSecreto.id, ID_RATA);
  assert.equal(defRata.color, defSecreto.color);
  assert.equal(defRata.etiqueta, defSecreto.etiqueta);
});

test('esMismoTraje: reconoce identidades y equivalencias entre rata y secreto_legacy', () => {
  assert.equal(esMismoTraje(ID_ORIGINAL, ID_ORIGINAL), true);
  assert.equal(esMismoTraje(ID_RATA, ID_RATA), true);
  assert.equal(esMismoTraje(ID_RATA, ID_SECRETO_LEGACY), true);
  assert.equal(esMismoTraje(ID_SECRETO_LEGACY, ID_RATA), true);
  assert.equal(esMismoTraje(ID_SECRETO_LEGACY, ID_SECRETO_LEGACY), true);
  assert.equal(esMismoTraje(ID_ORIGINAL, ID_RATA), false);
  assert.equal(esMismoTraje(ID_ORIGINAL, ID_SECRETO_LEGACY), false);
});

test('tieneTraje: reconoce si el guardado posee el traje original o el traje de rata de Legacy', () => {
  const estadoBase = estadoNuevo(); // trajes: ['original'], equipado: 'original'
  assert.equal(tieneTraje(estadoBase, ID_ORIGINAL), true, 'original siempre poseído');
  assert.equal(tieneTraje(estadoBase, ID_RATA), false, 'sin secreto no posee rata');
  assert.equal(tieneTraje(estadoBase, ID_SECRETO_LEGACY), false);

  // Con secreto_legacy en trajes
  const estadoConSecreto = {
    ...estadoBase,
    trajes: ['original', ID_SECRETO_LEGACY],
  };
  assert.equal(tieneTraje(estadoConSecreto, ID_ORIGINAL), true);
  assert.equal(tieneTraje(estadoConSecreto, ID_RATA), true, 'reconoce posesión con secreto_legacy');
  assert.equal(tieneTraje(estadoConSecreto, ID_SECRETO_LEGACY), true);

  // Con 'rata' explícito
  const estadoConRata = {
    ...estadoBase,
    trajes: ['original', ID_RATA],
  };
  assert.equal(tieneTraje(estadoConRata, ID_RATA), true);
  assert.equal(tieneTraje(estadoConRata, ID_SECRETO_LEGACY), true);

  // Entradas nulas o degradadas
  assert.equal(tieneTraje(null, ID_RATA), false);
  assert.equal(tieneTraje({}, ID_ORIGINAL), true);
});

test('equiparTraje: equipa con éxito si el guardado tiene secreto_legacy y es compatible con store', () => {
  const estado = {
    ...estadoNuevo(),
    trajes: ['original', ID_SECRETO_LEGACY],
    equipado: 'original',
  };

  const resultado = equiparTraje(estado, ID_RATA);
  assert.equal(resultado.exito, true);
  assert.equal(resultado.yaEquipado, false);
  assert.ok(
    resultado.estado.equipado === ID_SECRETO_LEGACY || resultado.estado.equipado === ID_RATA,
    'debe equipar el traje de rata'
  );
  // No debe mutar el estado original
  assert.equal(estado.equipado, 'original');

  // El nuevo estado debe ser completamente válido según store.normalizar
  const estadoNormalizado = normalizar(resultado.estado);
  assert.ok(estadoNormalizado, 'debe ser compatible con el esquema de store.mjs');
  assert.equal(estadoNormalizado.equipado, resultado.estado.equipado);

  // Equipar de nuevo cuando ya está equipado
  const segundoIntento = equiparTraje(resultado.estado, ID_RATA);
  assert.equal(segundoIntento.exito, true);
  assert.equal(segundoIntento.yaEquipado, true);

  // Volver a equipar original
  const volverOriginal = equiparTraje(resultado.estado, ID_ORIGINAL);
  assert.equal(volverOriginal.exito, true);
  assert.equal(volverOriginal.estado.equipado, ID_ORIGINAL);
});

test('equiparTraje: rechaza equipar un traje no poseído reportando precio en null', () => {
  const estado = estadoNuevo(); // solo tiene 'original'

  const resultado = equiparTraje(estado, ID_RATA);
  assert.equal(resultado.exito, false);
  assert.equal(resultado.motivo, 'traje_no_poseido');
  assert.equal(resultado.traje, ID_RATA);
  assert.equal(resultado.precio, null, 'el precio no inventado debe reportarse como null');
  assert.equal(resultado.estado, estado, 'no debe modificar el estado');

  // Estado corrupto o nulo
  const resInvalido = equiparTraje(null, ID_RATA);
  assert.equal(resInvalido.exito, false);
  assert.equal(resInvalido.motivo, 'estado_invalido');
});

test('aspecto y etiqueta: el traje activo cambia el color y la etiqueta del Senku provisional', () => {
  const defOriginal = obtenerAspectoSenku(ID_ORIGINAL);
  assert.equal(defOriginal.etiqueta, 'Senku');
  assert.equal(defOriginal.color, '#e67e22'); // naranja cálido
  assert.equal(defOriginal.precio, null);

  const defRata = obtenerAspectoSenku(ID_RATA);
  assert.equal(defRata.etiqueta, 'Senku Rata');
  assert.equal(defRata.color, '#7f8c8d'); // gris provisional
  assert.equal(defRata.precio, null);

  const defSecreto = obtenerAspectoSenku(ID_SECRETO_LEGACY);
  assert.equal(defSecreto.etiqueta, 'Senku Rata');
  assert.equal(defSecreto.color, '#7f8c8d');

  // Directamente pasando estado de juego
  const estadoOriginal = { ...estadoNuevo(), equipado: 'original' };
  const aspectoOrig = obtenerAspectoSenku(estadoOriginal);
  assert.equal(aspectoOrig.id, ID_ORIGINAL);
  assert.equal(aspectoOrig.color, '#e67e22');
  assert.equal(aspectoOrig.etiqueta, 'Senku');

  const estadoRata = { ...estadoNuevo(), trajes: ['original', ID_SECRETO_LEGACY], equipado: ID_SECRETO_LEGACY };
  const aspectoRata = obtenerAspectoSenku(estadoRata);
  assert.equal(aspectoRata.id, ID_RATA);
  assert.equal(aspectoRata.color, '#7f8c8d');
  assert.equal(aspectoRata.etiqueta, 'Senku Rata');
});

test('alternarTraje y desbloquearTraje operan de forma inmutable', () => {
  const base = estadoNuevo();

  // Intentar alternar sin tener la rata
  const noPuede = alternarTraje(base);
  assert.equal(noPuede.exito, false);
  assert.equal(noPuede.motivo, 'traje_no_poseido');

  // Desbloquear traje
  const desbloqueado = desbloquearTraje(base, ID_RATA);
  assert.equal(desbloqueado.exito, true);
  assert.ok(desbloqueado.estado.trajes.includes(ID_RATA));
  assert.equal(base.trajes.includes(ID_RATA), false, 'inmutable');

  // Alternar a rata
  const aRata = alternarTraje(desbloqueado.estado);
  assert.equal(aRata.exito, true);
  assert.equal(obtenerTrajeActivo(aRata.estado).id, ID_RATA);

  // Alternar de vuelta a original
  const aOriginal = alternarTraje(aRata.estado);
  assert.equal(aOriginal.exito, true);
  assert.equal(obtenerTrajeActivo(aOriginal.estado).id, ID_ORIGINAL);
});

test('integración con migración Legacy: partida con senku_secret equipa y visualiza Senku Rata', () => {
  const almacen = memoria({
    senku_churus: '42',
    senku_secret: '1',
    senku_skin: 'secret',
  });

  const estadoMigrado = desdeLegacy(almacen);
  assert.equal(estadoMigrado.origen.legacy, true);
  assert.ok(estadoMigrado.trajes.includes(ID_SECRETO_LEGACY));
  assert.equal(estadoMigrado.equipado, ID_SECRETO_LEGACY);

  // Verificar que trajes_activo lo reconoce como traje de rata activo de inmediato
  const trajeActivo = obtenerTrajeActivo(estadoMigrado);
  assert.equal(trajeActivo.id, ID_RATA);
  assert.equal(trajeActivo.nombre, 'Rata');
  assert.equal(trajeActivo.etiqueta, 'Senku Rata');
  assert.equal(trajeActivo.color, '#7f8c8d');
});
