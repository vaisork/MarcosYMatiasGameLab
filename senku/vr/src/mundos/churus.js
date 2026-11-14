import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const mat = (color) => new THREE.MeshLambertMaterial({ color, flatShading: true });
const box = (g, size, color, pos, rot = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(...size), mat(color));
  m.position.set(...pos); m.rotation.z = rot; g.add(m); return m;
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

      // El modelo de churro reemplaza platillo y poste; la colisión invisible sigue intacta.

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
    new GLTFLoader().load('modelos/churus_plataformas_r4.glb', ({scene}) => sitios.forEach(([x,y,z,w])=>{const postre=scene.clone(true);postre.position.set(x,0,z);postre.scale.set(w/5*1.25,(y+.3)/2.96,w/5*1.25);g.add(postre);}),undefined,(e)=>console.error('No se pudieron cargar las plataformas de churro',e));
    new GLTFLoader().load('modelos/churus_parque_r3.glb', ({ scene }) => { scene.position.set(-2.8, .35, -1.8); scene.scale.setScalar(.55); g.add(scene); }, undefined, (e) => console.error('No se pudo cargar el parque Churu', e));
    for(const [x,y,z,color] of [[-18,13,-16,0xff5f8f],[18,15,-12,0xffdb55],[-17,18,10,0x55d7e5],[17,17,12,0xff8c42]]){const dulce=new THREE.Group(),bola=new THREE.Mesh(new THREE.SphereGeometry(.48,8,6),new THREE.MeshLambertMaterial({color})),palo=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.9,6),new THREE.MeshLambertMaterial({color:0xf4e8cb}));bola.position.y=.6;palo.position.y=-.02;dulce.add(bola,palo);dulce.position.set(x,y,z);g.add(dulce);}
    return { churus, enemigos: [] };
  },
  actualizar(s, dt, ctx) { ctx.recoger(s.churus); },
  objetivo: { texto: 'Busca churus', meta: 16 },
};
