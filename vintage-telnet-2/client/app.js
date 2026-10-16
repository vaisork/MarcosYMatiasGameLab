import {speciesNames,classNames,regionNames,kindNames,events,actions,list,actionPayload,knownMap,textLabel,journalEvents,NarrativeJournal,orientationMap,knownRoute,discoveredLayout,discoveredPaths,speciesPortraits,placeIllustrations,placeArt,bestiaryThumbnail,combatReading,capabilityReadingHint,classActions,attributeDescriptions,trustStageNames} from './ui-data.js';
const main=document.getElementById('main'),navigation=document.getElementById('navigation'),notice=document.getElementById('notice');
let state=null,master=null,view='adventure',authMode='login',busy=false,selectedPlace=null,pendingRetry=null,commandDraft='',commandError='',commandExpanded=false;
let mapScale=1,mapOverview=false,lastArrivalAt=0,travelPaceUntil=0;
const whole=value=>Math.ceil(Number(value)||0);
let map3dOpen=false;
let map3dCamera=null,map3dCameraKey=null;
const journal=new NarrativeJournal(),history=journal.entries,confirmedRequests=new Set();
const labels={adventure:['compass','Explorar'],map:['⌁','Mapa'],inventory:['▱','Inventario'],character:['○','Personaje'],numen:['paw','Compañero'],bestiary:['paw','Bestiario'],journal:['≡','Diario'],help:['?','Ayuda'],more:['dots','Más']};
const requestId=()=>globalThis.crypto?.randomUUID?.()||`web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
function el(tag,attrs={},...children){const node=document.createElement(tag);for(const [key,value] of Object.entries(attrs)){if(value==null)continue;if(key==='class')node.className=value;else if(key==='text')node.textContent=value;else if(key.startsWith('on')&&typeof value==='function')node.addEventListener(key.slice(2),value);else if(key in node&&!key.startsWith('aria-')&&key!=='role')node[key]=value;else node.setAttribute(key,String(value));}for(const child of children.flat(Infinity)){if(child==null)continue;node.append(typeof child==='string'?document.createTextNode(child):child);}return node;}
const button=(label,handler,extra={})=>el('button',{type:'button',onclick:handler,...extra},label);
const iconPaths={
 'eye':'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
 'search':'M14 9a5 5 0 1 1-10 0 5 5 0 0 1 10 0 M13 13l7 7',
 'rest':'M4 17h16 M6 17V9h12v8 M3 21v-4 M21 21v-4',
 'talk':'M3 4h18v13H9l-6 4Z M7 8h10 M7 12h7',
 'weapon':'M5 21 17 9l3-6-6 3L2 18 M3 13l8 8',
 'armor':'M12 2 21 6v7c0 5-9 9-9 9s-9-4-9-9V6Z M12 6v12',
 'ration':'M8 4h8l-1 4 4 5v8H5v-8l4-5Z M5 15h14',
 '◇':'M12 3 20 12 12 21 4 12Z M12 7v10 M8 12h8',
 '⌁':'M3 5 9 3 15 5 21 3v16l-6 2-6-2-6 2Z M9 3v16 M15 5v16',
 '▱':'M7 7V5a5 5 0 0 1 10 0v2 M5 7h14l2 14H3Z M8 12h8',
 '○':'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-3a8 8 0 0 1 16 0v3',
 '✧':'M5 4h14v16H5Z M8 8h8 M8 12h5 M8 16h8',
 '≡':'M4 4h7l1 2 1-2h7v16h-7l-1 2-1-2H4Z M12 6v16',
 '?':'M9 8a3 3 0 1 1 5 2l-2 2v2 M12 18h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
 '↑':'M12 20V4 M5 11l7-7 7 7','↓':'M12 4v16 M5 13l7 7 7-7',
 '←':'M20 12H4 M11 5l-7 7 7 7','→':'M4 12h16 M13 5l7 7-7 7',
 '↗':'M5 19 19 5 M5 5h14v14','⌂':'M3 11 12 3l9 8 M5 10v11h14V10 M10 21v-7h4v7',
 '▶|':'M5 4v16l11-8Z M20 4v16','◐':'M12 2v20 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
 '+':'M12 5v14 M5 12h14','−':'M5 12h14','⤢':'M9 3H3v6 M15 3h6v6 M3 15v6h6 M21 15v6h-6',
 '◎':'M12 2v3 M12 19v3 M2 12h3 M19 12h3 M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0 M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
 '▧':'M3 3h18v18H3Z M3 17l6-7 5 5 3-3 4 5 M16 7h.01',
 'compass':'M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2Z M12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5 M5 5l3 3 M19 5l-3 3 M5 19l3-3 M19 19l-3-3',
 'dots':'M5 12h.01 M12 12h.01 M19 12h.01',
 'fire':'M12 22c-4 0-7-3-7-7 0-3 2-5 3-7 1 2 2 3 3 3 0-3 1-6 4-9 0 4 4 6 4 11 0 5-3 9-7 9Z M12 22c-2 0-3-1.5-3-3.5 0-1.5 1-2.5 2-3.5.5 1 1 1.5 1.5 1.5.5-1 1-2 2-3 .5 2 1.5 3 1.5 5 0 2-1.5 3.5-4 3.5Z',
 'potion':'M10 2h4 M10 2v5L5 15a5 5 0 0 0 4.5 7h5a5 5 0 0 0 4.5-7L14 7V2 M7 15h10',
 'swords':'M14.5 17.5 3 6V3h3l11.5 11.5 M13 19l6-6 M16 16l4 4 M19 21l2-2 M9.5 17.5 21 6V3h-3L6.5 14.5 M11 19l-6-6 M8 16l-4 4 M5 21l-2-2',
 'heart':'M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z',
 'coin':'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18 M12 6.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11 M12 9v6 M9.5 12h5',
 'moon':'M20 15.5A8.5 8.5 0 1 1 8.5 4a7 7 0 0 0 11.5 11.5Z',
 'sun':'M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10 M12 1v3 M12 20v3 M1 12h3 M20 12h3 M4.2 4.2l2.1 2.1 M17.7 17.7l2.1 2.1 M4.2 19.8l2.1-2.1 M17.7 6.3l2.1-2.1',
 'paw':'M12 13c-3 0-6 3-6 5.5S8 21 12 21s6-.5 6-2.5S15 13 12 13Z M5.5 11a2 2.5 0 1 0 0-.1 M18.5 11a2 2.5 0 1 0 0-.1 M9 7a2 2.5 0 1 0 0-.1 M15 7a2 2.5 0 1 0 0-.1',
 'star':'M12 2l3 6.5 7 .9-5.1 4.9 1.3 7L12 18l-6.2 3.3 1.3-7L2 9.4l7-.9Z',
 'shield':'M12 2 21 6v7c0 5-9 9-9 9s-9-4-9-9V6Z',
 'bolt':'M13 2 4 14h7l-1 8 9-12h-7Z'
};
function controlIcon(icon){const wrapper=el('span',{'aria-hidden':true});if(!iconPaths[icon]){wrapper.textContent=icon;return wrapper;}const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');for(const [key,value] of Object.entries({viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':'1.6','stroke-linecap':'round','stroke-linejoin':'round',focusable:'false',class:'control-icon'}))svg.setAttribute(key,value);const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',iconPaths[icon]);svg.append(path);wrapper.append(svg);return wrapper;}
const iconButton=(icon,label,handler,extra={})=>button(controlIcon(icon),handler,{'aria-label':label,title:label,...extra});
const card=(...children)=>el('section',{class:'card stack'},...children);
const subtitle=text=>el('p',{class:'muted'},text);
function message(text,isError=false){notice.textContent=text||'';notice.hidden=!text;notice.classList.toggle('error',isError);}
async function api(path,body){const options={credentials:'same-origin',headers:{Accept:'application/json'}};if(body){options.method='POST';options.headers['Content-Type']='application/json';const csrf=path.startsWith('/api/master/')?master?.csrf_token||state?.csrf_token:state?.csrf_token||master?.csrf_token;options.body=JSON.stringify({...body,csrf_token:csrf});if(csrf)options.headers['X-CSRF-Token']=csrf;}const response=await fetch(path,options);let data;try{data=await response.json();}catch(_){throw Error('El servidor no devolvió una respuesta legible. Intenta de nuevo.');}if(!response.ok&&!(path==='/api/master/state'&&response.status===401&&data.authenticated===false)){const error=Error(data.message||'No se pudo completar esta acción.');error.status=response.status;throw error;}return data;}
function recordNarrative(next,confirmedAction=false){const before=journal.room;journal.consume(next,confirmedAction);if(before!==journal.room){const now=Date.now();if(lastArrivalAt&&now-lastArrivalAt<2000)travelPaceUntil=now+3500;lastArrivalAt=now;}}
async function refresh(confirmedAction=false){const next=await api('/api/state');if(next.authenticated)recordNarrative(next,confirmedAction);state=next;render();}
async function mutate(path,payload){if(busy)return false;const previousLocation=state?.character?.location,wasInCombat=Boolean(state?.character?.combat),attributeScroll=path==='/api/action'&&payload.id==='atributo'&&view==='character'?window.scrollY:null,writtenScroll=path==='/api/action'&&typeof payload.text==='string'?window.scrollY:null;let succeeded=false;busy=true;if(path==='/api/action')commandError='';message('');document.querySelectorAll('button').forEach(b=>{if(!b.disabled){b.disabled=true;b.dataset.working='';}});try{const result=await api(path,payload);if(path==='/api/action'&&!confirmedRequests.has(payload.request_id)){recordNarrative(result,true);confirmedRequests.add(payload.request_id);if(confirmedRequests.size>100)confirmedRequests.delete(confirmedRequests.values().next().value);}await refresh();pendingRetry=null;succeeded=true;if(path==='/api/action'&&payload.text)commandDraft='';if(path==='/api/action'&&(state?.character?.location!==previousLocation||(!wasInCombat&&state?.character?.combat)))main.querySelector('.room-context')?.scrollIntoView({block:'start',behavior:'instant'});}catch(error){if(path==='/api/action'&&payload.text)commandError=error.message;if(path==='/api/action'&&!error.status)pendingRetry={path,payload};message(path==='/api/action'&&payload.text?'':error.message,true);render();}finally{busy=false;document.querySelectorAll('[data-working]').forEach(b=>{b.disabled=false;b.removeAttribute('data-working');});render();if(attributeScroll!==null)window.scrollTo({top:attributeScroll,behavior:'instant'});if(!succeeded&&writtenScroll!==null)window.scrollTo({top:writtenScroll,behavior:'instant'});if(succeeded&&path==='/api/action'&&typeof payload.text==='string'&&payload.text.trim()&&view==='adventure'){const arrived=state?.character?.location!==previousLocation||(!wasInCombat&&state?.character?.combat);if(!arrived){following=true;followTerminal();}main.querySelector(arrived?'.room-context':'.reading')?.scrollIntoView({block:'start',behavior:'instant'});}}return succeeded;}
function perform(action){if(action.disabled||busy||pendingRetry)return;let confirmed=false;if(action.confirmation){confirmed=window.confirm(String(action.confirmation));if(!confirmed)return;}mutate('/api/action',actionPayload(action,requestId(),confirmed));}
function moveTo(direction){const action=actions(state.actions).find(a=>a.id==='mover'&&(a.target===direction||!a.target));if(action)perform({...action,target:direction});else message('Esta salida no está disponible ahora.',true);}
const viewPositions=new Map();
let positionCharacter=null;
function navigate(next){
 if(next===view)return;
 viewPositions.set(view,{page:window.scrollY,reading:captureReadingPosition(),opened:Array.from(main.querySelectorAll('details')).filter(d=>d.open).map(d=>d.querySelector('summary')?.textContent)});
 view=next;message('');render();
 const saved=viewPositions.get(next);
 for(const detail of main.querySelectorAll('details'))if(saved?.opened.includes(detail.querySelector('summary')?.textContent))detail.open=true;
 if(next==='adventure'&&saved)restoreReadingPosition(saved.reading);
 main.focus({preventScroll:true});window.scrollTo({top:saved?.page||0,behavior:'instant'});
}

function narrativeNode(event){return el('p',{class:`event event-${event.kind.toLowerCase()}`,'aria-label':combatReading(event)},el('span',{class:'event-kind'},kindNames[event.kind]||'Mundo'),combatReading(event));}

const terminalFeed=el('div',{class:'terminal-feed',tabIndex:0,'aria-label':'Lectura e historial del recorrido'}),printed=new Map();
let printTimer=null,following=true,readingVisit=null,expectedTop=null;
// Only the reader's own scrolling decides whether the terminal keeps following new text:
// a scroll that lands exactly where the game moved the terminal is the game's, not the reader's.
const autoScroll=top=>{expectedTop=Math.max(0,Math.min(top,terminalFeed.scrollHeight-terminalFeed.clientHeight));};
terminalFeed.addEventListener('scroll',()=>{const own=expectedTop!==null&&Math.abs(terminalFeed.scrollTop-expectedTop)<2;expectedTop=null;if(!own)following=terminalFeed.scrollHeight-terminalFeed.scrollTop-terminalFeed.clientHeight<45;});
function instantReading(){return document.documentElement.classList.contains('reduced-motion')||window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
function followTerminal(){if(following){autoScroll(terminalFeed.scrollHeight);terminalFeed.scrollTo({top:terminalFeed.scrollHeight,behavior:'auto'});}}
function resetTerminal(){autoScroll(0);clearTimeout(printTimer);printTimer=null;printed.clear();terminalFeed.replaceChildren();following=true;}
function finishPrinting(){clearTimeout(printTimer);printTimer=null;for(const item of printed.values()){item.at=item.text.length;item.node.hidden=false;item.output.textContent=item.text;}followTerminal();}
function printNext(){
 printTimer=null;if(!terminalFeed.isConnected)return;
 const item=Array.from(printed.values()).find(item=>item.at<item.text.length);
 // Urgent lines (combat) appear at once: still follow them to the bottom.
 if(!item){followTerminal();return;}
 if(instantReading()){finishPrinting();return;}
 const walking=Date.now()<travelPaceUntil;item.node.hidden=false;item.at=Math.min(item.text.length,item.at+(walking?12:4));item.output.textContent=item.text.slice(0,item.at);followTerminal();
 printTimer=setTimeout(printNext,item.at===item.text.length?(walking?25:80):(walking?12:18));
}
function captureReadingPosition(){return {top:terminalFeed.scrollTop,page:window.scrollY,following};}
function restoreReadingPosition(position){
 autoScroll(position.top);following=position.following;terminalFeed.scrollTop=position.top;
 window.scrollTo({top:position.page,behavior:'instant'});
}

function syncTerminal(){
 const visit=history.at(-1)?.visit??null,changed=visit!==readingVisit;if(changed){resetTerminal();readingVisit=visit;}
 const visible=(visit===null?history:history.filter(event=>event.visit===visit)).filter(event=>event.kind!=='LOCATION');
 const keys=new Set(visible.map(event=>event.key));for(const [key,item] of printed){if(!keys.has(key)){item.node.remove();printed.delete(key);}}
 for(const event of visible){if(printed.has(event.key))continue;const text=combatReading(event);
  const output=el('span',{'aria-hidden':true}),node=el('p',{class:`event event-${event.kind.toLowerCase()}`,hidden:true,role:'group','aria-label':text},el('span',{class:'event-kind','aria-hidden':true},kindNames[event.kind]||'Mundo'),output);
  const immediate=event.kind==='LOCATION'||event.urgent===true;if(immediate){node.hidden=false;output.textContent=text;}
  printed.set(event.key,{node,output,text,at:immediate?text.length:0});terminalFeed.append(node);
 }
 if(instantReading())finishPrinting();else if(!printTimer)printTimer=setTimeout(printNext,0);
 return changed;
}

function readingFont(mode){
 for(const [name,key] of [['large','font'],['small','small-font']]){
  const active=mode===name;document.documentElement.classList.toggle(`${name}-reading`,active);
  try{localStorage.setItem('vt-new:'+key,active?'on':'off');}catch(_){}
 }
 document.querySelectorAll('[data-font]').forEach(control=>control.setAttribute('aria-pressed',String(control.getAttribute('data-font')===mode)));
}

function title(label,heading){return el('div',{},el('span',{class:'eyebrow'},label),el('h1',{},heading));}

function rememberedUsername(){try{return localStorage.getItem('vt-new:username')||'';}catch(_){return '';}}
async function rememberBrowserLogin(username,password,director=false){
 if(!director){try{localStorage.setItem('vt-new:username',username);}catch(_) {}}
 if(!window.isSecureContext||!window.PasswordCredential||!navigator.credentials?.store)return;
 try{await navigator.credentials.store(new window.PasswordCredential({id:username,password,name:director?'Director de Vintage Telnet':username}));}catch(_) {}
}
function field(label,type,name,autocomplete,required=true,value=undefined){const input=el('input',{type,name,autocomplete,required,value,autocapitalize:name==='username'?'none':undefined,spellcheck:name==='username'?false:undefined,placeholder:' ',minLength:type==='password'?8:name==='username'?3:2,maxLength:type==='password'?200:name==='username'?40:50});return el('label',{class:'field'},label,input);}
function authScreen(){const form=el('form',{class:'stack',autocomplete:'on',action:`/api/account/${authMode}`,method:'post',onsubmit:async e=>{e.preventDefault();if(busy)return;const data=new FormData(e.currentTarget),username=String(data.get('username')).trim(),password=String(data.get('password'));const succeeded=await mutate(`/api/account/${authMode}`,{username,password});if(succeeded)void rememberBrowserLogin(state?.account?.username||username,password);}},field('Nombre de cuenta','text','username','username',true,authMode==='login'?rememberedUsername():''),field('Contraseña','password','password',authMode==='login'?'current-password':'new-password'),el('button',{type:'submit',class:'primary',disabled:busy},authMode==='login'?'Entrar':'Crear cuenta'));main.replaceChildren(card(title('Tu próximo recorrido','El mundo empieza al leer.'),subtitle('Entra, encuentra tu lugar y decide adónde te lleva la aventura.'),el('div',{class:'tabs'},...['login','register'].map(mode=>button(mode==='login'?'Entrar':'Crear cuenta',()=>{authMode=mode;render();},{'aria-pressed':mode===authMode}))),form,el('p',{class:'form-footer'},'Tu personaje necesita la aprobación del director antes de comenzar.')));}

function genderField(value=null){return el('label',{class:'field'},'Género',el('select',{name:'gender','aria-label':'Género',required:true,disabled:busy},el('option',{value:'',disabled:true,selected:!['masculino','femenino'].includes(value)},'Elige…'),...['masculino','femenino'].map(gender=>el('option',{value:gender,selected:value===gender},gender==='masculino'?'Masculino':'Femenino'))));}
const speciesDescriptions={
 humano:'Humanos ordinarios, con arraigo y cuidado cotidiano.',
 felaryn:'Humanoides felinos con cola y pies digitígrados; gran equilibrio y salto.',
 dravak:'Bajos y compactos, con pequeñas placas pétreas y sensibilidad a las vibraciones.',
 marevyn:'Altos, con membranas interdigitales y habilidad acuática; respiran aire.',
 vesperi:'Adaptados a poca luz, con ojos grandes y oído muy sensible.'
};
function speciesSelector(){
 const fieldContainer=el('div',{class:'field'},el('span',{},'Especie'));
 const gallery=el('div',{class:'species-choice-list',role:'radiogroup','aria-label':'Elegir especie'});
 const speciesList=['humano','felaryn','dravak','marevyn','vesperi'];
 speciesList.forEach((id,index)=>{
  const portrait=speciesPortraits?.[id];
  const radio=el('input',{type:'radio',name:'species',value:id,id:`species-opt-${id}`,required:true,checked:index===0});
  const label=el('label',{class:'species-choice-card',htmlFor:`species-opt-${id}`},
   radio,
   portrait?el('img',{class:'species-thumbnail',src:portrait,alt:'',loading:'lazy',decoding:'async'}):null,
   el('div',{class:'species-info'},
    el('strong',{},speciesNames[id]||id),
    speciesDescriptions[id]?el('small',{class:'species-desc'},speciesDescriptions[id]):null
   )
  );
  gallery.append(label);
 });
 fieldContainer.append(gallery);
 return fieldContainer;
}
function creationScreen(){const form=el('form',{class:'stack',onsubmit:e=>{e.preventDefault();const data=new FormData(e.currentTarget);mutate('/api/character/create',{name:String(data.get('name')),species:String(data.get('species')),class_id:String(data.get('class_id')),gender:String(data.get('gender'))});}},field('Nombre de tu personaje','text','name','nickname'),speciesSelector(),el('label',{class:'field'},'Clase',el('select',{name:'class_id',required:true},...Object.entries(classNames).map(([id,label])=>el('option',{value:id},label)))),genderField(),el('button',{type:'submit',class:'primary',disabled:busy},'Presentar mi personaje'));const characters=list(state.characters),pending=characters.filter(c=>c.status!=='approved');main.replaceChildren(card(title('Un lugar en el mundo','Tu personaje'),subtitle('Elige su nombre, especie, clase y género. El director revisará la solicitud.'),...pending.map(c=>el('div',{class:'tile'},el('h3',{},c.name),subtitle(`${speciesNames[c.species]||c.species} · ${classNames[c.class_id]||c.class_id}`),el('span',{class:'pill'},'Pendiente de aprobación'))),state.pending_approval||pending.length?button('Comprobar aprobación',async()=>{try{await refresh();if(state?.pending_approval||list(state?.characters).some(c=>c.status!=='approved')||!state?.character||state?.character?.status!=='approved'){message('El director aún está revisando tu personaje.');}}catch(e){message(e.message,true);}}):form,...characters.filter(c=>c.status==='approved').map(c=>button(`Entrar con ${c.name}`,()=>mutate('/api/character/select',{character_id:c.id})))));}
const actionIcons={guardia_comprometida:'shield',paso_ruptura:'swords',impulso_arcano:'bolt',velo_contencion:'shield',destello_frio:'star',borrar_foco:'eye',golpe_apertura:'weapon',distraccion:'talk',tiro_interrupcion:'weapon',traba_campo:'armor',balsamo_campo:'heart',mirar:'eye',observar:'search',buscar:'search',examinar:'search',evaluar:'search',atacar:'swords',combatir:'swords',acercarse:'eye',retirarse:'↗',defender:'shield',proteger:'shield',huir:'↗',descansar:'fire',hablar:'talk',conversar:'talk',hablar_adversario:'talk',comprar:'coin',vender:'coin',equipar:'armor',usar:'potion',mover:'→',mirar_direccion:'eye',capacidad:'bolt',examinar_criatura:'paw',aceptar:'star',cobrar:'star',afinar:'weapon',reparar:'weapon',recuperacion:'heart',fusionar:'swords',cuidar_numen:'heart',alimentar_numen:'ration',nombrar_numen:'paw',descansar_numen:'fire',activar_numen:'paw',apoyo_numen:'star',observar_numen:'eye',aproximar_numen:'eye',confiar_numen:'talk',forzar_numen:'talk',calmar_numen:'talk',vincular_numen:'star'};
const actionTone=id=>['atacar','combatir','defender','proteger','huir','capacidad','apoyo_numen'].includes(id)?'fight':['comprar','vender','afinar','reparar','cobrar','fusionar'].includes(id)?'trade':['hablar','conversar','hablar_adversario','aceptar','confiar_numen','forzar_numen','calmar_numen'].includes(id)?'talk':['usar','descansar','recuperacion','equipar','cuidar_numen','alimentar_numen','nombrar_numen','descansar_numen'].includes(id)?'care':['mirar','observar','buscar','examinar','evaluar','examinar_criatura','acercarse','retirarse','observar_numen','aproximar_numen'].includes(id)?'explore':'story';
let namingNumen=null;
function numenNameForm(action,initialName=''){
 const key=`${action.id}:${action.target||''}`;
 return el('form',{class:'stack numen-name-form',onsubmit:async event=>{
  event.preventDefault();if(busy||pendingRetry)return;
  const data=new FormData(event.currentTarget),name=String(data.get('name')||'').trim();
  if(await mutate('/api/action',actionPayload({...action,name},requestId()))){if(namingNumen===key)namingNumen=null;render();}
 }},
  el('label',{class:'field'},action.id==='vincular_numen'?'Nombre para tu compañero Númen':'Nuevo nombre del Númen',el('input',{type:'text',name:'name',value:initialName,required:true,minLength:2,maxLength:24,placeholder:'2 a 24 caracteres',autocomplete:'off',disabled:busy})),
  el('div',{class:'choices'},el('button',{type:'submit',class:'primary',disabled:busy},action.id==='vincular_numen'?'Confirmar vínculo y nombre':'Guardar nombre'),button('Cancelar',()=>{namingNumen=null;render();},{disabled:busy}))
 );
}
function actionButton(action){const classAction=Object.values(classActions).flat().find(entry=>entry.id===action.id),wait=action.reason?.match(/(\d+)\s*s(?:egundos)?\b/i),cooldown=action.reason?.match(/Recarga:\s*(\d+)\s*rondas/i),funds=action.reason?.match(/Te faltan (\d+) sellos/),fuseMat=action.id==='fusionar'&&action.reason?.match(/necesita \d+ unidades? de ([^(.]+).*?Te faltan (\d+)/),powerHint=capabilityReadingHint(action),hint=action.disabled?(wait?`Espera ${wait[1]} s`:cooldown?`Recarga: ${cooldown[1]} rondas`:funds?`Faltan ${funds[1]} sellos`:fuseMat?`Faltan ${fuseMat[2]} ${fuseMat[1].trim()}`:powerHint?powerHint:action.id==='descansar'?action.reason?.startsWith('Ya estás')?'Ya estás recuperado':'Descanso agotado':action.id==='afinar'&&action.reason?.startsWith('Consume ')?action.reason.replace(/^Consume /,'Necesitas '):action.reason==='No necesitas atención ahora.'?'No lo necesitas':action.reason==='Tu decisión está preparada para esta ronda.'?'Espera la ronda':'No disponible'):powerHint;return button(el('span',{class:'action-content'},actionIcons[action.id]?el('span',{class:'action-symbol','aria-hidden':true},controlIcon(actionIcons[action.id])):null,el('span',{class:'action-label'},action.label),classAction?el('small',{class:'action-description'},action.description||classAction.description):null,['comprar','afinar'].includes(action.id)&&!action.disabled&&action.reason&&!/^Te faltan \d+ sellos\.?$/.test(action.reason)?el('small',{class:'action-reason'},action.reason):null,(classAction?action.disabled? action.reason||'No disponible':null:hint)?el('small',{class:'action-reason'},classAction?action.reason||'No disponible':hint):null),()=>{if(['vincular_numen','nombrar_numen'].includes(action.id)&&!action.name){namingNumen=`${action.id}:${action.target||''}`;render();main.querySelector('.numen-name-form input')?.focus();return;}perform(action);},{class:`game-action${['atacar','defender','proteger','huir'].includes(action.id)?' combat-choice':classAction||action.id==='capacidad'?' capability-choice':''}`,'data-tone':classAction?'fight':actionTone(action.id),title:action.reason||action.label,'aria-description':action.reason||undefined,disabled:busy||Boolean(pendingRetry)||action.disabled||Boolean(state.character?.combat?.intervention_pending)});}

function artPeek(art,label,extraClass=''){
 const peek=el('img',{class:'art-peek',src:art.thumbnail||art.illustration,alt:'',loading:'lazy',decoding:'async',onerror:event=>{if(art.illustration&&event.currentTarget.src!==art.illustration){event.currentTarget.src=art.illustration;}else{event.currentTarget.remove();}}});
 return button([controlIcon('▧'),peek],()=>openIllustration(art),{class:`art-icon ${extraClass}`.trim(),'aria-label':label,title:label});
}
function statusBar(c){
 const bar=(icon,label,value,max,tone,text)=>el('div',{class:`hud-bar hud-${tone}`,role:'img','aria-label':`${label}: ${text}`},controlIcon(icon),el('span',{class:'hud-track'},el('span',{class:'hud-fill',style:`width:${Math.max(0,Math.min(100,100*value/(max||1)))}%`})),el('span',{class:'hud-value'},text));
 const bonded=list(c.numenes?.bonded||state?.numenes?.bonded),activeId=c.numenes?.active||state?.numenes?.active,active=bonded.find(n=>n.id===activeId)||c.active_numen||null;
 const numenChip=(active||bonded.length)?button([controlIcon('paw'),el('span',{class:'hud-numen-text'},active?`${active.name} · ${active.mood||'contento'}`:'Compañero')],event=>{event.stopPropagation();navigate('numen');},{class:'hud-chip hud-numen','aria-label':active?`Compañero Númen: ${active.name}, ${active.mood||'contento'}`:'Ver compañero Númen',title:active?`${active.name} (${active.mood||'contento'})`:'Ver compañero Númen'}):null;
 return el('div',{class:'hud',onclick:()=>navigate('character')},bar('heart','Vida',c.hp,c.hp_max,'life',`${whole(c.hp)}/${whole(c.hp_max)}`),bar('bolt','Energía',100-(c.fatigue||0),100,'energy',`${whole(100-(c.fatigue||0))}%`),el('span',{class:'hud-chip','aria-label':`Sellos: ${c.seals}`},controlIcon('coin'),String(c.seals??0)),el('span',{class:'hud-chip hud-level','aria-label':`Nivel ${c.level}`},controlIcon('star'),`Nv ${c.level??1}`),numenChip);
}
function exitsPanel(available){
 const arrows={norte:'↑',sur:'↓',este:'→',oeste:'←',hogar:'⌂'},moves=available.filter(a=>a.id==='mover');
 if(!moves.length)return null;
 const order=['norte','este','sur','oeste'],rank=a=>{const i=order.indexOf(a.target);return i<0?9:i;},sorted=[...moves].sort((a,b)=>rank(a)-rank(b));
 return el('section',{class:'card exits-panel','aria-label':'Salidas'},el('h2',{class:'panel-title'},'Salidas'),el('div',{class:'exit-list'},...sorted.map(action=>{const [dir,...rest]=action.label.split(' · ');return button([el('span',{class:'exit-arrow'},controlIcon(arrows[action.target]||'↗')),el('strong',{},dir),el('span',{class:'exit-name'},rest.join(' · ')||'')],()=>perform(action),{class:'exit-row','data-direction':action.target,title:action.reason||action.label,disabled:busy||Boolean(pendingRetry)||action.disabled||Boolean(state.character?.combat)});})));
}
function combatMeter(combat){
 const rows=[[state.character,'Tú'],[combat,combat.name]];
 return el('div',{class:'combat-vitals'},...rows.map(([fighter,name])=>{
  const max=Math.max(1,Number(fighter.hp_max)||1),hp=Math.max(0,Math.min(max,Number(fighter.hp)||0)),ratio=hp/max;
  const fill=el('span',{class:'combat-vital-fill'});fill.style.width=`${ratio*100}%`;
  const meter=el('span',{class:`combat-vital-track ${ratio<=.25?'health-critical':ratio<=.5?'health-low':'health-good'}`,role:'meter','aria-label':`Salud de ${name}`,'aria-valuemin':0,'aria-valuemax':max,'aria-valuenow':hp,'aria-valuetext':`${Math.ceil(hp)} de ${Math.ceil(max)}`,title:`${name}: ${Math.ceil(hp)}/${Math.ceil(max)}`},fill);
  return el('div',{class:'combat-vital-row'},el('small',{},name),meter);
 }));
}
function localPeople(snapshot){const people=list(snapshot.presence),chat=list(snapshot.chat);const panel=el('section',{class:'card local-people','aria-label':'Personas y conversación del lugar'},el('h2',{},'También aquí'),people.length?el('p',{},people.map(person=>person.name).join(', ')):subtitle('No hay otra persona jugando aquí ahora.'));if(chat.length)panel.append(el('ol',{class:'local-messages'},...chat.map(entry=>el('li',{},el('strong',{},entry.sender+': '),entry.text))));panel.append(subtitle('La conversación llega a las personas de este lugar. Escribe «decir tu mensaje» en la entrada de decisiones para hablar.'));return panel;}
function adventure(){const readingPosition=captureReadingPosition();const room=state.room;if(!room){main.replaceChildren(card(title('Aventura','Preparando tu llegada'),subtitle('Tu personaje está disponible, pero falta el contexto del lugar.'),button('Actualizar',()=>refresh().catch(e=>message(e.message,true)))));return;}
 const ambient=state.ambient||room.ambient||{},phase=textLabel(ambient.time_of_day||ambient.time),weather=textLabel(ambient.weather),region=regionNames[room.region]||room.region||'';
 const metadata=el('details',{class:'room-details'},el('summary',{'aria-label':'Información del lugar y tu estado',title:'Información del lugar y tu estado'},'ⓘ'),el('div',{class:'room-metadata'},el('p',{class:'place-label'},region),el('p',{class:'muted'},`Vitalidad ${whole(state.character.hp)}/${whole(state.character.hp_max)} · Fatiga ${whole(state.character.fatigue)}`),el('div',{class:'ambient'},...[[phase,'Hora'],[weather,'Clima']].filter(([text])=>text).map(([text,label])=>el('span',{class:'pill','aria-label':`${label}: ${text}`},text)))));
 const art=placeArt(room);
 const artButton=art?artPeek(art,`Ver vista de ${art.name}`):null;
 const night=/noche|atardecer/i.test(phase||''),timeChip=phase||weather?el('span',{class:'time-chip',title:[phase,weather].filter(Boolean).join(' · ')},controlIcon(night?'moon':'sun'),el('span',{},[phase,weather].filter(Boolean).join(' · '))):null;
 // One compact strip: place, region, time and tools; the reading below keeps the space.
 const hero=el('header',{class:'scene-hero scene-hero-plain'},el('div',{class:'scene-title'},el('h1',{},room.name),region?el('p',{},region):null),el('div',{class:'scene-tools'},timeChip,artButton,metadata,iconButton('⌁','Ver mapa',()=>navigate('map'),{class:'map-shortcut'})));
 const context=card(hero,statusBar(state.character));
 context.classList.add('room-context');
 if(state.character.combat){const combat=state.character.combat;context.append(el('div',{class:'selection'},el('h3',{},combat.illustration?artPeek({name:combat.name,illustration:combat.illustration,thumbnail:combat.illustration.replace('.webp','-thumb.webp'),caption:'Retrato del adversario. No es una entrada del bestiario.'},`Ver retrato de ${combat.name}`,'encounter-portrait'):null,`Encuentro · ${combat.name}`),combatMeter(combat),subtitle(`Ronda ${combat.round}${combat.prepared?' · '+(combat.prepared_action?.name||'Prepara un ataque'):''}`),combat.intervention_pending?subtitle(state.character.combat.combatant_kind==='human'?'Tu decisión está preparada. Esperas la respuesta del adversario.':'Tu decisión está preparada. Esperas la respuesta de la criatura.'):subtitle('Lee las señales antes de decidir.')));}
 const reading=el('section',{class:'reading','aria-label':'Crónica de tu aventura'},el('h2',{},'Crónica de viaje'),terminalFeed,el('div',{class:'reading-footer'},'El mundo continúa. Tú decides.',el('span',{'aria-hidden':true})));const visitChanged=syncTerminal();

 const available=actions(state.actions),contextual=available.filter(a=>!['mover','hablar','equipar','desequipar','usar','atributo','tecnica','vender','comprar','fusionar','nombrar_numen'].includes(a.id)),shopCount=available.filter(a=>['comprar','vender'].includes(a.id)).length,choices=el('section',{class:'card quick-actions','aria-label':'Decide tu siguiente paso'},el('h2',{class:'panel-title'},state.character.combat?'Combate':'Acciones'),el('div',{class:'choices action-grid'},...(shopCount&&!state.character.combat?[button(el('span',{class:'action-content'},el('span',{class:'action-symbol','aria-hidden':true},controlIcon('coin')),el('span',{class:'action-label'},'Tienda'),el('small',{class:'action-reason'},shopCount===1?'1 cosa':`${shopCount} cosas`)),()=>{shopSection=null;navigate('shop');},{class:'game-action','data-tone':'trade'})]:[]),...(state.character.combat?contextual:contextual.slice(0,shopCount?8:9)).map(actionButton)));
 const pendingBond=contextual.find(a=>a.id==='vincular_numen'&&namingNumen===`${a.id}:${a.target||''}`);
 if(pendingBond)choices.append(numenNameForm(pendingBond));

 const reasons=contextual.filter(a=>a.reason);if(reasons.length)choices.append(el('details',{class:'more'},el('summary',{},'Detalles de las acciones'),el('ul',{},...reasons.map(a=>el('li',{},el('strong',{},a.label+': '),a.reason)))));
 if(!state.character.combat&&contextual.length>9)choices.append(el('details',{class:'more'},el('summary',{},'Otras posibilidades'),el('div',{class:'choices'},...contextual.slice(9).map(actionButton))));

 const readingTools=el('div',{class:'reading-tools'},iconButton('▶|','Mostrar completo',finishPrinting),iconButton('↓','Ir a lo último',()=>{following=true;followTerminal();}),iconButton('A⁻','Letra más pequeña',()=>readingFont(document.documentElement.classList.contains('small-reading')?'normal':'small'),{'data-font':'small','aria-pressed':document.documentElement.classList.contains('small-reading')}),iconButton('A⁺','Letra más grande',()=>readingFont(document.documentElement.classList.contains('large-reading')?'normal':'large'),{'data-font':'large','aria-pressed':document.documentElement.classList.contains('large-reading')}),iconButton('◐','Contraste',event=>{const on=!document.documentElement.classList.contains('high-contrast');document.documentElement.classList.toggle('high-contrast',on);try{localStorage.setItem('vt-new:contrast',on?'on':'off');}catch(_){}event.currentTarget.setAttribute('aria-pressed',String(on));},{'aria-pressed':document.documentElement.classList.contains('high-contrast')}));reading.prepend(readingTools);
 const people=list(room.npcs);if(people.length){const peopleDetails=el('details',{class:'more'},el('summary',{},`Hablar con personajes (${people.length})`));for(const person of people){const entry=el('article',{class:'npc'},el('h3',{},person.name),person.role?el('span',{class:'pill'},person.role):null,person.description?el('p',{},person.description):null),talk=available.filter(a=>a.id==='hablar'&&(!a.target||a.target===person.id));if(talk.length)entry.append(el('div',{class:'topics'},...talk.map(actionButton)));peopleDetails.append(entry);}choices.append(peopleDetails);}
 const command=el('form',{class:'command-entry stack',onsubmit:event=>{event.preventDefault();if(busy||pendingRetry||state.character.combat?.intervention_pending)return;const input=event.currentTarget.elements.decision,text=input.value.trim();if(text)mutate('/api/action',{text,request_id:requestId()});}},el('label',{class:'field'},'Escribe tu decisión',el('input',{name:'decision',type:'text',value:commandDraft,oninput:event=>{commandDraft=event.target.value;},maxLength:200,placeholder:'Observar, norte, examinar…',autocomplete:'off',disabled:busy||Boolean(pendingRetry)||Boolean(state.character.combat?.intervention_pending)})),commandError?el('p',{class:'notice error',role:'alert'},commandError):null,el('button',{type:'submit',class:'primary',disabled:busy||Boolean(pendingRetry)||Boolean(state.character.combat?.intervention_pending)},'Decidir'));choices.append(command);
 const recent=el('details',{class:'history'},el('summary',{},'Releer lo vivido'),el('p',{class:'muted'},'Recuerdos de esta pestaña; las acciones actuales están arriba.'),el('div',{class:'reading'},...history.map(event=>narrativeNode(event))));main.replaceChildren(context,reading,choices,localPeople(state),recent);if(visitChanged){terminalFeed.scrollTop=0;following=true;}else restoreReadingPosition(readingPosition);if(instantReading()&&!visitChanged)followTerminal();}
function testerPanel(){if(!state.tester?.enabled)return null;return el('details',{class:'more'},el('summary',{},'Pruebas: cambiar de lugar'),subtitle('Sólo para este personaje. No revela caminos ni concede equipo o experiencia.'),el('form',{class:'stack',onsubmit:async event=>{event.preventDefault();if(busy)return;const data=new FormData(event.currentTarget);if(await mutate('/api/character/tester/travel',{destination:String(data.get('destination')),recover:data.get('recover')==='on'}))navigate('adventure');}},el('label',{class:'field'},'Destino',el('select',{name:'destination'},...state.tester.destinations.map(d=>el('option',{value:d.id,selected:d.id===state.character.location},d.name)))),el('label',{},el('input',{type:'checkbox',name:'recover',checked:true}),' Recuperar vitalidad y quitar fatiga/heridas para probar'),el('button',{type:'submit',class:'primary',disabled:busy},'Ir al destino de prueba')));}
function characterStat(label,value,c){const entry=el('div',{class:'stat'},el('small',{},label),el('strong',{},String(value)));const range=label==='Vitalidad'?[c.hp,c.hp_max]:label==='Experiencia'?[c.xp,c.xp_next]:null;if(range&&Number(range[1])>0){const fill=el('span',{class:'stat-meter-fill'});fill.style.width=`${Math.max(0,Math.min(100,Number(range[0])/Number(range[1])*100))}%`;entry.classList.add(label==='Vitalidad'?'stat-vitality':'stat-experience');entry.append(el('span',{class:'stat-meter','aria-hidden':true},fill));}return entry;}
const attributeNames={agilidad:'Agilidad',destreza:'Destreza',fuerza:'Fuerza',intelecto:'Intelecto',percepcion:'Percepción',presencia:'Presencia',resistencia:'Resistencia',voluntad:'Voluntad'},attributeIcons={agilidad:'bolt',destreza:'weapon',fuerza:'swords',intelecto:'≡',percepcion:'eye',presencia:'star',resistencia:'shield',voluntad:'fire'};
const slotNames={cabeza:'Cabeza',torso:'Torso',brazos:'Brazos',piernas:'Piernas',pies:'Pies',anillo:'Anillo',amuleto:'Amuleto',weapon:'Arma',block:'Escudo',armor:'Torso'},bonusNames={vida:'vida',precision:'precisión',dano:'daño',esquiva:'esquiva'};
function gearSummary(c){const inventory=list(state.inventory),equipment=c.equipment||{},worn=Object.entries(equipment).filter(([,id])=>id).map(([slot,id])=>[slot,inventory.find(item=>item.id===id)]).filter(([,item])=>item);const protection=Math.min(50,Math.round(worn.reduce((sum,[,item])=>sum+(item.kind==='armor'?item.armor_reduction||0:0),0)*100));return [['Protección',`${protection}% menos daño recibido`],['Equipo puesto',worn.length?worn.map(([slot,item])=>`${slotNames[slot]||slot}: ${item.name}`).join(' · '):'Nada']];}
function characterProgress(c){
 const valid=Number.isFinite(c.xp)&&Number.isFinite(c.xp_next)&&c.xp_next>0;
 return el('section',{class:'character-progress','aria-label':'Nivel y experiencia'},el('h2',{},`Nivel ${c.level??'pendiente de motor'}`),valid?el('label',{},`Experiencia (XP): ${c.xp} de ${c.xp_next}`,el('progress',{max:c.xp_next,value:Math.max(0,Math.min(c.xp,c.xp_next)),'aria-label':'Experiencia hacia el siguiente nivel'})):subtitle('Progreso de experiencia pendiente de motor.'),valid?subtitle(`Faltan ${Math.max(0,c.xp_next-c.xp)} XP para alcanzar el siguiente nivel.`):null);
}
function characterCapabilities(){
 const actionsList=classActions[state.character?.class_id]||[];
 const available=actions(state.actions).filter(action=>action.id==='capacidad'||actionsList.some(entry=>entry.id===action.id));
 return el('section',{class:'character-capabilities'},
  el('h2',{},'Acciones de tu clase'),
  subtitle('Estas son las acciones que el juego ofrece ahora para tu clase.'),
  actionsList.length?el('ul',{class:'class-actions class-action-list'},...actionsList.map(entry=>{const current=actions(state.actions).find(action=>action.id===entry.id);return el('li',{},el('strong',{},current?.label||entry.label),el('p',{},current?.description||entry.description));})):(available.length?el('ul',{class:'class-action-list'},...available.map(action=>el('li',{},el('strong',{},action.label),subtitle(action.reason||capabilityReadingHint(action)||'Disponible en la aventura.')))):subtitle('No hay acciones de clase disponibles en este momento.')),
  button('Usar mis acciones en la aventura',()=>navigate('adventure'))
 );
}
function attributeUpgrade(name){
 if(!(state.character.pa>0))return null;
 const action=actions(state.actions).find(action=>action.id==='atributo'&&action.target===name);
 return button('+',()=>perform(action),{class:'attribute-upgrade','aria-label':action?.label||`Mejorar ${attributeNames[name]||name}: PA insuficientes`,title:action?.label||'PA insuficientes',disabled:busy||Boolean(pendingRetry)||!action||Boolean(action.disabled)});
}
const numenSilhouettes={a:'🐕',b:'🐈',c:'🦎',d:'🦦',e:'🦊',f:'🦉',g:'🐐',h:'🐢'};
const numenMoodDescriptions={
 'contento':'Contento · Te acompaña con energía y curiosidad.',
 'con hambre':'Con hambre · Te mira esperando un Bocado de Númen.',
 'decaído':'Decaído · Lleva muchas horas sin comer o descansar, pero sigue a tu lado.'
};
let numenAnim='',numenReactionText='';
async function triggerNumenCare(action,animKind){
 if(busy||pendingRetry)return;
 numenAnim=animKind;render();
 const ok=await mutate('/api/action',actionPayload(action,requestId()));
 if(ok){
  const active=state?.character?.active_numen||(state?.numenes?.bonded||[]).find(n=>n.id===state?.numenes?.active);
  numenReactionText=active?.last_reaction||history.at(-1)?.text||'';
  numenAnim=animKind;render();
  setTimeout(()=>{if(numenAnim===animKind){numenAnim='';render();}},1800);
 }else{
  numenAnim='';render();
 }
}
function numenCard(numen,isActive,availableActions){
 const mood=numen.mood||'contento',trustLevel=numen.trust||1;
 const stageName=trustStageNames[numen.trust_stage]||numen.trust_stage||`Etapa ${trustLevel}`;
 const stars='★'.repeat(trustLevel)+'☆'.repeat(Math.max(0,3-trustLevel));
 const moodTone=mood==='contento'?'care-good':mood==='con hambre'?'care-hungry':'care-need';
 const cardEl=el('article',{class:`tile numen-card${isActive?' numen-active':''}`},
  el('div',{class:'numen-heading'},
   numenArt(numen,{class:'species-thumbnail'}),
   el('div',{class:'numen-title-group'},
    el('h3',{class:'numen-name'},numen.name),
    el('p',{class:'muted numen-species'},numen.species_name||'Compañero Númen')
   ),
   el('span',{class:`pill${isActive?' numen-pill-active':''}`},isActive?'En viaje':'En el refugio')
  ),
  el('div',{class:'numen-details'},
   el('div',{class:'numen-row numen-line'},el('strong',{},'Estado: '),el('span',{class:`pill ${moodTone} numen-mood-text`},mood)),
   el('div',{class:'numen-row'},el('strong',{},'Confianza: '),el('span',{class:'numen-trust'},`${stageName} `),el('span',{class:'numen-stars','aria-label':`${trustLevel} de 3 estrellas`},stars)),
   el('div',{class:'numen-row'},el('strong',{},'Apoyo: '),el('span',{},numen.power_name||'Apoyo sutil con recarga')),
   numen.last_reaction?el('p',{class:'muted numen-last-reaction'},numen.last_reaction):null
  )
 );
 const renameAction=availableActions.find(a=>a.id==='nombrar_numen'&&a.target===numen.id)||{id:'nombrar_numen',target:numen.id,label:`Cambiar nombre de ${numen.name}`,reason:`Darle un nuevo nombre a ${numen.name}.`};
 if(isActive){
  const careActions=[...availableActions.filter(a=>['cuidar_numen','alimentar_numen','descansar_numen'].includes(a.id)),renameAction];
  cardEl.append(el('div',{class:'numen-actions'},el('h4',{class:'numen-actions-title'},'Cuidados disponibles aquí:'),...careActions.map(actionButton),button([controlIcon('paw'),' Ver pantalla del compañero'],()=>navigate('numen'),{class:'primary numen-open-screen'})));
 }else{
  const activateAction=availableActions.find(a=>a.id==='activar_numen'&&a.target===numen.id)||{id:'activar_numen',target:numen.id,label:`Viajar con ${numen.name}`,reason:`Elegir a ${numen.name} como tu compañero activo.`};
  cardEl.append(el('div',{class:'numen-actions'},actionButton(activateAction),actionButton(renameAction)));
 }
 if(namingNumen===`nombrar_numen:${numen.id}`)cardEl.append(numenNameForm(renameAction,numen.name));
 return cardEl;
}
function numenArt(numen,attrs={}){
 const base=`/client/art/numenes/numen-${numen.model||'a'}-v1.webp`;
 const src=numen.variant?base.replace('-v1.webp',`-${numen.variant}-v1.webp`):base;
 return el('img',{...attrs,src,alt:`Ilustración de ${numen.name}`,decoding:'async',onerror:event=>{
  const img=event.currentTarget;
  if(img.getAttribute('src')!==base){img.src=base;return;}
  img.remove();
 }});
}
function numenSection(c){
 const numenes=c.numenes||state.numenes||{active:null,bonded:[]};
 const bonded=list(numenes.bonded),activeId=numenes.active;
 const active=bonded.find(n=>n.id===activeId)||c.active_numen||null;
 const section=el('section',{class:'numen-roster-section','aria-label':'Compañero Númen'});
 section.append(el('h2',{},'Compañero (Númen)'));
 if(!bonded.length){
  section.append(subtitle('Todavía no caminas con ningún Númen. Los Númenes observan con paciencia a los viajeros en rincones tranquilos del mundo; no se capturan ni se compran.'));
  return section;
 }
 if(active)section.append(el('p',{class:'numen-status-line'},`${active.name} (${active.species_name||'Compañero Númen'}): ${active.mood||'contento'}.`));
 section.append(subtitle(`Compañeros vinculados: ${bonded.length}/3 (máximo 1 activo en viaje).`));
 const available=actions(state.actions);
 if(active)section.append(numenCard(active,true,available));
 const others=bonded.filter(n=>n.id!==active?.id);
 if(others.length){
  section.append(el('h3',{class:'numen-shelter-heading'},'En el refugio (Hogar)'));
  for(const other of others)section.append(numenCard(other,false,available));
 }
 return section;
}
function numenView(){
 const c=state.character||{},numenes=c.numenes||state.numenes||{active:null,bonded:[]};
 const bonded=list(numenes.bonded),activeId=numenes.active;
 const active=bonded.find(n=>n.id===activeId)||c.active_numen||bonded[0]||null;
 if(!active){
  main.replaceChildren(card(title('Tu compañero','Aún no caminas con un Númen'),subtitle('Los Númenes observan en silencio a quienes recorren el mundo sin prisa. Cuando formes un vínculo voluntario, podrás cuidarlo aquí.'),button([controlIcon('←'),' Volver a la aventura'],()=>navigate('adventure'))));
  return;
 }
 const model=active.model||'a',mood=active.mood||'contento',moodKey=mood==='con hambre'?'hambre':mood==='decaído'?'decaido':'contento';
 const moodTone=mood==='contento'?'care-good':mood==='con hambre'?'care-hungry':'care-need';
 const fallback=el('div',{class:'numen-art-fallback'},
  el('span',{class:'numen-silhouette','aria-hidden':'true'},numenSilhouettes[model]||'🐾'),
  el('strong',{},active.name),
  el('small',{class:'muted'},active.species_name||'Compañero Númen')
 );
 const artImg=numenArt(active,{class:'numen-art-img',onload:event=>event.currentTarget.parentElement?.classList.add('has-art')});
 const animBadge=numenAnim?el('span',{class:'numen-response-badge',role:'status'},numenAnim==='heart'?'♥ Ronroneo alegre':numenAnim==='jump'?'✦ ¡Salto de alegría!':'☾ Descanso tranquilo'):null;
 const artFrame=el('div',{class:`numen-art-frame numen-mood-${moodKey}${numenAnim?` numen-anim-${numenAnim}`:''}`,'data-mood':mood},fallback,artImg,animBadge);
 const bocados=list(state.inventory).filter(item=>item.id==='bocado_numen'||item.kind==='numen_food').reduce((sum,item)=>sum+(Number(item.quantity)||1),0);
 const available=actions(state.actions);
 const feedAct=available.find(a=>a.id==='alimentar_numen')||{id:'alimentar_numen',label:'Dar Bocado de Númen'};
 const petAct=available.find(a=>a.id==='cuidar_numen')||{id:'cuidar_numen',label:'Acariciar'};
 const restAct=available.find(a=>a.id==='descansar_numen')||{id:'descansar_numen',label:'Descansar juntos'};
 const renameAct=available.find(a=>a.id==='nombrar_numen'&&a.target===active.id)||{id:'nombrar_numen',target:active.id,label:'Cambiar nombre',reason:`Darle un nuevo nombre a ${active.name}.`};
 const reactionLine=numenReactionText||active.last_reaction||'Se mantiene cerca de ti, atento a cada paso del camino.';
 const inCombat=Boolean(c.combat);
 const careButtons=el('div',{class:'numen-care-buttons choices'},
  button([controlIcon('ration'),bocados>0?` Dar Bocado de Númen (${bocados})`:' Dar Bocado de Númen'],()=>triggerNumenCare(feedAct,'jump'),{class:'game-action','data-tone':'care',disabled:busy||Boolean(pendingRetry)||inCombat,title:'Consume un Bocado de Númen (2 sellos en tiendas de provisiones)'}),
  button([controlIcon('heart'),' Acariciar'],()=>triggerNumenCare(petAct,'heart'),{class:'game-action','data-tone':'care',disabled:busy||Boolean(pendingRetry)||inCombat}),
  button([controlIcon('fire'),' Descansar juntos'],()=>triggerNumenCare(restAct,'purr'),{class:'game-action','data-tone':'care',disabled:busy||Boolean(pendingRetry)||inCombat}),
  button([controlIcon('paw'),' Cambiar nombre'],()=>{namingNumen=`nombrar_numen:${active.id}`;render();main.querySelector('.numen-name-form input')?.focus();},{class:'game-action','data-tone':'story',disabled:busy||Boolean(pendingRetry)||inCombat})
 );
 const rosterSection=bonded.length>1?el('section',{class:'numen-companion-roster stack','aria-label':'Compañeros vinculados'},
  el('h2',{class:'panel-title'},'¿Quién viaja contigo?'),
  ...bonded.map(entry=>{
   const traveling=entry.id===active.id;
   return el('div',{class:`tile numen-roster-item${traveling?' numen-active':''}`},
    el('div',{class:'numen-roster-info'},
     el('strong',{},entry.name),
     el('span',{class:'muted'},` · ${entry.species_name||'Númen'} · ${entry.mood||'contento'}`)
    ),
    traveling?el('span',{class:'pill numen-pill-active'},'Viaja contigo'):button([controlIcon('paw'),` Viajar con ${entry.name}`],()=>mutate('/api/action',actionPayload({id:'activar_numen',target:entry.id,label:`Viajar con ${entry.name}`},requestId())),{disabled:busy||Boolean(pendingRetry)||inCombat})
   );
  })
 ):null;
 main.replaceChildren(card(
  el('div',{class:'numen-companion-view stack'},
   title(active.species_name||'Compañero Númen',active.name),
   artFrame,
   el('div',{class:'numen-feeling-panel tile'},
    el('p',{class:'numen-feeling-line'},el('strong',{},'Cómo se siente: '),el('span',{class:`pill ${moodTone} numen-mood-text`},mood)),
    el('p',{class:'muted'},numenMoodDescriptions[mood]||numenMoodDescriptions.contento),
    el('p',{class:'numen-power-line'},el('strong',{},`Poder (${active.power_name||'Apoyo'}): `),active.power_desc||'Te acompaña y te apoya en los momentos difíciles.')
   ),
   el('blockquote',{class:'numen-reaction-box','aria-live':'polite'},reactionLine),
   careButtons,
   namingNumen===`nombrar_numen:${active.id}`?numenNameForm(renameAct,active.name):null,
   rosterSection
  )
 ));
}
function characterView(){const c=state.character,portrait=c.portrait||speciesPortraits[c.species],equipment=c.equipment||{},inventory=list(state.inventory),rows=[['Género',c.gender==='masculino'?'Masculino':c.gender==='femenino'?'Femenino':'Sin elegir'],['Especie',speciesNames[c.species]||c.species],['Clase',classNames[c.class_id]||c.class_id],['Vitalidad',`${whole(c.hp)}/${whole(c.hp_max)}`],['Fatiga',whole(c.fatigue)],['Sellos',c.seals],['Puntos de atributo',c.pa],['Puntos de técnica',c.pp],['Herida',c.wound==null?'Sin herida':typeof c.wound==='number'?c.wound===0?'Sin herida':`Grado ${c.wound}`:textLabel(c.wound)||'Sin información']];main.replaceChildren(card(el('div',{class:'character-heading'},portrait?button(el('img',{class:'species-thumbnail',src:portrait,alt:'',decoding:'async'}),()=>openIllustration({name:c.portrait?c.name:speciesNames[c.species],illustration:portrait}),{class:'species-art-button','aria-label':`Ver retrato de ${c.name}`}):null,title('Tu presencia en el mundo',c.name)),characterProgress(c),c.pa>0?el('p',{class:'pa-notice',role:'status'},`Tienes ${c.pa} puntos para mejorar`):null,el('div',{class:'stats'},...rows.filter(([,value])=>value!==undefined).map(([label,value])=>characterStat(label,value,c))),c.gender?null:el('form',{class:'stack',onsubmit:event=>{event.preventDefault();if(busy)return;const data=new FormData(event.currentTarget);mutate('/api/character/profile',{gender:String(data.get('gender'))});}},genderField(c.gender),el('button',{type:'submit',class:'primary',disabled:busy},'Guardar género')),testerPanel(),el('h2',{},'Equipo actual'),subtitle(gearSummary(c)[0].join(': ')),...Object.entries(equipment).map(([slot,id])=>subtitle(`${slotNames[slot]||slot}: ${id?(typeof id==='object'?id.name:inventory.find(entry=>entry.id===id)?.name)||'Equipo registrado (nombre pendiente de motor)':'Sin equipar'}`)),Object.keys(equipment).length?null:subtitle('No hay equipo indicado.'),button('Ver mi inventario',()=>navigate('inventory')),numenSection(c),characterCapabilities(),el('details',{class:'more'},el('summary',{},'Las cinco especies'),subtitle('Estas ilustraciones representan cada especie.'),el('div',{class:'species-gallery'},...Object.entries(speciesPortraits).map(([id,illustration])=>button(el('span',{},el('img',{class:'species-thumbnail',src:illustration,alt:'',loading:'lazy',decoding:'async'}),speciesNames[id]),()=>openIllustration({name:speciesNames[id],illustration}),{class:'species-gallery-button','aria-label':`Ver especie ${speciesNames[id]}`})))),el('h2',{},'Atributos'),el('div',{class:'attribute-grid'},...Object.entries(c.attributes||{}).map(([name,value])=>el('div',{class:'attribute'},el('span',{class:'attribute-icon'},controlIcon(attributeIcons[name]||'star')),el('small',{},attributeNames[name]||name),el('strong',{},String(value)),attributeUpgrade(name),el('p',{class:'attribute-description'},(c.attribute_effects||state.attribute_effects||{})[name]||attributeDescriptions[name]||'Explicación pendiente de motor.')))),...actions(state.actions).filter(action=>action.id==='tecnica').map(actionButton),list(state.characters).length>1?el('details',{class:'more'},el('summary',{},'Tus otros personajes'),...list(state.characters).filter(other=>other.id!==c.id).map(other=>button(`${other.name} · ${other.status==='approved'?'Disponible':'Pendiente'}`,()=>mutate('/api/character/select',{character_id:other.id})))):null));}
function sellingSection(compact=false){
 const sales=actions(state.actions).filter(action=>action.id==='vender');
 const section=el('section',{class:'selling-section','aria-label':'Venta de objetos'},el('h2',{},sales.length?'Vender aquí':'Dónde vender'));
 if(sales.length){section.append(subtitle(`En ${state.room?.name||'este lugar'} puedes vender ${sales.length===1?'este objeto':'estos objetos'}.`));if(compact)section.append(button(`Ver objetos para vender (${sales.length})`,()=>navigate('inventory'),{class:'primary'}));else for(const sale of sales){const item=list(state.inventory).find(item=>item.id===sale.target),same=list(state.inventory).filter(other=>other.name===item?.name),number=same.findIndex(other=>other.id===sale.target)+1;section.append(actionButton(same.length>1?{...sale,label:`${sale.label} · Ejemplar ${number}`,confirmation:sale.confirmation?`Ejemplar ${number} de ${same.length}. ${sale.confirmation}`:undefined}:sale));}}
 else{section.append(subtitle('Aquí no hay ventas disponibles para lo que llevas.'));if(compact){section.append(button('Buscar compradores',()=>navigate('inventory')));return section;}
 const buyers=list(state.map?.nodes).filter(node=>node.visited&&node.commerce&&(node.commerce.buys_materials||node.commerce.buys_weapons));
 if(buyers.length){section.append(subtitle('Compradores en lugares que ya conoces:'));for(const place of buyers)section.append(button(`Ver camino a ${place.name}`,()=>{selectedPlace=place.id;navigate('map');}));}
 else section.append(subtitle('Busca un comprador en los talleres o puestos del camino. Al descubrirlo, podrás orientarte desde el mapa.'));
 }
 return section;
}
function inventoryView(){const items=list(state.inventory),available=actions(state.actions),equipment=state.character.equipment||{},purchases=available.filter(action=>action.id==='comprar');const itemCards=items.map(item=>{const id=item.id||item.item_id||item.key,slot=Object.keys(equipment).find(slot=>equipment[slot]===id),same=items.filter(other=>other.name===item.name),number=same.findIndex(other=>other.id===id)+1;const entry=el('article',{class:`tile inventory-item${slot?' item-equipped':''}`},el('div',{class:'item-heading'},el('span',{class:'item-emblem','aria-hidden':true},controlIcon(item.kind==='weapon'?'weapon':item.kind==='armor'||item.kind==='accessory'?'armor':item.kind==='consumable'||item.kind==='numen_food'?'ration':'▱')),el('h3',{},item.name||item.label||'Objeto')),same.length>1?el('p',{class:'muted'},`Ejemplar ${number} de ${same.length}`):null,item.description?el('p',{},item.description):null,item.quantity!==undefined?el('span',{class:'pill'},`Cantidad: ${item.quantity}`):null,item.kind==='weapon'&&typeof item.damage==='number'?el('span',{class:'pill'},`Daño base: ${item.damage}`):null,item.kind==='armor'?el('span',{class:'pill'},`${slotNames[item.slot]||'Torso'} · −${Math.round((item.armor_reduction||0)*100)}% daño`):null,item.slot&&item.kind==='accessory'?el('span',{class:'pill'},slotNames[item.slot]):null,...Object.entries(item.bonus||{}).map(([key,value])=>el('span',{class:'pill'},`+${value} ${bonusNames[key]||key}`)),item.effect==='potion'?el('span',{class:'pill'},'Se puede usar en combate'):null,item.honed?el('span',{class:'pill'},'Afinada · +1 daño'):null,item.fusion?el('span',{class:'pill'},`Fusión +${item.fusion}${item.kind==='weapon'?` · +${item.fusion*2} daño`:item.kind==='armor'||item.kind==='block'?` · −${item.fusion*2}% daño`:''}`):null,typeof item.sell_price==='number'?el('span',{class:'pill'},`Valor: ${item.sell_price} sellos`):null,slot?el('span',{class:'pill'},'En uso'):null,item.condition==='damaged_event'?el('p',{class:'action-reason'},'Dañada: necesita reparación antes de equiparse.'):null,item.activated===false?el('p',{class:'action-reason'},'Pendiente de validación de Forja.'):null,...available.filter(action=>['equipar','usar','reparar','afinar','fusionar'].includes(action.id)&&action.target===id&&!(slot&&action.id==='equipar')).map(action=>actionButton(action.confirmation&&same.length>1?{...action,confirmation:`Ejemplar ${number} de ${same.length}. ${action.confirmation}`}:action)));if(slot){const remove=available.find(action=>action.id==='desequipar'&&action.target===slot);if(remove)entry.append(actionButton({...remove,label:'Guardar esta pieza'}));}return entry;});const sellHere=available.some(action=>action.id==='vender'),selling=sellHere?sellingSection():el('details',{class:'more selling-fold'},el('summary',{},'Dónde vender'),sellingSection());main.replaceChildren(card(title('Lo que llevas','Mochila'),subtitle(`Dispones de ${state.character.seals} sellos.`),subtitle('El contenido y el equipo reflejan tu situación real.'),...itemCards,items.length?null:subtitle('Tu mochila no contiene objetos visibles.'),...available.filter(action=>action.id==='equipar'&&!action.target).map(actionButton),purchases.length?el('section',{'aria-label':'Compras disponibles en este lugar'},el('h2',{},'Comprar aquí'),button(`Abrir la tienda (${purchases.length})`,()=>{shopSection=null;navigate('shop');},{class:'primary'})):null,selling));}
// Keep GPU resources when only nonvisual state (for example a cooldown) changes.
function mapVisualKey(snapshot){
 const character=snapshot?.character||{},map=orientationMap(snapshot?.map,character.location),equipment=character.equipment||{},equipped=new Set(Object.values(equipment));
 return JSON.stringify([character.id,character.species,character.class_id,equipment,list(snapshot?.inventory).filter(item=>equipped.has(item.id)),map,Array.from(discoveredLayout(map)),selectedPlace,snapshot?.ambient?.time_of_day,snapshot?.ambient?.weather]);
}
function visual3D(kind,id,options={}){
 const cameraKey=kind==='map'?JSON.stringify([options.character?.id,options.map.current,options.selected,Array.from(options.positions)]):null;
 const host=el('div',{class:kind==='map'?'world-3d':'figure-3d','aria-label':kind==='map'?'Representación del mundo descubierto':'Miniatura tridimensional'});
 const details=el('details',{class:'visual-3d',open:kind==='map'&&map3dOpen},el('summary',{},kind==='map'?'Mapa 3D':kind==='species'&&['humano','felaryn','dravak','marevyn','vesperi'].includes(id)?'Ver representación 3D de la especie':'Ver miniatura 3D'),host);
 if(kind==='map'){details.dataset.mapVisualKey=mapVisualKey(state);details.append(el('p',{class:'visual-legend'},'Mapa esquemático. Líneas: pasos recorridos. Punteadas: salidas por explorar.'));}
 if(kind==='species'&&['humano','felaryn','dravak','marevyn','vesperi'].includes(id))details.append(subtitle('Representación de especie. La ropa y los accesorios del modelo no indican tu equipo ni inventario.'));
 let dispose=null,loading=false;
 function release(){if(kind==='map'&&dispose?.getViewState){map3dCamera=dispose.getViewState();map3dCameraKey=cameraKey;}dispose?.();dispose=null;details.classList.remove('visual-ready','visual-failed');host.replaceChildren();}
 const observer=new MutationObserver(()=>{if(!details.isConnected){release();observer.disconnect();}});
 details.addEventListener('visual3dfailed',()=>{release();if(kind==='map')map3dOpen=false;details.classList.add('visual-failed');host.replaceChildren(subtitle('La vista 3D se interrumpió. El mapa y las ilustraciones siguen disponibles.'));});
 details.addEventListener('toggle',async()=>{
  if(kind==='map')map3dOpen=details.open;
  if(!details.open){release();return;}
  if(dispose||loading)return;
  loading=true;host.replaceChildren(subtitle('Cargando representación…'));
  try{
   const module=await import('./world3d.js');
   if(!details.isConnected||!details.open)return;
   host.replaceChildren();
   const ambient=state?.ambient||{};
   const own=kind==='species'&&!['humano','felaryn','dravak','marevyn','vesperi'].includes(id)&&id===state?.character?.species?{class_id:state.character.class_id,equipment:state.character.equipment,inventory:state.inventory}:{};
   dispose=kind==='map'?module.mountWorld3D(host,{...options,viewState:map3dCameraKey===cameraKey?map3dCamera:null,time:ambient.time_of_day,weather:ambient.weather}):module.mountFigure3D(host,{kind,id,...own,time:ambient.time_of_day,weather:ambient.weather});
   details.classList.add('visual-ready');
  }catch(error){if(details.isConnected&&details.open){if(kind==='map')map3dOpen=false;details.classList.add('visual-failed');host.replaceChildren(subtitle('La vista 3D no está disponible en este dispositivo. Puedes seguir usando el mapa y las ilustraciones.'));}}
  finally{loading=false;}
 });
 observer.observe(document.body,{childList:true,subtree:true});
 return details;
}
function openIllustration(creature){
 const name=creature.name||'Criatura observada',heading=el('h2',{id:'bestiary-art-title'},name);
 const dialog=el('dialog',{class:'bestiary-dialog','aria-labelledby':'bestiary-art-title',onclick:event=>{if(event.target===dialog)dialog.close();},onclose:()=>dialog.remove()},el('div',{class:'bestiary-dialog-heading'},heading,button('Cerrar',()=>dialog.close())),typeof creature.illustration==='string'?el('img',{class:'bestiary-art',src:creature.illustration,alt:`Ilustración de ${name}`,decoding:'async'}):null,creature.caption?subtitle(creature.caption):null);
 document.body.append(dialog);dialog.showModal();
 const species=Object.entries(speciesPortraits).find(([,path])=>path===creature.illustration)?.[0];
 if(species){const miniature=visual3D('species',species);if(creature.open3d)miniature.open=true;dialog.append(miniature);}
}
function bestiaryBehavior(creature){
 const facts=Array.isArray(creature.behavior)?creature.behavior.filter(t=>typeof t==='string'&&t.trim()):typeof creature.behavior==='string'&&creature.behavior.trim()?[creature.behavior.trim()]:list(creature.behavior).filter(t=>typeof t==='string'&&t.trim());
 return el('div',{class:'bestiary-behavior'},
  el('h4',{class:'bestiary-behavior-title'},'Lo que sabes'),
  facts.length
   ?el('ul',{class:'bestiary-behavior-list'},...facts.map(fact=>el('li',{},fact)))
   :el('p',{class:'muted bestiary-behavior-empty'},'Examina a esta criatura para aprender cómo se comporta.')
 );
}
function bestiaryView(){const fighting=state.character?.combat?.creature,nearby=new Set(actions(state.actions).filter(a=>['combatir','acercarse','examinar_criatura','evaluar'].includes(a.id)).map(a=>a.target)),rank=c=>c.id===fighting?0:nearby.has(c.id)?1:2,entries=list(state.bestiary).map((c,i)=>[c,i]).sort((a,b)=>rank(a[0])-rank(b[0])||a[1]-b[1]).map(([c])=>c);main.replaceChildren(card(title('Lo que has encontrado','Bestiario'),subtitle('Sólo aparecen criaturas que has observado. Toca una miniatura para ampliarla.'),...entries.map(creature=>el('article',{class:'tile creature-entry'},el('div',{class:'bestiary-entry-heading'},typeof creature.illustration==='string'&&creature.illustration.startsWith('/client/art/bestiary/')?button(el('img',{class:'bestiary-thumbnail',src:bestiaryThumbnail(creature),alt:'',loading:'lazy',decoding:'async'}),()=>openIllustration(creature),{class:'bestiary-art-button','aria-label':`Ver imagen de ${creature.name||'la criatura observada'}`}):null,el('h3',{},creature.id===fighting?el('span',{class:'pill bestiary-now'},'Te enfrentas ahora'):nearby.has(creature.id)?el('span',{class:'pill'},'Aquí'):null,creature.name||'Criatura observada')),creature.description?el('p',{},creature.description):null,bestiaryBehavior(creature))),entries.length?null:subtitle('Todavía no has observado una criatura. Las señales del camino pueden preceder al encuentro.')));}

function keepMapToolFocus(label,change){
 const restore=document.activeElement?.getAttribute('aria-label')===label;
 change();
 if(restore)Array.from(main.querySelectorAll('.map-tools button')).find(control=>control.getAttribute('aria-label')===label)?.focus({preventScroll:true});
}
function discoveredMap(map,selected,onSelect){
 const worldArt='/client/art/map/mundo-anime-v1.webp';
 // With the illustrated world as background, cells are square so the painting is not distorted.
 const art=Boolean(worldArt),CX=art?210:230,CY=art?210:170;
 const positions=discoveredLayout(map),links=discoveredPaths(map,positions),cells=[...positions.values(),...links.flatMap(link=>link.points.map(point=>point.map(v=>v/4)))];
 const minX=cells.length?Math.min(...cells.map(p=>p[0])):0,minY=cells.length?Math.min(...cells.map(p=>p[1])):0;
 const point=id=>{const [x,y]=positions.get(id);return [(x-minX)*CX+82,(y-minY)*CY+66];};
 const width=((cells.length?Math.max(...cells.map(p=>p[0])):0)-minX)*CX+164,height=((cells.length?Math.max(...cells.map(p=>p[1])):0)-minY)*CY+132;
 let scale=mapOverview?(mapScale??1):Math.max(.85,mapScale??1);
 const sheet=el('div',{class:`discovered-map${art?' with-world-art':''}`,style:`width:${width}px;height:${height}px;transform:scale(${scale});transform-origin:0 0`});
 const svgNode=(tag,attrs={})=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));return node;};
 const roads=svgNode('svg',{class:'discovered-roads',width,height,viewBox:`0 0 ${width} ${height}`,'aria-hidden':'true'}),defs=svgNode('defs');roads.append(defs);
 const chosen=knownRoute(map,map.current,selected)||[],selectedEdges=new Set(chosen.map(step=>[step.from,step.to].sort().join('\n'))),maskPrefix=`road-${Math.random().toString(36).slice(2)}`;
 const pixel=([x,y])=>[(x/4-minX)*CX+82,(y/4-minY)*CY+66];
 links.forEach((link,index)=>{
  const points=link.points.map(pixel),attrs={class:`discovered-road${selectedEdges.has([link.from,link.to].sort().join('\n'))?' discovered-road-selected':''}`,'data-connection':link.from+' '+link.to,d:points.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(' ')};
  if(link.crossings.length){const id=maskPrefix+'-'+index,mask=svgNode('mask',{id,maskUnits:'userSpaceOnUse',x:0,y:0,width,height});mask.append(svgNode('rect',{x:0,y:0,width,height,fill:'white'}));for(const crossing of link.crossings){const [cx,cy]=pixel(crossing);mask.append(svgNode('circle',{cx,cy,r:6,fill:'black'}));}defs.append(mask);attrs.mask=`url(#${id})`;}
  roads.append(svgNode('path',attrs));
 });if(art){
  // Fog: the painting is only visible around places this character has discovered.
  const left=82-minX*CX-CX/2,top=66-minY*CY-CY/2,hole=([x,y],inner,outer)=>`radial-gradient(circle at ${x-left}px ${y-top}px,#000 ${inner}px,transparent ${outer}px)`,clear=[...map.nodes.map(node=>hole(point(node.id),CX*2.16,CX*3.6)),...links.map(link=>{const mid=link.points[Math.floor(link.points.length/2)];return hole(pixel(mid),CX*1.8,CX*3.12);})].join(',');
  sheet.append(el('div',{class:'world-art','aria-hidden':true,style:`left:${left}px;top:${top}px;width:${35*CX}px;height:${42*CY}px;background-image:url(${worldArt});-webkit-mask-image:${clear};mask-image:${clear}`}));
 }
 sheet.append(roads);
 const vectors={norte:[0,-1],sur:[0,1],este:[1,0],oeste:[-1,0]};
 for(const node of map.nodes)for(const direction of node.unexplored_directions||[]){
  const vector=vectors[direction];if(!vector)continue;
  const [x,y]=point(node.id),[dx,dy]=vector;sheet.append(el('span',{class:'discovered-frontier','aria-hidden':true,style:`left:${x}px;top:${y}px;width:80px;transform:rotate(${Math.atan2(dy,dx)}rad)`}));
 }
 for(const node of map.nodes){
  const [x,y]=point(node.id),current=node.id===map.current;
  sheet.append(button(el('span',{},el('small',{},current?'Estás aquí':regionNames[node.region]||'Conocido'),node.name,null),()=>onSelect(node.id),{class:`discovered-place${current?' discovered-current':''}`,'aria-pressed':node.id===selected,'aria-label':`${node.name}${current?', estás aquí':''}. Consultar recorrido.`,style:`left:${x}px;top:${y}px`}));
 }
 const plane=el('div',{class:'discovered-plane',style:`width:${width*scale}px;height:${height*scale}px`},sheet);
 const viewport=el('div',{class:'discovered-scroll',tabIndex:0,'data-scale':scale,'aria-label':'Mapa descubierto; desplázate para ver los caminos'},plane);
 const tools=el('div',{class:'map-tools'},el('span',{'aria-label':'Norte hacia arriba',title:'Norte hacia arriba'},'↑'),iconButton('−','Alejar mapa',()=>keepMapToolFocus('Alejar mapa',()=>{const next=Math.max(0.05,scale/1.5);if(next<0.85)mapOverview=true;mapScale=next;render();})),iconButton('+','Acercar mapa',()=>keepMapToolFocus('Acercar mapa',()=>{const next=Math.min(4,scale*1.5);if(next>=0.85)mapOverview=false;mapScale=next;render();})),iconButton('⤢','Ver todo lo descubierto',()=>keepMapToolFocus('Ver todo lo descubierto',()=>{mapOverview=true;mapScale=null;render();})),iconButton('◎','Volver a tu posición',()=>keepMapToolFocus('Volver a tu posición',()=>{mapOverview=false;mapScale=1;onSelect(map.current);})));
 const panel=card(tools,viewport,subtitle(mapOverview?'Vista general. Acerca el mapa para leer los lugares o elige un destino abajo. Punteadas: pasos por explorar.':`Todo tu mundo descubierto. Desplaza el mapa o usa Ver todo. Punteadas: pasos por explorar.`));panel.classList.add('discovered-panel');
 viewport.dataset.viewKey=JSON.stringify([map.current,map.nodes,map.routes,selected,scale]);
 const observer=new ResizeObserver(()=>{if(!viewport.isConnected){observer.disconnect();return;}const insetX=viewport.clientWidth/2,insetY=viewport.clientHeight/2;if(mapOverview&&mapScale===null){scale=Math.min(1,(viewport.clientWidth-24)/width,(viewport.clientHeight-24)/height);sheet.style.transform=`scale(${scale})`;viewport.dataset.scale=String(scale);}plane.style.width=(viewport.clientWidth+width*scale)+'px';plane.style.height=(viewport.clientHeight+height*scale)+'px';sheet.style.left=insetX+'px';sheet.style.top=insetY+'px';const target=positions.has(selected)?selected:map.current;if(positions.has(target)){const [x,y]=point(target);viewport.scrollLeft=Math.max(0,(mapOverview?width/2:x)*scale);viewport.scrollTop=Math.max(0,(mapOverview?height/2:y)*scale);}if(viewport.restoreMapScroll){viewport.scrollLeft=viewport.restoreMapScroll.left;viewport.scrollTop=viewport.restoreMapScroll.top;delete viewport.restoreMapScroll;}});observer.observe(viewport);
 return panel;
}
function mapView(){
 const currentId=state.character?.location,map=orientationMap(state.map,currentId),nodes=new Map(map.nodes.map(node=>[node.id,node]));
 if(!nodes.has(selectedPlace))selectedPlace=map.current||map.nodes[0]?.id;
 const current=nodes.get(map.current),available=actions(state.actions),moves=available.filter(action=>action.id==='mover');
 const directionNames={norte:'Norte',sur:'Sur',este:'Este',oeste:'Oeste',salir:'Salir',hogar:'Volver a casa'};
 const directionName=direction=>directionNames[direction]||'Paso conocido';
 function selectPlace(id){selectedPlace=id;mapOverview=false;mapScale=1;render();main.querySelector('#map-destination')?.focus({preventScroll:true});}
 const heading=el('div',{class:'map-heading'},el('h1',{},'Mapa'),el('span',{class:'muted'},current?.name||'Tu recorrido'));
 const recovery=state.map?.recovery;
 const planner=card(el('h2',{},'Cómo llegar'));planner.classList.add('map-planner');
 const groups=new Map();
 for(const node of map.nodes){const group=node.kind==='home'?'Hogar':regionNames[node.region]||'Otros lugares conocidos';if(!groups.has(group))groups.set(group,[]);groups.get(group).push(node);}
 const selector=el('select',{id:'map-destination',name:'destination',onchange:event=>selectPlace(event.currentTarget.value)},...Array.from(groups,([label,entries])=>el('optgroup',{label},...entries.slice().sort((a,b)=>a.name.localeCompare(b.name,'es')).map(node=>el('option',{value:node.id,selected:node.id===selectedPlace},node.name)))));
 if(map.nodes.length)planner.append(el('label',{class:'field'},'Destino conocido',selector));else planner.append(subtitle('Los lugares aparecerán al recorrerlos.'));
 const destination=nodes.get(selectedPlace),route=knownRoute(map,map.current,selectedPlace);
 if(destination){
  const destinationArt=destination.visited?placeArt(destination):null;if(destinationArt)planner.append(button(`Ver vista de ${destinationArt.name}`,()=>openIllustration(destinationArt)));
  if(route===null)planner.append(el('p',{class:'map-note'},'No hay un recorrido conocido desde aquí hasta ese lugar.'));
  else if(route.length===0)planner.append(el('p',{class:'map-arrived'},'Ya estás en este lugar.'));
  else{
   planner.append(el('p',{class:'muted'},`${route.length} ${route.length===1?'paso':'pasos'} hasta ${destination.name}.`),el('ol',{class:'map-itinerary','aria-label':'Pasos del recorrido'},...route.map((step,index)=>el('li',{},el('small',{},index===0?'Desde aquí':`Desde ${nodes.get(step.from)?.name||'el lugar anterior'}`),el('span',{},step.direction?`${directionName(step.direction)} → ${nodes.get(step.to)?.name||'Lugar conocido'}`:nodes.get(step.to)?.name||'Lugar conocido')))));
   const step=route[0],action=step.direction?moves.find(action=>action.target===step.direction):null;
   if(action)planner.append(actionButton({...action,label:`Dar siguiente paso · ${directionName(step.direction)}`}));
   else planner.append(el('p',{class:'map-note'},step.direction?'Ese paso no está disponible ahora.': 'Este recorrido no tiene direcciones registradas. Reinicia el juego para obtenerlas.'));
  }
  const connections=map.routes.filter(route=>route.from===selectedPlace);
  if(connections.length)planner.append(el('details',{class:'more'},el('summary',{},`Conexiones de ${destination.name}`),el('ul',{class:'map-connections'},...connections.map(connection=>el('li',{},`${connection.direction?directionName(connection.direction)+' · ':''}${nodes.get(connection.to)?.name||'Lugar conocido'}`)))));
 }
 if(recovery)planner.append(el('p',{class:'map-note'},`Última derrota: ${recovery.from_name}. Recuperación en ${recovery.to_name}, a ${recovery.distance} tramos.`));
 main.replaceChildren(heading,visual3D('map',null,{map,positions:discoveredLayout(map),selected:selectedPlace,onSelect:selectPlace,character:state.character}),discoveredMap(map,selectedPlace,selectPlace),planner);
}
function questEntry(quest){
 const status={accepted:'En marcha',ready:'Listo para entregar',paid:'Entregado'}[quest.status]||'En marcha';
 const reward=quest.status==='paid'?quest.paid_amount:quest.reward_current??quest.reward;
 const entry=el('article',{class:'tile quest-entry'},el('h3',{},quest.name),el('span',{class:'pill'},status),quest.summary?el('p',{},quest.summary):null,typeof reward==='number'?subtitle(`${quest.status==='paid'?'Recibiste':'Recompensa actual'}: ${reward} sellos`):null,quest.return_room_name?subtitle(`Entrega: ${quest.return_room_name}`):null);
 const claim=actions(state.actions).find(action=>action.id==='cobrar'&&action.target===quest.id);
 if(claim)entry.append(actionButton(claim));
 else if(quest.status!=='paid'&&quest.return_room_name){const destination=list(state.map?.nodes).find(node=>node.name===quest.return_room_name);if(destination)entry.append(button('Ver dónde entregar',()=>{selectedPlace=destination.id;mapOverview=false;mapScale=1;navigate('map');}));}
 return entry;
}
function journalView(){
 const entries=journalEvents(state.journal),quests=list(state.quests),active=quests.filter(quest=>quest.status!=='paid'),paid=quests.filter(quest=>quest.status==='paid');
 const contracts=card(title('Lo que tienes entre manos','Encargos'),...active.map(questEntry),active.length?null:subtitle('No tienes encargos pendientes. Puedes preguntar a los personajes de los pueblos.'),paid.length?el('details',{class:'more'},el('summary',{},`Encargos entregados (${paid.length})`),...paid.map(questEntry)):null);
 main.replaceChildren(contracts,card(title('Huellas del recorrido','Recuerdos'),subtitle('Sólo hechos y observaciones que has vivido.'),state.secrets?.found?subtitle(`Secretos encontrados: ${state.secrets.found}. El mundo guarda más.`):null,entries.length?el('div',{class:'reading'},...entries.map(narrativeNode)):subtitle('Aún no hay recuerdos registrados. El historial de lectura de esta pestaña está en Aventura.')));
}
function preference(key,label,className){let saved=false;try{saved=localStorage.getItem('vt-new:'+key)==='on';}catch(_){}const input=el('input',{id:`preference-${key}`,type:'checkbox',checked:saved,onchange:()=>{if(key==='font'){readingFont(input.checked?'large':'normal');return;}document.documentElement.classList.toggle(className,input.checked);try{localStorage.setItem('vt-new:'+key,input.checked?'on':'off');}catch(_){}}});document.documentElement.classList.toggle(className,saved);return el('label',{},input,label);}
function helpView(){main.replaceChildren(card(title('A tu ritmo','Leer el mundo'),subtitle('Lee la situación y elige una posibilidad. Observar puede ayudarte a entender un lugar sin combatir. Las señales no siempre explican todo.'),subtitle('Las salidas son pasos reales del recorrido. El mapa conserva los lugares conocidos; puedes revisarlos sin viajar.'),subtitle('Conversar, prepararte y decidir cuándo regresar también forman parte de la aventura.'),el('h2',{},'Comodidad de lectura'),el('div',{class:'preferences'},preference('font','Texto de lectura más grande','large-reading'),preference('contrast','Mayor contraste en la lectura','high-contrast'),preference('motion','Reducir efectos','reduced-motion')),el('p',{class:'muted'},'Estas preferencias se guardan en este navegador. Tu aventura pertenece a tu cuenta.')));}
function travelControls(){
 const moves=actions(state.actions).filter(action=>action.id==='mover');
 const pad=el('div',{class:'travel-pad',role:'group','aria-label':'Direcciones del lugar'});
 for(const [direction,icon,name] of [['norte','↑','Norte'],['oeste','←','Oeste'],['este','→','Este'],['sur','↓','Sur']]){
  const action=moves.find(action=>action.target===direction);
  pad.append(iconButton(icon,action?action.label:`${name}: no hay salida`,()=>{if(action)perform(action);},{class:`travel-${direction}`,disabled:!action||action.disabled||busy||Boolean(pendingRetry)||Boolean(state.character?.combat), 'data-direction':direction}));
 }
 const local=moves.find(action=>!['norte','sur','este','oeste'].includes(action.target));
 const localLabel=local?(local.label==='Salir · Salida por explorar'?'Explorar salida':local.label.startsWith('Salir ·')?local.label.replace(/^Salir\s*·\s*/,'Salida · '):local.label):'';
 pad.append(local?iconButton(local.target==='hogar'?'⌂':'↗',localLabel,()=>perform(local),{class:'travel-center travel-local',disabled:local.disabled||busy||Boolean(pendingRetry)||Boolean(state.character?.combat)}):el('span',{class:'travel-center','aria-hidden':true},'·'));
 return pad;
}
function renderNavigation(){
 // Five game tabs; movement lives in the "Salidas" panel of the scene.
 const links=el('div',{class:'navigation-icons game-tabs','aria-label':'Secciones del juego',onkeydown:event=>{const keys=['ArrowRight','ArrowLeft','Home','End'];if(!keys.includes(event.key))return;const buttons=Array.from(event.currentTarget.querySelectorAll('button')),index=buttons.indexOf(document.activeElement);if(index<0)return;event.preventDefault();buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length].focus();}}),current=view==='shop'?'adventure':view==='more'?'help':view;
 for(const key of ['adventure','map','character','inventory','bestiary','journal','help'])links.append(button([controlIcon(labels[key][0]),el('span',{class:'tab-label'},labels[key][1]),key==='character'&&state.character.pa>0?el('span',{class:'pa-badge','aria-hidden':true},'•'):null],()=>navigate(key),{'aria-label':key==='character'&&state.character.pa>0?`Personaje: ${state.character.pa} puntos para mejorar`:labels[key][1],title:labels[key][1],'aria-current':current===key?'page':null}));
 navigation.classList.toggle('with-travel',view==='adventure');
 navigation.replaceChildren(...(view==='adventure'?[travelControls(),links]:[links]));
}
let shopSection=null;
const shopSections=[['pociones','Pociones y comida','potion'],['armas','Armas','swords'],['armaduras','Armaduras','shield'],['joyas','Anillos y amuletos','star'],['vender','Vender','coin']];
const shopSlots=[['cabeza','Cabeza'],['torso','Torso'],['brazos','Brazos'],['piernas','Piernas'],['pies','Pies'],['anillo','Anillos'],['amuleto','Amuletos']];
function shopView(){
 const available=actions(state.actions),buys=available.filter(a=>a.id==='comprar'),sales=available.filter(a=>a.id==='vender');
 const count=key=>key==='vender'?sales.length:buys.filter(a=>(a.category||'otros')===key).length;
 const sections=shopSections.filter(([key])=>count(key));
 const back=button([controlIcon('←'),' Volver al lugar'],()=>navigate('adventure'),{class:'shop-back'});
 const head=el('div',{class:'shop-head'},title(state.room?.name||'Aquí','Tienda'),el('span',{class:'hud-chip'},controlIcon('coin'),String(state.character.seals??0)));
 if(!sections.length){main.replaceChildren(card(head,subtitle('Aquí no hay nada que comprar ni vender ahora.'),back));return;}
 if(!sections.some(([key])=>key===shopSection))shopSection=sections.length===1?sections[0][0]:null;
 if(!shopSection){main.replaceChildren(card(head,el('div',{class:'more-grid shop-grid'},...sections.map(([key,name,icon])=>button([el('span',{class:'more-icon'},controlIcon(icon)),el('strong',{},name),el('small',{},`${count(key)} ${key==='vender'?'para vender':'a la venta'}`)],()=>{shopSection=key;render();},{class:'more-tile'}))),back));return;}
 const [,name]=sections.find(([key])=>key===shopSection),list_=shopSection==='vender'?sales:buys.filter(a=>(a.category||'otros')===shopSection);
 const groups=shopSection==='armaduras'||shopSection==='joyas'?shopSlots.map(([slot,label])=>[label,list_.filter(a=>a.slot===slot)]):shopSection==='vender'?[['Materiales',list_.filter(a=>a.category==='materiales')],['Equipo',list_.filter(a=>['armas','armaduras','joyas'].includes(a.category))],['Pociones y otros',list_.filter(a=>!['materiales','armas','armaduras','joyas'].includes(a.category))]]:[[null,list_]];
 const body=el('div',{class:'shop-list'},...groups.filter(([,items])=>items.length).flatMap(([label,items])=>[label?el('h3',{class:'shop-group'},label):null,...items.map(actionButton)]));
 main.replaceChildren(card(head,el('div',{class:'shop-tabs'},...sections.map(([key,label,icon])=>button([controlIcon(icon),el('span',{},label)],()=>{shopSection=key;render();},{'aria-pressed':String(key===shopSection)}))),el('h2',{class:'panel-title'},name),body,button([controlIcon('←'),' Todas las secciones'],()=>{shopSection=null;render();},{class:'shop-back'}),back));
}
function moreView(){
 const tile=(key,text)=>button([el('span',{class:'more-icon'},controlIcon(labels[key][0])),el('strong',{},labels[key][1]),el('small',{},text)],()=>navigate(key),{class:'more-tile'});
 main.replaceChildren(card(title('Tu aventura','Más'),el('div',{class:'more-grid'},tile('numen','Tu compañero Númen'),tile('bestiary','Criaturas que has visto'),tile('journal','Encargos y recuerdos'),tile('help','Cómo se juega'))));
}
function render(){if(positionCharacter!==state?.character?.id){viewPositions.clear();positionCharacter=state?.character?.id;}document.documentElement.classList.toggle('directing-world',view==='master');document.documentElement.classList.toggle('combat-active',view==='adventure'&&Boolean(state?.character?.combat));document.documentElement.classList.toggle('playing-map',view==='map'&&state?.character?.status==='approved');document.documentElement.classList.toggle('reading-adventure',view==='adventure'&&state?.character?.status==='approved');if(pendingRetry){notice.hidden=false;notice.classList.add('error');notice.replaceChildren('La respuesta no llegó. Comprueba la misma decisión antes de elegir otra.',button('Comprobar mi decisión',()=>mutate(pendingRetry.path,pendingRetry.payload)));}if(view==='master'){renderMaster();navigation.hidden=true;return;}const authenticated=Boolean(state?.authenticated);document.getElementById('account-logout').hidden=!authenticated;navigation.hidden=true;if(!authenticated){authScreen();return;}if(!state.character||state.pending_approval||state.character.status!=='approved'){creationScreen();return;}navigation.hidden=false;({adventure,map:mapView,inventory:inventoryView,character:characterView,numen:numenView,bestiary:bestiaryView,journal:journalView,help:helpView,more:moreView,shop:shopView}[view]||adventure)();if(['character','numen','inventory','bestiary','journal','help','more'].includes(view)){main.prepend(el('div',{class:'submenu-context'},button([controlIcon('←'),' Volver a la aventura'],()=>navigate('adventure')),el('span',{},state.room?.name||'Tu aventura')));main.setAttribute('aria-label',labels[view]?.[1]||'Tu aventura');}else main.removeAttribute('aria-label');renderNavigation();document.querySelectorAll('button').forEach(button=>{if(busy&&!button.disabled){button.disabled=true;button.dataset.working='';}});}
async function loadMaster(){try{master=await api('/api/master/state');view='master';render();}catch(error){message(error.message,true);}}
function masterPasswordForm(character){
 const account=typeof character.account==='object'?character.account.username:character.account||'Sin indicar';
 const form=el('form',{class:'stack',onsubmit:async event=>{
  event.preventDefault();if(busy)return;
  const data=new FormData(event.currentTarget),password=String(data.get('password')),confirmation=String(data.get('confirmation'));
  if(password!==confirmation){message('Las contraseñas no coinciden.',true);return;}
  busy=true;
  try{await api('/api/master/account/password',{character_id:character.id,password,confirmation});form.reset();message(`Contraseña actualizada para la cuenta ${account}.`);}
  catch(error){message(error.message,true);}
  finally{busy=false;render();}
 }},subtitle(`Cuenta: ${account}. El cambio se aplica a todos sus personajes.`),field('Nueva contraseña','password','password','new-password'),field('Repite la contraseña','password','confirmation','new-password'),el('button',{type:'submit',class:'primary',disabled:busy},'Guardar nueva contraseña'));
 return el('details',{class:'more'},el('summary',{},'Cambiar contraseña de la cuenta'),form);
}
function masterAccessButton(character){
 return button(character.blocked?'Permitir volver a entrar':'Expulsar jugador',async()=>{
  if(busy)return;
  const account=typeof character.account==='object'?character.account.username:character.account;
  if(!character.blocked&&!window.confirm(`¿Expulsar la cuenta ${account}? Se cerrará su acceso a todos sus personajes. Su progreso se conserva.`))return;
  busy=true;
  try{await api('/api/master/account/access',{character_id:character.id,blocked:!character.blocked});await loadMaster();message(character.blocked?'La cuenta puede volver a iniciar sesión.':'Jugador expulsado. Su acceso está bloqueado.');}
  catch(error){message(error.message,true);}
  finally{busy=false;render();}
 },{class:character.blocked?'':'danger-button',disabled:busy});
}
const masterSheets=new Map(),masterSections=new Set();
function readMasterRetry(){try{const value=JSON.parse(sessionStorage.getItem('vt-new:master-pending')||'null');return value&&Number.isInteger(value.character_id)&&typeof value.request_id==='string'&&typeof value.operation==='string'&&value.confirmed===true?value:null;}catch(_){return null;}}
let masterRetry=readMasterRetry();
if(masterRetry)masterSections.add(`${masterRetry.character_id}:manage`);
let masterSelected=masterRetry?.character_id||null,masterSearch='',masterFilter='all',masterPage=0;
const masterAccountName=c=>typeof c.account==='object'?c.account?.username||'Sin indicar':c.account||'Sin indicar';
const masterCharacterSummary=c=>`Nivel ${c.level??1} · ${speciesNames[c.species]||c.species} · ${classNames[c.class_id]||c.class_id}`;
function saveMasterRetry(value){masterRetry=value;try{if(value)sessionStorage.setItem('vt-new:master-pending',JSON.stringify(value));else sessionStorage.removeItem('vt-new:master-pending');}catch(_){}}
function masterSection(id,key,label,...children){const token=`${id}:${key}`;return el('details',{class:'more',open:masterSections.has(token),ontoggle:event=>{if(event.currentTarget.open)masterSections.add(token);else masterSections.delete(token);}},el('summary',{},label),...children);}
async function manageMasterCharacter(character,payload,confirmation,retry=false){
 if(busy||(!retry&&masterRetry))return;
 if(!retry&&!window.confirm(confirmation))return;
 const intent=retry?masterRetry:{character_id:character.id,...payload,request_id:requestId(),confirmed:true};
 saveMasterRetry(intent);busy=true;message('');render();
 try{
  const result=await api('/api/master/character/manage',intent);masterSheets.set(character.id,result);saveMasterRetry(null);
  const updated=result.character;if(updated){const old=list(master.approved).find(c=>c.id===character.id);if(old)Object.assign(old,updated);}
  message(result.message||'Cambio aplicado al personaje.');
 }catch(error){if(!error.status||error.status>=500){saveMasterRetry(intent);message('La respuesta no llegó. Comprueba esta misma entrega antes de realizar otro cambio.',true);}else{saveMasterRetry(null);message(error.message,true);}}
 finally{busy=false;render();}
}
const portraitSlug=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
function masterPortraitLabel(portrait,character){
 const stem=String(portrait.id).split('/').pop().replace(/\.webp$/,'');
 const parts=[];const level=stem.match(/nivel-(\d+)/),version=stem.match(/-v(\d+)$/);
 if(level)parts.push(`Nivel ${level[1]}`);
 parts.push(stem.includes('cuerpo-completo')||level?'Cuerpo completo':'Retrato');
 if(version)parts.push(`Versión ${version[1]}`);
 const owner=stem.split('-anime')[0];if(portraitSlug(owner)!==portraitSlug(character.name))parts.unshift(owner.replace(/-/g,' '));
 return parts.join(' · ');
}
function masterPortraitPreview(character){
 const current=masterSheets.get(character.id)?.character?.portrait||character.portrait,illustration=current||speciesPortraits[character.species];
 return illustration?el('div',{class:'master-current-portrait'},button(el('img',{src:illustration,alt:`Imagen actual de ${character.name}`,decoding:'async'}),()=>openIllustration({name:character.name,illustration}),{class:'master-current-portrait-button','aria-label':`Ampliar imagen actual de ${character.name}`}),el('span',{},current?'Imagen personal actual':'Imagen de especie')):null;
}
function masterPortraitChoices(character,portraits){
 const own=portraits.filter(p=>portraitSlug(String(p.id).split('/').pop().split('-anime')[0])===portraitSlug(character.name)),others=portraits.filter(p=>!own.includes(p));
 const selected=portraits.find(p=>p.id===character.portrait)?.id||own[0]?.id||portraits[0]?.id;
 const options=entries=>el('div',{class:'master-portrait-gallery'},...entries.map(p=>{const label=masterPortraitLabel(p,character);return el('label',{class:'master-portrait-choice'},el('input',{type:'radio',name:'target',value:p.id,required:true,checked:p.id===selected,'aria-label':label}),el('img',{src:p.id,alt:'',loading:'lazy',decoding:'async'}),el('span',{},label),p.id===character.portrait?el('small',{},'Actual'):null);}));
 return [own.length?options(own):subtitle('Aún no hay imágenes creadas con el nombre de este personaje.'),others.length?masterSection(character.id,'other-portraits','Otras imágenes disponibles',options(others)):null];
}
function masterManagement(character){
 const id=character.id,token=`${id}:manage`,sheet=masterSheets.get(id);
 const panel=el('details',{class:'more master-management',open:masterSections.has(token),'data-master-character':id,ontoggle:async event=>{
  if(!event.currentTarget.open){masterSections.delete(token);return;}masterSections.add(token);
  if(masterSheets.has(id)||busy)return;busy=true;
  try{masterSheets.set(id,await api(`/api/master/character/${id}`));}catch(error){message(error.message,true);masterSections.delete(token);}finally{busy=false;render();}
 }},el('summary',{},'Gestionar personaje'));
 if(!sheet){panel.append(subtitle('Abre para consultar la ficha y las herramientas.'));return panel;}
 const c=sheet.character||character;
 const numberField=()=>el('label',{class:'field'},'Cantidad',el('input',{type:'number',name:'amount',min:1,max:1000000,step:1,value:1,required:true,inputMode:'numeric'}));
 const choose=(label,values)=>el('label',{class:'field'},label,el('select',{name:'target',required:true},...values.map(v=>el('option',{value:v.id},v.name))));
 const form=(operation,label,fields,describe)=>{for(const node of fields){const amount=node?.querySelector?.('input[name=amount]');if(amount&&['item','remove_item'].includes(operation))amount.max=100;}return el('form',{class:'stack',onsubmit:event=>{
  event.preventDefault();if(busy||masterRetry)return;const data=new FormData(event.currentTarget),payload={operation};
  if(data.has('amount'))payload.amount=Number(data.get('amount'));if(data.has('target'))payload.target=operation==='remove_item'?Number(data.get('target')):String(data.get('target'));
  manageMasterCharacter(c,payload,`${describe(payload,event.currentTarget)}\nPersonaje: ${c.name}. ¿Confirmas este cambio?`);
 }},...fields,el('button',{type:'submit',class:'primary',disabled:busy||Boolean(masterRetry)},label));};
 const selectedName=form=>form.querySelector('select')?.selectedOptions[0]?.textContent||'';
 const rows=[['Nivel',c.level],['Especie',speciesNames[c.species]||c.species],['Clase',classNames[c.class_id]||c.class_id],['Vitalidad',`${whole(c.hp)}/${whole(c.hp_max)}`],['Sellos',c.seals],['Fatiga',whole(c.fatigue)],['Puntos de atributo',c.pa],['Puntos de técnica',c.pp],['Herida',c.wound?textLabel(c.wound)||String(c.wound):'Sin herida'],['Ubicación',sheet.room?.name||c.location]];
 panel.append(masterSection(id,'sheet','Ficha, equipo y misiones',el('div',{class:'stats'},...rows.map(([label,value])=>el('div',{},el('small',{},label),el('strong',{},String(value??'Sin indicar'))))),el('h4',{},'Atributos'),...Object.entries(c.attributes||{}).map(([key,value])=>subtitle(`${key}: ${value}`)),el('h4',{},'Mochila y equipo'),...list(sheet.inventory).map(item=>subtitle(`${item.name} · ${item.quantity??item.amount??1}${Object.values(c.equipment||{}).some(e=>e===item.id||e?.id===item.id)?' · Equipado':''}`)),el('h4',{},'Misiones'),...list(sheet.quests).map(q=>subtitle(`${q.name}: ${q.summary||q.status}`)),list(sheet.quests).length?null:subtitle('Sin misiones registradas.')));
 panel.append(masterSection(id,'rewards','Conceder experiencia y sellos',form('xp','Conceder XP',[numberField()],p=>`Conceder ${p.amount} XP. El juego calculará niveles y puntos ganados.`),form('seals','Regalar sellos',[numberField()],p=>`Regalar ${p.amount} sellos.`)));
 const catalog=list(sheet.catalog);panel.append(masterSection(id,'items','Regalar objetos',catalog.length?form('item','Entregar objeto',[choose('Objeto del catálogo',catalog),numberField()],(p,f)=>`Entregar ${p.amount} × ${selectedName(f)}.`):subtitle('No hay objetos disponibles.')));
 panel.append(masterSection(id,'health','Curar o revivir',subtitle('Recupera vitalidad y elimina heridas y fatiga.'),button('Curar en este lugar',()=>manageMasterCharacter(c,{operation:'heal'},`Curar o revivir a ${c.name} en su ubicación actual. ¿Confirmas?`),{disabled:busy||Boolean(masterRetry)}),button('Revivir en un pueblo seguro',()=>manageMasterCharacter(c,{operation:'heal',recover_to_settlement:true},`Recuperar a ${c.name} y llevarlo al pueblo seguro más cercano. ¿Confirmas?`),{disabled:busy||Boolean(masterRetry)})));
 const destinations=list(sheet.destinations).map(d=>({...d,name:`${d.name} · ${regionNames[d.region]||d.region||''}`}));panel.append(masterSection(id,'travel','Trasladar personaje',destinations.length?form('travel','Trasladar',[choose('Destino',destinations)],(p,f)=>`Trasladar a ${selectedName(f)}. No se descubrirán los caminos intermedios.`):subtitle('Sin destinos disponibles.')));
 const portraits=list(sheet.portraits);panel.append(masterSection(id,'portrait','Actualizar imagen personal',portraits.length?form('portrait','Usar imagen',masterPortraitChoices(c,portraits),(p,f)=>`Asignar la imagen ${f.querySelector('input[name=target]:checked')?.getAttribute('aria-label')||'seleccionada'}.`):subtitle('Aún no hay imágenes personales disponibles.')));
 const grants=list(sheet.grants).filter(g=>g.remaining>0).map(g=>({id:g.id,name:`${g.item_name} · quedan ${g.remaining}`}));panel.append(masterSection(id,'correction','Corregir una entrega de objetos',subtitle('Sólo puedes retirar objetos regalados por el DM que aún conserve el personaje.'),grants.length?form('remove_item','Retirar de esa entrega',[choose('Entrega',grants),numberField()],(p,f)=>`Retirar ${p.amount} unidades de ${selectedName(f)}.`):subtitle('No hay entregas disponibles para retirar.')));
 panel.append(masterSection(id,'history','Historial del DM',...list(sheet.history).map(entry=>subtitle(`${entry.at?new Date(entry.at*1000).toLocaleString('es-MX')+' · ':''}${entry.label||entry.operation}${entry.amount?' · '+entry.amount:''}`)),list(sheet.history).length?null:subtitle('Todavía no hay cambios del DM.')));
 panel.append(button('Actualizar ficha',async()=>{if(busy)return;busy=true;try{masterSheets.set(id,await api(`/api/master/character/${id}`));}catch(error){message(error.message,true);}finally{busy=false;render();}},{disabled:busy}));
 if(masterRetry&&masterRetry.character_id===id)panel.prepend(button('Comprobar el cambio pendiente',()=>manageMasterCharacter(c,null,null,true),{class:'primary',disabled:busy}));
 return panel;
}
function masterActivity(character){
 const key=`vt-new:activity-review:${character.id}`,moves=character.movements??0,places=character.places_visited??0;
 let saved=null;try{saved=JSON.parse(localStorage.getItem(key));}catch(_){}
 const valid=saved&&Number.isInteger(saved.moves)&&Number.isInteger(saved.places)&&saved.moves<=moves&&saved.places<=places;
 return el('section',{'aria-label':`Actividad de ${character.name}`},
  subtitle(`${moves} movimientos · ${places} lugares visitados`),
  subtitle(valid?`Desde tu revisión: +${moves-saved.moves} movimientos · +${places-saved.places} lugares`:'Sin revisión anterior.'),
  button('Marcar como revisado',()=>{try{localStorage.setItem(key,JSON.stringify({moves,places}));render();}catch(_){message('No se pudo guardar la revisión en este navegador.',true);}},{disabled:busy,'aria-label':`Marcar actividad de ${character.name} como revisada`}));
}
function masterNumenes(character){
 if(character.status!=='approved')return null;
 const numenes=list(character.numenes);
 return el('section',{'aria-label':`Númenes de ${character.name}`},el('h3',{},'Númenes'),
  ...numenes.map(n=>{
   const variantChoices=[...new Set([...list(n.variants),...(n.variant?[n.variant]:[])])];
   return el('div',{class:'numen-heading'},numenArt(n,{class:'species-thumbnail',loading:'lazy'}),
    el('div',{},el('strong',{},n.name),subtitle(`${n.species_name||'Compañero Númen'} · ${n.active?'En viaje (activo)':'En el refugio'} · ${n.mood}`)),
    el('label',{class:'field'},'Apariencia',el('select',{name:'variant',disabled:busy,'aria-label':`Apariencia de ${n.name}`,onchange:async event=>{
     const variant=event.currentTarget.value;busy=true;
     try{await api('/api/master/numen/variant',{character_id:character.id,numen_id:n.id,variant});masterSheets.delete(character.id);await loadMaster();}
     catch(error){message(error.message,true);}
     finally{busy=false;render();}
    }},el('option',{value:'',selected:!n.variant},'Original'),...variantChoices.map(v=>el('option',{value:v,selected:n.variant===v},v)))));
  }),
  numenes.length?null:subtitle('Sin Númenes'));
}
function masterVaisorkSection(){
 const v=master?.vaisork;if(!v)return null;
 const portrait=v.portrait||'/client/art/players/vaisork-anime-v1.webp',fullBody=v.full_body||'/client/art/players/vaisork-anime-cuerpo-completo-v1.webp';
 const paragraphs=String(v.quien_es||'').split(/\n\s*\n/).filter(Boolean);
 return masterSection('dm','vaisork','Vaisork',
  el('section',{class:'vaisork-dm-sheet stack','aria-label':'Ficha de Vaisork'},
   el('div',{class:'vaisork-dm-header'},
    el('img',{class:'vaisork-dm-portrait',src:portrait,alt:'Retrato de Vaisork',decoding:'async'}),
    el('div',{class:'stack'},
     el('h2',{},'Vaisork'),
     v.titulo?el('p',{class:'vaisork-dm-title'},v.titulo):null,
     button('Ver cuerpo completo',()=>openIllustration({name:`Vaisork · ${v.titulo||'Cuerpo completo'}`,illustration:fullBody}))
    )
   ),
   el('h3',{},'Quién es'),
   ...paragraphs.map(p=>el('p',{class:'vaisork-dm-prose'},p)),
   v.como_se_ve?[el('h3',{},'Cómo se ve'),el('p',{class:'vaisork-dm-prose'},v.como_se_ve)]:null,
   list(v.lo_que_se_dice).length?[el('h3',{},'Lo que se dice'),el('ul',{class:'vaisork-dm-list'},...list(v.lo_que_se_dice).map(item=>el('li',{},item)))]:null,
   list(v.lo_que_nunca_dice).length?[el('h3',{},'Lo que nunca dice'),el('ul',{class:'vaisork-dm-list'},...list(v.lo_que_nunca_dice).map(item=>el('li',{},item)))]:null,
   list(v.frases).length?[el('h3',{},'Frases'),el('ul',{class:'vaisork-dm-list'},...list(v.frases).map(item=>el('li',{},item)))]:null
  )
 );
}
function renderMaster(){const back=button('Volver a la aventura',async()=>{view='adventure';try{await refresh();}catch(e){message(e.message,true);}});if(!master?.authenticated){const form=el('form',{class:'stack',autocomplete:'on',action:'/api/master/login',method:'post',onsubmit:async e=>{e.preventDefault();if(busy)return;const data=new FormData(e.currentTarget),username=String(data.get('username')||'').trim(),password=String(data.get('password')||'');busy=true;try{await api('/api/master/login',{username,password});await loadMaster();void rememberBrowserLogin(username,password,true);}catch(error){message(error.message,true);}finally{busy=false;render();}}},field('Usuario','text','username','username'),field('Contraseña del director','password','password','section-director current-password'),el('button',{type:'submit',class:'primary',disabled:busy},'Entrar como director'));main.replaceChildren(card(title('Dirección del mundo','Revisar personajes'),subtitle('Este acceso permite revisar las solicitudes de personajes.'),form,back));return;}
 const characters=[...list(master.pending),...list(master.approved)],selected=characters.find(c=>c.id===masterSelected);
 const refreshRoster=button('Actualizar jugadores',async()=>{if(busy)return;busy=true;try{await loadMaster();}finally{busy=false;render();}},{disabled:busy});
 const logout=button('Cerrar sesión de director',async()=>{if(busy)return;busy=true;try{await api('/api/master/logout',{});master=null;await loadMaster();}catch(error){message(error.message,true);}finally{busy=false;render();}},{class:'danger-button',disabled:busy});
 if(selected){
  const character=selected,isPending=list(master.pending).some(c=>c.id===character.id);
  main.replaceChildren(card(button('Volver a jugadores',()=>{masterSelected=null;render();},{disabled:busy}),title('Gestionar jugador',character.name),masterPortraitPreview(character),subtitle(masterCharacterSummary(character)),subtitle(`Cuenta: ${masterAccountName(character)} · ${character.blocked?'Acceso bloqueado':isPending?'Pendiente de aprobación':'Aprobado'}`),
   isPending?button('Aprobar personaje',async()=>{if(busy)return;busy=true;try{await api('/api/master/approve',{character_id:character.id,request_id:requestId()});await loadMaster();message('Personaje aprobado. Ya puede comenzar su recorrido.');}catch(error){message(error.message,true);}finally{busy=false;render();}},{class:'primary',disabled:busy}):button(character.tester_enabled?'Deshabilitar pruebas':'Habilitar pruebas',async()=>{if(busy)return;busy=true;try{await api('/api/master/tester',{character_id:character.id,enabled:!character.tester_enabled});await loadMaster();}catch(error){message(error.message,true);}finally{busy=false;render();}},{disabled:busy}),
   masterActivity(character),masterNumenes(character),isPending?null:masterManagement(character),masterPasswordForm(character),masterAccessButton(character),logout,back));return;
 }
 const search=el('input',{type:'search',value:masterSearch,placeholder:'Nombre del personaje o cuenta','aria-label':'Buscar jugadores',oninput:event=>{masterSearch=event.currentTarget.value;masterPage=0;renderMaster();const input=main.querySelector('input[type=search]');input?.focus({preventScroll:true});}});
 const filter=el('select',{'aria-label':'Filtrar jugadores',value:masterFilter,onchange:event=>{masterFilter=event.currentTarget.value;masterPage=0;renderMaster();}},...Object.entries({all:'Todos',pending:'Pendientes',approved:'Aprobados',blocked:'Expulsados'}).map(([value,label])=>el('option',{value,selected:value===masterFilter},label)));
 const query=masterSearch.trim().toLocaleLowerCase('es'),filtered=characters.filter(c=>`${c.name} ${masterAccountName(c)}`.toLocaleLowerCase('es').includes(query)&&(masterFilter==='all'||masterFilter==='blocked'&&c.blocked||masterFilter==='pending'&&list(master.pending).some(p=>p.id===c.id)||masterFilter==='approved'&&list(master.approved).some(p=>p.id===c.id)));
 const pageCount=Math.max(1,Math.ceil(filtered.length/12));masterPage=Math.min(masterPage,pageCount-1);
 main.replaceChildren(card(title('Dirección del mundo','Jugadores'),subtitle(`${list(master.pending).length} pendientes · ${list(master.approved).length} aprobados`),subtitle('La última revisión se guarda en este navegador. Los totales pertenecen al personaje.'),masterVaisorkSection(),refreshRoster,el('label',{class:'field'},'Buscar jugadores',search),el('label',{class:'field'},'Mostrar',filter),...filtered.slice(masterPage*12,masterPage*12+12).map(c=>el('article',{class:'tile master-player-row'},el('h3',{},c.name),subtitle(masterCharacterSummary(c)),masterActivity(c),masterNumenes(c),subtitle(`Cuenta: ${masterAccountName(c)} · ${c.blocked?'Expulsado':list(master.pending).some(p=>p.id===c.id)?'Pendiente':'Aprobado'}`),button('Ver jugador',()=>{masterSelected=c.id;render();},{'aria-label':`Ver jugador ${c.name}`,disabled:busy}))),filtered.length?null:subtitle('No hay jugadores que coincidan.'),el('div',{class:'master-pagination'},button('Anterior',()=>{masterPage--;renderMaster();},{disabled:masterPage===0||busy}),el('span',{},`Página ${masterPage+1} de ${pageCount}`),button('Siguiente',()=>{masterPage++;renderMaster();},{disabled:masterPage>=pageCount-1||busy})),logout,back));
}
document.getElementById('account-logout').addEventListener('click',async()=>{const done=await mutate('/api/account/logout',{});if(done){journal.reset();resetTerminal();confirmedRequests.clear();view='adventure';authMode='login';pendingRetry=null;render();}});
for(const [key,className] of [['font','large-reading'],['small-font','small-reading'],['contrast','high-contrast'],['motion','reduced-motion']])try{document.documentElement.classList.toggle(className,localStorage.getItem('vt-new:'+key)==='on');}catch(_){}
(location.pathname==='/dm'?loadMaster():refresh()).catch(error=>{message(error.message,true);main.replaceChildren(card(title('El mundo no respondió','Volver a intentar'),subtitle('Tu aventura no cambia mientras no se confirme una acción.'),button('Reconectar',()=>refresh().catch(e=>message(e.message,true)),{class:'primary'})));});

function applyPassiveSnapshot(next){
 if(busy||view==='master'||!state?.character||state.character.status!=='approved')return false;
 if(typeof next?.version==='number'&&typeof state.version==='number'&&next.version<state.version)return false;
 const stable=value=>JSON.stringify(value,(key,value)=>['timestamp','server_time','csrf_token','version'].includes(key)?undefined:value);
 if(stable(next)===stable(state)){state=next;return false;}
 const active=document.activeElement,tag=active?.tagName,editable=['INPUT','SELECT','TEXTAREA'].includes(tag)&&active.type!=='password';
 const focus=active&&(main.contains(active)||navigation.contains(active))?{node:active,id:active.id,name:active.getAttribute('name'),tag,label:active.textContent,editable,value:editable?active.value:undefined,start:editable&&typeof active.selectionStart==='number'?active.selectionStart:null,end:editable&&typeof active.selectionEnd==='number'?active.selectionEnd:null}:null;
 if(focus?.name==='decision')commandDraft=focus.value;
 const locationChanged=state.character.location!==next.character?.location;
 const scroll=window.scrollY,wasFollowing=following,terminalScroll=terminalFeed.scrollTop;
 const opened=Array.from(main.querySelectorAll('details')).filter(detail=>!detail.classList.contains('visual-failed')).map(detail=>({label:detail.querySelector('summary')?.textContent,open:detail.open,scroll:detail.scrollTop}));
 const oldViewport=view==='map'?main.querySelector('.discovered-scroll'):null,mapScroll=oldViewport?{key:oldViewport.dataset.viewKey,left:oldViewport.scrollLeft,top:oldViewport.scrollTop}:null;
 const existingMap=view==='map'?main.querySelector('.visual-3d[data-map-visual-key]'):null;
 const retainMap=existingMap&&existingMap.dataset.mapVisualKey===mapVisualKey(next)?existingMap:null;
 recordNarrative(next);state=next;render();
 const newViewport=view==='map'?main.querySelector('.discovered-scroll'):null;if(mapScroll&&newViewport?.dataset.viewKey===mapScroll.key)newViewport.restoreMapScroll=mapScroll;
 // Reattach synchronously: its observer sees a connected node and keeps the canvas.
 if(retainMap)main.querySelector('.visual-3d[data-map-visual-key]')?.replaceWith(retainMap);
 for(const detail of main.querySelectorAll('details')){const previous=opened.find(saved=>saved.label===detail.querySelector('summary')?.textContent);if(previous){detail.open=previous.open;detail.scrollTop=previous.scroll;}}
 if(locationChanged&&view==='adventure'){autoScroll(0);following=true;terminalFeed.scrollTop=0;}else if(!wasFollowing){autoScroll(terminalScroll);following=false;terminalFeed.scrollTop=terminalScroll;}
 if(focus){
  let target=focus.node.isConnected?focus.node:null;
  if(!target&&focus.id)target=document.getElementById(focus.id);
  if(!target&&focus.name)target=Array.from(main.querySelectorAll('input,select,textarea')).find(node=>node.tagName===focus.tag&&node.getAttribute('name')===focus.name);
  if(!target&&['BUTTON','SUMMARY'].includes(focus.tag))target=Array.from(document.querySelectorAll('button,summary')).find(node=>node.tagName===focus.tag&&node.textContent===focus.label&&!node.disabled);
  if(target&&!target.disabled){
   if(focus.editable){if(target.tagName!=='SELECT'||Array.from(target.options).some(option=>option.value===focus.value))target.value=focus.value;}
   target.focus({preventScroll:true});
   if(focus.start!==null&&typeof target.setSelectionRange==='function')try{target.setSelectionRange(focus.start,focus.end);}catch(_){}
  }
 }
 window.scrollTo({top:scroll,behavior:'instant'});return true;
}

let lastPassiveRefresh=0;
setInterval(async()=>{if(busy||document.hidden||view==='master'||!state?.character||state.character.status!=='approved')return;if(Date.now()-lastPassiveRefresh<(state.character.combat?3000:5000))return;lastPassiveRefresh=Date.now();const characterId=state.character.id;try{const next=await api('/api/state');if(state?.character?.id!==characterId)return;applyPassiveSnapshot(next);}catch(error){message('No se pudo actualizar el mundo. Tus decisiones se enviarán sólo cuando el servidor responda.',true);}},1000);

document.addEventListener('visibilitychange',()=>{if(!document.hidden)lastPassiveRefresh=0;});
window.addEventListener('focus',()=>{lastPassiveRefresh=0;});
