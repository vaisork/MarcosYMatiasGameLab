# Estado de programación VT2

**Propietario operativo:** Claude — Arquitecto de Programación  
**Ejecutores activos:** Codex y Antigravity  
**Objetivo:** relevo técnico vivo para Arquitectura VT2. No sustituye GitHub, CI, evidencia de despliegue ni contratos de producto.

## Regla de actualización

Claude actualiza este archivo en cada lote significativo de integración y antes de solicitar una nueva decisión de Arquitectura/Jugabilidad cuando el estado haya cambiado.

No convertir este documento en un diario exhaustivo. Debe reflejar sólo el estado operativo vigente.

## Base de trabajo

- `main` observado al crear este contrato: `316e722f59ebe1f8cef4a606d4190b584caf802a`.
- Producción Raspberry: **no verificada por esta PR**. Usar la última evidencia operativa disponible y comprobarla antes de afirmar igualdad con `main`.

## Trabajo técnico activo

### Claude
- Coordina arquitectura de programación.
- Divide contratos aprobados en trabajo ejecutable.
- Mantiene trabajo continuo para Codex y Antigravity.
- Revisa y reconcilia las entregas antes de integrar.

### Codex
- **Estado:** actualizar en el próximo lote de Claude.
- **Rama/PR actual:** actualizar.
- **Bloqueos:** actualizar.

### Antigravity
- **Estado:** actualizar en el próximo lote de Claude.
- **Rama/PR actual:** actualizar.
- **Bloqueos:** actualizar.

## Entradas recientes de producto/canon que Claude debe reconocer

| Entrada | Estado inicial | Acción esperada de Claude |
|---|---|---|
| PR #702 — ocho Númenes | Documentación histórica/editorial; poderes sin aprobar | Registrar recepción; esperar contrato de Jugabilidad/Arquitectura antes de implementar; si se aprueba, comenzar con piloto unificado, no ocho sistemas aislados |
| PR #703 — fusión de objetos duplicados | Idea preservada del Historiador | Evaluar dependencia con inventario/equipamiento/economía; no implementar hasta contrato cuantitativo y reglas de duplicados |

## Último lote integrado

Actualizar aquí con PRs y cambios integrados desde el último reporte. Incluir sólo lo que esté realmente en `main`.

## Cambios de arquitectura relevantes

Registrar cualquier cambio en persistencia, schema, autoridad servidor/cliente, API, estado de personaje, inventario, mapa, combate, comercio o datos que obligue a otros agentes a cambiar sus contratos.

Si no hubo cambios arquitectónicos, escribir: **Sin cambios de arquitectura en este lote.**

## Decisiones pendientes de Arquitectura / Jugabilidad / Historia / Narrativa

Actualizar con bloqueos concretos. Cada bloqueo debe citar PR, issue o archivo cuando exista.

## Siguiente lote técnico previsto

Claude debe dejar una lista corta del siguiente trabajo que asignará a Codex y Antigravity. Esto es información de coordinación, no autorización para ampliar alcance fuera de contratos aprobados.

## Regla de sincronización con Arquitectura VT2

Cuando Arquitectura VT2 revise el proyecto, debe leer primero:

1. `AGENTS.md`;
2. `docs/DECISIONES_VIGENTES.md`;
3. este `docs/PROGRAMMING_STATUS.md`;
4. PRs recientes citadas aquí;
5. HEAD actual de `main`.

Si este archivo está desactualizado respecto a GitHub, prevalece GitHub y Claude debe actualizar el relevo en su siguiente lote.
