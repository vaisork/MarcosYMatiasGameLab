# Dictamen 08 — Capítulo 007 «Entre cargas y nombres»

**Proyecto:** *Crónicas de Vaisgard* · Libro I «El primer camino».  
**Responsable:** Agente 03, `revisor-canon-vaisgard-01`.  
**PR de manuscrito:** [#705](https://github.com/vaisork/MatiasGameLab/pull/705), rama `editorial/cronicas-vaisgard-agente-01-voz`.  
**PR propia de revisión:** [#707](https://github.com/vaisork/MatiasGameLab/pull/707).  
**Manuscrito realmente leído íntegro:** `VintageTelnet-Libros/capitulos/007-entre-cargas-y-nombres.md`, **blob `1f0a2185d0fe3c6266537b02deee9f2214b8529d`**, aproximadamente **2.365 palabras**.  
**Matriz de continuidad del Escritor:** `capitulos/007-continuidad-y-revision.md`, **blob `fc2ef2ade1ecace4842905939d834b5bc902acfa`**.  
**Autorización expresa:** `plan/DECISION_CIERRE_C006_Y_AUTORIZACION_C007_2026-10-15.md`, blob `3c9b0cb967097531de00eedeadeaebd02cda3cb6`. **C008 no autorizado** en el corte de lectura.  
**C006 anterior:** `capitulos/006-el-camino-no-espera.md`, corregido `27365396a724f92556a8bf2050208bd209f2e6fa`, aprobado literariamente por Arquitectura y Revisor 03.  
**Canon contrastado directamente:** `vintage-telnet-2/content/regions/veyra.json` rama `main`, blob **`500a04d7dd3c2a72c750a69381664f2eed5500bf`**, especialmente `rooms.veyra_puerta_campos`, `rooms.veyra_barrio_cargas`, `rooms.vaisgard_mercado`, `rooms.veyra_plaza_rutas` y `npcs.veyra_bela`. **Apoyo documental Historiador:** Nota 05 C006/Veyra en PR #706.

## Dictamen editorial

**CAPÍTULO 007 APROBADO LITERARIAMENTE CON UNA CORRECCIÓN MENOR DE CONTEO (L01), NO BLOQUEANTE**. El escritor cumple la ficha: comienza inmediatamente al cruzar el arco de Puerta de los Campos, pasa al este por la Calle de los Almacenes y después al Mercado, dramatiza la primera búsqueda efectiva de Dalia sin atribuirle domicilio, trabajo o presencia, conserva la limitación de Bela como comerciante y cierra **antes de pisar** la Plaza de las Cinco Rutas.

El capítulo no se limita al inventario de salas: un error de posición durante el giro de una carga fuerza una disculpa y una pregunta inicial a la vecina; los encuentros con Bela y la vendedora de fruta obligan a Lera a precisar que busca a una antigua amiga y que ella dijo palabras hirientes antes de separarse. El lector comprende la diferencia entre llegar a Vaisgard y localizar a una persona concreta. La bota que chapotea aporta humor tras la lluvia de C006.

**No se detectó contradicción dura de mapa, NPC, secretos o estados de misión** en la prosa de este blob. Este dictamen literario **no reemplaza la co-validación de canon Arquitectura Editorial + Arquitecto VT2, exigida antes de la fusión/publicación definitiva**.

## 1. Aciertos a conservar

1. **Continuidad inmediata C006→C007.** Lera está ya al otro lado del arco pero **aún en el entorno de `veyra_puerta_campos`**. Camina al este hacia almacenes y más tarde entra al Mercado. La lluvia va cediendo y la bota/media continúan mojadas; conserva carta seca, taza, cantimplora parcialmente repuesta, mano raspada y hombro sensible.
2. **Ficción humana sustentada en la ciudad real.** La raya pintada y los dos ayudantes que giran el carro, la vecina que espera junto a la escalera y el drenaje libre bajo tablones son hechos ambientales coherentes con `veyra_barrio_cargas.description/day/rain`. El incidente no inventa aduana, peaje, guardia o cargo oficial.
3. **Mercado geográfica y sensorialmente verificable.** Toldos y muros antiguos, cestas, fruta/herramientas separadas por canalillo, tabla móvil, actividad de vendedora y semilla corresponden al JSON. No atribuye fundador de muros ni revela secretos.
4. **Bela preserva su rol.** `veyra_bela` es comerciante de camino; mantiene alimentos separados de cuchillas, ordena mangos y atiende compradores. Sus diálogos nuevos son **ficción exclusiva de la novela**, no líneas oficiales de VT2. No sabe la ubicación de Dalia, no activa quest ni ofrece un servicio de personas desaparecidas.
5. **Iniciativa emocional de Lera.** La antigua conversación hiriente con Dalia se había asentado desde C001. Aquí su búsqueda deja de ser contemplativa: pronuncia el nombre en público, reconoce que eran amigas y recibe un siguiente lugar plausible para preguntar.
6. **Geografía de salida.** Al norte, el `look.norte` del mercado permite ver plaza, capas de montaña y carretas de piedra. Se detiene en el límite **sin entrar a `veyra_plaza_rutas`**. No hay viaje instantáneo a la plaza o a un barrio distante.

## 2. Única corrección concreta

| ID | Gravedad | Pasaje | Intervención |
|---|---|---|---|
| **L01 — preguntas contadas como dos** | **BAJA, precisa y no bloqueante** | En el cierre, después de las conversaciones sucesivas con **la vecina de la escalera**, **Bela** y **la vendedora de fruta**, se lee: «**Pero había hecho dos preguntas y había recibido dos negativas** sin que el mundo se cerrara a su alrededor». En realidad, Lera ha preguntado por Dalia a **tres personas** y recibió tres respuestas negativas o sin conocimiento. | Cambiar por «**Había preguntado a tres personas y ninguna sabía dónde estaba Dalia**» o «**Había preguntado por ella varias veces y recibido respuestas negativas**». Preferible segunda opción si se desea evitar contabilidad mecánica; retener el contraste sobre la amistad y la valentía de preguntar. La frase anterior «Había preguntado dos veces en la ciudad» sí es correcta **en el punto en que aparece**, antes de la conversación con la tercera mujer; NO corregirla. |

**No pedir cambios adicionales por gusto.** La reiteración de «no sé dónde está Dalia» funciona de momento porque cada escena exige una revelación personal mayor, aunque el siguiente capítulo necesita **nueva información, acción o consecuencia**, no tres negativas más y un discurso sobre preguntar. Se recomienda evitar que C008 use otra vez un bloqueo por carro, una caída por humedad o una aclaración de rumor como nudo principal.

## 3. Contraste de canon, fuente `content/regions/veyra.json`

| Elemento concreto | Evidencia del runtime | Resultado |
|---|---|---|
| Puerta→almacenes | `rooms.veyra_puerta_campos.exits.este = veyra_barrio_cargas` | **CONFIRMADO** |
| Almacenes→mercado | `rooms.veyra_barrio_cargas.exits.este = vaisgard_mercado` | **CONFIRMADO** |
| Escaleras externas, casas sobre almacenes, raya antigua repasada, dos ayudantes y vecina con jarra | `veyra_barrio_cargas.description/day/examine.raya` | **CONFIRMADO** ambiente; nombres y diálogos **novela** |
| Tablones que dejan drenaje libre durante lluvia | `veyra_barrio_cargas.rain` | **CONFIRMADO** rasgo ambiental; lluvia es episodio narrativo, no estado impuesto al juego |
| Muros antiguos usados para toldos, mercado de frutas y herramientas, canalillo y tabla móvil | `vaisgard_mercado.description/examine.canalillo/return` | **CONFIRMADO** |
| Vendedora que corta fruta para enseñar el centro; semilla examinada por niña | `vaisgard_mercado.day` | **CONFIRMADO** |
| Bela como comerciante, alimentos apartados de hojas de armas, mangos comparados | `npcs.veyra_bela.role/description/day` | **CONFIRMADO** rasgos públicos; nueva conversación **solo novela**, no conocimiento oculto |
| Mercado→Plaza norte, pero sólo vista desde mercado | `vaisgard_mercado.exits.norte = veyra_plaza_rutas`, `.look.norte` | **CONFIRMADO**, aún no cruzada |
| Ubicación real o biografía de Dalia; hechos sobre fundación de ciudad | **No aparecen como datos públicos de `veyra.json`** | **NO SE AFIRMAN**. Dalia sigue personaje privado de la novela; fundadores/galerías reservados |
| Ayudas, quests y sistemas de búsqueda | No se invocan `actions`, `flags` ni diálogos canónicos de misión | **SIN ALTA NI ACTIVACIÓN DE RUNTIME** |

## 4. Estado de personajes y objetos al cierre

- **Lera:** al límite norte del Mercado, **sin entrar aún** en Plaza. Bota y media mojadas por arroyo de C006; hombro dolorido, raspadura de palma leve; cantimplora parcialmente repuesta, taza con asa torcida y carta seca/plegada aún no entregada a Dalia.
- **Dalia:** no aparece, no hay noticia confiable de ubicación, profesión ni domicilio; recuerdo privado de amistad quebrada por una frase de Lera ya establecido desde C001. La decisión de escuchar/no escuchar la carta sigue abierta.
- **Bela:** comerciante en mercado, no se convierte en informante global, conoce sólo lo observado.
- **Próxima geografía:** al norte `veyra_plaza_rutas` es accesible. C008 aún requiere ficha expresa del Arquitecto Editorial. No adjudicar automáticamente a Dalia ciudad, puesto, registro oficial, historia de vida o NPC del runtime.

## 5. Handoff

**Escritor #705:** aplicar únicamente **L01** al cierre de C007 si se acepta el pulido; actualizar manuscrito y su matriz cuando corresponda, entregar nuevo blob SHA para cotejo puntual, no reescritura. **No redactar C008 sin autorización específica.**

**Arquitectura Editorial:** C007 **aprobado literariamente por el Revisor 03 con L01 menor no bloqueante**; revisar cierre y emitir su propia autorización para un único C008 si corresponde. La ficha debe producir **nuevo conflicto urbano y progreso verificable en búsqueda de Dalia**: no otra sucesión de negativas. Se mantienen provisionalmente quince capítulos por voluntad del propietario salvo nueva decisión explícita.

**Historiador #706:** expediente Nota 05 basta para ruta; sólo documentar si aparece nueva tensión específica de Bela/identidad de personaje/salida de plaza. No iniciar atlas nuevo.

**Arquitectura Editorial + Arquitecto VT2:** aprobar conjuntamente cualquier dato de ficción urbana compartible con juego, delimitar Dalia/Lera como personajes literarios y revisar el prólogo y tensiones de especies/secretos antes de publicar o fusionar definitivamente. **La aprobación de este capítulo no autoriza cambios del runtime ni canonizaciones.**

**Director Arte/EPUB #708:** candidato de ilustración real del barrio de cargas y mercado únicamente si existe y fue aprobado; sincronizar textos desde SHAs vigentes para prelectura **BORRADOR**. No publicar como final.

**Veredicto:** **C007 APROBADO LITERARIAMENTE con L01 baja no bloqueante**, versión `1f0a2185d0fe3c6266537b02deee9f2214b8529d`. 
— *Agente 03 · Editor Integral y Revisor de Canon.*
