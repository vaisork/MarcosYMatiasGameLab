# Capítulo 003 — Registro de continuidad y revisión

**Manuscrito:** [Capítulo 3 — Más allá de las cercas](003-mas-alla-de-las-cercas.md).  
**Escritor:** `escritor-aventuras-vaisgard-01` · **PR #705**.  
**Estado:** **BORRADOR WIP=1 entregado**, pendiente de revisión literaria y cotejo de canon. **No publicar ni fusionar** todavía.  
**Extensión de prosa corregida:** aproximadamente **2,033 palabras** incluida la cabecera. Revisión H01/L01/L02 del Editor 03 aplicada; nuevo blob del capítulo `9a4eb8305b6996649c4889620868c7aefd719611`.  
**Autorización explícita:** `../plan/DECISION_EDITORIAL_C002_Y_AUTORIZACION_C003_2026-10-14.md`, versionada por el Arquitecto Editorial en #705.  
**Revisión previa:** el C002 fue revisado en #707 y corregido en esta rama: agua de Sabel y tablilla de acuerdos. C004 fue autorizado por `../plan/DECISION_EDITORIAL_C002_C003_Y_ARRANQUE_C004_2026-10-14.md` y posteriormente entregado en esta PR.

## 1. Resumen y avance narrativo

Al amanecer siguiente, Mara realiza su primer turno con Sabel y ambas cotejan la tablilla **que conserva Sabel**, sin afirmar que la canaleta haya quedado reparada permanentemente. Lera se despide **en menos de 350 palabras** desde la apertura de escena; cruza efectivamente los dos postes de la Salida de las Cercas Bajas y descubre el contraste entre vida de Valdren y terreno abierto.

En la Curva de la Acequia, cruza por una **losa ancha real del escenario**, sin seguir ni tocar la zanja de hojas. En el Campo de surcos distingue tierra recién removida, tallos viejos y el sendero sin sembrar. Un **Espinajo de rastrojo** defiende un pequeño espacio entre tallos, eriza espinas, va y vuelve al mismo borde. Al intentar acercarse para observarlo, Lera retrocede mal, resbala parcialmente y sufre una raspadura superficial; deja espacio al animal y este **no la persigue**. La pérdida de orientación y seguridad tiene una consecuencia física pequeña pero real.

En el límite oriental del campo, ve una herramienta junto a la losa vertical de la **zanja seca contigua**, y oye dos golpes que no puede atribuir con certeza; termina avanzando **hacia el este** con una pregunta local. No conoce aún identidad o explicación alguna, ni se presupone secreto mayor.

**Estado final:** Lera fuera de Valdren, en los surcos de Edran con avance hacia `edran_zanja_antigua`; carta terminada, todavía sin respuesta de Dalia, equipo sin alteraciones significativas; raspadura leve en una palma y golpe de hombro que pueden recordarse sin dramatizarlos como herida grave. Viaje iniciado de forma irreversible en el relato, sin fijar jornadas, velocidades o horas de tránsito.

## 2. Fuentes canónicas cotejadas

| Hecho | Fuente (rutas relativas a `vintage-telnet-2/`) | Estado |
|---|---|---|
| Valdren, huertos, árbol y canaleta | `content/regions/edran.json > rooms.valdren_huertos.description` | ABIERTA / CONFIRMADA |
| Desde huertos, salida al este | `rooms.valdren_huertos.exits.este = edran_salida_huertos` | ABIERTA / CONFIRMADA |
| Salida de las Cercas Bajas: dos postes, el pueblo al oeste, viento/campos al este | `rooms.edran_salida_huertos.description`, `.look`, `.exits` | ABIERTA / CONFIRMADA |
| Salida hacia acequia al este | `rooms.edran_salida_huertos.exits.este = edran_acequia` | ABIERTA / CONFIRMADA |
| Curva de la Acequia: losa ancha para cruzar, agua tranquila, estanque al sur y montón de hojas en zanja seca | `rooms.edran_acequia.description`, `.exits` | ABIERTA / CONFIRMADA |
| Desde Curva de la Acequia a surcos al norte | `rooms.edran_acequia.exits.norte = edran_surcos` | ABIERTA / CONFIRMADA |
| Campo de surcos: nueva tierra húmeda, tallos antiguos, sendero sin sembrar | `rooms.edran_surcos.description`, `.day`, `.exits` | ABIERTA / CONFIRMADA |
| Espinajo de rastrojo: cuerpo compacto, defensa con espinas, defiende pequeña parcela sin perseguir fuera de ella | `content/world.json > creatures.espinajo_rastrojo.description`, `.habitat`; `content/regions/edran.json > rooms.edran_surcos.signals`, `.wildlife_pool` | ABIERTA / CONFIRMADA |
| Desde surcos hacia zanja seca al este | `rooms.edran_surcos.exits.este = edran_zanja_antigua` | ABIERTA / CONFIRMADA |
| En zanja contigua: losa vertical y herramienta apoyada en contexto de trabajo diurno | `rooms.edran_zanja_antigua.description` y `.day` | ABIERTA / CONFIRMADA |

**Precauciones:** No aparece Saltalodo, pese a una mención conflictiva en la prosa diurna de la acequia; el atlas #706 confirmó `world.json.creatures.saltalodo.region = lethra` y recomienda **excluirlo de Edran** hasta revisión conjunta. No se atribuye origen antiguo a ninguna piedra. No se usa material de secretos, indicadores privados, misiones o NPC.

## 3. Aportes de ficción para co-revisión (NO canon del juego)

- **Lera, Mara, Sabel y Dalia:** personas propias del libro; las últimas dos no aparecen físicamente fuera de Valdren. Ninguna se añade a `npcs`. La distribución privada del agua permanece compatible solo si Arquitectura VT2 lo confirma.
- **Raspadura de mano, golpe de hombro y decisión de dejar pasar al Espinajo:** acontecimientos privados de la novela, sin daño de sistema, habilidad, recompensa o modificación de encuentros en VT2.
- **Contemplación de losas, hojas y campo por parte de Lera:** interpretación limitada a lo que presencia; no conocimiento oculto.
- **Dos golpes cerca de la zanja:** sugerencia sonora literaria local, sin identidad afirmada de la persona, oficio, misión, entrada secreta ni efecto en juego. Si el Arquitecto VT2 detecta tensión, revisar o retirar la señal antes de publicación.
- **Paso y posible elección hacia la zanja seca:** se respeta su conexión real al este; NO presupone entrada a ramal, canal subterráneo, puerta ni distancia medida.
- **Movimiento de animal pequeño junto a cercas:** señal anónima y ambigua, compatible con el `wildlife_pool` de `edran_salida_huertos`; **no se declara especie específica observada**.

## 4. Matriz de conocimiento/cronología

- **Mara y Sabel:** disponen del acuerdo local y de la tablilla con responsables; no acompañan ni conocen lo sucedido a Lera fuera de Valdren.
- **Lera:** sabe que el riego queda atendido condicionalmente, pero no conoce el futuro. Reconoce el nombre `Espinajo` de conversaciones locales; su identificación cercana y comportamiento se observan en el presente capítulo. No deduce especie de la sombra fugaz junto a cercas ni causa del chapoteo en la acequia.
- **Dalia:** no ha recibido la carta; no conoce el viaje de Lera por esta escena.
- **Secuencia:** primer turno del día siguiente tras C002 → salida de Valdren → dos postes → Curva de la Acequia → Campo de surcos → límite del paso oriental hacia zanja. **No se definen minutos, kilómetros o días.**
- **No se han alterado** los oficios, horarios o diálogos de NPC canónicos. El Espinajo no se representa persiguiendo al viajero.

## 5. Dos oportunidades de arte (sin insertar ni generar)

1. **Salida de las Cercas Bajas:** primeros campos abiertos y dos postes; buscar arte original de `client/art/places/edran_salida_huertos-anime-v1.webp` sujeto a cotejo de existencia/aprobación por Director de Arte 04.
2. **Encuentro con Espinajo en Campo de surcos:** usar solo las imágenes originales apropiadas y aprobadas por el juego; candidatos `client/art/places/edran_surcos-anime-v1.webp` y `client/art/bestiary/espinajo-rastrojo-anime-v1.webp`. No se presupone que la imagen muestre exactamente el mismo incidente. Aprobar en #708 antes de publicación.

## 6. Circuito editorial pendiente

- [ ] **Revisor Integral 03** (#707): evaluar tensión exterior, naturalidad, ritmo, verosimilitud del Espinajo, secuencia de lugares y la pregunta final de la zanja.
- [ ] **Arquitecto Editorial:** dictaminar eficacia y avance del arco respecto a los dos capítulos de vida comunitaria; solicitar correcciones concretas si hacen falta.
- [ ] **Arquitecto VT2 + Editorial:** confirmar compatibilidad del itinerario y señal de trabajo en la zanja, y continuar co-revisión pendiente C001/C002 y prólogo.
- [ ] **Director de Arte 04:** no incluir ilustraciones hasta verificar fuente y aprobación; futura prelectura EPUB 3 en orden Prólogo → C001 → C002 → C003 solo tras controles correspondientes.
- [x] **Escritor 01:** C004 redactado tras autorización operativa explícita; mantener WIP=1, no iniciar C005.

**Límites cumplidos:** solo Markdown en `VintageTelnet-Libros/`; sin cambios al juego, archivos de agentes ajenos, arte, Raspberry, Drive ni Segundo Cerebro.

## Adenda — cambios tras dictamen del Revisor 03 en PR #707

- **H01 resuelto:** declaración textual temprana de una **pequeña cantimplora con agua limpia, llenada antes de la salida**; el lavado de la herida utiliza su contenido, no agua desconocida de una acequia. En C004 esa misma cantimplora pierde agua durante el peligro del carro.
- **L01 resuelto:** el **retazo limpio** para secarse se identifica como diferente de la tela que envuelve carboncillo de la carta.
- **L02 resuelto:** `hombro herido` → `hombro dolorido` por golpe sin lesión abierta.
- **Nuevo blob C003:** `9a4eb8305b6996649c4889620868c7aefd719611`. Nuevas correcciones requieren cotejo pero no redacción de nuevo C003 sin motivo canónico real.
