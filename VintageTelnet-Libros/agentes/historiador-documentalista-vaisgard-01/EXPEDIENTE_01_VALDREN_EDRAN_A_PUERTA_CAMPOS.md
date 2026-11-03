# Expediente 01 — Valdren y el primer camino hacia la Puerta de los Campos

**Proyecto:** *Crónicas de Vaisgard* · Libro I: *El primer camino* (provisional)  
**Responsable:** Historiador y Documentalista — Agente 02, `historiador-documentalista-vaisgard-01`  
**Ubicación:** `vaisork/MatiasGameLab/VintageTelnet-Libros/` · PR [#706](https://github.com/vaisork/MatiasGameLab/pull/706)  
**Encargo:** Arquitectura Editorial en [comentario de PR #706](https://github.com/vaisork/MatiasGameLab/pull/706#issuecomment-6183381842)  
**Corresponde a:** investigación para capítulos 2–4 y trazado de continuidad posterior, **no** autorización para escribirlos.  
**WIP = 1 expediente**. El Agente 01 conserva en PR #705 la exclusiva del borrador del Capítulo 1.  
**Corte oficial consultado:** `MatiasGameLab/main@316e722f59ebe1f8cef4a606d4190b584caf802a`; archivos canónicos de Edran `dbdaead65f026a57925857f36388b28b94054498`, Veyra `b49f1d10e94d8c2f7ffee9f4704a5303705d0f77`, `world.json` `796079fcdfd01c58922cde8a6fc2880e916ed398`.  
**Decisión editorial correlativa:** [`DECISION_ARRANQUE_EDITORIAL_2026-10-14.md`](https://github.com/vaisork/MatiasGameLab/blob/editorial/cronicas-vaisgard-agente-01-voz/VintageTelnet-Libros/plan/DECISION_ARRANQUE_EDITORIAL_2026-10-14.md) en PR #705, consultada como **aprobación de borrador solamente**.

**Terminología obligatoria:**
- **CONFIRMADA / ABIERTA:** hecho observable sustentado por el juego; puede describirse si la ficha del capítulo lo autoriza.
- **COMPATIBLE:** recurso literario propuesto que aún no tiene aprobación narrativa ni modifica canon.
- **DESCUBRIBLE:** indicio o testimonio, cuya interpretación debe conservar incertidumbre.
- **DUDOSA:** incoherencia o información que exige decisión.
- **RESERVADA:** límite de acceso al escritor; no reproducir explicación de secretos del juego.
- **TENSIÓN:** señalar evidencia, propuesta y solución pendiente en esta PR; **no corregir unilateralmente los JSON**.

## A. Propósito del expediente

El Escritor necesita representar **el interior de Valdren, la salida física de los huertos y la transición documentada hacia Vaisgard** con sensaciones de un mundo habitado, personajes que sepan solo lo que pueden saber y fauna que se comporte como seres vivos. Este documento certifica **salidas de salas, nombres, rutinas descritas y señales de presencia**, no tiempos de viaje ni hechos que Lera ya haya vivido.

**Decisión narrativa actual, diferente del canon del juego:** El Arquitecto Editorial autorizó que el **Capítulo 1** comience en Valdren y use a **Lera**, humana adulta de 24 años creada para la novela, en un **borrador de tercera persona cercana**. Debe terminar su decisión inicial **sin salir de Valdren**; no debe agregar criaturas no verificadas. **Orven** no está incorporado automáticamente. Estos son permisos de escritura, no cambios de `vintage-telnet-2/`.

## B. Fuentes y método

**Rutas reales del juego (en `vintage-telnet-2/`):**
1. `docs/CANON_VIGENTE.md`: Edran/Valdren, humanos, comunidades y misterios.
2. `AGENTS.md` y `docs/DECISIONES_VIGENTES.md`: competencias, roster definitivo, prohibiciones.
3. `content/regions/edran.json`: `regions.edran`, `rooms.*`, `npcs.*`, `stories.*`. **Fuente principal**.
4. `content/regions/veyra.json`: `rooms.veyra_puerta_campos` y continuidad hacia la ciudad.
5. `content/world.json`: `creatures.*`, hábitats, presagios, advertencias e ilustraciones.
6. `CONTENT_CONTRACT.md`, `CANON_EXPANSION.md`, `docs/GUIA_NARRATIVA.md`: límites de qué representa un estado, NPC o acción.
7. `client/art/places/`, `client/art/bestiary/`: **existencia** de arte original. No es un certificado de aprobación para impresión.
8. `VintageTelnet-Libros/plan/{libro-01.md,fichas-001-003.md,DECISION_ARRANQUE_EDITORIAL_2026-10-14.md}` de **la rama del Escritor PR #705**: planes y aprobaciones **editoriales**, separados de hechos del juego.
9. `VintageTelnet-Libros/POLITICA_DE_SECRETOS.md` (rama PR #705): separación entre nivel de acceso y certeza.

**Comprobación:** se recorrieron los `rooms.<id>.exits` verdaderos en una consulta del catálogo remoto de Edran+Veyra, cotejando sala precedente, sala posterior, NPC adscritos y `wildlife_pool`. Las líneas de este informe **no** presuponen que los campos `actions/states` se hayan activado en un mundo de juego o en una novela. El `spatial.json` esquemático **no** fija kilómetros ni horas literarios. Si cambian las salidas del juego en una revisión posterior, se debe rehacer este cotejo.

## C. Atlas dirigido: los trayectos comprobados

### C1. Capítulo 2: visitas dentro de Valdren

**Tramo hacia la fragua** — el capítulo 2 menciona `valdren_fragua`, pero **no** está adyacente a la plaza:
```text
valdren_plaza --NORTE--> valdren_calle_alta --NORTE--> valdren_fragua
valdren_fragua --SUR--> valdren_calle_alta --SUR--> valdren_plaza
```
**Tramo hacia carros** — también requiere pasar por el cobertizo:
```text
valdren_plaza --OESTE--> valdren_cobertizo --SUR--> valdren_patio_carros
valdren_patio_carros --NORTE--> valdren_cobertizo --ESTE--> valdren_plaza
```
**Enlace adicional comprobado:** `valdren_patio_carros --ESTE--> valdren_graneros --ESTE--> edran_salida_huertos`. Permite una salida por el paso de graneros, pero **la ficha actual del capítulo 3 prefiere los huertos**. No tratar el patio, los graneros, los huertos y la fragua como una misma escena visible sin transición.

### C2. Capítulo 3 y extensión posterior: ruta completa plaza → Puerta de los Campos

**Ruta continua certificada, con el siguiente paso real según `exits`.** Las designaciones de capítulo son **propuestas de segmentación**, no hechos canónicos:

| N.º | Sala actual (nombre visible) | Salida y destino comprobados | Alcance narrativo |
|---|---|---|---|
| 01 | `valdren_plaza` — Plaza de Valdren | **Este** → `valdren_huertos` | C1–C2, despedida en el pueblo |
| 02 | `valdren_huertos` — Corredor de los Huertos | **Este** → `edran_salida_huertos` | C3, última vida doméstica |
| 03 | `edran_salida_huertos` — Salida de las Cercas Bajas | **Este** → `edran_acequia` | C3, primeros rastros, Lina |
| 04 | `edran_acequia` — Curva de la Acequia | **Norte** → `edran_surcos` | C3, losa y hojas del agua |
| 05 | `edran_surcos` — Campo de surcos | **Este** → `edran_zanja_antigua` | C3→C4, territorio de rastrojo |
| 06 | `edran_zanja_antigua` — Zanja seca | **Norte** → `edran_era` | C4+ propuesta, señal de uso antiguo del agua |
| 07 | `edran_era` — Era de los campos | **Norte** → `edran_terraplen` | C4+ propuesta, grano y trabajo |
| 08 | `edran_terraplen` — Terraplén de la Subida | **Norte** → `edran_casa_camino` | Continuidad posterior, rodada estrecha |
| 09 | `edran_casa_camino` — Casa del camino | **Norte** → `edran_calzada` | Continuidad posterior, Aren y mensajes |
| 10 | `edran_calzada` — Calzada de piedra | **Norte** → `edran_hito_campos` | Continuidad posterior, piedra húmeda |
| 11 | `edran_hito_campos` — Paso hacia Veyra | **Norte** → `veyra_puerta_campos` | Conexión limítrofe, la **puerta aún no es visible** desde el hito |
| 12 | `veyra_puerta_campos` — Puerta de los Campos | Fin del alcance geográfico de este expediente | Transición confirmada Edran → Veyra |

**La salida desde `edran_surcos` hacia la zanja es una ruta **posible**, no la única.** La continuación **alternativa también conectada**, pero más extensa en número de salas, sería:
```text
edran_surcos --NORTE--> edran_lindero --ESTE--> edran_cobertizo_campo
--[salidas reales de las salas intermedias]--> edran_arboleda
--> edran_camino_carros --> edran_reparo --> edran_era
--> edran_terraplen --> edran_casa_camino --> edran_calzada
--> edran_hito_campos --NORTE--> veyra_puerta_campos
```
**Precaución:** para la alternativa todavía haría falta registrar cada dirección de los tramos intermedios antes de aprobarla como itinerario narrado. No elegir automáticamente el camino más corto de un algoritmo como el camino que tomaría una persona, ni medir jornadas por número de salas.

**Continuidad posterior, FUERA del alcance principal:** `veyra_puerta_campos --ESTE--> veyra_barrio_cargas --ESTE--> vaisgard_mercado`. La puerta no transporta a los protagonistas directamente hasta el mercado.

### C3. Otros límites espaciales que pueden evitar errores

- Desde `edran_acequia`, el estanque (`edran_estanque`) está al **sur** y los surcos al **norte**. Ir al estanque es un desvío; no describirlo como estación inevitable rumbo a Veyra.
- Desde `edran_surcos`, el `edran_lindero` está al **norte**; la `edran_zanja_antigua` al **este**; `edran_parcela_vieja` al **oeste**.
- `edran_zanja_antigua` conecta hacia el **este** con `edran_canal_entrada`, ramal del canal: su descripción no autoriza afirmar que el camino principal hacia la puerta **pasa por el interior** de ese ramal.
- La `edran_casa_camino` aparece **después del terraplén**, no a la primera salida de Valdren.
- `edran_hito_campos` tiene desvío **este** a `edran_vista_cuenca`; la puerta de Vaisgard es visible **después de avanzar hacia Veyra**, no desde la sala del hito, según su propia descripción.
- `veyra_puerta_campos` tiene ambientación de personas de varias especies, pero el campo `npcs` de esa sala está vacío. **No** convertir la «guardiana» ambiental mencionada en su texto en personaje canónico con nombre y pasado.

## D. Fichas de localización orientadas a escenas (15 campos aplicados por conjunto)

La siguiente **matriz de 12 lugares** registra datos de ubicación, apariencia, actividad, fauna, sonidos, conexiones e ilustraciones con **identificadores comprobables**. Al acabar la tabla se amplían casas/oficios/cultura, estado de misterios y límites de aprobación comunes. La tabla no atribuye personajes exclusivos de la novela a sitios del juego.

| ID | Apariencia y uso CONFIRMADOS | Habitante/fauna observables (si se autorizan condiciones) | Textura sonora y riesgo ya descrito | Arte original hallado, NO aprobado editorialmente |
|---|---|---|---|---|
| `valdren_plaza` | Plaza de tierra apisonada, casas de piedra/madera, banco alrededor de piedra antigua; niña/abuela y cuenco de semillas durante el día | `npcs: []`; vecinos genéricos en la prosa. No inventar un cargo para ellos | Pan, fragua lejana, gallo al alba; charcos bajo lluvia | `client/art/places/valdren-anime-v1.webp` (vista general) |
| `valdren_huertos` | Cercas bajas, puertas de cocina, árbol, canaleta de riego y huertos | `npcs: []` en esa sala; familia y encargada genéricas en variantes temporales | Tierra mojada, agua de canaleta; bloqueo de hojas bajo lluvia | `client/art/places/valdren_huertos-anime-v1.webp` |
| `edran_salida_huertos` | Dos postes, últimas cercas; rodeos hacia graneros | `edran_lina`; `wildlife_pool`: Espinajo, Mordelinde, Cornalomo | Al oeste martillo y voces, al este viento; huellas de carros | `client/art/places/edran_salida_huertos-anime-v1.webp` |
| `edran_acequia` | Losa inclinada y agua de curva, zanja seca y hoja atascada | `npcs: []`; fauna de encuentro autorizada en `wildlife_pool`: Espinajo. **Tensión textual Saltalodo**, ver §F | Murmullo, olor a piedra mojada, borde resbaladizo hacia corriente | `client/art/places/edran_acequia-anime-v1.webp` |
| `edran_surcos` | Tierra recién trabajada; sendero sin sembrar que evita pisar las hileras | Espinajo en señales y `wildlife_pool`; adversario `salteador_veterano` en pool | Tallos crujen, movimientos bajos localizados; sendero puede encharcarse | `client/art/places/edran_surcos-anime-v1.webp` |
| `edran_zanja_antigua` | Zanja seca y losa vertical que marca una entrada de canal clausurada para el agua | `wildlife_pool`: Espinajo, `salteador_veterano` | Tierra áspera, escalones, sombra que distorsiona profundidad nocturna | `client/art/places/edran_zanja_antigua-anime-v1.webp` |
| `edran_era` | Círculo para trabajar grano, tablones, poste y tierra firme | `wildlife_pool`: Espinajo, `salteadora_negociante`; aves/ratón ambientales sin NPC fijo | Paja, granos, viento, polvo; tablas apartadas con lluvia | `client/art/places/edran_era-anime-v1.webp` |
| `edran_terraplen` | Subida con raíces al aire y rodadas estrechas; descanso de cargas en ensanche | `wildlife_pool`: Espinajo, Mordelinde, Cornalomo | Pisadas huecas; raíces estabilizan el corte, no arrancarlas | `client/art/places/edran_terraplen-anime-v1.webp` |
| `edran_casa_camino` | Casa de paso al final de subida, mesa alta y cargas mojadas abajo | `edran_aren`, lector de mensajes; sin pool de fauna | Fuego, olor de olla, separación de cargas, notas de viaje | `client/art/places/edran_casa_camino-anime-v1.webp` |
| `edran_calzada` | Piedras gastadas, parches claros, curva antes del hito | `wildlife_pool`: Espinajo, Mordelinde, Cornalomo | Rodadas de carros, piedra que resbala con lluvia | `client/art/places/edran_calzada-anime-v1.webp` |
| `edran_hito_campos` | Poste y losa marcan fin de campos, cauce con tres piedras de paso | `wildlife_pool`: Espinajo, `salteador_veterano` | Agua, viento frío, piedra reparada; puerta fuera de vista | `client/art/places/edran_hito_campos-anime-v1.webp` |
| `veyra_puerta_campos` | Arco y muros de piedra de Vaisgard, entrada de cargas; orígenes **desconocidos** | Visitantes genéricos entre distintas especies; `npcs: []`; pool con Espinajo y `salteador_bravucon` | Ruedas sobre piedra pulida, voces de ciudad; no inventar guardia identificado | `client/art/places/veyra_puerta_campos-anime-v1.webp` |

**Fuentes de los 12 renglones:** en `content/regions/edran.json` los IDs homónimos; en `content/regions/veyra.json` `veyra_puerta_campos`; archivos de arte de `client/art/places/` confirmados por nombre. Son **fichas de ruta resumidas**, no afirmación de que todos los detalles aparecerán juntos en la misma hora o con idéntico clima.

### D1. Variantes temporales y de lluvia: cuándo usar qué

| Sitio | En el alba/día | En noche/lluvia | Limitación para el escritor |
|---|---|---|---|
| `valdren_plaza` | Gallo, preparación del banco, pan y semillas observadas por vecinos | Al caer la noche se oyen una cuchara y risas; la lluvia requiere asegurar patas del banco | Una escena que elija amanecer no puede adoptar sin transición el grupo de acciones de media jornada |
| `valdren_fragua` | Daro aviva brasas al alba; martillo y herramientas durante el día | Por la noche carbón bajo cenizas, piezas frías y taza vacía | Su trabajo descrito no obliga a que atienda a Lera cada vez ni inventa un encargo |
| `valdren_cobertizo` | Bren destapa un carro y prueba la rueda con observador fuera del giro | No se prueban piezas pequeñas en oscuridad: Bren las deja para luz de día | Mirar rueda no significa haberla reparado |
| `valdren_huertos` | Familia entra hojas a cocina; canaleta de riego | Huertos con cuerdas, fuego de cocinas; lluvia puede taponar canaleta | Una reparación no está completada porque una persona vio el problema |
| `edran_salida_huertos` | Vecinos con cestas cruzan; Lina controla llegada en su puesto | Luz de cocinas no alcanza curva; en lluvia sobrevive franja firme | Despedida y salida requieren mostrar el límite físico de casas y campo |
| `edran_surcos` | Agricultora toca la tierra; al alba rocío y sendero libre entre hileras | Tallos y sombras pueden confundir; lluvia crea charcos en surcos | No presentar movimiento bajo tallos como conocimiento perfecto de una criatura |
| `edran_hito_campos` | Conductor comprueba carga; al alba examina primera piedra | Lluvia cubre bordes de piedras; al anochecer retorno es más difícil de distinguir | Desde aquí **NO** se ven todavía los muros de la puerta |
| `veyra_puerta_campos` | Flujo de grano, piedra, viajeros de muchas regiones | Lámpara y cargas tardías; guardiana señala suelo firme bajo lluvia | La guardiana es ambiental, sin identidad/biografía fija |

**Regla general:** `day/night/dawn/dusk/rain/states` son capas condicionales; una novela elige una secuencia compatible con lo que el personaje presencia. Los estados narrativos del juego son posibles, **no un historial universal de acciones realizadas**.

### D2. El tejido social confirma un mundo anterior al viaje

- **CONFIRMADO:** El cuidado de semillas se documenta por cuencos y nombres en casa de semillas; la fragua trabaja piezas que necesitan medida; los carros se ensayan sin estorbar; en el comedor se diferencia comida en mesa de provisión para camino; en el canal se retienen herramientas para su mantenimiento.
- **CONFIRMADO:** La plaza muestra reparaciones de madera alrededor de piedra cuyo origen no está identificado. La práctica presente es reconocible aunque la historia de la piedra permanezca abierta.
- **COMPATIBLE:** que Lera reconozca el olor de madera en el cobertizo, el cambio de sonido entre plaza y fragua, el tacto de las correas y la incertidumbre de dejar una tarea a medias. **No** convertir esa asociación personal en antigua amistad oficial con Daro/Bren.
- **COMPATIBLE:** una despedida que se interrumpa porque hay que dejar pasar un carro; una conversación breve sobre lo que cabe en una mochila; una decisión de esperar a que el suelo se seque. Tales acciones no deben alterar el inventario ni el estado compartido del juego.
- **DESCUBRIBLE:** una nota sobre un carro detenido no demuestra desaparición de una persona, robo o suceso sobrenatural. El mundo tiene voces imperfectas que requieren preguntar quién vio qué.

## E. Fichas de personajes pertinentes (fuentes y conocimientos limitados)

No atribuir a estas personas conocimiento de Lera, decisiones históricas, parentescos nuevos ni disponibilidad permanente. `npcs.<id>.home_room` fija su localización documental; el motor, sus estados y los horarios concretos rigen su presencia de juego, **no** una convocatoria novelística automática.

| ID / nombre | Especie, oficio y lugar | Lo que sabe o pide CONFIRMADO | Límite narrativo |
|---|---|---|---|
| `edran_daro` · **Daro** | Humano, herrero, `valdren_fragua` | La abrazadera del carro requiere comparar qué falló; pregunta por Bren y necesita la medida antes de fabricar | Lera no fabrica una pieza sólo por conversar. No hacerlo padre/maestro/amigo antiguo de Lera sin autorización |
| `edran_bren` · **Bren** | Humano, cuidador de carros, `valdren_cobertizo` | Sabe que una cuña de la rueda izquierda se sale como un dedo; pide al observador permanecer fuera del recorrido del carro | Observar no equivale a diagnosticar todas las cargas ni certificar un cruce |
| `edran_elva` · **Elva** | Humana, anfitriona, `valdren_comedor` | Separa comida presente de provisiones; espera noticias sobre Lio, y su hermano es Aren | No crear un resultado para Lio ni usar su inquietud como misión obligatoria del libro |
| `edran_iria` · **Iria** | Humana, guardiana de semillas, `valdren_casa_semillas` | Compara nombres, cuencos y reservas para no atribuir un préstamo erróneamente | No confundir con `hoshai_iria`, Felaryn. Una cuenta sin cotejo no está resuelta |
| `edran_sena` · **Sena** | Humana, cuidadora, `valdren_cuidado` | Usa paños diferenciados de los de herramientas y ofrece atención a heridas | Descanso y tratamiento son distintos; no deducir que todos los daños sanan mágicamente |
| `edran_lina` · **Lina** | Humana, recepcionista de viajeros, `edran_salida_huertos` | Registra a quienes llegan y puede orientar a Sena | No confundir registro de ingreso al poblado con guardia obligatoria para salir ni cobrar peaje |
| `edran_aren` · **Aren** | Humano, lector de mensajes, `edran_casa_camino` | Ordena notas por destino, pregunta procedencia/hora; hermano de Elva; conoce vía calzada/hito/puerta | **No** escribir que conoce hechos que una nota no prueba; no convertir mensaje privado de Lera en `quest` del juego |
| `edran_nela` · **Nela** | Humana, cuidadora del canal, `edran_canal_entrada` | Gestiona agua, herramientas y advertencias de seguridad; aconseja preguntar antes de tratar al refugio como enemigo | Está en **ramal lateral**; no meterla en la ruta sin desplazamiento explícito |

**Voces documentadas y no solo funciones:** Daro pregunta por desgaste antes de repetir pieza; Bren antepone seguridad del observador; Elva espera noticias de una persona y no solo de sacos; Aren pregunta desde dónde se vio la carga; Lina permite reconocer a quienes llegan sin convertirlo en tributo. Diálogos exactos se cotejan en `npcs.<id>.topics` si se quiere usar una cita. Para Lera, diálogos originales **COMPATIBLES** deben respetar esos temperamentos, sin copiar literalmente conversaciones de misiones ni inventar un pasado conjunto.

**Figuras ambientales sin ID:** abuela, niño, vecina, agricultora, porteador y guardiana de la puerta aparecen en `day/dawn` de salas; sus descripciones existen, pero **no** vienen con nombre, familia estable ni ficha `npcs`. Convertirlos en personajes recurrentes requeriría propuesta editorial y revisión si se cruza el canon.

## F. Criaturas y peligros apropiados para capítulos 2–4

**Una criatura no se inventa para llenar una pelea.** Lo importante son rastros, distancias y decisión de entrar o no en su refugio. Los siguientes animales están documentados por `world.json` y por los `wildlife_pool` de las salas especificadas:

| Criatura / ID de bestiario | Hábitat y conducta confirmados | Pista físicamente respaldada | Reacción y límite | Uso literario **COMPATIBLE** |
|---|---|---|---|---|
| **Mordelinde** · `mordelinde` | Raíces/maleza Edran; busca semillas, cuerpo bajo, hocico que escarba, pequeñas aberturas como refugio | Tierra removida y semillas separadas | Puede huir hacia una abertura si tiene paso libre | En `edran_salida_huertos`: Lera observa y cambia su posición para dejarle salida |
| **Espinajo de rastrojo** · `espinajo_rastrojo` | Parcelas de tallos secos Edran; cuerpo compacto espinoso, protege parcela pequeña y no sigue por todo el campo | Tallos que se mueven en círculo, defensas visibles al asomarse | Orienta espinas al acercamiento; seguir sendero permite evitarlo | En `edran_surcos`: sentir inquietud antes de reconocer al animal; no forzar combate |
| **Cornalomo** · `cornalomo` | Prados/campos Edran; mayor que fauna pequeña, peso hunde tierra | Tallos aplastados y marcas profundas | Se afirma al detectar proximidad; puede evitarse antes de contacto | En `edran_salida_huertos` o `edran_terraplen`: señal del tamaño a distancia, nunca enemigo obligatorio |
| **Salteador veterano** · `salteador_veterano` | Adversario humano en pools `edran_surcos`, `edran_zanja_antigua`, `edran_hito_campos` | Su presencia **posible** no es testimonio de un asalto cometido | Persona, **no fauna**; su conducta exacta exige cotejo antes de escribirla | Posible tensión humana **posterior**, sin mostrar violencia o pelea solo por tenerlo en pool |

**No usar como primer contacto de forma automática:** la presencia en pool no prueba que el animal o humano haya aparecido en la versión de libro; el escritor elige solo después de aprobación. Para el capítulo 3 basta una **señal**, con desenlace no violento. Para el 4 puede elegirse un animal documentado, sin estadísticas, materiales, hechizos, XP, recompensas ni comportamiento antinatural.

**Alimentación comprobada sin extrapolación:** Mordelinde busca semillas; Espinajo defiende la parcela, sin dieta precisa confirmada en su ficha de `world.json` consultada; Cornalomo imprime huellas por su peso, **no** inferir dieta a partir del nombre. No confundir presagios de fauna con encuentros consumados. Los humanos adversarios **no** constituyen especie jugable nueva.

### F1. TENSIÓN REAL: Saltalodo referido fuera de su región

**Evidencia A, CONFIRMADA:** `content/regions/edran.json > rooms.edran_acequia.day` describe un **Saltalodo** arrojándose desde la hierba al agua.  
**Evidencia B, CONFIRMADA:** `content/world.json > creatures.saltalodo.region` es `lethra`; `habitat` dice charcas de Lethra.  
**Evidencia C, CONFIRMADA:** `rooms.edran_acequia.wildlife_pool` contiene **Espinajo** pero no Saltalodo.

**Evaluación:** **DUDOSA / TENSIÓN CANÓNICA** de distribución ecológica o ambientación: el texto diurno nombra un animal cuyo registro regional no confirma presencia en Edran. No da autoridad al historiador para borrar el pasaje del juego, declarar al Saltalodo migratorio, inventar canales que crucen regiones o imponerle una nueva región.

**Decisión editorial solicitada:** ¿el Saltalodo del pasaje es una aparición ocasional autorizada fuera de su hábitat formal, una inconsistencia de prosa pendiente de ajustar en VT2 o debe quedar fuera de la novela mientras se investiga?  
**Medida preventiva:** **NO incluir Saltalodo en las escenas 2–4 de la novela** antes de decisión conjunta. El sonido del agua, la losa y el rastro del Espinajo bastan para ambientar la acequia. No bloquea escribir el Capítulo 1, que permanece dentro de Valdren sin criaturas.

### F2. Seguridad física y emoción sin convertir el libro en tutorial

- Una losa resbaladiza puede requerir cambiar el apoyo, **no** una prueba numérica de agilidad.
- Al llegar a `edran_surcos` existe sendero sin sembrar: una persona que se desvíe hacia tallos por miedo puede perjudicar una parcela; **COMPATIBLE**, consecuencia específica requiere aprobación.
- Un carro desciende con espacio estrecho en `edran_terraplen`: detenerse en ensanchamiento tiene sentido físico; no hay magia ni teleportación.
- Un rumor sobre carga detenida no demuestra robo o desaparición. Si se trata, debe señalarse quién lo escuchó y quién solo leyó una nota.
- La fuerza de un Cornalomo se sugiere por marcas y peso; no afirmar habilidades especiales, inmunidades o números de combate.

## G. Secretos, rumores, arte y límites de información

### G1. Frontera editorial de información

| Estado | Puede narrarse | No debe afirmarse |
|---|---|---|
| **ABIERTA / CONFIRMADA** | Trabajos, materiales, pasos conocidos y sus riesgos, observaciones de fauna bajo condiciones | Que Lera ya ha realizado misiones de VT2 o que sus miembros conocen secretos del jugador |
| **DESCUBRIBLE** | Piedra vieja del banco; discrepancia entre nota y noticia; cambio de uso de una zanja; rastro antes de ver al animal | Origen de piedra, causa oculta de un rastro, verdad universal de un rumor |
| **COMPATIBLE** | Motivo íntimo de Lera, recuerdos sensoriales ficticios, costumbre puntual de un hogar/individuo, diálogo original coherente | Que todos los humanos de Valdren piensan igual o se añade pasado canónico a Daro/Bren |
| **DUDOSA / CONTRADICTORIA** | Registro de que hay una tensión de fuentes y destinatarios | Presentarla como hecho cerrado en manuscrito |
| **RESERVADA** | Únicamente que existe una restricción y **revisión de los dos arquitectos** | Orígenes ocultos, secreto de especies, soluciones de tramas, pistas nuevas que adelanten misterios |

No se consultan ni reproducen contenidos protegidos de `world.json.secrets`, ni se asigna una explicación canónica a la piedra antigua, ni se convierte la ruta a la ciudad en una profecía.

### G2. Inventario inicial de arte original, con asociación concreta

**Todos los ficheros siguientes existen en** `vintage-telnet-2/client/art/places/`: `valdren-anime-v1.webp` (vista general); `valdren-fragua-anime-v1.webp` (fragua); `valdren_cobertizo-anime-v1.webp` (cobertizo); `valdren_patio_carros-anime-v1.webp`; `valdren_huertos-anime-v1.webp`; `edran_salida_huertos-anime-v1.webp`; `edran_acequia-anime-v1.webp`; `edran_surcos-anime-v1.webp`; `edran_zanja_antigua-anime-v1.webp`; `edran_era-anime-v1.webp`; `edran_terraplen-anime-v1.webp`; `edran_casa_camino-anime-v1.webp`; `edran_calzada-anime-v1.webp`; `edran_hito_campos-anime-v1.webp`; `veyra_puerta_campos-anime-v1.webp`.

**Criaturas verificadas en** `vintage-telnet-2/client/art/bestiary/`: `mordelinde-anime-v1.webp`, `espinajo-rastrojo-anime-v1.webp`, `cornalomo-anime-v1.webp`. Los valores de `creatures.*.illustration` los relacionan con el bestiario. Si en el futuro se autorizan encuentros humanos, se debe identificar su arte con la identidad **exacta** del adversario; un dibujo genérico de forajido no autoriza automáticamente una equivalencia con `salteador_veterano`.

**Estado de aprobación artístico:** **pendiente de cotejar** manifestaciones de aceptación, versión maestra, si el encuadre sirve a la escena, uso en libro y maquetación. **Prohibido publicar una imagen por el mero hecho de existir.** Se recomienda al Agente 04 una sola lámina de Valdren para arranque (si se aprueba), una de transición por tramo decisivo, y fauna sólo si aporta a la escena; esto es **propuesta visual**, no autorización ni nueva imagen.

## H. Guía directa de apoyo a capítulos 2, 3 y 4 — no es una ficha aprobada

### Capítulo 2 — «Lo que cabe en una mochila»

- **CONFIRMADO:** calles y conexiones exactas de plaza→fragua, plaza→cobertizo→patio; Daro y Bren tienen motivo laboral distinguible. La calle de la fragua ofrece transición de tejados y martillo. El patio tiene madero para calzar cargas, a diferencia del cobertizo donde se escucha una rueda.
- **COMPATIBLE:** Lera busca consejo o decide no pedirlo. Mostrar el peso de materiales y la preparación desde su propio punto de vista sin números de inventario ni precio que no se haya autorizado.
- **DESCUBRIBLE:** lo que una pieza gastada revela al observador sin afirmar que ya fue arreglada o que el carro completó el trayecto.
- **Bloqueos:** no colocar a Orven de forma automática; comprobar si Daro intervendrá en un diálogo original. No inventar parentesco ni misión.

### Capítulo 3 — «Más allá de las cercas»

- **CONFIRMADO:** `valdren_huertos` → `edran_salida_huertos` → `edran_acequia` → `edran_surcos`, con salidas este/este/norte; Lina pertenece al punto de salida. Acequia y losa, campo con sendero no sembrado.
- **COMPATIBLE:** una huella o movimiento bajo el rastrojo que cambie cómo pone Lera el pie, sin exigir combate; situación pequeña con causa y efecto. El lector puede aprender a observar sin que el narrador explique «reglas».
- **DESCUBRIBLE:** sonido bajo las plantas, causa aún no vista. Si la escena termina sin revelar criatura, no presentarla como certeza de Lera.
- **Bloqueos:** tensión Saltalodo (§F1); su aparición **no** se autoriza por este dossier. La ficha del capítulo 3 todavía requiere aprobación editorial antes de escribirlo.

### Capítulo 4 — «El lenguaje de las huellas»

- **CONFIRMADO:** en `edran_surcos` está documentado el Espinajo; los alrededores conectados permiten seguir al este a la zanja o al norte hacia el lindero. Mordelinde y Cornalomo pertenecen a otras salas de la salida/terraplén/calzada.
- **COMPATIBLE:** la protagonista interpreta un rastro de forma incompleta y rectifica al tener nueva información física. Un animal puede huir, detenerse o defender su parcela sin que la solución sea vencerlo.
- **DESCUBRIBLE:** huellas profundas o tallos movidos son prueba de **algo observable**, no historia total del animal ni poder oculto.
- **Bloqueos:** Arquitectura Editorial debe seleccionar un tramo y una criatura/rastro concretos, además de decidir si el itinerario sigue por zanja/era u otra alternativa. El Capítulo 4 **no está autorizado** para redacción.

## I. Decisiones, entrega y extracto para Segundo Cerebro

### Decisiones que se piden ahora en PR #706

| Materia | Propuesta documentada | Autoridad | Estado |
|---|---|---|---|
| Ruta C3 | Huertos → cercas → acequia → surcos, como ya propone ficha 003 | Arquitecto Editorial + cotejo VT2 | **Conexiones confirmadas; escena sin aprobar** |
| Ruta C4+ | Opción zanja → era → terraplén → casa de camino → calzada → hito → puerta | Arquitecto Editorial + Arquitecto VT2 | **Ruta real confirmada; secuencia editorial compatible, no obligatoria** |
| Encuentro fauna | Preferencia inicial por Espinajo o observación distante de Mordelinde/Cornalomo según sala | Arquitectura Editorial, revisión VT2 y Revisor 03 | **No asignado a un capítulo concreto** |
| Saltalodo en Edran | Documentar contradicción `edran_acequia.day` vs `world.json`; omitir en novela por ahora | Arquitecto VT2 y Arquitecto Editorial | **TENSIÓN PENDIENTE; no fusionar como resuelta** |
| Personajes de C2 | Daro/Bren sin parentescos originales ni misiones ejecutadas | Arquitectura Editorial y VT2 | **Uso posible bajo revisión; Orven aún pendiente** |
| Arte | Validar master/estado e idoneidad por escena | Agente 04 bajo Arquitectura Editorial | **NO aprobado para libro por este expediente** |

### Advertencias de continuidad inmediatas al Escritor 01

1. Capítulo 1 autorizado **solo dentro de Valdren**; Lera es original de novela y no una misión de VT2. `valdren_plaza` y `valdren_huertos` incluyen acciones ambientales sin NPC nombrado; **no** convertir esos habitantes genéricos en conocidos oficiales de Lera.
2. Fragua y patio de carros no conectan directamente con la plaza sin salas intermedias. No incluir tránsito instantáneo ni atribuir a Daro o Bren hechos que no se les consultaron.
3. Un banco alrededor de piedra antigua es observable; **su origen no**.
4. Si más adelante aparece la acequia de Edran, **no** usar Saltalodo hasta resolver el dato divergente.
5. La puerta de Vaisgard **no** aparece visualmente desde `edran_hito_campos` aunque el hito oriente hacia ella. Entrada real: `edran_hito_campos --NORTE--> veyra_puerta_campos`.

### Extracto para consolidación posterior (NO PUBLICAR DIRECTAMENTE)

**Qué se investigó:** la ruta documentada entre Valdren y Puerta de los Campos y las condiciones canónicas de hasta cuatro primeros capítulos planeados, vinculadas a fuentes exactas y corte SHA.

**Qué se confirmó:** las transiciones plaza→huertos→Cercas Bajas→acequia→surcos; una ruta adicional continua por zanja seca, era, terraplén, casa de Aren, calzada e hito hasta `veyra_puerta_campos`; labores concretas de Daro/Bren/Aren y otras personas; señales ecológicas de Mordelinde/Espinajo/Cornalomo; arte localizado pero no aprobado. La piedra antigua de plaza/muros carece de atribución de origen.

**Qué se descartó:** inventar caminos directos entre fragua y patio, dar tiempos de viaje a partir de atlas esquemático, suponer que el protagonista ejecutó una quest, insertar automáticamente a Orven, dar a los NPC recuerdos originales de Lera, presentar el Saltalodo de la acequia como fauna de Edran sin aclaración, y reutilizar arte sin aprobación.

**Tensión abierta:** divergencia explícita de Saltalodo entre la descripción diurna de `edran_acequia` y `world.json.creatures.saltalodo`. No corregida por el Historiador.

**Responsables:** co-revisión de Arquitecto Editorial y Arquitecto VT2 **dentro de PR #706**; autorizar fichas de C2–C4 antes de escribir; Director de Arte coteja recursos de libro; el Arquitecto Editorial es el único autorizado a trasladar conocimiento duradero a `vaisork/Conocimiento`.

**Cierre funcional:** EXPEDIENTE 01 completado como ampliación documental de la **misma PR #706**, pendiente de decisión de revisión. **Sin capítulos escritos por este agente. Sin cambios de canon, juego, arte, runtime, despliegue o Segundo Cerebro.**