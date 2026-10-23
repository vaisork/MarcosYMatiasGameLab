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
import { crearCuerpo, actualizarCuerpo } from './core/fisica.mjs';
import { crearRegistroEscenas } from './core/escenas.mjs';
import { escenaTaqueria } from './data/escenas/taqueria.mjs';
import { crearManejadorEntrada } from './core/entrada.mjs';
import { crearEnemigo, actualizarEnemigos } from './core/enemigos.mjs';
import {
  crearEstadoCombate,
  actualizarCombate,
  resolverContactoEnemigo,
  reiniciarCombate,
  HP_INICIAL_SENKU,
  TIEMPO_INVULNERABILIDAD_DEFECTO,
} from './core/combate.mjs';

// Decisión de diseño: Senku inicia con 100 HP y 1 s de invulnerabilidad tras ser golpeado
export const HP_INICIAL_DEFECTO = HP_INICIAL_SENKU;
export const TIEMPO_INVULNERABILIDAD_JUEGO = TIEMPO_INVULNERABILIDAD_DEFECTO;
import {
  ANCHO_LOGICO,
  ALTO_LOGICO,
  ajustarLienzoLetterbox,
  crearCatalogoArte,
  dibujarAvisoCarga,
  renderizarEscena,
} from './render/canvas.mjs';
import {
  HOJAS_JUGADOR,
  IMAGENES_OBJETO,
  RETRATOS_MENU,
  crearAnimadorEnemigos,
  dibujarEnemigo,
  dibujarJugador,
  resolverRutaArte,
  rutaFondoEscena,
  rutasPrecargaArte,
} from './render/sprites.mjs';
import { montarMenu } from './ui/menu.mjs';

// Catálogo representativo de trajes para el Menú de Selección en Senku 2
// REGLA: Precios creativos pendientes van como null (etiqueta 'Próximamente'); no inventar cifras ni arte.
export const CATALOGO_MENU = [
  {
    id: ID_ORIGINAL,
    nombre: 'Senku Original',
    precio: null,
    menu: resolverRutaArte(RETRATOS_MENU.original),
    sprite: resolverRutaArte(HOJAS_JUGADOR.original),
  },
  {
    id: ID_RATA,
    nombre: 'Senku Rata',
    precio: null, // Pendiente creativo D2 (regla: etiqueta 'Próximamente', sin compra)
    equivaleA: [ID_SECRETO_LEGACY],
    menu: resolverRutaArte(RETRATOS_MENU.rata),
    sprite: resolverRutaArte(HOJAS_JUGADOR.rata),
  },
];

// TODO: Reemplazar con core/economia.mjs cuando Codex lo integre en origin/main
export const stubEconomia = {
  /**
   * Equipa un traje si el jugador lo posee en el estado.
   * Conecta con trajes_activo.mjs para resolver equivalencias (rata <-> secreto_legacy).
   */
  equipar(estado, idTraje) {
    const res = equiparTraje(estado, idTraje);
    if (!res.exito) {
      return { error: res.motivo || 'error_al_equipar' };
    }
    return res.estado;
  },

  /**
   * Compra un traje si el saldo de Churus alcanza.
   * Regla: Precios en null no se pueden comprar ('precio_no_definido').
   */
  comprarTraje(estado, idTraje, catalogo) {
    // TODO: Conectar con libro de economía real una vez disponible
    const items = Array.isArray(catalogo) ? catalogo : Object.values(catalogo || {});
    const item = items.find((t) => t && (t.id === idTraje || (Array.isArray(t.equivaleA) && t.equivaleA.includes(idTraje))));
    if (!item) {
      return { error: 'traje_desconocido' };
    }
    if (item.precio === null || item.precio === undefined) {
      return { error: 'precio_no_definido' };
    }
    const saldo = typeof estado?.churus === 'number' ? estado.churus : 0;
    if (saldo < item.precio) {
      return { error: 'saldo_insuficiente' };
    }
    const trajes = Array.isArray(estado?.trajes) ? [...estado.trajes] : ['original'];
    if (!trajes.includes(idTraje)) {
      trajes.push(idTraje);
    }
    return {
      ...estado,
      churus: saldo - item.precio,
      trajes,
    };
  },
};

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
    if (e.key === 'Escape') {
      if (menuAbierto) {
        cerrarMenu();
        e.preventDefault();
      }
    } else if (e.key === 'm' || e.key === 'M') {
      alternarMenu();
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

  // Instanciar enemigos de la escena Taquería
  const definicionEnemigos = Array.isArray(escenaTaqueria.enemigos) ? escenaTaqueria.enemigos : [];
  let enemigos = definicionEnemigos.map(crearEnemigo);

  actualizarHUDVida();

  // Reinicia la escena al llegar a 0 de vida con vida llena y enemigos restaurados
  function reiniciarEscena() {
    senku.x = escenaActual.puntoEntrada.x;
    senku.y = escenaActual.puntoEntrada.y;
    senku.vx = 0;
    senku.vy = 0;
    senku.enSuelo = false;
    senku.saltando = false;
    senku.tiempoSalto = 0;

    // Restaurar enemigos de la escena vivos y en posición original
    enemigos.length = 0;
    for (const def of definicionEnemigos) {
      enemigos.push(crearEnemigo(def));
    }

    // Restaurar salud completa (100) y limpiar combate
    reiniciarCombate(estadoCombate);
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
  const btnIzq = documento.getElementById('btn-izq');
  const btnDer = documento.getElementById('btn-der');
  const btnSalto = documento.getElementById('btn-salto');

  const entrada = crearManejadorEntrada({
    ventana,
    documento,
    elementosBotones: {
      izquierda: btnIzq,
      derecha: btnDer,
      salto: btnSalto,
    },
  });

  // 7. Catálogo de arte desacoplado
  // Precarga única; mientras tanto (o si una imagen falla) se dibujan los rectángulos de respaldo
  const catalogoArte = crearCatalogoArte();
  const rutaFondo = rutaFondoEscena(escenaActual.id);
  catalogoArte.precargar(rutasPrecargaArte({
    escenaId: escenaActual.id,
    tiposEnemigo: enemigos.map((e) => e.tipo),
  }));
  const animadorEnemigos = crearAnimadorEnemigos();

  // 8. Bucle principal de juego
  let animacionId = null;
  let ultimoTiempo = performance.now();
  let tiempoAcumulado = 0;

  function avanzarPaso(dt = 1 / 60) {
    if (!menuAbierto) {
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
        const resContacto = resolverContactoEnemigo(senku, enemigo, estadoCombate);
        if (resContacto.contacto && resContacto.tipo === 'golpe') {
          actualizarHUDVida();
          // Al llegar a 0 de vida, reiniciar la escena con vida llena
          if (estadoCombate.hp === 0 || resContacto.muerto || estadoCombate.derrotado) {
            reiniciarEscena();
            break;
          }
        }
      }
    }
  }

  function ciclo(ahora) {
    const dt = Math.min((ahora - ultimoTiempo) / 1000, 0.05);
    ultimoTiempo = ahora;
    tiempoAcumulado += dt;

    avanzarPaso(dt);

    // Dibujado de escena base
    renderizarEscena({
      ctx,
      escena: escenaActual,
      cuerpoJugador: null, // Dibujado con traje activo y etiqueta a continuación
      catalogoArte,
      rutaFondo,
      tiempo: tiempoAcumulado,
    });

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
        if (dibujarEnemigo(ctx, catalogoArte, animadorEnemigos, enemigo, tiempoAcumulado)) continue;
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
      ctx.restore();
    }

    dibujarAvisoCarga(ctx, catalogoArte);

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
    ventana.removeEventListener('orientationchange', redimensionar);
    if (ventana.visualViewport) {
      ventana.visualViewport.removeEventListener('resize', redimensionar);
    }
    ventana.removeEventListener('keydown', alPulsarTecla);
    if (btnTraje) {
      btnTraje.onclick = null;
    }
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
    escena: escenaActual,
    estadoJugador: () => estadoJugador,
    estadoCombate,
    enemigos,
    entrada,
    avanzarPaso,
    reiniciarEscena,
    actualizarHUDVida,
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.__senku2 = arrancarSenku2();
    });
  } else {
    window.__senku2 = arrancarSenku2();
  }
}
