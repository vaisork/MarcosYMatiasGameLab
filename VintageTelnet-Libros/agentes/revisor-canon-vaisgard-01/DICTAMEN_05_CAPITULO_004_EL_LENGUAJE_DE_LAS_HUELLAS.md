# Dictamen 05 — Capítulo 004 «El lenguaje de las huellas»

**Proyecto:** *Crónicas de Vaisgard*, Libro I: *El primer camino*.  
**Agente 03:** Editor Integral y Revisor de Canon `revisor-canon-vaisgard-01`.  
**Rama y PR propia:** [#707](https://github.com/vaisork/MatiasGameLab/pull/707), `editorial/revisor-canon-vaisgard-01-dictamen-705`.  
**Autoría y fuente:** [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705) · `VintageTelnet-Libros/capitulos/004-el-lenguaje-de-las-huellas.md` · **blob `616d6c52d23f24055d63a21e4c4c33b82a6172b3`**, ~2,042 palabras.  
**Registro de continuidad:** `capitulos/004-continuidad-y-revision.md` · **blob `9f59ed796dc9df9e1cddf6eae629ae0b5b2fb4a9`**.  
**Continuidad previa:** C003 corregido `9a4eb8305b6996649c4889620868c7aefd719611`, sus correcciones H01/L01/L02 verificadas en la adenda 04 de esta PR.  
**Fuentes de canon examinadas:** `vintage-telnet-2/content/regions/edran.json` (main, blob `dbdaead65f026a57925857f36388b28b94054498`), `docs/CANON_VIGENTE.md`, Expediente 01 del Historiador #706.  
**Autorización:** Arquitectura Editorial autorizó **C004 como borrador**, en `plan/DECISION_EDITORIAL_C002_C003_Y_ARRANQUE_C004_2026-10-14.md` (#705). **C005 aún NO autorizado** en el corte revisado.

## Dictamen ejecutivo

**CAPÍTULO 004 APROBADO LITERARIAMENTE POR EL AGENTE 03 CON DOS PULIDOS PUNTUALES RECOMENDADOS, NO BLOQUEANTES.** La historia avanza efectivamente desde el campo al terraplén; el descubrimiento de la pala, los golpes y las marcas no introduce un secreto artificial; el carro presenta peligro verosímil y provoca **pérdida de agua**, consecuencia que reaparece en la petición final de otra persona. **Geografía y ambientes cotejados; sin contradicción de canon confirmada.** 

Esta aprobación es **literaria**, no ratifica por sí sola personajes, sucesos privados ni canon compartido de VT2. **Sin fusión ni publicación definitiva hasta co-decisión Arquitecto Editorial + VT2**. No autoriza ni solicita iniciar C005.

## 1. Evaluación escena por escena

**A. Zanja seca: cierre de promesa anterior.** El título del capítulo se justifica al descubrir que unas líneas tomadas por rodadas son **marcas de arrastrar un tablón**. Una trabajadora anónima explica dos golpes de madera contra piedra, sin fabricar una revelación mística para pagar el cierre de C003. Se respetan los escalones y la entrada oscura de la zanja como **lo visible**: Lera no baja, no aprende ni expone lo reservado. La trabajadora está más arriba, coherente con la actividad diurna documentada.

**B. Era: confirmación por comparación.** Las rodadas reales se distinguen de las huellas de la tabla, con círculo de tierra dura, tablones y poste del viento. El humor seco de la trabajadora («no te quedes averiguando quién dejó cada marca») funciona porque no sermonea y ella continúa con su tarea.

**C. Terraplén: escalada material.** El carro en una subida estrecha, las raíces, el traqueteo creciente y las paredes que esconden la curva crean riesgo sin convertir la historia en combate. El tropiezo obliga a retroceder y hace que la cantimplora golpee la pared, se salga el tapón y **pierda parte del agua que Lera cargó desde Valdren**. El porteador en el ensanche apoya una solución propia de quien conoce la zona, no un guía mágico que conoce todo el camino.

**D. Caminante del saco: nueva responsabilidad.** El segundo encuentro de paso cambia la naturaleza del conflicto: de dejar espacio para el carro a colaborar físicamente para bajar una carga y después considerar si compartir el agua que le queda. La pregunta final tiene coste inmediato y su continuidad está preparada por el derrame; conserva intriga **sin introducir poder, misión, enemigo o secreto**.

**Voz y público lector:** perspectiva en tercera persona cercana a Lera, descripciones táctiles y auditivas, diálogos breves y reconocibles. Para lector de 10–14 años la secuencia mantiene orientación clara. Para adultos el subtexto de juicio apresurado y cooperación está presente sin moraleja doctrinal. C004 aporta una **consecuencia de recursos** diferente del riego de C001–C002 y de la precaución ante fauna de C003.

## 2. Observaciones precisas y gravedad

| ID | Gravedad | Hallazgo textual | Ajuste mínimo propuesto |
|---|---|---|---|
| **L01 — visibilidad de casa después de media cuesta** | **BAJA / precisión de canon; recomendada** | «La casa del camino se recortó contra el cielo **cuando alcanzaron la parte media** de la cuesta». El JSON afirma «La casa de arriba no aparece **hasta pasada la mitad** de la cuesta». La nota de continuidad del Escritor ya describe «más arriba» correctamente. | Cambiar a **«al dejar atrás la mitad de la cuesta»** o equivalente. Evita una discrepancia literal de punto de vista sin reescribir escena. |
| **L02 — referente de «El hombre»** | **BAJA / claridad de acción; recomendada** | Tras presentar al **porteador** y a «una persona» agotada con el saco, se lee «**El hombre** trató de dividir la carga en dos bultos, pero el cabo de cuerda ...». La referencia probablemente es el porteador, pero no queda inequívoco quién manipula el saco del caminante. | Cambiar «El hombre» por **«El porteador»**, o «La persona del saco» si ése es quien lo intenta. Mantener claro que la persona dueña del saco participa/consiente la maniobra. |

**No hay hallazgos medios ni graves** que obliguen a otro circuito de reescritura. L01 y L02 son microediciones recomendadas al Escritor, **no condiciones para retirar el visto bueno literario**.

**Observación de composición, no corrección:** dos incidentes de tránsito aparecen durante la misma subida. Se justifican porque uno produce **pérdida de agua** y el otro presenta la decisión de compartirla. No añadir un tercero semejante inmediatamente en C005: pagar el dilema y variar el tipo de escena. El motivo de las huellas está cerrado suficientemente; no abrir misterio antiguo donde ya se explicó trabajo humano corriente.

## 3. Verificación específica del canon

| Hecho presentado | Fuente `content/regions/edran.json` | Resultado |
|---|---|---|
| Surcos → Zanja seca (hacia este) | `rooms.edran_surcos.exits.este = edran_zanja_antigua` | **CONFIRMADO** |
| Fondo seco, raíces, escalones, losa vertical y herramienta con trabajo más arriba de día | `rooms.edran_zanja_antigua.description`, `.day` | **CONFIRMADO**. La identidad de la trabajadora y dos golpes son **ficción particular propuesta**, no evento obligatorio del juego. |
| Zanja → Era al norte | `rooms.edran_zanja_antigua.exits.norte = edran_era`; `rooms.edran_era.exits.oeste = edran_zanja_antigua` | **CONFIRMADO** |
| Era de suelo duro, tablones, piedras, poste, polvo y dirección norte de subida | `rooms.edran_era.description`; `rooms.edran_era.exits.norte = edran_terraplen` | **CONFIRMADO** |
| Terraplén con raíces al aire, rodadas estrechas, circulación de carros y porteador esperando en ensanche | `rooms.edran_terraplen.description`, `.day` | **CONFIRMADO**, ampliación literaria de encuentros episódicos, sin NPC nuevo canónico |
| Casa del camino después de media subida | `rooms.edran_terraplen.description`: «no aparece hasta **pasada la mitad**» | **COMPATIBLE con ajuste de precisión L01** |
| Terraplén → Casa del camino al norte | `rooms.edran_terraplen.exits.norte = edran_casa_camino` | **CONFIRMADO**. Lera todavía **NO entra** en C004. |

**Límite de secretos:** Lera observa escalones y una entrada oscura, detalles ya públicos del campo `description` de la zanja. **No** toma la salida `edran_zanja_antigua.exits.este = edran_canal_entrada`; no entra al canal cubierto ni deduce su secreto, no nombra constructores, no inventa misiones, clases o criaturas. Saltalodo sigue excluido de escenas Edran hasta acuerdo en #706. 

**Eventos no convertibles automáticamente en canon del juego:** trabajadora del tablón, golpes, pala, falsa interpretación de marcas, carro bajando, derrame de cantimplora, porteador y persona del saco, obligación de compartir agua. Todos son episodios de novela dentro de espacios y comportamientos plausibles. **Co-validación Editorial + VT2 pendiente** antes de fusionar o declarar edición definitiva.

## 4. Continuidad emocional y material hacia C005

- **Lera:** carta a Dalia terminada, seca y no entregada; taza todavía en bolsa; **cantimplora llena declarada en C003** ahora casi vacía por derrame en C004; palma con raspadura leve y hombro dolorido, sin sanación súbita; todavía no ha llegado a la casa del camino.
- **Trabajadora de la zanja/era:** confirma haber hecho los golpes con una tabla; no acompaña ni transmite misterios. La pala queda como herramienta común.
- **Porteador:** detiene el paso de Lera hacia el ensanche seguro y ahora la acompaña brevemente; apoya su carga en terreno firme cuando ayuda a bajar el saco. No debe convertirse en NPC oficial ni aliado obligado sin decisión editorial.
- **Caminante del saco:** persona anónima agotada que pregunta si queda agua; su identidad, género, oficio, pertenencia o destino **no deben inventarse retroactivamente** como hechos de VT2.
- **Ubicación:** en `edran_terraplen`, pasada la mitad de subida, todavía antes de `edran_casa_camino`; no fijar horas, kilómetros o duración de tramo sin evidencia.
- **Desenlace inmediato obligatorio en la continuidad (no autorización de redactarlo):** responder **de forma concreta** si Lera comparte parte del agua, propone otra solución o decide conservarla, y **mostrar el coste** de esa respuesta. No dejar el dilema sin resolución durante otro capítulo de monólogo. Antes de atribuir agua disponible a la casa, verificar `edran_casa_camino` y no inventar una fuente garantizada.

## 5. Dictamen operativo y destinatarios

**Escritor 01, PR #705:** capítulo **aprobado literariamente**; ajustar opcionalmente L01 («pasada la mitad») y L02 (referente de «El hombre»), actualizar su continuidad si cambia un hecho y compartir blob nuevo para cotejo corto. **No hace falta reescritura**, ni pausar revisión por culpa de estas dos frases. **C005 no está autorizado** en el corte consultado; sólo Arquitectura Editorial puede habilitarlo.

**Arquitecto Editorial:** confirmar cierre literario de C004 y decidir resolución de la petición de agua en la ficha de C005, manteniendo progresión real de la ruta. No elevar los dos pulidos a bloqueo de producción.

**Arquitecto VT2 + Editorial:** resolver por escrito dentro de la PR #705 propuesta → hecho VT2 → tensión → decisión → alcance, tanto para C004 como para personajes/turnos anteriores y prólogo. Contradicción genuina sin resolver **bloquea fusión**. El visto bueno del Editor 03 sólo certifica coherencia literaria revisada.

**Historiador 02, PR #706:** no es necesario abrir expediente nuevo para estas habitaciones; comprobar únicamente si surge choque documental localizado.

**Arte/EPUB 04, PR #708:** usar inventario y originales aprobados para zanja/terraplén si el circuito lo permite, sin suponer que las imágenes reproducen exactamente los episodios privados; no publicar como edición definitiva sin permiso.

**Siguiente tarea del Agente 03:** verificar una nueva versión de C004 sólo si corrige L01/L02, y dictaminar C005 si el Arquitecto lo autoriza y el Escritor lo entrega. Registrar por separado el cotejo final del prólogo corregido de la rama #705, todavía bajo co-validación VT2.

— *Firma funcional: Agente 03 — Editor Integral y Revisor de Canon · Crónicas de Vaisgard.*
