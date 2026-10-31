# Comprobación de fase 0 para revisión conjunta

**Fecha:** 2026-10-16. **Solicitud a revisores:** Arquitectura Editorial y Arquitectura VT2 deben validar esta propuesta en la PR del Plan del Libro II antes de fusionar. Esta comprobación es del Arquitecto literario, **no** sustituye su aprobación independiente.

| Tema | Fuente en main | Propuesta | Resultado / vigilancia |
|---|---|---|---|
| Especie Felaryn | vintage-telnet/SPECIES.md; vintage-telnet-2/docs/CANON_VIGENTE.md | Nuba con cola, pelaje, equilibrio, visión lejana, pies digitígrados y tobillo limitado | Compatible, sin estadísticas ni vuelo |
| Territorio | vintage-telnet-2/content/regions/hoshai.json | Recorrido 13 capítulos Khariel → mirador/caseta/campamento → pinar → Khariel | Conexiones descritas y trazadas en INDICE |
| Geografía cruzada | rooms.exits en hoshai.json | No cruzar a Korven, Nhal ni Veyra | No ampliar mapa |
| NPC Iria | hoshai.json, hoshai_iria | Cuidados de apoyos, líneas parciales de visión | Conservar oficio; sin rango formal |
| NPC Daren | hoshai.json, hoshai_daren | Humano que repara y reclama su polea | Confirmado |
| NPC Luma | hoshai.json, hoshai_luma; world.json khariel_cornisa | Comerciante decide prudencia con cargas; elección entre cargas pequeñas y revisión | No certificar cierre ni reparación |
| NPC Seran | hoshai.json, hoshai_seran; world.json khariel_polea | Deuda de transporte y polea retenida | Recuperar NO equivale a pagar |
| NPC Yesa | hoshai.json, hoshai_yesa | Bulto dejado en estación del cordel, cinta-recordatorio | No convertir en hurto |
| Fauna | world.json creatures: unapiedra, saltacresta, rasgacumbres | Encuentros de territorio y evitación | No conducta sobrenatural |
| Secretos | VintageTelnet-Libros/POLITICA_DE_SECRETOS.md | Ninguna revelación, solución ni secreto de especie en texto | Solo ABIERTA/DESCUBRIBLE, RESERVADA excluida |
| Historia editorial | BIBLIA_EDITORIAL.md | Volumen II Felaryn; Las cinco rutas V o posterior | Encabezado cambiado en misma rama |
| Continuidad Libro I | #705, #707, #708 fusionadas | Arco diferente, sin reescribir Lera ni sus capítulos | Sin modificaciones a Libro I |

**Acción si un revisor encuentra contradicción:** documentar línea, fuente, clasificación y corrección; dejar PR sin fusionar hasta resolver. No modificar el código/arte de vintage-telnet-2/ desde esta fase.
**Controles de aceptación de fase 0:** CANON_FELARYN, PREMISA, INDICE, PERSONAJES, ENCARGO_ESCRITOR, RELEVO; Biblia actualizada; 13 capítulos escaletados con obstáculo y giro; pagos fijados; revisión conjunta solicitada; PR marcada lista para revisión del propietario.
