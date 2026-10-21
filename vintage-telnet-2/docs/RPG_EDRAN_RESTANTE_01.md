# Edran Restante 01 — 2026-10-21 (CM-12)

Seis salas ilustradas restantes de Edran, sus fuentes Tiled y recursos aprobados sin nuevos personajes ni criaturas. El lote continúa el avance sobre la base `1bec001`. El conjunto candidato alcanza 44 salas ilustradas de 191 (235 mapas totales: 191 generados + 44 pintados). Estado: CANDIDATO local, no entregado aún, no sincronizado en GitHub (main 33) ni desplegado (producción 3 en `8b62492` consultada el 21 de octubre).

## Comportamiento

1. **Loma del Pasto Cortado (`edran_loma`)**:
   - Salidas exactas (3): este (`edran_lindero`), norte (`edran_prado`) y sur (`edran_parcela_vieja`).
   - Paso norte en `x=6..7` conectando con el prado; salida este en fila 7..8 hacia el lindero; salida sur en `x=9..10` hacia la parcela vieja.
   - Lado oeste cerrado por roca y vegetación; panorama lejana noreste de Valdren bloqueada como escenografía no transitable; huerto cercado sureste bloqueado como obstáculo.
   - Fauna canónica: `espinajo_rastrojo` en el claro central sobre suelo firme.

2. **Prado de las Marcas Anchas (`edran_prado`)**:
   - Salidas exactas (2): sur (`edran_loma`) y oeste (`edran_ladera_piedra`).
   - Sendero sur en `x=9..11`; bifurcación y camino empedrado oeste en fila 4..5.
   - Sendero rodea el círculo aplastado; zona interior de marcas/huellas sobre terreno transitable accesible; tallos altos perimetrales y bordes exteriores cerrados.
   - Señal canónica: `cornalomo` en el claro aplastado en `[12, 5]`, aproximable por el jugador; fauna canónica: `salteadora_negociante` en `[4, 4]` y `espinajo_rastrojo` en `[7, 8]`.

3. **Ladera de los cestos (`edran_ladera_piedra`)**:
   - Salidas exactas (2): este (`edran_prado`) y norte (`edran_linde_piedra`).
   - Salida norte en `x=8..10`; salida este en fila 7..8; sin salidas accidentales sur ni oeste.
   - Tres repisas salientes a la izquierda bloqueadas como obstáculos; cuerda recogida bajo el saliente inferior en escenografía no transitable.
   - Ruta continua transitable E/N sin saltos ni desniveles engañosos.
   - Fauna canónica: `espinajo_rastrojo` en `[14, 8]`.

4. **Paso hacia Korven (`edran_linde_piedra`)**:
   - Salidas exactas (2): sur (`edran_ladera_piedra`) y norte (`korven_borde_tierra`).
   - Camino central N/S; explanada de descarga transitable para maniobra de porteadores.
   - Soportes portátiles estrechos en el borde izquierdo de la explanada bloqueados como obstáculos.
   - Rocas y lomos laterales este/oeste cerrados sin salidas laterales falsas.
   - Fauna canónica: `cornalomo` en `[11, 4]`, `mordelinde` en `[13, 6]` y `espinajo_rastrojo` en `[8, 11]`.

5. **Sendero del Agua Oculta (`edran_sendero_juncos`)**:
   - Salidas exactas (2): oeste (`edran_reparo`) y este (`edran_puente_juncos`).
   - Entrada oeste en fila 6..7 y salida este en fila 6..7; franja firme continua conectando ambos extremos.
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
- No uso de navegador visible en esta fase: el gestor revisa geometría, capturas y QA funcional de Chrome posteriormente según encargo.

## Estado de integración

44 salas ilustradas en el candidato local; quedan 147 de 191. GitHub `main` contiene 33 salas. La Raspberry consultada el 21 de octubre conserva el clon `8b62492` con 3 salas ilustradas y servicio activo. Este lote no implica push, PR, merge ni despliegue; requiere revisión técnica y autorización por ciclo.
