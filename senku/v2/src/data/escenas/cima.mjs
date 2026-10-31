// Cima (maestro, punto 7): Senku recoge el lanzador de ratones y enfrenta al Gato Mecánico.
// Al cruzar a la arena, la entrada se cierra hasta vencerlo.

const SUELO = 600;

export const ARENA = { minX: 1280, maxX: 2560 };

export const escenaCima = {
  id: 'cima', nombre: 'Cima',
  limites: { x: 0, y: 0, w: 2560, h: 720 },
  arte: { tramos: [
    { ruta: 'assets/escenas/cima/01.webp', x: 0, w: 1280 },
    { ruta: 'assets/escenas/cima/02.webp', x: 1280, w: 1280 },
  ] },
  puntoEntrada: { x: 80, y: SUELO - 90 },
  fondo: { estilo: 'cima', colorRespaldo: '#f0a868', colorSuelo: '#6f5a4a',
    colorPlataforma: '#6f5a4a', plataformasVisibles: true },
  plataformas: [
    { id: 'roca-cima', x: 0, y: SUELO, w: 2560, h: 120, tipo: 'plataforma' },
    { id: 'roca-pedestal', x: 513, y: 490, w: 257, h: 110, tipo: 'plataforma' },
    { id: 'roca-saliente-izq', x: 1487, y: 439, w: 214, h: 24, tipo: 'plataforma' },
    { id: 'roca-saliente-der', x: 2145, y: 439, w: 222, h: 24, tipo: 'plataforma' },
  ],
  enemigos: [],
  objetos: [
    { id: 'lanzador-cima', tipo: 'lanzador', x: 610, y: 446, w: 44, h: 44 },
    { id: 'botiquin-cima-1', tipo: 'botiquin', x: 1100, y: 564, w: 36, h: 36, curacion: 25, recogido: false }, // antes de la arena
    { id: 'botiquin-cima-2', tipo: 'botiquin', x: 1575, y: 403, w: 36, h: 36, curacion: 25, recogido: false }, // saliente izquierda de la arena: cuesta un salto
    { id: 'cima-churu-1', tipo: 'churu', x: 760, y: 534, w: 30, h: 66 },
    { id: 'cima-churu-2', tipo: 'churu', x: 980, y: 534, w: 30, h: 66 },
  ],
  secretos: [],
  disparadores: [],
};

export const SUELO_CIMA = SUELO;
