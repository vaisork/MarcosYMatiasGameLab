// Motor de renderizado en Canvas para Senku 2.
// Resolución lógica fija 16:9 (1280x720) escalada a la ventana con letterbox sin deformar.
// Catálogo desacoplado de assets para cambiar estilos gráficos sin alterar la física ni la lógica.

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

// Catálogo de assets gráficos con respaldo tolerante si falta un recurso
export function crearCatalogoArte() {
  const cache = new Map();
  const avisados = new Set();

  function cargar(ruta) {
    if (!ruta || typeof ruta !== 'string') return null;
    if (cache.has(ruta)) return cache.get(ruta);

    const entrada = {
      ruta,
      cargada: false,
      error: false,
      imagen: null,
    };
    cache.set(ruta, entrada);

    if (typeof Image !== 'undefined') {
      const img = new Image();
      img.onload = () => {
        entrada.cargada = true;
        entrada.imagen = img;
      };
      img.onerror = () => {
        entrada.error = true;
        if (!avisados.has(ruta)) {
          avisados.add(ruta);
          console.warn(`[Senku 2 / Arte] No se pudo cargar el asset: "${ruta}". Usando respaldo gráfico plano.`);
        }
      };
      img.src = ruta;
    }

    return entrada;
  }

  function obtener(ruta) {
    if (!ruta) return null;
    if (!cache.has(ruta)) {
      cargar(ruta);
    }
    const entrada = cache.get(ruta);
    return entrada && entrada.cargada ? entrada.imagen : null;
  }

  return { cargar, obtener, cache };
}

// Dibuja la escena y entidades sobre el contexto 2D lógico
export function renderizarEscena({
  ctx,
  escena,
  cuerpoJugador,
  catalogoArte = null,
  tiempo = 0,
}) {
  if (!ctx || !escena) return;

  ctx.save();

  // 1. Limpieza de resolución lógica
  ctx.clearRect(0, 0, ANCHO_LOGICO, ALTO_LOGICO);

  // 2. Fondo (imagen o color plano de respaldo con siluetas de taquería)
  const fondoCfg = escena.fondo || {};
  let imagenFondo = null;
  if (fondoCfg.ruta && catalogoArte) {
    imagenFondo = catalogoArte.obtener(fondoCfg.ruta);
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
