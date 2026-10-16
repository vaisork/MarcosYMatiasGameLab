# MatiasGameLab Dispatcher v1 — propuesta operativa

**Estado:** PROPUESTA PARA IMPLEMENTACIÓN POR ARQUITECTURA  
**Origen:** Javier + Investigador Técnico y de Implementación — Vintage Telnet  
**Objetivo:** reducir esperas, trabajo paralelo innecesario y la necesidad de que Javier transporte tareas entre agentes.

## 1. Problema observado

MatiasGameLab ya tiene buena separación de roles, GitHub como fuente de verdad, ramas/PR, pruebas, integración, Raspberry y un carril de arte. El cuello de botella actual es el despacho:

- Javier todavía despierta manualmente chats para preguntar si tienen trabajo.
- Los responsables suelen estar descritos en texto, pero no siempre representados como estado estructurado.
- Ideas nuevas pueden anteponerse al trabajo en curso.
- Existen issues solapados o trabajo ya implementado que permanece abierto.
- Hay más especialistas que automatizaciones disponibles.
- Los handoffs pueden quedar esperando aunque la dependencia ya terminó.

Dispatcher v1 NO reemplaza GitHub ni los roles. Añade disciplina de cola y capacidad.

## 2. Principios

1. GitHub/main sigue siendo fuente de verdad de código y documentación.
2. Javier y Matías dirigen; no deben ser mensajeros entre agentes.
3. Una idea nueva no equivale a prioridad nueva.
4. Inbox puede capturar trabajo; solo Arquitectura promueve BACKLOG a READY.
5. Solo Javier/Matías pueden forzar una interrupción creativa/prioridad.
6. Bugs P0 confirmados pueden interrumpir el flujo normal.
7. Terminar trabajo tiene prioridad sobre abrir frentes.
8. El issue debe ser el registro principal del estado operativo; evitar repetir estado vivo en múltiples documentos.
9. Los agentes leen su cola, no toda la repo indiscriminadamente.
10. Automatizar estados no autoriza merges, publicación ni cambios de canon fuera de los roles vigentes.

## 3. Flujo completo

```text
Javier / Matías
     |
     | ideas
     v
   INBOX
     |
     v
Agente Inbox
captura / deduplica / clasifica
NO prioriza / NO libera trabajo
     |
     v
  BACKLOG ---------> ICEBOX
     |
     | capacidad disponible
     v
 Arquitectura
estructura / dependencias / aceptación
     |
     v
   READY
     |
     v
 Dispatcher por ROLE
     |
     v
 IN PROGRESS
     |
     v
 REVIEW
     |
     +----> corrección -> IN PROGRESS
     |
     v
   DONE
     |
     +----> libera capacidad -> Arquitectura revisa BACKLOG
```

Estados excepcionales:

- **BLOCKED:** espera una dependencia objetiva.
- **NEEDS JAVIER:** requiere decisión real de Javier/Matías.
- **ICEBOX:** idea válida sin intención próxima de ejecución.

## 4. Estados mínimos

- INBOX — captura todavía sin ordenar.
- BACKLOG — trabajo válido, no autorizado para ejecución.
- ICEBOX — conservar para futuro, sin expectativa próxima.
- READY — definido, sin bloqueo y autorizado para tomar.
- IN PROGRESS — un responsable lo está ejecutando.
- REVIEW — existe entrega que requiere revisión.
- BLOCKED — dependencia concreta pendiente.
- NEEDS JAVIER — decisión humana necesaria.
- DONE — resultado aceptado/cerrado.

No crear estados adicionales sin necesidad demostrada.

## 5. Prioridades

- **P0:** producción/juego roto, seguridad, pérdida de datos o bloqueo crítico confirmado. Puede interrumpir.
- **P1:** trabajo activo/importante dentro de la capacidad.
- **P2:** siguiente trabajo elegible.
- **BACKLOG:** no compite todavía por ejecución.

Una idea expresada como “se me ocurrió…” entra por INBOX/BACKLOG. Una instrucción explícita “quiero cambiar la prioridad” requiere que Arquitectura muestre el impacto y Javier confirme el cambio.

## 6. Agente Inbox

Inbox es un rol bajo demanda y NO consume una de las cinco automatizaciones periódicas.

Puede:
- recibir ideas libres de Javier/Matías;
- registrar proyecto, origen, resumen, intención y tipo;
- buscar duplicados/solapamientos;
- enlazar issues relacionados;
- enviar a BACKLOG o ICEBOX;
- pedir una aclaración mínima solo si ni siquiera puede conservarse la intención.

No puede:
- liberar a READY;
- crear una cascada de subtareas especializadas;
- encargar trabajo a Historia/Jugabilidad/Arte/Desarrollo;
- convertir una ocurrencia en una especificación costosa;
- cambiar prioridades activas.

Formato mínimo recomendado:

```text
PROYECTO:
ORIGEN:
TIPO:
IDEA:
INTENCIÓN:
RELACIONADO/DUPLICADO:
ESTADO: BACKLOG | ICEBOX
```

## 7. Arquitectura como gate de capacidad

Arquitectura controla **qué entra al sistema activo**. Dispatcher controla **quién ejecuta lo que ya entró**.

Arquitectura:
- revisa BACKLOG solo cuando exista capacidad o una revisión programada lo justifique;
- deduplica antes de liberar;
- define criterios de aceptación y dependencias;
- promueve BACKLOG -> READY;
- puede devolver READY -> BACKLOG si se excede capacidad y nadie lo ha tomado;
- si un trabajo ya iniciado debe pausarse, documenta el motivo y conserva el estado/material antes de replanificar;
- usa NEEDS JAVIER solo para decisiones que realmente requieren dirección.

## 8. Límite de WIP

Punto de partida para Vintage Telnet:

- máximo **4 frentes funcionales activos**;
- dentro de ellos, máximo **3 frentes de construcción/contenido + 1 carril de publicación/operación** cuando sea necesario.

Un “frente” puede contener subtareas dependientes; no se cuenta cada microissue como frente separado.

Cuando no hay capacidad, nuevas ideas van a BACKLOG.

Regla inicial de liberación:
- el cierre de trabajo libera capacidad;
- Arquitectura revisa BACKLOG después de cierres relevantes;
- como freno adicional, por cada **3 entregas relevantes DONE**, Arquitectura debe considerar como máximo **1 frente nuevo** del BACKLOG, salvo que exista un hueco evidente dentro de un frente ya activo.
- P0 y cambio explícito de prioridad confirmado por Javier son excepciones.

Esta relación 3:1 es un punto inicial y debe ajustarse con métricas, no convertirse en dogma.

## 9. Dependencias y desbloqueo

Cada issue ejecutable debería poder expresar:

```text
PROJECT: vintage-telnet | senku
ROLE: historian-vt | gameplay-vt | research-vt | art-vt | developer-vt | integrator-vt | ops-vt | ...
STATUS:
PRIORITY:
BLOCKED-BY:
UNBLOCKS:
```

Ejemplo:

```text
Armas canónicas [historian-vt, READY]
   -> balance [gameplay-vt, BLOCKED]
      -> implementación [developer-vt, BLOCKED]
```

Al terminar una dependencia, el sistema/Arquitectura cambia el siguiente BLOCKED -> READY cuando todas sus dependencias estén satisfechas. Javier no transporta el aviso.

## 10. Handoffs

El issue es el handoff operativo principal.

Entrega mínima:

```text
RESULTADO:
ARTEFACTO/RUTA/PR:
PRUEBAS:
DECISIONES TOMADAS:
PENDIENTES:
DESBLOQUEA:
ESTADO PROPUESTO:
```

HANDOFF.md u otros documentos permanecen cuando exista una razón técnica/histórica real, pero no deben duplicar rutinariamente todo el estado del issue.

## 11. Ciclo del Dispatcher

En cada revisión:

1. leer únicamente trabajo READY/REVIEW/BLOCKED relevante;
2. comprobar entregas nuevas;
3. comprobar dependencias satisfechas;
4. promover BLOCKED -> READY cuando corresponda;
5. detectar trabajo sin movimiento;
6. detectar duplicados;
7. detectar PR integradas con issue operativo todavía abierto;
8. evitar crear nuevos frentes si WIP está lleno;
9. enviar decisiones reales a NEEDS JAVIER;
10. no reabrir trabajo terminado solo porque exista una idea más reciente.

## 12. Cinco automatizaciones mientras Work no está disponible

La limitación actual es cinco despertares periódicos. Deben utilizarse como supervisores de alto rendimiento, no intentar despertar a todos los especialistas.

Configuración provisional recomendada para las próximas ~48 h, sujeta a verificar las cinco tareas reales antes de cambiarlas:

1. **Arquitecto Vintage Telnet** — ~cada 2 h. Dispatcher principal VT.
2. **Arquitecto Senku** — ~cada 3 h. Dispatcher principal Senku.
3. **Jugabilidad Vintage Telnet** — ~cada 2 h mientras haya sistemas RPG activos.
4. **Historiador Vintage Telnet** — ~cada 2 h mientras exista cola canónica activa.
5. **Integrador/Programador Ligero VT** — ~cada 2 h para PR/revisión/conflictos/trabajo técnico desbloqueado.

No reservar por defecto un despertar periódico para Inbox, Narrador, NPC, Investigador, Psicopedagogía, Director de Arte o Artista. Son roles preferentemente event-driven. Esto no reduce su autoridad ni importancia.

Antes de aplicar esta distribución, Arquitectura debe verificar las automatizaciones activas reales y no sustituir una tarea útil a ciegas.

## 13. Cuando vuelva Work

Objetivo:

```text
evento/cambio GitHub
      -> Work / orquestación
      -> Dispatcher
      -> ROLE correspondiente
```

Las cinco tareas periódicas deberían evolucionar de motor principal a **watchdogs** que detecten atascos, estados inconsistentes o eventos perdidos.

No diseñar Dispatcher v1 dependiendo de una capacidad de “despertar un chat” que actualmente no esté comprobada.

## 14. AGENTS.md

AGENTS.md debe tender a contener reglas estables:

- roles y fronteras;
- fuentes de verdad;
- seguridad;
- integración/publicación;
- principios de coordinación.

No debería convertirse en el tablero de estado diario. Trabajo actual, bloqueos, prioridad y entregas viven en issues/campos/PR.

## 15. Métricas

Medir semanalmente, de forma ligera:

1. READY -> IN PROGRESS.
2. IN PROGRESS -> entrega.
3. entrega -> merge/cierre.
4. merge -> Raspberry/publicación cuando aplique.
5. porcentaje de trabajo rehecho.
6. número de intervenciones de Javier usadas solo para transportar información/despertar al siguiente agente.
7. número de frentes activos.
8. issues duplicados/solapados detectados.
9. tiempo en BLOCKED.

Métrica principal propia: **reducir intervenciones de Javier que no sean decisiones creativas, pruebas reales o cambios explícitos de prioridad.**

## 16. Fallos y excepciones

- Agente no responde: trabajo sigue READY/IN PROGRESS según evidencia; Arquitectura puede reasignar tras detectar inactividad, sin duplicar trabajo.
- Dependencia termina: desbloquear automáticamente/por revisión.
- Issue duplicado: consolidar y cerrar/relacionar el duplicado; no ejecutar dos veces.
- PR mergeada con issue abierto: reconciliar estado.
- Nueva idea durante WIP lleno: BACKLOG.
- Bug P0 confirmado: puede abrir capacidad extraordinaria/interrumpir.
- Javier cambia prioridad: Arquitectura documenta qué se pausa y el costo antes de mover el frente.
- Trabajo ya iniciado que vuelve a BACKLOG: conservar rama/artefactos/handoff para evitar perder avance.

## 17. Implementación recomendada por fases

### Fase 1 — Semántica y limpieza
- definir labels/campos equivalentes a PROJECT, ROLE, STATUS, PRIORITY;
- deduplicar issues abiertos;
- reconciliar issues cuyo PR ya fue integrado;
- identificar los 3–4 frentes activos reales;
- mandar el resto a BACKLOG/ICEBOX.

### Fase 2 — Dispatcher manual estructurado
- Arquitectura usa la cola READY/BLOCKED/REVIEW;
- prueba WIP;
- prueba NEEDS JAVIER;
- prueba desbloqueos sin Javier como mensajero.

### Fase 3 — Automatización GitHub
- automatizar cambios de estado seguros;
- no automatizar decisiones creativas;
- no automatizar merge/publicación sin los gates vigentes.

### Fase 4 — Work
- cuando vuelva la capacidad, probar activación event-driven;
- mantener los cinco despertares como watchdogs si siguen aportando valor.

## 18. Criterios de éxito

Dispatcher v1 funciona si:

- Javier puede volcar ideas sin alterar automáticamente prioridades;
- Arquitectura mantiene WIP limitado;
- un especialista puede identificar su trabajo READY sin leer todo el proyecto;
- terminar una dependencia hace visible el siguiente trabajo sin intervención de Javier;
- duplicados y estados obsoletos disminuyen;
- las decisiones que llegan a Javier son realmente decisiones;
- no se debilitan revisión, pruebas, canon, integración ni seguridad.

## 19. Instrucción para Arquitectura

Implementar de manera incremental. Primero observar y limpiar; después introducir estados/labels/campos; probar con Vintage Telnet antes de extender reglas automáticas a todo MatiasGameLab. No hacer una migración masiva irreversible ni cerrar trabajo ambiguo sin comprobar su estado real.

**Esta propuesta autoriza a Arquitectura a diseñar y ejecutar la implementación operativa, pero no autoriza cambios creativos, merges de producto, despliegues ni eliminación de trabajo sin los controles existentes.**
