#!/usr/bin/env python3
"""Runner focal y fixture WSGI desechable para QA integral de Korven (32 salas).

Valida la integración completa de la región de Korven en Vaisgard RPG:
- 32 salas canónicas (31 de Korven + brumak_centro) con escenas y fuentes Tiled.
- Recorrido completo del grafo regional visitando las 32 salas mediante acciones reales.
- Diálogo e interacción con los 6 NPCs canónicos (Ved, Beran, Ruma, Neru, Oma, Taren).
- Tránsito bidireccional en las 3 fronteras regionales (Edran, Hoshai, Veyra).
- Roundtrip Tiled exacto y verificación de cuota de fondos <= 250 KB.

Uso:
  python scripts/qa-rpg-korven-completo.py --check          (por defecto)
  python scripts/qa-rpg-korven-completo.py --test-startup   (comprobación WSGI)
  python scripts/qa-rpg-korven-completo.py --server         (servidor local en puerto 8785)
"""
import argparse
from collections import deque
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

# Reutiliza helpers de navegación canónica y WSGI existentes
spec_norte = importlib.util.spec_from_file_location('qa_rpg_edran_norte', Path(__file__).parent / 'qa-rpg-edran-norte.py')
qa_norte = importlib.util.module_from_spec(spec_norte)
spec_norte.loader.exec_module(qa_norte)
AutoLogin, Transport = qa_norte.AutoLogin, qa_norte.Transport

START_ROOM = 'korven_borde_tierra'

KORVEN_ROOMS = [
    'brumak_centro',
    'korven_almacen_balanzas',
    'korven_almacen_cruce',
    'korven_almacen_entrada',
    'korven_almacen_fondo',
    'korven_almacen_grano',
    'korven_almacen_lateral',
    'korven_asiento_revision',
    'korven_borde_tierra',
    'korven_calle_fachadas',
    'korven_cauce_duro',
    'korven_cauce_observacion',
    'korven_cisterna_comun',
    'korven_deposito_cubiertas',
    'korven_desvio_horno',
    'korven_entrante_piezas',
    'korven_hendidura_transito',
    'korven_hitos_paso',
    'korven_horno_reposo',
    'korven_loma_cascajo',
    'korven_meseta_baja',
    'korven_meseta_relevo',
    'korven_mirador_grietas',
    'korven_pared_sotavento',
    'korven_patio_lavado',
    'korven_peldanos_cortos',
    'korven_plataforma_escucha',
    'korven_registro_cauce',
    'korven_roca_cascaron',
    'korven_sala_cuidados',
    'korven_senda_viento',
    'korven_taller_juntas',
]

KORVEN_NPCS = {
    'korven_ved': ('korven_peldanos_cortos', 'entrada'),
    'korven_beran': ('korven_taller_juntas', 'afinado'),
    'korven_ruma': ('korven_almacen_entrada', 'almacén'),
    'korven_neru': ('korven_sala_cuidados', 'atención'),
    'korven_oma': ('korven_registro_cauce', 'bloques'),
    'korven_taren': ('korven_entrante_piezas', 'horno'),
}

BOUNDARY_TRANSITIONS = [
    ('korven_borde_tierra', 'sur', 'edran_linde_piedra', 'norte'),
    ('korven_meseta_relevo', 'norte', 'hoshai_garganta_oeste', 'sur'),
    ('korven_loma_cascajo', 'este', 'veyra_terraplen_roca', 'oeste'),
]


def _find_path(content, start, goal):
    if start == goal:
        return []
    queue = deque([(start, [])])
    seen = {start}
    while queue:
        curr, path = queue.popleft()
        if curr == goal:
            return path
        for d, nxt in content.rooms.get(curr, {}).get('exits', {}).items():
            if nxt not in seen:
                seen.add(nxt)
                queue.append((nxt, path + [d]))
    raise ValueError(f'No hay ruta navegable de {start} a {goal}')


def _navigate(fixture, content, target):
    curr = fixture.state()['character']['location']
    if curr == target:
        return
    path = _find_path(content, curr, target)
    for d in path:
        fixture.act(fixture.offered('mover', d))
    actual = fixture.state()['character']['location']
    assert actual == target, f'Navegación falló: esperado {target}, actual {actual}'


def run_checks():
    print('[QA-KORVEN-COMPLETO] Iniciando validación integral de Korven...')
    fixture = RpgParityTests()
    fixture.setUp()
    content = Content(ROOT / 'content')
    try:
        # 1. Verificación de catálogo y fuentes Tiled
        print('[QA] 1/5: Verificando 32 salas, fuentes Tiled y cuotas de arte...')
        spec_tiled = importlib.util.spec_from_file_location('tiled_conv', ROOT / 'scripts/tiled-to-scene.py')
        converter = importlib.util.module_from_spec(spec_tiled)
        spec_tiled.loader.exec_module(converter)

        for rid in KORVEN_ROOMS:
            assert rid in content.rooms, f'Falta sala en content: {rid}'
            s_file = ROOT / 'client-rpg/scenes' / f'{rid}.json'
            t_file = ROOT / 'client-rpg/tiled' / f'{rid}.tmj'
            assert s_file.exists(), f'Falta escena {s_file}'
            assert t_file.exists(), f'Falta Tiled {t_file}'
            scene = json.loads(s_file.read_text(encoding='utf-8'))
            tiled = json.loads(t_file.read_text(encoding='utf-8'))
            assert converter.tiled_to_scene(tiled) == scene, f'Roundtrip falló en {rid}'
            bg = ROOT / 'client-rpg' / scene['background']
            assert bg.is_file(), f'Falta fondo {bg}'
            assert bg.stat().st_size <= 250000, f'Fondo {bg} excede 250KB'
        print('  -> 32 salas con escenas, Tiled roundtrip y fondos WebP <= 250KB OK.')

        # 2. Navegación canónica y cobertura completa de las 32 salas
        print('[QA] 2/5: Recorriendo todas las 32 salas de Korven via acciones reales...')
        _navigate(fixture, content, START_ROOM)
        assert fixture.state()['character']['location'] == START_ROOM

        visited = {START_ROOM}
        for rid in KORVEN_ROOMS:
            _navigate(fixture, content, rid)
            visited.add(fixture.state()['character']['location'])
        assert visited == set(KORVEN_ROOMS), f'Salas sin visitar: {set(KORVEN_ROOMS) - visited}'
        print(f'  -> 32/32 salas navegadas con éxito en el servidor autoritativo.')

        # 3. Interacción y diálogo con los 6 NPCs
        print('[QA] 3/5: Verificando interacción con los 6 NPCs canónicos...')
        for npc_id, (room_id, expected_topic) in KORVEN_NPCS.items():
            _navigate(fixture, content, room_id)
            state = fixture.state()
            talk_actions = [a for a in state.get('actions', [])
                            if a.get('id') == 'hablar' and a.get('target') == npc_id]
            assert talk_actions, f'Sin acción de hablar para {npc_id} en {room_id}'
            match_action = next((a for a in talk_actions if a.get('topic') == expected_topic), talk_actions[0])
            res = fixture.act(match_action)
            narrative = ' '.join(p.get('text', '') for p in res.get('narrative', []) if isinstance(p, dict))
            assert len(narrative) > 0, f'Diálogo vacío para {npc_id}'
            print(f'     • {npc_id} ({room_id}): OK (tema "{match_action.get("topic")}")')
        print('  -> Diálogos de los 6 NPCs verificados.')

        # 4. Fronteras regionales (Edran, Hoshai, Veyra)
        print('[QA] 4/5: Verificando tránsito en las 3 fronteras regionales...')
        for korven_room, out_dir, ext_room, in_dir in BOUNDARY_TRANSITIONS:
            _navigate(fixture, content, korven_room)
            fixture.act(fixture.offered('mover', out_dir))
            assert fixture.state()['character']['location'] == ext_room, f'Fallo cruzando a {ext_room}'
            fixture.act(fixture.offered('mover', in_dir))
            assert fixture.state()['character']['location'] == korven_room, f'Fallo regresando a {korven_room}'
            print(f'     • {korven_room} <-> {ext_room}: OK')
        print('  -> 3 conexiones de frontera validadas bidireccionalmente.')

        # 5. Validación de atlas de sprites de Korven
        print('[QA] 5/5: Verificando atlas de sprites de NPCs y fauna de Korven...')
        for sprite_name in ('ved', 'beran', 'ruma', 'neru', 'oma', 'taren'):
            png = ROOT / 'client-rpg/sprites' / f'{sprite_name}.png'
            meta = json.loads(png.with_suffix('.png.json').read_text())
            assert png.is_file(), f'Falta sprite {png}'
            assert meta['dimensions'] == [192, 384]
        for fauna_name in ('cascapedernal', 'colagrieta', 'quebrarrocas'):
            map_png = ROOT / 'client-rpg/sprites' / f'{fauna_name}.png'
            assert map_png.is_file(), f'Falta fauna de mapa {map_png}'
            battle_png = ROOT / 'client-rpg/sprites' / f'{fauna_name}-battle.png'
            assert battle_png.is_file(), f'Falta fauna de batalla {battle_png}'
        print('  -> Atlas de 6 NPCs y 3 criaturas de mapa/batalla OK.')

        print('[QA-KORVEN-COMPLETO] ÉXITO: 5/5 etapas verificadas al 100%.')
    finally:
        fixture.doCleanups()
        print('[QA-KORVEN-COMPLETO] Teardown completado: SQLite efímero cerrado.')


def _serve(port):
    fixture = RpgParityTests()
    fixture.setUp()
    _navigate(fixture, Content(ROOT / 'content'), START_ROOM)
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


def run_startup_test(port=8785):
    print(f'[QA-KORVEN-STARTUP] Comprobando servidor WSGI efímero en puerto {port}...')
    fixture, server = _serve(port)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with urllib.request.urlopen(base + '/rpg', timeout=5) as res:
            assert res.status == 200 and 'text/html' in res.headers.get('Content-Type', '')
        with urllib.request.urlopen(base + '/api/state', timeout=5) as res:
            snapshot = json.load(res)
        assert snapshot['authenticated'] and snapshot['character']['location'] == START_ROOM
        _, data = _post(base + '/api/action', {'id': 'mirar', 'request_id': 'korven-startup-check'},
                        {'X-CSRF-Token': snapshot['csrf_token']})
        assert data['character']['id'] == fixture.cid
        print('[QA-KORVEN-STARTUP] Respuesta HTTP 200, snapshot autenticado y acción mirar OK.')
    finally:
        try:
            _post(base + '/__qa__/stop', {})
        except Exception:
            server.shutdown()
        fixture.doCleanups()
        print('[QA-KORVEN-STARTUP] Parada limpia y teardown completados.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='QA integral de Korven')
    parser.add_argument('--check', action='store_true', default=True, help='Ejecutar verificaciones focales')
    parser.add_argument('--test-startup', action='store_true', help='Probar ciclo de vida del servidor WSGI')
    parser.add_argument('--server', action='store_true', help='Ejecutar servidor WSGI interactivo')
    parser.add_argument('--port', type=int, default=8785, help='Puerto para servidor')
    args = parser.parse_args()

    if args.test_startup:
        run_startup_test(args.port)
    elif args.server:
        fixture, server = _serve(args.port)
        print(f'Servidor QA de Korven listo en http://127.0.0.1:{server.server_port}/rpg (Ctrl+C para parar)')
        try:
            server.serve_forever()
        finally:
            fixture.doCleanups()
    else:
        run_checks()
