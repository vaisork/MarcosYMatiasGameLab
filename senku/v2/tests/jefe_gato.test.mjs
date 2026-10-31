import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearJefe, despertar, actualizarJefe, golpearJefe, danoAJugador, esPisoton, furioso,
  HP_JEFE, DANO } from '../src/core/jefe_gato.mjs';
import { crearLanzador, actualizarDisparo, actualizarProyectiles, ENFRIAMIENTO } from '../src/core/lanzador.mjs';
import { validarEscena } from '../src/core/escenas.mjs';
import { escenaCima, ARENA, SUELO_CIMA } from '../src/data/escenas/cima.mjs';
import { escenaDespenadero } from '../src/data/escenas/despenadero.mjs';

const DT = 1 / 60;
const jefeNuevo = () => crearJefe({ x: 2200, suelo: SUELO_CIMA, arenaMinX: ARENA.minX, arenaMaxX: ARENA.maxX });
const senkuEn = (x) => ({ x, y: SUELO_CIMA - 90, w: 96, h: 90, vx: 0, vy: 0, mirando: 1 });
const fijo = () => 0.5;

function correr(jefe, senku, segundos) {
  const eventos = [];
  for (let t = 0; t < segundos; t += DT) eventos.push(...actualizarJefe(jefe, senku, DT, fijo));
  return eventos;
}

test('la cima es válida, tiene el lanzador y el despeñadero lleva a ella', () => {
  assert.equal(validarEscena(escenaCima).valida, true);
  assert.ok(escenaCima.objetos.some((o) => o.tipo === 'lanzador'));
  assert.equal(escenaDespenadero.disparadores[0].destino, 'cima');
});

test('dormido no ataca ni recibe daño', () => {
  const jefe = jefeNuevo();
  assert.deepEqual(correr(jefe, senkuEn(1500), 3), []);
  assert.equal(golpearJefe(jefe), false);
  assert.equal(jefe.hp, HP_JEFE);
});

test('recorre el patrón: aviso y embestida, salto con ondas, tornillos', () => {
  const jefe = jefeNuevo();
  despertar(jefe);
  const eventos = correr(jefe, senkuEn(1500), 12);
  for (const e of ['aviso', 'embestir', 'aterrizar', 'tornillos']) assert.ok(eventos.includes(e), e);
  assert.ok(eventos.indexOf('aviso') < eventos.indexOf('embestir'), 'avisa antes de embestir');
});

test('la embestida termina aturdido contra la pared de la arena', () => {
  const jefe = jefeNuevo();
  despertar(jefe);
  correr(jefe, senkuEn(1350), 3.5);
  assert.ok(['aturdido', 'acecho', 'salto'].includes(jefe.estado));
  assert.ok(jefe.x >= ARENA.minX);
});

test('las ondas del aterrizaje dañan en el suelo y se esquivan saltando', () => {
  const jefe = jefeNuevo();
  despertar(jefe);
  jefe.estado = 'salto'; jefe.tiempo = 0; jefe.vy = 10; jefe.y = SUELO_CIMA - jefe.h;
  actualizarJefe(jefe, senkuEn(1500), DT, fijo);
  assert.equal(jefe.ondas.length, 2);
  const onda = jefe.ondas[0];
  onda.x = ARENA.minX + 50; // ya viajó lejos del cuerpo del jefe
  jefe.x = 2300;
  const enSuelo = senkuEn(onda.x - 10);
  assert.equal(danoAJugador(jefe, enSuelo), DANO.onda);
  const saltando = { ...enSuelo, y: SUELO_CIMA - 90 - 120 };
  assert.equal(danoAJugador(jefe, saltando), 0);
});

test('12 ratones lo vencen; tras cada golpe hay un respiro', () => {
  const jefe = jefeNuevo();
  despertar(jefe);
  assert.equal(golpearJefe(jefe), true);
  assert.equal(golpearJefe(jefe), false, 'no recibe dos golpes seguidos');
  for (let i = 1; i < HP_JEFE; i++) {
    jefe.parpadeo = 0;
    golpearJefe(jefe);
  }
  assert.equal(jefe.derrotado, true);
  assert.equal(jefe.estado, 'derrotado');
});

test('con media vida se enfurece y lanza más tornillos', () => {
  const jefe = jefeNuevo();
  despertar(jefe);
  jefe.hp = HP_JEFE / 2;
  assert.equal(furioso(jefe), true);
  jefe.indicePatron = 2;
  jefe.tiempo = 10;
  actualizarJefe(jefe, senkuEn(1500), DT, fijo);
  assert.equal(jefe.tornillos.length, 5);
});

test('pisotón sobre la cabeza no hace daño a Senku', () => {
  const jefe = jefeNuevo();
  despertar(jefe);
  const cayendo = { x: jefe.x + 60, y: jefe.y - 80, w: 96, h: 90, vy: 300 };
  assert.equal(esPisoton(jefe, cayendo), true);
  assert.equal(danoAJugador(jefe, cayendo), 0);
  const deFrente = { x: jefe.x - 40, y: jefe.y + 60, w: 96, h: 90, vy: 0 };
  assert.equal(danoAJugador(jefe, deFrente), DANO.contacto);
});

test('el lanzador dispara con enfriamiento y el ratón golpea al blanco', () => {
  const l = crearLanzador();
  const senku = senkuEn(1400);
  assert.ok(actualizarDisparo(l, senku, { atacar: true }, DT));
  assert.equal(actualizarDisparo(l, senku, { atacar: true }, DT), null, 'mantener no dispara de más');
  actualizarDisparo(l, senku, { atacar: false }, DT);
  assert.equal(actualizarDisparo(l, senku, { atacar: true }, DT), null, 'enfriamiento');
  for (let t = 0; t < ENFRIAMIENTO; t += DT) actualizarDisparo(l, senku, { atacar: false }, DT);
  assert.ok(actualizarDisparo(l, senku, { atacar: true }, DT));
  const blanco = { x: 1700, y: SUELO_CIMA - 170, w: 220, h: 170 };
  let impactos = [];
  for (let t = 0; t < 1 && impactos.length === 0; t += DT) impactos = actualizarProyectiles(l, DT, [blanco]);
  assert.equal(impactos[0].objetivo, blanco);
});
