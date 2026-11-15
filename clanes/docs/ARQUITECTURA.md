# Arquitectura técnica — Guerra de Clanes

Estado: propuesta de fase 1, 14/11/2026. La demo mide render y simulación local; no demuestra todavía rendimiento en teléfono real ni prepara conexión multijugador.

## Plataforma y módulos

- Cliente web estático dentro de `clanes/`, servido por HTTPS. Three.js como ES module fijado a una versión: CDN `three@0.180.0` para prototipos y alternativa vendorizada bajo `clanes/vendor/three/` para publicación offline/PWA. No mezclar ambas rutas en una misma build.
- La simulación no importa Three.js ni el DOM. Recibe órdenes, avanza a 30 ticks/s y emite estado de lectura para render. El render puede dibujar a 30–60 Hz según pantalla.
- ECS ligero por arreglos tipados: identificadores compactos y componentes contiguos para posición, vida, propietario, tipo, órdenes, enfriamientos y navegación. Sistemas separados: órdenes, economía, producción, movimiento, visión, combate, construcción y retirada.
- Semilla explícita y orden estable por ID para cualquier aleatoriedad. No leer reloj, `Math.random` ni estado del renderer desde la simulación. Guardar semilla, mapa, reglas y lista ordenada de órdenes para repetir una partida.
- Bucle fijo con acumulador y máximo de cuatro pasos de recuperación por frame. Si la pestaña pierde foco, pausar simulación local; no adelantar minutos al volver. El render interpola entre los dos estados de simulación.

## Terreno y navegación

- Mapas por celdas cuadradas en coordenadas de mundo X/Z; la cámara inclinada produce lectura isométrica. Cada celda registra coste, altura discreta, paso y visibilidad.
- Flow field por objetivo para grupos: Dijkstra inverso desde meta con coste de terreno; cada celda guarda distancia y dirección hacia una vecina de menor coste. Flujo compartido por objetivo y perfil de tamaño, no por unidad.
- Obstáculos dinámicos se actualizan por región y reconstruyen solo los campos afectados. Para metas cercanas, elegir el campo existente; limitar cantidad de destinos activos y consolidar órdenes de clic dentro de la misma región.
- El flujo da dirección global; una separación local corta evita que 200 agentes ocupen el mismo centro. Reglas estables por ID y radio limitado mantienen el costo acotado. Unidades pesadas usan perfil de paso más ancho.
- Prueba inicial usa BFS 4-direcciones y obstáculo estático. No se considera solución final de colisiones, puentes o mapas con varios niveles.

## Render 3D y presupuesto

- Reutilizar geometrías y materiales. `InstancedMesh` para cada combinación de malla/material animada; agrupar por clan, modelo y nivel de daño. Variar pose con matrices por instancia; animaciones sencillas en shader o pocos clips compartidos.
- Toon con `MeshToonMaterial` y rampa de cuatro tonos; contorno por extrusión de normales en back faces, solo en siluetas principales. No duplicar contorno en follaje pequeño ni cada accesorio.
- Cámara ortográfica inclinada, culling por frustum y sectores. LOD de tres niveles: modelo completo cerca, silueta compacta a media distancia, icono/sombra en lejos; unidades invisibles fuera de vista no actualizan animación secundaria.
- Iluminación horneada o hemisférica; una luz direccional, sin sombras dinámicas por unidad. Sombras de blobs en instancias y sombra de terreno ligera. Evitar postprocesado caro en móvil.
- Objetivo fase 1: 200 unidades visibles, 30 FPS sostenidos en Android de gama media de referencia, a resolución interna 0.8–1.0 y sin bajar de 24 FPS en escenas densas. Medir dispositivo, navegador, tamaño, temperatura, FPS mediano y percentil 1%; no presentar una captura de escritorio como dato móvil.
- Presupuesto inicial por frame a 30 FPS: render GPU ≤22 ms; actualización de simulación ≤8 ms para 200 actores; interfaz/audio ≤3 ms; margen restante para GC y sistema. Límite de draw calls objetivo ≤80, memoria GPU ≤180 MB en móvil. Revalidar con arte final.
- Adaptación: bajar primero resolución interna y LOD; después follaje y partículas; conservar tamaño de texto, contraste y feedback de selección.

## Cámara táctil e interfaz

- Un dedo arrastra terreno para paneo. Pellizco de dos dedos acerca/aleja con límites, con el punto medio como ancla visual. Rueda y clic arrastrado en PC.
- Toque breve selecciona unidad o edificio; arrastre desde terreno dibuja rectángulo de selección. Arrastre desde unidad comienza selección por caja al superar 8 px para distinguirlo del toque. Clic/tap vacío limpia selección; toque sobre aliado añade con modificador de selección activa.
- Panel contextual grande y accesible: mover, recolectar, construir, atacar, habilidad y cancelar. Órdenes con icono, texto y respuesta inmediata. Mantener pulsado muestra descripción; no depender del hover.
- Grupos 1–4 en teclado; en móvil, cuatro botones persistentes y doble toque centra cámara. Atajos de PC: A atacar-mover, M mover, S parar, H mantener, Q cancelar; teclas numéricas eligen grupos y Tab recorre subgrupo.
- Recomendación para unidades seleccionadas: anillo de color por dueño, contorno de selección y tarjeta con retrato, vida, nombre y habilidad. Opciones para mano izquierda y vibración breve; vibración desactivable.

## Streaming de arte y glTF

1. Bloquear silueta, escala, paleta y vista de lectura en concepto aprobado.
2. Modelar y preparar malla base en Blender `/home/jdiaz/.local/bin/blender`; aplicar transformaciones, origen al suelo, nombres estables y escala 1 unidad = 1 metro.
3. Exportar glTF 2.0 binario. Mantener texturas ≤1024 px por unidad/héroe y ≤512 px para props; atlas por clan. Preferir materiales simples, una textura base/normal/ORM si hace falta.
4. Validar jerarquía, triángulos, materiales, UV, colisiones, animaciones, peso y licencia. LOD automático revisado visualmente; versión low-poly manual para figuras de lectura crítica.
5. Optimizar por meshopt y KTX2/Basis en build. Comprimir sin alterar silueta toon; conservar fuente `.blend` fuera del paquete público si contiene capas de trabajo.
6. Prueba visual con luz clara/oscura, zoom de juego y daltonismo; verificar nombres originales y que no haya recursos de terceros sin licencia.

## Carpetas propuestas

```text
clanes/
  index.html
  manifest.webmanifest
  src/
    app/             # entrada, escenas, adaptador UI
    sim/             # reloj fijo, estado, órdenes, sistemas puros
    path/            # grillas, costes, flow fields, obstáculos
    render/          # Three.js, instancias, cámara, LOD, selección
    content/         # catálogos por clan, misiones, mapas
    audio/           # bancos, mezclador y accesibilidad
  assets/
    models/<clan>/   # glTF/GLB y miniaturas
    textures/ audio/ maps/
  docs/ tests/ prueba-rendimiento/ vendor/
```

La demo de fase 1 es autocontenida bajo `prueba-rendimiento/`; no es aún la estructura de producción.

## Pruebas y criterios

- Unitarias con `node --test` para flow fields, pasos fijos, órdenes válidas, economía y combate determinista. Semillas y casos pequeños legibles.
- Integración de simulación sin WebGL: misma semilla + mismo registro de órdenes debe generar hash de estado igual en 1× y en pasos de pared agrupados.
- Renderer: prueba manual en escritorio y teléfonos Android/iOS objetivo. Inspeccionar toque, arrastre, pellizco, pérdida/restauración de contexto, giro y cambio de pestaña.
- Rendimiento: 200/400/800 entidades, campo estático y mapa denso; 60 s por escenario, mediana y p1 FPS, CPU/GPU, memoria, temperatura y consumo. Capturar modelo exacto del teléfono y navegador.
- Accesibilidad: contraste de clanes, forma además de color, texto mínimo legible, reducir movimiento y volumen, silenciar música/efectos por separado.
- CI: Node LTS para pruebas y validación de assets; publicar a Pages solo después de PR y aprobación de fase. La demo CDN requiere red y por sí sola no prueba instalación offline.
