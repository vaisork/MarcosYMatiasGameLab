# ARTE 01 — Biblia visual de «Crónicas de Vaisgard»

Fecha: 16 de octubre de 2026. Estado: propuesta de dirección artística y candidatas de revisión; no autoriza edición final ni modifica el canon del juego.

## Fuentes y alcance comprobado

Se leyó completo el corpus de solo lectura `~/proyectos/entregas/equipo/vaisgard-corpus-9c079e8/`: prólogo y C001–C015, 16 archivos, 39.660 palabras según separación por espacios. El encargo actual establece su cierre literario y prevalece sobre las cabeceras administrativas antiguas. Se consultaron `AGENTS.md`, `BIBLIA_EDITORIAL.md`, `CANON_REFERENCE.md` y `POLITICA_DE_SECRETOS.md` mediante `git show 9c079e8:VintageTelnet-Libros/...`: no existen en el checkout de esta rama. También se consultaron los documentos 00–09 y el inventario de esta dirección de arte. Las colas históricas de prelectura no son órdenes actuales.

Base de trabajo: rama `codex/vaisgard-arte`, HEAD `7ed1be0a91c172f750b97b8a0ea9c3439392a1dd`. Base de arte: `origin/main` local `a2f19c6f0b0e5616c55bb04db5eade1aa9c5e2af`. Se intentó `git fetch origin`: falló con `cannot open .../FETCH_HEAD: Read-only file system`. Al cerrar se ejecutó `git ls-remote origin refs/heads/main` en solo lectura: devolvió el mismo SHA `a2f19c6f0b0e5616c55bb04db5eade1aa9c5e2af`. Queda comprobada la coincidencia con `main` remoto en ese momento, aunque `fetch` no pudo actualizar metadatos. Los originales se leyeron con `git show`, sin editar el juego.

El CSV del 14 de octubre fue el índice inicial, no un certificado artístico. El árbol local contiene 254 imágenes no miniatura en las seis familias solicitadas: se examinaron en hojas de contacto; las seis imágenes del EPUB v03 se abrieron además individualmente, extraídas del propio ZIP. La revisión panorámica permite comparar estilos y excluir material; no equivale a revisar anatomía a resolución completa en todos los recursos. Las referencias concretas de producción se conservan en `referencias/`; no se conserva un catálogo visual de zonas ajenas al relato o material protegido. `INDICE_INSPECCION.csv` identifica únicamente las referencias seleccionadas, dimensiones y blobs de origen.

La medición de cuotas suministrada se verificó en `USO.md`, encabezado 2026-10-16 02:27, comparación con lectura 02:25. No se ejecutó `uso.py`. Se mantiene el reparto explícito del propietario: auditoría y producción a Codex, sin duplicar el encargo. No se consultaron cuotas de nuevo.

## Identidad: un mundo usado que sigue trabajando

La promesa visual es aventura cercana, material y cálida. Una carga pesa; el agua moja; una carta conserva un doblez. El mundo no se organiza alrededor de Lera. La escala de Vaisgard puede asombrar sin convertir cada imagen en una epopeya. Las escenas de trabajo deben mostrar espacio para otras vidas y manos, no una protagonista que todo lo resuelve.

El trayecto visual tiene cuatro movimientos: intimidad de Valdren; apertura y dificultad de Edran; densidad de la ciudad; regreso a lugares reconocibles con otra atención. La llegada ocurre en C006, no en C014–C015 como proponía el documento 01 antiguo. El cierre vuelve al agua y a los acuerdos; la cubierta no debe prometer una resolución sentimental ni una gran batalla.

### Paleta propuesta

Son decisiones editoriales inferidas del arte observado, no colores canónicos obligatorios ni mediciones de píxel.

| Uso | Familia cromática | Referencias orientativas | Criterio |
|---|---|---|---|
| Valdren/Edran | Ocre de tierra, paja, madera miel, verde oliva | `#B28A50`, `#D7BA75`, `#59633C` | Vida cultivada, reparaciones visibles, contraste entre surco nuevo y rastrojo |
| Agua y lluvia | Azul grisáceo, piedra húmeda, reflejo marfil | `#667D86`, `#48595D`, `#E8E2CD` | En C006 bajar saturación y endurecer los brillos de piedras mojadas |
| Vaisgard | Caliza cálida, terracota, azul y rojo de toldos | `#C5B392`, `#995A3F`, `#496A7A` | Diferenciar tejido reciente de piedra gastada; conservar la diversidad de usos |
| Espera/noches | Índigo gris, marrón apagado, pequeñas lámparas ámbar | `#35454D`, `#695C4B`, `#C59450` | Frío y cansancio sin terror ni embellecimiento del desamparo |
| Cubierta | Marfil sobre oliva o azul profundo | `#F5E8C7`, `#263D38` | Masas simples para lectura a 200 px; título sin textura detrás |

### Luz y técnica

El conjunto de lugares usa pintura digital detallada, perspectiva ambiental, vegetación abundante, sombras legibles y personajes de lenguaje anime. Se conservará esa raíz con menos ruido en las zonas de lectura. No imitar a un artista nominal. El bestiario mezcla naturalismo y caricatura: el sufijo «anime» no garantiza uniformidad. No mezclar automáticamente un animal de ojos enormes con un entorno nocturno de realismo oscuro.

La mañana de C001 está empezando: los originales de Valdren, con sol alto, son panoramas de contexto, no capturas exactas de ese instante. La lluvia de C006 tiene consecuencias y continúa como llovizna en C007. El primer y segundo atardecer de espera pertenecen a jornadas distintas. No usar un cielo soleado como sustituto literal de una escena mojada. En el regreso no se repetirá el chaparrón por simetría decorativa.

## Arquitectura y materiales

**Valdren:** casas bajas de piedra y madera, tejados de teja según referencias, cercas bajas, cocinas conectadas al corredor de huertos, plaza donde gira un carro. El banco se adapta a una piedra vieja; no es un trono ni un monumento con inscripción. El pozo está cubierto con madera. La canaleta de la novela es de madera: la acequia pétrea del panorama V03 no demuestra el diseño de su junta.

**Edran:** parcelas trabajadas, losas de paso, rastrojo y tierra removida. No convertir la zanja observada desde fuera en una exploración interior. El terraplén narrativo tiene paredes de tierra altas, raíces, curva ciega y ensanche: el original abierto y panorámico no resuelve esa geometría. El hito precede al arroyo y una ladera impide ver la puerta; respetar la ocultación incluso si una referencia abre el horizonte.

**Vaisgard:** grandes arcos y piedra antigua, reparaciones y construcciones de uso cotidiano superpuestas. Escaleras exteriores sobre almacenes, accesos que deben quedar libres, toldos, cestas, canalillo, argollas y bebederos. No atribuir constructores, fecha o función oculta a las piedras. La ciudad vive de sus recorridos, no de un castillo central inventado. El mapa del juego no es un plano para insertar: excede el conocimiento de Lera y la escala del relato.

## Vestimenta y especies

Las prendas tienen trabajo y desgaste: chaqueta de Lera con bolsillo interior; pantalones y botas, bolsa con correa; mangas recogidas de Mara/Sabel; capa tierra que se ajusta a las necesidades de una niña en C011. Evitar armaduras, báculos, joyería heroica, bolsillos modernos con cremalleras y estética de clase jugable. No convertir el público 10–14 en edad canónica de todos los personajes.

Los modelos de `species/` sirven para anatomía general, no para asignar rostro a Lera o a una amiga. Felaryn: cola y apoyo digitígrado, anatomía felina; Dravak: cuerpo compacto y pequeñas placas pétreas, sin convertirlos en dragones; Marevyn: membranas interdigitales y vida de ribera, sin branquias inventadas; Vesperi: grandes ojos y sensibilidad auditiva, sin alas. Los cinco retratos muestran una estilización juvenil que no obliga a que una trabajadora adulta parezca una niña.

Arel es Vesperi y Seli Marevyn: si se producen retratos futuros, preservar esos datos y consultar su escena. Nara tiene cabello oscuro recogido con tela y no es la porteadora Dravak incidental del patio. No asignar especie, color de cabello, ojos, tez o edad exacta a quien el texto no los fija. Para este lote se prefieren ambientes y objetos; no se certifica un modelo definitivo de personajes. Los avatares de `players/` son identidades de otros personajes: quedan descartados como elenco literario.

## Objetos que deben mantener continuidad

| Objeto | Dato obligatorio | Error que debe evitarse |
|---|---|---|
| Carta de Dalia | Hoja, inicialmente plegada cuatro veces; desde C001 queda doblada una sola vez y protegida en la chaqueta | Sobre con sello, texto inventado legible, carta mojada o entregada sin respaldo narrativo |
| Nota de Mara | Papel pequeño reutilizado, cara interior limpia del envoltorio; distinta de la carta | Convertir ambos papeles en el mismo objeto o mostrar entrega confirmada |
| Recorte de Nara | Mensaje mínimo separado de la carta privada | Ilustrarlo como acceso a una localización cierta |
| Taza | Madera, asa torcida; bolsillo exterior de la bolsa | Cerámica, asa perfectamente simétrica, objeto mágico |
| Carboncillo | Pequeño, envuelto en tela limpia dada por Mara | Pluma estilográfica, tintero obligatorio o escritura brillante |
| Bolsa | Se aligera en C001, sin martillo después; correa gastada, acortada en C013 y reforzada en C014 | Mochila de combate, correa nueva en el regreso, inventar que se rompe por completo |
| Cantimplora | Pequeña, agua limitada, tapón que se suelta en C004 | Botella moderna transparente o reserva inagotable |
| Junta y cuña | Arreglo provisional; una gota persiste; se reemplaza cuña durante ausencia | Restauración perfecta al final o convertir la madera en mecanismo de piedra |
| Tablillas | Lista privada inicial; otras manos reorganizan turnos; pieza auxiliar para comparar humedad | Registro municipal, runas antiguas, marca de carboncillo sobre piedra antigua |

## Referencia obligatoria y reinterpretación

Obligatorio: hechos observables del texto, anatomías confirmadas, relaciones de escala funcionales, materiales de los objetos y orden de revelación. Las referencias VT2 obligan como familia visual y fuente de comparación, pero no hacen verdadera una composición incompatible con la escena. El encargo actual autoriza arte nuevo y sustituye la prohibición histórica de generarlo por defecto.

Admite reinterpretación: encuadre, hora cuando el texto no la determina, equilibrio cromático, pincelada, detalle de vegetación no identificado y composición tipográfica. Los colores de una prenda sin descripción son propuestas de diseño y deben registrarse como tales. Adaptar significa producir una imagen editorial nueva, nunca corregir el archivo del juego ni recortarlo para ocultar una contradicción.

## Criterios de continuidad y aceptación

1. La imagen se sitúa después de su primera descripción y no añade una respuesta que la prosa desconoce. No hay escenas de Dalia fuera del conocimiento de Lera.
2. Objetos, clima, ropa mojada, raspadura y correa corresponden al capítulo. No señalar izquierda/derecha de la herida si el texto no lo fija.
3. La carga tiene apoyo; las ruedas tienen eje coherente; no hay dedos fusionados ni extremidades añadidas. En ambientes vacíos no se simula una prueba anatómica.
4. El arte nuevo conserva la calidez de VT2 sin reproducir sus discrepancias. Toda variante rechazada se identifica y no entra al EPUB.
5. Portadas legibles a 200 px, acentos correctos y sin autor/créditos inventados. «Libro I: El primer camino» se trata como subtítulo provisional; no se inventa otro eslogan.
6. JPEG RGB, calidad de exportación 85; interiores con lado largo máximo 1600 px. Portadas 1600 × 2400 por la excepción explícita del encargo. Reescalar no crea detalle nativo: se registra la resolución recibida.
7. Texto alternativo futuro describe únicamente lo visible y no adelanta el relato. La aprobación de una candidata no se deduce de que haya pasado el control técnico.
8. Próximo consumidor: dirección editorial y revisión conjunta de canon para seleccionar candidatas. Sin maquetación de nueva versión, publicación, push o PR en este encargo.
