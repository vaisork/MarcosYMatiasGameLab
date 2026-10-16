# Vintage Telnet — Arquitectura de contenido narrativo en Raspberry Pi

**Fecha:** 2026-09-21  
**Arquitecto:** Arquitecto de Vintage Telnet y Raspberry Pi  
**Estado:** PROPUESTA ARQUITECTÓNICA PARA IMPLEMENTACIÓN

## Objetivo

Separar claramente:

1. contenido del mundo que Historiador/Narrador producen;
2. contenido reservado que no debe quedar expuesto públicamente;
3. estado vivo que cambia por jugador;
4. código del servidor y del cliente.

El HTML no contiene la historia completa. El servidor en Raspberry Pi decide qué contenido corresponde entregar a cada jugador.

## Flujo

```text
Historiador / Narrador
        ↓
contenido estructurado versionado
        ↓
release del servidor en Raspberry
        ↓
motor narrativo / mundo
        ↓
estado persistente SQLite
        ↓
respuesta estructurada
        ↓
HTML / terminal del jugador
```

## 1. Contenido público/versionado

Dentro del repositorio:

```text
vintage-telnet/
  content/
    manifest.json
    species.json
    settlements/
      valdren.json
      khariel.json
      brumak.json
      narevia.json
      velmora.json
      vaisgard.json
    narrative/
      arrivals.json
      observations.json
      rumors.json
```

Este contenido puede contener únicamente información apta para existir en el repositorio público.

### Principio

El código no debe definir geografía narrativa permanente en `world.py`.

El servidor puede contener lógica de movimiento, validación y carga, pero las salas, nombres, descripciones y conexiones aprobadas deben migrar progresivamente a `content/`.

## 2. Cómo representar una sala

Ejemplo:

```json
{
  "id": "valdren_plaza",
  "settlement": "valdren",
  "name": "Plaza de Valdren",
  "description": "Texto público aprobado para describir esta sala.",
  "exits": {
    "north": "valdren_camino_norte",
    "east": "valdren_taller",
    "south": "valdren_mercado"
  },
  "tags": ["community", "starting-area"]
}
```

Los IDs son técnicos, estables y no se traducen.

Los textos visibles pueden cambiar sin cambiar el ID de la sala.

Para el P0, la descripción pública básica de la sala vive **inline** en `description`. No se usa todavía `description_id`: no existe un registro/resolvedor de descripciones y añadir esa indirección antes de necesitar localización o variantes solo crea un contrato incompleto. Los eventos narrativos, primeras llegadas, rumores y textos condicionados siguen viviendo separados bajo `narrative/`.

En `schema_version = 1`, las claves de `exits` admitidas son únicamente `north`, `south`, `east` y `west`, porque corresponden al movimiento cardinal aprobado para el primer slice. Nuevos tipos de desplazamiento exigirán una versión de esquema posterior.

## 3. Cómo representar narrativa

Ejemplo:

```json
{
  "id": "vt-nar-001-valdren-arrival",
  "room": "valdren_plaza",
  "trigger": "first_entry",
  "once_per_player": true,
  "text": "Texto aprobado por Narrador.",
  "requires": [],
  "sets": ["seen.vt-nar-001-valdren-arrival"]
}
```

El Narrador define la experiencia y el texto.

El servidor interpreta el trigger y consulta estado persistente antes de decidir si debe mostrarla.

## 4. Contenido reservado real

El repositorio actual es público. Por tanto, cualquier archivo dentro de GitHub debe considerarse potencialmente visible para un jugador.

El material realmente secreto que no deba poder obtenerse leyendo el repositorio no se instalará desde GitHub público.

En Raspberry:

```text
/var/lib/vintage-telnet/private-content/
  manifest.json
  narrative/
  world-secrets/
```

Características:

- fuera del checkout/release;
- no servido por HTTP;
- no accesible mediante rutas de assets;
- permisos restringidos al usuario del servicio;
- no incluido en logs;
- backup separado;
- carga explícita por el servidor.

`SECRETS.md` y `NARRATIVE_RESERVED.md` pueden continuar como documentos de coordinación, pero al estar en un repositorio público no deben considerarse una barrera de seguridad para futuros secretos sensibles al juego.

## 5. Estado vivo

El contenido describe qué puede existir.

SQLite describe qué ocurrió.

Ruta:

```text
/var/lib/vintage-telnet/vintage.sqlite3
```

Además de identidad/especie/sala, el modelo podrá crecer con tablas como:

```text
player_narrative_state
- player_id
- narrative_id
- state
- first_seen_at
- completed_at

player_flags
- player_id
- key
- value

world_flags
- key
- value
- updated_at
```

No hace falta crear todas esas tablas para el primer slice. Se añaden mediante migraciones cuando exista una mecánica aprobada que las necesite.

## 6. Instalación en Raspberry

Código + contenido público versionado:

```text
/opt/vintage-telnet/releases/<git-sha>/
  vintage-telnet/
    server/
    content/
    ...
```

Release activo:

```text
/opt/vintage-telnet/current -> /opt/vintage-telnet/releases/<git-sha>
```

Estado persistente y contenido privado:

```text
/var/lib/vintage-telnet/
  vintage.sqlite3
  private-content/
```

Configuración/secrets operativos:

```text
/etc/vintage-telnet/
  server.env
```

### Regla crítica

Cambiar `current` a un release nuevo puede reemplazar código y contenido público, pero **nunca** borra:

- `vintage.sqlite3`;
- `private-content/`;
- backups;
- secretos de entorno.

## 7. Despliegue de una actualización de historia

Secuencia objetivo:

1. Historiador/Narrador actualizan contenido autorizado.
2. Validación automática comprueba estructura y referencias.
3. PR revisable.
4. Release incluye la nueva versión de `content/`.
5. Raspberry instala el release en un directorio nuevo.
6. Si hay migración de estado, backup previo obligatorio.
7. Se ejecuta validación local del release.
8. Se cambia el symlink `current`.
9. Se reinicia/recarga el servicio.
10. Health check.
11. Si falla, rollback al release anterior siempre que el esquema sea compatible.

El contenido no se editará manualmente dentro de `/opt/vintage-telnet/current`.

## 8. Validación automática de contenido

Crear una herramienta determinista:

```text
python scripts/validate-vintage-content.py
```

Debe comprobar, como mínimo:

- JSON válido;
- IDs únicos;
- cada salida apunta a una sala existente;
- cada dirección de salida pertenece al conjunto permitido por la versión de esquema (`north`, `south`, `east`, `west` en v1);
- cada narrativa apunta a una sala existente cuando corresponda;
- especies iniciales apuntan a asentamientos/salas existentes;
- ningún archivo público referencia rutas de contenido privado;
- campos obligatorios;
- ausencia de IDs vacíos;
- manifest y versión de contenido coherentes.

Esta tarea pertenece a automatización, no a un agente.

## 9. Contrato con el HTML

El HTML nunca descarga todos los archivos de historia.

Pide al servidor el estado permitido.

Ejemplo de respuesta de sala:

```json
{
  "room": {
    "id": "valdren_plaza",
    "name": "Plaza de Valdren",
    "description": "Texto permitido para este jugador.",
    "exits": ["north", "east", "south"]
  },
  "narrative": [
    {
      "id": "vt-nar-001-valdren-arrival",
      "text": "Texto que corresponde mostrar ahora."
    }
  ]
}
```

El navegador no recibe:

- condiciones secretas futuras;
- soluciones de aventuras;
- texto todavía no desbloqueado;
- datos privados del mundo;
- estado de otros jugadores que no deba conocer.

## 10. Autoridad por función

### Historiador

Define:

- qué lugares existen;
- nombres;
- cultura;
- historia;
- relación entre lugares;
- hechos canónicos;
- contenido del mundo.

No programa lógica de triggers.

### Narrador

Define:

- qué percibe el jugador;
- descripciones;
- textos de llegada;
- rumores;
- escenas;
- pistas;
- descubrimientos;
- condiciones narrativas requeridas.

Puede expresar una necesidad de trigger; no implementa el motor.

### Arquitecto

Define:

- formato;
- separación público/privado;
- contratos;
- persistencia;
- despliegue;
- validación;
- seguridad.

### Servidor

Carga contenido, aplica reglas, consulta estado y entrega al jugador únicamente la información permitida.

### HTML

Presenta la respuesta del servidor.

## 11. Primer slice

Para cumplir `FIRST_PLAYABLE_SLICE.md`, no hace falta implementar todavía el motor narrativo completo.

Primera fase:

- crear las microzonas de los cinco pueblos como contenido estructurado;
- cargar salas y salidas desde archivo;
- mostrar descripción de la sala actual;
- persistir únicamente la sala actual del jugador;
- validar contenido automáticamente.

Segunda fase:

- textos de primera llegada;
- `once_per_player`;
- flags narrativos simples.

Tercera fase:

- rumores, descubrimientos, condiciones y consecuencias persistentes.

Así el primer slice sigue concentrado en:

```text
ENTRAR → ELEGIR ESPECIE → MOVERSE POR EL PUEBLO
```

sin bloquearse esperando un motor de aventuras completo.

## Decisión

La Raspberry Pi es la **instalación activa** del contenido que utiliza el juego.

GitHub continúa siendo la fuente versionada de código y contenido público autorizado; SQLite y el contenido verdaderamente reservado viven fuera de cada release.

El HTML es una vista. No es repositorio de historia ni autoridad narrativa.

## 12. Despliegue automático confirmado por Javier

**Decisión de Javier:** las actualizaciones de historia/contenido deben llegar automáticamente a la Raspberry Pi.

Se adopta un modelo **pull desde Raspberry**, no push entrante desde GitHub.

### Por qué

- no abre un puerto adicional en la Raspberry;
- no necesita exponer un webhook del hogar/servidor;
- no entrega credenciales SSH de la Raspberry a GitHub Actions;
- si GitHub o la red fallan, el juego conserva la última historia válida;
- permite validar antes de activar;
- el contenido y el código pueden actualizarse con ciclos distintos.

### Flujo automático

```text
Historiador / Narrador
        ↓
PR de contenido
        ↓
main
        ↓
Raspberry detecta nuevo SHA de main
        ↓
extrae SOLO vintage-telnet/content/
        ↓
validador instalado localmente
        ↓
si pasa
  crea content-releases/<sha>/
  cambia symlink current-content
  recarga contenido / reinicia servicio de forma controlada
si falla
  conserva current-content anterior
  registra error
```

### Rutas operativas propuestas

```text
/var/lib/vintage-telnet/
  vintage.sqlite3
  private-content/
  content-releases/
    <git-sha>/
  current-content -> content-releases/<git-sha>

/var/cache/vintage-telnet/
  content-source/        # checkout/cache de solo lectura para obtener contenido

/opt/vintage-telnet/current/
  ... servidor y validador instalados ...
```

El servidor debe cargar contenido desde:

```text
/var/lib/vintage-telnet/current-content
```

y no directamente desde el checkout temporal usado para descargar.

### Frecuencia inicial

Usar un `systemd timer` cada **10 horas**.

Esto reduce consultas innecesarias y sigue siendo suficiente para contenido narrativo, que no requiere propagación casi en tiempo real.

La frecuencia se puede cambiar más adelante sin tocar el formato de contenido.

### Qué dispara una activación

Un nuevo SHA de `main` no basta por sí solo.

El actualizador compara el contenido de:

```text
vintage-telnet/content/
```

Si esa carpeta no cambió desde la última versión activa, no crea un release de contenido nuevo ni reinicia el servicio.

### Actualización atómica

Nunca copiar archivos directamente encima de `current-content`.

Secuencia:

1. descargar a staging;
2. validar;
3. crear `content-releases/<sha>`;
4. verificar permisos;
5. cambiar symlink `current-content` de una sola operación;
6. recargar/reiniciar el servidor;
7. ejecutar health check;
8. si falla, volver el symlink a la versión anterior y recuperar el servicio.

Así un archivo parcial o una caída de red no deja el mundo a medias.

### Estado que nunca toca el actualizador

El actualizador de historia tiene prohibido modificar:

- `vintage.sqlite3`;
- `private-content/`;
- `/etc/vintage-telnet/server.env`;
- backups;
- releases de código.

### Privilegios

El actualizador debe ejecutarse con un usuario sin privilegios de administración y con acceso de escritura únicamente a:

- cache de contenido;
- `content-releases/`;
- symlink `current-content`.

No debe poder escribir la base de datos ni leer secretos que no necesita.

### Fallos

Un fallo de contenido no tira el juego.

Si:

- GitHub no responde;
- no hay Internet;
- JSON es inválido;
- una salida apunta a una sala inexistente;
- falta un archivo obligatorio;
- falla el health check después de activar;

entonces se conserva o restaura automáticamente la última versión válida y se registra el error para diagnóstico.

### Código vs historia

La automatización aquí descrita despliega **contenido narrativo**, no código Python.

Un cambio en:

```text
vintage-telnet/content/
```

puede publicarse automáticamente tras validación.

Un cambio en:

```text
vintage-telnet/server/
vintage-telnet/requirements.txt
vintage-telnet/ops/
```

sigue el flujo de despliegue de código, con pruebas y revisión correspondientes.

### Contenido privado

`private-content/` no se sincroniza desde el repositorio público.

Si posteriormente se crea una fuente privada autorizada para Historiador/Narrador, tendrá un proceso separado con credenciales de solo lectura y las mismas garantías de staging → validación → activación atómica.

### Primera implementación operativa requerida

El Desarrollador de Servidor/operación debe preparar:

- `scripts/validate-vintage-content.py`;
- `ops/update-content.sh` o equivalente;
- `ops/vintage-content-update.service`;
- `ops/vintage-content-update.timer`;
- registro del SHA de contenido activo;
- rollback automático;
- health check posterior a activación;
- pruebas locales con contenido válido e inválido.

### Prueba de aceptación

La automatización queda aprobada cuando pueda demostrarse:

1. servidor usando contenido A;
2. merge de contenido B a `main`;
3. Raspberry detecta B sin intervención manual;
4. valida B;
5. activa B;
6. las partidas/SQLite permanecen intactas;
7. contenido C inválido llega a `main`;
8. Raspberry rechaza C y continúa sirviendo B;
9. logs explican claramente el rechazo.

**No se considera probado en Raspberry hasta ejecutar esta secuencia físicamente en ella.**

