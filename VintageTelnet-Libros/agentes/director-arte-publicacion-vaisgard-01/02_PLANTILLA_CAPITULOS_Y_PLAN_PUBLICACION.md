# Plantilla de capítulos ilustrados y plan de distribución
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
2. **Comienzo de capítulo**: título con estilo "Encabezado 1" o "Encabezado 2" real, número, espacio visual antes del texto. Imagen de apertura **opcional**, jamás obligatoria.
3. **Cuerpo narrativo**: párrafos tal como fueron aprobados; texto oscuro sobre fondo claro, alineación preferente a la izquierda o justificada sólo si no crea ríos, guiones manuales ni columnas.
4. **Secciones de escena**: transición simple `* * *` o espacio pautado, sin artificios decorativos.
5. **Ilustraciones interiores**: bloque entre dos párrafos completos, imagen insertada en línea, escala proporcional y texto alternativo libre de spoilers.
6. **Final**: cierre natural del capítulo. No intercalar ficha técnica ni "desbloqueaste"/datos de videojuego.
7. **Navegación digital**: índice enlazado a estilos reales, no simulados por tamaños manuales. En PDF usar marcadores si el flujo de exportación los conserva.

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

## B. Pruebas reales de lectura: Google Docs frente a PDF
| Criterio | Google Docs | PDF exportado |
|---|---|---|
| Continuidad y cambios aprobados | Fuerte: edición colaborativa, historial y comentarios | Fuerte para **congelar**, pero no para modificar |
| Lectura en teléfono | **Candidato principal**: explorar visualización móvil y modo de lectura disponible; comprobar que no exija zoom constante | Páginas fijas pueden obligar a hacer zoom; validar en pantalla pequeña |
| Tablet/escritorio | Generalmente cómodo, depende del diseño | Consistencia visual alta |
| Navegación | Encabezados/sumario navegable | Índice y marcadores sólo si exportación funciona |
| Imágenes WebP de origen | **Prueba de compatibilidad real obligatoria**; convertir copia a PNG/JPG sólo si hace falta, sin modificar apariencia | Generarlo desde la misma copia validada |
| Descarga/lectura offline | Depende de permisos y configuración de app de Drive | Portable y muy estable en formato |
| Coste | Evitar complementos y suscripciones | Exportar desde Docs sin herramientas de pago |

**Decisión inicial propuesta:** mantener **un Google Doc aprobado como edición principal de lectura en Drive** y ofrecer **PDF descargable como derivado** sólo cuando supere prueba de legibilidad. No anunciar un único formato ganador antes de ensayar, ni afirmar que PDF refluye.

### Prueba de aceptación por capítulo
- [ ] Abrir en Android teléfono, tablet y navegador de escritorio, con cuenta lectora autorizada.
- [ ] Leer al menos un capítulo piloto completo, sin zoom/reencuadre sistemático en teléfono.
- [ ] Comprobar párrafos, cortes de escena, encabezados, índice y navegación.
- [ ] Confirmar que imágenes no se ven pixeladas ni se escalan fuera de ancho; sin crops ni filtros.
- [ ] Comprobar conversión WebP en documentos si aplica; comparar con imagen fuente.
- [ ] Exportar y abrir PDF para detectar viudas, huérfanas, márgenes y páginas en blanco.
- [ ] Verificar créditos, confidencialidad y estado de aprobación; control visual de secretos.
- [ ] Registrar incidencias y aprobación editorial **antes** de compartir versión final.

## C. Estructura propuesta en Drive (NO creada)
```text
Crónicas de Vaisgard/
  Libro I — El primer camino/
    00_Manuscritos_aprobados/       (solo acceso editorial)
    01_Maquetas_en_revision/         (versiones de prueba sin distribución)
    02_Arte_y_trazabilidad/          (copias de uso autorizadas + registro)
    03_Ediciones_autorizadas/        (Google Docs de lectura)
    04_Exportaciones_PDF/           (derivados de versiones autorizadas)
    05_Portadas_y_creditos/         (piezas con autorización)
```
La estructura se implementará en Drive **sólo** tras aprobación. El repositorio GitHub conserva la **trazabilidad** y el control editorial; Drive sirve de lectura/distribución, no reemplaza los registros de autoría y canon.

## D. Control de versiones y publicación
1. Entrada: manuscrito firmado/aprobado, commit de referencia y ficha del capítulo.
2. Rama propia de Agente 04 para maquetación/registros, con una sola entrega principal WIP. Nunca editar rama del Escritor.
3. Documento de revisión: nomenclatura `CV_L1_CNN_REV_vNN`, derechos de acceso controlados; ninguna marca "publicado".
4. Revisión por Editor de Canon (ilustraciones), Historiador (IDs representados) y Arquitecto Editorial (maqueta).
5. La versión final recibe `CV_L1_CNN_EDICION_vNN` o `CV_L1_LIBRO_I_EDICION_vNN` **solamente tras autorización**.
6. Verificar primero que el Doc/PDF se abre desde el enlace exacto de Drive con los permisos previstos, luego registrar URL, ID de archivo, fecha, revisión de origen y estado `PUBLICADO_VERIFICADO`.
7. Correcciones futuras generan una edición nueva con changelog y revalidación; nunca sustituir silenciosamente texto o arte publicado.
8. Los créditos de los ilustradores no se inventan; revisar titularidad/licencias y atribución con el Arquitecto Editorial.

**No se crean cuentas nuevas, hosting, dominio, imprenta, suscripciones de maquetación ni servicios de IA para esta fase.** Apps y herramientas de Drive existentes bastan para probar un flujo sin costes nuevos.

## E. Plan de hitos
| Momento | Entregable | Requisito de entrada | Responsable que autoriza |
|---|---|---|---|
| Ahora | Inventario y plantilla | PR #705 consultada | Arquitecto Editorial revisa propuesta |
| Primer capítulo listo | Lista de escenas ilustrables | Ficha y capítulo aprobados | Escritor / Editor de Canon |
| Selección | Matriz de recursos y arte verificado | Correspondencia de IDs + evidencia aprobatoria | Arquitecto Editorial, VT2 si afecta canon |
| Piloto | Maqueta REV del capítulo | Arte y manuscrito congelados | Arquitecto Editorial |
| Evaluación | Prueba móvil, tablet, PDF | Enlaces internos, usuarios de prueba | Arquitecto Editorial |
| Publicación | Doc final y derivado PDF, si procede | Autorización expresa y permisos | Arquitecto Editorial |

## F. Bloqueos actuales y decisiones solicitadas
**Bloqueos:** no hay capítulo ni ficha aprobados; no consta validación visual completa de los recursos; no hay autorización para publicar, crear carpetas Drive ni modificar archivos del juego.

**Solicitar al Arquitecto Editorial** (sin urgencia para iniciar redacción):
1. Aprobar o ajustar identidad visual y lineamientos para un piloto.
2. Definir dónde se documentará la prueba de aprobación de cada recurso gráfico original (PR, manifiesto, enlace, revisor).
3. Cuando exista capítulo 001 aprobado, habilitar **una única maqueta piloto**, no el libro completo.
4. Elegir política de acceso de lectores en Drive (privado, enlace restringido o público) antes de publicar.

**Criterio de cierre:** el manuscrito manda; la maquetación desaparece tras la lectura.
