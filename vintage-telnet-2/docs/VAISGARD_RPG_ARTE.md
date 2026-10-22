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

## Valdren02 — candidato integrado, 2026-10-18

Seis fondos originales para calle de la fragua, casa de semillas, comedor, casa de cuidados, fragua y patio de ropa. Canon de content/regions/edran.json sin cambios desde8b62492; referenciasMUD de client/art/places/ correspondientes. Vista superior3/4, sin actores pintados; fondos normalizados640×480 ampliados2× y WebP≤250000bytes. Casa de cuidados corrigió una puerta sur ajena al canon; comedor conserva tazas invertidas. Prompts exactos y originales en entregas/equipo/rpg-valdren-02/arte/, sidecars junto a losWebP.

Daro y Elva preservan su aspecto de las ilustracionesMUD: herrero de pelo/barba castaños y delantal de cuero; anfitriona de pañuelo crema y vestido ciruela. Iria y Sena carecen de retrato fijo: trenza cobriza/vestido salvia y moño oscuro/vestido azul son interpretaciones visuales de sus roles, sin añadir datos canónicos. SonNPC, no jugadores/Vaisork/Númenes. Hojas transparentes192×384,12frames64×96, cuatrodirecciones; corregidas dosposes invertidas deElva. El cliente presenta soloNPCqueofreceelestadoautoridativo; no nuevas acciones/mecánicas.

| Recurso en client-rpg | Dimensiones | Bytes | SHA-256 |
|---|---|---:|---|
| `backgrounds/valdren_calle_alta.webp` | 1280×960 | 249002 | `be24fdc2d3d8eb1b19889fa503927298efdce768f827df33040cb8c834358ebf` |
| `backgrounds/valdren_casa_semillas.webp` | 1280×960 | 244878 | `dfda1462dc8f283e8b3021746e4d1655b43f5f7ef0c8f0ce1df629d1cc79c5ff` |
| `backgrounds/valdren_comedor.webp` | 1280×960 | 249600 | `a1aa4aefae439dbf9d43db4aceee1d76e05ff6a504bec2a88d0347dfea5eea96` |
| `backgrounds/valdren_cuidado.webp` | 1280×960 | 248840 | `494f8b3264d8b847dbea3a57d542bbc999800a4e47f4e41da2d944e7e313ba1d` |
| `backgrounds/valdren_fragua.webp` | 1280×960 | 249388 | `7d7e9d0eb0b27ae63e6240d1f1de990822ccaa5587a9c14c45f5f2853e86ec82` |
| `backgrounds/valdren_patio_ropa.webp` | 1280×960 | 246912 | `c99f8b61c358365070dd894b20653e87030eaaae3826714b00ff18b59ba0b0fb` |
| `sprites/daro.png` | 192×384 | 102731 | `7b1bd4147004c3adc72c362a66c93c313e62b41c276c1ff399774b4f5aad61f1` |
| `sprites/elva.png` | 192×384 | 98306 | `9be13bcf7f6dc1028fc7f5f19c77f8a6d040200da40833d10bce3b85e2796d6f` |
| `sprites/iria.png` | 192×384 | 105184 | `8ea08b73ce322644cce5ca380bacc5fabfaf1e519b83969715b51bebb50ad132` |
| `sprites/sena.png` | 192×384 | 103053 | `592b020ea043d8788905033e7719e0470060ba496dbccad3790682025f7cc5fd` |

Las seis escenas y sus fuentesTiled están integradas en el candidato. La revisión corrigió obstáculos omitidos, el ramal curvo O y la puerta interior E; las posiciones deNPC evitan solapes con el relato. Las12capturas finales recibieron revisión visual favorable, con lienzo dimensionado explícitamente durante QA de pestaña oculta. Resultados y límites en [RPG_VALDREN_02.md](RPG_VALDREN_02.md). No constituye integración a main ni despliegue.

## Caminos de Edran01 — recursos preparados, 2026-10-18

Seis fondos originales para senda de regreso, arboleda, cobertizo de estacas, camino de carros, refugio y era. Referencias client/art/places/<id>-anime-v1.webp y canoncontent sin cambios desdee679761. Se conservan curvaU de senda, tresárboles de arboleda, estacas con medidas (sin dibujos secretos), dosrodadas de carros, refugio de dosbancos y era de tierra firme. Era corrigió el ramalO que gira alS. Sin actores incorporados; fondos640×480 ampliados2× y WebP≤250000bytes. Prompts/originales externos entregas/equipo/rpg-edran-caminos-01/arte/, sidecars junto aWebP.

Forajido y Negociante añaden mapa48×48 y batalla192×192 transparentes. El primero conserva persona de capaocre/palocorto de referenciaMUD. La negociante sigue su descripción propia: mujerjoven,sonrisa,cuchillocorto ybolsallena; la referenciaMUDgenérica masculina compartida encontent no representa su identidad. No se modifica esa referencia ni el canon. La veterana gris conserva sus sprites previos. Son adversarios canónicos, no nuevos jugadores/Vaisork/Númenes. Dosvistas originales se recortan por hueco transparente, normalizan proporciones sin deformar ni repintar; boundingbox ignora alfa≤32 solo al elegir el recorte porque originales tenían píxeles casiinvisibles dispersos. Se conserva alfa original dentro de recorte. Solo snapshotofrecido/combate lospresenta.

| Recurso | Dimensiones | Bytes | SHA-256 |
|---|---|---:|---|
| `backgrounds/edran_sendero_regreso.webp` | 1280×960 | 248476 | `b202d3265871abd9d3a64b1997fb6ac863988663f15ff492e23fbca64f4ff7a5` |
| `backgrounds/edran_arboleda.webp` | 1280×960 | 249664 | `3ce9b6e8c29976e53b8ae2d3db99ff7a197099927befa742b887b625bc2815a2` |
| `backgrounds/edran_cobertizo_campo.webp` | 1280×960 | 242684 | `b44b87ce7484a5abb8e29fa7fd0ed8a08bcd84991839ef0e2a6d159e2c3eb2fa` |
| `backgrounds/edran_camino_carros.webp` | 1280×960 | 249602 | `d97b9dd412f70f64eb9f459ac661cea0b96d88c316c94b03689ecc6282f329a4` |
| `backgrounds/edran_reparo.webp` | 1280×960 | 249710 | `4e82ff2b64cb5afd80624678f0118d032698ec9c751fb3d8950a5636b4418de9` |
| `backgrounds/edran_era.webp` | 1280×960 | 248148 | `5e64d8c8a1e524a3e8826d6a484c315664743cd3f24b6412064a60f8dcbf4468` |
| `sprites/forajido.png` | 48×48 | 5216 | `87ecec366cdf9825c5658782546064abba46d5bf2fd922524532c14a04e3a0e1` |
| `sprites/forajido-battle.png` | 192×192 | 45363 | `b3dfea8284db888ecc423876a24a7dcbb6d4fb1ab83aa37573c0e647b42137a0` |
| `sprites/negociante.png` | 48×48 | 5035 | `def093583b390389574b10f2d227ffb57fec9160cc0d20478f5757437f9d23cd` |
| `sprites/negociante-battle.png` | 192×192 | 42369 | `eda8d4157fc1949fe90bbf84d1dc31c70a538e3fc084fc388e96bbe69c7f4743` |

Recursos, mapeo, seis escenas y sus Tiled incorporados al candidato. Navegación y capturas móvil/escritorio verificadas; la negociante se situó en(9,9) para evitar el relato en escritorio. Resultados y límites en [RPG_EDRAN_CAMINOS_01.md](RPG_EDRAN_CAMINOS_01.md). No constituye integración a main ni despliegue.


## Canal de Edran01 — candidato, 2026-10-19

Seis fondos de sala, una variante de la repisa con caja y un fondo interior de combate; dos atlas propios para Nela y Oren. Canon verificado contra la base029bcf8 sin cambios de contenido. Fondos originales de imagegen, reducidos a640×480 y ampliados por vecino más cercano a1280×960, WebP de hasta250000bytes. El fondo de combate ajusta mecánicamente el encuadre a4:3 antes del escalado. Los atlas se normalizan a192×384, doce cuadros de64×96, con escala uniforme por personaje y recortes por cuadro para conservar las proporciones y todas las extremidades. El alfa solo se analiza para elegir recortes; los píxeles originales no se repintan ni se aplica umbral al archivo final.

Nela conserva botas embarradas y tablilla de madera; Oren, ropa de viajero, cordones gastados y venda limpia. Son NPC canónicos, no jugadores/Vaisork/Númenes: no requieren nuevas hojas3D. Los fondos no incluyen actores ni revelan el conducto/anillo ocultos de la repisa. La compuerta conserva una posición para el forajido ya existente, solo visible mediante snapshot.

La repisa base está vacía. La variante con caja se elige mediante background_actions cuando snapshot.actions contiene edran_recoger_caja, incluso si está deshabilitada; al desaparecer esa acción se vuelve al fondo vacío. Selector compartido por escena y minimapa, con fallback durante carga. No crea estado, reglas ni recompensas nuevas.

| Recurso | Dimensiones | Bytes | SHA-256 |
|---|---|---:|---|
| `backgrounds/edran_canal_entrada.webp` | 1280×960 | 205900 | `211b33f771c0b71cd6a93c38363787b81719b3bd1a023275007e027237b55c8a` |
| `backgrounds/edran_canal_herramientas.webp` | 1280×960 | 236848 | `742c36191289a3661779165827067f4a27e62b14fa4f09c7f64c1a352c3c9191` |
| `backgrounds/edran_canal_bifurcacion.webp` | 1280×960 | 242890 | `ebd10479988d334c9064fd721a2f2fd82b59a42ca5bc867157e58ecd8840c7bc` |
| `backgrounds/edran_canal_refugio.webp` | 1280×960 | 240082 | `afd065ef99add2798182b6b79917f24adb7f9feaa527059acd6bd7e14356d84f` |
| `backgrounds/edran_canal_compuerta.webp` | 1280×960 | 183106 | `47991b92ae2b3847396499fa73789a204f869307f556b6cc7734db3500665e5c` |
| `backgrounds/edran_canal_repisa.webp` | 1280×960 | 234810 | `fba2d2ca1187dca88a8a13d21378014d844be5d5f5cabbbce912b9629e5e3dd3` |
| `backgrounds/edran_canal_repisa_caja.webp` | 1280×960 | 222572 | `8878cc2d893ae8db44aaf7189182c473ffbaf41a6900d0d2833064ec3422beaf` |
| `backgrounds/edran_canal_battle.webp` | 1280×960 | 244698 | `291bdd47b505c074ff2bbebed08c23a5c5d25f1bbb108072b5c9b16120989390` |
| `sprites/nela.png` | 192×384 | 98879 | `4d3203dd3f0b6d1f2b615eec39695e8122df6fe13f4eb6cfe5f31cd4ec29f977` |
| `sprites/oren.png` | 192×384 | 82491 | `69d00d9e57ba68d8648bd3c487fcae3c13d2f11cccc7276862ae8af989d31165` |

Prompts, originales, manifiesto y normalización mecánica en entregas/equipo/rpg-edran-canal-01; sidecars de los fondos junto al recurso y prompt embebido en PNG. Revisión visual independiente de diez recursos, cierre de geometría y dieciséis capturas: SHIP. Seis escenas y fuentes Tiled reconciliadas; QA de móvil/escritorio, recogida/devolución/revisita de caja, rodeo canónico y combate interior con reloj real comprobados. Resultados y límites en [RPG_EDRAN_CANAL_01.md](RPG_EDRAN_CANAL_01.md). Este candidato no constituye merge ni despliegue.


## Norte de Edran01 — candidato, 2026-10-21 (CM-12)

Cinco fondos de sala ilustrados, un atlas para Aren y sprites de mapa/combate para Salteador Bravucón. Base de integración `33bf41a`. Fondos WebP normalizados a 1280×960, todos ≤250000 bytes. Atlas de Aren normalizado a 192×384 (doce cuadros de 64×96), escala uniforme, sin tableta opcional y transparencia alfa preservada. Bravucón normalizado a 48×48 en mapa y 192×192 en combate.

| Recurso | Dimensiones | Bytes | SHA-256 |
|---|---|---:|---|
| `backgrounds/edran_terraplen.webp` | 1280×960 | 243592 | `0cc6e54e90be12fde0df767733141923d18f871fe7db91baaa0aed1c6aee6b4b` |
| `backgrounds/edran_casa_camino.webp` | 1280×960 | 243046 | `d2dd2a2c3e02631f1166c2e0a44211291714b3d36784ae4e5afa5750826c015a` |
| `backgrounds/edran_calzada.webp` | 1280×960 | 236726 | `1766b1241188d64a2ab4b9c57f503ed21514040b6087c8b8e1bbd40f300a5531` |
| `backgrounds/edran_hito_campos.webp` | 1280×960 | 240182 | `ae9e2c8d6a8fd900747d39884cb0c6e963ee1ff7d74f686a38739b81ced02230` |
| `backgrounds/edran_vista_cuenca.webp` | 1280×960 | 243158 | `0b8af36aed3b50b0e4f786ba7f834713c27913b623f18ba0092546faa9162889` |
| `sprites/aren.png` | 192×384 | 95916 | `7ddb3434a359b9a9b49d810385ab479f969c53d415f9383b4847b0f26fff688d` |
| `sprites/bravucon.png` | 48×48 | 3150 | `6ea54f068f2a1307d353729515800237f921b6345defc6572a43aa8860a35108` |
| `sprites/bravucon-battle.png` | 192×192 | 40635 | `64a8f9fc9b1ee8e07f401cfb22916f98b4b044ba0eeb50aed5bd5ea579f79002` |

Manifiesto y sidecars individuales en `entregas/equipo/cm-12/arte` y junto a cada asset en `client-rpg/`. Sin alteración de arte ni copias privadas fuera del manifiesto. Estado: INTEGRADO en GitHub main (`aab05d4b`) mediante PR #749 (tras PR #748); no desplegado aún (Raspberry conserva `8b62492` con 3 salas). Ver [RPG_EDRAN_NORTE_01.md](RPG_EDRAN_NORTE_01.md).

QA Norte: 18 recorridos y 14 capturas reales de escritorio/viewport móvil; Aren, Bravucón y ronda con desbloqueo comprobados en SQLite temporal. Arte y geometría con revisión independiente SHIP. Límites y evidencia en RPG_EDRAN_NORTE_01.md.

## Edran Restante 01 — candidato, 2026-10-21 (CM-12)

Seis fondos de sala ilustrados para completar las salas de Edran (loma, prado, ladera de piedra, linde de piedra, sendero de juncos y vado/puente de juncos). Base de integración `1bec001`. Fondos WebP normalizados a 1280×960, todos ≤250000 bytes. Reutilización completa de los 8 atlas NPC y 7 criaturas existentes sin nuevos recursos de personaje. El conjunto candidato alcanza 44 salas ilustradas de 191 (235 mapas totales: 191 generados + 44 pintados).

| Recurso | Dimensiones | Bytes | SHA-256 |
|---|---|---:|---|
| `backgrounds/edran_ladera_piedra.webp` | 1280×960 | 238182 | `326f57421adea2dc226beea0add0375c4250114c8b5449284742b41cfb0da091` |
| `backgrounds/edran_linde_piedra.webp` | 1280×960 | 240160 | `6f0f21f8241fc4b629e463527bf04117178e5be93c7ef292dcc9613dbb0fdfe4` |
| `backgrounds/edran_loma.webp` | 1280×960 | 238230 | `e578136824f1626b0cbe2d430debeb6fda6fff21c2791e421c27439090d258a1` |
| `backgrounds/edran_prado.webp` | 1280×960 | 240298 | `2b02205c3601ba4f4c6c0aa1df19f08e6103df178fe5de8fd7bcbe09192b7155` |
| `backgrounds/edran_puente_juncos.webp` | 1280×960 | 241462 | `9d379faf04c2caa04d372c1d768929cfba4282b73239097d8bc9845a1d9b9d0e` |
| `backgrounds/edran_sendero_juncos.webp` | 1280×960 | 236786 | `6cc3739b999799762d7637338bee7a9390cff4e6894ea5eb64a94b92afa1af12` |

Manifiesto en `entregas/equipo/cm-12/edran-restante-01/manifest-arte.json` y sidecars `.webp.json` junto a cada fondo en `client-rpg/backgrounds/`. Revisión visual independiente en `review-arte-1.md` y `review-arte-2.md`: dictamen SHIP para los seis fondos. Estado: CANDIDATO publicado en PR #750 (`ac30829`, 44 salas), no integrado en GitHub main aún (main 38 tras PR #749) ni desplegado (producción 3 en `8b62492`). Ver [RPG_EDRAN_RESTANTE_01.md](RPG_EDRAN_RESTANTE_01.md).

QA Edran restante: 33recorridos/14salidas, 6exámenes yCornalomo/examen reales, 12capturas escritorio/móvil conrecaptura lateral dePrado. Falla inicial deCornalomo bajo relato móvil corregida; arte ygeometría conrevisiónindependienteSHIP. No teléfono físico/tacto/FPS. Ver RPG_EDRAN_RESTANTE_01.md.

Corrección visual heredada detectada en QA del Prado: `sprites/cornalomo.png` rehecho nativamente usando el diseño aprobado de bestiario y el sprite de batalla como referencias; torso, cuatro patas, cuernos y cola legibles. PNG48×48, 3608bytes, SHA256 `9078de2480073933ff506d4b2e447492ac81dcb5276bf04c0e8029280735c073`. Normalización mecánica uniforme y padding transparente; revisión independiente SHIP enreview-cornalomo.md. Escala1.6 sólo en mapa, anclaje de pies y batalla conservados, sin reglas nuevas.

## Korven 01 — candidato local, 2026-10-22 (CM-20)

Seis salas nuevas sobre `ec425a4`: Parada de los Cardos, Senda del viento, Almacén de grano, Patio de Brumak, Escalones bajos y Taller de Brumak. El conjunto candidato alcanza **50/191** salas ilustradas (241 mapas comprobables: 191 generados y 50 pintados); quedan 141. Este lote no está publicado, integrado ni desplegado. La base ya contiene el candidato Edran restante; el `main` remoto consultado continúa en `aab05d4b` (38 salas).

Siete fondos 1280×960 de hasta 250000 bytes, dos atlas NPC 192×384 (celdas 64×96) y tres parejas de fauna 48×48/192×192. Ved y Beran usan cuerpo compacto de hasta 68 px por celda y pie común en y=92; no se añaden combates para NPC. Quebrarrocas comparte la escala de mapa 1.6 de Cornalomo, conservando anclaje y tamaño de batalla. Su presencia sigue dependiendo del snapshot autoritativo.

| Recurso | Dimensiones | Bytes | SHA-256 |
|---|---|---:|---|
| `sprites/beran.png` | 192×384 | 71387 | `da258cba75d6edcc735cafab2838395b5d72fae27bc4f8378ad51abcaa4a2309` |
| `backgrounds/brumak_centro.webp` | 1280×960 | 236006 | `988364fa2056e302deb85bd274513508cfa022cc627475c7db837991e28209bb` |
| `sprites/cascapedernal-battle.png` | 192×192 | 45759 | `8e4c8492a4f65165367b480215c3071bec9e48407c8f51d0c24a772df2c90709` |
| `sprites/cascapedernal.png` | 48×48 | 3905 | `d7b111e0faa27e6a526766dc2816691c116b8991f9e103a9063ace551d29caa3` |
| `sprites/colagrieta-battle.png` | 192×192 | 44464 | `e8ff6f0e36efdea0932921fe365bbf2c25ad15df12d05333586e90755e1f5639` |
| `sprites/colagrieta.png` | 48×48 | 3856 | `4cbc96ffd67bd4ea6926a576c5ce407fa65559930f275da2fa940ca156fdfd74` |
| `backgrounds/korven_almacen_grano.webp` | 1280×960 | 205878 | `f4078bc180dc5cadeaa3a6afbbb0630eea72ea1e02c113e00264c48b03f33522` |
| `backgrounds/korven_battle.webp` | 1280×960 | 249158 | `4e24c4c248148f7777e8697de129202d0e8e42117e8d37b567a69295f120871d` |
| `backgrounds/korven_borde_tierra.webp` | 1280×960 | 241302 | `e93ec42ae945d710f7e1dd9754ccd3ab6cfd3ce95bc92aef8fcb7590c9a82e94` |
| `backgrounds/korven_peldanos_cortos.webp` | 1280×960 | 247978 | `a2ed129ec188307e0a678dd9ee1f412c63b88ce3e5c78124411353cb82e3fc0c` |
| `backgrounds/korven_senda_viento.webp` | 1280×960 | 236932 | `2c4a83a69770617c941dda287d979fb83e1cc8924255a3ada88018f37e86fb3a` |
| `backgrounds/korven_taller_juntas.webp` | 1280×960 | 176512 | `a85c29641b7cd20ed914cc64cf60d44b1300d4c42dd23df8967417e3fd13642c` |
| `sprites/quebrarrocas-battle.png` | 192×192 | 44755 | `cd9a733d55869004b04db35f2031881ca9b450c6e8e861d09ef1bd2ada580ceb` |
| `sprites/quebrarrocas.png` | 48×48 | 4145 | `09accaf01aa5e1a3bb2ad32f633d012998b9ebff18403c17b482517c43ed1080` |
| `sprites/ved.png` | 192×384 | 68533 | `998c404b48d1e236744373be99a09ba87660e65da6d408776f83603887328980` |

Generación nativa `image_gen`; los dos primeros fondos reutilizan el SHIP de CM-12. Normalización mecánica, extracción por alfa, escala proporcional y padding. Se corrigió con `image_gen` la abertura norte accidental de Escalones bajos. Originales, prompts, manifiesto y QA en `entregas/equipo/cm-20/`; sidecars junto a cada recurso final. Autorrevisión de coherencia con Edran y canon, pendiente de revisión del arquitecto. Ver [RPG_KORVEN_01.md](RPG_KORVEN_01.md).

## Korven 02 — candidato local, 2026-10-22 (CM-20)

Siete salas nuevas sobre `05ec5eb`: Puerta del almacén viejo, Mesa de pesaje, Cruce de los sacos vacíos, Pasillo detrás de los sacos, Depósito del fondo, Calle de las casas y Casa de cuidados de Brumak. El conjunto candidato alcanza **57/191** salas ilustradas (248 mapas comprobables: 191 generados y 57 pintados); quedan 134. Este lote no está publicado, integrado ni desplegado.

Siete fondos 1280×960 de hasta 250000 bytes y dos atlas NPC 192×384 (celdas 64×96, escala proporcional Dravak con altura útil de hasta 68 px y pie común en y=92). Ruma (`korven_ruma`) y Neru (`korven_neru`) usan el estándar canónico de Aren y Ved. Cruce de los sacos vacíos utiliza `backgrounds/korven_battle.webp` para el slot de combate del forajido de caminos.

| Recurso | Dimensiones | Bytes | SHA-256 |
|---|---|---:|---|
| `backgrounds/korven_almacen_balanzas.webp` | 1280×960 | 123880 | `7d245762bd1574ce31e6435d0d6a4bf14064867d33341fcbf6a4fbfd5693838e` |
| `backgrounds/korven_almacen_cruce.webp` | 1280×960 | 128994 | `d6df70b960d8b0f11c2922af5dfdf821021dfe5a38a5c9c7b5a5f20379cda592` |
| `backgrounds/korven_almacen_entrada.webp` | 1280×960 | 239554 | `1f5526542cdc55561dab7dfbc3547da50bf20d43de8210681925ab3e686475e7` |
| `backgrounds/korven_almacen_fondo.webp` | 1280×960 | 205316 | `d1fe9ef50f38191cc7cbbc394eb31aa70eb22fd7db20a887cfce2a36a63f8fd7` |
| `backgrounds/korven_almacen_lateral.webp` | 1280×960 | 245322 | `76ad351e2cf3006355268621ceca6ce8c254872fc653fbcb4fa28acfdd860431` |
| `backgrounds/korven_calle_fachadas.webp` | 1280×960 | 244158 | `3698be8decd6e8439c46e2df3bb284beb09a692ddc56ced6d8f5d28846926cbd` |
| `backgrounds/korven_sala_cuidados.webp` | 1280×960 | 92682 | `aeea7929a0a1480c6a9dd9c214544ab6f555f732271717cfe780bfbb5d45f6b7` |
| `sprites/neru.png` | 192×384 | 68085 | `dba898d697ce9c00e9b1cfe4777bfa104d5dfd391270a29257a1942f250b2d67` |
| `sprites/ruma.png` | 192×384 | 67655 | `7797af82693ddfc64426f6db3f0f2cd00f2f9e42133c6404044c4fdc54d6b9d6` |

Generación nativa `image_gen` (subagente AGY); normalización mecánica, extracción por canal alfa sobre croma verde, escala proporcional y pie en baseline y=92. Originales, prompts y manifiesto en `/home/jdiaz/proyectos/entregas/equipo/cm-20/korven-02/arte/`; sidecars junto a cada recurso final. Autorrevisión de coherencia con Brumak, Edran y canon, pendiente de revisión del arquitecto. Ver [RPG_KORVEN_02.md](RPG_KORVEN_02.md).

## Korven 03 — candidato local, 2026-10-22 (CM-20)

Siete salas nuevas sobre `4cc5852`: Cisterna común, Patio de lavado, Depósito de cubiertas, Mirador de las grietas, Cauce de piedras movidas, Plataforma de escucha y Registro del cauce. El conjunto candidato alcanza **64/191** salas ilustradas (255 mapas comprobables: 191 generados y 64 pintados); quedan 127. Este lote no está publicado, integrado ni desplegado.

Siete fondos 1280×960 de hasta 250000 bytes y un atlas NPC 192×384 (celdas 64×96, escala proporcional Dravak con altura útil de hasta 68 px y pie común en y=92). Oma (`korven_oma`) usa el estándar canónico de Ved, Ruma y Neru. Salas con fauna (`cisterna_comun`, `mirador_grietas`, `cauce_observacion`, `plataforma_escucha`) utilizan `backgrounds/korven_battle.webp` para los encuentros de combate.

| Recurso | Dimensiones | Bytes | SHA-256 |
|---|---|---:|---|
| `backgrounds/korven_cauce_observacion.webp` | 1280×960 | 206504 | `913ad8227924b9aab57b6581e25fda473f80949827cece680a449bfb124f641e` |
| `backgrounds/korven_cisterna_comun.webp` | 1280×960 | 207556 | `e61af975a2a4c48a6711d5d3e41b6a31457330564dadf9fa8ff60386485ebc0c` |
| `backgrounds/korven_deposito_cubiertas.webp` | 1280×960 | 153998 | `73227edbf3aceeb0441edd9367299f943a1dacff203dec05bb266a5c2686e77b` |
| `backgrounds/korven_mirador_grietas.webp` | 1280×960 | 243950 | `22df9b4256baa96b60ebb2591d42681ca5a71b003047fe41f91930a8b83844f6` |
| `backgrounds/korven_patio_lavado.webp` | 1280×960 | 230454 | `cf39d3f8f74bbad09f2feb9fb0ea8ed68852976f6b2ea660749c14c36838d7ce` |
| `backgrounds/korven_plataforma_escucha.webp` | 1280×960 | 199720 | `60651c70bcf995fea69252a992ecba69a56088b27ba8d5325dcf8481036379f7` |
| `backgrounds/korven_registro_cauce.webp` | 1280×960 | 236408 | `07952f6a67ccfdf3f38711e9e732a45090951d3a8e3f4f4643c0514443269783` |
| `sprites/oma.png` | 192×384 | 75213 | `68c0a40b18e939f30df8d28396ccff3b3ad0afabf392a2ab921fadc4de1fd5d7` |

Generación nativa `image_gen` (subagente AGY); normalización mecánica, extracción por canal alfa sobre croma verde, escala proporcional y pie en baseline y=92. Originales, prompts y manifiesto en `/home/jdiaz/proyectos/entregas/equipo/cm-20/korven-03/arte/`; sidecars junto a cada recurso final. Autorrevisión de coherencia con Brumak, Edran y canon, pendiente de revisión del arquitecto. Ver [RPG_KORVEN_03.md](RPG_KORVEN_03.md).

## Korven 04 — candidato local, 2026-10-22 (CM-20)

Seis salas nuevas sobre `4fe925b`: Banco de revisión, Refugio de Lajas, Paso estrecho, Camino de los mojones, Pared que corta el viento y Meseta de las dos piedras. El conjunto candidato alcanza **70/191** salas ilustradas (261 mapas comprobables: 191 generados y 70 pintados); quedan 121 salas sin ilustrar (de las cuales 6 en Korven). Este lote no está publicado, integrado ni desplegado.

Seis fondos 1280×960 de hasta 250000 bytes. Este lote no introduce NPCs fijos nuevos; la fauna y salteadores canónicos reutilizan los atlas y sprites existentes. Las seis salas con fauna utilizan `backgrounds/korven_battle.webp` para los encuentros de combate.

| Recurso | Dimensiones | Bytes | SHA-256 |
|---|---|---:|---|
| `backgrounds/korven_asiento_revision.webp` | 1280×960 | 226842 | `50cb583e585889f2a8c0a245ec0f3e911bbc296b9f9b1fb111143baa35e93217` |
| `backgrounds/korven_hendidura_transito.webp` | 1280×960 | 162922 | `c31e6b9cccd1feb8d0d00e6677b5851b248a916dd50df1ff2e6a937ffb0d8d4e` |
| `backgrounds/korven_hitos_paso.webp` | 1280×960 | 192442 | `e322e549b5cbd2fa75ebd5f8a8079fa474285111ea6cc5580ba9d248a994a75b` |
| `backgrounds/korven_meseta_baja.webp` | 1280×960 | 238808 | `d1f7f6d378234ad0775d52d2d499615ca40ec5fae4d3b47f632fd5b898caaa5b` |
| `backgrounds/korven_meseta_relevo.webp` | 1280×960 | 238890 | `ca250e41d0219b303c843e3c0f5cff5c746ab2afcb2a465713d16593be5fee45` |
| `backgrounds/korven_pared_sotavento.webp` | 1280×960 | 220052 | `93352232219ea5dd3ae075bd60f40e9d6392eab4a93e944955fc082f2ebf6bf8` |

Generación nativa `image_gen` (subagente AGY); normalización mecánica, redimensionado proporcional a 1280×960 y compresión WebP. Originales, prompts y manifiesto en `/home/jdiaz/proyectos/entregas/equipo/cm-20/korven-04/arte/`; sidecars junto a cada recurso final. Autorrevisión de coherencia con Brumak, Edran y canon, pendiente de revisión del arquitecto. Ver [RPG_KORVEN_04.md](RPG_KORVEN_04.md).
