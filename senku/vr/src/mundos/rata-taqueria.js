import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// Carga asíncrona: el contenedor ya existe y la lógica lo mueve; el modelo se añade al llegar.
const cargarGlb = (ruta, llegar) => new GLTFLoader().load(ruta, (gl) => {
  const mats = new Map();
  gl.scene.traverse((o) => { if (!o.isMesh) return; const m = o.material; if (!mats.has(m)) mats.set(m, new THREE.MeshLambertMaterial({ color: m.color, emissive: m.emissive, name: m.name })); o.material = mats.get(m); });
  llegar(gl.scene, mats);
}, undefined, (e) => console.error('No se pudo cargar ' + ruta, e));
import { objetivoRataTaqueria } from './objetivos.mjs';

export default {
  id: 'rata-taqueria', nombre: 'Cocina de la Rata', ambiente: { cielo: 0xffc879, suelo: 0x8b553a, niebla: 0xf1bd72 },
  crear(g, u) {
    u.plataforma(0, -.25, 0, 24, .5, 24, 0x8b553a);
    const sitios = [[-5, -5], [5, -5], [5, 5], [-5, 5]];
    sitios.forEach(([x, z]) => {
      u.plataforma(x, .8, z, 4, .25, 3, 0xa96f48);
      const plato = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.55, .16, 12), new THREE.MeshLambertMaterial({ color: 0xe7c47e }));
      plato.position.set(x, .92, z); g.add(plato);
      for (const side of [-1, 1]) {
        const sx = x + side * 2.15;
        const fuste = new THREE.Mesh(new THREE.CylinderGeometry(.055, .075, .72, 8), new THREE.MeshLambertMaterial({ color: 0xb0bec5 }));
        fuste.position.set(sx, .38, z); g.add(fuste);
        const pie = new THREE.Mesh(new THREE.CylinderGeometry(.3, .36, .11, 12), new THREE.MeshLambertMaterial({ color: 0xd32f2f }));
        pie.position.set(sx, .8, z); g.add(pie);
      }
      const limon = new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 5, 0, Math.PI), new THREE.MeshLambertMaterial({ color: 0x76ff03 }));
      limon.position.set(x - .95, 1.04, z + .3); limon.rotation.x = Math.PI / 2; g.add(limon);
      const servilleta = new THREE.Mesh(new THREE.ConeGeometry(.3, .035, 3), new THREE.MeshLambertMaterial({ color: 0xfff8e1, side: THREE.DoubleSide }));
      servilleta.position.set(x + .95, 1.04, z + .35); g.add(servilleta);
      const vidrio = new THREE.Mesh(new THREE.CylinderGeometry(.15, .19, .72, 10), new THREE.MeshLambertMaterial({ color: 0xff8f00, transparent: true, opacity: .82 }));
      vidrio.position.set(x, 1.34, z - 1.05); g.add(vidrio);
      const popote = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .55, 6), new THREE.MeshLambertMaterial({ color: 0xfff4dd }));
      popote.position.set(x + .05, 1.92, z - 1.05); g.add(popote);
    });
    cargarGlb('modelos/taco.glb', (modelo) => sitios.forEach(([x, z]) => {
      const taco = modelo.clone(); taco.scale.setScalar(.72); taco.position.set(x, .94, z); g.add(taco);
    }));

    // Comal central y trompo bajo guirnaldas de papel picado.
    const acero = new THREE.MeshLambertMaterial({ color: 0xaebdc0 });
    const comal = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.4, .22, 20), acero);
    comal.position.set(0, .2, 0); g.add(comal);
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 2, .08, 20), new THREE.MeshLambertMaterial({ color: 0x596970 }));
    disco.position.set(0, .35, 0); g.add(disco);
    const trompo = new THREE.Mesh(new THREE.CylinderGeometry(.32, .76, 1.7, 8), new THREE.MeshLambertMaterial({ color: 0xa63826 }));
    trompo.position.set(0, 1.25, 0); g.add(trompo);
    const pina = new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 6), new THREE.MeshLambertMaterial({ color: 0xf4c84a }));
    pina.position.set(0, 2.18, 0); g.add(pina);

    const colores = [0x16984e, 0xf6edda, 0xe24436];
    for (let i = 0; i < 7; i++) {
      const x = -7.5 + i * 2.5;
      const cuerda = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, 2.52, 5), new THREE.MeshLambertMaterial({ color: 0x704728 }));
      cuerda.position.set(x + 1.25, 6.1, -2.5); cuerda.rotation.z = -Math.PI / 2; g.add(cuerda);
      const bandera = new THREE.Mesh(new THREE.ConeGeometry(.45, .55, 3), new THREE.MeshLambertMaterial({ color: colores[i % 3], side: THREE.DoubleSide }));
      bandera.position.set(x + 1.25, 5.72, -2.5); bandera.rotation.z = Math.PI; g.add(bandera);
    }
    for (let row = 0; row < 2; row++) {
      const z = row ? 3 : -3.5;
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, 18, 5), new THREE.MeshLambertMaterial({ color: 0x704728 }));
      cable.position.set(0, 6.7, z); cable.rotation.z = Math.PI / 2; g.add(cable);
      for (let i = 0; i < 10; i++) {
        const bandera = new THREE.Mesh(new THREE.ConeGeometry(.36, .52, 4), new THREE.MeshLambertMaterial({ color: [0x16984e, 0xf6edda][(i + row) % 2], side: THREE.DoubleSide }));
        bandera.position.set(-8.1 + i * 1.8, 6.3, z); bandera.rotation.z = Math.PI; g.add(bandera);
      }
    }
    for (const [x, color] of [[-2.6, 0x4a9a45], [2.6, 0xc84630]]) {
      const tazon = new THREE.Mesh(new THREE.CylinderGeometry(.42, .3, .3, 10), new THREE.MeshLambertMaterial({ color: 0xf5e7cc }));
      tazon.position.set(x, .48, 1.6); g.add(tazon);
      const salsa = new THREE.Mesh(new THREE.SphereGeometry(.32, 9, 6), new THREE.MeshLambertMaterial({ color }));
      salsa.position.set(x, .64, 1.6); salsa.scale.y = .3; g.add(salsa);
    }
    const rata = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0x8d7067 });
    const cuerpo = new THREE.Mesh(new THREE.SphereGeometry(.55, 8, 6), mat); cuerpo.scale.set(1.2, .7, .8); rata.add(cuerpo);
    const oreja = new THREE.Mesh(new THREE.SphereGeometry(.22, 6, 4), new THREE.MeshLambertMaterial({ color: 0xe7a1a1 }));
    oreja.position.set(0, .4, -.35); rata.add(oreja);
    cargarGlb('modelos/rata.glb', (mod) => { rata.remove(cuerpo, oreja); mod.scale.setScalar(.85); mod.position.y = -.55; rata.add(mod); });
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
      s.rata.position.set(x, 1.45 + Math.sin(s.tiempo * 7) * .12, z); s.rata.rotation.y = Math.atan2(x, z);
      const golpe = ctx.zarpazo(s.rata.position, 1.25);
      const antes = s.capturas;
      objetivoRataTaqueria(s, golpe);
      if (s.capturas > antes) { s.rata.visible = false; s.espera = .45; ctx.avisar(`¡La pillaste! ${s.capturas}/5`); }
    }
  },
  objetivo: { texto: 'Pilla a la rata 5 veces', meta: 5 },
};
