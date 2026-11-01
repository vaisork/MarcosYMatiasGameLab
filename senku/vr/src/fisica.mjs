// Física pura de Senku VR (sin Three): jugadora como punto, cuerdas como
// restricción tipo péndulo que se acortan poco a poco, gravedad, suelo y
// azoteas/paredes como cajas. Vectores = objetos {x, y, z}.

export const AJUSTES = {
  gravedad: -13,      // m/s² (un poco más que la real: se siente ágil)
  suelo: 1.0,         // altura mínima del centro del cuerpo
  acortar: 4,         // m/s que se recoge la cuerda mientras se sostiene
  largoMin: 3,
  arrastreAire: 0.04, // fracción por segundo
  friccionSuelo: 7,
  velMax: 45,
  impulsoSoltar: 0.12, // +12 % de rapidez al soltar
  radio: 0.4,
};

const resta = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const largo = (v) => Math.hypot(v.x, v.y, v.z);

export function crearCuerda(pos, ancla) {
  return { ancla: { ...ancla }, largo: Math.max(AJUSTES.largoMin, largo(resta(pos, ancla)) * 0.97) };
}

// Paso de simulación. e = {pos, vel, enSuelo}; cuerdas = [{ancla, largo}];
// o.empuje = aceleración de control {x,y,z}; o.cajas = [{min, max}].
export function paso(e, cuerdas, dt, o = {}) {
  const A = { ...AJUSTES, ...o };
  const { pos, vel } = e;
  vel.y += A.gravedad * dt;
  if (o.empuje) { vel.x += o.empuje.x * dt; vel.y += o.empuje.y * dt; vel.z += o.empuje.z * dt; }
  const k = Math.max(0, 1 - A.arrastreAire * dt);
  vel.x *= k; vel.y *= k; vel.z *= k;
  const v = largo(vel);
  if (v > A.velMax) { const s = A.velMax / v; vel.x *= s; vel.y *= s; vel.z *= s; }
  pos.x += vel.x * dt; pos.y += vel.y * dt; pos.z += vel.z * dt;

  // Recoger cuerda (incluida la floja), salvo que con otra cuerda ya no quepa
  // la jugadora entre ambas anclas.
  for (const c of cuerdas) {
    c.largo = Math.max(A.largoMin, Math.min(c.largo, largo(resta(pos, c.ancla))));
    const choca = cuerdas.some((o) => o !== c && c.largo + o.largo - 1 < largo(resta(c.ancla, o.ancla)));
    if (!choca) c.largo = Math.max(A.largoMin, c.largo - A.acortar * dt);
  }
  // Varias pasadas para que dos cuerdas a la vez convivan.
  for (let i = 0; i < 4; i++) for (const c of cuerdas) {
    const d = resta(pos, c.ancla);
    const dist = largo(d);
    if (dist <= c.largo || dist === 0) continue;
    const n = { x: d.x / dist, y: d.y / dist, z: d.z / dist };
    pos.x = c.ancla.x + n.x * c.largo; pos.y = c.ancla.y + n.y * c.largo; pos.z = c.ancla.z + n.z * c.largo;
    const vr = vel.x * n.x + vel.y * n.y + vel.z * n.z;
    if (vr > 0) { vel.x -= n.x * vr; vel.y -= n.y * vr; vel.z -= n.z * vr; }
  }

  e.enSuelo = false;
  if (pos.y < A.suelo) { pos.y = A.suelo; if (vel.y < 0) vel.y = 0; e.enSuelo = true; }
  if (o.cajas) resolverCajas(e, o.cajas, A.radio);
  if (e.enSuelo) { const f = Math.max(0, 1 - A.friccionSuelo * dt); vel.x *= f; vel.z *= f; }
  return e;
}

// Empuja fuera de edificios; caer sobre una azotea cuenta como suelo (aterrizaje suave).
export function resolverCajas(e, cajas, radio = AJUSTES.radio) {
  const { pos, vel } = e;
  const pies = AJUSTES.suelo; // el cuerpo está a esta altura sobre los pies
  for (const c of cajas) {
    if (pos.x < c.min.x - radio || pos.x > c.max.x + radio) continue;
    if (pos.z < c.min.z - radio || pos.z > c.max.z + radio) continue;
    if (pos.y < c.min.y || pos.y > c.max.y + pies) continue;
    const opciones = [
      [c.max.y + pies - pos.y, 'y', 1],
      [pos.x - (c.min.x - radio), 'x', -1], [(c.max.x + radio) - pos.x, 'x', 1],
      [pos.z - (c.min.z - radio), 'z', -1], [(c.max.z + radio) - pos.z, 'z', 1],
    ];
    let [p, eje, s] = opciones[0];
    for (const op of opciones) if (op[0] < p) [p, eje, s] = op;
    pos[eje] += p * s;
    if (vel[eje] * s < 0) vel[eje] = 0;
    if (eje === 'y') e.enSuelo = true;
  }
}

// Al soltar se conserva la velocidad y se gana un pequeño impulso.
export function soltar(e) {
  const k = 1 + AJUSTES.impulsoSoltar;
  e.vel.x *= k; e.vel.y = e.vel.y * k + 1.5; e.vel.z *= k;
  return e;
}

// Tirón (botón de agarre): impulso rápido hacia un punto.
export function tiron(e, punto, fuerza = 14) {
  const d = resta(punto, e.pos);
  const dist = largo(d) || 1;
  e.vel.x += (d.x / dist) * fuerza; e.vel.y += (d.y / dist) * fuerza + 2; e.vel.z += (d.z / dist) * fuerza;
  return e;
}

// Impulso con el brazo ("arm-pump"): con la garra enganchada, jalar la mano
// rápido alejándola del ancla (hacia ti / hacia atrás) empuja el cuerpo hacia
// el ancla, por la cuerda. velMano en m/s (mundo, sin el movimiento del cuerpo).
// Umbral para ignorar movimientos normales, ganancia y tope para que no se abuse;
// velocidades de mano absurdas (saltos del seguimiento) se ignoran.
export const IMPULSO = { umbral: 1.2, ganancia: 9, tope: 26, manoMax: 12 };

// Devuelve la aceleración aplicada (m/s², 0 si no hubo impulso) y suma a e.vel.
export function impulsoBrazo(e, velMano, ancla, dt, o = IMPULSO) {
  const d = resta(ancla, e.pos);
  const dist = largo(d);
  if (dist === 0 || largo(velMano) > o.manoMax) return 0;
  const u = { x: d.x / dist, y: d.y / dist, z: d.z / dist };
  const jalon = -(velMano.x * u.x + velMano.y * u.y + velMano.z * u.z);
  if (jalon <= o.umbral) return 0;
  const a = Math.min(o.tope, (jalon - o.umbral) * o.ganancia);
  e.vel.x += u.x * a * dt; e.vel.y += u.y * a * dt; e.vel.z += u.z * a * dt;
  return a;
}
