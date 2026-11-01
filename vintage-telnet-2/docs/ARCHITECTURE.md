# Arquitectura y mantenimiento de Vintage Telnet 2 nuevo

Esta construcción implementa un mundo textual original con el canon del PDF de Descargas. Las instrucciones posteriores de Javier autorizan ampliar el canon, exigen historia y narración nuevas y excluyen imágenes. El juego anterior no se importa. Las bibliotecas de terceros del runtime no contienen su motor ni sus relatos. Las reglas numéricas cerradas conservan su autoridad; una ampliación literaria no autoriza inventar bonificaciones.

## Flujo de una decisión

`client/app.js` presenta el snapshot y envía una intención a `/api/action`. El cliente no decide dinero, daño, descubrimiento, horario, propiedad ni permisos. Flask comprueba sesión, aprobación del personaje, CSRF e identidad de petición; SQLite abre una transacción `BEGIN IMMEDIATE`. El motor actualiza los encuentros compartidos y el mundo, resuelve el texto contra posibilidades disponibles, valida la decisión y persiste personaje y mundo juntos. La tabla `requests` impide ejecutar dos veces una petición; reutilizar una identidad con una intención diferente produce409. Un fallo revierte la transacción completa.

`server/app.py` es transporte y autenticación; `server/store.py` es persistencia; `server/content.py` carga y valida el catálogo; `server/mechanics.py` contiene matemática cerrada; `server/engine.py` resuelve mundo, acciones y narración; `server/world_events.py` determina eventos compartidos por calendario y reloj de servidor. El cliente representa esos mismos datos. No existe una segunda lista de posiciones, una economía cliente ni un mundo paralelo.

## Datos y privacidad

Los catálogos públicos viven en `content/world.json` y `content/regions/*.json`, combinados por tablas con identidades únicas. Un duplicado contradictorio falla al cargar. El estado privado vive en `runtime`, ignorado por Git. El bootstrap guarda secretos en archivos privados; el hash del director y las contraseñas de cuentas nunca llegan al cliente. El servidor sirve únicamente los archivos cliente autorizados y bloquea recursos de imágenes mediante CSP.

Cada cuenta puede tener varios personajes. Cada personaje obtiene su propia aprobación y su hogar privado `home:<id>`, con descripción de su región/especie. Seleccionar un personaje ajeno falla. El director entra por `/dm`; aprobar una cuenta no aprueba automáticamente sus otros personajes.

## Añadir una región, una sala o un hito

Añadir una región a `regions` con identidad, asentamiento existente, especie si corresponde, clima y hogar. Añadir salas con `region`, `kind`, descripción concreta y `exits` hacia ids existentes. Documentar ampliaciones en `CANON_EXPANSION.md`. Un hito es una sala del catálogo con geografía y señales reconocibles; no otra entidad decorativa. No añadirlo manualmente al mapa cliente. Las rutas deben encajar con orientación y distancia narradas; las descripciones no prometen salidas inexistentes.

Usar `dawn`, `day`, `dusk`, `night`, `rain` y variantes `weather` para hechos locales distintos. No copiar la actividad diurna a `clear`: podría reaparecer después de reparar o transformar físicamente el lugar. Añadir detalles `examine` que permitan buscar capas secundarias sin saturar cada llegada. Validar alcance del grafo, referencias y un recorrido leído con fases y clima distintos.

## Añadir habitantes, escenas y memoria

Registrar NPC en `npcs`, su `home_room`, descripción, temas y horario; referenciarlo desde la sala. Las condiciones `requires_flags`, `forbids_flags`, `requires_time`, `requires_weather`, `forbids_weather`, `requires_npc` y especie/clase se evalúan en el servidor. Un requisito explícito de día se refiere a la fase día; un horario diurno del habitante puede abarcar amanecer y atardecer.

Una decisión usa `id`, `label`, `text`, guardas y efectos estructurados. `scope:world` modifica una consecuencia pública y registra `participated:<flag>` para la persona que actuó. `scope:player` modifica conocimiento o memoria propios. `states` reemplaza descripción y detalles obsoletos cuando cambia el lugar; la memoria no debe devolverlo a su estado anterior. Las recompensas monetarias necesitan contrato mecánico, no texto libre. Los encargos comprueban acciones y visitas nuevas desde su aceptación; pasar anteriormente por un lugar no los completa.

## Añadir criaturas y equipo

Registrar ecología, descripción, advertencias y señales en `creatures`; situarlas mediante `signals` de salas. El bestiario se descubre al observar o encontrar señales reales. Una criatura sin contrato numérico ofrece observación, no combate con números inventados. Para habilitar combate, añadir un perfil validado a `mechanics.PROFILES` y probar aviso previo, ronda, intervención, huida, derrota y cooperación. Los límites de balance avanzado están en `review/current/KNOWN_LIMITS.md`.

Las armas comunes de Daro conservan daño y utilidad definidos por `mechanics.WEAPONS`; `content.items` añade precios y reventa canónicos. Cada compra crea una instancia distinta con `catalog_id`, `id`, cantidad1 y condición intacta; no autoequipa. La venta requiere confirmación, presencia de Daro, pieza no equipada y otra arma utilizable. El catálogo regional de Forja no se convierte en una tienda ordinaria: la activación física requiere el ciclo canónico de evidencia y validación externa y no está completada por una reparación.

`condition:damaged_event` sólo procede de un suceso excepcional autorizado, nunca de desgaste rutinario. Reparar esa instancia cuesta8 sellos, cambia únicamente la condición y no equipa, mejora ni valida Forja. Una pieza dañada no puede equiparse. Un suceso que dañe una pieza equipada debe retirar ese slot en la misma transacción. No crear sucesos de daño sólo para forzar el uso de la tienda.

## Mapa, conocimiento y sincronización

El motor mantiene salas conocidas, visitadas y pares de rutas recorridas. El snapshot del mapa deriva de ellas; no contiene las salas desconocidas del catálogo. Volver al hogar usa la conexión de su asentamiento. La derrota en otra región deriva del asentamiento seguro real; no inventa una ruta conocida. Huir usa una salida existente y conserva el estado del enemigo compartido.

Hora y clima los determina el servidor. La interfaz refresca periódicamente sin reiniciar el texto escrito, foco o lectura. El encuentro compartido tiene una salud y una ronda; el objetivo principal recibe la respuesta enemiga, la participación determina XP y el material físico no se duplica. Presencia local caduca a30 segundos y el chat reciente a10 minutos. Los mensajes llegan a personas presentes en ese lugar en el momento de enviarlos.

## Tokens narrativos e interfaz

Los eventos semánticos `world`, `location`, `action`, `npc`, `trace`, `danger`, `combat`, `damage`, `discovery`, `reward`, `memory` y `chat` expresan función, no una cadena HTML. El cliente usa texto seguro y estilos por función. La composición mantiene geografía y prioriza amenaza, cambios y memoria; limita capas por lectura. Las acciones disponibles y sus razones deshabilitadas proceden del servidor.

La lectura es el escenario vintage; formularios, decisiones, ficha y mapa textual usan interfaz moderna y vertical. No hay modelos, raster, SVG, canvas ni assets3D; la instrucción posterior «no uses imágenes» sustituye esas partes del PDF. Añadir una especie o región no necesita fabricar un recurso visual.

## Operar y comprobar

`./start.sh` prepara runtime y arranca Waitress en localhost8083; `/dm` abre el director. El acceso «Vintage Telnet 2 — Nuevo» ejecuta ese mismo script. No comparte base de datos con el juego anterior. Para respaldo, detener el servidor y copiar el directorio runtime privado; no publicarlo ni incorporarlo a Git.

Ejecutar `PYTHONPATH=runtime/python-deps python3 -m unittest discover -s tests -v` y `npm run check:client`. Los lectores de `review/narrative/api-reader-final.py` y `api-reader-edran.py` recorren el catálogo mediante API en proceso con datos temporales. `scripts/browser-review-new.mjs` comprueba navegador real cuando el entorno permite abrir sockets y arrancar Chrome. Los contratos cliente y el test client de Flask no sustituyen navegador, Android ni lectura humana de20–30 minutos.

Consultar `review/qa/VALIDATION_MATRIX.md` para evidencia y pendientes. Una valoración literaria identifica el contenido y recorrido leído; no se extrapola automáticamente a nuevas salas. Conservar el ciclo de rechazo, corrección y relectura independiente, seguido de un recorrido distinto.

## Mapa de orientación y recorrido

El mapa añade rutas dirigidas a las parejas ya recorridas. Para cada pareja, el servidor consulta las salidas reales de ambos extremos; si sólo hay una salida, no inventa retorno. El hogar usa las conexiones autorizadas `salir` y `hogar`, separadas de los puntos cardinales. Su nodo se deriva de la plantilla propia, no del cuarto donde está el personaje.

El cliente representa una brújula local HTML/CSS con la ubicación en el centro. Los vecinos conocidos aparecen en su dirección real. Una salida sin recorrido es una frontera sin id ni nombre de destino; explorar envía sólo la acción de dirección disponible. El selector agrupa destinos conocidos por región y hogar. `knownRoute` calcula el itinerario mínimo por conexiones dirigidas aprendidas. «Dar siguiente paso» envía una acción disponible de movimiento; no teletransporta, no encadena solicitudes ni evita el combate. Cambiar destino sólo cambia la consulta.

Un servidor anterior que sólo envía `edges` permite consultar conexiones sin adivinar direcciones. Para habilitar direcciones hay que reiniciar el proceso habitual después de actualizar `server/engine.py`. La partida SQLite y sus parejas ya recorridas se conservan; no requiere migración. No detener el servidor desde un entorno que impide volver a abrirlo. Las comprobaciones específicas son `tests/test_map.py`, `client/qa-map.mjs` y `client/qa-map-view.mjs`; el adaptador DOM no prueba diseño visual.
