# Korven 05 — 2026-10-23 (CM-20)

Candidato local sobre `57c0eb7`, rama `agy/cm-20-korven-05`: seis salas ilustradas, seis fondos WebP y atlas de Taren. Con esta entrega se completan las 32 salas de Korven (**32/32 salas ilustradas**). El conjunto alcanza **76/191 salas ilustradas** (191 mapas generados + 76 pintados = 267 mapas comprobables); quedan 115 salas sin ilustrar (0 en Korven). Sin push, PR, merge ni despliegue.

## Escenas y geometría

Coordenadas de celda desde cero, mapa 20×15. Cada escena cuenta con su fuente Tiled `.tmj` y su máscara `layers.solid`. Los únicos bordes transitables pertenecen a las salidas canónicas. Las máscaras se ajustaron contra el arte final sin sustituir el terreno por patrones genéricos.

| Sala | Salidas | Geometría y actores |
|---|---|---|
| `korven_cauce_duro` | O/E/S | Cauce seco ancho tallado en la roca con arena fina en fisuras y cuenco de herramientas comunales en el borde. Salida oeste y=6..7 (a `korven_meseta_baja`), este y=6..7 (a `korven_loma_cascajo`), sur x=9..10 (a `korven_roca_cascaron`). Muro norte cerrado. Cascapedernal `[5,9]`, Colagrieta `[15,9]` y Quebrarrocas `[10,10]` en slots de fauna/wildlife, vista de combate en `backgrounds/korven_battle.webp`. |
| `korven_loma_cascajo` | O/E | Loma de piedras claras en la frontera oriental de Korven con dos surcos profundos de ruedas en tierra blanda y montón lateral de cascajo apartado. Salida oeste y=6..7 (a `korven_cauce_duro`), este y=6..7 (a `veyra_terraplen_roca`). Taludes norte y sur cerrados. Cascapedernal `[6,5]`, Colagrieta `[14,5]`, Quebrarrocas `[14,9]` y Forajido de caminos `[6,9]`. |
| `korven_roca_cascaron` | N | Enorme formación de roca hueca natural como cúpula o cascarón agrietado con suelo transitable y líquenes. Salida norte x=9..10 (a `korven_cauce_duro`). Borde este, sur y oeste cerrados por la pared de la cúpula. Cascapedernal `[6,8]` y Salteador veterano `[14,8]`. |
| `korven_desvio_horno` | N/S | Paso estrecho hundido entre muros altos de roca con restos de hollín antiguo que desciende hacia el horno de reposo. Salida norte x=9..10 (a `korven_meseta_baja`), sur x=9..10 (a `korven_horno_reposo`). Paredes este y oeste cerradas. Cascapedernal `[6,6]`, Colagrieta `[14,6]` y Quebrarrocas `[10,10]`. |
| `korven_horno_reposo` | N/O | Horno bajo de barro y lajas encajado en un hueco de abrigo con restos de tiestos ordenados por grosor. Salida norte x=9..10 (a `korven_desvio_horno`), oeste y=6..7 (a `korven_entrante_piezas`). Paredes este y sur bloqueadas. Cascapedernal `[7,9]` y Salteador veterano `[13,9]`. |
| `korven_entrante_piezas` | E | Rincón de las muestras resguardado con esteras de caña sobre poyos de piedra, muestras de arcilla, raspadores y mesa de trabajo de Taren. Salida este y=6..7 (a `korven_horno_reposo`). Paredes norte, sur y oeste cerradas. NPC Taren (`korven_taren`) en `[8,6]`; Cascapedernal `[6,9]` y Salteador veterano `[14,9]`. |

Total: **11 salidas canónicas**. No se añaden salidas inventadas ni se altera el canon de MUD ni la lógica de estados o recompensas.

## Arte y procedencia

- 6 fondos de entorno generados mediante la herramienta nativa de imágenes (`image-generator` de AGY) a partir de los prompts canónicos de `prompts-fondos.json`. Redimensionados proporcionalmente a 1280×960 y comprimidos en WebP RGB respetando la cota máxima de 250000 bytes.
- Atlas de Taren (`korven_taren`): 12 celdas en hoja de 192×384 (64×96 por celda, 4 filas S/N/W/E, 3 pasos por fila), escala Dravak proporcional (altura máxima útil ≤68 px) y pie común alineado en baseline y=92. Extraído sobre croma verde uniforme (#00FF00).
- Las seis salas utilizan `backgrounds/korven_battle.webp` para los encuentros de combate.
- Originales conservados en `/home/jdiaz/proyectos/entregas/equipo/cm-20/korven-05/arte/`.

Hashes, dimensiones y bytes: [VAISGARD_RPG_ARTE.md](VAISGARD_RPG_ARTE.md#korven-05--candidato-local-2026-10-23-cm-20) y sidecars `.webp.json` / `.png.json` junto a cada recurso.

## Validación

- `node scripts/check-rpg-client.mjs`: PASS (267 mapas comprobables, geometría y navegación de avatares con contorno real, fondos de batalla, precarga y atlas de Taren).
- `python -m unittest tests.test_rpg_scenes -q`: 12/12 PASS (incluye roundtrip Tiled bidireccional exacto para las 6 escenas, 11 salidas canónicas, verificación perimetral estricta, actores sin solapar spawns ni obstáculos, verificación de hashes, dimensiones y cuota ≤250 KB de fondos, y atlas de Taren 192×384).
- `python scripts/qa-rpg-korven-05.py --check`: 5/5 PASS (navegación canónica desde Valdren, 11 salidas con acciones ofrecidas y rebotes, diálogo con Taren, examen de objetos canónicos en el lote, roundtrip Tiled).
- `python scripts/qa-rpg-korven-05.py --test-startup`: PASS (arranque WSGI en puerto 8784, GET `/rpg` 200, `/api/state`, acción con token CSRF y parada limpia con SQLite efímero).
- `git diff --check`: limpio.

## Autorrevisión y límites

Continuidad visual y canónica plena con Korven 01-04 y Brumak: arquitectura funcional Dravak en superficie, piedra caliza clara, caminos de cascajo, cuencos tallados para herramientas, alfares y esteras de caña. Sin elementos subterráneos, magia ni añadidos incongruentes.
Próximo consumidor: Claude/arquitecto para revisión del diff y posterior integración autorizada.
