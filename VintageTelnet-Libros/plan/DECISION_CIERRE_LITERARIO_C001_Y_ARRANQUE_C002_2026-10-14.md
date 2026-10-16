# Cierre literario C001 y autorización de borrador C002

**Proyecto:** Crónicas de Vaisgard — Libro I *El primer camino*  
**Fecha de decisión:** 2026-10-14 (México)  
**Repositorio:** `vaisork/MatiasGameLab` / `VintageTelnet-Libros/`  
**Referencia:** [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705), [dictamen editor #707](https://github.com/vaisork/MatiasGameLab/pull/707), [atlas historiador #706](https://github.com/vaisork/MatiasGameLab/pull/706).  
**Versión textual C001 revisada:** blob `d445b8feedb4d4013d3cda9fa01166ab634fb981` (aprox. 2,526 palabras).  
**Destino final:** EPUB 3 reajustable, para entrega familiar el **viernes 16 de octubre de 2026**, sujeto a calidad y coherencia; no presentar fragmentos como novela completa.

## 1. Dictamen del Arquitecto Editorial sobre C001 revisado

**APROBADO EN LO LITERARIO COMO CAPÍTULO PILOTO, SIN APROBAR FUSIÓN CANÓNICA NI PUBLICACIÓN DEFINITIVA.**

Comprobación de observaciones:
- **M01 solventada:** ahora Lera dice «Voy a corregirla» y efectivamente corrige la carta existente. No introducir una hoja nueva.
- **M02 solventada en planificación:** C002 ya no se centrará en retirar artículos de una mochila; el nuevo argumento debe tener un conflicto independiente.
- **M03 solventada:** se guarda taza en bolsillo exterior y se saca para la broma.
- **L01–L02 solventadas satisfactoriamente:** regreso algo más concentrado y propósito de vecina marcado como inferencia («parecía procurar»).
- **D01 solventada:** enlace del registro de continuidad es relativo a la misma carpeta.
- **Estado emocional:** Lera acepta que podría ser rechazada por Dalia, pero aún no ha cerrado su deuda con Mara y el trabajo de Valdren. La carta continúa incompleta; no hay viaje realizado.
- **Canon de espacios/horas:** plaza al alba, luego huertos, regreso de mañana; compatible con salidas y escenas diurnas de `content/regions/edran.json`.

**PENDIENTE de co-revisión VT2 en la misma PR #705 antes del merge:** los hechos particulares de la tabla/cuñas y turnos de agua y personajes originales Lera/Mara/Dalia deben clasificarse explícitamente como **ficción exclusiva de la novela, compatible con la vida cotidiana de Valdren, SIN crear NPC, misión, estado o evento persistente en el juego**. Si el Arquitecto VT2 identifica contradicción, corregir el pasaje antes de cerrar; no fusionar hasta acuerdo registrado.

**C001 queda cerrado para el WIP de redacción ordinaria**: no reescribir más salvo hallazgo concreto del Revisor 03 o Arquitecto VT2. Su aprobación final de canon, arte y EPUB se procesa por separado; una revisión pendiente no autoriza fusionar.

## 2. Autorización explícita al Escritor 01 — **borrador de C002**

**AUTORIZADO** un solo capítulo Markdown nuevo en la **misma PR #705**, con WIP=1. No iniciar C003 hasta terminar el circuito de C002. No crear PR ni repositorio nuevos.

**Título de trabajo sugerido:** «Lo que se queda»; el título anterior, «Lo que cabe en una mochila», queda disponible como metáfora solamente si la prosa no repite inventario.

**Objetivo dramático:** Lera debe hacerse responsable de su ausencia **mediante hechos y acuerdos**, no otra promesa. Continuar directamente de C001. El lector descubre cuánto cuesta irse a quien se queda; la despedida tiene un efecto concreto.

**Continuidad obligatoria:**
- La mañana de C001 acaba en la plaza. La carta a Dalia ha sido corregida en su inicio pero **no está terminada**; Dalia no conoce ese esfuerzo ni ha prometido verla.
- Mara accedió únicamente a abrir el agua al día siguiente y a preguntar por los demás turnos. Los turnos futuros **no están arreglados**.
- La tabla de canaleta fue reacomodada provisionalmente y requiere vigilancia; no convertirla en reparación definitiva del sistema canónico.
- Lera retiró el martillo y dos prendas de su bolsa; **no repetir escena de vaciar la mochila**. La taza está en bolsillo exterior.
- Lera todavía está en Valdren; Orven sigue sin introducirse; no inventar NPC canónicos, parentescos ni secretos.

**Conflicto requerido:** Mara, vecinos originales sin ID canónico o el propio trabajo cotidiano cuestionan la responsabilidad que Lera pretende dejar atrás. Lera propone una solución que al principio resulta insuficiente; deberá **negociar compromisos verificables** en vez de delegarlos por omisión. Mostrar el coste humano: una persona deberá reorganizar trabajo real para que ella pueda irse.

**Escenas y lugares:** preferentemente `valdren_plaza` y `valdren_huertos`, con trayecto de ida/vuelta confirmado. Si se incorpora otro lugar, citar salas y conexiones exactas de JSON. No es obligatorio visitar fragua ni patio; no forzar a Daro/Bren como figurantes expositores.

**Final requerido:** una despedida que no borre los desacuerdos, acuerdos de agua tan cerrados como permiten los hechos, la carta suficientemente preparada para llevarla y disposición verosímil de salir. **No atravesar todavía toda la ruta hacia Veyra**: C003 introduce el primer paisaje exterior. El cierre de C002 debe cambiar el estado de Lera, no repetir «algún día partiré».

**Orientación de longitud:** entre 1,800 y 2,700 palabras según respiración de escenas, no por volumen artificial. Prosa de novela, con diálogos naturales, momentos materiales, humor y tensión; nada de lecciones expuestas.

**Prohibiciones:** inventar biología/fauna (en particular Saltalodo), rutas/tiempos de viaje, profecías, origen de piedras, hechos sobre NPC canónicos, magia, misiones oficiales, ilustraciones nuevas o estados persistentes de juego.

**Entregables:** `capitulos/002-lo-que-se-queda.md` (si se adopta título) y `capitulos/002-continuidad-y-revision.md`, con matriz de hechos confirmado/compatible/descubrible/reservado y dos posibles puntos de imagen. El 03 revisará luego el manuscrito real en #707.

## 3. Secuencia de producción por capítulos para entrega familiar

**Modo editorial aprobado por el propietario:** publicar por capítulos legibles en EPUB, con versiones de prelectura identificadas; no exigir cerrar los 15 capítulos para permitir una lectura real.

- **Ahora:** C001 versión corregida constituye el primer capítulo literariamente aprobado; co-revisión VT2 antes de aceptar texto final y fijar EPUB.
- **Siguiente prioridad:** Escritor 01 redacta C002; Revisor 03 valida C001 corregido y luego C002 en su PR; Historiador 02 responde dudas puntuales y avanza sólo cuando reciba necesidad localizada.
- **Agente 04:** preparar EPUB 3 **provisional** de los capítulos literariamente aprobados, usando únicamente recursos originales de arte verificados y autorizados; EPUB en Drive al autorizar la difusión. Una cubierta tipográfica es aceptable para prelectura si el arte está sin validar; no añadir imagen no aprobada.
- **Viernes 16 de octubre:** entregar a los hijos la versión más completa efectivamente **redactada, revisada y maquetada**; anunciar con honestidad capítulos contenidos y si el arco sigue en curso. No prometer un libro cerrado de 15 capítulos si no existe.

**No activar automatizaciones ni procesos en segundo plano**. Los colaboradores retoman el encargo al abrir sus respectivos chats o procesos.

## 4. Revisión conjunta de canon, alcance y bloqueos

- C001: propuesta literaria = riego y relaciones privadas; canon = canaleta y comunidad de Valdren sin esos NPC; tensión = compatibilidad de escena concreta; decisión editorial = **ficción exclusiva de novela, sin efecto jugable**; decisión de Arquitecto VT2 **pendiente**.
- C002: cualquier hecho nuevo de vida local se marca propuesta compatible y requiere cotejo VT2 si puede introducir canon; un conflicto no resuelto bloquea fusión, **no el primer borrador**.
- C003 y posteriores: tensión Saltalodo de #706 abierta; para el libro se lo excluye de Edran hasta acuerdo de ambos arquitectos.
