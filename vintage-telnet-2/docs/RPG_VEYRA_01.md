# Veyra 01 — escenas sin ilustración

Escenas RPG y fuentes Tiled de las 32 salas canónicas de Veyra, incluida
`vaisgard_mercado` y las ocho salas del Bastión. Contenido tomado de
`content/regions/veyra.json`; no se modifican canon, motor, fórmulas ni balance.
Cada escena conserva salidas reales, NPC y criaturas por id, y espawns libres
para cada dirección de llegada. Las fuentes `.tmj` convierten de ida y vuelta
sin pérdida.

## Geometría provisional

Cuadrícula 20×15, tiles de 16 px, tileset de reserva `edran`; suelo según tipo
canónico y caminos de lectura visual. El perímetro queda cerrado excepto los
portales reales: norte/sur x=9–10, este/oeste y=6–7. El interior se mantiene
transitable para no inventar obstáculos antes de que el lote de arte ajuste las
máscaras a cada fondo. Los spawns cardinales usan [10,1], [10,13], [1,7] y
[18,7]; `default` usa [10,7]. NPC y fauna ocupan celdas libres distintas de
todos los spawns.

| Sala | Salidas reales |
|---|---|
| `vaisgard_mercado` | norte, sur, este, oeste |
| `veyra_plaza_rutas` | sur, norte, oeste, este |
| `veyra_calle_toldos` | oeste, sur, este |
| `veyra_barrio_cargas` | este, oeste |
| `veyra_patio_porte` | este, oeste |
| `veyra_patio_senales` | oeste, este |
| `veyra_patio_agua` | norte, sur, este |
| `veyra_huerta_baja` | norte, sur |
| `veyra_colina_vista` | norte, sur |
| `veyra_archivo_cargas` | oeste |
| `veyra_puerta_campos` | este, sur |
| `veyra_puerta_alta` | sur, norte |
| `veyra_puerta_piedra` | este, oeste |
| `veyra_puerta_juncos` | norte, sur |
| `veyra_puerta_sombra` | oeste, este |
| `veyra_rampa_grava` | sur, norte |
| `veyra_terraplen_roca` | este, oeste |
| `veyra_hondonada_canales` | norte, sur, oeste |
| `veyra_lindero_arboles` | oeste, sur, este |
| `veyra_cantera_callada` | norte |
| `veyra_sala_cuidados` | oeste |
| `veyra_vega_abierta` | norte, oeste, este |
| `veyra_pastos_exteriores` | oeste, este |
| `veyra_acequia_exterior` | oeste, este, sur |
| `veyra_mazmorra_umbral` | norte, oeste |
| `veyra_mazmorra_cuencas` | este, oeste, sur |
| `veyra_mazmorra_caudal` | este, sur |
| `veyra_mazmorra_cornisa` | norte, oeste |
| `veyra_mazmorra_mecanismo` | norte, este, oeste |
| `veyra_mazmorra_galeria_ecos` | este, oeste |
| `veyra_mazmorra_boveda_guardian` | este, norte |
| `veyra_mazmorra_recorridos_fin` | sur, este |

## Fronteras

- `veyra_puerta_campos` sur ↔ `edran_hito_campos` norte.
- `veyra_pastos_exteriores` oeste ↔ `edran_vista_cuenca` este.
- `veyra_rampa_grava` norte ↔ `hoshai_estribacion` sur.
- `veyra_terraplen_roca` oeste ↔ `korven_loma_cascajo` este.
- `veyra_hondonada_canales` sur ↔ `lethra_ribera_seca` norte.
- `veyra_lindero_arboles` este ↔ `nhal_arbol_umbral` oeste.

Las 6 fronteras regionales son simétricas con sus salas vecinas; en total hay
73 salidas declaradas. Se conserva una conexión canónica unidireccional:
`veyra_mazmorra_recorridos_fin` sale al este hacia `veyra_acequia_exterior`,
cuyo oeste conduce a `veyra_vega_abierta`. Las pruebas verifican esa excepción,
además de todas las salas, actores, spawns, portales, caminos alcanzables y
round-trip Tiled.

## Bastión y estados del dragón

Las ocho salas `veyra_mazmorra_*` conservan sus conexiones canónicas y actores.
`dragon_aguas_antiguas` está posicionado en `veyra_mazmorra_boveda_guardian`;
la escena sólo aporta su celda visual. La señal condicionada por
`dragon_vencido`, el estado `agua-libre`, el requisito de esa bandera para la
salida norte y el combate compartido siguen bajo autoridad del motor. No se
duplican ni alteran en el cliente.

## Estado de arte — CM-20, 2026-10-31

El lote Veyra Arte 03 añadió fondos a diez salas (`veyra_plaza_rutas`, las
cinco `veyra_puerta_*` del lote, `veyra_rampa_grava`, `veyra_sala_cuidados`,
`veyra_terraplen_roca` y `veyra_vega_abierta`), más el fondo regional de batalla
y los atlas NPC de Doma y Tov. La conexión de batalla por región también
atiende escenas Veyra sin propiedad explícita. Detalle, prompts, hashes y
validación en [RPG_VEYRA_ARTE_03.md](RPG_VEYRA_ARTE_03.md).

Quedan fuera de ese lote los fondos de las otras 22 salas, los atlas de Arel,
Bela, Nera y Seli, y los sprites RPG del dragón de Aguas Antiguas. Las
ilustraciones de las otras salas corresponden a las agentes paralelas del
encargo CM-20; esta actualización no modifica sus escenas ni sus fuentes Tiled.

## Validación

- `/home/jdiaz/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q`:
  355 pruebas OK (una omitida).
- `node scripts/check-rpg-client.mjs`: OK; 382 mapas pintados/generados,
  spawns y salidas alcanzables, incluidos los 32 escenarios Veyra.
- `npm run check:client` y `git diff --check`: OK.
- Sin QA visual ni validación de producción. Sin red, commit, push, PR, merge ni
  despliegue.
