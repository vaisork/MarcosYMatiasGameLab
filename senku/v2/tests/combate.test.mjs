import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  crearEstadoCombate,
  actualizarCombate,
  detectarPisoton,
  aplicarPisoton,
  aplicarGolpeJugador,
  resolverContactoEnemigo,
  TIEMPO_INVULNERABILIDAD_DEFECTO,
} from '../src/core/combate.mjs';
import { crearCuerpo } from '../src/core/fisica.mjs';
import { crearEnemigo } from '../src/core/enemigos.mjs';

test('crearEstadoCombate inicializa con valores por defecto tolerantes a null', () => {
  const estado = crearEstadoCombate();
  assert.equal(estado.hpMax, null);
  assert.equal(estado.hp, null);
  assert.equal(estado.vidas, null);
  assert.equal(estado.invulnerable, false);
  assert.equal(estado.tiempoInvulnerable, 0);
  assert.equal(estado.derrotado, false);
});

test('crearEstadoCombate admite política de barra de vida y vidas (opción D5-a)', () => {
  const estado = crearEstadoCombate({ hpMax: 100, vidasIniciales: 7 });
  assert.equal(estado.hpMax, 100);
  assert.equal(estado.hp, 100);
  assert.equal(estado.vidas, 7);
  assert.equal(estado.derrotado, false);
});

test('crearEstadoCombate admite política sin barra y solo vidas (opción D5-b)', () => {
  const estado = crearEstadoCombate({ hpMax: null, vidasIniciales: 3 });
  assert.equal(estado.hpMax, null);
  assert.equal(estado.hp, null);
  assert.equal(estado.vidas, 3);
  assert.equal(estado.derrotado, false);
});

test('actualizarCombate reduce reloj de invulnerabilidad y la desactiva en cero', () => {
  const estado = crearEstadoCombate({ tiempoInvulnerabilidad: 1.0 });
  estado.invulnerable = true;
  estado.tiempoInvulnerable = 1.0;

  actualizarCombate(estado, 0.4);
  assert.equal(estado.invulnerable, true);
  assert.ok(Math.abs(estado.tiempoInvulnerable - 0.6) < 0.001);

  actualizarCombate(estado, 0.7);
  assert.equal(estado.invulnerable, false);
  assert.equal(estado.tiempoInvulnerable, 0);
});

test('aplicarGolpeJugador con HP y vidas: reduce HP, previene daño mientras dura invulnerabilidad', () => {
  const estado = crearEstadoCombate({ hpMax: 100, vidasIniciales: 3, tiempoInvulnerabilidad: 1.5 });

  const res1 = aplicarGolpeJugador(estado, 30);
  assert.equal(res1.golpeado, true);
  assert.equal(estado.hp, 70);
  assert.equal(estado.vidas, 3);
  assert.equal(estado.invulnerable, true);
  assert.equal(estado.tiempoInvulnerable, 1.5);

  // Segundo golpe inmediato es ignorado por invulnerabilidad
  const res2 = aplicarGolpeJugador(estado, 30);
  assert.equal(res2.golpeado, false);
  assert.equal(res2.motivo, 'invulnerable');
  assert.equal(estado.hp, 70);
});

test('aplicarGolpeJugador al agotar HP: descuenta una vida y restaura HP completo', () => {
  const estado = crearEstadoCombate({ hpMax: 50, vidasIniciales: 2 });

  aplicarGolpeJugador(estado, 50);
  assert.equal(estado.vidas, 1);
  assert.equal(estado.hp, 50);
  assert.equal(estado.derrotado, false);

  // Termina invulnerabilidad y recibe golpe letal final
  estado.invulnerable = false;
  estado.tiempoInvulnerable = 0;

  aplicarGolpeJugador(estado, 50);
  assert.equal(estado.vidas, 0);
  assert.equal(estado.hp, 0);
  assert.equal(estado.derrotado, true);

  // Estando derrotado, nuevos golpes se rechazan
  const res3 = aplicarGolpeJugador(estado, 10);
  assert.equal(res3.golpeado, false);
  assert.equal(res3.motivo, 'derrotado');
});

test('aplicarGolpeJugador con política de solo vidas descuenta vida directamente', () => {
  const estado = crearEstadoCombate({ hpMax: null, vidasIniciales: 2 });

  aplicarGolpeJugador(estado, null);
  assert.equal(estado.vidas, 1);
  assert.equal(estado.derrotado, false);

  estado.invulnerable = false;
  estado.tiempoInvulnerable = 0;

  aplicarGolpeJugador(estado, null);
  assert.equal(estado.vidas, 0);
  assert.equal(estado.derrotado, true);
});

test('aplicarGolpeJugador con valores creativos en null registra el impacto sin romperse', () => {
  const estado = crearEstadoCombate({ hpMax: null, vidasIniciales: null });

  const res = aplicarGolpeJugador(estado, null);
  assert.equal(res.golpeado, true);
  assert.equal(estado.hp, null);
  assert.equal(estado.vidas, null);
  assert.equal(estado.invulnerable, true);
  assert.equal(estado.derrotado, false);
  assert.equal(estado.totalGolpesRecibidos, 1);
});

test('detectarPisoton: reconoce pisotón cuando el jugador cae desde arriba sobre el enemigo', () => {
  const enemigo = crearEnemigo({ x: 200, y: 300, w: 40, h: 30, pisable: true });
  // Senku w=48, h=36; con pies en y=308 (mitad superior del enemigo que va de 300 a 330)
  const senku = crearCuerpo({ x: 205, y: 272, w: 48, h: 36, vy: 120 });

  assert.equal(detectarPisoton(senku, enemigo), true);
});

test('detectarPisoton: rechaza pisotón si el jugador no está cayendo (vy <= 0)', () => {
  const enemigo = crearEnemigo({ x: 200, y: 300, w: 40, h: 30, pisable: true });
  const senkuSubiendo = crearCuerpo({ x: 205, y: 272, w: 48, h: 36, vy: -200 });

  assert.equal(detectarPisoton(senkuSubiendo, enemigo), false);
});

test('detectarPisoton: rechaza pisotón si la colisión es lateral/baja', () => {
  const enemigo = crearEnemigo({ x: 200, y: 300, w: 40, h: 30, pisable: true });
  // Senku a la misma altura, pies en y=336
  const senkuLateral = crearCuerpo({ x: 195, y: 300, w: 48, h: 36, vy: 10 });

  assert.equal(detectarPisoton(senkuLateral, enemigo), false);
});

test('detectarPisoton: rechaza pisotón si el enemigo tiene pisable=false', () => {
  const enemigoNoPisable = crearEnemigo({ x: 200, y: 300, w: 40, h: 30, pisable: false });
  const senku = crearCuerpo({ x: 205, y: 272, w: 48, h: 36, vy: 150 });

  assert.equal(detectarPisoton(senku, enemigoNoPisable), false);
});

test('aplicarPisoton hace rebotar al jugador hacia arriba y derrota al enemigo', () => {
  const enemigo = crearEnemigo({ x: 200, y: 300, w: 40, h: 30, hp: null });
  const senku = crearCuerpo({ x: 205, y: 272, vy: 200 });
  const estado = crearEstadoCombate({ fuerzaRebotePisoton: 460 });

  const res = aplicarPisoton(senku, enemigo, estado);
  assert.equal(res.exito, true);
  assert.equal(res.enemigoDerrotado, true);
  assert.equal(enemigo.vivo, false);
  assert.equal(senku.vy, -460);
  assert.equal(estado.totalPisotonesDados, 1);
});

test('resolverContactoEnemigo: pisotón vence al enemigo sin dañar a Senku', () => {
  const enemigo = crearEnemigo({ x: 200, y: 300, w: 40, h: 30, pisable: true });
  const senku = crearCuerpo({ x: 205, y: 272, w: 48, h: 36, vy: 150 });
  const estado = crearEstadoCombate({ hpMax: 100, vidasIniciales: 3 });

  const res = resolverContactoEnemigo(senku, enemigo, estado);
  assert.equal(res.contacto, true);
  assert.equal(res.tipo, 'pisoton');
  assert.equal(res.enemigoDerrotado, true);
  assert.equal(estado.hp, 100);
  assert.equal(estado.invulnerable, false);
  assert.ok(senku.vy < 0); // Rebotó hacia arriba
});

test('resolverContactoEnemigo: choque frontal daña a Senku y aplica retroceso', () => {
  const enemigo = crearEnemigo({ x: 220, y: 300, w: 40, h: 30, dano: 10 });
  const senku = crearCuerpo({ x: 200, y: 300, w: 48, h: 36, vy: 0, vx: 50 });
  const estado = crearEstadoCombate({ hpMax: 100, vidasIniciales: 3 });

  const res = resolverContactoEnemigo(senku, enemigo, estado);
  assert.equal(res.contacto, true);
  assert.equal(res.tipo, 'golpe');
  assert.equal(res.golpeado, true);
  assert.equal(estado.hp, 90);
  assert.equal(estado.invulnerable, true);
  assert.ok(senku.vx < 0); // Retroceso hacia la izquierda (alejándose del enemigo)
  assert.equal(enemigo.vivo, true);
});

test('resolverContactoEnemigo: enemigo derrotado no genera contacto', () => {
  const enemigoMuerto = crearEnemigo({ x: 200, y: 300, w: 40, h: 30, vivo: false });
  const senku = crearCuerpo({ x: 200, y: 300, w: 48, h: 36 });
  const estado = crearEstadoCombate();

  const res = resolverContactoEnemigo(senku, enemigoMuerto, estado);
  assert.equal(res.contacto, false);
});
