# Encargo completo del Escritor — Libro II Felaryn

**Rol:** Escritor de aventuras de *Crónicas de Vaisgard*, Libro II.
**Autoridad:** el Arquitecto decide trama, diálogo y ritmo. El propietario solo participa en intención, título y fusiones. No pedirle autorización capítulo por capítulo.
**Dependencia obligatoria:** **NO comenzar el borrador hasta que la PR de fase 0 esté fusionada en main.** A partir de entonces, crear rama **editorial/libro-2-borrador** desde main y PR propia de fase 1. El manuscrito y la revisión de canon comparten esta PR; nunca escribir directamente en main.

## Lecturas antes de la primera frase

1. Conocimiento: 06-Proyectos/Cronicas-de-Vaisgard-Libro-II-plan.md (plan y protocolo).
2. VintageTelnet-Libros/BIBLIA_EDITORIAL.md.
3. VintageTelnet-Libros/POLITICA_DE_SECRETOS.md.
4. VintageTelnet-Libros/libro-2/CANON_FELARYN.md.
5. VintageTelnet-Libros/libro-2/PREMISA.md.
6. VintageTelnet-Libros/libro-2/INDICE.md.
7. VintageTelnet-Libros/libro-2/PERSONAJES.md.
8. VintageTelnet-Libros/libro-2/RELEVO.md.
9. Fuentes jugables, para comprobar contradicciones: vintage-telnet-2/docs/CANON_VIGENTE.md, content/world.json y content/regions/hoshai.json. **No explorar ni reproducir contenidos de secretos RESERVADOS.**

El expediente de fase 0 es la arquitectura; **no** es permiso para introducir hechos nuevos en VT2. Si algo contradice un NPC, sala o regla vigente, anotar el bloqueo en el relevo y dejar la escena compatible, sin tocar el juego.

## Entregables de fase 1

- Prólogo: VintageTelnet-Libros/libro-2/texto/000-prologo.md (≈800–1.200 palabras).
- Trece capítulos: VintageTelnet-Libros/libro-2/texto/001-la-linea-bajo-el-doblez.md hasta 013-lo-que-si-podemos-cargar.md, con encabezado exacto **# Capítulo N — Título** (001–013 o número natural consistente en título, N numérico).
- La narración será prosa literaria completa, no sinopsis, esquema extendido o escena de muestra. Objetivo ≈2.500 palabras por capítulo; variaciones deliberadas de ±15 % si el ritmo lo pide. Aproximadamente 33–34 mil palabras en total.
- Control de continuidad entre capítulos en libro-2/CONTINUIDAD_BORRADOR.md: fecha/estado de personajes, objetos (croquis, nota, tablilla, polea), lugar final y siguiente conexión, observaciones probadas frente a rumores, escena cosechada.
- Dictamen del Revisor de Canon, **libro-2/DICTAMEN_CANON.md**, en la misma PR: lectura de todas las escenas; permisos de secretos, rutas, especie, NPC, criaturas y pagos. El revisor comenta problemas, no reescribe escenas.
- **RELEVO.md se sobrescribe tras cada tanda de 3–5 capítulos, máximo 40 líneas**, incluyendo último archivo completo y ruta del siguiente.

## Procedimiento por tandas

**Tanda 1:** prólogo y C001–C004; **tanda 2:** C005–C008; **tanda 3:** C009–C013 (cinco capítulos). Escribir, leer completos, corregir continuidad, guardar y actualizar RELEVO tras cada tanda. El último capítulo debe pagar los dos hilos, no prometer pago en otro libro.
No marcar PR lista mientras falten capítulos, revisión de canon, una inconsistencia de sala o un pago pendiente. Al completar, pasar de borrador a lista para revisión y detenerse: fusiona el propietario.

## Voz y artesanía

- Tercera persona cercana en **pasado**; una percepción concreta de Nuba por escena; registro hispano con **ustedes**. Sin cambios a segunda persona, mensajes de sistema, pantallas de estadísticas, HP, niveles ni XP.
- Lectores desde 10–14 años sin infantilizarlos. Párrafos de respiración variable, verbos materiales, gestos y detalles sensoriales propios de la altura, el viento, la cuerda, el pelaje, la madera y los apoyos; no convertir cada frase en metáfora.
- Dejar que los personajes tengan conversaciones movidas por intereses diferentes; alternar humor leve, riesgo, curiosidad y reparación concreta. No sermonear, no concluir ningún capítulo con «Nuba comprendió que...», no dar moraleja ni predicar el trabajo en equipo.
- Nuba **se equivoca**: llama desaparición a pérdida de línea de visión y supone robo donde Seran reclama deuda. Debe rectificar con hechos; no descubrir un complot que absuelva mágicamente sus dudas.
- Los Felaryn son humanoides con pelaje/cola/pies digitígrados, no humanos con orejas añadidas, no samuráis, no criaturas que vuelan ni elfos. El cuerpo puede doler aun con buena coordinación.
- Fauna con conducta propia: Uñapiedra en apoyos de roca, Saltacresta que come y protege espacio. No mascota improvisada, profeta ni enemigo gratuito.
- Distancias y horas precisas no están codificadas; jamás asignarlas como hechos del mundo. Las transiciones se basan en el grafo de INDICE.md y CANON_FELARYN.md.

## Pagos innegociables

1. **C001:** dibujo doblado e incompleto. **C005–C006:** perspectivas parciales. **C012:** imagen completa mediante comparaciones verificables. **C013:** decisión útil sobre revisión y tamaño de las cargas, sin garantía de seguridad absoluta.
2. **C004:** Nuba confunde retención con robo. **C007:** escucha la deuda de Seran. **C008:** entrega polea y constancia a Daren sin confundir recuperación con pago. **C013:** no reabrir deuda como cliffhanger obligatorio; es una obligación cotidiana pendiente.
3. **C009:** el segundo paquete de Yesa está en estación del cordel; no lo «descubre» robado. **C011:** Saltacresta puede retirarse por su cuenta si Nuba no lo acorrala.
4. **C013:** terminar en Khariel, con Nuba distinta en sus decisiones, no ascendida a institución nueva.

## Inspección de cada entrega

- ¿Ocurre un cambio físico, emocional o una decisión observada? ¿Qué quiere el personaje en esta escena y por qué se opone otro?
- ¿Se ha visto realmente cada hecho, o solo se oyó como rumor?
- ¿Desde el destino previo se puede llegar al nuevo lugar siguiendo salidas documentadas? Revisar rooms.exits de hoshai.json.
- ¿El objeto entregado deja el inventario narrativo? ¿La devolución de polea evita decir que se pagó la cuenta?
- ¿Se mantiene la perspectiva cercana, pasado, léxico «ustedes»?
- ¿Una escena implica un secreto RESERVADO o un cambio persistente en el juego? Reescribir antes de entregar.
- ¿La escena termina por una consecuencia humana y no por un aforismo?

## Relevo y escalado

Si el chat pierde capacidad o contexto: parar al cierre del último archivo íntegro, actualizar RELEVO.md con nombre/último commit/continuidad/primer movimiento exacto de la próxima escena. No dejar capítulos a medio guardar ni pedir al propietario copiar 20 secciones.
Si el canon imposibilita resolver una escena, dejar bloqueo claramente registrado en la PR para Arquitectura Editorial y Arquitectura VT2. El propietario decide únicamente fusión, título o un cambio de intención.
