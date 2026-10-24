import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { arrancarSenku2 } from '../src/main.mjs';
import { crearRegistroEscenas } from '../src/core/escenas.mjs';
import { solapanAABB } from '../src/core/fisica.mjs';
import { cargar, guardar, estadoNuevo } from '../src/core/store.mjs';
import { botiquinDesierto } from '../src/data/botiquines.mjs';
import { escenaTaqueria } from '../src/data/escenas/taqueria.mjs';
import { escenaDesierto } from '../src/data/escenas/desierto.mjs';
import { escenaReja } from '../src/data/escenas/reja.mjs';
import { memoria } from './ayuda.mjs';

function partida(escena, coleccionados = []) {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), progreso: { escena }, coleccionados });
  return almacen;
}

function iniciar(t, almacen = partida('desierto'), ctx = null) {
  let frame;
  const elementos = {
    'lienzo-juego': { getContext: () => ctx, style: {}, setAttribute() {} },
    'nombre-escena': {}, 'btn-subir': {}, 'texto-vida': {},
  };
  const documento = {
    getElementById: (id) => elementos[id] || null,
    querySelector: () => null, body: {},
  };
  const ventana = {
    localStorage: almacen,
    addEventListener() {}, removeEventListener() {}, cancelAnimationFrame() {},
    requestAnimationFrame(fn) { frame = fn; return 1; },
  };
  const juego = arrancarSenku2({ documento, ventana });
  t.after(() => juego.detener());
  return { juego, almacen, elementos, documento, dibujar: () => frame(performance.now()) };
}

function cruzar(juego, direccion, y = 558) {
  const origen = juego.escena.id;
  const limites = juego.escena.limites;
  Object.assign(juego.senku, {
    x: direccion === 'derecha' ? limites.maxX - juego.senku.w - 30 : limites.minX + 30,
    y, vx: 0, vy: 0, enSuelo: false,
  });
  juego.entrada.establecerAccion(direccion, true);
  for (let i = 0; i < 60 && juego.escena.id === origen; i++) juego.avanzarPaso(1 / 60);
  juego.entrada.soltarTodo();
  assert.notEqual(juego.escena.id, origen, `debe cruzar por ${direccion}`);
}

test('registro: reja usa el fondo existente, escala del desierto y un botiquín con ID propio', () => {
  const registro = crearRegistroEscenas();
  for (const escena of [escenaTaqueria, escenaDesierto, escenaReja]) registro.registrar(escena);
  const reja = registro.obtener('reja');
  assert.equal(registro.contar(), 3);
  assert.equal(reja.nombre, 'Reja');
  assert.deepEqual(reja.limites, registro.obtener('desierto').limites);
  assert.equal(reja.plataformas.length, 4);
  assert.deepEqual(reja.enemigos, []);
  assert.equal(reja.recompensaFinal, null);
  assert.equal(reja.fondo.ruta, 'assets/fondos/camioneta_reja.webp');
  assert.ok(existsSync(new URL(`../${reja.fondo.ruta}`, import.meta.url)));
  assert.equal(reja.objetos.length, 1, 'sin recogida de churus implementada, sólo botiquín');
  const [botiquin] = reja.objetos;
  assert.deepEqual(botiquin, { ...botiquinDesierto, id: 'botiquin-reja-1' });
  const idsAnteriores = [...escenaTaqueria.objetos, ...escenaDesierto.objetos].map((o) => o.id);
  assert.ok(!idsAnteriores.includes(botiquin.id));
  assert.ok(reja.plataformas.some((p) => p.y === botiquin.y + botiquin.h
    && p.x <= botiquin.x && p.x + p.w >= botiquin.x + botiquin.w));
  const { RECURSOS_PRECACHE } = createRequire(import.meta.url)('../sw.js');
  for (const recurso of ['src/data/escenas/reja.mjs', 'src/data/botiquines.mjs',
    'src/core/botiquin.mjs', reja.fondo.ruta]) {
    assert.ok(RECURSOS_PRECACHE.includes(`./${recurso}`), `${recurso} en caché offline`);
  }
});

test('camioneta: tras llegar al desierto se camina a la reja y se guarda el destino', (t) => {
  const { juego, almacen, elementos, documento } = iniciar(t, partida('taqueria', ['llave-camioneta']));
  assert.equal(juego.intentarSubir(), true);
  juego.avanzarPaso(5);
  assert.equal(juego.escena.id, 'desierto');
  juego.estadoCombate.hp = 63;
  cruzar(juego, 'derecha');
  assert.equal(juego.escena.id, 'reja');
  assert.equal(juego.estadoCombate.hp, 63, 'cruzar no cura');
  assert.equal(juego.senku.x, escenaReja.puntoEntrada.x);
  assert.equal(juego.enemigos.length, 0);
  assert.equal(elementos['nombre-escena'].textContent, 'Reja');
  assert.equal(elementos['btn-subir'].hidden, true);
  assert.equal(documento.title, 'Senku 2 — Reja');
  assert.equal(juego.avisoViaje(), '', 'pasar no repite el diálogo de la camioneta');
  assert.equal(cargar(almacen).estado.progreso.escena, 'reja');
  juego.avanzarPaso(1 / 60);
  assert.equal(juego.escena.id, 'reja', 'el punto de entrada no activa el regreso');
  assert.equal(iniciar(t, almacen).juego.escena.id, 'reja', 'recarga desde store');
});

test('regreso: reja a desierto por la izquierda conserva salud, derrotas y recogidos', (t) => {
  const derrotado = `desierto:derrotado:${escenaDesierto.enemigos[0].id}`;
  const { juego, almacen } = iniciar(t, partida('reja', [derrotado, botiquinDesierto.id]));
  juego.estadoCombate.hp = 60;
  cruzar(juego, 'izquierda');
  assert.equal(juego.escena.id, 'desierto');
  assert.equal(juego.estadoCombate.hp, 60);
  assert.ok(juego.senku.x > juego.escena.limites.w / 2, 'regresa al lado derecho');
  assert.ok(!juego.escena.disparadores.some((d) => solapanAABB(juego.senku, d)));
  assert.equal(juego.enemigos.find((e) => e.id === escenaDesierto.enemigos[0].id).vivo, false);
  assert.equal(juego.enemigos.filter((e) => e.vivo).length, 1);
  assert.equal(juego.escena.objetos[0].recogido, true);
  assert.equal(cargar(almacen).estado.progreso.escena, 'desierto');
  juego.avanzarPaso(0);
  assert.equal(juego.escena.id, 'desierto', 'no rebota hacia la reja');
  assert.equal(iniciar(t, almacen).juego.escena.id, 'desierto');
  cruzar(juego, 'derecha');
  assert.equal(juego.escena.objetos[0].recogido, false, 'botiquines independientes');
});

test('salidas: pausa impide viajar; los bordes funcionan también durante un salto', (t) => {
  const { juego } = iniciar(t);
  Object.assign(juego.senku, { x: 1226, y: 250 });
  juego.abrirMenu();
  juego.avanzarPaso();
  assert.equal(juego.escena.id, 'desierto');
  juego.cerrarMenu();
  juego.avanzarPaso();
  assert.equal(juego.escena.id, 'reja');
  cruzar(juego, 'izquierda', 250);
  assert.equal(juego.escena.id, 'desierto');
  juego.senku.x = 0;
  juego.avanzarPaso(0);
  assert.equal(juego.escena.id, 'desierto', 'el borde izquierdo del desierto no tiene salida');
});

test('reja explorable: caminar, saltar y aterrizar en la plataforma del botiquín', (t) => {
  const { juego } = iniciar(t, partida('reja'));
  Object.assign(juego.senku, { x: 830, y: 558 });
  juego.avanzarPaso();
  assert.equal(juego.senku.enSuelo, true);
  juego.entrada.establecerAccion('derecha', true);
  juego.entrada.establecerAccion('salto', true);
  for (let i = 0; i < 20; i++) juego.avanzarPaso();
  assert.ok(juego.senku.x > 850, 'camina a la derecha');
  assert.ok(juego.senku.y < 558, 'salta');
  juego.entrada.soltarTodo();
  for (let i = 0; i < 90; i++) juego.avanzarPaso();
  const plataforma = juego.escena.plataformas.find((p) => p.id === 'reja-roca-derecha');
  assert.equal(juego.senku.y + juego.senku.h, plataforma.y);
  assert.equal(juego.senku.enSuelo, true);
  juego.senku.x = 1226;
  juego.avanzarPaso();
  assert.equal(juego.escena.id, 'reja', 'la reja decorativa no abre otro destino');
});

test('botiquín: no consume con vida llena, cura una vez y no reaparece al viajar o recargar', (t) => {
  const { juego, almacen, elementos } = iniciar(t, partida('reja'));
  const botiquin = juego.escena.objetos[0];
  Object.assign(juego.senku, { x: botiquin.x, y: botiquin.y });
  juego.avanzarPaso(0);
  assert.equal(botiquin.recogido, false);
  juego.estadoCombate.hp = 90;
  juego.avanzarPaso(0);
  assert.equal(juego.estadoCombate.hp, 100);
  assert.equal(elementos['texto-vida'].textContent, '100');
  assert.equal(botiquin.recogido, true);
  assert.deepEqual(cargar(almacen).estado.coleccionados, [botiquin.id]);
  juego.estadoCombate.hp = 40;
  juego.avanzarPaso(0);
  assert.equal(juego.estadoCombate.hp, 40);
  cruzar(juego, 'izquierda');
  cruzar(juego, 'derecha');
  assert.equal(juego.escena.objetos[0].recogido, true);
  assert.equal(juego.estadoCombate.hp, 40);
  juego.reiniciarEscena();
  assert.equal(juego.escena.objetos[0].recogido, true);
  assert.equal(iniciar(t, almacen).juego.escena.objetos[0].recogido, true);
  assert.equal(escenaReja.objetos[0].recogido, false, 'no muta los datos de otra partida');
  assert.equal(botiquinDesierto.recogido, false);
});

test('render: cargar una partida en reja y volver a ella dibuja el fondo correcto', (t) => {
  const imagenAnterior = Object.getOwnPropertyDescriptor(globalThis, 'Image');
  globalThis.Image = class {
    set src(ruta) { this.ruta = ruta; this.width = 384; this.height = 192; this.onload(); }
  };
  t.after(() => {
    if (imagenAnterior) Object.defineProperty(globalThis, 'Image', imagenAnterior);
    else delete globalThis.Image;
  });
  const fondos = [];
  const ctx = new Proxy({
    drawImage(imagen, ...args) { if (args.length === 4) fondos.push(imagen.ruta); },
    measureText: () => ({ width: 10 }),
  }, { get: (obj, clave) => obj[clave] ?? (() => {}) });
  const { juego, dibujar } = iniciar(t, partida('reja'), ctx);
  const comprobarFondo = (nombre) => {
    fondos.length = 0;
    dibujar();
    assert.ok(fondos[0].endsWith(`/senku/v2/assets/fondos/${nombre}.webp`));
  };
  comprobarFondo('camioneta_reja');
  cruzar(juego, 'izquierda');
  comprobarFondo('desierto');
  cruzar(juego, 'derecha');
  comprobarFondo('camioneta_reja');
});
