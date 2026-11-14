import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// Carga asíncrona: el contenedor ya existe y la lógica lo mueve; el modelo se añade al llegar.
const cargarGlb = (ruta, llegar) => new GLTFLoader().load(ruta, (gl) => {
  const mats = new Map();
  gl.scene.updateMatrixWorld(true);
  gl.scene.traverse((o) => {
    if (!o.isMesh) return;
    if (ruta.endsWith('/gatito.glb') && o.name === 'Cube') o.visible = false;
    if (ruta.endsWith('/luke_cuarto_gatuno_r2.glb')) {
      o.geometry.computeBoundingBox();
      const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
      if (b.min.x < 3 && b.max.x > -3 && b.min.z < 0 && b.max.z > -7 && b.max.y > .5) o.visible = false;
    }
    const m = o.material;
    if (!mats.has(m)) mats.set(m, new THREE.MeshLambertMaterial({ color: ruta.endsWith('/luke_cuarto_gatuno_r2.glb') && o.name === 'Plush_round_rug' ? 0x7cb342 : m.color, emissive: m.emissive, name: m.name }));
    o.material = mats.get(m);
  });
  llegar(gl.scene, mats);
}, undefined, (e) => console.error('No se pudo cargar ' + ruta, e));
const cargarCuarto = (llegar) => cargarGlb('modelos/luke_cuarto_gatuno_r2.glb',(scene)=>llegar(scene));
import { objetivoLuke } from './objetivos.mjs';
const PELAJES=[0x777d87,0xe8a45a,0x3b3b44,0xf1eadf,0xb98458,0x9fb4c9,0xd68a5b,0x8f7aa5];
export default {
  id:'luke',nombre:'Patitas de Luke',ambiente:{cielo:0xb9d9ec,suelo:0x7cb342,niebla:0xd5e5ec},
  crear(g,u){u.plataforma(0,-.25,0,30,.5,30,0x7cb342);cargarCuarto((cuarto)=>{cuarto.position.set(0,0,0);g.add(cuarto);});
    const madera=new THREE.MeshLambertMaterial({color:0x8d6e63});
    for(const [x,z,sx,sz] of [[0,8.8,18,.14],[-8.8,0,.14,18],[8.8,0,.14,18]]){const zoclo=new THREE.Mesh(new THREE.BoxGeometry(sx,.36,sz),madera);zoclo.position.set(x,.24,z);g.add(zoclo);}
    const alfombra=new THREE.Mesh(new THREE.CylinderGeometry(3.5,3.5,.09,32),new THREE.MeshLambertMaterial({color:0xfff9c4}));alfombra.position.set(0,.03,0);g.add(alfombra);
    cargarGlb('modelos/luke_juguetes_r5.glb',(juguetes)=>g.add(juguetes));
    const lana=[0xe91e63,0x00bcd4,0xffeb3b];lana.forEach((color,i)=>{const bola=new THREE.Mesh(new THREE.SphereGeometry(.28,10,7),new THREE.MeshLambertMaterial({color}));bola.position.set([-6.5,6.4,7][i],.3,[1.5,-1.5,2][i]);g.add(bola);const puntos=Array.from({length:14},(_,j)=>new THREE.Vector3(bola.position.x+.16*j,.13+Math.sin(j*1.2)*.07,bola.position.z+.18*j));g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(puntos),26,.024,5,false),new THREE.MeshLambertMaterial({color})));});
    const pez=new THREE.Mesh(new THREE.SphereGeometry(.72,10,6),new THREE.MeshLambertMaterial({color:0x80cbc4}));pez.scale.set(1.25,.23,.72);pez.position.set(7,.15,0);g.add(pez);const cola=new THREE.Mesh(new THREE.ConeGeometry(.38,.65,3),pez.material);cola.rotation.z=Math.PI/2;cola.position.set(7.95,.15,0);g.add(cola);
    const cojin=new THREE.Mesh(new THREE.SphereGeometry(.72,10,6),new THREE.MeshLambertMaterial({color:0xf48fb1}));cojin.scale.set(1,.23,.85);cojin.position.set(-7,.15,0);g.add(cojin);for(let i=0;i<3;i++){const dedo=new THREE.Mesh(new THREE.SphereGeometry(.28,8,5),cojin.material);dedo.scale.y=.45;dedo.position.set(-7.55+i*.55,.14,-.72);g.add(dedo);}
    const gatitos=[];for(let i=0;i<8;i++){const m=new THREE.Group(),mat=new THREE.MeshLambertMaterial({color:PELAJES[i%PELAJES.length]}),b=new THREE.Mesh(new THREE.SphereGeometry(.45,8,6),mat);b.scale.set(1.2,.8,.8);m.add(b);cargarGlb('modelos/gatito.glb',(mod,mats)=>{mod.traverse(o=>{if(o.isMesh&&o.material.name==='pelaje')o.material=mat;});b.visible=false;mod.scale.setScalar(.9);mod.position.y=-.8;mod.rotation.y=Math.PI;m.add(mod);});const x=[-7.5,-4.5,4.5,7.5][i%4],z=i<4?-4.5:4.5;const tapete=new THREE.Mesh(new THREE.CylinderGeometry(1.55,1.55,.08,20),new THREE.MeshLambertMaterial({color:0xfff9c4}));tapete.position.set(x,.035,z);g.add(tapete);m.position.set(x,.8,z);g.add(m);gatitos.push(m);}return{gatitos,acariciados:new Set(),premiado:false};},
  actualizar(s,dt,ctx){s.gatitos.forEach((m,i)=>{if(ctx.acariciar(m.position,1.3)&&!s.acariciados.has(i)){objetivoLuke(s,i);m.children[0].material.color.setHex(0xffb5c8);ctx.avisar('¡Ronroneo!');}});if(s.acariciados.size===8&&!s.premiado){s.premiado=true;ctx.sumarCorazon(1);ctx.avisar('¡Luke te regala un corazón!');}},
  objetivo:{texto:'Acaricia 8 gatitos',meta:8},
};
