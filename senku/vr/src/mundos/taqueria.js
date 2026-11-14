import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// GLB llega después del contenedor; objetivos y colisiones no esperan la descarga.
const cargarGlb = (ruta, llegar) => new GLTFLoader().load(ruta, ({ scene }) => {
  const mats = new Map();
  scene.traverse((o) => {
    if (!o.isMesh) return;
    const m = o.material;
    if (!mats.has(m)) mats.set(m, new THREE.MeshLambertMaterial({ color: m.color, emissive: m.emissive, name: m.name }));
    o.material = mats.get(m);
  });
  llegar(scene);
}, undefined, (e) => console.error('No se pudo cargar ' + ruta, e));
const mat = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });
const mesh = (g, geometry, material, pos, scale) => {
  const m = new THREE.Mesh(geometry, material); m.position.set(...pos); if (scale) m.scale.set(...scale); g.add(m); return m;
};
const cordel = (g, a, b, color = 0x8a4f2b, radio = .025) => {
  const v = new THREE.Vector3(...b).sub(new THREE.Vector3(...a));
  const m = mesh(g, new THREE.CylinderGeometry(radio, radio, v.length(), 6), mat(color), [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()); return m;
};

export default {
  id: 'taqueria', nombre: 'Mundo Taco',
  ambiente: { cielo: 0xf1a95f, suelo: 0x8b523b, niebla: 0xf3c078 },
  crear(g, u) {
    u.plataforma(0, -.25, 0, 9, 1, 9, 0xa66b45);
    const churus = [];
    const sitios = [[0, 3, -10], [9, 5, -12], [16, 8, -4], [11, 11, 6], [1, 8, 13], [-10, 6, 8], [-15, 4, -2]];
    const colores = [0xd09b53, 0xb96545, 0xe5bb69];
    sitios.forEach(([x, y, z], i) => {
      const pl = u.plataforma(x, y - .7, z, 6.4, .7, 4.8, colores[i % colores.length]);
      pl.visible = false;
      // Islas de tortilla tostada; cajas de colisión originales siguen activas.
      mesh(g, new THREE.CylinderGeometry(3.05, 3.15, .48, 12), mat(i % 2 ? 0xd89c50 : 0xe9b85e), [x, y - .59, z]);
      mesh(g, new THREE.CylinderGeometry(2.86, 2.86, .08, 12), mat(0xf0c978), [x, y - .31, z]);
      for (let k = 0; k < 3; k++) {
        const tostada = mesh(g, new THREE.SphereGeometry(.1, 6, 4), mat(0xb86b32), [x - 1.2 + k * 1.1, y - .08, z + (k % 2 ? .85 : -.8)], [1.2, .22, .7]);
        tostada.rotation.y = k * .7;
      }
      for (let k = 0; k < 2; k++) {
        const m = new THREE.Mesh(new THREE.CapsuleGeometry(.12, .34, 3, 7), new THREE.MeshBasicMaterial({ color: 0xffdc70 }));
        m.position.set(x + k * 1.2, y + 1.5, z + k * .6); m.rotation.z = Math.PI / 2; g.add(m);
        churus.push({ m, base: m.position.y, fase: x + z + k });
      }
    });
    cargarGlb('modelos/taco.glb', (modelo) => sitios.forEach(([x, y, z]) => {
      const taco = modelo.clone();
      taco.scale.set(1.25, 1.2, 1.3); taco.position.set(x, y - .366, z); g.add(taco);
    }));

    // Puesto central: comal, trompo y salsas.
    mesh(g, new THREE.CylinderGeometry(2.2, 2.35, .22, 20), mat(0x53636a), [0, .22, 0]);
    mesh(g, new THREE.CylinderGeometry(1.92, 2.08, .08, 20), mat(0xaab8b9), [0, .37, 0]);
    mesh(g, new THREE.CylinderGeometry(.36, .82, 1.9, 8), mat(0x9f3626), [0, 1.35, -.45]);
    mesh(g, new THREE.SphereGeometry(.28, 8, 6), mat(0xf4d394), [0, 2.37, -.45], [1, .65, 1]);
    for (let i = 0; i < 3; i++) {
      const flama = mesh(g, new THREE.ConeGeometry(.18, .65, 5), mat(i === 1 ? 0xffa21c : 0xffd248, { emissive: 0x7a2500 }), [-.55 + i * .55, .67, -.45]);
      flama.rotation.z = (i - 1) * .16;
    }
    [[-1.1, 0x4c9c42], [1.1, 0xc7432d]].forEach(([x, c]) => {
      mesh(g, new THREE.CylinderGeometry(.4, .3, .25, 10), mat(0xf5e8ce), [x, .53, 1.05]);
      mesh(g, new THREE.SphereGeometry(.31, 9, 6), mat(c), [x, .68, 1.05], [1, .3, 1]);
    });
    for (let i = 0; i < 5; i++) {
      const x = -5 + i * 2.5;
      const y = 7 + Math.abs(x) * .1;
      cordel(g, [x, y, -6], [x + 2.5, y - .25, -6]);
      const tri = mesh(g, new THREE.ConeGeometry(.6, .65, 3), mat([0x1c9b55, 0xf6f0db, 0xe54537][i % 3]), [x + 1.25, y - .5, -6]);
      tri.rotation.z = Math.PI;
    }
    return { churus, enemigos: [] };
  },
  actualizar(s, dt, ctx) { ctx.recoger(s.churus); },
  objetivo: { texto: 'Busca churus', meta: 14 },
};
