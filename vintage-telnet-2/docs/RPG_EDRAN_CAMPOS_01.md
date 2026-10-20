# Vaisgard RPG — Especificación técnica y validación: Escenas y fauna de Campos de Edran

**Fecha:** 2026-10-17
**Rol:** Implementador AGY (Vaisgard RPG), gestor de arte Codex.
**Entorno:** `/home/jdiaz/proyectos/wt-agy-rpg-edran-campos-01`, rama `agy/rpg-edran-campos-01`, base `origin/main 8b62492`.

---

## 1. Alcance y objetivos

### Fase 1 (Completada en commit `a7135a3`)
Preparación técnica y arquitectónica para incorporar seis escenas reales de los campos de Edran al cliente Vaisgard RPG (`/rpg`), fijando el contrato de geometría, zonas transitables/bloqueadas, salidas reales, spawns y referencias anatómicas de criaturas.

### Fase 2 (Completada en esta entrega)
Integración efectiva de los seis fondos aprobados por Codex (`client-rpg/backgrounds/<id>.webp`, WebP 1280×960 ≤250 KB), creación de los seis archivos de escena de runtime (`client-rpg/scenes/<id>.json`), alineación de colisiones sólidas con la composición visual definitiva de cada fondo, desarrollo del runner focal de QA (`scripts/qa-rpg-edran-campos.py`) y verificación visual interactiva en resoluciones de escritorio (1366×768) y móvil (390×844) mediante `codex-browser`.

Salas integradas:
1. `edran_estanque` (Estanque del Reflejo Partido)
2. `edran_lindero` (Lindero de la Piedra Hundida)
3. `edran_parcela_vieja` (Parcela vieja)
4. `edran_zanja_antigua` (Zanja seca)
5. `edran_bajo_humedo` (Hondonada húmeda)
6. `edran_sauces` (Borde de los Sauces Bajos)

---

## 2. Inventario real de criaturas y estado de sprites

Se respeta estrictamente el canon MUD y el principio de no inventar anatomía ni declarar implementadas criaturas sin sprite dedicado:

| Criatura | Presencia canónica en las 6 salas | Referencia MUD / Bestiario | Sprite RPG integrado | Estado en runtime / Escena |
|---|---|---|---|---|
| `espinajo_rastrojo` | Presente en las 6 salas (`wildlife_pool`) | `/client/art/bestiary/espinajo-rastrojo-anime-v1.webp` | **SÍ** (`sprites/espinajo.png` 48×48, `sprites/espinajo-battle.png` 192×192) | Posicionado en celda libre conectada en las 6 escenas. Visible y funcional. |
| `mordelinde` | `edran_parcela_vieja`, `edran_bajo_humedo` (señal/acción), `edran_sauces` | `/client/art/bestiary/mordelinde-anime-v1.webp` | **SÍ** (`mordelinde.png` / `mordelinde-battle.png`) | Posición explícita en suelo seco; mapa y batalla según snapshot. |
| `cornalomo` | `edran_parcela_vieja`, `edran_sauces` | `/client/art/bestiary/cornalomo-anime-v1.webp` | **SÍ** (mapa 48×48 / batalla 192×192) | Posición explícita en suelo transitable; mapa y batalla según snapshot. |
| `salteador_veterano` | `edran_estanque`, `edran_zanja_antigua` | `/client/art/encounters/forajido-camino-anime-v1.webp` (`combatant_kind: human`) | **SÍ** (mapa 48×48 / batalla 192×192) | Posición explícita en suelo transitable; mapa y batalla según snapshot. |

---

## 3. Contrato de geometría 20×15 y reglas de colisión

- **Dimensiones de la cuadrícula:** 20 columnas (x: 0..19) × 15 filas (y: 0..14).
- **Resolución lógica y Canvas:** Celda lógica de 16 px. El Canvas opera a 640×480 px (escalado entero 32×32 por celda). Fondos WebP a 1280×960 px.
- **Geometría de colisión:** Avatar con volumen `[x - 0.22, x + 0.22]` × `[y - 0.18, y + 0.18]` con pies en `(x + 0.5, y + 0.5)`. Las zonas de paso tienen al menos 1 celda completa de paso libre (`.` en `solid`).
- **Política de Spawns para cardinales sin salida:** Todo cardinal de llegada que no corresponda a una salida real de la escena reutiliza las coordenadas del spawn `default` interior seguro. Esto previene que una llegada teórica ubique al avatar en agua, maleza o rocas.
- **Conectividad de actores:** Todos los actores (`creatures` y `npcs`) residen en celdas transitables conectadas por flood fill con el spawn por defecto.

---

## 4. Geometría final de las seis escenas

### 4.1 `edran_estanque` (Estanque del Reflejo Partido)
- **Fondo WebP:** `backgrounds/edran_estanque.webp` (228 KB, 1280×960 px).
- **Disposición visual final:** El estanque de agua y el tronco sumergido ocupan el cuadrante izquierdo (cols 0–9). La senda de tierra principal discurre de norte a sur por la derecha (cols 10–12), bifurcándose hacia el este (filas 6–8) rumbo a la hondonada. Arbustos y rocas cierran los cuadrantes superior derecho e inferior derecho.
- **Salidas finales:**
  - `norte`: rect `[10, 0, 2, 1]` → `edran_acequia`
  - `sur`: rect `[10, 14, 2, 1]` → `edran_sauces`
  - `este`: rect `[19, 6, 1, 3]` → `edran_bajo_humedo`
- **Spawns finales:** `default`: `[11, 7]`, `norte`: `[10, 1]`, `sur`: `[11, 13]`, `este`: `[18, 7]`, `oeste`: `[11, 7]` (reutiliza default seguro).
- **Criaturas:** `espinajo_rastrojo` en `[12, 7]`, `salteador_veterano` en `[11, 4]`.
- **Matriz de sólidos (`layers.solid`):**
  ```text
  1111111111..11111111
  1111111111..11111111
  1111111111..11111111
  1111111111...1111111
  1111111111...1111111
  1111111111...1111111
  1111111111..........
  1111111111..........
  1111111111..........
  1111111111...1111111
  1111111111...1111111
  1111111111...1111111
  1111111111..11111111
  1111111111..11111111
  1111111111..11111111
  ```

---

### 4.2 `edran_lindero` (Lindero de la Piedra Hundida)
- **Fondo WebP:** `backgrounds/edran_lindero.webp` (239 KB, 1280×960 px).
- **Disposición visual final:** Gran peñasco central y parcelas de cultivo con cercas de madera en toda la franja superior (filas 0–5). Cruce en `T` amplio que comunica el sendero oeste (filas 6–8), este (filas 6–8) y la bajada sur hacia los surcos (cols 9–11). Cuadrantes inferiores cerrados por arboledas a la izquierda y huerto vallado a la derecha.
- **Salidas finales:**
  - `oeste`: rect `[0, 6, 1, 3]` → `edran_loma`
  - `este`: rect `[19, 6, 1, 3]` → `edran_cobertizo_campo`
  - `sur`: rect `[10, 14, 2, 1]` → `edran_surcos`
- **Spawns finales:** `default`: `[10, 7]`, `oeste`: `[1, 7]`, `este`: `[18, 7]`, `sur`: `[10, 13]`, `norte`: `[10, 7]` (reutiliza default seguro).
- **Criaturas:** `espinajo_rastrojo` en `[14, 7]`.
- **Matriz de sólidos (`layers.solid`):**
  ```text
  11111111111111111111
  11111111111111111111
  11111111111111111111
  11111111111111111111
  11111111111111111111
  11111111111111111111
  ....................
  ....................
  ....................
  111111111...11111111
  111111111...11111111
  111111111...11111111
  111111111...11111111
  111111111...11111111
  1111111111..11111111
  ```

---

### 4.3 `edran_parcela_vieja` (Parcela vieja)
- **Fondo WebP:** `backgrounds/edran_parcela_vieja.webp` (234 KB, 1280×960 px).
- **Disposición visual final:** Peñasco con cesta y pala ubicado en la parte inferior izquierda (filas 8–11, cols 1–5). Cultivos secos y rastrojo a la izquierda. Senda que desciende desde la loma al norte (cols 10–11) y se ensancha en una era de tierra firme que conecta con la salida este hacia los surcos (filas 6–8). Parte inferior y lateral oeste bloqueados por vegetación densa.
- **Salidas finales:**
  - `norte`: rect `[10, 0, 2, 1]` → `edran_loma`
  - `este`: rect `[19, 6, 1, 3]` → `edran_surcos`
- **Spawns finales:** `default`: `[11, 6]`, `norte`: `[10, 1]`, `este`: `[18, 7]`, `oeste`: `[11, 6]` (default seguro), `sur`: `[11, 6]` (default seguro).
- **Criaturas:** `espinajo_rastrojo` en `[11, 4]`, `mordelinde` en `[13, 7]`, `cornalomo` en `[16, 7]`.
- **Matriz de sólidos (`layers.solid`):**
  ```text
  1111111111..11111111
  1111111111..11111111
  1111111111...1111111
  1111111111...1111111
  1111111111...1111111
  111111111.........11
  111111111...........
  111111111...........
  1111111111..........
  1111111111...1111111
  1111111111...1111111
  11111111111111111111
  11111111111111111111
  11111111111111111111
  11111111111111111111
  ```

---

### 4.4 `edran_zanja_antigua` (Zanja seca)
- **Fondo WebP:** `backgrounds/edran_zanja_antigua.webp` (214 KB, 1280×960 px).
- **Disposición visual final:** Terrazas superiores de olivos con bancales de piedra a ambos lados del camino norte (cols 10–11). Calzada horizontal ancha (filas 6–8) que cruza de oeste a este. En el extremo este, a la altura de la fila 7, se encuentra la boca en bóveda de piedra del conducto cubierto (`edran_canal_entrada`). Toda la mitad inferior (filas 9–14) está bloqueada por pastizal alto y olivos viejos.
- **Salidas finales:**
  - `oeste`: rect `[0, 6, 1, 3]` → `edran_surcos`
  - `norte`: rect `[10, 0, 2, 1]` → `edran_era`
  - `este`: rect `[19, 6, 1, 3]` → `edran_canal_entrada`
- **Spawns finales:** `default`: `[10, 7]`, `oeste`: `[1, 7]`, `norte`: `[10, 1]`, `este`: `[18, 7]`, `sur`: `[10, 7]` (default seguro).
- **Criaturas:** `espinajo_rastrojo` en `[7, 7]`, `salteador_veterano` en `[13, 7]`.
- **Matriz de sólidos (`layers.solid`):**
  ```text
  1111111111..11111111
  1111111111..11111111
  1111111111..11111111
  1111111111..11111111
  1111111111..11111111
  1111111111..11111111
  ....................
  ....................
  ....................
  11111111111111111111
  11111111111111111111
  11111111111111111111
  11111111111111111111
  11111111111111111111
  11111111111111111111
  ```

---

### 4.5 `edran_bajo_humedo` (Hondonada húmeda)
- **Fondo WebP:** `backgrounds/edran_bajo_humedo.webp` (209 KB, 1280×960 px).
- **Disposición visual final:** Fondo de humedal cenagoso e intransitable en el 60% oriental (cols 10–19). Entrada por el oeste (filas 6–8) que accede a una plataforma rocosa elevada y seca en el cuadrante centro-occidental (filas 6–8, cols 0–9). Extremo oriental cerrado; es un fondo sin salida canónico hacia el este.
- **Salidas finales:**
  - `oeste`: rect `[0, 6, 1, 3]` → `edran_estanque`
- **Spawns finales:** `default`: `[5, 7]`, `oeste`: `[1, 7]`, `este`: `[5, 7]` (default seguro), `norte`: `[5, 7]` (default seguro), `sur`: `[5, 7]` (default seguro).
- **Criaturas:** `espinajo_rastrojo` en `[5, 6]`, `mordelinde` en `[8, 7]`.
- **Matriz de sólidos (`layers.solid`):**
  ```text
  11111111111111111111
  11111111111111111111
  11111111111111111111
  11111111111111111111
  11111111111111111111
  ...11.....1111111111
  ..........1111111111
  ..........1111111111
  ..........1111111111
  11111111111111111111
  11111111111111111111
  11111111111111111111
  11111111111111111111
  11111111111111111111
  11111111111111111111
  ```

---

### 4.6 `edran_sauces` (Borde de los Sauces Bajos)
- **Fondo WebP:** `backgrounds/edran_sauces.webp` (218 KB, 1280×960 px).
- **Disposición visual final:** Sauce corpulento y arroyo de corriente viva en la ribera izquierda (cols 0–9). La senda de tierra entra por el norte (cols 10–12), bordea el árbol y dobla hacia el este (filas 6–8) en dirección a la pasarela sobre los juncos. Bloqueo total al sur e inferior derecho por zarzas espesas.
- **Salidas finales:**
  - `norte`: rect `[10, 0, 2, 1]` → `edran_estanque`
  - `este`: rect `[19, 6, 1, 3]` → `edran_puente_juncos`
- **Spawns finales:** `default`: `[11, 6]`, `norte`: `[11, 1]`, `este`: `[18, 7]`, `oeste`: `[11, 6]` (default seguro), `sur`: `[11, 6]` (default seguro).
- **Criaturas:** `espinajo_rastrojo` en `[12, 6]`, `mordelinde` en `[11, 3]`, `cornalomo` en `[16, 7]`.
- **Matriz de sólidos (`layers.solid`):**
  ```text
  1111111111..11111111
  1111111111..11111111
  1111111111...1111111
  1111111111...1111111
  1111111111....111111
  1111111111....111111
  1111111111..........
  1111111111..........
  1111111111..........
  11111111111...111111
  11111111111...111111
  11111111111...111111
  11111111111111111111
  11111111111111111111
  11111111111111111111
  ```

---

## 5. Validación y resultados de QA

### 5.1 Pruebas de contrato automatizadas
1. `node scripts/check-rpg-client.mjs`:
   - 200 mapas validados (pintados y procedimentales de todas las regiones).
   - Comprobación de colisión de volumen del avatar (`[x±0.22, y±0.18]`).
   - Cero colisiones en spawns; 100% de salidas canónicas alcanzables mediante flood fill.
2. `python -m unittest tests.test_rpg_scenes`:
   - Verificación estricta de límites de cuadrícula, tipos y correspondencia con el mundo (`content/`).
   - Conversión reversible `scene_to_tiled` ↔ `tiled_to_scene` sin pérdida de datos.
   - Verificación de peso de archivos WebP (todos ≤ 250,000 bytes).
3. `python scripts/qa-rpg-edran-campos.py`:
   - Recorrido completo bidireccional entre las 6 escenas y sus vecinas canónicas en base de datos SQLite efímera.
   - Paridad de estado, acciones y movimiento autoritativo verificado.
4. `npm run check:client`:
   - Sintaxis limpia de cliente.
5. `git diff --check`:
   - Cero espacios o saltos de línea irregulares.

### 5.2 QA Visual con `codex-browser`
Se ejecutó inspección visual en Chrome visible mediante el servidor efímero WSGI con auto-login. Se capturaron las 6 salas en escritorio (1366×768) y móvil (390×844), además de pruebas de cruce a escenas genéricas y regreso:
- `campos01-estanque-desktop.png` / `campos01-estanque-mobile.png`
- `campos01-lindero-desktop.png` / `campos01-lindero-mobile.png`
- `campos01-parcela-desktop.png` / `campos01-parcela-mobile.png`
- `campos01-zanja-desktop.png` / `campos01-zanja-mobile.png`
- `campos01-hondonada-desktop.png` / `campos01-hondonada-mobile.png`
- `campos01-sauces-desktop.png` / `campos01-sauces-mobile.png`
- `campos01-cruce-vecina-generica.png` / `campos01-regreso-escena-pintada.png`

Todas las capturas se encuentran almacenadas en `/home/jdiaz/proyectos/entregas/equipo/rpg-preview/`.

---

## 6. Estado de integración y próximo consumidor
- **Trabajo completado:** Fase 2 finalizada en rama `agy/rpg-edran-campos-01`.
- **Próximo consumidor:** revisión del candidato conjunto y autorización de la PR por Javier.
- **Publicación:** el lote se entrega mediante PR; merge y despliegue requieren la aprobación de Javier.

## Revisión del candidato conjunto — 2026-10-17

Los sprites dedicados de Mordelinde, Cornalomo y Salteador veterano ya se integran mediante una asignación fija de IDs en rpg.js. Las seis escenas declaran posiciones explícitas para TODAS las criaturas reales de sus señales y pools (13 posiciones en total), sobre celdas libres conectadas. En particular Mordelinde se ubica en las piedras secas de la hondonada; ninguna criatura nueva depende de la posición de reserva sobre el agua. Una regresión Python comprueba la cobertura de los pools y las celdas libres. Los inventarios y hashes de arte final están en VAISGARD_RPG_ARTE.md. La presencia continúa siendo exclusivamente la del snapshot. Las capturas de fase2 documentan los fondos; el QA final conjunto comprueba los sprites y sus batallas.

Los seis archivos editables `client-rpg/tiled/<id>.tmj` se generan con el conversor existente y se versionan junto a las escenas. La suite verifica identidad de ida y vuelta entre cada archivo guardado y su escena, incluidos fondos y posiciones de criaturas.
