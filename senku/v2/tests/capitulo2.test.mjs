import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { escenaAntigua, escenaChichicastenango, escenaSelva, escenaTikal, escenasGuatemala } from '../src/data/escenas/guatemala.mjs';
import { crearRegistroEscenas, validarEscena } from '../src/core/escenas.mjs';
import { crearEnemigo, daniarEnemigo } from '../src/core/enemigos.mjs';
import { arrancarSenku2 } from '../src/main.mjs';
import { estadoNuevo, guardar, cargar } from '../src/core/store.mjs';
import { golpearJefe } from '../src/core/jefe_gato.mjs';
import { golpearBalam } from '../src/core/jefe_balam.mjs';
import { mostrarFinal } from '../src/ui/final.mjs';
import { renderizarEscena } from '../src/render/canvas.mjs';
import { resumenCapitulo } from '../src/core/resumen.mjs';
import { escenaCima } from '../src/data/escenas/cima.mjs';
import { memoria } from './ayuda.mjs';

test('Guatemala: cuatro escenas válidas, conectadas y con dos fondos pintados cada una', () => {
  const registro = crearRegistroEscenas();
  for (const escena of escenasGuatemala) {
    const resultado = validarEscena(escena);
    assert.equal(resultado.valida, true, escena.id);
    registro.registrar(escena);
    assert.equal(escena.arte.tramos.length, 2, escena.id);
    assert.deepEqual(escena.arte.tramos.map(({ x, w }) => [x, w]), [[0, 1280], [1280, 1280]]);
    for (const tramo of escena.arte.tramos) {
      const ruta = new URL(`../${tramo.ruta}`, import.meta.url);
      assert.ok(statSync(ruta).size < 400_000, tramo.ruta);
    }
    assert.equal(escena.fondo.plataformasVisibles, true);
    assert.ok(escena.objetos.some((o) => o.tipo === 'botiquin'));
    assert.ok(escena.objetos.some((o) => o.tipo === 'churu'));
  }
  assert.equal(escenaAntigua.disparadores.find((d) => d.accion === 'pasar').destino, 'guatemala-chichicastenango');
  const bonusTukTuk = escenaAntigua.disparadores.find((d) => d.id === 'tuk-tuk-antigua');
  assert.equal(bonusTukTuk.rutaBonus, './bonus-tuk-tuk.html');
  assert.equal(bonusTukTuk.destino, 'guatemala-chichicastenango');
  assert.deepEqual(escenaChichicastenango.disparadores.map((d) => d.destino), ['guatemala-selva']);
  assert.deepEqual(escenaSelva.disparadores.map((d) => d.destino), ['guatemala-tikal']);
  assert.equal(escenaTikal.disparadores.length, 0, 'Tikal termina en la arena reservada para el jefe del diseño');
  for (const escena of escenasGuatemala.slice(0, -1)) {
    assert.ok(registro.tiene(escena.disparadores[0].destino));
  }
});

test('enemigos guatemaltecos conservan escala de 1, 2 y 3 golpes del capítulo 1', () => {
  const esperados = [['tucan_ladron', 1, 10], ['coati', 2, 15], ['mono_aullador', 3, 20]];
  for (const [tipo, golpes, dano] of esperados) {
    const enemigo = crearEnemigo({ tipo, hp: null, dano: null });
    assert.equal(enemigo.hp, golpes, tipo);
    assert.equal(enemigo.hpMax, golpes, tipo);
    assert.equal(enemigo.dano, dano, tipo);
    for (let golpe = 1; golpe < golpes; golpe += 1) {
      assert.equal(daniarEnemigo(enemigo, 1).derrotado, false, `${tipo}: golpe ${golpe}`);
    }
    assert.equal(daniarEnemigo(enemigo, 1).derrotado, true, tipo);
  }
});

test('arte Guatemala conserva formato de sprites y hoja de Balam', () => {
  const png = (ruta, ancho, alto) => {
    const bytes = readFileSync(new URL(`../assets/${ruta}`, import.meta.url));
    assert.equal(bytes.toString('ascii', 1, 4), 'PNG');
    assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], [ancho, alto], ruta);
  };
  for (const nombre of ['tucan_ladron', 'coati', 'mono_aullador']) png(`enemigos/${nombre}.png`, 384, 192);
  png('jefe/balam.png', 880, 510);
  png('objetos/fragmento_jade.png', 128, 96);
  assert.ok(statSync(new URL('../assets/bonus/tuk-tuk-antigua.webp', import.meta.url)).size < 400_000);
});

test('escenas pintadas Guatemala muestran plataformas y conservan el suelo del arte', () => {
  const escena = escenaAntigua;
  const dibujadas = [];
  const rectangulos = [];
  const pedidas = [];
  const imagen = { width: 1280, height: 720 };
  const catalogoArte = { obtener: (ruta) => { pedidas.push(ruta); return ruta.endsWith('.webp') ? imagen : null; }, cache: new Map() };
  const ctx = new Proxy({}, { get: (_, prop) => (...args) => {
    if (prop === 'drawImage') dibujadas.push(args);
    if (prop === 'fillRect') rectangulos.push(args);
  }, set: () => true });
  renderizarEscena({ ctx, escena, catalogoArte, debug: false });
  assert.ok(dibujadas.some(([img, x, y, w, h]) => img === imagen && x === 0 && y === 0 && w === 1280 && h === 720));
  assert.ok(pedidas.includes(escena.arte.tramos[1].ruta), 'se precarga el siguiente tramo');
  assert.ok(rectangulos.some(([x, y, w, h]) => x === 360 && y === 510 && w === 150 && h > 18));
  assert.ok(!rectangulos.some(([x, y, w]) => x === 0 && y === 600 && w === 2560), 'el suelo pintado no se cubre');
});

test('el arte pintado de México no duplica plataformas de sus ilustraciones', () => {
  const rectangulos = [];
  const imagen = { width: 1280, height: 720 };
  const catalogoArte = { obtener: (ruta) => ruta.endsWith('.webp') ? imagen : null, cache: new Map() };
  const ctx = new Proxy({}, { get: (_, prop) => (...args) => { if (prop === 'fillRect') rectangulos.push(args); }, set: () => true });
  renderizarEscena({ ctx, escena: escenaCima, catalogoArte, debug: false });
  assert.ok(!rectangulos.some(([x, y, w, h]) => x === 513 && y === 490 && w === 257 && h === 110));
});

test('el resumen de México excluye derrotas y secretos de Guatemala', () => {
  const resumen = resumenCapitulo({ churus: 20, coleccionados: [
    'cima:derrotado:jefe', 'guatemala-selva:derrotado:mono-1', 'selva-churu-secreto',
  ] }, [escenaCima]);
  assert.equal(resumen.enemigos, 1);
  assert.equal(resumen.secretosTotales, 0);
  assert.equal(resumen.secretosEncontrados, 0);
});

function boton() {
  const oyentes = {};
  return { oyentes, hidden: true, style: {}, setAttribute() {}, remove() {}, before() {},
    addEventListener(tipo, fn) { (oyentes[tipo] ||= []).push(fn); },
    removeEventListener() {}, focus() {}, textContent: '' };
}

test('tras derrotar al Gato Mecánico, continuar a Guatemala guarda progreso sin limpiar México', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), progreso: { escena: 'cima' }, churus: 17,
    coleccionados: ['llave-camioneta', 'desierto-churu-6'] });
  const oyentes = {};
  const temporizadores = [];
  const capas = [];
  const nodos = { 'lienzo-juego': { ...boton(), getContext: () => null },
    'btn-subir': boton(), 'aviso-viaje': boton() };
  const documento = {
    body: { appendChild() {} }, getElementById: (id) => nodos[id] || null, querySelector: () => null,
    createElement() {
      const botones = { '#final-guatemala': boton(), '#final-seguir': boton(), '#final-volver': boton() };
      const capa = { ...boton(), querySelector: (selector) => botones[selector] || null, botones };
      capas.push(capa);
      return capa;
    },
  };
  const ventana = { localStorage: almacen, location: { href: '', search: '' },
    addEventListener(tipo, fn) { (oyentes[tipo] ||= []).push(fn); }, removeEventListener() {},
    requestAnimationFrame: () => 1, cancelAnimationFrame() {},
    setTimeout(fn) { temporizadores.push(fn); return temporizadores.length; }, clearTimeout() {},
    setInterval: () => 1, clearInterval() {} };
  const juego = arrancarSenku2({ documento, ventana });
  juego.senku.x = 1500;
  juego.avanzarPaso(1 / 60);
  juego.jefe.hp = 1;
  golpearJefe(juego.jefe, 1);
  juego.avanzarPaso(1 / 60);
  temporizadores[0]();
  capas.at(-1).botones['#final-guatemala'].oyentes.click[0]();

  assert.equal(juego.escena.id, 'guatemala-antigua');
  const estado = cargar(almacen).estado;
  assert.equal(estado.progreso.escena, 'guatemala-antigua');
  assert.equal(estado.churus, 17);
  assert.ok(estado.coleccionados.includes('jefe-gato-mecanico'));
  assert.ok(estado.coleccionados.includes('llave-camioneta'));
  Object.assign(juego.senku, { x: 2240, y: 500, vy: 0 });
  juego.avanzarPaso(1 / 60);
  assert.equal(nodos['btn-subir'].hidden, false);
  assert.equal(juego.intentarSubir(), true);
  juego.avanzarPaso(2.5);
  assert.match(juego.avisoViaje(), /sube al tuk-tuk/i);
  juego.avanzarPaso(3);
  assert.equal(ventana.location.href, './bonus-tuk-tuk.html');
  juego.detener();
});

test('el final de Guatemala ofrece repetir el capítulo y llama al reinicio', () => {
  let final;
  const botones = { '#final-seguir': boton(), '#final-volver': boton() };
  const capa = { style: {}, setAttribute() {}, querySelector: (selector) => botones[selector], remove() {} };
  const documento = { body: { appendChild: (nodo) => { final = nodo; } },
    getElementById: () => null, createElement: () => capa };
  let repeticiones = 0;
  mostrarFinal(documento, {}, { churus: 8, enemigos: 2, secretosEncontrados: 1, secretosTotales: 3 }, {
    capitulo: 'CAPÍTULO 2 · GUATEMALA', titulo: '¡Balam descansa!',
    etiquetaVolver: 'Volver a jugar Guatemala', alVolverAJugar: () => { repeticiones++; },
  });
  assert.match(final.innerHTML, /CAPÍTULO 2 · GUATEMALA/);
  assert.match(final.innerHTML, /Volver a jugar Guatemala/);
  botones['#final-volver'].oyentes.click[0]();
  assert.equal(repeticiones, 1);
});

test('victoria de Balam se guarda y repetir Guatemala limpia solo su avance', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), progreso: { escena: 'guatemala-tikal' }, churus: 42,
    coleccionados: ['jefe-gato-mecanico', 'antigua-churu-1', 'guatemala-antigua:derrotado:antigua-coati-1'] });
  const temporizadores = [], capas = [];
  const nodos = { 'lienzo-juego': { ...boton(), getContext: () => null }, 'btn-subir': boton(), 'aviso-viaje': boton() };
  const documento = {
    body: { appendChild() {} }, getElementById: (id) => nodos[id] || null, querySelector: () => null,
    createElement() {
      const botones = { '#final-guatemala': boton(), '#final-seguir': boton(), '#final-volver': boton() };
      const capa = { ...boton(), querySelector: (selector) => botones[selector] || null, botones };
      capas.push(capa); return capa;
    },
  };
  const ventana = { localStorage: almacen, location: { href: '', search: '' },
    addEventListener() {}, removeEventListener() {}, requestAnimationFrame: () => 1, cancelAnimationFrame() {},
    setTimeout(fn) { temporizadores.push(fn); return temporizadores.length; }, clearTimeout() {},
    setInterval: () => 1, clearInterval() {} };
  const juego = arrancarSenku2({ documento, ventana });
  juego.senku.x = 1400;
  juego.avanzarPaso(1 / 60);
  assert.ok(juego.jefeBalam);
  juego.jefeBalam.hp = 1;
  assert.equal(golpearBalam(juego.jefeBalam), true);
  juego.avanzarPaso(1 / 60);
  temporizadores.at(-1)();
  capas.at(-1).botones['#final-volver'].oyentes.click[0]();

  const partida = cargar(almacen).estado;
  assert.equal(juego.escena.id, 'guatemala-antigua');
  assert.equal(partida.progreso.escena, 'guatemala-antigua');
  assert.equal(partida.churus, 42);
  assert.ok(partida.coleccionados.includes('jefe-gato-mecanico'));
  assert.ok(!partida.coleccionados.includes('jefe-balam-tikal'));
  assert.ok(!partida.coleccionados.includes('guatemala-antigua:derrotado:antigua-coati-1'));
  assert.ok(!partida.coleccionados.includes('antigua-churu-1'));
  juego.detener();
});
