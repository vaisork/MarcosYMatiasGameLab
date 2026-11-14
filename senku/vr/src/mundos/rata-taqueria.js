import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// Carga asíncrona: el contenedor ya existe y la lógica lo mueve; el modelo se añade al llegar.
const cargarGlb = (ruta, llegar) => new GLTFLoader().load(ruta, (gl) => {
  const mats = new Map();
  gl.scene.traverse((o) => { if (!o.isMesh) return; const m = o.material; if (!mats.has(m)) mats.set(m, new THREE.MeshLambertMaterial({ color: m.color, emissive: m.emissive, name: m.name })); o.material = mats.get(m); });
  llegar(gl.scene, mats);
}, undefined, (e) => console.error('No se pudo cargar ' + ruta, e));
import { objetivoRataTaqueria } from './objetivos.mjs';

const crearMantel = () => {
  const lienzo = document.createElement('canvas'); lienzo.width = lienzo.height = 256;
  const ctx = lienzo.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#c62828';
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if ((x + y) % 2 === 0) ctx.fillRect(x * 64, y * 64, 64, 64);
  const textura = new THREE.CanvasTexture(lienzo); textura.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshLambertMaterial({ map: textura });
};

export default {
  id: 'rata-taqueria', nombre: 'Cocina de la Rata', ambiente: { cielo: 0xffc879, suelo: 0x8b553a, niebla: 0xf1bd72 },
  crear(g, u) {
    u.plataforma(0, -.25, 0, 24, .5, 24, 0x8b553a);
    cargarGlb('modelos/rata_cocina_fondo_r4.glb',(fondo)=>{fondo.position.set(0,0,-10);g.add(fondo);});
    const sitios = [[-5, -5], [5, -5], [5, 5], [-5, 5]];
    const mantel = crearMantel(), blanco = new THREE.MeshLambertMaterial({ color: 0xfff8e1 });
    sitios.forEach(([x, z]) => {
      u.plataforma(x, .8, z, 4, .25, 3, 0xa96f48);
      const cubierta = new THREE.Mesh(new THREE.BoxGeometry(4.05, .055, 3.05), mantel); cubierta.position.set(x, .96, z); g.add(cubierta);
      for (const side of [-1, 1]) {
        const faldon = new THREE.Mesh(new THREE.BoxGeometry(4.05, .38, .045), mantel); faldon.position.set(x, .74, z + side * 1.51); g.add(faldon);
        const lateral = new THREE.Mesh(new THREE.BoxGeometry(.045, .38, 3.05), mantel); lateral.position.set(x + side * 2.01, .74, z); g.add(lateral);
      }
      const plato = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.55, .16, 12), new THREE.MeshLambertMaterial({ color: 0xe7c47e }));
      plato.position.set(x - .55, 1.02, z + .12); g.add(plato);
      for (const side of [-1, 1]) {
        const sx = x + side * 2.15;
        const fuste = new THREE.Mesh(new THREE.CylinderGeometry(.055, .075, .72, 8), new THREE.MeshLambertMaterial({ color: 0xb0bec5 }));
        fuste.position.set(sx, .38, z); g.add(fuste);
        const pie = new THREE.Mesh(new THREE.CylinderGeometry(.3, .36, .11, 12), new THREE.MeshLambertMaterial({ color: 0xd32f2f }));
        pie.position.set(sx, .8, z); g.add(pie);
      }
      for (const [dx, dz, color] of [[1.32, .58, 0x43a047], [1.32, -.22, 0xd32f2f]]) {
        const botella = new THREE.Mesh(new THREE.CylinderGeometry(.14, .18, .48, 9), new THREE.MeshLambertMaterial({ color })); botella.position.set(x + dx, 1.22, z + dz); g.add(botella);
        const tapa = new THREE.Mesh(new THREE.ConeGeometry(.13, .22, 8), new THREE.MeshLambertMaterial({ color: color === 0x43a047 ? 0x76ff03 : 0xf4511e })); tapa.position.set(x + dx, 1.57, z + dz); g.add(tapa);
      }
      const servilletero = new THREE.Mesh(new THREE.BoxGeometry(.55, .42, .38), new THREE.MeshLambertMaterial({ color: 0xcfd8dc })); servilletero.position.set(x + 1.48, 1.17, z + 1.02); g.add(servilletero);
      const servilleta = new THREE.Mesh(new THREE.BoxGeometry(.42, .2, .3), blanco); servilleta.position.set(x + 1.48, 1.48, z + 1.02); g.add(servilleta);
      const canastilla = new THREE.Mesh(new THREE.BoxGeometry(.72, .12, .62), new THREE.MeshLambertMaterial({ color: 0xffca28 })); canastilla.position.set(x + .53, 1.04, z + 1.02); g.add(canastilla);
      for (let i = 0; i < 4; i++) { const totopo = new THREE.Mesh(new THREE.ConeGeometry(.19, .08, 3), new THREE.MeshLambertMaterial({ color: 0xfbc02d, side: THREE.DoubleSide })); totopo.position.set(x + .3 + (i % 2) * .28, 1.16, z + .9 + Math.floor(i / 2) * .2); totopo.rotation.z = Math.PI; g.add(totopo); }
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
