// Movimiento determinista de la vida urbana, separado del render de Three.js.
export function avanzarRuta(fase, dt, velocidad, longitud) {
  if (!(longitud > 0)) return 0;
  return ((fase + dt * velocidad) % longitud + longitud) % longitud;
}

export function pasoPaloma(paloma, jugador, dt) {
  const dx = paloma.x - jugador.x, dz = paloma.z - jugador.z;
  const distancia = Math.hypot(dx, dz);
  if (distancia < 14) paloma.huyendo = 4.5;
  paloma.huyendo = Math.max(0, paloma.huyendo - dt);
  if (paloma.huyendo > 0) {
    const inv = 1 / Math.max(0.01, distancia);
    paloma.vx = dx * inv * 10;
    paloma.vz = dz * inv * 10;
    paloma.y = Math.min(19, paloma.y + dt * 2.8);
  } else {
    paloma.vx += (paloma.vxObjetivo - paloma.vx) * Math.min(1, dt * 0.6);
    paloma.vz += (paloma.vzObjetivo - paloma.vz) * Math.min(1, dt * 0.6);
  }
  paloma.x += paloma.vx * dt;
  paloma.z += paloma.vz * dt;
  paloma.y += Math.sin(paloma.fase + paloma.x * 0.18) * dt * 0.5;
  return paloma;
}

export function nivelAnochecer(segundos) {
  const t = Math.max(0, Math.min(1, (segundos - 24) / 150));
  return t * t * (3 - 2 * t);
}
