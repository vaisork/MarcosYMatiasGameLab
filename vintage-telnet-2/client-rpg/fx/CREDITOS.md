# Efectos pixel art (fx/)

Hojas de sprites pre-renderizadas con [pixelfx](https://github.com/patchpixel/pixelfx) (commit 5294518), MIT License, Copyright (c) 2026 Patch.
`src/core/sim.js` y varios efectos de pixelfx adaptan los Pixel Art VFX de Sprite Fusion (https://www.spritefusion.com/pixel-art-vfx), Copyright (c) 2026 Hugo Duprez, MIT License; entre los usados aquí: hit-spark, crit-hit, blunt-hit, shield-block, poof, collect-burst, level-up, snow y falling-leaves.
No se incluye código de la librería en el cliente: sólo imágenes (`.webp` sin pérdida) e `index.json` (fps, cuadros, tamaño, columnas, pivote, bucle), reproducidas por `rpg.js`.

| archivo | efecto pixelfx | evento del juego |
|---|---|---|
| golpe | `impacts/hit-spark` (15 fps) | el enemigo pierde PV en la ronda |
| critico | `impacts/crit-hit` (15 fps) | pérdida ≥ 25 % de su PV máximo (mismo criterio que el sonido) |
| herido | `impacts/blunt-hit` (15 fps) | el personaje pierde PV |
| curar | `holy/heal` (15 fps, sin actor) | el personaje recupera PV en combate |
| defender | `impacts/shield-block` (15 fps, sin actor) | la acción enviada fue `defender` |
| huir | `spawn/poof` (15 fps) | fin de combate por huida |
| entrada | `impacts/impact-frame` (30 fps, paleta tinta/oro) | inicio de combate |
| nivel | `ui/level-up` (12 fps, sin actor, texto «SUBES DE NIVEL») | sube el nivel del personaje |
| brillo | `pickups/collect-burst` (15 fps, paleta oro/marfil) | victoria (tres destellos) y objeto obtenido fuera de combate |
| nieve | `weather/snow` (8 fps, recortado a 320×160) | ambiente en salas de montaña y región Cumbres |
| hojas | `weather/falling-leaves` (8 fps, recortado a 320×162) | ambiente en bosque y campo |

Regeneración: `node tools/render.mjs <id> --sheet --fps N [--no-actor] [--opts '{...}']` en el checkout de pixelfx y empaquetado con PIL (WebP sin pérdida cuando pesa menos que el PNG).
