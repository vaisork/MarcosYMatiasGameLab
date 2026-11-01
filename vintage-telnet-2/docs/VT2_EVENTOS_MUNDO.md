# Eventos del mundo de VT2

El servidor activa los eventos al procesar solicitudes del juego y compara el reloj con la zona horaria configurada. No necesita un proceso periódico separado. Los clientes conectados reciben el evento en su siguiente actualización pasiva.

| Evento | Calendario del servidor | Cambio temporal |
|---|---|---|
| Feria del pueblo | Sábados, 10:00–16:00 | Anuncio y escena de feria; compras de los puestos cuestan 10% menos, redondeadas a sellos enteros. |
| Lluvia de estrellas | Día 15 de cada mes, 21:00–23:00 | Anuncio y escena compartida del cielo nocturno. |

El DM también puede iniciar cualquiera de los dos eventos por dos horas o terminar el evento activo desde `/dm`. La API DM admite duraciones de 1 a 12 horas y requiere la sesión protegida habitual. Los eventos no causan daño ni quitan progreso.

Las pruebas usan reloj simulado y almacenamiento SQLite temporal; no leen ni escriben partidas de producción.
