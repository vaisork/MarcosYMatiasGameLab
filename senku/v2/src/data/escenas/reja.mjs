import { botiquinDesierto } from '../botiquines.mjs';

// La reja abre el parque; el recorrido continúa sin cortes durante siete pantallas.
export const escenaReja = {
  id: 'reja', nombre: 'Reja',
  limites: { x: 0, y: 0, w: 8960, h: 720 },
  puntoEntrada: { x: 250, y: 510 },
  fondo: {
    estilo: 'desierto', colorRespaldo: '#ecc98b',
    colorSuelo: '#b98042', colorPlataforma: '#b98042', plataformasVisibles: true,
  },
  arte: { tramos: Array.from({ length: 7 }, (_, i) => ({
    ruta: `assets/escenas/reja/${String(i + 1).padStart(2, '0')}.webp`,
    x: i * 1280, w: 1280,
  })) },
  plataformas: [
    { id: 'suelo-parque', x: 0, y: 600, w: 8960, h: 120, tipo: 'suelo' },
    // Las superficies siguen las rocas ilustradas y ascienden en pasos de 80 px.
    { id: 'roca-1', x: 430, y: 515, w: 260, h: 24, tipo: 'plataforma' },
    { id: 'roca-2', x: 660, y: 435, w: 210, h: 24, tipo: 'plataforma' },
    { id: 'roca-3', x: 930, y: 510, w: 240, h: 24, tipo: 'plataforma' },

    { id: 'roca-4', x: 1370, y: 515, w: 180, h: 24, tipo: 'plataforma' },
    { id: 'roca-5', x: 1655, y: 515, w: 180, h: 24, tipo: 'plataforma' },
    { id: 'roca-6', x: 1940, y: 435, w: 190, h: 24, tipo: 'plataforma' },
    { id: 'roca-7', x: 2390, y: 515, w: 160, h: 24, tipo: 'plataforma' },

    { id: 'roca-8', x: 2640, y: 515, w: 230, h: 24, tipo: 'plataforma' },
    { id: 'roca-9', x: 2940, y: 515, w: 220, h: 24, tipo: 'plataforma' },
    { id: 'roca-10', x: 3190, y: 515, w: 240, h: 24, tipo: 'plataforma' },
    { id: 'roca-11', x: 3470, y: 435, w: 200, h: 24, tipo: 'plataforma' },
    { id: 'roca-12', x: 3690, y: 350, w: 150, h: 24, tipo: 'plataforma' },

    { id: 'roca-13', x: 3925, y: 515, w: 220, h: 24, tipo: 'plataforma' },
    { id: 'roca-14', x: 4180, y: 435, w: 220, h: 24, tipo: 'plataforma' },
    { id: 'roca-15', x: 4450, y: 515, w: 210, h: 24, tipo: 'plataforma' },
    { id: 'roca-16', x: 4700, y: 435, w: 190, h: 24, tipo: 'plataforma' },
    { id: 'roca-17', x: 4930, y: 515, w: 220, h: 24, tipo: 'plataforma' },

    { id: 'roca-18', x: 5180, y: 515, w: 210, h: 24, tipo: 'plataforma' },
    { id: 'roca-19', x: 5480, y: 435, w: 190, h: 24, tipo: 'plataforma' },
    { id: 'roca-20', x: 5730, y: 515, w: 220, h: 24, tipo: 'plataforma' },
    { id: 'roca-21', x: 5990, y: 435, w: 190, h: 24, tipo: 'plataforma' },
    { id: 'roca-22', x: 6220, y: 515, w: 220, h: 24, tipo: 'plataforma' },

    { id: 'roca-23', x: 6480, y: 515, w: 220, h: 24, tipo: 'plataforma' },
    { id: 'roca-24', x: 6750, y: 435, w: 210, h: 24, tipo: 'plataforma' },
    { id: 'roca-25', x: 7040, y: 510, w: 220, h: 24, tipo: 'plataforma' },
    { id: 'roca-26', x: 7280, y: 435, w: 200, h: 24, tipo: 'plataforma' },
    { id: 'roca-27', x: 7520, y: 510, w: 220, h: 24, tipo: 'plataforma' },

    { id: 'roca-28', x: 7740, y: 515, w: 210, h: 24, tipo: 'plataforma' },
    { id: 'roca-29', x: 8025, y: 435, w: 190, h: 24, tipo: 'plataforma' },
    { id: 'roca-30', x: 8280, y: 510, w: 200, h: 24, tipo: 'plataforma' },
    { id: 'roca-31', x: 8550, y: 435, w: 180, h: 24, tipo: 'plataforma' },
    { id: 'roca-32', x: 8760, y: 515, w: 190, h: 24, tipo: 'plataforma' },
  ],
  enemigos: Array.from({ length: 24 }, (_, i) => {
    const x = 520 + i * 350;
    const tipo = ['raton', 'hamster', 'raton', 'hamster'][i % 4];
    const variante = ['negro', 'cafe'][Math.floor(i / 2) % 2];
    const comportamiento = ['patrulla', 'salta', 'persigue', 'emboscada'][i % 4];
    return {
      id: `parque-${tipo}-${variante}-${i + 1}`, tipo, variante, comportamiento,
      oleada: Math.floor(i / 3) + 1,
      x, y: 600 - (tipo === 'hamster' ? 48 : 46), w: 72,
      h: tipo === 'hamster' ? 48 : 46,
      velocidad: 65 + Math.floor(i / 4) * 8,
      patrulla: { minX: Math.max(0, x - 110), maxX: x + 250 },
      hp: null, pisable: true,
    };
  }),
  objetos: [
    { ...botiquinDesierto, id: 'botiquin-desierto-1', x: 1010, y: 560 },
    { id: 'churu-parque-1', tipo: 'churu', x: 1000, y: 444, w: 30, h: 66 },
    { id: 'churu-parque-2', tipo: 'churu', x: 1435, y: 449, w: 30, h: 66 },
    { id: 'churu-parque-3', tipo: 'churu', x: 3260, y: 449, w: 30, h: 66 },
    { id: 'churu-parque-4', tipo: 'churu', x: 2400, y: 449, w: 30, h: 66 },
    { id: 'churu-parque-5', tipo: 'churu', x: 4980, y: 449, w: 30, h: 66 },
    { id: 'churu-parque-6', tipo: 'churu', x: 5520, y: 369, w: 30, h: 66 },
    { id: 'churu-parque-7', tipo: 'churu', x: 6540, y: 449, w: 30, h: 66 },
    { id: 'churu-parque-8', tipo: 'churu', x: 8100, y: 369, w: 30, h: 66 },
    { id: 'churu-parque-9', tipo: 'churu', x: 8830, y: 449, w: 30, h: 66 },
    { id: 'secreto-parque-alto', tipo: 'churu', x: 4720, y: 369, w: 30, h: 66, secreto: true },
    { id: 'secreto-parque-roca', tipo: 'churu', x: 6810, y: 369, w: 30, h: 66, secreto: true },
  ],
  secretos: ['secreto-parque-alto', 'secreto-parque-roca'],
  disparadores: [{ id: 'entrada-desierto', x: 8940, y: 0, w: 20, h: 720,
    destino: 'desierto', accion: 'pasar', puntoEntrada: { x: 80, y: 510 } }],
};
