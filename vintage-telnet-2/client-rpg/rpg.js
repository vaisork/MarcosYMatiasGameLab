'use strict';
const $=id=>document.getElementById(id), canvas=$('world'), ctx=canvas.getContext('2d');
const opposite={norte:'sur',sur:'norte',este:'oeste',oeste:'este'};
const gates={norte:[9,0,2,1],sur:[9,14,2,1],oeste:[0,6,1,3],este:[19,6,1,3],salir:[9,0,2,1],hogar:[4,0,2,1]};
const speciesNames={humano:'Humano',felaryn:'Felaryn',dravak:'Dravak',marevyn:'Marevyn',vesperi:'Vesperi'};
const classNames={juramentado:'Juramentado',arcano:'Arcano',sombra:'Sombra',artifice:'Artífice'};
const speciesInfo=[
 ['humano','Humano','Arraigo y cuidado cotidiano.'],
 ['felaryn','Felaryn','Gran equilibrio, agilidad y salto.'],
 ['dravak','Dravak','Bajos y compactos, piel pétrea.'],
 ['marevyn','Marevyn','Membranas y destreza acuática.'],
 ['vesperi','Vesperi','Ojos grandes y oído muy sensible.']
];
const classInfo=[
 ['juramentado','Juramentado','Espada y escudo, defensa tenaz.'],
 ['arcano','Arcano','Bastón y manipulación mágica.'],
 ['sombra','Sombra','Dagas gemelas, sigilo y emboscada.'],
 ['artifice','Artífice','Ballesta, trampas y remedios.']
];
const keys=new Set(), images={};
for(const name of ['avatar','lina','espinajo','espinajo-battle']){images[name]=new Image();images[name].src=`/client-rpg/sprites/${name}.png`;}
const backgrounds={};
function backgroundImage(path){
 if(!path||!/^backgrounds\/[a-z0-9_]+(?:-front)?\.webp$/.test(path))return null;
 if(!backgrounds[path]){const img=new Image();img.src=`/client-rpg/${path}`;backgrounds[path]=img;}
 const img=backgrounds[path];return img.complete&&img.naturalWidth?img:null;
}
const tilesetData={};
async function loadTileset(name='edran'){
 if(tilesetData[name])return tilesetData[name];
 try{
  const res=await fetch(`/client-rpg/tilesets/${encodeURIComponent(name)}.json`);
  if(!res.ok)throw Error();
  const meta=await res.json();
  const img=new Image();
  img.src=meta.image.startsWith('/')?meta.image:`/client-rpg/${meta.image}`;
  tilesetData[name]={meta,img};
  return tilesetData[name];
 }catch{return null;}
}
void loadTileset('edran');
let snapshot=null, scene=null, busy=false, pending=null, focus=null, entrance=null, exitLatch=null, lastTime=0, walk=0, facing=0;
let lastMoveTarget=null, lastRoomName=null, lastRoomId=null, activeMenu='lugar';
let authTab='login', viewMode='game', latestCsrfToken=null, savedUsername=(function(){try{return localStorage.getItem('vt-new:username')||'';}catch{return '';}})();
const player={x:10,y:7};
let battleEnteredAt=0;
let selectedRound=null, battleGroup=null, battleStart=null, lastCombat=null, outcome=null, animation=null;
let lines=[], lineIndex=0, letters=0, letterTime=0, narrativeKey='', refreshing=false, serverOffset=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const battleLocked=()=>busy||Boolean(pending)||selectedRound===snapshot?.character?.combat?.round;
function panel(open,menu){if(menu)activeMenu=menu;$('panel').hidden=!open;keys.clear();if(open)render();}
function openMenu(menu){activeMenu=menu;panel(true);render();}
function back(){
 if(battleGroup){battleGroup=null;renderBattleMenu();}
 else if(viewMode==='creation'&&snapshot?.characters?.length){viewMode='characters';render();}
 else if(!$('panel').hidden){
  if(activeMenu==='salidas'){activeMenu='lugar';render();}
  else panel(false);
 }
 else panel(true,'lugar');
}
function advance(){const line=lines[lineIndex]||'';if(letters<line.length)letters=line.length;else if(lineIndex<lines.length-1){lineIndex++;letters=0;}else if(!snapshot?.character?.combat&&!outcome)interact();paintLine();}
function paintLine(){const line=lines[lineIndex]||snapshot?.room?.description||'El camino se abre ante ti.';$('line').textContent=line.slice(0,letters);$('more').textContent=letters<line.length?'A · mostrar texto':lineIndex<lines.length-1?`A · siguiente (${lines.length-lineIndex-1})`:snapshot?.character?.combat?'Elige un comando · A':'A · interactuar';}
function updatePresentation(previous,next){
 if(!next.character||next.character.id!==previous?.character?.id){selectedRound=null;lastCombat=null;outcome=null;animation=null;lines=[];narrativeKey='';document.body.classList.remove('battling');}
 if(!next.character)return;
 const old=previous?.character?.combat, combat=next.character?.combat;
 if(combat&&!old){battleEnteredAt=performance.now();battleStart=previous||next;outcome=null;selectedRound=null;battleGroup=null;panel(false);}
 if(combat){
  if(old&&combat.round!==old.round){selectedRound=null;battleGroup=null;animation={at:performance.now(),enemy:old.hp-combat.hp,player:previous.character.hp-next.character.hp,oldEnemy:old.hp,oldPlayer:previous.character.hp};}
  lastCombat=combat;
 }
 if(old&&!combat){
  const start=battleStart||previous;
  const recovery=next.map?.recovery, defeated=recovery&&JSON.stringify(recovery)!==JSON.stringify(previous.map?.recovery);
  const xp=Math.max(0,next.character.xp-start.character.xp);
  const loot=(next.inventory||[]).map(i=>({name:i.name,quantity:(i.quantity||1)-((start.inventory||[]).find(j=>j.id===i.id)?.quantity||0)})).filter(i=>i.quantity>0);
  const fled=next.room?.id!==previous.room?.id&&!defeated;
  outcome={title:defeated?'Has caído':fled?'A salvo':xp>0||loot.length?'Victoria':'Fin del combate',text:[xp?`+${xp} XP`:null,...loot.map(i=>`${i.name} ×${i.quantity}`),defeated?'El servidor te ha llevado a un lugar seguro.':fled?'Has abandonado el encuentro.':null].filter(Boolean).join(' · ')};
  selectedRound=null;animation=null;keys.clear();
 }
 const text=(next.narrative||[]).map(e=>typeof e==='string'?e:e.text).filter(Boolean), key=JSON.stringify(text);
 if(key!==narrativeKey){
  const oldText=JSON.parse(narrativeKey||'[]');let common=0;while(common<text.length&&common<oldText.length&&text[common]===oldText[common])common++;
  const incoming=text.slice(common);
  const unread=old&&combat&&lines.length&&lineIndex<lines.length-1?lines.slice(lineIndex):[];
  lines=[...unread,...incoming.flatMap(t=>t.match(/.{1,155}(?:\s|$)|\S+/g)?.map(p=>p.trim())||[t])];lineIndex=0;letters=reduced?(lines[0]?.length||0):0;narrativeKey=key;
 }
 paintLine();
}
function renderBattleMenu(){
 const combat=snapshot?.character?.combat, root=$('battle-menu');root.hidden=!combat;root.replaceChildren();if(!combat)return;
 const offered=snapshot.actions||[], locked=battleLocked();
 const groups=[['Atacar',offered.filter(a=>a.id==='atacar')],['Capacidad',offered.filter(a=>!['atacar','huir','defender','usar'].includes(a.id))],['Defender',offered.filter(a=>a.id==='defender')],['Objeto',offered.filter(a=>a.id==='usar')]];
 if(battleGroup){
  const choices=groups.find(g=>g[0]===battleGroup)?.[1]||[];
  for(const a of choices)root.append(actionButton(a));
  const b=node('button','Volver · B');b.onclick=()=>{battleGroup=null;renderBattleMenu();};root.append(b);
 }else{
  for(const [label,choices] of groups){const b=node('button',label);b.disabled=locked||!choices.some(a=>!a.disabled);b.title=choices.length?choices.map(a=>a.reason||a.description||a.label).join(' · '):'No disponible en este encuentro';b.onclick=()=>{if(label==='Atacar'&&choices.length===1)void perform(choices[0]);else{battleGroup=label;renderBattleMenu();}};root.append(b);}
  for(const a of offered.filter(a=>a.id==='huir')){const b=actionButton(a);b.classList.add('flee');root.append(b);}
 }
 if(pending){const b=node('button','Reintentar decisión');b.onclick=()=>send(pending);root.append(b);}
}
function bar(x,y,w,value,max,color){ctx.fillStyle='#192d30';ctx.fillRect(x,y,w,10);ctx.fillStyle=color;ctx.fillRect(x+2,y+2,Math.max(0,Math.min(1,value/max))*(w-4),6);}
function battleDraw(time){
 const c=snapshot.character,b=c.combat||lastCombat;if(!b)return;
 const elapsed=animation?(time-animation.at)/1000:9, blend=reduced?1:Math.min(1,elapsed/.8);
 const enemyHp=animation?animation.oldEnemy+(b.hp-animation.oldEnemy)*blend:b.hp;
 const playerHp=animation?animation.oldPlayer+(c.hp-animation.oldPlayer)*blend:c.hp;
 const shake=!reduced&&elapsed<.6?Math.sin(elapsed*65)*5*(1-elapsed/.6):0;
 const backdrop=backgroundImage('backgrounds/edran_battle.webp');
 if(backdrop)ctx.drawImage(backdrop,0,0,640,480);else{
 ctx.fillStyle='#8da087';ctx.fillRect(0,0,640,480);
 ctx.fillStyle='#697e65';ctx.fillRect(0,148,640,90);ctx.fillStyle='#546e5e';ctx.fillRect(0,222,640,258);
 for(let x=0;x<640;x+=32){ctx.fillStyle='#7c906f';ctx.fillRect(x,140+(x%96)/4,32,30);ctx.fillStyle='#465f51';ctx.fillRect(x,260+(x%64),18,3);}
 const platform=(x,y,rx,ry)=>{ctx.fillStyle='#344f45';ctx.beginPath();ctx.ellipse(x,y+10,rx,ry,0,0,7);ctx.fill();ctx.fillStyle='#b7ad7c';ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill();ctx.fillStyle='#8c9564';ctx.beginPath();ctx.ellipse(x,y-4,rx-10,ry-7,0,0,7);ctx.fill();};
 platform(466,222,130,34);platform(155,407,145,40);
 }
 const lunge=!reduced&&elapsed<.35?Math.sin(elapsed/.35*Math.PI)*24:0;
 const enemy=b.creature==='espinajo_rastrojo'?images['espinajo-battle']:null;
 if(!(animation?.enemy>0&&elapsed<.8&&Math.floor(elapsed*14)%2)&&enemy?.complete&&enemy.naturalWidth)ctx.drawImage(enemy,366+shake,45,200,200);
 if(!enemy){ctx.fillStyle='#e7e2bd';ctx.font='bold 80px monospace';ctx.textAlign='center';ctx.fillText('?',466,190);}
 const avatar=images.avatar;
 if(!(animation?.player>0&&elapsed<.8&&Math.floor(elapsed*14)%2)&&avatar.complete&&avatar.naturalWidth)ctx.drawImage(avatar,64,96,64,96,85+lunge,235,128,192);
 const box=(x,y,w,h)=>{ctx.fillStyle='#e7e2bd';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#2c4742';ctx.lineWidth=4;ctx.strokeRect(x,y,w,h);ctx.fillStyle='#253e38';ctx.font='bold 21px monospace';ctx.textAlign='left';};
 box(22,24,333,91);ctx.fillText(b.name.replace(/ · nivel \d+$/, ''),36,52,305);
 const known=(snapshot.bestiary||[]).find(e=>(e.id===b.creature||e.creature===b.creature));
 const level=b.level||known?.level||b.name.match(/nivel (\d+)$/)?.[1];ctx.font='18px monospace';ctx.fillText(level?`Nv. ${level}`:'Nivel no revelado',36,74);bar(36,84,219,enemyHp,b.hp_max,'#517347');ctx.fillText(`${Math.ceil(enemyHp)}/${b.hp_max}`,265,96);
 box(310,310,308,134);ctx.fillText(c.name,325,339,210);ctx.font='18px monospace';ctx.fillText(`Nv. ${c.level}`,539,339);ctx.fillText(`PV ${Math.ceil(playerHp)} / ${c.hp_max}`,325,365);bar(325,375,275,playerHp,c.hp_max,'#517347');ctx.fillText(`Fatiga ${c.fatigue??0} / 100`,325,409);bar(325,419,275,c.fatigue||0,100,'#a27a48');
 if(animation&&elapsed<1.3){ctx.font='bold 32px monospace';ctx.textAlign='center';for(const [amount,x,y] of [[animation.enemy,465,90],[animation.player,155,270]])if(amount!==0){ctx.fillStyle='#1a2f2c';ctx.fillText(`${amount>0?'−':'+'}${Math.abs(amount).toFixed(0)}`,x+2,y-elapsed*28+2);ctx.fillStyle=amount>0?'#ffebad':'#aee3b5';ctx.fillText(`${amount>0?'−':'+'}${Math.abs(amount).toFixed(0)}`,x,y-elapsed*28);}}
 if(!reduced&&time-battleEnteredAt<400){ctx.fillStyle=`rgba(16,29,32,${1-(time-battleEnteredAt)/400})`;ctx.fillRect(0,0,640,480);}
 const remaining=Math.max(0,b.next_round-(Date.now()/1000+serverOffset));$('turn').textContent=c.combat?`${selectedRound===b.round?'Esperando turno…':'Ronda '+b.round} · ${remaining.toFixed(1)} s`:'';
}

const requestId=()=>globalThis.crypto?.randomUUID?.()||`rpg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const notice=text=>{$('notice').textContent=text;};
function node(tag,text){const n=document.createElement(tag);n.textContent=text;return n;}
async function api(path,body){
 const csrf=latestCsrfToken||snapshot?.csrf_token||'';
 const headers={Accept:'application/json'};
 const options={credentials:'same-origin',headers};
 if(body){
  options.method='POST';
  headers['Content-Type']='application/json';
  if(csrf)headers['X-CSRF-Token']=csrf;
  options.body=JSON.stringify({...body,...(csrf?{csrf_token:csrf}:{})});
 }
 const response=await fetch(path,options);
 let data;try{data=await response.json();}catch{throw Error('Respuesta ilegible. Reconecta antes de decidir.');}
 if(data?.csrf_token){latestCsrfToken=data.csrf_token;if(snapshot)snapshot.csrf_token=data.csrf_token;}
 if(response.headers?.get?.('Date'))serverOffset=new Date(response.headers.get('Date')).getTime()/1000-Date.now()/1000;
 if(!response.ok){const error=Error(data?.message||'No se pudo completar la acción.');error.status=response.status;throw error;}return data;
}
async function logout(){
 if(busy)return;
 busy=true;notice('Cerrando sesión…');
 try{
  await api('/api/account/logout',{});
  snapshot=null;scene=null;pending=null;lines=[];narrativeKey='';
  viewMode='auth';
  notice('Sesión cerrada.');
  await refresh();
 }catch(e){notice(e.message);}
 finally{busy=false;render();}
}
function generic(room){
 const exits=(room.exits||[]).map(e=>({direction:e.direction,rect:gates[e.direction]||[9,0,2,1]}));
 const ground=Array.from({length:15},(_,y)=>Array.from({length:20},(_,x)=>x===0||x===19||y===0||y===14?'f':'g'));
 for(const {rect:[x,y,w,h]} of exits)for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)ground[j][i]='p';
 return {size:[20,15],tile:16,tileset:'edran',layers:{ground:ground.map(r=>r.join('')),solid:ground.map(r=>r.map(c=>c==='f'?'1':'.').join(''))},spawn:{default:[10,7],norte:[10,1],sur:[10,13],este:[18,7],oeste:[1,7]},exits,npcs:[],creatures:[]};
}
async function apply(next){
 if(next?.csrf_token)latestCsrfToken=next.csrf_token;
 const changed=next.room?.id!==snapshot?.room?.id||next.character?.id!==snapshot?.character?.id;
 updatePresentation(snapshot,next);snapshot=next;
 if(!next.authenticated){scene=null;viewMode='auth';render();return;}
 if(!next.character||next.pending_approval||next.character.status!=='approved'||!next.room){
  scene=null;
  if(viewMode==='game'){viewMode=(!next.characters||next.characters.length===0)?'creation':'characters';}
  render();return;
 }
 if((changed||!scene)&&viewMode==='game'){
  focus=null;
  let loadedScene=null;
  try{const response=await fetch(`/client-rpg/scenes/${encodeURIComponent(next.room.id)}.json`);if(!response.ok)throw Error();loadedScene=await response.json();}catch{loadedScene=generic(next.room);}
  scene=loadedScene;
  void loadTileset(scene.tileset||'edran');
  const real=new Set((next.room.exits||[]).map(e=>e.direction));scene.exits=scene.exits.filter(e=>real.has(e.direction));
  for(const direction of real)if(!scene.exits.some(e=>e.direction===direction))scene.exits.push({direction,rect:gates[direction]||[9,0,2,1]});
  for(const e of scene.exits){
   const [x,y,w,h]=e.rect;
   for(let j=y;j<y+h;j++){
    if(scene.layers.solid[j]){
     const row=[...scene.layers.solid[j]];
     for(let i=x;i<x+w;i++)if(i>=0&&i<scene.size[0])row[i]='.';
     scene.layers.solid[j]=row.join('');
    }
   }
  }
  let arrivalDir=null;
  if(lastRoomName&&lastMoveTarget){
   const returnAction=(next.actions||[]).find(a=>a.id==='mover'&&a.label&&a.label.includes(lastRoomName));
   if(returnAction&&scene.exits.some(e=>e.direction===returnAction.target))arrivalDir=returnAction.target;
   else if(opposite[lastMoveTarget]&&scene.exits.some(e=>e.direction===opposite[lastMoveTarget]))arrivalDir=opposite[lastMoveTarget];
  }
  if(!arrivalDir&&entrance&&scene.exits.some(e=>e.direction===entrance))arrivalDir=entrance;
  if(!arrivalDir&&scene.exits.length===1)arrivalDir=scene.exits[0].direction;
  let spawnPos=(arrivalDir&&scene.spawn[arrivalDir])||scene.spawn.default||[10,7];
  const isFree=(x,y)=>{
   const ix=Math.floor(x),iy=Math.floor(y);
   if(ix<0||iy<0||ix>=scene.size[0]||iy>=scene.size[1])return false;
   return ['.','0',' '].includes(scene.layers.solid[iy]?.[ix])&&!blocked(x,y);
  };
  if(!isFree(spawnPos[0],spawnPos[1])){
   const q=[[Math.round(spawnPos[0]),Math.round(spawnPos[1])]],seen=new Set([`${q[0][0]},${q[0][1]}`]);
   let found=null;
   while(q.length){
    const [cx,cy]=q.shift();
    if(isFree(cx,cy)){found=[cx,cy];break;}
    for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){
     const nx=cx+dx,ny=cy+dy,key=`${nx},${ny}`;
     if(nx>=1&&nx<scene.size[0]-1&&ny>=1&&ny<scene.size[1]-1&&!seen.has(key)){seen.add(key);q.push([nx,ny]);}
    }
   }
   if(found)spawnPos=found;
  }
  [player.x,player.y]=[...spawnPos];
  entrance=null;lastMoveTarget=null;lastRoomName=null;lastRoomId=null;exitLatch=null;keys.clear();
 }
 render();
}
function entities(){
 if(!scene||!snapshot?.room)return [];
 const npcs=snapshot.room.npcs.map((n,i)=>({...n,at:scene.npcs.find(p=>p.id===n.id)?.at||[4+i*2,5],sprite:'lina'}));
 const ids=new Set(snapshot.actions.filter(a=>['combatir','acercarse','retirarse'].includes(a.id)||(a.id==='examinar_criatura'&&scene.creatures.some(e=>e.id===a.target))).map(a=>a.target));
 if(snapshot.character.combat)ids.add(snapshot.character.combat.creature);
 return [...npcs,...[...ids].map((id,i)=>({id,name:snapshot.character.combat?.creature===id?snapshot.character.combat.name:id.replaceAll('_',' '),at:scene.creatures.find(p=>p.id===id)?.at||[12-i*2,5],sprite:id==='espinajo_rastrojo'?'espinajo':null}))];
}
function actionButton(action){
 const b=node('button',action.label||action.id);b.type='button';b.disabled=(snapshot?.character?.combat?battleLocked():busy||Boolean(pending))||Boolean(action.disabled);b.title=action.reason||action.description||'';
 b.addEventListener('click',()=>perform(action));
 if(action.disabled&&action.reason){const wrap=node('div','');wrap.append(b,node('small',action.reason));return wrap;}return b;
}
// Polling must not rebuild the entry forms: that wipes what the player is typing.
let entryKey='';
const entryState=()=>JSON.stringify([snapshot?.authenticated,authTab,viewMode,snapshot?.pending_approval,snapshot?.character?.id,snapshot?.character?.status,(snapshot?.characters||[]).map(c=>[c.id,c.status])]);
function renderEntry(){
 const root=$('entry');if(!root)return;entryKey=entryState();root.replaceChildren();
 if(!snapshot?.authenticated){
  const h2=node('h2',authTab==='login'?'Iniciar sesión':'Crear cuenta');
  const intro=node('p','Vintage Telnet y Vaisgard RPG comparten mundo, cuenta y personaje.');
  intro.className='muted';
  const tabs=node('div','');tabs.className='entry-tabs';
  const bLogin=node('button','Iniciar sesión');bLogin.type='button';if(authTab==='login')bLogin.className='active';
  bLogin.onclick=()=>{authTab='login';notice('');renderEntry();};
  const bReg=node('button','Registrarse');bReg.type='button';if(authTab==='register')bReg.className='active';
  bReg.onclick=()=>{authTab='register';notice('');renderEntry();};
  tabs.append(bLogin,bReg);
  const form=document.createElement('form');form.className='entry-form';
  const userLabel=node('label','');userLabel.className='field';userLabel.append(node('span','Nombre de cuenta'));
  const userInput=document.createElement('input');userInput.name='username';userInput.type='text';userInput.autocomplete='username';userInput.required=true;userInput.minLength=3;userInput.maxLength=40;userInput.value=savedUsername;userLabel.append(userInput);
  const passLabel=node('label','');passLabel.className='field';passLabel.append(node('span','Contraseña (mínimo 8 caracteres)'));
  const passInput=document.createElement('input');passInput.name='password';passInput.type='password';passInput.autocomplete=authTab==='login'?'current-password':'new-password';passInput.required=true;passInput.minLength=8;passInput.maxLength=200;passLabel.append(passInput);
  const actions=node('div','');actions.className='form-actions';
  const submitBtn=node('button',authTab==='login'?'Entrar · A':'Crear cuenta · A');submitBtn.type='submit';submitBtn.className='primary-btn';submitBtn.disabled=busy;actions.append(submitBtn);
  form.append(userLabel,passLabel,actions);
  form.onsubmit=async e=>{
   e.preventDefault();if(busy)return;
   const username=userInput.value.trim(),password=passInput.value;savedUsername=username;busy=true;notice('Conectando…');
   try{const res=await api(`/api/account/${authTab}`,{username,password});notice('');await apply(res);}
   catch(err){notice(err.message);}
   finally{busy=false;render();}
  };
  root.append(h2,intro,tabs,form);return;
 }
 const chars=snapshot.characters||[];
 if(viewMode==='creation'||chars.length===0){
  const h2=node('h2','Crear personaje');
  const intro=node('p','Elige el nombre, especie, clase y género para recorrer Vaisgard.');
  intro.className='muted';
  const form=document.createElement('form');form.className='entry-form';
  const nameLabel=node('label','');nameLabel.className='field';nameLabel.append(node('span','Nombre del personaje (2–50 caracteres)'));
  const nameInput=document.createElement('input');nameInput.name='name';nameInput.type='text';nameInput.required=true;nameInput.minLength=2;nameInput.maxLength=50;nameInput.placeholder='Nombre en Vaisgard';nameLabel.append(nameInput);
  const specGroup=node('div','');specGroup.className='choice-group';specGroup.append(node('label','Especie'));
  const specGrid=node('div','');specGrid.className='choice-grid';
  speciesInfo.forEach(([id,name,desc],idx)=>{
   const card=node('label','');card.className='choice-card';
   const rad=document.createElement('input');rad.type='radio';rad.name='species';rad.value=id;rad.checked=idx===0;
   const info=node('div','');info.append(node('strong',name),node('small',desc));
   card.append(rad,info);specGrid.append(card);
  });
  specGroup.append(specGrid);
  const classGroup=node('div','');classGroup.className='choice-group';classGroup.append(node('label','Clase'));
  const classGrid=node('div','');classGrid.className='choice-grid';
  classInfo.forEach(([id,name,desc],idx)=>{
   const card=node('label','');card.className='choice-card';
   const rad=document.createElement('input');rad.type='radio';rad.name='class_id';rad.value=id;rad.checked=idx===0;
   const info=node('div','');info.append(node('strong',name),node('small',desc));
   card.append(rad,info);classGrid.append(card);
  });
  classGroup.append(classGrid);
  const genGroup=node('div','');genGroup.className='choice-group';genGroup.append(node('label','Género'));
  const genRow=node('div','');genRow.className='gender-row';
  const radM=document.createElement('input');radM.type='radio';radM.name='gender';radM.value='masculino';radM.checked=true;
  const lblM=node('label','');lblM.append(radM,document.createTextNode(' Masculino'));
  const radF=document.createElement('input');radF.type='radio';radF.name='gender';radF.value='femenino';
  const lblF=node('label','');lblF.append(radF,document.createTextNode(' Femenino'));
  genRow.append(lblM,lblF);genGroup.append(genRow);
  const actions=node('div','');actions.className='form-actions';
  const submitBtn=node('button','Presentar personaje · A');submitBtn.type='submit';submitBtn.className='primary-btn';submitBtn.disabled=busy;actions.append(submitBtn);
  if(chars.length>0){
   const backBtn=node('button','Volver · B');backBtn.type='button';backBtn.onclick=()=>{viewMode='characters';notice('');render();};actions.append(backBtn);
  }
  form.append(nameLabel,specGroup,classGroup,genGroup,actions);
  form.onsubmit=async e=>{
   e.preventDefault();if(busy)return;
   const fd=new FormData(form);
   const name=String(fd.get('name')||'').trim(),species=String(fd.get('species')||'humano'),class_id=String(fd.get('class_id')||'juramentado'),gender=String(fd.get('gender')||'masculino');
   busy=true;notice('Presentando personaje al mundo…');
   try{const res=await api('/api/character/create',{name,species,class_id,gender});notice('');viewMode='characters';await apply(res);}
   catch(err){notice(err.message);}
   finally{busy=false;render();}
  };
  root.append(h2,intro,form);return;
 }
 const h2=node('h2','Tus personajes');
 const user=snapshot.account?.username||'';
 const intro=node('p',`Cuenta: ${user} · Elige con quién jugar o crea otro personaje.`);
 intro.className='muted';
 const charList=node('div','');charList.className='char-list';
 let hasPending=Boolean(snapshot.pending_approval);
 for(const c of chars){
  const isApproved=c.status==='approved';if(!isApproved)hasPending=true;
  const tile=node('div','');tile.className=isApproved?'char-tile':'char-tile pending';
  const info=node('div','');info.className='char-info';
  info.append(node('strong',c.name));
  info.append(node('small',`${speciesNames[c.species]||c.species} · ${classNames[c.class_id]||c.class_id}`));
  const pill=node('span',isApproved?'Aprobado':'Pendiente de aprobación');pill.className=isApproved?'pill approved':'pill';
  info.append(pill);
  if(!isApproved){
   const note=node('p','El director aún está revisando este personaje antes de comenzar.');note.className='pending-note';info.append(note);
  }
  tile.append(info);
  if(isApproved){
   const playBtn=node('button','Entrar al mundo · A');playBtn.type='button';playBtn.className='primary-btn';playBtn.disabled=busy;
   playBtn.onclick=async()=>{
    if(busy)return;busy=true;notice('Entrando al mundo…');
    try{const res=await api('/api/character/select',{character_id:Number(c.id)});viewMode='game';notice('');await apply(res);}
    catch(err){notice(err.message);}
    finally{busy=false;render();}
   };
   tile.append(playBtn);
  }
  charList.append(tile);
 }
 const actions=node('div','');actions.className='form-actions';
 if(hasPending){
  const checkBtn=node('button','Comprobar aprobación');checkBtn.type='button';checkBtn.disabled=busy;
  checkBtn.onclick=async()=>{
   if(busy)return;busy=true;notice('Comprobando aprobación…');
   try{
    await refresh();
    if(snapshot?.pending_approval||(snapshot?.characters||[]).some(c=>c.status!=='approved')){
     notice('El director aún está revisando tu personaje.');
    }else{notice('¡Personaje aprobado!');}
   }catch(err){notice(err.message);}
   finally{busy=false;render();}
  };
  actions.append(checkBtn);
 }
 const createBtn=node('button','+ Crear otro personaje');createBtn.type='button';createBtn.onclick=()=>{viewMode='creation';notice('');render();};actions.append(createBtn);
 const logoutBtn=node('button','Cerrar sesión');logoutBtn.type='button';logoutBtn.onclick=logout;actions.append(logoutBtn);
 root.append(h2,intro,charList,actions);
}
function render(){
 const auth=Boolean(snapshot?.authenticated);
 const inGame=auth&&snapshot?.character?.status==='approved'&&!snapshot?.pending_approval&&viewMode==='game';
 const logoutElem=$('logout');if(logoutElem)logoutElem.hidden=!auth;
 const entryElem=$('entry');const worldElem=$('world-view');
 if(!inGame){
  if(worldElem)worldElem.hidden=true;
  if(entryElem){
   entryElem.hidden=false;
   if(entryState()!==entryKey)renderEntry();
   document.querySelectorAll('#entry button[type=submit], #entry .primary-btn').forEach(b=>{b.disabled=busy;});
  }
  panel(false);return;
 }
 if(entryElem)entryElem.hidden=true;
 if(worldElem)worldElem.hidden=false;
 if(!snapshot?.room||!scene)return;
 const c=snapshot.character,combat=c.combat;
 if(focus&&!entities().some(e=>e.id===focus))focus=null;
 $('place').textContent=snapshot.room.name;
 $('identity').textContent=`${c.name} · Nv.${c.level} · PV ${Math.ceil(c.hp)}/${c.hp_max} · XP ${c.xp}/${c.xp_next}`;
 $('speaker').textContent=combat?(combat.prepared_action?.name||'Combate'):focus?(entities().find(e=>e.id===focus)?.name||'Conversación'):'El camino';

 const npcs=snapshot.room.npcs||[];
 const creatureEntities=entities().filter(e=>!npcs.some(n=>n.id===e.id));
 const inv=snapshot.inventory||[];
 if($('bar-personas'))$('bar-personas').textContent=npcs.length?`Personas (${npcs.length})`:'Personas';
 if($('bar-criaturas'))$('bar-criaturas').textContent=creatureEntities.length?`Criaturas (${creatureEntities.length})`:'Criaturas';
 if($('bar-mochila'))$('bar-mochila').textContent=inv.length?`Mochila (${inv.length})`:'Mochila';

 for(const btn of document.querySelectorAll('[data-menu]')){
  btn.classList.toggle('active',!$('panel').hidden&&(btn.dataset.menu===activeMenu||(activeMenu==='salidas'&&btn.dataset.menu==='lugar')));
 }
 for(const btn of document.querySelectorAll('[data-sub]')){
  btn.classList.toggle('active',btn.dataset.sub===activeMenu||(activeMenu==='salidas'&&btn.dataset.sub==='lugar'));
 }

 const descElem=$('description'),ctxElem=$('contexts'),actElem=$('actions');
 const acctTools=$('panel-account-tools'),historyElem=$('panel-history');
 if(acctTools)acctTools.hidden=(activeMenu!=='mas');
 if(historyElem)historyElem.hidden=(activeMenu!=='mas');

 if(activeMenu==='personas'){
  if(!npcs.some(n=>n.id===focus))focus=null;
  $('action-title').textContent=focus?`Personas · ${entities().find(e=>e.id===focus)?.name||focus}`:'Personas';
  descElem.textContent=npcs.length?'Elige una persona para conversar o interactuar:':'No hay nadie con quien hablar en este lugar.';
  if(npcs.length>1){
   ctxElem.replaceChildren(...npcs.map(n=>{
    const b=node('button',n.name);
    if(focus===n.id)b.classList.add('selected');
    b.onclick=()=>{focus=n.id;render();};
    return b;
   }));
  }else ctxElem.replaceChildren();
  if(!focus&&npcs.length===1)focus=npcs[0].id;
  const actions=snapshot.actions.filter(a=>focus?a.target===focus||(a.id==='conversar'&&(!a.target||a.target===focus)):a.id==='conversar');
  if(actions.length)actElem.replaceChildren(...actions.map(actionButton));
  else actElem.replaceChildren(node('p',npcs.length?'No hay más temas de conversación ahora.':''));
 }else if(activeMenu==='criaturas'){
  if(!creatureEntities.some(e=>e.id===focus))focus=null;
  $('action-title').textContent=focus?`Criatura · ${entities().find(e=>e.id===focus)?.name||focus}`:'Criaturas';
  descElem.textContent=creatureEntities.length?'Criaturas en la zona o en combate:':'No hay criaturas en este lugar.';
  if(creatureEntities.length>1){
   ctxElem.replaceChildren(...creatureEntities.map(e=>{
    const b=node('button',e.name);
    if(focus===e.id)b.classList.add('selected');
    b.onclick=()=>{focus=e.id;render();};
    return b;
   }));
  }else ctxElem.replaceChildren();
  if(!focus&&creatureEntities.length===1)focus=creatureEntities[0].id;
  const actions=snapshot.actions.filter(a=>['combatir','acercarse','retirarse','examinar_criatura'].includes(a.id)||(focus&&a.target===focus));
  if(actions.length)actElem.replaceChildren(...actions.map(actionButton));
  else actElem.replaceChildren(node('p',creatureEntities.length?'Sin acciones directas disponibles.':''));
 }else if(activeMenu==='mochila'){
  $('action-title').textContent='Mochila y equipo';
  ctxElem.replaceChildren();
  if(inv.length){
   descElem.textContent='Objetos que llevas en tu mochila:';
   const list=node('div','');list.className='inventory-list';
   for(const item of inv){
    const row=node('div','');row.className='inventory-item';
    row.append(node('strong',item.name),node('span',`×${item.quantity??item.amount??1}${item.equipped?' · Equipado':''}`));
    list.append(row);
   }
   ctxElem.append(list);
  }else{
   descElem.textContent='Tu mochila está vacía.';
  }
  const actions=snapshot.actions.filter(a=>['usar','equipar','desequipar','descartar','objeto'].includes(a.id));
  if(actions.length)actElem.replaceChildren(...actions.map(actionButton));
  else actElem.replaceChildren(node('p',inv.length?'No hay objetos utilizables ahora.':''));
 }else if(activeMenu==='salidas'){
  $('action-title').textContent='Ir a salida…';
  descElem.textContent='Salidas reales del lugar (desplazamiento de emergencia sin caminar):';
  ctxElem.replaceChildren();
  const moverActions=snapshot.actions.filter(a=>a.id==='mover');
  const backBtn=node('button','← Volver a Lugar');backBtn.onclick=()=>openMenu('lugar');
  actElem.replaceChildren(...moverActions.map(actionButton),backBtn);
 }else if(activeMenu==='mas'){
  $('action-title').textContent='Más opciones';
  descElem.textContent=`${c.name} · ${speciesNames[c.species]||c.species} · ${classNames[c.class_id]||c.class_id}`;
  const statGrid=node('div','');statGrid.className='char-summary';
  for(const [label,value] of [
   ['Nivel',c.level],['Vitalidad',`${Math.ceil(c.hp)} / ${c.hp_max}`],
   ['Fatiga',`${c.fatigue??0} / 100`],['Sellos',c.seals??0],
   ['Experiencia',`${c.xp} / ${c.xp_next}`],['Herida',c.wound||'Ninguna']
  ]){
   const stat=node('div',label);stat.className='char-stat';
   stat.append(node('strong',String(value)));statGrid.append(stat);
  }
  ctxElem.replaceChildren(statGrid);
  actElem.replaceChildren();
 }else{
  activeMenu='lugar';
  $('action-title').textContent=`Lugar · ${snapshot.room.name}`;
  descElem.textContent=snapshot.room.description;
  ctxElem.replaceChildren();
  const roomActions=snapshot.actions.filter(a=>!['mover','atacar','defender','huir','usar','equipar','desequipar','conversar','combatir','acercarse','retirarse','examinar_criatura'].includes(a.id)&&!npcs.some(n=>n.id===a.target));
  const emergencyExitBtn=node('button','Ir a salida… (salida de emergencia)');
  emergencyExitBtn.className='primary-btn';
  emergencyExitBtn.onclick=()=>openMenu('salidas');
  actElem.replaceChildren(...roomActions.map(actionButton),emergencyExitBtn);
 }

 if(pending){const b=node('button','Reintentar la misma decisión');b.onclick=()=>send(pending);actElem.prepend(b);}
 $('combat').hidden=!combat;document.body.classList.toggle('battling',Boolean(combat));
 $('combat').replaceChildren();
 renderBattleMenu();$('outcome').hidden=!outcome;
 if(outcome){const b=node('button','Continuar · A');b.onclick=dismissOutcome;$('outcome').replaceChildren(node('strong',outcome.title),node('p',outcome.text),b);}
 if(!combat)$('turn').textContent='';
 const text=(snapshot.narrative||[]).map(e=>typeof e==='string'?e:e.text).filter(Boolean);
 if($('narrative').dataset.text!==JSON.stringify(text)){$('narrative').replaceChildren(...text.map(t=>node('p',t)));$('narrative').dataset.text=JSON.stringify(text);}
}
function dismissOutcome(){outcome=null;lastCombat=null;render();}
async function perform(action){
 if(busy||pending||(snapshot?.character?.combat&&selectedRound===snapshot.character.combat.round))return;
 const offered=snapshot.actions.find(a=>a.id===action.id&&a.target===action.target&&a.topic===action.topic);
 if(!offered||offered.disabled){notice(offered?.reason||'Esta acción no está disponible ahora.');return;}
 const payload={id:offered.id,request_id:requestId()};
 for(const key of ['target','topic','confirmed'])if(offered[key]!==undefined)payload[key]=offered[key];
 if(offered.confirmation){if(!window.confirm(offered.confirmation))return;payload.confirmed=true;}
 if(snapshot.character.combat){selectedRound=snapshot.character.combat.round;battleGroup=null;}
 await send(payload);
}
async function send(payload){
 if(busy)return;busy=true;render();notice('Consultando el mundo…');
 const beforeId=snapshot.room?.id, beforeName=snapshot.room?.name;
 try{
  const next=await api('/api/action',payload);
  pending=null;
  if(next.room?.id!==beforeId&&payload.id==='mover'){
   lastMoveTarget=payload.target;
   lastRoomName=beforeName;
   lastRoomId=beforeId;
   entrance=opposite[payload.target];
  }
  await apply(next);
  notice('');
 }
 catch(error){if(!error.status)pending=payload;else selectedRound=null;notice(error.message+(pending?' Reintenta la misma decisión para evitar duplicados.':''));}
 finally{busy=false;render();}
}
function interact(){
 if(outcome){dismissOutcome();return;}
 if(snapshot?.character?.combat){if(document.activeElement?.closest('#battle-menu')){document.activeElement.click();return;}const button=$('battle-menu').querySelector('button:not(:disabled)');button?.focus();return;}
 const near=entities().sort((a,b)=>Math.hypot(a.at[0]-player.x,a.at[1]-player.y)-Math.hypot(b.at[0]-player.x,b.at[1]-player.y))[0];
 if(near&&Math.hypot(near.at[0]-player.x,near.at[1]-player.y)<3){
  focus=near.id;
  const isNpc=(snapshot?.room?.npcs||[]).some(n=>n.id===near.id);
  openMenu(isNpc?'personas':'criaturas');
 }else{
  openMenu('lugar');
 }
}
$('interact').onclick=()=>{if(outcome)dismissOutcome();else if(letters<(lines[lineIndex]?.length||0)||lineIndex<lines.length-1)advance();else interact();};
$('advance').onclick=()=>outcome?dismissOutcome():advance();$('pause').onclick=()=>panel($('panel').hidden);$('back').onclick=back;$('close-panel').onclick=back;
const panelSelect=$('panel-select-char');if(panelSelect)panelSelect.onclick=()=>{panel(false);viewMode='characters';render();};
const panelLogout=$('panel-logout');if(panelLogout)panelLogout.onclick=()=>{panel(false);logout();};
const headerLogout=$('logout');if(headerLogout)headerLogout.onclick=logout;
for(const b of document.querySelectorAll('[data-menu]')){b.onclick=()=>openMenu(b.dataset.menu);}
for(const b of document.querySelectorAll('[data-sub]')){b.onclick=()=>openMenu(b.dataset.sub);}
const bindings={ArrowUp:[0,-1,1],w:[0,-1,1],ArrowDown:[0,1,0],s:[0,1,0],ArrowLeft:[-1,0,2],a:[-1,0,2],ArrowRight:[1,0,3],d:[1,0,3]};
window.addEventListener('keydown',e=>{if(e.target.closest?.('input,textarea,select'))return;const key=e.key.length===1?e.key.toLowerCase():e.key;
 if(['x','Escape'].includes(key)){e.preventDefault();if(!e.repeat)back();return;}
 if(['z','Enter',' ','e'].includes(key)){if(e.target.closest?.('button,a')&&key==='Enter')return;e.preventDefault();if(!e.repeat)$('interact').click();return;}
 if(bindings[key]){e.preventDefault();if(snapshot?.character?.combat||!$('panel').hidden){if(!e.repeat){const buttons=[...(snapshot?.character?.combat?$('battle-menu'):$('panel')).querySelectorAll('button:not(:disabled)')];const i=buttons.indexOf(document.activeElement),step=['ArrowUp','w','ArrowLeft','a'].includes(key)?-1:1;buttons[(i+step+buttons.length)%buttons.length]?.focus();}}else keys.add(key);}});
window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys.delete(b.dataset.key));}
function blocked(x,y){return [x-.22,x+.22].some(px=>[y-.18,y+.18].some(py=>px<0||py<0||px>=scene.size[0]||py>=scene.size[1]||!['.','0',' '].includes(scene.layers.solid[Math.floor(py)]?.[Math.floor(px)]||'1')));}
function draw(time){
 const dt=Math.min((time-lastTime)/1000,.04);lastTime=time;ctx.imageSmoothingEnabled=false;
 const currentLine=lines[lineIndex]||snapshot?.room?.description||'';if(time-letterTime>25&&letters<currentLine.length){letters=reduced?currentLine.length:letters+1;letterTime=time;paintLine();}
 if(snapshot?.character?.combat||outcome){battleDraw(time);return;}
 if(scene){
  const [width,height]=scene.size,sx=canvas.width/width,sy=canvas.height/height;
  const colors={g:'#72874c',p:'#b4a076',c:'#63763c',s:'#8b7047',w:'#467d82',b:'#bab18c',f:'#46593c'};
  const ts=tilesetData[scene.tileset||'edran'];
  if(!ts)void loadTileset(scene.tileset||'edran');
  const tsMeta=ts?.meta, tsImg=ts?.img;
  const hasTiles=tsMeta&&tsImg?.complete&&tsImg.naturalWidth;
  const tileSz=tsMeta?.tile||16;
  const cols=hasTiles?Math.floor(tsImg.naturalWidth/tileSz):0;
  const backdrop=backgroundImage(scene.background);
  if(backdrop)ctx.drawImage(backdrop,0,0,canvas.width,canvas.height);else scene.layers.ground.forEach((row,y)=>[...row].forEach((tile,x)=>{
   const idx=tsMeta?.map?.[tile];
   if(hasTiles&&typeof idx==='number'&&cols>0){
    const tx=(idx%cols)*tileSz,ty=Math.floor(idx/cols)*tileSz;
    ctx.drawImage(tsImg,tx,ty,tileSz,tileSz,x*sx,y*sy,sx,sy);
   }else{
    ctx.fillStyle=colors[tile]||colors.g;
    ctx.fillRect(x*sx,y*sy,sx+1,sy+1);
   }
  }));
  for(const e of scene.exits){const [x,y,w,h]=e.rect;ctx.fillStyle='#e6ce8d88';ctx.fillRect(x*sx,y*sy,w*sx,h*sy);ctx.fillStyle='#293a2b';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText(e.direction,(x+w/2)*sx,Math.max(12,(y+h/2)*sy));}
  const key=[...keys].find(k=>bindings[k]);let moving=false;
  if(key&&!busy&&!pending&&$('panel').hidden){const [dx,dy,dir]=bindings[key];facing=dir;const x=player.x+dx*dt*4,y=player.y+dy*dt*4;if(!blocked(x,y)){player.x=x;player.y=y;moving=true;walk+=dt*9;}}
  const actors=[...entities().map(e=>({...e,x:e.at[0],y:e.at[1]})),{...player,sprite:'avatar',id:'player'}].sort((a,b)=>a.y-b.y);
  for(const a of actors){
   const im=images[a.sprite],sheet=a.sprite==='avatar'||a.sprite==='lina';
   const height=sheet?60:48,width=sheet?40:48;
   ctx.fillStyle='#1c302b55';ctx.beginPath();ctx.ellipse(a.x*sx,a.y*sy+8,12,5,0,0,7);ctx.fill();
   if(im?.complete&&im.naturalWidth){const frame=a.id==='player'&&moving?Math.floor(walk)%3:1;ctx.drawImage(im,sheet?frame*64:0,sheet&&a.id==='player'?facing*96:0,sheet?64:48,sheet?96:48,a.x*sx-width/2,a.y*sy-height+8,width,height);}
   if(!im){ctx.fillStyle='#e6ce8d';ctx.font='bold 24px monospace';ctx.textAlign='center';ctx.fillText('?',a.x*sx,a.y*sy);}
   if(a.name){ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillStyle='#13291f';const labelWidth=ctx.measureText(a.name).width+12;ctx.fillRect(a.x*sx-labelWidth/2,a.y*sy-height-12,labelWidth,15);ctx.fillStyle='#f4e6bf';ctx.fillText(a.name,a.x*sx,a.y*sy-height-1);}
  }
  const front=backgroundImage(scene.foreground);
  if(front)ctx.drawImage(front,0,0,canvas.width,canvas.height);
  const exit=scene.exits.find(e=>{const [x,y,w,h]=e.rect;return player.x>=x&&player.x<x+w&&player.y>=y&&player.y<y+h;});
  if(!exit)exitLatch=null;
  if(exit&&exitLatch!==exit.direction&&!busy&&!pending){exitLatch=exit.direction;const action=snapshot.actions.find(a=>a.id==='mover'&&a.target===exit.direction);if(!action||action.disabled)notice(action?.reason||'Esta salida no está disponible ahora.');else void perform(action);}
 }else{ctx.fillStyle='#263d30';ctx.fillRect(0,0,640,480);}
}
async function refresh(){if(refreshing||(snapshot&&document.hidden))return;refreshing=true;try{await apply(await api('/api/state'));}catch(e){notice(e.message);}finally{refreshing=false;render();}}
async function poll(){await refresh();setTimeout(poll,snapshot?.character?.combat?700:(viewMode==='game'?4000:8000));}
void poll();
setInterval(()=>{if(!document.hidden&&viewMode==='game'&&!$('world-view')?.hidden)draw(performance.now());},33);
