# Procedencia y revisión conjunta — prólogo «El mundo que permanece»

**Estado:** análisis de fuente histórica y propuesta editorial. **No es canon integrado ni autorización de publicar.**

## Material que señaló el creador

El contenido de la pantalla inicial del juego histórico **VT1** se preserva como texto de origen en:
- `vintage-telnet/KNOW_THE_WORLD_MENU.md` — blob SHA `36f224e8d7e5d4eea041e2337d7e3ae5736e82ad`, título «Conocer el Mundo», atribución explícita al **Historiador y Constructor del Mundo**.
- `vintage-telnet/HANDOFF_KNOW_THE_WORLD_UI.md` — SHA `5e9dee523696395b4b3741468e35a7620ddd6d23`; especifica el submenú inicial y pide **no resumir agresivamente** el contenido.
- `vintage-telnet/server/templates/world.html` — SHA `22d72ba6557410c76ffd0c8154fa49b5540fe7ba`; vista antigua «Conocer el Mundo», con navegación por cinco capítulos y opción «Leer todo». **Es plantilla HTML, no fuente editorial principal del relato**.
- `vintage-telnet/ENTRY_HISTORY_CANON.md` y `vintage-telnet/HISTORY.md` — textos históricos explicativos de VT1, subordinados a VT2.

**Canon vigente de contraste (VT2, prioridad superior):**
- `vintage-telnet-2/docs/CANON_VIGENTE.md` — SHA `37edf65a4419c54bc1a27f6613244ba32bafe128`.
- `vintage-telnet-2/CANON_EXPANSION.md` — SHA `ca42d1aa00cc38a1791a0f224fed98a7cca7fb6f`.
- `vintage-telnet-2/content/regions/{veyra,edran,hoshai,korven,lethra,nhal}.json` — hechos concretos para lugares/funciones.
- `vintage-telnet-2/AGENTS.md`, `docs/DECISIONES_VIGENTES.md` y decisiones más recientes del propietario.

## Decisión editorial

El creador considera la introducción histórica de VT1 apta **como fuente de un prólogo** del Libro I. La adaptación propuesta queda en [001-el-mundo-que-permanece.md](001-el-mundo-que-permanece.md). El prólogo va **antes del Capítulo 1**, como presentación literaria del mundo, sin anticipar desenlaces, secretos ni explicar la trama de Lera. Puede integrarse en una prelectura provisional como borrador identificado, una vez revisado por los arquitectos.

Se conserva:
1. La ciudad de Vaisgard como centro antiguo cuyo origen permanece sin resolver.
2. Las cinco especies y su identidad biológica no estereotipada.
3. Las cinco regiones/comunidades y su vida cotidiana.
4. El encuentro de rutas y personas en Vaisgard.
5. Una invitación a entrar en un mundo vivo que existe antes de que comience la aventura.

Se **elimina o reconduce**:
- Interpelación directa al jugador, sistema de creación de personaje, clases y conceptos de mecánica.
- Una cronología histórica específica «las cinco poblaciones llegaron/fundaron los pueblos» narrada como **hecho probado** sin ratificación nueva por VT2: el texto adaptado se concentra en paisaje/pueblos presentes y deja orígenes como memoria incompleta.
- Descripciones de galerías, niveles inferiores y preguntas que puedan hacer spoilers de secretos.
- Notas técnicas de UI, placeholders de imágenes y dicotomías simplificadoras «toda especie hace X».
- Promesa de mostrar ilustraciones que aún no estén aprobadas para libro.

## Tabla para cotejo de los arquitectos

| Tema | Fuente VT1 | Referencia VT2 | Decisión del borrador | Autoridad |
| --- | --- | --- | --- | --- |
| Antigüedad de Vaisgard | `KNOW_THE_WORLD_MENU.md §1,§4` | `docs/CANON_VIGENTE.md`, `CANON_EXPANSION.md` | Se conserva antigüedad **sin atribución de constructor** | Arquitecto Editorial + VT2 |
| Cinco especies | `§2` | `docs/CANON_VIGENTE.md` | Se actualizan Dravak/Felaryn/Marevyn/Vesperi según VT2; sin facultades nuevas | Arquitecto VT2 |
| Pueblos y regiones | `§3` | `CANON_EXPANSION.md`, seis JSON regionales | Se incluyen cinco hogares y Veyra; los oficios son observables, no regla para todos los habitantes | Arquitecto VT2 |
| Historia de los primeros pobladores | `§1,§3,§4` | No afirmación histórica cerrada en la guía resumida VT2 consultada | **No se da una cronología fundacional definitiva**; si se restaura, exigir confirmación conjunta | Arquitecto VT2 |
| Plaza, mercado, rutas y trabajo | `§4` | `docs/CANON_VIGENTE.md`, regiones | Se destaca la convivencia, sin inventar salidas o tiempos de viaje | Editorial + VT2 |
| Voz literaria | `§5`, cierre | `BIBLIA_EDITORIAL.md` y prosa del Libro I | Tercera persona evocadora; evitar narrar como guía turística o tutorial de VT1 | Editor Integral 03 |
| Arte | marcadores de UI | `client/art/`, PR #708 | **Texto solamente**, arte sujeto a aprobación de originales | Director Arte 04 |

## Encargos de revisión y publicación

1. **Historiador 02 / PR #706:** cotejar afirmaciones históricas y regiones del prólogo con `MatiasGameLab/main`, sin restaurar automáticamente el antiguo canon VT1; registrar cada tensión en #706 y referirla en #705.
2. **Editor Integral 03 / PR #707:** juzgar si funciona como **prólogo anterior al Capítulo 1** y si preserva la voz del Historian sin redundancia enciclopédica; sugerir recortes sólo por ritmo, no por obligación de abreviar.
3. **Arquitecto VT2 + Arquitecto Editorial / PR #705:** validar historia, especies, lugares, secretos, usos de piedras y fronteras de canon **en la misma PR**. Contradicción no resuelta bloquea fusión.
4. **Director de Arte 04 / PR #708:** prever sección inicial autónoma «Prólogo», ubicada antes del capítulo 001 en el índice del EPUB 3; integrar sólo después de revisión del canon y no agregar arte no aprobado.
5. **Escritor 01:** considerar el tono/historia como referencia, **sin cambiar el manuscrito ni su encargo WIP=1 para C002** salvo revisión específica.

No se alteran fuentes de VT1 o VT2. No se crea repo, agente ni automatización.
