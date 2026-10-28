import { botiquinDesierto } from '../botiquines.mjs';

// La reja abre el parque; el recorrido continúa sin cortes durante siete pantallas.
export const escenaReja = {
  id: 'reja', nombre: 'Reja',
  limites: { x: 0, y: 0, w: 8960, h: 720 },
  puntoEntrada: { x: 250, y: 558 },
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
      return { id: `roca-${i + 1}`, x, y, w: 130 + (i % 3) * 25, h: 24 };
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
      x, y: 600 - (tipo === 'hamster' ? 28 : 26), w: tipo === 'hamster' ? 42 : 44,
      h: tipo === 'hamster' ? 28 : 26,
      velocidad: 65 + Math.floor(i / 4) * 8,
      patrulla: { minX: Math.max(0, x - 110), maxX: x + 250 },
      hp: null, pisable: true,
    };
  }),
  objetos: [
    { ...botiquinDesierto, id: 'botiquin-desierto-1' },
    ...[760, 1540, 2450, 3310, 4320, 5240, 6220, 7140, 8110].map((x, i) => ({
      id: `churu-parque-${i + 1}`, tipo: 'churu', x, y: [540, 450, 365][i % 3], w: 22, h: 58,
    })),
    { id: 'secreto-parque-alto', tipo: 'churu', x: 3890, y: 300, w: 22, h: 58, secreto: true },
    { id: 'secreto-parque-roca', tipo: 'churu', x: 6770, y: 330, w: 22, h: 58, secreto: true },
  ],
  secretos: ['secreto-parque-alto', 'secreto-parque-roca'],
  disparadores: [],
};
