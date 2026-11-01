# Arte de la Grieta Madre — 2026-10-31

Paso 2 de arte sobre las 16 salas nuevas de Korven. Recursos generados con `image_gen` nativo y preparados dentro de `client-rpg/`; cada recurso tiene sidecar con prompt, procedencia, dimensiones, bytes y SHA-256. Las ilustraciones `client/art/bestiary/*-anime-v1.webp` son las referencias de identidad de las criaturas.

## Fondos de exploración

Fondos WebP RGB de 1280×960, ≤250 KB. La paleta enlaza la pizarra gris de Korven con vetas azul/blanco discretas, humedad y zonas de calor; el centro mantiene suelo legible y las salas progresan hacia cristal más intenso. La pintura detallada sigue el tratamiento material de Korven. Los fondos están declarados en cada escena y fuente Tiled.

| Sala | Bytes | SHA-256 |
|---|---:|---|
| `korven_grieta_boca` | 245820 | `5ab5dfaa01ff601cb7cc502cf0af9e5839dce76d2e6b84162f045f74bdec3f7e` |
| `korven_grieta_ecos` | 243240 | `b13deee9f6ed8808c2aa0d3045a144e92bcf66326f18621b4c9a1332a6c844ed` |
| `korven_grieta_raices` | 248628 | `b6b7f6a39109093fb78d25677914b8970160613b2c135d40d6bc39439789d99b` |
| `korven_grieta_charca` | 246346 | `7ebe235867d74862c60c9cc3d7178d594c82b7e207ae9de753ff756a4995eb4c` |
| `korven_grieta_cantos` | 247630 | `8b9bfcbbcf80d7c060be825acdea2d5e6f1e6af56a00771276facd9ebdc6c72d` |
| `korven_grieta_descenso` | 238358 | `20bb7392c01f9f16b4e3e8a4af2c4ba6b465f6571970c8138f4ce62341bede8f` |
| `korven_grieta_geodas` | 242690 | `dc979e375e0425e6a54f3e4f288677dc3218f758fa3587eb2be0ce7c28e7409e` |
| `korven_grieta_telar` | 243242 | `c1ccfa302307f4db3e0e6afc2ea39aa75e4f3121ff2a5b759fcc4144f0f8bea1` |
| `korven_grieta_mirador` | 247714 | `e22d4ea3245c30901971183c3c4af0139f789fdee5fb1f2c596e2950d522541d` |
| `korven_grieta_sorda` | 234160 | `75ea3f75459fe355476550476b6c767e6627222169a55ffea2c17ec518341694` |
| `korven_grieta_vapores` | 230294 | `12d391d10f3413d3334678838adc1106f9857c502fa399b06e15a3ff2693f777` |
| `korven_grieta_nido` | 242616 | `0050ada3eac622685f6af6d351cf04a396de2a507044c98cffdcf6e25e079fd0` |
| `korven_grieta_fuente` | 244342 | `f9e29233c8a25b7d9ecf6daccab20996bd9153d70064c819120f99147129054a` |
| `korven_grieta_antecamara` | 244110 | `a37aa5a0df3e11ab6b8896f2e2254c80ccffd7f78ca806b3a89b8b1c0d147659` |
| `korven_grieta_corazon` | 247678 | `c6f998d0421e5740610d84a313d5b704c0e2cf664b60319032ac6efe5b218f59` |
| `korven_grieta_lecho` | 242688 | `bac357f93085d4d717748927a62b04d4fc114ef493b8609c79f320964e17f67c` |

## Fondos de batalla

El fondo `korven_grieta_battle.webp` se declara como `battle_background` en las 16 salas. La escena `korven_grieta_corazon` selecciona `korven_grieta_sierpe_battle.webp` para el encuentro de la Sierpe. Ambos recursos son WebP 1280×960 y ≤250 KB.

| Archivo | Bytes | SHA-256 |
|---|---:|---|
| `korven_grieta_battle.webp` | 232982 | `cd7652f2702122a783ad6a58a0ff86e2a44f83c16f491a48098f02870880ed8c` |
| `korven_grieta_sierpe_battle.webp` | 241692 | `ad6f191c830572a22d8c33e77a7eaf5c2760fb9765e605a8eda098037024d534` |

## Criaturas

Cada especie tiene PNG RGBA 48×48 para el mapa y retrato transparente para batalla. `tejecristal`, `quebrarrocas_canoso` y `sierpe_veta_madre` usan batalla 256×256; las demás 192×192. Los sprites mantienen anatomía y colores del bestiario. `creatureSprites` en `client-rpg/rpg.js` asigna cada ID canónico a su par de recursos.

| ID | Mapa | SHA-256 | Batalla | SHA-256 |
|---|---:|---|---:|---|
| `tallagrietas` | 48×48 · 2645 B · `f5b043275cbc10233b2edf7a18e9f6f900f62e7e26555435081d865dbbff31c3` | 192×192 · 48028 B · `b833bfd49dff8e35dda1af33eebd947bb9a34066e56ee7112cc0601630a430e4` |
| `cuarzarana` | 48×48 · 3604 B · `c12283007fc7c782fb15dc87638b47d5d44d3a76f8708e6fa24b08f895e33a5b` | 192×192 · 53606 B · `651ca7b72ae9f92a0e8602c8d8dfb8571342df53b7cb8da6e53a66574e5f9c97` |
| `vetasierpe` | 48×48 · 5498 B · `b6fee983650a49ef608752b58bdb5945317ef011e36f13d66073363791545fa7` | 192×192 · 73638 B · `07c91e6e21ac892120ef6401ec6823088cb79d8510ad60025479c0f1b9a8b1e0` |
| `rodacanto` | 48×48 · 4663 B · `29372050a3f5a910648ab6a9c00d2595aa9f49615cce0b9e872515250bd300e3` | 192×192 · 70916 B · `3648c5617b37da414ca4bac419cb1434cdddcc3fd7d56cc0681e2385722d5bd6` |
| `espinacuarzo` | 48×48 · 3154 B · `bb933c630987bc12589370de60cd52ac6fba43f3d9884dd439ab4ecfad49d410` | 192×192 · 60131 B · `1f354a60150740e4be696545cb973d14bf00ded29af2720f141b2ee3e2d510e0` |
| `tejecristal` | 48×48 · 3262 B · `6a5511b834668ca1822397235e0a845390eadf3e52c0f486242e4488f1626044` | 256×256 · 100153 B · `957d4a47134599a0bf9b9e053bd78007a8f12f9644889df341db74da8206d857` |
| `callaecos` | 48×48 · 3298 B · `f73de24fce86c02ee8d6b508afad3ab6d8ebf3d4dc293d161e7bef09df1ecab9` | 192×192 · 46310 B · `759a92664840103df376f123ac8815b2c16ffc567b06e65f87440f1986997eb1` |
| `brasaluz` | 48×48 · 3516 B · `7f691ca65e0c3bf5b18da6fc22b5d315d3d729bf9b4f5ad9300a32d9322723a8` | 192×192 · 44674 B · `2a090d2bb874692dd674a26f6676a4bc8ce649ee72c0b24584e04ace9c8d0493` |
| `quebrarrocas_canoso` | 48×48 · 3945 B · `65ac4c918a2b927b99fdac1107faa56c96fecd8b2830176d755e9b30f6ec0a9a` | 256×256 · 103733 B · `e912fac8d364abe1ef7624919149904c75c56c31fd2a1c11ccef0406391572cf` |
| `sierpe_veta_madre` | 48×48 · 6156 B · `86c2146d4258d2857e144e47c38405afc608478124f885609726e894e82b678e` | 256×256 · 148877 B · `4bd8e248235b74beed21cfd96275db3c7a738404ccc5f157163883ec56ed7e12` |

El punto de presentación de Rodacanto queda en `[7, 6]`, sobre suelo libre y sin solaparse con el borde del pozo.

## Validación

- Fondos: 16/16 salas con recurso 1280×960, ≤250 KB y SHA-256 coincidente con sidecar.
- Fondos de batalla: selector explícito comprobado en las 16 escenas; la Sierpe usa arena propia.
- Criaturas: 10 mappings y 20 recursos con dimensiones y canal alfa comprobados.
- `/home/jdiaz/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q`: 370 pruebas OK, 1 omitida.
- `node scripts/check-rpg-client.mjs`: OK; 414 mapas, anclajes Korven, 10 mappings y tamaños/transparencia de sprites.
- `npm run check:client`: OK.
- `git diff --check`: OK.
- Sin commit, push, PR, merge ni despliegue.
