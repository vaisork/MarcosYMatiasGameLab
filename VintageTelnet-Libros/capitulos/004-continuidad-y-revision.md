# Capítulo 004 — Registro de continuidad, fuentes y revisión

**Manuscrito:** [004 — El lenguaje de las huellas](004-el-lenguaje-de-las-huellas.md).  
**PR de autoría:** [#705](https://github.com/vaisork/MatiasGameLab/pull/705).  
**Agente:** `escritor-aventuras-vaisgard-01`.  
**Estado:** **borrador C004 entregado**; no aprobado para fusión o publicación. WIP=1; **no iniciar C005** sin encargo.  
**Longitud revisada:** ~2,044 palabras contando título; versión corregida `fe2ef09ca3c363e324ebf2228ad896a4f349b27c`.  
**Autorización específica:** `../plan/DECISION_EDITORIAL_C002_C003_Y_ARRANQUE_C004_2026-10-14.md`, disponible en PR #705.  
**Dictamen de origen:** C003 revisión del Agente 03 en PR #707, `DICTAMEN_04_CAPITULO_003_MAS_ALLA_DE_LAS_CERCAS.md`; sus aclaraciones de agua limpia, tela limpia y hombro dolorido ya se aplicaron al Capítulo 3 antes de redactar C004.

## 1. Continuidad de escenas y progreso de aventura

C003 termina con Lera entrando desde **`edran_surcos` hacia el este de `edran_zanja_antigua`**. Ve una herramienta sobre una losa vertical y escucha dos golpes sin conocer su fuente.

C004 **resuelve la pregunta a escala cotidiana y no misteriosa**: una trabajadora de campo **anónima y original de esta novela**, que está más arriba, ha golpeado una tabla contra piedras; ella dejó una pala delgada apoyada junto a la losa mientras trabajaba. Lera **NO entra a la zona del canal cubierto**, no atribuye origen ni uso secreto a la estructura. Observa dos líneas en tierra y las supone por error de ruedas: en realidad son marcas de arrastrar una tabla.

Sigue el enlace real **`edran_zanja_antigua → edran_era → edran_terraplen`**. La Era de los campos conserva su círculo de tierra dura, tablones, piedras, poste y viento con polvo. En el terraplén, una **carreta que baja** por dos rodadas estrechas obliga a Lera a retroceder hasta un ensanche; la cantimplora golpea la pared y **pierde gran parte del agua**. Lera espera junto a un **porteador genérico sin nombre**, compatible con la actividad diurna de `edran_terraplen`, y comparte brevemente la subida con él, sin nuevo servicio oficial ni misión.

Más arriba asoma finalmente el tejado de la **casa del camino**, coherente con que no se ve desde el pie de la cuesta. Una persona que desciende con un saco demasiado pesado necesita detenerse; Lera y el porteador le ayudan a apoyar la carga en suelo firme. El cierre plantea una necesidad concreta: la persona pide agua, pero Lera apenas conserva un poco. **No se resuelve todavía** si lo comparte o si allí será posible reabastecerse. No se ha llegado a `edran_casa_camino`.

**Estado final C004:** Lera en el **terraplén de Edran**, ya pasada su mitad pero antes de la casa; conserva carta terminada y seca, bolsa, taza, carboncillo envuelto, cantimplora casi vacía; conserva raspadura leve en palma y hombro dolorido procedentes de C003, sin lesión añadida grave. Está acompañada temporalmente de dos caminantes anónimos, uno con bulto y otro que bajaba con saco; no se afirma alianza duradera. Dalia no ha aparecido ni contestado.

## 2. Matriz de canon confirmado

| Hecho visible | Evidencia consultada en `vintage-telnet-2/` | Nivel |
|---|---|---|
| De campo de surcos al **este** a zanja seca | `content/regions/edran.json > rooms.edran_surcos.exits.este = edran_zanja_antigua` | ABIERTA · CONFIRMADA |
| Zanja actualmente seca, raíces, paredes marcadas por viejo curso, losa vertical | `rooms.edran_zanja_antigua.description` | ABIERTA · CONFIRMADA |
| Herramienta en losa durante escena diurna; alguien trabaja más arriba | `rooms.edran_zanja_antigua.day` | ABIERTA · CONFIRMADA |
| Continuación zanja al **norte** hacia era | `rooms.edran_zanja_antigua.exits.norte = edran_era` | ABIERTA · CONFIRMADA |
| Era de grano: círculo de suelo duro, tablones, piedras planas, poste, paja y polvo | `rooms.edran_era.description`, `.day` | ABIERTA · CONFIRMADA |
| Era al **norte** hacia terraplén | `rooms.edran_era.exits.norte = edran_terraplen` | ABIERTA · CONFIRMADA |
| Terraplén: tierra alta, raíces visibles, rodadas estrechas, ensanche donde aguardan cargas y carros que descienden | `rooms.edran_terraplen.description`, `.day` | ABIERTA · CONFIRMADA |
| Casa del camino no visible hasta pasar media subida | `rooms.edran_terraplen.description` | ABIERTA · CONFIRMADA |
| Terraplén conecta al **norte** con casa del camino; Lera aún no cruza | `rooms.edran_terraplen.exits.norte = edran_casa_camino` | ABIERTA · CONFIRMADA |

**No se usa** `edran_zanja_antigua.exits.este = edran_canal_entrada`; tal ramal tiene detalles distintos, fuera de la trama autorizada. No se incluyen criaturas nuevas, Saltalodo, salteadores, nombres/diálogos de NPC canónicos, orígenes antiguos, secretos de DM, mecánicas de juego ni afirmaciones de distancias/tiempos físicos.

## 3. Aportes ficticios exclusivos del libro (no canon automático VT2)

| Elemento | Estado, alcance y revisión solicitada |
|---|---|
| Trabajadora anónima que transporta tablón y deja pala; los dos golpes de madera con piedras | **COMPATIBLE / FICCIÓN PARTICULAR**. Cierra el eco de C003; no es personaje del catálogo ni revela actividad del canal cubierto. Arquitectos deben confirmar que no contradice `day` de zanja/era. |
| Interpretación equivocada de líneas en suelo, luego identificadas como arrastre de tabla | **COMPATIBLE / PUNTO DE VISTA LIMITADO**. No constituye pista de secreto o entrada clandestina. |
| Descenso puntual de un carro, señal verbal de conductor, cantimplora golpeada y derrame | **COMPATIBLE / EVENTO PRIVADO DE NOVELA**. Geografía y tipo de tránsito confirmados; no implica accidente o daño persistente en el juego. |
| Porteador anónimo en ensanche | **COMPATIBLE / USO DE ACTIVIDAD AMBIENTAL** del campo `rooms.edran_terraplen.day`; no fusionar con NPC ya nombrado o servidor de juego. |
| Caminante cansado con saco y dilema de compartir agua | **COMPATIBLE / FICCIÓN PARTICULAR**; no equivale a misión ni encuentro persistente, y todavía no se decide si pide ayuda posterior o se marcha. |
| Raspadura anterior, cantimplora casi vacía y carta | **CONTINUIDAD PRIVADA DE LA NOVELA**. La cantimplora se declaró expresamente con agua limpia en el C003 revisado, evitando reutilizar agua de acequia. |

No aparece ninguna afirmación nueva sobre la **historia de las piedras** del mundo. Las huellas y sonidos se interpretan como hechos del trabajo y del tránsito, nunca como claves de mundo reservadas.

## 4. Conocimiento y obligaciones al cierre

- **Lera**: sabe que los dos golpes se debieron a una tabla de una trabajadora; aprendió cómo una carga descendente puede ocupar las rodadas de una subida estrecha. Pierde agua porque se aparta tarde, no por criaturas ni magia. No conoce el futuro ni la respuesta de Dalia; conserva su carta.
- **Trabajadora de era**: no recibe nombre ni historia ni encargo, no sabe el contenido de la carta ni se convierte en acompañante.
- **Porteador**: conoce por experiencia local dónde esperar un carro, pero no afirma cuánto agua queda en la casa siguiente; interacción ocasional con Lera.
- **Persona del saco**: su identidad y destino no están establecidos; pide agua al cierre. No debe reaparecer como villano, pista oculta o integrante de organización sin otra ficha/permiso editorial.
- **Mara/Sabel**: permanecen en Valdren con la tablilla; no tienen noticia en tiempo real de este incidente.
- **Dalia**: no ha leído la carta y no se ha establecido su ubicación específica dentro de Vaisgard.

## 5. Arte candidato (solo recursos originales y sujetos a autorización #708)

1. **Zanja seca / losa vertical:** `client/art/places/edran_zanja_antigua-anime-v1.webp` (ruta citada en atlas documental #706). Verificar presencia exacta, manifiesto y aprobación. No mostrar canal secreto.
2. **Terraplén / ensanche y carro:** `client/art/places/edran_terraplen-anime-v1.webp` (candidato inventariado en #706). Verificar correspondencia de escena y aprobación. No generar imágenes nuevas ni atribuir figura o carteles que la imagen no contiene.

## 6. Circuito de revisión

- [ ] **Arquitecto Editorial:** valorar tensión de carreta y peligro, causalidad del derrame, agencia de Lera y longitud; decidir qué parte del dilema final pasa a C005.
- [ ] **Revisor Integral 03 (PR #707):** lectura completa C004, continuidad con C003 y ambiente de campo, ritmo, credibilidad de huellas, economía de personajes, subtexto sin moraleja.
- [ ] **Arquitectura VT2 + Editorial:** registrar co-decisión (propuesta, fuente, tensión, resultado, alcance) para sucesos privados, nueva actividad anónima y continuidad de ruta; además co-decisión aún abierta de prólogo y primeros capítulos.
- [ ] **Director de Arte 04 (PR #708):** maquetar únicamente según grado editorial autorizado, con versión de prelectura explícitamente provisional.

**No iniciar C005 sin permiso expreso. Sin cambios a `vintage-telnet-2/`, original de arte, Raspberry, repositorios ajenos o Google Drive.**

## Adenda posterior al dictamen del Revisor 03 — C004

Dictamen literario de `revisor-canon-vaisgard-01` en PR #707: **APROBADO LITERARIAMENTE**, con dos ajustes **de baja gravedad, no bloqueantes**. Lectura inicial realizada sobre blob `616d6c52d23f24055d63a21e4c4c33b82a6172b3`.

- **L01 resuelto:** la casa del camino se hace visible **al dejar atrás la mitad de la cuesta** (`rooms.edran_terraplen.description`), no exactamente al alcanzarla.
- **L02 resuelto:** se identifica expresamente al **porteador** como quien propone dividir la carga; **la persona propietaria acepta** antes de comprobar la insuficiencia de cuerda.
- **Nueva versión del capítulo:** blob `fe2ef09ca3c363e324ebf2228ad896a4f349b27c`, ~2,044 palabras. Se solicita cotejo puntual, sin rehacer evaluación estructural.
- **C005 continúa sin autorización registrada al momento de esta entrega.** Si llegara autorización posterior, primero verificar la ficha exacta y la continuidad de la petición final de agua. Sin publicación/fusión mientras quede abierta la co-decisión canónica Arquitectura VT2 + Editorial.
