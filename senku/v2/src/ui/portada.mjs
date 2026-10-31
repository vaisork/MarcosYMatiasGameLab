// Pantalla de inicio: portada, título y botón Jugar. El juego arranca al tocar Jugar
// (así el toque también habilita el sonido en celulares).

export const RUTA_PORTADA = 'assets/portada/portada.webp';
export const RUTA_RESPALDO = 'assets/personajes/menu_original.webp';

// Se muestra al entrar normal; con parámetros de prueba (?escena=…) se salta.
export function debeMostrarPortada(ubicacion) {
  return !ubicacion?.search || ubicacion.search === '?';
}

export function mostrarPortada(documento, { alJugar, tieneProgreso = false } = {}) {
  if (!documento?.body) {
    alJugar?.();
    return null;
  }
  const capa = documento.createElement('div');
  capa.id = 'portada';
  capa.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:9998', 'display:flex', 'flex-direction:column',
    'align-items:center', 'justify-content:space-between', 'padding:6vh 16px 7vh', 'box-sizing:border-box',
    'background:#1b1028', 'font-family:system-ui,sans-serif', 'color:#fff', 'overflow:hidden',
  ].join(';');
  capa.innerHTML = `
    <style>
      #portada .fondo{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(18px) brightness(.55);transform:scale(1.1)}
      #portada .arte{position:absolute;inset:0;background-size:contain;background-repeat:no-repeat;background-position:center}
      #portada .titulo{position:relative;text-align:center;text-shadow:0 4px 0 #2a1a08,0 0 24px rgba(0,0,0,.6)}
      #portada .titulo h1{margin:0;font-size:clamp(48px,12vw,96px);letter-spacing:.04em;color:#f2c14e;font-weight:900}
      #portada .titulo p{margin:4px 0 0;font-size:clamp(16px,4.5vw,24px);font-weight:700}
      #portada .acciones{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px}
      #portada button{font:inherit;font-weight:800;font-size:clamp(20px,5vw,28px);border:0;border-radius:999px;
        padding:14px 48px;cursor:pointer;background:#f2c14e;color:#2a1a08;box-shadow:0 6px 0 #a87a1c;
        animation:latido 1.6s ease-in-out infinite}
      #portada button:active{transform:translateY(4px);box-shadow:0 2px 0 #a87a1c}
      #portada small{opacity:.8;font-size:13px}
      @keyframes latido{50%{transform:scale(1.05)}}
    </style>
    <div class="fondo"></div><div class="arte"></div>
    <div class="titulo"><h1>SENKU 2</h1><p>Capítulo 1 · México</p></div>
    <div class="acciones">
      <button id="portada-jugar">${tieneProgreso ? 'Continuar' : 'Jugar'}</button>
      <small>Idea y dirección: Matías y Javier</small>
    </div>`;
  documento.body.appendChild(capa);

  // Portada pintada si existe; si no, el retrato de Senku.
  const fijar = (ruta) => {
    for (const sel of ['.fondo', '.arte']) capa.querySelector(sel).style.backgroundImage = `url("${ruta}")`;
  };
  if (typeof Image !== 'undefined') {
    const img = new Image();
    img.onload = () => fijar(RUTA_PORTADA);
    img.onerror = () => fijar(RUTA_RESPALDO);
    img.src = RUTA_PORTADA;
  }

  let iniciado = false;
  const jugar = () => {
    if (iniciado) return;
    iniciado = true;
    capa.remove();
    alJugar?.();
  };
  capa.querySelector('#portada-jugar').addEventListener('click', jugar);
  documento.addEventListener('keydown', function alTeclear(e) {
    if (e.code === 'Enter' || e.code === 'Space') {
      documento.removeEventListener('keydown', alTeclear);
      jugar();
    }
  });
  return capa;
}
