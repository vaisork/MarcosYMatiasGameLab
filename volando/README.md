# Volando con Vaisork

Juego web de vuelo en traje de ardilla por Biokovo (Croacia) y la Barranca del Cobre (México). Sirve desde la raíz del repositorio con `python3 -m http.server 8000`; abre `/volando/`.

## Controles

- **Meta Quest 3:** palanca izquierda Y pica/levanta (adelante baja), X alabea; palanca derecha X gira y Y acelera. Gatillo acelera y grip frena. En el menú se puede comparar con mirada o alas; inversión de Y opcional.
- **Celular:** joystick virtual izquierdo dirige y botón derecho acelera. Los modos alternativos suman inclinación del teléfono.
- **Computadora:** W/↑ baja, S/↓ levanta, A/D/←/→ alabean; gamepad usa el mismo mapeo que Quest. Shift frena y espacio impulsa.

En neutro el vuelo desciende a unos 22 m/s; picar llega a −40 m/s verticales y 90 m/s de avance. Cada curso escala el mundo (ESCALA_MUNDO=0.35) y guía por un corredor estrecho con aros cada 300 m. El HUD muestra altura sobre el terreno, velocidad vertical y dirección al próximo aro. Volar a menos de 25 m del terreno muestra «¡Pegado!» y multiplica puntos hasta ×4.

La física y los mapeos puros están en `fisica.mjs`, con pruebas focales en `tests/`. Biokovo usa altura Terrarium z14 (≈9 m por muestra) en un área de 9.8×12.2 km, con un corredor de vuelo de 800×55 vértices, terreno detallado LOD de 230×270 y fondo z12 de 100×68; terreno combinado: ≈223 mil triángulos. Barranca mantiene su heightmap z12 y recibe el mismo control y vegetación. Ambos usan Lambert, niebla, instancias y sin sombras dinámicas.

Los generadores `herramientas/crear-terreno.py` y `herramientas/crear-biokovo.py` usan Pillow ya disponible y las fuentes locales autorizadas; no descargan datos. Los heightmaps Biokovo nuevos suman 2.9 MB.

## Fuentes

- Alturas Terrarium z12 de Barranca del Cobre/Urique. Fórmula: `R*256 + G + B/256 - 32768`; atribución del proveedor: [Tilezen terrain tiles](https://github.com/tilezen/joerd/blob/master/docs/attribution.md).
- Cielo y texturas de roca Poly Haven, CC0; las copias WebP quedan en `assets/`.

Three.js 0.170.0 se importa por CDN, igual que Senku VR.
