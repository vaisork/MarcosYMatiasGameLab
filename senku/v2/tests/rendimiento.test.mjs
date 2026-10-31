// Rendimiento en celular: precarga por escena, caché offline completa y pausa con la pestaña oculta.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { rutasArteEscena, destinosEscena } from '../src/render/canvas.mjs';
import { crearMusica } from '../src/audio/musica.mjs';
import { arrancarSenku2 } from '../src/main.mjs';
import { escenaTaqueria } from '../src/data/escenas/taqueria.mjs';
import { escenaReja } from '../src/data/escenas/reja.mjs';
import { escenaDespenadero } from '../src/data/escenas/despenadero.mjs';

const V2 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('arte por escena: tramos si los tiene, capas de paralaje si no', () => {
  assert.deepEqual(rutasArteEscena(escenaTaqueria), escenaTaqueria.arte.tramos.map((t) => t.ruta));
  assert.deepEqual(rutasArteEscena(escenaReja), escenaReja.arte.tramos.map((t) => t.ruta));
  // Sin tramos pintados se usan las capas de paralaje de su estilo.
  const rejaSinTramos = { ...escenaReja, arte: null };
  assert.deepEqual(rutasArteEscena(rejaSinTramos), ['cielo', 'lejano', 'medio'].map((c) => `assets/fondos/paralaje/reja_${c}.webp`));
  assert.deepEqual(rutasArteEscena(null), []);
  for (const ruta of [...rutasArteEscena(escenaTaqueria), ...rutasArteEscena(escenaReja), ...rutasArteEscena(rejaSinTramos)]) {
    assert.ok(fs.existsSync(path.join(V2, ruta)), ruta);
  }
});

test('siguiente escena: destinos de los disparadores sin repetir', () => {
  assert.deepEqual(destinosEscena(escenaTaqueria), ['reja']);
  assert.deepEqual(destinosEscena(escenaDespenadero), ['cima']);
  assert.deepEqual(destinosEscena({}), []);
});

test('service worker: precachea todos los módulos que importa main.mjs', () => {
  const { RECURSOS_PRECACHE } = createRequire(import.meta.url)(path.join(V2, 'sw.js'));
  const vistos = new Set();
  (function recorrer(archivo) {
    if (vistos.has(archivo)) return;
    vistos.add(archivo);
    for (const m of fs.readFileSync(archivo, 'utf8').matchAll(/(?:import|export)[^'"]*?from\s+['"](\.[^'"]+)['"]/g)) {
      recorrer(path.resolve(path.dirname(archivo), m[1]));
    }
  })(path.join(V2, 'src/main.mjs'));
  const faltan = [...vistos].map((f) => `./${path.relative(V2, f)}`).filter((r) => !RECURSOS_PRECACHE.includes(r));
  assert.deepEqual(faltan, []);
  assert.ok(!RECURSOS_PRECACHE.some((r) => r.includes('assets/escenas/')), 'los tramos se cachean al pedirlos');
});

test('música: pausar suspende el audio y reanudar lo retoma', async () => {
  const llamadas = [];
  class AudioFalso {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; this.sampleRate = 8000; }
    createGain() { return { gain: { value: 0 }, connect: () => {} }; }
    suspend() { llamadas.push('suspend'); this.state = 'suspended'; return Promise.resolve(); }
    resume() { llamadas.push('resume'); this.state = 'running'; return Promise.resolve(); }
  }
  const ventana = { AudioContext: AudioFalso, setInterval: () => 1, clearInterval: () => {} };
  const musica = crearMusica(ventana);
  musica.pausar(); // sin audio creado aún: no hace nada
  musica.tocar('fiesta');
  musica.pausar();
  musica.reanudar();
  assert.deepEqual(llamadas, ['suspend', 'resume']);
  musica.detener();
});

test('pestaña oculta: detiene el bucle y lo reanuda al volver', () => {
  const lienzo = {
    getContext: () => new Proxy({}, { get: (_, k) => (k === 'measureText' ? () => ({ width: 40 }) : () => {}) }),
    parentElement: { clientWidth: 1280, clientHeight: 720 },
    style: {},
  };
  const oyentes = {};
  const doc = {
    visibilityState: 'visible',
    getElementById: (id) => (id === 'lienzo-juego' ? lienzo : null),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ setAttribute: () => {}, style: {}, addEventListener: () => {} }),
    addEventListener: (tipo, fn) => { oyentes[tipo] = fn; },
    removeEventListener: () => {},
    body: { clientWidth: 1280, clientHeight: 720 },
  };
  let pedidos = 0;
  const cancelados = [];
  const mapa = new Map();
  const win = {
    addEventListener: () => {},
    removeEventListener: () => {},
    requestAnimationFrame: () => ++pedidos,
    cancelAnimationFrame: (id) => cancelados.push(id),
    localStorage: { getItem: (k) => mapa.get(k) ?? null, setItem: (k, v) => mapa.set(k, String(v)), removeItem: (k) => mapa.delete(k) },
    location: { search: '' },
    innerWidth: 1280,
    innerHeight: 720,
  };
  const juego = arrancarSenku2({ documento: doc, ventana: win });
  assert.equal(juego.iniciado, true);
  const antes = pedidos;
  doc.visibilityState = 'hidden';
  oyentes.visibilitychange();
  assert.deepEqual(cancelados, [antes]);
  doc.visibilityState = 'visible';
  oyentes.visibilitychange();
  assert.equal(pedidos, antes + 1);
  juego.detener();
});
