# Guion visual revisado — Libro I, *El primer camino*

**Agente:** Director de Arte y Publicación Editorial 04 · **PR:** [#708](https://github.com/vaisork/MatiasGameLab/pull/708)  
**Fecha de corte:** 14 de octubre de 2026 (México) / 15 de octubre UTC.  
**Lectura fuente:** [#705](https://github.com/vaisork/MatiasGameLab/pull/705), prólogo y C001/C002/C003; continuidad de C003 y canon en #706; dictámenes en #707.  
**Estado global:** **REVISIÓN VISUAL EFECTUADA / SELECCIÓN ARTÍSTICA PROPUESTA / PERMISO DE USO EN EDICIÓN DEFINITIVA PENDIENTE.**

## 1. Dirección artística que aplicaremos
Este libro debe leerse como una **novela ilustrada**, no como capturas de un videojuego ni catálogo de criaturas:
- Una ilustración de apertura por sección cuando el lugar sea reconocible; más piezas interiores **solamente** donde la escena tenga cambio claro de espacio o intensidad narrativa. Evitar llenar cada página de arte.
- Imágenes originales del juego VT2, sin crear arte nuevo, sin añadir personajes ajenos ni afirmar que retratan a **Lera, Mara, Sabel o Dalia**. Las escenas del juego son **ambientación**, no fotografías literales de las acciones del manuscrito.
- En capítulos, colocación preferente **entre párrafos completos**, con leyendas discretas cuando realmente aporten significado. En la portadilla, puede usarse vista de ciudad **solo tras autorización**; evitar spoilers y revelar secretos.
- Para libro impreso/PDF: páginas legibles con márgenes generosos, portadas de capítulo y a lo sumo 1–2 imágenes interiores salvo excepción razonada. Para EPUB: imagen proporcional al ancho del dispositivo, **texto reflowable**, descripción accesible, sin forzar tamaño de letra.
- Jerarquía visual: título y tipografía antes que decoración; color de acento inspirado en piedra, madera y luz. No imprimir UI, botones, HUD ni mapas de navegación.

## 2. Auditoría visual realizada sobre los archivos originales

Los **ocho recursos siguientes fueron abiertos e inspeccionados visualmente en el repositorio** (7 vistas de lugar + 1 bestiario) y sus SHA se recuperaron de GitHub. Sus representaciones se muestran abajo con rutas relativas al repositorio; existen archivos de mayor resolución para la maquetación. Que el fichero exista y sea visualmente apropiado **no certifica** que esté aprobado editorialmente.

### V01. Vaisgard — portadilla y/o apertura de prólogo
![Vista original de la ciudad de Vaisgard](../../../vintage-telnet-2/client/art/places/vaisgard-anime-v1.webp)

- **Original full:** `vintage-telnet-2/client/art/places/vaisgard-anime-v1.webp`; Git blob `82cc3ddb6186e87dbd88a742d6403fa856b23ad5`.
- **Miniatura visualmente revisada:** `vintage-telnet-2/client/art/places/vaisgard-thumb-v1.webp`; blob `875117e0c5118b0621c0412d966f755315bf87c1`.
- **Lectura visual:** ciudad pétrea monumental, arcos y puestos de mercado. Coincide bien con el prólogo narrativo revisado, cuya escena inicial pública trata ciudad antigua, tránsito y mercado.
- **Uso:** opción de **imagen principal del prólogo**. Para portada general se requiere decisión del propietario: esta vista muestra Vaisgard, pero el Libro I comienza en Valdren; evita prometer que toda la trama transcurre en Vaisgard.
- **Permiso:** `PENDIENTE_APROBACION`.

### V02. Valdren — capítulo 1, apertura
![Pueblo de Valdren](../../../vintage-telnet-2/client/art/places/valdren-anime-v1.webp)

- **Full:** `vintage-telnet-2/client/art/places/valdren-anime-v1.webp`; blob `73f96447d4545e91d47843f645bc9e18673376e4`.
- **Miniatura revisada:** `vintage-telnet-2/client/art/places/valdren-thumb-v1.webp`; blob `8ae43b038ae81469a53016c8ac316ffb927d9b7f`.
- **Lectura visual:** pueblo agrícola, construcciones bajas y vida en torno a una calle abierta. Sirve como atmósfera de `valdren_plaza`, aunque **no debe venderse como composición exacta del banco y la piedra descritos** en C001.
- **Uso:** única imagen de apertura C001, alto valor por ubicar al lector.
- **Permiso:** `PENDIENTE_APROBACION`.

### V03. Corredor de los Huertos — capítulo 1 / ecos del capítulo 2
![Huertos de Valdren](../../../vintage-telnet-2/client/art/places/valdren_huertos-anime-v1.webp)

- **Full:** `vintage-telnet-2/client/art/places/valdren_huertos-anime-v1.webp`; blob `unverified_full_SHA_check_before_export`.
- **Miniatura revisada:** `vintage-telnet-2/client/art/places/valdren_huertos-anime-v1-thumb.webp`; blob `5ecea67bc7a98f0a896c4d69f00a3dcfcb70e9f8`.
- **Lectura visual:** corredor de casas, árboles y cultivo delimitado por cercas bajas; encaja con las escenas de trabajo y paso hacia el campo.
- **Uso:** imagen interior C001 cerca de la primera conversación sobre riego, o C002 cuando se vuelve a los huertos, **no duplicarla en los dos capítulos sin motivación**. Recomendada en C001 para sostener la geografía.
- **Permiso:** `PENDIENTE_APROBACION`.

### V04. Pozo de las Dos Cuerdas — capítulo 2, apertura
![Pozo de Valdren](../../../vintage-telnet-2/client/art/places/valdren_pozo-anime-v1.webp)

- **Full:** `vintage-telnet-2/client/art/places/valdren_pozo-anime-v1.webp`; blob `b70ebe975eff410c96e98e1ffdc66b1f11bd4824`.
- **Miniatura revisada:** `vintage-telnet-2/client/art/places/valdren_pozo-anime-v1-thumb.webp`; blob `b52235b88865ae1146b8b0e142452bb3a407b4cc`.
- **Lectura visual:** pozo circular de piedra, tejadillo, árboles y calles; concordante con `valdren_pozo` de C002.
- **Uso:** mejor ilustración interior del capítulo 2 **cuando Lera se acerca a hablar con Sabel**; si se desea apertura ilustrada, no desvelar antes de que el lector llegue al pozo.
- **Permiso:** `PENDIENTE_APROBACION`.

### V05. Salida de las Cercas Bajas — capítulo 3, primera apertura al mundo
![Salida de Valdren hacia Edran](../../../vintage-telnet-2/client/art/places/edran_salida_huertos-anime-v1.webp)

- **Full:** `vintage-telnet-2/client/art/places/edran_salida_huertos-anime-v1.webp`; SHA exacto aún por registrar.
- **Miniatura revisada:** `vintage-telnet-2/client/art/places/edran_salida_huertos-anime-v1-thumb.webp`; blob `6dfbfaf3058b2db3b477202a36b50c88d076c09a`.
- **Lectura visual:** cercas, camino curvado y campo abierto; imagen especialmente útil para enfatizar la primera salida verdadera de Lera.
- **Uso:** apertura de C003 después de la despedida breve, donde se cruzan los postes. **C003 permanece fuera de la prelectura vigente hasta revisión.**
- **Permiso:** `PENDIENTE_APROBACION`.

### V06. Curva de la Acequia — capítulo 3, tránsito
![Cruce de acequia](../../../vintage-telnet-2/client/art/places/edran_acequia-anime-v1.webp)

- **Full:** `vintage-telnet-2/client/art/places/edran_acequia-anime-v1.webp`; SHA exacto aún por registrar.
- **Miniatura revisada:** `vintage-telnet-2/client/art/places/edran_acequia-anime-v1-thumb.webp`; blob `0718e5f22133d8a27482e43598074a139a01c155`.
- **Lectura visual:** canal de agua, losa ancha y sendero; respalda el cruce señalado sin atribuir encuentros de fauna.
- **Uso:** opcional. Si C003 tiene imagen de salida + Espinajo, puede omitirse para evitar fragmentar el viaje.
- **Permiso:** `PENDIENTE_APROBACION`.

### V07. Campo de surcos — capítulo 3, nueva amplitud
![Campos de Edran](../../../vintage-telnet-2/client/art/places/edran_surcos-anime-v1.webp)

- **Full:** `vintage-telnet-2/client/art/places/edran_surcos-anime-v1.webp`; SHA exacto aún por registrar.
- **Miniatura revisada:** `vintage-telnet-2/client/art/places/edran_surcos-anime-v1-thumb.webp`; blob `07384cfbbf66e980dffdccc53388410362b3eda3`.
- **Lectura visual:** surcos agrícolas y apertura de horizonte; sirve para la escena territorial, sin afirmar que representa necesariamente la época/hora exacta.
- **Uso:** alternativa a V06 cuando se busca un paisaje más amplio.
- **Permiso:** `PENDIENTE_APROBACION`.

### V08. Espinajo de rastrojo — capítulo 3, tensión y encuentro
![Espinajo de rastrojo](../../../vintage-telnet-2/client/art/bestiary/espinajo-rastrojo-anime-v1.webp)

- **Full original revisado:** `vintage-telnet-2/client/art/bestiary/espinajo-rastrojo-anime-v1.webp`; Git blob `e7659b4711551b777b1e0375718d380669c2e553`.
- **Lectura visual:** pequeño animal compacto, patas cortas y espinas densas en rastrojo. **Coincide directamente** con la criatura defensiva no persecutoria de C003; no convierte el encuentro literario en combate o enemigo obligado.
- **Uso:** proponer como imagen interior después de la presentación del animal, **nunca antes**, para no anular el descubrimiento textual.
- **Permiso:** `PENDIENTE_APROBACION` y revisión de canon C003.

## 3. Guion de imágenes por lectura
| Sección | Composición preferente | Aparición | Condición |
|---|---|---|---|
| Portada | Tipografía dominante; imagen V01 si Arquitectura autoriza que Vaisgard encabece libro ambientado inicialmente en Valdren | Portadilla | Aprobación propietaria y composición |
| Prólogo | V01 ancho medio, fiel a ciudad y mercado (evitar abrir con collage de especies) | Tras presentación de ciudad / en primera página del prólogo | Revisión prólogo + permiso V01 |
| Capítulo 1 | V02 como apertura; V03 como interior opcional | Entrada a Valdren / cruce a huertos | Cotejo de canon y permisos |
| Capítulo 2 | V04 imagen del pozo; evitar duplicar V03 | Al llegar al pozo | Cotejo correcciones M01/M02 y permiso |
| Capítulo 3 | V05 al cruzar cercas; elegir V08 después de descubrir criatura. V06/V07 si lectura admite 3 imágenes | Salida / encuentro | Dictamen C003, revisión de criatura, permisos |

## 4. Decisiones cerradas por criterio editorial de Arte 04
1. **No** declarar que las personas anónimas que aparezcan en el arte de ambientes son Lera o sus allegados. No existen retratos literarios canónicos de ellas.
2. **No** usar una imagen de criatura como portada de C001/C002, donde no aparece ningún encuentro.
3. **No** incluir mapa del juego, pistas reservadas ni interfaz en la narración.
4. C003 todavía requiere dictamen antes de exportación; su arte se deja preparado, **no integrado**.
5. Arte original intacto; únicamente copias para compatibilidad EPUB/PDF tras aprobación.

## 5. Pendiente de autorización / validación
- [ ] Arquitectura Editorial aprueba o rechaza V01–V08 individualmente para este libro, con foco en portada V01 y ritmo V02/V03/V04.
- [ ] Arquitectura VT2 y Editor de Canon confirman que los recursos no exponen inconsistencias o secretos.
- [ ] Verificar SHA de originales full aún marcados como pendientes y fijar en manifiesto de publicación.
- [ ] Producir EPUB 3 + PDF **con las imágenes seleccionadas y aprobadas**, comprobar EPUBCheck y render página a página, sin tocar el juego.
- [ ] Subir a Drive sólo cuando el propietario apruebe publicación.

**Riesgo no bloqueante para prelectura de texto:** todavía no se puede afirmar “edición ilustrada lista”; la edición actual de #708 sigue siendo texto en EPUB/PDF, y esto es el **guion visual verificado** para la siguiente iteración.
