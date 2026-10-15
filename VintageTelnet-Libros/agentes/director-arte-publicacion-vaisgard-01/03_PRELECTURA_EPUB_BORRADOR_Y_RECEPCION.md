# Recepción editorial y prelectura EPUB 3 — 14/15 octubre 2026

**Responsable:** Agente 04 — Director de Arte y Publicación Editorial.  
**PR propia:** [#708](https://github.com/vaisork/MatiasGameLab/pull/708) · **fuente narrativa:** [#705](https://github.com/vaisork/MatiasGameLab/pull/705) · **revisión:** [#707](https://github.com/vaisork/MatiasGameLab/pull/707) · **historiador:** [#706](https://github.com/vaisork/MatiasGameLab/pull/706).

## Autorización y alcance
La decisión `VintageTelnet-Libros/plan/DECISION_EDITORIAL_C002_Y_AUTORIZACION_C003_2026-10-14.md` de #705 autoriza al Agente 04 a **actualizar una prelectura provisional EPUB 3** con `Prólogo → C001 → C002`, siempre que el lector vea claramente **BORRADOR**, sin anunciar aprobación de canon ni utilizar arte no autorizado. La entrada de C003 quedará para una revisión posterior.

Se ha creado **únicamente en la rama de #708**, NO en Drive ni como versión final:

[`prelecturas/CV_L1_PRELECTURA_BORRADOR_PR705_P_C001_C002.epub`](prelecturas/CV_L1_PRELECTURA_BORRADOR_PR705_P_C001_C002.epub)

Git blob SHA del EPUB: `0cf5065daec9af803bed2accac46833765f11e26`, **49,458 bytes**. El producto se registra como `REVISION_INTERNA_NO_PUBLICADA`.

## Contenido congelado para esta prelectura
| Orden | Sección | Archivo de fuente (PR #705) | Git blob SHA | Estado |
|---:|---|---|---|---|
| 0 | Portadilla de revisión | Texto técnico de edición | — | Identifica BORRADOR, sin portada artística |
| 1 | Prólogo: *El mundo que permanece* | `prologos/001-el-mundo-que-permanece.md` | `fb56d488e7acafad428e673d80039e88ba28b38c` | Corrección literaria provisional; revisión 03 y co-validación VT2 pendientes |
| 2 | Capítulo 1: *Una decisión al amanecer* | `capitulos/001-una-decision-al-amanecer.md` | `d445b8feedb4d4013d3cda9fa01166ab634fb981` | Aprobación literaria, co-decisión canónica pendiente |
| 3 | Capítulo 2: *Lo que se queda* | `capitulos/002-lo-que-se-queda.md` | `0d24df1220cac11cfab1d7de4e8f6c4776f19a98` | Correcciones M01/M02 integradas; relectura 03/canon pendiente |

**Tratamiento del texto:** se trasladó narrativa del archivo fuente, preservando párrafos, encabezados y resaltados sencillos; se retiró **únicamente** la cabecera administrativa `>` inicial del prólogo (instrucción editorial en #705), para que el lector no vea notas técnicas como prosa. La portadilla y las etiquetas BORRADOR son material técnico externo a la narración, no una reescritura. No se insertaron anuncios, capítulos nuevos, personajes ni líneas narrativas propias.

## Especificación técnica del EPUB
- ZIP EPUB 3 sin compresión interna (compatible con estructura estándar): `mimetype` como primer archivo; `META-INF/container.xml`; paquete `OEBPS/package.opf`; navegación `OEBPS/nav.xhtml`, `OEBPS/styles.css`; tres documentos XHTML de prosa más portadilla.
- Lectura de ajuste fluido, no fixed-layout; índice con enlaces, párrafos en XHTML, estilos relativos, idioma `es`; metadatos de borrador, sin atribución de autoría inventada.
- Portada tipográfica simple **SIN ilustraciones**. Faltan los permisos individuales de arte; los WebP originales no se tocan.
- **Pendiente:** comprobación independiente mediante EPUBCheck y apertura humana en lector Android/tablet/escritorio. La estructura interna se generó y el blob binario se confirmó presente en GitHub; **no declaramos un EPUB certificado ni publicado**.

## Próximas recepciones y arte candidato por escena
| Pieza | Estado de manuscrito | Recursos físicos concretos en VT2 | Qué falta |
|---|---|---|---|
| Prólogo | Corregido, visto bueno canon pendiente | `places/vaisgard-anime-v1.webp`; imágenes genéricas de especies `species/*.webp` | Evitar convertir las especies genéricas en retratos de protagonistas. Validar imagen y permiso por escena |
| C001 | Literariamente aprobado, canon no cerrado | `places/valdren-anime-v1.webp` (mapeado a `valdren_plaza`); `places/valdren_huertos-anime-v1.webp` | Autorizar selección, no representar con imagen eventos inventados de la canaleta |
| C002 | Correcciones de agua/tablilla integradas, espera cotejo | `places/valdren_pozo-anime-v1.webp` (ID `valdren_pozo`); `places/valdren_huertos-anime-v1.webp` | Comprobar aprobación por archivo; no ilustrar literalmente a Sabel/Lera si la imagen es sólo ambiente |
| C003 | Borrador recién entregado, **fuera de este EPUB** | `places/edran_salida_huertos-anime-v1.webp`, `places/edran_acequia-anime-v1.webp`, `places/edran_surcos-anime-v1.webp`, `bestiary/espinajo-rastrojo-anime-v1.webp` | Dictamen literario/canon y permiso de arte. **No usar Saltalodo** por discrepancia #706 |

**Importante:** estos recursos se comprobaron como presentes en `main`, pero su presencia **NO** supone autorización para usarlos en EPUB. Las correspondencias de sala se observaron en `client/ui-data.js > placeIllustrations`. No realizar conversión ni incrustación antes de validación de contenido y aprobación.

## Próximo hito
1. Revisor 03 confirma versiones corregidas y Arquitectura Editorial/VT2 resuelve compatibilidad compartida en #705.
2. Arquitecto Editorial aprueba por archivo la selección final de arte y el primer piloto con imágenes.
3. Agente 04 prueba EPUBCheck y al menos dos lectores; sólo entonces eleva propuesta de distribución.
4. **Publicar en Drive únicamente mediante autorización explícita**, comprobando el enlace y su apertura.

**Estado final de esta intervención:** **HECHO** el primer EPUB de prelectura en PR #708; **NO HECHO** publicación, inclusión de C003, inclusión de imágenes, QA en dispositivos, EPUBCheck y visto bueno de edición final.
