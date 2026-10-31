# Nhal arte 03 — cierre de fondos pendientes

2026-10-31 · Worktree `codex/c2-cm-20-nhal-arte-03`, base `origin/main` (`4ff92d3255a44caeddc59d83c75f786e2d383295`). Entrega local sin commit ni push.

Se completaron las nueve salas pendientes de Nhal: cada fondo es pixel art detallado en vista 3/4, imagen original de image_gen nativo, normalizada desde 1448×1086 a 1280×960 WebP. El `.webp.json` registra prompt, generador, fuente, normalización, calidad, bytes y SHA-256. La misma ruta `backgrounds/<room>.webp` queda en el JSON de escena y como propiedad `background` de su mapa Tiled. No se cambiaron `solid`, salidas, spawns ni posiciones.

## Fondos

| Sala / asset_id | Bytes | Calidad WebP | SHA-256 |
|---|---:|---:|---|
| `nhal_secadero_sombra` | 247956 | 68 | `e8c216c320d71251eec65a4f23ccdf3a729dd94ea9d77a6c7eeee24d6ad41fc4` |
| `nhal_senda_recipiente` | 248016 | 42 | `c05df5a27479744f0ab2258e0af45c85b799e52f68c61f2098c6ab63ba2208c2` |
| `nhal_sendero_altura` | 249318 | 48 | `2c31997ea4ff13606aca2471ae52ec5afd38420d9f8f43aaa00c26ec9b6734c8` |
| `nhal_suelo_hojas` | 245510 | 46 | `8eaf5fc94bdcd51d0d925975219e131326bf4f5bfaab0f4a65b1a20d2a285e60` |
| `nhal_taller_cortezas` | 246918 | 50 | `ddd67493c9aef99882b3c27fb97947e8558eab02d82c29f916d7ee52da1ab065` |
| `nhal_tronco_acostado` | 242190 | 34 | `288866330e4ea05f24ea5aa65fae929b45870c61e971f7b97889c90bf4e87167` |
| `nhal_umbral_elin` | 249744 | 66 | `7d3fc84a512caac47738210423e4c03ce23fb4d968c12eea7a2a4810d373825b` |
| `nhal_umbral_velmora` | 248596 | 58 | `90aa9443e670918d789d551aac0960d200cd1d589b45eca1bff06d2ee0dda44e` |
| `velmora_centro` | 244950 | 40 | `2c49b5287e293c50cfe8304f0067cda18bbdf1d71919b7f29ce44d11d3550b19` |

La inspección con la capa `solid` superpuesta confirmó que árboles, raíces, bancos y rocas coinciden con los bloqueos, y que el paso central y las salidas cardinales quedan visualmente despejados. Los pasos de `nhal_tronco_acostado` rodean el tronco caído; `velmora_centro` conserva sus cuatro rutas. Ningún fondo contiene personajes ni criaturas.

## NPC y fauna

| NPC / asset_id | Archivo | Dimensiones | Bytes | SHA-256 |
|---|---|---:|---:|---|
| `desi` (`nhal_desi`) | `sprites/desi.png` | 192×384; 12 celdas de 64×96 | 95181 | `b0a60f762c2399d96b243ae0554af8b0db02e8c063a18ae2c32915a021bed28a` |
| `elin` (`nhal_elin`) | `sprites/elin.png` | 192×384; 12 celdas de 64×96 | 84803 | `a404fcf4be9aebd3ff8d072a288ce2d28cabcf58492388e4e95e16e1b448e8f5` |

Los atlas transparentes usan cuatro filas (frente, izquierda, espalda, derecha), tres poses por fila, línea de pies común y prompts guardados en sidecars. Se enlazaron `nhal_desi` y `nhal_elin` en el renderer RPG. La fauna de estas escenas ya tenía assets de mapa y batalla en la base; `forajido_camino` sigue usando el sprite compartido `forajido`. No se generaron criaturas, personajes de jugador, Vaisork ni Númenes.

## Validación

- `/home/jdiaz/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q`: 353 pruebas OK; 1 omitida.
- `node scripts/check-rpg-client.mjs`: OK; navegación y sprites NPC dedicados, incluidos Desi y Elin.
- `npm run check:client`: OK.
- `git diff --check`: OK.
- Verificación de arte: 9 WebP 1280×960 y ≤250000 bytes, 2 atlas RGBA 192×384; propiedades de escena/Tiled, transparencia y hashes de los sidecars coinciden.
- No se creó PR ni se hizo merge o despliegue. Pendiente: revisión e integración por el arquitecto.
