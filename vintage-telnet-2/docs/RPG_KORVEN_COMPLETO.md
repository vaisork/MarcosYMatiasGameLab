# Korven Completo — Integración y Navegación (CM-20)

Documentación de cierre de la región de Korven en Vaisgard RPG (2026-10-24, encargo CM-20).

## Estado y Cobertura

- **32/32 salas ilustradas de Korven** (100% de la región): 31 salas `korven_*` y `brumak_centro`.
- **76/191 salas ilustradas de Vaisgard RPG**: Edran 44/44 (32 Edran + 12 Valdren) y Korven 32/32. Quedan 115 salas pendientes (Hoshai 29, Lethra 27, Nhal 27, Veyra 32).
- Todas las 32 salas cuentan con:
  - Fondo WebP optimizado <= 250 KB (`client-rpg/backgrounds/`).
  - Escena declarativa `.json` con capa sólida, salidas y spawns por dirección (`client-rpg/scenes/`).
  - Fuente Tiled `.tmj` con roundtrip exacto bidireccional (`client-rpg/tiled/`).
  - Fondo de combate Dravak `backgrounds/korven_battle.webp` para salas con fauna.

## Aclaración sobre «Korven 06+» y Decisión de Diseño

El informe de pendientes `informe-limpieza-20261024.md` listaba para CM-20:
> «Continuar bloque Korven 06+, pruebas de navegación e integración de salas restantes.»

Tras auditar `content/regions/korven.json` y el historial de PRs (PR #776 «Vaisgard RPG: Korven 04-05, 12 salas ilustradas y Taren — Korven completo (76/191)»):
1. **No existen salas 06+ en Korven**: la región consta exactamente de 32 salas canónicas, ilustradas en los lotes Korven 01 (6), Korven 02 (7), Korven 03 (7), Korven 04 (6) y Korven 05 (6).
2. **Decisión conservadora adoptada**:
   - Completar la integración y verificación end-to-end de toda la región (las 32 salas, 64 salidas internas, 3 fronteras regionales y 6 NPCs).
   - Añadir runner unificado de QA `vintage-telnet-2/scripts/qa-rpg-korven-completo.py` y prueba de regresión en suite `tests.test_rpg_scenes.test_korven_complete_region_and_boundary_exits`.
   - Asentar como siguiente bloque de desarrollo Vaisgard RPG: **Hoshai 01** (29 salas de la región, iniciando en `hoshai_garganta_oeste`, frontera norte de Korven).

## Entidades y Fronteras Verificadas

### 6 NPCs Canónicos
| NPC | Sala | Rol / Diálogo comprobado |
|---|---|---|
| `korven_ved` | `korven_peldanos_cortos` | Guarda de la entrada sur de Brumak (`entrada`) |
| `korven_beran` | `korven_taller_juntas` | Artesano de la piedra y juntas (`afinado`) |
| `korven_ruma` | `korven_almacen_entrada` | Encargada del pesaje y almacén (`almacén`) |
| `korven_neru` | `korven_sala_cuidados` | Cuidadora de heridos (`atención`) |
| `korven_oma` | `korven_registro_cauce` | Revisora del cauce seco (`bloques`) |
| `korven_taren` | `korven_entrante_piezas` | Alfarero del horno de reposo (`horno`) |

### 3 Conexiones Regionales de Frontera
- **Sur (hacia Edran):** `korven_borde_tierra` [sur] <-> `edran_linde_piedra` [norte].
- **Norte (hacia Hoshai):** `korven_meseta_relevo` [norte] <-> `hoshai_garganta_oeste` [sur].
- **Este (hacia Veyra):** `korven_loma_cascajo` [este] <-> `veyra_terraplen_roca` [oeste].

### Fauna y Encuentros
- Sprites de mapa y batalla: `cascapedernal`, `colagrieta`, `quebrarrocas`.
- Fondo regional de batalla: `backgrounds/korven_battle.webp`.

## Validación Ejecutada

- `python scripts/qa-rpg-korven-completo.py --check`: PASS (5/5 etapas: assets y cuotas, navegación 32/32 salas, 6 NPCs, 3 fronteras, sprites de fauna y NPCs).
- `python scripts/qa-rpg-korven-completo.py --test-startup`: PASS (arranque WSGI puerto 8785, GET /rpg 200, snapshot autenticado, acción mirar y parada limpia).
- `python -m unittest tests.test_rpg_scenes -q`: 13/13 PASS.
- `node scripts/check-rpg-client.mjs`: PASS (267 mapas comprobables, navegación y avatares con contorno real).
- `npm run check:client`: PASS.
- `git diff --check`: limpio.
