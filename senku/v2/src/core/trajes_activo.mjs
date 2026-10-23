// Trajes activos para Senku 2.
// Define catálogo de trajes provisionales, equipamiento y aspecto del Senku provisional.
// Decisión D2 (Javier): El traje de rata de v2 es el MISMO traje secreto de Legacy ('secreto_legacy').
// Regla: Todo valor creativo pendiente (precios) va como null; no inventar cifras ni arte.

export const ID_ORIGINAL = 'original';
export const ID_RATA = 'rata';
export const ID_SECRETO_LEGACY = 'secreto_legacy';

export const CATALOGO_TRAJES = Object.freeze({
  [ID_ORIGINAL]: Object.freeze({
    id: ID_ORIGINAL,
    nombre: 'Original',
    etiqueta: 'Senku',
    color: '#e67e22',       // Naranja cálido provisional
    colorBorde: '#9c4d0a',  // Borde marrón anaranjado
    colorOjo: '#2c3e50',    // Ojo oscuro
    precio: null,           // Sin precio definido (siempre desbloqueado)
    siempreDesbloqueado: true,
    equivaleA: Object.freeze([]),
  }),
  [ID_RATA]: Object.freeze({
    id: ID_RATA,
    nombre: 'Rata',
    etiqueta: 'Senku Rata',
    color: '#7f8c8d',       // Gris rata provisional limpio
    colorBorde: '#34495e',  // Borde pizarra
    colorOjo: '#e74c3c',    // Ojo rojizo representativo
    colorDetalle: '#f1948a',// Detalle interior de orejas
    precio: null,           // Pendiente creativo D2 (no inventar cifras)
    siempreDesbloqueado: false,
    equivaleA: Object.freeze([ID_SECRETO_LEGACY]),
  }),
});

/**
 * Devuelve la definición del catálogo para un identificador de traje.
 * Trata 'secreto_legacy' y 'rata' como el mismo traje (decisión D2).
 */
export function obtenerDefinicionTraje(id) {
  if (id === ID_RATA || id === ID_SECRETO_LEGACY) {
    return CATALOGO_TRAJES[ID_RATA];
  }
  return CATALOGO_TRAJES[ID_ORIGINAL];
}

/**
 * Determina si dos identificadores corresponden al mismo traje.
 */
export function esMismoTraje(idA, idB) {
  if (idA === idB) return true;
  const esRataA = idA === ID_RATA || idA === ID_SECRETO_LEGACY;
  const esRataB = idB === ID_RATA || idB === ID_SECRETO_LEGACY;
  return esRataA && esRataB;
}

/**
 * Consulta si el jugador posee el traje especificado en su estado de guardado.
 * 'original' siempre se posee.
 * 'rata' se posee si 'trajes' contiene 'rata' o 'secreto_legacy'.
 */
export function tieneTraje(estado, idTraje) {
  if (!estado || typeof estado !== 'object') return false;
  if (idTraje === ID_ORIGINAL) return true;
  const lista = Array.isArray(estado.trajes) ? estado.trajes : [];
  if (idTraje === ID_RATA || idTraje === ID_SECRETO_LEGACY) {
    return lista.includes(ID_RATA) || lista.includes(ID_SECRETO_LEGACY);
  }
  return lista.includes(idTraje);
}

/**
 * Devuelve el precio del traje.
 * REGLA: Valores creativos pendientes van como null; no inventar cifras.
 */
export function obtenerPrecioTraje(idTraje) {
  const def = obtenerDefinicionTraje(idTraje);
  return def ? def.precio : null;
}

/**
 * Equipa un traje si el jugador lo posee.
 * Función pura: devuelve un nuevo estado sin mutar el original.
 */
export function equiparTraje(estado, idTraje) {
  if (!estado || typeof estado !== 'object' || Array.isArray(estado)) {
    return { exito: false, motivo: 'estado_invalido', estado: null };
  }

  const posee = tieneTraje(estado, idTraje);
  if (!posee) {
    return {
      exito: false,
      motivo: 'traje_no_poseido',
      traje: idTraje,
      precio: obtenerPrecioTraje(idTraje),
      estado,
    };
  }

  const equipadoActual = estado.equipado || ID_ORIGINAL;
  if (esMismoTraje(equipadoActual, idTraje)) {
    return {
      exito: true,
      yaEquipado: true,
      traje: equipadoActual,
      estado,
    };
  }

  // Mantener coherencia con la lista 'trajes' para normalizar() de store.mjs
  let idDestino = idTraje;
  if (idTraje === ID_RATA || idTraje === ID_SECRETO_LEGACY) {
    const lista = Array.isArray(estado.trajes) ? estado.trajes : [];
    if (lista.includes(idTraje)) {
      idDestino = idTraje;
    } else if (lista.includes(ID_SECRETO_LEGACY)) {
      idDestino = ID_SECRETO_LEGACY;
    } else if (lista.includes(ID_RATA)) {
      idDestino = ID_RATA;
    }
  }

  const nuevoEstado = {
    ...estado,
    equipado: idDestino,
  };

  return {
    exito: true,
    yaEquipado: false,
    traje: idDestino,
    estado: nuevoEstado,
  };
}

/**
 * Obtiene la definición del traje actualmente equipado en el estado.
 */
export function obtenerTrajeActivo(estado) {
  const equipado = estado && typeof estado.equipado === 'string' ? estado.equipado : ID_ORIGINAL;
  return obtenerDefinicionTraje(equipado);
}

/**
 * Devuelve el aspecto visual y etiqueta para Senku provisional según traje o estado.
 */
export function obtenerAspectoSenku(trajeOEstado) {
  if (trajeOEstado && typeof trajeOEstado === 'object' && ('equipado' in trajeOEstado || 'trajes' in trajeOEstado)) {
    return obtenerTrajeActivo(trajeOEstado);
  }
  return obtenerDefinicionTraje(trajeOEstado);
}

/**
 * Alterna entre el traje original y el traje de rata si está desbloqueado.
 */
export function alternarTraje(estado) {
  if (!estado || typeof estado !== 'object') {
    return { exito: false, motivo: 'estado_invalido', estado };
  }
  const activo = obtenerTrajeActivo(estado);
  const siguiente = activo.id === ID_RATA ? ID_ORIGINAL : ID_RATA;
  return equiparTraje(estado, siguiente);
}

/**
 * Desbloquea un traje añadiéndolo a la lista sin mutar el estado.
 */
export function desbloquearTraje(estado, idTraje = ID_RATA) {
  if (!estado || typeof estado !== 'object' || Array.isArray(estado)) {
    return { exito: false, motivo: 'estado_invalido', estado: null };
  }
  const lista = Array.isArray(estado.trajes) ? [...estado.trajes] : [ID_ORIGINAL];
  if (!lista.includes(idTraje)) {
    lista.push(idTraje);
  }
  return {
    exito: true,
    estado: {
      ...estado,
      trajes: lista,
    },
  };
}
