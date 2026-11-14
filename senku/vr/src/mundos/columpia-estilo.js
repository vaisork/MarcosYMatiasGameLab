import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { objetivoColumpiaEstilo } from './objetivos.mjs';

export default {
  id: 'columpia-estilo', nombre: 'Pista de Trucos', ambiente: { cielo: 0x83c8ef, suelo: 0x51536a, niebla: 0xabbbe0 },
  crear(g, u) {
    u.plataforma(0, -.25, 0, 30, .5, 30, 0x374957);
    new GLTFLoader().load('modelos/acrobacias_balizas_r2.glb',({scene})=>{for(let i=0;i<5;i++){const kit=scene.clone(true);kit.position.set((i-2)*4,.6,-5);kit.scale.setScalar(.55);g.add(kit);}},undefined,(e)=>console.error('No se pudieron cargar las balizas de acrobacia',e));
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 4;
      u.plataforma(x,.3,-5,3,.6,4,0x587486);
      const franja=new THREE.Mesh(new THREE.BoxGeometry(.32,.04,3.7),new THREE.MeshLambertMaterial({color:i%2?0xffffff:0x00e5ff,emissive:i%2?0x333333:0x004455}));franja.position.set(x,.62,-5);g.add(franja);
      const aro=new THREE.Group(), color=i%2?0xffcf58:0x00e5ff;
      const material=new THREE.MeshLambertMaterial({color,emissive:color,emissiveIntensity:.45});
      const exterior=new THREE.Mesh(new THREE.TorusGeometry(1.36,.19,8,24),new THREE.MeshLambertMaterial({color:0xe5a83b,emissive:0x5a3300}));
      const interior=new THREE.Mesh(new THREE.TorusGeometry(1.1,.095,6,20),material);aro.add(exterior,interior);
      const flecha=new THREE.Mesh(new THREE.ConeGeometry(.17,.5,5),new THREE.MeshLambertMaterial({color,emissive:color,emissiveIntensity:.8}));flecha.position.set(0,1.05,.03);aro.add(flecha);
      aro.position.set(x,3+i%2,-7);g.add(aro);
    }
    return { anteriores: [], girosActivos: [], piruetas: new Set(), punto: new THREE.Vector3(), premiado: false };
  },
  actualizar(s, dt, ctx) {
    if (!s.premiado) { s.premiado = true; ctx.sumarChurus(50); ctx.avisar('¡Premio asegurado! +50 churus'); }
    ctx.manos.forEach((mano, i) => {
      const q = mano.grip.quaternion;
      const anterior = s.anteriores[i];
      const velocidad = anterior && dt > 0 ? anterior.angleTo(q) / dt : 0;
      s.anteriores[i] = q.clone();
      if (velocidad < 3.2 || mano.garra.getWorldPosition(s.punto).y < 2.2) { s.girosActivos[i] = false; return; }
      if (s.girosActivos[i]) return;
      s.girosActivos[i] = true;
      objetivoColumpiaEstilo(s, s.piruetas.size);
      ctx.avisar(`¡Pirueta ${s.piruetas.size}/5!`);
    });
  },
  objetivo: { texto: 'Haz 5 piruetas con las manos', meta: 5 },
};
