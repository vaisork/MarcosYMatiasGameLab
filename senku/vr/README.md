# Senku VR (prototipo)

Juego WebXR para Meta Quest: eres Senku, una gatita que lanza sus garras para
columpiarse por una ciudad del desierto y juntar churus contra el reloj.

## Jugar en el Quest

1. En el visor, abre el **navegador del Meta Quest**.
2. Entra a <https://vaisork.github.io/MarcosYMatiasGameLab/senku/vr/>.
3. Pulsa **Entrar en VR**.

Gatillo: lanzar garra (mantener = columpiarse, soltar = salir volando).
Agarre: tirón rápido. Palanca izquierda: caminar; derecha: girar (30° por
pasos en modo cómodo, suave si se apaga). A/X: saltar. B/Y: menú de garras
(apuntar con el rayo y elegir con el gatillo; el juego y el reloj se pausan).
**Impulso con el brazo:** con la garra enganchada, jalar el control rápido
hacia ti/atrás te impulsa por la cuerda hacia el ancla (vibra un poco).

Sin visor: clic izquierdo/derecho = garras, Q/E = tirón, F o rueda = jalar
(impulso), M = menú, WASD, espacio, ratón para mirar (en celular hay botones
táctiles «Jalar» y «≡»).

## Versión 2 (pedidos de Matías)

- Impulso con el brazo («arm-pump»): `impulsoBrazo()` en `fisica.mjs`. Velocidad
  de la mano = cambio del grip relativo al rig (sin el vuelo del cuerpo) en
  orientación de mundo; solo cuenta lo que se aleja del ancla. Umbral 1.2 m/s,
  ganancia 9, tope 26 m/s², manos a más de 12 m/s se ignoran (`IMPULSO`).
- Menú de garras (todo gratis): cuerda normal, telaraña, cadena, estambre y
  rayo láser (cada una con su sonido); pata Senku, naranja, negra, robot y tigre.
  Se guarda en `localStorage` (`senku_vr_garras`). Catálogo y dibujos en `src/estilos.js`.
- Comodidad: viñeta más fuerte por defecto y también al impulsarse; «modo
  cómodo» (viñeta fuerte + giro por pasos) activado por defecto.

## Técnica

- Three.js 0.170.0 desde jsDelivr (importmap), sin build.
- `src/fisica.mjs`: física pura (cuerda-péndulo, gravedad, azoteas), sin Three.
- `src/mundo.js`: ciudad instanciada; `src/sonido.js`: sonidos Web Audio;
  `src/estilos.js`: cuerdas, patas y sus dibujos (menú y texturas).
- Churu: `../v2/assets/objetos/churu.png`. Récord en `localStorage` (`senku_vr_record`).
- Pruebas: `node --test senku/vr/tests/*.test.mjs`.
