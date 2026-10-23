# Senku 2 — Plan de arquitectura y desarrollo

**Fecha:** 2026-10-22 · **Dirección creativa:** Matías y Javier · **Arquitecto designado para el relevo:** Claude · **Estado:** diseño aprobado conceptualmente, implementación pendiente.

**Documento de diseño en Drive:** https://docs.google.com/document/d/1JMYqvy3uLbefatRrqxSAg6Ir99c9djloiUx7_uFFkqk/edit

## Alcance y límites

La gran actualización comienza en **taquería**. Casa, Ciudad y Camión se conservan como base. **No editar ni reemplazar Legacy** hasta que Javier apruebe la estrategia de implementación. `senku/v2/` está preparado pero no contiene juego; este PR sólo documenta el plan. No mezclar Vintage Telnet 2 ni Vaisgard. Respetar `AGENTS.md`, `senku/v2/AGENTS.md` y el HEAD vigente antes de programar.

## Historia de México

1. Casa: mantener el inicio.
2. Ciudad/camión: viaje y bonus cronometrado de Churus.
3. Taquería: buscar a una rata, encontrar enemigos, obtener traje de rata (modalidad pendiente).
4. Camioneta afuera de taquería: cajuela abierta, cajas, viaje y bonus de Churus.
5. Desierto: niño pide ir al parque, mamá acepta, estacionan ante la reja; Senku entra, explora y enfrenta ratones/hámsters.
6. Despeñadero/montaña: anclador temporal y garras de escalada permanentes.
7. Cima: lanzador de ratones montado en lomo; jefe «Gato Mecánico» provisional.

## Sistemas y contratos por diseñar

- **Menú/trajes:** original y rata; arte de selección detallado y sprite jugable simplificado. Equipamiento visible y desbloqueos permanentes.
- **Economía:** renombrar «Cargas» a «Churus» donde aplique, recoger, gastar y persistir saldo/compras. No inventar precios.
- **Persistencia:** esquema versionado, lectura tolerante a almacenamiento bloqueado, migración compatible y no destrucción de partidas de Legacy.
- **Salud/vidas:** 100 HP y siete vidas propuestas; enemigos pequeños causan inicialmente 1 HP por golpe. Falta regla de relación HP/vidas.
- **Combate:** esquivar o saltar sobre enemigos; ratones/hámsters negros y cafés; sin jefes intermedios aprobados.
- **Objetos:** botiquín consumible, garras permanentes, anclador temporal apuntable, lanzador temporal en combates.
- **Bonus:** camión y camioneta con tiempo y Churus; cantidades y tiempos pendientes.
- **Visual:** arquitectura independiente de resolución/estilo de sprites para permitir evolución futura más allá del pixel art.

## Orden de entregas sugerido

1. **Claude — auditoría y decisión arquitectónica:** inspeccionar main, reglas, legacy/v2 y dependencias; presentar opciones de implementación y pedir autorización explícita para elegir base.
2. **Claude — contratos técnicos:** definir modelo de estado, economía, trajes, inventario, escenas, entradas táctiles/teclado, persistencia y pruebas de regresión; establecer límites de módulos y PRs.
3. **Desarrollo — vertical taquería:** Churus + menú/trajes + Senku original/rata + rata/enemigos + guardado, condicionado a decisiones pendientes.
4. **Desarrollo — vehículos:** bonus de camión y camioneta, balance validado.
5. **Desarrollo — desierto:** diálogo familia, reja, mapa largo, enemigos y objetos.
6. **Desarrollo — movilidad/combat:** anclador, garras, botiquín y lanzador.
7. **Desarrollo — jefe:** sólo después de aprobar identidad, patrones y victoria.
8. **QA:** móviles, iPad, escritorio, partidas previas, reinicio, economía no duplicable, control y progresión.

## Decisiones bloqueantes (Matías/Javier)

- ¿Senku 2 nace en `senku/v2/` o se evoluciona Legacy? No suponerlo por el nombre del documento.
- ¿Traje rata se regala o compra? ¿Precios de trajes?
- ¿Cómo funcionan las siete vidas y 100 HP?
- ¿Jefe Gato Mecánico o Ratón Mecánico, y qué ataques?
- ¿Duración y recompensa de bonus, ubicación exacta de objetos?

## Protocolo Claude / Operación Astra

- Claude es **arquitecto técnico propuesto para Senku 2**; Javier y Matías mantienen autoridad creativa. La asignación de Claude debe hacerse en su sesión/agente correspondiente: este documento no lo activa automáticamente.
- Trabajar en PRs pequeños y verificables; un objetivo activo por agente, pruebas y notas de relevo en cada entrega.
- Reinicio comunicado: **2026-10-23 10:00, Ciudad de México**. Detener nuevos desarrollos antes de 09:00; 09:00–09:45 reservar para pruebas, commits, PRs y relevo. No depender de contexto efímero.
- **Primera acción de Claude:** revisar este plan y el documento de Drive, confirmar estado real de main, entregar propuesta de arquitectura y solicitar decisiones bloqueantes. **No comenzar cambios de código sin confirmación de la base de implementación.**
