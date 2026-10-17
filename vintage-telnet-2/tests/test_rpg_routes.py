"""Vaisgard RPG: el servidor sólo sirve los archivos estáticos permitidos del segundo cliente."""
import tempfile
import unittest
from server.app import create_app

class RpgRouteTests(unittest.TestCase):
 def setUp(self):
  tmp=tempfile.TemporaryDirectory();self.addCleanup(tmp.cleanup)
  self.c=create_app({'TESTING':True,'DATA_DIR':tmp.name}).test_client()
 def test_index_is_served_with_csp(self):
  r=self.c.get('/rpg');self.addCleanup(r.close);self.assertEqual(r.status_code,200)
  self.assertIn("script-src 'self'",r.headers['Content-Security-Policy'])
 def test_only_whitelisted_assets(self):
  for path in ('/client-rpg/../server/app.py','/client-rpg/index.html','/client-rpg/scenes/../../runtime/x.json','/client-rpg/otro.js','/client-rpg/scenes/Edran.json','/client-rpg/tilesets/../evil.json','/client-rpg/tiled/otro.json','/client-rpg/tiled/edran_acequia.tmj'):
   self.assertEqual(self.c.get(path).status_code,404,path)
 def test_whitelisted_tileset_assets_served(self):
  for path in ('/client-rpg/tilesets/edran.json','/client-rpg/sprites/edran-tiles.png'):
   r=self.c.get(path);self.addCleanup(r.close);self.assertEqual(r.status_code,200,path)
 def test_backgrounds_are_served_and_paths_stay_restricted(self):
  for name in ('edran_salida_huertos','edran_acequia','edran_surcos','edran_battle'):
   r=self.c.get(f'/client-rpg/backgrounds/{name}.webp');self.addCleanup(r.close)
   self.assertEqual(r.status_code,200);self.assertEqual(r.mimetype,'image/webp')
  for name in ('../sprites/avatar.png','Edran.webp','edran.png','edran-front-extra.webp','edran/acequia.webp'):
   self.assertEqual(self.c.get('/client-rpg/backgrounds/'+name).status_code,404,name)
 def test_optional_foreground_route(self):
  from unittest.mock import patch
  # The optional layer need not exist in the three current rooms.
  with patch('server.app.send_from_directory',return_value='foreground') as send:
   self.assertEqual(self.c.get('/client-rpg/backgrounds/edran_acequia-front.webp').status_code,200)
   send.assert_called_once()
