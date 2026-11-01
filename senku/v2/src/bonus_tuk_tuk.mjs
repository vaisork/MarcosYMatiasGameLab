import { ganarChurus } from './core/economia.mjs';
import { CLAVE, guardar, normalizar } from './core/store.mjs';

export const DURACION = 30;
export const CUENTA_REGRESIVA = 3;
export const TOPE_CHURUS = 30;
export const VIDAS_BONUS = 3;
export const ID_PREMIO = 'bonus-tuk-tuk-guatemala';
export const TIPOS_OBSTACULO = ['maceta', 'cable', 'tucan'];

export function crearPartida() {
  return { fase: 'cuenta', cuenta: CUENTA_REGRESIVA, restante: DURACION,
    churus: 0, vidas: VIDAS_BONUS, tiempoMundo: 0, distancia: 0,
    camionetaX: 0.08, senku: { pos: 0.5, alto: 0, vy: 0, mira: 1 },
    invulnerable: 0, sacudida: 0, destello: 0,
    objetos: [], particulas: [], siguienteObjeto: 0 };
}

// Medidas en pantalla: el tuk-tuk avanza hacia delante y Senku salta desde el techo.
export function geometria(W, H, camionetaX = 0.1) {
  const portrait = H > W * 1.25, ground = H * (portrait ? .64 : .72);
  const carW = Math.min(W * (portrait ? .62 : .46), portrait ? 300 : 420), carH = carW * .5;
  const carX = camionetaX * W, techo = ground - carH * .8, gato = carW * .24;
  // pos 0..1 recorre desde la caja hasta el techo de la cabina (el arte va espejado: cabina a la derecha).
  const xSenku = (pos) => carX + carW * (.1 + pos * .58);
  return { portrait, ground, carX, carW, carH, techo, gato, xSenku };
}

// Un paso de juego: mover/saltar a Senku y resolver Churus, macetas, cables y tucanes.
export function avanzarJuego(partida, entrada, dt, W, H) {
  const g = geometria(W, H, partida.camionetaX), s = partida.senku;
  const dir = (entrada.derecha ? 1 : 0) - (entrada.izquierda ? 1 : 0);
  if (dir) s.mira = dir;
  s.pos = Math.max(0, Math.min(1, s.pos + dir * dt * .9));
  const impulso = H * 1.25, gravedad = H * 3.2;
  if (entrada.salto && s.alto <= 0) s.vy = impulso;
  if (s.alto > 0 || s.vy > 0) {
    s.alto += s.vy * dt; s.vy -= gravedad * dt;
    if (s.alto <= 0) { s.alto = 0; s.vy = 0; }
  }
  partida.tiempoMundo += dt; partida.distancia += dt * 250;
  if (partida.tiempoMundo >= partida.siguienteObjeto) {
    const n = Math.floor(partida.tiempoMundo / .58) % 16;
    const obstaculo = partida.tiempoMundo > 1.8 && n % 4 === 2;
    const tipo = TIPOS_OBSTACULO[Math.floor(n / 4) % TIPOS_OBSTACULO.length];
    partida.objetos.push(obstaculo
      ? { tipo, x: W + 60, altura: H * .04, fase: n, golpeado: false }
      : { tipo: 'churu', x: W + 40, altura: H * [0, .05, .14, .22, .1, .02][n % 6], recogido: false });
    partida.siguienteObjeto = partida.tiempoMundo + .6;
  }
  const px = g.xSenku(s.pos), py = s.alto + g.gato * .35;
  for (const o of partida.objetos) {
    if (o.recogido) continue;
    o.x -= dt * W * (o.tipo === 'tucan' ? .62 : .48);
    // Tucán golpeado: vuela en línea ascendente hacia atrás y sale de pantalla.
    if (o.golpeado) { o.x += dt * W * .55; o.altura += dt * H * .9; continue; }
    const altura = o.altura;
    if (Math.abs(o.x - px) > g.gato * .45 || Math.abs(altura + 14 - py) > g.gato * .55) continue;
    if (o.tipo === 'churu') {
      o.recogido = true;
      if (partida.churus < TOPE_CHURUS) { partida.churus++; partida.destello = .22; emitirParticulas(partida, o.x, g.techo - altura - 14, '#ffe16a'); partida.ultimoSonido = 'churu'; }
    } else if (partida.invulnerable <= 0) {
      if (o.tipo === 'tucan') o.golpeado = true;
      else o.recogido = true;
      partida.churus = Math.max(0, partida.churus - 1);
      partida.vidas = Math.max(0, partida.vidas - 1);
      partida.invulnerable = 1; partida.sacudida = .25; partida.ultimoSonido = 'golpe';
      emitirParticulas(partida, px, g.techo - py, '#3a2f4a', 7);
    }
  }
  partida.objetos = partida.objetos.filter((o) => !o.recogido && o.x > -60 && o.x < W + 120 && o.altura < H);
  for (const p of partida.particulas) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 140 * dt; p.vida -= dt; }
  partida.particulas = partida.particulas.filter((p) => p.vida > 0);
  partida.invulnerable = Math.max(0, partida.invulnerable - dt); partida.sacudida = Math.max(0, partida.sacudida - dt);
  partida.destello = Math.max(0, partida.destello - dt);
  return partida;
}

function emitirParticulas(partida, x, y, color, cantidad = 9) {
  for (let i = 0; i < cantidad; i++) {
    const angulo = Math.PI * 2 * i / cantidad;
    const rapidez = 45 + (i % 3) * 24;
    partida.particulas.push({ x, y, vx: Math.cos(angulo) * rapidez, vy: Math.sin(angulo) * rapidez - 35, vida: .5, color, radio: 2 + i % 3 });
  }
}

export function avanzarReloj(partida, dt) {
  let tiempo = Number.isFinite(dt) ? Math.max(0, dt) : 0;
  const nueva = { ...partida };
  if (nueva.fase === 'cuenta') {
    const falta = nueva.cuenta - tiempo;
    if (falta > 0) nueva.cuenta = falta;
    else { nueva.fase = 'jugando'; nueva.cuenta = 0; tiempo = -falta; }
  }
  if (nueva.fase === 'jugando') {
    nueva.restante = Math.max(0, nueva.restante - tiempo);
    // Termina al acabarse el tiempo, al juntar el tope de churus o al perder los 3 corazones.
    if (nueva.restante === 0 || nueva.churus >= TOPE_CHURUS || nueva.vidas <= 0) nueva.fase = 'fin';
  }
  return nueva;
}

export function finalizarPartida(almacen, partida) {
  if (!almacen || !partida || partida.fase !== 'fin') return { guardado: false, estado: null };
  let estado;
  try { estado = normalizar(JSON.parse(almacen.getItem(CLAVE))); } catch { return { guardado: false, estado: null }; }
  if (!estado) return { guardado: false, estado };
  // Bonus repetido (p. ej. «Jugar desde el principio»): sin premio, pero sí avanza de escena; si no, el juego vuelve al inicio del bonus.
  if (estado.coleccionados.includes(ID_PREMIO)) {
    const sinPremio = { ...estado, progreso: { ...estado.progreso, escena: 'guatemala-chichicastenango' } };
    return { guardado: guardar(almacen, sinPremio), estado: sinPremio, repetido: true };
  }
  const cantidad = Math.min(TOPE_CHURUS, Math.max(0, Math.floor(partida.churus)));
  const premio = ganarChurus(estado, cantidad, ID_PREMIO);
  if (premio.error) return { guardado: false, estado };
  const actualizado = { ...premio, progreso: { ...premio.progreso, escena: 'guatemala-chichicastenango' } };
  return { guardado: guardar(almacen, actualizado), estado: actualizado };
}

export function iniciarBonus(documento = document, ventana = window) {
  const canvas = documento.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return { iniciado: false };
  const cargarImagen = (ruta) => {
    if (typeof ventana.Image !== 'function') return null;
    const img = new ventana.Image(); img.src = new URL(ruta, import.meta.url).href; return img;
  };
  const tukTukPintado = cargarImagen('../assets/bonus/tuk-tuk-antigua.webp');
  const spriteSenku = cargarImagen('../assets/personajes/sprite_original.png');
  const churuPintado = cargarImagen('../assets/objetos/churu.png');
  const partida = crearPartida();
  const teclas = new Set();
  const controles = { izquierda: false, derecha: false, salto: false };
  const almacen = (() => { try { return ventana.localStorage; } catch { return null; } })();
  let ultimo = 0;
  let raf = 0;
  let silencio = false;
  let audio = null;
  const sonido = (frecuencia, duracion = .09) => {
    if (silencio) return;
    try {
      audio ||= new (ventana.AudioContext || ventana.webkitAudioContext)();
      const oscilador = audio.createOscillator(), volumen = audio.createGain();
      oscilador.frequency.value = frecuencia;
      volumen.gain.setValueAtTime(.07, audio.currentTime);
      volumen.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duracion);
      oscilador.connect(volumen); volumen.connect(audio.destination);
      oscilador.start(); oscilador.stop(audio.currentTime + duracion);
    } catch { /* audio opcional */ }
  };
  const botones = [...documento.querySelectorAll('[data-control]')];
  for (const boton of botones) {
    const accion = boton.dataset.control;
    const down = (evento) => { evento.preventDefault(); controles[accion] = true; boton.setPointerCapture?.(evento.pointerId); };
    const up = () => { controles[accion] = false; };
    boton.addEventListener('pointerdown', down);
    for (const tipo of ['pointerup', 'pointercancel', 'lostpointercapture']) boton.addEventListener(tipo, up);
  }
  const onKeyDown = (e) => { teclas.add(e.code); if (['ArrowLeft','ArrowRight','ArrowUp','Space','KeyA','KeyD','KeyW'].includes(e.code)) e.preventDefault(); };
  const onKeyUp = (e) => teclas.delete(e.code);
  ventana.addEventListener('keydown', onKeyDown); ventana.addEventListener('keyup', onKeyUp);
  ventana.addEventListener('blur', () => { teclas.clear(); for (const k of Object.keys(controles)) controles[k] = false; });
  documento.querySelector('#sonido')?.addEventListener('click', (e) => { silencio = !silencio; e.currentTarget.textContent = silencio ? 'Sonido apagado' : 'Sonido'; });
  const velo = documento.querySelector('#velo');
  const textoCuenta = documento.createElement('strong');
  const consejo = documento.createElement('span'); consejo.textContent = '¡A juntar churus! Salta sobre el tuk-tuk y esquiva macetas, cables y tucanes.';
  const tituloFinal = documento.createElement('strong'); tituloFinal.textContent = '¡Buen viaje, Senku!'; tituloFinal.hidden = true;
  const premioFinal = documento.createElement('span'); premioFinal.hidden = true;
  const continuar = documento.createElement('button'); continuar.type = 'button'; continuar.textContent = 'Seguir a Chichicastenango'; continuar.hidden = true;
  continuar.addEventListener('click', () => { ventana.location.href = './index.html?cinematica=familia'; });
  velo.replaceChildren(textoCuenta, consejo, tituloFinal, premioFinal, continuar);

  const w = () => canvas.clientWidth || ventana.innerWidth;
  const h = () => canvas.clientHeight || ventana.innerHeight;
  function redimensionar() {
    const dpr = Math.min(2, ventana.devicePixelRatio || 1);
    canvas.width = Math.round(w() * dpr); canvas.height = Math.round(h() * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  ventana.addEventListener('resize', redimensionar); redimensionar();

  function dibujar(t) {
    const W = w(), H = h(), portrait = H > W * 1.25, ground = H * (portrait ? .64 : .72);
    const grad = ctx.createLinearGradient(0, 0, 0, ground);
    grad.addColorStop(0, '#f6bb76'); grad.addColorStop(.55, '#f2a65f'); grad.addColorStop(1, '#c66c45');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    // Antigua pasa de derecha a izquierda para que el tuk-tuk que mira a la derecha avance.
    const desplazamiento = partida.distancia * .12;
    ctx.fillStyle = '#efbd91'; ctx.fillRect(0, 0, W, ground);
    for (let x = -(desplazamiento * .22 % 240); x < W + 240; x += 240) {
      const base = ground * .68;
      ctx.fillStyle = '#d98262'; ctx.fillRect(x, base, 184, ground - base);
      ctx.fillStyle = '#a94d48'; ctx.fillRect(x + 10, base - 48, 164, 52);
      ctx.fillStyle = '#70485a'; ctx.fillRect(x + 26, base - 26, 28, 46); ctx.fillRect(x + 78, base - 26, 28, 46);
      ctx.fillStyle = '#efc08a'; ctx.fillRect(x + 31, base - 22, 18, 33); ctx.fillRect(x + 83, base - 22, 18, 33);
    }
    ctx.fillStyle = '#76594e'; ctx.fillRect(0, ground, W, H - ground);
    ctx.save(); ctx.strokeStyle = '#b99679'; ctx.lineWidth = 2;
    for (let y = ground + 12; y < H; y += 24) {
      const offset = ((Math.floor((y - ground) / 24) % 2) * 18) - (partida.distancia * .35 % 36);
      for (let x = offset; x < W; x += 36) { ctx.strokeRect(x, y, 34, 21); }
    }
    ctx.restore();
    const g = geometria(W, H, partida.camionetaX), sk = partida.senku;
    const vaiven = Math.sin(t * 18) * 1.5;
    ctx.fillStyle = '#382d2a55'; ctx.beginPath(); ctx.ellipse(g.carX + g.carW * .5, ground + 4, g.carW * .52, 8, 0, 0, Math.PI * 2); ctx.fill();
    if (tukTukPintado?.complete && tukTukPintado.naturalWidth) {
      ctx.drawImage(tukTukPintado, g.carX, ground - g.carH + vaiven, g.carW, g.carH);
    } else {
      ctx.fillStyle = '#d8b98a'; ctx.fillRect(g.carX, ground - g.carH * .8 + vaiven, g.carW, g.carH * .6);
    }
    if (partida.fase === 'jugando' && Math.floor(t * 16) % 2 === 0) {
      ctx.fillStyle = '#e8c19399'; ctx.beginPath(); ctx.ellipse(g.carX - 6, ground + 2, 12 + Math.random() * 13, 5, 0, 0, Math.PI * 2); ctx.fill();
    }
    for (const o of partida.objetos) {
      if (o.x < -50 || o.recogido) continue;
      if (o.tipo === 'churu') {
        const y = g.techo - o.altura - 14 + Math.sin(t * 4 + o.x * .02) * 3;
        if (churuPintado?.complete && churuPintado.naturalWidth) ctx.drawImage(churuPintado, o.x - 14, y - 18, 28, 36);
        else { ctx.fillStyle = '#ffdf63'; ctx.beginPath(); ctx.ellipse(o.x, y, 10, 17, -.2, 0, Math.PI * 2); ctx.fill(); }
      } else if (o.tipo === 'tucan') {
        const y = g.techo - o.altura - 14;
        const aleteo = Math.sin(t * 19 + o.fase) * 8;
        ctx.save(); ctx.translate(o.x, y); ctx.fillStyle = '#181b28';
        ctx.beginPath(); ctx.ellipse(0, 0, 18, 11, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-14, -10, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e6b643'; ctx.beginPath(); ctx.moveTo(-21, -11); ctx.lineTo(-43, -7); ctx.lineTo(-21, -3); ctx.fill();
        ctx.fillStyle = '#315d48'; ctx.beginPath(); ctx.ellipse(2, -12, 7, 15 + aleteo, -.35, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (o.tipo === 'maceta') {
        const y = g.techo - o.altura - 14;
        ctx.fillStyle = '#b45b40'; ctx.beginPath(); ctx.moveTo(o.x - 17, y - 12); ctx.lineTo(o.x + 17, y - 12); ctx.lineTo(o.x + 11, y + 10); ctx.lineTo(o.x - 11, y + 10); ctx.fill();
        for (const [dx, dy] of [[-8,-20],[0,-27],[8,-18],[2,-16]]) { ctx.fillStyle = '#e94f8a'; ctx.beginPath(); ctx.arc(o.x + dx, y + dy, 5, 0, Math.PI * 2); ctx.fill(); }
      } else {
        const y = g.techo - o.altura - 14;
        ctx.strokeStyle = '#272c39'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(o.x - 24, y); ctx.lineTo(o.x + 24, y + 2); ctx.stroke();
      }
    }
    if (partida.destello > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, partida.destello * 5); ctx.strokeStyle = '#fff4a4'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(g.xSenku(sk.pos), g.techo - sk.alto - g.gato * .4, g.gato * (.5 + (.22 - partida.destello) * 2), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    for (const p of partida.particulas) {
      ctx.globalAlpha = Math.max(0, p.vida * 2);
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const flash = partida.invulnerable > 0 && Math.floor(t * 22) % 2 === 0;
    if (!flash) {
      const sx = g.xSenku(sk.pos), sy = g.techo - sk.alto + vaiven;
      if (spriteSenku?.complete && spriteSenku.naturalWidth === 768) {
        // Fila 0: reposo 0..3, salto 4, caída 5. Fila 1: carrera 8 cuadros.
        const moviendo = partida.fase === 'jugando' && sk.alto <= 0 && sk.ultimaDir;
        const [col, fila] = sk.alto > 0 ? [sk.vy > 0 ? 4 : 5, 0] : moviendo ? [Math.floor(t * 12) % 8, 1] : [Math.floor(t * 4) % 4, 0];
        ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(sx, 0); ctx.scale(sk.mira, 1);
        ctx.drawImage(spriteSenku, col * 96, fila * 96, 96, 96, -g.gato / 2, sy - g.gato * .92, g.gato, g.gato);
        ctx.restore();
      } else {
        ctx.fillStyle = '#e9e6e1'; ctx.beginPath(); ctx.arc(sx, sy - g.gato * .4, g.gato * .3, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function fotograma(timestamp) {
    if (!ultimo) ultimo = timestamp;
    const dt = Math.min(.05, (timestamp - ultimo) / 1000); ultimo = timestamp;
    if (partida.fase === 'jugando') {
      const izq = controles.izquierda || teclas.has('ArrowLeft') || teclas.has('KeyA');
      const der = controles.derecha || teclas.has('ArrowRight') || teclas.has('KeyD');
      const salto = controles.salto || teclas.has('ArrowUp') || teclas.has('Space') || teclas.has('KeyW');
      partida.senku.ultimaDir = der !== izq;
      avanzarJuego(partida, { izquierda: izq, derecha: der, salto }, dt, w(), h());
      if (partida.ultimoSonido === 'churu') sonido(880, .07);
      else if (partida.ultimoSonido === 'golpe') sonido(140, .16);
      partida.ultimoSonido = null;
    }
    const nueva = avanzarReloj(partida, dt); Object.assign(partida, nueva);
    if (partida.fase === 'fin' && !partida.premio) partida.premio = finalizarPartida(almacen, partida);
    const shake = partida.sacudida > 0 ? Math.random() * 12 - 6 : 0;
    ctx.save(); ctx.translate(shake, shake * .4); dibujar(timestamp / 1000); ctx.restore();
    documento.querySelector('#marcador').textContent = String(partida.churus).padStart(2, '0');
    const corazones = documento.querySelector('#corazones');
    if (corazones) corazones.textContent = '♥'.repeat(partida.vidas) + '♡'.repeat(VIDAS_BONUS - partida.vidas);
    documento.querySelector('#reloj').textContent = partida.fase === 'cuenta' ? String(Math.ceil(partida.cuenta)) : String(Math.ceil(partida.restante));
    documento.querySelector('#reloj').classList?.toggle('urgente', partida.fase === 'jugando' && partida.restante <= 10);
    if (partida.fase === 'cuenta') {
      velo.hidden = false; textoCuenta.hidden = false; textoCuenta.textContent = partida.cuenta > 0 ? String(Math.ceil(partida.cuenta)) : '¡YA!';
      consejo.hidden = false;
      tituloFinal.hidden = true; premioFinal.hidden = true; continuar.hidden = true;
    } else if (partida.fase === 'jugando') velo.hidden = true;
    else if (partida.fase === 'fin') {
      velo.hidden = false; textoCuenta.hidden = true; consejo.hidden = true; tituloFinal.hidden = false; premioFinal.hidden = false; continuar.hidden = false;
      tituloFinal.textContent = partida.vidas <= 0 ? '¡Ay, los tucanes!' : partida.churus >= TOPE_CHURUS ? '¡Tope de Churus!' : '¡Buen viaje, Senku!';
      premioFinal.textContent = `Ganaste ${partida.churus} Churus`;
    }
    raf = ventana.requestAnimationFrame(fotograma);
  }
  raf = ventana.requestAnimationFrame(fotograma);
  return { iniciado: true, partida, destruir() { ventana.cancelAnimationFrame(raf); ventana.removeEventListener('keydown', onKeyDown); ventana.removeEventListener('keyup', onKeyUp); } };
}
