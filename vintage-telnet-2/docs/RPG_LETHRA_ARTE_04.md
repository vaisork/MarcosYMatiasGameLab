# Lethra arte 04 — fondos finales, atlas y fauna (CM-20)

Fecha: 2026-10-30. Rama `codex/c2-cm-20-lethra-arte-04`, base `origin/main` (`d3ebc4a`). Al cierre, `origin/main` avanzó siete commits de Senku (hasta `3a212c8`), fuera del alcance. Trabajo local sin commit ni push.

Se completan las nueve salas sin fondo sobre las 18 ya ilustradas en Lethra arte 01–03: `lethra_ribera_seca`, `lethra_tierra_esponjosa`, `lethra_tablas_primeras`, `lethra_senda_elevada`, `narevia_centro`, `lethra_taller_fibras`, `lethra_ribera_oeste`, `lethra_ribera_sombra` y `lethra_sala_cuidados`. Lethra queda en 27/27 salas con fondo.

Se aplicó la receta de [RPG_HOSHAI_06.md](RPG_HOSHAI_06.md): image_gen nativo, fondo 1280×960 WebP ≤250000 bytes, detalle pixel-art 3/4 sin actores, fuente Tiled y escena con la propiedad `background`, sidecar `.webp.json` con prompt completo, calidad WebP, bytes y SHA-256. Normalización proporcional a 4:3, reducción Lanczos a 640×480 y ampliación nearest-neighbor a 1280×960. Se cotejaron las nueve ilustraciones con las capas `solid`, rutas y salidas. No hizo falta regenerar: los pasos de agua, madera y tierra mantienen continuidad con las salidas; objetos y vegetación quedan en zonas sólidas.

| Sala | Bytes | SHA-256 | Calidad |
|---|---:|---|---:|
| `lethra_ribera_seca` | 249112 | `dc71d0f9fc11b613bfee5354fdfabce16f8bbad60ed336652bb4918662ca2698` | q72 |
| `lethra_tierra_esponjosa` | 247372 | `345e606b528aa56bd3409ec43ce701789b6a1f5c2b524c4bcc4440fc144c4c52` | q48 |
| `lethra_tablas_primeras` | 242014 | `def9ba39a47004b7ff6b05de7b5be866e19c903c645a6e883ec343425ba39a50` | q64 |
| `lethra_senda_elevada` | 249944 | `a2f2e370c28524adf5694a9db4b9ba9015a1cadde9d0a806900047c49869d20b` | q52 |
| `narevia_centro` | 249348 | `8e0acd9e27a0d49580667da941e7da97443788cf05471c7e1db285e08b6a99d4` | q64 |
| `lethra_taller_fibras` | 248870 | `d93a80c86926f444b5788f12a026bc08663e9913e6ad4498d2f08a4a09d0094b` | q52 |
| `lethra_ribera_oeste` | 247508 | `b9bc5c199904f07517a9227ee352cae82ad48e25768d40ba58df2c54569d0bd8` | q52 |
| `lethra_ribera_sombra` | 247692 | `68181fc7a76aa3c2c7de71e25c445dafd350932fdad86f185d993678bb83bcf6` | q48 |
| `lethra_sala_cuidados` | 249498 | `9701851f21540a37cb248cc93dbb9cd9a4d618e5de50ac19e433da881930ad8b` | q64 |

Sprites nuevos — atlas NPC Marevyn 192×384 (12 celdas de 64×96) para Mira y Ume; sprites de mapa 48×48 y batalla 192×192 para Cienfango. Se añaden los mapeos `lethra_mira`, `lethra_ume` y `cienfango`. Forajido del camino ya dispone de ambos sprites y se conserva sin cambios. Tila (`lethra_nera_mercado`) ya tenía `nera.png`. No se altera el contenido canónico, ni se crea arte de jugadores, Vaisork o Númenes. Cada PNG nuevo incluye sidecar `.png.json` con prompt, fuente, normalización, bytes y SHA-256.

| Archivo | Dimensiones | Bytes | SHA-256 |
|---|---:|---:|---|
| `mira.png` | 192×384 | 106258 | `9c4415149aec1775a2b7f94dfbfab89f908d40981328c2eef00a1d45b588f1dd` |
| `ume.png` | 192×384 | 104683 | `536e0acfc073da62c22eb8c8e6608c0a5bd242a42c0ef351235257623cc62041` |
| `cienfango.png` | 48×48 | 3992 | `056ac7965cfc3acefe26b9b0cd1473d10dfeb434afb95ed85186108ce821e5a7` |
| `cienfango-battle.png` | 192×192 | 53780 | `114c8f444137f039e7bfc6226fd59f8958a056305a645cce1cde1620a3ae47ce` |

La plaza `narevia_centro` conserva las cuatro conexiones; taller y plataforma de cuidados conservan las conexiones canónicas de sus escenas. Los IDs, spawns, salidas, fauna y capas sólidas no cambiaron. No se despliega ni se modifica el motor.

## Verificación

- `/home/jdiaz/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q`: 345 OK, una omitida (185.709 s).
- `node scripts/check-rpg-client.mjs`: OK; incluye Mira/Ume y Cienfango/Forajido en sus comprobaciones de atlas y mapeo; 323 mapas y salidas alcanzables.
- `npm run check:client`: OK.
- `git diff --check`: OK.
- Inspección del montaje de nueve fondos y del atlas transparente; `codex-browser` sirvió `lethra_ribera_seca.webp` en 1280×960. QA de la pantalla de juego aislada no concluyente: su canvas apareció negro durante la captura, por lo que no se afirma navegación visual de las salas en el juego.

El servidor desechable usó datos de prueba y se detuvo; no se usaron datos de producción. Sin commit, push, PR, merge ni despliegue.

