// Motor de renderizado en Canvas para Senku 2.
// Resolución lógica fija 16:9 (1280x720) escalada a la ventana con letterbox sin deformar.
// Catálogo desacoplado de assets para cambiar estilos gráficos sin alterar la física ni la lógica.

import { dibujarObjeto } from './sprites.mjs';

export const ANCHO_LOGICO = 1280;
export const ALTO_LOGICO = 720;
export const RELACION_ASPECTO = 16 / 9;

// Calcula dimensiones para encajar en el contenedor sin deformar (letterbox)
export function calcularDimensionesLetterbox(anchoContenedor, altoContenedor) {
  const cAncho = Math.max(1, anchoContenedor);
  const cAlto = Math.max(1, altoContenedor);

  let escala = cAncho / ANCHO_LOGICO;
  if (ANCHO_LOGICO * escala > cAncho || ALTO_LOGICO * escala > cAlto) {
    escala = cAlto / ALTO_LOGICO;
  }
  // Alternativamente, el factor mínimo entre ambos:
  escala = Math.min(cAncho / ANCHO_LOGICO, cAlto / ALTO_LOGICO);

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
// `crearImagen` es inyectable para probar sin DOM.
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

  // Lanza la carga de todas las rutas; nunca rechaza. Una imagen que no responde a tiempo cuenta como fallida.
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

// Aviso breve «Cargando arte» (barra de progreso) mientras dura la precarga; llamar al final del fotograma.
export function dibujarAvisoCarga(ctx, catalogoArte) {
  const est = catalogoArte?.estado?.();
  if (!ctx || !est || !est.precargando) return false;
  dibujarCargando(ctx, est.progreso);
  return true;
}

function dibujarCargando(ctx, progreso) {
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
  ctx.fillRect(x, ALTO_LOGICO / 2 + 12, Math.round(ancho * Math.max(0, Math.min(1, progreso))), 14);
  ctx.restore();
}

// Modo depuración: `?debug=1` en la URL. Seguro fuera del navegador (Node).
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
  ctx.imageSmoothingEnabled = false; // pixel art nítido (un resize del lienzo restablece el contexto)

  // 1. Limpieza de resolución lógica
  ctx.clearRect(0, 0, ANCHO_LOGICO, ALTO_LOGICO);

  // 2. Fondo (imagen o color plano de respaldo con siluetas de taquería)
  const fondoCfg = escena.fondo || {};
  let imagenFondo = null;
  const rutaImagenFondo = rutaFondo || fondoCfg.ruta;
  if (rutaImagenFondo && catalogoArte) {
    imagenFondo = catalogoArte.obtener(rutaImagenFondo);
  }

  if (imagenFondo) {
    ctx.drawImage(imagenFondo, 0, 0, ANCHO_LOGICO, ALTO_LOGICO);
  } else if (fondoCfg.estilo === 'desierto') {
    dibujarParalajeDesierto(ctx, cameraX, tiempo);
  } else {
    // Fondo plano de respaldo
    ctx.fillStyle = fondoCfg.colorRespaldo || '#e6be8a';
    ctx.fillRect(0, 0, ANCHO_LOGICO, ALTO_LOGICO);

    // Decoración geométrica plana representativa de la taquería
    // Zócalo de azulejos o pared inferior
    ctx.fillStyle = fondoCfg.colorPared || '#f5deb3';
    ctx.fillRect(0, 320, ANCHO_LOGICO, 300);

    // Cenefa tradicional
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(0, 310, ANCHO_LOGICO, 10);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 300, ANCHO_LOGICO, 10);

    // Guirnalda de banderines / luces festivas en el techo
    const totalLuces = 16;
    for (let i = 0; i <= totalLuces; i++) {
      const t = i / totalLuces;
      const lx = 40 + t * (ANCHO_LOGICO - 80);
      const ly = 70 + Math.sin(t * Math.PI) * 50;
      ctx.fillStyle = i % 3 === 0 ? '#e74c3c' : i % 3 === 1 ? '#f1c40f' : '#2ecc71';
      ctx.beginPath();
      ctx.arc(lx, ly, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.save();
  ctx.translate(-cameraX, 0);
  if (fondoCfg.estilo === 'desierto') dibujarReja(ctx);

  // 3. Plataformas y suelo
  // Con arte de fondo las plataformas son invisibles (se apoyan en elementos del dibujo);
  // sin arte se pintan de forma plana como respaldo.
  if (Array.isArray(escena.plataformas) && (!imagenFondo || fondoCfg.plataformasVisibles)) {
    const colorSuelo = fondoCfg.colorSuelo || '#543d2b';
    const colorPlat = fondoCfg.colorPlataforma || '#8c593a';
    for (const plat of escena.plataformas) {
      if (plat.tipo === 'suelo') {
        // Suelo principal
        ctx.fillStyle = colorSuelo;
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        // Borde superior del suelo
        ctx.fillStyle = '#3e2c1e';
        ctx.fillRect(plat.x, plat.y, plat.w, 10);
      } else {
        // Plataformas intermedias (barras, repisas, toldo)
        ctx.fillStyle = colorPlat;
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        // Bisel superior iluminado
        ctx.fillStyle = '#b3774f';
        ctx.fillRect(plat.x, plat.y, plat.w, 4);
        // Sombra inferior
        ctx.fillStyle = '#5c3822';
        ctx.fillRect(plat.x, plat.y + plat.h - 4, plat.w, 4);
      }
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

  // 4. Senku provisional: rectángulo limpio sin inventar arte
  if (cuerpoJugador) {
    // Sombra en el suelo si está cerca de aterrizar
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

    // Rectángulo de Senku (color cálido provisional)
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(cuerpoJugador.x, cuerpoJugador.y, cuerpoJugador.w, cuerpoJugador.h);

    // Contorno
    ctx.strokeStyle = '#9c4d0a';
    ctx.lineWidth = 3;
    ctx.strokeRect(cuerpoJugador.x, cuerpoJugador.y, cuerpoJugador.w, cuerpoJugador.h);

    // Indicador sutil de orientación / mirada
    const ojoX = cuerpoJugador.mirando === 1
      ? cuerpoJugador.x + cuerpoJugador.w - 12
      : cuerpoJugador.x + 6;
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(ojoX, cuerpoJugador.y + 8, 6, 6);
  }

  ctx.restore();
}

function dibujarParalajeDesierto(ctx, cameraX, tiempo) {
  const cielo = ctx.createLinearGradient ? ctx.createLinearGradient(0, 0, 0, 620) : null;
  if (cielo) { cielo.addColorStop(0, '#65b8d0'); cielo.addColorStop(0.68, '#f4c778'); cielo.addColorStop(1, '#f6dda0'); }
  else ctx.fillStyle = '#eabf78';
  if (cielo) ctx.fillStyle = cielo;
  ctx.fillRect(0, 0, ANCHO_LOGICO, ALTO_LOGICO);
  ctx.fillStyle = '#fff0ae';
  ctx.beginPath(); ctx.arc(1030, 125, 58, 0, Math.PI * 2); ctx.fill();
  for (let layer = 0; layer < 3; layer++) {
    const factor = [0.12, 0.28, 0.52][layer];
    const baseY = [405, 478, 542][layer];
    const step = [500, 380, 270][layer];
    const offset = -((cameraX * factor) % step);
    ctx.fillStyle = ['#bc795e', '#a65f43', '#d89358'][layer];
    for (let x = offset - step; x < ANCHO_LOGICO + step; x += step) {
      const h = [115, 92, 56][layer] + (Math.floor((x + cameraX * factor) / step) % 3) * 18;
      ctx.beginPath();
      ctx.moveTo(x, baseY); ctx.lineTo(x + step * 0.18, baseY - h * 0.62);
      ctx.lineTo(x + step * 0.31, baseY - h); ctx.lineTo(x + step * 0.45, baseY - h * 0.8);
      ctx.lineTo(x + step * 0.58, baseY - h); ctx.lineTo(x + step * 0.79, baseY - h * 0.4);
      ctx.lineTo(x + step, baseY); ctx.closePath(); ctx.fill();
    }
  }
  // Cactus silhouettes drift slowly in the nearest background layer.
  for (let i = 0; i < 9; i++) {
    const x = ((i * 191 - cameraX * 0.68) % 1500 + 1500) % 1500 - 80;
    const y = 552 + (i % 3) * 13;
    ctx.fillStyle = '#567b50'; ctx.fillRect(x, y - 50, 12, 50);
    ctx.fillRect(x - 13, y - 35, 13, 8); ctx.fillRect(x - 13, y - 48, 8, 20);
    ctx.fillRect(x + 12, y - 27, 15, 8); ctx.fillRect(x + 19, y - 42, 8, 23);
  }
  ctx.fillStyle = '#e7b767'; ctx.fillRect(0, 575, ANCHO_LOGICO, 145);
  ctx.fillStyle = '#f1ca7c';
  for (let i = 0; i < 22; i++) {
    const x = ((i * 79 - cameraX * 0.85 + ANCHO_LOGICO) % ANCHO_LOGICO);
    ctx.fillRect(x, 579 + (i % 4) * 6 + Math.sin(tiempo + i) * 2, 28, 3);
  }
}

function dibujarReja(ctx) {
  ctx.fillStyle = '#473c32'; ctx.fillRect(65, 365, 6, 235); ctx.fillRect(365, 365, 6, 235);
  ctx.fillStyle = '#f3d383'; ctx.fillRect(78, 355, 280, 10);
  ctx.fillStyle = '#574b3c';
  for (let x = 86; x < 360; x += 26) ctx.fillRect(x, 370, 7, 230);
  ctx.fillRect(75, 420, 285, 7);
  ctx.fillStyle = '#f6e3a4'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('PARQUE DEL DESIERTO', 218, 348);
}
