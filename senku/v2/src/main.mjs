// Punto de entrada principal para Senku 2 (primera pantalla: Taquería).
// Conecta guardado/migración, escena, física, entrada y renderizado canvas letterbox.

import { iniciar } from './core/migracion.mjs';
import { almacenDelNavegador, guardar } from './core/store.mjs';
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
  let estadoJugador = resultadoInicio.estado;

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
    elChurus.textContent = String(estadoJugador.churus);
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

  let trajeActivo = obtenerTrajeActivo(estadoJugador);

  function refrescarVistaTraje() {
    trajeActivo = obtenerTrajeActivo(estadoJugador);
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
  }

  function alternarTrajeJugador() {
    const res = alternarTraje(estadoJugador);
    if (res.exito) {
      estadoJugador = res.estado;
      if (almacen) guardar(almacen, estadoJugador);
      refrescarVistaTraje();
    }
    return res;
  }

  if (btnTraje) {
    btnTraje.onclick = () => alternarTrajeJugador();
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
  refrescarVistaTraje();

  function alPulsarTecla(e) {
    if (e.key === 't' || e.key === 'T') {
      alternarTrajeJugador();
    }
  }
  ventana.addEventListener('keydown', alPulsarTecla);

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

    // Dibujado de escena base
    renderizarEscena({
      ctx,
      escena: escenaActual,
      cuerpoJugador: null, // Dibujado con traje activo y etiqueta a continuación
      catalogoArte,
      tiempo: tiempoAcumulado,
    });

    // Dibujado de Senku con color y etiqueta del traje activo
    if (ctx && dibujarSenku) {
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

      ctx.restore();
    }

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
    ventana.removeEventListener('keydown', alPulsarTecla);
    if (btnTraje) {
      btnTraje.onclick = null;
    }
  }

  return {
    iniciado: true,
    senku,
    escena: escenaActual,
    estadoJugador: () => estadoJugador,
    estadoCombate,
    enemigos,
    entrada,
    obtenerTrajeActivo: () => trajeActivo,
    equiparTraje: (id) => {
      const res = equiparTraje(estadoJugador, id);
      if (res.exito) {
        estadoJugador = res.estado;
        if (almacen) guardar(almacen, estadoJugador);
        refrescarVistaTraje();
      }
      return res;
    },
    alternarTraje: alternarTrajeJugador,
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
