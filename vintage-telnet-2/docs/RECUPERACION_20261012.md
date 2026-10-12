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
