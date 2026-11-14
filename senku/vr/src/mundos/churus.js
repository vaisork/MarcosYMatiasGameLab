import * as THREE from 'three';

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

      // Plataformas blandas con reborde; la caja invisible conserva colisión.
      const radio = w * .39;
      cilindro(g, radio, radio, .08, 0xfff8e7, [x, y + .335, z], 14);
      const reborde = new THREE.Mesh(new THREE.TorusGeometry(radio * .9, .11, 5, 18), mat(0xf0a6b2));
      reborde.position.set(x, y + .39, z); reborde.rotation.x = Math.PI / 2; g.add(reborde);
      cilindro(g, radio * .75, radio * .75, .035, i % 2 ? 0xb9dff2 : 0xffd8dc, [x, y + .36, z], 14);

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
        const delta = new THREE.Vector3().subVectors(fin, inicio);
        const tubo = new THREE.Mesh(new THREE.CylinderGeometry(.19, .19, delta.length(), 10), mat(0xffcc78));
        tubo.position.copy(inicio).add(fin).multiplyScalar(.5); tubo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); g.add(tubo);
        const aro = new THREE.Mesh(new THREE.TorusGeometry(.19, .035, 5, 12), mat(0xfff0ce));
        aro.position.copy(fin); aro.quaternion.copy(tubo.quaternion); g.add(aro);
      }

      for (let k = 0; k < 2; k++) {
        const m = new THREE.Mesh(new THREE.CapsuleGeometry(.12, .34, 3, 7), new THREE.MeshBasicMaterial({ color: 0xffdc70 }));
        m.position.set(x + k * 1.4, y + 1.1, z - k * .8); m.rotation.z = Math.PI / 2; g.add(m);
        churus.push({ m, base: m.position.y, fase: x + z + k });
      }
    });
    return { churus, enemigos: [] };
  },
  actualizar(s, dt, ctx) { ctx.recoger(s.churus); },
  objetivo: { texto: 'Busca churus', meta: 16 },
};
