// Estilos de garras (todo gratis): cuerdas y patas. Solo canvas 2D, sin Three,
// para reusar los dibujos en el menú HTML, en el panel VR y como texturas.

export const CUERDAS = [
  { id: 'normal', nombre: 'Cuerda', color: '#ffe3ec', grosor: 1, gancho: '#ff6f9a' },
  { id: 'telarana', nombre: 'Telaraña', grosor: 0.9, periodo: 0.45, gancho: '#f4f4ff' },
  { id: 'cadena', nombre: 'Cadena', grosor: 1.9, periodo: 0.14, gancho: '#7c838e' },
  { id: 'estambre', nombre: 'Estambre', grosor: 1.6, periodo: 0.35, gancho: '#ff6fb5' },
  { id: 'laser', nombre: 'Rayo láser', grosor: 1.1, periodo: 1.2, gancho: '#aaffff', brilla: true },
];

// rayas: qué anillos del brazo se ven (0..4, de la mano al codo).
export const PATAS = [
  { id: 'senku', nombre: 'Senku', pelo: 0xeeebe6, raya: 0x777a82, rosa: 0xf29bb0, rayas: [1, 3] },
  { id: 'naranja', nombre: 'Naranja', pelo: 0xf3a04a, raya: 0xc0602a, rosa: 0xf4a3a8, rayas: [0, 2, 4] },
  { id: 'negra', nombre: 'Negra', pelo: 0x2a2730, raya: 0x151318, rosa: 0x8a5866, rayas: [] },
  { id: 'robot', nombre: 'Robot', pelo: 0xaab4be, raya: 0x3c4450, rosa: 0x38d6ff, rayas: [0, 2, 4], brillo: 0x0a6a88, metal: 0x1a2230 },
  { id: 'tigre', nombre: 'Tigre', pelo: 0xf28a1e, raya: 0x1a1a1a, rosa: 0x3a2a2a, rayas: [0, 1, 2, 3, 4] },
];

const hex = (n) => '#' + n.toString(16).padStart(6, '0');
const lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

// Un tramo del patrón de la cuerda: u = alrededor, v = a lo largo (se repite).
const tramos = {};
export function tramoCuerda(id) {
  if (tramos[id]) return tramos[id];
  const c = lienzo(32, 64), g = c.getContext('2d');
  if (id === 'telarana') {
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(0, 0, 32, 64);
    g.strokeStyle = '#c9c9e0'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(32, 64); g.moveTo(32, 0); g.lineTo(0, 64); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(16, 32, 6, 0, 7); g.fill();
  } else if (id === 'cadena') {
    g.fillStyle = '#4b5058'; g.fillRect(0, 0, 32, 64);
    g.strokeStyle = '#d3d8e0'; g.lineWidth = 6;
    g.beginPath(); g.ellipse(16, 16, 11, 14, 0, 0, 7); g.stroke();
    g.fillStyle = '#aab0ba'; g.fillRect(11, 32, 10, 32);
  } else if (id === 'estambre') {
    const col = ['#ff5f8f', '#ffd23f', '#4fd1a5', '#5aa9ff'];
    for (let k = -2; k < 6; k++) {
      g.fillStyle = col[(k + 8) % 4];
      g.beginPath(); g.moveTo(0, k * 16); g.lineTo(32, k * 16 + 16); g.lineTo(32, k * 16 + 32); g.lineTo(0, k * 16 + 16); g.fill();
    }
  } else if (id === 'laser') {
    const gr = g.createLinearGradient(0, 0, 0, 64);
    gr.addColorStop(0, '#0aa8c8'); gr.addColorStop(0.5, '#e8ffff'); gr.addColorStop(1, '#0aa8c8');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 64);
  }
  return (tramos[id] = c);
}

// Muestra para el menú: un tramo de cuerda en diagonal.
export function muestraCuerda(id, lado = 96) {
  const c = lienzo(lado, lado), g = c.getContext('2d');
  const e = CUERDAS.find((x) => x.id === id) || CUERDAS[0];
  g.translate(lado / 2, lado / 2); g.rotate(-Math.PI / 4);
  const ancho = lado * 0.09 * e.grosor;
  if (e.brilla) { g.shadowColor = '#66ffff'; g.shadowBlur = lado * 0.15; }
  if (e.id === 'normal') g.fillStyle = e.color;
  else { const p = g.createPattern(tramoCuerda(e.id), 'repeat'); p.setTransform(new DOMMatrix().scale(ancho / 32)); g.fillStyle = p; }
  g.fillRect(-ancho / 2, -lado * 0.55, ancho, lado * 1.1);
  g.shadowBlur = 0;
  g.fillStyle = e.gancho; g.beginPath(); g.arc(0, -lado * 0.36, lado * 0.08, 0, 7); g.fill();
  return c;
}

// Muestra para el menú: patita vista desde abajo con sus colores.
export function muestraPata(id, lado = 96) {
  const c = lienzo(lado, lado), g = c.getContext('2d');
  const p = PATAS.find((x) => x.id === id) || PATAS[0];
  const s = lado / 96;
  g.scale(s, s);
  g.fillStyle = hex(p.pelo);
  g.beginPath(); g.arc(48, 58, 30, 0, 7); g.fill();
  g.save(); g.clip();
  g.strokeStyle = hex(p.raya); g.lineWidth = 6;
  p.rayas.forEach((k) => { g.beginPath(); g.arc(48, 120 - k * 9, 46, Math.PI * 1.25, Math.PI * 1.75); g.stroke(); });
  g.restore();
  if (p.brillo) { g.shadowColor = hex(p.rosa); g.shadowBlur = 10; }
  g.fillStyle = hex(p.rosa);
  g.beginPath(); g.ellipse(48, 64, 14, 11, 0, 0, 7); g.fill();
  for (let k = 0; k < 4; k++) {
    const x = 22 + k * 17.3, y = 30 - (k === 1 || k === 2 ? 6 : 0);
    g.shadowBlur = 0; g.fillStyle = hex(p.pelo); g.beginPath(); g.arc(x, y, 11, 0, 7); g.fill();
    if (p.brillo) g.shadowBlur = 10;
    g.fillStyle = hex(p.rosa); g.beginPath(); g.arc(x, y + 2, 5, 0, 7); g.fill();
  }
  return c;
}

const CLAVE = 'senku_vr_garras';
export function leerEleccion() {
  const def = { cuerda: 'normal', pata: 'senku', comodo: true };
  try { return { ...def, ...JSON.parse(localStorage.getItem(CLAVE) || '{}') }; } catch { return def; }
}
export function guardarEleccion(e) {
  try { localStorage.setItem(CLAVE, JSON.stringify(e)); } catch { /* sin almacenamiento */ }
}
