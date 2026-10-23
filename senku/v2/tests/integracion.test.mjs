// Pruebas unitarias de integración del menú, economía y trajes activos en Senku 2.
// Verifica la lógica pura: modelos, economía tolerante a precios en null, cambio de traje activo y persistencia.

import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGO_MENU, stubEconomia, arrancarSenku2 } from '../src/main.mjs';
import { crearModelo, accionarTarjeta, mensajeError } from '../src/ui/menu_modelo.mjs';
import {
  ID_ORIGINAL,
  ID_RATA,
  ID_SECRETO_LEGACY,
  obtenerTrajeActivo,
  tieneTraje,
  equiparTraje,
} from '../src/core/trajes_activo.mjs';
import { estadoNuevo, guardar, cargar } from '../src/core/store.mjs';

function crearAlmacenEnMemoria() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  };
}

test('CATALOGO_MENU: incluye Senku Original y Senku Rata con precios pendientes en null', () => {
  assert.ok(Array.isArray(CATALOGO_MENU), 'CATALOGO_MENU debe ser un arreglo');
  const original = CATALOGO_MENU.find((t) => t.id === ID_ORIGINAL);
  const rata = CATALOGO_MENU.find((t) => t.id === ID_RATA);

  assert.ok(original, 'Debe incluir traje original');
  assert.equal(original.precio, null, 'Senku Original no inventa precio (null)');

  assert.ok(rata, 'Debe incluir traje de rata');
  assert.equal(rata.precio, null, 'Regla: valor creativo pendiente D2 va como null');
  assert.ok(rata.equivaleA?.includes(ID_SECRETO_LEGACY), 'Rata debe equivaler a secreto_legacy');
});

test('stubEconomia.equipar: equipa trajes poseídos y respeta equivalencias de Legacy', () => {
  const estadoBase = estadoNuevo(); // trajes: ['original'], equipado: 'original'

  // Original ya poseído
  const resOriginal = stubEconomia.equipar(estadoBase, ID_ORIGINAL);
  assert.equal(resOriginal.equipado, ID_ORIGINAL);

  // Intentar equipar rata bloqueada falla
  const resRataBloqueada = stubEconomia.equipar(estadoBase, ID_RATA);
  assert.equal(resRataBloqueada.error, 'traje_no_poseido');

  // Con secreto_legacy en trajes: equipar rata tiene éxito
  const estadoConSecreto = {
    ...estadoBase,
    trajes: ['original', ID_SECRETO_LEGACY],
  };
  const resRata = stubEconomia.equipar(estadoConSecreto, ID_RATA);
  assert.ok(resRata && !resRata.error, 'Debe equipar rata con éxito');
  assert.ok(
    resRata.equipado === ID_RATA || resRata.equipado === ID_SECRETO_LEGACY,
    'El traje equipado debe ser rata o su id equivalente'
  );

  // El traje activo en el motor de juego ahora es Senku Rata
  const activo = obtenerTrajeActivo(resRata);
  assert.equal(activo.id, ID_RATA);
  assert.equal(activo.etiqueta, 'Senku Rata');
});

test('stubEconomia.comprarTraje: precios en null rechazan compra con precio_no_definido', () => {
  const estado = { ...estadoNuevo(), churus: 500 };

  const res = stubEconomia.comprarTraje(estado, ID_RATA, CATALOGO_MENU);
  assert.deepEqual(res, { error: 'precio_no_definido' });

  const resDesconocido = stubEconomia.comprarTraje(estado, 'inexistente', CATALOGO_MENU);
  assert.deepEqual(resDesconocido, { error: 'traje_desconocido' });
});

test('stubEconomia.comprarTraje: soporta ítems con precio numérico y valida saldo', () => {
  const catalogoConPrecio = [
    ...CATALOGO_MENU,
    { id: 'prueba_item', nombre: 'Prueba', precio: 50 },
  ];

  const estadoPobre = { ...estadoNuevo(), churus: 20 };
  const resPobre = stubEconomia.comprarTraje(estadoPobre, 'prueba_item', catalogoConPrecio);
  assert.deepEqual(resPobre, { error: 'saldo_insuficiente' });

  const estadoRico = { ...estadoNuevo(), churus: 80 };
  const resRico = stubEconomia.comprarTraje(estadoRico, 'prueba_item', catalogoConPrecio);
  assert.equal(resRico.churus, 30);
  assert.ok(resRico.trajes.includes('prueba_item'));
});

test('flujo menú completo: partida nueva muestra Rata como Próximamente sin compra', () => {
  const estadoInicial = estadoNuevo(); // churus: 0, trajes: ['original'], equipado: 'original'

  const tarjetas = crearModelo(estadoInicial, CATALOGO_MENU);
  assert.equal(tarjetas.length, 2);

  const tOriginal = tarjetas.find((t) => t.id === ID_ORIGINAL);
  assert.equal(tOriginal.estado, 'equipado');
  assert.equal(tOriginal.etiqueta, 'Equipado');
  assert.equal(tOriginal.deshabilitado, true);

  const tRata = tarjetas.find((t) => t.id === ID_RATA);
  assert.equal(tRata.estado, 'bloqueado');
  assert.equal(tRata.etiqueta, 'Próximamente');
  assert.equal(tRata.accion, null, 'No debe permitir compra si el precio es null');
  assert.equal(tRata.deshabilitado, true);

  // Si se intenta accionar directamente la tarjeta bloqueada
  const resAccion = accionarTarjeta(estadoInicial, CATALOGO_MENU, ID_RATA, stubEconomia);
  assert.equal(resAccion.error, 'precio_no_definido');
  assert.equal(resAccion.mensaje, mensajeError('precio_no_definido'));
});

test('flujo menú completo: partida con secreto Legacy permite equipar y alternar trajes', () => {
  const estadoConRata = {
    ...estadoNuevo(),
    churus: 15,
    trajes: ['original', ID_SECRETO_LEGACY],
    equipado: 'original',
  };

  // 1. Modelo inicial: Rata está desbloqueada y lista para equipar
  const tarjetas1 = crearModelo(estadoConRata, CATALOGO_MENU);
  const tRata1 = tarjetas1.find((t) => t.id === ID_RATA);
  assert.equal(tRata1.estado, 'desbloqueado');
  assert.equal(tRata1.etiqueta, 'Equipar');
  assert.equal(tRata1.accion, 'equipar');
  assert.equal(tRata1.deshabilitado, false);

  // 2. Accionar tarjeta para equipar Senku Rata
  const resEquiparRata = accionarTarjeta(estadoConRata, CATALOGO_MENU, ID_RATA, stubEconomia);
  assert.ok(!resEquiparRata.error, 'Acción equipar debe tener éxito');
  const estadoConRataEquipada = resEquiparRata.estado;

  // 3. Verificar que traje activo se actualiza en el modelo y en el motor
  const activoRata = obtenerTrajeActivo(estadoConRataEquipada);
  assert.equal(activoRata.id, ID_RATA);
  assert.equal(activoRata.color, '#7f8c8d'); // Gris rata

  // 4. Nuevo modelo con Rata equipada: Rata ahora es 'equipado' y Original es 'desbloqueado'
  const tarjetas2 = crearModelo(estadoConRataEquipada, CATALOGO_MENU);
  const tRata2 = tarjetas2.find((t) => t.id === ID_RATA);
  const tOriginal2 = tarjetas2.find((t) => t.id === ID_ORIGINAL);

  assert.equal(tRata2.estado, 'equipado');
  assert.equal(tRata2.deshabilitado, true);

  assert.equal(tOriginal2.estado, 'desbloqueado');
  assert.equal(tOriginal2.etiqueta, 'Equipar');
  assert.equal(tOriginal2.accion, 'equipar');

  // 5. Volver a equipar Original desde el menú
  const resEquiparOriginal = accionarTarjeta(estadoConRataEquipada, CATALOGO_MENU, ID_ORIGINAL, stubEconomia);
  assert.ok(!resEquiparOriginal.error);
  const estadoRestaurado = resEquiparOriginal.estado;

  const activoOriginal = obtenerTrajeActivo(estadoRestaurado);
  assert.equal(activoOriginal.id, ID_ORIGINAL);
  assert.equal(activoOriginal.color, '#e67e22'); // Naranja cálido
});

test('persistencia y store: los estados tras cambio de traje en menú son válidos y estables', () => {
  const almacen = crearAlmacenEnMemoria();
  const estadoPartida = {
    ...estadoNuevo(),
    churus: 45,
    trajes: ['original', ID_SECRETO_LEGACY],
    equipado: ID_ORIGINAL,
  };

  const guardadoInicialOk = guardar(almacen, estadoPartida);
  assert.equal(guardadoInicialOk, true);

  // Equipar rata usando economía
  const res = stubEconomia.equipar(estadoPartida, ID_RATA);
  assert.ok(!res.error);

  const guardadoOk = guardar(almacen, res);
  assert.equal(guardadoOk, true);

  const cargado = cargar(almacen);
  assert.ok(cargado.estado, 'Debe cargar el estado guardado');
  assert.equal(cargado.estado.equipado, ID_SECRETO_LEGACY);
  assert.ok(tieneTraje(cargado.estado, ID_RATA));
});

test('arrancarSenku2 sin entorno DOM devuelve fallo limpio sin lanzar excepciones', () => {
  const res = arrancarSenku2({ documento: null, ventana: null });
  assert.equal(res.iniciado, false);
  assert.equal(res.motivo, 'sin_entorno_dom');
});

test('arrancarSenku2 con DOM simulado: inicializa con 100 HP, HUD de vida y reinicio de escena', () => {
  const elementos = {
    'saldo-churus': { textContent: '0' },
    'texto-vida': { textContent: '' },
    'barra-vida-relleno': { style: { width: '', background: '' } },
    'lienzo-juego': {
      getContext: () => ({
        fillRect: () => {},
        strokeRect: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        ellipse: () => {},
        fill: () => {},
        fillText: () => {},
        measureText: () => ({ width: 40 }),
      }),
      parentElement: { clientWidth: 1280, clientHeight: 720 },
      style: {},
    },
  };

  const doc = {
    getElementById: (id) => elementos[id] || null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ setAttribute: () => {}, style: {}, addEventListener: () => {} }),
    body: { clientWidth: 1280, clientHeight: 720 },
  };

  const win = {
    addEventListener: () => {},
    removeEventListener: () => {},
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: () => {},
    localStorage: crearAlmacenEnMemoria(),
    location: { search: '' },
    innerWidth: 1280,
    innerHeight: 720,
  };

  const juego = arrancarSenku2({ documento: doc, ventana: win });
  assert.equal(juego.iniciado, true);
  assert.equal(juego.estadoCombate.hpMax, 100);
  assert.equal(juego.estadoCombate.hp, 100);
  assert.equal(elementos['texto-vida'].textContent, '100');
  assert.equal(elementos['barra-vida-relleno'].style.width, '100%');

  // Mover a Senku lejos del punto de entrada y herirlo
  juego.senku.x = 800;
  juego.estadoCombate.hp = 0;
  juego.reiniciarEscena();

  // Reinicio restaura posición de entrada y vida a 100
  assert.equal(juego.senku.x, juego.escena.puntoEntrada.x);
  assert.equal(juego.estadoCombate.hp, 100);
  assert.equal(elementos['texto-vida'].textContent, '100');

  juego.detener();
});
