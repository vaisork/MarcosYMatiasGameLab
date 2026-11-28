import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

import { colors, groundTone, sample } from './nimbora.mjs';

const model = (clan, name, type) => {
  const green = clan === 'Dosel', c = green ? '#72ad65' : '#b87549', light = green ? '#d5e99b' : '#e7c991', dark = green ? '#397350' : '#466d72', pink = '#e89779';
  const shape = (kind, x, y, z, sx, sy, sz, color = c, rot = 0) => ({ kind, x, y, z, sx, sy, sz, color, rot });
  if (type === 'building') {
    const base = green
      ? [shape('cylinder', 0, .16, 0, 1.66, .3, 1.58, '#7a553a'),
         shape('cylinder', 0, .54, 0, 1.18, .74, 1.1, '#c19a68'),
         shape('leaf', 0, .98, .05, 1.52, .58, 1.42, '#789749'),
         shape('box', .09, .42, .56, .28, .52, .13, '#50362d')]
      : [shape('box', 0, .19, 0, 1.67, .38, 1.58, '#485354'),
         shape('box', 0, .52, 0, 1.38, .55, 1.26, '#b67449'),
         shape('box', 0, .85, 0, 1.48, .24, 1.38, '#377073'),
         shape('box', .1, .52, .65, .42, .4, .11, '#262f37')];
    const forms = {
      'Nido de Raices': [
        shape('cylinder', 0, 1.07, 0, .55, 1.68, .52, '#986744'),
        shape('leaf', -.33, 1.54, -.1, 1.56, .74, 1.27, '#5a7e44', -.36),
        shape('leaf', .47, 1.55, .05, 1.20, .65, 1.17, '#98af60', .37),
        shape('leaf', .01, 1.94, -.16, 1.24, .64, 1.11, '#bace76'),
        shape('sphere', .43, 1.1, .61, .21, .36, .21, '#ffe19a'),
        shape('sphere', -.45, 1.13, .5, .19, .29, .19, '#efab76'),
        shape('leaf', -.68, .29, .7, .74, .26, .27, '#a17b4b', .55)
      ],
      'Huerto de Bruma': [shape('leaf', -.45, .9, 0, .75, .3, .48, '#8ccc79'), shape('leaf', .48, .9, .05, .68, .27, .43, light)],
      'Arco de Savia': [shape('cylinder', 0, .8, 0, .23, 1.5, .23, dark), shape('cone', 0, 1.8, 0, .72, .5, .72, pink)],
      'Taller de Brotes': [shape('box', 0, 1.25, 0, .55, .95, .55, light), shape('cylinder', 0, 1.9, 0, .3, .55, .3, dark)],
      'Mirador Florido': [shape('cylinder', 0, 1.35, 0, .2, 2.1, .2, dark), shape('leaf', 0, 2.35, 0, .75, .28, .72, light)],
      'Refugio de Polen': [shape('sphere', 0, 1.08, 0, .8, .68, .8, light), shape('sphere', 0, 1.08, 0, .3, .29, .3, pink)],
      'Corazon de Copa': [shape('sphere', 0, 1.4, 0, .55, .7, .55, pink), shape('leaf', 0, 2, 0, .8, .23, .8, light)],
      'Puente Trenzado': [shape('box', 0, .78, 0, 2.1, .22, .55, light), shape('cylinder', -.75, .42, 0, .1, .8, .1, dark), shape('cylinder', .75, .42, 0, .1, .8, .1, dark)],
      'Patio de Remaches': [
        shape('cylinder', .31, 1.24, -.17, .45, 1.49, .45, '#bc8554'),
        shape('cylinder', .31, 1.37, -.17, .53, .14, .53, '#e7b775'),
        shape('cone', .31, 2.01, -.17, .76, .57, .76, '#418388'),
        shape('box', -.4, 1.07, .09, .62, .18, 1.08, '#dac28d'),
        shape('torus', -.38, .54, .69, .55, .55, .65, '#dfad73')
      ],
      'Galpon de Ruedas': [shape('cylinder', 0, .9, 0, .65, .3, .65, '#e2b956'), shape('box', 0, 1.45, 0, .65, .8, .65, '#5f8790')],
      'Colector Eolico': [shape('cylinder', 0, 1.2, 0, .16, 2, .16, '#d9c18d'), shape('leaf', 0, 2.3, 0, .82, .12, .2, '#d8e7d0'), shape('leaf', 0, 2.3, 0, .2, .12, .82, '#d8e7d0')],
      'Campana de Alerta': [shape('cylinder', 0, 1.25, 0, .44, .55, .44, '#ebc460'), shape('cone', 0, 1.68, 0, .48, .42, .48, '#d78c52')],
      'Cometa de Senales': [shape('kite', 0, 1.75, 0, .75, .85, .22, '#e6dca7'), shape('cylinder', 0, 1, 0, .12, 1.5, .12, '#526e6d')],
      'Banco de Bobinas': [shape('cylinder', 0, 1, 0, .72, .25, .72, '#bd8857'), shape('torus', 0, 1.36, 0, .47, .13, .47, '#e6c163')],
      'Prensa de Cielo': [shape('box', 0, 1.35, 0, .95, 1.35, .95, '#617982'), shape('cylinder', 0, 2.15, 0, .38, .38, .38, '#e5bd61')],
      'Pasarela Plegable': [shape('box', 0, .75, 0, 2, .2, .5, '#d4b36c'), shape('cylinder', -.68, .43, 0, .11, .75, .11, '#596e67'), shape('cylinder', .68, .43, 0, .11, .75, .11, '#596e67')],
      'Faro de Concordia': [shape('cylinder', 0, 1.45, 0, .42, 2.4, .42, '#e6d48b'), shape('sphere', 0, 2.85, 0, .6, .6, .6, '#83e7ef'), shape('cone', 0, .5, 0, .9, .55, .9, '#826a51')]
    };
    return base.concat(forms[name] || [shape('sphere', 0, 1.1, 0, .6, .7, .6, light)]);
  }
  const legs = [shape('cylinder', -.2, .12, 0, .1, .35, .1, dark), shape('cylinder', .2, .12, 0, .1, .35, .1, dark)];
  const body = [shape('capsule', 0, .52, 0, .37, .62, .34, c)];
  const form = {
    Semillero: [shape('sphere', 0, .91, .11, .44, .41, .4, '#f3d096'),
      shape('leaf', 0, 1.16, -.01, .6, .29, .51, light),
      shape('leaf', -.22, .77, -.21, .44, .46, .24, '#75964a', -.4),
      shape('sphere', 0, .8, -.26, .37, .4, .25, '#a77e4d')], Zarzapaso: [shape('cone', 0, 1.05, 0, .38, .64, .38, dark), shape('cone', .31, .48, 0, .13, .48, .13, '#5a874d')],
    Lanzafruto: [shape('sphere', 0, 1.06, .22, .23, .23, .23, pink), shape('cylinder', 0, .69, .36, .12, .55, .12, dark)], Musgaguarda: [shape('box', 0, .67, .25, .62, .72, .2, '#87a77b'), shape('cone', 0, 1.22, 0, .47, .37, .47, light)],
    'Planeador de Copa': [shape('leaf', 0, .75, 0, 1.0, .13, .43, light), shape('cone', 0, .65, 0, .18, .58, .18, pink)], Nudoguardia: [shape('torus', 0, .63, 0, .5, .14, .5, '#b29b61'), shape('cone', 0, 1.13, 0, .34, .46, .34, dark)],
    Polinizadora: [shape('sphere', -.35, .7, 0, .28, .19, .18, light), shape('sphere', .35, .7, 0, .28, .19, .18, light), shape('sphere', 0, 1.03, .32, .13, .13, .13, pink)], Trepacopas: [shape('cylinder', 0, .68, .26, .22, .58, .22, '#9a7652'), shape('leaf', -.37, .94, 0, .3, .35, .26, light), shape('leaf', .37, .94, 0, .3, .35, .26, light)],
    Brizna: [shape('leaf', 0, 1.13, 0, .57, .45, .5, pink), shape('cone', 0, 1.45, 0, .28, .42, .28, light), shape('torus', 0, 1.75, 0, .38, .08, .38, '#f6d782')], Olmo: [shape('cylinder', 0, 1.08, 0, .26, 1.1, .26, '#8c6849'), shape('leaf', -.4, 1.43, 0, .42, .42, .34, light), shape('leaf', .4, 1.43, 0, .42, .42, .34, dark)],
    Remachador: [shape('box', 0, .94, .16, .34, .2, .48, '#dbbd80'), shape('cylinder', 0, 1.08, 0, .25, .25, .25, '#8ca1a0')], Rodacobre: [shape('torus', 0, .38, 0, .49, .15, .49, '#b97b48'), shape('box', 0, .81, 0, .47, .38, .53, '#708b8e')], 'Bumeran de Chispa': [shape('boomerang', 0, .91, .3, .6, .16, .15, '#f0c65c')], 'Escudo de Teja': [shape('box', 0, .65, .34, .7, .82, .18, '#d0a86b'), shape('cone', 0, 1.17, 0, .32, .35, .32, '#769599')], Saltanubes: [shape('sphere', 0, .68, 0, .43, .36, .42, '#c3d7d0'), shape('cone', 0, 1.13, 0, .24, .48, .24, '#d69d60')], Tizafaro: [shape('cylinder', 0, .53, .28, .16, .75, .16, '#e5c16b'), shape('box', 0, .91, .42, .24, .24, .55, '#586f77')], Cargabobina: [shape('torus', 0, .84, 0, .36, .15, .36, '#e6bf59'), shape('cylinder', 0, 1.07, 0, .18, .4, .18, '#749a9a')], 'Andamio Andante': [shape('box', 0, .66, 0, .8, .73, .72, '#b78759'), shape('cylinder', -.36, .18, 0, .18, .28, .18, '#596e71'), shape('cylinder', .36, .18, 0, .18, .28, .18, '#596e71')], Mica: [shape('cone', 0, 1.17, 0, .55, .65, .55, '#dd9579'), shape('torus', 0, 1.52, 0, .46, .1, .46, '#e7cd82')], Tono: [shape('box', 0, .9, 0, .55, .72, .42, '#718c8e'), shape('cylinder', 0, 1.42, 0, .3, .25, .3, '#dfbd68')]
  };
  return legs.concat(body, form[name] || [shape('sphere', 0, 1.03, .12, .29, .29, .29, light)]);
};

export class ThreeView {
  constructor(host, game) {
    this.game = game; this.selected = new Set(); this.box = null; this.ghost = null; this.zoom = 1; this.center = new THREE.Vector3(8.95, 0, 24.55); this.particles = []; this.lastHp = new Map(); this.lastFogTick = -1; this.lastMapTick = -1;
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(colors.hidden);
    this.camera = new THREE.OrthographicCamera(-25, 25, 7, -7, .1, 180);
    this.renderer = new THREE.WebGLRenderer({ antialias: devicePixelRatio < 1.5, powerPreference: 'high-performance' }); this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); this.renderer.shadowMap.enabled = false; this.renderer.outputColorSpace = THREE.SRGBColorSpace; host.replaceChildren(this.renderer.domElement);
    this.ramp = new THREE.DataTexture(new Uint8Array([44, 83, 65, 255, 118, 157, 104, 255, 198, 216, 151, 255, 248, 239, 185, 255]), 4, 1); this.ramp.magFilter = this.ramp.minFilter = THREE.NearestFilter; this.ramp.generateMipmaps = false; this.ramp.needsUpdate = true;
    this.scene.add(new THREE.HemisphereLight('#fff5da', '#49665a', 1.5)); const sun = new THREE.DirectionalLight('#fff1c9', 1.3); sun.position.set(-25, 40, 28); this.scene.add(sun);
    this.sceneryTint = new THREE.Color(); this.buildTerrain(); this.buildModels(); this.buildMinimap(); this.resize(); addEventListener('resize', () => this.resize());
  }
  material(color, outline = false) { return outline ? new THREE.MeshBasicMaterial({ color: '#253831', side: THREE.BackSide }) : new THREE.MeshToonMaterial({ color, gradientMap: this.ramp }); }
  geometry(kind) {
    return ({ box: () => new THREE.BoxGeometry(1, 1, 1), sphere: () => new THREE.SphereGeometry(.5, 10, 8), capsule: () => new THREE.CapsuleGeometry(.5, .6, 3, 6), cone: () => new THREE.ConeGeometry(.5, 1, 7), cylinder: () => new THREE.CylinderGeometry(.5, .5, 1, 9), torus: () => new THREE.TorusGeometry(.5, .15, 5, 12), leaf: () => new THREE.SphereGeometry(.5, 7, 5), kite: () => new THREE.OctahedronGeometry(.5), boomerang: () => new THREE.TorusGeometry(.5, .16, 4, 8, 2.3) })[kind]();
  }
  buildTerrain() {
    const { size: S, terrain, resources } = this.game.map;
    const seed = this.game.seed, o = new THREE.Object3D(), color = new THREE.Color(), blend = new THREE.Color();
    const ground = new THREE.InstancedMesh(new THREE.BoxGeometry(1.003, .14, 1.003), this.material('#ffffff'), S * S);
    const hillGeometry = new THREE.CylinderGeometry(.52, .706, .49, 4, 1, false, Math.PI / 4);
    const hills = new THREE.InstancedMesh(hillGeometry, this.material('#ffffff'), S * S);
    const water = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), this.material('#ffffff'), S * S);
    const ripples = new THREE.InstancedMesh(new THREE.PlaneGeometry(.72, .025), new THREE.MeshBasicMaterial({ color: '#9fefe1', transparent: true, opacity: .49, depthWrite: false }), S * S * 2);
    let wet = 0, wave = 0, high = 0;
    for (let i = 0; i < terrain.length; i++) {
      const x = i % S, z = Math.floor(i / S), t = terrain[i], n = sample(x, z, seed);
      const [first, second, mix] = groundTone(x, z, t, seed);
      color.set(colors[first]).lerp(blend.set(colors[second]), mix);
      o.position.set(x + .5, t === 2 ? -.22 : -.075, z + .5);
      o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1); o.updateMatrix();
      ground.setMatrixAt(i, o.matrix);
      ground.setColorAt(i, t === 1 ? blend.set(colors.meadow).lerp(color, .68) : color);
      if (t === 1) {
        o.position.y = .235; o.updateMatrix();
        hills.setMatrixAt(high, o.matrix); hills.setColorAt(high++, color);
      }
      if (t !== 2) continue;
      o.position.y = -.065; o.rotation.x = -Math.PI / 2; o.scale.set(1, 1, 1); o.updateMatrix();
      water.setMatrixAt(wet, o.matrix); water.setColorAt(wet++, color);
      for (let j = 0; j < 2; j++) {
        o.position.set(x + .46 + j * .08, -.056, z + .32 + j * .32);
        o.scale.set(.63 + n * .28 - j * .15, 1, 1); o.updateMatrix();
        ripples.setMatrixAt(wave++, o.matrix);
      }
    }
    hills.count = high; water.count = wet; ripples.count = wave; this.scene.add(ground, hills, water, ripples);

    // Compact only explored scenery into each batch so tall silhouettes never leak through the fog.
    const scenery = [];
    const add = (geometry, palette, limit) => {
      const mesh = new THREE.InstancedMesh(geometry, this.material('#ffffff'), limit);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false; mesh.count = 0;
      this.scene.add(mesh); const parts = []; scenery.push({ mesh, parts });
      return (cell, x, y, z, sx, sy, sz, tone, turn = 0) => {
        o.position.set(x, y, z); o.rotation.set(0, turn, 0); o.scale.set(sx, sy, sz); o.updateMatrix();
        parts.push({ cell, matrix: o.matrix.clone(), color: new THREE.Color(palette[tone % palette.length]) });
      };
    };
    const trunk = add(new THREE.CylinderGeometry(.13, .22, 1, 6), ['#8e6547', '#684633'], 250);
    const crown = add(new THREE.IcosahedronGeometry(.59, 1), ['#456847', '#64894f', '#7fa35c', '#a5b772'], 750);
    const stone = add(new THREE.DodecahedronGeometry(.5, 0), ['#7b8064', '#a9a381', '#67795d'], S * S);
    const sprig = add(new THREE.IcosahedronGeometry(.4, 0), ['#b1bd6a', '#7e9b50', '#e7b079'], S * S);
    let trees = 0;
    const occupied = new Set(resources.map(r => r.z * S + r.x));
    for (let i = 0; i < terrain.length; i++) {
      const x = i % S, z = Math.floor(i / S), t = terrain[i], n = sample(x, z, seed);
      if (t === 2 || occupied.has(i)) continue;
      const base = Math.min(Math.hypot(x - 8.5, z - 24.5), Math.hypot(x - 39.5, z - 24.5));
      if (base < 3.2) continue;
      const x0 = x + .26 + n * .42, z0 = z + .64 - n * .3;
      const grove = Math.sin(x * .48 + z * .21) + Math.cos(z * .42 - x * .15);
      if (trees < 250 && (t === 1 && n > .58 || base > 7 && grove > 1.15 && n > .71 || base > 3.2 && base < 6.5 && z < 23 && n > .86)) {
        const y = t === 1 ? .48 : 0, h = .65 + n * .54, v = (n * 17) | 0;
        trunk(i, x0, y + h * .47, z0, 1, h, 1, v, n * 6);
        crown(i, x0 - .17, y + h, z0, 1.44, 1.05, 1.13, v, n * 7);
        crown(i, x0 + .24, y + h + .12, z0 + .1, 1.36, .9, 1.14, (v + 1) % 4, 2);
        crown(i, x0 + .04, y + h + .38, z0 - .2, 1.05, .91, .98, (v + 2) % 4, 4);
        trees++;
      } else if (t === 1 && n > .38) stone(i, x0, .48, z0, .84, .46 + n * .45, .77, (n * 22) | 0, n * 6);
      else if (t === 0 && n > .79) sprig(i, x0, .075, z0, .68, .28, .63, (n * 31) | 0, n * 6);
    }
    this.scenery = scenery;
    const gemGeometry = new THREE.OctahedronGeometry(.34);
    const petalGeometry = new THREE.SphereGeometry(.5, 7, 5);
    const gemMaterials = [this.material('#80d8db'), this.material('#c5f6ee'), this.material('#adc75c'), this.material('#ffcd8c')];
    this.resources = resources.map(r => {
      const group = new THREE.Group(), plant = r.kind === 'Brote';
      for (const [offset, y, depth, scale, turn] of [[0, .48, 0, 1.2, .2], [-.27, .25, -.1, .65, -.5], [.28, .28, .13, .73, .6]]) {
        const item = new THREE.Mesh(plant ? petalGeometry : gemGeometry, gemMaterials[plant ? Number(y > .4) + 2 : Number(y > .4)]);
        item.position.set(offset, y, depth); item.scale.set(scale * (plant ? .52 : .78), scale * (plant ? .46 : 1.35), scale * .65);
        item.rotation.z = turn; group.add(item);
      }
      group.position.set(r.x + .5, terrain[r.z * S + r.x] === 1 ? .48 : 0, r.z + .5);
      this.scene.add(group); return [r, group];
    });
    const fogGeo = new THREE.PlaneGeometry(1.001, 1.001);
    this.exploredFog = new THREE.InstancedMesh(fogGeo, new THREE.MeshBasicMaterial({ color: colors.fog, transparent: true, opacity: .57, depthWrite: false }), S * S);
    this.unknownFog = new THREE.InstancedMesh(fogGeo, new THREE.MeshBasicMaterial({ color: colors.hidden, transparent: true, opacity: .98, depthWrite: false }), S * S);
    this.exploredFog.frustumCulled = this.unknownFog.frustumCulled = false;
    this.scene.add(this.exploredFog, this.unknownFog);
  }
  updateScenery(fog) {
    for (const { mesh, parts } of this.scenery) {
      let at = 0;
      for (const part of parts) {
        const state = fog[part.cell];
        if (!state) continue;
        this.sceneryTint.copy(part.color).multiplyScalar(state === 2 ? 1 : .32);
        mesh.setMatrixAt(at, part.matrix); mesh.setColorAt(at++, this.sceneryTint);
      }
      mesh.count = at; mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }
  buildModels() {
    const by = new Map(), entities = this.game.catalog.filter(x => x.clan === 'Dosel' || x.clan === 'Forja').map(x => x.nombre).concat(['Nido de Raices', 'Patio de Remaches', 'Faro de Concordia']);
    for (const name of new Set(entities)) { const clan = this.game.catalog.find(x => x.nombre === name)?.clan || (name === 'Patio de Remaches' ? 'Forja' : 'Dosel'), type = name === 'Faro de Concordia' || name.includes('Nido') || name.includes('Patio') || this.game.catalog.find(x => x.nombre === name)?.tipo === 'edificio' ? 'building' : 'unit'; by.set(name, model(clan, name, type)); }
    this.models = new Map();
    for (const [name, parts] of by) { const list = []; for (const p of parts) { const mesh = new THREE.InstancedMesh(this.geometry(p.kind), this.material(p.color), 256), outline = new THREE.InstancedMesh(this.geometry(p.kind), this.material(p.color, true), 256); mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); outline.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.scene.add(outline, mesh); list.push({ p, mesh, outline, scale: name.includes('Nido') || name.includes('Patio') || name === 'Faro de Concordia' || this.game.catalog.find(x => x.nombre === name)?.tipo === 'edificio' ? 1 : .48 }); } this.models.set(name, list); }
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(.7, .045, 6, 24), new THREE.MeshBasicMaterial({ color: '#f4df70' })); this.ring.rotation.x = -Math.PI / 2; this.ring.position.y = .025; this.scene.add(this.ring); this.ring.visible = false;
    this.hpBack = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.25, .13), new THREE.MeshBasicMaterial({ color: '#27332b' }), 256); this.hpFront = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.15, .075), new THREE.MeshBasicMaterial({ color: '#77d579', side: THREE.DoubleSide }), 256); this.scene.add(this.hpBack, this.hpFront);
    this.ghostMesh = new THREE.Mesh(new THREE.CylinderGeometry(.95, .95, .04, 24), new THREE.MeshBasicMaterial({ color: '#42db81', transparent: true, opacity: .46 })); this.ghostMesh.position.y = .05; this.scene.add(this.ghostMesh); this.ghostMesh.visible = false;
    const contactGeo = new THREE.PlaneGeometry(2, 2);
    const contactMaterial = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',
      fragmentShader: 'varying vec2 vUv; void main(){float a=1.-smoothstep(.12,.48,distance(vUv,vec2(.5)));gl_FragColor=vec4(.046,.076,.044,.42*a);}'
    });
    this.contacts = new THREE.InstancedMesh(contactGeo, contactMaterial, 256);
    this.contacts.frustumCulled = false; this.contacts.count = 0;
    this.contacts.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.scene.add(this.contacts);
    const pgeo = new THREE.BufferGeometry(); pgeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(600), 3)); this.sparkles = new THREE.Points(pgeo, new THREE.PointsMaterial({ color: '#fff0a6', size: .17, transparent: true, opacity: .9 })); this.scene.add(this.sparkles);
  }
  buildMinimap() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = this.game.map.size * 3;
    canvas.className = 'minimap-map';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Minimapa: aliados verdes, rivales cobre y recursos de color');
    this.minimap = canvas.getContext('2d');
    const layer = document.createElement('canvas');
    layer.width = layer.height = canvas.width;
    this.mapTerrain = layer.getContext('2d');
    this.mapTerrainTick = -1;
    this.mapDirty = true;
    document.querySelector('#minimap').replaceChildren(canvas);
  }
  drawMinimap(fog) {
    const { size, terrain, resources } = this.game.map, ctx = this.minimap;
    const mapColors = ['#78905a', '#a59c75', '#409a98'], dimColors = ['#394f36', '#525441', '#2d5455'];
    if (this.mapTerrainTick !== this.lastFogTick || this.mapTerrainTick < 0) {
      for (let i = 0; i < fog.length; i++) {
        this.mapTerrain.fillStyle = fog[i] === 2 ? mapColors[terrain[i]] : fog[i] ? dimColors[terrain[i]] : '#14241e';
        this.mapTerrain.fillRect((i % size) * 3, Math.floor(i / size) * 3, 3, 3);
      }
      this.mapTerrainTick = this.lastFogTick;
    }
    ctx.drawImage(this.mapTerrain.canvas, 0, 0);
    for (const r of resources) if (r.amount && fog[r.z * size + r.x]) {
      ctx.fillStyle = r.kind === 'Brote' ? colors.brote : colors.prisma;
      ctx.fillRect(r.x * 3, r.z * 3, 2, 2);
    }
    for (const e of this.game.entities) {
      if (e.hp <= 0 || e.owner && fog[Math.floor(e.z) * size + Math.floor(e.x)] !== 2) continue;
      ctx.fillStyle = e.owner ? colors.rival : colors.friendly;
      const width = e.type === 'building' ? 5 : 3;
      ctx.fillRect(e.x * 3, e.z * 3, width, width);
    }
    ctx.beginPath();
    [[0, 0], [innerWidth, 0], [innerWidth, innerHeight], [0, innerHeight]].forEach(([x, y], i) => {
      const p = this.world(x, y).map(value => value * 3);
      if (i) ctx.lineTo(...p); else ctx.moveTo(...p);
    });
    ctx.closePath(); ctx.lineWidth = 2; ctx.strokeStyle = '#ffeabc'; ctx.stroke();
    this.mapDirty = false;
  }
  resize() { this.mapDirty = true; const w = innerWidth, h = innerHeight, span = (w / h < .85 ? 4.6 : 3.2) / this.zoom; this.renderer.setSize(w, h); this.camera.left = -span * w / h; this.camera.right = span * w / h; this.camera.top = span; this.camera.bottom = -span; this.camera.position.set(this.center.x + 40, this.center.y + 40, this.center.z + 40); this.camera.lookAt(this.center); this.camera.updateProjectionMatrix(); this.camera.updateMatrixWorld(); }
  setGhost(name, x, z, valid) { this.ghost = name ? { name, x, z, valid } : null; this.ghostMesh.visible = !!this.ghost; if (this.ghost) { const cell = Math.floor(z) * 48 + Math.floor(x); this.ghostMesh.position.set(Math.floor(x) + .5, this.game.map.terrain[cell] === 1 ? .48 : .06, Math.floor(z) + .5); this.ghostMesh.material.color.set(valid ? '#42db81' : '#ed5960'); } }
  world(clientX, clientY) { const p = new THREE.Vector2(clientX / innerWidth * 2 - 1, -(clientY / innerHeight) * 2 + 1), ray = new THREE.Raycaster(); ray.setFromCamera(p, this.camera); const hit = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); const out = new THREE.Vector3(); ray.ray.intersectPlane(hit, out); return [THREE.MathUtils.clamp(out.x, 0, 47.9), THREE.MathUtils.clamp(out.z, 0, 47.9)]; }
  project(x, z) { const p = new THREE.Vector3(x, .5, z).project(this.camera); return [(p.x + 1) * innerWidth / 2, (1 - p.y) * innerHeight / 2]; }
  draw(selected = this.selected) {
    const grouped = new Map(), seen = this.game.map.fog[0], frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse)), point = new THREE.Vector3(); for (const e of this.game.entities) { const low = this.lastHp.get(e.id), cell = Math.floor(e.z) * 48 + Math.floor(e.x); if (low > 0 && e.hp <= 0 && (e.owner === 0 || seen[cell] === 2)) this.burst(e.x + .5, e.z + .5); this.lastHp.set(e.id, e.hp); point.set(e.x + .5, e.type === 'building' ? 1 : .7, e.z + .5); if (e.hp > 0 && (e.owner === 0 || seen[cell] === 2) && frustum.intersectsSphere(new THREE.Sphere(point, e.type === 'building' ? 2.5 : 1.2))) { const list = grouped.get(e.name) || []; list.push(e); grouped.set(e.name, list); } }
    const d = new THREE.Object3D(), capacity = this.contacts.instanceMatrix.count;
    let shadow = 0;
    for (const list of grouped.values()) for (const e of list) {
      if (shadow >= capacity) break;
      const ground = this.game.map.terrain[Math.floor(e.z) * 48 + Math.floor(e.x)] === 1 ? .48 : 0;
      const size = e.type === 'building' ? 1.08 : .43;
      d.position.set(e.x + .6, ground + .015, e.z + .61);
      d.rotation.set(-Math.PI / 2, 0, 0); d.scale.set(size, size * .79, 1);
      d.updateMatrix(); this.contacts.setMatrixAt(shadow++, d.matrix);
    }
    this.contacts.count = shadow; this.contacts.instanceMatrix.needsUpdate = true;
    for (const [name, parts] of this.models) { const list = grouped.get(name) || []; for (const { p, mesh, outline, scale } of parts) { const count = Math.min(list.length, mesh.instanceMatrix.count); mesh.count = outline.count = count; for (let i = 0; i < count; i++) { const e = list[i], cell = Math.floor(e.z) * 48 + Math.floor(e.x), ground = this.game.map.terrain[cell] === 1 ? .48 : 0, moving = !!e.path?.length, bob = moving ? Math.sin(this.game.tick * .28 + e.id) * .07 : 0, attack = e.order?.action === 'attack' && e.cooldown > 13 ? Math.sin(this.game.tick * .9) * .16 : 0, unitScale = e.type === 'building' ? 1 : scale; const baseY = e.type === 'building' ? ground : ground + bob;
      d.position.set(e.x + .5 + p.x * unitScale, baseY + p.y * unitScale + (p.y > 1 ? attack : 0), e.z + .5 + p.z * unitScale); d.rotation.set(0, (moving ? Math.atan2(e.path[0][0] - e.x, e.path[0][1] - e.z) : 0) + p.rot, 0); d.scale.set(p.sx * unitScale, p.sy * unitScale, p.sz * unitScale); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix); d.scale.multiplyScalar(1.06); d.updateMatrix(); outline.setMatrixAt(i, d.matrix); }
      mesh.instanceMatrix.needsUpdate = outline.instanceMatrix.needsUpdate = true; } }
    const fog = this.game.map.fog[0]; if (this.lastFogTick < 0 || this.game.tick % 15 === 0 && this.lastFogTick !== this.game.tick) { const o = new THREE.Object3D(); let explored = 0, unknown = 0; for (let i = 0; i < fog.length; i++) { if (fog[i] === 2) continue; const x = i % 48, z = Math.floor(i / 48); o.position.set(x + .5, this.game.map.terrain[i] === 1 ? .56 : .18, z + .5); o.rotation.set(-Math.PI / 2, 0, 0); o.scale.set(1, 1, 1); o.updateMatrix(); if (fog[i] === 1) this.exploredFog.setMatrixAt(explored++, o.matrix); else this.unknownFog.setMatrixAt(unknown++, o.matrix); } this.exploredFog.count = explored; this.unknownFog.count = unknown; this.exploredFog.instanceMatrix.needsUpdate = this.unknownFog.instanceMatrix.needsUpdate = true; this.lastFogTick = this.game.tick; this.updateScenery(fog); }
    if (this.mapDirty || this.game.tick % 6 === 0 && this.lastMapTick !== this.game.tick) {
      this.drawMinimap(seen); this.lastMapTick = this.game.tick;
    }
    for (const [r, g] of this.resources) g.visible = r.amount > 0 && !!fog[Math.floor(r.z) * 48 + Math.floor(r.x)];
    const bars = this.game.entities.filter(e => e.hp > 0 && (e.owner === 0 || seen[Math.floor(e.z) * 48 + Math.floor(e.x)] === 2) && (e.hp < e.maxHp || selected.has(e.id))), bd = new THREE.Object3D(); this.hpBack.count = this.hpFront.count = Math.min(256, bars.length);
    for (let i = 0; i < this.hpBack.count; i++) { const e = bars[i], pct = Math.max(0, e.hp / e.maxHp), y = (e.type === 'building' ? 3.1 : 1.85); bd.position.set(e.x + .5, y, e.z + .5); bd.rotation.copy(this.camera.rotation); bd.scale.set(1, 1, 1); bd.updateMatrix(); this.hpBack.setMatrixAt(i, bd.matrix); bd.position.x -= (1 - pct) * .56; bd.scale.set(Math.max(.02, pct), 1, 1); bd.updateMatrix(); this.hpFront.setMatrixAt(i, bd.matrix); this.hpFront.setColorAt(i, new THREE.Color(pct < .35 ? '#ed6b54' : e.owner ? '#e9955c' : '#80d875')); }
    this.hpBack.instanceMatrix.needsUpdate = this.hpFront.instanceMatrix.needsUpdate = true;
    const picked = [...selected].map(id => this.game.entities.find(e => e.id === id)).find(Boolean); this.ring.visible = !!picked; if (picked) { this.ring.position.set(picked.x + .5, (this.game.map.terrain[Math.floor(picked.z) * 48 + Math.floor(picked.x)] === 1 ? .52 : .05), picked.z + .5); const pct = picked.hp / picked.maxHp; this.ring.material.color.set(pct < .35 ? '#ef7358' : '#f4df70'); }
    this.updateParticles(); this.renderer.render(this.scene, this.camera);
  }
  burst(x, z) { for (let i = 0; i < 32; i++) this.particles.push({ x, y: .6, z, vx: Math.sin(i * 12.3) * .9, vy: .5 + (i % 5) * .12, vz: Math.cos(i * 12.3) * .9, life: .8 }); }
  updateParticles() { const pos = this.sparkles.geometry.attributes.position.array; let n = 0; for (const p of this.particles) { p.x += p.vx * .025; p.y += p.vy * .025; p.z += p.vz * .025; p.vy -= .015; p.life -= .025; if (p.life > 0 && n < 200) { pos[n * 3] = p.x; pos[n * 3 + 1] = p.y; pos[n * 3 + 2] = p.z; n++; } } this.particles = this.particles.filter(p => p.life > 0); this.sparkles.geometry.setDrawRange(0, n); this.sparkles.geometry.attributes.position.needsUpdate = true; }
  home() { this.center.set(8.95, 0, 24.55); this.zoom = 1; this.resize(); }
  pan(dx, dy) { const scale = (this.camera.top - this.camera.bottom) / innerHeight, right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 1); right.y = 0; up.y = 0; right.normalize(); up.normalize(); this.center.addScaledVector(right, -dx * scale).addScaledVector(up, dy * scale); this.center.x = THREE.MathUtils.clamp(this.center.x, 2, 46); this.center.z = THREE.MathUtils.clamp(this.center.z, 2, 46); this.resize(); }
  zoomBy(factor) { this.zoom = THREE.MathUtils.clamp(this.zoom * factor, .13, 1.8); this.resize(); }
}
