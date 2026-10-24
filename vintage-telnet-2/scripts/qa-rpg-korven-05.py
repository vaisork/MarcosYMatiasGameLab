#!/usr/bin/env python3
"""Runner focal y fixture WSGI desechable para QA de Korven 05.

Seis salas: korven_cauce_duro, korven_loma_cascajo, korven_roca_cascaron,
korven_desvio_horno, korven_horno_reposo y korven_entrante_piezas. Recorre las 11 salidas
legales con acciones ofrecidas y rebotes, llega por ruta canónica desde Valdren
(sin teletransporte ni flags de depuración), comprueba el diálogo con Taren,
exámenes canónicos y roundtrip Tiled.

- --check (por defecto): comprobaciones focales sin servidor persistente.
- --test-startup: arranque WSGI, GET /rpg, /api/state, acción y parada limpia.
- --server/--port: servidor efímero con AutoLogin iniciando en el Cauce seco.
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

START = 'korven_cauce_duro'
KORVEN_ROOMS = [
    'korven_cauce_duro', 'korven_loma_cascajo', 'korven_roca_cascaron',
    'korven_desvio_horno', 'korven_horno_reposo', 'korven_entrante_piezas',
]
# (sala de partida, dirección, destino); None en la sala marca un rebote/retorno.
KORVEN_STEPS = [
    ('korven_cauce_duro', 'oeste', 'korven_meseta_baja'),
    (None, 'este', 'korven_cauce_duro'),
    ('korven_cauce_duro', 'este', 'korven_loma_cascajo'),
    ('korven_loma_cascajo', 'este', 'veyra_terraplen_roca'),
    (None, 'oeste', 'korven_loma_cascajo'),
    ('korven_loma_cascajo', 'oeste', 'korven_cauce_duro'),
    ('korven_cauce_duro', 'sur', 'korven_roca_cascaron'),
    ('korven_roca_cascaron', 'norte', 'korven_cauce_duro'),
    (None, 'oeste', 'korven_meseta_baja'),
    (None, 'sur', 'korven_desvio_horno'),
    ('korven_desvio_horno', 'norte', 'korven_meseta_baja'),
    (None, 'sur', 'korven_desvio_horno'),
    ('korven_desvio_horno', 'sur', 'korven_horno_reposo'),
    ('korven_horno_reposo', 'norte', 'korven_desvio_horno'),
    (None, 'sur', 'korven_horno_reposo'),
    ('korven_horno_reposo', 'oeste', 'korven_entrante_piezas'),
    ('korven_entrante_piezas', 'este', 'korven_horno_reposo'),
]


def _text_has(res, *needles):
    text = ' '.join(p.get('text', '') for p in res.get('narrative', []) if isinstance(p, dict)).lower()
    return any(n.lower() in text for n in needles)


def _topics(fixture, target):
    state = fixture.state()
    actions = state.get('actions', [])
    return {a['topic'] for a in actions if a.get('id') == 'hablar' and a.get('target') == target and 'topic' in a}


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
        print('[QA] 1/5: salas y NPC canónicos en Content...')
        for rid in KORVEN_ROOMS:
            assert rid in content.rooms, f'Falta sala canónica: {rid}'
        assert content.rooms['korven_entrante_piezas']['npcs'] == ['korven_taren']
        expected = {(rid, d) for rid in KORVEN_ROOMS for d in content.rooms[rid]['exits']}
        assert len(expected) == 11, len(expected)

        print('[QA] 2/5: ruta canónica desde Valdren hasta el Cauce seco...')
        navigate_to(fixture, content, START)
        assert fixture.state()['character']['location'] == START

        print('[QA] 3/5: 11 salidas legales con acciones ofrecidas y rebotes...')
        legal = set()
        _walk(fixture, KORVEN_STEPS, legal)
        assert legal == expected, sorted(expected ^ legal)
        print(f'  -> {len(legal)} salidas legales navegadas.')

        print('[QA] 4/5: interacción y diálogo con Taren en el Rincón de las muestras...')
        navigate_to(fixture, content, 'korven_entrante_piezas')
        taren_topics = _topics(fixture, 'korven_taren')
        assert {'horno', 'muestras', 'pieza', 'materiales'} <= taren_topics, taren_topics
        res = fixture.act({'id': 'hablar', 'target': 'korven_taren', 'topic': 'horno'})
        assert _text_has(res, 'horno', 'recipiente', 'taza')
        navigate_to(fixture, content, 'korven_cauce_duro')
        res = fixture.act({'id': 'examinar', 'target': 'cuenco'})
        assert _text_has(res, 'herramientas', 'fragmentos')
        print('  -> Diálogo de Taren y examen canónico verificados.')

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


def run_startup_test(port=8784):
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
        _, data = _post(base + '/api/action', {'id': 'mirar', 'request_id': 'korven05-startup'},
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


def run_server(port=8784):
    fixture, server = _serve(port)
    print(f'Isolated Korven 05 QA: http://127.0.0.1:{server.server_port}/rpg; POST /__qa__/stop to close', flush=True)
    try:
        server.serve_forever()
    finally:
        server.server_close()
        fixture.doCleanups()


def main():
    parser = argparse.ArgumentParser(description='QA focal para Korven 05.')
    parser.add_argument('--check', action='store_true', help='Ejecuta comprobaciones focales (por defecto).')
    parser.add_argument('--test-startup', action='store_true', help='Verifica arranque WSGI efímero y parada limpia.')
    parser.add_argument('--server', action='store_true', help='Inicia servidor efímero.')
    parser.add_argument('--port', type=int, default=8784, help='Puerto para --server (por defecto 8784).')
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
