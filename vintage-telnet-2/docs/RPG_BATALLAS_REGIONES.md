# Fondos de combate por región — CM-20

2026-10-31. Se revisaron `RPG_VEYRA_ARTE_03.md` y `VAISGARD_RPG_ARTE.md`.

## Recursos nuevos

Fondos originales generados con `image_gen` nativo, normalizados a 1280×960
WebP mediante reducción a 640×480 y ampliación por vecino más cercano. Los
sidecars guardan procedencia, prompt, dimensiones, compresión, bytes y SHA-256.
Las composiciones siguen el pixel art detallado y la perspectiva de
`korven_battle.webp` y `veyra_battle.webp`, con centro despejado para los
actores. Hoshai muestra pasos rocosos de montaña; Lethra, ribera y humedal;
Nhal, suelo de bosque bajo dosel cerrado.

| Asset | Bytes | SHA-256 |
|---|---:|---|
| `backgrounds/hoshai_battle.webp` | 244146 | `2f8ff870dcf47bc9b80274bc3f7a871aecbde5e76cf246040cbc2dc4bcebc201` |
| `backgrounds/lethra_battle.webp` | 246712 | `beb6de77d309ee064ef56f720db3bc9d20729f6b12b6b036420a2dc25e15f31e` |
| `backgrounds/nhal_battle.webp` | 246326 | `35223bbaadad61d904ad2b60f5d52338937bf4f2d6a043e009d5bcbb2b64e5ea` |

## Selección

`battleBackgroundImage()` mantiene prioridad para `battle_background` declarado
por escena y, en su ausencia, resuelve `backgrounds/<region>_battle.webp` para
Edran, Korven, Veyra, Hoshai, Lethra y Nhal. Una región desconocida conserva el
fallback legado `edran_battle.webp`. Así la selección ya no depende de que cada
escena repita el fondo regional; la bóveda del dragón mantiene su fondo propio.

La prueba recorre las 191 salas definidas por región, exige una escena por sala
y comprueba que el fondo explícito o el fallback regional exista. También
comprueba tamaño, bytes y hash de los tres sidecars nuevos.

## Validación

- `/home/jdiaz/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q`:
  357 pruebas OK; 1 omitida.
- `node scripts/check-rpg-client.mjs`: OK; seis fallbacks regionales, prioridad
  de override, estados de carga y allowlist.
- `npm run check:client`: OK.
- `git diff --check`: OK.
- Sin prueba con navegador, como se solicitó.
