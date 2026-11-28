// Visual palette only. Terrain, paths, entities and fog come from the simulation.
export const colors = {
  meadow: '#769154', canopy: '#486b41', clearing: '#b7a977',
  hillside: '#85866a', shore: '#a2a16d', water: '#267479',
  fog: '#162b27', hidden: '#13241f',
  friendly: '#d9ee8e', rival: '#eaa271', brote: '#c3dd68', prisma: '#80ece9'
};

function hash(x, z, seed) {
  return (Math.imul(x + seed, 374761393) ^ Math.imul(z - seed, 668265263)) >>> 0;
}

export function sample(x, z, seed) {
  const n = hash(x, z, seed);
  return ((Math.imul(n ^ (n >>> 13), 1274126177) >>> 0) % 65536) / 65535;
}

// Large coherent patches keep the board legible, with small per-tile variation.
export function groundTone(x, z, terrain, seed) {
  const clearing = Math.max(0, 1 - Math.hypot((x - 8.5) * .92, (z - 24.5) * .72) / 7,
    1 - Math.hypot((x - 39.5) * .92, (z - 24.5) * .72) / 7);
  const seedAngle = (seed % 211) / 17;
  const woodland = .5 + .25 * Math.sin(x * .36 + z * .14 + seedAngle) + .23 * Math.cos(z * .45 - x * .16);
  const variation = sample(x, z, seed);
  if (terrain === 2) return ['water', 'shore', .12 * variation];
  if (terrain === 1) return ['hillside', 'canopy', .15 + .29 * woodland];
  if (clearing > .07) return ['meadow', 'clearing', Math.min(.94, clearing * 1.2 + variation * .12)];
  return ['meadow', 'canopy', .1 + woodland * .57 + variation * .12];
}
