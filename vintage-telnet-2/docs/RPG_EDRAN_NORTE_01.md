# Norte de Edran01 — 2026-10-21 (CM-12)

Cinco salas ilustradas del norte de Edran, sus fuentes Tiled y recursos aprobados para Aren y Salteador Bravucón. El lote continúa el avance sobre la base `33bf41a`. El conjunto candidato alcanza 38 salas ilustradas de 191 (229 mapas totales: 191 generados + 38 pintados). Estado: CANDIDATO local, no sincronizado en GitHub aún ni desplegado.

## Comportamiento

1. **Terraplén de la Subida (`edran_terraplen`)**:
   - Salidas exactas: norte (`edran_casa_camino`) y sur (`edran_era`).
   - Corte encajonado de subida; paredes laterales de tierra y raíces cierran el paso este/oeste.
   - Ensanchamiento funcional accesible a media cuesta; piedra de apoyo izquierda bloqueada como obstáculo.
   - Fauna canónica: `espinajo_rastrojo`, `mordelinde`, `cornalomo`.

2. **Casa del camino (`edran_casa_camino`)**:
   - Salidas exactas: norte (`edran_calzada`) y sur (`edran_terraplen`).
   - Pasillo central de piedra continuo transitable N/S de al menos 2-3 celdas conectando ambas puertas.
   - Entrada sur en piso bajo resistente; zona elevada seca de tablones accesible por escalón legal abierto.
   - Mesa de trabajo, bancos, estantes y fuego de hogar bloqueados como obstáculos.
   - Aren situado en piso transitable debajo de la mesa en `[14, 7]`, sin revelar presencia si el servidor no lo ofrece.

3. **Calzada de piedra (`edran_calzada`)**:
   - Salidas exactas: norte (`edran_hito_campos`) y sur (`edran_casa_camino`).
   - Calzada empedrada ascendente con suave curva; bordes de hierba transitables y rocas/taludes exteriores bloqueados.
   - Dos parches de reparación integrados en el suelo transitable.
   - Fauna canónica: `espinajo_rastrojo`, `mordelinde`, `cornalomo`.

4. **Paso hacia Veyra (`edran_hito_campos`)**:
   - Salidas exactas: norte (`veyra_puerta_campos`), sur (`edran_calzada`) y este (`edran_vista_cuenca`). Sin salida oeste.
   - Arroyo transversal bloqueado excepto en el cruce de las tres losas contiguas de piedra (`[9..11, 3..6]`). Agua adyacente a las losas bloqueada.
   - Desvío al este en ascenso transitable hacia la vista panorámica.
   - Poste y losa delimitadora marcados como obstáculos.
   - Fauna canónica: `salteador_veterano`, `espinajo_rastrojo`.

5. **Mirador de la cuenca (`edran_vista_cuenca`)**:
   - Salidas exactas: oeste (`edran_hito_campos`) y este (`veyra_pastos_exteriores`). Sin salidas norte ni sur.
   - Corredor transversal transitable E/O a lo largo de las filas 7-8 con terraza segura.
   - Panorámica lejana norte y precipicio sur bloqueados como no transitables.
   - Espacio despejado en el sendero para el encuentro con `salteador_bravucon` y `espinajo_rastrojo`.

## Validación

- `node scripts/check-rpg-client.mjs`: 229 mapas comprobados (191 generados + 38 pintados). 8 atlas NPC estrictos (incluyendo `aren` 192×384) y 7 criaturas estrictas (incluyendo `bravucon` 48×48 y 192×192) validados binariamente. Geometría, límites del avatar, visibilidad y red OK.
- `python -m unittest discover -s tests -p test_rpg_scenes.py -q`: 6 pruebas correctas, incluyendo `test_edran_norte_scenes_canonical_geometry_and_entities` con verificación de 11 salidas legales, roundtrip exacto de los 5 archivos Tiled TMJ, fondos ≤250000 bytes, conectividad completa y obstáculos focales.
- `python scripts/qa-rpg-edran-norte.py --check`: 5/5 comprobaciones pasadas (salas en Content, navegación desde plaza, 11 salidas legales con rebotes, causalidad narrativa real de Bren y Aren, y acciones ofrecidas de Salteador Bravucón).
- `python scripts/qa-rpg-edran-norte.py --test-startup --port 0`: verificación de arranque efímero en puerto dinámico, comprobación de sesión CSRF en `/api/state` y `/api/action`, y parada limpia mediante POST `/__qa__/stop`.
- `npm run check:client` y `node --check client-rpg/rpg.js`: sintaxis JS limpia.
- `git diff --check`: sin espacios en blanco corruptos ni fallos de formato.
- Sin capturas ni QA visual todavía en esta fase (reservado para fase de revisión visual posterior).

## Recursos y hashes

Inventario registrado en [VAISGARD_RPG_ARTE.md](VAISGARD_RPG_ARTE.md) y `manifest-arte.json`.
