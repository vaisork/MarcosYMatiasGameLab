// Registro y validación de escenas de Senku 2 definidas puramente por datos.
// Sin acoplamiento a DOM ni Canvas.

export function validarEscena(escena) {
  if (!escena || typeof escena !== 'object' || Array.isArray(escena)) {
    return { valida: false, motivo: 'escena_no_es_objeto' };
  }

  if (typeof escena.id !== 'string' || escena.id.trim() === '') {
    return { valida: false, motivo: 'id_invalido' };
  }

  if (typeof escena.nombre !== 'string' || escena.nombre.trim() === '') {
    return { valida: false, motivo: 'nombre_invalido' };
  }

  const l = escena.limites;
  if (
    !l ||
    typeof l !== 'object' ||
    !Number.isFinite(l.x) ||
    !Number.isFinite(l.y) ||
    !Number.isFinite(l.w) ||
    !Number.isFinite(l.h) ||
    l.w <= 0 ||
    l.h <= 0
  ) {
    return { valida: false, motivo: 'limites_invalidos' };
  }

  const pe = escena.puntoEntrada;
  if (!pe || typeof pe !== 'object' || !Number.isFinite(pe.x) || !Number.isFinite(pe.y)) {
    return { valida: false, motivo: 'punto_entrada_invalido' };
  }

  if (!Array.isArray(escena.plataformas) || escena.plataformas.length === 0) {
    return { valida: false, motivo: 'plataformas_vacias_o_invalidas' };
  }

  for (const plat of escena.plataformas) {
    if (
      !plat ||
      typeof plat !== 'object' ||
      typeof plat.id !== 'string' ||
      !Number.isFinite(plat.x) ||
      !Number.isFinite(plat.y) ||
      !Number.isFinite(plat.w) ||
      !Number.isFinite(plat.h) ||
      plat.w <= 0 ||
      plat.h <= 0
    ) {
      return { valida: false, motivo: `plataforma_invalida_${plat?.id || 'sin_id'}` };
    }
  }

  const fondo = escena.fondo && typeof escena.fondo === 'object'
    ? {
        plataformasVisibles: escena.fondo.plataformasVisibles === true,
        ruta: typeof escena.fondo.ruta === 'string' ? escena.fondo.ruta : null,
        estilo: typeof escena.fondo.estilo === 'string' ? escena.fondo.estilo : null,
        colorRespaldo: typeof escena.fondo.colorRespaldo === 'string' ? escena.fondo.colorRespaldo : '#d6a87c',
        colorSuelo: typeof escena.fondo.colorSuelo === 'string' ? escena.fondo.colorSuelo : '#5c4033',
        colorPlataforma: typeof escena.fondo.colorPlataforma === 'string' ? escena.fondo.colorPlataforma : '#8c593a',
      }
    : {
        ruta: null,
        estilo: null,
        colorRespaldo: '#d6a87c',
        colorSuelo: '#5c4033',
        colorPlataforma: '#8c593a',
      };

  const disparadores = Array.isArray(escena.disparadores) ? escena.disparadores : [];

  const escenaNormalizada = {
    id: escena.id,
    nombre: escena.nombre,
    limites: {
      x: l.x,
      y: l.y,
      w: l.w,
      h: l.h,
      minX: l.x,
      maxX: l.x + l.w,
      minY: l.y,
      maxY: l.y + l.h,
    },
    puntoEntrada: { x: pe.x, y: pe.y },
    plataformas: escena.plataformas.map((p) => ({
      id: p.id,
      x: p.x,
      y: p.y,
      w: p.w,
      h: p.h,
      tipo: p.tipo || 'plataforma',
    })),
    disparadores,
    enemigos: Array.isArray(escena.enemigos) ? escena.enemigos : [],
    recompensaFinal: escena.recompensaFinal || null,
    fondo,
    // Escena pintada por tramos (ilustración completa; las plataformas son invisibles).
    arte: escena.arte && Array.isArray(escena.arte.tramos) ? escena.arte : null,
    objetos: Array.isArray(escena.objetos) ? escena.objetos : [],
      secretos: Array.isArray(escena.secretos) ? escena.secretos : [],
  };

  return { valida: true, escena: escenaNormalizada };
}

export function crearRegistroEscenas() {
  const escenas = new Map();

  function registrar(definicion) {
    const res = validarEscena(definicion);
    if (!res.valida) {
      throw new Error(`Definición de escena inválida: ${res.motivo}`);
    }
    escenas.set(res.escena.id, res.escena);
    return res.escena;
  }

  function obtener(id) {
    return escenas.get(id) || null;
  }

  function tiene(id) {
    return escenas.has(id);
  }

  function listar() {
    return Array.from(escenas.values());
  }

  function contar() {
    return escenas.size;
  }

  return { registrar, obtener, tiene, listar, contar };
}
