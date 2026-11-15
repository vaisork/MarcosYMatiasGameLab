import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFlowField, FixedStep } from '../prueba-rendimiento/sim.mjs';

test('flow field reaches target around a blocked tile and keeps obstacles unreachable', () => {
  const blockedCells = new Set([1 + 2 * 5]);
  const field = buildFlowField(5, 5, i => blockedCells.has(i), [4, 2]);
  assert.equal(field.distance[field.goal], 0);
  assert.equal(field.distance[1 + 2 * 5], -1);
  let at = 0;
  for (let i = 0; i < 20 && at !== field.goal; i++) {
    const next = at + field.dx[at] + field.dz[at] * field.width;
    assert.ok(field.distance[next] >= 0 && field.distance[next] < field.distance[at]);
    at = next;
  }
  assert.equal(at, field.goal);
});

test('flow field rejects an invalid goal', () => {
  assert.throws(() => buildFlowField(2, 2, () => false, [2, 0]), /goal/);
  assert.throws(() => buildFlowField(2, 2, i => i === 0, [0, 0]), /goal/);
});

test('fixed step produces same ticks for equivalent elapsed time', () => {
  const a = new FixedStep(0.1), b = new FixedStep(0.1);
  const ticksA = [], ticksB = [];
  a.advance(0.25, (_, tick) => ticksA.push(tick));
  b.advance(0.1, (_, tick) => ticksB.push(tick));
  b.advance(0.15, (_, tick) => ticksB.push(tick));
  assert.deepEqual(ticksA, ticksB);
  assert.deepEqual(ticksA, [0, 1]);
});

test('fixed step caps catch-up work and rejects negative time', () => {
  const sim = new FixedStep(0.1, 3), ticks = [];
  const result = sim.advance(10, (_, tick) => ticks.push(tick));
  assert.equal(result.steps, 3);
  assert.equal(result.tick, 3);
  assert.throws(() => sim.advance(-1, () => {}), /frame time/);
});
