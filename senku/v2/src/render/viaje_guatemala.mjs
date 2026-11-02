// Dibujo del viaje a Guatemala: parada de la camioneta en la cima y cinemática de carretera.
// Sólo dibuja; el tiempo y el estado vienen de core/viaje_guatemala.mjs.
import { resolverRutaArte } from './sprites.mjs';
import { TIEMPO_EMBARQUE, DURACION_VIAJE_GUATEMALA } from '../core/viaje_guatemala.mjs';

export const RUTA_CAMIONETA_GUATEMALA = 'assets/bonus/chicken-bus-guatemala.webp';
export const RUTA_PAISAJE_VIAJE = 'assets/fondos/viaje-guatemala.webp';
export const RUTA_LLEGADA_ANTIGUA = 'assets/escenas/guatemala-antigua/01.webp';
export const RUTAS_ARTE_VIAJE_GUATEMALA = [RUTA_CAMIONETA_GUATEMALA, RUTA_PAISAJE_VIAJE, RUTA_LLEGADA_ANTIGUA];

const ANCHO = 1280;
const ALTO = 720;
const VELOCIDAD = 700;        // px/s de la carretera
const INICIO_FRENADO = 5.8;   // s de carretera en que empieza a frenar
const DURACION_FRENADO = 1.5;
const ENTRADA_LETRERO = 1.9;  // s de carretera en que asoma el letrero de la frontera
const VENTANA = { x: 262, y: 160, w: 62, h: 68 }; // ventana de Senku, en píxeles de la imagen (800×409)

const limitar = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const suave = (v) => { const x = limitar(v); return x * x * (3 - 2 * x); };

// Distancia recorrida por la carretera: constante y luego frenando hasta parar en Antigua.
export function distanciaViaje(u) {
  if (u <= INICIO_FRENADO) return VELOCIDAD * Math.max(0, u);
  const f = Math.min(u - INICIO_FRENADO, DURACION_FRENADO);
  return VELOCIDAD * (INICIO_FRENADO + f - (f * f) / (2 * DURACION_FRENADO));
}

// Posición x del letrero de «Bienvenidos a Guatemala» (entra por la derecha y sale por la izquierda).
export function xLetreroFrontera(u) {
  return 1400 - (distanciaViaje(u) - VELOCIDAD * ENTRADA_LETRERO) * 0.7;
}

function imagenDe(catalogo, ruta) {
  return catalogo?.obtener?.(resolverRutaArte(ruta)) || null;
}

function dibujarCamioneta(ctx, imagen, x, y, w, h, etiqueta = true) {
  if (imagen) { ctx.drawImage(imagen, x, y, w, h); return; }
  // Respaldo sin arte: camioneta de colores sencilla.
  ctx.fillStyle = '#f2b52f'; ctx.fillRect(x, y + h * 0.3, w, h * 0.55);
  ctx.fillStyle = '#e2523c'; ctx.fillRect(x, y + h * 0.55, w, h * 0.12);
  ctx.fillStyle = '#2f3638';
  ctx.beginPath(); ctx.arc(x + w * 0.25, y + h * 0.88, h * 0.12, 0, Math.PI * 2);
  ctx.arc(x + w * 0.8, y + h * 0.88, h * 0.12, 0, Math.PI * 2); ctx.fill();
  if (etiqueta) {
    ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(h * 0.09)}px system-ui, sans-serif`; ctx.textAlign = 'center';
    ctx.fillText('A GUATEMALA', x + w * 0.8, y + h * 0.3);
  }
}

// Parada en la cima: poste, camioneta con motor al ralentí y «Sube» al acercarse.
export function dibujarParadaGuatemala(ctx, catalogo, parada, tiempo = 0, cerca = false) {
  if (!ctx || !parada) return;
  const { x, y, w, h } = parada.dibujo;
  const vibra = Math.round(Math.sin(tiempo * 24) * 1);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  // Sombra y poste con su letrero.
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h - 2, w * 0.48, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5a3d27'; ctx.fillRect(x - 38, y + 70, 8, h - 66);
  ctx.fillStyle = '#2f7fc1'; ctx.fillRect(x - 92, y + 40, 104, 38);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(x - 92, y + 40, 104, 38);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('PARADA', x - 34, y + 56);
  ctx.fillStyle = '#ffd45f'; ctx.font = 'bold 12px system-ui, sans-serif'; ctx.fillText('GUATEMALA', x - 34, y + 71);
  dibujarCamioneta(ctx, imagenDe(catalogo, RUTA_CAMIONETA_GUATEMALA), x, y + vibra, w, h);
  // Humito del escape (trasero, a la izquierda).
  for (let i = 0; i < 4; i++) {
    const p = (tiempo * 0.9 + i * 0.25) % 1;
    ctx.fillStyle = `rgba(225,218,205,${(1 - p) * 0.5})`;
    ctx.beginPath(); ctx.arc(x + 6 - p * 26, y + h - 26 - p * 30, 5 + p * 11, 0, Math.PI * 2); ctx.fill();
  }
  if (cerca) {
    const salto = Math.sin(tiempo * 5) * 6;
    const cx = parada.puertaX;
    ctx.fillStyle = 'rgba(16,44,18,.92)';
    ctx.beginPath(); ctx.roundRect(cx - 62, y - 44 + salto, 124, 38, 12); ctx.fill();
    ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#86efac'; ctx.font = 'bold 20px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Sube', cx, y - 18 + salto);
    ctx.fillStyle = '#4ade80';
    ctx.beginPath(); ctx.moveTo(cx - 9, y - 6 + salto); ctx.lineTo(cx + 9, y - 6 + salto); ctx.lineTo(cx, y + 6 + salto); ctx.fill();
  }
  ctx.restore();
}

function dibujarPinos(ctx, dist, factor, base, color, altoMin, altoVar, separacion) {
  const periodo = 26 * separacion;
  ctx.fillStyle = color;
  for (let i = 0; i < 26; i++) {
    const alto = altoMin + ((i * 53) % altoVar);
    const x = ((i * separacion + ((i * 37) % 23) - dist * factor) % periodo + periodo) % periodo - 120;
    for (let piso = 0; piso < 3; piso++) {
      const an = (alto * 0.32) * (1 - piso * 0.22);
      const yb = base - alto * (0.22 + piso * 0.26);
      ctx.beginPath(); ctx.moveTo(x - an, yb); ctx.lineTo(x, yb - alto * 0.42); ctx.lineTo(x + an, yb); ctx.fill();
    }
    ctx.fillRect(x - 3, base - alto * 0.2, 6, alto * 0.2);
  }
}

function dibujarCarretera(ctx, dist, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#3f7d3a'; ctx.fillRect(0, 548, ANCHO, 22);
  ctx.fillStyle = '#4b4552'; ctx.fillRect(0, 570, ANCHO, ALTO - 570);
  ctx.fillStyle = '#e8e0d0'; ctx.fillRect(0, 578, ANCHO, 5); ctx.fillRect(0, 708, ANCHO, 5);
  ctx.fillStyle = '#f2c14e';
  for (let i = -1; i < 12; i++) ctx.fillRect(((i * 150 - dist) % 1800 + 1800) % 1800 - 150, 640, 90, 7);
  // Postes de la orilla, cercanos y rápidos.
  for (let i = 0; i < 9; i++) {
    const x = ((i * 220 - dist) % 1980 + 1980) % 1980 - 120;
    ctx.fillStyle = '#6b4a2b'; ctx.fillRect(x, 508, 9, 48);
    ctx.fillStyle = '#e8e0d0'; ctx.fillRect(x - 40, 520, 90, 7);
  }
  ctx.restore();
}

function dibujarLetrero(ctx, x) {
  const y = 135; // por encima del techo de la camioneta
  ctx.save();
  ctx.fillStyle = '#6b4a2b'; ctx.fillRect(x + 60, y + 150, 14, 275); ctx.fillRect(x + 486, y + 150, 14, 275);
  ctx.fillStyle = '#2f7fc1';
  ctx.beginPath(); ctx.roundRect(x, y, 560, 160, 16); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff'; ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.fillText('¡BIENVENIDOS', x + 280, y + 58);
  ctx.fillStyle = '#ffd45f'; ctx.font = 'bold 54px system-ui, sans-serif';
  ctx.fillText('A GUATEMALA!', x + 280, y + 116);
  ctx.fillStyle = '#d6ecff'; ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillText('Corazón del Mundo Maya', x + 280, y + 144);
  ctx.restore();
}

function rotulo(ctx, texto, alpha, y = 86) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 40px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(30,14,40,.85)'; ctx.strokeText(texto, ANCHO / 2, y);
  ctx.fillStyle = '#fff4cf'; ctx.fillText(texto, ANCHO / 2, y);
  ctx.restore();
}

// t = segundos desde que Senku sube. Antes de TIEMPO_EMBARQUE sólo funde a negro sobre la escena.
export function dibujarCinematicaGuatemala(ctx, catalogo, t, { dibujarSenkuVentana = null } = {}) {
  if (!ctx) return;
  if (t < TIEMPO_EMBARQUE) {
    ctx.save();
    ctx.fillStyle = `rgba(14,10,22,${limitar((t - 0.3) / 0.7)})`;
    ctx.fillRect(0, 0, ANCHO, ALTO);
    ctx.restore();
    return;
  }
  const u = t - TIEMPO_EMBARQUE;
  const dist = distanciaViaje(u);
  const freno = limitar((u - INICIO_FRENADO) / DURACION_FRENADO);
  const llegada = suave((u - 5.6) / 1);
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // Cielo, volcanes y sierra: una sola imagen que se desplaza muy despacio.
  const cielo = ctx.createLinearGradient(0, 0, 0, ALTO);
  cielo.addColorStop(0, '#7a4f93'); cielo.addColorStop(0.55, '#f0a868'); cielo.addColorStop(1, '#3f7d3a');
  ctx.fillStyle = cielo; ctx.fillRect(0, 0, ANCHO, ALTO);
  const paisaje = imagenDe(catalogo, RUTA_PAISAJE_VIAJE);
  if (paisaje) ctx.drawImage(paisaje, -dist * 0.02, -60, 1560, 1560 * paisaje.height / paisaje.width);
  dibujarPinos(ctx, dist, 0.22, 560, '#1d4a2d', 70, 60, 64);
  dibujarPinos(ctx, dist, 0.45, 575, '#143a22', 100, 70, 110);

  // Letrero de la frontera (detrás de la camioneta).
  const xLetrero = xLetreroFrontera(u);
  if (xLetrero > -600 && xLetrero < ANCHO + 40) dibujarLetrero(ctx, xLetrero);
  dibujarCarretera(ctx, dist, 1 - llegada);

  // Llegada: Antigua aparece detrás de la camioneta.
  if (llegada > 0) {
    const antigua = imagenDe(catalogo, RUTA_LLEGADA_ANTIGUA);
    ctx.save();
    ctx.globalAlpha = llegada;
    if (antigua) ctx.drawImage(antigua, 0, 0, ANCHO, ALTO);
    else { ctx.fillStyle = '#e9a77e'; ctx.fillRect(0, 0, ANCHO, ALTO); }
    ctx.restore();
  }

  // Camioneta: rebota con la carretera, con Senku en su ventana.
  const bw = 640;
  const bh = Math.round(bw * 409 / 800);
  const bx = 330 + llegada * 290; // al llegar avanza a su lugar y deja ver el arco de Antigua
  const base = 668 - llegada * 38;
  const bote = Math.sin(u * 17) * 1.8 * (1 - freno) + Math.sin(u * 5.3) * 1.2 * (1 - freno);
  const by = base - bh + bote;
  const k = bw / 800;
  for (let i = 0; i < 7; i++) { // humo de escape
    const p = (u * 1.4 + i * 0.15) % 1;
    ctx.fillStyle = `rgba(225,218,205,${(1 - p) * 0.55})`;
    ctx.beginPath(); ctx.arc(bx + 18 - p * 110, base - 40 - p * 40, 8 + p * 20, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,.28)'; // sombra sobre el asfalto
  ctx.beginPath(); ctx.ellipse(bx + bw * 0.52, base + 4, bw * 0.5, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2f2638'; // interior oscuro tras las ventanas
  ctx.fillRect(bx + 30 * k, by + 150 * k, 460 * k, 82 * k);
  ctx.fillRect(bx + 590 * k, by + 150 * k, 100 * k, 90 * k);
  dibujarCamioneta(ctx, imagenDe(catalogo, RUTA_CAMIONETA_GUATEMALA), bx, by, bw, bh);
  if (dibujarSenkuVentana) { // Senku se asoma por su ventana, delante del vidrio
    ctx.save();
    ctx.beginPath(); ctx.rect(bx + VENTANA.x * k, by + VENTANA.y * k, VENTANA.w * k, VENTANA.h * k); ctx.clip();
    dibujarSenkuVentana(ctx, bx + (VENTANA.x + VENTANA.w / 2) * k, by + (VENTANA.y + VENTANA.h) * k + 30, 0.95);
    ctx.restore();
  }

  // Rótulos y ayuda para saltar.
  rotulo(ctx, 'Rumbo a Guatemala…', limitar(u / 0.6) * limitar((2.4 - u) / 0.6));
  rotulo(ctx, 'Antigua, Guatemala', limitar((u - 6.4) / 0.5) * limitar((7.6 - u) / 0.4), 76);
  ctx.fillStyle = 'rgba(25,18,12,.72)'; ctx.fillRect(390, 663, 500, 12);
  ctx.fillStyle = '#ffd45f'; ctx.fillRect(390, 663, 500 * limitar(t / DURACION_VIAJE_GUATEMALA), 12);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Espacio, Enter o toca para saltar', ANCHO / 2, 703);

  // Fundido de entrada y de salida.
  const negro = Math.max(1 - (t - TIEMPO_EMBARQUE) / 0.4, (u - 7.2) / 0.8);
  if (negro > 0) {
    ctx.fillStyle = `rgba(14,10,22,${limitar(negro)})`;
    ctx.fillRect(0, 0, ANCHO, ALTO);
  }
  ctx.restore();
}
