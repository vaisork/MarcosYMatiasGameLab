import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  crearEstadoCombate,
  actualizarCombate,
  detectarPisoton,
  aplicarPisoton,
  aplicarGolpeJugador,
  resolverContactoEnemigo,
  reiniciarCombate,
  HP_INICIAL_SENKU,
  TIEMPO_INVULNERABILIDAD_DEFECTO,
} from '../src/core/combate.mjs';
import { crearCuerpo } from '../src/core/fisica.mjs';
import { crearEnemigo } from '../src/core/enemigos.mjs';
import {
  DANO_CUCARACHA,
  DANO_RATA,
  DANO_RATON,
  DANO_HAMSTER,
} from '../src/data/enemigos.mjs';
import { estadoVisualJugador } from '../src/render/sprites.mjs';

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

test('daño por tipo: ratón/rata = 1, cucaracha = 1, hamster = 2', () => {
  assert.equal(DANO_CUCARACHA, 1);
  assert.equal(DANO_RATA, 1);
  assert.equal(DANO_RATON, 1);
  assert.equal(DANO_HAMSTER, 2);

  const cucaracha = crearEnemigo({ tipo: 'cucaracha', x: 220, y: 300 });
  const rata = crearEnemigo({ tipo: 'rata_menor', x: 220, y: 300 });
  const raton = crearEnemigo({ tipo: 'raton', x: 220, y: 300 });
  const hamster = crearEnemigo({ tipo: 'hamster', x: 220, y: 300 });

  assert.equal(cucaracha.dano, 1);
  assert.equal(rata.dano, 1);
  assert.equal(raton.dano, 1);
  assert.equal(hamster.dano, 2);

  // Daño de cucaracha a Senku con 100 HP
  const estado1 = crearEstadoCombate({ hpMax: HP_INICIAL_SENKU });
  const senku1 = crearCuerpo({ x: 200, y: 300, w: 48, h: 36 });
  const resCuc = resolverContactoEnemigo(senku1, cucaracha, estado1);
  assert.equal(resCuc.golpeado, true);
  assert.equal(estado1.hp, 99, 'cucaracha resta 1 de HP');

  // Daño de rata/ratón a Senku con 100 HP
  const estado2 = crearEstadoCombate({ hpMax: HP_INICIAL_SENKU });
  const senku2 = crearCuerpo({ x: 200, y: 300, w: 48, h: 36 });
  const resRata = resolverContactoEnemigo(senku2, rata, estado2);
  assert.equal(resRata.golpeado, true);
  assert.equal(estado2.hp, 99, 'rata resta 1 de HP');

  const estado3 = crearEstadoCombate({ hpMax: HP_INICIAL_SENKU });
  const senku3 = crearCuerpo({ x: 200, y: 300, w: 48, h: 36 });
  const resRaton = resolverContactoEnemigo(senku3, raton, estado3);
  assert.equal(resRaton.golpeado, true);
  assert.equal(estado3.hp, 99, 'ratón resta 1 de HP');

  // Daño de hámster a Senku con 100 HP
  const estado4 = crearEstadoCombate({ hpMax: HP_INICIAL_SENKU });
  const senku4 = crearCuerpo({ x: 200, y: 300, w: 48, h: 36 });
  const resHam = resolverContactoEnemigo(senku4, hamster, estado4);
  assert.equal(resHam.golpeado, true);
  assert.equal(estado4.hp, 98, 'hamster resta 2 de HP');
});

test('invencibilidad: dura 1 s tras golpe, previene daño sucesivo y activa parpadeo', () => {
  const estado = crearEstadoCombate({
    hpMax: 100,
    tiempoInvulnerabilidad: TIEMPO_INVULNERABILIDAD_DEFECTO,
  });
  assert.equal(estado.duracionInvulnerabilidad, 1.0, 'invencibilidad configurada a 1 s');

  // 1. Recibir primer golpe
  const res1 = aplicarGolpeJugador(estado, 1);
  assert.equal(res1.golpeado, true);
  assert.equal(estado.hp, 99);
  assert.equal(estado.invulnerable, true);
  assert.equal(estado.tiempoInvulnerable, 1.0);

  // 2. Comprobar parpadeo visual del sprite (alpha cambia alternadamente)
  const cuerpo = crearCuerpo({ enSuelo: true });
  const v1 = estadoVisualJugador(cuerpo, estado, 0.0);
  const v2 = estadoVisualJugador(cuerpo, estado, 0.08);
  assert.ok(v1.alpha !== v2.alpha, 'sprite debe alternar alpha durante parpadeo');

  // 3. Golpes durante el segundo de invulnerabilidad son ignorados
  const res2 = aplicarGolpeJugador(estado, 2);
  assert.equal(res2.golpeado, false);
  assert.equal(res2.motivo, 'invulnerable');
  assert.equal(estado.hp, 99, 'vida no disminuye mientras dura la invulnerabilidad');

  // 4. Tras 0.6 s sigue invulnerable
  actualizarCombate(estado, 0.6);
  assert.equal(estado.invulnerable, true);
  assert.ok(Math.abs(estado.tiempoInvulnerable - 0.4) < 0.001);

  // 5. Tras completar el segundo (0.41 s más), invulnerabilidad se desactiva
  actualizarCombate(estado, 0.41);
  assert.equal(estado.invulnerable, false);
  assert.equal(estado.tiempoInvulnerable, 0);

  // 6. Ahora sí recibe daño nuevamente
  const res3 = aplicarGolpeJugador(estado, 2);
  assert.equal(res3.golpeado, true);
  assert.equal(estado.hp, 97);
});

test('muerte al llegar a 0 de vida y reinicio con vida llena', () => {
  const estado = crearEstadoCombate({ hpMax: 100 });
  assert.equal(estado.hp, 100);

  // Reducir vida hasta 0
  const golpeLethal = aplicarGolpeJugador(estado, 100);
  assert.equal(golpeLethal.golpeado, true);
  assert.equal(golpeLethal.muerto, true);
  assert.equal(estado.hp, 0);
  assert.equal(estado.derrotado, true);

  // Reiniciar combate (restaura vida llena y limpia flags)
  reiniciarCombate(estado);
  assert.equal(estado.hp, 100, 'reinicio restaura vida llena a 100');
  assert.equal(estado.derrotado, false);
  assert.equal(estado.invulnerable, false);
  assert.equal(estado.tiempoInvulnerable, 0);
});

test('hámster contra 1 HP: limita la vida a 0, derrota y rechaza golpes posteriores', () => {
  const estado = crearEstadoCombate({ hpMax: HP_INICIAL_SENKU, hpInicial: 1 });
  const senku = crearCuerpo({ x: 200, y: 300, vy: 0 });
  const hamster = crearEnemigo({ id: 'hamster-prueba', tipo: 'hamster', x: 220, y: 300 });

  const golpe = resolverContactoEnemigo(senku, hamster, estado);
  assert.equal(golpe.tipo, 'golpe');
  assert.equal(golpe.golpeado, true);
  assert.equal(golpe.muerto, true);
  assert.equal(golpe.derrotado, true);
  assert.equal(golpe.hp, 0);
  assert.equal(estado.hp, 0);
  assert.equal(estado.derrotado, true);

  actualizarCombate(estado, TIEMPO_INVULNERABILIDAD_DEFECTO);
  const siguiente = resolverContactoEnemigo(senku, hamster, estado);
  assert.equal(siguiente.golpeado, false);
  assert.equal(siguiente.motivo, 'derrotado');
  assert.equal(siguiente.hp, 0);
  assert.equal(estado.hp, 0);
  assert.equal(estado.totalGolpesRecibidos, 1);
});
