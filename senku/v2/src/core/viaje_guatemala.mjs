// Viaje de México a Guatemala: Senku se sube a la camioneta de la cima y llega a Antigua.
// Lógica pura (sin DOM ni canvas); el dibujo vive en render/viaje_guatemala.mjs.

export const DESTINO_VIAJE_GUATEMALA = 'guatemala-antigua';
export const TIEMPO_EMBARQUE = 1;   // Senku camina a la puerta mientras la pantalla se funde
export const DURACION_VIAJE_GUATEMALA = 9; // segundos totales (embarque + carretera + llegada)

// Disparadores que existen ahora: los que piden una victoria sólo aparecen tras lograrla.
export function disparadoresActivos(escena, coleccionados = []) {
  return (escena?.disparadores || []).filter((d) => !d.requiereVictoria || coleccionados.includes(d.requiereVictoria));
}

export function paradaGuatemala(escena, coleccionados = []) {
  return disparadoresActivos(escena, coleccionados).find((d) => d.tipo === 'viaje-guatemala') || null;
}

// Estado de la cinemática. Sin `parada` (botón del final) se salta el embarque a pie.
export function crearViajeGuatemala(parada = null) {
  return {
    tipo: 'viaje-guatemala',
    cinematica: true,
    destino: DESTINO_VIAJE_GUATEMALA,
    duracion: DURACION_VIAJE_GUATEMALA,
    tiempo: parada ? 0 : TIEMPO_EMBARQUE,
    puertaX: parada?.puertaX ?? null,
    sonoFrontera: false,
  };
}

export function viajeGuatemalaTerminado(viaje) {
  return Boolean(viaje) && viaje.tiempo >= viaje.duracion;
}
