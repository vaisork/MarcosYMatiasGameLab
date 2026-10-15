# Plantilla de capítulos ilustrados y publicación EPUB 3
**Agente 04:** `director-arte-publicacion-vaisgard-01`  
**Estado:** propuesta operativa; NO crea ningún libro, documento Drive o PDF.

## A. Plantilla estructural (no es un capítulo redactado)
Para cada capítulo **aprobado** crear una versión maqueta de revisión separada del manuscrito original. No duplicar el manuscrito en otro sistema como "fuente canónica" ni corregir prosa sin intervención del editor.

### Cabecera interna de producción (NO visible al lector)
```yaml
coleccion: Crónicas de Vaisgard
libro: "I — El primer camino"  # provisional
capitulo_numero: "<NN>"
capitulo_titulo: "<titulo aprobado>"
manuscrito_ruta_git: "<ruta exacta>"
manuscrito_revision_sha: "<commit o versión aprobada>"
ficha_aprobada_pr: "<PR y enlace>"
estado: REVISION_MAQUETA
arte_registro: "<ruta de registro de imágenes>"
autorizacion_arquitecto_editorial: PENDIENTE
```

### Orden de página/lectura
1. **Apertura del libro** (sólo en primera entrega): portada aprobada, créditos confirmados y sumario con enlaces.
2. **Comienzo de capítulo**: título semántico `h1`/`h2` exportable desde encabezados reales, número, espacio visual antes del texto. Imagen de apertura **opcional**, jamás obligatoria.
3. **Cuerpo narrativo**: párrafos tal como fueron aprobados; texto oscuro sobre fondo claro, alineación preferente a la izquierda o justificada sólo si no crea ríos, guiones manuales ni columnas.
4. **Secciones de escena**: transición simple `* * *` o espacio pautado, sin artificios decorativos.
5. **Ilustraciones interiores**: bloque entre dos párrafos completos, imagen insertada en línea, escala proporcional y texto alternativo libre de spoilers.
6. **Final**: cierre natural del capítulo. No intercalar ficha técnica ni "desbloqueaste"/datos de videojuego.
7. **Navegación digital**: índice enlazado a estilos reales, no simulados por tamaños manuales. En EPUB 3 usar `nav.xhtml`, capítulos en orden de lectura (`spine`) y metadatos. En PDF usar marcadores si la exportación los conserva.

### Estilos de prueba inicial (ajustables tras medir)
| Elemento | Propuesta Google Docs |
|---|---|
| Texto | Georgia 12 pt (alternativa sans accesible si se demuestra mejor en móvil) |
| Interlineado | 1.25–1.4; separación moderada entre párrafos |
| Título del capítulo | 18–22 pt, jerarquía semántica |
| Subtítulos/escenas | Estilo discreto, sin numeraciones técnicas |
| Imagen de apertura | Máximo ancho utilizable, centrada e insertada en línea; proporción intacta |
| Pie de imagen | 9–10 pt si resulta imprescindible, sin revelar secretos |
| Márgenes Docs | Amplios para escritorio; no depender de márgenes para simular columnas |
| Fondos y decoraciones | Fondo claro, alto contraste, sin imágenes bajo texto |

No fijar tamaño de portada, tipografía propietaria o dimensiones finales hasta probar acceso real en móvil y tablet.

## B. Decisión del propietario — EPUB 3 es el formato principal
**Cambio de encargo expreso:** la distribución principal será **EPUB 3 reajustable (reflowable)**; esta preferencia sustituye la comparación anterior que ponía Google Docs como edición principal. Google Docs es una **herramienta opcional de revisión del manuscrito**, no el producto principal. PDF podrá existir como derivado secundario únicamente si se autoriza.

### Especificación EPUB de salida
- EPUB 3 **reflowable** para móviles y tablets. No usar fixed-layout por defecto ni diseñar páginas fijas dentro de EPUB.
- Narrativa en XHTML semántico con títulos `h1` / `h2`, párrafos `p`, cortes de escena accesibles, y hojas CSS sencillas de estilo **relativo** (`em`, `rem`, porcentajes; sin tamaños de letra rígidos).
- `nav.xhtml` con capítulos navegables, metadatos `dc:title`, `dc:language` = `es`, `dc:creator` sólo cuando esté confirmado, identificador de edición, y `spine` con orden correcto.
- Imagen de portada original **únicamente tras aprobación**, portada accesible; recurso original intacto y copia para lectura móvil con proporciones fieles. Todas las imágenes interiores deben tener `alt` adecuado que no revele secretos.
- Como los originales del cliente son WebP, preparar **copias editoriales** PNG/JPEG cuando haga falta compatibilidad amplia con lectores EPUB, sin editar el contenido visual; comprobar el resultado lado a lado. No insertar originales WebP a ciegas.
- Fuentes sencillas y legibilidad gobernada por preferencias del lector; jamás bloquear tamaño, modo nocturno o cambio de tipografía de la app.
- Evitar CSS complejo, columnas, texto incrustado en imagen, paginación forzada y scripts de lectura.
- Control de validación: **EPUBCheck**, y lectura manual real en un lector de Android, otro dispositivo/pantalla y escritorio; revisar sumario, tildes, saltos, fuentes, tamaño de imágenes, posición de ilustraciones y accesibilidad.
- Generar con herramientas gratuitas disponibles (por ejemplo Pandoc y/o Calibre CLI si están instalados); no implica comprar software ni automatizar nada. Los artefactos finales sólo se generan y suben tras recibir manuscrito y autorización.

### Función de cada formato
| Formato | Función |
|---|---|
| **EPUB 3** | **Edición principal** de lectura fluida y distribuible; debe aprobarse con prueba de lectura móvil. |
| Google Docs | Fuente de colaboración/revisión editorial si el equipo lo desea; no sustituye el manuscrito congelado en GitHub. |
| PDF | Exportación secundaria opcional para imprimir o conservar un diseño de página fija. |
| Google Drive | Repositorio de distribución del archivo `.epub`, manuscritos y copias de revisión; **no se presupone que Drive ofrezca lector EPUB integrado**. Los lectores descargan/abren el EPUB con app compatible. |

### Prueba mínima de aceptación
- [ ] EPUBCheck sin errores fatales ni referencias rotas.
- [ ] EPUB abre y permite avanzar por capítulo/sumario, y cambiar fuente/tamaño en lector Android.
- [ ] Imágenes originales convertidas para compatibilidad cuando proceda; encuadre y color fieles.
- [ ] No hay desbordamiento horizontal, páginas vacías artificiales ni texto demasiado pequeño.
- [ ] Metadatos/portada/créditos autorizados y libre de secretos no publicables.
- [ ] Abrir el archivo `.epub` descargado desde Drive con permisos previstos, antes de declarar `PUBLICADO_VERIFICADO`.
- [ ] PDF/Docs se prueban sólo si son parte del alcance autorizado.

## C. Estructura propuesta en Drive (NO creada)
```text
Crónicas de Vaisgard/
  Libro I — El primer camino/
    00_Manuscritos_aprobados/       (solo acceso editorial)
    01_Maquetas_en_revision/         (versiones de prueba sin distribución)
    02_Arte_y_trazabilidad/          (copias de uso autorizadas + registro)
    03_Ediciones_autorizadas/        (Google Docs de lectura)
    04_Exportaciones_EPUB/          (ediciones principales validadas)
    04b_Exportaciones_PDF/          (opcional, si se autoriza)
    05_Portadas_y_creditos/         (piezas con autorización)
```
La estructura se implementará en Drive **sólo** tras aprobación. El repositorio GitHub conserva la **trazabilidad** y el control editorial; Drive sirve de lectura/distribución, no reemplaza los registros de autoría y canon.

## D. Control de versiones y publicación
1. Entrada: manuscrito firmado/aprobado, commit de referencia y ficha del capítulo; convertir al formato EPUB 3 reajustable tras validación.
2. Rama propia de Agente 04 para maquetación/registros, con una sola entrega principal WIP. Nunca editar rama del Escritor.
3. Documento de revisión: nomenclatura `CV_L1_CNN_REV_vNN`, derechos de acceso controlados; ninguna marca "publicado".
4. Revisión por Editor de Canon (ilustraciones), Historiador (IDs representados) y Arquitecto Editorial (EPUB de revisión); ejecutar EPUBCheck y pruebas en lectores reales.
5. La versión final recibe `CV_L1_CNN_EDICION_vNN` o `CV_L1_LIBRO_I_EDICION_vNN` **solamente tras autorización**.
6. Verificar que el EPUB alojado en Drive se descargue y abra en un lector compatible con los permisos previstos; registrar URL, ID de archivo, fecha, revisión de origen y estado `PUBLICADO_VERIFICADO`.
7. Correcciones futuras generan una edición nueva con changelog y revalidación; nunca sustituir silenciosamente texto o arte publicado.
8. Los créditos de los ilustradores no se inventan; revisar titularidad/licencias y atribución con el Arquitecto Editorial.

**No se crean cuentas nuevas, hosting, dominio, imprenta, suscripciones de maquetación ni servicios de IA para esta fase.** Apps y herramientas de Drive existentes bastan para probar un flujo sin costes nuevos.

## E. Plan de hitos
| Momento | Entregable | Requisito de entrada | Responsable que autoriza |
|---|---|---|---|
| Ahora | Inventario y plantilla | PR #705 consultada | Arquitecto Editorial revisa propuesta |
| Primer capítulo listo | Lista de escenas ilustrables | Ficha y capítulo aprobados | Escritor / Editor de Canon |
| Selección | Matriz de recursos y arte verificado | Correspondencia de IDs + evidencia aprobatoria | Arquitecto Editorial, VT2 si afecta canon |
| Piloto | EPUB 3 REV del capítulo | Arte y manuscrito congelados | Arquitecto Editorial |
| Evaluación | EPUBCheck y prueba EPUB en móvil/tablet/escritorio | Archivo interno, lectores de prueba | Arquitecto Editorial |
| Publicación | EPUB final en Drive y PDF opcional | Autorización expresa y permisos | Arquitecto Editorial |

## F. Bloqueos actuales y decisiones solicitadas
**Bloqueos:** no hay capítulo ni ficha aprobados; no consta validación visual completa de los recursos; no hay autorización para publicar, crear carpetas Drive ni modificar archivos del juego.

**Solicitar al Arquitecto Editorial** (sin urgencia para iniciar redacción):
1. Aprobar o ajustar identidad visual y lineamientos para un piloto.
2. Definir dónde se documentará la prueba de aprobación de cada recurso gráfico original (PR, manifiesto, enlace, revisor).
3. Cuando exista capítulo 001 aprobado, habilitar **una única maqueta piloto**, no el libro completo.
4. Elegir política de acceso al EPUB desde Drive (privado, enlace restringido o público) antes de publicar.

**Criterio de cierre:** el manuscrito manda; la maquetación desaparece tras la lectura.
