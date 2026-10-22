#!/usr/bin/env python3
"""Runner focal y fixture WSGI desechable para QA de Korven 04.

Seis salas: korven_asiento_revision, korven_meseta_relevo, korven_hendidura_transito,
korven_hitos_paso, korven_pared_sotavento y korven_meseta_baja. Recorre las 14 salidas
legales con acciones ofrecidas y rebotes, llega por ruta canónica desde Valdren
(sin teletransporte ni flags de depuración) y comprueba interacciones/exámenes y roundtrip Tiled.

- --check (por defecto): comprobaciones focales sin servidor persistente.
- --test-startup: arranque WSGI, GET /rpg, /api/state, acción y parada limpia.
- --server/--port: servidor efímero con AutoLogin iniciando en el Banco de revisión.
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

START = 'korven_asiento_revision'
KORVEN_ROOMS = [
    'korven_asiento_revision', 'korven_meseta_relevo', 'korven_hendidura_transito',
    'korven_hitos_paso', 'korven_pared_sotavento', 'korven_meseta_baja',
]
# (sala de partida, dirección, destino); None en la sala marca un rebote/retorno.
KORVEN_STEPS = [
    ('korven_asiento_revision', 'oeste', 'korven_peldanos_cortos'),
    (None, 'este', 'korven_asiento_revision'),
    ('korven_asiento_revision', 'norte', 'korven_meseta_relevo'),
    ('korven_meseta_relevo', 'norte', 'hoshai_garganta_oeste'),
    (None, 'sur', 'korven_meseta_relevo'),
    ('korven_meseta_relevo', 'sur', 'korven_asiento_revision'),
    ('korven_asiento_revision', 'este', 'korven_hendidura_transito'),
    ('korven_hendidura_transito', 'oeste', 'korven_asiento_revision'),
    (None, 'este', 'korven_hendidura_transito'),
    ('korven_hendidura_transito', 'este', 'korven_hitos_paso'),
    ('korven_hitos_paso', 'oeste', 'korven_hendidura_transito'),
    (None, 'este', 'korven_hitos_paso'),
    ('korven_hitos_paso', 'este', 'korven_pared_sotavento'),
    ('korven_pared_sotavento', 'oeste', 'korven_hitos_paso'),
    (None, 'este', 'korven_pared_sotavento'),
    ('korven_pared_sotavento', 'este', 'korven_meseta_baja'),
    ('korven_meseta_baja', 'oeste', 'korven_pared_sotavento'),
    (None, 'este', 'korven_meseta_baja'),
    ('korven_meseta_baja', 'este', 'korven_cauce_duro'),
    (None, 'oeste', 'korven_meseta_baja'),
    ('korven_meseta_baja', 'sur', 'korven_desvio_horno'),
    (None, 'norte', 'korven_meseta_baja'),
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


def run_checks():
    fixture = RpgParityTests()
    fixture.setUp()
    content = Content(ROOT / 'content')
    try:
        print('[QA] 1/5: salas canónicas en Content...')
        for rid in KORVEN_ROOMS:
            assert rid in content.rooms, f'Falta sala canónica: {rid}'
        expected = {(rid, d) for rid in KORVEN_ROOMS for d in content.rooms[rid]['exits']}
        assert len(expected) == 14, len(expected)

        print('[QA] 2/5: ruta canónica desde Valdren hasta el Banco de revisión...')
        navigate_to(fixture, content, START)
        assert fixture.state()['character']['location'] == START

        print('[QA] 3/5: 14 salidas legales con acciones ofrecidas y rebotes...')
        legal = set()
        _walk(fixture, KORVEN_STEPS, legal)
        assert legal == expected, sorted(expected ^ legal)
        print(f'  -> {len(legal)} salidas legales navegadas.')

        print('[QA] 4/5: interacciones y examen canónico de objetos en el lote...')
        navigate_to(fixture, content, 'korven_asiento_revision')
        res = fixture.act({'id': 'examinar', 'target': 'pieza'})
        assert _text_has(res, 'pieza', 'polvo', 'apoyo')
        navigate_to(fixture, content, 'korven_pared_sotavento')
        res = fixture.act({'id': 'examinar', 'target': 'marca'})
        assert _text_has(res, 'corredor', 'familia', 'marca')
        navigate_to(fixture, content, 'korven_meseta_baja')
        res = fixture.act({'id': 'examinar', 'target': 'piedras'})
        assert _text_has(res, 'cauce', 'pared', 'desvío')
        print('  -> Examen de objetos canónicos verificado.')

        print('[QA] 5/5: verificación de escenas, Tiled y roundtrip...')
        spec_tiled = importlib.util.spec_from_file_location('tiled_conv', ROOT / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec_tiled)
        spec_tiled.loader.exec_module(converter)
        for rid in KORVEN_ROOMS:
            s_file = ROOT / 'client-rpg/scenes' / f'{rid}.json'
            t_file = ROOT / 'client-rpg/tiled' / f'{rid}.tmj'
            assert s_file.exists(), f'Falta escena {s_file}'
            assert t_file.exists(), f'Falta fuente Tiled {t_file}'
            scene = json.loads(s_file.read_text(encoding='utf-8'))
            tiled = json.loads(t_file.read_text(encoding='utf-8'))
            assert converter.tiled_to_scene(tiled) == scene, f'Roundtrip falló en {rid}'
            assert converter.scene_to_tiled(scene) == tiled, f'Roundtrip inverso falló en {rid}'
        print('  -> 6 escenas y 6 mapas Tiled con roundtrip exacto.')

        print('[QA] OK: 5/5 comprobaciones pasaron con éxito.')
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


def run_startup_test(port=8783):
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
        _, data = _post(base + '/api/action', {'id': 'mirar', 'request_id': 'korven04-startup'},
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


def run_server(port=8783):
    fixture, server = _serve(port)
    print(f'Isolated Korven 04 QA: http://127.0.0.1:{server.server_port}/rpg; POST /__qa__/stop to close', flush=True)
    try:
        server.serve_forever()
    finally:
        server.server_close()
        fixture.doCleanups()


def main():
    parser = argparse.ArgumentParser(description='QA focal para Korven 04.')
    parser.add_argument('--check', action='store_true', help='Ejecuta comprobaciones focales (por defecto).')
    parser.add_argument('--test-startup', action='store_true', help='Verifica arranque WSGI efímero y parada limpia.')
    parser.add_argument('--server', action='store_true', help='Inicia servidor efímero.')
    parser.add_argument('--port', type=int, default=8783, help='Puerto para --server (por defecto 8783).')
    args = parser.parse_args()

    if args.server:
        run_server(args.port)
        return

    if args.test_startup:
        run_startup_test(args.port)
        return

    run_checks()


if __name__ == '__main__':
    main()
