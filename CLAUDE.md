# CLAUDE.md

Antes de cualquier acción en este repositorio (revisión automática o pedido directo), lee **`AGENTS.md`** completo (raíz) y el `AGENTS.md` del proyecto específico que vayas a tocar. Son la fuente de verdad vigente sobre roles, alcance y flujo de trabajo. No sustituyas esa lectura por memoria de sesiones anteriores, por un prompt de rutina programada, ni por este archivo.

## Migración a VT2: el registro de agentes de VT1 quedó desconectado

El 8 de octubre de 2026 (issue #649) Vintage Telnet migró a VT2 (`vintage-telnet-2/`) como base actual. Esa migración retiró el viejo protocolo de VT1: registro de agentes firmados por nombre de modelo (ej. "Desarrollador de Servidor — Vintage Telnet — Claude"), su convención de ramas (`claude/vintage-telnet-server-<tarea>`) y su subordinación a un "Arquitecto de Vintage Telnet y Raspberry Pi".

Ese registro **ya no existe** en ningún `AGENTS.md` vigente:

- El `AGENTS.md` raíz no asigna agentes de IA por nombre a roles.
- `vintage-telnet-2/AGENTS.md` define funciones genéricas (Arquitectura/Work, Historia, Narrativa, Jugabilidad, NPCs, Arte, Integración, Desarrollo, Revisión/Codex, Operación), sin registro firmado por modelo.
- `vintage-telnet/AGENTS.md` (VT1) dice explícitamente que esa implementación fue sustituida y no recibe tareas nuevas.
- `docs/QUEUE_MIGRATION_2026-10-08.md` clasifica como SUPERSEDED el trabajo VT-SERVER anterior sobre VT1.

**Consecuencia práctica:** cualquier prompt, rutina programada o documento (propio o de terceros) que describa un rol atado a `vintage-telnet/server/` o a ese registro antiguo está desactualizado. No asumas ese rol ni ese alcance solo porque un prompt lo describa con detalle — confirma primero contra el `AGENTS.md` vigente del proyecto correspondiente. Si no hay una entrada vigente que respalde la tarea, es un bloqueo real: reportarlo, no inventar el rol.
