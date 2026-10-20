# Canal de Edran 01

Este lote implementa las seis escenas ilustradas y fuentes Tiled del tramo subterráneo del Canal de Edran sobre la base del borrador PR745 (`029bcf8`), conservando `fee7ed7` (mapeo de NPCs Nela y Oren) y `aef706a` (soporte declarativo de variantes de fondo por acción).

## Escenas y geometría

Las seis salas reproducen la geometría real del arte final 1280×960 en cuadrícula de 20×15 celdas (64×64 px), respetando obstáculos físicos, cursos de agua, pasos secos y corredores transitables para el volumen del avatar:

1. **`edran_canal_entrada`**: Boca de entrada desde la zanja. Salida oeste con tres peldaños y cuerda hacia `edran_zanja_antigua`, salida este sobre paso seco hacia `edran_canal_bifurcacion`, y corredor sur hacia `edran_canal_herramientas`. NPC Nela situada en `[10, 7]`, en suelo seco central visible fuera de superposiciones HUD.
2. **`edran_canal_herramientas`**: Cámara de herramientas subterránea. Única salida norte hacia `edran_canal_entrada`. Mesa de trabajo battereada en la pared oeste (`[1..7, 2..5]`) modelada como sólida; suelo central transitable. Sin NPCs ni fauna propia.
3. **`edran_canal_bifurcacion`**: Bifurcación del canal. Salidas este-oeste continuas sobre cornisa seca (`y=6..7`) conectando `edran_canal_entrada` y `edran_canal_compuerta`. Salida sur por escalón seco hacia `edran_canal_refugio`. Canal de agua y compuerta norte cerrados y sólidos.
4. **`edran_canal_refugio`**: Alcoba de descanso seca. Única salida norte hacia `edran_canal_bifurcacion`. Manta de lana plegada y taza en nicho superior derecho modeladas como sólidas. NPC Oren situado en `[12, 8]` en espacio despejado de estancia.
5. **`edran_canal_compuerta`**: Compuerta y paso del canal. Salidas oeste y este conectadas por calzada seca meridional completa (`y=9..10`, `x=0..19`). Agua septentrional y compuerta abierta contra muro norte modeladas como sólidas. Adversario canónico `forajido_camino` posicionado en `[13, 10]` en el paso seco, ofrecido condicionalmente por el snapshot del servidor sin dibujarlo en el fondo.
6. **`edran_canal_repisa`**: Cámara terminal del canal. Única salida oeste hacia `edran_canal_compuerta`; muro este terminal completamente cerrado sin pasadizos ocultos. Repisa elevada superior derecha y masa de agua modeladas como sólidas; peldaño seco transitable para aproximación. Soporta variante declarativa de fondo:
   - Fondo base: `backgrounds/edran_canal_repisa.webp` (repisa vacía tras recogida).
   - Variante por acción: `background_actions: {"edran_recoger_caja": "backgrounds/edran_canal_repisa_caja.webp"}` (caja cerrada sobre repisa visible antes de recoger).

## Recursos integrados

Se verificaron con `manifest-arte.json` los hashes SHA-256 y dimensiones de:
- Siete fondos WebP de 1280×960 (≤250 KB) con sus correspondientes sidecars `.webp.json`.
- Dos atlas PNG de sprites para Nela y Oren (192×384 px, 12 cuadros de 64×96 cada uno).
- Siete atlas validados obligatoriamente en el arnés de cliente (`bren`, `daro`, `iria`, `elva`, `sena`, `nela`, `oren`).

## Pruebas ejecutadas

- **Node.js client harness (`node scripts/check-rpg-client.mjs`)**: 224 mapas verificados (191 genéricos + 33 ilustrados). Todos los puntos de llegada y salida son alcanzables con la caja de colisión del avatar. Mapeo y atlas binarios de 7 NPCs validados. Selector declarativo de fondos por acción probado.
- **Sintaxis JavaScript (`node --check client-rpg/rpg.js`)**: Correcta, código 0.
- **Pruebas unitarias Python (`tests.test_rpg_scenes` y `tests.test_rpg_tiles`)**: 11 pruebas pasando en ~2.2 s con `~/proyectos/.venv-vt2/bin/python`. Verificación completa de round-trip bidireccional Tiled ↔ escena JSON, salidas canónicas, presencia autoritativa de NPCs y criaturas, y comprobación de puntos transitables y obstáculos físicos.
- **Integridad de repositorio (`git diff --check`)**: Correcto, sin espacios en blanco erróneos.

## Estado y QA pendiente

- Rama de trabajo: `agy/rpg-edran-canal-01` en worktree local `/home/jdiaz/proyectos/wt-agy-rpg-edran-canal-01`.
- Candidato sin push, PR ni despliegue.
- QA en navegador visible (`codex-browser`), fixtures efímeras y capturas móviles/escritorio pendientes para revisión del gestor (Codex).
