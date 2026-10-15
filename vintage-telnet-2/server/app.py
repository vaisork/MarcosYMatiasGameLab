"""Flask transport for the new authoritative engine."""
import hmac
import json
import os
from pathlib import Path
import secrets
import sqlite3
import time
import uuid
from flask import Flask, jsonify, request, session, send_from_directory
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.middleware.proxy_fix import ProxyFix
from .store import Store
from .content import Content
from .engine import Engine, RuleError
from . import mechanics

ROOT=Path(__file__).resolve().parents[1]

def create_app(config=None):
    app=Flask(__name__,static_folder=None)
    app.config.update(SECRET_KEY=os.environ.get('VT_NEW_SECRET_KEY'),DATA_DIR=str(ROOT/'runtime'),CONTENT_DIR=str(ROOT/'content'),
                      DM_PASSWORD_HASH=os.environ.get('VT_NEW_DM_PASSWORD_HASH'),PUBLIC_ORIGIN=os.environ.get('VT_NEW_PUBLIC_ORIGIN'),SESSION_COOKIE_HTTPONLY=True,SESSION_COOKIE_SAMESITE='Lax',MAX_CONTENT_LENGTH=16384)
    if config:app.config.update(config)
    # Tests keep fixed UTC clocks; the deployed server plays on Mexico City time.
    app.config.setdefault('TIMEZONE',os.environ.get('VT_NEW_TIMEZONE') or ('UTC' if app.config.get('TESTING') else 'America/Mexico_City'))
    # Opt in only when a trusted local reverse proxy supplies the public scheme.
    if app.config.get('TRUST_PROXY_PROTO',os.environ.get('VT_NEW_TRUST_PROXY_PROTO')=='1'):
        app.wsgi_app=ProxyFix(app.wsgi_app,x_for=0,x_proto=1,x_host=0,x_port=0,x_prefix=0)
    if not app.config['SECRET_KEY']:
        if app.config.get('TESTING'):app.config['SECRET_KEY']='test-only-isolated-secret'
        else:raise RuntimeError('SECRET_KEY must be configured privately')
    store=Store(Path(app.config['DATA_DIR'])/'world.sqlite3');clock=app.config.get('CLOCK',time.time)
    app.extensions['store']=store
    def engine():
        moment=clock()
        return Engine(Content(app.config['CONTENT_DIR']),lambda:moment,app.config.get('RNG'),app.config['TIMEZONE'])
    def csrf():
        if 'csrf' not in session:session['csrf']=secrets.token_urlsafe(32)
        return session['csrf']
    def payload():
        value=request.get_json(silent=True)
        if not isinstance(value,dict):raise RuleError('Envía un objeto JSON válido.')
        return value
    def selected(db):
        row=db.execute('SELECT * FROM characters WHERE id=? AND account_id=?',(session.get('character_id',-1),session.get('account_id',-1))).fetchone()
        if not row:row=db.execute('SELECT * FROM characters WHERE account_id=? ORDER BY id LIMIT 1',(session.get('account_id',-1),)).fetchone()
        return store.load(row)
    def heartbeat(e,char,world):
        world.setdefault('presence',{})[str(char['id'])]={k:char[k] for k in ('id','name','species','class_id')}
        world['presence'][str(char['id'])].update(room=char['state']['location'],at=e.clock())

    def settle_combat(db,e,world):
        groups={}
        for row in db.execute("SELECT * FROM characters WHERE status='approved' AND json_extract(state,'$.combat') IS NOT NULL").fetchall():
            char=store.load(row);combat=char['state']['combat'];key=f"{char['state']['location']}:{combat['creature']}"
            groups.setdefault(key,[]).append(char)
        changed=False
        for participants in groups.values():
            if e.tick_shared(participants,world):
                for char in participants:store.save(db,char)
                changed=True
        if changed:store.save_world(db,world)

    def state(db,e):
        account=db.execute('SELECT id,username FROM accounts WHERE id=?',(session.get('account_id',-1),)).fetchone()
        result={'authenticated':bool(account),'csrf_token':csrf(),'characters':[]}
        if not account:return result
        result['account']=dict(account)
        result['characters']=[dict(r) for r in db.execute('SELECT id,name,species,class_id,status FROM characters WHERE account_id=?',(account['id'],))]
        char=selected(db)
        if not char:return result
        if char['status']!='approved':result.update(character=dict({k:char[k] for k in ('id','name','species','class_id','status')},gender=char['state'].get('gender')),pending_approval=True);return result
        world=store.world(db)
        settle_combat(db,e,world)
        char=selected(db)
        changed=e.tick(char,world)
        heartbeat(e,char,world);store.save_world(db,world)
        store.save(db,char);result.update(e.snapshot(char,world));
        if char['state'].get('tester_enabled') is True:result['tester']={'enabled':True,'destinations':tester_destinations(e,char)}
        return result

    @app.before_request
    def protect():
        if session.get('account_id') and request.path.startswith('/api/') and not request.path.startswith(('/api/master/','/api/account/')):
            with store.transaction() as db:
                access=db.execute('SELECT blocked,session_version FROM account_access WHERE account_id=?',(session['account_id'],)).fetchone()
            if access and (access['blocked'] or access['session_version']!=session.get('account_version',0)):
                for key in ('account_id','character_id','account_version'):session.pop(key,None)
                if request.path=='/api/state' and request.method=='GET':return jsonify(authenticated=False,characters=[],csrf_token=csrf(),message='El director cerró el acceso de esta cuenta.')
                raise RuleError('El director cerró el acceso de esta cuenta.',403)
        if request.method=='POST':
            body=request.get_json(silent=True)
            supplied=request.headers.get('X-CSRF-Token') or (body.get('csrf_token') if isinstance(body,dict) else None)
            if not supplied or not hmac.compare_digest(str(supplied),csrf()):raise RuleError('La sesión cambió. Recarga antes de enviar la acción.',403)
            origin=request.headers.get('Origin')
            allowed_origins={request.host_url.rstrip('/')}
            if app.config.get('PUBLIC_ORIGIN'):allowed_origins.add(app.config['PUBLIC_ORIGIN'].rstrip('/'))
            if origin and origin.rstrip('/') not in allowed_origins:raise RuleError('Origen de petición no autorizado.',403)

    @app.after_request
    def security(response):
        response.headers['X-Content-Type-Options']='nosniff'
        response.headers['Content-Security-Policy']="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        if request.path.startswith('/api/'):response.headers['Cache-Control']='no-store'
        return response

    @app.errorhandler(RuleError)
    def rule_error(exc):return jsonify(error='rule',message=str(exc),csrf_token=csrf()),exc.status

    @app.errorhandler(ValueError)
    def bad_value(exc):
        if app.config.get('TESTING'):raise exc
        return jsonify(error='content',message='El mundo está actualizando una escena. Inténtalo de nuevo.'),503

    @app.get('/')
    @app.get('/dm')
    def index():return send_from_directory(ROOT/'client','index.html')

    @app.get('/favicon.ico')
    def favicon():return send_from_directory(ROOT/'client'/'icons','favicon-32.png',mimetype='image/png')

    @app.get('/client/<path:filename>')
    def client_asset(filename):
        if filename=='manifest.webmanifest':return send_from_directory(ROOT/'client',filename,mimetype='application/manifest+json')
        if filename in ('icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png','icons/favicon-32.png'):return send_from_directory(ROOT/'client',filename)
        if filename.startswith(('art/bestiary/','art/species/','art/places/','art/encounters/','art/players/','art/map/')) and filename.endswith('.webp'):
            return send_from_directory(ROOT/'client'/'art',filename.removeprefix('art/'))
        if filename not in ('app.js','style.css','ui-data.js','world3d.js','model-assets.js','vendor/three.module.js','vendor/GLTFLoader.js','vendor/BufferGeometryUtils.js','vendor/LICENSE-three.txt','models/species/felaryn.glb','models/species/marevyn.glb','models/species/vesperi.glb','models/species/humano.glb','models/species/dravak.glb'):return jsonify(error='not_found'),404
        return send_from_directory(ROOT/'client',filename)

    @app.get('/api/state')
    def get_state():
        with store.transaction() as db:return jsonify(state(db,engine()))

    @app.post('/api/account/register')
    def register():
        data=payload();username=str(data.get('username','')).strip();password=data.get('password','')
        if not 3<=len(username)<=40 or not isinstance(password,str) or not 8<=len(password)<=200:raise RuleError('Usa un nombre de 3–40 caracteres y una contraseña de al menos 8.')
        with store.transaction() as db:
            try:cursor=db.execute('INSERT INTO accounts(username,password_hash) VALUES(?,?)',(username,generate_password_hash(password)))
            except sqlite3.IntegrityError:raise RuleError('Ese nombre de cuenta ya existe.',409)
            session.clear();session['account_id']=cursor.lastrowid;return jsonify(state(db,engine())),201

    @app.post('/api/account/login')
    def login():
        data=payload()
        with store.transaction() as db:
            row=db.execute('SELECT * FROM accounts WHERE username=?',(str(data.get('username','')).strip(),)).fetchone()
            if not row or not check_password_hash(row['password_hash'],str(data.get('password',''))):raise RuleError('Cuenta o contraseña incorrecta.',401)
            access=db.execute('SELECT blocked,session_version FROM account_access WHERE account_id=?',(row['id'],)).fetchone()
            if access and access['blocked']:raise RuleError('El director ha bloqueado el acceso de esta cuenta.',403)
            session.clear();session['account_id']=row['id'];session['account_version']=access['session_version'] if access else 0;return jsonify(state(db,engine()))

    @app.post('/api/account/logout')
    def logout():
        with store.transaction() as db:
            world=store.world(db)
            for row in db.execute('SELECT id FROM characters WHERE account_id=?',(session.get('account_id',-1),)):
                world.setdefault('presence',{}).pop(str(row['id']),None)
            store.save_world(db,world)
        session.clear();return jsonify(authenticated=False,csrf_token=csrf())

    @app.post('/api/character/create')
    def create_character():
        if not session.get('account_id'):raise RuleError('Inicia sesión antes de crear un personaje.',401)
        data=payload();name=str(data.get('name','')).strip();species=str(data.get('species','')).lower();species='humano' if species in ('humanos','human') else species
        class_id=str(data.get('class_id','')).lower().replace('í','i')
        gender=data.get('gender')
        if gender is not None and gender not in ('masculino','femenino'):raise RuleError('Elige masculino o femenino.')
        if not 2<=len(name)<=50 or species not in ('humano','felaryn','dravak','marevyn','vesperi') or class_id not in mechanics.CLASSES:raise RuleError('Revisa nombre, especie y clase del personaje.')
        e=engine();e.region_for(species)
        with store.transaction() as db:
            cursor=db.execute('INSERT INTO characters(account_id,name,species,class_id,status,state) VALUES(?,?,?,?,?,?)',(session['account_id'],name,species,class_id,'pending','{}'))
            home=f'home:{cursor.lastrowid}';initial=mechanics.new_state(species,class_id,home,clock());initial['gender']=gender
            db.execute('UPDATE characters SET state=? WHERE id=?',(json.dumps(initial,ensure_ascii=False),cursor.lastrowid))
            session['character_id']=cursor.lastrowid;return jsonify(state(db,e)),201

    def tester_destinations(e,char):
        ids=[char['state']['home'],*[r['settlement'] for r in e.content.regions.values()]]
        ids.extend(key for key,room in e.content.rooms.items() if room.get('shop') or room.get('recovery_service'))
        ids.extend(key for key in ('edran_canal_entrada','korven_almacen_entrada') if key in e.content.rooms)
        return [{'id':key,'name':'Tu hogar' if key==char['state']['home'] else e.content.rooms[key]['name']} for key in dict.fromkeys(ids)]

    @app.post('/api/character/tester/travel')
    def tester_travel():
        data=payload()
        if type(data.get('recover',False)) is not bool:raise RuleError('Indica si necesitas recuperación.')
        with store.transaction() as db:
            char=selected(db);e=engine()
            if not char:raise RuleError('Selecciona tu personaje.',401)
            if char['status']!='approved' or char['state'].get('tester_enabled') is not True:raise RuleError('El director debe habilitar este personaje para pruebas.',403)
            destination=data.get('destination')
            if not isinstance(destination,str) or destination not in {entry['id'] for entry in tester_destinations(e,char)}:raise RuleError('Elige un destino de prueba disponible.')
            world=store.world(db);s=char['state'];e.clear_attention(char,world)
            # Leave shared encounters intact: other players may still be fighting.
            s['combat']=None;e.visit(s,destination,mark_route=False)
            if data.get('recover'):
                s.update(hp=mechanics.hp_max(s),fatigue=0,wound=None,rest_budget=None)
            s['events']=[{'kind':'action','text':'Traslado de prueba. No has recorrido ni aprendido los caminos intermedios.'},*e.narrative(char,world)]
            heartbeat(e,char,world);store.save_world(db,world);store.save(db,char)
            db.execute('INSERT INTO audit(actor,action,target,at) VALUES(?,?,?,?)',('tester:'+str(char['id']),'tester_travel',destination,clock()))
            return jsonify(state(db,e))

    @app.post('/api/master/tester')
    def master_tester():
        if not session.get('master'):raise RuleError('Esta decisión pertenece al DM.',403)
        data=payload()
        if type(data.get('character_id')) is not int or type(data.get('enabled')) is not bool:raise RuleError('Indica personaje y habilitación válidos.')
        with store.transaction() as db:
            row=db.execute('SELECT * FROM characters WHERE id=?',(data['character_id'],)).fetchone()
            if not row:raise RuleError('No existe ese personaje.',404)
            if row['status']!='approved':raise RuleError('Aprueba primero el personaje.',409)
            char=store.load(row);char['state']['tester_enabled']=data['enabled'];store.save(db,char)
            db.execute('INSERT INTO audit(actor,action,target,at) VALUES(?,?,?,?)',('master','tester_enable' if data['enabled'] else 'tester_disable',str(char['id']),clock()))
            return jsonify(enabled=data['enabled'],character_id=char['id'],csrf_token=csrf())

    @app.post('/api/character/profile')
    def character_profile():
        data=payload();gender=data.get('gender')
        if gender not in ('masculino','femenino'):raise RuleError('Elige masculino o femenino.')
        with store.transaction() as db:
            char=selected(db)
            if not char:raise RuleError('Crea y selecciona un personaje.',401)
            # Gender is chosen at creation; the profile only completes older characters that never chose it.
            if char['state'].get('gender'):raise RuleError('El género se elige al crear el personaje.',409)
            char['state']['gender']=gender;store.save(db,char)
            return jsonify(state(db,engine()))

    @app.post('/api/character/select')
    def select_character():
        data=payload()
        if type(data.get('character_id')) is not int:raise RuleError('Indica una identidad de personaje válida.')
        with store.transaction() as db:
            row=db.execute('SELECT id FROM characters WHERE id=? AND account_id=?',(data.get('character_id'),session.get('account_id'))).fetchone()
            if not row:raise RuleError('Ese personaje no pertenece a tu cuenta.',404)
            session['character_id']=row['id'];return jsonify(state(db,engine()))

    @app.post('/api/action')
    def action():
        data=payload();request_id=data.get('request_id')
        if not isinstance(request_id,str) or not 8<=len(request_id)<=120:raise RuleError('La acción necesita una identidad de petición válida.')
        intent={k:data[k] for k in ('id','target','topic','confirmed','text','name') if k in data};encoded=json.dumps(intent,sort_keys=True,ensure_ascii=False)
        with store.transaction() as db:
            char=selected(db)
            if not char:raise RuleError('Crea y selecciona un personaje.',401)
            if char['status']!='approved':raise RuleError('El DM debe aprobar tu personaje antes de entrar.',403)
            previous=db.execute('SELECT intent,result FROM requests WHERE character_id=? AND request_id=?',(char['id'],request_id)).fetchone()
            if previous:
                if previous['intent']!=encoded:raise RuleError('Esa identidad de petición ya corresponde a otra acción.',409)
                e=engine();world=store.world(db);settle_combat(db,e,world);char=selected(db)
                if e.tick(char,world):store.save_world(db,world)
                heartbeat(e,char,world);store.save_world(db,world);store.save(db,char);result=e.snapshot(char,world);result.update(authenticated=True,csrf_token=csrf());
                if char['state'].get('tester_enabled') is True:result['tester']={'enabled':True,'destinations':tester_destinations(e,char)}
                return jsonify(result)
            e=engine();world=store.world(db);settle_combat(db,e,world);char=selected(db);e.tick(char,world);e.apply(char,world,e.parse_intent(char,world,intent));heartbeat(e,char,world);store.save_world(db,world);store.save(db,char)
            result=e.snapshot(char,world);result.update(authenticated=True,csrf_token=csrf())
            if char['state'].get('tester_enabled') is True:result['tester']={'enabled':True,'destinations':tester_destinations(e,char)}
            db.execute('INSERT INTO requests VALUES(?,?,?,?)',(char['id'],request_id,encoded,json.dumps(result,ensure_ascii=False)))
            return jsonify(result)

    @app.post('/api/master/login')
    def master_login():
        data=payload();hashed=app.config.get('DM_PASSWORD_HASH') or app.config.get('MASTER_PASSWORD_HASH')
        if not hashed or not check_password_hash(hashed,str(data.get('password',''))):raise RuleError('Acceso DM no autorizado.',401)
        session['master']=True;session['csrf']=secrets.token_urlsafe(32);return jsonify(authenticated=True,csrf_token=csrf())

    @app.post('/api/master/logout')
    def master_logout():
        session.pop('master',None);session['csrf']=secrets.token_urlsafe(32)
        return jsonify(authenticated=False,csrf_token=csrf())

    @app.get('/api/master/state')
    def master_state():
        if not session.get('master'):return jsonify(authenticated=False,csrf_token=csrf()),401
        with store.transaction() as db:
            rows=[dict(r) for r in db.execute("SELECT c.id,c.name,c.species,c.class_id,c.status,json_extract(c.state,'$.tester_enabled') AS tester_enabled,COALESCE(json_extract(c.state,'$.level'),1) AS level,json_extract(c.state,'$.portrait') AS portrait,a.username AS account,COALESCE(x.blocked,0) AS blocked FROM characters c JOIN accounts a ON a.id=c.account_id LEFT JOIN account_access x ON x.account_id=a.id")]
            movement_counts=dict(db.execute("SELECT character_id,COUNT(*) FROM requests WHERE json_extract(intent,'$.id')='mover' GROUP BY character_id"))
            places=dict(db.execute("SELECT id,COALESCE(json_array_length(state,'$.visited'),0) FROM characters"))
            for row in rows:
                row['movements']=movement_counts.get(row['id'],0)
                row['places_visited']=places.get(row['id'],0)
            return jsonify(authenticated=True,csrf_token=csrf(),pending=[r for r in rows if r['status']=='pending'],approved=[r for r in rows if r['status']=='approved'])

    @app.post('/api/master/approve')
    def approve():
        if not session.get('master'):raise RuleError('Esta decisión pertenece al DM.',403)
        data=payload()
        if type(data.get('character_id')) is not int:raise RuleError('Indica una identidad de personaje válida.')
        with store.transaction() as db:
            row=db.execute('SELECT * FROM characters WHERE id=?',(data.get('character_id'),)).fetchone()
            if not row:raise RuleError('No existe ese personaje.',404)
            if row['status']!='approved':
                db.execute("UPDATE characters SET status='approved' WHERE id=?",(row['id'],));db.execute('INSERT OR IGNORE INTO approvals VALUES(?,?)',(row['id'],clock()))
                db.execute('INSERT INTO audit(actor,action,target,at) VALUES(?,?,?,?)',('master','approve',str(row['id']),clock()))
            return jsonify(approved=True,character_id=row['id'],csrf_token=csrf())

    def master_character_data(db,e,char):
        result=e.snapshot(char,store.world(db))
        result.update(authenticated=True,csrf_token=csrf())
        result['catalog']=[dict(id=key,name=item['name'],kind=item.get('kind','item')) for key,item in e.content.items.items() if item.get('kind')!='quest']
        result['destinations']=[dict(id=key,name=room['name'],region=room['region'],kind=room['kind']) for key,room in e.content.rooms.items()]
        home=e.room({**char,'state':{**char['state'],'location':char['state']['home']}},store.world(db))
        result['destinations'].append({k:home[k] for k in ('id','name','region','kind')})
        result['portraits']=[{'id':'/client/art/players/'+p.name,'name':p.stem} for p in sorted((ROOT/'client/art/players').glob('*.webp')) if not p.stem.endswith('-thumb')]
        grants=[]
        for row in db.execute('SELECT * FROM dm_grants WHERE character_id=? ORDER BY id DESC',(char['id'],)):
            grant=dict(row);instances=json.loads(grant['instances'])
            if instances:available=sum(i.get('quantity',1) for i in char['state']['inventory'] if i['id'] in instances)
            else:available=0
            grants.append(dict(id=grant['id'],item_id=grant['item_id'],item_name=e.content.items.get(grant['item_id'],{}).get('name',grant['item_id']),amount=grant['amount'],remaining=min(grant['amount']-grant['removed'],available)))
        result['grants']=grants
        result['history']=[dict(json.loads(row['metadata']),request_id=row['request_id']) for row in db.execute('SELECT request_id,metadata FROM dm_requests WHERE character_id=? ORDER BY rowid DESC LIMIT 100',(char['id'],))]
        return result

    @app.get('/api/master/character/<int:character_id>')
    def master_character(character_id):
        if not session.get('master'):raise RuleError('Esta decisión pertenece al DM.',403)
        with store.transaction() as db:
            char=store.load(db.execute('SELECT * FROM characters WHERE id=?',(character_id,)).fetchone())
            if not char:raise RuleError('No existe ese personaje.',404)
            return jsonify(master_character_data(db,engine(),char))

    @app.post('/api/master/character/manage')
    def master_manage_character():
        if not session.get('master'):raise RuleError('Esta decisión pertenece al DM.',403)
        data=payload();cid=data.get('character_id');operation=data.get('operation');request_id=data.get('request_id')
        if type(cid) is not int:raise RuleError('Indica un personaje válido.')
        if data.get('confirmed') is not True:raise RuleError('Confirma el cambio antes de aplicarlo.')
        if not isinstance(request_id,str) or not 8<=len(request_id)<=120:raise RuleError('El cambio necesita una identidad de petición válida.')
        if operation not in ('xp','seals','item','remove_item','heal','travel','portrait'):raise RuleError('Elige una operación disponible.')
        intent=json.dumps({k:data[k] for k in ('operation','amount','target','recover_to_settlement') if k in data},sort_keys=True,ensure_ascii=False)
        with store.transaction() as db:
            char=store.load(db.execute('SELECT * FROM characters WHERE id=?',(cid,)).fetchone())
            if not char:raise RuleError('No existe ese personaje.',404)
            if char['status']!='approved':raise RuleError('Aprueba primero el personaje.',409)
            e=engine();s=char['state'];world=store.world(db)
            previous=db.execute('SELECT intent,metadata FROM dm_requests WHERE character_id=? AND request_id=?',(cid,request_id)).fetchone()
            if previous:
                if previous['intent']!=intent:raise RuleError('La petición ya corresponde a otro cambio.',409)
                return jsonify(dict(master_character_data(db,e,char),message=json.loads(previous['metadata'])['label'],replayed=True))
            amount=data.get('amount');target=data.get('target');world_changed=False
            if operation in ('xp','seals','item','remove_item'):
                limit=1000000 if operation in ('xp','seals') else 100
                if type(amount) is not int or not 1<=amount<=limit:raise RuleError(f'Indica una cantidad entera entre 1 y {limit}.')
            if operation=='xp':
                s['xp']+=amount
                while s['level']<100 and s['xp']>=mechanics.xp_next(s['level']):
                    old_max=mechanics.hp_max(s);s['xp']-=mechanics.xp_next(s['level']);s['level']+=1;s['pa']=s.get('pa',0)+2
                    s['hp']=min(mechanics.hp_max(s),s['hp']+mechanics.hp_max(s)-old_max)
                    if s['level']%5==0:s['pp']+=1
                label=f'El director concede {amount} XP. Nivel actual: {s["level"]}.'
            elif operation=='seals':
                s['seals']+=amount;label=f'El director entrega {amount} sellos.'
            elif operation=='item':
                if not isinstance(target,str) or target not in e.content.items or e.content.items[target].get('kind')=='quest':raise RuleError('Elige un objeto del catálogo que no sea de misión.')
                baseline=sum(i.get('quantity',1) for i in s['inventory'] if i['id']==target);before={i['id'] for i in s['inventory']}
                if e.content.items[target].get('kind')=='weapon':
                    for _ in range(amount):e.add_item(s,target)
                else:
                    s['inventory'].append(dict(e.content.items[target],id=target+':dm:'+uuid.uuid4().hex,catalog_id=target,quantity=amount))
                instances=[i['id'] for i in s['inventory'] if i['id'] not in before and i.get('catalog_id')==target]
                db.execute('INSERT INTO dm_grants(character_id,item_id,amount,baseline,instances,at) VALUES(?,?,?,?,?,?)',(cid,target,amount,baseline,json.dumps(instances),clock()))
                label=f'El director entrega {amount} × {e.content.items[target]["name"]}.'
            elif operation=='remove_item':
                if type(target) is not int:raise RuleError('Elige una entrega registrada.')
                grant=db.execute('SELECT * FROM dm_grants WHERE id=? AND character_id=?',(target,cid)).fetchone()
                available=next((g['remaining'] for g in master_character_data(db,e,char)['grants'] if g['id']==target),0)
                if not grant or amount>available:raise RuleError('La cantidad supera lo que queda de esa entrega.',409)
                instances=json.loads(grant['instances']);remaining=amount
                for item in list(s['inventory']):
                    if item['id'] in instances:
                        take=min(remaining,item.get('quantity',1));item['quantity']-=take;remaining-=take
                        if item['quantity']==0:
                            s['inventory'].remove(item)
                            for slot,equipped in s['equipment'].items():
                                if equipped==item['id']:
                                    s['equipment'][slot]=None
                                    if slot=='armor':s['armor_reduction']=0
                        if not remaining:break
                db.execute('UPDATE dm_grants SET removed=removed+? WHERE id=?',(amount,target))
                label=f'El director corrige una entrega: retira {amount} × {e.content.items[grant["item_id"]]["name"]}.'
            elif operation in ('heal','travel'):
                if operation=='travel':
                    if not isinstance(target,str) or target not in {d['id'] for d in master_character_data(db,e,char)['destinations']}:raise RuleError('Elige un destino del mundo.')
                    destination=target
                elif data.get('recover_to_settlement') is True:destination=e.region_for(char['species'])[1]['settlement'] if s['location']==s['home'] else e.nearest_settlement(s['location'])[0]
                else:destination=None
                e.clear_attention(char,world);s['combat']=None;world_changed=True
                if destination:e.visit(s,destination,mark_route=False)
                if operation=='heal':s.update(hp=mechanics.hp_max(s),fatigue=0,wound=None,rest_budget=None)
                label='El director recupera tu vitalidad y retira fatiga y heridas.' if operation=='heal' else f'El director te traslada a {e.room(char,world)["name"]}. No aprendiste los caminos intermedios.'
                if str(cid) in world.get('presence',{}):world['presence'][str(cid)]['room']=s['location']
            else:
                if not isinstance(target,str) or target not in {p['id'] for p in master_character_data(db,e,char)['portraits']}:raise RuleError('Elige una imagen disponible de jugador.')
                s['portrait']=target;label='El director actualiza tu imagen personalizada.'
            s['events']=[*s.get('events',[]),{'kind':'reward' if operation in ('xp','seals','item') else 'action','text':label}][-50:]
            store.save(db,char)
            if world_changed:store.save_world(db,world)
            metadata={'operation':operation,'amount':amount,'target':target,'label':label,'at':clock()}
            db.execute('INSERT INTO dm_requests VALUES(?,?,?,?)',(cid,request_id,intent,json.dumps(metadata,ensure_ascii=False)))
            db.execute('INSERT INTO audit(actor,action,target,at) VALUES(?,?,?,?)',('master','character_'+operation,str(cid),clock()))
            return jsonify(dict(master_character_data(db,e,char),message=label,replayed=False))

    @app.post('/api/master/account/access')
    def master_account_access():
        if not session.get('master'):raise RuleError('Esta decisión pertenece al DM.',403)
        data=payload()
        if type(data.get('character_id')) is not int or type(data.get('blocked')) is not bool:raise RuleError('Indica personaje y estado de acceso válidos.')
        with store.transaction() as db:
            row=db.execute('SELECT account_id FROM characters WHERE id=?',(data['character_id'],)).fetchone()
            if not row:raise RuleError('No existe ese personaje.',404)
            account_id=row['account_id']
            db.execute('INSERT INTO account_access(account_id,blocked,session_version) VALUES(?,?,1) ON CONFLICT(account_id) DO UPDATE SET blocked=excluded.blocked,session_version=account_access.session_version+1',(account_id,int(data['blocked'])))
            if data['blocked']:
                world=store.world(db);e=engine()
                for row in db.execute('SELECT * FROM characters WHERE account_id=?',(account_id,)).fetchall():
                    char=store.load(row);e.clear_attention(char,world);char['state']['combat']=None
                    world.setdefault('presence',{}).pop(str(char['id']),None);store.save(db,char)
                store.save_world(db,world)
            db.execute('INSERT INTO audit(actor,action,target,at) VALUES(?,?,?,?)',('master','account_expel' if data['blocked'] else 'account_restore',str(account_id),clock()))
        return jsonify(blocked=data['blocked'],csrf_token=csrf())

    @app.post('/api/master/account/password')
    def master_account_password():
        if not session.get('master'):raise RuleError('Esta decisión pertenece al DM.',403)
        data=payload()
        if type(data.get('character_id')) is not int:raise RuleError('Indica una identidad de personaje válida.')
        password=data.get('password');confirmation=data.get('confirmation')
        if not isinstance(password,str) or not 8<=len(password)<=200:raise RuleError('La contraseña debe tener entre 8 y 200 caracteres.')
        if password!=confirmation:raise RuleError('Las contraseñas no coinciden.')
        with store.transaction() as db:
            row=db.execute('SELECT account_id FROM characters WHERE id=?',(data['character_id'],)).fetchone()
            if not row:raise RuleError('No existe ese personaje.',404)
            db.execute('UPDATE accounts SET password_hash=? WHERE id=?',(generate_password_hash(password),row['account_id']))
            db.execute('INSERT INTO audit(actor,action,target,at) VALUES(?,?,?,?)',('master','account_password_change',str(row['account_id']),clock()))
        return jsonify(changed=True,csrf_token=csrf())
    return app
