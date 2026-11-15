# Volando con Vaisork

Juego web de vuelo en traje de ardilla por la Barranca del Cobre. Sirve desde la raíz del repositorio con `python3 -m http.server 8000`; abre `/volando/`.

## Controles

- **Meta Quest 3:** WebXR; brazos abiertos para planear, alabeo con un brazo arriba y otro abajo, ambos al frente para picar.
- **Celular:** inclinación del teléfono para girar y levantar/picar; botón **Saltar** para dar un impulso vertical.
- **Computadora:** WASD o flechas para inclinar y girar; mouse arrastrado para dirigir; espacio para saltar.

La física está en `fisica.mjs` y sus pruebas focales en `tests/`. El generador `herramientas/crear-terreno.py` usa Pillow ya disponible y las fuentes locales autorizadas; no descarga datos. Heightmap final: 512×768 muestras Terrarium a 38 m/píxel, alturas ×1.2. Malla: 256×384 vértices (195,330 triángulos), sin sombras dinámicas.

## Fuentes

- Alturas Terrarium z12 de Barranca del Cobre/Urique. Fórmula: `R*256 + G + B/256 - 32768`; atribución del proveedor: [Tilezen terrain tiles](https://github.com/tilezen/joerd/blob/master/docs/attribution.md).
- Cielo y texturas de roca Poly Haven, CC0; las copias WebP quedan en `assets/`.

Three.js 0.170.0 se importa por CDN, igual que Senku VR.
