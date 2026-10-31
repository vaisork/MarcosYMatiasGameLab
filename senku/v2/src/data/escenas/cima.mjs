// Cima (maestro, punto 7): Senku recoge el lanzador de ratones y enfrenta al Gato Mecánico.
// Al cruzar a la arena, la entrada se cierra hasta vencerlo.

const SUELO = 600;

export const ARENA = { minX: 1280, maxX: 2560 };

export const escenaCima = {
  id: 'cima', nombre: 'Cima',
  limites: { x: 0, y: 0, w: 2560, h: 720 },
  puntoEntrada: { x: 80, y: SUELO - 90 },
  fondo: { estilo: 'cima', colorRespaldo: '#f0a868', colorSuelo: '#6f5a4a',
    colorPlataforma: '#6f5a4a', plataformasVisibles: true },
  plataformas: [
    { id: 'roca-cima', x: 0, y: SUELO, w: 2560, h: 120, tipo: 'plataforma' },
    { id: 'roca-pedestal', x: 420, y: 520, w: 150, h: 80, tipo: 'plataforma' },
    { id: 'roca-saliente-izq', x: 1500, y: 430, w: 170, h: 24, tipo: 'plataforma' },
    { id: 'roca-saliente-der', x: 2170, y: 430, w: 170, h: 24, tipo: 'plataforma' },
  ],
  enemigos: [],
  objetos: [
    { id: 'lanzador-cima', tipo: 'lanzador', x: 473, y: 460, w: 44, h: 44 },
    { id: 'cima-churu-1', tipo: 'churu', x: 760, y: 534, w: 30, h: 66 },
    { id: 'cima-churu-2', tipo: 'churu', x: 980, y: 534, w: 30, h: 66 },
  ],
  secretos: [],
  disparadores: [],
};

export const SUELO_CIMA = SUELO;
