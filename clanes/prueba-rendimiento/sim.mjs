export function buildFlowField(width, height, blocked, goal) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) throw new RangeError('invalid grid size');
  const size = width * height;
  const distance = new Int32Array(size).fill(-1);
  const dx = new Int8Array(size), dz = new Int8Array(size);
  const index = (x, z) => z * width + x;
  const [gx, gz] = goal;
  if (gx < 0 || gx >= width || gz < 0 || gz >= height || blocked(index(gx, gz))) throw new RangeError('goal must be walkable and inside grid');
  const queue = new Int32Array(size);
  let head = 0, tail = 0;
  const target = index(gx, gz);
  distance[target] = 0;
  queue[tail++] = target;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (head < tail) {
    const at = queue[head++], x = at % width, z = (at / width) | 0;
    for (const [ox, oz] of dirs) {
      const nx = x + ox, nz = z + oz;
      if (nx < 0 || nx >= width || nz < 0 || nz >= height) continue;
      const next = index(nx, nz);
      if (distance[next] !== -1 || blocked(next)) continue;
      distance[next] = distance[at] + 1;
      queue[tail++] = next;
    }
  }
  for (let at = 0; at < size; at++) {
    if (distance[at] <= 0) continue;
    const x = at % width, z = (at / width) | 0;
    let best = at;
    for (const [ox, oz] of dirs) {
      const nx = x + ox, nz = z + oz;
      if (nx < 0 || nx >= width || nz < 0 || nz >= height) continue;
      const next = index(nx, nz);
      if (distance[next] >= 0 && distance[next] < distance[best]) best = next;
    }
    if (best !== at) { dx[at] = (best % width) - x; dz[at] = ((best / width) | 0) - z; }
  }
  return { width, height, distance, dx, dz, goal: target };
}

export class FixedStep {
  constructor(stepSeconds = 1 / 30, maxSteps = 5) {
    if (!(stepSeconds > 0) || !Number.isInteger(maxSteps) || maxSteps < 1) throw new RangeError('invalid fixed-step settings');
    this.stepSeconds = stepSeconds;
    this.maxSteps = maxSteps;
    this.accumulator = 0;
    this.tick = 0;
  }
  advance(frameSeconds, update) {
    if (!Number.isFinite(frameSeconds) || frameSeconds < 0) throw new RangeError('frame time must be finite and non-negative');
    this.accumulator += Math.min(frameSeconds, this.stepSeconds * this.maxSteps);
    let steps = 0;
    while (this.accumulator + Number.EPSILON >= this.stepSeconds && steps < this.maxSteps) {
      update(this.stepSeconds, this.tick++);
      this.accumulator -= this.stepSeconds;
      steps++;
    }
    return { steps, alpha: this.accumulator / this.stepSeconds, tick: this.tick };
  }
}
