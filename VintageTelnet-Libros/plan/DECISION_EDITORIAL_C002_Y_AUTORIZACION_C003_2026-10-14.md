# Decisión editorial — capítulo 002 entregado y autorización de C003

**Fecha de corte:** 14 de octubre de 2026 (México).  
**Libro:** *Crónicas de Vaisgard*, I: *El primer camino*.  
**PR:** [#705](https://github.com/vaisork/MatiasGameLab/pull/705).  
**Manuscrito revisado:** `capitulos/002-lo-que-se-queda.md`, blob `f352b015aeffb3d66cc4aa3e20d5aadcd006cf00` (~2,626 palabras).  
**Continuidad examinada:** `capitulos/002-continuidad-y-revision.md`, blob `a0c9dc8d6406dfdbf1a79451acea2d9b1eb2b922`; texto C001 ya aprobado literariamente.  
**Canon cotejado:** `vintage-telnet-2/content/regions/edran.json`, salas `valdren_plaza`, `valdren_pozo`, `valdren_huertos`, y salida `edran_salida_huertos`.  
**Dictamen de Arquitectura Editorial:** **APROBABLE LITERARIAMENTE / ACEPTADO COMO BORRADOR COMPLETO, con revisión formal del Editor 03 y co-decisión canónica VT2 pendientes. NO FUSIONAR NI MARCAR EDICIÓN DEFINITIVA.**

## 1. Valoración de C002

**Conservar:**
- Una voz consistente con C001: Lera no obtiene una absolución fácil, y Mara puede seguir molesta mientras la apoya.
- **Sabel** es una tercera fuerza con criterio propio; el humor («una promesa sin fecha», «no me escribas como si fuera un carro») evita sermonear.
- El costo de abandonar Valdren queda concreto: los turnos de agua desplazan tareas de Sabel y personas de la cocina; se registran **acuerdos consentidos, condicionales**, nunca una orden comunitaria.
- La carta se **termina**, la taza permanece en su lugar y el viaje se pospone hasta comprobar la apertura de agua a la mañana siguiente.
- El Pozo de las Dos Cuerdas y la vuelta al corredor se ajustan a `plaza.sur → pozo` y `plaza.este → huertos`; el tiempo pasa mañana → tarde/atardecer sin traslado imposible.
- **No** aparece fauna incorrecta, secretos revelados, poderes no establecidos, NPC canónicos usados de forma nueva, inventario repetido ni partida anticipada.

**Observaciones para dictamen 03, de baja gravedad y no bloqueantes para que se escriba C003:**
1. La negociación del pozo y la negociación del huerto repiten a veces «no basta prometer» / «hoy no resuelve mañana». Puede apretarse uno o dos intercambios si el Editor detecta ritmo lento; **no** eliminar la demostración de reparación o las consecuencias para la cocina.
2. Tras **dos capítulos completos en Valdren** (~5,150 palabras), el lector de 10–14 años necesita **desplazamiento, novedad visual y tensión exterior desde el arranque de C003**. No extender la despedida a un tercer capítulo de trámites.
3. El relevo de Sabel sigue **condicionado**: si la tabla empeora y falta ayuda, se consulta de nuevo. No redactar en C003 que el problema de la canaleta quedó «resuelto para siempre».
4. Lera conserva la carta sin respuesta de Dalia, ropa/equipaje reducido, taza en bolsillo exterior, carboncillo envuelto y tablilla privada. No inventar una respuesta o servicio de correo en Valdren.

**Canon compartido pendiente, sin inventar hechos oficiales:**
- Lera, Mara, Sabel, Dalia y vecinas son **originales de la novela**, no NPC incorporados al runtime.
- Fuga de tabla, cuña provisional, turnos particulares y recogida de hojas son **hechos privados propuestos**. No implican sistema oficial de riego ni estados persistentes del juego; co-revisión Editorial + Arquitecto VT2 debe confirmarlo en #705 antes del merge.
- El pozo y los huertos tienen funciones públicas documentadas; no convertir a Sabel en autoridad, NPC del pozo o dueña de la canaleta.
- Una tensión del historiador sobre Saltalodo en la `edran_acequia` sigue sin resolver: **excluir Saltalodo en C003**.

## 2. DECISIÓN: autorizar al Escritor 01 a redactar **un único borrador C003**

**AUTORIZADO AHORA**, dentro de esta misma rama/PR #705, porque la producción de C002 terminó y pasó a revisión. WIP=1 del Escritor: solo C003, no C004. **Aprobación literaria de C002 no equivale a fusión/publicación definitiva**. El Editor 03 puede solicitar correcciones puntuales de C002 en paralelo sin pausar la escritura del siguiente borrador, siempre que el Escritor no pierda continuidad.

**Capítulo 3:** «Más allá de las cercas» (título provisional).  
**Objetivo de aventura:** el lector, por primera vez, **sale de Valdren** con Lera y descubre que el mundo es más extenso e imprevisible que los turnos de un huerto.

**Inicio recomendado (máximo 200–350 palabras):** amanecer siguiente. Una comprobación **breve y concreta** del primer turno de Mara/Sabel; despedida contenida, sin otro diálogo largo de responsabilidades. Lera **cruza los dos postes de la Salida de las Cercas Bajas**. No abrir con otra bolsa, reparación o carta.

**Geografía verificada y orden de tránsito (IDs exactos en `content/regions/edran.json`):**
- `valdren_huertos --este--> edran_salida_huertos`;
- `edran_salida_huertos --este--> edran_acequia`;
- `edran_acequia --norte--> edran_surcos`.
- Desde `edran_surcos` se puede proponer ruta futura al este hacia `edran_zanja_antigua`, pero C003 no tiene obligación de llegar tan lejos.
- No inventar atajos, distancias o número de horas de viaje por cada sala.

**Imágenes narrativas indispensables:** postes de salida y sonidos del pueblo que se desvanecen; losa de cruce y hojas reunidas en boca de una zanja junto a la acequia; surcos de dos épocas (tierra recién removida y tallos antiguos); un sendero sin sembrar evita pisar una parcela. Nada de mapa-GPS en prosa.

**Conflicto real:** una decisión en terreno desconocido con un costo inmediato observable, por ejemplo cómo atravesar sin mojar la carta ni pisar cultivos, distinguir viento de movimiento de animal o a quién puede pedir indicaciones sin confiar ciegamente. La acción debe **ser distinta de organizar ayuda en Valdren**. Protagonismo de la observación y de la incertidumbre antes de la fuerza, pero sin narración didáctica de mecánicas.

**Fauna permitida con condiciones:** `edran_salida_huertos.wildlife_pool` admite indicios/evento de Espinajo, Mordelinde o Cornalomo según el estado; `edran_surcos.signals` tiene un **Espinajo** visible o rastro. **No forzar encuentro garantizado**, no inventar capacidades ni hacer que una señal de campo se convierta en un monstruo a voluntad. **NO Saltalodo** en acequia por tensión canónica documentada en #706. Si el capítulo usa bestiario, citar sala y manifestación exactas.

**Arco emocional:** fuera de casa, Lera descubre que los demás no van a poder escucharla ni arreglar una mala decisión por ella. Su nueva capacidad de pedir ayuda no equivale a disponer de ayuda en todas partes.

**Cierre esperado:** situación exterior concreta que cambie el plan o deje una pregunta legítima para C004: una huella ambigua, un objeto fuera de sitio o la conducta territorial de un Espinajo. Evitar acabar otra vez con «aún no ha partido» o una moraleja explícita.

**Extensión orientativa:** 2,000–2,700 palabras según acción y ritmo; prioridad aventura y lectura fluida para niños 10–14 y adultos.

**Entregables del Escritor:** `capitulos/003-mas-alla-de-las-cercas.md` + `capitulos/003-continuidad-y-revision.md` en la misma PR. No modificar juego, arte, archivos de otros agentes ni publicar EPUB por su cuenta.

## 3. Revisión, arte y edición familiar

- **Revisor 03 / #707:** dictaminar C002 **sobre texto real** antes de cierre formal; señalar correcciones mínimas. Revisar la última versión del prólogo cuando toque, evitando retrasar C003. Después se evaluará C003.
- **Historiador 02 / #706:** su ruta de Edran ya cubre C003; apoyar sólo la divergencia Saltalodo y preguntas concretas. No ampliar burocracia.
- **Arquitecto VT2:** registrar decisión conjunta para C001/C002 (habitantes originales, trabajo/agua) y prólogo (historia/especies) antes de fusión. La coexistencia propuesta **no canoniza estos sucesos en el juego**.
- **Director Arte/EPUB 04 / #708:** actualizar **prelectura provisional EPUB 3** a `Prólogo → C001 → C002` si se identifica como BORRADOR en lectores; nunca atribuir aprobación de canon ni imágenes no autorizadas. Preparar inserción posterior del C003. Formato principal EPUB 3, Drive para distribución autorizada, sin costos extras.
- **Entrega familiar viernes 16/10/2026:** solo afirmar capítulos realmente terminados y revisados. **No prometer novela de 15 capítulos ya completa**. Un primer tramo con desplazamiento y tensión real vale más que múltiples capítulos de preparación.

**No se crea tarea programada ni proceso en segundo plano.**
