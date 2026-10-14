# Contrato de contenido del motor nuevo

El catálogo `content/world.json` es nuevo, escrito desde el canon y la ampliación autorizada. No importar módulos ni copiar las descripciones del motor anterior.

Objeto raíz: `version`, `regions` (por id), `rooms` (por id), `npcs` (por id), `creatures` (por id), `stories` (por id).

Sala: `id`, `name`, `region`, `kind` (`home`, `settlement`, `road`, `landmark`, `wilderness`, `interior`), `description` (geografía y orientación), `exits` (norte/sur/este/oeste a ids), `arrivals` (por origen opcional), `day` y `night` (actividad concreta), `rain` y `clear`, `return` (memoria de visita), `examine` (objetivo a texto), `npcs` (lista ids), `signals` (lista `{creature,text}`), `actions` (lista opcional).

NPC: `id`, `name`, `species`, `role`, `home_room`, `description`, `topics` (tema a respuesta), `day`, `night`, `memory` (por flag opcional). Intereses y trabajo deben corresponder a su cultura y ubicación. Los horarios no teletransportan personajes ni permiten hablar con alguien ausente.

Acción narrativa: `id`, `label`, `text`, `set_flags` (lista), `requires_flags` (lista), `forbids_flags` (lista), `scope` (`player` o `world`, predeterminado player), `next` (sala existente opcional), `journal` (texto opcional). Las acciones sociales no conceden números inventados de XP, monedas, estadísticas o botín. Las recompensas mecánicas existentes requieren contrato de Jugabilidad consumido por el backend.

Historia: `id`, `title`, `premise`, `steps` (lista de flags/textos de diario), `source` (canon anterior o ampliación autorizada). Todo flag utilizado debe tener significado en el mundo y al menos una consecuencia observable en texto, diálogo o acceso.

Región: `id`, `name`, `identity`, `settlement`, `species`, `weather` (variantes físicas) y `source`. Criaturas: datos canónicos y señales previas; sus valores de combate sólo entran desde el contrato cerrado de Jugabilidad.

La composición combina espacio, transición, hora, clima, actividad, amenaza y memoria con prioridad y ritmo; no concatena todas las capas en cada lectura ni sustituye escenas concretas por frases genéricas.

Piloto MUD clásico: `brief` es un resumen editorial opcional de la geografía permanente. Sólo se usa en navegación tras la primera visita; `mirar` devuelve siempre la descripción completa mediante un evento `LOOK`. Un estado que cambia `description` sin su propio `brief` descarta el resumen anterior. Lo mismo ocurre al cambiar la descripción por ausencia de una criatura. Las capas dinámicas, amenazas, acciones y salidas conservan sus contratos. El encabezado muestra el lugar; `LOCATION` permanece en el historial, sin repetirse en la terminal. No extender los seis resúmenes del piloto masivamente sin una revisión regional.

Extensiones integradas: `dawn`/`dusk` son actividades originales de amanecer/atardecer. `requires_time`, `requires_weather`, `forbids_weather`, `requires_npc`, especie/clase son guardas del servidor para observación, temas y acciones. `states:[{requires_flags,overrides:{description,day,dawn,dusk,night,rain,clear,weather,return,examine}}]` reemplaza hechos físicos obsoletos; `examine` mezcla objetivos. Los NPC admiten estados descriptivos equivalentes y `schedule`. Las acciones mundiales registran también `participated:<flag>` en quien actuó; una consecuencia pública no se atribuye automáticamente a otro personaje. `focus` y `max_layers` organizan prioridades de lectura (el límite incluye la descripción), con capas secundarias accesibles mediante observar.

Los encargos exigen visitas y `required_actions` nuevas por cada instancia. La fauna compartida tiene una sola salud y ronda, participación real, respuesta enemiga al objetivo principal y un material físico único; la huida usa una salida existente. Presencia local expira a los30 segundos; chat reciente a los10 minutos. La terminal permanece textual; las representaciones visuales opcionales usan el mismo estado autorizado del servidor.

La forja de Daro usa `forge_service` para presencia autorizada. Las armas del catálogo se compran como instancias con `catalog_id`; `price` y `sell_price` son del servidor. Venta de arma exige confirmación y otra pieza utilizable, y rechaza equipo activo. `condition:damaged_event` permite reparación excepcional8, sin activar Forja ni equipar. Arquitectura completa: docs/ARCHITECTURE.md.

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
