// Primera zona del desierto. Sin reja explorable ni objetos de etapas posteriores.
export const escenaDesierto = {
  id: 'desierto', nombre: 'Desierto',
  limites: { x: 0, y: 0, w: 1280, h: 720 },
  puntoEntrada: { x: 100, y: 558 },
  fondo: {
    ruta: 'assets/fondos/desierto.webp', colorRespaldo: '#ecc98b',
    colorSuelo: '#b98042', colorPlataforma: '#b98042', plataformasVisibles: true,
  },
  plataformas: [
    { id: 'suelo-desierto', x: 0, y: 600, w: 1280, h: 120, tipo: 'suelo' },
    { id: 'roca-baja', x: 330, y: 510, w: 150, h: 24 },
    { id: 'roca-alta', x: 550, y: 420, w: 160, h: 24 },
    { id: 'roca-derecha', x: 850, y: 510, w: 160, h: 24 },
  ],
  enemigos: [
    { id: 'desierto-raton', tipo: 'rata_menor', x: 620, y: 574, w: 44, h: 26,
      patrulla: { minX: 530, maxX: 800 }, hp: null },
    { id: 'desierto-hamster', tipo: 'cucaracha', x: 1050, y: 580, w: 36, h: 20,
      patrulla: { minX: 1020, maxX: 1250 }, hp: null },
  ],
  objetos: [], disparadores: [],
};
