# Relevo local — Hoshai 01, 2026-10-25

Encargo actual: 29 salas de Hoshai, sin red, imágenes, commit ni push.
Rama `codex/rpg-hoshai-01`; base `b90a076` (Korven completo).
`main` local observado: `e70567d`; no se consulta su estado remoto.
Leído el relevo compartido en `/home/jdiaz/proyectos/entregas/equipo/RELEVO-vaisgard-rpg-codex.md`.
Este archivo registra únicamente el encargo actual; no reactiva tareas históricas.

## Resultado y decisiones conservadoras

- Las 29 salas ya existen en el canon: se añaden escenas RPG y fuentes Tiled,
  no nuevas salas al mundo. Se conservan las 59 salidas (56 internas y tres
  fronteras), seis NPC, fauna, textos y estados narrativos aprobados.
- Las máscaras provisionales siguen pasos y obstáculos permanentes del relato;
  no añaden atajos, salidas por ventanas, cruce de la cuerda ni túnel bajo las cajas.
  El ilustrador debe alinear los fondos con las máscaras y repetir el QA.
- No falta una decisión narrativa para este bloque: se reutiliza el contenido
  vigente sin reescribir descripciones ni inventar conflictos o recompensas.
- Fondos opcionales omitidos hasta su entrega; IDs, rutas y briefs pendientes en
  [RPG_HOSHAI_01.md](vintage-telnet-2/docs/RPG_HOSHAI_01.md). Sin arte nuevo.
  NPC sin atlas mantienen la reserva existente; fauna sin sprite mantiene su
  símbolo. Combate y su fondo de reserva permanecen como en la base.
- Iria de Hoshai necesita `sprites/hoshai_iria.png` para no sustituir el atlas
  aprobado de Iria de Edran. La polea requiere variante por estado autoritativo;
  no se convierte en obstáculo permanente ni se resuelve la deuda de Seran.

## Evidencia y límites

Suite solicitada: 330 pruebas en 151,048 s, OK (una omitida).
Hoshai focal: 2/2 OK; 29 salas, 59 salidas, seis diálogos y tres fronteras.
Cliente RPG: 296 mapas navegables y contornos de actores OK.
`npm run check:client`, sintaxis RPG y `git diff --check`: OK.
Sin QA visual, despliegue ni consulta a producción. Cambios locales sin commit,
push, PR ni integración. Log de suite: `/tmp/hoshai-01-unittest.log`.
Lectura local de cuota 2026-10-25 06:18 (México): 48% de 5 h y 92% semanal
restantes. Se reutilizó `USO.md` de las 06:17 y la función local de `uso.py`;
no se ejecutó el agregador porque consulta Antigravity por red y escribe fuera
del sandbox. Se trabaja sin delegar: escenas y controles forman un bloque común.
Última lectura antes del cierre: 22% de 5 h y 88% semanal restantes; consumo
semanal observado de cuatro puntos, inferior al máximo de 23 puntos del encargo.
El tablero compartido y el relevo externo no son escribibles desde este sandbox;
el arquitecto debe consumir este registro para sincronizar el encargo.

Siguiente bloque: ilustración e integración del arte de Hoshai 01 sobre estos
IDs, con revisión visual. No se fija otra región sin una prioridad del arquitecto.
