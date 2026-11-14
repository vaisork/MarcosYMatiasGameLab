import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// Carga asíncrona: el contenedor ya existe y la lógica lo mueve; el modelo se añade al llegar.
const cargarGlb = (ruta, llegar) => new GLTFLoader().load(ruta, (gl) => {
  const mats = new Map();
  gl.scene.traverse((o) => { if (!o.isMesh) return; if (ruta.endsWith('/gatito.glb') && o.name === 'Cube') o.visible = false; const m = o.material; if (!mats.has(m)) mats.set(m, new THREE.MeshLambertMaterial({ color: m.color, emissive: m.emissive, name: m.name })); o.material = mats.get(m); });
  llegar(gl.scene, mats);
}, undefined, (e) => console.error('No se pudo cargar ' + ruta, e));
const cargarCuarto = (llegar) => cargarGlb('modelos/luke_cuarto_gatuno_r2.glb',(scene)=>llegar(scene));
import { objetivoLuke } from './objetivos.mjs';
const PELAJES=[0x777d87,0xe8a45a,0x3b3b44,0xf1eadf,0xb98458,0x9fb4c9,0xd68a5b,0x8f7aa5];
export default {
  id:'luke',nombre:'Patitas de Luke',ambiente:{cielo:0xb9d9ec,suelo:0xf3d8c0,niebla:0xd5e5ec},
  crear(g,u){u.plataforma(0,-.25,0,30,.5,30,0xf1d9bd);cargarCuarto((cuarto)=>{cuarto.position.set(0,0,0);g.add(cuarto);});
    const madera=new THREE.MeshLambertMaterial({color:0x8d6e63});
    for(const [x,z,sx,sz] of [[0,8.8,18,.14],[-8.8,0,.14,18],[8.8,0,.14,18]]){const zoclo=new THREE.Mesh(new THREE.BoxGeometry(sx,.36,sz),madera);zoclo.position.set(x,.24,z);g.add(zoclo);}
    const alfombra=new THREE.Mesh(new THREE.CylinderGeometry(3.5,3.5,.09,32),new THREE.MeshLambertMaterial({color:0xf8bbd0}));alfombra.position.set(0,.03,0);g.add(alfombra);
    const arbol=new THREE.Group(),tronco=new THREE.Mesh(new THREE.CylinderGeometry(.28,.48,2.4,8),new THREE.MeshLambertMaterial({color:0x9a603c}));tronco.position.y=1.2;arbol.add(tronco);
    const casita=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.35,1.5),new THREE.MeshLambertMaterial({color:0xe8a95d}));casita.position.set(0,2.1,0);arbol.add(casita);
    const techo=new THREE.Mesh(new THREE.ConeGeometry(1.35,.9,4),new THREE.MeshLambertMaterial({color:0x47a879}));techo.position.set(0,3.2,0);techo.rotation.y=Math.PI/4;arbol.add(techo);arbol.position.set(-4.5,0,-4.2);g.add(arbol);
    const lana=[0xe91e63,0x00bcd4,0xffeb3b];lana.forEach((color,i)=>{const bola=new THREE.Mesh(new THREE.SphereGeometry(.28,10,7),new THREE.MeshLambertMaterial({color}));bola.position.set([-6.5,6.4,7][i],.3,[1.5,-1.5,2][i]);g.add(bola);const puntos=Array.from({length:14},(_,j)=>new THREE.Vector3(bola.position.x+.16*j,.13+Math.sin(j*1.2)*.07,bola.position.z+.18*j));g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(puntos),26,.024,5,false),new THREE.MeshLambertMaterial({color})));});
    const pez=new THREE.Mesh(new THREE.SphereGeometry(.72,10,6),new THREE.MeshLambertMaterial({color:0x80cbc4}));pez.scale.set(1.25,.23,.72);pez.position.set(7,.15,0);g.add(pez);const cola=new THREE.Mesh(new THREE.ConeGeometry(.38,.65,3),pez.material);cola.rotation.z=Math.PI/2;cola.position.set(7.95,.15,0);g.add(cola);
    const cojin=new THREE.Mesh(new THREE.SphereGeometry(.72,10,6),new THREE.MeshLambertMaterial({color:0xf48fb1}));cojin.scale.set(1,.23,.85);cojin.position.set(-7,.15,0);g.add(cojin);for(let i=0;i<3;i++){const dedo=new THREE.Mesh(new THREE.SphereGeometry(.28,8,5),cojin.material);dedo.scale.y=.45;dedo.position.set(-7.55+i*.55,.14,-.72);g.add(dedo);}
    const gatitos=[];for(let i=0;i<8;i++){const m=new THREE.Group(),mat=new THREE.MeshLambertMaterial({color:PELAJES[i%PELAJES.length]}),b=new THREE.Mesh(new THREE.SphereGeometry(.45,8,6),mat);b.scale.set(1.2,.8,.8);m.add(b);cargarGlb('modelos/gatito.glb',(mod,mats)=>{mod.traverse(o=>{if(o.isMesh&&o.material.name==='pelaje')o.material=mat;});b.visible=false;mod.scale.setScalar(.9);mod.position.y=-.8;mod.rotation.y=Math.PI;m.add(mod);});m.position.set((i%4-1.5)*4,.8,(Math.floor(i/4)-.5)*5-3);g.add(m);gatitos.push(m);}return{gatitos,acariciados:new Set(),premiado:false};},
  actualizar(s,dt,ctx){s.gatitos.forEach((m,i)=>{if(ctx.acariciar(m.position,1.3)&&!s.acariciados.has(i)){objetivoLuke(s,i);m.children[0].material.color.setHex(0xffb5c8);ctx.avisar('¡Ronroneo!');}});if(s.acariciados.size===8&&!s.premiado){s.premiado=true;ctx.sumarCorazon(1);ctx.avisar('¡Luke te regala un corazón!');}},
  objetivo:{texto:'Acaricia 8 gatitos',meta:8},
};
