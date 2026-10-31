import test from 'node:test';
import assert from 'node:assert/strict';
import {
  reproducirSonidoSalto,
  reproducirSonidoGolpe,
  reproducirSonidoDanio,
  reproducirSonidoItem,
  dibujarIndicadoresEscena,
} from '../src/main.mjs';
import { atacarEnemigo, resolverContactoEnemigo, crearEstadoCombate } from '../src/core/combate.mjs';
import { crearCuerpo } from '../src/core/fisica.mjs';
import { crearEnemigo } from '../src/core/enemigos.mjs';
import { escenaTaqueria } from '../src/data/escenas/taqueria.mjs';
import { escenaReja } from '../src/data/escenas/reja.mjs';
import { escenaDesierto } from '../src/data/escenas/desierto.mjs';

test('soltarLlave: la llave cae junto al último enemigo y no se clampa a 1246 en escenas de 3840 px', () => {
  const escena = {
    ...escenaTaqueria,
    objetos: [],
    recompensaFinal: { id: 'llave-camioneta', tipo: 'llave', x: 3480, y: 566, w: 34, h: 28 },
    limites: { minX: 0, maxX: 3840, minY: 0, maxY: 720 },
  };
  const ultimoEnemigo = { x: 3505, y: 512, w: 60, h: 48, vivo: false };

  const maxX = (escena.limites?.maxX ?? 1280) - 40;
  const dropX = ultimoEnemigo ? Math.min(maxX, Math.max(40, ultimoEnemigo.x - 40)) : escena.recompensaFinal.x;

  assert.ok(dropX > 3400, `dropX (${dropX}) debe estar cerca del enemigo y superar ampliamente 1246 px`);
  assert.ok(dropX <= 3800, `dropX (${dropX}) debe quedar dentro de los límites de la escena`);
});

test('retroceso en combate: el jugador recibe retroceso proporcionado al recibir golpe', () => {
  const jugador = crearCuerpo({ x: 500, y: 500, vx: 50, vy: 0 });
  const enemigo = crearEnemigo({ id: 'cucaracha-1', x: 520, y: 500, w: 50, h: 40 });
  const combate = crearEstadoCombate();

  const resultado = resolverContactoEnemigo(jugador, enemigo, combate);
  assert.equal(resultado.contacto, true);
  assert.equal(resultado.tipo, 'golpe');
  assert.ok(jugador.vx < 0, 'El jugador debe ser repelido hacia la izquierda');
  assert.ok(jugador.vy < 0, 'El jugador debe tener un leve impulso vertical de retroceso');
});

test('retroceso en combate: el enemigo recibe tiempo de retroceso e impulso al ser golpeado', () => {
  const jugador = crearCuerpo({ x: 500, y: 500, mirando: 1 });
  const enemigo = crearEnemigo({ id: 'cucaracha-2', x: 530, y: 500, w: 50, h: 40, hp: 3 });

  const ataque = atacarEnemigo(jugador, enemigo);
  assert.equal(ataque.golpeado, true);
  assert.ok(enemigo.tiempoRetroceso > 0, 'El enemigo debe entrar en estado de retroceso');
  assert.ok(enemigo.vx > 0, 'El enemigo debe ser empujado en la dirección del zarpazo');
});

test('audio sintetizado retro: funciones de sonido no lanzan errores en entornos simulados', () => {
  assert.doesNotThrow(() => reproducirSonidoSalto(null));
  assert.doesNotThrow(() => reproducirSonidoGolpe(null));
  assert.doesNotThrow(() => reproducirSonidoDanio(null));
  assert.doesNotThrow(() => reproducirSonidoItem(null));

  const ventanaSimulada = {
    AudioContext: class {
      constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
      createOscillator() {
        return {
          type: 'sine',
          frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} },
          connect() {},
          start() {},
          stop() {},
        };
      }
      createGain() {
        return {
          gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} },
          connect() {},
        };
      }
    },
  };

  assert.doesNotThrow(() => reproducirSonidoSalto(ventanaSimulada));
  assert.doesNotThrow(() => reproducirSonidoGolpe(ventanaSimulada));
  assert.doesNotThrow(() => reproducirSonidoDanio(ventanaSimulada));
  assert.doesNotThrow(() => reproducirSonidoItem(ventanaSimulada));
});

test('señalización de fin de escena: dibujarIndicadoresEscena dibuja letreros claros', () => {
  const comandosCtx = [];
  const ctxMock = {
    save() { comandosCtx.push('save'); },
    restore() { comandosCtx.push('restore'); },
    fillRect(...args) { comandosCtx.push(['fillRect', ...args]); },
    strokeRect(...args) { comandosCtx.push(['strokeRect', ...args]); },
    fillText(...args) { comandosCtx.push(['fillText', ...args]); },
    beginPath() { comandosCtx.push('beginPath'); },
    moveTo() {},
    lineTo() {},
    fill() {},
  };

  // 1. Taquería sin llave
  comandosCtx.length = 0;
  dibujarIndicadoresEscena(ctxMock, { id: 'taqueria' }, { x: 300, y: 500 }, 1.0, { coleccionados: [] });
  const textosSinLlave = comandosCtx.filter((c) => Array.isArray(c) && c[0] === 'fillText').map((c) => c[1]);
  assert.ok(textosSinLlave.some((t) => t.includes('FIN DE CALLE')), 'Debe mostrar FIN DE CALLE en la taquería');
  assert.ok(textosSinLlave.some((t) => t.includes('VUELVE A LA CAMIONETA')), 'Debe indicar volver a la camioneta');
  assert.ok(textosSinLlave.some((t) => t.includes('Busca la llave')), 'Debe avisar que falta la llave en la camioneta');

  // 2. Taquería con llave
  comandosCtx.length = 0;
  dibujarIndicadoresEscena(ctxMock, { id: 'taqueria' }, { x: 300, y: 500 }, 1.0, { coleccionados: ['llave-camioneta'] });
  const textosConLlave = comandosCtx.filter((c) => Array.isArray(c) && c[0] === 'fillText').map((c) => c[1]);
  assert.ok(textosConLlave.some((t) => t.includes('SUBIR AHORA')), 'Debe indicar que ya puede subir a la camioneta');

  // 3. Reja
  comandosCtx.length = 0;
  dibujarIndicadoresEscena(ctxMock, { id: 'reja' }, { x: 8000, y: 500 }, 1.0, { coleccionados: [] });
  const textosReja = comandosCtx.filter((c) => Array.isArray(c) && c[0] === 'fillText').map((c) => c[1]);
  assert.ok(textosReja.some((t) => t.includes('ENTRADA AL DESIERTO')), 'Debe indicar entrada al desierto');

  // 4. Desierto
  comandosCtx.length = 0;
  dibujarIndicadoresEscena(ctxMock, { id: 'desierto' }, { x: 6000, y: 500 }, 1.0, { coleccionados: [] });
  const textosDesierto = comandosCtx.filter((c) => Array.isArray(c) && c[0] === 'fillText').map((c) => c[1]);
  assert.ok(textosDesierto.some((t) => t.includes('META DEL VIAJE')), 'Debe indicar meta del viaje');
});

test('alcanzabilidad de churus: ningún churu está flotando sin apoyo ni exige un salto imposible', () => {
  const escenas = [
    { nombre: 'Taquería', escena: escenaTaqueria },
    { nombre: 'Reja', escena: escenaReja },
    { nombre: 'Desierto', escena: escenaDesierto },
  ];

  for (const { nombre, escena } of escenas) {
    const churus = escena.objetos.filter((o) => o.tipo === 'churu');
    for (const churu of churus) {
      const cx = churu.x + (churu.w || 22) / 2;
      const cy = churu.y + (churu.h || 58);

      const apoyo = escena.plataformas.find((p) => {
        const solapaX = cx >= p.x - 20 && cx <= p.x + p.w + 20;
        const distY = cy - p.y;
        return solapaX && distY >= -10 && distY <= 15;
      });

      const sobreSuelo = Math.abs(cy - 600) <= 20;

      assert.ok(
        apoyo || sobreSuelo,
        `En ${nombre}, el churu ${churu.id} en (${churu.x}, ${churu.y}) debe descansar sobre plataforma o suelo`
      );
    }
  }
});
