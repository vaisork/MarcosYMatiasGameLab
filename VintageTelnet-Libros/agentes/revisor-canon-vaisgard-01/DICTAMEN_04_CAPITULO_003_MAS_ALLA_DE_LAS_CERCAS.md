# Dictamen 04 — Capítulo 003 «Más allá de las cercas»

**Revisor:** `revisor-canon-vaisgard-01`, Agente 03 — Editor Integral y Revisor de Canon.  
**Mesa propia:** [PR #707](https://github.com/vaisork/MatiasGameLab/pull/707). **Autoría:** [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705). **Historiador/atlas:** [PR #706](https://github.com/vaisork/MatiasGameLab/pull/706).  
**Texto efectivamente leído:** `VintageTelnet-Libros/capitulos/003-mas-alla-de-las-cercas.md`, **blob `3714303b280434e44739221fd6e782732f1d1331`** (~2,013 palabras).  
**Matriz C003:** `capitulos/003-continuidad-y-revision.md`, **blob `7d41f4768a9c5dbd834e4fe149c40c6837386dcc`**.  
**Último C002:** `capitulos/002-lo-que-se-queda.md` blob `0d24df1220cac11cfab1d7de4e8f6c4776f19a98`, **APROBADO LITERARIAMENTE** tras cotejo en esta PR (adenda 03).  
**Canon realmente cotejado:** `vintage-telnet-2/content/regions/edran.json` **blob `dbdaead65f026a57925857f36388b28b94054498`** y `vintage-telnet-2/content/world.json` **blob `cbeb59becdc6f44c0dff1b5bd1f9c310009fa06c`**, ambas de `MatiasGameLab/main`; `docs/CANON_VIGENTE.md` y expediente de ruta en PR #706.  
**Decisión Arquitectura Editorial:** `plan/DECISION_EDITORIAL_C002_C003_Y_ARRANQUE_C004_2026-10-14.md` en #705; C003 viable, C004 expresamente autorizado como **borrador**, **NO** C005.  
**VEREDICTO DEL AGENTE 03: APROBABLE LITERARIAMENTE CON UN AJUSTE MENOR DE CONTINUIDAD (H01); no requiere reescritura.** **Sin contradicción de canon confirmada en escena.** Co-validación Arquitecto Editorial + Arquitecto VT2 sigue pendiente para fusión y publicación definitiva.

## 1. Evaluación narrativa

**La novela por fin se mueve:** los compromisos del agua se comprueban en pocas líneas, el abrazo de Mara contiene un afecto que no borra el enfado, y Lera cruza los **dos postes** que separan su pueblo del campo. A diferencia de C001–C002, aquí no hay otra negociación doméstica ni inventario de mochila. La breve decepción de que el mundo no marque ceremonialmente su partida es un detalle humano logrado.

**El exterior cambia el tipo de tensión:** sonidos secos del viento, corriente y terreno menos conocido; el cruce cauteloso de la losa da una pequeña prueba antes del encuentro. En el campo, Lera investiga el movimiento en los tallos, ve a un Espinajo defendiendo un espacio, cede terreno y cae **por su propia reacción**, sin que la criatura se vuelva villano u obligue a combatir. La raspadura y el hombro golpeado son riesgos proporcionados al inicio de viaje; aumentan la vulnerabilidad sin convertirla prematuramente en heroína invencible.

**Punto de vista y lectores:** tercera persona cercana a Lera, lenguaje visual y táctil; su asociación especulativa entre movimiento en las cercas y Espinajo está presentada como **incertidumbre de personaje**, no afirmación de narrador. El chapoteo de la acequia sigue sin atribución, evitando afirmar Saltalodo. Apta para 10–14 y adultos, con intensidad inicial moderada. El misterio de la herramienta y los **dos golpes** prepara una pregunta concreta para C004 sin prometer resolver el origen histórico de Vaisgard.

**Observación de ritmo para próximos capítulos (NO hallazgo bloqueante C003):** después de la caída hay varias líneas de introspección sobre la prudencia, muy próximas a las lecciones de C001/C002. No quitar la herida, los gestos de limpieza ni la decisión sobre el Espinajo. El capítulo siguiente ya debe **subir la tensión externa y aportar consecuencias nuevas** —no otra escena de autoexplicación sobre observar/escuchar—, como señala Arquitectura Editorial.

## 2. Cambios propuestos por gravedad

| ID | Gravedad | Texto observado | Corrección mínima al Escritor |
|---|---|---|---|
| **H01 — agua para limpiar raspadura** | **BAJA, necesaria antes de cierre literario definitivo** | «La herida tenía tierra. Lera la limpió con un poco de agua de su recipiente». En C001/C002 se menciona la **taza** y equipaje, pero no se establece que Lera cargue **agua limpia** en el exterior. | Introducir **una sola referencia natural previa** a un odre/cantimplora o recipiente con agua limpia llenado antes de partir, sin otra escena de preparar mochila. Ejemplo orientativo de solución, **no obligación de frase literal**: al cruzar los postes, notar el peso de la cantimplora llena; luego «agua de su cantimplora». La taza no sustituye mágicamente un contenedor hermético. |
| **L01 — material de secado de la herida** | **BAJA, aclaración opcional** | «Después se secó con una parte limpia de la tela que llevaba». C002 estableció que Mara le dio una tela para **envolver el carboncillo**, por lo que secarse con esa misma tela podría ensuciar la abrasión; C001 también llevaba pan en otra tela. | Si se trata de la tela del carboncillo, precisar que usa **otro paño limpio** disponible en la bolsa o un borde realmente limpio de tela independiente. Una frase basta; no cargarla de detalle médico. |
| **L02 — expresión corporal del cierre** | **BAJA, estilo opcional** | «ajustó la correa que le rozaba el hombro **herido**»: antes se establece un golpe de hombro, no herida abierta ahí. | Preferible «hombro **dolorido**» para distinguir contusión del raspón en la mano. No bloquea el capítulo. |

**No hay ajustes medios o graves que exijan reestructurar escenas.** Solicito H01 como única precisión necesaria; L01 y L02 son pulidos opcionales que pueden hacerse de una vez. **No reabrir C001 ni las correcciones ya resueltas de C002.**

## 3. Verificación de geografía y criatura (hechos del juego vs. ficción)

| Secuencia del capítulo | Comprobación en fuente vigente | Resultado |
|---|---|---|
| `valdren_huertos` → salida oriental | `rooms.valdren_huertos.exits.este = edran_salida_huertos`; canaleta, árbol y huertos existentes | **CONFIRMADO** |
| Dos postes de Cercas Bajas, Valdren al oeste, campos al este | `rooms.edran_salida_huertos.description`; `.look.oeste`; `.look.este` | **CONFIRMADO** |
| `edran_salida_huertos` → `edran_acequia` | `rooms.edran_salida_huertos.exits.este = edran_acequia` | **CONFIRMADO** |
| Losa de la acequia, boca de zanja con hojas, estanque entre juncos | `rooms.edran_acequia.description`, `.examine.losa`, `.exits` | **CONFIRMADO**. La inmersión/ruido no se atribuye a Saltalodo |
| `edran_acequia` → `edran_surcos` | `rooms.edran_acequia.exits.norte = edran_surcos` | **CONFIRMADO** |
| Tierra nueva y tallos viejos, sendero sin sembrar, ave parda | `rooms.edran_surcos.description`, `.day`, `.echoes` | **CONFIRMADO**, sin inventar duración ni distancia |
| Espinajo de rastrojo | `world.json.creatures.espinajo_rastrojo`: compacto, espinas, pequeña parcela de Edran, advierte y **no persigue**; `rooms.edran_surcos.signals` y `.wildlife_pool` | **CONFIRMADO**, narración sin combate forzado ni conducta imposible |
| `edran_surcos` → límite oriental hacia zanja | `rooms.edran_surcos.exits.este = edran_zanja_antigua`; `rooms.edran_zanja_antigua.description` y `.day` tienen losa vertical y **herramienta apoyada** | **CONFIRMADO elemento visible; los dos golpes son FICCIÓN PROPUESTA**, sin autor identificado ni estado canónico |
| Cierre con movimiento hacia el este | Salida oriental de surcos realmente existe | **COMPATIBLE**. No asume entrada al canal subterráneo ni resolución de secreto |

**Fronteras de conocimiento:**
- **Lera** sólo ve la criatura, interpreta su postura y se aparta. No sabe qué movió la mata inicial o causó el chapoteo. Su deseo de pedir consejo a Mara es memoria subjetiva, no telepatía.
- **Mara y Sabel** permanecen en huertos, Sabel sostiene la **tablilla** que recibió en C002 y no hay reparación definitiva de la tabla de agua.
- **Dalia** no está en escena ni conoce la carta terminada.
- **La herramienta y los golpes** son un gancho de escena local para C004; no adjudicarles identidad, secreto, misión, acceso prohibido, cronología antigua o función jugable sin aprobación conjunta.
- **Animal Espinajo:** no asignar persecución, premio, daño de videojuego ni encuentro obligatorio a todo jugador. Lera no aprende poderes nuevos. Ausencia de Saltalodo conforme a medida editorial temporal de #706.

## 4. Revisión canónica y siguiente trabajo

**Propuesta literaria exclusiva:** salida de Lera, corte/raspadura y golpe, movimiento bajo tallos, dos golpes, instrumento apoyado y decisión de avanzar al este; no crean nuevos NPC, estados persistentes, flags, recompensas ni registro de combate del juego. Lo situado en JSON se utiliza como apoyo de ambiente y conducta, no como prueba de que cada jugador presencia el evento del libro.

**Arquitecto Editorial + Arquitecto de VT2:** en #705 registrar **propuesta → evidencia → tensión → decisión → alcance** para compatibilidad de trama privada (Lera, Mara, Sabel, riego) y hechos C003 (señales/herramienta/golpes) más límites de secretos. Contradicciones abiertas bloquean fusión/publicación definitiva, **no la redacción de borrador de C004 ya autorizada**.

**Escritor 01:** ajustar **H01** en su rama, opcionalmente L01/L02, actualizar registro de C003 y pasar **nuevo SHA de blob**. Una vez corregido, el Revisor 03 cotejará sólo esas líneas. El Arquitecto Editorial decide cierre literario.

**C004:** Arquitectura Editorial **YA AUTORIZÓ UN ÚNICO BORRADOR** en `plan/DECISION_EDITORIAL_C002_C003_Y_ARRANQUE_C004_2026-10-14.md` de #705; **no** implica aprobación literaria/canónica definitiva C003, ni autoriza C005. El C004 debe desarrollar la pregunta de la zanja por salas conectadas `edran_surcos → edran_zanja_antigua → edran_era` sin entrar al canal cubierto o inventar misterio mayor. No bloquear con un dictamen antiguo de C002.

**Publicación:** sólo después de autorización del circuito EPUB #708; prerevisión no equivale a distribución definitiva. Ningún arte nuevo ha sido solicitado/aprobado aquí.

— **Agente 03 · Editor Integral y Revisor de Canon · Crónicas de Vaisgard.**
