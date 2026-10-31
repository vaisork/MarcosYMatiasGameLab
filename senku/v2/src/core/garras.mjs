// Garras de escalada de Senku 2 (maestro, punto 6): permanentes; trepar paredes y montañas.
// Las paredes (tipo 'pared') son sólidas de lado para todos; con garras, empujar hacia ellas
// en el aire las agarra. Agarrado: salto/arriba trepa, abajo baja, alejarse suelta y salto
// alejándose impulsa hacia afuera. Al llegar arriba, Senku sube al borde.
// Lógica pura: sin DOM ni Canvas.

export const VELOCIDAD_TREPAR = 230; // px/s
export const VELOCIDAD_BAJAR = 300;
export const IMPULSO_SALTO_PARED = { vx: 380, vy: -600 };

export function esPared(plat) {
  return plat?.tipo === 'pared';
}

// Empuja al cuerpo fuera de las paredes por el lado más cercano. Devuelve {lado, pared}
// (lado 1: pared a la derecha del gato, -1: a la izquierda) o null.
export function resolverParedes(cuerpo, paredes) {
  let contacto = null;
  for (const p of paredes || []) {
    if (!esPared(p)) continue;
    const solapa = cuerpo.x < p.x + p.w && cuerpo.x + cuerpo.w > p.x
      && cuerpo.y < p.y + p.h && cuerpo.y + cuerpo.h > p.y;
    // Si los pies ya están en la cima de la pared, es suelo, no lado.
    if (!solapa || cuerpo.y + cuerpo.h <= p.y + 6) continue;
    const empujeIzq = cuerpo.x + cuerpo.w - p.x;
    const empujeDer = p.x + p.w - cuerpo.x;
    if (empujeIzq < empujeDer) {
      cuerpo.x = p.x - cuerpo.w;
      contacto = { lado: 1, pared: p };
    } else {
      cuerpo.x = p.x + p.w;
      contacto = { lado: -1, pared: p };
    }
    if (Math.sign(cuerpo.vx) === contacto.lado) cuerpo.vx = 0;
  }
  return contacto;
}

// Pared pegada al costado del cuerpo (a 2 px o menos).
export function paredAlLado(cuerpo, paredes) {
  for (const p of paredes || []) {
    if (!esPared(p)) continue;
    const vertical = cuerpo.y + cuerpo.h > p.y + 6 && cuerpo.y < p.y + p.h;
    if (!vertical) continue;
    if (Math.abs(cuerpo.x + cuerpo.w - p.x) <= 2) return { lado: 1, pared: p };
    if (Math.abs(cuerpo.x - (p.x + p.w)) <= 2) return { lado: -1, pared: p };
  }
  return null;
}

// Intenta agarrarse o mueve al cuerpo agarrado. Devuelve el evento del paso o null.
// Mientras `cuerpo.agarrado` exista, el llamador no aplica la física normal.
export function actualizarGarras(cuerpo, entrada, paredes, dt, { tieneGarras = false } = {}) {
  const paso = Math.max(0, Math.min(dt, 0.05));
  const hacia = (entrada?.derecha ? 1 : 0) - (entrada?.izquierda ? 1 : 0);
  const saltoNuevo = Boolean(entrada?.salto) && !cuerpo.saltoPresionadoGarras;
  cuerpo.saltoPresionadoGarras = Boolean(entrada?.salto);

  if (!cuerpo.agarrado) {
    if (!tieneGarras || cuerpo.enSuelo) return null;
    const lado = paredAlLado(cuerpo, paredes);
    if (lado && hacia === lado.lado) {
      cuerpo.agarrado = { pared: lado.pared.id, lado: lado.lado };
      cuerpo.vx = 0;
      cuerpo.vy = 0;
      cuerpo.saltando = false;
      return 'agarrar';
    }
    return null;
  }

  const pared = (paredes || []).find((p) => p.id === cuerpo.agarrado.pared);
  const lado = cuerpo.agarrado.lado;
  if (!pared) {
    cuerpo.agarrado = null;
    return 'soltar';
  }
  if (hacia === -lado) {
    cuerpo.agarrado = null;
    if (saltoNuevo) {
      cuerpo.vx = -lado * IMPULSO_SALTO_PARED.vx;
      cuerpo.vy = IMPULSO_SALTO_PARED.vy;
      cuerpo.mirando = -lado;
      return 'saltar-pared';
    }
    return 'soltar';
  }
  const sube = Boolean(entrada?.salto || entrada?.arriba);
  const baja = Boolean(entrada?.abajo);
  cuerpo.vx = 0;
  cuerpo.vy = sube ? -VELOCIDAD_TREPAR : baja ? VELOCIDAD_BAJAR : 0;
  cuerpo.y += cuerpo.vy * paso;
  cuerpo.x = lado === 1 ? pared.x - cuerpo.w : pared.x + pared.w;
  cuerpo.mirando = lado;

  // Coronar: con la cabeza por encima del borde, sube a la cima.
  if (cuerpo.y + cuerpo.h * 0.5 <= pared.y) {
    cuerpo.y = pared.y - cuerpo.h;
    cuerpo.x = lado === 1 ? pared.x : pared.x + pared.w - cuerpo.w;
    cuerpo.vy = 0;
    cuerpo.enSuelo = true;
    cuerpo.agarrado = null;
    return 'coronar';
  }
  if (cuerpo.y + cuerpo.h >= pared.y + pared.h) {
    cuerpo.agarrado = null;
    return 'soltar';
  }
  return null;
}
