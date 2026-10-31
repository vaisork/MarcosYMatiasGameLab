# Lethra 01 — escenas y fuentes Tiled, 2026-10-30

27 escenas declarativas y 27 mapas `.tmj`, derivados de `content/regions/lethra.json`.
Incluye las 26 salas `lethra_*` y `narevia_centro`. No cambia contenido, cliente,
servidor, motor, fórmulas ni balance. Las escenas omiten fondos y sprites aún no
producidos; el render de tiles existente queda como reserva.

## Salas

Los nombres, salidas, NPC y fauna proceden del canon. La máscara conserva libres
las pasarelas, caminos, llegadas y salidas. Los bancos de agua, raíces, postes,
plataformas y mobiliario ocupan celdas sólidas fuera de la ruta conectada. Los
mapas de asentamiento usan suelo de plataforma; las zonas de ribera reservan las
orillas exteriores para agua. La máscara queda disponible para el lote de fondos,
que deberá cotejarla con cada ilustración.

| Sala | Salidas | Composición canónica |
|---|---|---|
| `lethra_ribera_seca` | norte, sur | Ribera seca entre raíces y tallos altos. |
| `lethra_tierra_esponjosa` | norte, sur | Franja firme entre hojas y barro húmedo. |
| `lethra_juncal_abierto` | norte, sur, oeste | Apertura entre juncos, con desvío al banco. |
| `lethra_tablas_primeras` | norte, sur | Tablas bajas sobre barro y vara de prueba. |
| `lethra_cruce_canales` | norte, sur | Remanso junto a canal rápido y plataforma. |
| `lethra_ribera_firme` | norte, sur | Apoyos secos para recipientes y cargas. |
| `lethra_pasarela_curva` | norte, sur | Pasarela curva elevada sobre el agua. |
| `lethra_embarcadero_camino` | norte, sur | Embarcadero cubierto y postes de nivel. |
| `lethra_senda_elevada` | norte, sur | Senda alta entre viviendas y plataformas. |
| `narevia_centro` | norte, este, sur, oeste | Plaza insular con uniones a cuatro pasarelas. |
| `lethra_taller_fibras` | oeste, sur, este | Taller abierto al canal; NPC Mira. |
| `lethra_plataforma_secado` | norte, este | Barras separadas para paños remendados. |
| `lethra_banco_conversacion` | oeste, sur | Banco lateral frente al canal y cocina. |
| `lethra_cocina_reunion` | norte | Cocina sobre suelo seco; NPC Nima. |
| `lethra_mercado_hojas` | norte, sur | Puestos elevados para cestas y comida; NPC Nera. |
| `lethra_muelle_vecinal` | norte, este | Muelles a distintas alturas y cestas. |
| `lethra_patio_ventanas` | norte, este, oeste | Patio de canales entre ventanas y entradas. |
| `lethra_cuidado_barcas` | oeste | Plataforma de reparación; NPC Sola. |
| `lethra_banco_barro` | este, sur | Banco firme junto al canal oscuro. |
| `lethra_orilla_silente` | norte, oeste | Orilla profunda y apoyos de raíces. |
| `lethra_raices_observacion` | este | Raíz seca y nota, fuera del canal. |
| `lethra_ribera_oeste` | este, oeste | Cubierta de ribera antes del camino a Edran. |
| `lethra_hito_tierra` | este, sur, oeste | Franja alta con hitos de crecidas. |
| `lethra_ribera_sombra` | sur, norte | Pasarela corta bajo árboles y hojas. |
| `lethra_relevo_raices` | sur, norte | Plataforma de raíces en la entrada de Nhal. |
| `lethra_escucha_aves` | norte | Raíz de asiento frente al remanso. |
| `lethra_sala_cuidados` | oeste | Asiento cubierto y paso seco; NPC Ume. |

## Fronteras

- `lethra_ribera_seca` norte ↔ `veyra_hondonada_canales` sur.
- `lethra_hito_tierra` oeste ↔ `edran_puente_juncos` este.
- `lethra_relevo_raices` norte ↔ `nhal_ribera_relevo` sur.

Las escenas declaran exactamente los destinos del contenido; los spawns llevan
el nombre de la dirección de llegada y caen en celdas libres. Las salidas usan
rectángulos de borde de 2×1 o 1×2. La prueba verifica el camino desde cada spawn
hacia todas las salidas y las posiciones de cada actor.

## Arte pendiente

Fondos por sala (todos pendientes):
`client-rpg/backgrounds/<room_id>.webp`, 1280×960, hasta 250000 bytes, sin actores.
El `asset_id` coincide con cada id de sala de la tabla. Fondo de batalla regional:
`backgrounds/lethra_battle.webp`.

Atlas NPC pendientes, 192×384, según el id real:
`sprites/<npc_id>.png` para `lethra_mira`, `lethra_nima`,
`lethra_nera_mercado`, `lethra_sola` y `lethra_ume`.

Fauna pendiente, `sprites/<id>.png` (48×48) y
`sprites/<id>-battle.png` (192×192):
`cienfango`, `dorsalodo`, `mordijunco`, `pinzajunco`, `saltalodo`, `tragacharco`,
`cortacorriente`, `faucecieno`, `sombranutria`, `forajido_camino`, `aguaculebra`
y `raizacapa`. La escena posiciona solo ids presentes en `signals` o
`wildlife_pool`; su aparición sigue dependiendo del snapshot del servidor.

## Validación

- Suite completa: 345 pruebas, OK (una omitida), incluye 27 salas Lethra,
  escenas, fuentes Tiled, ids canónicos, fronteras y rutas desde cada spawn.
- `node scripts/check-rpg-client.mjs`: OK; 323 mapas, spawns y salidas alcanzables
  con el volumen del avatar.
- `npm run check:client`: OK.
- `git diff --check`: OK.

Sin generación de imágenes, red, commit, push, PR, merge ni despliegue.
