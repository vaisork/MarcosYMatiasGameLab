# Recepción de EPUB v03 — Crónicas de Vaisgard hasta C012, ILUSTRADO

**Responsable:** Director de Arte/Publicación 04 · PR #708. **Fecha de corte:** 2026-10-16 (México).  
**Estado:** **PRELECTURA PRIVADA / BORRADOR / NO CANON FINAL**.  
**Archivo:** [`CV_L1_PRELECTURA_V03_ILUSTRADA_PROLOGO_C001_C012.epub`](prelecturas/CV_L1_PRELECTURA_V03_ILUSTRADA_PROLOGO_C001_C012.epub).  
**Git blob del EPUB:** `065213cb3bd6a4e4b5a69fcbbd02fc59e3834166`. **Tamaño:** 2,327,579 bytes. **Entradas ZIP/OCF:** 25 (19 recursos de texto, nav y metadatos, y 6 imágenes WebP).  
**Fuente narrativa:** PR #705, rama `editorial/cronicas-vaisgard-agente-01-voz` con aprobaciones literarias del Arquitecto y Revisor.  
**No se alteró la prosa, los manuscritos ni el videojuego.** Solo se omiten las cuatro líneas de cabecera administrativa del prólogo de la vista del lector.

## Manuscritos cotejados (SHAs fuente reales)
| Sección | Blob del texto usado | Párrafos de prosa |
|---|---|---:|
| Prólogo | `fb56d488e7acafad428e673d80039e88ba28b38c` | 33 |
| C001 | `d445b8feedb4d4013d3cda9fa01166ab634fb981` | 211 |
| C002 | `0d24df1220cac11cfab1d7de4e8f6c4776f19a98` | 195 |
| C003 | `9a4eb8305b6996649c4889620868c7aefd719611` | 118 |
| C004 | `fe2ef09ca3c363e324ebf2228ad896a4f349b27c` | 140 |
| C005 | `4a4cbd654e6d9032734a218f74ee458f6b7e2100` | 148 |
| C006 | `27365396a724f92556a8bf2050208bd209f2e6fa` | 112 |
| C007 | `6aca35d8ca12704ce189e70349d8740c6c4b3f61` | 146 |
| C008 | `e3ee67a0399b3737a4b1992abdd1089b9d46bbee` | 163 |
| C009 | `8116313f9394e50089d68bc09351b8f4892400eb` | 171 |
| C010 | `2c49eadba6a655607e63092920978cc220730f7d` | 158 |
| C011 | `40e57cc711eaa889ca34a1fe0a36ea98f2a2f5e3` | 187 |
| C012 | `da0855503ab1d8365cee15c75c09535a0e30b69d` | 168 |

## Seis ilustraciones completas dentro del EPUB

**Permiso:** [Arquitectura Editorial, PR #708 comentario 6202753571](https://github.com/vaisork/MatiasGameLab/pull/708#issuecomment-6202753571), **solo para prelectura privada**. Cada archivo original fue leído en base64 desde `main` y comprobado contra su Git blob SHA, después descodificado a bytes RIFF/WEBP; se incluyeron las **versiones de tamaño completo, no thumbnails**, en `OEBPS/images/`. Se mantienen intactos los originales de `vintage-telnet-2/`.

| Imagen | Posición exacta en relato | Archivo original desde `vintage-telnet-2/client/art/` | SHA del original | Bytes |
|---|---|---|---|---:|
| V01 | Prólogo, después de la primera presentación de Vaisgard | `places/vaisgard-anime-v1.webp` | `82cc3ddb6186e87dbd88a742d6403fa856b23ad5` | 286194 |
| V02 | C001, después de la introducción de plaza de Valdren | `places/valdren-anime-v1.webp` | `73f96447d4545e91d47843f645bc9e18673376e4` | 313346 |
| V03 | C001, después de la llegada al corredor de huertos | `places/valdren_huertos-anime-v1.webp` | `8804cb8068a3201b1c52a61491a277a97aed3b2f` | 422012 |
| V04 | C002, después de describir el pozo | `places/valdren_pozo-anime-v1.webp` | `b70ebe975eff410c96e98e1ffdc66b1f11bd4824` | 399064 |
| V05 | C003, después de que Lera cruza los postes de salida | `places/edran_salida_huertos-anime-v1.webp` | `1a71578f0aa4b3f56e4a7c63e277417d9a7b9e29` | 416920 |
| V08 | C003, después de nombrar el Espinajo | `bestiary/espinajo-rastrojo-anime-v1.webp` | `e7659b4711551b777b1e0375718d380669c2e553` | 273280 |

WebP es tipo de imagen admitido como medio central en EPUB 3.3, con MIME `image/webp`. El formato estándar **no garantiza por sí solo** la compatibilidad de cada lector instalado. Portadilla tipográfica y texto alternativo por imagen; no se presenta a los personajes literarios como retratos del arte ni se anticipa el Espinajo antes de su aparición textual.

## QA efectivamente ejecutado
- [x] Verificados los **13 Git blob SHA** de los manuscritos usados, incluyendo el C012 corregido `da0855503ab1d8365cee15c75c09535a0e30b69d`.
- [x] Portadilla + prólogo + C001–C012; orden del `spine` consistente con el `nav.xhtml` de **14 enlaces**, uno por elemento, incluido Portadilla.
- [x] Los seis recursos WebP están **dentro del EPUB**, no enlazados externamente; firma RIFF/WEBP, manifest `image/webp`, escala relativa y ubicación tras primera presentación de cada escena.
- [x] ZIP/OCF: `mimetype` primer recurso sin compresión; 25 entradas ZIP con cabeceras, longitudes y CRC32 verificadas programáticamente; directorio central y firma EOCD cotejados.
- [x] Idioma `es`, marca de borrador y CSS reajustable; prosa sin fichas de revisión internas.
- [ ] **EPUBCheck externo no ejecutado.** El control ZIP no sustituye un EPUBCheck completo.
- [ ] **Apertura manual en lector Android/tablet/escritorio no ejecutada** ni se ha comprobado visualmente allí la reproducción WebP.
- [ ] **No se ha hecho carga binaria a Google Drive verificable**; carpeta privada `1GoGePI5CDOJ2nZppO8fOOgDJX6KrO5UD` sigue siendo el destino autorizado. No ofrecer el botón «Download raw» de la aplicación Android de GitHub como método verificado: el propietario informó que no aparece.
- [ ] Co-decisión de canon Arquitectura Editorial + VT2 y autorización de edición final pendientes. Los recursos adicionales C004–C012 requerirán examen y permiso focalizado.

## Relación con entregas anteriores
- **v01:** [Prólogo y C001–C007](prelecturas/CV_L1_PRELECTURA_BORRADOR_PR705_PROLOGO_C001_C007.epub), conservada.
- **v02:** [Prólogo y C001–C008](prelecturas/CV_L1_PRELECTURA_V02_PROLOGO_C001_C008.epub), conservada.
- **v03:** la presente primera prelectura con los **12 capítulos y 6 ilustraciones autorizadas**.

**C013 únicamente autorizado para escritura**, no incorporado sin cierre literario. PR continúa en borrador; no se solicita fusión ni se publica edición canónica final.
