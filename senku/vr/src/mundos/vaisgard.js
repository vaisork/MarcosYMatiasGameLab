import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const lambert = (color) => new THREE.MeshLambertMaterial({ color, flatShading: true });
const entre = (g, geo, mat, a, b) => {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), d = vb.clone().sub(va);
  const m = new THREE.Mesh(geo(d.length()), mat); m.position.copy(va).add(vb).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(m); return m;
};

export default {
  id: 'vaisgard', nombre: 'Vaisgard',
  ambiente: { cielo: 0xf49b91, suelo: 0xb57761, niebla: 0xf6bf8a },
  crear(g, u) {
    const base = u.plataforma(0, -.25, 0, 10, 1, 10, 0xe6a071);
    base.material.color.setHex(0xc9866b);
    const piedra = lambert(0xb98169), sombra = lambert(0x78534c), madera = lambert(0x80502e), cuerda = lambert(0xd7bd8a), bandera = lambert(0xc83849);
    const torres = [[-7, -20, 10], [7, -20, 15], [12, 7, 19], [-10, 9, 13]];
    new GLTFLoader().load('modelos/vaisgard_penascos_r2.glb',({scene})=>torres.forEach(([x,z],i)=>{const peñasco=scene.clone(true);peñasco.position.set(x,0,z);if(i%2)peñasco.scale.x=.9;g.add(peñasco);}),undefined,(e)=>console.error('No se pudieron cargar los peñascos de Vaisgard',e));
    const dummy = new THREE.Object3D();
    const merlones = new THREE.InstancedMesh(new THREE.BoxGeometry(.62, .75, .62), piedra, torres.length * 8);
    const troneras = new THREE.InstancedMesh(new THREE.BoxGeometry(.18, 1.3, .14), sombra, torres.length * 8);
    g.add(merlones, troneras);
    let detalle = 0;
    torres.forEach(([x, z, h], i) => {
      const bloque = u.plataforma(x, h / 2, z, 4.5, h, 4.5, 0x90a4ae);
      bloque.visible = false;
      const fuste = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.45, h, 8), piedra);
      fuste.position.set(x, h / 2, z); g.add(fuste);
      const cornisa = new THREE.Mesh(new THREE.CylinderGeometry(2.55, 2.45, .34, 8), sombra);
      cornisa.position.set(x, h - .08, z); g.add(cornisa);
      const techo = new THREE.Mesh(new THREE.ConeGeometry(2.45, 3.2, 8), i % 2 ? lambert(0xc34e4f) : lambert(0xd79a53));
      techo.position.set(x, h + 1.45, z); g.add(techo);
      for (const side of [-1, 1]) {
        const asta = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, 2.2, 6), madera);
        asta.position.set(x + side * .95, h + 3.95, z); g.add(asta);
        const tela = new THREE.Mesh(new THREE.PlaneGeometry(.9, .55), bandera);
        tela.position.set(x + side * .55, h + 4.5, z + .03); tela.rotation.y = Math.PI / 2; g.add(tela);
      }
      for (let j = 0; j < 8; j++) {
        const a = j * Math.PI / 4 + Math.PI / 8;
        dummy.position.set(x + Math.cos(a) * 1.78, h + .62, z + Math.sin(a) * 1.78);
        dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); merlones.setMatrixAt(detalle, dummy.matrix);
        dummy.position.set(x + Math.cos(a) * 2.12, h * .58, z + Math.sin(a) * 2.12);
        dummy.rotation.set(0, -a, 0); dummy.updateMatrix(); troneras.setMatrixAt(detalle, dummy.matrix);
        detalle++;
      }
      // Bandas de sillares alternadas recorren la cara octagonal.
      for (let y = 1.4; y < h - 1; y += 2.2) {
        const franja = new THREE.Mesh(new THREE.CylinderGeometry(2.19, 2.19, .12, 8), i % 2 ? piedra : sombra);
        franja.position.set(x, y, z); g.add(franja);
      }
    });
    merlones.instanceMatrix.needsUpdate = true; troneras.instanceMatrix.needsUpdate = true;

    // Puente de tablones entre las dos primeras torres, con ligera pendiente.
    const [a, b] = torres;
    const inicio = [a[0] + 2, a[2] + .35, a[1]], fin = [b[0] - 2, b[2] + .35, b[1]];
    const tablones = new THREE.InstancedMesh(new THREE.BoxGeometry(.85, .14, 2.15), madera, 10);
    g.add(tablones);
    for (let i = 0; i < 10; i++) {
      const t = (i + .5) / 10;
      const p = inicio.map((v, k) => v + (fin[k] - v) * t);
      const paso = u.plataforma(p[0], p[1] - .07, p[2], .9, .25, 2.05, 0x80502e);
      paso.visible = false;
      dummy.position.set(p[0], p[1], p[2]); dummy.rotation.set(0, 0, Math.atan2(fin[1] - inicio[1], fin[0] - inicio[0])); dummy.updateMatrix();
      tablones.setMatrixAt(i, dummy.matrix);
    }
    tablones.instanceMatrix.needsUpdate = true;
    for (const side of [-1, 1]) {
      const z = (a[1] + b[1]) / 2 + side * 1.05;
      entre(g, (l) => new THREE.CylinderGeometry(.045, .045, l, 5), cuerda, [inicio[0], inicio[1] + 1.15, z], [fin[0], fin[1] + 1.15, z]);
      for (let i = 0; i <= 5; i++) {
        const t = i / 5, x = inicio[0] + (fin[0] - inicio[0]) * t, y = inicio[1] + (fin[1] - inicio[1]) * t;
        entre(g, (l) => new THREE.CylinderGeometry(.035, .035, l, 5), cuerda, [x, y + .1, z], [x, y + 1.15, z]);
      }
    }

    const enemigos = [];
    for (const [x, z] of [[-3, -12], [3, -17], [0, 3]]) {
      const grupo = new THREE.Group(), hueso = lambert(0xeceff1), oscuro = lambert(0x28303b);
      const cuerpo = new THREE.Mesh(new THREE.IcosahedronGeometry(.42, 1), hueso);
      cuerpo.scale.set(1.3, .72, .8); grupo.add(cuerpo);
      const craneo = new THREE.Mesh(new THREE.IcosahedronGeometry(.29, 1), hueso);
      craneo.position.set(0, .25, -.36); grupo.add(craneo);
      for (const ox of [-.13, .13]) {
        const ojo = new THREE.Mesh(new THREE.SphereGeometry(.085, 6, 4), oscuro);
        ojo.position.set(ox, .28, -.6); grupo.add(ojo);
      }
      const hocico = new THREE.Mesh(new THREE.ConeGeometry(.12, .25, 5), hueso);
      hocico.rotation.x = Math.PI / 2; hocico.position.set(0, .13, -.62); grupo.add(hocico);
      for (let i = 0; i < 4; i++) {
        const costilla = new THREE.Mesh(new THREE.TorusGeometry(.32 - i * .025, .035, 4, 8, Math.PI), hueso);
        costilla.position.set(0, .03 - i * .015, -.05 + i * .16); costilla.rotation.z = Math.PI; grupo.add(costilla);
      }
      for (let i=0;i<6;i++) {
        const vertebra = new THREE.Mesh(new THREE.SphereGeometry(.075,6,4),hueso);
        vertebra.position.set(0,.02,.48+i*.16); grupo.add(vertebra);
      }
      grupo.position.set(x, .55, z); g.add(grupo); enemigos.push({ grupo, vivo: true, fase: x });
    }
    return { churus: [], enemigos };
  },
  actualizar(s, dt, ctx) { ctx.golpearEnemigos(s.enemigos); },
  objetivo: { texto: 'Vence ratones-esqueleto', meta: 3 },
};
