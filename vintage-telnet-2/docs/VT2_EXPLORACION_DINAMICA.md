# VT2 — Exploración Dinámica: Auditoría, Contrato e Investigación (Issue #640)

**Estado:** Auditoría y propuesta de arquitectura (fase previa sin código ni cambios canónicos).
**Fecha:** 2026-10-22
**Origen:** Issue #640 vaisork/MatiasGameLab (Research handoff EXPLORATION-VARIETY-01) y ampliación #641.
**Consumidores:** Historiador, Narrador, Jugabilidad y Arquitectura.

---

## 1. Contexto y Objetivos

El objetivo de la exploración dinámica en Vintage Telnet 2 no es generar mapas infinitos ni saturar al jugador con números aleatorios (RNG plano). El principio rector es:

$$\text{LUGAR} = \text{ESCENARIO PERSISTENTE (HAND-CRAFTED)} + \text{ESTADO VARIABLE (CAPAS CONTEXTUALES)}$$

La geografía de Vaisgard y sus 183 salas permanece fija, reconocible y cartografiada. Lo que varía al regresar a una sala es su estado atmosférico, la fauna, las rutinas de sus habitantes, los incidentes del camino, las pistas de secretos encadenados y las consecuencias de las acciones previas del jugador.

---

## 2. Inventario Real del Código y Contenido Afectados

Auditoría exacta con rutas y números de línea sobre el código actual de `vintage-telnet-2`:

### 2.1 Servidor y Motor (`server/`)

| Archivo | Líneas | Componente / Función | Impacto en Exploración Dinámica |
|---|---|---|---|
| `server/engine.py` | L30–L36 | `allowed(item, state, world)` | Evaluación pura de condiciones: flags del mundo/jugador, especie, clase, nivel y atributos. Base del gating. |
| `server/engine.py` | L41–L62 | `Engine.allowed(self, item, state, world)` | Comprobación de requisitos contextuales: `requires_examined`, `requires_visits` (min/max), `requires_items`, `requires_time`, `requires_weather`, `forbids_weather`, `requires_npc`. |
| `server/engine.py` | L81–L105 | `Engine.room(self, character, world)` | Composición de sala: resuelve hogar, estados condicionales (`states`), criaturas ausentes (`absent_creatures`) y señales activas de fauna (`wildlife`). |
| `server/engine.py` | L107–L130 | `Engine.encounter(self, character, world)` | Generación de fauna dinámica por sala (`wildlife_pool`), enfriamiento compartido (`until = now + 300`), filtrado ambiental y escalado de nivel por distancia a poblados. |
| `server/engine.py` | L132–L136 | `Engine.remember_clue(self, state, room, clue)` | Registro idempotente de pistas descubiertas en `state['flags']` y `state['journal']`. |
| `server/engine.py` | L138–L186 | `Engine.search(self, character, world)` | Acción `buscar`: hallazgos fijos con cooldown en `search_stock` (1800s), tiradas regionales de recursos, rastros/pistas o mensajes de entorno vacío. |
| `server/engine.py` | L188–L198 | `Engine.ambient(self, room, world)` | Determinación determinista de fase del día (`Amanecer`, `Día`, `Atardecer`, `Noche`) y clima regional con hash offset por epoch de 2 horas. |
| `server/engine.py` | L200–L216 | `Engine.people(self, room, state, world, ambient)` | Filtrado de presencia de NPCs según agenda (`schedule`: día/noche) y variantes de estado (`states`). |
| `server/engine.py` | L218–L341 | `Engine.narrative(self, character, world, mode, target)` | **Punto neurálgico de lectura**: composición estratificada de capas (`arrival`, `activity`, `weather`, `memory`, `return`, `danger`, `people`, `echoes`, `numen cues`). Selección y rotación de capa `brief` en visitas recurrentes. |
| `server/engine.py` | L344–L346 | `Engine.local_weather(room, ambient)` | Mapeo de texto climático específico de la sala sobre el clima regional activo. |
| `server/engine.py` | L348–L354 | `Engine.observe(self, state, room, world)` | Registro pasivo en bestiario de criaturas detectadas al mirar u observar. |
| `server/engine.py` | L355–L367 | `Engine.learn_creature_behavior(...)` | Aprendizaje progresivo de conductas de fauna en el bestiario. |
| `server/engine.py` | L562–L589 | `exploration_facts` / `reward_exploration` | Sistema de recompensas de XP por descubrimiento de nuevas salas, criaturas y secretos. |
| `server/engine.py` | L590–L598 | `Engine.visit(self, state, destination, mark_route)` | Actualización de `visited`, `known`, `routes`, `last_room`, `arrival = True`, timestamp `arrived_at` y contador incremental `visits[destination]`. |
| `server/engine.py` | L616–L622 | `Engine.quest_reward(self, state, qid, now)` | Atenuación por repetición (diminishing returns) de encargos repetibles en ventana de 1 hora (100% -> 60% -> 30%). |
| `server/engine.py` | L631–L891 | `Engine.actions(self, character, world)` | Catálogo de acciones contextuales disponibles por sala (servicios, interacciones de númenes, forja, comercio, diálogos). |
| `server/engine.py` | L1057–L1212 | `Engine.apply_action(...)` | Despacho de comandos de exploración: `mirar`, `observar`, `examinar`, `buscar`, `mover`. |
| `server/mechanics.py` | L555–L565 | `exploration_cue(...)` | Reacciones y presagios de Númenes según clima adverso o noche. |
| `server/mechanics.py` | L567–L573 | `INITIAL_STATE` | Estructura persistente del personaje: `visits`, `visited`, `known`, `routes`, `flags`, `bestiary`, `journal`. |
| `server/store.py` | L25 | Esquema tabla `world` | Almacenamiento JSON de estado global compartido: flags, defunciones, clima, reservas (`search_stock`), fauna temporal (`wildlife`). |
| `server/content.py` | L5–L89 | Carga e integridad | Validación estricta de salas, salidas, npcs, criaturas, caminos espaciales y búsquedas regionales. |
| `server/app.py` | L318, L556 | Invocación `visit` | Transiciones de sala y métricas de exploración del personaje. |

### 2.2 Contenido Declarativo (`content/`)

- `content/regions/*.json` (Edran, Hoshai, Korven, Lethra, Nhal, Veyra): definen clima regional, tabla de búsqueda (`search.finds`, `search.traces`, `search.empty`) y salas locales.
- `content/world.json`: catálogo general de salas con sus campos declarativos actuales (`description`, `brief`, `return`, `states`, `arrivals`, `echoes`, `memories`, `signals`, `wildlife_pool`, `hallazgos`, `examine`).

---

## 3. Propuesta Concreta: El Director de Encuentros Estratificado

### 3.1 Modelo de 6 Capas de Variación

Para evitar que una sala se sienta estática sin caer en mapas procedurales amorfos, el motor compondrá la visita combinando las siguientes 6 capas:

```
+-----------------------------------------------------------+
| CAPA 1: AMBIENTE (Frecuente)                              |
| Clima local, hora, niebla, barro, iluminación, visibilidad|
+-----------------------------------------------------------+
| CAPA 2: VIDA (Frecuente)                                  |
| NPCs trabajando, fauna no hostil, viajeros de paso, barks  |
+-----------------------------------------------------------+
| CAPA 3: OPORTUNIDAD (Moderada con cooldown)               |
| Recurso recolectable, mercancía rara, encargo espontáneo  |
+-----------------------------------------------------------+
| CAPA 4: INCIDENTE (Baja frecuencia)                       |
| Carreta averiada, animal herido, discusión, obstáculo     |
+-----------------------------------------------------------+
| CAPA 5: SECRETO / CADENA DE DESCUBRIMIENTO (Rara/Única)    |
| Pistas interconectadas (requiere condición climática/hora)|
+-----------------------------------------------------------+
| CAPA 6: CONSECUENCIA PERSISTENTE                          |
| Estado alterado por decisiones previas del jugador/mundo  |
+-----------------------------------------------------------+
```

### 3.2 Principios del Director de Encuentros

1. **No a tiradas planas independientes:** No tirar 6 dados independientes en cada paso. Un exceso de capas produce un "muro de texto" incomprensible.
2. **Presupuesto de Atención (Atención Máxima = 2 capas dinámicas):** Además de la descripción base (o resumen `brief`), la salida nunca debe mostrar más de 1 o 2 capas accesorias prioritarias.
3. **Cooldowns Contextuales:**
   - Oportunidades: 30 a 60 minutos de tiempo real (usando el patrón existente de `search_stock`).
   - Incidentes: cooldown global por región para no encadenar crisis continuas.
   - Variaciones de vida/ambiente: prohibición estricta de repetición inmediata del mismo microevento en visitas consecutivas a la misma sala (`event_id != last_event_id`).
4. **Anti-sequía (Pity Counter):** Si el jugador realiza 2 transiciones seguidas sin encontrar ninguna novedad perceptible (solo texto base idéntico), en la 3ª transición el director eleva la probabilidad de una capa viva o ambiental al 90%.
5. **Cadenas de Secretos Orientadas a la Curiosidad (Estilo Outer Wilds):** Los secretos no deben ser un drop de 1% de probabilidad de grindear la sala 100 veces. Deben ser cadenas causales:
   - *Paso 1:* Encontrar huellas anómalas en el barro (solo visibles tras lluvia).
   - *Paso 2:* Preguntar al pastor de la zona, quien revela un detalle geográfico.
   - *Paso 3:* Visitar la raíz del árbol viejo con ese conocimiento -> Se habilita la inspección de la grieta.

---

## 4. Evaluación de Bibliotecas y Alternativas Técnicas

Siguiendo la directriz explícita del Issue #640 y la ampliación #641: *«revisar bibliotecas maduras antes de escribir más motor propio»*.

| Necesidad | VT2 Nativo Actual | Ink / inkjs | Yarn Spinner | rot.js | Decisión Arquitectónica para VT2 |
|---|---|---|---|---|---|
| **Estado Narrativo** | Flags en SQLite (`character.state.flags`, `world.flags`) | Variables globales/locales en motor Ink | Variables (`$variable`) en Yarn | No aplica | **ADOPTAR VT2 Nativo**. SQLite es la fuente de verdad multijugador; no duplicar estado en otro runtime. |
| **Condiciones / Gating** | `allowed()` en `engine.py` (flags, hora, clima, especie, atributos) | Expresiones condicionales `{ condition: ... }` | Sintaxis `<<if $cond>>` | No aplica | **ADAPTAR patrones declarativos**. Mantener la evaluación en Python pero estandarizar el esquema JSON. |
| **Diálogo NPC Reactivo** | Topics en JSON (`npcs[id].topics`), memorias contextuales | Nodos ramificados con knots/stitches | Especialidad en árboles de diálogo con barks | No aplica | **ADAPTAR patrón de barks de Yarn**. Escribir pools de 4-6 barks contextuales por NPC en JSON sin incorporar motor externo. |
| **Elecciones / Opciones** | `actions()` autoritativo en servidor | Elecciones ramificadas (`* [opcion]`) | Opciones (`-> opcion`) | No aplica | **ADOPTAR VT2 Nativo**. Las acciones modifican el estado de la partida y requieren validación del servidor Python. |
| **Consecuencias** | Handlers en `apply_action` y `effects()` | Modificación de variables Ink | Comandos `<<set>>` y eventos | No aplica | **ADOPTAR VT2 Nativo**. Consecuencias enlazadas a inventario, sellos, flags y bitácora. |
| **Pools Ponderados** | `wildlife_pool` y `search.finds` con `rng.random()` | Secuencias y shuffles de texto | No resuelve ecología de mundo | Generación procedural / RNG de roguelike | **ADOPTAR VT2 Nativo**. La ponderación en Python nativo requiere 5 líneas de código estándar sin dependencias. |
| **Cooldowns / Anti-repetición** | `search_stock` (timestamps) y rotación `shift` en `narrative` | Visitas contadas como variable | Manejo manual en scripts | Schedulers por turnos/ticks | **ADAPTAR y consolidar en VT2**. Estandarizar un registro de `event_cooldowns` en `character.state` y `world`. |
| **Persistencia Multijugador** | SQLite transaccional servidor | Requiere serialización/deserialización JSON de estado Ink | Requiere bridge de persistencia C#/JS | No persistente | **ADOPTAR VT2 Nativo**. Incorporar runtimes externos rompería la integridad de la base compartida. |
| **Tests y Mantenimiento** | Suite `unittest` en Python (323 tests passing) | Requiere runners JS/Node o compilador Ink | Requiere runner .NET/C# o emulador JS | Suite JS | **ADOPTAR VT2 Nativo**. Cero fricción en el entorno Python de producción. |

### Veredicto de Bibliotecas
- **Ink / inkjs:** **DESCARTAR runtime; ADAPTAR patrones de autoría**. Montar un runtime `inkjs` sobre Node o llamar subprocess desde Python añade latencia, dependencias frágiles y duplicación de estado. Pero el concepto de knots/condiciones inspira el contrato de datos.
- **Yarn Spinner:** **DESCARTAR runtime; ADAPTAR pools de barks**. Los diálogos reactivos a clima/reputación se resuelven mediante listas ponderadas en los JSON de NPCs existentes.
- **rot.js:** **DESCARTAR totalmente**. Diseñado para roguelikes de cuadrícula gráfica/ASCII en navegador. VT2 se basa en grafos de texto MUD topológico (183 nodos interconectados), donde rot.js no aporta valor.
- **Solución Óptima (Ponytail):** **Motor Propio VT2 Declarativo**. Extender ligeramente las estructuras existentes de `engine.py` (menos de 60 líneas de Python bien probado) operando sobre contratos JSON estructurados.

---

## 5. Análisis de Riesgos para Economía, Combate y Canon

### 5.1 Riesgos para la Economía
- **Riesgo (Farmeo por vaivén / Re-entry looping):** Un jugador se desplaza continuamente entre `valdren_plaza` y `valdren_fragua` para recolectar clavos de bronce o sellos cada vez que entra.
  - *Mitigación:* Cooldowns estrictos por ID de evento basados en tiempo real (`search_stock` existente con ventana de 30-60 min). Los eventos de reentrada deben otorgar principalmente **información/rumores** o mejoras de reputación local, reservando los sellos monetarios para encargos formales (`errands.py` / `quests`).
- **Riesgo (Inflación de consumibles):** Generar pociones o ingredientes en exceso durante la exploración trivializa los servicios de botica y posada.
  - *Mitigación:* Las oportunidades de recursos deben tener límites de inventario y probabilidad decreciente según el nivel del jugador.

### 5.2 Riesgos para el Combate
- **Riesgo (Muerte injusta en regreso a zona segura):** Un jugador huye malherido de una cueva hacia Valdren y se topa con un incidente de combate forzado en la entrada del pueblo.
  - *Mitigación:* **Invariante absoluto de zonas seguras (`safe: true`):** En salas seguras (asentamientos, interiores, hogares), los incidentes **NUNCA** inician combate hostil automático. Los incidentes en zonas seguras son sociales, mecánicos o narrativos. En zonas salvajes, todo combate debe estar precedido por una señal visible (`signal`) con telegrafiado, permitiendo al jugador retirarse o rodear el peligro.
- **Riesgo (Desincronización multijugador / Griefing de nivel):** Un jugador veterano de nivel 6 camina por un sendero cercano a Valdren y genera un depredador de nivel alto que aniquila a un jugador recién creado de nivel 1.
  - *Mitigación:* El escalado de nivel de fauna dinámica ya implementado en `engine.py` (L126–L129) por distancia euclidiana/topológica al asentamiento (`nearest_settlement`) debe mantenerse estricto. La fauna cerca de Valdren no debe superar nivel 1-2.

### 5.3 Riesgos para el Canon y la Coherencia de Vaisgard
- **Riesgo (Contradicción del Lore / Alucinación):** Que un microevento aleatorio afirme que "un dragón vuela sobre Valdren" o que "Daro abandonó la forja", rompiendo contratos canónicos establecidos en `CANON_VIGENTE.md`.
  - *Mitigación:* Cero generación procedural de texto por LLM en tiempo de ejecución. Todo el contenido dinámico debe ser **redactado a mano por el Narrador/Historiador**, almacenado en JSON versionados y validado por `content.py` con comprobación de consistencia de IDs de NPCs, criaturas y regiones.

---

## 6. Plan de Piloto con Pruebas Focales

### 6.1 Circuito Seleccionado: El Sendero Oriental de Valdren (Edran)

Se selecciona un circuito de 6 salas ya existentes e interconectadas en `content/regions/edran.json`:
1. `valdren_plaza` (Núcleo urbano, seguro, comercio).
2. `valdren_fragua` (Servicio de forja con Daro, seguro).
3. `valdren_huertos` (Borde del poblado, transición rural).
4. `edran_salida_huertos` (Cruce campestre, salida a caminos).
5. `edran_acequia` (Canal de riego, presencia de agua).
6. `edran_estanque` (Hito natural con fauna menor).

### 6.2 Contenido del Piloto (Catálogo Propuesto para Narración)
- **10 Variaciones Ambientales (Capa 1):** Niebla baja matutina sobre la acequia, olor a carbón de la fragua en la plaza, viento meciendo los juncos en el estanque, lluvia encharcando la salida de huertos.
- **6 Encuentros de Vida Cotidiana / Barks (Capa 2):** Daro afilando una reja de arado, gallinas sueltas picoteando en el patio, ranas cantando en el estanque, aprendiz de hortelano transportando cestos de mimbre.
- **3 Oportunidades con Cooldown (Capa 3):** Esquejes de hierba aromática en la acequia, clavo de hierro caído en la fragua, ramas secas útiles para fuego.
- **2 Incidentes No Hostiles (Capa 4):** Compuerta de la acequia atrancada con ramas (opción de desatascar con Fuerza), perro de granja que ladra asustado ante un matorral.
- **1 Cadena de Secreto en 3 Pasos (Capa 5):**
  - *Paso 1:* Ver una marca de cantería oculta bajo el agua en la acequia (requiere percepción >= 11 o día despejado).
  - *Paso 2:* Preguntar al hortelano sobre las piedras de la acequia -> Menciona que vinieron del terraplén norte.
  - *Paso 3:* Inspeccionar el estanque con esa pista -> Descubrimiento de una losa antigua con inscripción histórica.

### 6.3 Pruebas Unitarias Focales (`test_dynamic_exploration_pilot.py`)
Casos de prueba automatizados requeridos para validar el piloto antes de aceptar la entrega de código:
1. `test_no_immediate_repeat_same_room`: Al salir y volver inmediatamente a la misma sala, nunca se muestra el mismo microevento accesorio.
2. `test_anti_drought_ceiling`: En un recorrido de 20 transiciones en el circuito, la racha máxima consecutiva de visitas sin ninguna variación contextual es <= 2.
3. `test_cooldown_temporal_enforcement`: Una oportunidad recolectada no vuelve a estar disponible antes de expirar su timestamp de cooldown.
4. `test_safe_room_guarantee`: Verificar que el 100% de los eventos evaluados en `valdren_plaza` y `valdren_fragua` tienen `danger = None` y no alteran la condición `safe: True`.
5. `test_secret_chain_prerequisites`: Comprobar que el paso 3 de la cadena de misterio no es resoluble sin los flags otorgados por los pasos 1 y 2.
6. `test_brief_mode_preservation`: Comprobar que en la segunda visita la descripción usa el resumen breve `brief`, pero el comando `mirar` recupera siempre la descripción completa de la sala.

---

## 7. Resultados de la Simulación Numérica

Se ejecutó un script de simulación reproducible (disponible fuera del repo en `/home/jdiaz/proyectos/entregas/equipo/vt2-exploracion-dinamica/simulacion_revisitas.py`) simulando 80 pasos de tránsito en el circuito piloto:

| Métrica Evaluada | Modelo A (RNG Plano sin Memoria) | Modelo B (Cooldowns Fijos) | Modelo C (Director Estratificado Propuesto) |
|---|---|---|---|
| **% Visitas con Novedad Perceptible** | 55.0% | 50.0% | **56.2%** |
| **Racha Máxima de Sequía (pasos vacíos)** | 5 pasos seguidos | 5 pasos seguidos | **3 pasos (reducida un 40%)** |
| **Repeticiones Inmediatas de Evento** | 19 repeticiones molestas | 5 repeticiones | **0 repeticiones (100% filtradas)** |
| **Descubrimiento de Secretos** | Aleatorio (por suerte pura) | Aleatorio | **Causal (100% por progresión de pistas)** |

Los datos completos quedan archivados en:
`/home/jdiaz/proyectos/entregas/equipo/vt2-exploracion-dinamica/metricas_simulacion.json`.

---

## 8. Preguntas Abiertas para Javier

Antes de autorizar la fase de redacción de contenido e implementación de código, se requiere la definición creativa de Javier en los siguientes puntos:

1. **Gasto de Recursos en Oportunidades:**
   ¿Las oportunidades espontáneas de recolección (por ejemplo, cortar hierbas en la acequia o ayudar a desatascar una carreta) deben consumir una pequeña cantidad de fatiga (ej. 2-4 puntos) o deben ser acciones gratuitas sin coste de resistencia?
2. **Visibilidad de las Pistas de Secretos:**
   En las cadenas de misterio (Capa 5), ¿prefieres que la pista se registre explícitamente en la bitácora (`state['journal']`) con un texto claro que oriente al jugador, o que sea un conocimiento implícito que el jugador humano deba retener mentalmente para deducir a dónde ir?
3. **Alcance Multijugador de los Incidentes (Capa 4):**
   Si un jugador encuentra un carro averiado y decide ayudar al arriero a repararlo: ¿ese incidente se repara solo para él en su sesión personal, o el mundo compartido debe recordar que el carro fue reparado para todos los jugadores que pasen por allí durante la siguiente hora?
4. **Tono del Regreso a Casa:**
   Cuando un jugador regresa a Valdren tras una expedición peligrosa, ¿debe sentirse como un alivio inmediato y pacífico (foco en calor de hogar, olores, vida cotidiana), o deseas que persistan pequeños riesgos o tensiones urbanas esporádicas?
