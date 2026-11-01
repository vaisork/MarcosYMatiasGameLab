# Veyra arte 03 — 2026-10-31

Entrega local para la rama `codex/c2-cm-20-veyra-arte-03`, sobre la base
`origin/main` disponible al iniciar (`b193266`, escenas Veyra de PR #837).
Sin commit ni push.

## Fondos de sala

Fondos originales generados con image_gen nativo, normalizados a 1280×960 WebP
(≤250000 bytes). El muestreo 640×480 ampliado 2× por vecino más cercano alinea
la imagen con la cuadrícula RPG 20×15. Cada `.webp.json` adyacente contiene el
prompt, procedencia, dimensiones, método, calidad, bytes y SHA-256. La composición
respeta las salidas canónicas; Puerta de los Campos y Puerta del Bosque se
regeneraron/editaron para cerrar bordes que no son salidas.

| asset_id / recurso | Dimensiones | Bytes | Calidad WebP | SHA-256 |
|---|---:|---:|---:|---|
| `veyra_plaza_rutas` | 1280×960 | 223760 | 76 | `f932e3a34f4462b460e0f6c3b6596ba71c2f1ec63a552657d045c3ca0690b6c9` |
| `veyra_puerta_alta` | 1280×960 | 240860 | 76 | `c96d183bd56c5d0e9eadf450661856120818123201fb6769a6120628f1387888` |
| `veyra_puerta_campos` | 1280×960 | 241550 | 56 | `790c141e43b2485586d34b9e377f8982d9ad95ba4f8eb6ca7475c46aebfdb5d1` |
| `veyra_puerta_juncos` | 1280×960 | 216518 | 76 | `02bf73dcc7ad6e791d86a928abc549791fecbdeaa11a89596de363d8f34295ad` |
| `veyra_puerta_piedra` | 1280×960 | 232594 | 76 | `342ac47e0fe21fcb3877b19fc7a23f50b84b44b0cbdb0b874d766f325f016d98` |
| `veyra_puerta_sombra` | 1280×960 | 247104 | 60 | `b3b6f2be13072e26e8f0a2a60fbb2241d97d1e54488d42098c79d968e314409e` |
| `veyra_rampa_grava` | 1280×960 | 244448 | 64 | `fc56ac9c534526b65395ad0dec2bfe15a65988e71df96ae364d8369e82d538ca` |
| `veyra_sala_cuidados` | 1280×960 | 231144 | 88 | `e1a9f48ec4c02d3d9f94d3d6f7e98db21a6911009454676a95d97d58ee31bf31` |
| `veyra_terraplen_roca` | 1280×960 | 243614 | 68 | `748204426e39ea0b77c4533a4defdc6408eac0d4f3a96aa31dc29286ef6e60d9` |
| `veyra_vega_abierta` | 1280×960 | 248864 | 56 | `fe73525243e2911e1de781882f5563ca4dc78154d8daaa7276e985f3d7539b82` |

Los diez `scenes/<id>.json` y sus fuentes `tiled/<id>.tmj` declaran el fondo
correspondiente y `backgrounds/veyra_battle.webp`. Las máscaras de colisión se
ajustaron a los bancos de la plaza, torres, parcelas, agua de la puerta de
juncos, hoja de puerta, grava, camillas/mesa y rocas del terraplén. Se
conservaron IDs, spawns y rectángulos/direcciones de salida. Vega y Puerta de
Piedra no necesitaron más colisiones que las ya presentes.

## Combate regional y NPC

`veyra_battle.webp` usa el formato 1280×960 WebP de `korven_battle.webp` y un
sidecar completo. `battleBackgroundImage()` selecciona este fondo para la
región Veyra; diez escenas del lote también declaran la propiedad explícita,
mientras las otras escenas Veyra heredan la selección regional sin alterarlas.

| asset_id / recurso | Dimensiones | Bytes | SHA-256 |
|---|---:|---:|---|
| `veyra_battle` | 1280×960 | 238678 | `6d1a88087dbed250637a5be59e31905e79ae797fbe19b378f78d47a05c63b673` |
| `veyra_doma` | 192×384 (12 celdas de 64×96) | 47012 | `75c7cf70a19f27665c525be8c8562e3e1c40f7f0d63aab8cace2fb35e366a87a` |
| `veyra_tov` | 192×384 (12 celdas de 64×96) | 50182 | `cc2ecc02ae192eb428ef38289271ec9a0130109e321b9b84e109e6d44d771aca` |

Doma y Tov son NPC canónicos, no jugadores, Vaisork ni Númenes. Sus atlas
transparentes de 4 direcciones × 3 poses se conectan al ID canónico mediante
`client-rpg/rpg.js`. Los sidecars `.png.json` registran prompts, dimensiones,
normalización, bytes y SHA-256. Los créditos de este lote quedan en este
documento; no se modificó `sprites/CREDITOS.md`.

## Geometría y límites

- Salidas: plaza cuatro rutas; Puerta Alta, Puerta de Juncos y Rampa norte/sur;
  Puerta de los Campos este/sur; Puerta de Piedra y Puerta del Bosque este/oeste;
  sala de cuidados oeste; terraplén este/oeste; vega norte/oeste/este.
- Máscaras y Tiled se reconciliaron con los fondos; spawns, NPC y criaturas
  permanecen en celdas transitables. No se modificaron salas, escenas o fuentes
  Tiled fuera del lote de diez.
- Se conserva el fallback regional de batalla para las otras salas Veyra; no se
  cambia su contenido ni sus archivos.
- No se hizo QA en navegador por indicación del encargo; corresponde a la agente
  de QA posterior.

## Pruebas solicitadas

- `/home/jdiaz/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q`:
  pendiente de resultado al redactar.
- `node scripts/check-rpg-client.mjs`: pendiente de resultado.
- `npm run check:client`: pendiente de resultado.
- `git diff --check`: pendiente de resultado.

