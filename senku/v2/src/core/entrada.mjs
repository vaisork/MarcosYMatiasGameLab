// Interfaz unificada de entrada para Senku 2: teclado y controles táctiles/pantalla.
// Mapea flechas, WASD, espacio y botones táctiles a una sola estructura de estado.

export const ACCIONES = {
  IZQUIERDA: 'izquierda',
  DERECHA: 'derecha',
  SALTO: 'salto',
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
    default:
      return null;
  }
}

export function crearEstadoEntrada() {
  return {
    izquierda: false,
    derecha: false,
    salto: false,
  };
}

// Manejador unificado de entrada desacoplado
export function crearManejadorEntrada({ ventana = null, elementosBotones = {} } = {}) {
  const estado = crearEstadoEntrada();
  const codigosTeclasPresionadas = new Set();
  const botonesPresionados = new Set();
  const limpiadores = [];

  function actualizarEstado() {
    let tieneIzq = botonesPresionados.has(ACCIONES.IZQUIERDA);
    let tieneDer = botonesPresionados.has(ACCIONES.DERECHA);
    let tieneSalto = botonesPresionados.has(ACCIONES.SALTO);

    for (const codigo of codigosTeclasPresionadas) {
      const accion = mapearCodigoTecla(codigo);
      if (accion === ACCIONES.IZQUIERDA) tieneIzq = true;
      if (accion === ACCIONES.DERECHA) tieneDer = true;
      if (accion === ACCIONES.SALTO) tieneSalto = true;
    }

    estado.izquierda = tieneIzq;
    estado.derecha = tieneDer;
    estado.salto = tieneSalto;
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

  // Conectar con ventana si está presente
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

    ventana.addEventListener('keydown', onKeyDown);
    ventana.addEventListener('keyup', onKeyUp);

    limpiadores.push(() => {
      ventana.removeEventListener('keydown', onKeyDown);
      ventana.removeEventListener('keyup', onKeyUp);
    });
  }

  // Conectar botones táctiles / pointer
  function conectarBoton(elemento, accion) {
    if (!elemento || typeof elemento.addEventListener !== 'function') return;

    const iniciar = (e) => {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      procesarBoton(accion, true);
    };

    const terminar = (e) => {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      procesarBoton(accion, false);
    };

    elemento.addEventListener('pointerdown', iniciar);
    elemento.addEventListener('pointerup', terminar);
    elemento.addEventListener('pointercancel', terminar);
    elemento.addEventListener('pointerleave', terminar);

    limpiadores.push(() => {
      elemento.removeEventListener('pointerdown', iniciar);
      elemento.removeEventListener('pointerup', terminar);
      elemento.removeEventListener('pointercancel', terminar);
      elemento.removeEventListener('pointerleave', terminar);
    });
  }

  if (elementosBotones.izquierda) conectarBoton(elementosBotones.izquierda, ACCIONES.IZQUIERDA);
  if (elementosBotones.derecha) conectarBoton(elementosBotones.derecha, ACCIONES.DERECHA);
  if (elementosBotones.salto) conectarBoton(elementosBotones.salto, ACCIONES.SALTO);

  function obtenerEstado() {
    return { ...estado };
  }

  function establecerAccion(accion, activo) {
    procesarBoton(accion, Boolean(activo));
  }

  function destruir() {
    for (const limpiar of limpiadores) {
      limpiar();
    }
    limpiadores.length = 0;
    codigosTeclasPresionadas.clear();
    botonesPresionados.clear();
    actualizarEstado();
  }

  return {
    obtenerEstado,
    procesarTecla,
    procesarBoton,
    establecerAccion,
    conectarBoton,
    destruir,
  };
}
