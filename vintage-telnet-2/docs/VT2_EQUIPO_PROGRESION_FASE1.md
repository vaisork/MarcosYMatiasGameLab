# VT2 — Progresión de Armas, Armaduras y Protección del Juramentado
## Auditoría Técnica, Contrato de Progresión y Modelo Numérico (Fase 1 — Issue #655)

- **Fecha:** 22 de octubre de 2026
- **Arquitecto:** Claude
- **Implementación de auditoría:** Antigravity (agy)
- **Estado:** Contrato y auditoría cerrada para revisión de Javier. **Sin código de mecánicas alterado.**

---

## 1. Inventario Real del Código Vigente (archivo:línea)

Auditoría exhaustiva sobre el estado real de la base de código en [vintage-telnet-2](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2).

### 1.1. Mecánicas de Combate, Armas y Slots (`server/mechanics.py`)

- **Atributos y Clases Base ([server/mechanics.py#L8-L24](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/mechanics.py#L8-L24)):**
  - `CLASS_ATTRIBUTES`: Cuatro clases canónicas:
    - `juramentado`: fuerza 11, resistencia 10, agilidad 9, percepción 9, intelecto 9, voluntad 10, destreza 10, presencia 12.
    - `arcano`: fuerza 7, resistencia 10, agilidad 8, percepción 12, intelecto 13, voluntad 10, destreza 10, presencia 10.
    - `sombra`: fuerza 8, resistencia 10, agilidad 13, percepción 12, intelecto 7, voluntad 10, destreza 11, presencia 9.
    - `artifice`: fuerza 8, resistencia 10, agilidad 9, percepción 12, intelecto 11, voluntad 10, destreza 13, presencia 7.
  - `ATTRIBUTE_EFFECTS`: Destreza gobierna precisión con armas y bloqueo con escudo (`destreza`: *«Mejora la precisión con armas y el bloqueo con escudo...»*); Resistencia gobierna vitalidad máxima y mitigación pasiva en descanso; Fuerza aumenta daño físico.
- **Acciones y Firmas de Clase ([server/mechanics.py#L25-L51](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/mechanics.py#L25-L51)):**
  - Juramentado: Firma `guardia_comprometida` (reduce 50% de daño directo frontal, cooldown 2 rondas, coste fatiga 4); `paso_ruptura` (interrupción de preparación rival).
  - Arcano: `impulso_arcano` (firma, interrupción/desvío), `velo_contencion` (barrera absorbente), `destello_frio` (ceguera/huida).
  - Sombra: `borrar_foco` (firma, -25% precisión rival, abre flanco), `golpe_apertura` (x1.6 daño en flanco), `distraccion`.
  - Artífice: `tiro_interrupcion` (firma a distancia), `traba_campo` (+25% reducción activa, -15 precisión rival, 4 daño trampa), `balsamo_campo` (+15 vida, -20 fatiga).
- **Diccionario de Armas Base ([server/mechanics.py#L52-L61](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/mechanics.py#L52-L61)):**
  - Solo 8 armas declaradas en `WEAPONS`:
    - `espada_juramento`: daño 10, `block: True`, `activated: True`.
    - `varita_aprendiz`: daño 7, `focus: True`, `activated: True`.
    - `punal_camino`: daño 8, `activated: True`.
    - `arco_ruta`: daño 9, `ranged: True`, `activated: True`.
    - `espada_bastion`: daño 14, `block: True`, `activated: True`.
    - `vara_caudales`: daño 11, `focus: True`, `activated: True`.
    - `daga_aguas_profundas`: daño 12, `activated: True`.
    - `arco_esclusa`: daño 13, `ranged: True`, `activated: True`.
- **Slots de Armadura, Accesorios y Techos ([server/mechanics.py#L123-L147](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/mechanics.py#L123-L147)):**
  - `ARMOR_SLOTS = ('cabeza', 'torso', 'brazos', 'piernas', 'pies')`.
  - `ACCESSORY_SLOTS = ('anillo', 'amuleto')`.
  - `SLOT_NAMES = {'weapon':'arma','block':'escudo','armor':'armadura','cabeza':'cabeza','torso':'torso','brazos':'brazos','piernas':'piernas','pies':'pies','anillo':'anillo','amuleto':'amuleto'}`.
  - `ARMOR_CAP = 0.50` (tope de mitigación pasiva del 50%).
  - Sistema de Fusión: Niveles 1 (+25% sellos, 5 espina_espinajo), 2 (+50% sellos, 5 placa_cascapedernal), 3 (+100% sellos, 3 escama_dragon).
- **Cálculo de Reducción Total de Armadura ([server/mechanics.py#L154-L159](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/mechanics.py#L154-L159)):**
  - `armor_total(state)`: suma `(i.get('armor_reduction', 0) + i.get('fusion', 0) * 0.02)` de todos los objetos equipados cuyo `kind` sea `'armor'` o `'block'`, acotado por `min(ARMOR_CAP, ...)`.
- **Estado Inicial del Personaje ([server/mechanics.py#L565-L573](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/mechanics.py#L565-L573)):**
  - `new_state()` inicializa: `'equipment': {'weapon': weapon['id'], 'armor': None, 'block': None}`.
  - *Hallazgo crítico:* Los slots específicos de piezas (`cabeza`, `torso`, `brazos`, etc.) no vienen precreados en el diccionario base de estado nuevo hasta que una pieza es equipada.
- **Resolución de Daño y Mitigación en Combate ([server/mechanics.py#L729-L946](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/mechanics.py#L729-L946)):**
  - Daño del atacante ([server/mechanics.py#L737-L741](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/mechanics.py#L737-L741)):
    `raw = (weapon['damage'] if weapon else 0) + stat_bonus + 0.25*cg(state) + gear_bonus(state, 'dano') + (weapon.get('fusion', 0)*2)`
    Donde `stat_bonus` para Juramentado es `0.48*(fuerza-10) + 0.12*(destreza-10)`.
  - Acción defensiva de Bloqueo ([server/mechanics.py#L902-L905](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/mechanics.py#L902-L905)):
    `_block_item = equipment.get('block') or (weapon if weapon.get('block') else None)`
    `reduction = max(0, min(0.32 + _block_bonus, 0.10 + 0.0035*(destreza-10) + _block_bonus) - penalty/100)`.
  - Fórmula de Impacto y Mitigación ([server/mechanics.py#L915](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/mechanics.py#L915)):
    `damage = max(1, rounded(profile['damage'] * (1 - reduction) * (1 - state.get('armor_reduction', 0)) * (1 - guard)))`
    - `reduction`: Reducción por acción defensiva activa (bloqueo 10-32%, resistir 0-38%, o 0 si ataca/usa).
    - `armor_reduction`: Reducción pasiva de armadura (acumulación de piezas + escudo, tope 50%).
    - `guard`: Firma de clase (50% en `guardia_comprometida` si el ataque enemigo es frontal; 0% si es lateral o no frontal).
    - `max(1, ...)`: Piso mínimo de 1 punto de daño; la inmunidad absoluta no existe.

---

### 1.2. Motor de Acciones, Comercio y Equipamiento (`server/engine.py`)

- **Verificación de Requisitos de Objetos ([server/engine.py#L30-L36](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/engine.py#L30-L36)):**
  - La función `allowed(item, state, world)` soporta `requires_species`, `requires_classes`, `requires_level`, y atributos mínimos.
  - *Hallazgo crítico de auditoría:* En `mutate()` bajo `action == 'equipar'` ([server/engine.py#L1297-L1307](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/engine.py#L1297-L1307)), **no se comprueba `allowed()`**. Cualquier clase puede equipar cualquier pieza existente si `activated == True` y `condition == 'intact'`.
- **Validación de Bloqueo en Combate ([server/engine.py#L637-L660](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/engine.py#L637-L660)):**
  - Solo se ofrece la opción `Bloquear` si `weapon.get('block')` o `state['equipment'].get('block')` está presente.
  - Si no se tiene escudo ni arma con `block: True`, el motor rechaza la acción: *«Tu equipo no permite esa respuesta: necesitas arma con guardia o escudo.»*
- **Acciones Disponibles de Moledero y Forja ([server/engine.py#L747-L788](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/engine.py#L747-L788)):**
  - `desequipar`: Guarda pieza equipada (`target=category`).
  - `afinar`: Disponible si la sala tiene `forge_service`, arma intacta, no afinada previamente (`item.damage += 1`, coste 12 sellos + material local).
  - `reparar`: Solo disponible si `item.condition == 'damaged_event'` en sala con `forge_service` (coste 8 sellos, cambia a intacto).
  - `vender`:
    - Armas: Solo en sala con `forge_service`, exige confirmación, prohíbe vender el arma equipada o la última arma en inventario.
    - Armaduras y accesorios: En salas con `buys_gear: True`, si la pieza no está equipada.
  - `fusionar`: Exclusivo de sala con `forge_service`, 2 copias del mismo `catalog_id`, nivel < 3, materiales específicos.
  - `equipar`: Exige `condition == 'intact'` y `activated == True`.
- **Lógica de Ejecución de Equipamiento ([server/engine.py#L1297-L1307](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/engine.py#L1297-L1307)):**
  - `category = item.get('slot', item['kind']) if item['kind'] in ('armor', 'accessory') else item['kind']`.
  - Límite por pieza: `if item['kind'] == 'armor' and not 0 <= item.get('armor_reduction', 0) <= 0.35: raise RuleError(...)`.
  - Validación de slot: `category in ('weapon', 'block', 'armor', *m.ARMOR_SLOTS, *m.ACCESSORY_SLOTS)`.
  - Compatibilidad heredada: `if category == 'torso' and state['equipment'].get('armor'): state['equipment']['armor'] = None`.
  - Asignación: `state['equipment'][category] = target`.
  - Recálculo inmediato: `state['armor_reduction'] = m.armor_total(state); state['hp'] = min(state['hp'], m.hp_max(state))`.

---

### 1.3. Contenido y Distribución Regional (`server/content.py`, `content/`)

- **Carga de Datos ([server/content.py#L5-L20](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/server/content.py#L5-L20)):**
  - Carga unificada desde `content/world.json` y `content/regions/*.json`.
  - Validación estricta de tiendas: si `item_id` en `room['shop']` no existe en `items`, el servidor aborta con `ValueError`.
- **Catálogo Existente en `world.json` (37 piezas):**
  - **Armas (16):**
    - Iniciales: `espada_juramento` (10 dmg, block, 85s), `varita_aprendiz` (7 dmg, 40s), `punal_camino` (8 dmg, 50s), `arco_ruta` (9 dmg, 65s).
    - Bastión: `espada_bastion` (14 dmg, block, 150s), `vara_caudales` (11 dmg, 140s), `daga_aguas_profundas` (12 dmg, 145s), `arco_esclusa` (13 dmg, 150s).
    - Progresión general: `espada_larga` (14 dmg, 160s), `espada_vaisgard` (18 dmg, 320s), `punal_hueso` (11 dmg, 120s), `dagas_gemelas` (15 dmg, 280s), `arco_largo` (13 dmg, 150s), `arco_cuerno` (17 dmg, 310s), `varita_sauce` (10 dmg, 130s), `baston_raiz` (15 dmg, 300s).
  - **Armaduras (15 piezas en 3 tiers):**
    - *Tier Cuero (Nivel 1-2):* `gorro_cuero` (0.03, 20s), `jubon_cuero` (0.06, 35s), `brazales_cuero` (0.03, 18s), `grebas_cuero` (0.03, 20s), `botas_cuero` (0.03, 18s). Reducción set: **18%**. Coste set: 111s.
    - *Tier Reforzado (Nivel 3-5):* `casco_reforzado` (0.05, 60s), `coraza_reforzada` (0.10, 110s), `brazales_reforzados` (0.05, 55s), `grebas_reforzadas` (0.05, 60s), `botas_reforzadas` (0.05, 55s). Reducción set: **30%**. Coste set: 340s.
    - *Tier Vaisgard (Nivel 6-8+):* `yelmo_vaisgard` (0.07, 150s), `coraza_vaisgard` (0.14, 280s), `guanteletes_vaisgard` (0.07, 140s), `quijotes_vaisgard` (0.07, 150s), `botas_vaisgard` (0.07, 140s). Reducción set: **42%**. Coste set: 860s.
  - **Accesorios (6):** `anillo_cobre`, `anillo_punteria`, `anillo_filo`, `amuleto_raiz`, `amuleto_viento`, `amuleto_viajero`.
  - **Escudos:** **0 escudos** existentes en los JSON de contenido. Ningún objeto posee actualmente `kind: "block"` o `slot: "block"`. Solo existen mocks en `tests/test_fusion.py`.
- **Servicios de Forja y Tiendas Regionales Vigentes:**
  - `valdren_fragua` (Edran): `forge_service: "edran_daro"`, `honing_mat: "fibra_espinajo"`, vende armas base, intermedias y set de cuero completo.
  - `korven_taller_juntas` (Korven): `forge_service: "korven_beran"`, `honing_mat: "piedra_veteada"`, `buys_gear: True`, vende set reforzado y armas pesadas.
  - `hoshai_mercado_cintas` (Hoshai): `buys_gear: True`, venta de arcos, puñales y piezas ligeras.
  - `lethra_mercado_hojas` (Lethra): `buys_gear: True`, varitas, puñales, túnicas/cuero.
  - `nhal_mercado_setas` (Nhal): `buys_gear: True`, varitas, arcos y piezas naturales.
  - `vaisgard_mercado` (Veyra): `buys_gear: True`, vende los tres tiers completos y accesorios avanzados.

---

### 1.4. Batería de Pruebas Vigentes

- [tests/test_forge.py](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/tests/test_forge.py): Cobertura de afinado (+1 daño), reparación de `condition: damaged_event` por 8 sellos, y restricciones de venta.
- [tests/test_fusion.py](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/tests/test_fusion.py): Cobertura de fusión de armas, armaduras y escudos ficticios (`escudo_madera`), validación del tope `ARMOR_CAP = 0.50` y conservación de slots equipados.
- [tests/test_class_combat.py](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/tests/test_class_combat.py): Validación de acciones exclusivas, `guardia_comprometida` (50% mitigación ante ataques frontales, 0% ante laterales) y `paso_ruptura`.
- [tests/test_tactical_contract.py](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/tests/test_tactical_contract.py): Validación de la acción `bloquear` condicionada a portar arma con guarda o escudo.
- [tests/test_engine.py](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/tests/test_engine.py): Gestión de slots, equipamiento y compra/venta.

---

## 2. Catálogo Escalonado Propuesto y Contrato Creativo

### 2.1. Escalonamiento por Región, Clase y Nivel

| Tier / Nivel | Armas Juramentado | Armas Otras Clases | Armaduras / Piezas | Escudos | Región y Vía de Obtención |
|---|---|---|---|---|---|
| **Tier 1 (N1-2)** *Caminos y Llanos* | • `espada_juramento` (10 dmg, 1M, block)<br>• `lanza_corta_camino` (11 dmg, 2M, sin block) | • `punal_camino` (8 dmg)<br>• `varita_aprendiz` (7 dmg)<br>• `arco_ruta` (9 dmg) | Set Cuero (cabeza, torso, brazos, piernas, pies). Reducción: **18%**. | • `rodela_mimbre_cuero` (0.04 red, 30s) *(requiere aprobación)* | Valdren (Edran). Compra con Daro o botín pacífico de encargos iniciales. |
| **Tier 2 (N3-5)** *Regional Especializado* | • `espada_larga` (14 dmg, 1M, block)<br>• `mandoble_rastrojo` (16 dmg, 2M, sin block)<br>• `martillo_pedral` (15 dmg, 1M, Korven) | • `punal_hueso` (11 dmg)<br>• `varita_sauce` (10 dmg)<br>• `arco_largo` (13 dmg) | Set Reforzado (placas de hierro y tachuelas). Reducción: **30%**. | • `escudo_hierro_veteado` (0.06 red, 75s) *(requiere aprobación)* | Fragua de Beran (Korven), mercados de Lethra, Nhal y Hoshai. |
| **Tier 3 (N6-8+)** *Metropolitano Vaisgard* | • `espada_vaisgard` (18 dmg, 1M, block)<br>• `mandoble_bastion_antiguo` (20 dmg, 2M, block) | • `dagas_gemelas` (15 dmg, 2M)<br>• `baston_raiz` (15 dmg, 2M)<br>• `arco_cuerno` (17 dmg, 2M) | Set Vaisgard (acero templado de la capital). Reducción: **42%**. | • `pavés_de_vaisgard` (0.08 red, 160s) *(requiere aprobación)* | Gran Mercado de Vaisgard (Veyra). Encargos de alto rango de la capital. |
| **Tier 4 (N8-10)** *Reliquias del Bastión* | • `espada_bastion` (14 dmg + fusionable)<br>• `gran_escudo_esclusa` (0.10 red, especial) | • `daga_aguas_profundas` (12 dmg)<br>• `vara_caudales` (11 dmg)<br>• `arco_esclusa` (13 dmg) | Fusión completa de sets (+0.02 por pieza, máx +3) | Piezas fusionadas de Bastión | Mazmorra del Bastión / Dragón de las Aguas Antiguas. |

### 2.2. Mecánica de Escudo vs. Dos Manos (`two_handed`)

- **Problema detectado en la auditoría:** Actualmente no existe la propiedad `two_handed` en ninguna arma. El jugador puede equipar simultáneamente `espada_larga` o `arco_largo` en `weapon` y un escudo en `block`.
- **Regla propuesta para Fase 2:**
  - Armas a una mano (`hands: 1` o por defecto): Permiten portar un escudo en slot `block`.
  - Armas a dos manos (`two_handed: True`): Mandobles, arcos, bastones pesados y dagas gemelas.
  - Al equipar un arma con `two_handed: True`: Si el slot `block` contiene un escudo, se desequipa automáticamente a la mochila con evento informativo (*«Envainas el arma y necesitas ambas manos; guardas el escudo en la mochila»*). Intentar equipar un escudo teniendo un arma de dos manos equipada arroja: `RuleError('Esta arma requiere ambas manos; no puedes embrazar un escudo.', 409)`.
- **Dilema táctico del Juramentado:**
  1. *Espada y Escudo (1 Mano):* Daño base menor (10-14), pero acceso a la reducción pasiva del escudo (4-8%) y a la acción defensiva `bloquear` con bono de absorción.
  2. *Mandoble o Gran Lanza (2 Manos):* Daño base mayor (+20-30% daño, 16-20), pero pierde toda reducción pasiva del escudo (renunciando a entre un 4% y un 8% de reducción pasiva) y fatiga incrementada (+1 de fatiga por ataque).

### 2.3. Papel Canónico de Daro sin Activar la Forja Pendiente

- **Identidad de Daro en Valdren ([content/regions/edran.json](file:///home/jdiaz/proyectos/wt-agy-vt2-equipo/vintage-telnet-2/content/regions/edran.json)):**
  - Daro es un herrero humano práctico de pueblo rural: *«Prefiero hacer una reparación pequeña que sirva a una grande que no resuelva nada»*.
- **Fronteras estrictas del contrato de Daro:**
  1. **Reparación de `condition: damaged_event`:**
     - Daro cobra 8 sellos por reparar una pieza rota por suceso excepcional.
     - **Regla inviolable:** `damaged_event` **nunca** se genera por desgaste rutinario o golpes ordinarios de combate; solo procede de sucesos narrativos autorizados. Reparar no otorga afinado ni fisiones.
  2. **Afinado local:**
     - Afina piezas comunes una sola vez (+1 daño) por 12 sellos y 1 fibra de espinajo.
  3. **Fusión pedagógica:**
     - Puede realizar fusiones de nivel 1 (+1) utilizando espinas de espinajo de Edran. Explica al jugador que para fusiones mayores (+2 y +3) debe buscar a Beran en Korven o viajar a las ruinas del Bastión.
  4. **No activación de la Forja Canónica:**
     - En el canon, la *Gran Forja Antigua* de Vaisgard sigue inactiva o misteriosa. La tienda y servicio de Daro opera exclusivamente bajo el tag de sala `forge_service: "edran_daro"`. No contiene diálogos ni flags que desbloqueen la Forja mítica del mundo ni activa piezas con `activated: False`.

---

## 3. Matemática de Defensa y Mitigación

### 3.1. Límites de Acumulación y Reglas de No Inmunidad

1. **Techo Pasivo Absoluto (`ARMOR_CAP = 0.50`):**
   - Aunque un jugador equipe 5 piezas de Vaisgard (42%) + Escudo de Vaisgard (8%) + Fusiones (+2% por pieza), la armadura pasiva efectiva **nunca supera el 50%**.
2. **Mitigación Multiplicativa:**
   - La fórmula de mitigación combina tres multiplicadores independientes:
     $$\text{Daño} = \max(1, \lfloor \text{Daño Base} \times (1 - \text{Reducción Activa}) \times (1 - \text{Armadura Pasiva}) \times (1 - \text{Guardia}) + 0.5 \rfloor)$$
   - Debido a la naturaleza multiplicativa, nunca se llega a una reducción del 100%. Incluso combinando `ARMOR_CAP` (0.50) + Bloqueo activo (0.20) + `Guardia Comprometida` (0.50):
     $$\text{Multiplicador} = (1 - 0.20) \times (1 - 0.50) \times (1 - 0.50) = 0.80 \times 0.50 \times 0.50 = 0.20 \quad (80\% \text{ mitigación máxima})$$
3. **Piso Mínimo Garantizado (`max(1, ...)`):**
   - Ningún ataque conectado exitosamente puede hacer 0 puntos de daño.
4. **Condicionalidad Táctica de la Guardia:**
   - `guardia_comprometida` solo mitiga ataques frontales. Ataques en abanico, zarpazos laterales (Rasgacumbres), barridos de agua (Dorsalodo) o zarpazos a ciegas (Dragón) anulan `guard = 0.0`.
   - Tiene cooldown de 2 rondas; en 2 de cada 3 rondas, el Juramentado está expuesto a recibir daño sin su firma.

---

### 3.2. Tabla de Simulación (Nivel x Pieza x Enemigo)

*Generada mediante el script reproducible [simular.py](file:///home/jdiaz/proyectos/entregas/equipo/vt2-equipo/simular.py):*

| Nivel / Tier de Equipo | Enemigo (Daño Base) | Armadura Pasiva | Golpe Neutro (Daño / Golpes para Caer) | Con Bloqueo Activo (Daño / Golpes para Caer) | Guardia Frontal (Daño / Golpes para Caer) | Guardia No Frontal (Vulnerable) |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **N1 / T0 Inicial** *(Sin armadura, Sin escudo)* | Mordelinde (5 dmg) | 0% | 5 dmg (20 hits) | 5 dmg (20 hits) | 3 dmg (34 hits) | 5 dmg |
| **N1 / T0 Inicial** *(Sin armadura, Sin escudo)* | Espinajo (8 dmg) | 0% | 8 dmg (13 hits) | 7 dmg (15 hits) | 4 dmg (25 hits) | 8 dmg |
| **N2 / T1 Cuero** *(Cuero + Rodela mimbre)* | Espinajo (8 dmg) | 22% | 6 dmg (17 hits) | 6 dmg (17 hits) | 3 dmg (34 hits) | 6 dmg |
| **N4 / T1 Cuero** *(Cuero + Rodela mimbre)* | Faucecieno (13 dmg) | 22% | 10 dmg (11 hits) | 9 dmg (12 hits) | 5 dmg (21 hits) | 10 dmg |
| **N5 / T2 Reforzado** *(Reforzado + Escudo hierro)* | Faucecieno (13 dmg) | 36% | 8 dmg (14 hits) | 7 dmg (15 hits) | 4 dmg (27 hits) | 8 dmg |
| **N6 / T2 Reforzado** *(Reforzado + Escudo hierro)* | Cornalomo (20 dmg) | 36% | 13 dmg (9 hits) | 12 dmg (9 hits) | 6 dmg (18 hits) | 13 dmg |
| **N8 / T3 Vaisgard** *(Vaisgard + Pavés)* | Cornalomo (20 dmg) | 50% | 10 dmg (11 hits) | 9 dmg (13 hits) | 5 dmg (22 hits) | 10 dmg |
| **N10 / T3 Vaisgard** *(Vaisgard + Pavés)* | Dragón Antiguo (22 dmg) | 50% | 11 dmg (10 hits) | 10 dmg (11 hits) | 6 dmg (19 hits) | 11 dmg |
| **N10 / T3 Vaisgard +3** *(Fusión tope 50%)* | Dragón Antiguo (22 dmg) | 50% | 11 dmg (10 hits) | 10 dmg (11 hits) | 6 dmg (19 hits) | 11 dmg |

**Conclusiones de la simulación:**
- El Juramentado pasa de caer en 13 golpes contra un Espinajo a aguantar 17-34 golpes con equipo T1.
- Frente al Dragón (22 dmg base), con armadura máxima al tope del 50%, un golpe neutro le quita 11 HP (muere en 10 golpes). En guardia frontal aguanta a 6 dmg por golpe.
- Si el Dragón ejecuta un coletazo lateral o zarpazo en abanico, el Juramentado recibe los 11 dmg completos. **No existe invulnerabilidad.**

---

### 3.3. Preservación de la Utilidad de las Otras Tres Clases

| Clase | Mitigación Pasiva Típica | Mecanismo Defensivo / Táctico Principal | Efectividad Frente a Golpe Fuerte (Faucecieno: 13 dmg) | Nicho y Utilidad Exclusiva |
|---|:---:|---|---|---|
| **Juramentado** | 36% – 50% | `Guardia Comprometida` + Bloqueo con escudo | Recibe 4–8 dmg directo en salud. | Absorbe daño físico directo continuo en vanguardia; protege al grupo y aguanta golpes inevitables. |
| **Arcano** | 18% (Telas/Cuero) | `Velo de Contención` + `Impulso Arcano` | La barrera absorbe 22 HP netos: **0 daño recibido a salud**. | Absorbe picos de daño sin tocar su HP real; interrumpe preparaciones enemigas a distancia. |
| **Sombra** | 18% (Cuero flexible) | `Borrar el Foco` + Evasión alta (Agi 13) | Reduce la precisión enemiga a ~31%; **evasión completa (0 daño)**. | No mitiga daño: lo anula por completo al esquivar, y un fallo enemigo abre `Golpe a la Apertura` (x1.6 daño). |
| **Artífice** | 18% – 30% | `Traba de Campo` + `Bálsamo de Campo` | Traba añade 25% reducción y -15 precisión; Bálsamo cura 15 HP y fatiga. | Control de campo ambiental, daño indirecto con trampas y sostenibilidad/curación en combate prolongado. |

---

## 4. Plan del Piloto de Fase 2 y Propuestas

### 4.1. Lote Reducido del Piloto

Para no desestabilizar la economía ni arriesgar la integridad de las partidas en producción, la Fase 2 debe implementarse como un **piloto controlado y acotado**:

1. **Lote de Contenido Mínimo:**
   - 1 escudo inicial en Edran: `rodela_mimbre_cuero` (kind: `'block'`, slot: `'block'`, `armor_reduction: 0.04`, precio: 30 sellos).
   - 1 arma a dos manos para Juramentado: `mandoble_rastrojo` (kind: `'weapon'`, `damage: 16`, `two_handed: True`, precio: 170 sellos).
   - 1 arma alternativa a una mano: `espada_ancha_edran` (kind: `'weapon'`, `damage: 12`, `block: True`, precio: 110 sellos).
2. **Lógica de Motor a Incorporar:**
   - Regla de exclusión mutua de dos manos (`two_handed`) en `engine.py` (`action == 'equipar'`).
   - Comprobación de `requires_classes` en `action == 'equipar'`.
   - Inicialización completa de slots en `new_state()` sin romper estados heredados.
3. **Migración Compatible:**
   - Partidas existentes conservan intacto `equipment: {'weapon': ..., 'armor': ..., 'block': ...}`.
   - Si un personaje carga una partida antigua, el motor lee `'armor'` como alias de `'torso'` de forma transparente.
   - Cero pérdida de datos y cero corrupción de partidas en `runtime/`.

### 4.2. Pruebas Focales de Fase 2

- `tests/test_equipment_slots.py`:
  - Equipar y desequipar en cada uno de los 5 slots corporales y slot `block`.
  - Equipar arma `two_handed` teniendo escudo equipado (comprobar desequipado automático a la mochila).
  - Intento de equipar escudo teniendo arma `two_handed` (comprobar rechazo con RuleError).
  - Verificación del cálculo de `armor_total()` sumando las piezas hasta el tope estricto de 0.50.
  - Verificación de que la acción `bloquear` se activa tanto con `weapon.block` como con objeto en slot `block`.
  - Comprobación de que `damaged_event` sigue funcionando exclusivamente por suceso y reparándose por 8 sellos.

---

### 4.3. Propuesta Económica *(Marcada: Requiere Aprobación)*

> [!IMPORTANT]
> Los siguientes valores son una propuesta sujeta a la aprobación explícita de Javier:

- **Escudos:**
  - `rodela_mimbre_cuero` *(Tier 1 Edran)*: 30 sellos compra / 10 sellos venta (0.04 reducción).
  - `escudo_hierro_veteado` *(Tier 2 Korven)*: 75 sellos compra / 25 sellos venta (0.06 reducción).
  - `paves_de_vaisgard` *(Tier 3 Veyra)*: 160 sellos compra / 55 sellos venta (0.08 reducción).
- **Progresión de Armas de Dos Manos vs Una Mano:**
  - Ratio de daño propuesto: Las armas de dos manos deben ofrecer entre +2 y +3 puntos de daño sobre el equivalente a una mano del mismo tier, a cambio de fatiga (+1 por ataque) y renuncia al escudo.
- **Vías de Obtención:**
  - Tiendas regionales y servicios de herrero (Daro, Beran, mercado Vaisgard).
  - Encargos de viaje únicos (recompensa por misión de entrega o rescate).
  - **No implementar drop aleatorio de equipo en combate ordinario** (mantiene la coherencia de economía controlada).

---

### 4.4. Preguntas Abiertas para Javier

1. **Exclusividad del Escudo:** ¿Deseas que los escudos sean de uso exclusivo del Juramentado (`requires_classes: ['juramentado']`), o permitimos rodelas ligeras para Artífice?
2. **Comportamiento de Dos Manos:** Al equipar un arma `two_handed` teniendo escudo puesto, ¿prefieres que el motor guarde el escudo automáticamente en la mochila, o que rechace la acción exigiendo desequipar manualmente primero?
3. **Restricción de Armaduras:** ¿Las piezas de armadura corporal (cabeza, torso, brazos, piernas, pies) deben restringirse rígidamente por clase (ej. placas solo Juramentado), o cualquier clase puede vestirlas a costa de penalizaciones de agilidad o fatiga si no tiene la fuerza requerida?
4. **Validación de Servicios de Daro:** ¿Se confirma que Daro en Valdren solo ofrece afinado (+1 daño), reparación de `damaged_event` y fusión de Tier 1, derivando fusiones superiores a Beran en Korven y al Bastión?

---
*Fin del documento de auditoría y especificación técnica de Fase 1.*
