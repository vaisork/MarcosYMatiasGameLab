# Cierre literario provisional del prólogo — 14 de octubre de 2026

**Obra:** *Crónicas de Vaisgard*, Libro I: *El primer camino*  
**Texto:** `prologos/001-el-mundo-que-permanece.md`, blob **`fb56d488e7acafad428e673d80039e88ba28b38c`**  
**Fuente histórica VT1:** `vintage-telnet/KNOW_THE_WORLD_MENU.md`  
**Dictamen Editor 03:** [#707, Dictamen 02](https://github.com/vaisork/MatiasGameLab/pull/707), sobre versión anterior del prólogo, y adenda de cotejo.  
**Estado:** **CORREGIDO LITERARIAMENTE; PENDIENTE VISTO BUENO DEL REVISOR 03 SOBRE NUEVA VERSIÓN Y CO-VALIDACIÓN DE ARQUITECTURA VT2. SIN FUSIÓN NI PUBLICACIÓN FINAL.**

## Cambios aplicados en la misma PR #705

- **P01 (evitar catálogo):** se reescribió la presentación consecutiva de especies como una **mañana de mercado en Vaisgard** con acciones y materiales observables: una carga humana, el giro del Felaryn, el soporte de un Dravak, una viajera Marevyn y un Vesperi que escucha una cifra. Los cinco nombres se conservan. Los párrafos sobre localidades ahora nacen de mercancías y noticias que llegan a la Cuenca de Veyra; permanecen Valdren, Khariel, Brumak, Narevia y Velmora.
- **P02 (cronología no corroborada):** se sustituyó la aseveración histórica de que «cuando comienzan los recuerdos… la ciudad ya formaba parte del paisaje» por una referencia expresa a **relatos incompletos**. El texto no afirma autoría ni fecha de fundación.
- **P03 (sobrecarga de nombres):** en lugar de exigir memorización, cada especie y pueblo se introduce por un gesto, oficio, material o sonido. No suprimimos el alcance histórico amplio que pidió el propietario.
- **P04 (generalizaciones):** destrezas biológicas distinguibles, pero conductas atribuidas a **personas** observadas y no a temperamentos universales de humanos/Dravak/etc.
- **P05 (repetición):** reducción de conclusiones moralizantes; las escenas del mercado y sus materiales portan la idea del mundo compartido.
- **P06 (transición con C001):** se conserva la viajera anónima que sostiene una carta al alba, sin decir Lera, Mara, Dalia ni el motivo del viaje.
- **P07 (maquetación):** prólogo antes de C001, jamás epílogo; el índice en `VintageTelnet-Libros/README.md` ya refleja el orden.

## Revisión conjunta de canon requerida

| Propuesta literaria | Fuente VT2 | Tensión/estado | Alcance solicitado |
| --- | --- | --- | --- |
| Vaisgard es antigua y no se conoce quién levantó sus primeras piedras | `docs/CANON_VIGENTE.md`, `CANON_EXPANSION.md` | Base compatible; los relatos históricos no prueban una cronología fundacional | **Solamente prólogo literario**, ninguna nueva cronología VT2 |
| Cinco especies y cinco comunidades | `docs/CANON_VIGENTE.md` y seis archivos de `content/regions/` | Rasgos corporales cotejados; escenas particulares de mercado **no** son eventos del juego | Personajes anónimos y escenas **sólo de novela** |
| Rutas, oficios y transacciones observadas en el mercado | `content/regions/veyra.json`, `CANON_EXPANSION.md` | Las actividades son compatibles; no declarar misiones, NPC, comercio efectuado o flags nuevos | **Ambientación del libro**, sin estado persistente |
| Presentación de cinco pueblos junto al centro Veyra | `docs/CANON_VIGENTE.md` | Todas regiones distintas; frase «una misma región» fue reemplazada por tierras conectadas | Sin alterar geografía ni trazar conexiones nuevas |
| Reservas de historia y secretos | `POLITICA_DE_SECRETOS.md`; Arquitecto VT2 | Evitar galerías desconocidas, revelación sobre origen o fundaciones atribuidas a una especie | **No revelar** ni expandir secretos |

La divergencia del Saltalodo detectada en PR #706 **no aparece en el prólogo** y no constituye bloqueo de sus hechos.

## Siguientes responsables

- **Editor Integral 03 / PR #707:** hacer un cotejo **breve** del blob corregido y emitir visto bueno o dos/tres cambios indispensables sin reabrir temas ya resueltos.
- **Historiador 02 / PR #706:** aún **no se ha materializado en un nuevo archivo/commit** su auditoría documental específica del prólogo. Escribir una nota corta de compatibilidad VT1→VT2 en su propia PR, indicando hallazgos con rutas y permisos. No bloquear al Escritor 01.
- **Arquitecto VT2:** dictaminar la compatibilidad entre prosa del prólogo y el estado canónico del juego, junto con Arquitectura Editorial, mediante comentario/registro en PR #705 antes del merge.
- **Arte 04 / PR #708:** preparar navegación EPUB `Portada → Prólogo → C001 → C002...` con texto literario (excluir encabezados administrativos en bloquequote); arte original sólo cuando esté aprobado.
- **Escritor 01:** C002 sigue autorizado únicamente para borrador y constituye la prioridad de nueva prosa; **WIP=1**.

No crea juego, NPC oficiales, rutas, lore secreto, roles adicionales ni automatizaciones.
