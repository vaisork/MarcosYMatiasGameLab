import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { objetivoMarcosUV } from './objetivos.mjs';

export default {
  id: 'marcos-uv', nombre: 'Cuarto de Luz UV', ambiente: { cielo: 0x171522, suelo: 0x121019, niebla: 0x242035 },
  crear(g, u) {
    u.plataforma(0, -.25, 0, 24, .5, 24, 0x17141f);
    const cielo = new THREE.TextureLoader().load(new URL('../../texturas/mundos/cielo_noche_estrellada_r9.webp', import.meta.url).href);
    cielo.colorSpace = THREE.SRGBColorSpace;
    const esferaCielo = new THREE.Mesh(new THREE.SphereGeometry(190, 32, 20), new THREE.MeshBasicMaterial({ map: cielo, side: THREE.BackSide, fog: false, depthWrite: false }));
    esferaCielo.renderOrder = -2; g.add(esferaCielo);
    const paredUV = new THREE.TextureLoader().load(new URL('../../texturas/mundos/marcos_uv_pared_graffiti.webp', import.meta.url).href);
    paredUV.colorSpace = THREE.SRGBColorSpace; paredUV.wrapS = paredUV.wrapT = THREE.RepeatWrapping; paredUV.repeat.set(5, 1);
    new GLTFLoader().load('modelos/marcos_uv_arcade_r9.glb', ({ scene }) => {
      scene.traverse((o) => {
        if (!o.isMesh) return;
        const esPared = o.name.includes('wall');
        const convertir = (m) => {
          const brilla = Boolean(m.emissive && m.emissive.getHex() !== 0x000000);
          return new THREE.MeshLambertMaterial({ color: esPared || brilla ? 0xffffff : 0x21182b, map: esPared ? paredUV : m.map, emissive: brilla ? m.emissive : esPared ? 0x180b25 : 0x000000, emissiveMap: brilla ? m.emissiveMap : esPared ? paredUV : null, emissiveIntensity: brilla ? Math.max(1.5, m.emissiveIntensity || 0) : esPared ? .55 : 0 });
        };
        o.material = Array.isArray(o.material) ? o.material.map(convertir) : convertir(o.material);
      });
      const lienzo = document.createElement('canvas'); lienzo.width = 512; lienzo.height = 160;
      const ctx = lienzo.getContext('2d'); ctx.fillStyle = '#100d1d'; ctx.fillRect(0, 0, 512, 160); ctx.font = 'bold 104px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#76ff03'; ctx.fillText('20:88', 256, 80);
      const reloj = new THREE.Mesh(new THREE.PlaneGeometry(2.8, .78), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lienzo), side: THREE.DoubleSide }));
      reloj.material.map.colorSpace = THREE.SRGBColorSpace; reloj.position.set(0, 4.15, -7.43); g.add(reloj);
      g.add(scene);
    }, undefined, (e) => console.error('No se pudo cargar el arcade UV r9', e));
    new GLTFLoader().load('modelos/marcos_uv_taller_r3.glb', ({ scene }) => {
      scene.traverse((o) => {
        if (!o.isMesh) return;
        if (o.name === 'muro posterior') { o.visible = false; return; }
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        const oscurecer = (m) => new THREE.MeshLambertMaterial({ color: m.emissive?.getHex() ? 0xffffff : 0x171420, emissive: m.emissive || 0x000000, emissiveMap: m.emissiveMap, emissiveIntensity: m.emissive?.getHex() ? Math.max(1.5, m.emissiveIntensity || 0) : m.emissiveIntensity || 0, map: m.map });
        o.material = Array.isArray(o.material) ? mats.map(oscurecer) : oscurecer(mats[0]);
      });
      g.add(scene);
    }, undefined, (e) => console.error('No se pudo cargar el taller UV', e));

    const arte = new THREE.TextureLoader().load(new URL('../../texturas/mundos/marcos_uv_posters.webp', import.meta.url).href);
    arte.colorSpace = THREE.SRGBColorSpace;
    const grafitis = [];
    const lima = new THREE.MeshLambertMaterial({ color: 0x76ff03, emissive: 0x76ff03, emissiveIntensity: .8 });
    const fucsia = new THREE.MeshLambertMaterial({ color: 0xff007f, emissive: 0xff007f, emissiveIntensity: .8 });
    for (let i = 0; i < 6; i++) {
      const textura = arte.clone(); textura.repeat.set(1 / 3, 1 / 2); textura.offset.set((i % 3) / 3, 1 - (Math.floor(i / 3) + 1) / 2); textura.needsUpdate = true;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2), new THREE.MeshLambertMaterial({ map: textura, emissive: 0xffffff, emissiveMap: textura, emissiveIntensity: .9, side: THREE.DoubleSide }));
      m.position.set(-7 + (i % 4) * 4.7, 2 + Math.floor(i / 4) * 2.2, -6.2); g.add(m); grafitis.push(m);
      for (const [x,y,w,h] of [[0,1.08,3.05,.16],[0,-1.08,3.05,.16],[-1.45,0,.16,2.16],[1.45,0,.16,2.16]]) {
        const borde = new THREE.Mesh(new THREE.BoxGeometry(w,h,.2), (i + Math.round(x + y)) % 2 ? lima : fucsia);
        borde.position.set(m.position.x + x, m.position.y + y, -6.08); g.add(borde);
      }
    }

    const reflector = new THREE.MeshLambertMaterial({ color: 0x212121 }), tubo = new THREE.MeshLambertMaterial({ color: 0x7c4dff, emissive: 0x651fff, emissiveIntensity: 1.6 });
    const cadena = new THREE.MeshLambertMaterial({ color: 0x616161 });
    for (const x of [-7, 0, 7]) {
      const capucha = new THREE.Mesh(new THREE.BoxGeometry(2.8,.2,.38), reflector); capucha.position.set(x,4.55,-1); g.add(capucha);
      const foco = new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,2.35,8), tubo); foco.rotation.z = Math.PI/2; foco.position.set(x,4.34,-1); g.add(foco);
      for (const dx of [-1.05,1.05]) for (let j=0;j<4;j++) {
        const eslabon = new THREE.Mesh(new THREE.TorusGeometry(.08,.018,4,7), cadena); eslabon.position.set(x+dx,4.18-j*.12,-1); g.add(eslabon);
      }
    }

    const repisaMat = new THREE.MeshLambertMaterial({ color: 0x272331 });
    for (const x of [-6,0,6]) {
      const repisa = new THREE.Mesh(new THREE.BoxGeometry(3,.18,.6), repisaMat); repisa.position.set(x,.45,-5.5); g.add(repisa);
      for (let j=0;j<3;j++) {
        const color = j%2 ? 0x00e676 : 0xff4081;
        const liquido = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 1.1, transparent: true, opacity: .85 });
        const frasco = new THREE.Mesh(new THREE.CylinderGeometry(.17,.22,.65,8), liquido); frasco.position.set(x-.75+j*.75,.86,-5.5); g.add(frasco);
        const tapa = new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.13,8), reflector); tapa.position.set(frasco.position.x,1.25,-5.5); g.add(tapa);
      }
    }

    const mandos = [];
    for (const [x, color] of [[-1.2, 0xff007f], [1.2, 0x76ff03]]) {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(.34, .4, .14, 10), new THREE.MeshLambertMaterial({ color: 0x607d8b, emissive: 0x263238 })); base.position.set(x, .61, -2.4); g.add(base);
      const palanca = new THREE.Mesh(new THREE.CylinderGeometry(.045, .07, .28, 8), new THREE.MeshLambertMaterial({ color: 0xcfd8dc })); palanca.position.set(x, .79, -2.4); palanca.rotation.z = .16; g.add(palanca);
      const bolaMat = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 1.5 });
      const bola = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), bolaMat); bola.position.set(x + .045, .94, -2.4); g.add(bola);
      const botones = [];
      for (let j = 0; j < 4; j++) {
        const c = [0x00e5ff, 0xffea00, 0xff4081, 0x76ff03][j];
        const button = new THREE.Mesh(new THREE.SphereGeometry(.095, 8, 6), new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: .75 }));
        button.position.set(x + .18 + (j % 2) * .2, .78, -2.52 + Math.floor(j / 2) * .2); g.add(button); botones.push(button);
      }
      mandos.push({ punto: new THREE.Vector3(x, .82, -2.4), bolaMat, botones });
    }

    const huellaMat = new THREE.MeshLambertMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: .85 });
    for (let i=0;i<8;i++) {
      const z=5-i*1.4, x=(i%2 ? 1 : -1)*.55;
      const almohadilla = new THREE.Mesh(new THREE.SphereGeometry(.24,8,5),huellaMat); almohadilla.scale.set(1,.12,1.2); almohadilla.position.set(x,.025,z); g.add(almohadilla);
      for (let j=0;j<3;j++) { const dedo=new THREE.Mesh(new THREE.SphereGeometry(.09,6,4),huellaMat); dedo.scale.y=.25; dedo.position.set(x+(j-1)*.18,.035,z+.27); g.add(dedo); }
    }
    return { grafitis, mandos, revelados: new Set(), premiado: false };
  },
  actualizar(s, dt, ctx) {
    if (!s.premiado) { s.premiado = true; ctx.sumarChurus(30); ctx.avisar('¡Premio asegurado! +30 churus'); }
    s.grafitis.forEach((m, i) => {
      if (!ctx.acariciar(m.position, 1.8) || s.revelados.has(i)) return;
      objetivoMarcosUV(s, i);
      m.material.opacity = 1;
      m.material.emissiveIntensity = 1.35;
      ctx.avisar(`¡Grafiti UV ${s.revelados.size}/6!`);
    });
    s.mandos.forEach((m) => {
      if (!m.activo && ctx.zarpazo(m.punto, 1.35)) {
        m.activo = true; m.bolaMat.emissiveIntensity = 2.2; m.botones.forEach((b) => { b.material.emissiveIntensity = 1.7; });
        ctx.avisar('¡Arcade UV activado!');
      }
    });
  },
  objetivo: { texto: 'Revela 6 grafitis UV', meta: 6 },
};
