#!/usr/bin/env python3
"""Disposable Valdren browser fixture; never uses the real database.

Start with the shared Python environment; POST /__qa__/stop closes the local
transport. Navigation after initial setup belongs to the browser, not this runner.
"""
import argparse
import importlib.util
from pathlib import Path
import sys
import threading
import time

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from server.content import Content
from tests.test_rpg_parity import RpgParityTests
from werkzeug.serving import make_server


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8769)
    args = parser.parse_args()
    spec = importlib.util.spec_from_file_location('campos_qa', ROOT / 'scripts/qa-rpg-edran-campos.py')
    helpers = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helpers)
    fixture = RpgParityTests()
    fixture.setUp()
    try:
        fixture.clock.side_effect = time.time
        helpers.navigate_to(fixture, Content(ROOT / 'content'), 'valdren_plaza')
        serializer = fixture.app.session_interface.get_signing_serializer(fixture.app)
        cookie = serializer.dumps({'account_id': 1, 'character_id': fixture.cid})

        class Transport:
            def __call__(self, environ, start_response):
                if (environ.get('PATH_INFO') == '/__qa__/stop'
                        and environ.get('REQUEST_METHOD') == 'POST'
                        and environ.get('REMOTE_ADDR') == '127.0.0.1'):
                    threading.Thread(target=server.shutdown, daemon=True).start()
                    start_response('200 OK', [('Content-Type', 'application/json')])
                    return [b'{"stopping":true}']
                return application(environ, start_response)

        application = helpers.AutoLogin(fixture.app, cookie)
        server = make_server('127.0.0.1', args.port, Transport())
        print(f'Isolated QA: http://127.0.0.1:{server.server_port}/rpg; POST /__qa__/stop to close', flush=True)
        try:
            server.serve_forever()
        finally:
            server.server_close()
    finally:
        fixture.doCleanups()
        print('Temporary SQLite and server closed', flush=True)


if __name__ == '__main__':
    main()
