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
  plataformas: [
    { id: 'suelo-calle', x: 0, y: 600, w: 1280, h: 120, tipo: 'suelo' },
    { id: 'huacal-calle-1', x: 250, y: 520, w: 110, h: 18, tipo: 'plataforma' },
    { id: 'puesto-periodicos', x: 430, y: 450, w: 140, h: 18, tipo: 'plataforma' },
    { id: 'banca-parada', x: 650, y: 515, w: 120, h: 18, tipo: 'plataforma' },
    { id: 'toldo-parada', x: 780, y: 430, w: 160, h: 18, tipo: 'plataforma' },
    { id: 'escalon-camion', x: 980, y: 510, w: 120, h: 18, tipo: 'plataforma' },
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
    { id: 'ciudad-churu-1', tipo: 'churu', x: 295, y: 462, w: 22, h: 58, recogido: false },
    { id: 'ciudad-churu-2', tipo: 'churu', x: 490, y: 392, w: 22, h: 58, recogido: false },
    { id: 'ciudad-churu-3', tipo: 'churu', x: 700, y: 457, w: 22, h: 58, recogido: false },
    { id: 'ciudad-churu-4', tipo: 'churu', x: 850, y: 372, w: 22, h: 58, recogido: false },
  ],
  enemigos: [],
};
