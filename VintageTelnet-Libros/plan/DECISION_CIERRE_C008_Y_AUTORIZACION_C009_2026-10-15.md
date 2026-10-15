# Arquitectura Editorial — C008 cerrado literariamente y C009 autorizado

**Libro:** *Crónicas de Vaisgard*, Libro I — *El primer camino*.  
**Fecha:** 15 de octubre de 2026.  
**Autoría:** [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705). **Revisión integral:** [PR #707 — Dictamen 09](https://github.com/vaisork/MatiasGameLab/blob/editorial/revisor-canon-vaisgard-01-dictamen-705/VintageTelnet-Libros/agentes/revisor-canon-vaisgard-01/DICTAMEN_09_CAPITULO_008_LA_PLAZA_DE_LAS_CINCO_RUTAS.md). **Documentación:** [PR #706](https://github.com/vaisork/MatiasGameLab/pull/706). **Publicación:** [PR #708](https://github.com/vaisork/MatiasGameLab/pull/708).

## 1. C008 — cierre literario

**APROBADO LITERARIAMENTE POR ARQUITECTURA EDITORIAL** el Capítulo 8 «La plaza de las cinco rutas», después de leer la versión exacta:
- `capitulos/008-la-plaza-de-las-cinco-rutas.md`: Git blob **`e3ee67a0399b3737a4b1992abdd1089b9d46bbee`**, aproximadamente 2,659 palabras.
- `capitulos/008-continuidad-y-revision.md`: blob **`2aeb7c9d8d3b54227db8044eb8fa2a543c18dfa4`**.

El Editor Integral 03 ya aplicó **con autorización del propietario** dos microcorrecciones directamente sobre la rama del Escritor, documentadas en Dictamen 09 y verificadas en el archivo vigente: L01, agua no cuantificada a «medio llenar»; L02, carta ya revisada con carboncillo en Valdren. **No queda corrección editorial menor pendiente ni se requiere otro envío al Escritor.**

**Funciona el capítulo** porque la acción cambia: Lera pasa de tres negativas a dos testimonios parciales, distingue información de certeza y deja a Nara un recorte con su nombre sin desprenderse de la carta íntima a Dalia. La ruta `vaisgard_mercado → veyra_plaza_rutas → veyra_patio_porte → veyra_plaza_rutas` está conectada en `vintage-telnet-2/content/regions/veyra.json`. Ni Iven ni Nara son NPC oficiales.

**Puntos de vigilancia literaria, no causas para reescribir:**
1. Coincidencia de **dos testigos útiles en una misma plaza**: razonable como nodo de rutas, pero **prohibir un tercer testigo afortunado inmediato** en C009.
2. El **recorte con nombre** se creó como aporte de novela en C008; ahora **lo conserva Nara**. No inventar que llegó a Dalia ni que activa una misión del juego; evitar que de pronto existan infinitos recortes de papel.
3. La **pregunta de Dalia sobre enviar carta** no implica prueba de destinatario, escritura efectiva, residencia en Vaisgard ni reciprocidad de sentimientos. En ficción, todo sigue incierto.
4. Personas Iven/Nara y los nuevos recuerdos de Dalia **siguen pendientes de co-decisión Arquitectura Editorial + Arquitecto VT2 con alcance exclusivamente novelístico** antes de fusionar o publicar definitivamente.

## 2. AUTORIZACIÓN EXPRESA: SOLO C009, WIP=1

**El Escritor 01 puede redactar únicamente el C009**, título provisional **«El aviso y la respuesta»**, en su **misma PR #705**. Puede ajustar título si la prosa lo justifica. **NO** C010 hasta próxima decisión.

**Entregables obligatorios:**
- `VintageTelnet-Libros/capitulos/009-el-aviso-y-la-respuesta.md`
- `VintageTelnet-Libros/capitulos/009-continuidad-y-revision.md`

**Geografía y arranque:** C008 termina con Lera en `veyra_plaza_rutas`, caminando **hacia** el alero oriental sin haber entrado en `veyra_patio_senales`. C009 debe empezar por el cruce **este → `veyra_patio_senales`**, no suponer ya una visita anterior. Allí hay tablillas organizadas por ruta de origen, un banco, notas y un armazón; la **mensajera Arel, Vesperi**, es NPC canónico `veyra_arel` con rol público de `mensajera de ruta`. Su carácter se refleja en escuchar procedencias completas antes de repetir un recado; puede describirse su servicio y actividad **PÚBLICA**, pero **no** asumir memoria, recompensa o acción condicionada a flags. Al este existe `veyra_archivo_cargas` (archivo de **cargas**, no registro de residentes): entrar sólo si una necesidad dramática legítima lo justifica, sin deducir que allí constan Dalia ni secretos.

**Motor del capítulo:** Lera busca entender **cómo podría recibir una respuesta o hacer llegar una noticia responsable**, ahora que Nara lleva su nombre y ella no sabe el paradero de Dalia. La ficción debe mostrar un conflicto **humano nuevo con costo**, preferiblemente sobre cuánto revelar de sí, límites de pedir a alguien que gestione un recado sin destino y el tiempo/compromiso que deja de invertir en otra posibilidad. **Ninguna mensajera puede garantizar localizar a Dalia**. Arel no debe convertirse en oficina universal de búsqueda ni tomar la carta privada de Lera por obligación; si se representa un acuerdo personal, delimitarlo como **escena literaria propuesta**, no regla nueva ni quest completada.

Evitar repetir (a) tres negativas consecutivas de C007, (b) el tema de carga robada/rumor infundado de C005, (c) la caída/lluvia de C006, (d) la pista conveniente de dos viajeros que «recuerdan perfectamente» a Dalia como en C008 y (e) un paseo turístico por todos los rincones de Veyra. **Debe ocurrir algo que cambie de verdad la intención o recursos de Lera**; una elección con consecuencia y una tensión ligada a su amistad rota son más importantes que recitar el sistema de mensajes. No revelar ni explotar temas condicionados de Arel: `hueco`, `talla`, `decirlo una sola vez`, memorias de flags o misiones; tampoco secretos o discos de Nera.

**Estado continuo de Lera:** carta para Dalia sin enviar, seca, en la chaqueta; carboncillo guardado; cantimplora conserva **algo de agua** (no una proporción inventada); taza con asa torcida, palma superficialmente raspada, hombro sensible, bota/media secándose después del arroyo. **El recorte con su nombre está en manos de Nara**, sin acuse de entrega. Iven sabe una memoria de Valdren, Nara sabe solo parte del trayecto; ninguna identificó paradero o destinatario de carta de Dalia. La lluvia ha cesado, no hay obligación de iniciar otra tormenta.

**Cierre:** nueva decisión o consecuencia que impulse el arco Lera–Dalia hacia un conflicto urbano distinto, no sólo «volveré a preguntar». La escena puede preparar un problema más material en C010, pero no anticipar una respuesta milagrosa de Dalia o declarar que el mensaje de Nara ya viajó. Conservar público 10–14 y adultos; calidad de novela, no manual del juego. Extensión orientativa ~2,000–2,700 palabras sólo si las escenas lo ameritan.

## 3. Coordinación

- **Escritor #705:** único borrador C009 autorizado, con matriz; no abrir C010.
- **Editor #707:** C008 cerrado sin ajustes pendientes; revisar íntegro C009 cuando se entregue, focalizado en causalidad, personajes, prosa y límites de Arel/Nera. Continuar permiso específico del propietario para microcorrecciones directamente sobre rama #705, **solo cambios menores documentados**, nunca nuevos hechos de canon o una reescritura.
- **Historiador #706:** consulta localizada sólo si se introducen nuevos hechos sobre Arel, Veyra o Dalia; su Nota 05 ya describe mapa. Solicitar **pronunciamiento conjunto con Arquitecto VT2** sobre nuevos testigos Iven/Nara, recuerdos literarios y contradicción Saltalodo.
- **Publicador #708:** existe EPUB 3 interno **prólogo + C001–C007** ya generado (126,397 bytes), **pero el propietario no consigue descargar fácilmente archivos raw desde la app GitHub** y sigue sin copia en Drive. Preparar **prelectura versión 02 hasta C008** desde `e3ee67a...`, preservando EPUB C001–C007 como histórico; priorizar **ENTREGA ACCESIBLE Y PRIVADA** para lectura en Android, idealmente archivo real en la carpeta Drive elegida, no pequeños PDFs. Si el conector de su entorno no puede transferir bytes `GitHub→Drive`, documentar una ruta operativa de exportación usando computadora autenticada (Ubuntu/Chrome o GitHub CLI de confianza), o facilitar descarga binaria por navegador; **jamás declarar copia en Drive sin verificación real**. No bloquear C009 ni distribución interna de lectura por ilustraciones aún no aprobadas.
- **Arquitectos Editorial y VT2:** ratificar los hechos compatibles de novela y secretos preservados; contradicción sin resolver bloquea **fusión y edición final**, no escritura ni prelectura privada autorizada.

**Estado general:** ocho capítulos aprobados literariamente, noveno autorizado como único WIP del Escritor; edición final/canon sin fusionar. El objetivo provisional del propietario sigue siendo 15 capítulos + prólogo, sujeto a evaluar ritmo, no reducir unilateralmente.
