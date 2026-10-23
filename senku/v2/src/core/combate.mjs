// Lógica pura de combate y salud para Senku 2.
// Política configurable: HP máximo y vidas iniciales pueden venir definidos o en null (sin límite/sin pérdida).
// Incluye golpe, invulnerabilidad breve, detección de pisotón (stomp) y resolución de encuentros.
// Sin dependencias de DOM ni navegador.

import { solapanAABB } from './fisica.mjs';
import { daniarEnemigo } from './enemigos.mjs';

export const TIEMPO_INVULNERABILIDAD_DEFECTO = 1.0; // 1 s de invulnerabilidad tras cada golpe
export const FUERZA_REBOTE_PISOTON_DEFECTO = 500;   // Impulso hacia arriba (px/s) tras pisotón
export const DANO_GOLPE_DEFECTO = 1;
export const HP_INICIAL_SENKU = 100;                // Senku empieza con 100 de vida por defecto

export function crearEstadoCombate({
  hpMax = null,
  hpInicial = null,
  vidasIniciales = null,
  tiempoInvulnerabilidad = TIEMPO_INVULNERABILIDAD_DEFECTO,
  fuerzaRebotePisoton = FUERZA_REBOTE_PISOTON_DEFECTO,
} = {}) {
  const hpMaxVal = hpMax !== undefined ? hpMax : null;
  const hpVal = hpInicial !== null && hpInicial !== undefined
    ? hpInicial
    : (hpMaxVal !== null ? hpMaxVal : null);
  const vidasVal = vidasIniciales !== undefined ? vidasIniciales : null;

  const estaDerrotado = vidasVal !== null ? vidasVal <= 0 : false;

  return {
    hpMax: hpMaxVal,
    hp: hpVal,
    vidas: vidasVal,
    invulnerable: false,
    tiempoInvulnerable: 0,
    duracionInvulnerabilidad: Math.max(0, tiempoInvulnerabilidad),
    fuerzaRebotePisoton,
    derrotado: estaDerrotado,
    totalGolpesRecibidos: 0,
    totalPisotonesDados: 0,
  };
}

// Actualiza el reloj de invulnerabilidad
export function actualizarCombate(estadoCombate, dt = 0) {
  if (!estadoCombate || dt <= 0) return estadoCombate;

  if (estadoCombate.tiempoInvulnerable > 0) {
    estadoCombate.tiempoInvulnerable = Math.max(0, estadoCombate.tiempoInvulnerable - dt);
    if (estadoCombate.tiempoInvulnerable === 0) {
      estadoCombate.invulnerable = false;
    }
  }

  return estadoCombate;
}

// Detecta si una colisión corresponde a un pisotón (jugador cayendo sobre el enemigo)
export function detectarPisoton(jugador, enemigo, { tolerancia = 14 } = {}) {
  if (!jugador || !enemigo || !enemigo.vivo) {
    return false;
  }

  if (enemigo.pisable === false) {
    return false;
  }

  if (!solapanAABB(jugador, enemigo)) {
    return false;
  }

  // Debe estar descendiendo en el aire
  if (jugador.vy <= 0) {
    return false;
  }

  // La base de los pies de Senku debe estar en la mitad superior de la caja del enemigo
  const basePiesJugador = jugador.y + jugador.h;
  const umbralSuperiorEnemigo = enemigo.y + enemigo.h * 0.65;

  return basePiesJugador <= umbralSuperiorEnemigo + tolerancia;
}

// Aplica el efecto de un pisotón: daña al enemigo y hace rebotar al jugador
export function aplicarPisoton(jugador, enemigo, estadoCombate = null, opciones = {}) {
  if (!jugador || !enemigo) {
    return { exito: false, motivo: 'entidades_invalidas' };
  }

  const dano = opciones.dano ?? DANO_GOLPE_DEFECTO;
  const resultadoDanio = daniarEnemigo(enemigo, dano);

  const fuerzaRebote = estadoCombate?.fuerzaRebotePisoton
    ?? opciones.fuerzaRebote
    ?? FUERZA_REBOTE_PISOTON_DEFECTO;

  jugador.vy = -Math.abs(fuerzaRebote);
  jugador.enSuelo = false;

  if (estadoCombate) {
    estadoCombate.totalPisotonesDados = (estadoCombate.totalPisotonesDados || 0) + 1;
  }

  return {
    exito: true,
    enemigoDerrotado: resultadoDanio.derrotado,
    hpRestanteEnemigo: resultadoDanio.hpRestante,
  };
}

// Aplica un golpe al jugador según la política de salud y vidas configurada
export function aplicarGolpeJugador(estadoCombate, dano = null) {
  if (!estadoCombate) {
    return { golpeado: false, motivo: 'sin_estado' };
  }

  if (estadoCombate.derrotado) {
    return { golpeado: false, motivo: 'derrotado' };
  }

  if (estadoCombate.invulnerable) {
    return { golpeado: false, motivo: 'invulnerable' };
  }

  // Activa invulnerabilidad de 1 s tras el golpe
  estadoCombate.invulnerable = true;
  estadoCombate.tiempoInvulnerable = estadoCombate.duracionInvulnerabilidad;
  estadoCombate.totalGolpesRecibidos = (estadoCombate.totalGolpesRecibidos || 0) + 1;

  const danoEfectivo = dano !== null && dano !== undefined ? dano : DANO_GOLPE_DEFECTO;
  let murio = false;

  // Política A: Barra de HP activa (hpMax !== null)
  if (estadoCombate.hpMax !== null) {
    const hpActual = estadoCombate.hp ?? estadoCombate.hpMax;
    estadoCombate.hp = Math.max(0, hpActual - danoEfectivo);

    if (estadoCombate.hp === 0) {
      murio = true;
      if (estadoCombate.vidas !== null) {
        estadoCombate.vidas -= 1;
        if (estadoCombate.vidas <= 0) {
          estadoCombate.vidas = 0;
          estadoCombate.derrotado = true;
        } else {
          // Reaparece o restaura vida completa para la siguiente vida
          estadoCombate.hp = estadoCombate.hpMax;
        }
      } else {
        // Al llegar a 0 de vida: derrotado para reiniciar escena con vida llena
        estadoCombate.derrotado = true;
      }
    }
  }
  // Política B: Sin barra de HP, cada golpe cuesta una vida (hpMax === null y vidas !== null)
  else if (estadoCombate.vidas !== null) {
    estadoCombate.vidas -= 1;
    if (estadoCombate.vidas <= 0) {
      estadoCombate.vidas = 0;
      estadoCombate.derrotado = true;
      murio = true;
    }
  }
  // Política C: Todo en null (sin barra ni vidas limitadas; decisión D5 pendiente)
  // No se rompe: registra el golpe e invulnerabilidad sin pérdida numérica.

  return {
    golpeado: true,
    hp: estadoCombate.hp,
    vidas: estadoCombate.vidas,
    derrotado: estadoCombate.derrotado,
    muerto: murio,
  };
}

// Restaura la salud completa del jugador y limpia estados de combate (reinicio de escena)
export function reiniciarCombate(estadoCombate) {
  if (!estadoCombate) return estadoCombate;
  if (estadoCombate.hpMax !== null) {
    estadoCombate.hp = estadoCombate.hpMax;
  }
  estadoCombate.invulnerable = false;
  estadoCombate.tiempoInvulnerable = 0;
  estadoCombate.derrotado = false;
  return estadoCombate;
}

// Resuelve la interacción completa entre Senku y un enemigo
export function resolverContactoEnemigo(
  jugador,
  enemigo,
  estadoCombate,
  { toleranciaPisoton = 14, retroceso = true, fuerzaRetroceso = 220 } = {}
) {
  if (!jugador || !enemigo || !enemigo.vivo) {
    return { contacto: false };
  }

  if (!solapanAABB(jugador, enemigo)) {
    return { contacto: false };
  }

  // 1. Evaluar si es pisotón
  if (detectarPisoton(jugador, enemigo, { tolerancia: toleranciaPisoton })) {
    const resultado = aplicarPisoton(jugador, enemigo, estadoCombate);
    return {
      contacto: true,
      tipo: 'pisoton',
      exito: resultado.exito,
      enemigoDerrotado: resultado.enemigoDerrotado,
    };
  }

  // 2. Colisión frontal/lateral: golpe hacia Senku
  const resultadoGolpe = aplicarGolpeJugador(estadoCombate, enemigo.dano);

  if (resultadoGolpe.golpeado && retroceso) {
    const direccionRetroceso = jugador.x < enemigo.x ? -1 : 1;
    jugador.vx = direccionRetroceso * fuerzaRetroceso;
  }

  return {
    contacto: true,
    tipo: 'golpe',
    golpeado: resultadoGolpe.golpeado,
    motivo: resultadoGolpe.motivo,
    derrotado: estadoCombate?.derrotado ?? false,
    muerto: resultadoGolpe.muerto ?? false,
    hp: estadoCombate?.hp ?? null,
  };
}
