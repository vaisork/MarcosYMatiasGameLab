# Dictamen editorial y de canon 00 — Revisión inicial de PR #705

**Agente responsable:** Agente 03 — Editor Integral y Revisor de Canon (`revisor-canon-vaisgard-01`).  
**Proyecto:** *Crónicas de Vaisgard*, Libro I *El primer camino*.  
**Dictamen:** **BLOQUEADO PARA COMENZAR EL CAPÍTULO 001**. La voz y el método pueden aprobarse con ajustes; la Biblia, los protagonistas, el arco y las fichas son **propuestas aún no autorizadas**.  
**Fecha del corte:** 14 de octubre de 2026 (México).  
**Manuscrito revisado:** ninguno: **no existe un Capítulo 1 para editar ni se autoriza redactarlo**.  
**WIP:** 1 — únicamente este primer dictamen, sin intervenciones sobre el trabajo del Escritor.

## 1. Material y versiones inspeccionadas

- [PR #705 — Escritor de Aventuras](https://github.com/vaisork/MatiasGameLab/pull/705): abierta, en borrador; rama `editorial/cronicas-vaisgard-agente-01-voz`, HEAD `f40e6300d08974656229ce8fa4174e52d0d0f0c4`. Se revisaron `BIBLIA_EDITORIAL.md`, `CANON_REFERENCE.md`, `POLITICA_DE_SECRETOS.md`, `AGENTS.md`, `README.md`, `plan/{libro-01,personajes,fichas-001-003}.md` y `agentes/escritor-aventuras-vaisgard-01/PROPUESTA_VOZ_NARRATIVA.md`.
- [PR #706 — Historiador y Documentalista](https://github.com/vaisork/MatiasGameLab/pull/706): abierta, borrador; `EXPEDIENTE_00_ATLAS_Y_CONTINUIDAD.md`, HEAD `4fcb0d44918b521ee1dce20eae91eb78924b5537`. Investigación auxiliar, **todavía no aprobada**.
- Fuente de canon: `main@316e722f59ebe1f8cef4a606d4190b584caf802a` según base de ambas PR; consulta de `vintage-telnet-2/docs/CANON_VIGENTE.md`, `docs/DECISIONES_VIGENTES.md`, `CONTENT_CONTRACT.md`, `CANON_EXPANSION.md`, `content/world.json` y `content/regions/{edran,veyra,hoshai,korven,lethra,nhal}.json`. Antes de una aprobación definitiva, **revalidar contra HEAD remoto de `main`** si cambia.
- Fuentes de control adicionales: `AGENTS.md` en raíz de repositorio; `VintageTelnet-Libros/AGENTS.md` en PR #705.

**Nota de sincronización:** la descripción de la PR #705 todavía dice que la Biblia, arco y ficha 001 «no se identificaron»; sin embargo, los nueve archivos actuales **sí contienen** Biblia, plan de 15 capítulos, personajes y fichas 001–003. Se trata de una descripción **desactualizada**, no de archivos faltantes. Actualizar la descripción de #705 es responsabilidad de quien mantiene esa PR.

## 2. Evaluación literaria de la voz y de la Biblia

**Aprobable en principio (con ajustes y decisión del Arquitecto Editorial):**

- Tercera persona cercana en pasado, foco estable por escena, emociones evidenciadas por decisiones y gestos: adecuado para lectura de 10–14 años sin infantilizar al adulto.
- Estructura escena = intención → resistencia → elección → consecuencia: útil como instrumento editorial, **no** fórmula que deba repetirse mecánicamente en cada página.
- Materialidad del mundo (clima, barro, herramientas, cargas, comida, cansancio), conversaciones con conflicto y consecuencias persistentes; evita el tono de manual de videojuegos.
- Misterio local sin elegidos, profecías ni explicación sobre los constructores antiguos de Vaisgard: buena delimitación del primer libro.
- Plan de quince capítulos dentro de la escala de la Biblia (12–18), con alternancia de preparación, viaje y llegada. **Es estructura provisional, no secuencia aprobada**.
- Clasificación ABIERTA / DESCUBRIBLE / RESERVADA, más certeza CONFIRMADO / COMPATIBLE / DUDOSO / CONTRADICTORIO: separación editorial correcta. El dato reservado no debe copiarse a fichas accesibles.

**Ajustes literarios recomendados:**

1. La premisa «llevar un mensaje y demostrar independencia» todavía es genérica. Definir **qué se perderá si no llega**, por qué no basta enviarlo con un viajero y por qué debe actuar precisamente Lera. El mensaje debe seguir siendo ficción privada, no una misión canónica de VT2.
2. Capítulos 001 y 002 realizan ambos preparación; diferenciar contundentemente el cambio dramático: en 001 decisión con costo personal verificable; en 002 elección material/relacional cuyo precio se pague después. Evitar dos aperturas inmóviles.
3. Capítulos 004–013 son más **funciones narrativas abstractas** que episodios distinguibles. Exigir para cada uno conflicto, desplazamiento verificable y consecuencia acumulativa antes de cerrarlos. La pregunta literaria no puede sostenerse sólo con «rumores» o «señales».
4. Si Orven se conserva, establecer su necesidad independiente, desacuerdo concreto con Lera y razón de presencia en Edran; no utilizarlo como expositor de cultura Dravak ni añadirlo porque «hace falta un compañero».
5. Fijar criterio de longitud/ritmo de los capítulos y una pequeña muestra de voz **sólo como prueba editorial**, sin anticipar ni redactar el Capítulo 1 completo.
6. Evitar sobreuso de fórmulas como «no todo cabe...», «el peso no se mide...»: funcionan como notas temáticas internas, pero no deben convertirse en moralejas explícitas dentro de la novela.

**Estado de estos puntos:** principios aceptables para resolución por Arquitectura Editorial; no equivalen a aprobación formal del texto del Escritor.

## 3. Revisión de protagonistas

| Propuesta | Juicio literario | Juicio de canon / condición |
|---|---|---|
| **Lera**, humana, 24, ligada a cargas de Valdren | **Aprobable con ajustes**: tiene observación práctica y falla emocional aprovechables; falta un destinatario y compromiso específicos | **COMPATIBLE, no confirmado en el juego.** Valdren y sus labores existen; no convertir su mensaje en misión del juego ni atribuirle trabajo de un NPC establecido |
| **Orven**, Dravak, 35, viajero de paso | **Condicional**: potencial contrapunto por precisión/culpa, pero corre riesgo de ser personaje instrumental | **COMPATIBLE, no confirmado.** Dravak son compactos con placas dérmicas y sensibilidad a vibración por sólidos; validar viaje, oficio, presencia y representación sin estereotipos ni capacidades inventadas |

Los nombres **Lera** y **Orven** no coinciden exactamente con los 37 NPC registrados en los seis JSON regionales del corte consultado. Esa ausencia evita una colisión obvia, **pero no los vuelve personajes canónicos ni prueba que deban entrar a la novela**. La pareja, edad, relación inicial, género, biografías y conocimiento por capítulo siguen a decisión editorial.

## 4. Continuidad y verificación canónica

| Elemento / fuente | Evidencia observada | Dictamen |
|---|---|---|
| **Regiones, especies y clases** | `docs/CANON_VIGENTE.md` define seis regiones/cinco especies; `docs/DECISIONES_VIGENTES.md` fija Juramentado, Arcano, Sombra y Artífice; Vigía/Invocador fuera del roster | **Sin contradicción material hallada** en PR #705 |
| **Capítulo 001, Valdren** | `content/regions/edran.json > rooms.valdren_plaza` y `rooms.valdren_huertos` existen; salida este de plaza llega a huertos | **Localización validada**; ocupación, interlocutor, mensaje y decisión irreversible siguen propuestos |
| **Capítulo 002, fragua y patio** | `rooms.valdren_fragua` existe y alberga `edran_daro`; `rooms.valdren_patio_carros` existe y conecta al cobertizo y graneros. Acceso a fragua por `valdren_calle_alta`, NO puerta directa desde plaza o patio | **Localizaciones válidas; transición y presencia/horario requieren guion de escenas**; Daro no debe cumplir promesas, reparar o saber más de lo permitido por sus diálogos y estados |
| **Capítulo 003, salida** | `valdren_huertos → edran_salida_huertos → edran_acequia → edran_surcos` son salidas explícitas de `edran.json`. En `edran_acequia.wildlife_pool` está `espinajo_rastrojo`; en `edran_salida_huertos.wildlife_pool` figuran también Mordelinde y Cornalomo | **Secuencia válida**; no trasladar criaturas indistintamente a otras salas ni convertir señales en encuentros garantizados |
| **Hasta Vaisgard** | Ejemplo de conexión verificable por salidas: `edran_surcos → edran_zanja_antigua → edran_era → edran_terraplen → edran_casa_camino → edran_calzada → edran_hito_campos → veyra_puerta_campos → veyra_barrio_cargas → vaisgard_mercado` | **Existe un recorrido posible**; este ejemplo no fija ruta oficial de novela ni duración. Falta ligar capítulos 004–013 a escenas y consecuencias reales |
| **Puerta y destino** | `veyra_puerta_campos` enlaza con `edran_hito_campos` y `veyra_barrio_cargas`; desde éste se alcanza `vaisgard_mercado` | **Llegada plausible y verificable**; nada autoriza construir una entrada alternativa o atribuir origen a muros antiguos |
| **Bestiario e indicios** | `world.json > creatures` aporta identidades; `content/regions/*.json > rooms.<id>.wildlife_pool` y estados determinan presencia local | **Cotejo escena por escena obligatorio**; huella y rumor no equivalen a encuentro físico |
| **Ilustraciones** | Archivos presentes en `client/art` y manifestos señalados por Agente 02 | **No implica aprobación de uso editorial**; validar variante, versión, aptitud e identificación por Director de Arte |
| **Esquema histórico vs archivos actuales** | `CONTENT_CONTRACT.md` describe distribución de `world.json` diferente a la observada (`world.json` contiene `creatures/items/quests/secrets`; salas/NPC están en JSON regionales) | **Duda documental**, no contradicción ya probada de la historia; para IDs/rutas usar JSON vigentes y solicitar reconciliación a Arquitectura VT2 |

**Prohibiciones confirmadas:** no presentar especies como sobrenaturales por defecto; no reducir Dravak a «dragones» ni Marevyn a seres que respiran bajo agua; no inventar poderes, distancias o puentes; no resolver origen de piedras antiguas ni divulgar secretos. Ninguna de estas prohibiciones se ha demostrado infringida por los borradores actuales.

## 5. Dictamen por ficha 001–003 (sin capítulos escritos)

| Ficha | Evaluación literaria | Continuidad y canon | Estado |
|---|---|---|---|
| **001 — Una decisión al amanecer** | El entorno cotidiano funciona; falta especificar la consecuencia inmediata de aceptar el mensaje, el destinatario y el costo de partir | Plaza/huertos válidos; interlocutor, compromiso y saber de Lera sin aprobar | **BLOQUEADA PARA REDACCIÓN** |
| **002 — Lo que cabe en una mochila** | Debe tener conflicto distinto del 001, con desacuerdo entre personajes y objeto/decisión que repercuta después | Plaza/fragua/patio válidos, pero secuencia y condiciones de presencia de Daro deben cerrarse | **BORRADOR NO AUTORIZADO** |
| **003 — Más allá de las cercas** | Tiene descubrimiento sensorial y obstáculo razonable; definir un evento o error concreto que impulse la escena siguiente | Primeros cuatro tramos reales; presencia de fauna varía por sala, sucesos y condiciones | **BORRADOR NO AUTORIZADO** |

Los dictámenes **no califican calidad de prosa de capítulos**, porque el Escritor no los ha escrito todavía.

## 6. Hallazgos y gravedad

| ID | Gravedad | Hallazgo | Corrección / responsable |
|---|---|---|---|
| **B01** | **BLOQUEANTE** | Lera, Orven, su relación y la razón concreta del mensaje no están aprobados | Arquitecto Editorial decide; Arquitecto VT2 correvisa aspectos compartidos de especie, oficio y presencia |
| **B02** | **BLOQUEANTE** | La Biblia, el arco de 15 capítulos, el POV y la ficha 001 tienen casillas pendientes; no existe autorización final | Arquitecto Editorial emite aprobación explícita y ficha 001 cerrada sólo tras control canónico |
| **B03** | **BLOQUEANTE para cierre del arco** | Capítulos 004–013 sin recorrido y causa/efecto fijados; alternancia de preparación puede alargar el inicio sin avance real | Agente 01 ajusta plan **dentro de su PR**, con insumo Agente 02; ambas arquitecturas revisan geografía y hechos |
| **M01** | MEDIA | PR #705 describe ausencia de Biblia/fichas pese a contenerlas en HEAD | Agente 01 actualiza descripción y registro de pendientes reales |
| **M02** | MEDIA | `VintageTelnet-Libros/AGENTS.md` todavía enumera 03 Revisor Canon, 04 Editor Literario y 07 Editor de Lectura como roles separados; el encargo **vigente** concentra las tres funciones en `revisor-canon-vaisgard-01` | Arquitecto Editorial actualiza roster en su propia entrega; **no añadir agentes 04/07** por este dictamen |
| **M03** | MEDIA | Divergencia del `CONTENT_CONTRACT.md` con distribución actual de archivos | Arquitectura VT2 registra reconciliación; mientras tanto, verificar datos contra JSON actuales |
| **M04** | MEDIA | Arte localizado no implica autorización para página impresa | Director de Arte coteja evidencias, sin ilustrar ni modificar originales |
| **L01** | BAJA | Varias notas de capítulos repiten máximas temáticas y peligro abstracto | Editor/Escritor convierten las máximas en escenas singulares con consecuencias observables |

**No se confirma hoy una contradicción canónica insoluble** en personajes/rutas propuestos. Los bloqueos B01–B03 son sobre todo **decisiones pendientes y continuidad incompleta**. Si el cotejo posterior revela una contradicción real, debe registrarse y resolverse en la PR concernida; **sin solución conjunta no se fusiona**.

## 7. Decisiones mínimas solicitadas a arquitectos

**Arquitecto Editorial Principal:**
1. Aprobar o corregir POV, voz y reglas de escena; escoger protagonista(s), motivo verificable, destinatario, precio personal de partir y relación Lera–Orven si procede.
2. Resolver diferenciación 001/002 y qué amenaza/decisión arrastra el arco; aceptar o ajustar los 15 capítulos sin adelantar escritura.
3. Corregir el roster documental: **Agente 03 integra canon, literatura y lectura 10–14/adulta**. No crear agentes separados para estas funciones.
4. Emitir posteriormente ficha 001 *concreta y firmada*, sólo cuando las dependencias estén cerradas.

**Arquitecto VT2, en revisión conjunta en la PR pertinente:**
1. Validar los enlaces/recorridos propuestos y restricciones de geografía, especies, Daro, animales y rumores; aclarar la discrepancia documental del esquema.
2. Registrar cuáles decisiones pertenecen **sólo a la novela** y cuáles requerirían otra resolución explícita de canon del juego.
3. Confirmar que ni mensaje, ni rumor, ni piedras antiguas, ni personajes nuevos revelan o establecen secretos jugables.

**Agentes 01 y 02:** el Escritor actualiza sus propuestas en #705, el Historiador aporta evidencia por #706; **este agente no edita sus archivos**. Toda aprobación relevante de canon debe quedar en la PR correspondiente por los dos arquitectos, con tensión, evidencia, decisión y alcance.

## 8. Decisión final y puerta de entrada al Capítulo 1

- **Voz/método:** APROBABLES CON AJUSTES — **pendientes de ratificación del Arquitecto Editorial**.
- **Biblia, personajes, índice y fichas:** PROPUESTAS NO APROBADAS.
- **Hechos contrastados:** rutas iniciales, regiones, clases y salas mencionadas son compatibles con fuentes revisadas; **no significa aprobación de episodios inventados**.
- **PR #705:** debe permanecer **en borrador** hasta registrar las decisiones y revisión conjunta requerida.
- **Capítulo 001:** **BLOQUEADO**. No iniciar escritura, arte, publicación, merge ni cambios al juego en virtud de este informe.

**Siguiente consumidor:** Arquitecto Editorial Principal y Arquitecto VT2, por revisión de esta PR y #705/#706. 

---
*Firma funcional: Agente 03 — Editor Integral y Revisor de Canon · Crónicas de Vaisgard.*
