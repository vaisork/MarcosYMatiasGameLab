"""Disposable local RPG QA world; no production data. Ctrl-C removes its DB."""
import os
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
    clean = '--clean' in sys.argv or '--no-auto-login' in sys.argv
    fixture = RpgParityTests()
    fixture.setUp()
    fixture.clock.side_effect = time.time
    serializer = fixture.app.session_interface.get_signing_serializer(fixture.app)
    cookie_val = serializer.dumps({'account_id': 1, 'character_id': fixture.cid})
    app = fixture.app if clean else AutoLogin(fixture.app, cookie_val)

    stop_event = threading.Event()
    if clean:
        pending_times = {}
        def auto_approve_worker():
            store = fixture.app.extensions.get('store')
            while not stop_event.is_set():
                time.sleep(0.5)
                if not store:
                    continue
                try:
                    now = time.time()
                    with store.transaction() as db:
                        rows = db.execute("SELECT id FROM characters WHERE status='pending'").fetchall()
                        for r in rows:
                            cid = r['id']
                            if cid not in pending_times:
                                pending_times[cid] = now
                            elif now - pending_times[cid] >= 1.5:
                                db.execute("UPDATE characters SET status='approved' WHERE id=?", (cid,))
                                db.execute("INSERT OR IGNORE INTO approvals VALUES(?, ?)", (cid, now))
                                print(f"[QA] Auto-approved pending character {cid}", flush=True)
                except Exception:
                    pass

        t = threading.Thread(target=auto_approve_worker, daemon=True)
        t.start()

    try:
        from werkzeug.serving import make_server
        server = make_server('127.0.0.1', 0, app)
        print(f'Isolated RPG QA: http://127.0.0.1:{server.server_port}/rpg', flush=True)
        server.serve_forever()
    finally:
        stop_event.set()
        fixture.doCleanups()
