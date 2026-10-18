# Vaisgard RPG: entrega de arte #731 — 2026-10-17

Base de trabajo: `origin/main` 327da044c02aaaca556c7620d67e6a33d7f576d7.
Rama: `codex/vaisgard-rpg-arte`. Cambios sin commit, publicación ni despliegue.

## Inventario propio

Generado mediante la herramienta integrada imagegen; sin dependencias nuevas.
PNG RGBA para actores, WebP RGB para fondos; los hashes corresponden a los archivos finales.
El identificador de cada fondo coincide con la sala real; `edran_battle` es sólo presentación.
`lina` representa `edran_lina`; `espinajo` y `espinajo-battle`, `espinajo_rastrojo`.
`avatar` representa al jugador como figura de presentación del piloto, sin añadir canon de especie/clase.

| asset_id / archivo en client-rpg | Dimensiones | Bytes | SHA-256 |
|---|---|---:|---|
| `backgrounds/edran_acequia.webp` | 1280×960 | 248218 | `89f97792302ce1622bf6dcaaaf1882468a9775da2838a6579196e2d26da53417` |
| `backgrounds/edran_battle.webp` | 1280×960 | 231376 | `0956b0508983dd2bf602d6194cd3773b690c50bb1ce111437cf2d15908fc066b` |
| `backgrounds/edran_salida_huertos.webp` | 1280×960 | 236104 | `3cf82de4ecf1c18e8ab36a32684dcd4a13d59d720631705153d88bfa06858d6e` |
| `backgrounds/edran_surcos.webp` | 1280×960 | 230340 | `118945e9545ea902d8f09e9e92bb43bd7e26c9dc259c1dd2526caf4ca082762c` |
| `sprites/avatar.png` | 192×384 | 101921 | `2b302dce0d1b492909bf8025b24df9a95166462c40d6b6bd05ca708a7d2ca0ef` |
| `sprites/lina.png` | 192×384 | 96149 | `eb0723ec96be3093847c5aff817885f24e3bc15e9bf3588d0be8c5f6e71a22eb` |
| `sprites/espinajo.png` | 48×48 | 5313 | `26bf59af8cfa729d0442361b9206fdf877f1c31f26d093a0f4dbf626e76e6bcd` |
| `sprites/espinajo-battle.png` | 192×192 | 75222 | `fd0ff04305c8243ad22280b76f76767d44ea1cfefc8657935f17b93a9ea26074` |

## Decisiones y briefs finales

Pixel art moderno de vista superior 3/4, textura rica, luz cálida superior izquierda,
materiales de madera, piedra y tierra, verdes oliva y ocres acordes con las referencias
anime de Edran. Composición sobre cuadrícula 20×15, sin horizonte ni actores pintados
sobre el fondo. Huertos con cercas bajas y verduras; acequia con agua turquesa, losa
ancha de piedra y hojas junto a la abertura; surcos cosechados de tallos bajos. El fondo
de batalla usa perspectiva profunda del mismo campo, sin plataformas geométricas.

Avatar: pelo castaño, túnica azul petróleo, bufanda ocre, mochila y botas de cuero.
Lina: pelo recogido, blusa crema, chaleco teja y falda oliva. Espinajo: cuadrúpedo
compacto marrón con defensa de espinas de rastrojo, mirada ámbar, sin rasgos humanoides.
Sprites originales normalizados por celda, pie común y transparencia; poses laterales
reflejadas cuando la generación miraba al sentido opuesto. Avatar y Lina tienen tres
poses por dirección; Lina permanece en la posición de escena definida, sin añadir IA.

Las colisiones de la acequia incluyen el agua y ambas orillas (columnas 13–16), salvo
la losa (filas 6–7). Cercas exteriores y aperturas mantienen todas las salidas accesibles;
la abertura superior del huerto se representa también en colisión, sin añadir una salida.
Los ids y posiciones explícitas de spawn, NPC y criaturas, y rectángulos de salida,
se conservan. La posición visual de reserva de criaturas sin marca de escena pasa de
columna 14 a 12, para evitar el agua; no cambia presencia ni acciones del servidor.
La capa `foreground` está implementada y probada; estas tres salas no necesitan capas altas.
Los tiles CC0 existentes se conservan para salas genéricas y fallback (ver CREDITOS.md).

## Validación

- Suite solicitada: 313 pruebas en 132,184 s, OK, una omitida.
- `node scripts/check-rpg-client.mjs`: OK, incluidas orden de fondo/actores/frente,
  celdas 64×96, fallback de 300 tiles y restricción de rutas.
- `npm run check:client`, `node --check client-rpg/rpg.js`, `git diff --check`: OK.
- Pruebas de escenas: conversión Tiled de ida/vuelta preserva ambos campos;
  recorrido de celdas confirma acceso a salidas, spawns y posiciones explícitas.
- QA con `codex-browser`, servidor desechable `scripts/qa-rpg-battle.py`, sin datos reales:
  tres salas y batalla, escritorio 1366×768 y móvil 390×844; ocho capturas revisadas.
  Movimiento sobre la acequia: fila 5 se detiene en x=12,764; fila 7 cruza hasta x=17,78.
  Chrome reportó la pestaña oculta durante parte de la revisión: se llamó a `draw`
  explícitamente en QA para inspeccionar el render y simular los pasos, sin cambiar el cliente.

## Entrega externa y límites

El sandbox sólo permite escribir en este worktree y `/tmp`; no permite la carpeta
`/home/jdiaz/proyectos/entregas/equipo/`. Capturas y hoja 3D se preparan en
`/tmp/vaisgard-rpg-delivery/`, fuera del repositorio. El traslado a la ruta solicitada
queda pendiente para el arquitecto: `bash /tmp/vaisgard-rpg-delivery/entregar.sh`.
El script conserva archivos existentes (`cp -n`); revisar colisiones de nombres si las hubiera.

`impresion-3d/vaisgard-rpg-avatar/`: turnaround anime de frente/perfil izquierdo/espalda/
tres cuartos, mismo vestuario y colores, ojos verde azulado, formas gruesas, fondo blanco,
sin texto ni sombras proyectadas; además cuatro vistas individuales de 1024×1024.
La hoja es una referencia para modelado, no un modelo 3D validado para fabricación.

No se probó hardware Raspberry ni producción. La interfaz de escritorio conserva el
scroll previo para controles de combate bajo el pliegue de 768 px; no se modificó CSS.
No se tocaron motor, contenido, cliente MUD, portal, Senku ni VT1. Próximo consumidor:
arquitecto/Javier, revisión visual, traslado externo y commit; sin autorización de push/deploy.

El Salteador veterano que puede ofrecer la partida aislada conserva el símbolo `?`
del piloto: no se creó arte para criaturas fuera del Espinajo encargado.

## Edran Campos 01 — 2026-10-17

Extensión del piloto con seis salas: estanque, lindero, parcela vieja, zanja seca, hondonada húmeda y sauces. Canon: `content/regions/edran.json` de `8b62492`; referencias visuales: `client/art/places/<id>-anime-v1.webp`. Fondos originales generados con imagegen integrado, sin actores incorporados, conservando vista superior 3/4, luz superior izquierda y paleta oliva/ocre. Geometría final y QA en [RPG_EDRAN_CAMPOS_01.md](RPG_EDRAN_CAMPOS_01.md).

| Archivo en client-rpg | Dimensiones | Bytes | SHA-256 |
|---|---|---:|---|
| `backgrounds/edran_bajo_humedo.webp` | 1280×960 | 213612 | `6772468ee5eda6751e2f6169d0eeec14e3ab1d8b5566bc2b3695b1f074afaea7` |
| `backgrounds/edran_estanque.webp` | 1280×960 | 232790 | `ed7c455c359a128448f1cffde5d913f6d8eeb150a4c0e2dd6c2d77adfd0113e2` |
| `backgrounds/edran_lindero.webp` | 1280×960 | 244538 | `db60b0f964dfed7ed9f8de3042603492f825ba7bed1dfb73da4b3692dd419c0d` |
| `backgrounds/edran_parcela_vieja.webp` | 1280×960 | 239454 | `9904cea70697b7001fef037979274d5c9a4257d52245d004ab37e43b3d53beb7` |
| `backgrounds/edran_sauces.webp` | 1280×960 | 223154 | `03d62a347ffa25af62c1b6408098d6c475e8f7ea35541c088237de9a4bc3f89c` |
| `backgrounds/edran_zanja_antigua.webp` | 1280×960 | 218482 | `57f0dcaf3c5d6ef3f4d115da894a228fbe4161fe4ea08aa89acd9108ab9f8dcc` |
| `sprites/cornalomo-battle.png` | 192×192 | 32339 | `cd74bfb8306fcdb96f12e075c6aa95b5010ca92490b5c48267a6fe704077ad5b` |
| `sprites/cornalomo.png` | 48×48 | 2052 | `ad76e92d98400491fd02de8d4d28bd9156ad763d9ad89a700b81499238eba4cb` |
| `sprites/mordelinde-battle.png` | 192×192 | 29486 | `7ec90eb3ec9554b05b2e6fccac0b5b611aa64d9bf37fdcd5488b4c0e72432851` |
| `sprites/mordelinde.png` | 48×48 | 1707 | `772a2f82304a602e79789c603010c83cbfb17a0ed31ef9c77cb4c91f0afa8b63` |
| `sprites/salteador-battle.png` | 192×192 | 30917 | `35e8a5fe3210461ec98b381744c7ae3fac4d87fad9f27506bb0a914d2bfd04ad` |
| `sprites/salteador.png` | 48×48 | 1728 | `dc704f3f2f7cc62cc26f12ca3bfdbe505b8ef4e248c9761baec24b2634d913aa` |

Mordelinde y Cornalomo conservan la anatomía de sus referencias de bestiario MUD. La salteadora sigue la descripción específica de `salteador_veterano` en `content/world.json`: mujer de pelo gris con cota cuidada y espada corta; la ilustración MUD genérica de un forajido varón con garrote no representa esa descripción. No se modifica el canon ni la referencia MUD.

Los atlas originales tienen dos vistas con transparencia real: mapa superior y batalla 3/4. Se separan y normalizan a PNG RGBA de 48×48 y 192×192, respectivamente. El cliente asigna arte a los cuatro IDs conocidos y mantiene el símbolo de reserva para criaturas sin sprite. La existencia del arte no revela ninguna criatura: su presencia procede únicamente de las acciones o el combate del snapshot. No se añaden NPC, acciones, recompensas, fórmulas ni balance.

## Piloto de nueva dirección visual — 2026-10-17

Las tres referencias conceptuales de Javier sustituyen el objetivo visual anterior por fantasía luminosa con interfaz azul y oro. `client-rpg/PRODUCT.md` y `DESIGN.md` documentan el alcance. Los fondos `ui_title.webp` (vertical) y `ui_title_wide.webp` (horizontal) representan una vista ilustrativa rural de Edran; `ui_battle.webp` es un claro de bosque sin actores. Son imágenes originales de imagegen, sin texto o controles incorporados. No definen salas, edificios o mecánicas nuevas. Se conserva la relación de aspecto; el recorte depende del viewport. Estas láminas de interfaz se cargan de forma independiente de los fondos navegables de sala, cuyo límite sigue siendo250000 bytes.

`sprites/avatar-battle.png` añade una pose de combate de512×512 con transparencia real: conserva pelo castaño, túnica azul petróleo, mangas crema, bufanda ocre, mochila, guantes y botas marrones. No añade arma o equipo. La referencia anime de impresión3D asociada sigue fuera del repositorio en `entregas/equipo/impresion-3d/vaisgard-rpg-avatar/vaisgard-rpg-avatar-3d-turnaround.png`, con sus cuatro vistas individuales. La hoja existente se utilizó expresamente para preservar identidad y vestuario de esta pose.

Los prompts exactos y originales se conservan en `entregas/equipo/rpg-visual-piloto/arte/`. El PNG incluye el prompt en metadatos; cada WebP incluye sidecar de procedencia `.webp.json`. La tipografía de títulos es Cinzel, obtenida del repositorio oficial Google Fonts y alojada localmente en `client-rpg/fonts/cinzel.ttf`; su licencia SIL OFL acompaña el archivo en `fonts/OFL.txt`. No se requieren fuentes o scripts remotos en ejecución.

La generación de arte no prueba la interfaz: los resultados de integración y QA se documentarán con la entrega del piloto, sin atribuirle las pruebas de la base anterior.

El marco `sprites/ui-frame.png` es un borde ornamental original con transparencia, reutilizado mediante nine-slice. El piloto añade aproximadamente1,6MB de recursos de ejecución y1,4MB de capturas documentales. Resultados y límites de pruebas: [RPG_VISUAL_PILOTO.md](RPG_VISUAL_PILOTO.md).
## Valdren01 — candidato integrado, 2026-10-18

Seis fondos originales de plaza, huertos, graneros, patio de carros, cobertizo y pozo se preparan para integración. Conservan las referencias de lugares del cliente MUD, reinterpretadas en vista superior3/4, sin actores incorporados. Todos1280×960 y≤250000bytes, cuadrícula visual640×480 ampliada2×, compresión WebP ajustada por archivo. Prompts exactos y originales externos en `entregas/equipo/rpg-valdren-01/arte/`; sidecars de procedencia acompañan los WebP.

El único NPC del lote es `edran_bren`, cuidador de carros del cobertizo. `sprites/bren.png` es una hoja192×384 RGBA con12celdas64×96 y cuatro direcciones; gorra oscura, mangas crema y delantal de trabajo marrón distinguen su interpretación visual del avatar y Lina. No añade datos de personaje, armas, acciones, actividades o recompensas. No representa jugador, Vaisork o Númen y no requiere nueva hoja de impresión3D.

Huertos recibió una edición nativa para añadir el espantapájaros descrito en el canon dentro de su parcela cerrada, conservando caminos y salidas. El fondo final pesa248088bytes y su sidecar conserva el prompt de edición. Escenas, Tiled y mapeo de Bren están integrados localmente sobre el piloto7226843. Recorridos, capturas, pruebas y límites en [RPG_VALDREN_01.md](RPG_VALDREN_01.md). No constituye integración a main o despliegue; el piloto PR742 y esta iteración siguen sujetos al OK del propietario.
