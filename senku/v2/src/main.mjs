// Punto de entrada principal para Senku 2 (primera pantalla: Taquería).
// Conecta guardado/migración, escena, física, entrada y renderizado canvas letterbox.

import { iniciar } from './core/migracion.mjs';
import { almacenDelNavegador } from './core/store.mjs';
import { crearCuerpo, actualizarCuerpo } from './core/fisica.mjs';
import { crearRegistroEscenas } from './core/escenas.mjs';
import { escenaTaqueria } from './data/escenas/taqueria.mjs';
import { crearManejadorEntrada } from './core/entrada.mjs';
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

    // Física
    const estadoEntrada = entrada.obtenerEstado();
    actualizarCuerpo(
      senku,
      estadoEntrada,
      escenaActual.plataformas,
      escenaActual.limites,
      dt
    );

    // Dibujado
    renderizarEscena({
      ctx,
      escena: escenaActual,
      cuerpoJugador: senku,
      catalogoArte,
      tiempo: tiempoAcumulado,
    });

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
