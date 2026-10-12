import json,tempfile,unittest
from server.app import create_app

class ActivityTest(unittest.TestCase):
 def test_counts_and_access(self):
  with tempfile.TemporaryDirectory() as directory:
   app=create_app({'TESTING':True,'DATA_DIR':directory});client=app.test_client()
   self.assertEqual(client.get('/api/master/state').status_code,401)
   with app.extensions['store'].transaction() as db:
    db.execute("INSERT INTO accounts VALUES(1,'test','unused')")
    for cid in (1,2):
     db.execute('INSERT INTO characters VALUES(?,?,?,?,?,?,?)',(cid,1,'Test','humano','arcano','approved',json.dumps({'visited':['home','town'],'level':1})))
    for request_id,intent in [('a',{'id':'mover','target':'norte'}),('b',{'id':'mirar'}),('c',{'id':'mover','target':'sur'})]:
     db.execute('INSERT INTO requests VALUES(?,?,?,?)',(1,request_id,json.dumps(intent),'{}'))
   with client.session_transaction() as session:session['master']=True
   rows=client.get('/api/master/state').get_json()['approved'];rows={r['id']:r for r in rows}
   self.assertEqual(rows[1]['movements'],2);self.assertEqual(rows[2]['movements'],0)
   self.assertEqual(rows[1]['places_visited'],2)
