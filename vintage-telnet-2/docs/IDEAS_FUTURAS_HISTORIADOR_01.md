# Ideas futuras preservadas — legado del Historiador 1

**Estado:** ideas de exploración futura, NO canon aprobado, NO backlog de implementación.
**Origen:** tres temas compartidos por el hijo del creador, preservados a petición expresa del creador el 2026-10-08.
**Custodia:** Historiador de Vintage Telnet 2.

Este archivo conserva ideas sin activarlas. No autoriza cambios de mundo, clases, criaturas, tecnología, progresión, mapas, narrativa, arte ni código. Cualquier desarrollo requiere decisión posterior explícita y contraste con `docs/DECISIONES_VIGENTES.md`, `AGENTS.md` y el contenido jugable actual.

## 1. Númenes (antes «Arcanes»; distintos de la clase Arcano)

**Decisión de nomenclatura del 2026-10-08:** el creador autoriza renombrar a los seres históricamente llamados **Arcanes** como **Númenes** para distinguirlos de la clase jugable **Arcano**. El nombre anterior se conserva como alias documental de búsqueda, no como nombre recomendado en textos nuevos.

**Fuente histórica:** `vintage-telnet/ARCANES.md` (Historiador 1); complementos en `vintage-telnet/GAMEPLAY.md` §21 y `vintage-telnet/CONFIRMED_IDEAS.md`. Son seres de apariencia animal familiar con una anomalía imposible y personalidad propia, potenciales compañeros vinculados al jugador. Se conservan las ocho formas originales, el derecho del jugador a elegir el nombre individual y el concepto histórico de hasta tres compañeros y hogar, sujeto a revisión de Jugabilidad para VT2. **No son una clase ni animales comunes.**

El cambio es **terminológico y documental**, no autoriza implementar el sistema, migrar datos, alterar código ni introducir Númenes en encuentros actuales. Cuando se reactive, reconciliar el canon de VT1 con el VT2 vigente antes de redactar contratos.

## 2. Dragones — canon histórico RESERVADO, no idea genérica

**Fuente histórica reservada:** `vintage-telnet/SECRETS.md` (Historiador 1). Allí ya existe un desarrollo de canon secreto sobre dragones y descubrimiento futuro. **No copiar sus detalles a este documento público ni exponerlos en resúmenes para jugadores.** No confundir «todavía no implementado en VT2» con «nunca definido»: antes de cualquier trabajo, el Historiador autorizado deberá consultar la fuente reservada, contrastarla con VT2 y decidir con el creador qué conservar. No activar pistas, encuentros ni implementación sin autorización.

## 3. Civilización o especie tecnológicamente avanzada con magia

**Fuente histórica:** `vintage-telnet/FUTURE_IDEAS.md` (Historiador 1). La idea original propone una civilización **o especie** con tecnología avanzada **combinada con la magia del mundo**. El registro original indica expresamente que no debe aparecer ni desarrollarse en la experiencia inicial. Su naturaleza, origen, localización, nivel tecnológico y relación con los pueblos actuales permanecen sin definir. No vincularla por inferencia con la construcción del núcleo antiguo de Vaisgard.


## 4. Propuesta de Matías — fusión de objetos duplicados (2026-10-14)

**Origen:** idea expresada verbalmente por Matías, recogida por el creador: si un jugador compra accidentalmente dos objetos iguales, podría aprovecharlos **fusionándolos en uno de la misma familia pero un poco más poderoso**, en vez de desperdiciar la compra.

**Estado:** PROPUESTA DE JUGADOR — no es canon aprobado, no tiene contrato de balance y no autoriza implementación.

**Ejemplo explicativo, no regla vigente:** dos espadas idénticas se convierten, por una acción voluntaria, en una espada de ese mismo tipo mejorada. La segunda espada se consume; no deben multiplicarse objetos ni sellos. El ejemplo no establece niveles, estadísticas ni porcentajes.

**Preguntas obligatorias antes de aprobar:**
1. ¿Sólo dos copias estrictamente idénticas, también en estado y calidad, o dos objetos del mismo catálogo?
2. ¿Qué categorías se pueden fusionar? No asumir que misiones, consumibles, armas únicas, objetos ligados al personaje, reliquias o premios especiales deban ser aptos.
3. ¿En qué servicio sería coherente? Evaluar si la forja actual puede ofrecerlo sin reemplazar las mejoras y reparaciones ya existentes.
4. ¿Cuál es la ganancia realmente pequeña, con qué coste, tope y protección contra abuso económico o progresión ilimitada?
5. ¿Se necesita confirmar antes de consumir piezas, especialmente una equipada o valiosa? ¿Cómo evitar fusionar por error dos objetos recién comprados?
6. ¿El objeto mejorado conserva identidad visual y propiedades o requiere un catálogo nuevo? ¿Cómo se evita la acumulación de duplicados y el desbalance de mercado?
7. ¿Qué sucede si los objetos provienen de botín, comercio, recompensas personales o contenido con restricciones de propiedad?
8. ¿Qué pruebas garantizan atomicidad: nunca perder ambas copias ante error o reconexión, ni duplicar el resultado?

**Frontera de responsabilidad:** Historia custodia la intención de Matías. Jugabilidad debe investigar mecánica, economía, balance, restricciones y límites; Arquitectura debe asegurar persistencia y transacción atómica; Narrador puede diseñar una breve escena de forja **sólo si se aprueba el sistema**.

**No abrir un ticket de programación por este apunte ni desplegarlo.** Es una idea independiente del sistema de Númenes y no se integra con sus poderes.

## Regla de reactivación

Cuando el creador decida retomar uno de estos temas, el Historiador deberá: (1) consultar la intención original del creador y de su hijo; (2) revisar canon y juego vigentes; (3) redactar alternativas y consecuencias antes de canonizar; (4) obtener decisión explícita; (5) entregar contratos separados a Narrativa, Jugabilidad, NPCs, Arte y Desarrollo según corresponda.

**No abrir issues de implementación por este registro. No desplegar.**

> Una idea guardada no necesita explicarse hoy para poder enriquecer el mundo mañana.
