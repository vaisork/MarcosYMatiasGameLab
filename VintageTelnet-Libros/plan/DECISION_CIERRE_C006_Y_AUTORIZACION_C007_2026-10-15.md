# Decisión editorial — cierre C006 y autorización del Capítulo 007

**Proyecto:** *Crónicas de Vaisgard*, Libro I «El primer camino». **Fecha:** 15 de octubre de 2026.  
**Autoría:** [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705). **Revisión literaria/canon:** [PR #707](https://github.com/vaisork/MatiasGameLab/pull/707). **Historiador:** [PR #706](https://github.com/vaisork/MatiasGameLab/pull/706). **Publicador:** [PR #708](https://github.com/vaisork/MatiasGameLab/pull/708).

## 1. Veredicto actual sobre C006

**Capítulo 006 «El camino no espera»: APROBADO LITERARIAMENTE por Arquitectura Editorial**, sobre manuscrito vigente `capitulos/006-el-camino-no-espera.md`, **blob `27365396a724f92556a8bf2050208bd209f2e6fa`**, aproximadamente 2,370 palabras. Matriz actual `capitulos/006-continuidad-y-revision.md`, **blob `e70b467c0544224962a21407b7720b7c2dc00003`**.

Cotejé la prosa íntegra y el dictamen `DICTAMEN_07_CAPITULO_006_EL_CAMINO_NO_ESPERA.md` de #707, emitido sobre la versión anterior `4e5efd10a357ef2ca868b279dae619922cb14444`. La única observación L01 está **resuelta en el manuscrito vigente**: ahora Lera encuentra «la parte alta de la tercera piedra, por encima del agua», sin suponer borde seco bajo lluvia. Revisor 03 debe dejar **adenda de cotejo puntual** del SHA actual, sin repetir dictamen ni reabrir C001–C005.

**Logros conservados:** salida desde Casa del Camino a calzada de dos parches; lluvia transitoria y franja de hierba; hito y tres piedras; la puerta NO aparece desde el hito; murallas y arco solamente al cruzar hacia `veyra_puerta_campos`. Las viñetas de Dravak/Felaryn/guardiana se apoyan en `veyra.json`. Lera **cruza el arco de Vaisgard**, pero no conoce aún el mercado ni la ubicación de Dalia. Las lesiones/objetos se conservan (carta seca sin entregar, taza, cantimplora parcialmente repuesta, bota y media húmedas, palma raspada y hombro dolorido). No se afirma acceso automático a plaza ni secretos fundacionales.

**La aprobación literaria no equivale a visto bueno conjunto de canon VT2, permiso de merge ni publicación definitiva**. Bloqueo de co-decisión Arquitecto Editorial + VT2 vigente en #705 y #706.

## 2. AUTORIZACIÓN FORMAL, WIP=1 — únicamente C007

**Escritor 01 AUTORIZADO a redactar el Capítulo 7** en la misma rama de [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705). **Título de trabajo: «Entre cargas y nombres»** (puede evolucionar si la trama lo justifica; el índice antiguo llamaba a C007 «Una deuda pequeña» y está desactualizado en ubicación).

**Entregables exclusivamente**:
- `VintageTelnet-Libros/capitulos/007-entre-cargas-y-nombres.md`
- `VintageTelnet-Libros/capitulos/007-continuidad-y-revision.md`

**Prohibido iniciar C008 sin cierre/permiso posterior.** Orientación 2,000–2,700 palabras solo si cada escena agrega conflicto y consecuencia.

### 2.1. Apertura/espacio de C007

C006 concluye **inmediatamente tras cruzar el arco** de la Puerta de los Campos. La transición correcta en `vintage-telnet-2/content/regions/veyra.json` es:
- `veyra_puerta_campos --este--> veyra_barrio_cargas` («Calle de los almacenes»), con escaleras externas sobre puertas de almacén, carros lentos, una **raya pintada** para mantener despejadas las entradas, arrieros que protegen los drenajes cuando llueve.
- `veyra_barrio_cargas --este--> vaisgard_mercado` («Mercado de Vaisgard»), con puestos apoyados sobre piedra antigua, cestas, toldos, una acequia/canalillo y tránsito de varias rutas.
- `vaisgard_mercado --norte--> veyra_plaza_rutas` (Plaza de las Cinco Rutas), que puede **verse como siguiente destino** pero NO aparecer saltándose el mercado. No obligar a recorrerla aún en C007.

**Condición de la protagonista:** una bota y media mojadas por cruce, lluvia menguando, carta bajo chaqueta, taza con asa torcida, cantimplora parcial, palma raspada y hombro dolorido. Lera llega desde **Valdren** y experimenta contraste de escala urbana; ni Aren ni otros del viaje se teletransportan con ella.

### 2.2. Giro dramático: actuar para encontrar a Dalia, no solo visitar lugares

Este capítulo debe hacer que Lera **dé su primera acción concreta para buscar a Dalia**: formular a alguien una pregunta, admitir que carece de señas suficientes y elegir dónde preguntar mejor. **NO** atribuir a Dalia domicilio, trabajo, NPC, familia, presencia en mercado ni conocimiento de su paradero sin nueva ficha/editorial; no inventar una oficina oficial de búsqueda de personas o una garantía de encontrarla. Si el Escritor quiere usar un recuerdo privado de una frase de Dalia, debe marcarlo como **propuesta literaria** y someterlo en la matriz de continuidad (sin pretender que existía en capítulos anteriores).

Elegir **una tensión urbana diferente** de los peligros de C004–C006 y de los rumores de C005: por ejemplo el paso real de cargas en la calle de almacenes durante la lluvia, un drenaje que nadie debe cubrir, o la dificultad de hacerse oír sin interrumpir a quienes trabajan. Debe provocar una elección, pérdida de oportunidad, malentendido humano **no relacionado con otro rumor de carro** u otra consecuencia concreta que cambia cómo avanza la búsqueda de Dalia. Evitar acumular incidentes de agua/sacos/resbalones y no convertir el capítulo en manual del mapa.

Si aparece `veyra_bela` en el Mercado, su rol **CONFIRMADO** es comerciante de camino; puede saludar/comerciar/orientar sobre mercancías públicamente, **NO** ser omnisciente sobre Dalia ni dar misiones/atenciones no fundadas. De ser posible, que los diálogos ganen por espontaneidad y personalidad, no por repetir «hay que escuchar / comprobar lo que se sabe».

### 2.3. Nuevo tono urbano

Mostrar distinción entre personas de especies diferentes mediante gestos individuales y cotidianos, no descripciones de catálogo. Mantener tercera persona cercana a Lera, variedad en diálogos, pequeños momentos de humor, nueva sorpresa o apuesta emocional. **Presión dramática:** quizá Lera imagina que una ciudad tan enorme tendría a alguien dispuesto a escuchar su problema, y descubre que pronunciar «Dalia» a un extraño no basta. Eso deja a la protagonista con **una decisión activa**, no frustración estática.

**Cierre buscado:** Lera ha avanzado físicamente desde Puerta de los Campos a la Calle de los Almacenes y, preferiblemente, al Mercado. Realiza al menos una pregunta real acerca de Dalia y obtiene **un próximo paso concreto pero no una ubicación milagrosa**. La carta sigue sin entregarse. No introducir secreto de origen de ciudad, galería, cronología fundacional, peaje urbano inexistente, recompensa/XP, facción ni contacto con Dalia por azar.

### 2.4. Estructura del Libro I

**El propietario aceptó antes un objetivo de 15 capítulos + prólogo**. La llegada a Vaisgard en C006 reemplaza el hito geográfico antiguo del índice (C014) sin invalidar automáticamente la extensión aprobada por el propietario. **Conservar provisionalmente 15**, trasladando C007–C015 a una trama urbana y emocional con variedad real, y revisar si nueve capítulos urbanos producen conflicto suficiente. El Historiador sugirió una novela de 11–13 si nueve capítulos resultan repetitivos, pero **no recortar unilateralmente** sin nueva decisión del propietario. El Arquitecto Editorial debe reestructurar el índice **por actos**, no trasladar mecánicamente todos los títulos viejos a nuevos lugares; presentar a quien dirige el proyecto cualquier propuesta de acortar antes de ejecutarla.

## 3. Coordinación y bloqueo

- **Escritor #705:** comenzar solo C007, prosa + matriz. No reabrir C001–C006, no editar juego.
- **Editor #707:** adenda puntual L01 de C006, luego esperar y revisar C007 completo (nuevo ritmo, urbanidad, iniciativa hacia Dalia, canon de Bela si aparece).
- **Historiador #706:** usar Nota 05 de acceso a Veyra como base **suficiente**; solo verificación específica si un personaje/hábitat/ubicación del C007 lo requiere. No otro atlas. Dejar explícito que Dalia no es NPC VT2.
- **Publicador #708:** actualizar prelectura interna EPUB a **prólogo + seis capítulos revisados**, con índice y fuente SHA; **BORRADOR / NO CANON FINAL**, sin inventar aprobación de arte, EPUBCheck o entrega Drive.
- **Arquitecto VT2 + Editorial:** se solicita co-decisión **antes de merge/publicación** sobre (i) prólogo VT1/VT2 sin historia fundacional inventada, (ii) hechos/personajes exclusivos del libro, incluyendo actividades urbanas, Aren y Dalia, (iii) límite abierto/descubrible/reservado de ciudad/quests, (iv) divergencia Saltalodo Edran/Lethra. La pregunta sobre continuidad propia del libro es si Dalia puede tener una identidad/localización ficticia urbana que no altere NPCs del videojuego; requiere **marco de compatibilidad**, no que VT2 escriba su biografía.
- **Prohibido** fusionar o distribuir como edición definitiva sin resolución conjunta de contradicciones y autorización específica.

**La planificación de escritura puede continuar en C007 mientras se revisan las reservas de canon; no publicar final entretanto.**
