export function deltaSegundos(now, previous) {
  if (!Number.isFinite(now) || !Number.isFinite(previous)) return 1 / 72;
  return Math.max(0, Math.min(0.05, (now - previous) / 1000));
}

export function puedeResolverChoque(elapsed, inicio, state) {
  return elapsed >= 4 && Math.hypot(state.x - inicio.x, state.z - inicio.z) >= 150;
}

export function debeChocar(state, alturaTerreno, margen = 5) {
  return alturaTerreno > 0 && state.y <= alturaTerreno + margen;
}

export function crearVuelo(inicio = { x: 0, y: 1800, z: -12000, yaw: -0.35 }) {
  return {
    x: inicio.x, y: inicio.y, z: inicio.z, vx: 0, vy: -5, vz: -55,
    yaw: inicio.yaw, roll: 0, pitch: 0, velocidad: 55, pullUpSeconds: 0,
    checkpoint: { ...inicio }, score: 0, tiempo: 0, aros: 0, choques: 0,
    rozon: false, paracaidas: false, terminado: false,
  };
}

const limitar = (n, min = -1, max = 1) => Math.max(min, Math.min(max, Number(n) || 0));

export function mapearPC({ teclas = [], mouseX = 0, mouseY = 0 } = {}) {
  const keys = new Set(teclas);
  return {
    pitch: limitar((keys.has('s') || keys.has('S') || keys.has('ArrowDown') ? -1 : 0) + (keys.has('w') || keys.has('W') || keys.has('ArrowUp') ? 1 : 0) - mouseY),
    roll: limitar((keys.has('a') || keys.has('A') || keys.has('ArrowLeft') ? 1 : 0) - (keys.has('d') || keys.has('D') || keys.has('ArrowRight') ? 1 : 0) - mouseX),
  };
}

export function mapearCelular(beta, gamma, betaNeutro = 0, gammaNeutro = 0) {
  return { pitch: limitar(-(beta - betaNeutro) / 38), roll: limitar(-(gamma - gammaNeutro) / 32) };
}

export function mapearQuest(izquierda, derecha, headYaw = 0) {
  const manos = [izquierda, derecha];
  const y = (izquierda.y + derecha.y) / 2, z = (izquierda.z + derecha.z) / 2;
  const picada = Math.min(1, Math.max(0, (-y - .12) / .58), Math.max(0, (-z - .1) / .62));
  const levantar = Math.min(.8, Math.max(0, (y - .12) / .65));
  return { pitch: picada ? -picada : levantar, roll: limitar((manos[0].y - manos[1].y) / .7), yaw: limitar(headYaw / .7) };
}

export function mapearGamepadXR(sources = []) {
  const sticks = Array.from(sources).filter((source) => source.gamepad?.axes?.length >= 2);
  if (!sticks.length) return { pitch: 0, roll: 0 };
  const axes = sticks.map(({ gamepad }) => gamepad.axes.length >= 4 ? gamepad.axes.slice(-2) : gamepad.axes.slice(0, 2));
  return { pitch: limitar(axes.reduce((sum, a) => sum + a[1], 0) / axes.length), roll: limitar(axes.reduce((sum, a) => sum + a[0], 0) / axes.length) };
}

export function multiplicadorAltura(alturaTerreno) {
  return alturaTerreno < 25 ? 1 + (1 - Math.max(0, alturaTerreno) / 25) * 3 : 1;
}

export function actualizarVuelo(s, control = {}, dt = 1 / 72) {
  if (s.terminado || dt <= 0) return s;
  dt = Math.min(dt, 1 / 20);
  const pitch = limitar(control.pitch), roll = limitar(control.roll);
  s.velocidad = Math.max(25, Math.min(95, s.velocidad + (-pitch * 34 - (s.velocidad - 55) * .28) * dt));
  s.pullUpSeconds = pitch > 0 ? (s.pullUpSeconds || 0) + dt : 0;
  s.pitch += (pitch - s.pitch) * (1 - Math.exp(-dt / .1));
  s.roll += (roll - s.roll) * (1 - Math.exp(-dt / .1));
  s.yaw += (s.roll * s.velocidad / 75 + limitar(control.yaw) * .65) * dt;
  const targetVy = -s.velocidad / 3 + Math.max(0, -pitch) * (s.velocidad / 3 - s.velocidad / 1.12) + Math.max(0, pitch) * (s.velocidad / 3 + 1.2 * Math.exp(-s.pullUpSeconds / .65));
  s.vy += (targetVy - s.vy) * (1 - Math.exp(-dt / .18));
  const horizontalSpeed = Math.sqrt(Math.max(0, s.velocidad ** 2 - s.vy ** 2));
  s.vx = -Math.sin(s.yaw) * horizontalSpeed;
  s.vz = -Math.cos(s.yaw) * horizontalSpeed;
  s.x += s.vx * dt;
  s.y += s.vy * dt;
  s.z += s.vz * dt;
  s.tiempo += dt;
  return s;
}

export function resolverChoque(s, superficieY = s.y, forzado = false) {
  if (s.terminado || (!forzado && s.y > superficieY)) return false;
  const ultimo = s.checkpoint;
  s.x = ultimo.x; s.y = ultimo.y; s.z = ultimo.z; s.yaw = ultimo.yaw;
  s.vx = 0; s.vy = -5; s.vz = -55; s.velocidad = 55;
  s.choques += 1;
  s.rozon = false;
  return true;
}

export function guardarCheckpoint(s, p) {
  s.checkpoint = { x: p.x, y: p.y, z: p.z, yaw: p.yaw };
  s.aros += 1;
  s.score += 250;
}

export function registrarRozon(s, distancia, pared = 92) {
  if (distancia > pared || s.rozon) return false;
  s.rozon = true;
  s.score += Math.round((pared - distancia) * 5) + 100;
  return true;
}
