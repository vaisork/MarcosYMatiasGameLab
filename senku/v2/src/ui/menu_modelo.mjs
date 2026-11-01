// Modelo puro para el menú de selección de trajes de Senku 2.
// Sin DOM ni dependencias externas.

const MENSAJES_ERROR = Object.freeze({
  precio_no_definido: 'Este traje estará disponible próximamente.',
  saldo_insuficiente: 'No tienes suficientes Churus.',
  traje_desconocido: 'Traje no encontrado en el catálogo.',
  traje_bloqueado: 'El traje aún no está desbloqueado.',
  estado_invalido: 'El estado del juego no es válido.',
  catalogo_invalido: 'El catálogo de trajes no es válido.',
  ya_equipado: 'Este traje ya está equipado.',
});

export function mensajeError(codigo) {
  return MENSAJES_ERROR[codigo] || 'No se pudo completar la acción.';
}

/**
 * Genera la lista de tarjetas para el menú de selección a partir del estado actual y catálogo.
 * Reglas:
 * - precio null => etiqueta 'Próximamente' y sin botón de compra (accion: null).
 * - sin saldo => deshabilitado con motivo 'saldo_insuficiente'.
 *
 * @param {object} estado Estado proveniente de store.mjs ({ churus, trajes, equipado })
 * @param {Array|object} catalogo Lista o diccionario de trajes ({ id, nombre, precio, menu, sprite })
 * @returns {Array<object>} Lista de tarjetas con { id, nombre, estado, precio, etiqueta, ... }
 */
export function crearModelo(estado, catalogo) {
  if (!catalogo) return [];
  const items = Array.isArray(catalogo) ? catalogo : Object.values(catalogo);
  const churusActuales = (estado && typeof estado.churus === 'number' && estado.churus >= 0)
    ? estado.churus
    : 0;
  const trajesDesbloqueados = Array.isArray(estado?.trajes) ? estado.trajes : [];
  const equipadoActual = typeof estado?.equipado === 'string' ? estado.equipado : null;

  return items.map((item) => {
    if (!item || typeof item !== 'object') return null;

    const id = item.id;
    const nombre = item.nombre || id;
    const precio = (typeof item.precio === 'number' && item.precio >= 0) ? item.precio : null;
    const equivaleA = Array.isArray(item.equivaleA) ? item.equivaleA : [];

    const esEquipado = equipadoActual === id || equivaleA.includes(equipadoActual);
    const estaDesbloqueado = esEquipado || trajesDesbloqueados.includes(id) || equivaleA.some((eq) => trajesDesbloqueados.includes(eq));

    let estadoTarjeta;
    let etiqueta;
    let accion = null;
    let deshabilitado = false;
    let motivo = null;

    if (esEquipado) {
      estadoTarjeta = 'equipado';
      etiqueta = 'Equipado';
      deshabilitado = true;
      motivo = 'ya_equipado';
    } else if (estaDesbloqueado) {
      estadoTarjeta = 'desbloqueado';
      etiqueta = 'Equipar';
      accion = 'equipar';
      deshabilitado = false;
    } else {
      estadoTarjeta = 'bloqueado';
      if (precio === null) {
        etiqueta = item.condicion ? 'Secreto' : 'Próximamente';
        accion = null;
        deshabilitado = true;
        motivo = item.condicion ? 'secreto' : 'precio_no_definido';
      } else {
        etiqueta = churusActuales < precio ? 'Bloqueado' : 'Comprar';
        accion = 'comprar';
        if (churusActuales < precio) {
          deshabilitado = true;
          motivo = 'saldo_insuficiente';
        }
      }
    }

    return {
      id,
      nombre,
      estado: estadoTarjeta,
      precio,
      etiqueta,
      menu: item.menu || null,
      sprite: item.sprite || null,
      accion,
      deshabilitado,
      motivo,
    };
  }).filter(Boolean);
}

/**
 * Ejecuta la acción correspondiente para una tarjeta (equipar si está desbloqueado, comprar si está bloqueado).
 *
 * @param {object} estado Estado de juego
 * @param {Array|object} catalogo Catálogo de trajes
 * @param {string} id Identificador del traje
 * @param {object} economia Objeto con métodos { comprarTraje, equipar }
 * @returns {{ estado?: object, error?: string, mensaje?: string }}
 */
export function accionarTarjeta(estado, catalogo, id, economia) {
  if (!estado || typeof estado !== 'object') {
    return { error: 'estado_invalido', mensaje: mensajeError('estado_invalido') };
  }
  if (!economia || typeof economia !== 'object') {
    return { error: 'economia_invalida', mensaje: 'Servicio de economía no disponible.' };
  }
  const items = Array.isArray(catalogo) ? catalogo : Object.values(catalogo || {});
  const item = items.find((t) => t && t.id === id);
  if (!item) {
    return { error: 'traje_desconocido', mensaje: mensajeError('traje_desconocido') };
  }

  const equivaleA = Array.isArray(item.equivaleA) ? item.equivaleA : [];
  const equipadoActual = estado.equipado;
  const esEquipado = equipadoActual === id || equivaleA.includes(equipadoActual);

  if (esEquipado) {
    return { estado };
  }

  const trajes = Array.isArray(estado.trajes) ? estado.trajes : [];
  const estaDesbloqueado = trajes.includes(id) || equivaleA.some((eq) => trajes.includes(eq));

  if (estaDesbloqueado) {
    if (typeof economia.equipar !== 'function') {
      return { error: 'metodo_no_disponible', mensaje: 'No se puede equipar el traje.' };
    }
    const resultado = economia.equipar(estado, id);
    if (!resultado || typeof resultado !== 'object' || resultado.error) {
      const codigo = (resultado && resultado.error) || 'error_al_equipar';
      return { error: codigo, mensaje: mensajeError(codigo) };
    }
    return { estado: resultado };
  }

  // Traje bloqueado: intentar comprar
  if (item.precio === null || item.precio === undefined) {
    return { error: 'precio_no_definido', mensaje: mensajeError('precio_no_definido') };
  }

  const churusActuales = typeof estado.churus === 'number' ? estado.churus : 0;
  if (churusActuales < item.precio) {
    return { error: 'saldo_insuficiente', mensaje: mensajeError('saldo_insuficiente') };
  }

  if (typeof economia.comprarTraje !== 'function') {
    return { error: 'metodo_no_disponible', mensaje: 'No se puede comprar el traje.' };
  }

  let resultado = economia.comprarTraje(estado, id, catalogo);
  if (resultado && resultado.error === 'catalogo_invalido' && Array.isArray(catalogo)) {
    const dict = Object.fromEntries(items.map((t) => [t.id, t]));
    resultado = economia.comprarTraje(estado, id, dict);
  }

  if (!resultado || typeof resultado !== 'object' || resultado.error) {
    const codigo = (resultado && resultado.error) || 'error_al_comprar';
    return { error: codigo, mensaje: mensajeError(codigo) };
  }

  return { estado: resultado };
}
