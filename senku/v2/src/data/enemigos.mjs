// Catálogo de definiciones de datos para enemigos en Senku 2.
// Golpes y daño por tipo en NIVELES_ENEMIGO (Javier, 31/10/2026: más difícil).

// Daño a Senku (100 HP). Ver NIVELES_ENEMIGO para los golpes que aguanta cada uno.
export const DANO_CUCARACHA = 6;
export const DANO_RATA = 15;
export const DANO_RATON = 10;
export const DANO_HAMSTER = 20;

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

// Dificultad (Javier, 31/10/2026): golpes para eliminar y daño a Senku (100 HP) por tipo.
export const NIVELES_ENEMIGO = Object.freeze({
  raton_negro: { golpes: 1, dano: DANO_RATON },
  raton_cafe: { golpes: 2, dano: DANO_RATA },
  rata_menor: { golpes: 2, dano: DANO_RATA },
  hamster: { golpes: 3, dano: DANO_HAMSTER },
  cucaracha: { golpes: 1, dano: DANO_CUCARACHA },
});

export function nivelEnemigo(tipo, variante) {
  if (tipo === 'rata') tipo = 'rata_menor';
  return NIVELES_ENEMIGO[`${tipo}_${variante || 'negro'}`] || NIVELES_ENEMIGO[tipo] || { golpes: null, dano: null };
}

export function obtenerPlantillaEnemigo(tipo) {
  if (!tipo || typeof tipo !== 'string') return null;
  if (tipo === 'rata') return CATALOGO_ENEMIGOS.rata_menor;
  return CATALOGO_ENEMIGOS[tipo] || null;
}
