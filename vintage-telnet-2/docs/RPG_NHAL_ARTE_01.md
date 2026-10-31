# Nhal arte 01 — seis primeras salas, 2026-10-31

Entrega local sobre `origin/main` (`932a90e`). Se cubren las seis primeras salas por ID alfabético: agua sombreada, árbol umbral, calle de hogares, claro silencio, cocina de raíces y corteza clara. El arte sigue la capa `solid`, los spawns y las salidas de `client-rpg/scenes/` y sus fuentes Tiled. Referencias: `content/regions/nhal.json`, `content/world.json` y las ilustraciones canónicas `client/art/places/nhal_*`.

## Fondos

Generación nativa image_gen, pixel art detallado en vista 3/4 ortográfica; salida normalizada a 1280×960 WebP ≤250000 bytes. Cada archivo tiene sidecar con prompt completo, origen, calidad, bytes y SHA-256. Se revisaron visualmente las rutas y salidas: los pasos permanecen despejados y los obstáculos quedan en márgenes; la cocina se regeneró para despejar el enlace oeste-norte. No hay actores ni texto en los fondos.

| Sala | WebP | Bytes | Calidad | SHA-256 |
|---|---|---:|---:|---|
| `nhal_agua_sombreada` | [`nhal_agua_sombreada.webp`](../client-rpg/backgrounds/nhal_agua_sombreada.webp) | 241638 | 64 | `249e4e5aa9007acd10d1ac15100478c10315a529f936f45950f3fc66dca5dd48` |
| `nhal_arbol_umbral` | [`nhal_arbol_umbral.webp`](../client-rpg/backgrounds/nhal_arbol_umbral.webp) | 241358 | 44 | `f57b3dabb04fabdd20f2a5c76e7f705bfd87dcf952f2ceab0771b70aeb2ce85c` |
| `nhal_calle_hogares` | [`nhal_calle_hogares.webp`](../client-rpg/backgrounds/nhal_calle_hogares.webp) | 243372 | 48 | `e458d0a42a049f07903232c0918086ec0ef7b0678f20f28f09516276d3f77aa0` |
| `nhal_claro_silencio` | [`nhal_claro_silencio.webp`](../client-rpg/backgrounds/nhal_claro_silencio.webp) | 249030 | 48 | `09d9fd410ed08849f2cd0785b412bc7d57ee7ca587391a3086e59a8c4cae98d7` |
| `nhal_cocina_raices` | [`nhal_cocina_raices.webp`](../client-rpg/backgrounds/nhal_cocina_raices.webp) | 166672 | 48 | `9e78810d82d759ed16495df99623aabd18eadd00acb1a4889c57574534379dce` |
| `nhal_corteza_clara` | [`nhal_corteza_clara.webp`](../client-rpg/backgrounds/nhal_corteza_clara.webp) | 249756 | 36 | `63587a8a32a9d3f482fd25b512b591fe26b435b71a5d4f38701edc9ed43f245f` |

Cada `.tmj` fuente declara `background: backgrounds/<room>.webp`; los IDs, salidas, spawns y colisiones se conservan.

## Sprites de criaturas

Las seis salas no contienen NPCs; por eso no requieren atlas 64×96. Sus ocho tipos de fauna carecían de recursos RPG y ahora tienen versión transparente de mapa (48×48) y batalla (192×192), basadas en sus ilustraciones canónicas de `client/art/bestiary/`. Cada PNG incluye sidecar JSON con prompt, referencia, dimensiones, bytes y SHA-256.

| Criatura | Mapa (48×48) SHA-256 | Batalla (192×192) SHA-256 |
|---|---|---|
| `clavaespina` | `a3b4b1f55deaab253be15a3e53ee36a78767c817fb1d0103249ad6cbaa263487` (4356 B) | `722eb8fb787a70eca00fdc749285f4491e99601a9611a2c2a8297bf9318b07ac` (49725 B) |
| `garfarrama` | `3e754da4b3f14108cebfdec4f072dc34af85361f6a7e59b7d9d4a0ddd3d37a06` (2603 B) | `d33eac250707a86389691f1ca33cdedc882cbdd1c61544a3df5a93f961593fff` (23852 B) |
| `hilaria_niebla` | `880089e56c7ddb2041cb2f5b390c2c09e045c20e0dfc46f6ab1ae8c7b803851c` (2745 B) | `7f08d45fdb033d4090f06d80986ba130bf08643b890cb56c6ae6a63641777269` (29578 B) |
| `rasgacorteza` | `1ac6f856d71150d797e3bb7283ac26ff84840cc4a2d4436e74080e8c8c3b1734` (2845 B) | `a18ed2d6f7d33141da1f3e135baec6afa1fdaa56b359f7eb08255d479adf9c3d` (30488 B) |
| `roecorteza` | `970a149c8100a1babd2275444de09879173b9b1eff3363d35e85416cc0473232` (4188 B) | `020aa274f3ad688c3eaac385d087236d933810947479a6f084d116435960cca3` (49627 B) |
| `rondamusgo` | `c4cf6affa98cb09d71dfc4bdfc7b0f5d3079fc9cc1aa663419499f08d3df9c82` (4385 B) | `d357f668a0a7c936c96f8551ab34ef2409c5c99ecc0f8374e817dfc93664c0c9` (50097 B) |
| `tronchacolmillo` | `7c2b8dc0d6226e2b5689e3c5d054f7fbfd4432810a17475770baeee7f55d64bf` (3933 B) | `21b3b9ce24b1cd01f10ba44290bc45457996edb94f8961bb23698a304789f1b4` (41180 B) |
| `velomembrana` | `11671bc25b85abd38ce118bf19953ab2f7b1299defad2daf0dfa3cf95150d15f` (3791 B) | `d740713f1f48be7f625371ab884a8b2fe33700f965d36f41f136818a877306a3` (38986 B) |

## Validación

- Suite solicitada: `/home/jdiaz/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q` → 346 pruebas, OK (1 omitida).
- `node scripts/check-rpg-client.mjs` → OK; 350 mapas, 27 escenas Nhal y assets RPG reconocidos.
- `npm run check:client` → OK. `git diff --check` → OK.
- QA visual con `codex-browser` en 1366×768 y 390×844: fondos cargados en las seis escenas. Evidencia: `nhal-1366-final-contact.jpg` y `nhal-390-final-contact.jpg` en el informe CM-20. QA local aislado; no es validación de producción.
- Verificación de integridad: seis WebP 1280×960 bajo 250000 bytes con SHA/bytes coincidentes con sidecars; ocho parejas de sprites con dimensiones 48×48 y 192×192 y SHA/bytes coincidentes.
- Sin commit, push, PR, merge ni despliegue. La rama local está tres commits detrás de `origin/main`; no se actualizó porque el encargo fija la base y prohíbe integrar.
