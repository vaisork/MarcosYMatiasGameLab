// Motor de física 2D para Senku 2: movimiento lateral, gravedad, salto variable y colisión AABB con plataformas.
// Lógica pura: sin dependencias de DOM ni navegador.

export const GRAVEDAD_DEFECTO = 1500; // px/s²
export const VELOCIDAD_HORIZONTAL_DEFECTO = 360; // px/s
export const FUERZA_SALTO_DEFECTO = 620; // px/s
export const SUAVIDAD_DEFECTO = 14;

// Constantes configurables para salto variable (decisiones de diseño de Matías)
export const TIEMPO_SALTO_MAX_DEFECTO = 0.25; // s: tiempo máximo de mantenimiento de impulso
export const VELOCIDAD_CORTE_SALTO_DEFECTO = 260; // px/s: velocidad ascendente máxima al soltar antes
export const FACTOR_CORTE_SALTO_DEFECTO = 0.5; // factor reductor de velocidad vertical al cortar

export function crearCuerpo({
  x = 0,
  y = 0,
  w = 48,
  h = 36,
  vx = 0,
  vy = 0,
  enSuelo = false,
  mirando = 1, // 1: derecha, -1: izquierda
  saltando = false,
  tiempoSalto = 0,
} = {}) {
  return { x, y, w, h, vx, vy, enSuelo, mirando, saltando, tiempoSalto };
}

// Comprueba solapamiento AABB simple entre dos rectángulos {x, y, w, h}
export function solapanAABB(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// Avanza un paso de simulación física con paso de tiempo dt fijo o acotado.
export function actualizarCuerpo(
  cuerpo,
  entrada = {},
  plataformas = [],
  limites = null,
  dt = 1 / 60,
  config = {}
) {
  const paso = Math.max(0, Math.min(dt, 0.05));
  if (paso === 0) return cuerpo;

  const velMax = config.velocidadHorizontal ?? VELOCIDAD_HORIZONTAL_DEFECTO;
  const fuerzaSalto = config.fuerzaSalto ?? FUERZA_SALTO_DEFECTO;
  const gravedad = config.gravedad ?? GRAVEDAD_DEFECTO;
  const suavidad = config.suavidadHorizontal ?? SUAVIDAD_DEFECTO;
  const tiempoSaltoMax = config.tiempoSaltoMax ?? TIEMPO_SALTO_MAX_DEFECTO;
  const velocidadCorte = config.velocidadCorteSalto ?? VELOCIDAD_CORTE_SALTO_DEFECTO;
  const factorCorte = config.factorCorteSalto ?? FACTOR_CORTE_SALTO_DEFECTO;
  const saltoVariableHabilitado = config.saltoVariable !== false;

  // Inicializar propiedades de salto si no existen
  if (cuerpo.saltando === undefined) {
    cuerpo.saltando = false;
    cuerpo.tiempoSalto = 0;
  }

  // 1. Entrada horizontal
  const dir = (entrada.derecha ? 1 : 0) - (entrada.izquierda ? 1 : 0);
  if (dir !== 0) {
    cuerpo.mirando = dir;
  }
  const targetVx = dir * velMax;
  cuerpo.vx += (targetVx - cuerpo.vx) * Math.min(1, paso * suavidad);
  if (dir === 0 && Math.abs(cuerpo.vx) < 1) {
    cuerpo.vx = 0;
  }

  // 2. Salto y control de salto variable
  if (entrada.salto && cuerpo.enSuelo) {
    cuerpo.vy = -fuerzaSalto;
    cuerpo.enSuelo = false;
    cuerpo.saltando = true;
    cuerpo.tiempoSalto = 0;
  } else if (cuerpo.saltando && saltoVariableHabilitado) {
    cuerpo.tiempoSalto += paso;
    if (!entrada.salto) {
      // Soltar antes corta el salto (toque rápido = salto pequeño)
      cuerpo.saltando = false;
      if (cuerpo.vy < -velocidadCorte) {
        cuerpo.vy = Math.max(cuerpo.vy * factorCorte, -velocidadCorte);
      }
    } else if (cuerpo.tiempoSalto >= tiempoSaltoMax || cuerpo.vy >= 0) {
      cuerpo.saltando = false;
    }
  }

  // 3. Aplicar gravedad
  cuerpo.vy += gravedad * paso;

  // 4. Movimiento horizontal
  cuerpo.x += cuerpo.vx * paso;

  // Restricción por límites de escena horizontal
  if (limites) {
    if (limites.minX !== undefined && cuerpo.x < limites.minX) {
      cuerpo.x = limites.minX;
      cuerpo.vx = 0;
    }
    if (limites.maxX !== undefined && cuerpo.x + cuerpo.w > limites.maxX) {
      cuerpo.x = limites.maxX - cuerpo.w;
      cuerpo.vx = 0;
    }
  }

  // 5. Movimiento vertical
  const yAnterior = cuerpo.y;
  cuerpo.y += cuerpo.vy * paso;
  cuerpo.enSuelo = false;

  // 6. Colisión con plataformas (unidireccionales desde arriba / suelo)
  if (cuerpo.vy >= 0 && Array.isArray(plataformas)) {
    const pieAnterior = yAnterior + cuerpo.h;
    const pieNuevo = cuerpo.y + cuerpo.h;
    const margenTolerancia = Math.max(10, Math.abs(cuerpo.vy * paso) + 4);

    for (const plat of plataformas) {
      // Solapamiento horizontal
      const solapeX = cuerpo.x + cuerpo.w > plat.x && cuerpo.x < plat.x + plat.w;
      if (!solapeX) continue;

      // El pie debe haber estado encima (o muy cerca del borde superior) y ahora cruzar el borde superior
      if (pieAnterior <= plat.y + margenTolerancia && pieNuevo >= plat.y) {
        cuerpo.y = plat.y - cuerpo.h;
        cuerpo.vy = 0;
        cuerpo.enSuelo = true;
        cuerpo.saltando = false;
        cuerpo.tiempoSalto = 0;
        break;
      }
    }
  }

  // Restricción por límites verticales
  if (limites) {
    if (limites.minY !== undefined && cuerpo.y < limites.minY) {
      cuerpo.y = limites.minY;
      if (cuerpo.vy < 0) cuerpo.vy = 0;
    }
    if (limites.maxY !== undefined && cuerpo.y + cuerpo.h > limites.maxY) {
      cuerpo.y = limites.maxY - cuerpo.h;
      cuerpo.vy = 0;
      cuerpo.enSuelo = true;
      cuerpo.saltando = false;
      cuerpo.tiempoSalto = 0;
    }
  }

  return cuerpo;
}
