# Guerra de Clanes — documento de diseño

Versión 0.1 · 14/11/2026 · diseño original para estrategia en tiempo real táctil, 8–12 años. Valores de prototipo, no balance final. Mundo, nombres, criaturas, unidades, escenarios y música propios; sin referencias o recursos de otras franquicias.

## 1. Premisa y pilares

En el archipiélago de Nimbora, islas pequeñas flotan gracias a corrientes de viento y agua luminosa. Tres comunidades cuidan sus hogares y compiten por las semillas de luz que mantienen unidas las islas. La campaña trata de cooperación y acuerdos: ninguna comunidad es malvada por naturaleza. No hay sangre, heridas ni cuerpos; una unidad vencida se convierte en nube de estrellas y regresa a casa.

1. **Lectura clara:** siluetas, colores, iconos y frases cortas distinguen aliados, rivales, órdenes y peligro.
2. **Decisiones con respuesta rápida:** reunir, construir, explorar, defender y atacar se explican en menos de un minuto.
3. **Asimetría amable:** cada clan resuelve problemas de modo distinto y tiene una debilidad que se puede contrarrestar.
4. **Juego justo:** el mapa comunica recursos y rutas; la IA no obtiene recursos extra en niveles altos.
5. **Seguridad infantil:** sin chat abierto, compra aleatoria, castigo por perder o venta de datos. Sesión de campaña autoguardada entre misiones.

## 2. Ciclo de una partida

Explorar el mapa → enviar trabajadores a recolectar Brote y Prisma → colocar edificios y ampliar población → escoger rama tecnológica → producir una composición de unidades → defender puntos clave y completar el objetivo. En escaramuza gana quien cumple el objetivo de mapa o construye el Faro de Concordia; destruir el centro rival es solo una de varias condiciones.

## 3. Clanes

### Guardianes del Dosel — crecimiento y terreno vivo

**Identidad:** jardines suspendidos, madera clara, hojas grandes y semillas como lámparas. Paleta verde salvia, coral suave y oro. Figuras redondas, capas de pétalos y movimientos elásticos; melodía de flautas de caña y percusión de semillas.

**Juego:** se expande con rapidez, se recupera cerca de sus huertos y controla rutas con raíces. Defensa fija moderada y pocas opciones de daño de largo alcance. La fuerza cae si se separa de sus refugios.

**Unidades:** Semillero recolecta y construye; Zarzapaso explora y hostiga; Lanzafruto lanza proyectiles arqueados; Musgaguarda protege el frente; Planeador de Copa cruza terreno y revela; Nudoguardia ralentiza un grupo; Polinizadora cura poco a poco; Trepacopas daña edificios. **Héroes:** Brizna crea una zona de crecimiento que cura aliados; Olmo deja una barrera de raíces que bloquea pasos breves.

**Edificios (stats completos en `balance.csv`):** Nido de Raíces (centro y límite inicial), Huerto de Bruma (recolección cercana), Arco de Savia (torreta), Taller de Brotes (producción), Mirador Florido (visión), Refugio de Polen (curación y mejora), Corazón de Copa (tecnología), Puente Trenzado (cruce de huecos pequeños).

**Árbol:** Taller → (i) senda *Copa Veloz*: Planeador, visión y movimiento; (ii) senda *Raíz Serena*: Musgaguarda, curación y defensa. Corazón de Copa abre ambas rutas; elegir una mejora final excluye la otra en esa partida.

### Compañía de la Forja Errante — precisión y logística

**Identidad:** talleres sobre plataformas, lona remendada, ruedas y cometas de medición. Paleta azul petróleo, cobre y crema. Siluetas geométricas articuladas; señales sonoras de metal templado, melodía de xilófono y acordeón ligero.

**Juego:** líneas de tiro precisas, buena construcción modular y pasarelas para abrir rutas. Produce más despacio y necesita tiempo para reubicar sus máquinas. Sus unidades de apoyo marcan objetivos y cargan bobinas; no son robots autónomos ni explosivos.

**Unidades:** Remachador recolecta, construye y repara; Rodacobre carga a corta distancia; Bumerán de Chispa rebota entre blancos; Escudo de Teja avanza protegiendo aliados; Saltanubes hostiga y salta un obstáculo; Tizafaro alcanza edificios a distancia; Cargabobina recarga habilidades próximas; Andamio Andante es lento y puede desplegarse como cañón. **Héroes:** Mica realiza una embestida que empuja sin daño extra; Tono marca una zona y mejora temporalmente el alcance aliado.

**Edificios:** Patio de Remaches (centro), Colector Eólico (recolección), Campana de Alerta (defensa), Galpón de Ruedas (producción), Cometa de Señales (visión), Banco de Bobinas (apoyo), Prensa de Cielo (tecnología), Pasarela Plegable (cruce y repliegue).

**Árbol:** Galpón → (i) *Línea Ligera*: Bumerán, Saltanubes y recarga veloz; (ii) *Bastidor Pesado*: Escudo, Tizafaro y Andamio. Prensa abre ambas rutas; las dos mejoras finales son excluyentes.

### Vecindad de la Marea Clara — movilidad y control

**Identidad:** plataformas de concha, pozas transparentes, algas que brillan y faroles de burbuja. Paleta turquesa, violeta y arena. Siluetas ondulantes y ojos expresivos; agua, silbatos de caracola y cuerdas pulsadas.

**Juego:** cambia entre rutas secas e inundadas por pulsos de marea, reposiciona grupos y ralentiza rivales. Unidades rápidas pero frágiles y menor daño sostenido a edificios. La marea se anuncia con 20 segundos de anticipación; nunca oculta terreno ni atrapa una unidad sin salida.

**Unidades:** Cultivacoral recolecta y crea pasos; Remolino ocupa huecos y retrocede tras atacar; Arpón de Espuma aplica una marca visible; Concha Firme protege a aliados cercanos; Salpicavela vuela y cruza agua; Medusario proyecta lentitud en un círculo; Farolillo cura y revela; Caracol de Marea golpea edificios y abre compuertas. **Héroes:** Ondina crea una corriente que acelera aliados; Calder ancla un área para impedir empujones y reduce daño recibido.

**Edificios:** Plaza de la Laguna (centro), Vivero de Marea (recolección), Atalaya de Concha (defensa), Taller de Boyas (producción), Faro de Algas (visión), Casa de Burbujas (curación), Pozo de Bajamar (tecnología), Pontones de Concha (cruce y flotación).

**Árbol:** Taller → (i) *Marea Alta*: vuelo, movilidad y cura; (ii) *Marea Baja*: defensa, control y asedio. Pozo abre ambas; elegir una mejora final excluye la otra.

## 4. Estadísticas, economía y reglas comunes

Los valores iniciales, costos, tiempos, alcance y velocidad están en `balance.csv`. HP y daño son puntos; alcance y velocidad se miden en celdas. Brote y Prisma son los únicos recursos.

- **Brote:** material orgánico recolectado en huertos/plantas neutrales; paga la mayoría de unidades y edificios.
- **Prisma:** fragmentos de luz en nodos expuestos; paga tecnología, héroes y habilidades fuertes. Los nodos se agotan y vuelven a crecer tras 90 segundos.
- Cada trabajador lleva hasta 10 Brotes o 5 Prismas y tarda 1.8 s por trayecto corto. Los depósitos muestran reservas sin necesidad de seleccionarlos.
- Población inicial 12, tope 100 por jugador. Unidades comunes ocupan 1–3; héroes ocupan 4. Edificios de apoyo dan +8 o +12 según clan. Ningún edificio supera el tope.
- Al alcanzar el límite, la interfaz señala cuánto falta y propone liberar espacio; nunca elimina unidades automáticamente. Producción en cola de hasta 5 con costo descontado al iniciar.
- Un trabajador construye a velocidad base de su edificio; hasta tres ayudan con rendimiento decreciente (100%, 65%, 40%). Ataques interrumpen solo al trabajador alcanzado; el edificio conserva progreso.
- Daño por golpe; armadura plana de 0–8 resta daño mínimo 1. Armas de área se reducen a 50% fuera del centro. La interfaz muestra tipo de daño y blanco válido antes de confirmar.
- Destrucción sin sangre: nube de estrellas en 0.65 s, audio suave y objetos recuperables solo en misiones didácticas. Ningún cuerpo persiste.

**Referencia de balance:** trabajador 120–135 HP; explorador 135–155; distancia 95–115; defensa 270–330; asedio 180–220; héroe 460–540. Daño de unidad común 5–48; héroe 24–34. Construcción 16–40 s. Ajustes se validan en espejo de 5, 10 y 15 minutos y con ambos lados del mapa.

## 5. Habilidades y mejoras

Cada unidad especial tiene una habilidad activa visible con indicador circular, costo cero o Prisma indicado y recarga explícita. Sin objetivos ocultos ni selección de píxel: área mínima 1 celda; botón cancelar devuelve a selección. Héroes tienen dos habilidades y no mueren permanentemente; al derrotarse vuelven al centro tras 35 s, con espera aumentada 15 s por cada retorno (máximo 80 s).

Mejoras comunes, una vez cada una: **Herramientas I/II** (+10% recolección; 45/90 s, 80/150 Brote y 0/35 Prisma); **Guardia I/II** (+1/+2 armadura; 45/90 s, 70/130 Brote, 15/35 Prisma); **Vigor I/II** (+8% daño; 50/100 s, 85/160 Brote, 20/50 Prisma). Cada clan agrega dos mejoras propias en el árbol. Solo una mejora de nivel superior por rama evita sumas explosivas.

La tabla CSV es un punto de partida para prototipo. Los valores se ajustarán después de telemetría de partidas internas, no con ventaja artificial de IA.

## 6. Niebla y lectura del mapa

Tres estados: conocido visible, explorado oscurecido y desconocido. Visión circular con radio en celdas; el terreno permanece en mapa mientras las unidades rivales desaparecen al perder visión. Las torres y héroes tienen radios particulares. Un icono de ojo indica información compartida con aliados controlados por IA; no existe multijugador en fase 1.

Cada mapa señala con color, forma e icono los nodos de recursos, pasos estrechos, alturas, zonas de objetivo y rutas de marea. El terreno de niebla no revela unidades, animaciones ni actividad sonora precisa.

## 7. Controles táctiles y teclado

### Táctil

- Tap sobre unidad: selecciona; tap en aliado añade a la selección. Tap sobre rival con unidad propia seleccionada da orden de ataque. Tap sobre nodo con trabajador seleccionado recolecta.
- Arrastrar sobre terreno inicia una caja tras 8 px; al soltar incluye unidades completamente o mayormente dentro del rectángulo. El borde muestra cuántas se seleccionaron y tipo principal. Mantener icono de grupo añade selección a la caja.
- Arrastrar desde unidad seleccionada hasta terreno: emitir mover/atacar según botón de orden elegido; el gesto nunca reemplaza un panel visible sin confirmación.
- Botones contextuales: **Mover**, **Atacar**, **Recolectar**, **Construir**, **Habilidad**, **Parar**, **Mantener posición**. Un toque al botón arma la orden y un toque al destino la ejecuta; cancelar/volver siempre está en el mismo sitio.
- Cuatro grupos numéricos persistentes: tocar llama al grupo; doble toque centra cámara; mantener y arrastrar una unidad asigna al grupo. Un grupo se distingue por forma de insignia además de color.
- Cámara: arrastrar dos dedos mueve cámara si no empieza sobre una unidad; pellizcar cambia zoom anclado al centro del gesto. Botón Inicio recentra. Bordes del mapa frenan cámara con suavidad.
- Controles mínimos 48×48 CSS px, confirmación visual/sonora, vibración opcional, sensibilidad ajustable, inversión de mano, reducir movimiento y no depender del doble toque para una función crítica.

### PC

Ratón: clic y arrastre para caja, rueda para zoom, botón derecho emitir orden contextual. Teclado: 1–4 grupos; A atacar-mover; M mover; S parar; H mantener; Q cancelar; Tab recorrer subgrupo. Todas las órdenes también existen como botones para teclado accesible.

## 8. IA de escaramuza

- **Paseo:** una base pequeña, defensa cercana y ataques anunciados cada 5–6 min. Sugiere controles y no castiga por perder.
- **Aprendiz:** reúne recursos y expande una vez; ataques cortos y composiciones simples. Nunca oculta una regla ni recibe economía adicional.
- **Estratega:** explora, contrarresta la unidad dominante con tecnología visible y cambia ruta cuando encuentra defensa.
- **Capitana:** objetivos priorizados, exploración frecuente, retirada cuando pierde 35% de una fuerza y coordinación de dos grupos. Mejor decisión y velocidad de respuesta, no bonificaciones de recursos, vida o visión.

Todos los niveles obedecen mismos tiempos de producción, visibilidad, población, costos y límites de órdenes. Controles para pausar, acelerar solo práctica sin récord, reiniciar y elegir duración. Dificultad y ayudas configurables por separado.

## 9. Campaña (12 misiones)

Historia común: una corriente nueva altera las islas. Nara, aprendiz de mapas, ayuda a las tres comunidades a investigar por qué cambió. Cada capítulo enseña una sola regla nueva; derrotas ofrecen reintento con sugerencia. Misiones 1–4 Dosel, 5–8 Forja, 9–12 Marea; personajes de los otros clanes aparecen antes de ser elegibles en escaramuza.

| # | Título | Clan y objetivo | Sinopsis / aprendizaje |
|---:|---|---|---|
| 1 | Semillas al alba | Dosel; reunir 80 Brotes | Nara despierta un huerto. Selección, movimiento y recolección sin rival. |
| 2 | Un puente para todos | Dosel; construir Puente Trenzado y llevar tres trabajadores al claro | Una isla se separa; se enseña construcción y rutas seguras. |
| 3 | El sendero cubierto | Dosel; revelar dos miradores | Aprender estados de niebla y proteger a Planeadores. |
| 4 | La copa tranquila | Dosel; defender el huerto durante tres pulsos | La raíz vieja se desborda; heroína Brizna enseña habilidad y retirada. |
| 5 | Ruedas que escuchan | Forja; reparar y activar dos colectores | Tono comparte una brújula; construcción modular y reparación. |
| 6 | El eco de la campana | Forja; detener tres grupos pequeños | La campana da aviso justo; formar grupos y usar Escudo. |
| 7 | Pasarela de ida y vuelta | Forja; llevar Andamio y trabajadores a un puesto | Se muestra despliegue de asedio y rutas plegables. |
| 8 | El mapa incompleto | Forja; encontrar cuatro balizas y proteger el centro | Mica señala un camino oculto; exploración y contrajuego sin sorpresa letal. |
| 9 | Agua entre islas | Marea; activar tres boyas durante marea alta | Ondina explica fases con cuenta atrás, sin trampas de terreno. |
| 10 | Una corriente amable | Marea; escoltar trabajadores y rescatar Farolillos | Se enseña apoyo y desplazamiento por agua. |
| 11 | El faro compartido | Marea; capturar y sostener tres puntos | Los clanes acuerdan no atacar; control de mapa y población. |
| 12 | Concordia de Nimbora | Marea; construir Faro de Concordia y sostenerlo 90 s | Los tres clanes estabilizan la corriente. Final según objetivos opcionales, sin eliminar una cultura rival. |

Cada misión tiene versión accesible con tiempo ampliado, indicadores de objetivo y pausa táctica. Oro/plata/estrellas son medallas sin cajas ni azar; completarlas no bloquea la historia.

## 10. Modos y progresión

- **Campaña:** 12 escenarios, pausa, autoguardado al completar, narración opcional con subtítulos.
- **Escaramuza:** un mapa, jugador contra IA, 3 duraciones y cuatro perfiles IA. Selector de clan rival y semilla de mapa.
- **Desafíos:** retos cortos con límite de unidades/tiempo y solución alternativa validada; rotación local, sin ranking global en fase 1.
- **Práctica:** mapa libre, tutoriales reabribles, pausa y velocidad configurable.
- **Fase posterior:** multijugador solo con diseño de seguridad, privacidad, autoridad de servidor y decisión de producto aparte; no forma parte del prototipo.

Progresión desbloquea mapas, colores, estandartes, gestos de victoria y pistas musicales. Nada modifica daño o economía. Los perfiles locales guardan ajustes, misiones y cosméticos; exportación de progreso se define antes de publicar PWA.

## 11. Audio, música y texto

Tres temas originales, uno por clan, con melodía principal de 60–90 s y capas adaptativas: exploración, tensión y objetivo. Sin melodías reconocibles de otras obras. Efectos suaves y cortos para selección, confirmación, error, recurso, ataque recibido y nueva misión; derrota usa brillo ascendente y tintineo bajo, sin grito o explosión.

Mezclas independientes de música, voz y efectos; subtítulos siempre disponibles, control de volumen en primer nivel y opción sin música. Avisos críticos tienen texto/icono/color, nunca solo sonido. Texto de interfaz en frases directas, vocabulario concreto, español inicial y preparación para traducción. Voz completa es opcional para no forzar lectura rápida.

## 12. Accesibilidad, privacidad y publicación

Sin chat libre, perfil público, anuncios, cajas, compras aleatorias ni analítica personal en esta fase. Solicitar consentimiento explícito antes de telemetría futura. Colectar resultados agregados y mínimos solo con autorización parental y revisión de producto. No pedir nombre real ni ubicación. Partidas locales.

Pruebas con niños requieren autorización del tutor y sesión moderada; no guardar audio/video de participantes. Revisar lectura con daltonismo, tamaño en pantalla pequeña, lenguaje de ayuda, sensibilidad táctil y señalización de derrota. La publicación en GitHub Pages/PWA requiere revisión humana del arte, música, texto, privacidad y compatibilidad móvil.

## 13. Supuestos y decisiones a validar con la arquitecta

- Roster v0.1: 8 unidades comunes + 2 héroes por clan; edificios 8 por clan. Confirmar si héroes cuentan dentro del total de 10–12.
- Balance CSV es base numérica; validar economía de Brote/Prisma, mapa de 24×24 y tope 100 con pruebas de partida antes de fijar producción.
- Confirmar si el objetivo de victoria alternativo Faro de Concordia pertenece a todas las escaramuzas o solo a campaña.
- Confirmar nombres de los tres clanes, tono de Nara y reparto final de misiones con dirección creativa de Javier/Matías.
- El alcance de fase 1 no incluye arte conceptual generado ni modelo final; requiere dirección creativa y pipeline de assets en una iteración propia.
