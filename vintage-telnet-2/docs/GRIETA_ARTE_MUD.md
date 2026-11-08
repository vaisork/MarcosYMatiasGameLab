# Grieta Madre: ilustraciones del cliente MUD

Fecha: 2026-11-08. Encargo Claudi → Codi. Rama: `codex/grieta-arte-mud`. Base y `main` remoto comprobados al inicio: `38804d0c598ed91670b0af4d04fb7cea1185d221`.

## Resultado y alcance

- 16 escenas originales generadas con `image_gen` nativo; 32 WebP en `client/art/places/`.
- Principales: 1536 × 1024, tamaño nativo, WebP RGB calidad 90, método 6.
- Miniaturas: 384 × 256 desde el original PNG mediante Pillow `Image.Resampling.LANCZOS`, WebP calidad 85, método 6. Sin recorte ni deformación.
- 16 entradas añadidas a `client/ui-data.js`, nombres exactos de `korven.json` y caption estándar de `veyra_mazmorra_umbral`.
- `client/qa-art.mjs` ampliado para verificar las 16 salas, sus nombres, captions, rutas y cabeceras WebP.
- Sin cambios en `content/`, `client-rpg/`, servidor ni ilustraciones de otras salas.
- Referencias de composición: `client-rpg/backgrounds/<sala>.webp`. Referencias de estilo: `korven_mirador_grietas-anime-v1.webp` y `veyra_mazmorra_umbral-anime-v1.webp`.
- Canon visual: `description`, `day` y `examine` de `content/regions/korven.json`; para el Canoso y la Sierpe, también descripciones e imágenes existentes del bestiario.
- La Sierpe conserva anatomía de serpiente de cuarzo, sin patas, alas ni cuernos. Mudas vacías e intactas; sin gore, personas reconocibles ni texto legible. La inscripción de la Antecámara se omite para cumplir la restricción de imagen sin texto.

## Mapeo

Cada ID identifica la entrada de `placeIllustrations`. Archivos relativos a `client/art/places/`:

| Sala / asset_id | Nombre canónico | Ilustración | Miniatura |
|---|---|---|---|
| `korven_grieta_boca` | Boca de la Grieta | `korven_grieta_boca-anime-v1.webp` | `korven_grieta_boca-anime-v1-thumb.webp` |
| `korven_grieta_ecos` | Sala de los Ecos Tibios | `korven_grieta_ecos-anime-v1.webp` | `korven_grieta_ecos-anime-v1-thumb.webp` |
| `korven_grieta_raices` | Raíces de Piedra | `korven_grieta_raices-anime-v1.webp` | `korven_grieta_raices-anime-v1-thumb.webp` |
| `korven_grieta_charca` | Charca de los Cristales | `korven_grieta_charca-anime-v1.webp` | `korven_grieta_charca-anime-v1-thumb.webp` |
| `korven_grieta_cantos` | Pozo de los Cantos | `korven_grieta_cantos-anime-v1.webp` | `korven_grieta_cantos-anime-v1-thumb.webp` |
| `korven_grieta_descenso` | Escalera de las Vetas | `korven_grieta_descenso-anime-v1.webp` | `korven_grieta_descenso-anime-v1-thumb.webp` |
| `korven_grieta_geodas` | Bosque de Geodas | `korven_grieta_geodas-anime-v1.webp` | `korven_grieta_geodas-anime-v1-thumb.webp` |
| `korven_grieta_telar` | El Telar de Cuarzo | `korven_grieta_telar-anime-v1.webp` | `korven_grieta_telar-anime-v1-thumb.webp` |
| `korven_grieta_mirador` | Mirador de Cristal | `korven_grieta_mirador-anime-v1.webp` | `korven_grieta_mirador-anime-v1-thumb.webp` |
| `korven_grieta_sorda` | Galería Sorda | `korven_grieta_sorda-anime-v1.webp` | `korven_grieta_sorda-anime-v1-thumb.webp` |
| `korven_grieta_vapores` | Grietas de Vapor | `korven_grieta_vapores-anime-v1.webp` | `korven_grieta_vapores-anime-v1-thumb.webp` |
| `korven_grieta_nido` | Nido del Canoso | `korven_grieta_nido-anime-v1.webp` | `korven_grieta_nido-anime-v1-thumb.webp` |
| `korven_grieta_fuente` | Fuente Tibia | `korven_grieta_fuente-anime-v1.webp` | `korven_grieta_fuente-anime-v1-thumb.webp` |
| `korven_grieta_antecamara` | Antecámara de las Tres Vetas | `korven_grieta_antecamara-anime-v1.webp` | `korven_grieta_antecamara-anime-v1-thumb.webp` |
| `korven_grieta_corazon` | Corazón de la Veta Madre | `korven_grieta_corazon-anime-v1.webp` | `korven_grieta_corazon-anime-v1-thumb.webp` |
| `korven_grieta_lecho` | Lecho de la Muda | `korven_grieta_lecho-anime-v1.webp` | `korven_grieta_lecho-anime-v1-thumb.webp` |

## Evidencia

- Inspección visual de las 16 generaciones y de sus miniaturas finales: realizada.
- Decodificación con Pillow: 32 WebP válidos, dimensiones exactas; las 16 miniaturas coinciden byte a byte con la reducción Lanczos y codificación declaradas.
- Tamaño total de los 32 archivos: 7.818.422 bytes.
- `node client/qa-art.mjs`: PASS, incluidas 16 salas Grieta Madre, 8 del Bastión, 6 variantes y 27 miniaturas del bestiario.
- `git diff --check`: PASS.
- `/home/jdiaz/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q` desde `vintage-telnet-2/`: 405 pruebas en 130,577 s; `OK (skipped=1)`, sin fallos. Ejecutada una vez.
- Verificación de alcance: exactamente 35 archivos nuevos/modificados, los 32 WebP y los tres archivos de integración, QA y documentación indicados.
- En `scripts/` no hay un verificador vigente específico de estas miniaturas. `scripts/night-town-art-browser.mjs` es una prueba histórica que exige exactamente seis lugares; no aplica al catálogo actual. La comprobación vigente está en `client/qa-art.mjs`.
- Pruebas locales y datos aislados; no constituyen validación de producción ni despliegue.

## Registro y siguiente consumidor

Cuotas reutilizadas del encargo: Claudi, 08/11 09:34, Codex 5 h 73 %, semanal 61 %. Trabajo ejecutado por Codi sin subdelegación: alcance acotado con una única colección visual y un único punto de integración.

Entrega local para revisión de Claudi. Sin commit, push, PR, merge ni despliegue: el sandbox no permite escribir en el gitdir compartido ni en el registro del tablero fuera del worktree. Claudi debe registrar el resultado en el tablero, revisar el diff, hacer commit y continuar su flujo autorizado de publicación. Este archivo conserva resultado, evidencia y pendientes sin duplicar informes.

## Integridad de los archivos

| Archivo relativo a VT2 | Bytes | SHA-256 |
|---|---:|---|
| `client/art/places/korven_grieta_boca-anime-v1.webp` | 558104 | `3860d3882a0d501bb643308a9cca934ed827fae065b918e2701d8342044f61ba` |
| `client/art/places/korven_grieta_boca-anime-v1-thumb.webp` | 35302 | `1f00543330667f9328fcef25f2e0db4799dcc35f578b8146f976a98d68d7921b` |
| `client/art/places/korven_grieta_ecos-anime-v1.webp` | 407956 | `8c1d35041d25b51da7d0b1698491fea24c278c778ab3b1db66776cf673d9e273` |
| `client/art/places/korven_grieta_ecos-anime-v1-thumb.webp` | 27128 | `f473830aa66174062a115e677aca77637e8a9a3422cbb7785ffe4efbc898a91e` |
| `client/art/places/korven_grieta_raices-anime-v1.webp` | 444906 | `27375c76707cef020953b4372a95d671c287cd7d4b94e9a5c8a1f19a746ab8d2` |
| `client/art/places/korven_grieta_raices-anime-v1-thumb.webp` | 27906 | `0a749ae28300d26bde00b219b04da55e403a7a06405d0d83d76b51d5d2b6c88d` |
| `client/art/places/korven_grieta_charca-anime-v1.webp` | 472952 | `5a3042ed4615dfa4b8e971efb3ede2a151e5f22c31886796ed765cd8c0fc1fe2` |
| `client/art/places/korven_grieta_charca-anime-v1-thumb.webp` | 32316 | `23b4d18173ddb91be6360e1366362a1277bc31dd235b5b91d894705f37b444dd` |
| `client/art/places/korven_grieta_cantos-anime-v1.webp` | 377816 | `2273b8207ce719f996d51b7b82b50f7075654a6b2b50308e2e31a21944f2695e` |
| `client/art/places/korven_grieta_cantos-anime-v1-thumb.webp` | 28586 | `37224709e2ceb95cb882eee5dddf87de4376d692df95c7c634570e27b75b4d86` |
| `client/art/places/korven_grieta_descenso-anime-v1.webp` | 416038 | `abb43c2da913c3212278b9c9946044faa8c5b4dcce6af9f3c2a070abb415f55f` |
| `client/art/places/korven_grieta_descenso-anime-v1-thumb.webp` | 29962 | `636bf2da70b19ef7233457b221ba8b6d021f6fda1f15c5dbc3f04a3a585dfe6b` |
| `client/art/places/korven_grieta_geodas-anime-v1.webp` | 591888 | `15b9b06034a7fb9928d70605fb17520edf95ee4c4eb0c26b56b9ef0d8b6d29b4` |
| `client/art/places/korven_grieta_geodas-anime-v1-thumb.webp` | 39480 | `ac4cba24f3124590c4407268116875d6451bc977b5129430b1b6e401a9413347` |
| `client/art/places/korven_grieta_telar-anime-v1.webp` | 504396 | `f330985fef562e3768d19616aeda35a71d5d9504da34e4be7ff8d8815216d761` |
| `client/art/places/korven_grieta_telar-anime-v1-thumb.webp` | 31182 | `6340459f967883469e40cd9bf3b3eb6b38638f212ca4d6230d1e8bd3c0b485c1` |
| `client/art/places/korven_grieta_mirador-anime-v1.webp` | 411528 | `9e52f21ff1aa6b6af430aa3cad9b584253d4048f41d1ec8e11e5de1a1b82c39e` |
| `client/art/places/korven_grieta_mirador-anime-v1-thumb.webp` | 27540 | `9d49408d53e9c1e8ade345c8ee3e481a14664bb75dd8055dcfcd3b529e13acf1` |
| `client/art/places/korven_grieta_sorda-anime-v1.webp` | 290850 | `6b3a2bfcf36ca6519a4646c92766141cd3573fd75abaad4943ffa062efe21ee2` |
| `client/art/places/korven_grieta_sorda-anime-v1-thumb.webp` | 18144 | `e11cf0b325fcd56d0987d6d3eaee4c706b22718506f95c1a3cb88b68fc701da3` |
| `client/art/places/korven_grieta_vapores-anime-v1.webp` | 469294 | `f5d27ef977f261c68c614a2c620377704e337660534c83f5edc05de3d3cabec5` |
| `client/art/places/korven_grieta_vapores-anime-v1-thumb.webp` | 28958 | `7ecd508dd98bb72c1a5c9b19fcd13ad2fdda215ac71d763884742bb02fd9d062` |
| `client/art/places/korven_grieta_nido-anime-v1.webp` | 466336 | `386adb918d71218b01c58dcee7ee2e5135d58f6ae19c3f34e0829df61dff8eeb` |
| `client/art/places/korven_grieta_nido-anime-v1-thumb.webp` | 30660 | `b65e33bd21038035d5a02f3d283b72a0dc9c6b2acad965a49b5b1e9f42e1cba1` |
| `client/art/places/korven_grieta_fuente-anime-v1.webp` | 429194 | `12592e40d0d87d7c44d48ddbaf273ccdd346043515e39a1694a5ce113bcb3f79` |
| `client/art/places/korven_grieta_fuente-anime-v1-thumb.webp` | 29504 | `2190a7368d67502495819cf8133a0a17dd651c76923c8d6f187866bafcbfc081` |
| `client/art/places/korven_grieta_antecamara-anime-v1.webp` | 438710 | `77e003c0c7791da0ec0869274ee66b2825f10872bb69e45f4580a9b32474c7f4` |
| `client/art/places/korven_grieta_antecamara-anime-v1-thumb.webp` | 28478 | `f819c7917c86c080e825083eaa298adf9c1d87d6156100a3b219b0f2b2bd95db` |
| `client/art/places/korven_grieta_corazon-anime-v1.webp` | 558614 | `1c4f1297a228bb02ea388c34a7e7dd5367cf95ec979c631fb342acefb49c4fb8` |
| `client/art/places/korven_grieta_corazon-anime-v1-thumb.webp` | 35442 | `48c81eba9873a501cfc0efeb0bc4eaf33009dcc59ce09cfd3dd0c367e355adfa` |
| `client/art/places/korven_grieta_lecho-anime-v1.webp` | 499842 | `f26bcb68bf654219c76a5ef2fcffc88cecd3e99a3b81dc61259f1409138be4aa` |
| `client/art/places/korven_grieta_lecho-anime-v1-thumb.webp` | 29410 | `9ba8d08e71878c43fd2200c826fff988686027a98453ac5969fd11961a5cd7fb` |

## Prompts usados

Una llamada nativa por escena. La primera (`boca`) usó el prompt completo indicado abajo; las demás concatenaron el prefijo común y su texto específico. Las referencias se inspeccionaron previamente en la conversación, incluidas las 16 composiciones RPG.

### Prefijo común

Use case: stylized-concept. Create ONE original 1536x1024 landscape (3:2) place illustration for Vintage Telnet classic MUD. Match the previously viewed client/art/places anime-v1 references: detailed hand-painted anime background, restrained linework, richly textured natural stone, nuanced lighting, atmospheric depth, clear composition readable as a thumbnail. Use the matching named cell from the viewed RPG reference contact sheet ONLY as spatial/composition reference, adapting isometric tiles to immersive eye-level art. Canon prose takes precedence over RPG ornamental architecture. Natural underground limestone and quartz caves. No UI, text, letters, symbols, captions, borders, watermark, recognizable people, gore or dragons. One scene, no collage. 

### boca

Create one original landscape illustration, 1536×1024, 3:2, for Vintage Telnet classic MUD room korven_grieta_boca, Boca de la Grieta. Use the previously viewed images only as visual references: classic Korven limestone landscape and Veyra dungeon for detailed hand-painted anime environment style; RPG cave entrance for spatial composition, adapted to an immersive eye-level illustration rather than isometric game tiles. Scene: a naturally split, raised limestone slab over rough natural stone stairs descending underground. Damp rock and cool earth. Outside, a glimpse of the sunlit Brumak limestone plateau, ochre dry grasses and sparse greenery; deeper stairs dissolve into subdued blue cavern light. A rope tied at the dry watercourse descends within reach beside the stairs. A firm flat resting ledge near entrance. Stone surfaces weathered naturally, not chiseled architecture. Rich painted rock texture, clean restrained linework, atmospheric depth and readable composition at thumbnail scale, matching supplied anime-v1 place art. No text, lettering, symbols, UI, borders, watermarks, people, gore, dragons, buildings or invented props.

### ecos

korven_grieta_ecos, Sala de los Ecos Tibios: a broad cavern with a ceiling receding into darkness. Exactly three separated roof fissures let water drip into shallow puddles. A narrow thread of daylight from the entrance breaks into reflections on the pools; blue-white mineral highlights with a subtle warm reflected glow deeper inside. Three puddles and their ripples make the rhythmic three drops visually clear. Main broad floor and surrounding rock formations as ecos reference; quiet sense of warm echo.

### raices

korven_grieta_raices, Raíces de Piedra: large natural stone columns splay out like roots around a shallow pool. Brittle, opaque quartz filaments stretch across gaps between columns. Blue bounced light makes pale patches on muddy ground. Tiny footprints in the mud stop suddenly; parallel scratches climb the wall and disappear under a ledge. Frame the root-like stone bases and dark pool, like raices reference. The roots are rock, not trees.

### charca

korven_grieta_charca, Charca de los Cristales: shallow wide cavern pool with blue crystals visible UNDER clear water. Broad concentric ripples pass across the surface without falling droplets. Ceiling light makes blue refracted lines across the muddy bottom. On the opposite bank a stone wall curves down beneath a dark overhang. Very broad curved tracks in shallow mud lead beneath that ledge, suggesting a huge unseen serpent; do not show the creature. Use charca reference's pool-centered composition.

### cantos

korven_grieta_cantos, Pozo de los Cantos: a broad deep shaft cuts the cavern floor, surrounded by a bright rim of smooth ROUND river-worn pebbles and cobbles. Water-polished stones shine like still droplets; a few smaller stones rest loosely against the shaft wall. The shaft drops into blue darkness, framing its depth with natural limestone. Use cantos reference's central pit and curved surrounding path, but absolutely NO cut masonry, geometric pillars, square blocks, tools, rails or buildings. The rounded smooth stones must define this room.

### descenso

korven_grieta_descenso, Escalera de las Vetas: a broad natural stone slope descends in curves and rough steps between crystalline cavern walls. Exactly three bright mineral veins, in blue and gentle warm tones, light successive landings and lead the eye down into shadow. Beneath one loose foreground step a tiny edge of folded aged paper peeks out, with NO visible writing. Use descenso reference's winding switchback descent and cavern depth, but replace constructed rails or bridge masonry with natural stone edges. Immersive perspective, distinct descending path.

### geodas

korven_grieta_geodas, Bosque de Geodas: tall rounded geodes rise like thick hollow stone tree trunks, rough limestone outside and blue-violet quartz crystalline interiors. Delicate quartz threads span the passage between them; blue light travels along threads and scatters into little highlights. A SMALL translucent crystal insect with outstretched wings is caught intact in one foreground thread network, no injury, no blood. Many reflected corridors within geodes. Use geodas reference's clustered tall rounded crystal-lined formations and narrow winding walkways. Natural cavern, not trees.

### telar

korven_grieta_telar, El Telar de Cuarzo: a wide natural cave room entirely crossed by taut fine quartz threads stretched between tall rounded geodes. A very long-legged mineral spider walks at the center of the web, delicately touching the quartz without breaking it. Its eight long slender articulated legs and small quartz body are clearly spider anatomy, no human face. A shaft of light passing through threads casts one faint prismatic arc on the floor; glistening mineral silk traces below. Use telar reference's central suspended web spanning geodes, but immersive eye-level view. No posts or straight supports, no victims.

### mirador

korven_grieta_mirador, Mirador de Cristal: a natural rock shelf overlooks an immense abyss crisscrossed by blue luminous mineral veins. Foreground at chest height a hollow rounded geode protrudes from the rock; its dark blue-violet crystal-lined interior reflects soft light. The crossed veins converge toward a very distant central chamber far below the ledge. Use mirador reference's near ledge on one side, yawning blue chasm on other and hollow geode set into the wall. No built bridges, railings, torches or architecture. Strong depth and scale, quiet natural overlook.

### sorda

korven_grieta_sorda, Galería Sorda: a dark silent natural cave gallery. Exactly THREE prominent hanging crystal columns: one long, one medium, one short, each distinct against darkness. Subdued cold blue light outlines them. Undisturbed fine dust covers floor with NO footprints, and a slight cold mist hangs in air. At far end a tiny indistinct nonhuman crouching shadow is partly hidden within a rock fissure, no recognizable human features and no horror gore. Use sorda reference's receding passage and hanging crystals but strictly three principal pendants, natural rock instead of constructed balustrades.

### vapores

korven_grieta_vapores, Grietas de Vapor: a cavern corridor with several fissures releasing gentle warm steam in separate plumes. Fine white mineral dust covers the ground and enormous flat rock plates. Broad tracks pass between those plates along the wall toward the back. One ORANGE mineral vein illuminates a low cloud of steam, while cooler blue quartz glints in darker rocks. Match vapores reference's winding passage and warm vents. Naturally heated steam, not lava, fire or smoke; no built supports. Clear powdery ground and atmospheric low steam.

### nido

korven_grieta_nido, Nido del Canoso: a dry cavern with smooth walls and a heap of heavy whitened mineral plates in its center; several small tunnels rise toward the surface behind it. An old Quebrarrocas quietly guards the nest, standing beside the plates, environmental scale not a character portrait. Match the viewed bestiary reference for creature anatomy: squat powerful badger-like quadruped, grey-white fur and dark facial bands, broad clawed paws, thick overlapping stone armor along back, all dusted chalk-white. Small indistinct cub shadows underneath its protective plates. Calm alert gaze, not attacking. Use nido RPG reference's open round chamber and central plate pile, light warm mineral reflections with blue cave edges. No blood, no combat, no clothing.

### fuente

korven_grieta_fuente, Fuente Tibia: a quiet small turquoise hot spring underneath a cave ceiling; one thin thread of steam rises and disperses before reaching it. Beside the water a smooth stone shaped like an ancient shell is covered with a pale mineral crust, recognizable fossil shell form. In a DRY corner rests a single intact curved translucent crystal shed snakeskin, preserving a few huge annular coils, clearly EMPTY, uninjured, no flesh, no bones, no dragon, no living creature. Use fuente reference's intimate pool and pale shell-shaped rock on bank. Peaceful warm reflected highlights and soft blue light.

### antecamara

korven_grieta_antecamara, Antecámara de las Tres Vetas: a round natural rock chamber, three distinct hollows in one wall near a CLOSED heavy stone door. One hollow shines clear like crystal, one glows warm with rising steam, and the third is very dark and feels silent. Three mineral vein lines point toward the closed stone door. Use antecamara RPG reference's round chamber, perimeter hollows and southern door as spatial cues, adapting perspective to face the door. Natural stone chamber, restrained ancient stone door. OMIT inscription entirely, no marks, lettering, runes, sigils or readable text anywhere.

### corazon

korven_grieta_corazon, Corazón de la Veta Madre: an IMMENSE natural cavern vault, with blue mineral veins descending from very high ceiling like rivers of light, converging at center. There rests an enormous LIVING CRYSTAL SNAKE coiled around the deepest vein; each coil as broad as a wagon. Use the viewed Sierpe bestiary reference for continuous long serpentine body, faceted clear-violet quartz scales, smooth snake head, but GEODE eyes. Blue light runs through its scales like water under ice; a little warm internal light and steam between coils. Calm, newly awakened, head gently lifted, closed mouth, not angry. Dust suspended with its slow breathing. Show the room's grandeur around it, not a cropped monster portrait. Use corazon RPG reference's huge crystalline vault. STRICT ANATOMY: snake only, NO legs, arms, feet, wings, horns, antlers, dragon snout, or dragon. No battle, wounds or people.

### lecho

korven_grieta_lecho, Lecho de la Muda: a quiet chamber deep in a limestone and quartz cavern. In the foreground rests one entire old translucent crystalline SNAKE SHED SKIN in a loose spiral, preserving huge annular coils, visibly hollow, empty and luminous, no wound, blood or flesh. Beside it the deepest blue mineral vein glows softly. Farther back underneath a low rock overhang the living crystal snake sleeps curled mostly concealed, only subdued blue-violet scale reflections visible in shadow, no threatening head pose. Use lecho RPG reference's spiral on natural floor and calm blue crystal-lined walls. Peaceful still dust, soft dim blue light; distinguish empty shed skin foreground from sleeping intact serpent under rock. No legs, wings, horns or dragons.
