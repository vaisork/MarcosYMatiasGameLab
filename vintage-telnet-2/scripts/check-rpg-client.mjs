// Small contract check: execute the shipped client with a DOM/fetch boundary stub.
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const element=()=>({hidden:true,dataset:{},classList:{add(){},toggle(){}},append(){},replaceChildren(){},addEventListener(){},getContext(){return {};},querySelector(){return null;},querySelectorAll(){return [];}});
const nodes=new Map();const requests=[];
const context=vm.createContext({console,performance:{now:()=>0},matchMedia:()=>({matches:true}),Image:class{},setInterval(){},setTimeout(){},fetch:async(path,options)=>{if(options?.body)requests.push(JSON.parse(options.body));return {ok:true,headers:{get:()=>null},json:async()=>JSON.parse(vm.runInContext('JSON.stringify(snapshot)',context))};},document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},createElement:element,querySelectorAll:()=>[],addEventListener(){},body:element()},window:{addEventListener(){},confirm:()=>true}});
const source=fs.readFileSync(new URL('../client-rpg/rpg.js',import.meta.url),'utf8').replace('void poll();','');
vm.runInContext(source,context);
vm.runInContext("var entryRender=render",context);
await vm.runInContext(`
render=()=>{};
snapshot={authenticated:true,character:{id:1,status:'approved',hp:100,hp_max:100,xp:0,combat:{creature:'espinajo_rastrojo',round:0,hp:40,hp_max:40}},room:{id:'edran_surcos'},actions:[{id:'atacar',label:'Atacar'},{id:'defender',target:'resistir'},{id:'usar',target:'pocion',disabled:true}],narrative:[],inventory:[]};
scene={};
(async()=>{await perform({id:'inventada'});await perform(snapshot.actions[2]);await perform(snapshot.actions[1]);await perform(snapshot.actions[0]);})();`,context);
// Allow the async fetch/apply chain to complete.
await new Promise(resolve=>setImmediate(resolve));
assert.equal(requests.length,1,'Only an offered enabled action; lock prevents second choice');
assert.equal(requests[0].id,'defender');assert.equal(requests[0].target,'resistir');assert.ok(requests[0].request_id);
assert.equal(vm.runInContext('selectedRound',context),0,'Action response must not unlock same round');
vm.runInContext(`updatePresentation(snapshot,{...snapshot,character:{...snapshot.character,hp:93,combat:{...snapshot.character.combat,round:1,hp:34}}});`,context);
assert.equal(vm.runInContext('selectedRound',context),null);
assert.equal(vm.runInContext('animation.enemy',context),6);
assert.equal(vm.runInContext('animation.player',context),7);
vm.runInContext(`updatePresentation(snapshot,{...snapshot,character:{...snapshot.character,combat:null,xp:14},inventory:[{id:'fibra',name:'Fibra',quantity:1}]});`,context);
assert.equal(vm.runInContext('outcome.title',context),'Victoria');
assert.match(vm.runInContext('outcome.text',context),/14 XP.*Fibra ×1/);
console.log('RPG client: offered actions, disabled state, round lock, HP deltas and snapshot rewards OK');
// Render contract: cached full-room background, optional front after actors, tiles fallback.
vm.runInContext(`
outcome=null;animation=null;snapshot={character:{},room:{npcs:[]},actions:[]};
scene={size:[20,15],layers:{ground:Array(15).fill('g'.repeat(20)),solid:Array(15).fill('.'.repeat(20))},exits:[],npcs:[],creatures:[],background:'backgrounds/test.webp',foreground:'backgrounds/test-front.webp'};
canvas.width=640;canvas.height=480;
var draws=[],fills=[];
Object.assign(ctx,{drawImage:(...args)=>draws.push(args),fillRect:(...args)=>fills.push(args),beginPath(){},ellipse(){},fill(){},fillText(){}});
images.avatar.complete=true;images.avatar.naturalWidth=192;
backgrounds[scene.background]={complete:true,naturalWidth:1280};
backgrounds[scene.foreground]={complete:true,naturalWidth:1280};
draw(1000);
`,context);
assert.equal(vm.runInContext('draws[0][0]===backgrounds[scene.background]',context),true);
assert.equal(vm.runInContext('draws.at(-1)[0]===backgrounds[scene.foreground]',context),true);
assert.equal(vm.runInContext('draws[1][3]===64&&draws[1][4]===96',context),true,'Use the full 64×96 avatar frame');
vm.runInContext(`draws=[];fills=[];delete scene.background;delete scene.foreground;draw(1033);`,context);
assert.equal(vm.runInContext('fills.length',context),300,'Generic rooms retain all tile cells');
assert.equal(vm.runInContext("backgroundImage('../server/app.py')",context),null);
console.log('RPG drawing: background, foreground order, sprite frame, tile fallback and path restriction OK');
// Verify actual avatar collision geometry, not just point-cell flood fill.
const regionFiles=fs.readdirSync(new URL('../content/regions/',import.meta.url)).filter(f=>f.endsWith('.json'));
const rooms=Object.assign({},...regionFiles.map(f=>JSON.parse(fs.readFileSync(new URL('../content/regions/'+f,import.meta.url))).rooms||{}));
const maps=[];
for(const file of fs.readdirSync(new URL('../client-rpg/scenes/',import.meta.url))){
 const map=JSON.parse(fs.readFileSync(new URL('../client-rpg/scenes/'+file,import.meta.url)));
 maps.push([map.room,map]);
}
for(const room of Object.values(rooms)){
 const input={...room,exits:Object.keys(room.exits||{}).map(direction=>({direction}))};
 context.testRoom=input;
 maps.push([room.id,vm.runInContext('generic(testRoom)',context)]);
}
for(const [id,map] of maps){
 context.testMap=map;vm.runInContext('scene=testMap',context);
 const free=(x,y)=>!vm.runInContext(`blocked(${x},${y})`,context);
 for(const [arrival,at] of Object.entries(map.spawn)){
  context.arrival=arrival;
  const start=vm.runInContext('spawnPosition(scene,arrival)',context);
  assert.ok(free(...start),`${id} ${arrival}: spawn overlaps wall`);
  const queue=[start],seen=new Set([start.join(',')]);
  for(let i=0;i<queue.length;i++)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const [x,y]=queue[i],next=[x+dx,y+dy],key=next.join(',');
   if(!seen.has(key)&&free(...next)){seen.add(key);queue.push(next);}
  }
  for(const exit of map.exits){
   const [x,y,w,h]=exit.rect;
   assert.ok(queue.some(([px,py])=>px>=x&&px<x+w&&py>=y&&py<y+h),`${id} ${arrival}: unreachable ${exit.direction}`);
  }
 }
}
console.log(`RPG navigation: ${maps.length} painted/generated maps, every spawn and exit reachable with avatar bounds OK`);
// Graneros has no north door: the former integer spawn touched its closed wall.
vm.runInContext("scene=generic({exits:[{direction:'oeste'},{direction:'este'}]})",context);
assert.equal(vm.runInContext('blocked(10,1)',context),true,'Reproduce former north-arrival overlap');
assert.equal(vm.runInContext("blocked(...spawnPosition(scene,'norte'))",context),false);
assert.equal(vm.runInContext("blocked(spawnPosition(scene,'norte')[0],spawnPosition(scene,'norte')[1]+.16)",context),false,'First downward frame can leave arrival cell');
console.log('RPG regression: asymmetric Huertos→Graneros arrival can move immediately OK');

// Refresh busy state without rebuilding preserved entry fields (autofill has no input event).
const entrySubmit={disabled:true};
nodes.set('entry',element());
nodes.get('entry').querySelectorAll=()=>[entrySubmit];
vm.runInContext(`snapshot={authenticated:false};busy=true;entryKey=entryState();entryRender();`,context);
assert.equal(entrySubmit.disabled,true);
vm.runInContext('busy=false;entryRender()',context);
assert.equal(entrySubmit.disabled,false,'Entry button must unlock after request completes');
console.log('RPG entry: preserved form busy state unlocks without input events OK');
