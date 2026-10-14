// Isolated check of the real attribute control; browser layout needs visible QA.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('./app.js',import.meta.url),'utf8');
const action={id:'atributo',target:'fuerza',label:'Mejorar fuerza · 1 PA',confirmation:'Aumentar fuerza de 10 a 11 por 1 PA. No podrás deshacerlo.'};
let performed;
const context=vm.createContext({state:{character:{pa:2},actions:[action]},actions:x=>x,attributeNames:{fuerza:'Fuerza'},busy:false,pendingRetry:null,button:(label,click,attrs)=>({label,click,...attrs}),perform:a=>{performed=a;}});
vm.runInContext(source.slice(source.indexOf('function attributeUpgrade('),source.indexOf('function characterView(')),context);
const upgrade=()=>vm.runInContext("attributeUpgrade('fuerza')",context);
assert.equal(upgrade().label,'+');assert.equal(upgrade().disabled,false);
upgrade().click();assert.equal(performed,action);
context.busy=true;assert.equal(upgrade().disabled,true);context.busy=false;
context.pendingRetry={};assert.equal(upgrade().disabled,true);context.pendingRetry=null;
context.state.actions=[];assert.equal(upgrade().disabled,true);
context.state.character.pa=0;assert.equal(upgrade(),null);
console.log('PASS: PA control uses server action, blocks unavailable/busy/retry and hides with zero PA.');
