import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('./app.js',import.meta.url),'utf8');
const inventory=source.slice(source.indexOf('const itemTypeNames='),source.indexOf('function inventoryView()'));
const chooser=source.slice(source.indexOf(' const groupedChoose='),source.indexOf(' const form=(operation',source.indexOf('function masterManagement')));
const section=source.slice(source.indexOf('function masterSection('),source.indexOf('async function manageMasterCharacter'));
const management=source.slice(source.indexOf('function masterManagement('),source.indexOf('function masterActivity('));
const element=source.slice(source.indexOf('function el('),source.indexOf('const button='));
const context=vm.createContext({el:(tag,attrs,...children)=>({tag,attrs,children:children.flat(Infinity)})});
vm.runInContext(inventory,context);
const groups=vm.runInContext(`inventoryGroups([
 {id:'a',name:'Espada',kind:'weapon'}, {id:'b',name:'Espada',kind:'weapon'},
 {id:'c',name:'Espada',kind:'weapon',honed:true}, {id:'d',name:'Armadura',kind:'armor'},
 {id:'e',name:'Poción',kind:'consumable',quantity:4}, {id:'f',name:'Mapa',kind:'unknown'}
],['a','b','c','d','e','f'],{torso:'d'})`,context);
assert.equal(groups[0],'d');
const weapons=groups.find(node=>node.children?.[0].children[0]==='Armas (3)');
assert.equal(weapons.children[1].children[0].children[0],'Espada ×2');
assert.deepEqual(weapons.children[1].children.slice(1),['a','b']);
assert.equal(weapons.children[2],'c');
assert(groups.some(node=>node.children?.[0].children[0]==='Consumibles (4)'));
assert(groups.some(node=>node.children?.[0].children[0]==='Otros (1)'));
assert(source.includes("form.querySelector('select[name=target]')"));
assert(source.includes("payload.target=operation==='remove_item'?Number(data.get('target')):String(data.get('target'))"));
const html=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/style.css"><div class="app"><main class="card" id="main"></main></div><script>
window.addEventListener('error',event=>{document.body.dataset.result=event.message});
${element}
let busy=false,masterRetry=null;const masterSections=new Set();
${inventory}
const list=value=>value||[],subtitle=text=>el('p',{},text),button=(label,handler,attrs)=>el('button',{type:'button',onclick:handler,...attrs},label),whole=value=>value||0,speciesNames={},classNames={},regionNames={veyra:'Cuenca de Veyra'};
const catalog=[{id:'sword',name:'Espada',kind:'weapon'}],character={id:2,name:'Prueba',equipment:{}};
const masterSheets=new Map([[2,{character,catalog,destinations:[{id:'town',name:'Pueblo',region:'veyra'}],grants:Array.from({length:9},(_,i)=>({id:i+1,item_id:'sword',item_name:'Espada',remaining:1}))}]]);
let submitted=null;const manageMasterCharacter=(character,payload,confirmation)=>{submitted={payload,confirmation}};
${section}
${management}
${chooser.replace(' const groupedChoose=','const groupedChoose=')}
const main=document.getElementById('main');
const chooser=groupedChoose('Objeto',[{id:'z',name:'Zorro',kind:'weapon'},{id:'a',name:'Árbol',kind:'weapon'},{id:'p',name:'Poción',kind:'consumable'},{id:'long',name:'Objeto muy largo '.repeat(20),kind:'weapon'}],'Categoría',itemType,itemTypeNames);
const form=el('form',{class:'stack'},chooser,el('button',{type:'submit'},'Entregar objeto'));
const panel=el('details',{class:'master-management more',open:true},el('summary',{},'Gestionar personaje'),masterSection(1,'items','Regalar objetos',form),masterSection(1,'travel','Trasladar personaje',el('p',{},'Destino de prueba')));main.append(panel);
const category=chooser.querySelector('select'),target=chooser.querySelector('[name=target]'),search=chooser.querySelector('input');
const check=(value,label)=>{if(!value)throw Error(label)};
check(target.disabled,'Inicial sin selección');category.value='weapon';category.dispatchEvent(new Event('change'));
check(target.options[0].value==='a','Orden español');check(target.options.length===3,'Sólo armas');
search.value='arbol';search.dispatchEvent(new Event('input'));check(target.options.length===1&&target.value==='a','Búsqueda sin acentos');
check(new FormData(form).get('target')==='a','Payload usa objeto');
search.value='sin coincidencias';search.dispatchEvent(new Event('input'));check(target.disabled&&form.querySelector('button').disabled,'Vacío bloquea entrega');
search.value='';search.dispatchEvent(new Event('input'));check(!target.disabled&&!form.querySelector('button').disabled,'Recuperar opciones');
const sections=panel.querySelectorAll(':scope > details');sections[0].open=true;
setTimeout(()=>{sections[1].open=true;setTimeout(()=>{try{
check(!sections[0].open&&sections[1].open,'Acordeón');check(!masterSections.has('1:items')&&masterSections.has('1:travel'),'Estado acordeón');
sections[0].open=true;
const items=[{id:'1',name:'Espada',kind:'weapon'},{id:'2',name:'Espada',kind:'weapon'},{id:'3',name:'Armadura',kind:'armor'}];
main.append(...inventoryGroups(items,items.map(i=>el('article',{class:'tile inventory-item'},el('h3',{},i.name),el('button',{},'Equipar este ejemplar'))),{torso:'3'}));
main.querySelectorAll('details').forEach(d=>{if(!d.closest('.master-management'))d.open=true});
const management=masterManagement(character);management.open=true;main.append(management);
for(const [key,categoryValue,operation,targetValue] of [['items','weapon','item','sword'],['travel','veyra','travel','town'],['correction','weapon','remove_item',1]]){
 const section=management.querySelector('[data-master-section="2:'+key+'"]'),form=section.querySelector('form'),category=form.querySelector('select');
 category.value=categoryValue;category.dispatchEvent(new Event('change'));form.dispatchEvent(new Event('submit',{cancelable:true}));
 check(submitted.payload.operation===operation&&submitted.payload.target===targetValue,'Payload '+operation);
 if(operation!=='travel')check(submitted.payload.amount===1,'Cantidad '+operation);
 check(submitted.confirmation.includes(operation==='travel'?'Pueblo':'Espada'),'Confirmación '+operation);
}
setTimeout(()=>{check(document.documentElement.scrollWidth<=innerWidth,'Sin scroll horizontal');document.body.dataset.result='PASS';document.title='PASS menus 390px';},30);
}catch(error){document.body.dataset.result=error.message;throw error}},30)},30);
</script>`;
writeFileSync('/tmp/vt2-menus-qa.html',html);
console.log('PASS: grupos, conteos, apilado, variantes, equipados y contrato de payload. HTML de prueba: /tmp/vt2-menus-qa.html');
