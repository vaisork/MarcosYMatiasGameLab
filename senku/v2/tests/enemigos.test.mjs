import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  crearEnemigo,
  actualizarEnemigo,
  actualizarEnemigos,
  daniarEnemigo,
  estaVivo,
} from '../src/core/enemigos.mjs';
import { CATALOGO_ENEMIGOS, obtenerPlantillaEnemigo } from '../src/data/enemigos.mjs';

test('catálogo de datos de enemigos contiene plantillas y daño configurado', () => {
  assert.ok(CATALOGO_ENEMIGOS.cucaracha);
  assert.ok(CATALOGO_ENEMIGOS.rata_menor);
  assert.ok(CATALOGO_ENEMIGOS.hamster);
  assert.equal(CATALOGO_ENEMIGOS.cucaracha.hp, null);
  assert.equal(CATALOGO_ENEMIGOS.cucaracha.dano, 1);
  assert.equal(CATALOGO_ENEMIGOS.rata_menor.dano, 1);
  assert.equal(CATALOGO_ENEMIGOS.hamster.dano, 1);
  assert.equal(CATALOGO_ENEMIGOS.cucaracha.recompensaChurus, null);

  const plantilla = obtenerPlantillaEnemigo('cucaracha');
  assert.equal(plantilla.nombre, 'Cucaracha de taquería');
  assert.equal(plantilla.pisable, true);

  assert.equal(obtenerPlantillaEnemigo('inexistente'), null);
});

test('crearEnemigo inicializa con plantilla y valores por defecto', () => {
  const cucaracha = crearEnemigo({
    tipo: 'cucaracha',
    x: 100,
    y: 200,
  });

  assert.equal(cucaracha.tipo, 'cucaracha');
  assert.equal(cucaracha.x, 100);
  assert.equal(cucaracha.y, 200);
  assert.equal(cucaracha.w, 36);
  assert.equal(cucaracha.h, 20);
  assert.equal(cucaracha.hp, null);
  assert.equal(cucaracha.dano, 1);
  assert.equal(cucaracha.vivo, true);
  assert.equal(cucaracha.pisable, true);
});

test('crearEnemigo maneja valores creativos nulos sin romperse', () => {
  const enemigoNulo = crearEnemigo({
    tipo: 'desconocido',
    hp: null,
    dano: null,
    velocidad: null,
    patrulla: null,
  });

  assert.equal(enemigoNulo.hp, null);
  assert.equal(enemigoNulo.dano, null);
  assert.equal(enemigoNulo.velocidad, 0);
  assert.equal(enemigoNulo.patrulla, null);
  assert.equal(enemigoNulo.vivo, true);

  // Al actualizar con velocidad 0 o nula, no se mueve ni revienta
  actualizarEnemigo(enemigoNulo, 0.016);
  assert.equal(enemigoNulo.x, 0);
});

test('actualizarEnemigo ejecuta patrulla horizontal y avanza en dirección mirando', () => {
  const enemigo = crearEnemigo({
    x: 100,
    y: 50,
    velocidad: 100,
    mirando: 1,
    patrulla: { minX: 50, maxX: 300 },
  });

  actualizarEnemigo(enemigo, 0.1);
  assert.equal(enemigo.x, 110);
  assert.equal(enemigo.mirando, 1);
});

test('actualizarEnemigo invierte dirección al alcanzar el límite derecho (maxX)', () => {
  const enemigo = crearEnemigo({
    x: 290,
    y: 50,
    w: 20,
    velocidad: 100,
    mirando: 1,
    patrulla: { minX: 50, maxX: 300 },
  });

  // En 0.2s avanzaría 20px -> x=310 (supera maxX - w = 280)
  actualizarEnemigo(enemigo, 0.2);
  assert.equal(enemigo.x, 280);
  assert.equal(enemigo.mirando, -1);
  assert.ok(enemigo.vx < 0);
});

test('actualizarEnemigo invierte dirección al alcanzar el límite izquierdo (minX)', () => {
  const enemigo = crearEnemigo({
    x: 55,
    y: 50,
    w: 20,
    velocidad: 100,
    mirando: -1,
    patrulla: { minX: 50, maxX: 300 },
  });

  // En 0.1s retrocede 10px -> x=45 (menor que minX = 50)
  actualizarEnemigo(enemigo, 0.1);
  assert.equal(enemigo.x, 50);
  assert.equal(enemigo.mirando, 1);
  assert.ok(enemigo.vx > 0);
});

test('actualizarEnemigo respeta límites globales de escena', () => {
  const enemigo = crearEnemigo({
    x: 10,
    y: 50,
    velocidad: 100,
    mirando: -1,
    patrulla: null,
  });

  actualizarEnemigo(enemigo, 0.5, { minX: 0, maxX: 500 });
  assert.equal(enemigo.x, 0);
  assert.equal(enemigo.mirando, 1);
});

test('enemigo no se mueve si ya está derrotado (vivo=false)', () => {
  const enemigo = crearEnemigo({
    x: 100,
    velocidad: 100,
    vivo: false,
  });

  actualizarEnemigo(enemigo, 0.5);
  assert.equal(enemigo.x, 100);
  assert.equal(estaVivo(enemigo), false);
});

test('actualizarEnemigos procesa un arreglo de entidades en lote', () => {
  const lista = [
    crearEnemigo({ x: 10, velocidad: 50, mirando: 1 }),
    crearEnemigo({ x: 200, velocidad: 50, mirando: -1 }),
  ];

  actualizarEnemigos(lista, 0.1);
  assert.equal(lista[0].x, 15);
  assert.equal(lista[1].x, 195);
});

test('daniarEnemigo con hp=null derrota al enemigo de un solo golpe', () => {
  const enemigo = crearEnemigo({ hp: null });
  assert.equal(enemigo.vivo, true);

  const res = daniarEnemigo(enemigo, 1);
  assert.equal(res.afectado, true);
  assert.equal(res.derrotado, true);
  assert.equal(enemigo.vivo, false);
});

test('daniarEnemigo con hp numérico resta salud hasta ser derrotado en 0', () => {
  const enemigo = crearEnemigo({ hp: 3 });

  const res1 = daniarEnemigo(enemigo, 1);
  assert.equal(res1.afectado, true);
  assert.equal(res1.derrotado, false);
  assert.equal(enemigo.hp, 2);
  assert.equal(enemigo.vivo, true);

  const res2 = daniarEnemigo(enemigo, 2);
  assert.equal(res2.afectado, true);
  assert.equal(res2.derrotado, true);
  assert.equal(enemigo.hp, 0);
  assert.equal(enemigo.vivo, false);
});
