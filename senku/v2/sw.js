// Service Worker para Senku 2 — Caché offline versionado y soporte PWA
// Versión actual de la caché
const VERSION_CACHE = 'senku2-v16';

// Recursos esenciales que forman la base del juego para jugar sin conexión
const RECURSOS_PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/main.mjs',
  './bonus-camion.html',
  './src/bonus_camion.mjs',
  './bonus-camioneta.html',
  './src/bonus_camioneta.mjs',
  './src/core/store.mjs',
  './src/core/almacen.mjs',
  './src/core/migracion.mjs',
  './src/core/entrada.mjs',
  './src/core/fisica.mjs',
  './src/core/combate.mjs',
  './src/core/botiquin.mjs',
  './src/core/enemigos.mjs',
  './src/core/escenas.mjs',
  './src/core/trajes_activo.mjs',
  './src/core/anclador.mjs',
  './src/core/movilidad.mjs',
  './src/core/garras.mjs',
  './src/core/resumen.mjs',
  './src/core/economia.mjs',
  './src/core/jefe_gato.mjs',
  './src/core/lanzador.mjs',
  './src/data/trajes.mjs',
  './src/data/escenas/despenadero.mjs',
  './src/data/escenas/cima.mjs',
  './src/render/despenadero.mjs',
  './src/render/cima.mjs',
  './src/audio/musica.mjs',
  './src/ui/portada.mjs',
  './src/ui/final.mjs',
  './src/data/enemigos.mjs',
  './src/data/botiquines.mjs',
  './src/data/escenas/ciudad.mjs',
  './src/data/escenas/taqueria.mjs',
  './src/data/escenas/desierto.mjs',
  './src/data/escenas/reja.mjs',
  './src/render/canvas.mjs',
  './src/render/sprites.mjs',
  './src/ui/menu.mjs',
  './src/ui/menu_modelo.mjs',
  './src/ui/menu.css',
  // Arte de Matías (fondos, hojas de sprites, objetos y retratos del menú).
  // Las ilustraciones por tramo (assets/escenas/*) y el jefe no se precachean: el fetch de abajo
  // las guarda al pedirlas, así sólo se descarga lo que se juega y lo ya visto funciona sin red.
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
  './assets/portada/portada.webp',
  './assets/personajes/menu_rata.webp',
  './assets/personajes/sprite_original.png',
  './assets/bonus/cable-chispa.webp',
  './assets/bonus/camion-carga.webp',
  './assets/bonus/camioneta-equipaje.webp',
  './assets/bonus/ciudad-cercana.webp',
  './assets/bonus/ciudad-lejana.webp',
  './assets/bonus/desierto-cercano.webp',
  './assets/bonus/desierto-lejano.webp',
  './assets/bonus/letrero-alto.webp',
  './assets/bonus/piedras.webp',
  './assets/bonus/rama-jacaranda.webp',
  './assets/bonus/saguaro.webp',
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
              return caches.match('./index.html').then((r) => r || caches.match('./'));
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
