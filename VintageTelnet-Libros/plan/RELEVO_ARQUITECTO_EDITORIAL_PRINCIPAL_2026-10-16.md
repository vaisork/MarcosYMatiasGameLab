# RELEVO — Arquitecto Editorial Principal de *Crónicas de Vaisgard*

**Fecha de corte:** 16 de octubre de 2026 (México).  
**Proyecto:** Libro I, título provisional *El primer camino*.  
**Repositorio único:** [vaisork/MatiasGameLab](https://github.com/vaisork/MatiasGameLab), carpeta `VintageTelnet-Libros/`.  
**Lugar de decisiones editoriales:** [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705), rama existente `editorial/cronicas-vaisgard-agente-01-voz`, en `VintageTelnet-Libros/plan/`. No abrir otra PR o rama para relevo sin encargo.  
**Fuente de canon del juego:** `vintage-telnet-2/`, preferir remoto actualizado. El libro es una obra independiente, no genera automáticamente quests, NPCs, regiones, flags ni cambios al juego.

## 1. Misión del Arquitecto Editorial

Dirigir **estructura, calidad literaria, ritmo, continuidad, autorizaciones de capítulo, coordinación entre agentes y límites de canon**. Autorizar una sola pieza WIP por agente; aprobar literariamente una versión exacta **tras** leer su texto y dictamen editor, registrando SHA de GitHub. Decidir fichas del siguiente capítulo y mantener dependencias. No sustituir al Escritor con redacción paralela ni al Publicador con EPUBs. No fusionar ni autorizar edición definitiva sin acuerdo de canon Arquitecto Editorial + Arquitecto VT2. Dudas de canon compartido van **dentro de la PR**, con fuente, tensión, propuesta, decisión, alcance y responsable; una contradicción abierta bloquea fusión.

**Equipo:**
- **01 Escritor de Aventuras** — [PR #705](https://github.com/vaisork/MatiasGameLab/pull/705). Manuscritos y matrices; WIP=1.
- **02 Historiador y Documentalista** — [PR #706](https://github.com/vaisork/MatiasGameLab/pull/706). Fuentes VT2 y compatibilidad localizada; evitar atlas nuevos sin necesidad.
- **03 Editor Integral y Revisor de Canon** — [PR #707](https://github.com/vaisork/MatiasGameLab/pull/707). Dictámenes completos y microcorrecciones directamente en rama #705 con permiso expreso ya otorgado por el propietario, dejando SHA; sin rediseñar la trama.
- **04 Director de Arte y Publicación** — [PR #708](https://github.com/vaisork/MatiasGameLab/pull/708). Maqueta, EPUB, arte autorizado y publicación técnica, nunca altera relato ni juego.
- **Arquitecto VT2** — correvisión y coautoridad sobre hechos/canon reutilizables; su silencio **no** equivale a aprobación.

**Reglas del propietario:** avances cortos por chat y documentos completos en GitHub; sin ciclos de revisión inútiles; **no terminar capítulos abruptamente para coincidir con la ficha ni estirarlos para una cuota**. Público de 10–14 años y adultos; novela vívida, no enciclopedia ni diario de quests. Mantener 15 capítulos + prólogo como **meta provisional** del propietario; proponer ajuste antes de recortar y nunca forzar el ritmo.

## 2. Estado literario real al corte

- **Prólogo y C001–C013 ya redactados**; **C001–C013 APROBADOS LITERARIAMENTE por Arquitectura Editorial** con las correcciones del Revisor 03 incorporadas. No reabrir por rutina. No implica coaprobación del canon VT2 ni publicación definitiva.
- **Último capítulo cerrado:** **C013 «Una ruta propia»**, manuscrito vigente `VintageTelnet-Libros/capitulos/013-una-ruta-propia.md` **blob `4b8dd7beb6dc4289470b4301fa8d955d9a69126a`**; matriz **`1e5e0c251da8abf23fcc80e3cca677e48ac0c309`**. Revisor #707 y Historiador #706 cotejaron; Arquitectura Editorial lo aprobó expresamente en [comentario de cierre #705](https://github.com/vaisork/MatiasGameLab/pull/705#issuecomment-6210771621).
- **ÚNICO WIP DEL ESCRITOR autorizado:** **C014 «Lo que dejamos pendiente»**, aún no registrado como entregado al corte. La [ficha vinculante C014](DECISION_CIERRE_C013_Y_AUTORIZACION_C014_2026-10-16.md) es la fuente obligatoria; **C015 NO autorizado**. Verificar el HEAD y comentarios remotos de #705 antes de decidir, pues el escritor trabaja en paralelo.

**Punto narrativo de salida exacto:** día 3, Lera salió por `veyra_puerta_campos` acompañando parcialmente un carro de grano hacia Edran. Todavía **no llegó al hito/arroyo, no cruzó las tres piedras ni llegó a Valdren**. La ruta inversa pasa por `edran_hito_campos`, `edran_calzada`, `edran_casa_camino`, `edran_terraplen`, `edran_era`, `edran_zanja_antigua`, `edran_surcos`, `edran_acequia` y `edran_salida_huertos` antes de `valdren_huertos`. El conductor no garantiza llevarla hasta Valdren; no inventar cómo atraviesa un carro grande las tres piedras peatonales del arroyo.

**Foco dramático C014:** consecuencia humana tangible y obligación frente a **Mara, Sabel y la canaleta/turnos de Valdren**; conversación con Mara si es posible con viaje y reloj verosímiles, **no otro capítulo largo de caminar/recordar**. Tampoco forzar corte a mitad de escena para reservar desenlace a C015. El conflicto con Dalia sigue siendo el eje emocional: Lera no la ha hallado, ella no debe ser forzada a perdonar, reaparecer por casualidad ni servir de recompensa. Antes de aprobar C014 exigir avance causal y cierre orgánico.

**Inventario y cronología:** la carta íntima a **Dalia está con Lera** sin entregar; la nota de C012 a **Mara está con Arel en Vaisgard** pendiente de salida, sin acuse; el recorte con nombre de C008 **está con Nara**, sin acuse. Ambos atardeceres prometidos se cumplieron en C010–C011. En el camino conserva carboncillo, taza de asa torcida, cantimplora con agua restante, bolsa de correa anudada provisionalmente, bota/media casi secas, mano irritada, hombro sensible, sellos limitados. Ni empleo permanente ni regreso gratuito.

## 3. Riesgos de canon no resueltos

**Separar aprobación literaria de ratificación de canon compartido** (Arquitectura Editorial + VT2). En [PR #706](https://github.com/vaisork/MatiasGameLab/pull/706) hay notas y consultas. Bloqueos antes de fusión o difusión final:
1. Prólogo inspirado en VT1: Vaisgard antigua y origen **desconocido**, cinco especies y regiones; no fijar fundador, guerra ni historia reservada.
2. **Lera, Dalia, Mara, Sabel, Iven, Nara** y recuerdos/eventos íntimos se proponen como **solo novela**, sin NPC, quest o flag por implicación.
3. Roles públicos de Aren, Bela, **Seli** (remendadora de toldos que cose ocasionalmente una capa) y **Arel** (mensajera Vesperi). El pago episódico de sellos por custodia de nota a Mara se tolera **provisionalmente para prelectura privada**; no representa tarifa ni servicio universal del juego.
4. Divergencia **Saltalodo Edran/Lethra** entre fuentes VT2; mantenerla sin resolver ni canonizar en la novela por accidente.
5. Conductor/carro y geografía Edran; no inventar un puente o mecánica de ruedas por tres piedras.

Registrar en la PR la **co-decisión expresa** sobre cada tensión; para transferir aportes del libro al juego se requiere otro contrato de implementación, no fusión tácita.

## 4. Publicación: ya existe EPUB ilustrado, NO rehacer

En [PR #708](https://github.com/vaisork/MatiasGameLab/pull/708) se generó realmente el **EPUB v03 ILUSTRADO**, con **Prólogo + C001–C012 completos y seis imágenes VT2 incrustadas**. Binario `prelecturas/CV_L1_PRELECTURA_V03_ILUSTRADA_PROLOGO_C001_C012.epub`, **2.327.579 bytes**, Git blob **`065213cb3bd6a4e4b5a69fcbbd02fc59e3834166`**. [Acta 08 de fuentes/QA](../agentes/director-arte-publicacion-vaisgard-01/08_ACTA_EPUB_V03_ILUSTRADO_C001_C012_2026-10-16.md) y [relevo Agente 04](../agentes/director-arte-publicacion-vaisgard-01/09_RELEVO_AGENTE_04_CHAT_NUEVO_2026-10-16.md). El arte V01/V02/V03/V04/V05/V08 fue autorizado **solo para prelectura privada**. EPUB 3 reflowable es el formato principal, PDF sólo secundario.

**Bloqueo principal del usuario:** no puede descargar el `.epub` desde la app GitHub de Android; el archivo todavía **NO está verificado en Drive privado**. Carpeta personal correcta [Crónicas de Vaisgard — Prelecturas EPUB](https://drive.google.com/drive/folders/1GoGePI5CDOJ2nZppO8fOOgDJX6KrO5UD). La transferencia conectores GitHub→Drive ha fallado por ausencia de un `file_uri` binario compatible. **El Agente 04 de relevo tiene como único WIP entregar el archivo descargable/Drive, no rehacer v03 ni retrasarlo esperando capítulos 13–15**. No decir al usuario “Download raw en app” porque ya comprobó que no le aparece. No declarar EPUBCheck, descarga Android ni carga Drive sin prueba real. No abrir otra PR o carpeta, ni compartir públicamente. Futuras versiones incrementales de EPUB únicamente después de resolver acceso.

## 5. Primeros pasos del Arquitecto sucesor

1. Leer este documento, [ficha C014](DECISION_CIERRE_C013_Y_AUTORIZACION_C014_2026-10-16.md) y **solo los comentarios recientes** de PRs #705–#708 para novedades. No volcar manuscritos largos al chat.
2. Comprobar si Escritor #705 entregó C014 **sobre SHA actual**, asignar/confirmar dictamen de #707 y cotejo solo si necesario de #706. **Si no existe todavía, no inventar recepción ni autorizar C015.**
3. Tras dictamen, leer **C014 completo una vez**, decidir aprobación o cambios concretos, y solo entonces fichar/autorizAR C015 si el arco realmente lo necesita y el cierre orgánico lo permite.
4. Reiterar pedido de co-decisión real a Arquitecto VT2 en la PR, sin asumir firma y sin fusionar borradores.
5. Mantener #708 enfocado en acceso efectivo del EPUB v03 privado y evitar encargar una nueva versión que vuelva a postergar la lectura.
6. Redactar avances y decisiones completos en GitHub; al propietario informar en **3–6 líneas** qué se aprobó, qué se entregó y qué está pendiente.

## Mensaje de inicio sugerido para el próximo chat

> Eres el **Arquitecto Editorial Principal — Agente de relevo** de *Crónicas de Vaisgard*. Continúas en `vaisork/MatiasGameLab`, carpeta `VintageTelnet-Libros/`. Lee primero `plan/RELEVO_ARQUITECTO_EDITORIAL_PRINCIPAL_2026-10-16.md` y la ficha `plan/DECISION_CIERRE_C013_Y_AUTORIZACION_C014_2026-10-16.md` en PR #705; después revisa solo comentarios nuevos de PRs #705–#708. **No empieces de cero:** prólogo y C001–C013 existen; C001–C013 están aprobados literariamente, C014 es el único WIP autorizado y C015 no. El Publicador #708 ya creó EPUB v03 ilustrado con C001–C012; su prioridad es entregarlo para lectura Android/Drive privado, no rehacerlo. Dirige a Escritor #705, Historiador #706, Editor #707 y Publicador #708 con WIP=1 por agente. Conserva canon VT2 y exige validación conjunta antes de fusión o publicación definitiva. No reabras capítulos cerrados sin un conflicto nuevo concreto ni cortes/infles el desenlace por meta de 15 capítulos. Trabaja con remoto GitHub como fuente única y mantén decisiones allí. Aquí responde breve: avance, decisiones, pendientes.
