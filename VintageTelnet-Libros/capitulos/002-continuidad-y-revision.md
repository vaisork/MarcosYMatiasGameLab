# Capítulo 002 — Registro de continuidad, canon y revisión

**Manuscrito:** [002 — Lo que se queda](002-lo-que-se-queda.md)  
**PR:** [#705](https://github.com/vaisork/MatiasGameLab/pull/705)  
**Responsable:** Escritor de Aventuras 01, `escritor-aventuras-vaisgard-01`.  
**Estado:** **BORRADOR C002 ENTREGADO**, sin aprobación para fusión/publicación. WIP de redacción: solo este capítulo.  
**Extensión:** aproximadamente **2,626 palabras**, incluida cabecera Markdown.  
**Autorización formal:** `../plan/DECISION_CIERRE_LITERARIO_C001_Y_ARRANQUE_C002_2026-10-14.md`.  
**Antecedentes:** Capítulo 001 corregido y aprobado **literariamente**, [PR #707](https://github.com/vaisork/MatiasGameLab/pull/707); Historiador de Edran, [PR #706](https://github.com/vaisork/MatiasGameLab/pull/706).

## 1. Historia y avance distintivo respecto de C001

El C001 termina con Lera en la plaza tras corregir **solo el comienzo** de una carta a Dalia. Mara ha aceptado abrir el riego al día siguiente, **sin cubrir el resto de una ausencia de duración desconocida**. La reparación de la canaleta quedó temporal.

En C002, Lera **termina la carta**, reconoce que una promesa sin fecha no cubre trabajos reales y negocia el relevo con **Sabel**, vecina **original y exclusiva de esta novela**. La conversación pasa por el **Pozo de las Dos Cuerdas**, un sitio existente al sur de la plaza, y el corredor de los huertos al este de la plaza. Sabel solo acepta asumir el turno tras recibir explicación de la avería, una demostración práctica de qué puede hacer sin forzar la tabla y un arreglo consentido con las personas que deberán recoger temporalmente hojas destinadas a una cocina. Una segunda vecina, sin nombre ni función institucional canónica, acepta **acompañar a Sabel si puede**, sin garantizar disponibilidad inmediata.

Lera anota **acuerdos privados** en una tablilla sobrante, no en un registro oficial. Se pospone su partida **hasta la mañana siguiente** para verificar con Mara el primer turno y comprobar el agua al final del día. Mara sigue enfadada; ayuda y amistad no significan que la fricción haya desaparecido.

**Estado al terminar C002:** Lera permanece en Valdren, aún **no ha salido por `edran_salida_huertos`**; carta a Dalia **terminada, sin enviar ni respuesta**; equipaje previamente reducido se conserva sin nuevo inventario; existe acuerdo local de relevo **aceptado pero no irrevocable** y un límite claro sobre quién atiende la avería temporal. Lera prevé partir tras comprobar el turno siguiente; C003 puede abrir la primera salida real.

## 2. Datos confirmados usados (fuente del juego, ABIERTA)

| Elemento del capítulo | Fuente vigente real | Clasificación |
|---|---|---|
| Edran/Valdren: trabajo comunitario entre campos y agua | `vintage-telnet-2/docs/CANON_VIGENTE.md`; `vintage-telnet-2/content/regions/edran.json > regions.edran.identity` | ABIERTA / CONFIRMADA |
| Plaza de tierra apisonada, carro, banco alrededor de piedra antigua, pan y fragua | `content/regions/edran.json > rooms.valdren_plaza.description` | ABIERTA / CONFIRMADA |
| Plaza al **sur** hacia Pozo de las Dos Cuerdas, y pozo al **norte** hacia plaza | `rooms.valdren_plaza.exits.sur = valdren_pozo`; `rooms.valdren_pozo.exits.norte = valdren_plaza` | ABIERTA / CONFIRMADA |
| Pozo: brocal, cuerda nueva y vieja, tejadillo, piedras para hacer fila | `rooms.valdren_pozo.description` | ABIERTA / CONFIRMADA |
| Plaza al **este** hacia el Corredor de los Huertos y retorno **oeste** | `rooms.valdren_plaza.exits.este = valdren_huertos`; `rooms.valdren_huertos.exits.oeste = valdren_plaza` | ABIERTA / CONFIRMADA |
| Huertos: cercas, puertas de cocina, árbol de ramas anchas, canaleta | `rooms.valdren_huertos.description` | ABIERTA / CONFIRMADA |
| Actividad vecinal de hojas que llegan a la cocina desde huertos | `rooms.valdren_huertos.day` | ABIERTA / CONFIRMADA |
| Piedra vieja del banco; origen no atribuido | `rooms.valdren_plaza.description`, `docs/CANON_VIGENTE.md` | ABIERTA observable; origen RESERVADO/no inferido |

**Precisión:** el texto solo conoce los lugares mostrados; no inventa duración ni distancia hacia Vaisgard, cronologías fundacionales, servicios nuevos del juego ni funciones de NPC canónicos. No hay criaturas (ni Saltalodo), habilidades/clases, estadísticas ni secretos.

## 3. Propuestas de ficción EXCLUSIVAS DEL LIBRO que deben cotejarse

| Propuesta | Alcance y cautela |
|---|---|
| **Lera, Mara y Dalia** (continúan C001), **Sabel** (nueva) y vecinos sin nombre | COMPATIBLE / PERSONAJES ORIGINALES DE NOVELA. No nuevos registros `npcs`, roles jugables, parentescos canónicos ni eventos de partidas. Dalia no aparece ni recibe mensaje. |
| Turnos particulares de riego, tareas de llevar hojas y reparto temporal acordado | COMPATIBLE / SOLO NOVELA: situación privada y negociada, **no sistema comunitario obligatorio ni configuración de producción de VT2**. |
| Tabla/cuña temporalmente mal asentada, gota persistente, revisión por varias personas | COMPATIBLE / SOLO NOVELA: la trama continúa el hecho local introducido en C001 sin declararlo estado persistente de la sala ni reparar el juego. **Pendiente de co-revisión Arquitecto VT2/Editorial**. |
| Tablilla de desecho con lista de acuerdos de Lera | COMPATIBLE / OBJETO PRIVADO DE NOVELA: no registro oficial ni objeto coleccionable en contenido del juego. |
| Retraso de partida de Lera hasta el amanecer siguiente | COMPATIBLE / CRONOLOGÍA INTERNA DEL LIBRO: el relato no presupone cuánto tarda llegar de Edran a Veyra. |
| Carta de disculpa a Dalia terminada y guardada | COMPATIBLE / RELACIÓN PRIVADA DEL LIBRO: no quest, recompensa o secreto del juego. |

**Sin contradicciones confirmadas en la ruta narrada.** Pero falta la co-decisión de compatibilidad VT2 respecto de los usos privados de riego, figuras originales y su no persistencia en el videojuego.

## 4. Seguimiento de continuidad detallado

- **Lera:** ha visto el problema de la canaleta, reconoce su error de delegar sin permiso y observa los límites de quienes la ayudan. Renuncia a partir ese mismo día, resuelve acuerdos privados y termina la carta. No sabe si Dalia la recibirá.
- **Mara:** conoce la carta y la intención de Lera desde C001, **no su texto completo**; acepta su apertura de agua al día siguiente, no todo el reemplazo, conserva enfado. Regresa con Lera al pozo/huertos/plaza. No convierte su ayuda en perdón instantáneo.
- **Sabel:** personaje exclusivamente editorial: vecina de huerto que recibe agua después de un tramo de canaleta. Negocia atención del riego durante ausencia de Lera **solo bajo condiciones concretas** de organización y colaboración; puede renegociar si cambian los hechos.
- **Vecinos del corredor y pozo:** personas ambientales originales sin nombre e historia canónica asignada. Solo asumen tareas si se cuenta su aceptación, y dentro de su propia disponibilidad. **Ningún NPC con nombre del juego participa.**
- **Estado de agua:** corre dentro del cauce; gota de fuga sigue existiendo; nadie pretende que la tabla haya quedado arreglada para siempre.
- **Cronología:** mañana de C001 al regresar a plaza → mediodía y tarde de C002 → comprobación al atardecer → partida prevista para siguiente mañana. **C003 no ha sido escrito.**
- **Objetos:** mochila reducida en C001, taza en bolsillo exterior, carta terminada, carboncillo envuelto en tela prestada por Mara y tablilla privada de acuerdos. No se ha intercambiado dinero ni asumido una economía no cotejada.

## 5. Oportunidades de ilustración; no insertar hasta validación del Director de Arte

1. **Pozo de las Dos Cuerdas:** fila discreta de vecinos y sombra de tejadillo mientras Lera pide ayuda; intentar primero un **asset original existente y aprobado** correspondiente al pozo/plaza. No generar una imagen ni adjudicar el aspecto de Sabel sin aprobación.
2. **Corredor de los Huertos:** Lera, Mara y Sabel observan el agua bajo el árbol de ramas anchas; referencia de lugar posible **`vintage-telnet-2/client/art/places/valdren_huertos-anime-v1.webp`** inventariada por el Historiador #706; comprobar archivo, manifiesto, versión y aprobación editorial. **No afirmar que ya ilustra la escena exacta.**

El Director de Arte 04 (PR #708) valida asociación, derechos, estado de aprobación y distribución en EPUB 3. No se ha insertado arte nuevo.

## 6. Revisión y decisiones pendientes

- [ ] **Revisor Integral 03 — PR #707:** leer C002 real, evaluar ritmo, novedad frente a C001, naturalidad de la negociación, cierre abierto pero distinto, coherencia de carta/objetos, focalización y lectura 10–14/adultos.
- [ ] **Arquitecto Editorial:** evaluar arco Lera–Mara, dramatización de costo humano, extensión, consistencia del aplazamiento y decisión de final.
- [ ] **Arquitecto VT2 + Arquitecto Editorial (en PR #705):** documentar **propuesta → fuente → tensión → decisión → alcance** de la vida de agua, tareas, personajes originales y tabla temporal. **Contradicción canónica sin resolver = bloqueo de fusión**.
- [ ] **Historiador 02 — PR #706 (solo si hace falta):** responder cuestión concreta de prácticas de huertos/pozo, no abrir expediente masivo.
- [ ] **Director de Arte 04:** posponer publicación EPUB definitiva hasta aprobación de manuscrito y canon.
- [ ] **Escritor 01:** esperar dictamen y correcciones de C002; **no iniciar C003**.

**No se modificó `vintage-telnet-2/`, arte original, Raspberry, otros repositorios ni el Segundo Cerebro.** El prólogo histórico del libro está bajo revisión editorial/canon distinta y **no cambia esta entrega literaria**.
