# Veyra arte 02 — fondos, Arel y Dragón de las Aguas Antiguas

CM-20 · 2026-10-31 · candidato local sobre `origin/main` `b193266` (escenas Veyra de PR #837). Rama `codex/c2-cm-20-veyra-arte-02`; cambios sin commit ni push.

Se ilustran las doce salas asignadas: ocho del Bastión y cuatro exteriores. Fondos de `image_gen` nativo, pixel art detallado con perspectiva 3/4, normalizados a 1280×960 WebP por debajo de 250000 bytes. Cada archivo `.webp.json` conserva prompt, origen, normalización, calidad, bytes y SHA-256. Las escenas y fuentes Tiled enlazan el mismo `background`.

| Sala | Bytes | Calidad | SHA-256 |
|---|---:|---:|---|
| `veyra_mazmorra_boveda_guardian` | 245730 | 59 | `3996623386a75c9b0fcb9c58230f671bdbf0a9a8cd3dfef71d0319c8cc13411a` |
| `veyra_mazmorra_caudal` | 241702 | 77 | `2f7d8b7706c34e78c3bdd3cc9a56e5102e419e425bc4ea96075b19cfda1ee5d6` |
| `veyra_mazmorra_cornisa` | 238116 | 75 | `c4f1cdacc5af15ec9590f7d1efcf34c31e6d69d77a04c6754c223268977b9f17` |
| `veyra_mazmorra_cuencas` | 245104 | 75 | `c67348e7467be00e8b5f7710c3df1555e7f07dbfd437f98f87faebc0b734447c` |
| `veyra_mazmorra_galeria_ecos` | 246102 | 81 | `dfc674323229c58aac391d9b3df1563ffd398a9cb23d8baea44acbbde88dce0d` |
| `veyra_mazmorra_mecanismo` | 243900 | 57 | `f41961d71ebfe4ad3276e69aef4ac8e50309b04ba6599d14b51809ed81e2139e` |
| `veyra_mazmorra_recorridos_fin` | 246666 | 77 | `8dc5d5177c320bc0a3bfd0b0e3ee9977e3d4a0ccdb1ea3baaeec47ab024003f1` |
| `veyra_mazmorra_umbral` | 239176 | 81 | `a25245c68ad6221946836f267132725213e5e4804816b4868487f8abac59b544` |
| `veyra_pastos_exteriores` | 249962 | 45 | `c535fae18b0079638df3ed0ef1a564a2111766690fab5329c97d25eba7bdd42e` |
| `veyra_patio_agua` | 247148 | 67 | `2c7de814685992f51294599c742633725676ced3b6c2383bba4c095b8598ac4a` |
| `veyra_patio_porte` | 248666 | 69 | `075aa6469723a8022a73e87a64379f27fed09bb85f40c2fa08449b6965a76b7c` |
| `veyra_patio_senales` | 245680 | 63 | `6bb7d040825fe365b42968a589d243070e4cb88945ca07ff956bd36d44dc54c4` |

La primera revisión de la máscara pidió rehacer bóveda, caudal y cuencas para hacer coincidir los portales con sus coordenadas y evitar sugerir salidas falsas. Las máscaras de bóveda, caudal, cornisa, cuencas, galería de ecos y patio de agua reflejan ahora el remolino, compuerta, vacío, pozas y corredor seco. Se conservaron IDs, salidas, rectángulos, spawns, criaturas y actores; las pruebas confirman rutas accesibles desde cada spawn.

## NPC y jefe

`sprites/veyra_arel.png` es una hoja RGBA 192×384, 12 cuadros de 64×96 (frente, izquierda, espalda y derecha; tres poses por dirección). Arel es una Vesperi mensajera de ruta con fundas diferenciadas para recados urgentes y ordinarios. Se quitó del atlas la cuadrícula de transparencia que el generador entregó como píxeles y se normalizaron los cuadros con escala uniforme y pies en y=92. Mapping `veyra_arel` añadido en el cliente.

El Dragón de las Aguas Antiguas conserva el diseño de las fuentes de Grok image_gen (`dragon-mapa.jpg` y `dragon-batalla.jpg`): fondo blanco/gris retirado a alfa, recorte, escala proporcional y padding transparente, sin rediseño. El mapa queda en 48×48 y la batalla en 256×256; el cliente escala el PNG de batalla al rectángulo de combate, por lo que el tamaño mayor no cambia su layout. `dragon_aguas_antiguas` queda mapeado a ambos recursos.

| Recurso | Dimensiones | Bytes | SHA-256 |
|---|---:|---:|---|
| `sprites/veyra_arel.png` | 192×384 | 71432 | `dc38a88b6a8f2ac2b9dba1ca549e36ff006d4c562fa9962a95c3ec38469a71c6` |
| `sprites/dragon_aguas_antiguas.png` | 48×48 | 4839 | `b96e2ec6cab48bc795e553c48b55047d5c310c3b0dd023a5065c7cb17b517c9e` |
| `sprites/dragon_aguas_antiguas-battle.png` | 256×256 | 81036 | `8cc2170a9d3bbfcf99de942b54ad6479bf84d4f136735351a2398e6ec18eef46` |

La función `battle_background` por escena está implementada y cubierta por el cliente; la bóveda usa `backgrounds/veyra_boveda_battle.webp`, normalizado desde `boveda-batalla.jpg` de Grok image_gen (1280×960, 188150 bytes, calidad WebP 95, SHA-256 `8f512a9beecf72ed8c6d0e0cd1b49158fcc793cf8fd58e96445ce372e5e55035`). No se añadió mecánica por criatura.

Créditos: fondos originales y Arel — OpenAI `image_gen` nativo; dragón y fondo de batalla — Grok image_gen, fuentes en `/home/jdiaz/proyectos/entregas/equipo/claude2/cm-20/grok-dragon/`. No se generó ni modificó arte de jugadores, Vaisork o Númenes. Los créditos de esta entrega quedan aquí; `sprites/CREDITOS.md` no se tocó.

## Validación y límites

- `node scripts/check-rpg-client.mjs`: OK; navegación, spawns/salidas, mapping del dragón, atlas de Arel y batalla de 256 px.
- `npm run check:client`: OK.
- `python -m unittest discover -s tests -q`: en la ejecución inicial, los casos de Veyra esperaban que ninguna escena tuviera arte. Se actualizó ese contrato para permitir exactamente estas doce salas y verificar sidecars, hashes, Tiled y el fondo de combate; repetir la suite completa después de la corrección.
- `git diff --check`: OK.
- Sin QA en navegador por instrucción; sin commit, push, PR, merge ni despliegue.
