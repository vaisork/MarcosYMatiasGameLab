# Capítulo 010 — Continuidad, canon y revisión

**Libro:** *Crónicas de Vaisgard* I, «El primer camino». **Autor:** `escritor-aventuras-vaisgard-01`. **PR:** [#705](https://github.com/vaisork/MatiasGameLab/pull/705).  
**Texto:** [010 — El precio de quedarse](010-el-precio-de-quedarse.md); **2,611 palabras** (encabezado incluido), SHA **`0f51415ce523cbc9262e28be41affe54a089ca1e`**.  
**Permiso formal:** `../plan/DECISION_CIERRE_C009_Y_AUTORIZACION_C010_2026-10-15.md`. ÚNICO capítulo en WIP=1.  
**Estado:** borrador completo, **PENDIENTE** dictamen Editor 03 + cierre literario Arquitectura Editorial; **NO C011** sin autorización nueva.  
**Continuidad previa:** C009 `8116313f9394e50089d68bc09351b8f4892400eb`, aprobado literariamente por Editor 03 y Arquitectura Editorial, sin cambios; matriz `3ad03d98db3cedfcf0ec06b2aac62c14eefd1555`.

## 1. Reloj narrativo exacto y recorrido

| Momento | Posición VT2 | Lo que ocurre |
|---|---|---|
| **Día 0, atardecer después de C009** | `veyra_plaza_rutas`, piedra-banco junto al lado del Mercado | Lera recuerda compromiso de estar **mañana y el día siguiente, al caer la tarde**. **Todavía no es primer atardecer de espera.** |
| **Día 0, atardecer/noche** | `veyra_plaza_rutas --sur--> vaisgard_mercado` | Compra **pan pequeño** con sellos no cuantificados; vuelve a tratar con vendedora de fruta ambiental ya aparecida en C007. La vendedora admite **solo por esa noche** que Lera se quede en un rincón cubierto detrás del puesto, mediante contraprestación **privada** en sellos, sin cama, protección especial, derecho de permanencia o servicio oficial de alojamiento. |
| **Noche 0 → mañana del día 1** | `vaisgard_mercado`, puesto privado | Descanso incompleto, bota/media siguen húmedas aunque dejan de gotear. La vendedora cumple lo anunciado: al empezar a abrir, necesita de nuevo el paso para sus cestas; Lera sale. No hay segunda noche incluida. |
| **Día 1, mañana → media tarde** | `vaisgard_mercado` | Lera consume resto de pan de día 0. Vendedor de cestos **anónimo y de ficción** le propone arreglo de dos bordes por alimento; repara dos y recibe la porción acordada. Comienza un tercer borde, pero debe **abandonarlo sin cobrarlo** para acudir al encuentro antes de anochecer. |
| **Día 1, primer atardecer prometido** | `vaisgard_mercado --norte--> veyra_plaza_rutas`, piedra-banco especificada | Lera llega con luz declinante y permanece mientras cae el sol. **Nadie trae noticia de Dalia**. Regresa la preocupación material por comida/refugio del día 2; el segundo atardecer **todavía NO ocurre**. |
| **Cierre, noche 1 al acercarse** | `veyra_plaza_rutas` | Lera se levanta de la piedra, sin lugar confirmado para dormir esa nueva noche; aún debe cumplir **un segundo atardecer, al día siguiente**. |

**Conectividad verificada:** `vintage-telnet-2/content/regions/veyra.json > rooms.veyra_plaza_rutas.exits.sur = vaisgard_mercado`; `rooms.vaisgard_mercado.exits.norte = veyra_plaza_rutas`. No visitó Patio del Agua ni Calle de Toldos; no inventar salto o uso de servicios de estos lugares.

## 2. Material público confirmado del videojuego

| Lugar/detalle | Fuente | Uso |
|---|---|---|
| Plaza extensa, antiguas piedras lisas usadas como bancos, tránsito de rutas | `content/regions/veyra.json > rooms.veyra_plaza_rutas.description`, `.day` | **ABIERTO / CANÓNICO**; sin atribuir origen/fundador de piedras |
| Al anochecer, cargas buscan patio; en noche persisten pasos, luces bajas, viajeros | `rooms.veyra_plaza_rutas.dusk`, `.night` | **ABIERTO**; distingue claramente final del día 0 y atardecer del día 1 |
| Mercado de cestas, fruta y herramientas apoyado en muros antiguos | `rooms.vaisgard_mercado.description`, `.day` | **ABIERTO** |
| Cierre de toldos al atardecer, retirada de cestas y conversación entre puestos | `rooms.vaisgard_mercado.dusk`, `.night` | **ABIERTO** |
| Canalillo con paso por tabla móvil | `rooms.vaisgard_mercado.examine.canalillo`, `.description` | **ABIERTO**; Lera solo descansa cerca, no altera hidráulica |
| Sellos usados para compras ordinarias | Economía ya presente en novelas anteriores y VT2 | **COMPATIBLE** como moneda; sin precio fijo canónico, balance o nuevo servicio del runtime |

## 3. Decisiones, costos y ficción privada NO canonizada en VT2

1. **Vendedora de fruta de C007, regreso episódico:** su identidad sigue sin ficha NPC. Su oferta de **un único rincón cubierto entre mercancías**, con pago acordado privado por una noche, **no es posada, servicio estable, regla del servidor ni tipo de hospedaje de Vaisgard**. Pide dejar el paso libre al alba y prohíbe encender fuego. No recibe carta, no sabe dónde está Dalia ni hace búsqueda. **Revisor debe cotejar si la escena privada de descanso es compatible sin normalizar negocios inventados**.
2. **Pan comprado:** vendedor corriente sin nombre ni precio fijo; Lera compra la pieza menor, conserva una parte para el día siguiente, la come. No se inventan tarifas de comida universales ni restauración de vida en runtime.
3. **Vendedor de cestos episódico:** existe trenzado y artesanía común en una ciudad con cestas y mercados; es personaje privado de novela, **NO artesano NPC institucional**, no da misión, recompensa XP ni trabajo permanente. Acuerdo particular: reparación de dos cestos con herramienta prestada a cambio de alimento, sin fijar valor de sellos ni trabajo pagado por toda cesta futura. Lera **renuncia voluntariamente a pago por tercer cesto sin acabar** y devuelve herramienta.
4. **Elección central y costo:** después de pagar refugio precario y pan, Lera podría quedarse reparando cestos para ganar más alimento, pero el tiempo termina y decide conservar la promesa privada de estar localizable al atardecer. **Sacrificio verificable:** deja el trabajo adicional y su comida potencial, la noche siguiente queda sin asegurar, la palma se irrita levemente tras la labor. No cambia misiones de VT2.
5. **Primera espera sin respuesta:** la plaza no garantiza contacto; Arel **NO aparece ni entrega aviso**, ni es vigilante/servicio de búsqueda. Nadie sabe mágicamente dónde vive Dalia. No se introduce tercer testigo afortunado de la novela.
6. **Tiempo y estaciones:** dos atardeceres son parte de la **agenda privada de Lera**, no una mecánica de relojes, duraciones o clima fijo impuesta al mundo.

## 4. Inventario y vínculos al cerrar C010

- **Carta para Dalia:** original doblada, seca, dentro de la chaqueta de Lera; sin enviar ni mostrar. No se hace una nueva copia.
- **Recorte de C008:** texto firmado por Lera todavía en manos de **Nara**; no se confirma entrega, lectura, pérdida o encuentro con Dalia. **Arel no custodia recorte ni carta**.
- **Carboncillo:** conservado, no utilizado en este capítulo.
- **Taza de madera con asa torcida:** bolsillo exterior de la bolsa, sin transferirla a vendedor.
- **Cantimplora:** conserva *algo de agua*, no se afirma «mitad», no se rellena ni se usa con tarifa.
- **Ropa:** una bota y media del arroyo aún húmedas, aunque más secas que en C006; no secado milagroso ni equipamiento nuevo.
- **Dolores:** hombro sensible por carga; palma con raspadura leve preexistente y una marca nueva superficial producida por fibras de cesto. **No** heridas graves, enfermedad ni curación de NPC.
- **Sellos:** pagó un pan pequeño y el refugio privado de esa única noche, sin precio numeral, balance exacto ni gratuidad. Quedan sellos finitos y recursos alimenticios inseguros.
- **Iven / Nara / Dalia:** no reaparecen en escena; no surge información nueva ni se declara paradero de Dalia. Los recuerdos de C008 permanecen como propuestas solo literarias, pendientes co-decisión VT2/Editorial.
- **Tiempo pendiente:** queda **segundo atardecer prometido** (día 2). No se ha asegurado alojamiento para la noche 1 en el cierre del manuscrito.

## 5. Revisión y frontera de publicación

- [ ] **Revisor Integral 03 (#707):** lectura completa del capítulo y secuencia atardecer día 0→noche→mañana→primera espera día 1; verosimilitud de refugio pagado por única noche, trato al comerciante de cestos, costo emocional/temporal, economía y heridas. Revisor tiene permiso del propietario para microcorrecciones, con SHA y matriz, **no para reescritura ni cambios de canon**.
- [ ] **Arquitectura Editorial:** validar que no cae en dos esperas idénticas, que el compromiso cuesta recursos y trabajo abandonado; cerrar literariamente si procede y **decidir expresamente C011 después**, sin permiso tácito por entregar C010.
- [ ] **Historiador 02 (#706):** solo si se detecta duda de geografía pública, NPC o servicio institucional; el mapa vigente Nota 05 de Veyra es suficiente, **no** crear atlas.
- [ ] **Arquitectura VT2 + Editorial:** mantener bloqueo de fusión/edición final hasta co-decidir prólogo VT1→VT2, uso de Arel/Bela, ficción exclusiva de Lera/Dalia/Iven/Nara, escena de descanso y comercio privado y conflicto Saltalodo Edran/Lethra.
- [ ] **Publicador 04 (#708):** continuar mejora del EPUB y accesibilidad real Android/Drive sin esperar C010. Añadir C010 a la prelectura solo cuando la revisión literaria autorice una edición incremental; no confundir con libro final.

**WIP=1: C011 no iniciado.** PR #705 se mantiene DRAFT, sin merge ni publicación definitiva. Solo cambios bajo `VintageTelnet-Libros/`, nunca runtime del juego.
