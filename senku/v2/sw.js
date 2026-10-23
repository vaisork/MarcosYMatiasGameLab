// Service Worker para Senku 2 — Caché offline versionado y soporte PWA
// Versión actual de la caché
const VERSION_CACHE = 'senku2-v2';

// Recursos esenciales que forman la base del juego para jugar sin conexión
const RECURSOS_PRECACHE = [
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
  './src/data/enemigos.mjs',
  './src/data/escenas/taqueria.mjs',
  './src/render/canvas.mjs',
  './src/render/sprites.mjs',
  // Arte de Matías (fondos, hojas de sprites, objetos y retratos del menú)
  './assets/enemigos/hamster_cafe.png',
  './assets/enemigos/hamster_negro.png',
  './assets/enemigos/raton_cafe.png',
  './assets/enemigos/raton_negro.png',
  './assets/fondos/camioneta_reja.webp',
  './assets/fondos/desierto.webp',
  './assets/fondos/taqueria_ciudad.webp',
  './assets/fondos/taqueria_desierto.webp',
  './assets/objetos/anclador.png',
  './assets/objetos/botiquin.png',
  './assets/objetos/churu.png',
  './assets/objetos/garras_escalada.png',
  './assets/objetos/lanzador_ratones.png',
  './assets/objetos/raton_proyectil.png',
  './assets/personajes/menu_original.webp',
  './assets/personajes/menu_rata.webp',
  './assets/personajes/sprite_original.png',
  './assets/personajes/sprite_rata.png',
  '../../assets/icon/senku-icon-192.png',
  '../../assets/icon/matiasgamelab-icon-192.png',
];

// Funciones puras de utilidad (probables de forma aislada)
function filtrarCachesAntiguos(claves, versionActual = VERSION_CACHE) {
  if (!Array.isArray(claves)) return [];
  return claves.filter((c) => typeof c === 'string' && c.startsWith('senku2-') && c !== versionActual);
}

function esPeticionCacheable(request) {
  if (!request) return false;
  const metodo = typeof request.method === 'string' ? request.method : 'GET';
  if (metodo !== 'GET') return false;
  const url = typeof request.url === 'string' ? request.url : '';
  if (url.startsWith('chrome-extension://') || url.startsWith('moz-extension://')) return false;
  return true;
}

// Ciclo de vida en el navegador (ServiceWorkerGlobalScope)
if (typeof self !== 'undefined' && typeof self.addEventListener === 'function') {
  // Instalación: precargar recursos críticos
  self.addEventListener('install', (evento) => {
    evento.waitUntil(
      caches.open(VERSION_CACHE)
        .then((cache) => {
          return cache.addAll(RECURSOS_PRECACHE).catch(() => {
            // Tolerante ante recursos opcionales o rutas no servidas en dev
            return Promise.all(
              RECURSOS_PRECACHE.map((url) => cache.add(url).catch(() => null))
            );
          });
        })
        .then(() => self.skipWaiting())
    );
  });

  // Activación: purgar versiones antiguas de caché
  self.addEventListener('activate', (evento) => {
    evento.waitUntil(
      caches.keys()
        .then((claves) => {
          const antiguos = filtrarCachesAntiguos(claves, VERSION_CACHE);
          return Promise.all(antiguos.map((clave) => caches.delete(clave)));
        })
        .then(() => self.clients.claim())
    );
  });

  // Peticiones: Caché primero con actualización en red (Cache-first con fallback)
  self.addEventListener('fetch', (evento) => {
    if (!esPeticionCacheable(evento.request)) return;

    evento.respondWith(
      caches.match(evento.request).then((respuestaCache) => {
        if (respuestaCache) {
          // Si está en caché, devolverlo de inmediato y actualizar en segundo plano si hay red
          fetch(evento.request)
            .then((respuestaRed) => {
              if (respuestaRed && respuestaRed.status === 200) {
                const copia = respuestaRed.clone();
                caches.open(VERSION_CACHE).then((cache) => cache.put(evento.request, copia));
              }
            })
            .catch(() => {});
          return respuestaCache;
        }

        // Si no está en caché, buscar en la red y almacenar
        return fetch(evento.request)
          .then((respuestaRed) => {
            if (!respuestaRed || respuestaRed.status !== 200 || respuestaRed.type === 'opaque') {
              return respuestaRed;
            }
            const copia = respuestaRed.clone();
            caches.open(VERSION_CACHE).then((cache) => cache.put(evento.request, copia));
            return respuestaRed;
          })
          .catch(() => {
            // Si no hay red y es navegación HTML, devolver la página de inicio en caché
            if (evento.request.mode === 'navigate') {
              return caches.match('./index.html') || caches.match('./');
            }
          });
      })
    );
  });
}

// Exportación compatible para Node.js / pruebas unitarias
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VERSION_CACHE,
    RECURSOS_PRECACHE,
    filtrarCachesAntiguos,
    esPeticionCacheable,
  };
}
