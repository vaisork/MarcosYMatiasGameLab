// Sonidos sintetizados con Web Audio (sin archivos). Se activa tras un gesto.
let ctx, ruido, viento, vientoFiltro;

export function iniciarSonido() {
  if (ctx) { ctx.resume(); return; }
  try { ctx = new AudioContext(); } catch { return; }
  ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = ruido.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = ruido; src.loop = true;
  vientoFiltro = ctx.createBiquadFilter(); vientoFiltro.type = 'lowpass'; vientoFiltro.frequency.value = 300;
  viento = ctx.createGain(); viento.gain.value = 0;
  src.connect(vientoFiltro).connect(viento).connect(ctx.destination);
  src.start();
}

function tono(tipo, f0, f1, dur, vol = 0.2, retraso = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + retraso;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t); o.stop(t + dur);
}

function soplo(f0, f1, dur, vol = 0.25) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = ruido;
  f.type = 'bandpass'; f.Q.value = 2;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f).connect(g).connect(ctx.destination);
  s.start(t, Math.random() * 0.5, dur);
}

// Cada estilo de cuerda suena distinto (todo sintetizado, barato).
const LANZAR = {
  normal: () => soplo(800, 4000, 0.15),
  telarana: () => soplo(2500, 7000, 0.12, 0.3),
  cadena: () => [0, 0.04, 0.08].forEach((r) => tono('square', 2400, 1900, 0.03, 0.05, r)),
  estambre: () => tono('sine', 300, 750, 0.18, 0.2),
  laser: () => tono('sawtooth', 1900, 380, 0.18, 0.08),
};
const ENGANCHAR = {
  normal: () => { tono('triangle', 900, 260, 0.12, 0.3); soplo(300, 120, 0.08, 0.3); },
  telarana: () => soplo(1800, 600, 0.1, 0.35),
  cadena: () => { tono('square', 1300, 1250, 0.06, 0.08); tono('triangle', 600, 300, 0.1, 0.2); },
  estambre: () => tono('sine', 500, 900, 0.1, 0.25),
  laser: () => { tono('sine', 1500, 1500, 0.08, 0.12); tono('square', 400, 200, 0.12, 0.05); },
};

export const sonar = {
  lanzar: (estilo) => (LANZAR[estilo] || LANZAR.normal)(),
  enganchar: (estilo) => (ENGANCHAR[estilo] || ENGANCHAR.normal)(),
  impulso: () => soplo(350, 1400, 0.22, 0.2),
  fallo: () => tono('sine', 300, 150, 0.15, 0.1),
  tiron: () => { tono('sawtooth', 180, 700, 0.2, 0.12); soplo(500, 2500, 0.25, 0.3); },
  churu: () => [880, 1175, 1568].forEach((f, i) => tono('sine', f, f * 1.01, 0.18, 0.22, i * 0.07)),
  record: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tono('square', f, f, 0.16, 0.08, i * 0.13)),
  zarpazo: () => { soplo(1200, 300, 0.12, 0.35); tono('square', 1800, 2400, 0.05, 0.06); },
  chillido: () => tono('sawtooth', 2200, 3200, 0.12, 0.06),
  poof: () => { soplo(600, 150, 0.3, 0.35); [660, 880, 1320].forEach((f, i) => tono('triangle', f, f * 1.2, 0.12, 0.12, i * 0.05)); },
  dano: () => { tono('square', 220, 110, 0.25, 0.12); soplo(200, 80, 0.2, 0.2); },
  agarrar: () => soplo(400, 900, 0.08, 0.2),
  // Superpoder (Ultra Gato): campanita de «listo» y el «¡boing-zzz!» al disparar.
  listo: () => [784, 988, 1175, 1568].forEach((f, i) => tono('triangle', f, f * 1.02, 0.22, 0.18, i * 0.08)),
  boing: () => { tono('sine', 160, 640, 0.22, 0.35); tono('sine', 640, 220, 0.18, 0.2, 0.2); tono('sawtooth', 95, 120, 0.45, 0.07, 0.2); soplo(2500, 5000, 0.4, 0.12); },
  viento(rapidez) {
    if (!ctx) return;
    const k = Math.min(1, Math.max(0, (rapidez - 3) / 30));
    viento.gain.setTargetAtTime(k * 0.3, ctx.currentTime, 0.1);
    vientoFiltro.frequency.setTargetAtTime(250 + k * 1600, ctx.currentTime, 0.1);
  },
};
