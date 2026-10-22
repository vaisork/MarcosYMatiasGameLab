# Korven 01 — 2026-10-22 (CM-20)

Candidato local sobre `ec425a4`, rama `codex/cm-20`: seis salas ilustradas, siete fondos, dos atlas NPC y tres parejas de sprites de fauna. El conjunto alcanza **50/191 salas ilustradas** (191 mapas generados + 50 pintados = 241); quedan 141. Sin commit de este lote, push, PR, merge ni despliegue. El `main` remoto consultado permanece en `aab05d4b` (38 salas); esta base incorpora el candidato de PR #750 y su helper posterior, sin afirmar su integración remota.

## Escenas y geometría

Coordenadas de celda desde cero, mapa 20×15. Cada escena tiene su fuente Tiled `.tmj` y su máscara `layers.solid`. Los únicos bordes libres pertenecen a las salidas canónicas. Las máscaras siguen el arte final, con margen conservador frente a mobiliario y roca; no sustituyen el terreno por una cruz genérica.

| Sala | Salidas | Geometría y actores |
|---|---|---|
| `korven_borde_tierra` | N/S | Sendero entre rocas; entrada norte x=9..10 y sur x=9..12. Descanso ante el refugio en fila 6. Cubierta, banco, postes y bancos de piedra bloqueados. Cascapedernal `[10,3]`, Colagrieta `[11,11]`, Quebrarrocas `[9,7]`. |
| `korven_senda_viento` | S/E | Senda acodada desde sur x=6..9 hacia este en filas 3..4. Cobertizo, pilares y muros quedan fuera del corredor. Cascapedernal `[13,6]`, Colagrieta `[8,12]`, Quebrarrocas `[8,8]`. |
| `korven_almacen_grano` | O/E | Pasillo central en filas 6..8; puertas en filas 6..7. Cestos elevados y soportes cerrados al norte/sur. Sin NPC ni fauna añadidos. |
| `brumak_centro` | N/S/O/E | Patio de giro, pasos norte/sur x=9..10 y calle este/oeste en fila 7. Casas, puertas domésticas cerradas, bancos y acopios bloqueados. Sin actores añadidos. |
| `korven_peldanos_cortos` | O/E/S | Pasos bajos y franja de ruedas; oeste/este en filas 5..6, sur x=9..11. Norte cerrado por roca; carro, cuña y asiento son obstáculos. Ved `[15,6]` junto al asiento; Cascapedernal `[5,6]`, Colagrieta `[10,10]`, Quebrarrocas `[10,5]`. |
| `korven_taller_juntas` | S | Piso central conectado con entrada sur x=8..12. Bancos laterales, estantes y paredes cerrados. Beran `[6,8]` junto al banco, con aproximación libre. |

Total: **14 salidas canónicas**. El catálogo y el servidor siguen determinando destinos, presencia, diálogos y decisiones. Los slots de fauna representan todas las posibilidades del pool; no fuerzan su aparición. No se cambian canon, backend, recompensas ni combate.

## Arte y procedencia

- `korven_borde_tierra` y `korven_senda_viento`: reutilizados sin repintar desde la preparación aprobada SHIP de CM-12.
- Cuatro fondos de sala y `korven_battle`: generados con `image_gen` nativo a partir de los prompts preparados. WebP final 1280×960, todos ≤250000 bytes. Se ajustó la copia local del normalizador para reducir progresivamente calidad cuando ImageMagick no respetó el tamaño objetivo original.
- Escalones bajos: la primera imagen sugería una salida norte no canónica. Se corrigió nativamente con una pared de roca; original descartado y prompt de edición conservados fuera del repositorio.
- Ved y Beran: atlas RGBA 192×384, doce celdas 64×96, pie común y cuerpos de hasta 68 px para conservar la baja estatura Dravak. Placas pétreas pequeñas y ropa de trabajo. Usan el contrato de Aren; no se inventan combates para estos NPC ni assets de combate sin consumidor.
- Cascapedernal, Colagrieta y Quebrarrocas: dos vistas generadas por criatura usando el bestiario vigente como referencia; PNG RGBA 48×48 para mapa y 192×192 para combate. Extracción por componentes alfa, eliminación de motas desconectadas de alfa muy bajo, escala proporcional y padding. Sin repintado programático. Quebrarrocas usa escala visual 1.6 en mapa como Cornalomo; su anclaje y dimensiones de batalla se conservan.
- Las tres salas con fauna usan explícitamente `backgrounds/korven_battle.webp`, evitando el fondo de bosque heredado. No se altera la presentación de otras regiones.

Hashes, dimensiones y bytes: [VAISGARD_RPG_ARTE.md](VAISGARD_RPG_ARTE.md#korven-01--candidato-local-2026-10-22-cm-20) y sidecars junto a los recursos. Originales, prompts, scripts mecánicos y manifiesto completo: `/home/jdiaz/proyectos/entregas/equipo/cm-20/`.

## Validación

- `node scripts/check-rpg-client.mjs`: PASS sobre 241 mapas, navegación con contorno real del avatar, precarga y presencia autoritativa de los cinco actores nuevos, atlas y vistas de batalla, escala de Quebrarrocas, fondo de combate y red.
- `python -m unittest tests.test_rpg_scenes -q`: 8 pruebas PASS. Incluye fuentes Tiled exactas en ambos sentidos, 14 salidas, bordes cerrados, conectividad, slots canónicos completos, posiciones sin solapamiento con spawns, obstáculos focales y hashes/tamaños de fondos.
- `python scripts/qa-rpg-korven-01.py --check`: 5/5 PASS; navegación canónica desde Valdren, 14 salidas, entorno, diálogos reales de Ved/Beran y permiso de Brumak. Sin compra o afinado con inventario inventado.
- `python scripts/qa-rpg-korven-01.py --test-startup --port 0`: PASS; GET autenticado, acción con CSRF y cierre de servidor/SQLite temporal.
- Chrome visible mediante `codex-browser`: PASS, 22 recorridos por teclas/draw del cliente cubriendo 14 salidas únicas; seis lecturas, aproximación y diálogo de los dos NPC, permiso real de Brumak y [12 capturas](visual/korven-01/) en 1366×768 y 390×844. Sin teletransporte del avatar ni flags de depuración.
- Correcciones durante QA: Ved estaba en el límite del banco y su contorno tocaba la colisión; se desplazó al suelo libre `[15,6]`. La primera captura de Beran se solapaba con el relato; la captura definitiva utiliza diez pasos de fotograma hacia arriba antes de encuadrar, conservando el HUD y la geometría.
- `git diff --check`: limpio. No se ejecutó suite global del servidor: no se toca persistencia, combate central, autenticación ni infraestructura común.

## Autorrevisión y límites

Autorrevisión visual favorable: continuidad de piedra, vegetación seca, luz y acabado pintado con el paso desde Edran; Brumak en superficie, sin ciudad subterránea, dragones, cristales o actores pintados dentro del fondo. Cestos y soportes, trabajo de medidas, pasos bajos y pequeñas placas Dravak corresponden al canon preparado. Fauna cotejada con el bestiario; transparencia y anclaje inspeccionados al tamaño final. Requiere revisión del arquitecto, no equivale a una revisión artística independiente.

La fauna puede variar con el estado del servidor. Las vistas de batalla se verifican en la suite Node con el renderer real y snapshot de prueba; no se afirma un combate humano ni rendimiento de hardware. Las capturas móviles son de viewport emulado; no certifican tacto ni FPS. La automatización fuerza fotogramas para capturar imágenes cargadas incluso en pestañas ocultas. El servidor QA se cerró y limpió su SQLite temporal; no se consultó ni modificó producción.

Próximo consumidor: Claude/arquitecto, para revisar diff y evidencia, registrar commit y gestionar publicación según autorización. El sandbox no permite escribir el Git compartido ni el `pendientes.json` oficial; el estado local y el informe del encargo quedan en `entregas/equipo/cm-20/` para sincronización. No declarar integrado este candidato local.
