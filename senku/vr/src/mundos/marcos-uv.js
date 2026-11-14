import * as THREE from 'three';
import { objetivoMarcosUV } from './objetivos.mjs';

export default {
  id: 'marcos-uv', nombre: 'Cuarto de Luz UV', ambiente: { cielo: 0x352075, suelo: 0x6241a4, niebla: 0x49317e },
  crear(g, u) {
    u.plataforma(0, -.25, 0, 24, .5, 24, 0x7955c2);
    const arte = new THREE.TextureLoader().load(new URL('../../texturas/marcos-uv-diaz.webp', import.meta.url).href);
    const mat = new THREE.MeshStandardMaterial({ map: arte, color: 0xb78aff, emissive: 0x8f3fff, emissiveMap: arte, emissiveIntensity: .55, transparent: true, opacity: .2, side: THREE.DoubleSide, roughness: .7 });
    const grafitis = [];
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2), mat.clone());
      const ang = i * Math.PI / 3;
      m.position.set(Math.sin(ang) * 7, 2, Math.cos(ang) * 7);
      m.rotation.y = ang + Math.PI;
      g.add(m); grafitis.push(m);
    }
    return { grafitis, revelados: new Set(), premiado: false };
  },
  actualizar(s, dt, ctx) {
    if (!s.premiado) { s.premiado = true; ctx.sumarChurus(30); ctx.avisar('¡Premio asegurado! +30 churus'); }
    s.grafitis.forEach((m, i) => {
      if (!ctx.acariciar(m.position, 1.8) || s.revelados.has(i)) return;
      objetivoMarcosUV(s, i);
      m.material.opacity = 1;
      m.material.emissiveIntensity = 1.1;
      ctx.avisar(`¡Grafiti UV ${s.revelados.size}/6!`);
    });
  },
  objetivo: { texto: 'Revela 6 grafitis UV', meta: 6 },
};
