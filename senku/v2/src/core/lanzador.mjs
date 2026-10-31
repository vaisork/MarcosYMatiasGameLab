// Lanzador de ratones (maestro, punto 7): equipo temporal sobre el lomo de Senku para el combate
// de la cima. Cada disparo suelta un ratón de juguete que avanza recto.
// Lógica pura: sin DOM ni Canvas.

export const ENFRIAMIENTO = 0.35; // s entre disparos
export const VELOCIDAD_PROYECTIL = 720; // px/s
export const VIDA_PROYECTIL = 1.3; // s
export const TAM_PROYECTIL = { w: 34, h: 20 };

export function crearLanzador() {
  return { proyectiles: [], enfriamiento: 0, presionado: false, siguienteId: 1 };
}

// Dispara en el flanco de bajada de `entrada.atacar`. Devuelve el proyectil creado o null.
export function actualizarDisparo(lanzador, cuerpo, entrada, dt) {
  lanzador.enfriamiento = Math.max(0, lanzador.enfriamiento - dt);
  const presionado = Boolean(entrada?.atacar);
  const nuevo = presionado && !lanzador.presionado;
  lanzador.presionado = presionado;
  if (!nuevo || lanzador.enfriamiento > 0) return null;
  const dir = cuerpo.mirando || 1;
  const p = {
    id: lanzador.siguienteId++,
    x: dir > 0 ? cuerpo.x + cuerpo.w - 10 : cuerpo.x - TAM_PROYECTIL.w + 10,
    y: cuerpo.y + cuerpo.h * 0.3,
    w: TAM_PROYECTIL.w, h: TAM_PROYECTIL.h,
    vx: dir * VELOCIDAD_PROYECTIL, vida: VIDA_PROYECTIL, dir,
  };
  lanzador.proyectiles.push(p);
  lanzador.enfriamiento = ENFRIAMIENTO;
  return p;
}

function solapan(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Mueve los proyectiles; los que tocan un objetivo se consumen. Devuelve [{proyectil, objetivo}].
export function actualizarProyectiles(lanzador, dt, objetivos = []) {
  const impactos = [];
  lanzador.proyectiles = lanzador.proyectiles.filter((p) => {
    p.x += p.vx * dt;
    p.vida -= dt;
    if (p.vida <= 0) return false;
    const blanco = objetivos.find((o) => o && solapan(p, o));
    if (blanco) {
      impactos.push({ proyectil: p, objetivo: blanco });
      return false;
    }
    return true;
  });
  return impactos;
}
