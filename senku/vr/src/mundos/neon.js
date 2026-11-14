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
    // Torres facetadas en el perímetro: dejan libre la ruta de rótulos del centro.
    const ventanas = new THREE.InstancedMesh(new THREE.BoxGeometry(.72, .95, .12), new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x42c5ff, emissiveIntensity: .8 }), 96);
    const torre = new THREE.Object3D(), ubicaciones = [[-13,-13],[-5,-14],[5,-14],[13,-13],[-14,2],[14,3],[-12,14],[0,14],[12,14]];
    ubicaciones.forEach(([x,z],i) => {
      const alto = 5 + (i * 7 % 6), tono = [0x32274b,0x3b2858,0x253c62][i%3];
      const fuste = new THREE.Mesh(new THREE.CylinderGeometry(1.45,1.8,alto,7),new THREE.MeshLambertMaterial({color:tono}));
      fuste.position.set(x,alto/2,z);g.add(fuste);
      const remate = new THREE.Mesh(new THREE.ConeGeometry(1.65,1.6,7),new THREE.MeshLambertMaterial({color:[0xff48cc,0x00e5ff,0xffdc4d][i%3],emissive:[0x6b123f,0x07506a,0x665012][i%3]}));
      remate.position.set(x,alto+.8,z);g.add(remate);
      for(let floor=0;floor<Math.floor(alto/2);floor++) for(let face=0;face<4;face++) {
        const a=face*Math.PI/2, radius=1.5;
        torre.position.set(x+Math.sin(a)*radius,1.5+floor*1.7,z+Math.cos(a)*radius);
        torre.rotation.set(0,a,0);torre.updateMatrix();ventanas.setMatrixAt(i*10+floor*4+face,torre.matrix);
      }
    });
    g.add(ventanas);
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
