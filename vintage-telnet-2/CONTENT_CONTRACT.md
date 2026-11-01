# Contrato de contenido del motor nuevo

El catálogo `content/world.json` es nuevo, escrito desde el canon y la ampliación autorizada. No importar módulos ni copiar las descripciones del motor anterior.

Objeto raíz: `version`, `regions` (por id), `rooms` (por id), `npcs` (por id), `creatures` (por id), `stories` (por id).

Sala: `id`, `name`, `region`, `kind` (`home`, `settlement`, `road`, `landmark`, `wilderness`, `interior`), `description` (geografía y orientación), `exits` (norte/sur/este/oeste a ids), `arrivals` (por origen opcional), `day` y `night` (actividad concreta), `rain` y `clear`, `return` (memoria de visita), `examine` (objetivo a texto), `npcs` (lista ids), `signals` (lista `{creature,text}`), `actions` (lista opcional).

NPC: `id`, `name`, `species`, `role`, `home_room`, `description`, `topics` (tema a respuesta), `day`, `night`, `memory` (por flag opcional). Intereses y trabajo deben corresponder a su cultura y ubicación. Los horarios no teletransportan personajes ni permiten hablar con alguien ausente.

Acción narrativa: `id`, `label`, `text`, `set_flags` (lista), `requires_flags` (lista), `forbids_flags` (lista), `scope` (`player` o `world`, predeterminado player), `next` (sala existente opcional), `journal` (texto opcional). Las acciones sociales no conceden números inventados de XP, monedas, estadísticas o botín. Las recompensas mecánicas existentes requieren contrato de Jugabilidad consumido por el backend.

Historia: `id`, `title`, `premise`, `steps` (lista de flags/textos de diario), `source` (canon anterior o ampliación autorizada). Todo flag utilizado debe tener significado en el mundo y al menos una consecuencia observable en texto, diálogo o acceso.

Región: `id`, `name`, `identity`, `settlement`, `species`, `weather` (variantes físicas) y `source`. Criaturas: datos canónicos y señales previas; sus valores de combate sólo entran desde el contrato cerrado de Jugabilidad.

### Crafteo y pesca v1

`recipes` registra recetas por id con `name`, `materials` (2–3 ids de materiales y cantidades), `seals` y `output` (ítem existente). Cada registro `crafting_stations.<sala>` tiene `id` igual al id de sala y el campo `npc` del servicio que debe estar presente. `fabricar <receta>` consume materiales y sellos y añade el resultado; `recetas` lista las opciones. Las ocho recetas actuales producen provisiones con el efecto ya existente, sin bonificaciones de combate.

Cada registro `fishing.<sala>` tiene `id` igual al id de sala y una lista `fish` de especies (`item` y `rarity`). La pesca v1 está limitada a las seis salas homologadas en `docs/VT2_PESCA.md`, usa el inventario y precio de venta existentes, tiene un intento personal cada 120 segundos, 3 de fatiga y agota el cardumen durante 900 segundos tras una captura. No pesca durante combate ni con fatiga desde 70; no genera daño ni encuentros.

La composición combina espacio, transición, hora, clima, actividad, amenaza y memoria con prioridad y ritmo; no concatena todas las capas en cada lectura ni sustituye escenas concretas por frases genéricas.

Piloto MUD clásico: `brief` es un resumen editorial opcional de la geografía permanente. Sólo se usa en navegación tras la primera visita; `mirar` devuelve siempre la descripción completa mediante un evento `LOOK`. Un estado que cambia `description` sin su propio `brief` descarta el resumen anterior. Lo mismo ocurre al cambiar la descripción por ausencia de una criatura. Las capas dinámicas, amenazas, acciones y salidas conservan sus contratos. El encabezado muestra el lugar; `LOCATION` permanece en el historial, sin repetirse en la terminal. No extender los seis resúmenes del piloto masivamente sin una revisión regional.

Extensiones integradas: `dawn`/`dusk` son actividades originales de amanecer/atardecer. `requires_time`, `requires_weather`, `forbids_weather`, `requires_npc`, especie/clase son guardas del servidor para observación, temas y acciones. `states:[{requires_flags,overrides:{description,day,dawn,dusk,night,rain,clear,weather,return,examine}}]` reemplaza hechos físicos obsoletos; `examine` mezcla objetivos. Los NPC admiten estados descriptivos equivalentes y `schedule`. Las acciones mundiales registran también `participated:<flag>` en quien actuó; una consecuencia pública no se atribuye automáticamente a otro personaje. `focus` y `max_layers` organizan prioridades de lectura (el límite incluye la descripción), con capas secundarias accesibles mediante observar.

Los encargos exigen visitas y `required_actions` nuevas por cada instancia. La fauna compartida tiene una sola salud y ronda, participación real, respuesta enemiga al objetivo principal y un material físico único; la huida usa una salida existente. Presencia local expira a los30 segundos; chat reciente a los10 minutos. La terminal permanece textual; las representaciones visuales opcionales usan el mismo estado autorizado del servidor.

La forja de Daro usa `forge_service` para presencia autorizada. Las armas del catálogo se compran como instancias con `catalog_id`; `price` y `sell_price` son del servidor. Venta de arma exige confirmación y otra pieza utilizable, y rechaza equipo activo. `condition:damaged_event` permite reparación excepcional8, sin activar Forja ni equipar. Fusión de objetos: acción `fusionar <objeto>` es exclusiva de la forja con el herrero presente (`forge_service`); exige dos instancias del mismo `catalog_id` de arma, armadura o bloqueo, cobrando sellos según el nivel destino y precio del objeto (+1: 25%, +2: 50%, +3: 100%) y materiales en varias unidades (+1: 5 espina_espinajo, +2: 5 placa_cascapedernal, +3: 3 escama_dragon; el herrero indica qué falta y dónde conseguirlo). Consume una instancia, sellos y materiales exactos, y mejora la otra con campo `fusion` +1 (máx +3), sufijo ' +1/+2/+3' en su nombre, bonificación mecánica real (+2 daño por nivel en armas, +0.02 reducción en armadura/bloqueo) y mayor valor de venta (`sell_price` sube +50% por nivel de fusión, visible en la ficha). Conserva el equipo activo si una de las dos piezas estaba equipada y exige confirmación previa mostrando coste de sellos y materiales. Arquitectura completa: docs/ARCHITECTURE.md.

El snapshot de mapa conserva `nodes`/`edges` y añade `routes:[{from,to,direction,points}]` sólo para parejas recorridas, con direcciones derivadas de las salidas reales. No supone que volver siempre use el punto cardinal opuesto. `frontiers:[{from,direction}]` contiene salidas del lugar actual sin recorrido registrado y nunca el destino oculto. El hogar conserva su propia identidad aunque el personaje esté fuera. La brújula HTML es local y el plan sólo usa conexiones aprendidas; sólo recibe coordenadas de salas conocidas y trazados de conexiones aprendidas; no recibe el atlas global ni distancias inventadas.

`content/spatial.json` fija posiciones esquemáticas únicas para todas las salas y reserva un hogar por región. Sus caminos usan unidades de cuarto de casilla; las salidas de las salas siguen siendo la autoridad de navegación. Descubrir nuevos lugares no recalcula calles existentes. Los cruces gráficos sin conexión se dibujan con una interrupción, sin inventar puentes o túneles. El servidor traduce únicamente el hogar del personaje y entrega geometría sólo de rutas recorridas. Contenido técnico sin atlas conserva el renderizado de compatibilidad.

## Extensión autorizada: exploración y láminas

`regions.<id>.search` contiene `finds` (item y texto), `traces` y `empty`. `rooms.<id>.wildlife_pool` contiene señales locales; sólo se sortea al llegar/buscar. Nuevos campos se inicializan de forma compatible con partidas existentes. `creatures.<id>.illustration` es opcional y sólo se entrega en entradas del bestiario ya descubierto. El arte está autorizado en bestiario; el lector permanece textual. `map.nodes[].unexplored_directions` sólo contiene direcciones de salidas sin recorrer desde lugares visitados, sin IDs ni nombres de destinos.

## Extensiones de campaña nocturna

`exit_requirements.<direction>` utiliza `requires_flags` y `text`; las acciones de presentación están en el mismo acceso y el motor conserva excepciones de origen/recuperación. Acciones y temas admiten `requires_items`, `consume_items`, `give_items` como diccionarios itemID:cantidad. Sus premios persistentes deben tener `forbids_flags`/`set_flags`. `combatant_kind:human` distingue salteadores de fauna: sin bestiario ni materiales animales. `honing_material` señala un material del catálogo para el afinado común; no representa poderes de Forja.

`rooms.<id>.buy_items` es una lista opcional de materiales aceptados por el comprador presente. Si se omite, se conserva la aceptación anterior; si se declara, el motor sólo ofrece ventas cuyo `catalog_id` esté incluido. Los préstamos para encargos usan `kind:quest` sin `sell_price`, distinto del material común de la misma procedencia. Los mercados regionales pueden tener catálogos diferentes sin crear precios nuevos.

Los lugares de cuidados nuevos usan `safe:true`, `recovery_service:true` y `recovery_npc:<npcID>`. El cuidador tiene `home_room` en ese lugar y presencia real; la identificación opcional permite conservar el servicio booleano de Valdren. La recuperación mantiene coste y efectos del contrato anterior, sin añadir poder a la especie ni a la clase.


## Representación visual y continuidad de visitas

`client/world3d.js` materializa únicamente nodos y rutas aprendidos del snapshot. Las posiciones del mapa son esquemáticas; los pasos y las salidas siguen procediendo del servidor. Three.js se carga cuando se abre una vista 3D, con licencia MIT local. El mapa HTML y las ilustraciones permanecen disponibles cuando WebGL no está disponible o pierde su contexto. Por decisión posterior de Javier, el bestiario usa texto e ilustraciones 2D; los modelos de figura 3D se muestran sólo para especies. El mapa 3D sigue siendo una vista de orientación del mundo descubierto.

Las condiciones admiten `requires_visits:{min,max}`, relativo al contador existente de la ubicación actual. Consultarlas no incrementa visitas. Los estados de habitación pueden sobreescribir `focus` además de las descripciones y horas. La prioridad editorial nunca desplaza un peligro presente ni una memoria relevante; los regresos alternan espacio con clima y actividad sin ampliar el presupuesto normal de tres capas. Los estados de tareas cotidianas se escriben antes de los estados de misión, que conservan su precedencia y sus flags personales o compartidos.

Las amenazas regionales usan `prepared_action` con nombre, aviso `tell`, precisión, frontalidad e interrupción explícitos. Sus diferencias cambian qué capacidades sirven en la primera respuesta; los perfiles conservan sus cifras. La ayuda del botón describe el efecto real, incluida una preparación que no se puede interrumpir.

Personaje: `gender` puede ser `masculino` o `femenino`; partidas anteriores y clientes anteriores sin selección conservan `null`. La interfaz pide elegir durante creación y permite guardar la elección con `/api/character/profile`, sólo para el personaje seleccionado perteneciente a la cuenta. No altera especie, clase, atributos o inventario; modelos de especie no infieren ni determinan el género.

Las memorias persistentes compiten por atención en revisitas: se destacan al inicio y periódicamente usando el contador existente. El estado causal nunca se pierde ni se escribe durante una lectura del narrador. Amenazas siempre conservan prioridad.

Conversaciones: `dialogue_memories` se inicializa al hablar y evita repetir el mismo recuerdo en cada tema de una misma visita. Un tópico contextual ya expresa su hecho; en los otros temas el recuerdo se muestra una vez por NPC/visita/contexto. Cambiar el flag del recuerdo permite reconocer el nuevo hecho sin salir del lugar. Nunca se marca memoria al consultar GET.

Descansar conserva exactamente sus límites existentes. La acción anticipa efectos mediante una copia numérica del estado; cuando ni vida ni fatiga cambiarían, queda deshabilitada y la API rechaza el intento sin afectar recursos. Se explica provisión/cuidados al agotarse el margen.

Las salas pueden declarar `absent_creatures: {creature_id: overrides}` para describir las consecuencias locales cuando `world.deaths[room:creature]` sigue activo o la criatura está refugiada. Sólo se aplican campos narrativos description/dawn/day/dusk/night/examine; los detalles examine se combinan con los existentes. Cuando vuelve una criatura presente, se restablece el texto normal. Las acciones de contacto y evaluación requieren presencia viva; una huella persistente no autoriza evaluar, examinar la criatura ni combatirla.

## Variantes de ilustración por estado

Los estados de sala pueden resolver `overrides.art_variant` con las mismas guardas
personales o compartidas que su descripción. El snapshot de la sala actual expone
únicamente la variante resuelta; no entrega flags ni destinos desconocidos.
`placeArt` selecciona una pareja de archivos finales registrada por ID de sala y
variante. Una variante desconocida conserva la vista base. Las vistas del mapa
sin estado actual conservan su representación base. Hora y clima siguen siendo
representativos y se explican en la lectura. El manifiesto
`client/art/place-variants.json` registra rutas, SHA-256, tamaño y dimensiones;
los originales de producción permanecen fuera del repositorio.

Las miniaturas del bestiario son vistas ligeras de ilustraciones ya integradas.
El cliente selecciona únicamente archivos del mapping cerrado
`client/art/bestiary-thumbnails.json`; el snapshot sigue entregando las mismas
criaturas descubiertas y sus ilustraciones completas. Ampliar usa el original.
Ilustraciones anteriores sin mapping mantienen su archivo completo.

Las acciones admiten `requires_examined:[objetivo]`: exige haber examinado esos objetivos en la sala actual. El motor conserva la observación personal en `state.examined` por ID de sala; mirar y observar no la conceden, ni se escribe durante consultas GET. Los alias por palabras clave sólo resuelven acciones locales y conservan todas sus guardas; las coincidencias ambiguas ofrecen sugerencias sin ejecutar acciones.

El bestiario expone `behavior:[texto]` por criatura descubierta. Examinar una
criatura viva aprende un solo texto todavía no registrado, en orden `warning`,
`presagio`, `habitat`, usando la prosa local resuelta
cuando existe. Conserva literalmente el contenido y descarta duplicados y la
misma descripción de la ficha. Observar aprende un dato de la primera criatura
viva examinable de la sala; mirar y las lecturas GET no enseñan datos. La entrada
persistente guarda los textos aprendidos, incluidos los de otras localidades;
partidas anteriores exponen una lista vacía hasta aprender. Si no queda ningún
dato local nuevo, el evento lo indica. Las personas no entran en el bestiario.

## Contrato de combate por clases y acciones disponibles (Fase 1 Motor)

El motor expone en `engine.actions()` (consumido por `/api/state` en el array `actions`) las acciones disponibles de combate para que el cliente pueda renderizar un botón por acción (Fase 2).

### Formato de cada acción de combate en `actions`
Cada elemento de acción expuesto en combate incluye:
- `id`: identificador de la acción.
  - Juramentado: `guardia_comprometida`, `paso_ruptura`.
  - Arcano: `impulso_arcano`, `velo_contencion`, `destello_frio`.
  - Sombra: `borrar_foco`, `golpe_apertura`, `distraccion`.
  - Artífice: `tiro_interrupcion`, `traba_campo`, `balsamo_campo`.
- `label`: etiqueta para el botón de la interfaz (ej. "Guardia Comprometida", "Velo de Contención").
- `description`: descripción breve y funcional del efecto mecánico.
- `disabled`: booleano (`true` si está en recarga o no cumple requisitos de arma/contexto; `false` si está disponible).
- `reason`: texto explicativo de recarga (`"Recarga: N rondas"`), impedimento o descripción funcional.

### Compatibilidad con `capacidad`
Las peticiones o estados anteriores que envíen `id: 'capacidad'` son mapeados de forma transparente a la acción insignia equivalente de la clase (`guardia_comprometida`, `impulso_arcano`, `borrar_foco`, `tiro_interrupcion`).

### Ajuste de canon del Arcano
El Arcano **no activa mecanismos antiguos** ni manipula compuertas mecánicas; su interacción en exploración (`requires_classes: ["arcano"]`) se limita a revelar resonancias, marcas, inscripciones o pistas ocultas sin explicar quién las hizo.

## Progresión de atributos y asignación de PA (Fase Motor y API)

Al subir de nivel, el personaje recibe 2 Puntos de Atributo (`pa`). Los puntos acumulados se reflejan en `state.character.pa`.

### Asignación vía API
El cliente asigna puntos enviando una acción estándar a `POST /api/action`:
- `id`: `"atributo"`
- `target`: nombre del atributo a mejorar (`"fuerza"`, `"resistencia"`, `"agilidad"`, `"percepcion"`, `"intelecto"`, `"voluntad"`, `"destreza"`, `"presencia"`).
- `confirmed`: `true` (requerido para confirmar el gasto irreversible de PA).
- `request_id`: identificador único de la petición (8–120 caracteres).

Escala de coste en PA según el valor actual del atributo:
- Valor < 20: 1 PA por punto.
- Valor 20–34: 2 PA por punto.
- Valor 35–44: 3 PA por punto.
- Valor 45–59: 4 PA por punto.
- Valor >= 60: 5 PA por punto.

### Efectos de atributos expuestos en `/api/state`
`snapshot.character.attribute_effects` (y a nivel raíz `snapshot.attribute_effects`) expone un diccionario `{atributo: frase}` con la descripción funcional de cada atributo en una frase para la pantalla de personaje.

### Guarda de contenido `requires_attribute`
Las acciones de sala, temas de conversación de NPCs, exámenes y requisitos de acceso admiten la guarda `requires_attribute: {<atributo>: <mínimo>}` (o su variante plural `requires_attributes`). El motor la evalúa en `allowed()`. Opcionalmente, las acciones narrativas pueden definir `soft_check: {attribute, dc, fail_text, fail_fatigue, success_text}` como una tirada suave que aporta matices narrativos y leve coste de fatiga sin bloquear jamás el progreso principal.

## Experiencia por descubrimiento (decisión de Javier, 2026-10-14)

El motor concede una sola vez por personaje: sala nueva 1 XP (excepto hogar),
secreto del catálogo 10, texto nuevo del diario 3, cierre 25, encargo 15 y dato
nuevo de conducta 3. La tabla `EXPLORATION_XP` vive en `server/mechanics.py`.
Los encargos dan XP al pasar a `ready`; cobrar y repetir el mismo ID no vuelven
a concederla. El cierre se reconoce por el flag del último paso de `stories`,
por flags `hilo`/`arco` terminados en `completado`, `concluido`, `cerrado` o
`resuelto`, o por entradas de diario que comienzan con «Cierre»/«Conclusión».
Las fuentes distintas pueden sumar premios; varias historias con el mismo flag
final cuentan como un único cierre. Un diario de cierre y un flag final nuevos
en la misma transición reciben un solo premio de cierre. Un flag mundial sólo cuenta con participación
personal. La XP de combate y la curva de niveles se conservan.

`state.exploration_xp` guarda los identificadores premiados en el JSON persistente.
Se inicializa con los logros anteriores a la primera acción, sin XP retroactiva;
la carga y las lecturas sin transiciones no conceden premios ni migran el estado.
Cada premio muestra `+N experiencia: <motivo>` y usa la subida de nivel existente.
La calibración aislada de todas las salas, diarios y secretos de origen más un cierre
alcanza entre los niveles 3 y 4 para las cinco especies, sin combate.
Es una prueba de balance del motor con transiciones sintéticas, no un recorrido
humano ni una validación de producción; otras pistas y encargos suman XP.

## Revisión del Bastión — 2026-10-14

Acceso desde nivel 3, incluido el disco de Brumak. La cornisa admite asegurar
la cuerda sin requisito de clase y la primera consola admite equilibrar su
contrapeso con Intelecto 10. El Arcano revela las marcas del caudal; la cadena
se acciona a mano, sin activar mecanismos mediante magia.
La salud del dragón se conserva en `world.creature_states` tras retiradas y
recargas; al vencer queda en cero y `dragon_vencido` impide otro encuentro.
Cada participante cobra una vez su arma de clase, joyas y escama o colmillo.
Las pruebas recorren todas las salas y cinco combates con arcanos de nivel 3
(humano, felaryn y pareja), usando tiradas favorables deterministas: demuestran
accesibilidad y resolución, sin estimar probabilidad de victoria ni certificar producción.

## Variantes de Númen y compañero del DM — 2026-10-16

Un vínculo puede guardar `variant`; su arte usa
`client/art/numenes/numen-<modelo>-<variant>-v1.webp` con caída al arte normal
si falla la carga. Sin variante conserva el archivo del modelo.
El login de Vaisork asegura Senku (modelo b, variante senku), confianza 3,
alimentado, descansado y activo. Reutiliza su vínculo b y conserva los demás;
si el roster ya está completo, este compañero del DM puede exceder el límite.
La ficha y tarjeta del DM muestran los vínculos aprobados en lectura: nombre,
especie, activo y ánimo calculado con el reloj del servidor. El resumen de otros
personajes se sirve únicamente en `/api/master/state`, con sesión master.
