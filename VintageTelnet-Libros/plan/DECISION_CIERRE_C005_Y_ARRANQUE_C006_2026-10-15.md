# Decisión editorial — C005 corregido y autorización única de C006

**Proyecto:** *Crónicas de Vaisgard*, Libro I: *El primer camino*. **Fecha:** 15 de octubre de 2026.  
**Autoría:** PR [#705](https://github.com/vaisork/MatiasGameLab/pull/705); **Revisor:** PR [#707](https://github.com/vaisork/MatiasGameLab/pull/707); **Historiador:** PR [#706](https://github.com/vaisork/MatiasGameLab/pull/706).  
**Manuscrito de C005 revisado:** `capitulos/005-una-historia-a-medias.md`, blob **`4a4cbd654e6d9032734a218f74ee458f6b7e2100`** (~2,564 palabras); matriz `capitulos/005-continuidad-y-revision.md`, blob **`cfe710034d1fe58c5cc40a1a1956ab9257b88332`**. Dictamen 06 original #707 sobre blob anterior `16d6f5d34d9becb07c08720b60a3eaf7d50765ce`.

## 1. Veredicto del Arquitecto Editorial

**C005 APROBADO LITERARIAMENTE por Arquitectura Editorial, sobre la versión corregida.** Se comprobaron literalmente las tres observaciones del Revisor 03:

- **M01 RESUELTA:** Lera comparte agua del tapón, guarda el último sorbo y al llegar a la casa dice haber **compartido**, no bebido, parte de su reserva. La reposición de la cantimplora es **parcial**.
- **L01 RESUELTA:** desde el terraplén se ve **el tejado**; los muros y la puerta de la Casa del Camino se revelan al concluir la subida.
- **L02 RESUELTA:** se distinguen **el saco intacto** del caminante y **la carga del porteador**. La cuerda insuficiente no se arregla mágicamente.

**Fortalezas:** petición de agua atendida inmediatamente tras C004; ayuda voluntaria con consentimiento y costos reales; rumor de asalto corregido ante testigos; Aren compara fuentes sin completar la misión sobre rueda/carga; Lera llega a Casa del Camino, paga caldo en sellos sin fijar tarifa y sale al norte a `edran_calzada`. No necesita reescritura estructural.

**Limitación obligatoria:** aprobación literaria **NO** constituye co-aprobación de canon, fusión, despliegue o publicación definitiva. La revisión conjunta Arquitectura Editorial + Arquitecto VT2 sigue abierta para prólogo VT1→VT2, personajes y acontecimientos exclusivos de novela (riego, mensaje, caldo/agua, viajeros), Aren y accesos, y divergencia Saltalodo. La auditoría específica C005 del Historiador #706 aún debe registrarse: no declarar que ya se entregó.

## 2. PERMISO FORMAL — ÚNICO BORRADOR DEL CAPÍTULO 006

**Escritor 01 AUTORIZADO A COMENZAR C006, `El camino no espera` (título provisional), en la misma rama/PR #705. WIP=1.** Ningún permiso de C007 hasta siguiente evaluación.

**Ruta exacta verificada en `vintage-telnet-2/content/regions/edran.json`:**
- `edran_casa_camino --norte--> edran_calzada`: C005 termina saliendo de la Casa del Camino hacia esta calzada; C006 debe comenzar **ya fuera**, con pasos sobre piedras gastadas.
- `edran_calzada --norte--> edran_hito_campos` (**Paso hacia Veyra**): poste, losa, arroyo cruzable por tres piedras; la puerta aún **no se ve** desde ese paso.
- `edran_hito_campos --este--> edran_vista_cuenca` es ramal opcional sujeto a cotejo de su contenido real; no usar para inventar grandes distancias.
- `edran_hito_campos --norte--> veyra_puerta_campos`: cruce posible para el final si el ritmo lo pide, pero **no es obligatorio ni requiere inventar que se ve la puerta desde el hito**.

**Tema y conflicto:** la calzada tiene **piedras antiguas pulidas y dos parches claros reparados**; si llueve, los cantos resbalan, la franja de hierba da apoyo pero no espacio para dos carros. El `rain` de calzada/hito es fuente confirmada para **una escena de lluvia eventual**, no predicción ni estado obligatorio del juego. Construir una decisión concreta de seguridad/transporte/tiempo: cómo escoger un apoyo con barro y carga ajena en movimiento, cómo cambiar de plan sin retroceder a una nueva negociación interminable. Riesgo real proporcionado a 10–14 años, no un combate inventado. Mostrar consecuencias por acción, no una cuarta moraleja sobre preguntar/escuchar.

**Continuidad de recursos y personajes:** Lera conserva carta para Dalia **sin enviar**, taza, cantimplora **parcialmente repuesta**, raspadura superficial en palma y hombro dolorido; ha comido caldo pagado con sellos, sin inventar monto ni inmunidad a cansancio. Aren permanece en la Casa del Camino; rumor y nota de rueda **no** están resueltos ni deben viajar como certeza de asalto. Evitar nuevos NPC, saqueo, experiencia, magias, salteadores o Saltalodo sin cotejo de sus áreas y funciones.

**Final deseado:** un cambio concreto y visible en el camino hacia Veyra, quizá desde las tres piedras del hito, o una primera percepción legítima de la ciudad **al pasar hacia la Puerta de los Campos**, no antes. El lector debe sentir expansión del mundo y suspenso de llegada, no que Lera demora artificialmente en las mismas dos salas. Extensión sugerida 2,000–2,700 palabras, guiada por ritmo.

**Entregables:** `VintageTelnet-Libros/capitulos/006-el-camino-no-espera.md` y `006-continuidad-y-revision.md`, con fuente de cada detalle y diferenciación entre hecho abierto / propuesta de novela / reservado.

## 3. Alerta estructural sobre los 15 capítulos

El índice provisional sitúa llegada a Vaisgard en los capítulos 14–15, pero **Edran solo ofrece los dos tramos públicos restantes hasta la puerta** después de C005. NO multiplicar artificialmente jornadas, alargar calzada por ocho capítulos ni inventar rutas para cumplir el índice. Mantener **15 capítulos como objetivo sujeto a ritmo**; preparar una **revisión del arco C007–C015** que distribuya aventuras también dentro de Vaisgard, que tiene salas, habitantes y conflictos públicos propios, y preserve el eje Lera/Dalia. El Historiador ofrece mapa de Veyra verificado y Arquitectura Editorial decide el nuevo recorrido. No cambiar aún C006 por una replanificación extensa.

## 4. Revisión y publicación

- **Editor Integral #707:** confirmar brevemente M01/L01/L02 en el **nuevo** SHA del C005 y dictaminar C006 cuando exista. No reabrir C001–C004.
- **Historiador #706:** cerrar revisión **local C005** de Aren/nota/servicios/calzada y preparar apoyo C006 y mapa real de posibilidades **dentro de Vaisgard**, sin spoilers ni enciclopedia nueva. Someter tensiones a Arquitectura VT2.
- **Director Arte/EPUB #708:** EPUB 3 de **prelectura interna BORRADOR** ya puede incorporar **prólogo + C001–C005** desde las últimas versiones, priorizando QA de índice/texto, EPUBCheck y lectura real; las imágenes individuales siguen sujetas a autorización final de canon/arte. **No subir a Drive ni distribuir como versión final** sin permiso.
- **Arquitectura Editorial + VT2:** decisión conjunta de compatibilidad antes del merge/publicación definitiva.

Sin nuevos agentes ni cambios en runtime, arte original, secretos o infraestructura.
