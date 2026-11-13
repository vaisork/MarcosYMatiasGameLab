import * as THREE from 'three';
import { objetivoRataTaqueria } from './objetivos.mjs';

export default {
  id: 'rata-taqueria', nombre: 'Cocina de la Rata', ambiente: { cielo: 0xffc879, suelo: 0x8b553a, niebla: 0xf1bd72 },
  crear(g, u) {
    u.plataforma(0, -.25, 0, 24, .5, 24, 0x8b553a);
    const sitios = [[-5, -5], [5, -5], [5, 5], [-5, 5]];
    sitios.forEach(([x, z]) => {
      u.plataforma(x, .8, z, 4, .25, 3, 0xa96f48);
      const taco = new THREE.Mesh(new THREE.SphereGeometry(.48, 8, 5), new THREE.MeshLambertMaterial({ color: 0xffd36c }));
      taco.position.set(x, 1.3, z); taco.scale.set(1.1, .45, .7); g.add(taco);
    });
    const rata = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0x8d7067 });
    const cuerpo = new THREE.Mesh(new THREE.SphereGeometry(.55, 8, 6), mat); cuerpo.scale.set(1.2, .7, .8); rata.add(cuerpo);
    const oreja = new THREE.Mesh(new THREE.SphereGeometry(.22, 6, 4), new THREE.MeshLambertMaterial({ color: 0xe7a1a1 }));
    oreja.position.set(0, .4, -.35); rata.add(oreja);
    g.add(rata);
    return { rata, sitios, capturas: 0, atrapada: false, tiempo: 0, espera: 0, premiado: false };
  },
  actualizar(s, dt, ctx) {
    if (!s.premiado) { s.premiado = true; ctx.sumarChurus(40); ctx.avisar('¡Premio asegurado! +40 churus'); }
    s.tiempo += dt;
    if (s.espera > 0) { s.espera -= dt; s.rata.visible = false; objetivoRataTaqueria(s, false); }
    else {
      s.rata.visible = true;
      const [x, z] = s.sitios[Math.floor(s.tiempo / 1.5) % s.sitios.length];
      s.rata.position.set(x, 1.45 + Math.sin(s.tiempo * 7) * .12, z);
      const golpe = ctx.zarpazo(s.rata.position, 1.25);
      const antes = s.capturas;
      objetivoRataTaqueria(s, golpe);
      if (s.capturas > antes) { s.rata.visible = false; s.espera = .45; ctx.avisar(`¡La pillaste! ${s.capturas}/5`); }
    }
  },
  objetivo: { texto: 'Pilla a la rata 5 veces', meta: 5 },
};
