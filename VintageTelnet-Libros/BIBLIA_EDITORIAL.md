# Biblia Editorial — Crónicas de Vaisgard

**Estado:** Biblia en revisión; **Capítulo 001 ya tiene autorización de borrador y fue entregado**, pero no está aprobado para fusión ni publicación. Consultar `plan/DECISION_ARRANQUE_EDITORIAL_2026-10-14.md` y PR #705.

## Promesa literaria
La colección contará aventuras autosuficientes en el universo de VT2, sin exigir que el lector conozca el juego. El mundo existe antes de los aventureros y seguirá viviendo después. Los protagonistas son habitantes reales de este universo, no personajes infantiles ni avatares de jugadores reales.

**Público:** inicialmente 10–14 años, agradable también para adultos. **Tono:** claro, cálido, fluido, visual, evocador, sincero y con cierta ligereza; sin prosa grandilocuente, moralejas, tutoriales ni volcado de lore. Los diálogos expresan deseos y experiencias, no enumeran hechos. Las criaturas tienen conducta y hábitat; los encuentros no son tablas de combate.

## Conjunto de libros (provisional)
I. **El primer camino:** preparación, decisiones, primeras rutas, descubrimiento de fauna y llegada a Vaisgard.
II. **Libro de los Felaryn (título por confirmar):** Khariel y la Sierra de Hoshai; una historia autosuficiente sobre observación, responsabilidad y cargas compartidas. Plan y permisos en `libro-2/CANON_FELARYN.md`, `PREMISA.md` e `INDICE.md`.
III. **Rastros y rumores (provisional):** investigación y memoria local; secretos sólo insinuados cuando está permitido.
IV. **Historias de Vaisgard (provisional):** voces, oficios, entradas, barrios y pasado inconcluso.
V o posterior. **Las cinco rutas:** Edran, Hoshai, Korven, Lethra y Nhal; posición definitiva pendiente, no es el Libro II.

## Diseño de experiencia
1. El protagonista quiere algo concreto (no «salvar el mundo»).
2. Un lugar o una persona resiste sus expectativas.
3. El protagonista observa, conversa, se equivoca y toma una decisión.
4. La decisión produce una consecuencia material o emocional.
5. El final abre una pregunta o un camino, sin cliffhanger artificial obligatorio.

En la escritura, alternar descubrimiento, peligro, descanso y convivencia. No usar estadísticas de HP, niveles, daño, recompensas o menús. Toda escena debe respetar el conocimiento limitado de quien la vive. No resolver la construcción de Vaisgard ni ningún secreto mayor.

## Punto de vista
**Aprobada para el borrador de C001**: **tercera persona cercana en pasado**, focalización estable por escena y lenguaje material concreto. Revisar la propuesta de voz del Escritor: `agentes/escritor-aventuras-vaisgard-01/PROPUESTA_VOZ_NARRATIVA.md`.

## Protagonistas y geografía
Personajes del libro originales, con oficio, deseo, defecto, límites físicos y memoria afectiva. Evitar esencialismo por especie. Los protagonistas de `plan/personajes.md` son **propuestas**, todavía no canon editorial cerrado.

Itinerarios sólo sobre conexiones realmente existentes de `content/world.json` y `content/regions`; no asignar tiempos/distancias físicos inexistentes. Distinguir rumores de hechos.

## Ilustración
Ilustraciones editoriales serán reutilización de los **mismos archivos aprobados** de `vintage-telnet-2/client/art/`: apertura de capítulo/lugar, criatura o escena si existe imagen pertinente. Registrar `source_path`, versión, vínculo con la escena y evidencia de aprobación, sin alterar originales. El **Agente 04** concentra dirección de arte, maquetación y publicación. El **EPUB 3 reajustable es la edición principal**, almacenada/distribuida vía Drive; Docs es opcional para revisión y PDF una derivación cuando se autorice.

## Puertas de aprobación
- [ ] Personajes y punto de vista aprobados.
- [ ] Arco de Libro I y orden geográfico revisados por Arquitectura VT2.
- [ ] Índice de 12–18 capítulos cerrado.
- [ ] Fichas 001–003 validadas.
- [ ] Condición de secretos y metodología de arte aprobadas.
- [x] Ficha 001 autorizada **solo para borrador**, por decisión del Arquitecto Editorial en PR #705.
- [ ] Capítulo 001 revisado y aprobado literariamente por Editor Integral 03 y Arquitectura Editorial.
- [ ] Compatibilidad de nuevos hechos materiales de riego cotejada con Arquitectura VT2 antes del merge.

**La Biblia y el arco no se consideran cerrados por estar versionados en la PR.**


## Libro II — protocolo de arranque (2026-10-16)
La fase 0 se prepara en la rama `editorial/libro-2-plan`; no fusionar automáticamente. El Libro II no expande canon reservado ni contenido jugable. Cuando esté lista la PR de plan y el propietario la fusione, comenzará el borrador por tandas en otra PR, con relevo por hito. El título definitivo corresponde al propietario; narración y escenas, al Arquitecto/Escritor. El cierre EPUB corresponde a Claude, Codex y Antigravity conforme al plan en Conocimiento.
