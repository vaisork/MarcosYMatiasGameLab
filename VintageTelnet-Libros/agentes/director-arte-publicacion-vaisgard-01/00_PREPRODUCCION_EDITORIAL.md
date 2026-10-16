# Agente 04 — Preproducción de arte y publicación
**Proyecto:** Crónicas de Vaisgard · Libro I *El primer camino* (provisional)  
**Responsable:** `director-arte-publicacion-vaisgard-01`  
**Estado:** PROPUESTA, sin autorización de maquetación definitiva ni publicación  
**Corte de consulta:** 14 de octubre de 2026; repo `vaisork/MatiasGameLab`, `main` y rama de [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705).

## 1. Mandato y límites
Este Agente 04 **integra tres funciones**: dirección de arte, maquetación y preparación de publicación. Es una consolidación explícita del encargo del propietario; el desglose previo de roles en el `VintageTelnet-Libros/AGENTS.md` de la PR #705 no obliga a crear más agentes. No asume tareas de escritura, historia, canon o programación. Sólo el Arquitecto Editorial autoriza diseño, textos finales, arte definitivo y publicación; cualquier fricción de canon o imagen que revele información protegida requiere revisión del Editor de Canon y, cuando corresponda, del Arquitecto VT2.

**WIP=1**: una entrega editorial principal en trabajo. Sin capítulo aprobado, esta PR es únicamente de preproducción; ninguna publicación en Drive ni manipulación de recursos de VT2.

## 2. Base editorial leída en PR #705
- `VintageTelnet-Libros/README.md`, `AGENTS.md`, `BIBLIA_EDITORIAL.md`, `POLITICA_DE_SECRETOS.md`.
- `plan/libro-01.md` (15 capítulos **propuestos**, NO aprobados); `plan/fichas-001-003.md` (fichas **no autorizadas**).
- La protagonista, su arco, la ruta exacta posterior a capítulo 3, la voz y las imágenes no están cerrados.
- Exigencia central: novela de aventura autónoma, cálida y legible para lectores de 10–14 años y adultos; **la ilustración acompaña al texto**.
- `vintage-telnet-2/AGENTS.md` y el contrato de contenido se consultan como fuentes vigentes. Una ilustración no autoriza afirmar un hecho del mundo.

## 3. Inventario comprobado de recursos en main
El archivo adjunto `INVENTARIO_ARTE_MAIN_2026-10-14.csv` registra **451 entradas**, con ruta, Git blob SHA, bytes y condición de miniatura. Se extrajeron árboles de GitHub y no se han reinterpretado ni recreado imágenes.

| Ubicación | Archivos | Tamaño normal/no miniatura | Miniaturas |
|---|---:|---:|---:|
| `client/art/places/` | 382 | 191 | 191 |
| `client/art/bestiary/` | 49 | 33 | 16 |
| `client/art/species/` | 5 | 5 | 0 |
| `client/art/encounters/` | 2 | 1 | 1 |
| `client/art/map/` | 2 | 1 | 1 |
| `client/art/players/` | 9 | 9 | 0 |
| Manifiestos JSON en `client/art/` | 2 | — | — |
| **Total** | **451** | **240 recursos no miniatura + 2 manifiestos** | **209** |

**Matiz técnico:** un archivo marcado "normal" es distinto de una miniatura por nombre; no se afirma resolución de impresión, ni que esté aprobado. SHA del CSV es **blob Git**, no hash SHA-256 del contenido. Algunos archivos con sufijos `-v2` o variantes requieren un control específico de versión.

**Fuentes de control localizadas:**
- `vintage-telnet-2/client/art/place-variants.json`: variantes de lugar, dependencias de estado y hashes SHA-256 específicos, **no aprobación global**.
- `vintage-telnet-2/client/art/bestiary-thumbnails.json`: miniaturas del bestiario.
- `vintage-telnet-2/client/ui-data.js`: asociación lógica sala → ilustración; exige cotejo de ID.
- `vintage-telnet-2/CONTENT_CONTRACT.md`: contrato de variantes y originales de producción fuera del repositorio.
- `art-masters/locations/` y `art-masters/creatures/`: hay PNG maestros adicionales; **NO** introducirlos directamente al libro sin validar si representan el mismo arte aprobado y su historia de aprobación.

**Evidencia de aprobación:** no se recuperó un registro único, verificable y por-archivo que permita certificar todas las imágenes. Por eso el CSV marca todas como `PENDIENTE_EVIDENCIA`, incluso las utilizadas en el videojuego. El inventario físico no equivale a licencia de uso final ni a aprobación. La selección concreta está en `01_SELECCION_PRELIMINAR_LIBRO_I.md`.

## 4. Identidad visual propuesta para la colección
**Decisión posterior del propietario (2026-10-14): EPUB 3 reajustable será la edición principal.** Google Docs queda opcional para edición/revisión y PDF sólo como derivado secundario autorizado. Véase `02_PLANTILLA_CAPITULOS_Y_PLAN_PUBLICACION.md`.
**Concepto:** "crónica de viaje": una novela contemporánea con materiales visuales de un mundo antiguo; sin interfaz de videojuego, estadísticas, escudos inventados ni ornamentos invasivos.

- **Cubiertas coherentes:** título de colección pequeño, título de libro predominante, ilustración original validada, autor/créditos reales sólo cuando estén autorizados. Sin prometer una portada específica antes de decidir la escena.
- **Paleta de maquetación:** papel blanco/marfil claro, texto carbón casi negro, un acento discreto de tono tierra/cobre. Propuesta de referencia `#FAF8F2`, `#242321`, `#906B52`; colores editoriales, NO modificación de la imagen.
- **Tipografía de lectura:** serif instalada y común como Georgia para narrativa; alternativa equivalente libre si la plataforma obliga. Títulos en serif clara o sans sobria; evitar tipografías fantasiosas. No depender de fuentes con licencia pagada.
- **Texto editable y lectura EPUB:** en Docs, comenzar pruebas de revisión con 12–13 pt e interlineado moderado; en EPUB 3 permitir que el lector ajuste tamaño, fuente e interlineado, sin medidas fijas. Párrafos respirables y separación de escenas `* * *` o símbolo simple.
- **Ritmo de ilustraciones:** una imagen de apertura *cuando aporte una nueva atmósfera*; otras sólo en cambios significativos de lugar, criatura o descubrimiento. Nunca una imagen por página por obligación.
- **Ubicación:** preferir imágenes completas, insertadas en línea entre bloques narrativos, manteniendo proporción; **no recortar ni recolorear** el contenido visual original. Pies de imagen breves y no enciclopédicos cuando sean necesarios.
- **Accesibilidad:** contraste alto, texto seleccionable, títulos con estilos estructurados y descripciones alternativas sin anticipar secretos. Evitar texto incrustado sobre imágenes.

## 5. Contrato previo a insertar una ilustración
1. Existe un **capítulo aprobado y congelado** y su ficha de escenas.
2. El Escritor entrega lista de momentos ilustrables; sin escoger arte definitivo.
3. El Historiador valida **lugar/especie/criatura** mediante IDs canónicos y cronología.
4. Agente 04 verifica recurso, manifiesto relevante, hash, dimensiones y encuadre; no confunde miniaturas con máster apto.
5. El Revisor de Canon valida que la imagen no contradiga el texto ni revele información reservada. **No reproducir secretos reservados** siquiera en descripciones alternativas o nombres de archivo de difusión.
6. El Arquitecto Editorial marca **APROBADO_PARA_LIBRO** en el registro por escena.
7. Agente 04 crea **copia de uso** sin alterar original, con escala proporcional y conversión de formato sólo si es técnicamente necesaria y visualmente fiel.
8. Integra el **texto íntegro y congelado**, maqueta, revisa móvil/tableta/escritorio; publica sólo tras autorización expresa.

Si falta arte: registrar `SIN_RECURSO_VALIDADO` y recomendar capítulo **sin ilustración** hasta decisión. Prohibido generar sustitutos por iniciativa propia.

## 6. Checklist de aceptación
- [ ] Biblia, ficha, capítulo y versión final identificados.
- [ ] Mapeo del recurso con escena y ID del mundo verificado.
- [ ] Fuente exacta, Git SHA o SHA-256, dimensiones, aprobación y responsable registrados.
- [ ] Ningún secreto o anacronismo visual.
- [ ] Originales de `vintage-telnet-2/` sin modificaciones.
- [ ] Ningún texto del autor ha sido reescrito durante la maquetación.
- [ ] Índice navegable y tipografía cómoda en móvil real; pruebas de imágenes y exportación.
- [ ] EPUB 3 reajustable validado con EPUBCheck y lectura real; Docs para edición opcional y PDF derivado sólo si procede.
- [ ] Fecha, versión, acceso y enlace de Drive comprobados **después** de publicar.

## 7. Estado al cierre de esta propuesta
**Hecho:** estudio documental de PR #705, localización física y registro SHA de imágenes, identidad editorial propuesta, plantilla y plan de edición principal EPUB 3.  
**No hecho:** certificación individual de aprobación, inspección visual completa de cada imagen, maquetación de capítulo, subida a Drive, PDF final, liberación al público.  
**Dependencias:** capítulo/ficha aprobados y responsable de validación de arte; prueba real de lectura y permiso editorial antes de publicar.  
**Siguiente consumidor:** Arquitecto Editorial Principal; Editor de Canon/Arquitecto VT2 sólo cuando la imagen seleccionada afecte material compartido.
