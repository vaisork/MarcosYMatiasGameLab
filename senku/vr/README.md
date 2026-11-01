# Senku VR (prototipo)

Juego WebXR para Meta Quest: eres Senku, una gatita que lanza sus garras para
columpiarse por una ciudad del desierto y juntar churus contra el reloj.

## Jugar en el Quest

1. En el visor, abre el **navegador del Meta Quest**.
2. Entra a <https://vaisork.github.io/MarcosYMatiasGameLab/senku/vr/>.
3. Pulsa **Entrar en VR**.

Palanca izquierda: caminar; derecha: girar (30° por pasos, configurable en el
menú; suave si se apaga). La viñeta anti-mareo al moverte rápido también se
puede activar o desactivar por separado y se guarda. Gatillo: lanzar garra (mantener = columpiarse, soltar =
salir volando). Agarre: con la garra enganchada, tirón; con la mano en una
pared, escalar; si no, tirón hacia donde apuntas. A/X: saltar. B/Y: menú de
garras (apuntar con el rayo y elegir con el gatillo; el juego y el reloj se
pausan). **Impulso con el brazo:** con la garra enganchada, jalar el control
rápido hacia ti/atrás te impulsa por la cuerda hacia el ancla (vibra un poco).

Sin visor: clic izquierdo/derecho = garras (clic a un ratón cerca = zarpazo),
Q/E = tirón, F o rueda = jalar (impulso, o jalar un ratón atrapado), C = agarrarse
a la pared de enfrente y subir con W, R = Ultra Gato, M = menú, WASD, espacio, ratón para mirar
(en celular hay botones táctiles «Jalar» y «≡»).

## Superpoder «Ultra Gato» (diseñado por Matías, 9 años)

«Te vas balanceando, llenas una barrita derrotando enemigos y disparas ratones.»

- **Barrita** en el HUD de la muñeca izquierda (y en el HUD 2D): negro +1, café
  +2, hámster +3; llena = 6 (tope). Llena brilla y late, suena una campanita y
  sale el aviso «¡ULTRA GATO listo!». Se guarda en `localStorage`
  (`senku_vr_ultra_gato`): no se vacía con el tiempo, al perder los corazones ni
  al salir del juego; solo disparar la gasta. Los ratones que vencen los
  ratoncitos no recargan (para que no sea una cadena sin fin).
- **Disparo**: clic en la palanca derecha (botón 3 del gamepad; zurdas: en
  cualquiera de las dos). Sin visor: **R**; en celular, botón **⚡**. Salen 5
  ratoncitos de cuerda (gris, llave dorada que gira; primitivas low-poly) desde
  la mano hacia adelante en abanico; columpiándose sale 1 de premio. Cada uno
  busca al ratón vivo más cercano a menos de 25 m (giro suave que se cierra con
  el tiempo para no quedarse orbitando) y le da 1 golpe (poof y churus como
  siempre). Los que no encuentran nada vuelan 3 s y acaban en confeti. Sonido
  «¡boing-zzz!» y vibración.
- Nombre en `NOMBRE_PODER` y ajustes en `PODER` (`src/poder.mjs`, lógica pura
  con pruebas en `tests/poder.test.mjs`). Consola: `senku.barra`,
  `senku.poder()`, `senku.ratoncitos`.

## Versión 3 (pedido de Matías): ratones y escalar

- **Ratones** en calles y azoteas (máximo 24 a la vez; al vencer uno reaparece
  otro en 3 s en otro lugar). Negro: 1 golpe, café: 2, hámster (más grande): 3;
  pips rojos sobre la cabeza = golpes que faltan. Persiguen a Senku a menos de
  18 m y en su mismo nivel; el de azotea no se baja, el de calle no entra a
  edificios. Animación procedural: saltitos y balanceo al caminar, giran hacia
  Senku, se aplastan al golpe y «poof» de nube al vencerlos.
- **Atacar**: zarpazo = mano a ≥ 2.5 m/s a menos de 0.9 m del ratón (vibra y
  suena, 0.35 s entre zarpazos). Lanzar la garra a un ratón lo atrapa (se queda
  quieto, la mira se pone roja al apuntarle); jalar la cuerda (agarre, brazo
  hacia ti o F) lo acerca de un brinco y lo golpea. Sin recargas.
- **Vida**: 3 corazones en el HUD de la muñeca. Si un ratón te toca pierdes uno
  (1.5 s de invulnerabilidad y un empujón). Sin corazones vuelves al inicio
  con todos tus churus.
- **Churus**: cada ratón vencido suelta 1/2/3 que vuelan hacia ti y suman al
  total acumulado (`localStorage` `senku_vr_churus_total`, «Total» en el HUD).
  Servirán para desbloquear cosas; todavía no hay tienda.
- **Escalar**: agarre con la mano tocando una pared o borde (a 0.45 m) → el cuerpo se
  mueve al revés del tirón de la mano (`escalar()` en `fisica.mjs`), sin gravedad; con las dos manos se
  promedian. Al soltar sales lanzada al revés de la mano (×1.4, tope 12 m/s).
  Sin visor: C frente a una pared (≤ 2.5 m) te pega a ella; W/S sube y baja,
  A/D de lado, espacio salta hacia atrás; al llegar arriba pisas la azotea.
- Al entrar en VR aparece el aviso «Palanca izquierda: caminar · Agarre en una
  pared: escalar».
- Modelos: `modelos/raton_negro.glb`, `raton_cafe.glb`, `hamster.glb` (Meshy
  desde los sprites de Senku 2, ~9k triángulos y textura JPEG, < 1 MB cada
  uno). Cada GLB se carga una vez; sus clones comparten geometrías y materiales
  Lambert. `SkeletonUtils.clone` conserva esqueletos si un modelo los incluye.
  Apuntar a un ratón usa esferas, no triángulos.
- Lógica pura en `src/enemigos.mjs` (tipos, golpes, persecución, vida, pared,
  escalada) con pruebas en `tests/enemigos.test.mjs`. Para probar sin visor
  desde la consola: `senku.avanzar(dt)` corre un paso aunque la pestaña esté
  oculta; `senku.enemigos`, `senku.vida`, `senku.total()`.

## Versión 2 (pedidos de Matías)

- Impulso con el brazo («arm-pump»): `impulsoBrazo()` en `fisica.mjs`. Velocidad
  de la mano = cambio del grip relativo al rig (sin el vuelo del cuerpo) en
  orientación de mundo; solo cuenta lo que se aleja del ancla. Umbral 1.2 m/s,
  ganancia 9, tope 26 m/s², manos a más de 12 m/s se ignoran (`IMPULSO`).
- Menú de garras (todo gratis): cuerda normal, telaraña, cadena, estambre y
  rayo láser (cada una con su sonido); pata Senku, naranja, negra, robot y tigre.
  Se guarda en `localStorage` (`senku_vr_garras`). Catálogo y dibujos en `src/estilos.js`.
- Comodidad: viñeta más fuerte por defecto y también al impulsarse; giro por
  pasos (30°) activado por defecto. La viñeta se activa por separado desde el
  menú y ambas preferencias se conservan.

## Técnica

- Three.js 0.170.0 desde jsDelivr (importmap), sin build.
- En XR: foveación 0.8, framebuffer 0.85 y sombras dinámicas desactivadas para
  Quest 2. Objetivo de rendimiento: 72 FPS; medidor opcional desde «Garras y
  comodidad».
- `src/fisica.mjs`: física pura (cuerda-péndulo, gravedad, azoteas), sin Three.
- `src/enemigos.mjs`: ratones, vida y escalada (lógica pura, sin Three).
- `src/poder.mjs`: barrita y ratoncitos del Ultra Gato (lógica pura, sin Three).
- `src/mundo.js`: ciudad instanciada; `src/sonido.js`: sonidos Web Audio;
  `src/estilos.js`: cuerdas, patas y sus dibujos (menú y texturas).
- Carteles de ciudad: 20 anuncios en `src/carteles.mjs`, con 14 texturas WebP
  compartidas; placas con volumen, marcos de focos instanciados, tres bandas
  LED, neones, un panel giratorio y un globo publicitario animado. No añaden
  colisiones ni luces dinámicas. Las seis ilustraciones nuevas llevan sus
  rótulos pintados por código al cargarse.
- Churu: `../v2/assets/objetos/churu.png`. Récord en `localStorage` (`senku_vr_record`).
- Pruebas: `node --test senku/vr/tests/*.test.mjs`.
