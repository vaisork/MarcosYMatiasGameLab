# Senku VR (prototipo)

Juego WebXR para Meta Quest: eres Senku, una gatita que lanza sus garras para
columpiarse por una ciudad del desierto y juntar churus contra el reloj.

## Jugar en el Quest

1. En el visor, abre el **navegador del Meta Quest**.
2. Entra a <https://vaisork.github.io/MarcosYMatiasGameLab/senku/vr/>.
3. Pulsa **Entrar en VR**.

Gatillo: lanzar garra (mantener = columpiarse, soltar = salir volando).
Agarre: tirón rápido. Palanca izquierda: caminar; derecha: girar 30°.
A/X: saltar. B/Y: sombra anti-mareo. Las garras se recargan solas.

Sin visor: clic izquierdo/derecho = garras, Q/E = tirón, WASD, espacio, ratón
para mirar (en celular hay botones táctiles).

## Técnica

- Three.js 0.170.0 desde jsDelivr (importmap), sin build.
- `src/fisica.mjs`: física pura (cuerda-péndulo, gravedad, azoteas), sin Three.
- `src/mundo.js`: ciudad instanciada; `src/sonido.js`: sonidos Web Audio.
- Churu: `../v2/assets/objetos/churu.png`. Récord en `localStorage` (`senku_vr_record`).
- Pruebas: `node --test senku/vr/tests/*.test.mjs`.
