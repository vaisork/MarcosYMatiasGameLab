// Balam, guardián de Tikal. Lógica pura, con fases y ataques telegrafiados.
export const HP_BALAM = 12;
export const ARENA_BALAM = { minX: 1280, maxX: 2560 };
export const TAM_BALAM = { w: 220, h: 170 };
export const DANO_BALAM = { contacto: 2, carrera: 15, onda: 10, jade: 10 };
const GRAVEDAD = 1900;

export function faseBalam(balam) {
  if (balam.hp <= balam.hpMax / 3) return 3;
  if (balam.hp <= balam.hpMax * 2 / 3) return 2;
  return 1;
}

export function crearBalam({ x = 2180, suelo = 600, arenaMinX = ARENA_BALAM.minX, arenaMaxX = ARENA_BALAM.maxX } = {}) {
  return { x, y: suelo - TAM_BALAM.h, w: TAM_BALAM.w, h: TAM_BALAM.h, suelo, arenaMinX, arenaMaxX,
    hp: HP_BALAM, hpMax: HP_BALAM, estado: 'dormido', tiempo: 0, mirando: -1, vx: 0, vy: 0,
    parpadeo: 0, derrotado: false, ondas: [], jade: [], indiceAtaque: 0 };
}

export function despertarBalam(balam) {
  if (balam?.estado === 'dormido') { balam.estado = 'vigilia'; balam.tiempo = 0; }
}

export function golpearBalam(balam, dano = 1) {
  if (!balam || balam.derrotado || balam.estado === 'dormido' || balam.parpadeo > 0) return false;
  balam.hp = Math.max(0, balam.hp - dano);
  balam.parpadeo = 0.35;
  if (!balam.hp) { balam.derrotado = true; balam.estado = 'derrotado'; balam.tiempo = 0; balam.ondas = []; balam.jade = []; }
  return true;
}

const solapan = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export function esPisonBalam(balam, cuerpo) {
  const pies = cuerpo.y + cuerpo.h;
  return cuerpo.vy > 0 && pies >= balam.y && pies <= balam.y + balam.h / 3
    && cuerpo.x + cuerpo.w > balam.x + 20 && cuerpo.x < balam.x + balam.w - 20;
}

export function actualizarBalam(balam, objetivo, dt) {
  const eventos = [];
  if (!balam || balam.estado === 'dormido') return eventos;
  if (balam.derrotado) { balam.tiempo += dt; return eventos; }
  balam.tiempo += dt;
  balam.parpadeo = Math.max(0, balam.parpadeo - dt);
  const fase = faseBalam(balam), ritmo = fase === 3 ? 0.78 : 1;
  const centro = balam.x + balam.w / 2, jugador = objetivo.x + objetivo.w / 2;
  switch (balam.estado) {
    case 'vigilia':
    case 'eco':
    case 'lluvia':
      balam.mirando = jugador < centro ? -1 : 1;
      if (balam.tiempo >= (fase === 1 ? 1.05 : fase === 2 ? 0.9 : 0.72) * ritmo) {
        const ataque = fase === 1 ? 'aviso-carrera' : fase === 2 ? 'aviso-salto' : 'aviso-jade';
        balam.estado = ataque; balam.tiempo = 0; eventos.push(ataque);
      }
      break;
    case 'aviso-carrera':
      if (balam.tiempo >= 0.55 * ritmo) { balam.estado = 'carrera'; balam.tiempo = 0; balam.vx = balam.mirando * 620; eventos.push('carrera'); }
      break;
    case 'carrera':
      balam.x += balam.vx * dt;
      if (balam.x <= balam.arenaMinX || balam.x + balam.w >= balam.arenaMaxX) {
        balam.x = Math.max(balam.arenaMinX, Math.min(balam.arenaMaxX - balam.w, balam.x));
        balam.vx = 0; balam.estado = 'aturdido'; balam.tiempo = 0; eventos.push('aturdido');
      }
      break;
    case 'aviso-salto':
      if (balam.tiempo >= 0.65 * ritmo) { balam.estado = 'salto'; balam.tiempo = 0; balam.vy = -760; balam.vx = (jugador - centro) / 0.8; eventos.push('salto'); }
      break;
    case 'salto':
      balam.vy += GRAVEDAD * dt; balam.x += balam.vx * dt; balam.y += balam.vy * dt;
      if (balam.y + balam.h >= balam.suelo && balam.vy > 0) {
        balam.y = balam.suelo - balam.h; balam.vy = 0; balam.vx = 0;
        balam.ondas = [-1, 1].map((dir) => ({ x: balam.x + (dir < 0 ? -44 : balam.w), y: balam.suelo - 34, w: 44, h: 34, vx: dir * 390 }));
        balam.estado = 'aturdido'; balam.tiempo = 0; eventos.push('onda');
      }
      break;
    case 'aviso-jade':
      if (balam.tiempo >= 0.6) {
        const n = faseBalam(balam) === 3 ? 5 : 3;
        balam.jade = Array.from({ length: n }, (_, i) => ({ x: jugador - 60 + i * 30, y: -80 - (i % 2) * 70,
          w: 28, h: 38, vy: 470, aviso: 0.45 }));
        balam.estado = 'lluvia-jade'; balam.tiempo = 0; eventos.push('jade');
      }
      break;
    case 'lluvia-jade':
      for (const p of balam.jade) { p.aviso = Math.max(0, p.aviso - dt); if (!p.aviso) p.y += p.vy * dt; }
      balam.jade = balam.jade.filter((p) => p.y < balam.suelo);
      if (!balam.jade.length) { balam.estado = 'aturdido'; balam.tiempo = 0; }
      break;
    case 'aturdido':
      if (balam.tiempo >= (faseBalam(balam) === 3 ? 0.65 : 0.9)) {
        balam.estado = ['vigilia', 'eco', 'lluvia'][faseBalam(balam) - 1]; balam.tiempo = 0; balam.indiceAtaque++;
      }
      break;
    default: break;
  }
  for (const onda of balam.ondas) onda.x += onda.vx * dt;
  balam.ondas = balam.ondas.filter((o) => o.x + o.w > balam.arenaMinX && o.x < balam.arenaMaxX);
  return eventos;
}

export function danoDeBalam(balam, cuerpo) {
  if (!balam || balam.estado === 'dormido' || balam.derrotado) return 0;
  let dano = solapan(balam, cuerpo) && !esPisonBalam(balam, cuerpo)
    ? (balam.estado === 'carrera' ? DANO_BALAM.carrera : DANO_BALAM.contacto) : 0;
  if (balam.ondas.some((o) => solapan(o, cuerpo))) dano = Math.max(dano, DANO_BALAM.onda);
  if (balam.jade.some((p) => !p.aviso && solapan(p, cuerpo))) dano = Math.max(dano, DANO_BALAM.jade);
  return dano;
}
