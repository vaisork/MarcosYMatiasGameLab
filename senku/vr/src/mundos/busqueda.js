import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// Carga asíncrona: el contenedor ya existe y la lógica lo mueve; el modelo se añade al llegar.
const cargarGlb = (ruta, llegar) => new GLTFLoader().load(ruta, (gl) => {
  const mats = new Map();
  gl.scene.traverse((o) => { if (!o.isMesh) return; const m = o.material; if (!mats.has(m)) mats.set(m, new THREE.MeshLambertMaterial({ color: m.color, emissive: m.emissive, name: m.name })); o.material = mats.get(m); });
  llegar(gl.scene, mats);
}, undefined, (e) => console.error('No se pudo cargar ' + ruta, e));
import { objetivoBusqueda } from './objetivos.mjs';
export default {id:'busqueda',nombre:'Cacería del Gato Mecánico',ambiente:{cielo:0x697b9c,suelo:0x626474,niebla:0x8792a2},
  crear(g,u){u.plataforma(0,-.25,0,34,.5,34,0x626474);const robot=new THREE.Group(),mat=new THREE.MeshLambertMaterial({color:0xd3a83e,emissive:0x332000});for(const [x,y,z,s] of [[0,0,0,[1,.55,.6]],[0,.5,-.25,[.55,.5,.5]],[-.25,.8,-.4,[.2,.45,.2]],[.25,.8,-.4,[.2,.45,.2]]]){const m=new THREE.Mesh(new THREE.BoxGeometry(...s),mat);m.position.set(x,y,z);robot.add(m);}cargarGlb('modelos/gato_mecanico.glb',(mod)=>{robot.children.slice().forEach(c=>robot.remove(c));mod.scale.setScalar(1.15);mod.position.y=-.5;mod.rotation.y=Math.PI;robot.add(mod);});robot.position.set(0,1,-8);g.add(robot);return{robot,capturas:0,atrapado:false,reloj:0,premiado:false};},
  actualizar(s,dt,ctx){s.reloj+=dt;s.robot.position.x=Math.sin(s.reloj*.7)*7;s.robot.position.y=1+Math.abs(Math.sin(s.reloj*1.4))*.8;const antes=s.capturas;objetivoBusqueda(s,ctx.atrapado(s.robot.position,2.5));if(s.capturas>antes){s.robot.visible=false;ctx.avisar(`¡Atrapado! ${s.capturas}/3`);setTimeout(()=>{s.robot.visible=true;},500);}if(s.capturas>=3&&!s.premiado){s.premiado=true;ctx.sumarChurus(100);ctx.avisar('¡100 churus!');}},
  objetivo:{texto:'Lánzale telaraña al gato 3 veces',meta:3},
};
