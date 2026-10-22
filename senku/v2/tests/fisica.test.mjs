import test from 'node:test';
import assert from 'node:assert/strict';
import {
  crearCuerpo,
  actualizarCuerpo,
  solapanAABB,
  GRAVEDAD_DEFECTO,
  FUERZA_SALTO_DEFECTO,
} from '../src/core/fisica.mjs';
import {
  mapearCodigoTecla,
  crearEstadoEntrada,
  crearManejadorEntrada,
  ACCIONES,
} from '../src/core/entrada.mjs';

test('crearCuerpo inicializa con valores por defecto y personalizados', () => {
  const porDefecto = crearCuerpo();
  assert.equal(porDefecto.x, 0);
  assert.equal(porDefecto.y, 0);
  assert.equal(porDefecto.w, 48);
  assert.equal(porDefecto.h, 36);
  assert.equal(porDefecto.vx, 0);
  assert.equal(porDefecto.vy, 0);
  assert.equal(porDefecto.enSuelo, false);
  assert.equal(porDefecto.mirando, 1);

  const custom = crearCuerpo({ x: 100, y: 200, w: 50, h: 40, mirando: -1 });
  assert.equal(custom.x, 100);
  assert.equal(custom.y, 200);
  assert.equal(custom.mirando, -1);
});

test('solapanAABB detecta colisiones rectangulares correctamente', () => {
  const r1 = { x: 0, y: 0, w: 100, h: 100 };
  const r2 = { x: 50, y: 50, w: 100, h: 100 };
  const r3 = { x: 150, y: 150, w: 50, h: 50 };

  assert.equal(solapanAABB(r1, r2), true);
  assert.equal(solapanAABB(r1, r3), false);
});

test('movimiento lateral responde a entrada izquierda y derecha con aceleración', () => {
  const cuerpo = crearCuerpo({ x: 100, y: 500, enSuelo: true });
  const limites = { minX: 0, maxX: 1280 };

  // Mover a la derecha
  actualizarCuerpo(cuerpo, { derecha: true }, [], limites, 0.016);
  assert.ok(cuerpo.vx > 0, 'vx debe acelerar hacia la derecha');
  assert.ok(cuerpo.x > 100, 'x debe haber aumentado');
  assert.equal(cuerpo.mirando, 1);

  // Mover a la izquierda
  const posActual = cuerpo.x;
  for (let i = 0; i < 20; i++) {
    actualizarCuerpo(cuerpo, { izquierda: true }, [], limites, 0.016);
  }
  assert.ok(cuerpo.vx < 0, 'vx debe acelerar hacia la izquierda');
  assert.equal(cuerpo.mirando, -1);

  // Sin entrada: frena progresivamente
  for (let i = 0; i < 60; i++) {
    actualizarCuerpo(cuerpo, {}, [], limites, 0.016);
  }
  assert.equal(cuerpo.vx, 0, 'sin entrada debe detenerse completamente');
});

test('gravedad acelera hacia abajo en caída libre', () => {
  const cuerpo = crearCuerpo({ x: 200, y: 100, vy: 0, enSuelo: false });
  actualizarCuerpo(cuerpo, {}, [], null, 0.016);

  assert.ok(cuerpo.vy > 0, 'la velocidad vertical debe ser positiva (hacia abajo)');
  assert.ok(cuerpo.y > 100, 'la posición y debe haber descendido');
  assert.equal(cuerpo.enSuelo, false);
});

test('salto solo ocurre si el cuerpo está en el suelo', () => {
  // Caso 1: En el suelo -> salta
  const cuerpoEnSuelo = crearCuerpo({ x: 200, y: 500, enSuelo: true });
  actualizarCuerpo(cuerpoEnSuelo, { salto: true }, [], null, 0.016);
  assert.ok(cuerpoEnSuelo.vy < 0, 'debe tener impulso negativo de salto');
  assert.equal(cuerpoEnSuelo.enSuelo, false, 'al saltar ya no está en el suelo');

  // Caso 2: En el aire -> no puede hacer doble salto
  const cuerpoEnAire = crearCuerpo({ x: 200, y: 300, vy: 100, enSuelo: false });
  const vyAntes = cuerpoEnAire.vy;
  actualizarCuerpo(cuerpoEnAire, { salto: true }, [], null, 0.016);
  assert.ok(cuerpoEnAire.vy > vyAntes, 'la gravedad debe continuar actuando, el salto en el aire no aplica');
});

test('colisión con suelo evita atravesarlo y apoya al cuerpo', () => {
  const suelo = [{ id: 'suelo', x: 0, y: 600, w: 1000, h: 50 }];
  // Posición inicial: pies en y=580 (cuerpo h=36, y=544), cayendo hacia el suelo
  const cuerpo = crearCuerpo({ x: 100, y: 580, w: 48, h: 36, vy: 500, enSuelo: false });

  actualizarCuerpo(cuerpo, {}, suelo, null, 0.05);

  assert.equal(cuerpo.enSuelo, true, 'debe marcarse como apoyado en suelo');
  assert.equal(cuerpo.vy, 0, 'la velocidad vertical debe anularse al aterrizar');
  assert.equal(cuerpo.y + cuerpo.h, 600, 'la base del cuerpo debe coincidir exactamente con el tope de la plataforma');
});

test('plataformas permiten atravesar desde abajo durante el ascenso (semi-sólidas)', () => {
  const repisa = [{ id: 'repisa', x: 200, y: 400, w: 200, h: 20 }];
  // Cuerpo subiendo con velocidad negativa desde y=410 (pies en 446)
  const cuerpo = crearCuerpo({ x: 250, y: 410, w: 48, h: 36, vy: -400, enSuelo: false });

  actualizarCuerpo(cuerpo, {}, repisa, null, 0.016);

  assert.ok(cuerpo.vy < 0, 'continúa subiendo sin chocar la cabeza con la plataforma');
  assert.equal(cuerpo.enSuelo, false);
});

test('límites de escena impiden cruzar bordes izquierdo y derecho', () => {
  const limites = { minX: 0, maxX: 1280 };
  const cuerpo = crearCuerpo({ x: 5, y: 500, w: 48, h: 36, vx: -500 });

  // Intento de cruzar el borde izquierdo
  actualizarCuerpo(cuerpo, { izquierda: true }, [], limites, 0.05);
  assert.equal(cuerpo.x, 0, 'no debe sobrepasar minX');
  assert.equal(cuerpo.vx, 0, 'vx debe detenerse en el borde');

  // Intento de cruzar el borde derecho
  cuerpo.x = 1270;
  cuerpo.vx = 500;
  actualizarCuerpo(cuerpo, { derecha: true }, [], limites, 0.05);
  assert.equal(cuerpo.x, 1280 - cuerpo.w, 'no debe sobrepasar maxX');
  assert.equal(cuerpo.vx, 0, 'vx debe detenerse en el borde');
});

test('entrada: mapearCodigoTecla reconoce flechas, WASD y espacio', () => {
  assert.equal(mapearCodigoTecla('ArrowLeft'), ACCIONES.IZQUIERDA);
  assert.equal(mapearCodigoTecla('KeyA'), ACCIONES.IZQUIERDA);
  assert.equal(mapearCodigoTecla('ArrowRight'), ACCIONES.DERECHA);
  assert.equal(mapearCodigoTecla('KeyD'), ACCIONES.DERECHA);
  assert.equal(mapearCodigoTecla('Space'), ACCIONES.SALTO);
  assert.equal(mapearCodigoTecla('ArrowUp'), ACCIONES.SALTO);
  assert.equal(mapearCodigoTecla('KeyW'), ACCIONES.SALTO);
  assert.equal(mapearCodigoTecla('KeyQ'), null);
});

test('entrada: crearManejadorEntrada procesa eventos simulados de teclado y táctil', () => {
  // Simular objeto ventana con EventTarget mínimo
  const escuchadores = {};
  const mockVentana = {
    addEventListener: (tipo, fn) => {
      escuchadores[tipo] = escuchadores[tipo] || [];
      escuchadores[tipo].push(fn);
    },
    removeEventListener: (tipo, fn) => {
      escuchadores[tipo] = (escuchadores[tipo] || []).filter((f) => f !== fn);
    },
    emitir: (tipo, evento) => {
      (escuchadores[tipo] || []).forEach((fn) => fn(evento));
    },
  };

  const mockBotonSalto = {
    escuchadores: {},
    addEventListener(tipo, fn) {
      this.escuchadores[tipo] = this.escuchadores[tipo] || [];
      this.escuchadores[tipo].push(fn);
    },
    removeEventListener(tipo, fn) {
      this.escuchadores[tipo] = (this.escuchadores[tipo] || []).filter((f) => f !== fn);
    },
    emitir(tipo) {
      (this.escuchadores[tipo] || []).forEach((fn) => fn({ preventDefault: () => {} }));
    },
  };

  const entrada = crearManejadorEntrada({
    ventana: mockVentana,
    elementosBotones: { salto: mockBotonSalto },
  });

  // Estado inicial
  assert.deepEqual(entrada.obtenerEstado(), {
    izquierda: false,
    derecha: false,
    salto: false,
  });

  // Presionar KeyA (izquierda)
  mockVentana.emitir('keydown', { code: 'KeyA', preventDefault: () => {} });
  assert.equal(entrada.obtenerEstado().izquierda, true);

  // Presionar también ArrowLeft (redundante)
  mockVentana.emitir('keydown', { code: 'ArrowLeft', preventDefault: () => {} });
  assert.equal(entrada.obtenerEstado().izquierda, true);

  // Soltar KeyA: sigue activo porque ArrowLeft sigue presionado
  mockVentana.emitir('keyup', { code: 'KeyA' });
  assert.equal(entrada.obtenerEstado().izquierda, true);

  // Soltar ArrowLeft: ahora sí se apaga
  mockVentana.emitir('keyup', { code: 'ArrowLeft' });
  assert.equal(entrada.obtenerEstado().izquierda, false);

  // Botón táctil de salto (pointerdown)
  mockBotonSalto.emitir('pointerdown');
  assert.equal(entrada.obtenerEstado().salto, true);

  // Botón táctil de salto (pointerup)
  mockBotonSalto.emitir('pointerup');
  assert.equal(entrada.obtenerEstado().salto, false);

  // Destruir limpia escuchadores
  entrada.destruir();
  assert.equal(escuchadores.keydown.length, 0);
  assert.equal(escuchadores.keyup.length, 0);
});

