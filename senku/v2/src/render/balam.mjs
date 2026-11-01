import { catalogoArteEnUso, HOJA_JEFE_BALAM, resolverRutaArte } from './sprites.mjs';
import { faseBalam } from '../core/jefe_balam.mjs';

export function dibujarBalam(ctx, balam, tiempo = 0) {
  if (!ctx || !balam || (balam.derrotado && balam.tiempo > 1.6)) return;
  const catalogo = catalogoArteEnUso();
  const imagen = catalogo?.obtener(resolverRutaArte(HOJA_JEFE_BALAM));
  if (!imagen) return;
  const { x, y, w, h } = balam;
  const fila = balam.derrotado ? 2 : balam.estado.startsWith('aviso') ? 1 : balam.estado === 'aturdido' ? 2 : 0;
  const columna = balam.derrotado ? 3 : balam.estado === 'carrera' ? 1 : balam.estado === 'salto' ? 2 : balam.estado === 'lluvia-jade' ? 3 : Math.floor(tiempo * 6) % 4;
  ctx.save();
  if (balam.derrotado) ctx.globalAlpha = Math.max(0, 1 - balam.tiempo / 1.6);
  if (balam.parpadeo > 0 && Math.floor(tiempo * 30) % 2 === 0) ctx.globalAlpha = 0.45;
  ctx.translate(x + w / 2, 0); ctx.scale(balam.mirando || -1, 1); ctx.translate(-(x + w / 2), 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(imagen, columna * 220, fila * 170, 220, 170, x, y, w, h);
  ctx.restore();
  ctx.save();
  for (const onda of balam.ondas) { ctx.fillStyle = '#6ce1c2'; ctx.fillRect(onda.x, onda.y, onda.w, onda.h); }
  for (const jade of balam.jade) {
    ctx.fillStyle = jade.aviso ? 'rgba(119,255,220,.25)' : '#59d6b4';
    ctx.fillRect(jade.x, jade.aviso ? 25 : jade.y, jade.w, jade.aviso ? 3 : jade.h);
  }
  ctx.restore();
}

export function dibujarBarraBalam(ctx, balam) {
  if (!ctx || !balam || balam.estado === 'dormido' || balam.derrotado) return;
  const ancho = 420, x = 430, y = 18;
  ctx.save();
  ctx.fillStyle = 'rgba(20,30,25,.85)'; ctx.fillRect(x, y, ancho, 30);
  ctx.fillStyle = '#58d7b0'; ctx.fillRect(x + 3, y + 3, (ancho - 6) * balam.hp / balam.hpMax, 24);
  ctx.strokeStyle = '#d5f5df'; ctx.lineWidth = 2; ctx.strokeRect(x, y, ancho, 30);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 15px system-ui,sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(`BALAM · FASE ${faseBalam(balam)}`, x + ancho / 2, y + 21);
  ctx.restore();
}
