export const GRAVEDAD = 9.81;

export function deltaSegundos(now, previous) {
  if (!Number.isFinite(now) || !Number.isFinite(previous)) return 1 / 72;
  return Math.max(0, Math.min(0.05, (now - previous) / 1000));
}

export function puedeResolverChoque(elapsed, inicio, state) {
  return elapsed >= 4 && Math.hypot(state.x - inicio.x, state.z - inicio.z) >= 150;
}

export function crearVuelo(inicio = { x: 0, y: 1800, z: -12000, yaw: -0.35 }) {
  return {
    x: inicio.x, y: inicio.y, z: inicio.z, vx: 0, vy: -5, vz: -38,
    yaw: inicio.yaw, roll: 0, pitch: 0, velocidad: 38,
    checkpoint: { ...inicio }, score: 0, tiempo: 0, aros: 0, choques: 0,
    rozon: false, paracaidas: false, terminado: false,
  };
}

export function sustentacion(velocidad, inclinacion) {
  return Math.max(0, velocidad) * 0.23 * (1 + Math.max(-1, Math.min(1, inclinacion)) * 0.8);
}

export function actualizarVuelo(s, control = {}, dt = 1 / 72) {
  if (s.terminado || dt <= 0) return s;
  dt = Math.min(dt, 1 / 20);
  const pitch = Math.max(-1, Math.min(1, control.pitch || 0));
  const roll = Math.max(-1, Math.min(1, control.roll || 0));
  const targetSpeed = Math.max(30, Math.min(60, s.velocidad + (-pitch * 18 - pitch * 14 - (s.velocidad - 42) * 0.28) * dt));
  s.velocidad = targetSpeed;
  s.pitch += (pitch - s.pitch) * Math.min(1, dt * 3.5);
  s.roll += (roll - s.roll) * Math.min(1, dt * 5);
  s.yaw += s.roll * 0.72 * dt;
  const lift = sustentacion(s.velocidad, s.pitch);
  s.vy = Math.max(-42, Math.min(16, s.vy + (lift - GRAVEDAD) * dt));
  s.vx = -Math.sin(s.yaw) * s.velocidad;
  s.vz = -Math.cos(s.yaw) * s.velocidad;
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
  s.vx = 0; s.vy = -5; s.vz = -38; s.velocidad = 38;
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
