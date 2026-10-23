import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { registrarServiceWorker } from '../src/main.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUTA_V2 = path.resolve(__dirname, '..');
const RUTA_MANIFEST = path.join(RUTA_V2, 'manifest.webmanifest');
const RUTA_SW = path.join(RUTA_V2, 'sw.js');
const RUTA_INDEX = path.join(RUTA_V2, 'index.html');

const require = createRequire(import.meta.url);
const {
  VERSION_CACHE,
  RECURSOS_PRECACHE,
  filtrarCachesAntiguos,
  esPeticionCacheable,
} = require(RUTA_SW);

test('manifest.webmanifest: formato JSON válido y configuración de pantalla completa horizontal', () => {
  assert.ok(fs.existsSync(RUTA_MANIFEST), 'El archivo manifest.webmanifest debe existir');
  const contenido = fs.readFileSync(RUTA_MANIFEST, 'utf-8');
  const manifest = JSON.parse(contenido);

  assert.equal(manifest.name, 'Senku 2');
  assert.equal(manifest.short_name, 'Senku 2');
  assert.equal(manifest.display, 'fullscreen');
  assert.ok(Array.isArray(manifest.display_override), 'display_override debe ser un arreglo');
  assert.ok(manifest.display_override.includes('fullscreen'), 'display_override debe incluir fullscreen');
  assert.ok(manifest.display_override.includes('standalone'), 'display_override debe incluir standalone');
  assert.equal(manifest.orientation, 'landscape');
  assert.equal(manifest.start_url, './index.html');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.background_color, '#1a1614');
  assert.equal(manifest.theme_color, '#1a1614');

  // Íconos existentes referenciados
  assert.ok(Array.isArray(manifest.icons), 'icons debe ser un arreglo');
  assert.ok(manifest.icons.length >= 1, 'debe contener al menos un ícono');
  for (const icono of manifest.icons) {
    assert.ok(typeof icono.src === 'string' && icono.src.length > 0);
    assert.ok(typeof icono.sizes === 'string' && icono.sizes.length > 0);
    assert.ok(typeof icono.type === 'string' && icono.type.length > 0);

    // Verificar que el archivo referenciado en disco realmente exista
    const rutaIcono = path.resolve(RUTA_V2, icono.src);
    assert.ok(fs.existsSync(rutaIcono), `El archivo de ícono referenciado (${icono.src}) debe existir en ${rutaIcono}`);
  }
});

test('index.html: metadatos PWA para iOS/Android y soporte de Notch / Safe-Area', () => {
  assert.ok(fs.existsSync(RUTA_INDEX), 'El archivo index.html debe existir');
  const html = fs.readFileSync(RUTA_INDEX, 'utf-8');

  // Metadatos iOS
  assert.match(html, /<meta\s+name=["']apple-mobile-web-app-capable["']\s+content=["']yes["']>/i);
  assert.match(html, /<meta\s+name=["']apple-mobile-web-app-status-bar-style["']\s+content=["']black-translucent["']>/i);
  assert.match(html, /<meta\s+name=["']apple-mobile-web-app-title["']\s+content=["']Senku 2["']>/i);
  assert.match(html, /<link\s+rel=["']apple-touch-icon["']/i);

  // Manifest y viewport
  assert.match(html, /<link\s+rel=["']manifest["']\s+href=["']\.\/manifest\.webmanifest["']>/i);
  assert.match(html, /viewport-fit=cover/i);

  // Safe area insets (notch) en CSS
  assert.match(html, /safe-area-inset-top/i);
  assert.match(html, /safe-area-inset-bottom/i);
  assert.match(html, /safe-area-inset-left/i);
  assert.match(html, /safe-area-inset-right/i);
  assert.match(html, /100dvh/i, 'Debe incluir 100dvh para alturas móviles dinámicas');
});

test('sw.js: versión de caché y recursos precacheados declarados', () => {
  assert.ok(fs.existsSync(RUTA_SW), 'El archivo sw.js debe existir');
  assert.match(VERSION_CACHE, /^senku2-v\d+$/, 'La versión de caché debe seguir el formato senku2-vN');
  assert.ok(Array.isArray(RECURSOS_PRECACHE), 'RECURSOS_PRECACHE debe ser una lista');

  // Recursos críticos presentes
  const recursosEsperados = [
    './',
    './index.html',
    './manifest.webmanifest',
    './src/main.mjs',
    './src/core/store.mjs',
    './src/core/migracion.mjs',
    './src/core/entrada.mjs',
    './src/core/fisica.mjs',
    './src/core/combate.mjs',
    './src/core/enemigos.mjs',
    './src/core/escenas.mjs',
    './src/core/trajes_activo.mjs',
    './src/render/canvas.mjs',
  ];

  for (const recurso of recursosEsperados) {
    assert.ok(RECURSOS_PRECACHE.includes(recurso), `Debe precachear ${recurso}`);
  }
});

test('sw.js: filtrarCachesAntiguos purga solo cachés de Senku 2 obsoletos', () => {
  const claves = [
    'senku2-v0',
    'senku2-v1',
    'senku2-v2',
    'otra-app-v1',
    'cache-sistema',
  ];

  const resultado = filtrarCachesAntiguos(claves, 'senku2-v2');
  assert.deepEqual(resultado, ['senku2-v0', 'senku2-v1']);

  // Con lista vacía o valores inválidos
  assert.deepEqual(filtrarCachesAntiguos([]), []);
  assert.deepEqual(filtrarCachesAntiguos(null), []);
});

test('sw.js: esPeticionCacheable valida peticiones GET legítimas', () => {
  assert.equal(esPeticionCacheable({ method: 'GET', url: 'https://ejemplo.com/juego' }), true);
  assert.equal(esPeticionCacheable({ method: 'GET', url: './src/main.mjs' }), true);
  assert.equal(esPeticionCacheable({ method: 'POST', url: 'https://ejemplo.com/api' }), false);
  assert.equal(esPeticionCacheable({ method: 'PUT', url: 'https://ejemplo.com/api' }), false);
  assert.equal(esPeticionCacheable({ method: 'GET', url: 'chrome-extension://abc/script.js' }), false);
  assert.equal(esPeticionCacheable(null), false);
});

test('sw.js: simulación de ciclo de vida en ServiceWorkerGlobalScope (install, activate, fetch)', async () => {
  const codigoSw = fs.readFileSync(RUTA_SW, 'utf-8');

  // Mocks de entorno Service Worker
  const listeners = {};
  const cacheMock = {
    recursosGuardados: [],
    putRequests: [],
    addAll(lista) {
      this.recursosGuardados.push(...lista);
      return Promise.resolve();
    },
    add(url) {
      this.recursosGuardados.push(url);
      return Promise.resolve();
    },
    put(req, res) {
      this.putRequests.push({ req, res });
      return Promise.resolve();
    },
  };

  const cachesEliminados = [];
  const cachesKeys = ['senku2-v0', 'senku2-v1', 'ajeno-cache'];

  const cachesMock = {
    open(nombre) {
      return Promise.resolve(cacheMock);
    },
    keys() {
      return Promise.resolve(cachesKeys);
    },
    delete(clave) {
      cachesEliminados.push(clave);
      return Promise.resolve(true);
    },
    match(req) {
      if (req.url === './index.html' || req === './index.html') {
        return Promise.resolve({ ok: true, status: 200, texto: 'html_cacheado' });
      }
      return Promise.resolve(null);
    },
  };

  let skipWaitingInvocado = false;
  let clientsClaimInvocado = false;

  const mockSelf = {
    addEventListener(tipo, fn) {
      listeners[tipo] = fn;
    },
    skipWaiting() {
      skipWaitingInvocado = true;
      return Promise.resolve();
    },
    clients: {
      claim() {
        clientsClaimInvocado = true;
        return Promise.resolve();
      },
    },
    caches: cachesMock,
  };

  const contexto = vm.createContext({
    self: mockSelf,
    caches: cachesMock,
    fetch: (req) => Promise.resolve({
      status: 200,
      clone() { return this; },
    }),
    module: { exports: {} },
  });

  // Ejecutar el script del Service Worker dentro del sandbox
  vm.runInContext(codigoSw, contexto);

  assert.ok(listeners.install, 'Debe registrar listener de install');
  assert.ok(listeners.activate, 'Debe registrar listener de activate');
  assert.ok(listeners.fetch, 'Debe registrar listener de fetch');

  // 1. Simular evento install
  let promesaWaitUntil = null;
  const eventoInstall = {
    waitUntil(promesa) {
      promesaWaitUntil = promesa;
    },
  };
  listeners.install(eventoInstall);
  await promesaWaitUntil;
  assert.ok(cacheMock.recursosGuardados.length > 0, 'Install debe precachear recursos');
  assert.ok(skipWaitingInvocado, 'Install debe invocar skipWaiting');

  // 2. Simular evento activate
  let promesaActivate = null;
  const eventoActivate = {
    waitUntil(promesa) {
      promesaActivate = promesa;
    },
  };
  listeners.activate(eventoActivate);
  await promesaActivate;
  assert.deepEqual(cachesEliminados, ['senku2-v0'], 'Activate debe purgar caches obsoletos');
  assert.ok(clientsClaimInvocado, 'Activate debe invocar clients.claim');

  // 3. Simular evento fetch (cache hit)
  let respondWithPromesa = null;
  const eventoFetchHit = {
    request: { method: 'GET', url: './index.html' },
    respondWith(promesa) {
      respondWithPromesa = promesa;
    },
  };
  listeners.fetch(eventoFetchHit);
  const respHit = await respondWithPromesa;
  assert.equal(respHit.texto, 'html_cacheado');
});

test('registrarServiceWorker: tolera ausencia de API, registra con éxito o captura errores sin lanzar', async () => {
  // Caso 1: navegador sin soporte
  const sinSoporte = await registrarServiceWorker(null);
  assert.equal(sinSoporte.registrado, false);
  assert.equal(sinSoporte.motivo, 'no_soportado');

  const sinApi = await registrarServiceWorker({});
  assert.equal(sinApi.registrado, false);
  assert.equal(sinApi.motivo, 'no_soportado');

  // Caso 2: registro exitoso
  let rutaRegistrada = null;
  const mockNavExito = {
    serviceWorker: {
      register(ruta) {
        rutaRegistrada = ruta;
        return Promise.resolve({ scope: './' });
      },
    },
  };
  const exito = await registrarServiceWorker(mockNavExito);
  assert.equal(exito.registrado, true);
  assert.equal(rutaRegistrada, './sw.js');
  assert.equal(exito.registro.scope, './');

  // Caso 3: rechazo (p. ej. file:// o permiso denegado)
  const mockNavFallo = {
    serviceWorker: {
      register() {
        return Promise.reject(new Error('SecurityError: file:// unsupported'));
      },
    },
  };
  const fallo = await registrarServiceWorker(mockNavFallo);
  assert.equal(fallo.registrado, false);
  assert.match(fallo.error.message, /SecurityError/);
});
