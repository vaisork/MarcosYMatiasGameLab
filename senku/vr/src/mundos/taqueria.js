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
    mesh(g, new THREE.SphereGeometry(3, 12, 8), mat(0xffd777, { emissive: 0x75400d }), [0, 20, -34]);
    for (const [x, y, z] of [[-18, 13, -24], [14, 17, -29], [23, 11, -12]]) {
      for (let i = 0; i < 4; i++) mesh(g, new THREE.SphereGeometry(1, 8, 5), mat(i % 2 ? 0xffd19a : 0xffe0b2), [x + (i - 1.5) * 1.15, y + (i % 2) * .3, z], [1.45, .48, .72]);
    }
    const churus = [];
    const sitios = [[0, 3, -10], [9, 5, -12], [16, 8, -4], [11, 11, 6], [1, 8, 13], [-10, 6, 8], [-15, 4, -2]];
    const colores = [0xd09b53, 0xb96545, 0xe5bb69];
    sitios.forEach(([x, y, z], i) => {
      const pl = u.plataforma(x, y - .7, z, 6.4, .7, 4.8, colores[i % colores.length]);
      pl.visible = false;
      for (let k = 0; k < 2; k++) {
        const m = new THREE.Mesh(new THREE.CapsuleGeometry(.12, .34, 3, 7), new THREE.MeshBasicMaterial({ color: 0xffdc70 }));
        m.position.set(x + k * 1.2, y + 1.5, z + k * .6); m.rotation.z = Math.PI / 2; g.add(m);
        churus.push({ m, base: m.position.y, fase: x + z + k });
      }
    });
    cargarGlb('modelos/taco_isla_r4.glb', (modelo) => sitios.forEach(([x, y, z]) => {
      const taco = modelo.clone();
      taco.scale.set(2.35, 2.05, 2.35); taco.position.set(x, y + .4, z); g.add(taco);
    }));

    cargarGlb('modelos/taqueria_trompo_comal_r3.glb', (puesto) => { puesto.position.set(0, .5, -1); g.add(puesto); });
    for (let i = 0; i < 5; i++) {
      const x = -5 + i * 2.5;
      const y = 7 + Math.abs(x) * .1;
      cordel(g, [x, y, -6], [x + 2.5, y - .25, -6]);
      const tri = mesh(g, new THREE.ConeGeometry(.6, .65, 3), mat([0x1c9b55, 0xf6f0db, 0xe54537][i % 3]), [x + 1.25, y - .5, -6]);
      tri.rotation.z = Math.PI;
    }
    for(const z of [-17,-23]){cordel(g,[-15,15,z],[15,14,z],0x805129,.035);for(let i=0;i<9;i++){const foco=mesh(g,new THREE.SphereGeometry(.16,7,5),new THREE.MeshLambertMaterial({color:0xffdf73,emissive:0xffa000}),[-13+i*3.25,14.1+Math.sin(i/8*Math.PI)*.9,z]);}}
    return { churus, enemigos: [] };
  },
  actualizar(s, dt, ctx) { ctx.recoger(s.churus); },
  objetivo: { texto: 'Busca churus', meta: 14 },
};
