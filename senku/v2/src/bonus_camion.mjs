import { ganarChurus } from './core/economia.mjs';
import { iniciar as iniciarGuardado } from './core/migracion.mjs';
import { CLAVE, guardar, normalizar } from './core/store.mjs';

export const DURACION = 45;
export const CUENTA_REGRESIVA = 3;
export const TOPE_CHURUS = 30;
export const ID_PREMIO = 'bonus-camion-etapa-4';
export const TIPOS_OBSTACULO = ['letrero', 'rama', 'cable'];
export const CAPAS_PARALAJE = 3;

export function nivelEnCamion(senkuX) {
  if (senkuX < 0.36) return 0; // Cajas traseras bajas
  if (senkuX < 0.64) return 1; // Huacales y cajas apiladas medias
  return 2; // Techo alto de la cabina del camión
}

export function crearPartida() {
  return {
    fase: 'cuenta',
    cuenta: CUENTA_REGRESIVA,
    restante: DURACION,
    churus: 0,
    combustible: 2, // Nivel visual en el indicador de cajas/techo (0..5)
    tiempoMundo: 0,
    distancia: 0,
    senkuX: 0.48,
    nivel: 1,
    salto: 0,
    invulnerable: 0,
    sacudida: 0,
    rebote: 0,
    destello: 0,
    objetos: [],
    particulas: [],
    textos: [],
    siguienteObjeto: 0,
  };
}

export function avanzarReloj(partida, dt) {
  let tiempo = Number.isFinite(dt) ? Math.max(0, dt) : 0;
  const nueva = { ...partida };
  if (nueva.fase === 'cuenta') {
    const falta = nueva.cuenta - tiempo;
    if (falta > 0) nueva.cuenta = falta;
    else {
      nueva.fase = 'jugando';
      nueva.cuenta = 0;
      tiempo = -falta;
    }
  }
  if (nueva.fase === 'jugando') {
    nueva.restante = Math.max(0, nueva.restante - tiempo);
    if (nueva.restante === 0) nueva.fase = 'fin';
  }
  return nueva;
}

function emitirParticulas(partida, x, y, color, cantidad = 6, velocidad = 95) {
  for (let i = 0; i < cantidad; i++) {
    const angulo = (Math.PI * 2 * i) / cantidad + (partida.tiempoMundo * 3) % 1;
    partida.particulas.push({
      x,
      y,
      vx: Math.cos(angulo) * velocidad * (0.6 + (i % 3) * 0.25),
      vy: Math.sin(angulo) * velocidad * 0.7 - 35,
      vida: 0.48,
      maxVida: 0.48,
      color,
      radio: 3 + (i % 3),
    });
  }
}

export function avanzarMundo(partida, dt, entrada = {}, ancho = 390, onSonido = null) {
  if (partida.fase !== 'jugando') return partida;
  const izq = Boolean(entrada.izquierda);
  const der = Boolean(entrada.derecha);
  const salto = Boolean(entrada.salto);

  const nivelPrevio = partida.nivel;
  partida.senkuX = Math.max(0.12, Math.min(0.86, partida.senkuX + (der - izq) * dt * 0.85));
  partida.nivel = nivelEnCamion(partida.senkuX);

  if (partida.nivel !== nivelPrevio && partida.salto <= 0) {
    partida.rebote = 0.22;
    emitirParticulas(partida, ancho * (0.16 + partida.senkuX * 0.44), 0, '#e8cfa6', 4, 55);
  }

  if (salto && partida.salto <= 0) {
    partida.salto = 1;
    emitirParticulas(partida, ancho * (0.16 + partida.senkuX * 0.44), 0, '#f5e0b7', 6, 75);
    onSonido?.(520, 0.08);
  }
  if (partida.salto > 0) {
    partida.salto = Math.max(0, partida.salto - dt * 1.48);
  }

  partida.combustible = Math.min(5, Math.max(1, (partida.nivel + 1) + (partida.salto > 0.15 ? 2 : 0)));
  partida.tiempoMundo += dt;
  partida.distancia += dt * 265;

  if (partida.tiempoMundo >= partida.siguienteObjeto) {
    const ciclo = Math.floor(partida.tiempoMundo / 0.58);
    const esObstaculo = ciclo % 4 === 2;
    const tipoObstaculo = TIPOS_OBSTACULO[Math.floor(ciclo / 4) % TIPOS_OBSTACULO.length];
    const nivelObj = ciclo % 3; // 0: cajas bajas, 1: cajas medias, 2: techo/alto
    partida.objetos.push({
      tipo: esObstaculo ? tipoObstaculo : 'churu',
      x: ancho + 52,
      nivel: nivelObj,
      altura: nivelObj * 26,
      recogido: false,
    });
    partida.siguienteObjeto = partida.tiempoMundo + 0.58;
  }

  const px = ancho * (0.15 + partida.senkuX * 0.45);
  const arcoSalto = partida.salto > 0 ? Math.sin((1 - partida.salto) * Math.PI) * 1.85 : 0;
  const alturaSenku = partida.nivel + arcoSalto;

  for (const o of partida.objetos) {
    if (o.recogido) continue;
    o.x -= dt * ancho * 0.82;
    if (Math.abs(o.x - px) < Math.min(40, ancho * 0.095)) {
      if (o.tipo === 'churu') {
        if (Math.abs(alturaSenku - o.nivel) <= 1.35) {
          if (partida.churus < TOPE_CHURUS) {
            partida.churus++;
            partida.destello = 0.25;
            emitirParticulas(partida, o.x, -o.altura - 28, '#ffe066', 7, 105);
            partida.textos.push({ x: o.x, y: -o.altura - 36, texto: '+1 Churu', vida: 0.65, color: '#ffe57d' });
            onSonido?.(880, 0.08);
          }
          o.recogido = true;
        }
      } else {
        const esquivado = partida.salto >= 0.22 || Math.abs(alturaSenku - o.nivel) > 0.88;
        if (!esquivado && partida.invulnerable <= 0) {
          partida.sacudida = 0.3;
          partida.invulnerable = 0.65;
          partida.rebote = 0.42;
          const colorChispa = o.tipo === 'cable' ? '#72efdd' : (o.tipo === 'rama' ? '#80ed99' : '#ff9f1c');
          emitirParticulas(partida, o.x, -o.altura - 32, colorChispa, 8, 115);
          partida.textos.push({ x: o.x, y: -o.altura - 42, texto: '¡Cuidado!', vida: 0.6, color: '#ff8fa3' });
          onSonido?.(115, 0.16);
        }
        o.recogido = true;
      }
    }
  }

  partida.objetos = partida.objetos.filter((o) => !o.recogido && o.x > -48);
  for (const p of partida.particulas) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 180 * dt;
    p.vida -= dt;
  }
  partida.particulas = partida.particulas.filter((p) => p.vida > 0);

  for (const txt of partida.textos) {
    txt.y -= 38 * dt;
    txt.vida -= dt;
  }
  partida.textos = partida.textos.filter((txt) => txt.vida > 0);

  partida.invulnerable = Math.max(0, partida.invulnerable - dt);
  partida.sacudida = Math.max(0, partida.sacudida - dt);
  partida.rebote = Math.max(0, partida.rebote - dt);
  partida.destello = Math.max(0, partida.destello - dt);
  return partida;
}

export function finalizarPartida(almacen, partida) {
  if (!almacen || !partida || partida.fase !== 'fin') return { guardado: false, estado: null };
  let estado;
  try {
    estado = normalizar(JSON.parse(almacen.getItem(CLAVE)));
  } catch {
    return { guardado: false, estado: null };
  }
  if (!estado || estado.coleccionados.includes(ID_PREMIO)) return { guardado: false, estado };
  const cantidad = Math.min(TOPE_CHURUS, Math.max(0, Math.floor(partida.churus)));
  const premio = ganarChurus(estado, cantidad, ID_PREMIO);
  if (premio.error) return { guardado: false, estado };
  const actualizado = { ...premio, progreso: { ...premio.progreso, escena: 'taqueria' } };
  return { guardado: guardar(almacen, actualizado), estado: actualizado };
}

export function iniciarBonus(documento = document, ventana = window) {
  const canvas = documento.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return { iniciado: false };
  const partida = crearPartida();
  const teclas = new Set();
  const controles = { izquierda: false, derecha: false, salto: false };
  const almacen = (() => {
    try { return ventana.localStorage; } catch { return null; }
  })();
  try {
    if (almacen && !almacen.getItem(CLAVE)) iniciarGuardado(almacen);
  } catch { /* almacenamiento opcional */ }

  let ultimo = 0;
  let raf = 0;
  let silencio = false;
  let audio = null;
  const sonido = (frecuencia, duracion = 0.09) => {
    if (silencio) return;
    try {
      audio ||= new (ventana.AudioContext || ventana.webkitAudioContext)();
      const oscilador = audio.createOscillator();
      const volumen = audio.createGain();
      oscilador.frequency.value = frecuencia;
      volumen.gain.setValueAtTime(0.07, audio.currentTime);
      volumen.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duracion);
      oscilador.connect(volumen);
      volumen.connect(audio.destination);
      oscilador.start();
      oscilador.stop(audio.currentTime + duracion);
    } catch { /* audio opcional */ }
  };

  const botones = [...documento.querySelectorAll('[data-control]')];
  for (const boton of botones) {
    const accion = boton.dataset.control;
    const down = (evento) => {
      evento.preventDefault();
      controles[accion] = true;
      boton.setPointerCapture?.(evento.pointerId);
    };
    const up = () => { controles[accion] = false; };
    boton.addEventListener('pointerdown', down);
    for (const tipo of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      boton.addEventListener(tipo, up);
    }
  }

  const onKeyDown = (e) => {
    teclas.add(e.code);
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW'].includes(e.code)) {
      e.preventDefault();
    }
  };
  const onKeyUp = (e) => teclas.delete(e.code);
  ventana.addEventListener('keydown', onKeyDown);
  ventana.addEventListener('keyup', onKeyUp);
  ventana.addEventListener('blur', () => {
    teclas.clear();
    for (const k of Object.keys(controles)) controles[k] = false;
  });
  documento.querySelector('#sonido')?.addEventListener('click', (e) => {
    silencio = !silencio;
    e.currentTarget.textContent = silencio ? 'Sonido apagado' : 'Sonido';
  });

  const velo = documento.querySelector('#velo');
  const textoCuenta = documento.createElement('strong');
  const tituloFinal = documento.createElement('strong');
  tituloFinal.textContent = '¡Llegamos a la taquería, Senku!';
  tituloFinal.hidden = true;
  const premioFinal = documento.createElement('span');
  premioFinal.hidden = true;
  const continuar = documento.createElement('button');
  continuar.type = 'button';
  continuar.textContent = 'Seguir a la taquería';
  continuar.hidden = true;
  continuar.addEventListener('click', () => {
    ventana.location.href = './index.html';
  });
  velo.replaceChildren(textoCuenta, tituloFinal, premioFinal, continuar);

  const w = () => canvas.clientWidth || ventana.innerWidth;
  const h = () => canvas.clientHeight || ventana.innerHeight;
  function redimensionar() {
    const dpr = Math.min(2, ventana.devicePixelRatio || 1);
    canvas.width = Math.round(w() * dpr);
    canvas.height = Math.round(h() * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  ventana.addEventListener('resize', redimensionar);
  redimensionar();

  function dibujar(t) {
    const W = w();
    const H = h();
    const portrait = H > W * 1.25;
    const ground = H * (portrait ? 0.66 : 0.74);

    // Cielo urbano de atardecer en la Ciudad de México
    const grad = ctx.createLinearGradient(0, 0, 0, ground);
    grad.addColorStop(0, '#283059');
    grad.addColorStop(0.45, '#724b73');
    grad.addColorStop(0.82, '#d87852');
    grad.addColorStop(1, '#f4ba74');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const sun = ctx.createRadialGradient(W * 0.76, H * 0.2, 2, W * 0.76, H * 0.2, Math.min(W, H) * 0.16);
    sun.addColorStop(0, '#fff4c2');
    sun.addColorStop(0.4, '#ffd07b');
    sun.addColorStop(1, '#ffd07b00');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, W, H * 0.5);

    // Capa 1 de paralaje: siluetas de edificios lejanos, cúpulas y tinacos
    const pasoEdificios = Math.max(92, W * (portrait ? 0.26 : 0.16));
    const offsetCapa1 = (partida.distancia * 0.08) % pasoEdificios;
    for (let i = -1; i < Math.ceil(W / pasoEdificios) + 2; i++) {
      const idx = i + Math.floor((partida.distancia * 0.08) / pasoEdificios);
      const x = i * pasoEdificios - offsetCapa1;
      const altoEd = H * (portrait ? 0.22 : 0.28) + ((idx * 37) % 5) * (H * 0.032);
      const y = ground - altoEd;
      ctx.fillStyle = '#362d4f';
      ctx.fillRect(x, y, pasoEdificios - 6, altoEd);
      // Tinaco o antena en la azotea
      ctx.fillStyle = '#261f38';
      ctx.fillRect(x + pasoEdificios * 0.25, y - 14, 14, 14);
      // Ventanas encendidas
      ctx.fillStyle = '#ffd97d99';
      for (let vy = y + 16; vy < ground - 26; vy += 24) {
        ctx.fillRect(x + 12, vy, 9, 12);
        if (pasoEdificios > 64) ctx.fillRect(x + 32, vy, 9, 12);
      }
    }

    // Capa 2 de paralaje: fachadas coloridas de barrio mexicano, balcones y árboles urbanos
    const pasoFachadas = Math.max(130, W * (portrait ? 0.36 : 0.22));
    const offsetCapa2 = (partida.distancia * 0.24) % pasoFachadas;
    const coloresFachada = ['#b85442', '#cc8b3c', '#457385', '#a84763', '#567d5e'];
    for (let i = -1; i < Math.ceil(W / pasoFachadas) + 2; i++) {
      const idx = Math.abs(i + Math.floor((partida.distancia * 0.24) / pasoFachadas));
      const x = i * pasoFachadas - offsetCapa2;
      const altoFachada = H * (portrait ? 0.17 : 0.22) + (idx % 3) * (H * 0.025);
      const y = ground - altoFachada;
      ctx.fillStyle = coloresFachada[idx % coloresFachada.length];
      ctx.fillRect(x, y, pasoFachadas - 8, altoFachada);
      // Cornisa colonial y toldo de local
      ctx.fillStyle = '#f5e1bc';
      ctx.fillRect(x - 2, y, pasoFachadas - 4, 6);
      ctx.fillStyle = '#6b2d26';
      ctx.fillRect(x + 14, y + altoFachada * 0.52, pasoFachadas * 0.56, 8);
      // Ventanas con balcón
      ctx.fillStyle = '#2d232e';
      ctx.fillRect(x + 18, y + 18, 22, 28);
      ctx.fillRect(x + pasoFachadas * 0.52, y + 18, 22, 28);
      // Árbol urbano (jacaranda / fresno) entre fachadas
      ctx.fillStyle = '#4e3629';
      ctx.fillRect(x + pasoFachadas - 22, ground - 46, 7, 46);
      ctx.fillStyle = idx % 2 === 0 ? '#5c8c61' : '#7b5ea7';
      ctx.beginPath();
      ctx.arc(x + pasoFachadas - 18, ground - 52, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // Capa 3 de paralaje: postes urbanos y cables tendidos en catenaria
    const pasoPostes = Math.max(170, W * (portrait ? 0.48 : 0.3));
    const offsetCapa3 = (partida.distancia * 0.58) % pasoPostes;
    const altoPoste = H * (portrait ? 0.31 : 0.38);
    ctx.strokeStyle = '#221c29';
    ctx.lineWidth = 2.2;
    for (let i = -1; i < Math.ceil(W / pasoPostes) + 2; i++) {
      const x = i * pasoPostes - offsetCapa3;
      const yTop = ground - altoPoste;
      // Cables eléctricos hacia el siguiente poste
      for (let c = 0; c < 3; c++) {
        const cy = yTop + 10 + c * 12;
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.quadraticCurveTo(x + pasoPostes * 0.5, cy + 18 + c * 4, x + pasoPostes, cy);
        ctx.stroke();
      }
      // Poste y cruceta
      ctx.fillStyle = '#4a3b34';
      ctx.fillRect(x - 4, yTop, 8, altoPoste);
      ctx.fillStyle = '#2f2523';
      ctx.fillRect(x - 18, yTop + 8, 36, 5);
      ctx.fillRect(x - 14, yTop + 22, 28, 4);
    }

    // Banqueta y avenida de asfalto
    ctx.fillStyle = '#8c7a70';
    ctx.fillRect(0, ground - 8, W, 10);
    ctx.fillStyle = '#e0a94f';
    ctx.fillRect(0, ground - 2, W, 4);
    ctx.fillStyle = '#333036';
    ctx.fillRect(0, ground + 2, W, H - ground);
    ctx.fillStyle = '#f6cf65';
    for (let i = 0; i < 14; i++) {
      const x = ((i * 115 - partida.distancia * 1.15) % (W + 115) + W + 115) % (W + 115) - 60;
      ctx.fillRect(x, ground + H * 0.09, 44, 5);
    }

    // El camión urbano mexicano avanzando con cajas escalonadas y techo
    const truckX = W * (portrait ? 0.07 : 0.11);
    const truckW = Math.min(W * (portrait ? 0.68 : 0.45), portrait ? 270 : 410);
    const truckH = Math.min(H * (portrait ? 0.16 : 0.22), truckW * 0.48);
    const bounce = partida.rebote > 0
      ? Math.sin((1 - partida.rebote) * Math.PI) * 7
      : Math.sin(t * 16) * 2;
    const truckY = ground - truckH - bounce;

    // Sombra del camión
    ctx.fillStyle = '#1b171ecc';
    ctx.beginPath();
    ctx.ellipse(truckX + truckW * 0.5, ground + 8, truckW * 0.52, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Humo del escape trasero
    if (partida.fase === 'jugando') {
      for (let i = 0; i < 3; i++) {
        const faseHumo = (t * 3 + i * 0.33) % 1;
        ctx.fillStyle = '#d8d2c966';
        ctx.beginPath();
        ctx.arc(truckX - 8 - faseHumo * 34, truckY + truckH * 0.82 - faseHumo * 18, 6 + faseHumo * 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Carrocería de carga (redilas) y cabina del camión (techo alto nivel 2)
    ctx.fillStyle = '#2b7a78';
    ctx.fillRect(truckX, truckY + truckH * 0.46, truckW * 0.68, truckH * 0.44);
    ctx.fillStyle = '#f2e8cf';
    ctx.fillRect(truckX, truckY + truckH * 0.58, truckW * 0.68, 7);
    // Cabina delantera y techo alto (nivel 2)
    ctx.fillStyle = '#3a9691';
    ctx.fillRect(truckX + truckW * 0.64, truckY + truckH * 0.08, truckW * 0.28, truckH * 0.82);
    ctx.fillStyle = '#e07a5f';
    ctx.fillRect(truckX + truckW * 0.62, truckY, truckW * 0.3, truckH * 0.12);
    // Parabrisas y cofre
    ctx.fillStyle = '#a8dadc';
    ctx.fillRect(truckX + truckW * 0.75, truckY + truckH * 0.18, truckW * 0.14, truckH * 0.28);
    ctx.fillStyle = '#2b7a78';
    ctx.fillRect(truckX + truckW * 0.88, truckY + truckH * 0.44, truckW * 0.12, truckH * 0.46);
    ctx.fillStyle = '#ffe66d';
    ctx.fillRect(truckX + truckW * 0.97, truckY + truckH * 0.58, 6, 12);

    // Nivel 0: Cajas bajas en la plataforma trasera
    ctx.fillStyle = '#b07145';
    ctx.fillRect(truckX + truckW * 0.05, truckY + truckH * 0.24, truckW * 0.28, truckH * 0.24);
    ctx.fillStyle = '#8a522d';
    ctx.fillRect(truckX + truckW * 0.07, truckY + truckH * 0.28, truckW * 0.24, 4);

    // Nivel 1: Huacales y cajas apiladas al centro
    ctx.fillStyle = '#cf8a4e';
    ctx.fillRect(truckX + truckW * 0.34, truckY + truckH * 0.1, truckW * 0.28, truckH * 0.38);
    ctx.fillStyle = '#9e6234';
    ctx.fillRect(truckX + truckW * 0.36, truckY + truckH * 0.18, truckW * 0.24, 4);
    ctx.fillRect(truckX + truckW * 0.36, truckY + truckH * 0.3, truckW * 0.24, 4);

    // Ruedas del camión
    for (const rx of [truckX + truckW * 0.22, truckX + truckW * 0.52, truckX + truckW * 0.84]) {
      ctx.fillStyle = '#1e1b22';
      ctx.beginPath();
      ctx.arc(rx, truckY + truckH * 0.92, truckH * 0.19, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e5c185';
      ctx.beginPath();
      ctx.arc(rx, truckY + truckH * 0.92, truckH * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }

    // Posición de Senku saltando entre las cajas (nivel 0 y 1) y el techo del camión (nivel 2)
    const senkuScreenX = truckX + truckW * (0.1 + partida.senkuX * 0.72);
    const baseNivelY = [
      truckY + truckH * 0.24, // Nivel 0: cajas bajas
      truckY + truckH * 0.1,  // Nivel 1: cajas medias
      truckY,                 // Nivel 2: techo del camión
    ][partida.nivel] || (truckY + truckH * 0.1);
    const jumpArc = partida.salto > 0 ? Math.sin((1 - partida.salto) * Math.PI) * H * 0.15 : 0;
    const senkuY = baseNivelY - jumpArc;

    if (partida.destello > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, partida.destello * 4);
      ctx.strokeStyle = '#fff399';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(senkuScreenX, senkuY - 18, 22 + (0.25 - partida.destello) * 75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Dibujo de Churus y obstáculos de la ciudad (letrero, rama, cable)
    const baseObjetosY = truckY + truckH * 0.18;
    for (const o of partida.objetos) {
      if (o.x < -44) continue;
      const oy = baseObjetosY - o.altura;
      if (o.tipo === 'churu') {
        ctx.fillStyle = '#ffdf63';
        ctx.beginPath();
        ctx.ellipse(o.x, oy - 16, 10, 17, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c84b31';
        ctx.fillRect(o.x - 6, oy - 14, 12, 5);
      } else if (o.tipo === 'letrero') {
        // Letrero vial urbano
        ctx.fillStyle = '#5c4d46';
        ctx.fillRect(o.x - 3, oy - 34, 6, 36);
        ctx.fillStyle = '#e76f51';
        ctx.fillRect(o.x - 24, oy - 42, 48, 22);
        ctx.fillStyle = '#fff3d6';
        ctx.fillRect(o.x - 18, oy - 34, 36, 5);
      } else if (o.tipo === 'rama') {
        // Rama frondosa de árbol urbano
        ctx.fillStyle = '#6b4423';
        ctx.fillRect(o.x - 24, oy - 22, 46, 7);
        ctx.fillStyle = '#40916c';
        ctx.beginPath();
        ctx.arc(o.x - 8, oy - 26, 15, 0, Math.PI * 2);
        ctx.arc(o.x + 10, oy - 24, 13, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Cable bajo con chispas
        ctx.strokeStyle = '#1d1a24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(o.x - 22, oy - 38);
        ctx.quadraticCurveTo(o.x, oy - 12, o.x + 22, oy - 38);
        ctx.stroke();
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(o.x, oy - 22, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Dibujo de Senku sobre las cajas / techo del camión
    const flash = partida.invulnerable > 0 && Math.floor(t * 22) % 2 === 0;
    if (!flash) {
      const catW = Math.max(28, Math.min(44, truckW * 0.11));
      const catH = catW * 0.92;
      // Sombra de Senku sobre la caja/techo
      ctx.fillStyle = '#1e161b66';
      ctx.beginPath();
      ctx.ellipse(senkuScreenX, baseNivelY, catW * 0.45, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Cola animada
      ctx.strokeStyle = '#d98a3c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(senkuScreenX - catW * 0.35, senkuY - catH * 0.35);
      ctx.quadraticCurveTo(
        senkuScreenX - catW * 0.75,
        senkuY - catH * (0.75 + Math.sin(t * 14) * 0.2),
        senkuScreenX - catW * 0.55,
        senkuY - catH * 0.95
      );
      ctx.stroke();
      // Cuerpo y cabeza de Senku
      ctx.fillStyle = '#f3b76b';
      ctx.fillRect(senkuScreenX - catW * 0.36, senkuY - catH * 0.62, catW * 0.72, catH * 0.48);
      ctx.beginPath();
      ctx.ellipse(senkuScreenX + catW * 0.12, senkuY - catH * 0.76, catW * 0.32, catH * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      // Orejas
      ctx.fillStyle = '#7a4b3a';
      ctx.beginPath();
      ctx.moveTo(senkuScreenX - catW * 0.08, senkuY - catH * 0.94);
      ctx.lineTo(senkuScreenX + catW * 0.02, senkuY - catH * 1.18);
      ctx.lineTo(senkuScreenX + catW * 0.12, senkuY - catH * 0.96);
      ctx.moveTo(senkuScreenX + catW * 0.16, senkuY - catH * 0.96);
      ctx.lineTo(senkuScreenX + catW * 0.28, senkuY - catH * 1.18);
      ctx.lineTo(senkuScreenX + catW * 0.34, senkuY - catH * 0.92);
      ctx.fill();
      // Patitas animadas al correr o saltar
      const pasoPata = partida.salto > 0 ? 3 : Math.sin(t * 20) * 4;
      ctx.fillStyle = '#fff3dd';
      ctx.fillRect(senkuScreenX - catW * 0.28, senkuY - catH * 0.18 + pasoPata * 0.4, 6, 8);
      ctx.fillRect(senkuScreenX + catW * 0.14, senkuY - catH * 0.18 - pasoPata * 0.4, 6, 8);
    }

    // Partículas (polvo al saltar, destellos al tomar Churu, chispas/hojas al chocar)
    for (const p of partida.particulas) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, baseObjetosY + p.y, p.radio, 0, Math.PI * 2);
      ctx.fill();
    }

    // Números y mensajes flotantes (+1 Churu / ¡Cuidado!)
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (const txt of partida.textos) {
      ctx.fillStyle = txt.color;
      ctx.fillText(txt.texto, txt.x, baseObjetosY + txt.y);
    }
  }

  function fotograma(timestamp) {
    if (!ultimo) ultimo = timestamp;
    const dt = Math.min(0.05, (timestamp - ultimo) / 1000);
    ultimo = timestamp;
    if (partida.fase === 'jugando') {
      const entrada = {
        izquierda: controles.izquierda || teclas.has('ArrowLeft') || teclas.has('KeyA'),
        derecha: controles.derecha || teclas.has('ArrowRight') || teclas.has('KeyD'),
        salto: controles.salto || teclas.has('ArrowUp') || teclas.has('Space') || teclas.has('KeyW'),
      };
      avanzarMundo(partida, dt, entrada, w(), sonido);
    }
    const nueva = avanzarReloj(partida, dt);
    Object.assign(partida, nueva);
    if (partida.fase === 'fin' && !partida.premio) {
      partida.premio = finalizarPartida(almacen, partida);
    }
    const shake = partida.sacudida > 0 ? Math.random() * 12 - 6 : 0;
    ctx.save();
    ctx.translate(shake, shake * 0.4);
    dibujar(timestamp / 1000);
    ctx.restore();

    documento.querySelector('#marcador').textContent = String(partida.churus).padStart(2, '0');
    documento.querySelector('#reloj').textContent = partida.fase === 'cuenta'
      ? String(Math.ceil(partida.cuenta))
      : String(Math.ceil(partida.restante));
    const barra = documento.querySelector('#combustible');
    if (barra) barra.style.width = `${partida.combustible * 20}%`;

    if (partida.fase === 'cuenta') {
      velo.hidden = false;
      textoCuenta.hidden = false;
      textoCuenta.textContent = partida.cuenta > 0 ? String(Math.ceil(partida.cuenta)) : '¡YA!';
      tituloFinal.hidden = true;
      premioFinal.hidden = true;
      continuar.hidden = true;
    } else if (partida.fase === 'jugando') {
      velo.hidden = true;
    } else if (partida.fase === 'fin') {
      velo.hidden = false;
      textoCuenta.hidden = true;
      tituloFinal.hidden = false;
      premioFinal.hidden = false;
      continuar.hidden = false;
      premioFinal.textContent = `Ganaste ${partida.churus} Churus`;
    }
    raf = ventana.requestAnimationFrame(fotograma);
  }
  raf = ventana.requestAnimationFrame(fotograma);
  return {
    iniciado: true,
    partida,
    destruir() {
      ventana.cancelAnimationFrame(raf);
      ventana.removeEventListener('keydown', onKeyDown);
      ventana.removeEventListener('keyup', onKeyUp);
    },
  };
}
