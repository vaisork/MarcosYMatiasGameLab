import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CURACION_BOTIQUIN,
  HP_MAXIMO_DEFECTO,
  puedeRecogerBotiquin,
  aplicarCuracion,
  recogerBotiquin,
} from '../src/core/botiquin.mjs';
import {
  BOTIQUINES,
  BOTIQUINES_POR_ESCENA,
  botiquinTaqueria,
  botiquinDesierto,
  obtenerBotiquinesEscena,
  obtenerBotiquinEscena,
} from '../src/data/botiquines.mjs';
import { arrancarSenku2 } from '../src/main.mjs';
import { cargar, guardar, estadoNuevo } from '../src/core/store.mjs';
import { memoria } from './ayuda.mjs';

function crearJuegoMock(almacen = memoria()) {
  const eventos = {};
  const elementos = {
    'lienzo-juego': { getContext: () => null, style: {}, setAttribute() {} },
    'saldo-churus': { textContent: '0' },
    'texto-vida': { textContent: '100' },
    'barra-vida-relleno': { style: {} },
    'btn-subir': { hidden: true },
    'aviso-viaje': { hidden: true, textContent: '' },
  };
  const documento = {
    getElementById: (id) => elementos[id] || null,
    querySelector: () => null,
    body: {},
  };
  const ventana = {
    localStorage: almacen,
    addEventListener: (tipo, fn) => { (eventos[tipo] ||= []).push(fn); },
    removeEventListener() {},
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
  };
  const juego = arrancarSenku2({ documento, ventana });
  return { juego, almacen, elementos, eventos };
}

// ---------------------------------------------------------------------------
// 1. Pruebas unitarias de curación y tope
// ---------------------------------------------------------------------------

test('cura +25: aplicarCuracion incrementa 25 puntos de vida exactamente', () => {
  const combate = { hpMax: 100, hp: 50, derrotado: false };
  const res = aplicarCuracion(combate, 25);

  assert.equal(res.curado, true);
  assert.equal(res.hpAnterior, 50);
  assert.equal(res.hp, 75);
  assert.equal(res.cantidadCurada, 25);
  assert.equal(combate.hp, 75);
});

test('tope en 100: no supera el hpMax al curar con vida cercana al máximo', () => {
  const combate = { hpMax: 100, hp: 90, derrotado: false };
  const res = aplicarCuracion(combate, 25);

  assert.equal(res.curado, true);
  assert.equal(res.hpAnterior, 90);
  assert.equal(res.hp, 100);
  assert.equal(res.cantidadCurada, 10);
  assert.equal(combate.hp, 100);
});

test('no consume con vida llena: con vida en hpMax no cura y reporta vida_llena', () => {
  const combate = { hpMax: 100, hp: 100, derrotado: false };
  const res = aplicarCuracion(combate, 25);

  assert.equal(res.curado, false);
  assert.equal(res.motivo, 'vida_llena');
  assert.equal(combate.hp, 100);
});

test('puedeRecogerBotiquin: valida condiciones de salud, recogida previa y derrota', () => {
  const combateOk = { hpMax: 100, hp: 70, derrotado: false };
  const combateLleno = { hpMax: 100, hp: 100, derrotado: false };
  const combateMuerto = { hpMax: 100, hp: 0, derrotado: true };

  const botiquinLibre = { id: 'bot-1', recogido: false };
  const botiquinYaTomado = { id: 'bot-1', recogido: true };
  const jugadorConGuardado = { coleccionados: ['bot-1'] };
  const jugadorLimpio = { coleccionados: [] };

  // Con vida dañada y botiquín disponible -> true
  assert.equal(puedeRecogerBotiquin(combateOk, botiquinLibre, jugadorLimpio), true);

  // Con vida al máximo -> false (no se consume con vida llena)
  assert.equal(puedeRecogerBotiquin(combateLleno, botiquinLibre, jugadorLimpio), false);

  // Si el botiquín ya tiene flag recogido -> false
  assert.equal(puedeRecogerBotiquin(combateOk, botiquinYaTomado, jugadorLimpio), false);

  // Si el botiquín ya está en coleccionados del guardado -> false
  assert.equal(puedeRecogerBotiquin(combateOk, botiquinLibre, jugadorConGuardado), false);

  // Si el jugador está derrotado -> false
  assert.equal(puedeRecogerBotiquin(combateMuerto, botiquinLibre, jugadorLimpio), false);
});

// ---------------------------------------------------------------------------
// 2. Pruebas de recogerBotiquin (interacción, contacto y una sola recogida)
// ---------------------------------------------------------------------------

test('recogerBotiquin: cura +25, anota id en coleccionados y marca recogido', () => {
  const senku = { x: 100, y: 100, w: 40, h: 40 };
  const botiquin = { id: 'botiquin-1', tipo: 'botiquin', x: 110, y: 110, w: 30, h: 30, curacion: 25, recogido: false };
  const combate = { hpMax: 100, hp: 60, derrotado: false };
  const estadoJugador = { churus: 0, coleccionados: ['otro-objeto'] };

  const res = recogerBotiquin({
    jugador: senku,
    botiquin,
    estadoCombate: combate,
    estadoJugador,
  });

  assert.equal(res.recogido, true);
  assert.equal(res.curacion, 25);
  assert.equal(res.hp, 85);
  assert.equal(combate.hp, 85);
  assert.equal(botiquin.recogido, true);
  assert.ok(res.estadoJugador.coleccionados.includes('botiquin-1'));
  assert.ok(res.estadoJugador.coleccionados.includes('otro-objeto'));
});

test('recogerBotiquin: respeta tope en 100 si la cura excede el hpMax', () => {
  const senku = { x: 100, y: 100, w: 40, h: 40 };
  const botiquin = { id: 'botiquin-1', tipo: 'botiquin', x: 100, y: 100, w: 36, h: 36, recogido: false };
  const combate = { hpMax: 100, hp: 95, derrotado: false };
  const estadoJugador = { coleccionados: [] };

  const res = recogerBotiquin({
    jugador: senku,
    botiquin,
    estadoCombate: combate,
    estadoJugador,
  });

  assert.equal(res.recogido, true);
  assert.equal(res.curacion, 5); // 95 + 5 = 100 (tope en 100)
  assert.equal(res.hp, 100);
  assert.equal(combate.hp, 100);
});

test('recogerBotiquin: no se consume si la vida ya está en 100', () => {
  const senku = { x: 100, y: 100, w: 40, h: 40 };
  const botiquin = { id: 'botiquin-1', tipo: 'botiquin', x: 100, y: 100, w: 36, h: 36, recogido: false };
  const combate = { hpMax: 100, hp: 100, derrotado: false };
  const estadoJugador = { coleccionados: [] };

  const res = recogerBotiquin({
    jugador: senku,
    botiquin,
    estadoCombate: combate,
    estadoJugador,
  });

  assert.equal(res.recogido, false);
  assert.equal(res.motivo, 'vida_llena');
  assert.equal(botiquin.recogido, false);
  assert.equal(combate.hp, 100);
  assert.equal(estadoJugador.coleccionados.length, 0);
});

test('una sola recogida: el mismo botiquín no puede recogerse dos veces', () => {
  const senku = { x: 100, y: 100, w: 40, h: 40 };
  const botiquin = { id: 'botiquin-1', tipo: 'botiquin', x: 100, y: 100, w: 36, h: 36, recogido: false };
  const combate = { hpMax: 100, hp: 50, derrotado: false };
  let estadoJugador = { coleccionados: [] };

  // Primera recogida exitosa (50 -> 75)
  const res1 = recogerBotiquin({ jugador: senku, botiquin, estadoCombate: combate, estadoJugador });
  assert.equal(res1.recogido, true);
  assert.equal(combate.hp, 75);
  estadoJugador = res1.estadoJugador;

  // Jugador vuelve a recibir daño (baja a 40)
  combate.hp = 40;

  // Segundo intento sobre el mismo botiquín ya recogido
  const res2 = recogerBotiquin({ jugador: senku, botiquin, estadoCombate: combate, estadoJugador });
  assert.equal(res2.recogido, false);
  assert.equal(res2.motivo, 'ya_recogido');
  assert.equal(combate.hp, 40, 'la salud no debe alterarse');
});

test('recogerBotiquin: sin solapamiento espacial no se recoge', () => {
  const senku = { x: 50, y: 50, w: 40, h: 40 };
  const botiquinLejano = { id: 'bot-1', tipo: 'botiquin', x: 900, y: 500, w: 36, h: 36, recogido: false };
  const combate = { hpMax: 100, hp: 50, derrotado: false };

  const res = recogerBotiquin({ jugador: senku, botiquin: botiquinLejano, estadoCombate: combate });
  assert.equal(res.recogido, false);
  assert.equal(res.motivo, 'sin_contacto');
  assert.equal(botiquinLejano.recogido, false);
});

// ---------------------------------------------------------------------------
// 3. Catálogo y posiciones por escena (src/data/botiquines.mjs)
// ---------------------------------------------------------------------------

test('catálogo de botiquines: posiciones por escena (taquería y desierto, 1 por escena)', () => {
  assert.ok(BOTIQUINES.taqueria, 'Debe existir botiquín para la taquería');
  assert.ok(BOTIQUINES.desierto, 'Debe existir botiquín para el desierto');

  const taq = BOTIQUINES.taqueria;
  assert.equal(taq.tipo, 'botiquin');
  assert.equal(taq.id, 'botiquin-1');
  assert.equal(taq.curacion, 25);
  assert.ok(taq.x >= 0 && taq.x + taq.w <= 1280, 'taqueria x dentro del lienzo');
  assert.ok(taq.y >= 0 && taq.y + taq.h <= 720, 'taqueria y dentro del lienzo');

  const des = BOTIQUINES.desierto;
  assert.equal(des.tipo, 'botiquin');
  assert.equal(des.id, 'botiquin-desierto-1');
  assert.equal(des.curacion, 25);
  assert.ok(des.x >= 0 && des.x + des.w <= 1280, 'desierto x dentro del lienzo');
  assert.ok(des.y >= 0 && des.y + des.h <= 720, 'desierto y dentro del lienzo');

  // Exactamente 1 por escena
  assert.equal(obtenerBotiquinesEscena('taqueria').length, 1);
  assert.equal(obtenerBotiquinesEscena('desierto').length, 1);
  assert.equal(obtenerBotiquinesEscena('no_existe').length, 0);
});

// ---------------------------------------------------------------------------
// 4. Integración completa con arrancarSenku2, HUD, ciclo de juego y guardado
// ---------------------------------------------------------------------------

test('integración: con vida llena Senku no consume el botiquín al tocarlo', () => {
  const { juego } = crearJuegoMock();
  const botiquin = juego.escena.objetos.find((o) => o.tipo === 'botiquin');
  assert.ok(botiquin, 'Debe haber un botiquín en la escena');
  assert.equal(botiquin.recogido, false);

  // Senku inicia con 100 HP
  assert.equal(juego.estadoCombate.hp, 100);

  // Colocar a Senku sobre el botiquín
  Object.assign(juego.senku, { x: botiquin.x, y: botiquin.y, vy: 0 });
  juego.avanzarPaso(0);

  // No debe haberse consumido ni modificado
  assert.equal(botiquin.recogido, false, 'botiquín no debe marcarse recogido');
  assert.equal(juego.estadoCombate.hp, 100, 'salud se mantiene en 100');
  assert.equal(juego.estadoJugador().coleccionados.includes(botiquin.id), false, 'no entra al guardado');

  juego.detener();
});

test('integración: con daño Senku recoge botiquín, cura +25 y persiste en store.mjs', () => {
  const almacen = memoria();
  const { juego } = crearJuegoMock(almacen);
  const botiquin = juego.escena.objetos.find((o) => o.tipo === 'botiquin');

  // Simular daño recibido: Senku baja a 50 HP
  juego.estadoCombate.hp = 50;
  juego.actualizarHUDVida();

  // Mover a Senku a la posición del botiquín
  Object.assign(juego.senku, { x: botiquin.x, y: botiquin.y, vy: 0 });
  juego.avanzarPaso(0);

  // Comprobar curación +25
  assert.equal(juego.estadoCombate.hp, 75, 'HP sube 25 puntos');
  assert.equal(botiquin.recogido, true, 'botiquín marcado como recogido');
  assert.ok(juego.estadoJugador().coleccionados.includes(botiquin.id), 'id guardado en coleccionados');

  // Comprobar persistencia real en el almacenamiento versionado
  const guardado = cargar(almacen);
  assert.ok(guardado.estado, 'Guardado debe existir');
  assert.ok(guardado.estado.coleccionados.includes(botiquin.id), 'Guardado incluye botiquin en coleccionados');

  juego.detener();
});

test('persistencia y una sola recogida: recarga de partida no regenera el botiquín', () => {
  const almacen = memoria();

  // Partida 1: Recoger el botiquín
  {
    const { juego } = crearJuegoMock(almacen);
    const botiquin = juego.escena.objetos.find((o) => o.tipo === 'botiquin');
    juego.estadoCombate.hp = 60;
    Object.assign(juego.senku, { x: botiquin.x, y: botiquin.y, vy: 0 });
    juego.avanzarPaso(0);
    assert.equal(juego.estadoCombate.hp, 85);
    assert.equal(botiquin.recogido, true);
    juego.detener();
  }

  // Partida 2: Reiniciar sesión con el mismo almacenamiento
  {
    const { juego } = crearJuegoMock(almacen);
    const botiquin = juego.escena.objetos.find((o) => o.tipo === 'botiquin');
    assert.ok(botiquin, 'El botiquín existe en la definición de la escena');
    assert.equal(botiquin.recogido, true, 'debe iniciar ya marcado como recogido por el guardado');

    // Bajar vida a 40 y pasar por la misma posición
    juego.estadoCombate.hp = 40;
    Object.assign(juego.senku, { x: botiquin.x, y: botiquin.y, vy: 0 });
    juego.avanzarPaso(0);

    // No debe curar nuevamente
    assert.equal(juego.estadoCombate.hp, 40, 'no se vuelve a curar con botiquín ya recogido');

    juego.detener();
  }
});

test('integración: botiquín en escena desierto se recoge y respeta tope en 100', () => {
  const almacen = memoria();
  const { juego } = crearJuegoMock(almacen);

  // Limpiar taquería y recoger llave para subir a la camioneta
  for (const enemigo of [...juego.enemigos]) {
    Object.assign(juego.senku, { x: enemigo.x, y: enemigo.y - juego.senku.h + 3, vy: 100 });
    juego.avanzarPaso(0);
  }
  const llave = juego.escena.objetos.find((o) => o.tipo === 'llave');
  assert.ok(llave, 'Debe aparecer la llave');
  Object.assign(juego.senku, { x: llave.x, y: llave.y, vy: 0 });
  juego.avanzarPaso(0);

  // Acercarse a la camioneta e iniciar viaje
  Object.assign(juego.senku, { x: 150, y: 558, vy: 0 });
  assert.equal(juego.intentarSubir(), true);

  // Simular los segundos del viaje hacia el desierto
  juego.avanzarPaso(5);
  assert.equal(juego.escena.id, 'reja');

  // Verificar presencia del botiquín en el desierto
  const botiquinDesierto = juego.escena.objetos.find((o) => o.tipo === 'botiquin');
  assert.ok(botiquinDesierto, 'Debe haber un botiquín en la escena desierto');
  assert.equal(botiquinDesierto.id, 'botiquin-desierto-1');
  assert.equal(botiquinDesierto.recogido, false);

  // Senku recibe daño (queda en 85 HP)
  juego.estadoCombate.hp = 85;

  // Moverse al botiquín del desierto (tope en 100: 85 + 25 = 100, no 110)
  Object.assign(juego.senku, { x: botiquinDesierto.x, y: botiquinDesierto.y, vy: 0 });
  juego.avanzarPaso(0);

  assert.equal(juego.estadoCombate.hp, 100, 'cura con tope en 100');
  assert.equal(botiquinDesierto.recogido, true);
  assert.ok(juego.estadoJugador().coleccionados.includes('botiquin-desierto-1'));

  // Persiste en storage
  const guardado = cargar(almacen);
  assert.ok(guardado.estado.coleccionados.includes('botiquin-desierto-1'));

  juego.detener();
});
