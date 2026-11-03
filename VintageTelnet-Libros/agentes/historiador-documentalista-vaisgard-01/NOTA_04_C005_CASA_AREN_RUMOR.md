# Nota 04 — C005: Casa del Camino, Aren y noticia incompleta

**Historiador 02** · [PR #706](https://github.com/vaisork/MatiasGameLab/pull/706) · WIP=1 · **comprobación localizada, no dictamen literario**. Encargos: comentarios editoriales del 15/10/2026 en PR #706 [07:21](https://github.com/vaisork/MatiasGameLab/pull/706#issuecomment-6186767128), [07:29](https://github.com/vaisork/MatiasGameLab/pull/706#issuecomment-6186886164) y [07:40 UTC](https://github.com/vaisork/MatiasGameLab/pull/706#issuecomment-6187069718).
**Manuscrito leído:** PR #705, `VintageTelnet-Libros/capitulos/005-una-historia-a-medias.md`, **blob `4a4cbd654e6d9032734a218f74ee458f6b7e2100`**, ya corregido y aprobado literariamente por Arquitectura Editorial. `005-continuidad-y-revision.md`, blob `cfe710034d1fe58c5cc40a1a1956ab9257b88332`.
**Fuente VT2:** `vintage-telnet-2/content/regions/edran.json`, **blob `dbdaead65f026a57925857f36388b28b94054498`** del corte `main@316e722f59ebe1f8cef4a606d4190b584caf802a`; `docs/CANON_VIGENTE.md`, blob `37edf65a4419c54bc1a27f6613244ba32bafe128`. Ningún archivo del juego fue modificado.

## 1. Cotejo rápido del capítulo

| Afirmación/escena de C005 | Fuente exacta de VT2 | Calificación y límite |
|---|---|---|
| Casa al término de cuesta; tejado visible antes de edificio | `rooms.edran_terraplen.description`: «La casa de arriba no aparece hasta pasada la mitad de la cuesta»; `rooms.edran_casa_camino.description` | **CONFIRMADO/ABIERTO**. C005 distingue el tejado visto desde la cuesta de los muros y la puerta visibles al completar subida. |
| `edran_terraplen --norte--> edran_casa_camino --norte--> edran_calzada` | `rooms.*.exits.norte` / reciprocidad `.exits.sur` | **CONFIRMADO**. El manuscrito finaliza saliendo hacia la calzada, no salta al hito ni a Vaisgard. |
| Mesa alta protegida, bultos mojados abajo, olla y casillas para destinos | `rooms.edran_casa_camino.description`, `.rain`, `.exam.escalón` | **CONFIRMADO/ABIERTO**. Los recipientes y tiempos de atención específicos del capítulo son **COMPATIBLES**, no servicio automático del juego. |
| Aren humano, lector de mensajes, ordena por destino y pregunta por lugar/hora | `npcs.edran_aren.{species,role,home_room,description,day,night,dawn,dusk}` | **CONFIRMADO/ABIERTO** su rol y maneras de contrastar. El diálogo **nuevo** en el libro es **COMPATIBLE**, no cita textual canónica, ni decisión oficial del NPC. |
| Nota sobre **carga detenida por reparación de rueda**, no desaparición ni asalto | `rooms.edran_casa_camino.examine.nota` y `npcs.edran_aren.topics.nota` | **CONFIRMADO/ABIERTO** el contenido restringido a lo que se anotó; **DESCUBRIBLE** quién vio qué y qué sucedió después. |
| Rumor de asalto corregido ante testigos, sin certificar destino de carga | Capítulo 5, frente a `rooms.edran_casa_camino.examine.nota` y canon de primera visita/observación/entrega | **COMPATIBLE / ficción de novela**: la rectificación personal de Lera **no** significa que la carga llegara, que se demostró robo, o que se actualizó una ficha oficial del juego. |
| Caldo pagado en «sellos», sin tarifa | Moneda sellos en economía de VT2; `rooms.edran_casa_camino.description` menciona sopa, pero no tabla pública de precio de caldo de esa sala | **COMPATIBLE solamente**. **No precio fijado**, establecimiento nuevo, cupo, stock, ingreso de NPC ni tabla comercial canónica. Registrar co-decisión antes de fusión. |
| Cantimplora parcialmente repuesta tras compartir agua; saco y carga distintos | Ficción privada de C004→C005, no inventario persistente de VT2 | **COMPATIBLE**. Se conserva el último sorbo antes de llegar a la casa; no se declara agua gratuita ilimitada ni traslado del saco sin consentimiento. |

**Estado de lectura:** no encuentro contradicción dura con las **salidas, disposición interior, función pública de Aren ni contenido observable de la nota**. El dramatismo del rumor nace de la distancia entre datos parciales y conclusiones precipitadas, y el texto **se retracta expresamente** ante quienes lo escucharon. La causalidad específica es original de la novela.

## 2. Qué puede saber Aren (sin ejecutar la misión)

- **CONFIRMADO / ABIERTO:** Aren observa y clasifica **mensajes** por destino y contrasta autor de testimonio, lugar, momento y qué se ha observado. Su `topics.Vaisgard` orienta por **calzada → hito → puerta**. Puede decir *«la nota dice reparación»* y pedir procedencia.
- **DESCUBRIBLE:** la nota pública constata solo una carga detenida por rueda. **No demuestra** que desapareciera, fuera robada, estuviera en el mismo lugar horas después, o coincidiera con el carro que vio Lera en el terraplén. El lector puede sospechar o comprender que otras voces mezclaron dos vehículos; no obtiene prueba final.
- **CONDICIONADO / NO EXPONER COMO HECHO CONSUMADO:** `topics.nota` hace referencia a un vínculo de Aren con Elva y una preocupación por Lio; el contenido requiere **distinción entre diálogo posible del juego y conocimiento efectivo del personaje del libro**. C005 **no** enuncia esos nombres, no documenta el paradero de Lio y no resuelve la historia del juego.
- **SIN ACTIVACIÓN:** `rooms.edran_casa_camino.actions` contempla `edran_leer_nota` y `edran_corregir_mensaje`; los contratos de la historia utilizan estados/acciones que **no** se vuelven reales porque Lera habló en una escena del libro. **No atribuir estado `edran_mensaje_aclarado`**, ni corregir archivo común, ni afirmar que Aren despachó una respuesta a Elva. El manuscrito correctamente lo deja ordenando notas.
- **NO CONOCIDO POR AREN:** respuesta de Dalia, contenido de la carta privada de Lera o futuro de la carga de un tercero; nada en sus fichas lo vuelve omnisciente.

## 3. Dos texturas sensoriales ya sustentadas, si resultan útiles

1. **Casa del Camino al acabar la cuesta — CONFIRMADO:** olor de sopa y fuego, aire cálido sobre **suelo bajo húmedo** frente a **mesa elevada y seca**; tras lluvia, una línea de agua termina antes del escalón. `rooms.edran_casa_camino.{description,rain,examine.escalón}`. El capítulo ya usa estas imágenes: **no añadirlas de nuevo por obligación**.
2. **Salida a la Calzada — CONFIRMADO:** dos parches más claros entre piedras redondas pulidas, **traqueteo** que se oye antes que el carro, y una curva que oculta el poste siguiente. `rooms.edran_calzada.{description,day,examine.reparaciones}`. Buen apoyo específico para el inicio de **C006**, no motivo de prolongar C005.

**Alerta NO revelar:** ningún itinerario secreto o acceso subterráneo; ningún desenlace de Elva/Lio, premio, `flag` o misión vinculada a la carga; ninguna certeza de asalto; ninguna tasa «oficial» del caldo. El origen de las piedras antiguas de Vaisgard tampoco se deduce de la casa ni de la calzada.

## 4. Co-decisión solicitada (dos arquitectos)

| Hecho propuesto en novela | Riesgo | Decisión y alcance solicitados |
|---|---|---|
| Aren dialoga con Lera y testimonios anónimos; deja rumor abierto | Bajo si queda en relato | Validar **solo novela**, sin `edran_mensaje_aclarado` ni cambio de `npcs.edran_aren`. |
| Elva/Lio quedan fuera de escena y no se soluciona mensaje oficial | Protector | Ratificar que el material **DESCUBRIBLE/CONDICIONADO** del juego no se incorpora por paráfrasis. |
| Caldo con transacción en sellos **sin monto** | Bajo, sujeto a política de economía | Validar como intercambio particular; no fijar catálogo/tarifa de Casa del Camino sin especificación VT2. |
| Porteador/caminante/ayudante y reposición parcial de agua | Bajo si no persiste | Ratificar como hechos **solo del Libro I**, no NPC ni acción de juego. |
| Divergencia Saltalodo Edran/Lethra | **Abierta; no afecta C005** | Mantener exclusión preventiva en novela; decisión definitiva **Editorial + Arquitecto VT2** sigue pendiente en PR #706. |

**Handoff:** Escritor #705 no necesita reabrir C005 por este cotejo; Revisor #707 conserva la revisión literaria. El dato público no da permiso para revelar la solución de una misión. **Este documento no autoriza merge, publicación ni C007.**