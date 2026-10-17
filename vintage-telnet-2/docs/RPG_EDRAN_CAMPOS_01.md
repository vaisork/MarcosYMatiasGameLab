# Vaisgard RPG — Especificación técnica: Escenas de Campos de Edran (Fase 1)

**Fecha:** 2026-10-17
**Rol:** Implementador AGY (Vaisgard RPG), gestor de arte Codex.
**Entorno:** `/home/jdiaz/proyectos/wt-agy-rpg-edran-campos-01`, rama `agy/rpg-edran-campos-01`, base `origin/main 8b62492`.
**Cuotas reutilizadas:** Medición `USO.md` (2026-10-17 15:12, Gemini 82% corta, 87% semanal).

---

## 1. Alcance y objetivo de Fase 1

Preparación técnica y arquitectónica para incorporar seis escenas reales de los campos de Edran al cliente Vaisgard RPG (`/rpg`), sin arte placeholder ni generación anticipada de escenas JSON de runtime en esta fase. Los fondos serán generados por Codex en `backgrounds/` en la siguiente etapa; esta especificación fija el contrato de geometría, zonas transitables/bloqueadas, salidas reales, spawns y referencias anatómicas de criaturas.

Salas a integrar:
1. `edran_estanque` (Estanque del Reflejo Partido)
2. `edran_lindero` (Lindero de la Piedra Hundida)
3. `edran_parcela_vieja` (Parcela vieja)
4. `edran_zanja_antigua` (Zanja seca)
5. `edran_bajo_humedo` (Hondonada húmeda)
6. `edran_sauces` (Borde de los Sauces Bajos)

---

## 2. Inventario real de criaturas y referencias existentes

Se analiza el estado de cada criatura presente en el canon de las seis salas (`canon.json`, `content/world.json` y `client-rpg/sprites/`), respetando estrictamente el canon MUD y el principio de no inventar anatomía:

| Criatura | Presencia canónica en las 6 salas | Referencia MUD / Bestiario | Sprite RPG existente | Anatomía canónica (MUD / Canon) |
|---|---|---|---|---|
| `espinajo_rastrojo` | Presente en las 6 salas (`wildlife_pool`) | `/client/art/bestiary/espinajo-rastrojo-anime-v1.webp` | **SÍ** (`sprites/espinajo.png` 48×48, `sprites/espinajo-battle.png` 192×192) | Cuadrúpedo bajo y compacto, armadura de púas/espinas de rastrojo en el lomo, ojos ámbar, paso defensivo entre tallos cortados. |
| `mordelinde` | `edran_parcela_vieja`, `edran_bajo_humedo` (señal/acción), `edran_sauces` | `/client/art/bestiary/mordelinde-anime-v1.webp` | **NO** (usa símbolo `?` de fallback) | Pequeño mamífero excavador, hocico puntiagudo para apartar tierra, cuerpo bajo y alargado color tierra, cola corta con pelo, patas delanteras ágiles. Se refugia en agujeros entre raíces. |
| `cornalomo` | `edran_parcela_vieja`, `edran_sauces` | `/client/art/bestiary/cornalomo-anime-v1.webp` | **NO** (usa símbolo `?` de fallback) | Herbívoro masivo de prado, cuerpo alto que sobresale sobre la hierba, huella ancha y partida en dos (como rueda de carro), lomo pesado visible a distancia, cuerno frontal/dorsal. |
| `salteador_veterano` | `edran_estanque`, `edran_zanja_antigua` | `/client/art/encounters/forajido-camino-anime-v1.webp` (`combatant_kind: human`) | **NO** (usa símbolo `?` de fallback) | Humana de pelo gris, cota de malla vieja bien cuidada, espada corta, compostura tranquila y experimentada sentada en rocas al borde del camino. |

*Nota técnica:* Ninguna de las criaturas salvo `espinajo_rastrojo` cuenta con sprite RPG integrado. Codex o el equipo de arte deberán producirlos en encargos dedicados de sprites con formato estandarizado (48×48 para mapa o 64×96 para humanoides).

---

## 3. Contrato de geometría 20×15 y especificación para Codex

- **Dimensiones de la cuadrícula:** 20 columnas (x: 0..19) × 15 filas (y: 0..14).
- **Resolución lógica y Canvas:** Celda lógica de 16 px. El Canvas del cliente opera a 640×480 px (escalado entero 32×32 por celda).
- **Fondos WebP (Codex):** 1280×960 px, RGB WebP (≤250 KB), perspectiva cenital 3/4 (top-down RPG), iluminación cálida desde superior-izquierda, paleta Edran (ocres, verde oliva, tierra húmeda, madera y agua turquesa). Sin actores ni sombras de personajes pintadas en el fondo.
- **Geometría de colisión de avatar:** En `rpg.js`, el avatar ocupa `[x - 0.22, x + 0.22]` × `[y - 0.18, y + 0.18]` con pies en `(x + 0.5, y + 0.5)`. Las zonas de paso deben tener al menos 1 celda completa limpia (`.` en `solid`) sin obstáculos vecinos.
- **Spawns y Flood Fill:** Todo punto de entrada (`spawn[dirección]`) debe situarse en celda transitable y disponer de camino libre continuo mediante flood fill hacia todas las salidas de la escena, verificable por `check-rpg-client.mjs`.

---

## 4. Propuestas técnicas de escenas (Sólidos, Spawns, Salidas y Briefs de Arte)

### 4.1 `edran_estanque` (Estanque del Reflejo Partido)
- **Tipo:** `landmark`
- **Salidas reales canónicas:**
  - `norte` → `edran_acequia`
  - `este` → `edran_bajo_humedo`
  - `sur` → `edran_sauces`
- **Brief para Codex:** Estanque circular que ocupa el cuadrante centro-norte (cols 7–14, filas 3–9). Tronco caído sumergido dividiendo el agua en dos reflejos (quieta al oeste, rápida al este). Orilla de tierra y piedras secas rodeando el estanque por el oeste y el sur. Paso de acequia abierto al norte, salida hacia sauces al sur y sendero hacia la hondonada por el este.
- **Salidas propuestas:**
  - `{"direction": "norte", "rect": [9, 0, 2, 1]}`
  - `{"direction": "sur", "rect": [9, 14, 2, 1]}`
  - `{"direction": "este", "rect": [19, 6, 1, 3]}`
- **Spawns propuestos:**
  - `default`: [4, 7], `norte`: [10, 1], `sur`: [10, 13], `este`: [18, 7], `oeste`: [2, 7]
- **Sólidos (`layers.solid`):**
  - Filas 0 y 14 cerradas salvo rectángulos de salida norte y sur.
  - Columna 0 cerrada con rocas y cercas; columna 19 cerrada salvo salida este.
  - Estanque central bloqueado (cols 7–14, filas 3–9). Sendero transitable en `L` (cols 2–5, filas 1–13) que conecta norte, sur y este.
- **Actores / Criaturas:** `salteador_veterano` / `espinajo_rastrojo` en [4, 5] (piedras secas junto al agua).

---

### 4.2 `edran_lindero` (Lindero de la Piedra Hundida)
- **Tipo:** `landmark`
- **Salidas reales canónicas:**
  - `sur` → `edran_surcos`
  - `oeste` → `edran_loma`
  - `este` → `edran_cobertizo_campo`
- **Brief para Codex:** Campo abierto de hierba peinada por el viento. En el centro (cols 8–11, filas 4–6), una gran piedra antigua semi-hundida con muesca al sur. Una cerca nueva de postes de madera dobla rodeando la piedra dejando paso hacia el este. Cruce de senderos en `T` que une oeste, este y sur. Al norte, matorral alto y cerca perimetral continua.
- **Salidas propuestas:**
  - `{"direction": "oeste", "rect": [0, 6, 1, 3]}`
  - `{"direction": "este", "rect": [19, 6, 1, 3]}`
  - `{"direction": "sur", "rect": [9, 14, 2, 1]}`
- **Spawns propuestos:**
  - `default`: [10, 7], `oeste`: [1, 7], `este`: [18, 7], `sur`: [10, 13], `norte`: [10, 2]
- **Sólidos (`layers.solid`):**
  - Fila 0 bloqueada en su totalidad por cerca y pastizal cerrado.
  - Bloque de la piedra hundida y recodo de cerca (cols 8–11, filas 4–6).
  - Cruce en `T` libre: franja horizontal (filas 6–8) y franja vertical sur (cols 9–11, filas 8–14).
- **Actores / Interactivos:** `espinajo_rastrojo` en [14, 4]. Tablilla de madera (acción `edran_hallar_tablilla`) junto a la cerca en [11, 6].

---

### 4.3 `edran_parcela_vieja` (Parcela vieja)
- **Tipo:** `wilderness`
- **Salidas reales canónicas:**
  - `norte` → `edran_loma`
  - `este` → `edran_surcos`
- **Brief para Codex:** Dos hileras de rastrojo y cultivo abandonado que rematan contra una roca voluminosa. Arco de brotes tiernos alrededor de la piedra sin tocarla. Rincón seco de tierra blanda para descanso junto a la piedra (cols 12–14, filas 7–9). Senda de tierra que desciende desde la loma al norte y tuerce hacia el este rumbo a los surcos. Borde sur y oeste cerrados por maleza espesa y zanjas de desagüe.
- **Salidas propuestas:**
  - `{"direction": "norte", "rect": [9, 0, 2, 1]}`
  - `{"direction": "este", "rect": [19, 6, 1, 3]}`
- **Spawns propuestos:**
  - `default`: [10, 5], `norte`: [10, 1], `este`: [18, 7], `sur`: [10, 13], `oeste`: [2, 7]
- **Sólidos (`layers.solid`):**
  - Columna 0 y Fila 14 bloqueadas por maleza densa.
  - Roca masiva y brotes bloqueados en cols 7–10, filas 8–11.
  - Senda abierta que conecta salida norte [9,0,2,1] bajando hasta fila 6–7 y enlazando con salida este [19,6,1,3].
- **Actores / Criaturas:** `mordelinde` en [6, 10], `espinajo_rastrojo` en [15, 4], `cornalomo` visible al fondo en [3, 2].

---

### 4.4 `edran_zanja_antigua` (Zanja seca)
- **Tipo:** `landmark`
- **Salidas reales canónicas:**
  - `oeste` → `edran_surcos`
  - `norte` → `edran_era`
  - `este` → `edran_canal_entrada`
- **Brief para Codex:** Zanja profunda excavada que cruza el terreno (filas 9–12, cols 4–15). Al este, escalones de piedra empotrados que bajan a la boca abovedada del canal cubierto (`edran_canal_entrada`). Losa vertical clavada en tierra apisonada que marca el cierre del agua antigua. Sendero transitable superior que viene del oeste, se bifurca hacia la era al norte y bordea la zanja hacia los escalones orientales.
- **Salidas propuestas:**
  - `{"direction": "oeste", "rect": [0, 6, 1, 3]}`
  - `{"direction": "norte", "rect": [9, 0, 2, 1]}`
  - `{"direction": "este", "rect": [19, 6, 1, 3]}`
- **Spawns propuestos:**
  - `default`: [10, 5], `oeste`: [1, 7], `norte`: [10, 1], `este`: [18, 7], `sur`: [10, 13]
- **Sólidos (`layers.solid`):**
  - Fila 14 bloqueada por desnivel. Lecho inferior de la zanja bloqueado salvo escaleras al este.
  - Losa vertical sólida en [16, 5–6].
  - Plataforma superior transitable en filas 5–7 que une oeste, norte y este.
- **Actores / Criaturas:** `espinajo_rastrojo` / `salteador_veterano` en [12, 4].

---

### 4.5 `edran_bajo_humedo` (Hondonada húmeda)
- **Tipo:** `wilderness`
- **Salidas reales canónicas:**
  - `oeste` → `edran_estanque` *(Única salida canónica; hondonada sin salida)*
- **Brief para Codex:** Depresión de tierra pantanosa y hierba casi negra. Arroyuelos brillantes serpenteando por cieno blando e intransitable en el 70% del mapa (cols 6–19, filas 0–14). Franja elevada de piedras secas en el extremo oeste (cols 1–5, filas 3–11) donde se detiene el viajero. Entre las raíces del fango se vislumbra la madriguera del Mordelinde. Bordes norte, este y sur cerrados por el desnivel natural.
- **Salidas propuestas:**
  - `{"direction": "oeste", "rect": [0, 6, 1, 3]}`
- **Spawns propuestos:**
  - `default`: [3, 7], `oeste`: [1, 7], `este`: [3, 7], `norte`: [3, 5], `sur`: [3, 9]
- **Sólidos (`layers.solid`):**
  - Todo el cuadrante oriental y central (cols 6–19) bloqueado como barro intransitable.
  - Franja segura transitable en cols 1–4, filas 4–10 comunicada con salida oeste [0, 6, 1, 3].
- **Actores / Interactivos:** `mordelinde` en [10, 6] (en su madriguera en el fango, visible y examinable desde las piedras). Hallazgos de ungüento y hierbas en las piedras secas [3, 4].

---

### 4.6 `edran_sauces` (Borde de los Sauces Bajos)
- **Tipo:** `wilderness`
- **Salidas reales canónicas:**
  - `norte` → `edran_estanque`
  - `este` → `edran_puente_juncos`
- **Brief para Codex:** Sauce corpulento e inclinado cuyas ramas verdes cuelgan rozando el agua como una cortina (cols 2–7, filas 5–12). Raíces gruesas afirmando la ribera. La senda de tierra bordea el árbol por el norte y el este sin meterse bajo sus ramas, doblando hacia el puente de juncos en el este. Al oeste y sur el agua del arroyo impide el paso.
- **Salidas propuestas:**
  - `{"direction": "norte", "rect": [9, 0, 2, 1]}`
  - `{"direction": "este", "rect": [19, 6, 1, 3]}`
- **Spawns propuestos:**
  - `default`: [11, 5], `norte`: [10, 1], `este`: [18, 7], `sur`: [10, 13], `oeste`: [2, 7]
- **Sólidos (`layers.solid`):**
  - Sombra del sauce y aguas del sur/oeste bloqueadas (cols 0–7, filas 6–14). Fila 14 cerrada.
  - Senda transitable en arco: entra por norte [9,0,2,1], pasa por cols 9–13 (filas 2–6) y tuerce hacia salida este [19,6,1,3].
- **Actores / Criaturas:** `mordelinde` en [5, 12] (bajo raíces), `espinajo_rastrojo` en [13, 4], `cornalomo` en [16, 11].

---

## 5. Validación y propuesta de runner focal para Fase 2

### 5.1 Scripts de QA existentes en el repositorio
1. `node scripts/check-rpg-client.mjs`:
   - Valida el contrato del cliente, fetch/acciones, bloqueo de rondas de combate y renderizado.
   - Realiza flood fill automático sobre todas las escenas en `client-rpg/scenes/*.json` y escenas genéricas de todas las regiones, asegurando que ningún spawn overlap con paredes (`blocked(x,y)`) y que cada salida sea alcanzable según el volumen del avatar (`[x±0.22, y±0.18]`).
2. `scripts/qa-rpg-battle.py`:
   - Instancia un servidor WSGI efímero usando `RpgParityTests` (`setUp()` / `doCleanups()`), con base de datos SQLite aislada y auto-login para pruebas seguras sin tocar datos de producción.

### 5.2 Diseño del Runner Focal de Fase 2 (`scripts/qa-rpg-edran-campos.py`)
Para la Fase 2 (cuando existan fondos WebP y archivos `.json` en `scenes/`), se propone un runner focal ligero y no interactivo que:
1. **Entorno aislado:** Instancie `RpgParityTests.setUp()` para crear la base de datos temporal con cuenta y personaje de prueba aprobados.
2. **Navegación de prueba automatizada:** Emita peticiones `POST /api/action` secuenciales recorriendo las seis salas:
   - `edran_acequia` → `edran_estanque` → `edran_bajo_humedo` → `edran_estanque` → `edran_sauces` → `edran_estanque` → `edran_acequia` → `edran_surcos` → `edran_lindero` / `edran_parcela_vieja` / `edran_zanja_antigua`.
3. **Aserciones:**
   - Compruebe respuesta `200` y `snapshot.room.id` correspondiente.
   - Verifique presencia de las salidas esperadas en `snapshot.actions`.
   - Compruebe que cada ID de sala cuente con su archivo `client-rpg/scenes/<id>.json` correspondiente y fondo asociado sin errores 404.
4. **Limpieza estricta:** Ejecute `fixture.doCleanups()` al finalizar para garantizar cero residuos en disco.
5. **Modo interactivo opcional:** Bandera `--serve` que levante el servidor WSGI efímero con AutoLogin en puerto aleatorio para inspección puntual con `codex-browser`.

---

## 6. Próximo consumidor y traspaso
- **Próximo consumidor:** Codex (gestión y generación de fondos de arte en `backgrounds/` conforme a los briefs de la Sección 4).
- **Fase 2 (AGY):** Creación de archivos `client-rpg/scenes/<id>.json` incorporando las matrices definitivas de sólidos y fondos generados, verificación con `check-rpg-client.mjs` y ejecución del runner focal propuesto.
