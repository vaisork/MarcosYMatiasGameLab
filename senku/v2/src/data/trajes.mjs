// Rutas relativas a senku/v2/assets/. Son destinos provisionales, todavía inexistentes:
// el menú y los sprites vendrán del arte nuevo de Matías, sin reutilizar arte de Legacy.
export const TRAJES = Object.freeze({
  original: Object.freeze({
    id: 'original',
    nombre: 'Original',
    siempreDesbloqueado: true,
    precio: null,
    condicion: null,
    equivaleA: Object.freeze([]),
    menu: 'trajes/original/menu.png',
    sprite: 'trajes/original/sprite.png',
  }),
  rata: Object.freeze({
    id: 'rata',
    nombre: 'Rata',
    siempreDesbloqueado: false,
    precio: null,
    condicion: null,
    equivaleA: Object.freeze(['secreto_legacy']),
    menu: 'trajes/rata/menu.png',
    sprite: 'trajes/rata/sprite.png',
  }),
});

// Aplicar después de iniciar/cargar y al conceder 'rata' por una recompensa.
// Conserva ambos ids de desbloqueo para compatibilidad; el equipado usa 'rata'.
// No decide cómo se gana el traje ni escribe en el almacenamiento de Legacy.
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
