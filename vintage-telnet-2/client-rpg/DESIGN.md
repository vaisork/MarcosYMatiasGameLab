# Dirección visual — 17 de octubre de 2026

Las tres referencias de Javier fijan la dirección: fantasía luminosa, mundo protagonista, azul profundo y oro trabajado. La selección del usuario prevalece sobre el catálogo de impeccable. Se sustituye la presentación anterior; se conserva la autoridad del servidor y la partida compartida.

## Piloto

- Inicio: paisaje vertical original de Edran entre arcos vegetales, título vivo en Cinzel y acciones HTML auténticas. El fondo no contiene texto, botones, personajes ni lugares nuevos identificados como canon.
- Exploración: escenario ocupa la superficie disponible. HUD flotante con datos reales, controles táctiles y navegación con etiquetas. Cámara visual sobre las coordenadas existentes; no modifica colisiones, salidas ni velocidad del servidor.
- Combate: claro rural ilustrado, actores reales separados del fondo, barras auténticas y opciones ofrecidas por el servidor. Las rondas conservan su duración y bloqueo.

## Material y lectura

Azul tinta `#060b13`, navy `#14243d`, oro iluminado `#f5d888`, oro de borde `#caa24e`, marfil `#f5eedb`. Los tokens efectivos están en `DESIGN.json`. El oro distingue bordes y títulos; el cuerpo utiliza marfil sobre superficies oscuras. Rojo, verde y ámbar distinguen acciones sin depender exclusivamente del color. Cinzel se aloja localmente con su licencia SIL OFL; el cuerpo conserva una fuente legible sin dependencias remotas.

Sin monedas, maná, compañeros, misiones o minimapas inventados. Los iconos geométricos son auxiliares y mantienen nombre accesible. Formularios, autocompletado, teclado, foco y movimiento reducido siguen siendo funcionales.

La ficha muestra título/rango, especialización y ecos del snapshot. Metas, recados diarios y logros usan los campos existentes del servidor en secciones desplegables que conservan su estado entre actualizaciones. El menú de batalla separa las capacidades de especialización y presenta la recarga base y las rondas restantes recibidas en la acción.

## Verificación

Revisión conjunta de inicio, exploración y combate en 390×844 y 1366×768; recorridos reales entre salas pintadas y genéricas; acciones de combate y espera de ronda; sesión y selección de personaje. Suite del servidor, validadores de cliente, revisión independiente de capturas y CI antes de proponer integración.

Los nuevos fondos son ilustraciones originales generadas para esta entrega; originales y prompts se conservan fuera del repositorio en `entregas/equipo/rpg-visual-piloto`. No añaden arte de jugador o Númen y no requieren un nuevo turnaround de personaje.

Al entrar o cambiar el tamaño del viewport, la presentación busca una celda libre alcanzable próxima al spawn o posición local donde el avatar completo quede fuera del HUD y controles. No modifica las escenas, colisiones, sala del servidor ni acciones; evita apariciones invisibles y rebotes sobre salidas. Los rótulos de escenario se escalan con la densidad de píxeles.

## Sonido (31 de octubre de 2026)

`sonido.js` sintetiza con Web Audio efectos y música chiptune; no hay archivos de audio. El AudioContext nace tras el primer gesto y se suspende con la pestaña oculta. Botón 🔊/🔇 en cabecera y HUD; Música y Efectos por separado en Menú → Más (preferencia en `localStorage`). Temas: uno por pueblo (Valdren, Khariel, Brumak, Narevia, Velmora, Vaisgard), descanso/hogar, campo, bosque, río, montaña, cuevas/canales, mazmorra, batalla por región y jefe. El mapeo sala→tema está en las tablas `MAPA_SALAS`, `BIOMA_*` y `PUEBLO_REGION` de `sonido.js`; `node scripts/check-rpg-sound.mjs` comprueba que toda sala resuelve a un tema. Los golpes, críticos y fallos se deducen de las variaciones reales de PV (el servidor no marca críticos). El cliente MUD no tiene sonido.
