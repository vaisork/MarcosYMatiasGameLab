import * as THREE from 'three';
import { objetivoLuke } from './objetivos.mjs';
export default {
  id:'luke',nombre:'Patitas de Luke',ambiente:{cielo:0xb9d9ec,suelo:0xf3d8c0,niebla:0xd5e5ec},
  crear(g,u){u.plataforma(0,-.25,0,30,.5,30,0xf1d9bd);const gatitos=[];for(let i=0;i<8;i++){const m=new THREE.Group(),mat=new THREE.MeshLambertMaterial({color:0x777d87}),b=new THREE.Mesh(new THREE.SphereGeometry(.45,8,6),mat);b.scale.set(1.2,.8,.8);m.add(b);for(const x of [-.25,.25]){const e=new THREE.Mesh(new THREE.ConeGeometry(.15,.4,5),mat);e.position.set(x,.4,0);m.add(e);}m.position.set((i%4-1.5)*4,.8,(Math.floor(i/4)-.5)*5-3);g.add(m);gatitos.push(m);}return{gatitos,acariciados:new Set(),premiado:false};},
  actualizar(s,dt,ctx){s.gatitos.forEach((m,i)=>{if(ctx.acariciar(m.position,1.3)&&!s.acariciados.has(i)){objetivoLuke(s,i);m.children[0].material.color.setHex(0xffb5c8);ctx.avisar('¡Ronroneo!');}});if(s.acariciados.size===8&&!s.premiado){s.premiado=true;ctx.sumarCorazon(1);ctx.avisar('¡Luke te regala un corazón!');}},
  objetivo:{texto:'Acaricia 8 gatitos',meta:8},
};
