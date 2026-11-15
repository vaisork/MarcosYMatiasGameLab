export const SIZE = 48;
export const idx = (x, z) => z * SIZE + x;

export function makeMap(seed) {
  let state = seed >>> 0;
  const random = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 4294967296);
  const terrain = new Uint8Array(SIZE * SIZE);
  const resources = [];
  for (let z = 0; z < SIZE; z++) for (let x = 0; x < SIZE; x++) {
    const roll = random(); terrain[idx(x, z)] = roll < .12 ? 1 : roll < .16 ? 2 : 0;
  }
  for (let n = 0; n < 24; n++) {
    const x = 3 + Math.floor(random() * 42), z = 3 + Math.floor(random() * 42);
    if ((x < 13 && z > 16 && z < 32) || (x > 34 && z > 16 && z < 32)) continue;
    resources.push({ id: n + 1, x, z, kind: n % 3 ? 'Brote' : 'Prisma', amount: n % 3 ? 550 : 180, max: n % 3 ? 550 : 180 });
  }
  return { size: SIZE, terrain, resources, fog: [new Uint8Array(SIZE * SIZE), new Uint8Array(SIZE * SIZE)] };
}

export function findPath(map, sx, sz, gx, gz, blocked = new Set()) {
  const start = idx(Math.max(0, Math.min(47, sx | 0)), Math.max(0, Math.min(47, sz | 0)));
  const goal = idx(Math.max(0, Math.min(47, gx | 0)), Math.max(0, Math.min(47, gz | 0)));
  const prev = new Int32Array(SIZE * SIZE).fill(-1), queue = new Int32Array(SIZE * SIZE);
  let head = 0, tail = 0; queue[tail++] = start; prev[start] = start;
  const dirs = [1, -1, SIZE, -SIZE];
  while (head < tail && prev[goal] < 0) {
    const at = queue[head++], x = at % SIZE;
    for (const d of dirs) {
      const next = at + d;
      if (next < 0 || next >= SIZE * SIZE || (Math.abs(d) === 1 && Math.floor(next / SIZE) !== Math.floor(at / SIZE)) || (d > 0 && d < SIZE && x >= SIZE - 1) || (d < 0 && d > -SIZE && x === 0) || prev[next] >= 0 || map.terrain[next] === 2 || next !== goal && blocked.has(next)) continue;
      prev[next] = at; queue[tail++] = next;
    }
  }
  if (prev[goal] < 0) return [];
  const path = []; for (let at = goal; at !== start; at = prev[at]) path.push([at % SIZE + .5, Math.floor(at / SIZE) + .5]);
  return path.reverse();
}
