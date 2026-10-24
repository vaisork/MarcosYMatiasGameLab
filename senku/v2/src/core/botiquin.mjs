// Lógica pura de botiquines en Senku 2.
// Decisión de diseño aprobada:
// - Cura +25 de 100 puntos de vida sin pasar del máximo.
// - Cada botiquín se recoge una sola vez por partida (marcado en store.mjs vía coleccionados).
// - Si la vida ya está al máximo no se recoge y no se consume.
// Sin dependencias de DOM ni navegador.

import { solapanAABB } from './fisica.mjs';

export const CURACION_BOTIQUIN = 25;
export const HP_MAXIMO_DEFECTO = 100;

/**
 * Comprueba si el jugador puede recoger un botiquín determinado.
 * Regla: No se recoge si ya fue recogido, si está en el guardado,
 * o si la salud del jugador ya está al máximo (no se consume).
 */
export function puedeRecogerBotiquin(estadoCombate, botiquin = null, estadoJugador = null) {
  if (!estadoCombate || estadoCombate.derrotado) {
    return false;
  }

  if (botiquin) {
    if (botiquin.recogido) return false;
    if (botiquin.id && Array.isArray(estadoJugador?.coleccionados) && estadoJugador.coleccionados.includes(botiquin.id)) {
      return false;
    }
  }

  const hpMax = estadoCombate.hpMax ?? HP_MAXIMO_DEFECTO;
  const hp = estadoCombate.hp ?? hpMax;

  // Si la vida ya está al máximo (o por encima), no se recoge y no se consume
  if (hp >= hpMax) {
    return false;
  }

  return true;
}

/**
 * Aplica curación al estado de combate sin superar hpMax.
 * Devuelve un resumen con la cantidad curada real.
 */
export function aplicarCuracion(estadoCombate, cantidad = CURACION_BOTIQUIN) {
  if (!estadoCombate) {
    return { curado: false, motivo: 'sin_estado' };
  }

  const hpMax = estadoCombate.hpMax ?? HP_MAXIMO_DEFECTO;
  const hpActual = estadoCombate.hp ?? hpMax;

  if (hpActual >= hpMax) {
    return { curado: false, motivo: 'vida_llena', hp: hpActual, hpMax };
  }

  const suma = hpActual + Math.max(0, cantidad);
  const nuevoHp = Math.min(hpMax, suma);
  const cantidadCurada = nuevoHp - hpActual;

  estadoCombate.hp = nuevoHp;

  return {
    curado: true,
    hpAnterior: hpActual,
    hp: nuevoHp,
    hpMax,
    cantidadCurada,
  };
}

/**
 * Resuelve la recogida de un botiquín en el mapa por parte de Senku.
 * Si la vida está al máximo o no hay solapamiento, no lo consume ni lo marca.
 * Si se recoge, incrementa la vida (+25 con tope en 100), marca el botiquín
 * como recogido y lo anota en `coleccionados` del guardado versionado.
 */
export function recogerBotiquin({
  jugador = null,
  botiquin,
  estadoCombate,
  estadoJugador = null,
  cantidad = CURACION_BOTIQUIN,
} = {}) {
  if (!botiquin) {
    return { recogido: false, motivo: 'sin_botiquin' };
  }

  if (botiquin.recogido) {
    return { recogido: false, motivo: 'ya_recogido' };
  }

  if (botiquin.id && Array.isArray(estadoJugador?.coleccionados) && estadoJugador.coleccionados.includes(botiquin.id)) {
    return { recogido: false, motivo: 'ya_coleccionado' };
  }

  if (jugador && !solapanAABB(jugador, botiquin)) {
    return { recogido: false, motivo: 'sin_contacto' };
  }

  if (!puedeRecogerBotiquin(estadoCombate, botiquin, estadoJugador)) {
    return { recogido: false, motivo: 'vida_llena' };
  }

  const cura = typeof botiquin.curacion === 'number' ? botiquin.curacion : cantidad;
  const resCuracion = aplicarCuracion(estadoCombate, cura);

  if (!resCuracion.curado) {
    return { recogido: false, motivo: resCuracion.motivo };
  }

  botiquin.recogido = true;

  let nuevoEstadoJugador = estadoJugador;
  if (estadoJugador) {
    const lista = Array.isArray(estadoJugador.coleccionados) ? estadoJugador.coleccionados : [];
    const coleccionados = botiquin.id ? [...new Set([...lista, botiquin.id])] : [...lista];
    nuevoEstadoJugador = {
      ...estadoJugador,
      coleccionados,
    };
  }

  return {
    recogido: true,
    curacion: resCuracion.cantidadCurada,
    hp: estadoCombate.hp,
    hpMax: estadoCombate.hpMax,
    estadoJugador: nuevoEstadoJugador,
    botiquin,
  };
}
