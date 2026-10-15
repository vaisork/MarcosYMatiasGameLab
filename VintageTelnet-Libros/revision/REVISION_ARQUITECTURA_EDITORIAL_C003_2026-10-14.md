# Dictamen del Arquitecto Editorial — Capítulo 003 «Más allá de las cercas»

**Proyecto:** *Crónicas de Vaisgard*, Libro I — *El primer camino*  
**Fecha editorial:** 14 de octubre de 2026 (México)  
**Autoría:** [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705)  
**Revisión integral:** [PR #707, Dictamen 04](https://github.com/vaisork/MatiasGameLab/blob/editorial/revisor-canon-vaisgard-01-dictamen-705/VintageTelnet-Libros/agentes/revisor-canon-vaisgard-01/DICTAMEN_04_CAPITULO_003_MAS_ALLA_DE_LAS_CERCAS.md)  
**Texto verificado:** `capitulos/003-mas-alla-de-las-cercas.md`, blob `3714303b280434e44739221fd6e782732f1d1331`; registro `capitulos/003-continuidad-y-revision.md`, blob `7d41f4768a9c5dbd834e4fe149c40c6837386dcc`.

**Decisión:** **APROBABLE LITERARIAMENTE CON UN AJUSTE MENOR NECESARIO**; no reestructurar el capítulo. Pendiente cotejar texto corregido y decisión conjunta con el Arquitecto VT2 sobre material compartido antes de fusionar/publicar como canon definitivo.

## 1. Lo que está conseguido

- **Avance verdadero:** Lera sale físicamente de Valdren por los dos postes tras una despedida breve; el lector ya no consume otro capítulo de trámites.
- **Continuidad:** Mara efectúa su primer turno con Sabel; Sabel conserva la tablilla entregada en C002; la canaleta aún tiene una gota y requiere vigilancia, no se declara reparación eterna. La carta dirigida a Dalia sigue guardada y sin respuesta.
- **Ritmo:** la primera señal en las cercas, el cruce de la losa y el Espinajo aumentan gradualmente incertidumbre y riesgo. Su caída tiene una consecuencia modesta pero material.
- **Conducta de criatura:** el Espinajo de rastrojo protege su franja, se eriza, va y vuelve al borde; no persigue fuera de su territorio. Respeta `world.json.creatures.espinajo_rastrojo` y `edran_surcos.signals`.
- **Geografía:** `valdren_huertos → edran_salida_huertos → edran_acequia → edran_surcos`, con losa, estanque, hojas y surcos descritos en `vintage-telnet-2/content/regions/edran.json`. Hacia el este existe `edran_zanja_antigua`.
- **Cierre narrativo:** herramienta apoyada en la losa vertical de zanja y dos golpes de origen incierto; un gancho local, **no** descubrimiento ni explicación de secreto canónico.

## 2. Cambios mínimos pedidos al Escritor 01

| ID | Prioridad | Ubicación | Acción |
| --- | --- | --- | --- |
| **H01** | **Necesario para cierre literario** | «La herida tenía tierra. Lera la limpió con un poco de agua de su recipiente» | Introducir **antes de llegar a los surcos** una referencia orgánica a que Lera lleva **una cantimplora/odre con agua limpia** llenado antes de salir. Reemplazar el «recipiente» ambiguo por la misma pieza ya presentada. Sin nueva escena de mochila ni agua tomada directamente de acequia. |
| **L01** | Pulido sugerido | «Después se secó con una parte limpia de la tela que llevaba» | Dejar claro que el paño usado para la raspadura no es el envoltorio del carboncillo que Mara entregó en C002. Una frase. |
| **L02** | Pulido sugerido | «La correa que le rozaba el hombro herido» | Preferir **«hombro dolorido»**: hay golpe, no corte en el hombro. |

**No** solicitar reescrituras de C001 ni C002. El dictamen independiente #707 confirmó ambas líneas canónicas y la viabilidad de la escena. El Escritor corregirá **solo en su propia rama**, actualizará registro de continuidad y devolverá nuevo SHA. El Editor 03 cotejará el cambio puntual sobre el nuevo blob; Arquitectura Editorial emitirá cierre definitivo literario.

## 3. Límites de canon

- Hechos **confirmados en juego**: itinerario de Edran, dos postes, losa de acequia, surcos y comportamiento territorial del Espinajo.
- **Ficción solo de novela, no incorporada al juego:** ruta recorrida particularmente por Lera, su raspadura/golpe, sonidos de los golpes, intención de acercarse a la zanja, encuentros observados; personajes Lera/Mara/Sabel/Dalia, relevos y tablilla.
- **No se detecta contradicción confirmada** en C003 con las fuentes examinadas; sin embargo, todo asunto sobre hechos persistentes, NPC oficiales, misterios y secreto de canal cubierto exige co-decisión del Arquitecto VT2 + Editorial **en esta PR antes de fusión**.
- El Saltalodo no aparece y sigue excluido editorialmente de Edran mientras se resuelve la divergencia de #706.

## 4. Continuidad hacia C004

**C004 ya está autorizado como borrador** por la decisión `plan/DECISION_EDITORIAL_C002_C003_Y_ARRANQUE_C004_2026-10-14.md`. No necesita otra autorización. Prioridades para el siguiente capítulo:

- **Nueva tensión externa y consecuencias:** resolver o reinterpretar con hechos los dos golpes y herramienta, sin fabricar misterio gigante ni repetir el mismo Espinajo.
- **Ruta válida:** `edran_surcos --este--> edran_zanja_antigua --norte--> edran_era`; terraplén más adelante si la escena lo justifica. No entrar en `edran_canal_entrada` ni revelar secretos sin permiso.
- **Evitar el exceso de moralejas:** después de C001 y C002, la lección de escuchar/observar ya se ha establecido. Mostrar decisiones, tensión y costo mediante acciones.
- **Objetos y estado:** Lera porta carta sin entregar, taza y escaso equipaje; agua limpia identificada tras H01. Sabel conserva tablilla; herida pequeña en palma y hombro golpeado pueden causar molestia sin dramatización.

**Estado de publicación:** apto para próxima **prelectura provisional** cuando se aplique H01; no equivale a validación de canon ni EPUB final autorizado.

No se crean nuevos agentes, tareas programadas ni cambios al videojuego.
