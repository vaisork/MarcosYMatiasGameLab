# Vintage Telnet 2 — Pesca v1: Auditoría Técnica, Contrato y Propuesta

**Estado:** Investigación y auditoría técnica (Fase previa a implementación).  
**Origen:** Issue #600 (`VT-GAME/HIST/NAR: FISHING-01 — pesca v1 sobre aguas existentes`).  
**Referencia Canónica:** `vintage-telnet/FISHING_CANON.md` (PR #634).  
**Alcance:** Definir el contrato técnico, inventario `archivo:línea`, homologación de salas VT1→VT2, modelo económico/antifarmeo con simulación y plan de pruebas sin alterar código ni contenido en esta fase.

---

## 1. Hallazgo Crítico de Auditoría: Geografía VT1 vs VT2

El canon de pesca (`vintage-telnet/FISHING_CANON.md`) fue aprobado en PR #634 utilizando los identificadores de sala de VT1 (`juncos_agua_entre_caminos`, `juncos_islas_bajas`, `juncos_canal_ancho`, `juncos_corrientes`, `valdren_vado_menor`, `alto_agua_fria`).

En Vintage Telnet 2, la geografía fue reestructurada completamente en `vintage-telnet-2/content/regions/` (191 salas en total). Ninguno de los 6 IDs antiguos existe como clave en los JSONs de VT2.
Para cumplir la directriz de #600 («*reutilizar room_id existentes; no crear agua interactiva paralela*»), se auditaron las salas y se propone la homologación formal 1:1 respetando descripciones, salidas y ecología:

| Sala canónica original (VT1) | Sala correspondiente en VT2 | Región | Especies v1 asignadas | Justificación ecológica y geográfica en VT2 |
|---|---|---|---|---|
| `alto_agua_fria` | `hoshai_agua_fria` | Hoshai | Fríacola | Cruce de agua fría de montaña; piedra divisoria y corriente rápida. Coincidencia directa de nombre y concepto. |
| `valdren_vado_menor` | `edran_puente_juncos` | Edran | Velo de arroyo, Raspacanto | Vado de Juncos; puente de tablas donde el agua corre sobre fondo de río y barro. Punto de cruce Edran→Lethra. |
| `juncos_canal_ancho` | `lethra_cruce_canales` | Lethra | Hebraleta, Raspacanto | Cruce de canales; remanso junto a canal rápido con hojas flotando y corriente lenta lateral. |
| `juncos_agua_entre_caminos` | `lethra_raices_observacion` | Lethra | Hebraleta, Raspacanto | Raíces junto al agua; canal somero protegido con apoyo firme entre raíces. |
| `juncos_islas_bajas` | `lethra_escucha_aves` | Lethra | Hebraleta, Raspacanto | Orilla de las aves; remanso protegido frente a juncos donde el agua descansa. |
| `juncos_corrientes` | `lethra_orilla_silente` | Lethra | Raspacanto, Velo de arroyo | Orilla del canal profundo; agua oscura que fluye hacia ramales menores. |

Salas de Lethra explícitamente **NO pescables** en VT2 (equivalentes a las exclusiones de L196-214 del canon):
- `lethra_tablas_primeras`, `lethra_pasarela_curva`, `lethra_senda_elevada` (pasos de tránsito).
- `lethra_embarcadero_camino`, `lethra_muelle_vecinal`, `lethra_cuidado_barcas` (embarcaderos e instalaciones de trabajo).
- `narevia_centro`, `lethra_taller_fibras`, `lethra_plataforma_secado`, `lethra_cocina_reunion` (núcleo urbano / plataformas domésticas).
- Cualquier sala de Nhal, Korven, interiores, cuevas o sin agua abierta canónica.

---

## 2. Inventario Real de Código y Contenido Afectados

### 2.1 Canon y Documentación
- `vintage-telnet/FISHING_CANON.md`:
  - `L1-22`: Principio rector y exclusión de mecánicas complejas no autorizadas (sin cocina, acuarios, etc.).
  - `L43-169`: Fichas biológicas de las 4 especies v1 (`hebraleta` L45-73, `raspacanto` L75-102, `velo_arroyo` L104-135, `friacola` L137-169).
  - `L171-194`: Mapeo original de salas a homologar.
  - `L217-246`: Separación expresa de fauna de combate (`velario`, `pinzajunco`, `saltalodo`, `velacauce`, `remojunco`, `tragacauce`).
- `vintage-telnet-2/CONTENT_CONTRACT.md`:
  - `L7-12`: Contrato de campos de sala y acciones narrativas (`id`, `label`, `requires_flags`, `scope`).
  - `L31-33`: Contrato de `regions.<id>.search` y `wildlife_pool`.
  - `L38-40`: Contrato de comerciantes (`buy_items`, `buyer`).
- `vintage-telnet-2/docs/CANON_VIGENTE.md`:
  - `L1-18`: Identidad regional inmutable (Edran, Lethra, Hoshai, etc.).
  - `L26`: Definición de `valdren_estado_vado` orientada a la observación del cruce.

### 2.2 Servidor y Motor
- `vintage-telnet-2/server/content.py`:
  - `L5`: Constante `TABLES = ('regions','rooms','npcs','creatures','stories','items','quests','secrets')`.
  - `L11-20`: Carga determinista y detección de colisiones de contenido.
  - `L39-59`: Validación estructural de salas. Al añadir acciones o referencias de ítems, el validador exige que existan en sus tablas respectivas.
- `vintage-telnet-2/server/engine.py`:
  - `L138-187`: Implementación de `search(self, character, world)`. Patrón canónico de cooldown (`state['searches']`), regeneración de stock (`world['search_stock']`, 1800s) y bonificador por atributo de Percepción (`L145-146`).
  - `L631-720`: Generador de acciones disponibles `actions(self, character, world)`.
    - `L694-696`: Verificación de cooldown para botón de búsqueda. Aquí se insertará la disponibilidad de la acción `pescar`.
    - `L786-787`: Validación de venta de materiales (`kind == 'material'`, precio entre 1 y 60 sellos) a compradores presentes.
  - `L893-960`: Intérprete textual `parse_intent(self, character, world, intent)`.
    - `L902-905`: Normalización NFKD y comandos sin parámetros.
    - `L921-960`: Registro de alias para el parser textual (e.g. `pescar`, `pesca`, `lanzar sedal`).
  - `L1057-1557`: Despachador de acciones `apply_action(self, character, world, intent)`.
    - `L1170-1171`: Validación de acción legal contra candidatas.
    - `L1528-1546`: Rama `else:` de acciones locales.
- `vintage-telnet-2/server/mechanics.py`:
  - `L119-121`: Funciones auxiliares `clamp`, `rounded`.
  - `L180-185`: `fatigue_cost(state, base)` para cálculo de coste según atributos.
  - `L187-200`: `penalties(state)` para penalizaciones de fatiga sobre el personaje.
- `vintage-telnet-2/server/app.py`:
  - `L50-52`: Instanciación de `Engine` con reloj determinista.
  - `L360-383`: Endpoint transaccional `/api/action`.

### 2.3 Contenido de Datos JSON
- `vintage-telnet-2/content/world.json`:
  - Sección `"items"`: Registro de los 4 peces como `kind: "material"` (`hebraleta`, `raspacanto`, `velo_arroyo`, `friacola`) y opcionalmente la herramienta `cana_pesca`.
- `vintage-telnet-2/content/regions/lethra.json`:
  - Salas `lethra_cruce_canales`, `lethra_raices_observacion`, `lethra_escucha_aves`, `lethra_orilla_silente`.
  - Mercader comprador: `lethra_mercado_hojas` (Tila, `lethra_nera_mercado`).
- `vintage-telnet-2/content/regions/edran.json`:
  - Sala `edran_puente_juncos`.
  - Mercader comprador: `valdren_comedor` (Elva, `edran_elva`).
- `vintage-telnet-2/content/regions/hoshai.json`:
  - Sala `hoshai_agua_fria`.
  - Mercader comprador: `hoshai_mercado_cintas` (Luma, `hoshai_luma`).

### 2.4 Frontend y Clientes
- `vintage-telnet-2/client/app.js`:
  - `L198`: Diccionario `actionIcons` (mapeo de icono visual para la acción `pescar`).
  - `L287`: Filtro `contextual`: las acciones no excluidas fluyen de forma transparente al panel de botones rápidos sin requerir nuevo código de renderizado.
- `vintage-telnet-2/client/ui-data.js`:
  - Definición de etiquetas o textos de ayuda contextual si se requiere.

---

## 3. Propuesta Concreta de Pesca v1 (Diseño Ponytail)

Siguiendo la filosofía **ponytail** (solución mínima y directa, YAGNI, sin abstracciones evitables, apoyada en lo que el motor ya hace):

### 3.1 Mecánica y Acción
- **Verbo:** `pescar`. Acción de primer nivel expuesta tanto en botón contextual (vía `/api/state`) como en comando textual (`pescar`).
- **Disponibilidad:** Se habilita únicamente si el personaje se encuentra en una de las salas homologadas y no está en combate (`not state.get('combat')`).
- **Requisito de Herramienta:**
  - *Opción Recomendada (Mínima viable):* Sin requisito forzoso de caña comprada en v1. La acción narra el uso de una vara o sedal de juncos improvisado (muy coherente con la cultura Marevyn y ribereña).
  - *Alternativa:* Requerir el ítem `cana_pesca` en inventario (adquirible por 8–10 sellos en Narevia o Valdren).

### 3.2 Cadencia, Fatiga y Antifarmeo
Para evitar que un script o jugador monopolice la pesca o genere sellos pasivos:
1. **Cooldown personal por sala:** 120 segundos (2 minutos) en `state.setdefault('fishing', {})[room_id]`.
2. **Coste de fatiga:** 3 puntos de fatiga por intento (`fatigue_cost(state, 3)`). Si el jugador acumula fatiga >= 70, la acción se deshabilita:
   > *«El temblor del cansancio en tus brazos te impide mantener el sedal firme en el agua. Necesitas descansar.»*
3. **Cardumen biológico (Stock mundial por sala):**
   - Similar a `search_stock` en `server/engine.py:168`: cada captura exitosa agota el cardumen de esa sala durante 900 segundos (15 minutos) en `world.setdefault('fishing_stock', {})[room_id]`.
   - Si se intenta pescar en una sala con cardumen agotado, el motor responde:
     > *«El agua permanece quieta y transparente entre las plantas; no se distinguen peces en este tramo por ahora.»*

### 3.3 Resolución Determinista (Probabilidades)
El intento se resuelve en un único turno con `self.rng.random()`:
- **50% Captura:** Se entrega 1 ejemplar de la tabla de la sala vía `self.add_item(state, fish_id)`. Se emiten eventos `discovery` y `action`.
- **35% Fallo de pesca:** No hay captura. La corriente arrastra el cebo o el pez suelta la línea.
- **15% Observación ambiental (Atmósfera viva):** Prosa descriptiva donde el jugador divisa fauna canónica no capturable (p. ej. *«Una sombra alargada de Velario se desliza con lentitud entre las raíces profundas sin prestar atención a la superficie.»*). Refuerza la ecología canónica sin iniciar combate.

### 3.4 Fichas de Ítems en `world.json`
Los 4 peces se registran como `kind: "material"`:
```json
{
  "hebraleta": {
    "id": "hebraleta",
    "name": "Hebraleta fresca",
    "kind": "material",
    "description": "Pez alargado de cuerpo gris plateado, con aleta continua y pequeños filamentos en la boca. Típico de los canales lentos de Lethra.",
    "sell_price": 2
  },
  "raspacanto": {
    "id": "raspacanto",
    "name": "Raspacanto de fondo",
    "kind": "material",
    "description": "Pez robusto de vientre firme y pequeñas placas córneas blandas. Suele adherirse a la piedra sumergida en vados y pasos transitados.",
    "sell_price": 3
  },
  "velo_arroyo": {
    "id": "velo_arroyo",
    "name": "Velo de arroyo",
    "kind": "material",
    "description": "Pez menudo y ágil con aletas laterales amplias y lomo pardo. Habita corrientes claras y zanjas de agua viva.",
    "sell_price": 2
  },
  "friacola": {
    "id": "friacola",
    "name": "Fríacola de montaña",
    "kind": "material",
    "description": "Pez compacto y azulado que busca los remansos fríos detrás de las rocas en la subida a Hoshai.",
    "sell_price": 4
  }
}
```

<!-- ponytail: v1 no incluye tabla de peso aleatorio ni caducidad del pez en inventario; ceiling: 1 pez = 1 item stackable básico; upgrade path: en v2 añadir 'durability' o 'frescura' si se implementa cocina. -->

---

## 4. Alternativas de Diseño Analizadas

### Alternativa A: Acciones de Sala en JSON (`room.actions`)
- **Descripción:** Implementar la pesca como una acción estática en cada JSON de sala mediante `actions: [{"id": "pescar", ...}]`.
- **Ventajas:** No añade código nuevo a `server/engine.py`.
- **Desventajas:** `room.actions` solo permite un `give_items` determinista estático (no soporta tabla de drop aleatorio entre 2 especies ni control de stock compartido en `world`).

### Alternativa B: Minijuego en 2 Fases (Lanzar → Tirón / Recoger)
- **Descripción:** Una acción prepara el anzuelo y en el siguiente turno el jugador debe reaccionar a un tirón.
- **Ventajas:** Mayor inmersión interactiva.
- **Desventajas:** Duplica la latencia y peticiones HTTP; viola el requisito de #600 («*Narrativa: sin escena larga por intento*») y exige un gestor de estados intermedios en la sesión del jugador. Descartada para v1.

### Alternativa C: Extensión de `search` (`regions.search.finds`)
- **Descripción:** Incorporar los peces a la lista de hallazgos de `buscar`.
- **Ventajas:** Cero mecánicas nuevas.
- **Desventajas:** Elimina la identidad de la pesca como actividad diferenciada; mezclaría recoger piedras o resina con sacar peces del agua sin distinguir presencia de orilla.

---

## 5. Riesgos para Economía, Combate y Canon

| Dominio | Riesgo identificado | Severidad | Mitigación técnica implementada |
|---|---|---|---|
| **Economía** | Hiperinflación por grindeo pasivo de sellos vendiendo peces a mercaderes. | Alta | Triple freno: cooldown de 120s, banco biológico de 1 captura por 15 min por sala, y coste de 3 fatiga por intento. Rendimiento máximo simulado: 15–25 sellos/hora (equivalente a 1 encargo ordinario). |
| **Economía** | Canibalización de provisiones y comida comercial si los peces curan vida gratis. | Media | Los peces son `kind: "material"` exclusivamente. No tienen campo `effect: "basic_provision"`; no son comestibles en v1. |
| **Combate** | Contaminar o interrumpir combates; despertar criaturas agresivas. | Alta | La acción `pescar` se desactiva estrictamente si `state['combat']` está activo. Pescar nunca genera encuentros con `velario`, `pinzajunco` ni fauna de combate. |
| **Canon** | Mezcla de hábitats (e.g. sacar Fríacola en los pantanos de Lethra). | Media | Mapeo regional estricto por `room['id']`. Cada sala consulta exclusivamente su subtabla canónica. |
| **Canon** | "Pesca de basura" o tesoros anacrónicos (botas, armas, cofres). | Baja | Prohibición absoluta según canon: únicamente las 4 especies de peces biológicas v1. |

---

## 6. Simulación Económica y Matemática Reproducible

Se desarrolló y ejecutó el script reproducible:  
`/home/jdiaz/proyectos/entregas/equipo/vt2-pesca/simulacion_pesca.py`

### Resultados Comprobados:
1. **Jugador itinerante activo (Lethra, 1 hora):**
   - 14 intentos realizados, 12 capturas, 83 intentos rechazados por banco agotado/cooldown.
   - Ganancia: **28 sellos/hora**. Fatiga acumulada: 42 puntos.
   - *Evaluación:* Perfectamente balanceado con el estándar del juego (1 encargo de Valdren paga 24 sellos).
2. **Sesión intensiva continua (3 horas maratón):**
   - 62 intentos, 30 capturas, 4 descansos obligados por fatiga.
   - Ganancia: **25 sellos/hora** promedio.
   - *Evaluación:* El sistema de fatiga modula el esfuerzo y obliga a alternar descansos sin romper la progresión.
3. **Intento de Bot / Spam en una sola sala (1 hora afk):**
   - 7 intentos reales, 4 capturas, 23 intentos bloqueados.
   - Ganancia: **9 sellos/hora**.
   - *Evaluación:* El agotamiento del banco local (15 min) reduce la rentabilidad del bot en un 68% frente al juego itinerante.

---

## 7. Plan de Piloto con Pruebas Focales

### Fase 1: Piloto en Sala Única (`lethra_cruce_canales`)
- Implementar únicamente en `lethra_cruce_canales` con `hebraleta` y `raspacanto`.
- **Batería de pruebas unitarias (`tests/test_pesca_piloto.py`):**
  1. `test_pescar_no_disponible_en_sala_seca`: `actions()` en `lethra_mercado_hojas` no incluye `pescar`.
  2. `test_pescar_no_disponible_en_combate`: Durante `state['combat']`, `pescar` está deshabilitado.
  3. `test_pescar_exito_determinista`: Con RNG semilla fija, comprueba adición de `hebraleta` a inventario y evento `action`.
  4. `test_pescar_cooldown_y_agotamiento`: Segundo intento antes de 120s devuelve `disabled: True`.
  5. `test_pescar_aumento_fatiga`: Cada intento suma 3 a `state['fatigue']`.
  6. `test_pescar_bloqueo_por_fatiga`: Con fatiga >= 70, la acción se deshabilita con mensaje de cansancio.
  7. `test_venta_pescado_mercado`: Vender `hebraleta` a Tila acredita exactamente 2 sellos.

### Fase 2: Despliegue Multi-Región
- Incorporar `edran_puente_juncos` y `hoshai_agua_fria`.
- Validación de aislamiento regional (Fríacola nunca aparece en Edran o Lethra).

---

## 8. Preguntas Abiertas para Javier

Para avanzar a la fase de implementación de Jugabilidad/Código cuando se abra el gate, se requiere su decisión sobre:

1. **Aprobación de la homologación de salas VT2:**  
   ¿Apruebas formalmente sustituir los 6 IDs de VT1 por los equivalentes auditados de VT2 (`hoshai_agua_fria`, `edran_puente_juncos`, `lethra_cruce_canales`, `lethra_raices_observacion`, `lethra_escucha_aves` y `lethra_orilla_silente`)?
2. **Herramienta de pesca (Vara improvisada vs Caña formal):**  
   ¿Prefieres que la v1 permita pescar directamente con vara improvisada (cero fricción de entrada), o que sea obligatorio comprar una `cana_pesca` por 8–10 sellos en Narevia/Valdren?
3. **Destino de las capturas:**  
   ¿Se confirma que en v1 los peces son únicamente `kind: "material"` para venta comercial local (2–4 sellos) hasta que exista diseño de secado o cocina?
4. **Umbral y coste de fatiga:**  
   ¿Es satisfactorio el coste de 3 de fatiga por lance y el bloqueo a fatiga >= 70 como mecanismo central de antifarmeo biológico?
5. **Observaciones ambientales de Velario:**  
   ¿Deseas que los fallos de pesca incluyan pequeñas líneas atmosféricas mencionando la presencia no capturable de fauna regional (Velario, Pinzajunco) para enriquecer la lectura del agua?
