import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { objetivoBotiquin } from './objetivos.mjs';

const mat = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });
const barra = (g, a, b, radius, color) => {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), d = vb.clone().sub(va);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, d.length(), 8), mat(color));
  m.position.copy(va).add(vb).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(m); return m;
};
const cargarGatito = (llegar) => new GLTFLoader().load('modelos/gatito.glb', ({ scene }) => {
  scene.traverse((o) => { if (o.isMesh && o.name === 'Cube') o.visible = false; });
  llegar(scene);
}, undefined, (e) => console.error('No se pudo cargar modelos/gatito.glb', e));
const cargarKit = (llegar) => new GLTFLoader().load('modelos/botiquin_carrito_lampara_r2.glb', ({ scene }) => llegar(scene), undefined, (e) => console.error('No se pudo cargar el carrito clínico', e));

export default {
  id: 'botiquin',
  nombre: 'Clínica de Héroes',
  ambiente: { cielo: 0xd4f3e6, suelo: 0xebfaf2, niebla: 0xdff5eb },
  crear(g, u) {
    u.plataforma(0, -0.25, 0, 32, 0.5, 32, 0xdef0e5);
    u.plataforma(0, 2, -10, 24, 4, 0.6, 0xbfe5d3);
    u.plataforma(-12, 2, -1, 0.6, 4, 18, 0xcdeada);
    u.plataforma(12, 2, -1, 0.6, 4, 18, 0xcdeada);
    const zoclo = mat(0xfafafa);
    for (const [x,z,sx,sz] of [[0,-9.66,24,.12],[-11.66,-1,.12,18],[11.66,-1,.12,18]]) {
      const franja = new THREE.Mesh(new THREE.BoxGeometry(sx,.32,sz),zoclo); franja.position.set(x,.18,z); g.add(franja);
    }

    // Mostrador clínico acolchado.
    const mostrador = u.plataforma(0, 0.4, -1, 5, 0.8, 1.4, 0xffffff);
    mostrador.visible = false;
    const superficie = new THREE.Mesh(new THREE.BoxGeometry(5.2, .28, 1.7), mat(0xb2dfdb));
    superficie.position.set(0, .72, -1); g.add(superficie);
    for (const x of [-2.2, 2.2]) for (const z of [-1.55, -.45]) barra(g, [x, .08, z], [x, .59, z], .07, 0xb0bec5);

    const curitas = [];
    const matCurita = mat(0xffe2b8), matCruz = mat(0xef4444);
    const curitaPos = [[-1.5, 0.9, -1], [0, 0.9, -1], [1.5, 0.9, -1]];
    for (const pos of curitaPos) {
      const curita = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(.45, .1, .25), matCurita);
      const cruzH = new THREE.Mesh(new THREE.BoxGeometry(.24, .11, .08), matCruz);
      const cruzV = new THREE.Mesh(new THREE.BoxGeometry(.08, .11, .24), matCruz);
      curita.add(base, cruzH, cruzV); curita.position.set(...pos); g.add(curita);
      curitas.push({ grupo: curita, inicial: new THREE.Vector3(...pos), agarrada: false, puesta: false });
    }

    const pacientes = [];
    const camas = [[-5, 0.4, -6], [0, 0.4, -7.5], [5, 0.4, -6]];
    camas.forEach(([bx, by, bz], i) => {
      const cama = u.plataforma(bx, by, bz, 2.6, 0.8, 3.2, 0xffffff);
      cama.visible = false;
      // Bastidor tubular y colchón suave con cabecera levantada.
      for (const x of [bx - 1.12, bx + 1.12]) {
        for (const z of [bz - 1.25, bz + 1.25]) barra(g, [x, .08, z], [x, .52, z], .055, 0xb0bec5);
        barra(g, [x, .5, bz - 1.3], [x, .5, bz + 1.3], .05, 0xb0bec5);
      }
      const colchon = new THREE.Mesh(new THREE.BoxGeometry(2.3, .26, 2.85), mat(0xb2dfdb));
      colchon.position.set(bx, .67, bz); colchon.rotation.x = i === 1 ? -.12 : 0; g.add(colchon);
      const almohada = new THREE.Mesh(new THREE.SphereGeometry(.48, 8, 5), mat(0xe0f2f1));
      almohada.position.set(bx, .86, bz - .86); almohada.scale.set(1.5, .28, .8); g.add(almohada);

      const paciente = new THREE.Group(); paciente.position.set(bx, .98, bz); g.add(paciente);
      const matHerido = mat([0x9d7966, 0x777986, 0xb18c79][i]);
      const respaldo = new THREE.Group(); paciente.add(respaldo);
      const cuerpo = new THREE.Mesh(new THREE.SphereGeometry(.46, 9, 6), matHerido);
      cuerpo.scale.set(1.15, .62, 1.25); cuerpo.rotation.z = -.18; cuerpo.position.set(.12, .05, .18); respaldo.add(cuerpo);
      const cabeza = new THREE.Mesh(new THREE.SphereGeometry(.38, 9, 6), matHerido);
      cabeza.position.set(-.15, .16, -.52); respaldo.add(cabeza);
      for (const ox of [-.38, .08]) {
        const oreja = new THREE.Mesh(new THREE.ConeGeometry(.14, .27, 5), matHerido);
        oreja.position.set(ox, .38, -.58); oreja.rotation.z = ox < 0 ? -.18 : .18; respaldo.add(oreja);
      }
      const ojoMat = mat(0x35444d);
      for (const ox of [-.27, -.03]) {
        const ojo = new THREE.Mesh(new THREE.SphereGeometry(.035, 6, 4), ojoMat);
        ojo.position.set(ox, .2, -.84); respaldo.add(ojo);
      }
      const vendaje = new THREE.Mesh(new THREE.TorusGeometry(.34, .055, 5, 12), mat(0xfff8e7));
      vendaje.rotation.x = Math.PI / 2; vendaje.position.set(-.15, .18, -.52); respaldo.add(vendaje);
      const vendajePata = new THREE.Mesh(new THREE.TorusGeometry(.15, .045, 5, 10), mat(0xfff8e7));
      vendajePata.rotation.x = Math.PI / 2; vendajePata.position.set(.48, .02, .45); respaldo.add(vendajePata);
      const vendaModelo = new THREE.Mesh(new THREE.TorusGeometry(.34, .055, 5, 12), mat(0xfff8e7));
      vendaModelo.rotation.x = Math.PI / 2; vendaModelo.position.set(-.15, .18, -.52); paciente.add(vendaModelo);
      const cobija = new THREE.Mesh(new THREE.SphereGeometry(1,8,5),mat(0xfff59d));
      cobija.scale.set(.48,.14,.58); cobija.position.set(.2,.28,.28); paciente.add(cobija);

      const estado = { grupo: paciente, cabeza, cuerpo, vendaje, vendaModelo, respaldo, matHerido, curado: false };
      pacientes.push(estado);
    });

    // Una descarga; instancias clonadas conservan materiales independientes al sanar.
    cargarGatito((base) => pacientes.forEach((estado) => {
      const modelo = base.clone(true);
      estado.respaldo.visible = false;
      modelo.scale.setScalar(.65); modelo.position.set(0, -.1, 0); modelo.rotation.set(0, Math.PI, Math.PI / 2);
      modelo.traverse((o) => {
        if (!o.isMesh) return;
        o.material = Array.isArray(o.material) ? o.material.map((m) => m.clone()) : o.material.clone();
      });
      estado.grupo.add(modelo); estado.modelo = modelo;
    }));
    cargarKit((base) => camas.forEach(([x,y,z], i) => {
      const kit = base.clone(true); kit.position.set(x + (i === 1 ? 2 : -2), y, z); g.add(kit);
    }));

    // Suero y biombos plegables.
    for (const [x, z] of [[-7.1, -6], [2.2, -7.5], [7.1, -6]]) {
      barra(g, [x, .1, z], [x, 2.25, z], .055, 0xb0bec5);
      barra(g, [x - .42, .12, z], [x + .42, .12, z], .05, 0x90a4ae);
      barra(g, [x, 2.2, z], [x + .48, 2.2, z], .04, 0xb0bec5);
      const bolsa = new THREE.Mesh(new THREE.BoxGeometry(.38, .54, .15), new THREE.MeshLambertMaterial({ color: 0xd7f7f5, transparent: true, opacity: .72 }));
      bolsa.position.set(x + .28, 1.82, z); g.add(bolsa);
      barra(g, [x + .28, 1.55, z], [x + .28, .98, z], .018, 0xe9f4ed);
    }
    for (const x of [-9, 9]) {
      for (const dx of [-.8, .8]) barra(g, [x + dx, .1, -3], [x + dx, 1.8, -3], .045, 0xb0bec5);
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.55, .08), mat(0xf3fbf8));
      panel.position.set(x, .98, -3); g.add(panel);
      const seam = new THREE.Mesh(new THREE.BoxGeometry(.06, 1.58, .1), mat(0xb0bec5));
      seam.position.set(x, .98, -3); g.add(seam);
    }

    return { curitas, pacientes, curados: new Set(), llevando: null, premiado: false, reloj: 0 };
  },

  actualizar(s, dt, ctx) {
    s.reloj += dt;
    s.curitas.forEach((c, idx) => {
      if (c.puesta) return;
      if (s.llevando === null && (ctx.cerca(c.grupo.position, 1.3) || ctx.acariciar(c.grupo.position, 1.3) || ctx.atrapado(c.grupo.position, 1.5))) {
        s.llevando = idx; c.agarrada = true; ctx.avisar('¡Curita en mano! Llévala a un paciente');
      }
    });

    if (s.llevando !== null) {
      const c = s.curitas[s.llevando];
      c.grupo.position.set(ctx.jugadora.pos.x, ctx.jugadora.pos.y + 0.35, ctx.jugadora.pos.z - 0.4);
      c.grupo.rotation.y = s.reloj * 2;
      s.pacientes.forEach((p, i) => {
        if (!s.curados.has(i) && (ctx.cerca(p.grupo.position, 1.9) || ctx.acariciar(p.grupo.position, 1.6))) {
          objetivoBotiquin(s, i); c.puesta = true; c.agarrada = false;
          c.grupo.position.set(p.grupo.position.x, p.grupo.position.y + 0.9, p.grupo.position.z - 0.2);
          c.grupo.scale.set(.7, .7, .7); s.llevando = null;
          p.curado = true; p.matHerido.color.setHex(0xff99bb); p.vendaje.material.color.setHex(0x4ade80); p.vendaModelo.material.color.setHex(0x4ade80);
          if (p.modelo) p.modelo.traverse((o) => { if (o.isMesh && o.material.color) o.material.color.setHex(0xff99bb); });
          ctx.avisar(`¡Paciente ${s.curados.size}/3 curado!`);
        }
      });
    }

    s.pacientes.forEach((p, i) => {
      if (p.curado) p.grupo.position.y = .98 + Math.abs(Math.sin(s.reloj * 3 + i)) * .15;
    });
    if (s.curados.size === 3 && !s.premiado) {
      s.premiado = true; this.premio(ctx);
    }
  },
  premio(ctx) {
    ctx.sumarCorazon(3); ctx.escudo?.(30); ctx.sumarChurus(25);
    ctx.avisar('¡Clínica completa! Corazones al máximo + escudo 30 s');
  },
  objetivo: { texto: 'Cura a los 3 pacientes con curitas', meta: 3 },
};
