// Arreglos pedidos por Matías (31/10/2026) en los dos bonus: zanates que se van, fin al llegar
// al tope de churus, 30 s como máximo y 3 corazones que sí se pueden perder.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as V from '../src/bonus_camioneta.mjs';
import * as C from '../src/bonus_camion.mjs';

const DT = 1 / 60;
const W = 390, H = 844; // celular vertical

// Bot de camioneta que «juega bien»: salta ahora sólo si esperar no sale mejor (churus + corazones).
function valorCamioneta(p, espera) {
  const q = structuredClone(p); q.siguienteObjeto = 1e9;
  for (let t = 0; t < espera + 0.9; t += DT) V.avanzarJuego(q, { salto: t >= espera && t < espera + 0.05 }, DT, W, H);
  return q.churus + 10 * q.vidas;
}
function botCamioneta(p) {
  if (p.senku.alto > 0) return {};
  const ahora = valorCamioneta(p, 0);
  for (let k = 0.05; k < 0.9; k += 0.05) if (valorCamioneta(p, k) > ahora) return {};
  return { salto: ahora > valorCamioneta(p, 2) };
}
function jugarCamioneta(bot, alPaso = () => {}) {
  let p = { ...V.crearPartida(), fase: 'jugando', cuenta: 0 };
  while (p.fase === 'jugando') {
    V.avanzarJuego(p, bot ? bot(p) : {}, DT, W, H);
    alPaso(p);
    p = Object.assign(p, V.avanzarReloj(p, DT));
  }
  return p;
}

// Bot de camión: se pone a la altura del siguiente churu y salta los obstáculos de su nivel.
function botCamion(p) {
  const px = W * (0.15 + p.senkuX * 0.45);
  const obstaculo = p.objetos.find((o) => o.tipo !== 'churu' && o.x > px - 20 && o.x < px + 90);
  if (obstaculo && Math.abs(p.nivel - obstaculo.nivel) <= 0.88) return { salto: true };
  const churu = p.objetos.filter((o) => o.tipo === 'churu' && o.x > px - 10).sort((a, b) => a.x - b.x)[0];
  if (!churu) return {};
  const meta = [0.24, 0.5, 0.76][churu.nivel];
  return { izquierda: p.senkuX > meta + 0.04, derecha: p.senkuX < meta - 0.04 };
}
function jugarCamion(bot) {
  let p = { ...C.crearPartida(), fase: 'jugando', cuenta: 0 };
  while (p.fase === 'jugando') {
    C.avanzarMundo(p, DT, bot ? bot(p) : {}, W);
    p = Object.assign(p, C.avanzarReloj(p, DT));
  }
  return p;
}

test('camioneta: el zanate que pica a Senku se aleja volando y sale de la pantalla (no se queda girando)', () => {
  const g = V.geometria(W, H);
  const p = { ...V.crearPartida(), fase: 'jugando', siguienteObjeto: 1e9 };
  const px = g.xSenku(p.senku.pos);
  p.objetos.push({ tipo: 'zanate', x: px, altura: g.gato * .35 - 14, fase: 0, golpeado: false });
  V.avanzarJuego(p, {}, 0, W, H);
  const zanate = p.objetos[0];
  assert.equal(zanate.golpeado, true);
  const x0 = zanate.x, a0 = zanate.altura;
  V.avanzarJuego(p, {}, 0.1, W, H);
  assert.ok(zanate.x < x0 && zanate.altura > a0, 'se aleja hacia arriba y a la izquierda');
  for (let t = 0; t < 1.5; t += DT) V.avanzarJuego(p, {}, DT, W, H);
  assert.equal(p.objetos.filter((o) => o.tipo === 'zanate').length, 0, 'ya salió de la pantalla');
});

test('camioneta: en 30 s nunca hay zanates amontonados ni pegados a Senku', () => {
  const g = V.geometria(W, H);
  let maxCerca = 0;
  jugarCamioneta(null, (p) => {
    const vivos = p.objetos.filter((o) => o.tipo === 'zanate');
    const cerca = vivos.filter((o) => Math.abs(o.x - g.xSenku(p.senku.pos)) < g.gato * 2).length;
    maxCerca = Math.max(maxCerca, cerca);
    for (let i = 0; i < vivos.length; i++) for (let j = i + 1; j < vivos.length; j++) {
      assert.ok(Math.hypot(vivos[i].x - vivos[j].x, vivos[i].altura - vivos[j].altura) > g.gato, 'zanates solapados');
    }
  });
  assert.ok(maxCerca <= 1, `zanates junto a Senku a la vez: ${maxCerca}`);
});

for (const [nombre, M] of [['camioneta', V], ['camión', C]]) {
  test(`${nombre}: dura 30 s como máximo, 3 corazones y termina al llegar al tope de churus`, () => {
    assert.equal(M.DURACION, 30);
    assert.equal(M.VIDAS_BONUS, 3);
    assert.equal(M.crearPartida().vidas, 3);
    const lleno = M.avanzarReloj({ ...M.crearPartida(), fase: 'jugando', churus: M.TOPE_CHURUS }, DT);
    assert.equal(lleno.fase, 'fin');
    assert.ok(lleno.restante > 20, 'no espera a que se acabe el tiempo');
    const sinVidas = M.avanzarReloj({ ...M.crearPartida(), fase: 'jugando', churus: 4, vidas: 0 }, DT);
    assert.equal(sinVidas.fase, 'fin');
    assert.equal(sinVidas.churus, 4, 'se queda con los churus que llevaba');
  });
}

test('camioneta: cada zanate quita un corazón con invulnerabilidad breve', () => {
  const g = V.geometria(W, H);
  const p = { ...V.crearPartida(), fase: 'jugando', siguienteObjeto: 1e9 };
  const pico = () => p.objetos.push({ tipo: 'zanate', x: g.xSenku(p.senku.pos), altura: g.gato * .35 - 14, fase: 0, golpeado: false });
  pico(); V.avanzarJuego(p, {}, 0, W, H);
  assert.equal(p.vidas, 2);
  pico(); V.avanzarJuego(p, {}, 0, W, H);
  assert.equal(p.vidas, 2, 'invulnerable justo después del golpe');
  p.objetos = []; p.invulnerable = 0;
  pico(); V.avanzarJuego(p, {}, 0, W, H);
  assert.equal(p.vidas, 1);
});

test('camión: cada obstáculo quita un corazón con invulnerabilidad breve', () => {
  const p = { ...C.crearPartida(), fase: 'jugando', siguienteObjeto: 1e9 };
  const px = W * (0.15 + p.senkuX * 0.45);
  p.objetos.push({ tipo: 'rama', x: px, nivel: 1, altura: 26, recogido: false });
  C.avanzarMundo(p, 0.001, {}, W);
  assert.equal(p.vidas, 2);
  assert.ok(p.invulnerable > 0);
  p.objetos.push({ tipo: 'cable', x: px, nivel: 1, altura: 26, recogido: false });
  C.avanzarMundo(p, 0.001, {}, W);
  assert.equal(p.vidas, 2, 'invulnerable justo después del golpe');
});

test('quedarse quieto pierde los corazones y no llega al tope; jugando bien sí se llega a 30', () => {
  for (const [nombre, jugar, bot] of [['camioneta', jugarCamioneta, botCamioneta], ['camión', jugarCamion, botCamion]]) {
    const quieto = jugar(null);
    assert.equal(quieto.vidas, 0, `${nombre}: quieto pierde los 3 corazones`);
    assert.ok(quieto.churus < 15, `${nombre}: quieto junta ${quieto.churus}`);
    const bueno = jugar(bot);
    assert.equal(bueno.churus, 30, `${nombre}: el bot junta ${bueno.churus}`);
    assert.ok(bueno.restante > 0, `${nombre}: termina antes de los 30 s al llegar al tope`);
  }
});
