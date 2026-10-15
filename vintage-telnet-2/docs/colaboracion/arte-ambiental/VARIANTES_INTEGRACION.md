# Variantes de estado — integración propuesta

Tres imágenes adicionales seleccionadas. No integradas. No cambian la cobertura de 183 habitaciones. Rutas y archivos en `variantes-evaluadas.json`.

| Habitación | Flag verdadero | Variante |
|---|---|---|
| hoshai_cajas_camino | hoshai_polea_recogida | sin-polea |
| korven_almacen_fondo | korven_placa_recogida | sin-placa |
| korven_almacen_balanzas | korven_placa_devuelta | placa-devuelta |

Propuesta: resolver flags efectivos con su alcance canónico y elegir variante de esa habitación sólo cuando el flag se cumpla. En otro caso, usar base. No deducir los flags por imagen ni modificar persistencia de partidas. La estructura actual de `placeArt(room)` usa vistas fijas; el arquitecto debe verificar cómo exponer esos estados antes de integrar variantes. No se tocó motor.

Hora y clima: vistas representativas no sincronizadas. No se generaron cuatro copias por lugar. Propuestas ambientales relevantes en `DIRECCION_VISUAL.md`; requieren selector. La lluvia cambia información y materiales disponibles en la lectura; no afirmar que una vista seca corresponde a lluvia actual. La comparación base/variante está en `hojas-contacto/lote-37-variantes-estados.jpg`, revisada. Las marcas pequeñas de contacto tienen legibilidad limitada: conservar detalle textual.

## Bastión de las Aguas Antiguas — 2026-10-14

El contrato vigente ya permite `states[].overrides.art_variant`; la propuesta
anterior describe el estado histórico de aquella entrega. Este lote reutiliza
el selector existente, sin cambiar el motor ni exponer flags al cliente.

| Habitación | Flag | Variante |
|---|---|---|
| veyra_mazmorra_boveda_guardian | dragon_vencido | agua-libre |
| veyra_mazmorra_recorridos_fin | dragon_vencido | agua-libre |
| veyra_acequia_exterior | dragon_vencido | agua-libre |

La base de la acequia muestra el cauce seco; la bóveda cambia del remolino
vigilado al agua libre con el dragón vivo en su repisa; el Sagrario incorpora
la corriente en la canaleta. Las tres variantes usan exactamente la guarda de
su texto. El estado personal de premio recogido conserva la vista representativa
del Sagrario y su descripción autoritativa, sin crear una variante adicional.
Prompts y límites: [MAZMORRA_PROMPTS.md](MAZMORRA_PROMPTS.md).
Archivos finales y hashes: [MAZMORRA_ASSETS.json](MAZMORRA_ASSETS.json).
Integración preparada en este worktree; revisión humana y publicación pendientes.
