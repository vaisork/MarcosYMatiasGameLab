import { ganarChurus } from './core/economia.mjs';
import { CLAVE, VERSION, guardar, normalizar } from './core/store.mjs';

export const DURACION = 45;
export const CUENTA_REGRESIVA = 3;
export const TOPE_CHURUS = 30;
export const ID_PREMIO = 'bonus-camioneta-etapa-2';

export function crearPartida() {
  return { fase: 'cuenta', cuenta: CUENTA_REGRESIVA, restante: DURACION,
    churus: 0, combustible: 0, tiempoMundo: 0, distancia: 0,
    camionetaX: 0.23, salto: 0, invulnerable: 0, sacudida: 0, rebote: 0, destello: 0,
    objetos: [], particulas: [], siguienteObjeto: 0 };
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
    if (nueva.restante === 0) nueva.fase = 'fin';
  }
  return nueva;
}

export function finalizarPartida(almacen, partida) {
  if (!almacen || !partida || partida.fase !== 'fin') return { guardado: false, estado: null };
  let estado;
  try { estado = normalizar(JSON.parse(almacen.getItem(CLAVE))); } catch { return { guardado: false, estado: null }; }
  if (!estado || estado.coleccionados.includes(ID_PREMIO)) return { guardado: false, estado };
  const cantidad = Math.min(TOPE_CHURUS, Math.max(0, Math.floor(partida.churus)));
  const premio = ganarChurus(estado, cantidad, ID_PREMIO);
  if (premio.error) return { guardado: false, estado };
  const actualizado = { ...premio, progreso: { ...premio.progreso, escena: 'reja' } };
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
  const fondoLejano = cargarImagen('../assets/bonus/desierto-lejano.webp');
  const fondoCercano = cargarImagen('../assets/bonus/desierto-cercano.webp');
  const camionetaPintada = cargarImagen('../assets/bonus/camioneta-equipaje.webp');
  const spriteSenku = cargarImagen('../assets/personajes/sprite_original.png');
  const cactusPintado = cargarImagen('../assets/bonus/saguaro.webp');
  const piedrasPintadas = cargarImagen('../assets/bonus/piedras.webp');
  const partida = crearPartida();
  const teclas = new Set();
  const controles = { izquierda: false, derecha: false, salto: false };
  const almacen = (() => { try { return ventana.localStorage; } catch { return null; } })();
  const estadoGuardado = (() => { try { return normalizar(JSON.parse(almacen?.getItem(CLAVE) || 'null')); } catch { return null; } })();
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
  const consejo = documento.createElement('span'); consejo.textContent = '¡A juntar churus! Salta cactus y piedras.';
  const tituloFinal = documento.createElement('strong'); tituloFinal.textContent = '¡Buen viaje, Senku!'; tituloFinal.hidden = true;
  const premioFinal = documento.createElement('span'); premioFinal.hidden = true;
  const continuar = documento.createElement('button'); continuar.type = 'button'; continuar.textContent = 'Seguir al desierto'; continuar.hidden = true;
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
    const dibujarCapa = (img, velocidad, alpha) => {
      if (!img?.complete || !img.naturalWidth) return;
      const escala = Math.max(W / img.width, H / img.height);
      const ancho = img.width * escala, alto = img.height * escala;
      const desplazamiento = (partida.distancia * velocidad) % ancho;
      ctx.save(); ctx.globalAlpha = alpha;
      for (let x = -desplazamiento - ancho; x < W + ancho; x += ancho) ctx.drawImage(img, x, (H - alto) / 2, ancho, alto);
      ctx.restore();
    };
    dibujarCapa(fondoLejano, .018, 1);
    dibujarCapa(fondoCercano, .06, .82);
    ctx.strokeStyle = '#f4c77a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, ground + 1); ctx.lineTo(W, ground + 1); ctx.stroke();
    // Respaldo dibujado si el sprite pintado de la pickup aún no terminó de cargar.
    const carX = partida.camionetaX * W, jumpY = partida.salto > 0 ? Math.sin((1 - partida.salto) * Math.PI) * H * .16 : 0;
    const carW = Math.min(W * (portrait ? .43 : .36), portrait ? 210 : 260), carH = Math.min(H * (portrait ? .105 : .15), carW * .62);
    const carY = ground - carH - jumpY - (partida.rebote > 0 ? Math.sin((1 - partida.rebote) * Math.PI) * H * .025 : Math.sin(t * 18) * 2);
    if (!camionetaPintada?.complete || !camionetaPintada.naturalWidth) {
      ctx.fillStyle = '#382d2a'; ctx.beginPath(); ctx.ellipse(carX + carW * .48, ground + 4, carW * .55, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d85a38'; ctx.fillRect(carX, carY + carH * .42, carW, carH * .45);
      ctx.fillStyle = '#e98648'; ctx.beginPath(); ctx.moveTo(carX + carW * .14, carY + carH * .44); ctx.lineTo(carX + carW * .29, carY); ctx.lineTo(carX + carW * .48, carY); ctx.lineTo(carX + carW * .57, carY + carH * .44); ctx.fill();
      ctx.fillStyle = '#a9d3d0'; ctx.fillRect(carX + carW * .32, carY + 5, carW * .19, carH * .31);
      ctx.fillStyle = '#773f33'; ctx.fillRect(carX + carW * .59, carY + carH * .25, carW * .31, 5);
      ctx.fillStyle = '#aa6a3e'; ctx.fillRect(carX + carW * .88, carY + carH * .16, carW * .1, -carH * .55);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = ['#9a613e','#b67847','#855238'][i]; ctx.fillRect(carX + carW * (.62 + (i % 2) * .12), carY + carH * (.16 + Math.floor(i / 2) * .1), carW * .11, carH * .18); }
      for (const x of [carX + carW * .23, carX + carW * .78]) { ctx.fillStyle = '#292421'; ctx.beginPath(); ctx.arc(x, carY + carH * .88, carH * .18, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#cfaa7d'; ctx.beginPath(); ctx.arc(x, carY + carH * .88, carH * .08, 0, Math.PI * 2); ctx.fill(); }
    }
    if (camionetaPintada?.complete && camionetaPintada.naturalWidth) {
      const altoPintado = carW * 0.5;
      ctx.drawImage(camionetaPintada, carX, ground - altoPintado - jumpY, carW, altoPintado);
    }
    if (partida.fase === 'jugando' && Math.floor(t * 16) % 2 === 0) {
      ctx.fillStyle = '#e8c19399'; ctx.beginPath(); ctx.ellipse(carX + carW * .08, ground + 2, 12 + Math.random() * 13, 5, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (partida.destello > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, partida.destello * 5); ctx.strokeStyle = '#fff4a4'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(carX + carW * .52, ground - carH * .42, carW * (.12 + (.22 - partida.destello) * .9), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    for (const o of partida.objetos) {
      if (o.x < -40) continue;
      if (o.tipo === 'churu') {
        ctx.fillStyle = '#ffdf63'; ctx.beginPath(); ctx.ellipse(o.x, ground - 28 - o.altura, 10, 17, -.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#b85f3b'; ctx.fillRect(o.x - 6, ground - 13 - o.altura, 12, 3);
      } else if (o.tipo === 'combustible') {
        ctx.fillStyle = '#4e944d'; ctx.fillRect(o.x - 11, ground - 39, 22, 28); ctx.fillStyle = '#d5ed8a'; ctx.fillRect(o.x - 4, ground - 47, 9, 8);
      } else {
        ctx.fillStyle = o.tipo === 'cactus' ? '#3c7854' : '#61504a';
        if (o.tipo === 'bache') { ctx.beginPath(); ctx.ellipse(o.x, ground + 2, 26, 8, 0, 0, Math.PI * 2); ctx.fill(); }
        else if (o.tipo === 'cactus') {
          if (cactusPintado?.complete && cactusPintado.naturalWidth) ctx.drawImage(cactusPintado, o.x - 25, ground - 70, 50, 70);
          else { ctx.fillRect(o.x - 6, ground - 43, 12, 44); ctx.fillRect(o.x - 16, ground - 34, 11, 7); ctx.fillRect(o.x - 16, ground - 45, 6, 18); }
        } else if (piedrasPintadas?.complete && piedrasPintadas.naturalWidth) ctx.drawImage(piedrasPintadas, o.x - 22, ground - 27, 44, 28);
        else { ctx.beginPath(); ctx.ellipse(o.x, ground - 10, 22, 12, 0, Math.PI, Math.PI * 2); ctx.fill(); }
      }
    }
    for (const p of partida.particulas) {
      ctx.globalAlpha = Math.max(0, p.vida * 2);
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const flash = partida.invulnerable > 0 && Math.floor(t * 22) % 2 === 0;
    if (!flash) {
      const frame = Math.floor(t * 9) % 8, gatoW = carW * .19, gatoH = gatoW;
      if (spriteSenku?.complete && spriteSenku.naturalWidth === 768) {
        ctx.save(); ctx.imageSmoothingEnabled = false;
        ctx.drawImage(spriteSenku, frame * 96, 0, 96, 96, carX + carW * .34, ground - carW * .5 - gatoH * .72 - jumpY, gatoW, gatoH);
        ctx.restore();
      } else {
        ctx.fillStyle = '#f3c485'; ctx.beginPath(); ctx.arc(carX + carW * .42, carY + carH * .15, carW * .065, 0, Math.PI * 2); ctx.fill();
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
      const maxX = Math.max(.2, 1 - Math.min(w() * (h() > w() * 1.25 ? .43 : .36), h() > w() * 1.25 ? 210 : 260) / w() - .07);
      partida.camionetaX = Math.max(.08, Math.min(maxX, partida.camionetaX + (der - izq) * dt * .75));
      if (salto && partida.salto <= 0) partida.salto = 1;
      if (partida.salto > 0) partida.salto = Math.max(0, partida.salto - dt * 1.45);
      partida.tiempoMundo += dt; partida.distancia += dt * 250;
      if (partida.tiempoMundo >= partida.siguienteObjeto) {
        const n = Math.floor(partida.tiempoMundo / 1.05) % 10;
        partida.objetos.push({ tipo: n === 5 ? 'combustible' : (n === 2 || n === 7 ? ['cactus','piedra','bache'][Math.floor(partida.tiempoMundo * 3) % 3] : 'churu'), x: w() + 50, altura: n % 3 * 10, recogido: false });
        partida.siguienteObjeto = partida.tiempoMundo + .62;
      }
      for (const o of partida.objetos) {
        if (o.recogido) continue;
        o.x -= dt * w() * .8;
        const px = partida.camionetaX * w() + Math.min(w() * .36, 260) * .45;
        if (Math.abs(o.x - px) < Math.min(38, w() * .09)) {
          if (o.tipo === 'churu') { if (partida.churus < TOPE_CHURUS) { partida.churus++; partida.destello = .22; emitirParticulas(partida, o.x, h() * (h() > w() * 1.25 ? .64 : .72) - 28 - o.altura, '#ffe16a'); sonido(880, .07); } }
          else if (o.tipo === 'combustible') { partida.combustible = Math.min(5, partida.combustible + 1); partida.destello = .22; emitirParticulas(partida, o.x, h() * (h() > w() * 1.25 ? .64 : .72) - 36, '#b8e986', 7); sonido(540, .12); }
          else if (partida.salto < .2 && partida.invulnerable <= 0) { partida.sacudida = .28; partida.invulnerable = .65; partida.rebote = .42; sonido(115, .16); }
          o.recogido = true;
        }
      }
      partida.objetos = partida.objetos.filter((o) => !o.recogido && o.x > -40);
      for (const p of partida.particulas) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 140 * dt; p.vida -= dt; }
      partida.particulas = partida.particulas.filter((p) => p.vida > 0);
      partida.invulnerable = Math.max(0, partida.invulnerable - dt); partida.sacudida = Math.max(0, partida.sacudida - dt);
      partida.rebote = Math.max(0, partida.rebote - dt); partida.destello = Math.max(0, partida.destello - dt);
    }
    const nueva = avanzarReloj(partida, dt); Object.assign(partida, nueva);
    if (partida.fase === 'fin' && !partida.premio) partida.premio = finalizarPartida(almacen, partida);
    const shake = partida.sacudida > 0 ? Math.random() * 12 - 6 : 0;
    ctx.save(); ctx.translate(shake, shake * .4); dibujar(timestamp / 1000); ctx.restore();
    documento.querySelector('#marcador').textContent = String(partida.churus).padStart(2, '0');
    documento.querySelector('#reloj').textContent = partida.fase === 'cuenta' ? String(Math.ceil(partida.cuenta)) : String(Math.ceil(partida.restante));
    documento.querySelector('#reloj').classList?.toggle('urgente', partida.fase === 'jugando' && partida.restante <= 10);
    documento.querySelector('#combustible').style.width = `${partida.combustible * 20}%`;
    if (partida.fase === 'cuenta') {
      velo.hidden = false; textoCuenta.hidden = false; textoCuenta.textContent = partida.cuenta > 0 ? String(Math.ceil(partida.cuenta)) : '¡YA!';
      consejo.hidden = false;
      tituloFinal.hidden = true; premioFinal.hidden = true; continuar.hidden = true;
    } else if (partida.fase === 'jugando') velo.hidden = true;
    else if (partida.fase === 'fin') {
      velo.hidden = false; textoCuenta.hidden = true; consejo.hidden = true; tituloFinal.hidden = false; premioFinal.hidden = false; continuar.hidden = false;
      premioFinal.textContent = `Ganaste ${partida.churus} Churus`;
    }
    raf = ventana.requestAnimationFrame(fotograma);
  }
  raf = ventana.requestAnimationFrame(fotograma);
  return { iniciado: true, partida, destruir() { ventana.cancelAnimationFrame(raf); ventana.removeEventListener('keydown', onKeyDown); ventana.removeEventListener('keyup', onKeyUp); } };
}
