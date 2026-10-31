// Escena de la Ciudad (punto 2 del plan maestro): atravesar la calle y subir al camión
// para iniciar el bonus cronometrado de Churus rumbo a la Taquería.

export const escenaCiudad = {
  id: 'ciudad',
  nombre: 'Ciudad',
  limites: {
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
  },
  puntoEntrada: {
    x: 90,
    y: 510, // pies sobre la calle (y=600); gato de 90 px
  },
  fondo: {
    estilo: 'ciudad',
    colorRespaldo: '#6d9cb8',
    colorSuelo: '#4d474a',
    colorPlataforma: '#8f6142',
    plataformasVisibles: true,
  },
  arte: {
    tramos: [{ ruta: 'assets/escenas/ciudad/01.webp', x: 0, w: 1280 }],
  },
  plataformas: [
    { id: 'suelo-calle', x: 0, y: 600, w: 1280, h: 120, tipo: 'suelo' },
    { id: 'huacal-calle-1', x: 785, y: 540, w: 135, h: 14, tipo: 'plataforma' },
    { id: 'puesto-periodicos', x: 330, y: 400, w: 285, h: 14, tipo: 'plataforma' },
    { id: 'repisa-puesto', x: 350, y: 475, w: 230, h: 14, tipo: 'plataforma' },
    { id: 'banca-parada', x: 575, y: 530, w: 180, h: 14, tipo: 'plataforma' },
    { id: 'toldo-parada', x: 585, y: 435, w: 260, h: 14, tipo: 'plataforma' },
    { id: 'escalon-camion', x: 950, y: 540, w: 230, h: 14, tipo: 'plataforma' },
  ],
  disparadores: [
    {
      id: 'camion',
      x: 960,
      y: 410,
      w: 280,
      h: 190,
      destino: 'taqueria',
      rutaBonus: './bonus-camion.html',
      accion: 'subir',
      etiqueta: 'Subir',
      requiere: null,
    },
  ],
  objetos: [
    { id: 'ciudad-churu-1', tipo: 'churu', x: 680, y: 472, w: 22, h: 58, recogido: false },
    { id: 'ciudad-churu-2', tipo: 'churu', x: 450, y: 342, w: 22, h: 58, recogido: false },
    { id: 'ciudad-churu-3', tipo: 'churu', x: 830, y: 482, w: 22, h: 58, recogido: false },
    { id: 'ciudad-churu-4', tipo: 'churu', x: 700, y: 377, w: 22, h: 58, recogido: false },
  ],
  enemigos: [],
};
