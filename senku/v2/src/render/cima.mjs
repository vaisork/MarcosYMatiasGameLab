// Dibujo de la Cima: fondo de cumbre al atardecer, Gato Mecánico, ataques, ratones del lanzador
// y barra de vida del jefe. Arte propio, todo en Canvas (sin imágenes externas).

import { catalogoArteEnUso, dibujarObjeto, HOJA_JEFE_GATO, resolverRutaArte } from './sprites.mjs';

const W = 1280;
const H = 720;

export function dibujarParalajeCima(ctx, cameraX = 0, tiempo = 0) {
  const cielo = ctx.createLinearGradient(0, 0, 0, H);
  cielo.addColorStop(0, '#2b2d5c');
  cielo.addColorStop(0.45, '#c2577a');
  cielo.addColorStop(0.75, '#f3a35b');
  cielo.addColorStop(1, '#f7d08a');
  ctx.fillStyle = cielo;
  ctx.fillRect(0, 0, W, H);

  // Sol bajo y estrellas tempranas.
  ctx.fillStyle = 'rgba(255, 230, 160, 0.9)';
  ctx.beginPath();
  ctx.arc(980 - cameraX * 0.05, 470, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let i = 0; i < 40; i++) {
    const x = ((i * 197) % W) - ((cameraX * 0.03) % W);
    const y = (i * 53) % 220;
    ctx.fillRect((x + W) % W, y, 2, 2);
  }

  // Mar de nubes debajo de la cumbre (lento) y picos lejanos.
  const picos = (factor, color, base, puntas) => {
    const d = ((cameraX * factor) % W + W) % W;
    ctx.fillStyle = color;
    for (let rep = -1; rep <= 1; rep++) {
      const x0 = rep * W - d;
      ctx.beginPath();
      ctx.moveTo(x0, H);
      for (const [px, py] of puntas) ctx.lineTo(x0 + px, base - py);
      ctx.lineTo(x0 + W, H);
      ctx.closePath();
      ctx.fill();
    }
  };
  picos(0.15, '#7a4a6e', 560, [[0, 40], [160, 210], [300, 60], [470, 260], [640, 80], [820, 190], [980, 50], [1120, 230], [1280, 40]]);
  ctx.fillStyle = 'rgba(255, 240, 230, 0.85)';
  for (let i = 0; i < 9; i++) {
    const x = ((i * 170 - cameraX * 0.3 + tiempo * 10) % (W + 200) + W + 200) % (W + 200) - 100;
    ctx.beginPath();
    ctx.ellipse(x, 560 + (i % 3) * 12, 120, 26, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Puerta de la arena (se cierra al despertar al jefe).
export function dibujarPuertaArena(ctx, x, cerrada, tiempo) {
  if (!cerrada) return;
  ctx.save();
  ctx.fillStyle = '#4a4f57';
  ctx.fillRect(x - 24, 330, 24, 270);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 3;
  for (let y = 345; y < 600; y += 34) {
    ctx.beginPath();
    ctx.moveTo(x - 24, y);
    ctx.lineTo(x, y + 10);
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(255, 60, 40, ${0.5 + Math.sin(tiempo * 6) * 0.3})`;
  ctx.fillRect(x - 18, 320, 12, 12);
  ctx.restore();
}

function engrane(ctx, cx, cy, r, dientes, angulo, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angulo);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < dientes * 2; i++) {
    const rr = i % 2 === 0 ? r : r * 0.78;
    const a = (i / (dientes * 2)) * Math.PI * 2;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2a2d33';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function dibujarJefe(ctx, jefe, tiempo = 0) {
  if (!jefe || (jefe.derrotado && jefe.tiempo > 1.6)) return;
  const { x, y, w, h } = jefe;
  const catalogo = catalogoArteEnUso();
  const imagen = catalogo?.obtener(resolverRutaArte(HOJA_JEFE_GATO));
  if (ctx && imagen) {
    const cuadro = jefe.derrotado ? 11
      : jefe.parpadeo > 0 ? 10
        : jefe.estado === 'aviso' ? 6
          : jefe.estado === 'embestida' ? 7
            : jefe.estado === 'salto' ? 8
              : jefe.estado === 'aturdido' ? 9
                : Math.floor(tiempo * 8) % 6;
    const sx = (cuadro % 4) * 220;
    const sy = Math.floor(cuadro / 4) * 170;
    const cx = x + w / 2;
    ctx.save();
    if (jefe.derrotado) ctx.globalAlpha = Math.max(0, 1 - jefe.tiempo / 1.6);
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath();
    ctx.ellipse(cx, jefe.suelo + 4, w * 0.45, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(cx, 0);
    ctx.scale(jefe.mirando || -1, 1);
    ctx.translate(-cx, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(imagen, sx, sy, 220, 170, x, y, w, h);
    ctx.restore();
    dibujarEfectosJefe(ctx, jefe);
    return;
  }
  ctx.save();
  if (jefe.derrotado) {
    ctx.globalAlpha = Math.max(0, 1 - jefe.tiempo / 1.6);
  }
  const cx = x + w / 2;
  const dir = jefe.mirando || -1;
  // Al voltear, todo el gato se refleja sobre su centro.
  ctx.translate(cx, 0);
  ctx.scale(dir, 1);
  ctx.translate(-cx, 0);
  const aviso = jefe.estado === 'aviso';
  const sacudida = aviso ? Math.sin(tiempo * 60) * 3 : 0;
  ctx.translate(sacudida, 0);
  const brillo = jefe.parpadeo > 0 && Math.floor(tiempo * 30) % 2 === 0;

  // Sombra.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(cx, jefe.suelo + 4, w * 0.45, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cola segmentada con antena.
  const ondaCola = Math.sin(tiempo * 3) * 12;
  ctx.strokeStyle = '#5c636e';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 30, y + h * 0.55);
  ctx.quadraticCurveTo(x - 30, y + h * 0.2 + ondaCola, x - 10, y - 10 + ondaCola);
  ctx.stroke();
  ctx.fillStyle = `rgba(255, 70, 50, ${0.6 + Math.sin(tiempo * 8) * 0.4})`;
  ctx.beginPath();
  ctx.arc(x - 10, y - 14 + ondaCola, 9, 0, Math.PI * 2);
  ctx.fill();

  // Patas: pistones que bombean al caminar.
  const paso = jefe.estado === 'acecho' || jefe.estado === 'embestida' ? Math.sin(tiempo * 14) * 8 : 0;
  ctx.fillStyle = '#3d424a';
  for (const [px, fase] of [[x + 40, 1], [x + 80, -1], [x + w - 90, 1], [x + w - 50, -1]]) {
    ctx.fillRect(px, y + h - 50 + paso * fase * 0.5, 24, 50 - paso * fase * 0.5);
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(px - 4, y + h - 10, 32, 10);
    ctx.fillStyle = '#3d424a';
  }

  // Cuerpo de acero con remaches.
  const cuerpo = ctx.createLinearGradient(0, y + 20, 0, y + h - 40);
  cuerpo.addColorStop(0, brillo ? '#ffffff' : '#c7ced8');
  cuerpo.addColorStop(1, brillo ? '#ffd0c8' : '#6b7480');
  ctx.fillStyle = cuerpo;
  ctx.beginPath();
  ctx.ellipse(x + w * 0.45, y + h * 0.55, w * 0.42, h * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2a2d33';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#2a2d33';
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(x + 40 + i * 22, y + h * 0.42 + Math.sin(i) * 3, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  engrane(ctx, x + w * 0.4, y + h * 0.6, 26, 9, tiempo * (jefe.estado === 'embestida' ? 12 : 2), '#c9a227');

  // Cabeza con orejas triangulares y visor.
  const hx = x + w * 0.82;
  const hy = y + h * 0.3;
  ctx.fillStyle = brillo ? '#ffffff' : '#aab3bf';
  ctx.beginPath();
  ctx.moveTo(hx - 40, hy - 18);
  ctx.lineTo(hx - 30, hy - 62);
  ctx.lineTo(hx - 8, hy - 30);
  ctx.lineTo(hx + 14, hy - 30);
  ctx.lineTo(hx + 34, hy - 62);
  ctx.lineTo(hx + 44, hy - 18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(hx + 2, hy, 50, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2a2d33';
  ctx.stroke();
  // Ojos: visor rojo que arde más durante el aviso.
  const intensidad = aviso ? 1 : 0.6 + Math.sin(tiempo * 4) * 0.2;
  ctx.fillStyle = `rgba(255, ${aviso ? 30 : 60}, 40, ${intensidad})`;
  ctx.fillRect(hx - 30, hy - 12, 26, 12);
  ctx.fillRect(hx + 10, hy - 12, 26, 12);
  // Bigotes de alambre.
  ctx.strokeStyle = '#2a2d33';
  ctx.lineWidth = 2;
  for (const dy of [-2, 8]) {
    ctx.beginPath();
    ctx.moveTo(hx + 30, hy + 14 + dy * 0.3);
    ctx.lineTo(hx + 72, hy + 6 + dy);
    ctx.stroke();
  }
  ctx.restore();

  // Ondas y tornillos (sin reflejar).
  ctx.save();
  for (const o of jefe.ondas) {
    ctx.fillStyle = 'rgba(210, 170, 120, 0.85)';
    ctx.beginPath();
    ctx.moveTo(o.x, o.y + o.h);
    ctx.quadraticCurveTo(o.x + o.w / 2, o.y - 12, o.x + o.w, o.y + o.h);
    ctx.fill();
  }
  for (const t of jefe.tornillos) {
    ctx.save();
    ctx.translate(t.x + t.w / 2, t.y + t.h / 2);
    ctx.rotate(t.giro);
    ctx.fillStyle = '#9aa3ad';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3d424a';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function dibujarEfectosJefe(ctx, jefe) {
  ctx.save();
  for (const o of jefe.ondas || []) {
    ctx.fillStyle = 'rgba(210, 170, 120, 0.85)';
    ctx.beginPath();
    ctx.moveTo(o.x, o.y + o.h);
    ctx.quadraticCurveTo(o.x + o.w / 2, o.y - 12, o.x + o.w, o.y + o.h);
    ctx.fill();
  }
  for (const t of jefe.tornillos || []) {
    ctx.save();
    ctx.translate(t.x + t.w / 2, t.y + t.h / 2);
    ctx.rotate(t.giro);
    ctx.fillStyle = '#9aa3ad';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3d424a';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

export function dibujarProyectiles(ctx, lanzador) {
  if (!lanzador) return;
  for (const p of lanzador.proyectiles) {
    ctx.save();
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    ctx.translate(cx, cy);
    ctx.scale(p.dir || 1, 1);
    ctx.fillStyle = '#8d8d94';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2a1b5';
    ctx.beginPath();
    ctx.arc(6, -8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(11, -3, 3, 3);
    ctx.strokeStyle = '#f2a1b5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-p.w / 2, 0);
    ctx.quadraticCurveTo(-p.w / 2 - 12, -10, -p.w / 2 - 20, 2);
    ctx.stroke();
    ctx.restore();
  }
}

// Tubo del lanzador sobre el lomo de Senku.
export function dibujarLanzadorEnLomo(ctx, cuerpo) {
  if (!cuerpo) return;
  const dir = cuerpo.mirando || 1;
  const x = cuerpo.x + cuerpo.w / 2 - dir * 10;
  const y = cuerpo.y + cuerpo.h * 0.18;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  if (dibujarObjeto(ctx, catalogoArteEnUso(), {
    tipo: 'lanzador_ratones', x: -34, y: -20, w: 68, h: 40,
  })) {
    ctx.restore();
    return;
  }
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(-22, -10, 44, 16);
  ctx.fillStyle = '#2a2d33';
  ctx.fillRect(18, -12, 8, 20);
  ctx.fillStyle = '#f2c14e';
  ctx.fillRect(-16, 6, 6, 8);
  ctx.fillRect(10, 6, 6, 8);
  ctx.restore();
}

export function dibujarObjetoLanzador(ctx, objeto, tiempo = 0) {
  if (!objeto || objeto.recogido) return;
  const cx = objeto.x + objeto.w / 2;
  const cy = objeto.y + objeto.h / 2 + Math.sin(tiempo * 3) * 4;
  ctx.save();
  ctx.fillStyle = 'rgba(255, 236, 160, 0.35)';
  ctx.beginPath();
  ctx.arc(cx, cy, 32, 0, Math.PI * 2);
  ctx.fill();
  if (dibujarObjeto(ctx, catalogoArteEnUso(), {
    tipo: 'lanzador_ratones', x: cx - 48, y: cy - 32, w: 96, h: 64,
  }, tiempo)) {
    ctx.restore();
    return;
  }
  dibujarLanzadorEnLomo(ctx, { x: cx - 48, y: cy - 16, w: 96, h: 90, mirando: 1 });
  ctx.restore();
}

// Barra de vida del jefe en coordenadas de pantalla.
export function dibujarBarraJefe(ctx, jefe) {
  if (!jefe || jefe.estado === 'dormido' || (jefe.derrotado && jefe.tiempo > 1.6)) return;
  const ancho = 520;
  const x = (W - ancho) / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(20, 20, 30, 0.75)';
  ctx.fillRect(x - 10, 92, ancho + 20, 46);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GATO MECÁNICO', W / 2, 110);
  ctx.fillStyle = '#3d424a';
  ctx.fillRect(x, 118, ancho, 12);
  ctx.fillStyle = jefe.hp <= jefe.hpMax / 2 ? '#e74c3c' : '#f1c40f';
  ctx.fillRect(x, 118, (ancho * jefe.hp) / jefe.hpMax, 12);
  ctx.restore();
}
