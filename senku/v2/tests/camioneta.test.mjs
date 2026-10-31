import test from 'node:test';
import assert from 'node:assert/strict';
import { arrancarSenku2 } from '../src/main.mjs';
import { cargar, guardar, estadoNuevo } from '../src/core/store.mjs';
import { memoria } from './ayuda.mjs';

function iniciar(almacen = memoria(), conNavegacion = false) {
  const eventos = {};
  const elementos = {
    'lienzo-juego': { getContext: () => null, style: {}, setAttribute() {} },
    'btn-subir': { hidden: true }, 'aviso-viaje': { hidden: true, textContent: '' },
  };
  const documento = {
    getElementById: (id) => elementos[id] || null,
    querySelector: () => null, body: {},
  };
  const ventana = {
    localStorage: almacen,
    ...(conNavegacion ? { location: { href: '', search: typeof conNavegacion === 'string' ? conNavegacion : '' } } : {}),
    addEventListener: (tipo, fn) => { (eventos[tipo] ||= []).push(fn); },
    removeEventListener() {}, requestAnimationFrame: () => 1, cancelAnimationFrame() {},
  };
  const juego = arrancarSenku2({ documento, ventana });
  return { juego, almacen, elementos, eventos, ventana };
}
function pisar(juego, enemigo) {
  Object.assign(juego.senku, { x: enemigo.x, y: enemigo.y - juego.senku.h + 3, vy: 100 });
  juego.avanzarPaso(0);
}
function limpiarTaqueria(juego, orden = juego.enemigos) {
  for (const enemigo of [...orden]) pisar(juego, enemigo);
}
function recogerLlave(juego) {
  const llave = juego.escena.objetos.find((o) => o.tipo === 'llave');
  Object.assign(juego.senku, { x: llave.x, y: llave.y, vy: 0 });
  juego.avanzarPaso(0);
}
function acercar(juego) {
  Object.assign(juego.senku, { x: 150, y: 558, vy: 0 });
  juego.avanzarPaso(0);
}

test('sin llave no se puede subir; botón y tecla E muestran la pista', () => {
  const { juego, elementos, eventos } = iniciar();
  acercar(juego);
  assert.equal(elementos['btn-subir'].hidden, false);
  assert.equal(elementos['btn-subir'].onclick(), false);
  for (const fn of eventos.keydown) fn({ code: 'KeyE', key: 'e', preventDefault() {} });
  juego.avanzarPaso(6);
  assert.equal(juego.escena.id, 'taqueria');
  assert.equal(juego.avisoViaje(), 'La camioneta no arranca… ¡busca la llave!');
  juego.detener();
});

test('último enemigo por pisotón suelta una sola llave recogible, en cualquier orden', () => {
  for (const ordenReverso of [false, true]) {
    const { juego } = iniciar();
    const orden = [...juego.enemigos];
    if (ordenReverso) orden.reverse();
    for (const enemigo of orden.slice(0, -1)) pisar(juego, enemigo);
    assert.equal(juego.escena.objetos.some((o) => o.tipo === 'llave'), false);
    pisar(juego, orden.at(-1));
    const llaves = juego.escena.objetos.filter((o) => o.tipo === 'llave');
    assert.equal(llaves.length, 1);
    assert.equal(llaves[0].recogido, undefined);
    assert.equal(juego.estadoJugador().coleccionados.includes('llave-camioneta'), false);
    assert.equal(juego.avisoViaje(), '¡La llave de la camioneta!');
    juego.reiniciarEscena();
    assert.equal(juego.escena.objetos.filter((o) => o.tipo === 'llave').length, 1);
    recogerLlave(juego);
    assert.ok(juego.estadoJugador().coleccionados.includes('llave-camioneta'));
    juego.detener();
  }
});

test('con llave: teclado y táctil arrancan el bonus después de abordar', () => {
  for (const teclado of [false, true]) {
    const { juego, elementos, eventos, ventana } = iniciar(memoria(), true);
    limpiarTaqueria(juego);
    recogerLlave(juego);
    assert.equal(juego.intentarSubir(), false, 'requiere estar junto a camioneta');
    acercar(juego);
    if (teclado) {
      for (const fn of eventos.keydown) fn({ code: 'KeyE', key: 'e', preventDefault() {} });
    } else assert.equal(elementos['btn-subir'].onclick(), true);
    assert.equal(juego.avisoViaje(), '');
    juego.avanzarPaso(1);
    assert.equal(juego.escena.id, 'taqueria');
    juego.avanzarPaso(1);
    assert.match(juego.avisoViaje(), /toma el volante/);
    assert.match(juego.avisoViaje(), /juntar Churus/);
    juego.avanzarPaso(3);
    assert.equal(ventana.location.href, './bonus-camioneta.html');
    assert.equal(juego.escena.id, 'taqueria');
    juego.detener();
  }
});

test('cinemática de la familia se puede saltar con Escape', () => {
  const { juego, eventos } = iniciar(memoria(), '?cinematica=familia');
  for (const fn of eventos.keydown) fn({ code: 'Escape', key: 'Escape', preventDefault() {} });
  assert.equal(juego.escena.id, 'reja');
  assert.equal(juego.estadoJugador().progreso.escena, 'reja');
  assert.ok(juego.enemigos.length >= 20);
  assert.ok(juego.escena.limites.w >= 5 * 1280);
  juego.detener();
});

test('un guardado antiguo en desierto entra por la reja nueva', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), progreso: { escena: 'desierto' } });
  const { juego } = iniciar(almacen);
  assert.equal(juego.escena.id, 'reja');
  assert.equal(cargar(almacen).estado.progreso.escena, 'reja');
  juego.detener();
});

test('persistencia: derrotas parciales, llave pendiente, inventario y escena sobreviven recarga; rata intacta', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), trajes: ['original', 'rata'], equipado: 'rata', churus: 8 });
  let { juego } = iniciar(almacen);
  pisar(juego, juego.enemigos[0]);
  juego.detener();
  ({ juego } = iniciar(almacen));
  assert.equal(juego.enemigos[0].vivo, false);
  limpiarTaqueria(juego, juego.enemigos.filter((e) => e.vivo));
  const saldoTrasRecogidas = juego.estadoJugador().churus;
  juego.detener();
  ({ juego } = iniciar(almacen));
  assert.ok(juego.escena.objetos.some((o) => o.tipo === 'llave'));
  recogerLlave(juego);
  juego.detener();
  ({ juego } = iniciar(almacen));
  assert.equal(juego.escena.objetos.some((o) => o.tipo === 'llave'), false);
  acercar(juego);
  assert.equal(juego.intentarSubir(), true);
  juego.avanzarPaso(5);
  juego.detener();
  ({ juego } = iniciar(almacen));
  assert.equal(juego.escena.id, 'reja');
  assert.ok(cargar(almacen).estado.coleccionados.includes('llave-camioneta'));
  assert.equal(juego.obtenerTrajeActivo().id, 'rata');
  assert.equal(juego.estadoJugador().churus, saldoTrasRecogidas);
  juego.detener();
});
