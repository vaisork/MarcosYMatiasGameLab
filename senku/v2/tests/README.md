# Pruebas de Senku v2

Ejecutar desde la raíz: `node --test senku/v2/tests/*.test.mjs`.
Los fixtures son sintéticos y el almacenamiento se simula en memoria; no se usan partidas reales.

Registro CM-37 — 2026-10-23: listo para revisión local, sin commit.
Base: `origin/main` y HEAD remoto `845fc31ceca2ef27ed547fec34dcb7a85b6a31be`; rama `codex/cm-37`.
Archivos: `combate.test.mjs`, `store.test.mjs`, `migracion.test.mjs` y este README.
Cobertura previa conservada: vida inicial 100, daño ratón/cucaracha/hámster 1/1/2 y derrota al llegar a 0.
Ampliación: hámster contra 1 HP sin vida negativa ni golpes posteriores; guardado completo y cargas independientes.
Persistencia: migración del formato Legacy sintético a versión 1, recarga estable y arranque ante datos vacíos, corruptos o futuros.
Resultado: 183 pruebas aprobadas, 0 fallos, 0 omitidas con Node v22.22.1; `git diff --check` limpio.
No se detectaron fallos que exigieran cambios de producción. Validación automatizada en Node, sin validación en navegador.
Sin cambios en Senku Legacy ni VT2; sin commit, push, PR ni merge. `fetch` bloqueado; HEAD remoto verificado con `git ls-remote`.
Pendientes para el arquitecto: revisar el diff y actualizar el tablero/informe externo, fuera del sandbox de este worktree.
