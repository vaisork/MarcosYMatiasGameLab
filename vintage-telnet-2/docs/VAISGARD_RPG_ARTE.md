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
