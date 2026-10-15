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
| Biblia Editorial | Pendiente de incorporar ubicación aprobada | Bloqueante para Capítulo 1 |
| Arco del Libro I | Pendiente de incorporar ubicación aprobada | Bloqueante para Capítulo 1 |
| Ficha de Capítulo 1 | Pendiente de emitir y aprobar | Bloqueante para redacción |

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
