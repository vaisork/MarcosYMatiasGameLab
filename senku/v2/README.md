# Senku v2

Juego independiente de Legacy. Abrir `index.html` mediante un servidor HTTP desde la raíz del repositorio.

## Salir de la taquería

Derrota con pisotones a los tres enemigos. El último ratón/hámster en caer suelta una llave dorada recogible. Acércate a ella para recogerla; después vuelve a la camioneta del lado izquierdo y pulsa **E** o el botón táctil **Subir**. Sin llave, la camioneta muestra una pista.

La camioneta arranca durante dos segundos y muestra «¡Senku toma el volante! ¡A juntar Churus!» durante tres segundos. Después abre el bonus independiente de manejo: cuenta regresiva de 3 s y 45 s de juego, con premio de hasta 30 Churus. A/D o ←/→ manejan; Espacio/W/↑ o el botón táctil permiten saltar cactus, piedras y baches. Recoger bidones llena el indicador de combustible. Al terminar, el saldo se guarda una sola vez y «Seguir al desierto» inicia la cinemática familiar.

El auto familiar llega y estaciona, la familia baja y el niño pregunta «Mamá, mamá, ¿podemos ir al parque del desierto?»; su madre responde «Sí, ahorita vamos». Senku entra primero por la reja y recorre siete pantallas continuas con cámara, tres capas de paralaje, secretos, Churus y oleadas de ratones y hámsters negros y cafés. Flechas/A/D mueven a Senku; Espacio/▲/W permiten saltar y Espacio/Enter/Escape saltan la cinemática. M abre el armario y T cambia de traje.

La música por zona queda pendiente: todavía no hay reproductor de música; `cambiarEscena` conserva el punto de conexión para enlazarla.

Decisión técnica (2026-10-23): `coleccionados` conserva los IDs de enemigos derrotados y `llave-camioneta` como inventario; `progreso.escena` guarda el destino. Se mantiene el formato versión 1 y las claves de Legacy intactas. Si se recarga antes de recoger la llave, esta reaparece cerca del punto original de la rata; las derrotas parciales también se conservan. Reiniciar por falta de vida conserva estos avances.

La llave usa un dibujo sencillo porque no hay arte de llave en `assets/objetos`. El bonus dibuja la camioneta con cajuela abierta, cajas, Senku, polvo y tres capas de dunas usando formas vectoriales propias.

Pruebas: `node --test senku/v2/tests/*.test.mjs` desde la raíz del repositorio.

## HUD y controles táctiles (2026-10-23)

El joystick redondo inferior izquierdo usa Pointer Events y admite mantener Saltar con otro dedo. Emite `entrada.obtenerEstado().vector` normalizado (`x` derecha, `y` abajo) y los booleanos `izquierda`, `derecha`, `arriba`, `abajo`: zona muerta radial de 0.2 y ocho sectores de 45°. Sólo izquierda/derecha afectan el movimiento actual; arriba no salta. Soltar, cancelar, perder captura, cambiar de pestaña o pausar libera el joystick. El teclado conserva flechas/A/D para moverse y ↑/W/Espacio para saltar.

Saltar siempre está disponible; Subir aparece junto a él al acercarse a la camioneta. El HUD muestra retrato, barra y cifra de 100 HP, Churus y pausa; pausa y Armario abren el mismo menú y detienen el juego. Se conserva el daño 1/1/2.

`estadoJugador.habilidades.disparar` y `.lanzagranadas` controlan los botones de armas: sólo el booleano `true` los muestra. Se guardan dentro de `senku2_save` versión 1; guardados anteriores reciben ambos flags en `false`. Todavía no hay mecánica de armas ni forma de desbloquearlas jugando. El consumidor que implemente esos desbloqueos debe activar el flag y guardar el estado; el HUD refleja cambios durante el siguiente paso del juego.

Caché PWA: `senku2-v5`. Evidencia visual previa en `../../senku2/hud/`: móvil 844×390 (con y sin habilidades) y escritorio 1366×768. Safe-area se aplica a los cuatro bordes; la simulación de viewport no sustituye una prueba en teléfono físico.
