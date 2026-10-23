// Guardado versionado de Senku 2. Lógica pura: recibe el almacenamiento, no toca `window`.
// Clave propia `senku2_save`; nunca escribe las claves `senku_*` de Legacy.
export const VERSION = 1;
export const CLAVE = 'senku2_save';

export function estadoNuevo() {
  return {
    version: VERSION,
    churus: 0,
    habilidades: { disparar: false, lanzagranadas: false },
    trajes: ['original'],
    equipado: 'original',
    coleccionados: [],
    progreso: { escena: 'taqueria' },
    origen: { legacy: false },
  };
}

// Devuelve un estado válido a partir de datos desconocidos, o null si no sirven.
export function normalizar(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return null;
  if (!Number.isInteger(datos.version) || datos.version < 1) return null;
  if (datos.version > VERSION) return null; // guardado de una versión futura: no se toca
  const base = estadoNuevo();
  const churus = Number.isInteger(datos.churus) && datos.churus >= 0 ? datos.churus : 0;
  const texto = (v) => typeof v === 'string' && v.length > 0;
  const trajes = Array.isArray(datos.trajes) ? [...new Set(datos.trajes.filter(texto))] : [];
  if (!trajes.includes('original')) trajes.unshift('original');
  const equipado = texto(datos.equipado) && trajes.includes(datos.equipado) ? datos.equipado : 'original';
  const coleccionados = Array.isArray(datos.coleccionados) ? [...new Set(datos.coleccionados.filter(texto))] : [];
  const escena = datos.progreso && texto(datos.progreso.escena) ? datos.progreso.escena : base.progreso.escena;
  return {
    version: VERSION, churus, trajes, equipado, coleccionados,
    habilidades: {
      disparar: datos.habilidades?.disparar === true,
      lanzagranadas: datos.habilidades?.lanzagranadas === true,
    },
    progreso: { escena },
    origen: { legacy: !!(datos.origen && datos.origen.legacy) },
  };
}

// Lee el guardado. Devuelve {estado} o {estado:null, motivo}. No lanza.
export function cargar(almacen) {
  let crudo;
  try { crudo = almacen.getItem(CLAVE); } catch { return { estado: null, motivo: 'almacenamiento_bloqueado' }; }
  if (crudo == null) return { estado: null, motivo: 'sin_guardado' };
  let datos;
  try { datos = JSON.parse(crudo); } catch { return { estado: null, motivo: 'corrupto' }; }
  const estado = normalizar(datos);
  if (estado) return { estado };
  const futura = datos && Number.isInteger(datos.version) && datos.version > VERSION;
  return { estado: null, motivo: futura ? 'version_futura' : 'invalido' };
}

// Guarda el estado. Devuelve true/false; nunca lanza.
export function guardar(almacen, estado) {
  const valido = normalizar(estado);
  if (!valido) return false;
  try { almacen.setItem(CLAVE, JSON.stringify(valido)); return true; } catch { return false; }
}

// Almacenamiento del navegador o null si está bloqueado (modo privado, permisos).
export function almacenDelNavegador(ventana) {
  try {
    const a = ventana && ventana.localStorage;
    if (!a) return null;
    a.getItem(CLAVE);
    return a;
  } catch { return null; }
}
