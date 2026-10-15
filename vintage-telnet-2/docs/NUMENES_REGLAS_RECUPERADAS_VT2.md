# Númenes en Vintage Telnet 2 — reglas recuperadas y frontera de implementación

**Estado:** dossier en preparación; no implica canon nuevo, encuentro jugable, cambio de código ni despliegue.
**Responsable:** Historiador. **Fecha:** 2026-10-14.
**Nomenclatura vigente VT2:** Númenes. El término histórico «Arcanes» se conserva únicamente como referencia documental para evitar confusión con la clase Arcano.
**Autorización de esta fase:** investigar, recuperar y preparar; aún no activar.

## 1. Fuentes de verdad

- Fuente original de identidad y los ocho modelos: [ARCANES.md](../../vintage-telnet/ARCANES.md).
- Reglas históricas de vinculación y acompañamiento: [GAMEPLAY.md, sección 21](../../vintage-telnet/GAMEPLAY.md). Allí estaban rotuladas **CRITERIO V1 APROBADO**; eso NO significa que estén implementadas en VT2.
- [CONFIRMED_IDEAS.md](../../vintage-telnet/CONFIRMED_IDEAS.md) y [ART_WORLD_GUIDE.md](../../vintage-telnet/ART_WORLD_GUIDE.md) explican anomalía, categoría y nombre.
- [IDEAS_FUTURAS_HISTORIADOR_01.md](IDEAS_FUTURAS_HISTORIADOR_01.md) preserva el renombre aprobado el 8 de octubre de 2026 y establece que reactivar la documentación NO autoriza desplegar.
- [CANON_VIGENTE.md](CANON_VIGENTE.md), [DECISIONES_VIGENTES.md](DECISIONES_VIGENTES.md), [CONTENT_CONTRACT.md](../CONTENT_CONTRACT.md) y [AGENTS.md](../AGENTS.md) rigen los límites técnicos y narrativos actuales.

**Orden de autoridad:** implementación autoritativa del servidor VT2 y decisiones explícitas actuales > canon VT2 > reglas históricas de VT1 que esperan reconciliación > propuestas contenidas en este expediente. No reescribir VT1 retrospectivamente ni presentar escenas nuevas como canon aprobado.

## 2. Identidad y límites

**Definición heredada:** ser con apariencia de animal conocido, una anomalía imposible y personalidad propia. Puede llegar a ser compañero por vínculo voluntario. El mundo conserva tres categorías independientes:

1. Animal común: perro, gato, ratón, conejo, ave u otra fauna natural, sin magia por defecto.
2. Criatura fantástica: forma de vida propia de Vintage Telnet, incluso si es peligrosa, pero no Númen por ser extraordinaria.
3. Númen: animal reconocible de aspecto familiar con una anomalía propia, capacidad de establecer un vínculo y voluntad. No es objeto, loot, enemigo ordinario ni invocación de la clase Arcano.

La anomalía debe tener una forma principal clara; no añadir múltiples poderes, símbolos, alas, armas o una explicación del origen de la magia. El hecho de que existan distintos ejemplares de un modelo es compatible con variaciones naturales de color, tamaño razonable, postura, temperamento y edad aparente. Las letras A–H son claves editoriales, **no nombres conocidos en el mundo**.

## 3. Contrato histórico de juego — lo que habíamos acordado

### R01 — Vinculación, nunca captura automática

**Encontrar → observar → comprender comportamiento → comprobar compatibilidad → generar confianza mediante decisiones → vínculo voluntario → nombrar.**

Un ejemplar no pasa al inventario al tocarlo, comprarlo, derrotarlo, perseguirlo ni repetir una misma acción. Antes del vínculo sigue siendo libre de no seguir al personaje. La narración de «se quedó cerca» no basta para afirmar «ya es tuyo».

### R02 — Confianza discreta y contextual

La progresión histórica propone estados como **desconfiado, tolera presencia, se acerca, confía, vínculo posible**. Son ejemplos de diseño, no identificadores de estados de VT2. El jugador no ve porcentajes ni barras; cada paso depende de una elección contextual y de señales que haya podido leer. Repetir cinco veces «acariciar» nunca sustituye comprender al Númen. El encuentro puede quedar incompleto sin castigo arbitrario.

### R03 — Rechazo legible

Una respuesta errónea debe tener advertencia física o conductual: postura tensa, orejas atrás, refugio buscado, distancia aumentada. Puede cerrar ese encuentro. Por defecto no produce desaparición permanente de un Númen potencial tras un único error razonable. Un vínculo sólo se produce si el Númen también acepta.

### R04 — Compatibilidad de poderes adquiridos

En VT1 se aprobaron incompatibilidades **sólo con poderes concretos ya adquiridos**. No se determina por clase, especie, nivel, atributos, porcentajes, afinidad general ni tiradas. Un modelo puede ser universalmente compatible si no tiene incompatibilidades. **Pendiente VT2:** validar los poderes disponibles y definir listas concretas; en ausencia de lista aprobada, no inventar prohibiciones.

### R05 — No retroactividad

Aprender posteriormente un poder que habría impedido un vínculo nuevo **no destruye** una relación ya formada. Cualquier excepción requiere historia y norma expresamente aprobadas. El cambio de equipo o menú tampoco debe deshacer el vínculo.

### R06 — Tres vinculados, uno activo

Límite histórico **3 Númenes vinculados por personaje; 1 activo en viaje**. Los otros permanecen en el hogar, y mientras estén allí no prestan su poder. La existencia actual de hogares en VT2 no significa que exista el almacenamiento o panel de Númenes. Su implementación requiere contrato de persistencia y UI.

### R07 — Un poder único fijo más compañía

No suben niveles, no reciben PA/PP, no tienen árbol de habilidades, evolución por entrenamiento ni economía de estadísticas propia. Cada ejemplar aporta compañía y **un solo poder fijo de su modelo**, que puede ser contextual, activo o pasivo. Sólo el activo lo ofrece. Los ocho poderes candidatos de la segunda nota son **hipótesis**, no hechos ni beneficios garantizados.

### R08 — Supervivencia ordinaria

La derrota habitual del personaje no causa muerte permanente del compañero. Se puede narrar refugio, retirada o recuperación, manteniendo nombre y vínculo. **Pendiente VT2:** reglas de dónde reaparece el Númen y cuándo recupera su estado, compatibles con el sistema de respawn y hogares.

### R09 — Nombre individual del jugador

Nunca bautizar los modelos A–H antes del vínculo. Cuando éste se acepta, el jugador elige un nombre y el servidor lo persiste. **Pendiente:** límites de caracteres, moderación de nombres, cambios posteriores y duplicados entre personajes. Ningún artista debe rotular la lámina de un modelo no vinculado con un nombre propio.

### R10 — Naturaleza personal dentro de un mundo compartido

La ubicación y los encuentros deben obedecer al servidor, pero **la pertenencia, el nombre, la confianza y el acompañante activo son del personaje**, no de toda la comunidad. Ver un animal en una sala no debe permitir conocer secretos de otro jugador; el hallazgo de uno no puede atribuir automáticamente logros a otro. No prometer presencia permanente de un ejemplar único ni diseñar un recurso global que un jugador pueda agotar y bloquear para todos sin decisión expresa.

## 4. Restricciones vigentes de VT2

- Sólo hay **cuatro clases aprobadas en VT2**: Juramentado, Arcano, Sombra y Artífice. Ni Vigía ni Invocador deben reactivarse por integrar Númenes.
- Las seis regiones y comunidades conservan geografía y costumbres documentadas; ubicar candidatos exclusivamente en salas existentes no significa que el sistema ya los muestre.
- El motor autoritativo decide señales, acciones, presencia, rutas y progreso. El cliente no debe filtrar Númenes no descubiertos mediante paneles, mapas, thumbnails ni botones.
- El hogar es del jugador, pero **no** se puede asumir que hoy soporte almacenamiento de animales. Tampoco se puede guardar un Númen como una pieza común de inventario sin diseño.
- Un Númen no recibe perfil de enemigo, botín de criatura, recompensas de sellos, probabilidades de loot ni entradas de combate para «simular» su sistema.
- Lectura primero: la anomalía debe poder comprenderse por texto incluso si es visual (doble sombra) o auditiva (saltos sin sonido).
- No reescribir el origen de la magia ni vincular por inferencia a los constructores de Vaisgard.

## 5. Lo que falta decidir con Arquitectura y Jugabilidad

| Materia | Pregunta contractual necesaria |
|---|---|
| Persistencia | ¿ID de ejemplar, dueño, nombre, estado, hogar y acompañante con qué esquema y migración? |
| Encuentros | ¿Instanciados por personaje, compartidos, temporales o de aparición controlada? |
| Confianza | ¿Qué transiciones válidas, errores, vencimiento y recuperación entre sesiones? |
| Compatibilidad | ¿Qué lista de poderes realmente existentes se consulta y con qué instante de validación? |
| Capacidad | ¿Se ratifica 3/1 y cómo se cambia desde el hogar sin duplicar ventajas? |
| Poderes | ¿Cuál poder piloto, en qué acción, con qué restricciones y sin filtrar secretos? |
| Derrota | ¿Dónde espera el Númen tras retirada, caída, desconexión o muerte del jugador? |
| Seguridad | ¿Puede un cliente falsificar nombre, vínculo, transferencia, intercambio, adopción o invocación de poder? |
| UI/texto | ¿Cómo se ve sin convertirlo en inventario, panel gigante o animal del bestiario? |
| Pruebas | ¿Cómo se verifica simultaneidad, reconexión, casa, límite, compatibilidad posterior y cuentas distintas? |

## 6. Contratos de responsabilidad y camino sugerido

**Historiador:** ocho modelos, límites del mundo, hábitats narrativos candidatos, comportamiento, señales y límites de identidad; no autorizar nuevos poderes por sí solo.

**Narrador:** para cada encuentro producir llegada, descripción, observación, decisiones con efectos de confianza legibles, rechazo y despedida; variaciones día/noche/lluvia si el lugar lo pide. No asumir que ofrecer comida es la solución universal. No etiquetar la criatura antes de que el personaje lo descubra.

**Jugabilidad:** validar R01–R10 para VT2 y cerrar transiciones, sistema de poderes, dificultad y antifarmeo. Mantener las cuatro clases actuales. Verificar si hay realmente una incompatibilidad y no inventar un veto por motivos narrativos.

**Arquitecto/Desarrollo (Codex/Claude):** tras decisión explícita, implementar un piloto limitado, pruebas, persistencia y presentación autorizada, nunca haciendo del modelo de texto una autoridad para producir flags. Mantener la fuente oficial en GitHub y no desplegar a Raspberry sin autorización concreta.

**Arte:** crear primero láminas de identidad con anomalías verificables, después escenas sólo si hay aprobación. No usar ilustración para revelar información que el jugador aún no vio.

**QA:** probar al menos: primer encuentro y no descubrir; descubrir sin adoptar; una acción errónea con rechazo; dos cuentas; tres vinculados; cuarto rechazado; un activo; hogar; reconexión; derrota; nombre persistente; cambio de poder después del vínculo; no filtración de sala o criatura oculta; repetición sin farmeo.

**Piloto propuesto para evaluación (no aprobado):** empezar por A (perro de cuatro orejas) para validar observación y vínculo físico; contrastar con E (ave de sombra doble), que prueba anomalía ambiental y accesibilidad. Después escalar a los demás. Preparar el sistema **antes** de generar ocho mecánicas distintas.

## 7. Estado final

Las reglas históricas están **recuperadas**. Los encuentros, ubicaciones, conductas refinadas y habilidades propuestas están **preparados editorialmente**, no aprobados como canon vivo ni programados. No abrir issues de implementación por el solo hecho de archivar estas notas. No cambiar contenido jugable, servidor, UI, archivos de partida o desplegables durante esta fase.

**Documento complementario:** [NUMENES_OCHO_DOSSIER_NARRATIVO.md](NUMENES_OCHO_DOSSIER_NARRATIVO.md).
