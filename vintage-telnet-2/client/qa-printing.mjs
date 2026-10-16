// Executes real renderer functions against a tiny technical DOM/timer adapter.
// It tests queue contracts, not browser layout, focus, scroll physics or comfort.
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {combatReading} from './ui-data.js';
import assert from 'node:assert/strict';
const source=await readFile(new URL('./app.js',import.meta.url),'utf8');
const snippet=source.slice(source.indexOf('const terminalFeed='),source.indexOf('function title('));
let reduced=false,nextTimer=0;const timers=new Map(),history=[];
function el(tag,attrs={},...children){const node={tag,...attrs,children:[],isConnected:true,scrollHeight:200,scrollTop:0,clientHeight:100,textContent:'',hidden:false,append(...items){for(const child of items){if(child&&typeof child==='object')child.parent=this;this.children.push(child);}},replaceChildren(){this.children=[];},remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);},addEventListener(name,callback){this[name]=callback;},scrollTo({top}){if(this.isConnected)this.scrollTop=top;}};node.append(...children);return node;}
const context=vm.createContext({el,history,combatReading,travelPaceUntil:0,kindNames:{WORLD:'Mundo'},document:{documentElement:{classList:{contains:()=>reduced}}},window:{scrollY:240,scrollTo({top}){this.scrollY=top;},matchMedia:()=>({matches:false})},setTimeout:callback=>{const id=++nextTimer;timers.set(id,callback);return id;},clearTimeout:id=>timers.delete(id)});
vm.runInContext(snippet+'\nglobalThis.subject={terminalFeed,printed,resetTerminal,finishPrinting,syncTerminal,printNext,captureReadingPosition,restoreReadingPosition};',context);
const s=context.subject;
const tick=()=>{const [id,callback]=timers.entries().next().value||[];if(callback){timers.delete(id);callback();}};
history.push({key:'a',kind:'WORLD',text:'A'.repeat(100)},{key:'b',kind:'WORLD',text:'B'.repeat(70)});s.syncTerminal();assert.equal(timers.size,1);tick();assert.equal(s.printed.get('a').at,4);assert.equal(s.printed.get('b').at,0);
s.syncTerminal();assert.equal(timers.size,1);assert.equal(s.printed.size,2);
assert.equal(s.printed.get('a').node.children.length,2);
assert.equal(s.printed.get('a').node['aria-label'],'A'.repeat(100));
assert.equal(s.printed.get('a').output['aria-hidden'],true);
s.terminalFeed.isConnected=false;tick();assert.equal(timers.size,0);assert.equal(s.printed.get('a').at,4);
s.terminalFeed.isConnected=true;s.syncTerminal();tick();assert.equal(s.printed.get('a').at,8);
s.finishPrinting();assert.equal(timers.size,0);assert.equal(s.printed.get('b').output.textContent,'B'.repeat(70));
s.terminalFeed.scrollTop=0;s.terminalFeed.scroll();history.push({key:'c',kind:'WORLD',text:'C'.repeat(100)});s.syncTerminal();tick();assert.equal(s.terminalFeed.scrollTop,0);
history.shift();s.syncTerminal();assert.equal(s.printed.has('a'),false);
reduced=true;s.syncTerminal();assert.equal(timers.size,0);assert.equal(s.printed.get('c').at,100);
s.terminalFeed.scrollTop=20;s.terminalFeed.scroll();
const position=s.captureReadingPosition();assert.equal(position.following,false);
s.terminalFeed.scrollTop=0;context.window.scrollY=0;
s.restoreReadingPosition(position);assert.equal(s.terminalFeed.scrollTop,20);assert.equal(context.window.scrollY,240);
assert.equal(s.captureReadingPosition().following,false);
s.resetTerminal();assert.equal(s.printed.size,0);assert.equal(s.terminalFeed.children.length,0);
/* Old scene never waits ahead of a new arrival, but stays in the journal. */
history.length=0;history.push({key:'v1',visit:1,kind:'WORLD',text:'OLD'.repeat(100)});reduced=false;s.syncTerminal();tick();
history.push({key:'v2',visit:2,kind:'LOCATION',text:'Llegas al puente.'},{key:'v3',visit:2,kind:'WORLD',text:'Agua bajo las tablas.'});s.syncTerminal();
assert.equal(s.printed.has('v1'),false);assert.equal(s.printed.has('v2'),false);assert.equal(history.length,3);assert.equal(s.printed.size,1);tick();assert.equal(s.printed.get('v3').at,4);
context.travelPaceUntil=Date.now()+5000;tick();assert.equal(s.printed.get('v3').at,16);
assert.match(source,/main\.replaceChildren\(context,\.\.\.\(numenAlert\?\[numenAlert\]:\[\]\),reading,choices,localPeople\(state\),recent\);if\(visitChanged\)\{terminalFeed.scrollTop=0;following=true;\}else restoreReadingPosition\(readingPosition\);if\(instantReading\(\)&&!visitChanged\)followTerminal\(\)/);
// Live combat replies bypass unfinished scenery without changing its queue.
context.travelPaceUntil=0;
s.terminalFeed.scrollTop=0;s.terminalFeed.scroll();
history.push({key:'urgent',visit:2,kind:'DANGER',text:'Prepara un zarpazo lateral.',urgent:true});s.syncTerminal();
assert.equal(s.printed.get('urgent').output.textContent,'Prepara un zarpazo lateral.');
assert.equal(s.printed.get('urgent').node.hidden,false);
assert.equal(s.printed.get('v3').at,16);
assert.equal(s.terminalFeed.scrollTop,0);
s.syncTerminal();assert.equal(s.printed.size,2);
console.log(JSON.stringify({checks:34,scope:'Real renderer queue against technical DOM/timers: current-visit priority, location retained in journal without duplicate terminal heading, adaptive walking pace, archived older visits, progressive ordering, stable sync, detach/resume, skip, reread scroll, prune, reduced motion, reset',limits:['No browser','No visual or focus approval']}));
