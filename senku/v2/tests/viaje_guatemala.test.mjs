// Viaje de México a Guatemala en camioneta: parada en la cima (sólo con el Gato vencido),
// cinemática saltable y llegada a Antigua sin perder progreso.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { arrancarSenku2 } from '../src/main.mjs';
import { cargar, guardar, estadoNuevo } from '../src/core/store.mjs';
import { escenaCima, PARADA_GUATEMALA } from '../src/data/escenas/cima.mjs';
import { validarEscena } from '../src/core/escenas.mjs';
import { disparadoresActivos, paradaGuatemala, crearViajeGuatemala, viajeGuatemalaTerminado,
  TIEMPO_EMBARQUE, DURACION_VIAJE_GUATEMALA } from '../src/core/viaje_guatemala.mjs';
import { dibujarCinematicaGuatemala, dibujarParadaGuatemala, distanciaViaje, xLetreroFrontera,
  RUTAS_ARTE_VIAJE_GUATEMALA } from '../src/render/viaje_guatemala.mjs';
import { golpearJefe } from '../src/core/jefe_gato.mjs';
import { memoria } from './ayuda.mjs';

const V2 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VICTORIA = 'jefe-gato-mecanico';

function iniciar(coleccionados = [VICTORIA], almacenPrevio = null) {
  const almacen = almacenPrevio || memoria();
  if (!almacenPrevio) {
    guardar(almacen, { ...estadoNuevo(), progreso: { escena: 'cima' }, churus: 17,
      trajes: ['original', 'rata'], equipado: 'rata', coleccionados });
  }
  const eventos = {};
  const elementos = {
    'lienzo-juego': { getContext: () => null, style: {}, setAttribute() {} },
    'btn-subir': { hidden: true }, 'aviso-viaje': { hidden: true, textContent: '' },
  };
  const documento = { getElementById: (id) => elementos[id] || null, querySelector: () => null, body: {} };
  const ventana = { localStorage: almacen, location: { href: '', search: '' },
    addEventListener: (tipo, fn) => { (eventos[tipo] ||= []).push(fn); },
    removeEventListener() {}, requestAnimationFrame: () => 1, cancelAnimationFrame() {},
    setTimeout: () => 1, clearTimeout() {} };
  const juego = arrancarSenku2({ documento, ventana });
  return { juego, almacen, elementos, eventos, ventana };
}
const tecla = (eventos, code) => { for (const fn of eventos.keydown) fn({ code, key: code, preventDefault() {} }); };
function alaParada(juego) {
  Object.assign(juego.senku, { x: PARADA_GUATEMALA.puertaX - 20, y: 500, vy: 0 });
  juego.avanzarPaso(1 / 60);
}

test('la cima es válida y declara la parada de Guatemala sólo tras la victoria', () => {
  assert.equal(validarEscena(escenaCima).valida, true);
  assert.equal(PARADA_GUATEMALA.requiereVictoria, VICTORIA);
  assert.equal(PARADA_GUATEMALA.destino, 'guatemala-antigua');
  assert.equal(paradaGuatemala(escenaCima, []), null);
  assert.equal(paradaGuatemala(escenaCima, ['otra-cosa']), null);
  assert.equal(paradaGuatemala(escenaCima, [VICTORIA]), PARADA_GUATEMALA);
  assert.equal(disparadoresActivos(escenaCima, []).length, 0);
  // La parada queda en el borde derecho, dentro de la escena.
  assert.ok(PARADA_GUATEMALA.x + PARADA_GUATEMALA.w <= escenaCima.limites.w);
  assert.ok(PARADA_GUATEMALA.dibujo.x + PARADA_GUATEMALA.dibujo.w <= escenaCima.limites.w);
});

test('con el gato sin derrotar no hay parada: ni botón Sube ni cinemática', () => {
  const { juego, elementos, eventos } = iniciar([]);
  alaParada(juego);
  assert.equal(elementos['btn-subir'].hidden, true);
  assert.equal(juego.intentarSubir(), false);
  tecla(eventos, 'KeyE');
  juego.avanzarPaso(10);
  assert.equal(juego.escena.id, 'cima');
  juego.detener();
});

test('con el gato derrotado: aparece Sube, E sube y la cinemática termina en Antigua', () => {
  const { juego, almacen, elementos, eventos } = iniciar();
  assert.equal(elementos['btn-subir'].hidden, true, 'lejos de la parada no hay botón');
  alaParada(juego);
  assert.equal(elementos['btn-subir'].hidden, false);
  assert.match(juego.avisoViaje(), /camioneta a Guatemala/);
  tecla(eventos, 'KeyE');
  assert.equal(elementos['btn-subir'].hidden, true, 'el botón se esconde al subir');
  assert.equal(juego.escena.id, 'cima', 'la cinemática no cambia de escena de inmediato');
  juego.avanzarPaso(TIEMPO_EMBARQUE + 1);
  assert.equal(juego.escena.id, 'cima');
  juego.avanzarPaso(DURACION_VIAJE_GUATEMALA);
  assert.equal(juego.escena.id, 'guatemala-antigua');
  const estado = cargar(almacen).estado;
  assert.equal(estado.progreso.escena, 'guatemala-antigua');
  assert.equal(estado.churus, 17);
  assert.deepEqual(estado.trajes, ['original', 'rata']);
  assert.equal(estado.equipado, 'rata');
  assert.ok(estado.coleccionados.includes(VICTORIA));
  juego.detener();
});

test('el botón táctil Sube dispara la misma cinemática y no se repite mientras viaja', () => {
  const { juego, elementos } = iniciar();
  alaParada(juego);
  assert.equal(elementos['btn-subir'].onclick(), true);
  assert.equal(juego.intentarSubir(), false, 'no se puede subir dos veces');
  juego.avanzarPaso(0.5);
  assert.equal(juego.escena.id, 'cima');
  juego.avanzarPaso(DURACION_VIAJE_GUATEMALA);
  assert.equal(juego.escena.id, 'guatemala-antigua');
  juego.detener();
});

test('Senku camina a la puerta durante el embarque', () => {
  const { juego } = iniciar();
  Object.assign(juego.senku, { x: PARADA_GUATEMALA.puertaX - 120, y: 500, vy: 0 });
  juego.avanzarPaso(1 / 60);
  const antes = juego.senku.x;
  juego.intentarSubir();
  juego.avanzarPaso(0.4);
  assert.ok(juego.senku.x > antes);
  juego.detener();
});

test('la cinemática se salta con Espacio, Enter o Escape y deja a Senku en Antigua', () => {
  for (const code of ['Space', 'Enter', 'Escape']) {
    const { juego, eventos, almacen } = iniciar();
    alaParada(juego);
    tecla(eventos, 'KeyE');
    juego.avanzarPaso(1.5);
    assert.equal(juego.escena.id, 'cima');
    tecla(eventos, code);
    assert.equal(juego.escena.id, 'guatemala-antigua', code);
    assert.equal(cargar(almacen).estado.progreso.escena, 'guatemala-antigua');
    juego.detener();
  }
});

test('Continuar a Guatemala del final usa la cinemática (sin caminata) y llega a Antigua', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), progreso: { escena: 'cima' }, churus: 9, coleccionados: [] });
  const temporizadores = [], capas = [];
  const boton = () => { const oyentes = {};
    return { oyentes, addEventListener(t, f) { (oyentes[t] ||= []).push(f); }, style: {}, setAttribute() {}, remove() {} }; };
  const nodos = { 'lienzo-juego': { ...boton(), getContext: () => null }, 'btn-subir': boton(), 'aviso-viaje': boton() };
  const documento = { body: { appendChild() {} }, getElementById: (id) => nodos[id] || null, querySelector: () => null,
    createElement() {
      const botones = { '#final-guatemala': boton(), '#final-seguir': boton(), '#final-volver': boton() };
      const capa = { ...boton(), querySelector: (sel) => botones[sel] || null, botones };
      capas.push(capa); return capa;
    } };
  const ventana = { localStorage: almacen, location: { href: '', search: '' },
    addEventListener() {}, removeEventListener() {}, requestAnimationFrame: () => 1, cancelAnimationFrame() {},
    setTimeout(fn) { temporizadores.push(fn); return temporizadores.length; }, clearTimeout() {},
    setInterval: () => 1, clearInterval() {} };
  const juego = arrancarSenku2({ documento, ventana });
  juego.senku.x = 1500;
  juego.avanzarPaso(1 / 60);
  juego.jefe.hp = 1;
  golpearJefe(juego.jefe, 1);
  juego.avanzarPaso(1 / 60);
  temporizadores[0]();
  const xAntes = juego.senku.x;
  capas.at(-1).botones['#final-guatemala'].oyentes.click[0]();
  juego.avanzarPaso(1 / 60);
  assert.equal(juego.escena.id, 'cima', 'viaja antes de llegar');
  assert.equal(juego.senku.x, xAntes, 'sin parada no camina');
  juego.avanzarPaso(DURACION_VIAJE_GUATEMALA - TIEMPO_EMBARQUE);
  assert.equal(juego.escena.id, 'guatemala-antigua');
  assert.equal(cargar(almacen).estado.churus, 9);
  juego.detener();
});

test('recargar ya en Guatemala no repite la cinemática; recargar a medio viaje vuelve a la cima', () => {
  const { juego, eventos, almacen } = iniciar();
  alaParada(juego);
  tecla(eventos, 'KeyE');
  juego.avanzarPaso(2);
  juego.detener();
  assert.equal(cargar(almacen).estado.progreso.escena, 'cima', 'nada se guarda hasta llegar');
  let recargado = iniciar(null, almacen).juego;
  assert.equal(recargado.escena.id, 'cima');
  recargado.avanzarPaso(DURACION_VIAJE_GUATEMALA + 1);
  assert.equal(recargado.escena.id, 'cima', 'sin viaje en curso la cima sigue igual');
  recargado.detener();
  guardar(almacen, { ...cargar(almacen).estado, progreso: { escena: 'guatemala-antigua' } });
  recargado = iniciar(null, almacen).juego;
  recargado.avanzarPaso(DURACION_VIAJE_GUATEMALA + 1);
  assert.equal(recargado.escena.id, 'guatemala-antigua');
  recargado.detener();
});

test('duración, tiempo y fin del viaje', () => {
  assert.ok(DURACION_VIAJE_GUATEMALA >= 6 && DURACION_VIAJE_GUATEMALA <= 10);
  const viaje = crearViajeGuatemala(PARADA_GUATEMALA);
  assert.equal(viajeGuatemalaTerminado(viaje), false);
  viaje.tiempo = DURACION_VIAJE_GUATEMALA;
  assert.equal(viajeGuatemalaTerminado(viaje), true);
  assert.equal(viajeGuatemalaTerminado(null), false);
});

test('carretera: avanza, frena hasta parar y el letrero de frontera cruza la pantalla', () => {
  let previa = -1;
  for (let u = 0; u <= DURACION_VIAJE_GUATEMALA; u += 0.1) {
    const d = distanciaViaje(u);
    assert.ok(d >= previa);
    previa = d;
  }
  assert.equal(distanciaViaje(7.4), distanciaViaje(7.9), 'termina detenida');
  assert.ok(xLetreroFrontera(0) > 1280, 'empieza fuera, a la derecha');
  assert.ok(xLetreroFrontera(4.0) > 0 && xLetreroFrontera(4.0) + 560 < 1280, 'se ve completo a mitad de viaje');
  assert.ok(xLetreroFrontera(7.9) + 560 < 0, 'sale por la izquierda antes del final');
});

function ctxFalso(llamadas) {
  const degradado = { addColorStop() {} };
  return new Proxy({}, {
    get: (objetivo, nombre) => {
      if (nombre === 'createLinearGradient') return () => degradado;
      if (nombre === 'measureText') return () => ({ width: 10 });
      if (nombre in objetivo) return objetivo[nombre];
      return (...args) => { llamadas.push([nombre, ...args]); };
    },
    set: (objetivo, nombre, valor) => { objetivo[nombre] = valor; return true; },
  });
}

test('dibujo de la cinemática y de la parada: todas las fases, con y sin arte, sin errores', () => {
  const imagen = { width: 800, height: 409 };
  const catalogos = [null, { obtener: () => imagen }];
  let senkuDibujado = 0;
  for (const catalogo of catalogos) {
    for (let t = 0; t <= DURACION_VIAJE_GUATEMALA + 0.5; t += 0.25) {
      const llamadas = [];
      dibujarCinematicaGuatemala(ctxFalso(llamadas), catalogo, t, { dibujarSenkuVentana: () => { senkuDibujado++; } });
      assert.ok(llamadas.length > 0, `t=${t}`);
    }
    const llamadas = [];
    dibujarParadaGuatemala(ctxFalso(llamadas), catalogo, PARADA_GUATEMALA, 1, true);
    assert.ok(llamadas.some(([n, texto]) => n === 'fillText' && texto === 'Sube'));
    const lejos = [];
    dibujarParadaGuatemala(ctxFalso(lejos), catalogo, PARADA_GUATEMALA, 1, false);
    assert.ok(!lejos.some(([n, texto]) => n === 'fillText' && texto === 'Sube'));
  }
  assert.ok(senkuDibujado > 0, 'Senku se dibuja en la ventana');
  dibujarCinematicaGuatemala(null, null, 3);
  dibujarParadaGuatemala(null, null, PARADA_GUATEMALA);
});

test('la cinemática muestra el letrero «Bienvenidos a Guatemala» y la camioneta «A GUATEMALA»', () => {
  const textos = [];
  const llamadas = [];
  for (let t = TIEMPO_EMBARQUE; t <= DURACION_VIAJE_GUATEMALA; t += 0.25) {
    dibujarCinematicaGuatemala(ctxFalso(llamadas), null, t);
  }
  for (const [n, texto] of llamadas) if (n === 'fillText') textos.push(texto);
  assert.ok(textos.some((x) => /BIENVENIDOS/.test(x)));
  assert.ok(textos.some((x) => /A GUATEMALA/.test(x)));
});

test('arte nuevo: WebP ≤ 300 KB, existe y el service worker lo precachea (v23)', () => {
  const { RECURSOS_PRECACHE, VERSION_CACHE } = createRequire(import.meta.url)(path.join(V2, 'sw.js'));
  assert.equal(VERSION_CACHE, 'senku2-v23');
  for (const ruta of RUTAS_ARTE_VIAJE_GUATEMALA) {
    const archivo = path.join(V2, ruta);
    assert.ok(fs.existsSync(archivo), ruta);
    assert.ok(fs.statSync(archivo).size <= 300 * 1024, `${ruta} pesa demasiado`);
    if (!ruta.startsWith('assets/escenas/')) assert.ok(RECURSOS_PRECACHE.includes(`./${ruta}`), ruta);
  }
  for (const modulo of ['./src/core/viaje_guatemala.mjs', './src/render/viaje_guatemala.mjs']) {
    assert.ok(RECURSOS_PRECACHE.includes(modulo), modulo);
  }
});
