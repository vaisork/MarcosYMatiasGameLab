// Posiciones y catálogo de botiquines por escena en Senku 2.
// Decisión aprobada: 1 botiquín por escena (Taquería y Desierto), cura +25 con tope en 100.

export const CURACION_BOTIQUIN_DEFECTO = 25;

export const botiquinTaqueria = Object.freeze({
  id: 'botiquin-1',
  tipo: 'botiquin',
  x: 1060,
  y: 475, // Sobre la mesa derecha de la taquería (y=509, h=36 -> pies en 511)
  w: 36,
  h: 36,
  curacion: CURACION_BOTIQUIN_DEFECTO,
  recogido: false,
});

export const botiquinDesierto = Object.freeze({
  id: 'botiquin-desierto-1',
  tipo: 'botiquin',
  x: 880, // Sobre la roca derecha del desierto (x: 850..1010, y=510)
  y: 474, // y=510 - 36
  w: 36,
  h: 36,
  curacion: CURACION_BOTIQUIN_DEFECTO,
  recogido: false,
});

export const BOTIQUINES_POR_ESCENA = Object.freeze({
  taqueria: Object.freeze([botiquinTaqueria]),
  desierto: Object.freeze([botiquinDesierto]),
});

export const BOTIQUINES = Object.freeze({
  taqueria: botiquinTaqueria,
  desierto: botiquinDesierto,
});

export function obtenerBotiquinesEscena(escenaId) {
  const lista = BOTIQUINES_POR_ESCENA[escenaId];
  return lista ? lista.map((b) => ({ ...b })) : [];
}

export function obtenerBotiquinEscena(escenaId) {
  const item = BOTIQUINES[escenaId];
  return item ? { ...item } : null;
}
