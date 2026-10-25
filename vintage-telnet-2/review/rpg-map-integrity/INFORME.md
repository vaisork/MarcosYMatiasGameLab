QA de integridad del mapa RPG — 2026-10-25; pendiente de resolución de datos.
Rama `codex/vt2-qa-navegacion`; HEAD/base local `origin/main`: `119aaaf6816ae0d638a4e01ea28cfcd2cb08fb20`; sin commit, push, PR ni integración.
Archivo: `tests/test_rpg_map_integrity.py`, nueve pruebas automáticas sin dependencias nuevas.
Cobertura: destinos, regreso salvo `one_way_exits`, alcance desde los cinco hogares iniciales, IDs/JSON duplicados, referencias de objetos/PNJ/criaturas y descripciones; 191 salas y todas las escenas RPG.
Suite solicitada: `/home/jdiaz/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q`: 336 pruebas en 127,040 s; 334 correctas, una omitida existente y un fallo.
Único error pendiente: `veyra_mazmorra_recorridos_fin.exits.este → veyra_acequia_exterior` no tiene regreso ni marca unidireccional explícita.
No se corrigieron datos: añadir un regreso podría permitir saltarse la mazmorra; se pidió confirmar si debe conservarse como unidireccional. No hay excepciones por ID ni pruebas nuevas omitidas.
Verificación adicional: cinco defectos sintéticos detectados y una marca unidireccional aceptada, exclusivamente en memoria; `git diff --check` limpio.
Sin red, cambios narrativos, salas nuevas ni arte; registro conservado aquí porque el tablero y entregas están fuera del sandbox.
Próximo consumidor: arquitecto; resolver la conexión, repetir la suite y revisar antes de integrar. La suite todavía no pasa completa.
