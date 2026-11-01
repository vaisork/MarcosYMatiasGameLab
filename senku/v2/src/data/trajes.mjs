// Catálogo único de tienda y arte. Rutas relativas a senku/v2/assets/.
const precios = {
  explorador: 10, vaquero: 25, ninja: 50, magico: 75, especial: 100,
  chef: 120, mexicano: 150, espacial: 180, dinosaurio: 200, playa: 230,
  sigilo: 260, punk: 300,
};
const nombres = {
  explorador: 'Traje de explorador', vaquero: 'Traje de vaquero', ninja: 'Traje ninja',
  magico: 'Traje mágico', especial: 'Traje especial', chef: 'Traje de chef',
  mexicano: 'Traje mexicano', espacial: 'Traje espacial', dinosaurio: 'Traje de dinosaurio',
  playa: 'Traje de playa', sigilo: 'Traje de sigilo', punk: 'Traje punk',
};
const ids = Object.keys(precios);
const rutaId = (id) => id.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const TRAJES = Object.freeze({
  original: Object.freeze({
    id: 'original', nombre: 'Traje inicial', siempreDesbloqueado: true,
    precio: null, condicion: null, equivaleA: Object.freeze([]),
    menu: 'assets/personajes/menu_original.webp', sprite: 'assets/personajes/sprite_original.png',
  }),
  ...Object.fromEntries(ids.map((id) => [id, Object.freeze({
    id, nombre: nombres[id], siempreDesbloqueado: false, precio: precios[id],
    condicion: null, equivaleA: Object.freeze([]),
    menu: `assets/personajes/menu_${rutaId(id)}.webp`,
    sprite: `assets/personajes/sprite_${rutaId(id)}.png`,
  })])),
  rata: Object.freeze({
    id: 'rata', nombre: 'Traje exclusivo', siempreDesbloqueado: false,
    precio: null, condicion: 'Encontrar y hablar con la rata de la taquería',
    equivaleA: Object.freeze(['secreto_legacy']),
    menu: 'assets/personajes/menu_rata.webp', sprite: 'assets/personajes/sprite_rata.png',
  }),
});

// Compatibilidad del identificador secreto que ya usan partidas migradas.
export function normalizarTrajesDeLegacy(estado) {
  if (!estado || typeof estado !== 'object' || Array.isArray(estado)
      || !Array.isArray(estado.trajes)
      || !estado.trajes.every((id) => typeof id === 'string' && id.trim().length > 0)) {
    return { error: 'estado_invalido' };
  }
  const trajes = [...new Set(['original', ...estado.trajes])];
  const equivalentes = ['rata', ...TRAJES.rata.equivaleA];
  if (equivalentes.some((id) => trajes.includes(id))) {
    for (const id of equivalentes) if (!trajes.includes(id)) trajes.push(id);
  }
  const equipado = TRAJES.rata.equivaleA.includes(estado.equipado) ? 'rata' : estado.equipado;
  return { ...estado, trajes, equipado: trajes.includes(equipado) ? equipado : 'original' };
}
