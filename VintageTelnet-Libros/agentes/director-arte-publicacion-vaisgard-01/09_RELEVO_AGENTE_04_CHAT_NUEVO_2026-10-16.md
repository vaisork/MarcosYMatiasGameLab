# RELEVO OPERATIVO — Director de Arte/Publicación 04, sesión nueva

**Fecha de corte:** 2026-10-16. **Fuente de verdad:** GitHub remoto `vaisork/MatiasGameLab`, PR editorial **[#708](https://github.com/vaisork/MatiasGameLab/pull/708)**, rama `editorial/cronicas-vaisgard-agente-04-preproduccion`. **Arquitectura Editorial:** coordinación/decisiones en PR #705. **No abrir otra PR o rama sin petición**. Este documento permite una nueva conversación sin arrastrar el chat agotado.

## Producto ENTREGADO, no rehacer

EPUB privado **v03**: `VintageTelnet-Libros/agentes/director-arte-publicacion-vaisgard-01/prelecturas/CV_L1_PRELECTURA_V03_ILUSTRADA_PROLOGO_C001_C012.epub`.

- **Prólogo + C001–C012 íntegros, 6 ilustraciones originales incrustadas**, portada/portadilla tipográfica, índice EPUB 3, texto reajustable. **Git blob `065213cb3bd6a4e4b5a69fcbbd02fc59e3834166`**, **2.327.579 bytes**.
- Registro exhaustivo **`08_ACTA_EPUB_V03_ILUSTRADO_C001_C012_2026-10-16.md`**, blob `c3df74d6fbf1f4f3d3c5c44380b4cdede4223b2e`; contiene todos los SHA de prólogo y 12 capítulos, imágenes y QA, y es el punto de entrada técnico. **No leer de nuevo los 13 manuscritos solo para recordar el estado**.
- Arte V01/V02/V03/V04/V05/V08 autorizado provisionalmente para **prelectura PRIVADA** en [comentario de Arquitectura Editorial](https://github.com/vaisork/MatiasGameLab/pull/708#issuecomment-6202753571). Más ilustraciones C004–C012 requieren examen/permiso concreto; **no bloquean la lectura del v03**.
- QA interno declarado: ZIP/CRC, mimetype, OCF, TOC 14 entradas y 6 WebP incrustados. **NO certificados** EPUBCheck externo, apertura física Android, compatibilidad WebP en lector concreto, ni transferencia a Drive.

## PROBLEMA REAL Y SIGUIENTE ÚNICO WIP

**El dueño NO PUEDE DESCARGAR el EPUB desde la app Android de GitHub («Download raw» no aparece).** Tiene el archivo en GitHub pero NO una copia Drive. Esta es la prioridad número uno, por encima de otro EPUB o imágenes nuevas.

**Objetivo:** poner al alcance del propietario **exactamente los bytes del EPUB v03** (verificar tamaño y si es viable SHA) como archivo abrible y descargable fuera de la vista `blob` de GitHub, preferiblemente en su carpeta Drive **PRIVADA** [«Crónicas de Vaisgard — Prelecturas EPUB»](https://drive.google.com/drive/folders/1GoGePI5CDOJ2nZppO8fOOgDJX6KrO5UD), ID `1GoGePI5CDOJ2nZppO8fOOgDJX6KrO5UD`. **No crear carpeta duplicada ni compartir públicamente**.

**Bloqueo técnico previo:** conector GitHub no entregó bytes binarios o `file_uri` compatible; Drive `upload_file` requiere `file_uri`, no URL GitHub, HTML ni base64 a mano. **No declarar copia realizada si no se ve en Drive.** Usar método binario real, p. ej. sesión autenticada en Ubuntu/Raspberry del usuario con `gh`/Git y subida desde navegador/Drive, o descarga en navegador Chrome con autenticación donde corresponda. Si se necesita acción local, entregar **instrucción mínima, verificable**, no largas alternativas ni asumir acceso al equipo. Ofrecer prueba de apertura del EPUB solo cuando se haga. Un enlace web a GitHub no es prueba de descarga móvil.

## Flujo sostenido, ahorro de contexto

1. **Al abrir cada nuevo chat**, leer SOLO este relevo y el estado ACTUAL de PR #708; si ha cambiado, actualizarlo. Leer acta `08...` para SHAs si hace falta, no transcribir los capítulos.
2. **WIP=1:** UNA tarea por vez; ahora acceso real a v03/Drive, sin comenzar v04 ni seleccionar 100 imágenes a la vez. Si Arquitectura Editorial dicta nueva prioridad, registrar aquí sustitución y motivo.
3. **No imprimir** inventarios de 240 imágenes ni cuerpos de capítulos, grandes JSON, blobs base64 o log de ZIP en mensajes: registrar resultados en GitHub y aquí **3–6 líneas** con entregable, SHA, QA hecho, bloqueo real, próximo paso.
4. **Cuando haya capítulos nuevos:** tomar SOLO los manuscritos aprobados literariamente desde la rama remota de Escritor [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705), no del historial de un chat ni de índice viejo. Consultar [Editor #707](https://github.com/vaisork/MatiasGameLab/pull/707) para SHA corregido. Crear nueva versión incremental sin sobrescribir v03; no relanzar toda la preproducción.
5. **Canon:** Arquitecto Editorial+Arquitecto VT2 pendientes antes de merge/edición DEFINITIVA. Prelectura privada autorizada no es publicación final. No editar textos literarios del Escritor ni código/arte fuente del juego.
6. **Estado de la literatura al corte:** C001–C012 aprobados literariamente; C013 solo autorizado, no incluir hasta aprobación específica. **Reconstruir estado leyendo PR #705**, no confiar en este dato si aparece algo más nuevo.

## Mensaje de arranque recomendado para chat sucesor

> Eres el **Director de Arte y Publicación — Agente 04, relevo** de *Crónicas de Vaisgard*. Tu fuente oficial es `vaisork/MatiasGameLab` PR #708 en la misma rama. Lee **PRIMERO** este archivo `09_RELEVO_AGENTE_04_CHAT_NUEVO_2026-10-16.md` y después `08_ACTA_EPUB_V03_ILUSTRADO_C001_C012_2026-10-16.md`. No empieces de cero: el EPUB v03 con 12 capítulos y seis imágenes YA EXISTE. Tu único objetivo inmediato es **entregarme el EPUB v03 de forma descargable y ponerlo en mi carpeta privada Drive si puedes hacerlo realmente**. Evita menús GitHub Android que no existen. No sobrescribas el archivo, no crees PR ni carpetas adicionales, no publiques una edición definitiva. Usa el mínimo contexto: resultados extensos en GitHub, respuestas breves aquí. Informa acciones realmente verificadas y bloqueos concretos.
