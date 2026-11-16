import * as THREE from 'three';
import { crearVuelo, actualizarVuelo, resolverChoque, guardarCheckpoint, registrarRozon, deltaSegundos, puedeResolverChoque, mapearPC, mapearCelular, mapearQuest, mapearGamepadXR, multiplicadorAltura } from '../fisica.mjs';

const ANCHO = 512, ALTO = 768, MUNDO_X = 19456, MUNDO_Z = 29184, EXAGERA = 1.2;
const $ = (id) => document.getElementById(id);
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.2)); renderer.setSize(innerWidth, innerHeight);
renderer.xr.enabled = true; renderer.shadowMap.enabled = false; renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x9bc6c4); scene.fog = new THREE.Fog(0x9bc6c4, 9000, 23000);
const camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, .1, 28000);
const rig = new THREE.Group(); rig.add(camera); scene.add(rig);
camera.position.set(0, 2.8, 10); camera.lookAt(0, 0, -90);
const estelas = new Float32Array(32 * 6), particulas = Array.from({ length: 32 }, () => ({ x: (Math.random() - .5) * 42, y: (Math.random() - .5) * 25, z: -4 - Math.random() * 76, largo: .18 + Math.random() * .7 }));
const estelasGeo = new THREE.BufferGeometry(); estelasGeo.setAttribute('position', new THREE.BufferAttribute(estelas, 3));
const estelasMesh = new THREE.LineSegments(estelasGeo, new THREE.LineBasicMaterial({ color: 0xe4fff4, transparent: true, opacity: 0, depthTest: false })); estelasMesh.frustumCulled = false; camera.add(estelasMesh);
scene.add(new THREE.HemisphereLight(0xd5f1ec, 0x67483b, 1.45));
const sol = new THREE.DirectionalLight(0xffe0ae, 3.2); sol.position.set(-4500, 7000, -3000); scene.add(sol);
const loader = new THREE.TextureLoader();
let terrain = null, agua = null, anchors = [], rings = [], waterY = 0, routeSamples = [];
let state = null, running = false, mode = '', elapsed = 0, nextRing = 0, messageUntil = 0, previousFrameTime = null;
const keys = new Set(), input = { pitch: 0, roll: 0 }, latestPointer = { dx: 0, dy: 0 };
let xrHands = [], phoneNeutralBeta = 0, phoneNeutralGamma = 0, lastDeviceOrientation = null;
const HEIGHTS = new Uint16Array(await fetch('assets/terreno-u16.bin').then((r) => r.arrayBuffer()));
const pointMap = (u, v) => ({ x: (u - .5) * MUNDO_X, z: (v - .5) * MUNDO_Z });
function altura(x, z) {
  const px = Math.max(0, Math.min(ANCHO - 1, Math.round((x / MUNDO_X + .5) * (ANCHO - 1))));
  const py = Math.max(0, Math.min(ALTO - 1, Math.round((z / MUNDO_Z + .5) * (ALTO - 1))));
  return HEIGHTS[py * ANCHO + px] * EXAGERA;
}
function ruta() {
  const mapa = [[.84,.05],[.79,.10],[.76,.15],[.71,.20],[.67,.25],[.60,.35],[.57,.40],[.53,.45],[.51,.50],[.50,.60],[.44,.65],[.43,.70],[.40,.75],[.37,.80],[.29,.85],[.32,.90],[.38,.95]];
  return mapa.map(([u,v], i) => {
    const p = pointMap(u,v); p.y = altura(p.x,p.z) + (i === 0 ? 240 : 70);
    const n = mapa[Math.min(mapa.length-1,i+1)], q = pointMap(n[0],n[1]);
    p.yaw = Math.atan2(-(q.x-p.x), -(q.z-p.z)); return p;
  });
}
function agregarTerreno() {
  const cols = 256, rows = 384, geo = new THREE.BufferGeometry(), vertices = [], uvs = [], indices = [];
  for (let y=0; y<rows; y++) for (let x=0; x<cols; x++) {
    const sx = Math.round(x*(ANCHO-1)/(cols-1)), sy = Math.round(y*(ALTO-1)/(rows-1));
    vertices.push((sx/(ANCHO-1)-.5)*MUNDO_X, HEIGHTS[sy*ANCHO+sx]*EXAGERA, (sy/(ALTO-1)-.5)*MUNDO_Z);
    uvs.push(x/(cols-1), 1-y/(rows-1));
    if (x<cols-1 && y<rows-1) { const a=y*cols+x,b=a+1,c=a+cols,d=c+1; indices.push(a,c,b,b,c,d); }
  }
  geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); geo.setIndex(indices); geo.computeVertexNormals();
  const map=loader.load('assets/barranca.webp'); map.colorSpace=THREE.SRGBColorSpace; map.anisotropy=2;
  terrain = new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map,roughness:1,metalness:0})); terrain.frustumCulled=false; scene.add(terrain);
}
function crearRuta() {
  anchors = ruta();
  const path = new THREE.CatmullRomCurve3(anchors.map((p)=>new THREE.Vector3(p.x,p.y-48,p.z)));
  const camino = path.getPoints(560); routeSamples=path.getPoints(180);
  agua = new THREE.Mesh(new THREE.TubeGeometry(path,560,15,5,false),new THREE.MeshBasicMaterial({color:0x4ab6b1,transparent:true,opacity:.82})); scene.add(agua);
  for (let i=0;i<8;i++) {
    const t=.006+i*.11, at=path.getPoint(t), tangent=path.getTangent(t);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(25,2.2,7,32),new THREE.MeshBasicMaterial({color:0xf4d085}));
    ring.position.copy(at).add(new THREE.Vector3(0,24,0)); ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),tangent); ring.userData.point={x:ring.position.x,y:ring.position.y,z:ring.position.z,yaw:Math.atan2(-tangent.x,-tangent.z)}; scene.add(ring); rings.push(ring);
  }
  const end=path.getPoint(1); waterY=anchors.at(-1).y-70;
  const landing=new THREE.Mesh(new THREE.TorusGeometry(58,3,8,40),new THREE.MeshBasicMaterial({color:0x8ffff0}));
  landing.position.set(end.x,waterY+9,end.z); scene.add(landing);
  return path;
}
function segmento(mesh, a, b) {
  const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from);
  mesh.position.copy(from.add(to).multiplyScalar(.5));mesh.scale.y=delta.length();mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
}
function crearMembrana() {
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(12),3));
  geo.setIndex([0,1,2,2,1,3]);
  const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xd77a4b,side:THREE.DoubleSide}));
  const edge=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(24),3)),new THREE.LineBasicMaterial({color:0xe5aa68}));
  return {mesh,edge};
}
function crearParapente() {
  const wings=new THREE.Group(), bodyMat=new THREE.MeshStandardMaterial({color:0x263b40,roughness:.9}), clothMat=new THREE.MeshBasicMaterial({color:0xd77a4b,side:THREE.DoubleSide});
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.85,3,6),bodyMat);body.rotation.x=Math.PI/2;body.position.z=-3.6;wings.add(body);
  const neck=new THREE.Mesh(new THREE.SphereGeometry(.2,8,6),new THREE.MeshStandardMaterial({color:0xd9aa70,roughness:1}));neck.position.set(0,.03,-3.05);wings.add(neck);
  const armGeo=new THREE.CylinderGeometry(.075,.12,1,5), legGeo=new THREE.CylinderGeometry(.09,.15,1.2,5);
  for(const side of [-1,1]){
    const arm=new THREE.Mesh(armGeo,new THREE.MeshStandardMaterial({color:0x293b3a,roughness:1}));segmento(arm,[side*.35,.22,-3.25],[side*2.05,.5,-3.45]);wings.add(arm);
    const leg=new THREE.Mesh(legGeo,bodyMat);segmento(leg,[side*.2,-.08,-3.9],[side*.42,-.45,-4.8]);wings.add(leg);
    const points=[[side*.45,.2,-3.25],[side*2.05,.5,-3.45],[side*.25,-.05,-3.9],[side*.42,-.45,-4.8]],panel=new THREE.BufferGeometry();panel.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));panel.setIndex([0,1,2,2,1,3]);panel.computeVertexNormals();wings.add(new THREE.Mesh(panel,clothMat));
    const outlinePoints=[points[0],points[1],points[1],points[3],points[3],points[2],points[2],points[0]].flat();
    const outline=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(outlinePoints,3)),new THREE.LineBasicMaterial({color:0xe5aa68}));wings.add(outline);
  }
  const inner=new THREE.BufferGeometry();inner.setAttribute('position',new THREE.Float32BufferAttribute([-.18,-.08,-3.9,.18,-.08,-3.9,-.42,-.45,-4.8,.42,-.45,-4.8],3));inner.setIndex([0,1,2,1,3,2]);inner.computeVertexNormals();wings.add(new THREE.Mesh(inner,clothMat));
  rig.add(wings); return wings;
}
function crearAlasQuest() {
  const wings=new THREE.Group(), sleeves=[],panels=[];
  const sleeveMat=new THREE.MeshStandardMaterial({color:0x293b3a,roughness:1}), sleeveGeo=new THREE.CylinderGeometry(.075,.13,1,6);
  for(let i=0;i<2;i++){
    const panel=crearMembrana();panels.push(panel);wings.add(panel.mesh,panel.edge);
    const sleeve=new THREE.Mesh(sleeveGeo,sleeveMat);wings.add(sleeve);sleeves.push(sleeve);
  }
  const inner=crearMembrana();wings.add(inner.mesh,inner.edge);rig.add(wings);
  return {wings,sleeves,panels,inner};
}
function crearParacaidas() {
  const canopy=new THREE.Group();
  const dome=new THREE.Mesh(new THREE.SphereGeometry(3.4,16,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0xf0a34f,side:THREE.DoubleSide,roughness:.8}));
  dome.position.set(0,5,-1);canopy.add(dome);
  const ropes=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3,5,-1),new THREE.Vector3(-.7,.2,-2),new THREE.Vector3(3,5,-1),new THREE.Vector3(.7,.2,-2),new THREE.Vector3(0,6,-1),new THREE.Vector3(0,.2,-2)]);
  canopy.add(new THREE.LineSegments(ropes,new THREE.LineBasicMaterial({color:0xf8e9cc})));
  canopy.visible=false;rig.add(canopy);return canopy;
}
agregarTerreno();
const path=crearRuta(); const avatar=crearParapente(); const questWings=crearAlasQuest(); const chute=crearParacaidas();
loader.load('assets/cielo.webp',(sky)=>{sky.mapping=THREE.EquirectangularReflectionMapping;sky.colorSpace=THREE.SRGBColorSpace;scene.background=sky;});
const start=anchors[0];
const checkpointAire=routeSamples[Math.floor(routeSamples.length*.035)];
checkpointAire.y+=115;checkpointAire.yaw=anchors[0].yaw;

function sonido() {
  const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
  const ctx=new Ctx(), n=ctx.sampleRate*2, buffer=ctx.createBuffer(1,n,ctx.sampleRate), data=buffer.getChannelData(0);
  for(let i=0;i<n;i++)data[i]=Math.random()*2-1;
  const source=ctx.createBufferSource(), filter=ctx.createBiquadFilter(), gain=ctx.createGain();
  source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=650;gain.gain.value=0;source.connect(filter).connect(gain).connect(ctx.destination);source.start();
  return (speed,pitch=0)=>{filter.frequency.setTargetAtTime(300+speed*82,ctx.currentTime,.08);gain.gain.setTargetAtTime(.012+speed/60*.055+Math.max(0,-pitch)*.04,ctx.currentTime,.12);};
}
let viento=()=>{};
function aviso(text,seconds=1.5){$('mensaje').textContent=text;$('mensaje').style.opacity='1';messageUntil=elapsed+seconds;}
function actualizarEntrada() {
  if(mode==='pc'){
    Object.assign(input,mapearPC({teclas:keys,mouseX:latestPointer.dx,mouseY:latestPointer.dy}));
  } else if(mode==='celular'){
    Object.assign(input,mapearCelular(lastDeviceOrientation?.beta??phoneNeutralBeta,lastDeviceOrientation?.gamma??phoneNeutralGamma,phoneNeutralBeta,phoneNeutralGamma));
  } else {
    const session=renderer.xr.getSession(),sources=session?.inputSources||[];
    const stick=mapearGamepadXR(sources);
    if(Math.abs(stick.pitch)+Math.abs(stick.roll)>.12)Object.assign(input,stick);
    else if(xrHands.length>=2&&xrHands.every((hand)=>hand.visible)){
      const xrCamera=renderer.xr.getCamera(camera);
      const hand=(controller)=>xrCamera.worldToLocal(controller.getWorldPosition(new THREE.Vector3()));
      const left=hand(xrHands[0]),right=hand(xrHands[1]);
      Object.assign(input,mapearQuest(left,right));
    } else Object.assign(input,stick);
  }
}
function avanzarEstelas(dt,speed){
  estelasMesh.material.opacity=Math.max(0,Math.min(.75,(speed-34)/55));
  particulas.forEach((p,i)=>{p.z+=speed*dt;if(p.z>-2){p.z=-80;p.x=(Math.random()-.5)*42;p.y=(Math.random()-.5)*25;}
    estelas.set([p.x,p.y,p.z,p.x,p.y,p.z-p.largo],i*6);});
  estelasGeo.attributes.position.needsUpdate=true;
}
function startWorld() {
  running=true; elapsed=0; nextRing=0; previousFrameTime=null; state=crearVuelo(start);state.vy=13;state.checkpoint={...checkpointAire};camera.position.set(0,mode==='quest'?0:1.5,mode==='quest'?0:3.8); $('inicio').hidden=true; $('final').hidden=true;document.body.classList.add('jugando');
  if(mode==='celular')document.body.classList.add('tactil');
  $('progreso').textContent='Mirador · aro 0/8'; ventoSound(); aviso(mode==='quest'?'Manos abajo y al frente para bajar · arriba para frenar':mode==='celular'?'Inclina el teléfono hacia adelante para bajar':'S/↓ baja · W/↑ sube · mouse abajo baja',3.2);
}
let ventoSound=()=>{};
async function startPhone(){mode='celular';
  try{if(typeof DeviceOrientationEvent!=='undefined'&&DeviceOrientationEvent.requestPermission)await DeviceOrientationEvent.requestPermission();}catch{}
  if(!lastDeviceOrientation)await new Promise((resolve)=>{const timeout=setTimeout(done,500);function done(){clearTimeout(timeout);removeEventListener('deviceorientation',capture);resolve();}function capture(){done();}addEventListener('deviceorientation',capture,{once:true});});
  phoneNeutralBeta=lastDeviceOrientation?.beta??0;phoneNeutralGamma=lastDeviceOrientation?.gamma??0;
  startWorld();
}
$('celular').addEventListener('click',startPhone);
$('pc').addEventListener('click',()=>{mode='pc';startWorld();});
$('quest').disabled=true;
if(!navigator.xr)$('estado').textContent='Quest 3: abre esta página en el navegador del visor.';
else navigator.xr.isSessionSupported('immersive-vr').then((ok)=>{$('quest').disabled=!ok;if(!ok)$('estado').textContent='Este navegador no ofrece WebXR. Usa celular o computadora.';}).catch(()=>{$('estado').textContent='WebXR no está disponible. Usa celular o computadora.';});
$('quest').addEventListener('click',async()=>{
  if(!navigator.xr)return;
  try{const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']});renderer.xr.setReferenceSpaceType('local-floor');await renderer.xr.setSession(session);mode='quest';camera.position.set(0,0,0);camera.rotation.set(0,0,0);xrHands=[renderer.xr.getController(0),renderer.xr.getController(1)];xrHands.forEach((h,i)=>{rig.add(h);h.add(new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),new THREE.MeshBasicMaterial({color:i?0xf4be6b:0x65c9c1})));h.addEventListener('selectstart',()=>{if(running){state.vy=Math.max(state.vy,13);aviso('¡Impulso!',1);}});});startWorld();session.addEventListener('end',()=>{running=false;document.body.classList.remove('jugando');$('inicio').hidden=false;camera.position.set(0,2.8,18);camera.rotation.set(0,0,0);});}
  catch(e){$('estado').textContent=`No se pudo iniciar Quest: ${e.message}`;}
});
$('boton-saltar').addEventListener('pointerdown',(e)=>{e.preventDefault();if(running&&mode==='celular')state.vy=Math.max(state.vy,6);});
$('reiniciar').addEventListener('click',()=>{$('final').hidden=true;$('inicio').hidden=false;document.body.classList.remove('jugando','tactil');});
addEventListener('keydown',(e)=>{keys.add(e.key);if([' ','ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();if(e.key===' '&&!running&&mode==='pc')startWorld();});
addEventListener('keyup',(e)=>keys.delete(e.key));
renderer.domElement.addEventListener('pointermove',(e)=>{latestPointer.dx=Math.max(-1,Math.min(1,(e.clientX/innerWidth-.5)*2));latestPointer.dy=Math.max(-1,Math.min(1,(e.clientY/innerHeight-.5)*2));});
addEventListener('deviceorientation',(e)=>{lastDeviceOrientation={beta:e.beta,gamma:e.gamma};},{passive:true});
function tramo(v){let closest=0,min=Infinity;for(let i=0;i<routeSamples.length;i++){const p=routeSamples[i],d=(p.x-v.x)**2+(p.z-v.z)**2;if(d<min){min=d;closest=i;}}return {i:closest,dist:Math.sqrt(min),progress:closest/(routeSamples.length-1)};}
function actualizarPanel(panel,points){
  const pos=panel.mesh.geometry.attributes.position,verts=points.flat();
  pos.array.set(verts);pos.needsUpdate=true;panel.mesh.geometry.computeVertexNormals();panel.mesh.geometry.computeBoundingSphere();
  const edges=panel.edge.geometry.attributes.position.array;
  const pairs=panel.mesh.geometry.index.count===3?[[0,1],[1,2],[2,0]]:[[0,1],[1,3],[3,2],[2,0]];
  pairs.forEach(([a,b],i)=>{edges.set(points[a],i*6);edges.set(points[b],i*6+3);});panel.edge.geometry.attributes.position.needsUpdate=true;panel.edge.geometry.computeBoundingSphere();
}
function finish(){running=false;state.terminado=true;document.body.classList.remove('jugando','rapido');$('final').hidden=false;$('resultado').innerHTML=`${state.score.toLocaleString('es-MX')} puntos<br>${Math.floor(state.tiempo/60)}:${String(Math.floor(state.tiempo%60)).padStart(2,'0')} de vuelo<br>${state.choques} choques · ${state.aros}/8 aros`;
}
function paso(now){
  const stamp=Number.isFinite(now)?now:performance.now();
  const dt=previousFrameTime===null?1/72:deltaSegundos(stamp,previousFrameTime);previousFrameTime=stamp;
  if(running){elapsed+=dt;actualizarEntrada();
    if(mode==='quest'&&!state.impulsoQuest){const [left,right]=xrHands.map((h)=>h.position);if(left&&right&&Math.abs(left.x-right.x)>1.15){state.vy=Math.max(state.vy,13);state.impulsoQuest=true;aviso('¡Impulso! Pliega las alas para dirigir',1.4);}}
    const before=tramo(state);
    if(!state.paracaidas&&before.dist<900){const ahead=routeSamples[Math.min(routeSamples.length-1,before.i+2)],want=Math.atan2(-(ahead.x-state.x),-(ahead.z-state.z));let turn=((want-state.yaw+Math.PI*3)%(Math.PI*2))-Math.PI;state.yaw+=Math.max(-.55*dt,Math.min(.55*dt,turn));}
    actualizarVuelo(state,input,dt);
    const seg=tramo(state);const ground=altura(state.x,state.z);
    if(!state.paracaidas&&puedeResolverChoque(elapsed,start,state)&&(state.y<=ground+9||seg.dist>540)){const pared=seg.dist>540;resolverChoque(state,ground+9,pared);aviso(`${pared?'¡Pared del cañón!':'¡Terreno!'} Regresas al último aro`,1.8);}
    const cercaDelSuelo=multiplicadorAltura(state.y-ground);
    state.score+=Math.round(dt*state.velocidad*.12*cercaDelSuelo);
    if(!state.paracaidas&&registrarRozon(state,Math.abs(470-seg.dist),96))aviso('¡Rozón! +100',1.2);
    if(Math.abs(470-seg.dist)>135)state.rozon=false;
    if(nextRing<rings.length&&state.x**2+state.z**2>=-1){const r=rings[nextRing],d=Math.hypot(state.x-r.position.x,state.y-r.position.y,state.z-r.position.z);if(d<95){guardarCheckpoint(state,r.userData.point);nextRing++;aviso('¡Aro! +250',1.5);}}
    const progress=seg.progress;
    if(progress>.86&&!state.paracaidas){state.paracaidas=true;state.velocidad=Math.min(state.velocidad,24);aviso('¡Paracaídas! Dirígete al río',2.5);}
    if(state.paracaidas){const end=anchors.at(-1), desired=Math.atan2(-(end.x-state.x),-(end.z-state.z));let delta=((desired-state.yaw+Math.PI*3)%(Math.PI*2))-Math.PI;state.yaw+=Math.max(-.55*dt,Math.min(.55*dt,delta));state.velocidad=Math.max(15,state.velocidad-9*dt);const target=waterY+8;state.y+=Math.max(-8,Math.min(0,(target-state.y)*.32))*dt*4;if(progress>.97&&Math.hypot(state.x-end.x,state.z-end.z)<100&&Math.abs(state.y-target)<18)finish();}
    rig.position.set(state.x,state.y,state.z);rig.rotation.set(0,state.yaw,0);avatar.visible=mode!=='quest'&&!state.paracaidas;questWings.wings.visible=mode==='quest'&&!state.paracaidas;chute.visible=state.paracaidas;avatar.rotation.z=state.roll*.3;avatar.rotation.x=-state.pitch*.12;
    if(mode==='quest'){
      const [left,right]=xrHands.map((h)=>h.position),head=camera.position,hip=[0,head.y-1.05,head.z],leftLeg=[-.22,head.y-1.75,head.z-.05],rightLeg=[.22,head.y-1.75,head.z-.05];
      xrHands.forEach((hand,i)=>{const side=i===0?-1:1,h=[hand.position.x,hand.position.y,hand.position.z],shoulder=[side*.2,head.y-.45,head.z],joint=[side*.23,head.y-.95,head.z-.03],ankle=i===0?leftLeg:rightLeg;actualizarPanel(questWings.panels[i],[shoulder,h,joint,ankle]);segmento(questWings.sleeves[i],shoulder,h);});
      actualizarPanel(questWings.inner,[[0,head.y-1.05,head.z],[0,head.y-1.75,head.z-.05],leftLeg,rightLeg]);
    }
    camera.rotation.x=mode==='quest'?0:state.pitch*.16-.44;camera.rotation.z=mode==='quest'?0:-state.roll*.08;
    const sp=Math.round(state.velocidad),fov=mode==='quest'?74:74+Math.max(0,state.velocidad-38)*.48;if(Math.abs(camera.fov-fov)>.1){camera.fov=fov;camera.updateProjectionMatrix();}
    $('velocidad').textContent=`${sp} m/s`;$('puntos').textContent=`${state.score.toLocaleString('es-MX')} puntos`;$('progreso').textContent=state.paracaidas?'Paracaídas · al río':`Cañón · ${Math.round(progress*100)}% · aro ${nextRing}/8${cercaDelSuelo>1?` · ×${cercaDelSuelo.toFixed(1)} bajo`:''}`;
    if(sp>46)document.body.classList.add('rapido');else document.body.classList.remove('rapido');avanzarEstelas(dt,state.velocidad);viento(state.velocidad,state.pitch);
    if(elapsed>messageUntil)$('mensaje').style.opacity='0';
  }
}
// Un error en la lógica no debe dejar el visor en negro: siempre se dibuja.
let ultimoError='';
function tick(now){
  try{paso(now);}catch(e){const t=String(e?.message||e);if(t!==ultimoError){ultimoError=t;console.error(e);aviso(`Error: ${t}`,6);}}
  renderer.render(scene,camera);
}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.2));renderer.setSize(innerWidth,innerHeight);}
addEventListener('resize',resize);renderer.setAnimationLoop(tick);
// Audio starts only after a player chooses a mode.
ventoSound=()=>{viento=sonido()||(()=>{});};

// Keep the player above the high rim while the mode menu is open.
camera.position.set(0,2.8,18);rig.position.set(start.x,start.y,start.z);rig.rotation.y=start.yaw;
