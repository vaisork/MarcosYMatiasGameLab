# Nota 05 — C006: acceso real a Vaisgard y opciones de arco C007–C015

**Agente:** Historiador 02, `historiador-documentalista-vaisgard-01` · [PR #706](https://github.com/vaisork/MatiasGameLab/pull/706). Trabajo consecutivo **WIP=1**, tras [Nota 04](NOTA_04_C005_CASA_AREN_RUMOR.md). Encargo 07:40 UTC de Arquitectura Editorial: [comentario #6187069718](https://github.com/vaisork/MatiasGameLab/pull/706#issuecomment-6187069718).  
**Fuentes exactas del juego:** `vintage-telnet-2/content/regions/edran.json` blob **`dbdaead65f026a57925857f36388b28b94054498`**, `vintage-telnet-2/content/regions/veyra.json` blob **`500a04d7dd3c2a72c750a69381664f2eed5500bf`**, `vintage-telnet-2/docs/CANON_VIGENTE.md` y `CANON_EXPANSION.md` en `main@316e722f59ebe1f8cef4a606d4190b584caf802a`.  
**Contexto literario:** PR #705, `plan/DECISION_CIERRE_C005_Y_ARRANQUE_C006_2026-10-15.md` blob **`8e30983079f9bb67d036d5871b3312f396d505ac`**, `plan/libro-01.md` blob **`09fb2b02efa6ba7c4d26e77ae1c7e37de5edf942`**, C005 corregido blob **`4a4cbd654e6d9032734a218f74ee458f6b7e2100`**.  
**Tipo:** **mapa documental, no nueva ficha vinculante ni permiso de redactar C007**. Separar **CONFIRMADO/ABIERTO**, **DESCUBRIBLE**, **COMPATIBLE** y **RESERVADO**.

## 1. C006: del camino de piedra a la ciudad, paso por paso

| Paso | Conexión según JSON | Prueba sensorial CONFIRMADA | Lo que Lera no debe afirmar |
|---|---|---|---|
| 1 | `edran_casa_camino --NORTE--> edran_calzada` | Cantos lisos, parches claros de reparaciones nuevas; ruido de ruedas precede su vista. `edran_calzada.description`, `.day`, `.examine.reparaciones` | Que ya llegó a la ciudad o que un rumor de Aren es certeza. |
| 2 | `edran_calzada --NORTE--> edran_hito_campos` | Poste, losa reparada y arroyo con tres piedras para pasar; menos cercas, viento frío. `edran_hito_campos.description` | **Desde el hito la puerta todavía no es visible**. No anticipar el arco delante de sus ojos. |
| 3 (opcional) | `edran_hito_campos --ESTE--> edran_vista_cuenca`; retorno `--OESTE--> edran_hito_campos` | **Desde el mirador sí se ven a lo lejos muros grises** de Vaisgard, pero **no se distinguen las entradas** detrás del lomo. `edran_vista_cuenca.description`, `.examine.muros` | Confundir ver murallas lejanas desde el mirador con ver la puerta desde el hito. El mirador conduce también al **este** a `veyra_pastos_exteriores`, ruta distinta cuyo trazado exigiría nueva ficha. |
| 4 | `edran_hito_campos --NORTE--> veyra_puerta_campos` | En el arco aparecen muros viejos de Vaisgard, carros, martillos, paso sobre piedra pulida y gente de especies distintas. `veyra_puerta_campos.description`, `.day` | Identificar fundadores de las piedras ni crear controles, guardias, portazgos o horarios obligatorios no acreditados. |
| 5 | `veyra_puerta_campos --ESTE--> veyra_barrio_cargas --ESTE--> vaisgard_mercado` | Almacenes, escalera sobre puertas, raya que deja paso a cargas; después mercado con canalillo, toldos, grano, fruta y rutas mezcladas | El arco **no** lleva directamente al mercado ni a la Plaza de las Cinco Rutas. |

**Lluvia, solo como evento literario COMPATIBLE:** `edran_calzada.rain` distingue piedra vieja brillante y nueva absorbente, con borde de hierba sin anchura para dos carros; `edran_hito_campos.rain` deja el **centro** de tres piedras sobre agua aunque moje bordes, y el poste está en terreno alto. Su uso no equivale a activar meteorología del juego. **No inventar kilómetros, jornadas, cifras de cruce, ni nueva inundación global**. C006 puede cerrar en el hito o alcanzar la Puerta de los Campos, según el permiso exacto del Escritor y decisión editorial.

## 2. Plano de ámbitos públicos dentro de Vaisgard (salidas verificadas)

```text
                        veyra_puerta_alta → Hoshai
                               ↑ NORTE
veyra_puerta_piedra ← veyra_patio_porte ←OESTE— veyra_plaza_rutas —ESTE→ veyra_patio_senales —ESTE→ veyra_archivo_cargas
                           Korven         ↑ SUR
                                vaisgard_mercado —ESTE→ veyra_calle_toldos —SUR→ veyra_puerta_juncos → Lethra
                                 ↑ OESTE          └─ ESTE→ veyra_puerta_sombra → Nhal
veyra_puerta_campos —ESTE→ veyra_barrio_cargas ┘
           ↑ SUR                   mercado —SUR→ veyra_patio_agua —ESTE→ veyra_sala_cuidados
     edran_hito_campos                                  └─ SUR→ veyra_huerta_baja —SUR→ veyra_colina_vista
```

**Cómo leer el esquema:** flechas muestran conectividad en la **dirección del recorrido**; no pretende representar escala cartográfica ni distancias. Salidas recíprocas existen en los tramos citados. La entrada principal para Lera desde Edran exige **Puerta de los Campos → Calle de los almacenes → Mercado**. Ya desde Mercado se abre **Norte → Plaza de las Cinco Rutas**, **Este → Calle de los Toldos** y **Sur → Patio del agua**; los patios laterales se alcanzan después de Plaza o Calle.

| ID de sala / acceso público | Vida y trabajo CONFIRMADOS de Veyra | Personas canónicas, permiso y riesgo |
|---|---|---|
| `veyra_barrio_cargas` / desde Puerta de los Campos (este) | Almacenes, carros, peldaños externos, raya de paso; lluvia exige no tapar drenaje | Sin NPC fijo. **Compatible:** alguien se aparta con carga, no «oficial de registro» inventado. |
| `vaisgard_mercado` / desde Almacenes (este) | Cestas, fruta, herramientas, **canalillo** entre puestos, muros antiguos con origen desconocido; voces de cinco rutas | **Bela** (`veyra_bela`), comerciante. Presentación pública sí; no adjudicar que compra o recibe una carta de Lera sin escena aprobada. |
| `veyra_plaza_rutas` / mercado (norte) | Gran plaza, piedras antiguas como bancos, variedad de visitantes, avisos públicos; agua entre juntas en lluvia | `npcs: []`. Menciones de mensajeros genéricos en `.day`; historia de fundación **RESERVADA/no probada**. |
| `veyra_patio_porte` / plaza (oeste) | Bebedero, animales de carga y cinchas, pesos diferentes, tránsito hacia Korven | Sin NPC fijo; cuidador en `.day` es ambiental. **No** inventar a priori un servicio permanente de alquiler de monturas. |
| `veyra_patio_senales` / plaza (este) | Tablillas por origen, lectura bajo alero; con lluvia se protege papel y se espera en fila | **Arel** (`veyra_arel`), mensajera Vesperi. La marca de remitente/ruta **no prueba lectura o entrega**. Acciones `veyra_atribuir_mensaje` y otras son eventos del juego, **NO** resultados de novela. |
| `veyra_archivo_cargas` / Patio de mensajes (este) | Archivo con estantes para entregas y pendientes, tinta, cajas y marcas; separa «demora» de «robo» | **Nera** (`veyra_nera`), archivera humana. Su lectura puede ser pública, pero **no** usar `veyra_aclarar_demora` ni otros flags como resultado automático. |
| `veyra_calle_toldos` / mercado (este) | Toldos remendados y trabajo compartido, perchas, costuras que afectan a otro taller bajo lluvia | **Seli** (`veyra_seli`), remendadora Marevyn. No imponer a toda su especie la profesión; no declarar ejecución de `veyra_atar_toldo`. |
| `veyra_patio_agua` / mercado (sur) | Separación entre **agua limpia arriba** y usada abajo; baranda y filas de jarras; zona de cuidados al este | Sin NPC fijo. **Compatible:** decisión de reponer una botella, sin declarar agua ilimitada ni efectos sanadores automáticos. |
| `veyra_sala_cuidados` / Patio del agua (este) | Mesa de atención limpia, paños y separación de recipientes; mercado amortiguado detrás de puerta | **Doma** (`veyra_doma`), cuidador humano. La asistencia es pública; las tarifas y recuperación mecánica del servidor no deben convertirse sin mediación en prosa novelesca. |
| `veyra_huerta_baja` / Patio del agua (sur) | Bancales bajo casas, herramientas, insectos y niños; subida hacia colina al sur | Sin NPC fijo. Acciones y examinaciones condicionadas no se usan para revelar secretos ni entregar recompensas. |
| `veyra_colina_vista` / Huerta Baja (sur) | Colina con perspectiva hacia muros de Vaisgard, hitos de caminos, agrimensor ambiental | No dar fecha ni constructor del núcleo antiguo. Sendero sur sale hacia vega, no devuelve directo a Plaza. |
| `veyra_puerta_piedra` / Patio de los animales (oeste) | Cargas Dravak separadas por tablas, salida a Korven, polvo y piedras | **Tov** (`veyra_tov`), porteadora Dravak. Su demora tiene historia del juego: **no atribuirla a rumor de C005 ni completarla**. |
| `veyra_puerta_alta` / Plaza (norte) | Cargas y grava hacia Hoshai, aire frío de montaña | Entrada/salida pública; **no** visitar Khariel en el Libro I por este solo dato. |
| `veyra_puerta_juncos` / Calle de los Toldos (sur) | Borde de canales rumbo a Lethra, barro y tabla para cambiar calzado | Saltalodos mencionados hacia **Lethra** en la descripción; no son prueba de población en Edran. |
| `veyra_puerta_sombra` / Calle de los Toldos (este) | Salida hacia Nhal, hoja vieja de puerta en desuso y madera húmeda | Una hoja de puerta **sí** se describe aquí; no extrapolarla a todas las puertas de Vaisgard. |

**No es lista de lugares a recorrer forzosamente:** que una sala tenga `actions` o `examine` no autoriza a narrar el estado resultante o información condicionada. Los nombres de Dalia, Lera, Mara y Sabel son **exclusivos de la novela**, no aparecen asignados como NPC al mercado ni al archivo. **Sin destino público canónico de Dalia** dentro de la ciudad: la escena de encuentro exige decisión expresa de Arquitectura Editorial.

## 3. Recomendaciones sobre el arco de 15 capítulos, sin inflar las dos salas restantes de Edran

El índice provisional de [`plan/libro-01.md` en PR #705](https://github.com/vaisork/MatiasGameLab/blob/editorial/cronicas-vaisgard-agente-01-voz/VintageTelnet-Libros/plan/libro-01.md) coloca la **Puerta de los Campos en C014**. Pero el manuscrito **C005 concluye antes de `edran_calzada`** y el camino público restante a la puerta tiene únicamente `edran_calzada → edran_hito_campos → veyra_puerta_campos`. **No es justificación documental para demorar hasta C014**.

### Opción A — Conservar provisionalmente 15 capítulos, trasladar la aventura a la ciudad (COMPATIBLE)

| Tramo sugerido | Soporte espacial verificado | Función literaria para decisión editorial; NO hecho del juego |
|---|---|---|
| **C006** | Calzada → Hito → posiblemente Puerta | Piedra, lluvia eventual, cruce; conflicto de camino y percepción legítima de llegada. **Único borrador autorizado actualmente.** |
| **C007–C008** | Puerta de los Campos → Almacenes → Mercado → Plaza | Adaptación a otra escala de gente, sonidos y cargas; buscar **indicios humanos abiertos** del paradero de Dalia sin afirmar que el mercado ya la conoce. |
| **C009–C010** | Plaza → Patio de mensajes → Archivo (con vuelta por misma ruta) | Diferenciar cartas, rumor y prueba; que una persona ayude o sea mal entendida, **no** resolver `veyra_carga_detendida` ni encomienda `veyra_recados`. |
| **C011–C012** | Mercado → Calle de los Toldos; o Mercado → Patio del agua → Cuidados | Peligro/hacer un favor con consecuencia propia; trabajo vecinal, agua y posible herida con límites. **No** inventar requisitos permanentes de toldos, agua o servicios médicos. |
| **C013–C014** | Retorno creíble a Mercado/Plaza, con desvío verificado a Patio de animales o Huerta Baja | Decisión de confianza que cambie la relación Lera–Dalia; **localización, motivación y eventual aparición de Dalia pendientes**. Evitar excusas para visitar todas las puertas. |
| **C015** | Mercado/Plaza/Patio público ya elegido | Encuentro/decisión íntima y cierre que responde al motivo de carta sin explicar fundador de Vaisgard ni fingir que la ciudad terminó su historia. |

**Criterio de calidad:** nueve capítulos después de C006 solo valen si hay **escenas con decisiones, retrocesos y efectos distintos**, no nueve tours por salas. Si no existen suficientes conflictos íntimos verificables, es mejor reducir capítulos.

### Opción B — Libro I más concentrado: ~11–13 capítulos (COMPATIBLE, RECOMENDADA si no aparece conflicto suficiente)

- **C006:** culminar el trayecto por calzada/hito.
- **C007–C008:** puerta, calle de almacenes y llegada real al mercado/plaza; verosimilitud del tránsito.
- **C009–C010:** uno o dos conflictos urbanos propios (p. ej., lectura parcial de una noticia frente a un vínculo personal), con fuentes **públicas** de Patio de mensajes/Archivo o Talleres, sin plagiar misiones del juego.
- **C011–C012:** decisión sobre cómo encontrar/hablar con Dalia y consecuencia interpersonal; una escena de la vida de Vaisgard respalda el desenlace, sin hacerlo enciclopedia ni prólogo repetido.
- **C013**, solo si hay material dramático ganado: cierre/repercusión y puerta abierta a Libro II, sin giro obligatorio sobre secretos antiguos.

**Recomendación del Historiador:** elegir la **Opción B como criterio de control de ritmo**, salvo que el Escritor entregue un arco urbano con conflictos causalmente distintos que **justifique** 15 capítulos. **El número exacto y el índice los aprueba el Arquitecto Editorial; no los modifica este agente.** Puede usarse una pequeña parte de A incluso en B. El viaje de Valdren a la ciudad necesita continuidad, **no ocho capítulos de carretera sin salas suficientes**. Un mismo sitio urbano puede sostener varias escenas si cambia algo humano en vez de repetir ambientación, sin hacer del mapa un cronómetro.

## 4. Frontera del canon: abierto, descubrible, reservado

| Tipo | Ejemplos y fuente | Conducta |
|---|---|---|
| **CONFIRMADO / ABIERTO** | Salidas exactas; murallas y mercados actuales; `veyra_plaza_rutas` con piedras antiguas; trabajos de Bela, Arel, Nera, Seli, Tov, Doma con `home_room`; `edran_calzada.rain` | Describir acciones **observadas** y su contexto público; si se usa un NPC, conservar su rol y limitar conversación a lo que sabe. |
| **DESCUBRIBLE** | Tablas por procedencia, diferencias entre aviso y noticia; reparaciones sucesivas; ausencia de fecha/certificado fundacional | El punto de vista no convierte un rumor en certeza. **No** dar resultado de mensajes/cargas condicionales o secretos por narrador omnisciente. |
| **COMPATIBLE SOLO NOVELA** | Lera buscando Dalia por voluntad propia, preguntas a vendedores, ayuda voluntaria con cargadores, incidentes cotidianos coherentes | Señalar como ficción privada; una conversación **no** ejecuta la quest `veyra_aclarar_demora`, `veyra_atribuir_mensaje` ni `veyra_atar_toldo`, ni añade NPC. |
| **RESERVADO / BLOQUEANTE SIN AUTORIZACIÓN** | Origen de piedras/galerías, examenes con flags/visitas, entradas de mazmorra, secretos por especie, razón final de una anomalía mayor | No usar para acelerar el argumento. Proteger incluso de resúmenes públicos de marketing/EPUB. |

**Vigilancia transversal de PR #706:** `edran_acequia.day` menciona Saltalodo; `content/world.json.creatures.saltalodo.region = lethra`. Continúa **divergencia abierta** hasta co-decisión Arquitecto VT2+Editorial. **No incluir Saltalodo en Edran** como medida editorial preventiva. Nada en este mapa subsana el juego ni autoriza publicar el prólogo VT1 como historia fundacional real.

## 5. Decisiones que faltan — handoff

1. **Arquitecto Editorial:** decidir si C006 termina en hito o puede cerrar en puerta; en la siguiente ficha fijar momento legítimo de entrada a mercado. Revisar arquitectura C007–C015 antes de exigir al Escritor un número fijo. Determinar **dónde y por qué** buscaría Lera a Dalia sin convertirla en NPC de VT2 ni obligar a recorrer todas las plazas.
2. **Arquitecto VT2:** cotejar direcciones y delimitación de salas, revisar qué información pública de Arel/Nera/Tov puede usar la novela, aprobar excepciones **solo literarias** si las hubiera y tratar la divergencia Saltalodo en esta PR.
3. **Revisor Integral #707:** vigilar repetición de tema «rumor», fatiga de exploración y que cada capítulo dé causa, acto y consecuencia, no solo visita a un sitio.
4. **Arte #708:** comprobar candidatos originales `client/art/places/edran_calzada-anime-v1.webp`, `edran_hito_campos-anime-v1.webp`, `veyra_puerta_campos-anime-v1.webp`, `vaisgard_mercado*` y `veyra_plaza_rutas*` antes de insertar en EPUB.
5. **Historiador:** expediente de soporte documental concluido; **ninguna** modificación a `VintageTelnet-Libros/plan/libro-01.md`, ramas ajenas, arte o `vintage-telnet-2/`.

**Conclusión:** la ciudad tiene suficiente diversidad **espacial** para sostener escenas, pero no garantiza suficiente diversidad **dramática** para nueve capítulos por sí sola. El próximo cierre editorial debe elegir ritmo y conflicto humano, **no alargar artificialmente Edran**.