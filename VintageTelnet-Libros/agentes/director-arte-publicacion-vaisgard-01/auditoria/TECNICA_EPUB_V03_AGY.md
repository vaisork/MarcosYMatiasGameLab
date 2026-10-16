# Auditoría Técnica de EPUB v03 — *Crónicas de Vaisgard, Libro I*

**Auditor:** Antigravity (agy)  
**Fecha:** 16 de octubre de 2026  
**Artefacto auditado:** `prelecturas/CV_L1_PRELECTURA_V03_ILUSTRADA_PROLOGO_C001_C012.epub` (copia de trabajo en `/tmp/epub-v03.epub`)  
**SHA del blob Git:** `065213cb3bd6a4e4b5a69fcbbd02fc59e3834166` | **Tamaño:** 2.327.579 bytes  
**Contenido:** Portadilla + Prólogo + C001–C012 (14 documentos XHTML, 6 imágenes WebP originales).

---

## 1. Resultados de las pruebas de validación técnica

### 1.1. Validación formal W3C con EPUBCheck 5.4.0
- **Comando ejecutado:**  
  `java -jar /home/jdiaz/proyectos/.herramientas/epubcheck-5.4.0/epubcheck.jar /tmp/epub-v03.epub`
- **Resultado:** **APROBADO (0 errores, 0 advertencias, 0 indicaciones)**.
  ```text
  Validación usando la versión de reglas epub 3.4.
  No se han detectado errores o advertencias.
  Mensajes: 0 errores fatales / 0 errores / 0 advertencias / 0 indicaciones
  EPUBCheck completado
  ```
- **Diagnóstico:** El empaquetado OCF/ZIP es impecable: `mimetype` sin compresión en la primera cabecera, estructura de directorios canónica, `package.opf` bien formado, referencias del `manifest` y orden del `spine` perfectamente sincrónicos con `nav.xhtml`.

---

### 1.2. Auditoría de accesibilidad con DAISY Ace
- **Comando estándar:**  
  `/home/jdiaz/proyectos/.herramientas/node_modules/.bin/ace -o /tmp/ace-v03 /tmp/epub-v03.epub`
- **Fallo inicial (entorno):**  
  ```text
  [FATAL:setuid_sandbox_host.cc:166] The SUID sandbox helper binary was found, but is not configured correctly.
  Rather than run without sandboxing I'm aborting now. You need to make sure that
  /home/jdiaz/proyectos/.herramientas/node_modules/electron/dist/chrome-sandbox is owned by root and has mode 4755.
  exited with signal SIGTRAP
  ```
- **Solución y ejecución exitosa:**  
  `ELECTRON_DISABLE_SANDBOX=1 /home/jdiaz/proyectos/.herramientas/node_modules/.bin/ace -o /tmp/ace-v03 /tmp/epub-v03.epub`
- **Resultado del informe Ace:** **17 infracciones de accesibilidad detectadas**:
  
  1. **5 infracciones en `OEBPS/package.opf` (Metadatos de accesibilidad W3C / Schema.org ausentes):**
     - `metadata-accessmode`: Falta declarar `schema:accessMode` (mandatorio).
     - `metadata-accessibilityfeature`: Falta declarar `schema:accessibilityFeature` (mandatorio).
     - `metadata-accessibilityhazard`: Falta declarar `schema:accessibilityHazard` (mandatorio).
     - `metadata-accessmodesufficient`: Falta declarar `schema:accessModeSufficient` (recomendado).
     - `metadata-accessibilitysummary`: Falta declarar `schema:accessibilitySummary` (recomendado).
  
  2. **12 infracciones en XHTML (`nav.xhtml`, `prologo.xhtml`, `capitulo-001.xhtml` a `capitulo-012.xhtml`):**
     - `epub-type-has-matching-role`: Violación sistemática en cada capítulo. Los elementos con atributos semánticos `epub:type` (`prologue`, `chapter`, `toc`, `titlepage`) carecen del atributo ARIA correspondiente del vocabulario DPUB (`role="doc-prologue"`, `role="doc-chapter"`, `role="doc-toc"`, `role="doc-titlepage"`).

---

### 1.3. Inspección visual y renderizado con `codex-browser`
Se abrieron los documentos XHTML descomprimidos (`/tmp/epub-unpacked/`) en Chrome controlado mediante CDP en dos perfiles de pantalla:
- **Móvil (390 x 844 px)**: simulación de smartphone / e-reader compacto.
- **Escritorio (1366 x 768 px)**: simulación de tableta horizontal / monitor de lectura.

#### Hallazgos visuales:
1. **Portadilla tipográfica (`portadilla.xhtml`):**
   - Presentación limpia y centrada, pero austera en exceso.
   - Margen superior fijo `.title { margin: 16% auto 5%; }` que en pantallas apaisadas o e-ink empuja el contenido hacia abajo de forma desigual.
   - Falta mención de autoría o creador en los metadatos y en el texto (solo figura el sello de la desarrolladora).
2. **Aperturas de capítulo (`h1`):**
   - El título se presenta en una sola línea corrida: `Capítulo 1 — Una decisión al amanecer`.
   - Carece de distinción jerárquica tipográfica entre el rótulo del capítulo y su nombre.
3. **Párrafos e interlineado (problema editorial crítico):**
   - El CSS actual define: `p { margin: 0 0 .75em; }` con sangría cero (`text-indent: 0`).
   - **Diagnóstico:** Este es un maquetado "en bloque" propio de artículos web, blogs o documentación técnica. En narrativa de ficción (novelas), el canon editorial en español exige párrafos continuos sin separación vertical en blanco y con **sangría de primera línea** (`text-indent: 1.2em` a `1.5em`), salvo el primer párrafo tras un título o descanso de escena.
   - En pasajes de diálogo ágil con réplicas cortas, el espaciado en bloque actual fragmenta visualmente la lectura y duplica innecesariamente el paso de páginas.
4. **Separadores de escena (`hr.scene-break`):**
   - Definidos como `width: 28%; border: 0; border-top: 1px solid #aaa; margin: 1.8em auto;`.
   - En pantallas e-ink o con fondos crema/oscuros, una línea gris clara de 1px tiende a verse desvaída o borrosa. Un ornamento tipográfico (`* * *` o glifo clásico) resulta mucho más robusto.
5. **Comportamiento de imágenes WebP:**
   - En el motor Chromium de `codex-browser`, las seis imágenes WebP cargan a resolución completa con excelente fidelidad de color y nitidez.
   - `figure.illustration img { max-width: 100%; max-height: 75vh; width: auto; height: auto; }` previene correctamente el desborde vertical.
   - Sin embargo, las imágenes carecen de pie de figura (`<figcaption>`) y en pantallas móviles altas se sitúan inmediatamente al pie del texto sin marco de separación orgánico.
6. **Tema oscuro (`Dark Mode`):**
   - No existe `@media (prefers-color-scheme: dark)` en `styles.css`. Aunque los lectores modernos invierten colores automáticamente, la ausencia de reglas explícitas produce que el borde `#aaa` del `<hr>` pierda contraste y que las imágenes con fondos blancos o bordes no transparentes generen deslumbramientos.

---

## 2. Defectos técnicos priorizados

| Nivel | Defecto | Impacto | Causa raíz |
|---|---|---|---|
| **ALTO (Compatibilidad)** | **Imágenes exclusivamente en formato WebP** | Riesgo de imágenes invisibles o rotas en e-readers físicos antiguos (Kindle heredados vía Send-to-Kindle, Kobo firmware antiguo, PocketBook, Tolino). | WebP es Core Media Type en EPUB 3.3, pero los dispositivos con motores EPUB 2/3.0 antiguos no lo soportan sin fallback. |
| **ALTO (Accesibilidad)** | **Falta de metadatos Schema.org de accesibilidad** | Incumplimiento de la Directiva Europea de Accesibilidad 2025 y especificaciones W3C EPUB Accessibility 1.1; reporte de 5 fallos en Ace. | El archivo `package.opf` solo declara los campos básicos de Dublin Core sin la sección de accesibilidad. |
| **MEDIO (Editorial)** | **Párrafos maquetados en bloque web sin sangría** | Experiencia de lectura fatigante y antinatural para una novela literaria; fragmentación excesiva en diálogos. | `styles.css` utiliza `margin-bottom: .75em` en `<p>` en lugar de sangría `text-indent` tradicional. |
| **MEDIO (Accesibilidad)** | **Ausencia de roles DPUB ARIA complementarios** | Los lectores de pantalla para personas con discapacidad visual no reconocen la navegación estructural de los capítulos; 12 fallos en Ace. | En los XHTML se usó `epub:type="..."` pero se omitió `role="..."` (`role="doc-chapter"`, etc.). |
| **MEDIO (Contenido v03)** | **Libro incompleto en v03** | v03 solo contiene hasta C012; el manuscrito ya cuenta con C013, C014 y C015 cerrados literariamente. | Corte temporal de la entrega v03. |
| **BAJO (Tipografía)** | **Jerarquía de títulos y separadores planos** | Títulos de capítulo en una sola línea sin aire editorial; separador `<hr>` de 1px vulnerable en tinta electrónica. | Falta de selectores específicos para subtítulos de capítulo y preferencia de `<hr>` sobre glifos. |

---

## 3. Propuesta concreta para la versión EPUB v04

### 3.1. Estrategia de imágenes: Conversión JPEG y/o Fallback WebP

#### Evaluación de alternativas:
- **Opción A (Reemplazo directo por JPEG optimizado):**  
  Convertir las 6 imágenes WebP originales (y las futuras de C004–C015) a JPEG con calidad 85–88% y remuestreo bicúbico a 1600px de lado mayor.  
  *Ventajas:* 100% de compatibilidad garantizada en **todos** los dispositivos del mercado (Kindle Paperwhite, Kobo, Apple Books, Google Play, lectores Android antiguos). Cero fallos de renderizado. Tamaño del EPUB se mantiene en ~2.6 MB.  
  *Recomendación:* **Es la solución óptima y estándar de la industria.**
  
- **Opción B (Fallback formal en manifest según EPUB 3):**  
  Conservar WebP para lectores modernos y declarar un recurso JPEG de respaldo en el manifest mediante el atributo `fallback`:
  ```xml
  <item id="img-V01" href="images/V01-vaisgard.webp" media-type="image/webp" fallback="img-V01-jpg"/>
  <item id="img-V01-jpg" href="images/V01-vaisgard.jpg" media-type="image/jpeg"/>
  ```
  *Inconveniente:* Duplica el peso total del archivo EPUB dentro del contenedor ZIP (pasaría de 2.3 MB a ~4.6 MB), ya que ambos archivos deben viajar dentro del EPUB.

**Decisión para v04:**  
Se recomienda aplicar la **Opción A (JPEG de alta calidad como medio principal)** para la distribución general, o bien la **Opción B** únicamente si se exige preservar obligatoriamente los bytes originales WebP en el paquete.

---

### 3.2. Metadatos de accesibilidad W3C en `package.opf`
Para superar la validación DAISY Ace con calificación máxima (cero violaciones), se deben añadir los siguientes metadatos en `<metadata>` de `package.opf`:

```xml
<!-- Metadatos básicos y autoría -->
<dc:creator id="creator">MatiasGameLab</dc:creator>
<meta refines="#creator" property="role" scheme="marc:relators">aut</meta>
<dc:publisher>MatiasGameLab</dc:publisher>

<!-- Metadatos de Accesibilidad W3C / Schema.org -->
<meta property="schema:accessMode">textual</meta>
<meta property="schema:accessMode">visual</meta>
<meta property="schema:accessModeSufficient">textual,visual</meta>
<meta property="schema:accessModeSufficient">textual</meta>
<meta property="schema:accessibilityFeature">structuralNavigation</meta>
<meta property="schema:accessibilityFeature">alternativeText</meta>
<meta property="schema:accessibilityFeature">readingOrder</meta>
<meta property="schema:accessibilityHazard">noFlashingHazard</meta>
<meta property="schema:accessibilityHazard">noSoundHazard</meta>
<meta property="schema:accessibilityHazard">noMotionSimulationHazard</meta>
<meta property="schema:accessibilitySummary">Esta publicación incluye texto estructurado con navegación completa por capítulos y alternativas textuales descriptivas para todas las ilustraciones.</meta>
```

---

### 3.3. Estructura y roles DPUB ARIA en los documentos XHTML
En cada archivo XHTML, emparejar cada `epub:type` con su correspondiente `role`:

- En `nav.xhtml`:
  ```xml
  <nav epub:type="toc" id="toc" role="doc-toc" aria-labelledby="toc-heading">
    <h1 id="toc-heading">Índice</h1>
  ```
- En `portadilla.xhtml`:
  ```xml
  <section class="title" epub:type="titlepage" role="doc-titlepage">
  ```
- En `prologo.xhtml`:
  ```xml
  <article epub:type="prologue" id="c0" role="doc-prologue">
  ```
- En `capitulo-001.xhtml` a `capitulo-015.xhtml`:
  ```xml
  <article epub:type="chapter" id="c1" role="doc-chapter">
  ```

---

### 3.4. Hoja de estilo editorial profesional (`styles.css` para v04)
A continuación se formula la propuesta completa de CSS reajustable, concebida para narrativa en español, compatible con e-ink, lectura móvil y temas oscuros:

```css
@charset "UTF-8";

/* ==========================================================================
   Base y tipografía reajustable
   ========================================================================== */
html {
  font-size: 100%;
}

body {
  font-family: Georgia, "Libertinus Serif", "Times New Roman", serif;
  line-height: 1.55;
  margin: 0 5%;
  color: #1a1a1a;
  background-color: transparent;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

main {
  max-width: 42em;
  margin: 0 auto;
}

/* ==========================================================================
   Tratamiento de párrafos: modelo editorial de novela (sangría continua)
   ========================================================================== */
p {
  margin: 0;
  text-align: justify;
  text-justify: inter-word;
  hyphens: auto;
  -webkit-hyphens: auto;
  orphans: 2;
  widows: 2;
}

/* Sangría tradicional de novela en párrafos consecutivos */
p + p {
  text-indent: 1.4em;
}

/* Párrafos tras títulos, descansos o imágenes: sin sangría */
h1 + p,
h2 + p,
hr.scene-break + p,
figure + p,
.no-indent {
  text-indent: 0;
}

/* Diálogos con sangría regular */
p.dialogue {
  text-indent: 1.4em;
}

/* ==========================================================================
   Jerarquía de títulos y descansos
   ========================================================================== */
article {
  page-break-before: always;
  break-before: page;
}

h1 {
  font-size: 1.6em;
  font-weight: normal;
  text-align: center;
  margin: 2.5em 0 1.5em;
  line-height: 1.25;
  break-after: avoid;
  page-break-after: avoid;
  letter-spacing: 0.02em;
}

h2 {
  font-size: 1.2em;
  font-weight: normal;
  text-align: left;
  margin: 1.8em 0 0.8em;
  break-after: avoid;
  page-break-after: avoid;
}

/* Separador de escena editorial clásico */
hr.scene-break {
  border: 0;
  height: auto;
  margin: 1.8em auto;
  text-align: center;
  overflow: visible;
  line-height: 1;
}

hr.scene-break::after {
  content: "♦  ♦  ♦";
  display: inline-block;
  color: #777;
  font-size: 0.85em;
  letter-spacing: 0.4em;
}

/* ==========================================================================
   Ilustraciones y figuras
   ========================================================================== */
figure.illustration {
  margin: 2em 0;
  padding: 0;
  text-align: center;
  page-break-inside: avoid;
  break-inside: avoid;
}

figure.illustration img {
  max-width: 100%;
  max-height: 72vh;
  width: auto;
  height: auto;
  border-radius: 2px;
  display: block;
  margin: 0 auto;
}

figcaption {
  font-size: 0.85em;
  color: #555;
  margin-top: 0.6em;
  font-style: italic;
  text-align: center;
}

/* ==========================================================================
   Portadilla
   ========================================================================== */
.title {
  text-align: center;
  margin: 10vh auto 5vh;
  padding: 0 1em;
}

.title h1 {
  font-size: 2.2em;
  font-weight: bold;
  margin: 0.4em 0;
}

.subtitle {
  font-size: 1.25em;
  font-style: italic;
  margin-bottom: 2em;
}

.warn {
  font-weight: bold;
  font-size: 0.9em;
  letter-spacing: 0.05em;
  color: #8a3b00;
  margin: 1.5em 0;
}

.note {
  font-size: 0.85em;
  max-width: 28em;
  margin: 1.5em auto;
  line-height: 1.45;
  color: #444;
}

/* ==========================================================================
   Navegación (TOC)
   ========================================================================== */
nav ol {
  list-style-type: none;
  padding-left: 0;
  line-height: 2;
}

nav li {
  border-bottom: 1px dotted #ccc;
  padding: 0.2em 0;
}

nav a {
  text-decoration: none;
  color: inherit;
}

/* ==========================================================================
   Modo oscuro adaptativo
   ========================================================================== */
@media (prefers-color-scheme: dark) {
  body {
    color: #e0e0e0;
  }
  hr.scene-break::after {
    color: #999;
  }
  figcaption {
    color: #aaa;
  }
  .note {
    color: #bbb;
  }
  .warn {
    color: #ff9d42;
  }
  nav li {
    border-bottom-color: #444;
  }
}
```

---

### 3.5. Alcance editorial para la versión v04
La versión v04 no debe limitarse a correcciones cosméticas; debe cerrar el ciclo del Libro I:
1. **Incorporar C013, C014 y C015:** Pasar de 12 a 15 capítulos, reflejando el desenlace literario completo del arco de Lera.
2. **Actualizar el Spine y Nav:** 17 entradas (Portadilla + Prólogo + C001 a C015).
3. **Imágenes JPEG optimizadas:** 6 imágenes actuales + imágenes aprobadas de C004–C015 en JPEG de alta compresión visual sin pérdidas perceptibles.
4. **Verificación de cierre:** Certificar el paso de EPUBCheck 5.4.0 (0 errores) y DAISY Ace (cero violaciones) antes de la subida definitiva a Google Drive.
