# Instrucciones de agentes — Crónicas de Vaisgard

**Repositorio único del juego y el libro:** `vaisork/MatiasGameLab`. La obra literaria vive exclusivamente en `VintageTelnet-Libros/`; NO crear `vaisork/VintageTelnet-Libros` ni otro repositorio.

## Separación y autoridad
- `vintage-telnet-2/`: juego y fuente oficial del canon. Los agentes literarios sólo consultan su contenido y arte, sin modificar código, mapas, assets originales, runtime ni Raspberry.
- `VintageTelnet-Libros/`: Biblia, planes, expedientes, capítulos, manuscritos y referencias de ilustraciones para Google Drive.
- `vaisork/Conocimiento`: Segundo Cerebro, repositorio independiente existente. **Sólo el Arquitecto Editorial Principal** consolida y envía desde este proyecto conocimiento duradero mediante rama/PR; los asistentes no escriben directamente allí.

## Gobernanza obligatoria de PR
**Arquitecto Editorial y Arquitecto VT2 son corresponsables**, con competencias distintas: el primero protege calidad literaria y continuidad de la obra; el segundo protege canon, geografía, secretos y estado vigente del juego. Requieren revisión conjunta las PR con desarrollo relevante de historia, culturas, especies, criaturas, NPC canónicos, rumores potencialmente canónicos, secretos, geografía, construcciones antiguas o material reutilizable en el juego.

Registrar en la misma PR la propuesta literaria, evidencia vigente de VT2, tensión, decisión acordada y si afecta sólo al libro o exige futura decisión sobre el juego. Una contradicción de canon sin resolver **bloquea la fusión**. La compatibilidad literaria no transforma una invención en canon de VT2.

## Proceso
1. Comprobar `main` remoto, `AGENTS.md` raíz y `vintage-telnet-2/AGENTS.md`, decisiones vigentes y fuentes del escenario.
2. Consultar `BIBLIA_EDITORIAL.md`, `CANON_REFERENCE.md`, `POLITICA_DE_SECRETOS.md` y el plan aprobado.
3. WIP=1 capítulo por escritor y WIP=1 expediente principal por historiador. **No redactar capítulos sin autorización por ficha; el Capítulo 001 tiene permiso de borrador en `plan/DECISION_ARRANQUE_EDITORIAL_2026-10-14.md` y fue entregado para revisión, pero no está aprobado para fusión/publicación.**
4. El escritor prepara prosa a partir de una ficha aprobada; el historiador prepara fuentes y contexto, sin escribir capítulos.
5. Revisión literaria, canon/continuidad, revisión conjunta cuando proceda, lectura y aprobación del arte preceden a publicación.
6. Usar imágenes originales aprobadas de `vintage-telnet-2/client/art/`, citando ruta/versión/manifiesto; no generar sustitutas por defecto.
7. **EPUB 3 reajustable es el formato principal** según decisión del propietario; Google Drive es almacenamiento y distribución, Google Docs puede usarse para revisión y PDF es derivado opcional. No publicar antes de aprobar el capítulo y el arte.

## Asistentes
**Equipo cerrado (cuatro colaboradores):** 01 Escritor de Aventuras; 02 Historiador y Documentalista; **03 Editor Integral (canon, continuidad, edición literaria y lectura)**; **04 Director de Arte y Publicación (selección de arte, maquetación y EPUB)**. Los arquitectos Editorial y VT2 ejercen corresponsabilidad de canon. No crear roles 05–07 ni automatizaciones; son funciones, no procesos autónomos activos.

## Continuidad y secretos
Etiquetar información ABIERTA, DESCUBRIBLE, RESERVADA y separar certeza CONFIRMADA, COMPATIBLE, DUDOSA o CONTRADICTORIA. Secretos de DM nunca pasan a material de lectura o notas compartidas. El Arquitecto Editorial actualiza periódicamente `vaisork/Conocimiento` al cerrar hitos, con fuentes, decisiones y enlaces, sin duplicar manuscritos completos.
