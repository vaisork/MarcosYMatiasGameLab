> Para continuar, empieza por [el relevo técnico actual](../docs/VT2_RELEVO_20261008.md): Ubuntu, GitHub, Raspberry, SSH, operación y límites. El [contexto de continuidad](docs/CONTEXTO_CONTINUIDAD.md) conserva el historial.

# Vintage Telnet 2

Juego de exploración y lectura con interfaz anime, mundo persistente, comercio, combate, mapa descubierto y especies 3D. El servidor Python mantiene las partidas en SQLite; el navegador sólo presenta acciones y resultados. El director se abre por separado en `/dm`.

Los eventos temporales del calendario y su control DM están descritos en [Eventos del mundo](docs/VT2_EVENTOS_MUNDO.md).

## Origen de esta versión

**Vintage Telnet 2 se empezó desde cero**, por petición de Javier, para construir un mundo más rico y una lectura más clara. Se conserva el canon del prompt maestro; no se copió la historia ni la narración descartada del juego anterior. Se aprovecharon selectivamente ideas y funciones útiles del anterior —orientación por mapa descubierto, algunas reglas y experiencia de operación— y se adaptaron a esta implementación. El servidor y el contenido de esta versión viven en esta carpeta; no dependen de importar el motor anterior.

La versión anterior se conserva en `../vintage-telnet` como referencia histórica. No modificar Senku ni sustituir automáticamente datos de producción. La instancia oficial usa esta nueva implementación; las entregas locales y la instalación activa deben distinguirse por versión. El relevo técnico registra la autorización actual de integración y qué versión está desplegada.

## Ubuntu o Raspberry Pi

Python 3.11 o superior. No requiere Node para jugar; imágenes, Three.js y modelos están incluidos. En Raspberry se recomienda sistema de 64 bits y navegador con WebGL para las vistas 3D.

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python scripts/setup_private.py
.venv/bin/python scripts/serve.py --host 127.0.0.1 --port 8083
```

Abre `http://127.0.0.1:8083`. Crea cuenta y personaje; el director los aprueba desde `http://127.0.0.1:8083/dm` usando la contraseña elegida en configuración. No hay contraseña pública. En un equipo ya configurado se conservan credenciales y partidas; no ejecutes una restauración encima de una partida activa.

Para arrancar automáticamente con systemd:

```bash
./ops/install-user-service.sh
journalctl --user -u vintage-telnet-nuevo.service -n 50 --no-pager
```

La guía para migrar los enlaces del anterior, conservar datos y validar antes de retirarlo está en [ops/RASPBERRY_HANDOFF.md](ops/RASPBERRY_HANDOFF.md).

## GitHub y datos privados

Código, contenido e imágenes están versionados. `runtime/`, `.venv/`, bases de datos y configuración privada están excluidos. No subas `runtime/server.env`, respaldos ni partidas. Este proyecto se publica en `vaisork/MatiasGameLab`, carpeta `vintage-telnet-2`.

## Verificación

```bash
.venv/bin/python -m unittest discover -s tests
node client/qa-map.mjs
node client/qa-map-paths.mjs
node client/qa-printing.mjs
```

Los informes en `review/` distinguen pruebas reales, fixtures y límites. La construcción conserva el canon y las partidas actuales; no se presenta como una certificación completa de todas las rutas o del hardware Raspberry antes de probarlo allí.
