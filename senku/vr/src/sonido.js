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

export const sonar = {
  lanzar: () => soplo(800, 4000, 0.15),
  enganchar: () => { tono('triangle', 900, 260, 0.12, 0.3); soplo(300, 120, 0.08, 0.3); },
  fallo: () => tono('sine', 300, 150, 0.15, 0.1),
  tiron: () => { tono('sawtooth', 180, 700, 0.2, 0.12); soplo(500, 2500, 0.25, 0.3); },
  churu: () => [880, 1175, 1568].forEach((f, i) => tono('sine', f, f * 1.01, 0.18, 0.22, i * 0.07)),
  record: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tono('square', f, f, 0.16, 0.08, i * 0.13)),
  viento(rapidez) {
    if (!ctx) return;
    const k = Math.min(1, Math.max(0, (rapidez - 3) / 30));
    viento.gain.setTargetAtTime(k * 0.3, ctx.currentTime, 0.1);
    vientoFiltro.frequency.setTargetAtTime(250 + k * 1600, ctx.currentTime, 0.1);
  },
};
