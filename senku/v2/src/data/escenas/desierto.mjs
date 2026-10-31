import { botiquinDesierto } from '../botiquines.mjs';

// Tramo largo posterior a la reja: cinco pantallas de exploración continua.
export const escenaDesierto = {
  id: 'desierto', nombre: 'Desierto',
  limites: { x: 0, y: 0, w: 6400, h: 720 },
  puntoEntrada: { x: 100, y: 510 },
  fondo: { estilo: 'desierto', colorRespaldo: '#ecc98b', colorSuelo: '#b98042', colorPlataforma: '#b98042', plataformasVisibles: true },
  plataformas: [
    { id: 'suelo-desierto', x: 0, y: 600, w: 6400, h: 120, tipo: 'suelo' },
    ...Array.from({ length: 20 }, (_, i) => {
      const pantalla = Math.floor(i / 4);
      const local = i % 4;
      const x = pantalla * 1280 + 250 + local * 245;
      const y = [510, 420, 480, 360][(local + pantalla) % 4];
      return { id: `duna-roca-${i + 1}`, x, y, w: 150 + (i % 3) * 28, h: 24, tipo: 'plataforma' };
    }),
    { id: 'secreto-loma-1', x: 2810, y: 365, w: 180, h: 24, tipo: 'plataforma' },
    { id: 'secreto-loma-2', x: 5370, y: 385, w: 180, h: 24, tipo: 'plataforma' },
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
    { ...botiquinDesierto, id: 'botiquin-desierto-1', x: 910, y: 460 },
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `desierto-churu-${i + 1}`, tipo: 'churu',
      x: [360, 850, 1480, 1960, 2460, 2850, 3510, 4020, 4540, 5010, 5410, 6060][i],
      y: i === 5 ? 299 : i === 10 ? 319 : 534, w: 30, h: 66,
      ...(i === 5 || i === 10 ? { secreto: true } : {}),
    })),
  ],
  secretos: ['desierto-churu-6', 'desierto-churu-11'],
  disparadores: [],
};
