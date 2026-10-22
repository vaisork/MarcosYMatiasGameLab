// Catálogo de definiciones de datos para enemigos en Senku 2.
// Valores creativos pendientes (daño, HP, recompensas, etc.) se declaran como null.
// El motor de juego y de combate tolera valores nulos sin fallar.

export const CATALOGO_ENEMIGOS = {
  cucaracha: {
    tipo: 'cucaracha',
    nombre: 'Cucaracha de taquería',
    ancho: 36,
    alto: 20,
    velocidadPatrulla: 70, // px/s
    hp: null,              // Pendiente decisión D5
    dano: null,            // Pendiente decisión D5
    pisable: true,         // Permite ser derrotada con pisotón
    recompensaChurus: null,// Pendiente decisión creativa
    color: '#6e4720',      // Rectángulo provisional
    colorDetalle: '#3a200a',
  },
  rata_menor: {
    tipo: 'rata_menor',
    nombre: 'Rata menor',
    ancho: 44,
    alto: 26,
    velocidadPatrulla: 95,
    hp: null,
    dano: null,
    pisable: true,
    recompensaChurus: null,
    color: '#7f8c8d',
    colorDetalle: '#2c3e50',
  },
};

export function obtenerPlantillaEnemigo(tipo) {
  if (!tipo || typeof tipo !== 'string') return null;
  return CATALOGO_ENEMIGOS[tipo] || null;
}
