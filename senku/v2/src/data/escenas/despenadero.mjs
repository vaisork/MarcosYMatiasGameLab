// Despeñadero (maestro, punto 6): Senku encuentra el anclador, cruza el abismo disparando a la
// pared lejana, recoge las garras en la repisa, trepa el risco y vuelve a anclarse para subir la torre.
// Caer al abismo regresa al inicio del despeñadero (decisión de Javier, 30/10/2026).

const SUELO = 600;
const raton = (id, x, y, minX, maxX, extra = {}) => ({
  id, tipo: 'raton', variante: extra.variante || 'negro', comportamiento: extra.comportamiento || 'patrulla',
  x, y: y - 46, w: 72, h: 46, velocidad: extra.velocidad || 80,
  patrulla: { minX, maxX }, hp: null, pisable: true, oleada: 1,
});
const churu = (id, x, y, extra = {}) => ({ id, tipo: 'churu', x, y, w: 30, h: 66, ...extra });

export const escenaDespenadero = {
  id: 'despenadero', nombre: 'Despeñadero',
  limites: { x: 0, y: 0, w: 5120, h: 820 },
  puntoEntrada: { x: 120, y: SUELO - 90 },
  fondo: {
    estilo: 'despenadero', colorRespaldo: '#e9b17a',
    colorSuelo: '#9a5b34', colorPlataforma: '#9a5b34', plataformasVisibles: true,
  },
  plataformas: [
    { id: 'roca-orilla', x: 0, y: SUELO, w: 960, h: 120, tipo: 'plataforma' },
    { id: 'roca-escalon', x: 330, y: 500, w: 140, h: 24, tipo: 'plataforma' },
    { id: 'roca-repisa', x: 1380, y: 560, w: 160, h: 160, tipo: 'plataforma' },
    { id: 'pared-risco', x: 1540, y: 200, w: 100, h: 520, tipo: 'pared' },
    { id: 'roca-meseta', x: 1640, y: 200, w: 1260, h: 520, tipo: 'plataforma' },
    { id: 'anclaje-nido', x: 2400, y: 30, w: 40, h: 50, tipo: 'anclaje' },
    { id: 'roca-bajada', x: 2900, y: 400, w: 400, h: 320, tipo: 'plataforma' },
    { id: 'pared-torre', x: 3900, y: 150, w: 90, h: 570, tipo: 'pared' },
    { id: 'roca-cumbre', x: 3990, y: 150, w: 1130, h: 570, tipo: 'plataforma' },
  ],
  enemigos: [
    raton('risco-raton-1', 1900, 200, 1680, 2300),
    raton('risco-hamster-1', 2500, 200, 2350, 2880, { comportamiento: 'salta', variante: 'cafe' }),
    raton('risco-raton-2', 3050, 400, 2920, 3280, { comportamiento: 'persigue', velocidad: 95 }),
    raton('cumbre-raton-1', 4400, 150, 4050, 4800, { variante: 'cafe', velocidad: 100 }),
  ],
  objetos: [
    { id: 'anclador-despenadero', tipo: 'anclador', x: 600, y: SUELO - 60, w: 44, h: 44 },
    { id: 'garras-despenadero', tipo: 'garras', x: 1440, y: 500, w: 44, h: 44 },
    churu('risco-churu-1', 385, 420),
    churu('risco-churu-2', 1800, 120),
    churu('risco-churu-3', 2700, 120),
    churu('risco-churu-4', 3150, 320),
    churu('risco-churu-5', 4250, 70),
    churu('risco-churu-6', 4700, 70),
    // Sólo se alcanza colgándose del anclaje alto sobre la meseta.
    churu('secreto-nido', 2330, 40, { secreto: true }),
  ],
  secretos: ['secreto-nido'],
  // Caer: los pies por debajo de esta altura.
  alturaCaida: 740,
  disparadores: [{ id: 'hacia-cima', x: 5100, y: 0, w: 20, h: 820,
    destino: 'cima', accion: 'pasar', puntoEntrada: { x: 80, y: 510 } }],
};
