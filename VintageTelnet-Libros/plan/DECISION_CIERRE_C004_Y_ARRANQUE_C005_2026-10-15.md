# Decisión del Arquitecto Editorial — cierre literario C004 y autorización exclusiva C005

**Proyecto:** *Crónicas de Vaisgard*, Libro I: *El primer camino*.  
**Fecha:** 15 de octubre de 2026 (México).  
**Repositorio:** `vaisork/MatiasGameLab`, rama/PR de autoría [#705](https://github.com/vaisork/MatiasGameLab/pull/705).  
**Dictamen de Editor 03:** [PR #707, ADENDA_05_C004_CORRECCIONES_VERIFICADAS](https://github.com/vaisork/MatiasGameLab/blob/editorial/revisor-canon-vaisgard-01-dictamen-705/VintageTelnet-Libros/agentes/revisor-canon-vaisgard-01/ADENDA_05_C004_CORRECCIONES_VERIFICADAS.md).  
**Apoyo histórico:** [PR #706, NOTA_03_APOYO_LOCAL_C003_C004_EDRAN](https://github.com/vaisork/MatiasGameLab/blob/editorial/cronicas-vaisgard-agente-02-inventario-canon/VintageTelnet-Libros/agentes/historiador-documentalista-vaisgard-01/NOTA_03_APOYO_LOCAL_C003_C004_EDRAN.md).

## 1. Decisión vigente sobre los cuatro capítulos

**C004 «El lenguaje de las huellas» — APROBADO LITERARIAMENTE por Arquitectura Editorial**, sobre archivo `capitulos/004-el-lenguaje-de-las-huellas.md`, **blob `fe2ef09ca3c363e324ebf2228ad896a4f349b27c`**, registro `004-continuidad-y-revision.md` blob `528416699c217d3e630403198a474f2e85fbe649`. Se cotejaron el manuscrito y la adenda final #707: L01 resuelta (casa visible **después** de mitad de cuesta), L02 resuelta (porteador propone partir saco; persona del saco consiente). No hay cambios literarios pendientes. El soporte documental #706 confirma itinerario, faena anónima y comportamiento de Espinajo sin contradicción dura.

C001, C002 y C003 ya constan **aprobados literariamente** por Arquitectura y Revisor 03 tras correcciones; **no reabrir** observaciones resueltas por inercia.

**NO EQUIVALE A APROBACIÓN DE CANON VT2 NI A AUTORIZACIÓN DE MERGE O PUBLICACIÓN FINAL.** Están abiertas: delimitación de personajes/hechos exclusivos de novela (Lera, Mara, Dalia, Sabel; riego/canaleta/tablilla; trabajadora, cantimplora, carro, porteador), contraste VT1→VT2 del prólogo, y la divergencia Saltalodo Edran/Lethra. Los arquitectos Editorial + VT2 deben resolverlo y registrarlo expresamente, con fuente y alcance. El historiador no sustituye la autoridad de VT2.

## 2. AUTORIZACIÓN FORMAL: Escritor 01 puede redactar solo C005 (WIP=1)

**Capítulo 005, título provisional «Una historia a medias».** Preparar en la misma PR #705:
- `VintageTelnet-Libros/capitulos/005-una-historia-a-medias.md`
- `VintageTelnet-Libros/capitulos/005-continuidad-y-revision.md`

**No C006 todavía.** El C005 sucede inmediatamente después del cierre de C004. Duración sugerida ~2,000–2,700 palabras, determinada por escenas y ritmo, no por cuota.

### 2.1. Apertura obligatoria: pagar de inmediato el final del C004

Lera está en el **terraplén de Edran**, pasada la mitad del ascenso pero aún **antes de entrar en la Casa del Camino**. Tiene raspadura leve en la palma, hombro dolorido, **cantimplora casi vacía** tras el derrame causado al apartarse de un carro, carta terminada pero sin entregar, taza en bolsillo exterior; un **porteador anónimo** y una **persona cansada con saco demasiado pesado** están con ella. Esta última acaba de preguntar «¿Les queda un poco de agua?».

**Resolver la petición al comienzo del capítulo con decisión y consecuencia visibles.** Puede ofrecer una cantidad moderada y gestionar luego abastecimiento, o explicar lo que le queda y ayudar a llegar a la casa, siempre con consentimiento y sin suponer que allí el agua será libre o abundante. Si opta por compartir su última reserva, esa pérdida debe importar durante la escena. Evitar otra página de introspección moral o un truco en que aparecen recursos gratis. La dificultad de cuerda insuficiente para dividir el saco **no desaparece** por arte de narrador; la persona dueña del saco decide sobre su carga.

### 2.2. Desplazamiento comprobado, sin teletransportes

**Ruta autorizada en `vintage-telnet-2/content/regions/edran.json`:**
- `edran_terraplen.exits.norte = edran_casa_camino`;
- `edran_casa_camino.exits.sur = edran_terraplen`, `exits.norte = edran_calzada`;
- `edran_calzada.exits.sur = edran_casa_camino`, `exits.norte = edran_hito_campos` (el tramo calzada es **opcional** para el cierre, no hay obligación de avanzar tanto en C005).

**Casa del Camino — hechos públicos verificados:** puerta abierta a viajeros, mesa alta seca, fuego y olor a sopa, cargas húmedas junto a entrada, casillas de mensajes para Vaisgard. Allí opera **Aren**, lector de mensajes `edran_aren`, personaje **canónico del juego** que exige respeto a sus temas y conocimiento; los documentos escritos y noticias pueden confundirse. **No** atribuir a Aren una misión completada, un vínculo anterior con Lera ni hechos que sólo su archivo de NPC o flags condicionales pueden saber. Su aparición con diálogo requiere cotejo con `edran.json > npcs.edran_aren` y el Historiador #706; cualquier escena añadida debe distinguir la **ficción del libro** de los datos públicos del juego. Alternativa editorial: diálogo con personas anónimas de paso antes de que Aren participe; no inventar autoridad fija que duplique al NPC.

### 2.3. Conflicto real del capítulo: noticia incompleta con un costo

Conservar el título provisional «Una historia a medias» **solo si se dramatiza una noticia con fuentes parciales**. Hay base de canon en `rooms.edran_casa_camino.examine.nota`: trata de una **carga detenida por una rueda que se repara**, sin demostrar desaparición ni retención. `npcs.edran_aren` pide procedencia, orilla/lugar y hora de los testimonios. Eso permite una escena con dos versiones de un hecho mundano: una persona transmite rumor alarmista; un escrito sólo certifica una reparación. Lera puede descubrir que divulgar una interpretación antes de saber la fuente **perjudica a alguien**. No se obliga a escribir el rumor ni se convierte automáticamente en la misión oficial de Elva/Lio, ni se consume el desenlace de secretos del juego.

**Preferencia de ritmo:** una interacción genuina y una decisión que comprometa su camino —acompañar un trecho, retrasar un recado, corregir una noticia ante alguien o renunciar a un atajo—. La lección debe resultar de hechos y diálogos, no de una moraleja explícita. La pregunta por Dalia sigue viva, pero no resolverla antes de Vaisgard.

### 2.4. Escena final útil para el arco

Cerrar con un cambio concreto: Lera llega a la Casa del Camino o comienza la calzada sabiendo que una noticia importante está mal contada, ha asumido un costo y conoce una necesidad no resuelta. **No otro final en que solo reflexiona sobre escuchar, mirar o prometer.** No saltar a la Puerta de los Campos en C005 por comodidad.

**Precaución estructural:** el esquema de 15 capítulos es **objetivo de novela completa, no una orden de alargar artificialmente las tres salas restantes hasta Vaisgard**. Historiador y Arquitectura Editorial deben revisar la cadencia general para C006–C015 y verificar ramales legítimos sin inventar distancias ni retener a Lera en Edran con trámites repetidos. Pueden ubicarse capítulos posteriores dentro de la ciudad **si el arco lo permite** tras co-revisión. No modificar de golpe el índice sin nueva decisión editorial.

## 3. Roles y permisos

- **Escritor #705:** único responsable de narrativa C005 y matriz. Consultar explícitamente canon `edran_casa_camino`, `edran_aren`, `edran_calzada`; si usa rumores/NPC asegurar procedencia y conocimiento. Entregar un solo manuscrito.
- **Historiador #706:** entregar **apoyo muy corto** a C005 sobre Casa del Camino, Aren, nota de rueda y calzada, antes de que el escritor incorpore material canónico dudoso; marcar ABIERTO/COMPATIBLE/DESCUBRIBLE/RESERVADO. Revisar ritmo geográfico futuro. No crear otro atlas.
- **Editor Integral #707:** C004 cerrado; cuando C005 exista, dictaminar la prosa real, agua compartida, continuidad de Lera/personajes, carácter/no spoilers de Aren, ritmo, geografía y fiabilidad de los rumores. No reabrir C001–C004 ya corregidos.
- **Director Arte/EPUB #708:** actualizar prelectura a `Prólogo → C001 → C002 → C003 → C004` usando SHAs **más recientes**. Ya existe EPUB ilustrado piloto **solo hasta C002**, sin EPUBCheck ni prueba de lectores: son tareas de QA, no prueba de distribución final. Preparar selección visual focalizada de salida/espinajo y zanja/terraplén, sin imágenes que desvelen un encuentro antes de narrarlo.
- **Arquitectos Editorial + VT2:** registrar co-decisión de canon **antes de fusionar o publicar**. **Publicar en Drive/entregar como final requiere autorización editorial separada**. Prueba EPUB interna marcada BORRADOR permitida; no sostener que el libro completo de 15 capítulos ya existe.

**No nuevos agentes, no cambios del juego, no merge automático, no nuevas automatizaciones.**
