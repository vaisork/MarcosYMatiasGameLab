# Capítulo 012 — Continuidad, fuentes y dictamen pendiente

**Libro:** *Crónicas de Vaisgard*, Libro I «El primer camino». **Autor:** Escritor 01, [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705).  
**Manuscrito:** [012 — Lo que todavía podemos elegir](012-lo-que-todavia-podemos-elegir.md), **2,719 palabras** incluido título, Git blob **`da0855503ab1d8365cee15c75c09535a0e30b69d`** tras microedición directa del Editor 03 (original `0f0eb9a49b2cee7318f2dc737a7865a6a49c992e`).  
**Autorización:** `../plan/DECISION_CIERRE_C011_Y_AUTORIZACION_C012_2026-10-15.md`.  
**Estado:** **BORRADOR COMPLETO, PENDIENTE DICTAMEN** del Revisor 03 y cierre del Arquitecto Editorial; **WIP=1: C013 NO INICIADO NI AUTORIZADO**. Sin merge ni publicación final hasta co-decisión expresa de canon VT2+Editorial.
**C011 previo:** manuscrito revisado `40e57cc711eaa889ca34a1fe0a36ea98f2a2f5e3` + matriz `93a675064180111d65959b27a3b40cbb0184ed7e`, ambos aprobados literariamente. L01/L02 corregidas por Editor 03.

## 1. Reloj, recorrido y causa/efecto

| Tiempo | Sala del juego | Acción literaria |
|---|---|---|
| **Noche 2**, inmediatamente tras C011 | `veyra_plaza_rutas --sur--> vaisgard_mercado` | Lera ya ha cumplido **dos** atardeceres de C009; no vuelve a prometer una tercera cita. La comerciante de fruta confirma que no hay segundo ofrecimiento de refugio. Se acomoda junto a muro y tejado con paso público, **sin permiso exclusivo, cama, derecho de posada ni gratuidad de hospedaje**: noche fragmentada y fría, se aparta para dejar transitar cajas y se despierta cansada. |
| **Día 3 por la mañana** | `vaisgard_mercado` | Lera se presenta efectivamente a la **prueba propuesta en C011**, sin trabajo garantizado. La comerciante enuncia tarea/horario/retribución **en alimento** antes de aceptar. Clasifica producto para trayecto largo, admite una equivocación y advierte al comprador sobre fruta bonita pero demasiado madura. Intervención pública de prueba, no quest. Recibe solo el alimento convenido. |
| **Día 3, mañana avanzada** | `vaisgard_mercado --norte--> veyra_plaza_rutas --este--> veyra_patio_senales` | Lera recuerda a **Mara**, personaje preexistente de Valdren (C001–C002): turnos reales de la canaleta que Lera dejó bajo acuerdos revisables. Escribe **una nota nueva para Mara en la cara interior limpia del envoltorio del alimento recién ganado**, no en papel infinito ni en el recorte de Nara. Con Arel intenta tramitar recado ordinario a **destinataria identificable** (Mara, vinculada a huertos/canaleta, con Sabel como referencia), con condiciones, incertidumbre, contraprestación de **sellos** y **sin acuse de entrega**. No es carta para Dalia ni localizador de personas. |
| **Día 3, resto de mañana** | `veyra_patio_senales --oeste--> veyra_plaza_rutas --sur--> vaisgard_mercado` | Lera vuelve al mercado, acuerda con la vendedora revisar **una cesta más**, sin obligación permanente ni contrato. Termina con decisión y acción presente, no con nueva espera ni mensajero que vuelve con noticias. |

**Conectividad confirmada:** `vintage-telnet-2/content/regions/veyra.json` `rooms.veyra_plaza_rutas.exits.sur=vaisgard_mercado`, `rooms.vaisgard_mercado.exits.norte=veyra_plaza_rutas`, `rooms.veyra_plaza_rutas.exits.este=veyra_patio_senales`, `rooms.veyra_patio_senales.exits.oeste=veyra_plaza_rutas`. No hay entrada en `veyra_archivo_cargas` ni viaje real a Valdren.

## 2. Canon público contrastado

| Elemento | Fuente | Límite |
|---|---|---|
| Mercado con fruta, cestas, comerciantes y cierre nocturno | `regions/veyra.json > rooms.vaisgard_mercado.description`, `.night`, `.day` | **Público**; vendedora y compradores sin ficha son figuras **solo novela**. Pago en comida y ensayo no establecen salario, empleador, tarifa, costo de fruto o mecánica de VT2. |
| Plaza con banco-piedra y salidas al Mercado y Patio de Señales | `rooms.veyra_plaza_rutas.exits`, `.description` | **Público**; dos atardeceres ya cumplidos, no más cita obligatoria. |
| Patio de Mensajes y tablillas por ruta | `rooms.veyra_patio_senales.description`, `.day` | **Público**, sin pistas secretas ni archivo de personas. |
| Arel, mensajera Vesperi de ruta, con fundas para recados corrientes y urgentes | `npcs.veyra_arel.name`, `.species`, `.role`, `.description`, `.day`; `topics.mensajes` como carácter público | Su **rol general es canónico**. La transacción singular narrada por el autor de incorporar una nota a Mara a una salida **es una propuesta SOLO NOVELA**. No debe entenderse como nuevo servicio pagado recurrente, tarifa oficial, aceptación permanente por Arel, misión, flag, memoria ni entrega consumada. Requiere cotejo expreso del Editor/Historiador y doble firma VT2+Editorial antes de publicación final. |
| Mara, Sabel, turnos del agua de Valdren | C001 «Una decisión al amanecer» y C002 «Lo que se queda», fuentes **literarias previas** | Mara SÍ es destinataria que Lera conoce previamente, pero no se convierte en cargo/NPC del juego. No se afirma cómo funciona hoy la canaleta ni si Mara o Sabel responderán. |

## 3. Cambio narrativo y límites de lo ocurrido

- **Lera actúa:** acepta segunda prueba con compensación explícita; a partir de una venta de viaje, piensa en su propia responsabilidad con los campos. Decide contactar por escrito a Mara, a quien conoce desde C001 y con la que dejó obligaciones pendientes en C002, **sin pedirle localizar a Dalia**.
- **Texto privado a Mara:** informa «sigo en Vaisgard», no inventa empleo fijo, pregunta si siguen funcionando turnos/si es necesario regresar y **autoriza solo si Dalia pregunta espontáneamente por Lera** decirle que está en Vaisgard y quiere hablar; no exigir la visita ni respuesta. Mara tiene derecho a negarse y decir una verdad incómoda. Este acto crea una **posible comunicación causal** desde relación preexistente, no tercer testigo fortuito.
- **Arel:** Lera da un destinatario con procedencia identificable (Mara/huertos/canaleta, Sabel como referencia). Arel indica que solo **considera tramitarlo como recado ordinario de ruta si hay salida y alguien dispuesto**, indica límites y recibe sellos conforme a **acuerdo concreto de ficción**, sin publicar precios universales. El papel **queda en funda de recados pendientes del patio**, no se certifica que saliera, que Mara lo leyera o que Dalia tuviera noticia. **Punto de riesgo a revisar:** verosimilitud del porte privado y de recibir una nota escrita en envoltorio; de hallar conflicto de canon, ajustar escena sin convertirla en servicio institucional.
- **Carta original para Dalia:** permanece **doblada, seca, completa y sin enviar con Lera**, no intercambiada por nota nueva ni transmitida a Arel. Dalia no sabe por medios confirmados que Lera la busca, no aparece ni responde, no se le adjudica lugar/ocupación/sentimientos.
- **Recorte previo:** sigue **con Nara desde C008**, sin acuse, duplicación ni transmisión confirmada. La nota a Mara **NO es ese recorte**.
- **Autonomía:** Mara puede negarse a contar o transmitir; Dalia puede rechazar lectura, reencuentro o perdón; comerciante puede rehusar empleo. Lera elige en consecuencia sin exigir éxito.
- **Cierre:** vuelve al trabajo acordado de una cesta con pago/condiciones **aún por concretar para este segundo encargo**, sin convertirlo en oficio definitivo. Acción ocurre y su decisión emocional está consumada: una pregunta dirigida a Mara sale de sus manos pero **no se asegura su entrega**. No termina a mitad del encuentro, con marcador de capítulo, ni con reunión fortuita.

## 4. Inventario final, continuidad y costos

| Recurso | Estado verificable al final |
|---|---|
| Carta a Dalia | **Con Lera**, doblada, seca, en chaqueta, sin entregar. |
| Recorte firmado de C008 | **Con Nara**, destino/despacho no comprobados. |
| **Nota nueva a Mara** | En Patio de Mensajes con Arel, **pendiente de salida/aceptación por viajero**, sin acuse; soporte material = **envoltorio reutilizado del alimento ganado en día 3**. |
| Carboncillo | Lo usó para nueva nota y conserva el resto; envuelto en tela de Mara de C002. |
| Taza de asa torcida | En bolsa de Lera, bolsillo exterior. |
| Cantimplora | Tiene **algo de agua** sin fijar porcentaje. No se rellena ni se afirma suministro gratis. |
| Bota/media | Casi secas, frío residual, sin reparación ni equipo nuevo. |
| Hombro/mano | Hombro aún sensible, palma raspada/irritada. Usa mano sana y evita grandes cargas. No curación automática. |
| Sellos/recursos | Saldos no precisados. Gasta sellos en **intento privado de envío**, a costa de otras posibles compras; gana comida exclusivamente por prueba pactada; la noche sin alojamiento le provoca cansancio. |
| Trabajo en mercado | **No contratación** ni puesto fijo. Solo una prueba terminada y un encargo adicional pequeño bajo acuerdo parcial y reversible. |
| Dos atardeceres C009 | **Completados en C010 y C011**. Ninguna tercera espera. |
| Estado Dalia | **Desconocido**: sin aparición, oficio, domicilio, carta escrita real ni voluntad constatada. |

## 5. Entrega para dictamen

- [ ] **Revisor 03 — PR #707:** leer C012 completo SHA `0f0eb9a49b2cee7318f2dc737a7865a6a49c992e` contra C001–C002 y C011; revisar noche 2, prueba día 3 y pago en alimento, credibilidad del papel reusado y del recado privado/porte con Arel, condición de respuesta desde mercado sin residencia fija; priorizar que el vínculo Mara→Dalia es **solo una posibilidad voluntaria**, no garantía. Si hay microcorrecciones dentro de autorización del propietario, documentar nuevo SHA; una objeción estructural debe elevarse al Arquitecto.
- [ ] **Arquitectura Editorial:** comprobar avance real de la búsqueda y cierre orgánico, decidir C013 solo por nueva ficha si procede.
- [ ] **Historiador 02 — PR #706:** únicamente cotejo público de Arel/patio/rol mensajera y la barrera a nuevos servicios canónicos; no hacer atlas.
- [ ] **Arquitectura Editorial + VT2:** doble ratificación antes de merge/edición final, incluidos prólogo, Lera/Dalia/Mara/Iven/Nara/Seli/Arel, envío singular narrativo y discrepancia Saltalodo Edran/Lethra.
- [ ] **Publicador #708:** flujo independiente de EPUB privado hasta C011, accesibilidad Android y arte todavía pendientes de verificación; no confundir C012 entregado con publicación final.

**WIP=1:** C013 no iniciado ni autorizado. PR #705 DRAFT; no se tocaron `vintage-telnet-2/` ni código/arte.

## 6. Microedición del Revisor Integral 03 — 15/10/2026

**Autorización:** permiso directo del propietario para corregir detalles mínimos en la rama del Escritor sin reenviar cada observación. Editor leyó el capítulo completo original `0f0eb9a49b2cee7318f2dc737a7865a6a49c992e` y contrastó `content/regions/veyra.json` vigente en main, así como C002 (Mara/Sabel/canaleta).

- **L01 — concordancia de referente, RESUELTA:** «La dobló con cuidado. La envoltura olía un poco a fruta madura…» → «Dobló el papel con cuidado. La envoltura olía un poco a fruta madura…». El antecedente explícito inmediato es «el papel»; no se altera nota, acción ni trama.
- **Nuevo blob manuscrito:** `da0855503ab1d8365cee15c75c09535a0e30b69d`. **No se modificaron** términos de pago en alimento o sellos, nueva nota a **Mara**, doblez/contenido de carta original a Dalia, recorte con Nara, ni participación de Arel; tampoco se afirma que el recado haya salido o llegado.
- **Dictamen Editor 03:** C012 **APROBADO LITERARIAMENTE SIN CORRECCIONES MENORES PENDIENTES**; queda pendiente ratificación de Arquitectura Editorial. La aceptación de Arel para **intento singular de transmisión ordinaria** y la referencia no garantizada en Mercado son **escena privada solo novela**, sujeta a co-decisión Arquitectura Editorial + Arquitecto VT2 antes de publicación definitiva.
- **C013 NO autorizado** sin una nueva ficha; no se cambió runtime, flags ni secretos.
