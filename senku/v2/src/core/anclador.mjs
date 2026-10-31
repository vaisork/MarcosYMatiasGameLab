// Anclador de Senku 2 (maestro, punto 6): gancho temporal con apuntado sencillo inspirado en Worms.
// Mantener el botón: la mira sube y baja sola. Soltar: el gancho sale en esa dirección.
// Si toca una superficie enganchable, la cuerda jala a Senku hasta ese punto.
// Lógica pura: sin DOM ni Canvas.

export const ANGULO_MIN = -10; // grados sobre la horizontal (negativo: un poco hacia abajo)
export const ANGULO_MAX = 80;
export const PERIODO_MIRA = 2.0; // s para ir y volver; lento para que un niño atine
export const VELOCIDAD_GANCHO = 1500; // px/s
export const ALCANCE_CUERDA = 950; // px
export const VELOCIDAD_JALON = 950; // px/s
export const DISTANCIA_LLEGADA = 24; // px

export function crearAnclador() {
  return { estado: 'guardado', tiempoMira: 0, angulo: ANGULO_MIN, gancho: null, punto: null, presionado: false };
}

export function anguloMira(tiempo) {
  const fase = (1 - Math.cos((2 * Math.PI * tiempo) / PERIODO_MIRA)) / 2;
  return ANGULO_MIN + (ANGULO_MAX - ANGULO_MIN) * fase;
}

export function origenGancho(cuerpo) {
  return { x: cuerpo.x + cuerpo.w / 2, y: cuerpo.y + cuerpo.h * 0.35 };
}

function dentro(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

// Superficies donde muerde el gancho: paredes de roca y anclajes.
export function esEnganchable(plat) {
  return Boolean(plat) && (plat.tipo === 'pared' || plat.tipo === 'anclaje');
}

// Avanza el anclador un paso. `entrada.anclar` es el botón; devuelve el evento del paso o null.
// Mientras jala, el anclador controla al cuerpo: el llamador no debe aplicar física normal
// si `controlaCuerpo(anclador)` es verdadero.
export function actualizarAnclador(anclador, cuerpo, entrada, superficies, dt) {
  const paso = Math.max(0, Math.min(dt, 0.05));
  const presionado = Boolean(entrada?.anclar);
  const nuevo = presionado && !anclador.presionado;
  const soltado = !presionado && anclador.presionado;
  anclador.presionado = presionado;
  let evento = null;

  if (anclador.estado === 'guardado' && nuevo) {
    anclador.estado = 'apuntando';
    anclador.tiempoMira = 0;
    anclador.angulo = ANGULO_MIN;
    evento = 'apuntar';
  } else if (anclador.estado === 'apuntando') {
    anclador.tiempoMira += paso;
    anclador.angulo = anguloMira(anclador.tiempoMira);
    if (soltado) {
      const rad = (anclador.angulo * Math.PI) / 180;
      const o = origenGancho(cuerpo);
      anclador.gancho = {
        x: o.x, y: o.y,
        vx: Math.cos(rad) * VELOCIDAD_GANCHO * (cuerpo.mirando || 1),
        vy: -Math.sin(rad) * VELOCIDAD_GANCHO,
      };
      anclador.estado = 'volando';
      evento = 'disparar';
    }
  } else if (anclador.estado === 'volando') {
    // Subpasos cortos para que el gancho no atraviese paredes delgadas.
    const subpasos = Math.max(1, Math.ceil((VELOCIDAD_GANCHO * paso) / 12));
    const h = paso / subpasos;
    for (let i = 0; i < subpasos; i++) {
      anclador.gancho.x += anclador.gancho.vx * h;
      anclador.gancho.y += anclador.gancho.vy * h;
      const choque = (superficies || []).find((s) => dentro(anclador.gancho, s));
      if (choque) {
        if (esEnganchable(choque)) {
          anclador.punto = { x: anclador.gancho.x, y: anclador.gancho.y, superficie: choque.id };
          anclador.estado = 'jalando';
          evento = 'enganchar';
        } else {
          anclador.estado = 'guardado';
          anclador.gancho = null;
          evento = 'rebotar';
        }
        break;
      }
      const o = origenGancho(cuerpo);
      if (Math.hypot(anclador.gancho.x - o.x, anclador.gancho.y - o.y) > ALCANCE_CUERDA) {
        anclador.estado = 'guardado';
        anclador.gancho = null;
        evento = 'fallar';
        break;
      }
    }
  } else if (anclador.estado === 'jalando') {
    const o = origenGancho(cuerpo);
    const dx = anclador.punto.x - o.x;
    const dy = anclador.punto.y - o.y;
    const distancia = Math.hypot(dx, dy);
    const avance = VELOCIDAD_JALON * paso;
    const pared = (superficies || []).find((s) => s.id === anclador.punto.superficie);
    const tocaPared = pared && cuerpo.x < pared.x + pared.w && cuerpo.x + cuerpo.w > pared.x
      && cuerpo.y < pared.y + pared.h && cuerpo.y + cuerpo.h > pared.y;
    if (distancia <= Math.max(DISTANCIA_LLEGADA, avance) || tocaPared) {
      // Llega: queda pegado al lado de la pared que miraba, sin velocidad.
      if (pared) cuerpo.x = cuerpo.mirando >= 0 ? pared.x - cuerpo.w : pared.x + pared.w;
      cuerpo.vx = 0;
      cuerpo.vy = 0;
      anclador.estado = 'guardado';
      anclador.gancho = null;
      anclador.punto = null;
      evento = 'llegar';
    } else {
      cuerpo.vx = (dx / distancia) * VELOCIDAD_JALON;
      cuerpo.vy = (dy / distancia) * VELOCIDAD_JALON;
      cuerpo.x += (dx / distancia) * avance;
      cuerpo.y += (dy / distancia) * avance;
      cuerpo.enSuelo = false;
    }
  }
  return evento;
}

export function controlaCuerpo(anclador) {
  return anclador?.estado === 'jalando';
}

// Saltar o recibir daño suelta la cuerda.
export function soltarAnclador(anclador) {
  anclador.estado = 'guardado';
  anclador.gancho = null;
  anclador.punto = null;
}
