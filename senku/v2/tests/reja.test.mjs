import test from 'node:test';
import assert from 'node:assert/strict';
import { escenaReja } from '../src/data/escenas/reja.mjs';
import { escenaTaqueria } from '../src/data/escenas/taqueria.mjs';
import { crearEnemigo, actualizarEnemigo } from '../src/core/enemigos.mjs';

test('entrada del desierto: la camioneta conduce primero a la reja', () => {
  assert.equal(escenaTaqueria.disparadores.find((d) => d.accion === 'subir').destino, 'reja');
  assert.equal(escenaReja.id, 'reja');
  assert.equal(escenaReja.puntoEntrada.x, 250);
});

test('el parque ofrece siete pantallas continuas, cámara y paralaje de tres capas', () => {
  assert.equal(escenaReja.limites.w / 1280, 7);
  assert.equal(escenaReja.fondo.estilo, 'desierto');
  assert.ok(escenaReja.limites.w > 1280);
  assert.ok(escenaReja.plataformas.length >= 20);
});

test('oleadas repartidas por zona mezclan ratones y hámsters negros y cafés', () => {
  assert.ok(escenaReja.enemigos.length >= 20);
  assert.deepEqual(new Set(escenaReja.enemigos.map((e) => e.tipo)), new Set(['raton', 'hamster']));
  assert.deepEqual(new Set(escenaReja.enemigos.map((e) => e.variante)), new Set(['negro', 'cafe']));
  assert.ok(new Set(escenaReja.enemigos.map((e) => e.comportamiento)).size >= 3);
  assert.ok(escenaReja.enemigos.at(-1).oleada > escenaReja.enemigos[0].oleada);
  for (let zona = 0; zona < 7; zona++) {
    const desde = zona * 1280;
    assert.ok(escenaReja.enemigos.some((e) => e.x >= desde && e.x < desde + 1280), `zona ${zona + 1}`);
  }
  assert.ok(escenaReja.enemigos.every((e) => e.pisable));
  assert.equal(escenaReja.objetos.find((o) => o.tipo === 'botiquin').id, 'botiquin-reja-1');
});

test('hay churus alcanzables y dos secretos elevados en plataformas', () => {
  const churus = escenaReja.objetos.filter((o) => o.tipo === 'churu');
  assert.ok(churus.length >= 10);
  assert.equal(escenaReja.secretos.length, 2);
  for (const id of escenaReja.secretos) {
    const secreto = churus.find((o) => o.id === id);
    assert.ok(secreto?.secreto);
    assert.ok(escenaReja.plataformas.some((p) => p.y >= secreto.y + secreto.h - 20
      && p.x <= secreto.x && p.x + p.w >= secreto.x));
  }
});

test('patrulla, salto y persecución producen movimiento distinto', () => {
  const target = { x: 1000, y: 558 };
  const saltador = crearEnemigo(escenaReja.enemigos.find((e) => e.comportamiento === 'salta'));
  const perseguidor = crearEnemigo(escenaReja.enemigos.find((e) => e.comportamiento === 'persigue'));
  const patrulla = crearEnemigo(escenaReja.enemigos.find((e) => e.comportamiento === 'patrulla'));
  const saltoY = saltador.y;
  const persecucionX = perseguidor.x;
  const patrullaX = patrulla.x;
  actualizarEnemigo(saltador, 0.25, escenaReja.limites, target);
  actualizarEnemigo(perseguidor, 0.25, escenaReja.limites, target);
  actualizarEnemigo(patrulla, 0.25, escenaReja.limites, target);
  assert.ok(saltador.y < saltoY);
  assert.ok(perseguidor.x < persecucionX);
  assert.notEqual(patrulla.x, patrullaX);
});

test('oleadas conservan daño definido por tipo', () => {
  const hamster = crearEnemigo(escenaReja.enemigos.find((e) => e.tipo === 'hamster'));
  const raton = crearEnemigo(escenaReja.enemigos.find((e) => e.tipo === 'raton'));
  assert.equal(hamster.dano, 20);
  assert.equal(raton.dano, 10);
  assert.ok(escenaReja.enemigos.every((e) => Number.isInteger(e.oleada) && e.oleada > 0));
});
