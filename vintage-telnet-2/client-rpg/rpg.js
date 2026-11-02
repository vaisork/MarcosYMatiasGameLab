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
const ICONS={
 crest:'<svg class="svg-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6Z" fill="currentColor"/></svg>',
 swords:'<svg class="svg-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2 1l3 3-1 1-3-3v-1h1zm8 2l2-2 3 3-2 2-1-1-3 3-1-1 3-3-1-1zm-6 6l-3 3v2h2l3-3-1-1-1 1-1-1 1-1zm5-2l1 1-6 6-1-1 6-6zm4-1l1 1-2 2-1-1 2-2z" fill="currentColor"/></svg>',
 book:'<svg class="svg-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2 3v10c2-1 4-1 6 0 2-1 4-1 6 0V3c-2-1-4-1-6 0-2-1-4-1-6 0zm7 8.5c-1.5-.7-3-.7-5 0V4.5c2-.7 3.5-.7 5 0v7z" fill="currentColor"/></svg>',
 person:'<svg class="svg-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 2a3 3 0 100 6 3 3 0 000-6zm-5 11c0-2.5 2.2-4 5-4s5 1.5 5 4v1H3v-1z" fill="currentColor"/></svg>',
 fauna:'<svg class="svg-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 3l2 3-1 2 2-1 2 3 2-3 2 1-1-2 2-3-3 1-3-2-3 2z M5 11l3 4 3-4-1-2-2 1-2-1z" fill="currentColor"/></svg>',
 pack:'<svg class="svg-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M5 2h6v2H5V2zm-2 3h10v9a1 1 0 01-1 1H4a1 1 0 01-1-1V5zm2 3v2h6V8H5z" fill="currentColor"/></svg>',
 place:'<svg class="svg-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 1a4.5 4.5 0 00-4.5 4.5c0 3.5 4.5 9.5 4.5 9.5s4.5-6 4.5-9.5A4.5 4.5 0 008 1zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor"/></svg>',
 shield:'<svg class="svg-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 1L2 3.5v5c0 4 3 6.5 6 7.5 3-1 6-3.5 6-7.5v-5L8 1z" fill="currentColor"/></svg>',
 flask:'<svg class="svg-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6 1h4v2H9v3l4 7a1 1 0 01-.8 1.5H3.8A1 1 0 013 13l4-7V3H6V1zm1 7l-2.5 4.5h7L9 8H7z" fill="currentColor"/></svg>',
 scroll:'<svg class="svg-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 011-1.7V10a1 1 0 002 0V2zm2 3v1h5V5H5zm0 3v1h5V8H5z" fill="currentColor"/></svg>',
 menu:'<svg class="svg-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h12v2H2v-2z" fill="currentColor"/></svg>',
 spark:'<svg class="svg-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 1l1.8 4.7L14.5 8l-4.7 2.3L8 15l-1.8-4.7L1.5 8l4.7-2.3z" fill="currentColor"/></svg>',
 arrow:'<svg class="svg-icon" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M5 2l6 6-6 6-1.5-1.5L8 8 3.5 3.5z" fill="currentColor"/></svg>',
 compass:'<svg class="svg-icon" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M8 1l4 7-4-2-4 2 4-7zm0 14l-4-7 4 2 4-2-4 7z" fill="currentColor"/></svg>',
 expand:'<svg class="svg-icon" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M2 2h5v2H4v3H2V2zm9 0h5v5h-2V4h-3V2zM2 14v-5h2v3h3v2H2zm12 0h-5v-2h3v-3h2v5z" fill="currentColor"/></svg>',
 collapse:'<svg class="svg-icon" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M7 7H2V5h3V2h2v5zm2 0V2h2v3h3v2H9zm0 2h5v2h-3v3H9V9zM7 9v5H5v-3H2V9h5z" fill="currentColor"/></svg>'
};
function svgNode(name){
 const span=document.createElement('span');
 span.className=`svg-icon-wrap icon-${name}`;
 if(span.setAttribute)span.setAttribute('aria-hidden','true');
 span.innerHTML=ICONS[name]||'';
 return span;
}

const keys=new Set(), images={};
const npcSprites={edran_bren:'bren',edran_daro:'daro',edran_iria:'iria',edran_elva:'elva',edran_sena:'sena',edran_nela:'nela',edran_oren:'oren',edran_aren:'aren',korven_ved:'ved',korven_beran:'beran',korven_ruma:'ruma',korven_neru:'neru',korven_oma:'oma',korven_taren:'taren',hoshai_yesa:'yesa',hoshai_iria:'hoshai_iria',lethra_nima:'nima',lethra_sola:'sola',lethra_mira:'mira',lethra_ume:'ume',lethra_nera_mercado:'nera',nhal_varo:'varo',nhal_leris:'leris',nhal_sira:'sira',veyra_bela:'veyra_bela',veyra_nera:'veyra_nera',veyra_seli:'veyra_seli',nhal_desi:'desi',nhal_elin:'elin',veyra_arel:'veyra_arel',veyra_doma:'veyra_doma',veyra_tov:'veyra_tov'};
const npcSpriteNames=new Set(Object.values(npcSprites));
const creatureSprites={cienfango:'cienfango',espinajo_rastrojo:'espinajo',mordelinde:'mordelinde',cornalomo:'cornalomo',salteador_veterano:'salteador',salteador_desesperado:'salteador',forajido_camino:'forajido',salteadora_negociante:'negociante',salteador_bravucon:'bravucon',cascapedernal:'cascapedernal',rasgacumbres:'rasgacumbres',saltacresta:'saltacresta',unapiedra:'unapiedra',colagrieta:'colagrieta',quebrarrocas:'quebrarrocas',dragon_aguas_antiguas:'dragon_aguas_antiguas',cortacorriente:'cortacorriente',dorsalodo:'dorsalodo',pinzajunco:'pinzajunco',saltalodo:'saltalodo',tragacharco:'tragacharco',faucecieno:'faucecieno',sombranutria:'sombranutria',mordijunco:'mordijunco',aguaculebra:'aguaculebra',raizacapa:'raizacapa',mordesombra:'mordesombra',quebracascara:'quebracascara',escarbaraiz:'escarbaraiz',rondamusgo:'rondamusgo',rasgacorteza:'rasgacorteza',clavaespina:'clavaespina',garfarrama:'garfarrama',roecorteza:'roecorteza',hilaria_niebla:'hilaria_niebla',tronchacolmillo:'tronchacolmillo',velomembrana:'velomembrana',tallagrietas:'tallagrietas',cuarzarana:'cuarzarana',vetasierpe:'vetasierpe',rodacanto:'rodacanto',espinacuarzo:'espinacuarzo',tejecristal:'tejecristal',callaecos:'callaecos',brasaluz:'brasaluz',quebrarrocas_canoso:'quebrarrocas_canoso',sierpe_veta_madre:'sierpe_veta_madre'};
for(const name of ['avatar','avatar-battle','lina',...Object.values(npcSprites),...Object.values(creatureSprites).flatMap(name=>[name,`${name}-battle`])]){
 images[name]=new Image();
 images[name].src=`/client-rpg/sprites/${name}.png`;
}
function mapSpriteScale(sprite){return sprite==='cornalomo'||sprite==='quebrarrocas'?1.6:1;}
const backgrounds={};
function backgroundImage(path){
 if(!path||!/^backgrounds\/[a-z0-9_]+(?:-front)?\.webp$/.test(path))return null;
 if(!backgrounds[path]){const img=new Image();img.src=`/client-rpg/${path}`;backgrounds[path]=img;}
 const img=backgrounds[path];return img.complete&&img.naturalWidth?img:null;
}
function sceneBackgroundImage(sc=scene){
 sc=sc||scene;
 if(!sc)return null;
 if(sc.background_actions&&typeof sc.background_actions==='object'&&Array.isArray(snapshot?.actions)){
  for(const [id,path] of Object.entries(sc.background_actions)){
   if(snapshot.actions.some(a=>a?.id===id)){
    const img=backgroundImage(path);
    return img||backgroundImage(sc.background);
   }
  }
 }
 return backgroundImage(sc.background);
}
function battleBackgroundImage(sc=scene){
 sc=sc||scene;
 if(sc&&'battle_background' in sc){
  return typeof sc.battle_background==='string'?backgroundImage(sc.battle_background):null;
 }
 const regionalBattleBackgrounds={edran:'edran',korven:'korven',veyra:'veyra',hoshai:'hoshai',lethra:'lethra',nhal:'nhal'};
 const region=regionalBattleBackgrounds[snapshot?.room?.region]||'edran';
 return backgroundImage(`backgrounds/${region}_battle.webp`);
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

let snapshot=null, scene=null, busy=false, pending=null, focus=null, menuGroup=null, entrance=null, exitLatch=null, lastTime=0, walk=0, facing=0;
let authTab='login', entryView='welcome', viewMode='welcome', latestCsrfToken=null, savedUsername='';
const player={x:10,y:7};
let battleEnteredAt=0;
let selectedRound=null, battleGroup=null, battleStart=null, lastCombat=null, outcome=null, animation=null;
let lines=[], lineIndex=0, letters=0, letterTime=0, narrativeKey='', refreshing=false, serverOffset=0;
let dialogueExpanded=false;
let mutationVersion=0, applyVersion=0, pollTimer=null, polling=false, pollAgain=false;
const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
// Sonido (sonido.js): opcional; el cliente funciona igual sin él.
const sonido=(nombre,retraso=0)=>globalThis.VaisgardSonido?.fx(nombre,retraso);
let lastAction=null, stepMark=0;
const battleLocked=()=>busy||Boolean(pending)||selectedRound===snapshot?.character?.combat?.round;

function resizeCanvas(){
 if(!canvas||typeof window==='undefined')return;
 const rect=canvas.getBoundingClientRect?canvas.getBoundingClientRect():null;
 const displayW=rect&&rect.width>0?Math.round(rect.width):(window.innerWidth||640);
 const displayH=rect&&rect.height>0?Math.round(rect.height):(window.innerHeight||480);
 const dpr=Math.min(window.devicePixelRatio||1,2);
 const targetW=Math.round(displayW*dpr);
 const targetH=Math.round(displayH*dpr);
 if(canvas.width!==targetW||canvas.height!==targetH){
  canvas.width=targetW;
  canvas.height=targetH;
  if(scene&&viewMode==='game'&&!snapshot?.character?.combat&&!outcome){
   const current={...scene,spawn:{default:[player.x,player.y]}};
   [player.x,player.y]=visibleSpawn(current,null,targetW,targetH);
  }
 }
}
if(typeof window!=='undefined'&&window.addEventListener){
 window.addEventListener('resize',resizeCanvas);
}

let dialogueFolded=false;
function panel(open){if(open&&$('panel').hidden)sonido('menu');$('panel').hidden=!open;keys.clear();}
function back(){
 if(worldMapOpen){closeWorldMap();return;}
 if(dialogueFolded){toggleDialogueFold();return;}
 if(dialogueExpanded){toggleDialogueFold();return;}
 if(battleGroup){sonido('cancelar');battleGroup=null;renderBattleMenu();}
 else if(viewMode==='creation'&&snapshot?.characters?.length){sonido('cancelar');viewMode='characters';render();}
 else if(viewMode==='characters'){sonido('cancelar');viewMode='welcome';render();}
 else if(!$('panel').hidden&&menuGroup){sonido('cancelar');menuGroup=null;focus=null;render();}
 else{if(!$('panel').hidden)sonido('cancelar');panel($('panel').hidden);render();}
}
function advance(){
 const line=lines[lineIndex]||'';
 if(letters<line.length){letters=line.length;}
 else if(lineIndex<lines.length-1){lineIndex++;letters=0;}
 else if(!snapshot?.character?.combat&&!outcome)interact();
 paintLine();
}
function updateDialogueState(){
 const dlg=$('dialogue'), full=$('dialogue-full'), adv=$('advance'), btn=$('toggle-dialogue'), preview=$('dialogue-folded-line');
 if(dlg){
  dlg.classList.toggle('dialogue-folded',dialogueFolded);
  dlg.classList.toggle('dialogue-expanded',dialogueExpanded);
 }
 if(adv)adv.hidden=dialogueFolded||dialogueExpanded;
 if(full)full.hidden=!dialogueExpanded;
 if(preview){
  preview.hidden=!dialogueFolded;
  if(dialogueFolded){
   const currentLine=lines[lineIndex]||snapshot?.room?.description||'El camino se abre ante ti.';
   preview.textContent=currentLine;
   preview.title=currentLine;
  }
 }
 if(btn){
  if(btn.setAttribute)btn.setAttribute('aria-label',dialogueFolded?'Desplegar relato':'Plegar relato a una línea');
  btn.title=dialogueFolded?'Desplegar relato':'Plegar relato a una línea';
  btn.replaceChildren(svgNode(dialogueFolded?'expand':'collapse'));
 }
 if(dialogueExpanded){
  const fullText=$('dialogue-full-text');
  if(fullText){
   const allItems=[...new Set([snapshot?.room?.description,...lines,...(snapshot?.narrative||[]).map(e=>typeof e==='string'?e:e.text)])].filter(Boolean);
   fullText.replaceChildren(...allItems.map(t=>node('p',t)));
  }
 }
}
function toggleDialogueFold(){
 if(dialogueExpanded){dialogueExpanded=false;dialogueFolded=true;}
 else{dialogueFolded=!dialogueFolded;}
 updateDialogueState();
}
function toggleDialogueExpand(){
 toggleDialogueFold();
}
// Parte el relato en páginas de ~160 letras (lo que cabe en el cuadro) cortando al final de una oración; si una oración sola no cabe, corta entre palabras.
function pages(text,max=160){
 const out=[];let cur='';
 for(const sentence of text.match(/[^.!?…]+[.!?…]+[»"”)]*\s*|[^.!?…]+$/g)||[text]){
  const parts=sentence.length>max?sentence.match(new RegExp(`.{1,${max}}(?:\\s|$)|\\S+`,'g')):[sentence];
  for(const part of parts){if(cur&&(cur+part).trim().length>max){out.push(cur.trim());cur='';}cur+=part;}
 }
 if(cur.trim())out.push(cur.trim());
 return out.length?out:[text];
}
function paintLine(){
 const line=lines[lineIndex]||snapshot?.room?.description||'El camino se abre ante ti.';
 $('line').textContent=line.slice(0,letters);
 $('more').textContent=letters<line.length?'A · mostrar texto':lineIndex<lines.length-1?`A · siguiente (${lines.length-lineIndex-1})`:snapshot?.character?.combat?'Elige una acción · A':'A · continuar';
 const preview=$('dialogue-folded-line');
 if(preview&&dialogueFolded)preview.textContent=line;
 if(dialogueExpanded){
  const fullText=$('dialogue-full-text');
  if(fullText){
   const allItems=[...new Set([snapshot?.room?.description,...lines,...(snapshot?.narrative||[]).map(e=>typeof e==='string'?e:e.text)])].filter(Boolean);
   fullText.replaceChildren(...allItems.map(t=>node('p',t)));
  }
 }
}
function updatePresentation(previous,next){
 const sameCharacter=Boolean(next.character&&next.character.id===previous?.character?.id);
 if(!next.character||next.character.id!==previous?.character?.id){selectedRound=null;lastCombat=null;outcome=null;animation=null;lines=[];narrativeKey='';document.body.classList.remove('battling');}
 if(!next.character)return;
 const old=previous?.character?.combat, combat=next.character?.combat;
 if(combat&&!old){sonido('batalla');battleEnteredAt=performance.now();battleStart=previous||next;outcome=null;selectedRound=null;battleGroup=null;panel(false);}
 if(combat){
  if(old&&combat.round!==old.round){selectedRound=null;battleGroup=null;animation={at:performance.now(),enemy:old.hp-combat.hp,player:previous.character.hp-next.character.hp,oldEnemy:old.hp,oldPlayer:previous.character.hp};
   // Golpe/crítico/fallo se deducen de las variaciones reales de PV de la ronda (el servidor no marca críticos).
   if(animation.enemy>0)sonido(animation.enemy>=combat.hp_max*.25?'critico':'golpe');
   else if(lastAction&&!['defender','usar','huir'].includes(lastAction.id))sonido('fallo');
   if(animation.player>0)sonido('herido',260);else if(animation.player<0)sonido('curar',260);
   lastAction=null;
  }
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
  sonido(defeated?'derrota':fled?'huir':outcome.title==='Victoria'?'victoria':'confirmar');
 }
 if(sameCharacter&&next.character.level>(previous.character.level||next.character.level))sonido('nivel',old&&!combat?1700:0);
 else if(sameCharacter&&!combat&&!old&&next.character.hp>previous.character.hp&&lastAction&&performance.now()-lastAction.at<5000)sonido('curar');
 const text=(next.narrative||[]).map(e=>typeof e==='string'?e:e.text).filter(Boolean), key=JSON.stringify(text);
 if(key!==narrativeKey){
  const oldText=JSON.parse(narrativeKey||'[]');let common=0;while(common<text.length&&common<oldText.length&&text[common]===oldText[common])common++;
  const incoming=text.slice(common);
  const unread=old&&combat&&lines.length&&lineIndex<lines.length-1?lines.slice(lineIndex):[];
  lines=[...unread,...incoming.flatMap(pages)];lineIndex=0;letters=reduced?(lines[0]?.length||0):0;narrativeKey=key;
 }
 paintLine();
}

function renderBattleMenu(){
 const combat=snapshot?.character?.combat, root=$('battle-menu');
 root.hidden=!combat;root.replaceChildren();if(!combat)return;
 const offered=snapshot.actions||[], locked=battleLocked();
 const specializationActions=offered.filter(a=>['invocar_eco','velo_espectral','inspirar_valentia'].includes(a.id));
 const specialization=snapshot.character?.especializacion;
 const specializationName=specialization?.name||({'arcano_ecos':'Arcano de los Ecos','juramentado_heroico':'Juramentado Heroico'}[specialization?.id])||'Especialización';
 const groups=[
  ['Atacar',offered.filter(a=>a.id==='atacar'),'action-attack','swords'],
  ['Capacidad',offered.filter(a=>!['atacar','huir','defender','usar','invocar_eco','velo_espectral','inspirar_valentia'].includes(a.id)),'action-skill','spark'],
  ...(specializationActions.length?[[specializationName,specializationActions,'action-skill','spark']]:[]),
  ['Objeto',offered.filter(a=>a.id==='usar'),'action-item','flask'],
  ['Defender',offered.filter(a=>a.id==='defender'),'action-defend','shield']
 ];
 if(battleGroup){
  const choices=groups.find(g=>g[0]===battleGroup)?.[1]||[];
  for(const a of choices){
   const b=actionButton(a);
   root.append(b);
  }
  const b=node('button','Volver · B');b.onclick=()=>{battleGroup=null;renderBattleMenu();};root.append(b);
 }else{
  for(const [label,choices,cls,iconName] of groups){
   const b=node('button','');
   b.className=cls;
   const ic=svgNode(iconName);
   ic.classList.add('battle-btn-icon');
   const txt=node('span',label);
   b.append(ic,txt);
   b.disabled=locked||!choices.some(a=>!a.disabled);
   b.title=choices.length?choices.map(a=>a.reason||a.description||a.label).join(' · '):'No disponible en este encuentro';
   b.onclick=()=>{if(label==='Atacar'&&choices.length===1)void perform(choices[0]);else{battleGroup=label;renderBattleMenu();}};
   root.append(b);
  }
  for(const a of offered.filter(a=>a.id==='huir')){
   const b=actionButton(a);
   b.classList.add('flee');
   root.append(b);
  }
 }
 if(pending){const b=node('button','Reintentar decisión');b.onclick=()=>send(pending);root.append(b);}
}

function bar(x,y,w,value,max,color){
 ctx.fillStyle='#0e1724';ctx.fillRect(x,y,w,10);
 ctx.fillStyle=color;ctx.fillRect(x+2,y+2,Math.max(0,Math.min(1,value/max))*(w-4),6);
}

function drawCover(ctx,img,cw,ch){
 const imgRatio=(img.naturalWidth||1)/(img.naturalHeight||1);
 const canvasRatio=cw/ch;
 let dw,dh,dx,dy;
 if(canvasRatio>imgRatio){
  dw=cw;dh=cw/imgRatio;dx=0;dy=(ch-dh)/2;
 }else{
  dh=ch;dw=ch*imgRatio;dx=(cw-dw)/2;dy=0;
 }
 ctx.drawImage(img,dx,dy,dw,dh);
}

function getBattleLayout(cw,ch){
 const isPortrait=ch>=cw;
 const scale=Math.min(cw/(isPortrait?390:1366),ch/(isPortrait?844:768));
 const enemySize=Math.round(Math.min(cw*(isPortrait?.52:.32),ch*(isPortrait?.25:.52),(isPortrait?220:400)*scale));
 const heroSize=Math.round(Math.min(cw*(isPortrait?.60:.32),ch*(isPortrait?.30:.50),(isPortrait?240:300)*scale));
 return {isPortrait,scale,
  enemy:{x:Math.round(isPortrait?cw*.50-enemySize*.35:cw*.60),y:Math.round(ch*(isPortrait?.245:.22)),w:enemySize,h:enemySize},
  avatar:{x:Math.round(cw*(isPortrait?.05:.14)),y:Math.round(ch*(isPortrait?.40:.36)),w:heroSize,h:heroSize}
 };
}

function battleDraw(time){
 const c=snapshot.character,b=c.combat||lastCombat;if(!b)return;
 const elapsed=animation?(time-animation.at)/1000:9, blend=reduced?1:Math.min(1,elapsed/.8);
 const enemyHp=animation?animation.oldEnemy+(b.hp-animation.oldEnemy)*blend:b.hp;
 const shake=!reduced&&elapsed<.6?Math.sin(elapsed*65)*5*(1-elapsed/.6):0;
 const lunge=!reduced&&elapsed<.35?Math.sin(elapsed/.35*Math.PI)*24:0;

 const layout=getBattleLayout(canvas.width,canvas.height);

 const backdrop=battleBackgroundImage();
 if(backdrop)drawCover(ctx,backdrop,canvas.width,canvas.height);
 else{
  ctx.fillStyle='#0f1c2d';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#182d46';ctx.fillRect(0,Math.round(canvas.height*0.35),canvas.width,Math.round(canvas.height*0.65));
 }

 const enemy=images[`${creatureSprites[b.creature]}-battle`]||null;
 const enemyX=Math.round(layout.enemy.x+shake);
 const enemyY=layout.enemy.y;
 const enemySize=layout.enemy.w;

 if(!(animation?.enemy>0&&elapsed<.8&&Math.floor(elapsed*14)%2)&&enemy?.complete&&enemy.naturalWidth){
  ctx.drawImage(enemy,enemyX,enemyY,enemySize,enemySize);
 }
 if(!enemy){ctx.fillStyle='#f5d888';ctx.font='bold 60px monospace';ctx.textAlign='center';ctx.fillText('?',enemyX+enemySize/2,enemyY+enemySize/2+20);}

 const avatarBattle=images['avatar-battle'];
 const hasBattleAvatar=avatarBattle?.complete&&avatarBattle.naturalWidth>0;
 const avatarImg=hasBattleAvatar?avatarBattle:images.avatar;
 const avatarX=Math.round(layout.avatar.x+lunge);
 const avatarY=layout.avatar.y;
 const avatarW=layout.avatar.w;
 const avatarH=layout.avatar.h;

 if(!(animation?.player>0&&elapsed<.8&&Math.floor(elapsed*14)%2)&&avatarImg?.complete&&avatarImg.naturalWidth){
  if(hasBattleAvatar){
   ctx.drawImage(avatarImg,0,0,avatarImg.naturalWidth,avatarImg.naturalHeight,avatarX,avatarY,avatarW,avatarH);
  }else{
   ctx.drawImage(avatarImg,64,96,64,96,avatarX,avatarY,avatarW,avatarH);
  }
 }

 const enemyHud=$('enemy-hud');
 if(enemyHud){
  enemyHud.hidden=false;
  $('enemy-name').textContent=b.name.replace(/ · nivel \d+$/, '');
  const known=(snapshot.bestiary||[]).find(e=>e.id===b.creature||e.creature===b.creature);
  const level=b.level||known?.level||b.name.match(/nivel (\d+)$/)?.[1];
  $('enemy-level').textContent=level?`Nv. ${level}`:'Nivel no revelado';
  $('enemy-health').max=b.hp_max;
  $('enemy-health').value=Math.max(0,enemyHp);
  $('enemy-health-text').textContent=`${Math.ceil(enemyHp)} / ${b.hp_max}`;
 }

 if(animation&&elapsed<1.3){
  ctx.font='bold 28px serif';ctx.textAlign='center';
  for(const [amount,x,y] of [[animation.enemy,enemyX+enemySize/2,enemyY+20],[animation.player,avatarX+avatarW/2,avatarY-10]])if(amount!==0){
   ctx.fillStyle='#060b13';ctx.fillText(`${amount>0?'−':'+'}${Math.abs(amount).toFixed(0)}`,x+2,y-elapsed*28+2);
   ctx.fillStyle=amount>0?'#f87171':'#6ee7b7';ctx.fillText(`${amount>0?'−':'+'}${Math.abs(amount).toFixed(0)}`,x,y-elapsed*28);
  }
 }
 if(!reduced&&time-battleEnteredAt<400){
  ctx.fillStyle=`rgba(6,11,19,${1-(time-battleEnteredAt)/400})`;ctx.fillRect(0,0,canvas.width,canvas.height);
 }
 const remaining=Math.max(0,b.next_round-(Date.now()/1000+serverOffset));
 $('turn').textContent=c.combat?`${selectedRound===b.round?'Esperando turno…':'Ronda '+b.round} · ${remaining.toFixed(1)} s`:'';
}

const requestId=()=>globalThis.crypto?.randomUUID?.()||`rpg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const notice=text=>{$('notice').textContent=text;};
function node(tag,text){const n=document.createElement(tag);if(text)n.textContent=text;return n;}
async function api(path,body){
 // A late state read must not undo a newer decision or session change.
 if(body){mutationVersion++;applyVersion++;}
 const version=mutationVersion;
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
 if(data?.csrf_token&&version===mutationVersion){latestCsrfToken=data.csrf_token;if(snapshot)snapshot.csrf_token=data.csrf_token;}
 if(response.headers?.get?.('Date'))serverOffset=new Date(response.headers.get('Date')).getTime()/1000-Date.now()/1000;
 if(!response.ok){const error=Error(data?.message||'No se pudo completar la acción.');error.status=response.status;throw error;}return data;
}
async function logout(){
 if(busy)return;
 busy=true;notice('Cerrando sesión…');
 try{
  await api('/api/account/logout',{});
  snapshot=null;scene=null;pending=null;lines=[];narrativeKey='';
  entryView='welcome';viewMode='welcome';
  notice('Sesión cerrada.');
  await refresh(true);
 }catch(e){notice(e.message);}
 finally{busy=false;render();}
}
function spawnPosition(map,arrival){
 const at=map.spawn[arrival]||map.spawn.default;
 return at.map(v=>Math.floor(v)+.5);
}
function visibleSpawn(map,arrival,cw,ch){
 const start=spawnPosition(map,arrival), queue=[start], seen=new Set([start.join(',')]);
 const portrait=ch>=cw, top=ch*(portrait?.24:.15), bottom=ch*(portrait?.25:.12);
 for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i], cam=getCamera(cw,ch,...map.size,x,y);
  const sx=x*cam.S-cam.camX, sy=y*cam.S-cam.camY;
  const halfWidth=20*cam.S/32, actorHeight=60*cam.S/32, foot=8*cam.S/32;
  const inExit=map.exits.some(e=>x>=e.rect[0]&&x<e.rect[0]+e.rect[2]&&y>=e.rect[1]&&y<e.rect[1]+e.rect[3]);
  if(!inExit&&sx-halfWidth>=4&&sx+halfWidth<=cw-4&&sy-actorHeight+foot>=top&&sy+foot<=ch-bottom)return [x,y];
  for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
   const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;
   if(nx<.5||ny<.5||nx>=map.size[0]||ny>=map.size[1]||seen.has(key))continue;
   if(!['.','0',' '].includes(map.layers.solid[Math.floor(ny)][Math.floor(nx)]))continue;
   seen.add(key);queue.push([nx,ny]);
  }
 }
 return start;
}
function generic(room){
 const exits=(room.exits||[]).map(e=>({direction:e.direction,rect:gates[e.direction]||[9,0,2,1]}));
 const ground=Array.from({length:15},(_,y)=>Array.from({length:20},(_,x)=>x===0||x===19||y===0||y===14?'f':'g'));
 for(const {rect:[x,y,w,h]} of exits)for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)ground[j][i]='p';
 return {size:[20,15],tile:16,tileset:'edran',layers:{ground:ground.map(r=>r.join('')),solid:ground.map(r=>r.map(c=>c==='f'?'1':'.').join(''))},spawn:{default:[10,7],norte:[10,1],sur:[10,13],este:[18,7],oeste:[1,7]},exits,npcs:[],creatures:[]};
}
async function apply(next,version=mutationVersion){
 if(version!==mutationVersion)return;
 const application=++applyVersion;
 const hadCombat=Boolean(snapshot?.character?.combat);
 // Action responses contain gameplay state but omit account/character lists.
 // Preserve only that server-provided session metadata, never gameplay fields.
 if(next.authenticated&&snapshot?.authenticated&&(!next.account||next.account.id===snapshot.account?.id)){
  if(!Object.hasOwn(next,'characters')&&snapshot.characters)next={...next,characters:snapshot.characters};
  if(!Object.hasOwn(next,'account')&&snapshot.account)next={...next,account:snapshot.account};
 }
 if(next?.csrf_token)latestCsrfToken=next.csrf_token;
 const changed=next.room?.id!==snapshot?.room?.id||next.character?.id!==snapshot?.character?.id;
 if(snapshot?.room&&next.room&&next.room.id!==snapshot.room.id&&next.character?.id===snapshot.character?.id&&!hadCombat)sonido('sala');
 updatePresentation(snapshot,next);snapshot=next;
 if(!next.authenticated){scene=null;viewMode='welcome';render();return;}
 if(!next.character||next.pending_approval||next.character.status!=='approved'||!next.room){
  scene=null;
  if(viewMode==='game'){viewMode=(!next.characters||next.characters.length===0)?'creation':'characters';}
  render();return;
 }
 if(next.character?.combat){
  viewMode='game';
 }
 if((changed||!scene)&&viewMode==='game'){
  focus=null;menuGroup=null;scene=null;
  let nextScene;
  try{const response=await fetch(`/client-rpg/scenes/${encodeURIComponent(next.room.id)}.json`);if(!response.ok)throw Error();nextScene=await response.json();}catch{nextScene=generic(next.room);}
  if(version!==mutationVersion||application!==applyVersion)return;
  scene=nextScene;
  void loadTileset(scene.tileset||'edran');
  const real=new Set(next.room.exits.map(e=>e.direction));scene.exits=scene.exits.filter(e=>real.has(e.direction));
  for(const direction of real)if(!scene.exits.some(e=>e.direction===direction))scene.exits.push({direction,rect:gates[direction]||[9,0,2,1]});
  resizeCanvas();
  [player.x,player.y]=visibleSpawn(scene,entrance,canvas.width,canvas.height);entrance=null;exitLatch=null;keys.clear();
 }
 render();
 if(hadCombat!==Boolean(next.character?.combat))schedulePoll(0);
}
function entities(){
 if(!scene||!snapshot?.room)return [];
 const npcs=snapshot.room.npcs.map((n,i)=>({...n,at:scene.npcs.find(p=>p.id===n.id)?.at||[4+i*2,5],sprite:npcSprites[n.id]||'lina'}));
 const ids=new Set(snapshot.actions.filter(a=>['combatir','acercarse','retirarse'].includes(a.id)||(a.id==='examinar_criatura'&&scene.creatures.some(e=>e.id===a.target))).map(a=>a.target));
 if(snapshot.character.combat)ids.add(snapshot.character.combat.creature);
 return [...npcs,...[...ids].map((id,i)=>({id,name:snapshot.character.combat?.creature===id?snapshot.character.combat.name:id.replaceAll('_',' '),at:scene.creatures.find(p=>p.id===id)?.at||[12-i*2,5],sprite:creatureSprites[id]||null}))];
}
function actionButton(action){
 const b=node('button',action.label||action.id);b.type='button';b.disabled=(snapshot?.character?.combat?battleLocked():busy||Boolean(pending))||Boolean(action.disabled);b.title=action.reason||action.description||'';
 if(snapshot?.character?.combat)b.className=action.id==='atacar'?'action-attack':action.id==='usar'?'action-item':action.id==='defender'?'action-defend':action.id==='huir'?'flee':'action-skill';
 b.addEventListener('click',()=>perform(action));
 const details=[];
 if(action.cooldown!==undefined){const remaining=Number(action.cooldown_remaining)||0;details.push(remaining?`Recarga: ${remaining} rondas restantes · ${action.cooldown} al usar`:`Recarga: ${action.cooldown} rondas`);}
 if(action.disabled&&action.reason&&!/^Recarga:/i.test(action.reason))details.push(action.reason);
 if(details.length){const wrap=node('div','');wrap.className='battle-action';wrap.append(b,...details.map(text=>node('small',text)));return wrap;}return b;
}

let entryKey='';
const entryState=()=>JSON.stringify([
 snapshot?.authenticated,
 entryView,
 authTab,
 viewMode,
 snapshot?.pending_approval,
 snapshot?.character?.id,
 snapshot?.character?.status,
 (snapshot?.characters||[]).map(c=>[c.id,c.status])
]);

function renderTitleHero(){
 const wrap=node('div','');wrap.className='title-hero';
 const crest=node('div','');crest.className='title-crest';
 crest.append(svgNode('crest'));
 const logo=node('h1','VAISGARD');logo.className='title-logo';
 const banner=node('div','');banner.className='title-rpg-banner';
 const rpgTxt=node('span','RPG');rpgTxt.className='title-rpg-text';
 banner.append(rpgTxt);
 const tagline=node('p','Tu aventura comienza aquí');tagline.className='title-tagline';
 wrap.append(crest,logo,banner,tagline);
 return wrap;
}

function renderEntry(){
 const root=$('entry');if(!root)return;entryKey=entryState();root.replaceChildren();
 root.append(renderTitleHero());
 const card=node('div','');card.className='entry-card-box';

 if(!snapshot?.authenticated){
  if(entryView==='welcome'){
   const h2=node('h2','Bienvenido a Vaisgard');
   const intro=node('p','Un reino ancestral donde cada decisión forja tu destino.');
   intro.className='muted';
   const actions=node('div','');actions.className='form-actions welcome-actions';

   const playBtn=node('button','');
   playBtn.type='button';
   playBtn.className='btn-royal btn-play';
   playBtn.dataset.busy='true';
   playBtn.disabled=busy;
   const pIcon=svgNode('swords');pIcon.className='btn-icon-wrap';
   const pText=node('span','Jugar');pText.className='btn-text-wrap';
   const pArrow=svgNode('arrow');pArrow.className='btn-arrow-wrap';
   playBtn.append(pIcon,pText,pArrow);
   playBtn.onclick=()=>{entryView='login';authTab='login';notice('');renderEntry();};

   const regBtn=node('button','');
   regBtn.type='button';
   regBtn.className='btn-royal btn-char';
   regBtn.dataset.busy='true';
   regBtn.disabled=busy;
   const rIcon=svgNode('spark');rIcon.className='btn-icon-wrap';
   const rText=node('span','Crear cuenta');rText.className='btn-text-wrap';
   const rArrow=svgNode('arrow');rArrow.className='btn-arrow-wrap';
   regBtn.append(rIcon,rText,rArrow);
   regBtn.onclick=()=>{entryView='register';authTab='register';notice('');renderEntry();};

   actions.append(playBtn,regBtn);
   card.append(h2,intro,actions);
   root.append(card);
   return;
  }

  const h2=node('h2',authTab==='login'?'Acceso a Vaisgard':'Crear tu Cuenta');
  const intro=node('p',authTab==='login'?'Introduce tus credenciales para continuar tu viaje.':'Elige un nombre de cuenta para adentrarte en el reino.');
  intro.className='muted';
  const tabs=node('div','');tabs.className='entry-tabs';
  const bLogin=node('button','Iniciar sesión');bLogin.type='button';if(authTab==='login')bLogin.className='active';
  bLogin.onclick=()=>{authTab='login';entryView='login';notice('');renderEntry();};
  const bReg=node('button','Registrarse');bReg.type='button';if(authTab==='register')bReg.className='active';
  bReg.onclick=()=>{authTab='register';entryView='register';notice('');renderEntry();};
  tabs.append(bLogin,bReg);

  const form=document.createElement('form');form.className='entry-form';
  const userLabel=node('label','');userLabel.className='field';userLabel.append(node('span','Nombre de cuenta'));
  const userInput=document.createElement('input');userInput.name='username';userInput.type='text';userInput.autocomplete='username';userInput.required=true;userInput.minLength=3;userInput.maxLength=40;userInput.value=savedUsername;
  userInput.oninput=()=>{savedUsername=userInput.value;};
  userLabel.append(userInput);

  const passLabel=node('label','');passLabel.className='field';passLabel.append(node('span',authTab==='login'?'Contraseña':'Contraseña (mínimo 8 caracteres)'));
  const passInput=document.createElement('input');passInput.name='password';passInput.type='password';passInput.autocomplete=authTab==='login'?'current-password':'new-password';passInput.required=true;if(authTab==='register')passInput.minLength=8;passInput.maxLength=200;passLabel.append(passInput);

  const actions=node('div','');actions.className='form-actions';
  const submitBtn=node('button','');
  submitBtn.type='submit';
  submitBtn.className='btn-royal btn-play';
  submitBtn.dataset.busy='true';
  submitBtn.disabled=busy;
  const sIcon=svgNode(authTab==='login'?'swords':'spark');sIcon.className='btn-icon-wrap';
  const sText=node('span',authTab==='login'?'Jugar':'Crear cuenta');sText.className='btn-text-wrap';
  const sArrow=svgNode('arrow');sArrow.className='btn-arrow-wrap';
  submitBtn.append(sIcon,sText,sArrow);

  const backBtn=node('button','');backBtn.type='button';backBtn.className='btn-royal btn-neutral';
  backBtn.append(node('span','Volver · Inicio'));
  backBtn.onclick=()=>{entryView='welcome';notice('');renderEntry();};

  actions.append(submitBtn,backBtn);

  form.append(userLabel,passLabel,actions);
  form.onsubmit=async e=>{
   e.preventDefault();if(busy)return;
   const username=userInput.value.trim(),password=passInput.value;savedUsername=username;busy=true;notice('Conectando…');
   try{const res=await api(`/api/account/${authTab}`,{username,password});notice('');await apply(res);}
   catch(err){notice(err.message);}
   finally{busy=false;render();}
  };
  card.append(h2,intro,tabs,form);
  root.append(card);
  return;
 }

 const chars=snapshot.characters||[];
 if(viewMode==='creation'||chars.length===0){
  const h2=node('h2','Crear Personaje');
  const intro=node('p','Elige el nombre, especie, clase y género para recorrer Vaisgard.');intro.className='muted';
  const form=document.createElement('form');form.className='entry-form';
  const nameLabel=node('label','');nameLabel.className='field';nameLabel.append(node('span','Nombre del personaje (2–50 caracteres)'));
  const nameInput=document.createElement('input');nameInput.name='name';nameInput.type='text';nameInput.required=true;nameInput.minLength=2;nameInput.maxLength=50;nameInput.placeholder='Nombre en Vaisgard';nameLabel.append(nameInput);
  const specGroup=node('div','');specGroup.className='choice-group';specGroup.append(node('label','Especie'));
  const specGrid=node('div','');specGrid.className='choice-grid';
  speciesInfo.forEach(([id,name,desc],idx)=>{
   const cLabel=node('label','');cLabel.className='choice-card';
   const rad=document.createElement('input');rad.type='radio';rad.name='species';rad.value=id;rad.checked=idx===0;
   const info=node('div','');info.append(node('strong',name),node('small',desc));
   cLabel.append(rad,info);specGrid.append(cLabel);
  });
  specGroup.append(specGrid);
  const classGroup=node('div','');classGroup.className='choice-group';classGroup.append(node('label','Clase'));
  const classGrid=node('div','');classGrid.className='choice-grid';
  classInfo.forEach(([id,name,desc],idx)=>{
   const cLabel=node('label','');cLabel.className='choice-card';
   const rad=document.createElement('input');rad.type='radio';rad.name='class_id';rad.value=id;rad.checked=idx===0;
   const info=node('div','');info.append(node('strong',name),node('small',desc));
   cLabel.append(rad,info);classGrid.append(cLabel);
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
  const submitBtn=node('button','');
  submitBtn.type='submit';
  submitBtn.className='btn-royal btn-continue';
  submitBtn.dataset.busy='true';
  submitBtn.disabled=busy;
  const sIcon=svgNode('spark');sIcon.className='btn-icon-wrap';
  const sText=node('span','Presentar Personaje');sText.className='btn-text-wrap';
  const sArrow=svgNode('arrow');sArrow.className='btn-arrow-wrap';
  submitBtn.append(sIcon,sText,sArrow);
  actions.append(submitBtn);

  const backBtn=node('button','');backBtn.type='button';backBtn.className='btn-royal btn-neutral';
  backBtn.append(node('span','Volver'));
  backBtn.onclick=()=>{viewMode=chars.length>0?'characters':'welcome';notice('');render();};
  actions.append(backBtn);

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
  card.append(h2,intro,form);root.append(card);return;
 }

 if(viewMode==='characters'){
  const h2=node('h2','Tus Personajes');
  const user=snapshot.account?.username||'';
  const intro=node('p',`Cuenta: ${user} · Elige con quién jugar o crea otro.`);intro.className='muted';
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
    const note=node('p','El director está revisando este personaje antes de comenzar.');note.className='pending-note';info.append(note);
   }
   tile.append(info);
   if(isApproved){
    const playBtn=node('button','');playBtn.type='button';playBtn.className='btn-royal btn-continue';playBtn.dataset.busy='true';playBtn.disabled=busy;
    const pIcon=svgNode('swords');pIcon.className='btn-icon-wrap';
    const pText=node('span','Entrar al Mundo');pText.className='btn-text-wrap';
    const pArrow=svgNode('arrow');pArrow.className='btn-arrow-wrap';
    playBtn.append(pIcon,pText,pArrow);
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
   const checkBtn=node('button','');checkBtn.type='button';checkBtn.className='btn-royal btn-neutral';checkBtn.dataset.busy='true';checkBtn.disabled=busy;
   checkBtn.append(node('span','Comprobar aprobación'));
   checkBtn.onclick=async()=>{
    if(busy)return;busy=true;notice('Comprobando aprobación…');
    try{
     await refresh(true);
     if(snapshot?.pending_approval||(snapshot?.characters||[]).some(c=>c.status!=='approved')){notice('El director aún está revisando tu personaje.');}
     else{notice('¡Personaje aprobado!');}
    }catch(err){notice(err.message);}
    finally{busy=false;render();}
   };
   actions.append(checkBtn);
  }
  const createBtn=node('button','');createBtn.type='button';createBtn.className='btn-royal btn-char';
  createBtn.append(node('span','+ Crear otro personaje'));
  createBtn.onclick=()=>{viewMode='creation';notice('');render();};actions.append(createBtn);

  const backWelcomeBtn=node('button','');backWelcomeBtn.type='button';backWelcomeBtn.className='btn-royal btn-neutral';
  backWelcomeBtn.append(node('span','Volver · Inicio'));
  backWelcomeBtn.onclick=()=>{viewMode='welcome';notice('');render();};actions.append(backWelcomeBtn);

  const logoutBtn=node('button','');logoutBtn.type='button';logoutBtn.className='btn-royal btn-neutral';
  logoutBtn.append(node('span','Cerrar sesión'));
  logoutBtn.onclick=logout;actions.append(logoutBtn);
  card.append(h2,intro,charList,actions);root.append(card);return;
 }

 const approvedChar=chars.find(c=>c.status==='approved')||chars[0];
 const user=snapshot.account?.username||'';
 const h2=node('h2',`Bienvenido, ${user||'Aventurero'}`);
 const intro=node('p','La senda aguarda tu regreso.');intro.className='muted';
 const actions=node('div','');actions.className='form-actions welcome-actions';

 if(approvedChar&&approvedChar.status==='approved'){
  const contBtn=node('button','');contBtn.type='button';contBtn.className='btn-royal btn-continue';contBtn.dataset.busy='true';contBtn.disabled=busy;
  const cIcon=svgNode('book');cIcon.className='btn-icon-wrap';
  const cText=node('span',`Continuar con ${approvedChar.name}`);cText.className='btn-text-wrap';
  const cArrow=svgNode('arrow');cArrow.className='btn-arrow-wrap';
  contBtn.append(cIcon,cText,cArrow);
  contBtn.onclick=async()=>{
   if(busy)return;busy=true;notice('Entrando al mundo…');
   try{
    if(snapshot.character?.id!==approvedChar.id)await api('/api/character/select',{character_id:Number(approvedChar.id)});
    viewMode='game';notice('');await refresh(true);
   }catch(err){notice(err.message);}
   finally{busy=false;render();}
  };
  actions.append(contBtn);
 }
 const charBtn=node('button','');charBtn.type='button';charBtn.className='btn-royal btn-char';
 const chIcon=svgNode('person');chIcon.className='btn-icon-wrap';
 const chText=node('span','Personajes');chText.className='btn-text-wrap';
 const chArrow=svgNode('arrow');chArrow.className='btn-arrow-wrap';
 charBtn.append(chIcon,chText,chArrow);
 charBtn.onclick=()=>{viewMode='characters';render();};
 actions.append(charBtn);

 const logoutBtn=node('button','');logoutBtn.type='button';logoutBtn.className='btn-royal btn-neutral';
 logoutBtn.append(node('span','Cerrar sesión'));
 logoutBtn.onclick=logout;actions.append(logoutBtn);

 card.append(h2,intro,actions);root.append(card);
}

function getCamera(cw,ch,cols,rows,avatarX,avatarY){
 if(Math.abs(cw/cols-ch/rows)<0.01&&cw<=640&&ch<=480){
  const S=cw/cols;
  return {S,camX:0,camY:0,worldW:cw,worldH:ch,freeTop:0,freeBottom:ch};
 }
 const S=Math.max(cw/cols,ch/rows);
 const worldW=cols*S;
 const worldH=rows*S;
 const targetCamX=avatarX*S-cw/2;
 const camX=worldW>cw?Math.max(0,Math.min(worldW-cw,targetCamX)):(worldW-cw)/2;

 let freeTop=0, freeBottom=ch, hasDOMRects=false;
 if(typeof document!=='undefined'&&canvas?.getBoundingClientRect){
  const cRect=canvas.getBoundingClientRect();
  if(cRect&&cRect.height>0){
   const ratio=ch/cRect.height;
   const hud=$('hud');
   if(hud&&!hud.hidden&&hud.getBoundingClientRect){
    const r=hud.getBoundingClientRect();
    if(r.height>0){
     freeTop=Math.max(freeTop,(r.bottom-cRect.top)*ratio);
     hasDOMRects=true;
    }
   }
   const dlg=$('dialogue');
   if(dlg&&!dlg.hidden&&dlg.getBoundingClientRect){
    const r=dlg.getBoundingClientRect();
    if(r.height>0){
     if(r.top<cRect.top+cRect.height*0.5){
      freeTop=Math.max(freeTop,(r.bottom-cRect.top)*ratio);
     }else{
      freeBottom=Math.min(freeBottom,(r.top-cRect.top)*ratio);
     }
     hasDOMRects=true;
    }
   }
   const ctrl=typeof document.querySelector==='function'?document.querySelector('.controls'):null;
   if(ctrl&&!ctrl.hidden&&ctrl.getBoundingClientRect){
    const style=typeof window.getComputedStyle==='function'?window.getComputedStyle(ctrl):null;
    if(style?.display!=='none'){
     const r=ctrl.getBoundingClientRect();
     if(r.height>0&&r.top<cRect.bottom){
      freeBottom=Math.min(freeBottom,(r.top-cRect.top)*ratio);
      hasDOMRects=true;
     }
    }
   }
   const mb=$('menu-bar');
   if(mb&&!mb.hidden&&mb.getBoundingClientRect){
    const r=mb.getBoundingClientRect();
    if(r.height>0&&r.top<cRect.bottom){
     freeBottom=Math.min(freeBottom,(r.top-cRect.top)*ratio);
     hasDOMRects=true;
    }
   }
  }
 }

 if(hasDOMRects&&freeBottom>freeTop+40){
  const safeCenterY=(freeTop+freeBottom)/2;
  const targetCamY=avatarY*S-safeCenterY;
  const minCamY=-freeTop;
  const maxCamY=worldH-freeBottom;
  let camY;
  if(minCamY<=maxCamY){
   camY=Math.max(minCamY,Math.min(maxCamY,targetCamY));
  }else{
   camY=worldH/2-safeCenterY;
  }
  return {S,camX,camY,worldW,worldH,freeTop,freeBottom};
 }

 const safeCenterY=ch>550?(80+(ch-180))/2:ch/2;
 const targetCamY=avatarY*S-safeCenterY;
 const camY=worldH>ch?Math.max(0,Math.min(worldH-ch,targetCamY)):(worldH-ch)/2;
 return {S,camX,camY,worldW,worldH,freeTop:0,freeBottom:ch};
}

let worldMapOpen=false, mapScale=1.0, mapPanX=0, mapPanY=0;
const mapPointers=new Map();
let mapDragging=false, mapDragStartX=0, mapDragStartY=0;
let mapPinchDist=0, mapPinchScale=1.0;
let cachedWorldMapPositions=null, cachedWorldMapBounds=null;

function openWorldMap(){
 worldMapOpen=true;
 const modal=$('world-map-modal');
 if(!modal)return;
 modal.hidden=false;
 mapScale=1.0;
 renderWorldMap();
 if(typeof requestAnimationFrame==='function'){
  requestAnimationFrame(centerWorldMapOnPlayer);
 }
}

function closeWorldMap(){
 worldMapOpen=false;
 const modal=$('world-map-modal');
 if(modal)modal.hidden=true;
 mapPointers.clear();
 mapDragging=false;
}

function getMapLayout(visibleNodes, routes){
 const steps={norte:[0,-1],sur:[0,1],este:[1,0],oeste:[-1,0],salir:[1,1],hogar:[-1,-1]};
 const positions=new Map(), taken=new Set();
 const nodes=[...visibleNodes].sort((a,b)=>a.id.localeCompare(b.id));
 const rts=[...routes].sort((a,b)=>(a.from+'\n'+a.to+'\n'+(a.direction||'')).localeCompare(b.from+'\n'+b.to+'\n'+(b.direction||'')));
 for(const n of nodes){
  if(Array.isArray(n.position)&&n.position.length===2&&n.position.every(Number.isSafeInteger)){
   positions.set(n.id,[...n.position]);
   taken.add(n.position.join(','));
  }
 }
 if(positions.size===nodes.length)return positions;
 let component=0;
 for(const n of nodes){
  if(!positions.has(n.id)){
   let start=[component*3,0];
   while(taken.has(start.join(',')))start[0]++;
   positions.set(n.id,start);
   taken.add(start.join(','));
   component++;
  }
  const queue=[n.id], visited=new Set();
  for(let i=0;i<queue.length;i++){
   const from=queue[i];
   if(visited.has(from))continue;
   visited.add(from);
   const [x,y]=positions.get(from);
   for(const r of rts){
    if(r.from!==from||!nodes.some(node=>node.id===r.to))continue;
    if(!positions.has(r.to)){
     const [dx,dy]=steps[r.direction]||[1,0];
     let cell=[x+dx,y+dy];
     while(taken.has(cell.join(',')))cell=[cell[0]+dx,cell[1]+dy];
     positions.set(r.to,cell);
     taken.add(cell.join(','));
    }
    if(!visited.has(r.to))queue.push(r.to);
   }
  }
 }
 return positions;
}

function renderWorldMap(){
 const modal=$('world-map-modal');
 if(!modal||modal.hidden)return;
 const currentId=snapshot?.character?.location||snapshot?.room?.id;
 const subtitle=$('world-map-subtitle');
 if(subtitle)subtitle.textContent=snapshot?.room?.name?`Estás en: ${snapshot.room.name}`:'Tierras conocidas';

 const allNodes=Array.isArray(snapshot?.map?.nodes)?snapshot.map.nodes:[];
 let visibleNodes=allNodes.filter(n=>n.visited||n.id===currentId);
 if(!visibleNodes.length&&snapshot?.room){
  visibleNodes=[{id:snapshot.room.id,name:snapshot.room.name,region:snapshot.room.region,visited:true,position:[0,0]}];
 }
 const visibleIds=new Set(visibleNodes.map(n=>n.id));
 const allRoutes=Array.isArray(snapshot?.map?.routes)?snapshot.map.routes:[];
 const visibleRoutes=allRoutes.filter(r=>visibleIds.has(r.from)&&visibleIds.has(r.to));

 const positions=getMapLayout(visibleNodes,visibleRoutes);
 cachedWorldMapPositions=positions;

 let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
 for(const [gx,gy] of positions.values()){
  if(gx<minX)minX=gx;
  if(gx>maxX)maxX=gx;
  if(gy<minY)minY=gy;
  if(gy>maxY)maxY=gy;
 }
 if(!Number.isFinite(minX)){minX=0;maxX=0;minY=0;maxY=0;}
 cachedWorldMapBounds={minX,maxX,minY,maxY};

 const SCALE_X=140, SCALE_Y=110, PAD_X=140, PAD_Y=120;
 const planeW=Math.max(900,(maxX-minX)*SCALE_X+PAD_X*2);
 const planeH=Math.max(700,(maxY-minY)*SCALE_Y+PAD_Y*2);

 const plane=$('world-map-plane');
 if(plane){
  plane.style.width=`${planeW}px`;
  plane.style.height=`${planeH}px`;
 }

 const roadsSvg=$('world-map-roads');
 if(roadsSvg&&roadsSvg.setAttribute){
  roadsSvg.setAttribute('width',String(planeW));
  roadsSvg.setAttribute('height',String(planeH));
  roadsSvg.setAttribute('viewBox',`0 0 ${planeW} ${planeH}`);
  const paths=[];
  const drawnEdges=new Set();
  for(const r of visibleRoutes){
   const edgeKey=[r.from,r.to].sort().join('--');
   if(drawnEdges.has(edgeKey))continue;
   drawnEdges.add(edgeKey);
   const posFrom=positions.get(r.from), posTo=positions.get(r.to);
   if(!posFrom||!posTo)continue;

   let d='';
   if(Array.isArray(r.points)&&r.points.length>=2){
    d=r.points.map(([px,py],idx)=>{
     const sx=(px/4-minX)*SCALE_X+PAD_X;
     const sy=(py/4-minY)*SCALE_Y+PAD_Y;
     return `${idx===0?'M':'L'}${sx.toFixed(1)},${sy.toFixed(1)}`;
    }).join(' ');
   }else{
    const x1=(posFrom[0]-minX)*SCALE_X+PAD_X;
    const y1=(posFrom[1]-minY)*SCALE_Y+PAD_Y;
    const x2=(posTo[0]-minX)*SCALE_X+PAD_X;
    const y2=(posTo[1]-minY)*SCALE_Y+PAD_Y;
    d=`M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}`;
   }

   if(document.createElementNS){
    const pathOuter=document.createElementNS('http://www.w3.org/2000/svg','path');
    if(pathOuter.setAttribute){
     pathOuter.setAttribute('d',d);
     pathOuter.setAttribute('class','map-road-outer');
    }
    const pathInner=document.createElementNS('http://www.w3.org/2000/svg','path');
    if(pathInner.setAttribute){
     pathInner.setAttribute('d',d);
     pathInner.setAttribute('class','map-road-inner');
    }
    paths.push(pathOuter,pathInner);
   }
  }
  if(roadsSvg.replaceChildren)roadsSvg.replaceChildren(...paths);
 }

 const nodesContainer=$('world-map-nodes');
 if(nodesContainer){
  const nodeElems=[];
  for(const n of visibleNodes){
   const pos=positions.get(n.id)||[0,0];
   const nx=(pos[0]-minX)*SCALE_X+PAD_X;
   const ny=(pos[1]-minY)*SCALE_Y+PAD_Y;
   const isCurrent=n.id===currentId;

   const wrap=document.createElement('div');
   wrap.className=`world-node${isCurrent?' world-node-current':' world-node-visited'}`;
   wrap.style.left=`${nx.toFixed(1)}px`;
   wrap.style.top=`${ny.toFixed(1)}px`;

   const marker=document.createElement('div');
   marker.className='node-marker';
   if(isCurrent){
    const pulse=document.createElement('span');
    pulse.className='marker-pulse';
    const core=document.createElement('span');
    core.className='marker-core';
    core.textContent='★';
    marker.append(pulse,core);
   }else{
    const dot=document.createElement('span');
    dot.className='marker-dot';
    marker.append(dot);
   }

   const label=document.createElement('div');
   label.className='node-label';
   const nameSpan=document.createElement('span');
   nameSpan.className='node-name';
   nameSpan.textContent=n.name;
   label.append(nameSpan);
   if(isCurrent){
    const badge=document.createElement('span');
    badge.className='node-badge';
    badge.textContent='Estás aquí';
    label.append(badge);
   }

   wrap.append(marker,label);
   nodeElems.push(wrap);
  }
  if(nodesContainer.replaceChildren)nodesContainer.replaceChildren(...nodeElems);
 }

 updateWorldMapTransform();
}

function updateWorldMapTransform(){
 const plane=$('world-map-plane');
 if(plane){
  plane.style.transform=`translate(${mapPanX.toFixed(1)}px, ${mapPanY.toFixed(1)}px) scale(${mapScale.toFixed(3)})`;
 }
}

function centerWorldMapOnPlayer(){
 const viewport=$('world-map-viewport');
 if(!viewport||!cachedWorldMapPositions||!cachedWorldMapBounds)return;
 const currentId=snapshot?.character?.location||snapshot?.room?.id;
 const pos=cachedWorldMapPositions.get(currentId)||cachedWorldMapPositions.values().next().value;
 if(!pos)return;
 const SCALE_X=140, SCALE_Y=110, PAD_X=140, PAD_Y=120;
 const px=(pos[0]-cachedWorldMapBounds.minX)*SCALE_X+PAD_X;
 const py=(pos[1]-cachedWorldMapBounds.minY)*SCALE_Y+PAD_Y;
 const vw=viewport.clientWidth||400;
 const vh=viewport.clientHeight||500;
 mapPanX=vw/2-px*mapScale;
 mapPanY=vh/2-py*mapScale;
 updateWorldMapTransform();
}

let lastExitStateKey='';
function renderExitIndicators(cam,force=false){
 const container=$('exit-indicators');
 if(!container)return;
 const inGame=viewMode==='game'&&!snapshot?.character?.combat&&!outcome&&!$('world-view')?.hidden&&$('panel')?.hidden&&!worldMapOpen;
 if(!inGame||!scene||!Array.isArray(scene.exits)||scene.exits.length===0){
  if(lastExitStateKey!==''){
   container.hidden=true;
   if(container.replaceChildren)container.replaceChildren();
   lastExitStateKey='';
  }
  return;
 }
 container.hidden=false;

 const freeTop=Math.round(cam?.freeTop??50);
 const freeBottom=Math.round(cam?.freeBottom??(canvas.height||480));
 const stateKey=JSON.stringify([scene.exits.map(e=>e.direction),(snapshot.actions||[]).filter(a=>a.id==='mover').map(a=>[a.target,a.label,a.disabled]),freeTop,freeBottom,dialogueFolded]);
 if(!force&&stateKey===lastExitStateKey)return;
 lastExitStateKey=stateKey;

 const cRect=canvas?.getBoundingClientRect?canvas.getBoundingClientRect():null;
 const ratio=(cRect&&cRect.height>0)?(cRect.height/canvas.height):1;
 const cssFreeTop=freeTop*ratio;
 const cssFreeBottom=freeBottom*ratio;
 const canvasCssHeight=cRect?.height||(canvas.height*ratio);

 const arrows={norte:'↑',sur:'↓',este:'→',oeste:'←'};
 const chips=[];
 for(const e of scene.exits){
  const dir=e.direction;
  const moveAction=(snapshot.actions||[]).find(a=>a.id==='mover'&&a.target===dir);
  let destName='';
  if(moveAction?.label){
   const parts=moveAction.label.split('·');
   destName=parts.length>1?parts.slice(1).join('·').trim():moveAction.label.trim();
  }
  if(!destName)destName=dir.charAt(0).toUpperCase()+dir.slice(1);

  const isBlocked=Boolean(moveAction?.disabled);
  const arrow=arrows[dir]||'✦';

  const btn=document.createElement('button');
  btn.type='button';
  btn.className=`exit-chip exit-chip-${dir}${isBlocked?' is-blocked':''}`;
  if(btn.setAttribute)btn.setAttribute('aria-label',`${isBlocked?'Salida bloqueada':'Caminar hacia'}: ${destName} (${dir})`);
  if(isBlocked&&moveAction?.reason)btn.title=moveAction.reason;

  if(isBlocked){
   const lock=document.createElement('span');
   lock.className='exit-chip-icon';
   lock.textContent='🔒';
   btn.append(lock);
  }

  const arrowSpan=document.createElement('span');
  arrowSpan.className='exit-chip-arrow';
  arrowSpan.textContent=arrow;
  btn.append(arrowSpan);

  const labelSpan=document.createElement('span');
  labelSpan.className='exit-chip-label';
  labelSpan.textContent=destName;
  btn.append(labelSpan);

  if(dir==='norte'){
   btn.style.top=`${Math.round(cssFreeTop+6)}px`;
  }else if(dir==='sur'){
   btn.style.bottom=`${Math.round(Math.max(6,canvasCssHeight-cssFreeBottom+6))}px`;
  }

  btn.onclick=ev=>{
   ev.stopPropagation();
   if(moveAction){
    perform(moveAction);
   }else{
    notice('No puedes moverte hacia allí.');
   }
  };

  chips.push(btn);
 }
 if(container.replaceChildren)container.replaceChildren(...chips);
}

function initWorldMapEvents(){
 const modal=$('world-map-modal');
 const viewport=$('world-map-viewport');
 const closeBtn=$('close-world-map');
 const zoomIn=$('map-zoom-in');
 const zoomOut=$('map-zoom-out');
 const centerBtn=$('map-center-player');

 if(closeBtn)closeBtn.onclick=closeWorldMap;
 if(zoomIn)zoomIn.onclick=()=>{mapScale=Math.min(3.0,mapScale*1.25);updateWorldMapTransform();};
 if(zoomOut)zoomOut.onclick=()=>{mapScale=Math.max(0.4,mapScale/1.25);updateWorldMapTransform();};
 if(centerBtn)centerBtn.onclick=()=>{mapScale=1.0;centerWorldMapOnPlayer();};

 if(viewport&&viewport.addEventListener){
  viewport.addEventListener('pointerdown',e=>{
   if(e.button!==0&&e.pointerType==='mouse')return;
   viewport.setPointerCapture?.(e.pointerId);
   mapPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(mapPointers.size===1){
    mapDragging=true;
    mapDragStartX=e.clientX-mapPanX;
    mapDragStartY=e.clientY-mapPanY;
   }else if(mapPointers.size===2){
    mapDragging=false;
    const [p1,p2]=[...mapPointers.values()];
    mapPinchDist=Math.hypot(p1.x-p2.x,p1.y-p2.y);
    mapPinchScale=mapScale;
   }
  });

  viewport.addEventListener('pointermove',e=>{
   if(!mapPointers.has(e.pointerId))return;
   mapPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(mapPointers.size===1&&mapDragging){
    mapPanX=e.clientX-mapDragStartX;
    mapPanY=e.clientY-mapDragStartY;
    updateWorldMapTransform();
   }else if(mapPointers.size===2&&mapPinchDist>0){
    const [p1,p2]=[...mapPointers.values()];
    const dist=Math.hypot(p1.x-p2.x,p1.y-p2.y);
    const factor=dist/mapPinchDist;
    mapScale=Math.max(0.4,Math.min(3.0,mapPinchScale*factor));
    updateWorldMapTransform();
   }
  });

  for(const evName of ['pointerup','pointercancel','lostpointercapture']){
   viewport.addEventListener(evName,e=>{
    mapPointers.delete(e.pointerId);
    if(mapPointers.size===0)mapDragging=false;
    else if(mapPointers.size===1){
     const remaining=mapPointers.values().next().value;
     mapDragStartX=remaining.x-mapPanX;
     mapDragStartY=remaining.y-mapPanY;
     mapDragging=true;
    }
   });
  }

  viewport.addEventListener('wheel',e=>{
   e.preventDefault();
   const zoomFactor=e.deltaY<0?1.15:0.87;
   const newScale=Math.max(0.4,Math.min(3.0,mapScale*zoomFactor));
   const rect=viewport.getBoundingClientRect?.()||{left:0,top:0};
   const mx=e.clientX-rect.left;
   const my=e.clientY-rect.top;
   mapPanX=mx-(mx-mapPanX)*(newScale/mapScale);
   mapPanY=my-(my-mapPanY)*(newScale/mapScale);
   mapScale=newScale;
   updateWorldMapTransform();
  },{passive:false});
 }
}

function drawMinimap(){
 const minimapCard=$('minimap-card');
 if(!minimapCard)return;
 if(!scene||!snapshot?.room||!scene.size){
  minimapCard.hidden=true;
  return;
 }
 minimapCard.hidden=false;
 const roomName=$('minimap-room-name');
 if(roomName)roomName.textContent=snapshot.room.name||'Sala actual';
 minimapCard.title=`Sala actual: ${snapshot.room.name||''} · Toca para abrir mapa del mundo`;
 if(minimapCard.setAttribute){
  minimapCard.setAttribute('role','button');
  minimapCard.setAttribute('tabindex','0');
  minimapCard.setAttribute('aria-label',`Mapa del mundo. Ubicación: ${snapshot.room.name||'Sala actual'}`);
 }
 minimapCard.onclick=openWorldMap;
 minimapCard.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openWorldMap();}};

 const mCanvas=$('minimap-canvas');
 if(!mCanvas||!mCanvas.getContext)return;
 const mCtx=mCanvas.getContext('2d');
 if(!mCtx||!mCtx.fillRect)return;
 const mw=mCanvas.width||48, mh=mCanvas.height||36;
 const [cols,rows]=scene.size;

 mCtx.fillStyle='#0b1420';
 mCtx.fillRect(0,0,mw,mh);

 const backdrop=sceneBackgroundImage(scene);
 if(backdrop&&backdrop.complete&&backdrop.naturalWidth){
  mCtx.drawImage(backdrop,0,0,mw,mh);
 }else if(scene.layers?.ground){
  const colors={g:'#1b2b3a',p:'#635338',c:'#162432',s:'#4a3821',w:'#1a3d54',b:'#5c533c',f:'#131d27'};
  const tw=mw/cols, th=mh/rows;
  scene.layers.ground.forEach((row,y)=>[...row].forEach((tile,x)=>{
   mCtx.fillStyle=colors[tile]||colors.g;
   mCtx.fillRect(x*tw,y*th,tw+0.5,th+0.5);
  }));
 }

 if(Array.isArray(scene.exits)){
  mCtx.fillStyle='#d4af37';
  for(const e of scene.exits){
   const [ex,ey,ew,eh]=e.rect;
   mCtx.fillRect((ex/cols)*mw,(ey/rows)*mh,Math.max(2,(ew/cols)*mw),Math.max(2,(eh/rows)*mh));
  }
 }

 const px=(player.x/cols)*mw;
 const py=(player.y/rows)*mh;
 mCtx.fillStyle='#ffffff';
 mCtx.strokeStyle='#caa24e';
 mCtx.lineWidth=1;
 mCtx.beginPath();
 mCtx.arc(px,py,2.5,0,2*Math.PI);
 mCtx.fill();
 mCtx.stroke();
}

function syncMusic(inGame){
 const S=globalThis.VaisgardSonido;if(!S)return;
 const room=inGame?snapshot?.room:null, combat=snapshot?.character?.combat;
 S.musica(!room?null:combat?S.temaBatalla(combat,room.region):outcome?null:S.temaSala(room));
}
function render(){
 const auth=Boolean(snapshot?.authenticated);
 const inGame=auth&&snapshot?.character?.status==='approved'&&!snapshot?.pending_approval&&viewMode==='game';
 syncMusic(inGame);
 if(typeof document!=='undefined'&&document.body){
  document.body.classList.toggle('in-entry',!inGame);
 }
 const logoutElem=$('logout');if(logoutElem)logoutElem.hidden=!auth;
 const entryElem=$('entry');const worldElem=$('world-view');
 if(!inGame){
  if(worldElem)worldElem.hidden=true;
  if(entryElem){entryElem.hidden=false;if(entryState()!==entryKey)renderEntry();for(const b of entryElem.querySelectorAll('button[data-busy]'))b.disabled=busy;}
  panel(false);return;
 }
 if(entryElem)entryElem.hidden=true;
 if(worldElem)worldElem.hidden=false;
 resizeCanvas();
 if(!snapshot?.room||!scene)return;
 const c=snapshot.character,combat=c.combat;
 if(focus&&!entities().some(e=>e.id===focus))focus=null;

 if($('enemy-hud'))$('enemy-hud').hidden=!combat&&!outcome;
 if($('char-name'))$('char-name').textContent=c.name;
 if($('char-title')){$('char-title').textContent=c.titulo||'';$('char-title').hidden=!c.titulo;$('char-title').title=c.titulo||'';}
 if($('char-level'))$('char-level').textContent=`Nv. ${c.level}`;
 if($('hp-bar-fill'))$('hp-bar-fill').style.width=`${Math.max(0,Math.min(100,(c.hp/c.hp_max)*100))}%`;
 if($('hp-bar-text'))$('hp-bar-text').textContent=`${c.hp} / ${c.hp_max}`;
 if($('place'))$('place').textContent=snapshot.room.name;
 if($('identity'))$('identity').textContent=`PV ${c.hp}/${c.hp_max} · XP ${c.xp}/${c.xp_next}`+(c.fatigue!==undefined?` · Fatiga ${Math.round(c.fatigue)}/100`:'');
 if($('description'))$('description').textContent=snapshot.room.description;

 drawMinimap();

 const navItems=[
  {group:'Personas',label:'Gente',icon:'person',desc:'Personas en la zona'},
  {group:'Criaturas',label:'Fauna',icon:'fauna',desc:'Criaturas de la zona'},
  {group:'Mochila',label:'Mochila',icon:'pack',desc:'Inventario y objetos'},
  {group:'Lugar',label:'Lugar',icon:'place',desc:'Entorno y salidas'},
  {group:'Personaje',label:'Héroe',icon:'shield',desc:'Ficha del héroe'},
  {group:'Más',label:'Menú',icon:'menu',desc:'Opciones y decisiones'}
 ];
 const people=new Set(snapshot.room.npcs.map(n=>n.id));
 const creatures=new Set(entities().filter(e=>!people.has(e.id)).map(e=>e.id));
 const category=a=>people.has(a.target)?'Personas':creatures.has(a.target)?'Criaturas':['usar','equipar','desequipar','tirar','inventario','examinar_objeto'].includes(a.id)?'Mochila':['mover','mirar','observar','explorar'].includes(a.id)?'Lugar':'Más';

 $('menu-bar').replaceChildren(...navItems.map(item=>{
  const b=document.createElement('button');b.type='button';b.className='nav-cell-btn';
  b.setAttribute('aria-label',`${item.label} (${item.group})`);
  b.setAttribute('aria-expanded',String(!$('panel').hidden&&menuGroup===item.group));
  b.title=item.desc;
  const iconSpan=svgNode(item.icon);iconSpan.classList.add('nav-btn-icon');
  const labelSpan=node('span',item.label);labelSpan.className='nav-btn-label';
  b.append(iconSpan,labelSpan);
  b.onclick=()=>{menuGroup=item.group;focus=null;panel(true);render();};
  return b;
 }));

 const openPanelSections=new Set([...$('contexts').querySelectorAll('details[data-section]')].filter(section=>section.open).map(section=>section.dataset.section));
 $('contexts').replaceChildren();
 if(menuGroup==='Personas'||menuGroup==='Criaturas'){
  for(const e of entities().filter(e=>menuGroup==='Personas'?people.has(e.id):!people.has(e.id))){
   const b=node('button',e.name);b.onclick=()=>{focus=e.id;render();};$('contexts').append(b);
  }
 }
 if(!menuGroup){
  $('contexts').replaceChildren(...navItems.map(item=>{
   const b=node('button',item.label);b.onclick=()=>{menuGroup=item.group;focus=null;render();};return b;
  }));
  const mapBtn=node('button','🗺️ Mapa del mundo');
  mapBtn.onclick=()=>{panel(false);openWorldMap();};
  $('contexts').append(mapBtn);
 }
 if(menuGroup==='Lugar'){
  const mapBtn=node('button','🗺️ Ver mapa del mundo');
  mapBtn.onclick=()=>{panel(false);openWorldMap();};
  $('contexts').prepend(mapBtn);
 }
 const panelMapBtn=$('panel-world-map');
 if(panelMapBtn)panelMapBtn.onclick=()=>{panel(false);openWorldMap();};
 $('action-title').textContent=focus?`Interacción · ${entities().find(e=>e.id===focus)?.name||focus}`:menuGroup||'Menú';
 $('description').hidden=menuGroup!=='Lugar';
 const accountTools=document.querySelector('.panel-account-tools');if(accountTools)accountTools.hidden=menuGroup!=='Más';
 const detailsHist=document.querySelector('#narrative-history');if(detailsHist)detailsHist.hidden=menuGroup!=='Más';

 if(menuGroup==='Personaje'){
  const statsBox=node('div','');statsBox.className='char-tile';
  const sInfo=node('div','');sInfo.className='char-info';
  sInfo.append(node('strong',`${c.name} (Nv. ${c.level})${c.titulo?` · ${c.titulo}`:''}`));
  sInfo.append(node('small',`${speciesNames[c.species]||c.species} · ${classNames[c.class_id]||c.class_id}`));
  sInfo.append(node('p',`Salud: ${c.hp} / ${c.hp_max} · Experiencia: ${c.xp} / ${c.xp_next}`));
  if(c.seals!==undefined)sInfo.append(node('p',`Sellos: ${c.seals}`));
  if(c.fatigue!==undefined)sInfo.append(node('p',`Fatiga: ${Math.round(c.fatigue)} / 100`));
  const specialization=c.especializacion;
  if(specialization?.name||specialization?.id)sInfo.append(node('p',`Especialización: ${specialization.name||({'arcano_ecos':'Arcano de los Ecos','juramentado_heroico':'Juramentado Heroico'}[specialization.id]||specialization.id)}`));
  const ranks=(c.rangos||[]).map(rank=>rank.name).filter(Boolean);
  if(ranks.length)sInfo.append(node('p',`Rangos: ${ranks.join(' · ')}`));
  statsBox.append(sInfo);$('contexts').append(statsBox);

  const echoes=c.ecos||[];
  const echoDetails=node('details','');echoDetails.className='rpg-panel-section';echoDetails.dataset.section='echoes';echoDetails.open=openPanelSections.has('echoes');
  echoDetails.append(node('summary',`Ecos (${echoes.length})`),echoes.length?node('p',echoes.map(e=>`${e.name} · fuerza ${e.power}`).join('  |  ')):node('p','Aún no guardas ecos de criaturas.'));
  $('contexts').append(echoDetails);

  const goals=c.goals||[];
  const goalsDetails=node('details','');goalsDetails.className='rpg-panel-section';goalsDetails.dataset.section='goals';goalsDetails.open=openPanelSections.has('goals');
  goalsDetails.append(node('summary','Metas'));
  for(const goal of goals)goalsDetails.append(node('p',`${goal.period}: ${goal.title} — ${goal.text}`));
  if(!goals.length)goalsDetails.append(node('p','No hay metas disponibles ahora.'));
  $('contexts').append(goalsDetails);

  const daily=snapshot.daily_errands||{errands:[],streak:0}, errands=daily.errands||[];
  const completed=errands.filter(errand=>errand.completed).length;
  const errandsDetails=node('details','');errandsDetails.className='rpg-panel-section';errandsDetails.dataset.section='errands';errandsDetails.open=openPanelSections.has('errands');
  errandsDetails.append(node('summary',`Recados de hoy · ${completed}/${errands.length}`));
  for(const errand of errands)errandsDetails.append(node('p',`${errand.completed?'✓':'○'} ${errand.title} · ${errand.completed?'Completado':`Recompensa: ${errand.reward} XP`}`));
  if(daily.streak)errandsDetails.append(node('p',`Racha: ${daily.streak} días`));
  $('contexts').append(errandsDetails);

  const book=c.goal_book||{entries:[],unlocked:0,total:0}, entries=book.entries||[];
  const achievements=node('details','');achievements.className='rpg-panel-section';achievements.dataset.section='achievements';achievements.open=openPanelSections.has('achievements');
  achievements.append(node('summary',`Logros · ${book.unlocked||0}/${book.total||entries.length}`));
  for(const entry of entries)achievements.append(node('div',`${entry.unlocked?'✦':'◇'} ${entry.name} · ${entry.unlocked?'Conseguido':`${entry.progress}/${entry.target}`}`));
  $('contexts').append(achievements);
 }

 const actions=snapshot.actions.filter(a=>focus?a.target===focus:menuGroup&&category(a)===menuGroup);
 $('actions').replaceChildren(...actions.map(actionButton));
 if(menuGroup&&actions.length===0&&!focus&&menuGroup!=='Personaje')$('actions').append(node('p','No hay decisiones disponibles aquí.'));
 if(pending){const b=node('button','Reintentar la misma decisión');b.onclick=()=>send(pending);$('actions').prepend(b);}

 $('combat').hidden=!combat;document.body.classList.toggle('battling',Boolean(combat));
 $('combat').replaceChildren();$('speaker').textContent=combat?(combat.prepared_action?.name||'Combate'):focus?(entities().find(e=>e.id===focus)?.name||'Conversación'):'El camino';
 renderBattleMenu();$('outcome').hidden=!outcome;
 if(outcome){const b=node('button','Continuar · A');b.onclick=dismissOutcome;$('outcome').replaceChildren(node('strong',outcome.title),node('p',outcome.text),b);}
 if(!combat)$('turn').textContent='';
 const text=(snapshot.narrative||[]).map(e=>typeof e==='string'?e:e.text).filter(Boolean);
 if($('narrative').dataset.text!==JSON.stringify(text)){$('narrative').replaceChildren(...text.map(t=>node('p',t)));$('narrative').dataset.text=JSON.stringify(text);}
 const cam=getCamera(canvas.width,canvas.height,...(scene?.size||[20,15]),player.x,player.y);
 renderExitIndicators(cam, true);
 if(worldMapOpen)renderWorldMap();
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
 lastAction={id:offered.id,at:performance.now()};
 if(offered.id!=='mover')sonido('confirmar');
 await send(payload);
}
async function send(payload){
 if(busy)return;busy=true;render();notice('Consultando el mundo…');
 const before=snapshot.room?.id;
 try{const next=await api('/api/action',payload);pending=null;if(next.room?.id!==before&&payload.id==='mover'){entrance=opposite[payload.target];panel(false);}await apply(next);notice('');}
 catch(error){if(!error.status)pending=payload;else selectedRound=null;notice(error.message+(pending?' Reintenta la misma decisión para evitar duplicados.':''));}
 finally{busy=false;render();schedulePoll(0);}
}

function interact(){
 if(outcome){dismissOutcome();return;}
 if(snapshot?.character?.combat){
  if(document.activeElement?.closest('#battle-menu')){document.activeElement.click();return;}
  const button=$('battle-menu').querySelector('button:not(:disabled)');button?.focus();return;
 }
 const near=entities().sort((a,b)=>Math.hypot(a.at[0]-player.x,a.at[1]-player.y)-Math.hypot(b.at[0]-player.x,b.at[1]-player.y))[0];
 focus=near&&Math.hypot(near.at[0]-player.x,near.at[1]-player.y)<3?near.id:null;
 menuGroup=focus?(snapshot.room.npcs.some(n=>n.id===focus)?'Personas':'Criaturas'):null;
 panel(true);render();
}

$('interact').onclick=()=>{if(outcome)dismissOutcome();else if(letters<(lines[lineIndex]?.length||0)||lineIndex<lines.length-1)advance();else interact();};
$('advance').onclick=()=>outcome?dismissOutcome():advance();
const toggleBtnElem=$('toggle-dialogue');if(toggleBtnElem)toggleBtnElem.onclick=toggleDialogueExpand;
$('pause').onclick=()=>{menuGroup=null;focus=null;panel($('panel').hidden);render();};
$('back').onclick=back;$('close-panel').onclick=back;

const panelSelect=$('panel-select-char');if(panelSelect)panelSelect.onclick=()=>{panel(false);viewMode='characters';render();};
const panelLogout=$('panel-logout');if(panelLogout)panelLogout.onclick=()=>{panel(false);logout();};
const headerLogout=$('logout');if(headerLogout)headerLogout.onclick=logout;
const closeMapBtn=$('close-world-map');if(closeMapBtn)closeMapBtn.onclick=closeWorldMap;
const zoomInBtn=$('map-zoom-in');if(zoomInBtn)zoomInBtn.onclick=()=>{mapScale=Math.min(3.0,mapScale*1.25);updateWorldMapTransform();};
const zoomOutBtn=$('map-zoom-out');if(zoomOutBtn)zoomOutBtn.onclick=()=>{mapScale=Math.max(0.4,mapScale/1.25);updateWorldMapTransform();};
const centerMapBtn=$('map-center-player');if(centerMapBtn)centerMapBtn.onclick=()=>{mapScale=1.0;centerWorldMapOnPlayer();};
initWorldMapEvents();

const bindings={ArrowUp:[0,-1,1],w:[0,-1,1],ArrowDown:[0,1,0],s:[0,1,0],ArrowLeft:[-1,0,2],a:[-1,0,2],ArrowRight:[1,0,3],d:[1,0,3]};
window.addEventListener('keydown',e=>{
 if(e.target.closest?.('input,textarea,select'))return;
 const key=e.key.length===1?e.key.toLowerCase():e.key;
 if(['x','Escape'].includes(key)){e.preventDefault();if(!e.repeat)back();return;}
 if(['z','Enter',' ','e'].includes(key)){if(e.target.closest?.('button,a')&&key==='Enter')return;e.preventDefault();if(!e.repeat)$('interact').click();return;}
 if(bindings[key]){
  e.preventDefault();
  if(snapshot?.character?.combat||!$('panel').hidden){
   if(!e.repeat){
    const buttons=[...(snapshot?.character?.combat?$('battle-menu'):$('panel')).querySelectorAll('button:not(:disabled)')];
    const i=buttons.indexOf(document.activeElement),step=['ArrowUp','w','ArrowLeft','a'].includes(key)?-1:1;
    buttons[(i+step+buttons.length)%buttons.length]?.focus();
   }
  }else keys.add(key);
 }
});
window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
window.addEventListener('blur',()=>keys.clear());
document.addEventListener('visibilitychange',()=>keys.clear());

for(const b of document.querySelectorAll('[data-key]')){
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);keys.add(b.dataset.key);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys.delete(b.dataset.key));
}

function blocked(x,y){
 return [x-.22,x+.22].some(px=>[y-.18,y+.18].some(py=>px<0||py<0||px>=scene.size[0]||py>=scene.size[1]||!['.','0',' '].includes(scene.layers.solid[Math.floor(py)]?.[Math.floor(px)]||'1')));
}

function draw(time){
 const canvasRect=canvas.getBoundingClientRect?.();
 const density=canvasRect?.width?canvas.width/canvasRect.width:1;
 const dt=Math.min((time-lastTime)/1000,.04);lastTime=time;ctx.imageSmoothingEnabled=false;
 const currentLine=lines[lineIndex]||snapshot?.room?.description||'';
 if(time-letterTime>25&&letters<currentLine.length){letters=reduced?currentLine.length:letters+1;letterTime=time;paintLine();if(letters%3===0&&focus&&snapshot?.room?.npcs?.some(n=>n.id===focus))sonido('hablar');}

 if(ctx.clearRect)ctx.clearRect(0,0,canvas.width,canvas.height);

 if(snapshot?.character?.combat||outcome){battleDraw(time);return;}
 if(scene){
  drawMinimap();
  const [cols,rows]=scene.size;
  const cam=getCamera(canvas.width,canvas.height,cols,rows,player.x,player.y);
  const {S,camX,camY,worldW,worldH}=cam;
  renderExitIndicators(cam);
  const colors={g:'#1b2b3a',p:'#635338',c:'#162432',s:'#4a3821',w:'#1a3d54',b:'#5c533c',f:'#131d27'};
  const ts=tilesetData[scene.tileset||'edran'];
  if(!ts)void loadTileset(scene.tileset||'edran');
  const tsMeta=ts?.meta, tsImg=ts?.img;
  const hasTiles=tsMeta&&tsImg?.complete&&tsImg.naturalWidth;
  const tileSz=tsMeta?.tile||16;
  const tileCols=hasTiles?Math.floor(tsImg.naturalWidth/tileSz):0;
  const backdrop=sceneBackgroundImage(scene);
  if(backdrop)ctx.drawImage(backdrop,-camX,-camY,worldW,worldH);else scene.layers.ground.forEach((row,y)=>[...row].forEach((tile,x)=>{
   const idx=tsMeta?.map?.[tile];
   if(hasTiles&&typeof idx==='number'&&tileCols>0){
    const tx=(idx%tileCols)*tileSz,ty=Math.floor(idx/tileCols)*tileSz;
    ctx.drawImage(tsImg,tx,ty,tileSz,tileSz,x*S-camX,y*S-camY,S,S);
   }else{
    ctx.fillStyle=colors[tile]||colors.g;
    ctx.fillRect(x*S-camX,y*S-camY,S+1,S+1);
   }
  }));
  for(const e of scene.exits){
   const [x,y,w,h]=e.rect;
   ctx.fillStyle='rgba(212, 175, 55, 0.45)';
   ctx.fillRect(x*S-camX,y*S-camY,w*S,h*S);
   ctx.strokeStyle='#ffe58f';
   ctx.lineWidth=Math.max(1.5,2*density);
   ctx.strokeRect(x*S-camX,y*S-camY,w*S,h*S);
   const dirText=e.direction.toUpperCase();
   const exitFontSize=Math.max(12,Math.round(12.5*density));
   ctx.font=`bold ${exitFontSize}px sans-serif`;
   ctx.textAlign='center';
   const textW=ctx.measureText?ctx.measureText(dirText).width:30;
   const badgeW=textW+12*density;
   const badgeH=Math.max(18,Math.round(18*density));
   const badgeX=(x+w/2)*S-camX-badgeW/2;
   const badgeY=Math.max(10,(y+h/2)*S-camY-badgeH/2);
   ctx.fillStyle='rgba(6, 11, 19, 0.9)';
   ctx.fillRect(badgeX,badgeY,badgeW,badgeH);
   ctx.strokeStyle='#caa24e';
   ctx.lineWidth=1;
   ctx.strokeRect(badgeX,badgeY,badgeW,badgeH);
   ctx.fillStyle='#ffe58f';
   ctx.fillText(dirText,(x+w/2)*S-camX,badgeY+badgeH*0.72);
  }
  const key=[...keys].find(k=>bindings[k]);let moving=false;
  if(key&&!busy&&!pending&&$('panel').hidden){
   const [dx,dy,dir]=bindings[key];facing=dir;
   const x=player.x+dx*dt*4,y=player.y+dy*dt*4;
   if(!blocked(x,y)){player.x=x;player.y=y;moving=true;walk+=dt*9;if(Math.floor(walk/3)!==stepMark){stepMark=Math.floor(walk/3);sonido('paso');}}
  }
  const actors=[...entities().map(e=>({...e,x:e.at[0],y:e.at[1]})),{...player,sprite:'avatar',id:'player'}].sort((a,b)=>a.y-b.y);
  for(const a of actors){
   const im=images[a.sprite],sheet=a.sprite==='avatar'||a.sprite==='lina'||npcSpriteNames.has(a.sprite);
   const scale=mapSpriteScale(a.sprite);
   const width=Math.round((sheet?40:48)*scale*S/32);
   const height=Math.round((sheet?60:48)*scale*S/32);
   const screenX=a.x*S-camX, screenY=a.y*S-camY;
   ctx.fillStyle='rgba(6, 11, 19, 0.45)';
   ctx.beginPath();
   ctx.ellipse(screenX,screenY+Math.round(8*S/32),Math.round(12*scale*S/32),Math.round(5*scale*S/32),0,0,7);
   ctx.fill();
   if(im?.complete&&im.naturalWidth){
    const frame=a.id==='player'&&moving?Math.floor(walk)%3:1;
    ctx.drawImage(im,sheet?frame*64:0,sheet&&a.id==='player'?facing*96:0,sheet?64:48,sheet?96:48,screenX-width/2,screenY-height+Math.round(8*S/32),width,height);
   }
   if(!im){ctx.fillStyle='#f5d888';ctx.font='bold 24px monospace';ctx.textAlign='center';ctx.fillText('?',screenX,screenY);}
   if(a.name){
    const fontSize=Math.max(13,Math.round(13.5*density));
    ctx.font=`bold ${fontSize}px sans-serif`;ctx.textAlign='center';
    const textWidth=ctx.measureText?ctx.measureText(a.name).width:40;
    const paddingX=10*density;
    const labelWidth=textWidth+paddingX*2;
    const labelHeight=Math.max(20,Math.round(20*density));
    let labelY=screenY-height-labelHeight-2*density;
    const ratio=density;
    for(const id of ['hud','dialogue']){
     const overlay=$(id), rect=overlay?.getBoundingClientRect?.();
     if(!rect||overlay.hidden||!canvasRect)continue;
     const left=(rect.left-canvasRect.left)*ratio,right=(rect.right-canvasRect.left)*ratio;
     const top=(rect.top-canvasRect.top)*ratio,bottom=(rect.bottom-canvasRect.top)*ratio;
     if(screenX+labelWidth/2>left&&screenX-labelWidth/2<right&&labelY+labelHeight>top&&labelY<bottom)labelY=Math.max(screenY+16*density,bottom+4*density);
    }
    labelY=Math.min(canvas.height-labelHeight-2*density,labelY);
    ctx.fillStyle='rgba(6, 11, 19, 0.92)';
    ctx.fillRect(screenX-labelWidth/2,labelY,labelWidth,labelHeight);
    ctx.strokeStyle='#f5d888';
    ctx.lineWidth=Math.max(1,1.5*density);
    ctx.strokeRect(screenX-labelWidth/2,labelY,labelWidth,labelHeight);
    ctx.fillStyle='#ffffff';
    ctx.fillText(a.name,screenX,labelY+labelHeight*0.72);
   }
  }
  const front=backgroundImage(scene.foreground);
  if(front)ctx.drawImage(front,-camX,-camY,worldW,worldH);
  const exit=scene.exits.find(e=>{const [x,y,w,h]=e.rect;return player.x>=x&&player.x<x+w&&player.y>=y&&player.y<y+h;});
  if(!exit)exitLatch=null;
  if(exit&&exitLatch!==exit.direction&&!busy&&!pending){
   exitLatch=exit.direction;
   const action=snapshot.actions.find(a=>a.id==='mover'&&a.target===exit.direction);
   if(!action||action.disabled)notice(action?.reason||'Esta salida no está disponible ahora.');
   else void perform(action);
  }
 }else{ctx.fillStyle='#060b13';ctx.fillRect(0,0,canvas.width,canvas.height);}
}

async function refresh(allowBusy=false){
 if(refreshing||(!allowBusy&&busy)||(snapshot&&typeof document!=='undefined'&&document.hidden))return;
 refreshing=true;const version=mutationVersion;
 try{const next=await api('/api/state');if(version===mutationVersion&&(allowBusy||!busy))await apply(next,version);}
 catch(e){if(version===mutationVersion&&(allowBusy||!busy))notice(e.message);}
 finally{refreshing=false;render();}
}
const pollDelay=()=>snapshot?.character?.combat?250:(viewMode==='game'?4000:8000);
function schedulePoll(delay=pollDelay()){
 if(polling){pollAgain=true;return;}
 clearTimeout(pollTimer);pollTimer=setTimeout(poll,delay);
}
async function poll(){
 if(polling)return;
 clearTimeout(pollTimer);pollTimer=null;polling=true;
 try{await refresh();}
 finally{polling=false;const delay=pollAgain?0:pollDelay();pollAgain=false;schedulePoll(delay);}
}
void poll();
setInterval(()=>{if(typeof document!=='undefined'&&!document.hidden&&viewMode==='game'&&!$('world-view')?.hidden)draw(performance.now());},33);
