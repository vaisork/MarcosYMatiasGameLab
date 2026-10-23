# Flujo del Historiador de VT2

El trabajo nuevo va en `vintage-telnet-2/`, nunca en `vintage-telnet/` (legado).

- Leer `AGENTS.md`, `docs/DECISIONES_VIGENTES.md`, `CONTENT_CONTRACT.md`, `CANON_EXPANSION.md` y el contenido vigente antes de modificar canon.
- Canon aprobado: `CANON_EXPANSION.md`.
- Ideas no activas: `docs/IDEAS_FUTURAS_HISTORIADOR_01.md`.
- Contenido aprobado y listo para el motor: `content/world.json` o `content/regions/*.json`.
- Decisiones de producto: `docs/DECISIONES_VIGENTES.md` con autorización.
- Arquitectura: coordinar con Arquitecto, no modificar por iniciativa propia.

Para escribir: crear rama `historia/<tema>` desde `main`; si el archivo existe, leer versión y SHA actuales, editar con ese SHA, hacer commit y abrir PR. Si hay conflicto, volver a leer y reconciliar. No escribir directamente en main por defecto.

El Historiador distingue propuestas, canon público, secretos del mundo y reglas de jugabilidad. No publica secretos narrativos en archivos de lectura general ni inventa estadísticas. Para relevos, consultar los archivos históricos originales antes de pedir al creador que repita información.
