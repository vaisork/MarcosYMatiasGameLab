# Decisión editorial — cierre C007; maqueta prioritaria y autorización C008

**Proyecto:** *Crónicas de Vaisgard*, Libro I «El primer camino». **Fecha:** 15 de octubre de 2026.  
**Escritor:** [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705). **Editor:** [PR #707](https://github.com/vaisork/MatiasGameLab/pull/707). **Historiador:** [PR #706](https://github.com/vaisork/MatiasGameLab/pull/706). **Arte/Publicación:** [PR #708](https://github.com/vaisork/MatiasGameLab/pull/708).

## 1. Diagnóstico real y orden de prioridad

**Publicador 04 es el cuello de botella para la lectura familiar prevista para el 16 de octubre.** Al verificar PR #708, el EPUB 3 ilustrado disponible aún incluye **portada/prólogo/C001/C002**, no los capítulos C003–C007 ya escritos; no consta EPUBCheck satisfactorio ni prueba documentada en lector móvil. PR #708 debe concentrarse **PRIMERO** en entregar un EPUB **PRELECTURA PROVISIONAL** actualizado con **prólogo + capítulos 1–7 completos**, con o sin ilustraciones interiores todavía pendientes, usando los archivos vigentes de PR #705. **La maqueta no requiere esperar C008** y debe dar lugar a un archivo de lectura verificable y navegable. El Director de Arte/publicación no debe confundir entrega de prelectura interna con publicación final/Drive: continúa pendiente la co-decisión VT2 y permiso propietario.

**Escritor y Publicador son agentes diferentes**; WIP=1 aplica **por agente**, no impide la escritura paralela de un solo capítulo nuevo. En paralelo, el Escritor #705 puede iniciar C008 siguiendo la ficha de abajo, sin condicionar la entrega EPUB a C008.

## 2. C007 — visto bueno literario del Arquitecto Editorial

**Capítulo 7 «Entre cargas y nombres» aprobado literariamente por Arquitectura Editorial**, sobre manuscrito vigente `capitulos/007-entre-cargas-y-nombres.md`, blob **`6aca35d8ca12704ce189e70349d8740c6c4b3f61`** (~2,368 palabras); continuidad blob **`739f58bef51ea28a843c9154afdc7eac00100fc3`**. Leí la prosa completa, matriz y Dictamen 08 del Revisor 03, basado en la versión anterior `1f0a2185d0fe3c6266537b02deee9f2214b8529d`. **La única observación L01 queda materialmente resuelta** en el texto actual: se enumeran correctamente **tres** consultas a vecina, Bela y vendedora, sin modificar el conteo anterior de dos preguntas situado antes del tercer diálogo. El Editor 03 debe **confirmar sólo ese pasaje en adenda**, sin reabrir C001–C006.

**Logros:** ruta exacta `veyra_puerta_campos → veyra_barrio_cargas → vaisgard_mercado`; Lera pregunta por Dalia a tres personas; la conversación con Bela es verosímil y limitada a su rol público; Lera finalmente declara que Dalia era su amiga y que la lastimó; el capítulo termina **al borde norte del Mercado**, viendo la Plaza pero **sin entrar**. No hay información acreditada del paradero de Dalia, misiones ni secretos alterados. El visto bueno literario NO es aprobación conjunta de canon VT2, merge o edición definitiva.

## 3. AUTORIZACIÓN EXPRESA — C008 único WIP del Escritor 01

**Autorizar solamente C008, título provisional «La plaza de las cinco rutas»**, en PR #705. No C009.

**Entregables:** `VintageTelnet-Libros/capitulos/008-la-plaza-de-las-cinco-rutas.md` y `008-continuidad-y-revision.md`, narración y matriz del canon. Extensión orientativa 2,000–2,700 palabras si la tensión lo justifica; sin prolongar el capítulo por cuota.

### Apertura y geografía obligatorias

Continuación inmediata C007: Lera está **en el límite norte del Mercado de Vaisgard**, con mirada dirigida a `veyra_plaza_rutas`, pero **todavía no ha pisado la Plaza**. Conexión `vaisgard_mercado.exits.norte = veyra_plaza_rutas`, respaldada en `vintage-telnet-2/content/regions/veyra.json`. La Plaza tiene piedras enormes antiguas usadas como asientos, mucha gente de las cinco rutas y avisos públicos; **no** atribuir constructor, cronología ni naturaleza secreta a piedras antiguas.

C008 puede situarse principalmente **en `veyra_plaza_rutas`** y, si acciones concretas lo requieren, acercarse de forma conectada **al este por `veyra_patio_senales`** (alero de avisos; contexto público) o **al oeste `veyra_patio_porte`**, respetando la continuidad de cada conexión. No activar como conseguida la misión de Arel/Nera ni identificar a Dalia mediante lista oficial inexistente. No recorrer todas las regiones por el mero gusto del atlas.

**Estado físico/personal:** carta seca y aún sin entregar a Dalia, taza de madera con asa torcida, cantimplora parcialmente llena, bota/media húmedas del cruce, pequeña raspadura y hombro algo sensible. Lera conoce a Bela pero Bela **no** sabe dónde está Dalia. Aren queda en la Casa del Camino; no repetir el rumor de la rueda.

### Conflicto y progresión dramática nuevos

C007 terminó con **tres negativas** y una confesión pública. **C008 no puede ser otra ronda de cuatro personas que dicen «no sé»**, ni repetir el tema de mentira/rumor de C005, saco/agua de C004, resbalones de C006 o mero paseo por una plaza.

**Condición de eficacia:** obtener un **primer indicio humano específico** y verificable **en el marco privado de la novela**, no información milagrosa ni demostración automática de que Dalia esté en un sitio concreto: por ejemplo, alguien procedente de los campos conoce una persona de Valdren que podría aportar una noticia, una marca/contacto privado relacionado con la antigua amistad que Lera pueda cotejar o una ocasión real de dejar una pregunta sin convertirla en quest. Todo indicio debe tener **fuente, límites y costo de seguirlo**; la pregunta es «¿a quién puedo ir a ver y por qué?», no «¿qué NPC sabe todo?». Si introduce un antecedente nuevo de Dalia/Valdren, registrarlo **como ficción novelística propuesta**, sin asignarle rol, residencia, trabajo, parentesco, NPC ni flag en VT2.

Lera debe **actuar**: elegir creer o verificar una fuente, renunciar a una opción menos fiable, perder una oportunidad material, entrar a una relación nueva con consecuencia o comprometer un recurso limitado. Construir un giro de curiosidad/esperanza/temor que la acerque al conflicto de hablar con Dalia, sin resolverlo todavía. Una escena de humor urbano o carácter individual de varias especies es bienvenida sin catálogo étnico.

**Cierre esperado:** resultado **materialmente distinto** de C007: ha identificado un siguiente paso razonado, abierto a incertidumbre, o ha hecho algo que cambia el modo en que puede buscar a Dalia; no acabar solo con «preguntará otra vez». Mantener el libro accesible a 10–14 y adultos; no introducir clímax de mundos antiguos antes de que madure el arco de la amistad.

### Estructura

Conservar por ahora **15 capítulos + prólogo** como objetivo aprobado por el propietario. Ya cruzó a Vaisgard al C006, así que C008–C015 deben sostener una **historia urbana y personal real**, no ocho visitas a salas con una moraleja por capítulo. Si se recomienda reducir 11–13 por ritmo, llevar propuesta al propietario **antes** de alterar el plan, no recortar unilateralmente.

## 4. Entrega simultánea por rol

- **Publicador 04, PR #708 — máxima prioridad de entrega:** generar EPUB 3 reflowable **BORRADOR**, orden Portada → Prólogo → C001–C007, desde SHAs actuales de #705, TOC navegable, portada simple si el arte retrasa, sin cabeceras de revisión, QA verificable (EPUBCheck si disponible; declarar si no), fuente exacta y enlace al binario en su PR; comprobar que se abra. No subir a Drive ni distribuir como definitivo sin permiso del propietario y co-canon Editorial + VT2.
- **Escritor 01, PR #705:** únicamente C008 bajo esta ficha, en paralelo al trabajo del Publicador. No C009.
- **Revisor 03, PR #707:** cotejo mínimo L01 del actual C007, luego revisión completa C008 cuando exista.
- **Historiador 02, PR #706:** la Nota 05 ya respalda la Plaza/Veyra. Solo responder dudas puntuales sobre `veyra_patio_senales`, personas públicas y frontera de información de Arel/Nera; no atlas nuevo.
- **Arquitecto VT2 + Editorial:** ratificar marco de personajes exclusivos de la novela y límites de secreto/prólogo y Saltalodo. Sin co-decisión no hay merge o publicación definitiva.

**El propietario no tiene que escoger entre crear el capítulo 8 y recibir maqueta: los dos agentes pueden trabajar a la vez; la prioridad de la entrega de prelectura es inequívocamente el Publicador.**
