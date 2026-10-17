// Small contract check: execute the shipped client with a DOM/fetch boundary stub.
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const element=()=>({hidden:true,dataset:{},classList:{add(){},toggle(){}},append(){},replaceChildren(){},addEventListener(){},getContext(){return {};},querySelector(){return null;},querySelectorAll(){return [];}});
const nodes=new Map();const requests=[];
const context=vm.createContext({console,performance:{now:()=>0},matchMedia:()=>({matches:true}),Image:class{},setInterval(){},setTimeout(){},fetch:async(path,options)=>{if(options?.body)requests.push(JSON.parse(options.body));return {ok:true,headers:{get:()=>null},json:async()=>JSON.parse(vm.runInContext('JSON.stringify(snapshot)',context))};},document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},createElement:element,querySelectorAll:()=>[],addEventListener(){},body:element()},window:{addEventListener(){},confirm:()=>true}});
const source=fs.readFileSync(new URL('../client-rpg/rpg.js',import.meta.url),'utf8').replace('void poll();','');
vm.runInContext(source,context);
vm.runInContext("const clientRender=render;",context);
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

// Switching menus must never expose the previous category's target actions.
vm.runInContext(`
snapshot={authenticated:true,character:{status:'approved',name:'QA',level:1,hp:100,hp_max:100},room:{id:'qa',name:'QA',description:'QA',npcs:[{id:'lina',name:'Lina'}]},actions:[{id:'conversar',target:'lina',label:'Hablar con Lina'}],inventory:[],narrative:[]};
scene.npcs=[];scene.creatures=[];viewMode='game';focus='lina';activeMenu='criaturas';
clientRender();
`,context);
assert.equal(vm.runInContext('focus',context),null,'Empty creature menu clears NPC focus');
vm.runInContext(`snapshot.actions.push({id:'combatir',target:'espinajo',label:'Combatir'});focus='espinajo';activeMenu='personas';clientRender();`,context);
assert.equal(vm.runInContext('focus',context),'lina','Person menu selects its own NPC');
vm.runInContext(`activeMenu='criaturas';clientRender();`,context);
assert.equal(vm.runInContext('focus',context),'espinajo','Creature menu selects its own creature');
console.log('RPG menus: focus stays within people/creature category, including empty menus OK');
