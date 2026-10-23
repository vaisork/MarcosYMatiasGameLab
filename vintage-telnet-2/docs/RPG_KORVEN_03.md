# Korven 03 — 2026-10-22 (CM-20)

Candidato local sobre `4cc5852`, rama `agy/cm-20-korven-02`: siete salas ilustradas, siete fondos WebP y un atlas NPC (Oma). El conjunto alcanza **64/191 salas ilustradas** (191 mapas generados + 64 pintados = 255 mapas comprobables); quedan 127 salas sin ilustrar (de las cuales 12 en Korven). Sin push, PR, merge ni despliegue.

## Escenas y geometría

Coordenadas de celda desde cero, mapa 20×15. Cada escena cuenta con su fuente Tiled `.tmj` y su máscara `layers.solid`. Los únicos bordes transitables pertenecen a las salidas canónicas. Las máscaras se ajustaron contra el arte final sin sustituir el terreno por patrones genéricos.

| Sala | Salidas | Geometría y actores |
|---|---|---|
| `korven_cisterna_comun` | N/O/E | Cisterna común y ancha del pueblo con plataforma baja escalonada y canal de lluvia limpio. Paso norte x=9..10 (a `korven_calle_fachadas`), oeste y=6..7 (a `korven_patio_lavado`), este y=6..7 (a `korven_mirador_grietas`). Muro sur bloqueado. Cascapedernal `[5,10]` y Salteador desesperado `[14,10]` en slots de fauna/wildlife, vista de combate en `backgrounds/korven_battle.webp`. |
| `korven_patio_lavado` | E/S | Patio de lavado con separación entre pilas de sucio y limpio, regueros y bancos de piedra. Paso este y=6..7 (a cisterna), sur x=9..10 (a depósito de cubiertas). Muros norte y oeste cerrados. Suelo de grava transitable. |
| `korven_deposito_cubiertas` | N | Cuarto fresco tallado en la roca con cubiertas de tela gruesa colgadas en dos secciones (secas y húmedas). Salida norte x=9..10 (a patio de lavado). Muros este, sur y oeste de roca cerrada. |
| `korven_mirador_grietas` | O/S | Mirador sobre profunda franja de roca agrietada con parapeto bajo protector y avisos. Paso oeste y=6..7 (a cisterna), sur x=9..10 (al cauce). Cascapedernal `[14,6]` y Salteador desesperado `[6,10]` en slots de fauna, vista de combate en `backgrounds/korven_battle.webp`. |
| `korven_cauce_observacion` | N/E | Cauce seco de polvo y bloques movidos con caras limpias expuestas. Paso norte x=9..10 (a mirador), este y=6..7 (a plataforma de escucha). Cascapedernal `[7,5]`, Colagrieta `[13,8]` y Quebrarrocas `[8,10]`. Taludes laterales bloqueados; sendero central libre. |
| `korven_plataforma_escucha` | O/N | Plataforma de roca firme con junta y cuenco cerámico de resonancia para escuchar temblores. Paso oeste y=6..7 (al cauce), norte x=9..10 (al registro). Salteador veterano `[14,7]` y Cascapedernal `[8,10]`. |
| `korven_registro_cauce` | S | Oficina baja de registro al abrigo del polvo, con fundas de cuero, tablillas y ventana al cauce. Salida sur x=9..10 (a plataforma de escucha). Oma `[13,6]` junto a la mesa con aproximación despejada. |

Total: **13 salidas canónicas**. No se añaden salidas inventadas ni se altera el canon de MUD ni la lógica de estados o recompensas.

## Arte y procedencia

- 7 fondos de entorno generados mediante la herramienta nativa de imágenes (`image-generator` de AGY) a partir de los prompts canónicos de `prompts-fondos.json`. Redimensionados proporcionalmente a 1280×960 y comprimidos en WebP RGB respetando la cota máxima de 250000 bytes.
- Atlas de NPC Oma generado nativamente a partir de `prompts-sprites.json`, aislado en cuadrícula 3×4 de doce celdas de 64×96 en PNG RGBA 192×384. Escala uniforme respetando estatura compacta Dravak (hasta 68 px de altura útil) y pie común en y=92.
- Salas con fauna (`cisterna_comun`, `mirador_grietas`, `cauce_observacion`, `plataforma_escucha`) utilizan `backgrounds/korven_battle.webp` para la vista de combate.
- Originales conservados en `/home/jdiaz/proyectos/entregas/equipo/cm-20/korven-03/arte/`.

Hashes, dimensiones y bytes: [VAISGARD_RPG_ARTE.md](VAISGARD_RPG_ARTE.md#korven-03--candidato-local-2026-10-22-cm-20) y sidecars `.webp.json` y `.png.json` junto a cada recurso.

## Validación

- `node scripts/check-rpg-client.mjs`: PASS (255 mapas comprobables, geometría y navegación de avatares con contorno real, precarga y mapeo de Oma, fondos de batalla y red).
- `python -m unittest tests.test_rpg_scenes -q`: 10/10 PASS (incluye roundtrip Tiled bidireccional exacto para las 7 escenas, 13 salidas canónicas, verificación perimetral estricta, actores sin solapar spawns ni obstáculos, y verificación de hashes, dimensiones y cuota ≤250 KB).
- `python scripts/qa-rpg-korven-03.py --check`: 5/5 PASS (navegación canónica desde Valdren, 13 salidas con acciones ofrecidas y rebotes, diálogos y tópicos de Oma, roundtrip Tiled).
- `python scripts/qa-rpg-korven-03.py --test-startup`: PASS (arranque WSGI en puerto 8781, GET `/rpg` 200, `/api/state`, acción con token CSRF y parada limpia con SQLite efímero).
- `git diff --check`: limpio.

## Autorrevisión y límites

Continuidad visual plena con Brumak y lotes anteriores de Korven: piedra gris, terreno seco, ausencia de elementos mágicos o subterráneos incongruentes; arquitectura funcional Dravak con soportes de madera, registros meticulosos de observaciones y muros prácticos. Placas pequeñas de piedra en sienes y antebrazos de Oma.
Próximo consumidor: Claude/arquitecto para revisión del diff y posterior integración autorizada.
