# Encargo narrativo: El Bastión de las Aguas Antiguas

Primera mazmorra de Vintage Telnet 2. La mecánica ya está hecha y probada en esta rama.
Este encargo es **solo de narrativa y atmósfera**. Está pensado para hacerse en tres sesiones.

## El problema (palabras de Javier)

> No se siente la belleza, lo tétrico, lo lúgubre de los espacios. Quiero sentir los espacios
> en mi imaginación. Entendí cómo se resuelven los misterios y contra quién peleas, pero no se
> siente que estás en una mazmorra, la primera del juego. Tienes que sentir que entraste a un
> lugar especial y que, conforme caminas, vas recorriendo ese lugar.

Además, el dragón "solamente está": no tiene historia, nadie te pide entrar y el mundo no cambia al vencerlo.

## Qué hay hoy

- Salas: `content/regions/veyra.json`, ids `veyra_mazmorra_*`.
- Criaturas: `content/world.json` (`dragon_aguas_antiguas`, `cienfango`, `aguaculebra`, `mordesombra`, `quebrarrocas`).
- Perfil de combate del dragón: `server/mechanics.py` (`PROFILES['dragon_aguas_antiguas']`).
- Estados de cansancio del dragón: `server/engine.py` (busca `hp_s=`).
- Pruebas: `tests/test_mazmorra_dragon.py`.

Recorrido (salidas reales):

| # | id | Se entra desde | Monstruo |
|---|---|---|---|
| 1 | `veyra_mazmorra_umbral` | `veyra_acequia_exterior` | — |
| 2 | `veyra_mazmorra_cuencas` | umbral | Cienfango, nivel 5 |
| 3 | `veyra_mazmorra_caudal` | cuencas | Aguaculebra, nivel 6 |
| 4 | `veyra_mazmorra_cornisa` | cuencas | Mordesombra, nivel 7 |
| 5 | `veyra_mazmorra_mecanismo` | caudal o cornisa | — |
| 6 | `veyra_mazmorra_galeria_ecos` | mecanismo | Quebrarrocas, nivel 9 |
| 7 | `veyra_mazmorra_boveda_guardian` | galería | Dragón, nivel 10 |
| 8 | `veyra_mazmorra_recorridos_fin` | bóveda | — premio por clase |

Cada sala ya tiene estos campos: `description`, `brief`, `day`, `night`, `rain`, `clear`, `return`,
`examine`, `arrivals`, `signals`, `actions`. Ver `CONTENT_CONTRACT.md`. Los cambios por flag se hacen con
`states:[{requires_flags:[...], overrides:{description, day, night, examine, ...}}]`.

## Reglas que no se pueden romper

- **No cambiar mecánica.** No toques ids, flags, guardas (`requires_*`, `forbids_*`, `exit_requirements`),
  niveles, vida, daño, premios ni tests existentes. Solo texto y campos narrativos.
- **Canon** (`docs/CANON_VIGENTE.md`): no revelar quién construyó el Bastión ni el origen de la magia.
  Quitar la frase "las recompensas de los constructores del Bastión" del Sagrario.
- **Público: niños de ~9 años.** Inquietante, misterioso y hermoso; sin gore, sin crueldad, sin muerte cruda.
- **Estilo:** segunda persona, español de México, sensorial y concreto. Ritmo variado, con frases cortas en la tensión.
  Nada de frases genéricas ("un lugar misterioso"): siempre algo que se ve, se oye, se pisa o se huele.
- `arrivals` narra el **trayecto** (lo que cambia al caminar). `description` es la sala al mirar.
  `brief` es una línea para visitas siguientes. No repetir el mismo texto en los tres.

## Sesión 1: entrada, gancho y camino (salas 1 a 4)

1. **Gancho en Veyra.** En `veyra_acequia_exterior`, la acequia está seca: piedras blancas de sal y juncos muertos.
   Se oye un rumor bajo tierra, como una respiración. Un vecino existente de Veyra (por ejemplo `veyra_tov`
   o `veyra_seli`) lo menciona en un `topic` nuevo ("agua" o "acequia").
2. **Cruzar el umbral.** Al bajar, la luz del día queda atrás, el ruido del pueblo se apaga y el aire se enfría.
   Debe sentirse que cruzaste a otro lugar.
3. **Salas 1 a 4:** reescribir `arrivals`, `description`, `brief`, `examine`, `return` y el texto de `signals` y `actions`.
   - Cada sala se siente más honda y más antigua.
   - Belleza y lo lúgubre juntos: agua cristalina sobre piedra muerta, musgo que brilla débil, huesos viejos
     de animales, arañazos antiguos, ofrendas olvidadas, el eco de tu propia respiración.
   - Los monstruos están nerviosos: algo más grande vive abajo.
4. **Diario:** una línea `journal` por logro (abrir el umbral, ordenar el aliviadero, cruzar el caudal, subir la cornisa).
   Debe leerse como la crónica del descenso.

## Sesión 2: lo hondo y el dragón (salas 5 a 7)

1. **Salas 5 y 6:** el mismo tratamiento. El trinquete es enorme y se oye como un corazón de piedra.
   La galería es silenciosa y cada paso suena.
2. **El dragón se siente antes de verlo.** Pon señales crecientes desde la sala 2:
   - un rumor lejano como respiración;
   - escamas mudadas en el agua;
   - piedra tibia en un lugar frío;
   - arañazos en los sillares;
   - vapor que sale por las grietas;
   - el agua que tiembla al ritmo de algo enorme.
3. **Quién es el dragón.** Duerme sobre el manantial que alimentaba la acequia de Veyra.
   No es malvado: es antiguo, territorial e inquieto o herido desde hace mucho.
   Actualiza el `presagio` y el `habitat` en `world.json`.
4. **Primera visión en la Bóveda.** Entre 8 y 10 frases memorables: escala, escamas tornasoladas, vapor,
   el remolino, sus ojos.
5. **Combate con presencia.** Avisos visuales de sus 3 preparaciones en `mechanics.py` (solo los textos `tell` y `CREATURE_PROSE`): alas, el agua que se alza, el rugido que hace caer gotas del techo.
   Reescribe también los 4 estados de cansancio en `engine.py` (`hp_s`), sin cambiar los umbrales.

## Sesión 3: desenlace y mundo que cambia (sala 8 y Veyra)

1. **Al vencerlo** (flag `dragon_vencido`, `scope: world`) el dragón no muere de forma cruda.
   Se rinde, se hunde en el agua o se duerme. Algo hermoso.
2. **El agua vuelve.** Con `states` que piden `dragon_vencido`, cambian:
   - la Bóveda (el remolino corre limpio y el pedestal queda vacío o en calma);
   - el Sagrario (la luz, el agua y las arquetas);
   - `veyra_acequia_exterior` (el agua corre otra vez);
   - el vecino de la sesión 1 (un `topic` o `memory` nuevo: el pueblo lo celebra).
3. **El premio.** Pule los textos de `reclamar_premio_*`: Espada del Bastión, Vara de los Caudales,
   Daga de las Aguas Profundas, Arco de la Esclusa, joyas y piezas de dragón.
   Que se sienta como el premio más grande del juego.
4. **Repaso final.** Lee todo el recorrido de corrido (llegada, mirar, señales y diario) y corrige repeticiones.

## Pruebas (al final de cada sesión)

```
cd vintage-telnet-2
pip install -r requirements.txt
python -m unittest discover -s tests -q
git diff --check
```

Todos los tests deben pasar (1 omitido es normal). Si un script de `scripts/` modifica `review/`,
no se incluye en el commit.

## Entrega

Commits en esta misma rama, uno por sesión. Al final de cada sesión, deja en la PR un comentario con un
recorrido de muestra: el texto tal como lo leería el jugador en las salas trabajadas.
