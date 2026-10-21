#!/usr/bin/env python3
"""Runner focal y fixture WSGI desechable para QA de las 6 salas restantes de Edran.

Diseñado para validación de las 6 salas canónicas (loma, prado, ladera_piedra,
linde_piedra, sendero_juncos, puente_juncos), las 14 salidas legales exactas
repartidas en dos componentes (Loma->Korven y Sendero->Lethra/Sauces), tránsito
canónico intercomponente sin teletransporte, y fauna/acciones canónicas.

Soporta:
- WSGI server efímero en --port (default 8777) iniciando en edran_loma
  mediante ruta canónica real desde la plaza de Valdren.
- AutoLogin con CSRF aislado y cierre limpio POST /__qa__/stop.
- Comprobaciones focales (--check o por defecto) sin servidor persistente.
- Prueba focal de arranque y parada limpia (--test-startup, compatible con --port 0).
"""
import argparse
import importlib.util
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

# Reutilización del helper existente qa-rpg-edran-norte.py evitando duplicación
NORTE_SCRIPT = Path(__file__).parent / 'qa-rpg-edran-norte.py'
spec = importlib.util.spec_from_file_location('qa_rpg_edran_norte', NORTE_SCRIPT)
qa_norte = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa_norte)

AutoLogin = qa_norte.AutoLogin
Transport = qa_norte.Transport
find_path = qa_norte.find_path
navigate_to = qa_norte.navigate_to

REMAINING_ROOMS = [
    'edran_loma',
    'edran_prado',
    'edran_ladera_piedra',
    'edran_linde_piedra',
    'edran_sendero_juncos',
    'edran_puente_juncos',
]

COMPONENT_1_STEPS = [
    ('este', 'edran_lindero'),       # 1. loma -> lindero
    ('oeste', 'edran_loma'),         # retorno
    ('sur', 'edran_parcela_vieja'),  # 2. loma -> parcela_vieja
    ('norte', 'edran_loma'),         # retorno
    ('norte', 'edran_prado'),        # 3. loma -> prado
    ('sur', 'edran_loma'),           # 4. prado -> loma
    ('norte', 'edran_prado'),        # retorno
    ('oeste', 'edran_ladera_piedra'),# 5. prado -> ladera_piedra
    ('este', 'edran_prado'),         # 6. ladera_piedra -> prado
    ('oeste', 'edran_ladera_piedra'),# retorno
    ('norte', 'edran_linde_piedra'), # 7. ladera_piedra -> linde_piedra
    ('sur', 'edran_ladera_piedra'),  # 8. linde_piedra -> ladera_piedra
    ('norte', 'edran_linde_piedra'), # retorno
    ('norte', 'korven_borde_tierra'),# 9. linde_piedra -> korven_borde_tierra
    ('sur', 'edran_linde_piedra'),   # retorno
]

COMPONENT_2_STEPS = [
    ('oeste', 'edran_reparo'),          # 10. sendero_juncos -> reparo
    ('este', 'edran_sendero_juncos'),   # retorno
    ('este', 'edran_puente_juncos'),    # 11. sendero_juncos -> puente_juncos
    ('oeste', 'edran_sendero_juncos'),  # 12. puente_juncos -> sendero_juncos
    ('este', 'edran_puente_juncos'),    # retorno
    ('este', 'lethra_hito_tierra'),     # 13. puente_juncos -> lethra_hito_tierra
    ('oeste', 'edran_puente_juncos'),   # retorno
    ('sur', 'edran_sauces'),            # 14. puente_juncos -> sauces
    ('este', 'edran_puente_juncos'),    # retorno
]


def _text_has(res, needle):
    narr = res.get('narrative', [])
    return any(needle.lower() in p.get('text', '').lower() for p in narr if isinstance(p, dict))


def run_checks():
    """Ejecuta suite focal sin levantar servidor HTTP persistente."""
    print("[QA] Iniciando fixture efímera RpgParityTests...")
    fixture = RpgParityTests()
    fixture.setUp()
    content = Content(ROOT / 'content')

    try:
        # 1. Comprobación de existencia de las 6 salas canónicas en Content
        print("[QA] 1/5: Comprobando 6 salas canónicas de Edran restante en Content...")
        for rid in REMAINING_ROOMS:
            assert rid in content.rooms, f"Falta sala canónica: {rid}"
        print("  -> 6 salas canónicas presentes.")

        # 2. Comprobación de fauna y acciones en Content
        print("[QA] 2/5: Verificando definición de fauna y salidas canónicas en Content...")
        assert any(c['creature'] == 'espinajo_rastrojo' for c in content.rooms['edran_loma'].get('wildlife_pool', []))
        assert any(c['creature'] == 'cornalomo' for c in content.rooms['edran_prado'].get('signals', []))
        assert any(c['creature'] == 'espinajo_rastrojo' for c in content.rooms['edran_prado'].get('wildlife_pool', []))
        assert any(c['creature'] == 'salteadora_negociante' for c in content.rooms['edran_prado'].get('wildlife_pool', []))
        assert any(c['creature'] == 'espinajo_rastrojo' for c in content.rooms['edran_ladera_piedra'].get('wildlife_pool', []))
        assert any(c['creature'] == 'mordelinde' for c in content.rooms['edran_linde_piedra'].get('wildlife_pool', []))
        assert any(c['creature'] == 'cornalomo' for c in content.rooms['edran_linde_piedra'].get('wildlife_pool', []))
        assert any(c['creature'] == 'forajido_camino' for c in content.rooms['edran_sendero_juncos'].get('wildlife_pool', []))
        assert any(c['creature'] == 'salteador_veterano' for c in content.rooms['edran_puente_juncos'].get('wildlife_pool', []))
        print("  -> Definición de fauna canónica verificada en Content.")

        # 3. Navegación canónica desde spawn inicial hasta edran_loma
        print("[QA] 3/5: Navegando ruta canónica inicial hasta edran_loma...")
        navigate_to(fixture, content, 'edran_loma')
        loc = fixture.state()['character']['location']
        assert loc == 'edran_loma', f"Esperado edran_loma, obtenido {loc}"
        print("  -> Llegada a edran_loma verificada por ruta canónica.")

        # 4. Cobertura de las 14 salidas legales con decisiones ofrecidas y tránsito canónico
        print("[QA] 4/5: Recorriendo las 14 salidas legales en ambos componentes...")
        # Componente 1: Loma -> Korven (9 salidas)
        for direction, expected in COMPONENT_1_STEPS:
            choice = fixture.offered('mover', direction)
            fixture.act(choice)
            current = fixture.state()['character']['location']
            assert current == expected, f"Fallo al mover al {direction}: esperado {expected}, obtenido {current}"
        print("  -> Componente 1 (9 salidas Loma->Korven) verificado con éxito.")

        # Tránsito canónico entre componentes sin teletransporte
        print("  -> Realizando tránsito canónico hacia edran_sendero_juncos...")
        navigate_to(fixture, content, 'edran_sendero_juncos')
        loc = fixture.state()['character']['location']
        assert loc == 'edran_sendero_juncos', f"Esperado edran_sendero_juncos, obtenido {loc}"

        # Componente 2: Sendero -> Lethra / Sauces (5 salidas)
        for direction, expected in COMPONENT_2_STEPS:
            choice = fixture.offered('mover', direction)
            fixture.act(choice)
            current = fixture.state()['character']['location']
            assert current == expected, f"Fallo al mover al {direction}: esperado {expected}, obtenido {current}"
        print("  -> Componente 2 (5 salidas Sendero->Lethra/Sauces) verificado con éxito.")
        print("  -> Total 14 salidas legales navegadas y verificadas con éxito.")

        # 5. Presencia y acciones de fauna y entorno en tiempo de ejecución
        print("[QA] 5/5: Verificando decisiones ofrecidas de entorno y fauna en las salas...")
        navigate_to(fixture, content, 'edran_loma')
        res_loma = fixture.act(fixture.offered('examinar', 'parcelas'))
        assert _text_has(res_loma, 'parcela'), "Fallo al examinar parcelas en edran_loma"

        navigate_to(fixture, content, 'edran_prado')
        res_prado = fixture.act({'id': 'examinar_criatura', 'target': 'cornalomo'})
        assert _text_has(res_prado, 'cornalomo'), "Fallo al examinar cornalomo en edran_prado"

        navigate_to(fixture, content, 'edran_ladera_piedra')
        res_ladera = fixture.act(fixture.offered('examinar', 'cuerda'))
        assert _text_has(res_ladera, 'cuerda') or _text_has(res_ladera, 'peso'), "Fallo al examinar cuerda en edran_ladera_piedra"

        navigate_to(fixture, content, 'edran_linde_piedra')
        res_linde = fixture.act(fixture.offered('examinar', 'rodadas'))
        assert _text_has(res_linde, 'rodadas') or _text_has(res_linde, 'descargar'), "Fallo al examinar rodadas en edran_linde_piedra"
        res_linde_look = fixture.act(fixture.offered('mirar_direccion', 'norte'))
        assert _text_has(res_linde_look, 'roca') or _text_has(res_linde_look, 'puerta'), "Fallo al mirar al norte en edran_linde_piedra"

        navigate_to(fixture, content, 'edran_sendero_juncos')
        res_sendero = fixture.act(fixture.offered('examinar', 'suelo'))
        assert _text_has(res_sendero, 'suelo') or _text_has(res_sendero, 'peso'), "Fallo al examinar suelo en edran_sendero_juncos"

        navigate_to(fixture, content, 'edran_puente_juncos')
        res_puente = fixture.act(fixture.offered('examinar', 'apoyos'))
        assert _text_has(res_puente, 'apoyos') or _text_has(res_puente, 'madera'), "Fallo al examinar apoyos en edran_puente_juncos"
        res_puente_look = fixture.act(fixture.offered('mirar_direccion', 'este'))
        assert _text_has(res_puente_look, 'lethra') or _text_has(res_puente_look, 'orilla'), "Fallo al mirar al este en edran_puente_juncos"
        print("  -> Interacciones de entorno y fauna verificadas en las salas.")

        print("\n[QA] TODAS LAS PRUEBAS FOCALES DE EDRAN RESTANTE PASARON EXITOSAMENTE.")
    finally:
        fixture.doCleanups()
        print("[QA] Teardown completado: SQLite efímero cerrado y limpiado.")


def run_startup_test(port=8777):
    """Prueba focal de arranque del servidor WSGI y parada limpia por /__qa__/stop."""
    print(f"[QA] Probando arranque focal del servidor en puerto {port}...")
    fixture = RpgParityTests()
    fixture.setUp()
    content = Content(ROOT / 'content')
    server = None
    server_thread = None
    try:
        navigate_to(fixture, content, 'edran_loma')
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

        # Sesión CSRF autenticada y consulta de estado
        base = f'http://127.0.0.1:{actual_port}'
        with urllib.request.urlopen(base + '/api/state', timeout=5) as res:
            snapshot = json.load(res)
        assert snapshot['authenticated'] and snapshot['character']['id'] == fixture.cid
        assert snapshot['character']['location'] == 'edran_loma'

        # Decisión ofrecida vía API
        decision = urllib.request.Request(
            base + '/api/action',
            data=json.dumps({'id': 'mirar', 'request_id': 'restante-startup-check'}).encode(),
            headers={'Content-Type': 'application/json', 'X-CSRF-Token': snapshot['csrf_token']},
            method='POST',
        )
        with urllib.request.urlopen(decision, timeout=5) as res:
            assert json.load(res)['character']['id'] == fixture.cid

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
            if server_thread and server_thread.is_alive():
                server.shutdown()
                server_thread.join(timeout=5)
            server.server_close()
        fixture.doCleanups()
        print("[QA] Teardown completado: SQLite efímero y servidor cerrados.")


def run_server(port=8777):
    """Inicia servidor interactivo WSGI con AutoLogin y startroom en edran_loma."""
    fixture = RpgParityTests()
    fixture.setUp()
    content = Content(ROOT / 'content')
    server = None
    try:
        navigate_to(fixture, content, 'edran_loma')
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
        print(f"Isolated Edran Restante QA: http://127.0.0.1:{server.server_port}/rpg; POST /__qa__/stop to close", flush=True)
        try:
            server.serve_forever()
        finally:
            server.server_close()
    finally:
        fixture.doCleanups()
        print("Temporary SQLite and server closed", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8777, help="Puerto para servidor WSGI (default: 8777)")
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
        run_checks()


if __name__ == '__main__':
    main()
