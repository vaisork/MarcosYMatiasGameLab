# Dictamen 15 — Capítulo 014 «Lo que dejamos pendiente»

**Obra:** *Crónicas de Vaisgard* · Libro I «El primer camino».  
**Agente:** `revisor-canon-vaisgard-01`, Editor Integral y Revisor de Canon.  
**Autoría:** [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705), rama `editorial/cronicas-vaisgard-agente-01-voz`. **Revisión:** [PR #707](https://github.com/vaisork/MatiasGameLab/pull/707), rama `editorial/revisor-canon-vaisgard-01-dictamen-705`.  
**Capítulo leído íntegramente:** `VintageTelnet-Libros/capitulos/014-lo-que-dejamos-pendiente.md`, original **`3641c22b5eef533de82c23ee5ad38c7c04a9e11d`** (~3.058 palabras según Escritor). **Manuscrito actual tras edición DIRECTA de Editor 03:** **`d9bae6c9e5629216f65a418c1d65a9ab964fbbcc`** (~3.057 palabras por espacios).  
**Matriz continuidad actualizada en PR #705:** `capitulos/014-continuidad-y-revision.md`, blob **`9efbfb82484fa6697e0090b772096022de41c82f`** (original `8118a620b87c73bc1f7116495f87c468b779d3fa`).  
**Permiso vinculante:** `plan/DECISION_CIERRE_C013_Y_AUTORIZACION_C014_2026-10-16.md`, exclusivamente C014, WIP=1, C015 NO autorizado al corte.  
**C013 ya aprobado literariamente por Arquitectura Editorial:** `013-una-ruta-propia.md`, `4b8dd7beb6dc4289470b4301fa8d955d9a69126a`, matriz `1e5e0c251da8abf23fcc80e3cca677e48ac0c309`.  
**Canon cotejado:** `vintage-telnet-2/content/regions/edran.json` del remoto `main`, blob **`07d67231dcefe745f52ecc6b632881bc43af2c97`**, y extremos de `vintage-telnet-2/content/regions/veyra.json`; diálogo y turnos anteriores de Mara y Sabel contrastados con el C002 `002-lo-que-se-queda.md`, blob **`0d24df1220cac11cfab1d7de4e8f6c4776f19a98`**.

## 1. Veredicto editorial

**C014 APROBADO LITERARIAMENTE POR EDITOR INTEGRAL 03; UNA MICROCORRECCIÓN DE CRONOLOGÍA L01 YA APLICADA DIRECTAMENTE EN PR #705, Y SIN CORRECCIONES MENORES PENDIENTES.**

El capítulo **consigue el objetivo humano que faltaba**: Lera regresa a Valdren, escucha de Sabel y Mara cómo tuvieron que sostener la canaleta y los turnos tras su partida, reconoce el costo específico sobre otra parcela y sobre la confianza personal, y **acepta una colaboración limitada en vez de pretender reparar su ausencia con una promesa inmensa**. Sabel no aplaude ni devuelve a Lera todos los turnos; Mara no ofrece perdón total. El acto de volver **no recompensa automáticamente** a Lera con reconciliación, autoridad ni certeza sobre Dalia.

La escena principal tiene **un desenlace parcial completo**: vecinos escuchados y consultados, límite de tareas, reunión al día siguiente con Sabel, Mara y la vecina, advertencia previa ante incumplimiento. Es una respuesta concreta a lo que Mara pidió desde C002. El final de la gota aún presente es adecuado: no queda todo arreglado por su presencia, pero Lera por primera vez puede mirar lo pendiente **junto a otros**. Es un final de capítulo orgánico, **sin cortar el diálogo a la mitad ni añadir relleno para llegar a una cuota**.

La corrección L01 evita que Sabel hable de **una primera semana ya transcurrida** y problemas posteriores, cuando el libro **solo ha registrado un viaje aproximado de cinco jornadas** desde la partida de Valdren; ver §3. Este dictamen editorial **no equivale** a cierre del Arquitecto Editorial, co-decisión de canon VT2 ni permiso de fusionar/publicar edición definitiva.

## 2. Evaluación narrativa y continuidad de escenas

1. **Inicio exacto tras C013:** Lera sale por `veyra_puerta_campos` al final del día 3, todavía con conductor y dos ayudantes. C014 **no supone llegada inmediata** a Valdren; narra el arroyo, calzada, Casa del Camino, terraplén, era y un reparo público. La travesía es **a pie**, con cansancio, agua/alguna comida gastadas y hombro resentido por correa improvisada.
2. **Cruce del hito sin invención de ingeniería:** Lera pasa **sola a pie** por las tres piedras; se sienta junto al poste y el carro queda fuera de vista. Reencuentra el convoy en la calzada **sin afirmar por dónde atravesaron las ruedas**. Esto es correcto: `edran_hito_campos` representa las tres piedras de paso peatonal y el JSON no fija solución de carro; tampoco se inventa puente, vado pavimentado ni mecanismo de vehículo.
3. **Viaje abreviado, no tour repetido:** en secuencia coherente `edran_hito_campos → edran_calzada → edran_casa_camino → edran_terraplen → edran_era → edran_reparo`, el grupo pasa por Casa del Camino sin nueva charla gratuita con Aren, descansa en **banco público bajo techo** del reparo, no en posada ni cama garantizada. La breve noche 3 causa falta de sueño, no sanación ni recursos nuevos; conductor y ayudantes mantienen sus límites.
4. **Separación del carro día 4:** al reanudar, acompañan hasta la era `edran_reparo.exits.norte = edran_era`; conductor declara que no va a Valdren y **Lera continúa sola**, como había acordado desde C013. Un ayudante ofrece un **trozo sobrante propio** de cuerda con consentimiento del conductor; refuerza nudo provisional sin sustituir correa por equipo mágico ni crear suministro ilimitado.
5. **Regreso por mapa abierto:** `edran_era → edran_zanja_antigua → edran_surcos → edran_acequia → edran_salida_huertos → valdren_huertos`. La zanja antigua aparece seca, con herramienta junto a losa y entrada oscura; **Lera NO explora el canal secreto** ni revela tecnología/historia subterránea. En acequia cruza por **losa ancha**, sin nueva caída dramática ni uso de mecánicas. Aparecen dos postes de entrada al pueblo y corredor de huertos que ya existen en C002–C003.
6. **El trabajo continúa sin Lera:** canaleta aún lleva agua, cuña cambiada temporalmente, nueva humedad, gota cuando aumenta el caudal, tablilla de turnos revisada; **ni ruina catastrófica ni funcionamiento perfecto**. Se conserva lo pactado en C002: revisar junta/tabla, nadie promete reparación permanente, responsabilizarse por cambios de horarios. Sabel primero pone límite claro «mirar, no tocar» y requiere escuchar el estado actual.
7. **Consecuencias precisas, no culpa abstracta:** Sabel ha cubierto más revisiones y perdido horas de su parcela; algunas hojas se dañaron antes de llegar a cocina, **no toda la cosecha**. Mara y vecinos ya adaptaron turnos y tablilla; **no estaban esperando a Lera** para vivir. La tensión demuestra impacto sin elevar el desastre por melodrama.
8. **Escena central Mara–Lera:** Mara dice que más que encargarse de la canaleta le dolió **haber sido apartada de la decisión**, porque Lera había pasado días considerando marcharse y seguía hablando de un mañana compartido. Lera no usa su sufrimiento en Vaisgard como pago retroactivo; admite su falta, no promete quedarse para siempre y sí promete **hablar antes de cerrar sus decisiones**. Mara responde que tendrá que comprobarlo: confianza en proceso, no reconciliación instantánea.
9. **Acción concreta tras el diálogo:** Lera y Mara consultan con otra vecina sus posibilidades reales antes de fijar turnos del día siguiente; acuerdan revisar con Sabel, sin prometer que nadie hará dos trabajos a la vez. La escena **termina de verdad**; cierre en gota no es cliffhanger impuesto a otra PR.
10. **La trama Dalia no desaparece:** la carta íntima a Dalia sigue con Lera; Mara sabe ahora de Iven/Nara únicamente por lo que Lera relata, **no posee paradero de Dalia**. Lera le explica que dejó en Vaisgard una **nota distinta** para Mara con Arel; Mara no la ha recibido. Mara acepta hablar con Dalia **solo si Dalia pregunta por Lera**, sin convertirse en investigadora ni prometer reconciliación.
11. **Tono y lectores:** la escena combina reserva emocional, detalles de trabajo compartido, humor de la taza con asa torcida y diálogo creíble. El ritmo se apoya en acciones verificables y personas con prioridades independientes; adecuado a lectores de 10–14 y adultos.

## 3. Microcorrección L01 EJECUTADA directamente — cronología

**L01: frase original:** «La primera semana funcionó el relevo. Después la gota empezó a aumentar cuando abríamos más agua».  
**Nueva versión vigente:** «Al principio funcionó el relevo. Después la gota empezó a aumentar cuando abríamos más agua».

**Por qué es necesaria:** C003 comienza la partida al amanecer siguiente al acuerdo de C002; C003–C006 continúan viaje y llegada a Vaisgard sin semana intercalada. C009–C014 cuentan explícitamente tarde del día 0 → noches/días 1, 2, 3 → **mañana del día 4** de regreso a Edran y Valdren. La frase «primera semana» afirmaba **más de siete días antes** de problemas que Sabel relata **ya ocurridos**: no está sustentado. La nueva locución preserva la realidad de que **primero** funcionó el plan y **después** hubo cambios de turnos/cuñas sin fijar semana ficticia. La estructura, intención de Sabel, cifra de horas perdidas y reproche a Lera permanecen intactos.

- **Manuscrito original:** `3641c22b5eef533de82c23ee5ad38c7c04a9e11d`.
- **Commit manuscrito microcorregido en PR #705:** `2eb6fa12657915436888109dccb50f16d7329c14`, SHA actual **`d9bae6c9e5629216f65a418c1d65a9ab964fbbcc`**.
- **Commit matriz de continuidad actualizada:** `6bb535d485eacf6601beed666ddc479177adc3d3`, SHA actual **`9efbfb82484fa6697e0090b772096022de41c82f`**.
- **Alcance:** una frase editada directamente bajo autorización del propietario para pequeños errores, sin volver a mandar ajustes al Escritor; ninguna reescritura, reestructuración, nueva escena o cambio al juego.

**No quedaron más minucias que necesiten edición.**

## 4. Canon espacial verificado y fronteras VT2

| Elemento | Evidencia del remoto | Juicio |
|---|---|---|
| `veyra_puerta_campos` → `edran_hito_campos` → `edran_calzada` → `edran_casa_camino` | `edran.json > rooms.*.exits` y `veyra.json` | **CONFIRMADO** |
| Casa del Camino → Terraplén → Era → Reparo | `edran_casa_camino.exits.sur = edran_terraplen`; `edran_terraplen.exits.sur = edran_era`; `edran_era.exits.sur = edran_reparo` | **CONFIRMADO** |
| Reparo → Era de regreso al día siguiente | `edran_reparo.exits.norte = edran_era` | **CONFIRMADO** |
| Era → Zanja antigua → Surcos → Acequia → Salida huertos | `edran_era.exits.oeste = edran_zanja_antigua`; `edran_zanja_antigua.exits.oeste = edran_surcos`; `edran_surcos.exits.sur = edran_acequia`; `edran_acequia.exits.oeste = edran_salida_huertos` | **CONFIRMADO** |
| Salida huertos → Valdren | `edran_salida_huertos.exits.oeste = valdren_huertos`; C002/C003 antecedentes | **CONFIRMADO** |
| Reparo de madera bajo cubierta, bancos y viajeros | `rooms.edran_reparo.description/dusk/night` | **CONFIRMADO**, sin dormitorio institucional |
| Casa del Camino y Aren | `rooms.edran_casa_camino.description/day`, C005 | **CONFIRMADO** escenario, no servicios activados |
| Hito/arroyo y tres piedras | `rooms.edran_hito_campos.description/arrivals` | **CONFIRMADO** cruce peatonal; paso de carro **NO ESPECIFICADO**, excluido de escena |
| Zanja seca y acceso al canal antiguo | `rooms.edran_zanja_antigua.description/exits.este` | **CONFIRMADO ambiente**; acceso secreto **NO UTILIZADO** |
| Cuña/tablilla de Valdren, Mara y Sabel | Antecedentes literarios C002; no se confunden con personajes/quebranto oficial del runtime | **NOVELA compatible**, sin hechos de mundo oficializados |
| Conversaciones íntimas y reparto de turnos | Suceso narrativo privado, no quest/flags de juego | **SOLO NOVELA**, decisión conjunta de canon pendiente |

## 5. Estado de continuidad final de C014

- **Ubicación y tiempo:** Lera se encuentra **de vuelta en Valdren, en el corredor de huertos**, al atardecer de **día 4**. **Mañana día 5 antes de abrir el agua**, Mara, Sabel, Lera y posible vecina deben revisar la cuña y acordar turnos; no se puede decir que la junta está definitivamente reparada.
- **Acuerdo:** Lera **no recupera los turnos ni autoridad automáticamente**; Sabel ha aceptado que observe y ayude dentro de límites por palma lesionada; Mara sigue herida aunque hay humor/posibilidad de reparación. Han hablado con la vecina para saber si realmente puede relevar y bajo qué condición; deben comprobarlo al siguiente turno.
- **Carta a Dalia:** **CON LERA**, en bolsillo seco de chaqueta, sin destinataria identificada, no enviada ni entregada; Dalia no aparece, no responde ni concede perdón.
- **Nota de C012 para Mara:** **CON AREL** en Vaisgard como recado ordinario, salida/entrega/acuso **NO CONFIRMADOS**. Mara se entera **solo porque Lera se lo dice ahora**; no ha recibido nada. Sigue el punto canónico sin resolver de un cobro singular de sellos por Arel, bajo etiqueta solo novela.
- **Recorte C008 con Nara:** **CON NARA** sin confirmación de transmisión.
- **Inventario/cuerpo:** taza de asa torcida con Lera, carboncillo envuelto en tela de Mara desde C002, cantimplora con agua limitada, sellos escasos, bolsa con correa acortada y nudo reforzado con **trozo de cuerda excedente cedido por ayudante**; bota/media casi secas, hombro sensible, palma irritada. Comió parte del alimento de C013; el viaje no se vuelve gratis ni cura lesiones automáticamente.
- **Carro:** separados en Era. Conductor y dos ayudantes se marchan a sus obligaciones, sin encuentro prometido ni carácter institucional.
- **Dalia:** ubicación/desarrollo sentimental no confirmados. Mara no sabe más de su paradero; Lera debe decidir qué hacer con la carta y aceptar que Dalia puede no querer recibirla.

## 6. Advertencia editorial estratégica para el eventual capítulo final

**C014 resuelve bien el núcleo de responsabilidad Mara/Sabel, pero todavía está abierto el motivo declarado del viaje del Libro I: la carta y la relación Dalia–Lera.** Esto no requiere un encuentro feliz ni siquiera Dalia en escena: sí requiere una **consecuencia emocional encarnada** que haga inteligible cómo Lera vivirá con su ausencia y qué decisión concreta tomará con la carta. Una coda de mera reflexión o una nueva misión para «encontrarla» no bastan. El objetivo de quince capítulos y prólogo es **provisional**; no inventar retorno mágico, tiempo postal comprimido ni reencuentro arbitrario para cumplir el índice. Tampoco dejar sin relato el acuerdo del día 5 con Mara/Sabel que se pacta explícitamente aquí; puede servir como acción que cierre el arco si se integra en la decisión personal de Lera.

**La aprobación del Editor no autoriza C015.** Arquitectura Editorial debe ratificar este C014 en SHA vigente y autorizar con ficha independiente, si corresponde, un capítulo final que pague esos hilos sin inflación de escenas. La doble co-decisión Editorial+VT2 para canon y publicación sigue abierta; no confundir prelectura interna ilustrada EPUB v03 con edición final.

## 7. Transferencia y tareas

**Arquitectura Editorial:** revisar C014 con manuscrito **`d9bae6c9e5629216f65a418c1d65a9ab964fbbcc`**, matriz **`9efbfb82484fa6697e0090b772096022de41c82f`**. Confirmar cierre literario, y **solo entonces**, si procede, emitir ficha específica para C015, evitando cortes abruptos ni episodios de relleno. C013 queda cerrado; no reabrir C001–C013 por rutina.

**Escritor PR #705:** L01 ya corregida sin reenvío, nada pendiente. No escribir C015 sin autorización. Conservar carta de Dalia con Lera, nota Mara con Arel y recorte con Nara; fecha del encuentro de turno (mañana día 5) y falta de perdón automático. No convertir canaleta en reparada o agenda fija.

**Historiador PR #706:** ningún choque duro nuevo de mapa ni intervención de NPC/quests. Solo cotejos focales y co-decisiones pedidas por Arquitectos; especialmente acuse/sellos Arel en C012 y personajes de novela, sin crear atlas nuevo.

**Director de Arte/EPUB #708:** conservar la prioridad de facilitar **EPUB v03 ilustrado ya generado para P+C001–C012** con acceso Android y Google Drive privado realmente verificables; inclusión de capítulos adicionales solo en ediciones incrementales literariamente aprobadas. No declarar publicaciones finales sin co-canon.

**Cierre de Editor 03: C014 APROBADO LITERARIAMENTE CON L01 DIRECTA RESUELTA, SIN PENDIENTES MENORES; publicación definitiva pendiente validación conjunta Editorial + VT2.**

— *Editor Integral y Revisor de Canon*