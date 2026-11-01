// Capítulo 2: Guatemala. Formas y colores son arte provisional hasta recibir ilustraciones.

const suelo = (id, ancho = 2560, y = 600) => ({ id, x: 0, y, w: ancho, h: 120, tipo: 'suelo' });
const plataforma = (id, x, y, w) => ({ id, x, y, w, h: 18, tipo: 'plataforma' });
const churu = (id, x, y = 510, secreto = false) => ({ id, tipo: 'churu', x, y, w: 30, h: 66, ...(secreto ? { secreto: true } : {}) });
const botiquin = (id, x, y = 560) => ({ id, tipo: 'botiquin', x, y, w: 36, h: 36, curacion: 25, recogido: false });
const enemigo = (id, tipo, x, y = 554, extra = {}) => ({
  id, tipo, x, y, w: tipo === 'tucan_ladron' ? 56 : tipo === 'mono_aullador' ? 68 : 64,
  h: tipo === 'tucan_ladron' ? 42 : tipo === 'mono_aullador' ? 48 : 42,
  velocidad: tipo === 'tucan_ladron' ? 105 : tipo === 'mono_aullador' ? 72 : 78,
  patrulla: { minX: Math.max(0, x - 100), maxX: Math.min(2560, x + 180) },
  comportamiento: extra.comportamiento || 'patrulla', hp: null, pisable: true, ...extra,
});

function crearEscena({ id, nombre, colorRespaldo, colorSuelo, colorPlataforma, plataformas, enemigos, objetos, destino }) {
  return {
    id, nombre,
    limites: { x: 0, y: 0, w: 2560, h: 720 },
    puntoEntrada: { x: 80, y: 510 },
    fondo: { estilo: 'guatemala', colorRespaldo, colorSuelo, colorPlataforma, plataformasVisibles: true },
    plataformas: [suelo(`${id}-suelo`), ...plataformas],
    enemigos,
    objetos,
    secretos: objetos.filter((o) => o.secreto).map((o) => o.id),
    disparadores: destino ? [{
      id: `${id}-salida`, x: 2538, y: 0, w: 22, h: 720,
      destino, accion: 'pasar', puntoEntrada: { x: 40, y: 510 },
    }] : [],
  };
}

export const escenaAntigua = crearEscena({
  id: 'guatemala-antigua', nombre: 'Antigua y los volcanes',
  colorRespaldo: '#e9a77e', colorSuelo: '#9a654b', colorPlataforma: '#b9634d',
  plataformas: [
    plataforma('antigua-caja-1', 360, 510, 150), plataforma('antigua-techo-1', 620, 430, 220),
    plataforma('antigua-balcon', 970, 365, 180), plataforma('antigua-muro-2', 1370, 500, 180),
    plataforma('antigua-techo-2', 1690, 425, 240), plataforma('antigua-arco', 2110, 490, 190),
  ],
  enemigos: [
    enemigo('antigua-tucan-1', 'tucan_ladron', 540, 388), enemigo('antigua-coati-1', 'coati', 1030),
    enemigo('antigua-tucan-2', 'tucan_ladron', 1540, 512), enemigo('antigua-coati-2', 'coati', 2070),
  ],
  objetos: [churu('antigua-churu-1', 410), churu('antigua-churu-2', 1010, 299),
    churu('antigua-churu-secreto', 1770, 359, true), botiquin('antigua-botiquin', 1450)],
  destino: 'guatemala-chichicastenango',
});

export const escenaChichicastenango = crearEscena({
  id: 'guatemala-chichicastenango', nombre: 'Mercado de Chichicastenango',
  colorRespaldo: '#eacb83', colorSuelo: '#816143', colorPlataforma: '#b67b48',
  plataformas: [
    plataforma('chichi-huacal-1', 260, 530, 170), plataforma('chichi-puesto-1', 530, 455, 260),
    plataforma('chichi-toldo-1', 870, 370, 250), plataforma('chichi-puesto-2', 1270, 515, 230),
    plataforma('chichi-toldo-2', 1600, 430, 260), plataforma('chichi-huacal-2', 2020, 520, 170),
  ],
  enemigos: [
    enemigo('chichi-tucan-1', 'tucan_ladron', 430, 488), enemigo('chichi-coati-1', 'coati', 740),
    enemigo('chichi-mono-1', 'mono_aullador', 1450, 506, { comportamiento: 'salta' }),
    enemigo('chichi-coati-2', 'coati', 1910),
  ],
  objetos: [churu('chichi-churu-1', 330, 464), churu('chichi-churu-2', 930, 304),
    churu('chichi-churu-secreto', 1690, 364, true), botiquin('chichi-botiquin', 2200)],
  destino: 'guatemala-selva',
});

export const escenaSelva = crearEscena({
  id: 'guatemala-selva', nombre: 'Selva del Petén',
  colorRespaldo: '#81a66f', colorSuelo: '#4f6c48', colorPlataforma: '#69804c',
  plataformas: [
    plataforma('selva-raiz-1', 220, 505, 200), plataforma('selva-raiz-2', 550, 425, 210),
    plataforma('selva-liana-1', 890, 350, 200), plataforma('selva-raiz-3', 1240, 485, 240),
    plataforma('selva-liana-2', 1620, 390, 240), plataforma('selva-raiz-4', 2050, 500, 230),
  ],
  enemigos: [
    enemigo('selva-tucan-1', 'tucan_ladron', 410, 463), enemigo('selva-mono-1', 'mono_aullador', 700, 377, { comportamiento: 'salta' }),
    enemigo('selva-coati-1', 'coati', 1310), enemigo('selva-mono-2', 'mono_aullador', 1830, 342, { comportamiento: 'salta' }),
    enemigo('selva-coati-2', 'coati', 2200),
  ],
  objetos: [churu('selva-churu-1', 300, 439), churu('selva-churu-2', 940, 284),
    churu('selva-churu-secreto', 1690, 324, true), botiquin('selva-botiquin', 1120),
    botiquin('selva-botiquin-2', 2260)],
  destino: 'guatemala-tikal',
});

export const escenaTikal = crearEscena({
  id: 'guatemala-tikal', nombre: 'Tikal y el templo del jaguar',
  colorRespaldo: '#88a26d', colorSuelo: '#605443', colorPlataforma: '#87714e',
  plataformas: [
    plataforma('tikal-escombro-1', 270, 515, 200), plataforma('tikal-escalon-1', 590, 455, 210),
    plataforma('tikal-escalon-2', 900, 390, 220), plataforma('tikal-muro-1', 1260, 505, 250),
    plataforma('tikal-escalon-3', 1640, 430, 240), plataforma('tikal-plaza', 2030, 500, 300),
  ],
  enemigos: [
    enemigo('tikal-tucan-1', 'tucan_ladron', 440, 473), enemigo('tikal-coati-1', 'coati', 760),
    enemigo('tikal-mono-1', 'mono_aullador', 1080, 342, { comportamiento: 'salta' }),
    enemigo('tikal-coati-2', 'coati', 1570), enemigo('tikal-mono-2', 'mono_aullador', 1900, 382, { comportamiento: 'salta' }),
  ],
  objetos: [churu('tikal-churu-1', 330, 449), churu('tikal-churu-2', 950, 324),
    churu('tikal-churu-secreto', 1710, 364, true), botiquin('tikal-botiquin', 2130)],
});

export const escenasGuatemala = [escenaAntigua, escenaChichicastenango, escenaSelva, escenaTikal];
