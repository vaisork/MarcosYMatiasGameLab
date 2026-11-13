import * as THREE from 'three';

const colores = {
  churus: { cielo: 0x83c8ef, suelo: 0xf5c974, niebla: 0xa6dbf3 },
  vaisgard: { cielo: 0x46315f, suelo: 0x302746, niebla: 0x65517c },
  taqueria: { cielo: 0xf1a95f, suelo: 0x8b523b, niebla: 0xf3c078 },
};

function cajaFisica(x, y, z, sx, sy, sz) {
  return { min: { x: x - sx / 2, y: y - sy / 2, z: z - sz / 2 }, max: { x: x + sx / 2, y: y + sy / 2, z: z + sz / 2 } };
}

export function crearMundosPortales(scene) {
  const mundos = {};
  for (const id of Object.keys(colores)) {
    const grupo = new THREE.Group();
    grupo.visible = false;
    grupo.add(new THREE.HemisphereLight(0xffe9d1, id === 'vaisgard' ? 0x39264f : 0x9c6d4a, 1.8));
    scene.add(grupo);
    mundos[id] = { grupo, cajas: [], churus: [], enemigos: [] };
  }

  function plataforma(id, x, y, z, sx, sy, sz, color, rotY = 0) {
    const mundo = mundos[id];
    const malla = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), new THREE.MeshLambertMaterial({ color }));
    malla.position.set(x, y, z); malla.rotation.y = rotY; mundo.grupo.add(malla);
    mundo.cajas.push(cajaFisica(x, y, z, sx, sy, sz));
    return malla;
  }

  function churu(id, x, y, z) {
    const malla = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.34, 3, 7), new THREE.MeshBasicMaterial({ color: 0xffdc70 }));
    malla.position.set(x, y, z); malla.rotation.z = Math.PI / 2; mundos[id].grupo.add(malla);
    mundos[id].churus.push({ malla, base: y, fase: x + z });
  }

  function torre(x, z, alto, color = 0x76647e) {
    const y = alto / 2;
    plataforma('vaisgard', x, y, z, 4.5, alto, 4.5, color);
    const almena = new THREE.Mesh(new THREE.ConeGeometry(3.4, 3, 4), new THREE.MeshLambertMaterial({ color: 0x43374f }));
    almena.position.set(x, alto + 1.5, z); almena.rotation.y = Math.PI / 4; mundos.vaisgard.grupo.add(almena);
    const fuego = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.25, 5), new THREE.MeshBasicMaterial({ color: 0xffa33e }));
    fuego.position.set(x, alto + 3, z); mundos.vaisgard.grupo.add(fuego);
  }

  // Mundo Churus: plataformas dulces suspendidas y churus flotantes.
  plataforma('churus', 0, -0.25, 0, 9, 1, 9, 0xf2b95d);
  [[0, 3, -10, 5], [9, 5, -13, 5], [16, 7, -5, 5], [12, 9, 5, 6], [3, 11, 10, 5], [-7, 8, 7, 5], [-13, 5, -1, 5], [-8, 4, -10, 5]].forEach(([x, y, z, s], i) => {
    plataforma('churus', x, y, z, s, 0.75, s, ['#ffd782', '#f4a979', '#edcd83'][i % 3]);
    churu('churus', x, y + 1.1, z);
    churu('churus', x + 1.4, y + 1.2, z - 0.8);
  });

  // Vaisgard: patio, castillo bajo, torres escalonadas y ratones-esqueleto.
  plataforma('vaisgard', 0, -0.25, 0, 10, 1, 10, 0x62566b);
  plataforma('vaisgard', 0, 2, -17, 12, 4, 8, 0x887892);
  plataforma('vaisgard', 0, 4.3, -17, 8, 0.7, 6, 0xb39aaa);
  torre(-7, -20, 10, 0xd0b9ce); torre(7, -20, 15, 0xd8c0d0);
  torre(12, 7, 19, 0x846879); torre(-10, 9, 13, 0x76647e);
  const keep = new THREE.Mesh(new THREE.BoxGeometry(8, 7, 5), new THREE.MeshBasicMaterial({ color: 0xb8a1c3 }));
  keep.position.set(0, 3.8, -27); mundos.vaisgard.grupo.add(keep);
  const techoKeep = new THREE.Mesh(new THREE.ConeGeometry(6.5, 3, 4), new THREE.MeshBasicMaterial({ color: 0xffcf70 }));
  techoKeep.position.set(0, 8.8, -27); techoKeep.rotation.y = Math.PI / 4; mundos.vaisgard.grupo.add(techoKeep);
  for (const x of [-2.3, 0, 2.3]) {
    const ventana = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.2, 0.08), new THREE.MeshBasicMaterial({ color: 0xffd47a }));
    ventana.position.set(x, 5.3, -24.46); mundos.vaisgard.grupo.add(ventana);
  }
  const puertaCastillo = new THREE.Mesh(new THREE.BoxGeometry(7, 4.5, 1.4), new THREE.MeshBasicMaterial({ color: 0xe0cba9 }));
  puertaCastillo.position.set(0, 2.25, -16.2); mundos.vaisgard.grupo.add(puertaCastillo);
  const arco = new THREE.Mesh(new THREE.ConeGeometry(4.3, 2.2, 4), new THREE.MeshBasicMaterial({ color: 0xffcf70 }));
  arco.position.set(0, 5.6, -16.2); arco.rotation.y = Math.PI / 4; mundos.vaisgard.grupo.add(arco);
  const porton = new THREE.Mesh(new THREE.BoxGeometry(1.7, 3.3, 0.12), new THREE.MeshBasicMaterial({ color: 0x493354 }));
  porton.position.set(0, 1.65, -15.45); mundos.vaisgard.grupo.add(porton);
  const puente = plataforma('vaisgard', 0, 8, 7, 21, 0.8, 3, 0x887477);
  puente.rotation.z = 0;
  for (const [x, z] of [[-3, -12], [3, -17], [0, 3]]) {
    const huesos = new THREE.Group();
    const hueso = new THREE.Mesh(new THREE.SphereGeometry(0.42, 7, 5), new THREE.MeshLambertMaterial({ color: 0xe6d9b8 }));
    hueso.scale.set(1.25, 0.7, 0.8); huesos.add(hueso);
    for (const dx of [-0.45, 0.45]) {
      const oreja = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 4), hueso.material); oreja.position.set(dx, 0.32, -0.1); huesos.add(oreja);
      const ojo = new THREE.Mesh(new THREE.SphereGeometry(0.07, 5, 4), new THREE.MeshBasicMaterial({ color: 0xe34d57 })); ojo.position.set(dx, 0.04, 0.35); huesos.add(ojo);
    }
    huesos.position.set(x, 0.55, z); mundos.vaisgard.grupo.add(huesos);
    mundos.vaisgard.enemigos.push({ grupo: huesos, vivo: true, fase: x });
  }

  // Mundo Taco: tacos gigantes con tortilla como plataformas anchas.
  plataforma('taqueria', 0, -0.25, 0, 9, 1, 9, 0xa66b45);
  [[0, 3, -10], [9, 5, -12], [16, 8, -4], [11, 11, 6], [1, 8, 13], [-10, 6, 8], [-15, 4, -2]].forEach(([x, y, z], i) => {
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 9, 6, 0, Math.PI), new THREE.MeshLambertMaterial({ color: i % 2 ? 0xf1c66d : 0xe9b85e, side: THREE.DoubleSide }));
    shell.scale.set(3.2, 1.3, 2.4); shell.position.set(x, y, z); shell.rotation.z = Math.PI; mundos.taqueria.grupo.add(shell);
    plataforma('taqueria', x, y - 0.7, z, 6.4, 0.7, 4.8, 0xd09b53);
    for (let k = 0; k < 3; k++) {
      const relleno = new THREE.Mesh(new THREE.ConeGeometry(0.3, 2.1, 5), new THREE.MeshLambertMaterial({ color: ['#63a552', '#d35f47', '#f4d37d'][k] }));
      relleno.position.set(x + (k - 1) * 1.5, y + 0.35, z); relleno.rotation.z = Math.PI / 2; mundos.taqueria.grupo.add(relleno);
    }
    churu('taqueria', x, y + 1.5, z);
    churu('taqueria', x + 1.2, y + 1.5, z + 0.6);
  });

  for (const [id, mundo] of Object.entries(mundos)) {
    const salida = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.18, 7, 18), new THREE.MeshBasicMaterial({ color: 0x79f2e1 }));
    salida.position.set(0, 1.6, 4); salida.rotation.y = Math.PI; mundo.grupo.add(salida);
    mundo.salida = salida;
    mundo.anclas = mundo.grupo;
    mundo.ambiente = colores[id];
  }
  return mundos;
}
