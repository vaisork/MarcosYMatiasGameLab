"""Disposable local RPG QA world; no production data. Ctrl-C removes its DB."""
import os
import sys
import time
from pathlib import Path

VENV_PY = Path('/home/jdiaz/proyectos/.venv-vt2/bin/python')
try:
    import werkzeug
except ImportError:
    if VENV_PY.exists() and sys.executable != str(VENV_PY):
        os.execv(str(VENV_PY), [str(VENV_PY)] + sys.argv)
    raise

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tests.test_rpg_parity import RpgParityTests


class AutoLogin:
    def __init__(self, wsgi, cookie_val):
        self.wsgi = wsgi
        self.cookie_val = cookie_val

    def __call__(self, environ, start_response):
        c = environ.get('HTTP_COOKIE', '')
        if 'session=' not in c:
            environ['HTTP_COOKIE'] = f'session={self.cookie_val}; {c}' if c else f'session={self.cookie_val}'
        return self.wsgi(environ, start_response)


if __name__ == '__main__':
    fixture = RpgParityTests()
    fixture.setUp()
    fixture.clock.side_effect = time.time
    serializer = fixture.app.session_interface.get_signing_serializer(fixture.app)
    cookie_val = serializer.dumps({'account_id': 1, 'character_id': fixture.cid})
    app = AutoLogin(fixture.app, cookie_val)
    try:
        from werkzeug.serving import make_server
        server = make_server('127.0.0.1', 0, app)
        print(f'Isolated RPG QA: http://127.0.0.1:{server.server_port}/rpg', flush=True)
        server.serve_forever()
    finally:
        fixture.doCleanups()

