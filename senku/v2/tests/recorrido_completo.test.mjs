// Recorrido completo sin navegador: con la física real (core/movilidad.mjs → core/fisica.mjs) y los
// datos de cada escena, explora todo lo que Senku puede alcanzar desde la entrada.
// Estados = Senku parado sobre una plataforma (celdas de 16 px). Desde cada uno se simulan
// caminatas, saltos (cortos, largos, con giro tardío) y, en el despeñadero, disparos del anclador
// a varios ángulos. Así se comprueba: churus y secretos alcanzables, salida alcanzable y que
// desde ningún punto alcanzable Senku quede atascado sin poder llegar a la salida.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearCuerpo, actualizarCuerpo, solapanAABB, solapanRecogible,
  ANCHO_GATO_JUEGO, ALTURA_GATO_JUEGO, FUERZA_SALTO_DEFECTO, GRAVEDAD_DEFECTO } from '../src/core/fisica.mjs';
import { pasoMovilidad } from '../src/core/movilidad.mjs';
import { crearAnclador } from '../src/core/anclador.mjs';
import { validarEscena } from '../src/core/escenas.mjs';
import { escenaCiudad } from '../src/data/escenas/ciudad.mjs';
import { escenaTaqueria } from '../src/data/escenas/taqueria.mjs';
import { escenaReja } from '../src/data/escenas/reja.mjs';
import { escenaDesierto } from '../src/data/escenas/desierto.mjs';
import { escenaDespenadero } from '../src/data/escenas/despenadero.mjs';
import { escenaCima, ARENA, SUELO_CIMA } from '../src/data/escenas/cima.mjs';
import { crearJefe, despertar, actualizarJefe, golpearJefe, danoAJugador, esPisoton } from '../src/core/jefe_gato.mjs';
import { crearLanzador, actualizarDisparo, actualizarProyectiles } from '../src/core/lanzador.mjs';
import { crearEstadoCombate, aplicarGolpeJugador, actualizarCombate } from '../src/core/combate.mjs';
import { finalizarPartida as finalCamion } from '../src/bonus_camion.mjs';
import { finalizarPartida as finalCamioneta } from '../src/bonus_camioneta.mjs';
import { estadoNuevo, guardar } from '../src/core/store.mjs';
import { memoria } from './ayuda.mjs';

const DT = 1 / 60;
const CELDA = 16;
const ANGULOS = [-10, 0, 10, 20, 30, 45, 60, 75];

function cuerpoEn(x, y) {
  return crearCuerpo({ x, y, w: ANCHO_GATO_JUEGO, h: ALTURA_GATO_JUEGO });
}

function plataformaBajoPies(c, plats) {
  const pies = c.y + c.h;
  return plats.find((p) => p.tipo !== 'anclaje' && Math.abs(p.y - pies) < 0.5
    && c.x + c.w > p.x && c.x < p.x + p.w);
}

// Cada macro crea una función (t, cuerpo, anclador) → entrada, o null cuando ya no hay entrada.
function macros(caps) {
  const lista = [];
  for (const dir of [-1, 1]) {
    for (const dur of [0.08, 0.5, 2]) lista.push(() => (t) => (t < dur ? { izquierda: dir < 0, derecha: dir > 0 } : null));
  }
  for (const dir of [-1, 0, 1]) {
    for (const mantener of [0.05, 0.15, Infinity]) {
      for (const retraso of dir ? [0, 0.2] : [0]) {
        lista.push(() => (t) => (t < 3 ? {
          salto: t < mantener, izquierda: dir < 0 && t >= retraso, derecha: dir > 0 && t >= retraso,
        } : null));
      }
    }
  }
  if (caps.anclador) {
    for (const dir of [-1, 1]) {
      for (const angulo of ANGULOS) {
        lista.push(() => { let fase = 'mirar'; return (t, c, a) => {
          if (fase === 'mirar') { fase = 'apuntar'; return { izquierda: dir < 0, derecha: dir > 0 }; }
          if (fase === 'apuntar') {
            if (a.estado === 'apuntando' && a.angulo >= angulo) { fase = 'volar'; return {}; }
            return { anclar: true };
          }
          // Agarrado a la pared tras el jalón: trepar.
          if (c.agarrado) return { salto: true };
          return t < 4 ? {} : null;
        }; });
      }
    }
  }
  return lista;
}

function explorar(definicion, { caps = {}, metas = [], alturaCaida = null } = {}) {
  const escena = validarEscena(definicion).escena;
  const plats = escena.plataformas;
  const opciones = { tieneAnclador: Boolean(caps.anclador), tieneGarras: Boolean(caps.garras) };
  const objetos = escena.objetos;
  const tocados = new Set();
  const llegaMeta = new Set();
  const aristas = new Map();
  const estados = new Map();
  const clave = (c) => {
    const p = plataformaBajoPies(c, plats);
    return p ? `${p.id}:${Math.round(c.x / CELDA)}` : null;
  };

  function revisar(c, origen) {
    for (const o of objetos) if (!tocados.has(o.id) && solapanRecogible(c, o)) tocados.add(o.id);
    for (const m of metas) if (m(c)) llegaMeta.add(origen);
  }

  // Punto de entrada: cae hasta posarse.
  const inicio = cuerpoEn(escena.puntoEntrada.x, escena.puntoEntrada.y);
  for (let i = 0; i < 240 && !inicio.enSuelo; i++) pasoMovilidad(inicio, null, {}, plats, escena.limites, DT, opciones);
  const claveInicio = clave(inicio);
  assert.ok(claveInicio, `${escena.id}: el punto de entrada debe caer sobre una plataforma`);
  estados.set(claveInicio, { x: inicio.x, y: inicio.y });
  const cola = [claveInicio];
  const lista = macros(caps);

  while (cola.length) {
    const k = cola.shift();
    const { x, y } = estados.get(k);
    const salidas = new Set();
    aristas.set(k, salidas);
    for (const crearMacro of lista) {
      const macro = crearMacro();
      const c = cuerpoEn(x, y);
      c.enSuelo = true;
      const a = crearAnclador();
      revisar(c, k);
      let enAire = false;
      let destino = null;
      for (let t = 0; t < 6; t += DT) {
        const e = macro(t, c, a);
        pasoMovilidad(c, a, e || {}, plats, escena.limites, DT, opciones);
        revisar(c, k);
        if (alturaCaida && c.y + c.h > alturaCaida) { destino = claveInicio; break; }
        if (!c.enSuelo || c.agarrado || a.estado !== 'guardado') enAire = true;
        const quieto = c.enSuelo && !c.agarrado && a.estado === 'guardado';
        if (quieto && ((enAire && !e?.anclar) || (!e && Math.abs(c.vx) < 5))) { destino = clave(c); break; }
      }
      if (!destino) continue;
      salidas.add(destino);
      if (!estados.has(destino)) {
        const p = plats.find((q) => destino.startsWith(`${q.id}:`));
        estados.set(destino, { x: c.x, y: p.y - c.h });
        cola.push(destino);
      }
    }
    assert.ok(estados.size < 6000, `${escena.id}: exploración desbordada`);
  }

  // Estados desde los que se llega a la meta (búsqueda hacia atrás).
  const inversa = new Map();
  for (const [o, ds] of aristas) for (const d of ds) (inversa.get(d) || inversa.set(d, []).get(d)).push(o);
  const salvan = new Set(llegaMeta);
  const pendientes = [...llegaMeta];
  while (pendientes.length) for (const o of inversa.get(pendientes.pop()) || []) if (!salvan.has(o)) { salvan.add(o); pendientes.push(o); }
  const atascos = [...estados.keys()].filter((s) => !salvan.has(s));
  return { escena, estados, tocados, llegaMeta, atascos };
}

const tocaDisparador = (escena, id) => {
  const d = escena.disparadores.find((x) => x.id === id);
  assert.ok(d, `${escena.id} debe tener el disparador ${id}`);
  return (c) => solapanAABB(c, d);
};

function comprobarEscena(definicion, idSalida, extra = {}) {
  const r = explorar(definicion, { metas: [tocaDisparador(definicion, idSalida)], ...extra });
  const faltan = r.escena.objetos.filter((o) => !r.tocados.has(o.id)).map((o) => o.id);
  assert.deepEqual(faltan, [], `${r.escena.id}: objetos inalcanzables`);
  for (const s of r.escena.secretos) assert.ok(r.tocados.has(s), `${r.escena.id}: secreto ${s} inalcanzable`);
  assert.ok(r.llegaMeta.size > 0, `${r.escena.id}: la salida ${idSalida} no se alcanza`);
  assert.deepEqual(r.atascos, [], `${r.escena.id}: lugares donde Senku queda atascado`);
  return r;
}

test('el salto máximo de Senku ronda los 128 px (base del análisis)', () => {
  const c = cuerpoEn(0, 510);
  c.enSuelo = true;
  let minY = c.y;
  for (let t = 0; t < 1.5; t += DT) {
    actualizarCuerpo(c, { salto: true }, [{ x: -1000, y: 600, w: 3000, h: 10 }], null, DT);
    minY = Math.min(minY, c.y);
  }
  const alto = 510 - minY;
  const teorico = FUERZA_SALTO_DEFECTO ** 2 / (2 * GRAVEDAD_DEFECTO);
  assert.ok(Math.abs(alto - teorico) < 12 && alto > 115 && alto < 135, `alto=${alto}`);
});

test('orden de escenas: ciudad → camión → taquería → camioneta → reja → desierto → despeñadero → cima', () => {
  const sub = (e, id) => e.disparadores.find((d) => d.id === id);
  assert.equal(sub(escenaCiudad, 'camion').destino, 'taqueria');
  assert.equal(sub(escenaCiudad, 'camion').rutaBonus, './bonus-camion.html');
  const camioneta = sub(escenaTaqueria, 'camioneta');
  assert.equal(camioneta.destino, 'reja');
  assert.equal(camioneta.requiere, 'llave-camioneta');
  assert.equal(escenaTaqueria.recompensaFinal.id, 'llave-camioneta');
  assert.equal(sub(escenaReja, 'entrada-desierto').destino, 'desierto');
  assert.equal(sub(escenaDesierto, 'hacia-despenadero').destino, 'despenadero');
  assert.equal(sub(escenaDespenadero, 'hacia-cima').destino, 'cima');
  assert.equal(escenaCima.disparadores.length, 0, 'la cima es la última escena');
  // Los bonus devuelven al juego en la escena siguiente.
  for (const [fin, esperada] of [[finalCamion, 'taqueria'], [finalCamioneta, 'reja']]) {
    const almacen = memoria();
    guardar(almacen, estadoNuevo());
    assert.equal(fin(almacen, { fase: 'fin', churus: 3 }).estado.progreso.escena, esperada);
  }
  // Cada punto de entrada de un disparador cae dentro de la escena destino.
  const porId = { desierto: escenaDesierto, despenadero: escenaDespenadero, cima: escenaCima };
  for (const d of [sub(escenaReja, 'entrada-desierto'), sub(escenaDesierto, 'hacia-despenadero'), sub(escenaDespenadero, 'hacia-cima')]) {
    const destino = porId[d.destino];
    assert.ok(d.puntoEntrada.x >= 0 && d.puntoEntrada.x + ANCHO_GATO_JUEGO < destino.limites.w, d.id);
    const r = explorar({ ...destino, puntoEntrada: d.puntoEntrada });
    assert.ok(r.estados.size > 0, d.id);
  }
});

test('ciudad: todos los churus alcanzables y el camión al alcance desde cualquier punto', () => {
  comprobarEscena(escenaCiudad, 'camion');
});

test('taquería: churus y secretos alcanzables, enemigos al alcance y la camioneta sin atascos', () => {
  const r = comprobarEscena(escenaTaqueria, 'camioneta');
  // La llave sólo cae al vencer a todos: cada enemigo patrulla sobre un apoyo que Senku pisa.
  for (const e of escenaTaqueria.enemigos) {
    const pies = e.y + e.h;
    const apoyo = [...r.estados.keys()].some((k) => {
      const [id, celda] = k.split(':');
      const p = r.escena.plataformas.find((q) => q.id === id);
      const x = Number(celda) * CELDA;
      return p.y === pies && x + ANCHO_GATO_JUEGO > e.patrulla.minX && x < e.patrulla.maxX;
    });
    assert.ok(apoyo, `enemigo ${e.id} fuera del alcance de un pisotón`);
  }
  // La llave cae sobre la banqueta, dentro de la calle.
  const llave = escenaTaqueria.recompensaFinal;
  assert.equal(llave.y + llave.h, 594);
  assert.ok(llave.x > 0 && llave.x < escenaTaqueria.limites.w);
});

test('reja: siete pantallas recorribles, churus y secretos alcanzables, salida al desierto', () => {
  comprobarEscena(escenaReja, 'entrada-desierto');
});

test('desierto: churus y secretos alcanzables, salida al despeñadero', () => {
  comprobarEscena(escenaDesierto, 'hacia-despenadero');
});

test('despeñadero: sin anclador no se cruza; con anclador y garras se llega a la cima sin atascos', () => {
  const sin = explorar(escenaDespenadero, { metas: [tocaDisparador(escenaDespenadero, 'hacia-cima')],
    alturaCaida: escenaDespenadero.alturaCaida });
  assert.equal(sin.llegaMeta.size, 0, 'el abismo exige el anclador');
  assert.ok(sin.tocados.has('anclador-despenadero'), 'el anclador está antes del abismo');
  // Con el anclador: llega a la repisa de las garras. Con ambas: todo el nivel.
  const conAnclador = explorar(escenaDespenadero, { caps: { anclador: true },
    alturaCaida: escenaDespenadero.alturaCaida });
  assert.ok(conAnclador.tocados.has('garras-despenadero'), 'las garras se alcanzan con el anclador');
  // Al tomar las garras Senku ya tiene el anclador: ambos poderes desde el inicio cubren el nivel.
  comprobarEscena(escenaDespenadero, 'hacia-cima', {
    caps: { anclador: true, garras: true }, alturaCaida: escenaDespenadero.alturaCaida,
  });
});

test('cima: el lanzador y los churus se alcanzan y se entra a la arena del jefe', () => {
  const r = explorar(escenaCima, { metas: [(c) => c.x > ARENA.minX + 40] });
  assert.deepEqual(escenaCima.objetos.filter((o) => !r.tocados.has(o.id)).map((o) => o.id), []);
  assert.ok(r.llegaMeta.size > 0);
  assert.deepEqual(r.atascos, []);
});

test('el Gato Mecánico (más difícil) se puede vencer con el lanzador saltando ondas y embestidas', () => {
  const plats = validarEscena(escenaCima).escena.plataformas;
  const limites = { minX: ARENA.minX, maxX: ARENA.maxX };
  const senku = cuerpoEn(ARENA.minX + 60, SUELO_CIMA - ALTURA_GATO_JUEGO);
  senku.enSuelo = true;
  const jefe = crearJefe({ x: 2200, suelo: SUELO_CIMA, arenaMinX: ARENA.minX, arenaMaxX: ARENA.maxX });
  despertar(jefe);
  const lanzador = crearLanzador();
  const combate = crearEstadoCombate({ hpMax: 100, hpInicial: 100, tiempoInvulnerabilidad: 1 });
  let azar = 0.3;
  const aleatorio = () => (azar = (azar * 9301 + 49297) % 233280 / 233280);
  let t = 0;
  for (; t < 90 && !jefe.derrotado; t += DT) {
    // Jugador sencillo: mira al jefe, dispara sin parar y salta las ondas que se acercan.
    const centroJefe = jefe.x + jefe.w / 2;
    const derecha = centroJefe > senku.x + senku.w / 2;
    const onda = jefe.ondas.some((o) => Math.abs(o.x + o.w / 2 - (senku.x + senku.w / 2)) < 160);
    // Con el jefe más difícil (31/10) también hay que saltar la embestida.
    const cerca = Math.abs(centroJefe - (senku.x + senku.w / 2)) < 300;
    const embiste = cerca && (jefe.estado === 'embestida' || jefe.estado === 'acecho');
    const entrada = { atacar: Math.floor(t / DT) % 2 === 0, salto: onda || embiste, derecha: derecha && senku.mirando < 0, izquierda: !derecha && senku.mirando > 0 };
    actualizarDisparo(lanzador, senku, entrada, DT);
    actualizarCuerpo(senku, entrada, plats, limites, DT);
    for (const i of actualizarProyectiles(lanzador, DT, [jefe])) golpearJefe(i.objetivo, 1);
    actualizarJefe(jefe, senku, DT, aleatorio);
    if (esPisoton(jefe, senku) && golpearJefe(jefe, 1)) senku.vy = -620;
    const dano = danoAJugador(jefe, senku);
    if (dano > 0) aplicarGolpeJugador(combate, dano);
    actualizarCombate(combate, DT);
    assert.ok(combate.hp > 0, `Senku perdió a los ${t.toFixed(1)} s (jefe hp ${jefe.hp})`);
  }
  assert.equal(jefe.derrotado, true, `el jefe sigue con ${jefe.hp} HP`);
  assert.ok(t < 60, `la pelea dura ${t.toFixed(1)} s`);
});
