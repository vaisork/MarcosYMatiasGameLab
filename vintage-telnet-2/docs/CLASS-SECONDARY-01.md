# CLASS-SECONDARY-01 — contrato implementado

Las cuatro acciones usan `Engine.actions` y `resolve_round`; sustituyen la
intervención de esa ronda y no consumen PP. Las decisiones sin cifra en el
canon quedan acotadas a una respuesta enemiga, con **5 de fatiga base** y
**4 rondas de recarga** (cuatro intervenciones propias completadas).

| Clase y disparador | Efecto y éxito/fallo | Equipo, intención y duración |
| --- | --- | --- |
| Juramentado — Paso de Ruptura: combate activo y arma de corto alcance equipada. | Prueba precisión normal; éxito inflige 75% del daño bruto del ataque básico. Si la preparación enemiga es interrumpible, la cancela y su respuesta usa precisión base −15 puntos porcentuales. Si falla, no causa daño ni interrumpe. | No empuja ni desplaza. Contra preparación no interrumpible o sin preparación, un impacto solo inflige daño. No usa estado adicional. |
| Arcano — Velo de Contención: combate activo y foco arcano equipado. | Coloca una barrera igual al 25% redondeado del daño base de la criatura (mínimo 1). Absorbe hasta ese valor del daño recibido. | Dura una respuesta enemiga, incluso si falla; se consume al resolverla. Otra activación reemplaza la barrera. |
| Sombra — Finta de Vacío: combate activo y escena que permita fintar. | No daña ni interrumpe. Aumenta en 10 puntos porcentuales la precisión de la respuesta; si falla, concede Apertura (+15 puntos a precisión del siguiente ataque básico). Si impacta, no concede ventaja. | `combat_context.feint_possible=false` la deshabilita; por defecto se permite. Apertura persiste en el estado de combate, se consume al atacar o desaparece al terminarlo. |
| Artífice — Traba de Campo: combate activo. | Reduce en 15 puntos porcentuales la precisión de la próxima respuesta y su daño en 25%. Cancela preparación solo si es interrumpible. | Efecto de una respuesta. No inmoviliza ni causa daño directo. Herramientas ordinarias se abstraen; no consume objetos ni activa crafting. |

Recarga se guarda por ID en `combat.cooldowns`; el contador descuenta la
intervención usada y las siguientes. Velo y Apertura se guardan en el estado
de combate ya persistido. Los ataques siguen disponibles durante recarga.

## Casos límite y exploits

- Fallar Paso consume la intervención, fatiga y recarga, pero no interrumpe.
- Velo pierde cualquier absorción sobrante; no se acumula ni cubre respuestas
  posteriores.
- Finta no cancela una preparación. El aumento de precisión respeta el límite
  general de 90%; Apertura no se apila y se consume en el siguiente ataque.
- Traba reduce una sola respuesta; contra acciones no interrumpibles no las
  cancela. No hay inmovilización ni daño repetible.
- El servidor valida disponibilidad/cooldown antes de aceptar una acción; una
  capacidad sigue siendo opcional porque `atacar` y defensas siguen visibles.

## Decisiones conservadoras pendientes de playtest

- El canon no define precisión, barrera, fatiga ni recarga para este escalón;
  estos valores son provisionales y comunes salvo la barrera porcentual.
- Finta presupone que el rival puede interpretar una intención; el contenido
  debe marcar `feint_possible=false` para excepciones.
- Traba trata herramientas corrientes como preparación abstracta; no exige
  inventario para evitar abrir crafting o un recurso nuevo.
- Paso no desplaza criaturas grandes; su daño conserva el tope de 75% existente.

Las pruebas de `tests/test_class_combat.py` cubren intención, fallo, caducidad,
recarga y estado serializable; no validan balance de juego.
