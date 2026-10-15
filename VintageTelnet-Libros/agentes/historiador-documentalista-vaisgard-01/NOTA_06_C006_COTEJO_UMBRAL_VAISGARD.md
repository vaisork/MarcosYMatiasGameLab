# Nota 06 — Capítulo 006: de la calzada al umbral de Vaisgard

**Historiador 02** · [PR #706](https://github.com/vaisork/MatiasGameLab/pull/706) · comprobación **puntual**, sin dictamen literario ni cambio de manuscrito.  
**Solicitud:** Escritor 01, comentario [#6194936441](https://github.com/vaisork/MatiasGameLab/pull/706#issuecomment-6194936441), después de la entrega de C006.  
**Texto vigente LEÍDO:** `VintageTelnet-Libros/capitulos/006-el-camino-no-espera.md` en la rama `editorial/cronicas-vaisgard-agente-01-voz`, **blob `27365396a724f92556a8bf2050208bd209f2e6fa`**. **Registro de continuidad leído:** `capitulos/006-continuidad-y-revision.md`, blob `351530515fd4d489014d2713fdaf101217bd4785`, que **todavía declara el blob anterior `4e5efd10a357ef2ca868b279dae619922cb14444`**.  
**Fuentes de canon:** `vintage-telnet-2/content/regions/edran.json` blob `dbdaead65f026a57925857f36388b28b94054498` y `vintage-telnet-2/content/regions/veyra.json` blob `500a04d7dd3c2a72c750a69381664f2eed5500bf`, cotejados con `docs/CANON_VIGENTE.md` en `main@316e722f59ebe1f8cef4a606d4190b584caf802a`.

## 1. Resultado

**SIN CONTRADICCIÓN DURA DE CANON DETECTADA EN C006**, sobre los lugares, visibilidad, escenas ambientales y comportamiento físico contrastados. **Pequeña desactualización documental:** la matriz de continuidad de C006 cita el SHA del manuscrito **antes** de la corrección menor señalada por Revisor 03. Hay que actualizar en la **rama del Escritor**, con el cambio de línea ya aplicado; el Historiador **no** modifica archivos de #705.

**Precisión textual comprobada:** la nueva versión del manuscrito dice «**Los dedos encontraron la parte alta de la tercera piedra, por encima del agua**». Es coherente con `rooms.edran_hito_campos.rain`: los bordes pueden estar bajo agua y **los centros permanecen fuera**. Corrige la objeción a «extremo seco» del dictamen #707 sin inventar una piedra perfectamente seca bajo lluvia. No requiere reabrir el resto del capítulo.

## 2. Matriz de comprobación: camino, señales y límites

| Escena de C006 | Fuente VT2 | Estado y resultado |
|---|---|---|
| Inicio sobre calzada al salir de Casa del Camino, al norte | `rooms.edran_casa_camino.exits.norte = edran_calzada`; `rooms.edran_calzada.exits.sur` | **CONFIRMADO / ABIERTO**: sin regreso innecesario a Aren ni el mensaje de rueda. |
| Cantos gastados, **dos parches claros**, ruido de carro antes de verse | `rooms.edran_calzada.description`, `.examine.reparaciones`, `.day` | **CONFIRMADO / ABIERTO**: trabajos y tránsito, no historial de cuál carro específico usó cada piedra. |
| Lluvia sobre calzada: piedra lisa resbaladiza, borde de hierba, conductor prudente | `rooms.edran_calzada.rain` y `.day` | **CONFIRMADO** como condiciones posibles; **COMPATIBLE solo novela** la hora en que empieza a llover y el carro anónimo que pasa. No se ha activado meteorología real ni otro NPC fijo. |
| Curva que oculta poste, calzada norte a `edran_hito_campos` | `rooms.edran_calzada.description`; `.exits.norte` | **CONFIRMADO**. El poste solo aparece al doblar, sin anticipar arco urbano. |
| Hito: poste y losa, **tres piedras del arroyo**, puerta **no visible desde ese lugar** | `rooms.edran_hito_campos.description`, `.exits.norte`, `.examine.poste` | **CONFIRMADO / ABIERTO**: Lera busca la puerta y no puede verla antes de tomar el camino al norte. |
| Bordes inundados por lluvia, centros elevados | `rooms.edran_hito_campos.rain` | **CONFIRMADO** como estado atmosférico posible. La **bota mojada** y mano que encuentra parte alta de tercera piedra son incidentes **COMPATIBLES** de Lera; no son prueba de inundación global. |
| Cruzar al norte a `veyra_puerta_campos` y **entonces** percibir murallas y arco | `rooms.edran_hito_campos.exits.norte = veyra_puerta_campos`; `rooms.veyra_puerta_campos.description` | **CONFIRMADO**; la vista de los muros se describe después del cruce, no desde el hito. **Importante:** el desvío `edran_vista_cuenca` **sí** muestra muros distantes, pero Lera **no** lo tomó. |
| Entrada de carros de grano, una Dravak y dos Felaryn; guardiana que señala paso y gestiona tránsito | `rooms.veyra_puerta_campos.day`, `.rain` | **CONFIRMADO** como viñetas ambientales existentes. Su coexistencia en la escena es **COMPATIBLE**; guardiana **no** tiene ID `npcs` allí, ni identidad, poderes, peaje o reglamento añadido. |
| Arco amplio, suelo pulido por ruedas, barro y cargas, sonidos desde dentro | `rooms.veyra_puerta_campos.description`, `.rain` | **CONFIRMADO / ABIERTO**. No afirmar origen de murallas ni antigüedad fechada. |
| Cierre: Lera **cruza** el arco, sin llegar ya a mercado | `rooms.veyra_puerta_campos.exits.este = veyra_barrio_cargas`; `rooms.veyra_barrio_cargas.exits.este = vaisgard_mercado` | **CONFIRMADO**. El próximo movimiento documentable es **Puerta → Calle de almacenes → Mercado**, no salto directo a Plaza de las Cinco Rutas. |

## 3. Vida de la ciudad: elementos públicos versus relato

**ABIERTOS y reutilizables en C007, solo después de ficha autorizada:** al **este** de la puerta, `veyra_barrio_cargas` tiene escaleras externas sobre almacenes, **raya pintada** que deja libres puertas para carros, ruedas y sacos, viviendas en niveles superiores, polvo de cargas. Con lluvia se ponen tablas **sin bloquear el drenaje**; `rooms.veyra_barrio_cargas.{description,day,rain,examine.raya,exits}`. Al **este** de ese barrio está `vaisgard_mercado`: frutas, pan, herramientas, canalillo y diversidad regional; `rooms.vaisgard_mercado.description`. **Estos son el siguiente fondo documentado, no escenas obligatorias ni conocimiento de Lera al cierre de C006.**

**COMPATIBLE exclusivo de la novela:** Lera sigue con carta seca **sin enviar**, taza con asa torcida, cantimplora parcialmente repuesta, palma raspada, hombro dolorido, **bota/media mojadas** y la incertidumbre de encontrar a Dalia. La lluvia y su gesto de proteger la carta no son estados de servidor. Tampoco hace que Dalia se encuentre allí automáticamente.

**DESCUBRIBLE:** los muros son antiguos y nadie les atribuye fundador con certeza. La puerta sirve de acceso cotidiano, no de prueba de una historia subterránea. El mercado mezcla procedencias, no demuestra que alguien conozca a Dalia. **RESERVADO:** origen oculto de Vaisgard, galerías, pistas condicionadas por flags/visitas, mazmorras y secretos de especie. No derivar desenlaces a partir de geometría del arco.

## 4. Única observación documental puntual a corregir en PR #705

- **D01 — BAJA, registro desactualizado:** `capitulos/006-continuidad-y-revision.md` aún cita **`4e5efd10a357ef2ca868b279dae619922cb14444`**, pero el **manuscrito actual es `27365396a724f92556a8bf2050208bd209f2e6fa`**. El nuevo texto ya contiene la frase corregida sobre la parte alta de tercera piedra. **Solicitar al Escritor que alinee SHA y anote L01 resuelta** en su rama; no reescribir ninguna escena.

## 5. Co-decisión y handoff

**Para el Escritor #705:** geografía validada; solo sincronizar versión del anexo con manuscrito actual. **C007 no se autoriza por este dictamen.** El siguiente lugar físico es `veyra_barrio_cargas`.  
**Para Revisor 03 #707:** la línea sobre tercera piedra del dictamen ya está corregida en **blob `273653...`**, con base directa en `edran_hito_campos.rain`. Esta nota no sustituye su revisión literaria.  
**Para Arquitecto Editorial:** C006 ya alcanza la **Puerta de los Campos**, de modo que el antiguo índice que proponía llegada en C014 quedó superado por prosa real. Revisar plan para aventura **dentro de Vaisgard**, según Nota 05, sin alargar artificialmente Edran.  
**Para Arquitecto VT2 + Editorial:** co-validar que clima/incidentes/figuras anónimas son **solo del Libro I**; no hay nuevas quests, NPC oficiales, reglas de acceso ni distancias. La divergencia **Saltalodo Edran/Lethra** permanece pendiente en PR #706, con exclusión preventiva de Saltalodo de Edran en el libro. Esta nota **no autoriza merge/publicación**.

**Cierre:** cotejo de C006 completo en #706, pendiente de co-decisión de canon compartido. No se modifica `vintage-telnet-2/`, ni manuscritos, arte, otros repositorios o el Segundo Cerebro.