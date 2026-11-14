import * as THREE from 'three';
import { objetivoNeon } from './objetivos.mjs';
export default {
  id: 'neon', nombre: 'Ciudad Neón', ambiente: { cielo: 0x21194f, suelo: 0x59367c, niebla: 0x39265f },
  crear(g, u) { u.plataforma(0,-.25,0,32,.5,32,0x75449a);const rotulos=[];for(let i=0;i<15;i++){const x=(i%5-2)*5,z=(Math.floor(i/5)-1)*5-3,m=new THREE.Mesh(new THREE.BoxGeometry(1.5,2,.35),new THREE.MeshLambertMaterial({color:0x554777,emissive:0x2b1e56,emissiveIntensity:.45}));m.position.set(x,2,z);g.add(m);rotulos.push(m);}return{rotulos,encendidos:new Set()}; },
  actualizar(s,dt,ctx){s.rotulos.forEach((m,i)=>{if(ctx.zarpazo(m.position,1.7)||ctx.cerca(m.position,1.3)){const n=s.encendidos.size;if(objetivoNeon(s,i).encendidos.size>n){const color=[0xff48cc,0x4deeff,0xffdc4d][n%3];m.material.color.setHex(color);m.material.emissive.setHex(color);m.material.emissiveIntensity=1.2;ctx.avisar(s.encendidos.size===15?'¡Ciudad iluminada! Estela neón al volver':'¡Rótulo encendido!');}}});if(s.encendidos.size===15&&!s.premiado){s.premiado=true;this.premio(ctx);}},
  premio(ctx){ctx.estelaNeon();},
  objetivo:{texto:'Prende 15 rótulos',meta:15},
};
