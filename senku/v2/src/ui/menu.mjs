// Vista DOM accesible para el menú de selección de Senkus.
// Compatible con iPad, teléfono y escritorio (táctil y teclado). Sin dependencias.

import { crearModelo, accionarTarjeta } from './menu_modelo.mjs';

/**
 * Monta el menú de selección de trajes dentro de un contenedor del DOM.
 *
 * @param {HTMLElement} contenedor Elemento DOM donde se renderizará el menú
 * @param {object} opciones
 * @param {object} opciones.estado Estado del juego ({ churus, trajes, equipado })
 * @param {Array|object} opciones.catalogo Catálogo de trajes
 * @param {object} opciones.economia Objeto con { equipar, comprarTraje }
 * @param {Function} [opciones.onCambioEstado] Callback cuando el estado cambia
 * @param {string} [opciones.rutaChuru] Ruta a la imagen del churu
 * @returns {{ actualizar: Function, destruir: Function, obtenerEstado: Function }}
 */
export function montarMenu(contenedor, opciones = {}) {
  if (!contenedor) {
    throw new Error('Se requiere un contenedor DOM válido para montar el menú.');
  }

  let estadoActual = opciones.estado ? { ...opciones.estado } : { churus: 0, trajes: ['original'], equipado: 'original' };
  const catalogo = opciones.catalogo || [];
  const economia = opciones.economia || {
    equipar(st, id) { return { ...st, equipado: id }; },
    comprarTraje(st, id) { return { ...st, trajes: [...st.trajes, id] }; },
  };
  const onCambioEstado = opciones.onCambioEstado || null;
  const rutaChuru = opciones.rutaChuru || 'senku/v2/assets/objetos/churu.png';

  let mensajeTimeout = null;

  function mostrarMensaje(texto, tipo = 'info') {
    const elMensaje = contenedor.querySelector('.menu-mensaje');
    if (!elMensaje) return;
    elMensaje.textContent = texto;
    elMensaje.className = `menu-mensaje mensaje-${tipo} visible`;
    if (mensajeTimeout) clearTimeout(mensajeTimeout);
    mensajeTimeout = setTimeout(() => {
      elMensaje.textContent = '';
      elMensaje.className = 'menu-mensaje';
    }, 4000);
  }

  function renderizar() {
    const tarjetas = crearModelo(estadoActual, catalogo);
    const saldo = typeof estadoActual.churus === 'number' ? estadoActual.churus : 0;

    contenedor.innerHTML = `
      <section class="senku-menu" aria-label="Menú de selección de Senkus">
        <header class="menu-cabecera">
          <div class="menu-titulo-grupo">
            <h1 class="menu-titulo">Armario de Senku</h1>
            <p class="menu-subtitulo">Elige el traje para tu aventura</p>
          </div>
          <div class="menu-saldo" aria-label="Saldo de Churus: ${saldo}">
            <span class="saldo-etiqueta">Churus</span>
            <div class="saldo-valor-grupo">
              <img class="saldo-icono" src="${rutaChuru}" alt="" aria-hidden="true"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
              <span class="saldo-icono-texto" style="display:none;" aria-hidden="true">🐟</span>
              <span class="saldo-cantidad">${saldo}</span>
            </div>
          </div>
        </header>

        <div class="menu-mensaje" role="status" aria-live="polite"></div>

        <div class="menu-grid" role="region" aria-label="Catálogo de Senkus">
          ${tarjetas.map((t) => renderizarTarjeta(t)).join('')}
        </div>
      </section>
    `;

    // Vincular imágenes para mostrar el recuadro con nombre si fallan al cargar
    const imagenes = contenedor.querySelectorAll('.tarjeta-imagen');
    imagenes.forEach((img) => {
      img.addEventListener('error', () => {
        img.style.display = 'none';
        const placeholder = img.nextElementSibling;
        if (placeholder && placeholder.classList.contains('tarjeta-placeholder')) {
          placeholder.style.display = 'flex';
        }
      });
      // Si ya falló o no tiene src válido
      if (!img.getAttribute('src')) {
        img.style.display = 'none';
        const placeholder = img.nextElementSibling;
        if (placeholder && placeholder.classList.contains('tarjeta-placeholder')) {
          placeholder.style.display = 'flex';
        }
      }
    });

    // Delegación de eventos para botones
    const botones = contenedor.querySelectorAll('button[data-id]');
    botones.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        const accion = btn.getAttribute('data-accion');
        ejecutarAccion(id, accion);
      });
    });
  }

  function renderizarTarjeta(t) {
    const esEquipado = t.estado === 'equipado';
    const esDesbloqueado = t.estado === 'desbloqueado';
    const esBloqueado = t.estado === 'bloqueado';

    let botonHtml = '';
    if (esEquipado) {
      botonHtml = `
        <button type="button" class="btn btn-equipado" disabled aria-disabled="true">
          Equipado
        </button>
      `;
    } else if (esDesbloqueado) {
      botonHtml = `
        <button type="button" class="btn btn-equipar" data-accion="equipar" data-id="${t.id}"
                aria-label="Equipar traje ${t.nombre}">
          Equipar
        </button>
      `;
    } else if (esBloqueado) {
      if (t.precio === null) {
        botonHtml = `
          <div class="bloqueado-aviso" aria-label="Traje disponible próximamente">
            <span class="bloqueado-texto">Próximamente</span>
          </div>
        `;
      } else {
        const titleMotivo = t.motivo === 'saldo_insuficiente' ? 'No tienes suficientes Churus' : '';
        botonHtml = `
          <button type="button" class="btn btn-comprar" data-accion="comprar" data-id="${t.id}"
                  ${t.deshabilitado ? 'disabled aria-disabled="true"' : ''}
                  title="${titleMotivo}"
                  aria-label="Comprar traje ${t.nombre} por ${t.precio} Churus${t.deshabilitado ? ' (saldo insuficiente)' : ''}">
            Comprar (${t.precio})
          </button>
        `;
      }
    }

    const badgeClase = `badge-${t.estado}`;
    const badgeTexto = esEquipado ? 'En uso' : (esDesbloqueado ? 'Disponible' : (t.precio === null ? 'Próximamente' : `${t.precio} Churus`));

    return `
      <article class="tarjeta-traje estado-${t.estado}" data-traje-id="${t.id}">
        <div class="tarjeta-badge ${badgeClase}">
          ${badgeTexto}
        </div>
        <div class="tarjeta-preview">
          <img class="tarjeta-imagen" src="${t.menu || ''}" alt="Ilustración de ${t.nombre}" loading="lazy">
          <div class="tarjeta-placeholder" style="display: ${t.menu ? 'none' : 'flex'};">
            <span class="placeholder-icono" aria-hidden="true">🐱</span>
            <span class="placeholder-nombre">${t.nombre}</span>
          </div>
        </div>
        <div class="tarjeta-cuerpo">
          <h2 class="tarjeta-nombre">${t.nombre}</h2>
          <div class="tarjeta-acciones">
            ${botonHtml}
          </div>
        </div>
      </article>
    `;
  }

  function ejecutarAccion(id, accion) {
    const res = accionarTarjeta(estadoActual, catalogo, id, economia);
    if (res.error) {
      mostrarMensaje(res.mensaje, 'error');
      return;
    }
    if (res.estado) {
      const previoEquipado = estadoActual.equipado;
      estadoActual = res.estado;
      renderizar();
      const nuevoEquipado = estadoActual.equipado;
      if (nuevoEquipado !== previoEquipado) {
        mostrarMensaje(`¡Traje ${id} equipado con éxito!`, 'exito');
      } else if (accion === 'comprar') {
        mostrarMensaje(`¡Traje ${id} desbloqueado!`, 'exito');
      }
      if (typeof onCambioEstado === 'function') {
        onCambioEstado(estadoActual);
      }
    }
  }

  // Render inicial
  renderizar();

  return {
    actualizar(nuevoEstado) {
      if (nuevoEstado && typeof nuevoEstado === 'object') {
        estadoActual = { ...nuevoEstado };
        renderizar();
      }
    },
    destruir() {
      if (mensajeTimeout) clearTimeout(mensajeTimeout);
      contenedor.innerHTML = '';
    },
    obtenerEstado() {
      return { ...estadoActual };
    },
  };
}
