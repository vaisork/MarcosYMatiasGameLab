# Lethra arte 02 — 2026-10-30

Base `origin/main` `e7c5cc4`; rama `codex/c2-cm-20-lethra-arte-02`.
Se producen las seis siguientes salas alfabéticamente que aún no tenían fondo,
tras `RPG_LETHRA_ARTE_01.md`: escucha_aves, hito_tierra, juncal_abierto,
mercado_hojas, muelle_vecinal y orilla_silente.

Los fondos se generaron con image_gen nativo, sin actores, en pixel art 3/4.
Se normalizaron a 1280×960 WebP, calidad 42, todos ≤250000 bytes. Cada fondo
tiene sidecar `.webp.json` con prompt, fuente, SHA-256, bytes, dimensiones y
calidad. Las referencias son la ilustración canónica de cada lugar en
`client/art/places/` y el fondo RPG `lethra_banco_barro.webp`.

| Fondo | Bytes | SHA-256 |
|---|---:|---|
| `lethra_escucha_aves.webp` | 198414 | `a496d9fd7984e393f8b544e5f731417424d64dda80606eb45f507f9897ff4d11` |
| `lethra_hito_tierra.webp` | 210670 | `ec5d28e5458efd00dd405130de251f43aabdabc8d304b1b51b9641573c215065` |
| `lethra_juncal_abierto.webp` | 220348 | `1a129d81b73fed3c0d0a655867ffd2ada47a033e8160e3ce030dd696100b26a4` |
| `lethra_mercado_hojas.webp` | 212128 | `1a6b978287c9e7ea0197188b5369dabddd3fa1b66e90e590e76fb9a6de99397d` |
| `lethra_muelle_vecinal.webp` | 248560 | `ec02da5b46fef2827ddc262d1b10a76d1ff6fb5241e69e60ab1e3904fc331516` |
| `lethra_orilla_silente.webp` | 240062 | `93cec1a20814e41dc6dab6fb480c402368da9bf0f9dcc676a90874fe71a5f2f9` |

El cruce `juncal_abierto` se regeneró porque la primera versión no mostraba el
paso oeste de la máscara. La final representa una intersección amplia norte-sur
y este-oeste. Se cotejaron las seis ilustraciones con `layers.solid`, spawns y
salidas; las salidas canónicas y las posiciones de actores se conservaron.
Cada escena JSON y su fuente Tiled `.tmj` declaran `background`.

Tila aparece en contenido como NPC `lethra_nera_mercado`; el atlas usa el nombre
de sprite `nera.png` para corresponder con ese ID. Es un atlas transparente de
192×384 (12 celdas de 64×96), basado en las proporciones Marevyn de Nima.
`mordijunco` y `aguaculebra` no tenían sprites RPG: se añaden las variantes de
mapa 48×48 y batalla 192×192. Los cinco PNG tienen sidecars `.png.json` con
prompt, fuente, dimensiones, bytes y hash.

| Sprite | Dimensiones | Bytes | SHA-256 |
|---|---:|---:|---|
| `nera.png` | 192×384 | 107716 | `84c2e625c3174073a7ab389d5e94346ac9c0fc7e163a18cd2a6e44d7e4bc6085` |
| `mordijunco.png` | 48×48 | 2659 | `6a11ffe4ab2a26bd9facde08e1b9744ad767da843f1b386c5dbdb11b57c2edb4` |
| `mordijunco-battle.png` | 192×192 | 49876 | `7fa9b18408ae1dd2fcd69220636ff586b927296097f8c0e284de644ea8d5be88` |
| `aguaculebra.png` | 48×48 | 3987 | `479407902b219acc03758bec10786a48208d038066c761269f30ab9e62610103` |
| `aguaculebra-battle.png` | 192×192 | 41880 | `8a23debce8e2f0d77bd61681afdc7f5d06b6f15316c297dd522f60bbe10ad53c` |

Se amplían las asignaciones de NPC/fauna del cliente para cargar estos recursos.
Validación: suite VT2, 345 pruebas OK (1 omitida, 218.315 s); `node
scripts/check-rpg-client.mjs` OK (323 mapas, rutas y sprites); `npm run
check:client` OK; `git diff --check` OK. Se cotejaron las seis imágenes con sus
máscaras y archivos Tiled. En `codex-browser2` se renderizaron en juego Muelle
Vecinal, Mercado de Hojas, Hito de Tierra y Escucha de Aves; comprobados fondo,
NPC/fauna y salida visible. Capturas: `/tmp/lethra-arte-02-muelle-desktop.png`,
`/tmp/lethra-arte-02-market-qa.png`, `/tmp/lethra-arte-02-hito-desktop.png`,
`/tmp/lethra-arte-02-escucha-desktop.png`. Se tomó además una captura móvil de
la escena de prueba en `/tmp/lethra-arte-02-escucha-mobile.png`. No se completó
el recorrido interactivo de Juncal y Orilla; sus fondos sí se inspeccionaron y
pasaron la comprobación de recursos y geometría.

Sin commit, push, PR, merge ni despliegue.
