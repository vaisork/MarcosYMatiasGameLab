import * as THREE from 'three';
import { objetivoFsGato } from './objetivos.mjs';

export default {
  id: 'fs-gato', nombre: 'Pecera Cielo', ambiente: { cielo: 0x75c7ed, suelo: 0x5ba8c2, niebla: 0x9fe1ed },
  crear(g, u) {
    u.plataforma(0, -.25, 0, 30, .5, 30, 0x5ba8c2);
    const burbujas = new THREE.InstancedMesh(new THREE.SphereGeometry(.28, 7, 5), new THREE.MeshBasicMaterial({ color: 0xc9f8ff, transparent: true, opacity: .72 }), 20);
    const sitios = Array.from({ length: 20 }, (_, i) => ({ x: Math.sin(i * 2.4) * (4 + i % 3 * 2), y: 1.2 + i % 5 * .65, z: Math.cos(i * 2.4) * (4 + i % 3 * 2), fase: i * .7 }));
    const dummy = new THREE.Object3D();
    sitios.forEach((p, i) => { dummy.position.set(p.x, p.y, p.z); dummy.updateMatrix(); burbujas.setMatrixAt(i, dummy.matrix); });
    g.add(burbujas);
    return { burbujas, sitios, dummy, reventadas: new Set(), tiempo: 0, premiado: false };
  },
  actualizar(s, dt, ctx) {
    if (!s.premiado) { s.premiado = true; ctx.sumarChurus(50); ctx.avisar('¡Premio asegurado! +50 churus'); }
    s.tiempo += dt;
    s.sitios.forEach((p, i) => {
      if (s.reventadas.has(i)) return;
      const y = p.y + Math.sin(s.tiempo * 2 + p.fase) * .12;
      if (ctx.acariciar({ x: p.x, y, z: p.z }, .85)) {
        objetivoFsGato(s, i);
        s.dummy.position.set(0, 0, 0); s.dummy.scale.setScalar(0);
        ctx.avisar(`¡Burbuja ${s.reventadas.size}/20!`);
      } else s.dummy.position.set(p.x, y, p.z);
      if (!s.reventadas.has(i)) s.dummy.scale.setScalar(1);
      s.dummy.updateMatrix(); s.burbujas.setMatrixAt(i, s.dummy.matrix);
    });
    s.burbujas.instanceMatrix.needsUpdate = true;
  },
  objetivo: { texto: 'Revienta 20 burbujas', meta: 20 },
};
