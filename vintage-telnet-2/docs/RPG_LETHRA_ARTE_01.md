# Lethra arte 01 — 2026-10-30

Se ilustran las seis primeras salas `lethra_*` por orden alfabético de ID que no tenían fondo: Banco de barro, Banco junto al canal, Cocina vecinal, Cruce de canales, Patio de las barcas y Embarcadero del camino. Los IDs, la capa `solid`, las salidas, posiciones, fauna y canon no se alteraron. Cada escena y fuente Tiled declara su `background` correspondiente.

Fondos generados con image_gen nativo. Se inspeccionaron con su máscara de colisión superpuesta; terreno sólido, canales, mobiliario y accesos se mantuvieron fuera de las rutas libres. Cocina se regeneró para respetar el suelo seco y su única salida norte. Normalización mecánica: recorte centrado 4:3, Lanczos a 640×480, ampliación nearest-neighbour a 1280×960 y compresión WebP; sin retoque pintado. El sidecar guarda prompt, origen, hashes, dimensiones, bytes y calidad.

## Fondos

| Archivo | Dimensiones | Bytes | WebP quality | SHA-256 |
|---|---:|---:|---:|---|
| `client-rpg/backgrounds/lethra_banco_barro.webp` | 1280×960 | 211920 | 75 | `9e627befffd01aa1f6fb515000e6b8215175b8bc7f2530a5bedc0caff7b2c7b8` |
| `client-rpg/backgrounds/lethra_banco_conversacion.webp` | 1280×960 | 182662 | 75 | `1d3eab113e713279465334b37f153fa1b201ddff2a6983b353787e99873058a1` |
| `client-rpg/backgrounds/lethra_cocina_reunion.webp` | 1280×960 | 161622 | 75 | `3d4da59b0fb7512181dc668e4e4d8d490dc1eb05ef1da3cf835b5f3af75a31cf` |
| `client-rpg/backgrounds/lethra_cruce_canales.webp` | 1280×960 | 218662 | 75 | `be0ba35fc5f158d3303c9d4faea09ca55a3d1e4fa9f8a95015f76fea18779761` |
| `client-rpg/backgrounds/lethra_cuidado_barcas.webp` | 1280×960 | 191756 | 75 | `d11c591864786872d47673a3103d752a1cd5c63a20b3fa73d33728d32838022c` |
| `client-rpg/backgrounds/lethra_embarcadero_camino.webp` | 1280×960 | 208138 | 75 | `8269a6ef58bcb4b8ec0a0e6a8fda138ad3bb70bed22b764431815c3dfb4dbfe5` |

Sidecars: `client-rpg/backgrounds/<room_id>.webp.json`. Los seis fondos pesan menos de 250000 bytes.

## NPCs

Nima y Sola eran los únicos NPC de las seis salas y no tenían atlas dedicado. Cada PNG es RGBA de doce celdas 64×96 (3 columnas × 4 direcciones), con transparencia real y pie común. Se añadieron sus mappings en `client-rpg/rpg.js`.

| ID | Archivo | Dimensiones | Bytes | SHA-256 |
|---|---|---:|---:|---|
| `lethra_nima` | `client-rpg/sprites/nima.png` | 192×384 | 103436 | `a2001e11407f7f94e1e7d6a1f16355aaca4ae2bc30777872ea37fa8d0f829580` |
| `lethra_sola` | `client-rpg/sprites/sola.png` | 192×384 | 92462 | `5e162526f8c1ade2245667aee8dba881dcf788a256675d6069d94dedacbe96d3` |

## Fauna

Criaturas distintas presentes en las escenas del lote sin pareja de sprites RPG. Cada pareja comparte el diseño y usa recorte transparente independiente: mapa 48×48, batalla 192×192. Los mappings se añadieron a `client-rpg/rpg.js`.

| ID | Mapa: bytes / SHA-256 | Batalla: bytes / SHA-256 |
|---|---|---|
| `cortacorriente` | 2412 / `c21f825812feb312ccd96e470c3b998cfdb48a9aef21319fed6573a625115afe` | 32186 / `846de3fe5ea2f070d18581c90f8e054b179199e1f1bc1c0ae0b2f15ccd4c8f2f` |
| `dorsalodo` | 2764 / `758445205fbfd73ecbde8408715c6698c63905eb579418ba191ea27e71d42158` | 46852 / `e4bd49c05977b154d8864b26d62f3821884ff82da08ef64c0d2ee996b21b962a` |
| `pinzajunco` | 4146 / `f38d7dcf0844c4f4c906d2cdea63d0a3865be63fec76c30653c6acd05baba7ef` | 40496 / `8badef621aa6d2face553c67fa48d8b8cd9e09ecb6127a96893c237feaedec96` |
| `saltalodo` | 4522 / `a4bd5ef90e28de0ec236afe7c8cdcd5931fb13e5505f93961bcc4a646b546461` | 55790 / `3e4483cc35a8b25fe9aff629dc57fc352857ed19dfaefd8f5d91d12039da8bb7` |
| `tragacharco` | 4086 / `a604549a7185e724f34f142012bc5a6b5eeebe83215a0b7eaa114d989d29befe` | 44464 / `0b6d88c105a943a4174d92fc56bf29d09733f99e44232677718f8bacbbb9a585` |
| `faucecieno` | 3537 / `532ae47eb6f5ad1ea150a16200789add9ce7ab7bb56482dddc9c7e2d3e0c6991` | 43253 / `bbc7b1f14c784404669535baf16777dd839f61aaca921919f2b85abe2e994eb8` |
| `sombranutria` | 2592 / `e9c41fa65fd8e7f1ae591217825a9dc87d9285f5006f5edcd5e481819a16ca09` | 32218 / `4dddc2b19c636817dc8c164d9ba5ccab34dc0f31d24687efeb51193d4f4cf3e8` |

Se conservaron los rasgos anatómicos descritos en `content/world.json` y las ilustraciones `/client/art/bestiary/`; los fondos se guiaron por `client/art/places/` y `content/regions/lethra.json`. No se crearon jugadores, arte de Vaisork ni Númenes, ni se alteró contenido autoritativo.

## Validación

- `/home/jdiaz/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q`: 345 pruebas OK, 1 omitida (174.046 s).
- `node scripts/check-rpg-client.mjs`: OK; mappings y dimensiones de atlas fauna/NPC validados.
- `npm run check:client`: OK.
- `git diff --check`: OK. Sidecars, SHA-256, peso/dimensiones y propiedades scene/Tiled verificados por script local.
- Sin commit ni push; el worktree parte de `origin/main` `9587f45` y permanece local.
