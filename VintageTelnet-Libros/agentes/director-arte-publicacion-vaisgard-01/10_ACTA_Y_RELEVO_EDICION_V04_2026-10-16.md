# Acta y relevo — Edición v04 completa e ilustrada (prólogo + C001–C015)

**Fecha:** 2026-10-16. **Responsable:** Claude, Director de Arte y Publicación 04. **Rama/PR:** `editorial/cronicas-vaisgard-agente-04-preproduccion`, #708.
**Sustituye como punto de entrada** a `09_RELEVO_AGENTE_04_CHAT_NUEVO_2026-10-16.md`. Las versiones v01–v03 se conservan sin cambios.

## Decisión de autoridad
El propietario indicó el 2026-10-16 que el libro es una propuesta de IA, que **no aprueba narración ni arte** y que espera un **libro terminado**. Por eso el director aplicó las correcciones narrativas y la selección de arte en una edición derivada (`edicion-v04/`). Los manuscritos de #705, el código y el arte del videojuego no se tocaron. El canon del juego y `POLITICA_DE_SECRETOS.md` se respetan: la carta de Dalia es ficción privada (COMPATIBLE) y las marcas en la piedra son una observación sin explicación (DESCUBRIBLE).

## Entregable
- **EPUB:** [`prelecturas/CV_L1_EDICION_V04_ILUSTRADA_PROLOGO_C001_C015.epub`](prelecturas/CV_L1_EDICION_V04_ILUSTRADA_PROLOGO_C001_C015.epub). 5.744.403 bytes. SHA-256 `8a8040a1dbd0afd4fd9fda8c6d568e0e50676be51c28b8e6f01f6d75c99d878e`. Git blob `a13f5b10e0fd2fe45992d4f482a48f3215dd35d2`.
- **Copia local para el propietario:** `~/Descargas/CV_L1_EDICION_V04_ILUSTRADA_PROLOGO_C001_C015.epub`. No se subió a Drive: el propietario pidió no gastar tokens en subirlo.
- **Fuentes reproducibles:**
  - `edicion-v04/texto/*.md`: unas 37.100 palabras.
  - `edicion-v04/ilustraciones.json`: imágenes, anclas y textos alternativos.
  - `edicion-v04/arte/`: imágenes en JPEG.
  - `edicion-v04/build_epub.py`: script de montaje, solo con la biblioteca estándar.
- **Regenerar:** `python3 edicion-v04/build_epub.py <salida.epub>`.

## Cambios narrativos (motivados en `auditoria/NARRATIVA_01_DICTAMEN_CLAUDE.md`)
1. **C015 reescrito (Claude).** Mara guardaba una carta de Dalia que llegó durante el viaje: Dalia escribió primero. Lera escribe la respuesta en su propia carta y la envía con el carretero al Patio de Mensajes. Así se pagan las semillas de C001 y C008 sin un reencuentro forzado, y queda abierto el Libro II. C014 incluye un gesto que lo anticipa.
2. **Edición de línea del prólogo y C001–C014** (hecha por Codex y revisada por Claude; detalle en `edicion-v04/REGISTRO_EDICION_000_014.md`):
   - Prólogo recortado un 40 %; C002, C009 y C012, alrededor de un 15 %.
   - Moralejas y cautelas reducidas.
   - Renombrados: Nara → Tesca, Aren → Brin, Bela → Hulda, Seli → Ondra; la vendedora de fruta pasa a llamarse Fenna.
   - Registro único con «ustedes», erratas corregidas y eco de la piedra antigua en C008 y C015.

## Arte (13 interiores + cubierta)
- **Cubierta:** P02 v2 (banco, piedra vieja, carta, taza y carboncillo). Es la más específica de esta historia y se lee bien en miniatura (`auditoria/arte-nuevo/COMPARATIVA_PORTADAS_200px.jpg`).
- **Nuevas (Codex):** N01 canaleta (C001), N02 terraplén (C004), N03 arroyo (C006), N04 espera (C010) y N05 nota (C012). Defectos, regeneraciones y prompts en `auditoria/ARTE_03_REGISTRO_ARTE_NUEVO.md`.
- **VT2, convertidas a JPEG desde `origin/main`, con originales intactos:**

| ID | Fuente | Blob |
|---|---|---|
| V01 | `places/vaisgard-anime-v1.webp` | `82cc3dd` |
| V02 | `places/valdren-anime-v1.webp` (reubicada tras la descripción de la plaza) | `73f9644` |
| V04 | `places/valdren_pozo-anime-v1.webp` | `b70ebe9` |
| V05 | `places/edran_salida_huertos-anime-v1.webp` | `1a71578` |
| V08 | `bestiary/espinajo-rastrojo-anime-v1.webp` | `e7659b4` |
| R09 | `places/veyra_patio_senales-anime-v1.webp` | `b012a74` |
| R11 | `places/veyra_calle_toldos-anime-v1.webp` | `d0e88b8` |
| R13 | `places/veyra_puerta_campos-anime-v1.webp` | `7444d99` |

- V03 se retiró porque repetía lo que muestra N01. C015 no lleva imagen, para no interrumpir el desenlace.
- Biblia visual y guion completo: `auditoria/ARTE_01_BIBLIA_VISUAL.md` y `auditoria/ARTE_02_GUION_VISUAL_C001_C015.md`.

## QA ejecutado
- [x] **EPUBCheck 5.4.0** (reglas EPUB 3.4): 0 errores, 0 advertencias. El v03 también pasa con 5.4; los errores `MED-003` de 4.2.6 se debían a que esa versión aplica reglas de EPUB 3.2.
- [x] **DAISY Ace** (`ace-puppeteer`, con el sandbox activo): **pass**. Incluye metadatos `schema:accessibility*`, roles DPUB-ARIA, textos alternativos e índice con landmarks.
- [x] **Render en Chromium a 390×844:** apertura de capítulo, sangría, diálogos y división silábica correctos.
- [x] Lectura integral del texto final de C015 y revisión del diff de C001–C014 por el director.
- [ ] **No comprobado:** apertura física en Android ni en lectores dedicados. Le toca al propietario.

## Auditorías archivadas
`auditoria/NARRATIVA_01_DICTAMEN_CLAUDE.md`, `auditoria/notas-lectura-claude.md`, `auditoria/NARRATIVA_AGY.md` (segunda opinión independiente, Gemini 3.8 Flash), `auditoria/TECNICA_EPUB_V03_AGY.md` y `auditoria/ARTE_01–03`.
Incidencia: agy ejecutó Ace sobre el v03 con `ELECTRON_DISABLE_SANDBOX=1`, que desactiva el sandbox del navegador y va contra las reglas de navegador del equipo. Su resultado técnico es válido, pero no debe repetirse ese método.

## Pendientes reales / siguiente paso
1. El propietario abre el EPUB en Android y reporta cualquier defecto de lectura.
2. Mejora opcional, de prioridad media: diferenciar más las voces de las mentoras de Vaisgard (Fenna, Hulda, Ondra, Arel). Agy lo señala y el dictamen lo coincide en parte.
3. #705 y #707 conservan sus manuscritos. Si se quiere fusionar la edición v04 como canon editorial, hay que tramitarlo allí; este documento no fusiona nada.
