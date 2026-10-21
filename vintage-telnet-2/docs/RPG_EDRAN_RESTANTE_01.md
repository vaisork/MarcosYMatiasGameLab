# Edran Restante 01 — 2026-10-21 (CM-12)

Seis salas ilustradas restantes de Edran, sus fuentes Tiled y siete recursos visuales aprobados. Conserva los personajes y criaturas canónicos; corrige el sprite de mapa del Cornalomo. El lote continúa el avance sobre la base `1bec001`. El conjunto candidato alcanza 44 salas ilustradas de 191 (235 mapas totales: 191 generados + 44 pintados). Estado: CANDIDATO de revisión, sin merge ni despliegue autorizados para este lote. Main contiene 33 salas; la Raspberry consultada el 21 de octubre conserva 3 en `8b62492`.

## Comportamiento

1. **Loma del Pasto Cortado (`edran_loma`)**:
   - Salidas exactas (3): este (`edran_lindero`), norte (`edran_prado`) y sur (`edran_parcela_vieja`).
   - Paso norte en `x=6..7` conectando con el prado; salida este en fila 8 hacia el lindero; salida sur en `x=9..10` hacia la parcela vieja.
   - Lado oeste cerrado por roca y vegetación; panorama lejano noreste de Valdren bloqueado como escenografía no transitable; huerto cercado sureste bloqueado como obstáculo.
   - Fauna canónica: `espinajo_rastrojo` en el claro central sobre suelo firme.

2. **Prado de las Marcas Anchas (`edran_prado`)**:
   - Salidas exactas (2): sur (`edran_loma`) y oeste (`edran_ladera_piedra`).
   - Sendero sur en `x=9..11`; bifurcación y camino empedrado oeste en fila 4..5.
   - Sendero rodea el círculo aplastado; zona interior de marcas/huellas sobre terreno transitable accesible; tallos altos perimetrales y bordes exteriores cerrados.
   - Señal canónica: `cornalomo` en el claro aplastado en `[13, 8]`, aproximable por el jugador; fauna canónica: `salteadora_negociante` en `[5, 6]` y `espinajo_rastrojo` en `[8, 9]`.

3. **Ladera de los cestos (`edran_ladera_piedra`)**:
   - Salidas exactas (2): este (`edran_prado`) y norte (`edran_linde_piedra`).
   - Salida norte en `x=8..10`; salida este en fila 8; sin salidas accidentales sur ni oeste.
   - Tres repisas salientes a la izquierda bloqueadas como obstáculos; cuerda recogida bajo el saliente inferior en escenografía no transitable.
   - Ruta continua transitable E/N sin saltos ni desniveles engañosos.
   - Fauna canónica: `espinajo_rastrojo` en `[15, 7]`.

4. **Paso hacia Korven (`edran_linde_piedra`)**:
   - Salidas exactas (2): sur (`edran_ladera_piedra`) y norte (`korven_borde_tierra`).
   - Camino central N/S; explanada de descarga transitable para maniobra de porteadores.
   - Soportes portátiles estrechos en el borde izquierdo de la explanada bloqueados como obstáculos.
   - Rocas y lomos laterales este/oeste cerrados sin salidas laterales falsas.
   - Fauna canónica: `cornalomo` en `[11, 4]`, `mordelinde` en `[13, 6]` y `espinajo_rastrojo` en `[8, 11]`.

5. **Sendero del Agua Oculta (`edran_sendero_juncos`)**:
   - Salidas exactas (2): oeste (`edran_reparo`) y este (`edran_puente_juncos`).
   - Entrada oeste en fila 6 y salida este en fila 6; franja firme continua conectando ambos extremos.
   - Claro central ancho transitable para cruce y espera de caminantes.
   - Juncos densos y corrientes de agua norte y sur completamente cerrados como no transitables.
   - Fauna canónica: `espinajo_rastrojo` en `[8, 6]`, `mordelinde` en `[12, 6]`, `cornalomo` en `[10, 8]` y `forajido_camino` en `[13, 8]`.

6. **Vado de Juncos (`edran_puente_juncos`)**:
   - Salidas exactas (3): oeste (`edran_sendero_juncos`), este (`lethra_hito_tierra`) y sur (`edran_sauces`).
   - Corredor de paso sobre el tablero (deck) de madera en filas 4..5 dentro de las barandillas; río transversal y corriente rápida inferior bloqueados (único paso entre orillas es el puente).
   - Senda de orilla oeste desciende en curva transitable por suelo seco hasta `x=7..9` en el borde sur hacia los sauces.
   - Orilla este elevada transitable con tablón de espera; `salteador_veterano` en `[17, 5]` fuera de agua y barandillas; fauna: `espinajo_rastrojo` en `[4, 7]`.

Total de salidas navegables en el conjunto: exactamente 14.

## Validación

- `node scripts/check-rpg-client.mjs`: 235 mapas comprobados (191 generados + 44 pintados). Comprobación de límites del avatar, navegabilidad de todos los spawns y salidas legales, regresiones geométricas de Edran Restante (panorama de Loma bloqueado, círculo de Prado accesible, 3 repisas de Ladera como obstáculos, soportes de Linde bloqueados, juncos/agua de Sendero cerrados, deck exclusivo de Puente y orilla sur seca), visibilidad, render y red OK.
- `python -m unittest tests.test_rpg_scenes`: 7 pruebas correctas, incluyendo `test_edran_restante_scenes_canonical_geometry_and_entities` con verificación de 14 salidas legales, roundtrip exacto de los 6 archivos Tiled TMJ, fondos ≤250000 bytes, conectividad completa, slots completos de fauna/señales y obstáculos focales.
- `python scripts/qa-rpg-edran-restante.py --check`: 5/5 comprobaciones pasadas (salas en Content, definición canónica de fauna/salidas, navegación canónica desde plaza de Valdren hasta Loma, 14 salidas legales en ambos componentes interconectados, y acciones ofrecidas verificadas de entorno y fauna en tiempo de ejecución con CSRF efímero).
- `git diff --check`: formato limpio sin espacios en blanco corruptos ni saltos indebidos.
- Arte y geometría: revisión independiente SHIP. Se corrigieron panorama/salida este de Loma, actores de Prado, zigzag de Ladera, soportes de Linde, extremos del Sendero y orillas del Puente; se añadieron regresiones de los puntos detectados.
- Chrome visible con SQLite temporal: PASS, 33 recorridos mediante teclas/draw, cubriendo las 14 salidas únicas, seis exámenes de entorno y aproximación/examen de Cornalomo. Sin teletransporte del avatar ni cambios de estado inventados.
- [12 capturas finales](visual/edran-restante-01/): escritorio 1366×768 y viewport móvil 390×844. La ejecución final incluye aproximación, examen ofrecido y un paso lateral mediante diez fotogramas para mostrar completo al Cornalomo. Se corrigieron su posición a `[13,8]`, su sprite de mapa y la escala visual1.6 después de detectar solape con relato móvil y una silueta heredada ilegible. No se ocultó el HUD.
- Límites: parte de la automatización tuvo pestaña oculta y render explícito con imágenes cargadas; no acredita tacto, FPS ni rendimiento de teléfono físico. No se añadieron mecánicas ni se alteró la partida real.
- Render de mapa: Cornalomo48×48 de cuerpo completo con alfa, escala1.6 y anclaje de pies preservado. Prueba de drawImage real en VM verifica sus dimensiones, las de avatar/NPC/Espinajo y el dibujo de batalla sin cambios.
- Fixture detenido mediante POST `/__qa__/stop`, SQLite temporal limpiado y Chrome restaurado a escritorio y acceso directo de Raspberry.

## Estado de integración

44 salas ilustradas en el candidato local; quedan 147 de 191. GitHub `main` contiene 33 salas. La Raspberry consultada el 21 de octubre conserva el clon `8b62492` con 3 salas ilustradas y servicio activo. Depende del lote Norte de Edran (PR #748), que a su vez depende de la corrección de latencia (PR #747). El resultado requiere revisión y autorización por ciclo para merge y despliegue; la documentación y la CI no acreditan producción.
