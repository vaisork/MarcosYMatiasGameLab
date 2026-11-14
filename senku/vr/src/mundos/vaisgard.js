import * as THREE from 'three';
export default {
  id: 'vaisgard', nombre: 'Vaisgard', ambiente: { cielo: 0xf0a0b4, suelo: 0xc57869, niebla: 0xf2bd91 },
  crear(g, u) {
    const base = u.plataforma(0, -.25, 0, 10, 1, 10, 0xe6a071);
    base.material.emissive.setHex(0x6e3028); base.material.emissiveIntensity = .22;
    for (const [x, z, h] of [[-7, -20, 10], [7, -20, 15], [12, 7, 19], [-10, 9, 13]]) {
      const plataforma = u.plataforma(x, h / 2, z, 4.5, h, 4.5, 0xd78b91);
      plataforma.material.emissive.setHex(0x71364f); plataforma.material.emissiveIntensity = .3;
      const torre = new THREE.Mesh(new THREE.ConeGeometry(3.4, 3, 4), new THREE.MeshLambertMaterial({ color: 0x87506a, emissive: 0x542044, emissiveIntensity: .45 }));
      torre.position.set(x, h + 1.5, z); torre.rotation.y = Math.PI / 4; g.add(torre);
    }
    const enemigos = [];
    for (const [x, z] of [[-3, -12], [3, -17], [0, 3]]) {
      const grupo = new THREE.Group();
      const material = new THREE.MeshLambertMaterial({ color: 0xffe1a3, emissive: 0x8c5429, emissiveIntensity: .35 });
      const cuerpo = new THREE.Mesh(new THREE.SphereGeometry(.42, 7, 5), material);
      cuerpo.scale.set(1.25, .7, .8); grupo.add(cuerpo); grupo.position.set(x, .55, z); g.add(grupo);
      enemigos.push({ grupo, vivo: true, fase: x });
    }
    return { churus: [], enemigos };
  },
  actualizar(s, dt, ctx) { ctx.golpearEnemigos(s.enemigos); },
  objetivo: { texto: 'Vence ratones-esqueleto', meta: 3 },
};
