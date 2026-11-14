export const DURACION_MUNDO = 60;
export const DURACION_ULTRA = 15;
export const ENFRIAMIENTO_ULTRA = 60;

export const PORTALES = Object.freeze({
  churus: Object.freeze({ cartel: 'churus', mundo: 'churus', nombre: 'Mundo Churus', duracion: DURACION_MUNDO }),
  'churus-azotea': Object.freeze({ cartel: 'churus-azotea', mundo: 'vuelo', nombre: 'Cielo de Vuelo', duracion: DURACION_MUNDO }),
  vaisgard: Object.freeze({ cartel: 'vaisgard', mundo: 'vaisgard', nombre: 'Vaisgard', duracion: DURACION_MUNDO }),
  'vaisgard-oeste': Object.freeze({ cartel: 'vaisgard-oeste', mundo: 'vaisgard', nombre: 'Vaisgard', duracion: DURACION_MUNDO }),
  taqueria: Object.freeze({ cartel: 'taqueria', mundo: 'taqueria', nombre: 'Mundo Taco', duracion: DURACION_MUNDO }),
  'taqueria-sur': Object.freeze({ cartel: 'taqueria-sur', mundo: 'taqueria', nombre: 'Mundo Taco', duracion: DURACION_MUNDO }),
  neon: Object.freeze({ cartel: 'neon', mundo: 'neon', nombre: 'Ciudad Neón', duracion: DURACION_MUNDO }),
  'neon-oeste': Object.freeze({ cartel: 'neon-oeste', mundo: 'neon', nombre: 'Ciudad Neón', duracion: DURACION_MUNDO }),
  luke: Object.freeze({ cartel: 'luke', mundo: 'luke', nombre: 'Patitas de Luke', duracion: DURACION_MUNDO }),
  busqueda: Object.freeze({ cartel: 'busqueda', mundo: 'busqueda', nombre: 'Cacería del Gato Mecánico', duracion: DURACION_MUNDO }),
  'busqueda-sur': Object.freeze({ cartel: 'busqueda-sur', mundo: 'busqueda', nombre: 'Cacería del Gato Mecánico', duracion: DURACION_MUNDO }),
  'marcos-uv': Object.freeze({ cartel: 'marcos-uv', mundo: 'marcos-uv', nombre: 'Cuarto de Luz UV', duracion: DURACION_MUNDO }),
  'fs-gato': Object.freeze({ cartel: 'fs-gato', mundo: 'fs-gato', nombre: 'Pecera Cielo', duracion: DURACION_MUNDO }),
  'rata-taqueria': Object.freeze({ cartel: 'rata-taqueria', mundo: 'rata-taqueria', nombre: 'Cocina de la Rata', duracion: DURACION_MUNDO }),
  'columpia-estilo': Object.freeze({ cartel: 'columpia-estilo', mundo: 'columpia-estilo', nombre: 'Pista de Trucos', duracion: DURACION_MUNDO }),
  botiquin: Object.freeze({ cartel: 'botiquin', mundo: 'botiquin', nombre: 'Clínica de Héroes', duracion: DURACION_MUNDO }),
  senku2: Object.freeze({ cartel: 'senku2', mundo: 'senku2', nombre: 'Pista Senku 2', duracion: DURACION_MUNDO }),
  'senku2-sur': Object.freeze({ cartel: 'senku2-sur', mundo: 'senku2', nombre: 'Pista Senku 2', duracion: DURACION_MUNDO }),
  'grieta-madre': Object.freeze({ cartel: 'grieta-madre', mundo: 'grieta-madre', nombre: 'La Grieta Madre', duracion: DURACION_MUNDO }),
  ultragato: Object.freeze({ cartel: 'ultragato', mundo: null, nombre: 'Ultra Gato', duracion: DURACION_ULTRA }),
});

export function crearEstadoPortales() {
  return { mundo: null, cartel: null, entra: 0, ultraHasta: 0, ultraDisponible: 0 };
}

export function abrirPortal(estado, cartel, ahora) {
  const portal = PORTALES[cartel];
  if (!portal) return null;
  if (portal.mundo) {
    if (estado.mundo) return null;
    estado.mundo = portal.mundo;
    estado.cartel = cartel;
    estado.entra = ahora;
    return { ...portal, sale: ahora + portal.duracion * 1000 };
  }
  if (ahora < estado.ultraDisponible) return null;
  estado.ultraHasta = ahora + portal.duracion * 1000;
  estado.ultraDisponible = ahora + ENFRIAMIENTO_ULTRA * 1000;
  return { ...portal, sale: estado.ultraHasta };
}

export function salirPortal(estado, ahora) {
  if (!estado.mundo) return 0;
  const duracion = Math.max(0, ahora - estado.entra);
  estado.mundo = null;
  estado.cartel = null;
  estado.entra = 0;
  return duracion;
}

export function portalExpirado(estado, ahora) {
  return Boolean(estado.mundo && ahora - estado.entra >= DURACION_MUNDO * 1000);
}

export function ultraActivo(estado, ahora) {
  return ahora < estado.ultraHasta;
}
