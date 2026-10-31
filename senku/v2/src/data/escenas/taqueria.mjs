// Definición de datos para la escena de la Taquería (Senku 2).
// Primera pantalla jugable: resolución lógica fija 16:9 (1280x720).
// Valores creativos pendientes marcados explícitamente como null.

export const escenaTaqueria = {
  id: 'taqueria',
  nombre: 'Taquería',
  limites: {
    x: 0,
    y: 0,
    w: 3840,
    h: 720,
  },
  puntoEntrada: {
    x: 100,
    y: 510, // Pies sobre la banqueta (y=600); gato de 90 px
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
    { id: 'suelo-banqueta', x: 0, y: 600, w: 3840, h: 120, tipo: 'suelo' },
    // Parachoques trasero de la camioneta
    { id: 'parachoques', x: 220, y: 520, w: 110, h: 14, tipo: 'plataforma' },
    // Caja de madera junto a la camioneta
    { id: 'caja-madera', x: 345, y: 540, w: 85, h: 14, tipo: 'plataforma' },
    // Caja verde con caja de madera apilada
    { id: 'caja-verde', x: 445, y: 520, w: 90, h: 14, tipo: 'plataforma' },
    // Cajas dentro de la cajuela abierta (altura adaptada a Senku h=90 sin atascos)
    { id: 'baul-cajas', x: 235, y: 430, w: 90, h: 14, tipo: 'plataforma' },
    // Techo / portaequipajes y compuerta
    { id: 'portaequipajes', x: 130, y: 340, w: 220, h: 14, tipo: 'plataforma' },
    // Lona naranja sobre patio, tramo bajo
    { id: 'lona-baja', x: 365, y: 300, w: 140, h: 14, tipo: 'plataforma' },
    // Lona naranja sobre patio, tramo alto
    { id: 'lona-alta', x: 500, y: 260, w: 145, h: 14, tipo: 'plataforma' },
    // Maceta con flores
    { id: 'maceta-flores', x: 545, y: 515, w: 60, h: 14, tipo: 'plataforma' },
    // Maceta grande junto al poste
    { id: 'maceta-grande', x: 630, y: 520, w: 60, h: 14, tipo: 'plataforma' },
    // Mesa izquierda con sillas rojas
    { id: 'mesa-izquierda', x: 715, y: 509, w: 95, h: 14, tipo: 'plataforma' },
    // Barra de la taquería (alcanzable con salto directo desde la banqueta a 115 px de subida)
    { id: 'barra-tacos', x: 825, y: 485, w: 180, h: 14, tipo: 'plataforma' },
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
    ...Array.from({ length: 2 }, (_, pantalla) => {
      const offset = (pantalla + 1) * 1280;
      return [
        { id: `taqueria-cajas-${pantalla}`, x: offset + 140, y: 520, w: 180, h: 18, tipo: 'plataforma' },
        { id: `taqueria-toldo-${pantalla}`, x: offset + 420, y: 440, w: 260, h: 18, tipo: 'plataforma' },
        { id: `taqueria-mesa-${pantalla}`, x: offset + 760, y: 510, w: 190, h: 18, tipo: 'plataforma' },
        { id: `taqueria-techo-${pantalla}`, x: offset + 1010, y: 400, w: 210, h: 18, tipo: 'plataforma' },
      ];
    }).flat(),
  ],
  disparadores: [
    { id: 'camioneta', x: 90, y: 430, w: 255, h: 170,
      destino: 'reja', accion: 'subir', etiqueta: 'Subir', requiere: 'llave-camioneta' },
  ],
  // El último ratón/hámster derrotado suelta esta llave cerca de donde cae.
  recompensaFinal: { id: 'llave-camioneta', tipo: 'llave', x: 3480, y: 566, w: 34, h: 28 },
  // Recogibles sobre rutas de salto: churus (base 22x58) y un botiquín. Valores de recompensa pendientes en null.
  objetos: [
    { id: 'churu-1', tipo: 'churu', x: 375, y: 490, w: 22, h: 58, recogido: false }, // sobre caja-madera
    { id: 'churu-2', tipo: 'churu', x: 475, y: 470, w: 22, h: 58, recogido: false }, // sobre caja-verde
    { id: 'churu-3', tipo: 'churu', x: 265, y: 372, w: 22, h: 58, recogido: false }, // sobre baul-cajas
    { id: 'churu-4', tipo: 'churu', x: 200, y: 282, w: 22, h: 58, recogido: false }, // sobre portaequipajes
    { id: 'churu-5', tipo: 'churu', x: 550, y: 202, w: 22, h: 58, recogido: false }, // sobre lona-alta
    { id: 'churu-6', tipo: 'churu', x: 930, y: 427, w: 22, h: 58, recogido: false }, // sobre barra-tacos
    { id: 'churu-7', tipo: 'churu', x: 850, y: 246, w: 22, h: 58, recogido: false }, // sobre toldo-taqueria
    { id: 'churu-8', tipo: 'churu', x: 1210, y: 195, w: 22, h: 58, recogido: false }, // sobre parapeto-derecho
    { id: 'botiquin-1', tipo: 'botiquin', x: 1060, y: 475, w: 36, h: 36, recogido: false }, // sobre mesa-derecha
    ...Array.from({ length: 2 }, (_, pantalla) => {
      const offset = (pantalla + 1) * 1280;
      return [
        { id: `taqueria-churu-${pantalla}-1`, tipo: 'churu', x: offset + 205, y: 462, w: 30, h: 66 },
        { id: `taqueria-churu-${pantalla}-2`, tipo: 'churu', x: offset + 520, y: 374, w: 30, h: 66 },
        { id: `taqueria-churu-${pantalla}-3`, tipo: 'churu', x: offset + 825, y: 444, w: 30, h: 66 },
        { id: `taqueria-churu-${pantalla}-secreto`, tipo: 'churu', x: offset + 1080, y: 334, w: 30, h: 66, secreto: true },
      ];
    }).flat(),
  ],
  // Enemigos (hámster/ratón en arte) con rectángulos provisionales y valores creativos pendientes en null
  enemigos: [
    {
      id: 'cucaracha-suelo-1',
      tipo: 'raton',
      x: 620,
      y: 554, // Sobre la banqueta (y=600, h=46)
      w: 72,
      h: 46,
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
      tipo: 'hamster',
      x: 850,
      y: 437, // Sobre la barra de tacos (y=485, h=48)
      w: 72,
      h: 48,
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
      x: 1160,
      y: 554, // Sobre la banqueta (y=600, h=46)
      w: 72,
      h: 46,
      velocidad: 95,
      patrulla: { minX: 1130, maxX: 1272 },
      hp: null,
      dano: null,
      pisable: true,
      color: '#7f8c8d',
      colorDetalle: '#2c3e50',
    },
    ...Array.from({ length: 8 }, (_, i) => {
      const pantalla = Math.floor(i / 4) + 1;
      const x = pantalla * 1280 + 120 + (i % 4) * 275;
      const tipo = i % 2 ? 'hamster' : 'raton';
      const h = tipo === 'hamster' ? 48 : 46;
      return { id: `taqueria-enemigo-${i + 1}`, tipo, variante: i % 2 ? 'cafe' : 'negro',
        comportamiento: ['patrulla', 'salta', 'persigue', 'patrulla'][i % 4], x,
        y: 600 - h, w: 72, h, velocidad: 72 + i * 4,
        patrulla: { minX: x - 70, maxX: x + 200 }, hp: null, dano: 1, pisable: true };
    }),
  ],
};
