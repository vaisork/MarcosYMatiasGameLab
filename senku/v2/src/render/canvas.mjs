// Motor de renderizado en Canvas para Senku 2.
// Resolución lógica fija 16:9 (1280x720) escalada a la ventana con letterbox sin deformar.
// Fondos por capas con paralaje, dibujador de plataformas por objeto y catálogo desacoplado.

import { dibujarObjeto } from './sprites.mjs';

export const ANCHO_LOGICO = 1280;
export const ALTO_LOGICO = 720;
export const RELACION_ASPECTO = 16 / 9;

// Calcula dimensiones para encajar en el contenedor sin deformar (letterbox)
export function calcularDimensionesLetterbox(anchoContenedor, altoContenedor) {
  const cAncho = Math.max(1, anchoContenedor);
  const cAlto = Math.max(1, altoContenedor);
  const escala = Math.min(cAncho / ANCHO_LOGICO, cAlto / ALTO_LOGICO);
  const ancho = Math.floor(ANCHO_LOGICO * escala);
  const alto = Math.floor(ALTO_LOGICO * escala);
  const margenX = Math.floor((cAncho - ancho) / 2);
  const margenY = Math.floor((cAlto - alto) / 2);
  return { ancho, alto, escala, margenX, margenY };
}

// Aplica el escalado letterbox al canvas ajustando su estilo CSS
export function ajustarLienzoLetterbox(canvas, anchoContenedor, altoContenedor) {
  if (!canvas) return null;
  if (canvas.width !== ANCHO_LOGICO) canvas.width = ANCHO_LOGICO;
  if (canvas.height !== ALTO_LOGICO) canvas.height = ALTO_LOGICO;
  const dims = calcularDimensionesLetterbox(anchoContenedor, altoContenedor);
  canvas.style.width = `${dims.ancho}px`;
  canvas.style.height = `${dims.alto}px`;
  return dims;
}

// Catálogo de assets gráficos con carga única, precarga y respaldo tolerante si falta un recurso.
export function crearCatalogoArte({ crearImagen = null, aviso = null } = {}) {
  const cache = new Map();
  const avisados = new Set();
  const fabrica = crearImagen || (typeof Image !== 'undefined' ? () => new Image() : null);
  const avisar = aviso || ((msg) => console.warn(msg));
  let precargando = 0;

  function fallar(entrada, resolver) {
    entrada.error = true;
    entrada.cargada = false;
    if (!avisados.has(entrada.ruta)) {
      avisados.add(entrada.ruta);
      avisar(`[Senku 2 / Arte] No se pudo cargar el asset: "${entrada.ruta}". Usando respaldo gráfico plano.`);
    }
    resolver(entrada);
  }

  function cargar(ruta) {
    if (!ruta || typeof ruta !== 'string') return null;
    if (cache.has(ruta)) return cache.get(ruta);

    const entrada = { ruta, cargada: false, error: false, imagen: null, promesa: null };
    cache.set(ruta, entrada);
    entrada.promesa = new Promise((resolver) => {
      let img = null;
      try {
        img = fabrica ? fabrica() : null;
      } catch {
        img = null;
      }
      if (!img) {
        fallar(entrada, resolver);
        return;
      }
      img.onload = () => {
        entrada.cargada = true;
        entrada.error = false;
        entrada.imagen = img;
        resolver(entrada);
      };
      img.onerror = () => fallar(entrada, resolver);
      img.src = ruta;
    });
    return entrada;
  }

  function obtener(ruta) {
    if (!ruta) return null;
    const entrada = cache.get(ruta) || cargar(ruta);
    return entrada && entrada.cargada ? entrada.imagen : null;
  }

  function estado() {
    let listas = 0;
    let fallidas = 0;
    for (const e of cache.values()) {
      if (e.cargada) listas += 1;
      else if (e.error) fallidas += 1;
    }
    const total = cache.size;
    const pendientes = total - listas - fallidas;
    return {
      total,
      listas,
      fallidas,
      pendientes,
      progreso: total === 0 ? 1 : (listas + fallidas) / total,
      precargando: precargando > 0,
    };
  }

  function precargar(rutas, { timeoutMs = 8000 } = {}) {
    precargando += 1;
    const esperas = (Array.isArray(rutas) ? rutas : []).map((ruta) => {
      const entrada = cargar(ruta);
      if (!entrada) return Promise.resolve(null);
      if (!(timeoutMs > 0) || typeof setTimeout !== 'function') return entrada.promesa;
      let temporizador = null;
      const limite = new Promise((resolver) => {
        temporizador = setTimeout(() => {
          if (!entrada.cargada && !entrada.error) fallar(entrada, resolver);
          resolver(entrada);
        }, timeoutMs);
      });
      return Promise.race([entrada.promesa, limite]).then((e) => {
        clearTimeout(temporizador);
        return e;
      });
    });
    return Promise.all(esperas).then(() => {
      precargando -= 1;
      return estado();
    });
  }

  return { cargar, obtener, precargar, estado, cache };
}

// Aviso breve «Cargando arte» (barra de progreso) mientras dura la precarga
export function dibujarAvisoCarga(ctx, catalogoArte) {
  const est = catalogoArte?.estado?.();
  if (!ctx || !est || !est.precargando) return false;
  const ancho = 360;
  const x = (ANCHO_LOGICO - ancho) / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(20, 12, 6, 0.8)';
  ctx.fillRect(x - 24, ALTO_LOGICO / 2 - 48, ancho + 48, 96);
  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Cargando arte…', ANCHO_LOGICO / 2, ALTO_LOGICO / 2 - 8);
  ctx.fillStyle = '#4a2c17';
  ctx.fillRect(x, ALTO_LOGICO / 2 + 12, ancho, 14);
  ctx.fillStyle = '#e67e22';
  ctx.fillRect(x, ALTO_LOGICO / 2 + 12, Math.round(ancho * Math.max(0, Math.min(1, est.progreso))), 14);
  ctx.restore();
  return true;
}

// Modo depuración: `?debug=1` en la URL
export function modoDebugActivo(ubicacion = typeof location !== 'undefined' ? location : null) {
  try {
    return new URLSearchParams(ubicacion?.search || '').get('debug') === '1';
  } catch {
    return false;
  }
}

// Rectángulos de colisión (plataformas) y de recogibles, sólo para depuración.
export function dibujarDebugColisiones(ctx, escena) {
  if (!ctx || !escena) return;
  ctx.save();
  ctx.lineWidth = 2;
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  for (const plat of escena.plataformas || []) {
    const suelo = plat.tipo === 'suelo';
    ctx.fillStyle = suelo ? 'rgba(0, 200, 255, 0.12)' : 'rgba(0, 255, 120, 0.22)';
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    ctx.strokeStyle = suelo ? 'rgba(0, 200, 255, 0.9)' : 'rgba(0, 255, 120, 0.95)';
    ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
    if (!suelo) {
      ctx.fillStyle = '#fff';
      ctx.fillText(plat.id, plat.x + 3, plat.y - 3);
    }
  }
  ctx.strokeStyle = 'rgba(255, 220, 0, 0.95)';
  for (const objeto of escena.objetos || []) {
    if (!objeto || objeto.recogido) continue;
    ctx.strokeRect(objeto.x, objeto.y, objeto.w || 24, objeto.h || 24);
  }
  ctx.restore();
}

// Clasificador de tipo de plataforma a partir de id y tipo
export function clasificarTipoPlataforma(plat) {
  if (!plat) return 'plataforma';
  const id = (plat.id || '').toLowerCase();
  const tipo = (plat.tipo || '').toLowerCase();
  if (tipo === 'suelo' || id.includes('suelo') || id.includes('banqueta')) return 'suelo';
  if (id.includes('huacal') || tipo === 'huacal') return 'huacal';
  if (id.includes('caja') || id.includes('baul') || tipo === 'caja') return 'caja';
  if (id.includes('toldo') || id.includes('lona') || tipo === 'toldo') return 'toldo';
  if (id.includes('roca') || tipo === 'roca') return 'roca';
  if (id.includes('mesa') || tipo === 'mesa') return 'mesa';
  if (id.includes('barra') || tipo === 'barra') return 'barra';
  if (id.includes('puesto') || tipo === 'puesto') return 'puesto';
  if (id.includes('banca') || tipo === 'banca') return 'banca';
  if (id.includes('bote') || tipo === 'bote') return 'bote';
  if (id.includes('maceta') || tipo === 'maceta') return 'maceta';
  if (id.includes('parapeto') || id.includes('cornisa') || tipo === 'parapeto') return 'parapeto';
  return tipo || 'plataforma';
}

// Dibuja una plataforma como objeto ambiental visible y legible (cajas, huacales, toldos, rocas, etc.)
export function dibujarPlataformaObjeto(ctx, plat, tiempo = 0, escenaId = 'taqueria') {
  if (!ctx || !plat) return;
  const { x, y, w, h } = plat;
  const tipoObj = clasificarTipoPlataforma(plat);
  ctx.save();

  if (tipoObj === 'suelo') {
    const esDesierto = escenaId === 'desierto' || escenaId === 'reja';
    if (esDesierto) {
      // Suelo de tierra apisonada y arena del desierto
      ctx.fillStyle = '#b98042';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#deb078';
      ctx.fillRect(x, y, w, 10);
      ctx.fillStyle = '#8f572a';
      for (let px = x + 20; px < x + w; px += 90) {
        ctx.fillRect(px, y + 16, 12, 5);
      }
      ctx.fillStyle = '#6b8245';
      for (let zx = x + 60; zx < x + w; zx += 160) {
        ctx.fillRect(zx, y - 4, 3, 5);
        ctx.fillRect(zx + 3, y - 6, 3, 7);
        ctx.fillRect(zx + 6, y - 3, 3, 4);
      }
    } else {
      // Banqueta colonial / urbana mexicana
      ctx.fillStyle = '#3c383b';
      ctx.fillRect(x, y + 18, w, Math.max(0, h - 18));
      ctx.fillStyle = '#b3aba0';
      ctx.fillRect(x, y, w, 18);
      ctx.fillStyle = '#dfd8ce';
      ctx.fillRect(x, y, w, 4);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(x, y + 15, w, 3);
      ctx.fillStyle = '#8a8277';
      for (let jx = x; jx < x + w; jx += 40) {
        ctx.fillRect(jx, y, 2, 18);
      }
    }
  } else if (tipoObj === 'huacal') {
    // Huacal plástico mexicano de mercado
    const esRojo = plat.id?.includes('rojo');
    const cBase = esRojo ? '#c0392b' : '#27ae60';
    const cOscuro = esRojo ? '#962d22' : '#1e8449';
    const cClaro = esRojo ? '#e74c3c' : '#2ecc71';

    ctx.fillStyle = cBase;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = cClaro;
    ctx.fillRect(x, y, w, 4);
    ctx.fillStyle = cOscuro;
    ctx.fillRect(x, y + h - 3, w, 3);
    ctx.strokeStyle = cOscuro;
    ctx.lineWidth = 1.5;
    for (let gx = x + 8; gx < x + w - 8; gx += 12) {
      ctx.beginPath();
      ctx.moveTo(gx, y + 4);
      ctx.lineTo(gx + 6, y + h - 4);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(20, 20, 20, 0.45)';
    ctx.fillRect(x + w / 2 - 10, y + 6, 20, 5);
  } else if (tipoObj === 'caja') {
    // Caja de madera / verdura
    const esVerde = plat.id?.includes('verde');
    const cMadera = esVerde ? '#437652' : '#a06634';
    const cBorde = esVerde ? '#2d5438' : '#6e401b';
    const cBisel = esVerde ? '#5ca371' : '#c98a53';

    ctx.fillStyle = cMadera;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = cBorde;
    for (let ty = y + 8; ty < y + h; ty += 12) {
      ctx.fillRect(x, ty, w, 2);
    }
    ctx.fillStyle = cBisel;
    ctx.fillRect(x, y, w, 3);
    ctx.fillStyle = cBorde;
    ctx.fillRect(x, y, 6, h);
    ctx.fillRect(x + w - 6, y, 6, h);
    ctx.fillStyle = '#22160d';
    ctx.fillRect(x + 2, y + 4, 2, 2);
    ctx.fillRect(x + w - 4, y + 4, 2, 2);
  } else if (tipoObj === 'toldo') {
    // Toldo de lona con rayas y ondas
    const franjaW = 20;
    const totalFranjas = Math.ceil(w / franjaW);
    for (let f = 0; f < totalFranjas; f++) {
      const fx = x + f * franjaW;
      const fw = Math.min(franjaW, x + w - fx);
      ctx.fillStyle = f % 2 === 0 ? '#c0392b' : '#f39c12';
      ctx.fillRect(fx, y, fw, h);
      ctx.beginPath();
      ctx.arc(fx + fw / 2, y + h, fw / 2, 0, Math.PI);
      ctx.fill();
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, w, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x, y + h - 2, w, 2);
  } else if (tipoObj === 'roca') {
    // Roca del desierto multifacetada
    ctx.fillStyle = '#b87445';
    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + w - 8, y);
    ctx.lineTo(x + w, y + h * 0.4);
    ctx.lineTo(x + w - 4, y + h);
    ctx.lineTo(x + 4, y + h);
    ctx.lineTo(x, y + h * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#deb07e';
    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + w - 8, y);
    ctx.lineTo(x + w - 12, y + 5);
    ctx.lineTo(x + 12, y + 5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#5a2d14';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.35, y + 4);
    ctx.lineTo(x + w * 0.42, y + h * 0.65);
    ctx.moveTo(x + w * 0.65, y + 5);
    ctx.lineTo(x + w * 0.72, y + h * 0.55);
    ctx.stroke();
  } else if (tipoObj === 'barra') {
    ctx.fillStyle = '#d5dbdb';
    ctx.fillRect(x, y, w, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y + 5, w, h - 5);
    ctx.fillStyle = '#2980b9';
    for (let bx = x; bx < x + w; bx += 18) {
      ctx.fillRect(bx + 4, y + 7, 10, h - 9);
    }
  } else if (tipoObj === 'mesa') {
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(x, y, w, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, w, 2);
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(x + 8, y + 6, 4, h - 6);
    ctx.fillRect(x + w - 12, y + 6, 4, h - 6);
  } else if (tipoObj === 'banca') {
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(x, y, w, 5);
    ctx.fillStyle = '#cd853f';
    ctx.fillRect(x, y, w, 2);
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(x + 4, y + 5, 4, h - 5);
    ctx.fillRect(x + w - 8, y + 5, 4, h - 5);
  } else if (tipoObj === 'puesto') {
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(x, y, w, 5);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(x, y + 5, w, h - 5);
  } else {
    ctx.fillStyle = '#8c593a';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#b3774f';
    ctx.fillRect(x, y, w, 3);
    ctx.fillStyle = '#5c3822';
    ctx.fillRect(x, y + h - 3, w, 3);
  }

  ctx.restore();
}

// Parallax Taquería / Ciudad tradicional mexicana
export function dibujarParalajeTaqueria(ctx, cameraX, tiempo, anchoTotal = ANCHO_LOGICO) {
  // Capa 0: Cielo crepuscular
  const cielo = ctx.createLinearGradient ? ctx.createLinearGradient(0, 0, 0, 600) : null;
  if (cielo && typeof cielo.addColorStop === 'function') {
    cielo.addColorStop(0, '#21264c');
    cielo.addColorStop(0.45, '#73375f');
    cielo.addColorStop(0.75, '#cf6242');
    cielo.addColorStop(1, '#f7b458');
    ctx.fillStyle = cielo;
  } else {
    ctx.fillStyle = '#cf6242';
  }
  ctx.fillRect(0, 0, ANCHO_LOGICO, ALTO_LOGICO);

  // Luna creciente
  ctx.fillStyle = '#fff9d6';
  ctx.beginPath();
  ctx.arc(1060, 95, 36, 0, Math.PI * 2);
  ctx.fill();

  // Capa 1: Silueta lejana de cúpulas e iglesias coloniales (factor 0.08)
  ctx.fillStyle = '#483353';
  const pasoL1 = 480;
  const offL1 = -((cameraX * 0.08) % pasoL1);
  for (let x = offL1 - pasoL1; x < ANCHO_LOGICO + pasoL1; x += pasoL1) {
    ctx.beginPath();
    ctx.arc(x + 200, 480, 50, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x + 160, 480, 80, 120);
    ctx.fillRect(x + 360, 390, 42, 210);
    ctx.beginPath();
    ctx.moveTo(x + 355, 390);
    ctx.lineTo(x + 381, 350);
    ctx.lineTo(x + 407, 390);
    ctx.fill();
  }

  // Capa 2: Fachadas coloniales con papel picado y balcones (factor 0.32)
  const coloresCasona = ['#b84a39', '#d49b35', '#2b6684', '#c73866', '#4a7c59'];
  const pasoL2 = 240;
  const offL2 = -((cameraX * 0.32) % pasoL2);
  let cIdx = 0;
  for (let x = offL2 - pasoL2; x < ANCHO_LOGICO + pasoL2; x += pasoL2) {
    const col = coloresCasona[cIdx % coloresCasona.length];
    const altoCasa = 240 + (cIdx % 3) * 35;
    ctx.fillStyle = col;
    ctx.fillRect(x, 600 - altoCasa, pasoL2 - 8, altoCasa);
    ctx.fillStyle = '#e8d9c5';
    ctx.fillRect(x - 2, 600 - altoCasa, pasoL2 - 4, 10);
    ctx.fillStyle = '#1e1828';
    ctx.fillRect(x + 35, 635 - altoCasa, 38, 55);
    ctx.fillStyle = 'rgba(255, 225, 140, 0.7)';
    ctx.fillRect(x + 40, 642 - altoCasa, 28, 42);
    cIdx++;
  }

  // Guirnaldas festivas de papel picado
  const coloresPapel = ['#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22', '#3498db'];
  for (let g = 0; g < 2; g++) {
    const gy = 310 + g * 50;
    for (let x = offL2 - pasoL2; x < ANCHO_LOGICO + pasoL2; x += 40) {
      const sag = Math.sin(((x + cameraX * 0.32) % 320) / 320 * Math.PI) * 18;
      ctx.fillStyle = coloresPapel[Math.abs(Math.floor((x + cameraX * 0.32) / 40)) % coloresPapel.length];
      ctx.fillRect(x + 4, gy + sag, 28, 22);
    }
  }

  // Capa 3: Fachada de la Taquería tradicional
  const offL3 = -((cameraX * 0.75) % 1280);
  for (let tx = offL3 - 1280; tx < ANCHO_LOGICO + 1280; tx += 1280) {
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(tx + 890, 395);
    ctx.lineTo(tx + 935, 395);
    ctx.lineTo(tx + 922, 450);
    ctx.lineTo(tx + 902, 450);
    ctx.fill();
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(tx + 906, 380, 14, 15);
  }
}

// Parallax Reja del Parque (7 pantallas de ancho = 8960 px)
export function dibujarParalajeReja(ctx, cameraX, tiempo, anchoTotal = 8960) {
  // Capa 0: Cielo desértico amplio
  const cielo = ctx.createLinearGradient ? ctx.createLinearGradient(0, 0, 0, 620) : null;
  if (cielo && typeof cielo.addColorStop === 'function') {
    cielo.addColorStop(0, '#52a5c4');
    cielo.addColorStop(0.55, '#f4c778');
    cielo.addColorStop(1, '#f6dda0');
    ctx.fillStyle = cielo;
  } else {
    ctx.fillStyle = '#eabf78';
  }
  ctx.fillRect(0, 0, ANCHO_LOGICO, ALTO_LOGICO);

  // Sol desértico radiante
  ctx.fillStyle = '#fff4ba';
  ctx.beginPath();
  ctx.arc(1030, 125, 54, 0, Math.PI * 2);
  ctx.fill();

  // Capa 1: Sierra montañosa lejana con estratos (factor 0.08)
  for (let layer = 0; layer < 3; layer++) {
    const factor = [0.08, 0.22, 0.42][layer];
    const baseY = [410, 480, 545][layer];
    const step = [520, 390, 280][layer];
    const offset = -((cameraX * factor) % step);
    ctx.fillStyle = ['#9e5f52', '#ba6f49', '#d8945a'][layer];
    for (let x = offset - step; x < ANCHO_LOGICO + step; x += step) {
      const h = [118, 95, 58][layer] + (Math.floor((x + cameraX * factor) / step) % 3) * 16;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x + step * 0.22, baseY - h * 0.65);
      ctx.lineTo(x + step * 0.35, baseY - h);
      ctx.lineTo(x + step * 0.52, baseY - h * 0.85);
      ctx.lineTo(x + step * 0.68, baseY - h);
      ctx.lineTo(x + step * 0.82, baseY - h * 0.45);
      ctx.lineTo(x + step, baseY);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Capa 2: Saguaros y nopales intermedios que se desplazan (factor 0.65)
  for (let i = 0; i < 16; i++) {
    const x = ((i * 220 - cameraX * 0.65) % 3200 + 3200) % 3200 - 100;
    if (x >= -60 && x <= ANCHO_LOGICO + 60) {
      const y = 560;
      ctx.fillStyle = '#4a7c59';
      ctx.fillRect(x, y - 55, 12, 55);
      ctx.fillRect(x - 14, y - 40, 14, 8);
      ctx.fillRect(x - 14, y - 52, 8, 20);
      ctx.fillRect(x + 12, y - 32, 14, 8);
      ctx.fillRect(x + 18, y - 45, 8, 21);
    }
  }
}

// Parallax Desierto abierto
export function dibujarParalajeDesierto(ctx, cameraX, tiempo) {
  dibujarParalajeReja(ctx, cameraX, tiempo, 1280);
}

// Parallax Ciudad
export function dibujarParalajeCiudad(ctx, cameraX, tiempo) {
  dibujarParalajeTaqueria(ctx, cameraX, tiempo, 1280);
}

// Elementos de la Reja del Parque en el primer plano
function dibujarReja(ctx) {
  ctx.fillStyle = '#473c32';
  ctx.fillRect(65, 365, 8, 235);
  ctx.fillRect(365, 365, 8, 235);
  ctx.fillStyle = '#f3d383';
  ctx.fillRect(78, 355, 280, 12);
  ctx.fillStyle = '#574b3c';
  for (let x = 86; x < 360; x += 24) {
    ctx.fillRect(x, 370, 6, 230);
    ctx.beginPath();
    ctx.moveTo(x - 3, 370);
    ctx.lineTo(x + 3, 358);
    ctx.lineTo(x + 9, 370);
    ctx.fill();
  }
  ctx.fillRect(75, 420, 285, 7);
  ctx.fillStyle = '#f6e3a4';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PARQUE DEL DESIERTO', 218, 348);
}

// Camión a la Taquería en la parada de la Ciudad
function dibujarCamionParada(ctx) {
  ctx.fillStyle = '#2b7a78';
  ctx.fillRect(980, 445, 250, 140);
  ctx.fillStyle = '#e07a5f';
  ctx.fillRect(980, 425, 250, 22);
  ctx.fillStyle = '#a8dadc';
  ctx.fillRect(1010, 462, 65, 45);
  ctx.fillRect(1090, 462, 65, 45);
  ctx.fillStyle = '#b07145';
  ctx.fillRect(995, 390, 75, 35);
  ctx.fillRect(1080, 380, 85, 45);
  ctx.fillStyle = '#1e1b22';
  ctx.beginPath();
  ctx.arc(1035, 588, 24, 0, Math.PI * 2);
  ctx.arc(1175, 588, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff5df';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CAMIÓN A LA TAQUERÍA', 1105, 442);
}

// Dibuja la escena y entidades sobre el contexto 2D lógico
export function renderizarEscena({
  ctx,
  escena,
  cuerpoJugador,
  catalogoArte = null,
  rutaFondo = null,
  tiempo = 0,
  cameraX = 0,
  debug = modoDebugActivo(),
}) {
  if (!ctx || !escena) return;

  ctx.save();
  ctx.imageSmoothingEnabled = false; // pixel art nítido

  // 1. Limpieza de resolución lógica
  ctx.clearRect(0, 0, ANCHO_LOGICO, ALTO_LOGICO);

  // 2. Fondo por capas con paralaje (propio, no referencia pegada)
  const fondoCfg = escena.fondo || {};
  let imagenFondo = null;
  const rutaImagenFondo = rutaFondo || fondoCfg.ruta;
  if (rutaImagenFondo && catalogoArte) {
    imagenFondo = catalogoArte.obtener(rutaImagenFondo);
  }

  // Si hay imagen precargada y es prueba sin paralaje forzado
  if (imagenFondo) {
    ctx.drawImage(imagenFondo, 0, 0, ANCHO_LOGICO, ALTO_LOGICO);
  } else if (escena.id === 'reja') {
    dibujarParalajeReja(ctx, cameraX, tiempo, escena.limites?.w || 8960);
  } else if (escena.id === 'desierto' || fondoCfg.estilo === 'desierto') {
    dibujarParalajeDesierto(ctx, cameraX, tiempo);
  } else if (escena.id === 'ciudad' || fondoCfg.estilo === 'ciudad') {
    dibujarParalajeCiudad(ctx, cameraX, tiempo);
  } else if (escena.id === 'taqueria') {
    dibujarParalajeTaqueria(ctx, cameraX, tiempo);
  } else {
    // Fondo plano de respaldo
    ctx.fillStyle = fondoCfg.colorRespaldo || '#e6be8a';
    ctx.fillRect(0, 0, ANCHO_LOGICO, ALTO_LOGICO);
  }

  ctx.save();
  ctx.translate(-cameraX, 0);

  if (escena.id === 'reja' || fondoCfg.estilo === 'desierto') dibujarReja(ctx);
  if (escena.id === 'ciudad' || fondoCfg.estilo === 'ciudad') dibujarCamionParada(ctx);

  // 3. Plataformas dibujadas como objetos ambientales (cajas, huacales, toldos, rocas, etc.)
  // Con arte cargado, las plataformas se dibujan cuando plataformasVisibles es true.
  // Sin arte cargado, siempre se dibujan para asegurar visibilidad en respaldo.
  if (Array.isArray(escena.plataformas) && (!imagenFondo || fondoCfg.plataformasVisibles)) {
    for (const plat of escena.plataformas) {
      dibujarPlataformaObjeto(ctx, plat, tiempo, escena.id);
    }
  }

  // 3b. Objetos recogibles: imagen del catálogo o cajita de respaldo
  if (Array.isArray(escena.objetos)) {
    for (const objeto of escena.objetos) {
      if (!objeto || objeto.recogido) continue;
      if (objeto.tipo === 'llave') {
        ctx.save();
        ctx.strokeStyle = '#ffe169';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(objeto.x + 9, objeto.y + 9, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ffe169';
        ctx.fillRect(objeto.x + 14, objeto.y + 7, 20, 5);
        ctx.fillRect(objeto.x + 25, objeto.y + 10, 5, 9);
        ctx.restore();
        continue;
      }
      if (dibujarObjeto(ctx, catalogoArte, objeto, tiempo)) continue;
      if (objeto.tipo === 'botiquin') {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(objeto.x, objeto.y, objeto.w || 36, objeto.h || 36);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.strokeRect(objeto.x, objeto.y, objeto.w || 36, objeto.h || 36);
        ctx.fillStyle = '#e74c3c';
        const cx = objeto.x + (objeto.w || 36) / 2;
        const cy = objeto.y + (objeto.h || 36) / 2;
        ctx.fillRect(cx - 3, cy - 10, 6, 20);
        ctx.fillRect(cx - 10, cy - 3, 20, 6);
        ctx.restore();
        continue;
      }
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(objeto.x, objeto.y, objeto.w || 24, objeto.h || 24);
    }
  }

  if (debug) dibujarDebugColisiones(ctx, escena);
  ctx.restore();

  // 4. Senku provisional si se pasó directamente el cuerpo
  if (cuerpoJugador) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(
      cuerpoJugador.x + cuerpoJugador.w / 2,
      cuerpoJugador.y + cuerpoJugador.h + 2,
      cuerpoJugador.w * 0.45,
      5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = '#e67e22';
    ctx.fillRect(cuerpoJugador.x, cuerpoJugador.y, cuerpoJugador.w, cuerpoJugador.h);
    ctx.strokeStyle = '#9c4d0a';
    ctx.lineWidth = 3;
    ctx.strokeRect(cuerpoJugador.x, cuerpoJugador.y, cuerpoJugador.w, cuerpoJugador.h);

    const ojoX = cuerpoJugador.mirando === 1
      ? cuerpoJugador.x + cuerpoJugador.w - 12
      : cuerpoJugador.x + 6;
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(ojoX, cuerpoJugador.y + 8, 6, 6);
  }

  ctx.restore();
}
