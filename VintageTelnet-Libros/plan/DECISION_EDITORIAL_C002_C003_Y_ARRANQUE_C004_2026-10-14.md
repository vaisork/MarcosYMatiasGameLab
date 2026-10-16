# Decisión editorial — C002 corregido, C003 revisado y autorización de C004

**Proyecto:** *Crónicas de Vaisgard* — Libro I: *El primer camino*  
**Fecha local de decisión:** 14/10/2026 (México).  
**PR de autoría:** [#705](https://github.com/vaisork/MatiasGameLab/pull/705). **Revisor:** [#707](https://github.com/vaisork/MatiasGameLab/pull/707).  
**C002 corregido:** `capitulos/002-lo-que-se-queda.md`, blob **`0d24df1220cac11cfab1d7de4e8f6c4776f19a98`**, aproximadamente 2,726 palabras.  
**C003 entregado:** `capitulos/003-mas-alla-de-las-cercas.md`, blob **`3714303b280434e44739221fd6e782732f1d1331`**, aproximadamente 2,013 palabras; continuidad blob **`7d41f4768a9c5dbd834e4fe149c40c6837386dcc`**.

## 1. C002: correcciones del Editor 03 verificadas

He cotejado el texto realmente vigente con el [dictamen C002 del Editor 03](https://github.com/vaisork/MatiasGameLab/blob/editorial/revisor-canon-vaisgard-01-dictamen-705/VintageTelnet-Libros/agentes/revisor-canon-vaisgard-01/DICTAMEN_03_CAPITULO_002_LO_QUE_SE_QUEDA.md):

- **M01 RESUELTA:** Sabel ahora precisa que la recogida de **agua de su parcela sigue siendo responsabilidad suya**; quienes aceptan el relevo recogen **hojas destinadas a cocina**. Se muestra a Sabel llenando sus dos recipientes y llevándolos a su parcela antes de caminar con Lera y Mara. No existe tarea olvidada ni "relevo" indefinido.
- **M02 RESUELTA:** Lera lleva la tablilla sólo hasta la revisión final vespertina y **la entrega físicamente a Sabel**, quien confirma que la conservará disponible para cotejarla con Mara y vecinos. El objeto NO viaja con Lera.
- **L01 (recipientes) RESUELTA** en el texto con transición explícita.
- **L02 (eco temático)** queda como opción de pulido: no perjudica la continuidad ni justifica un bloqueo.

**Dictamen de Arquitectura Editorial: C002 APROBADO LITERARIAMENTE sobre blob `0d24df...`, pendiente de confirmación de cotejo del Revisor 03 y la co-decisión de canon.** La aprobación literaria no permite fusionar ni publicar una edición definitiva.

## 2. C003: primera lectura integral de Arquitectura Editorial

**Dictamen:** **BORRADOR LITERARIAMENTE VIABLE; APROBABLE CON UNA ACLARACIÓN MENOR**, pendiente dictamen especializado de #707 y co-validación del canon VT2. No requiere reescritura estructural.

- **Cumple el progreso del arco:** salida real por los dos postes de las Cercas Bajas, no otra escena de trámites en Valdren; Lera ya enfrenta incertidumbre y una pequeña herida que materializa el riesgo.
- **Geografía confirmada** con `vintage-telnet-2/content/regions/edran.json`: `valdren_huertos --este--> edran_salida_huertos --este--> edran_acequia --norte--> edran_surcos`. Cruza la losa ancha de la acequia y respeta el sendero sin sembrar entre surcos; contempla la zanja del este sin teletransporte.
- **Espinajo de rastrojo confirmado** con `content/world.json > creatures.espinajo_rastrojo` y `edran_surcos.signals`: compacto, eriza espinas, vuelve a su borde, **no persigue** a Lera ni se presenta como combate forzoso. La sombra junto a las cercas y el chapoteo de la acequia no se atribuyen arbitrariamente al Saltalodo.
- **Continuidad de personajes:** Sabel conserva tablilla de C002; Mara completa la primera revisión de agua sin declarar reparación permanente; Dalia no ha leído la carta; Lera carga su carta terminada, la taza y poco equipaje.
- **Final con pregunta propia:** la herramienta al lado de la losa vertical de la zanja está expresamente sustentada por `rooms.edran_zanja_antigua.day`; los dos golpes son un añadido literario local aún no atribuido a personaje/causa.
- **H01 — pequeña aclaración de inventario:** C003 dice «la limpió con un poco de agua de su recipiente» al tratar la raspadura, pero C001/C002 no establecen de forma explícita **qué recipiente con agua llevó**. En C003, introducir de manera natural en la marcha **la cantimplora/odre que llenó antes de salir** o una frase que identifique el agua limpia transportada, sin añadir escena de empaquetar otro inventario ni tomar agua de cauce desconocido. Se admite que «otras cosas» de C001 incluyeran un contenedor; fijar una referencia para futuras escenas. No es defecto bloqueante para planear C004.
- **R01 — ritmo futuro:** C001 y C002 enfatizan escucha/apoyo; C003 descubre observación cautelosa. En C004 **subir tensión y dar consecuencias nuevas**, no una tercera moraleja de «preguntar antes de actuar» ni un segundo Espinajo con idéntica postura.
- **Canon:** no convertir sonidos de madera/huellas ni herramientas de la zanja en secreto de ruina, acceso oculto, quest o evento persistente. Arquitectura VT2 debe dar co-decisión antes de fusionar/publicar.

## 3. AUTORIZACIÓN OPERATIVA — **un borrador de C004**

**Escritor 01: AUTORIZADO** a redactar `Capítulo 4 — El lenguaje de las huellas` (título de trabajo), en la **misma rama y PR #705**, después de haber entregado C003 (WIP=1). No C005 hasta próximo cierre. Puede atender microajuste H01 en C003 sin bloquear la escritura.

**Continuidad espacial verificada:**
- C003 concluye en `edran_surcos`, con Lera avanzando al este hacia `edran_zanja_antigua`.
- `edran_surcos --este--> edran_zanja_antigua` (zanja seca: losa vertical y herramienta apoyada; de día alguien trabaja más arriba).
- `edran_zanja_antigua --norte--> edran_era` (era: granos, círculo de suelo duro, polvo, poste viejo, tránsito humano plausible).
- Opcionalmente `edran_era --norte--> edran_terraplen`, ascenso estrecho con rodadas y paso compartido con carros. **No llegar aún forzosamente a Vaisgard ni saltar pueblos.**
- No recorrer `edran_zanja_antigua --este--> edran_canal_entrada`: es un ramal diferente cuya función/secretos requieren autorización independiente.

**Arranque narrativo concreto:** resolver de manera humilde y creíble **qué provocó los dos golpes y quién dejó la herramienta** o descubrir que Lera interpretó mal la pista. No abrir una segunda trama de un gran misterio imposible de pagar ni presentar a una persona original como NPC oficial del juego. Una trabajadora o un porteador **anónimo**, con identidad y palabras sin consecuencias de misiones, puede explicar su tarea si es compatible con el estado `day` del lugar.

**Nueva tensión (distinta de C003):** un rastro observado mal puede llevarla a estorbar trabajo ajeno, tomar un paso inconveniente o llegar al terraplén sin ver un carro que desciende. Resolver mediante **acción, pérdida/tiempo/renuncia o un trato concreto**, no discurso general sobre prudencia. Se permite mostrar incertidumbre y señales de fauna existente sin forzar otro encuentro con Espinajo. Si se menciona un salteador por JSON, no inventar facción, régimen o historia previa.

**Cierre esperado:** progreso real desde zanja hacia la era o subida, con una consecuencia nueva para la siguiente etapa del camino y un personaje/indicio que enganche sin revelar trama reservada. Longitud orientativa 2,000–2,700 palabras.

**Entregables:** `capitulos/004-el-lenguaje-de-las-huellas.md` y `capitulos/004-continuidad-y-revision.md`. No cambios a `vintage-telnet-2/` ni publicación por su cuenta.

## 4. Circuito operativo y edición familiar

- **Revisor 03 / #707:** emitir **adenda breve de confirmación de M01/M02 en el nuevo blob C002**, luego dictamen de C003 real y, cuando aparezca, C004. No reabrir C001. Cotejar H01 en C003.
- **Historiador 02 / #706:** itinerario existente basta. Cotejo específico del prólogo VT1→VT2 continúa pendiente.
- **Arquitecto VT2 + Editorial / #705:** pendiente ratificar que Lera/Mara/Sabel/Dalia y escenas de turnos/tabla/golpes son ficción exclusiva del libro, compatibles con la fuente, y que el prólogo no revela cronología/secretos del juego. Contradicción sin resolver = no fusionar.
- **Arte 04 / #708:** maqueta EPUB 3 **provisional** con `Prólogo → C001 → C002 corregido → C003`, TOC ajustable y sin arte sin aprobar. No vender ni presentar como novela acabada.
- **Entrega a los hijos viernes 16/10:** declarar siempre qué capítulos y qué revisiones integran la edición, sin prometer 15 capítulos completos.

**Sin nuevos agentes, procesos automáticos ni cambios de videojuego.**
