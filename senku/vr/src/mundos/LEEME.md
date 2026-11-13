# Mundos

Cada `<id>.js` exporta `{ id, nombre, ambiente, crear(grupo, util) }` y puede añadir `actualizar(estado, dt, ctx)`, `objetivo` o `premio(ctx)`. Para agregar mundo: crear archivo, sumar import y entrada en `indice.js`, una entrada por cartel en `src/portales.mjs` el id en `catalogo.mjs` y arte `<mundo>.webp` en `texturas/portales/` (un arte por mundo; los carteles duplicados lo comparten); añadir tabla en README.
