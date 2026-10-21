#!/usr/bin/env python3
"""Runner focal y fixture WSGI desechable para QA de las primeras 6 salas de Korven.

Diseñado para validación canónica de las 6 salas iniciales (korven_borde_tierra,
korven_senda_viento, korven_almacen_grano, brumak_centro, korven_peldanos_cortos,
korven_taller_juntas), las 14 salidas legales exactas mediante acciones ofrecidas
con rebotes, ruta canónica real desde la plaza de Valdren sin teletransporte ni
inyección de flags de depuración, presencia y tópicos reales de NPCs (Ved, Beran),
acción canónica de entrada pedir_permiso_brumak y fauna canónica (Cascapedernal,
Colagrieta, Quebrarrocas).

Soporta:
- WSGI server efímero en --port (default 8778) iniciando en korven_borde_tierra
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

KORVEN_ROOMS = [
    'korven_borde_tierra',
    'korven_senda_viento',
    'korven_almacen_grano',
    'brumak_centro',
    'korven_peldanos_cortos',
    'korven_taller_juntas',
]

# 14 salidas legales exactas de las 6 salas de Korven recorridas por acciones ofrecidas y rebotes
KORVEN_EXITS_STEPS = [
    # korven_borde_tierra (2 salidas)
    ('sur', 'edran_linde_piedra'),      # Salida 1: borde_tierra -> edran_linde_piedra
    ('norte', 'korven_borde_tierra'),   # rebote
    ('norte', 'korven_senda_viento'),   # Salida 2: borde_tierra -> senda_viento

    # korven_senda_viento (2 salidas)
    ('sur', 'korven_borde_tierra'),     # Salida 3: senda_viento -> borde_tierra
    ('norte', 'korven_senda_viento'),   # rebote
    ('este', 'korven_almacen_grano'),   # Salida 4: senda_viento -> almacen_grano

    # korven_almacen_grano (2 salidas)
    ('oeste', 'korven_senda_viento'),   # Salida 5: almacen_grano -> senda_viento
    ('este', 'korven_almacen_grano'),   # rebote
    ('este', 'brumak_centro'),          # Salida 6: almacen_grano -> brumak_centro

    # brumak_centro (4 salidas)
    ('oeste', 'korven_almacen_grano'),  # Salida 7: brumak_centro -> almacen_grano
    ('este', 'brumak_centro'),          # rebote
    ('sur', 'korven_calle_fachadas'),   # Salida 8: brumak_centro -> calle_fachadas
    ('norte', 'brumak_centro'),         # rebote
    ('norte', 'korven_taller_juntas'),  # Salida 9: brumak_centro -> taller_juntas

    # korven_taller_juntas (1 salida)
    ('sur', 'brumak_centro'),           # Salida 10: taller_juntas -> brumak_centro

    # paso hacia peldanos_cortos
    ('este', 'korven_peldanos_cortos'), # Salida 11: brumak_centro -> peldanos_cortos

    # korven_peldanos_cortos (3 salidas)
    ('este', 'korven_asiento_revision'),# Salida 12: peldanos_cortos -> asiento_revision
    ('oeste', 'korven_peldanos_cortos'),# rebote
    ('sur', 'korven_almacen_entrada'),  # Salida 13: peldanos_cortos -> almacen_entrada
    ('norte', 'korven_peldanos_cortos'),# rebote
    ('oeste', 'brumak_centro'),         # Salida 14: peldanos_cortos -> brumak_centro
    ('este', 'korven_peldanos_cortos'), # rebote
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
        print("[QA] 1/5: Comprobando 6 salas canónicas de Korven en Content...")
        for rid in KORVEN_ROOMS:
            assert rid in content.rooms, f"Falta sala canónica: {rid}"
        print("  -> 6 salas canónicas presentes.")

        # 2. Comprobación de fauna y NPCs canónicos en Content
        print("[QA] 2/5: Verificando definición de fauna y NPCs en Content...")
        expected_fauna = {'cascapedernal', 'colagrieta', 'quebrarrocas'}
        for f_id in expected_fauna:
            assert f_id in content.creatures, f"Falta criatura canónica en content.creatures: {f_id}"

        # Fauna en wildlife_pools de salas
        assert any(c['creature'] in expected_fauna for c in content.rooms['korven_borde_tierra'].get('wildlife_pool', []))
        assert any(c['creature'] in expected_fauna for c in content.rooms['korven_senda_viento'].get('wildlife_pool', []))
        assert any(c['creature'] in expected_fauna for c in content.rooms['korven_peldanos_cortos'].get('wildlife_pool', []))

        # NPCs canónicos en Content
        assert 'korven_ved' in content.npcs, "Falta korven_ved en content.npcs"
        assert 'korven_beran' in content.npcs, "Falta korven_beran en content.npcs"
        assert 'korven_ved' in content.rooms['korven_peldanos_cortos'].get('npcs', [])
        assert 'korven_beran' in content.rooms['korven_taller_juntas'].get('npcs', [])
        print("  -> Fauna (Cascapedernal, Colagrieta, Quebrarrocas) y NPCs (Ved, Beran) verificados en Content.")

        # 3. Navegación canónica desde spawn inicial en Valdren hasta korven_borde_tierra
        print("[QA] 3/5: Navegando ruta canónica inicial desde Valdren hasta korven_borde_tierra...")
        navigate_to(fixture, content, 'korven_borde_tierra')
        loc = fixture.state()['character']['location']
        assert loc == 'korven_borde_tierra', f"Esperado korven_borde_tierra, obtenido {loc}"
        print("  -> Llegada a korven_borde_tierra verificada por ruta canónica sin teleport ni flags.")

        # 4. Cobertura de las 14 salidas legales con acciones ofrecidas y rebotes
        print("[QA] 4/5: Recorriendo las 14 salidas legales con acciones ofrecidas y rebotes...")
        for direction, expected in KORVEN_EXITS_STEPS:
            choice = fixture.offered('mover', direction)
            fixture.act(choice)
            current = fixture.state()['character']['location']
            assert current == expected, f"Fallo al mover al {direction}: esperado {expected}, obtenido {current}"
        print("  -> Total 14 salidas legales navegadas y verificadas con éxito.")

        # 5. Presencia y decisiones ofrecidas reales en tiempo de ejecución
        print("[QA] 5/5: Verificando decisiones ofrecidas de entorno, NPCs y fauna en tiempo de ejecución...")

        # Examen en korven_borde_tierra
        navigate_to(fixture, content, 'korven_borde_tierra')
        res_zanja = fixture.act(fixture.offered('examinar', 'zanja'))
        assert _text_has(res_zanja, 'arena') or _text_has(res_zanja, 'zanja'), "Fallo al examinar zanja en korven_borde_tierra"

        # Ved en korven_peldanos_cortos: tópicos reales y acción pedir_permiso_brumak
        navigate_to(fixture, content, 'korven_peldanos_cortos')
        st_peldanos = fixture.state()
        peldanos_actions = st_peldanos['actions']

        # Verificar tópicos ofrecidos de Ved
        ved_topics = [a['topic'] for a in peldanos_actions if a['id'] == 'hablar' and a.get('target') == 'korven_ved']
        assert 'entrada' in ved_topics, "Falta tópico 'entrada' en Ved"
        assert 'peligro' in ved_topics, "Falta tópico 'peligro' en Ved"

        # Diálogo real de entrada con Ved
        res_ved_talk = fixture.act({'id': 'hablar', 'target': 'korven_ved', 'topic': 'entrada'})
        assert _text_has(res_ved_talk, 'tablilla') or _text_has(res_ved_talk, 'nombre'), "Fallo en diálogo de entrada de Ved"

        # Acción canónica pedir_permiso_brumak (sin asumir flag por diálogo)
        assert any(a['id'] == 'pedir_permiso_brumak' for a in peldanos_actions), "Falta acción pedir_permiso_brumak en peldanos_cortos"
        res_permiso = fixture.act(fixture.offered('pedir_permiso_brumak'))
        assert _text_has(res_permiso, 'autorizada') or _text_has(res_permiso, 'tablilla'), "Fallo al ejecutar pedir_permiso_brumak"

        # Beran en korven_taller_juntas: tópicos reales sin compra ni afinado inventados
        navigate_to(fixture, content, 'korven_taller_juntas')
        st_taller = fixture.state()
        taller_actions = st_taller['actions']

        beran_topics = [a['topic'] for a in taller_actions if a['id'] == 'hablar' and a.get('target') == 'korven_beran']
        assert 'afinado' in beran_topics, "Falta tópico 'afinado' en Beran"
        assert 'armas' in beran_topics, "Falta tópico 'armas' en Beran"
        assert 'taren' in beran_topics, "Falta tópico 'taren' en Beran"

        # Conversación real sobre afinado con Beran
        res_beran_talk = fixture.act({'id': 'hablar', 'target': 'korven_beran', 'topic': 'afinado'})
        assert _text_has(res_beran_talk, 'afinar') or _text_has(res_beran_talk, 'sellos'), "Fallo en diálogo de afinado de Beran"

        # Examen en taller_juntas
        res_dibujos = fixture.act(fixture.offered('examinar', 'dibujos'))
        assert _text_has(res_dibujos, 'junta') or _text_has(res_dibujos, 'medir'), "Fallo al examinar dibujos en korven_taller_juntas"

        print("  -> Presencia de Ved, permiso de Brumak, Beran y entorno verificados con éxito.")
        print("\n[QA] TODAS LAS COMPROBACIONES FOCALES DE KORVEN 01 PASARON EXITOSAMENTE.")
    finally:
        fixture.doCleanups()
        print("[QA] Teardown completado: SQLite efímero cerrado y limpiado.")


def run_startup_test(port=8778):
    """Prueba focal de arranque del servidor WSGI y parada limpia por /__qa__/stop."""
    print(f"[QA] Probando arranque focal del servidor en puerto {port}...")
    fixture = RpgParityTests()
    fixture.setUp()
    content = Content(ROOT / 'content')
    server = None
    server_thread = None
    try:
        navigate_to(fixture, content, 'korven_borde_tierra')
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
        assert snapshot['character']['location'] == 'korven_borde_tierra'

        # Decisión ofrecida vía API
        decision = urllib.request.Request(
            base + '/api/action',
            data=json.dumps({'id': 'mirar', 'request_id': 'korven-startup-check'}).encode(),
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


def run_server(port=8778):
    """Inicia servidor interactivo WSGI con AutoLogin y startroom en korven_borde_tierra."""
    fixture = RpgParityTests()
    fixture.setUp()
    content = Content(ROOT / 'content')
    server = None
    try:
        navigate_to(fixture, content, 'korven_borde_tierra')
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
        print(f"Isolated Korven 01 QA: http://127.0.0.1:{server.server_port}/rpg; POST /__qa__/stop to close", flush=True)
        try:
            server.serve_forever()
        finally:
            server.server_close()
    finally:
        fixture.doCleanups()
        print("Temporary SQLite and server closed", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8778, help="Puerto para servidor WSGI (default: 8778)")
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
