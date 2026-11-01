# Dirección de arte de la ciudad de Senku

## Intención

Una aventura urbana alegre para público infantil: una ciudad costera del desierto
al final de una tarde luminosa. La silueta del lugar debe seguir leyéndose desde
la calle y abrirse, desde las azoteas, hacia un horizonte con mar, edificios y
un volcán lejano. La geometría es estilizada y de lectura clara; la riqueza sale
de las capas, la luz, las ventanas, los anuncios y los detalles de azotea, no de
texturas pesadas ni de superficies planas sin sombra.

## Paleta y luz

| Uso | Color |
| --- | --- |
| Cielo alto | `#594f83` |
| Banda malva | `#9a6587` |
| Cielo medio | `#d17a83` |
| Horizonte y sol | `#f2b47f` / `#fff0bd` |
| Niebla cálida | `#edb28e` |
| Mar lejano | `#718f9d` |
| Cordillera volcánica | `#665d79` |
| Sombra base | `#514755` |

Hora: atardecer cálido con cielo malva, nubes durazno, halo de sol suave y
contraste suficiente para que los carteles y las ventanas sigan siendo legibles.
La luz hemisférica rellena las sombras con un tono tierra; una sola dirección
de luz cálida define las caras. La luz por vértice oscurece bases y esquinas para
dar volumen a los edificios sin mapas de luz ni sombras en tiempo real.

## Capas del horizonte

1. Cielo equirectangular generado en una textura de 1024 × 512: degradado,
   cirros y reflejos marinos tenues.
2. Sol con halo, dibujado en una textura pequeña compartida por un solo sprite.
3. Una franja de mar con reflejos dibujados en una sola malla, detrás de la
   costa urbana.
4. Dos perfiles urbanos lejanos en lotes instanciados, con tintes apagados por
   la calima.
5. Cordillera continua de silueta irregular; el pico volcánico queda ligeramente
   desplazado del eje de la mirada inicial.
6. Niebla cálida funde ciudad y fondo y da profundidad a los edificios.

## Calles y fachadas

- Un atlas procedural de cuatro paños da variación de vidrio, marcos, dinteles,
  alféizares y jardineras sin cargar imágenes externas. El patrón se simplifica
  gradualmente con la distancia; los detalles adicionales se limitan al centro
  jugable.
- Las torres de centro usan una paleta mineral y alturas de 23–61 m. El barrio
  mexicano exterior usa fachadas más bajas, colores alegres, toldos, balcones,
  cornisas, equipos de aire, tinacos, antenas y escaleras de azotea.
- Bordillos, pasos peatonales, faroles, puestos, coches, bancas, jardineras y
  papel picado se dibujan con lotes instanciados y geometría compartida. Los
  faroles cambian de apagados a cálidos tras entrar al juego, con material
  emisivo básico y sin añadir luces a la escena.
- La plaza central tiene fuente baja, árboles variados y asientos; un segundo
  parque aporta otra silueta verde. Los anuncios conservan sus lotes previos.

## Presupuesto de Quest 2

- El cielo y el halo usan una textura cada uno; nubes, mar y reflejos se pintan
  al crear la textura, no son objetos animados.
- Los rascacielos lejanos usan dos `InstancedMesh`; el anillo exterior reduce
  la densidad de 56 a 40 siluetas. Cada lote conserva frustum culling; cordillera
  y mar son una malla cada uno. Se conserva la malla instanciada de edificios.
- Materiales Lambert/Basic, color estático por vértice y color por instancia.
- Mobiliario y detalles se agrupan por geometría en lotes instanciados. Torres
  distantes simplifican atlas y accesorios; los perfiles del horizonte conservan
  frustum culling. Sin luces dinámicas nuevas ni sombras en tiempo real.
- Sin luces nuevas, luces animadas, mapas de luz descargados ni sombras en
  tiempo real. El medidor de FPS existente es la comprobación en dispositivo.
- La vida usa lotes instanciados para coches, gatos, palomas, prendas y hojas;
  coches limitados a 12 y movimientos actualizados a 30 Hz. Sus esferas amplias
  mantienen culling por cámara. Un dirigible comparte tres piezas Lambert.
- Un uniforme cambia gradualmente una fracción de los vidrios a tonos cálidos
  tras 24 s de juego; es color de shader, sin luces ni materiales nuevos por ventana.
- La cama sonora urbana sintetiza tres tonos graves de volumen bajo con Web Audio;
  no añade archivos de audio.
