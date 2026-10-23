# Nota 07 — C008/C009: testigos privados sobre Dalia y función pública de Arel

**Historiador 02 · PR #706 · cotejo focal, WIP=1.** Solicitudes: comentario del Escritor sobre [C008](https://github.com/vaisork/MatiasGameLab/pull/706#issuecomment-6201781431) y [C009](https://github.com/vaisork/MatiasGameLab/pull/706#issuecomment-6202792980), con instrucción del Arquitecto Editorial sobre [límites de canon](https://github.com/vaisork/MatiasGameLab/pull/706#issuecomment-6202630009). **Sin nuevo atlas ni edición de ramas ajenas.**

**Manuscritos cotejados directamente en #705:**
- `VintageTelnet-Libros/capitulos/008-la-plaza-de-las-cinco-rutas.md`, blob **`e3ee67a0399b3737a4b1992abdd1089b9d46bbee`** (corregido por Editor 03); continuidad `008-continuidad-y-revision.md`, **`2aeb7c9d8d3b54227db8044eb8fa2a543c18dfa4`**.
- `VintageTelnet-Libros/capitulos/009-el-aviso-y-la-respuesta.md`, blob **`8116313f9394e50089d68bc09351b8f4892400eb`**; continuidad `009-continuidad-y-revision.md`, **`3ad03d98db3cedfcf0ec06b2aac62c14eefd1555`**.
- Fuente de juego `vintage-telnet-2/content/regions/veyra.json`, blob **`500a04d7dd3c2a72c750a69381664f2eed5500bf`** en `main`: `rooms.veyra_plaza_rutas`, `rooms.veyra_patio_porte`, `rooms.veyra_patio_senales`, `npcs.veyra_arel`, `stories.veyra_recados`. Antecedentes de Edran, Lera, Dalia y carta documentados en #705 y en las Notas 04–06 de #706.

## 1. C008 — cotejo de lugares y testimonios

| Hallazgo | Fuente verificable | Tipo y decisión |
|---|---|---|
| Mercado **norte** → Plaza de las Cinco Rutas; Plaza **oeste** → Patio de animales; Patio **este** → Plaza; alero de mensajes **este** de Plaza | `rooms.vaisgard_mercado.exits.norte`, `veyra_plaza_rutas.exits.{oeste,este}`, `veyra_patio_porte.exits.este` | **CONFIRMADO / ABIERTO**. C008 no cruza al archivo ni se atribuye haber entrado al patio de mensajes antes de C009. |
| Piedras grandes como bancos, voces de varias rutas, cuidador que afloja cincha, bebedero y porteadora Dravak con piedras | `rooms.veyra_plaza_rutas.{description,day}`, `rooms.veyra_patio_porte.{description,day,examine.cinchas}` | **CONFIRMADO / ABIERTO**. Cuidador y porteadora son actividad ambiental; **ninguno es nuevo NPC canónico ni servicio permanente**. |
| **Iven** (creció en Valdren) recuerda a una Dalia que preguntó por una amiga junto a la canaleta, sin nombre de amiga, fecha precisa ni paradero | Manuscrito C008, escena Iven; no fichas `npcs` de VT2 | **COMPATIBLE como ficción privada**, **NO confirmado por runtime**. El nombre coincide con ficción de Valdren, pero un testimonio de terceros **no prueba** identidad absoluta ni sentimientos definitivos de Dalia. |
| **Nara** caminó un tramo con una Dalia y oyó una pregunta acerca de enviar carta desde ciudad; no vio tal carta ni sabe destinatario/destino | Manuscrito C008, escena Patio de Porte | **COMPATIBLE / hecho biográfico nuevo exclusivo de la novela**, sujeto a co-decisión Editorial+VT2. **No convertir** en correo oficial, misión, residencia o itinerario verificable del videojuego. |
| Lera escribe su nombre/procedencia y deseo de hablar con Dalia en **recorte privado** y se lo confía voluntariamente a Nara, sin promesa de entrega | Manuscrito C008, diálogo y papel (distinto de carta personal) | **COMPATIBLE solo novela**: el recorte queda **en manos de Nara**, y la carta a Dalia sigue con Lera. No activa `veyra_recados`, `veyra_atribuir_mensaje` ni un registro de destinatario. |

**Tensión C008 a registrar, NO contradicción dura:** Iven y Nara introducen **dos recuerdos nuevos de Dalia** que influyen en la relación central. La arquitectura editorial puede admitirlos **solo dentro del Libro I** siempre que VT2 ratifique **no trasplante** de biografías/estado de NPC al juego. Las precauciones están explícitas en el texto: Iven dice no saber si es la misma Dalia; Nara no conoce el destino. **Ninguna de ellas sabe dónde está Dalia al momento de la novela.** El relato sí presenta a Lera entendiendo esos recuerdos en clave personal; eso es **punto de vista**, no prueba documental externa ni revelación reservada.

## 2. C009 — función de Arel y límites reales

| Elemento de C009 | Fuente VT2 y límites |
|---|---|
| Plaza **este** → `veyra_patio_senales`, regreso **oeste** → Plaza | **CONFIRMADO**: `rooms.veyra_plaza_rutas.exits.este` y `rooms.veyra_patio_senales.exits.oeste`. C009 **no** visita `veyra_archivo_cargas`. |
| Tablillas clasificadas por ruta, alero con banco, papel doblado que dos mensajeras intentan leer | **CONFIRMADO/ABIERTO**: `rooms.veyra_patio_senales.{description,day,examine.tablillas}`. Las marcas identifican procedencia: **no certifican lectura/entrega al destinatario**. |
| **Arel** Vesperi, mensajera de ruta, escucha procedencia completa y lleva fundas separadas para urgencias | **CONFIRMADO/ABIERTO**: `npcs.veyra_arel.{species,role,home_room,description,day,topics.mensajes,topics.espera}`. El carácter prudente con las fuentes encaja. |
| Arel declina buscar a Dalia, recibir carta sin destino, afirmar que Dalia dejó mensaje, registrar un servicio o garantizar comunicación | **COMPATIBLE con su función pública y los límites de `topics.mensajes`**. No se convierte en receptora de la carta ni localizadora omnisciente. |
| Arel ofrece **solo de palabra**, **si alguien le pregunta a ella mientras está**, repetir lo que Lera autoriza: nombre, Valdren, piedra especificada y **dos atardeceres** | **COMPATIBLE como conversación personal puntual**, **NO servicio canónico** de mensajería, registro, búsqueda, custodia o cita garantizada. Es propuesta nueva de diálogo del Libro I; **requiere ratificación conjunta** por emplear un NPC oficial. |
| Tras diálogo, Lera vuelve a Plaza y decide esperar dos tardes; Nara todavía tiene recorte y Lera conserva carta | **COMPATIBLE solo novela**. No se agrega reloj/trigger del juego, estado de espera, misión ni entrega efectiva de papel. |

**Protección contra revelar secretos o activar tramas ajenas:** C009 no invoca `rooms.veyra_patio_senales.actions`: `veyra_atribuir_mensaje` (flag `veyra_mensaje_atribuido`), `veyra_recados_copia`, `veyra_recados_turnos`, ni `veyra_secreto_piedra` (visitas mínimas). Tampoco usa `npcs.veyra_arel.topics.hueco` (condicionado a `veyra_piedra_hueco`), `topics.talla` (requiere `pista_talla`) o `topics.decirlo una sola vez` (trama `veyra_recados_pedido`). **No se exhiben galerías, secreto del armazón ni dato de Dalia procedente del juego.**

**Cautela puntual de oficio para próximos capítulos:** el horario y sitio de Lera quedan compartibles con desconocidos solo **bajo autorización explícita de Lera y condición «si preguntan a Arel»**; la precisión de la piedra no garantiza identidad de quien se presente. No ampliar a tablilla pública, difusión por rutas, dato permanente de localización ni promesa de que Arel esté allí todas las tardes. El acuerdo de palabra **no impone** permanencia a Arel ni vuelve obligatoria respuesta de Dalia. El costo narrativo de esperar debe seguir siendo real, sin convertirlo en quest disparada al pasar dos tardes.

## 3. Estado de canon y decisión pedida

**Dictamen documental limitado:** **NO detecto choque específico con la geografía pública de Plaza/Patio, con el rol público de Arel ni con el carácter reservado/condicionado de sus temas y acciones** en los dos manuscritos revisados. Sí hay **hechos personales nuevos propuestos para novela**; esto no equivale a canon aprobado ni a aprobación de publicación.

| Propuesta | Evidencia | Tensión | Solicitud de co-decisión y alcance |
|---|---|---|---|
| Iven y Nara, recuerdos de canaleta y pregunta por posible carta de Dalia | C008 vigente y `veyra.json` para ambientes | Dos piezas nuevas de biografía relacional sin NPC/quest equivalente | **Editorial + VT2:** aceptar o ajustar **solo Libro I**, sin ampliar datos públicos ni canonizar paradero de Dalia. |
| Diálogo de Arel y acuerdo oral restringido sobre los dos atardeceres de Lera | C009 vigente, `npcs.veyra_arel` y `rooms.veyra_patio_senales` | NPC **canónico** usado en acción inventada, sin inventario/flag | **Editorial + VT2:** aprobar **solo conversación privada de novela**, sin nuevo servicio, mandato, acción, cuota ni persistencia de juego. |
| Distinción recorte entregado a Nara vs carta de Dalia no enviada | C008+C009 | Riesgo de atribuir «entrega» futura sin fundamento | Registrar **sin garantía de transmisión**, reservar desenlace al Escritor y decisión editorial. |
| Saltalodo Edran/Lethra, prólogo VT1, Lera/Dalia/Mara/Sabel y hechos anteriores | Notas 02–06 y consulta formal en esta PR | **Pendientes de co-canon previos** | Mantener espera de respuesta del **Arquitecto VT2**; esta nota no emite aprobación en su nombre ni levanta prohibición de fusión. |

**Handoff operativo:** Escritor #705 puede continuar exclusivamente con capítulo que **autorice** Arquitectura Editorial; Editor 03 conserva dictamen literario. La Nota 05 de Veyra es suficiente, **no abrir otro atlas**. Historiador queda **WIP=1 cerrado** hasta consulta nueva; **PR #706 sigue draft**, no fusionar/publicar definitivamente sin la decisión expresa de Arquitecto Editorial + Arquitecto VT2.
