# Dictamen 07 — Capítulo 006 «El camino no espera»

**Serie:** *Crónicas de Vaisgard*, Libro I: *El primer camino*  
**Agente revisor:** `revisor-canon-vaisgard-01`, Editor Integral y Revisor de Canon.  
**PR de dictámenes:** [#707](https://github.com/vaisork/MatiasGameLab/pull/707), rama `editorial/revisor-canon-vaisgard-01-dictamen-705`.  
**PR autoría del Escritor:** [#705](https://github.com/vaisork/MatiasGameLab/pull/705), rama `editorial/cronicas-vaisgard-agente-01-voz`.  
**Manuscrito leído íntegro:** `VintageTelnet-Libros/capitulos/006-el-camino-no-espera.md`, **blob `4e5efd10a357ef2ca868b279dae619922cb14444`**, ~2.366 palabras.  
**Ficha de continuidad C006:** `capitulos/006-continuidad-y-revision.md`, **blob `351530515fd4d489014d2713fdaf101217bd4785`**.  
**Autorización expresa:** `plan/DECISION_CIERRE_C005_Y_ARRANQUE_C006_2026-10-15.md` en #705. **C007 no autorizado en el corte consultado.**  
**Continuidad anterior:** C005 corregido **`4a4cbd654e6d9032734a218f74ee458f6b7e2100`**, aprobado literariamente por Arquitectura Editorial y Agente 03 (cierre en `ADENDA_06_C005_CORRECCIONES_VERIFICADAS.md`).  
**Canon público cotejado directamente:** `vintage-telnet-2/content/regions/edran.json` en main blob **`dbdaead65f026a57925857f36388b28b94054498`**; `content/regions/veyra.json` blob **`500a04d7dd3c2a72c750a69381664f2eed5500bf`**. **Historiador #706:** `NOTA_05_C006_VEYRA_RUTA_Y_OPCIONES_007_015.md`, blob `3139b6aa1b9de43a3da7076f126efdd16de848d3`.

## 1. Dictamen

**CAPÍTULO 006 APROBADO LITERARIAMENTE POR EL AGENTE 03 CON UNA PRECISIÓN MENOR RECOMENDADA (L01), NO BLOQUEANTE.** La aventura **llega efectivamente a Vaisgard**, sin dilatar artificialmente los pocos espacios restantes de Edran. Se diferencia del capítulo anterior mediante lluvia, superficie resbaladiza y cruce físico de arroyo, culminando en el contraste con la escala de la ciudad y el tránsito de la Puerta de los Campos. **La secuencia espacial es compatible con los JSON y no hay contradicción grave confirmada.**

Este visto bueno **no confirma canon compartido VT2**, no fusiona PR ni autoriza publicación definitiva o escritura de C007. Toda escena inventada o actuación anónima queda **solo novela** hasta co-decisión Arquitecto Editorial + Arquitecto VT2.

## 2. Lectura literaria por escena

**Apertura — calzada y lluvia.** Parte justo después de la salida de la Casa del Camino en C005. Los dos parches de piedras claras sobre los cantos redondos son una entrada sensorial precisa, conectada con `edran_calzada.description`. El cielo se cubre después del caldo, la lluvia dificulta avanzar y Lera **elige** pasar a la franja de hierba en lugar de correr sobre piedras lisas. El paso del carro esta vez no genera el mismo dilema material de C004: ella ya conoce la regla práctica de apartarse; es un síntoma de aprendizaje aplicado, no una nueva crisis de carga.

**Hito de Edran.** Se presenta la losa, el poste y las tres piedras del arroyo. La Puerta de los Campos **no es visible** desde el hito, como establece el juego. El agua crecida por lluvia cubre bordes, no centros. El riesgo de perder apoyo es tangible y limitado: moja bota y media, comprueba el tobillo, no sufre fractura ni obtiene inmunidad, fuerza o habilidad del juego. La escena cambia su condición material para entrar a la ciudad.

**Revelación y Puerta de los Campos.** Las murallas se ven **después** de atravesar el arroyo y subir, ya en transición real a `veyra_puerta_campos`. El capítulo describe arco, piedra pulida por ruedas, olor de cargas mojadas y gestos de la guardiana. Una Dravak con carga y dos Felaryn son **viñetas ambientales ya respaldadas en `veyra_puerta_campos.day`**, no personajes nuevos ni generalizaciones de oficio o jerarquía de especies. Lera cruza físicamente el arco; el relato **NO la teletransporta** al mercado y no decide dónde vive Dalia.

**Voz, ritmo, audiencia.** Tercera persona limitada a Lera, con humor breve de su bota que chapotea. Las observaciones de la naturaleza y la continuidad de carta/cantimplora/raspadura evitan la exposición enciclopédica. El último contraste —ciudad en movimiento que no interrumpe su rutina por la llegada de Lera— funciona como transición hacia una nueva fase, sin pretender resolver la trama íntima de Dalia. Es apropiado para lectores juveniles y adultos.

## 3. Observación precisa

| ID | Gravedad | Hallazgo | Cambio mínimo sugerido |
|---|---|---|---|
| **L01 — piedra «seca» durante lluvia** | **BAJA · precisión espacial, no bloqueante** | Tras decir que la lluvia moja los bordes y que el pie tocó «el borde mojado de la tercera piedra», se afirma «**Los dedos encontraron el extremo seco de la tercera piedra**». En la descripción canónica `edran_hito_campos.rain` el **centro queda fuera del agua**, pero los bordes están cubiertos; además está lloviendo, por lo que «extremo seco» sugiere una superficie improbable en esa misma escena. | Cambiar por **«Los dedos encontraron la parte alta de la tercera piedra, fuera del agua»** o «una hendidura firme en la cara superior»; no atribuir sequedad literal al borde que acaba de hacerla resbalar. |

**No hay corrección material/estructural obligatoria.** Si el Escritor aplica L01, actualizará el blob y el revisor efectuará un cotejo **de esa única frase**. No reabrir capítulos 1–5.

**Observación no bloqueante de ritmo:** tras un resbalón inicial en calzada, el cruce repite la amenaza de perder apoyo. Aquí está justificado por una **consecuencia nueva** (bota mojada y primer ingreso a ciudad), y se cierra dentro de C006; evitar otro episodio de caída/resbalón semejante inmediatamente en C007. La llegada debe traducirse ya en **tensión urbana distinta**: nombres, confianza, multitud, Dalia, tareas locales, sin convertir Vaisgard en guía turística.

## 4. Matriz de correspondencia VT2 (solo terreno público)

| Escena / afirmación literaria | Fuente y comprobación | Estado |
|---|---|---|
| Desde Casa del Camino al norte se accede a calzada | `edran_casa_camino.exits.norte = edran_calzada`; `edran_calzada.exits.sur = edran_casa_camino` | **CONFIRMADO** |
| Cantos viejos lisos, dos parches claros, curva que oculta poste | `edran_calzada.description`, `.examine.reparaciones` | **CONFIRMADO** |
| Al llover, piedra antigua brillante, nueva absorbe agua, hierba como alternativa; conductor aminora sobre reparación | `edran_calzada.rain`, `.day` | **CONFIRMADO**. La lluvia concreta, el carro y el gesto son **solo episodio de novela**. |
| La calzada conduce al hito | `edran_calzada.exits.norte = edran_hito_campos` | **CONFIRMADO** |
| Poste, losa, tres piedras en arroyo, puerta no visible desde hito | `edran_hito_campos.description`, `.look.norte` | **CONFIRMADO** |
| Barro de rueda en primera piedra; centro de piedras fuera del agua pese a lluvia | `edran_hito_campos.day`, `.rain` | **CONFIRMADO**, salvo precisión textual de L01 sobre tercer borde «seco» |
| Hito al norte conecta con la Puerta de los Campos | `edran_hito_campos.exits.norte = veyra_puerta_campos` | **CONFIRMADO** |
| Murallas y arco de piedra antigua aparecen tras cruce; tránsito, carro grano, Dravak, dos Felaryn, guardiana | `veyra_puerta_campos.description`, `.day`, `.rain`; `arrivals.edran_hito_campos` | **CONFIRMADO** |
| Lera cruza el arco, sin fijar barrio/mercado ni rumbo a Dalia | `veyra_puerta_campos.exits.este = veyra_barrio_cargas`; `veyra_barrio_cargas.exits.este = vaisgard_mercado` | **COMPATIBLE**, NO entró al barrio de cargas ni mercado todavía |

**No aparece**: Saltalodo en Edran, salteadores, criaturas adicionales, secretos de piedras o fundación, galerías, trámites/peajes inventados de guardia, misiones de VT2, activos jugables, recompensas, habilidades, encuentros con Dalia, teletransporte al mercado.

## 5. Estado final del capítulo y control de C007

- **Lera:** en el umbral urbano de la Puerta de los Campos, tras cruzar el arco. La carta a Dalia sigue seca, escrita con carboncillo y protegida bajo la chaqueta; **no está entregada**, no contiene dirección conocida; taza de madera con asa torcida en la bolsa, cantimplora **solo parcialmente repuesta** tras la Casa; raspadura leve de mano y hombro dolorido, sin nuevas heridas graves; una bota y la media húmedas de arroyo/lluvia.
- **Entorno:** lluvia ya menos intensa al entrar. Movimiento de carros y transeúntes, guardiana ambiental sin NPC fijado por nombre.
- **Geografía próxima:** el siguiente tramo **no es automáticamente mercado**. Si se autoriza C007, debe decidirse la salida `veyra_puerta_campos → (este) veyra_barrio_cargas → (este) vaisgard_mercado` con progresión visible. El Historiador #706 aconseja concentrar o distribuir C007–C015 **según conflictos causales**, no por cuota fija de quince capítulos.
- **Dalia:** Lera no sabe su paradero ni la ha encontrado. No adjudicarle NPC/hogar/lugar público sin ficha y decisión editorial.
- **Prólogo/C001–C005:** no reabrir observaciones literarias ya cerradas. Reutilizar únicamente la información que Lera ya conoce y los hechos vividos, no acciones de juego con flags.

## 6. Handoff de decisiones

**Escritor 01, PR #705:** capítulo **aprobado literariamente**, sólo recomendar cambiar «extremo seco» → «parte alta ... fuera del agua» en C006. Documentar microedición, compartir nuevo blob para cotejo y **no redactar C007 sin autorización** del Arquitecto Editorial. No reescritura.

**Arquitecto Editorial:** ratificar cierre literario, decidir ficha de C007 (entrada real a barrio de cargas y posible mercado), arco Lera/Dalia y número final de capítulos de acuerdo con Historiador #706. La entrada en Vaisgard en C006 es un avance **positivo y necesario**, no una desviación a castigar por el índice provisional.

**Historiador #706:** su Nota 05 aporta suficiente localización para C006; sólo revisar de nuevo si aparecen cambios sustantivos de ciudad/creación de personajes.

**Arquitecto Editorial + Arquitecto VT2:** co-decisión requerida en PR #705 sobre hechos de ficción privados, relación de sucesos de libro con mapa/estados del juego y prólogo VT1→VT2. **Una contradicción canónica sin resolver bloquea la fusión/publicación definitiva; la revisión literaria no sirve de firma en nombre de VT2**.

**Director Arte/EPUB #708:** si monta piloto con C006, señalar **BORRADOR / prelectura**, contrastar los recursos originales de calzada/hito/puerta antes de insertar imágenes y no anticipar murallas visualmente desde el hito; no declarar publicación final, EPUBCheck superado ni canon cerrado sin evidencias.

**Conclusión:** **C006 APROBADO LITERARIAMENTE por Agente 03, con L01 baja no bloqueante** sobre blob `4e5efd10a357ef2ca868b279dae619922cb14444`.  
— *Agente 03, Editor Integral y Revisor de Canon.*
