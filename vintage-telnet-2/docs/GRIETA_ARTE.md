# Arte de bestiario — La Grieta Madre

Fecha: 2026-10-31. Encargo E5 de `DISENO.md` §10.

Diez ilustraciones generadas con `image_gen` nativo, usando como referencia de estilo `client/art/bestiary/mordelinde-anime-v1.webp`. Ilustración principal WebP 1536×1024; miniatura WebP 384×256 (Lanczos), según el formato visual vigente del bestiario. Sin gore. La Sierpe se representa como serpiente de cuarzo sin rasgos de dragón.

## Mapeo para `content/world.json`

Para cada criatura, el valor que E2 debe poner en `illustration` es la ruta indicada. Este trabajo no modifica `content/world.json`.

| asset_id / id | illustration | Archivo miniatura | Dimensiones principal / miniatura | SHA-256 principal | SHA-256 miniatura |
|---|---|---|---|---|---|
| `tallagrietas` — Reptil bajo de placas de pizarra y cola larga enroscada. | `/client/art/bestiary/tallagrietas-anime-v1.webp` | `tallagrietas-anime-v1-thumb.webp` | 1536×1024 / 384×256 | `30ae17ccef7ef63423bdc9627cb99483ad699dc9d5c2d1aa689f13dc486eeae7` | `9b0a6f997710d2e5e9a5fee2a56e6e95f7994966635d1430f12cd796c070f398` |
| `cuarzarana` — Araña cavernaria con patas de cuarzo y abdomen de amatista. | `/client/art/bestiary/cuarzarana-anime-v1.webp` | `cuarzarana-anime-v1-thumb.webp` | 1536×1024 / 384×256 | `dc7742d70d92ecee3613f0a8afc15fa2961df16064b9a1239fd6b47e02491fc8` | `c2e8680407b90311d43b66e39ac1bb70d60fc06ea4217c2a5d8eb13e3f9cdedb` |
| `vetasierpe` — Serpiente segmentada de pizarra y vetas cristalinas. | `/client/art/bestiary/vetasierpe-anime-v1.webp` | `vetasierpe-anime-v1-thumb.webp` | 1536×1024 / 384×256 | `43ffba4d1be5f1f03748aec54242ac15074cecc74b9487f0da3bc8430afa47c5` | `9a8f3a2d0d90a0993c6d5550ebd58b8aba3514d320c492741967562813bccf48` |
| `rodacanto` — Bestia acorazada de placas pétreas, preparada para hacerse bola. | `/client/art/bestiary/rodacanto-anime-v1.webp` | `rodacanto-anime-v1-thumb.webp` | 1536×1024 / 384×256 | `4f6787ccf449b2513e6bf35c4e2303ca253a073a8776ee7d50b1d87fffea8131` | `23bf33b2e034e4e9eb22d986491ee7534f31afecf002df640bb4b5dfdc8803a8` |
| `espinacuarzo` — Lagarto cavernario con cresta de espinas de cuarzo translúcido. | `/client/art/bestiary/espinacuarzo-anime-v1.webp` | `espinacuarzo-anime-v1-thumb.webp` | 1536×1024 / 384×256 | `d46687563737a32179df3177841bf8655f6cce27779bddfe425c816836f84f01` | `261e4c139ebe9c13d23749b36f604f773e9e5eb02f8226af1d4ec20525e1c3a4` |
| `brasaluz` — Salamandra cobriza con branquias minerales luminosas y vapor tibio. | `/client/art/bestiary/brasaluz-anime-v1.webp` | `brasaluz-anime-v1-thumb.webp` | 1536×1024 / 384×256 | `dab6b52386c229338105e80e16e45a73f1a7819de49369d8d7b562f002ddf166` | `43d89a53223e4a4de26f9a125779fdce182ea23971823c7c29c0f055561fa6ad` |
| `callaecos` — Depredador de sombra, orejas grandes y patas plegadas para saltar. | `/client/art/bestiary/callaecos-anime-v1.webp` | `callaecos-anime-v1-thumb.webp` | 1536×1024 / 384×256 | `50e2d4dbafa478a851e1da9d31f31aa724e2dcac877e54b2576c03f56ae89ad0` | `65ed0889cf3708c5b65d26aa2e38556afe9a97c7ce3d2491af2928c55f85d0ed` |
| `quebrarrocas_canoso` — Bestia anciana de hombros pesados, pelaje gris y armadura de lajas. | `/client/art/bestiary/quebrarrocas_canoso-anime-v1.webp` | `quebrarrocas_canoso-anime-v1-thumb.webp` | 1536×1024 / 384×256 | `67c318ae7582ea6e2289484f392b2acb30c0da7999c2c4dc770cb0444d84ac97` | `196296e9efa56df8343259137f94360920eacc49564307268c8501fa1621819f` |
| `tejecristal` — Araña jefe de amatista con una telaraña de hilos cristalinos. | `/client/art/bestiary/tejecristal-anime-v1.webp` | `tejecristal-anime-v1-thumb.webp` | 1536×1024 / 384×256 | `018efc5a9c0c70b45eff8de4ec1500e01ee2a8ad4b87b01d922b07207813f511` | `f05d5e39e58e7f9c49a326be3c514bfc8e1d57416854a7aa2b768558cdf5b02e` |
| `sierpe_veta_madre` — Serpiente cristalina sin patas ni alas; cuerpo de placas transparentes, claramente no dragón. | `/client/art/bestiary/sierpe_veta_madre-anime-v1.webp` | `sierpe_veta_madre-anime-v1-thumb.webp` | 1536×1024 / 384×256 | `728574274ad8c3bed46af3c31c41a505e5c973fd8a8f35ba7334c54e3f2e1cc5` | `2771069f4ed676b8e05bcd9622488a04c38a5d9ded44b31162b524970306b8d6` |

Los registros de miniaturas incluyen los tamaños en bytes, dimensiones, SHA-256 de miniatura y original, y el mapping de la ilustración en `client/art/bestiary-thumbnails.json`. Los diez IDs del bestiario quedan como `creatures` individuales en ese manifiesto.

## Alcance

Completado: las diez ilustraciones del bestiario de E5 y sus miniaturas. No se produjeron los fondos RPG de las 16 salas: son opcionales en este encargo y corresponden a escenas que todavía no existen.
