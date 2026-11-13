# Estudio CCGS en MarcosYMatiasGameLab

Claude Code Game Studios (Donchitos, MIT) aporta agentes, skills, documentación, guías, hooks y scripts completos. Incluye `project.yaml`, `design/`, `production/` y `docs/engine-reference/`. Los 49 agentes originales están en `.claude/agents/`; los ocho especialistas VT2 conservan su adaptación local junto con el contenido completo upstream. Los documentos de configuración del proyecto se redactan en español.

## Uso

- **VT2**: invoca `/estudio-vt2` para coordinar diseño, canon, texto, balance y QA. Trabaja en `vintage-telnet-2/`; lee sus reglas y contratos vigentes. Prueba: `cd vintage-telnet-2 && ~/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q`.
- **Senku VR**: invoca `/estudio-senku-vr` para diseño, recorridos, sistemas y QA de WebXR. Trabaja en `senku/vr/`, con Three.js 0.170.0. Prueba: `node --test senku/vr/tests/*.test.mjs`. Para Meta Quest, conserva el objetivo existente de 72 FPS y comprueba el rendimiento en el visor antes de afirmarlo.
- `AGENTS.md`, los archivos de reglas del proyecto y las decisiones de Javier/Matías tienen prioridad sobre las convenciones CCGS.

## Hooks

| Evento | Hook(s) | Función |
|---|---|---|
| SessionStart | `session-start.sh`, `detect-gaps.sh` | Muestra contexto del repo y advierte de huecos documentales. |
| PreToolUse Bash/PowerShell | `validate-commit.sh`, `validate-push.sh` | Revisa commits/push; `gh pr create` permanece permitido. |
| PreToolUse Write/Edit | `validate-registry.sh`, `validate-write.sh` | Comprueba referencias de registro y emite avisos de escritura. |
| PreToolUse Read | `validate-read.sh` | Ayuda a leer documentos extensos por secciones. |
| PostToolUse Write/Edit | `validate-assets.sh`, `validate-skill-change.sh` | Revisa nombres/datos de assets y cambios de skills. |
| PreCompact / Stop | `pre-compact.sh`, `session-stop.sh` | Guarda señales para retomar una sesión. |
| SubagentStart / SubagentStop | `log-agent.sh`, `log-agent-stop.sh`, `validate-agent-artifact.sh` | Registra actividad y comprueba entregables de subagentes. |

Notificaciones de escritorio están desactivadas en `settings.json`: `notify.sh` depende de PowerShell. `update-check.sh` permanece disponible manualmente y ya no se ejecuta al iniciar sesión. `log-instructions.sh` y `yaml-helper.sh` son auxiliares; no se enlazan como eventos directos.

## Comprobación de hooks

Se pasaron payloads JSON directamente por stdin a cada hook configurado y a los auxiliares JSON. Todos devolvieron código 0 con los ejemplos seguros. También se comprobaron casos dirigidos: commit `docs: instalar estudio CCGS`, comando `gh pr create` y escritura en `vintage-telnet-2/`, `senku/vr/` y `assets/`; ninguno bloqueó el flujo. `update-check.sh notice` se probó por su interfaz manual. `notify.sh` solo se invocó manualmente; no está configurado para dispararse.

## Verificación de esta instalación

- `bash .claude/scripts/agent-check.sh`: pasó; inventario de 49 agentes y 80 skills.
- `node --test senku/vr/tests/*.test.mjs`: pasó, 31/31.
- Suite VT2 (`unittest discover -s tests -q`): iniciada, sin salida tras 90 segundos y detenida; queda pendiente por duración.
- `git diff --check`: pasó.
