# Capítulo 006 — Continuidad, fuentes y revisión

**Manuscrito:** [006 — El camino no espera](006-el-camino-no-espera.md).  
**PR de autoría:** [#705](https://github.com/vaisork/MatiasGameLab/pull/705).  
**Agente:** `escritor-aventuras-vaisgard-01`.  
**Estado:** **BORRADOR C006 ENTREGADO**, sujeto a dictamen; no autorizado para publicación/fusión. **WIP=1: C007 no iniciado**.  
**Longitud:** **2,366 palabras** incluida cabecera.  
**Blob de manuscrito:** `4e5efd10a357ef2ca868b279dae619922cb14444`.  
**Permiso formal:** `../plan/DECISION_CIERRE_C005_Y_ARRANQUE_C006_2026-10-15.md` (Arquitecto Editorial).  
**Continuidad previa:** C005 blob `4a4cbd654e6d9032734a218f74ee458f6b7e2100`, **aprobado literariamente por Arquitectura Editorial**, pendiente confirmación puntual de Revisor 03; la novela aún tiene pendientes de co-decisión Arquitecto VT2 + Editorial.

## 1. Hechos literarios y transición

**Apertura:** C005 concluyó con Lera saliendo de la Casa del Camino y avanzando hacia el norte. C006 empieza **sobre los cantos de `edran_calzada`**, no repite conversación con Aren, caldo ni rumores. Sus cosas y estado físico siguen siendo los de C005: carta **terminada y sin entregar a Dalia**, protegida en la chaqueta; taza con asa torcida en bolsillo exterior; **cantimplora parcialmente rellenada** en Casa del Camino; raspadura superficial en una palma y hombro dolorido; ha comido caldo pagado, no llega ilesa ni descansada mágicamente.

En **calzada**, observa cantos viejos redondos y **dos parches claros de reparación**. Comienza una **lluvia eventual exclusiva del relato**, no una predicción ni cambio permanente del clima del juego; la piedra vieja se vuelve resbaladiza, y los parches nuevos dan otro tipo de agarre. Lera resbala **sin caer ni lesionarse** al principio y opta por la franja de hierba fuera de rodadas. Espera fuera del paso mientras un carro anónimo asciende con prudencia. El carro, la lluvia puntual, la reacción del conductor y los gestos son **hechos de novela**, no eventos de juego ni nuevos NPC. La escena no vuelve a resolver una crisis de saco/cuerda ni despliega otra negociación moral.

Lera avanza al norte a **`edran_hito_campos`**, poste y losa que señalan el final de los campos. Las **tres piedras de cruce del arroyo** tienen bordes cubiertos por lluvia pero centro fuera del agua. La puerta **NO es visible desde el hito**, y la narración no la muestra hasta el cruce y avance al norte. En la tercera piedra Lera calcula mal el paso, moja una bota **hasta el tobillo**, evita caer, comprueba que puede moverlo y continúa con media húmeda/ruido de agua al caminar; **no** sufre herida grave ni aprende destrezas mecánicas.

Tras cruzar el arroyo toma la conexión **`edran_hito_campos → veyra_puerta_campos` al norte**. Solo entonces observa **murallas viejas de Vaisgard** y la **Puerta de los Campos**: arco amplio, piedra gastada y pulida, tráfico de carros y gente bajo la lluvia. Viñetas ambientales breves de un carro de grano, una mujer Dravak y dos Felaryn, compatibles con `day` de la sala; sin personajes fijos, misiones, estadísticas de especie ni uso de secretos. La guardiana realiza su labor general de dirigir el paso y no establece norma inédita. Lera **cruza el arco** y queda en el umbral urbano, sin fijar todavía un paso adicional hacia un barrio. No sabe dónde está Dalia: la carta no lleva una dirección que el relato pueda resolver de inmediato.

**Estado final C006:** Lera llegó a la **Puerta de los Campos** de Vaisgard; no ha encontrado a Dalia, no ha entregado/enviado la carta ni contactado con NPC canónicos nuevos. Una bota y media están mojadas; herida superficial de mano y dolor de hombro arrastrados. Cantimplora parcialmente llena, carta aún protegida, taza en bolsa. El rumor de rueda/reparación de C005 continúa sin desenlace; Aren queda en Casa del Camino. C007 podrá iniciar con la vida dentro de la ciudad **solo cuando haya autorización y ruta aprobadas**.

## 2. Matriz de elementos confirmados/abiertos (canon VT2)

| Elemento | Fuente vigente `vintage-telnet-2/` | Clasificación |
|---|---|---|
| Casa del Camino al norte conecta calzada; calzada al sur conecta casa | `content/regions/edran.json > rooms.edran_casa_camino.exits.norte = edran_calzada`; `edran_calzada.exits.sur = edran_casa_camino` | ABIERTA / CONFIRMADA |
| Dos parches claros en cantos gastados, curva con poste todavía oculto | `rooms.edran_calzada.description` | ABIERTA / CONFIRMADA |
| Superficie antigua lisa resbaladiza con lluvia; franja de hierba de apoyo; no espacio para dos carros | `rooms.edran_calzada.rain` | ABIERTA / CONFIRMADA (riesgo general; lluvia de esta escena es ficción) |
| Carros en calzada reducen el paso en reparaciones | `rooms.edran_calzada.day` | ABIERTA / CONFIRMADA |
| Calzada al norte llega al paso del hito | `rooms.edran_calzada.exits.norte = edran_hito_campos` | ABIERTA / CONFIRMADA |
| Poste y losa al final de Edran; tres piedras sobre arroyo; puerta invisible desde hito | `rooms.edran_hito_campos.description`, `.look.norte` | ABIERTA / CONFIRMADA |
| Llueve: bordes de piedras cubiertos, centros fuera; poste en suelo alto | `rooms.edran_hito_campos.rain` | ABIERTA / CONFIRMADA |
| Hito al norte conecta Puerta de los Campos | `rooms.edran_hito_campos.exits.norte = veyra_puerta_campos` | ABIERTA / CONFIRMADA |
| Muralla y arco de Puerta de los Campos, piedra gastada por ruedas, olor a carga/ruido urbano; guardiana que observa cargas | `content/regions/veyra.json > rooms.veyra_puerta_campos.description`, `.day`, `.rain` | ABIERTA / CONFIRMADA |
| Viñeta ambiental de un carro de grano, Dravak y Felaryn en puerta | `rooms.veyra_puerta_campos.day` | ABIERTA / CONFIRMADA, uso narrativo no garantiza permanencia de figuras |

## 3. Exclusivo de novela y límites de canon

| Aporte de la prosa | Clasificación y límite |
|---|---|
| Lluvia comienza cuando Lera asciende por calzada y continúa hasta puerta | COMPATIBLE / EVENTO PRIVADO. `rain` declara ambientación compatible, **no fija clima real/meteorología persistente**. |
| Deslizamiento leve en canto y bota mojada al cruzar piedras | COMPATIBLE / AVENTURA PRIVADA: consecuencias en ropa/recursos, sin impacto gameplay ni evento programado. |
| Carro de calzada que pasa con gestos de conductor anónimo | COMPATIBLE / FICCIÓN LOCAL; no el carro del rumor de C005, ni misión, ni NPC permanente. |
| Protección de carta frente a lluvia | CONTINUIDAD EXCLUSIVA DEL LIBRO. Se conserva la carta con renglones de carboncillo sin declarar que la lluvia la haya borrado. |
| Paso bajo el arco con señal breve de guardiana y observación de ciudad viva | COMPATIBLE / VIDA COTIDIANA. No inventar peaje, permiso obligatorio ni ley de acceso, cargo oficial con nombre o escena posterior fija de guardia. |
| No se revela quién fundó muros ni ciudad | **RESERVADO/NO FUNDADO**: el texto sólo observa antigüedad y tamaño, sin adjudicar autoría o cronología a ningún pueblo o especie. |
| Sin Saltalodo, salteadores, mazmorras, secretos ni recompensas | Restricción vigente conforme a Historiador #706 y co-revisión aún abierta. |

## 4. Continuidad dramática y punto de partida del próximo capítulo

- **Progreso geográfico real:** `edran_casa_camino → edran_calzada → edran_hito_campos → veyra_puerta_campos`. **Edran queda atrás**, y la puerta ya no está al margen de una promesa vaga. No se atribuye duración ni kilómetros.
- **Progreso temático:** nuevo riesgo físico vinculado con lluvia y pasos de arroyo, distinto de la negociación del saco de C005; la decisión no detiene la trama con otra reflexión moral.
- **Lera y Dalia:** Dalia no aparece ni conoce la llegada. Lera conserva intención de hablar cara a cara; entrada a Vaisgard no equivale a encontrar a Dalia.
- **Posición al cierre:** Lera acaba de cruzar el arco, **sin describir aún como alcanzado un barrio o plaza siguiente**. Continuación debe cotejar `veyra_puerta_campos.exits` reales y evitar atajos a la Plaza de las Cinco Rutas.
- **Cadencia 15 capítulos:** Arquitectura Editorial ha advertido que el plan de llegada en C014–015 es obsoleto; **no alargar Edran** y aguardar decisión para reubicar las siguientes aventuras en Veyra/Vaisgard. El escritor no modifica índice general por cuenta propia.

## 5. Arte candidato — sujeto a Director de Arte #708

1. Calzada de piedra mojada con dos parches claros, sin afirmar que exista ya arte de lluvia exacto. Buscar en manifiesto y catálogo del juego un asset aprobado para `edran_calzada`.
2. Puerta de los Campos con muro de Vaisgard y tránsito cotidiano bajo lluvia. Preferir obra original del juego para `veyra_puerta_campos`; validar nombre del fichero real/manifiesto antes de seleccionarlo. No generar arte ni revelar ciudad antes de la escena del cruce.

## 6. Revisión pendiente

- [ ] **Revisor Integral 03 — PR #707:** dictaminar prosa **real de C006**, geografía y orden de visibilidad, tiempo y lluvia, seguridad infantil, naturalidad de bota mojada y cierre urbano sin duplicar aprendizajes.
- [ ] **Arquitecto Editorial:** evaluar ritmo de llegada a Vaisgard, nuevo destino de C007–C015 y aprobación literaria. Mantener C007 bloqueado hasta decisión formal.
- [ ] **Historiador 02 — PR #706:** cotejo puntual de ruta y escenas públicas de Veyra; no declarar aprobada ninguna propuesta de cambio de índice antes de decisión editorial.
- [ ] **Arquitecto VT2 + Editorial:** co-decisión documentada sobre hechos privados, escena climática y puerta, junto con pendiente prólogo VT1→VT2, personajes, economía y Saltalodo. Ninguna contradicción sin resolver puede fusionarse.
- [ ] **Director de Arte 04:** EPUB de prelectura provisional, sólo después de verificación de fuente/texto y sin publicación definitiva.

**Límites de edición respetados:** solo archivos Markdown en `VintageTelnet-Libros/`; ningún cambio a `vintage-telnet-2/`, arte, NPC, comandos, flags, Raspberry, Drive u otros proyectos.
