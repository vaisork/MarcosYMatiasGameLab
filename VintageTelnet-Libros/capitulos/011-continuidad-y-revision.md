# Capítulo 011 — Continuidad, fuentes y entrega a revisión

**Novela:** *Crónicas de Vaisgard*, Libro I «El primer camino». **Escritor:** Agente 01, [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705).  
**Texto:** [011 — Más allá de la espera](011-mas-alla-de-la-espera.md), **2,886 palabras** incluyendo título, SHA **`40e57cc711eaa889ca34a1fe0a36ea98f2a2f5e3`** tras microedición del Editor 03 (original `4cbfe9c3a6518d115c1a8738c6412839059da01a`).  
**Autorización vinculante:** `../plan/DECISION_CIERRE_C010_Y_AUTORIZACION_C011_2026-10-15.md`.  
**Estado:** **BORRADOR COMPLETO, EN REVISIÓN**; no aprobación literaria todavía. **WIP=1, C012 NO autorizado ni iniciado.** Ningún merge/publicación definitiva sin co-canon VT2+Editorial.  
**Capítulo previo:** C010 corregido por Editor 03, blob `2c49eadba6a655607e63092920978cc220730f7d`, matriz `4b703a661d3db1035705ccb86a126ab2373c9d43`, aprobado literariamente por Arquitectura Editorial y Dictamen 11 de PR #707.

## 1. Línea temporal y trayecto — NO confundir las dos tardes

1. **Noche 1, inmediatamente tras C010:** Lera acaba de levantarse de la piedra de `veyra_plaza_rutas`, ya cumplió **primer** atardecer. No tiene sitio de dormir pagado. **Se acomoda precariamente sentada al lado protegido de la piedra de la plaza, sin techo, permiso exclusivo ni cama; un paso de carretas y el frío interrumpen su descanso**. Se levanta antes del amanecer para dejar el paso. Es una elipsis breve con **costo narrado de sueño, frío y dolor**, no refugio milagroso ni servicio público de hospedaje; este recurso NO se establece como opción garantizada, legal universal ni condición permanente de la plaza.
2. **Día 2, mañana:** `veyra_plaza_rutas --sur--> vaisgard_mercado`. Saluda al vendedor de cestos episódico de C010; **no termina el tercer cesto** ni se cobra su trabajo. Decide conscientemente hacer algo nuevo. `vaisgard_mercado --este--> veyra_calle_toldos`. Se involucra **de forma verbal**, sin manipular mercancía, en conflicto de padre, hija y costurera alrededor de **acortar una capa**. La niña expresa que necesita conservar el largo trasero para cubrir sus piernas/cesta; al probarla puesta se acuerda ajustar solo la parte delantera. No se declara reparación de toldo ni acción de quest. La hija conserva capacidad de decidir, no se convierte en NPC.
3. **Día 2, mañana/mediodía:** **Seli** (`veyra_seli`), Marevyn canónica que repara toldos, cose en la escena **una capa como trabajo ocasional compatible solo novela**; mantiene su especialidad pública textil. Lera pregunta por su propia correa gastada, pero Seli **NO la repara ni promete enseñanza, oficio, empleo, alojamiento, materiales gratis ni garantía**. Observa palma irritada e invita a preguntar otro día cuando se encuentre mejor. La intervención privada requiere **cotejo de compatibilidad con la identidad/rol de Seli** y co-decisión VT2+Editorial antes de publicación definitiva; no activa `veyra_atar_toldo`, `veyra_recados_*`, información condicionada ni misiones.
4. **Día 2, tarde temprano:** `veyra_calle_toldos --oeste--> vaisgard_mercado`. Lera **compra un alimento sencillo con sus pocos sellos**, sin precio numérico, gratuidad ni suponer riqueza/empleo. Vuelve a la vendedora de fruta de C007/C010, le pide una oportunidad real de **aprender a clasificar frutas que resisten el viaje**, demuestra unas elecciones y recibe corrección de otras. **No recibe salario, comida gratuita, alojamiento, puesto fijo ni contratación** en esta primera prueba. La vendedora solo dice que mañana, **día 3 por la mañana**, puede volver a **preguntar y probar**, con términos/pago por definir y derecho a negarse; **no hay acuerdo de empleo estable**. Lera expresa interés en permanecer en Vaisgard independientemente de recibir noticias de Dalia, iniciando un **vínculo urbano concreto, voluntario y verificable** distinto del cesto por hambre en C010.
5. **Día 2, tarde final:** Regresa **norte** a `veyra_plaza_rutas`, junto a piedra previamente acordada. **Cumple el SEGUNDO atardecer completo**, sin noticia de Dalia. No se adelanta ni se deja pendiente una tercera cita. Al salir hacia el Mercado al inicio de noche 2 **todavía no hay refugio contratado**; el siguiente capítulo puede tratar ese asunto o el trabajo del día 3 sin olvidar el costo, pero no repetir como motor toda la penuria anterior.

**Secuencia pública validada según `vintage-telnet-2/content/regions/veyra.json`:**
`veyra_plaza_rutas.exits.sur = vaisgard_mercado`;
`vaisgard_mercado.exits.este = veyra_calle_toldos`;
`veyra_calle_toldos.exits.oeste = vaisgard_mercado`;
`vaisgard_mercado.exits.norte = veyra_plaza_rutas`.
**Ubicación final:** vuelve hacia **Mercado**, aún sin entrar definitivamente ni reservar nada. No Patio del Agua, no Archivo, no Veyra exterior ni cambio de mundo.

## 2. Matriz: público confirmado, privado novelístico, límites

| Elemento | Fuente de VT2 | Clasificación y no-afirmaciones |
|---|---|---|
| Plaza con grandes piedras usadas como bancos; cierta actividad y luz de noche | `regions/veyra.json > rooms.veyra_plaza_rutas.description`, `.night`, `.day` | **CONFIRMADO / PÚBLICO**. Dormitar precariamente en piedra es episodio **solo novela**, no refugio institucional ni derecho de ocupación. |
| Mercado y cestas de fruta, tránsitos, tabla y puestos | `rooms.vaisgard_mercado.description`, `.day` | **CONFIRMADO / PÚBLICO**; acuerdos de compraventa/ensayo privado sin fijar reglas oficiales. |
| Calle de Toldos con talleres textiles, retales, costuras y trabajo nocturno | `rooms.veyra_calle_toldos.description`, `.day`, `.night` | **CONFIRMADO / PÚBLICO**. Conflicto de capa y familiares y pago privado **exclusivos de novela**. No activar `examine.costura` ni reparar `veyra_atar_toldo` del juego. |
| Seli (Marevyn), remendadora de toldos | `npcs.veyra_seli.name/species/role/home_room/description/day` | **CONFIRMADO el rol textil y localización**. La capa remendada, diálogo e invitación vaga son **propuestas ficcionales puntuales**, NO giro de empleo/aprendizaje institucional del juego ni resultado de quests. |
| Venta y compra de comida en el mercado | Actividad comercial de `vaisgard_mercado`; economía por sellos ya usada en novela | **COMPATIBLE** sin cifra de precio, regulación o servicio nuevo. |
| Padre e hija, vendedora de fruta, vendedor de cestos | No NPC del JSON | **SOLO NOVELA**; la vendedora ya apareció en C007/C010 sin nombre, lugar residencial, oficio extraoficial ni vínculo con Dalia. No adquirir estatus de misión/canon del juego. |

## 3. Agencia narrativa y progresión del arco Dalia–Lera

**Cambio esencial respecto a C007–C010:** Lera deja de orientar cada actividad hacia un rumor, recado o refugio. Interviene por voluntad propia para que la niña explique lo que necesita de su capa, incluso arriesgándose a ser increpada por un adulto; **la intervención no es un encargo, ni sirve para localizar a Dalia**. Ve que buscar a alguien no equivale a controlar lo que decide la otra persona. Después, en lugar de pedir trabajo solo por hambre o prolongar la espera, **ofrece una habilidad contrastable** a una vendedora que ya la conoce y acepta equivocarse en público. Se compromete a **volver al día siguiente a solicitar una oportunidad**, no a ser contratada. Vinculación plausible con el Mercado sin tercero que milagrosamente conozca a Dalia. Cierre después de haber completado segunda cita y tomado la decisión material de explorar si puede quedarse en Vaisgard **con una vida independiente de que Dalia aparezca**.

**Frase canónica privada de C001 recuperada sin cambiarla:** «Si tanto quieres marcharte, aquí nadie va a echarte de menos»; no se añaden recuerdos incompatibles. La carta de C001–C002 sigue firmada y sin remitir, incluyendo «Te dije que no nos harías falta. No era cierto», y Lera reconoce derecho de Dalia a rechazar encuentro o perdón.

**NO sucede:** entrega del recorte de Nara, intervención de Arel, visita a archivo de cargas, mensajes nuevos/flags, nueva identidad o domicilio/empleo de Dalia, respuesta providencial, ascenso de nivel o regla de monetización laboral del juego. Ninguna información condicionada de Seli sobre acequia o rumor bajo el camino.

## 4. Inventario y costos acumulados después de C011

- **Carta a Dalia:** original seca, doblada y privada, dentro de chaqueta de Lera, no leída por terceros ni enviada.
- **Recorte de C008:** **con Nara**, sin confirmación de entrega a Dalia; no se publica, no se recrea copia nueva.
- **Carboncillo:** envuelto en tela desde C002, guardado, no utilizado.
- **Taza con asa torcida:** aún en bolsillo exterior de bolsa, no vendida ni prestada.
- **Cantimplora:** contiene un poco de agua, Lera bebe una cantidad pequeña al final del día 2; no se rellena ni se cuantifica fracción.
- **Bota/media:** siguen ligeramente húmedas del arroyo, mejorando gradualmente, sin que Seli o alguien las repare o proporcione cambio gratis.
- **Hombro:** sensible tras viaje y bolsa. **Palma:** raspadura previa y roce superficial por fibras C010; Seli observa irritación y **no** alienta labor con aguja sobre piel dañada. No curación mágica ni enfermar en un solo día.
- **Sellos:** finitos, gastados antes en pan/refugio C010 y ahora en una comida modesta, sin tarifa ni balance retrospectivo; no se obtiene salario, alojamiento o comida gratis en C011.
- **Trabajo:** NO hay contrato, jornada reservada, plaza, aprendizaje ni retribución con Seli o vendedora. **Día 3** queda una invitación a presentarse para una prueba de clasificación de fruta, sometida a consentimiento/pago por establecer; no confundir con oficio canónico del juego.
- **Tiempo:** cumplidos **dos atardeceres** conforme a conversación C009. Nada obliga a Lera a permanecer una tercera tarde en la piedra. Noche 2 por resolver; no se omite su necesidad, pero no se repite negociación de alojamiento en este capítulo.

## 5. Revisión y preparación del último tercio

- [ ] **Revisor Integral #707:** cotejar C011 íntegro con C009–C010 corregidos, reloj (noche 1 → día 2 → segundo atardecer), descanso sin cobijo, conflicto de capa/supuesto oficio adicional de Seli, fiabilidad del intercambio y si la decisión de vida urbana transforma de verdad el arco Dalia sin convertir el capítulo en sermón o tour. Puede microeditar minucias conforme permiso previo del propietario con SHAs, no reescribir ni alterar canon.
- [ ] **Arquitectura Editorial:** validar motivo de intervención, escena completa con resolución parcial, posible extensión real ~2.9k palabras **porque resuelve escena de capa, propuesta de habilidad y segunda cita**, sin corte abrupto ni alargar para cuota; decidir si C012 necesita un conflicto distinto del trabajo en mercado, ya planteado. Mantener provisionalmente 15 capítulos + prólogo sin rellenar forzosamente.
- [ ] **Historiador 02 #706:** cotejo puntual sobre **Seli** (`veyra_seli`) y si su papel episódico de costura de capa contradice el rol remendadora de toldos o toca un quest; no atlas ni reescritura.
- [ ] **Arquitectos Editorial y VT2:** co-decidir compatibilidad del uso de Seli, comercio privado y personajes literarios, además de prólogo y divergencia Saltalodo, antes de merge/publicación definitiva.
- [ ] **Director de Arte/EPUB #708:** prelectura paralela hasta C010 según prioridades propias; no declarar arte/Android/Drive aprobados por entrega C011 y no bloquear la accesibilidad del EPUB por nuevos manuscritos.

**WIP=1 — C012 NO AUTORIZADO, NO INICIADO.** PR #705 sigue DRAFT. No se modifican `vintage-telnet-2/`, código ni assets del juego.

## 6. Intervenciones menores directas por Editor Integral 03 — 15/10/2026

**Permiso:** autorización explícita del propietario y criterio de Arquitectura Editorial para pulidos de una frase (sin reenviar cada microcorrección al Escritor). El Editor leyó el capítulo completo sobre blob inicial `4cbfe9c3a6518d115c1a8738c6412839059da01a`.

- **L01 — pasado narrativo, RESUELTA.** «Durante parte de la noche dormitaría ... se despertaría ... volvería a acomodarse» → «Durante parte de la noche dormitó ... se despertó ... volvió a acomodarse». El tiempo verbal continúa la secuencia **noche 1**, seguida del amanecer del día 2, sin crear un futuro hipotético inadvertido.
- **L02 — Puerta de los Campos no visible directamente desde Plaza, RESUELTA.** «Al fondo se abría el camino hacia la Puerta de los Campos...» → «Más allá del mercado y de la calle de almacenes quedaba la Puerta de los Campos...». `veyra.json` confirma `veyra_plaza_rutas --sur--> vaisgard_mercado --oeste--> veyra_barrio_cargas --oeste--> veyra_puerta_campos`; la plaza sólo ofrece vista directa del mercado por el sur. Cambio de una línea sin alterar dirección ni memoria del viaje.
- **Manuscrito vigente:** `40e57cc711eaa889ca34a1fe0a36ea98f2a2f5e3`. Se conserva íntegra la escena de Seli, iniciativa de Lera con la vendedora, compra de comida, las dos noches distintas y **el segundo atardecer cumplido**. No se cambian personajes, ningún dato de Dalia, canon, quests ni runtime.
- **Dictamen Editor 03:** C011 **APROBADO LITERARIAMENTE SIN OBSERVACIONES MENORES PENDIENTES** sobre versión corregida. **Quedan pendientes** pronunciamiento del Arquitecto Editorial y **co-decisión Arquitectura Editorial + Arquitecto VT2** para canon compartido antes de fusión/publicación definitiva. C012 **NO autorizado** sin ficha nueva.
