// Parámetros artísticos y luz estática para la ciudad de Senku.
export const PALETA_CIUDAD = Object.freeze({
  cieloAlto: '#594f83',
  cieloMedio: '#d17a83',
  horizonte: '#f2b47f',
  sol: '#fff0bd',
  niebla: '#edb28e',
  mar: '#718f9d',
  montaña: '#665d79',
  sombra: '#514755',
});

export function zonaBarrio(i, j) {
  return Math.abs(i) <= 2 && Math.abs(j) <= 2 ? 'centro' : 'mexicano';
}

export function alturaBarrio(zona, azar) {
  return zona === 'centro' ? 23 + Math.pow(azar, 1.15) * 38 : 8 + Math.pow(azar, 1.4) * 19;
}

// Multiplicador por esquina: cielo, orientación de la cara, oclusión en bordes
// y base más oscura. Es color horneado en vértices, no una luz por objeto.
export function luzVertice({ x, y, z, nx, ny, nz }) {
  const cielo = ny > 0.5 ? 1 : ny < -0.5 ? 0.58 : 0.86 + Math.max(0, -nz) * 0.12;
  const base = 0.82 + Math.min(1, Math.max(0, y)) * 0.18;
  const borde = 1 - (Math.abs(x) > 0.49 && Math.abs(z) > 0.49 ? 0.13 : 0);
  return Math.max(0.48, Math.min(1.08, cielo * base * borde));
}

export function crearPerfilLejano(semilla = 1337, cantidad = 56) {
  let estado = semilla >>> 0;
  const azar = () => {
    estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0;
    return estado / 4294967296;
  };
  return Array.from({ length: cantidad }, (_, i) => ({
    angulo: i / cantidad * Math.PI * 2,
    ancho: 8 + azar() * 13,
    fondo: 8 + azar() * 11,
    alto: 12 + Math.pow(azar(), 1.45) * 38,
    color: Math.floor(azar() * 5),
  }));
}
