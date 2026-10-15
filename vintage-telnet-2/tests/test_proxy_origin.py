"""Public HTTPS origins work through the explicitly trusted local scheme proxy."""
import tempfile
import unittest
from pathlib import Path
from werkzeug.security import generate_password_hash
from server.app import create_app

class ProxyOriginTests(unittest.TestCase):
 def app(self,trust):
  tmp=tempfile.TemporaryDirectory();self.addCleanup(tmp.cleanup)
  return create_app({'TESTING':True,'DATA_DIR':tmp.name,'TRUST_PROXY_PROTO':trust,'DM_PASSWORD_HASH':generate_password_hash('test-only-director-password')})
 def test_trusted_https_proxy_allows_director_login_and_state(self):
  c=self.app(True).test_client()
  # Fetch token on same canonical host so the session is retained.
  token=c.get('/api/master/state',base_url='http://game.example').json['csrf_token']
  r=c.post('/api/master/login',base_url='http://game.example',json={'csrf_token':token,'username':'vaisork','password':'test-only-director-password'},headers={'Origin':'https://game.example','X-Forwarded-Proto':'https'})
  self.assertEqual(r.status_code,200)
  self.assertTrue(c.get('/api/master/state',base_url='http://game.example',headers={'X-Forwarded-Proto':'https'}).json['authenticated'])
 def test_proxy_does_not_trust_host_or_disable_csrf(self):
  c=self.app(True).test_client();token=c.get('/api/master/state',base_url='http://game.example').json['csrf_token']
  for origin,csrf in [('https://evil.example',token),('https://game.example','invalid')]:
   r=c.post('/api/master/login',base_url='http://game.example',json={'csrf_token':csrf,'username':'vaisork','password':'test-only-director-password'},headers={'Origin':origin,'X-Forwarded-Proto':'https','X-Forwarded-Host':'evil.example'})
   self.assertEqual(r.status_code,403)
 def test_untrusted_proxy_headers_remain_ignored(self):
  c=self.app(False).test_client();token=c.get('/api/master/state',base_url='http://game.example').json['csrf_token']
  r=c.post('/api/master/login',base_url='http://game.example',json={'csrf_token':token,'username':'vaisork','password':'test-only-director-password'},headers={'Origin':'https://game.example','X-Forwarded-Proto':'https'})
  self.assertEqual(r.status_code,403)

 def test_explicit_public_origin_when_funnel_omits_forwarded_scheme(self):
  app=self.app(False);app.config['PUBLIC_ORIGIN']='https://game.example';c=app.test_client()
  token=c.get('/api/master/state',base_url='http://127.0.0.1:8083').json['csrf_token']
  for origin,status in [('https://evil.example',403),('https://game.example',200)]:
   r=c.post('/api/master/login',base_url='http://127.0.0.1:8083',json={'csrf_token':token,'username':'vaisork','password':'test-only-director-password'},headers={'Origin':origin})
   self.assertEqual(r.status_code,status)
  self.assertTrue(c.get('/api/master/state',base_url='http://127.0.0.1:8083').json['authenticated'])
