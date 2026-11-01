// Punto de entrada principal para Senku 2 (primera pantalla: Taquería).
// Conecta guardado/migración, escena, física, entrada y renderizado canvas letterbox.

import { iniciar } from './core/migracion.mjs';
import { guardar } from './core/store.mjs';
import { obtenerAlmacen } from './core/almacen.mjs';
import {
  ID_ORIGINAL,
  ID_RATA,
  ID_SECRETO_LEGACY,
  obtenerTrajeActivo,
  tieneTraje,
  equiparTraje,
  alternarTraje,
  desbloquearTraje,
} from './core/trajes_activo.mjs';
import { crearCuerpo, actualizarCuerpo, solapanAABB, solapanRecogible, ANCHO_GATO_JUEGO, ALTURA_GATO_JUEGO,
  deslizInvulnerable } from './core/fisica.mjs';
import { crearRegistroEscenas } from './core/escenas.mjs';
import { escenaCiudad } from './data/escenas/ciudad.mjs';
import { escenaTaqueria } from './data/escenas/taqueria.mjs';
import { escenaDesierto } from './data/escenas/desierto.mjs';
import { escenaDespenadero } from './data/escenas/despenadero.mjs';
import { crearAnclador, soltarAnclador } from './core/anclador.mjs';
import { pasoMovilidad } from './core/movilidad.mjs';
import { dibujarDespenadero, dibujarAnclador } from './render/despenadero.mjs';
import { escenaCima, ARENA, SUELO_CIMA } from './data/escenas/cima.mjs';
import { ARENA_BALAM, crearBalam, despertarBalam, actualizarBalam, golpearBalam, danoDeBalam, esPisonBalam } from './core/jefe_balam.mjs';
import { dibujarBalam, dibujarBarraBalam } from './render/balam.mjs';
import { resumenCapitulo } from './core/resumen.mjs';
import { mostrarFinal } from './ui/final.mjs';
import { crearMusica, PIEZA_POR_ESCENA } from './audio/musica.mjs';
import { mostrarPortada, debeMostrarPortada } from './ui/portada.mjs';
import { crearJefe, despertar, actualizarJefe, golpearJefe, danoAJugador, esPisoton } from './core/jefe_gato.mjs';
import { crearLanzador, actualizarDisparo, actualizarProyectiles } from './core/lanzador.mjs';
import { dibujarJefe, dibujarProyectiles, dibujarLanzadorEnLomo, dibujarObjetoLanzador,
  dibujarBarraJefe, dibujarPuertaArena } from './render/cima.mjs';
import { escenaReja } from './data/escenas/reja.mjs';
import { escenasGuatemala } from './data/escenas/guatemala.mjs';
import { crearManejadorEntrada } from './core/entrada.mjs';
import { crearEnemigo, actualizarEnemigos } from './core/enemigos.mjs';
import {
  crearEstadoCombate,
  actualizarCombate,
  resolverContactoEnemigo,
  reiniciarCombate,
  HP_INICIAL_SENKU,
  TIEMPO_INVULNERABILIDAD_DEFECTO,
  atacarEnemigo,
  aplicarGolpeJugador,
} from './core/combate.mjs';
import { recogerBotiquin } from './core/botiquin.mjs';
import { ganarChurus, comprarTraje as comprarTrajeEconomia, equipar } from './core/economia.mjs';
import { TRAJES } from './data/trajes.mjs';

// Decisión de diseño: Senku inicia con 100 HP y 1 s de invulnerabilidad tras ser golpeado
export const HP_INICIAL_DEFECTO = HP_INICIAL_SENKU;
export const TIEMPO_INVULNERABILIDAD_JUEGO = TIEMPO_INVULNERABILIDAD_DEFECTO;
import {
  ANCHO_LOGICO,
  ALTO_LOGICO,
  ajustarLienzoLetterbox,
  crearCatalogoArte,
  dibujarAvisoCarga,
  rutasArteEscena,
  destinosEscena,
  renderizarEscena,
} from './render/canvas.mjs';
import {
  HOJAS_JUGADOR,
  IMAGENES_OBJETO,
  crearAnimadorEnemigos,
  dibujarEnemigo,
  dibujarJugador,
  resolverRutaArte,
  rutaFondoEscena,
  rutasPrecargaArte,
} from './render/sprites.mjs';
import { montarMenu } from './ui/menu.mjs';

export const CATALOGO_MENU = Object.values(TRAJES).map((traje) => ({
  ...traje,
  menu: resolverRutaArte(traje.menu),
  sprite: resolverRutaArte(traje.sprite),
}));

// Alias histórico: adapta el catálogo de tarjetas a la forma indexada que espera la economía.
export const stubEconomia = Object.freeze({
  equipar,
  comprarTraje(estado, id, catalogo = TRAJES) {
    const indexado = Array.isArray(catalogo)
      ? Object.fromEntries(catalogo.filter((traje) => traje?.id).map((traje) => [traje.id, traje]))
      : catalogo;
    return comprarTrajeEconomia(estado, id, indexado);
  },
});

// Registro de Service Worker para soporte PWA y juego sin conexión
export function registrarServiceWorker(navegador = typeof navigator !== 'undefined' ? navigator : null) {
  if (!navegador || !('serviceWorker' in navegador)) {
    return Promise.resolve({ registrado: false, motivo: 'no_soportado' });
  }
  return navegador.serviceWorker
    .register('./sw.js')
    .then((registro) => ({ registrado: true, registro }))
    .catch((error) => ({ registrado: false, error }));
}

// Sincroniza variables CSS con el tamaño visual real del viewport en iOS/Android
export function sincronizarViewportCSS(documento = null, ventana = null) {
  if (!documento || !ventana) {
    return { ancho: 1280, alto: 720 };
  }
  const vv = ventana.visualViewport;
  const alto = vv ? Math.round(vv.height) : (ventana.innerHeight || documento.documentElement?.clientHeight || 720);
  const ancho = vv ? Math.round(vv.width) : (ventana.innerWidth || documento.documentElement?.clientWidth || 1280);

  if (documento.documentElement?.style?.setProperty) {
    documento.documentElement.style.setProperty('--vh', `${alto * 0.01}px`);
    documento.documentElement.style.setProperty('--app-height', `${alto}px`);
    documento.documentElement.style.setProperty('--app-width', `${ancho}px`);
  }

  return { ancho, alto };
}

// Controla el aviso discreto de orientación vertical (sugiere rotar sin bloquear interacción)
export function actualizarAvisoOrientacion(documento = null, ancho = 1280, alto = 720) {
  if (!documento || typeof documento.getElementById !== 'function') return;
  const aviso = documento.getElementById('aviso-orientacion');
  if (!aviso) return;
  const esVertical = alto > ancho;
  if (esVertical) {
    aviso.hidden = false;
    if (typeof aviso.removeAttribute === 'function') {
      aviso.removeAttribute('hidden');
    }
  } else {
    aviso.hidden = true;
    if (typeof aviso.setAttribute === 'function') {
      aviso.setAttribute('hidden', '');
    }
  }
}

// Sólo presentación: los efectos de armas todavía no están implementados.
export function actualizarControlesHabilidades(documento, estado) {
  for (const habilidad of ['disparar', 'lanzagranadas']) {
    const boton = documento.getElementById(`btn-${habilidad}`);
    if (boton) boton.hidden = estado?.habilidades?.[habilidad] !== true;
  }
}

// Sonidos retro sintetizados con Web Audio API (cero dependencias externas ni archivos de audio)
export function reproducirSonidoChuru(ventana = typeof window !== 'undefined' ? window : null) {
  try {
    const AudioCtx = ventana?.AudioContext || ventana?.webkitAudioContext;
    if (!AudioCtx) return;
    if (!ventana._senkuAudioCtx) {
      ventana._senkuAudioCtx = new AudioCtx();
    }
    const ctx = ventana._senkuAudioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now); // Re5 (D5)
    osc.frequency.setValueAtTime(880, now + 0.08); // La5 (A5)
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Silencioso en entornos sin soporte de audio
  }
}

export function reproducirSonidoMotor(ventana = typeof window !== 'undefined' ? window : null) {
  try {
    const AudioCtx = ventana?.AudioContext || ventana?.webkitAudioContext;
    if (!AudioCtx) return;
    if (!ventana._senkuAudioCtx) {
      ventana._senkuAudioCtx = new AudioCtx();
    }
    const ctx = ventana._senkuAudioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.linearRampToValueAtTime(110, now + 1.2);
    osc.frequency.linearRampToValueAtTime(85, now + 2.0);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 2.3);
  } catch {
    // Silencioso en entornos sin soporte de audio
  }
}

export function reproducirSonidoSalto(ventana = typeof window !== 'undefined' ? window : null) {
  try {
    const AudioCtx = ventana?.AudioContext || ventana?.webkitAudioContext;
    if (!AudioCtx) return;
    if (!ventana._senkuAudioCtx) {
      ventana._senkuAudioCtx = new AudioCtx();
    }
    const ctx = ventana._senkuAudioCtx;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.10);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  } catch {
    // Silencioso
  }
}

export function reproducirSonidoGolpe(ventana = typeof window !== 'undefined' ? window : null) {
  try {
    const AudioCtx = ventana?.AudioContext || ventana?.webkitAudioContext;
    if (!AudioCtx) return;
    if (!ventana._senkuAudioCtx) {
      ventana._senkuAudioCtx = new AudioCtx();
    }
    const ctx = ventana._senkuAudioCtx;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.09);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  } catch {
    // Silencioso
  }
}

export function reproducirSonidoDanio(ventana = typeof window !== 'undefined' ? window : null) {
  try {
    const AudioCtx = ventana?.AudioContext || ventana?.webkitAudioContext;
    if (!AudioCtx) return;
    if (!ventana._senkuAudioCtx) {
      ventana._senkuAudioCtx = new AudioCtx();
    }
    const ctx = ventana._senkuAudioCtx;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.14);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } catch {
    // Silencioso
  }
}

export function reproducirSonidoItem(ventana = typeof window !== 'undefined' ? window : null) {
  try {
    const AudioCtx = ventana?.AudioContext || ventana?.webkitAudioContext;
    if (!AudioCtx) return;
    if (!ventana._senkuAudioCtx) {
      ventana._senkuAudioCtx = new AudioCtx();
    }
    const ctx = ventana._senkuAudioCtx;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.08);
    osc.frequency.setValueAtTime(783.99, now + 0.16);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.34);
  } catch {
    // Silencioso
  }
}

// Señalización de fin de escena e indicaciones de misión
export function dibujarIndicadoresEscena(ctx, escena, senku, tiempo, estadoJugador) {
  if (!ctx || !escena) return;
  const tieneLlave = estadoJugador?.coleccionados?.includes('taqueria-recompensa-llave')
    || estadoJugador?.coleccionados?.includes('llave-camioneta');

  if (escena.id === 'taqueria') {
    // 1. Indicador en la camioneta (x: 140..340, y: 350..580)
    const pulsoY = Math.sin(tiempo * 5) * 6;
    ctx.save();
    if (tieneLlave) {
      ctx.fillStyle = 'rgba(16, 44, 18, 0.9)';
      ctx.fillRect(170, 370 + pulsoY, 180, 42);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.strokeRect(170, 370 + pulsoY, 180, 42);

      ctx.fillStyle = '#86efac';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛻 ¡SUBIR AHORA! [E]', 260, 396 + pulsoY);

      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.moveTo(250, 416 + pulsoY);
      ctx.lineTo(270, 416 + pulsoY);
      ctx.lineTo(260, 428 + pulsoY);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(30, 20, 10, 0.8)';
      ctx.fillRect(180, 380, 160, 32);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.strokeRect(180, 380, 160, 32);
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔒 Busca la llave →', 260, 401);
    }
    ctx.restore();

    // 2. Final de calle (x: 3720..3840)
    ctx.save();
    const pulsoX = Math.sin(tiempo * 5) * 8;
    // Barrera de rayas amarillas y negras
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(3760, 460, 40, 140);
    for (let by = 470; by < 590; by += 24) {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(3764, by, 32, 12);
    }
    // Letrero de fin de calle
    ctx.fillStyle = 'rgba(28, 25, 23, 0.92)';
    ctx.fillRect(3560, 360, 220, 74);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.strokeRect(3560, 360, 220, 74);

    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🛑 FIN DE CALLE', 3670, 388);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('← VUELVE A LA CAMIONETA', 3670 + pulsoX * 0.4, 416);
    ctx.restore();
  } else if (escena.id === 'reja') {
    ctx.save();
    const pulsoX = Math.sin(tiempo * 5) * 8;
    ctx.fillStyle = 'rgba(20, 35, 20, 0.9)';
    ctx.fillRect(8720, 380, 190, 68);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.strokeRect(8720, 380, 190, 68);

    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ENTRADA AL DESIERTO', 8815, 408);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('➔➔➔', 8815 + pulsoX, 434);
    ctx.restore();
  } else if (escena.id === 'desierto') {
    ctx.save();
    const pulso = Math.sin(tiempo * 5) * 6;
    ctx.fillStyle = 'rgba(40, 24, 10, 0.9)';
    ctx.fillRect(6180, 380, 180, 68);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.strokeRect(6180, 380, 180, 68);

    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏁 META DEL VIAJE', 6270, 408);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('➔ 🏆', 6270 + pulso, 434);
    ctx.restore();
  }
}

// Animación cinemática de la camioneta al arrancar y avanzar con la llave
export function dibujarAnimacionCamioneta(ctx, catalogoArte, viaje) {
  if (!ctx || !viaje) return;
  ctx.save();

  const t = viaje.tiempo;
  const imagenReja = catalogoArte.obtener(resolverRutaArte('assets/fondos/camioneta_reja.webp'));
  const imagenTaqueria = catalogoArte.obtener(resolverRutaArte('assets/fondos/taqueria_ciudad.webp'));
  const imagenDesierto = catalogoArte.obtener(resolverRutaArte('assets/fondos/desierto.webp'));

  if (t < 2.0) {
    // Fase 1: Arranque y vibración del motor en la taquería
    if (imagenTaqueria) {
      ctx.drawImage(imagenTaqueria, 0, 0, ANCHO_LOGICO, ALTO_LOGICO);
    }

    // Vibración del motor al encender
    const factorVibracion = Math.max(0, 1 - t / 2.2);
    const temblorX = Math.sin(t * 60) * 4 * factorVibracion;
    const temblorY = Math.cos(t * 45) * 2.5 * factorVibracion;

    // Recorte de la camioneta vibrando sobre la banqueta (x: 0..360, y: 340..620)
    if (imagenTaqueria) {
      ctx.drawImage(
        imagenTaqueria,
        0, 340, 360, 280,
        temblorX, 340 + temblorY, 360, 280
      );
    }

    // Bocanadas de humo animado saliendo del escape trasero (x ~ 310, y ~ 555)
    const numBocanadas = 12;
    for (let i = 0; i < numBocanadas; i++) {
      const tiempoHumo = (t * 3.5 + i * 0.28) % 1.5;
      const progreso = tiempoHumo / 1.5;
      const hx = 310 + progreso * 80 + Math.sin(i * 2 + t * 4) * 12;
      const hy = 555 - progreso * 45 - Math.sin(progreso * Math.PI) * 15;
      const radio = 8 + progreso * 28;
      const alpha = Math.max(0, (1 - progreso) * 0.65);

      ctx.beginPath();
      ctx.arc(hx, hy, radio, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(225, 218, 205, ${alpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(hx - 2, hy + 2, radio * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 170, 160, ${alpha * 0.8})`;
      ctx.fill();
    }

    // Chispas / destellos de ignición
    if (t < 0.8) {
      for (let s = 0; s < 4; s++) {
        const sx = 315 + Math.sin(t * 20 + s) * 20;
        const sy = 560 + Math.cos(t * 20 + s) * 10;
        ctx.fillStyle = s % 2 === 0 ? '#f59e0b' : '#ef4444';
        ctx.fillRect(sx, sy, 3, 3);
      }
    }
  } else {
    // Fase 2: Avance por la carretera hacia el parque del desierto
    if (imagenReja) {
      ctx.drawImage(imagenReja, 0, 0, ANCHO_LOGICO, ALTO_LOGICO);
    } else if (imagenDesierto) {
      ctx.drawImage(imagenDesierto, 0, 0, ANCHO_LOGICO, ALTO_LOGICO);
    }

    // Polvo levantado por las llantas en el camino
    const tAvance = t - 2.0;
    const velocidadLineas = (tAvance * 1200) % ANCHO_LOGICO;

    for (let p = 0; p < 8; p++) {
      const px = ((p * 160 - velocidadLineas * 0.5) % (ANCHO_LOGICO + 100) + ANCHO_LOGICO + 100) % (ANCHO_LOGICO + 100) - 50;
      const py = 580 + Math.sin(p + t * 6) * 10;
      const radioPolvo = 15 + Math.sin(p * 2) * 8;
      ctx.beginPath();
      ctx.arc(px, py, radioPolvo, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(210, 180, 140, 0.25)';
      ctx.fill();
    }

    // Líneas de velocidad en carretera
    ctx.strokeStyle = 'rgba(255, 245, 220, 0.35)';
    ctx.lineWidth = 2.5;
    for (let l = 0; l < 6; l++) {
      const ly = 380 + l * 40;
      const lx = ((l * 220 - velocidadLineas * 1.2) % ANCHO_LOGICO + ANCHO_LOGICO) % ANCHO_LOGICO;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + 140, ly);
      ctx.stroke();
    }

    // Velo suave para realzar el gran cartel de diálogo
    ctx.fillStyle = 'rgba(15, 10, 6, 0.45)';
    ctx.fillRect(0, 0, ANCHO_LOGICO, ALTO_LOGICO);
  }

  ctx.restore();
}

export function arrancarSenku2({
  documento = typeof document !== 'undefined' ? document : null,
  ventana = typeof window !== 'undefined' ? window : null,
} = {}) {
  if (!documento || !ventana) {
    return { iniciado: false, motivo: 'sin_entorno_dom' };
  }

  // 1. Cargar o migrar guardado tolerante
  const almacen = obtenerAlmacen(ventana);
  const resultadoInicio = iniciar(almacen);
  let estadoJugador = resultadoInicio.estado;
  actualizarControlesHabilidades(documento, estadoJugador);

  // 1b. Parámetro URL opcional (?traje=rata, ?skin=secret o ?secreto=1) para pruebas directas
  if (ventana?.location?.search) {
    try {
      const params = new URLSearchParams(ventana.location.search);
      if (params.get('traje') === 'rata' || params.get('skin') === 'secret' || params.get('secreto') === '1') {
        if (!tieneTraje(estadoJugador, ID_RATA)) {
          estadoJugador = desbloquearTraje(estadoJugador, ID_SECRETO_LEGACY).estado;
        }
        const resUrl = equiparTraje(estadoJugador, ID_RATA);
        if (resUrl.exito) {
          estadoJugador = resUrl.estado;
          if (almacen) guardar(almacen, estadoJugador);
        }
      }
      if (params.get('escena')) {
        estadoJugador = { ...estadoJugador, progreso: { ...estadoJugador.progreso, escena: params.get('escena') } };
      }
    } catch {
      // Ignorar fallo en parseo de URL
    }
  }

  // 1c. Registro de Service Worker para PWA (sin bloquear arranque)
  if (ventana?.navigator) {
    registrarServiceWorker(ventana.navigator).catch(() => {});
  }

  // 2. HUD: saldo de Churus y botón/indicador de traje activo
  const elChurus = documento.getElementById('saldo-churus');
  if (elChurus) {
    elChurus.textContent = String(estadoJugador.churus ?? 0);
  }

  // Elementos de la barra de vida en el HUD
  const elTextoVida = documento.getElementById('texto-vida');
  const elBarraVida = documento.getElementById('barra-vida-relleno');
  const elContenedorVida = documento.querySelector?.('.barra-vida-contenedor');

  function actualizarHUDVida() {
    if (estadoCombate && estadoCombate.hpMax !== null && estadoCombate.hp !== null) {
      const hp = Math.max(0, estadoCombate.hp);
      const hpMax = Math.max(1, estadoCombate.hpMax);
      const porcentaje = Math.max(0, Math.min(100, (hp / hpMax) * 100));

      if (elTextoVida) {
        elTextoVida.textContent = String(hp);
      }
      const elVidaMax = documento.getElementById('texto-vida-max');
      if (elVidaMax) elVidaMax.textContent = String(hpMax);
      if (elBarraVida) {
        elBarraVida.style.width = `${porcentaje}%`;
        if (porcentaje <= 25) {
          elBarraVida.style.background = '#ef4444';
        } else if (porcentaje <= 50) {
          elBarraVida.style.background = '#f59e0b';
        } else {
          elBarraVida.style.background = '#22c55e';
        }
      }
      if (elContenedorVida) {
        elContenedorVida.setAttribute('aria-valuenow', String(hp));
        elContenedorVida.setAttribute('aria-valuemax', String(hpMax));
      }
    }
  }

  let btnTraje = documento.getElementById('hud-traje');
  if (!btnTraje && documento.querySelector('.hud-superior')) {
    btnTraje = documento.createElement('button');
    btnTraje.id = 'hud-traje';
    btnTraje.className = 'hud-pildora';
    btnTraje.style.pointerEvents = 'auto';
    btnTraje.style.cursor = 'pointer';
    btnTraje.style.border = '2px solid rgba(255, 255, 255, 0.35)';
    btnTraje.style.background = 'rgba(30, 20, 15, 0.85)';
    btnTraje.style.color = '#fff';
    btnTraje.setAttribute('aria-label', 'Traje equipado');
    documento.querySelector('.hud-superior').appendChild(btnTraje);
  }

  // 2b. Menú de trajes modal integrado en index.html
  const modalMenu = documento.getElementById('modal-menu');
  const modalMenuFondo = documento.getElementById('modal-menu-fondo');
  const btnCerrarMenu = documento.getElementById('btn-cerrar-menu');
  const btnMenu = documento.getElementById('btn-menu');
  const contenedorMenu = documento.getElementById('contenedor-menu');
  let menuAbierto = false;
  let instanciaMenu = null;

  if (contenedorMenu) {
    instanciaMenu = montarMenu(contenedorMenu, {
      estado: estadoJugador,
      catalogo: CATALOGO_MENU,
      economia: stubEconomia,
      rutaChuru: resolverRutaArte(IMAGENES_OBJETO.churu),
      onCambioEstado(nuevoEstado) {
        estadoJugador = nuevoEstado;
        if (almacen) guardar(almacen, estadoJugador);
        refrescarVistaTraje();
      },
    });
  }

  function abrirMenu() {
    if (menuAbierto) return;
    menuAbierto = true;
    entrada.soltarTodo();
    if (modalMenu) {
      modalMenu.hidden = false;
      modalMenu.setAttribute('aria-hidden', 'false');
    }
    if (instanciaMenu) {
      instanciaMenu.actualizar(estadoJugador);
    }
    if (btnCerrarMenu) {
      btnCerrarMenu.focus();
    }
  }

  function cerrarMenu() {
    if (!menuAbierto) return;
    menuAbierto = false;
    if (modalMenu) {
      modalMenu.hidden = true;
      modalMenu.setAttribute('aria-hidden', 'true');
    }
    if (btnMenu) {
      btnMenu.focus();
    }
  }

  function alternarMenu() {
    if (menuAbierto) {
      cerrarMenu();
    } else {
      abrirMenu();
    }
  }

  if (btnMenu) {
    btnMenu.onclick = () => alternarMenu();
  }
  if (btnCerrarMenu) {
    btnCerrarMenu.onclick = () => cerrarMenu();
  }
  if (modalMenuFondo) {
    modalMenuFondo.onclick = () => cerrarMenu();
  }

  const btnPausa = documento.getElementById('btn-pausa');
  if (btnPausa) btnPausa.onclick = () => alternarMenu();
  const btnHablarRata = documento.getElementById('btn-hablar-rata');
  if (btnHablarRata) btnHablarRata.onclick = () => hablarConRata();

  let trajeActivo = obtenerTrajeActivo(estadoJugador);
  let catalogoArte = null;

  function refrescarVistaTraje() {
    actualizarControlesHabilidades(documento, estadoJugador);
    trajeActivo = obtenerTrajeActivo(estadoJugador);
    if (catalogoArte) catalogoArte.cargar(resolverRutaArte(HOJAS_JUGADOR[trajeActivo.id] || HOJAS_JUGADOR.original));
    if (senku) {
      senku.trajeId = trajeActivo.id;
      senku.color = trajeActivo.color;
      senku.colorBorde = trajeActivo.colorBorde;
      senku.etiqueta = trajeActivo.etiqueta;
    }
    if (btnTraje) {
      const poseeRata = tieneTraje(estadoJugador, ID_RATA);
      const icono = trajeActivo.id === ID_RATA ? '🐭' : '🐱';
      btnTraje.innerHTML = `<span class="icono">${icono}</span><span>${trajeActivo.etiqueta}</span>`;
      btnTraje.title = poseeRata
        ? 'Clic o pulsa T para cambiar de traje'
        : 'Traje Rata bloqueado (secreto Legacy no desbloqueado; precio: null)';
    }
    if (elChurus) {
      elChurus.textContent = String(estadoJugador.churus ?? 0);
    }
  }

  function alternarTrajeJugador() {
    const res = alternarTraje(estadoJugador);
    if (res.exito) {
      estadoJugador = res.estado;
      if (almacen) guardar(almacen, estadoJugador);
      refrescarVistaTraje();
      if (instanciaMenu) {
        instanciaMenu.actualizar(estadoJugador);
      }
    }
    return res;
  }

  if (btnTraje) {
    btnTraje.onclick = () => alternarTrajeJugador();
  }

  // 3. Registro y carga de escenas
  const registro = crearRegistroEscenas();
  registro.registrar(escenaCiudad);
  registro.registrar(escenaTaqueria);
  registro.registrar(escenaReja);
  registro.registrar(escenaDesierto);
  registro.registrar(escenaDespenadero);
  registro.registrar(escenaCima);
  for (const escena of escenasGuatemala) registro.registrar(escena);
  const escenasMexico = registro.listar().filter(({ id }) => !id.startsWith('guatemala-'));

  // Se reanuda donde se guardó; una escena desconocida vuelve a la taquería.
  let escenaActual = registro.obtener(estadoJugador.progreso?.escena) || registro.obtener('taqueria');
  if (escenaActual.id !== estadoJugador.progreso?.escena) {
    estadoJugador = { ...estadoJugador, progreso: { ...estadoJugador.progreso, escena: escenaActual.id } };
    if (almacen) guardar(almacen, estadoJugador);
  }

  function actualizarNombreEscena() {
    const nombre = documento.getElementById('nombre-escena');
    if (nombre) nombre.textContent = escenaActual.nombre;
    documento.title = `Senku 2 — ${escenaActual.nombre}`;
    documento.getElementById('lienzo-juego')?.setAttribute?.(
      'aria-label', `Pantalla de juego de Senku 2 en ${escenaActual.nombre}`);
  }
  actualizarNombreEscena();

  // 4. Inicializar entidad provisional Senku
  const senku = crearCuerpo({
    x: escenaActual.puntoEntrada.x,
    y: escenaActual.puntoEntrada.y,
    w: ANCHO_GATO_JUEGO,
    h: ALTURA_GATO_JUEGO,
  });
  refrescarVistaTraje();
  // Despeñadero: anclador sólo dentro del nivel (temporal); garras para siempre.
  const anclador = crearAnclador();
  // Cima: lanzador temporal y Gato Mecánico (se recrea con vida llena al reiniciar la escena).
  const lanzador = crearLanzador();
  // Música por zona; el jefe despierto cambia a su pieza. N o el botón ♪ la apagan.
  const musica = crearMusica(ventana);
  let alPulsarMusica = null;
  const btnMusica = documento.createElement?.('button');
  if (btnMusica) {
    btnMusica.id = 'btn-musica';
    btnMusica.className = 'hud-pildora hud-btn';
    btnMusica.setAttribute('aria-label', 'Música');
    const pintarBoton = () => { btnMusica.textContent = musica.activa ? '♪' : '♪̸'; btnMusica.style.opacity = musica.activa ? '1' : '.55'; };
    pintarBoton();
    btnMusica.addEventListener('click', () => { musica.alternar(); pintarBoton(); });
    alPulsarMusica = (e) => { if (e.code === 'KeyN') { musica.alternar(); pintarBoton(); } };
    ventana.addEventListener?.('keydown', alPulsarMusica);
    documento.getElementById('btn-pausa')?.before?.(btnMusica);
  }
  function actualizarMusica() {
    const jefeDespierto = (escenaActual.id === 'cima' && jefe && jefe.estado !== 'dormido')
      || (escenaActual.id === 'guatemala-tikal' && jefeBalam && jefeBalam.estado !== 'dormido');
    if ((jefe?.derrotado && escenaActual.id === 'cima') || (jefeBalam?.derrotado && escenaActual.id === 'guatemala-tikal')) { musica.detener(); return; }
    musica.tocar(jefeDespierto ? 'jefe' : PIEZA_POR_ESCENA[escenaActual.id]);
  }
  let jefe = null;
  let jefeBalam = null;
  const ID_VICTORIA_JEFE = 'jefe-gato-mecanico';
  const ID_VICTORIA_BALAM = 'jefe-balam-tikal';
  const CAPITULO_REINICIABLE = [ID_VICTORIA_JEFE, ID_VICTORIA_BALAM, 'llave-camioneta', 'anclador-despenadero', 'lanzador-cima'];
  function prepararJefe() {
    if (escenaActual.id !== 'cima' || tiene(ID_VICTORIA_JEFE)) { jefe = null; return; }
    jefe = crearJefe({ x: 2200, suelo: SUELO_CIMA, arenaMinX: ARENA.minX, arenaMaxX: ARENA.maxX });
  }
  function prepararBalam() {
    if (escenaActual.id !== 'guatemala-tikal' || tiene(ID_VICTORIA_BALAM)) { jefeBalam = null; return; }
    jefeBalam = crearBalam({ x: 2180, suelo: 600, ...ARENA_BALAM });
  }
  const tiene = (id) => estadoJugador.coleccionados.includes(id);
  // Tras vencer al Gato Mecánico queda un botón para volver a abrir la tarjeta final y jugar otra vez.
  const btnRejugar = documento.createElement?.('button');
  function actualizarBotonRejugar() {
    if (btnRejugar) btnRejugar.hidden = !tiene(ID_VICTORIA_JEFE);
  }
  if (btnRejugar) {
    btnRejugar.id = 'btn-rejugar';
    btnRejugar.className = 'hud-pildora hud-btn';
    btnRejugar.textContent = '🔁';
    btnRejugar.setAttribute('aria-label', 'Jugar desde el principio');
    btnRejugar.title = 'Jugar desde el principio';
    btnRejugar.addEventListener('click', () => mostrarFinal(documento, ventana,
      resumenCapitulo(estadoJugador, escenasMexico), {
        alVolverAJugar: volverAJugarCapitulo,
        alContinuarGuatemala: () => cambiarEscena('guatemala-antigua', { curar: true }),
      }));
    documento.getElementById('btn-pausa')?.before?.(btnRejugar);
    actualizarBotonRejugar();
  }
  function actualizarBotonGancho() {
    const boton = documento.getElementById('btn-gancho');
    if (boton) boton.hidden = !(escenaActual.id === 'despenadero' && tiene('anclador-despenadero'));
  }
  // Al recargar dentro del despeñadero con el anclador, el botón táctil debe aparecer.
  actualizarBotonGancho();

  function alPulsarTecla(e) {
    if (viaje?.cinematica && ['Space', 'Enter', 'Escape'].includes(e.code)) {
      saltarCinematica();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      if (menuAbierto) {
        cerrarMenu();
        e.preventDefault();
      }
    } else if (e.key === 'm' || e.key === 'M') {
      alternarMenu();
      e.preventDefault();
    } else if (e.code === 'KeyE' && !e.repeat) {
      if (!hablarConRata()) intentarSubir();
      e.preventDefault();
    } else if (e.key === 't' || e.key === 'T') {
      if (!menuAbierto) {
        alternarTrajeJugador();
      }
    }
  }
  ventana.addEventListener('keydown', alPulsarTecla);

  // 4b. Sistema de combate: Senku empieza con 100 de vida e invencibilidad de 1 s tras recibir daño
  const estadoCombate = crearEstadoCombate({
    hpMax: HP_INICIAL_DEFECTO,
    hpInicial: HP_INICIAL_DEFECTO,
    tiempoInvulnerabilidad: TIEMPO_INVULNERABILIDAD_JUEGO,
  });

  // Instanciar enemigos de la escena guardada
  const idDerrota = (id) => `${escenaActual.id}:derrotado:${id}`;
  let definicionEnemigos = escenaActual.enemigos;
  // Mantener la misma lista pública al cambiar de escena.
  const enemigos = [];
  function restaurarEnemigos() {
    enemigos.splice(0, enemigos.length, ...definicionEnemigos.map((def) => crearEnemigo({
      ...def, vivo: !estadoJugador.coleccionados.includes(idDerrota(def.id)),
    })));
  }
  restaurarEnemigos();
  const btnSubir = documento.getElementById('btn-subir');
  const elAvisoViaje = documento.getElementById('aviso-viaje');
  let aviso = '';
  let avisoRestante = 0;
  let viaje = ventana.location?.search?.includes('cinematica=familia')
    ? { destino: 'reja', tiempo: 0, cinematica: true }
    : null;

  function mostrarAviso(texto, segundos = 3) {
    aviso = texto;
    avisoRestante = segundos;
    if (elAvisoViaje) {
      elAvisoViaje.textContent = texto;
      elAvisoViaje.hidden = !texto;
      if (elAvisoViaje.classList) {
        if (texto) {
          elAvisoViaje.classList.remove('saliendo');
          elAvisoViaje.classList.add('activo');
        } else {
          elAvisoViaje.classList.remove('activo');
          elAvisoViaje.classList.remove('saliendo');
        }
      }
    }
  }

  function guardarProgreso() {
    if (almacen) guardar(almacen, estadoJugador);
  }

  function zonaCamioneta() {
    return escenaActual.disparadores.find((d) => d.accion === 'subir' && solapanAABB(senku, d));
  }

  function zonaRata() {
    const rata = escenaActual.rataSecreta;
    return escenaActual.id === 'taqueria' && rata && !tieneTraje(estadoJugador, ID_RATA)
      && solapanAABB(senku, { ...rata, x: rata.x - 40, y: rata.y - 34, w: rata.w + 80, h: rata.h + 48 });
  }

  function hablarConRata() {
    if (!zonaRata()) return false;
    estadoJugador = desbloquearTraje(estadoJugador, ID_SECRETO_LEGACY).estado;
    estadoJugador = { ...estadoJugador, coleccionados: [...new Set([...estadoJugador.coleccionados, 'taqueria:rata-hablada'])] };
    if (almacen) guardar(almacen, estadoJugador);
    refrescarVistaTraje();
    if (instanciaMenu) instanciaMenu.actualizar(estadoJugador);
    mostrarAviso('¡La rata te confía su traje exclusivo!', 3);
    return true;
  }

  function actualizarCamioneta() {
    const zona = zonaCamioneta();
    if (btnSubir) btnSubir.hidden = !zona || !!viaje || menuAbierto;
    if (btnHablarRata) btnHablarRata.hidden = !zonaRata() || !!viaje || menuAbierto;
    if (zona && !viaje && !avisoRestante) {
      if (!zona.requiere) {
        mostrarAviso(zona.id === 'tuk-tuk-antigua'
          ? '¡El tuk-tuk está listo! Pulsa E o Subir.'
          : '¡El camión está listo! Pulsa E o Subir.', 0.5);
      } else {
        mostrarAviso(estadoJugador.coleccionados.includes(zona.requiere)
          ? '¡Ya tienes la llave! Pulsa E o Subir.'
          : 'La camioneta no arranca… ¡busca la llave!', 0.5);
      }
    }
  }

  function intentarSubir() {
    const zona = zonaCamioneta();
    if (!zona || menuAbierto || viaje) return false;
    if (zona.requiere && !estadoJugador.coleccionados.includes(zona.requiere)) {
      mostrarAviso('La camioneta no arranca… ¡busca la llave!');
      return false;
    }
    entrada.soltarTodo();
    viaje = {
      destino: zona.destino || 'reja',
      rutaBonus: zona.rutaBonus || './bonus-camioneta.html',
      tipo: zona.id,
      tiempo: 0,
      puertaX: zona.x + 30, // Senku camina a la puerta del camión
    };
    mostrarAviso('', 0);
    actualizarCamioneta();
    reproducirSonidoMotor(ventana);
    return true;
  }
  if (btnSubir) btnSubir.onclick = intentarSubir;

  // Sólo la cinemática de la familia se salta: al abordar, Espacio o un toque no deben brincarse el bonus.
  function saltarCinematica() {
    if (!viaje?.cinematica) return false;
    cambiarEscena(viaje.destino, { curar: true });
    return true;
  }

  let enSueloPrevio = true;
  let ataquePresionadoPrevio = false;
  let saltandoPrevio = false;
  senku.tiempoAterrizaje = 0;

  let tiempoHitStop = 0;
  let tiempoSacudidaCamara = 0;
  let duracionSacudidaCamara = 0;
  let intensidadSacudidaCamara = 0;
  let sacudidaCamaraX = 0;
  let sacudidaCamaraY = 0;

  function activarSacudidaCamara(intensidad = 4, duracion = 0.12) {
    intensidadSacudidaCamara = Math.max(intensidadSacudidaCamara, intensidad);
    duracionSacudidaCamara = Math.max(duracionSacudidaCamara, duracion);
    tiempoSacudidaCamara = Math.max(tiempoSacudidaCamara, duracion);
  }

  const efectosRecogida = [];
  function agregarEfectoRecogida({ tipo = 'churu', x, y, texto = '+1 Churu' }) {
    efectosRecogida.push({ tipo, x, y, texto, tiempo: 0, duracion: 0.75 });
  }

  function actualizarYDibujarEfectosRecogida(ctx, dt) {
    if (!ctx) return;
    for (let i = efectosRecogida.length - 1; i >= 0; i--) {
      const ef = efectosRecogida[i];
      ef.tiempo += dt;
      if (ef.tiempo >= ef.duracion) {
        efectosRecogida.splice(i, 1);
        continue;
      }
      const progreso = ef.tiempo / ef.duracion;
      const alpha = Math.max(0, 1 - progreso);
      const dy = ef.y - progreso * 40;

      ctx.save();
      const numParticulas = 6;
      for (let p = 0; p < numParticulas; p++) {
        const ang = (p * Math.PI * 2) / numParticulas + progreso * 2;
        const dist = 10 + progreso * 26;
        const px = ef.x + Math.cos(ang) * dist;
        const py = dy + Math.sin(ang) * (dist * 0.7);
        ctx.fillStyle = `rgba(253, 224, 71, ${alpha})`;
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(20, 12, 6, ${alpha * 0.9})`;
      ctx.fillText(ef.texto, ef.x + 1, dy + 1);
      ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
      ctx.fillText(ef.texto, ef.x, dy);
      ctx.restore();
    }
  }

  function soltarLlave(ultimo = null) {
    const recompensa = escenaActual.recompensaFinal;
    if (!recompensa || estadoJugador.coleccionados.includes(recompensa.id)
      || enemigos.some((e) => e.vivo) || escenaActual.objetos.some((o) => o.id === recompensa.id)) return;
    const maxX = (escenaActual.limites?.maxX ?? 1280) - 40;
    escenaActual.objetos.push({ ...recompensa,
      x: ultimo ? Math.min(maxX, Math.max(40, ultimo.x - 40)) : recompensa.x,
      y: ultimo ? ultimo.y + ultimo.h - recompensa.h : recompensa.y,
    });
    mostrarAviso('¡La llave de la camioneta!');
  }
  // Copias de objetos por partida: nunca mutar las definiciones del registro.
  escenaActual = {
    ...escenaActual,
    objetos: escenaActual.objetos.map((o) => ({
      ...o,
      recogido: Boolean(o.recogido || estadoJugador.coleccionados.includes(o.id)),
    })),
  };
  soltarLlave();

  actualizarHUDVida();

  // Reinicia la escena al llegar a 0 de vida, conservando el progreso guardado
  function reiniciarEscena({ puntoEntrada = escenaActual.puntoEntrada, curar = true } = {}) {
    soltarAnclador(anclador);
    senku.agarrado = null;
    actualizarBotonGancho();
    lanzador.proyectiles = [];
    prepararJefe();
    prepararBalam();
    senku.x = puntoEntrada.x;
    senku.y = puntoEntrada.y;
    senku.vx = 0;
    senku.vy = 0;
    senku.enSuelo = false;
    senku.saltando = false;
    senku.tiempoSalto = 0;
    senku.tiempoCoyote = 0;
    senku.tiempoBufferSalto = 0;

    // Restaurar posiciones sin revivir enemigos ya derrotados
    restaurarEnemigos();
    soltarLlave();

    // Caminar entre zonas conserva la salud y la invulnerabilidad en curso.
    if (curar) reiniciarCombate(estadoCombate);
    actualizarHUDVida();
  }

  // 5. Canvas y contexto de renderizado
  const canvas = documento.getElementById('lienzo-juego');
  if (!canvas) {
    return { iniciado: false, motivo: 'lienzo_no_encontrado' };
  }
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
  }

  // Ajuste letterbox responsive y sincronización de viewport iOS/Android
  function redimensionar() {
    const { ancho, alto } = sincronizarViewportCSS(documento, ventana);
    actualizarAvisoOrientacion(documento, ancho, alto);
    const contenedor = canvas.parentElement || documento.body;
    const w = contenedor.clientWidth || ancho;
    const h = contenedor.clientHeight || alto;
    ajustarLienzoLetterbox(canvas, w, h);
  }

  ventana.addEventListener('resize', redimensionar);
  ventana.addEventListener('orientationchange', redimensionar);
  if (ventana.visualViewport) {
    ventana.visualViewport.addEventListener('resize', redimensionar);
  }
  redimensionar();

  // 6. Controles táctiles y teclado
  const btnSalto = documento.getElementById('btn-salto');
  // El botón de zarpazo también dispara el lanzador en la cima.
  let btnAtaque = documento.getElementById('btn-atacar');
  if (!btnAtaque && documento && typeof documento.createElement === 'function') {
    const grupo = documento.querySelector?.('.grupo-accion');
    if (grupo) {
      btnAtaque = documento.createElement('button');
      btnAtaque.id = 'btn-atacar';
      btnAtaque.className = 'btn-control';
      btnAtaque.setAttribute('aria-label', 'Atacar / Zarpazo');
      btnAtaque.innerHTML = `<span>🐾</span><span>Zarpazo</span>`;
      grupo.insertBefore(btnAtaque, btnSalto);
    }
  }

  const entrada = crearManejadorEntrada({
    ventana,
    documento,
    elementoJoystick: documento.getElementById('joystick'),
    elementosBotones: {
      salto: btnSalto,
      anclar: documento.getElementById('btn-gancho'),
      atacar: btnAtaque,
      desliz: documento.getElementById('btn-desliz'),
    },
  });

  // 7. Catálogo de arte desacoplado
  // Precarga única; mientras tanto (o si una imagen falla) se dibujan los rectángulos de respaldo
  catalogoArte = crearCatalogoArte();
  let rutaFondo = rutaFondoEscena(escenaActual.id) || (escenaActual.fondo.ruta
    ? resolverRutaArte(escenaActual.fondo.ruta) : null);
  // Sólo la escena actual bloquea («Cargando arte»); las escenas a las que se puede ir bajan en segundo plano.
  function precargarArteEscena(rutasBase) {
    catalogoArte.precargar([...rutasBase, ...rutasArteEscena(escenaActual)]);
    for (const id of destinosEscena(escenaActual)) {
      for (const ruta of [...rutasPrecargaArte({ escenaId: id, trajeId: trajeActivo.id }), ...rutasArteEscena(registro.obtener(id))]) {
        catalogoArte.cargar(ruta);
      }
    }
  }
  precargarArteEscena(rutasPrecargaArte({
    escenaId: escenaActual.id,
    tiposEnemigo: enemigos.map((e) => `${e.tipo}_${e.variante}`),
    trajeId: trajeActivo.id,
  }));
  catalogoArte.cargar(resolverRutaArte('assets/fondos/camioneta_reja.webp'));
  catalogoArte.cargar(resolverRutaArte('assets/jefe/balam.png'));
  catalogoArte.cargar(resolverRutaArte('assets/bonus/tuk-tuk-antigua.webp'));
  const animadorEnemigos = crearAnimadorEnemigos();

  function cambiarEscena(destino, { puntoEntrada, curar = false } = {}) {
    const definicion = registro.obtener(destino);
    if (!definicion) {
      senku.x -= 60;
      senku.vx = 0;
      mostrarAviso('No se encontró la escena de destino.', 2.5);
      return;
    }
    escenaActual = {
      ...definicion,
      objetos: definicion.objetos.map((o) => ({
        ...o,
        recogido: Boolean(o.recogido || estadoJugador.coleccionados.includes(o.id)),
      })),
    };
    estadoJugador = { ...estadoJugador, progreso: { ...estadoJugador.progreso, escena: escenaActual.id } };
    guardarProgreso();
    definicionEnemigos = escenaActual.enemigos;
    rutaFondo = rutaFondoEscena(escenaActual.id) || (escenaActual.fondo.ruta
      ? resolverRutaArte(escenaActual.fondo.ruta) : null);
    precargarArteEscena([rutaFondo, ...rutasPrecargaArte({ escenaId: escenaActual.id, trajeId: trajeActivo.id })]);
    viaje = null;
    mostrarAviso('', 0);
    camaraSuaveX = Math.max(0, Math.min(escenaActual.limites.w - ANCHO_LOGICO,
      (puntoEntrada?.x ?? escenaActual.puntoEntrada.x) - ANCHO_LOGICO * 0.38));
    reiniciarEscena({ puntoEntrada, curar });
    actualizarNombreEscena();
    actualizarCamioneta();
  }

  // Jugar otra vez desde el Senku original (casa → taquería → Senku 2 en la ciudad): revive enemigos, llave y jefe. Churus, trajes y garras se conservan (sin re-cobrar churus).
  let temporizadorFinal = null;
  function volverAJugarCapitulo() {
    // Los botiquines también vuelven: jugar otra vez trae de nuevo la curación de cada escena.
    const capitulo = (id) => id.includes(':derrotado:') || id.startsWith('botiquin') || CAPITULO_REINICIABLE.includes(id);
    estadoJugador = { ...estadoJugador, coleccionados: estadoJugador.coleccionados.filter((id) => !capitulo(id)) };
    actualizarBotonRejugar();
    cambiarEscena('ciudad', { curar: true });
    // Se empieza desde el Senku original (la casa); al llegar a la taquería vuelve solo a Senku 2.
    if (ventana.location) ventana.location.href = '../legacy/juego.html';
  }

  function volverAJugarGuatemala() {
    const prefijos = ['antigua-', 'chichi-', 'selva-', 'tikal-', 'guatemala-tikal:derrotado:'];
    estadoJugador = { ...estadoJugador, coleccionados: estadoJugador.coleccionados.filter((id) =>
      id !== ID_VICTORIA_BALAM
        && !(id.startsWith('guatemala-') && id.includes(':derrotado:'))
        && !prefijos.some((prefijo) => id.startsWith(prefijo))) };
    cambiarEscena('guatemala-antigua', { curar: true });
  }

  // 8. Bucle principal de juego
  let animacionId = null;
  let ultimoTiempo = performance.now();
  let tiempoAcumulado = 0;
  let camaraSuaveX = 0;

  function avanzarPaso(dt = 1 / 60) {
    actualizarControlesHabilidades(documento, estadoJugador);
    if (menuAbierto) return;
    if (avisoRestante > 0) {
      avisoRestante = Math.max(0, avisoRestante - dt);
      if (avisoRestante > 0 && avisoRestante <= 0.25 && elAvisoViaje?.classList) {
        elAvisoViaje.classList.add('saliendo');
      }
      if (!avisoRestante) mostrarAviso('', 0);
    }
    if (senku.tiempoAterrizaje > 0) {
      senku.tiempoAterrizaje = Math.max(0, senku.tiempoAterrizaje - dt);
    }
    if (viaje) {
      viaje.tiempo += dt;
      if (viaje.cinematica) {
        if (viaje.tiempo >= 5) saltarCinematica();
        return;
      }
      if (viaje.tipo === 'camion') {
        // Camina a la puerta mientras la pantalla se funde; a los 2.5 s entra al bonus.
        senku.x += Math.max(-1, Math.min(1, viaje.puertaX - senku.x)) * Math.min(Math.abs(viaje.puertaX - senku.x), 160 * dt);
        senku.mirando = viaje.puertaX < senku.x ? -1 : 1;
        senku.vx = Math.abs(viaje.puertaX - senku.x) > 2 ? senku.mirando * 160 : 0; // ciclo de patas
        mostrarAviso('¡Senku sube al camión! ¡A juntar Churus!', 0);
        if (viaje.tiempo < 2.5) return;
      } else if (viaje.tiempo < 2) return;
      if (viaje.tipo !== 'camion' && viaje.tiempo < 5) {
        mostrarAviso(viaje.tipo === 'tuk-tuk-antigua'
          ? '¡Senku sube al tuk-tuk! ¡A juntar Churus!'
          : '¡Senku toma el volante! ¡A juntar Churus!', 0);
        return;
      }
      if (ventana.location) {
        ventana.location.href = viaje.rutaBonus || './bonus-camioneta.html';
      } else {
        cambiarEscena(viaje.destino, { curar: true });
      }
      return;
    }
    if (!menuAbierto) {
      // Física del jugador
      const estadoEntrada = entrada.obtenerEstado();
      const ataqueNuevo = estadoEntrada.atacar && !ataquePresionadoPrevio;
      if (ataqueNuevo) {
        for (const enemigo of enemigos) {
          if (!enemigo.activo || !enemigo.vivo) continue;
          const ataque = atacarEnemigo(senku, enemigo);
          if (ataque.golpeado) {
            reproducirSonidoGolpe(ventana);
            tiempoHitStop = 0.06;
            activarSacudidaCamara(4, 0.12);
          }
          if (ataque.enemigoDerrotado) {
            estadoJugador = { ...estadoJugador,
              coleccionados: [...new Set([...estadoJugador.coleccionados, idDerrota(enemigo.id)])] };
            guardarProgreso();
            soltarLlave(enemigo);
          }
        }
      }
      ataquePresionadoPrevio = estadoEntrada.atacar;
      const eventosMovilidad = pasoMovilidad(senku, anclador, estadoEntrada,
        escenaActual.plataformas, escenaActual.limites, dt, {
          tieneAnclador: escenaActual.id === 'despenadero' && tiene('anclador-despenadero'),
          tieneGarras: tiene('garras-despenadero'),
        });
      if (eventosMovilidad.includes('enganchar')) reproducirSonidoChuru(ventana);
      if (eventosMovilidad.includes('coronar')) mostrarAviso('¡Arriba!', 0.8);
      actualizarMusica();

      if (escenaActual.id === 'cima') {
        if (!jefe && !tiene(ID_VICTORIA_JEFE)) prepararJefe();
        const tieneLanzador = tiene('lanzador-cima');
        if (tieneLanzador) actualizarDisparo(lanzador, senku, estadoEntrada, dt);
        const blancos = jefe && !jefe.derrotado ? [jefe] : [];
        for (const impacto of actualizarProyectiles(lanzador, dt, blancos)) {
          if (golpearJefe(impacto.objetivo, 1)) reproducirSonidoChuru(ventana);
        }
        if (jefe) {
          if (jefe.estado === 'dormido' && senku.x > ARENA.minX + 40) {
            despertar(jefe);
            mostrarAviso('¡El Gato Mecánico despierta!', 2);
          }
          if (jefe.estado !== 'dormido' && !jefe.derrotado) senku.x = Math.max(senku.x, ARENA.minX);
          actualizarJefe(jefe, senku, dt);
          if (esPisoton(jefe, senku) && golpearJefe(jefe, 1)) senku.vy = -620;
          const dano = deslizInvulnerable(senku) ? 0 : danoAJugador(jefe, senku);
          if (dano > 0) {
            const golpe = aplicarGolpeJugador(estadoCombate, dano);
            if (golpe.golpeado) {
              actualizarHUDVida();
              mostrarAviso(`¡Golpe! -${dano} HP`, 0.8);
              if (golpe.derrotado || estadoCombate.hp === 0) {
                reiniciarEscena();
                return;
              }
            }
          }
          // Se registra una sola vez, venga el último golpe de un ratón o de un pisotón.
          if (jefe.derrotado && !tiene(ID_VICTORIA_JEFE)) {
            estadoJugador = { ...estadoJugador,
              coleccionados: [...new Set([...estadoJugador.coleccionados, ID_VICTORIA_JEFE])] };
            guardarProgreso();
            actualizarBotonRejugar();
            mostrarAviso('¡Venciste al Gato Mecánico!', 2.5);
            // Deja ver al jefe desarmarse antes de la pantalla final.
            temporizadorFinal = ventana.setTimeout?.(() => {
              mostrarAviso('', 0); // que el aviso no asome sobre la tarjeta final
              mostrarFinal(documento, ventana,
                resumenCapitulo(estadoJugador, escenasMexico), {
                  alVolverAJugar: volverAJugarCapitulo,
                  alContinuarGuatemala: () => cambiarEscena('guatemala-antigua', { curar: true }),
                });
            }, 2600);
          }
        }
      }

      if (escenaActual.id === 'guatemala-tikal') {
        if (!jefeBalam && !tiene(ID_VICTORIA_BALAM)) prepararBalam();
        if (jefeBalam) {
          if (jefeBalam.estado === 'dormido' && senku.x > ARENA_BALAM.minX + 40) {
            despertarBalam(jefeBalam);
            mostrarAviso('¡Balam despierta! Es guardián de Tikal.', 2.2);
          }
          if (jefeBalam.estado !== 'dormido' && !jefeBalam.derrotado) {
            senku.x = Math.max(ARENA_BALAM.minX, Math.min(ARENA_BALAM.maxX - senku.w, senku.x));
          }
          if (ataqueNuevo && !jefeBalam.derrotado
              && Math.abs((senku.x + senku.w / 2) - (jefeBalam.x + jefeBalam.w / 2)) < 150
              && Math.abs((senku.y + senku.h / 2) - (jefeBalam.y + jefeBalam.h / 2)) < 125
              && (jefeBalam.x + jefeBalam.w / 2 - senku.x - senku.w / 2) * (senku.mirando || 1) > 0) {
            if (golpearBalam(jefeBalam)) { reproducirSonidoGolpe(ventana); tiempoHitStop = 0.06; }
          }
          actualizarBalam(jefeBalam, senku, dt);
          if (esPisonBalam(jefeBalam, senku) && golpearBalam(jefeBalam, 1)) {
            senku.vy = -620;
            reproducirSonidoGolpe(ventana);
          }
          const dano = deslizInvulnerable(senku) ? 0 : danoDeBalam(jefeBalam, senku);
          if (dano > 0) {
            const golpe = aplicarGolpeJugador(estadoCombate, dano);
            if (golpe.golpeado) {
              actualizarHUDVida(); mostrarAviso(`¡Golpe de Balam! -${dano} HP`, 0.8);
              if (golpe.derrotado || estadoCombate.hp === 0) { reiniciarEscena(); return; }
            }
          }
          if (jefeBalam.derrotado && !tiene(ID_VICTORIA_BALAM)) {
            estadoJugador = { ...estadoJugador,
              coleccionados: [...new Set([...estadoJugador.coleccionados, ID_VICTORIA_BALAM])] };
            guardarProgreso();
            mostrarAviso('¡Balam vuelve a descansar! Tikal está en calma.', 2.5);
            temporizadorFinal = ventana.setTimeout?.(() => {
              mostrarAviso('', 0);
              mostrarFinal(documento, ventana, resumenCapitulo(estadoJugador, escenasGuatemala), {
                capitulo: 'CAPÍTULO 2 · GUATEMALA', titulo: '¡Balam reconoce la agilidad de Senku!',
                subtitulo: 'La plaza de Tikal vuelve a estar tranquila.',
                etiquetaVolver: 'Volver a jugar Guatemala', alVolverAJugar: volverAJugarGuatemala,
              });
            }, 1800);
          }
        }
      }

      // Caer al abismo regresa al inicio del despeñadero (decisión de Javier, 30/10/2026).
      if (escenaActual.id === 'despenadero'
          && senku.y + senku.h > escenaDespenadero.alturaCaida) {
        const p = escenaDespenadero.puntoEntrada;
        soltarAnclador(anclador);
        Object.assign(senku, { x: p.x, y: p.y, vx: 0, vy: 0, agarrado: null, enSuelo: false });
        mostrarAviso('¡Caíste! De vuelta al inicio del despeñadero.', 2);
      }

      if (!saltandoPrevio && senku.saltando) {
        reproducirSonidoSalto(ventana);
      }
      saltandoPrevio = senku.saltando;

      // Amortiguación al aterrizar (absorción del impacto)
      if (!enSueloPrevio && senku.enSuelo && !senku.saltando && Math.abs(senku.vx) <= 30) {
        senku.tiempoAterrizaje = 0.12;
      }
      if (Math.abs(senku.vx) > 30 || senku.saltando) {
        senku.tiempoAterrizaje = 0;
      }
      enSueloPrevio = senku.enSuelo;

      const salida = escenaActual.disparadores.find((d) => d.accion === 'pasar' && solapanAABB(senku, d));
      if (salida) {
        cambiarEscena(salida.destino, { puntoEntrada: salida.puntoEntrada });
        return;
      }

      // Combate y actualización de enemigos
      actualizarCombate(estadoCombate, dt);
      const oleadaActual = Math.floor(senku.x / (ANCHO_LOGICO * 0.75)) + 1;
      for (const enemigo of enemigos) {
        if (enemigo.oleada <= oleadaActual) enemigo.activo = true;
      }
      actualizarEnemigos(enemigos.filter((e) => e.activo), dt, escenaActual.limites, senku);

      for (const enemigo of enemigos) {
        if (!enemigo.activo || !enemigo.vivo || deslizInvulnerable(senku)) continue;
        const resContacto = resolverContactoEnemigo(senku, enemigo, estadoCombate);
        if (resContacto.enemigoDerrotado) {
          reproducirSonidoGolpe(ventana);
          tiempoHitStop = 0.06;
          activarSacudidaCamara(4, 0.12);
          estadoJugador = { ...estadoJugador,
            coleccionados: [...new Set([...estadoJugador.coleccionados, idDerrota(enemigo.id)])] };
          guardarProgreso();
          soltarLlave(enemigo);
        }
        if (resContacto.contacto && resContacto.tipo === 'golpe') {
          reproducirSonidoDanio(ventana);
          tiempoHitStop = 0.06;
          activarSacudidaCamara(6, 0.16);
          actualizarHUDVida();
          if (resContacto.golpeado) mostrarAviso(`¡Golpe! -${enemigo.dano || 1} HP`, 0.8);
          // Al llegar a 0 de vida, reiniciar la escena con vida llena
          if (estadoCombate.hp === 0 || resContacto.muerto || estadoCombate.derrotado) {
            reiniciarEscena();
            break;
          }
        }
      }
      for (const objeto of escenaActual.objetos) {
        if (objeto.recogido || !solapanRecogible(senku, objeto)) continue;
        if (objeto.tipo === 'churu') {
          objeto.recogido = true;
          const resEco = ganarChurus(estadoJugador, 1, objeto.id);
          if (!resEco.error) {
            estadoJugador = resEco;
          } else {
            estadoJugador = {
              ...estadoJugador,
              churus: (estadoJugador.churus || 0) + 1,
              coleccionados: [...new Set([...estadoJugador.coleccionados, objeto.id])],
            };
          }
          guardarProgreso();
          if (elChurus) {
            elChurus.textContent = String(estadoJugador.churus ?? 0);
          }
          reproducirSonidoChuru(ventana);
          agregarEfectoRecogida({
            tipo: 'churu',
            x: objeto.x + (objeto.w || 22) / 2,
            y: objeto.y,
            texto: '+1 Churu',
          });
        } else if (objeto.tipo === 'lanzador') {
          objeto.recogido = true;
          estadoJugador = { ...estadoJugador,
            coleccionados: [...new Set([...estadoJugador.coleccionados, objeto.id])] };
          guardarProgreso();
          mostrarAviso('¡Lanzador de ratones! Dispara con J o con el botón Zarpazo.', 4);
        } else if (objeto.tipo === 'anclador' || objeto.tipo === 'garras') {
          objeto.recogido = true;
          estadoJugador = { ...estadoJugador,
            coleccionados: [...new Set([...estadoJugador.coleccionados, objeto.id])] };
          guardarProgreso();
          actualizarBotonGancho();
          mostrarAviso(objeto.tipo === 'anclador'
            ? '¡Anclador! Mantén K (o Gancho), apunta y suelta para disparar a la pared.'
            : '¡Garras! Empuja contra la pared y salta para trepar.', 4);
        } else if (objeto.tipo === 'llave') {
          objeto.recogido = true;
          estadoJugador = { ...estadoJugador,
            coleccionados: [...new Set([...estadoJugador.coleccionados, objeto.id])] };
          guardarProgreso();
          reproducirSonidoItem(ventana);
          mostrarAviso('¡La llave de la camioneta! Vuelve a la camioneta a la izquierda ←', 5);
        } else if (objeto.tipo === 'botiquin') {
          const res = recogerBotiquin({
            jugador: senku,
            botiquin: objeto,
            estadoCombate,
            estadoJugador,
          });
          if (res.recogido) {
            estadoJugador = res.estadoJugador;
            guardarProgreso();
            reproducirSonidoItem(ventana);
            actualizarHUDVida();
            mostrarAviso(`+${res.curacion} Vida (${res.hp}/${res.hpMax})`);
            agregarEfectoRecogida({ tipo: 'botiquin', x: objeto.x + objeto.w / 2, y: objeto.y, texto: `+${res.curacion} ♥` });
          } else if (res.motivo === 'vida_llena' && !avisoRestante) {
            mostrarAviso('Vida llena: el botiquín te espera aquí.', 1.2);
          }
        }
      }
      actualizarCamioneta();
    }
  }

  function ciclo(ahora) {
    const dt = Math.min((ahora - ultimoTiempo) / 1000, 0.05);
    ultimoTiempo = ahora;
    tiempoAcumulado += dt;

    if (tiempoSacudidaCamara > 0) {
      tiempoSacudidaCamara -= dt;
      const factor = duracionSacudidaCamara > 0 ? (tiempoSacudidaCamara / duracionSacudidaCamara) : 0;
      sacudidaCamaraX = (Math.random() * 2 - 1) * intensidadSacudidaCamara * factor;
      sacudidaCamaraY = (Math.random() * 2 - 1) * intensidadSacudidaCamara * factor;
      if (tiempoSacudidaCamara <= 0) {
        tiempoSacudidaCamara = 0;
        duracionSacudidaCamara = 0;
        intensidadSacudidaCamara = 0;
        sacudidaCamaraX = 0;
        sacudidaCamaraY = 0;
      }
    } else {
      sacudidaCamaraX = 0;
      sacudidaCamaraY = 0;
    }

    if (tiempoHitStop > 0) {
      tiempoHitStop -= dt;
    } else {
      avanzarPaso(dt);
    }

    const minimoCamara = escenaActual.limites.minX ?? 0;
    const maximoCamara = Math.max(minimoCamara, escenaActual.limites.maxX - ANCHO_LOGICO);
    const pantallaX = senku.x - camaraSuaveX;
    let objetivoCamara = camaraSuaveX;
    if (pantallaX < ANCHO_LOGICO * 0.38) objetivoCamara = senku.x - ANCHO_LOGICO * 0.38;
    else if (pantallaX + senku.w > ANCHO_LOGICO * 0.62) objetivoCamara = senku.x + senku.w - ANCHO_LOGICO * 0.62;
    objetivoCamara = Math.max(minimoCamara, Math.min(maximoCamara, objetivoCamara));
    // Pelea con el Gato Mecánico: la arena mide una pantalla; la cámara la encuadra completa.
    if (escenaActual.id === 'cima' && jefe && jefe.estado !== 'dormido' && !jefe.derrotado) {
      objetivoCamara = ARENA.minX;
    }
    if (escenaActual.id === 'guatemala-tikal' && jefeBalam && jefeBalam.estado !== 'dormido' && !jefeBalam.derrotado) {
      objetivoCamara = ARENA_BALAM.minX;
    }
    camaraSuaveX += (objetivoCamara - camaraSuaveX) * (1 - Math.exp(-8 * dt));
    const camaraX = Math.max(minimoCamara, Math.min(maximoCamara, camaraSuaveX));
    // Dibujado de escena base
    renderizarEscena({
      ctx,
      escena: escenaActual,
      cuerpoJugador: null, // Dibujado con traje activo y etiqueta a continuación
      catalogoArte,
      rutaFondo,
      tiempo: tiempoAcumulado,
      cameraX: camaraX + sacudidaCamaraX,
    });

    if (ctx) { ctx.save(); ctx.translate(-camaraX - sacudidaCamaraX, sacudidaCamaraY); }
    dibujarDespenadero(ctx, escenaActual, tiempoAcumulado);
    dibujarAnclador(ctx, anclador, senku);
    if (ctx && escenaActual.id === 'cima') {
      dibujarPuertaArena(ctx, ARENA.minX, jefe && jefe.estado !== 'dormido' && !jefe.derrotado, tiempoAcumulado);
      for (const o of escenaActual.objetos) if (o.tipo === 'lanzador') dibujarObjetoLanzador(ctx, o, tiempoAcumulado);
      dibujarJefe(ctx, jefe, tiempoAcumulado);
      dibujarProyectiles(ctx, lanzador);
    }
    if (ctx && escenaActual.id === 'guatemala-tikal') dibujarBalam(ctx, jefeBalam, tiempoAcumulado);

    if (ctx && escenaActual.id === 'taqueria' && escenaActual.rataSecreta && !tieneTraje(estadoJugador, ID_RATA)) {
      const rata = escenaActual.rataSecreta;
      ctx.save();
      ctx.fillStyle = '#77665c';
      ctx.beginPath(); ctx.ellipse(rata.x + 24, rata.y + 27, 24, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rata.x + 8, rata.y + 8, 9, 0, Math.PI * 2); ctx.arc(rata.x + 27, rata.y + 7, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f3b2aa';
      ctx.beginPath(); ctx.arc(rata.x + 8, rata.y + 8, 4, 0, Math.PI * 2); ctx.arc(rata.x + 27, rata.y + 7, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#241c1c'; ctx.fillRect(rata.x + 31, rata.y + 22, 4, 4);
      if (zonaRata()) {
        ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillStyle = '#211209'; ctx.fillRect(rata.x - 22, rata.y - 22, 92, 22);
        ctx.fillStyle = '#fff7ed'; ctx.fillText('¡Hola! Pulsa E', rata.x + 24, rata.y - 7);
      }
      ctx.restore();
    }

    // Dibujado de Senku con color y etiqueta del traje activo
    if (ctx && senku) {
      ctx.save();

      // Sombra en el suelo
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(
        senku.x + senku.w / 2,
        senku.y + senku.h + 2,
        senku.w * 0.45,
        5,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      if (deslizInvulnerable(senku)) {
        // Estela del desliz: Senku es intocable mientras se ve.
        ctx.save();
        for (let i = 1; i <= 3; i++) {
          ctx.globalAlpha = 0.35 / i;
          ctx.fillStyle = '#c4b5fd';
          ctx.beginPath();
          ctx.ellipse(senku.x + senku.w / 2 - (senku.dirDesliz || 1) * i * 22, senku.y + senku.h * 0.6, senku.w * 0.4, senku.h * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (!dibujarJugador(ctx, catalogoArte, {
        cuerpo: senku,
        trajeId: trajeActivo.id,
        combate: estadoCombate,
        tiempo: tiempoAcumulado,
      })) {
        // Respaldo sin arte: parpadeo durante invulnerabilidad
        const invulnerable = Boolean(estadoCombate?.invulnerable) && (estadoCombate?.tiempoInvulnerable ?? 0) > 0;
        ctx.globalAlpha = invulnerable && Math.floor(tiempoAcumulado * 14) % 2 === 1 ? 0.45 : 1;

        // Rectángulo principal del Senku provisional (color del traje activo)
        ctx.fillStyle = trajeActivo.color;
        ctx.fillRect(senku.x, senku.y, senku.w, senku.h);

        // Borde según traje activo
        ctx.strokeStyle = trajeActivo.colorBorde;
        ctx.lineWidth = 3;
        ctx.strokeRect(senku.x, senku.y, senku.w, senku.h);

        // Si es traje de rata, detalle provisional limpio de orejitas (sin inventar arte complejo)
        if (trajeActivo.id === ID_RATA) {
          ctx.fillStyle = trajeActivo.colorDetalle || '#f1948a';
          ctx.fillRect(senku.x + 6, senku.y - 4, 8, 5);
          ctx.fillRect(senku.x + senku.w - 14, senku.y - 4, 8, 5);
        }

        // Ojo según orientación y traje activo
        const ojoX = senku.mirando === 1
          ? senku.x + senku.w - 12
          : senku.x + 6;
        ctx.fillStyle = trajeActivo.colorOjo || '#2c3e50';
        ctx.fillRect(ojoX, senku.y + 8, 6, 6);

        // Etiqueta flotante sobre Senku indicando el traje activo
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        const anchoEtiqueta = ctx.measureText(trajeActivo.etiqueta).width;
        const centroX = senku.x + senku.w / 2;
        const posY = senku.y - (trajeActivo.id === ID_RATA ? 8 : 6);

        ctx.fillStyle = 'rgba(20, 15, 10, 0.75)';
        ctx.fillRect(centroX - anchoEtiqueta / 2 - 5, posY - 14, anchoEtiqueta + 10, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(trajeActivo.etiqueta, centroX, posY - 2);

      }

      ctx.restore();
    }

    // Dibujado de enemigos: hoja de sprites o, sin arte, rectángulos provisionales
    if (ctx) {
      ctx.save();
      for (const enemigo of enemigos) {
        if (!enemigo.activo) continue;
        // Sombra suave en suelo (sólo mientras vive)
        if (enemigo.vivo) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.ellipse(
            enemigo.x + enemigo.w / 2,
            enemigo.y + enemigo.h + 2,
            enemigo.w * 0.45,
            4,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // Con arte: caminar/daño/derrota animados; true también cuando ya terminó la derrota
        const conArte = dibujarEnemigo(ctx, catalogoArte, animadorEnemigos, enemigo, tiempoAcumulado);
        // Golpes que le faltan: un punto por golpe (sólo enemigos de 2 o más golpes).
        if (enemigo.vivo && enemigo.hpMax > 1) {
          const cx = enemigo.x + enemigo.w / 2, cy = enemigo.y - 42;
          for (let i = 0; i < enemigo.hpMax; i++) {
            ctx.fillStyle = i < enemigo.hp ? '#ff5a5a' : 'rgba(0, 0, 0, 0.35)';
            ctx.beginPath();
            ctx.arc(cx + (i - (enemigo.hpMax - 1) / 2) * 14, cy, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
        if (conArte) continue;
        if (!enemigo.vivo) continue;

        // Rectángulo principal del enemigo
        ctx.fillStyle = enemigo.color || '#6e4720';
        ctx.fillRect(enemigo.x, enemigo.y, enemigo.w, enemigo.h);

        // Borde
        ctx.strokeStyle = enemigo.colorDetalle || '#3a200a';
        ctx.lineWidth = 2;
        ctx.strokeRect(enemigo.x, enemigo.y, enemigo.w, enemigo.h);

        // Indicador provisional de dirección
        const ojoX = enemigo.mirando === 1
          ? enemigo.x + enemigo.w - 8
          : enemigo.x + 3;
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(ojoX, enemigo.y + 4, 5, 5);
      }
      dibujarIndicadoresEscena(ctx, escenaActual, senku, tiempoAcumulado, estadoJugador);
      ctx.restore();
    }

    // Aún con la cámara aplicada: el lanzador va sobre el lomo.
    if (ctx && escenaActual.id === 'cima' && tiene('lanzador-cima')) dibujarLanzadorEnLomo(ctx, senku);
    if (ctx) ctx.restore();
    if (ctx && escenaActual.id === 'cima') dibujarBarraJefe(ctx, jefe);
    if (ctx && escenaActual.id === 'guatemala-tikal') dibujarBarraBalam(ctx, jefeBalam);
    if (ctx && escenaActual.id === 'taqueria') {
      const tieneLlave = estadoJugador.coleccionados.includes('taqueria-recompensa-llave')
        || estadoJugador.coleccionados.includes('llave-camioneta');
      if (tieneLlave) {
        ctx.save();
        ctx.fillStyle = 'rgba(18, 30, 20, 0.88)';
        ctx.fillRect(ANCHO_LOGICO / 2 - 220, 14, 440, 30);
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 2;
        ctx.strokeRect(ANCHO_LOGICO / 2 - 220, 14, 440, 30);
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔑 ¡Llave lista! Vuelve a la camioneta a la izquierda ←', ANCHO_LOGICO / 2, 34);
        ctx.restore();
      }
    }
    if (ctx && viaje) {
      if (viaje.tipo === 'camion') {
        ctx.save();
        ctx.fillStyle = `rgba(18, 14, 24, ${Math.min(1, 0.3 + viaje.tiempo / 2.2)})`;
        ctx.fillRect(0, 0, ANCHO_LOGICO, ALTO_LOGICO);
        ctx.restore();
      } else if (viaje.tiempo < 1) {
        dibujarAnimacionCamioneta(ctx, catalogoArte, { ...viaje, tiempo: viaje.tiempo * 2 });
      } else {
        dibujarCinematica(ctx, (viaje.tiempo - 1) * 1.25);
      }
    }
    dibujarAvisoCarga(ctx, catalogoArte);
    if (ctx) {
      actualizarYDibujarEfectosRecogida(ctx, dt);
    }

    animacionId = ventana.requestAnimationFrame(ciclo);
  }

  function dibujarCinematica(contexto, tiempo) {
    contexto.save();
    const grad = contexto.createLinearGradient(0, 0, 0, 720);
    grad.addColorStop(0, '#65b8d0'); grad.addColorStop(0.7, '#f2c875'); grad.addColorStop(1, '#b9784c');
    contexto.fillStyle = grad; contexto.fillRect(0, 0, 1280, 720);
    contexto.fillStyle = '#f8dda0'; contexto.beginPath(); contexto.arc(1040, 125, 54, 0, Math.PI * 2); contexto.fill();
    contexto.fillStyle = '#d39a5a'; contexto.fillRect(0, 535, 1280, 185);
    contexto.fillStyle = '#544638'; contexto.fillRect(0, 580, 1280, 60);
    const carX = 1350 - Math.min(930, tiempo * 390);
    contexto.fillStyle = '#d45432'; contexto.fillRect(carX, 450, 280, 105);
    contexto.fillStyle = '#f6ca82'; contexto.fillRect(carX + 55, 402, 170, 56);
    contexto.fillStyle = '#2f3638'; contexto.beginPath();
    contexto.arc(carX + 70, 557, 30, 0, Math.PI * 2); contexto.arc(carX + 220, 557, 30, 0, Math.PI * 2); contexto.fill();
    const baja = Math.max(0, Math.min(1, (tiempo - 1.7) / 1.2));
    for (const [x, color, escala] of [[carX + 325, '#ecb24b', 1], [carX + 380, '#4c88a1', 0.88]]) {
      contexto.fillStyle = color; contexto.beginPath(); contexto.arc(x, 475 - baja * 22, 18 * escala, 0, Math.PI * 2); contexto.fill();
      contexto.fillRect(x - 15 * escala, 495 - baja * 22, 30 * escala, 55 * escala);
    }
    const niño = tiempo < 2.7;
    const xGlobo = niño ? 660 : 700;
    contexto.fillStyle = '#fffaf0'; contexto.strokeStyle = '#65462f'; contexto.lineWidth = 5;
    contexto.beginPath(); contexto.roundRect(xGlobo, 190, 560, 132, 26); contexto.fill(); contexto.stroke();
    contexto.fillStyle = '#35291f'; contexto.font = 'bold 30px sans-serif'; contexto.textAlign = 'center';
    const lineas = niño ? ['Mamá, mamá, ¿podemos ir', 'al parque del desierto?'] : ['Sí, ahorita vamos.'];
    lineas.forEach((linea, i) => contexto.fillText(linea, xGlobo + 280, 244 + i * 42));
    contexto.fillStyle = 'rgba(25,18,12,.78)'; contexto.fillRect(390, 663, 500, 12);
    contexto.fillStyle = '#ffd45f'; contexto.fillRect(390, 663, 500 * Math.min(1, tiempo / 5), 12);
    contexto.fillStyle = '#fff'; contexto.font = 'bold 20px sans-serif';
    contexto.fillText('Espacio, Enter o toca para saltar', 640, 705);
    contexto.restore();
  }

  const alTocarCinematica = () => { saltarCinematica(); };
  canvas.addEventListener?.('pointerdown', alTocarCinematica);

  animacionId = ventana.requestAnimationFrame(ciclo);

  // Pestaña oculta: para el bucle y la música; al volver reanuda sin un salto de tiempo.
  function alCambiarVisibilidad() {
    if (documento.visibilityState === 'hidden') {
      if (animacionId) ventana.cancelAnimationFrame(animacionId);
      animacionId = null;
      musica.pausar();
    } else if (!animacionId) {
      ultimoTiempo = performance.now();
      animacionId = ventana.requestAnimationFrame(ciclo);
      musica.reanudar();
    }
  }
  documento.addEventListener?.('visibilitychange', alCambiarVisibilidad);

  function detener() {
    if (animacionId) {
      ventana.cancelAnimationFrame(animacionId);
      animacionId = null;
    }
    entrada.destruir();
    documento.removeEventListener?.('visibilitychange', alCambiarVisibilidad);
    ventana.removeEventListener('resize', redimensionar);
    ventana.removeEventListener('orientationchange', redimensionar);
    if (ventana.visualViewport) {
      ventana.visualViewport.removeEventListener('resize', redimensionar);
    }
    ventana.removeEventListener('keydown', alPulsarTecla);
    if (alPulsarMusica) ventana.removeEventListener('keydown', alPulsarMusica);
    musica.detener();
    if (temporizadorFinal) ventana.clearTimeout?.(temporizadorFinal);
    canvas.removeEventListener?.('pointerdown', alTocarCinematica);
    if (btnSubir) btnSubir.onclick = null;
    if (btnTraje) {
      btnTraje.onclick = null;
    }
    if (btnPausa) btnPausa.onclick = null;
    if (btnSubir) btnSubir.onclick = null;
    if (btnMenu) {
      btnMenu.onclick = null;
    }
    if (btnCerrarMenu) {
      btnCerrarMenu.onclick = null;
    }
    if (modalMenuFondo) {
      modalMenuFondo.onclick = null;
    }
    if (instanciaMenu) {
      instanciaMenu.destruir();
      instanciaMenu = null;
    }
  }

  return {
    iniciado: true,
    senku,
    get escena() { return escenaActual; },
    get jefe() { return jefe; },
    get jefeBalam() { return jefeBalam; },
    get lanzador() { return lanzador; },
    estadoJugador: () => estadoJugador,
    estadoCombate,
    enemigos,
    entrada,
    avanzarPaso,
    intentarSubir,
    avisoViaje: () => aviso,
    reiniciarEscena,
    actualizarHUDVida,
    recogerBotiquin: (botiquin) => {
      const res = recogerBotiquin({
        jugador: senku,
        botiquin,
        estadoCombate,
        estadoJugador,
      });
      if (res.recogido) {
        estadoJugador = res.estadoJugador;
        guardarProgreso();
        actualizarHUDVida();
        mostrarAviso('+25 Vida');
      }
      return res;
    },
    obtenerTrajeActivo: () => trajeActivo,
    equiparTraje: (id) => {
      const res = equiparTraje(estadoJugador, id);
      if (res.exito) {
        estadoJugador = res.estado;
        if (almacen) guardar(almacen, estadoJugador);
        refrescarVistaTraje();
        if (instanciaMenu) {
          instanciaMenu.actualizar(estadoJugador);
        }
      }
      return res;
    },
    alternarTraje: alternarTrajeJugador,
    abrirMenu,
    cerrarMenu,
    alternarMenu,
    esMenuAbierto: () => menuAbierto,
    instanciaMenu: () => instanciaMenu,
    stubEconomia,
    catalogoMenu: CATALOGO_MENU,
    detener,
  };
}

// Auto-arranque al cargar en navegador
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const arrancar = () => {
    let vista = false;
    try { vista = window.sessionStorage?.getItem('senku2_portada_vista') === '1'; } catch { /* sin almacenamiento */ }
    if (vista || !debeMostrarPortada(window.location)) {
      window.__senku2 = arrancarSenku2();
      return;
    }
    let tieneProgreso = false;
    try { tieneProgreso = Boolean(window.localStorage?.getItem('senku2_save')); } catch { /* sin almacenamiento */ }
    mostrarPortada(document, { tieneProgreso, alJugar: () => {
      // Una vez por sesión: al volver de un bonus no se repite la portada.
      try { window.sessionStorage?.setItem('senku2_portada_vista', '1'); } catch { /* sin almacenamiento */ }
      window.__senku2 = arrancarSenku2();
    } });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
}
