'use strict';
const $=id=>document.getElementById(id), canvas=$('world'), ctx=canvas.getContext('2d');
const opposite={norte:'sur',sur:'norte',este:'oeste',oeste:'este'};
const gates={norte:[9,0,2,1],sur:[9,14,2,1],oeste:[0,6,1,3],este:[19,6,1,3],salir:[9,0,2,1],hogar:[4,0,2,1]};
const keys=new Set(), images={};
for(const name of ['avatar','lina','espinajo','terrain','espinajo-battle']){images[name]=new Image();images[name].src=`/client-rpg/sprites/${name}.png`;}
let snapshot=null, scene=null, busy=false, pending=null, focus=null, entrance=null, exitLatch=null, lastTime=0, walk=0, facing=0;
const player={x:10,y:7};
let battleEnteredAt=0;
let selectedRound=null, battleGroup=null, battleStart=null, lastCombat=null, outcome=null, animation=null;
let lines=[], lineIndex=0, letters=0, letterTime=0, narrativeKey='', refreshing=false, serverOffset=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const battleLocked=()=>busy||Boolean(pending)||selectedRound===snapshot?.character?.combat?.round;
function panel(open){$('panel').hidden=!open;keys.clear();}
function back(){if(battleGroup){battleGroup=null;renderBattleMenu();}else panel($('panel').hidden);}
function advance(){const line=lines[lineIndex]||'';if(letters<line.length)letters=line.length;else if(lineIndex<lines.length-1){lineIndex++;letters=0;}else if(!snapshot?.character?.combat&&!outcome)interact();paintLine();}
function paintLine(){const line=lines[lineIndex]||snapshot?.room?.description||'Entra con un personaje aprobado desde el MUD.';$('line').textContent=line.slice(0,letters);$('more').textContent=letters<line.length?'A · mostrar texto':lineIndex<lines.length-1?`A · siguiente (${lines.length-lineIndex-1})`:snapshot?.character?.combat?'Elige un comando · A':'A · interactuar';}
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
  // Keep unread server lines when a poll delivers another round.
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
 ctx.fillStyle='#8da087';ctx.fillRect(0,0,640,480);
 ctx.fillStyle='#697e65';ctx.fillRect(0,148,640,90);ctx.fillStyle='#546e5e';ctx.fillRect(0,222,640,258);
 for(let x=0;x<640;x+=32){ctx.fillStyle='#7c906f';ctx.fillRect(x,140+(x%96)/4,32,30);ctx.fillStyle='#465f51';ctx.fillRect(x,260+(x%64),18,3);}
 const platform=(x,y,rx,ry)=>{ctx.fillStyle='#344f45';ctx.beginPath();ctx.ellipse(x,y+10,rx,ry,0,0,7);ctx.fill();ctx.fillStyle='#b7ad7c';ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill();ctx.fillStyle='#8c9564';ctx.beginPath();ctx.ellipse(x,y-4,rx-10,ry-7,0,0,7);ctx.fill();};
 platform(466,222,130,34);platform(155,407,145,40);
 const lunge=!reduced&&elapsed<.35?Math.sin(elapsed/.35*Math.PI)*24:0;
 const enemy=b.creature==='espinajo_rastrojo'?images['espinajo-battle']:null;
 if(!(animation?.enemy>0&&elapsed<.8&&Math.floor(elapsed*14)%2)&&enemy?.complete){const size=enemy.naturalWidth===96?210:150;ctx.drawImage(enemy,0,0,enemy.naturalWidth===96?96:16,enemy.naturalWidth===96?96:16,466-size/2+shake,230-size,size,size);}
 if(!enemy){ctx.fillStyle='#e7e2bd';ctx.font='bold 80px monospace';ctx.textAlign='center';ctx.fillText('?',466,190);}
 const avatar=images.avatar;
 if(!(animation?.player>0&&elapsed<.8&&Math.floor(elapsed*14)%2)&&avatar.complete)ctx.drawImage(avatar,0,16,16,16,68+lunge,245,174,174);
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
 const response=await fetch(path,{credentials:'same-origin',headers:{Accept:'application/json',...(body?{'Content-Type':'application/json','X-CSRF-Token':snapshot?.csrf_token||''}:{})},...(body?{method:'POST',body:JSON.stringify(body)}:{})});
 let data;try{data=await response.json();}catch{throw Error('Respuesta ilegible. Reconecta antes de decidir.');}
 if(data.csrf_token&&snapshot)snapshot.csrf_token=data.csrf_token;
 if(response.headers.get('Date'))serverOffset=new Date(response.headers.get('Date')).getTime()/1000-Date.now()/1000;
 if(!response.ok){const error=Error(data.message||'No se pudo completar la acción.');error.status=response.status;throw error;}return data;
}
function generic(room){
 const exits=(room.exits||[]).map(e=>({direction:e.direction,rect:gates[e.direction]||[9,0,2,1]}));
 const ground=Array.from({length:15},(_,y)=>Array.from({length:20},(_,x)=>x===0||x===19||y===0||y===14?'f':'g'));
 for(const {rect:[x,y,w,h]} of exits)for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)ground[j][i]='p';
 return {size:[20,15],tile:16,layers:{ground:ground.map(r=>r.join('')),solid:ground.map(r=>r.map(c=>c==='f'?'1':'.').join(''))},spawn:{default:[10,7],norte:[10,1],sur:[10,13],este:[18,7],oeste:[1,7]},exits,npcs:[],creatures:[]};
}
async function apply(next){
 const changed=next.room?.id!==snapshot?.room?.id||next.character?.id!==snapshot?.character?.id;
 updatePresentation(snapshot,next);snapshot=next;
 if(!next.authenticated||next.character?.status!=='approved'||!next.room){scene=null;$('place').textContent='Tu aventura comienza en Vintage Telnet';$('identity').replaceChildren(node('p','Entra y selecciona un personaje aprobado en el MUD.'));$('actions').replaceChildren();$('contexts').replaceChildren();$('combat').hidden=true;$('narrative').replaceChildren();$('narrative').dataset.text='';$('description').textContent='Usa «Volver a Vintage Telnet» para entrar con tu cuenta.';return;}
 if(changed){
  focus=null;scene=null;
  try{const response=await fetch(`/client-rpg/scenes/${encodeURIComponent(next.room.id)}.json`);if(!response.ok)throw Error();scene=await response.json();}catch{scene=generic(next.room);}
  // Server exits are authoritative even when presentation files lag behind.
  const real=new Set(next.room.exits.map(e=>e.direction));scene.exits=scene.exits.filter(e=>real.has(e.direction));
  for(const direction of real)if(!scene.exits.some(e=>e.direction===direction))scene.exits.push({direction,rect:gates[direction]||[9,0,2,1]});
  [player.x,player.y]=scene.spawn[entrance]||scene.spawn.default;entrance=null;exitLatch=null;keys.clear();
 }
 render();
}
function entities(){
 if(!scene||!snapshot?.room)return [];
 const npcs=snapshot.room.npcs.map((n,i)=>({...n,at:scene.npcs.find(p=>p.id===n.id)?.at||[4+i*2,5],sprite:'lina'}));
 const ids=new Set(snapshot.actions.filter(a=>['combatir','acercarse','retirarse'].includes(a.id)||(a.id==='examinar_criatura'&&scene.creatures.some(e=>e.id===a.target))).map(a=>a.target));
 if(snapshot.character.combat)ids.add(snapshot.character.combat.creature);
 return [...npcs,...[...ids].map((id,i)=>({id,name:snapshot.character.combat?.creature===id?snapshot.character.combat.name:id.replaceAll('_',' '),at:scene.creatures.find(p=>p.id===id)?.at||[14-i*2,5],sprite:id==='espinajo_rastrojo'?'espinajo':null}))];
}
function actionButton(action){
 const b=node('button',action.label||action.id);b.type='button';b.disabled=(snapshot?.character?.combat?battleLocked():busy||Boolean(pending))||Boolean(action.disabled);b.title=action.reason||action.description||'';
 b.addEventListener('click',()=>perform(action));
 if(action.disabled&&action.reason){const wrap=node('div','');wrap.append(b,node('small',action.reason));return wrap;}return b;
}
function render(){
 if(!snapshot?.room||!scene)return;
 const c=snapshot.character,combat=c.combat;
 if(focus&&!entities().some(e=>e.id===focus))focus=null;
 $('place').textContent=snapshot.room.name;$('identity').textContent=`${c.name} · Nv.${c.level} · PV ${c.hp}/${c.hp_max} · XP ${c.xp}/${c.xp_next}`;$('description').textContent=snapshot.room.description;
 $('contexts').replaceChildren(...entities().map(e=>{const b=node('button',e.name);b.onclick=()=>{focus=e.id;panel(true);render();};return b;}),Object.assign(node('button','Lugar / todas las acciones'),{onclick:()=>{focus=null;render();}}));
 $('action-title').textContent=focus?`Interacción · ${entities().find(e=>e.id===focus)?.name||focus}`:'Decisiones';
 const actions=snapshot.actions.filter(a=>combat||!focus||a.target===focus||['mirar','observar'].includes(a.id));
 $('actions').replaceChildren(...actions.map(actionButton));
 if(pending){const b=node('button','Reintentar la misma decisión');b.onclick=()=>send(pending);$('actions').prepend(b);}
 $('combat').hidden=!combat;document.body.classList.toggle('battling',Boolean(combat));
 $('combat').replaceChildren();$('speaker').textContent=combat?(combat.prepared_action?.name||'Combate'):focus?(entities().find(e=>e.id===focus)?.name||'Conversación'):'El camino';
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
 const before=snapshot.room?.id;
 try{const next=await api('/api/action',payload);pending=null;if(next.room?.id!==before&&payload.id==='mover')entrance=opposite[payload.target];await apply(next);notice('');}
 catch(error){if(!error.status)pending=payload;else selectedRound=null;notice(error.message+(pending?' Reintenta la misma decisión para evitar duplicados.':''));}
 finally{busy=false;render();}
}
function interact(){if(outcome){dismissOutcome();return;}if(snapshot?.character?.combat){if(document.activeElement?.closest('#battle-menu')){document.activeElement.click();return;}const button=$('battle-menu').querySelector('button:not(:disabled)');button?.focus();return;}const near=entities().sort((a,b)=>Math.hypot(a.at[0]-player.x,a.at[1]-player.y)-Math.hypot(b.at[0]-player.x,b.at[1]-player.y))[0];focus=near&&Math.hypot(near.at[0]-player.x,near.at[1]-player.y)<3?near.id:null;panel(true);render();}
$('interact').onclick=()=>{if(outcome)dismissOutcome();else if(letters<(lines[lineIndex]?.length||0)||lineIndex<lines.length-1)advance();else interact();};
$('advance').onclick=()=>outcome?dismissOutcome():advance();$('pause').onclick=()=>panel($('panel').hidden);$('back').onclick=back;$('close-panel').onclick=()=>panel(false);
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
  scene.layers.ground.forEach((row,y)=>[...row].forEach((tile,x)=>{const index='gpcswbf'.indexOf(tile),im=images.terrain;if(im.complete&&im.naturalWidth)ctx.drawImage(im,Math.max(0,index)*32,0,32,32,x*sx,y*sy,sx,sy);else{ctx.fillStyle=colors[tile]||colors.g;ctx.fillRect(x*sx,y*sy,sx+1,sy+1);}}));
  for(const e of scene.exits){const [x,y,w,h]=e.rect;ctx.fillStyle='#e6ce8d';ctx.fillRect(x*sx,y*sy,w*sx,h*sy);ctx.fillStyle='#293a2b';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText(e.direction,(x+w/2)*sx,Math.max(12,(y+h/2)*sy));}
  const key=[...keys].find(k=>bindings[k]);let moving=false;
  if(key&&!busy&&!pending&&$('panel').hidden){const [dx,dy,dir]=bindings[key];facing=dir;const x=player.x+dx*dt*4,y=player.y+dy*dt*4;if(!blocked(x,y)){player.x=x;player.y=y;moving=true;walk+=dt*9;}}
  const actors=[...entities().map(e=>({...e,x:e.at[0],y:e.at[1]})),{...player,sprite:'avatar',id:'player'}].sort((a,b)=>a.y-b.y);
  for(const a of actors){const im=images[a.sprite];ctx.fillStyle='#1c302b55';ctx.beginPath();ctx.ellipse(a.x*sx,a.y*sy+8,12,5,0,0,7);ctx.fill();if(im?.complete&&im.naturalWidth)ctx.drawImage(im,a.id==='player'&&moving?Math.floor(walk)%3*16:0,a.id==='player'?facing*16:0,16,16,a.x*sx-16,a.y*sy-25,32,32);if(!im){ctx.fillStyle='#e6ce8d';ctx.font='bold 24px monospace';ctx.textAlign='center';ctx.fillText('?',a.x*sx,a.y*sy);}if(a.name){ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillStyle='#13291f';ctx.fillRect(a.x*sx-64,a.y*sy-42,128,15);ctx.fillStyle='#f4e6bf';ctx.fillText(a.name,a.x*sx,a.y*sy-31);}}
  const exit=scene.exits.find(e=>{const [x,y,w,h]=e.rect;return player.x>=x&&player.x<x+w&&player.y>=y&&player.y<y+h;});
  if(!exit)exitLatch=null;
  if(exit&&exitLatch!==exit.direction&&!busy&&!pending){exitLatch=exit.direction;const action=snapshot.actions.find(a=>a.id==='mover'&&a.target===exit.direction);if(!action||action.disabled)notice(action?.reason||'Esta salida no está disponible ahora.');else void perform(action);}
 }else{ctx.fillStyle='#263d30';ctx.fillRect(0,0,640,480);}

}
async function refresh(){if(busy||pending||refreshing||document.hidden)return;refreshing=true;try{await apply(await api('/api/state'));}catch(e){notice(e.message);}finally{refreshing=false;render();}}
async function poll(){await refresh();setTimeout(poll,snapshot?.character?.combat?700:4000);}
void poll();
setInterval(()=>{if(!document.hidden)draw(performance.now());},33);
