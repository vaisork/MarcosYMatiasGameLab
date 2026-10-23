# Decisiones operativas vigentes — 2026-10-08

## Organización de programación vigente — actualización 2026-10-14

Por decisión explícita de Javier, la programación activa de VT2 se realiza desde la computadora Ubuntu de Javier (la Raspberry es sólo producción) bajo una estructura **Claude → Codex + Antigravity**. Claude actúa como Arquitecto de Programación, reparte y revisa trabajo; Codex y Antigravity son los ejecutores técnicos principales. Los antiguos programadores web genéricos de ChatGPT y agentes Junior dejan de considerarse parte del pipeline activo.

Claude debe mantener un relevo técnico vivo en `docs/PROGRAMMING_STATUS.md` para que Arquitectura VT2 pueda comprobar el estado real de `main`, producción, PRs integradas, trabajo de ambos ejecutores, bloqueos y siguiente lote. No debe asumirse que una conversación anterior refleja el estado actual si la repo ha avanzado.

Las entregas del Historiador **#702 (Númenes)** y **#703 (fusión de objetos duplicados)** deben aparecer en el siguiente reporte técnico con su estado de consumo; no se implementan automáticamente sin contrato de Arquitectura/Jugabilidad cuando corresponda.

## Clases definitivas de VT2

Por decisión explícita de Javier del 8 de octubre de 2026, **Vintage Telnet 2 queda con cuatro clases activas y previstas: Juramentado, Arcano, Sombra y Artífice**. **Vigía e Invocador quedan descartados del alcance de VT2**: no son trabajo pendiente, no deben abrirse issues para implementarlos y ninguna referencia histórica del Prompt Maestro o de investigación MUD los reactiva. Cualquier expansión futura del roster requerirá una nueva decisión explícita de producto.

Encargo más reciente: integrar entregas de arte y Claude, publicar en main y preparar relevo al arquitecto/programador. No autoriza un segundo despliegue implícito. Producción se actualizó expresamente a d5ee227 (PR #660), con datos conservados; registro en `review/qa/raspberry-deploy/update-d5ee227/DEPLOYMENT.md`. Leer `../../docs/VT2_RELEVO_20261008.md` para rutas, SSH y operación. Las pausas anteriores quedan subordinadas a este encargo acotado.

Encargo posterior: Javier pide cinco iteraciones de coherencia al caminar. Resultado: cinco recorridos API aislados, 628 movimientos en los cinco ciclos y 374 adicionales al corregir y repetir el quinto, con cobertura de las 183 salas; eliminación de giros artificiales, separación de interiores y hogares respecto a calles. Sin modificar salidas ni desplegar. Evidencia: `review/spatial-five-cycles/REVIEW.md`.

Encargo posterior: Javier autoriza corregir la geografía cartográfica de todo el juego, no sólo Valdren. Atlas fijo para 183 salas y hogares, trazados estables, privacidad del descubrimiento y concordancia HTML/3D; conservar todas las salidas, progresión y mecánicas. Informe: `review/spatial-world/REVIEW.md`. Este encargo no autoriza desplegar su nueva versión en Raspberry.

Autorización posterior de despliegue: Javier pidió «Sube a raspberry». PR #657, commit f55188f, está instalado y validado; partidas y configuración privada conservadas. Registro: `review/qa/raspberry-deploy/update-20261008/DEPLOYMENT.md`. Esta autorización concreta no habilita despliegues futuros automáticos.

Autorización posterior: Javier permite continuar el piloto MUD clásico acotado e integrar las entregas del otro Codex y Claude. El piloto modifica seis resúmenes de retorno en Edran, preserva las descripciones completas y adapta la presentación de `mirar`. Se integran 47 vistas ambientales y miniaturas. Las propuestas históricas de mecánicas se conservan como referencia, sin activar fórmulas nuevas. Esta autorización no incluye una reescritura masiva ni un despliegue en Raspberry. Resultado y evidencia: `review/mud-integration/INTEGRACION.md`.

Javier confirma VT2 desplegado y autoriza comenzar reorganización operativa #649. VT2 es la base de trabajo actual; VT1 es legacy/rollback. Esta autorización no reanuda la redacción narrativa ni añade funcionalidades del juego.

`CONTEXTO_CONTINUIDAD.md` conserva historial de trabajo y despliegue. Sus notas iniciales sobre ausencia de remoto, código sin commit y pausas antiguas deben leerse junto a las actualizaciones finales. `review/qa/raspberry-deploy/DEPLOYMENT.md` registra sustitución de servicio/enlace y rollback; no certifica reinicio físico ni sesión humana prolongada.

Producción conserva `/home/jdiaz/proyectos/vintage-telnet-nuevo`, `vintage-telnet-nuevo.service` y puerto 8083. Su SQLite es autoridad. No desplegar cambios de organización ni restaurar la copia Ubuntu encima de producción.

Código `main` incluye preservación narrativa no desplegada. No afirmar que SHA `main` coincide con Raspberry sin lectura del entorno. La reorganización no modifica `server/`, `client/`, `content/`, `ops/`, runtime ni servicios.

Bestiario 3D y animaciones siguen sin autorización actual. Registrar tensiones de UI/3D y móvil/escritorio en `PROMPT_MAESTRO_2026-10-08.md`; no resolverlas silenciosamente.
