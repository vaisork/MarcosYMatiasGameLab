import * as THREE from 'three';
import { objetivoSenku2 } from './objetivos.mjs';

export default {
  id: 'senku2',
  nombre: 'Pista Senku 2',
  ambiente: { cielo: 0x4aa5e6, suelo: 0xf5b565, niebla: 0x8ed0f8 },
  crear(g, u) {
    u.plataforma(0, -0.25, 0, 12, 0.5, 12, 0xef9a48);
    u.plataforma(0, 1.5, -96, 14, 0.5, 14, 0xef9a48);

    const aros = [];
    const matAro = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
    const matAncla = new THREE.MeshLambertMaterial({ color: 0xffd23f, emissive: 0x443000 });
    const geomAro = new THREE.TorusGeometry(1.6, 0.16, 8, 20);
    const geomAncla = new THREE.BoxGeometry(0.8, 0.8, 0.8);

    const ruta = [
      [0, 2.5, -7],
      [-3, 3.8, -15],
      [-5, 5.0, -23],
      [-2, 5.8, -31],
      [3, 5.5, -39],
      [6, 4.8, -47],
      [4, 5.6, -55],
      [-1, 6.2, -63],
      [-5, 5.8, -71],
      [-3, 4.8, -79],
      [0, 3.8, -87],
      [0, 2.8, -94],
    ];

    ruta.forEach(([x, y, z], i) => {
      const aro = new THREE.Mesh(geomAro, matAro.clone());
      aro.position.set(x, y, z);
      g.add(aro);
      aros.push(aro);

      const ancla = new THREE.Mesh(geomAncla, matAncla);
      ancla.position.set(x, y + 2.5, z);
      g.add(ancla);

      if (i % 3 === 2) {
        u.plataforma(x, y - 3.5, z, 5, 0.5, 5, 0xdf8437);
      }
    });

    return {
      aros,
      cruzados: new Set(),
      combo: 0,
      reloj: 0,
      premiado: false,
    };
  },

  actualizar(s, dt, ctx) {
    s.reloj += dt;

    s.aros.forEach((aro, i) => {
      aro.rotation.z = Math.sin(s.reloj * 1.5 + i) * 0.15;

      if (!s.cruzados.has(i) && ctx.cerca(aro.position, 2.3)) {
        objetivoSenku2(s, i);
        aro.material.color.setHex(0xffea00);
        aro.scale.set(1.2, 1.2, 1.2);
        ctx.sumarChurus(1);
        ctx.avisar(`¡Aro ${s.cruzados.size}/12! Combo ×${s.combo}`);
      }
    });

    if (s.cruzados.size === 12 && !s.premiado) {
      s.premiado = true;
      this.premio(ctx);
    }
  },

  premio(ctx) {
    ctx.sumarChurus(24);
    ctx.avisar('¡Pista Senku 2 completada! Combo máximo +24 churus');
  },

  objetivo: { texto: 'Cruza 12 aros en cadena', meta: 12 },
};
