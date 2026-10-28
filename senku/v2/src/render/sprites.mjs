// Sprites de Senku 2: selección de hoja, animación y fotograma (lógica pura, sin DOM)
// más dibujo con drawImage que recibe un contexto 2D y un catálogo de imágenes.
// Todas las hojas son rejillas de 4 columnas x 2 filas de 96x96 px (384x192), personajes mirando a la derecha.
// Si falta una imagen, las funciones de dibujo devuelven false y quien llama pinta su rectángulo de respaldo.

export const TAM_FOTOGRAMA = 96;
export const COLUMNAS_HOJA = 4;
// Línea de los pies dentro del fotograma (ver tools/preparar_arte.py: y = 88 - alto).
export const PIES_FOTOGRAMA = 88;

// Rutas relativas a senku/v2/, resueltas contra este módulo (válidas desde cualquier documento).
const BASE_V2 = new URL('../../', import.meta.url);
export const resolverRutaArte = (relativa) => new URL(relativa, BASE_V2).href;

export const HOJAS_JUGADOR = Object.freeze({
  original: 'assets/personajes/sprite_original.png',
  rata: 'assets/personajes/sprite_rata.png',
});

export const RETRATOS_MENU = Object.freeze({
  original: 'assets/personajes/menu_original.webp',
  rata: 'assets/personajes/menu_rata.webp',
});

export const FONDOS_ESCENA = Object.freeze({
  taqueria: 'assets/fondos/taqueria_ciudad.webp',
  desierto: 'assets/fondos/desierto.webp',
});

// Tipo de enemigo (src/data/enemigos.mjs) -> hoja y escala de dibujo respecto al fotograma.
export const HOJAS_ENEMIGO = Object.freeze({
  cucaracha: { ruta: 'assets/enemigos/hamster_cafe.png', escala: 0.62 },
  rata_menor: { ruta: 'assets/enemigos/raton_negro.png', escala: 0.66 },
  raton: { ruta: 'assets/enemigos/raton_negro.png', escala: 0.66 },
  hamster: { ruta: 'assets/enemigos/hamster_cafe.png', escala: 0.66 },
  raton_negro: { ruta: 'assets/enemigos/raton_negro.png', escala: 0.66 },
  raton_cafe: { ruta: 'assets/enemigos/raton_cafe.png', escala: 0.66 },
  hamster_negro: { ruta: 'assets/enemigos/hamster_negro.png', escala: 0.66 },
  hamster_cafe: { ruta: 'assets/enemigos/hamster_cafe.png', escala: 0.66 },
});
const HOJA_ENEMIGO_DEFECTO = HOJAS_ENEMIGO.cucaracha;

export const IMAGENES_OBJETO = Object.freeze({
  churu: 'assets/objetos/churu.png',
  botiquin: 'assets/objetos/botiquin.png',
  garras_escalada: 'assets/objetos/garras_escalada.png',
  anclador: 'assets/objetos/anclador.png',
  lanzador_ratones: 'assets/objetos/lanzador_ratones.png',
  raton_proyectil: 'assets/objetos/raton_proyectil.png',
});

const ESCALA_JUGADOR = 0.9;

// Fotogramas por fila: fila 0 = caminar; fila 1 = agachado, salto, caída, impacto (jugador)
// o daño, rodando, panza arriba, derrotado (enemigos).
export const ANIMACIONES_JUGADOR = Object.freeze({
  quieto: { frames: [0], fps: 1 },
  caminar: { frames: [0, 1, 2, 3], fps: 10 },
  salto: { frames: [5], fps: 1 },
  caida: { frames: [6], fps: 1 },
  golpeado: { frames: [7], fps: 1 },
});

export const ANIMACIONES_ENEMIGO = Object.freeze({
  caminar: { frames: [0, 1, 2, 3], fps: 8 },
  danio: { frames: [4], fps: 1 },
});
export const DURACION_DANIO = 0.25;
const SECUENCIA_DERROTA = [4, 5, 6, 7]; // 0,25 s cada uno
const PASO_DERROTA = 0.25;
const DURACION_DERROTA = 1.3;
const DESVANECER_DERROTA = 0.3;
export const DURACION_GOLPE_JUGADOR = 0.35;

export function rutasPrecargaArte({ escenaId = 'taqueria', tiposEnemigo = Object.keys(HOJAS_ENEMIGO) } = {}) {
  const rel = [
    FONDOS_ESCENA[escenaId],
    ...Object.values(HOJAS_JUGADOR),
    ...tiposEnemigo.map((t) => (HOJAS_ENEMIGO[t] || HOJA_ENEMIGO_DEFECTO).ruta),
    ...Object.values(IMAGENES_OBJETO),
  ].filter(Boolean);
  return [...new Set(rel)].map(resolverRutaArte);
}

export function rutaHojaJugador(trajeId) {
  return resolverRutaArte(HOJAS_JUGADOR[trajeId] || HOJAS_JUGADOR.original);
}

export function rutaFondoEscena(escenaId) {
  const rel = FONDOS_ESCENA[escenaId];
  return rel ? resolverRutaArte(rel) : null;
}

export function configuracionEnemigo(enemigo) {
  const base = HOJAS_ENEMIGO[`${enemigo?.tipo}_${enemigo?.variante}`]
    || HOJAS_ENEMIGO[enemigo?.tipo] || HOJA_ENEMIGO_DEFECTO;
  return { ruta: resolverRutaArte(enemigo?.hoja || base.ruta), escala: base.escala };
}

// Origen (sx, sy) de un fotograma dentro de la hoja.
export function rectanguloFotograma(indice) {
  const i = Math.max(0, Math.floor(indice) || 0);
  return {
    sx: (i % COLUMNAS_HOJA) * TAM_FOTOGRAMA,
    sy: Math.floor(i / COLUMNAS_HOJA) * TAM_FOTOGRAMA,
    sw: TAM_FOTOGRAMA,
    sh: TAM_FOTOGRAMA,
  };
}

export function fotogramaDeAnimacion(animacion, tiempo = 0) {
  if (!animacion?.frames?.length) return 0;
  const paso = Math.floor(Math.max(0, tiempo) * animacion.fps);
  return animacion.frames[paso % animacion.frames.length];
}

// Rectángulo destino: centrado en la caja de colisión y con los pies sobre su base.
export function rectanguloDestino(cuerpo, escala) {
  const lado = TAM_FOTOGRAMA * escala;
  return {
    dx: Math.round(cuerpo.x + cuerpo.w / 2 - lado / 2),
    dy: Math.round(cuerpo.y + cuerpo.h - PIES_FOTOGRAMA * escala),
    dw: Math.round(lado),
    dh: Math.round(lado),
  };
}

// Estado visual del jugador a partir de física y combate.
export function estadoVisualJugador(cuerpo, combate = null, tiempo = 0) {
  const duracion = combate?.duracionInvulnerabilidad ?? 0;
  const restante = combate?.tiempoInvulnerable ?? 0;
  const invulnerable = Boolean(combate?.invulnerable) && restante > 0;
  let nombre;
  if (invulnerable && duracion - restante < DURACION_GOLPE_JUGADOR) nombre = 'golpeado';
  else if (!cuerpo?.enSuelo && (cuerpo?.vy ?? 0) < 0) nombre = 'salto';
  else if (!cuerpo?.enSuelo) nombre = 'caida';
  else if (Math.abs(cuerpo?.vx ?? 0) > 20) nombre = 'caminar';
  else nombre = 'quieto';
  // Parpadeo mientras dura la invulnerabilidad
  const alpha = invulnerable && Math.floor(tiempo * 14) % 2 === 1 ? 0.45 : 1;
  return { nombre, frame: fotogramaDeAnimacion(ANIMACIONES_JUGADOR[nombre], tiempo), alpha };
}

// Memoria mínima por enemigo para daño y derrota (la lógica de combate no guarda tiempos).
export function crearAnimadorEnemigos() {
  const memoria = new Map();

  function estado(enemigo, tiempo = 0) {
    if (!enemigo) return null;
    let m = memoria.get(enemigo.id);
    if (!m) {
      m = { hp: enemigo.hp, danioHasta: 0, derrotadoDesde: null };
      memoria.set(enemigo.id, m);
    }
    if (!enemigo.vivo) {
      if (m.derrotadoDesde === null) m.derrotadoDesde = tiempo;
      const t = tiempo - m.derrotadoDesde;
      if (t >= DURACION_DERROTA) return null;
      const frame = SECUENCIA_DERROTA[Math.min(SECUENCIA_DERROTA.length - 1, Math.floor(t / PASO_DERROTA))];
      const alpha = Math.min(1, (DURACION_DERROTA - t) / DESVANECER_DERROTA);
      return { nombre: 'derrotado', frame, alpha };
    }
    m.derrotadoDesde = null;
    if (typeof enemigo.hp === 'number' && typeof m.hp === 'number' && enemigo.hp < m.hp) {
      m.danioHasta = tiempo + DURACION_DANIO;
    }
    m.hp = enemigo.hp;
    if (tiempo < m.danioHasta) return { nombre: 'danio', frame: ANIMACIONES_ENEMIGO.danio.frames[0], alpha: 1 };
    // Desfase por id para que no caminen sincronizados
    const desfase = [...String(enemigo.id)].reduce((a, c) => a + c.charCodeAt(0), 0) % 7 * 0.13;
    return { nombre: 'caminar', frame: fotogramaDeAnimacion(ANIMACIONES_ENEMIGO.caminar, tiempo + desfase), alpha: 1 };
  }

  return { estado };
}

function dibujarFotograma(ctx, imagen, frame, cuerpo, escala, mirando, alpha = 1) {
  const { sx, sy, sw, sh } = rectanguloFotograma(frame);
  const { dx, dy, dw, dh } = rectanguloDestino(cuerpo, escala);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = alpha;
  if (mirando < 0) {
    const eje = dx + dw / 2;
    ctx.translate(eje, 0);
    ctx.scale(-1, 1);
    ctx.translate(-eje, 0);
  }
  ctx.drawImage(imagen, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.restore();
}

// Devuelve true si dibujó con arte; false => usar el rectángulo de respaldo.
export function dibujarJugador(ctx, catalogo, { cuerpo, trajeId, combate = null, tiempo = 0 }) {
  const imagen = catalogo?.obtener(rutaHojaJugador(trajeId));
  if (!ctx || !imagen || !cuerpo) return false;
  const visual = estadoVisualJugador(cuerpo, combate, tiempo);
  dibujarFotograma(ctx, imagen, visual.frame, cuerpo, ESCALA_JUGADOR, cuerpo.mirando, visual.alpha);
  return true;
}

// Devuelve true si el enemigo se manejó con arte (incluye no dibujar al terminar la derrota);
// false => rectángulo de respaldo.
export function dibujarEnemigo(ctx, catalogo, animador, enemigo, tiempo = 0) {
  const cfg = configuracionEnemigo(enemigo);
  const imagen = catalogo?.obtener(cfg.ruta);
  if (!ctx || !imagen || !animador || !enemigo) return false;
  const visual = animador.estado(enemigo, tiempo);
  if (visual) dibujarFotograma(ctx, imagen, visual.frame, enemigo, cfg.escala, enemigo.mirando, visual.alpha);
  return true;
}

// Objetos recogibles {tipo, x, y, w, h}: imagen encajada en su caja, apoyada en la base, con flote suave.
export function dibujarObjeto(ctx, catalogo, objeto, tiempo = 0) {
  const rel = IMAGENES_OBJETO[objeto?.tipo];
  const imagen = rel && catalogo?.obtener(resolverRutaArte(rel));
  if (!ctx || !imagen) return false;
  const caja = { w: objeto.w || imagen.width, h: objeto.h || imagen.height };
  const factor = Math.min(caja.w / imagen.width, caja.h / imagen.height);
  const dw = Math.round(imagen.width * factor);
  const dh = Math.round(imagen.height * factor);
  const flote = Math.round(Math.sin(tiempo * 3 + (objeto.x || 0)) * 3);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(imagen, Math.round(objeto.x + (caja.w - dw) / 2), Math.round(objeto.y + caja.h - dh) + flote, dw, dh);
  ctx.restore();
  return true;
}
