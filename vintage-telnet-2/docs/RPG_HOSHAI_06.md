# Hoshai 06 — fondos con escenas conectadas

Entrega local en `codex/cm-20-hoshai-06`, basada en `c41f64f`. Se cubren las seis últimas salas alfabéticamente que no tenían fondo en la base de trabajo: `hoshai_estribacion`, `hoshai_lavadero_roca`, `hoshai_mirador_nudo`, `hoshai_pared_goteo`, `hoshai_repecho_raices` y `hoshai_senda_dosel`.

Los fondos se generaron con image_gen nativo, inspeccionados y normalizados a 1280×960 WebP. Cada `.webp.json` conserva el prompt, procedencia, SHA-256, bytes y calidad. La capa sólida ya existente se cotejó visualmente con cada fondo; el lavadero se regeneró para que el camino oeste-norte y el muro inferior coincidan con su máscara. Las seis escenas conservan IDs, salidas, posiciones, spawns y acciones canónicas; sus fuentes Tiled incluyen la propiedad `background` correspondiente.

| Sala | Bytes | SHA-256 |
|---|---:|---|
| `hoshai_estribacion` | 198714 | `53ef2da9ac0f33db3a08e003126cb8f6a2847b4e759cf7ad551cbc8a1d5c237b` |
| `hoshai_lavadero_roca` | 196342 | `4064e10d091d70ba18730aeaa897fd37711e1fc42002d57f118161b2c33b4d4e` |
| `hoshai_mirador_nudo` | 167326 | `c9e968a455308e5f2642c0a1d27ca9c40ce918aea128842cc931e230d0299002` |
| `hoshai_pared_goteo` | 153994 | `b769bb3af510ab33a7c68e935e305ad515700934aebf4d864b1ee5d92f12e0dc` |
| `hoshai_repecho_raices` | 211688 | `ab0e82f9346e47a008ad0f919c8b39c0ad0d7b68ff403b2b907d6ae1139637b8` |
| `hoshai_senda_dosel` | 196024 | `d54bf186a299d25e00c7b80e750a544e8102095a44b20bd66c446d0548e55257` |

Yesa era la única NPC de estas salas sin atlas dedicado. Se añade `sprites/yesa.png`, 192×384 RGBA con doce celdas 64×96, más su mapping por `hoshai_yesa`. El sprite respeta la anatomía canónica Felaryn y el atlas de referencia existente; no se crean personajes de jugador, Vaisork ni Númenes.

Validación: `node scripts/check-rpg-client.mjs` OK (296 mapas; navegación, 29 escenas Hoshai, colisiones y NPCs); `python -m unittest tests.test_rpg_scenes -q` OK (13); suite completa OK (343, una omitida); `git diff --check` OK. Los seis fondos verifican dimensión, límite de bytes y SHA-256 del sidecar. No se actualizó el conteo de `VAISGARD_RPG_ARTE.md`, reservado al arquitecto. Sin commit, push, PR, merge ni despliegue.
