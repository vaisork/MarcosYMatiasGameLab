import { botiquinDesierto } from '../botiquines.mjs';

// Continuación del desierto con la misma escala y alturas de salto. Reja decorativa.
export const escenaReja = {
  id: 'reja', nombre: 'Reja',
  limites: { x: 0, y: 0, w: 1280, h: 720 },
  puntoEntrada: { x: 100, y: 558 },
  fondo: {
    ruta: 'assets/fondos/camioneta_reja.webp', colorRespaldo: '#ecc98b',
    colorSuelo: '#b98042', colorPlataforma: '#b98042', plataformasVisibles: true,
  },
  plataformas: [
    { id: 'suelo-reja', x: 0, y: 600, w: 1280, h: 120, tipo: 'suelo' },
    { id: 'reja-roca-baja', x: 330, y: 510, w: 150, h: 24 },
    { id: 'reja-roca-alta', x: 550, y: 420, w: 160, h: 24 },
    { id: 'reja-roca-derecha', x: 850, y: 510, w: 160, h: 24 },
  ],
  enemigos: [],
  // La recogida de churus aún no está conectada al juego; se usa sólo el botiquín.
  objetos: [{ ...botiquinDesierto, id: 'botiquin-reja-1' }],
  disparadores: [
    { id: 'salida-desierto', x: 0, y: 0, w: 24, h: 720,
      destino: 'desierto', accion: 'pasar', puntoEntrada: { x: 1120, y: 558 } },
  ],
};
