// Catálogo de definiciones de datos para enemigos en Senku 2.
// Enemigos pequeños del parque causan 1 punto de daño por golpe.
// HP de enemigos se conserva en null para que el pisotón los derrote de un golpe.

export const DANO_CUCARACHA = 1;
export const DANO_RATA = 1;
export const DANO_RATON = 1;
export const DANO_HAMSTER = 2;

export const CATALOGO_ENEMIGOS = {
  cucaracha: {
    tipo: 'cucaracha',
    nombre: 'Cucaracha de taquería',
    ancho: 36,
    alto: 20,
    velocidadPatrulla: 70, // px/s
    hp: null,              // Un pisotón la derrota directamente
    dano: DANO_CUCARACHA,  // Daño por contacto = 1
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
    dano: DANO_RATA,       // Daño por contacto = 1 (Rata menor = ratón)
    pisable: true,
    recompensaChurus: null,
    color: '#7f8c8d',
    colorDetalle: '#2c3e50',
  },
  raton: {
    tipo: 'raton',
    nombre: 'Ratón',
    ancho: 44,
    alto: 26,
    velocidadPatrulla: 95,
    hp: null,
    dano: DANO_RATON,      // Daño por contacto = 1
    pisable: true,
    recompensaChurus: null,
    color: '#7f8c8d',
    colorDetalle: '#2c3e50',
  },
  hamster: {
    tipo: 'hamster',
    nombre: 'Hámster',
    ancho: 42,
    alto: 28,
    velocidadPatrulla: 80,
    hp: null,
    dano: DANO_HAMSTER,   // Daño por contacto según diseño: 2
    pisable: true,
    recompensaChurus: null,
    color: '#d35400',
    colorDetalle: '#a04000',
  },
};

export function obtenerPlantillaEnemigo(tipo) {
  if (!tipo || typeof tipo !== 'string') return null;
  if (tipo === 'rata') return CATALOGO_ENEMIGOS.rata_menor;
  return CATALOGO_ENEMIGOS[tipo] || null;
}
