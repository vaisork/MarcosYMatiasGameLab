# Dictamen 10 — Capítulo 009 «El aviso y la respuesta»

**Proyecto:** *Crónicas de Vaisgard* · Libro I «El primer camino», MatiasGameLab.  
**Agente revisor:** `revisor-canon-vaisgard-01` (Editor Integral y Revisor de Canon).  
**PR autoría:** [#705](https://github.com/vaisork/MatiasGameLab/pull/705), rama `editorial/cronicas-vaisgard-agente-01-voz`.  
**PR revisión:** [#707](https://github.com/vaisork/MatiasGameLab/pull/707), rama `editorial/revisor-canon-vaisgard-01-dictamen-705`.  
**Manuscrito C009 leído íntegro:** `VintageTelnet-Libros/capitulos/009-el-aviso-y-la-respuesta.md`, blob **`8116313f9394e50089d68bc09351b8f4892400eb`**, ~2.535 palabras.  
**Continuidad del Escritor:** `capitulos/009-continuidad-y-revision.md`, blob **`3ad03d98db3cedfcf0ec06b2aac62c14eefd1555`**.  
**Ficha de autorización formal:** `plan/DECISION_CIERRE_C008_Y_AUTORIZACION_C009_2026-10-15.md`, dictada por Arquitectura Editorial en #705.  
**Predecesor C008:** texto **`e3ee67a0399b3737a4b1992abdd1089b9d46bbee`** tras microediciones del Agente 03, y matriz `2aeb7c9d8d3b54227db8044eb8fa2a543c18dfa4`; aprobado literariamente por Arquitectura Editorial.  
**Fuentes VT2 consultadas directamente:** `vintage-telnet-2/content/regions/veyra.json`, **blob `500a04d7dd3c2a72c750a69381664f2eed5500bf`** de main, `rooms.veyra_plaza_rutas`, `rooms.veyra_patio_senales`, `rooms.veyra_archivo_cargas`, `npcs.veyra_arel`. Fuente de canon del juego: `main` remoto, sin modificarlo.

## 1. Resultado

**CAPÍTULO 009 APROBADO LITERARIAMENTE POR EL EDITOR 03 SIN CORRECCIONES MENORES PENDIENTES.**

El capítulo tiene progresión nítida y diferente de los anteriores: del recorte que Nara puede llevar sin certeza (C008) surge una dificultad nueva, **cómo responderle a Lera si no se sabe dónde estará**. La joven no obtiene otra pista milagrosa sobre Dalia, sino que **elige un lugar y dos atardeceres concretos**, restringe lo que permite revelar a terceros y asume el costo de dos esperas con comida, abrigo y sellos limitados. El giro sobre la **posibilidad de que Dalia no quiera leer la carta** agrega tensión emocional propia sin resolverla artificialmente.

**Compatibilidad técnica/canónica preliminar:** no se detectan contradicciones duras con el mapa público, identidad y rol de Arel, secretos ni mecánicas de VT2. Esto es **aprobación literaria de Editor 03, no co-decisión de canon ni visto bueno de publicación/fusión**: sigue exigido el acuerdo expreso **Arquitectura Editorial + Arquitecto VT2** para que los diálogos privados de Arel y personajes/hechos exclusivos de novela pasen a la edición definitiva. **C010 no autorizado** al corte de revisión; corresponde al Arquitecto Editorial emitir una ficha separada.

**Microediciones:** **NINGUNA**. El propietario autorizó al Editor 03 hacer cambios menores directamente, pero la lectura de C009 no encontró una corrección puntual de suficiente utilidad. **Manuscrito y matriz de C009 conservan los blobs indicados arriba; no hay cambios propios en #705.**

## 2. Evaluación literaria escena por escena

1. **Entrada y ambiente del alero.** El capítulo retoma C008 exactamente al final de su avance hacia el este: Lera **cruza** desde `veyra_plaza_rutas` a `veyra_patio_senales`, no presupone que ya conocía el interior. Tablillas organizadas por ruta, madera nueva y gastada, bancos y dos mensajeras que trabajan con letra poco clara son verificables en `veyra_patio_senales.description/day`. La separación entre la multitud de la plaza y el trabajo bajo el alero está bien narrada, no es un listado del mapa.
2. **Arel en su rol público.** La Vesperi está asignada como `veyra_arel`, `role: mensajera de ruta`, `home_room: veyra_patio_senales`. Sus fundas separadas para papeles urgentes y recados comunes, así como su hábito de pedir **procedencia y contexto completos**, coinciden con `npcs.veyra_arel.description/topics.mensajes/topics.espera`. Un diálogo original sobre quién envía el recado y desde dónde es **licencia literaria privada**, no línea oficial o evento de misión.
3. **Carta sin dirección / pregunta responsable.** Lera confunde su propio destino (Vaisgard) con el destino que necesitaría el mensaje (Dalia, ubicación desconocida). Arel corrige la premisa, **no registra ni acepta la carta**, no afirma que Dalia escribió otra carta y tampoco conoce su paradero. El conocimiento de Nara sobre una **pregunta de Dalia** sigue siendo una fuente parcial, no evidencia de carta escrita, entregada o presente en el sistema.
4. **Nueva decisión en lugar de otra negativa.** En vez de preguntar de nuevo a desconocidos por Dalia, Lera enfrenta el problema práctico de **hacerse encontrable a sí misma**. Propone esperar junto a una piedra concreta del sector sur de la Plaza, próxima al Mercado, durante **dos atardeceres**. El riesgo no es decorativo: la decisión ocupa tiempo que no dedicará a buscar por otros caminos, exige recursos de alimentación/abrigo no asegurados y no garantiza resultados. El lector ve que Lera aprende a comprometerse con algo específico y revisable.
5. **Privacidad y límites del acuerdo.** Arel solo acepta como gesto personal repetir, si alguien **se lo pregunta directamente**, si sigue allí y si lo recuerda, **nombre de Lera, procedencia y dónde/cuándo espera**; no es un tablón, búsqueda universal, registro automático, entrega ni garantía. Lera **no autoriza divulgar el nombre ni la historia de Dalia**. Queda clara la incertidumbre sobre identidad de eventuales interlocutores.
6. **Derecho de Dalia a negarse.** El momento en que Lera pregunta qué hacer si Dalia no quiere la carta coloca por primera vez de manera explícita la voluntad de la destinataria en el centro. Arel no adjudica pensamientos o destino a Dalia ni resuelve el dilema; responde con una observación interpersonal plausible. Este conflicto es **independiente** de la mecánica de mensajes del juego y refuerza el arco de una amistad rota.
7. **El paso de los días como costo futuro.** Lera cuenta los sellos que le quedan, recuerda que no tiene hospedaje asegurado, necesita secar la bota y comer. **No se consume mágicamente comida/sellos ni se fija tarifa/hotel**; queda como obligación para la continuidad del siguiente capítulo. El desenlace ocurre cuando sale **al oeste** hacia `veyra_plaza_rutas` y se acerca a la piedra que eligió: allí termina C009.
8. **Voz y audiencia.** Tercera persona cerca de Lera, diálogos con carácter (Arel precisa y moderadamente irónica, niña que cuenta tablillas), ritmo alternado entre actividad urbana, recogimiento y elección. Adecuado para jóvenes y adultos. No se transforma en exposición de reglas del juego ni en enciclopedia.

## 3. Correspondencia exacta con `content/regions/veyra.json`

| Hecho narrado | Fuente | Juicio |
|---|---|---|
| Plaza de las Cinco Rutas → patio del alero oriental (este) | `rooms.veyra_plaza_rutas.exits.este = veyra_patio_senales` | **CONFIRMADO** |
| Patio de Mensajes → Plaza (oeste) | `rooms.veyra_patio_senales.exits.oeste = veyra_plaza_rutas` | **CONFIRMADO** |
| Bancos, tablillas por origen, armazón y contraste entre madera gastada/nueva | `rooms.veyra_patio_senales.description` | **CONFIRMADO** |
| Dos mensajeras que descifran letra y una amplía el nombre | `rooms.veyra_patio_senales.day` | **CONFIRMADO** como escenario público; diálogos privados **novela** |
| Arel mensajera Vesperi, fundas diferenciadas y escucha procedencias antes de repetir | `npcs.veyra_arel.species/role/home_room/description/topics.mensajes/topics.espera` | **CONFIRMADO** en función y carácter público. Nuevas frases **solo novela** |
| Piedra grande de Plaza como banco infantil, muchas rutas y movimiento | `rooms.veyra_plaza_rutas.description/day` | **CONFIRMADO**; lugar de espera elegido por Lera, **solo novela** |
| Arel acepta repetir verbalmente información voluntaria de Lera si un tercero le pregunta | No es `topics` ni `actions` del runtime. Diálogo espontáneo condicionado | **PROPUESTA NARRATIVA PRIVADA** que requiere co-decisión Editorial + VT2 para edición final, sin convertirla en servicio o estado jugable |
| Archivo de Cargas y archivera Nera | `rooms.veyra_patio_senales.exits.este = veyra_archivo_cargas`, `npcs.veyra_nera` | **NO VISITADOS** ni usados como registro de habitantes |
| Secretos de hueco/piedrecitas, temas `talla`, `decirlo una sola vez`, memorias de Arel, quests `veyra_atribuir_mensaje`/recados | `npcs.veyra_arel.topics`, `states/memory` y `veyra_patio_senales.actions` | **NO ACTIVADOS NI REVELADOS** |

No se introducen herencias de VT1, leyendas fundacionales confirmadas, Saltalodo de Edran, destinatario comprobado de hipotética carta de Dalia, inscripción oficial de búsqueda ni promesas de envío.

## 4. Estado de continuidad después del C009

- **Lera:** en `veyra_plaza_rutas`, junto a la piedra elegida al sur del centro, cerca de entrada del Mercado. Se comprometió a presentarse **mañana y al día siguiente, al caer la tarde**; no ha cumplido aún el primero de esos dos encuentros futuros. No tiene cama ni alimentación garantizadas y conserva sellos no cuantificados. La bota y media están todavía húmedas, mejorando, la palma presenta pequeña raspadura y el hombro sigue sensible.
- **Carta principal:** seca y cerrada bajo chaqueta; ya revisada con carboncillo en Valdren, **todavía no entregada ni cedida a Arel**. Carboncillo guardado; taza de asa torcida en bolsillo de bolsa; cantimplora con **algo de agua**. No se genera ni consume otro objeto.
- **Nara:** conserva recorte firmado C008 con «Lera, de Valdren. Busco hablar con Dalia. Puedo volver a la Plaza de las Cinco Rutas». **No se acredita transmisión, entrega, acuse ni fecha**. La precisión sobre piedra y dos tardes **no está escrita en el recorte de Nara**, sino que Arel puede repetirla solamente si se lo preguntan conforme al acuerdo privado.
- **Iven:** solo recuerda una posible Dalia en los huertos de Valdren; no sabe su paradero ni valida que sea la misma de Lera.
- **Arel:** en el patio del alero oriental ejerciendo sus labores; no tiene la carta ni el recorte y **no adquiere una tarea/misión permanente de búsqueda**. El diálogo privado no cambia los flags del juego.
- **Dalia:** sigue fuera de escena; no sabemos si escribió o envió carta, si entró en Vaisgard, a quién habría querido escribir ni si desea retomar la amistad.

## 5. Observaciones de seguimiento, NO correcciones del manuscrito

1. **Tiempo debe repercutir:** la decisión de estar durante dos atardeceres es narrativamente buena **solo si después se observa su costo o su cumplimiento**, en vez de saltar directamente al éxito o abrir un arco de aventuras remotas como si la espera nunca hubiera existido. En la ficha de C010, Arquitectura Editorial deberá decidir dónde come/descansa Lera, cómo maneja la incertidumbre y en qué orden cuenta el día siguiente; no hace falta inventar un hospedaje canónico ni tarifas.
2. **No transformar acuerdo privado en servicio público permanente:** Arel **no es depositaria ni buscadora universal**. Si otro personaje menciona el acuerdo, debe haber una ruta de información plausible; no puede saberse automáticamente en toda la ciudad.
3. **No repetir sermones sobre rumor/fuente:** en C009 aparece una referencia breve a Aren/C005, pero la elección real aquí es la **localizabilidad y el consentimiento de Dalia**. Funciona; C010 debe mostrar otra consecuencia, no una cuarta exposición sobre distinguir rumores de hechos.
4. **Testimonios Iven/Nara siguen abiertos a co-validación:** este capítulo los respeta sin canonizarlos. La introducción de Nara e Iven y recuerdos privados de Dalia continúa como material exclusivo del libro hasta co-decisión de Arquitectura Editorial+VT2.

## 6. Handoff

**Arquitectura Editorial (#705):** dictaminar/cerrar literariamente C009 sobre manuscrito original intacto; si así lo decide, autorizar exclusivamente C010 mediante nueva ficha, priorizando **la primera jornada y el compromiso de los dos atardeceres**. No es necesario pasar el texto al Escritor para arreglos menores; **no surgieron correcciones**.

**Escritor 01 (#705):** no reabrir C009 por rutina. Esperar autorización propia para C010 (WIP=1); no inventar nueva fase, respuesta inmediata de Dalia o tercero afortunado fuera de ficha aprobada.

**Arquitectos Editorial+VT2 (#705/#706):** co-decisión expresa de alcance **solo novela** para intervención privada de Arel y otros personajes del libro, incluidos Iven/Nara y recuerdos de Dalia, así como revisión de prólogo/secretos/divergencia Saltalodo antes de **fusión/publicación definitiva**. Este informe no altera runtime ni canon del juego.

**Publicador #708:** mantener EPUB de prelectura como **BORRADOR** hasta decisión de lote por Editorial y cotejo de fuentes; no afirmar que publicación final o control de EPUBCheck esté realizado.

**Veredicto Agente 03: C009 APROBADO LITERARIAMENTE SIN CAMBIOS EDITORIALES DIRECTOS.**  
— *Editor Integral y Revisor de Canon.*
