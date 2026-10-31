import { botiquinDesierto } from '../botiquines.mjs';

// Tramo largo posterior a la reja: cinco pantallas de exploración continua.
export const escenaDesierto = {
  id: 'desierto', nombre: 'Desierto',
  limites: { x: 0, y: 0, w: 6400, h: 720 },
  puntoEntrada: { x: 100, y: 510 },
  fondo: { estilo: 'desierto', colorRespaldo: '#ecc98b', colorSuelo: '#b98042', colorPlataforma: '#b98042', plataformasVisibles: true },
  arte: { tramos: Array.from({ length: 5 }, (_, i) => ({
    ruta: `assets/escenas/desierto/${String(i + 1).padStart(2, '0')}.webp`,
    x: i * 1280, w: 1280,
  })) },
  plataformas: [
    { id: 'suelo-desierto', x: 0, y: 600, w: 6400, h: 120, tipo: 'suelo' },
    { id: 'duna-roca-1', x: 80, y: 515, w: 200, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-2', x: 320, y: 420, w: 180, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-3', x: 580, y: 480, w: 200, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-4', x: 840, y: 370, w: 190, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-5', x: 1070, y: 515, w: 180, h: 24, tipo: 'plataforma' },

    { id: 'duna-roca-6', x: 1370, y: 515, w: 190, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-7', x: 1630, y: 420, w: 180, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-8', x: 1870, y: 485, w: 190, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-9', x: 2120, y: 380, w: 190, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-10', x: 2350, y: 515, w: 180, h: 24, tipo: 'plataforma' },

    { id: 'duna-roca-11', x: 2625, y: 515, w: 180, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-12', x: 2870, y: 465, w: 180, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-13', x: 3110, y: 510, w: 200, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-14', x: 3360, y: 435, w: 190, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-15', x: 3630, y: 515, w: 170, h: 24, tipo: 'plataforma' },

    { id: 'duna-roca-16', x: 3910, y: 515, w: 180, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-17', x: 4090, y: 440, w: 170, h: 24, tipo: 'plataforma' },
    { id: 'secreto-loma-1', x: 4280, y: 365, w: 180, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-18', x: 4490, y: 485, w: 190, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-19', x: 4740, y: 515, w: 180, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-20', x: 4950, y: 420, w: 170, h: 24, tipo: 'plataforma' },

    { id: 'duna-roca-21', x: 5170, y: 515, w: 180, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-22', x: 5400, y: 435, w: 190, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-23', x: 5660, y: 480, w: 190, h: 24, tipo: 'plataforma' },
    { id: 'secreto-loma-2', x: 5900, y: 385, w: 190, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-24', x: 6160, y: 515, w: 180, h: 24, tipo: 'plataforma' },
  ],
  enemigos: Array.from({ length: 20 }, (_, i) => {
    const x = 430 + i * 300;
    const hamster = i % 2 === 1;
    const h = hamster ? 48 : 46;
    return { id: `desierto-enemigo-${i + 1}`, tipo: hamster ? 'hamster' : 'raton',
      variante: i % 4 < 2 ? 'negro' : 'cafe', comportamiento: ['patrulla', 'salta', 'persigue', 'emboscada'][i % 4],
      oleada: Math.floor(i / 2) + 1, x, y: 600 - h, w: 72, h, velocidad: 72 + (i % 5) * 8,
      patrulla: { minX: x - 90, maxX: x + 220 }, hp: null, dano: hamster ? 2 : 1, pisable: true };
  }),
  objetos: [
    { ...botiquinDesierto, id: 'botiquin-desierto-1', x: 910, y: 334 },
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `desierto-churu-${i + 1}`, tipo: 'churu',
      x: [120, 390, 650, 910, 1140, 4320, 1430, 1690, 1930, 2160, 5940, 6190][i],
      y: [449, 354, 414, 304, 449, 299, 449, 354, 419, 314, 319, 449][i], w: 30, h: 66,
      ...(i === 5 || i === 10 ? { secreto: true } : {}),
    })),
  ],
  secretos: ['desierto-churu-6', 'desierto-churu-11'],
  // Al final del parque empieza el despeñadero.
  disparadores: [{ id: 'hacia-despenadero', x: 6380, y: 0, w: 20, h: 720,
    destino: 'despenadero', accion: 'pasar', puntoEntrada: { x: 120, y: 510 } }],
};
