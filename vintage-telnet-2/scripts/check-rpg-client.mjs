// Small contract check: execute the shipped client with a DOM/fetch boundary stub.
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const element=()=>({hidden:true,dataset:{},classList:{add(){},remove(){},toggle(){}},append(){},replaceChildren(){},addEventListener(){},getContext(){return {};},querySelector(){return null;},querySelectorAll(){return [];}});
const nodes=new Map();const requests=[];
const context=vm.createContext({console,performance:{now:()=>0},matchMedia:()=>({matches:true}),Image:class{},setInterval(){},setTimeout(){},clearTimeout(){},fetch:async(path,options)=>{if(options?.body)requests.push(JSON.parse(options.body));return {ok:true,headers:{get:()=>null},json:async()=>JSON.parse(vm.runInContext('JSON.stringify(snapshot)',context))};},document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},createElement:element,querySelectorAll:()=>[],addEventListener(){},body:element()},window:{addEventListener(){},confirm:()=>true}});
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

// Background variant contract: background_actions chooses variant only when action is offered, fallback to base.
vm.runInContext(`
scene.background = 'backgrounds/edran_canal_repisa.webp';
scene.background_actions = {'edran_recoger_caja': 'backgrounds/edran_canal_repisa_caja.webp'};
backgrounds['backgrounds/edran_canal_repisa.webp'] = {complete: true, naturalWidth: 1280};
backgrounds['backgrounds/edran_canal_repisa_caja.webp'] = {complete: true, naturalWidth: 1280};
`, context);

// 1. Presencia: action offered in snapshot.actions selects variant
vm.runInContext(`snapshot.actions = [{id: 'edran_recoger_caja', label: 'Recoger caja'}]; draws = []; draw(1040);`, context);
assert.equal(vm.runInContext('draws[0][0] === backgrounds["backgrounds/edran_canal_repisa_caja.webp"]', context), true, 'Offered action selects variant background');
assert.equal(vm.runInContext('sceneBackgroundImage(scene) === backgrounds["backgrounds/edran_canal_repisa_caja.webp"]', context), true, 'sceneBackgroundImage helper returns variant');

// 2. Disabled: action present but disabled still selects variant (must not infer presence from enabled)
vm.runInContext(`snapshot.actions = [{id: 'edran_recoger_caja', label: 'Recoger caja', disabled: true}]; draws = []; draw(1050);`, context);
assert.equal(vm.runInContext('draws[0][0] === backgrounds["backgrounds/edran_canal_repisa_caja.webp"]', context), true, 'Disabled action still selects variant background');
assert.equal(vm.runInContext('sceneBackgroundImage(scene) === backgrounds["backgrounds/edran_canal_repisa_caja.webp"]', context), true);

// 3. Ausencia: other actions offered, but not edran_recoger_caja -> base background
vm.runInContext(`snapshot.actions = [{id: 'mirar', label: 'Mirar repisa'}]; draws = []; draw(1060);`, context);
assert.equal(vm.runInContext('draws[0][0] === backgrounds["backgrounds/edran_canal_repisa.webp"]', context), true, 'Absence of target action selects base background');
assert.equal(vm.runInContext('sceneBackgroundImage(scene) === backgrounds["backgrounds/edran_canal_repisa.webp"]', context), true);

// 4. Sin snapshot acciones: empty actions must not reveal variant (e.g. box already collected)
vm.runInContext(`snapshot.actions = []; draws = []; draw(1070);`, context);
assert.equal(vm.runInContext('draws[0][0] === backgrounds["backgrounds/edran_canal_repisa.webp"]', context), true, 'Empty actions does not reveal variant box');
assert.equal(vm.runInContext('sceneBackgroundImage(scene) === backgrounds["backgrounds/edran_canal_repisa.webp"]', context), true);

// 5. Fallback a base mientras variante carga o falla
vm.runInContext(`
snapshot.actions = [{id: 'edran_recoger_caja'}];
backgrounds['backgrounds/edran_canal_repisa_caja.webp'].complete = false;
draws = []; draw(1080);
`, context);
assert.equal(vm.runInContext('draws[0][0] === backgrounds["backgrounds/edran_canal_repisa.webp"]', context), true, 'Variant not yet loaded falls back to base background');
assert.equal(vm.runInContext('sceneBackgroundImage(scene) === backgrounds["backgrounds/edran_canal_repisa.webp"]', context), true);
vm.runInContext(`backgrounds['backgrounds/edran_canal_repisa_caja.webp'].complete = true;`, context);

// 6. Escena sin campo background_actions mantiene comportamiento base
vm.runInContext(`delete scene.background_actions; snapshot.actions = [{id: 'edran_recoger_caja'}]; draws = []; draw(1090);`, context);
assert.equal(vm.runInContext('draws[0][0] === backgrounds["backgrounds/edran_canal_repisa.webp"]', context), true, 'Scene without background_actions maintains base background');
assert.equal(vm.runInContext('sceneBackgroundImage(scene) === backgrounds["backgrounds/edran_canal_repisa.webp"]', context), true);

// 7. Whitelist local: variant path outside whitelist is rejected and falls back to base
vm.runInContext(`
scene.background_actions = {'edran_recoger_caja': '../malicious.webp'};
draws = []; draw(1100);
`, context);
assert.equal(vm.runInContext('draws[0][0] === backgrounds["backgrounds/edran_canal_repisa.webp"]', context), true, 'Unwhitelisted variant path falls back to base');
vm.runInContext(`delete scene.background_actions;`, context);

// 8. Minimap also uses sceneBackgroundImage selector
nodes.get('minimap-canvas').getContext = () => ({fillRect(){}, drawImage:(...args)=>vm.runInContext(`mDraws.push(args)`, Object.assign(context, {args})), beginPath(){}, arc(){}, fill(){}, stroke(){}});
vm.runInContext(`
scene.background_actions = {'edran_recoger_caja': 'backgrounds/edran_canal_repisa_caja.webp'};
snapshot.actions = [{id: 'edran_recoger_caja'}];
var mDraws = [];
drawMinimap();
`, context);
assert.equal(vm.runInContext('mDraws[0][0] === backgrounds["backgrounds/edran_canal_repisa_caja.webp"]', context), true, 'Minimap uses matching variant');
vm.runInContext(`delete scene.background_actions; snapshot.actions = [];`, context);
nodes.get('minimap-canvas').getContext = () => ({});
console.log('RPG background variants: presence, absence, disabled action, fallback, no field and minimap OK');
// Scene placement must not reveal NPCs unless the authoritative room includes them.
vm.runInContext(`
scene.npcs=[
 {id:'edran_bren',at:[6,8]},
 {id:'edran_daro',at:[12,6]},
 {id:'edran_iria',at:[10,5]},
 {id:'edran_elva',at:[5,5]},
 {id:'edran_sena',at:[10,6]},
 {id:'edran_nela',at:[8,6]},
 {id:'edran_oren',at:[7,7]}
];
snapshot.room.npcs=[];
`,context);
assert.equal(vm.runInContext('entities().length',context),0);
const expectedNpcSprites={
 edran_bren:'bren',
 edran_daro:'daro',
 edran_iria:'iria',
 edran_elva:'elva',
 edran_sena:'sena',
 edran_nela:'nela',
 edran_oren:'oren',
 edran_aren:'aren'
};
for(const [id,sprite] of Object.entries(expectedNpcSprites)){
 vm.runInContext(`snapshot.room.npcs=[{id:'${id}'}];`,context);
 assert.equal(vm.runInContext('entities()[0].sprite',context),sprite,`${id} maps to sprite ${sprite}`);
 assert.equal(vm.runInContext(`images.${sprite}.src`,context),`/client-rpg/sprites/${sprite}.png`,`${sprite} preloads correct src`);
 vm.runInContext(`images.${sprite}.complete=true;images.${sprite}.naturalWidth=192;draws=[];draw(1066);`,context);
 assert.equal(vm.runInContext(`draws.some(a=>a[0]===images.${sprite}&&a[1]===64&&a[3]===64&&a[4]===96)`,context),true,`${sprite} uses full middle frame of 64×96 atlas`);
}
// Unmapped NPCs without dedicated art fall back to Lina.
vm.runInContext(`snapshot.room.npcs=[{id:'edran_otro'}];`,context);
assert.equal(vm.runInContext('entities()[0].sprite',context),'lina','NPC without art falls back to Lina');
for(const sprite of Object.values(expectedNpcSprites)){
 const atlas=fs.readFileSync(new URL(`../client-rpg/sprites/${sprite}.png`,import.meta.url));
 assert.equal(atlas.readUInt32BE(16),192,`${sprite} atlas width`);
 assert.equal(atlas.readUInt32BE(20),384,`${sprite} atlas height`);
}
vm.runInContext('snapshot.room.npcs=[]',context);
assert.equal(vm.runInContext('entities().length',context),0,'Aren artwork alone must not reveal NPC');
console.log('RPG NPCs: authoritative presence, dedicated map (Bren+4, Nela, Oren, Aren), Lina fallback, preloading and 64×96 atlas OK');
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
// Reviewed image footprints: reachability alone must not allow crossing furniture.
for(const [id,points] of Object.entries({
 valdren_cuidado:[[5.5,4.5],[10.5,4.5]],
 valdren_casa_semillas:[[5.5,4.5],[8.5,6.5],[13.5,6.5]],
 valdren_calle_alta:[[5.5,8.5]],
 valdren_fragua:[[4.7,7.5],[5.5,8.5],[9.5,4.5]],
 valdren_patio_ropa:[[15.5,6.5]],
 valdren_comedor:[[10.5,11.5]]
})){
 context.testMap=maps.find(([rid])=>rid===id)[1];vm.runInContext('scene=testMap',context);
 for(const [x,y] of points)assert.equal(vm.runInContext(`blocked(${x},${y})`,context),true,`${id}: reviewed obstacle at ${x},${y}`);
}
context.testMap=maps.find(([id])=>id==='valdren_calle_alta')[1];
vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(5.5,6.5)',context),false,'Painted west branch stays open');
context.testMap=maps.find(([id])=>id==='valdren_cuidado')[1];
assert.equal(vm.runInContext('testMap.exits.some(e=>{const[x,y,w,h]=e.rect;return e.direction==="este"&&16.5>=x&&16.5<x+w&&5.5>=y&&5.5<y+h;})',context),true,'Care room exit follows the actual interior doorway');
console.log('RPG Valdren geometry: furniture, west branch and interior doorway regressions OK');
context.testMap=maps.find(([id])=>id==='valdren_cobertizo')[1];
vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(6.5,5.5)',context),true,'Avatar cannot occupy the cobertizo support post');
assert.equal(vm.runInContext('blocked(6,8)',context),false,'Bren remains on clear floor outside the turning rope');
// Graneros has no north door: the former integer spawn touched its closed wall.
vm.runInContext("scene=generic({exits:[{direction:'oeste'},{direction:'este'}]})",context);
assert.equal(vm.runInContext('blocked(10,1)',context),true,'Reproduce former north-arrival overlap');
assert.equal(vm.runInContext("blocked(...spawnPosition(scene,'norte'))",context),false);
assert.equal(vm.runInContext("blocked(spawnPosition(scene,'norte')[0],spawnPosition(scene,'norte')[1]+.16)",context),false,'First downward frame can leave arrival cell');
console.log('RPG regression: asymmetric Huertos→Graneros arrival can move immediately OK');

// Edran Norte geometry regressions: obstacles, waterways, and open passages
for(const [id,points] of Object.entries({
 edran_terraplen:[[6.5,6.5],[7.5,6.5],[6.5,7.5],[7.5,7.5],[2.5,4.5],[17.5,4.5]],
 edran_casa_camino:[[2.5,2.5],[14.5,4.5],[16.5,6.5],[6.5,13.5]],
 edran_hito_campos:[[8.5,3.5],[12.5,3.5],[6.5,7.5],[12.5,6.5],[13.5,6.5],[14.5,6.5]],
 edran_vista_cuenca:[[10.5,2.5],[10.5,12.5],[0.5,7.5],[19.5,7.5]]
})){
 context.testMap=maps.find(([rid])=>rid===id)[1];vm.runInContext('scene=testMap',context);
 for(const [x,y] of points)assert.equal(vm.runInContext(`blocked(${x},${y})`,context),true,`${id}: reviewed obstacle at ${x},${y}`);
}
context.testMap=maps.find(([id])=>id==='edran_casa_camino')[1];
vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(10.5,8.5)',context),false,'Casa del camino central step remains open');
assert.equal(vm.runInContext('blocked(14.5,7.5)',context),false,'Aren position on raised floor remains open');
assert.equal(vm.runInContext('blocked(8.5,6.5)',context),false,'Low wooden step connects left floor to central aisle');
assert.equal(vm.runInContext('blocked(13.5,10.5)',context),false,'Lower stone floor on the right remains accessible');
context.testMap=maps.find(([id])=>id==='edran_hito_campos')[1];
vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(10.5,3.5)',context),false,'Bridge crossing remains open');
context.testMap=maps.find(([id])=>id==='edran_vista_cuenca')[1];
vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(1.5,8.5)',context),false,'Mirador west corridor remains open');
assert.equal(vm.runInContext('blocked(18.5,8.5)',context),false,'Mirador east corridor remains open');
console.log('RPG Edran Norte geometry: furniture, bridge slabs, cliff and corridors OK');

// Edran Restante geometry regressions: obstacles, waterways, dry decks and open corridors
for(const [id,points] of Object.entries({
 edran_loma:[[14.5,2.5],[16.5,3.5],[1.5,5.5],[15.5,12.5]],
 edran_prado:[[10.5,0.5],[18.5,4.5],[1.5,12.5]],
 edran_ladera_piedra:[[5.5,2.5],[5.5,6.5],[5.5,9.5],[6.5,10.5],[10.5,13.5]],
 edran_linde_piedra:[[6.5,6.5],[1.5,7.5],[18.5,7.5]],
 edran_sendero_juncos:[[10.5,1.5],[10.5,12.5]],
 edran_puente_juncos:[[10.5,1.5],[10.5,6.5],[14.5,10.5]]
})){
 context.testMap=maps.find(([rid])=>rid===id)[1];vm.runInContext('scene=testMap',context);
 for(const [x,y] of points)assert.equal(vm.runInContext(`blocked(${x},${y})`,context),true,`${id}: reviewed obstacle at ${x},${y}`);
}
context.testMap=maps.find(([id])=>id==='edran_loma')[1];
vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(6.5,1.5)',context),false,'Loma north route remains open');
assert.equal(vm.runInContext('blocked(18.5,8.5)',context),false,'Loma east route remains open');
assert.equal(vm.runInContext('blocked(9.5,13.5)',context),false,'Loma south route remains open');
context.testMap=maps.find(([id])=>id==='edran_prado')[1];
vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(12.5,5.5)',context),false,'Prado flattened circle ground remains open for Cornalomo');
assert.equal(vm.runInContext('blocked(1.5,5.5)',context),false,'Prado west stone path remains open');
context.testMap=maps.find(([id])=>id==='edran_ladera_piedra')[1];
vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(9.5,1.5)',context),false,'Ladera north path remains open');
assert.equal(vm.runInContext('blocked(18.5,8.5)',context),false,'Ladera east path remains open');
context.testMap=maps.find(([id])=>id==='edran_linde_piedra')[1];
vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(10.5,7.5)',context),false,'Linde clearing remains accessible around supports');
assert.equal(vm.runInContext('blocked(10.5,1.5)',context),false,'Linde north rock pass remains open');
context.testMap=maps.find(([id])=>id==='edran_sendero_juncos')[1];
vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(10.5,7.5)',context),false,'Sendero wide dry central clearing remains open');
assert.equal(vm.runInContext('blocked(1.5,6.5)',context),false,'Sendero west path remains open');
assert.equal(vm.runInContext('blocked(18.5,6.5)',context),false,'Sendero east path remains open');
context.testMap=maps.find(([id])=>id==='edran_puente_juncos')[1];
vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(10.5,4.5)',context),false,'Bridge deck allows crossing the river');
assert.equal(vm.runInContext('blocked(17.5,5.5)',context),false,'Raised eastern riverbank remains open for Veterana');
assert.equal(vm.runInContext('blocked(8.5,13.5)',context),false,'Western riverbank path down to Sauces remains dry');
console.log('RPG Edran Restante geometry: panorama, circle, ledges, supports, reeds and bridge deck OK');


// Independent artwork review: previously walkable rocks, supports, bank and reeds.
context.testMap=maps.find(([id])=>id==='edran_loma')[1];vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(10.5,8.5)',context),false,'edran_loma: reviewed free cell 10,8');
assert.equal(vm.runInContext('blocked(18.5,8.5)',context),false,'edran_loma: reviewed free cell 18,8');
assert.equal(vm.runInContext('blocked(6.5,1.5)',context),false,'edran_loma: reviewed free cell 6,1');
assert.equal(vm.runInContext('blocked(16.5,7.5)',context),true,'edran_loma: reviewed blocked cell 16,7');
assert.equal(vm.runInContext('blocked(17.5,9.5)',context),true,'edran_loma: reviewed blocked cell 17,9');
assert.equal(vm.runInContext('blocked(10.5,10.5)',context),true,'edran_loma: reviewed blocked cell 10,10');
context.testMap=maps.find(([id])=>id==='edran_prado')[1];vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(12.5,5.5)',context),false,'edran_prado: reviewed free cell 12,5');
assert.equal(vm.runInContext('blocked(5.5,6.5)',context),false,'edran_prado: reviewed free cell 5,6');
assert.equal(vm.runInContext('blocked(8.5,9.5)',context),false,'edran_prado: reviewed free cell 8,9');
assert.equal(vm.runInContext('blocked(10.5,2.5)',context),true,'edran_prado: reviewed blocked cell 10,2');
assert.equal(vm.runInContext('blocked(4.5,3.5)',context),true,'edran_prado: reviewed blocked cell 4,3');
context.testMap=maps.find(([id])=>id==='edran_ladera_piedra')[1];vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(9.5,4.5)',context),false,'edran_ladera_piedra: reviewed free cell 9,4');
assert.equal(vm.runInContext('blocked(10.5,5.5)',context),false,'edran_ladera_piedra: reviewed free cell 10,5');
assert.equal(vm.runInContext('blocked(18.5,8.5)',context),false,'edran_ladera_piedra: reviewed free cell 18,8');
assert.equal(vm.runInContext('blocked(13.5,4.5)',context),true,'edran_ladera_piedra: reviewed blocked cell 13,4');
assert.equal(vm.runInContext('blocked(7.5,6.5)',context),true,'edran_ladera_piedra: reviewed blocked cell 7,6');
assert.equal(vm.runInContext('blocked(5.5,8.5)',context),true,'edran_ladera_piedra: reviewed blocked cell 5,8');
context.testMap=maps.find(([id])=>id==='edran_linde_piedra')[1];vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(10.5,5.5)',context),false,'edran_linde_piedra: reviewed free cell 10,5');
assert.equal(vm.runInContext('blocked(10.5,8.5)',context),false,'edran_linde_piedra: reviewed free cell 10,8');
assert.equal(vm.runInContext('blocked(6.5,5.5)',context),true,'edran_linde_piedra: reviewed blocked cell 6,5');
assert.equal(vm.runInContext('blocked(7.5,5.5)',context),true,'edran_linde_piedra: reviewed blocked cell 7,5');
context.testMap=maps.find(([id])=>id==='edran_puente_juncos')[1];vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(10.5,4.5)',context),false,'edran_puente_juncos: reviewed free cell 10,4');
assert.equal(vm.runInContext('blocked(10.5,5.5)',context),false,'edran_puente_juncos: reviewed free cell 10,5');
assert.equal(vm.runInContext('blocked(8.5,10.5)',context),false,'edran_puente_juncos: reviewed free cell 8,10');
assert.equal(vm.runInContext('blocked(8.5,13.5)',context),false,'edran_puente_juncos: reviewed free cell 8,13');
assert.equal(vm.runInContext('blocked(17.5,6.5)',context),true,'edran_puente_juncos: reviewed blocked cell 17,6');
assert.equal(vm.runInContext('blocked(5.5,10.5)',context),true,'edran_puente_juncos: reviewed blocked cell 5,10');
assert.equal(vm.runInContext('blocked(10.5,6.5)',context),true,'edran_puente_juncos: reviewed blocked cell 10,6');
context.testMap=maps.find(([id])=>id==='edran_sendero_juncos')[1];vm.runInContext('scene=testMap',context);
assert.equal(vm.runInContext('blocked(1.5,6.5)',context),false,'edran_sendero_juncos: reviewed free cell 1,6');
assert.equal(vm.runInContext('blocked(18.5,6.5)',context),false,'edran_sendero_juncos: reviewed free cell 18,6');
assert.equal(vm.runInContext('blocked(10.5,7.5)',context),false,'edran_sendero_juncos: reviewed free cell 10,7');
assert.equal(vm.runInContext('blocked(7.5,4.5)',context),true,'edran_sendero_juncos: reviewed blocked cell 7,4');
assert.equal(vm.runInContext('blocked(1.5,7.5)',context),true,'edran_sendero_juncos: reviewed blocked cell 1,7');
assert.equal(vm.runInContext('blocked(19.5,7.5)',context),true,'edran_sendero_juncos: reviewed blocked cell 19,7');
// Refresh busy state without rebuilding preserved entry fields (autofill has no input event).
const entrySubmit={disabled:true};
nodes.set('entry',element());
nodes.get('entry').querySelectorAll=()=>[entrySubmit];
vm.runInContext(`snapshot={authenticated:false};busy=true;entryKey=entryState();entryRender();`,context);
assert.equal(entrySubmit.disabled,true);
vm.runInContext('busy=false;entryRender()',context);
assert.equal(entrySubmit.disabled,false,'Entry button must unlock after request completes');
console.log('RPG entry: preserved form busy state unlocks without input events OK');

// Known artwork only presents creatures that the server actually offers or is fighting.
vm.runInContext(`
scene={size:[20,15],npcs:[],creatures:[]};animation=null;
snapshot={character:{name:'QA',level:1,hp:100,hp_max:100,combat:null},room:{npcs:[]},actions:[]};
Object.assign(ctx,{strokeRect(){}});
`,context);
for(const [id,sprite] of [['espinajo_rastrojo','espinajo'],['mordelinde','mordelinde'],['cornalomo','cornalomo'],['salteador_veterano','salteador'],['forajido_camino','forajido'],['salteadora_negociante','negociante'],['salteador_bravucon','bravucon']]){
 context.creatureId=id;
 assert.equal(vm.runInContext('entities().length',context),0,'Artwork alone must not reveal a creature');
 vm.runInContext(`snapshot.actions=[{id:'combatir',target:creatureId}];`,context);
 assert.equal(vm.runInContext('entities()[0].sprite',context),sprite);
 assert.equal(vm.runInContext(`images['${sprite}'].src`,context),`/client-rpg/sprites/${sprite}.png`);
 assert.equal(vm.runInContext(`images['${sprite}-battle'].src`,context),`/client-rpg/sprites/${sprite}-battle.png`);
 for(const [suffix,dimension] of [['',48],['-battle',192]]){
  const fileUrl=new URL(`../client-rpg/sprites/${sprite}${suffix}.png`,import.meta.url);
  const png=fs.readFileSync(fileUrl);
  assert.equal(png.readUInt32BE(16),dimension,'Sprite width must match render frame');
  assert.equal(png.readUInt32BE(20),dimension,'Sprite height must match render frame');
 }
 context.battleSprite=sprite+'-battle';
 vm.runInContext(`
images[battleSprite].complete=true;images[battleSprite].naturalWidth=192;
snapshot.character.combat={creature:creatureId,name:creatureId,round:0,hp:40,hp_max:40,next_round:0};
snapshot.actions=[];
draws=[];battleDraw(1000);
`,context);
 assert.equal(vm.runInContext('entities()[0].sprite',context),sprite,'Active combat still presents the creature without encounter actions');
 assert.equal(vm.runInContext('draws.some(args=>args[0]===images[battleSprite])',context),true,'Battle draws the matching creature artwork');
 vm.runInContext('snapshot.actions=[];snapshot.character.combat=null;',context);
}
vm.runInContext("snapshot.actions=[{id:'combatir',target:'unknown_creature'}]",context);
assert.equal(vm.runInContext('entities()[0].sprite',context),null,'Unmapped creatures retain the existing fallback');
console.log('RPG creature artwork: server visibility, map/battle mapping, frame sizes and unknown fallback OK');

// Verification: getCamera in portrait (mobile 390×844) and desktop (1366×768)
// Check corners (0,0), (19,0), (0,14), (19,14) and center (10,7), aspect proportion, and actor screen position within viewport.
for(const [cw,ch] of [[390,844],[780,1688],[1366,768],[2732,1536]]){
 for(const [ax,ay] of [[0.5,0.5],[19.5,0.5],[0.5,14.5],[19.5,14.5],[10,7]]){
  context.tCw=cw;context.tCh=ch;context.tAx=ax;context.tAy=ay;
  const cam=vm.runInContext('getCamera(tCw,tCh,20,15,tAx,tAy)',context);
  assert.ok(cam.S>=cw/20&&cam.S>=ch/15,'World scale must cover viewport dimension without distortion');
  assert.equal(cam.worldW,20*cam.S);
  assert.equal(cam.worldH,15*cam.S);
  const sx=ax*cam.S-cam.camX;
  const sy=ay*cam.S-cam.camY;
  assert.ok(sx>=0&&sx<=cw,`Actor X=${ax} on screen ${sx} must stay inside horizontal viewport [0, ${cw}]`);
  assert.ok(sy>=0&&sy<=ch,`Actor Y=${ay} on screen ${sy} must stay inside vertical viewport [0, ${ch}]`);
 }
}
console.log('RPG camera: portrait and desktop corners, proportions and actor inside viewport OK');

// Verification: battle layout in DPR1 and DPR2 (portrait mobile and landscape desktop)
// Verifies enemy and avatar rectangles remain visible and within canvas bounds.
for(const [cw,ch] of [[390,844],[780,1688],[1366,768],[2732,1536]]){
 context.tCw=cw;context.tCh=ch;
 const layout=vm.runInContext('getBattleLayout(tCw,tCh)',context);
 for(const key of ['enemy','avatar']){
  const r=layout[key];
  assert.ok(r.w>0&&r.h>0,`Battle ${key} must have positive dimensions`);
  assert.ok(r.x>=0&&r.x+r.w<=cw,`Battle ${key} X [${r.x}, ${r.x+r.w}] must stay inside canvas width ${cw}`);
  assert.ok(r.y>=0&&r.y+r.h<=ch,`Battle ${key} Y [${r.y}, ${r.y+r.h}] must stay inside canvas height ${ch}`);
 }
}
console.log('RPG battle layout: DPR1/DPR2 portrait and desktop rects visible inside viewport OK');

// Battle background contract: optional scene battle_background overrides regional fallback;
// loading state shows neutral background (never regional forest); absence preserves regional/legacy; whitelist rejects invalid paths.
vm.runInContext(`
canvas.width = 640; canvas.height = 480;
draws = []; fills = [];
snapshot.character = {combat: {creature: 'forajido_camino', name: 'Forajido · nivel 3', hp: 30, hp_max: 30, round: 1}};
snapshot.room = {region: 'edran'};
scene = {battle_background: 'backgrounds/edran_canal_battle.webp'};
backgrounds['backgrounds/edran_canal_battle.webp'] = {complete: true, naturalWidth: 1280, naturalHeight: 720};
backgrounds['backgrounds/ui_battle.webp'] = {complete: true, naturalWidth: 1280, naturalHeight: 720};
backgrounds['backgrounds/edran_battle.webp'] = {complete: true, naturalWidth: 1280, naturalHeight: 720};
`, context);

// 1. Prioridad override: battle_background presente y cargado tiene prioridad sobre ui_battle
assert.equal(vm.runInContext('battleBackgroundImage(scene) === backgrounds["backgrounds/edran_canal_battle.webp"]', context), true, 'battleBackgroundImage helper returns battle_background override');
assert.equal(vm.runInContext('battleBackgroundImage() === backgrounds["backgrounds/edran_canal_battle.webp"]', context), true, 'battleBackgroundImage defaults to current scene');
vm.runInContext(`draws = []; fills = []; battleDraw(1000);`, context);
assert.equal(vm.runInContext('draws[0][0] === backgrounds["backgrounds/edran_canal_battle.webp"]', context), true, 'battleDraw renders battle_background override');

// 2. Override cargando sin consultar bosque: devuelve null y dibuja fondo neutro (nunca ui_battle)
vm.runInContext(`
backgrounds['backgrounds/edran_canal_battle.webp'].complete = false;
draws = []; fills = [];
`, context);
assert.equal(vm.runInContext('battleBackgroundImage(scene)', context), null, 'Loading battle_background returns null exclusively');
vm.runInContext(`battleDraw(1010);`, context);
assert.equal(vm.runInContext('draws.some(args => args[0] === backgrounds["backgrounds/ui_battle.webp"])', context), false, 'Interior with loading battle_background must NEVER draw regional forest');
assert.equal(vm.runInContext('fills.some(args => args[0] === 0 && args[1] === 0 && args[2] === 640 && args[3] === 480)', context), true, 'Neutral background fill is used when battle_background is loading');

// 3. Ausencia de campo: fallback regional (ui_battle para edran) y legado (edran_battle)
vm.runInContext(`
delete scene.battle_background;
backgrounds['backgrounds/edran_canal_battle.webp'].complete = true;
snapshot.room = {region: 'edran'};
draws = []; fills = [];
`, context);
assert.equal(vm.runInContext('battleBackgroundImage(scene) === backgrounds["backgrounds/ui_battle.webp"]', context), true, 'Absence with edran region uses ui_battle.webp');
vm.runInContext(`battleDraw(1020);`, context);
assert.equal(vm.runInContext('draws[0][0] === backgrounds["backgrounds/ui_battle.webp"]', context), true, 'battleDraw uses regional ui_battle in edran');

// 3b. Región distinta a edran preserva fallback edran_battle legado
vm.runInContext(`
snapshot.room = {region: 'valdren'};
draws = []; fills = [];
`, context);
assert.equal(vm.runInContext('battleBackgroundImage(scene) === backgrounds["backgrounds/edran_battle.webp"]', context), true, 'Absence with non-edran region uses edran_battle.webp');
vm.runInContext(`battleDraw(1030);`, context);
assert.equal(vm.runInContext('draws[0][0] === backgrounds["backgrounds/edran_battle.webp"]', context), true, 'battleDraw uses legacy edran_battle for non-edran');

// 4. Whitelist: rutas con traversal, URL o tipos no string son rechazadas y devuelven null (no fallback bosque)
for (const invalid of ['../malicious.webp', 'https://evil.com/bg.webp', '/client-rpg/backgrounds/bg.webp', 'backgrounds/invalid.png', 123, {}, null, undefined]) {
 context.invalidPath = invalid;
 vm.runInContext(`scene.battle_background = invalidPath; draws = []; fills = [];`, context);
 assert.equal(vm.runInContext('battleBackgroundImage(scene)', context), null, `Invalid path rejected: ${invalid}`);
 vm.runInContext(`battleDraw(1040);`, context);
 assert.equal(vm.runInContext('draws.some(args => args[0] === backgrounds["backgrounds/ui_battle.webp"])', context), false, 'Invalid battle_background must not fallback to forest');
}
vm.runInContext(`delete scene.battle_background; snapshot.character.combat = null;`, context);
console.log('RPG battle background: override priority, loading neutral, regional/legacy fallback and whitelist OK');

// Returning from the welcome screen keeps the same room and character IDs.
// It must still load a scene before movement and action navigation can render.
await vm.runInContext(`(async()=>{
 const savedFetch=fetch;
 try{
  fetch=async()=>({ok:false});
  snapshot={authenticated:true,character:{id:1,status:'approved',hp:100,hp_max:100,xp:0,combat:null},room:{id:'edran_surcos',exits:[{direction:'sur'}],npcs:[]},actions:[],narrative:[]};
  scene=null;viewMode='welcome';
  await apply(snapshot);
  viewMode='game';
  await apply(snapshot);
 }finally{fetch=savedFetch;}
})()`,context);
assert.equal(vm.runInContext('scene.size.join(",")',context),'20,15');
assert.equal(vm.runInContext('scene.exits[0].direction',context),'sur');
assert.equal(vm.runInContext('blocked(player.x,player.y)',context),false);
console.log('RPG entry regression: Continue loads unchanged room before movement OK');

// Arrival must expose the entire avatar, rather than only its feet under the HUD.
for(const [cw,ch] of [[390,844],[1366,768]]){
 for(const id of ['edran_acequia','edran_salida_huertos','valdren_graneros']){
  const map=maps.find(([rid])=>rid===id)[1];context.testMap=map;context.tCw=cw;context.tCh=ch;
  const result=vm.runInContext(`(()=>{scene=testMap;const at=visibleSpawn(scene,'norte',tCw,tCh);const c=getCamera(tCw,tCh,...scene.size,...at);return {free:!blocked(...at),head:at[1]*c.S-c.camY-52*c.S/32,foot:at[1]*c.S-c.camY+8*c.S/32};})()`,context);
  assert.ok(result.free,`${id}: visible arrival remains walkable`);
  assert.ok(result.head>=ch*(ch>=cw?.24:.15),`${id}: avatar head clears top overlays`);
  assert.ok(result.foot<=ch*(ch>=cw?.75:.88),`${id}: avatar feet clear bottom controls`);
 }
}
console.log('RPG visible arrivals: full avatar clears HUD and controls in painted/generic rooms OK');

await vm.runInContext(`(async()=>{
 snapshot={...snapshot,account:{id:1,username:'server-account'},characters:[{id:1,name:'One',status:'approved'},{id:2,name:'Two',status:'approved'}]};
 const {account,characters,...actionResponse}=snapshot;
 await apply(actionResponse);
})()`,context);
assert.equal(vm.runInContext('snapshot.characters.length',context),2,'Gameplay response must preserve the server-provided character list');
assert.equal(vm.runInContext('snapshot.account.username',context),'server-account');
await vm.runInContext('apply({authenticated:false,characters:[]})',context);
assert.equal(vm.runInContext('snapshot.account',context),undefined,'Logout must clear account metadata');
assert.equal(vm.runInContext('snapshot.characters.length',context),0);
console.log('RPG account metadata: partial action responses preserve character selection; logout clears it OK');

await import("./check-rpg-network.mjs");
