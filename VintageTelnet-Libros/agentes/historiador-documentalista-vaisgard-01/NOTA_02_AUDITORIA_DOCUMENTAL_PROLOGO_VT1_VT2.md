# Nota 02 — Auditoría documental del prólogo: VT1 frente a VT2

**Agente:** Historiador y Documentalista — 02 (`historiador-documentalista-vaisgard-01`)  
**Entrega:** PR [#706](https://github.com/vaisork/MatiasGameLab/pull/706) · WIP=1 · encargo de Arquitectura Editorial en comentario [#6185292819](https://github.com/vaisork/MatiasGameLab/pull/706#issuecomment-6185292819).  
**Objeto:** cotejar el **PRÓLOGO** «El mundo que permanece» (PR #705), **no** un epílogo. Sin reescritura del manuscrito.  
**Versión exacta leída:** `VintageTelnet-Libros/prologos/001-el-mundo-que-permanece.md`, rama `editorial/cronicas-vaisgard-agente-01-voz`, blob `fb56d488e7acafad428e673d80039e88ba28b38c`.  
**Fuente histórica:** `vintage-telnet/KNOW_THE_WORLD_MENU.md`, **VT1**, blob `36f224e8d7e5d4eea041e2337d7e3ae5736e82ad`.  
**Autoridad vigente:** `vintage-telnet-2/docs/CANON_VIGENTE.md` (blob `37edf65a4419c54bc1a27f6613244ba32bafe128`), `CANON_EXPANSION.md` (blob `ca42d1aa00cc38a1791a0f224fed98a7cca7fb6f`) y `content/regions/{veyra,edran,hoshai,korven,lethra,nhal}.json` (rama `main@316e722f59ebe1f8cef4a606d4190b584caf802a`).  
**Regla:** **CONFIRMADO** (VT2), **COMPATIBLE** (prosa no canonizada), **DUDOSO** (no acreditado), **RESERVADO** (no revelar). Acceso público **ABIERTO/DESCUBRIBLE/RESERVADO** es una clasificación independiente de certeza.

## 1. Conclusión ejecutiva

**DICTAMEN DOCUMENTAL: COMPATIBLE CON RESERVAS ACOTADAS, APTO PARA REVISIÓN CONJUNTA, NO CANON APROBADO.** En su versión cotejada, el prólogo **no declara quién construyó Vaisgard, no determina una cronología fundacional de los cinco pueblos y no revela las galerías ni los secretos** que el texto histórico de VT1 mencionaba. Mantiene las cinco especies, las cinco localidades de referencia y la región central Veyra de forma consistente con la guía actual de VT2. Su escena de mercado es **recurso literario original plausible**, no registro de un suceso que necesariamente ocurrió en el juego.

La fuente `KNOW_THE_WORLD_MENU.md` fue creada para la pantalla inicial de **VT1**, no como certificado de pasado histórico de VT2. Lo aprovechable es **la intuición de un mundo habitado y la descripción general**, no la literalidad histórica ni la invitación al jugador o las reglas de clase. El prólogo de #705 se lee **ANTES** de C001 y su imagen final de una viajera con carta pertenece únicamente a la ficción del Libro I.

## 2. Tabla puntual de contraste

| Tema y lugar en los documentos | VT1 histórico | VT2 vigente | Estado de la adaptación del prólogo |
|---|---|---|---|
| **Vaisgard antigua**: `KNOW_THE_WORLD_MENU.md §1, §4`; prólogo «La ciudad que no tiene una primera página» | Afirma ciudad previa a la historia de cinco especies y generaciones que **la encontraron** | `docs/CANON_VIGENTE.md`: **se ignora quién levantó las piedras más antiguas**; `regions.veyra` y `rooms.vaisgard_mercado.description` no las atribuyen a fundador | **CONFIRMADO** el origen **desconocido**, y las reparaciones contemporáneas sobre piedra anterior. **DESCUBRIBLE**, sin resolución. El prólogo conserva la incertidumbre. |
| **Cronología de poblamiento**: VT1 §1, §3, §4 | Asegura que las cinco poblaciones vivieron primero en Vaisgard y, **sin guerra**, emigraron gradualmente y fundaron pueblos | `docs/CANON_VIGENTE.md` y `CANON_EXPANSION.md` **no cierran** esa secuencia histórica, edad ni causa | **DUDOSO** como historia universal de VT2. **Correctamente omitido** del prólogo. No reintroducir «fueron las primeras generaciones», «salieron todos juntos», «fundaron por adaptación» o «nunca hubo conflicto». |
| **Infraestructura subterránea**: VT1 §1, §4 | Describe depósitos, galerías y niveles bajo la ciudad antigua, sin mapa completo | VT2 mantiene el **origen del núcleo antiguo sin resolver** y distingue pistas/reservas; ningún permiso editorial autoriza explicación subterránea general | **RESERVADO / riesgo de spoiler**. El prólogo **no** nombra galerías, accesos, capas secretas ni mecanismos. **Mantener esa omisión**. No tomar descripciones de VT1 como instrucciones de escenografía histórica. |
| **Humanos, Felaryn, Dravak, Marevyn, Vesperi**: VT1 §2; prólogo «Cinco maneras...» | Cinco anatomías, pero también rasgos generalizados según especie | `docs/CANON_VIGENTE.md`: humano ordinario; Felaryn con cola, pies digitígrados y salto, **sin vuelo**; Dravak compacto con placas y vibración por **sólidos**, **no dragón**; Marevyn alto, membranas interdigitales, **respira aire**; Vesperi ojos grandes y oído, **sin alas ni ecolocalización** | **CONFIRMADA** la biología básica que se usa. Mercado muestra individuos, no arquetipos morales ni clase obligatoria. Un comerciante Vesperi que oye un cambio de cifra es **escena COMPATIBLE**, no prueba de poder para detectar mentiras. |
| **Cinco pueblos y la cuenca**: VT1 §3; prólogo «Los hogares...» | Valdren/Edran, Khariel/Hoshai, Brumak/Korven, Narevia/Lethra, Velmora/Nhal y Vaisgard/Veyra | `docs/CANON_VIGENTE.md` y `regions.<id>` confirman las **seis áreas** y asentamientos | **CONFIRMADOS** nombres, regiones y materiales de trabajo visibles. **COMPATIBLE** la selección de ejemplos; no probar con ella una historia migratoria. |
| **Vaisgard como reunión y rutas**: VT1 §4 | Centralidad del mercado y cinco rutas | `regions.veyra`, `rooms.vaisgard_mercado`, `rooms.veyra_plaza_rutas`: comercio, tránsito y acceso a cinco regiones; rutas y salidas específicas en JSON | **CONFIRMADA** la función. La secuencia de cinco encuentros individuales en el mercado es **COMPATIBLE**, **no episodio o horario registrado** ni NPC fijo. |
| **Piedras sobre piedra, patios y agua**: prólogo primer apartado | VT1 atribuye adaptaciones a distintas generaciones | `CANON_EXPANSION.md §Veyra` registra usos actuales de patios, canal y muros; `rooms.vaisgard_mercado` describe reparaciones y bases antiguas | **CONFIRMADO** el contraste entre piedra antigua y trabajo actual. **COMPATIBLE**, no cronología fechada, imaginar actos repetidos de reparación en tiempos indeterminados. |
| **Puerta que se abre; carta final**: final del prólogo | VT1 interpela al jugador antes de empezar | `regions.veyra` tiene puertas y tráfico; Lera y carta están en decisiones del **Libro I**, no como NPC/quest VT2 | **COMPATIBLE** como imagen de transición a C001. **DUDOSO** interpretar «una puerta se abre» como cierre con hoja móvil literal: las salas establecen un arco de paso, no obliga a una puerta física que se abre. Es metáfora posible, no evento mecánico. |

## 3. Análisis por especie y asentamiento, sin extrapolaciones

- **Humano/Valdren/Edran — CONFIRMADO:** comunidad de agricultura, acequias, cargas, fragua y reservas. `regions.edran.identity`, `rooms.valdren_plaza`, `rooms.valdren_huertos`. En el mercado, una humana prudente con la correa es un **personaje puntual COMPATIBLE**, no conducta humana universal.
- **Felaryn/Khariel/Hoshai — CONFIRMADO:** equilibrio corporal, cola, pies digitígrados; terrazas, apoyos y caminos de altura. `regions.hoshai.identity`, `docs/CANON_VIGENTE.md`. Que un Felaryn se aparte hábilmente en una escalera urbana es **COMPATIBLE**; no afirmar poderes sobrehumanos no documentados ni que todas las personas de Khariel prefieran saltar.
- **Dravak/Brumak/Korven — CONFIRMADO:** figura baja y compacta, placas pequeñas de aspecto pétreo, sentido vibratorio a través de suelo **sólido**. `regions.korven.identity`, canon. La caja calzada del mercado es **COMPATIBLE**; comprobar madera con mano evita atribuir certeza total a una vibración. Brumak está **en superficie**, no reino bajo tierra.
- **Marevyn/Narevia/Lethra — CONFIRMADO:** gran altura relativa, membranas interdigitales, vida ribereña y respiración aérea, plataformas y pasarelas. `regions.lethra.identity`, canon. El tejido húmedo y su vendedora son **COMPATIBLES**. «Aprendieron a convivir con los humedales» se lee como caracterización de usos presentes, **no** como relato probado de fundación.
- **Vesperi/Velmora/Nhal — CONFIRMADO:** ojos grandes, oído sensible, poca luz; refugios bajo bosque y lámparas orientadas a tareas. `regions.nhal.identity`, canon. Percibir el **sonido de una cifra distinta** requiere haber escuchado ambas declaraciones, no un poder para saber si el vendedor mintió. No alas, vuelo ni oscuridad mágica.

**Advertencia cultural:** `CANON_EXPANSION.md` es más detallado sobre trabajo y experiencias; no elevar ejemplos concretos a valores morales innatos de especie. Un NPC de novela sin ID en el JSON **no adquiere** historia compartida ni función del juego.

## 4. Tensiones y correcciones editoriales mínimas

| Riesgo | Severidad | Observación precisa | Medida propuesta / responsable |
|---|---|---|---|
| Uso de **fundación y salida de cinco pueblos** tal como VT1 lo relata | **Alta si se reintroduce; ausente en blob leído** | Es narrativa histórica de VT1, no hecho certificado de VT2; la introducción actual habla de relatos parciales y vida presente | Mantener omisión; co-revisión VT2 + Editorial si alguna futura versión lo restituye |
| Mención de **galerías bajo Vaisgard** | **Alta si se reintroduce; ausente en blob leído** | Texto VT1 sugiere estructuras sin que VT2 haya autorizado su exposición | No añadir; reservar al Arquitecto VT2/Editorial |
| Primer párrafo en pasado «**No estaba vacía de posibilidades. Había patios...**» | **Baja / matiz de enfoque** | Podría interpretarse como reconstrucción segura de la ciudad **en la primera ocupación** | Si se busca máxima prudencia, en revisión futura anclarlo al uso continuado o a lo que **hoy** puede observarse; no exige detener C002 ni retocar por cuenta del Historiador |
| «**Una puerta se abre**» | **Baja / imagen literaria** | `veyra_puerta_campos` describe el **arco ancho** y el paso, no hoja móvil ni apertura literal | Conservar como figura estilística, o cambiar por «el paso recibe a alguien» si la revisión quisiera precisión física; no declarar cambio de canon |
| Mercado con cinco viñetas y personas anónimas | **Ningún choque de canon detectado** | No hay una mañana «registrada» en los JSON en la que coincidan esos cinco individuos | Mantener como **ficción COMPATIBLE** que ilustra convivencia; no tratarlos como NPC fijados por el juego |

## 5. Decisión solicitada dentro de #706 (y remisión a #705/#707)

1. **Arquitecto VT2:** confirmar que el prólogo puede usar como conocimiento **público** la antigüedad sin fundador conocido, las cinco morfologías, seis regiones y cinco rutas; que **ninguna** cronología fundacional de VT1 pasa automáticamente a VT2 y que toda sugerencia de subsuelo queda fuera del libro hasta nueva aprobación.
2. **Arquitecto Editorial:** ratificar que las viñetas del mercado, la frase de la puerta y la evocación de usos de patios son **libertades literarias**, no hechos del juego; valorar si ajustar el matiz menor del tiempo pasado.
3. **Revisor Integral #707:** esta es una **auditoría documental de hechos**, no un nuevo dictamen de ritmo o de voz; el texto revisado `fb56d48...` **no contiene contradicción factual grave identificada** en los temas autorizados. Relectura literaria separada en su PR.
4. **Alcance:** validación de prólogo **solo para el Libro I**; no crear lore aplicable al videojuego sin contrato, PR y revisión propios. **No fusionar** hasta registrar aprobación conjunta y resolver cualquier contradicción real.

## 6. Registro de conocimiento para el Arquitecto Editorial

**Aprendido:** la antigua página de bienvenida de VT1 contiene más afirmaciones históricas que las hoy confirmadas por VT2. El método seguro es usarla como **fuente de tono e inspiración**, verificar cada hecho en VT2 y preservar duda donde los archivos actuales no resuelven origen/cronología. Un mercado verosímil no es una bitácora de eventos jugados.

**Confirmado:** nombres de regiones/pueblos; cinco especies y limitaciones corporales; uso actual de Vaisgard como centro de rutas, mercado y piedra vieja; origen de los muros antiguos desconocido.

**Descartado para manuscrito:** fundación conjunta inequívoca, éxodo sin conflicto narrado como hecho, galerías y secretos inferidos, estereotipos de especie y mecánicas del menú VT1.

**Abierto:** visto bueno del Arquitecto VT2 a la frontera de hechos; decisión editorial sobre dos posibles matices literarios. **Segundo Cerebro:** solo Arquitectura Editorial decide consolidación; el Historiador no modifica `vaisork/Conocimiento`.

---

**Firma:** Historiador y Documentalista — Agente 02 · *Crónicas de Vaisgard*. **Auditoría documental del PRÓLOGO cerrada para revisión conjunta; no es licencia de fusión o publicación.**
