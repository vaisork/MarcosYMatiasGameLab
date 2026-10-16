# Encargo narrativo: Vaisork, el que todo lo ve

> **DIRECTRIZ CREATIVA POSTERIOR (2026-10-16, aprobada por el creador):** [Vaisork — identidad de alter ego y voz permanente](VAISORK_ALTER_EGO_PRINCIPIOS.md). Todo trabajo futuro sobre la personalidad, frases, encuentros, diálogos, rastros narrativos o representación de Vaisork debe leer ese documento, que expresa su identidad como alter ego del creador sin exponer su biografía. El presente encargo conserva su contexto histórico; la directriz posterior rige la voz del personaje. Entrega narrativa en [PR #719](https://github.com/vaisork/MatiasGameLab/pull/719).


Encargo **solo de narrativa** para ChatGPT. La mecánica de Vaisork ya existe (#716).
Después, Antigravity programa lo que este texto defina. Una sesión.

## Qué quiere Javier

> Vaisork existe físicamente en el juego. Es una especie de ente todopoderoso, yo mismo con canas.
> Cuando se lo enseñe a los niños en el DM, que haya una imagen y más de quién soy.

- Vaisork es el Dungeon Master dentro del mundo. Javier lo usa para dirigir y para jugar.
- Su jugador normal es otro (Vaison); no mezclarlos.
- Presencia: **por todo el mundo**, en las seis regiones, sin tener casa fija.

## Qué hay hoy

- Personaje "Vaisork": humano juramentado, nivel 100, atributos al máximo, no recibe daño.
  Lo crea `server/app.py` al entrar con el usuario `vaisork`. Flag del personaje: `vaisork`.
- Arte: `client/art/players/vaisork-anime-v1.webp` (retrato) y `vaisork-anime-cuerpo-completo-v1.webp`.
  Hombre de mediana edad, rostro joven, barba y sienes canosas.
- No hay lore, ficha del DM, menciones de vecinos ni rastros en el mundo.
- Comunidad de Veyra: **Vaisgard**. El parecido del nombre puede usarse como misterio, sin explicarlo.

## Reglas que no se pueden romper

- **Canon** (`docs/CANON_VIGENTE.md`): no revelar el origen de la magia ni quién construyó lo antiguo.
  Vaisork no lo explica aunque lo sepa. Puede callar, sonreír o cambiar de tema.
- **Público: niños de ~9 años.** Misterioso, cálido y un poco imponente. Nunca amenazante ni cruel.
- **Sin datos personales reales** de Javier: ni nombre real, ni ciudad, ni trabajo, ni familia.
- **No es dios ni villano.** Es un viajero muy antiguo que cuida que las historias sigan su curso.
  No resuelve los problemas de los jugadores: observa, deja pistas y a veces pregunta.
- Respetar el estilo de `docs/GUIA_NARRATIVA.md`: segunda persona, español de México, concreto y sensorial.

## Qué entregar

Un solo archivo nuevo, `content/vaisork.json`, con esta forma (solo texto; Antigravity lo conecta):

```json
{
  "ficha_dm": {
    "titulo": "una línea, cómo lo llaman en el mundo",
    "quien_es": "3 a 5 párrafos cortos para leer en voz alta a los niños",
    "como_se_ve": "1 párrafo, coherente con el arte",
    "lo_que_se_dice": ["5 a 8 rumores breves, uno por región como mínimo"],
    "lo_que_nunca_dice": ["3 a 5 preguntas que siempre esquiva, y cómo las esquiva"],
    "frases": ["6 a 10 frases suyas, cortas, para que Javier las use al jugar"]
  },
  "vecinos": {
    "<npc_id>": {"tema": "vaisork", "texto": "lo que ese vecino cuenta de él"}
  },
  "rastros": [
    {"room": "<room_id>", "examine_key": "palabra", "text": "algo que dejó o tocó al pasar"}
  ]
}
```

- `vecinos`: uno por región como mínimo (seis o más). Cada uno cuenta algo distinto y propio de su oficio.
  Usar ids reales de `content/regions/*.json` (por ejemplo `veyra_tov`, `edran_daro`, `hoshai_luma`,
  `korven_taren`, `lethra_mira`, `nhal_elin`). Nadie lo describe igual; unos dudan que exista.
- `rastros`: de 6 a 10, repartidos entre regiones, en salas reales. Huellas, un objeto acomodado,
  una marca en la piedra, un olor a tinta. Nunca un premio ni un objeto que se pueda tomar.
- Juntas, las piezas deben formar un pequeño misterio: quien lea todo intuye que es el mismo ser,
  que lleva mucho tiempo viajando y que recuerda cosas que nadie más recuerda.

## Aceptación

- `content/vaisork.json` es JSON válido y todos los `npc_id` y `room` existen.
- No toca ningún otro archivo ni cambia mecánica.
- Entregar como PR a `main` en `vaisork/MatiasGameLab`.
