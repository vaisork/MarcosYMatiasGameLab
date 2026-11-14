import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { objetivoMarcosUV } from './objetivos.mjs';

export default {
  id: 'marcos-uv', nombre: 'Cuarto de Luz UV', ambiente: { cielo: 0x352075, suelo: 0x6241a4, niebla: 0x49317e },
  crear(g, u) {
    u.plataforma(0, -.25, 0, 24, .5, 24, 0x7955c2);
    new GLTFLoader().load('modelos/marcos_uv_taller_r3.glb', ({ scene }) => {
      scene.traverse((o) => { if (o.isMesh) o.material = new THREE.MeshLambertMaterial({ color: o.material.color, emissive: o.material.emissive }); });
      g.add(scene);
    }, undefined, (e) => console.error('No se pudo cargar el taller UV', e));
    const arte = new THREE.TextureLoader().load(new URL('../../texturas/marcos-uv-diaz.webp', import.meta.url).href);
    const mat = new THREE.MeshStandardMaterial({ map: arte, color: 0xb78aff, emissive: 0x8f3fff, emissiveMap: arte, emissiveIntensity: .55, transparent: true, opacity: .2, side: THREE.DoubleSide, roughness: .7 });
    const grafitis = [];
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2), mat.clone());
      m.position.set(-7 + (i % 4) * 4.7, 2 + Math.floor(i / 4) * 2.2, -6.72);
      m.rotation.y = 0;
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
