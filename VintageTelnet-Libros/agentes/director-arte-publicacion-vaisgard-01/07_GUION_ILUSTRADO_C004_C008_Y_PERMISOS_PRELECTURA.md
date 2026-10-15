# Plan editorial de ilustración — capítulos 004 a 008

**Proyecto:** *Crónicas de Vaisgard*, Libro I *El primer camino*.  
**Responsable:** Agente 04 · [PR #708](https://github.com/vaisork/MatiasGameLab/pull/708).  
**Fecha de corte:** 15/10/2026.  
**Estado:** **GUION PROPUESTO, NO IMÁGENES INTEGRADAS NI APROBADAS INDIVIDUALMENTE PARA EDICIÓN FINAL**.

## Base y límites

- **Texto literario fuente:** rama `editorial/cronicas-vaisgard-agente-01-voz`, [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705). C001–C008 tienen aprobación literaria; C009 bajo lectura/cierre Editorial.
- **Arte candidato:** originales del juego en `vintage-telnet-2/client/art/`; los nombres, rutas, tamaños y SHA citados provienen del [inventario de arte de PR #708](INVENTARIO_ARTE_MAIN_2026-10-14.csv). **Aquí no se declara inspección visual de estos nuevos candidatos**: se validó su existencia registrada, y aún deben abrirse y cotejarse imagen por imagen antes de incrustarlos.
- **Permiso de prelectura privada recibido del Arquitecto Editorial (comentario #708 del 15/10 21:34 UTC):** V01 Vaisgard, V02 Valdren, V03 huertos, V04 pozo, V05 salida de huertos, V08 Espinajo; ese permiso es **solo prelectura privada**, **no edición final**. Los candidatos C004–C008 **no quedan autorizados por extensión**.
- Mantener una densidad de **0–2 recursos por capítulo**. Para la v02 entregada el texto completo prevalece sobre la imagen; **el EPUB v02 es tipográfico, todavía sin arte**.
- No atribuir a Lera, Dalia, Mara, Sabel, Iven o Nara el aspecto de personas incidentales de ilustraciones. No incluir capturas de UI, mapas que permitan navegar secretos ni fotos de personajes nuevos.
- **Regla de revelación:** situar la imagen después de que el texto describa el lugar o criatura; la única excepción es una imagen ambiental inicial de un lugar ya conocido. Las ilustraciones no deben anunciar futuros destinos, NPC ni hallazgos.

## Selección candidata C004–C008 (pendiente cotejo visual y permisos)

| Capítulo | Escena/nodo textual verificable | Archivo original propuesto (ruta desde raíz del repositorio) | Git blob SHA | Ubicación y riesgo |
|---|---|---|---|---|
| **004** *El lenguaje de las huellas* | Lera reconoce zanja antigua y losa; ve la herramienta y examina huellas | `vintage-telnet-2/client/art/places/edran_zanja_antigua-anime-v1.webp` | `41b1b4e66da19210e69bccf7c046679166b36f73` | **Una ilustración** después de la primera descripción de zanja. Cotejar que la imagen no sugiera entrada/tesoro secreto ni retrate al interlocutor de ficción |
| **004** (alternativa) | Paso posterior por Era del Trigo hacia el terraplén | `vintage-telnet-2/client/art/places/edran_era-anime-v1.webp` | `fefb00d12ee4faf157780ca3daa4741989b991ae` | Opcional, elegir entre era y zanja si el capítulo queda fragmentado |
| **005** *Una historia a medias* | Carga y tensión en terraplén, antes de Casa del Camino | `vintage-telnet-2/client/art/places/edran_terraplen-anime-v1.webp` | `3d749453e426112ff35d4b7618f65f9c8750aad0` | Interior **después** de establecer el lugar, sin hacer pasar anónimos como protagonistas |
| **005** (preferencia de una sola imagen) | Entrada a Casa del Camino y conversación con Aren | `vintage-telnet-2/client/art/places/edran_casa_camino-anime-v1.webp` | `c2b39e0dbd46c626f842acd76b309a5afef749a5` | Cotejar momento exacto: se ve tejado antes de la casa completa; no usar imagen de casa antes de que la prosa alcance la escena |
| **006** *El camino no espera* | Tramo de calzada, reparaciones, lluvia | `vintage-telnet-2/client/art/places/edran_calzada-anime-v1.webp` | `c226a49c7de21a594ebf2bd91549bab113e6ebad` | Ilustración ambiental tras describir la calzada; no anticipar arco urbano |
| **006** (alternativa) | Tres piedras y paso del arroyo junto al hito | `vintage-telnet-2/client/art/places/edran_hito_campos-anime-v1.webp` | `4767ebf1323cd43fad5da8520d44754c3d8a3515` | **Alto riesgo visual:** desde el hito **NO** deben verse murallas ni puerta. Si en la ilustración se ven, **rechazar**; no recortar para fabricar canon |
| **006** (cierre) | Lera cruza el arco y ve por primera vez Vaisgard | `vintage-telnet-2/client/art/places/veyra_puerta_campos-anime-v1.webp` | `7444d995296fee6609f15a8f7abe5f956536765e` | Colocar sólo **después** de la revelación del arco. Evitar imágenes de muralla en la sección anterior |
| **007** *Entre cargas y nombres* | Calle de los Almacenes, giro de carga, barrio poblado | `vintage-telnet-2/client/art/places/veyra_barrio_cargas-anime-v1.webp` | `ad8fa5f58d5cbd77c479b3e94653bbf72f60b3d4` | Una imagen de ambiente tras entrar al barrio, no recrear el incidente del carro como suceso canónico |
| **008** *La plaza de las cinco rutas* | Primera entrada por norte de Mercado y vista de las cinco rutas | `vintage-telnet-2/client/art/places/veyra_plaza_rutas-anime-v1.webp` | `2605de07804f3763024c36a7697a813f73fba1be` | Apertura visual después de la descripción de plaza; **no** inferir cronología/fundador de piedras |
| **008** (opcional) | Entrada oeste al Patio de los Animales y charla con Nara | `vintage-telnet-2/client/art/places/veyra_patio_porte-anime-v1.webp` | `928ba6a23556da22d3d2b7a2abfbe3175482733c` | Solo después de entrar al patio; no señalar que cualquier figura del arte es Nara ni que Dalia estuvo allí |

### C009: reserva informativa, no en EPUB v02
El escritor redactó C009 en [#705](https://github.com/vaisork/MatiasGameLab/pull/705), y el editor emitió dictamen favorable en [#707](https://github.com/vaisork/MatiasGameLab/pull/707); al corte falta decisión literaria de Arquitectura Editorial y ratificación VT2 para edición definitiva. Candidato documentado, **no aprobado**: `vintage-telnet-2/client/art/places/veyra_patio_senales-anime-v1.webp`, blob `b012a74dd936c3791b2da6a6e6389e5e75641be8`. Insertar solo al ingresar a `veyra_patio_senales`, nunca presentar el arte como prueba de que Arel localiza o recibió carta de Dalia.

## Siguiente control de calidad del arte

1. **Abrir imágenes concretas**, cotejar visualmente composición contra el punto de vista del capítulo y clasificar `ACEPTABLE_PRELECTURA / RECHAZAR / REQUIERE_CORRECCIÓN_DE_CANON`. El solo inventario **no** satisface este paso.
2. Pedir confirmación de uso privado por archivo nuevo **C004–C008** a Arquitectura Editorial, especialmente hito/puerta C006 y seres/personas en C008.
3. Después de aprobación, crear **copias** JPEG/PNG/WebP compatible de assets del juego, verificar bytes y ruta, añadir `alt` sin spoilers; no modificar los originales ni mostrar imágenes de criaturas antes de describirlas.
4. Probar posicionamiento y escalado en EPUB reflowable, con lector Android y EPUBCheck independiente. Registrar resultados reales, sin declarar `QA_APROBADO` anticipadamente.
5. Para edición final, co-decisión de canon Arquitectura Editorial + VT2, créditos y autorización de publicación por propietario. **No inferir permiso final del permiso de prelectura privada.**

## Conexión con entrega
- [EPUB v02 completo, prosa sin ilustraciones](prelecturas/CV_L1_PRELECTURA_V02_PROLOGO_C001_C008.epub).
- [Acta v02 con fuentes SHA y QA](06_ACTA_PRELECTURA_V02_C001_C008_2026-10-15.md).
- [Guion visual V01–V08 previamente inspeccionados](04_REVISION_VISUAL_Y_GUION_DE_ILUSTRACIONES_LIBRO_I.md).
