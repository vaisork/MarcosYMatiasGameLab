# Korven 02 — 2026-10-22 (CM-20)

Candidato local sobre `05ec5eb`, rama `agy/cm-20-korven-02`: siete salas ilustradas, siete fondos y dos atlas NPC (Ruma y Neru). El conjunto alcanza **57/191 salas ilustradas** (191 mapas generados + 57 pintados = 248); quedan 134. Sin push, PR, merge ni despliegue.

## Escenas y geometría

Coordenadas de celda desde cero, mapa 20×15. Cada escena cuenta con su fuente Tiled `.tmj` y su máscara `layers.solid`. Los únicos bordes transitables pertenecen a las salidas canónicas. Las máscaras se ajustaron contra el arte final sin sustituir el terreno por patrones genéricos.

| Sala | Salidas | Geometría y actores |
|---|---|---|
| `korven_almacen_entrada` | N/S/O | Umbral de entrada al almacén de sacos vacíos. Paso norte x=9..11 (a `korven_peldanos_cortos`), sur x=9..10 (al cruce), oeste y=6..7 (a pesaje). Soportes de sacos laterales bloqueados. Ruma `[14,6]` con aproximación libre. |
| `korven_almacen_balanzas` | E | Mesa baja de pesaje con balanza de dos brazos (uno con placa, otro vacío y doblado). Salida este y=6..7. Mesa y apoyos bloqueados; suelo de paso libre hacia el umbral este. |
| `korven_almacen_cruce` | N/S/E | Cruce entre pilas altas de sacos. Paso norte x=9..10, sur x=9..10 (al fondo), este y=6..7 (al lateral). Pilas y sacos bloqueados. Forajido de caminos `[10,9]` (slot canónico de señal), usa `backgrounds/korven_battle.webp`. |
| `korven_almacen_lateral` | O/S | Pasillo estrecho detrás de los sacos sostenidos por cordel. Entrada oeste y=6..7, quiebro hacia sur x=9..10. Pilas de tela áspera bloqueadas; senda transitable despejada. |
| `korven_almacen_fondo` | N/E | Depósito cerrado por pared de roca. Corredor norte x=9..10, paso este y=6..7. Muros macizos cerrados. La placa de tres muescas es objeto recogible y no se pinta en el fondo para evitar contradicciones tras recogerla. |
| `korven_calle_fachadas` | N/S/E | Calle amplia de casas metidas en la roca. Paso norte x=9..10 (a `brumak_centro`), sur x=9..10 (a la cisterna común), este y=6..7 (a la casa de cuidados). Fachadas occidentales y repisas cerradas. |
| `korven_sala_cuidados` | O | Casa de cuidados limpia y fresca. Puerta oeste y=6..7. Asiento bajo bajo ventana alta, estantes de paños y tinaja de agua limpia bloqueados. Neru `[13,6]` junto al asiento con aproximación despejada. |

Total: **15 salidas canónicas**. No se añaden salidas inventadas ni se altera el canon de MUD ni la lógica de estados o recompensas.

## Arte y procedencia

- 7 fondos de entorno generados mediante la herramienta nativa de imágenes (`image_gen` de AGY) a partir de los prompts canónicos de `prompts-fondos.json`. Redimensionados proporcionalmente a 1280×960 y comprimidos en WebP RGB de alta calidad respetando la cota máxima de 250000 bytes.
- Atlas de NPC Ruma y Neru generados nativamente a partir de `prompts-sprites.json`, aislados en cuadrícula 3×4 de doce celdas de 64×96 en PNG RGBA 192×384. Escala uniforme respetando estatura compacta Dravak (hasta 68 px de altura útil de figura) y pie común en y=92.
- `korven_almacen_cruce` utiliza explícitamente `backgrounds/korven_battle.webp` para la vista de batalla del forajido de caminos.
- Originales conservados en `/home/jdiaz/proyectos/entregas/equipo/cm-20/korven-02/arte/`.

Hashes, dimensiones y bytes: [VAISGARD_RPG_ARTE.md](VAISGARD_RPG_ARTE.md#korven-02--candidato-local-2026-10-22-cm-20) y sidecars `.webp.json` y `.png.json` junto a cada recurso.

## Validación

- `node scripts/check-rpg-client.mjs`: PASS (248 mapas comprobables, geometría y navegación de avatares con contorno real, precarga y mapeo de Ruma y Neru, fondo de batalla y red).
- `python -m unittest tests.test_rpg_scenes -q`: 9/9 PASS (incluye roundtrip Tiled bidireccional exacto para las 7 escenas, 15 salidas canónicas, verificación perimetral estricta, actores sin solapar spawns ni obstáculos, y verificación de hashes, dimensiones y cuota ≤250 KB).
- `python scripts/qa-rpg-korven-02.py --check`: 5/5 PASS (navegación canónica desde Valdren, 15 salidas con acciones ofrecidas y rebotes, diálogos y tópicos de Ruma y Neru, interacción con balanza, rayas y cuidados).
- `python scripts/qa-rpg-korven-02.py --test-startup`: PASS (arranque WSGI en puerto 8779, GET `/rpg` 200, `/api/state`, acción con token CSRF y parada limpia con SQLite efímero).
- `git diff --check`: limpio.

## Autorrevisión y límites

Continuidad visual plena con Brumak y Korven 01: piedra gris, terreno seco, ausencia de elementos mágicos o subterráneos incongruentes; arquitectura funcional Dravak con soportes de madera y muros prácticos. Placas pequeñas de piedra en sienes y antebrazos de los NPC.
Próximo consumidor: Claude/arquitecto para revisión del diff y posterior integración autorizada.
