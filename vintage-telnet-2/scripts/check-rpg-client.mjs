// Small contract check: execute the shipped client with a DOM/fetch boundary stub.
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const element=()=>({hidden:true,dataset:{},classList:{add(){},toggle(){}},append(){},replaceChildren(){},addEventListener(){},getContext(){return {};},querySelector(){return null;},querySelectorAll(){return [];}});
const nodes=new Map();const requests=[];
const context=vm.createContext({console,performance:{now:()=>0},matchMedia:()=>({matches:true}),Image:class{},setInterval(){},setTimeout(){},fetch:async(path,options)=>{requests.push(JSON.parse(options.body));return {ok:true,headers:{get:()=>null},json:async()=>JSON.parse(vm.runInContext('JSON.stringify(snapshot)',context))};},document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},createElement:element,querySelectorAll:()=>[],addEventListener(){},body:element()},window:{addEventListener(){},confirm:()=>true}});
const source=fs.readFileSync(new URL('../client-rpg/rpg.js',import.meta.url),'utf8').replace('void poll();','');
vm.runInContext(source,context);
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
