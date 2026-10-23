# Senku v2

Juego independiente de Legacy. Abrir `index.html` mediante un servidor HTTP desde la raíz del repositorio.

## Salir de la taquería

Derrota con pisotones a los tres enemigos. El último ratón/hámster en caer suelta una llave dorada recogible. Acércate a ella para recogerla; después vuelve a la camioneta del lado izquierdo y pulsa **E** o el botón táctil **Subir**. Sin llave, la camioneta muestra una pista.

El viaje muestra «Arrancando…» durante dos segundos y el diálogo del niño y su madre durante tres segundos. Después comienza el desierto, con suelo, tres plataformas y dos enemigos. Flechas/A/D mueven a Senku; Espacio/▲/W permiten saltar. M abre el armario y T cambia de traje.

Decisión técnica (2026-10-23): `coleccionados` conserva los IDs de enemigos derrotados y `llave-camioneta` como inventario; `progreso.escena` guarda el destino. Se mantiene el formato versión 1 y las claves de Legacy intactas. Si se recarga antes de recoger la llave, esta reaparece cerca del punto original de la rata; las derrotas parciales también se conservan. Reiniciar por falta de vida conserva estos avances.

La llave usa un dibujo sencillo porque no hay arte de llave en `assets/objetos`. El desierto usa el fondo existente y plataformas visibles. Sin bonus, reja explorable, garras, anclador ni jefe.

Pruebas: `node --test senku/v2/tests/*.test.mjs` desde la raíz del repositorio.
