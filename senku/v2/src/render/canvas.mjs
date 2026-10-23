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

// Dibuja la escena y entidades sobre el contexto 2D lógico
export function renderizarEscena({
  ctx,
  escena,
  cuerpoJugador,
  catalogoArte = null,
  rutaFondo = null,
  tiempo = 0,
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

  // 3. Plataformas y suelo
  const colorSuelo = fondoCfg.colorSuelo || '#543d2b';
  const colorPlat = fondoCfg.colorPlataforma || '#8c593a';

  if (Array.isArray(escena.plataformas)) {
    for (const plat of escena.plataformas) {
      if (plat.tipo === 'suelo') {
        // Con arte de fondo el suelo ya está dibujado en la imagen
        if (imagenFondo) continue;
        // Suelo principal
        ctx.fillStyle = colorSuelo;
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        // Borde superior del suelo
        ctx.fillStyle = '#3e2c1e';
        ctx.fillRect(plat.x, plat.y, plat.w, 10);
      } else {
        // Con arte de fondo: tablón fino y translúcido, sólo para ver dónde se puede aterrizar
        if (imagenFondo) {
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = '#b3774f';
          ctx.fillRect(plat.x, plat.y, plat.w, 8);
          ctx.fillStyle = '#5c3822';
          ctx.fillRect(plat.x, plat.y + 8, plat.w, 3);
          ctx.globalAlpha = 1;
          continue;
        }
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
      if (dibujarObjeto(ctx, catalogoArte, objeto, tiempo)) continue;
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(objeto.x, objeto.y, objeto.w || 24, objeto.h || 24);
    }
  }

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
