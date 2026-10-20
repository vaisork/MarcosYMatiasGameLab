// Exercise the shipped client with deferred responses and a fake timer queue.
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../client-rpg/rpg.js',import.meta.url),'utf8').replace('void poll();','');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const state=(round=0,hp=100)=>({authenticated:true,csrf_token:'current',character:{id:1,status:'approved',hp,hp_max:100,xp:0,combat:{creature:'espinajo_rastrojo',round,hp:30,hp_max:40}},room:{id:'edran_surcos',exits:[],npcs:[]},actions:[{id:'atacar'}],narrative:[],inventory:[]});
const response=data=>({ok:true,headers:{get:()=>null},json:async()=>structuredClone(data)});
const element=()=>({hidden:true,dataset:{},classList:{add(){},remove(){},toggle(){}},append(){},replaceChildren(){},addEventListener(){},getContext:()=>({}),querySelector:()=>null,querySelectorAll:()=>[]});
function fixture(){
 const nodes=new Map(),timers=new Map(),requests=[];let sequence=0,fetcher=async()=>response(state());
 const ctx=vm.createContext({console,performance:{now:()=>0},matchMedia:()=>({matches:true}),Image:class{},setInterval(){},setTimeout(fn,delay){const id=++sequence;timers.set(id,{fn,delay});return id;},clearTimeout(id){timers.delete(id);},fetch:(path,options)=>{requests.push({path,body:options?.body&&JSON.parse(options.body)});return fetcher(path,options);},document:{hidden:false,getElementById:id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},createElement:element,querySelectorAll:()=>[],addEventListener(){},body:element()},window:{addEventListener(){},confirm:()=>true}});
 vm.runInContext(source,ctx);
 const run=code=>vm.runInContext(code,ctx);
 ctx.initial=state();run('snapshot=initial;scene={};viewMode="game";render=()=>{};');requests.length=0;
 return {ctx,run,timers,requests,fetch(fn){fetcher=fn;}};
}
{
 const f=fixture(),old=deferred();
 f.fetch((path,options)=>options?.body?Promise.resolve(response(state(1,90))):old.promise);
 const read=f.run('refresh()');
 await f.run('perform(snapshot.actions[0])');
 old.resolve(response({...state(0,100),csrf_token:'obsolete'}));await read;
 assert.equal(f.run('snapshot.character.hp'),90);
 assert.equal(f.run('snapshot.character.combat.round'),1);
 assert.equal(f.run('latestCsrfToken'),'current','Late GET cannot replace new CSRF token');
 assert.equal(f.run('selectedRound'),null);
}
{
 const f=fixture(),action=deferred();f.fetch(()=>action.promise);
 const sent=f.run('perform(snapshot.actions[0])');
 await f.run('refresh()');await f.run('perform(snapshot.actions[0])');
 assert.equal(f.requests.length,1,'No GET or second choice while POST is outstanding');
 action.resolve(response(state()));await sent;
 assert.equal(f.run('selectedRound'),0,'Same-round POST must retain lock');
 f.ctx.newState=state(1,92);await f.run('apply(newState)');
 assert.equal(f.run('selectedRound'),null);
 assert.equal(f.timers.size,1,'Action completion keeps one polling timer');
}
{
 const f=fixture();f.fetch(()=>Promise.reject(Error('connection lost')));
 await f.run('perform(snapshot.actions[0])');
 const id=f.requests[0].body.request_id;
 assert.ok(f.run('pending'));assert.equal(f.run('battleLocked()'),true);
 f.fetch(()=>Promise.resolve(response(state())));
 await f.run('refresh()');assert.ok(f.run('pending'),'State refresh cannot erase an uncertain action');
 await f.run('send(pending)');
 assert.equal(f.requests.at(-1).body.request_id,id,'Retry preserves idempotency key');
 assert.equal(f.run('pending'),null);assert.equal(f.run('selectedRound'),0);
}
{
 const f=fixture(),read=deferred();f.fetch(()=>read.promise);
 const polling=f.run('poll()');await f.run('poll()');
 f.run('schedulePoll(0);schedulePoll(0)');
 assert.equal(f.requests.length,1,'Only one in-flight state query');
 read.resolve(response(state()));await polling;
 assert.equal(f.timers.size,1);
 // Drain the single immediate query requested during the outstanding one.
 let [id,timer]=[...f.timers][0];f.timers.delete(id);await timer.fn();
 assert.equal(f.timers.size,1);assert.equal([...f.timers.values()][0].delay,250);
 f.fetch(()=>Promise.reject(Error('offline')));
 [id,timer]=[...f.timers][0];f.timers.delete(id);await timer.fn();
 assert.equal(f.timers.size,1,'Network failure must keep polling alive');
 assert.equal([...f.timers.values()][0].delay,250);
 f.run('snapshot.character.combat=null');assert.equal(f.run('pollDelay()'),4000);
 f.run('viewMode="welcome"');assert.equal(f.run('pollDelay()'),8000);
 f.run('document.hidden=true');const before=f.requests.length;await f.run('refresh()');assert.equal(f.requests.length,before);
 f.run('document.hidden=false');await f.run('refresh()');assert.equal(f.requests.length,before+1);
}
{
 const f=fixture(),oldScene=deferred();
 f.run('resizeCanvas=()=>{};visibleSpawn=()=>[10,7];loadTileset=()=>{};');
 f.fetch(path=>path.includes('/first.json')?oldScene.promise:Promise.resolve({ok:true,json:async()=>({size:[20,15],exits:[],tag:'new'})}));
 f.ctx.next={...state(),room:{id:'first',exits:[]}};
 const applying=f.run('apply(next)');
 await f.run('api("/api/action",{id:"mover"})');
 f.ctx.next={...state(),room:{id:'second',exits:[]}};await f.run('apply(next)');
 oldScene.resolve({ok:true,json:async()=>({exits:[],tag:'old'})});await applying;
 assert.equal(f.run('scene.tag'),'new','Late scene cannot replace current room graphics');
 assert.equal(f.run('snapshot.room.id'),'second');
}
{
 const f=fixture();f.run('busy=true');
 f.fetch(()=>Promise.resolve(response(state(3,80))));
 await f.run('refresh()');assert.equal(f.requests.length,0,'Background refresh skips busy UI');
 await f.run('refresh(true)');assert.equal(f.requests.length,1,'Explicit approval/Continue/logout refresh is allowed while UI busy');
 assert.equal(f.run('snapshot.character.combat.round'),3);
}
console.log('RPG network: delayed GET/POST ordering, CSRF, scene ordering, round lock, uncertain retry, single poll chain, 250ms cadence, errors and visibility OK');
