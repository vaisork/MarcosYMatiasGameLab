# Nota 03 — Apoyo histórico y ambiental localizado para C003–C004

**Agente:** Historiador y Documentalista — 02 · **PR #706** · WIP=1 secuencial tras auditoría del prólogo.  
**Alcance:** solo la geografía, oficios, fauna y frontera de conocimientos de **C003 «Más allá de las cercas»** y **C004 «El lenguaje de las huellas»**. No es dictamen de estilo ni intervención en PR #705 o #707.  
**Manuscritos cotejados:** `VintageTelnet-Libros/capitulos/003-mas-alla-de-las-cercas.md`, PR #705 blob **`9a4eb8305b6996649c4889620868c7aefd719611`**; `capitulos/004-el-lenguaje-de-las-huellas.md`, blob **`fe2ef09ca3c363e324ebf2228ad896a4f349b27c`**. Decisión `plan/DECISION_EDITORIAL_C002_C003_Y_ARRANQUE_C004_2026-10-14.md`, blob `2e200d2b3246536077b2f55338d289488a0982c4`.  
**Canon:** `vintage-telnet-2/content/regions/edran.json`, blob **`dbdaead65f026a57925857f36388b28b94054498`**; `vintage-telnet-2/content/world.json`, blob **`796079fcdfd01c58922cde8a6fc2880e916ed398`**; `docs/CANON_VIGENTE.md`, `CANON_EXPANSION.md`, rama `main@316e722f59ebe1f8cef4a606d4190b584caf802a`.  
**Clasificación:** **CONFIRMADO/ABIERTO** = hecho actual y observable respaldado por VT2; **COMPATIBLE** = detalle narrativo permitido en principio, no canon jugable; **DESCUBRIBLE** = señal abierta a interpretación; **DUDOSO** = necesita revisión; **RESERVADO** = no revelar.

## 1. Resultado y acciones inmediatas

**Ambos capítulos respetan el corredor principal comprobado**: `valdren_huertos --este--> edran_salida_huertos --este--> edran_acequia --norte--> edran_surcos --este--> edran_zanja_antigua --norte--> edran_era --norte--> edran_terraplen --norte--> edran_casa_camino`. C003 **termina antes de entrar** en la zanja; C004 recorre zanja, era y terraplén y **todavía no entra** en la casa del camino. No se asignan horas, kilómetros, viajes instantáneos ni desvíos por el conducto.

**No detecto una contradicción dura de geografía, hábitat de Espinajo o conservación de objetos en estos blobs.** Sí hay una **cautela leve**: C004 utiliza el ensanchamiento del terraplén ante un carro y, después de seguir cuesta arriba, describe una «parte más ancha» con raíz para descargar otro saco. El JSON garantiza **un ensanche reconocible a media subida**, no prohíbe pequeñas franjas firmes naturales. Para no inventar un **segundo apartadero construido o una vía alternativa**, mantener la segunda escena como irregularidad del mismo camino, sin declararla infraestructura canónica distinta. **Revisión conjunta si se convierte en hito fijo en siguientes capítulos**; no requiere reescribir C004 por defecto.

**Conclusión operativa:** se puede proseguir la revisión literaria #707 y planificación del próximo capítulo; la conformidad total de canon Editorial + VT2 sigue pendiente. La **tensión Saltalodo** continúa abierta en #706 y **no aparece** en el manuscrito de C003/C004.

## 2. Matriz geográfica, actividad visible y conocimiento del viajero

| Sala y salida real | Elementos CONFIRMADOS del lugar | Uso en el manuscrito y frontera |
|---|---|---|
| `valdren_huertos --este--> edran_salida_huertos` | Corredor entre parcelas, canaleta, árbol ancho, cercas; `rooms.valdren_huertos.description` | **C003:** despedida en canaleta; acuerdos Mara/Sabel son **COMPATIBLES** solo en novela. No afirmar que modificaron el estado del juego. |
| `edran_salida_huertos --este--> edran_acequia` | Dos postes, casas al oeste, cercas bajas; `rooms.edran_salida_huertos.description`, `.exits`, `.day` | **C003:** postes y salida efectiva; movimiento anónimo junto a una mata **DESCUBRIBLE**; no identifica especie. `edran_lina` tiene `home_room` allí, pero no tiene obligación de aparecer en el libro. |
| `edran_acequia --norte--> edran_surcos` | Losa ancha, agua a lo largo de curva, hojas ante zanja seca; estanque por salida sur; `rooms.edran_acequia.description`, `.examine.losa`, `.exits` | **C003:** apoya la suela, cruza y ve ondas sin identificar su causa. **Correcto conservar ambigüedad**. Prosa `.day` menciona Saltalodo con contradicción regional; no extrapolar. |
| `edran_surcos --este--> edran_zanja_antigua` | Tierra nueva y rastrojo viejo, sendero sin sembrar; `rooms.edran_surcos.description`, `.day`, `.signals` | **C003:** Espinajo protege pequeña franja, Lera cae al retirarse sin pisar cultivo; no persigue. Huellas de otros son normales pero no identifican a quién pertenecen. |
| `edran_zanja_antigua --norte--> edran_era` | Zanja sin agua, losa vertical y herramienta que alguien dejó apoyada mientras trabaja **más arriba**; `rooms.edran_zanja_antigua.description`, `.day`, `.exits` | **C003→C004:** herramienta observada desde campo y reinterpretada al acercarse; dos golpes explicados por tabla de **trabajadora anónima de novela**, no NPC ni secreto. No entrar al ramal oriental `edran_canal_entrada`. |
| `edran_era --norte--> edran_terraplen` | Círculo de tierra apisonada para grano, piedras, tablones, poste viejo, polvo y ave durante el día; `rooms.edran_era.description`, `.day` | **C004:** trabajadora lleva tabla, explica marcas de arrastre y permanece trabajando; **COMPATIBLE**, no relato de suceso verificado de VT2. |
| `edran_terraplen --norte--> edran_casa_camino` | Pasillo entre paredes de tierra, raíces expuestas, rodadas tan juntas que hay que esperar al carro; un **ensanche** a media subida, porteador diurno y carga apoyada; casa **visible al dejar atrás la mitad de la cuesta**. `rooms.edran_terraplen.description`, `.day` | **C004:** carro desciende, Lera pierde agua, usa ensanche y conoce porteador; corresponden a material del lugar, pero son **hechos privados de la novela**, no estado global. La última versión respeta la aparición tardía del tejado. |

**No hay un «NPC de tabla y pala» ni un «personaje del saco» en `npcs` de Edran.** Son individuos de la ficción, compatibles con trabajo regional. Evitar identificarles como `edran_aren` (Aren reside en `edran_casa_camino` y administra mensajes), como `edran_nela` (Nela opera el ramal del canal), o como personal de misiones que Lera completó. La última escena de C004 no revela si el agua en la casa será accesible: el porteador **correctamente dice que no lo sabe**.

## 3. Bestiario de Edran y observaciones comprobables

**Espinajo de rastrojo** — `world.json > creatures.espinajo_rastrojo` (nombre, hábitat, descripción, advertencia); `edran.json > rooms.edran_surcos.signals`, `.wildlife_pool`. **CONFIRMADO:** cuerpo compacto, espinas, movimiento bajo tallos, protección de **parcela pequeña**, vuelta al mismo borde y **ausencia de persecución** cuando el viajero sigue por sendero. La prosa real de C003 lo respeta: eriza el lomo, se acerca al límite y retrocede; Lera es quien tropieza. **No** presentarlo como animal enardecido que persigue a la salida ni como evidencia de «monstruos de guerra»; no ampliar su dieta, venenos o fuerza.

**Mordelinde** — `world.json > creatures.mordelinde`; `rooms.edran_salida_huertos.wildlife_pool`. **CONFIRMADO:** escarba semillas, busca rendijas para huir. La figura fugaz junto a una mata en C003 **no está identificada**, de modo que **NO** certificar que era Mordelinde ni que siguió a Lera. **DESCUBRIBLE**, no prueba.

**Cornalomo** — `world.json > creatures.cornalomo`; `rooms.edran_salida_huertos.wildlife_pool`. **CONFIRMADO:** volumen mayor, peso que hunde la tierra y aplasta tallos, reacción de afirmarse antes del contacto. **NO aparece** en C003/C004: no aprovechar el capítulo 4 para convertir marcas de tabla y ruedas en certeza de su presencia.

**Saltalodo — TENSIÓN ABIERTA (no resuelta):** `rooms.edran_acequia.day` lo menciona, pero `world.json.creatures.saltalodo.region = lethra` y no figura en el `wildlife_pool` de la acequia. La decisión **preventiva editorial** es no incluirlo en C003/C004 ni inferirlo de ondas en el agua, **sin modificar la distribución del juego**. Clasificación y solución definitivas corresponden a Arquitectura Editorial + VT2 **en PR #706**.

**Salteadores** en `wildlife_pool`: personas adversarias posibles en algunas salas, **no** una obligación de combate o una organización previamente asentada, y tampoco autorizan un enemigo humano en este capítulo. Los encuentros humanos específicos tendrían ficha y autorización aparte.

## 4. Tres detalles para dar vida al lugar — **SUGERENCIAS COMPATIBLES**, NO CANON

El escritor puede incorporar **como máximo los que resulten orgánicos**, sin escenas extensas añadidas por sistema ni reabrir capítulos ya revisados:

1. **C003, transición huertos → campos:** el sonido de la canaleta de madera se va perdiendo mientras el viento mueve semillas desprendidas contra la última cerca. **COMPATIBLE** como transición acústica breve; no afirmar que alguien dañó la canaleta ni introducir una criatura nueva. Base confirmada: `valdren_huertos.description`, `edran_salida_huertos.description`.
2. **C003, surcos/encuentro:** un tallo que había quedado rígido vuelve despacio a su sitio tras pasar el Espinajo; en contraste, su espina mantiene el mismo límite territorial. **COMPATIBLE** como percepción local de Lera, sin poder especial o comportamiento nuevo obligatorio. Base: `edran_surcos.day`, `world.json.creatures.espinajo_rastrojo.warning`.
3. **C004, zanja → era → terraplén:** el polvo fino adherido a la palma raspada de Lera hace más áspero el contacto con la tablilla o el mango de una carga; al salir del círculo de grano el viento deja de oírse detrás de paredes de tierra. **COMPATIBLE**; no afirmar que la trabajadora le prestó herramienta ni que se activó acción del juego. Base: `edran_zanja_antigua.description`, `edran_era.description`, `edran_terraplen.description`.

**Recomendación de uso:** C003 ya crea un encuentro claro y C004 ya cambia el riesgo por el peso del carro y el agua escasa. **No agregar un segundo enfrentamiento animal** ni un discurso que explique repetidamente la moraleja. Más textura no debe significar más páginas artificialmente.

## 5. Registro de continuidad y decisiones que exigen doble revisión

| Elemento del Libro I | Estado | Límite de conocimiento | Co-decisión solicitada (Editorial + VT2) |
|---|---|---|---|
| **Lera, Mara, Sabel, Dalia** | **COMPATIBLE / personajes originales exclusivos del libro** | Ninguno es NPC del juego. Dalia no ha leído la carta; Mara/Sabel permanecen en Valdren y no presencian C003/C004 | Autorizar exclusividad literaria; **no** incorporar a `npcs`, `quests` ni atribuirles decisiones del mundo persistente |
| **Canaleta reparada provisionalmente y acuerdos de turnos** | **COMPATIBLE / sucesos privados narrativos** | Mara y Sabel conocen tabla/agua/hojas; la tablilla quedó en manos de Sabel, **no** en el equipaje de Lera | Confirmar que no contradice actividad canónica del riego y **no** supone estado global del juego ni tarea de `edran_iria` |
| **Raspadura, hombro dolorido, cantimplora con agua limpia y carta** | **COMPATIBLE / continuidad personal** | Lera recuerda herida leve y pérdida parcial del agua; no hay cifras de daño, curación, inventario o XP | Permitir consecuencias físicas localizadas **solo de novela** |
| **Dos golpes, herramienta y trabajadora de la era** | Herramienta y trabajo diurno **CONFIRMADOS**; causa exacta y persona **COMPATIBLES** | Lera descubre que su hipótesis de alguien atrapado era errónea; nadie revela acceso oculto | Ratificar como anécdota original, **no** quest `edran`, pista canónica ni secreto del conducto |
| **Carro descendente, porteador y saco pesado** | Paso estrecho y porteador diurno **CONFIRMADOS**; incidente y persona exhausta **COMPATIBLES** | Porteador no sabe si habrá agua en la casa; persona del saco solo pide ayuda, **sin biografía/facción** | Autorizar conflicto privado y acotar posibilidad de segunda franja ancha, sin crear otro camino/hito físico |
| **Rastrojo, huellas y fauna** | **CONFIRMADA** ecología de Espinajo; huellas concretas literarias **COMPATIBLES** | Observación no concede saber causa de un sonido ni presencia de animal en otra sala | Confirmar interpretación prudente; no transformar huellas en pruebas de secreto/respuesta universal |
| **Piedras antiguas y conducto oriental** | **DESCUBRIBLE/RESERVADO** según contenido y restricciones | Los escalones se ven desde zanja; Lera **no** desciende ni descubre origen de obra antigua | Mantener explicaciones de historia subterránea fuera de la novela hasta decisión expresa |

**Arquitecto Editorial:** distinguir tres capas: (1) hechos observables de VT2, (2) sucesos propios del Libro I que no cambian el juego, (3) material reservado que ningún narrador debe resolver sin permiso.  
**Arquitecto VT2:** registrar en esta PR si las propuestas **contradicen** algo vigente o son compatibles pero no canonizables. En caso de disenso, dejarlo **DUDOSO y bloqueante para la fusión**, no editar el runtime para acomodar el libro.

## 6. Oportunidades visuales y handoff

**Arte existente verificado previamente en el repositorio del juego (no aprobado para libro):** `vintage-telnet-2/client/art/places/edran_salida_huertos-anime-v1.webp`, `edran_acequia-anime-v1.webp`, `edran_surcos-anime-v1.webp`, `edran_zanja_antigua-anime-v1.webp`, `edran_era-anime-v1.webp`, `edran_terraplen-anime-v1.webp`; `vintage-telnet-2/client/art/bestiary/espinajo-rastrojo-anime-v1.webp`. Director de Arte (#708) confirma versión, aprobación y pertinencia exacta: **no** inventar una lámina de la trabajadora ni del carro que el asset no represente.

**Para Escritor 01 / PR #705:** los manuscritos C003 y C004 actuales respetan rutas y límites de especie, y C004 mantiene la explicación mundana de los dos golpes. Usar, si aportan, 2–3 pinceladas **compatibles** de la sección 4; no agregar subtramas ni corregir el juego. La petición final de agua crea un dilema personal, no una misión. No asumir autorización para C005 por esta nota.

**Para Revisor Integral 03 / PR #707:** priorizar el **texto real** y su ritmo; aquí queda verificada geografía, Espinajo y límites de conocimientos. Única cautela espacial específica: no canonizar un **segundo apartadero fijo** en el terraplén. El resto de acontecimientos anónimos son compatibles bajo co-decisión.

**Para Arquitectos Editorial + VT2:** mantener registrada la tensión Saltalodo y ratificar el **alcance solamente literario** de los sucesos privados. No fusionar ni publicar definitivo hasta resolución formal de contradicciones. No se crea otro expediente masivo.

**Segundo Cerebro (solo extracto para Arquitecto Editorial):** fuentes canónicas de un itinerario físico; ejemplo práctico de rastro vs criatura y trabajo real vs suceso inventado; peligro de transformar una anécdota de novela en misión o historia de VT2; decisiones y tensión abiertas registradas en #706. **Este agente no publica en `vaisork/Conocimiento`.**

**Firma:** Historiador y Documentalista — Agente 02. **Apoyo C003/C004 completado para revisión; no dicta aprobación literaria, fusión ni canon nuevo.**