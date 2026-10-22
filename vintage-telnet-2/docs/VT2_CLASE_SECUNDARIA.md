# Auditoría, Contrato y Propuesta Técnica: Segunda Capacidad Temprana por Clase

**Issue:** #603 (`VT-GAME: CLASS-SECONDARY-01`)
**Fecha:** 22/10/2026
**Autor:** Antigravity (agy)
**Rol líder:** Jugabilidad
**Arquitecto:** Claude
**Aprobación previa:** Javier (22/10/2026)
**Estado:** AUDITORÍA TÉCNICA Y CONTRATO PREVIO A DESARROLLO (Sin cambios de código ni despliegue)
**Fuentes canónicas:** [vintage-telnet/CLASSES.md](file:///home/jdiaz/proyectos/wt-agy-vt2-clase-secundaria/vintage-telnet/CLASSES.md), [vintage-telnet/GAMEPLAY.md](file:///home/jdiaz/proyectos/wt-agy-vt2-clase-secundaria/vintage-telnet/GAMEPLAY.md#L3064-L3240) (§36), [vintage-telnet/CLASS_SIGNATURE_CANON_RECONCILIATION.md](file:///home/jdiaz/proyectos/wt-agy-vt2-clase-secundaria/vintage-telnet/CLASS_SIGNATURE_CANON_RECONCILIATION.md).

---

## 1. Dictamen de Auditoría y Hallazgo Crítico

1. **Estado del canon:** `CLASSES.md` y `GAMEPLAY §36` definen unívocamente las cuatro segundas capacidades canónicas:
   - **Juramentado:** *Paso de Ruptura*
   - **Arcano:** *Velo de Contención*
   - **Sombra:** *Finta de Vacío*
   - **Artífice:** *Traba de Campo*
2. **Anomalía en Runtime:** En el commit `fdbc998` (#700, 14/10/2026), se introdujeron acciones de combate en el motor con severas divergencias respecto a `CLASSES.md` e Issue #603:
   - **Sombra:** *Finta de Vacío* **NO FUE IMPLEMENTADA**. En su lugar se añadieron `golpe_apertura` (ataque directo con multiplicador de daño x1.6 si hay apertura) y `distraccion` (lanzamiento de piedras). Esto viola la restricción de producto de #603 (*«no cuatro ataques con daño diferente»* y *«añadir una decisión distinta a la primera»*).
   - **Arcano y Artífice:** Tienen tres capacidades en lugar de dos. Se introdujo `destello_frio` (Arcano) y `balsamo_campo` (Artífice, curación de 15 HP), que no forman parte del escalón temprano canónico de Issue #603.
   - **Juramentado:** *Paso de Ruptura* ya cuenta con una base funcional en `mechanics.py`, pero con discrepancia de recarga (3 rondas en diccionario, 4 en resolución).
3. **Objetivo de este documento:** Fijar el inventario exhaustivo, auditar las divergencias, plantear el contrato mecánico exacto de las 4 capacidades canónicas y definir el camino de saneamiento de las capacidades espurias.

---

## 2. Inventario Real de Código y Contenido Afectados

### 2.1 Backend / Motor de Combate
- [`vintage-telnet-2/server/mechanics.py`](file:///home/jdiaz/proyectos/wt-agy-vt2-clase-secundaria/vintage-telnet-2/server/mechanics.py):
  - Líneas 25–45: `CLASS_ACTIONS` — Declaración de diccionarios de acciones (`guardia_comprometida`, `paso_ruptura`, `impulso_arcano`, `velo_contencion`, `destello_frio`, `borrar_foco`, `golpe_apertura`, `distraccion`, `tiro_interrupcion`, `traba_campo`, `balsamo_campo`).
  - Líneas 46–51: `CLASSES` — Vínculo de clases con su acción insignia y lista `CLASS_ACTIONS`.
  - Líneas 656–702: `ACTION_PROSE` — Descripciones literarias y frases de combate para acierto, fallo, absorción o interrupción de cada acción.
  - Líneas 745–750: `costs` — Coste de fatiga por acción (`paso_ruptura: 6`, `velo_contencion: 5`, `traba_campo: 5`, etc.).
  - Líneas 776–790: Resolución de `paso_ruptura` (daño 75%, interrupción de `prepared`, caída de precisión rival).
  - Líneas 802–806, 917–925: Resolución de `velo_contencion` (generación de barrera y absorción de daño de impacto).
  - Líneas 807–810: Resolución de `destello_frio` (caída de precisión rival y huida garantizada).
  - Líneas 816–829: Resolución de `golpe_apertura` (consumo de apertura para daño aumentado; **divergencia**).
  - Líneas 830–837: Resolución de `distraccion` (interrupción con piedras; **divergencia**).
  - Líneas 847–851: Resolución de `traba_campo` (interrupción, reducción de daño rival 25%, daño de trampa 4).
  - Líneas 852–856: Resolución de `balsamo_campo` (curación 15 HP, fatiga -20; **fuera de alcance #603**).
  - Líneas 908–912, 933: Decremento de recargas (`cooldowns`).

- [`vintage-telnet-2/server/engine.py`](file:///home/jdiaz/proyectos/wt-agy-vt2-clase-secundaria/vintage-telnet-2/server/engine.py):
  - Líneas 397–398: Identificación de acciones de clase válidas en la ronda.
  - Línea 421: Reducción de precisión enemiga en combate multijugador/cooperativo para acciones de clase.
  - Líneas 434–436: Concesión de estado `opening` cuando falla el enemigo tras acción de Sombra.
  - Líneas 653–681: Exposición de acciones en `actions(character, world)` durante combate, validación de requisitos de equipo y contexto (`weapon`, `focus`, `block`, `line_of_fire`, `focus_break_possible`) y cálculo de `disabled` y `reason`.

### 2.2 Frontend / Cliente Web
- [`vintage-telnet-2/client/ui-data.js`](file:///home/jdiaz/proyectos/wt-agy-vt2-clase-secundaria/vintage-telnet-2/client/ui-data.js):
  - Líneas 1312–1376: `classActions` — Catálogo cliente de etiquetas y descripciones para la ficha de personaje.
  - Líneas 1389–1393: `combatReading(event)` — Formateo de etiquetas de efectos (`Velo preparado`, `Traba desplegada`, etc.).
  - Líneas 1397–1410: `capabilityReadingHint(action)` — Textos breves de ayuda para el jugador.

- [`vintage-telnet-2/client/app.js`](file:///home/jdiaz/proyectos/wt-agy-vt2-clase-secundaria/vintage-telnet-2/client/app.js):
  - Línea 198: `actionIcons` — Mapeo de iconos visuales por identificador de acción.
  - Línea 199: `actionTone` — Tono semántico de acción (`fight`, `trade`, etc.).
  - Línea 212: `actionButton` — Renderizado de botones con tiempo de recarga y motivo de deshabilitado.
  - Líneas 308–315: `characterCapabilities` — Vista de capacidades en la pestaña de Personaje.

### 2.3 Contratos y Pruebas Existentes
- [`vintage-telnet-2/CONTENT_CONTRACT.md`](file:///home/jdiaz/proyectos/wt-agy-vt2-clase-secundaria/vintage-telnet-2/CONTENT_CONTRACT.md):
  - Líneas 92–110: «Contrato de combate por clases y acciones disponibles». Lista las acciones actuales por clase.
- [`vintage-telnet-2/tests/test_class_combat.py`](file:///home/jdiaz/proyectos/wt-agy-vt2-clase-secundaria/vintage-telnet-2/tests/test_class_combat.py):
  - Líneas 72–79: Prueba de `paso_ruptura`.
  - Líneas 81–89: Prueba de `velo_contencion`.
  - Líneas 97–106: Prueba de `destello_frio`.
  - Líneas 116–128: Prueba de `golpe_apertura` y `distraccion`.
  - Líneas 138–152: Prueba de `traba_campo` y `balsamo_campo`.
  - Líneas 160–180: Verificación de recargas y exposición de acciones.

---

## 3. Propuesta Concreta de Contrato Mecánico con Alternativas

Para cumplir el Gate de #603, ninguna segunda capacidad debe ser un ataque genérico con distinto número de daño, ni anular las opciones básicas de combate defensivo (`Bloquear`, `Esquivar`, `Resistir`, `Huir`), ni crear una rotación de botones obligatoria.

### 3.1 Juramentado — Paso de Ruptura (`paso_ruptura`)

- **Trigger / Contexto:** Combate activo cuerpo a cuerpo.
- **Efecto exacto:** El Juramentado avanza con hombro y pomo hacia el espacio del rival.
  - Causa un golpe de compromiso que inflige **75% del daño base de su arma**.
  - Si el rival tiene una acción preparada (`prepared_action` con `interruptible: true`), la **interrumpe** y desvía la guardia rival, dejando su precisión en `accuracy_base - 15%`.
  - Si el rival no está preparando una acción especial, el golpe rompe su postura: el enemigo recibe una penalización de **-20% de precisión** en su ataque de esa ronda.
- **Requisitos de equipo:** Arma de melé activa equipada (`weapon` activo).
- **Coste de fatiga:** **6 puntos base de fatiga** (acción pesada de avance).
- **Recarga (Cooldown):** **3 rondas** (4 en turno de activación: no disponible durante las siguientes 3 rondas).
- **Interacción con intención enemiga:** Cancela acciones interruptibles frontales y laterales inmediatas. No afecta a criaturas colosales o inamovibles (definible vía atributo de criatura `unshakable: true` si existiera).
- **Éxito / Fallo:** Emplea la precisión del personaje (75% base modificada por Destreza). En caso de fallo, el Juramentado no conecta el pomo y el rival conserva su acción intacta.
- **Estados y Duración:** Efecto de desestabilización instantáneo en la ronda; no genera un buff duradero.
- **Edge cases:** Si el enemigo prepara un ataque no interruptible, el daño entra pero la acción rival no se cancela.
- **Alternativa evaluada:** *Alternativa B (Sin daño)*: Que el Paso de Ruptura sea 100% control de postura sin daño (fuerza al rival a perder el turno o retroceder). *Descarte:* CLASSES.md menciona expresamente choque físico ("corte que obliga a ceder espacio", "presión de hombro y arma"); un daño moderado (75%) refleja el esfuerzo físico sin convertirlo en la opción óptima de DPS frente al Ataque básico limpio (100%).

### 3.2 Arcano — Velo de Contención (`velo_contencion`)

- **Trigger / Contexto:** Combate activo frente a cualquier amenaza visible.
- **Efecto exacto:** El Arcano traza una superficie translúcida de interferencia mágica que se interpone ante el impacto.
  - **No inflige daño.**
  - Genera un escudo de absorción inmediato:
    $$\text{Barrera} = \text{redondeo}(20 + 0.40 \times (\text{Intelecto} - 10) + 0.20 \times (\text{Voluntad} - 10))$$
  - Absorbe hasta esa cantidad del daño que el Arcano vaya a recibir en el asalto entrante. El exceso de daño no absorbido hiere normalmente.
  - La barrera se consume al recibir el golpe o se disipa al cerrar la ronda; **no es acumulable** ni persiste entre rondas.
- **Requisitos de equipo:** Foco arcano equipado (`focus: true`).
- **Coste de fatiga:** **5 puntos base de fatiga**.
- **Recarga (Cooldown):** **4 rondas** (para evitar spam continuo de absorción que vuelva intocable al Arcano).
- **Interacción con intención enemiga:** Absorbe daño de cualquier ataque físico, a distancia o proyectil animal entrante en esa ronda. No interrumpe preparaciones enemigas (eso es rol de *Impulso Arcano*).
- **Éxito / Fallo:** La canalización es automática; su eficacia depende del balance entre la potencia del golpe enemigo y el tamaño de la barrera.
- **Estados y Duración:** Estado `barrier` consumible en la ronda actual.
- **Edge cases:** Si el enemigo falla su ataque, la barrera se extingue sin haber absorbido daño (el velo se desvanece).
- **Alternativa evaluada:** *Alternativa B (Mitigación porcentual en vez de plana)*: Reducir un 40% del daño recibido. *Descarte:* Una mitigación porcentual replica mecánicamente a `Guardia Comprometida` o a `Bloquear`. La absorción plana por Intelecto/Voluntad refleja fielmente la ficción de `CLASSES.md` (un impacto pequeño es totalmente disipado; un impacto brutal rompe el velo y hiere).

### 3.3 Sombra — Finta de Vacío (`finta_vacio`) — SANEAMIENTO CANÓNICO

- **Diagnóstico del problema:** `mechanics.py` introdujo `golpe_apertura` (daño x1.6), convirtiendo a la Sombra en una rotación obligatoria de "generar apertura -> nukear con daño alto". `CLASSES.md` prohíbe expresamente esto (*«La capacidad no es un ataque crítico automático. Su valor está en hacer que el otro se comprometa primero»*).
- **Trigger / Contexto:** Combate activo frente a criatura con percepción activa (`focus_break_possible: true`).
- **Efecto exacto (Propuesta canónica recomendada):**
  - El Sombra no ataca directamente: finge un avance o exposición provocando la reacción del rival.
  - La criatura rival resuelve su ataque inmediatamente con **-20 puntos porcentuales de precisión**.
  - **Si el rival falla:** El Sombra capitaliza el compromiso en falso y obtiene el estado **Apertura** (`opening = True`), otorgando **+15% de precisión** a su siguiente ataque básico legítimo, y el rival sufre una penalización adicional de fatiga/desbalance.
  - **Si el rival impacta:** La finta fue leída o interceptada; el Sombra recibe el golpe (reducido por armadura normal) y no obtiene apertura.
  - **Interacción con preparación enemiga:** Si el rival estaba ejecutando una `prepared_action`, la finta hace que el rival descargue su acción en falso, perdiendo la preparación sin obtener su bono.
- **Requisitos de equipo:** Arma de camino o puñal equipado; entorno que no impida la maniobra.
- **Coste de fatiga:** **5 puntos base de fatiga**.
- **Recarga (Cooldown):** **4 rondas**.
- **Éxito / Fallo:** Supeditado al fallo del rival provocado por la finta.
- **Alternativa A (Contrataque con daño en el mismo turno):** Si el rival falla, el Sombra inflige automáticamente una contrarrespuesta de daño menor (50% daño). *Riesgo:* Vuelve a acercar la habilidad a un ataque directo.
- **Alternativa B (Conservar Golpe a la Apertura como acción secundaria y Finta como tercera):** Desaconsejado frontalmente; rompe la regla de simetría de 2 capacidades por clase y el canon de `CLASSES.md`.
- **Recomendación de Jugabilidad:** Adoptar la propuesta canónica de *Finta de Vacío* y **deprecar/reemplazar** `golpe_apertura` y `distraccion` en el motor de VT2.

### 3.4 Artífice — Traba de Campo (`traba_campo`)

- **Trigger / Contexto:** Combate activo en entorno físico aprovechable (tierra, roca, senderos, ruinas; no sobre superficies imposibles o agua profunda).
- **Efecto exacto:** El Artífice coloca rápidamente estacas, cordel o abrojos en la trayectoria del adversario.
  - Si el rival tiene una acción preparada de carga/embestida (`interruptible: true`), la **cancela** al tropezar la criatura con el aparejo.
  - Entorpece el movimiento y acometida del rival en la ronda: aplica una reducción de **25% al daño entrante** y **-15% a la precisión rival**.
  - Inflige un daño fijo de fricción/traba de **4 puntos de daño**.
- **Requisitos de equipo:** Kit de herramientas/equipo de viaje; no requiere empuñar el arco.
- **Coste de fatiga:** **5 puntos base de fatiga**.
- **Recarga (Cooldown):** **4 rondas** (3 en diccionario actual; debe fijarse en 4 para espaciar control).
- **Interacción con intención enemiga:** Muy eficaz contra cargas terrestres (`Espinajo de rastrojo`); ineficaz contra criaturas voladoras o incorpóreas.
- **Éxito / Fallo:** La colocación es exitosa si el entorno lo permite; el efecto sobre la criatura se aplica de forma determinista.
- **Estados y Duración:** Actúa sobre el intercambio de la ronda actual.
- **Alternativa evaluada:** *Alternativa B (Trampa puramente de daño continuo/DoT)*: 3 rondas recibiendo daño por sangrado/daño de trampa. *Descarte:* Añade tracking de estados innecesario que viola el principio de YAGNI/Ponytail y la sencillez del MUD.

---

## 4. Riesgos para Economía, Combate y Canon

### 4.1 Economía de Fatiga
- **Riesgo:** En niveles bajos (Nv 1–3), los personajes disponen de una barra de fatiga estándar (0 a 100). Usar una acción de clase consume 5–6 de fatiga, más el desgaste de asalto.
- **Evidencia en simulación (`simulacion.py`):**
  - En combates de solo ataque básico, la fatiga acumulada ronda los **21–26 puntos**.
  - Si el jugador alterna continuamente Capacidad 1 y Capacidad 2, la fatiga media se dispara a **41–51 puntos** en un solo encuentro contra un Espinajo de rastrojo.
  - Con 2 combates seguidos, el personaje alcanza niveles de fatiga >70%, penalizando su precisión y evasión.
- **Mitigación:** Mantener recargas de 3–4 rondas (no 2) para obligar a intercalar ataques básicos y acciones tácticas sin coste excesivo de fatiga.

### 4.2 Combate y Trivialización de Decisiones
- **Riesgo de "Rotación de botones":** Si las dos capacidades de clase se pueden pulsar de forma continua, el combate semi-automático legible de VT2 se convierte en una rotación estilo MMORPG clásico, invalidando `Bloquear`, `Esquivar`, `Resistir` y `Atacar`.
- **Riesgo de anulación permanente de jefes/monstruos:** Si Paso de Ruptura, Impulso Arcano, Tiro de Interrupción y Traba de Campo pueden interrumpir todas las preparaciones, una criatura con preparación cada 2 rondas nunca ejecutará su acción especial.
- **Mitigación:** Las criaturas deben tener acciones no-interruptibles anunciadas (*«No puede interrumpirse; la guardia o esquiva es la única respuesta»*), reforzando el uso de `Defender/Bloquear/Esquivar`.

### 4.3 Canon y Coherencia de Clases
- **Riesgo:** Dejar vivas en el cliente y servidor habilidades inventadas no canónicas (`destello_frio`, `balsamo_campo`, `golpe_apertura`, `distraccion`) erosiona la identidad definida por Historia en `CLASSES.md` y confunde al jugador sobre el rol de su clase.
- **Mitigación:** Saneamiento formal mediante el protocolo de aprobación creativa con Javier.

---

## 5. Plan de Piloto con Pruebas Focales

El piloto no requiere cambios en producción ni despliegues en Raspberry. Se estructurará en pruebas focales automatizadas en `tests/test_class_combat.py`:

| Capacidad | Escenario de Prueba Focal | Criterio de Aceptación Observable |
| :--- | :--- | :--- |
| **Paso de Ruptura** | Juramentado vs *Espinajo de rastrojo* en preparación de embestida. | `prepared` se vuelve `False`; criatura pierde precisión; se inflige exactamente el 75% del daño del arma; entra en recarga de 3 rondas. |
| **Velo de Contención** | Arcano vs golpe directo de 12 de daño (*Mordesombra*). | La barrera absorbe hasta su capacidad máxima calculada por Intelecto/Voluntad; HP del jugador no disminuye si daño <= barrera; mensaje de log registra absorción exacta. |
| **Finta de Vacío** | Sombra vs *Mordelinde* atacando en contexto despejado. | La precisión del rival cae en -20%; si el rival falla, se establece `opening = True` y el siguiente ataque básico tiene +15% de precisión; no hay daño directo infligido en la ronda de finta. |
| **Traba de Campo** | Artífice vs embestida de *Espinajo de rastrojo*. | Cancela la preparación; aplica -25% daño y -15% precisión; inflige 4 de daño fijo de traba; registra prosa contextual. |
| **Presupuesto de Fatiga** | Las 4 clases ejecutando su ciclo completo de 2 capacidades. | Fatiga no supera 35 puntos tras combate estándar de 6 rondas; sin bypass de recarga por envío de peticiones consecutivas. |
| **Requisitos de Equipo** | Jugador sin foco (Arcano), sin arma (Juramentado/Sombra). | La acción se expone en `actions` con `disabled: True` y el motivo exacto en `reason`; no permite ejecución via API. |

---

## 6. Resultados de Simulación Numérica (Script de Evaluación)

Se ejecutó una simulación Monte Carlo de 1,000 combates por configuración utilizando el script [`/home/jdiaz/proyectos/entregas/equipo/vt2-clase-secundaria/simulacion.py`](file:///home/jdiaz/proyectos/entregas/equipo/vt2-clase-secundaria/simulacion.py):

| Clase | Estrategia | % Victoria | Rondas Medias | HP Final Medio | Fatiga Media |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Juramentado** | Solo Ataque | 100.0% | 5.3 | 76.0 | 21.4 |
| | Firma (*Guardia*) | 100.0% | 7.5 | 72.6 | 29.9 |
| | Firma + *Paso de Ruptura* | 100.0% | 9.1 | 67.9 | 41.3 |
| **Arcano** | Solo Ataque | 100.0% | 6.7 | 69.2 | 26.7 |
| | Firma (*Impulso*) | 100.0% | 8.5 | 62.6 | 34.1 |
| | Firma + *Velo de Contención* | 100.0% | 12.0 | **90.8** | **51.2** |
| **Sombra** | Solo Ataque | 100.0% | 6.6 | 69.7 | 26.4 |
| | Firma (*Borrar el Foco*) | 100.0% | 8.5 | 63.2 | 36.0 |
| | Firma + *Finta de Vacío* | 99.4% | 11.3 | 53.9 | 50.6 |
| **Artífice** | Solo Ataque | 100.0% | 6.5 | 70.2 | 26.0 |
| | Firma (*Tiro Interrupción*) | 100.0% | 7.3 | 67.7 | 31.5 |
| | Firma + *Traba de Campo* | 100.0% | 8.0 | 68.0 | 36.6 |

**Conclusiones cuantitativas:**
1. *Paso de Ruptura* y *Traba de Campo* mantienen una progresión balanceada de daño y control sin alargar excesivamente el combate ni agotar al jugador.
2. *Velo de Contención* es extraordinariamente protector (salud final de 90.8 vs 69.2), pero alargar el combate a 12 rondas dispara la fatiga a 51.2. Requiere recarga de 4 rondas para incentivar el ataque.
3. *Finta de Vacío* en Sombra requiere que la recompensa de la *Apertura* sea contundente en el siguiente asalto para no caer en desgaste defensivo.

---

## 7. Preguntas Abiertas para Javier (Decisiones Creativas)

Antes de proceder con la implementación mecánica en código, se solicita la resolución de las siguientes decisiones:

1. **Sustitución de habilidades de Sombra:**
   ¿Apruebas eliminar `golpe_apertura` (daño directo x1.6) y `distraccion` de `mechanics.py` y `ui-data.js` para reemplazarlos íntegramente por `finta_vacio` según el canon estricto de `CLASSES.md`?
2. **Poda de terceras capacidades en Arcano y Artífice:**
   En commit #700 se introdujeron `destello_frio` y `balsamo_campo`. ¿Se eliminan del juego temprano para mantener una simetría limpia de 2 capacidades por clase (Firma + Secundaria), o se reservan como poderes aprendibles avanzados (Nv 5+ / compra por PP según GAMEPLAY §36.9)?
3. **Disponibilidad y Nivel de Desbloqueo:**
   ¿La segunda capacidad debe estar disponible desde **Nivel 1** (como ya ocurre actualmente con `paso_ruptura` y `velo_contencion` en el runtime de VT2), o debe desbloquearse automáticamente a **Nivel 2 o 3**, dejando el Nivel 1 exclusivo para la Capacidad Firma inicial?
4. **Resistencia a interrupciones continuas:**
   ¿Deseas implementar una regla de rendimientos decrecientes o inmunidad temporal tras ser interrumpido (ej. una criatura no puede ser interrumpida 2 rondas consecutivas) para proteger el desafío de combates multijugador?
