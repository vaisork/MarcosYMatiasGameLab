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
  plataformas: [
    { id: 'suelo-parque', x: 0, y: 600, w: 8960, h: 120, tipo: 'suelo' },
    ...Array.from({ length: 20 }, (_, i) => {
      const x = 300 + i * 430;
      const alturas = [510, 445, 370, 500, 420];
      const y = alturas[i % alturas.length];
      return { id: `roca-${i + 1}`, x, y, w: 130 + (i % 3) * 25, h: 24, tipo: 'plataforma' };
    }),
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
    { ...botiquinDesierto, id: 'botiquin-desierto-1' },
    ...[760, 1540, 2450, 3310, 4320, 5240, 6220, 7140, 8110].map((x, i) => ({
      id: `churu-parque-${i + 1}`, tipo: 'churu', x, y: [534, 384, 304][i % 3], w: 30, h: 66,
    })),
    { id: 'secreto-parque-alto', tipo: 'churu', x: 3890, y: 304, w: 30, h: 66, secreto: true },
    { id: 'secreto-parque-roca', tipo: 'churu', x: 6770, y: 364, w: 30, h: 66, secreto: true },
  ],
  secretos: ['secreto-parque-alto', 'secreto-parque-roca'],
  disparadores: [{ id: 'entrada-desierto', x: 8940, y: 0, w: 20, h: 720,
    destino: 'desierto', accion: 'pasar', puntoEntrada: { x: 80, y: 510 } }],
};
