# Nhal 01 — escenas sin ilustración, 2026-10-30

27 escenas declarativas y 27 fuentes Tiled `.tmj`, derivadas de `content/regions/nhal.json`. No cambia canon, cliente, servidor, motor, fórmulas ni balance. Fondos y sprites quedan sin referenciar hasta el lote de arte.

## Escenas

Cuadrícula 20×15, tiles de 16. Perímetro cerrado salvo rectángulos de salidas reales. Llegadas cardinales en las celdas interiores del borde correspondiente; sendero central y claros laterales mantienen el paso conectado. Las colisiones son troncos, raíces altas, mobiliario y límites; vegetación baja queda transitable. Tileset `edran` sólo es reserva de presentación, no define el arte final de Nhal.

| Sala | Salidas | NPCs | Fauna canónica posicionable | Referencia del canon |
|---|---|---|---|---|
| `nhal_arbol_umbral` | este, oeste | — | velomembrana, roecorteza, rondamusgo, rasgacorteza | Dos raíces más altas que un niño abren el paso bajo el primer árbol del bosque. Detrás, hacia el oeste, la luz dorada de… |
| `nhal_suelo_hojas` | oeste, este | — | quebracascara, roecorteza, rondamusgo, rasgacorteza, forajido_camino | Hojas rojas, amarillas y marrones cubren la senda como una alfombra. Donde pasan las cargas están rotas y aplastadas; a… |
| `nhal_tronco_acostado` | oeste, este, norte | — | escarbaraiz, roecorteza, quebracascara, rondamusgo, rasgacorteza | Hace mucho que este tronco enorme se cayó, y entre las ramas rotas de su copa brota un puñado de hongos pequeños, blancos… |
| `nhal_corteza_clara` | oeste, este, norte | — | hilaria_niebla, velomembrana, garfarrama, rondamusgo, rasgacorteza | Entre tantos troncos oscuros, este árbol de corteza casi blanca se distingue como una lámpara apagada. Por eso todos lo… |
| `nhal_raices_altas` | oeste, este | — | roecorteza, escarbaraiz, hilaria_niebla, rondamusgo, rasgacorteza | Las raíces levantan el suelo a los dos lados del sendero, como olas de madera quieta. Entre ellas se juntan trozos de… |
| `nhal_piedras_musgo` | oeste, este, norte | — | hilaria_niebla, escarbaraiz, rondamusgo, rasgacorteza | El musgo viste las piedras de un verde blando, salvo en la franja gastada por tantos pasos. Un hilo de agua oscurece las… |
| `nhal_puente_bajo` | oeste, este | — | quebracascara, garfarrama | Las tablas del puente se curvan para dejar sitio a los troncos de dos árboles vivos. Debajo, un cauce estrecho corre con… |
| `nhal_helechos_bajos` | oeste, este, sur | — | mordesombra, clavaespina, rondamusgo, rasgacorteza | Los helechos cubren el suelo como un mar verde de hojas en forma de pluma, pero la senda sigue por una franja más alta.… |
| `nhal_umbral_velmora` | oeste, este | — | rondamusgo, rasgacorteza | Las primeras casas de Velmora asoman entre los troncos, cada una con una lucecita junto a su tarea. Las lámparas Vesperi… |
| `velmora_centro` | oeste, norte, sur, este | — | — | El claro es amplio, y las raíces lo cruzan como caminos de madera. Casas y bancos se acomodan alrededor de ellas, sin… |
| `nhal_taller_cortezas` | sur, este | nhal_desi | — | Madera recién trabajada perfuma este taller abierto por un lado al aire del bosque. Un banco reúne recipientes en arreglo… |
| `nhal_secadero_sombra` | oeste | — | — | Una franja de luz cae entre las hojas sobre un juguete y un recipiente recién arreglados, puestos a secar. Aquí abajo la… |
| `nhal_mercado_setas` | norte, este, oeste | nhal_varo | — | Las cestas esperan bajo cubiertas separadas, con pasillos de suelo firme que esquivan las raíces. Cada cesta abierta… |
| `nhal_cocina_raices` | oeste, norte | — | — | Sobre una base seca de piedra arde el fuego, y el humo sube por una abertura del techo hacia las copas. Flota un aroma de… |
| `nhal_patio_relato` | oeste, sur, norte, este | nhal_leris | — | Bancos de alturas distintas rodean una mesa bajo una cubierta corta. Aquí se cuentan los recuerdos del pueblo, y quien… |
| `nhal_calle_hogares` | sur, norte | — | — | Las casas se reparten en pequeños niveles entre los árboles, unas más altas que otras, y las escaleras de raíz las unen.… |
| `nhal_claro_silencio` | sur | — | velomembrana, tronchacolmillo, rondamusgo, rasgacorteza | La luz baja directa entre las copas, por un agujero redondo, y cae sobre un claro pequeño. Una raíz hace de asiento, y a… |
| `nhal_agua_sombreada` | norte, sur | — | hilaria_niebla, clavaespina | El agua oscura se detiene entre las raíces, llena de hojas, y luego sigue junto al canal hacia Lethra. Desde un apoyo… |
| `nhal_ribera_relevo` | norte, sur | — | quebracascara, clavaespina, rondamusgo, rasgacorteza | Árboles y raíces acompañan el canal hasta una plataforma común, y un chapoteo suave golpea la madera de los apoyos. Al… |
| `nhal_sendero_altura` | sur, norte | — | forajido_camino, clavaespina, garfarrama, rondamusgo | La senda sube, y los árboles empiezan a separarse entre sí. Las raíces gruesas hacen de peldaños. Un descanso de raíces… |
| `nhal_roca_entre_copas` | sur, norte | — | velomembrana, garfarrama | Sobre Velmora, una roca ancha sobresale entre las copas, y desde ella el bosque parece un mar verde movido por el viento.… |
| `nhal_relevo_altura` | sur, oeste | — | — | Bajo una cubierta se guardan en fundas las notas de la ruta, y un cordel tendido fuera del camino marca dónde apoyar las… |
| `nhal_senda_recipiente` | oeste, este | — | rondamusgo, rasgacorteza | Entre helechos, una senda corta y callada va del patio a una casa de trabajo. Las hojas rozan las piernas al pasar. Junto… |
| `nhal_umbral_elin` | oeste | nhal_elin | — | La puerta de esta casa de trabajo está abierta, y sale un perfume de madera recién lijada. Sobre un apoyo descansa un… |
| `nhal_rincon_semillas` | sur | — | rondamusgo, roecorteza, escarbaraiz | Semillas, restos de comida y tierra removida se amontonan entre las raíces, igual que la despensa de alguien. En el musgo… |
| `nhal_raiz_marcada` | sur | — | rasgacorteza, tronchacolmillo, mordesombra | La corteza de esta raíz gruesa está recién rota, más clara que el resto, y parece una herida abierta. Hojas aplastadas y… |
| `nhal_sala_cuidados` | este | nhal_sira | — | Una ventana lateral deja pasar una luz suave que alcanza la mesa sin deslumbrar el asiento, como a los Vesperi les gusta.… |

## Fronteras conservadas

- `nhal_arbol_umbral` oeste ↔ `veyra_lindero_arboles` este.
- `nhal_relevo_altura` oeste ↔ `hoshai_estacion_cuerda` este.
- `nhal_ribera_relevo` sur ↔ `lethra_relevo_raices` norte.

Las escenas declaran exactamente las salidas del contenido. Spawns por dirección de llegada en celdas transitables. Las pruebas convierten cada Tiled de ida/vuelta, comparan NPC/fauna con ids reales y recorren desde cada spawn todas las salidas y ubicaciones de actores.

## Arte pendiente

Fondos de las 27 salas: `client-rpg/backgrounds/<room_id>.webp`, 1280×960, ≤250000 bytes, sin actores; `asset_id` igual al id de sala. Fondo de batalla regional: `backgrounds/nhal_battle.webp`. Ninguna ruta se declara en las escenas hasta que exista el arte.

Atlas NPC pendientes, 192×384, según id real: `sprites/nhal_desi.png`, `sprites/nhal_varo.png`, `sprites/nhal_leris.png`, `sprites/nhal_elin.png` y `sprites/nhal_sira.png`.

Criaturas pendientes con `sprites/<id>.png` (48×48) y `sprites/<id>-battle.png` (192×192):
`clavaespina`, `escarbaraiz`, `forajido_camino`, `garfarrama`, `hilaria_niebla`, `mordesombra`, `quebracascara`, `rasgacorteza`, `roecorteza`, `rondamusgo`, `tronchacolmillo`, `velomembrana`.
Las escenas posicionan ids de `signals` y `wildlife_pool`; su presencia visible depende del snapshot del servidor. No se generan imágenes.

## Validación

- `/home/jdiaz/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q`: 346 pruebas OK (una omitida); incluye 27 salas Nhal, fronteras, Tiled e integridad de navegación.
- `node scripts/check-rpg-client.mjs`: OK; 350 mapas pintados/generados, spawns y salidas alcanzables con el volumen real del avatar, huellas de actores Nhal libres.
- `npm run check:client`: OK.
- `git diff --check`: OK.
- No hay QA visual ni validación de producción; este lote sólo prepara escenas y fuentes.
- Sin red, commit, push, PR, merge ni despliegue.
