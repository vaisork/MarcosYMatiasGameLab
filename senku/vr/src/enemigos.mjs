// Lógica pura de la versión 3 (sin Three): ratones enemigos, golpes, vida de
// Senku y escalada por paredes. Vectores = objetos {x, y, z}.

export const TIPOS = {
  negro: { golpes: 1, churus: 1, escala: 0.45, vel: 2.4, radio: 0.5 },
  cafe: { golpes: 2, churus: 2, escala: 0.55, vel: 2.0, radio: 0.6 },
  hamster: { golpes: 3, churus: 3, escala: 0.8, vel: 1.6, radio: 0.9 },
};
export const ZARPAZO = { velMin: 2.5, alcance: 0.9, enfriar: 0.35 };
export const VIDA = { max: 3, invulnerable: 1.5 };
export const ESCALADA = { ganancia: 1.4, velMax: 12, margen: 0.45 };
const PERSECUCION = 18, MISMO_NIVEL = 3.5;

export function crearEnemigo(tipo, pos, caja = null) {
  return { tipo, pos: { ...pos }, caja, golpes: TIPOS[tipo].golpes, estado: 'camina', t: 0, dir: 0 };
}

// Un golpe. Devuelve null si ya está vencido; si no, {vencido, churus}.
export function golpear(e) {
  if (e.estado === 'poof' || e.estado === 'muerto') return null;
  e.golpes--;
  if (e.golpes <= 0) { e.estado = 'poof'; e.t = 0.3; return { vencido: true, churus: TIPOS[e.tipo].churus }; }
  e.estado = 'golpeado'; e.t = 0.35;
  return { vencido: false, churus: 0 };
}

export const esZarpazo = (velMano, dist, o = ZARPAZO) => velMano >= o.velMin && dist <= o.alcance;

const dentroXZ = (p, c, m) => p.x > c.min.x - m && p.x < c.max.x + m && p.z > c.min.z - m && p.z < c.max.z + m;

// Un ratón de azotea no se baja de su edificio; uno de calle no entra a ninguno.
export function puedePisar(p, e, cajas) {
  if (e.caja) return dentroXZ(p, e.caja, -0.4);
  return !cajas.some((c) => dentroXZ(p, c, 0.5));
}

// Mueve al ratón hacia Senku si está cerca y al mismo nivel. Devuelve true si caminó.
export function pasoEnemigo(e, objetivo, dt, cajas = []) {
  if (e.estado !== 'camina') {
    e.t -= dt;
    if (e.t <= 0) e.estado = e.estado === 'poof' ? 'muerto' : e.estado === 'golpeado' ? 'camina' : e.estado;
    return false;
  }
  const dx = objetivo.x - e.pos.x, dz = objetivo.z - e.pos.z, d = Math.hypot(dx, dz);
  if (d > PERSECUCION || d < 0.3 || Math.abs(objetivo.y - 1 - e.pos.y) > MISMO_NIVEL) return false;
  e.dir = Math.atan2(dx, dz);
  const paso = TIPOS[e.tipo].vel * dt;
  for (const n of [{ x: e.pos.x + dx / d * paso, z: e.pos.z + dz / d * paso }, { x: e.pos.x + dx / d * paso, z: e.pos.z }, { x: e.pos.x, z: e.pos.z + dz / d * paso }]) {
    if (puedePisar(n, e, cajas)) { e.pos.x = n.x; e.pos.z = n.z; return true; }
  }
  return false;
}

export const tocaEnemigo = (e, jugador) => e.estado === 'camina'
  && Math.hypot(e.pos.x - jugador.x, e.pos.y + 0.4 - jugador.y, e.pos.z - jugador.z) < TIPOS[e.tipo].radio + 0.7;

// Vida de Senku: j = {vida, invulnerable}. recibirDano devuelve true si restó.
export const crearVida = () => ({ vida: VIDA.max, invulnerable: 0 });
export function recibirDano(j) {
  if (j.invulnerable > 0 || j.vida <= 0) return false;
  j.vida--; j.invulnerable = VIDA.invulnerable;
  return true;
}

// Pared de edificio a la que se puede agarrar una mano en p (null si ninguna).
export function tocaPared(p, cajas, margen = ESCALADA.margen) {
  for (const c of cajas) {
    if (p.y < c.min.y || p.y > c.max.y + 0.3) continue;
    if (dentroXZ(p, c, margen) && !dentroXZ(p, c, -margen)) return c;
  }
  return null;
}

// Escalar: la mano agarrada queda fija en el mundo, así que el cuerpo se mueve
// al revés de la mano. Sin gravedad mientras se sostiene.
export function escalar(e, deltaMano) {
  e.pos.x -= deltaMano.x; e.pos.y -= deltaMano.y; e.pos.z -= deltaMano.z;
  e.vel.x = e.vel.y = e.vel.z = 0;
  return e;
}

// Al soltar, sales lanzada al revés de como iba la mano (con tope).
export function soltarEscalada(e, velMano, o = ESCALADA) {
  let vx = -velMano.x * o.ganancia, vy = -velMano.y * o.ganancia, vz = -velMano.z * o.ganancia;
  const v = Math.hypot(vx, vy, vz);
  if (v > o.velMax) { vx *= o.velMax / v; vy *= o.velMax / v; vz *= o.velMax / v; }
  e.vel.x = vx; e.vel.y = vy; e.vel.z = vz;
  return e;
}
