// Motor de renderizado en Canvas para Senku 2.
import { dibujarParalajeDespenadero } from './despenadero.mjs';
import { dibujarParalajeCima } from './cima.mjs';
// Resolución lógica fija 16:9 (1280x720) escalada a la ventana con letterbox sin deformar.
// Fondos por capas con paralaje (cielo 0.1, lejano 0.3, medio 0.6, primer plano 1.0),
// dibujador de plataformas como objetos ambientales apoyados y taquería detallada.

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

// Dibuja CADA plataforma de escena.plataformas como objeto visible y con soporte (sin flotar)
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
    // Huacal plástico mexicano de mercado con soporte hasta el suelo
    const sueloY = 600;
    const altoReal = Math.max(h, sueloY - y);
    const esRojo = plat.id?.includes('rojo') || (x % 3 === 0);
    const cBase = esRojo ? '#c0392b' : '#27ae60';
    const cOscuro = esRojo ? '#962d22' : '#1e8449';
    const cClaro = esRojo ? '#e74c3c' : '#2ecc71';

    ctx.fillStyle = cBase;
    ctx.fillRect(x, y, w, altoReal);
    // Borde superior iluminado (superficie de salto)
    ctx.fillStyle = cClaro;
    ctx.fillRect(x, y, w, 4);
    ctx.fillStyle = cOscuro;
    ctx.fillRect(x, y + altoReal - 3, w, 3);
    // Enrejado plástico
    ctx.strokeStyle = cOscuro;
    ctx.lineWidth = 1.5;
    for (let gx = x + 8; gx < x + w - 8; gx += 12) {
      ctx.beginPath();
      ctx.moveTo(gx, y + 4);
      ctx.lineTo(gx + 6, y + altoReal - 4);
      ctx.stroke();
    }
    // Ranuras / agarraderas
    ctx.fillStyle = 'rgba(20, 20, 20, 0.45)';
    ctx.fillRect(x + w / 2 - 12, y + 6, 24, 6);
  } else if (tipoObj === 'caja') {
    // Caja de madera / fruta con tablones y soporte hasta el suelo (o superficie de apoyo)
    const sueloY = (y > 450 && y < 580) ? 600 : y + h;
    const altoReal = Math.max(h, sueloY - y);
    const esVerde = plat.id?.includes('verde');
    const cMadera = esVerde ? '#437652' : '#a06634';
    const cBorde = esVerde ? '#2d5438' : '#6e401b';
    const cBisel = esVerde ? '#5ca371' : '#c98a53';

    ctx.fillStyle = cMadera;
    ctx.fillRect(x, y, w, altoReal);
    // Tablones horizontales
    ctx.fillStyle = cBorde;
    for (let ty = y + 8; ty < y + altoReal; ty += 14) {
      ctx.fillRect(x, ty, w, 2);
    }
    // Borde superior iluminado
    ctx.fillStyle = cBisel;
    ctx.fillRect(x, y, w, 3);
    // Refuerzos laterales de esquina
    ctx.fillStyle = cBorde;
    ctx.fillRect(x, y, 6, altoReal);
    ctx.fillRect(x + w - 6, y, 6, altoReal);
    // Clavos / remaches
    ctx.fillStyle = '#22160d';
    ctx.fillRect(x + 2, y + 4, 2, 2);
    ctx.fillRect(x + w - 4, y + 4, 2, 2);
  } else if (tipoObj === 'toldo') {
    // Toldo de lona rayada con ondas festivas y postes de soporte
    const franjaW = 20;
    const totalFranjas = Math.ceil(w / franjaW);
    for (let f = 0; f < totalFranjas; f++) {
      const fx = x + f * franjaW;
      const fw = Math.min(franjaW, x + w - fx);
      ctx.fillStyle = f % 2 === 0 ? '#c0392b' : '#f39c12';
      ctx.fillRect(fx, y, fw, h + 8);
      ctx.beginPath();
      ctx.arc(fx + fw / 2, y + h + 8, fw / 2, 0, Math.PI);
      ctx.fill();
    }
    // Borde superior de amarre
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, w, 3);
    // Postes tubulares de soporte que bajan al suelo si es toldo exterior
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(x + 4, y + h + 8, 4, 600 - (y + h + 8));
    ctx.fillRect(x + w - 8, y + h + 8, 4, 600 - (y + h + 8));
  } else if (tipoObj === 'roca') {
    // Roca del desierto con estratos y base sólida anclada al suelo
    const sueloY = 600;
    const altoReal = Math.max(h, sueloY - y);

    ctx.fillStyle = '#b87445';
    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + w - 8, y);
    ctx.lineTo(x + w, y + altoReal * 0.4);
    ctx.lineTo(x + w - 4, y + altoReal);
    ctx.lineTo(x + 4, y + altoReal);
    ctx.lineTo(x, y + altoReal * 0.5);
    ctx.closePath();
    ctx.fill();

    // Superficie superior iluminada (donde se pisa con certeza)
    ctx.fillStyle = '#deb07e';
    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + w - 8, y);
    ctx.lineTo(x + w - 12, y + 6);
    ctx.lineTo(x + 12, y + 6);
    ctx.closePath();
    ctx.fill();

    // Grietas y sombras geológicas
    ctx.strokeStyle = '#5a2d14';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.35, y + 4);
    ctx.lineTo(x + w * 0.42, y + altoReal * 0.65);
    ctx.moveTo(x + w * 0.65, y + 5);
    ctx.lineTo(x + w * 0.72, y + altoReal * 0.55);
    ctx.stroke();
  } else if (tipoObj === 'barra') {
    // Barra de taquería con azulejos Talavera y base al suelo
    const sueloY = 600;
    const altoReal = Math.max(h, sueloY - y);
    // Cubierta de acero inoxidable
    ctx.fillStyle = '#d5dbdb';
    ctx.fillRect(x, y, w, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, w, 2);
    // Muro con azulejos
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(x, y + 8, w, altoReal - 8);
    ctx.fillStyle = '#2980b9';
    for (let bx = x; bx < x + w - 10; bx += 20) {
      for (let by = y + 12; by < y + altoReal - 12; by += 20) {
        ctx.fillRect(bx + 4, by, 12, 12);
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(bx + 8, by + 4, 4, 4);
        ctx.fillStyle = '#2980b9';
      }
    }
  } else if (tipoObj === 'mesa') {
    // Mesa de plástico de taquería (Corona/Coca-Cola) con patas tubulares al suelo
    const sueloY = 600;
    const altoReal = Math.max(h, sueloY - y);
    const esRoja = (x % 2 === 0);
    const cMesa = esRoja ? '#e74c3c' : '#3498db';
    const cMesaBisel = esRoja ? '#ff7675' : '#74b9ff';

    // Cubierta
    ctx.fillStyle = cMesa;
    ctx.fillRect(x, y, w, 8);
    ctx.fillStyle = cMesaBisel;
    ctx.fillRect(x, y, w, 2);

    // Patas de tubo metálico que bajan hasta el suelo (600)
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(x + 10, y + 8, 4, altoReal - 8);
    ctx.fillRect(x + w - 14, y + 8, 4, altoReal - 8);

    // Sillas plásticas a los lados
    ctx.fillStyle = cMesa;
    // Silla izquierda
    ctx.fillRect(x - 8, y + 14, 12, 6);
    ctx.fillRect(x - 8, y - 6, 4, 20);
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(x - 6, y + 20, 3, sueloY - (y + 20));
    // Silla derecha
    ctx.fillStyle = cMesa;
    ctx.fillRect(x + w - 4, y + 14, 12, 6);
    ctx.fillRect(x + w + 4, y - 6, 4, 20);
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(x + w + 3, y + 20, 3, sueloY - (y + 20));
  } else if (tipoObj === 'banca') {
    // Banca con listones de madera y herrería anclada al suelo
    const sueloY = 600;
    const altoReal = Math.max(h, sueloY - y);
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(x, y, w, 6);
    ctx.fillStyle = '#cd853f';
    ctx.fillRect(x, y, w, 2);
    // Patas de hierro fundido
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(x + 6, y + 6, 5, altoReal - 6);
    ctx.fillRect(x + w - 11, y + 6, 5, altoReal - 6);
  } else if (tipoObj === 'maceta') {
    // Maceta de barro mexicano con follaje y base en suelo
    const sueloY = 600;
    const altoReal = Math.max(h, sueloY - y);
    // Macetón de terracota
    ctx.fillStyle = '#d35400';
    ctx.fillRect(x + 4, y + 4, w - 8, altoReal - 4);
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(x, y, w, 6);
    // Flores de cempasúchil / geranios en la parte superior
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(x + 2, y - 10, w - 4, 10);
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(x + 12, y - 8, 5, 0, Math.PI * 2);
    ctx.arc(x + w / 2, y - 10, 6, 0, Math.PI * 2);
    ctx.arc(x + w - 12, y - 7, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (tipoObj === 'bote') {
    // Bote de basura público cilíndrico al suelo
    const sueloY = 600;
    const altoReal = Math.max(h, sueloY - y);
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(x + 4, y + 6, w - 8, altoReal - 6);
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(x, y, w, 6);
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(x + w / 2 - 8, y - 4, 16, 4);
  } else if (tipoObj === 'parapeto') {
    // Cornisa colonial con muro de fachada debajo
    ctx.fillStyle = '#e8d9c5';
    ctx.fillRect(x, y, w, 8);
    ctx.fillStyle = '#f5efe6';
    ctx.fillRect(x, y, w, 3);
    // Muro de casona debajo
    ctx.fillStyle = '#b84a39';
    ctx.fillRect(x + 4, y + 8, w - 8, 300);
  } else {
    // Plataforma genérica limpia con bisel
    ctx.fillStyle = '#8c593a';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#b3774f';
    ctx.fillRect(x, y, w, 3);
    ctx.fillStyle = '#5c3822';
    ctx.fillRect(x, y + h - 3, w, 3);
  }

  ctx.restore();
}

// Dibuja la Camioneta beige tipo SUV estacionada exactamente en el disparador (x=90, y=430, w=255, h=170)
export function dibujarCamionetaEstacionada(ctx, x = 90, ySuelo = 600, tiempo = 0) {
  if (!ctx) return;
  ctx.save();

  // Chasis y carrocería SUV beige
  const cBeige = '#d8c8a8';
  const cBeigeSombra = '#b5a585';
  const cBeigeClaro = '#ebe0cb';
  const cMoldura = '#3d3835';
  const cVentana = '#47637d';
  const cVidrioBrillo = 'rgba(255, 255, 255, 0.45)';

  // 1. Sombra sobre la banqueta
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x + 130, ySuelo - 2, 135, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Ruedas todoterreno (tocando ySuelo = 600)
  for (const rx of [x + 55, x + 195]) {
    // Neumático de goma negra
    ctx.fillStyle = '#1c1b1f';
    ctx.beginPath();
    ctx.arc(rx, ySuelo - 22, 26, 0, Math.PI * 2);
    ctx.fill();
    // Rin de acero plateado
    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath();
    ctx.arc(rx, ySuelo - 22, 15, 0, Math.PI * 2);
    ctx.fill();
    // Tapa central
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(rx, ySuelo - 22, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Carrocería SUV (x: 90..340, y: 410..570)
  // Parte inferior / faldón
  ctx.fillStyle = cMoldura;
  ctx.fillRect(x + 10, ySuelo - 50, 240, 24);

  // Cuerpo principal beige
  ctx.fillStyle = cBeige;
  ctx.fillRect(x + 8, ySuelo - 120, 242, 70);
  ctx.fillStyle = cBeigeClaro;
  ctx.fillRect(x + 8, ySuelo - 120, 242, 6);

  // Cabina / Ventanillas superiores
  ctx.fillStyle = cBeige;
  ctx.beginPath();
  ctx.moveTo(x + 40, ySuelo - 120);
  ctx.lineTo(x + 75, ySuelo - 185); // Parabrisas inclinado
  ctx.lineTo(x + 235, ySuelo - 185); // Techo
  ctx.lineTo(x + 248, ySuelo - 120); // Ventana trasera
  ctx.closePath();
  ctx.fill();

  // Cristales de ventanas con reflejo
  ctx.fillStyle = cVentana;
  ctx.beginPath();
  ctx.moveTo(x + 80, ySuelo - 180);
  ctx.lineTo(x + 140, ySuelo - 180);
  ctx.lineTo(x + 140, ySuelo - 125);
  ctx.lineTo(x + 52, ySuelo - 125);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + 148, ySuelo - 180);
  ctx.lineTo(x + 228, ySuelo - 180);
  ctx.lineTo(x + 238, ySuelo - 125);
  ctx.lineTo(x + 148, ySuelo - 125);
  ctx.closePath();
  ctx.fill();

  // Reflejo diagonal blanco en los cristales
  ctx.fillStyle = cVidrioBrillo;
  ctx.beginPath();
  ctx.moveTo(x + 85, ySuelo - 178);
  ctx.lineTo(x + 105, ySuelo - 178);
  ctx.lineTo(x + 65, ySuelo - 127);
  ctx.lineTo(x + 55, ySuelo - 127);
  ctx.closePath();
  ctx.fill();

  // 4. Parachoques trasero (parachoques: x: 220, y: 514, w: 105, h: 14)
  ctx.fillStyle = '#bdc3c7';
  ctx.fillRect(x + 130, 514, 105, 14);
  ctx.fillStyle = '#ecf0f1';
  ctx.fillRect(x + 130, 514, 105, 3);
  // Calaveras traseras rojas
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(x + 242, 480, 8, 22);

  // 5. Cajuela con cajas de madera (baul-cajas: x: 235, y: 456, w: 85, h: 14)
  ctx.fillStyle = '#a06634';
  ctx.fillRect(235, 456, 85, 45);
  ctx.fillStyle = '#6e401b';
  ctx.strokeRect(235, 456, 85, 45);
  ctx.fillStyle = '#c98a53';
  ctx.fillRect(235, 456, 85, 4);

  // 6. Portaequipajes y maletas en el techo (portaequipajes: x: 130, y: 376, w: 215, h: 14)
  // Rieles metálicos
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(130, 396, 215, 6);
  ctx.fillRect(145, 388, 6, 8);
  ctx.fillRect(230, 388, 6, 8);
  ctx.fillRect(320, 388, 6, 8);
  // Maletas y bultos amarrados con cuerdas
  // Maleta de cuero vintage café
  ctx.fillStyle = '#8e44ad';
  ctx.fillRect(145, 376, 55, 20);
  ctx.fillStyle = '#9b59b6';
  ctx.fillRect(145, 376, 55, 3);
  // Bolsa de lona verde
  ctx.fillStyle = '#27ae60';
  ctx.fillRect(205, 372, 60, 24);
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(205, 372, 60, 3);
  // Baúl o caja superior
  ctx.fillStyle = '#d35400';
  ctx.fillRect(270, 374, 65, 22);
  ctx.fillStyle = '#e67e22';
  ctx.fillRect(270, 374, 65, 3);
  // Cuerdas de sujeción
  ctx.strokeStyle = '#f39c12';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(140, 400); ctx.lineTo(170, 374); ctx.lineTo(200, 400);
  ctx.moveTo(210, 400); ctx.lineTo(240, 370); ctx.lineTo(265, 400);
  ctx.moveTo(275, 400); ctx.lineTo(305, 372); ctx.lineTo(335, 400);
  ctx.stroke();

  // 7. Humo suave del escape trasero al ralentí
  const humoT = (tiempo * 2) % 1.2;
  const hx = x + 252 + humoT * 25;
  const hy = ySuelo - 35 - humoT * 18;
  const hRadio = 4 + humoT * 8;
  ctx.fillStyle = `rgba(200, 195, 190, ${Math.max(0, 0.4 - humoT * 0.3)})`;
  ctx.beginPath();
  ctx.arc(hx, hy, hRadio, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Dibuja la Taquería tradicional y elementos del primer plano (factor 1.0 en coordenadas de mundo)
export function dibujarPrimerPlanoTaqueria(ctx, cameraX, tiempo, anchoTotal = 3840) {
  if (!ctx) return;
  ctx.save();

  // --- FACHADA DE LA TAQUERÍA (x: 630..1260, y: 220..600) ---
  const tqX0 = 630;
  const tqX1 = 1260;
  const sueloY = 600;

  // Muro exterior cálido de adobe/cantera
  ctx.fillStyle = '#d06346';
  ctx.fillRect(tqX0, 220, tqX1 - tqX0, sueloY - 220);

  // Zócalo de azulejos Talavera en la base
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(tqX0, 470, tqX1 - tqX0, 130);
  ctx.fillStyle = '#2980b9';
  for (let ax = tqX0; ax < tqX1 - 10; ax += 24) {
    for (let ay = 475; ay < 595; ay += 24) {
      ctx.fillRect(ax + 4, ay + 4, 16, 16);
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(ax + 9, ay + 9, 6, 6);
      ctx.fillStyle = '#2980b9';
    }
  }

  // GRAN LETRERO PINTADO A MANO: «★ TACOS Y CHURUS AL PASTOR ★»
  ctx.fillStyle = '#8a1818';
  ctx.fillRect(670, 220, 480, 56);
  ctx.fillStyle = '#fff8ec';
  ctx.fillRect(675, 224, 470, 48);
  ctx.strokeStyle = '#f1c40f';
  ctx.lineWidth = 3;
  ctx.strokeRect(677, 226, 466, 44);

  ctx.fillStyle = '#b32418';
  ctx.font = 'bold 24px "Arial Black", Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ TACOS Y CHURUS AL PASTOR ★', 910, 258);

  // Toldo rayado de la taquería (x: 685, y: 296, w: 460)
  const toldoW = 460;
  const franjaW = 23;
  for (let s = 0; s < toldoW; s += franjaW) {
    const esRojo = Math.floor(s / franjaW) % 2 === 0;
    ctx.fillStyle = esRojo ? '#c0392b' : '#f39c12';
    ctx.fillRect(685 + s, 296, franjaW, 40);
    ctx.beginPath();
    ctx.arc(685 + s + franjaW / 2, 336, franjaW / 2, 0, Math.PI);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(685, 296, toldoW, 4);

  // FOCOS COLGANTES (iluminación cálida de verbena)
  for (let fx = 715; fx <= 1115; fx += 65) {
    const sag = Math.sin(((fx - 685) / toldoW) * Math.PI) * 12;
    const fy = 345 + sag;
    // Cable
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(fx, 336);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    // Halo cálido
    ctx.fillStyle = 'rgba(255, 230, 130, 0.4)';
    ctx.beginPath();
    ctx.arc(fx, fy + 4, 18, 0, Math.PI * 2);
    ctx.fill();
    // Bombilla encendida
    ctx.fillStyle = '#fff4ba';
    ctx.beginPath();
    ctx.arc(fx, fy + 4, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // TROMPO DE PASTOR (detrás de la barra, x ~ 940, y ~ 385..470)
  const tx = 945;
  const ty = 390;
  // Varilla de acero vertical
  ctx.fillStyle = '#bdc3c7';
  ctx.fillRect(tx - 3, ty - 25, 6, 110);
  // Cebolla blanca arriba
  ctx.fillStyle = '#f5f6fa';
  ctx.beginPath();
  ctx.arc(tx, ty - 18, 8, 0, Math.PI * 2);
  ctx.fill();
  // Piña jugosa con copete verde
  ctx.fillStyle = '#f1c40f';
  ctx.fillRect(tx - 10, ty - 10, 20, 16);
  ctx.fillStyle = '#27ae60';
  ctx.fillRect(tx - 4, ty - 16, 8, 6);
  // Carne adobada en trompo cónico invertido
  ctx.fillStyle = '#b32418';
  ctx.beginPath();
  ctx.moveTo(tx - 28, ty + 6);
  ctx.lineTo(tx + 28, ty + 6);
  ctx.lineTo(tx + 12, ty + 72);
  ctx.lineTo(tx - 12, ty + 72);
  ctx.closePath();
  ctx.fill();
  // Capas de bistec adobado y orillas doraditas
  ctx.fillStyle = '#e74c3c';
  for (let ly = ty + 12; ly < ty + 68; ly += 9) {
    const lw = 24 - (ly - ty) * 0.18;
    ctx.fillRect(tx - lw, ly, lw * 2, 4);
  }
  // Charola de goteo de acero
  ctx.fillStyle = '#7f8c8d';
  ctx.fillRect(tx - 34, ty + 72, 68, 8);

  // BARRA DE TACOS (barra-tacos: x: 825, y: 471, w: 180)
  // Salsas y limones sobre la barra
  // Molcajete verde
  ctx.fillStyle = '#1c1b1f';
  ctx.beginPath(); ctx.arc(845, 467, 8, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#27ae60';
  ctx.beginPath(); ctx.arc(845, 467, 6, 0, Math.PI); ctx.fill();
  // Molcajete rojo
  ctx.fillStyle = '#1c1b1f';
  ctx.beginPath(); ctx.arc(865, 467, 8, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath(); ctx.arc(865, 467, 6, 0, Math.PI); ctx.fill();
  // Limones y cebollitas
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(882, 465, 6, 5);
  ctx.fillRect(890, 465, 6, 5);
  ctx.fillStyle = '#f5f6fa';
  ctx.fillRect(900, 465, 12, 6);

  // --- CALLE Y NEGOCIOS CONTINUOS EN PANTALLAS 1 Y 2 ---
  // Pantalla 1 (x: 1280..2560): Puesto de Frutas y Verduras "La Huerta de Senku"
  ctx.fillStyle = '#34495e';
  ctx.fillRect(1620, 360, 340, 240);
  ctx.fillStyle = '#27ae60';
  ctx.fillRect(1630, 380, 320, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FRUTAS Y VERDURAS DE MERCADO', 1790, 402);

  // Pantalla 2 (x: 2560..3840): Panadería y Tiendita Tradicional
  ctx.fillStyle = '#795548';
  ctx.fillRect(2900, 340, 360, 260);
  ctx.fillStyle = '#f39c12';
  ctx.fillRect(2910, 360, 340, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PANADERÍA Y DULCES LA FE', 3080, 382);

  ctx.restore();
}

// Parallax Taquería / Ciudad tradicional mexicana
// Capas con velocidades exactas: cielo 0.1, lejano 0.3, medio 0.6, primer plano 1.0
const RUTAS_CAPAS_PARALAJE = { taqueria: 'ciudad', ciudad: 'ciudad', reja: 'reja', desierto: 'desierto' };

function dibujarCapasIlustradas(ctx, catalogoArte, escenaId, cameraX) {
  const prefijo = RUTAS_CAPAS_PARALAJE[escenaId];
  if (!ctx || !catalogoArte || !prefijo) return false;
  const capas = [
    ['cielo', 0.1],
    ['lejano', 0.3],
    ['medio', 0.6],
  ].map(([nombre, factor]) => ({
    imagen: catalogoArte.obtener(`assets/fondos/paralaje/${prefijo}_${nombre}.webp`),
    factor,
  }));
  if (capas.some((capa) => !capa.imagen)) return false;

  for (const { imagen, factor } of capas) {
    const ancho = imagen.naturalWidth || ANCHO_LOGICO;
    const offset = -(((cameraX || 0) * factor) % ancho);
    for (let x = offset - ancho; x < ANCHO_LOGICO; x += ancho) {
      ctx.drawImage(imagen, x, 0, ancho, ALTO_LOGICO);
    }
  }
  return true;
}

export function dibujarParalajeTaqueria(ctx, cameraX, tiempo, anchoTotal = ANCHO_LOGICO, catalogoArte = null) {
  if (dibujarCapasIlustradas(ctx, catalogoArte, 'taqueria', cameraX)) return;
  if (!ctx) return;
  ctx.save();

  // Capa 0: Cielo crepuscular (parallax 0.1)
  const cielo = ctx.createLinearGradient ? ctx.createLinearGradient(0, 0, 0, 600) : null;
  if (cielo && typeof cielo.addColorStop === 'function') {
    cielo.addColorStop(0, '#1b1e3f');
    cielo.addColorStop(0.42, '#662e58');
    cielo.addColorStop(0.72, '#d4603b');
    cielo.addColorStop(1, '#f5b152');
    ctx.fillStyle = cielo;
  } else {
    ctx.fillStyle = '#d4603b';
  }
  ctx.fillRect(0, 0, ANCHO_LOGICO, ALTO_LOGICO);

  // Luna creciente (desplazamiento 0.1)
  const lunaX = ((1060 - cameraX * 0.1) % (ANCHO_LOGICO + 200) + (ANCHO_LOGICO + 200)) % (ANCHO_LOGICO + 200) - 100;
  ctx.fillStyle = '#fff9d6';
  ctx.beginPath();
  ctx.arc(lunaX, 95, 34, 0, Math.PI * 2);
  ctx.fill();

  // Capa 1: Silueta lejana de cerros, cúpulas e iglesias coloniales (parallax 0.3)
  ctx.fillStyle = '#4a3556';
  const pasoL1 = 520;
  const offL1 = -((cameraX * 0.3) % pasoL1);
  for (let x = offL1 - pasoL1; x < ANCHO_LOGICO + pasoL1; x += pasoL1) {
    // Cerros ondulados de fondo
    ctx.beginPath();
    ctx.arc(x + 200, 480, 70, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x + 130, 480, 140, 120);
    // Cúpula colonial
    ctx.beginPath();
    ctx.arc(x + 360, 410, 36, Math.PI, 0);
    ctx.fill();
    // Campanario con cruz
    ctx.fillRect(x + 342, 410, 36, 190);
    ctx.fillRect(x + 358, 365, 4, 16);
    ctx.fillRect(x + 352, 372, 16, 4);
  }

  // Capa 2: Fachadas coloniales intermedias y papel picado (parallax 0.6)
  const coloresCasona = ['#b84a39', '#d49b35', '#2b6684', '#c73866', '#4a7c59'];
  const pasoL2 = 280;
  const offL2 = -((cameraX * 0.6) % pasoL2);
  let cIdx = 0;
  for (let x = offL2 - pasoL2; x < ANCHO_LOGICO + pasoL2; x += pasoL2) {
    const col = coloresCasona[cIdx % coloresCasona.length];
    const altoCasa = 240 + (cIdx % 3) * 35;
    ctx.fillStyle = col;
    ctx.fillRect(x, 600 - altoCasa, pasoL2 - 12, altoCasa);
    // Cornisa superior
    ctx.fillStyle = '#e8d9c5';
    ctx.fillRect(x - 2, 600 - altoCasa, pasoL2 - 8, 12);
    // Ventanales con luz cálida interior
    ctx.fillStyle = '#1e1828';
    ctx.fillRect(x + 35, 635 - altoCasa, 38, 55);
    ctx.fillStyle = 'rgba(255, 225, 140, 0.75)';
    ctx.fillRect(x + 40, 642 - altoCasa, 28, 42);
    cIdx++;
  }

  // Guirnaldas festivas de papel picado
  const coloresPapel = ['#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22', '#3498db'];
  for (let g = 0; g < 2; g++) {
    const gy = 300 + g * 50;
    for (let x = offL2 - pasoL2; x < ANCHO_LOGICO + pasoL2; x += 40) {
      const sag = Math.sin(((x + cameraX * 0.6) % 320) / 320 * Math.PI) * 16;
      ctx.fillStyle = coloresPapel[Math.abs(Math.floor((x + cameraX * 0.6) / 40)) % coloresPapel.length];
      ctx.fillRect(x + 4, gy + sag, 28, 22);
    }
  }

  ctx.restore();
}

// Parallax Reja del Parque (7 pantallas de ancho = 8960 px)
// Capas: cielo 0.1, lejano 0.3, medio 0.6
export function dibujarParalajeReja(ctx, cameraX, tiempo, anchoTotal = 8960, catalogoArte = null) {
  if (dibujarCapasIlustradas(ctx, catalogoArte, 'reja', cameraX)) return;
  if (!ctx) return;
  ctx.save();

  // Capa 0: Cielo desértico amplio (parallax 0.1)
  const cielo = ctx.createLinearGradient ? ctx.createLinearGradient(0, 0, 0, 620) : null;
  if (cielo && typeof cielo.addColorStop === 'function') {
    cielo.addColorStop(0, '#4898be');
    cielo.addColorStop(0.55, '#f6ca78');
    cielo.addColorStop(1, '#fbe0a4');
    ctx.fillStyle = cielo;
  } else {
    ctx.fillStyle = '#f6ca78';
  }
  ctx.fillRect(0, 0, ANCHO_LOGICO, ALTO_LOGICO);

  // Sol desértico radiante
  const solX = ((1030 - cameraX * 0.1) % (ANCHO_LOGICO + 200) + (ANCHO_LOGICO + 200)) % (ANCHO_LOGICO + 200) - 100;
  ctx.fillStyle = '#fff4ba';
  ctx.beginPath();
  ctx.arc(solX, 125, 52, 0, Math.PI * 2);
  ctx.fill();

  // Capa 1: Sierra montañosa y mesetas lejanas con estratos (parallax 0.3)
  for (let layer = 0; layer < 2; layer++) {
    const factor = [0.2, 0.3][layer];
    const baseY = [440, 500][layer];
    const step = [600, 420][layer];
    const offset = -((cameraX * factor) % step);
    ctx.fillStyle = ['#9e5f52', '#ba6f49'][layer];
    for (let x = offset - step; x < ANCHO_LOGICO + step; x += step) {
      const h = [110, 85][layer] + (Math.floor((x + cameraX * factor) / step) % 3) * 16;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x + step * 0.25, baseY - h * 0.7);
      ctx.lineTo(x + step * 0.45, baseY - h);
      ctx.lineTo(x + step * 0.75, baseY - h * 0.85);
      ctx.lineTo(x + step, baseY);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Capa 2: Dunas, colinas y saguaros (parallax 0.6)
  const stepL2 = 360;
  const offL2 = -((cameraX * 0.6) % stepL2);
  ctx.fillStyle = '#d8945a';
  for (let x = offL2 - stepL2; x < ANCHO_LOGICO + stepL2; x += stepL2) {
    ctx.beginPath();
    ctx.arc(x + 180, 600, 200, Math.PI, 0);
    ctx.fill();
  }

  // Saguaros y nopales intermedios (parallax 0.6)
  for (let i = 0; i < 16; i++) {
    const x = ((i * 220 - cameraX * 0.6) % 3200 + 3200) % 3200 - 100;
    if (x >= -60 && x <= ANCHO_LOGICO + 60) {
      const y = 560;
      ctx.fillStyle = '#3f6b48';
      ctx.fillRect(x, y - 55, 12, 55);
      ctx.fillRect(x - 14, y - 40, 14, 8);
      ctx.fillRect(x - 14, y - 52, 8, 20);
      ctx.fillRect(x + 12, y - 32, 14, 8);
      ctx.fillRect(x + 18, y - 45, 8, 21);
    }
  }

  ctx.restore();
}

// Parallax Desierto abierto (5 pantallas de ancho = 6400 px)
export function dibujarParalajeDesierto(ctx, cameraX, tiempo, anchoTotal = 6400, catalogoArte = null) {
  if (dibujarCapasIlustradas(ctx, catalogoArte, 'desierto', cameraX)) return;
  dibujarParalajeReja(ctx, cameraX, tiempo, anchoTotal);
}

// Parallax Ciudad
export function dibujarParalajeCiudad(ctx, cameraX, tiempo, anchoTotal = 1280, catalogoArte = null) {
  if (dibujarCapasIlustradas(ctx, catalogoArte, 'ciudad', cameraX)) return;
  dibujarParalajeTaqueria(ctx, cameraX, tiempo, anchoTotal);
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

  const anchoEscena = escena.limites?.w || ANCHO_LOGICO;

  // Si es un test aislado sin id de escena y tiene imagen cargada, usar drawImage
  if (!escena.id && imagenFondo) {
    ctx.drawImage(imagenFondo, 0, 0, ANCHO_LOGICO, ALTO_LOGICO);
  } else if (escena.id === 'despenadero') {
    dibujarParalajeDespenadero(ctx, cameraX, tiempo);
  } else if (escena.id === 'cima') {
    dibujarParalajeCima(ctx, cameraX, tiempo);
  } else if (escena.id === 'reja') {
    dibujarParalajeReja(ctx, cameraX, tiempo, anchoEscena, catalogoArte);
  } else if (escena.id === 'desierto' || fondoCfg.estilo === 'desierto') {
    dibujarParalajeDesierto(ctx, cameraX, tiempo, anchoEscena, catalogoArte);
  } else if (escena.id === 'ciudad' || fondoCfg.estilo === 'ciudad') {
    dibujarParalajeCiudad(ctx, cameraX, tiempo, anchoEscena, catalogoArte);
  } else if (escena.id === 'taqueria') {
    dibujarParalajeTaqueria(ctx, cameraX, tiempo, anchoEscena, catalogoArte);
  } else if (imagenFondo) {
    ctx.drawImage(imagenFondo, 0, 0, ANCHO_LOGICO, ALTO_LOGICO);
  } else {
    // Fondo plano de respaldo
    ctx.fillStyle = fondoCfg.colorRespaldo || '#e6be8a';
    ctx.fillRect(0, 0, ANCHO_LOGICO, ALTO_LOGICO);
  }

  ctx.save();
  ctx.translate(-cameraX, 0);

  // Elementos de primer plano (factor 1.0) específicos de la escena
  if (escena.id === 'taqueria') {
    dibujarPrimerPlanoTaqueria(ctx, cameraX, tiempo, anchoEscena);
    // Camioneta estacionada donde está el disparador de subir
    const dispCamioneta = escena.disparadores?.find((d) => d.id === 'camioneta' || d.accion === 'subir');
    if (dispCamioneta) {
      dibujarCamionetaEstacionada(ctx, dispCamioneta.x, 600, tiempo);
    }
  } else if (escena.id === 'reja' || fondoCfg.estilo === 'desierto') {
    dibujarReja(ctx);
  } else if (escena.id === 'ciudad' || fondoCfg.estilo === 'ciudad') {
    dibujarCamionParada(ctx);
  }

  // 3. Plataformas dibujadas como objetos ambientales (cajas, huacales, toldos, rocas, etc.)
  // Dibujar siempre para escenas del juego con id o cuando plataformasVisibles esté activo
  const debeDibujarPlataformas = Boolean(escena.id) || !imagenFondo || fondoCfg.plataformasVisibles;
  if (Array.isArray(escena.plataformas) && debeDibujarPlataformas) {
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
