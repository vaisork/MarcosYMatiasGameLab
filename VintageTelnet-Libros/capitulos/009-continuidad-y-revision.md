# Capítulo 009 — Continuidad, fuentes y revisión

**Libro I:** *Crónicas de Vaisgard — El primer camino*. **Responsable:** `escritor-aventuras-vaisgard-01`, [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705).  
**Manuscrito:** [009 — El aviso y la respuesta](009-el-aviso-y-la-respuesta.md), **2,535 palabras** (encabezado incluido), Git blob **`8116313f9394e50089d68bc09351b8f4892400eb`**.  
**Autorización formal y única del Arquitecto Editorial:** `../plan/DECISION_CIERRE_C008_Y_AUTORIZACION_C009_2026-10-15.md`.  
**Estado:** C009 **borrador completo pendiente dictamen literario** por Arquitectura Editorial y Revisor 03. **C010 NO iniciado/no autorizado; WIP=1**. PR draft y co-decisión Arquitecto Editorial + Arquitecto VT2 aún pendiente antes de fusionar/publicar.  
**Predecesor:** C008 blob `e3ee67a0399b3737a4b1992abdd1089b9d46bbee`, matriz `2aeb7c9d8d3b54227db8044eb8fa2a543c18dfa4`, **aprobado literariamente** tras L01/L02 corregidas por Revisor 03.

## 1. Geografía comprobada

1. **Inicio literal del C008:** Lera se encuentra en `veyra_plaza_rutas`, acercándose al alero oriental, **no** dentro de `veyra_patio_senales`. C009 cruza efectivamente `veyra_plaza_rutas.exits.este → veyra_patio_senales`, tal como exige ficha.
2. **Patio de Mensajes:** `vintage-telnet-2/content/regions/veyra.json > rooms.veyra_patio_senales.description` respalda travesaños y tablillas ordenados por ruta, madera gastada/nueva, banco y armazón. Actividad de dos mensajeras que descifran y reescriben letra, y gente al alero, procede de `.day` y `.rain`. **No** examina el `hueco` condicionado ni revela memoria/secretos.
3. **Salida:** Lera regresa por `veyra_patio_senales.exits.oeste → veyra_plaza_rutas`. En la Plaza reconoce una gran piedra-banco hacia el lado del Mercado donde C008 descansó; no viaja al Archivo de Cargas, Mercado ni otros barrios en este capítulo.
4. **Final:** Lera termina **en la Plaza de las Cinco Rutas**, junto a la piedra que designa para estar localizable los **dos próximos atardeceres**. Es **compromiso privado de novela**, no una actividad, cita o reloj del runtime; el número de atardeceres es concreto, no se inventa distancia entre salas.

## 2. Hechos abiertos y canon VT2

| Elemento usado | Fuente exacta | Alcance |
|---|---|---|
| Salida al este de Plaza y retorno al oeste desde el Patio | `content/regions/veyra.json > rooms.veyra_plaza_rutas.exits.este`, `rooms.veyra_patio_senales.exits.oeste` | CONFIRMADO / público |
| Gran plaza, piedras-banco, voces de cinco rutas, actividad de niños | `rooms.veyra_plaza_rutas.description`, `.day` | CONFIRMADO / público; sin adjudicar origen, fecha ni constructor |
| Patio con tablillas por ruta, banco, alero y notas | `rooms.veyra_patio_senales.description`, `.day` | CONFIRMADO / público |
| Arel es mensajera Vesperi que recibe recados y separa fundas | `npcs.veyra_arel.name`, `.species`, `.role`, `.description`, `.day` | CONFIRMADO / personaje canónico, diálogo NUEVO solo literario |
| Arel necesita información sobre procedencia/destino antes de repetir mensajes | `npcs.veyra_arel.topics.mensajes` y `.espera` **sólo como marco de personalidad pública**, sin ejecutar `actions` | COMPATIBLE; no representa haber cursado una quest |
| Al norte/sur/oeste de plaza rutas públicas | `rooms.veyra_plaza_rutas.look`, `.exits` | CONFIRMADO / observación ambiental |

## 3. Aportes nuevos exclusivamente literarios

- **Problema práctico nuevo:** la carta de Lera está dirigida nominalmente a Dalia pero **sin ubicación de entrega**. Arel no acepta esa falta de destino como un despacho real, no promete averiguar identidad/paradero, no recibe carta ni la inscribe en tabla. No existe una oficina de búsqueda de personas ni trámite inventado.
- **Conversación personal con Arel:** Arel escucha a Lera y, ante petición concreta, dice que **solo si alguien le pregunta directamente a ella, si sigue allí y lo recuerda**, puede contar que vio a «Lera de Valdren» y repetir **dónde y cuándo Lera ha autorizado que la busquen**. Esto **no es servicio oficial, acción automática del juego, registro ni garantía futura**; revisar su verosimilitud como diálogo compatible con `npcs.veyra_arel.role` antes de integrar canon.
- **Límite de privacidad:** Lera solo permite pronunciar **su nombre, procedencia y cita elegida**. No autoriza hacer público nombre/paradero, motivos íntimos o biografía de Dalia, ni leer la carta. No se origina nuevo recado escrito ni se reproduce/consume papel ilimitado.
- **Decisión con costo real:** Lera elige **dos atardeceres junto a una piedra específica de la Plaza**. Renuncia por esos periodos a seguir buscando en nuevas rutas, y deberá administrar sellos/comida/refugio durante la espera; **no fija un gasto, precio de alojamiento o existencia de posada**. La escena no declara haber comprado alojamiento ni comida.
- **Crisis afectiva:** Lera contempla que Dalia podría **rechazar la carta** y que encontrarla no garantiza reconciliarse. No se introduce hecho conocido sobre sentimientos actuales de Dalia ni se predice la respuesta. Arel **no prescribe** una regla de entregas ni dicta la decisión de Dalia.
- **Gente ambiental:** niña que cuenta tablillas, viajeras con recados y gestos urbanos; todas apariciones de novela sin NPC persistente, encargo o flag.

## 4. Recursos personales, actos y afirmaciones que NO ocurren

| Recurso / vínculo | Estado tras C009 |
|---|---|
| Carta original a Dalia | Seca, privada, sin enviar; dentro de la chaqueta de Lera. Revisión con carboncillo ocurrió en Valdren C001–C002; aquí no se altera el texto. |
| Carboncillo | Sigue guardado, **no se usa para crear otra nota**. |
| Recorte con «Lera, de Valdren...», C008 | **Con Nara**. No hay confirmación de entrega, lectura por Dalia, copia o nueva mensajería. |
| Cantimplora | Conserva **un poco de agua**, sin cuantificar mitad, precio o capacidad; no se rellena. |
| Taza de madera con asa torcida | En bolsillo exterior de la bolsa. |
| Heridas, ropa | Palma superficialmente raspada, hombro sensible; bota/media siguen húmedas pero se secan poco a poco. No hay curación automática. |
| Iven / Nara | No reaparecen en escena, no mandan noticias, no localizan a Dalia ni cobran servicios. |
| Arel / Nera | Solo aparece Arel en actividad pública. **Nera no aparece; no se entra en `veyra_archivo_cargas` ni se leen registros de cargas/personas**. |

**NO se ejecutan** `veyra_atribuir_mensaje`, `veyra_recados_copia`, `veyra_recados_turnos`, `veyra_recados_pedido`, `veyra_piedra_hueco`, `veyra_aclarar_demora`, acciones/flags/memorias condicionadas de `veyra_arel` o `veyra_nera`. No se revela `examine.hueco` ni se usa el tema reservado de `talla`. Las coincidencias de personalidad/motivación pública no constituyen activación de flags.

## 5. Tensión literaria y preparación del siguiente capítulo

**Cambio respecto de C008:** C008 obtuvo testimonio incompleto y dejó recorte con Nara; C009 plantea problema distinto, **cómo hacer que Lera sea encontrable sin saber dónde está Dalia ni poder exigir una carta ajena**. La elección no depende de un **tercer testigo casual** y no inventa un mensaje de Dalia.

**Final exacto:** Lera eligió estar **mañana y pasado mañana al caer la tarde** junto a una piedra-banco de la Plaza cercana al lado del Mercado. Eso crea **obligación y riesgo de pérdida de tiempo/recursos**: no hay garantía de noticias ni de poder pagar estancia y comida. El futuro C010 deberá respetar la elección de dos atardeceres; no adelantar una entrega o encuentro sin ficha/autorización.

**Cotejos pendientes:**
- [ ] **Editor Integral 03 (PR #707):** lectura total de C009, voz adolescente, ritmo, distinción entre conversación personal de Arel y servicio público, naturaleza de compromiso verificable, no repetir moraleja del rumor C005 ni convertir placa/tablilla en GPS narrativo. Autorizado por propietario a editar microcorrecciones directamente con registro, nunca reescritura ni hechos canónicos nuevos.
- [ ] **Arquitectura Editorial:** validar motor de espera y costo, cierre de C009 y considerar solo después ficha de C010.
- [ ] **Historiador 02:** cotejo mínimo si aparecen nuevas dudas de Arel, sin atlas nuevo.
- [ ] **Arquitecto VT2 + Editorial:** co-decidir compatibilidad de sucesos privados, diálogos ficticios de Arel, Iven/Nara/Dalia, prólogo legado VT1, secretos públicos/condicionados y divergencia Saltalodo antes de fusión/publicación final.
- [ ] **Arte/Publicación 04:** prelectura EPUB interna **hasta C008** en circuito propio y acceso privado Android/Drive son tareas independientes; no declarar traslado a Drive sin comprobación.

**WIP=1:** prohibido comenzar C010 hasta nueva decisión formal. Solo archivos `VintageTelnet-Libros/` en rama de Escritor; no alterar juego, arte, infraestructura o otros agentes.
