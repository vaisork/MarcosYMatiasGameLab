import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACCIONES,
  mapearCodigoTecla,
  crearEstadoEntrada,
  crearManejadorEntrada,
} from '../src/core/entrada.mjs';
import {
  sincronizarViewportCSS,
  actualizarAvisoOrientacion,
} from '../src/main.mjs';

function crearElementoSimulado() {
  const listeners = new Map();
  let pointerCapturado = null;

  return {
    addEventListener(evento, fn) {
      if (!listeners.has(evento)) listeners.set(evento, []);
      listeners.get(evento).push(fn);
    },
    removeEventListener(evento, fn) {
      if (!listeners.has(evento)) return;
      listeners.set(evento, listeners.get(evento).filter((f) => f !== fn));
    },
    dispatchEvent(evento) {
      const lista = listeners.get(evento.type) || [];
      for (const fn of lista) {
        fn(evento);
      }
    },
    setPointerCapture(id) {
      pointerCapturado = id;
    },
    releasePointerCapture(id) {
      if (pointerCapturado === id) pointerCapturado = null;
    },
    get pointerCapturado() {
      return pointerCapturado;
    },
    obtenerTotalListeners(evento) {
      return (listeners.get(evento) || []).length;
    },
  };
}

function crearEvento(tipo, opciones = {}) {
  let preventDefaultInvocado = false;
  return {
    type: tipo,
    preventDefault() {
      preventDefaultInvocado = true;
    },
    get preventDefaultInvocado() {
      return preventDefaultInvocado;
    },
    pointerId: opciones.pointerId ?? 1,
    ...opciones,
  };
}

test('mapearCodigoTecla y crearEstadoEntrada: mapeo puro de controles', () => {
  assert.equal(mapearCodigoTecla('ArrowLeft'), ACCIONES.IZQUIERDA);
  assert.equal(mapearCodigoTecla('KeyA'), ACCIONES.IZQUIERDA);
  assert.equal(mapearCodigoTecla('ArrowRight'), ACCIONES.DERECHA);
  assert.equal(mapearCodigoTecla('KeyD'), ACCIONES.DERECHA);
  assert.equal(mapearCodigoTecla('Space'), ACCIONES.SALTO);
  assert.equal(mapearCodigoTecla('ArrowUp'), ACCIONES.SALTO);
  assert.equal(mapearCodigoTecla('KeyW'), ACCIONES.SALTO);
  assert.equal(mapearCodigoTecla('KeyX'), null);

  const estado = crearEstadoEntrada();
  assert.deepEqual(estado, { izquierda: false, derecha: false, salto: false });
});

test('entrada táctil: pointerdown y pointerup activan y desactivan cada acción', () => {
  const btnIzq = crearElementoSimulado();
  const btnDer = crearElementoSimulado();
  const btnSalto = crearElementoSimulado();

  const manejador = crearManejadorEntrada({
    elementosBotones: {
      izquierda: btnIzq,
      derecha: btnDer,
      salto: btnSalto,
    },
  });

  // Estado inicial
  assert.deepEqual(manejador.obtenerEstado(), { izquierda: false, derecha: false, salto: false });

  // 1. Izquierda
  const evDownIzq = crearEvento('pointerdown', { pointerId: 10 });
  btnIzq.dispatchEvent(evDownIzq);
  assert.equal(btnIzq.pointerCapturado, 10);
  assert.equal(evDownIzq.preventDefaultInvocado, true);
  assert.equal(manejador.obtenerEstado().izquierda, true);

  const evUpIzq = crearEvento('pointerup', { pointerId: 10 });
  btnIzq.dispatchEvent(evUpIzq);
  assert.equal(btnIzq.pointerCapturado, null);
  assert.equal(manejador.obtenerEstado().izquierda, false);

  // 2. Derecha
  btnDer.dispatchEvent(crearEvento('pointerdown', { pointerId: 11 }));
  assert.equal(manejador.obtenerEstado().derecha, true);
  btnDer.dispatchEvent(crearEvento('pointerup', { pointerId: 11 }));
  assert.equal(manejador.obtenerEstado().derecha, false);

  // 3. Salto
  btnSalto.dispatchEvent(crearEvento('pointerdown', { pointerId: 12 }));
  assert.equal(manejador.obtenerEstado().salto, true);
  btnSalto.dispatchEvent(crearEvento('pointerup', { pointerId: 12 }));
  assert.equal(manejador.obtenerEstado().salto, false);

  manejador.destruir();
});

test('entrada táctil: pointercancel y touchcancel sueltan la acción limpiamente', () => {
  const btnIzq = crearElementoSimulado();
  const btnSalto = crearElementoSimulado();

  const manejador = crearManejadorEntrada({
    elementosBotones: {
      izquierda: btnIzq,
      salto: btnSalto,
    },
  });

  // pointercancel en izquierda
  btnIzq.dispatchEvent(crearEvento('pointerdown', { pointerId: 20 }));
  assert.equal(manejador.obtenerEstado().izquierda, true);
  btnIzq.dispatchEvent(crearEvento('pointercancel', { pointerId: 20 }));
  assert.equal(manejador.obtenerEstado().izquierda, false);

  // touchcancel en salto
  btnSalto.dispatchEvent(crearEvento('touchstart'));
  assert.equal(manejador.obtenerEstado().salto, true);
  btnSalto.dispatchEvent(crearEvento('touchcancel'));
  assert.equal(manejador.obtenerEstado().salto, false);

  manejador.destruir();
});

test('entrada táctil: touchstart y touchend responden directamente', () => {
  const btnDer = crearElementoSimulado();
  const manejador = crearManejadorEntrada({
    elementosBotones: { derecha: btnDer },
  });

  const evTouchStart = crearEvento('touchstart');
  btnDer.dispatchEvent(evTouchStart);
  assert.equal(evTouchStart.preventDefaultInvocado, true);
  assert.equal(manejador.obtenerEstado().derecha, true);

  const evTouchEnd = crearEvento('touchend');
  btnDer.dispatchEvent(evTouchEnd);
  assert.equal(evTouchEnd.preventDefaultInvocado, true);
  assert.equal(manejador.obtenerEstado().derecha, false);

  manejador.destruir();
});

test('sin doble disparo: sintetización touch/pointer en el mismo botón no duplica evento', () => {
  const btnSalto = crearElementoSimulado();
  const manejador = crearManejadorEntrada({
    elementosBotones: { salto: btnSalto },
  });

  // Caso 1: pointerdown seguido inmediatamente de touchstart sintetizado por el navegador
  const evPointerDown = crearEvento('pointerdown', { pointerId: 30 });
  const evTouchStart = crearEvento('touchstart');
  btnSalto.dispatchEvent(evPointerDown);
  assert.equal(manejador.obtenerEstado().salto, true);

  btnSalto.dispatchEvent(evTouchStart);
  // Se mantiene activo sin reiniciar ni fallar
  assert.equal(manejador.obtenerEstado().salto, true);

  // Caso 1b: touchend seguido de pointerup sintetizado
  const evTouchEnd = crearEvento('touchend');
  const evPointerUp = crearEvento('pointerup', { pointerId: 30 });
  btnSalto.dispatchEvent(evTouchEnd);
  assert.equal(manejador.obtenerEstado().salto, false);

  btnSalto.dispatchEvent(evPointerUp);
  assert.equal(manejador.obtenerEstado().salto, false);

  // Caso 2: touchstart primero seguido inmediatamente de pointerdown
  btnSalto.dispatchEvent(crearEvento('touchstart'));
  assert.equal(manejador.obtenerEstado().salto, true);

  btnSalto.dispatchEvent(crearEvento('pointerdown', { pointerId: 31 }));
  assert.equal(manejador.obtenerEstado().salto, true);

  btnSalto.dispatchEvent(crearEvento('pointerup', { pointerId: 31 }));
  assert.equal(manejador.obtenerEstado().salto, false);

  btnSalto.dispatchEvent(crearEvento('touchend'));
  assert.equal(manejador.obtenerEstado().salto, false);

  manejador.destruir();
});

test('multitoque: permite mantener dirección (◀/▶) y tocar Salto a la vez', () => {
  const btnIzq = crearElementoSimulado();
  const btnDer = crearElementoSimulado();
  const btnSalto = crearElementoSimulado();

  const manejador = crearManejadorEntrada({
    elementosBotones: {
      izquierda: btnIzq,
      derecha: btnDer,
      salto: btnSalto,
    },
  });

  // Dedo 1 presiona Izquierda
  btnIzq.dispatchEvent(crearEvento('pointerdown', { pointerId: 1 }));
  assert.deepEqual(manejador.obtenerEstado(), {
    izquierda: true,
    derecha: false,
    salto: false,
  });

  // Dedo 2 presiona Salto MIENTRAS Dedo 1 sigue en Izquierda
  btnSalto.dispatchEvent(crearEvento('pointerdown', { pointerId: 2 }));
  assert.deepEqual(manejador.obtenerEstado(), {
    izquierda: true,
    derecha: false,
    salto: true,
  });

  // Dedo 2 suelta Salto
  btnSalto.dispatchEvent(crearEvento('pointerup', { pointerId: 2 }));
  assert.deepEqual(manejador.obtenerEstado(), {
    izquierda: true,
    derecha: false,
    salto: false,
  });

  // Dedo 1 finalmente suelta Izquierda
  btnIzq.dispatchEvent(crearEvento('pointerup', { pointerId: 1 }));
  assert.deepEqual(manejador.obtenerEstado(), {
    izquierda: false,
    derecha: false,
    salto: false,
  });

  // Multitoque alternativo con eventos Touch nativos: Derecha + Salto
  btnDer.dispatchEvent(crearEvento('touchstart'));
  assert.equal(manejador.obtenerEstado().derecha, true);

  btnSalto.dispatchEvent(crearEvento('touchstart'));
  assert.equal(manejador.obtenerEstado().derecha, true);
  assert.equal(manejador.obtenerEstado().salto, true);

  btnSalto.dispatchEvent(crearEvento('touchend'));
  assert.equal(manejador.obtenerEstado().derecha, true);
  assert.equal(manejador.obtenerEstado().salto, false);

  btnDer.dispatchEvent(crearEvento('touchend'));
  assert.equal(manejador.obtenerEstado().derecha, false);
  assert.equal(manejador.obtenerEstado().salto, false);

  manejador.destruir();
});

test('robustez: soltar todas las acciones en blur de ventana o visibilitychange (hidden)', () => {
  const ventanaSimulada = crearElementoSimulado();
  const documentoSimulado = {
    ...crearElementoSimulado(),
    visibilityState: 'visible',
  };
  const btnIzq = crearElementoSimulado();
  const btnSalto = crearElementoSimulado();

  const manejador = crearManejadorEntrada({
    ventana: ventanaSimulada,
    documento: documentoSimulado,
    elementosBotones: {
      izquierda: btnIzq,
      salto: btnSalto,
    },
  });

  // 1. Activar mediante botón y tecla
  btnIzq.dispatchEvent(crearEvento('pointerdown', { pointerId: 5 }));
  manejador.procesarTecla('Space', true);
  assert.equal(manejador.obtenerEstado().izquierda, true);
  assert.equal(manejador.obtenerEstado().salto, true);

  // Pérdida de foco de la ventana (blur: cambiar de app, popup, etc.)
  ventanaSimulada.dispatchEvent({ type: 'blur' });
  assert.deepEqual(manejador.obtenerEstado(), {
    izquierda: false,
    derecha: false,
    salto: false,
  });

  // 2. Activar nuevamente y probar visibilitychange a 'hidden'
  btnSalto.dispatchEvent(crearEvento('touchstart'));
  manejador.procesarTecla('KeyD', true);
  assert.equal(manejador.obtenerEstado().salto, true);
  assert.equal(manejador.obtenerEstado().derecha, true);

  documentoSimulado.visibilityState = 'hidden';
  documentoSimulado.dispatchEvent({ type: 'visibilitychange' });
  assert.deepEqual(manejador.obtenerEstado(), {
    izquierda: false,
    derecha: false,
    salto: false,
  });

  manejador.destruir();
});

test('destruir: limpia listeners de botones, ventana y documento', () => {
  const ventanaSimulada = crearElementoSimulado();
  const documentoSimulado = {
    ...crearElementoSimulado(),
    visibilityState: 'visible',
  };
  const btnIzq = crearElementoSimulado();

  const manejador = crearManejadorEntrada({
    ventana: ventanaSimulada,
    documento: documentoSimulado,
    elementosBotones: { izquierda: btnIzq },
  });

  btnIzq.dispatchEvent(crearEvento('pointerdown'));
  assert.equal(manejador.obtenerEstado().izquierda, true);

  manejador.destruir();

  // El estado queda restablecido a inactivo
  assert.equal(manejador.obtenerEstado().izquierda, false);

  // Nuevos eventos no tienen efecto tras destruir
  btnIzq.dispatchEvent(crearEvento('pointerdown'));
  assert.equal(manejador.obtenerEstado().izquierda, false);
});

test('sincronizarViewportCSS: actualiza variables CSS --vh y --app-height con visualViewport o innerHeight', () => {
  const cssVars = {};
  const mockDoc = {
    documentElement: {
      style: {
        setProperty(k, v) {
          cssVars[k] = v;
        },
      },
    },
  };

  // 1. Con visualViewport (Safari/Chrome móvil moderno)
  const mockVentanaVV = {
    visualViewport: {
      width: 844,
      height: 390,
    },
  };
  const resVV = sincronizarViewportCSS(mockDoc, mockVentanaVV);
  assert.equal(resVV.ancho, 844);
  assert.equal(resVV.alto, 390);
  assert.equal(cssVars['--vh'], '3.9px');
  assert.equal(cssVars['--app-height'], '390px');
  assert.equal(cssVars['--app-width'], '844px');

  // 2. Con innerHeight/innerWidth (respaldo)
  const mockVentanaInner = {
    innerWidth: 390,
    innerHeight: 844,
  };
  const resInner = sincronizarViewportCSS(mockDoc, mockVentanaInner);
  assert.equal(resInner.ancho, 390);
  assert.equal(resInner.alto, 844);
  assert.equal(cssVars['--vh'], '8.44px');
  assert.equal(cssVars['--app-height'], '844px');
});

test('actualizarAvisoOrientacion: muestra aviso discreto en vertical y lo oculta en horizontal', () => {
  let avisoOculto = true;
  const mockAviso = {
    set hidden(val) {
      avisoOculto = Boolean(val);
    },
    get hidden() {
      return avisoOculto;
    },
    removeAttribute(attr) {
      if (attr === 'hidden') avisoOculto = false;
    },
    setAttribute(attr) {
      if (attr === 'hidden') avisoOculto = true;
    },
  };

  const mockDoc = {
    getElementById(id) {
      return id === 'aviso-orientacion' ? mockAviso : null;
    },
  };

  // Pantalla vertical (alto > ancho) => mostrar aviso
  actualizarAvisoOrientacion(mockDoc, 390, 844);
  assert.equal(mockAviso.hidden, false, 'En vertical debe sugerir girar mostrando el aviso');

  // Pantalla horizontal (ancho > alto) => ocultar aviso
  actualizarAvisoOrientacion(mockDoc, 844, 390);
  assert.equal(mockAviso.hidden, true, 'En horizontal debe ocultar el aviso');

  // Pantalla cuadrada o de escritorio (ancho >= alto) => ocultar aviso
  actualizarAvisoOrientacion(mockDoc, 1366, 768);
  assert.equal(mockAviso.hidden, true);
});
