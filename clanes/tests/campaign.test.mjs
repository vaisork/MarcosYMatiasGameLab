import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MISSIONS, isUnlocked, loadProgress, openingResult, saveMission } from '../src/content/campaign.mjs';
import { parseBalance } from '../src/content/catalog.mjs';
import { createGame, issue, step } from '../src/sim/engine.mjs';

const mission = MISSIONS[0], catalog = parseBalance(readFileSync(new URL('../docs/balance.csv', import.meta.url), 'utf8'));
function gather(game, unit, node) { issue(game, { action: 'gather', ids: [unit.id], x: node.x, z: node.z, targetId: node.id }); }

test('first campaign mission played from zero to three stars with no rival', () => {
  const game = createGame({ seed: mission.seed, catalog, mission });
  assert.equal(game.players[0].resources.Brote, 0);
  assert.equal(game.entities.some(e => e.owner === 1), false);
  assert.equal(game.players[1].ai, false);
  step(game, 90);
  assert.equal(game.result, null, 'absence of a rival is not a skirmish victory');
  const workers = game.entities.filter(e => e.type === 'unit');
  const [brote, prisma] = game.map.resources;
  assert.ok(Math.abs(brote.x - game.entities[0].x) > 1, 'long route exercises the return trip');
  gather(game, workers[0], prisma);
  for (const unit of workers.slice(1)) gather(game, unit, brote);
  step(game, 3 * 60 * 30);
  assert.equal(game.result?.stars, 3);
  assert.ok(game.players[0].resources.Brote >= 80 && game.players[0].resources.Prisma >= 10);
});

test('last available load reaches the base exactly once', () => {
  const game = createGame({ seed: mission.seed, catalog, mission });
  const [node] = game.map.resources;
  node.amount = 6;
  gather(game, game.entities.find(e => e.type === 'unit'), node);
  step(game, 600);
  assert.equal(node.amount, 0);
  assert.equal(game.players[0].resources.Brote, 6);
});

test('time and prism are optional; the clock never causes a loss', () => {
  assert.equal(openingResult({ Brote: 79, Prisma: 10 }, 8000), null);
  assert.equal(openingResult({ Brote: 80, Prisma: 0 }, 8000).stars, 1);
  assert.equal(openingResult({ Brote: 80, Prisma: 10 }, 8000).stars, 2);
});

test('campaign keeps the best recorded result and does not link unfinished levels', () => {
  let data = '{corrupt';
  const storage = { getItem: () => data, setItem: (_, value) => { data = value; } };
  assert.deepEqual(loadProgress(storage), {});
  assert.equal(isUnlocked(mission, {}), true);
  assert.equal(saveMission(storage, mission.id, 3), true);
  assert.equal(saveMission(storage, mission.id, 1), true);
  const saved = loadProgress(storage);
  assert.equal(saved[mission.id], 3);
  assert.equal(isUnlocked(MISSIONS[1], saved), false);
  assert.equal(isUnlocked({ ...MISSIONS[1], ready: true }, saved), true);
  assert.equal(saveMission(storage, mission.id, 10), false);
  assert.equal(saveMission({ getItem: () => null, setItem: () => { throw Error('disabled'); } }, mission.id, 3), false);
});
