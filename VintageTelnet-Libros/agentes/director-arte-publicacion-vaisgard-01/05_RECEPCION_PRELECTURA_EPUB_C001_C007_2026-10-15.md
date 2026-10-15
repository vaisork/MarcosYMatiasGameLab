# Recepción EPUB 3 — prólogo y capítulos 001–007
**Responsable:** Director de Arte y Publicación Editorial 04, PR #708.  
**Fecha:** 2026-10-15 (México).  
**Estado:** **PRELECTURA INTERNA / BORRADOR / NO CANON FINAL**.  
**Formato principal:** EPUB 3 reajustable, texto completo.  
**Archivo:** [`CV_L1_PRELECTURA_BORRADOR_PR705_PROLOGO_C001_C007.epub`](prelecturas/CV_L1_PRELECTURA_BORRADOR_PR705_PROLOGO_C001_C007.epub).  
**Git blob del EPUB:** `1eddba4e64dc05311d93ea18188d4c84c6b3677c`.  
**Tamaño:** 126,397 bytes.  
**Fuente única:** [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705) (`editorial/cronicas-vaisgard-agente-01-voz`). Manuscritos leídos íntegros desde GitHub.  

## Contenido y procedencia congelados

| Orden | Sección | Fuente en #705 | Git blob SHA de fuente | Párrafos exportados |
|---:|---|---|---|---:|
| 1 | Prólogo — El mundo que permanece | `VintageTelnet-Libros/prologos/001-el-mundo-que-permanece.md` | `fb56d488e7acafad428e673d80039e88ba28b38c` | 33 |
| 2 | Capítulo 1 — Una decisión al amanecer | `VintageTelnet-Libros/capitulos/001-una-decision-al-amanecer.md` | `d445b8feedb4d4013d3cda9fa01166ab634fb981` | 211 |
| 3 | Capítulo 2 — Lo que se queda | `VintageTelnet-Libros/capitulos/002-lo-que-se-queda.md` | `0d24df1220cac11cfab1d7de4e8f6c4776f19a98` | 195 |
| 4 | Capítulo 3 — Más allá de las cercas | `VintageTelnet-Libros/capitulos/003-mas-alla-de-las-cercas.md` | `9a4eb8305b6996649c4889620868c7aefd719611` | 118 |
| 5 | Capítulo 4 — El lenguaje de las huellas | `VintageTelnet-Libros/capitulos/004-el-lenguaje-de-las-huellas.md` | `fe2ef09ca3c363e324ebf2228ad896a4f349b27c` | 140 |
| 6 | Capítulo 5 — Una historia a medias | `VintageTelnet-Libros/capitulos/005-una-historia-a-medias.md` | `4a4cbd654e6d9032734a218f74ee458f6b7e2100` | 148 |
| 7 | Capítulo 6 — El camino no espera | `VintageTelnet-Libros/capitulos/006-el-camino-no-espera.md` | `27365396a724f92556a8bf2050208bd209f2e6fa` | 112 |
| 8 | Capítulo 7 — Entre cargas y nombres | `VintageTelnet-Libros/capitulos/007-entre-cargas-y-nombres.md` | `6aca35d8ca12704ce189e70349d8740c6c4b3f61` | 146 |

**Orden:** Portadilla → Prólogo → C001 → C002 → C003 → C004 → C005 → C006 → C007.  
**Notas editoriales:** se omitió exclusivamente el bloque de cuatro líneas `>` inicial del prólogo (son notas administrativas). No se suprimieron secciones narrativas de ningún capítulo. No se agregó, resumió ni reescribió narrativa. Encabezados y énfasis Markdown transformados a XHTML. La portadilla administrativa indica claramente obra parcial, estado BORRADOR y limitaciones.

## QA realmente ejecutado (15/10/2026)

- [x] Coincidencia exacta de ocho SHA de fuente esperados con blobs de #705.
- [x] Se comprobaron ocho capítulos/secciones en el renderizador y la presencia de sus títulos y párrafos; siete capítulos completos, sin archivos de continuidad.
- [x] Estructura ZIP OCF: `mimetype` primero, método STORE, valor `application/epub+zip`, contenedor, paquete OPF, manifiesto, spine, XHTML y navegación EPUB.
- [x] Comprobación programática de las 14 entradas ZIP (firmas, longitudes, CRC32) y del directorio central.
- [x] El índice de navegación contiene Prólogo y capítulos C001–C007 en orden; idioma `es`, metadatos e identificador incluidos.
- [x] EPUB únicamente tipográfico: sin WebP ni ilustraciones no aprobadas. No se modifica arte original.
- [ ] **EPUBCheck** (no disponible en el entorno con acceso al repositorio; pendiente ejecución externa).
- [ ] **Prueba de apertura real en lector Android/tablet/escritorio** (no ejecutada; no afirmar compatibilidad comprobada en esos lectores).
- [ ] Revisión visual por el propietario de la versión de lectura.
- [ ] Co-aprobación de canon **Arquitectura Editorial + Arquitecto VT2**, y permisos editoriales de distribución final.

## Estado editorial y límites
- C001–C006 tienen aprobación literaria; C007 tuvo dictamen favorable del Revisor 03 con L01 menor aplicada en `6aca35d8ca12704ce189e70349d8740c6c4b3f61`, pendiente cotejo final y cierre del Arquitecto Editorial.
- El prólogo conserva validación histórica/cronológica pendiente de co-decisión con Arquitectura VT2.
- **No equivale a Libro I completo:** faltan capítulos posteriores, previstos de forma provisional hasta C015.
- El EPUB nuevo se aloja en rama **borrador** de PR #708; **no se sube a Google Drive, no se fusiona PR, no se entrega como edición canónica definitiva** hasta autorización correspondiente.
- La edición ilustrada posterior requerirá permisos por recurso VT2; hay piloto de arte previo P+C001+C002 en esta PR, no se declara ilustrada la nueva versión.

## Siguiente entrega
Revisar compatibilidad y contenido en lector real, resolver firmas pendientes y preparar nueva maquetación ilustrada antes de difusión aprobada.

---

## Adenda de pendientes — 15/10/2026, posterior al encargo Drive

**Corrección del estado editorial:** Arquitectura Editorial ratificó C007 como **aprobado literariamente** sobre blob `6aca35d8ca12704ce189e70349d8740c6c4b3f61` (PR #705, comentario 20:23 UTC). En esta edición ya se empleó ese SHA correcto. El revisor #707 aún debe emitir su adenda formal puntual; no equivale a co-ratificación VT2.

**Nueva autorización de distribución limitada:** Los comentarios de Arquitectura Editorial en #708 de las 20:32–20:33 UTC aclararon que el propietario **sí permite almacenar el EPUB como prelectura BORRADOR PRIVADA en su Google Drive personal**. Esta autorización reemplaza la prohibición anterior de toda subida a Drive, pero no habilita edición final, enlace público, fusión o difusión externa.

**Destino priorizado por la instrucción más reciente:**
[Crónicas de Vaisgard — Prelecturas EPUB](https://drive.google.com/drive/folders/1GoGePI5CDOJ2nZppO8fOOgDJX6KrO5UD) · ID `1GoGePI5CDOJ2nZppO8fOOgDJX6KrO5UD` · cuenta conectada `vaisork@gmail.com`. Se verificó mediante Drive conectado que la carpeta existe y está **vacía**. También existe otra carpeta homónima vacía, ID `1bLao4n77Ymjffa0wonl236vKGHFbcBpy`; evitar crear una tercera, mover o eliminar ninguna sin instrucción.

**Transferencia aún PENDIENTE / no fingir carga:** Se confirmó el archivo EPUB en GitHub, Git blob `1eddba4e64dc05311d93ea18188d4c84c6b3677c` y tamaño **126,397 bytes**. Sin embargo, el conector GitHub ofrece contenido UTF-8 y no entregó bytes de un EPUB binario (`fetch_file` con `base64` devolvió contenido vacío; `fetch_blob` para binarios produjo error Unicode). El conector Drive solo permite `upload_file` desde un **file_uri** autorizado, nunca una URL arbitraria ni base64 inventado. No se obtuvo referencia binaria compatible ni se transfirió el archivo; el acceso a red externa del contenedor no resolvió el URL RAW. **No existe enlace de archivo EPUB en Drive para publicar todavía.** La carpeta seleccionada seguirá vacía hasta una transferencia real con verificación del archivo devuelto.

**Alternativa manual segura para lectura privada:** abrir el [EPUB GitHub de #708](https://github.com/vaisork/MatiasGameLab/blob/editorial/cronicas-vaisgard-agente-04-preproduccion/VintageTelnet-Libros/agentes/director-arte-publicacion-vaisgard-01/prelecturas/CV_L1_PRELECTURA_BORRADOR_PR705_PROLOGO_C001_C007.epub), usar `Download raw`, entrar en la carpeta Drive anterior con la cuenta personal y usar `Nuevo → Subir archivo`. Tras subir, comprobar nombre, extensión `.epub`, tamaño **126,397 bytes** y que abra en lector EPUB. Este procedimiento requiere operación humana; **no se afirma ejecutado**.

**Capítulo posterior:** C008 `008-la-plaza-de-las-cinco-rutas.md`, Git blob `a2b9265935341c55638946d963d832937bd2e865`, aparece en #705, **entregado como borrador para dictamen**, por lo que **no** debe alterar la prelectura congelada C001–C007. Solo preparar versión 02 al recibir aprobación literaria y encargo específico; mantener WIP=1.

**Pendientes técnicos reales:** EPUBCheck no ejecutado; lector Android/tablet/escritorio no probado; selección ilustrada VT2 sin autorización final individual. Ninguno debe marcarse como aprobado antes de aportar evidencia.

**Pendientes de gobernanza:** co-decisión Arquitectura Editorial + Arquitecto VT2 sobre prólogo, personajes exclusivos de novela, secreto/canon y finalización de obra; permiso de publicación definitiva sin otorgar. Las PR siguen borrador.
