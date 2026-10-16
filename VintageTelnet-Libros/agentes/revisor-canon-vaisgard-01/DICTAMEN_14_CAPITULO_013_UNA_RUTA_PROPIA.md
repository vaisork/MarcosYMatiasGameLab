# Dictamen 14 — Capítulo 013 «Una ruta propia»

**Proyecto:** *Crónicas de Vaisgard* · Libro I «El primer camino».  
**Agente:** `revisor-canon-vaisgard-01`, Editor Integral y Revisor de Canon.  
**PR autoría:** [#705](https://github.com/vaisork/MatiasGameLab/pull/705), rama `editorial/cronicas-vaisgard-agente-01-voz`. **PR revisión:** [#707](https://github.com/vaisork/MatiasGameLab/pull/707).  
**Manuscrito leído íntegramente:** `VintageTelnet-Libros/capitulos/013-una-ruta-propia.md`, texto original **`13e065f556485aa461824363382f685d42c00ed6`**, 2.487 palabras. **Versión vigente tras microcorrección directa del Editor 03: `4b8dd7beb6dc4289470b4301fa8d955d9a69126a`**, 2.487 palabras.  
**Registro de continuidad vigente:** `capitulos/013-continuidad-y-revision.md` **`1e5e0c251da8abf23fcc80e3cca677e48ac0c309`** (original `17aedaabfaca6204946fbe44c9f9b6f0af0f687f`).  
**Autorización C013 comprobada:** `plan/DECISION_CIERRE_C012_Y_AUTORIZACION_C013_2026-10-16.md`, blob `e100f44d6a1c8871cc43b9b96c1efd4d3fe30ea7`. **C014 NO autorizado** al cierre de revisión; no iniciar WIP adelantado.  
**C012 anterior:** `012-lo-que-todavia-podemos-elegir.md` blob `da0855503ab1d8365cee15c75c09535a0e30b69d`, aprobado literariamente por Editor 03 y Arquitectura Editorial.  
**Fuentes VT2 cotejadas contra `main` remoto:** `vintage-telnet-2/content/regions/veyra.json` **`e4469c25786a0dc7044bc28de03fbf9c34aae1d1`**, habitaciones `vaisgard_mercado`, `veyra_barrio_cargas`, `veyra_puerta_campos`; `vintage-telnet-2/content/regions/edran.json` **`07d67231dcefe745f52ecc6b632881bc43af2c97`**, `edran_hito_campos` y `edran_calzada`. **Contraste anterior de ruta:** C006 `27365396a724f92556a8bf2050208bd209f2e6fa`.

## I. Dictamen

**C013 APROBADO LITERARIAMENTE POR EDITOR 03 CON UNA CORRECCIÓN MENOR DE TOPOLOGÍA YA APLICADA DIRECTAMENTE; SIN PENDIENTES EDITORIALES MENORES.** Se solicita ratificación independiente de Arquitectura Editorial. La co-decisión del canon Editorial + Arquitecto VT2 permanece pendiente para fusión/publicación definitiva; manuscrito, matriz y esta PR siguen como borradores.

La decisión nueva es tangible y revierte el rumbo de la novela: Lera **termina su tarea pendiente sin haber sido contratada**, comunica a la comerciante que **mañana no contará con ella**, negocia prudentemente con un carro que sale hacia **Edran**, acepta perder la posibilidad inmediata de trabajo en Vaisgard y se **marcha físicamente por la Puerta de los Campos**, en dirección a Valdren para hablar con **Mara** sobre la responsabilidad que dejó allí. Lo hace **sin encontrar a Dalia**, sin hacerla objeto de persecución indefinida y sin convertir una nota no entregada en respuesta garantizada. El carro **no** le promete llegar a Valdren, cama, ración, salario ni seguridad. Su correa de bolsa recibe arreglo temporal por mano propia, no favor mágico ni servicio de Seli.

**El cierre es orgánico:** se completa la decisión de salir, se acuerda cooperación con conductor y se cruza físicamente el arco. El capítulo termina **durante el descenso hacia Edran**, todavía sin llegar al hito/arroyo/Valdren. No se alarga para consumir dos capítulos pendientes ni corta en medio de la despedida. El arco emocional Dalia–Lera **permanece abierto deliberadamente** y requiere pago narrativo real en el final del Libro I; se registra ese riesgo como **estratégico, no microerror**.

## II. Continuidad literal con C012 y avance del arco

1. **Comienzo día 3:** C012 termina con Lera **empezando** una cesta adicional en `vaisgard_mercado` por acuerdo individual sin retribución pactada. C013 la **termina**; la comerciante le da una porción de alimento solo después, como retribución voluntaria singular. **No hay contrato, salario establecido, empleo estable ni regalo garantizado.**
2. **Decisión material distinta de C011–C012:** Lera dice expresamente a la comerciante que **no cuente con ella mañana**. Pierde la opción laboral incipiente y la referencia precaria «Mercado» que había quedado para una eventual respuesta de Mara. No vuelve a estudiar cestas durante páginas ni pregunta otra vez por el paradero de Dalia.
3. **Barrio de Cargas con raíces reales:** avanza del Mercado al oeste a `veyra_barrio_cargas`, con raya pintada, escaleras exteriores, carro, sacos, conductor y dos ayudantes, congruentes con descripción pública de `veyra.json`. El conductor y ayudantes son **personajes episódicos de novela**, no NPC/misión/servicio de transporte de VT2 ni terceros que conocen a Dalia.
4. **Intercambio con conductor con límites humanos:** Lera declara lesión de palma, ofrece advertir sobre el firme, recodos y amarres **sin levantar sacos**. El conductor verifica un nudo ajustado bajo su consentimiento y permite **caminar juntos hasta donde coincidan sus rutas**. Él va a los campos; **no ha prometido llegar a Valdren**, descanso, alimento ni remuneración. Lera puede tener que seguir sola cuando se separen.
5. **Regreso breve para despedida:** `veyra_barrio_cargas.exits.este = vaisgard_mercado`; la protagonista comunica la renuncia a la comerciante sin prometer que ella conserve mensajes, recibe ninguna gratuidad y recuerda a Seli. **La correa** ya desgastada se acorta y anuda provisionalmente con material propio; empeora comodidad del hombro, pero no la convierte en equipo nuevo ni reparación definitiva.
6. **Salida real y cierre:** `vaisgard_mercado —oeste→ veyra_barrio_cargas —oeste→ veyra_puerta_campos`. Pasa bajo el arco, toma camino descendente hacia `edran_hito_campos`. El texto **no narra haber llegado al hito, atravesado tres piedras ni pisado la calzada**. Es admisible al final decir que el carro desciende «hacia los campos de Edran» como **orientación**, no llegada. Cierra completando la decisión tomada, no a mitad de un pago ni negociación.
7. **Resonancia con C006:** la memoria de lluvia, dos parches claros de `edran_calzada` y las tres piedras del arroyo junto a `edran_hito_campos` es reconocible para el lector y tiene causalidad al vigilar el paso del carro. La memoria no se usa para fingir que Lera **ya recorrió** el regreso.
8. **Autonomía de Dalia:** Lera acepta que no sabe dónde está Dalia y deja de perseguir una proyección de ella. No envía su carta privada, no atribuye domicilio, correspondencia o perdón y no usa un viajero nuevo para fabricar pista.
9. **Ritmo:** las escenas «concluir tarea → negociación carretera → despedida → salida» forman un arco físico unitario. Hay elección real con costo y transición al C014; ningún corte forzoso por calendario, capítulo o cuota de palabras.

## III. Microcorrección aplicada DIRECTAMENTE en rama del Escritor

**L01 — orden geográfico de la ruta saliente, RESUELTA.** La primera versión del diálogo de Lera con el conductor explicaba que **en la calzada** están dos reparaciones y «después, antes de la puerta» aparece el arroyo con tres piedras. Esa es la ruta **de llegada** de C006; el conductor del C013 **sale** por la puerta y debe encontrar primero el arroyo del hito, y **más abajo** las reparaciones de la calzada. Se reemplazó la explicación puntual:

> «Al salir de la puerta, el arroyo cruza junto a tres piedras de paso —dijo—. Más abajo, en la calzada, hay dos reparaciones claras. En una conviene dejar espacio al borde para quien va a pie. Cuando vine, me metí en el agua por confiarme demasiado».

**Base exacta:** `veyra_puerta_campos.exits.sur = edran_hito_campos`; `edran_hito_campos.exits.sur = edran_calzada`; `edran_calzada.description` establece dos parches. C006 ya relataba el trayecto inverso. **No se cambia acción, geografía real, seguridad del carro, lesión ni argumento.**

- **Commit manuscrito:** `4f6e283e596b0d9d764d952be19bd335b652ade9`, blob **`4b8dd7beb6dc4289470b4301fa8d955d9a69126a`**.
- **Commit matriz C013:** `18f37cf9be17e343b019ad9f08da1e38f15e3316`, blob **`1e5e0c251da8abf23fcc80e3cca677e48ac0c309`**.

Permiso del propietario: el editor corrige detalles menores directamente sin devolver al Escritor cada minucia; se ha limitado a este pasaje para corregir orientación espacial. **No pendientes menores.**

## IV. Matriz pública de canon y límites

| Hecho | Fuente `main` VT2 | Resultado |
|---|---|---|
| Mercado al oeste conecta Calle de Almacenes | `veyra.json > rooms.vaisgard_mercado.exits.oeste` | **CONFIRMADO** |
| Almacenes regresan al este al Mercado, salen oeste a Puerta Campos | `rooms.veyra_barrio_cargas.exits.este/oeste` | **CONFIRMADO** |
| Puerta Campos al este vuelve a Barrio Cargas y sale sur a Paso de Edran | `rooms.veyra_puerta_campos.exits.este/sur` | **CONFIRMADO** |
| Puerta arco ancho, suelo pulido y descenso a tierra trabajada | `rooms.veyra_puerta_campos.description/day` | **CONFIRMADO** |
| Raya pintada, escaleras, carros, vecina con jarra | `rooms.veyra_barrio_cargas.description/day` | **CONFIRMADO** ambiente |
| Primer punto al sur de puerta es arroyo y tres piedras; más al sur dos parches en calzada | `edran.json > edran_hito_campos.description/exits.sur`, `edran_calzada.description` | **CONFIRMADO** — L01 corregida |
| Conductor con sacos y ayudantes; acuerdo particular de acompañamiento | Ningún NPC/servicio de viaje nuevo registrado; solo ficción episódica | **SOLO NOVELA**, co-decisión antes de publicar definitivo |
| Carta Dalia con Lera; nota Mara con Arel; recorte Nara con Nara | Continuidad C008–C012 literaria | **CONSERVADO** |
| Flags, quests, túneles, secretos de mundo, llegada instantánea a Valdren | No se usan | **SIN CONTRADICCIÓN DURA** |

## V. Estado al terminar C013 para continuidad del C014

- **Posición y dirección:** Lera **acaba de salir por la Puerta de los Campos**, camina junto al carro descendiendo hacia el arroyo/hito de Edran. **Aún NO llegó al arroyo, al hito, a `edran_calzada` ni a Valdren.** Salida durante **día 3**, con algo de luz, sin fijar distancia de jornada ni salida del grupo después de la bifurcación.
- **Acuerdo y costes:** la acompaña temporalmente conductor con dos ayudantes; solo hasta coincidencia de caminos, **no** lleva a Lera como pasajera, garantiza transporte/pensión/pago ni conoce a Dalia. Lera no trabajará mañana para comerciante; pierde mercado como referencia confiable de eventual respuesta. Una porción de comida recibida por cesta terminada, no trabajo asalariado.
- **Comunicación:** carta íntima para Dalia **con Lera**, doblada y seca; nota dirigida a Mara **con Arel** entre recados ordinarios **sin salida ni lectura confirmadas**; recorte firmado **con Nara** sin entrega. No se atribuye a ninguno llegada futura ni respuesta automática.
- **Material y cuerpo:** algo de agua en cantimplora, taza de asa torcida en bolsa, carboncillo envuelto; sellos escasos; bota/media casi secas con posible frío interior; mano raspada e irritada sin levantar sacos; hombro sensible ahora con correa más corta y anudada (parche improvisado, **no reparada de forma permanente**). Sin techo ni alimento garantizado en primera parada del carro.
- **Dalia y Mara:** paradero/intenciones de Dalia desconocidos; Mara sigue con responsabilidad por canaleta y, hasta donde se sabe, **no ha recibido la nota**. Motivo de volver a Valdren es confrontar/compartir responsabilidad **con Mara**, no alcanzar mágicamente a Dalia.

## VI. Nota arquitectónica de fondo — NO es microcorrección

**Riesgo para la resolución del Libro I (C014–C015):** C013 cambia de manera convincente la dirección física y la escala de responsabilidad; pero **no introduce información o vía confirmada nueva hacia Dalia**. Esto puede ser correcto si la culminación es **una aceptación honesta de que no puede exigir respuesta**, pero el lector necesitará una **escena/resultado humano concreto** que pague las expectativas sembradas sobre Mara, la canaleta y la carta íntima. Dos capítulos de ida y vuelta por ruta sin una resolución emocional sustantiva serían insuficientes, igual que un encuentro casual con Dalia tras el arco. **Arquitectura Editorial debe evaluar el plan final en ficha C014**, con posibilidad de proponer ajuste del índice (objetivo 15 capítulos provisional) si la historia lo necesita, sin obligar a reconciliación ni alargar por cuota.

**Punto de canon de C012 aún abierto:** Arel recibió sellos por un intento privado de ruta para nota a Mara; el juego no define servicio postal pagado. Historiador #706 pidió co-decisión Editorial+VT2. **No se ha tocado C012** ni vuelto esa escena servicio público.

## VII. Handoff

**Arquitectura Editorial (#705):** ratificar C013 en **blob corregido `4b8dd7beb6dc4289470b4301fa8d955d9a69126a`**, matriz `1e5e0c251da8abf23fcc80e3cca677e48ac0c309`. Si aprueba, considerar autorización EXCLUSIVA de C014 con ficha que pague el retorno a Valdren y el hilo Dalia–Lera **sin milagro, sin elipsis negligente ni cuota artificial**. No iniciar C014 sin permiso; ni fusionar/publicar final hasta co-canon.

**Escritor (#705):** L01 ya corregida por Editor 03 en su rama, no reenviar ni rehacer por rutina. Mantener trayecto real aún incompleto, obligaciones de mensajes y el carro como alianza condicional. Seguir WIP=1 a la espera de ficha C014.

**Historiador (#706):** no se detectó choque duro en Puerta/Calzada/Hito; cotejo puntual solo si Arquitectos lo solicitan. Seguir pendiente de ratificación pública de hechos literarios, incluido intercambio singular de Arel.

**Publicador (#708):** usar manuscrito C013 **corregido** solo tras autorización literaria del lote; priorizar EPUB de prelectura privada accesible e ilustrado con capítulos ya aprobados, sin inventar Drive subido, EPUBCheck o ratificación canon.

**Veredicto Editor 03: C013 APROBADO LITERARIAMENTE TRAS UNA MICROCORRECCIÓN DIRECTA, SIN PENDIENTES MENORES. La co-validación de canon sigue siendo requisito para publicación definitiva.**  
— *Editor Integral y Revisor de Canon*