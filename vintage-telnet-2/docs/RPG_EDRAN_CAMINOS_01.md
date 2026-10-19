# Caminos de Edran01

Este lote continúa sobre PR744 (`e679761`) y prepara seis salas conectadas: Senda de regreso, Arboleda de los tres árboles, Cobertizo de las Estacas Numeradas, Camino de carros, Refugio del camino y Era de los campos. Conserva motor Python/SQLite, acciones ofrecidas, canon, balance y datos reales.

Los fondos separan geometría y actores. Las salas no tienen NPC propios; la fauna aparece exclusivamente cuando el snapshot del servidor la ofrece. Se añaden recursos de mapa48×48 y batalla192×192 para `forajido_camino` y `salteadora_negociante`, manteniendo la identidad de la veterana existente. Procedencia y hashes en `VAISGARD_RPG_ARTE.md`.

Los corredores siguen la senda curvada alrededor del árbol, ambos ramales del camino de carros y la salida oeste de la era que gira al sur. La vuelta desde Zanja Antigua a Era usa la salida norte canónica; no se deducen direcciones inversas por su nombre.

## Estado de validación

Suite completa:316 pruebas Python en129,806s, OK con una omitida. Después de corregir únicamente la posición de la negociante, nueve pruebas focales de escenas/Tiled pasan en1,628s. Validador final del cliente:218 mapas (191 genéricos y27 ilustrados), llegadas/salidas alcanzables con volumen del avatar, presencia autoritativa, recursos obligatorios y tamaños de mapa/batalla correctos.

La QA utilizó `scripts/qa-rpg-valdren.py --port8772`, SQLite efímera y navegador visible `codex-browser`. Pasaron22transiciones y las15salidas de las seis salas mediante `scripts/qa-rpg-walk.js`, movimiento de cliente y acciones ofrecidas, sin asignar coordenadas al personaje. Se capturaron las seis salas en390×844 y1366×768.

Dos fixtures adicionales eligieron encuentros canónicos con RNG determinista:0,65 para el salteador de cargas y0 para la negociante, manteniendo reloj real y datos efímeros. Se comprobó su presencia, aproximación caminada, diálogo ofrecido y entrada real en combate, con ocho capturas adicionales. En el salteador se verificó avance de ronda tras5,1s reales. No se fabricó estado de combate ni se modificó el motor.

La revisión visual detectó que el relato ocultaba a la negociante en escritorio. Su posición cambió de(7,7)a(9,9), sincronizada en escena/Tiled. Dos nuevas capturas y una comprobación del rectángulo real del sprite contra HUD/relato confirman que queda visible en ambos viewports. La geometría recibió revisión independiente; el gestor revisó la corrección y las ocho capturas de adversarios, porque el segundo pase del revisor visual alcanzó su límite de cuota. Ambos transportes QA8772/8773 quedaron cerrados y sus puertos libres; Chrome se dejó abierto a1366×768.

Chrome ha reportado `document.hidden` durante QA anteriores. Tras cada cambio de viewport se debe invocar el manejador real `resizeCanvas()` y dibujar, comprobando dimensiones CSS×DPR y lienzo pintado. Los pasos sintéticos no certifican tacto físico ni FPS sostenidos en una pestaña activa.

Rama de trabajo: `codex/rpg-edran-caminos-01`, [PR745](https://github.com/vaisork/MatiasGameLab/pull/745) en borrador, apilada sobre PR744. Sin merge ni despliegue de este lote todavía. Los recursos del siguiente tramo del canal se preparan externamente y no forman parte de esta entrega.

## Capturas del candidato

|Exploración móvil|Captura|
|---|---|
|Senda de regreso|[Ver](visual/rpg-caminos01-final-edran_sendero_regreso-mobile.webp)|
|Arboleda|[Ver](visual/rpg-caminos01-final-edran_arboleda-mobile.webp)|
|Cobertizo|[Ver](visual/rpg-caminos01-final-edran_cobertizo_campo-mobile.webp)|
|Camino de carros|[Ver](visual/rpg-caminos01-final-edran_camino_carros-mobile.webp)|
|Refugio|[Ver](visual/rpg-caminos01-final-edran_reparo-mobile.webp)|
|Era|[Ver](visual/rpg-caminos01-final-edran_era-mobile.webp)|

[Era en escritorio, corregida](visual/rpg-caminos01-final-edran_era-desktop.webp) · [Combate con salteador](visual/rpg-caminos01-forajido_camino-battle-mobile.webp) · [Combate con negociante](visual/rpg-caminos01-salteadora_negociante-battle-mobile.webp).

Evidencia original externa: `entregas/equipo/rpg-edran-caminos-01/qa-caminos-results.json`, `qa-era-corregida.json`, `qa-forajido_camino.json`, `qa-salteadora_negociante.json` y `qa-forajido-ronda.json`; scripts de reproducción en la misma carpeta. Las imágenes publicadas son compresiones mecánicas de capturas reales; originales conservados en `entregas/equipo/rpg-preview/`.
