# Volando con Vaisork

Juego web de vuelo en traje de ardilla por la Barranca del Cobre. Sirve desde la raíz del repositorio con `python3 -m http.server 8000`; abre `/volando/`.

## Controles

- **Meta Quest 3:** manos a la altura de hombros para planear; abajo y al frente para picar; arriba para levantar. Diferencia de altura entre manos para girar. Palancas: Y adelante para picar y X para girar. Gatillo da impulso.
- **Celular:** al tocar **Volar** se calibra la postura actual; inclinar el teléfono hacia adelante baja y girarlo vira. **Saltar** da impulso vertical.
- **Computadora:** S/↓ baja, W/↑ sube, A/D/←/→ giran. Mouse abajo baja y arriba sube, con o sin clic; teclas y mouse se suman.

En neutro el vuelo desciende cerca de 3:1; picar acelera hasta 85 m/s y levantar frena hasta 25 m/s. Volar a menos de 60 m del terreno aumenta el puntaje hasta ×2. La física y los mapeos puros están en `fisica.mjs`, con pruebas focales en `tests/`. El generador `herramientas/crear-terreno.py` usa Pillow ya disponible y las fuentes locales autorizadas; no descarga datos. Heightmap final: 512×768 muestras Terrarium a 38 m/píxel, alturas ×1.2. Malla: 256×384 vértices (195,330 triángulos), sin sombras dinámicas.

## Fuentes

- Alturas Terrarium z12 de Barranca del Cobre/Urique. Fórmula: `R*256 + G + B/256 - 32768`; atribución del proveedor: [Tilezen terrain tiles](https://github.com/tilezen/joerd/blob/master/docs/attribution.md).
- Cielo y texturas de roca Poly Haven, CC0; las copias WebP quedan en `assets/`.

Three.js 0.170.0 se importa por CDN, igual que Senku VR.
