# Dictamen 09 — Capítulo 008 «La plaza de las cinco rutas»

**Proyecto:** *Crónicas de Vaisgard* · Libro I «El primer camino» · MatiasGameLab.  
**Agente:** `revisor-canon-vaisgard-01`, Editor Integral y Revisor de Canon.  
**Autoría:** [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705), rama `editorial/cronicas-vaisgard-agente-01-voz`. **Revisión:** [PR #707](https://github.com/vaisork/MatiasGameLab/pull/707). **Historiador:** [PR #706](https://github.com/vaisork/MatiasGameLab/pull/706).  
**Capítulo leído íntegro:** `VintageTelnet-Libros/capitulos/008-la-plaza-de-las-cinco-rutas.md`. **Blob inicial del Escritor:** `a2b9265935341c55638946d963d832937bd2e865` (2.649 palabras declaradas). **Blob posterior a edición puntual del Revisor 03:** **`e3ee67a0399b3737a4b1992abdd1089b9d46bbee`** (~2.659 palabras con recuento por espacios).  
**Registro de continuidad actualizado** en la rama del Escritor: `capitulos/008-continuidad-y-revision.md`, blob **`2aeb7c9d8d3b54227db8044eb8fa2a543c18dfa4`**; anterior `882b5409acd5cc870f068b31e9590a263e835b07`.  
**Autorización:** `plan/DECISION_C007_PRIORIDAD_MAQUETA_Y_ARRANQUE_C008_2026-10-15.md` de Arquitectura Editorial. **C009 no autorizado al cierre de esta revisión.**  
**Continuidad previa:** `capitulos/007-entre-cargas-y-nombres.md` blob `6aca35d8ca12704ce189e70349d8740c6c4b3f61`; C007 aprobado literariamente por Arquitectura Editorial tras corregir L01.  
**Canon verificado:** `vintage-telnet-2/content/regions/veyra.json` del `main` remoto, blob `500a04d7dd3c2a72c750a69381664f2eed5500bf`, salas `vaisgard_mercado`, `veyra_plaza_rutas`, `veyra_patio_porte`, `veyra_patio_senales`. Referencia contextual: historiador #706 Nota 05 C006–Veyra.

## I. Veredicto

**CAPÍTULO 008 APROBADO LITERARIAMENTE POR EDITOR 03, SIN CORRECCIONES MENORES PENDIENTES**, después de **DOS microediciones de continuidad ya aplicadas directamente por el Editor**, con autorización del propietario. **No hace falta devolver el manuscrito al Escritor para que corrija esas frases.**

**Este veredicto es literario y de compatibilidad documental preliminar; no constituye aprobación de canon por el Arquitecto VT2, permiso de fusión, ni autorización de publicación definitiva.** La integración final requiere decisiones conjuntas Editorial + VT2, especialmente respecto de los nuevos testimonios privados atribuidos a Iven y Nara y el recuerdo de Dalia.

## II. Evaluación de escenas y eficacia narrativa

1. **Entrada legítima a la Plaza.** C007 termina ante el borde norte del Mercado; C008 abre ya en `veyra_plaza_rutas`. Las grandes piedras antiguas usadas como asientos infantiles, escala de la plaza frente a Valdren/Narevia y diversidad cotidiana de Dravak/Felaryn/Marevyn corresponden a `veyra_plaza_rutas.description/day`. No se da fecha, fundador, estructura secreta ni significado sobrenatural de las piedras.
2. **No repite una ronda de negativas.** La estrategia de Lera cambia: pregunta a una persona con señales reconocibles de los campos, exige procedencia y contrasta dos recuerdos particulares. La escena con el niño de la piedra y la media húmeda da humor y descanso sin detener artificialmente la trama.
3. **Iven proporciona un primer indicio con límites.** Conoce Valdren por su experiencia privada; recuerda a una Dalia que preguntó por alguien dedicado a una canaleta. El recuerdo **no confirma identidad absoluta, fecha ni paradero**; Iven refiere a Nara como siguiente testigo plausible y da una localización **temporal** dentro del patio oeste. Son hechos nuevos exclusivamente literarios, no conocimiento o NPC registrado del juego.
4. **Desvío oeste real a Patio de los animales.** Lera va a `veyra_patio_porte`, ve argollas, animales de carga, bebedero, cuidador que afloja una cincha y porteadora Dravak con piedras. Son elementos públicos de `veyra_patio_porte.description/day`; el cuidador **no** se convierte en autoridad oficial de personas desaparecidas.
5. **Nara añade información acotada, no una respuesta milagrosa.** Afirma haber caminado un trecho con una Dalia que salió de Valdren; recuerda una pregunta sobre hacer llegar una carta a un pueblo, pero **no vio carta, no conoce destinatario, no sabe si la viajera llegó a Vaisgard ni dónde está**. Es un dato humano que reorienta el conflicto íntimo de Lera sin resolverlo.
6. **La protagonista asume un coste concreto.** Lera confía a Nara un recorte con su nombre y razón para buscar a Dalia, pese a que Nara no garantiza encontrar mensajero/destinatario. La carta personal **permanece cerrada en Lera**. Es un riesgo emocional específico y un uso aceptado de objetos propios, **no** una misión oficial, envío realizado por Arel ni flag del juego.
7. **Regreso este a Plaza y apertura hacia el alero oriental.** `veyra_patio_porte.exits.este = veyra_plaza_rutas`; las tablillas y una mensajera son visibles desde la plaza al este. Lera se dirige hacia ellas **sin afirmar entrada en `veyra_patio_senales`** ni activación de NPC Arel, archivos o misiones.
8. **Voz y lectura.** Narración focalizada en Lera, diálogos diferenciados (Iven prudente, Nara práctica), y peso emocional accesible para jóvenes de 10–14 años sin exposición enciclopédica. Avanza mediante **pista → contraste → elección → consecuencia**, no lección explícita por mecanismo.

## III. Correcciones menores realizadas **directamente** en PR #705

El propietario ha autorizado al Editor Integral, a partir de C008, a **aplicar personalmente correcciones menores de continuidad, estilo y precisión** sin reenviar cada incidencia al Escritor. Se respetó el límite: **dos reemplazos de una sola frase**, sin reescritura, cambios en personalidad, canon, testimonios ni ruta. Los dos cambios y el nuevo SHA están documentados también en la matriz de continuidad de C008 en #705.

| ID | Tipo | Frase previa en `a2b92659...` | Corrección aplicada en `e3ee67a...` | Base |
|---|---|---|---|---|
| **L01 — volumen de agua** | Continuidad de inventario, **RESUELTA** | «La cantimplora seguía a medio llenar, la carta doblada bajo la chaqueta y la taza de asa torcida en el bolsillo exterior de la bolsa.» | «La cantimplora aún guardaba un poco de agua, la carta doblada bajo la chaqueta y la taza de asa torcida en el bolsillo exterior de la bolsa.» | C005 sólo dice que en Casa del Camino rellenaron **un poco más**; C006–C007 conservan reserva **parcial** sin cuantificarla en la mitad. |
| **L02 — la carta fue revisada antes** | Continuidad de acciones, **RESUELTA** | «Lo había llevado por si necesitaba corregir la carta, pero nunca había conseguido hacerlo.» | «Lo había llevado por si necesitaba corregir la carta, pero desde que salió de Valdren no había vuelto a escribir en ella.» | C001–C002 muestran a Lera **corrigiendo y terminando la carta** con carboncillo antes del viaje; desde su partida no la modifica. |

**Commit del manuscrito editado:** `47293777676ecec12d190adb3dc1b3c09e8d0637` (C008); **commit de continuidad:** `93e296793d02353655b4087d1e28b429b615e59b`. El manuscrito principal conserva la voz y autoría del Escritor.

## IV. Matriz exacta de geografía y límites del juego

| Hecho del capítulo | Referencia `content/regions/veyra.json` | Resultado |
|---|---|---|
| Mercado → Plaza de las Cinco Rutas por norte | `rooms.vaisgard_mercado.exits.norte = veyra_plaza_rutas` | **CONFIRMADO** |
| Enorme plaza, piedras antiguas sin fundador acreditado, niños sentados, voces de cinco rutas | `rooms.veyra_plaza_rutas.description` | **CONFIRMADO** |
| Dravak con carretillas y Felaryn saltando entre piedras; Marevyn con pelo húmedo; mensajera que pregunta por letra | `rooms.veyra_plaza_rutas.day` | **CONFIRMADO** como actividad ambiental, no personajes exclusivos ya existentes |
| Desde Plaza, al oeste Patio de los animales; al este alero de avisos | `rooms.veyra_plaza_rutas.exits.oeste = veyra_patio_porte`, `exits.este = veyra_patio_senales`; `.look.oeste/este` | **CONFIRMADO** |
| Bebedero, animales, argollas, cuidador y porteadora Dravak | `rooms.veyra_patio_porte.description/day` | **CONFIRMADO** ambiente; sus diálogos/acciones circunstanciales son novela |
| Patio de animales regresa al este a Plaza | `rooms.veyra_patio_porte.exits.este = veyra_plaza_rutas` | **CONFIRMADO** |
| Al este de Plaza, tablillas y mensajera visibles sin entrar en patio de avisos | `rooms.veyra_plaza_rutas.description/look.este/day` | **CONFIRMADO** |
| Iven, Nara, recuerdo de canaleta y pregunta sobre carta de Dalia | Ningún NPC fijo o estado público del JSON atribuye esos hechos | **PROPUESTA SOLO NOVELA**, condicionada a co-decisión Editorial + VT2 para su uso publicado |
| Misión de avisos/recados, flags, secreto de piedras/arquitectura antigua | `veyra_plaza_rutas.actions`, `veyra_patio_senales.actions` | **NO UTILIZADOS; sin spoilers ni cambio de runtime** |

## V. Riesgos para Arquitectura (no son correcciones menores)

1. **Novedades en biografía y relación Lera–Dalia.** La memoria de Iven —Dalia buscó a una amiga que cuidaba la canaleta— y la memoria de Nara —preguntó cómo enviar una carta al pueblo— son **datos nuevos de la ficción** con implicaciones futuras: una posible correspondencia o atención mutua, todavía **sin destinatario ni intención confirmados**. No los convierto en prueba canónica ni puedo aprobarlos en lugar de los arquitectos. Requieren decisión conjunta con alcance «solo novela» antes de fusión/publicación.
2. **Doble coincidencia en una misma plaza.** Iven conoce la región y recuerda una anécdota pertinente; además vio entrar a Nara hace poco, y Nara casualmente guarda otro recuerdo útil. La plaza es un **nodo documentado de viajeros de las cinco rutas**, por lo que funciona como episodio novelesco, pero la concentración de dos pistas inmediatas merece seguimiento: **no introducir un tercer testigo afortunado en C009** sin nueva causa o contrapartida. **Nota de oficio NO BLOQUEANTE**; no reescribir C008 por este reparo.
3. **Inventario de papel del recorte.** Un recorte limpio adicional no había sido individualizado como objeto antes de C008; la bolsa contenía otros útiles y el recorte se documenta ahora de forma expresa. No es contradicción dura. **Mantener seguimiento** si el papel sirve como mensaje material más adelante; no fingir entrega confirmada.
4. **Cierre C009.** La mensajera del alero y el archivo no son un atajo para consultar domicilio de Dalia, consultar misterios antiguos ni activar `veyra_atribuir_mensaje` o `veyra_recados_copia` de forma automática. Hace falta **otro conflicto/consecuencia**, no visitar el mapa por inercia.

## VI. Estado de continuidad al cierre del C008

- **Lera**: en **`veyra_plaza_rutas`**, caminando hacia el alero **sin entrar todavía** a `veyra_patio_senales`. Bota/media todavía húmedas, ya empezando a secarse; carta personal doblada y seca sigue con ella, carboncillo guardado, taza de asa torcida, cantimplora con **un poco de agua**, palma raspada y hombro sensible.
- **Iven**: viajera ficcional que conoce Valdren; su memoria no es certeza de que la Dalia recordada sea la misma ni de su presencia en Vaisgard.
- **Nara**: viajera ficcional que aceptó guardar **un recorte firmado** para mencionarlo **sólo si** tiene oportunidad. No garantizó fecha, entrega, lectura o destinatario; no se convierte en servicio postal ni NPC estable.
- **Dalia**: no aparece; no se fija oficio, hogar, ubicación, destinatario de hipotética carta, parentesco ni resultado de su búsqueda. La pista de dos recuerdos es una hipótesis narrativa, no geolocalización.
- **Próxima ficha C009**: necesaria autorización formal de Arquitectura Editorial antes de redacción. Recomendación de variar tensión: no otra lluvia, rumor o nuevo «desconocido que no sabe»; considerar consecuencia de haber divulgado nombre y preguntas, sin usar secretos ni mecánica del juego.

## VII. Handoff

**Escritor 01 (#705):** no hay pendientes de microcorrección de C008; **ya se aplicaron por Editor 03** y se actualizaron texto/matriz. Continuar **solo tras permiso expreso para C009** de Arquitectura Editorial, no modificar C008 por el mero hecho de que existe dictamen.

**Arquitecto Editorial:** ratificar calidad y marco narrativo de Iven, Nara y antecedente de Dalia; si da visto bueno, preparar ficha C009. Mantener 15 capítulos como objetivo del propietario hasta decisión en contrario. Las dos frases ajustadas no necesitan otro circuito de corrección.

**Arquitecto VT2 + Editorial:** registrar en PR #705/706 **propuesta → fuente → tensión → decisión → alcance** para los dos testigos **solo novela** y sus recuerdos, además de canon heredado y divergencia Saltalodo Edran/Lethra. **No fusionar ni publicar como edición definitiva antes de su decisión conjunta**.

**Historiador (#706):** cotejo puntual si surge riesgo concreto de geografía o identidad; Nota 05 ya soporta la ruta de C008. No abrir otro atlas.

**Director de Arte/Publicación (#708):** el EPUB de **prelectura interna hasta C007** ya circula por su PR; C008 podrá añadirse como **BORRADOR** únicamente cuando proceda en su circuito; sincronizar nuevo blob `e3ee67a...` y no declarar validación EPUBCheck / lector / canon final si no consta.

**Veredicto final Editor 03: C008 APROBADO LITERARIAMENTE, DOS CORRECCIONES L01/L02 YA APLICADAS, SIN AJUSTES EDITORIALES MENORES PENDIENTES.** Permanece la compuerta de canon conjunta para publicar.

— *Agente 03 · Editor Integral y Revisor de Canon.*
