# Piloto visual de Vaisgard RPG — 2026-10-17

Javier pidió una mejora integral guiada por tres referencias: inicio ilustrado, exploración inmersiva y combate monumental, con interfaz azul y oro. Esta iteración incorpora esa dirección y conserva las seis salas y criaturas de Campos01. No representa todavía el acabado de las191 salas del mundo.

## Resultado

La entrada tiene bienvenida, acceso/registro, continuar y personajes; conserva autocompletado y estado durante solicitudes. La exploración llena el viewport, usa cámara proporcional y miniatura auténtica de la sala; menús y controles responden a información del servidor. El combate conserva sus rondas y muestra actores separados del fondo, telegráfo y barras reales, con controles que bloquean la segunda elección de la misma ronda.

Se corrigieron dos regresiones: Continuar carga una escena aunque los IDs de sala/personaje no cambien; las respuestas parciales de acciones conservan únicamente la metadata de cuenta/lista de personajes ya recibida del servidor. Cerrar sesión limpia esa información. Las llegadas y cambios de viewport eligen una celda local libre y alcanzable donde el avatar quede visible fuera de las superposiciones. No cambia la sala canónica, el motor, las colisiones, salidas, balance o SQLite real.

El único cambio de servidor permite servir fuentes TTF con nombre restringido. No se modifica CSP. Cinzel y su licencia se alojan localmente. Arte, créditos y referencia3D en [VAISGARD_RPG_ARTE.md](VAISGARD_RPG_ARTE.md); tokens de producto en [DESIGN.json](../client-rpg/DESIGN.json).

## Evidencia visual

| Vista | Móvil390×844 | Escritorio1366×768 |
|---|---|---|
| Inicio | [Captura](visual/rpg-piloto-mobile-title.webp) | [Captura](visual/rpg-piloto-desktop-title.webp) |
| Exploración | [Captura](visual/rpg-piloto-mobile-world.webp) | [Captura](visual/rpg-piloto-desktop-world.webp) |
| Batalla | [Captura](visual/rpg-piloto-mobile-battle.webp) | [Captura](visual/rpg-piloto-desktop-battle.webp) |

Capturas del cliente real mediante codex-browser, convertidas únicamente de PNG a WebP; no son mockups generados. Revisión visual independiente: ship, cerrados recortes de título, superposiciones, llegada invisible y captura prematura de desenlace. Móvil y escritorio de batalla muestran enemigo30/40, jugador92/100 y ronda1 activa.

## Pruebas y límites

- Suite completa del servidor:315 pruebas, OK, una omitida;135,494s. Registro externo `/tmp/rpg-visual-piloto-tests.log`.
- `node scripts/check-rpg-client.mjs`:11 grupos OK, incluidas200 escenas/mapas generados, geometría de avatar, bloqueo de ronda, formularios, cámara DPR1/DPR2, llegada visible y metadata de sesión.
- `npm run check:client`, `node --check client-rpg/rpg.js`, `git diff --check`: OK.
- Caminata por lógica real del cliente: Surcos→Acequia→Salida de huertos→Graneros→Salida de huertos→Huertos; cinco transiciones, todas con llegada libre. Después recorrido al Estanque para capturas.
- Batalla aislada: Atacar en ronda0 bloquea segunda elección; después de5,1s la ronda1 desbloquea, enemigo30PV y jugador92PV. Para capturar ambas composiciones de forma estable se congeló únicamente el reloj mock de la fixture después de esa verificación; no se modificó el juego.

Chrome visible se conectó por CDP, pero reportó la pestaña como oculta durante parte de la QA. Se invocaron explícitamente el render y los pasos de movimiento del cliente para esas comprobaciones; las transiciones y decisiones pasaron por las APIs reales de la fixture. Esto no certifica tacto físico en un teléfono. La base de pruebas fue efímera y no se usaron datos de producción. El servidor temporal incluye un cierre explícito fuera del repositorio y se verificó la liberación del puerto.

## Integración

Esta entrega se propone por PR742. Merge y despliegue siguen pendientes de autorización por iteración; no confundir pruebas locales, CI o revisión visual con despliegue. Producción conserva main8b62492 hasta verificar otra integración.
