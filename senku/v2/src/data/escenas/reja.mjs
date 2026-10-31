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
    // Formaciones escalonadas accesibles (subidas <= 90 px, sin saltos imposibles desde el suelo)
    { id: 'roca-1', x: 400, y: 515, w: 150, h: 24, tipo: 'plataforma' },
    { id: 'roca-2', x: 530, y: 435, w: 150, h: 24, tipo: 'plataforma' },
    { id: 'roca-3', x: 700, y: 510, w: 160, h: 24, tipo: 'plataforma' }, // churu-parque-1 (x: 760)

    { id: 'roca-4', x: 1320, y: 515, w: 140, h: 24, tipo: 'plataforma' },
    { id: 'roca-5', x: 1480, y: 510, w: 160, h: 24, tipo: 'plataforma' }, // churu-parque-2 (x: 1540)
    { id: 'roca-6', x: 1800, y: 440, w: 150, h: 24, tipo: 'plataforma' },
    { id: 'roca-7', x: 2260, y: 515, w: 140, h: 24, tipo: 'plataforma' },
    { id: 'roca-8', x: 2390, y: 430, w: 160, h: 24, tipo: 'plataforma' }, // churu-parque-3 (x: 2450)

    { id: 'roca-9', x: 3100, y: 515, w: 140, h: 24, tipo: 'plataforma' },
    { id: 'roca-10', x: 3250, y: 510, w: 160, h: 24, tipo: 'plataforma' }, // churu-parque-4 (x: 3310)
    { id: 'roca-11', x: 3560, y: 515, w: 140, h: 24, tipo: 'plataforma' },
    { id: 'roca-12', x: 3690, y: 430, w: 140, h: 24, tipo: 'plataforma' },
    { id: 'roca-13', x: 3820, y: 350, w: 160, h: 24, tipo: 'plataforma' }, // secreto-parque-alto (x: 3890)

    { id: 'roca-14', x: 4130, y: 515, w: 140, h: 24, tipo: 'plataforma' },
    { id: 'roca-15', x: 4260, y: 430, w: 160, h: 24, tipo: 'plataforma' }, // churu-parque-5 (x: 4320)
    { id: 'roca-16', x: 4680, y: 510, w: 150, h: 24, tipo: 'plataforma' },

    { id: 'roca-17', x: 5040, y: 515, w: 140, h: 24, tipo: 'plataforma' },
    { id: 'roca-18', x: 5180, y: 510, w: 160, h: 24, tipo: 'plataforma' }, // churu-parque-6 (x: 5240)
    { id: 'roca-19', x: 5560, y: 440, w: 150, h: 24, tipo: 'plataforma' },
    { id: 'roca-20', x: 6030, y: 515, w: 140, h: 24, tipo: 'plataforma' },
    { id: 'roca-21', x: 6160, y: 430, w: 160, h: 24, tipo: 'plataforma' }, // churu-parque-7 (x: 6220)

    { id: 'roca-22', x: 6580, y: 515, w: 140, h: 24, tipo: 'plataforma' },
    { id: 'roca-23', x: 6710, y: 430, w: 160, h: 24, tipo: 'plataforma' }, // secreto-parque-roca (x: 6770)
    { id: 'roca-24', x: 7080, y: 510, w: 160, h: 24, tipo: 'plataforma' }, // churu-parque-8 (x: 7140)

    { id: 'roca-25', x: 7920, y: 515, w: 140, h: 24, tipo: 'plataforma' },
    { id: 'roca-26', x: 8050, y: 430, w: 160, h: 24, tipo: 'plataforma' }, // churu-parque-9 (x: 8110)
    { id: 'roca-27', x: 8480, y: 510, w: 160, h: 24, tipo: 'plataforma' },
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
    { id: 'churu-parque-1', tipo: 'churu', x: 760, y: 444, w: 30, h: 66 },
    { id: 'churu-parque-2', tipo: 'churu', x: 1540, y: 444, w: 30, h: 66 },
    { id: 'churu-parque-3', tipo: 'churu', x: 2450, y: 364, w: 30, h: 66 },
    { id: 'churu-parque-4', tipo: 'churu', x: 3310, y: 444, w: 30, h: 66 },
    { id: 'churu-parque-5', tipo: 'churu', x: 4320, y: 364, w: 30, h: 66 },
    { id: 'churu-parque-6', tipo: 'churu', x: 5240, y: 444, w: 30, h: 66 },
    { id: 'churu-parque-7', tipo: 'churu', x: 6220, y: 364, w: 30, h: 66 },
    { id: 'churu-parque-8', tipo: 'churu', x: 7140, y: 444, w: 30, h: 66 },
    { id: 'churu-parque-9', tipo: 'churu', x: 8110, y: 364, w: 30, h: 66 },
    { id: 'secreto-parque-alto', tipo: 'churu', x: 3890, y: 284, w: 30, h: 66, secreto: true },
    { id: 'secreto-parque-roca', tipo: 'churu', x: 6770, y: 364, w: 30, h: 66, secreto: true },
  ],
  secretos: ['secreto-parque-alto', 'secreto-parque-roca'],
  disparadores: [{ id: 'entrada-desierto', x: 8940, y: 0, w: 20, h: 720,
    destino: 'desierto', accion: 'pasar', puntoEntrada: { x: 80, y: 510 } }],
};
