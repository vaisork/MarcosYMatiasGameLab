# Especificación Técnica: Esquema de NPCs y Viajeros en Vintage Telnet 2 (VT2)

> **Documento:** Auditoría técnica, análisis de vigencia del Issue #645 / PR #637 y contrato de esquema para NPCs y Viajeros N5-lite en VT2.
> **Fecha:** 22 de octubre de 2026.
> **Estado:** Decisión técnica aplicada el 27 de octubre de 2026: conservar el esquema regional nativo de VT2 y validar identidad y sala de origen de NPCs. Sin cambios de canon ni fichas de viajeros.
> **Consumidor:** Javier / Arquitecto (Claude) / Desarrollador delegado.

---

## 1. Estado y contraste del pipeline: ¿Sigue vigente el Issue #645?

**Dictamen directo: NO, el pipeline descrito en el Issue #645 NO sigue vigente.**

El [Issue #645](https://github.com/vaisork/MatiasGameLab/issues/645) fue formulado sobre la base técnica del motor heredado (**VT1 legacy**) antes del cutover del 8 de octubre de 2026. En el registro oficial de migración ([QUEUE_MIGRATION_2026-10-08.md](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/docs/QUEUE_MIGRATION_2026-10-08.md#L14)), el Issue #645 quedó clasificado formalmente como:
> `| #645 | VT-ARCH/DEV: NPC-CONTENT-SCHEMA-01 — soportar content/npcs para N5-lite | SUPERSEDED | Base técnica VT1; necesidades VT2 requieren contrato propio. |`

### Contrastes críticos entre el pipeline de #645 y VT2 actual

| Aspecto | Pipeline Issue #645 / PR #637 (VT1) | Arquitectura actual VT2 |
|---|---|---|
| **Estructura de archivos** | Fichas sueltas en `vintage-telnet/content/npcs/*.json` con `manifest.json` estricto. | Tablas unificadas en [world.json](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/content/world.json) y [regions/*.json](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/content/regions/). Sin `manifest.json`. |
| **Validador de contenido** | [validate-vintage-content.py](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/scripts/validate-vintage-content.py#L417-L420): falla en VT1 porque exige listar en `manifest.json` y rechaza rutas no autorizadas. | La validación de integridad la realiza directamente [content.py](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/server/content.py#L16-L89) al cargar `Content` y la suite [test_real_content.py](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/tests/test_real_content.py). |
| **Geografía de salas** | 43 salas referenciadas en las 5 rutas de PR #637 proceden del grafo de salas de VT1. | **39 de las 43 salas (90.7%) NO existen en VT2**. Sólo existen las 4 cabeceras de asentamiento (`khariel_centro`, `brumak_centro`, `narevia_centro`, `velmora_centro`). En Veyra no existe ninguna de las 6 salas de la ruta. |
| **Esquema de diálogo** | Arrays `conversation_topics`, `initial_talk`, `return_dialogue`, `followup_dialogue`, `dont_know_dialogue`. | Diccionario estricto `topics: {<clave>: <texto \| objeto_con_guardas>}` consumido en [engine.py](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/server/engine.py#L715). |
| **Dependencia de Ollama** | Puente Ollama `#19/#22` vía `npc_generator_adapter.py` para prellenar `personality`. | Descartado en VT2. Servidor determinista autoritativo sin dependencias externas de inferencia. |

---

## 2. Inventario real (archivo:línea) del código y contenido afectados

### Componentes en VT1 (referencia histórica y origen del bloqueo)
- [scripts/validate-vintage-content.py](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/scripts/validate-vintage-content.py#L17):
  - L17: `SCHEMA_VERSION = 1`
  - L140-L199: Exigencia de coincidencia biyectiva entre `manifest.json` y archivos en disco.
  - L417-L420: Rechazo de cualquier ruta distinta a `species.json`, `settlements/*.json`, `narrative/*.json` (`unsupported content path`).
  - L495-L500: `default_content_dir()` apunta a `vintage-telnet/content`.
- [vintage-telnet/content/manifest.json](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet/content/manifest.json#L1-L8): Manifiesto vacío que provoca fallo en `main` al existir `brumak_taller_korven_01.json` y `khariel_taller_hoshai_01.json`.
- [vintage-telnet/npc_generator_adapter.py](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet/npc_generator_adapter.py): Adaptador Ollama de VT1.
- [vintage-telnet/server/travelers.py](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet/server/travelers.py#L1-L285): Lógica de viajeros de VT1 con cálculo temporal y tabla SQLite `traveler_states`.
- Rama `origin/npcs/n5-lite-wave-01` (PR #637): 5 fichas N5-lite (`traveler_hoshai_01.json`, `traveler_korven_01.json`, `traveler_lethra_01.json`, `traveler_nhal_01.json`, `traveler_veyra_01.json`).

### Componentes en VT2 (motor vigente)
- [vintage-telnet-2/server/content.py](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/server/content.py):
  - L5: `TABLES = ('regions','rooms','npcs','creatures','stories','items','quests','secrets')`
  - L11-L20: Carga de `content/world.json` y `content/regions/*.json`.
  - L30-L33: Inyección de temas de Vaisork en `self.npcs`.
  - L48-L50: Validación de presencia: `for npc in room.get('npcs', []): if npc not in self.npcs: raise ValueError(...)`.
  - L61-L83: Validación estricta de `content/spatial.json`: posiciones y carreteras deben coincidir exactamente con el catálogo de salas.
- [vintage-telnet-2/CONTENT_CONTRACT.md](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/CONTENT_CONTRACT.md):
  - L9: Especificación canónica del NPC: `id`, `name`, `species`, `role`, `home_room`, `description`, `topics`, `day`, `night`, `memory`.
  - L21: Estados dinámicos (`states:[{requires_flags, overrides}]`) y `schedule`.
- [vintage-telnet-2/server/engine.py](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/server/engine.py):
  - L56-L62: Guarda `requires_npc` que valida presencia física en sala y horario.
  - L200-L216: Método `people(room, state, world, ambient)`: comprueba `home_room == room['id']`, horario (`schedule`) y resuelve `states` (`description`, `topics`, `memory`).
  - L714-L715: Generación de acciones `hablar` a partir de `npc.get('topics', {})`.
  - L786-L788: Guardas de comercio ligadas a `room['buyer']` y presencia física.
  - L1225-L1241: Ejecución de la acción `hablar`: entrega texto de topic, evalúa guardas, registra `dialogue_memories` y dispara reacciones del Númen.
- [vintage-telnet-2/content/regions/*.json](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/content/regions/):
  - `edran.json` (44 salas, 9 NPCs)
  - `hoshai.json` (29 salas, 6 NPCs)
  - `korven.json` (32 salas, 6 NPCs)
  - `lethra.json` (27 salas, 5 NPCs)
  - `nhal.json` (27 salas, 5 NPCs)
  - `veyra.json` (32 salas, 6 NPCs)
  - Total VT2 actual: 191 salas, 37 NPCs catalogados.
- [vintage-telnet-2/content/spatial.json](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/content/spatial.json): Rejilla espacial esquemática de 191 salas. Toda sala nueva requiere entrada en `positions`.
- [vintage-telnet-2/tests/test_real_content.py](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/tests/test_real_content.py#L18): Instanciación de `Content` y validación de recorridos y diálogo en partidas reales.

---

## 3. Propuesta concreta con alternativas

Para incorporar los 5 viajeros N5-lite de PR #637 respetando los principios de diseño mínimo (*ponytail*) y robustez técnica:

### Alternativa A: Cargador modular `content/npcs/*.json` con normalizador
- **Concepto:** Añadir en [content.py](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/server/content.py#L11) la lectura de `(self.root / 'npcs').glob('*.json')`. Un método adaptador normaliza al vuelo los campos de PR #637 (`conversation_topics` $\to$ `topics`, síntesis de `description` desde `personality_direction`, fijación de `home_room`).
- **Ventajas:** Conserva los archivos JSON individuales authoring-friendly de PR #637.
- **Desventajas:** Añade código de parsing ad-hoc y acoplamiento en `content.py` para un formato que nació desalineado con VT2.

### Alternativa B: Integración nativa en `content/regions/<region>.json` (Recomendada)
- **Concepto:** Convertir las 5 fichas N5-lite al esquema nativo de VT2 definido en [CONTENT_CONTRACT.md](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/CONTENT_CONTRACT.md#L9) e insertarlas directamente bajo la clave `"npcs"` del archivo regional correspondiente (`hoshai.json`, `korven.json`, etc.).
- **Ventajas:**
  - **Cero cambios en el motor:** No toca [content.py](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/server/content.py) ni [engine.py](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/server/engine.py).
  - Coherencia arquitectónica: 100% de los NPCs residen en su región.
  - Sin riesgo de validadores legacy ni `manifest.json`.
- **Desventajas:** No soporta movimiento entre salas a menos que se implemente la rutina de viajeros en el motor.

### Alternativa C: Soporte nativo de Viajeros (Travelers) en VT2
- **Concepto:** Mantener a los NPCs en sus regiones o en `content/npcs/*.json`, pero extendiendo el contrato de NPC con campos opcionales de movilidad:
  ```json
  {
    "id": "hoshai_sira",
    "name": "Sira",
    "species": "felaryn",
    "role": "Mensajera cotidiana",
    "home_room": "khariel_centro",
    "description": "...",
    "topics": { "camino": "...", "clima": "..." },
    "schedule": ["día"],
    "traveler": {
      "route": ["khariel_centro", "hoshai_escalones_sol", "hoshai_terraza_cargas", "hoshai_cuello_roca"],
      "step_seconds": 600,
      "terminal": "reverse"
    }
  }
  ```
- **Mecánica en motor:** En [engine.py:202](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/server/engine.py#L202) (`people()`), si el NPC tiene `traveler`, su sala actual se calcula deterministamente con el reloj global:
  $$\text{paso} = \left\lfloor \frac{\text{now}}{\text{step\_seconds}} \right\rfloor \pmod{\text{longitud\_ciclo}}$$
  Si la sala calculada coincide con la sala actual del jugador, el NPC aparece en `people` aunque no esté en `room['npcs']`.
- **Ventajas:** Posición determinista sin base de datos, 0 overhead en SQLite, viajeros vivos sin scripts en segundo plano.

---

## 4. Riesgos para economía, combate y canon

### 1. Riesgos para la economía (Impacto: BAJO / NULO)
- **Contrato de PR #637:** Las 5 fichas especifican explícitamente en `"limits"`:
  *«No entrega recompensas, loot, sellos, curación ni progreso por conversar.»*
- **Salvaguarda en VT2:** Los viajeros **no** declaran `shop`, `buyer` ni servicios de forja/recuperación en sus fichas. Al no estar enlazados en [engine.py:786](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/server/engine.py#L786), no pueden comprar ni vender piezas, ni otorgar sellos.

### 2. Riesgos para el combate (Impacto: NULO)
- **Salvaguarda en VT2:** Los NPCs de diálogo **no** son criaturas (`creatures`). No tienen entrada en `m.PROFILES` de [mechanics.py](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/server/mechanics.py).
- No generan acciones `combatir` ni `evaluar`. No pueden ser atacados ni iniciar emboscadas.

### 3. Riesgos para el canon y la geografía (Impacto: CRÍTICO)
- **Incompatibilidad de salas:** Como demostró la simulación reproducible ([simular_npc_schema.py](file:///home/jdiaz/proyectos/entregas/equipo/vt2-npc-schema/simular_npc_schema.py)), 39 de las 43 salas de PR #637 no existen en VT2.
  - Intentar forzar esas rutas causaría excepciones de validación en [content.py:44](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/server/content.py#L44) y desajuste con [spatial.json](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/content/spatial.json#L64).
  - **Mitigación:** Es **obligatorio re-rutear** a los 5 viajeros sobre caminos reales ya existentes e interconectados de VT2.
- **Voz y límites de conocimiento:** Las fichas de PR #637 cuentan con directrices de voz excelentes (`knowledge_allowed`, `knowledge_forbidden`, `limits`). No debe utilizarse ningún LLM en runtime; los barks y temas deben transcribirse como texto estático autorizado.

---

## 5. Plan de piloto con pruebas focales

### Selección de Piloto: Sira (Hoshai — Felaryn)
- **Identidad:** Mensajera cotidiana de Khariel.
- **Ruta propuesta sobre geografía real de VT2:**
  1. `khariel_centro` (asentamiento principal)
  2. `hoshai_escalones_sol`
  3. `hoshai_terraza_cargas`
  4. `hoshai_cuello_roca`
  *(Todas son salas consecutivas existentes en `hoshai.json` y trazadas en `spatial.json`).*

### Pruebas focales a ejecutar en la fase de implementación
1. `test_npc_schema_validation`:
   - Cargar `Content` con la ficha de Sira integrada.
   - Verificar que no lanza `ValueError` y que sus campos cumplen [CONTENT_CONTRACT.md](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/CONTENT_CONTRACT.md#L9).
2. `test_traveler_deterministic_presence`:
   - A $T=0\text{s}$, Sira está en `khariel_centro`.
   - A $T=600\text{s}$, Sira está en `hoshai_escalones_sol`.
   - A $T=1200\text{s}$, Sira está en `hoshai_terraza_cargas`.
   - A $T=1800\text{s}$, Sira está en `hoshai_cuello_roca`.
   - A $T=2400\text{s}$, Sira regresa a `hoshai_terraza_cargas` (ping-pong / reverse).
3. `test_traveler_dialogue_and_seals`:
   - El jugador habla con Sira en su ubicación actual sobre el tema `camino`.
   - Comprobar que recibe la respuesta canónica.
   - Comprobar que el saldo de sellos (`seals`) y experiencia (`xp`) del jugador permanece inalterado.
4. `test_spatial_consistency`:
   - `python -m unittest tests.test_spatial_world` pasa al 100% sin discordancia de posiciones.

---

## 6. Preguntas abiertas para Javier

1. **Ubicación canónica — resuelta:** usar `content/regions/<region>.json` bajo `npcs`, cargado por `server/content.py`. No añadir `content/npcs/`, manifiesto ni adaptador del pipeline VT1.
2. **¿Re-ruteo sobre salas existentes o creación de nuevas salas?**
   - ¿Autorizas adaptar las rutas de los 5 viajeros a las salas existentes de VT2 (ej. la senda de terrazas en Hoshai, la cuenca de canteras en Korven, los juncales de Narevia en Lethra, etc.), o Narrativa/Historia prefiere diseñar las salas intermedias exactas que faltan (lo que requeriría ampliar [spatial.json](file:///home/jdiaz/proyectos/wt-agy-vt2-npc-schema/vintage-telnet-2/content/spatial.json))?
3. **¿Estructura del diálogo: temas (`topics`) o barks contextuales?**
   - En VT2, la interfaz muestra botones de temas (`hablar <npc> <topic>`). En PR #637 hay una lista de frases para cada tema (`"camino": ["frase 1", "frase 2"]`). ¿Preferimos que el motor entregue una sola frase fija por tema, o que rote entre las frases disponibles según el contador de visitas?
4. **¿Comportamiento nocturno de los viajeros?**
   - ¿Deben desaparecer/descansar en la posada del pueblo durante la noche (`schedule: ["día"]`), o continuar caminando las 24 horas?

Las decisiones de ruta, diálogo y horario quedan fuera de este cambio: requieren un contrato vigente de viajeros para VT2. No se importan las cinco fichas ni se implementa movimiento hasta cerrar ese contrato y confirmar rutas existentes.

---

*Script de simulación reproducible y evidencia técnica:*
`/home/jdiaz/proyectos/entregas/equipo/vt2-npc-schema/simular_npc_schema.py`
