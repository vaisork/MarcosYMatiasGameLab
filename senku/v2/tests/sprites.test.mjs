import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  clasificarTipoPlataforma,
  crearCatalogoArte,
  dibujarParalajeCiudad,
  dibujarParalajeDesierto,
  dibujarParalajeReja,
  dibujarParalajeTaqueria,
  dibujarPlataformaObjeto,
  renderizarEscena,
} from '../src/render/canvas.mjs';
import {
  ANIMACIONES_ENEMIGO,
  ANIMACIONES_JUGADOR,
  FONDOS_ESCENA,
  HOJAS_ENEMIGO,
  HOJAS_JUGADOR,
  IMAGENES_OBJETO,
  HOJA_JEFE_GATO,
  RETRATOS_MENU,
  configuracionEnemigo,
  crearAnimadorEnemigos,
  crearSistemaParticulasPolvo,
  dibujarEnemigo,
  dibujarJugador,
  dibujarObjeto,
  estadoVisualJugador,
  fotogramaDeAnimacion,
  normalizarEstadoJugador,
  rectanguloDestino,
  rectanguloFotograma,
  resolverRutaArte,
  rutaFondoEscena,
  rutaHojaJugador,
  rutasPrecargaArte,
} from '../src/render/sprites.mjs';
import { CATALOGO_ENEMIGOS } from '../src/data/enemigos.mjs';

// Imagen falsa controlable: sin DOM
function fabricaImagenes() {
  const creadas = [];
  const crearImagen = () => {
    const img = { width: 384, height: 192, onload: null, onerror: null, _src: '' };
    Object.defineProperty(img, 'src', { get: () => img._src, set: (v) => { img._src = v; creadas.push(img); } });
    return img;
  };
  return { creadas, crearImagen };
}

function ctxFalso() {
  const llamadas = [];
  const ctx = new Proxy({}, {
    get: (_, prop) => {
      if (prop === 'llamadas') return llamadas;
      return (...args) => { llamadas.push([prop, ...args]); };
    },
    set: () => true,
  });
  return ctx;
}

test('catálogo: precarga única, progreso y fin sin errores', async () => {
  const { creadas, crearImagen } = fabricaImagenes();
  const cat = crearCatalogoArte({ crearImagen, aviso: () => {} });
  const fin = cat.precargar(['a.png', 'b.png', 'a.png']);
  assert.equal(creadas.length, 2, 'una sola imagen por ruta');
  assert.equal(cat.estado().precargando, true);
  assert.equal(cat.estado().progreso, 0);
  assert.equal(cat.obtener('a.png'), null, 'aún cargando: sin imagen');

  creadas[0].onload();
  assert.equal(cat.estado().progreso, 0.5);
  creadas[1].onload();
  const estado = await fin;
  assert.equal(estado.precargando, false);
  assert.equal(estado.listas, 2);
  assert.equal(estado.fallidas, 0);
  assert.equal(cat.obtener('a.png'), creadas[0]);
  cat.obtener('a.png');
  cat.cargar('b.png');
  assert.equal(creadas.length, 2, 'no se crean imágenes nuevas después');
});

test('catálogo: una imagen que falla se avisa una vez y no rompe', async () => {
  const { creadas, crearImagen } = fabricaImagenes();
  const avisos = [];
  const cat = crearCatalogoArte({ crearImagen, aviso: (m) => avisos.push(m) });
  const fin = cat.precargar(['mala.png', 'buena.png']);
  creadas[0].onerror();
  creadas[0].onerror();
  creadas[1].onload();
  const estado = await fin;
  assert.equal(estado.fallidas, 1);
  assert.equal(estado.listas, 1);
  assert.equal(estado.precargando, false);
  assert.equal(cat.obtener('mala.png'), null);
  assert.equal(avisos.length, 1);
});

test('catálogo: sin Image disponible o con tiempo agotado cae al respaldo', async () => {
  const sinDom = crearCatalogoArte({ crearImagen: null, aviso: () => {} });
  const est = await sinDom.precargar(['x.png']);
  assert.equal(est.fallidas, 1);
  assert.equal(sinDom.obtener('x.png'), null);

  const { crearImagen } = fabricaImagenes();
  const colgado = crearCatalogoArte({ crearImagen, aviso: () => {} });
  const est2 = await colgado.precargar(['nunca.png'], { timeoutMs: 5 });
  assert.equal(est2.fallidas, 1);
  assert.equal(est2.precargando, false);
});

test('rutas de arte: existen en disco, bajo assets/ y sin duplicados', () => {
  const rutas = rutasPrecargaArte();
  assert.equal(new Set(rutas).size, rutas.length);
  for (const ruta of rutas) {
    assert.ok(fs.existsSync(fileURLToPath(ruta)), `Falta ${ruta}`);
    assert.match(ruta, /\/senku\/v2\/assets\//);
  }
  for (const rel of [...Object.values(RETRATOS_MENU), ...Object.values(FONDOS_ESCENA)]) {
    assert.ok(fs.existsSync(fileURLToPath(resolverRutaArte(rel))), `Falta ${rel}`);
  }
});

test('selección de hoja: traje activo, enemigo por tipo y fondo por escena', () => {
  assert.match(rutaHojaJugador('original'), /sprite_original\.png$/);
  assert.match(rutaHojaJugador('rata'), /sprite_rata\.png$/);
  assert.match(rutaHojaJugador('desconocido'), /sprite_original\.png$/, 'traje desconocido usa el original');
  assert.match(configuracionEnemigo({ tipo: 'cucaracha' }).ruta, /hamster_cafe\.png$/);
  assert.match(configuracionEnemigo({ tipo: 'rata_menor' }).ruta, /raton_negro\.png$/);
  assert.match(configuracionEnemigo({ tipo: 'otro', hoja: 'assets/enemigos/raton_cafe.png' }).ruta, /raton_cafe\.png$/);
  assert.match(rutaFondoEscena('taqueria'), /taqueria_ciudad\.webp$/);
  assert.equal(rutaFondoEscena('inexistente'), null);
  for (const tipo of Object.keys(CATALOGO_ENEMIGOS)) {
    assert.ok(HOJAS_ENEMIGO[tipo], `Enemigo ${tipo} sin hoja`);
  }
  assert.deepEqual(Object.keys(HOJAS_JUGADOR), ['original', 'rata']);
  assert.ok(Object.keys(IMAGENES_OBJETO).includes('churu'));
  for (const tipo of ['llave', 'botiquin', 'anclador', 'garras', 'lanzador_ratones']) {
    assert.ok(IMAGENES_OBJETO[tipo], `Objeto ${tipo} sin imagen`);
  }
  // La hoja del jefe (525 KB) sólo se precarga en la cima.
  assert.ok(rutasPrecargaArte({ escenaId: 'cima' }).includes(resolverRutaArte(HOJA_JEFE_GATO)));
  assert.ok(!rutasPrecargaArte({ escenaId: 'taqueria' }).includes(resolverRutaArte(HOJA_JEFE_GATO)));
});

test('fotograma: rejilla 4x2 de 96 px', () => {
  assert.deepEqual(rectanguloFotograma(0), { sx: 0, sy: 0, sw: 96, sh: 96 });
  assert.deepEqual(rectanguloFotograma(3), { sx: 288, sy: 0, sw: 96, sh: 96 });
  assert.deepEqual(rectanguloFotograma(5), { sx: 96, sy: 96, sw: 96, sh: 96 });
  assert.deepEqual(rectanguloFotograma(7), { sx: 288, sy: 96, sw: 96, sh: 96 });
  assert.deepEqual(rectanguloFotograma(-2), { sx: 0, sy: 0, sw: 96, sh: 96 });
});

test('fotograma: rejilla 8 columnas dinámicas de 96 px para Senku', () => {
  assert.deepEqual(rectanguloFotograma(0, 8), { sx: 0, sy: 0, sw: 96, sh: 96 });
  assert.deepEqual(rectanguloFotograma(7, 8), { sx: 672, sy: 0, sw: 96, sh: 96 });
  assert.deepEqual(rectanguloFotograma(8, 8), { sx: 0, sy: 96, sw: 96, sh: 96 });
  assert.deepEqual(rectanguloFotograma(15, 8), { sx: 672, sy: 96, sw: 96, sh: 96 });
  assert.deepEqual(rectanguloFotograma(16, 8), { sx: 0, sy: 192, sw: 96, sh: 96 });
});

test('animación: caminar usa la fila de patas (no el reposo) y repite', () => {
  const { caminar, quieto } = ANIMACIONES_JUGADOR;
  assert.ok(caminar.frames.every((f) => !quieto.frames.includes(f)), 'no reutiliza cuadros de reposo');
  const vistos = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => fotogramaDeAnimacion(caminar, (i + .5) / caminar.fps));
  assert.deepEqual(vistos, [8, 9, 10, 11, 12, 13, 14, 15, 8]);
  assert.equal(fotogramaDeAnimacion(null, 1), 0);
});

test('animación: el ciclo de correr ágil tiene 8 cuadros y repite suavemente', () => {
  const { correr } = ANIMACIONES_JUGADOR;
  assert.equal(correr.frames.length, 8);
  assert.deepEqual(correr.frames, [8, 9, 10, 11, 12, 13, 14, 15]);
  assert.equal(fotogramaDeAnimacion(correr, 0), 8);
});

test('destino: pies sobre la base de la caja y centrado', () => {
  const r = rectanguloDestino({ x: 100, y: 500, w: 54, h: 42 }, 1);
  assert.equal(r.dw, 96);
  assert.equal(r.dx, 100 + 27 - 48);
  assert.equal(r.dy + 88, 542, 'línea de pies = base de la caja');
});

test('estado visual del jugador: quieto, caminar, salto, caída y golpeado', () => {
  const suelo = { enSuelo: true, vx: 0, vy: 0 };
  assert.equal(estadoVisualJugador(suelo).nombre, 'quieto');
  assert.equal(estadoVisualJugador({ ...suelo, vx: 200 }).nombre, 'caminar');
  assert.equal(estadoVisualJugador({ ...suelo, vx: -200 }).nombre, 'caminar');
  assert.equal(estadoVisualJugador({ enSuelo: false, vx: 0, vy: -300 }).nombre, 'salto');
  assert.equal(estadoVisualJugador({ enSuelo: false, vx: 0, vy: 100 }).nombre, 'caida');
  const combate = { invulnerable: true, duracionInvulnerabilidad: 1.2, tiempoInvulnerable: 1.1 };
  assert.equal(estadoVisualJugador(suelo, combate).nombre, 'golpeado');
  const tarde = { ...combate, tiempoInvulnerable: 0.5 };
  assert.equal(estadoVisualJugador(suelo, tarde).nombre, 'quieto', 'tras el golpe sólo parpadea');
  assert.ok([1, 0.45].includes(estadoVisualJugador(suelo, tarde, 0.01).alpha));
  assert.equal(estadoVisualJugador(suelo, null).alpha, 1);
});

test('estado visual del jugador: soporte de estados explícitos (idle/run/jump/fall/attack/hurt)', () => {
  assert.equal(normalizarEstadoJugador('idle'), 'quieto');
  assert.equal(normalizarEstadoJugador('run'), 'correr');
  assert.equal(normalizarEstadoJugador('jump'), 'salto');
  assert.equal(normalizarEstadoJugador('fall'), 'caida');
  assert.equal(normalizarEstadoJugador('squash'), 'aterrizar');
  assert.equal(normalizarEstadoJugador('attack'), 'zarpazo');
  assert.equal(normalizarEstadoJugador('hurt'), 'golpeado');

  const suelo = { enSuelo: true, vx: 0, vy: 0, estado: 'attack' };
  assert.equal(estadoVisualJugador(suelo).nombre, 'zarpazo');
  assert.equal(estadoVisualJugador({ ...suelo, estado: 'run' }).nombre, 'correr');
  assert.equal(estadoVisualJugador({ ...suelo, estado: 'hurt' }).nombre, 'golpeado');

  // Bandera invulnerable en cuerpo produce parpadeo
  const invulCuerpo = { enSuelo: true, vx: 0, vy: 0, invulnerable: true };
  const vis1 = estadoVisualJugador(invulCuerpo, null, 0);
  const vis2 = estadoVisualJugador(invulCuerpo, null, 0.08);
  assert.ok(vis1.alpha === 1 || vis1.alpha === 0.45);
  assert.ok(vis2.alpha === 1 || vis2.alpha === 0.45);
});

test('animador de enemigos: caminar, daño con HP y derrota que termina', () => {
  const animador = crearAnimadorEnemigos();
  const e = { id: 'e1', vivo: true, hp: 2 };
  assert.equal(animador.estado(e, 0).nombre, 'caminar');
  assert.ok(animador.estado(e, 0.5).frame <= 3);

  e.hp = 1;
  assert.deepEqual(animador.estado(e, 1), { nombre: 'danio', frame: 4, alpha: 1 });
  assert.equal(animador.estado(e, 1.5).nombre, 'caminar');

  e.vivo = false;
  const d0 = animador.estado(e, 2);
  assert.equal(d0.nombre, 'derrotado');
  assert.equal(d0.frame, 4);
  assert.equal(animador.estado(e, 2.6).frame, 6);
  assert.ok(animador.estado(e, 3.2).alpha < 1, 'se desvanece al final');
  assert.equal(animador.estado(e, 4), null, 'ya no se dibuja');
  assert.equal(animador.estado(null, 0), null);
});

test('partículas de polvo: emite al correr y al aterrizar', () => {
  const sis = crearSistemaParticulasPolvo();
  assert.equal(sis.particulas.length, 0);

  // Al correr
  sis.emitirPolvoCorrer(100, 600, 150, 1);
  assert.ok(sis.particulas.length >= 2);

  // Al aterrizar
  sis.emitirPolvoAterrizar(100, 600, 54);
  assert.ok(sis.particulas.length >= 10);

  // Actualizar reduce vida y desaparecen
  sis.actualizar(1.0);
  assert.equal(sis.particulas.length, 0, 'las partículas caducan tras su vida útil');
});

test('dibujador de plataformas por tipo: reconoce huacales, cajas, toldos y rocas', () => {
  assert.equal(clasificarTipoPlataforma({ id: 'huacal-calle-1' }), 'huacal');
  assert.equal(clasificarTipoPlataforma({ id: 'caja-madera' }), 'caja');
  assert.equal(clasificarTipoPlataforma({ id: 'toldo-taqueria' }), 'toldo');
  assert.equal(clasificarTipoPlataforma({ id: 'roca-1' }), 'roca');
  assert.equal(clasificarTipoPlataforma({ id: 'suelo-banqueta' }), 'suelo');
  assert.equal(clasificarTipoPlataforma({ id: 'mesa-derecha' }), 'mesa');
  assert.equal(clasificarTipoPlataforma({ id: 'barra-tacos' }), 'barra');

  const ctx = ctxFalso();
  dibujarPlataformaObjeto(ctx, { id: 'huacal-1', x: 10, y: 10, w: 50, h: 20 }, 0, 'taqueria');
  assert.ok(ctx.llamadas.some((l) => l[0] === 'fillRect'));

  const ctxRoca = ctxFalso();
  dibujarPlataformaObjeto(ctxRoca, { id: 'roca-desierto', x: 10, y: 10, w: 60, h: 24 }, 0, 'desierto');
  assert.ok(ctxRoca.llamadas.some((l) => l[0] === 'fill'));
});

test('paralaje por escenas: renderiza sin lanzar en taquería, ciudad, reja y desierto', () => {
  const ctx = ctxFalso();
  assert.doesNotThrow(() => dibujarParalajeTaqueria(ctx, 100, 1, 1280));
  assert.doesNotThrow(() => dibujarParalajeCiudad(ctx, 100, 1, 1280));
  assert.doesNotThrow(() => dibujarParalajeReja(ctx, 500, 1, 8960));
  assert.doesNotThrow(() => dibujarParalajeDesierto(ctx, 200, 1, 1280));
});

test('dibujo: usa drawImage con el fotograma correcto y voltea a la izquierda', () => {
  const { creadas, crearImagen } = fabricaImagenes();
  const cat = crearCatalogoArte({ crearImagen, aviso: () => {} });
  cat.precargar(rutasPrecargaArte());
  creadas.forEach((i) => i.onload());

  const ctx = ctxFalso();
  const cuerpo = { x: 100, y: 500, w: 54, h: 42, mirando: 1, enSuelo: true, vx: 0, vy: 0 };
  assert.equal(dibujarJugador(ctx, cat, { cuerpo, trajeId: 'rata', tiempo: 0 }), true);
  const dibujo = ctx.llamadas.find((l) => l[0] === 'drawImage');
  assert.equal(dibujo[1].src, cat.obtener(rutaHojaJugador('rata')).src);
  assert.deepEqual(dibujo.slice(2, 6), [0, 0, 96, 96]);
  assert.ok(!ctx.llamadas.some((l) => l[0] === 'scale'));

  const ctxIzq = ctxFalso();
  dibujarJugador(ctxIzq, cat, { cuerpo: { ...cuerpo, mirando: -1 }, trajeId: 'original' });
  assert.ok(ctxIzq.llamadas.some((l) => l[0] === 'scale' && l[1] === -1));

  const ctxEne = ctxFalso();
  const enemigo = { id: 'c', tipo: 'cucaracha', x: 10, y: 600, w: 36, h: 20, mirando: -1, vivo: true };
  assert.equal(dibujarEnemigo(ctxEne, cat, crearAnimadorEnemigos(), enemigo, 0), true);
  assert.ok(ctxEne.llamadas.some((l) => l[0] === 'drawImage'));

  const ctxObj = ctxFalso();
  assert.equal(dibujarObjeto(ctxObj, cat, { tipo: 'churu', x: 0, y: 0, w: 40, h: 80 }, 0), true);
  assert.equal(dibujarObjeto(ctxObj, cat, { tipo: 'no_existe', x: 0, y: 0 }, 0), false);
});

test('dibujo: sin imagen devuelve false para que se use el rectángulo de respaldo', () => {
  const cat = crearCatalogoArte({ crearImagen: null, aviso: () => {} });
  const ctx = ctxFalso();
  const cuerpo = { x: 0, y: 0, w: 54, h: 42, mirando: 1, enSuelo: true, vx: 0, vy: 0 };
  assert.equal(dibujarJugador(ctx, cat, { cuerpo, trajeId: 'original' }), false);
  assert.equal(dibujarEnemigo(ctx, cat, crearAnimadorEnemigos(), { id: 'x', tipo: 'cucaracha', vivo: true }, 0), false);
  assert.equal(ctx.llamadas.length, 0);
});

test('renderizarEscena: con fondo cargado dibuja la imagen sin suelo plano; sin él, el respaldo', () => {
  const { creadas, crearImagen } = fabricaImagenes();
  const cat = crearCatalogoArte({ crearImagen, aviso: () => {} });
  const ruta = rutaFondoEscena('taqueria');
  cat.precargar([ruta]);
  const escena = {
    fondo: { ruta: 'senku/v2/assets/fondos/taqueria.webp' },
    plataformas: [{ tipo: 'suelo', x: 0, y: 620, w: 1280, h: 100 }],
  };

  const ctxSin = ctxFalso();
  renderizarEscena({ ctx: ctxSin, escena, catalogoArte: cat, rutaFondo: ruta });
  assert.ok(ctxSin.llamadas.some((l) => l[0] === 'fillRect'), 'respaldo plano mientras carga');
  assert.ok(!ctxSin.llamadas.some((l) => l[0] === 'drawImage'));

  creadas[0].onload();
  const ctxCon = ctxFalso();
  renderizarEscena({ ctx: ctxCon, escena, catalogoArte: cat, rutaFondo: ruta });
  const fondo = ctxCon.llamadas.find((l) => l[0] === 'drawImage');
  assert.deepEqual(fondo.slice(2), [0, 0, 1280, 720], 'fondo 16:9 a lienzo lógico sin deformar');
  assert.ok(!ctxCon.llamadas.some((l) => l[0] === 'fillRect'), 'sin rectángulos de suelo');
});
