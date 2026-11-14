import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// Carga asíncrona: el contenedor ya existe y la lógica lo mueve; el modelo se añade al llegar.
const cargarGlb = (ruta, llegar) => new GLTFLoader().load(ruta, (gl) => {
  const mats = new Map();
  gl.scene.traverse((o) => { if (!o.isMesh) return; const m = o.material; if (!mats.has(m)) mats.set(m, new THREE.MeshLambertMaterial({ color: m.color, emissive: m.emissive, name: m.name })); o.material = mats.get(m); });
  llegar(gl.scene, mats);
}, undefined, (e) => console.error('No se pudo cargar ' + ruta, e));
import { objetivoLuke } from './objetivos.mjs';
const PELAJES=[0x777d87,0xe8a45a,0x3b3b44,0xf1eadf,0xb98458,0x9fb4c9,0xd68a5b,0x8f7aa5];
export default {
  id:'luke',nombre:'Patitas de Luke',ambiente:{cielo:0xb9d9ec,suelo:0xf3d8c0,niebla:0xd5e5ec},
  crear(g,u){u.plataforma(0,-.25,0,30,.5,30,0xf1d9bd);const gatitos=[];for(let i=0;i<8;i++){const m=new THREE.Group(),mat=new THREE.MeshLambertMaterial({color:PELAJES[i%PELAJES.length]}),b=new THREE.Mesh(new THREE.SphereGeometry(.45,8,6),mat);b.scale.set(1.2,.8,.8);m.add(b);cargarGlb('modelos/gatito.glb',(mod,mats)=>{mod.traverse(o=>{if(o.isMesh&&o.material.name==='pelaje')o.material=mat;});b.visible=false;mod.scale.setScalar(.9);mod.position.y=-.8;mod.rotation.y=Math.PI;m.add(mod);});m.position.set((i%4-1.5)*4,.8,(Math.floor(i/4)-.5)*5-3);g.add(m);gatitos.push(m);}return{gatitos,acariciados:new Set(),premiado:false};},
  actualizar(s,dt,ctx){s.gatitos.forEach((m,i)=>{if(ctx.acariciar(m.position,1.3)&&!s.acariciados.has(i)){objetivoLuke(s,i);m.children[0].material.color.setHex(0xffb5c8);ctx.avisar('¡Ronroneo!');}});if(s.acariciados.size===8&&!s.premiado){s.premiado=true;ctx.sumarCorazon(1);ctx.avisar('¡Luke te regala un corazón!');}},
  objetivo:{texto:'Acaricia 8 gatitos',meta:8},
};
