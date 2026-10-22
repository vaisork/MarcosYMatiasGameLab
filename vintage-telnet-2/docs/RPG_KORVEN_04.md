# Korven 04 — 2026-10-22 (CM-20)

Candidato local sobre `4fe925b`, rama `agy/cm-20-korven-02`: seis salas ilustradas y seis fondos WebP. El conjunto alcanza **70/191 salas ilustradas** (191 mapas generados + 70 pintados = 261 mapas comprobables); quedan 121 salas sin ilustrar (de las cuales 6 en Korven). Sin push, PR, merge ni despliegue.

## Escenas y geometría

Coordenadas de celda desde cero, mapa 20×15. Cada escena cuenta con su fuente Tiled `.tmj` y su máscara `layers.solid`. Los únicos bordes transitables pertenecen a las salidas canónicas. Las máscaras se ajustaron contra el arte final sin sustituir el terreno por patrones genéricos.

| Sala | Salidas | Geometría y actores |
|---|---|---|
| `korven_asiento_revision` | O/N/E | Roca grande llena de marcas de golpes para ensanche de camino, banco de cargas y mesa de revisión con polvo seco. Salida oeste y=6..7 (a `korven_peldanos_cortos`), norte x=9..10 (a `korven_meseta_relevo`), este y=6..7 (a `korven_hendidura_transito`). Muro sur bloqueado. Cascapedernal `[6,10]` y Salteador veterano `[14,10]` en slots de fauna/wildlife, vista de combate en `backgrounds/korven_battle.webp`. |
| `korven_meseta_relevo` | S/N | Refugio de Lajas con piedras claras de Korven y restos oscuros de Hoshai, mesa con cubierta y apoyos de descanso. Salida sur x=9..10 (a `korven_asiento_revision`), norte x=9..10 (a `hoshai_garganta_oeste`). Paredes este y oeste cerradas. Cascapedernal `[6,6]`, Colagrieta `[14,6]` y Quebrarrocas `[7,10]`. |
| `korven_hendidura_transito` | O/E | Paso estrecho en sombra entre altas paredes verticales de cañón con tabla gastada sobre la grieta para paso de ruedas. Salida oeste y=6..7 (a `korven_asiento_revision`), este y=6..7 (a `korven_hitos_paso`). Taludes norte y sur bloqueados. Cascapedernal `[6,7]`, Colagrieta `[14,7]` y Quebrarrocas `[10,9]`. |
| `korven_hitos_paso` | O/E | Camino de mojones alineados sobre suelo duro guiando a través de la terraza de roca. Salida oeste y=6..7 (a `korven_hendidura_transito`), este y=6..7 (a `korven_pared_sotavento`). Bordes norte y sur bloqueados. Cascapedernal `[6,5]`, Colagrieta `[14,5]`, Forajido de caminos `[6,9]` y Quebrarrocas `[14,9]`. |
| `korven_pared_sotavento` | O/E | Pared que corta el viento con hueco de descanso, escoba de juntas y marca pintada en el suelo para mantener libre el corredor. Salida oeste y=6..7 (a `korven_hitos_paso`), este y=6..7 (a `korven_meseta_baja`). Pared norte y talud sur cerrados. Cascapedernal `[6,8]` y Salteadora negociante `[14,8]`. |
| `korven_meseta_baja` | O/E/S | Meseta pelada y abierta con dos grandes piedras solitarias de sombra y hendidura en la roca. Salida oeste y=6..7 (a `korven_pared_sotavento`), este y=6..7 (a `korven_cauce_duro`), sur x=9..10 (a `korven_desvio_horno`). Borde norte bloqueado. Cascapedernal `[5,9]`, Colagrieta `[15,9]` y Quebrarrocas `[10,10]`. |

Total: **14 salidas canónicas**. No se añaden salidas inventadas ni se altera el canon de MUD ni la lógica de estados o recompensas.

## Arte y procedencia

- 6 fondos de entorno generados mediante la herramienta nativa de imágenes (`image-generator` de AGY) a partir de los prompts canónicos de `prompts-fondos.json`. Redimensionados proporcionalmente a 1280×960 y comprimidos en WebP RGB respetando la cota máxima de 250000 bytes.
- Este lote no introduce NPCs fijos nuevos: Oma reside en `korven_registro_cauce` (Korven 03) y Taren en `korven_entrante_piezas` (Korven 05). La fauna y salteadores canónicos (`cascapedernal`, `colagrieta`, `quebrarrocas`, `forajido`, `salteador`, `negociante`) reutilizan los atlas y sprites existentes.
- Las seis salas con fauna utilizan `backgrounds/korven_battle.webp` para la vista de combate.
- Originales conservados en `/home/jdiaz/proyectos/entregas/equipo/cm-20/korven-04/arte/`.

Hashes, dimensiones y bytes: [VAISGARD_RPG_ARTE.md](VAISGARD_RPG_ARTE.md#korven-04--candidato-local-2026-10-22-cm-20) y sidecars `.webp.json` junto a cada recurso.

## Validación

- `node scripts/check-rpg-client.mjs`: PASS (261 mapas comprobables, geometría y navegación de avatares con contorno real, fondos de batalla y red).
- `python -m unittest tests.test_rpg_scenes -q`: 11/11 PASS (incluye roundtrip Tiled bidireccional exacto para las 6 escenas, 14 salidas canónicas, verificación perimetral estricta, actores sin solapar spawns ni obstáculos, y verificación de hashes, dimensiones y cuota ≤250 KB).
- `python scripts/qa-rpg-korven-04.py --check`: 5/5 PASS (navegación canónica desde Valdren, 14 salidas con acciones ofrecidas y rebotes, examen de objetos canónicos en el lote, roundtrip Tiled).
- `python scripts/qa-rpg-korven-04.py --test-startup`: PASS (arranque WSGI en puerto 8783, GET `/rpg` 200, `/api/state`, acción con token CSRF y parada limpia con SQLite efímero).
- `git diff --check`: limpio.

## Autorrevisión y límites

Continuidad visual plena con Brumak y lotes anteriores de Korven: piedra caliza gris, terreno seco y polvoriento, mojones de piedra, hendiduras de roca y ausencia de elementos mágicos o subterráneos incongruentes; arquitectura funcional Dravak con soportes de madera y marcas prácticas.
Próximo consumidor: Claude/arquitecto para revisión del diff y posterior integración autorizada.
