// Pantalla final del capítulo México: se muestra al vencer al Gato Mecánico.
// Construye su propio DOM (no depende de index.html) y suena una fanfarria corta.

function fanfarria(ventana) {
  try {
    const AudioCtx = ventana?.AudioContext || ventana?.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = ventana._senkuAudioCtx || (ventana._senkuAudioCtx = new AudioCtx());
    const notas = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    notas.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      const t = ctx.currentTime + i * 0.14;
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (i === notas.length - 1 ? 0.6 : 0.13));
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.7);
    });
  } catch {
    // Sin audio no pasa nada.
  }
}

export function mostrarFinal(documento, ventana, resumen, { alVolverAJugar, alSeguir } = {}) {
  if (!documento?.body || documento.getElementById('final-capitulo')) return null;
  const capa = documento.createElement('div');
  capa.id = 'final-capitulo';
  capa.setAttribute('role', 'dialog');
  capa.setAttribute('aria-label', 'Fin del capítulo México');
  capa.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:9999', 'display:flex', 'align-items:center', 'justify-content:center',
    'background:radial-gradient(circle at 50% 35%, rgba(255,200,90,.35), rgba(20,10,30,.92) 70%)',
    'font-family:system-ui,sans-serif', 'color:#fff', 'padding:16px', 'box-sizing:border-box',
    'animation:finAparecer .6s ease-out',
  ].join(';');
  const fila = (icono, texto, valor) => `<div style="display:flex;justify-content:space-between;gap:24px;
    padding:8px 0;border-bottom:1px solid rgba(255,255,255,.15)"><span>${icono} ${texto}</span><b>${valor}</b></div>`;
  capa.innerHTML = `
    <style>@keyframes finAparecer{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}
      #final-capitulo button{font:inherit;font-weight:700;border:0;border-radius:999px;padding:12px 20px;cursor:pointer}</style>
    <div style="max-width:520px;width:100%;background:rgba(30,18,40,.85);border:3px solid #f2c14e;
      border-radius:18px;padding:22px 24px;box-shadow:0 10px 40px rgba(0,0,0,.5);text-align:center">
      <div style="font-size:clamp(14px,3.2vw,16px);letter-spacing:.12em;color:#f2c14e">CAPÍTULO 1 · MÉXICO</div>
      <h2 style="margin:8px 0 4px;font-size:clamp(24px,6vw,34px)">¡Senku venció al Gato Mecánico!</h2>
      <p style="margin:0 0 14px;opacity:.85">La montaña está a salvo. Fin del capítulo.</p>
      <div style="text-align:left;font-size:clamp(15px,3.6vw,18px)">
        ${fila('🍬', 'Churus', resumen.churus)}
        ${fila('🐭', 'Enemigos vencidos', resumen.enemigos)}
        ${fila('✨', 'Secretos encontrados', `${resumen.secretosEncontrados} / ${resumen.secretosTotales}`)}
      </div>
      <p style="margin:14px 0 16px;font-size:13px;opacity:.75">Idea y dirección: Matías y Javier · Senku es el gato de la casa</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button id="final-seguir" style="background:#f2c14e;color:#2a1a08">Seguir explorando</button>
        <button id="final-volver" style="background:#ffffff22;color:#fff">Jugar desde el principio</button>
      </div>
    </div>`;
  documento.body.appendChild(capa);
  const cerrar = () => capa.remove();
  capa.querySelector('#final-seguir')?.addEventListener('click', () => { cerrar(); alSeguir?.(); });
  capa.querySelector('#final-volver')?.addEventListener('click', () => { cerrar(); alVolverAJugar?.(); });
  fanfarria(ventana);
  return capa;
}
