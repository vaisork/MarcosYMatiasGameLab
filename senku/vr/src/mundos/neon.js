import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { objetivoNeon } from './objetivos.mjs';
const barra = (grupo, a, b, radio, material) => {
  const inicio=new THREE.Vector3(...a), fin=new THREE.Vector3(...b), delta=fin.clone().sub(inicio);
  const m=new THREE.Mesh(new THREE.CylinderGeometry(radio,radio,delta.length(),6),material);
  m.position.copy(inicio).add(fin).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()); grupo.add(m);
};
export default {
  id: 'neon', nombre: 'Ciudad Neón', ambiente: { cielo: 0x21194f, suelo: 0x59367c, niebla: 0x39265f },
  crear(g, u) {
    u.plataforma(0,-.25,0,32,.5,32,0x211b38);
    new GLTFLoader().load('modelos/neon_skyline_r2.glb',({scene})=>{scene.position.y=0;g.add(scene);},undefined,(e)=>console.error('No se pudo cargar skyline neón',e));
    const rotulos=[];
    for(let i=0;i<15;i++){
      const x=(i%5-2)*5,z=(Math.floor(i/5)-1)*5-3;
      const caja=new THREE.Mesh(new THREE.BoxGeometry(1.5,2,.42),new THREE.MeshLambertMaterial({color:0x32274b,emissive:0x271249,emissiveIntensity:.5}));
      caja.position.set(x,2,z);g.add(caja);
      const marco=new THREE.Group(), material=new THREE.MeshLambertMaterial({color:0x00e5ff,emissive:0x00e5ff,emissiveIntensity:1});
      for(const [a,b] of [[[-.82,-1.07,.24],[.82,-1.07,.24]],[[-.82,1.07,.24],[.82,1.07,.24]],[[-.82,-1.07,.24],[-.82,1.07,.24]],[[.82,-1.07,.24],[.82,1.07,.24]]])barra(marco,[x+a[0],2+a[1],z+a[2]],[x+b[0],2+b[1],z+b[2]],.035,material);
      g.add(marco);rotulos.push({m:caja,marco,material});
    }
    return{rotulos,encendidos:new Set(),reloj:0};
  },
  actualizar(s,dt,ctx){
    s.reloj+=dt;
    s.rotulos.forEach(({m,marco,material},i)=>{
      if(!s.encendidos.has(i))material.emissiveIntensity=.65+Math.sin(s.reloj*3+i)*.35;
      if(ctx.zarpazo(m.position,1.7)||ctx.cerca(m.position,1.3)){
        const n=s.encendidos.size;
        if(objetivoNeon(s,i).encendidos.size>n){const color=[0xff48cc,0x4deeff,0xffdc4d][n%3];m.material.color.setHex(color);m.material.emissive.setHex(color);material.color.setHex(color);material.emissive.setHex(color);material.emissiveIntensity=1.6;ctx.avisar(s.encendidos.size===15?'¡Ciudad iluminada! Estela neón al volver':'¡Rótulo encendido!');}
      }
    });
    if(s.encendidos.size===15&&!s.premiado){s.premiado=true;this.premio(ctx);}
  },
  premio(ctx){ctx.estelaNeon();},
  objetivo:{texto:'Prende 15 rótulos',meta:15},
};
