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
    // Cada superficie coincide con el borde superior de una roca pintada (revisión 31/10).
    { id: 'roca-1', x: 445, y: 518, w: 245, h: 24, tipo: 'plataforma' },
    { id: 'roca-2', x: 662, y: 424, w: 208, h: 24, tipo: 'plataforma' },
    { id: 'roca-3', x: 935, y: 499, w: 237, h: 24, tipo: 'plataforma' },
    { id: 'roca-4', x: 1375, y: 496, w: 140, h: 24, tipo: 'plataforma' },
    { id: 'roca-5', x: 1670, y: 496, w: 165, h: 24, tipo: 'plataforma' },
    { id: 'roca-6', x: 1940, y: 428, w: 190, h: 24, tipo: 'plataforma' },
    { id: 'roca-7', x: 2385, y: 501, w: 127, h: 24, tipo: 'plataforma' },
    { id: 'roca-8', x: 2715, y: 492, w: 145, h: 24, tipo: 'plataforma' },
    { id: 'roca-9', x: 2938, y: 488, w: 144, h: 24, tipo: 'plataforma' },
    { id: 'roca-10', x: 3240, y: 492, w: 168, h: 24, tipo: 'plataforma' },
    { id: 'roca-11', x: 3448, y: 420, w: 160, h: 24, tipo: 'plataforma' },
    { id: 'roca-12', x: 3658, y: 350, w: 180, h: 24, tipo: 'plataforma' },
    { id: 'roca-13', x: 3933, y: 482, w: 177, h: 24, tipo: 'plataforma' },
    { id: 'roca-14', x: 4218, y: 418, w: 184, h: 24, tipo: 'plataforma' },
    { id: 'roca-15', x: 4468, y: 482, w: 175, h: 24, tipo: 'plataforma' },
    { id: 'roca-16', x: 4710, y: 418, w: 180, h: 24, tipo: 'plataforma' },
    { id: 'roca-17', x: 4937, y: 482, w: 148, h: 24, tipo: 'plataforma' },
    { id: 'roca-18', x: 5180, y: 472, w: 213, h: 24, tipo: 'plataforma' },
    { id: 'roca-19', x: 5457, y: 400, w: 183, h: 24, tipo: 'plataforma' },
    { id: 'roca-20', x: 5733, y: 476, w: 210, h: 24, tipo: 'plataforma' },
    { id: 'roca-21', x: 5970, y: 399, w: 185, h: 24, tipo: 'plataforma' },
    { id: 'roca-22', x: 6178, y: 475, w: 177, h: 24, tipo: 'plataforma' },
    { id: 'roca-23', x: 6465, y: 529, w: 165, h: 24, tipo: 'plataforma' },
    { id: 'roca-24', x: 6723, y: 446, w: 159, h: 24, tipo: 'plataforma' },
    { id: 'roca-25', x: 6973, y: 526, w: 179, h: 24, tipo: 'plataforma' },
    { id: 'roca-26', x: 7238, y: 446, w: 167, h: 24, tipo: 'plataforma' },
    { id: 'roca-27', x: 7478, y: 532, w: 154, h: 24, tipo: 'plataforma' },
    { id: 'roca-28', x: 7775, y: 481, w: 142, h: 24, tipo: 'plataforma' },
    { id: 'roca-29', x: 8018, y: 418, w: 157, h: 24, tipo: 'plataforma' },
    { id: 'roca-30', x: 8270, y: 480, w: 155, h: 24, tipo: 'plataforma' },
    { id: 'roca-31', x: 8520, y: 418, w: 145, h: 24, tipo: 'plataforma' },
    { id: 'roca-32', x: 8755, y: 482, w: 143, h: 24, tipo: 'plataforma' },
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
    // Id propio: antes repetía el del desierto y recogerlo aquí lo borraba allá.
    { ...botiquinDesierto, id: 'botiquin-reja-1', x: 1010, y: 560 },
    { id: 'botiquin-reja-2', tipo: 'botiquin', x: 6000, y: 564, w: 36, h: 36, curacion: 25, recogido: false },
    { id: 'churu-parque-1', tipo: 'churu', x: 1038, y: 433, w: 30, h: 66 },
    { id: 'churu-parque-2', tipo: 'churu', x: 1430, y: 430, w: 30, h: 66 },
    { id: 'churu-parque-3', tipo: 'churu', x: 3309, y: 426, w: 30, h: 66 },
    { id: 'churu-parque-4', tipo: 'churu', x: 2433, y: 435, w: 30, h: 66 },
    { id: 'churu-parque-5', tipo: 'churu', x: 4996, y: 416, w: 30, h: 66 },
    { id: 'churu-parque-6', tipo: 'churu', x: 5533, y: 334, w: 30, h: 66 },
    { id: 'churu-parque-7', tipo: 'churu', x: 6532, y: 463, w: 30, h: 66 },
    { id: 'churu-parque-8', tipo: 'churu', x: 8081, y: 352, w: 30, h: 66 },
    { id: 'churu-parque-9', tipo: 'churu', x: 8811, y: 416, w: 30, h: 66 },
    { id: 'secreto-parque-alto', tipo: 'churu', x: 4785, y: 352, w: 30, h: 66, secreto: true },
    { id: 'secreto-parque-roca', tipo: 'churu', x: 6787, y: 380, w: 30, h: 66, secreto: true },
  ],
  secretos: ['secreto-parque-alto', 'secreto-parque-roca'],
  disparadores: [{ id: 'entrada-desierto', x: 8940, y: 0, w: 20, h: 720,
    destino: 'desierto', accion: 'pasar', puntoEntrada: { x: 80, y: 510 } }],
};
