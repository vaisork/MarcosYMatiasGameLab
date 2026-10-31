# Nhal arte 02 — fondos, NPC y criaturas, 2026-10-31

Entrega local sobre `origin/main` (`29e27f5`, Nhal arte 01). Repite la receta de `RPG_HOSHAI_06.md`: fondos image_gen nativo, pixel art detallado en vista 3/4, 1280×960 WebP ≤250000 bytes, sidecars completos y propiedad `background` en Tiled. Los 12 IDs son las primeras salas pendientes por orden alfabético. Se cotejaron caminos, bloqueos, spawns y salidas reales con las capas `solid`; no cambiaron IDs, salidas, spawns ni colisiones.

## Fondos

| Sala | Archivo | Bytes | Calidad | SHA-256 |
|---|---|---:|---:|---|
| `nhal_helechos_bajos` | `backgrounds/nhal_helechos_bajos.webp` | 246346 | 38 | `0a221c48c7a207cfbcb3bbfa35974a700c74e6d2887e907dbffe48937c9b9a52` |
| `nhal_mercado_setas` | `backgrounds/nhal_mercado_setas.webp` | 243710 | 28 | `94c8e6af48428a73d283d164bc5d76f5358756e98aa0d35352c3fce664522d51` |
| `nhal_patio_relato` | `backgrounds/nhal_patio_relato.webp` | 242904 | 24 | `ef824f220fa66440539b4852fea335abdab6681beaa1a4578150471fd9a418da` |
| `nhal_piedras_musgo` | `backgrounds/nhal_piedras_musgo.webp` | 247148 | 28 | `785d45e2a307a145208e43fc718c3fdb96aad4d0352f91c7fd381e7aad1d3ae7` |
| `nhal_puente_bajo` | `backgrounds/nhal_puente_bajo.webp` | 243690 | 36 | `2e0dd9a83669da65985d5e218dcc5fd53dc691bef8103ea3467fe7c28ef866e6` |
| `nhal_raices_altas` | `backgrounds/nhal_raices_altas.webp` | 238746 | 28 | `32e0914c413ed35bc715b13c99f29b7bceaa7eb0f8b5939d203771e33ccb7a3d` |
| `nhal_raiz_marcada` | `backgrounds/nhal_raiz_marcada.webp` | 237714 | 32 | `6224d0be99bf0a0cea650f40c4e4a0f452994e8ac891935dadf9156952d47c85` |
| `nhal_relevo_altura` | `backgrounds/nhal_relevo_altura.webp` | 237944 | 20 | `4f779d31688c7f704558648f36f4dd007137646b5e61678782262a29b1c42b8a` |
| `nhal_ribera_relevo` | `backgrounds/nhal_ribera_relevo.webp` | 239348 | 24 | `c0df5de14937231169924c048175af4b6a195b63df8c810197e3f2d747534792` |
| `nhal_rincon_semillas` | `backgrounds/nhal_rincon_semillas.webp` | 249716 | 36 | `9a211a40dba2f93373ef43be8b5d63b210d200414a82d7e6a28d2933ebb850b5` |
| `nhal_roca_entre_copas` | `backgrounds/nhal_roca_entre_copas.webp` | 240566 | 28 | `eabdecbd1d6dc07361963279bf3749c2e1cebf043c4e7efa401c601f81a728a4` |
| `nhal_sala_cuidados` | `backgrounds/nhal_sala_cuidados.webp` | 133000 | 64 | `05670a25cab3b4b69251938eef801fc80f0bbaf8a2734050893ae79fda479a36` |

Los 12 sidecars `.webp.json` guardan prompt completo, procedencia, dimensiones de origen, normalización, calidad final, bytes y SHA-256. Cada `.tmj` declara `backgrounds/<room_id>.webp`, igual que su escena correspondiente.

## NPC

Varo, Leris y Sira no tenían atlas RPG dedicado. Se añaden hojas transparentes de 192×384 con doce celdas de 64×96 (cuatro filas cardinales por tres poses); el cliente las asigna por su ID canónico. Diseños Vesperi diferenciados por oficio; cada PNG incluye sidecar con prompt, fuente, dimensiones, tamaño y SHA-256.

| NPC | Atlas | Bytes | SHA-256 |
|---|---|---:|---|
| `varo` (`nhal_varo`) | `sprites/varo.png` (192×384) | 46103 | `960b124ea7919f7640aec1f69e48d63faf9e43eaa8dc8f055f1765047f31f0f8` |
| `leris` (`nhal_leris`) | `sprites/leris.png` (192×384) | 43519 | `583f6c417941f9449bd8b387ece09024c6872a58ef4c6e04cb8b01e9cf8463c6` |
| `sira` (`nhal_sira`) | `sprites/sira.png` (192×384) | 43506 | `479ccb1efe28fb9acd294998d7577e17b0b8f9ae9ed49a5d99664837cc7c8aae` |

## Fauna RPG faltante

Se crean las parejas RPG faltantes de Mordesombra, Quebracáscara y Escarbaraíz. `forajido_camino` ya reutiliza el sprite compartido `forajido`. Los sprites de mapa (48×48) derivan de la versión de batalla (192×192) mediante reducción Lanczos. Ambos tamaños tienen sidecar con prompt, referencia, normalización, bytes y SHA-256.

| Criatura | Mapa 48×48 (bytes; SHA-256) | Batalla 192×192 (bytes; SHA-256) |
|---|---|---|
| `mordesombra` | 3270; `ded80a94eff8fa3b84ca02ca67de8e80024e9e7183cc70a24183961de2b23438` | 34920; `5c7a5d197a5f035904391b383d9bd4dd72c701070a0ab95aa36439ee3f0264a4` |
| `quebracascara` | 3824; `151b5f0423d788bf6b735cfc357ae4cc4140a851512270e7f310d11b81b40d94` | 42522; `58728539135d18b9845587a885eba9819d8cccf9f7b2d0ed3daaf375349f0a98` |
| `escarbaraiz` | 2542; `d06ca3f32d3e8c0e70280fd15081f476c0d60418b54c16a085651f94b3a60043` | 26329; `35a35959c34e8d50d2bdf1e2c6f2cb257055b4ef34da1a11b216cf6b650b7c80` |

## Restantes por ilustrar

Quedan 9 salas sin fondo. Por el límite de esta entrega, se anotan en orden alfabético: `nhal_secadero_sombra`, `nhal_senda_recipiente`, `nhal_sendero_altura`, `nhal_suelo_hojas`, `nhal_taller_cortezas`, `nhal_tronco_acostado`, `nhal_umbral_elin`, `nhal_umbral_velmora`, `velmora_centro`.

No se generaron arte de jugadores, Vaisork ni Númenes.

## Validación

- `/home/jdiaz/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q`: 346 tests OK, 1 omitido.
- `node scripts/check-rpg-client.mjs`: OK; 350 mapas y 27 escenas Nhal, navegación y assets.
- `npm run check:client`: OK. `git diff --check`: OK.
- Integridad: 12 WebP 1280×960 bajo 250000 bytes y SHA/sidecar coincidentes; tres atlas NPC 192×384; tres parejas de fauna 48×48/192×192, transparencia, hashes y mappings correctos.
- Cotejo visual de 12 fondos con máscara `solid` (bloqueos rojo, salidas cian). `codex-browser` abrió el fixture local aislado, pero no llegó a una escena Nhal; no es validación de producción.
- Sin commit, push, PR, merge ni despliegue.
