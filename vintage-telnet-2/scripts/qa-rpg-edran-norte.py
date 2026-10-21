#!/usr/bin/env python3
"""Runner focal y fixture WSGI desechable para QA de Escenas Norte de Edran.

Diseñado para validación de las 5 salas canónicas, 11 salidas legales,
causalidad narrativa de Aren y Bren, y encuentros canónicos (incluyendo
salteador bravucón forzado por RNG determinista en fixture).

Soporta:
- WSGI server efímero en --port (default 8776) iniciando en edran_terraplen
  mediante rutas reales desde la plaza de Valdren.
- AutoLogin incondicional que sustituye HTTP_COOKIE por la sesión autenticada
  aislada derivada de dict(session_transaction()) con CSRF.
- POST /__qa__/stop para cierre limpio y ordenado desde localhost.
- Reloj real time.time para cadencia de combate de 4s.
- Teardown garantizado de SQLite efímero y servidor WSGI en cualquier salida.
- Comprobaciones focales (--check o por defecto) sin arrancar servidor persistente.
- Prueba focal de arranque y parada limpia (--test-startup).
"""
import argparse
from collections import deque
import json
import os
from pathlib import Path
import sys
import threading
import time
import urllib.request

VENV_PY = Path('/home/jdiaz/proyectos/.venv-vt2/bin/python')
try:
    import werkzeug
except ImportError:
    if VENV_PY.exists() and sys.executable != str(VENV_PY):
        os.execv(str(VENV_PY), [str(VENV_PY)] + sys.argv)
    raise

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from server.content import Content
from tests.test_rpg_parity import RpgParityTests
from werkzeug.serving import make_server

NORTH_ROOMS = [
    'edran_terraplen',
    'edran_casa_camino',
    'edran_calzada',
    'edran_hito_campos',
    'edran_vista_cuenca',
]

ELEVEN_EXITS_STEPS = [
    ('sur', 'edran_era'),
    ('norte', 'edran_terraplen'),
    ('norte', 'edran_casa_camino'),
    ('sur', 'edran_terraplen'),
    ('norte', 'edran_casa_camino'),
    ('norte', 'edran_calzada'),
    ('sur', 'edran_casa_camino'),
    ('norte', 'edran_calzada'),
    ('norte', 'edran_hito_campos'),
    ('sur', 'edran_calzada'),
    ('norte', 'edran_hito_campos'),
    ('norte', 'veyra_puerta_campos'),
    ('sur', 'edran_hito_campos'),
    ('este', 'edran_vista_cuenca'),
    ('este', 'veyra_pastos_exteriores'),
    ('oeste', 'edran_vista_cuenca'),
    ('oeste', 'edran_hito_campos'),
]


class AutoLogin:
    """WSGI middleware que asegura sesión autenticada aislada con CSRF.

    Sustituye incondicionalmente HTTP_COOKIE para evitar que cookies inválidas
    o caducadas de otras instancias o pruebas de localhost rompan la sesión.
    """

    def __init__(self, wsgi, cookie_val):
        self.wsgi = wsgi
        self.cookie_val = cookie_val

    def __call__(self, environ, start_response):
        environ['HTTP_COOKIE'] = f'session={self.cookie_val}'
        return self.wsgi(environ, start_response)


class Transport:
    """WSGI wrapper que gestiona el endpoint de parada local /__qa__/stop."""

    def __init__(self, app, server_box):
        self.app = app
        self.server_box = server_box

    def __call__(self, environ, start_response):
        if (environ.get('PATH_INFO') == '/__qa__/stop'
                and environ.get('REQUEST_METHOD') == 'POST'
                and environ.get('REMOTE_ADDR') == '127.0.0.1'):
            def _delayed_stop():
                time.sleep(0.05)
                s = self.server_box[0]
                if s:
                    s.shutdown()

            threading.Thread(target=_delayed_stop, daemon=True).start()
            body = b'{"stopping":true}'
            start_response('200 OK', [
                ('Content-Type', 'application/json'),
                ('Content-Length', str(len(body))),
                ('Connection', 'close'),
            ])
            return [body]
        return self.app(environ, start_response)


def find_path(content, start_room, target_room):
    """Encuentra el camino en grafo de salas respetando salidas canónicas."""
    if start_room == target_room:
        return []
    queue = deque([(start_room, [])])
    seen = {start_room}
    while queue:
        current, path = queue.popleft()
        if current == target_room:
            return path
        for direction, neighbor in content.rooms.get(current, {}).get('exits', {}).items():
            if neighbor not in seen:
                seen.add(neighbor)
                queue.append((neighbor, path + [direction]))
    raise ValueError(f"No hay ruta entre {start_room} y {target_room}")


def navigate_to(fixture, content, target_room):
    """Navega paso a paso ejecutando acciones reales sin teleport artificial."""
    current = fixture.state()['character']['location']
    if current == target_room:
        return
    path = find_path(content, current, target_room)
    for direction in path:
        fixture.act({'text': direction})


def run_checks():
    """Ejecuta suite focal sin levantar servidor HTTP persistente."""
    print("[QA] Iniciando fixture efímera RpgParityTests...")
    fixture = RpgParityTests()
    fixture.setUp()
    content = Content(ROOT / 'content')

    try:
        # 1. Comprobación de existencia de salas canónicas en content
        print("[QA] 1/5: Comprobando 5 salas canónicas de Edran Norte en Content...")
        for rid in NORTH_ROOMS:
            assert rid in content.rooms, f"Falta sala canónica: {rid}"
        print("  -> 5 salas canónicas presentes.")

        # 2. Navegación real desde plaza hasta edran_terraplen
        print("[QA] 2/5: Navegando ruta real desde plaza hasta edran_terraplen...")
        navigate_to(fixture, content, 'edran_terraplen')
        loc = fixture.state()['character']['location']
        assert loc == 'edran_terraplen', f"Esperado edran_terraplen, obtenido {loc}"
        print("  -> Llegada a edran_terraplen verificada por ruta canónica.")

        # 3. Cobertura de las 11 salidas legales con rebotes
        print("[QA] 3/5: Recorriendo las 11 salidas legales bidireccionales...")
        for direction, expected in ELEVEN_EXITS_STEPS:
            fixture.act({'text': direction})
            current = fixture.state()['character']['location']
            assert current == expected, f"Fallo al mover al {direction}: esperado {expected}, obtenido {current}"
        print("  -> 11 salidas legales navegadas y verificadas con éxito.")

        # 4. Causalidad narrativa real: Bren y Aren
        print("[QA] 4/5: Verificando causalidad narrativa de Bren y Aren sin inyección de flags...")
        # Bren en valdren_cobertizo
        navigate_to(fixture, content, 'valdren_cobertizo')
        assert fixture.state()['character']['location'] == 'valdren_cobertizo'
        res_bren = fixture.act(fixture.offered('edran_comprobar_rueda'))
        assert any('cuña' in j.lower() for j in res_bren.get('journal', [])), "Diario de Bren no registrado"
        print("  -> Acción real con Bren completada (edran_rueda_comprobada).")

        # Aren en edran_casa_camino
        navigate_to(fixture, content, 'edran_casa_camino')
        assert fixture.state()['character']['location'] == 'edran_casa_camino'

        # Diálogo inicial nota
        res_nota = fixture.act({'id': 'hablar', 'target': 'edran_aren', 'topic': 'nota'})
        assert res_nota, "Fallo al hablar sobre tema 'nota' con Aren"

        # Lectura de nota (+3 XP, flag edran_nota_leida)
        xp_before = fixture.state()['character']['xp']
        fixture.act(fixture.offered('edran_leer_nota'))
        xp_after_read = fixture.state()['character']['xp']
        assert xp_after_read >= xp_before + 3, f"Esperado +3 XP, obtenido {xp_after_read - xp_before}"
        print("  -> edran_leer_nota completado (+3 XP).")

        # Corrección de mensaje (+25 XP, flag edran_mensaje_aclarado)
        fixture.act(fixture.offered('edran_corregir_mensaje'))
        xp_after_corr = fixture.state()['character']['xp']
        assert xp_after_corr >= xp_after_read + 25, f"Esperado +25 XP, obtenido {xp_after_corr - xp_after_read}"
        print("  -> edran_corregir_mensaje completado (+25 XP).")

        # Diálogo aclarado
        res_corr = fixture.act({'id': 'hablar', 'target': 'edran_aren', 'topic': 'correccion'})
        assert res_corr, "Fallo al hablar sobre tema 'correccion' con Aren"

        # Revisita de estado
        casa_state = fixture.state()
        assert casa_state['room']['id'] == 'edran_casa_camino'
        print("  -> Causalidad narrativa de Aren comprobada con éxito.")

        # 5. Encuentros canónicos y salteador bravucón forzado por RNG determinista
        print("[QA] 5/5: Verificando encuentros canónicos y Salteador bravucón en edran_vista_cuenca...")
        # Validar wildlife pools en Content
        assert any(c['creature'] == 'cornalomo' for c in content.rooms['edran_terraplen'].get('wildlife_pool', []))
        assert any(c['creature'] == 'cornalomo' for c in content.rooms['edran_calzada'].get('wildlife_pool', []))
        assert any(c['creature'] == 'salteador_veterano' for c in content.rooms['edran_hito_campos'].get('wildlife_pool', []))
        assert any(c['creature'] == 'salteador_bravucon' for c in content.rooms['edran_vista_cuenca'].get('wildlife_pool', []))

        # En la fixture con RNG: Mock(random=Mock(return_value=0)), bravucón aparece deterministamente
        navigate_to(fixture, content, 'edran_vista_cuenca')
        cuenca_state = fixture.state()
        bravucon_actions = [a for a in cuenca_state['actions'] if a.get('target') == 'salteador_bravucon']
        action_ids = {a['id'] for a in bravucon_actions}
        assert 'examinar_criatura' in action_ids, "Falta examinar_criatura para bravucon"
        assert 'evaluar' in action_ids, "Falta evaluar para bravucon"
        assert 'hablar_adversario' in action_ids, "Falta hablar_adversario para bravucon"
        assert 'combatir' in action_ids, "Falta combatir para bravucon"

        topics = {a.get('topic') for a in bravucon_actions if a['id'] == 'hablar_adversario'}
        assert {'qué quieres', 'por qué', 'dejar paso'}.issubset(topics), f"Temas insuficientes: {topics}"
        print("  -> Acciones ofrecidas antes de combate verificadas para salteador_bravucon nivel 2.")

        print("\n[QA] TODAS LAS PRUEBAS FOCALES DE EDRAN NORTE PASARON EXITOSAMENTE.")
    finally:
        fixture.doCleanups()
        print("[QA] Teardown completado: SQLite efímero cerrado y limpiado.")


def run_startup_test(port=8776):
    """Prueba focal de arranque del servidor WSGI y parada limpia por /__qa__/stop."""
    print(f"[QA] Probando arranque focal del servidor en puerto {port}...")
    fixture = RpgParityTests()
    fixture.setUp()
    content = Content(ROOT / 'content')
    server = None
    try:
        navigate_to(fixture, content, 'edran_terraplen')
        fixture.clock.side_effect = time.time

        with fixture.client.session_transaction() as sess:
            cookie_dict = dict(sess)
        serializer = fixture.app.session_interface.get_signing_serializer(fixture.app)
        cookie_val = serializer.dumps(cookie_dict)

        app = AutoLogin(fixture.app, cookie_val)
        server_box = [None]
        transport = Transport(app, server_box)

        server = make_server('127.0.0.1', port, transport)
        server_box[0] = server
        actual_port = server.server_port

        server_thread = threading.Thread(target=server.serve_forever, daemon=True)
        server_thread.start()

        # Probar GET /rpg
        req = urllib.request.Request(f'http://127.0.0.1:{actual_port}/rpg')
        with urllib.request.urlopen(req, timeout=5) as res:
            assert res.status == 200, f"GET /rpg status {res.status}"
            assert 'text/html' in res.headers.get('Content-Type', '')

        # Probar POST /__qa__/stop
        stop_req = urllib.request.Request(
            f'http://127.0.0.1:{actual_port}/__qa__/stop',
            data=b'{}',
            headers={'Content-Type': 'application/json'},
            method='POST',
        )
        with urllib.request.urlopen(stop_req, timeout=5) as res:
            assert res.status == 200
            data = json.loads(res.read().decode('utf-8'))
            assert data.get('stopping') is True

        server_thread.join(timeout=5)
        assert not server_thread.is_alive(), "El servidor no se detuvo tras /__qa__/stop"
        print(f"[QA] Prueba de arranque en puerto {actual_port} superada: GET 200 y POST /__qa__/stop 200 OK.")
    finally:
        if server:
            server.server_close()
        fixture.doCleanups()
        print("[QA] Teardown completado: SQLite efímero y servidor cerrados.")


def run_server(port=8776):
    """Inicia servidor interactivo WSGI con AutoLogin y startroom en edran_terraplen."""
    fixture = RpgParityTests()
    fixture.setUp()
    content = Content(ROOT / 'content')
    server = None
    try:
        navigate_to(fixture, content, 'edran_terraplen')
        fixture.clock.side_effect = time.time

        with fixture.client.session_transaction() as sess:
            cookie_dict = dict(sess)
        serializer = fixture.app.session_interface.get_signing_serializer(fixture.app)
        cookie_val = serializer.dumps(cookie_dict)

        app = AutoLogin(fixture.app, cookie_val)
        server_box = [None]
        transport = Transport(app, server_box)

        server = make_server('127.0.0.1', port, transport)
        server_box[0] = server
        print(f"Isolated Edran Norte QA: http://127.0.0.1:{server.server_port}/rpg; POST /__qa__/stop to close", flush=True)
        try:
            server.serve_forever()
        finally:
            server.server_close()
    finally:
        fixture.doCleanups()
        print("Temporary SQLite and server closed", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8776, help="Puerto para servidor WSGI (default: 8776)")
    parser.add_argument('--server', action='store_true', help="Levantar servidor WSGI efímero con AutoLogin")
    parser.add_argument('--check', action='store_true', help="Ejecutar suite focal de comprobaciones")
    parser.add_argument('--test-startup', action='store_true', help="Prueba focal de arranque y cierre por /__qa__/stop")
    args = parser.parse_args()

    if args.check:
        run_checks()
    elif args.test_startup:
        run_startup_test(args.port)
    elif args.server:
        run_server(args.port)
    elif any(arg.startswith('--port') for arg in sys.argv):
        run_server(args.port)
    else:
        # Por defecto ejecuta checks seguros sin dejar servidor colgado
        run_checks()


if __name__ == '__main__':
    main()
