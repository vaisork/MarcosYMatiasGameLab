---
name: estudio-vt2
description: Estudio de videojuegos para Vintage Telnet 2. Reparte una zona, jefe, misterio o ajuste de balance entre los agentes del estudio (diseño, nivel, mundo, narrativa, texto, balance, QA) y lo integra con pruebas. Usar cuando se pida contenido nuevo o una revisión de diseño de VT2.
---

# Estudio VT2

Emulación ligera de Claude Code Game Studios (Donchitos, MIT): 8 roles en `.claude/agents/`, todos en Sonnet para ahorrar cuota. Tú (la sesión principal) eres la productora: repartes, revisas e integras.

## Flujo (en orden, lanzando solo los roles que el encargo necesita)

1. **Encargo**: escribe en una línea qué se hace y para quién (Marcos va por nivel N). Anótalo en `vintage-telnet-2/docs/estudio/sesion.md`.
2. **Diseño** (en paralelo): `game-designer` (mecánica y loop) y `level-designer` (salas, salidas, ritmo). Cada uno devuelve una propuesta corta.
3. **Canon**: `world-builder` o `narrative-director` revisa la propuesta contra `docs/CANON_VIGENTE.md` y `docs/DECISIONES_VIGENTES.md`. Corrige contradicciones antes de seguir.
4. **Texto**: `writer` escribe salas, examinar, diario y diálogos en el formato de `content/regions/*.json` (ver `CONTENT_CONTRACT.md`).
5. **Balance**: si hay recompensas, daño u oro, `economy-designer` o `systems-designer` los compara con la zona anterior. Regla: más divertido, no más difícil.
6. **QA**: `qa-tester` define los casos que deben pasar. La productora corre las pruebas y escribe el test nuevo si falta.
7. **Cierre**: commit en rama `claude/<tarea>`, PR, CI verde, merge y despliegue según `docs/VT2_RELEVO_20261008.md`.

## Límites

- Un rol por paso. No lances los 8 si basta con 2.
- Los agentes del estudio no hacen commit ni despliegan; eso es de la productora.
- Pasa a cada agente rutas exactas y el nivel del jugador; no le pidas leer todo el repo.
