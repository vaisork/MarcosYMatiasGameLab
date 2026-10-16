# Revisión de Arquitectura Editorial — Capítulo 001

**Proyecto:** *Crónicas de Vaisgard*, Libro I: *El primer camino*  
**PR manuscrito:** [#705](https://github.com/vaisork/MatiasGameLab/pull/705)  
**Base literaria revisada:** `capitulos/001-una-decision-al-amanecer.md`, blob `aa0c984b06a8c613a05ec15282ea443ac67fb3e2`  
**Registro de continuidad:** `capitulos/001-continuidad-y-revision.md`, blob `8c6cbedbb0be2e06d5f1f84d7ce3a0725c653b35`  
**Historiador:** [PR #706](https://github.com/vaisork/MatiasGameLab/pull/706), Expedientes 00–01.  
**Fuente canónica cotejada:** `vintage-telnet-2/content/regions/edran.json`, blob `dbdaead65f026a57925857f36388b28b94054498`.  
**Estado:** **APROBABLE LITERARIAMENTE CON AJUSTES; CANON Y EDICIÓN FINAL PENDIENTES. NO FUSIONAR NI PUBLICAR.**

## A. Valoración literaria — Arquitectura Editorial

**Fortalezas observadas**
1. Apertura eficaz: la carta doblada y su peso emocional abren una pregunta sin explicar el universo.
2. Lera tiene motivo personal identificable: intentar reparar con Dalia una frase cruel. Ir hasta Vaisgard para decirlo en persona responde a la objeción de que simplemente envíe la carta.
3. Mara posee voz propia: humor, límites materiales y afecto sin conceder todas las necesidades de Lera. El desacuerdo por los turnos hace visible un coste de la decisión.
4. La avería breve de la canaleta dramatiza el defecto central de Lera (pretender resolver sola todo) y el valor de aceptar ayuda. El pueblo mantiene vida propia: actividad de huertos, vecinos, el banco y la fragua.
5. La narración se sostiene sin estadísticas, exposición enciclopédica, profecía, criatura obligatoria ni revelación reservada. La voz en tercera persona cercana se mantiene consistente.
6. El capítulo termina **dentro de Valdren**, de acuerdo con el permiso de borrador, y la carta no se ha enviado ni completado: hay continuidad causal.

**Ajustes concretos que debe considerar el Editor Integral 03 y devolver al Escritor 01**
- **M01 — coherencia de la carta:** Lera anuncia «Voy a escribirla de nuevo», pero al final **anota un par de líneas en un borde limpio de la misma hoja doblada**. Elegir una acción congruente: corregir la carta existente o escribir efectivamente una versión nueva, y mantener la lógica material de papel/carboncillo.
- **M02 — diferencia C001/C002:** el Capítulo 001 **ya incluye preparar, cargar, vaciar y aligerar la bolsa**. No repetir en Capítulo 002 una segunda secuencia casi idéntica de elegir equipaje. Replantear su función dramática para que la negociación de turnos, una promesa verificable o la preparación para una salida concreta hagan avanzar el relato, no una recapitulación.
- **L01 — densidad de cierre:** revisar si el tramo de regreso a plaza después del arreglo y de la conversación repite demasiado los mismos aprendizajes. Ajustes de ritmo puntuales; **no** forzar recortes arbitrarios ni eliminar el descanso cotidiano que da identidad al mundo.
- **L02 — navegación interna:** el enlace del registro `001-continuidad-y-revision.md` a `../../capitulos/001-una-decision-al-amanecer.md` parece incorrecto desde la carpeta `capitulos/`. Usar enlace relativo `001-una-decision-al-amanecer.md` si se confirma en la rama. Es ajuste documental, no prosa.
- La extensión declarada de **2,519 palabras** es aceptable para el piloto; no recortar solo por exceder ligeramente una cifra orientativa.

## B. Contraste con hechos existentes de Valdren

**Compatible con fuentes confirmadas**
- Plaza de Valdren: casas bajas de piedra y madera, banco que rodea una piedra vieja, sonido de martillo de la fragua, gallo al amanecer.
- Plaza → corredor de huertos: `rooms.valdren_plaza.exits.este = valdren_huertos`.
- Huertos: canaleta de madera bajo árbol viejo, tierra húmeda, cercas, entradas a cocinas y trabajo doméstico; `rooms.valdren_huertos.description`.
- Tras el trabajo matinal, se puede observar al niño y su abuela examinando una semilla, vinculados a la capa diurna de `valdren_plaza`.
- No se adjudica autoría a piedras antiguas, ni se nombran NPC canónicos con historia nueva.

**A verificar conjuntamente con Arquitecto de VT2**
- **C01 — detalle físico puntual y de vida cotidiana:** tabla móvil, cuña, avería y reparación temporal en la canaleta de los huertos, con turnos particulares de agua entre Lera/Mara. El juego confirma la **canaleta y el regadío**, pero estos acontecimientos específicos **son ficción exclusiva del libro**, no estado persistente ni hecho ocurrido en una partida. Arquitectura VT2 debe registrar en #705 si puede convivir con el estado actual y si requiere alguna aclaración. No modificar JSON del juego por este pasaje.
- **C02 — personajes propios:** Lera, Mara y Dalia pertenecen únicamente al libro; presencia y trayectorias particulares no equivalen a NPC nuevos del juego. Valorar que sus intervenciones no alteran servicios ni horarios canónicos.
- **C03 — atlas para C002–C004:** el Historiador señala `edran_acequia.day` con **Saltalodo** aunque `world.json` ubica esa criatura en Lethra. **Excluir Saltalodo del manuscrito** hasta que Arquitectura VT2 + Editorial registren decisión en [#706](https://github.com/vaisork/MatiasGameLab/pull/706). No afecta C001, ubicado en la plaza y huertos.

**Distinción indispensable:** un elemento plausible de la novela no se convierte automáticamente en canon del juego; los dos arquitectos dejan constancia de propuesta → evidencia → tensión → decisión → alcance en la PR.

## C. Estado y siguientes consumidores

**Dictamen del Arquitecto Editorial:** **C001 literariamente viable y con buenas bases, condicionado a corrección de M01–M02 y dictamen del Editor Integral 03.** No se autoriza todavía el Capítulo 2; el Escritor no debe reescribir sin esperar observaciones integradas del Revisor, salvo reparar enlace documental menor.

**Agente 03 — nueva versión de la revisión:** el dictamen inicial de [#707](https://github.com/vaisork/MatiasGameLab/pull/707) fue escrito **antes** de que existiera el Capítulo 1 y es histórico, no bloqueo operativo vigente. En **la misma PR #707** debe agregar una revisión **sobre el texto real** (`DICTAMEN_01_CAPITULO_001.md`), considerando esta evaluación y el atlas actualizado de PR #706. Calificar gravidades, sugerir cambios mínimos y contrastar estados narrativos por párrafo o escena. No alterar directamente el capítulo.

**Arquitecto de VT2:** revisar en #705 compatibilidad de riego y figuras originales, y en #706 el Saltalodo de acequia. Contradicción sin resolver = no fusionar PR que la incorpore.

**Agente 04:** [#708](https://github.com/vaisork/MatiasGameLab/pull/708) fija **EPUB 3 reajustable** como edición principal, Drive como almacenamiento/distribución. No maquetar C001 definitivo ni publicar sin aprobación de manuscrito y arte. La existencia de WebP no constituye aprobación de recurso específico.

**Secuencia de trabajo:** Agente 03 emite dictamen actualizado → Arquitecto VT2 clasifica tensiones → Escritor 01 realiza ajustes en #705 → Arquitectura Editorial verifica texto revisado y compatibilidad → arte/maquetación piloto → aprobación de C002 en ficha específica. Mantener `WIP=1`, sin automatizaciones.

**Responsable Segundo Cerebro:** exclusivamente Arquitecto Editorial, con anotaciones de conocimiento duradero sólo después de cerrar decisiones. No duplicar capítulos completos en `vaisork/Conocimiento`.
