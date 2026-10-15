# Dictamen 02 — Prólogo «El mundo que permanece»

**Agente 03:** `revisor-canon-vaisgard-01`, Editor Integral y Revisor de Canon.  
**Proyecto:** *Crónicas de Vaisgard* — Libro I, *El primer camino*.  
**Mesa de trabajo:** [PR #707](https://github.com/vaisork/MatiasGameLab/pull/707); texto original y revisiones del Escritor/Arquitectura Editorial: [#705](https://github.com/vaisork/MatiasGameLab/pull/705); historiografía: [#706](https://github.com/vaisork/MatiasGameLab/pull/706).  
**Fuente revisada:** `VintageTelnet-Libros/prologos/001-el-mundo-que-permanece.md` (**blob `3bffb01a12c37041ecd90f08c1ce6f16ad6f014c`**) y `prologos/NOTA_DE_PROCEDENCIA_Y_REVISION.md` (blob `3ef9aff3fc09cde7fd7a4c2f6e05060bba0bb130`), rama #705.  
**Referencia VT1:** `vintage-telnet/KNOW_THE_WORLD_MENU.md` (blob `36f224e8d7e5d4eea041e2337d7e3ae5736e82ad`).  
**Canon vigente para cotejar:** `vintage-telnet-2/docs/CANON_VIGENTE.md`, `CANON_EXPANSION.md`, `content/regions/{veyra,edran,hoshai,korven,lethra,nhal}.json`; sus fuentes y tensiones documentadas en #706.  
**Dictamen:** **APROBABLE COMO PRÓLOGO CON AJUSTES LITERARIOS, CANÓNICOS Y DE COORDINACIÓN; NO PUBLICAR TODAVÍA.**  
**WIP=1:** relectura C001 ya cerrada. Como C002 está autorizado pero **todavía no entregado en #705**, esta revisión editorial puntual no interviene ni bloquea su redacción. Al entregarse C002, retoma prioridad de dictamen de capítulo.

## 1. Decisión de formato: sí es PRÓLOGO, no epílogo

La rama actual de #705 ya incluye `prologos/001-el-mundo-que-permanece.md` y `prologos/NOTA_DE_PROCEDENCIA_Y_REVISION.md`; se retiraron del diff los nombres anteriores bajo `epilogos/`. Por intención del creador y texto vigente, debe aparecer **antes de «Una decisión al amanecer»**, como umbral del mundo. **La PR #707 y otras notas previas que aún dicen «epílogo» están desactualizadas**; no reponer el archivo viejo ni reservar el texto para después del final.

El vínculo con el capítulo es claro: la última imagen de una viajera con una carta enlaza con la primera frase de C001. No obstante, **protagonista y carta deben seguir siendo descubrimientos del capítulo**: preservar curiosidad sobre quién escribe y a quién va dirigida.

## 2. Valoración literaria y de lectura 10–14 años/adultos

### Aciertos

- Recupera la promesa del documento VT1: **el mundo existe antes que el protagonista** y Vaisgard posee una antigüedad sin explicación definitiva.
- La piedra antigua junto a talleres, puertas, agua y oficios funciona mejor que exponer reinos, profecías o sistemas de juego.
- Las cinco especies se explican con los rasgos físicos actuales de VT2 (no alas en Felaryn/Vesperi, no dragones Dravak, Marevyn respiran aire), sin atribuir facultades numéricas.
- Los cinco poblados aparecen con identidades materiales reconocibles y con interés en la vida cotidiana.
- El cierre «En algún lugar, mientras amanece, una viajera sostiene una carta...» crea continuidad temática y tonal con el primer capítulo; no filtra el contenido de la carta.

### Problema central

**El prólogo parece una pieza de presentación del mundo en cuatro bloques explicativos más que una apertura de novela.** Los segmentos «Cinco maneras de mirar la misma tierra» y «Los hogares más allá de Vaisgard» enumeran cinco especies y cinco pueblos de forma consecutiva. Son útiles como **material de referencia**, pero el lector aún no conoce a Lera ni tiene conflicto dramático que justifique recordar diez nombres propios, topónimos y diferencias. **No convertir el prólogo en enciclopedia ni eliminar arbitrariamente la riqueza del mundo**: el lector debe salir con atmósfera, promesa de aventura y dos o tres anclas claras, pudiendo conocer detalles de especies y asentamientos durante la historia. El creador pidió aprovechar una presentación histórica *amplia y evocadora*, no un resumen mínimo; la edición debe preservar esa intención.

## 3. Hallazgos concretos y prioridades

| ID | Gravedad | Hallazgo | Solicitud al Escritor/Arquitecto Editorial, sin reescribirlo aquí |
|---|---|---|---|
| **P01** | **MEDIA / prioridad literaria** | Dos catálogos sucesivos (cinco especies y cinco pueblos), con reiteración del principio «cada comunidad/especie es distinta». | Integrar nombres gradualmente mediante un **hilo conductor** —un viajero anónimo, sonidos de mercado o mercancías de las rutas—, o acortar los catálogos conservando imágenes distintivas. Aceptable mantener una visión general amplia si el ritmo sigue siendo novelístico. Probar lectura continua **Prólogo → C001**, evitando que C001 repita exposiciones. |
| **P02** | **MEDIA / revisión canónica obligatoria** | «cuando comienzan los recuerdos que las comunidades actuales pueden contar con alguna seguridad, la ciudad ya formaba parte del paisaje». La afirmación sugiere una **cronología comunitaria** de carácter histórico derivada del VT1, cuyo relato fundador no está confirmado como canon cerrado de VT2. | Mantener la **antigüedad y origen desconocido de Vaisgard**, ambos confirmados; cambiar la frase a conocimiento limitado o rumor («los relatos más antiguos que suelen contarse...»), sin convertir en un hecho probado el orden de aparición de ciudad/pueblos. Arquitecto VT2 debe autorizar expresamente cualquier cronología fuerte y dejar constancia de la decisión en #705. |
| **P03** | MEDIA / atención al público | El texto anticipa **nombres de las cinco especies, cinco regiones, cinco pueblos y Vaisgard** antes de anclar en la aventura. | Revisar carga de nombres en voz alta para 10–14 años. Favorecer sensaciones, oficios, formas de viaje; no exigir memorizarlos. Preservar los nombres que sirvan como mapa emocional. |
| **P04** | BAJA / caracterización | «Los humanos ... suelen preguntar cómo repararla»; «Los Dravak ... conocen de cerca la resistencia de los materiales». Son formulaciones **generales de especie** que pueden sonar a temperamento colectivo, pese a la afirmación posterior «Una especie no es un destino». | Reescribir como prácticas **visibles de comunidades o individuos**, no como comportamiento universal de todos los cuerpos de una especie. Conservar rasgos físicos canónicos. |
| **P05** | BAJA / economía de prosa | Las variantes «Ninguna explica...», «Un pueblo no...», «No existe un único modo...» y moralejas semejantes insisten en el mismo principio humanista. | Mantener una formulación potente y **mostrar las otras** mediante contraste de escenas/habitantes. Reducir explicación, no matiz. |
| **P06** | BAJA / transición | El último párrafo presenta «una viajera [con] una carta»; C001 abre con el plegado de esa carta y la espera del amanecer. | **Conservar el puente**: funciona como umbral. No añadir nombre, motivo ni destinataria en el prólogo. Evitar describir el mismo amanecer dos veces. |
| **P07** | MEDIA / coherencia de producción | Notas en PR #707/#706 y documentos heredados refieren «epílogo», aunque el texto y carpeta actuales son de **prólogo**. | Actualizar referencias **sin tocar archivos de otros agentes**; el Director de Arte 04 debe colocarlo antes de C001 en EPUB 3 una vez validado. |

**No hay motivo para reabrir las correcciones ya cerradas de C001 ni paralizar C002 por la existencia del prólogo.** Este dictamen es sobre el texto preliminar, no sobre un EPUB publicado.

## 4. Verificación de canon, secretos y límites de fuente

| Tema | Fuente de control | Resultado |
|---|---|---|
| **Vaisgard antigua y constructores desconocidos** | `docs/CANON_VIGENTE.md`, `CANON_EXPANSION.md`, `content/regions/veyra.json` | **CONFIRMADO**: muros/piedras antiguas en uso, sin atribuir identidad a constructores. No describir fundación definitiva ni galerías subterráneas secretas. |
| **Veyra y cinco regiones principales** | `docs/CANON_VIGENTE.md` y JSON regionales | **CONFIRMADO**: Edran/Valdren, Hoshai/Khariel, Korven/Brumak, Lethra/Narevia, Nhal/Velmora; Veyra/Vaisgard como nodo. El prólogo mantiene identidad observable. |
| **Felaryn** | `docs/CANON_VIGENTE.md` | **COMPATIBLE**: cola, pies digitígrados, equilibrio. La destreza no vuelve infalible al individuo; no vuela. |
| **Dravak** | idem | **COMPATIBLE**: compactos, placas pétreas, vinculación física con vibración por sólidos; **no** dragones ni seres exclusivamente cavernarios. Distinguir sentidos físicos de generalizaciones culturales. |
| **Marevyn** | idem | **COMPATIBLE**: membranas interdigitales, habitan junto al agua, respiran aire. |
| **Vesperi** | idem | **COMPATIBLE**: adaptación a luz escasa, grandes ojos y oído sensible; sin alas ni ecolocalización. |
| **Historia de las poblaciones antiguas** | VT1 `KNOW_THE_WORLD_MENU.md` vs. `docs/CANON_VIGENTE.md` VT2 | **DUDOSA / NO CONFIRMADA**: VT1 establece la secuencia «las cinco comunidades encontraron una ciudad ya existente y salieron de ella». Esa genealogía **no se puede importar automáticamente** a VT2. El prólogo evita la versión explícita, pero deja una implicación temporal que merece suavizar P02. |
| **Secretos DM y galerías** | `POLITICA_DE_SECRETOS.md`, canon VT2 | **Sin revelación directa detectada**: no se incluyen soluciones, creadores de Vaisgard, galerías escondidas, procedencia mágica ni detalles reservados. Seguir validando con Arquitecto VT2. |
| **Arte** | `client/art/`, PR #708 | No hay arte insertado; no autorizarlo en este dictamen. |

**La lectura de un texto histórico VT1 como fuente narrativa no lo convierte en autoridad canónica para VT2**. Los arquitectos deben dejar en #705 propuesta → fuente → tensión → decisión → alcance, incluyendo P02. El Historiador #706 confirma el contraste documental; ninguna contradicción sin resolver permite fusionar el material concernido.

## 5. Dictamen y consumidores

- **Texto del prólogo:** **APROBABLE CON AJUSTES**, especialmente P01 (evitar catálogo puro), P02 (límites de historia fundacional) y P03 (densidad). La presencia de un prólogo es adecuada **si aporta atmósfera y expectativa antes del capítulo**, no si exige memorizar todo Vaisgard.
- **Ubicación editorial:** **ANTES de C001**, no después del último capítulo.
- **Autoridad:** Arquitecto Editorial valida la mejora literaria; Arquitecto VT2 ratifica especies, historia, geografía y fronteras de secretos; el Historiador #706 aporta fuentes.
- **Escritor #705:** conservar voz y procedencia; efectuar sólo ajustes consensuados **sobre su propia rama**, sin reemplazar el legado de VT1 por un texto genérico.
- **Arte/EPUB #708:** prever sección `Prólogo` antes de C001, sin publicarlo como aprobado ni incluir imágenes no autorizadas.
- **Agente 03 #707:** registrar revisión aquí. **No reescribir directamente la rama del Escritor ni fusionar PR**. Al recibir la prosa C002 (todavía ausente), retomar prioridad WIP=1 para su dictamen.

---
*Firma funcional: Agente 03 — Editor Integral y Revisor de Canon · Crónicas de Vaisgard.*
