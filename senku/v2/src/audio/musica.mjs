// Música chiptune de Senku 2 generada con Web Audio (sin archivos). Una pieza por zona,
// en bucle, con melodía, bajo y percusión. El programador agenda notas por adelantado con el
// reloj del audio, así suena parejo aunque la pantalla vaya lenta.

const NOTAS = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

export function frecuencia(nota) {
  if (!nota || nota === '-') return 0;
  const m = /^([A-G]#?)(\d)$/.exec(nota);
  if (!m) throw new Error(`Nota inválida: ${nota}`);
  const midi = 12 * (Number(m[2]) + 1) + NOTAS[m[1]];
  return 440 * 2 ** ((midi - 69) / 12);
}

// Cada pieza: tempo (negras por minuto), melodía y bajo como [nota, tiempos], percusión por tiempo.
// '-' es silencio. Melodía y bajo deben durar lo mismo para que el bucle cuadre.
const m = (txt) => txt.trim().split(/\s+/).map((t) => { const [n, d] = t.split(':'); return [n, Number(d)]; });

export const PIEZAS = {
  // Fiesta de barrio: vals ranchero alegre en Do mayor.
  fiesta: {
    tempo: 168, onda: 'square', ondaBajo: 'triangle', compas: 3,
    melodia: m(`G4:1 C5:1 E5:1 G5:2 E5:1 F5:1 E5:1 D5:1 C5:3
                A4:1 C5:1 F5:1 A5:2 F5:1 G5:1 F5:1 E5:1 D5:3
                G4:1 B4:1 D5:1 G5:2 F5:1 E5:1 D5:1 E5:1 F5:3
                E5:1 D5:1 C5:1 B4:1 D5:1 G4:1 C5:3 -:3`),
    bajo: m(`C3:1 G3:1 G3:1 C3:1 G3:1 G3:1 C3:1 G3:1 G3:1 C3:1 G3:1 G3:1
             F3:1 C4:1 C4:1 F3:1 C4:1 C4:1 G3:1 D4:1 D4:1 G3:1 D4:1 D4:1
             G3:1 D4:1 D4:1 G3:1 D4:1 D4:1 C3:1 G3:1 G3:1 F3:1 C4:1 C4:1
             G3:1 D4:1 D4:1 G3:1 B3:1 D4:1 C3:1 G3:1 G3:1 C3:1 G3:1 G3:1`),
    percusion: [1, 0.4, 0.4],
  },
  // Parque y desierto: paseo tranquilo en La menor, aire de guitarra.
  desierto: {
    tempo: 120, onda: 'triangle', ondaBajo: 'triangle', compas: 4,
    melodia: m(`A4:1 C5:1 E5:2 D5:1 C5:1 B4:2 A4:1 B4:1 C5:1 E5:1 D5:4
                F5:1 E5:1 D5:2 C5:1 B4:1 A4:2 G#4:1 A4:1 B4:1 E4:1 A4:4`),
    bajo: m(`A2:2 E3:2 A2:2 E3:2 G2:2 D3:2 G2:2 D3:2
             F2:2 C3:2 F2:2 C3:2 E2:2 B2:2 A2:2 E3:2`),
    percusion: [0.8, 0, 0.4, 0],
  },
  // Despeñadero: aventura en Re menor, más ágil.
  aventura: {
    tempo: 144, onda: 'square', ondaBajo: 'square', compas: 4,
    melodia: m(`D5:1 F5:1 A5:1 F5:1 G5:1 E5:1 C5:2 D5:1 F5:1 A5:1 C6:1 A5:2 G5:2
                A#4:1 D5:1 F5:1 D5:1 C5:1 E5:1 G5:2 A5:1 G5:1 F5:1 E5:1 D5:4`),
    bajo: m(`D3:1 D3:1 A2:1 D3:1 C3:1 C3:1 G2:1 C3:1 D3:1 D3:1 A2:1 D3:1 C3:1 C3:1 G2:1 C3:1
             A#2:1 A#2:1 F2:1 A#2:1 C3:1 C3:1 G2:1 C3:1 A2:1 A2:1 E2:1 A2:1 D3:1 D3:1 A2:1 D3:1`),
    percusion: [1, 0.5, 0.8, 0.5],
  },
  // Cima y jefe: tensión en Mi menor, bajo insistente.
  jefe: {
    tempo: 172, onda: 'sawtooth', ondaBajo: 'square', compas: 4,
    melodia: m(`E5:1 E5:1 G5:1 E5:1 F#5:1 E5:1 D5:1 B4:1 E5:1 E5:1 G5:1 B5:1 A5:2 F#5:2
                C5:1 C5:1 E5:1 C5:1 D5:1 C5:1 B4:1 G4:1 B4:1 C5:1 D#5:1 F#5:1 E5:4`),
    bajo: m(`E2:1 E3:1 E2:1 E3:1 E2:1 E3:1 E2:1 E3:1 E2:1 E3:1 E2:1 E3:1 D2:1 D3:1 D2:1 D3:1
             C2:1 C3:1 C2:1 C3:1 C2:1 C3:1 C2:1 C3:1 B1:1 B2:1 B1:1 B2:1 E2:1 E3:1 E2:1 E3:1`),
    percusion: [1, 0.6, 1, 0.6],
  },
};

export const PIEZA_POR_ESCENA = {
  ciudad: 'fiesta', taqueria: 'fiesta', reja: 'desierto', desierto: 'desierto',
  despenadero: 'aventura', cima: 'aventura',
};

export function duracionEnTiempos(voz) {
  return voz.reduce((total, [, d]) => total + d, 0);
}

export function crearMusica(ventana = typeof window !== 'undefined' ? window : null) {
  let ctx = null;
  let maestro = null;
  let actual = null;
  let temporizador = null;
  let siguiente = { melodia: 0, bajo: 0, tiempo: 0 };
  let inicio = 0;
  let activa = true;
  try { activa = ventana?.localStorage?.getItem('senku2_musica') !== '0'; } catch { /* sin almacenamiento */ }

  function contexto() {
    if (ctx) return ctx;
    const AudioCtx = ventana?.AudioContext || ventana?.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = ventana._senkuAudioCtx || (ventana._senkuAudioCtx = new AudioCtx());
    maestro = ctx.createGain();
    maestro.gain.value = 0.05;
    maestro.connect(ctx.destination);
    return ctx;
  }

  function nota(frec, t, dur, onda, volumen) {
    if (!frec) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = onda;
    osc.frequency.setValueAtTime(frec, t);
    g.gain.setValueAtTime(volumen, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + Math.max(0.06, dur * 0.92));
    osc.connect(g).connect(maestro);
    osc.start(t);
    osc.stop(t + dur);
  }

  function golpe(t, fuerza) {
    if (!fuerza) return;
    const largo = Math.floor(ctx.sampleRate * 0.05);
    const buf = ctx.createBuffer(1, largo, ctx.sampleRate);
    const datos = buf.getChannelData(0);
    for (let i = 0; i < largo; i++) datos[i] = (Math.random() * 2 - 1) * (1 - i / largo);
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    src.buffer = buf;
    g.gain.value = 0.35 * fuerza;
    src.connect(g).connect(maestro);
    src.start(t);
  }

  // Agenda lo que cae en los próximos 0.3 s; se llama cada 80 ms.
  function agendar() {
    if (!actual || !ctx) return;
    const pieza = PIEZAS[actual];
    const seg = 60 / pieza.tempo;
    const limite = ctx.currentTime + 0.3;
    for (const voz of ['melodia', 'bajo']) {
      const lista = pieza[voz];
      let s = siguiente[voz];
      while (inicio + s.t * seg < limite) {
        const [n, d] = lista[s.i];
        const t = inicio + s.t * seg;
        if (voz === 'melodia') nota(frecuencia(n), t, d * seg, pieza.onda, 0.55);
        else nota(frecuencia(n), t, d * seg, pieza.ondaBajo, 0.7);
        s = { i: (s.i + 1) % lista.length, t: s.t + d };
      }
      siguiente[voz] = s;
    }
    while (inicio + siguiente.tiempo * seg < limite) {
      const k = siguiente.tiempo % pieza.compas;
      golpe(inicio + siguiente.tiempo * seg, pieza.percusion[k] || 0);
      siguiente.tiempo += 1;
    }
  }

  function tocar(nombre) {
    if (!PIEZAS[nombre] || nombre === actual) return;
    actual = nombre;
    if (!activa || !contexto()) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    inicio = ctx.currentTime + 0.1;
    siguiente = { melodia: { i: 0, t: 0 }, bajo: { i: 0, t: 0 }, tiempo: 0 };
    if (!temporizador) temporizador = ventana.setInterval(agendar, 80);
  }

  function detener() {
    if (temporizador) ventana.clearInterval(temporizador);
    temporizador = null;
  }

  // Pestaña oculta: congela el reloj de audio (las notas agendadas se reanudan donde iban).
  function pausar() {
    if (ctx && ctx.state === 'running') ctx.suspend?.().catch?.(() => {});
  }

  function reanudar() {
    if (ctx && activa && actual && ctx.state === 'suspended') ctx.resume?.().catch?.(() => {});
  }

  function alternar() {
    activa = !activa;
    try { ventana?.localStorage?.setItem('senku2_musica', activa ? '1' : '0'); } catch { /* sin almacenamiento */ }
    const pieza = actual;
    actual = null;
    detener();
    if (activa && pieza) tocar(pieza);
    return activa;
  }

  return { tocar, detener, alternar, pausar, reanudar, get activa() { return activa; }, get actual() { return actual; } };
}
