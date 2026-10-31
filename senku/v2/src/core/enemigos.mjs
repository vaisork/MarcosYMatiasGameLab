// Lógica pura de enemigos para Senku 2: creación, patrulla simple y daño.
// Sin dependencias de DOM ni navegador; tolerante a valores creativos nulos.

import { obtenerPlantillaEnemigo } from '../data/enemigos.mjs';

export function crearEnemigo({
  id = null,
  tipo = 'generico',
  x = 0,
  y = 0,
  w = null,
  h = null,
  vx = 0,
  vy = 0,
  mirando = 1,
  velocidad = null,
  patrulla = null,
  hp = undefined,
  dano = undefined,
  pisable = undefined,
  vivo = true,
  color = null,
  colorDetalle = null,
  comportamiento = null,
  variante = null,
  oleada = 1,
} = {}) {
  const plantilla = obtenerPlantillaEnemigo(tipo);

  const anchoFinal = w ?? plantilla?.ancho ?? 32;
  const altoFinal = h ?? plantilla?.alto ?? 32;
  const velocidadFinal = velocidad ?? plantilla?.velocidadPatrulla ?? 0;
  const hpFinal = hp !== undefined ? hp : (plantilla?.hp ?? null);
  const danoFinal = (dano !== undefined && dano !== null) ? dano : (plantilla?.dano ?? null);
  const pisableFinal = pisable !== undefined ? Boolean(pisable) : (plantilla?.pisable ?? true);
  const colorFinal = color ?? plantilla?.color ?? '#888888';
  const colorDetalleFinal = colorDetalle ?? plantilla?.colorDetalle ?? '#444444';

  const enemigoId = id || `enemigo-${Math.random().toString(36).slice(2, 9)}`;

  // Normalización de patrulla
  let configPatrulla = null;
  if (patrulla) {
    configPatrulla = {
      minX: patrulla.minX !== undefined ? patrulla.minX : null,
      maxX: patrulla.maxX !== undefined ? patrulla.maxX : null,
    };
  }

  const estaVivo = Boolean(vivo) && (hpFinal === null || hpFinal > 0);

  return {
    id: enemigoId,
    tipo,
    x,
    y,
    w: anchoFinal,
    h: altoFinal,
    vx,
    vy,
    mirando: mirando < 0 ? -1 : 1,
    velocidad: velocidadFinal,
    patrulla: configPatrulla,
    hp: hpFinal,
    dano: danoFinal,
    pisable: pisableFinal,
    vivo: estaVivo,
    color: colorFinal,
    colorDetalle: colorDetalleFinal,
    comportamiento: comportamiento || 'patrulla',
    variante: variante || 'cafe',
    oleada,
    activo: oleada <= 1,
    baseY: y,
    fase: 0,
  };
}

// Avanza la simulación del enemigo un intervalo dt (patrulla horizontal simple).
export function actualizarEnemigo(enemigo, dt = 0, limites = null, jugador = null) {
  if (!enemigo || !enemigo.vivo || dt <= 0) {
    return enemigo;
  }

  const paso = Math.max(0, Math.min(dt, 0.5));
  const velocidad = enemigo.velocidad ?? 0;
  enemigo.fase += paso;

  // Retroceso suave al recibir golpe de Senku
  if (enemigo.tiempoRetroceso > 0) {
    enemigo.tiempoRetroceso = Math.max(0, enemigo.tiempoRetroceso - paso);
    enemigo.x += enemigo.vx * paso;
    enemigo.vx *= Math.max(0, 1 - paso * 6);
    if (limites) {
      enemigo.x = Math.max(limites.minX ?? 0,
        Math.min((limites.maxX ?? Infinity) - enemigo.w, enemigo.x));
    }
    return enemigo;
  }

  if (enemigo.comportamiento === 'salta') {
    enemigo.y = enemigo.baseY - Math.abs(Math.sin(enemigo.fase * 3.2)) * 72;
  } else {
    enemigo.y = enemigo.baseY;
  }

  if (jugador && (enemigo.comportamiento === 'persigue' || enemigo.comportamiento === 'emboscada')) {
    const distancia = jugador.x - enemigo.x;
    const alcance = enemigo.comportamiento === 'emboscada' ? 430 : 600;
    if (Math.abs(distancia) < alcance) {
      enemigo.mirando = distancia < 0 ? -1 : 1;
      const impulso = enemigo.comportamiento === 'emboscada' && enemigo.fase % 3 > 2.2 ? 2.1 : 1;
      enemigo.vx = enemigo.mirando * velocidad * impulso;
      enemigo.x += enemigo.vx * paso;

      // Respetar límite de patrulla si está configurado para no salir de su pantalla
      if (enemigo.patrulla) {
        if (enemigo.patrulla.minX !== null && enemigo.x < enemigo.patrulla.minX) {
          enemigo.x = enemigo.patrulla.minX;
        }
        if (enemigo.patrulla.maxX !== null && enemigo.x + enemigo.w > enemigo.patrulla.maxX) {
          enemigo.x = enemigo.patrulla.maxX - enemigo.w;
        }
      }

      if (limites) enemigo.x = Math.max(limites.minX ?? 0,
        Math.min((limites.maxX ?? Infinity) - enemigo.w, enemigo.x));
      return enemigo;
    }
  }

  if (velocidad > 0) {
    enemigo.vx = enemigo.mirando * velocidad;
    enemigo.x += enemigo.vx * paso;

    // Control de patrulla por rango de datos
    if (enemigo.patrulla) {
      if (enemigo.mirando > 0 && enemigo.patrulla.maxX !== null) {
        if (enemigo.x + enemigo.w >= enemigo.patrulla.maxX) {
          enemigo.x = enemigo.patrulla.maxX - enemigo.w;
          enemigo.mirando = -1;
          enemigo.vx = -velocidad;
        }
      } else if (enemigo.mirando < 0 && enemigo.patrulla.minX !== null) {
        if (enemigo.x <= enemigo.patrulla.minX) {
          enemigo.x = enemigo.patrulla.minX;
          enemigo.mirando = 1;
          enemigo.vx = velocidad;
        }
      }
    }

    // Restricción por límites de escena si se proporcionan
    if (limites) {
      if (limites.minX !== undefined && enemigo.x < limites.minX) {
        enemigo.x = limites.minX;
        enemigo.mirando = 1;
      }
      if (limites.maxX !== undefined && enemigo.x + enemigo.w > limites.maxX) {
        enemigo.x = limites.maxX - enemigo.w;
        enemigo.mirando = -1;
      }
    }
  }

  return enemigo;
}

// Actualiza una lista de enemigos
export function actualizarEnemigos(enemigos = [], dt = 0, limites = null, jugador = null) {
  if (!Array.isArray(enemigos)) return [];
  for (const enemigo of enemigos) {
    actualizarEnemigo(enemigo, dt, limites, jugador);
  }
  return enemigos;
}

// Aplica daño a un enemigo. Si hp es null, un golpe exitoso lo derrota.
export function daniarEnemigo(enemigo, cantidad = 1) {
  if (!enemigo || !enemigo.vivo) {
    return { afectado: false, derrotado: false };
  }

  if (enemigo.hp === null) {
    // Sin HP numérico (valor creativo pendiente): el impacto lo derrota directamente
    enemigo.vivo = false;
    return { afectado: true, derrotado: true, hpRestante: null };
  }

  const danoAplicado = Math.max(1, cantidad);
  enemigo.hp -= danoAplicado;

  if (enemigo.hp <= 0) {
    enemigo.hp = 0;
    enemigo.vivo = false;
    return { afectado: true, derrotado: true, hpRestante: 0 };
  }

  return { afectado: true, derrotado: false, hpRestante: enemigo.hp };
}

export function estaVivo(enemigo) {
  return Boolean(enemigo && enemigo.vivo);
}
