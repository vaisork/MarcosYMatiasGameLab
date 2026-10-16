# Capítulo 001 — Registro breve de continuidad y revisión

**Entrega:** [001-una-decision-al-amanecer.md](001-una-decision-al-amanecer.md)  
**Agente:** `escritor-aventuras-vaisgard-01`  
**Estado:** borrador literario — **WIP=1**; no aprobado para merge o publicación.  
**Base de autorización:** `plan/DECISION_ARRANQUE_EDITORIAL_2026-10-14.md`, PR #705.  
**Extensión revisada:** aproximadamente 2,526 palabras contando título. La extensión fue considerada aceptable en el dictamen editorial.

## Qué ocurre (sin canon nuevo para el juego)

La protagonista **Lera** (humana de 24 años, original y **provisional del libro**) quiere partir desde Valdren para llevar personalmente una carta a **Dalia**, otra figura original y exclusiva de la ficción, que se ha trasladado a Vaisgard según la memoria de Lera. Lera desea rectificar palabras hirientes pronunciadas cuando Dalia se marchó. **No se crea una misión, NPC o antecedente en VT2.** Se omite por ahora dónde localizar a Dalia en Vaisgard y si querrá recibirla.

**Mara**, amiga y compañera de tareas de Lera, es también figura **original exclusiva del libro**, sin equivalencia con NPCs ya registrados. Lera había pensado partir sin reorganizar su turno de mantenimiento de agua. Una tabla móvil de la canaleta está mal asentada; al intentar repararla sola, Lera falla. Mara le ayuda y acepta cubrir solo la apertura inmediata del día siguiente, **sin garantizar los turnos posteriores**. El capítulo termina en la plaza, con Lera habiendo dicho públicamente que se irá, pero sin salir del pueblo. Debe negociar el resto del trabajo y preparar la carta y equipaje.

## Hechos del mundo usados y evidencias

| Hecho / detalle | Fuente exacta | Etiqueta |
|---|---|---|
| **Valdren** está en **Llanos de Edran** y se vincula con agua, huertos y cargas. | `vintage-telnet-2/docs/CANON_VIGENTE.md`; `vintage-telnet-2/content/regions/edran.json > regions.edran` | ABIERTA / CONFIRMADA |
| Plaza: tierra apisonada, casas bajas, banco que rodea una piedra vieja, sonido de la fragua, espacio para carros. | `content/regions/edran.json > rooms.valdren_plaza.description` | ABIERTA / CONFIRMADA |
| Gallo y primeras actividades en la plaza al amanecer. | `rooms.valdren_plaza.dawn` | ABIERTA / CONFIRMADA |
| Una mujer mayor y un niño observan marcas de semillas durante el día. | `rooms.valdren_plaza.day`; `actions.valdren_plaza_conversar` | ABIERTA / CONFIRMADA |
| Desde la plaza al este está el **Corredor de los Huertos**. | `rooms.valdren_plaza.exits.este = valdren_huertos`; `rooms.valdren_huertos.exits.oeste = valdren_plaza` | ABIERTA / CONFIRMADA |
| Camino de tierra blanda, cercas, puertas de cocina, canaleta de madera y árbol viejo en huertos. | `rooms.valdren_huertos.description` | ABIERTA / CONFIRMADA |
| Trabajo de riego, huertos y convivencia cotidiana de Valdren. | `CANON_EXPANSION.md > Edran`; `docs/CANON_VIGENTE.md`; `rooms.valdren_huertos` | ABIERTA / CONFIRMADA |
| Origen/autor de la piedra del banco. | **No atribuido ni explicado.** | DESCUBRIBLE / RESERVA DE INTERPRETACIÓN |

**Importante:** se consultó el contenido vigente remoto del juego. La discrepancia documental entre el contrato y la estructura real de `world.json` señalada en PR #706 **no afecta a la escena**: se utiliza directamente `content/regions/edran.json` para lugar y conexiones.

## Aportes literarios que NO se convierten en canon por escribirlos

| Elemento | Estado y límite |
|---|---|
| Lera, su vínculo con Dalia, la carta y una pelea previa | COMPATIBLE / FICCIÓN EXCLUSIVA DEL LIBRO. Pendiente de revisión editorial de personaje y motivación. |
| Mara, su relación con Lera y los diálogos | COMPATIBLE / FICCIÓN EXCLUSIVA DEL LIBRO. No asignar como NPC, servicio ni misión del juego. |
| Turnos específicos compartidos por Lera y Mara | COMPATIBLE / situación particular de la ficción; no implica calendario oficial del pueblo. |
| Tabla móvil mal asentada, cuña astillada, humedad y arreglo temporal de la canaleta | COMPATIBLE / **hecho material nuevo de la novela**: revisar con Arquitectura VT2 para asegurar que no contradice estados del lugar; no declarar cambio persistente en el mapa/juego. |
| Salida personal proyectada hacia Vaisgard | COMPATIBLE / no describe duración, distancia ni conexión nueva. Lera sigue en Valdren. |
| Dalia en Vaisgard | COMPATIBLE / afirmación biográfica **sobre personaje original**, sin afirmar presencia o localización exacta dentro del mundo jugable. |

## Conocimiento y causalidad

- **Lera** conoce Valdren, el turno local de riego y su discusión con Dalia. **No conoce** el futuro del trayecto ni la respuesta de Dalia.
- **Mara** descubre en escena que Lera quería partir ese mismo día; puede inferir para quién es la carta porque Lera se lo dice. No lee la carta.
- **Dalia** no aparece, no habla y no recibe información durante este capítulo.
- El niño y la mujer mayor de la plaza no conocen la conversación privada ni adquieren papel canónico nuevo.
- La tabla se reacomoda **solo como solución temporal**, y queda vigilancia pendiente; no adjudicar transformación permanente del lugar ni mejora del juego.
- No se emplean criaturas, facultades de clase, secretos de especie, magia, premios, nivel, misiones, estadísticas ni geografía exterior a Valdren.
- **Estado final:** decisión y comunicación de partida tomadas; Lera no abandona Valdren; sus compromisos de trabajo siguen parcialmente abiertos. Lera **corrige en la misma hoja** el inicio de la carta; **no está terminada**. La taza quedó accesible en el bolsillo exterior de la bolsa y se usa en la broma de despedida.

## Candidaturas de ilustración — sin arte incorporado

1. **Apertura / plaza:** Lera ante el banco de Valdren, al amanecer; contraste entre su bolsa y el trabajo del pueblo. Referencia de localización a revisar: `vintage-telnet-2/client/art/places/valdren-anime-v1.webp`. **No se afirma que el archivo represente exactamente esta escena.**
2. **Corredor de los huertos:** canaleta bajo el árbol y manos trabajando; **solo si existe recurso original adecuado y aprobado**. No generar imagen nueva.

El Director de Arte 04 decide si se ilustra alguna de las escenas y valida manifiesto, archivo exacto y autorización. No inventar representación de Lera o Mara si no existe arte original válido.

## Puertas de revisión solicitadas EN ESTA PR

- [ ] **Arquitecto Editorial:** validar voz, extensión, interés, trabajo dramático, relación Lera–Dalia y estructura del primer capítulo.
- [ ] **Arquitecto VT2:** revisar geografía de plaza/huertos y compatibilidad del accidente/turnos de riego; clasificar hecho nuevo y alcance solo libro.
- [ ] **Revisor Integral 03:** revisar fluidez, diálogos, coherencia, tensión apropiada para lectores de 10–14 años y adultos.
- [ ] **Arte 04:** validar candidaturas de ilustración solo una vez aprobado el contenido.
- [ ] **Arquitecto Editorial:** registrar tensiones y decisiones resueltas y autorizar el cierre del capítulo; **no iniciar Capítulo 2 mientras exista WIP abierto**.

**Límite:** contenido Markdown solamente en `VintageTelnet-Libros/`. No se modificó juego, assets, entorno Raspberry ni Segundo Cerebro. Ningún permiso de fusión ni publicación se deriva de esta entrega.

## Revisión del borrador — respuesta del Escritor 01

**Lecturas recibidas:** Arquitectura Editorial, `revision/REVISION_ARQUITECTURA_EDITORIAL_C001_2026-10-14.md` (#705) y Revisor Integral 03, `agentes/revisor-canon-vaisgard-01/DICTAMEN_01_CAPITULO_001.md` (#707).

| Observación | Acción ejecutada |
|---|---|
| M01 — corregir vs reescribir carta | Lera dice «Voy a corregirla»; escribe dos frases en margen de la carta existente, coherentemente con el carboncillo recibido. |
| M02 — Capítulo 2 repite inventario de bolsa | **No se redactó C002.** Se propuso ajustar su ficha en `plan/fichas-001-003.md` hacia turnos, despedida y compromiso concreto. Su autorización sigue pendiente. |
| M03 — taza y posición física | Se indica el bolsillo exterior y el gesto de sacarla antes de la broma. |
| L01 — regreso y cierre | Se condensaron repeticiones puntuales de la vuelta a la plaza, sin eliminar la escena de la semilla ni la carta. |
| L02 — tercera persona limitada | «Parecía procurar» marca una inferencia observable, no conocimiento interno de la vecina. |
| D01 — enlace entre archivos | Ruta corregida para dos Markdown en la misma carpeta. |

**Pendientes inalterados:** revisión conjunta de canon (Arquitecto Editorial + Arquitecto VT2) sobre reparación temporal/turnos particulares y figuras originales; nuevo cotejo literario por Agente 03; aprobación textual final. Ningún cambio en VT2 ni publicación.
