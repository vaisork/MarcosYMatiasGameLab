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
  arte: {
    tramos: [0, 1, 2].map((i) => ({ ruta: `assets/escenas/taqueria/0${i + 1}.webp`, x: i * 1280, w: 1280 })),
  },
  // Colisiones alineadas con el camión, cajas, barra y toldos pintados.
  plataformas: [
    { id: 'suelo-banqueta', x: 0, y: 600, w: 3840, h: 120, tipo: 'suelo' },
    { id: 'caja-madera', x: 680, y: 530, w: 150, h: 14, tipo: 'plataforma' },
    { id: 'baul-cajas', x: 95, y: 470, w: 220, h: 14, tipo: 'plataforma' },
    { id: 'portaequipajes', x: 145, y: 380, w: 185, h: 14, tipo: 'plataforma' },
    { id: 'barra-tacos', x: 775, y: 485, w: 430, h: 14, tipo: 'plataforma' },
    { id: 'estante-taqueria', x: 820, y: 395, w: 280, h: 14, tipo: 'plataforma' },
    { id: 'toldo-taqueria', x: 760, y: 300, w: 445, h: 14, tipo: 'plataforma' },
    ...Array.from({ length: 2 }, (_, pantalla) => {
      const offset = (pantalla + 1) * 1280;
      return [
        { id: `taqueria-cajas-${pantalla}`, x: offset + (pantalla ? 930 : 600), y: 540, w: 150, h: 14, tipo: 'plataforma' },
        { id: `taqueria-toldo-${pantalla}`, x: offset + (pantalla ? 760 : 690), y: pantalla ? 400 : 435, w: pantalla ? 240 : 300, h: 14, tipo: 'plataforma' },
        { id: `taqueria-mesa-${pantalla}`, x: offset + (pantalla ? 760 : 820), y: 500, w: 200, h: 14, tipo: 'plataforma' },
        { id: `taqueria-techo-${pantalla}`, x: offset + (pantalla ? 740 : 725), y: pantalla ? 320 : 340, w: 260, h: 14, tipo: 'plataforma' },
      ];
    }).flat(),
    { id: 'escalon-barrio-1', x: 1390, y: 560, w: 70, h: 14, tipo: 'plataforma' },
    { id: 'escalon-barrio-2', x: 1440, y: 520, w: 65, h: 14, tipo: 'plataforma' },
    { id: 'escalon-barrio-3', x: 1490, y: 480, w: 65, h: 14, tipo: 'plataforma' },
    { id: 'escalon-mercado', x: 2685, y: 560, w: 70, h: 14, tipo: 'plataforma' },
  ],
  disparadores: [
    { id: 'camioneta', x: 90, y: 430, w: 255, h: 170,
      destino: 'reja', accion: 'subir', etiqueta: 'Subir', requiere: 'llave-camioneta' },
  ],
  // El último ratón/hámster derrotado suelta esta llave cerca de donde cae.
  recompensaFinal: { id: 'llave-camioneta', tipo: 'llave', x: 3480, y: 566, w: 34, h: 28 },
  // Churus sobre equipaje, cajas, barra y toldos pintados.
  objetos: [
    { id: 'churu-1', tipo: 'churu', x: 200, y: 412, w: 22, h: 58, recogido: false },
    { id: 'churu-2', tipo: 'churu', x: 710, y: 472, w: 22, h: 58, recogido: false },
    { id: 'churu-3', tipo: 'churu', x: 780, y: 472, w: 22, h: 58, recogido: false },
    { id: 'churu-4', tipo: 'churu', x: 920, y: 427, w: 22, h: 58, recogido: false },
    { id: 'churu-5', tipo: 'churu', x: 980, y: 337, w: 22, h: 58, recogido: false },
    { id: 'churu-6', tipo: 'churu', x: 1910, y: 482, w: 22, h: 58, recogido: false },
    { id: 'churu-7', tipo: 'churu', x: 2200, y: 377, w: 22, h: 58, recogido: false },
    { id: 'churu-8', tipo: 'churu', x: 3480, y: 262, w: 22, h: 58, recogido: false },
    { id: 'botiquin-1', tipo: 'botiquin', x: 1060, y: 475, w: 36, h: 36, recogido: false }, // sobre mesa-derecha
    ...Array.from({ length: 2 }, (_, pantalla) => {
      const offset = (pantalla + 1) * 1280;
      return [
        { id: `taqueria-churu-${pantalla}-1`, tipo: 'churu', x: offset + (pantalla ? 980 : 650), y: 474, w: 30, h: 66 },
        { id: `taqueria-churu-${pantalla}-2`, tipo: 'churu', x: offset + 830, y: 434, w: 30, h: 66 },
        { id: `taqueria-churu-${pantalla}-3`, tipo: 'churu', x: offset + 850, y: pantalla ? 334 : 377, w: 30, h: 66 },
        { id: `taqueria-churu-${pantalla}-secreto`, tipo: 'churu', x: offset + 825, y: pantalla ? 254 : 274, w: 30, h: 66, secreto: true },
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
