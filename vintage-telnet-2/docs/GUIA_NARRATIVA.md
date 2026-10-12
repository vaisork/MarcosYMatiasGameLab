# Guía narrativa vigente — Vintage Telnet 2

Esta guía permite que Claude u otro escritor continúe sin depender de la conversación de Codex. Se trabaja en la implementación actual de Ubuntu y se publica en MatiasGameLab, carpeta `vintage-telnet-2`, al terminar una entrega revisada. Para decisiones previas y producción, consultar `CONTEXTO_CONTINUIDAD.md`. Para hechos del mundo, `CANON_VIGENTE.md` y las fuentes que enlaza.

## Experiencia que pidió Javier

El lector es un niño que intenta entender una historia y decidir qué hacer. Una conversación debe ayudarle a imaginar a una persona preocupada por algo concreto, no parecer una instrucción de servidor. Usar español claro y cercano, sin palabras rimbombantes. Una escena importante puede tener varios párrafos; un paso tranquilo puede necesitar una sola frase. No aumentar todo el texto por igual.

Los lugares ya tienen orientación y el combate ya tiene reglas. El objetivo de este bloque es dar motivos, voces, acciones físicas, anticipación y consecuencias que hagan deseable continuar leyendo. No introducir sistemas nuevos para justificar una frase bonita.

## Una petición comprensible

Contar quién pide ayuda, qué le ocurre y por qué no basta con resolverlo desde su puesto. Nombrar el destino y la persona o detalle que debe encontrarse. Explicar la tarea real y qué debe hacerse después. Separar la recompensa numérica del diálogo si el motor ya la presenta.

Ejemplo: Daro no necesita «una misión de forja». Le falta saber dónde cede el carro de Bren para comparar una abrazadera. El niño escucha una preocupación, va al cobertizo, pregunta por la rueda y vuelve con información. Daro conserva la fabricación a su cargo. La historia no afirma que el niño reparó el carro sólo por conversar.

## Voces y acciones

Los `topics` aparecen prefijados con el nombre del NPC. Escribirlos normalmente en primera persona. Las escenas de acciones van en tercera persona y pueden contener frases entre comillas. No escribir «Nela prueba la cuerda» como si Nela estuviera narrándose a sí misma en un tema de conversación.

Una criatura no habla como una persona ni expone reglas. Su movimiento cuenta algo: el Espinajo corre bajo los tallos, vuelve a asomar y protege el mismo espacio. Cubrirse no significa que haya desaparecido de las acciones. Los avisos de animales mayores permiten apartarse antes del contacto; la introducción de pelea sólo ocurre cuando empieza el combate.

Los adversarios humanos necesitan contexto. El salteador genérico exige equipaje; Seran reclama el transporte de cajas y retiene la polea del taller. No usar la misma frase para convertir ambos conflictos en uno. Tampoco tratar un enfrentamiento terminado como una muerte obligatoria.

## Elegir y regresar

Antes de escribir un resultado, leer sus flags, objetos consumidos/entregados, ubicación y presencia. Preparar perchas no termina el toldo. Proponer una taza no la fabrica. Entregar un aviso no hace llegar la carga. Recuperar una polea no salda una cuenta. Una escena compartida no atribuye la ayuda a cada visitante.

Después de terminar una tarea, revisar conversación, memoria, descripción, examen, diario y resumen del encargo. Un solo mensaje viejo puede volver a pedir una ayuda resuelta. Conservar los regresos como parte de la historia: las personas y los objetos deben recordar cambios observables sin repetir una explicación en cada tema.

## Formato para colaborar

Entregar cada propuesta con archivo, tabla, ID, campo, condiciones de aparición, texto y motivo. Indicar aparte lo que necesita código y lo que ya encaja en el contrato. Los JSON principales son la autoridad de IDs; nunca inventar una salida, precio o premio porque quede bien en el diálogo.

Claude entrega en `docs/colaboracion/claude-narrativa/`; Codex integra y prueba. Otro colaborador no edita los mismos archivos simultáneamente. Consultar la entrega real antes de integrar; no asumir que un informe escrito equivale a cambios aplicados.

## Cuatro lecturas de revisión

1. Petición: ¿entiendo a quién ayudo, por qué, dónde y cómo?
2. Desarrollo: ¿lo que veo y hago puede respaldar lo que contaré?
3. Alternativa y regreso: ¿la decisión que elegí se conserva? ¿dejó de pedirse lo ya terminado?
4. Ruta independiente: leer escenas seguidas y buscar aburrimiento, repeticiones y contradicciones no anunciadas.

Comparar antes y después; registrar errores corregidos, evidencias y límites. Las pruebas automáticas no prueban comprensión o diversión infantil. Las frases no deben transformarse en sinónimos de una plantilla: cambiar situaciones, interlocutores, ritmo y consecuencias cuando el canon y el estado lo permitan.
