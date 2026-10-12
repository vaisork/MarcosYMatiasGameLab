# Recuperación funcional de narrativa — 12 de octubre de 2026

Base oficial: `c23b55d56566baf64c9f41149821b3d4ef7e1fb2`.
Fuente: cambios rastreados de `vintage-telnet-2-nuevo` protegidos en
`recuperacion/20261012-cambios-rastreados` (`a80c1faa4ab7a395c264ba127c39a295c13caa96`)
y pruebas recuperadas en `recuperacion/20261012-documentos-y-codigo-nuevos`
(`0c66b9254882248059eb20a7e03d5b18c7ba98e5`).

## Alcance

- Los encargos registran el lugar donde se realizó la acción; una observación
  con el mismo nombre en otra sala no cumple el requisito. Los registros antiguos
  incompletos no se completan retroactivamente y los encargos ya pagados siguen pagados.
- Aceptar o entregar un encargo requiere que esté presente quien lo ofrece.
  Rechazar la acción conserva los eventos y el estado del personaje.
- Los diálogos y recuerdos de personajes cambian con la historia compartida,
  sin repetir premios ni modificar los documentos canónicos en memoria.
- La prosa de un adversario puede variar por sala. Una lista explícita de campos
  impide cambiar perfiles, recompensas, material, clase o recursos visuales.
- Los encargos pagados muestran su resultado propio.

Se conservaron el combate escalado, la economía, el equipo, las rutas y los
contenidos nuevos de `main`. No se aplicó íntegramente ningún commit histórico.
Este bloque no añade recursos binarios ni modifica servicios o despliegues.

## Verificación

Las pruebas recuperadas cubren prosa contextual, inmutabilidad, ausencia de NPC,
lugar de acciones, registros históricos y memoria compartida sin premios repetidos.
La validación local utiliza dependencias existentes sin instalar ni iniciar servidores.
Los originales, bundles y respaldos permanecen en sus ubicaciones consolidadas.

## Arte de estados

Tres variantes finales de la entrega consolidada: Hoshai sin polea, fondo de
almacén de Korven sin placa y balanzas de Korven con la placa devuelta. Se integran
seis WebP (773.662 bytes), verificados contra el SHA-256 de la entrega y decodificados
para comprobar dimensiones. Sus flags y descripciones ya existían en main.
No se añaden originales PNG, GLB, descartes ni recursos runtime. Las pruebas
verifican estado personal/compartido, lecturas sin mutación, rutas reales y fallback.

## Prosa de fauna recuperada

Se rescatan 34 campos de descripción, advertencia e introducción al encuentro de
15 criaturas desde los cambios rastreados protegidos. Sólo se aplican cuando
main conserva exactamente el campo base anterior; ninguna divergencia reciente
se sobrescribe. Se revisaron las señales físicas y las salidas voluntarias: no
añaden poderes, recompensas, materiales ni perfiles. El resto de los atributos
de criaturas se comparó estructuralmente con main y permanece idéntico.

## Recorridos y documentación recuperados

Se recuperan la guía narrativa y su entrada de canon, además del recorrido API
`review-narrative-stories.py`, adaptado a los temas vigentes de Seran. Cada modo
crea una base temporal, usa el cliente de pruebas Flask y no abre puertos ni
consulta jugadores de producción. No escribe entregas dentro del repositorio.

Validación local: diez encargos pagados (218 movimientos, 272 acciones); cinco
alternativas pagadas (135 movimientos, 165 acciones); recorrido independiente
(94 movimientos, 118 acciones). Los tres modos entran en CI. Son evidencia
técnica aislada, no una aprobación de diversión ni validación en Raspberry.

Los otros dos scripts recuperados (`narrative-klv-journey.py` y
`validate-narrative-klv.py`) quedan en recuperación: el primero depende de un
servidor HTTP externo y el segundo de un snapshot histórico local que no es
la base actual. Sus objetivos se cubren con los recorridos aislados y la
comparación estructural de campos, sin incorporar esos supuestos antiguos.

## Diálogos y acciones de seis regiones

Se recuperan 116 textos de tópicos, recuerdos y acciones, únicamente donde main
conservaba exactamente la base histórica. Las listas de acciones se reconciliaron
por ID y no se sustituyeron completas. Ninguna guarda, ID, salida, inventario,
recompensa ni orden de acciones cambia, comprobado por comparación estructural.

Dos adaptaciones explícitas: el aro del recipiente de Elin queda vacío y la tabla
continúa sosteniendo el juguete del secadero; no se atribuye al aro ese apoyo.
La acción de Taren evita introducir un pronombre de género no necesario. Las
divergencias más recientes de main se conservan.
