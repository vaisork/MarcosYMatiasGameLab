import test from 'node:test';
import assert from 'node:assert/strict';
import { colors, groundTone, sample } from '../src/render/nimbora.mjs';
import { makeMap } from '../src/path/grid.mjs';

test('terrain tints are deterministic, bounded and use the map palette', () => {
  for (const seed of [917, 1, 4294967295]) {
    const map = makeMap(seed);
    for (const [i, terrain] of map.terrain.entries()) {
      const x = i % map.size, z = Math.floor(i / map.size);
      const tone = groundTone(x, z, terrain, seed);
      const [a, b, mix] = tone;
      assert.deepEqual(tone, groundTone(x, z, terrain, seed));
      assert.ok(colors[a] && colors[b] && mix >= 0 && mix <= 1);
      const n = sample(x, z, seed);
      assert.ok(n >= 0 && n <= 1);
      if (terrain === 2) assert.equal(a, 'water');
    }
  }
});

test('forest palette frames the bases without marking another playable tile type', () => {
  for (const x of [8, 39]) {
    const [ground, clearing, amount] = groundTone(x, 24, 0, 917);
    assert.equal(ground, 'meadow');
    assert.equal(clearing, 'clearing');
    assert.ok(amount > .9);
  }
  assert.equal(groundTone(24, 24, 0, 917)[1], 'canopy');
});
