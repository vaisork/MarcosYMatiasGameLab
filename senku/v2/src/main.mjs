// Punto de entrada principal para Senku 2 (primera pantalla: Taquería).
// Conecta guardado/migración, escena, física, entrada y renderizado canvas letterbox.

import { iniciar } from './core/migracion.mjs';
import { almacenDelNavegador } from './core/store.mjs';
import { crearCuerpo, actualizarCuerpo } from './core/fisica.mjs';
import { crearRegistroEscenas } from './core/escenas.mjs';
import { escenaTaqueria } from './data/escenas/taqueria.mjs';
import { crearManejadorEntrada } from './core/entrada.mjs';
import { crearEnemigo, actualizarEnemigos } from './core/enemigos.mjs';
import {
  crearEstadoCombate,
  actualizarCombate,
  resolverContactoEnemigo,
} from './core/combate.mjs';
import {
  ANCHO_LOGICO,
  ALTO_LOGICO,
  ajustarLienzoLetterbox,
  crearCatalogoArte,
  renderizarEscena,
} from './render/canvas.mjs';

export function arrancarSenku2({
  documento = typeof document !== 'undefined' ? document : null,
  ventana = typeof window !== 'undefined' ? window : null,
} = {}) {
  if (!documento || !ventana) {
    return { iniciado: false, motivo: 'sin_entorno_dom' };
  }

  // 1. Cargar o migrar guardado tolerante
  const almacen = almacenDelNavegador(ventana);
  const resultadoInicio = iniciar(almacen);
  const estadoJugador = resultadoInicio.estado;

  // 2. HUD: saldo de Churus (solo número)
  const elChurus = documento.getElementById('saldo-churus');
  if (elChurus) {
    elChurus.textContent = String(estadoJugador.churus);
  }

  // 3. Registro y carga de escenas
  const registro = crearRegistroEscenas();
  registro.registrar(escenaTaqueria);

  const escenaId = estadoJugador.progreso?.escena || 'taqueria';
  const escenaActual = registro.obtener(escenaId) || registro.obtener('taqueria');

  // 4. Inicializar entidad provisional Senku
  const senku = crearCuerpo({
    x: escenaActual.puntoEntrada.x,
    y: escenaActual.puntoEntrada.y,
    w: 54,
    h: 42,
  });

  // 4b. Sistema de combate y enemigos provisionales
  const estadoCombate = crearEstadoCombate({
    hpMax: null,          // Tolerante: política neutra hasta decidir D5
    vidasIniciales: null, // Sin pérdida numérica de vidas
  });

  // Instanciar enemigos de la escena Taquería
  const definicionEnemigos = Array.isArray(escenaTaqueria.enemigos) ? escenaTaqueria.enemigos : [];
  const enemigos = definicionEnemigos.map(crearEnemigo);

  // 5. Canvas y contexto de renderizado
  const canvas = documento.getElementById('lienzo-juego');
  if (!canvas) {
    return { iniciado: false, motivo: 'lienzo_no_encontrado' };
  }
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
  }

  // Ajuste letterbox responsive
  function redimensionar() {
    const contenedor = canvas.parentElement || documento.body;
    const w = contenedor.clientWidth || ventana.innerWidth;
    const h = contenedor.clientHeight || ventana.innerHeight;
    ajustarLienzoLetterbox(canvas, w, h);
  }
  ventana.addEventListener('resize', redimensionar);
  redimensionar();

  // 6. Controles táctiles y teclado
  const btnIzq = documento.getElementById('btn-izq');
  const btnDer = documento.getElementById('btn-der');
  const btnSalto = documento.getElementById('btn-salto');

  const entrada = crearManejadorEntrada({
    ventana,
    elementosBotones: {
      izquierda: btnIzq,
      derecha: btnDer,
      salto: btnSalto,
    },
  });

  // 7. Catálogo de arte desacoplado
  const catalogoArte = crearCatalogoArte();
  if (escenaActual.fondo?.ruta) {
    catalogoArte.cargar(escenaActual.fondo.ruta);
  }

  // 8. Bucle principal de juego
  let animacionId = null;
  let ultimoTiempo = performance.now();
  let tiempoAcumulado = 0;

  function ciclo(ahora) {
    const dt = Math.min((ahora - ultimoTiempo) / 1000, 0.05);
    ultimoTiempo = ahora;
    tiempoAcumulado += dt;

    // Física del jugador
    const estadoEntrada = entrada.obtenerEstado();
    actualizarCuerpo(
      senku,
      estadoEntrada,
      escenaActual.plataformas,
      escenaActual.limites,
      dt
    );

    // Combate y actualización de enemigos
    actualizarCombate(estadoCombate, dt);
    actualizarEnemigos(enemigos, dt, escenaActual.limites);

    for (const enemigo of enemigos) {
      if (!enemigo.vivo) continue;
      resolverContactoEnemigo(senku, enemigo, estadoCombate);
    }

    // Dibujado de escena base y Senku
    // Si Senku está invulnerable, parpadeo sutil
    const dibujarSenku = !estadoCombate.invulnerable || Math.floor(tiempoAcumulado * 16) % 2 === 0;

    renderizarEscena({
      ctx,
      escena: escenaActual,
      cuerpoJugador: dibujarSenku ? senku : null,
      catalogoArte,
      tiempo: tiempoAcumulado,
    });

    // Dibujado de enemigos con rectángulos provisionales limpios (sin inventar arte)
    if (ctx) {
      ctx.save();
      for (const enemigo of enemigos) {
        if (!enemigo.vivo) continue;

        // Sombra suave en suelo
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
      ctx.restore();
    }

    animacionId = ventana.requestAnimationFrame(ciclo);
  }

  animacionId = ventana.requestAnimationFrame(ciclo);

  function detener() {
    if (animacionId) {
      ventana.cancelAnimationFrame(animacionId);
      animacionId = null;
    }
    entrada.destruir();
    ventana.removeEventListener('resize', redimensionar);
  }

  return {
    iniciado: true,
    senku,
    escena: escenaActual,
    estadoJugador,
    estadoCombate,
    enemigos,
    entrada,
    detener,
  };
}

// Auto-arranque al cargar en navegador
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => arrancarSenku2());
  } else {
    arrancarSenku2();
  }
}
