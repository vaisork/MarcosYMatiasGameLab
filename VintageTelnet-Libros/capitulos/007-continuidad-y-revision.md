# Capítulo 007 — Continuidad, canon y revisión

**Manuscrito:** [007 — Entre cargas y nombres](007-entre-cargas-y-nombres.md).  
**Responsable:** `escritor-aventuras-vaisgard-01` — [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705).  
**Estado:** BORRADOR ENTREGADO; sin aprobación literaria ni co-decisión de canon. **WIP=1: C008 NO iniciado ni autorizado.**  
**Extensión:** 2,365 palabras, encabezado incluido.  
**Blob de manuscrito:** `1f0a2185d0fe3c6266537b02deee9f2214b8529d`.  
**Autorización formal:** `../plan/DECISION_CIERRE_C006_Y_AUTORIZACION_C007_2026-10-15.md`.  
**Continuidad previa:** C006 `27365396a724f92556a8bf2050208bd209f2e6fa`, **aprobado literariamente por Arquitectura Editorial y Revisor 03**; no confundir con visto bueno de canon VT2.

## 1. Trayecto y escenas objetivas

**Inicio:** literalmente después de C006: Lera acaba de atravesar el arco de la Puerta de los Campos (`veyra_puerta_campos`) y se encuentra **todavía allí**, sin teletransportarse a mercado o plaza. La llovizna es continuación **exclusivamente narrativa** del episodio de lluvia de C006. Lleva bota y media húmedas (se acentúa la bota que chapotea), carta terminada y seca para Dalia bajo chaqueta, taza con asa torcida en bolsillo exterior, cantimplora parcialmente repuesta, raspadura superficial en palma y hombro algo dolorido. No declara que las lesiones hayan sanado.

**Paso 1:** desde `veyra_puerta_campos` al **este** hacia `veyra_barrio_cargas` («Calle de los almacenes»). Entra a la calle entre escaleras exteriores de piedra, puertas bajas de almacenes y tráfico de carga lento; un carro efectúa un giro con dos ayudantes, la **raya pintada** señala un área que debe quedar libre, y una vecina espera con una jarra para alcanzar su escalera. Lera interpreta mal un hueco, invade momentáneamente el espacio de giro y sale cuando se lo piden; esto no es un nuevo accidente o bloqueo grave. Después **pregunta expresamente por Dalia** a la vecina. La vecina **no la conoce** ni conoce las referencias de huertos de Valdren, no le atribuye oficio/domicilio ni da ruta privilegiada; la conversación apunta en términos generales a un lugar público donde se encuentran varias rutas. La vecina y ayudantes son **ficción privada de novela**, no NPCs.

**Paso 2:** continúa al **este** a `vaisgard_mercado`. Lugar canónico: puestos de fruta, herramientas, cestas, toldos apoyados en piedra antigua, olores a pan/fruta/cuerda y **canalillo** que cruza el centro, sobre el que hay una **tabla móvil** para ruedas. La narración distingue la zona de fruta de herramientas siguiendo `rooms.vaisgard_mercado.return` y la práctica comercial de **Bela**. Lera hace su segunda pregunta real por Dalia a **Bela (`veyra_bela`)**, en su función pública de comerciante de camino. Bela **no sabe dónde está** y no declara conocer su identidad, familia, trabajo ni domicilio; sugiere solo la dirección pública **norte hacia la Plaza de las Cinco Rutas**. No se produce compra, venta, encargo, flag ni servicio de búsqueda de personas.

**Paso 3:** una **vendedora de fruta anónima** del mercado escucha la pregunta y vuelve a hablar con Lera. Tampoco conoce a Dalia; refuerza que la plaza es un lugar de tránsito de distintas rutas, no una garantía de hallar a nadie. Lera nombra por primera vez frente a extraños la relación con Dalia —fueron amigas, y su propia frase hiriente las distanció—. Es un acto dramático de iniciativa, no un dato de paradero. La escena aporta un momento de humor ligado al chapoteo de la bota y al contraste entre familiaridad rural y mercado urbano.

**Cierre:** Lera camina al **límite norte de `vaisgard_mercado`**, desde el cual **se ve** la Plaza de las Cinco Rutas (conforme a `rooms.vaisgard_mercado.look.norte`); **no ha entrado todavía en `veyra_plaza_rutas`**, ni ha contactado a Arel, Nera, Doma ni otros NPC urbanos. Ha elegido preguntar primero a gente que parezca venir de los campos cuando entre a la plaza, **sin testimonio sobre Dalia**. La carta permanece sin entregar y no aparece Dalia. No se garantiza que una persona concreta de Valdren esté allí.

## 2. Matriz de canon CONFIRMADO / ABIERTO

| Hecho | Fuente técnica `vintage-telnet-2/` | Alcance |
|---|---|---|
| Puerta de los Campos al este conduce a Calle de los Almacenes | `content/regions/veyra.json > rooms.veyra_puerta_campos.exits.este = veyra_barrio_cargas` | CONFIRMADO / ABIERTO |
| Calle de almacenes al este desemboca en Mercado | `rooms.veyra_barrio_cargas.exits.este = vaisgard_mercado` | CONFIRMADO / ABIERTO |
| Escaleras exteriores sobre almacenes, carros lentos y raya pintada; actividad con dos ayudantes y vecina de jarra | `rooms.veyra_barrio_cargas.description`, `.day`, `.examine.raya`, `.examine.escalera` | CONFIRMADO / ABIERTO, diálogos ficticios |
| Lluvia y barro fino en almacenes, tablones sin cubrir drenaje | `rooms.veyra_barrio_cargas.rain` | COMPATIBLE; la lluvia concreta es de novela |
| Mercado: frutas, herramientas, cestas, toldos, canalillo y tabla móvil | `rooms.vaisgard_mercado.description`, `.day`, `.rain`, `.examine.canalillo` | CONFIRMADO / ABIERTO |
| Herramientas y fruta situadas en lados distintos del canal | `rooms.vaisgard_mercado.return` | CONFIRMADO / ABIERTO |
| Bela comerciante de camino; separa armas y alimentos, atiende compradores | `npcs.veyra_bela.role`, `.description`, `.day` | CONFIRMADO / ABIERTO |
| Mercado al norte conduce a plaza, que puede verse desde el mercado | `rooms.vaisgard_mercado.exits.norte = veyra_plaza_rutas`, `.look.norte` | CONFIRMADO / ABIERTO |

**Verificar antes de publicación:** ninguna de las frases nuevas para Bela es diálogo oficial del NPC; son **variaciones solo literarias** sobre su función pública de comerciante. No adopta la biografía ni información descubierta de ningún otro personaje.

## 3. Aportes COMPATIBLES exclusivos de esta novela

| Elemento | Límite |
|---|---|
| Conversación con vecina de escalera y dos ayudantes que giran carga | Ficción particular; ambientación pública sí figura en `veyra_barrio_cargas.day`. No crear nuevo trabajador/NPC, peaje o trámite oficial. |
| Respuestas negativas de vecina, Bela y vendedora de fruta acerca de Dalia | **No se afirma que el mundo/VT2 confirme desconocimiento global de Dalia**. Cada respuesta vale solo para ese encuentro literario. Nadie da domicilio ni la sitúa en el mercado. |
| Lera recuerda haber dicho algo horrible antes de la separación | Ya establecido en C001–C002. **No** se introduce un hecho nuevo que modifique el contenido de la carta. |
| Preguntar por una amiga y decidir ir a la plaza | Acción humana privada. La plaza es tránsito público, **no oficina de personas desaparecidas**, no flag, no misión de Arel o archivo. |
| Gente que habla desde ventanas, un niño con cesta, humor por bota | Escena cotidiana compatible sin agregar hechos permanentes al runtime. |
| Llovizna final, toldos aún goteando, bota chapoteando | Continuidad del clima **ficcional**, sin declarar lluvia obligatoria en el juego. |

**Exclusiones expresas:** ni Dalia ni Lera están dados de alta como NPC VT2; no se adjudican nombres, casas u ocupaciones nuevas a Dalia, y no aparece de manera fortuita. Ningún secreto de fundación/galerías ni quest, flags, nuevos servicios o política de ciudad. El conflicto de calle es **social/urbano**, no otro choque de carro, resbalón o asalto.

## 4. Continuidad y próximos pasos

- **Lera**: ha preguntado concretamente a varias personas por Dalia y asumido ante una desconocida que la relación se rompió tras palabras suyas. Sale del capítulo sin ubicación ni noticias de Dalia, pero con un **lugar de búsqueda siguiente verificable**: `veyra_plaza_rutas` al norte del mercado.
- **Dalia**: sigue ausente, sin conocimiento de la visita ni carta entregada. Los recuerdos de la relación son privados; no se crea su ficha urbana. **No usar datos de su ubicación en C008** sin una ficha/autorización expresa.
- **Bela**: permanece comerciante en `vaisgard_mercado`, no convierte la pregunta en misión ni da garantías de conocer residentes.
- **Posición final**: límite norte del Mercado, mirando hacia la Plaza; jamás afirmar que C007 recorrió ya Plaza o sus patios.
- **Objetivo de longitud**: el propietario conserva provisionalmente **15 capítulos + prólogo**; la migración de la trama a la ciudad se decidió para no prolongar artificialmente Edran. El escritor no altera `plan/libro-01.md` ni autoriza C008.

## 5. Revisión editorial solicitada

- [ ] **Arquitectura Editorial (#705):** continuidad y personalidad de Lera, primer acto de búsqueda real, variación del riesgo urbano, credibilidad de la búsqueda y ritmo de los 15 capítulos.
- [ ] **Editor 03 (#707):** lectura completa de C007, causalidad del error en zona de carga, conversación con la vecina, Bela sin omnisciencia, reacción emocional no repetitiva y final a la vista de plaza.
- [ ] **Historiador 02 (#706):** cotejo únicamente puntual, si es requerido, de Bela y `veyra_barrio_cargas.day/rain`, `vaisgard_mercado.return/look`. El mapa documental Nota 05 sirve como base, no hace falta otro atlas.
- [ ] **Arquitectos Editorial + VT2:** co-decisión expresa sobre personajes exclusivamente de la novela, conversaciones nuevas atribuidas a Bela y límites de mundo; junto con pendientes de prólogo/Saltalodo. Ninguna fusión ni publicación definitiva hasta cierre.
- [ ] **Arte/Publicador 04 (#708):** nueva prelectura provisional según autorización editorial posterior, con imagen original validada; no suponer que el texto es final.

**No iniciar C008 hasta orden formal. PR #705 continúa en borrador.**
