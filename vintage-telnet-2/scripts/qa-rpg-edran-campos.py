#!/usr/bin/env python3
"""Runner focal de QA para escenas de Campos de Edran (Fase 2).

Reutiliza la fixture RpgParityTests para aislamiento completo en SQLite efímero.
Verifica navegación bidireccional, salidas canónicas, archivos de escena y fondos.
Soporta --server, --room <id> y --capture para inspección y QA visual con codex-browser.
"""
import argparse
from collections import deque
import json
import os
import subprocess
import sys
import threading
import time
from pathlib import Path

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

ROOMS = [
    'edran_estanque',
    'edran_lindero',
    'edran_parcela_vieja',
    'edran_zanja_antigua',
    'edran_bajo_humedo',
    'edran_sauces',
]

PREVIEW_DIR = Path('/home/jdiaz/proyectos/entregas/equipo/rpg-preview')


class AutoLogin:
    def __init__(self, wsgi, cookie_val):
        self.wsgi = wsgi
        self.cookie_val = cookie_val

    def __call__(self, environ, start_response):
        c = environ.get('HTTP_COOKIE', '')
        if 'session=' not in c:
            environ['HTTP_COOKIE'] = f'session={self.cookie_val}; {c}' if c else f'session={self.cookie_val}'
        return self.wsgi(environ, start_response)


def find_path(content, start_room, target_room):
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
    current = fixture.state()['character']['location']
    if current == target_room:
        return
    path = find_path(content, current, target_room)
    for direction in path:
        fixture.act({'text': direction})


def run_checks(fixture, content):
    scenes_dir = ROOT / 'client-rpg' / 'scenes'
    print("[QA] Verificando especificaciones de 6 escenas y fondos...")
    for rid in ROOMS:
        json_path = scenes_dir / f'{rid}.json'
        assert json_path.is_file(), f"Falta archivo de escena: {json_path}"
        scene = json.loads(json_path.read_text(encoding='utf-8'))
        assert scene.get('size') == [20, 15], f"{rid}: tamaño incorrecto"
        assert scene.get('tile') == 16, f"{rid}: tile incorrecto"
        bg_path = ROOT / 'client-rpg' / scene.get('background', '')
        assert bg_path.is_file(), f"{rid}: fondo no encontrado {bg_path}"
        assert bg_path.stat().st_size <= 250000, f"{rid}: fondo excede 250KB"

    print("[QA] Verificando rutas y navegación bidireccional...")
    routes = [
        ('edran_estanque', []),
        ('edran_bajo_humedo', ['este']),
        ('edran_estanque', ['oeste']),
        ('edran_sauces', ['sur']),
        ('edran_puente_juncos', ['este']),
        ('edran_sauces', ['sur']),
        ('edran_estanque', ['norte']),
        ('edran_surcos', ['norte', 'norte']),
        ('edran_lindero', ['norte']),
        ('edran_loma', ['oeste']),
        ('edran_lindero', ['este']),
        ('edran_cobertizo_campo', ['este']),
        ('edran_lindero', ['oeste']),
        ('edran_surcos', ['sur']),
        ('edran_parcela_vieja', ['oeste']),
        ('edran_loma', ['norte']),
        ('edran_parcela_vieja', ['sur']),
        ('edran_surcos', ['este']),
        ('edran_zanja_antigua', ['este']),
        ('edran_era', ['norte']),
        ('edran_zanja_antigua', ['oeste']),
        ('edran_canal_entrada', ['este']),
        ('edran_zanja_antigua', ['oeste']),
        ('edran_surcos', ['oeste']),
    ]

    navigate_to(fixture, content, 'edran_estanque')
    for target, steps in routes:
        for step in steps:
            fixture.act({'text': step})
        loc = fixture.state()['character']['location']
        assert loc == target, f"Esperado {target}, obtenido {loc}"

    print("[QA] Éxito: 6 escenas verificadas, fondos WebP <=250KB, navegación y paridad OK.")


def run_visual_captures(fixture, content, preview_dir=PREVIEW_DIR):
    preview_dir = Path(preview_dir)
    preview_dir.mkdir(parents=True, exist_ok=True)

    fixture.clock.side_effect = time.time
    serializer = fixture.app.session_interface.get_signing_serializer(fixture.app)
    cookie_val = serializer.dumps({'account_id': 1, 'character_id': fixture.cid})
    app = AutoLogin(fixture.app, cookie_val)

    from werkzeug.serving import make_server
    server = make_server('127.0.0.1', 0, app)
    port = server.server_port
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    url = f'http://127.0.0.1:{port}/rpg'
    print(f"[QA Visual] Servidor efímero iniciado en {url}")

    room_specs = [
        ('edran_estanque', 'estanque'),
        ('edran_lindero', 'lindero'),
        ('edran_parcela_vieja', 'parcela'),
        ('edran_zanja_antigua', 'zanja'),
        ('edran_bajo_humedo', 'hondonada'),
        ('edran_sauces', 'sauces'),
    ]

    for room_id, slug in room_specs:
        print(f"[QA Visual] Capturando {room_id} ({slug})...")
        navigate_to(fixture, content, room_id)
        subprocess.run(['codex-browser', 'open', url], check=True)
        time.sleep(1.2)
        desktop_img = preview_dir / f'campos01-{slug}-desktop.png'
        subprocess.run(['codex-browser', 'set', 'viewport', '1366', '768'], check=True)
        time.sleep(0.4)
        subprocess.run(['codex-browser', 'screenshot', str(desktop_img)], check=True)
        mobile_img = preview_dir / f'campos01-{slug}-mobile.png'
        subprocess.run(['codex-browser', 'set', 'viewport', '390', '844'], check=True)
        time.sleep(0.4)
        subprocess.run(['codex-browser', 'screenshot', str(mobile_img)], check=True)

    # Recorrido de prueba: cruce a vecina genérica y regreso
    print("[QA Visual] Capturando recorrido y cruce a vecina genérica...")
    navigate_to(fixture, content, 'edran_sauces')
    subprocess.run(['codex-browser', 'open', url], check=True)
    time.sleep(0.6)
    navigate_to(fixture, content, 'edran_puente_juncos')
    subprocess.run(['codex-browser', 'open', url], check=True)
    subprocess.run(['codex-browser', 'set', 'viewport', '1366', '768'], check=True)
    time.sleep(0.8)
    cruce_img = preview_dir / 'campos01-cruce-vecina-generica.png'
    subprocess.run(['codex-browser', 'screenshot', str(cruce_img)], check=True)

    # Regreso a sala pintada
    navigate_to(fixture, content, 'edran_sauces')
    subprocess.run(['codex-browser', 'open', url], check=True)
    time.sleep(0.8)
    regreso_img = preview_dir / 'campos01-regreso-escena-pintada.png'
    subprocess.run(['codex-browser', 'screenshot', str(regreso_img)], check=True)

    server.shutdown()
    print(f"[QA Visual] Capturas guardadas en {preview_dir}/campos01-*.png")


def main():
    parser = argparse.ArgumentParser(description="Runner focal de QA RPG Campos de Edran")
    parser.add_argument('--server', '--serve', action='store_true', help="Levanta servidor WSGI efímero con AutoLogin")
    parser.add_argument('--room', type=str, default='edran_estanque', help="Sala inicial para inspección en navegador")
    parser.add_argument('--port', type=int, default=0, help="Puerto para servidor WSGI (0 = aleatorio)")
    parser.add_argument('--capture', action='store_true', help="Ejecuta QA visual automatizado con codex-browser")
    args = parser.parse_args()

    fixture = RpgParityTests()
    fixture.setUp()
    content = Content(ROOT / 'content')

    try:
        if args.capture:
            run_visual_captures(fixture, content)
        elif args.server:
            # Encounters created while travelling must use the same clock as
            # browser requests; switching afterwards immediately expires them.
            fixture.clock.side_effect = time.time
            if args.room:
                navigate_to(fixture, content, args.room)
            serializer = fixture.app.session_interface.get_signing_serializer(fixture.app)
            cookie_val = serializer.dumps({'account_id': 1, 'character_id': fixture.cid})
            app = AutoLogin(fixture.app, cookie_val)

            from werkzeug.serving import make_server
            server = make_server('127.0.0.1', args.port, app)
            port = server.server_port
            print(f"Isolated RPG QA Server: http://127.0.0.1:{port}/rpg (room: {args.room})", flush=True)
            print("Presiona Ctrl-C para detener y limpiar la DB efímera.", flush=True)
            server.serve_forever()
        else:
            run_checks(fixture, content)
    finally:
        fixture.doCleanups()


if __name__ == '__main__':
    main()
