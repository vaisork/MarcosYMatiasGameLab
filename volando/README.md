# Volando con Vaisork

Juego web de vuelo en traje de ardilla por Biokovo (Croacia) y la Barranca del Cobre (México). Sirve desde la raíz del repositorio con `python3 -m http.server 8000`; abre `/volando/`.

## Controles

- **Meta Quest 3:** inclina las manos para girar; inclinar cabeza y cuerpo añade giro suave. Manos abajo y al frente pican; arriba frena/sube. La palanca dirige y el gatillo impulsa.
- **Celular:** al tocar **Volar** se calibra la postura actual; inclinar el teléfono hacia adelante baja y girarlo vira. **Saltar** da impulso vertical.
- **Computadora:** S/↓ baja, W/↑ sube, A/D/←/→ giran. Mouse abajo baja y arriba sube, con o sin clic; teclas y mouse se suman.

En neutro el vuelo crucerea a 55 m/s; picar alcanza 95 m/s y levantar frena hasta 25 m/s. Volar a menos de 25 m del terreno muestra «¡Pegado!» y multiplica puntos hasta ×4. El alabeo manda el giro sin corrección automática del rumbo; el radio a fondo es 75 m.

La física y los mapeos puros están en `fisica.mjs`, con pruebas focales en `tests/`. Biokovo usa altura Terrarium z14 (≈9 m por muestra) en un área de 9.8×12.2 km, con un corredor de vuelo de 800×55 vértices, terreno detallado LOD de 230×270 y fondo z12 de 100×68; terreno combinado: ≈223 mil triángulos. Barranca mantiene su heightmap z12 y recibe el mismo control y vegetación. Ambos usan Lambert, niebla, instancias y sin sombras dinámicas.

Los generadores `herramientas/crear-terreno.py` y `herramientas/crear-biokovo.py` usan Pillow ya disponible y las fuentes locales autorizadas; no descargan datos. Los heightmaps Biokovo nuevos suman 2.9 MB.

## Fuentes

- Alturas Terrarium z12 de Barranca del Cobre/Urique. Fórmula: `R*256 + G + B/256 - 32768`; atribución del proveedor: [Tilezen terrain tiles](https://github.com/tilezen/joerd/blob/master/docs/attribution.md).
- Cielo y texturas de roca Poly Haven, CC0; las copias WebP quedan en `assets/`.

Three.js 0.170.0 se importa por CDN, igual que Senku VR.
