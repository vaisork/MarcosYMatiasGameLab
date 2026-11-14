import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const mat = (color) => new THREE.MeshLambertMaterial({ color, flatShading: true });
const box = (g, size, color, pos, rot = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(...size), mat(color));
  m.position.set(...pos); m.rotation.z = rot; g.add(m); return m;
};
const cilindro = (g, r1, r2, h, color, pos, sides = 10) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, sides), mat(color));
  m.position.set(...pos); g.add(m); return m;
};

export default {
  id: 'churus', nombre: 'Mundo Churus',
  ambiente: { cielo: 0x83c8ef, suelo: 0xf5c974, niebla: 0xa6dbf3 },
  crear(g, u) {
    u.plataforma(0, -.25, 0, 9, 1, 9, 0xf2b95d);
    const churus = [];
    const sitios = [[0, 3, -10, 5], [9, 5, -13, 5], [16, 7, -5, 5], [12, 9, 5, 6], [3, 11, 10, 5], [-7, 8, 7, 5], [-13, 5, -1, 5], [-8, 4, -10, 5]];
    const felpas = [0xffd782, 0xf4a979, 0xedcd83];
    sitios.forEach(([x, y, z, w], i) => {
      const cajaColision = u.plataforma(x, y, z, w, .75, w, felpas[i % felpas.length]);
      cajaColision.visible = false;

      // Rascador central y aros de sisal.
      const alto = y + .375;
      cilindro(g, .2, .28, alto, 0xa8733f, [x, (y + .375) - alto / 2, z]);
      const vueltas = Math.max(5, Math.floor(alto * 6));
      const camino = Array.from({ length: vueltas * 3 + 1 }, (_, j) => {
        const t = j / (vueltas * 3);
        const a = t * vueltas * Math.PI * 2;
        return new THREE.Vector3(x + Math.cos(a) * .205, y + .34 - t * alto, z + Math.sin(a) * .205);
      });
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(camino), vueltas * 3, .028, 4, false), mat(0xd2b48c)));

      // Plataformas de postre; la caja invisible conserva colisión.
      const radio = w * .39;
      const postre = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8), mat(i % 2 ? 0xffe7d9 : 0xfff0c5));
      postre.position.set(x, y + .15, z); postre.scale.set(radio, .27, radio * .82); g.add(postre);
      const crema = new THREE.Mesh(new THREE.TorusGeometry(radio * .83, .13, 6, 20), mat(i % 2 ? 0xef9bb0 : 0xffd37b));
      crema.position.set(x, y + .29, z); crema.rotation.x = Math.PI / 2; g.add(crema);

      // Una caja abierta de Churu con rampa tubular para saltar al siguiente nivel.
      const paquete = new THREE.Group();
      box(paquete, [1.55, .86, .08], 0xf6a34a, [0, 0, 0]);
      box(paquete, [1.45, .72, .04], 0xffdf9a, [0, .01, .055]);
      box(paquete, [.55, .19, .05], 0xef7049, [0, -.1, .09]);
      paquete.position.set(x + w * .28, y + .88, z + w * .19);
      paquete.rotation.z = -.25; g.add(paquete);
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
    return { churus, enemigos: [] };
  },
  actualizar(s, dt, ctx) { ctx.recoger(s.churus); },
  objetivo: { texto: 'Busca churus', meta: 16 },
};
