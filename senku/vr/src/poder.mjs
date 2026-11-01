// Superpoder diseñado por Matías (9 años): «te vas balanceando, llenas una
// barrita derrotando enemigos y disparas ratones». Lógica pura (sin Three).
// Vectores = objetos {x, y, z}.

export const NOMBRE_PODER = 'Ultra Gato';
export const PODER = {
  lleno: 6, // la barrita se llena con 6 puntos
  carga: { negro: 1, cafe: 2, hamster: 3 },
  proyectiles: 5, extraColumpio: 1, // columpiándose: un ratoncito de premio
  alcance: 25, // busca ratones a menos de 25 m
  vel: 16, giro: 5, vida: 3, // m/s, qué tan rápido corrige el rumbo (1/s), segundos de vuelo
  radioGolpe: 0.35,
};

const VIVOS = new Set(['camina', 'golpeado', 'atrapado']);

// La carga se guarda (localStorage) y no se pierde con el tiempo, al perder los
// corazones ni al salir del juego: solo disparar la vacía. guardado = texto o null.
export const CLAVE_PODER = 'senku_vr_ultra_gato';
export function crearBarra(guardado = null, o = PODER) {
  const n = Math.floor(Number(guardado));
  return { carga: Number.isFinite(n) ? Math.max(0, Math.min(o.lleno, n)) : 0 };
}
export const barraLlena = (b, o = PODER) => b.carga >= o.lleno;

// Suma lo que da el ratón vencido (con tope). Devuelve true si justo se llenó.
export function cargarBarra(b, tipo, o = PODER) {
  if (barraLlena(b, o)) return false;
  b.carga = Math.min(o.lleno, b.carga + (o.carga[tipo] || 0));
  return barraLlena(b, o);
}

// Dispara si está llena: la vacía y devuelve cuántos ratoncitos salen (0 si no).
export function dispararPoder(b, columpiandose = false, o = PODER) {
  if (!barraLlena(b, o)) return 0;
  b.carga = 0;
  return o.proyectiles + (columpiandose ? o.extraColumpio : 0);
}

// Ratón enemigo vivo más cercano a p dentro del alcance (o null).
export function masCercano(p, enemigos, alcance = PODER.alcance) {
  let mejor = null, dist = alcance;
  for (const e of enemigos) {
    if (!VIVOS.has(e.estado)) continue;
    const d = Math.hypot(e.pos.x - p.x, e.pos.y - p.y, e.pos.z - p.z);
    if (d <= dist) { mejor = e; dist = d; }
  }
  return mejor;
}

export const crearRatoncito = (pos, vel) => ({ pos: { ...pos }, vel: { ...vel }, t: 0 });

// Un paso de vuelo con búsqueda suave: gira la velocidad hacia el objetivo
// (si hay) sin cambiar la rapidez. Devuelve false cuando se le acabó el tiempo.
export function pasoRatoncito(r, objetivo, dt, o = PODER) {
  r.t += dt;
  if (objetivo) {
    const dx = objetivo.x - r.pos.x, dy = objetivo.y - r.pos.y, dz = objetivo.z - r.pos.z;
    const d = Math.hypot(dx, dy, dz) || 1, k = Math.min(1, o.giro * (1 + r.t * 3) * dt); // gira más con el tiempo: no se queda dando vueltas
    r.vel.x += (dx / d * o.vel - r.vel.x) * k;
    r.vel.y += (dy / d * o.vel - r.vel.y) * k;
    r.vel.z += (dz / d * o.vel - r.vel.z) * k;
    const v = Math.hypot(r.vel.x, r.vel.y, r.vel.z) || 1;
    r.vel.x *= o.vel / v; r.vel.y *= o.vel / v; r.vel.z *= o.vel / v;
  }
  r.pos.x += r.vel.x * dt; r.pos.y += r.vel.y * dt; r.pos.z += r.vel.z * dt;
  return r.t < o.vida;
}

export const tocaRatoncito = (r, p, radio, o = PODER) =>
  Math.hypot(r.pos.x - p.x, r.pos.y - p.y, r.pos.z - p.z) <= radio + o.radioGolpe;
