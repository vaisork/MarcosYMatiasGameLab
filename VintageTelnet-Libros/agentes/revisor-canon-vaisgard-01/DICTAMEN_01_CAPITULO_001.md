# Dictamen 01 — Capítulo 001: «Una decisión al amanecer»

**Agente:** `revisor-canon-vaisgard-01` — Editor Integral, Continuidad y Canon  
**Proyecto:** *Crónicas de Vaisgard*, Libro I: *El primer camino*  
**PR de trabajo editorial propia:** [#707](https://github.com/vaisork/MatiasGameLab/pull/707) · **PR del Escritor (texto original):** [#705](https://github.com/vaisork/MatiasGameLab/pull/705) · **Historiador:** [#706](https://github.com/vaisork/MatiasGameLab/pull/706)  
**Versión efectivamente leída:** `VintageTelnet-Libros/capitulos/001-una-decision-al-amanecer.md` (blob **`aa0c984b06a8c613a05ec15282ea443ac67fb3e2`**, ~2,519 palabras); `001-continuidad-y-revision.md`; `plan/DECISION_ARRANQUE_EDITORIAL_2026-10-14.md`; `revision/REVISION_ARQUITECTURA_EDITORIAL_C001_2026-10-14.md`.  
**Fuentes:** `vintage-telnet-2/content/regions/edran.json` (blob **`dbdaead65f026a57925857f36388b28b94054498`**), `docs/CANON_VIGENTE.md`; `docs/DECISIONES_VIGENTES.md`; expedientes 00 y 01 del Historiador #706.  
**Estado:** **APROBABLE LITERARIAMENTE CON AJUSTES**; **pendiente de cotejo conjunto de canon y cierre editorial, NO FUSIONAR NI PUBLICAR**.  
**WIP=1:** revisión del único capítulo entregado. **Este dictamen actualiza el estado histórico de `DICTAMEN_00_REVISION_PR_705.md`**, que precedía al permiso operativo de primer borrador. El Capítulo 1 **sí fue autorizado para escritura de borrador**; **no** fue autorizado para publicación ni hay permiso para redactar Capítulo 2.

## 1. Evaluación literaria fundamentada

**Fortalezas que conservar:**

1. **Entrada con interés humano inmediato:** la carta doblada cuatro veces y los movimientos de Lera introducen inquietud sin depender de conocimiento del videojuego.
2. **Conflicto íntimo comprensible:** Lera quiere encontrar a Dalia para rectificar una crueldad deliberada; la posibilidad de que Dalia no la reciba impide que el viaje sea un «recado» vacío. Hay motivo emocional concreto para ir ella misma en lugar de enviar una carta.
3. **Mara tiene carácter autónomo:** bromea, trabaja, discute, pone límites reales; no es asistente complaciente ni portavoz enciclopédico. Su negativa a prometer turnos indefinidos materializa el costo de la decisión.
4. **La canaleta dramatiza personalidad:** Lera falla al empujar sola, necesita escuchar instrucciones y luego acepta negociar la responsabilidad del agua. La avería no es sólo decoración.
5. **Ambiente vivido:** gallo, migas, banco con piedra, golpes de fragua, delantales con hojas, árbol y regadío constituyen un pueblo que sigue trabajando mientras ella decide.
6. **Lector joven/adulto:** léxico legible, subtexto suficiente, humor bien integrado, tensión proporcionada y ausencia de moraleja o inventario de mecánicas. No necesita pelea para tener un conflicto.
7. **Final con pregunta abierta:** la decisión de partir cambia la relación con Mara, pero no fija la respuesta de Dalia. Se respeta no salir de Valdren.

**Evaluación general:** funciona como apertura de una novela, no como introducción de un RPG. No recomiendo reescritura estructural ni recorte mecánico por exceder levemente 2,500 palabras.

## 2. Cambios solicitados, por gravedad y con intervención mínima

| ID | Gravedad | Evidencia del borrador | Corrección sugerida sin cambiar la voz del Escritor |
|---|---|---|---|
| **M01** | **MEDIA / necesaria antes del visto bueno literario** | Lera anuncia «Voy a escribirla de nuevo»; al cierre añade dos frases en un borde limpio **del mismo papel doblado** y vuelve a plegarlo. El registro dice «nuevo inicio, no terminada». | **Elegir UNA operación narrativa y describirla con exactitud.** Opción mínima preferida: sustituir la promesa por «Voy a corregirla» o «Voy a empezar por lo que no supe decir» y mantener el margen. Alternativa: Mara trae **papel nuevo además de carboncillo** y Lera comienza una versión íntegra. Si usa la alternativa, revisar posición de la hoja vieja y de la nueva. |
| **M02** | **MEDIA / continuidad con C002** | C001 ya dedica espacio a cargar, elegir, retirar martillo y ropa, discutir la taza y evaluar peso. La ficha original C002 promete «escoger equipaje». | El Escritor debe **replantear la ficha C002**, en su PR #705, para dramatizar la negociación pendiente de turnos, el respaldo material de la salida y un desacuerdo irreversible, no otra poda de objetos. Dejar en C001 el equipaje tal como está, salvo retoques menores. No autorizar C002 por esta recomendación. |
| **M03** | BAJA / precisión de objetos | Lera decide que «La taza se queda» y posteriormente la levanta en el banco para bromear con Mara. Puede estar fuera de la bolsa pero falta un movimiento material claro que explique dónde quedó mientras regresan a plaza. | Aclarar en una frase que Lera **lleva la taza en la mano o fuera del equipaje** hasta el banco; no volver a introducirla en la bolsa por accidente. Si se deja realmente en el huerto, cambiar el gesto de la broma por otro objeto ya presente. |
| **L01** | BAJA / ritmo | Tras el arreglo del agua ya se narran el turno, otro tramo de trabajo, el regreso a plaza, nueva selección de bolsa y resolución de carta. | Revisar **una** repetición entre «no puedo resolverlo sola», el aligeramiento y el último balance. Conservar la escena final de la carta y la convivencia: son las recompensas emocionales del capítulo, no «relleno» a suprimir. |
| **L02** | BAJA / focalización | La frase sobre una vecina que sacude el paño «por no despertar a nadie» atribuye un propósito interno a una persona secundaria ajena al POV de Lera. | Opcional: reformular como una **inferencia visible de Lera** («parecía intentar no despertar a nadie») para sostener estrictamente tercera persona cercana. No convertirlo en una inspección mecánica de cada frase. |
| **D01** | BAJA / documentación | En `capitulos/001-continuidad-y-revision.md`, el enlace al manuscrito usa `../../capitulos/001-una-decision-al-amanecer.md`, pese a estar ambos documentos en la misma carpeta. | Sustituirlo por `001-una-decision-al-amanecer.md` en **la PR #705**, sin tocarlo desde este agente. |

**M01 y M02 son los dos ajustes prioritarios.** M03, L01, L02 y D01 son microediciones. Ninguno exige sustituir la voz ni escribir otro capítulo.

## 3. Matriz de lectura: escena, emoción y canon

| Escena / momento | Qué consigue literariamente | Localidad / datos comprobados | Estado |
|---|---|---|---|
| **A. Plaza al amanecer:** carta, humor y bolsa | Presenta el temor, la evasión y la amistad sin explicarlos; la ciudad pequeña sigue su rutina | `rooms.valdren_plaza.description`, `.dawn`: casas bajas, banco interrumpido por piedra vieja, pan, martillo, gallo, paño con migas | **CONFIRMADO ambiente / COMPATIBLE argumento** |
| **B. Este hacia el corredor de huertos:** Mara señala problema de agua | Lera se siente competente, se precipita, falla y tiene que colaborar | `rooms.valdren_plaza.exits.este = valdren_huertos`; `rooms.valdren_huertos.description`: tierra blanda, cercas, puertas de cocina, árbol y canaleta de madera en curva | **CONFIRMADO espacio / COMPATIBLE avería temporal** |
| **C. Conversación junto a la canaleta:** el viaje y la carta para Dalia | Conflicto deja de ser orgullo abstracto: ausentarse afecta a Mara y tal vez Dalia no quiera recibirla | Valdren tiene labores de agua; **no** consta Lera/Mara/Dalia en `npcs`. La escena no reproduce quest ni adjudica pasado a NPC canónico | **COMPATIBLE exclusivo de novela / pendiente conformidad VT2** |
| **D. Trabajo durante la mañana:** Mara cubre sólo un turno inmediato | Hay deuda y consecuencia visible, no permiso mágico para desaparecer | `rooms.valdren_huertos.day` contiene actividad cotidiana de hojas/cocina. Turnos concretos y cuña astillada son **invención dramática local**, no flags universales del juego | **COMPATIBLE sólo libro** |
| **E. Regreso a plaza y revisión de la carta:** semilla, niño/abuela, carboncillo | Cierra el gesto inicial y convierte una disculpa interior en intención expresada | `rooms.valdren_plaza.day`: niño, abuela y semilla con marcas. Mañana avanzada tras la salida temprana: transición temporal plausible | **CONFIRMADO contexto / COMPATIBLE escena privada** |

**Punto importante:** los estados `dawn` y `day` no se están mezclando en una misma simultaneidad; el relato avanza del alba hacia la mañana. **No hay contradicción observada por ello.** La piedra vieja aparece como objeto usado por habitantes, **sin fundador ni origen atribuido**.

## 4. Control de personajes, información y causalidad

- **Lera (humana, 24)**: personaje exclusivo del Libro I con autorización operativa para borrador; su nombre y biografía no pasan por sí mismos a `content/regions` o `world.json`. Sólo conoce los trabajos locales, su carta, la última disputa con Dalia, y la ignorancia de la respuesta futura. Su cambio en C001 es concreto: pedir ayuda de frente en vez de suponerla.
- **Mara**: personaje original exclusivo del libro. Se entera del proyecto de viaje porque Lera lo dice; escucha quién es Dalia pero **no lee** la carta; se compromete al día siguiente y negocia con otros, sin garantizar indefinidamente la cobertura. No asignarle fuera del libro autoridad sobre todo el sistema de riego ni un servicio canónico.
- **Dalia**: sólo existe como recuerdo y destinataria de la carta; no aparece ni responde. Su supuesta presencia en Vaisgard es un dato biográfico propuesto de esta ficción, **no localización comprobada del juego**. En capítulos futuros, comprobar ruta y forma creíble de buscarla sin asignarle una casa o parentesco canónicos por accidente.
- **Vecina, hombre del cesto, niño y abuela**: figuras ambientales; no se nombran ni se les atribuyen misiones del juego. El niño y su abuela aparecen en estado diurno de plaza.
- **Cuña y regadío**: el pequeño arreglo sigue siendo provisional; el gesto no pretende alterar ni reparar permanentemente `valdren_huertos` en VT2. Confirmación de coexistencia entre escena del libro y estados de juego debe quedar registrada por ambos arquitectos.

**Inventario de estado al cerrar C001:** Lera continúa **en Valdren**; no conoce qué dirá Dalia; aún debe hablar de turnos futuros, terminar/corregir la carta y tomar la salida. El martillo y ropa extra salen de su bolsa; la taza exige microaclaración antes de reanudar su trayectoria. No ha aparecido Orven. No hay criaturas, clases, habilidades, recompensas ni secretos.

## 5. Contradicciones, riesgos futuros y decisión sobre canon

**C001: sin contradicción canónica confirmada en el material leído.** Las dos localidades, los trayectos en ellas, las referencias ambientales y la fase del día tienen soporte concreto en el JSON de Edran.

**Aún pendiente de revisión conjunta en #705:**
- Tabla móvil/cuñas/cambio temporal de corriente y deberes privados de Lera y Mara: ¿son **variación narrativa exclusiva de la novela** que puede convivir con la canaleta del juego? No introducir flags, NPC o estados de partida. Documentar propuesta, fuente, tensión, decisión y alcance.
- Lera/Mara/Dalia como personas originales: ¿se reconocen **exclusivamente como ficción del Libro I** sin afectar listas de NPC, cronología o secretos? Registrar alcance.
- Origen de la piedra antigua: sigue abierto, **sin revelar**.

**Tensión ajena a C001, pero relevante para la planificación de C003–C004:** el Expediente 01 de [#706](https://github.com/vaisork/MatiasGameLab/pull/706) identifica «Saltalodo» en `edran_acequia.day` y criatura catalogada para Lethra en `world.json`; **no autorizar su aparición literaria** antes de resolución conjunta. Este hallazgo **no bloquea** la revisión literaria del presente C001, que no sale a la acequia de la ruta exterior. No asumir que la canaleta de **`valdren_huertos`** y la sala **`edran_acequia`** sean una única escena física.

**Arte:** ninguna ilustración se aprueba mediante este dictamen; validar sólo después de cierre textual con Director de Arte 04 (PR #708, edición EPUB 3), sin generar imágenes nuevas.

## 6. Dictamen y circuito de entrega

**Dictamen editorial del Revisor 03: APROBADO CON AJUSTES (calidad literaria del borrador).**  
**Estado operativo de la PR #705: revisión canónica y edición final pendientes; NO FUSIONAR NI PUBLICAR.**

**Al Escritor 01 — PR #705:** corregir M01; impedir duplicación entre C001/C002 (M02); aplicar M03 y D01; considerar L01/L02 sin sobreeditar. Documentar en la propia PR qué cambió, con enlace a esta revisión y **nuevo blob SHA**. **No redactar C002** todavía.

**Al Arquitecto Editorial:** contrastar el texto ajustado con su propia `REVISION_ARQUITECTURA_EDITORIAL_C001_2026-10-14.md`; decidir si la revisión literaria está cerrada; confirmar explicitamente cuándo se habilita pasar a C002. Actualizar la ficha de C002 para que avance la historia en lugar de repetir la bolsa.

**Al Arquitecto VT2 y al Arquitecto Editorial, conjuntamente:** registrar resolución y alcance de hechos nuevos de Valdren en **#705** y la tensión Saltalodo en **#706**. Una contradicción canónica sin resolver impide fusionar la PR que la incorpore. Antes de cerrar comprobar fuentes contra el HEAD remoto vigente de `main`.

**En la PR #707:** éste es el documento de trabajo del Revisor 03 para la mejora del libro; el siguiente ciclo de WIP=1 será **verificar los cambios del Escritor al C001 cuando se registren**, sin tocar directamente los archivos de otros agentes.

---
*Firma funcional: Agente 03 · Editor Integral y Revisor de Canon — Crónicas de Vaisgard.*
