# Númenes — contratos de integración, poderes candidatos, arte y QA para VT2

**Estado: CONTRATO PROPUESTO PARA REVISIÓN, NO APROBADO NI IMPLEMENTADO.** Historiador, 2026-10-14.
**La presencia de una regla en este expediente NO autoriza fusionar a `main`, generar spawns ni desplegar Raspberry.**
**Lecturas previas:** [reglas recuperadas](NUMENES_REGLAS_RECUPERADAS_VT2.md), [ocho identidades](NUMENES_OCHO_DOSSIER_NARRATIVO.md), [escenas por modelo](NUMENES_ENCUENTROS_NARRATIVOS_VT2.md), [canon](CANON_VIGENTE.md), [decisiones](DECISIONES_VIGENTES.md), [contrato de contenido](../CONTENT_CONTRACT.md).

## 0. ¿Cuándo podremos decir que está completo?

Distinguir cuatro niveles:

| Nivel | Significado | Situación actual |
|---|---|---|
| **A — Recuperación histórica** | Decisiones originales, nombres, ocho anomalías, diferencias VT1/VT2 | COMPLETO DOCUMENTALMENTE |
| **B — Preparación editorial** | Ocho fichas narrativas, escenas de observación, consentimiento y rechazo, ubicación candidata, brief artístico | COMPLETO COMO PROPUESTA, requiere decisión de aprobación |
| **C — Contrato jugable aprobado** | Poderes realmente elegidos, persistencia, reglas de compatibilidad, tiempos/estados, API/UI y balance | PENDIENTE de decisión por Jugabilidad y Arquitectura |
| **D — Implementación comprobada** | Contenido, motor, bases de datos, interfaz, pruebas integrales, despliegue autorizado y QA real | NO INICIADO |

El Historiador puede cerrar A y B sin confundirlos con C y D. Una PR de documentación no produce Númenes en el servidor.

## 1. Objetivo del producto

Que un jugador de unos nueve años pueda ver un animal, notar algo raro, leer una señal de su conducta, tomar una decisión respetuosa, descubrir que tiene voluntad, construir un vínculo y nombrar a su compañero. Después debe sentir que lo acompaña y aporta **un poder fijo limitado**, sin convertirlo en personaje secundario con nivel propio o una manera de ganar el juego por ventajas acumuladas.

**Principios no negociables antes de aprobación:** el lector entiende por qué una acción sirve; el Númen puede decir no; no se captura por golpearlo; el servidor decide el estado y lo persiste; ningún compañero requiere pagar dinero real, ninguna interfaz omite la lectura para resolver el encuentro; dos jugadores conservan su historia individual y no se arrebatan los compañeros entre sí por accidente.

## 2. Autoridad y propietarios de datos — contrato a acordar

**Unidad de pertenencia propuesta:** personaje, no cuenta global ni sesión del navegador. Debe quedar ligada a la identidad autoritativa que el servidor usa para el personaje. No confiar en IDs, flags, nombre ni poder enviados por clientes.

**Ejemplar vs tipo:** modelo A–H identifica apariencia y poder fijo del tipo. Un ejemplar tiene ID estable propio tras vínculo, nombre libre elegido por jugador, propietario y ubicación/estado. Distintos ejemplares del mismo modelo pueden coexistir si Jugabilidad lo permite; un tipo no es un objeto único mundial.

**Separar conceptualmente:**
- Catálogo (mundo estático): clave de tipo, base animal, anomalía, descripciones aprobadas, poder elegible si existe.
- Avance de encuentro privado: personaje, ID de oportunidad contextual, observación realizada, decisiones únicas reconocidas, estado discreto, rechazo contextual. No contiene automáticamente pertenencia.
- Vínculo persistente: personaje dueño, ID del ejemplar, tipo, nombre, estado hogar/activo, timestamps y versión de formato según Arquitectura.
- Presencia ambiental: aparición autorizada por estado del mundo y condiciones de sala, con separación de la disponibilidad individual del vínculo.
- Poder aplicado: sólo una vez por la acción/contexto autorizado, vinculado al único acompañante activo; jamás «sumar todos los guardados».

No diseñar una nueva tabla de estados mundiales que ponga la **confianza privada** en `world.flags`. Si se necesitan flags, deben ser del personaje y no de la mazmorra ni de la sala completa. No asumir que el motor actual tiene ya claves como `numenes`, `companions` o una tabla SQL específica: son conceptos de diseño, no campos que existan.

### Invariantes que Jugabilidad y Arquitectura deben validar

**I01.** Número total de vinculados de un personaje: 0–3, contando los que descansan en casa.  
**I02.** Número de activos por personaje: 0–1.  
**I03.** Un mismo ejemplar no pertenece simultáneamente a dos personajes, salvo una regla de transferencia futura expresamente autorizada; por defecto no hay venta, trueque ni préstamo.  
**I04.** Nombre y vínculo persisten ante recarga, cambio de dispositivo y derrota ordinaria.  
**I05.** Un Númen no activo no modifica atributos, daño, XP, mapa, drop, percepción ni recuperación del jugador.  
**I06.** Una acción repetida no acumula confianza ni concede efectos nuevos sin cambio real de estado.  
**I07.** Un rechazo es legible; no se transforma por defecto en combate, muerte, botín o pérdida definitiva.  
**I08.** Elegibilidad y compatibilidad se vuelven a validar **en el instante exacto de crear** el vínculo, no sólo al mostrar el botón.  
**I09.** Ganar posteriormente un poder incompatible no rompe vínculos existentes.  
**I10.** No se puede adoptar un cuarto, crear dos ejemplares con el mismo clic duplicado ni activar dos por peticiones simultáneas.  
**I11.** Sólo se puede nombrar un ejemplar vinculado propio, nunca uno ambiental o de otro jugador.  
**I12.** La representación gráfica nunca muestra algo que el motor aún mantiene oculto.  
**I13.** El espacio físico de la casa muestra o describe Númenes no activos sin duplicarlos en un mapa global.  
**I14.** Retirada del compañero por derrota/desconexión preserva su propiedad y resuelve un lugar recuperable conforme al contrato, sin teletransporte inexplicable narrativamente.  
**I15.** El poder fijo del compañero activo está sujeto a la misma autoridad, cooldown y control antiabuso que cualquier efecto autorizado; no crea acceso a lugares secretos.

## 3. Máquina de vínculo propuesta — para aprobar o modificar

Estados conceptuales (no claves JSON implementables):
`no_detectado` → `percibido` → `anomalia_comprendida` → `cauteloso` → `acepta_proximidad` → `invitacion` → `vinculado`.

No es necesario que una visita complete toda la secuencia ni que todos los ejemplares repitan exactamente siete pasos. Puede haber acciones neutras que no cambien estado, rechazo contextual que lo pause, y una salida voluntaria que conserve la memoria del descubrimiento sin fingir progreso de confianza.

**Ejemplo mínimo de puertas:**

| Puerta conceptual | Prerrequisito narrativo | Respuesta si faltó |
|---|---|---|
| Examinar anomalía | El animal ya está perceptible en sala | «No encuentras al animal que intentas observar», sin revelar identidad oculta |
| Primera acción de confianza | Señal concreta disponible para el personaje | Describe lo observado y el efecto, sin números |
| Otra decisión de confianza | Contexto cambiado o acción distinta con sentido | Repetición sin recompensa; nueva decisión sólo si la situación cambió |
| Invitación | Decisiones compatibles, animal libre de retirarse | No etiquetar «domar» ni «capturar» |
| Confirmar vínculo | Consentimiento + límite + compatibilidad + propiedad válidos | Mensaje de negativa contextual y **sin consumo parcial** |
| Nombrar | Ejemplar ya vinculado y propiedad personal confirmada | Rechazar nombres inválidos sin perder vínculo; ofrecer resolver el nombre |
| Activar viajero | Es un Númen propio; 0–1 activo | Si cambia de viajero, regresar el anterior al hogar de forma coherente |

**Idempotencia:** si el navegador repite la misma operación por reconexión, no crear dos vínculos, no gastar dos veces, no adjudicar dos poderes ni repetir XP. La transacción de vínculo y la de cambiar activo deben ser atómicas con el modelo de persistencia real.

**Compatible con cuatro clases:** Juramentado, Arcano, Sombra y Artífice. Un Númen no es compañero exclusivo del Arcano; no crear requisitos de Vigía/Invocador; las incompatibilidades deben consultar **IDs de poderes existentes**, no nombres de clase ni especulaciones de guionista.

## 4. Catálogo de posibles poderes — discusión, no canon

El poder fijo es histórico; su **contenido todavía no se aprobó**. La tabla separa una fantasía perceptible de un resultado implementable. No atribuir estadísticas, números ni acción gratis. Cada fila ofrece **un candidato inicial**, no una capacidad confirmada.

| Númen | Poder temático candidato | Qué haría como experiencia | Lo que nunca debe hacer | Balance y competencia que revisar |
|---|---|---|---|---|
| A perro cuatro orejas | Oído de ruta | Advertir una pista sonora **ya legítimamente presente** | Detectar todos los enemigos, emboscadas ocultas o jugadores invisibles | Que no sustituya observar ni percepción de Vesperi |
| B gato ojos profundos | Mirada detenida | Ayudar a interpretar un detalle **visible** descrito por la sala | Abrir secretos, predecir futuro, leer pensamientos o enseñar rutas desconocidas | Riesgo alto de redundancia con `examinar` |
| C conejo cuatro orejas | Atención al apoyo | Alertar sobre un cambio **físicamente visible** de terreno ya examinado | Saltarse una guarda de atributo/especie o superar peligro automáticamente | Comparar con movilidad de Felaryn y atributos |
| D ratón bigotes | Hilo de penumbra | Dar enfoque de lectura a un detalle del borde cercano | Ser linterna universal, entrar por rendijas inaccesibles, revelar salas | Validación estricta de línea de visión/oscuro |
| E ave doble sombra | Perspectiva cercana | Ofrecer observación alternativa de algo presente en la misma sala | Cámara aérea, scouting remoto, conocer todos los mapas | Riesgo alto de filtrar rutas/secretos |
| F cachorro de aire | Calma cercana | Acompañar un contexto de reposo/cuidado autorizado | Curar sin límite, eliminar raciones, sustituir servicios médicos | Puede romper economía de recuperación; considerar sustitución |
| G gato dos colas | Ritmo de espera | Señalar un momento de distracción perceptible, sin efecto gratis | Robar turno, aplicar debuff sin prueba, quitarle identidad a Sombra | Muy alto solapamiento con Sombra |
| H conejo silencioso | Pausa silenciosa | Advertir el ritmo de movimientos **ya visibles** de un entorno | Dar invisibilidad o sigilo permanente al jugador | Muy alto solapamiento con Sombra |

**Resultado explícito:** ninguno de los ocho está aprobado. **No son poderes que Codex pueda activar ahora.** Si una propuesta no consigue un uso legítimo distinto del comando `mirar`, del examen normal o de la clase existente, Jugabilidad debe **reemplazarla o rechazarla**. Se puede lanzar un piloto con una sola habilidad evaluada y conservar la identidad del resto sin inventar poderes para completar una matriz.

**Incompatibilidades:** comenzar con la lista **sin definir** y someter a revisión sobre habilidades reales; no deducir que un gato misterioso rechaza Arcanos ni que un conejo no puede ir con Sombra. Si se aprueba un rechazo por poder, el contenido debe ofrecer pistas tempranas y el motor devolver el estado correspondiente, sin exposición de poderes ocultos.

## 5. Responsabilidades separadas y entregables exigibles

### Historiador

Entregados en esta PR: reglas con procedencia, ocho anomalías preservadas, base animal, comportamiento, lugares candidatos existentes, escenas de reconocimiento/examen/elección/rechazo/invitación, tono de convivencia y límites de la fantasía. Pendiente de aprobación: elección definitiva de lugares, potencia narrativa y cualquier poder concreto. No redactar que un rumor demuestra origen de la magia.

### Narrador

Traducir las ocho escenas propuestas a unidades del contrato real de contenido **sólo después** de conocer cómo las entregará el motor. Por ejemplar: llegada, presencia observable, `mirar`, `examinar`, respuesta a decisión acertada y errónea, respuesta neutra, huida/no vínculo, escena de invitación, acto de aceptación, nombramiento, variación de regreso, día/noche/lluvia y hogar. No asignar nombres de individuos. No confundir un pensamiento del jugador con una bandera del mundo. La palabra «Númen» puede revelarse cuando el jugador tenga suficiente evidencia.

### Jugabilidad

Confirmar o modificar las diez reglas históricas; elegir poder del piloto con efectos legítimos y límites; diseñar transiciones y condición de confianza; decidir aforo/uno activo/casa; resolver incompatibilidades de poderes concretos; rechazo, recuperación tras derrota y antifarmeo. **Debe definir qué sucede con el límite 3 lleno** y la experiencia cuando el jugador decide no vincularse.

### Arquitectura / Codex / Claude

Crear un solo contrato autoritativo de propiedad y estado de Númenes, no scripts aislados que simulen cada uno. Diseño futuro por capas: catálogo tipo → aparición autorizada → estado privado de encuentro → vínculo persistido → acompañante activo → uso de poder → presencia en casa → presentación HTML/texto. **Ninguna IA de narración actualiza estados por su cuenta** ni entrega directamente estadísticas, XP o objetos. Pruebas y migraciones antes de integrar; versión en GitHub vigente, no copias antiguas; un solo flujo de PR y revisión.

### Arte

Producir **sólo tras aprobación visual** láminas de especie/modelo por separado; nunca convertirlo en enemigo del bestiario por parecido. El Númen debe poder reconocerse a tamaño de miniatura y mantener su anomalía al cambiar de pose. No crear efectos mágicos extra no definidos. El archivo y la identidad del modelo deben separar **creature/Númen** de **location**. No generar todas las escenas antes de aprobar un piloto y verificar costos de pipeline.

### NPCs

No inventar NPC propietario por defecto ni imponer tutoriales expositivos en todos los pueblos. Si el diseñador elige un testigo existente, verificar primero ubicación, horario y conocimiento; el NPC no cuenta descubrimientos privados del jugador ni obliga a adoptar al animal.

### QA

Probar contrato de mundo y de persona por separado, entradas narrativas, rechazo voluntario y escenarios simultáneos. Asegurarse de que nada aparezca como criatura hostil, botín, XP o venta. No certificar despliegue por aprobar sólo tests unitarios; falta recorrido real por dispositivo y revisión humana.

## 6. Diseño de UI compatible con el carácter textual

**Panel Númenes (futuro, no existente):** máximo tres retratos o entradas con nombre elegido, modelo y ubicación actual «te acompaña» / «en casa». Sólo un poder visible y accionable para el que te acompaña. El inventario continúa con objetos; los Númenes no deben figurar como cantidad de items.

**En la sala:** el texto de llegada señala lo perceptible. Al examinar, revela anomalía; luego el servidor devuelve acciones vinculables por sus guardas. El cliente no muestra botones para Númenes ocultos. El juego sigue permitiendo acceso equivalente por texto si el motor lo admite y no inventa acciones válidas a partir de un texto libre.

**En el hogar:** los tres vinculados, activos y guardados, se leen como seres vivos con preferencias; no aparecen como estatuas que el jugador «equipa». Al cambiar acompañante, el mundo da feedback y actualiza exactamente un activo.

**En combate:** un poder contextual sólo aparece cuando es lícito y relevante. Si el Númen no participa, puede reaccionar en la narración, pero nunca atacar o sufrir daño adicional sólo para dar ambiente. Ningún Númen debe ser invocado por el Arcano como si fuera clase específica.

**Despliegue y dispositivos:** revisar responsive en móvil y navegador sin sumar grandes ventanas que tapen el texto. El sistema debe seguir siendo comprensible aun si las imágenes no cargan.

## 7. Brief artístico mínimo de los ocho modelos

| Modelo | Lo que Arte DEBE mantener | Antipatrón a bloquear | Mejor evidencia |
|---|---|---|---|
| A | Perro mediano con cuatro orejas moviéndose independientemente | Lobo feroz, seis orejas, telepatía visual | Perfil y tres cuartos, orejas legibles |
| B | Gato esbelto, ojos azules de profundidad imposible | Ojos que son portales literales o LEDs | Close-up del iris, cuerpo de gato reconocible |
| C | Conejo con dos pares de cuatro orejas finas | Cuernos, alas, duplicar cabeza | Vista frontal y lateral |
| D | Ratón real con bigotes que emiten hilos muy tenues | Ratón hecho de electricidad, luces en todo el cuerpo | Penumbra donde el bigote se identifica |
| E | Ave pequeña común con dos sombras, una sola luz física | Dos aves, doble cuerpo, aura | Pose sobre suelo, dos sombras nítidas |
| F | Cachorro mestizo, leve deformación del aire alrededor | Llamas, escudo, gran resplandor mágico | Fondo ondulado sutil, anatomía normal |
| G | Gato natural con dos colas que siguen ritmos distintos | Gato demoníaco, colas clonadas flotantes | Una pose que muestre inserción de ambas colas |
| H | Conejo normal que salta sobre hojas sin ruido | Animal invisible, levitando, efectos de humo | Secuencia antes/durante/después explicada por texto |

**Paleta y estilo:** compatible con la línea visual anime contemporánea de VT2 sin sustituir el texto ni imponer una paleta aquí. Cada anomalía debe permanecer inequívoca incluso al reducir la imagen. Las variantes nocturnas y de lluvia no fuerzan el efecto contrario al canon: no se ven dos sombras sin luz; no se oyen saltos del conejo H «para hacerlo más realista».

**Pipeline/coste:** piloto visual A y una segunda anomalía ambiental E si el creador lo aprueba. Primero arte estático revisado por Dirección de Arte; después variaciones, sólo si hay espacio/uso real en la interfaz. No abrir lote de ocho personajes más escenarios automáticamente.

## 8. Pruebas de aceptación propuestas (se ejecutarán sólo cuando haya código)

| ID | Caso | Resultado requerido |
|---|---|---|
| N01 | Personaje ve un perro A por primera vez | Narración no revela aún todas sus anomalías ni lo registra como propio |
| N02 | Examinar con oportunidad válida | Describe cuatro orejas; no crea vínculo |
| N03 | Repetir acción de confianza sin nuevo contexto | No avanza confianza ni duplica eventos |
| N04 | Acercarse de forma brusca | Rechazo narrativamente legible; no combate ni muerte |
| N05 | Decidir salir del encuentro | El juego continúa; no crea mascota |
| N06 | Intentar vínculo sin invitación | Servidor lo rechaza sin filtrar estados secretos |
| N07 | Vincular tras aceptación | Un ejemplar propio persistido, nombrable, sin duplicados |
| N08 | Dos peticiones simultáneas de vínculo | Sólo se registra una; no hay cuarto ejemplar |
| N09 | Cambiar acompañante en hogar | El anterior pasa a casa, exactamente uno activo |
| N10 | Poder con Númen guardado | No concede poder ni ventaja |
| N11 | Perder combate, morir o reaparecer normalmente | Vínculo y nombre se conservan |
| N12 | Aprender poder incompatible después de vincular | No destruye vínculo existente |
| N13 | Intentar vínculo nuevo con poder incompatible REAL aprobado | Rechazo consistente; sólo si contrato de compatibilidad existe |
| N14 | Otro personaje visita la misma sala | No ve confianza, nombre ni progreso privado |
| N15 | Reingresar/reconectar durante aceptación o renombre | No pierde mascota ni crea copia |
| N16 | Entrar en noche/lluvia con ave E | No se inventa sombra doble visible sin luz adecuada |
| N17 | Examinar conejo H sólo mediante texto | Explica la ausencia de sonido sin depender de audio/imagen |
| N18 | Prueba de 4 clases actuales | Ninguna exige Vigía/Invocador ni prohíbe Arcano por homonimia |
| N19 | UI móvil + escritorio | No revela númenes secretos ni tapa el texto de exploración |
| N20 | Intención maliciosa del cliente (ID, dueño, estado, habilidad) | Datos ignorados/validados por servidor |
| N21 | Cuarto Númen | Límite manejado sin pérdida de los anteriores, salvo nueva regla autorizada |
| N22 | Dos acciones de activar simultáneas | Uno activo sin efectos superpuestos |
| N23 | Enemigos, ventas, cofres, loot y XP | Númenes no entran automáticamente en esos sistemas |
| N24 | Reinicio del servidor y migración de partida antigua | Datos existentes preservados y nombre/propiedad consistentes |
| N25 | Lectura humana de un niño | Puede explicar qué vio, por qué la criatura se fue y qué acción debía respetar |

No ejecutar estos tests hoy ni escribir que «pasaron»: son **criterios de aceptación futuros**. No sustituirlos por pruebas de que los archivos Markdown existen.

## 9. Secuencia de integración recomendada y puertas de aprobación

**Puerta P0 — aprobación de producto:** el creador revisa si quiere reactivar los ocho y confirma o modifica las reglas históricas 3/1, casa, nombre, consentimiento y poder fijo. Puede aprobar identidad sin aceptar los ocho poderes candidatos. Sin esta puerta, seguimos en documentación.

**Puerta P1 — poder piloto:** Jugabilidad define un solo poder concreto y demuestra que no compite con las clases actuales ni rompe secretos. Si falla, buscar poder distinto y no codificar uno ambiguo.

**Puerta P2 — contrato autoritativo:** Arquitectura fija persistencia y transiciones, nombres, límite, presencia, compatibilidad, seguridad, conexión y hogar. Narrador adapta una sola escena piloto sin inventar flag.

**Puerta P3 — piloto con A:** una sala candidata existente, una anomalía inequívoca, un vínculo completo, persistencia, retirada y hogar. Ningún otro Númen queda activo por copiar arte o JSON.

**Puerta P4 — contraste con E:** caso de sombra doble que obliga a contemplar iluminación, accesibilidad y oportunidad ambiental; corrige el motor genérico antes de escalar.

**Puerta P5 — ocho modelos y arte:** ampliar tras aceptar el contrato compartido; probar sus diferencias y dar aprobación de arte. Evitar ocho implementaciones inconexas, ocho DBs y ocho lógicas de confianza hechas a mano.

**Puerta P6 — integración y despliegue:** PR revisada, pruebas reales, migraciones verificadas y autorización explícita de producción. **La PR documental actual se queda en borrador; no debe cambiar código.**

## 10. Preguntas que requieren decisión y no deben encubrirse como resueltas

- ¿Se ratifica exactamente el máximo tres y uno activo para VT2?
- ¿La criatura puede quedar disponible a varios jugadores o será encuentro personal, sin agotamiento global?
- ¿Un personaje puede poseer dos ejemplares del mismo modelo A–H dentro del límite de tres?
- ¿Qué hace el sistema si hay invitación válida pero ya posee tres: permitir despedirse o elegir reemplazo? No asumir descarte.
- ¿Habrá desvinculación voluntaria? Si existe, requerirá una escena que respete la voluntad, sin venta de seres vivos.
- ¿Cómo se conserva la confianza entre reconexiones, pausas largas o cambio de dispositivo?
- ¿Dónde aparece el compañero tras muerte y respawn y cómo regresa a casa sin teletransporte inexplicado?
- ¿En qué condiciones y ubicación se permite cambiar el Númen activo?
- ¿Cuáles ocho poderes, o sólo un piloto, son mecánicamente distintos de observar, examinar, descansar, Sombra y percepción por especie?
- ¿Cómo opera el sistema si el jugador pierde acceso al arte, al navegador móvil o a un texto narrativo generado?
- ¿Qué nombres permite el juego y quién puede cambiarlos?
- ¿Cuándo quedará autorizado fusionar la PR narrativa y cuándo se publicará realmente?

Hasta recibir decisión explícita, las respuestas son **pendientes**, no defaults silenciosos del Historiador.

## 11. Lista de cierre documental

- [x] Recuperar fuentes originales y nombre vigente.
- [x] Distinguir HISTÓRICO, VIGENTE y PROPUESTA.
- [x] Cubrir las ocho anomalías sin cambiar sus cuerpos.
- [x] Elegir lugares **candidatos** que existen en VT2.
- [x] Proponer escenas con elección, rechazo, regreso y aceptación libre.
- [x] Proponer convivencia, clima y diario sin asumir que el motor lo soporta.
- [x] Documentar poderes temáticos con sus riesgos y sin valores inventados.
- [x] Delimitar entregables de Historiador, Narrador, Jugabilidad, Arquitectura, NPCs, Arte y QA.
- [x] Diseñar criterios de aceptación y puertas de piloto.
- [ ] Aprobación de reglas y lugares por el creador.
- [ ] Aprobación de mecánicas, poderes y persistencia por Jugabilidad/Arquitectura.
- [ ] Producción narrativa transformada a contratos válidos.
- [ ] Arte aprobado y datos de contenido jugable integrados.
- [ ] Pruebas reales y despliegue explícitamente autorizado.

**Conclusión:** preparación documental y literaria suficiente para una revisión formal. **No equivale a ocho Númenes implementados ni listos para producción**.
