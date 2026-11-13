import * as THREE from 'three';
import { objetivoColumpiaEstilo } from './objetivos.mjs';

export default {
  id: 'columpia-estilo', nombre: 'Pista de Trucos', ambiente: { cielo: 0x83c8ef, suelo: 0x51536a, niebla: 0xabbbe0 },
  crear(g, u) {
    u.plataforma(0, -.25, 0, 30, .5, 30, 0x51536a);
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 4;
      u.plataforma(x, .3, -5, 3, .6, 4, 0x777995);
      const aro = new THREE.Mesh(new THREE.TorusGeometry(1.25, .12, 6, 16), new THREE.MeshBasicMaterial({ color: 0xffcf58 }));
      aro.position.set(x, 3 + i % 2, -7); g.add(aro);
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
