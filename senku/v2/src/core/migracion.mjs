// Migración de partidas de Legacy (senku_*) a Senku 2. Solo lectura sobre las claves viejas.
import { estadoNuevo, cargar, guardar } from './store.mjs';

export const CLAVES_LEGACY = ['senku_churus', 'senku_skin', 'senku_secret', 'senku_collected'];

function leer(almacen, clave) {
  try { return almacen.getItem(clave); } catch { return null; }
}

export function hayLegacy(almacen) {
  return CLAVES_LEGACY.some((c) => leer(almacen, c) != null);
}

// Construye un estado a partir de Legacy. Ids de traje de Legacy conservados hasta decidir D2/D3:
// 'normal' -> 'original'; 'secret' (traje de rata de Legacy) -> 'secreto_legacy'; 'gold' no se
// migra como traje: en Legacy solo exigía tener 300 Churus y no se compraba.
export function desdeLegacy(almacen, { heredarChurus = true } = {}) {
  const estado = estadoNuevo();
  estado.origen.legacy = true;
  const n = Number.parseInt(leer(almacen, 'senku_churus'), 10);
  if (heredarChurus && Number.isInteger(n) && n > 0) estado.churus = n;
  const secreto = leer(almacen, 'senku_secret') === '1';
  if (secreto) estado.trajes.push('secreto_legacy');
  if (secreto && leer(almacen, 'senku_skin') === 'secret') estado.equipado = 'secreto_legacy';
  try {
    const lista = JSON.parse(leer(almacen, 'senku_collected'));
    if (Array.isArray(lista)) estado.coleccionados = [...new Set(lista.map(String).filter(Boolean))];
  } catch { /* sin recolectables migrables */ }
  return estado;
}

// Punto de entrada: guardado propio si existe; si no, migra Legacy una sola vez; si no, partida nueva.
export function iniciar(almacen, opciones) {
  const previo = cargar(almacen);
  if (previo.estado) return { estado: previo.estado, origen: 'guardado' };
  if (previo.motivo === 'version_futura' || previo.motivo === 'corrupto') {
    return { estado: estadoNuevo(), origen: 'nuevo_sin_guardar', motivo: previo.motivo };
  }
  const migrar = previo.motivo === 'sin_guardado' && hayLegacy(almacen);
  const estado = migrar ? desdeLegacy(almacen, opciones) : estadoNuevo();
  const guardado = guardar(almacen, estado);
  return { estado, origen: migrar ? 'legacy' : 'nuevo', guardado };
}
