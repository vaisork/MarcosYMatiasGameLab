# Decisión de arranque del Libro I — Arquitectura Editorial

**Fecha:** 2026-10-14  
**Proyecto:** `vaisork/MatiasGameLab/VintageTelnet-Libros/`  
**Estado:** **APROBACIÓN OPERATIVA PARA UN PRIMER BORRADOR**, no aprobación de publicación ni confirmación del canon de VT2.  
**Base:** propuestas de voz y Biblia de la [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705); atlas del Historiador, [PR #706](https://github.com/vaisork/MatiasGameLab/pull/706).

## Decisiones de Arquitectura Editorial

1. **Libro I** mantiene el título de trabajo *El primer camino* y se planifica en 15 capítulos como base modificable, no índice final congelado.
2. **Punto de partida:** Valdren, región Edran; únicamente escenas respaldadas por `content/regions/edran.json` y `docs/CANON_VIGENTE.md`.
3. **Protagonista de trabajo:** **Lera**, joven adulta humana de 24 años, personaje **original y exclusivo de la novela**, sin equivalencia con ninguna partida ni NPC canónico. Su nombre y biografía continúan sujetos a revisión editorial final, pero se habilitan para el primer borrador.
4. **Núcleo del arco:** desea realizar por sí misma un recorrido que comienza con un mensaje/compromiso personal dirigido a Vaisgard. La decisión de viajar revela una tensión entre autonomía y saber aceptar ayuda. No convertir el mensaje en quest oficial ni en revelación sobre el origen de Vaisgard.
5. **Voz narrativa:** aprobar para borrador la **tercera persona cercana en pasado** propuesta por Agente 01. Lenguaje visual, cálido y legible, sin infantilizar, con diálogos naturales y observación material.
6. **Primer capítulo:** *Una decisión al amanecer*. Inicio preferente en el ámbito de la plaza/huertos de Valdren; seguir la ficha ya creada `plan/fichas-001-003.md`. Mostrar una obligación, una elección difícil y la primera consecuencia concreta. **No salir todavía de Valdren ni hacer aparecer criaturas sin verificación.**
7. **Objetivo de extensión orientativo:** ~2,000–2,500 palabras; prioridad a ritmo literario y utilidad de escenas, no a cumplir cifra.
8. **Orven**, segundo protagonista candidato, **no se incorpora automáticamente al Capítulo 1**; esperar revisión de su función, procedencia y biología Dravak. No atribuir oficios, parentescos, decisiones, hechos anteriores ni secretos a Daro u otros NPC canónicos sin evidencias.
9. **Arte:** en la prosa poner marcadores de oportunidad visual, no insertar copias ni generar imágenes. Arte original del juego sujeto a aprobación del Director de Arte.

## Autorización y límites para el Escritor — Agente 01

**AUTORIZADO:** redactar **únicamente un primer borrador del Capítulo 1**, en Markdown, en la misma rama/PR #705 ya existente, conservando la propuesta de voz y anexando un registro corto de continuidad y fuentes. **WIP=1**. No abrir una PR adicional del mismo capítulo sin necesidad.

**NO AUTORIZADO:** redactar Capítulo 2; resolver secretos; atribuir datos históricos no confirmados; cambiar geografía, criaturas, NPC, arte o archivos de `vintage-telnet-2/`; publicar en Google Drive; interpretar este permiso como autorización para fusionar PR.

## Handoff a Historiador — Agente 02

Su atlas inicial de PR #706 se recibe como **base documental de planificación**, no como aprobación integral ni certificación de cada cuenta de fauna. Segundo expediente acotado: Valdren y transiciones reales hasta Veyra, con IDs, NPC pertinentes y fauna candidata para capítulos 2–4. No desplazar su primera PR ni editar archivos del Escritor. Si detecta tensión canónica que afecte al Capítulo 1, reportarla antes de su aprobación final.

## Puertas de revisión

- **Arquitecto Editorial:** revisa tono, interés del inicio, causalidad, protagonistas y continuidad interna.
- **Arquitecto VT2:** coteja geografía, comportamiento de NPC, especies/fauna, límites de secretos y cualquier nuevo hecho compartido; decisiones/tensiones se registran en la PR.
- **Revisor Integral (Agente 03):** evalúa capítulo cuando exista un borrador y escribe dictamen.
- **Director de Arte (Agente 04):** prepara sólo inventario y plantilla hasta existir capítulos aprobados.

**Una contradicción de canon sin resolver bloquea la fusión, no el trabajo exploratorio en borrador.** La Biblia Editorial global aún requiere cierre formal antes de la edición final del libro.

**Nota operativa:** un comentario o archivo GitHub no ejecuta automáticamente otros chats/agentes; el trabajo deberá ser recogido por el colaborador cuando se le active manualmente. No se crean automatizaciones ni recordatorios.
