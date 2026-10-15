# Agentes de Vintage Telnet 2

Lee `README.md`, `docs/DECISIONES_VIGENTES.md`, `CONTENT_CONTRACT.md` y sólo el canon necesario. Para continuidad: `docs/CONTEXTO_CONTINUIDAD.md`; para arquitectura: `docs/ARCHITECTURE.md`.

Este proyecto no importa el motor VT1. No leer Senku como contexto operativo ni copiar narración descartada. Servidor Python y SQLite gobiernan estado/reglas; cliente, mapa, personaje y bestiario muestran ese mismo estado. No crear canon ni estado 3D paralelo.

## Alcance autorizado

### Roster de clases

El roster vigente de VT2 es **Juramentado, Arcano, Sombra y Artífice**. **No implementar Vigía ni Invocador**. Sus menciones en el Prompt Maestro son históricas/superseded y no constituyen backlog. No crear contratos, contenido, UI, balance ni migraciones para esas clases salvo nueva autorización explícita de Javier.


Encargo vigente del 8 de octubre de 2026: integrar las entregas actuales de arte y Claude, publicar en main y dejar relevo al arquitecto/programador. Leer `../docs/VT2_RELEVO_20261008.md`. La reorganización #649 y las pausas previas no bloquean este encargo acotado; no reactivar otras colas históricas por inercia. Producción se desplegó expresamente a d5ee227; versiones posteriores requieren su propia autorización de despliegue.

## Organización técnica vigente

La programación activa de VT2 se coordina desde la computadora Ubuntu de Javier (`/home/jdiaz/proyectos`); la Raspberry es sólo producción. Flujo:

- **Claude** — Arquitecto de Programación y orquestador técnico. Recibe contratos aprobados, descompone trabajo, mantiene ocupados de forma continua a Codex y Antigravity, revisa sus entregas y reconcilia la integración.
- **Codex** — ejecutor técnico principal para implementación, revisión, pruebas y reparación según la asignación de Claude.
- **Antigravity** — ejecutor técnico principal para implementación y tareas paralelas según la asignación de Claude.
- Los antiguos programadores web genéricos de ChatGPT y agentes Junior 1/2 **ya no forman parte del pipeline activo de programación de VT2**.

El Arquitecto VT2 de producto/canon no compite con Claude por la arquitectura del código. Arquitectura VT2 define alcance, coherencia, dependencias y contratos de juego; Claude decide la descomposición e implementación técnica con Codex y Antigravity.

### Obligación de continuidad hacia Arquitectura VT2

Claude debe mantener actualizado `docs/PROGRAMMING_STATUS.md` como relevo técnico vivo. En cada lote significativo de integración o antes de pedir una nueva decisión de producto debe registrar, como mínimo:

1. SHA de `main` utilizado como base;
2. SHA productivo conocido o indicar explícitamente que no fue verificado;
3. PRs integradas desde el último reporte;
4. trabajo actual de Codex;
5. trabajo actual de Antigravity;
6. bloqueos o decisiones que requieran Arquitectura, Historia, Narrativa o Jugabilidad;
7. cambios de arquitectura o datos que alteren contratos existentes;
8. siguiente lote técnico previsto.

Ese archivo es el punto de sincronización para que el Arquitecto VT2 pueda releer la repo y mantenerse al día sin depender de memoria de chat.

### Consumo de entregas del Historiador

Las PR documentales del Historiador no autorizan implementación automática. En particular, Claude debe registrar en el siguiente lote técnico el tratamiento de:

- **PR #702** — preparación documental de los ocho Númenes;
- **PR #703** — idea preservada de fusión de objetos duplicados.

Para cada una debe indicar: recibido, pendiente de contrato, aprobado para piloto, diferido o descartado, con motivo y dependencia. Si requiere Jugabilidad o Arquitectura, no convertirlo en código antes de esa aprobación.

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

## Fuentes y comprobación

`content/world.json`, `content/regions/`, `CONTENT_CONTRACT.md`, `CANON_EXPANSION.md` y contratos vigentes definen contenido. `server/` implementa; `client/` presenta; `tests/` usa datos aislados. Ejecuta pruebas focales y QA cliente pertinente. Nunca confundir fixtures/API con sesión humana en Raspberry.

Evidencia en `review/README.md`; índices en `review/current/`. Los archivos históricos no certifican estado actual. Mantener scripts dentro del cwd de este proyecto; no usar DB de producción.

Credenciales/partidas se quedan en `runtime/`, fuera de Git. `ops/RASPBERRY_HANDOFF.md` define operación. No cambiar rutas físicas de producción por estética. Bestiario 3D/animaciones no están autorizados actualmente; las tensiones visuales figuran en el Prompt Maestro público.
