# Agentes de Vintage Telnet 2

Lee `README.md`, `docs/DECISIONES_VIGENTES.md`, `CONTENT_CONTRACT.md` y sólo el canon necesario. Para continuidad: `docs/CONTEXTO_CONTINUIDAD.md`; para arquitectura: `docs/ARCHITECTURE.md`.

Este proyecto no importa el motor VT1. No leer Senku como contexto operativo ni copiar narración descartada. Servidor Python y SQLite gobiernan estado/reglas; cliente, mapa, personaje y bestiario muestran ese mismo estado. No crear canon ni estado 3D paralelo.

## Alcance autorizado

### Roster de clases

El roster vigente de VT2 es **Juramentado, Arcano, Sombra y Artífice**. **No implementar Vigía ni Invocador**. Sus menciones en el Prompt Maestro son históricas/superseded y no constituyen backlog. No crear contratos, contenido, UI, balance ni migraciones para esas clases salvo nueva autorización explícita de Javier.


Encargo vigente del 8 de octubre de 2026: integrar las entregas actuales de arte y Claude, publicar en main y dejar relevo al arquitecto/programador. Leer `../docs/VT2_RELEVO_20261008.md`. La reorganización #649 y las pausas previas no bloquean este encargo acotado; no reactivar otras colas históricas por inercia. Producción se desplegó expresamente a d5ee227; versiones posteriores requieren su propia autorización de despliegue.

## Fronteras

| Función | Producto y límite |
|---|---|
| Arquitectura/Work | Alcance, dependencias, prioridades, estructura y aceptación; no decidir tensiones creativas pendientes. |
| Historia | Canon físico/cultural/ecológico, IDs reales; no números de combate/economía. |
| Narrativa | Textos, escenas, señales y ritmo sobre salas/estados reales; no reglas ni recompensas nuevas. |
| Jugabilidad | Contrato cerrado con números, estados, casos límite, persistencia y aceptación; no canon nuevo. |
| NPCs | Presencia, motivos, diálogo y servicios compatibles con canon y motor; no inventar mecanismos. |
| Arte | Brief, realización y aprobación con asset_id, archivo, hash, dimensiones y mapping real; no publicar runtime. |
| Integración de contenido | Ensamblar contratos cerrados sin decidir contenido; explicitar bloqueos. |
| Desarrollo | Implementar contrato vigente en su capa; conservar servidor autoritativo y progresión. |
| Revisión/Codex | Verificar, reparar y reconciliar entregas autorizadas; no rediseñar canon ni desplegar. |
| Operación Raspberry | Sólo ejecución autorizada; verificar SHA, salud, persistencia, acceso y rollback real. |

Las funciones se conservan, las asignaciones antiguas no se trasladan por inercia. Ver `docs/CUTOVER_REPORT.md` y el inventario de colas antes de consumir trabajo heredado.

## Arte de personajes y Númenes: hoja para impresión 3D

Decisión de Javier (2026-10-16), vigente para todo encargo futuro: cada vez que se cree o rehaga la imagen de un jugador, de Vaisork o de un Númen (o una variante), entregar además una hoja de referencia para imprimirlo en 3D.

- Estilo anime de figura coleccionable, el mismo personaje y colores que la ilustración del juego.
- `<nombre>-3d-turnaround.png`: frente, perfil izquierdo, espalda y tres cuartos, alineados y a la misma escala; pose neutra y estable; fondo blanco liso; sin sombras proyectadas, texto, aura ni partículas.
- `<nombre>-3d-frente.png`, `<nombre>-3d-perfil.png`, `<nombre>-3d-espalda.png`: cada vista sola, fondo blanco (para generadores imagen-a-3D).
- Formas cerradas y gruesas aptas para imprimir: sin mechones, pelos ni telas finas sueltas.
- Se guardan FUERA del repositorio, en `/home/jdiaz/proyectos/entregas/equipo/impresion-3d/<nombre>/`. Nunca se publican: pueden basarse en fotos privadas.

## Fuentes y comprobación

`content/world.json`, `content/regions/`, `CONTENT_CONTRACT.md`, `CANON_EXPANSION.md` y contratos vigentes definen contenido. `server/` implementa; `client/` presenta; `tests/` usa datos aislados. Ejecuta pruebas focales y QA cliente pertinente. Nunca confundir fixtures/API con sesión humana en Raspberry.

Evidencia en `review/README.md`; índices en `review/current/`. Los archivos históricos no certifican estado actual. Mantener scripts dentro del cwd de este proyecto; no usar DB de producción.

Credenciales/partidas se quedan en `runtime/`, fuera de Git. `ops/RASPBERRY_HANDOFF.md` define operación. No cambiar rutas físicas de producción por estética. Bestiario 3D/animaciones no están autorizados actualmente; las tensiones visuales figuran en el Prompt Maestro público.
