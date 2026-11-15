import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseBalance, FARO } from '../src/content/catalog.mjs';
import { createGame, enqueue, issue, placeBuilding, stateHash, step } from '../src/sim/engine.mjs';

const csv = await readFile(new URL('../docs/balance.csv', import.meta.url), 'utf8');
const catalog = parseBalance(csv);
const fresh = seed => createGame({ seed, catalog });

test('loads all Dosel units and buildings directly from balance.csv', () => {
  assert.equal(catalog.filter(x => x.clan === 'Dosel' && x.tipo === 'unidad').length, 8);
  assert.equal(catalog.filter(x => x.clan === 'Dosel' && x.tipo === 'edificio').length, 8);
  assert.equal(catalog.filter(x => x.clan === 'Dosel' && x.tipo === 'heroe').length, 2);
  assert.equal(catalog.find(x => x.nombre === 'Musgaguarda').vida, 270);
  assert.equal(FARO.nombre, 'Faro de Concordia');
});

test('heroes use the separate four population slots', () => {
  const game = fresh(36), workshop = placeBuilding(game, 0, 'Taller de Brotes', 12, 27);
  workshop.complete = true;
  assert.equal(enqueue(game, 0, 'Brizna'), true);
  assert.equal(game.players[0].queue[0].pop, 4);
});

test('worker gathers Brote and returns cargo to the base', () => {
  const game = fresh(31), p = game.players[0], worker = game.entities.find(e => e.owner === 0 && e.name === 'Semillero'), node = game.map.resources.find(r => r.kind === 'Brote');
  node.x = worker.x; node.z = worker.z; node.amount = 100;
  const before = p.resources.Brote;
  issue(game, { action: 'gather', ids: [worker.id], x: node.x, z: node.z, targetId: node.id });
  step(game, 240);
  assert.ok(p.resources.Brote > before);
  assert.ok(node.amount < 100);
});

test('workers complete a building and buildings expand population', () => {
  const game = fresh(32), worker = game.entities.find(e => e.owner === 0 && e.name === 'Semillero');
  const site = placeBuilding(game, 0, 'Refugio de Polen', worker.x + 1, worker.z);
  assert.ok(site);
  issue(game, { action: 'build', ids: [worker.id], x: site.x, z: site.z, targetId: site.id });
  step(game, 24 * 30 + 20);
  assert.equal(site.complete, true);
  assert.equal(game.players[0].population, 20);
});

test('production queue consumes cost and creates a unit at the workshop', () => {
  const game = fresh(33), p = game.players[0];
  const workshop = placeBuilding(game, 0, 'Taller de Brotes', 12, 27);
  workshop.complete = true;
  const before = p.resources.Brote;
  assert.equal(enqueue(game, 0, 'Zarzapaso'), true);
  assert.equal(p.resources.Brote, before - 70);
  step(game, 18 * 30);
  assert.equal(p.queue.length, 0);
  assert.equal(game.entities.filter(e => e.owner === 0 && e.name === 'Zarzapaso').length, 2);
});

test('attack order damages target and defeated unit fades as stars', () => {
  const game = fresh(34), attacker = game.entities.find(e => e.owner === 0 && e.name === 'Semillero'), target = game.entities.find(e => e.owner === 1 && e.name === 'Remachador');
  attacker.x = target.x + .5; attacker.z = target.z;
  const hp = target.hp;
  issue(game, { action: 'attack', ids: [attacker.id], x: target.x, z: target.z, targetId: target.id });
  step(game, 18);
  assert.equal(target.hp, hp - attacker.stats.danio);
  target.hp = 0; target.stars = 20;
  step(game, 20);
  assert.equal(game.entities.includes(target), false);
});

test('attack order damages an enemy building', () => {
  const game = fresh(37), attacker = game.entities.find(e => e.owner === 0 && e.name === 'Lanzafruto'), target = game.entities.find(e => e.owner === 1 && e.name === 'Patio de Remaches');
  attacker.x = target.x + 1; attacker.z = target.z + 1;
  const hp = target.hp;
  issue(game, { action: 'attack', ids: [attacker.id], x: target.x, z: target.z, targetId: target.id });
  step(game, 18);
  assert.equal(target.hp, hp - attacker.stats.danio);
});

test('queue accepts five units and rejects a sixth', () => {
  const game = fresh(38), workshop = placeBuilding(game, 0, 'Taller de Brotes', 12, 27);
  workshop.complete = true;
  game.players[0].population = 100;
  for (let i = 0; i < 5; i++) assert.equal(enqueue(game, 0, 'Zarzapaso'), true);
  assert.equal(game.players[0].queue.length, 5);
  assert.equal(enqueue(game, 0, 'Zarzapaso'), false);
});

test('full population blocks production', () => {
  const game = fresh(39), workshop = placeBuilding(game, 0, 'Taller de Brotes', 12, 27);
  workshop.complete = true;
  game.players[0].population = game.players[0].used;
  assert.equal(enqueue(game, 0, 'Zarzapaso'), false);
});

test('same seed and ordered commands produce the same state hash', () => {
  const a = fresh(8675309), b = fresh(8675309);
  const units = a.entities.filter(e => e.owner === 0 && e.type === 'unit');
  issue(a, { action: 'move', ids: [units[0].id, units[1].id], x: 18, z: 22 });
  issue(b, { action: 'move', ids: [units[0].id, units[1].id], x: 18, z: 22 });
  for (let i = 0; i < 30; i++) step(a, 10);
  step(b, 300);
  assert.equal(stateHash(a), stateHash(b));
});

test('building the concordance beacon wins by the alternative objective', () => {
  const game = fresh(35), worker = game.entities.find(e => e.owner === 0 && e.name === 'Semillero');
  game.players[0].resources.Prisma = 300;
  const beacon = placeBuilding(game, 0, FARO.nombre, worker.x + 1, worker.z);
  assert.ok(beacon);
  beacon.complete = true;
  step(game);
  assert.deepEqual(game.result, { winner: 0, reason: 'Faro de Concordia' });
});
