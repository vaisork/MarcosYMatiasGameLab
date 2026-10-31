// Sonido RPG: carga sonido.js con un AudioContext simulado; cada efecto y tema se programa sin errores
// y cada sala existente resuelve a un tema válido.
import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const param=()=>({value:1,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(v){assert.ok(v>0,'exponential ramp needs >0');},setTargetAtTime(){},cancelScheduledValues(){}});
let started=0, audio=null;
const nodeStub=()=>({connect(){},disconnect(){},start(){started++;},stop(){},gain:param(),frequency:param(),type:'',buffer:null});
class FakeAudioContext{
 constructor(){this.currentTime=0;this.state='running';this.sampleRate=8000;this.destination={};audio=this;}
 createGain(){return nodeStub();} createOscillator(){return nodeStub();} createBiquadFilter(){return nodeStub();} createBufferSource(){return nodeStub();}
 createBuffer(_c,len){const d=new Float32Array(len);return {getChannelData:()=>d};}
 resume(){this.state='running';} suspend(){this.state='suspended';}
}
const context=vm.createContext({AudioContext:FakeAudioContext,setInterval(){},setTimeout(){},console,addEventListener(){}});
vm.runInContext(fs.readFileSync(new URL('../client-rpg/sonido.js',import.meta.url),'utf8'),context);
const S=context.VaisgardSonido;
S._desbloquear();
assert.ok(audio,'AudioContext se crea tras el gesto');
for(const name of Object.keys(S.FX)){const before=started;S.fx(name);assert.ok(started>before,`fx ${name}`);}
for(const [id,t] of Object.entries(S.TEMAS)){
 const p=S.compilar(t);
 assert.ok(p.compases.length>=8&&p.compases.length<=16,`${id}: 8–16 compases`);
 p.compases.forEach((c,i)=>assert.equal(c.length,t.compas,`${id} compás ${i+1}`));
 assert.equal(t.acordes.split(/\s+/).length,p.compases.length,`${id}: un acorde por compás`);
 assert.ok(p.eventos.filter(Boolean).length>=8,`${id}: melodía`);
 S.musica(id);const before=started, loop=p.pasos*60/t.bpm/2;
 for(const end=audio.currentTime+loop+1;audio.currentTime<end;audio.currentTime+=.05)S._programar();
 assert.ok(started-before>p.eventos.filter(Boolean).length,`tema ${id} programa melodía y acompañamiento`);
}
S.musica(null);
// Mapeo: todas las salas reales y el hogar resuelven a un tema existente.
const used=new Set();
for(const file of fs.readdirSync(new URL('../content/regions/',import.meta.url))){
 const data=JSON.parse(fs.readFileSync(new URL(`../content/regions/${file}`,import.meta.url),'utf8'));
 const rooms=Array.isArray(data.rooms)?data.rooms:Object.values(data.rooms||{});
 for(const room of rooms){const id=S.temaSala(room);assert.ok(S.TEMAS[id],`${room.id} → ${id}`);used.add(id);}
 for(const region of Object.keys(data.regions||{}))assert.equal(S.temaSala({id:'hogar_x',kind:'home',region}),'descanso');
}
for(const town of ['valdren','khariel','brumak','narevia','velmora','vaisgard','bosque','rio','montana','campo','cueva','mazmorra','descanso'])assert.ok(used.has(town),`tema ${town} usado por alguna sala`);
assert.equal(S.temaBatalla({creature:'dragon_aguas_antiguas',hp_max:240},'veyra'),'jefe');
assert.equal(S.temaBatalla({creature:'espinajo_rastrojo',hp_max:40},'edran'),'batalla_edran');
assert.equal(S.temaBatalla({creature:'x',hp_max:40},'desconocida'),'batalla');
console.log(`Sonido RPG: ${Object.keys(S.FX).length} efectos, ${Object.keys(S.TEMAS).length} temas y ${used.size} temas de sala OK`);
