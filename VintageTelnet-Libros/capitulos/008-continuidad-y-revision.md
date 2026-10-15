# Capítulo 008 — Continuidad, fuentes y revisión editorial

**Texto:** [008 — La plaza de las cinco rutas](008-la-plaza-de-las-cinco-rutas.md).  
**Responsable:** `escritor-aventuras-vaisgard-01`, [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705).  
**Estado:** **BORRADOR ENTREGADO PARA DICTAMEN**, sin aprobación del Capítulo 8 todavía. **WIP=1: C009 NO iniciado ni autorizado**.  
**Longitud:** **2,643 palabras** incluido título.  
**Blob de manuscrito:** `cbdf7abbc0311ce383588c8050958e5f9f871b1e`.  
**Autorización expresa:** `../plan/DECISION_C007_PRIORIDAD_MAQUETA_Y_ARRANQUE_C008_2026-10-15.md` (Arquitectura Editorial).  
**Texto previo:** C007 `6aca35d8ca12704ce189e70349d8740c6c4b3f61`, **aprobado literariamente por Arquitectura Editorial** con observación L01 resuelta; matriz anterior `739f58bef51ea28a843c9154afdc7eac00100fc3`.

## 1. Progresión literaria objetiva

**Inicio:** C007 termina con Lera en **límite norte del Mercado** `vaisgard_mercado`, mirando la Plaza sin haber entrado. C008 comienza dando el paso al **norte → `veyra_plaza_rutas`**. Plaza grande con rocas antiguas usadas como banco, niños, personas de distintas especies y cinco rutas concurridas. No se afirma fundador ni fecha de las piedras. Los sonidos del alero oriental y el patio de animales al oeste tienen base en `veyra_plaza_rutas`.

**Búsqueda y giro:** tras tres negativas en C007, Lera **no repite preguntas indiscriminadas**. Busca a alguien que conozca los huertos y el reparto de agua de **Valdren**. Interactúa con un niño **anónimo**, ficción cotidiana breve (broma por la bota mojada, sin personaje fijo). Luego conoce a **Iven**, viajera anónima ficcional de Valdren, quien **reconoce a una Dalia de ese pueblo** por su recuerdo de alguien preocupado por una amiga que seguía junto a una canaleta de riego. Iven reconoce **no recordar nombre de la amiga, día exacto ni destino**; se trata de testimonio privado nuevo y no verificación del mundo VT2. Iven señala a Nara como posible testigo de un tramo del viaje, **no** como funcionaria ni intermediaria oficial.

**Conexión verificada:** Lera entra al **oeste** de la plaza, `veyra_plaza_rutas → veyra_patio_porte` («Patio de los animales»), donde hay bebedero, argollas y animales de carga. Cuidador y porteadora Dravak están en ambientación pública; no reciben fichas nuevas ni realizan quest. Lera conoce a **Nara**, otra viajera ficcional que había andado **un tramo del camino desde Valdren con Dalia**, sin acompañarla hasta Vaisgard ni conocer su paradero. Nara recuerda que Dalia **preguntó cómo hacer llegar una carta de vuelta a un pueblo**. No vio ni leyó carta, no sabe destinatario y no afirma que fuera dirigida a Lera. No se adjudica lugar de trabajo, residencia urbana, familia, empleo fijo o estatus de NPC a Dalia. **Información nueva para trama exclusivamente literaria, pendiente co-decisión de canon.**

**Decisión y coste:** Lera decide dejar en manos de Nara **un recorte de papel nuevo distinto de la carta para Dalia**, con su nombre, procedencia y deseo de hablar con Dalia. Usa el **carboncillo que llevaba**. El texto exacto del recorte queda dentro del capítulo y NO contiene la carta personal. Nara acepta guardarlo y **solo transmitirlo si encuentra ocasión** con alguien que conozca a Dalia. No hay garantía de entrega, plazo, recompensa, compra ni oficina de búsqueda. **Coste dramático concreto:** Lera pierde control sobre un mensaje con su identidad y su búsqueda; puede viajar a otra persona, tardar o no llegar. **Coste material menor:** emplea un recorte y carboncillo ya disponibles, sin fabricar recursos nuevos mágicamente.

**Regreso:** Nara se ocupa de sus asuntos. Lera retorna **al este** por `veyra_patio_porte → veyra_plaza_rutas`, reflexiona brevemente sobre el riesgo asumido y se dirige hacia el alero **oriental**, cerca de `veyra_patio_senales`; **NO entra en el archivo ni usa servicios, flags o quest**. Al cierre **no se afirma ingreso consumado al Patio de Señales**: queda acercándose desde la Plaza; C009 deberá decidir ruta e interacción. La carta original continúa privada y sin enviar. Nadie localiza a Dalia.

**Estado físico/objetos al cierre:** bota y media siguen algo húmedas (bota temporalmente retirada para airearse), pequeña raspadura palma, hombro sensible, cantimplora parcialmente llena sin consumo narrado, taza de madera con asa torcida en bolsa, carta seca en chaqueta, carboncillo disponible; **recorte con nombre en poder de Nara**. No se cura mágicamente, no obtiene nueva provisión ni paga sellos. La lluvia del trayecto ya pasó.

## 2. Matriz de canon ABIERTO / CONFIRMADO del videojuego

| Elemento usado | Fuente en `vintage-telnet-2/content/regions/veyra.json` (main) | Alcance |
|---|---|---|
| Mercado conecta norte a Plaza de las Cinco Rutas | `rooms.vaisgard_mercado.exits.norte = veyra_plaza_rutas` | ABIERTO / confirmado |
| Plaza extensa, rocas antiguas lisas, niños como bancos, voces de cinco rutas | `rooms.veyra_plaza_rutas.description` | ABIERTO / confirmado; acciones puntuales en prosa son privadas |
| Felaryn saltan, Dravak empujan carretillas, Marevyn llevan pelo húmedo, mensajera con avisos | `rooms.veyra_plaza_rutas.day` | ABIERTO / confirmado, sin asignar identidad ni generalizar rasgos culturales |
| Al oeste patio de animales, al este alero de avisos | `rooms.veyra_plaza_rutas.exits.oeste = veyra_patio_porte`, `.exits.este = veyra_patio_senales`; `.description` | ABIERTO / confirmado |
| Patio: animales de carga y bebedero, argollas, cinchas | `rooms.veyra_patio_porte.description`, `.day`, `.examine.cinchas` | ABIERTO / confirmado |
| Patio de animales al este retorna a Plaza | `rooms.veyra_patio_porte.exits.este = veyra_plaza_rutas` | ABIERTO / confirmado |
| Tablillas bajo alero oriental; mensajes como parte pública de la ciudad | `rooms.veyra_plaza_rutas.description`, `rooms.veyra_patio_senales.description` | ABIERTO / confirmado, **no se ejecutan acciones** |
| Piedras viejas y desconocimiento de su fundación | `rooms.veyra_plaza_rutas.description` | ABIERTO; ningún nombre de fundador ni cronología |

## 3. Ficción privada propuesta y límites de aprobación

| Elemento | Estatus / restricción |
|---|---|
| Iven, exhabitante de huertos de Valdren y viajera, su memoria sobre Dalia y una amiga de canaleta | **PROPUESTA EXCLUSIVA DE LA NOVELA.** No es NPC, misión ni registro del juego. Iven no sabe dónde está Dalia. El recuerdo no demuestra sin duda que toda Dalia del mundo sea la misma persona, aunque Lera lo considere plausible. |
| Nara, viajera que caminó con una Dalia un tramo de salida de Valdren; pregunta de Dalia sobre enviar carta | **PROPUESTA EXCLUSIVA DE LA NOVELA** con peso de biografía privada; someter explícitamente al Arquitecto Editorial + Arquitecto VT2. Sin residencia/profesión/familia de Dalia, sin prueba de destinatario de la hipotética carta, **sin ubicación actual**. |
| Recorte de papel de Lera a Nara | Acto privado consentido. NO emplea la infraestructura de mensajes del videojuego ni activa `veyra_atribuir_mensaje`, `veyra_recados_pedido` u otros flags; la carta principal sigue cerrada. No garantiza un resultado futuro. |
| Niño de plaza, cuidador del patio, viajeros, diálogos, testimonios y humor de bota | Detalles cotidianos **solo libro**; no insertar nuevos NPC oficiales, reglas de horario, bienes vendidos o servicios públicos. |
| Comparación con hechos personales de Valdren | Recuerdo literario situado en huertos/turnos, **no** nueva prueba del runtime ni canonización de eventos del juego. |
| La frase sobre buscar una amiga cuidadora de canaleta | **Antecedente privado nuevo** de Dalia y Lera; debe recibir revisión por coherencia con C001–C007. No convertirlo en promesa comprobada de reconciliación. |
| Origen de piedras, galerías, secretos por especie | **Reservado / fuera de C008.** No afirmar quién construyó Vaisgard, no describir secretos ni quests urbanas. |

## 4. Evaluación literaria y riesgos para Revisor 03

- [ ] **Arquitectura Editorial:** comprobar si testimonio de Iven y Nara gana el avance dramático sin dar un salto milagroso a Dalia ni resolver relación; valorar ritmo real de capítulo y coste de dejar el recorte firmado.
- [ ] **Editor Integral 03 (PR #707):** lectura íntegra sobre SHA citado; revisar credibilidad de los dos testigos y la coincidencia biográfica, tiempo verbal y peso del recuerdo privado; continuidad de prendas/objetos; localización plaza→patio oeste→plaza y visibilidad alero este; evitar un sermón o repetición de rumores de C005.
- [ ] **Historiador 02 (PR #706):** sin atlas adicional; cotejo puntual sólo si se detecta conflicto en `veyra_patio_porte`, rol del cuidador/porteadora o uso de mensajes no oficiales.
- [ ] **Arquitecto VT2 + Arquitecto Editorial:** registrar propuesta, evidencia, tensiones, decisión y alcance de Iven, Nara y los nuevos recuerdos de Dalia como **exclusivamente literarios**. La historia no puede fusionarse/publicarse como definitiva hasta su co-decisión.
- [ ] **Publicador 04 (PR #708):** el EPUB provisional de **prólogo + C001–C007** se entrega por circuito propio y **NO depende del estado C008**. Integrar C008 sólo tras visto bueno y autorización de un nuevo lote; no afirmar que QA/arte final ya están aprobados.

**Próximo capítulo:** **C009 NO autorizado.** Punto de arranque exacto: Lera desde `veyra_plaza_rutas`, aproximándose al alero este; sin entrada a archivos ni conocimiento de Dalia. Decisión de avanzar sólo con ficha de Arquitectura Editorial.

No se modifican `vintage-telnet-2/`, estados del juego, assets, otros repositorios ni texto de otros agentes. Esta PR permanece DRAFT.
