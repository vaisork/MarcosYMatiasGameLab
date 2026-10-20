# Canal de Edran01 — 2026-10-19

Seis salas ilustradas del canal, sus fuentes Tiled y atlas propios de Nela y Oren. El lote continúa el candidato de [Caminos01](RPG_EDRAN_CAMINOS_01.md), base `029bcf8` de PR745. El conjunto candidato alcanza33salas ilustradas de191; eso no significa que estén integradas en main ni desplegadas.

## Comportamiento

Entrada conserva las salidas oeste a la zanja, este a Bifurcación y sur a Herramientas. Herramientas y Refugio tienen únicamente salida norte; Bifurcación conecta oeste, este y sur; Compuerta conecta oeste y este; Repisa termina en una pared cerrada y permite regresar al oeste. No se revela el conducto oculto sin la acción canónica correspondiente.

Las colisiones siguen los seis fondos1280×960 en cuadrícula20×15. Se corrigieron zonas de suelo seco bloqueadas en Herramientas/Refugio y agua, parapetos y muros transitables en otras salas. El peldaño de Repisa admite aproximación; la plataforma elevada, muebles, paredes y agua permanecen sólidos. Las fuentes Tiled se regeneraron con el conversor existente y tienen ida/vuelta exacta.

Nela aparece en Entrada, Oren en Refugio y el Forajido canónico en Compuerta. Su presencia depende del snapshot del servidor. No se añadieron actores al fondo ni fauna, reglas, recompensas o acciones nuevas. El motor Python, el contenido y la partida real se conservan.

Repisa usa un fondo vacío y `background_actions` asocia `edran_recoger_caja` a la variante con caja. El cliente elige la variante cuando el servidor ofrece esa acción, incluso deshabilitada; al desaparecer la acción muestra la repisa vacía. Escena y minimapa comparten selector, con fondo base durante la carga. El campo opcional se valida y conserva en ambos sentidos del conversor Tiled.

Los siete fondos pesan como máximo250000bytes cada uno. Los dos atlas192×384 contienen doce cuadros64×96, con transparencia original y una escala uniforme por personaje. Fuentes y hashes en [VAISGARD_RPG_ARTE.md](VAISGARD_RPG_ARTE.md).

## Validación

- `node scripts/check-rpg-client.mjs`:224mapas comprobados con volumen del avatar, llegadas y salidas alcanzables; siete atlas NPC obligatorios, presencia autoritativa y selector de variantes con fallback/minimapa.
- `node --check client-rpg/rpg.js` y `git diff --check`:correctos.
- Python compartido, `-m unittest tests.test_rpg_scenes tests.test_rpg_tiles -q`:11pruebas correctas,2,660s. Incluyen contratos canónicos, obstáculos y conversión Tiled exacta. No se repitió la suite completa: no cambian motor, autenticación, esquema ni persistencia.
- Revisión independiente de nueve recursos y cierre de geometría:SHIP. Los dos primeros pases de geometría solicitaron correcciones, aplicadas antes de esta QA.
- Revisión visual independiente de las catorce capturas finales:SHIP, sin recortes o solapes prioritarios; caja y actores comprobados dentro de cámara.
- QA aislada en Chrome visible:20transiciones caminadas mediante teclas y pasos reales del cliente; cubiertas las once salidas canónicas. Aproximación y diálogo con Nela/Oren; todas las llegadas quedan libres.
- Caja:primero acción ofrecida, inventario0 y fondo con caja; recoger produce inventario1 y fondo vacío; devolver a Nela consume la caja; regresar mantiene inventario0, acción ausente y fondo vacío. Se verificó también el rodeo canónico de Compuerta hasta Repisa.
- Catorce capturas de seis salas en390×844 y1366×768, incluida Repisa antes/después. Se caminó hasta la caja para mostrar el cambio en la cámara móvil; las capturas iniciales desde la entrada oeste no servían para esa comparación.
- Recaptura focal de Compuerta:doce transiciones caminadas desde Plaza, aproximación al Forajido y dos capturas finales con el adversario dentro de cámara. Se conservan por separado el resultado funcional completo y esta comprobación visual.

Chrome reportó `document.hidden=false` en las catorce capturas funcionales y las dos recapturas focales finales. Se invocaron explícitamente `resizeCanvas`, render y pasos del cliente, con APIs reales de una fixture SQLite temporal. Se comprobó resolución del lienzo, fondo cargado, alfa y ausencia de solapamiento de actores con HUD/relato. Esto no certifica tacto físico ni rendimiento sostenido en un teléfono. Ambos servidores de QA se cerraron y se verificó libre su puerto8774; no se usaron datos de producción. Chrome quedó abierto en1366×768, lienzo de igual tamaño y ninguna tecla retenida.

## Capturas

| Sala | Móvil | Escritorio |
|---|---|---|
| Entrada y Nela | [Ver](visual/rpg-canal01-entrada-mobile.webp) | [Ver](visual/rpg-canal01-entrada-desktop.webp) |
| Herramientas | [Ver](visual/rpg-canal01-herramientas-mobile.webp) | [Ver](visual/rpg-canal01-herramientas-desktop.webp) |
| Bifurcación | [Ver](visual/rpg-canal01-bifurcacion-mobile.webp) | [Ver](visual/rpg-canal01-bifurcacion-desktop.webp) |
| Refugio y Oren | [Ver](visual/rpg-canal01-refugio-mobile.webp) | [Ver](visual/rpg-canal01-refugio-desktop.webp) |
| Compuerta y Forajido | [Ver](visual/rpg-canal01-compuerta-mobile.webp) | [Ver](visual/rpg-canal01-compuerta-desktop.webp) |
| Repisa con caja | [Ver](visual/rpg-canal01-repisa-mobile.webp) | [Ver](visual/rpg-canal01-repisa-desktop.webp) |
| Repisa tras recoger | [Ver](visual/rpg-canal01-repisa-recogida-mobile.webp) | [Ver](visual/rpg-canal01-repisa-recogida-desktop.webp) |

Capturas del cliente real, convertidas mecánicamente dePNG aWebP. No son imágenes generadas ni pantallas simuladas.

## Integración

Candidato dependiente de PR745 y su rama `codex/rpg-edran-caminos-01`. AGY registró implementación y geometría; Codex revisó, corrigió el segundo pase y ejecutó QA. La PR de este lote identifica el commit publicado y sus resultados de CI. Merge y despliegue siguen pendientes de aprobación de Javier por iteración.
