# Respuesta del combate RPG — 2026-10-19

El cliente consultaba el resultado con una espera adicional de700ms después de cada respuesta; una consulta GET anterior también podía sobrescribir una decisión POST más reciente. La versión nueva reduce esa espera a250ms en combate, adelanta la consulta al entrar y después de decidir, y conserva una sola cadena de consultas. Mantiene4s de ronda del servidor y4s/8s de consulta fuera del combate.

Una versión local de mutaciones descarta consultas iniciadas antes de una decisión o cambio de sesión. La carga asíncrona de una escena tampoco puede sustituir una escena posterior. Las consultas periódicas esperan mientras se envía una acción; las consultas explícitas de aprobación, Continuar y logout siguen funcionando con la interfaz ocupada.

No cambia reglas, contenido ni persistencia. El servidor mantiene la autoridad; el bloqueo de una decisión por ronda y el identificador de reintento se conservan. No elimina latencia de transporte ni certifica fluidez desde un celular físico.

Validación: `node scripts/check-rpg-client.mjs` ejecuta los224mapas y también `check-rpg-network.mjs`, con respuestas diferidas y reloj de temporizadores simulado. Comprueba orden GET/POST/CSRF/escenas, bloqueo de ronda, acción incierta y reintento idéntico, una sola consulta en vuelo y cadena de temporizadores, recuperación de errores, visibilidad y consultas manuales. Sintaxis y `npm run check:client` aprobados. No suitePython por tratarse de cambio exclusivo del cliente.
