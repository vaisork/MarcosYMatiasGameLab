# Senku 2 — Auditoría y propuesta de arquitectura

**Fecha:** 2026-10-22 · **Autor:** Claude (arquitecto técnico propuesto) · **Estado:** propuesta; sin código y sin autorización para elegir base. Decide Javier con Matías.
**Base verificada:** `origin/main` al 2026-10-22. Fuentes: `senku/legacy/juego.html` (v0.5.9), `senku/README.md`, `AGENTS.md`, `senku/v2/AGENTS.md`, `docs/shared/TOOLS.md`, plan de la PR #751 y el documento de diseño de Drive.

## 1. Qué existe hoy (hechos verificados)

- Legacy es **un solo archivo** de 342 líneas (`senku/legacy/juego.html`, unos 29 KB) con HTML, CSS y JavaScript juntos. `senku/juego.html` es solo una redirección.
- Estado en variables globales: `scene` (texto), `churus`, `secret`, `collected` (conjunto), `selectedSkin`. Cuatro escenas con rectángulos de colisión escritos a mano: `house`, `street`, `bus`, `taco`.
- Guardado en `localStorage` con lectura tolerante (si el navegador lo bloquea, el juego sigue sin guardar). Claves: `senku_churus`, `senku_skin`, `senku_secret`, `senku_collected`. No hay número de versión de esquema.
- **Ya existe un guardarropa y un traje de rata.** El traje «secret» se desbloquea al atrapar a la rata en la taquería (`senku_secret`). Existe también un traje «gold» que solo exige tener 300 Churus; no los gasta.
- No hay enemigos, salud, vidas, inventario, bonus cronometrados ni pruebas automáticas del juego.
- Las imágenes viven fuera de `senku/`, en `assets/senku/`, `assets/trajes/rata/`, `assets/rata/` y `assets/perro/`. `senku/v2/AGENTS.md` pide assets propios en `senku/v2/assets/` y prohíbe copiar legacy por defecto.
- Sin dependencias ni compilación: HTML y Canvas directos. Reglas de pruebas del repo: pruebas de los módulos afectados, no la suite completa por entrega.

**Consecuencia para el plan:** la «taquería» y el «traje de rata» del plan de la #751 se solapan con lo que ya hay. Hace falta que Matías diga si el traje nuevo es el mismo traje secreto o uno distinto (ver decisión D2).

## 2. Opciones de base (la elección es de Javier)

| | A. Nuevo en `senku/v2/` | B. Evolucionar Legacy | C. Copiar Legacy a v2 y refactorizar |
|---|---|---|---|
| Qué es | Módulos nuevos; Casa, Ciudad y Camión se recrean con las mismas reglas | Se edita `senku/legacy/juego.html` | Se copia el archivo a v2 y se parte en módulos |
| Riesgo para partidas y enlaces | Bajo: legacy no se toca | Alto: un archivo con estado global | Bajo para legacy |
| Cumple `AGENTS.md` | Sí | No: legacy es «versión anterior recuperable» | Solo con autorización expresa de copiar |
| Esfuerzo inicial | Medio-alto | Bajo al inicio, sube rápido | Medio |
| Extensibilidad (países, otro estilo gráfico) | Alta | Baja | Media-alta |

**Recomendación: A**, y reutilizar de Legacy solo lo que Javier autorice por escrito (dibujo de escenas y arte), nunca su estado global. Si prefieren C, requiere esa autorización explícita.

## 3. Arquitectura propuesta (para A)

Principios: sin frameworks ni compilación (módulos ES nativos), lógica pura separada del dibujo para poder probarla sin navegador, y datos separados del código para no inventar cifras.

- `core/store`: estado del jugador con **esquema versionado** (`version`), lectura tolerante a almacenamiento bloqueado, y guardado en clave nueva `senku2_save`. **Nunca escribe las claves `senku_*`.**
- `core/migracion`: lee las claves de legacy solo lectura y construye el primer guardado nuevo (Churus, traje secreto, equipado). Pruebas con partidas simuladas.
- `core/economia`: libro de movimientos de Churus (ganar, gastar) con identificador de recolectable para que no se pueda duplicar. Los precios salen de datos; hoy valen `null`.
- `data/trajes`, `data/objetos`, `data/enemigos`: catálogos en JSON. Todo valor pendiente queda `null` y la prueba falla si el juego intenta usarlo sin decidirse.
- `core/escenas`: registro de escenas definidas por datos (límites, plataformas, disparadores, puntos de entrada). Cada escena nueva es un archivo, no un cambio al motor.
- `core/entidades`: jugador y enemigos con una interfaz común. `core/combate`: daño y salud con una **política configurable** (HP y vidas se conectan a la regla que se decida).
- `core/objetos`: botiquín (consumible), garras (permanente), anclador y lanzador (temporales, con duración o carga declaradas).
- `core/entrada`: teclado y táctil detrás de una sola interfaz.
- `render`: resolución lógica fija y escala al tamaño de pantalla; los sprites se cargan por catálogo para poder cambiar de estilo gráfico sin tocar la lógica.
- `tests/`: `node --test`, sin dependencias, solo sobre lógica pura (store, migración, economía, combate, escenas).

## 4. Secuencia de PR pequeñas (cada una con pruebas y relevo)

1. Esqueleto v2 + `store` + `migracion` + pruebas (sin juego visible).
2. `economia` + catálogo de trajes + menú con Senku original y rata (precios `null`).
3. Motor de escenas + Casa, Ciudad y Camión recreadas, con paridad de comportamiento comprobada contra Legacy.
4. Vertical de taquería: rata, enemigos pequeños, daño, recepción del traje según D2.
5. Bonus de camión y camioneta con contabilidad de Churus.
6. Desierto, y después mecánicas (botiquín, garras, anclador, lanzador).
7. Jefe, solo con diseño aprobado. 8. QA en móvil, iPad y escritorio, con partidas de Legacy.

## 5. Decisiones que bloquean (necesito respuesta de Javier y Matías)

- **D1. Base:** A, B o C (sección 2).
- **D2. Traje de rata:** ¿es el traje «secreto» que ya existe en Legacy (se gana atrapando a la rata) o uno nuevo? ¿Se regala o se compra, y a qué precio?
- **D3. Qué pasa con el traje «gold» (300 Churus) de Legacy:** ¿se conserva, se retira o se renombra?
- **D4. Churus ya ganados en Legacy:** ¿se heredan al migrar?
- **D5. Salud y vidas.** Dos reglas para elegir: (a) 100 HP y 7 vidas; al llegar a 0 HP se pierde una vida y se reaparece con HP completo en el último punto seguro, con 1 HP por golpe pequeño; (b) 7 vidas sin barra: cada golpe quita una vida. Mi recomendación es (a), porque el daño de 1 punto de la #751 solo tiene sentido con barra.
- **D6. Bonus:** duración, Churus por bonus y ubicación de objetos. Sin esto no se balancea.
- **D7. Jefe:** nombre, patrones y condición de victoria. No se programa hasta aprobar.

## 6. Riesgos

- Recrear las tres escenas base puede cambiar el comportamiento sin querer. Mitigación: lista de comportamientos de Legacy comprobada una por una en la PR 3.
- Cargar arte de Legacy desde fuera de `senku/v2/assets/` rompe la regla de independencia. Mitigación: copiar solo lo autorizado.
- Saldos de Churus duplicados al migrar. Mitigación: migración de una sola vez, con marca de «migrado».
- No se ha probado nada en iPad ni teléfono reales; la QA de la PR 8 lo hará.

## 7. Qué no hace este documento

No cambia código, no toca Legacy, no decide base ni precios, no activa a ningún agente. Es insumo para que Javier y Matías respondan D1–D7.
