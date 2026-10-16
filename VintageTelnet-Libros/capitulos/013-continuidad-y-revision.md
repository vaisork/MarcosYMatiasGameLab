# Capítulo 013 — Continuidad, fuentes públicas y revisión

**Proyecto:** *Crónicas de Vaisgard*, Libro I «El primer camino». **Escritor 01:** [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705).  
**Texto C013:** [«Una ruta propia»](013-una-ruta-propia.md), **2,487 palabras** (incluido título). **Git blob vigente de autor** `13e065f556485aa461824363382f685d42c00ed6`.  
**Autorización vinculante:** `../plan/DECISION_CIERRE_C012_Y_AUTORIZACION_C013_2026-10-16.md`. **WIP=1: solo C013, NO C014**.  
**Estado:** BORRADOR ENTREGADO, **pendiente dictamen** Revisor 03 y cierre Arquitectura Editorial. PR draft sin merge/edición final hasta co-decisión canon VT2 + Arquitectura Editorial.  
**Anterior aprobado:** C012 «Lo que todavía podemos elegir» SHA `da0855503ab1d8365cee15c75c09535a0e30b69d` y matriz `76032b59a5758c714b5ae34458d75b0511ed9290`, tras microcorrección L01 del Editor #707.

## 1. Secuencia, geografía y tiempo

- **Inicio día 3, continuación inmediata de C012:** Lera está en `vaisgard_mercado`, **termina la cesta adicional** que aceptó al acabar C012; separa frutas no aptas para viajar y reconoce una pieza dudosa que la vendedora comprueba cortándola. **No había pago pactado por esa segunda cesta**: la vendedora ofrece una porción de alimento como intercambio particular **al terminar**, sin salario automático, cargo o puesto futuro. Lera avisa expresamente a la vendedora que **NO cuente con ella al día siguiente**. No rompe compromiso contractual.
- **Día 3, de mercado hacia puerta:** `vaisgard_mercado.exits.oeste → veyra_barrio_cargas`. En la calle de almacenes de Vaisgard Lera ve la raya pintada para dejar libres puertas, escaleras exteriores y carro con sacos. Un **conductor y dos ayudantes anónimos exclusivos de novela** preparan carro de grano **rumbo a los campos de Edran**; no se les atribuye conocimiento sobre Dalia, servicios universales ni identidad de NPC persistente.
- **Negociación nueva y verificable:** Lera pide acompañarlos **solo hasta donde coincidan sus rutas**; declara intención de regresar a **Valdren**; conductor aclara que **él solo se compromete a los campos, NO a llevarla hasta Valdren**. Ofrece atención al paso, revisar cuerdas y advertir riesgos de calzada a cambio de caminar con el grupo; **no recibe salario, alimento, cama ni transporte gratis**, no presume levantar sacos con mano lesionada. Conductor prueba su prudencia; antes de permitirla caminar, inspecciona amarre corregido bajo su instrucción.
- **Despedida con costo:** Lera vuelve al mercado **desde `veyra_barrio_cargas.exits.este`**, se despide de la vendedora de C007/C010–C012. Acepta renunciar a la posibilidad de más pruebas de trabajo en Vaisgard, no pide que comerciante reciba cartas ni actúe de dirección postal. La correa de bolsa ya gastada sigue con **remiendo provisional de la propia correa acortada y anudada** (sin herramienta nueva ni arreglo gratuito de Seli). No usa otra carta para despedirse.
- **Salida real al final del capítulo:** `vaisgard_mercado --oeste--> veyra_barrio_cargas --oeste--> veyra_puerta_campos --sur--> edran_hito_campos` como **sentido de marcha**. El carro **atraviesa el arco** de Puerta de los Campos, inicia descenso hacia el hito y campos; **el texto acaba durante el descenso**, ANTES de afirmar que el grupo llegó al hito, pasó el arroyo o cruzó calzada. La referencia a las tres piedras/arroyo y dos parches se basa en la experiencia propia de C006, no en una nueva prueba/visita. Queda por confirmar cuánto descansarán y cómo seguirá sola si sus rutas se separan.
- **Reloj:** C013 se desarrolla **todavía en día 3**, tras la mañana de C012 y sin describir el paso de otra noche. El carro parte después de cargar, **con luz restante**; se anticipa primer descanso sin fijar duración/distancia ni cobijo.

**Mapa público comprobado en GitHub main vigente:**
`vintage-telnet-2/content/regions/veyra.json`: `rooms.vaisgard_mercado.exits.oeste=veyra_barrio_cargas`, `rooms.veyra_barrio_cargas.exits.este=vaisgard_mercado`, `rooms.veyra_barrio_cargas.exits.oeste=veyra_puerta_campos`, `rooms.veyra_puerta_campos.exits.sur=edran_hito_campos`.  
`vintage-telnet-2/content/regions/edran.json`: `rooms.edran_hito_campos.exits.norte=veyra_puerta_campos`, `exits.sur=edran_calzada`, `rooms.edran_calzada.exits.norte=edran_hito_campos`. **No** se hace viaje instantáneo a `valdren_plaza`.

## 2. Fuentes y clasificación

| Objeto/lugar/acción | Fuente | Límite |
|---|---|---|
| Mercado, cestas, frutas, mercancía para campo, actividad comercial | `veyra.json > rooms.vaisgard_mercado.description/day/dusk` | **PÚBLICO**, con encargos particulares **solo novela**, sin tarifas o reglas laborales de VT2 |
| Almacenes con escaleras exteriores, carros lentos, raya pintada, ayudantes | `veyra.json > rooms.veyra_barrio_cargas.description/day` | **PÚBLICO**, no nombrar al conductor como NPC ni afirmar rutas/servicios institucionales |
| Puerta de los Campos con carros salientes y acceso a Edran | `veyra.json > rooms.veyra_puerta_campos.description/day/exits.sur` | **PÚBLICO**, sin peaje/misión, sin conocer origen de muros |
| Calzada con dos parches claros, curva e hito; arroyo y tres piedras del paso | `edran.json > rooms.edran_calzada.description/exits`, `rooms.edran_hito_campos.description/exits`; experiencia C006 | **PÚBLICO**; protagonista recuerda hechos anteriores, no llega a puntos distantes en la escena |
| Carro hacia campos y negociación personal | Ambientación pública de carros y cargas; escena inédita de autor | **SOLO NOVELA**; no inventar transportista oficial, viaje directo garantizado a Valdren, premio, puesto, tarifa ni quest |
| Vendedora de fruta de C007–C012 | Personaje anónimo ya establecido en novela | **SOLO NOVELA**, se despide sin aceptar servicio postal ni dar empleo |

## 3. Cambio decisivo y consecuencias para Dalia–Lera

La acción de Lera cambia **sus opciones materiales**, no solo cómo se siente: **abandona Vaisgard físicamente** antes de que la nota a Mara tenga salida/acuse confirmado. Conserva posibilidad de seguir el camino real hasta Valdren y de **hablar personalmente con Mara/Sabel sobre la canaleta y el relevo**, personas conocidas desde C001–C002. Esa opción exige renunciar a permanecer fácilmente localizable en el Mercado y **perder posibles jornadas de ayuda remunerada** allí; el retorno queda condicionado por el trayecto y el conductor no garantiza llevarla al pueblo.

**Causalidad y riesgo emocional:** en C001 Lera le dijo a Dalia «Si tanto quieres marcharte, aquí nadie va a echarte de menos»; C013 asume por primera vez que **Dalia tiene derecho a no ser perseguida** y que Lera puede reparar obligaciones con Mara sin fingir que rastrear a Dalia es lo mismo que respetarla. **No se da por terminado afectivamente el conflicto** ni se inventa reencuentro, paradero o perdón de Dalia. El camino de vuelta abre confrontación real en Valdren en capítulos futuros, **aún no autorizados**, sin fijar qué dirá Mara.

**Tensión dramática pendiente:** si llega alguna contestación a la referencia imprecisa «Mercado de Vaisgard», Lera ya no estará allí; nadie es depositario de sus cartas. La nota a Mara **NO ha salido acreditadamente** del Patio de Mensajes y podría llegar tarde o no llegar. El recorte de Nara puede no volver. Las oportunidades personales que Lera descarta tienen costo; no se da transporte/guía/seguridad por gratitud.

## 4. Inventario y estado final

- **Carta íntima para Dalia:** **CON LERA** bajo la chaqueta, doblada, seca, sin entregar ni duplicar.
- **Nota dirigida a Mara en C012:** **CON AREL / Patio de Mensajes en Vaisgard**, entre ordinarios, **sin salida, portador, recepción ni respuesta confirmada**, sellos ya entregados solo en acuerdo privado de novela. No se le pide a Arel seguimiento.
- **Recorte C008 con nombre Lera:** **CON NARA**, sin entrega, nueva lectura, ni garantía de que esté en Vaisgard.
- **Carboncillo:** permanece con Lera, envuelto en tela de Mara desde C002, no se usa en C013.
- **Taza asa torcida:** permanece en bolsillo exterior de bolsa; no se vende, entrega ni rompe.
- **Cantimplora:** guarda un poco de agua, no se rellena ni cuantifica.
- **Bota/media:** casi secas, interior todavía frío; sin reemplazo; **correa de bolsa** desgastada y anudada en arreglo improvisado, sin reparación permanente ni servicio Seli.
- **Hombro:** sensible bajo correa más corta. **Palma:** raspadura/irritación por fibras C010, no se le exige levantar sacos. Sin sanación mágica.
- **Sellos:** pocos, sin saldo fijo. Gasta en C012 para nota y no recibe sueldo estable. Al acabar una cesta adicional C013, la vendedora ofrece **una porción de alimento** de acuerdo privado sin tarifa oficial, no jornada garantizada. No hay alimento/cama gratuita por acompañar al carro.
- **Compromiso C009:** dos atardeceres ya CUMPLIDOS desde C011. C013 no introduce tercer día obligado en plaza.
- **Destino de Dalia:** **desconocido**. Ni nueva pista ni tercera testigo «afortunada», ni respuesta ni deseo de reconciliación constatado.

## 5. Dictámenes y colaboración pendientes

- [ ] **Editor Integral 03, PR #707:** leer texto C013 completo sobre SHA citado; evaluar si la salida física y el abandono de posible trabajo de Mercado proporcionan suficiente **cambio externo, tensión real y dirección hacia confrontación en Valdren**; comprobar ruta Mercado↔almacenes→Puerta→sentido Edran, duraciones, estado físico e inventario, ausencia de servicios nuevos, despedida de vendedora, destino y riesgos de carta a Mara. Señalar si el pacto con conductor necesita aclaración sin convertirlo en taxi o quest. Puede corregir solo detalles menores conforme permiso del propietario, dejando SHA.
- [ ] **Arquitectura Editorial:** aprobar literariamente o proponer cambio estructural si el giro aleja demasiado el conflicto central Dalia–Lera sin posibilidad de cierre satisfactorio. Preparar C014 **solo después** de dictamen, con evaluación de 15 capítulos PROVISIONALES y mandato de no alargar/cortar artificialmente.
- [ ] **Historiador 02, PR #706:** solo cotejo de **carros de Edran y conectividad Puerta/almacenes/hito** si hay discrepancia; sin atlas/enciclopedia, sin expandir personajes.
- [ ] **Arquitectos Editorial + VT2:** co-decidir la escena de conductor privado y el resto de relatos exclusivos de novela (Mara/Dalia/Iven/Nara/Seli/Arel, cobro Arel C012, prólogo, Saltalodo) antes de merge o publicación final; no reclamar visto bueno tácito.
- [ ] **Publicador 04, PR #708:** EPUB privado ilustrado y accesible, sin esperar este borrador; no afirmar entrega Android/Drive no verificada.

**WIP=1**: C014 **NO INICIADO** y NO AUTORIZADO. PR #705 sigue DRAFT, no se modifica runtime, otros capítulos aprobados, assets o arte.
