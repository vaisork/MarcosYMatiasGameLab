'use strict';
const $=id=>document.getElementById(id), canvas=$('world'), ctx=canvas.getContext('2d');
const opposite={norte:'sur',sur:'norte',este:'oeste',oeste:'este'};
const gates={norte:[9,0,2,1],sur:[9,14,2,1],oeste:[0,6,1,3],este:[19,6,1,3],salir:[9,0,2,1],hogar:[4,0,2,1]};
const keys=new Set(), images={};
for(const name of ['avatar','lina','espinajo']){images[name]=new Image();images[name].src=`/client-rpg/sprites/${name}.png`;}
let snapshot=null, scene=null, busy=false, pending=null, focus=null, entrance=null, exitLatch=null, lastTime=0, walk=0, facing=0;
const player={x:10,y:7};
const requestId=()=>globalThis.crypto?.randomUUID?.()||`rpg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const notice=text=>{$('notice').textContent=text;};
function node(tag,text){const n=document.createElement(tag);n.textContent=text;return n;}
async function api(path,body){
 const response=await fetch(path,{credentials:'same-origin',headers:{Accept:'application/json',...(body?{'Content-Type':'application/json','X-CSRF-Token':snapshot?.csrf_token||''}:{})},...(body?{method:'POST',body:JSON.stringify(body)}:{})});
 let data;try{data=await response.json();}catch{throw Error('Respuesta ilegible. Reconecta antes de decidir.');}
 if(data.csrf_token&&snapshot)snapshot.csrf_token=data.csrf_token;
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
 snapshot=next;
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
 const ids=new Set(snapshot.actions.filter(a=>['examinar_criatura','combatir','acercarse','retirarse'].includes(a.id)).map(a=>a.target));
 if(snapshot.character.combat)ids.add(snapshot.character.combat.creature);
 return [...npcs,...[...ids].map((id,i)=>({id,name:snapshot.character.combat?.creature===id?snapshot.character.combat.name:id.replaceAll('_',' '),at:scene.creatures.find(p=>p.id===id)?.at||[14-i*2,5],sprite:'espinajo'}))];
}
function actionButton(action){
 const b=node('button',action.label||action.id);b.type='button';b.disabled=busy||Boolean(pending)||Boolean(action.disabled);b.title=action.reason||action.description||'';
 b.addEventListener('click',()=>perform(action));
 if(action.disabled&&action.reason){const wrap=node('div','');wrap.append(b,node('small',action.reason));return wrap;}return b;
}
function render(){
 if(!snapshot?.room||!scene)return;
 const c=snapshot.character,combat=c.combat;
 if(focus&&!entities().some(e=>e.id===focus))focus=null;
 $('place').textContent=snapshot.room.name;$('identity').textContent=`${c.name} · Vida ${c.hp} / ${c.hp_max}`;$('description').textContent=snapshot.room.description;
 $('contexts').replaceChildren(...entities().map(e=>{const b=node('button',e.name);b.onclick=()=>{focus=e.id;render();};return b;}),Object.assign(node('button','Lugar / todas las acciones'),{onclick:()=>{focus=null;render();}}));
 $('action-title').textContent=focus?`Interacción · ${entities().find(e=>e.id===focus)?.name||focus}`:'Decisiones';
 const actions=snapshot.actions.filter(a=>combat||!focus||a.target===focus||['mirar','observar'].includes(a.id));
 $('actions').replaceChildren(...actions.map(actionButton));
 if(pending){const b=node('button','Reintentar la misma decisión');b.onclick=()=>send(pending);$('actions').prepend(b);}
 $('combat').hidden=!combat;
 if(combat){const prep=combat.prepared_action;$('combat').replaceChildren(node('h2',combat.name),node('p',`Vida rival ${combat.hp} / ${combat.hp_max} · Ronda ${combat.round}`),node('p',`Preparación: ${typeof prep==='string'?prep:prep?.tell||prep?.name||'ninguna'}`));}
 const text=(snapshot.narrative||[]).map(e=>typeof e==='string'?e:e.text).filter(Boolean);
 if($('narrative').dataset.text!==JSON.stringify(text)){$('narrative').replaceChildren(...text.map(t=>node('p',t)));$('narrative').dataset.text=JSON.stringify(text);}
}
async function perform(action){
 if(busy||pending)return;
 const offered=snapshot.actions.find(a=>a.id===action.id&&a.target===action.target&&a.topic===action.topic);
 if(!offered||offered.disabled){notice(offered?.reason||'Esta acción no está disponible ahora.');return;}
 const payload={id:offered.id,request_id:requestId()};
 for(const key of ['target','topic','confirmed'])if(offered[key]!==undefined)payload[key]=offered[key];
 if(offered.confirmation){if(!window.confirm(offered.confirmation))return;payload.confirmed=true;}
 await send(payload);
}
async function send(payload){
 if(busy)return;busy=true;render();notice('Consultando el mundo…');
 const before=snapshot.room?.id;
 try{const next=await api('/api/action',payload);pending=null;if(next.room?.id!==before&&payload.id==='mover')entrance=opposite[payload.target];await apply(next);notice('');}
 catch(error){if(!error.status)pending=payload;notice(error.message+(pending?' Reintenta la misma decisión para evitar duplicados.':''));}
 finally{busy=false;render();}
}
function interact(){const near=entities().sort((a,b)=>Math.hypot(a.at[0]-player.x,a.at[1]-player.y)-Math.hypot(b.at[0]-player.x,b.at[1]-player.y))[0];focus=near&&Math.hypot(near.at[0]-player.x,near.at[1]-player.y)<3?near.id:null;render();$('action-title').scrollIntoView({block:'nearest'});}
$('interact').onclick=interact;
const bindings={ArrowUp:[0,-1,1],w:[0,-1,1],ArrowDown:[0,1,0],s:[0,1,0],ArrowLeft:[-1,0,2],a:[-1,0,2],ArrowRight:[1,0,3],d:[1,0,3]};
window.addEventListener('keydown',e=>{if(e.target.closest?.('input,textarea,select'))return;if(e.key===' '&&e.target.closest?.('button,a'))return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(bindings[key]||key===' '||key==='e'){e.preventDefault();if(bindings[key])keys.add(key);else if(!e.repeat)interact();}});
window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys.delete(b.dataset.key));}
function blocked(x,y){return [x-.22,x+.22].some(px=>[y-.18,y+.18].some(py=>px<0||py<0||px>=scene.size[0]||py>=scene.size[1]||!['.','0',' '].includes(scene.layers.solid[Math.floor(py)]?.[Math.floor(px)]||'1')));}
function draw(time){
 const dt=Math.min((time-lastTime)/1000,.04);lastTime=time;ctx.imageSmoothingEnabled=false;
 if(scene){
  const [width,height]=scene.size,sx=canvas.width/width,sy=canvas.height/height;
  const colors={g:'#72874c',p:'#b4a076',c:'#63763c',s:'#8b7047',w:'#467d82',b:'#bab18c',f:'#46593c'};
  scene.layers.ground.forEach((row,y)=>[...row].forEach((tile,x)=>{ctx.fillStyle=colors[tile]||colors.g;ctx.fillRect(x*sx,y*sy,sx+1,sy+1);ctx.fillStyle=tile==='w'?'#72a8a1':tile==='c'?'#b4af68':tile==='f'?'#9e8d62':'#ffffff10';if(tile==='s')ctx.fillRect(x*sx+3,y*sy+2,3,sy-4);else{ctx.fillRect(x*sx+4,y*sy+8,sx-9,3);if(tile==='c')ctx.fillRect(x*sx+13,y*sy+3,4,18);}}));
  for(const e of scene.exits){const [x,y,w,h]=e.rect;ctx.fillStyle='#e6ce8d';ctx.fillRect(x*sx,y*sy,w*sx,h*sy);ctx.fillStyle='#293a2b';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText(e.direction,(x+w/2)*sx,Math.max(12,(y+h/2)*sy));}
  const key=[...keys].find(k=>bindings[k]);let moving=false;
  if(key&&!busy&&!pending){const [dx,dy,dir]=bindings[key];facing=dir;const x=player.x+dx*dt*4,y=player.y+dy*dt*4;if(!blocked(x,y)){player.x=x;player.y=y;moving=true;walk+=dt*9;}}
  const actors=[...entities().map(e=>({...e,x:e.at[0],y:e.at[1]})),{...player,sprite:'avatar',id:'player'}].sort((a,b)=>a.y-b.y);
  for(const a of actors){const im=images[a.sprite];ctx.fillStyle='#1c302b55';ctx.beginPath();ctx.ellipse(a.x*sx,a.y*sy+8,12,5,0,0,7);ctx.fill();if(im.complete&&im.naturalWidth)ctx.drawImage(im,a.id==='player'&&moving?Math.floor(walk)%3*16:0,a.id==='player'?facing*16:0,16,16,a.x*sx-16,a.y*sy-25,32,32);if(a.name){ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillStyle='#13291f';ctx.fillRect(a.x*sx-64,a.y*sy-42,128,15);ctx.fillStyle='#f4e6bf';ctx.fillText(a.name,a.x*sx,a.y*sy-31);}}
  const exit=scene.exits.find(e=>{const [x,y,w,h]=e.rect;return player.x>=x&&player.x<x+w&&player.y>=y&&player.y<y+h;});
  if(!exit)exitLatch=null;
  if(exit&&exitLatch!==exit.direction&&!busy&&!pending){exitLatch=exit.direction;const action=snapshot.actions.find(a=>a.id==='mover'&&a.target===exit.direction);if(!action||action.disabled)notice(action?.reason||'Esta salida no está disponible ahora.');else void perform(action);}
 }else{ctx.fillStyle='#263d30';ctx.fillRect(0,0,640,480);}

}
async function refresh(){if(busy||pending||document.hidden)return;busy=true;try{await apply(await api('/api/state'));}catch(e){notice(e.message);}finally{busy=false;render();}}
async function poll(){await refresh();setTimeout(poll,snapshot?.character?.combat?3000:5000);}
void poll();
setInterval(()=>{if(!document.hidden)draw(performance.now());},33);
