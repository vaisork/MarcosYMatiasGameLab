// Sprites de Senku 2: selección de hoja, animación y fotograma (lógica pura, sin DOM)
// más dibujo con drawImage que recibe un contexto 2D y un catálogo de imágenes.
// Hojas de jugador de 8 columnas x 3 filas (768x288) y enemigos de 4 columnas x 2 filas (384x192).
// Si falta una imagen, las funciones de dibujo devuelven false y quien llama pinta su rectángulo de respaldo.

export const TAM_FOTOGRAMA = 96;
export const COLUMNAS_HOJA = 4; // Por defecto / compatibilidad con pruebas previas
// Línea de los pies dentro del fotograma (y = 88 - alto).
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

export const HOJA_JEFE_GATO = 'assets/jefe/gato_mecanico.png';
export const HOJA_JEFE_BALAM = 'assets/jefe/balam.png';
let catalogoArteActual = null;

// Permite a los renderizadores especializados compartir el catálogo que ya carga main.
export function catalogoArteEnUso(catalogo) {
  if (catalogo?.obtener) catalogoArteActual = catalogo;
  return catalogoArteActual;
}

// Tipo de enemigo (src/data/enemigos.mjs) -> hoja y escala de dibujo respecto al fotograma.
export const HOJAS_ENEMIGO = Object.freeze({
  cucaracha: { ruta: 'assets/enemigos/hamster_cafe.png', escala: 0.85 },
  rata_menor: { ruta: 'assets/enemigos/raton_negro.png', escala: 0.85 },
  raton: { ruta: 'assets/enemigos/raton_negro.png', escala: 0.85 },
  hamster: { ruta: 'assets/enemigos/hamster_cafe.png', escala: 0.85 },
  raton_negro: { ruta: 'assets/enemigos/raton_negro.png', escala: 0.85 },
  raton_cafe: { ruta: 'assets/enemigos/raton_cafe.png', escala: 0.85 },
  hamster_negro: { ruta: 'assets/enemigos/hamster_negro.png', escala: 0.85 },
  hamster_cafe: { ruta: 'assets/enemigos/hamster_cafe.png', escala: 0.85 },
  tucan_ladron: { ruta: 'assets/enemigos/tucan_ladron.png', escala: 0.85 },
  coati: { ruta: 'assets/enemigos/coati.png', escala: 0.85 },
  mono_aullador: { ruta: 'assets/enemigos/mono_aullador.png', escala: 0.85 },
});
const HOJA_ENEMIGO_DEFECTO = HOJAS_ENEMIGO.cucaracha;

export const IMAGENES_OBJETO = Object.freeze({
  churu: 'assets/objetos/churu.png',
  llave: 'assets/objetos/llave.png',
  botiquin: 'assets/objetos/botiquin.png',
  garras_escalada: 'assets/objetos/garras_escalada.png',
  garras: 'assets/objetos/garras_escalada.png',
  anclador: 'assets/objetos/anclador.png',
  lanzador_ratones: 'assets/objetos/lanzador_ratones.png',
  raton_proyectil: 'assets/objetos/raton_proyectil.png',
});

export const ESCALA_JUGADOR = 1.05;

// Animaciones del jugador (Gato Senku / Traje Rata)
// Hoja de 8 columnas x 3 filas de 96x96 px (768x288 px):
// Fila 0: 0..3: reposo/idle (respira, cola); 4: salto; 5: caída; 6: aterrizaje/squash; 7: daño/golpe
// Fila 1: 8..15: ciclo de carrera ágil felino (8 cuadros)
// Fila 2: 16..19: zarpazo de garras con estela de luz (4 cuadros)
export const ANIMACIONES_JUGADOR = Object.freeze({
  // Reposo / Idle (respira y cola a 4 fps)
  quieto: { frames: [0, 1, 2, 3], fps: 4 },
  idle: { frames: [0, 1, 2, 3], fps: 4 },
  // Caminar / Correr
  caminar: { frames: [8, 9, 10, 11, 12, 13, 14, 15], fps: 11 }, // fila 1: ciclo de patas (antes usaba reposo y se arrastraba)
  correr: { frames: [8, 9, 10, 11, 12, 13, 14, 15], fps: 12 }, // 8 cuadros de carrera
  run: { frames: [8, 9, 10, 11, 12, 13, 14, 15], fps: 12 },
  // Salto / Caída / Aterrizaje
  despegue: { frames: [4], fps: 1 },
  salto: { frames: [4], fps: 1 },
  jump: { frames: [4], fps: 1 },
  caida: { frames: [5], fps: 1 },
  fall: { frames: [5], fps: 1 },
  aterrizar: { frames: [6], fps: 1 },
  squash: { frames: [6], fps: 1 },
  land: { frames: [6], fps: 1 },
  // Zarpazo / Ataque
  zarpazo: { frames: [16, 17, 18, 19], fps: 14 },
  ataque: { frames: [16, 17, 18, 19], fps: 14 },
  attack: { frames: [16, 17, 18, 19], fps: 14 },
  // Daño / Hurt
  golpeado: { frames: [7], fps: 1 },
  danio: { frames: [7], fps: 1 },
  hurt: { frames: [7], fps: 1 },
});

// Animaciones de enemigos (ratón y hámster)
// Fila 0: 0..3: caminar (4 cuadros)
// Fila 1: 4: golpe / daño; 5..7: derrota (puf de humo y chispas disipándose)
export const ANIMACIONES_ENEMIGO = Object.freeze({
  caminar: { frames: [0, 1, 2, 3], fps: 8 },
  danio: { frames: [4], fps: 1 },
  golpe: { frames: [4], fps: 1 },
  derrotado: { frames: [5, 6, 7], fps: 4 },
});
export const DURACION_DANIO = 0.25;
const SECUENCIA_DERROTA = [4, 5, 6, 7]; // 4 = impacto, 5, 6, 7 = puf de humo (0,25 s cada uno)
const PASO_DERROTA = 0.25;
const DURACION_DERROTA = 1.3;
const DESVANECER_DERROTA = 0.3;
export const DURACION_GOLPE_JUGADOR = 0.35;

export function rutasPrecargaArte({ escenaId = 'taqueria', tiposEnemigo = Object.keys(HOJAS_ENEMIGO) } = {}) {
  const rel = [
    FONDOS_ESCENA[escenaId],
    ...Object.values(HOJAS_JUGADOR),
    escenaId === 'cima' && HOJA_JEFE_GATO, // 525 KB: sólo donde vive el jefe
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
// Acepta número de columnas dinámico (por ejemplo, 8 para Senku o 4 para enemigos)
export function rectanguloFotograma(indice, columnas = COLUMNAS_HOJA, tamano = TAM_FOTOGRAMA) {
  const i = Math.max(0, Math.floor(indice) || 0);
  const cols = columnas || COLUMNAS_HOJA;
  const tam = tamano || TAM_FOTOGRAMA;
  return {
    sx: (i % cols) * tam,
    sy: Math.floor(i / cols) * tam,
    sw: tam,
    sh: tam,
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

// Normaliza nombres de estado de animación para soportar indistintamente inglés y español
export function normalizarEstadoJugador(estado) {
  if (!estado || typeof estado !== 'string') return null;
  const s = estado.toLowerCase();
  if (['idle', 'quieto', 'reposo', 'stand'].includes(s)) return 'quieto';
  if (['run', 'correr', 'corriendo', 'carrera'].includes(s)) return 'correr';
  if (['caminar', 'walk'].includes(s)) return 'caminar';
  if (['jump', 'salto', 'saltando'].includes(s)) return 'salto';
  if (['fall', 'caida', 'cayendo'].includes(s)) return 'caida';
  if (['squash', 'aterrizar', 'aterrizaje', 'land'].includes(s)) return 'aterrizar';
  if (['attack', 'zarpazo', 'ataque', 'slash'].includes(s)) return 'zarpazo';
  if (['hurt', 'golpeado', 'danio', 'hit'].includes(s)) return 'golpeado';
  return s;
}

// Estado visual del jugador a partir de física, combate y animación interpolada.
export function estadoVisualJugador(cuerpo, combate = null, tiempo = 0) {
  const duracion = combate?.duracionInvulnerabilidad ?? 0;
  const restante = combate?.tiempoInvulnerable ?? 0;
  const invulnerable = Boolean(combate?.invulnerable || cuerpo?.invulnerable)
    && (combate ? restante > 0 : true);

  let nombre;
  // 1. Si existe estado explícito en cuerpo (definido por core), usarlo con normalización
  if (cuerpo?.estado) {
    nombre = normalizarEstadoJugador(cuerpo.estado) || cuerpo.estado;
  } else if (cuerpo?.atacando || (cuerpo?.tiempoAtaque ?? 0) > 0) {
    nombre = 'zarpazo';
  } else if (invulnerable && (duracion === 0 || duracion - restante < DURACION_GOLPE_JUGADOR)) {
    nombre = 'golpeado';
  } else if (!cuerpo?.enSuelo) {
    if (cuerpo?.saltando && (cuerpo?.tiempoSalto ?? 0) > 0 && (cuerpo?.tiempoSalto ?? 0) < 0.08) {
      nombre = 'despegue';
    } else if ((cuerpo?.vy ?? 0) < 0) {
      nombre = 'salto';
    } else {
      nombre = 'caida';
    }
  } else if ((cuerpo?.tiempoAterrizaje ?? 0) > 0 && Math.abs(cuerpo?.vx ?? 0) <= 20) {
    nombre = 'aterrizar';
  } else if (Math.abs(cuerpo?.vx ?? 0) > 20) {
    // Si se especifica que está corriendo, usar 'correr' (8 cuadros); de lo contrario 'caminar'
    nombre = (cuerpo?.corriendo) ? 'correr' : 'caminar';
  } else {
    nombre = 'quieto';
  }

  // Parpadeo mientras dura la bandera invulnerable (14 Hz)
  const alpha = invulnerable && Math.floor(tiempo * 14) % 2 === 1 ? 0.45 : 1;
  const anim = ANIMACIONES_JUGADOR[nombre] || ANIMACIONES_JUGADOR.quieto;
  return { nombre, frame: fotogramaDeAnimacion(anim, tiempo), alpha };
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

// Sistema de partículas de polvo al correr y aterrizar
export function crearSistemaParticulasPolvo() {
  const particulas = [];
  let ultimoPolvo = 0;
  let estabaEnSuelo = true;

  function emitirPolvoCorrer(x, y, vx, mirando = 1) {
    const dir = mirando > 0 ? -1 : 1;
    for (let i = 0; i < 2; i++) {
      particulas.push({
        x: x + dir * (10 + Math.random() * 8),
        y: y - 2 + Math.random() * 4,
        vx: dir * (25 + Math.random() * 35),
        vy: -12 - Math.random() * 18,
        radio: 3 + Math.random() * 3,
        vida: 0,
        vidaMax: 0.32 + Math.random() * 0.12,
        r: 215, g: 195, b: 170,
      });
    }
  }

  function emitirPolvoAterrizar(x, y, w) {
    for (let i = 0; i < 8; i++) {
      const lado = i % 2 === 0 ? -1 : 1;
      const speed = 30 + Math.random() * 50;
      particulas.push({
        x: x + (w / 2) + lado * (6 + Math.random() * 12),
        y: y - 2 + Math.random() * 3,
        vx: lado * speed,
        vy: -15 - Math.random() * 20,
        radio: 4 + Math.random() * 4,
        vida: 0,
        vidaMax: 0.38 + Math.random() * 0.16,
        r: 225, g: 205, b: 180,
      });
    }
  }

  function actualizar(dt = 1 / 60) {
    for (let i = particulas.length - 1; i >= 0; i--) {
      const p = particulas[i];
      p.vida += dt;
      if (p.vida >= p.vidaMax) {
        particulas.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.90;
      p.vy += 20 * dt;
      p.radio += 5 * dt;
    }
  }

  function dibujar(ctx) {
    if (!ctx || particulas.length === 0) return;
    ctx.save();
    for (const p of particulas) {
      const progreso = p.vida / p.vidaMax;
      const alpha = Math.max(0, 1 - progreso) * 0.6;
      ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function paso(cuerpo, tiempo = 0, dt = 1 / 60) {
    if (!cuerpo) return;
    const basePiesX = cuerpo.x + cuerpo.w / 2;
    const basePiesY = cuerpo.y + cuerpo.h;

    // Detección de impacto de aterrizaje
    if (!estabaEnSuelo && cuerpo.enSuelo) {
      emitirPolvoAterrizar(cuerpo.x, basePiesY, cuerpo.w);
    } else if (cuerpo.tiempoAterrizaje > 0 && Math.abs(cuerpo.vx || 0) <= 30) {
      if (Math.random() < 0.2) emitirPolvoAterrizar(cuerpo.x, basePiesY, cuerpo.w);
    }
    estabaEnSuelo = Boolean(cuerpo.enSuelo);

    // Polvo al correr a buena velocidad
    if (cuerpo.enSuelo && Math.abs(cuerpo.vx || 0) > 40) {
      if (tiempo - ultimoPolvo > 0.08) {
        ultimoPolvo = tiempo;
        emitirPolvoCorrer(basePiesX, basePiesY, cuerpo.vx, cuerpo.mirando);
      }
    }

    actualizar(dt);
  }

  return { actualizar, dibujar, emitirPolvoCorrer, emitirPolvoAterrizar, paso, particulas };
}

export const sistemaParticulasPolvoGlobal = crearSistemaParticulasPolvo();

function dibujarFotograma(ctx, imagen, frame, cuerpo, escala, mirando, alpha = 1, estadoNombre = '', tiempo = 0) {
  // Ajuste automático de columnas según el ancho de la hoja (8 para gato 768px, 4 para enemigo 384px)
  const cols = imagen?.width ? Math.floor(imagen.width / TAM_FOTOGRAMA) : COLUMNAS_HOJA;
  const { sx, sy, sw, sh } = rectanguloFotograma(frame, cols);
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

  // Respiración felina sutil en reposo (respira)
  let yOffset = 0;
  let hScale = 1;
  if ((estadoNombre === 'quieto' || estadoNombre === 'idle') && tiempo > 0) {
    const cicloRespiro = Math.sin(tiempo * 2.8);
    hScale = 1 + cicloRespiro * 0.025;
    yOffset = dh * (1 - hScale);
  }

  ctx.drawImage(imagen, sx, sy, sw, sh, dx, dy + yOffset, dw, dh * hScale);

  // Parpadeo natural en reposo (parpadea)
  if ((estadoNombre === 'quieto' || estadoNombre === 'idle') && tiempo > 0 && (tiempo % 3.6) > 3.42) {
    ctx.fillStyle = '#261b17';
    // Coordenadas relativas del ojo en fotograma 0
    const ojoX = dx + dw * 0.64;
    const ojoY = dy + yOffset + dh * hScale * 0.37;
    ctx.fillRect(ojoX, ojoY, Math.max(3, dw * 0.06), Math.max(2, dh * 0.025));
  }

  ctx.restore();
}

// Devuelve true si dibujó con arte; false => usar el rectángulo de respaldo.
export function dibujarJugador(ctx, catalogo, { cuerpo, trajeId, combate = null, tiempo = 0 }) {
  catalogoArteEnUso(catalogo);
  const imagen = catalogo?.obtener(rutaHojaJugador(trajeId));
  if (!ctx || !imagen || !cuerpo) return false;

  // Actualizar y dibujar partículas de polvo
  sistemaParticulasPolvoGlobal.paso(cuerpo, tiempo);
  sistemaParticulasPolvoGlobal.dibujar(ctx);

  const visual = estadoVisualJugador(cuerpo, combate, tiempo);
  dibujarFotograma(ctx, imagen, visual.frame, cuerpo, ESCALA_JUGADOR, cuerpo.mirando, visual.alpha, visual.nombre, tiempo);
  return true;
}

// Devuelve true si el enemigo se manejó con arte (incluye no dibujar al terminar la derrota);
// false => rectángulo de respaldo.
export function dibujarEnemigo(ctx, catalogo, animador, enemigo, tiempo = 0) {
  catalogoArteEnUso(catalogo);
  const cfg = configuracionEnemigo(enemigo);
  const imagen = catalogo?.obtener(cfg.ruta);
  if (!ctx || !imagen || !animador || !enemigo) return false;
  const visual = animador.estado(enemigo, tiempo);
  if (visual) dibujarFotograma(ctx, imagen, visual.frame, enemigo, cfg.escala, enemigo.mirando, visual.alpha);
  return true;
}

// Objetos recogibles {tipo, x, y, w, h}: imagen encajada en su caja, apoyada en la base, con flote suave.
export function dibujarObjeto(ctx, catalogo, objeto, tiempo = 0) {
  catalogoArteEnUso(catalogo);
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
