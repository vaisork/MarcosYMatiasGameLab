# Dictamen 12 — Capítulo 011 «Más allá de la espera»

**Proyecto:** *Crónicas de Vaisgard*, Libro I «El primer camino».  
**Agente:** `revisor-canon-vaisgard-01` — Editor Integral y Revisor de Canon.  
**PR de autoría:** [#705](https://github.com/vaisork/MatiasGameLab/pull/705), rama `editorial/cronicas-vaisgard-agente-01-voz`.  
**PR del revisor:** [#707](https://github.com/vaisork/MatiasGameLab/pull/707), rama `editorial/revisor-canon-vaisgard-01-dictamen-705`.  
**Manuscrito íntegro cotejado:** `VintageTelnet-Libros/capitulos/011-mas-alla-de-la-espera.md`. Original del escritor `4cbfe9c3a6518d115c1a8738c6412839059da01a` (~2.886 palabras según ficha); **versión actual corregida directamente por Editor 03: `40e57cc711eaa889ca34a1fe0a36ea98f2a2f5e3`** (~2.890 palabras por separación de espacios).  
**Continuidad del capítulo actualizada:** `capitulos/011-continuidad-y-revision.md`, **`93a675064180111d65959b27a3b40cbb0184ed7e`** (original `0ead4d0ac1933a14fbf14774cee96ecb01b6d122`).  
**Ficha autorizada:** `plan/DECISION_CIERRE_C010_Y_AUTORIZACION_C011_2026-10-15.md` en #705; WIP=1, C011 único manuscrito autorizado. C012 NO autorizado al corte.  
**Capítulo previo C010, ya cerrado literariamente por Arquitectura Editorial:** texto `2c49eadba6a655607e63092920978cc220730f7d`, matriz `4b703a661d3db1035705ccb86a126ab2373c9d43`.  
**Canon público cotejado:** `vintage-telnet-2/content/regions/veyra.json` en rama remota `main`, blob `500a04d7dd3c2a72c750a69381664f2eed5500bf`: `rooms.veyra_plaza_rutas`, `rooms.vaisgard_mercado`, `rooms.veyra_calle_toldos` y `npcs.veyra_seli`.

## I. Veredicto

**CAPÍTULO 011 APROBADO LITERARIAMENTE POR EDITOR 03, CON DOS CORRECCIONES MENORES YA APLICADAS DIRECTAMENTE EN LA RAMA DEL ESCRITOR Y REGISTRADAS; SIN OBSERVACIONES MENORES PENDIENTES.**

La obra **rompe por fin el patrón de preguntar/esperar** que se repetía en C007–C010, sin renunciar al conflicto principal con Dalia. Lera **interviene porque decide escuchar a una niña**, comprueba que su opinión cambia un arreglo de capa, y luego solicita por propia iniciativa una prueba de trabajo relacionada con sus conocimientos de Valdren. El resultado es **limitado pero nuevo**: la vendedora acepta probarla **al día siguiente** bajo condiciones, sin prometer salario, contrato, refugio ni plaza fija. Lera **cumple la segunda tarde** sin recibir respuesta de Dalia. El final remata el arco de espera de forma orgánica: deja de exigir una respuesta para poder vivir su presente.

**El capítulo tiene suficiente cierre emocional propio; NO necesita alargarse ni terminar con un encuentro forzado con Dalia.** Coherente con la instrucción del propietario de **no cortar a mitad de desenlace ni rellenar por cuota**. El cierre literario definitivo del capítulo corresponde al Arquitecto Editorial, distinto de la co-validación de canon Editorial + VT2 que sigue pendiente antes de fusión/publicación final.

## II. Revisión de continuidad, tiempos y escenas

1. **Arranque exacto tras C010:** primera noche pagada con techo en mercado fue la noche 0; después del **primer atardecer cumplido del día 1** Lera no tenía otro espacio asegurado. C011 inicia **noche 1** junto a la piedra de `veyra_plaza_rutas`, donde duerme a ratos sentada, con frío y sueño interrumpido por tránsito. **No se crea servicio de albergue gratis ni derecho universal de dormir ahí.** Su incomodidad es consecuencia real y explícita.
2. **Día 2 y mapa:** `veyra_plaza_rutas --sur--> vaisgard_mercado --este--> veyra_calle_toldos`; tras el encuentro vuelve **al oeste al mercado**, donde compra comida con sellos finitos y busca a la vendedora de C007/C010; luego regresa **al norte a plaza** antes del segundo atardecer. Rutas verificadas en `content/regions/veyra.json`; no teletransporte ni otros barrios por completar un atlas.
3. **Escena padre–hija–capa:** conflicto comprensible y propio, no nuevo rumor de cargas/robo, caída en arroyo, negociación de alojamiento o carta. El padre quiere cortar tela sin entender para qué la niña necesita conservar largo el borde trasero; Lera escucha y señala la pregunta que el adulto ignoró. La solución consiste en **probar la capa y ajustar solo el frente**, preservando cobertura trasera sobre cesta/piernas. El padre paga a la remendadora; Lera no se atribuye honorarios ni traspasa mando a la hija artificialmente.
4. **Seli:** `npcs.veyra_seli` es **Marevyn, remendadora de toldos**, con espacio público `veyra_calle_toldos`, costuras compartidas y conocimiento de escurrimientos. En la novela hace **un arreglo puntual de capa** y examina sin repararla la unión de la bolsa de Lera. **COMPATIBLE COMO EXTENSIÓN HUMANA DE OFICIO** —no afirmar que el juego ya contempla servicios regulares de ropa, aprendizaje, refuerzo de bolsas o plaza de aprendiz—; su faceta textil privada requiere **co-decisión Editorial + VT2 para edición definitiva**. No usa temas de acequia/secreto/dragón, `veyra_atar_toldo`, `veyra_acordar_costura`, junco, `flags` o servicios del runtime.
5. **Heridas y autonomía:** Lera siente el raspón/irritación por fibras de C010; Seli le aconseja dejar cerrar la piel antes de usar aguja, sin sanar instantáneamente. Seli **no regala material, enseñanza ni trabajo**; invita a preguntar en otra ocasión sin reservar tiempo. Se respeta la agencia de la niña al explicar uso de capa y la de Dalia al conservar derecho a rechazar la carta.
6. **Regreso a vendedora de fruta:** Lera ofrece su habilidad de los huertos para **clasificar fruta que tolera el transporte**; comete errores y acepta explicaciones sobre diferencia entre fruta en huerto y mercancía bajo toldo. Se materializa una prueba de aprendizaje, **no** concesión automática de empleo. La vendedora solo plantea una segunda prueba **mañana temprano, día 3**, con condiciones/precio a determinar; Lera puede decidir si le conviene. No es misión de VT2 ni NPC/empleo oficial.
7. **Final del día 2:** llega a `veyra_plaza_rutas` con tiempo; **cumple efectivamente el segundo atardecer**, sin mensaje o testigo milagroso ni aparición de Dalia. Mantiene carta personal bajo su chaqueta y recorte de C008 en manos de Nara, sin acuse de entrega. La noche 2 comienza a aproximarse **sin refugio asegurado** y día 3 inicia con propuesta abierta de la vendedora. Cierra capítulo con decisión de continuar hacia el mercado por **vida propia, no abandono definitivo de Dalia**.
8. **Estilo narrativo:** tercera persona próxima a Lera, variedad de carácter en diálogos (padre impaciente, hija práctica, Seli irónica y profesional, vendedora directa), resolución de escenas completas y uso de humor discreto. Adecuado a 10–14 y adultos.

## III. Correcciones menores ya ejecutadas por Editor Integral 03

El propietario otorgó permiso para **correcciones mínimas directamente en la PR del Escritor**, sin reenviar tareas de una frase. Cambios limitados a tiempo narrativo y visibilidad pública del mapa; sin reescribir historia, modificar creencias del personaje, cambiar canon ni ejecutar tareas del juego.

| ID | Estado | Frase original en `4cbfe9...` | Corrección vigente en `40e57...` | Motivo |
|---|---|---|---|---|
| **L01 — tiempo verbal de la noche** | **RESUELTA** | «Durante parte de la noche dormitaría con la barbilla sobre el pecho, se despertaría al oír una rueda y volvería a acomodarse». | «Durante parte de la noche dormitó con la barbilla sobre el pecho, se despertó al oír una rueda y volvió a acomodarse». | Evitar futuro del pasado hipotético en una noche que **ya está sucediendo y termina antes del amanecer**. |
| **L02 — visibilidad de puerta desde plaza** | **RESUELTA** | «Al fondo se abría el camino hacia la Puerta de los Campos, por donde había entrado…». | «Más allá del mercado y de la calle de almacenes quedaba la Puerta de los Campos, por donde había entrado…». | `rooms.veyra_plaza_rutas.look.sur` muestra mercado, **no vista directa de la puerta**. La ruta física sigue `veyra_plaza_rutas → vaisgard_mercado → veyra_barrio_cargas → veyra_puerta_campos`. |

**Commit manuscrito corregido:** `ca5aef51569a591cb7df510db804a3b8891bc28d`, blob `40e57cc711eaa889ca34a1fe0a36ea98f2a2f5e3`.  
**Commit actualización matriz y auditoría:** `e794e2677ddb463bb5bb9cdc270a5595ef072f79`, blob `93a675064180111d65959b27a3b40cbb0184ed7e`.  

**No quedan correcciones mínimas para el Escritor.** Si Arquitectura Editorial necesita rediseñar cualquier hecho sustantivo, debe aprobarlo como decisión nueva; el Editor no lo hace unilateralmente.

## IV. Matriz del canon VT2, Veyra

| Elemento narrado | Evidencia `content/regions/veyra.json` | Alcance |
|---|---|---|
| Plaza → Mercado al sur | `rooms.veyra_plaza_rutas.exits.sur = vaisgard_mercado` | **CONFIRMADO** |
| Mercado → Calle de Toldos al este | `rooms.vaisgard_mercado.exits.este = veyra_calle_toldos` | **CONFIRMADO** |
| Calle de Toldos → Mercado al oeste | `rooms.veyra_calle_toldos.exits.oeste = vaisgard_mercado` | **CONFIRMADO** |
| Mercado → Plaza al norte | `rooms.vaisgard_mercado.exits.norte = veyra_plaza_rutas` | **CONFIRMADO** |
| Plaza con grandes piedras-banco, luz nocturna y tráfico de carros | `rooms.veyra_plaza_rutas.description/night/dawn/dusk` | **CONFIRMADO** escenario |
| Mercado con puestos de fruta, cestas, canalillo, toldos, movimiento diario | `rooms.vaisgard_mercado.description/day/dusk` | **CONFIRMADO** escenario |
| Calle de toldos multicolores, talleres y costuras | `rooms.veyra_calle_toldos.description/day` | **CONFIRMADO** escenario |
| Seli Marevyn en Calle de Toldos, remendadora | `npcs.veyra_seli.species = marevyn`, `.role = remendadora de toldos`, `.home_room = veyra_calle_toldos` | **CONFIRMADO** NPC público; costura de capa y sugerencia de reforzar bolsa son **solo novela** |
| Cuidado privado de prenda sin misión/servicio | No consta como compra/quest de VT2 | **COMPATIBLE EN LA NOVELA, NO CANON OPERATIVO** |
| Prueba de trabajo de conservación de fruta ante comerciante anónima | Escena entre personajes privados | **PROPUESTA SOLO NOVELA**, no contratación/empleo de runtime |
| Pasaje secreto de cantera, acequia, dragón, temas/flags de Seli | `veyra_calle_toldos.actions`, `npcs.veyra_seli.topics` | **NO USADOS, NO REVELADOS** |
| Dalia/recorte de Nara/Arel | Trama privada | **SIN UBICACIÓN INVENTADA NI MENSAJE ENTREGADO** |

## V. Estado registrado al final para C012

- **Momento:** día 2, completado el **segundo de los dos atardeceres** prometidos junto a la piedra al sur de la Plaza; noche 2 en inicio, **sin techo ni cama asegurados**. Nada exige repetir una tercera espera.
- **Posición:** sale desde Plaza hacia Mercado `vaisgard_mercado`, movimiento iniciado al cierre, sin afirmar nueva sala explorada adicional.
- **Compromiso día 3:** vendedora de frutas **le ofreció una nueva prueba al amanecer**, **no** trabajo contratado, retribución prometida ni lugar permanente. Debe preservarse libertad de acordar términos, decir no y comprobar la tarea. Su propósito de desarrollar una vida en Vaisgard coexiste con la búsqueda de Dalia.
- **Seli:** ofreció posibilidad futura **no garantizada** de consultar/reforzar costura de bolsa pagando material o aprender bajo límites; no regaló nada ni creó aprendizaje de juego.
- **Objetos:** carta privada de Dalia seca, doblada y aún con Lera; recorte firmado que Nara conserva sin constancia de entrega; carboncillo, taza asa torcida y cantimplora con algo de agua; sellos finitos tras comprar comida. No se reescribe la carta, no se incorpora objeto mágico.
- **Lesiones y ropa:** bota casi seca por fuera, aún fría dentro; media mejorando, palma raspada/irritada y hombro sensible; segunda noche incompleta no borra dolores.
- **Dalia:** sigue ausente, paradero desconocido, autonomía respetada. No aparece respuesta automática en los dos atardeceres.

## VI. Advertencias estratégicas NO bloqueantes para Arquitectura Editorial

1. **Último tercio del Libro I:** al tener provisionalmente 15 capítulos + prólogo, del C012 al C015 no conviene sustituir la búsqueda afectiva por cuatro capítulos de trabajo de mercado. C011 **sí logra un cambio humano necesario**, pero **todavía no acerca materialmente a Dalia**: esto es intencional y válido por un capítulo; la próxima ficha debería iniciar una vía auténtica hacia alguna consecuencia o resolución reconocible de la relación, con información limitada plausible o una decisión personal que transforme el desenlace, **sin encuentro providencial ni exigir reconciliación**.
2. **No más capítulo de espera duplicado:** ambos atardeceres se cumplieron; futuros conflictos deberán producir consecuencia **nueva**, no horas inmóviles de plaza/repetición de comida y techo.
3. **Servicios de Seli:** no convertir capacidad privada de remendar una capa en nueva tienda oficial de ropa, mentoría pagada, entrenamiento de jugador o quest del runtime. La biografía pública de `veyra_seli` sigue centrada en toldos.
4. **Entrada a día 3 y refugio:** capítulo concluye empezando noche 2 sin alojamiento confirmado. Si C012 abre al amanecer, explicar o elidir con costo verosímil la noche; mantener promesa de prueba en el mercado **sin empleo garantizado**. No forzar C012 a terminar en marca horaria determinada; la acción define ritmo y cierre.
5. **Co-decisión canónica pendiente:** personajes del libro (Lera, Dalia, Iven, Nara), recuerdos/diálogos de NPC públicos (Arel, Bela, Seli), escenas episódicas mercantiles, prólogo VT1–VT2, Saltalodo Edran/Lethra y límites de secretos deben ser **revisados conjuntamente por Arquitecto Editorial y Arquitecto VT2** antes de fusionar/publicar la edición definitiva. La aprobación literaria del Editor no suple su firma.

## VII. Handoff y permisos

**Arquitectura Editorial:** ratificar el cierre literario de C011 **sobre blob `40e57cc711eaa889ca34a1fe0a36ea98f2a2f5e3`**, ya microcorregido, sin reabrir C001–C010. Valorar la nueva iniciativa de Lera y ruta literaria final hacia Dalia; preparar únicamente si corresponde ficha/autorización de **C012** (WIP=1), sin recortar ni alargar episodios artificialmente.

**Escritor #705:** **no hay microcorrecciones pendientes**. Mantener dos atardeceres cumplidos, noche 2 sin refugio garantizado, vendedora ofreciendo solo prueba día 3, diálogos/actividad de Seli solo novela; **NO C012** hasta permiso.

**Historiador #706:** si hace falta, cotejo puntual sobre `veyra_seli` y actividad de costura de capa. No ampliar atlas sin encargo. Solicitar co-decisiones arquitectónicas antes de considerar nuevos hechos como canon compartido.

**Publicador #708:** incluir C011 solo en lote de prelectura **BORRADOR** cuando Arquitectura Editorial autorice, obteniendo el blob **actual**; EPUB final no está aprobado por el Editor y no equivale a la co-validación VT2+Editorial.

**Veredicto de Editor 03: C011 APROBADO LITERARIAMENTE SIN PENDIENTES MENORES, DOS MICROCORRECCIONES YA APLICADAS; publicación/fusión definitiva BLOQUEADAS por co-canon pendiente.**

— *Editor Integral y Revisor de Canon*
