// Definición de datos para la escena de la Taquería (Senku 2).
// Primera pantalla jugable: resolución lógica fija 16:9 (1280x720).
// Valores creativos pendientes marcados explícitamente como null.

export const escenaTaqueria = {
  id: 'taqueria',
  nombre: 'Taquería',
  limites: {
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
  },
  puntoEntrada: {
    x: 100,
    y: 560,
  },
  fondo: {
    ruta: 'senku/v2/assets/fondos/taqueria.webp',
    colorRespaldo: '#e6be8a', // Tono cálido taquería
    colorPared: '#f5deb3',
    colorSuelo: '#543d2b',
    colorPlataforma: '#8c593a',
  },
  plataformas: [
    // Suelo principal
    {
      id: 'suelo-taqueria',
      x: 0,
      y: 620,
      w: 1280,
      h: 100,
      tipo: 'suelo',
    },
    // Barra de preparación de tacos
    {
      id: 'barra-tacos',
      x: 240,
      y: 500,
      w: 220,
      h: 24,
      tipo: 'plataforma',
    },
    // Repisa del trompo al pastor
    {
      id: 'repisa-trompo',
      x: 560,
      y: 400,
      w: 200,
      h: 24,
      tipo: 'plataforma',
    },
    // Toldo / repisa alta
    {
      id: 'toldo-taqueria',
      x: 860,
      y: 310,
      w: 240,
      h: 24,
      tipo: 'plataforma',
    },
  ],
  disparadores: [
    {
      id: 'salida-izquierda',
      x: 0,
      y: 500,
      w: 40,
      h: 120,
      destino: null,
      accion: null,
      etiqueta: null,
    },
  ],
  // Objetos y coleccionables con valores creativos pendientes en null
  objetos: [],
  // 1-2 enemigos con rectángulos provisionales y valores creativos pendientes en null
  enemigos: [
    {
      id: 'cucaracha-suelo-1',
      tipo: 'cucaracha',
      x: 480,
      y: 600, // Sobre el suelo principal (y=620, h=20)
      w: 36,
      h: 20,
      velocidad: 70,
      patrulla: { minX: 380, maxX: 750 },
      hp: null,
      dano: null,
      pisable: true,
      color: '#6e4720',
      colorDetalle: '#3a200a',
    },
    {
      id: 'cucaracha-barra-2',
      tipo: 'cucaracha',
      x: 270,
      y: 480, // Sobre la barra de tacos (y=500, h=20)
      w: 36,
      h: 20,
      velocidad: 50,
      patrulla: { minX: 250, maxX: 430 },
      hp: null,
      dano: null,
      pisable: true,
      color: '#6e4720',
      colorDetalle: '#3a200a',
    },
  ],
};
