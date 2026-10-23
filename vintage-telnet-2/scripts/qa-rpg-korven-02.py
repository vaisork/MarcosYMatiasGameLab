#!/usr/bin/env python3
"""Runner focal y fixture WSGI desechable para QA de Korven 02.

Siete salas: korven_almacen_entrada, korven_almacen_balanzas, korven_almacen_cruce,
korven_almacen_lateral, korven_almacen_fondo, korven_calle_fachadas y
korven_sala_cuidados. Recorre las 15 salidas legales con acciones ofrecidas y
rebotes, llega por ruta canónica desde Valdren (sin teletransporte ni flags de
depuración) y comprueba tópicos reales de Ruma y Neru y la señal del salteador.

- --check (por defecto): comprobaciones focales sin servidor persistente.
- --test-startup: arranque WSGI, GET /rpg, /api/state, acción y parada limpia.
- --server/--port: servidor efímero con AutoLogin iniciando en la puerta del almacén.
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
    import werkzeug  # noqa: F401
except ImportError:
    if VENV_PY.exists() and sys.executable != str(VENV_PY):
        os.execv(str(VENV_PY), [str(VENV_PY)] + sys.argv)
    raise

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from server.content import Content
from tests.test_rpg_parity import RpgParityTests
from werkzeug.serving import make_server

# Reutiliza AutoLogin, Transport y navegación canónica del helper de Edran norte.
spec = importlib.util.spec_from_file_location('qa_rpg_edran_norte', Path(__file__).parent / 'qa-rpg-edran-norte.py')
qa_norte = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa_norte)
AutoLogin, Transport, navigate_to = qa_norte.AutoLogin, qa_norte.Transport, qa_norte.navigate_to

START = 'korven_almacen_entrada'
KORVEN_ROOMS = [
    'korven_almacen_entrada', 'korven_almacen_balanzas', 'korven_almacen_cruce',
    'korven_almacen_lateral', 'korven_almacen_fondo', 'korven_calle_fachadas',
    'korven_sala_cuidados',
]
# (sala de partida, dirección, destino); None en la sala marca un rebote.
ALMACEN_STEPS = [
    ('korven_almacen_entrada', 'norte', 'korven_peldanos_cortos'),
    (None, 'sur', 'korven_almacen_entrada'),
    ('korven_almacen_entrada', 'oeste', 'korven_almacen_balanzas'),
    ('korven_almacen_balanzas', 'este', 'korven_almacen_entrada'),
    ('korven_almacen_entrada', 'sur', 'korven_almacen_cruce'),
    ('korven_almacen_cruce', 'norte', 'korven_almacen_entrada'),
    (None, 'sur', 'korven_almacen_cruce'),
    ('korven_almacen_cruce', 'este', 'korven_almacen_lateral'),
    ('korven_almacen_lateral', 'oeste', 'korven_almacen_cruce'),
    (None, 'este', 'korven_almacen_lateral'),
    ('korven_almacen_lateral', 'sur', 'korven_almacen_fondo'),
    ('korven_almacen_fondo', 'este', 'korven_almacen_lateral'),
    (None, 'sur', 'korven_almacen_fondo'),
    ('korven_almacen_fondo', 'norte', 'korven_almacen_cruce'),
    ('korven_almacen_cruce', 'sur', 'korven_almacen_fondo'),
]
CALLE_STEPS = [
    ('korven_calle_fachadas', 'norte', 'brumak_centro'),
    (None, 'sur', 'korven_calle_fachadas'),
    ('korven_calle_fachadas', 'este', 'korven_sala_cuidados'),
    ('korven_sala_cuidados', 'oeste', 'korven_calle_fachadas'),
    ('korven_calle_fachadas', 'sur', 'korven_cisterna_comun'),
]


def _text_has(res, *needles):
    text = ' '.join(p.get('text', '') for p in res.get('narrative', []) if isinstance(p, dict)).lower()
    return any(n.lower() in text for n in needles)


def _walk(fixture, steps, legal):
    for room, direction, expected in steps:
        fixture.act(fixture.offered('mover', direction))
        current = fixture.state()['character']['location']
        assert current == expected, f'{direction}: esperado {expected}, obtenido {current}'
        if room:
            legal.add((room, direction))


def _topics(fixture, npc):
    return {a['topic'] for a in fixture.state()['actions'] if a['id'] == 'hablar' and a.get('target') == npc}


def run_checks():
    fixture = RpgParityTests()
    fixture.setUp()
    content = Content(ROOT / 'content')
    try:
        print('[QA] 1/5: salas, NPCs y señal canónicos en Content...')
        for rid in KORVEN_ROOMS:
            assert rid in content.rooms, f'Falta sala canónica: {rid}'
        assert content.rooms['korven_almacen_entrada']['npcs'] == ['korven_ruma']
        assert content.rooms['korven_sala_cuidados']['npcs'] == ['korven_neru']
        assert [s['creature'] for s in content.rooms['korven_almacen_cruce']['signals']] == ['forajido_camino']
        expected = {(rid, d) for rid in KORVEN_ROOMS for d in content.rooms[rid]['exits']}
        assert len(expected) == 15, len(expected)

        print('[QA] 2/5: ruta canónica desde Valdren hasta la puerta del almacén...')
        navigate_to(fixture, content, START)
        assert fixture.state()['character']['location'] == START

        print('[QA] 3/5: 15 salidas legales con acciones ofrecidas y rebotes...')
        legal = set()
        _walk(fixture, ALMACEN_STEPS, legal)
        navigate_to(fixture, content, 'korven_calle_fachadas')
        _walk(fixture, CALLE_STEPS, legal)
        assert legal == expected, sorted(expected ^ legal)
        print(f'  -> {len(legal)} salidas legales navegadas.')

        print('[QA] 4/5: Ruma, balanza y señal del cruce...')
        navigate_to(fixture, content, START)
        assert {'almacén', 'balanza', 'forajidos', 'materiales'} <= _topics(fixture, 'korven_ruma')
        assert _text_has(fixture.act({'id': 'hablar', 'target': 'korven_ruma', 'topic': 'almacén'}), 'balanza', 'muescas')
        navigate_to(fixture, content, 'korven_almacen_balanzas')
        assert _text_has(fixture.act(fixture.offered('examinar', 'balanza')), 'placa')
        navigate_to(fixture, content, 'korven_almacen_cruce')
        assert _text_has(fixture.act(fixture.offered('examinar', 'rayas')), 'carga', 'marcas')

        print('[QA] 5/5: Neru y casa de cuidados...')
        navigate_to(fixture, content, 'korven_sala_cuidados')
        assert {'atención', 'salida', 'descansar'} <= _topics(fixture, 'korven_neru')
        assert _text_has(fixture.act({'id': 'hablar', 'target': 'korven_neru', 'topic': 'atención'}), 'sellos')
        print('\n[QA] TODAS LAS COMPROBACIONES FOCALES DE KORVEN 02 PASARON.')
    finally:
        fixture.doCleanups()
        print('[QA] Teardown completado: SQLite efímero cerrado.')


def _serve(port):
    """Prepara fixture en START y devuelve (fixture, server)."""
    fixture = RpgParityTests()
    fixture.setUp()
    navigate_to(fixture, Content(ROOT / 'content'), START)
    fixture.clock.side_effect = time.time
    with fixture.client.session_transaction() as sess:
        cookie_val = fixture.app.session_interface.get_signing_serializer(fixture.app).dumps(dict(sess))
    box = [None]
    server = make_server('127.0.0.1', port, Transport(AutoLogin(fixture.app, cookie_val), box))
    box[0] = server
    return fixture, server


def _post(url, payload, headers=None):
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), method='POST',
                                 headers={'Content-Type': 'application/json', **(headers or {})})
    with urllib.request.urlopen(req, timeout=5) as res:
        return res.status, json.load(res)


def run_startup_test(port=8779):
    fixture, server = _serve(port)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with urllib.request.urlopen(base + '/rpg', timeout=5) as res:
            assert res.status == 200 and 'text/html' in res.headers.get('Content-Type', '')
        with urllib.request.urlopen(base + '/api/state', timeout=5) as res:
            snapshot = json.load(res)
        assert snapshot['authenticated'] and snapshot['character']['location'] == START
        _, data = _post(base + '/api/action', {'id': 'mirar', 'request_id': 'korven02-startup'},
                        {'X-CSRF-Token': snapshot['csrf_token']})
        assert data['character']['id'] == fixture.cid
        status, data = _post(base + '/__qa__/stop', {})
        assert status == 200 and data.get('stopping') is True
        thread.join(timeout=5)
        assert not thread.is_alive(), 'El servidor no se detuvo tras /__qa__/stop'
        print(f'[QA] Arranque en puerto {server.server_port}: GET /rpg 200, estado en {START}, parada limpia OK.')
    finally:
        if thread.is_alive():
            server.shutdown()
            thread.join(timeout=5)
        server.server_close()
        fixture.doCleanups()
        print('[QA] Teardown completado: SQLite efímero y servidor cerrados.')


def run_server(port=8779):
    fixture, server = _serve(port)
    print(f'Isolated Korven 02 QA: http://127.0.0.1:{server.server_port}/rpg; POST /__qa__/stop to close', flush=True)
    try:
        server.serve_forever()
    finally:
        server.server_close()
        fixture.doCleanups()
        print('Temporary SQLite and server closed', flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8779)
    parser.add_argument('--server', action='store_true')
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--test-startup', action='store_true')
    args = parser.parse_args()
    if args.test_startup:
        run_startup_test(args.port)
    elif args.server or any(a.startswith('--port') for a in sys.argv):
        run_server(args.port)
    else:
        run_checks()


if __name__ == '__main__':
    main()
