export const MEJORAS = {
  cuerda: { nombre: 'Cuerda más larga', precio: (nivel) => 40 * (nivel + 1), max: 5 },
  salto: { nombre: 'Salto más alto', precio: (nivel) => 30 * (nivel + 1), max: 5 },
  vuelo: { nombre: 'Vuelo permanente', precio: () => 500, unico: true },
};

export const crearEstadoTienda = () => ({ cuerda: 0, salto: 0, vuelo: 0 });

export function comprar(estado, id) {
  const mejora = MEJORAS[id];
  if (!mejora) return null;
  const niveles = { ...crearEstadoTienda(), ...estado.niveles };
  const nivel = niveles[id];
  if ((mejora.unico && nivel > 0) || nivel >= (mejora.max ?? Infinity)) return null;
  const precio = mejora.precio(nivel);
  if (estado.churus < precio) return null;
  return {
    churus: estado.churus - precio,
    niveles: { ...niveles, [id]: nivel + 1 },
    precio,
  };
}
