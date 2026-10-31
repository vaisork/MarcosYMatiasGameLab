// Interfaz unificada de entrada para Senku 2: teclado y controles táctiles/pantalla.
// Mapea flechas, WASD, espacio y botones táctiles a una sola estructura de estado.

export const ACCIONES = {
  IZQUIERDA: 'izquierda',
  DERECHA: 'derecha',
  SALTO: 'salto',
  ATACAR: 'atacar',
  ANCLAR: 'anclar',
  ABAJO: 'abajo',
};

// Mapeo puro de códigos de teclado a acciones
export function mapearCodigoTecla(codigo) {
  switch (codigo) {
    case 'ArrowLeft':
    case 'KeyA':
      return ACCIONES.IZQUIERDA;
    case 'ArrowRight':
    case 'KeyD':
      return ACCIONES.DERECHA;
    case 'ArrowUp':
    case 'Space':
    case 'KeyW':
      return ACCIONES.SALTO;
    case 'KeyJ':
    case 'KeyX':
      return ACCIONES.ATACAR;
    case 'KeyK':
    case 'KeyC':
      return ACCIONES.ANCLAR;
    case 'ArrowDown':
    case 'KeyS':
      return ACCIONES.ABAJO;
    default:
      return null;
  }
}

// Coordenadas normalizadas: x positivo a la derecha, y positivo hacia abajo.
// Sectores de 45°; el vector conserva intensidad fuera de la zona muerta radial.
export function modelarJoystick(x = 0, y = 0, zonaMuerta = 0.2) {
  const distancia = Math.hypot(x, y);
  const centro = { x: 0, y: 0, izquierda: false, derecha: false, arriba: false, abajo: false };
  if (!Number.isFinite(distancia) || distancia <= zonaMuerta) return centro;
  const sector = Math.round(Math.atan2(y, x) / (Math.PI / 4));
  return {
    x: x / Math.max(1, distancia), y: y / Math.max(1, distancia),
    izquierda: Math.abs(sector) >= 3, derecha: Math.abs(sector) <= 1,
    arriba: sector <= -1 && sector >= -3, abajo: sector >= 1 && sector <= 3,
  };
}

export function crearEstadoEntrada() {
  return {
    izquierda: false,
    derecha: false,
    salto: false,
    atacar: false,
    anclar: false,
    arriba: false,
    abajo: false,
    vector: { x: 0, y: 0 },
  };
}

// Manejador unificado de entrada desacoplado
export function crearManejadorEntrada({
  ventana = null,
  documento = null,
  elementosBotones = {},
  elementoJoystick = null,
} = {}) {
  const estado = crearEstadoEntrada();
  const codigosTeclasPresionadas = new Set();
  const botonesPresionados = new Set();
  const limpiadores = [];
  let joystick = modelarJoystick();

  function actualizarEstado() {
    let tieneIzq = joystick.izquierda || botonesPresionados.has(ACCIONES.IZQUIERDA);
    let tieneDer = joystick.derecha || botonesPresionados.has(ACCIONES.DERECHA);
    let tieneSalto = botonesPresionados.has(ACCIONES.SALTO);
    let tieneAtaque = botonesPresionados.has(ACCIONES.ATACAR);
    let tieneAnclar = botonesPresionados.has(ACCIONES.ANCLAR);
    let tieneAbajo = false;

    for (const codigo of codigosTeclasPresionadas) {
      const accion = mapearCodigoTecla(codigo);
      if (accion === ACCIONES.IZQUIERDA) tieneIzq = true;
      if (accion === ACCIONES.DERECHA) tieneDer = true;
      if (accion === ACCIONES.SALTO) tieneSalto = true;
      if (accion === ACCIONES.ATACAR) tieneAtaque = true;
      if (accion === ACCIONES.ANCLAR) tieneAnclar = true;
      if (accion === ACCIONES.ABAJO) tieneAbajo = true;
    }

    estado.izquierda = tieneIzq;
    estado.derecha = tieneDer;
    estado.salto = tieneSalto;
    estado.atacar = tieneAtaque;
    estado.anclar = tieneAnclar;
    estado.arriba = joystick.arriba;
    estado.abajo = joystick.abajo || tieneAbajo;
    estado.vector = { x: joystick.x, y: joystick.y };
  }

  function procesarTecla(codigo, presionado) {
    const accion = mapearCodigoTecla(codigo);
    if (!accion) return false;
    if (presionado) {
      codigosTeclasPresionadas.add(codigo);
    } else {
      codigosTeclasPresionadas.delete(codigo);
    }
    actualizarEstado();
    return true;
  }

  function procesarBoton(accion, presionado) {
    if (!accion) return;
    if (presionado) {
      botonesPresionados.add(accion);
    } else {
      botonesPresionados.delete(accion);
    }
    actualizarEstado();
  }

  // Conectar botones táctiles / pointer con tolerancia a multitouch y sin doble disparo
  const reseteadoresBotones = [];

  function soltarTodo() {
    codigosTeclasPresionadas.clear();
    botonesPresionados.clear();
    for (const reset of reseteadoresBotones) {
      reset();
    }
    actualizarEstado();
  }

  // Conectar con ventana si está presente (teclado + blur para soltar todo)
  if (ventana && typeof ventana.addEventListener === 'function') {
    const onKeyDown = (e) => {
      const capturado = procesarTecla(e.code, true);
      if (capturado && (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown')) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
      }
    };

    const onKeyUp = (e) => {
      procesarTecla(e.code, false);
    };

    const onBlur = () => {
      soltarTodo();
    };

    ventana.addEventListener('keydown', onKeyDown);
    ventana.addEventListener('keyup', onKeyUp);
    ventana.addEventListener('blur', onBlur);

    limpiadores.push(() => {
      ventana.removeEventListener('keydown', onKeyDown);
      ventana.removeEventListener('keyup', onKeyUp);
      ventana.removeEventListener('blur', onBlur);
    });
  }

  // Conectar con documento si está presente para soltar al cambiar visibilidad
  const doc = documento || ventana?.document || (typeof document !== 'undefined' ? document : null);
  if (doc && typeof doc.addEventListener === 'function') {
    const onVisibilityChange = () => {
      if (doc.visibilityState === 'hidden') {
        soltarTodo();
      }
    };

    doc.addEventListener('visibilitychange', onVisibilityChange);

    limpiadores.push(() => {
      doc.removeEventListener('visibilitychange', onVisibilityChange);
    });
  }

  function conectarBoton(elemento, accion) {
    if (!elemento || typeof elemento.addEventListener !== 'function') return;

    let presionadoPor = null; // 'pointer' | 'touch' | null
    reseteadoresBotones.push(() => {
      presionadoPor = null;
      elemento.classList?.remove?.('presionado');
      if (accion === ACCIONES.ANCLAR) elemento.classList?.remove?.('apuntando');
    });

    const iniciarPointer = (e) => {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (presionadoPor === 'touch') {
        return; // Sintetizado/duplicado de un toque ya activo
      }
      presionadoPor = 'pointer';
      elemento.classList?.add?.('presionado');
      if (accion === ACCIONES.ANCLAR) elemento.classList?.add?.('apuntando');
      if (typeof elemento.setPointerCapture === 'function' && e?.pointerId !== undefined) {
        try { elemento.setPointerCapture(e.pointerId); } catch (_) {}
      }
      procesarBoton(accion, true);
    };

    const terminarPointer = (e) => {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof elemento.releasePointerCapture === 'function' && e?.pointerId !== undefined) {
        try { elemento.releasePointerCapture(e.pointerId); } catch (_) {}
      }
      if (presionadoPor === null) return;
      presionadoPor = null;
      elemento.classList?.remove?.('presionado');
      if (accion === ACCIONES.ANCLAR) elemento.classList?.remove?.('apuntando');
      procesarBoton(accion, false);
    };

    const iniciarTouch = (e) => {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (presionadoPor === 'pointer') {
        return; // Sintetizado/duplicado de un pointer ya activo
      }
      presionadoPor = 'touch';
      elemento.classList?.add?.('presionado');
      if (accion === ACCIONES.ANCLAR) elemento.classList?.add?.('apuntando');
      procesarBoton(accion, true);
    };

    const terminarTouch = (e) => {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (presionadoPor === null) return;
      presionadoPor = null;
      elemento.classList?.remove?.('presionado');
      if (accion === ACCIONES.ANCLAR) elemento.classList?.remove?.('apuntando');
      procesarBoton(accion, false);
    };

    const prevenirContextMenu = (e) => {
      if (typeof e.preventDefault === 'function') e.preventDefault();
    };

    elemento.addEventListener('pointerdown', iniciarPointer, { passive: false });
    elemento.addEventListener('pointerup', terminarPointer, { passive: false });
    elemento.addEventListener('pointercancel', terminarPointer, { passive: false });

    elemento.addEventListener('touchstart', iniciarTouch, { passive: false });
    elemento.addEventListener('touchend', terminarTouch, { passive: false });
    elemento.addEventListener('touchcancel', terminarTouch, { passive: false });
    elemento.addEventListener('contextmenu', prevenirContextMenu);

    limpiadores.push(() => {
      elemento.removeEventListener('pointerdown', iniciarPointer);
      elemento.removeEventListener('pointerup', terminarPointer);
      elemento.removeEventListener('pointercancel', terminarPointer);
      elemento.removeEventListener('touchstart', iniciarTouch);
      elemento.removeEventListener('touchend', terminarTouch);
      elemento.removeEventListener('touchcancel', terminarTouch);
      elemento.removeEventListener('contextmenu', prevenirContextMenu);
    });
  }

  if (elementoJoystick) {
    let pointerId = null;
    let touchId = null;
    const pintar = () => {
      elementoJoystick.style?.setProperty?.('--palanca-x', `${joystick.x * 32}px`);
      elementoJoystick.style?.setProperty?.('--palanca-y', `${joystick.y * 32}px`);
    };
    const reset = () => {
      const anterior = pointerId;
      pointerId = null;
      touchId = null;
      joystick = modelarJoystick();
      pintar();
      actualizarEstado();
      if (anterior !== null && elementoJoystick.hasPointerCapture?.(anterior)) {
        try { elementoJoystick.releasePointerCapture(anterior); } catch (_) {}
      }
    };
    reseteadoresBotones.push(reset);
    const mover = (e) => {
      if (e.pointerId !== pointerId) return;
      if (typeof e.preventDefault === 'function') e.preventDefault();
      const rect = elementoJoystick.getBoundingClientRect();
      const radio = Math.min(rect.width, rect.height) / 2;
      joystick = modelarJoystick((e.clientX - rect.left - rect.width / 2) / radio,
        (e.clientY - rect.top - rect.height / 2) / radio);
      pintar();
      actualizarEstado();
    };
    const iniciar = (e) => {
      if (pointerId !== null || (e.button !== undefined && e.button !== 0 && e.pointerType !== 'touch')) return;
      pointerId = e.pointerId;
      if (typeof elementoJoystick.setPointerCapture === 'function') {
        try { elementoJoystick.setPointerCapture(e.pointerId); } catch (_) {}
      }
      mover(e);
    };
    const terminar = (e) => {
      if (e.pointerId === pointerId) reset();
    };
    for (const [tipo, fn] of Object.entries({ pointerdown: iniciar, pointermove: mover,
      pointerup: terminar, pointercancel: terminar, lostpointercapture: terminar,
      contextmenu: (e) => e.preventDefault?.() })) {
      elementoJoystick.addEventListener(tipo, fn, { passive: false });
      limpiadores.push(() => elementoJoystick.removeEventListener(tipo, fn));
    }

    // Soporte multitáctil nativo complementario para celular (evita cancelaciones por gestos de scroll)
    const moverTouch = (t) => {
      const rect = elementoJoystick.getBoundingClientRect();
      const radio = Math.min(rect.width, rect.height) / 2;
      joystick = modelarJoystick((t.clientX - rect.left - rect.width / 2) / radio,
        (t.clientY - rect.top - rect.height / 2) / radio);
      pintar();
      actualizarEstado();
    };
    const iniciarTouch = (e) => {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (pointerId !== null || touchId !== null) return;
      const t = e.changedTouches?.[0];
      if (!t) return;
      touchId = t.identifier;
      moverTouch(t);
    };
    const pasoTouch = (e) => {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (touchId === null) return;
      for (let i = 0; i < (e.changedTouches?.length || 0); i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchId) {
          moverTouch(t);
          break;
        }
      }
    };
    const terminarTouch = (e) => {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (touchId === null) return;
      for (let i = 0; i < (e.changedTouches?.length || 0); i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchId) {
          reset();
          break;
        }
      }
    };
    elementoJoystick.addEventListener('touchstart', iniciarTouch, { passive: false });
    elementoJoystick.addEventListener('touchmove', pasoTouch, { passive: false });
    elementoJoystick.addEventListener('touchend', terminarTouch, { passive: false });
    elementoJoystick.addEventListener('touchcancel', terminarTouch, { passive: false });
    limpiadores.push(() => {
      elementoJoystick.removeEventListener('touchstart', iniciarTouch);
      elementoJoystick.removeEventListener('touchmove', pasoTouch);
      elementoJoystick.removeEventListener('touchend', terminarTouch);
      elementoJoystick.removeEventListener('touchcancel', terminarTouch);
    });
  }

  if (elementosBotones.izquierda) conectarBoton(elementosBotones.izquierda, ACCIONES.IZQUIERDA);
  if (elementosBotones.derecha) conectarBoton(elementosBotones.derecha, ACCIONES.DERECHA);
  if (elementosBotones.salto) conectarBoton(elementosBotones.salto, ACCIONES.SALTO);
  if (elementosBotones.atacar) conectarBoton(elementosBotones.atacar, ACCIONES.ATACAR);
  if (elementosBotones.anclar) conectarBoton(elementosBotones.anclar, ACCIONES.ANCLAR);

  function obtenerEstado() {
    return { ...estado, vector: { ...estado.vector } };
  }

  function establecerAccion(accion, activo) {
    procesarBoton(accion, Boolean(activo));
  }

  function destruir() {
    for (const limpiar of limpiadores) {
      limpiar();
    }
    limpiadores.length = 0;
    soltarTodo();
  }

  return {
    obtenerEstado,
    procesarTecla,
    procesarBoton,
    establecerAccion,
    conectarBoton,
    soltarTodo,
    destruir,
  };
}
