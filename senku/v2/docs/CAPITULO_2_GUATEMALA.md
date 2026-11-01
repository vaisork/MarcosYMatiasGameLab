# Capítulo 2 — Guatemala

**Estado:** cuatro escenas, arte base, lógica de Balam y recorrido de jefe integrados. Bonus jugable del tuk-tuk pendiente.
**Dirección:** continuar el viaje de Senku después del Gato Mecánico, con plataformas, exploración y combate aptos para jugar en familia.

## Recorrido

El botón **Continuar a Guatemala** aparece al vencer al Gato Mecánico. Lleva a Antigua y guarda la escena como progreso. No reinicia Churus, colección ni la victoria de México. Las partidas antiguas mantienen formato de guardado v1; si guardan `cima`, siguen abriendo México.

1. **Antigua y los volcanes:** tejados, arcos y balcones entre fachadas cálidas; volcanes al fondo. Introduce los saltos entre azoteas y al tucán ladrón.
2. **Mercado de Chichicastenango:** puestos, toldos, huacales y pasillos de mercado. Más plataformas bajas y coatíes que cruzan los puestos.
3. **Selva del Petén:** raíces y lianas entre claros. Combina coatíes con monos aulladores y saltos más largos; hay dos botiquines para preparar el tramo final.
4. **Tikal y el templo del jaguar:** ruinas escalonadas llevan a una plaza y a la arena de Balam. La entrada queda bloqueada durante el combate.

Cada tramo mide dos pantallas (2560 × 720), conecta por el borde derecho y conserva la cámara, la física, el zarpazo, el gancho y el desliz del capítulo 1. Cada pantalla usa un fondo pintado WebP de 1280 × 720; las plataformas siguen siendo visibles y el suelo queda integrado al fondo. Los Churus y botiquines reutilizan los objetos y reglas existentes. Cada escena tiene secretos alcanzables y su propio identificador para no interferir con coleccionables mexicanos.

## Enemigos y dificultad

| Enemigo | Golpes | Daño por contacto | Conducta |
| --- | ---: | ---: | --- |
| Tucán ladrón | 1 | 10 HP | Rápido; protege Churus en repisas y puestos. |
| Coatí | 2 | 15 HP | Patrulla los caminos y cruza bajo las plataformas. |
| Mono aullador | 3 | 20 HP | Más resistente; salta en la selva y en Tikal. |

Se conserva la escala actualizada de México: ratón negro de 1 golpe/10 HP, ratón café de 2/15 y hámster de 3/20. Senku mantiene 100 HP; botiquines curan hasta 25 HP. La presión aumenta por mezcla y colocación, no por daño superior al contrato existente. Los enemigos se pueden vencer con zarpazo o pisotón, igual que los del capítulo 1.

## Jefe final: Balam, guardián de Tikal

Jaguar de piedra y jade, guardián de la plaza. No es un villano ni un objeto que se roba: despierta cuando las vibraciones del Gato Mecánico alcanzan las ruinas y prueba la agilidad de Senku. La victoria lo devuelve a su descanso y permite cerrar el capítulo.

- **Fase 1 — Vigilia (100–66 %):** carrera baja con aviso visual; Senku salta o usa desliz para pasar.
- **Fase 2 — Eco (65–31 %):** salto pesado que lanza dos ondas por el suelo; hay que medir el salto y castigar al aterrizar.
- **Fase 3 — Lluvia de jade (30–0 %):** fragmentos telegrafiados desde arriba y carreras más frecuentes; el jugador alterna salto, desliz y zarpazo durante las ventanas de recuperación.
- Recibe daño por zarpazo y pisotón. Cada movimiento anuncia su zona y momento; el contacto causa 2 HP, la carrera 15 y las ondas/jade 10. El bot de recorrido lo vence con 100 HP antes de 45 s.

## Bonus y cierre

**Tuk-tuk de Antigua (pendiente):** recorrido de 30 segundos por calles y adoquines. Senku recoge hasta 30 Churus y esquiva cajas, puestos y baches; tiene tres corazones y conserva lo recogido si se queda sin ellos. El bonus reutilizará la economía y el patrón de los bonus de vehículos del capítulo 1.

Al vencer a Balam, la plaza vuelve a estar tranquila y aparece un resumen de Churus, enemigos y secretos. Repetir el capítulo 1 seguirá disponible desde su control de reinicio. Tikal no se presenta como ruina vacía: habitantes, guías y conservación del sitio deben aparecer en textos y arte finales.

## Datos actuales y trabajo pendiente

- `src/data/escenas/guatemala.mjs` contiene las cuatro escenas, su conexión, plataformas, objetos y enemigos.
- `src/data/enemigos.mjs` añade los tres perfiles y conserva la regla de 1/2/3 golpes.
- Arte: ocho fondos por tramo, hojas transparentes de los tres enemigos, hoja de 12 poses de Balam, ilustración del tuk-tuk y fragmento de jade.
- `src/core/jefe_balam.mjs` define tres fases y ataques avisados; `src/render/balam.mjs` dibuja la hoja, ataques y barra. Zarpazo y pisotón registran la victoria y abren resumen con opción de repetir Guatemala.
- `src/audio/musica.mjs` asigna música a los cuatro tramos y reutiliza la pieza de jefe para Balam.
- Pendiente: bonus jugable del tuk-tuk y validación visual en navegador.
