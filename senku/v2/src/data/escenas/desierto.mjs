import { botiquinDesierto } from '../botiquines.mjs';

// Tramo largo posterior a la reja: cinco pantallas de exploración continua.
const SUELOS = [[0, 600], [1280, 575], [3840, 600], [5120, 610]];
const sueloEn = (x) => SUELOS.findLast(([desde]) => x >= desde)[1];

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
    // El camino pintado cambia de altura entre tramos: un suelo por tramo (revisión 31/10).
    { id: 'suelo-desierto-1', x: 0, y: 600, w: 1280, h: 120, tipo: 'suelo' },
    { id: 'suelo-desierto-2', x: 1280, y: 575, w: 2560, h: 145, tipo: 'suelo' },
    { id: 'suelo-desierto-3', x: 3840, y: 600, w: 1280, h: 120, tipo: 'suelo' },
    { id: 'suelo-desierto-4', x: 5120, y: 610, w: 1280, h: 110, tipo: 'suelo' },
    { id: 'duna-roca-1', x: 73, y: 486, w: 155, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-2', x: 320, y: 403, w: 153, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-3', x: 594, y: 455, w: 166, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-4', x: 858, y: 347, w: 154, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-5', x: 1075, y: 486, w: 147, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-6', x: 1378, y: 464, w: 167, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-7', x: 1625, y: 364, w: 157, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-8', x: 1880, y: 423, w: 165, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-9', x: 2118, y: 340, w: 157, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-10', x: 2310, y: 464, w: 165, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-11', x: 2615, y: 455, w: 153, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-12', x: 2872, y: 389, w: 156, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-13', x: 3133, y: 435, w: 157, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-14', x: 3390, y: 373, w: 158, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-15', x: 3640, y: 454, w: 155, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-16', x: 3932, y: 511, w: 148, h: 24, tipo: 'plataforma' },
    { id: 'secreto-loma-1', x: 4410, y: 440, w: 140, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-19', x: 4662, y: 526, w: 133, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-21', x: 5220, y: 533, w: 132, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-22', x: 5448, y: 454, w: 149, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-23', x: 5698, y: 503, w: 150, h: 24, tipo: 'plataforma' },
    { id: 'secreto-loma-2', x: 5905, y: 395, w: 155, h: 24, tipo: 'plataforma' },
    { id: 'duna-roca-24', x: 6165, y: 530, w: 145, h: 24, tipo: 'plataforma' },
  ],
  enemigos: Array.from({ length: 20 }, (_, i) => {
    const x = 430 + i * 300;
    const hamster = i % 2 === 1;
    const h = hamster ? 48 : 46;
    return { id: `desierto-enemigo-${i + 1}`, tipo: hamster ? 'hamster' : 'raton',
      variante: i % 4 < 2 ? 'negro' : 'cafe', comportamiento: ['patrulla', 'salta', 'persigue', 'emboscada'][i % 4],
      oleada: Math.floor(i / 2) + 1, x, y: sueloEn(x) - h, w: 72, h, velocidad: 72 + (i % 5) * 8,
      patrulla: { minX: x - 90, maxX: x + 220 }, hp: null, pisable: true };
  }),
  objetos: [
    { ...botiquinDesierto, id: 'botiquin-desierto-1', x: 868, y: 311 },
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `desierto-churu-${i + 1}`, tipo: 'churu',
      x: [135, 381, 662, 920, 1133, 4465, 1446, 1688, 1947, 2181, 5967, 6222][i],
      y: [420, 337, 389, 281, 420, 374, 398, 298, 357, 274, 329, 464][i], w: 30, h: 66,
      ...(i === 5 || i === 10 ? { secreto: true } : {}),
    })),
  ],
  secretos: ['desierto-churu-6', 'desierto-churu-11'],
  // Al final del parque empieza el despeñadero.
  disparadores: [{ id: 'hacia-despenadero', x: 6380, y: 0, w: 20, h: 720,
    destino: 'despenadero', accion: 'pasar', puntoEntrada: { x: 120, y: 510 } }],
};
