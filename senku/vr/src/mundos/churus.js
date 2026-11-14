import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const mat = (color) => new THREE.MeshLambertMaterial({ color, flatShading: true });
export default {
  id: 'churus', nombre: 'Mundo Churus',
  ambiente: { cielo: 0x83c8ef, suelo: 0xf5c974, niebla: 0xa6dbf3 },
  crear(g, u) {
    u.plataforma(0, -.25, 0, 9, 1, 9, 0xf2b95d);
    const churus = [];
    const sitios = [[0, 3, -10, 5], [9, 5, -13, 5], [16, 7, -5, 5], [12, 9, 5, 6], [3, 11, 10, 5], [-7, 8, 7, 5], [-13, 5, -1, 5], [-8, 4, -10, 5]];
    new GLTFLoader().load('modelos/churus_postres_r6.glb', ({ scene }) => {
      const variantes = ['platform_donut', 'platform_cupcake', 'platform_churro'];
      sitios.forEach(([x, y, z, w], i) => {
        const modelo = scene.getObjectByName(variantes[i % variantes.length])?.clone(true);
        if (!modelo) return;
        modelo.position.set(x, y - .35, z); modelo.scale.set(w / 5, .58, w / 5); g.add(modelo);
      });
    }, undefined, (e) => console.error('No se pudieron cargar los postres de Churus', e));
    const felpas = [0xffd782, 0xf4a979, 0xedcd83];
    sitios.forEach(([x, y, z, w], i) => {
      const cajaColision = u.plataforma(x, y, z, w, .75, w, felpas[i % felpas.length]);
      cajaColision.visible = false;

      // La colisión queda intacta; el GLB muestra postres con volumen real.

      if (i < sitios.length - 1) {
        const siguiente = sitios[i + 1];
        const inicio = new THREE.Vector3(x + 1.0, y + .2, z + 1.1);
        const fin = new THREE.Vector3(siguiente[0] - 1.1, siguiente[1] + .2, siguiente[2] + .8);
        for (let j = 0; j < 6; j++) {
          const t = (j + .5) / 6, p = inicio.clone().lerp(fin, t); p.y -= Math.sin(t * Math.PI) * .38;
          const plank = new THREE.Mesh(new THREE.BoxGeometry(inicio.distanceTo(fin) / 6 - .06, .13, .68), mat(0xb87845));
          plank.position.copy(p); plank.rotation.y = Math.atan2(fin.x - inicio.x, fin.z - inicio.z); g.add(plank);
        }
      }

      for (let k = 0; k < 2; k++) {
        const m = new THREE.Mesh(new THREE.CapsuleGeometry(.12, .34, 3, 7), new THREE.MeshBasicMaterial({ color: 0xffdc70 }));
        m.position.set(x + k * 1.4, y + 1.1, z - k * .8); m.rotation.z = Math.PI / 2; g.add(m);
        churus.push({ m, base: m.position.y, fase: x + z + k });
      }
    });
    new GLTFLoader().load('modelos/churus_parque_r3.glb', ({ scene }) => { scene.position.set(-2.8, .35, -1.8); scene.scale.setScalar(.55); g.add(scene); }, undefined, (e) => console.error('No se pudo cargar el parque Churu', e));
    const azucar = new THREE.InstancedMesh(new THREE.BoxGeometry(.12, .025, .055), new THREE.MeshLambertMaterial({ color: 0xfff1c2 }), 64);
    const migaja = new THREE.Object3D();
    for (let i = 0; i < 64; i++) {
      const a = i * 2.399, r = 1 + (i % 8) * .43;
      migaja.position.set(Math.cos(a) * r, .29, Math.sin(a) * r); migaja.rotation.y = a; migaja.updateMatrix(); azucar.setMatrixAt(i, migaja.matrix);
      azucar.setColorAt(i, new THREE.Color([0xfff1c2, 0xf7b955, 0xe88979, 0x9ccc65][i % 4]));
    }
    g.add(azucar);
    const nubeMat = new THREE.MeshLambertMaterial({ color: 0xfff7f0 });
    for (const [x, y, z, s] of [[-18, 9, -15, 1.5], [18, 12, -16, 1.8], [-20, 15, 8, 1.7], [19, 10, 13, 1.5], [0, 18, -25, 2]]) {
      const nube = new THREE.Group();
      for (const [dx, dy, dz, escala] of [[0, 0, 0, 1], [-.75, -.12, 0, .75], [.75, -.1, .05, .8], [.2, .32, .1, .7]]) {
        const algodon = new THREE.Mesh(new THREE.SphereGeometry(s * .7, 8, 6), nubeMat);
        algodon.position.set(dx * s, dy * s, dz * s); algodon.scale.set(escala, escala * .8, escala); nube.add(algodon);
      }
      nube.position.set(x, y, z); g.add(nube);
    }
    for(const [x,y,z,color] of [[-18,13,-16,0xff5f8f],[18,15,-12,0xffdb55],[-17,18,10,0x55d7e5],[17,17,12,0xff8c42]]){const dulce=new THREE.Group(),bola=new THREE.Mesh(new THREE.SphereGeometry(.48,8,6),new THREE.MeshLambertMaterial({color})),palo=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.9,6),new THREE.MeshLambertMaterial({color:0xf4e8cb}));bola.position.y=.6;palo.position.y=-.02;dulce.add(bola,palo);dulce.position.set(x,y,z);g.add(dulce);}
    return { churus, enemigos: [] };
  },
  actualizar(s, dt, ctx) { ctx.recoger(s.churus); },
  objetivo: { texto: 'Busca churus', meta: 16 },
};
