# Hoshai 01 — escenas sin ilustración, 2026-10-25

Candidato local en `codex/rpg-hoshai-01`, base Korven completo `b90a076`.
29 escenas (28 `hoshai_*` y `khariel_centro`) y sus 29 fuentes Tiled.
Los textos, habitantes, fauna, acciones y destinos proceden de
`content/regions/hoshai.json`; no se modifica el catálogo ni el motor.
Fuentes de identidad: `CANON_EXPANSION.md` (Hoshai),
`docs/PROMPT_MAESTRO_2026-10-08.md` (Khariel/Felaryn) y `docs/VAISGARD_RPG.md`.

## Geometría provisional para ilustrar

Cuadrícula 20×15, tiles de 16, coordenadas desde cero. Pasos de borde:
norte/sur x=9..10; este/oeste y=6..7. El resto del perímetro está cerrado.
Cada spawn y actor queda sobre terreno transitable, fuera de los obstáculos.
Las colisiones representan únicamente paredes, vacío, agua, troncos y mobiliario
permanentes del relato. Las raíces bajas, peldaños y rampas se pueden recorrer.
El tileset `edran` es la reserva existente compartida también por Korven;
no representa la paleta ni la aprobación artística final de Hoshai.

| Sala / asset_id pendiente | Salidas | Referencia de composición |
|---|---|---|
| `hoshai_garganta_oeste` | este, sur | Garganta acodada entre paredes, ensanche para cruzar cargas; descenso sur hacia Korven. |
| `hoshai_hombro_lajas` | este, oeste | Franja de lajas de este a oeste, con apoyo para la tablilla fuera del paso. |
| `hoshai_aprisco_abierto` | sur, oeste | Muros bajos del aprisco y recipiente al resguardo; paso oeste y subida desde el sur. |
| `hoshai_collado_pino` | sur, norte | Rodeo del último pino; tronco y raíces fuera de la huella de paso. |
| `hoshai_abrigo_pinas` | este, norte | Raíz de asiento y piñas junto a la pared; senda norte y salida este al pinar. |
| `hoshai_pinar_discontinuo` | sur, norte, oeste | Pinos separados y claros transitables; desvío oeste al abrigo. |
| `hoshai_estribacion` | norte, sur | Arroyo y ensanche de cargas; paso seco entre piedras, grava hacia Veyra al sur. |
| `hoshai_repecho_raices` | sur, norte | Cuesta entre troncos, raíces bajas transitables y hueco lateral para dejar bultos. |
| `hoshai_descanso_tres_piedras` | sur, norte | Tres piedras de descanso; el corredor central queda libre de asientos y cuerdas. |
| `hoshai_pared_goteo` | sur, norte | Pared húmeda al oeste y valle al este; apoyo en el ensanche, sin paso sobre el vacío. |
| `hoshai_agua_fria` | sur, norte | Corriente dividida por la piedra central; apoyo seco y cruce norte-sur. |
| `hoshai_ladera_hitos` | sur, norte | Dos grupos de hitos al margen de la senda; descanso para leer la tablilla. |
| `hoshai_cuello_roca` | sur, norte | Paso estrecho entre paredes con ensanches en los extremos y piedras de aviso. |
| `hoshai_terraza_cargas` | sur, norte, este, oeste | Terraza ancha para repartir cargas; campamento oeste y mirador este, borde cerrado. |
| `hoshai_escalones_sol` | sur, norte | Peldaños reparados transitables y canal lateral separado del paso. |
| `khariel_centro` | sur, oeste, este, norte | Dos terrazas con franja de rampa continua; bancos laterales sin bloquear los cuatro accesos. |
| `hoshai_taller_apoyos` | este | Banco bajo y estantes; aproximación libre a Daren desde la puerta este. |
| `hoshai_mercado_cintas` | oeste, este | Puestos y barras de ataduras a los lados del paso entre plaza y cuidados. |
| `hoshai_patio_hogares` | sur, este, norte | Descansos y umbrales laterales; sin inventar entradas a hogares privados. |
| `hoshai_lavadero_roca` | oeste, norte | Pila lateral y apoyos de ropa; paso seco desde el oeste hacia el depósito al norte. |
| `hoshai_deposito_comun` | sur, oeste | Estantes por tareas y entrada despejada; puerta oeste hacia el balcón. |
| `hoshai_balcon_valle` | este | Banco retirado del borde; único acceso este, sin descenso al valle. |
| `hoshai_mirador_nudo` | oeste, norte | Saliente protegido para observar el nudo; sin inventar un cruce sobre la cuerda. |
| `hoshai_caseta_revision` | sur | Herramientas y tiras junto a la pared; entrada sur libre para llegar a Iria. |
| `hoshai_senda_dosel` | sur, este | Senda acodada entre árboles altos y banco seco; salida este hacia el cordel. |
| `hoshai_estacion_cuerda` | oeste, este | Cordel entre dos árboles fuera del paso; continuidad este-oeste hacia Nhal. |
| `hoshai_campamento_lona` | este, sur | Tres cajas bajo la lona; acceso a Seran y desvío sur, sin resolver su reclamación. |
| `hoshai_cajas_camino` | norte | Dos cajas y fondo cerrado; la polea sigue siendo un objeto del estado del servidor. |
| `hoshai_sala_cuidados` | oeste | Banco ancho y caja de paños; acceso oeste a Ena, ventana sin salida al valle. |

## Fronteras conservadas

- `hoshai_garganta_oeste` sur ↔ `korven_meseta_relevo` norte.
- `hoshai_estribacion` sur ↔ `veyra_rampa_grava` norte.
- `hoshai_estacion_cuerda` este ↔ `nhal_relevo_altura` oeste.

## Arte pendiente y siguiente consumidor

Estado de todos los IDs de sala de la tabla: **pendiente**. Destino por convención:
`client-rpg/backgrounds/<asset_id>.webp`, 1280×960, ≤250000 bytes, sin actores.
No se declaran `background`/`foreground` con rutas inexistentes: el contrato ya
admite omitirlos y dibuja tiles. El ilustrador debe usar estas máscaras o ajustar
escena y Tiled juntos y repetir navegación al integrar los fondos.

Pendientes seis atlas NPC 192×384, celdas 64×96:
`hoshai_daren` → `sprites/daren.png`, `hoshai_luma` → `sprites/luma.png`,
`hoshai_yesa` → `sprites/yesa.png`, `hoshai_iria` → `sprites/hoshai_iria.png`,
`hoshai_seran` → `sprites/seran.png`, `hoshai_ena` → `sprites/ena.png`.
Iria de Hoshai usa un nombre distinto de `sprites/iria.png` (Iria de Edran).
El cliente conserva su reserva NPC actual hasta integrar los atlas y su mapping.

Pendientes `saltacresta`, `unapiedra` y `rasgacumbres`:
`sprites/<id>.png` (48×48) y `sprites/<id>-battle.png` (192×192).
Cascapedernal y adversarios humanos ya tienen sprites compartidos.
Fondo regional pendiente `backgrounds/hoshai_battle.webp`; se conserva el fallback
de combate actual, sin cambiar el cliente ni enlazar un archivo que no existe.
No se generan imágenes ni se cuentan estas salas como ilustradas: siguen 76/191
ilustradas y pasan a 105/191 escenas declarativas.

La polea no se pinta como objeto permanente en `hoshai_cajas_camino`: el estado
`hoshai_polea_recogida` cambia el relato a la variante canónica `sin-polea`.
Reservar `backgrounds/hoshai_cajas_camino_polea.webp` para la vista con objeto.
La integración visual deberá cubrir antes del acuerdo, recogida acordada y
recogida tras pelea; una sola acción ofrecida no describe todos esos estados.
El selector queda pendiente con el arte. No cambia la colisión al recogerla.

## Validación

- `/home/jdiaz/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q`:
  330 pruebas en 151,048 s, OK (una omitida). SQLite y cuentas aisladas.
- `tests.test_rpg_hoshai`: 2/2 OK; 29 salas, 59 salidas recorridas con acciones
  ofrecidas, seis diálogos, tres fronteras de ida y vuelta y HTTP de las escenas.
- `node scripts/check-rpg-client.mjs`: OK, 296 mapas; todos los spawns alcanzan
  las salidas con el contorno real del avatar; pies de los actores Hoshai libres.
- `npm run check:client`, `node --check client-rpg/rpg.js` y `git diff --check`: OK.
- Conversión Tiled exacta en ambos sentidos, perímetros cerrados y entidades
  canónicas completas, incluidos en la suite. No hay QA visual ni producción:
  el encargo es sin red y el arte continúa pendiente.

Registro de cierre: `../../RELEVO-vaisgard-rpg-codex.md`.
