// Gestos del celular. Funciones puras para poder ajustar umbrales sin Three.js.
export const MOVIL = {
  swipeDistancia: 35,
  swipeVelocidad: 0.55, // px/ms
  swipeDuracion: 350, // ms
  sacudida: 14, // m/s² entre muestras; calibrable para cada teléfono
  alcance: 2.5,
  enfriar: 350, // ms
  cono: 0.65, // coseno: ratón dentro de ~49° al frente
  picos: 2, // sacudidas seguidas para un zarpazo (un paso al caminar da solo una)
  ventanaPicos: 300, // ms
};

export function detectarSwipe(inicio, fin, o = MOVIL) {
  const distancia = Math.hypot(fin.x - inicio.x, fin.y - inicio.y);
  const duracion = fin.t - inicio.t;
  return duracion > 0 && duracion <= o.swipeDuracion
    && distancia >= o.swipeDistancia && distancia / duracion >= o.swipeVelocidad;
}

export function detectarSacudida(anterior, actual, umbral = MOVIL.sacudida) {
  return !!anterior && !!actual
    && Math.hypot(actual.x - anterior.x, actual.y - anterior.y, actual.z - anterior.z) >= umbral;
}

export function masCercanoEnfrente(origen, direccion, ratones, alcance = MOVIL.alcance, cono = MOVIL.cono) {
  let objetivo = null, distancia = alcance;
  const largo = Math.hypot(direccion.x, direccion.y, direccion.z) || 1;
  for (const raton of ratones) {
    if (raton.estado !== 'camina' && raton.estado !== 'golpeado') continue;
    const dx = raton.pos.x - origen.x, dy = raton.pos.y + 0.3 - origen.y, dz = raton.pos.z - origen.z;
    const d = Math.hypot(dx, dy, dz);
    if (d < distancia && (dx * direccion.x + dy * direccion.y + dz * direccion.z) / (d * largo) >= cono) {
      objetivo = raton;
      distancia = d;
    }
  }
  return objetivo;
}

// Guarda el pico y dice si ya hubo suficientes dentro de la ventana; si sí, vacía la lista.
export function sacudidaDoble(picos, ahora, o = MOVIL) {
  while (picos.length && ahora - picos[0] > o.ventanaPicos) picos.shift();
  picos.push(ahora);
  if (picos.length < o.picos) return false;
  picos.length = 0;
  return true;
}

export const listoZarpazo = (ahora, ultimo, enfriar = MOVIL.enfriar) => ahora - ultimo >= enfriar;
