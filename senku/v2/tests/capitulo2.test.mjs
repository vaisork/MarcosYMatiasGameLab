import test from 'node:test';
import assert from 'node:assert/strict';
import { escenaAntigua, escenaChichicastenango, escenaSelva, escenaTikal, escenasGuatemala } from '../src/data/escenas/guatemala.mjs';
import { crearRegistroEscenas, validarEscena } from '../src/core/escenas.mjs';
import { crearEnemigo, daniarEnemigo } from '../src/core/enemigos.mjs';
import { arrancarSenku2 } from '../src/main.mjs';
import { estadoNuevo, guardar, cargar } from '../src/core/store.mjs';
import { golpearJefe } from '../src/core/jefe_gato.mjs';
import { renderizarEscena } from '../src/render/canvas.mjs';
import { resumenCapitulo } from '../src/core/resumen.mjs';
import { escenaCima } from '../src/data/escenas/cima.mjs';
import { memoria } from './ayuda.mjs';

test('Guatemala: cuatro escenas válidas, conectadas y con respaldo de arte provisional', () => {
  const registro = crearRegistroEscenas();
  for (const escena of escenasGuatemala) {
    const resultado = validarEscena(escena);
    assert.equal(resultado.valida, true, escena.id);
    registro.registrar(escena);
    assert.equal(escena.arte, undefined, 'las formas y colores son el respaldo provisional');
    assert.equal(escena.fondo.plataformasVisibles, true);
    assert.ok(escena.objetos.some((o) => o.tipo === 'botiquin'));
    assert.ok(escena.objetos.some((o) => o.tipo === 'churu'));
  }
  assert.deepEqual(escenaAntigua.disparadores.map((d) => d.destino), ['guatemala-chichicastenango']);
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

test('arte provisional dibuja fondos distintos para Antigua, el mercado, la selva y Tikal', () => {
  for (const escena of escenasGuatemala) {
    const llamadas = [];
    const ctx = new Proxy({}, { get: (_, prop) => (...args) => llamadas.push([prop, ...args]), set: () => true });
    renderizarEscena({ ctx, escena, debug: false });
    assert.ok(llamadas.some(([nombre]) => nombre === 'fillRect'), escena.id);
    assert.ok(llamadas.some(([nombre]) => nombre === 'fill'), escena.id);
  }
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
  juego.detener();
});
