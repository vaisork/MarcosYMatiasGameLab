# Expediente 00 — Atlas documental y continuidad inicial de *Crónicas de Vaisgard*

**Agente:** `historiador-documentalista-vaisgard-01` · Historiador y Documentalista — Agente 02  
**Proyecto:** *Crónicas de Vaisgard*, Libro I (*El primer camino*, título provisional)  
**Ubicación editorial:** `vaisork/MatiasGameLab/VintageTelnet-Libros/`  
**Fuente de canon:** `vaisork/MatiasGameLab/vintage-telnet-2/`  
**Corte consultado:** `main@316e722f59ebe1f8cef4a606d4190b584caf802a` · 14 de octubre de 2026, hora de México.  
**Estado:** investigación inicial entregada para revisión, **NO** Biblia aprobada ni ficha de capítulo. **WIP=1**.  
**Coordinación:** PR editorial de Agente 01 [#705](https://github.com/vaisork/MatiasGameLab/pull/705), borrador en rama independiente.  
**Alcance:** **solo lectura** del canon del juego; **ningún** archivo de `vintage-telnet-2/` modificado. **No** alterar `vaisork/Conocimiento`.

> **Leyenda:** **CONFIRMADA** = fuente vigente precisa; **COMPATIBLE** = opción de puesta en escena aún no canonizada; **DESCUBRIBLE** = indicio utilizable con límite; **DUDOSA** = requiere cotejo/decisión; **RESERVADA** = no trasladar a manuscrito ni a fichas abiertas. Cuando se cita una ruta de archivo, se entiende relativa a `vintage-telnet-2/`, salvo indicación contraria.

## A. Propósito y utilidad inmediata para el escritor

Ofrecer al Arquitecto Editorial un mapa **documental, no argumental** para elegir el arranque de Libro I sin adjudicar poderes, orígenes, parentescos, rutas ni acontecimientos inventados. Este expediente permite elegir un **lugar de inicio** y solicitar después **una ficha de capítulo** al escritor. No adelanta una trama aprobada.

**Regla operativa:** no convertir la presencia de una localización, criatura o imagen en autorización automática para emplearla en el capítulo. Su función narrativa, si procede, la determina Arquitectura Editorial; las tensiones de canon se coordinan en PR con Arquitectura VT2.

## B. Fuentes realmente consultadas

**Canon escrito y reglas** (lectura en el corte indicado):
- `AGENTS.md` y `docs/DECISIONES_VIGENTES.md`: restricciones y decisiones vigentes.
- `docs/CANON_VIGENTE.md`: identidad de seis regiones, cinco especies y límites de misterios.
- `CONTENT_CONTRACT.md`: significado de salas, salidas, habitantes, escenas, presencia y observación.
- `CANON_EXPANSION.md`: desarrollo de vida cotidiana, siempre cotejado con los JSON actuales.
- `docs/GUIA_NARRATIVA.md`: claridad para lector joven, atribución de causas y efectos.
- `docs/RECONCILIACION_DIVERGENCIAS_20261012.md`: advertencias sobre observaciones que no prueban hechos mayores.
- `content/world.json`: bestiario, ilustraciones y contratos auxiliares, **sin reproducir información de `secrets`**.
- `content/regions/{veyra,edran,hoshai,korven,lethra,nhal}.json`: mapa de escenas actuales, conexiones, personajes y ambientación.
- `content/spatial.json`: atlas técnico, no fuente de distancias literarias.
- Directorios `client/art/{places,bestiary,species,encounters}/` y manifiestos `place-variants.json` y `bestiary-thumbnails.json`: existencia y mapeo de ficheros, no aprobación editorial automática.

**Procedencia de las comprobaciones:** consulta remota de `main`, no copia histórica local. Los nombres e IDs de salas y NPC provienen de los JSON de regiones; las criaturas proceden de `world.json`. Las relaciones de rutas son **salidas explícitas de salas**, no líneas inferidas de un dibujo.

**Advertencia documental, DUDOSA:** `CONTENT_CONTRACT.md` describe una raíz de `world.json` que contiene `regions/rooms/npcs`, pero el `world.json` consultado contiene `version/creatures/items/quests/secrets` y los datos regionales viven en `content/regions/*.json`. Para hechos del atlas prevalecen **los archivos regionales reales**. Se solicita aclarar/documentar la discrepancia, sin tocar el juego.

## C. Hechos confirmados: atlas, pueblos y rutas

### C1. Seis regiones — seis comunidades de referencia

| Región canónica | Comunidad / sala ancla | Identidad para escenas | Estado |
|---|---|---|---|
| Cuenca de Veyra | **Vaisgard** · `vaisgard_mercado` | Mercado entre muros antiguos, cinco rutas, cargas, archivos y canalillos; se desconoce quién levantó las piedras antiguas. | **CONFIRMADA** |
| Llanos de Edran | **Valdren** · `valdren_plaza` | Huertos, campos, acequias, graneros, carros, fragua y cuidado cotidiano humano. | **CONFIRMADA** |
| Sierra de Hoshai | **Khariel** · `khariel_centro` | Terrazas, apoyos, cuerdas, carga, desniveles y tránsito de varias especies; presencia Felaryn. | **CONFIRMADA** |
| Pedrales de Korven | **Brumak** · `brumak_centro` | Casas de piedra en entrantes, mediciones, talleres, cauces y trabajo de los Dravak en superficie. | **CONFIRMADA** |
| Aguas de Lethra | **Narevia** · `narevia_centro` | Riberas, pasarelas, canales, embarcaciones y plataformas de viviendas Marevyn. | **CONFIRMADA** |
| Bosque de Nhal | **Velmora** · `velmora_centro` | Raíces, luz contenida, corteza, recipientes y memoria colectiva Vesperi. | **CONFIRMADA** |

Los seis JSON contienen en conjunto **191 salas** y **37 NPC** registrados al corte consultado; `world.json` contiene **37 entradas de criaturas y adversarios**. Estas cifras describen el **catálogo**, no cuántos lugares deberían salir en la novela.

**Diversidad física CONFIRMADA:** Humanos sin rasgo sobrenatural por especie; Felaryn humanoides felinos de cola y pies digitígrados, sin vuelo; Dravak bajos y compactos, con pequeñas placas pétreas, **no** dragones ni enanos cavernarios; Marevyn altos con membranas entre dedos, respiran aire y no habitan una ciudad submarina; Vesperi de ojos grandes y oído sensible, sin alas ni ecolocalización. No convertir capacidades narrativas en cifras de combate. `docs/CANON_VIGENTE.md`.

**Clases vigentes VT2 CONFIRMADAS:** **Juramentado, Arcano, Sombra y Artífice.** Vigía e Invocador son menciones históricas descartadas del roster, aunque aparezcan en documentos antiguos. `AGENTS.md`, `docs/DECISIONES_VIGENTES.md`. No forzar clase o especie al protagonista sin decisión editorial.

### C2. Enlaces entre regiones expresamente registrados

**Desde Veyra hacia las cinco regiones:**  
1. `veyra_puerta_campos` ↔ `edran_hito_campos` (**Edran**, puerta de campos).
2. `veyra_rampa_grava` ↔ `hoshai_estribacion` (**Hoshai**, primera subida).
3. `veyra_terraplen_roca` ↔ `korven_loma_cascajo` (**Korven**, loma pedregosa).
4. `veyra_hondonada_canales` ↔ `lethra_ribera_seca` (**Lethra**, ribera).
5. `veyra_lindero_arboles` ↔ `nhal_arbol_umbral` (**Nhal**, umbral del bosque).

**Otra conexión adicional Veyra-Edran:** `veyra_pastos_exteriores` ↔ `edran_vista_cuenca`.

**Caminos periféricos existentes; NO inventar trayectos:**
- Edran ↔ Korven: `edran_linde_piedra` ↔ `korven_borde_tierra`.
- Edran ↔ Lethra: `edran_puente_juncos` ↔ `lethra_hito_tierra`.
- Hoshai ↔ Korven: `hoshai_garganta_oeste` ↔ `korven_meseta_relevo`.
- Hoshai ↔ Nhal: `hoshai_estacion_cuerda` ↔ `nhal_relevo_altura`.
- Lethra ↔ Nhal: `lethra_relevo_raices` ↔ `nhal_ribera_relevo`.

Estos son **enlaces entre salas**, no promesas de trayecto en una jornada ni distancias medidas. Si el manuscrito necesita una duración, elegirla editorialmente con revisión canónica, nunca deducirla de coordenadas de `spatial.json`.

### C3. Localizaciones útiles a escala humana

**Valdren:** `valdren_plaza` (banco que rodea una piedra antigua, niños y semillas), `valdren_fragua` (trabajo de Daro), `valdren_cobertizo` (carros), `valdren_comedor` (atención a viajeros), `valdren_huertos` (cuidado de parcelas).  
**Vaisgard:** `vaisgard_mercado` (mercancías y voces), `veyra_plaza_rutas` (encuentro de rutas), `veyra_archivo_cargas` (registros de llegadas), `veyra_calle_toldos` (arreglos y convivencia), puertas territoriales.  
**Khariel:** `khariel_centro`, `hoshai_caseta_revision`, `hoshai_taller_apoyos`, `hoshai_mercado_cintas`.  
**Brumak:** `brumak_centro`, `korven_registro_cauce`, `korven_entrante_piezas`, `korven_cisterna_comun`.  
**Narevia:** `narevia_centro`, `lethra_taller_fibras`, `lethra_cuidado_barcas`, `lethra_cocina_reunion`.  
**Velmora:** `velmora_centro`, `nhal_patio_relato`, `nhal_taller_cortezas`, `nhal_mercado_setas`.

**Alcance:** localizaciones y oficios **confirmados**, no itinerario ya autorizado para Libro I.

### C4. Habitantes reales útiles al escritor

| Identificador actual | Persona | Especie · lugar · función canónica |
|---|---|---|
| `edran_daro` | **Daro** | Humano · Valdren · herrero; compara piezas para carros; no atribuir al viajero una reparación que hará Daro. |
| `edran_bren` | **Bren** | Humano · Valdren · cuidador de carros; pide precisión sobre ruedas y cruces. |
| `edran_elva` | **Elva** | Humana · Valdren · anfitriona; noticias de cargas y ausencias. |
| `edran_nela` | **Nela** | Humana · ruta de canal Edran · cuidadora del canal. |
| `veyra_nera` | **Nera** | Humana · Vaisgard · archivera de llegadas; distingue aviso de comprobación. |
| `veyra_tov` | **Tov** | Dravak · Vaisgard · porteadora de piedra; no tratar demora como robo. |
| `veyra_seli` | **Seli** | Marevyn · Vaisgard · remendadora de toldos; reparación afecta el desagüe. |
| `veyra_arel` | **Arel** | Vesperi · Vaisgard · mensajera de ruta; atribuye procedencia de advertencias. |
| `hoshai_iria` | **Iria** | Felaryn · Khariel · cuidadora de apoyos; no afirma seguridad sin comprobar tramo. |
| `hoshai_daren` | **Daren** | Humano · Khariel · maestro de reparaciones y apoyos. |
| `korven_oma` | **Oma** | Dravak · Brumak · revisora del cauce; separa observación y conclusión. |
| `korven_taren` | **Taren** | Dravak · Brumak · alfarera; proponer forma no equivale a fabricar pieza. |
| `lethra_mira` | **Mira** | Marevyn · Narevia · tejedora del paño común; hermana de Sola. |
| `lethra_sola` | **Sola** | Marevyn · Narevia · cuida embarcaciones; hermana de Mira. |
| `nhal_leris` | **Leris** | Vesperi · Velmora · narradora que atribuye relatos y deja huecos. |
| `nhal_elin` | **Elin** | Vesperi · Velmora · artesana de madera con perspectiva propia sobre un recipiente. |

**Precaución de nombres:** existen dos **Iria** distintas —`edran_iria` humana, guardiana de semillas, y `hoshai_iria` Felaryn, cuidadora de apoyos—. No fusionar identidades. **No trasladar al libro cada diálogo o encargo de VT2 como evento que ya ocurrió**: las historias del juego pueden ser variantes y dependen de acciones del jugador.

## D. Contexto narrativo: primeras rutas y criaturas observables

**Criterio:** escoger criaturas que ya tengan hábitat, reacción y señales, evitando que todo encuentro termine en combate. La tabla señala **presencias documentadas**, no propone alterar la dificultad de VT2.

| Tramo inicial real | Fauna/persona documentada | Función literaria respaldada |
|---|---|---|
| Edran, campos y linde pétrea (`edran_linde_piedra`) | **Mordelinde** (`mordelinde`); **Espinajo de rastrojo** (`espinajo_rastrojo`); **Cornalomo** (`cornalomo`) | Semillas y refugios; espinas defensivas; huellas profundas que permiten tomar distancia. |
| Veyra, subida a Hoshai (`hoshai_estribacion`) | **Saltacresta**, **Uñapiedra**, **Rasgacumbres** observado en altura | Pisadas en rocas, destreza natural y anuncio lejano de peligro mayor; presencia en el `wildlife_pool` no obliga encuentro. |
| Veyra → Korven (`korven_loma_cascajo`) | **Cascapedernal**, **Colagrieta**, indicio de **Quebrarrocas** | Golpes del caparazón, restos de líquenes, fisuras como refugio, piedras desplazadas. |
| Veyra → Lethra (`lethra_ribera_seca`) | **Mordijunco**, **Pinzajunco**, **Saltalodo**, entre otras | Juncos cortados, rastros laterales en barro, llamadas y salto al agua; respetar madrigueras. |
| Veyra → Nhal (`nhal_arbol_umbral`) | **Velomembrana**, **Roecorteza**, **Rondamusgo**, señales de **Rasgacorteza** | Planeo nocturno, tiras de corteza, semillas entre pelo y raíces; peligro de mayor tamaño sugerido por silencio/huellas. |
| Pasos de camino que documentan adversarios humanos | `forajido_camino` — **Salteador de cargas** | Individuo que exige equipaje: **no** representar a todo pueblo o especie ni hacer necesaria su muerte. |

Las descripciones y límites de reacción están en `content/world.json > creatures.<id>` y las presencias locales en `content/regions/*.json > rooms.<id>.wildlife_pool`. **No extrapolar** alimentación, reproducción, conductas mágicas, estadísticas, materiales o ataque que no consten allí.

**Ambientación confirmada útil para escenas:** tierra removida y sonidos de fragua en Valdren; mercado, pan, cuerda y canalillos en Vaisgard; aire fino, raíces, cuerdas y pasos de carga en Hoshai; polvo, cascajo y sombra de roca en Korven; juncos, barro y tablas en Lethra; hojarasca, copas, lámparas y voces contenidas en Nhal. Son fenómenos descritos en las salas vigentes, no fenómenos sobrenaturales nuevos.

## E. Propuestas compatibles — SIN rango canónico

1. **COMPATIBLE, a decidir:** abrir Libro I en Valdren a escala cotidiana (banco/plaza, fragua, carro, semilla) y usar el trabajo real de alguien como causa del desplazamiento. Si el Arquitecto elige otro origen, el expediente sigue siendo útil.
2. **COMPATIBLE:** introducir Vaisgard a través de la llegada de **una carga y su noticia**, antes de describir un gran misterio; distinguir testimonio, registro y resolución.
3. **COMPATIBLE:** una primera escena con fauna a distancia donde el protagonista aprende a no bloquear el refugio ni convertir el animal en enemigo por defecto.
4. **COMPATIBLE:** presentar un objeto ordinario que cambie de significado para dos personas, manteniendo sus recuerdos atribuidos, sin revelar secretos.
5. **COMPATIBLE:** reutilizar contrastes de materiales y oficios entre regiones como motivos literarios, sin homologar la psicología de toda una especie.

**No aprobar estas opciones por su publicación:** la selección y secuencia de Libro I son competencia del Arquitecto Editorial y su revisor de canon.

## F. Descubrible, dudoso y reservado — límites

- **DESCUBRIBLE:** la antigüedad de piedras y muros en Vaisgard y el banco de Valdren; sus superficies se observan, **no** se atribuye fundador ni origen.
- **DESCUBRIBLE:** huellas grandes, marcas, cambios de silencio y señales de fauna permiten **intuir** vida fuera de escena, **no** probar identidad, causa o destino sin fuente.
- **DESCUBRIBLE:** relatos locales pueden conservar desacuerdos o huecos; citar quién vio qué antes de escribirlo como acontecimiento universal.
- **DUDOSA:** el arco, el origen del protagonista, los capítulos y el orden de visitas todavía no están aprobados en la carpeta editorial; no decidir aquí.
- **DUDOSA:** la disponibilidad de asset digital no demuestra que una ilustración concreta haya superado revisión artística/editorial para impresión.
- **DUDOSA:** discrepancia formal entre el contrato histórico de `world.json` y la distribución de archivos vigente; ver apartado B.
- **RESERVADA:** existen materiales de secretos del juego, **no consultados para divulgar aquí**. Toda utilización en el libro exige encargo delimitado del Arquitecto Editorial y cotejo con Arquitectura VT2. **No incluir claves, orígenes ocultos, soluciones ni pistas nuevas inventadas en fichas abiertas**.

## G. Arte disponible — inventario inicial de referencias exactas

**Existencia verificada en el árbol remoto**, no aprobación editorial para reproducción. Rutas relativas a `vintage-telnet-2/`:

**Localizaciones principales**:
- `client/art/places/vaisgard-anime-v1.webp`
- `client/art/places/valdren-anime-v1.webp`
- `client/art/places/valdren-fragua-anime-v1.webp`
- `client/art/places/khariel-anime-v1.webp`
- `client/art/places/brumak-anime-v1.webp`
- `client/art/places/narevia-anime-v1.webp`
- `client/art/places/velmora-anime-v1.webp`

**Fauna inicial**, enlazada por `world.json.creatures.<id>.illustration` y constatada en `client/art/bestiary/`:
- `mordelinde-anime-v1.webp`, `espinajo-rastrojo-anime-v1.webp`, `cornalomo-anime-v1.webp`
- `saltacresta-anime-v1.webp`, `unapiedra-anime-v1.webp`
- `cascapedernal-anime-v1.webp`, `colagrieta-anime-v1.webp`
- `mordijunco-anime-v1.webp`, `pinzajunco-anime-v2.webp`, `saltalodo-anime-v1.webp`
- `velomembrana-anime-v1.webp`, `roecorteza-anime-v1.webp`, `rondamusgo-anime-v1.webp`, `rasgacorteza-anime-v2.webp`

**Otras familias constatadas**:
- Cinco especies: `client/art/species/{humano,felaryn,dravak,marevyn,vesperi}-anime-v1.webp`.
- Adversario humano: `client/art/encounters/forajido-camino-anime-v1.webp`.
- Variantes de lugares dependientes de hechos: `client/art/place-variants.json` registra ruta, variante, bandera y huellas SHA-256. No elegir variante incompatible con una escena.
- Miniaturas de bestiario: `client/art/bestiary-thumbnails.json` contiene referencias, hashes y dimensiones.

**Pendiente del Director de Arte:** validar asociación final ilustración/pasaje, aprobación, composición, derechos/uso editorial y versión maestra antes de incluir en el manuscrito. No crear arte nuevo por cuenta de este agente.

## H. Preguntas y decisiones que se envían al Arquitecto Editorial

1. **Bloqueante para comenzar Capítulo 1:** ¿cuál es el punto de partida autorizado del Libro I (región, localidad, especie/protagonista) y dónde queda la ficha aprobada?
2. ¿El objetivo del Libro I nace de una necesidad cotidiana verificable o existe ya un arco decidido que el historiador aún no ha recibido? No forzar un encargo del juego a convertirse en argumento del libro.
3. ¿Qué alcance de geografía y personajes debe incluir el **siguiente expediente WIP=1** cuando llegue la ficha del capítulo?
4. ¿Autoriza el Arquitecto de VT2 los detalles compartidos nuevos propuestos, o deben permanecer como color literario sin persistir en el juego?
5. ¿Cómo se hará la revisión de **arte original** para la edición publicable, sin asumir que los archivos de juego ya están aprobados para libro?
6. ¿Quién registrará y reconciliará la discrepancia de documentación del esquema entre `CONTENT_CONTRACT.md` y los JSON vigentes? No bloquea por sí sola este inventario, pero sí exige precisión de fuentes.

**Puerta de revisión conjunta:** si una PR futura atribuye historia, relaciones, fauna, geografía o secretos nuevos, el Arquitecto Editorial y el Arquitecto VT2 deben registrar en **esa PR** hecho vigente, tensión, solución y alcance. Contradicción irresuelta = PR no fusionable. Este dossier no resuelve tensiones unilateralmente.

## I. Extracto preparado para Segundo Cerebro (SOLO ENTREGA AL ARQUITECTO)

**Conocimiento duradero extraíble:** a fecha de corte, *Crónicas de Vaisgard* es una obra literaria independiente de la implementación del juego, pero comparte canon físico/cultural y requiere co-revisión; los datos canónicos vigentes se leen en `vintage-telnet-2/docs/CANON_VIGENTE.md` y en los JSON regionales de GitHub. Se inventariaron seis regiones, seis comunidades ancla, enlaces de rutas, 37 NPC y 37 entradas del catálogo de criaturas/adversarios. La historia antigua de Vaisgard no está explicada oficialmente en estas fuentes públicas. Los nombres y la organización de archivos no deben reemplazar la aprobación editorial de capítulos.

**Decisiones recuperadas:** cuatro clases VT2 vigentes (Juramentado, Arcano, Sombra, Artífice), sin Vigía ni Invocador; separación de juego y libros en el mismo repositorio físico, carpeta `VintageTelnet-Libros/`; PRs editoriales con revisión cruzada; no divulgar secretos; WIP=1.

**Descartado:** crear un repositorio nuevo `VintageTelnet-Libros` para esta entrega; inventar itinerario o pasado de una comunidad; presentar personajes de especies como estereotipos; suponer que presencia de imagen = aprobación para impresión; subir conocimiento directamente a `vaisork/Conocimiento`.

**Pendiente de decisión:** arranque y arco del Libro I, ficha del primer capítulo, autorización de imágenes y cotejo de documentación técnica. **Responsable de consolidar/publicar en `vaisork/Conocimiento`: Arquitecto Editorial Principal, no el Agente 02.**

---

**Firma funcional:** Historiador y Documentalista — Agente 02 · `historiador-documentalista-vaisgard-01`  
**Cierre:** primer encargo documental entregado; sin capítulos escritos, sin modificaciones de juego, sin publicación en Segundo Cerebro, en espera de instrucciones editoriales concretas.
