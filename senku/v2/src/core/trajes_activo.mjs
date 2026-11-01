// Adaptador de compatibilidad de vestuario para partidas y llamadas existentes.
import { TRAJES } from '../data/trajes.mjs';

export const ID_ORIGINAL = 'original';
export const ID_RATA = 'rata';
export const ID_SECRETO_LEGACY = 'secreto_legacy';

const acentos = ['#4f83cc', '#9462bb', '#db4e68', '#c084fc', '#e67e22', '#68a85c'];
export const CATALOGO_TRAJES = Object.freeze(Object.fromEntries(Object.entries(TRAJES).map(([id, traje], i) => [id, Object.freeze({
  ...traje,
  nombre: id === ID_ORIGINAL ? 'Original' : id === ID_RATA ? 'Rata' : traje.nombre,
  etiqueta: id === ID_ORIGINAL ? 'Senku' : id === ID_RATA ? 'Senku Rata' : traje.nombre,
  color: id === ID_ORIGINAL ? '#e67e22' : id === ID_RATA ? '#7f8c8d' : acentos[i % acentos.length],
  colorBorde: id === ID_ORIGINAL ? '#9c4d0a' : id === ID_RATA ? '#34495e' : '#302040',
  colorOjo: id === ID_RATA ? '#e74c3c' : '#2c3e50',
  colorDetalle: id === ID_RATA ? '#f1948a' : undefined,
})])));

export function obtenerDefinicionTraje(id) {
  return CATALOGO_TRAJES[id === ID_SECRETO_LEGACY ? ID_RATA : id] || null;
}

export function esMismoTraje(a, b) {
  return a === b || ([ID_RATA, ID_SECRETO_LEGACY].includes(a) && [ID_RATA, ID_SECRETO_LEGACY].includes(b));
}

export function tieneTraje(estado, id) {
  if (!estado || typeof estado !== 'object') return false;
  if (id === ID_ORIGINAL) return true;
  const lista = Array.isArray(estado.trajes) ? estado.trajes : [];
  if (id === ID_RATA || id === ID_SECRETO_LEGACY) return lista.includes(ID_RATA) || lista.includes(ID_SECRETO_LEGACY);
  return lista.includes(id);
}

export function obtenerPrecioTraje(id) { return obtenerDefinicionTraje(id)?.precio ?? null; }

export function equiparTraje(estado, id) {
  if (!estado || typeof estado !== 'object' || Array.isArray(estado)) {
    return { exito: false, motivo: 'estado_invalido', estado: null };
  }
  const def = obtenerDefinicionTraje(id);
  if (!def) return { exito: false, motivo: 'traje_desconocido', traje: id, estado };
  if (!tieneTraje(estado, id)) {
    return { exito: false, motivo: 'traje_no_poseido', traje: id, precio: def.precio, estado };
  }
  let idReal = id === ID_SECRETO_LEGACY ? ID_RATA : id;
  if (idReal === ID_RATA && Array.isArray(estado.trajes) && !estado.trajes.includes(ID_RATA)
      && estado.trajes.includes(ID_SECRETO_LEGACY)) idReal = ID_SECRETO_LEGACY;
  const equipado = estado.equipado || ID_ORIGINAL;
  if (esMismoTraje(equipado, idReal)) return { exito: true, yaEquipado: true, traje: equipado, estado };
  return { exito: true, yaEquipado: false, traje: idReal, estado: { ...estado, equipado: idReal } };
}

export function obtenerTrajeActivo(estado) {
  return obtenerDefinicionTraje(typeof estado?.equipado === 'string' ? estado.equipado : ID_ORIGINAL)
    || obtenerDefinicionTraje(ID_ORIGINAL);
}

export function obtenerAspectoSenku(trajeOEstado) {
  return trajeOEstado && typeof trajeOEstado === 'object' && ('equipado' in trajeOEstado || 'trajes' in trajeOEstado)
    ? obtenerTrajeActivo(trajeOEstado) : obtenerDefinicionTraje(trajeOEstado);
}

export function alternarTraje(estado) {
  if (!estado || typeof estado !== 'object') return { exito: false, motivo: 'estado_invalido', estado };
  return equiparTraje(estado, obtenerTrajeActivo(estado).id === ID_RATA ? ID_ORIGINAL : ID_RATA);
}

export function desbloquearTraje(estado, id = ID_RATA) {
  if (!estado || typeof estado !== 'object' || Array.isArray(estado)) return { exito: false, motivo: 'estado_invalido', estado: null };
  const lista = Array.isArray(estado.trajes) ? [...estado.trajes] : [ID_ORIGINAL];
  const equivalente = id === ID_SECRETO_LEGACY ? ID_RATA : id;
  for (const desbloqueado of [equivalente, ...(equivalente === ID_RATA ? [ID_SECRETO_LEGACY] : [])]) {
    if (!lista.includes(desbloqueado)) lista.push(desbloqueado);
  }
  return { exito: true, estado: { ...estado, trajes: lista } };
}
