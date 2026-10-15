# Capítulo 005 — Continuidad, fuentes y revisión editorial

**Manuscrito:** [005 — Una historia a medias](005-una-historia-a-medias.md)  
**Autor:** `escritor-aventuras-vaisgard-01` — [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705).  
**Estado:** **BORRADOR C005 COMPLETO PARA REVISIÓN**, sin autorización de fusión/publicación ni de C006.  
**Extensión:** ~**2,535 palabras** contando encabezado.  
**Permiso formal:** `../plan/DECISION_CIERRE_C004_Y_ARRANQUE_C005_2026-10-15.md` (Arquitectura Editorial; WIP=1).  
**Versión de prosa:** blob `16d6f5d34d9becb07c08720b60a3eaf7d50765ce`.  
**Continuidad anterior:** C004 blob `fe2ef09ca3c363e324ebf2228ad896a4f349b27c`, aprobado literariamente; dictamen final #707.

## 1. Trama y continuidad objetiva

**Punto inicial — continuación literal de C004:** En `edran_terraplen`, después de media subida, la persona propietaria de un saco pesado pregunta «¿Les queda un poco de agua?». Lera tiene **cantimplora casi vacía** tras derramarse agua al apartarse de un carro; conserva raspadura leve en una palma, hombro dolorido, carta privada para Dalia aún sin enviar, taza en bolsillo exterior. **Responde y comparte de inmediato** una pequeña porción de la reserva, y guarda el resto. La cuerda del porteador sigue **insuficiente** para partir el saco de forma segura. Su dueño/a **autoriza** dejar temporalmente la carga bajo custodia voluntaria del porteador mientras va con Lera a solicitar ayuda a la casa; ninguna persona es obligada a custodiarla o transportarla.

**Ruta:** `edran_terraplen → edran_casa_camino` (norte). En la casa la mesa está separada de las cargas mojadas, hay fuego/olor a sopa y casillas de mensajes. Aparece **Aren**, lector de mensajes canónico, únicamente desempeñando su actividad pública de cotejar procedencias. Una nota sobre una **carga detenida para reparar una rueda** se interpreta erróneamente como prueba de que un carro desapareció o fue atacado. Lera relata un carro realmente visto en C004 (esperó a que ella se apartara antes de continuar) y luego debe aclarar ante viajeros que **no sabe si es el carro de la nota** y que su observación no prueba un asalto ni cierre de camino. Aren pregunta por el **origen y momento** de los testimonios y **no emite ninguna corrección oficial**, no dispara flags, no afirma destino confirmado de Lio/cargas.

**Consecuencia:** Lera espera ayuda voluntaria para la carga, renunciando a avanzar inmediatamente por la calzada. Una viajera anónima presta ayuda hasta un tramo más ancho (consentimiento explícito; sin regla general de escoltas). El dueño/a del saco elige mantenerlo **entero** porque no se ha conseguido nueva cuerda de longitud suficiente; la carga sale del paso estrecho, no se pretende que quede mágicamente resuelta su ruta completa. La cantimplora se **repone solo parcialmente** después de esperar; la mujer que atiende el fuego **no promete suministro libre ni abundante**. Lera pregunta el costo del caldo y **paga con sellos sin establecer tarifa fija**, ficción comercial puntual, no regla de tiendas. Lera sale de la casa **en dirección norte a `edran_calzada`**, sin llegar al hito ni cruzar a Veyra.

**Estado final:** Dalia no tiene noticias de Lera y la carta no se envía por casillas; Lera no conoce estado definitivo del carro al que alude la nota ni lo declara desaparecido. La persona del saco desciende con su propio bien desde un paso más seguro. Aren continúa archivando notas sin adjudicar autoría ni resultado. Lera lleva **cantimplora parcialmente rellena**, aún con lesiones menores. La casa queda atrás al iniciar el paso hacia la calzada. **C006 no iniciado.**

## 2. Fuentes CONFIRMADAS / ABIERTAS

| Detalle narrativo | Fuente vigente `vintage-telnet-2/` | Estado |
|---|---|---|
| Terraplén: carro, rodadas estrechas, ensanche, porteador ambiental, casa visible tras media cuesta | `content/regions/edran.json > rooms.edran_terraplen.description`, `.day`, `.exits.norte` | Confirmado / abierta |
| Terraplén conecta al norte con casa del camino | `rooms.edran_terraplen.exits.norte = edran_casa_camino` | Confirmado / abierta |
| Casa del Camino: puerta abierta, piedra, cargas húmedas junto entrada, mesa alta seca, fuego/olla, casillas para mensajes a Vaisgard | `rooms.edran_casa_camino.description` | Confirmado / abierta |
| Casa del Camino al sur con terraplén, al norte con calzada | `rooms.edran_casa_camino.exits.sur = edran_terraplen`, `.exits.norte = edran_calzada` | Confirmado / abierta |
| Aren lector de mensajes, en casa; pregunta por lugar/hora antes de dar crédito a testimonios | `npcs.edran_aren.description`, `.role`, `.home_room`, `.day` | Confirmado / abierta |
| Nota describe carga detenida para **reparar rueda**, no desaparecida/retención | `rooms.edran_casa_camino.examine.nota` | Confirmado / abierta |
| Camino al norte: calzada de piedras gastadas, ruido de ruedas | `rooms.edran_calzada.description` | Confirmado / abierta |
| Moneda «sellos» en vida del juego | Economía general del juego, **cotejo técnico VT2 pendiente para uso de unidad y comercio de caldo** | Compatible/provisional, NO precio de juego |

**Límite de canon:** se usan hechos públicos de Aren, pero **no** se activan `edran_mensaje_aclarado`, `topics.correccion` ni su historia concreta con **Elva/Lio**, que pertenecen al contenido condicionado del juego. Ningún nombre de familiares, mensaje oficial nuevo o desenlace de misión de Aren se afirma como sucedido en el videojuego.

## 3. Material COMPATIBLE, propuesto para novela exclusivamente

| Propuesta literaria | Alcance y tensión |
|---|---|
| Persona del saco, porteador, ayudante viajera, mujer que sirve caldo y hombre de la capa | Gente anónima en una escena privada. El porteador es ambientalmente compatible; ninguno se declara NPC oficial, servicio fijo ni asociación permanente. |
| Intercambio de sorbos de agua, ayuda consentida y traslado de carga | Hechos particulares sin inventario, escasez, quest ni efecto permanente en el motor. **No** establece que la Casa del Camino provea agua gratuita e ilimitada. |
| Caldo pagado con sellos sin precio expresado | Detalle comercial privado, no tabla económica, no servicio de compra activado en VT2. Verificar compatibilidad, cambiar si contraría economía autorizada. |
| Distintas versiones de una carga detenida; rumor de asalto | RUMOR declarado como tal. **No** se confirma ataque, desaparición, fecha de llegada ni vínculo concreto con Elva/Lio. Nota real del juego se cita sin agotar su misión. |
| Diálogo nuevo con Aren («dónde/cuándo») | Conversación **exclusiva de novela**, derivada de su tema de fuente/lugar/hora; NO cita oficial textual ni extensión del canon de NPC. Editor + Arquitecto VT2 deben validarla antes de fusión. |
| Lera corrige su propia aportación al rumor | Evento ficcional local; no se actualiza mensaje del juego ni bandera de corrección. |
| Camino hacia la calzada al cierre | `edran_casa_camino.exits.norte` verificado; no se introduce un nuevo lugar, acceso, velocidad o atajo. |

## 4. Datos DESCUBRIBLES / RESERVADOS y cautelas

- La nota de rueda es pública en `examine.nota`, pero no permite deducir el destino de la carga; aun quien oye una noticia parcialmente verdadera **no puede afirmar un asalto**.
- La familia de Aren, la posible relación Elva/Lio y el resultado de `edran_mensaje_aclarado` **no se activan ni revelan** al público de la novela por este capítulo.
- Ni Aren ni el rumor anticipan detalles sobre Dalia. Carta conservada, sin servicios postales inventados.
- No aparece Saltalodo; su discrepancia Edran/Lethra sigue abierta en la PR #706.
- **No convertir** un punto de espera del C004/C005 en infraestructura canónica permanente o una segunda área oficial de ensanche: escena de retiro de cargas compatible solo si lo acepta VT2.

## 5. Dos puntos de ilustración propuestos a Arte #708

1. **Casa del Camino:** interior con fuego, mesa alta seca, cargas junto a entrada y casillas de mensajes. Buscar arte original del juego correspondiente a `client/art/places/edran_casa_camino-anime-v1.webp` (candidato; confirmar existencia y aprobación).
2. **Salida a la calzada:** primeros cantos pulidos, parches claros y sentido de tránsito de viajeros. Candidato `client/art/places/edran_calzada-anime-v1.webp`; verificar imagen original/manifiesto y permisos. No generar ilustraciones ni atribuir rostros de personajes exclusivos del libro automáticamente.

## 6. Revisión y próximos pasos

- [ ] **Arquitecto Editorial:** valor de conflicto y ritmo (rumor→acción, agua compartida→costo), confirmar que final no repite enseñanza previa y que el arco avanza realmente hacia Vaisgard.
- [ ] **Revisor Integral 03 (PR #707):** leer C005 completo; verificar coherencia factual de rumor, naturaleza abierta de nota, presencia de Aren sin forzar quest, continuidad de recursos/personas, economía de caldo, lectura 10–14 y cierre en calzada.
- [ ] **Historiador 02 (PR #706):** cotejo localizado Casa del Camino/Aren/nota/calzada solicitado en decisión de C005; mantener separadas fuentes públicas, flags y escena inventada.
- [ ] **Arquitecto Editorial + Arquitecto VT2:** co-decisión de canon exclusivo de novela sobre Aren/rumor, distribución privada de agua y encuentros, prólogo y discrepancia Saltalodo, **antes de fusionar o publicar definitivo**.
- [ ] **Director Arte 04:** maquetación/EPUB únicamente tras dictamen y autorización apropiados; no asumir que imagen existente está aprobada.
- [ ] **Escritor 01:** **no iniciar C006** hasta aprobación expresa y cierre del WIP de C005.

No se ha modificado `vintage-telnet-2/`, gameplay, NPCs, flags, arte, otros repositorios ni fuentes de otros agentes.
