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
const cargarMobiliario = (llegar) => new GLTFLoader().load('modelos/botiquin_mobiliario_r7.glb', ({ scene }) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    const convertir = (m) => new THREE.MeshLambertMaterial({ color: m.color, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity, name: m.name });
    o.material = Array.isArray(o.material) ? o.material.map(convertir) : convertir(o.material);
  });
  llegar(scene);
}, undefined, (e) => console.error('No se pudo cargar el mobiliario clínico', e));

export default {
  id: 'botiquin',
  nombre: 'Clínica de Héroes',
  ambiente: { cielo: 0xd4f3e6, suelo: 0xebfaf2, niebla: 0xdff5eb },
  crear(g, u) {
    u.plataforma(0, -0.25, 0, 32, 0.5, 32, 0xdef0e5);
    const pisoTex = new THREE.TextureLoader().load(new URL('../../texturas/mundos/clinica_suelo_linoleo.webp', import.meta.url).href);
    pisoTex.colorSpace = THREE.SRGBColorSpace; pisoTex.wrapS = pisoTex.wrapT = THREE.RepeatWrapping; pisoTex.repeat.set(8, 8);
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(32, 32), new THREE.MeshLambertMaterial({ map: pisoTex }));
    piso.rotation.x = -Math.PI / 2; piso.position.y = 0.012; g.add(piso);
    const cruzPiso = new THREE.Group();
    const cruzRoja = mat(0xe53935), cruzBlanca = mat(0xffffff);
    for (const [w,d,m] of [[2.5,.75,cruzBlanca],[.75,2.5,cruzBlanca],[1.9,.42,cruzRoja],[.42,1.9,cruzRoja]]) {
      const parte = new THREE.Mesh(new THREE.PlaneGeometry(w,d),m); parte.rotation.x=-Math.PI/2; parte.position.set(0,.018,-2.5); cruzPiso.add(parte);
    }
    g.add(cruzPiso);
    new GLTFLoader().load('modelos/botiquin_clinica_r9.glb', ({ scene }) => {
      scene.traverse((o) => { if (!o.isMesh) return; const convertir = (m) => new THREE.MeshLambertMaterial({ color: m.color, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity }); o.material = Array.isArray(o.material) ? o.material.map(convertir) : convertir(o.material); });
      const lienzo = document.createElement('canvas'); lienzo.width = 1024; lienzo.height = 192;
      const ctx = lienzo.getContext('2d'); ctx.font = 'bold 108px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#c62828'; ctx.fillText('CLÍNICA SENKU', 512, 100);
      const rotulo = new THREE.Mesh(new THREE.PlaneGeometry(4.35, .72), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lienzo), transparent: true, side: THREE.DoubleSide }));
      rotulo.material.map.colorSpace = THREE.SRGBColorSpace; rotulo.position.set(-.05, 2.4, -7.48); g.add(rotulo);
      g.add(scene);
    }, undefined, (e) => console.error('No se pudo cargar la clínica r9', e));
    const mosaicos = new THREE.TextureLoader().load(new URL('../../texturas/mundos/clinica_pared_azulejos.webp', import.meta.url).href);
    mosaicos.wrapS = mosaicos.wrapT = THREE.RepeatWrapping; mosaicos.repeat.set(16, 3); mosaicos.colorSpace = THREE.SRGBColorSpace;
    const muroMat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: mosaicos });
    const pared = (x,y,z,sx,sy,sz) => { const m = u.plataforma(x,y,z,sx,sy,sz,0xe8f8f4); m.material = muroMat; return m; };
    pared(0, 2, -10, 24, 4, 0.6); pared(-12, 2, -1, 0.6, 4, 18); pared(12, 2, -1, 0.6, 4, 18);
    const zoclo = mat(0xfafafa);
    for (const [x,z,sx,sz] of [[0,-9.66,24,.12],[-11.66,-1,.12,18],[11.66,-1,.12,18]]) {
      const franja = new THREE.Mesh(new THREE.BoxGeometry(sx,.32,sz),zoclo); franja.position.set(x,.18,z); g.add(franja);
    }

    const marco = mat(0xffffff), cortina = mat(0xa7ffeb), vidrio = new THREE.MeshLambertMaterial({ color: 0xe0f7fa, emissive: 0xb2ebf2, emissiveIntensity: .65 });
    for (const x of [-6, 6]) {
      const cristal = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.25), vidrio); cristal.position.set(x, 2.55, -9.62); g.add(cristal);
      for (const xx of [x - 1.82, x + 1.82]) {
        const lateral = new THREE.Mesh(new THREE.BoxGeometry(.18, 2.45, .2), marco); lateral.position.set(xx, 2.6, -9.5); g.add(lateral);
        for (let j = 0; j < 4; j++) {
          const pliegue = new THREE.Mesh(new THREE.SphereGeometry(.18, 8, 6), cortina);
          pliegue.scale.set(.8, 2.6, .7); pliegue.position.set(xx + (xx < x ? .12 : -.12), 2.65, -9.42 - j * .015); g.add(pliegue);
        }
      }
      const arco = new THREE.Mesh(new THREE.TorusGeometry(1.8, .12, 7, 18, Math.PI), marco); arco.position.set(x, 3.7, -9.5); g.add(arco);
      const repisa = new THREE.Mesh(new THREE.BoxGeometry(3.85, .14, .42), marco); repisa.position.set(x, 1.38, -9.45); g.add(repisa);
      const vertical = new THREE.Mesh(new THREE.BoxGeometry(.1, 2.25, .12), marco); vertical.position.set(x, 2.55, -9.48); g.add(vertical);
      const horizontal = new THREE.Mesh(new THREE.BoxGeometry(3.45, .1, .12), marco); horizontal.position.set(x, 2.55, -9.48); g.add(horizontal);
    }
    const letrero = new THREE.Group(), cruz = mat(0xff1744, { emissive: 0x7f001b, emissiveIntensity: .35 });
    const placa = new THREE.Mesh(new THREE.BoxGeometry(.72, .72, .16), mat(0x80deea)); placa.position.set(-2.8, 2.4, -7.42); letrero.add(placa);
    const cruzV = new THREE.Mesh(new THREE.BoxGeometry(.22, .52, .12), cruz); cruzV.position.set(-2.8, 2.4, -7.3); letrero.add(cruzV);
    const cruzH = new THREE.Mesh(new THREE.BoxGeometry(.52, .22, .12), cruz); cruzH.position.set(-2.8, 2.4, -7.3); letrero.add(cruzH); g.add(letrero);

    const camas = [[-5, 0.4, -6], [0, 0.4, -3.8], [5, 0.4, -6]];
    // Mostrador clínico acolchado.
    const mostrador = u.plataforma(0, 0.4, -1, 5, 0.8, 1.4, 0xffffff);
    mostrador.visible = false;
    cargarMobiliario((base) => {
      const names = ['clinic_counter', 'clinic_medkit', 'clinic_bed'];
      const counter = base.getObjectByName(names[0])?.clone(true);
      if (counter) { counter.position.set(0, 0, -1); counter.scale.y = .62; g.add(counter); }
      const maletin = base.getObjectByName(names[1])?.clone(true);
      if (maletin) { maletin.position.set(-4, 0, -1); maletin.scale.y = .85; g.add(maletin); }
      camas.forEach(([x, , z]) => {
        const cama = base.getObjectByName(names[2])?.clone(true);
        if (cama) { cama.position.set(x, 0, z); cama.scale.y = .88; g.add(cama); }
      });
    });

    // Atrezzo médico sencillo y legible desde el punto de entrada.
    const monitor = new THREE.Group();
    const carcasa = new THREE.Mesh(new THREE.BoxGeometry(.58, .43, .22), mat(0xeaf8f5)); carcasa.position.y = .96; monitor.add(carcasa);
    const marcoMonitor = new THREE.Mesh(new THREE.BoxGeometry(.49, .34, .035), mat(0x36545b)); marcoMonitor.position.set(0, .98, .13); monitor.add(marcoMonitor);
    const ekg = new THREE.TextureLoader().load(new URL('../../texturas/mundos/clinica_monitor_ekg.webp', import.meta.url).href); ekg.colorSpace = THREE.SRGBColorSpace;
    const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(.44, .29), new THREE.MeshBasicMaterial({ map: ekg })); pantalla.position.set(0, .98, .151); monitor.add(pantalla);
    const baseMonitor = new THREE.Mesh(new THREE.CylinderGeometry(.1, .15, .16, 8), mat(0x94aeb0)); baseMonitor.position.set(0, .72, 0); monitor.add(baseMonitor);
    monitor.position.set(-.72, 0, -1.52); g.add(monitor);
    const jarabe = new THREE.Mesh(new THREE.CylinderGeometry(.09, .12, .28, 10), new THREE.MeshLambertMaterial({ color: 0xe91e63, emissive: 0x4a001b, transparent: true, opacity: .82 }));
    jarabe.position.set(.18, .91, -1.5); g.add(jarabe);
    const tapaJarabe = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .09, 8), mat(0xffcdd2)); tapaJarabe.position.set(.18, 1.095, -1.5); g.add(tapaJarabe);
    const pastillas = new THREE.Group();
    const bote = new THREE.Mesh(new THREE.CylinderGeometry(.1, .12, .22, 10), mat(0xfff8e1)); bote.position.y = .87; pastillas.add(bote);
    const cruzBoteH = new THREE.Mesh(new THREE.BoxGeometry(.13, .045, .025), mat(0xe53935)); cruzBoteH.position.set(0, .87, .12); pastillas.add(cruzBoteH);
    const cruzBoteV = new THREE.Mesh(new THREE.BoxGeometry(.045, .13, .025), mat(0xe53935)); cruzBoteV.position.set(0, .87, .12); pastillas.add(cruzBoteV);
    pastillas.position.set(.58, 0, -1.5); g.add(pastillas);

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
    camas.forEach(([bx, by, bz], i) => {
      const cama = u.plataforma(bx, by, bz, 2.6, 0.8, 3.2, 0xffffff);
      cama.visible = false;
      // La caja invisible conserva la colisión; el mobiliario se carga en GLB.
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
