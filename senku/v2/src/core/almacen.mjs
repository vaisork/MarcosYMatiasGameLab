// Capa de almacenamiento intercambiable para Senku 2.
// Provee una interfaz unificada (get/set/remove) con adaptadores para:
// 1. Memoria (volátil, ideal para pruebas y entornos sin DOM).
// 2. Navegador (localStorage tolerante a restricciones y bloqueo de almacenamiento).
// 3. Nativo (stub documentado para futura app móvil Android con Capacitor Preferences).
//
// DECISIÓN DE DISEÑO: INTERFAZ SÍNCRONA
// Se elige una interfaz síncrona en lugar de promesas porque:
// 1. store.mjs y migracion.mjs son síncronos y están cerrados a edición en este encargo.
// 2. El bucle de juego y arranque inicial de Senku 2 (arrancarSenku2) requieren disponibilidad
//    inmediata del estado sin retrasar el renderizado en canvas con cascadas asíncronas.
// 3. ponytail: Solución mínima funcional (YAGNI). Para Capacitor Preferences en Android
//    (que usa promesas asíncronas), el techo conocido se abordará precargando las preferencias
//    al iniciar la app en memoria o migrando store.mjs a promesas en una fase autorizada por Javier.

/**
 * Adaptador de almacenamiento en memoria.
 * @param {Record<string, string>} [inicial={}] Datos iniciales opcionales.
 */
export function crearAlmacenMemoria(inicial = {}) {
  const datos = new Map(Object.entries(inicial));

  return {
    tipo: 'memoria',
    disponible: true,
    bloqueado: false,

    get(clave) {
      return datos.has(clave) ? datos.get(clave) : null;
    },

    set(clave, valor) {
      datos.set(clave, String(valor));
      return true;
    },

    remove(clave) {
      return datos.delete(clave);
    },

    clear() {
      datos.clear();
      return true;
    },

    // Métodos de compatibilidad con Storage API (store.mjs / migracion.mjs)
    getItem(clave) {
      return this.get(clave);
    },

    setItem(clave, valor) {
      this.set(clave, valor);
    },

    removeItem(clave) {
      this.remove(clave);
    },
  };
}

/**
 * Adaptador de almacenamiento en navegador (localStorage) tolerante a fallos.
 * Maneja silenciosamente bloqueos por modo privado, políticas de cookies y cuota agotada.
 * @param {object} [ventana] Objeto ventana (window o simulador).
 */
export function crearAlmacenNavegador(ventana = typeof window !== 'undefined' ? window : null) {
  let storage = null;
  let bloqueado = false;

  try {
    storage = ventana?.localStorage || null;
    if (storage) {
      // Sonda de verificación para detectar bloqueo temprano de localStorage
      const clavePrueba = '__senku2_probe__';
      storage.getItem(clavePrueba);
    } else {
      bloqueado = true;
    }
  } catch {
    bloqueado = true;
    storage = null;
  }

  return {
    tipo: 'navegador',
    disponible: !bloqueado && storage !== null,
    bloqueado,

    get(clave) {
      if (bloqueado || !storage) return null;
      try {
        const val = storage.getItem(clave);
        return val != null ? String(val) : null;
      } catch {
        return null;
      }
    },

    set(clave, valor) {
      if (bloqueado || !storage) return false;
      try {
        storage.setItem(clave, String(valor));
        return true;
      } catch {
        // Fallo por QuotaExceededError o bloqueo sobrevenido de permisos
        return false;
      }
    },

    remove(clave) {
      if (bloqueado || !storage) return false;
      try {
        storage.removeItem(clave);
        return true;
      } catch {
        return false;
      }
    },

    clear() {
      if (bloqueado || !storage) return false;
      try {
        storage.clear();
        return true;
      } catch {
        return false;
      }
    },

    // Métodos de compatibilidad con Storage API (store.mjs / migracion.mjs)
    getItem(clave) {
      if (bloqueado || !storage) {
        throw new Error('almacenamiento_bloqueado');
      }
      try {
        return storage.getItem(clave);
      } catch (err) {
        throw new Error('almacenamiento_bloqueado', { cause: err });
      }
    },

    setItem(clave, valor) {
      if (bloqueado || !storage) {
        throw new Error('almacenamiento_bloqueado');
      }
      try {
        storage.setItem(clave, String(valor));
      } catch (err) {
        throw new Error('almacenamiento_fallo', { cause: err });
      }
    },

    removeItem(clave) {
      if (bloqueado || !storage) {
        throw new Error('almacenamiento_bloqueado');
      }
      try {
        storage.removeItem(clave);
      } catch (err) {
        throw new Error('almacenamiento_fallo', { cause: err });
      }
    },
  };
}

/**
 * Adaptador nativo stub para futura app móvil empaquetada (Capacitor Preferences / Android).
 * No se activa a menos que window.Capacitor?.Plugins?.Preferences esté presente en tiempo de ejecución.
 *
 * TODO: Capacitor Preferences opera con promesas asíncronas:
 *   await Preferences.get({ key: '...' })
 *   await Preferences.set({ key: '...', value: '...' })
 *   await Preferences.remove({ key: '...' })
 *
 * ponytail: Para la app Android, el puente síncrono mantendrá una copia en memoria
 * sincronizada en segundo plano con las Preferences nativas de Capacitor.
 * @param {object} [ventana] Objeto ventana.
 */
export function crearAlmacenNativo(ventana = typeof window !== 'undefined' ? window : null) {
  const plugin = ventana?.Capacitor?.Plugins?.Preferences || null;
  const disponible = Boolean(plugin);

  return {
    tipo: 'nativo',
    disponible,
    bloqueado: !disponible,

    get(clave) {
      if (!disponible) return null;
      // TODO: Conectar lectura nativa de Capacitor Preferences
      return null;
    },

    set(clave, valor) {
      if (!disponible) return false;
      // TODO: Conectar escritura nativa de Capacitor Preferences
      return false;
    },

    remove(clave) {
      if (!disponible) return false;
      // TODO: Conectar borrado nativo de Capacitor Preferences
      return false;
    },

    getItem(clave) {
      if (!disponible) throw new Error('almacen_nativo_no_disponible');
      return this.get(clave);
    },

    setItem(clave, valor) {
      if (!disponible) throw new Error('almacen_nativo_no_disponible');
      this.set(clave, valor);
    },

    removeItem(clave) {
      if (!disponible) throw new Error('almacen_nativo_no_disponible');
      this.remove(clave);
    },
  };
}

/**
 * Resuelve y devuelve el adaptador de almacenamiento adecuado según el entorno.
 * @param {object} [ventana] Objeto ventana del entorno.
 * @param {object} [opciones] Opciones de configuración.
 * @param {'auto'|'navegador'|'memoria'|'nativo'} [opciones.preferencia='auto'] Tipo forzado opcional.
 */
export function obtenerAlmacen(ventana = typeof window !== 'undefined' ? window : null, opciones = {}) {
  const preferencia = opciones.preferencia || 'auto';

  if (preferencia === 'memoria') {
    return crearAlmacenMemoria(opciones.inicial);
  }

  if (preferencia === 'nativo') {
    return crearAlmacenNativo(ventana);
  }

  if (preferencia === 'navegador') {
    return crearAlmacenNavegador(ventana);
  }

  // Modo 'auto':
  // 1. Si existe Capacitor con plugin de Preferences -> adaptador nativo
  if (ventana?.Capacitor?.Plugins?.Preferences) {
    return crearAlmacenNativo(ventana);
  }

  // 2. Si hay entorno de ventana con navegador -> adaptador navegador tolerante
  let pareceNavegador = false;
  try {
    pareceNavegador = Boolean(ventana && (ventana.document !== undefined || ventana.localStorage !== undefined));
  } catch {
    // Si acceder a propiedades como localStorage lanza (modo restringido), es un entorno navegador bloqueado
    pareceNavegador = true;
  }
  if (pareceNavegador) {
    return crearAlmacenNavegador(ventana);
  }

  // 3. Entorno sin ventana / Node.js puro -> memoria
  return crearAlmacenMemoria(opciones.inicial);
}
