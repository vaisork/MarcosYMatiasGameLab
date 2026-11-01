# Senku v2

Juego independiente de Legacy. Abrir `index.html` mediante un servidor HTTP desde la raíz del repositorio.

## Ciudad y bonus del camión

En la escena `ciudad` (`index.html?escena=ciudad` o `progreso.escena = 'ciudad'`), Senku atraviesa la calle hasta el camión estacionado a la derecha (`disparador` `id: 'camion'`, `accion: 'subir'`). Al pulsar **E** o **Subir**, muestra «¡Senku sube al camión! ¡A juntar Churus!» y abre `./bonus-camion.html` (`src/bonus_camion.mjs`): cuenta regresiva de 3 s y hasta 30 s de juego por la ciudad con tres capas de paralaje (edificios con tinacos, fachadas de barrio y postes con cables), donde el camión avanza y Senku salta entre las cajas bajas, los huacales medios y el techo del camión para tomar hasta 30 Churus y esquivar letreros, ramas y cables. Al terminar, el premio se suma una sola vez al saldo persistente (`ID_PREMIO = 'bonus-camion-etapa-4'`), `progreso.escena` pasa a `taqueria` y «Seguir a la taquería» abre `./index.html`.

## Salir de la taquería

Derrota con pisotones a los tres enemigos. El último ratón/hámster en caer suelta una llave dorada recogible. Acércate a ella para recogerla; después vuelve a la camioneta del lado izquierdo y pulsa **E** o el botón táctil **Subir**. Sin llave, la camioneta muestra una pista.

La camioneta arranca durante dos segundos y muestra «¡Senku toma el volante! ¡A juntar Churus!» durante tres segundos. Después abre el bonus independiente de manejo: cuenta regresiva de 3 s y hasta 30 s de juego, con premio de hasta 30 Churus. A/D o ←/→ manejan; Espacio/W/↑ o el botón táctil permiten saltar cactus, piedras y baches. Recoger bidones llena el indicador de combustible. Al terminar, el saldo se guarda una sola vez y «Seguir al desierto» inicia la cinemática familiar.

**Ajustes pedidos por Matías (31/10/2026).** Los dos bonus duran 30 s como máximo y terminan en cuanto se juntan 30 Churus; tienen 3 corazones (cada zanate u obstáculo quita uno, con invulnerabilidad breve) y al perderlos terminan conservando los Churus juntados. Los zanates que pican a Senku se alejan volando. En el juego principal cada escena tiene 1-2 botiquines (+25; el HUD muestra vida actual/máxima; «jugar otra vez» los repone). Senku corre un 17 % más rápido, gira mejor en el aire y tiene **Desliz** (Shift o L; botón táctil junto a Saltar): dash corto con 0.3 s de invulnerabilidad y 0.8 s de recarga. K sigue siendo el gancho. El Gato Mecánico conserva su dificultad.

El auto familiar llega y estaciona, la familia baja y el niño pregunta «Mamá, mamá, ¿podemos ir al parque del desierto?»; su madre responde «Sí, ahorita vamos». Senku entra primero por la reja y recorre siete pantallas continuas con cámara, tres capas de paralaje, secretos, Churus y oleadas de ratones y hámsters negros y cafés. Flechas/A/D mueven a Senku; Espacio/▲/W permiten saltar y Espacio/Enter/Escape saltan la cinemática. M abre el armario y T cambia de traje.

La música chiptune se genera con Web Audio y cambia por zona; N o el botón ♪ la apagan.

## Capítulo 2 — Guatemala

Tras vencer al Gato Mecánico, «Continuar a Guatemala» abre cuatro tramos: Antigua, Chichicastenango, selva del Petén y Tikal. Cada tramo tiene dos fondos pintados de 1280×720; tucán, coatí y mono usan hojas animadas de 384×192. Las habilidades, salud, churus y perfiles de daño siguen las reglas actualizadas de México. En Tikal, Balam alterna carreras telegrafiadas, salto con ondas y lluvia de jade en tres fases; zarpazos y pisotones lo derrotan. Al vencerlo aparece resumen y «Volver a jugar Guatemala», que conserva el avance mexicano y los Churus.

La música procedural cambia por zona y usa la pieza de tensión durante cada jefe. El tuk-tuk y su arte ya están preparados; el bonus jugable del tuk-tuk queda pendiente.

Decisión técnica (2026-10-23): `coleccionados` conserva los IDs de enemigos derrotados y `llave-camioneta` como inventario; `progreso.escena` guarda el destino. Se mantiene el formato versión 1 y las claves de Legacy intactas. Si se recarga antes de recoger la llave, esta reaparece cerca del punto original de la rata; las derrotas parciales también se conservan. Reiniciar por falta de vida conserva estos avances.

La llave usa un dibujo sencillo porque no hay arte de llave en `assets/objetos`. El bonus dibuja la camioneta con cajuela abierta, cajas, Senku, polvo y tres capas de dunas usando formas vectoriales propias.

Pruebas: `node --test senku/v2/tests/*.test.mjs` desde la raíz del repositorio.

## HUD y controles táctiles (2026-10-23)

El joystick redondo inferior izquierdo usa Pointer Events y admite mantener Saltar con otro dedo. Emite `entrada.obtenerEstado().vector` normalizado (`x` derecha, `y` abajo) y los booleanos `izquierda`, `derecha`, `arriba`, `abajo`: zona muerta radial de 0.2 y ocho sectores de 45°. Sólo izquierda/derecha afectan el movimiento actual; arriba no salta. Soltar, cancelar, perder captura, cambiar de pestaña o pausar libera el joystick. El teclado conserva flechas/A/D para moverse y ↑/W/Espacio para saltar.

Saltar siempre está disponible; Subir aparece junto a él al acercarse a la camioneta. El HUD muestra retrato, barra y cifra de 100 HP, Churus y pausa; pausa y Armario abren el mismo menú y detienen el juego. Se conserva el daño 1/1/2.

`estadoJugador.habilidades.disparar` y `.lanzagranadas` controlan los botones de armas: sólo el booleano `true` los muestra. Se guardan dentro de `senku2_save` versión 1; guardados anteriores reciben ambos flags en `false`. Todavía no hay mecánica de armas ni forma de desbloquearlas jugando. El consumidor que implemente esos desbloqueos debe activar el flag y guardar el estado; el HUD refleja cambios durante el siguiente paso del juego.

Caché PWA vigente: `senku2-v19`. Evidencia visual previa en `../../senku2/hud/`: móvil 844×390 (con y sin habilidades) y escritorio 1366×768. Safe-area se aplica a los cuatro bordes; la simulación de viewport no sustituye una prueba en teléfono físico.

## Auditoría de recorrido (2026-10-30)

`tests/recorrido_completo.test.mjs` explora cada escena con la física real (caminar, saltos, anclador y garras) y exige churus y secretos alcanzables, salida alcanzable desde cualquier punto y jefe vencible. Decisiones técnicas: el guardado reanuda en la escena guardada (el bonus de la camioneta guarda `reja`; un guardado en `desierto` continúa allí); sólo la cinemática de la familia se salta con Espacio/Enter/Escape/toque; «Jugar el capítulo otra vez» revive enemigos, llave, anclador, lanzador y jefe, y conserva churus, trajes y garras.
