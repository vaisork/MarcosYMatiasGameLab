# Korven RPG: La Grieta Madre — escenas 01

2026-10-31. Preparación visual sin ilustraciones para las 16 salas de La Grieta Madre.

Cada sala tiene una escena RPG de 20×15 y un mapa fuente Tiled (`client-rpg/scenes/` y `client-rpg/tiled/`). La geometría representa pasillos de roca, pilares, cristales, pozas y cambios de suelo con la capa `solid`; los portales y los puntos de llegada corresponden a las salidas cardinales de `content/regions/korven.json`. Los actores usan únicamente NPCs, señales y fauna declarados en el contenido.

Las escenas no declaran fondos ni arte nuevo. La sala `korven_cauce_observacion` incorpora el paso sur a `korven_grieta_boca`, con su portal y punto de llegada. No se altera contenido, combate, balance, servidor o cliente de juego.

## Validación

- `python -m unittest tests.test_rpg_scenes -q`: escenas, fuentes Tiled, entidades y salidas completas.
- `node scripts/check-rpg-client.mjs`: mapas pintados y generados navegables.
- `python -m unittest discover -s tests -q`: validación completa de VT2.
- `npm run check:client` y `git diff --check`.

Sin commit, push, PR, merge ni despliegue.
