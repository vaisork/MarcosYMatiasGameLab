// Dibujo del Despeñadero: paredes de roca, anclajes, objetos anclador/garras, mira y cuerda.
// Se llama con el contexto ya trasladado por la cámara.

import { origenGancho } from '../core/anclador.mjs';

function rocaVertical(ctx, p) {
  const g = ctx.createLinearGradient(p.x, 0, p.x + p.w, 0);
  g.addColorStop(0, '#7a4428');
  g.addColorStop(0.5, '#a5643b');
  g.addColorStop(1, '#6b3a22');
  ctx.fillStyle = g;
  ctx.fillRect(p.x, p.y, p.w, p.h);
  // Grietas y salientes donde se ven las garras clavarse.
  ctx.strokeStyle = 'rgba(40, 18, 8, 0.55)';
  ctx.lineWidth = 3;
  for (let y = p.y + 30; y < p.y + p.h; y += 46) {
    const desvio = ((y * 13) % 17) - 8;
    ctx.beginPath();
    ctx.moveTo(p.x + 10, y);
    ctx.lineTo(p.x + p.w / 2 + desvio, y + 14);
    ctx.lineTo(p.x + p.w - 10, y + 4);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255, 220, 170, 0.25)';
  ctx.fillRect(p.x, p.y, 6, p.h);
  ctx.fillStyle = '#c98a55';
  ctx.fillRect(p.x - 4, p.y - 6, p.w + 8, 12);
}

function anclaje(ctx, p, tiempo) {
  ctx.fillStyle = '#5b3a24';
  ctx.fillRect(p.x + p.w / 2 - 5, p.y, 10, p.h);
  ctx.strokeStyle = '#f2c14e';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(p.x + p.w / 2, p.y + p.h - 10, 13 + Math.sin(tiempo * 4) * 1.5, 0, Math.PI * 2);
  ctx.stroke();
}

function icono(ctx, o, tiempo) {
  const cx = o.x + o.w / 2;
  const cy = o.y + o.h / 2 + Math.sin(tiempo * 3) * 4;
  ctx.save();
  ctx.fillStyle = 'rgba(255, 236, 160, 0.35)';
  ctx.beginPath();
  ctx.arc(cx, cy, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2b1a10';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  if (o.tipo === 'anclador') {
    ctx.strokeStyle = '#d9d9d9';
    ctx.beginPath();
    ctx.moveTo(cx, cy + 14); ctx.lineTo(cx, cy - 12);
    ctx.moveTo(cx - 12, cy - 4); ctx.quadraticCurveTo(cx, cy + 8, cx + 12, cy - 4);
    ctx.stroke();
    ctx.strokeStyle = '#b5651d';
    ctx.beginPath();
    ctx.arc(cx, cy + 18, 6, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#f5f0e6';
    for (const d of [-10, 0, 10]) {
      ctx.beginPath();
      ctx.moveTo(cx + d, cy + 12);
      ctx.quadraticCurveTo(cx + d + 6, cy - 4, cx + d - 2, cy - 14);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function dibujarDespenadero(ctx, escena, tiempo = 0) {
  if (!ctx || escena?.id !== 'despenadero') return;
  for (const p of escena.plataformas) {
    // Con escena pintada, la roca ya está en la ilustración; los anclajes sí se marcan.
    if (p.tipo === 'pared' && !escena.arte) rocaVertical(ctx, p);
    else if (p.tipo === 'anclaje') anclaje(ctx, p, tiempo);
  }
  for (const o of escena.objetos) {
    if (!o.recogido && (o.tipo === 'anclador' || o.tipo === 'garras')) icono(ctx, o, tiempo);
  }
}

export function dibujarAnclador(ctx, anclador, cuerpo) {
  if (!ctx || !anclador || anclador.estado === 'guardado') return;
  const o = origenGancho(cuerpo);
  ctx.save();
  if (anclador.estado === 'apuntando') {
    const rad = (anclador.angulo * Math.PI) / 180;
    const dir = cuerpo.mirando || 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(o.x + Math.cos(rad) * 170 * dir, o.y - Math.sin(rad) * 170);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffdd55';
    ctx.beginPath();
    ctx.arc(o.x + Math.cos(rad) * 180 * dir, o.y - Math.sin(rad) * 180, 9, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const fin = anclador.estado === 'jalando' ? anclador.punto : anclador.gancho;
    if (fin) {
      ctx.strokeStyle = '#d8b07a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(fin.x, fin.y);
      ctx.stroke();
      ctx.fillStyle = '#d9d9d9';
      ctx.beginPath();
      ctx.arc(fin.x, fin.y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Fondo del despeñadero: cielo de tarde, mesas lejanas, cañón medio y abismo oscuro abajo.
export function dibujarParalajeDespenadero(ctx, cameraX = 0, tiempo = 0) {
  const W = 1280;
  const H = 720;
  const cielo = ctx.createLinearGradient(0, 0, 0, H);
  cielo.addColorStop(0, '#5aa0d8');
  cielo.addColorStop(0.55, '#f3c58a');
  cielo.addColorStop(1, '#e08a52');
  ctx.fillStyle = cielo;
  ctx.fillRect(0, 0, W, H);

  // Nubes lentas.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  for (let i = 0; i < 5; i++) {
    const x = ((i * 330 - cameraX * 0.08 + tiempo * 6) % (W + 300) + W + 300) % (W + 300) - 150;
    const y = 70 + (i % 3) * 40;
    ctx.beginPath();
    ctx.ellipse(x, y, 70, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 45, y - 10, 45, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mesas lejanas (0.2) y cañón medio (0.45), repetidos sin costura cada 1280 px.
  const capa = (factor, color, alturas, base) => {
    ctx.fillStyle = color;
    const desplazamiento = ((cameraX * factor) % W + W) % W;
    for (let rep = -1; rep <= 1; rep++) {
      const x0 = rep * W - desplazamiento;
      ctx.beginPath();
      ctx.moveTo(x0, H);
      alturas.forEach(([px, py]) => ctx.lineTo(x0 + px, base - py));
      ctx.lineTo(x0 + W, H);
      ctx.closePath();
      ctx.fill();
    }
  };
  capa(0.2, '#b9714a', [[0, 120], [140, 120], [180, 190], [420, 190], [460, 110], [700, 110], [760, 220],
    [1000, 220], [1040, 140], [1280, 120]], 520);
  capa(0.45, '#8e4d2f', [[0, 60], [200, 80], [260, 260], [520, 270], [560, 90], [820, 70], [880, 300],
    [1100, 310], [1160, 80], [1280, 60]], 640);

  // Abismo: oscurece hacia abajo para que se lea como caída.
  const abismo = ctx.createLinearGradient(0, 560, 0, H);
  abismo.addColorStop(0, 'rgba(60, 25, 15, 0)');
  abismo.addColorStop(1, 'rgba(30, 10, 5, 0.95)');
  ctx.fillStyle = abismo;
  ctx.fillRect(0, 560, W, H - 560);
}
