# Capítulo 014 — Continuidad, fuentes y revisión

**Libro I:** *Crónicas de Vaisgard — El primer camino*. **Autor:** Escritor 01, [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705).  
**Manuscrito:** [014 — Lo que dejamos pendiente](014-lo-que-dejamos-pendiente.md), **3,058 palabras** incluyendo título; SHA **`d9bae6c9e5629216f65a418c1d65a9ab964fbbcc`** (original `3641c22b5eef533de82c23ee5ad38c7c04a9e11d`, microeditado por Revisor 03).  
**Autorización única:** `../plan/DECISION_CIERRE_C013_Y_AUTORIZACION_C014_2026-10-16.md`.  
**Estado:** **BORRADOR COMPLETO pendiente dictamen de Editor Integral 03 y cierre de Arquitectura Editorial**; **C015 no autorizado ni iniciado**. La aprobación literaria no permite fusionar ni distribuir edición definitiva sin co-decisión VT2+Editorial.  
**Predecesor:** C013 corregido por Editor 03 y aprobado por Arquitectura Editorial, SHA `4b8dd7beb6dc4289470b4301fa8d955d9a69126a`, matriz `1e5e0c251da8abf23fcc80e3cca677e48ac0c309`. No tocar C013.

## 1. Reloj y desplazamientos reales

- **Día 3 — final de la jornada:** continúa exactamente desde C013 tras cruzar arco de `veyra_puerta_campos`, bajando con conductor y dos ayudantes hacia `edran_hito_campos`. Lera **cruza a pie** las tres piedras del arroyo. **No narra ni fija por dónde pasan las ruedas**: el carro se aparta de su campo de visión mientras quienes lo llevan resuelven su tránsito; el grupo se reencuentra ya en el comienzo de `edran_calzada`. La negociación C013 sigue limitada a acompañarse y ayudar en amarres/atención, sin viaje contratado ni pago salarial.
- **Día 3 — más tarde:** `edran_hito_campos → edran_calzada → edran_casa_camino → edran_terraplen → edran_era → edran_reparo` en ruta ordinaria. Cerca de Casa del Camino reconoce la memoria de Aren de C005, **no interactúa con él ni activa notas/misiones**. El conductor comprueba carga, Lera come parte de su **propia ración** y bebe poca agua conservada. Llegan al **reparo** cuando queda poca luz: se sienta y dormita en banco bajo cubierta abierta, sin cama, derecho de alojamiento, cena gratis ni nuevo servicio oficial. Conductor hace pausa por decisión suya, no está obligado a cuidar a Lera.
- **Día 4 — mañana:** desde `edran_reparo → edran_era`, conductor dice que seguirá según entregas, **no promete Valdren**. Se separan. Un ayudante ofrece voluntariamente un **extremo de cuerda que tenía sobrante** y el conductor consiente: Lera lo usa para reforzar **solo provisionalmente** el nudo de la bolsa; no se atribuye a Seli, ninguna reparación profesional o material infinito.
- **Día 4 — avance de regreso:** `edran_era → oeste edran_zanja_antigua → oeste edran_surcos → sur edran_acequia → oeste edran_salida_huertos → oeste valdren_huertos`. Elipsis breves con fatiga, hambre, descanso precario y material en declive. No baja al canal secreto de `edran_zanja_antigua.exits.este`, no usa flags ni encuentra secretos o enemigos. Cruza la acequia por **losa pública**, no inventa puente ni infraestructuras. Llega físicamente a huertos de Valdren con luz suficiente para una conversación y cotejo de la canaleta.
- **Día 4 — tarde, en `valdren_huertos`:** encuentros completos con **Sabel y Mara**, las mismas personas de C001–C003. No se entra a `valdren_plaza` ni se simula haber ido a otro barrio. Termina todavía en huertos junto al árbol y curva de madera, con acuerdo concreto de asistir **a la siguiente revisión de apertura del agua**, sin declarar cuña definitiva ni perdón total.

**Fuentes de conectividad:** `vintage-telnet-2/content/regions/veyra.json > rooms.veyra_puerta_campos.exits.sur=edran_hito_campos`; `content/regions/edran.json > rooms.edran_hito_campos.exits.sur=edran_calzada; rooms.edran_calzada.exits.sur=edran_casa_camino; rooms.edran_casa_camino.exits.sur=edran_terraplen; rooms.edran_terraplen.exits.sur=edran_era; rooms.edran_era.exits.sur=edran_reparo; rooms.edran_reparo.exits.norte=edran_era; rooms.edran_era.exits.oeste=edran_zanja_antigua; rooms.edran_zanja_antigua.exits.oeste=edran_surcos; rooms.edran_surcos.exits.sur=edran_acequia; rooms.edran_acequia.exits.oeste=edran_salida_huertos; rooms.edran_salida_huertos.exits.oeste=valdren_huertos`. La estructura general y los pasos citados proceden de la ficha editorial y del JSON `edran.json` de main. **Nota de revisión:** el `edran_reparo` forma un desvío sencillo desde Era (sur) y el regreso norte a Era al día siguiente; no es un salto.

## 2. Público del videojuego / privado del libro

| Elemento | Fuente | Tratamiento |
|---|---|---|
| Hito de piedra, poste y tres piedras de cruce peatonal | `edran.json > rooms.edran_hito_campos.description/day` | **PÚBLICO**. No se afirma cómo atraviesa el carro ese punto. |
| Calzada con dos parches y cantos lisos, Casa del Camino, Era y Reparo | `edran.json > rooms.edran_calzada.description; rooms.edran_casa_camino.description; rooms.edran_era.description; rooms.edran_reparo.description` | **PÚBLICO**. Reconocimiento de Aren solo memoria C005; no asignarle una acción. |
| Zanja seca, surcos, acequia con losa de paso, postes a Valdren | `edran.json > rooms.edran_zanja_antigua.description; rooms.edran_surcos.description; rooms.edran_acequia.description; rooms.edran_salida_huertos.description` | **PÚBLICO**. No canal oculto, revelaciones ni secretos; evita fijar Saltalodo en escena. |
| Huertos de Valdren, árbol, canaleta de madera y parcelas | `edran.json > rooms.valdren_huertos.description/day`; literatura C001–C003 | **PÚBLICO + continuidad literaria**. Estado de la cuña y turnos durante ausencia es **solo propuesta narrativa de Libro I**, no estado persistente de la simulación, reparación/quest oficial ni daño canónico universal. |
| Mara, Sabel y relevos | C001–C003 literarios, especialmente C002 «Lo que se queda» | **SOLO NOVELA**: no se atribuye a Mara/Sabel conocimiento de Dalia, cargo de juego, oficio extra, domicilio, resultado de NPC ni memoria/flag. |
| Conductor y ayudantes, cuerda sobrante | Ficción episódica C013–C014, sin fichas persistentes | **SOLO NOVELA**: ayuda acordada hasta bifurcación de rutas, regalo pequeño consentido de cuerda sobrante, no transporte oficial, no sueldo/cama/comida gratuita ni contrato. |

## 3. Contraparte humana y consecuencia real

**Problema heredado de C002–C003:** junta/filtración menor en curva de la canaleta, cuña temporal, tablilla de turnos acordados con Mara, Sabel y vecina para relevar a Lera sin imponer a Mara todas las mañanas. En C003 el agua corría, quedaba gota lenta y había un plan con revisiones expresas, no reparación definitiva.

**Hechos nuevos delimitados a la novela:** durante ausencia de Lera una abertura creció con mayor caudal; Mara, Sabel y las otras personas cambiaron cuña y turnos y mantuvieron la mayor parte del sistema trabajando, pero Sabel perdió horas de su parcela cuando otro relevo no pudo continuar (avisó antes), y parte de unas hojas no se recogieron a tiempo. No hay colapso, desastre ni «Valdren salvada por retorno de la heroína». Tienen **su propia adaptación que no depende de Lera**.

**Conversación completa:** Lera pregunta primero qué cambió; Sabel expone límites reales, sin aceptar de antemano que Lera tome sus turnos para siempre. Mara explicita una herida distinta: Lera había planificado la partida antes de hablarle, dejando que su amiga supusiera un mañana compartido. **Mara no concede perdón instantáneo**; reclama que Lera le diga las decisiones difíciles antes de volverlas hechos y escuche si ella puede asumir sus consecuencias. Lera reconoce la omisión sin contar sus penurias en Vaisgard como moneda de reparación.

**Acción externa con costo:** vuelven juntas a hablar con vecina sobre su disponibilidad para relevo en apertura baja. La vecina ofrece únicamente condiciones para mañana que se comprobarán con Sabel; Mara y Lera regresan y **acuerdan verse antes del siguiente turno**, con deber de avisar anticipadamente si Lera no puede. Lera va a contribuir pese a mano irritada/hombro sensible, con el límite de **no levantar cuña ni cargar madera** todavía; no está automáticamente de nuevo encargada de turnos ni sustituye a Sabel. El acuerdo da forma verificable a su responsabilidad sin que la vieja gota desaparezca.

**Dalia sigue importando, con autonomía:** Mara pregunta si la encontró; Lera responde que no. Mara dice que **ella tampoco sabe dónde está**; no le inventa oficio/paradero, no aparece carta ni coincidencia providencial, no asegura que Dalia regrese. Lera señala que todavía lleva **la carta original** sin entregar, reconoce que la búsqueda no le permite perseguirla contra su voluntad. El mensaje C012 a Mara **sigue pendiente CON AREL** y el regreso físico de Lera **puede adelantarse a ese recado**: Mara no lo ha recibido; se menciona como nota posiblemente tardía, no como información ya llegada. Mara **acepta contar lo que considere oportuno únicamente si Dalia le pregunta**, sin promesa de buscarla. No se resuelve reconciliación ni se agota el núcleo Libro I.

**Cierre orgánico:** la escena Mara–Lera tiene principio, diálogo completo, relación redefinida y una acción con tercer consentimiento (vecina); no se interrumpe para guardar abrazo o disputa al C015. Final con gota que aún cae y compromiso mañana verificable. El próximo capítulo, SI se autoriza, debe pagar la elección y definir cómo vive Lera con la carta, no extender una reparación ni descubrir ubicación de Dalia por azar.

## 4. Inventario y pendientes al cierre

- Carta original para Dalia: **en chaqueta de Lera**, seca y doblada, no entregada, ni reescrita. Contenido textual C001–C002 conservado.
- Nota nueva a Mara de C012: **con Arel en Vaisgard**, en funda ordinaria **sin salida ni acuse confirmados**. Mara todavía no la ha leído; Lera solo le dice que existe una nota que podría llegar tarde o nunca. El acuerdo singular de sellos de C012 sigue sujeto a co-canon VT2+Editorial.
- Recorte C008: **con Nara**, destino y recepción desconocidos.
- Carboncillo en tela: con Lera, no usado. Taza de madera con asa torcida: con Lera, aparece en diálogo con Mara sin transferirse.
- Cantimplora: conserva algo de agua, bebe poco en trayecto sin reabastecimiento gratuito. Comida: consume parte de la ración del mercado y guarda algo para inicio de día 4, sin prometer reservas infinitas. Sellos: siguen escasos, sin saldo fijado.
- Bolsa y correa: conserva correa original acortada/anudada C013, **reforzada provisionalmente con extremo de cuerda ofrecido por ayudante** con consentimiento; no arreglo profesional ni paso por Seli.
- Palma: raspadura y rozadura anteriores, fatigada; evita cargar peso o mover cuña. Hombro: sensible tras viaje. Media/bota: casi secas, aún incómodas; no equipo milagroso.
- Dos atardeceres C009: cumplidos en C010–C011, ninguna obligación adicional. Lera ha regresado por decisión propia, no citada ni localizada por nota.

## 5. Dictamen y siguiente autorización

- [ ] **Editor Integral #707:** leer C014 SHA `3641c22b5eef533de82c23ee5ad38c7c04a9e11d` completo; cotejar continuidad C013 vigente, secuencia noche 3 y día 4, cruce peatonal sin mecanismo de carro, separaciones de ruta, estado huerto, conducta de Mara/Sabel y vecina; revisar que el conflicto humano tenga **consecuencia real sin sermón ni reconciliación gratuita** y que Dalia no quede olvidada. Ediciones minúsculas directamente con permiso previo del propietario y SHA; estructura relevante escalar.
- [ ] **Arquitectura Editorial:** validar retorno y confrontación como avance verdadero del arco; decidir ficha C015 **solo tras aprobación** y examinar objetivo 15 capítulos provisional sin corte/estiramiento por cuota.
- [ ] **Historiador #706:** cotejo adicional solo ante duda concreta de `edran_reparo`, salida de ruta a Zanja o roles/secretos. No generar atlas nuevo. Confirmación canon VT2 final no se presume por silencio.
- [ ] **Arquitectura Editorial + Arquitecto VT2:** co-decisión antes de merge/publicación final: prólogo, Dalia/Lera/Mara/Sabel, Iven/Nara, Arel/cobro C012, Seli/capa, Saltalodo y ficción privada de canaleta.
- [ ] **Arte/Publicador #708:** EPUB v03 ilustrado prólogo+C001–C012 existente, su prioridad entrega Android y Drive privada; no bloquear por C014 ni publicar libro como final sin co-canon.

**WIP=1: C015 NO INICIADO / NO AUTORIZADO.** PR #705 sigue DRAFT, no se editó runtime VT2, capítulos previos, arte ni otras PR.

## Registro de corrección menor directa — Editor 03 (16/10/2026)

**L01, cronología del relevo de la canaleta — RESUELTA EN LA RAMA DE AUTORÍA #705.**

- **Original** (`3641c22b5eef533de82c23ee5ad38c7c04a9e11d`): «La primera semana funcionó el relevo. Después la gota empezó a aumentar cuando abríamos más agua».
- **Corregido** (`d9bae6c9e5629216f65a418c1d65a9ab964fbbcc`): «Al principio funcionó el relevo. Después la gota empezó a aumentar cuando abríamos más agua».
- **Fundamento:** C003–C006 narran la salida matinal y llegada a Vaisgard sin una semana intermedia acreditada; C009–C014 establecen una secuencia de **día 0 a día 4** en Vaisgard/regreso. Enunciar que «la primera semana» ya pasó **y luego** surgieron nuevos problemas contradice la cronología contada. «Al principio» conserva la evolución de la falla y reorganización del trabajo sin añadir días ficticios. No cambia turnos, Sabel/Mara, costo real ni resolución de la escena.
- **Acción del Editor:** corrección directa de una frase con autorización del propietario; ninguna alteración estructural y ningún cambio al runtime del juego.
- **Estado de oficio:** C014 aprobado literariamente por Editor 03, **sin correcciones menores pendientes**; falta cierre independiente de Arquitectura Editorial. No iniciar C015 sin autorización WIP=1 ni fusionar/publicar edición definitiva antes de co-decisión VT2+Editorial.
