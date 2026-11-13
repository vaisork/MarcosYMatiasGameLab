import * as THREE from 'three';
import { objetivoBotiquin } from './objetivos.mjs';

export default {
  id: 'botiquin',
  nombre: 'Clínica de Héroes',
  ambiente: { cielo: 0xd4f3e6, suelo: 0xebfaf2, niebla: 0xdff5eb },
  crear(g, u) {
    u.plataforma(0, -0.25, 0, 32, 0.5, 32, 0xdef0e5);
    u.plataforma(0, 2, -10, 24, 4, 0.6, 0xbfe5d3);
    u.plataforma(-12, 2, -1, 0.6, 4, 18, 0xcdeada);
    u.plataforma(12, 2, -1, 0.6, 4, 18, 0xcdeada);

    u.plataforma(0, 0.4, -1, 5, 0.8, 1.4, 0xffffff);

    const curitas = [];
    const matCurita = new THREE.MeshLambertMaterial({ color: 0xffe2b8 });
    const matCruz = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const curitaPos = [[-1.5, 0.9, -1], [0, 0.9, -1], [1.5, 0.9, -1]];
    for (let k = 0; k < 3; k++) {
      const curita = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.25), matCurita);
      const cruzH = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.11, 0.08), matCruz);
      const cruzV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.11, 0.24), matCruz);
      curita.add(base, cruzH, cruzV);
      curita.position.set(...curitaPos[k]);
      g.add(curita);
      curitas.push({ grupo: curita, inicial: new THREE.Vector3(...curitaPos[k]), agarrada: false, puesta: false });
    }

    const pacientes = [];
    const camas = [[-5, 0.4, -6], [0, 0.4, -7.5], [5, 0.4, -6]];
    const matHerido = new THREE.MeshLambertMaterial({ color: 0xa89f9e });

    camas.forEach(([bx, by, bz], i) => {
      u.plataforma(bx, by, bz, 2.6, 0.8, 3.2, 0xffffff);
      const almohada = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 0.8), new THREE.MeshLambertMaterial({ color: 0xbae6fd }));
      almohada.position.set(bx, by + 0.45, bz - 1);
      g.add(almohada);

      const paciente = new THREE.Group();
      const cuerpoMat = matHerido.clone();
      const cuerpo = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), cuerpoMat);
      cuerpo.scale.set(1.1, 0.8, 1.2);
      cuerpo.position.set(0, 0.4, 0);
      const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), cuerpoMat);
      cabeza.position.set(0, 0.8, -0.2);
      for (const ox of [-0.2, 0.2]) {
        const oreja = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 4), cuerpoMat);
        oreja.position.set(ox, 1.1, -0.2);
        paciente.add(oreja);
      }
      const vendaje = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 4, 12), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      vendaje.rotation.x = Math.PI / 2;
      vendaje.position.set(0, 0.8, -0.2);
      paciente.add(cuerpo, cabeza, vendaje);

      paciente.position.set(bx, by + 0.5, bz);
      g.add(paciente);
      pacientes.push({ grupo: paciente, cabeza, cuerpo, vendaje, matHerido: cuerpoMat, curado: false });
    });

    return {
      curitas,
      pacientes,
      curados: new Set(),
      llevando: null,
      premiado: false,
      reloj: 0,
    };
  },

  actualizar(s, dt, ctx) {
    s.reloj += dt;

    s.curitas.forEach((c, idx) => {
      if (c.puesta) return;
      if (s.llevando === null) {
        if (ctx.cerca(c.grupo.position, 1.3) || ctx.acariciar(c.grupo.position, 1.3) || ctx.atrapado(c.grupo.position, 1.5)) {
          s.llevando = idx;
          c.agarrada = true;
          ctx.avisar('¡Curita en mano! Llévala a un paciente');
        }
      }
    });

    if (s.llevando !== null) {
      const c = s.curitas[s.llevando];
      c.grupo.position.set(ctx.jugadora.pos.x, ctx.jugadora.pos.y + 0.35, ctx.jugadora.pos.z - 0.4);
      c.grupo.rotation.y = s.reloj * 2;

      s.pacientes.forEach((p, i) => {
        if (!s.curados.has(i) && (ctx.cerca(p.grupo.position, 1.9) || ctx.acariciar(p.grupo.position, 1.6))) {
          objetivoBotiquin(s, i);
          c.puesta = true;
          c.agarrada = false;
          c.grupo.position.set(p.grupo.position.x, p.grupo.position.y + 0.9, p.grupo.position.z - 0.2);
          c.grupo.scale.set(0.7, 0.7, 0.7);
          s.llevando = null;

          p.curado = true;
          p.matHerido.color.setHex(0xff99bb);
          p.vendaje.material.color.setHex(0x4ade80);
          ctx.avisar(`¡Paciente ${s.curados.size}/3 curado!`);
        }
      });
    }

    s.pacientes.forEach((p, i) => {
      if (p.curado) {
        p.grupo.position.y = 0.9 + Math.abs(Math.sin(s.reloj * 3 + i)) * 0.15;
      }
    });

    if (s.curados.size === 3 && !s.premiado) {
      s.premiado = true;
      this.premio(ctx);
    }
  },

  premio(ctx) {
    ctx.sumarCorazon(3);
    ctx.escudo?.(30);
    ctx.sumarChurus(25);
    ctx.avisar('¡Clínica completa! Corazones al máximo + escudo 30 s');
  },

  objetivo: { texto: 'Cura a los 3 pacientes con curitas', meta: 3 },
};
