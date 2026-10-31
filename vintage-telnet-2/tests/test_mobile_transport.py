import gzip
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from server import app as app_module
from server.content import Content


class MobileTransportTests(unittest.TestCase):
    def make_app(self, directory):
        return app_module.create_app({
            'TESTING': True,
            'DATA_DIR': str(directory),
            'CONTENT_DIR': str(Path(__file__).resolve().parents[1] / 'content'),
        })

    def test_gzip_negotiation_and_vary(self):
        with tempfile.TemporaryDirectory() as directory:
            client = self.make_app(directory).test_client()
            compressed = client.get('/client/app.js', headers={'Accept-Encoding': 'gzip'})
            self.addCleanup(compressed.close)
            self.assertEqual(compressed.headers['Content-Encoding'], 'gzip')
            self.assertIn('Accept-Encoding', compressed.headers['Vary'])
            self.assertEqual(gzip.decompress(compressed.data)[:20], b"import {speciesNames")
            plain = client.get('/client/app.js', headers={'Accept-Encoding': 'gzip;q=0'})
            self.addCleanup(plain.close)
            self.assertNotIn('Content-Encoding', plain.headers)
            self.assertIn('Accept-Encoding', plain.headers['Vary'])

    def test_content_cached_per_app_and_content_dir(self):
        with tempfile.TemporaryDirectory() as first, tempfile.TemporaryDirectory() as second:
            first_app, second_app = self.make_app(first), self.make_app(second)
            with patch.object(app_module, 'Content', wraps=Content) as construct:
                for client in (first_app.test_client(), first_app.test_client(), second_app.test_client()):
                    response = client.get('/api/state')
                    self.assertEqual(response.status_code, 200)
                self.assertEqual(construct.call_count, 2)


if __name__ == '__main__':
    unittest.main()
