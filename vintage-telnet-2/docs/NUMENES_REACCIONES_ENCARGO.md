# Encargo narrativo: las reacciones de los Númenes

Encargo **solo de narrativa** para el historiador (ChatGPT). La mecánica ya existe. Una sesión.

## Qué quiere Javier

> Que se sienta la interacción con el compañero, como un Tamagotchi: que diga o haga movimientos
> cuando va contigo.

Los niños ya vinculan Númenes, pero sus reacciones actuales son frases de prueba escritas por un programador.

## Qué hay hoy

- `content/numenes.json`, modelos `a` a `h`. Cada uno tiene su anatomía canónica (`base`, `anomaly`)
  y un campo `reacciones` con listas de frases por situación:

| Situación | Cuándo sale |
|---|---|
| `llegar` | Al entrar a una sala |
| `combate_inicio` / `combate_fin` | Empieza o termina una pelea |
| `apoyo_combate` / `apoyo_combate_decaido` | Usas su ayuda en pelea (contento / decaído) |
| `hablar` | Hablas con alguien |
| `lluvia_noche` | Llueve o es de noche |
| `descansar` | Descansas |
| `comer` | Le das un Bocado de Númen |
| `caricia` | Lo acaricias |
| `saludo_regreso` | Vuelves a jugar tras horas sin entrar |
| `hambre` / `decaido` | Lleva más de 8 h / 24 h sin comer |

- `{name}` se reemplaza por el nombre que le dio el jugador. Debe aparecer en cada frase.
- El servidor elige una frase al azar sin repetir la anterior.

## Reglas que no se pueden romper

- Reglas de Númenes (`docs/NUMENES_REGLAS_RECUPERADAS_VT2.md`): son animales, no hablan con palabras,
  no suben de nivel, no mueren. Nunca nombrar al modelo con nombre propio; sólo `{name}`.
- Anatomía exacta de cada modelo: cuatro orejas (a, c), ojos sin fondo (b), bigotes de luz fría (d),
  dos sombras (e), aire tibio que ondula sobre el lomo (f), dos colas (g), pasos sin sonido (h).
  Cada frase debe usar algo propio de ese modelo, no servir para cualquier animal.
- `hambre` y `decaido`: tristes pero tiernos, nunca dolorosos. Que den ganas de cuidarlo, no culpa.
- Público: niños de ~9 años. Español de México, segunda persona, frases de 1 a 2 líneas.
  Siempre un **movimiento físico** visible: orejas, cola, salto, se acurruca, te empuja la mano.

## Qué entregar

- Reescribir sólo el campo `reacciones` de los 8 modelos en `content/numenes.json`.
- **5 frases** por situación (hoy hay 2 o 3). Mismas claves; no agregar ni quitar situaciones.
- No tocar ningún otro campo ni archivo.

## Aceptación

- JSON válido; las 13 claves por modelo siguen presentes; cada frase contiene `{name}`.
- Pruebas: `~/proyectos/.venv-vt2/bin/python -m unittest discover -s tests -q` desde `vintage-telnet-2`.
- Entregar como PR a `main` en `vaisork/MatiasGameLab`.
