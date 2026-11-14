import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// Carga asíncrona: el contenedor ya existe y la lógica lo mueve; el modelo se añade al llegar.
const cargarGlb = (ruta, llegar) => new GLTFLoader().load(ruta, (gl) => {
  const mats = new Map();
  gl.scene.traverse((o) => { if (!o.isMesh) return; const m = o.material; if (!mats.has(m)) mats.set(m, new THREE.MeshLambertMaterial({ color: m.color, emissive: m.emissive, name: m.name })); o.material = mats.get(m); });
  llegar(gl.scene, mats);
}, undefined, (e) => console.error('No se pudo cargar ' + ruta, e));
import { objetivoBusqueda } from './objetivos.mjs';
const cargarTaller = (g) => new GLTFLoader().load('modelos/busqueda_taller_chatarra_r2.glb',({scene})=>{scene.position.set(0,0,-15);g.add(scene);},undefined,(e)=>console.error('No se pudo cargar el taller mecánico',e));
export default {id:'busqueda',nombre:'Cacería del Gato Mecánico',ambiente:{cielo:0x82bfd5,suelo:0xb98157,niebla:0xa8c4c3},
  crear(g,u){u.plataforma(0,-.25,0,34,.5,34,0x64736e);cargarTaller(g);
    const tubo=(puntos,color,radio=.16)=>{const curva=new THREE.CatmullRomCurve3(puntos.map(p=>new THREE.Vector3(...p)));g.add(new THREE.Mesh(new THREE.TubeGeometry(curva,24,radio,8,false),new THREE.MeshLambertMaterial({color})));};
    const caja=(x,y,z,color,tam=2)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(tam,tam,tam),new THREE.MeshLambertMaterial({color}));m.position.set(x,y,z);g.add(m);const aro=new THREE.Mesh(new THREE.BoxGeometry(tam+.08,.12,tam+.08),new THREE.MeshLambertMaterial({color:0xd9a85c}));aro.position.set(x,y,z);g.add(aro);};
    for(const side of [-1,1]){const x=side*12;tubo([[x,1,-18],[x,4,-18],[x,5,-16],[x,5,-12]],side<0?0x16b6c6:0xf0783f,.22);tubo([[x,1,-17],[x,1,-12],[x+side*1.2,1,-10]],0xe6b843,.12);caja(x,1,-10,side<0?0x397c65:0xb5533d);caja(x+side*2,1,-14,0xd19a45,1.5);
      const luz=new THREE.Mesh(new THREE.SphereGeometry(.3,8,5),new THREE.MeshBasicMaterial({color:side<0?0x40f0dc:0xffbc42}));luz.position.set(x,5.4,-16);g.add(luz);}
    const robot=new THREE.Group(),mat=new THREE.MeshLambertMaterial({color:0xd3a83e,emissive:0x332000});for(const [x,y,z,s] of [[0,0,0,[1,.55,.6]],[0,.5,-.25,[.55,.5,.5]],[-.25,.8,-.4,[.2,.45,.2]],[.25,.8,-.4,[.2,.45,.2]]]){const m=new THREE.Mesh(new THREE.BoxGeometry(...s),mat);m.position.set(x,y,z);robot.add(m);}cargarGlb('modelos/gato_mecanico.glb',(mod)=>{robot.children.slice().forEach(c=>robot.remove(c));mod.scale.setScalar(1.15);mod.position.y=-.5;mod.rotation.y=Math.PI;robot.add(mod);});robot.position.set(0,1,-8);g.add(robot);return{robot,capturas:0,atrapado:false,reloj:0,premiado:false};},
  actualizar(s,dt,ctx){s.reloj+=dt;s.robot.position.x=Math.sin(s.reloj*.7)*7;s.robot.position.y=1+Math.abs(Math.sin(s.reloj*1.4))*.8;const antes=s.capturas;objetivoBusqueda(s,ctx.atrapado(s.robot.position,2.5));if(s.capturas>antes){s.robot.visible=false;ctx.avisar(`¡Atrapado! ${s.capturas}/3`);setTimeout(()=>{s.robot.visible=true;},500);}if(s.capturas>=3&&!s.premiado){s.premiado=true;ctx.sumarChurus(100);ctx.avisar('¡100 churus!');}},
  objetivo:{texto:'Lánzale telaraña al gato 3 veces',meta:3},
};
