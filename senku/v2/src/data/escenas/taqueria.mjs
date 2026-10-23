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
    y: 558, // Pies sobre la banqueta (y=600); h del jugador = 42
  },
  fondo: {
    ruta: 'senku/v2/assets/fondos/taqueria.webp',
    colorRespaldo: '#e6be8a', // Tono cálido taquería
    colorPared: '#f5deb3',
    colorSuelo: '#543d2b',
    colorPlataforma: '#8c593a',
  },
  // Coordenadas del lienzo lógico 1280x720, medidas sobre taqueria_ciudad.webp.
  // Las plataformas son semisólidas (solo se pisa la cara superior) y se dibujan casi invisibles.
  plataformas: [
    // Banqueta del dibujo: ~83 % de la altura
    { id: 'suelo-banqueta', x: 0, y: 600, w: 1280, h: 120, tipo: 'suelo' },
    // Parachoques trasero de la camioneta
    { id: 'parachoques', x: 220, y: 514, w: 105, h: 14, tipo: 'plataforma' },
    // Caja de madera junto a la camioneta
    { id: 'caja-madera', x: 345, y: 540, w: 85, h: 14, tipo: 'plataforma' },
    // Caja verde con caja de madera apilada
    { id: 'caja-verde', x: 445, y: 520, w: 90, h: 14, tipo: 'plataforma' },
    // Cajas dentro de la cajuela abierta
    { id: 'baul-cajas', x: 235, y: 456, w: 85, h: 14, tipo: 'plataforma' },
    // Techo / portaequipajes y compuerta
    { id: 'portaequipajes', x: 130, y: 376, w: 215, h: 14, tipo: 'plataforma' },
    // Lona naranja sobre patio, tramo bajo
    { id: 'lona-baja', x: 365, y: 310, w: 140, h: 14, tipo: 'plataforma' },
    // Lona naranja sobre patio, tramo alto
    { id: 'lona-alta', x: 500, y: 285, w: 145, h: 14, tipo: 'plataforma' },
    // Maceta con flores
    { id: 'maceta-flores', x: 545, y: 515, w: 60, h: 14, tipo: 'plataforma' },
    // Maceta grande junto al poste
    { id: 'maceta-grande', x: 630, y: 520, w: 60, h: 14, tipo: 'plataforma' },
    // Mesa izquierda con sillas rojas
    { id: 'mesa-izquierda', x: 715, y: 509, w: 95, h: 14, tipo: 'plataforma' },
    // Barra de la taquería
    { id: 'barra-tacos', x: 825, y: 471, w: 180, h: 14, tipo: 'plataforma' },
    // Mesa derecha con sillas rojas
    { id: 'mesa-derecha', x: 1020, y: 509, w: 110, h: 14, tipo: 'plataforma' },
    // Bote de basura
    { id: 'bote-basura', x: 1195, y: 485, w: 65, h: 14, tipo: 'plataforma' },
    // Toldo rayado de la taquería
    { id: 'toldo-taqueria', x: 685, y: 296, w: 460, h: 14, tipo: 'plataforma' },
    // Cornisa izquierda del techo
    { id: 'parapeto-izquierdo', x: 635, y: 245, w: 115, h: 14, tipo: 'plataforma' },
    // Cornisa derecha del techo
    { id: 'parapeto-derecho', x: 1165, y: 245, w: 110, h: 14, tipo: 'plataforma' },
  ],
  disparadores: [
    { id: 'camioneta', x: 90, y: 430, w: 255, h: 170,
      destino: 'desierto', accion: 'subir', etiqueta: 'Subir', requiere: 'llave-camioneta' },
  ],
  // El último ratón/hámster derrotado suelta esta llave; no hay arte adecuado en objetos/.
  recompensaFinal: { id: 'llave-camioneta', tipo: 'llave', x: 1000, y: 566, w: 34, h: 28 },
  // Recogibles sobre rutas de salto: churus (base 22x58) y un botiquín. Valores de recompensa pendientes en null.
  objetos: [
    { id: 'churu-1', tipo: 'churu', x: 375, y: 490, w: 22, h: 58, recogido: false }, // sobre caja-madera
    { id: 'churu-2', tipo: 'churu', x: 475, y: 470, w: 22, h: 58, recogido: false }, // sobre caja-verde
    { id: 'churu-3', tipo: 'churu', x: 265, y: 406, w: 22, h: 58, recogido: false }, // sobre baul-cajas
    { id: 'churu-4', tipo: 'churu', x: 200, y: 326, w: 22, h: 58, recogido: false }, // sobre portaequipajes
    { id: 'churu-5', tipo: 'churu', x: 550, y: 235, w: 22, h: 58, recogido: false }, // sobre lona-alta
    { id: 'churu-6', tipo: 'churu', x: 900, y: 421, w: 22, h: 58, recogido: false }, // sobre barra-tacos
    { id: 'churu-7', tipo: 'churu', x: 850, y: 246, w: 22, h: 58, recogido: false }, // sobre toldo-taqueria
    { id: 'churu-8', tipo: 'churu', x: 1210, y: 195, w: 22, h: 58, recogido: false }, // sobre parapeto-derecho
    { id: 'botiquin-1', tipo: 'botiquin', x: 1060, y: 475, w: 36, h: 36, recogido: false }, // sobre mesa-derecha
  ],
  // Enemigos (hámster/ratón en arte) con rectángulos provisionales y valores creativos pendientes en null
  enemigos: [
    {
      id: 'cucaracha-suelo-1',
      tipo: 'cucaracha',
      x: 620,
      y: 580, // Sobre la banqueta (y=600, h=20)
      w: 36,
      h: 20,
      velocidad: 70,
      patrulla: { minX: 600, maxX: 900 },
      hp: null,
      dano: null,
      pisable: true,
      color: '#6e4720',
      colorDetalle: '#3a200a',
    },
    {
      id: 'cucaracha-barra-2',
      tipo: 'cucaracha',
      x: 850,
      y: 451, // Sobre la barra de tacos (y=471, h=20)
      w: 36,
      h: 20,
      velocidad: 50,
      patrulla: { minX: 830, maxX: 1000 },
      hp: null,
      dano: null,
      pisable: true,
      color: '#6e4720',
      colorDetalle: '#3a200a',
    },
    {
      id: 'rata-suelo-3',
      tipo: 'rata_menor',
      x: 1000,
      y: 574, // Sobre la banqueta (y=600, h=26)
      w: 44,
      h: 26,
      velocidad: 95,
      patrulla: { minX: 960, maxX: 1240 },
      hp: null,
      dano: null,
      pisable: true,
      color: '#7f8c8d',
      colorDetalle: '#2c3e50',
    },
  ],
};
