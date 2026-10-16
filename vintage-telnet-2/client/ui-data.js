// Presentation contracts; these functions never invent world state or actions.
export const speciesNames={humanos:'Humano',humano:'Humano',felaryn:'Felaryn',dravak:'Dravak',marevyn:'Marevyn',vesperi:'Vesperi'};
export const classNames={juramentado:'Juramentado',arcano:'Arcano',sombra:'Sombra',artifice:'Artífice'};
export const regionNames={veyra:'Cuenca de Veyra',edran:'Llanos de Edran',hoshai:'Sierra de Hoshai',korven:'Pedrales de Korven',lethra:'Aguas de Lethra',nhal:'Bosque de Nhal'};
export const kindNames={WORLD:'Entorno',LOOK:'El lugar',LOCATION:'Lugar',ACTION:'Tu decisión',NPC:'Voz',DIALOGUE:'Conversación',TRACE:'Señal',DANGER:'Peligro',COMBAT:'Encuentro',DAMAGE:'Daño',DISCOVERY:'Descubrimiento',REWARD:'Progreso',MEMORY:'Recuerdo',INFO:'Información',ERROR:'Aviso',CHAT:'Conversación local'};
export function events(value){return Array.isArray(value)?value.filter(event=>event&&typeof event.text==='string'&&event.text.trim()).map(event=>({kind:String(event.kind||'WORLD').toUpperCase(),text:event.text,id:event.id??null})):[];}
export function actions(value){return Array.isArray(value)?value.filter(action=>action&&typeof action.id==='string'&&typeof action.label==='string').map(action=>({...action,disabled:Boolean(action.disabled)})):[];}
export function list(value){if(Array.isArray(value))return value;if(value&&Array.isArray(value.items))return value.items;if(value&&Array.isArray(value.entries))return value.entries;return [];}
export function actionPayload(action,requestId,confirmed=false){if(!action||typeof action.id!=='string'||!action.id)throw Error('Acción no disponible');const payload={id:action.id,request_id:requestId};for(const key of ['target','topic','name'])if(typeof action[key]==='string')payload[key]=action[key];if(confirmed)payload.confirmed=true;return payload;}
export function knownMap(value){const nodes=list(value?.nodes).filter(node=>node&&typeof node.id==='string'&&typeof node.name==='string'),ids=new Set(nodes.map(node=>node.id));const edges=list(value?.edges).map(edge=>Array.isArray(edge)?{from:edge[0],to:edge[1]}:{from:edge?.from??edge?.source,to:edge?.to??edge?.target}).filter(edge=>ids.has(edge.from)&&ids.has(edge.to));return{nodes,edges};}
export function textLabel(value){if(typeof value==='string')return value;if(value&&typeof value.label==='string')return value.label;return '';}
export function journalEvents(value){return list(value).flatMap(entry=>typeof entry==='string'&&entry.trim()?[{kind:'MEMORY',text:entry,id:null}]:events([entry]));}

// A snapshot is context, not another copy of the entire travel chronicle.
export class NarrativeJournal {
 constructor(){this.entries=[];this.reset();}
 reset(){this.entries.length=0;this.character=null;this.room=null;this.region=null;this.scene=new Set();this.feedback='';this.sequence=0;this.visit=0;this.inCombat=false;}
 consume(snapshot,explicit=false){
  if(!snapshot?.character||!snapshot?.room)return [];
  if(this.character!==snapshot.character.id){this.reset();this.character=snapshot.character.id;}
  const scene=events(snapshot.scene),reply=events(snapshot.narrative),stamp=e=>e.kind+'\n'+e.text;
  if(!scene.length&&snapshot.room.description)scene.push({kind:'WORLD',text:snapshot.room.description});
  const current=new Set(scene.map(stamp)),moved=this.room!==snapshot.room.id,feedbackKey=JSON.stringify(reply.map(stamp));
  const additions=[];
  if(moved){this.visit++;additions.push({kind:'LOCATION',text:(this.room===null?'Estás en ':'Llegas a ')+snapshot.room.name+'.'});if(this.region&&snapshot.room.region&&this.region!==snapshot.room.region)additions.push({kind:'DISCOVERY',text:'Entras en '+(regionNames[snapshot.room.region]||snapshot.room.region)+'.'});additions.push(...scene);/* Exits are shown in the scene's «Salidas» panel. */}
  // Existing scene details are already in the journal, including explicit observations.
  else if(!explicit)additions.push(...scene.filter(e=>!this.scene.has(stamp(e))));
  if(explicit||feedbackKey!==this.feedback)additions.push(...reply.filter(e=>!current.has(stamp(e))));
  if(explicit&&!moved)additions.push(...scene.filter(e=>!this.scene.has(stamp(e))&&!reply.some(r=>stamp(r)===stamp(e))));
  const urgentReply=new Set(reply.filter(e=>['DANGER','COMBAT','DAMAGE','ACTION','REWARD'].includes(e.kind)).map(stamp));
  const combatReply=this.inCombat||Boolean(snapshot.character.combat)||reply.some(e=>['COMBAT','DAMAGE'].includes(e.kind));
  const unique=new Set(),added=[];
  for(const event of additions){const key=stamp(event);if(unique.has(key))continue;unique.add(key);const entry={...event,key:`${this.character}:${++this.sequence}`,place:snapshot.room.name,room:snapshot.room.id,visit:this.visit,urgent:combatReply&&urgentReply.has(key)};this.entries.push(entry);added.push(entry);}
  if(this.entries.length>100)this.entries.splice(0,this.entries.length-100);
  this.room=snapshot.room.id;this.region=snapshot.room.region;this.scene=current;this.feedback=feedbackKey;this.inCombat=Boolean(snapshot.character.combat);return added;
 }
}

// Learned directions only. No coordinates, inferred opposites, or hidden destinations.
export function orientationMap(value,current){
 const map=knownMap(value),ids=new Set(map.nodes.map(n=>n.id)),directions=new Set(['norte','sur','este','oeste','salir','hogar']);
 const legacy=!Array.isArray(value?.routes),routes=[];
 const raw=legacy?map.edges.flatMap(e=>[{from:e.from,to:e.to},{from:e.to,to:e.from}]):value.routes;
 const seen=new Set();
 for(const route of raw){
  if(!route||!ids.has(route.from)||!ids.has(route.to)||route.from===route.to)continue;
  if(!legacy&&!directions.has(route.direction))continue;
  const key=route.from+'\n'+route.to+'\n'+(route.direction||'');if(seen.has(key))continue;seen.add(key);
  routes.push({from:route.from,to:route.to,...(!legacy?{direction:route.direction}:{}),...(Array.isArray(route.points)?{points:route.points}:{})});
 }
 const position=ids.has(current)?current:null,frontiers=[],frontierSeen=new Set();
 for(const exit of list(value?.frontiers)){
  if(!exit||exit.from!==position||!directions.has(exit.direction)||frontierSeen.has(exit.direction))continue;
  if(routes.some(route=>route.from===position&&route.direction===exit.direction))continue;
  frontierSeen.add(exit.direction);frontiers.push({from:position,direction:exit.direction});
 }
 return {...map,routes,frontiers,current:position,legacy};
}
export function knownRoute(map,from,to){
 const ids=new Set(list(map?.nodes).map(n=>n.id));if(!ids.has(from)||!ids.has(to))return null;
 if(from===to)return [];
 const queue=[{id:from,steps:[]}],seen=new Set([from]);
 for(let index=0;index<queue.length;index++){
  const current=queue[index];
  for(const edge of list(map.routes)){
   if(edge.from!==current.id||!ids.has(edge.to)||seen.has(edge.to))continue;
   const steps=[...current.steps,{...edge}];if(edge.to===to)return steps;
   seen.add(edge.to);queue.push({id:edge.to,steps});
  }
 }
 return null;
}

// Authoritative positions stay fixed as discovery grows. Legacy snapshots use a schematic.
export function discoveredLayout(map){
 const steps={norte:[0,-1],sur:[0,1],este:[1,0],oeste:[-1,0],salir:[1,1],hogar:[-1,-1]},positions=new Map(),taken=new Set();
 const nodes=[...list(map.nodes)].sort((a,b)=>a.id.localeCompare(b.id)),routes=[...list(map.routes)].sort((a,b)=>(a.from+'\n'+a.to+'\n'+a.direction).localeCompare(b.from+'\n'+b.to+'\n'+b.direction));
 for(const node of nodes)if(Array.isArray(node.position)&&node.position.length===2&&node.position.every(Number.isSafeInteger)){positions.set(node.id,[...node.position]);taken.add(node.position.join(','));}
 if(positions.size===nodes.length)return positions;
 let component=0;
 for(const node of nodes){
  if(!positions.has(node.id)){let start=[component*3,0];while(taken.has(start.join(',')))start[0]++;positions.set(node.id,start);taken.add(start.join(','));component++;}
  const queue=[node.id],visited=new Set();
  for(let index=0;index<queue.length;index++){
   const from=queue[index];if(visited.has(from))continue;visited.add(from);const [x,y]=positions.get(from);
   for(const route of routes){if(route.from!==from||!nodes.some(n=>n.id===route.to))continue;if(!positions.has(route.to)){const [dx,dy]=steps[route.direction]||[1,0];let cell=[x+dx,y+dy];while(taken.has(cell.join(',')))cell=[cell[0]+dx,cell[1]+dy];positions.set(route.to,cell);taken.add(cell.join(','));}if(!visited.has(route.to))queue.push(route.to);}
  }
 }
 return positions;
}

let lastDiscoveredPaths=null;
// Half-quarter-tile lanes avoid rooms and shared road segments. Ports use real exits.
export function discoveredPaths(map,positions){
 if(!positions.size)return [];
 const vectors={norte:[0,-1],sur:[0,1],este:[1,0],oeste:[-1,0],salir:[1,0],hogar:[-1,0]},blocked=new Set(),usedEdges=new Set(),links=[],seen=new Set(),ports=new Map();
 const key=p=>p.join(','),edgeKey=(a,b)=>[key(a),key(b)].sort().join('|');
 for(const [x,y] of positions.values())for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++)blocked.add(key([x*8+dx,y*8+dy]));
 const cells=[...positions.values()],minX=Math.min(...cells.map(p=>p[0]*8))-8,maxX=Math.max(...cells.map(p=>p[0]*8))+8,minY=Math.min(...cells.map(p=>p[1]*8))-8,maxY=Math.max(...cells.map(p=>p[1]*8))+8;
 const routes=[...list(map.routes)].sort((a,b)=>(a.from+'\n'+a.to+'\n'+a.direction).localeCompare(b.from+'\n'+b.to+'\n'+b.direction));
 const cacheKey=JSON.stringify([[...positions].sort((a,b)=>a[0].localeCompare(b[0])),routes.map(r=>[r.from,r.to,r.direction,r.points])]);if(lastDiscoveredPaths?.key===cacheKey)return lastDiscoveredPaths.links;
 function port(id,direction,override){const vector=override||vectors[direction]||[1,0],center=positions.get(id).map(v=>v*8),name=id+'\n'+direction,index=ports.get(name)||0;ports.set(name,index+1);const offset=index===0?0:index%2?Math.ceil(index/2):-index/2;return center.map((v,i)=>v+vector[i]*3+(i===0?-vector[1]:vector[0])*offset);}
 for(const route of routes){
  if(!positions.has(route.from)||!positions.has(route.to)||route.from===route.to)continue;
  const pair=[route.from,route.to].sort().join('\n');if(seen.has(pair))continue;seen.add(pair);
  const reverse=routes.find(r=>r.from===route.to&&r.to===route.from),origin=positions.get(route.from),destination=positions.get(route.to);
  const validPath=points=>Array.isArray(points)&&points.length>=2&&points.length<=10000&&points.every(p=>Array.isArray(p)&&p.length===2&&p.every(v=>Number.isFinite(v)&&Number.isSafeInteger(v*2)))&&points[0].every((v,i)=>v===origin[i]*4)&&points.at(-1).every((v,i)=>v===destination[i]*4);
  const reversed=Array.isArray(reverse?.points)?[...reverse.points].reverse():null,canonical=validPath(route.points)?route.points:validPath(reversed)?reversed:null;
  if(canonical){const points=canonical.map(p=>[...p]);for(let i=2;i<points.length-1;i++)usedEdges.add(edgeKey(points[i-1].map(v=>v*2),points[i].map(v=>v*2)));links.push({from:route.from,to:route.to,direction:route.direction,reverse:reverse?.direction,points,crossings:[]});continue;}
  const dx=destination[0]-origin[0],dy=destination[1]-origin[1],toward=Math.abs(dx)>=Math.abs(dy)?(dx>=0?'este':'oeste'):(dy>=0?'sur':'norte'),opposite={norte:'sur',sur:'norte',este:'oeste',oeste:'este'},out=['norte','sur','este','oeste'].includes(route.direction)?route.direction:toward,back=['norte','sur','este','oeste'].includes(reverse?.direction)?reverse.direction:opposite[toward];
  // Home is an abstract entrance, not another public cardinal street.
  if(['salir','hogar'].includes(route.direction)&&Math.abs(dx)===Math.abs(dy)&&dx!==0){
   const count=Math.abs(dx)*8,points=Array.from({length:count+1},(_,i)=>origin.map((v,axis)=>v*4+(destination[axis]-v)*4*i/count));
   const clear=points.every(point=>[...positions].every(([id,p])=>id===route.from||id===route.to||Math.abs(point[0]-p[0]*4)>1||Math.abs(point[1]-p[1]*4)>1));
   if(clear){links.push({from:route.from,to:route.to,direction:route.direction,reverse:reverse?.direction,points,crossings:[]});continue;}
  }
  const from=positions.get(route.from).map(v=>v*8),to=positions.get(route.to).map(v=>v*8),start=port(route.from,route.direction==='salir'||route.direction==='hogar'?route.direction:out,['salir','hogar'].includes(route.direction)?[Math.sign(dx),Math.sign(dy)]:null),end=port(route.to,['salir','hogar'].includes(reverse?.direction)?reverse.direction:back,['salir','hogar'].includes(reverse?.direction)?[-Math.sign(dx),-Math.sign(dy)]:null),goal=key(end),parent=new Map([[key(start),null]]),cost=new Map([[key(start),0]]),heap=[];
  // Length wins first; among equally short paths prefer few bends, not staircases.
  const stepCost=10000,steps=[[0,-1],[1,0],[0,1],[-1,0]],stateKey=(p,d)=>key(p)+'/'+d;
  const initialDirection=steps.findIndex(v=>v[0]===vectors[out]?.[0]&&v[1]===vectors[out]?.[1]),initial=stateKey(start,initialDirection);
  parent.clear();cost.clear();parent.set(initial,null);cost.set(initial,0);
  const states=new Map([[initial,{p:start,d:initialDirection}]]),score=p=>(Math.abs(p[0]-end[0])+Math.abs(p[1]-end[1]))*stepCost;
  let sequence=0;
  const less=(a,b)=>a.f<b.f||(a.f===b.f&&(a.h<b.h||(a.h===b.h&&a.sequence<b.sequence)));
  function push(p,d,g){const h=score(p),item={p,d,g,h,f:g+h,sequence:sequence++};heap.push(item);let i=heap.length-1;while(i){const j=(i-1)>>1;if(!less(item,heap[j]))break;heap[i]=heap[j];i=j;}heap[i]=item;}
  function pop(){const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let j=i*2+1;if(j+1<heap.length&&less(heap[j+1],heap[j]))j++;if(!less(heap[j],last))break;heap[i]=heap[j];i=j;}heap[i]=last;}return first;}
  push(start,initialDirection,0);let finish=null;
  while(heap.length){const {p,d,g}=pop(),current=stateKey(p,d);if(g!==cost.get(current))continue;if(key(p)===goal){finish=current;break;}
   for(let next=0;next<steps.length;next++){const v=steps[next],cell=p.map((n,i)=>n+v[i]),k=key(cell),nextKey=stateKey(cell,next),nextCost=g+stepCost+(d>=0&&d!==next?1:0);if(cell[0]<minX||cell[0]>maxX||cell[1]<minY||cell[1]>maxY||blocked.has(k)||usedEdges.has(edgeKey(p,cell))||nextCost>=(cost.get(nextKey)??Infinity))continue;cost.set(nextKey,nextCost);parent.set(nextKey,current);states.set(nextKey,{p:cell,d:next});push(cell,next,nextCost);}
  }
  if(!finish)continue;
  const path=[];for(let current=finish;current;current=parent.get(current))path.unshift(states.get(current).p);
  for(let i=1;i<path.length;i++)usedEdges.add(edgeKey(path[i-1],path[i]));
  const points=[from,...path,to].map(p=>p.map(v=>v/2));
  links.push({from:route.from,to:route.to,direction:route.direction,reverse:reverse?.direction,points,crossings:[]});
 }
 // Crossings are not junctions. The later road gets a visual gap at each crossing.
 const visiblePoints=new Set();for(const link of links){const own=new Set();for(const point of link.points.slice(1,-1)){const pointKey=key(point);if(visiblePoints.has(pointKey)&&!own.has(pointKey))link.crossings.push([...point]);own.add(pointKey);}for(const pointKey of own)visiblePoints.add(pointKey);}
 lastDiscoveredPaths={key:cacheKey,links};return links;
}

export const speciesPortraits=Object.fromEntries(['humano','felaryn','dravak','marevyn','vesperi'].map(id=>[id,`/client/art/species/${id}-anime-v1.webp`]));

export const placeIllustrations={"valdren_plaza":{"name":"Valdren","illustration":"/client/art/places/valdren-anime-v1.webp","caption":"Representación del pueblo; la hora y el clima se describen en la lectura."},"khariel_centro":{"name":"Khariel","illustration":"/client/art/places/khariel-anime-v1.webp","caption":"Representación del pueblo; la hora y el clima se describen en la lectura."},"brumak_centro":{"name":"Brumak","illustration":"/client/art/places/brumak-anime-v1.webp","caption":"Representación del pueblo; la hora y el clima se describen en la lectura."},"narevia_centro":{"name":"Narevia","illustration":"/client/art/places/narevia-anime-v1.webp","caption":"Representación del pueblo; la hora y el clima se describen en la lectura."},"velmora_centro":{"name":"Velmora","illustration":"/client/art/places/velmora-anime-v1.webp","caption":"Representación del pueblo; la hora y el clima se describen en la lectura."},"vaisgard_mercado":{"name":"Vaisgard","illustration":"/client/art/places/vaisgard-anime-v1.webp","caption":"Representación del pueblo; la hora y el clima se describen en la lectura."}};

Object.assign(placeIllustrations,{
  "veyra_plaza_rutas": {
    "name": "Plaza de las Cinco Rutas",
    "illustration": "/client/art/places/veyra_plaza_rutas-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_plaza_rutas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_barrio_cargas": {
    "name": "Calle de los almacenes",
    "illustration": "/client/art/places/veyra_barrio_cargas-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_barrio_cargas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_calle_toldos": {
    "name": "Calle de los Toldos Remendados",
    "illustration": "/client/art/places/veyra_calle_toldos-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_calle_toldos-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_patio_agua": {
    "name": "Patio del agua",
    "illustration": "/client/art/places/veyra_patio_agua-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_patio_agua-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_puerta_alta": {
    "name": "Puerta del Camino Alto",
    "illustration": "/client/art/places/veyra_puerta_alta-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_puerta_alta-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_puerta_piedra": {
    "name": "Puerta del camino de Korven",
    "illustration": "/client/art/places/veyra_puerta_piedra-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_puerta_piedra-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_puerta_sombra": {
    "name": "Puerta del bosque",
    "illustration": "/client/art/places/veyra_puerta_sombra-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_puerta_sombra-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_puerta_campos": {
    "name": "Puerta de los Campos",
    "illustration": "/client/art/places/veyra_puerta_campos-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_puerta_campos-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_patio_porte": {
    "name": "Patio de los animales",
    "illustration": "/client/art/places/veyra_patio_porte-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_patio_porte-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "valdren_huertos": {
    "name": "Corredor de los Huertos",
    "illustration": "/client/art/places/valdren_huertos-anime-v1.webp",
    "thumbnail": "/client/art/places/valdren_huertos-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_patio_senales": {
    "name": "Patio de mensajes",
    "illustration": "/client/art/places/veyra_patio_senales-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_patio_senales-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_puerta_juncos": {
    "name": "Puerta de los canales",
    "illustration": "/client/art/places/veyra_puerta_juncos-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_puerta_juncos-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "valdren_pozo": {
    "name": "Pozo de las Dos Cuerdas",
    "illustration": "/client/art/places/valdren_pozo-anime-v1.webp",
    "thumbnail": "/client/art/places/valdren_pozo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "valdren_patio_carros": {
    "name": "Patio de los carros",
    "illustration": "/client/art/places/valdren_patio_carros-anime-v1.webp",
    "thumbnail": "/client/art/places/valdren_patio_carros-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "valdren_graneros": {
    "name": "Paso entre los Graneros",
    "illustration": "/client/art/places/valdren_graneros-anime-v1.webp",
    "thumbnail": "/client/art/places/valdren_graneros-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "valdren_calle_alta": {
    "name": "Calle de la fragua",
    "illustration": "/client/art/places/valdren_calle_alta-anime-v1.webp",
    "thumbnail": "/client/art/places/valdren_calle_alta-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "valdren_patio_ropa": {
    "name": "Patio de ropa",
    "illustration": "/client/art/places/valdren_patio_ropa-anime-v1.webp",
    "thumbnail": "/client/art/places/valdren_patio_ropa-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_mercado_cintas": {
    "name": "Mercado de las cintas",
    "illustration": "/client/art/places/hoshai_mercado_cintas-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_mercado_cintas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_patio_hogares": {
    "name": "Patio de las casas",
    "illustration": "/client/art/places/hoshai_patio_hogares-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_patio_hogares-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_calle_fachadas": {
    "name": "Calle de las casas",
    "illustration": "/client/art/places/korven_calle_fachadas-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_calle_fachadas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_patio_lavado": {
    "name": "Patio de lavado",
    "illustration": "/client/art/places/korven_patio_lavado-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_patio_lavado-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_mercado_hojas": {
    "name": "Mercado de Narevia",
    "illustration": "/client/art/places/lethra_mercado_hojas-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_mercado_hojas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_muelle_vecinal": {
    "name": "Muelle de las cestas",
    "illustration": "/client/art/places/lethra_muelle_vecinal-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_muelle_vecinal-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_patio_ventanas": {
    "name": "Patio de las ventanas",
    "illustration": "/client/art/places/lethra_patio_ventanas-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_patio_ventanas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_mercado_setas": {
    "name": "Mercado de Velmora",
    "illustration": "/client/art/places/nhal_mercado_setas-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_mercado_setas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_patio_relato": {
    "name": "Patio de reuniones",
    "illustration": "/client/art/places/nhal_patio_relato-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_patio_relato-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_calle_hogares": {
    "name": "Calle de las casas",
    "illustration": "/client/art/places/nhal_calle_hogares-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_calle_hogares-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_umbral_velmora": {
    "name": "Entrada de Velmora",
    "illustration": "/client/art/places/nhal_umbral_velmora-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_umbral_velmora-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_calzada": {
    "name": "Calzada de piedra",
    "illustration": "/client/art/places/edran_calzada-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_calzada-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_casa_camino": {
    "name": "Casa del camino",
    "illustration": "/client/art/places/edran_casa_camino-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_casa_camino-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_terraplen": {
    "name": "Terraplén de la Subida",
    "illustration": "/client/art/places/edran_terraplen-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_terraplen-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_era": {
    "name": "Era de los campos",
    "illustration": "/client/art/places/edran_era-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_era-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_hito_campos": {
    "name": "Paso hacia Veyra",
    "illustration": "/client/art/places/edran_hito_campos-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_hito_campos-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_zanja_antigua": {
    "name": "Zanja seca",
    "illustration": "/client/art/places/edran_zanja_antigua-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_zanja_antigua-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_surcos": {
    "name": "Campo de surcos",
    "illustration": "/client/art/places/edran_surcos-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_surcos-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_acequia": {
    "name": "Curva de la Acequia",
    "illustration": "/client/art/places/edran_acequia-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_acequia-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_salida_huertos": {
    "name": "Salida de las Cercas Bajas",
    "illustration": "/client/art/places/edran_salida_huertos-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_salida_huertos-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_rampa_grava": {
    "name": "Subida de grava",
    "illustration": "/client/art/places/veyra_rampa_grava-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_rampa_grava-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_estribacion": {
    "name": "Primera subida",
    "illustration": "/client/art/places/hoshai_estribacion-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_estribacion-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_repecho_raices": {
    "name": "Cuesta de las raíces",
    "illustration": "/client/art/places/hoshai_repecho_raices-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_repecho_raices-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_descanso_tres_piedras": {
    "name": "Descanso de las Tres Piedras",
    "illustration": "/client/art/places/hoshai_descanso_tres_piedras-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_descanso_tres_piedras-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_pared_goteo": {
    "name": "Pared húmeda",
    "illustration": "/client/art/places/hoshai_pared_goteo-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_pared_goteo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_pinar_discontinuo": {
    "name": "Pinar abierto",
    "illustration": "/client/art/places/hoshai_pinar_discontinuo-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_pinar_discontinuo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_agua_fria": {
    "name": "Cruce de agua fría",
    "illustration": "/client/art/places/hoshai_agua_fria-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_agua_fria-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_ladera_hitos": {
    "name": "Ladera de las señales",
    "illustration": "/client/art/places/hoshai_ladera_hitos-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_ladera_hitos-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_cuello_roca": {
    "name": "Paso entre paredes",
    "illustration": "/client/art/places/hoshai_cuello_roca-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_cuello_roca-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_escalones_sol": {
    "name": "Escalones al sol",
    "illustration": "/client/art/places/hoshai_escalones_sol-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_escalones_sol-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  }
});

const townArtKeys={edran:'valdren_plaza',hoshai:'khariel_centro',korven:'brumak_centro',lethra:'narevia_centro',nhal:'velmora_centro',veyra:'vaisgard_mercado'};
const homeArtNames={edran:'valdren',hoshai:'khariel',korven:'brumak',lethra:'narevia',nhal:'velmora'};
placeIllustrations.valdren_fragua={name:'Fragua de Valdren',illustration:'/client/art/places/valdren-fragua-anime-v1.webp',thumbnail:'/client/art/places/valdren-fragua-anime-v1-thumb.webp',caption:'La fragua compra armas sobrantes y permite mejorar el filo; las acciones disponibles dependen de lo que llevas.'};
// Additional environmental views: agent-reviewed delivery, 2026-10-08; fixed views, no time/weather state.
Object.assign(placeIllustrations,{
  "hoshai_terraza_cargas": {
    "name": "Terraza de las cargas",
    "illustration": "/client/art/places/hoshai_terraza_cargas-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_terraza_cargas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_loma_cascajo": {
    "name": "Loma de las piedras claras",
    "illustration": "/client/art/places/korven_loma_cascajo-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_loma_cascajo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_cauce_duro": {
    "name": "Cauce seco",
    "illustration": "/client/art/places/korven_cauce_duro-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_cauce_duro-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_meseta_baja": {
    "name": "Meseta de las dos piedras",
    "illustration": "/client/art/places/korven_meseta_baja-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_meseta_baja-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_terraplen_roca": {
    "name": "Camino de piedra",
    "illustration": "/client/art/places/veyra_terraplen_roca-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_terraplen_roca-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_pared_sotavento": {
    "name": "Pared que corta el viento",
    "illustration": "/client/art/places/korven_pared_sotavento-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_pared_sotavento-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_hitos_paso": {
    "name": "Camino de los mojones",
    "illustration": "/client/art/places/korven_hitos_paso-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_hitos_paso-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_hendidura_transito": {
    "name": "Paso estrecho",
    "illustration": "/client/art/places/korven_hendidura_transito-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_hendidura_transito-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_asiento_revision": {
    "name": "Banco de revisión",
    "illustration": "/client/art/places/korven_asiento_revision-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_asiento_revision-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_hondonada_canales": {
    "name": "Cruce de canales",
    "illustration": "/client/art/places/veyra_hondonada_canales-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_hondonada_canales-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_ribera_seca": {
    "name": "Ribera seca",
    "illustration": "/client/art/places/lethra_ribera_seca-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_ribera_seca-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_tierra_esponjosa": {
    "name": "Tierra blanda",
    "illustration": "/client/art/places/lethra_tierra_esponjosa-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_tierra_esponjosa-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_juncal_abierto": {
    "name": "Paso entre los juncos",
    "illustration": "/client/art/places/lethra_juncal_abierto-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_juncal_abierto-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_cruce_canales": {
    "name": "Cruce de canales",
    "illustration": "/client/art/places/lethra_cruce_canales-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_cruce_canales-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_ribera_firme": {
    "name": "Ribera de las cargas",
    "illustration": "/client/art/places/lethra_ribera_firme-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_ribera_firme-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_pasarela_curva": {
    "name": "Pasarela curva",
    "illustration": "/client/art/places/lethra_pasarela_curva-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_pasarela_curva-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_embarcadero_camino": {
    "name": "Embarcadero del camino",
    "illustration": "/client/art/places/lethra_embarcadero_camino-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_embarcadero_camino-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_senda_elevada": {
    "name": "Senda sobre el agua",
    "illustration": "/client/art/places/lethra_senda_elevada-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_senda_elevada-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_tablas_primeras": {
    "name": "Primeras tablas",
    "illustration": "/client/art/places/lethra_tablas_primeras-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_tablas_primeras-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_lindero_arboles": {
    "name": "Entrada al bosque",
    "illustration": "/client/art/places/veyra_lindero_arboles-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_lindero_arboles-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_arbol_umbral": {
    "name": "Primer árbol del bosque",
    "illustration": "/client/art/places/nhal_arbol_umbral-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_arbol_umbral-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_suelo_hojas": {
    "name": "Sendero de hojas",
    "illustration": "/client/art/places/nhal_suelo_hojas-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_suelo_hojas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_tronco_acostado": {
    "name": "Tronco caído",
    "illustration": "/client/art/places/nhal_tronco_acostado-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_tronco_acostado-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_corteza_clara": {
    "name": "Árbol de corteza clara",
    "illustration": "/client/art/places/nhal_corteza_clara-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_corteza_clara-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_raices_altas": {
    "name": "Paso de las raíces altas",
    "illustration": "/client/art/places/nhal_raices_altas-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_raices_altas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_piedras_musgo": {
    "name": "Piedras con musgo",
    "illustration": "/client/art/places/nhal_piedras_musgo-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_piedras_musgo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_puente_bajo": {
    "name": "Puente entre árboles",
    "illustration": "/client/art/places/nhal_puente_bajo-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_puente_bajo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_helechos_bajos": {
    "name": "Sendero de helechos",
    "illustration": "/client/art/places/nhal_helechos_bajos-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_helechos_bajos-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_almacen_grano": {
    "name": "Almacén de grano",
    "illustration": "/client/art/places/korven_almacen_grano-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_almacen_grano-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_senda_viento": {
    "name": "Senda del viento",
    "illustration": "/client/art/places/korven_senda_viento-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_senda_viento-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_borde_tierra": {
    "name": "Parada de los Cardos",
    "illustration": "/client/art/places/korven_borde_tierra-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_borde_tierra-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_linde_piedra": {
    "name": "Paso hacia Korven",
    "illustration": "/client/art/places/edran_linde_piedra-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_linde_piedra-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_ladera_piedra": {
    "name": "Ladera de los cestos",
    "illustration": "/client/art/places/edran_ladera_piedra-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_ladera_piedra-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_prado": {
    "name": "Prado de las Marcas Anchas",
    "illustration": "/client/art/places/edran_prado-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_prado-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_loma": {
    "name": "Loma del Pasto Cortado",
    "illustration": "/client/art/places/edran_loma-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_loma-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_lindero": {
    "name": "Lindero de la Piedra Hundida",
    "illustration": "/client/art/places/edran_lindero-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_lindero-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_senda_dosel": {
    "name": "Senda de los árboles altos",
    "illustration": "/client/art/places/hoshai_senda_dosel-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_senda_dosel-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_estacion_cuerda": {
    "name": "Parada del cordel",
    "illustration": "/client/art/places/hoshai_estacion_cuerda-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_estacion_cuerda-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_relevo_altura": {
    "name": "Alto de las Raíces",
    "illustration": "/client/art/places/nhal_relevo_altura-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_relevo_altura-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_roca_entre_copas": {
    "name": "Roca entre los árboles",
    "illustration": "/client/art/places/nhal_roca_entre_copas-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_roca_entre_copas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_sendero_altura": {
    "name": "Subida entre árboles",
    "illustration": "/client/art/places/nhal_sendero_altura-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_sendero_altura-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_agua_sombreada": {
    "name": "Cauce bajo los árboles",
    "illustration": "/client/art/places/nhal_agua_sombreada-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_agua_sombreada-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_ribera_relevo": {
    "name": "Paso hacia Lethra",
    "illustration": "/client/art/places/nhal_ribera_relevo-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_ribera_relevo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_relevo_raices": {
    "name": "Orilla Velada",
    "illustration": "/client/art/places/lethra_relevo_raices-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_relevo_raices-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_ribera_sombra": {
    "name": "Ribera sombreada",
    "illustration": "/client/art/places/lethra_ribera_sombra-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_ribera_sombra-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  }
});

Object.assign(placeIllustrations,{
  "valdren_cobertizo": {
    "name": "Cobertizo de los carros",
    "illustration": "/client/art/places/valdren_cobertizo-anime-v1.webp",
    "thumbnail": "/client/art/places/valdren_cobertizo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "valdren_comedor": {
    "name": "Comedor de Elva",
    "illustration": "/client/art/places/valdren_comedor-anime-v1.webp",
    "thumbnail": "/client/art/places/valdren_comedor-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_canal_entrada": {
    "name": "Entrada del canal cubierto",
    "illustration": "/client/art/places/edran_canal_entrada-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_canal_entrada-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_canal_bifurcacion": {
    "name": "Bifurcación del canal",
    "illustration": "/client/art/places/edran_canal_bifurcacion-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_canal_bifurcacion-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_canal_compuerta": {
    "name": "Compuerta abierta",
    "illustration": "/client/art/places/edran_canal_compuerta-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_canal_compuerta-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_canal_herramientas": {
    "name": "Cámara de herramientas",
    "illustration": "/client/art/places/edran_canal_herramientas-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_canal_herramientas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_canal_refugio": {
    "name": "Refugio junto al canal",
    "illustration": "/client/art/places/edran_canal_refugio-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_canal_refugio-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_canal_repisa": {
    "name": "Repisa de las cuñas",
    "illustration": "/client/art/places/edran_canal_repisa-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_canal_repisa-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_archivo_cargas": {
    "name": "Archivo de cargas",
    "illustration": "/client/art/places/veyra_archivo_cargas-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_archivo_cargas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "valdren_casa_semillas": {
    "name": "Casa de semillas",
    "illustration": "/client/art/places/valdren_casa_semillas-anime-v1.webp",
    "thumbnail": "/client/art/places/valdren_casa_semillas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "valdren_cuidado": {
    "name": "Casa de cuidados",
    "illustration": "/client/art/places/valdren_cuidado-anime-v1.webp",
    "thumbnail": "/client/art/places/valdren_cuidado-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_umbral_elin": {
    "name": "Puerta de Elin",
    "illustration": "/client/art/places/nhal_umbral_elin-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_umbral_elin-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_senda_recipiente": {
    "name": "Senda hacia Elin",
    "illustration": "/client/art/places/nhal_senda_recipiente-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_senda_recipiente-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_taller_cortezas": {
    "name": "Taller de madera",
    "illustration": "/client/art/places/nhal_taller_cortezas-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_taller_cortezas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_secadero_sombra": {
    "name": "Secadero del taller",
    "illustration": "/client/art/places/nhal_secadero_sombra-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_secadero_sombra-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_cocina_raices": {
    "name": "Cocina del bosque",
    "illustration": "/client/art/places/nhal_cocina_raices-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_cocina_raices-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  }
});
Object.assign(placeIllustrations,{
  "edran_reparo": {
    "name": "Refugio del camino",
    "illustration": "/client/art/places/edran_reparo-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_reparo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_sendero_juncos": {
    "name": "Sendero del Agua Oculta",
    "illustration": "/client/art/places/edran_sendero_juncos-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_sendero_juncos-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_puente_juncos": {
    "name": "Vado de Juncos",
    "illustration": "/client/art/places/edran_puente_juncos-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_puente_juncos-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_hito_tierra": {
    "name": "Cruce del puente",
    "illustration": "/client/art/places/lethra_hito_tierra-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_hito_tierra-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_ribera_oeste": {
    "name": "Ribera hacia Edran",
    "illustration": "/client/art/places/lethra_ribera_oeste-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_ribera_oeste-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  }
});
Object.assign(placeIllustrations,{
  "edran_cobertizo_campo": {
    "name": "Cobertizo de las Estacas Numeradas",
    "illustration": "/client/art/places/edran_cobertizo_campo-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_cobertizo_campo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_arboleda": {
    "name": "Arboleda de los tres árboles",
    "illustration": "/client/art/places/edran_arboleda-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_arboleda-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_sendero_regreso": {
    "name": "Senda de regreso",
    "illustration": "/client/art/places/edran_sendero_regreso-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_sendero_regreso-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_camino_carros": {
    "name": "Camino de carros",
    "illustration": "/client/art/places/edran_camino_carros-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_camino_carros-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_sala_cuidados": {
    "name": "Cuarto de cuidados de Velmora",
    "illustration": "/client/art/places/nhal_sala_cuidados-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_sala_cuidados-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_claro_silencio": {
    "name": "Claro tranquilo",
    "illustration": "/client/art/places/nhal_claro_silencio-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_claro_silencio-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_raiz_marcada": {
    "name": "Raíz marcada",
    "illustration": "/client/art/places/nhal_raiz_marcada-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_raiz_marcada-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "nhal_rincon_semillas": {
    "name": "Rincón de semillas",
    "illustration": "/client/art/places/nhal_rincon_semillas-anime-v1.webp",
    "thumbnail": "/client/art/places/nhal_rincon_semillas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_sala_cuidados": {
    "name": "Casa de cuidados de Brumak",
    "illustration": "/client/art/places/korven_sala_cuidados-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_sala_cuidados-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_sala_cuidados": {
    "name": "Plataforma de cuidados de Narevia",
    "illustration": "/client/art/places/lethra_sala_cuidados-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_sala_cuidados-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_sala_cuidados": {
    "name": "Cuarto de cuidados de Vaisgard",
    "illustration": "/client/art/places/veyra_sala_cuidados-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_sala_cuidados-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_sala_cuidados": {
    "name": "Asiento de cuidados de Khariel",
    "illustration": "/client/art/places/hoshai_sala_cuidados-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_sala_cuidados-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_taller_apoyos": {
    "name": "Taller de Khariel",
    "illustration": "/client/art/places/hoshai_taller_apoyos-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_taller_apoyos-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_lavadero_roca": {
    "name": "Lavadero de roca",
    "illustration": "/client/art/places/hoshai_lavadero_roca-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_lavadero_roca-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_deposito_comun": {
    "name": "Depósito de herramientas",
    "illustration": "/client/art/places/hoshai_deposito_comun-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_deposito_comun-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_balcon_valle": {
    "name": "Balcón sobre el valle",
    "illustration": "/client/art/places/hoshai_balcon_valle-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_balcon_valle-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_caseta_revision": {
    "name": "Caseta del camino",
    "illustration": "/client/art/places/hoshai_caseta_revision-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_caseta_revision-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_mirador_nudo": {
    "name": "Mirador de la cuerda",
    "illustration": "/client/art/places/hoshai_mirador_nudo-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_mirador_nudo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_abrigo_pinas": {
    "name": "Refugio de las piñas",
    "illustration": "/client/art/places/hoshai_abrigo_pinas-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_abrigo_pinas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_collado_pino": {
    "name": "Paso del último pino",
    "illustration": "/client/art/places/hoshai_collado_pino-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_collado_pino-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_aprisco_abierto": {
    "name": "Refugio del rebaño",
    "illustration": "/client/art/places/hoshai_aprisco_abierto-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_aprisco_abierto-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_hombro_lajas": {
    "name": "Camino de las lajas",
    "illustration": "/client/art/places/hoshai_hombro_lajas-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_hombro_lajas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_garganta_oeste": {
    "name": "Garganta hacia Korven",
    "illustration": "/client/art/places/hoshai_garganta_oeste-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_garganta_oeste-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_meseta_relevo": {
    "name": "Refugio de Lajas",
    "illustration": "/client/art/places/korven_meseta_relevo-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_meseta_relevo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_campamento_lona": {
    "name": "Campamento de la lona azul",
    "illustration": "/client/art/places/hoshai_campamento_lona-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_campamento_lona-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "hoshai_cajas_camino": {
    "name": "Cajas bajo la terraza",
    "illustration": "/client/art/places/hoshai_cajas_camino-anime-v1.webp",
    "thumbnail": "/client/art/places/hoshai_cajas_camino-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_almacen_entrada": {
    "name": "Puerta del almacén viejo",
    "illustration": "/client/art/places/korven_almacen_entrada-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_almacen_entrada-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_taller_juntas": {
    "name": "Taller de Brumak",
    "illustration": "/client/art/places/korven_taller_juntas-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_taller_juntas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_deposito_cubiertas": {
    "name": "Depósito de cubiertas",
    "illustration": "/client/art/places/korven_deposito_cubiertas-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_deposito_cubiertas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_almacen_cruce": {
    "name": "Cruce de los sacos vacíos",
    "illustration": "/client/art/places/korven_almacen_cruce-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_almacen_cruce-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_almacen_balanzas": {
    "name": "Mesa de pesaje",
    "illustration": "/client/art/places/korven_almacen_balanzas-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_almacen_balanzas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_almacen_fondo": {
    "name": "Depósito del fondo",
    "illustration": "/client/art/places/korven_almacen_fondo-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_almacen_fondo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_almacen_lateral": {
    "name": "Pasillo detrás de los sacos",
    "illustration": "/client/art/places/korven_almacen_lateral-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_almacen_lateral-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_cisterna_comun": {
    "name": "Cisterna común",
    "illustration": "/client/art/places/korven_cisterna_comun-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_cisterna_comun-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_mirador_grietas": {
    "name": "Mirador de las grietas",
    "illustration": "/client/art/places/korven_mirador_grietas-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_mirador_grietas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_cauce_observacion": {
    "name": "Cauce de piedras movidas",
    "illustration": "/client/art/places/korven_cauce_observacion-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_cauce_observacion-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_plataforma_escucha": {
    "name": "Plataforma de escucha",
    "illustration": "/client/art/places/korven_plataforma_escucha-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_plataforma_escucha-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_registro_cauce": {
    "name": "Registro del cauce",
    "illustration": "/client/art/places/korven_registro_cauce-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_registro_cauce-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_roca_cascaron": {
    "name": "Roca de los líquenes",
    "illustration": "/client/art/places/korven_roca_cascaron-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_roca_cascaron-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  }
});
Object.assign(placeIllustrations,{
  "lethra_taller_fibras": {
    "name": "Taller de fibras",
    "illustration": "/client/art/places/lethra_taller_fibras-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_taller_fibras-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_plataforma_secado": {
    "name": "Plataforma de secado",
    "illustration": "/client/art/places/lethra_plataforma_secado-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_plataforma_secado-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_banco_conversacion": {
    "name": "Banco junto al canal",
    "illustration": "/client/art/places/lethra_banco_conversacion-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_banco_conversacion-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_cocina_reunion": {
    "name": "Cocina vecinal",
    "illustration": "/client/art/places/lethra_cocina_reunion-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_cocina_reunion-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_cuidado_barcas": {
    "name": "Patio de las barcas",
    "illustration": "/client/art/places/lethra_cuidado_barcas-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_cuidado_barcas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_banco_barro": {
    "name": "Banco de barro",
    "illustration": "/client/art/places/lethra_banco_barro-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_banco_barro-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_orilla_silente": {
    "name": "Orilla del canal",
    "illustration": "/client/art/places/lethra_orilla_silente-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_orilla_silente-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_raices_observacion": {
    "name": "Raíces junto al agua",
    "illustration": "/client/art/places/lethra_raices_observacion-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_raices_observacion-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "lethra_escucha_aves": {
    "name": "Orilla de las aves",
    "illustration": "/client/art/places/lethra_escucha_aves-anime-v1.webp",
    "thumbnail": "/client/art/places/lethra_escucha_aves-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_desvio_horno": {
    "name": "Desvío al horno",
    "illustration": "/client/art/places/korven_desvio_horno-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_desvio_horno-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_horno_reposo": {
    "name": "Horno viejo",
    "illustration": "/client/art/places/korven_horno_reposo-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_horno_reposo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "korven_entrante_piezas": {
    "name": "Rincón de las muestras",
    "illustration": "/client/art/places/korven_entrante_piezas-anime-v1.webp",
    "thumbnail": "/client/art/places/korven_entrante_piezas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_cantera_callada": {
    "name": "Cantera vieja",
    "illustration": "/client/art/places/veyra_cantera_callada-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_cantera_callada-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_huerta_baja": {
    "name": "Huerta bajo las Escaleras",
    "illustration": "/client/art/places/veyra_huerta_baja-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_huerta_baja-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_colina_vista": {
    "name": "Colina de las Procedencias",
    "illustration": "/client/art/places/veyra_colina_vista-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_colina_vista-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_vega_abierta": {
    "name": "Vega abierta",
    "illustration": "/client/art/places/veyra_vega_abierta-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_vega_abierta-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_pastos_exteriores": {
    "name": "Camino de los pastos",
    "illustration": "/client/art/places/veyra_pastos_exteriores-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_pastos_exteriores-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_acequia_exterior": {
    "name": "Camino sobre la acequia",
    "illustration": "/client/art/places/veyra_acequia_exterior-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_acequia_exterior-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_vista_cuenca": {
    "name": "Mirador de la cuenca",
    "illustration": "/client/art/places/edran_vista_cuenca-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_vista_cuenca-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_estanque": {
    "name": "Estanque del Reflejo Partido",
    "illustration": "/client/art/places/edran_estanque-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_estanque-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_sauces": {
    "name": "Borde de los Sauces Bajos",
    "illustration": "/client/art/places/edran_sauces-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_sauces-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_bajo_humedo": {
    "name": "Hondonada húmeda",
    "illustration": "/client/art/places/edran_bajo_humedo-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_bajo_humedo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "edran_parcela_vieja": {
    "name": "Parcela vieja",
    "illustration": "/client/art/places/edran_parcela_vieja-anime-v1.webp",
    "thumbnail": "/client/art/places/edran_parcela_vieja-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  }
});
Object.assign(placeIllustrations,{
  "veyra_mazmorra_umbral": {
    "name": "Umbral del Bastión de las Aguas",
    "illustration": "/client/art/places/veyra_mazmorra_umbral-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_mazmorra_umbral-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_mazmorra_cuencas": {
    "name": "Distribuidor de las Tres Cuencas",
    "illustration": "/client/art/places/veyra_mazmorra_cuencas-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_mazmorra_cuencas-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_mazmorra_caudal": {
    "name": "Galería del Caudal Sumergido",
    "illustration": "/client/art/places/veyra_mazmorra_caudal-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_mazmorra_caudal-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_mazmorra_cornisa": {
    "name": "Fractura de la Cornisa Alta",
    "illustration": "/client/art/places/veyra_mazmorra_cornisa-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_mazmorra_cornisa-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_mazmorra_mecanismo": {
    "name": "Cámara del Trinquete Central",
    "illustration": "/client/art/places/veyra_mazmorra_mecanismo-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_mazmorra_mecanismo-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_mazmorra_galeria_ecos": {
    "name": "Galería de las Losas Sonoras",
    "illustration": "/client/art/places/veyra_mazmorra_galeria_ecos-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_mazmorra_galeria_ecos-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_mazmorra_boveda_guardian": {
    "name": "Bóveda de las Aguas Antiguas",
    "illustration": "/client/art/places/veyra_mazmorra_boveda_guardian-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_mazmorra_boveda_guardian-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  },
  "veyra_mazmorra_recorridos_fin": {
    "name": "Sagrario de los Recorridos",
    "illustration": "/client/art/places/veyra_mazmorra_recorridos_fin-anime-v1.webp",
    "thumbnail": "/client/art/places/veyra_mazmorra_recorridos_fin-anime-v1-thumb.webp",
    "caption": "Vista representativa del lugar. La hora, el clima y los cambios actuales se describen en la lectura."
  }
});
const placeVariants=Object.freeze({
  "veyra_mazmorra_boveda_guardian": {
    "agua-libre": {
      "illustration": "/client/art/places/veyra_mazmorra_boveda_guardian-anime-v1-agua-libre.webp",
      "thumbnail": "/client/art/places/veyra_mazmorra_boveda_guardian-anime-v1-agua-libre-thumb.webp"
    }
  },
  "veyra_mazmorra_recorridos_fin": {
    "agua-libre": {
      "illustration": "/client/art/places/veyra_mazmorra_recorridos_fin-anime-v1-agua-libre.webp",
      "thumbnail": "/client/art/places/veyra_mazmorra_recorridos_fin-anime-v1-agua-libre-thumb.webp"
    }
  },
  "veyra_acequia_exterior": {
    "agua-libre": {
      "illustration": "/client/art/places/veyra_acequia_exterior-anime-v1-agua-libre.webp",
      "thumbnail": "/client/art/places/veyra_acequia_exterior-anime-v1-agua-libre-thumb.webp"
    }
  },
  "hoshai_cajas_camino": {
    "sin-polea": {
      "illustration": "/client/art/places/hoshai_cajas_camino-anime-v1-sin-polea.webp",
      "thumbnail": "/client/art/places/hoshai_cajas_camino-anime-v1-sin-polea-thumb.webp"
    }
  },
  "korven_almacen_fondo": {
    "sin-placa": {
      "illustration": "/client/art/places/korven_almacen_fondo-anime-v1-sin-placa.webp",
      "thumbnail": "/client/art/places/korven_almacen_fondo-anime-v1-sin-placa-thumb.webp"
    }
  },
  "korven_almacen_balanzas": {
    "placa-devuelta": {
      "illustration": "/client/art/places/korven_almacen_balanzas-anime-v1-placa-devuelta.webp",
      "thumbnail": "/client/art/places/korven_almacen_balanzas-anime-v1-placa-devuelta-thumb.webp"
    }
  }
});
export function placeArt(room){
 if(!room)return null;
 if(room.kind==='home'&&homeArtNames[room.region])return {name:room.name,illustration:`/client/art/places/${homeArtNames[room.region]}-home-anime-v1.webp`,thumbnail:`/client/art/places/${homeArtNames[room.region]}-home-thumb-v1.webp`,caption:'Representación de tu hogar. La hora, el clima y el equipo actual se consultan en el juego.'};
 if(room.id==='korven_peldanos_cortos')return {name:room.name,illustration:'/client/art/places/brumak-escalones-anime-v1.webp',thumbnail:'/client/art/places/brumak-escalones-thumb-v1.webp',caption:'Escalones bajos de Brumak. La hora y el clima actuales se describen en la lectura.'};
 const art=placeIllustrations[room.id]||(room.kind==='settlement'?placeIllustrations[townArtKeys[room.region]]:null);
 const variant=placeVariants[room.id]?.[room.art_variant];
 return art?{...art,...variant,thumbnail:variant?.thumbnail||art.thumbnail||art.illustration.replace('-anime-v1.webp','-thumb-v1.webp')}:null;
}

// Reference descriptions for Personaje; availability always comes from server actions.
export const classActions={
 "juramentado": [
  {
   "id": "guardia_comprometida",
   "label": "Guardia Comprometida",
   "description": "Reduce el 50% del daño del próximo golpe directo frontal y anula empujes."
  },
  {
   "id": "paso_ruptura",
   "label": "Paso de Ruptura",
   "description": "Golpe de hombro y pomo que interrumpe la preparación rival y desestabiliza su guardia."
  }
 ],
 "arcano": [
  {
   "id": "impulso_arcano",
   "label": "Impulso Arcano",
   "description": "Empuje de fuerza pura que cancela preparaciones y aleja al rival."
  },
  {
   "id": "velo_contencion",
   "label": "Velo de Contención",
   "description": "Barrera traslúcida que absorbe el próximo golpe que recibas."
  },
  {
   "id": "destello_frio",
   "label": "Destello Frío",
   "description": "Resplandor repentino que desorienta al rival reduciendo su precisión o facilita la huida."
  }
 ],
 "sombra": [
  {
   "id": "borrar_foco",
   "label": "Borrar el Foco",
   "description": "Rompe la línea visual reduciendo la precisión del rival; si falla, abre tu siguiente ataque."
  },
  {
   "id": "golpe_apertura",
   "label": "Golpe a la Apertura",
   "description": "Puñalada veloz en ángulo descubierto; demoledora si aprovechas una apertura previa."
  },
  {
   "id": "distraccion",
   "label": "Lanzar Distracción",
   "description": "Ruido con piedras para girar al rival, cancelando cargas y mermando su ataque."
  }
 ],
 "artifice": [
  {
   "id": "tiro_interrupcion",
   "label": "Tiro de Interrupción",
   "description": "Disparo certero a las articulaciones que corta la carga o reduce su precisión."
  },
  {
   "id": "traba_campo",
   "label": "Traba de Campo",
   "description": "Tiende estacas y cuerdas que enredan y ralentizan al rival."
  },
  {
   "id": "balsamo_campo",
   "label": "Bálsamo de Campo",
   "description": "Aplica un ungüento herbal rápido que restaura 15 de vida y alivia la fatiga."
  }
 ]
};

// Presentation only: preserve the resolved result and every combat number.
export function combatReading(event){
 const text=event.text||'',kind=String(event.kind||'').toUpperCase();
 if(!['COMBAT','DAMAGE','REWARD','ACTION','DANGER'].includes(kind))return text;
 let hash=0;for(const ch of String(event.key||event.id||text))hash=(hash*31+ch.charCodeAt(0))>>>0;
 const choose=variants=>variants[hash%variants.length];
 const hit=text.match(/^Tu golpe alcanza a (.+): ([\d.]+) de daño\.$/);if(hit){const [,name,damage]=hit;return choose([`¡Das en el blanco! ${name} recibe ${damage} de daño.`,`Tu golpe conecta con ${name}: ${damage} de daño.`,`Aciertas el ataque: ${damage} de daño a ${name}.`]);}
 const hurt=text.match(/^(.+) te alcanza: ([\d.]+) de daño\.$/);if(hurt){const [,name,damage]=hurt;return choose([`${name} te alcanza. El impacto te sacude: ${damage} de daño.`,`¡${name} conecta su ataque! Recibes ${damage} de daño.`,`${name} te golpea: ${damage} de daño. Toca recuperar el ritmo.`]);}
 const miss=text.match(/^La respuesta de (.+) pasa sin alcanzarte\.$/);if(miss){const name=miss[1];return choose([`¡${name} falla! Su ataque no te alcanza.`,`${name} responde, pero no consigue alcanzarte.`,`El ataque de ${name} pasa de largo. Esta vez no te alcanza.`]);}
 if(text==='Tu ataque no encuentra un ángulo limpio.')return choose(['Buscas el hueco, pero el golpe no conecta. Tu ataque no encuentra un ángulo limpio.','Lanzas el ataque y no logras alcanzarlo. Tu ataque no encuentra un ángulo limpio.']);
 if(/^Vences a .+\. Ganas \d+ XP;/.test(text))return choose(['La tensión afloja: ese enfrentamiento termina. ','¡Lo conseguiste! Has vencido a este rival. ','El intercambio termina con tu victoria. '])+text;
 const effects=[[/^Usas Velo de Contención\./,'Velo preparado'],[/^El velo azulado.*absorbe /,'Velo: golpe absorbido'],[/tienes una apertura clara|Tienes una apertura para/,'Apertura para tu siguiente ataque'],[/^Usas Traba de Campo\./,'Traba desplegada'],[/^Usas Bálsamo de Campo\./,'Curación y alivio']];
 for(const [pattern,label] of effects)if(pattern.test(text))return label+' · '+text;
 const powers={'Guardia Comprometida':'Afirmas los pies y sostienes la guardia. ','Impulso Arcano':'Concentras el impulso y lo sueltas hacia tu rival. ','Borrar el Foco':'Cambias el ritmo y buscas salir de su foco. ','Tiro de Interrupción':'Apuntas, ajustas y sueltas el disparo. '};
 for(const [name,lead] of Object.entries(powers))if(text.startsWith('Usas '+name+'.'))return lead+text;
 return text;
}

// Compact decision cues summarize the server's reason; they never decide eligibility.
export function capabilityReadingHint(action){
 if(Object.values(classActions).some(entries=>entries.some(entry=>entry.id===action.id)))return action.disabled?action.reason||'No disponible':action.description||action.reason||null;
 if(action.id!=='capacidad')return null;
 const reason=action.reason||'';
 if(action.disabled){
  if(reason==='Esta acción preparada no es frontal; la guardia no puede responderla.')return 'No cubre ese ángulo';
  if(reason==='Esta acción preparada no puede interrumpirse.')return 'No interrumpible';
  if(reason==='Tu equipo o posición no permite esa respuesta.')return 'Revisa equipo y posición';
  return null;
 }
 if(reason==='Reduce el daño del próximo golpe que te alcance.')return 'Reduce el daño recibido';
 if(reason==='Rompe la preparación y dificulta que te alcance.')return 'Rompe su preparación';
 if(reason==='Reduce la precisión de la respuesta ordinaria durante esta ronda.')return 'Reduce su precisión';
 if(reason==='Reduce su precisión; si falla, abre tu siguiente ataque.')return 'Rival menos preciso; apertura si falla';
 if(reason.includes('no puede interrumpirse. El disparo sólo hará daño si acierta;'))return 'Sólo daño si aciertas';
 if(reason.startsWith('Si aciertas, interrumpes '))return 'Corta preparación si aciertas';
 if(reason==='Un disparo acertado corta la carga o reduce su precisión.')return 'Menos precisión si aciertas';
 return null;
}

// Lightweight views of illustrations already used by the authored bestiary.
const bestiaryThumbnails=Object.freeze({
  "/client/art/bestiary/dragon_aguas_antiguas-anime-v1.webp": "/client/art/bestiary/dragon_aguas_antiguas-anime-v1-thumb.webp",
  "/client/art/bestiary/aguaculebra-anime-v1.webp": "/client/art/bestiary/aguaculebra-anime-v1-thumb.webp",
  "/client/art/bestiary/cienfango-anime-v1.webp": "/client/art/bestiary/cienfango-anime-v1-thumb.webp",
  "/client/art/bestiary/clavaespina-anime-v1.webp": "/client/art/bestiary/clavaespina-anime-v1-thumb.webp",
  "/client/art/bestiary/cortacorriente-anime-v1.webp": "/client/art/bestiary/cortacorriente-anime-v1-thumb.webp",
  "/client/art/bestiary/escarbaraiz-anime-v1.webp": "/client/art/bestiary/escarbaraiz-anime-v1-thumb.webp",
  "/client/art/bestiary/faucecieno-anime-v1.webp": "/client/art/bestiary/faucecieno-anime-v1-thumb.webp",
  "/client/art/bestiary/garfarrama-anime-v1.webp": "/client/art/bestiary/garfarrama-anime-v1-thumb.webp",
  "/client/art/bestiary/mordesombra-anime-v1.webp": "/client/art/bestiary/mordesombra-anime-v1-thumb.webp",
  "/client/art/bestiary/mordijunco-anime-v1.webp": "/client/art/bestiary/mordijunco-anime-v1-thumb.webp",
  "/client/art/bestiary/quebracascara-anime-v1.webp": "/client/art/bestiary/quebracascara-anime-v1-thumb.webp",
  "/client/art/bestiary/raizacapa-anime-v1.webp": "/client/art/bestiary/raizacapa-anime-v1-thumb.webp",
  "/client/art/bestiary/roecorteza-anime-v1.webp": "/client/art/bestiary/roecorteza-anime-v1-thumb.webp",
  "/client/art/bestiary/sombranutria-anime-v1.webp": "/client/art/bestiary/sombranutria-anime-v1-thumb.webp",
  "/client/art/bestiary/tragacharco-anime-v1.webp": "/client/art/bestiary/tragacharco-anime-v1-thumb.webp",
  "/client/art/bestiary/tronchacolmillo-anime-v1.webp": "/client/art/bestiary/tronchacolmillo-anime-v1-thumb.webp",
  "/client/art/bestiary/velomembrana-anime-v1.webp": "/client/art/bestiary/velomembrana-anime-v1-thumb.webp"
});
export function bestiaryThumbnail(creature){
 const source=creature?.illustration;
 return typeof source==='string'&&source.startsWith('/client/art/bestiary/')?bestiaryThumbnails[source]||source:null;
}

// Plain-language descriptions of effects implemented by mechanics.py and engine.py.
// Attributes without an implemented effect remain explicitly pending.
export const attributeDescriptions={
 fuerza:'Ayuda a hacer más daño con tu arma.',
 resistencia:'Te da más vitalidad y hace que te canses menos.',
 agilidad:'Ayuda a esquivar golpes y a escapar del combate.',
 percepcion:'Ayuda a acertar, esquivar y escapar del combate.',
 destreza:'Ayuda a acertar, hacer daño y bloquear golpes.',
 voluntad:'Aumenta un poco tu vitalidad máxima.',
 intelecto:'Su efecto en el juego está pendiente de motor.',
 presencia:'Su efecto en el juego está pendiente de motor.'
};

export const trustStageNames={
 'vínculo_naciente':'Vínculo naciente (Etapa 1)',
 'confianza_estable':'Confianza estable (Etapa 2)',
 'armonía_profunda':'Armonía profunda (Etapa 3)'
};
