# Veyra arte 01 — fondos y NPC

Lote local sobre `origin/main` (`b193266`, que ya incluye las escenas Veyra de
PR #837). Se ilustraron solo `vaisgard_mercado`, `veyra_acequia_exterior`,
`veyra_archivo_cargas`, `veyra_barrio_cargas`, `veyra_calle_toldos`,
`veyra_cantera_callada`, `veyra_colina_vista`, `veyra_hondonada_canales`,
`veyra_huerta_baja` y `veyra_lindero_arboles`.

## Fondos

Generación con OpenAI image_gen nativo. Briefs basados en `content/regions/veyra.json`
y sus referencias `client/art/places/<id>-anime-v1.webp`. Las salidas y rutas se
conservaron; cada escena y su mapa Tiled declaran `backgrounds/<room_id>.webp`.
Los fondos son 1280×960, sin actores, normalizados con reducción Lanczos a
640×480, ampliación por vecino más cercano y paleta indexada de 64 colores.
WebP lossless, cada archivo ≤250000 bytes. El sidecar contiguo guarda prompt,
origen, normalización, calidad, tamaño y SHA-256.

| Asset | Bytes | SHA-256 |
|---|---:|---|
| `backgrounds/vaisgard_mercado.webp` | 234774 | `c293c4f9c6c8b40f32cfe4089c9d7cb71d0ab67b411da5d7823b2cd6207e2241` |
| `backgrounds/veyra_acequia_exterior.webp` | 227010 | `33e18abc29c502e2d2846b7881a2c896474b19fbc87e80983c53f08546969291` |
| `backgrounds/veyra_archivo_cargas.webp` | 157656 | `c1caa84c16169c1b5da61d64af1bfd529b59a3a7e93d4ef35391fcd7bcc93931` |
| `backgrounds/veyra_barrio_cargas.webp` | 190962 | `538c648a8e586f31681754b43079ec9c5bfc359c5476d28a3677b0b5bb4972ad` |
| `backgrounds/veyra_calle_toldos.webp` | 212448 | `a210461209cc9bc125914bbeed50c1478567cbc2cbd4b6184486ec9c25c210d4` |
| `backgrounds/veyra_cantera_callada.webp` | 239876 | `ffa97e959057fef2b74d0ca3a11f971f12e51c1ec2c9b090d9b421e7751b8d54` |
| `backgrounds/veyra_colina_vista.webp` | 209352 | `c0b737658e298a5dc18f934ce99ba15d846f46498889d404b6517d490d5efcd4` |
| `backgrounds/veyra_hondonada_canales.webp` | 223796 | `9d97ccf0178ab39e9e6751c8a847f37300469d50f6660ddaad2c6d4b852cd524` |
| `backgrounds/veyra_huerta_baja.webp` | 249934 | `932f724c849d4a45b7e9f38be79931bdae7567f21ee98e604a66f53102b73ac1` |
| `backgrounds/veyra_lindero_arboles.webp` | 234692 | `36080ad3bcff866f574ae8f53faedf2a78dbdc173092cf69ed0da4edd0ba2db5` |

`veyra_archivo_cargas` coloca la mesa de clasificación al sureste para dejar
libres la llegada oeste, el pasillo, la aparición central y el puesto de Nera.
Su máscara `solid` marca estantes y mesa, manteniendo la salida y el acceso a
la aparición. Las otras nueve máscaras se conservaron: las rutas visibles
siguen las zonas libres que ya declaran.

## Atlas NPC

Se generaron atlas transparentes de 192×384 (12 celdas de 64×96, tres poses
por dirección) para los IDs canónicos. Se mapearon en `client-rpg/rpg.js`.

| NPC | Atlas | Bytes | SHA-256 |
|---|---|---:|---|
| `veyra_bela` | `sprites/veyra_bela.png` | 100569 | `3f731cb6ccb70df1802afddbea2f984921d594481f864bb355c9953a591ceec7` |
| `veyra_nera` | `sprites/veyra_nera.png` | 125004 | `64d74759b80f76fb0eca0898bb1227efa26de5e64aa4e1cbd90122274d21df1e` |
| `veyra_seli` | `sprites/veyra_seli.png` | 131061 | `912fe1b3f7a3e5f096782a92e558a48b60cf01943f7a610ad803a6999d50be3d` |

El `sprites/nera.png` existente representa a Tila, una Marevyn de Lethra; no
corresponde a Nera de Veyra, que es humana y archivera. Por eso se creó
`veyra_nera.png`. Cada atlas tiene sidecar con prompt, fuente, dimensiones,
normalización, tamaño y SHA-256.

Créditos: ilustraciones generadas con OpenAI image_gen nativo y normalizadas
para el cliente RPG. Los prompts completos y datos de origen están en los
sidecars de cada recurso. No se modificó `sprites/CREDITOS.md`.

## Validación

- `/home/jdiaz/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q`:
  OK: 355 tests, 1 omitido. `test_rpg_veyra.py` comprueba los fondos de este lote;
  conserva la comprobación de las 73 salidas canónicas y su alcanzabilidad.
- `node scripts/check-rpg-client.mjs`: OK; las rutas de spawn y salida son
  alcanzables con las máscaras del lote.
- `npm run check:client`: OK. `git diff --check`: OK.
- Integridad: diez fondos 1280×960 y ≤250000 bytes con SHA/sidecars coincidentes;
  tres atlas 192×384 con alfa y sidecars coincidentes; propiedades `background`
  coincidentes en escenas y mapas Tiled.
- Sin QA de navegador, commit, push, PR, merge ni despliegue.
