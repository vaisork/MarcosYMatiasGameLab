# Lethra arte 03 — fondos y fauna, 2026-10-30

Sexta siguiente tanda alfabética de salas `lethra_*` sin fondo después de Lethra arte 01 y 02: Patio de ventanas, Pasarela curva, Plataforma de secado, Raíces de observación, Relevo de raíces y Ribera firme. Base `origin/main` `c921caf`; rama `codex/c2-cm-20-lethra-arte-03`. Sin commit ni publicación.

Se añadieron seis fondos generados con image_gen nativo, 1280×960 WebP y menos de 250000 bytes. Se normalizaron mediante reducción Lanczos a 640×480 y ampliación nearest-neighbour a 1280×960, WebP calidad 42. Cada `.webp.json` contiene prompt, fuente, dimensiones, calidad, bytes y SHA-256. Los fondos se cotejaron visualmente con `layers.solid`, spawns y salidas; se mantuvieron intactos IDs, máscaras, actores, posiciones y salidas. La propiedad `background` está en cada escena y en su mapa Tiled.

| Sala | Fondo | Bytes | SHA-256 |
|---|---|---:|---|
| `lethra_patio_ventanas` | `client-rpg/backgrounds/lethra_patio_ventanas.webp` | 167552 | `63a836bbb96075b32f09210945f7cb2db18f5abf47bc3b132d4409914dcfc829` |
| `lethra_pasarela_curva` | `client-rpg/backgrounds/lethra_pasarela_curva.webp` | 153254 | `21aacd59cea856afcc1efc911410b1465c9fd9d09a63c8f7e17c52e51cd9d0a8` |
| `lethra_plataforma_secado` | `client-rpg/backgrounds/lethra_plataforma_secado.webp` | 154236 | `49153d71a1304729ca765dd9dd537b54554623eeb309aae3a7bd0ff7335efda8` |
| `lethra_raices_observacion` | `client-rpg/backgrounds/lethra_raices_observacion.webp` | 193854 | `de27b3ff4b0d8ba9e9674bc0ebbc603a59e197de381c50e66f5dc7045480c57b` |
| `lethra_relevo_raices` | `client-rpg/backgrounds/lethra_relevo_raices.webp` | 197352 | `775cb31ae4e6e11b074be91e5b89432b7d8822d4cb85b02b9b4f5aa34de79aed` |
| `lethra_ribera_firme` | `client-rpg/backgrounds/lethra_ribera_firme.webp` | 167278 | `cb9572a43796b8fee368b303f66b3ba73195d382adf5f1f5cbce021cdb671abe` |

`lethra_raizacapa` no tenía sprite RPG. Se añadió su sprite transparente de mapa en 48×48 y de batalla en 192×192, con sidecars de prompt, fuente, dimensiones, bytes y SHA-256, y mapping en `client-rpg/rpg.js`. No hay NPC nuevos en estas seis salas; no se generó arte de jugador, Vaisork ni Númenes. El diseño del reptil sigue `content/world.json` y `client/art/bestiary/raizacapa-anime-v1.webp`. Las composiciones de lugar siguen `content/regions/lethra.json` y sus ilustraciones en `client/art/places/`.

## Validación

- `/home/jdiaz/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q`: 345 pruebas OK, una omitida (179.478 s).
- `node scripts/check-rpg-client.mjs`: OK; 323 mapas y rutas, fauna map/battle 48×48/192×192.
- `npm run check:client`: OK.
- `git diff --check`: OK.
- Los seis mapas Tiled convierten ida y vuelta sin pérdida; los fondos verifican 1280×960, peso ≤250000, SHA-256 y propiedad Tiled. Sprites transparentes verifican dimensiones y SHA-256.
- Revisión visual de los seis fondos con `layers.solid`, spawns y salidas; la primera asignación errónea de Patio se corrigió antes de validar. No se hizo QA en producción ni navegador.

No se modificó contenido autoritativo, servidor, motor, balance, otros juegos ni servicios. Sin commit, push, PR, merge ni despliegue.
