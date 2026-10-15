# VintageTelnet-Libros — Crónicas de Vaisgard

> **Repositorio físico:** `vaisork/MatiasGameLab`
>
> **Carpeta editorial:** `VintageTelnet-Libros/`
>
> **Proyecto literario:** Crónicas de Vaisgard · Libro I: *El primer camino* (títulos provisionales).

## Para los agentes y arquitectos

Este directorio centraliza el trabajo **editorial** sobre novelas ambientadas en Vintage Telnet 2. El código, el juego y su canon se mantienen en `vintage-telnet-2/`; aquí no se editan archivos del juego.

- **Arquitecto Editorial Principal:** dirige voz, estructura, Biblia Editorial, fichas, revisiones y aprobación literaria.
- **Arquitecto VT2:** protege la coherencia con el canon compartido. Es **correvisor obligatorio** en toda PR con datos de historia, culturas, especies, criaturas, secretos, geografía, personajes canónicos o elementos reutilizables en el juego.
- **Agente 01, Escritor de Aventuras:** `escritor-aventuras-vaisgard-01`. Solo redacta un capítulo cuando recibe su ficha aprobada; **WIP=1**; no establece canon unilateral.
- **Director de Arte:** identifica y valida el uso de ilustraciones originales aprobadas de `vintage-telnet-2/client/art/`; no se generan reemplazos por iniciativa del Escritor.
- **Publicación:** integra exclusivamente capítulos aprobados y arte validado en un documento cómodo para leer desde Google Drive.

## Índice de entregas

| Entrega | Archivo | Estado |
|---|---|---|
| Agente 01 — propuesta de voz narrativa | [Propuesta de voz y continuidad](agentes/escritor-aventuras-vaisgard-01/PROPUESTA_VOZ_NARRATIVA.md) | Pendiente de aprobación editorial |
| [Reglas de los agentes](AGENTS.md) | `AGENTS.md` | Propuesta editorial, pendiente de revisión |
| [Biblia Editorial](BIBLIA_EDITORIAL.md) | `BIBLIA_EDITORIAL.md` | Borrador localizado; **no aprobado** |
| [Referencias del canon](CANON_REFERENCE.md) | `CANON_REFERENCE.md` | Fuente de verificación |
| [Política de secretos](POLITICA_DE_SECRETOS.md) | `POLITICA_DE_SECRETOS.md` | Pendiente de revisión conjunta |
| [Protagonistas propuestos](plan/personajes.md) | `plan/personajes.md` | Propuestas, no aprobadas |
| [Arco e índice del Libro I](plan/libro-01.md) | `plan/libro-01.md` | 15 capítulos propuestos; no aprobados |
| [Fichas de capítulos 1–3](plan/fichas-001-003.md) | `plan/fichas-001-003.md` | C001 autorizado solo para borrador; C002–C003 no autorizados |
| [Capítulo 001 — Una decisión al amanecer](capitulos/001-una-decision-al-amanecer.md) | `capitulos/001-una-decision-al-amanecer.md` | Primer borrador entregado; pendiente de revisión |
| [Registro de continuidad C001](capitulos/001-continuidad-y-revision.md) | `capitulos/001-continuidad-y-revision.md` | Revisión de canon pendiente |
| [Revisión del Arquitecto Editorial C001](revision/REVISION_ARQUITECTURA_EDITORIAL_C001_2026-10-14.md) | `revision/REVISION_ARQUITECTURA_EDITORIAL_C001_2026-10-14.md` | Aprobable literariamente con ajustes, no publicable |
| [Prólogo propuesto — El mundo que permanece](prologos/001-el-mundo-que-permanece.md) | `prologos/001-el-mundo-que-permanece.md` | Adaptado de «Conocer el Mundo» de VT1; revisión conjunta pendiente |
| [Procedencia y control del prólogo](prologos/NOTA_DE_PROCEDENCIA_Y_REVISION.md) | `prologos/NOTA_DE_PROCEDENCIA_Y_REVISION.md` | Tabla de cambios VT1 → VT2 y permisos |

## Contratos de coordinación

1. **Cada entrega sustantiva llega por rama y PR en este repositorio.** En el chat se comunica únicamente estado, PR, bloqueo y siguiente acción.
2. La descripción de la PR debe contener **destinatario, alcance, decisiones propuestas, estado canónico, evidencias y aprobación requerida**.
3. El Arquitecto Editorial debe revisar cada PR literaria. Si toca material compartido con el juego, también la revisa Arquitectura VT2. **Una contradicción canónica sin resolver bloquea la fusión.**
4. Distinguir siempre **hechos confirmados**, **rumores de personajes**, **propuestas** y **secretos no publicables**.
5. Registrar en la PR las tensiones, decisiones, responsables y efectos sobre futuros capítulos. No se debe fusionar y después intentar reconstruir esas decisiones.
6. El **Arquitecto Editorial**, no cada escritor, coordina el traslado periódico del conocimiento relevante a `vaisork/Conocimiento` (Segundo Cerebro), con enlaces de trazabilidad hacia estas PR.
7. No interpretar documentos históricos de VT1 o propuestas antiguas como autorización actual. Las decisiones vigentes de VT2 prevalecen.
8. Ningún documento en esta carpeta autoriza despliegues, cambios al juego ni aprobación automática de arte.

## Fuentes oficiales de consulta

- `AGENTS.md` y `vintage-telnet-2/AGENTS.md`
- `vintage-telnet-2/docs/DECISIONES_VIGENTES.md`
- `vintage-telnet-2/CONTENT_CONTRACT.md`
- `vintage-telnet-2/CANON_EXPANSION.md`
- `vintage-telnet-2/content/world.json` y `content/regions/`
- `vintage-telnet-2/client/art/` y sus manifiestos
- Biblia Editorial y arco narrativo **cuando estén publicados y aprobados en esta carpeta**

**Roster vigente de clases VT2:** Juramentado, Arcano, Sombra y Artífice. Vigía e Invocador no forman parte del roster vigente.

## Regla de lectura

Se escribe una **novela**, no una enciclopedia, manual de juego ni narración de partidas reales. Público inicial: 10–14 años, con lectura agradable también para adultos.


**Organización confirmada:** el libro NO dispone de un repositorio independiente: su raíz editorial es esta carpeta en `vaisork/MatiasGameLab`. El proyecto mantiene separación por carpetas y flujo editorial, con revisión conjunta de canon. El Segundo Cerebro sigue en `vaisork/Conocimiento` y sólo el Arquitecto Editorial traslada allí aprendizajes y decisiones.

## PR de coordinación del equipo cerrado

- [#705 — Escritor 01, borrador Capítulo 001](https://github.com/vaisork/MatiasGameLab/pull/705).
- [#706 — Historiador 02, atlas y expediente de ruta](https://github.com/vaisork/MatiasGameLab/pull/706).
- [#707 — Revisor Integral 03, dictamen inicial y actualización de Capítulo 001 pendiente](https://github.com/vaisork/MatiasGameLab/pull/707).
- [#708 — Arte/Publicación 04, preproducción de EPUB 3](https://github.com/vaisork/MatiasGameLab/pull/708).

El equipo consta de **cuatro asistentes**, sin puestos 05–07. El formato principal de lectura aprobado es **EPUB 3 reajustable** con Drive como canal de almacenamiento y distribución. Ninguna PR aquí supone ejecución autónoma de agentes ni aprobación automática de publicación.
