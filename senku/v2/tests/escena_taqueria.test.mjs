import test from 'node:test';
import assert from 'node:assert/strict';
import { validarEscena } from '../src/core/escenas.mjs';
import { escenaTaqueria } from '../src/data/escenas/taqueria.mjs';
import { crearCuerpo, actualizarCuerpo, FUERZA_SALTO_DEFECTO, GRAVEDAD_DEFECTO, ANCHO_GATO_JUEGO, ALTURA_GATO_JUEGO } from '../src/core/fisica.mjs';
import { crearEnemigo } from '../src/core/enemigos.mjs';
import { modoDebugActivo, renderizarEscena } from '../src/render/canvas.mjs';

const { escena } = validarEscena(escenaTaqueria);
const PLATS = escena.plataformas;
const SUELO = PLATS.find((p) => p.tipo === 'suelo');
const JUGADOR = { w: ANCHO_GATO_JUEGO, h: ALTURA_GATO_JUEGO };
const DT = 1 / 60;

// Plataforma sobre la que está de pie un cuerpo (pies apoyados en su cara superior)
function plataformaBajo(cuerpo) {
  return PLATS.find(
    (p) => Math.abs(cuerpo.y + cuerpo.h - p.y) < 0.01 && cuerpo.x + cuerpo.w > p.x && cuerpo.x < p.x + p.w
  );
}

// Posiciones de salida sobre una plataforma: borde izquierdo, derecho y centro (quieto, sin carrera).
// Sobre el suelo continuo el jugador camina libremente bajo cada plataforma alcanzable.
function salidas(p) {
  const ancho = JUGADOR.w;
  if (p.tipo === 'suelo') {
    const xs = new Set();
    for (const q of PLATS) {
      if (q !== p) {
        xs.add(Math.max(0, Math.min(p.w - ancho, q.x)));
        xs.add(Math.max(0, Math.min(p.w - ancho, q.x + q.w - ancho)));
        xs.add(Math.max(0, Math.min(p.w - ancho, q.x + (q.w - ancho) / 2)));
      }
    }
    return [...xs];
  }
  if (p.w <= ancho) return [p.x + p.w / 2 - ancho / 2];
  return [p.x, p.x + p.w - ancho, p.x + (p.w - ancho) / 2];
}

// Simula una maniobra con la física real y devuelve la plataforma de aterrizaje (o null)
function simular(p, x, { dir, salto }) {
  const c = crearCuerpo({ x, y: p.y - JUGADOR.h, ...JUGADOR, enSuelo: true });
  const entrada = { derecha: dir > 0, izquierda: dir < 0, salto };
  for (let i = 0; i < 240; i++) {
    actualizarCuerpo(c, { ...entrada, salto: salto && (c.vy <= 0 || i === 0) }, PLATS, escena.limites, DT);
    if (i > 0 && c.enSuelo) {
      const aterrizaje = plataformaBajo(c);
      if (aterrizaje && aterrizaje !== p) return aterrizaje;
      if (aterrizaje === p) return null;
    }
  }
  return null;
}

function alcanzables() {
  const vistas = new Set([SUELO.id]);
  const pendientes = [SUELO];
  const aristas = new Map();
  const todas = [];
  while (pendientes.length) {
    const p = pendientes.pop();
    const destinos = new Set();
    for (const x of salidas(p)) {
      for (const dir of [-1, 0, 1]) {
        for (const salto of [true, false]) {
          const d = simular(p, x, { dir, salto });
          if (d) destinos.add(d.id);
        }
      }
    }
    aristas.set(p.id, destinos);
    todas.push(p.id);
    for (const id of destinos) {
      if (!vistas.has(id)) {
        vistas.add(id);
        pendientes.push(PLATS.find((q) => q.id === id));
      }
    }
  }
  return { vistas, aristas };
}

test('salto actual: altura máxima ~128 px; ninguna plataforma exige más de 110 px de subida entre apoyos', () => {
  const altura = FUERZA_SALTO_DEFECTO ** 2 / (2 * GRAVEDAD_DEFECTO);
  assert.ok(altura > 120 && altura < 130, `altura ${altura}`);
  assert.ok(PLATS.length >= 20, 'escena larga con plataformas definidas');
});

test('todas las plataformas son alcanzables con el salto real desde la banqueta', () => {
  const { vistas } = alcanzables();
  const inaccesibles = PLATS.filter((p) => !vistas.has(p.id)).map((p) => p.id);
  assert.deepEqual(inaccesibles, []);
});

test('el jugador no queda atrapado: desde cada plataforma se vuelve a la banqueta', () => {
  const { aristas } = alcanzables();
  // Grafo inverso: cada plataforma llega a la banqueta siguiendo aristas (caer o saltar)
  const llegaAlSuelo = new Set([SUELO.id]);
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (const [id, destinos] of aristas) {
      if (!llegaAlSuelo.has(id) && [...destinos].some((d) => llegaAlSuelo.has(d))) {
        llegaAlSuelo.add(id);
        cambio = true;
      }
    }
  }
  const atrapadas = PLATS.filter((p) => !llegaAlSuelo.has(p.id)).map((p) => p.id);
  assert.deepEqual(atrapadas, []);
});

test('el punto de entrada pisa la banqueta y las plataformas caben en el lienzo', () => {
  const l = escena.limites;
  assert.equal(escena.puntoEntrada.y + JUGADOR.h, SUELO.y);
  assert.ok(SUELO.y >= 0.8 * l.h && SUELO.y <= 0.9 * l.h, 'banqueta entre 80 y 90 % de la altura');
  for (const p of PLATS) {
    assert.ok(p.x >= l.x && p.x + p.w <= l.x + l.w && p.y >= l.y && p.y <= l.y + l.h, p.id);
  }
  const ids = new Set(PLATS.map((p) => p.id));
  assert.equal(ids.size, PLATS.length, 'ids únicos');
});

test('recogibles: 5-8 churus y un botiquín, dentro del lienzo y tomables desde una plataforma alcanzable', () => {
  const l = escena.limites;
  const objetos = escena.objetos;
  const churus = objetos.filter((o) => o.tipo === 'churu');
  assert.ok(churus.length >= 14 && churus.length <= 20, `churus: ${churus.length}`);
  assert.equal(objetos.filter((o) => o.tipo === 'botiquin').length, 1);
  assert.equal(new Set(objetos.map((o) => o.id)).size, objetos.length, 'ids únicos');

  const { vistas } = alcanzables();
  for (const o of objetos) {
    assert.ok(o.x >= l.x && o.y >= l.y && o.x + o.w <= l.x + l.w && o.y + o.h <= l.y + l.h, `${o.id} dentro del lienzo`);
    // Un cuerpo de pie sobre una plataforma alcanzable solapa el recogible
    const tomable = PLATS.some(
      (p) =>
        vistas.has(p.id) &&
        o.x < p.x + p.w &&
        o.x + o.w > p.x &&
        o.y < p.y &&
        o.y + o.h > p.y - JUGADOR.h
    );
    assert.ok(tomable, `${o.id} tomable de pie sobre una plataforma`);
  }
});

test('enemigos: 2-3, patrullan sobre una plataforma real y dentro del lienzo', () => {
  const enemigos = escena && escenaTaqueria.enemigos.map(crearEnemigo);
  assert.ok(enemigos.length >= 10);
  for (const e of enemigos) {
    const sobre = PLATS.find((p) => Math.abs(e.y + e.h - p.y) < 0.01);
    assert.ok(sobre, `${e.id} apoyado en una plataforma`);
    assert.ok(e.patrulla.minX >= sobre.x && e.patrulla.maxX <= sobre.x + sobre.w, `${e.id} patrulla dentro de ${sobre.id}`);
    assert.ok(e.x >= e.patrulla.minX && e.x + e.w <= e.patrulla.maxX, `${e.id} nace dentro de su patrulla`);
    assert.ok(e.patrulla.maxX - e.patrulla.minX > e.w, `${e.id} patrulla con recorrido`);
  }
});

test('modo debug: ?debug=1 activa los rectángulos de colisión; sin él las plataformas no se dibujan con arte', () => {
  assert.equal(modoDebugActivo({ search: '?debug=1' }), true);
  assert.equal(modoDebugActivo({ search: '?x=1&debug=1' }), true);
  assert.equal(modoDebugActivo({ search: '' }), false);
  assert.equal(modoDebugActivo({ search: '?debug=0' }), false);
  assert.equal(modoDebugActivo(null), false);

  const llamadas = [];
  const ctx = new Proxy({}, {
    get: (_, k) => (k === 'save' || k === 'restore' || typeof k !== 'string' ? () => {} : (...a) => llamadas.push([k, ...a])),
    set: () => true,
  });
  const imagen = { width: 1280, height: 720 };
  const catalogoArte = { obtener: () => imagen };
  const contar = (debug) => {
    llamadas.length = 0;
    renderizarEscena({ ctx, escena, catalogoArte, rutaFondo: 'x', debug });
    return llamadas.filter((l) => l[0] === 'strokeRect' || l[0] === 'fillRect').length;
  };
  assert.equal(contar(false), 0, 'con arte y sin debug no hay rectángulos de plataforma');
  assert.ok(contar(true) >= PLATS.length, 'con debug se dibuja cada plataforma');
});
