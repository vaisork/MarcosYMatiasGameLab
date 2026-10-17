# Vaisgard RPG — contrato de arquitectura (piloto)

Decisión de producto: issue #731 (16 de octubre de 2026). Vaisgard RPG es **un segundo cliente del mismo Vintage Telnet 2**: un mundo, un motor, una base de datos, dos interfaces. Esta autorización reciente prevalece sobre la nota anterior de `AGENTS.md` que no autorizaba animaciones; se limita al cliente 2D descrito aquí.

## Principio

- Decisión de Javier (16 de octubre de 2026): Vintage Telnet y Vaisgard RPG son **dos juegos con entrada propia desde el portal**. NO hay botón ni enlace para cambiar de uno a otro en ningún cliente. Comparten servidor, cuenta y personaje (misma partida y progresión persistente), pero ninguno obliga a usar la interfaz del otro. Cada cliente cuenta con sus propias pantallas de inicio de sesión, registro, selección y creación de personaje.
- El servidor Python + SQLite de VT2 sigue siendo la única autoridad. No hay servidor paralelo, ni copia de reglas en JavaScript, ni estado de juego en el cliente.
- El cliente RPG lee `GET /api/state` y envía `POST /api/action` exactamente igual que el MUD: CSRF en `X-CSRF-Token`, `request_id` único por intención, mismo personaje seleccionado en la misma sesión (misma cookie, mismo origen).
- El RPG sólo envía **objetos tomados de `snapshot.actions`** (`id`, `target`, `confirmed`) o `{text}`. Nunca construye intenciones que el servidor no ofreció.
- Lo único local es la posición del avatar dentro de la sala, las animaciones y la cámara. Cambiar de sala, hablar, observar, luchar, comprar, aceptar encargos y recibir recompensas pasan por el servidor.
- Combate: se conservan las rondas del motor (~4 s, `settle_combat`). La animación representa `snapshot.character.combat` (`round`, `next_round`, `hp`, `hp_max`, `prepared_action`) y la narrativa de eventos; no calcula daño. El combate en tiempo real queda fuera hasta nueva decisión.

## Rutas

| Ruta | Contenido |
|---|---|
| `/rpg` | `client-rpg/index.html` |
| `/client-rpg/rpg.js`, `/client-rpg/rpg.css` | cliente |
| `/client-rpg/scenes/<room_id>.json` | escenario de una sala |
| `/client-rpg/sprites/<nombre>.png\|webp` | sprites y tiles |

`server/app.py` sólo sirve esos archivos (lista blanca por expresión regular). CSP vigente: `script-src 'self'`, `img-src 'self' blob:`; no hay CDN. Si se usa una biblioteca (p. ej. Phaser), se vendoriza en `client-rpg/` y se añade a la lista blanca con su licencia; el piloto prefiere Canvas 2D sin dependencias por el rendimiento en Raspberry y móvil.

## Escenario (`client-rpg/scenes/<room_id>.json`)

Datos de presentación, no canon. El nombre del archivo es el id real de la sala.

```json
{
  "room": "edran_acequia",
  "tile": 16,
  "size": [20, 15],
  "tileset": "edran",
  "layers": {"ground": ["...20 caracteres por fila..."], "solid": ["...", "..."]},
  "spawn": {"default": [10, 7], "oeste": [1, 7], "norte": [10, 1], "sur": [10, 13]},
  "exits": [{"direction": "norte", "rect": [9, 0, 2, 1]}],
  "npcs": [{"id": "edran_lina", "at": [6, 5]}],
  "creatures": [{"id": "espinajo_rastrojo", "at": [14, 4]}]
}
```

- `exits[].direction` debe existir en las salidas reales de la sala. Al pisar el rectángulo el cliente envía la acción `{"id":"mover","target":<dirección>}` presente en `snapshot.actions`; si falta o viene con `disabled`, no la envía y muestra su `reason`.
- `spawn[<dirección>]` es dónde aparece el avatar al llegar desde esa salida; `default` al cargar.
- `npcs` y `creatures` sólo posicionan ids reales. Se dibujan **sólo si el snapshot los incluye** (`room.npcs`, señales/combate); el escenario nunca revela presencia que el servidor no dio.
- Salas sin escenario: el cliente genera un escenario genérico a partir del snapshot (puertas en los bordes según la dirección, NPC presentes), para que nunca quede atrapado. Así se puede recorrer el mundo entero, aunque con arte pendiente.

## Primera demostración (fase B)

Tres salas reales conectadas de Edran:

| Sala | Tipo | Contenido real | Salidas usadas |
|---|---|---|---|
| `edran_salida_huertos` (Salida de las Cercas Bajas) | camino | NPC `edran_lina` | `este` → acequia |
| `edran_acequia` (Curva de la Acequia) | hito | — | `oeste`, `norte` |
| `edran_surcos` (Campo de surcos) | zona salvaje | `espinajo_rastrojo` (nivel 2, ataque preparado) | `sur` |

No existe en el canon una cadena plaza→camino→peligro con NPC y criatura de combate a dos pasos; esta es la más cercana. Las demás salidas de esas salas usan el escenario genérico.

## Paridad (fase C)

Prueba automática con datos aislados (`tests/test_rpg_parity.py`): mismo usuario y personaje alterna entre ambos clientes mediante la API; comparar `snapshot.character` (ubicación, XP, nivel, sellos, inventario, equipo), `map`, `bestiary`, `quests`, `numenes` y secretos; repetir un `request_id` no duplica nada; combate compartido, derrota y regreso al hogar. Revisión manual en navegador móvil y escritorio.

## Portal (fase D)

Tarjeta «Vaisgard RPG» en `index.html` raíz jugable con botón «Jugar» hacia la ruta `/rpg` real (mismo patrón que la tarjeta de Vintage Telnet hacia `/`). Ambas experiencias tienen entrada independiente desde el portal. Ningún cliente ofrece enlaces ni botones de cambio de modo; la sesión y la partida son compartidas en el servidor.

## Fuera de alcance del piloto

Combate en tiempo real, nuevas mecánicas, cambios de fórmulas o balance, 183 escenarios, despliegue en Raspberry, Senku y VT1.
