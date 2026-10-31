// Gato Mecánico, jefe final del capítulo México (decisión de Javier, 30/10/2026).
// Patrones (propuesta de Claude, ajustables en PATRON y DANO): acecha, embiste con aviso,
// salta y suelta ondas por el suelo, lanza tornillos. Con media vida se acelera.
// Lógica pura: sin DOM ni Canvas. `aleatorio` se inyecta para pruebas reproducibles.

export const HP_JEFE = 12;
export const TAM_JEFE = { w: 220, h: 170 };
export const DANO = { contacto: 2, embestida: 3, onda: 2, tornillo: 1 };
export const PATRON = ['embestida', 'salto', 'tornillos'];
const TIEMPOS = { acecho: 1.3, avisoEmbestida: 0.7, aterrizaje: 0.5, tornillos: 1.1, golpeado: 0.35 };
const VEL = { acecho: 90, embestida: 640, onda: 430, saltoVy: -900, gravedad: 1900 };

export function crearJefe({ x, suelo, arenaMinX, arenaMaxX }) {
  return {
    x, y: suelo - TAM_JEFE.h, w: TAM_JEFE.w, h: TAM_JEFE.h, suelo, arenaMinX, arenaMaxX,
    vx: 0, vy: 0, mirando: -1, hp: HP_JEFE, hpMax: HP_JEFE,
    estado: 'dormido', tiempo: 0, indicePatron: 0, parpadeo: 0,
    ondas: [], tornillos: [], derrotado: false,
  };
}

export function furioso(jefe) {
  return jefe.hp <= jefe.hpMax / 2;
}

function cambiar(jefe, estado) {
  jefe.estado = estado;
  jefe.tiempo = 0;
}

function solapan(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function despertar(jefe) {
  if (jefe.estado === 'dormido') cambiar(jefe, 'acecho');
}

// Avanza al jefe. Devuelve la lista de eventos del paso ('aviso', 'embestir', 'aterrizar', 'tornillos').
export function actualizarJefe(jefe, objetivo, dt, aleatorio = Math.random) {
  const eventos = [];
  if (jefe.derrotado) jefe.tiempo += dt; // anima la caída
  if (jefe.estado === 'dormido' || jefe.derrotado) return eventos;
  const rapidez = furioso(jefe) ? 1.3 : 1;
  jefe.tiempo += dt;
  jefe.parpadeo = Math.max(0, jefe.parpadeo - dt);
  const centro = jefe.x + jefe.w / 2;
  const objetivoX = objetivo.x + objetivo.w / 2;

  switch (jefe.estado) {
    case 'acecho': {
      jefe.mirando = objetivoX < centro ? -1 : 1;
      jefe.x += jefe.mirando * VEL.acecho * rapidez * dt;
      if (jefe.tiempo >= TIEMPOS.acecho / rapidez) {
        const siguiente = PATRON[jefe.indicePatron % PATRON.length];
        jefe.indicePatron += 1;
        cambiar(jefe, siguiente === 'embestida' ? 'aviso' : siguiente);
        if (siguiente === 'embestida') eventos.push('aviso');
        if (siguiente === 'salto') {
          jefe.vy = VEL.saltoVy;
          jefe.vx = (objetivoX - centro) / 0.95; // llega cerca de Senku
        }
        if (siguiente === 'tornillos') {
          const cantidad = furioso(jefe) ? 5 : 3;
          for (let i = 0; i < cantidad; i++) {
            const distancia = objetivoX - centro + (i - (cantidad - 1) / 2) * 110 + (aleatorio() - 0.5) * 60;
            jefe.tornillos.push({
              x: centro - 11, y: jefe.y + 30, w: 22, h: 22,
              vx: distancia / 1.1, vy: -820, giro: 0,
            });
          }
          eventos.push('tornillos');
        }
      }
      break;
    }
    case 'aviso':
      jefe.mirando = objetivoX < centro ? -1 : 1;
      if (jefe.tiempo >= TIEMPOS.avisoEmbestida / rapidez) {
        cambiar(jefe, 'embestida');
        jefe.vx = jefe.mirando * VEL.embestida * rapidez;
        eventos.push('embestir');
      }
      break;
    case 'embestida':
      jefe.x += jefe.vx * dt;
      if (jefe.x <= jefe.arenaMinX || jefe.x + jefe.w >= jefe.arenaMaxX) {
        jefe.vx = 0;
        cambiar(jefe, 'aturdido');
      }
      break;
    case 'aturdido':
      if (jefe.tiempo >= TIEMPOS.aterrizaje) cambiar(jefe, 'acecho');
      break;
    case 'salto':
      jefe.vy += VEL.gravedad * dt;
      jefe.x += jefe.vx * dt;
      jefe.y += jefe.vy * dt;
      if (jefe.y + jefe.h >= jefe.suelo && jefe.vy > 0) {
        jefe.y = jefe.suelo - jefe.h;
        jefe.vy = 0;
        jefe.vx = 0;
        const base = { y: jefe.suelo - 34, w: 46, h: 34 };
        jefe.ondas.push({ ...base, x: jefe.x - 46, vx: -VEL.onda * rapidez });
        jefe.ondas.push({ ...base, x: jefe.x + jefe.w, vx: VEL.onda * rapidez });
        cambiar(jefe, 'aturdido');
        eventos.push('aterrizar');
      }
      break;
    case 'tornillos':
      if (jefe.tiempo >= TIEMPOS.tornillos) cambiar(jefe, 'acecho');
      break;
    default:
      break;
  }

  jefe.x = Math.max(jefe.arenaMinX, Math.min(jefe.arenaMaxX - jefe.w, jefe.x));

  for (const o of jefe.ondas) o.x += o.vx * dt;
  jefe.ondas = jefe.ondas.filter((o) => o.x + o.w > jefe.arenaMinX && o.x < jefe.arenaMaxX);
  for (const t of jefe.tornillos) {
    t.vy += VEL.gravedad * 0.8 * dt;
    t.x += t.vx * dt;
    t.y += t.vy * dt;
    t.giro += dt * 12;
  }
  jefe.tornillos = jefe.tornillos.filter((t) => t.y < jefe.suelo);
  return eventos;
}

// Daño que el jefe y sus ataques hacen a Senku este paso (0 si nada lo toca).
export function danoAJugador(jefe, cuerpo) {
  if (jefe.estado === 'dormido' || jefe.derrotado) return 0;
  let dano = 0;
  if (solapan(jefe, cuerpo) && !esPisoton(jefe, cuerpo)) {
    dano = jefe.estado === 'embestida' ? DANO.embestida : DANO.contacto;
  }
  if (jefe.ondas.some((o) => solapan(o, cuerpo))) dano = Math.max(dano, DANO.onda);
  if (jefe.tornillos.some((t) => solapan(t, cuerpo))) dano = Math.max(dano, DANO.tornillo);
  return dano;
}

// Caer sobre la cabeza (pies en el tercio superior, bajando) es pisotón.
export function esPisoton(jefe, cuerpo) {
  const pies = cuerpo.y + cuerpo.h;
  return cuerpo.vy > 0 && pies >= jefe.y && pies <= jefe.y + jefe.h / 3
    && cuerpo.x + cuerpo.w > jefe.x + 20 && cuerpo.x < jefe.x + jefe.w - 20;
}

// Resta vida al jefe. Tras cada golpe hay un instante en que no recibe otro.
export function golpearJefe(jefe, dano = 1) {
  if (jefe.derrotado || jefe.estado === 'dormido' || jefe.parpadeo > 0) return false;
  jefe.hp = Math.max(0, jefe.hp - dano);
  jefe.parpadeo = TIEMPOS.golpeado;
  if (jefe.hp === 0) {
    jefe.derrotado = true;
    jefe.ondas = [];
    jefe.tornillos = [];
    cambiar(jefe, 'derrotado');
  }
  return true;
}
