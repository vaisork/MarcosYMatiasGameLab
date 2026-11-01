import test from 'node:test';
import assert from 'node:assert/strict';
import {
  avanzarJuego, avanzarReloj, crearPartida, DURACION, finalizarPartida,
  geometria, ID_PREMIO, TIPOS_OBSTACULO, TOPE_CHURUS, VIDAS_BONUS,
} from '../src/bonus_tuk_tuk.mjs';
import { escenaAntigua } from '../src/data/escenas/guatemala.mjs';
import { cargar, estadoNuevo, guardar } from '../src/core/store.mjs';
import { memoria } from './ayuda.mjs';

test('bonus de Antigua termina a los 30 segundos o al reunir 30 Churus y tiene tres corazones', () => {
  let partida = avanzarReloj(crearPartida(), 3);
  assert.equal(partida.fase, 'jugando');
  assert.equal(partida.restante, DURACION);
  assert.equal(VIDAS_BONUS, 3);
  assert.deepEqual(TIPOS_OBSTACULO, ['maceta', 'cable', 'tucan']);
  partida = avanzarReloj(partida, 30);
  assert.equal(partida.fase, 'fin');
  partida = avanzarReloj({ ...crearPartida(), fase: 'jugando', churus: TOPE_CHURUS }, .01);
  assert.equal(partida.fase, 'fin');
});

test('maceta y cable quitan un corazón; el tucán roba un Churu y huye volando en línea', () => {
  const w = 390, h = 844, g = geometria(w, h, .08);
  const sx = g.xSenku(.5);
  const maceta = { ...crearPartida(), fase: 'jugando', tiempoMundo: .1,
    objetos: [{ tipo: 'maceta', x: sx, altura: 0, recogido: false }] };
  avanzarJuego(maceta, {}, .01, w, h);
  assert.equal(maceta.vidas, 2);

  const cable = { ...crearPartida(), fase: 'jugando', tiempoMundo: .1,
    objetos: [{ tipo: 'cable', x: sx, altura: h * .04, recogido: false }] };
  avanzarJuego(cable, {}, .01, w, h);
  assert.equal(cable.vidas, 2);

  const tucan = { ...crearPartida(), fase: 'jugando', tiempoMundo: .1, churus: 4,
    objetos: [{ tipo: 'tucan', x: sx, altura: 0, fase: 0, golpeado: false }] };
  avanzarJuego(tucan, {}, .01, w, h);
  assert.equal(tucan.vidas, 2);
  assert.equal(tucan.churus, 3);
  const ave = tucan.objetos.find((o) => o.tipo === 'tucan');
  const x = ave.x, altura = ave.altura;
  avanzarJuego(tucan, {}, .1, w, h);
  assert.ok(ave.x < x && ave.altura > altura, 'sale volando hacia arriba y atrás, alejándose del tuk-tuk');
  assert.equal('angulo' in ave, false, 'no entra en un giro persistente');
});

test('premio del tuk-tuk se guarda una sola vez y repetir bonus continúa a Chichicastenango', () => {
  const almacen = memoria();
  guardar(almacen, { ...estadoNuevo(), churus: 12, progreso: { escena: 'guatemala-antigua' } });
  const partida = { ...crearPartida(), fase: 'fin', churus: 20 };
  const primero = finalizarPartida(almacen, partida);
  assert.equal(primero.estado.churus, 32);
  assert.equal(primero.estado.progreso.escena, 'guatemala-chichicastenango');
  assert.ok(primero.estado.coleccionados.includes(ID_PREMIO));
  const repetido = finalizarPartida(almacen, partida);
  assert.equal(repetido.repetido, true);
  assert.equal(repetido.estado.churus, 32);
  assert.equal(repetido.estado.progreso.escena, 'guatemala-chichicastenango');
});

test('el disparador de Antigua abre el bonus del tuk-tuk antes de seguir a Chichicastenango', () => {
  const tukTuk = escenaAntigua.disparadores.find((d) => d.id === 'tuk-tuk-antigua');
  assert.ok(tukTuk);
  assert.equal(tukTuk.accion, 'subir');
  assert.equal(tukTuk.rutaBonus, './bonus-tuk-tuk.html');
  assert.equal(tukTuk.destino, 'guatemala-chichicastenango');
  assert.ok(tukTuk.x < escenaAntigua.disparadores.find((d) => d.accion === 'pasar').x);
});
