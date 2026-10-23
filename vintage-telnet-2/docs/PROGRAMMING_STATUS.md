# Estado de programación VT2

**Propietario operativo:** Claude — Arquitecto de Programación  
**Ejecutores activos:** Codex y Antigravity  
**Objetivo:** relevo técnico vivo para Arquitectura VT2. No sustituye GitHub, CI, evidencia de despliegue ni contratos de producto.

## Regla de actualización

Claude actualiza este archivo en cada lote significativo de integración y antes de solicitar una nueva decisión de Arquitectura/Jugabilidad cuando el estado haya cambiado.

No convertir este documento en un diario exhaustivo. Debe reflejar sólo el estado operativo vigente.

## Base de trabajo

- `main` al 2026-10-15: `ea45a6340ca0fc1338172f8d659a3544159fc58a`.
- Producción Raspberry: `ea45a63`, **verificada** el 2026-10-15 04:38 UTC por `activar.sh` (manifiesto SHA256, servicio activo, localhost 200, `runtime/deployed-version.txt`). Respaldo: `/home/jdiaz/backups/vt2-before-ea45a63-20261015T043829Z`.
- Coordinación técnica desde la computadora Ubuntu de Javier (`/home/jdiaz/proyectos`); la Raspberry sólo ejecuta producción.

## Trabajo técnico activo

### Claude
- Coordina arquitectura de programación, reparte según cuotas (`entregas/equipo/uso.py`), revisa e integra vía PR.

### Codex
- **Estado:** sin encargo activo. Último: arte de la mazmorra (#709) y revisión de la mazmorra (#701).
- **Rama/PR actual:** ninguna.
- **Bloqueos:** ninguno.

### Antigravity
- **Estado:** dos encargos activos.
- **Rama/PR actual:** `agy/numenes-piloto` (piloto completo de Númenes desde los documentos de #702) y `agy/qa-mazmorra-fusion` (QA en navegador de la mazmorra y la fusión).
- **Bloqueos:** ninguno.

## Entradas recientes de producto/canon que Claude debe reconocer

| Entrada | Estado | Tratamiento |
|---|---|---|
| PR #702 — ocho Númenes | **Aprobado para piloto** por Javier (2026-10-15) | Piloto unificado en `agy/numenes-piloto`, basado en los cuatro documentos de #702. Poderes en versión prudente, marcados como piloto. No se integra a `main` sin aprobación de Javier tras probarlo. |
| PR #703 — fusión de objetos duplicados | **Implementado** con aprobación directa de Javier y Matías | Integrado en #710 y desplegado en `ea45a63`. PR #703 cerrada. |

## Último lote integrado

- #693–#698: parser amable, corrección de hora (zona horaria), interfaz legible, misterios, bestiario, historias de origen, arcos y lugares vivos.
- #700: clases con identidad, atributos en todo el juego, XP por descubrir, pantalla de personaje (incluye #699).
- #701: mazmorra «Bastión de las Aguas Antiguas» (8 salas, 4 monstruos, dragón nivel 10 con vida compartida en el mundo, premio por jugador) y narrativa en tres sesiones (ChatGPT).
- #709: arte de la mazmorra (13 ilustraciones y variantes tras `dragon_vencido`).
- #710: fusión de objetos con el herrero (+1 a +3, sellos, materiales, valor de venta); el dragón entrega 3 escamas.

## Cambios de arquitectura relevantes

- Estado global del mundo: `creature_states["<sala>:dragon_aguas_antiguas"].hp` y `dragon_participants` persisten la vida del dragón y la participación entre jugadores.
- Objetos: campo `fusion` (0–3) en instancias de arma, armadura y bloqueo; afecta daño, reducción y `sell_price`.
- Salidas con `requires_level` en `exit_requirements`.

## Decisiones pendientes de Arquitectura / Jugabilidad / Historia / Narrativa

- Revisión del piloto de Númenes cuando Antigravity entregue (decisiones marcadas como piloto en su contrato técnico).

## Siguiente lote técnico previsto

- Integrar las correcciones de QA de la mazmorra y la fusión.
- Revisar el piloto de Númenes; arte de Númenes con Codex si se aprueba.

## Regla de sincronización con Arquitectura VT2

Cuando Arquitectura VT2 revise el proyecto, debe leer primero:

1. `AGENTS.md`;
2. `docs/DECISIONES_VIGENTES.md`;
3. este `docs/PROGRAMMING_STATUS.md`;
4. PRs recientes citadas aquí;
5. HEAD actual de `main`.

Si este archivo está desactualizado respecto a GitHub, prevalece GitHub y Claude debe actualizar el relevo en su siguiente lote.
