// Ciudad low-poly del desierto: cielo, suelo con calles, edificios instanciados
// con ventanas en shader, tinacos, cactus y posiciones de churus.
import * as THREE from 'three';
import { CARTELES } from './carteles.mjs';
import { PORTALES } from './portales.mjs';
import { PALETA_CIUDAD, crearPerfilLejano, luzVertice, zonaBarrio, alturaBarrio } from './arte.mjs';
import { avanzarRuta, nivelAnochecer, pasoPaloma } from './vida.mjs';

export const CUADRA = 26; // separación entre centros de manzana (calle incluida)
const N = 6;              // manzanas de -N a N
const HORIZONTE = new THREE.Color(PALETA_CIUDAD.niebla);

function azar(semilla) { // mulberry32: ciudad igual en cada partida
  return () => {
    semilla |= 0; semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cielo() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  const cielo = g.createLinearGradient(0, 0, 0, 512);
  cielo.addColorStop(0, '#5c6bc0');
  cielo.addColorStop(0.28, '#9a5f7b');
  cielo.addColorStop(0.53, '#e88878');
  cielo.addColorStop(0.68, '#ffab91');
  cielo.addColorStop(0.76, '#ffc078');
  cielo.addColorStop(1, '#6b637c');
  g.fillStyle = cielo; g.fillRect(0, 0, c.width, c.height);

  // Velos de cirros y cúmulos estilizados, pintados una sola vez en la textura.
  let seed = 781;
  const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 92; i++) {
    const x = rand() * 1024, y = 72 + rand() * 157, w = 18 + rand() * 84, h = 3 + rand() * 8;
    const nube = g.createLinearGradient(x, y - h * 1.4, x, y + h * 1.4);
    const alpha = 0.15 + rand() * 0.18;
    nube.addColorStop(0, 'rgba(255,218,215,0)'); nube.addColorStop(0.5, `rgba(255,231,214,${alpha})`);
    nube.addColorStop(1, 'rgba(255,218,215,0)');
    g.fillStyle = nube; g.beginPath(); g.ellipse(x, y, w, h, (rand() - 0.5) * 0.12, 0, Math.PI * 2); g.fill();
  }
  // Ruido de baja frecuencia evita bandas y agrupa cirros en nubes orgánicas.
  const nx = 33, ny = 13, noise = Array.from({ length: nx * ny }, rand);
  const cieloPx = g.getImageData(0, 0, c.width, 258), pix = cieloPx.data;
  for (let y = 0; y < 258; y++) for (let x = 0; x < 1024; x++) {
    const gx = x / (1024 / (nx - 1)), gy = y / (258 / (ny - 1)), ix = Math.min(nx - 2, Math.floor(gx)), iy = Math.min(ny - 2, Math.floor(gy));
    const tx = (gx - ix) ** 2 * (3 - 2 * (gx - ix)), ty = (gy - iy) ** 2 * (3 - 2 * (gy - iy));
    const a = noise[iy * nx + ix] * (1 - tx) + noise[iy * nx + ix + 1] * tx;
    const b = noise[(iy + 1) * nx + ix] * (1 - tx) + noise[(iy + 1) * nx + ix + 1] * tx;
    const nube = Math.max(0, a * (1 - ty) + b * ty - 0.52) * 0.16 * Math.sin(Math.PI * y / 258);
    const n = (rand() - 0.5) * 1.6, k = (y * 1024 + x) * 4;
    pix[k] = pix[k] * (1 - nube) + 255 * nube + n;
    pix[k + 1] = pix[k + 1] * (1 - nube) + 222 * nube + n;
    pix[k + 2] = pix[k + 2] * (1 - nube) + 215 * nube + n;
  }
  g.putImageData(cieloPx, 0, 0);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, depthWrite: false, fog: false });
  return new THREE.Mesh(new THREE.SphereGeometry(420, 64, 48), mat);
}

function crearNubes(scene) {
  const geo = new THREE.IcosahedronGeometry(1, 0);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const escala = 0.9 + ((i * 37) % 11) / 50;
    pos.setXYZ(i, pos.getX(i) * escala, pos.getY(i) * escala, pos.getZ(i) * escala);
  }
  geo.computeVertexNormals();
  const arriba = new THREE.MeshLambertMaterial({ color: '#fff8e7', transparent: true, opacity: 0.92, flatShading: true, depthWrite: false });
  const durazno = new THREE.MeshLambertMaterial({ color: '#ffe0c2', transparent: true, opacity: 0.92, flatShading: true, depthWrite: false });
  const base = new THREE.MeshLambertMaterial({ color: '#d1c4e9', transparent: true, opacity: 0.92, flatShading: true, depthWrite: false });
  const grupos = [];
  for (let i = 0; i < 8; i++) {
    const grupo = new THREE.Group();
    const cantidad = 3 + (i % 3);
    for (let j = 0; j < cantidad; j++) {
      const nube = new THREE.Mesh(geo, j === cantidad - 1 ? base : i % 3 === 0 ? durazno : arriba);
      nube.position.set((j - (cantidad - 1) / 2) * 2.1, j === cantidad - 1 ? -0.62 : 0.1 + (j % 2) * 0.35, j % 2 ? 0.25 : -0.2);
      nube.scale.set(2.3 + (j % 2) * 0.7, 1.25 + (j % 3) * 0.22, 1.5 + (j % 2) * 0.35);
      grupo.add(nube);
    }
    grupo.position.set(-150 + i * 43, 70 + (i * 17 % 26), -105 + (i % 4) * 58);
    scene.add(grupo); grupos.push(grupo);
  }
  let anterior = null;
  return { animar(tiempo) {
    if (anterior !== null) {
      const dt = Math.min(0.1, Math.max(0, (tiempo - anterior) / 1000));
      for (const nube of grupos) {
        nube.position.x += dt * 1.5;
        if (nube.position.x > 190) nube.position.x = -190;
      }
    }
    anterior = tiempo;
  } };
}

function crearSol() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const halo = g.createRadialGradient(128, 128, 18, 128, 128, 128);
  halo.addColorStop(0, 'rgba(255,246,211,1)'); halo.addColorStop(0.15, 'rgba(255,232,185,.96)');
  halo.addColorStop(0.27, 'rgba(255,207,150,.34)'); halo.addColorStop(0.58, 'rgba(255,185,137,.12)');
  halo.addColorStop(1, 'rgba(255,175,140,0)');
  g.fillStyle = halo; g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sol = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, toneMapped: false }));
  sol.position.set(115, 105, -245); sol.scale.set(62, 62, 1);
  return sol;
}

function suelo() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  const m = c.width / CUADRA;
  g.fillStyle = '#37474f'; g.fillRect(0, 0, c.width, c.height);
  // Adoquines cálidos ocupan la manzana; juntas finas evitan aspecto desértico.
  const borde = 4.25 * m, fin = 21.75 * m, pasoX = 1.35 * m, pasoY = 0.9 * m;
  g.fillStyle = '#cfbea3'; g.fillRect(borde, borde, fin - borde, fin - borde);
  for (let y = borde; y < fin; y += pasoY) {
    const fila = Math.round((y - borde) / pasoY), corrimiento = fila % 2 ? pasoX / 2 : 0;
    for (let x = borde - pasoX + corrimiento; x < fin; x += pasoX) {
      g.fillStyle = (fila + Math.round(x / pasoX)) % 3 ? '#e2d5c0' : '#c9b596';
      g.fillRect(x + 1.5, y + 1.5, pasoX - 3, pasoY - 3);
    }
  }
  // Marcas amarillas en los carriles; cruces blancos llevan geometría elevada aparte.
  g.strokeStyle = '#fbc02d'; g.lineWidth = 2.2;
  for (const p of [1.8 * m, c.width - 1.8 * m]) {
    g.setLineDash([0.8 * m, 0.65 * m]);
    g.beginPath(); g.moveTo(p, 0); g.lineTo(p, c.height); g.stroke();
    g.beginPath(); g.moveTo(0, p); g.lineTo(c.width, p); g.stroke();
  }
  g.setLineDash([]);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const lado = CUADRA * 23; // impar: los bordes de cada mosaico caen en las calles
  tex.repeat.set(23, 23);
  const m3 = new THREE.Mesh(new THREE.PlaneGeometry(lado, lado), new THREE.MeshLambertMaterial({ map: tex }));
  m3.rotation.x = -Math.PI / 2;
  return m3;
}

// Anuncios renderizados por lotes: placas por textura, marcos y bombillas
// instanciados. No participan en las cajas usadas por la física del columpio.
const texturasCarteles = new Map();
const cargadorCarteles = new THREE.TextureLoader();
const geoPlaca = new THREE.BoxGeometry(1, 1, 0.55);
const geoBarra = new THREE.BoxGeometry(1, 1, 1);
const geoBombilla = new THREE.SphereGeometry(0.14, 7, 5);

function cargarTexturaCartel(anuncio) {
  const url = new URL(`../texturas/${anuncio.textura}`, import.meta.url).href;
  if (texturasCarteles.has(url)) return texturasCarteles.get(url);
  const tex = cargadorCarteles.load(url, (imagen) => {
    imagen.colorSpace = THREE.SRGBColorSpace;
    imagen.anisotropy = 2;
    if (anuncio.nuevo) {
      const c = document.createElement('canvas'); c.width = 1024; c.height = 410;
      const g = c.getContext('2d');
      g.drawImage(imagen.image, 0, 0, c.width, c.height);
      g.fillStyle = 'rgba(26,14,42,.84)'; g.fillRect(24, 248, 590, 138);
      g.fillStyle = '#ffe27a'; g.textAlign = 'left'; g.textBaseline = 'middle';
      g.font = '900 46px system-ui, sans-serif'; g.fillText(anuncio.lineas[0], 50, 292, 540);
      g.fillStyle = '#fff'; g.font = '700 30px system-ui, sans-serif';
      g.fillText(anuncio.lineas[1], 50, 348, 540);
      imagen.image = c;
      imagen.needsUpdate = true;
    }
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 2;
  texturasCarteles.set(url, tex);
  return tex;
}

function matriz(x, y, z, sx, sy, sz, rotY = 0) {
  const o = new THREE.Object3D();
  o.position.set(x, y, z); o.rotation.y = rotY; o.scale.set(sx, sy, sz); o.updateMatrix();
  return o.matrix;
}

function crearMaterialBombillas() {
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uCartelTime = { value: 0 };
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uCartelTime;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float pulso = 0.12 + 0.88 * (0.5 + 0.5 * sin(uCartelTime * 4.5 - vColor.r * 6.283));
        diffuseColor.rgb = mix(vec3(1.0, 0.52, 0.12), vec3(1.0, 0.96, 0.72), vColor.g) * pulso;`);
    mat.userData.shader = shader;
  };
  mat.customProgramCacheKey = () => 'senku-cartel-bombilla-v1';
  return mat;
}

function agregarBombillas(coleccion, x, y, z, ancho, alto, rotY, fase = 0) {
  const paso = 1.65;
  const nAncho = Math.ceil(ancho / paso), nAlto = Math.ceil(alto / paso) - 1;
  const lados = [
    ...Array.from({ length: nAncho }, (_, i) => [-ancho / 2 + (i + 0.5) * ancho / nAncho, alto / 2]),
    ...Array.from({ length: nAncho }, (_, i) => [-ancho / 2 + (i + 0.5) * ancho / nAncho, -alto / 2]),
    ...Array.from({ length: nAlto }, (_, i) => [-ancho / 2, -alto / 2 + (i + 1) * alto / (nAlto + 1)]),
    ...Array.from({ length: nAlto }, (_, i) => [ancho / 2, -alto / 2 + (i + 1) * alto / (nAlto + 1)]),
  ];
  const cos = Math.cos(rotY), sin = Math.sin(rotY);
  lados.forEach(([lx, ly], i) => {
    coleccion.push({ x: x + lx * cos, y: y + ly, z: z - lx * sin, rotY, phase: (fase + i / lados.length) % 1, frio: i % 4 === 0 });
  });
}

function crearMarquesina(anuncio, x, y, z, ancho, rotY, scene) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 128;
  const g = c.getContext('2d');
  g.font = '900 60px system-ui, sans-serif'; g.textBaseline = 'middle'; g.fillStyle = '#fff3a8';
  const texto = `   ✦   ${anuncio.lineas[0]}   ✦   `;
  for (let i = 0; i < 5; i++) g.fillText(texto, i * 410, 65);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping; tex.repeat.x = 1.8;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false });
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(ancho - 1, 0.9), mat);
  strip.position.set(x + 0.32 * Math.sin(rotY), y - 2.35, z + 0.32 * Math.cos(rotY)); strip.rotation.y = rotY;
  strip.userData.texturaRodante = tex;
  scene.add(strip);
  return strip;
}

function crearCarteles(cajas, scene) {
  const anuncios = CARTELES.map((a) => ({ ...a }));
  const ubicaciones = [];
  const usados = new Set();
  const candidatos = cajas.filter((c) => c.max.x - c.min.x >= 10 && c.max.z - c.min.z >= 10);
  const coloresMarco = [0xff5794, 0xffd14f, 0x42e3dc, 0xb48cff, 0xff824a];
  const porTextura = new Map();
  const portalArtes = [];
  const portalLoader = new THREE.TextureLoader();
  const barras = [], bombillas = [], postes = [], cerchas = [], focos = [], marquesinas = [], neones = [];
  const giratorioIndex = anuncios.findIndex(({ giro }) => giro);

  for (const [k, anuncio] of anuncios.entries()) {
    const [i, j] = anuncio.ubicacion;
    const tx = i * CUADRA, tz = j * CUADRA;
    const posibles = candidatos.filter((c) => !usados.has(c) && (!anuncio.techo || c.max.y < 37));
    const caja = (posibles.length ? posibles : candidatos.filter((c) => !usados.has(c))).sort((a, b) => {
      const d = (c) => ((c.min.x + c.max.x) / 2 - tx) ** 2 + ((c.min.z + c.max.z) / 2 - tz) ** 2;
      return d(a) - d(b);
    })[0];
    if (!caja) continue;
    usados.add(caja);
    const cx = (caja.min.x + caja.max.x) / 2, cz = (caja.min.z + caja.max.z) / 2;
    const dx = -cx, dz = -cz;
    const ladoX = Math.abs(dx) > Math.abs(dz);
    const haciaCentro = ladoX ? dx > 0 : dz > 0;
    const rotY = ladoX ? (haciaCentro ? Math.PI / 2 : -Math.PI / 2) : (haciaCentro ? 0 : Math.PI);
    const cara = ladoX ? caja.max.z - caja.min.z : caja.max.x - caja.min.x;
    const ancho = anuncio.kiosco ? 7.5 : Math.min(22, Math.max(17, cara + 2));
    const alto = anuncio.kiosco ? 3.2 : ancho * 0.4;
    let x = cx, z = cz;
    if (anuncio.kiosco) {
      x = i * CUADRA + (i > 0 ? -13 : i < 0 ? 13 : 0);
      z = j * CUADRA + (j > 0 ? -13 : j < 0 ? 13 : 0);
    } else if (ladoX) x = haciaCentro ? caja.max.x + 0.3 : caja.min.x - 0.3;
    else z = haciaCentro ? caja.max.z + 0.3 : caja.min.z - 0.3;
    const techo = anuncio.techo && !anuncio.kiosco;
    const y = anuncio.kiosco ? 4.1 : techo ? caja.max.y + alto * 0.55 : Math.max(8, Math.min(18, caja.max.y * 0.58));
    const item = { anuncio, x, y, z, ancho, alto, rotY, techo, color: coloresMarco[k % coloresMarco.length] };
    ubicaciones.push(item);
    if (PORTALES[anuncio.id]?.mundo) {
      const materialArte = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
      const arte = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), materialArte);
      arte.position.set(x, y, z); arte.rotation.y = rotY; arte.translateZ(0.012); arte.renderOrder = 3; scene.add(arte);
      portalArtes.push({ item, arte, opacity: 0, textura: null, cargando: false });
    }

    const back = 0.54;
    // Perímetro grueso en cuatro piezas y bastidor posterior con largueros.
    const rail = (lx, ly, lz, sx, sy, sz) => barras.push({ x: x + lx * Math.cos(rotY) + lz * Math.sin(rotY), y: y + ly, z: z - lx * Math.sin(rotY) + lz * Math.cos(rotY), sx, sy, sz, rotY, color: item.color });
    const punto = (lx, ly, lz) => new THREE.Vector3(x + lx * Math.cos(rotY) + lz * Math.sin(rotY), y + ly, z - lx * Math.sin(rotY) + lz * Math.cos(rotY));
    for (const edge of [-1, 1]) {
      rail(edge * (ancho / 2 + 0.42), 0, 0, 0.84, alto + 1.68, 0.9);
      rail(0, edge * (alto / 2 + 0.42), 0, ancho + 1.68, 0.84, 0.9);
      rail(edge * ancho * 0.39, 0, -back, 0.36, alto + 0.4, 0.36);
    }
    rail(0, alto * 0.12, -back, ancho * 0.8, 0.34, 0.36);
    const bahias = Math.max(2, Math.ceil(ancho / 5));
    for (let b = 0; b < bahias; b++) {
      const x0 = -ancho / 2 + b * ancho / bahias, x1 = -ancho / 2 + (b + 1) * ancho / bahias;
      cerchas.push([punto(x0, -alto / 2, -0.95), punto(x1, alto / 2, -0.95)], [punto(x0, alto / 2, -0.95), punto(x1, -alto / 2, -0.95)]);
    }
    agregarBombillas(bombillas, x, y, z + 0.36 * Math.cos(rotY), ancho + 0.9, alto + 0.9, rotY, k * 0.13);

    if (techo) {
      const pasarela = Math.min(ancho, 12), yPaso = -alto * 0.55 + 0.2;
      rail(0, yPaso, -1.25, pasarela, 0.14, 1.6);
      const centroPaso = punto(0, yPaso, -1.25), alcanceX = Math.abs(Math.cos(rotY)) * pasarela / 2 + Math.abs(Math.sin(rotY)) * 0.8;
      const alcanceZ = Math.abs(Math.sin(rotY)) * pasarela / 2 + Math.abs(Math.cos(rotY)) * 0.8;
      cajas.push({ min: { x: centroPaso.x - alcanceX, y: centroPaso.y - 0.07, z: centroPaso.z - alcanceZ }, max: { x: centroPaso.x + alcanceX, y: centroPaso.y + 0.07, z: centroPaso.z + alcanceZ } });
      for (let n = 0; n <= 10; n++) rail(-pasarela / 2 + n * pasarela / 10, yPaso + 0.09, -1.25, 0.07, 0.08, 1.48);
      for (const lado of [-1, 1]) {
        const barandalZ = -1.25 + lado * 0.7;
        rail(0, yPaso + 0.68, barandalZ, pasarela, 0.12, 0.12);
        for (let n = 0; n <= Math.ceil(pasarela / 2); n++) rail(-pasarela / 2 + n * 2, yPaso + 0.34, barandalZ, 0.1, 0.68, 0.1);
      }
      for (const lado of [-1, 1]) focos.push({ ...punto(lado * pasarela * 0.38, -alto / 2 - 0.1, 0.62), rotY });
      for (const side of [-1, 1]) {
        const lx = side * ancho * 0.39;
        const px = x + lx * Math.cos(rotY) - 0.4 * Math.sin(rotY);
        const pz = z - lx * Math.sin(rotY) - 0.4 * Math.cos(rotY);
        const top = y - alto / 2 - 0.2;
        const length = Math.max(1.2, y + alto / 2 - caja.max.y + 1.1);
        postes.push({ x: px, y: caja.max.y + length / 2, z: pz, sx: 0.48, sy: length, sz: 0.48, rotY, color: 0x684d57 });
        postes.push({ x: px + Math.cos(rotY) * 0.7, y: top, z: pz - Math.sin(rotY) * 0.7, sx: 1.1, sy: 0.42, sz: 0.42, rotY, color: 0x9b6265 });
      }
    } else if (anuncio.kiosco) {
      for (const side of [-1, 1]) {
        const lx = side * 2.55;
        postes.push({ x: x + lx * Math.cos(rotY), y: 1.25, z: z - lx * Math.sin(rotY), sx: 0.38, sy: 2.5, sz: 0.42, rotY, color: 0x684d57 });
      }
      postes.push({ x, y: 0.22, z, sx: 6.1, sy: 0.32, sz: 1.1, rotY, color: 0x9b6265 });
    } else {
      for (const side of [-1, 1]) {
        const lx = side * ancho * 0.38, lz = -0.82;
        postes.push({ x: x + lx * Math.cos(rotY) + lz * Math.sin(rotY), y, z: z - lx * Math.sin(rotY) + lz * Math.cos(rotY), sx: 0.42, sy: 0.42, sz: 1.65, rotY, color: 0x684d57 });
      }
    }

    if (k !== giratorioIndex) {
      const grupoKey = `${anuncio.textura}|${Boolean(anuncio.neon)}`;
      if (!porTextura.has(grupoKey)) porTextura.set(grupoKey, []);
      porTextura.get(grupoKey).push(item);
    }
    if (anuncio.neon) neones.push({ fase: k * 1.7, material: null });
    if (anuncio.marquesina) marquesinas.push(crearMarquesina(anuncio, x, y, z, ancho, rotY, scene));
  }

  for (const [key, items] of porTextura) {
    const [archivo, neon] = key.split('|');
    const anuncio = items[0].anuncio;
    const textura = cargarTexturaCartel(anuncio);
    const material = new THREE.MeshStandardMaterial({ map: textura, emissive: neon === 'true' ? 0xffffff : 0x000000, emissiveMap: neon === 'true' ? textura : null, emissiveIntensity: neon === 'true' ? 1.4 : 0, roughness: 0.72, metalness: 0 });
    const laterales = new THREE.MeshStandardMaterial({ color: 0x241d35, roughness: 0.82, metalness: 0.1 });
    const mesh = new THREE.InstancedMesh(geoPlaca, [laterales, laterales, laterales, laterales, material, laterales], items.length);
    items.forEach((item, n) => mesh.setMatrixAt(n, matriz(item.x, item.y, item.z, item.ancho, item.alto, 1, item.rotY)));
    mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); mesh.renderOrder = 2; scene.add(mesh);
    if (neon === 'true') for (const e of neones) if (!e.material) e.material = material;
  }

  const instancias = (lista, geo, mat) => {
    if (!lista.length) return null;
    const mesh = new THREE.InstancedMesh(geo, mat, lista.length);
    lista.forEach((p, i) => {
      mesh.setMatrixAt(i, matriz(p.x, p.y, p.z, p.sx, p.sy, p.sz, p.rotY));
      if (p.color !== undefined) mesh.setColorAt(i, new THREE.Color(p.color));
    });
    mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); scene.add(mesh); return mesh;
  };
  instancias(barras, geoBarra, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.15, vertexColors: true }));
  instancias(postes, geoBarra, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, vertexColors: true }));
  const tubosCercha = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.055, 0.055, 1, 6), new THREE.MeshStandardMaterial({ color: '#455a64', roughness: 0.55, metalness: 0.45 }), cerchas.length);
  const dummyCercha = new THREE.Object3D(), ejeY = new THREE.Vector3(0, 1, 0);
  cerchas.forEach(([a, b], i) => {
    const direccion = new THREE.Vector3().subVectors(b, a);
    dummyCercha.position.copy(a).add(b).multiplyScalar(0.5);
    dummyCercha.quaternion.setFromUnitVectors(ejeY, direccion.clone().normalize()); dummyCercha.scale.set(1, direccion.length(), 1); dummyCercha.updateMatrix(); tubosCercha.setMatrixAt(i, dummyCercha.matrix);
  });
  scene.add(tubosCercha);
  const proyectores = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.24, 0.32, 8), new THREE.MeshStandardMaterial({ color: '#fff1bd', emissive: '#ffd36b', emissiveIntensity: 0.8, roughness: 0.45 }), focos.length);
  const dummyFoco = new THREE.Object3D();
  focos.forEach((p, i) => { dummyFoco.position.set(p.x, p.y, p.z); dummyFoco.rotation.set(Math.PI / 2 + 0.35, p.rotY, 0); dummyFoco.updateMatrix(); proyectores.setMatrixAt(i, dummyFoco.matrix); });
  scene.add(proyectores);

  const bombillaMaterial = crearMaterialBombillas();
  const bulbos = new THREE.InstancedMesh(geoBombilla, bombillaMaterial, bombillas.length);
  bombillas.forEach((p, i) => {
    bulbos.setMatrixAt(i, matriz(p.x, p.y, p.z, 1, 1, 1, p.rotY));
    bulbos.setColorAt(i, new THREE.Color(p.phase, p.frio ? 1 : 0, 0));
  });
  bulbos.instanceMatrix.needsUpdate = true; bulbos.computeBoundingSphere(); scene.add(bulbos);

  // El letrero especial gira despacio en su eje; sus bombillas siguen en lote.
  const giratorio = ubicaciones.find((p) => p.anuncio.giro);
  let pivoteGiratorio = null;
  if (giratorio) {
    pivoteGiratorio = new THREE.Group(); pivoteGiratorio.position.set(giratorio.x, giratorio.y, giratorio.z); scene.add(pivoteGiratorio);
    const mat = new THREE.MeshStandardMaterial({ map: cargarTexturaCartel(giratorio.anuncio), emissive: 0x221144, roughness: 0.7 });
    const cara = new THREE.Mesh(geoPlaca, mat); cara.scale.set(giratorio.ancho, giratorio.alto, 0.55); pivoteGiratorio.add(cara);
    const marcoMat = new THREE.MeshStandardMaterial({ color: giratorio.color, emissive: giratorio.color, emissiveIntensity: 0.5 });
    for (const edge of [-1, 1]) {
      const vertical = new THREE.Mesh(geoBarra, marcoMat); vertical.position.x = edge * (giratorio.ancho / 2 + 0.42); vertical.scale.set(0.84, giratorio.alto + 1.68, 0.9); pivoteGiratorio.add(vertical);
      const horizontal = new THREE.Mesh(geoBarra, marcoMat); horizontal.position.y = edge * (giratorio.alto / 2 + 0.42); horizontal.scale.set(giratorio.ancho + 1.68, 0.84, 0.9); pivoteGiratorio.add(horizontal);
    }
  }

  // Globo de anuncio: un paseo lento alrededor de las primeras manzanas.
  const globo = new THREE.Group();
  const bolsa = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 8), new THREE.MeshStandardMaterial({ color: 0xff7eae, roughness: 0.58 }));
  bolsa.scale.set(1.65, 0.78, 0.78); bolsa.position.y = 1.1; globo.add(bolsa);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.05, 0.12), new THREE.MeshBasicMaterial({ map: cargarTexturaCartel(anuncios[0]), toneMapped: false }));
  panel.position.set(0, 1.05, 1.2); globo.add(panel);
  const canasta = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.8), new THREE.MeshStandardMaterial({ color: 0x8b573e }));
  canasta.position.y = -1.15; globo.add(canasta); globo.position.y = 38; scene.add(globo);

  return {
    ubicaciones,
    animarPortal(pos, dt) {
      let cerca = null, distancia = Infinity;
      for (const p of portalArtes) {
        const d = Math.hypot(pos.x-p.item.x,pos.y-p.item.y,pos.z-p.item.z);
        if (d < 8 && d < distancia) { cerca=p; distancia=d; }
      }
      for (const p of portalArtes) {
        const meta = p === cerca ? 1 : 0;
        p.opacity += (meta-p.opacity) * Math.min(1,dt*3);
        p.arte.material.opacity=p.opacity;
        if (meta && !p.textura && !p.cargando) {
          p.cargando=true;
          const id=PORTALES[p.item.anuncio.id]?.mundo || p.item.anuncio.id;  // un arte por mundo, no por cartel
          portalLoader.load(new URL(`../texturas/portales/${id}.webp`, import.meta.url).href, tex=>{
            tex.colorSpace=THREE.SRGBColorSpace; p.textura=tex; p.arte.material.map=tex; p.arte.material.needsUpdate=true; p.cargando=false;
          }, undefined, ()=>{p.cargando=false;});
        }
      }
      for (const p of portalArtes) if (p!==cerca && p.opacity<0.02 && p.textura) { p.textura.dispose();p.arte.material.map=null;p.arte.material.needsUpdate=true;p.textura=null; }
    },
    animar(tiempo) {
      const t = tiempo * 0.001;
      if (bombillaMaterial.userData.shader) bombillaMaterial.userData.shader.uniforms.uCartelTime.value = t;
      marquesinas.forEach((m, i) => { m.userData.texturaRodante.offset.x = (t * (0.07 + i * 0.015)) % 1; });
      neones.forEach((e) => { if (e.material) e.material.emissiveIntensity = Math.max(0.15, 1.7 * (0.5 + 0.5 * Math.sin(t * 2.2 + e.fase))); });
      if (pivoteGiratorio) pivoteGiratorio.rotation.y = t * 0.08;
      globo.position.set(Math.cos(t * 0.055) * 34, 38 + Math.sin(t * 0.13) * 2, Math.sin(t * 0.055) * 34);
      globo.rotation.y = -t * 0.055 + Math.PI / 2;
      globo.rotation.z = Math.sin(t * 0.3) * 0.04;
    },
  };
}

function materialEdificio() {
  // Atlas único, repetido cada módulo de fachada. Dibujado en código para
  // evitar descargas y conservar marcos, dinteles y alféizares al acercarse.
  const lienzo = document.createElement('canvas'); lienzo.width = 512; lienzo.height = 128;
  const g = lienzo.getContext('2d');
  const fondos = ['#fff8e8', '#fff3dc', '#f8f3e7', '#fff7e6'];
  const vidrios = ['#a8dce2', '#ffe0a6', '#b9cafa', '#f4b8ba'];
  for (let i = 0; i < 4; i++) {
    const x = i * 128;
    g.fillStyle = fondos[i]; g.fillRect(x, 0, 128, 128);
    g.fillStyle = '#8d6e63'; g.fillRect(x + 17, 13, 94, 102);
    const grad = g.createLinearGradient(x + 19, 15, x + 108, 112);
    grad.addColorStop(0, vidrios[i]); grad.addColorStop(0.72, '#d9eff0'); grad.addColorStop(1, '#8db8c3');
    g.fillStyle = grad; g.fillRect(x + 23, 19, 82, 86);
    g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x + 27, 21, 5, 80);
    g.fillStyle = '#fff8e1'; g.fillRect(x + 61, 18, 5, 88); g.fillRect(x + 21, 59, 87, 5);
    g.fillStyle = '#fff8e1'; g.fillRect(x + 12, 108, 104, 9); g.fillRect(x + 14, 8, 100, 7);
    if (i === 1 || i === 3) { // maceta / balcón estilizado en el propio atlas
      g.fillStyle = '#473b46'; g.fillRect(x + 12, 100, 104, 5);
      g.fillStyle = '#82b57b'; g.fillRect(x + 28, 96, 11, 5); g.fillRect(x + 82, 95, 15, 6);
    }
  }
  const atlas = new THREE.CanvasTexture(lienzo); atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.generateMipmaps = true; atlas.minFilter = THREE.LinearMipmapLinearFilter; atlas.magFilter = THREE.LinearFilter;
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  mat.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vWP = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
        vWN = normalize(mat3(instanceMatrix) * objectNormal);`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWP; varying vec3 vWN;\nuniform sampler2D uFacadeAtlas; uniform float uNoche;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        if (vWN.y < 0.5 && vWN.y > -0.5) {
          vec2 c = abs(vWN.x) > 0.5 ? vWP.zy : vWP.xy;
          vec2 celda = floor(c / vec2(3.4, 3.8));
          vec2 g = fract(c / vec2(3.4, 3.8));
          float variante = floor(fract(sin(dot(celda, vec2(12.9898, 78.233))) * 43758.5453) * 4.0);
          vec3 fachada = texture2D(uFacadeAtlas, vec2((variante + g.x) * 0.25, g.y)).rgb;
          float mascara = step(0.1, g.x) * step(g.x, 0.9) * step(0.02, g.y) * step(g.y, 0.98) * step(3.0, vWP.y);
          mascara *= 1.0 - smoothstep(75.0, 125.0, length(cameraPosition - vWP));
          float azarVentana = fract(sin(dot(floor(c / vec2(3.4, 3.8)), vec2(19.19, 73.73))) * 43758.5453);
          float vidrio = smoothstep(0.18, 0.42, max(fachada.r, max(fachada.g, fachada.b)));
          fachada = mix(fachada, vec3(1.0, 0.58, 0.28), uNoche * step(0.58, azarVentana) * vidrio * 0.82);
          diffuseColor.rgb = mix(diffuseColor.rgb, fachada * diffuseColor.rgb, mascara);
        } else { diffuseColor.rgb *= 1.12; }`);
    s.uniforms.uFacadeAtlas = { value: atlas };
    s.uniforms.uNoche = { value: 0 };
    mat.userData.shader = s;
  };
  mat.customProgramCacheKey = () => 'senku-fachadas-atlas-v1';
  return mat;
}

function agregarLote(scene, geometria, material, piezas) {
  if (!piezas.length) return null;
  const mesh = new THREE.InstancedMesh(geometria, material, piezas.length);
  const dummy = new THREE.Object3D();
  piezas.forEach((p, i) => {
    dummy.position.set(p.x, p.y, p.z); dummy.rotation.set(p.rx || 0, p.rotY || 0, p.rz || 0);
    dummy.scale.set(p.sx, p.sy, p.sz); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
    if (p.color) mesh.setColorAt(i, new THREE.Color(p.color));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere(); scene.add(mesh); return mesh;
}

function geometriaConLuz(geometria) {
  const pos = geometria.attributes.position, nor = geometria.attributes.normal;
  const color = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const luz = luzVertice({ x: pos.getX(i), y: pos.getY(i), z: pos.getZ(i), nx: nor.getX(i), ny: nor.getY(i), nz: nor.getZ(i) });
    color[i * 3] = luz; color[i * 3 + 1] = luz; color[i * 3 + 2] = luz;
  }
  geometria.setAttribute('color', new THREE.BufferAttribute(color, 3));
  return geometria;
}

function crearCordillera(scene) {
  const puntos = 72, radio = 322, base = -26;
  const posiciones = [], colores = [], indices = [];
  const paleta = ['#776a85', '#70647f', '#665b78', '#7c6b80', '#685e77'].map((c) => new THREE.Color(c));
  for (let i = 0; i <= puntos; i++) {
    const a = (i / puntos - 0.5) * 2.4;
    const distancia = Math.abs(Math.atan2(Math.sin(a - 0.37), Math.cos(a - 0.37)));
    const volcan = Math.max(0, 1 - distancia / 0.15) * 62 - (distancia < 0.018 ? 3 : 0);
    const borde = Math.min(1, i / (puntos * 0.1), (puntos - i) / (puntos * 0.1));
    const cresta = base + (3 + 8 * Math.sin(a * 5.1 + 1) + 5 * Math.sin(a * 11.3) + volcan - base) * borde;
    const x = Math.sin(a) * radio, z = -Math.cos(a) * radio;
    posiciones.push(x, base, z, x, cresta, z);
    const tono = paleta[Math.floor(i / 4) % paleta.length];
    for (let v = 0; v < 2; v++) { colores.push(tono.r, tono.g, tono.b); }
    if (i < puntos) {
      const n = i * 2;
      indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colores, 3)); geo.setIndex(indices); geo.computeVertexNormals();
  scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: true })));
}

function crearSkyline(scene, radio, capa) {
  const perfiles = crearPerfilLejano(2137 + capa * 271, capa ? 40 : 56);
  const geo = geometriaConLuz(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
  const malla = new THREE.InstancedMesh(geo, mat, perfiles.length);
  const m = new THREE.Matrix4(), o = new THREE.Object3D();
  const tonos = ['#aa8090', '#8c7890', '#b27d78', '#777a91', '#a18b84'].map((c) => new THREE.Color(c));
  perfiles.forEach((p, i) => {
    const a = p.angulo;
    o.position.set(Math.sin(a) * radio, -1, -Math.cos(a) * radio); // la caja ya tiene la base en y=0
    o.rotation.y = a; o.scale.set(p.ancho, p.alto, p.fondo); o.updateMatrix(); m.copy(o.matrix);
    malla.setMatrixAt(i, m); malla.setColorAt(i, tonos[(p.color + capa) % tonos.length]);
  });
  malla.instanceMatrix.needsUpdate = true; malla.instanceColor.needsUpdate = true; malla.computeBoundingSphere();
  malla.frustumCulled = true;
  scene.add(malla);
}

function ponerInstancia(malla, indice, posicion, escala, rotacion = 0, dummy = new THREE.Object3D(), rotacionZ = 0) {
  dummy.position.copy(posicion); dummy.rotation.set(0, rotacion, rotacionZ); dummy.scale.copy(escala); dummy.updateMatrix();
  malla.setMatrixAt(indice, dummy.matrix);
}

function crearVidaCiudad(scene, cajas, rutasCoche, nubes) {
  const unidad = new THREE.Object3D();
  const lambert = (color) => new THREE.MeshLambertMaterial({ color });
  const colorBlanco = new THREE.Color('#fff4dc');

  // Tráfico de ruta fija: una carrocería, cabina y ruedas compartidas por todos.
  const coches = rutasCoche.filter((c) => Math.abs(c.x) < 74).filter((_, i) => i % 2 === 0).slice(0, 12).map((c, i) => ({
    x: c.x,
    fase: c.z + (i % 3) * 54,
    velocidad: 2.7 + (i % 4) * 0.32,
    color: ['#e77965', '#6d9bb0', '#f1c45f', '#697c68', '#d88aab'][i % 5],
  }));
  const carroceria = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), lambert('#ffffff'), coches.length);
  const cabinas = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), lambert('#b6d9d9'), coches.length);
  const ruedas = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.31, 0.31, 0.18, 8), lambert('#34333c'), coches.length * 4);
  coches.forEach((c, i) => { carroceria.setColorAt(i, new THREE.Color(c.color)); cabinas.setColorAt(i, colorBlanco); });
  scene.add(carroceria, cabinas, ruedas);

  // Gatitos con siluetas redondas, orejas puntiagudas y pañuelos de color.
  const gatos = [
    ...Array.from({ length: 6 }, (_, i) => ({ x: 15 + Math.cos(i * 1.05) * 7, z: -9 + Math.sin(i * 1.05) * 6, y: 0.55, radio: 4.8, fase: i * 1.3, ventana: false })),
    ...cajas.filter((c) => c.max.y >= 10 && c.max.y < 28 && Math.abs(c.min.x) < 70 && Math.abs(c.min.z) < 70).slice(2, 5).map((c, i) => ({
      x: (c.min.x + c.max.x) / 2, z: c.min.z - 0.8, y: 4.5 + i * 3.2, radio: 0.8, fase: i * 2.2, ventana: true,
    })),
  ];
  const parteGato = (geo, mat, pares, conteo = gatos.length) => {
    const malla = new THREE.InstancedMesh(geo, mat, conteo * pares);
    scene.add(malla); return malla;
  };
  const cuerposGato = parteGato(new THREE.SphereGeometry(1, 8, 6), lambert('#ffffff'), 1);
  const cabezasGato = parteGato(new THREE.SphereGeometry(1, 8, 6), lambert('#ffffff'), 1);
  const orejasGato = parteGato(new THREE.ConeGeometry(0.16, 0.34, 4), lambert('#ffffff'), 2);
  const ojosGato = parteGato(new THREE.SphereGeometry(0.055, 5, 4), new THREE.MeshBasicMaterial({ color: '#30273c' }), 2);
  const pañuelosGato = parteGato(new THREE.BoxGeometry(0.72, 0.18, 0.43), lambert('#ffffff'), 1);
  const patasGato = parteGato(new THREE.SphereGeometry(0.14, 6, 4), lambert('#ffffff'), 2);
  const colasGato = parteGato(new THREE.CapsuleGeometry(0.09, 0.48, 2, 5), lambert('#ffffff'), 1);
  gatos.forEach((g, i) => {
    const tonos = ['#7588a7', '#d47862', '#e7b957', '#659888', '#c18bab', '#ee9b5e', '#637c92', '#ce7966', '#9b765d'];
    const color = new THREE.Color(tonos[i % tonos.length]);
    cuerposGato.setColorAt(i, color); cabezasGato.setColorAt(i, color); colasGato.setColorAt(i, color);
    patasGato.setColorAt(i * 2, color); patasGato.setColorAt(i * 2 + 1, color);
    pañuelosGato.setColorAt(i, new THREE.Color(['#f5d16b', '#f4eee2', '#e9849d', '#70beb0'][i % 4]));
    orejasGato.setColorAt(i * 2, color); orejasGato.setColorAt(i * 2 + 1, color);
  });

  // Parvadas con alas plegadas en geometría low-poly. Una bandada despega junto a Senku.
  const pajaros = Array.from({ length: 14 }, (_, i) => ({
    x: 7 + Math.cos(i * 0.4) * (i < 5 ? 8 : 24),
    y: i < 5 ? 4 + i * 0.22 : (i < 10 ? 12 : 22) + (i % 4) * 0.7,
    z: -4 + Math.sin(i * 0.4) * (i < 5 ? 7 : 20),
    vx: 0, vz: 0, vxObjetivo: Math.cos(i * 0.7) * 2, vzObjetivo: Math.sin(i * 0.7) * 2,
    fase: i * 0.7, radio: i < 10 ? 25 : 45, huyendo: 0,
  }));
  const cuerpoAve = new THREE.InstancedMesh(new THREE.SphereGeometry(0.18, 6, 4), lambert('#5a5268'), pajaros.length);
  const alaAve = new THREE.InstancedMesh(new THREE.ConeGeometry(0.18, 1.1, 3), lambert('#73667e'), pajaros.length * 2);
  scene.add(cuerpoAve, alaAve);

  // Cuerdas de tendedero y prendas que se mecen con una brisa breve.
  const ropa = [], tendederos = [];
  cajas.filter((c) => c.max.y >= 9 && c.max.y < 32 && Math.abs(c.min.x) < 64 && Math.abs(c.min.z) < 64).slice(0, 4).forEach((c, j) => {
    const centroX = (c.min.x + c.max.x) / 2;
    const z = c.max.z + 1.1;
    tendederos.push({ x: centroX, y: c.max.y + 2.68, z, fase: j });
    for (let i = 0; i < 5; i++) ropa.push({ x: centroX - 3.6 + i * 1.8, y: c.max.y + 2.1, z, fase: i * 0.9 + j, color: ['#f2c35e', '#ee7890', '#74b6ae', '#eee2c7', '#a98dcc'][(i + j) % 5] });
  });
  const prendas = new THREE.InstancedMesh(new THREE.BoxGeometry(0.8, 1.05, 0.08), lambert('#ffffff'), ropa.length);
  ropa.forEach((p, i) => prendas.setColorAt(i, new THREE.Color(p.color)));
  scene.add(prendas);
  const cordeles = new THREE.InstancedMesh(new THREE.BoxGeometry(8.5, 0.035, 0.035), lambert('#5f5260'), tendederos.length);
  tendederos.forEach((p, i) => ponerInstancia(cordeles, i, new THREE.Vector3(p.x, p.y, p.z), new THREE.Vector3(1, 1, 1)));
  scene.add(cordeles);

  // Hojas cálidas y motas de polvo; un único lote dentro de los parques centrales.
  const motas = Array.from({ length: 30 }, (_, i) => ({
    x: 15 + Math.sin(i * 4.3) * (12 + i % 7), y: i < 20 ? 2.5 + (i % 5) * 0.65 : 5 + (i % 4) * 0.7,
    z: -9 + Math.cos(i * 2.7) * (12 + i % 6), fase: i * 0.75, polvo: i >= 20,
  }));
  const geoHoja = new THREE.BufferGeometry();
  geoHoja.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0, 0, 0, 0.5, 0, 0.5, 0, 0, -0.5, 0, 0, 0, -0.5, 0, 0.5, 0, 0], 3));
  geoHoja.computeVertexNormals();
  const hojas = new THREE.InstancedMesh(geoHoja, new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide, transparent: true, opacity: 0.72, depthWrite: false }), motas.length);
  motas.forEach((p, i) => hojas.setColorAt(i, new THREE.Color(p.polvo ? '#f1d8b6' : '#e8aa79')));
  scene.add(hojas);

  // Dirigible de paseo, con franjas y góndola. Los anuncios conservan su globo.
  const dirigible = new THREE.Group();
  const casco = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8), lambert('#e88475'));
  casco.scale.set(5.6, 1.65, 1.7); casco.position.y = 1; dirigible.add(casco);
  const franja = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 7), lambert('#f3c66f'));
  franja.scale.set(3.1, 1.67, 1.72); franja.position.y = 1; dirigible.add(franja);
  const gondola = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.62, 1.1), lambert('#76545b'));
  gondola.position.y = -1.2; dirigible.add(gondola);
  for (const x of [-0.8, 0.8]) {
    const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.65, 4), lambert('#725b59'));
    cabo.position.set(x, -0.72, 0); dirigible.add(cabo);
  }
  scene.add(dirigible);

  let horaInicio = null, ultimoMovimiento = null;
  const temporales = { coche: new THREE.Vector3(), gato: new THREE.Vector3(), ave: new THREE.Vector3(), ropa: new THREE.Vector3(), hoja: new THREE.Vector3() };
  const escalas = {
    carroceria: new THREE.Vector3(3.2, 0.72, 1.52), cabina: new THREE.Vector3(1.65, 0.55, 1.25),
    gatoCuerpo: new THREE.Vector3(0.58, 0.38, 0.32), gatoCabeza: new THREE.Vector3(0.35, 0.34, 0.34), pata: new THREE.Vector3(0.88, 0.88, 0.88), pañuelo: new THREE.Vector3(1, 1, 1), hoja: new THREE.Vector3(0.48, 0.48, 0.48),
    oreja: new THREE.Vector3(0.88, 0.88, 0.88), unidad: new THREE.Vector3(1, 1, 1), ala: new THREE.Vector3(1, 0.72, 1), polvo: new THREE.Vector3(0.18, 0.18, 0.18),
  };
  const lotesAnimados = [carroceria, cabinas, ruedas, cuerposGato, cabezasGato, orejasGato, ojosGato, pañuelosGato, patasGato, colasGato, cuerpoAve, alaAve, prendas, hojas];
  const esferaCiudad = new THREE.Sphere(new THREE.Vector3(0, 24, 0), 158);
  lotesAnimados.forEach((malla) => {
    malla.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    malla.boundingSphere = esferaCiudad.clone();
  });
  return {
    iniciar(tiempo) { horaInicio = tiempo; },
    animar(tiempo, jugador = { x: 0, z: 0 }) {
      const t = tiempo * 0.001, noche = nivelAnochecer(horaInicio === null ? 0 : (tiempo - horaInicio) / 1000);
      nubes.animar(tiempo);
      if (ultimoMovimiento !== null && tiempo - ultimoMovimiento < 33) return noche;
      const dt = ultimoMovimiento === null ? 0 : Math.min(0.1, Math.max(0, (tiempo - ultimoMovimiento) / 1000));
      ultimoMovimiento = tiempo;
      coches.forEach((c, i) => {
        const z = avanzarRuta(c.fase, t, c.velocidad, 162) - 81;
        temporales.coche.set(c.x, 0.72, z);
        ponerInstancia(carroceria, i, temporales.coche, escalas.carroceria, Math.PI / 2, unidad);
        temporales.coche.y = 1.3;
        ponerInstancia(cabinas, i, temporales.coche, escalas.cabina, Math.PI / 2, unidad);
        for (let w = 0; w < 4; w++) {
          const lado = w < 2 ? -1 : 1, eje = w % 2 ? 1 : -1;
          temporales.coche.set(c.x + lado * 0.9, 0.4, z + eje * 1.02);
          ponerInstancia(ruedas, i * 4 + w, temporales.coche, escalas.unidad, 0, unidad, Math.PI / 2);
        }
      });
      [carroceria, cabinas, ruedas].forEach((m) => { m.instanceMatrix.needsUpdate = true; });

      gatos.forEach((g, i) => {
        const a = g.fase + t * (g.ventana ? 0.1 : 0.22), x = g.x + Math.cos(a) * g.radio, z = g.z + Math.sin(a) * g.radio;
        const y = g.y + (g.ventana ? 0 : Math.abs(Math.sin(t * 5 + i)) * 0.1);
        const rumbo = g.ventana ? 0 : a + Math.PI / 2;
        temporales.gato.set(x, y, z); ponerInstancia(cuerposGato, i, temporales.gato, escalas.gatoCuerpo, rumbo, unidad);
        temporales.gato.y = y + 0.48; ponerInstancia(cabezasGato, i, temporales.gato, escalas.gatoCabeza, rumbo, unidad);
        temporales.gato.set(x, y + 0.24, z); ponerInstancia(pañuelosGato, i, temporales.gato, escalas.pañuelo, rumbo, unidad);
        for (let p = 0; p < 2; p++) {
          const pataX = p ? 0.22 : -0.22;
          temporales.gato.set(x + pataX * Math.cos(rumbo) + 0.22 * Math.sin(rumbo), y - 0.32, z - pataX * Math.sin(rumbo) + 0.22 * Math.cos(rumbo));
          ponerInstancia(patasGato, i * 2 + p, temporales.gato, escalas.pata, rumbo, unidad);
        }
        for (let e = 0; e < 2; e++) {
          const orejaX = e ? 0.18 : -0.18;
          temporales.gato.set(x + orejaX * Math.cos(rumbo) + 0.06 * Math.sin(rumbo), y + 0.76, z - orejaX * Math.sin(rumbo) + 0.06 * Math.cos(rumbo));
          ponerInstancia(orejasGato, i * 2 + e, temporales.gato, escalas.oreja, rumbo, unidad);
          const ojoX = e ? 0.12 : -0.12;
          temporales.gato.set(x + ojoX * Math.cos(rumbo) + 0.32 * Math.sin(rumbo), y + 0.5, z - ojoX * Math.sin(rumbo) + 0.32 * Math.cos(rumbo));
          ponerInstancia(ojosGato, i * 2 + e, temporales.gato, escalas.unidad, rumbo, unidad);
        }
        temporales.gato.set(x - Math.cos(rumbo) * 0.53, y + 0.06, z - Math.sin(rumbo) * 0.53);
        ponerInstancia(colasGato, i, temporales.gato, escalas.unidad, rumbo + Math.sin(t * 2 + i) * 0.45, unidad);
      });
      [cuerposGato, cabezasGato, orejasGato, ojosGato, pañuelosGato, patasGato, colasGato].forEach((m) => { m.instanceMatrix.needsUpdate = true; });

      pajaros.forEach((p, i) => {
        if (i < 5) {
          pasoPaloma(p, jugador, dt);
          if (Math.hypot(p.x, p.z) > 48) { p.x = 8 + Math.cos(p.fase) * 7; p.z = -6 + Math.sin(p.fase) * 7; p.huyendo = 0; }
        } else {
          const a = t * 0.1 + p.fase;
          p.x = 8 + Math.cos(a) * p.radio; p.z = -6 + Math.sin(a) * p.radio;
          p.y = (i < 10 ? 12 : 22) + (i % 4) * 0.7 + Math.sin(t * 0.4 + p.fase) * 0.8;
        }
        temporales.ave.set(p.x, p.y + Math.sin(t * 2 + p.fase) * 0.25, p.z);
        const yaw = Math.atan2(p.vx, p.vz);
        ponerInstancia(cuerpoAve, i, temporales.ave, new THREE.Vector3(1, 1, 1), yaw, unidad);
        for (let ala = 0; ala < 2; ala++) {
          temporales.ave.set(p.x + (ala ? 0.28 : -0.28), p.y + Math.sin(t * 13 + p.fase) * 0.1, p.z);
          const aleteo = Math.sin(t * 13 + p.fase) * 0.46 * (ala ? 1 : -1);
          ponerInstancia(alaAve, i * 2 + ala, temporales.ave, escalas.ala, yaw + (ala ? -0.55 : 0.55), unidad, aleteo);
        }
      });
      [cuerpoAve, alaAve].forEach((m) => { m.instanceMatrix.needsUpdate = true; });

      ropa.forEach((p, i) => {
        temporales.ropa.set(p.x, p.y, p.z);
        ponerInstancia(prendas, i, temporales.ropa, new THREE.Vector3(1, 1, 1), Math.sin(t * 1.7 + p.fase) * 0.22, unidad);
      });
      prendas.instanceMatrix.needsUpdate = true;
      motas.forEach((p, i) => {
        temporales.hoja.set(p.x + Math.sin(t * 0.5 + p.fase) * 0.8, p.y + Math.sin(t + p.fase) * 0.28, p.z + Math.cos(t * 0.37 + p.fase) * 0.8);
        temporales.hoja.x += Math.sin(p.fase) * 1.2;
        ponerInstancia(hojas, i, temporales.hoja, p.polvo ? escalas.polvo : escalas.hoja, t + p.fase, unidad);
      });
      hojas.instanceMatrix.needsUpdate = true;

      dirigible.position.set(-35 + Math.cos(t * 0.025) * 32, 55 + Math.sin(t * 0.11) * 1.4, 18 + Math.sin(t * 0.025) * 28);
      dirigible.rotation.y = -t * 0.025 + Math.PI / 2;
      if (this.materialEdificio?.userData.shader) this.materialEdificio.userData.shader.uniforms.uNoche.value = noche;
      return noche;
    },
    vincularFachada(material) { this.materialEdificio = material; },
  };
}

function crearMar(scene) {
  // Franja de costa detrás de la trama urbana, compuesta en una sola malla.
  const posiciones = [-280, -18, -306, 280, -18, -306, 280, 12, -306, -280, 12, -306];
  const arriba = new THREE.Color('#c58b91'), abajo = new THREE.Color('#587d91');
  const colores = [];
  for (const y of [-18, -18, 12, 12]) {
    const t = (y + 18) / 30, tono = abajo.clone().lerp(arriba, t);
    colores.push(tono.r, tono.g, tono.b);
  }
  const indices = [0, 1, 2, 0, 2, 3];
  let seed = 9917;
  const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 36; i++) {
    const x = -265 + rand() * 530, y = -12 + rand() * 22, w = 8 + rand() * 48, h = 0.12 + rand() * 0.22;
    const start = posiciones.length / 3;
    posiciones.push(x, y, -305.8, x + w, y, -305.8, x + w, y + h, -305.8, x, y + h, -305.8);
    const tono = new THREE.Color(i % 4 === 0 ? '#f0c0a0' : '#a4b0ae');
    for (let v = 0; v < 4; v++) colores.push(tono.r, tono.g, tono.b);
    indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colores, 3)); geo.setIndex(indices);
  scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, fog: true, side: THREE.DoubleSide, toneMapped: false })));
}

function crearQuioscoYCableado(scene) {
  const quiosco = new THREE.Group();
  quiosco.position.set(-6.8, 0.18, 7.5);
  const verde = new THREE.MeshLambertMaterial({ color: '#1b5e20' });
  const madera = new THREE.MeshLambertMaterial({ color: '#d7b879' });
  const metal = new THREE.MeshStandardMaterial({ color: '#b0bec5', roughness: 0.42, metalness: 0.62 });
  const caja = (x, y, z, sx, sy, sz, material) => {
    const pieza = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
    pieza.position.set(x, y, z); quiosco.add(pieza); return pieza;
  };
  caja(0, 1.2, 0, 2.3, 2.4, 1.7, verde);
  caja(0, 2.48, 0, 2.65, 0.14, 2.02, verde).rotation.x = -0.08;
  caja(0, 0.9, -0.9, 2.2, 0.12, 0.16, madera);
  caja(0, 1.42, -0.86, 2.15, 0.72, 0.12, madera);
  for (let i = 0; i < 4; i++) {
    const tapa = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.66), new THREE.MeshBasicMaterial({ color: ['#e91e63', '#ffeb3b', '#00bcd4', '#42a5f5'][i] }));
    tapa.position.set(-0.72 + i * 0.48, 1.7, -0.94); tapa.rotation.y = Math.PI; quiosco.add(tapa);
    caja(-0.72 + i * 0.48, 1.38, -1.0, 0.43, 0.05, 0.06, metal);
  }
  const letreroCanvas = document.createElement('canvas'); letreroCanvas.width = 512; letreroCanvas.height = 128;
  const ctx = letreroCanvas.getContext('2d'); ctx.fillStyle = '#1b5e20'; ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = '#fff8e1'; ctx.font = '900 58px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('REVISTAS', 256, 64);
  const tex = new THREE.CanvasTexture(letreroCanvas); tex.colorSpace = THREE.SRGBColorSpace;
  const rótulo = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.52), new THREE.MeshBasicMaterial({ map: tex }));
  rótulo.position.set(0, 2.06, -0.87); rótulo.rotation.y = Math.PI; quiosco.add(rótulo);
  scene.add(quiosco);

  const cable = new THREE.MeshLambertMaterial({ color: '#37474f' });
  const esquinas = [[-10.3, 7.8, -10.3], [10.3, 7.8, -10.3], [10.3, 7.8, 10.3], [-10.3, 7.8, 10.3]];
  for (let i = 0; i < esquinas.length; i++) {
    const a = new THREE.Vector3(...esquinas[i]), b = new THREE.Vector3(...esquinas[(i + 1) % esquinas.length]);
    const curva = new THREE.QuadraticBezierCurve3(a, new THREE.Vector3((a.x + b.x) / 2, 7.1, (a.z + b.z) / 2), b);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 20, 0.018, 5, false), cable));
  }
}

function crearPlantasComerciales(scene, cajas) {
  const escaparates = [], cortinas = [], listones = [], toldosTienda = [], rayasToldo = [], soportesToldo = [], letreros = [], cornisasLocales = [];
  const rotulos = Array.from({ length: 4 }, () => []);
  const nombres = ['ABARROTES', 'PAN CALIENTE', 'CAFÉ', 'FARMACIA'];
  const colores = ['#42a5f5', '#66bb6a', '#ef8a55', '#ab82c5'];
  for (const [i, c] of cajas.entries()) {
    const anchoEdificio = c.max.x - c.min.x;
    if (Math.abs((c.min.x + c.max.x) / 2) > 83 || Math.abs((c.min.z + c.max.z) / 2) > 83 || anchoEdificio < 7) continue;
    const ancho = Math.min(7.2, anchoEdificio - 1), frente = c.min.z - 0.13, color = colores[i % colores.length];
    const x = (c.min.x + c.max.x) / 2, ventanaAncho = ancho * 0.54;
    escaparates.push({ x: x + ancho * 0.19, y: 1.7, z: frente - 0.04, sx: ventanaAncho, sy: 2.25, sz: 0.12, color: '#9bd6dc' });
    cortinas.push({ x: x - ancho * 0.25, y: 1.62, z: frente - 0.08, sx: ancho * 0.42, sy: 2.15, sz: 0.16, color: '#607d8b' });
    for (let k = 0; k < 7; k++) listones.push({ x: x - ancho * 0.25, y: 0.72 + k * 0.3, z: frente - 0.17, sx: ancho * 0.42, sy: 0.045, sz: 0.045, color: '#90a4ae' });
    toldosTienda.push({ x, y: 3.08, z: frente - 0.48, sx: ancho * 0.94, sy: 0.18, sz: 0.92, color });
    for (let k = 0; k < 7; k++) rayasToldo.push({ x: x - ancho * 0.47 + (k + 0.5) * ancho * 0.94 / 7, y: 3.19, z: frente - 0.48, sx: ancho * 0.94 / 7 + 0.015, sy: 0.035, sz: 0.92, color: k % 2 ? '#fff8e7' : color });
    for (const lado of [-1, 1]) soportesToldo.push({ x: x + lado * ancho * 0.4, y: 2.88, z: frente - 0.47, sx: 0.1, sy: 0.12, sz: 0.98, rx: 0.28, color: '#607d8b' });
    letreros.push({ x, y: 3.55, z: frente - 0.13, sx: ancho * 0.68, sy: 0.42, sz: 0.16, color: '#fff3cc' });
    rotulos[i % rotulos.length].push({ x, y: 3.55, z: frente - 0.225, sx: ancho * 0.62, sy: 0.34, sz: 1 });
    cornisasLocales.push({ x, y: 3.83, z: frente - 0.17, sx: anchoEdificio + 0.55, sy: 0.18, sz: 0.32, color: '#f3d7a4' });
  }
  const caja = new THREE.BoxGeometry(1, 1, 1), blanco = new THREE.MeshLambertMaterial({ color: '#fff' });
  agregarLote(scene, caja, blanco, escaparates);
  agregarLote(scene, caja, blanco, cortinas);
  agregarLote(scene, caja, blanco, listones);
  agregarLote(scene, caja, blanco, toldosTienda);
  agregarLote(scene, caja, blanco, rayasToldo);
  agregarLote(scene, caja, blanco, soportesToldo);
  agregarLote(scene, caja, new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#4b3521', emissiveIntensity: 0.45, roughness: 0.7 }), letreros);
  agregarLote(scene, caja, blanco, cornisasLocales);
  rotulos.forEach((lista, i) => {
    if (!lista.length) return;
    const lienzo = document.createElement('canvas'); lienzo.width = 512; lienzo.height = 128;
    const ctx = lienzo.getContext('2d'); ctx.fillStyle = colores[i]; ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#fff8e7'; ctx.lineWidth = 10; ctx.strokeRect(8, 8, 496, 112);
    ctx.fillStyle = '#fff8e7'; ctx.font = '900 58px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(nombres[i], 256, 66);
    const tex = new THREE.CanvasTexture(lienzo); tex.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), lista.length);
    const dummy = new THREE.Object3D();
    lista.forEach((p, n) => { dummy.position.set(p.x, p.y, p.z); dummy.scale.set(p.sx, p.sy, 1); dummy.updateMatrix(); mesh.setMatrixAt(n, dummy.matrix); });
    mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); scene.add(mesh);
  });
}

function crearTiendita(scene, cajas) {
  const grupo = new THREE.Group();
  const x = -10.5, z = -15;
  const rojo = new THREE.MeshLambertMaterial({ color: '#d32f2f' });
  const amarillo = new THREE.MeshLambertMaterial({ color: '#fbc02d' });
  const concreto = new THREE.MeshLambertMaterial({ color: '#cfcbbe' });
  const muro = new THREE.MeshLambertMaterial({ color: '#fff7e8' });
  const cristal = new THREE.MeshStandardMaterial({ color: '#d9e9e5', roughness: 0.15, metalness: 0.12, transparent: true, opacity: 0.42 });
  const aluminio = new THREE.MeshLambertMaterial({ color: '#263238' });
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const caja = (px, py, pz, sx, sy, sz, material, colision = false) => {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x + px, py, z + pz); m.scale.set(sx, sy, sz); grupo.add(m);
    if (colision) cajas.push({ min: { x: x + px - sx / 2, y: py - sy / 2, z: z + pz - sz / 2 }, max: { x: x + px + sx / 2, y: py + sy / 2, z: z + pz + sz / 2 } });
    return m;
  };
  const piezas = [
    [-2.65, 1.8, 0, 0.7, 3.6, 4.4, muro], [2.65, 1.8, 0, 0.7, 3.6, 4.4, muro],
    [0, 3.25, 1.85, 1.3, 0.7, 0.7, muro], [0, 1.8, -1.85, 6, 3.6, 0.7, muro],
    [0, 3.8, 0, 6.7, 0.45, 4.9, muro],
  ];
  for (const [px, py, pz, sx, sy, sz, mat] of piezas) caja(px, py, pz, sx, sy, sz, mat, py < 3.6);
  // Zócalo perimetral y fachada acristalada con acceso central despejado.
  caja(0, 0.18, 0, 6.05, 0.36, 4.55, concreto);
  // Franjas institucionales también recorren laterales y fachada, no solo marquesina.
  for (const lateral of [-1, 1]) {
    caja(lateral * 3.02, 0.42, 0, 0.08, 0.35, 4.42, rojo);
    caja(lateral * 3.02, 3.56, 0, 0.08, 0.12, 4.42, amarillo);
  }
  caja(0, 0.42, 2.24, 6.0, 0.35, 0.08, rojo);
  caja(0, 3.56, 2.24, 6.0, 0.12, 0.08, amarillo);
  for (const px of [-2.58, -0.72, 0.72, 2.58]) caja(px, 1.86, 2.18, 0.12, 3.15, 0.16, aluminio);
  for (const px of [-1.65, 1.65]) caja(px, 1.82, 2.19, 1.72, 2.92, 0.055, cristal, true);
  caja(-0.36, 1.82, 2.17, 0.66, 2.88, 0.045, cristal);
  caja(0.36, 1.82, 2.17, 0.66, 2.88, 0.045, cristal);
  // Perfiles y tiradores dobles dejan claro que el acceso central es abatible.
  for (const px of [-0.72, 0, 0.72]) caja(px, 1.82, 2.25, 0.055, 2.98, 0.07, aluminio);
  const acero = new THREE.MeshStandardMaterial({ color: '#cfd8dc', roughness: 0.28, metalness: 0.8 });
  for (const px of [-0.34, 0.34]) {
    const manija = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.95, 8), acero);
    manija.position.set(x + px, 1.1, z + 2.32); grupo.add(manija);
    for (const py of [0.64, 1.56]) caja(px, py, 2.32, 0.09, 0.06, 0.1, acero);
  }
  caja(-1.65, 1.74, 2.24, 1.72, 0.12, 0.035, amarillo);
  caja(1.65, 1.74, 2.24, 1.72, 0.12, 0.035, amarillo);
  const aviso = document.createElement('canvas'); aviso.width = 384; aviso.height = 96;
  const avisoCtx = aviso.getContext('2d'); avisoCtx.fillStyle = '#263238'; avisoCtx.fillRect(0, 0, 384, 96);
  avisoCtx.fillStyle = '#fff'; avisoCtx.font = '900 40px system-ui'; avisoCtx.textAlign = 'center'; avisoCtx.textBaseline = 'middle'; avisoCtx.fillText('AUTOMÁTICA · PASE', 192, 48);
  const avisoTex = new THREE.CanvasTexture(aviso); avisoTex.colorSpace = THREE.SRGBColorSpace;
  const avisoPuerta = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.34), new THREE.MeshBasicMaterial({ map: avisoTex }));
  avisoPuerta.position.set(x, 3.16, z + 2.29); grupo.add(avisoPuerta);

  // Marquesina con frente rojo, doble franja amarilla y vuelo de 40 cm.
  caja(0, 3.32, 2.38, 6.35, 0.75, 0.95, rojo);
  caja(0, 3.72, 2.39, 6.35, 0.12, 0.98, amarillo);
  caja(0, 2.92, 2.39, 6.35, 0.12, 0.98, amarillo);
  caja(0, 3.32, 2.88, 6.35, 0.12, 0.1, amarillo);
  const lienzo = document.createElement('canvas'); lienzo.width = 1024; lienzo.height = 256;
  const g = lienzo.getContext('2d');
  g.fillStyle = '#d32f2f'; g.fillRect(0, 0, 1024, 256);
  g.fillStyle = '#fbc02d'; g.fillRect(0, 0, 1024, 22); g.fillRect(0, 234, 1024, 22);
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '900 190px system-ui, sans-serif'; g.fillText('OXXO', 512, 134);
  const textura = new THREE.CanvasTexture(lienzo); textura.colorSpace = THREE.SRGBColorSpace;
  const letrero = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 0.95), new THREE.MeshStandardMaterial({ map: textura, emissive: '#ffffff', emissiveMap: textura, emissiveIntensity: 0.85, toneMapped: false, roughness: 0.55 }));
  letrero.position.set(x, 3.32, z + 2.91); grupo.add(letrero);
  const tapete = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.045, 1), new THREE.MeshLambertMaterial({ color: '#212121' }));
  tapete.position.set(x, 0.095, z + 3.15); grupo.add(tapete);
  const bordeTapete = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.025, 1.12), amarillo);
  bordeTapete.position.set(x, 0.067, z + 3.15); grupo.add(bordeTapete);
  // Anaqueles y mercancía de color visibles tras el vidrio.
  const anaquel = new THREE.MeshLambertMaterial({ color: '#d5a15f' });
  const snacks = ['#ef5350', '#fbc02d', '#66bb6a', '#42a5f5'].map(color => new THREE.MeshLambertMaterial({ color }));
  for (const sx of [-1.92, 1.92]) {
    caja(sx, 1.2, -1.1, 0.12, 2.1, 0.16, anaquel);
    for (let nivel = 0; nivel < 3; nivel++) {
      caja(sx, 0.62 + nivel * 0.58, -1.06, 0.7, 0.1, 0.7, anaquel);
      for (let n = 0; n < 3; n++) caja(sx - 0.23 + n * 0.23, 0.82 + nivel * 0.58, -1.04, 0.15, 0.3, 0.17, snacks[(nivel + n) % snacks.length]);
    }
  }
  // Caja de cobro en L, terminal y cafetera ocupan el centro del fondo.
  const blancoMostrador = new THREE.MeshLambertMaterial({ color: '#f5f2ec' });
  const encendido = new THREE.MeshBasicMaterial({ color: '#76ff8b', toneMapped: false });
  caja(0, 0.49, -1.2, 2.2, 0.95, 0.85, blancoMostrador);
  caja(0, 0.12, -1.2, 2.2, 0.2, 0.86, rojo);
  caja(-0.72, 0.49, -0.76, 0.72, 0.95, 0.12, blancoMostrador);
  caja(-0.48, 1.04, -1.14, 0.42, 0.12, 0.3, aluminio);
  caja(-0.48, 1.2, -1.12, 0.3, 0.2, 0.045, encendido);
  const maquinaCafe = new THREE.MeshStandardMaterial({ color: '#212121', roughness: 0.58, metalness: 0.18 });
  caja(0.7, 1.0, -1.38, 0.45, 0.7, 0.4, maquinaCafe);
  caja(0.7, 1.16, -1.17, 0.31, 0.16, 0.035, rojo);
  caja(0.7, 0.84, -1.17, 0.22, 0.08, 0.04, acero);
  const vasoCafe = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.055, 0.18, 8), new THREE.MeshLambertMaterial({ color: '#fff7e8' }));
  vasoCafe.position.set(x + 1.04, 0.92, z - 1.14); grupo.add(vasoCafe);
  const luzInterior = new THREE.PointLight('#fff4d0', 2.5, 9, 2);
  luzInterior.position.set(x, 3.05, z - 0.4); grupo.add(luzInterior);
  const plafon = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.75), new THREE.MeshBasicMaterial({ color: '#fff3e0' }));
  plafon.position.set(x, 3.48, z - 0.6); grupo.add(plafon);
  const panelLuz = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.52), new THREE.MeshBasicMaterial({ color: '#fff3e0', toneMapped: false }));
  for (const px of [-0.85, 0.85]) { const panel = panelLuz.clone(); panel.position.set(x + px, 3.43, z - 0.15); panel.rotation.x = Math.PI / 2; grupo.add(panel); }
  caja(0, 4.15, -2.35, 6.5, 0.25, 0.18, concreto);
  caja(0, 4.15, 2.35, 6.5, 0.25, 0.18, concreto);
  caja(-3.15, 4.15, 0, 0.18, 0.25, 4.55, concreto);
  caja(3.15, 4.15, 0, 0.18, 0.25, 4.55, concreto);
  const aceroVent = new THREE.MeshStandardMaterial({ color: '#78909c', roughness: 0.68, metalness: 0.35 });
  const negroVent = new THREE.MeshStandardMaterial({ color: '#263238', roughness: 0.8 });
  caja(1.35, 4.43, -0.45, 1.1, 0.7, 0.8, aceroVent);
  const ventilador = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.055, 12), negroVent);
  ventilador.position.set(x + 1.35, 4.8, z - 0.45); grupo.add(ventilador);
  caja(1.35, 4.76, -0.45, 0.06, 0.08, 0.56, aluminio);
  for (let i = 0; i < 5; i++) caja(0.96 + i * 0.19, 4.43, -0.87, 0.055, 0.5, 0.045, aluminio);

  const rampa = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 0.95), concreto);
  rampa.position.set(x, 0.055, z + 3.25); rampa.rotation.x = -0.08; grupo.add(rampa);
  const blancoPaso = new THREE.MeshLambertMaterial({ color: '#ffffff' });
  for (let i = 0; i < 5; i++) caja(0, 0.075, 4.05 + i * 0.82, 5.8, 0.07, 0.6, blancoPaso);
  const amarilloMetal = new THREE.MeshStandardMaterial({ color: '#fbc02d', roughness: 0.45, metalness: 0.12 });
  const negroReflector = new THREE.MeshStandardMaterial({ color: '#212121', roughness: 0.55 });
  for (const bx of [-1.42, 1.42]) {
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.85, 10), amarilloMetal);
    poste.position.set(x + bx, 0.425, z + 3.05); grupo.add(poste);
    caja(bx, 0.42, 3.05, 0.145, 0.16, 0.145, aluminio);
    caja(bx, 0.66, 3.05, 0.15, 0.13, 0.15, negroReflector);
  }

  // Hielera exterior con tapa azul inclinada, tirador y rótulo legible.
  const hielera = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.1, 0.82), new THREE.MeshStandardMaterial({ color: '#f5f5f5', roughness: 0.32, metalness: 0.16 }));
  hielera.position.set(x - 3.65, 0.72, z + 0.65); grupo.add(hielera);
  const tapaHielo = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.14, 0.88), new THREE.MeshStandardMaterial({ color: '#1976d2', roughness: 0.3, metalness: 0.12 }));
  tapaHielo.position.set(x - 3.65, 1.32, z + 0.65); tapaHielo.rotation.z = -Math.PI / 12; grupo.add(tapaHielo);
  const asaHielo = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 6, 12, Math.PI), acero);
  asaHielo.position.set(x - 3.65, 1.18, z + 1.08); grupo.add(asaHielo);
  const hieloCanvas = document.createElement('canvas'); hieloCanvas.width = 384; hieloCanvas.height = 96;
  const hieloCtx = hieloCanvas.getContext('2d'); hieloCtx.fillStyle = '#1976d2'; hieloCtx.fillRect(0, 0, 384, 96);
  hieloCtx.fillStyle = '#fff'; hieloCtx.font = '900 46px system-ui'; hieloCtx.textAlign = 'center'; hieloCtx.textBaseline = 'middle'; hieloCtx.fillText('HIELO EN BOLSA', 192, 48);
  const hieloTex = new THREE.CanvasTexture(hieloCanvas); hieloTex.colorSpace = THREE.SRGBColorSpace;
  const frenteHielo = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.28), new THREE.MeshBasicMaterial({ map: hieloTex }));
  frenteHielo.position.set(x - 3.65, 0.76, z + 1.068); grupo.add(frenteHielo);

  // ATM exterior en el paño derecho: marco verde, pantalla y teclado.
  const atm = new THREE.Group(); atm.position.set(x + 2.12, 1.72, z + 2.18); grupo.add(atm);
  const grafito = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.22, 0.2), new THREE.MeshLambertMaterial({ color: '#212121' })); atm.add(grafito);
  const marcoAtm = new THREE.Mesh(new THREE.BoxGeometry(0.61, 1.08, 0.035), new THREE.MeshBasicMaterial({ color: '#00e676', toneMapped: false })); marcoAtm.position.z = 0.118; atm.add(marcoAtm);
  const panelAtm = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.98, 0.045), new THREE.MeshLambertMaterial({ color: '#263238' })); panelAtm.position.z = 0.143; atm.add(panelAtm);
  const pantallaAtm = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.26, 0.025), new THREE.MeshBasicMaterial({ color: '#64ddff', toneMapped: false })); pantallaAtm.position.set(0, 0.3, 0.18); atm.add(pantallaAtm);
  const tecladoAtm = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.23, 0.025), new THREE.MeshStandardMaterial({ color: '#cfd8dc', roughness: 0.4, metalness: 0.72 })); tecladoAtm.position.set(0, -0.08, 0.18); atm.add(tecladoAtm);
  for (let i = 0; i < 9; i++) {
    const tecla = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.035, 0.012), aluminio);
    tecla.position.set(-0.09 + (i % 3) * 0.09, -0.03 - Math.floor(i / 3) * 0.065, 0.2); atm.add(tecla);
  }
  const rotuloAtm = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.18), new THREE.MeshBasicMaterial({ color: '#00e676', toneMapped: false }));
  const atmCanvas = document.createElement('canvas'); atmCanvas.width = 384; atmCanvas.height = 128;
  const atmCtx = atmCanvas.getContext('2d'); atmCtx.fillStyle = '#00e676'; atmCtx.fillRect(0, 0, 384, 128);
  atmCtx.fillStyle = '#10251a'; atmCtx.font = '900 54px system-ui'; atmCtx.textAlign = 'center'; atmCtx.textBaseline = 'middle'; atmCtx.fillText('ATM 24 HRS', 192, 64);
  const atmTex = new THREE.CanvasTexture(atmCanvas); atmTex.colorSpace = THREE.SRGBColorSpace;
  rotuloAtm.material = new THREE.MeshBasicMaterial({ map: atmTex });
  rotuloAtm.position.set(0, -0.43, 0.18); atm.add(rotuloAtm);

  // Topes amarillos a nivel de la banqueta, con bandas negras diagonales.
  const topeMat = new THREE.MeshLambertMaterial({ color: '#fbc02d' });
  const bandaMat = new THREE.MeshLambertMaterial({ color: '#212121' });
  for (const bx of [-1.45, 1.45]) {
    const tope = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.14, 0.18), topeMat); tope.position.set(x + bx, 0.1, z + 4.38); grupo.add(tope);
    for (let n = 0; n < 5; n++) {
      const banda = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.145, 0.19), bandaMat);
      banda.position.set(x + bx - 0.72 + n * 0.36, 0.1, z + 4.38); banda.rotation.y = Math.PI / 6; grupo.add(banda);
    }
  }

  const totem = new THREE.Group(); totem.position.set(-13.8, 0, -12.5);
  const fuste = new THREE.Mesh(new THREE.BoxGeometry(0.42, 3.35, 0.34), amarillo); fuste.position.y = 1.675; totem.add(fuste);
  const baseTotem = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.72), concreto); baseTotem.position.y = 0.11; totem.add(baseTotem);
  const cabeza = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.25, 0.36), new THREE.MeshStandardMaterial({ color: '#d32f2f', emissive: '#d32f2f', emissiveIntensity: 0.6, roughness: 0.55 }));
  cabeza.position.y = 4.12; totem.add(cabeza);
  const logoCanvas = document.createElement('canvas'); logoCanvas.width = 512; logoCanvas.height = 256;
  const logoCtx = logoCanvas.getContext('2d'); logoCtx.fillStyle = '#d32f2f'; logoCtx.fillRect(0, 0, 512, 256);
  logoCtx.fillStyle = '#fbc02d'; logoCtx.fillRect(0, 0, 512, 18); logoCtx.fillRect(0, 238, 512, 18);
  logoCtx.fillStyle = '#fff'; logoCtx.font = '900 190px system-ui,sans-serif'; logoCtx.textAlign = 'center'; logoCtx.textBaseline = 'middle'; logoCtx.fillText('OXXO', 256, 132);
  const logoTex = new THREE.CanvasTexture(logoCanvas); logoTex.colorSpace = THREE.SRGBColorSpace;
  const logoMat = new THREE.MeshStandardMaterial({ map: logoTex, emissive: '#fff0c2', emissiveMap: logoTex, emissiveIntensity: 0.6, roughness: 0.5 });
  for (const lado of [-1, 1]) {
    const marca = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.58), logoMat); marca.position.set(0, 4.23, lado * 0.187); marca.rotation.y = lado < 0 ? Math.PI : 0; totem.add(marca);
  }
  const horasCanvas = document.createElement('canvas'); horasCanvas.width = 256; horasCanvas.height = 96;
  const horasCtx = horasCanvas.getContext('2d'); horasCtx.fillStyle = '#d32f2f'; horasCtx.fillRect(0, 0, 256, 96);
  horasCtx.fillStyle = '#fff'; horasCtx.font = '900 48px system-ui,sans-serif'; horasCtx.textAlign = 'center'; horasCtx.textBaseline = 'middle'; horasCtx.fillText('24 HORAS', 128, 50);
  const horasTex = new THREE.CanvasTexture(horasCanvas); horasTex.colorSpace = THREE.SRGBColorSpace;
  const horasMat = new THREE.MeshStandardMaterial({ map: horasTex, emissive: '#ffffff', emissiveMap: horasTex, emissiveIntensity: 0.6 });
  const horasBase = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.38, 0.38), amarillo); horasBase.position.y = 3.35; totem.add(horasBase);
  for (const lado of [-1, 1]) {
    const rotulo = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.29), horasMat);
    rotulo.position.set(0, 3.35, lado * 0.195); rotulo.rotation.y = lado < 0 ? Math.PI : 0; totem.add(rotulo);
  }
  scene.add(totem);
  scene.add(grupo);
  return { x, y: 1, z: z + 3.2 };
}

function crearAccesoriosCiudad(scene, tinacos) {
  const lambert = (color) => new THREE.MeshLambertMaterial({ color });
  const metal = new THREE.MeshStandardMaterial({ color: '#b0bec5', roughness: 0.32, metalness: 0.72 });
  const barra = (grupo, a, b, radio, material, lados = 8) => {
    const inicio = new THREE.Vector3(...a), fin = new THREE.Vector3(...b), delta = fin.clone().sub(inicio);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(radio, radio, delta.length(), lados), material);
    m.position.copy(inicio.add(fin).multiplyScalar(0.5)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); grupo.add(m); return m;
  };

  // Carrito de aguas y comal en el borde de la plaza, fuera del eje de llegada.
  const puesto = new THREE.Group(); puesto.position.set(7.5, 0, -6.8); scene.add(puesto);
  const acero = new THREE.MeshStandardMaterial({ color: '#b0bec5', roughness: 0.3, metalness: 0.78 });
  const cajaCarrito = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.95, 1.05), acero); cajaCarrito.position.set(0, 1.02, 0); puesto.add(cajaCarrito);
  const faldon = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.16, 1.08), lambert('#455a64')); faldon.position.set(0, 0.49, 0); puesto.add(faldon);
  for (const x of [-0.62, 0.62]) {
    const rueda = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 6, 16), metal); rueda.position.set(x, 0.43, 0.58); rueda.rotation.y = Math.PI / 2; puesto.add(rueda);
    for (let r = 0; r < 8; r++) {
      const a = r * Math.PI / 4;
      barra(puesto, [x, 0.43, 0.58], [x, 0.43 + Math.cos(a) * 0.34, 0.58 + Math.sin(a) * 0.34], 0.012, metal, 4);
    }
  }
  barra(puesto, [-0.62, 0.43, 0.58], [0.62, 0.43, 0.58], 0.035, metal, 6);
  for (const [x, z] of [[-0.8, -0.42], [0.8, -0.42], [-0.8, 0.42], [0.8, 0.42]]) barra(puesto, [x, 1.38, z], [x, 2.45, z], 0.035, metal, 8);
  const toldo = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 1.55), lambert('#ffffff')); toldo.position.set(0, 2.43, 0); puesto.add(toldo);
  const rojos = [];
  for (let i = 0; i < 7; i++) rojos.push({ x: -1.1 + i * 0.37, y: 2.51, z: 0, sx: 0.19, sy: 0.025, sz: 1.58, color: i % 2 ? '#ffffff' : '#d32f2f' });
  agregarLote(puesto, new THREE.BoxGeometry(1, 1, 1), lambert('#ffffff'), rojos);
  const comal = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.55, 0.08, 16), metal); comal.position.set(-0.38, 1.56, 0.02); puesto.add(comal);
  const vitroleros = ['#fffde7', '#b71c1c', '#76ff03'];
  vitroleros.forEach((color, i) => {
    const vaso = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.62, 10), new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.82, roughness: 0.22 }));
    vaso.position.set(-0.65 + i * 0.62, 1.66, -0.33); puesto.add(vaso);
    const tapa = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 10), metal); tapa.position.set(-0.65 + i * 0.62, 2.0, -0.33); puesto.add(tapa);
    barra(puesto, [-0.65 + i * 0.62, 1.77, -0.33], [-0.65 + i * 0.62, 2.12, -0.26], 0.018, metal, 5);
  });
  const vaporMat = new THREE.MeshBasicMaterial({ color: '#fff8e1', transparent: true, opacity: 0.42, depthWrite: false });
  for (let i = 0; i < 3; i++) {
    const vapor = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), vaporMat); vapor.position.set(-0.42 + i * 0.14, 1.84 + i * 0.18, 0.03); vapor.scale.set(1, 1.6, 1); puesto.add(vapor);
  }
  const bancoRojo = lambert('#d32f2f');
  for (let i = 0; i < 2; i++) {
    const banco = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.38, 8), bancoRojo); banco.position.set(1.45, 0.38 + i * 0.4, -0.2); puesto.add(banco);
    const asiento = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 8), bancoRojo); asiento.position.set(1.45, 0.59 + i * 0.4, -0.2); puesto.add(asiento);
  }

  // Dos semáforos en esquinas opuestas con señales peatonales visibles.
  const amarillo = lambert('#fbc02d'), negro = lambert('#212121');
  for (const [x, z, lado] of [[13, -13, -1], [-13, 13, 1]]) {
    const sem = new THREE.Group(); sem.position.set(x, 0, z); scene.add(sem);
    barra(sem, [0, 0.12, 0], [0, 4.35, 0], 0.09, amarillo, 10);
    barra(sem, [0, 4.2, 0], [lado * 3.1, 4.2, 0], 0.075, amarillo, 10);
    const cajaLuz = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.05, 0.34), negro); cajaLuz.position.set(lado * 3.0, 3.55, 0); sem.add(cajaLuz);
    ['#ff1744', '#ffab00', '#00e676'].forEach((color, i) => {
      const visera = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.11, 10), negro); visera.position.set(lado * 3.0, 3.94 - i * 0.36, 0.21); visera.rotation.x = Math.PI; sem.add(visera);
      const luz = new THREE.Mesh(new THREE.CircleGeometry(0.12, 10), new THREE.MeshBasicMaterial({ color, toneMapped: false })); luz.position.set(lado * 3.0, 3.94 - i * 0.36, 0.225); sem.add(luz);
    });
    const alto = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.09, 8), new THREE.MeshLambertMaterial({ color: '#d50000' })); alto.position.set(0.58, 1.72, 0); alto.rotation.x = Math.PI / 2; sem.add(alto);
    const altoCanvas = document.createElement('canvas'); altoCanvas.width = 256; altoCanvas.height = 128;
    const ag = altoCanvas.getContext('2d'); ag.fillStyle = '#d50000'; ag.beginPath(); ag.roundRect(20, 8, 216, 112, 26); ag.fill(); ag.strokeStyle = '#fff'; ag.lineWidth = 8; ag.stroke();
    ag.fillStyle = '#fff'; ag.font = '900 58px system-ui'; ag.textAlign = 'center'; ag.textBaseline = 'middle'; ag.fillText('ALTO', 128, 66);
    const altoTex = new THREE.CanvasTexture(altoCanvas); altoTex.colorSpace = THREE.SRGBColorSpace;
    const altoTexto = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.34), new THREE.MeshBasicMaterial({ map: altoTex })); altoTexto.position.set(0.58, 1.72, 0.055); sem.add(altoTexto);
    const peaton = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.72, 0.08), lambert('#1976d2')); peaton.position.set(-0.5, 2.25, 0); sem.add(peaton);
    const pasoCanvas = document.createElement('canvas'); pasoCanvas.width = 128; pasoCanvas.height = 192;
    const pg = pasoCanvas.getContext('2d'); pg.fillStyle = '#ffffff'; pg.beginPath(); pg.arc(64, 35, 19, 0, Math.PI * 2); pg.fill();
    pg.fillRect(55, 60, 18, 58); pg.fillRect(30, 70, 26, 12); pg.fillRect(72, 70, 28, 12); pg.fillRect(45, 112, 14, 60); pg.fillRect(68, 112, 14, 60);
    const pasoTex = new THREE.CanvasTexture(pasoCanvas); pasoTex.colorSpace = THREE.SRGBColorSpace;
    const simbolo = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.58), new THREE.MeshBasicMaterial({ map: pasoTex, transparent: true })); simbolo.position.set(-0.5, 2.25, 0.05); sem.add(simbolo);
  }

  // Botes de separación en parabús y tienda; hidrante junto al cruce.
  for (const [x, z, color, rotulo] of [[9, -14, '#388e3c', 'ORG'], [10.1, -14, '#1976d2', 'INORG'], [-7.2, -10.2, '#388e3c', 'ORG'], [-6.1, -10.2, '#1976d2', 'INORG']]) {
    const bote = new THREE.Group(); bote.position.set(x, 0, z); scene.add(bote);
    const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.82, 10), lambert(color)); cuerpo.position.y = 0.48; bote.add(cuerpo);
    const tapa = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.1, 10), negro); tapa.position.y = 0.94; bote.add(tapa);
    const etiqueta = document.createElement('canvas'); etiqueta.width = 320; etiqueta.height = 96;
    const eg = etiqueta.getContext('2d'); eg.fillStyle = '#ffffff'; eg.fillRect(0, 0, 320, 96); eg.fillStyle = color;
    eg.font = '900 52px system-ui'; eg.textAlign = 'center'; eg.textBaseline = 'middle'; eg.fillText(rotulo === 'ORG' ? 'ORGÁNICO' : 'INORGÁNICO', 160, 48);
    const etiquetaTex = new THREE.CanvasTexture(etiqueta); etiquetaTex.colorSpace = THREE.SRGBColorSpace;
    const placa = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.13), new THREE.MeshBasicMaterial({ map: etiquetaTex })); placa.position.set(0, 0.52, 0.345); bote.add(placa);
  }
  const hidrante = new THREE.Group(); hidrante.position.set(-13.2, 0.16, -10.2); scene.add(hidrante);
  const rojoFuego = lambert('#d50000'), laton = new THREE.MeshStandardMaterial({ color: '#ffd600', roughness: 0.36, metalness: 0.65 });
  const baseH = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.29, 0.12, 10), rojoFuego); baseH.position.y = 0.06; hidrante.add(baseH);
  const cuerpoH = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.72, 10), rojoFuego); cuerpoH.position.y = 0.48; hidrante.add(cuerpoH);
  const bonete = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 6), rojoFuego); bonete.scale.y = 0.65; bonete.position.y = 0.88; hidrante.add(bonete);
  for (const lado of [-1, 1]) {
    const boca = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.2, 8), laton); boca.rotation.z = Math.PI / 2; boca.position.set(lado * 0.22, 0.55, 0); hidrante.add(boca);
    const tapon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 8), laton); tapon.rotation.z = Math.PI / 2; tapon.position.set(lado * 0.34, 0.55, 0); hidrante.add(tapon);
  }

  // Tinacos con tapa y nervaduras; seis azoteas suman tanque de gas y caseta.
  const tinacoMat = new THREE.MeshLambertMaterial({ color: '#212121' });
  const tapaTinaco = new THREE.InstancedMesh(new THREE.SphereGeometry(0.58, 10, 5), tinacoMat, Math.min(6, tinacos.length));
  const nervadura = new THREE.InstancedMesh(new THREE.TorusGeometry(0.56, 0.025, 4, 10), lambert('#424242'), Math.min(6, tinacos.length) * 3);
  const tanqueGas = [], casetas = [], puertas = [], rejillas = [];
  tinacos.slice(0, 6).forEach(([x, y, z], i) => {
    tapaTinaco.setMatrixAt(i, new THREE.Matrix4().makeScale(1, 0.22, 1).setPosition(x, y + 1.8, z));
    for (let anillo = 0; anillo < 3; anillo++) {
      const o = new THREE.Object3D(); o.position.set(x, y + 0.35 + anillo * 0.42, z); o.rotation.x = Math.PI / 2; o.updateMatrix(); nervadura.setMatrixAt(i * 3 + anillo, o.matrix);
    }
    if (i < 4) {
      tanqueGas.push({ x: x + 1.35, y: y + 0.48, z, sx: 1.25, sy: 0.76, sz: 0.76, color: '#f5f5f5', rz: Math.PI / 2 });
      casetas.push({ x: x - 1.3, y: y + 0.9, z, sx: 1.5, sy: 1.8, sz: 1.5, color: '#d7ccc8' });
      puertas.push({ x: x - 1.3, y: y + 0.7, z: z + 0.76, sx: 0.68, sy: 1.25, sz: 0.05, color: '#78909c' });
      for (let r = 0; r < 4; r++) rejillas.push({ x: x - 1.3, y: y + 1.2 + r * 0.13, z: z + 0.8, sx: 0.48, sy: 0.035, sz: 0.04, color: '#455a64' });
    }
  });
  scene.add(tapaTinaco, nervadura);
  agregarLote(scene, new THREE.CylinderGeometry(0.38, 0.38, 1.25, 10), new THREE.MeshStandardMaterial({ color: '#f5f5f5', roughness: 0.4, metalness: 0.2 }), tanqueGas);
  agregarLote(scene, new THREE.BoxGeometry(1, 1, 1), lambert('#ffffff'), casetas);
  agregarLote(scene, new THREE.BoxGeometry(1, 1, 1), metal, puertas);
  agregarLote(scene, new THREE.BoxGeometry(1, 1, 1), lambert('#455a64'), rejillas);
}

export function crearMundo(escena) {
  const grupo = new THREE.Group();
  const scene = new Proxy(escena, { get: (objeto, clave) => clave === 'add' ? (...objetos) => grupo.add(...objetos) : Reflect.get(objeto, clave, objeto) });
  const r = azar(1337);
  scene.background = HORIZONTE;
  scene.fog = new THREE.Fog('#efb08b', 85, 450);
  scene.add(new THREE.HemisphereLight('#ffe0b2', '#8c5946', 0.85));
  const sol = new THREE.DirectionalLight(0xffe4b5, 1.45);
  sol.position.set(45, 55, -70);
  const domo = cielo();
  const nubes = crearNubes(scene);
  scene.add(sol, domo, crearSol(), suelo());
  crearCordillera(scene);
  crearSkyline(scene, 197, 0);
  crearSkyline(scene, 249, 1);
  crearMar(scene);

  const cajas = [], tinacos = [], cactus = [], churus = [];
  let tiendita;
  const arboles = [], jardineras = [], tierraJardineras = [], botes = [], fuentes = [], bancas = [], faroles = [], puestos = [], coches = [];
  const balcones = [], toldos = [], cornisas = [], antepechos = [], aires = [], antenas = [], escaleras = [];
  const zocalos = [], molduras = [], aticos = [], cornisasBajas = [], balconMénsulas = [], balconBarrotes = [], balconPasamanos = [], toldosCentro = [], toldosFaldon = [], remates = [];
  const cruces = [], bordillos = [], banderines = [], letreros = [], rejillas = [], tapasRegistro = [], surcosRegistro = [];
  const vacio = (i, j) => (i === 0 && j === 0) || ((i * 7 + j * 13) % 11 === 0 && Math.abs(i) + Math.abs(j) > 2) || (i === -3 && j === -2);

  for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) {
    const cx = i * CUADRA, cz = j * CUADRA;
    if (vacio(i, j)) { // plaza central y pequeño parque de barrio
      if ((i === 0 && j === 0) || (i === -3 && j === -2)) {
        const parque = i === 0 && j === 0;
        const n = parque ? 12 : 8;
        for (let k = 0; k < n; k++) {
          const a = k * Math.PI * 2 / n, rad = parque ? 8.2 : 7.4;
          const tx = cx + Math.cos(a) * rad, tz = cz + Math.sin(a) * rad;
          arboles.push([tx, 0, tz, k % 3]);
          jardineras.push({ x: tx, y: 0.175, z: tz, sx: 1.8, sy: 0.35, sz: 1.8, color: '#cfcbbe' });
          tierraJardineras.push({ x: tx, y: 0.36, z: tz, sx: 1.52, sy: 0.07, sz: 1.52, color: '#3e2723' });
          if (k % 3 !== 0) jardineras.push({ x: cx + Math.cos(a) * 10.2, y: 0.38, z: cz + Math.sin(a) * 10.2, sx: 2.8, sy: 0.76, sz: 1.8, rotY: -a, color: ['#d88e69', '#6f9c7c', '#d9b76d'][k % 3] });
        }
        if (parque) {
          // Fuente baja poligonal con pedestal, agua y surtidor; sin luces.
          fuentes.push([cx, cz]);
        }
        for (let k = 0; k < (parque ? 6 : 4); k++) {
          const a = k * Math.PI * 2 / (parque ? 6 : 4), rad = parque ? 5.8 : 5.3;
          bancas.push({ x: cx + Math.cos(a) * rad, y: 0.55, z: cz + Math.sin(a) * rad, sx: 2.6, sy: 0.18, sz: 0.68, rotY: -a, color: '#865b46' });
          botes.push({ x: cx + Math.cos(a) * (rad + 1.8), y: 0.45, z: cz + Math.sin(a) * (rad + 1.8), color: k % 2 ? '#1565c0' : '#2e7d32' });
        }
      }
      const n = i === 0 && j === 0 ? 6 : 3;
      for (let k = 0; k < n && (i !== 0 || j !== 0) && !(i === -3 && j === -2); k++) {
        const a = (k / n) * Math.PI * 2 + r();
        const rad = i === 0 && j === 0 ? 7 + r() * 2 : r() * 7;
        cactus.push([cx + Math.cos(a) * rad, cz + Math.sin(a) * rad, 1.6 + r() * 1.6]);
      }
      continue;
    }
    const partes = r() < 0.35 ? 2 : 1;
    for (let p = 0; p < partes; p++) {
      const w = partes === 1 ? 10 + r() * 7 : 7 + r() * 2;
      const d = 10 + r() * 7;
      const barrio = zonaBarrio(i, j);
      const h = alturaBarrio(barrio, r());
      const ox = partes === 1 ? 0 : (p === 0 ? -4.6 : 4.6);
      const x = cx + ox, z = cz;
      const paleta = barrio === 'centro' ? ['#d96b43', '#e6a15c', '#7fa382', '#5c82a6', '#f2deb8', '#d97b93'] : ['#e06e58', '#f2c568', '#6eaaa0', '#f09aaa', '#8c79bb', '#f28e45', '#88b86c', '#f7e7c8'];
      const color = new THREE.Color(paleta[Math.floor(r() * paleta.length)]);
      cajas.push({ min: { x: x - w / 2, y: 0, z: z - d / 2 }, max: { x: x + w / 2, y: h, z: z + d / 2 }, color, barrio });
      if (barrio === 'centro' && h > 12) {
        zocalos.push({ x, y: 1.9, z, sx: w + 0.3, sy: 3.8, sz: d + 0.3, color: '#765447' });
        molduras.push({ x, y: 3.92, z, sx: w + 0.72, sy: 0.24, sz: d + 0.72, color: '#fff3d8' });
        aticos.push({ x, y: h - 1.2, z, sx: Math.max(3, w - 1.0), sy: 2.2, sz: Math.max(3, d - 1.0), color: ['#fff1d6', '#f5d7ba', '#d6e4d4'][Math.floor(r() * 3)] });
        cornisas.push({ x, y: h - 0.32, z, sx: w + 1.2, sy: 0.48, sz: d + 1.2, color: '#f5ebd7' });
        cornisasBajas.push({ x, y: h - 0.64, z, sx: w + 0.9, sy: 0.18, sz: d + 0.9, color: '#e0d3be' });
        if (h > 25) for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
          remates.push({ x: x + sx * (w / 2 - 0.25), y: h + 1.35, z: z + sz * (d / 2 - 0.25), sx: 0.58, sy: 0.58, sz: 0.58, color: '#fff8e1' });
          remates.push({ x: x + sx * (w / 2 - 0.25), y: h + 1.9, z: z + sz * (d / 2 - 0.25), sx: 0.76, sy: 0.76, sz: 0.76, color: '#fff8e1', esfera: true });
        }
      }
      if (Math.abs(i) <= 3 && Math.abs(j) <= 3 && h > 10) {
        const altoAntepecho = 1.05, yAntepecho = h + altoAntepecho / 2;
        antepechos.push({ x, y: yAntepecho, z: z - d / 2, sx: w, sy: altoAntepecho, sz: 0.22, color: '#e9d8bc' });
        antepechos.push({ x, y: yAntepecho, z: z + d / 2, sx: w, sy: altoAntepecho, sz: 0.22, color: '#e9d8bc' });
        for (const lado of [-1, 1]) antepechos.push({ x: x + lado * w / 2, y: yAntepecho, z, sx: 0.22, sy: altoAntepecho, sz: d, color: '#e9d8bc' });
      }
      if (r() < 0.6) tinacos.push([x + (r() - 0.5) * (w - 3), h, z + (r() - 0.5) * (d - 3)]);
      const frente = (p) => {
        if (barrio === 'centro' && h > 12 && w > 7) {
          const bx = x + (p ? 1 : -1) * Math.min(1.8, w * 0.18), by = 5.2 + (p % 2) * 4.1;
          for (const ladoFachada of [-1, 1]) {
            const bz = z + ladoFachada * (d / 2 + 0.48), frente = z + ladoFachada * (d / 2 + 0.7);
            balcones.push({ x: bx, y: by, z: bz, sx: 2.5, sy: 0.22, sz: 1.05, color: '#cfcbbe' });
            for (const dx of [-0.72, 0.72]) balconMénsulas.push({ x: bx + dx, y: by - 0.34, z: bz - ladoFachada * 0.2, sx: 0.2, sy: 0.55, sz: 0.76, color: '#8d6e63', rz: dx < 0 ? -0.3 : 0.3 });
            balconPasamanos.push({ x: bx, y: by + 0.58, z: bz + ladoFachada * 0.47, sx: 2.55, sy: 0.1, sz: 0.1, color: '#212121' });
            balconPasamanos.push({ x: bx - 1.2, y: by + 0.5, z: bz, sx: 0.1, sy: 0.9, sz: 0.95, color: '#212121' });
            balconPasamanos.push({ x: bx + 1.2, y: by + 0.5, z: bz, sx: 0.1, sy: 0.9, sz: 0.95, color: '#212121' });
            for (let bar = 0; bar < 9; bar++) balconBarrotes.push({ x: bx - 1.12 + bar * 0.28, y: by + 0.45, z: bz + ladoFachada * 0.47, sx: 0.035, sy: 0.78, sz: 0.035, color: '#212121' });
            const lona = ['#d32f2f', '#fbc02d', '#00897b'][Math.floor(r() * 3)];
            toldosCentro.push({ x: bx, y: 3.5, z: frente, sx: 3.1, sy: 0.2, sz: 1.25, rx: ladoFachada * 0.08, color: lona });
            for (let ray = 0; ray < 7; ray++) toldosCentro.push({ x: bx - 1.45 + ray * 0.48, y: 3.62, z: frente, sx: 0.25, sy: 0.035, sz: 1.25, rx: ladoFachada * 0.08, color: ray % 2 ? '#ffffff' : lona });
            for (let fest = 0; fest < 7; fest++) toldosFaldon.push({ x: bx - 1.45 + fest * 0.48, y: 3.36, z: z + ladoFachada * (d / 2 + 1.26), sx: 0.3, sy: 0.22, sz: 0.12, color: lona });
          }
        }
        if (h < 27 && r() < 0.62) {
          const lado = r() < 0.5 ? -1 : 1, bx = x + lado * (w / 2 + 0.42), bz = z;
          const by = 4.4 + r() * Math.max(0, Math.min(10, h - 12)), largo = Math.min(8, d - 3);
          balcones.push({ x: bx, y: by, z: bz, sx: 0.9, sy: 0.18, sz: largo, rotY: Math.PI / 2, color: '#d8b98c' });
          balcones.push({ x: bx + lado * 0.44, y: by + 0.58, z: bz, sx: 0.12, sy: 0.95, sz: largo, rotY: Math.PI / 2, color: '#f3d7a4' });
          for (const extremo of [-1, 1]) balcones.push({ x: bx, y: by + 0.58, z: bz + extremo * largo * 0.48, sx: 0.9, sy: 0.95, sz: 0.12, color: '#f3d7a4' });
        }
        if (h < 25 && r() < 0.52) toldos.push({ x, y: 3.4, z: z - d / 2 - 0.9, sx: Math.min(w, 8), sy: 0.32, sz: 2.2, rotY: 0, color: ['#ec7865', '#f2c35e', '#63aa9b', '#a78bc1'][p % 4] });
        if (h < 34 && r() < 0.42) aires.push({ x: x + (r() - 0.5) * (w - 2), y: 2.1 + r() * Math.min(15, h - 3), z: z - d / 2 - 0.28, sx: 1.15, sy: 0.72, sz: 0.62, color: '#ddd2c1' });
        if (r() < 0.55) cornisas.push({ x, y: h - 0.25, z, sx: w + 0.8, sy: 0.5, sz: d + 0.8, color: '#f3d7a4' });
        if (h > 29 && r() < 0.28) {
          antenas.push({ x: x + (r() - 0.5) * w * 0.5, y: h + 2.2, z: z + (r() - 0.5) * d * 0.5, sx: 0.14, sy: 4.4, sz: 0.14, color: '#655d67' });
          if (d > 12) escaleras.push({ x: x + w / 2 + 0.42, h, z });
        }
      };
      if (Math.abs(i) <= 3 && Math.abs(j) <= 3) frente(p);
      if (r() < 0.04) churus.push(new THREE.Vector3(x, h + 1.6, z)); // churu en azotea
    }
  }
  // Bordillos, cebras y vida de calle en lotes compartidos.
  for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) {
    if (Math.abs(i) > 4 || Math.abs(j) > 4) continue; // LOD: no cargar mobiliario fuera del centro jugable
    const x = i * CUADRA, z = j * CUADRA;
    for (const lado of [-1, 1]) {
      bordillos.push({ x, y: 0.16, z: z + lado * 9.5, sx: 17.4, sy: 0.32, sz: 0.42, color: '#dfcfb7' });
      bordillos.push({ x: x + lado * 9.5, y: 0.16, z, sx: 0.42, sy: 0.32, sz: 17.4, color: '#dfcfb7' });
    }
    if (Math.abs(i) <= 5 && Math.abs(j) <= 5) {
      for (let lado of [-1, 1]) for (let k = -3; k <= 3; k++) {
        cruces.push({ x: x + k * 0.8, y: 0.045, z: z + lado * 2.1, sx: 0.43, sy: 0.055, sz: 3.3, color: '#f5e7c8' });
        cruces.push({ x: x + lado * 2.1, y: 0.045, z: z + k * 0.8, sx: 3.3, sy: 0.055, sz: 0.43, color: '#f5e7c8' });
      }
      if ((i + j) % 2 === 0) {
        faroles.push({ x: x + 10.3, y: 4.0, z: z + 10.3, sx: 0.28, sy: 7.6, sz: 0.28, color: '#554d5b' });
      }
    }
    if (Math.abs(i) + Math.abs(j) < 7 && (i * 3 + j * 5) % 4 === 0) {
      coches.push({ x: x + 10.7, y: 0.72, z: z + 4.4, sx: 3.4, sy: 1.05, sz: 1.65, rotY: Math.PI / 2, color: ['#e77965', '#6d9bb0', '#f1c45f', '#697c68'][(i - j + 12) % 4] });
    }
    if (Math.abs(i) + Math.abs(j) > 1 && Math.abs(i) + Math.abs(j) < 7 && (i * 7 + j * 11) % 13 === 0) {
      puestos.push({ x: x + 3, y: 1.5, z: z + 10.6, sx: 3.8, sy: 2.9, sz: 2.4, color: '#b96850' });
      letreros.push({ x: x + 3, y: 3.15, z: z + 9.35, sx: 3.5, sy: 0.95, sz: 0.12, color: '#f1c45f' });
      toldos.push({ x: x + 3, y: 3.05, z: z + 10.4, sx: 4.7, sy: 0.28, sz: 3.1, color: '#ef776b' });
    }
    if (Math.abs(i) + Math.abs(j) > 4 && (i + j) % 3 === 0) {
      for (let k = 0; k < 6; k++) banderines.push({ x: x - 4.5 + k * 1.8, y: 6.5 + (k % 2) * 0.25, z: z + 9.1, sx: 0.75, sy: 1.0, sz: 0.08, rotY: 0, color: ['#ed5b68', '#f2c44f', '#51a99a', '#806ba5'][k % 4] });
    }
  }
  // Churus colgando sobre los cruces de calles, a distintas alturas.
  for (let i = -3; i < 3; i++) for (let j = -3; j < 3; j++) {
    if (r() < 0.4) churus.push(new THREE.Vector3((i + 0.5) * CUADRA, 6 + r() * 22, (j + 0.5) * CUADRA));
  }

  // Cruces principales de la plaza, con cuatro franjas anchas y blancas.
  for (const [x, z, horizontal] of [[0, -13, true], [0, 13, true], [-13, 0, false], [13, 0, false]]) {
    for (let k = 0; k < 4; k++) {
      const offset = -1.2 + k * 0.8;
      cruces.push({ x: x + (horizontal ? offset : 0), y: 0.045, z: z + (horizontal ? 0 : offset), sx: horizontal ? 0.6 : 3.8, sy: 0.055, sz: horizontal ? 3.8 : 0.6, color: '#ffffff' });
    }
  }
  // Tapas y rejillas en el borde de calzada, sin colisión para no alterar el juego.
  for (const [x, z] of [[-8, -8], [8, -8], [-8, 8], [8, 8]]) {
    tapasRegistro.push({ x, y: 0.025, z, sx: 1, sy: 1, sz: 1 });
    for (let i = -2; i <= 2; i++) surcosRegistro.push({ x: x + i * 0.13, y: 0.049, z, sx: 0.025, sy: 0.012, sz: 0.72 });
  }
  for (const [x, z, giro] of [[-10.8, -9.5, 0], [10.8, -9.5, 0], [-10.8, 9.5, 0], [10.8, 9.5, 0]]) {
    rejillas.push({ x, y: 0.035, z, sx: 1.2, sy: 0.035, sz: 0.55, rotY: giro, color: '#37474f' });
  }
  churus.push(new THREE.Vector3(0, 1.3, -6), new THREE.Vector3(0, 12.5, -13)); // uno a pie y uno de práctica

  // Tiras de lona claras alternadas sobre marquesinas de accesos y puestos.
  const franjasToldo = [];
  for (const t of toldos) for (let i = 0; i < 7; i++) {
    const lx = -t.sx / 2 + (i + 0.5) * t.sx / 7, c = Math.cos(t.rotY || 0), s = Math.sin(t.rotY || 0);
    franjasToldo.push({ x: t.x + lx * c, y: t.y + t.sy / 2 + 0.012, z: t.z - lx * s, sx: t.sx / 7 + 0.015, sy: 0.025, sz: t.sz, rotY: t.rotY || 0, color: i % 2 ? '#fff7e8' : t.color });
  }

  // Edificios: una sola malla instanciada.
  const caja = geometriaConLuz(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
  const edificio = materialEdificio(); edificio.vertexColors = true;
  const edificios = new THREE.InstancedMesh(caja, edificio, cajas.length);
  const m = new THREE.Matrix4();
  cajas.forEach((c, k) => {
    m.makeScale(c.max.x - c.min.x, c.max.y, c.max.z - c.min.z).setPosition((c.min.x + c.max.x) / 2, 0, (c.min.z + c.max.z) / 2);
    edificios.setMatrixAt(k, m);
    edificios.setColorAt(k, c.color);
  });
  edificios.computeBoundingSphere();
  scene.add(edificios);
  crearPlantasComerciales(scene, cajas);
  tiendita = crearTiendita(scene, cajas);
  crearAccesoriosCiudad(scene, tinacos);

  // Capas arquitectónicas agrupadas para mantener pocas llamadas de dibujo.
  const lote = (geo, material, piezas) => agregarLote(scene, geo, material, piezas);
  lote(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#ffffff' }), zocalos);
  lote(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#ffffff' }), molduras);
  lote(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#ffffff' }), aticos);
  lote(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#ffffff' }), cornisasBajas);
  const esferaRemate = remates.filter((p) => p.esfera), pedestalRemate = remates.filter((p) => !p.esfera);
  lote(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#ffffff' }), pedestalRemate);
  lote(new THREE.SphereGeometry(0.5, 8, 6), new THREE.MeshLambertMaterial({ color: '#ffffff' }), esferaRemate);
  lote(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#ffffff' }), balconMénsulas);
  lote(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#ffffff' }), balconBarrotes);
  lote(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#ffffff' }), balconPasamanos);
  lote(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#ffffff' }), toldosCentro);
  lote(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#ffffff' }), toldosFaldon);
  crearQuioscoYCableado(scene);

  // Tinacos negros (como los de las azoteas mexicanas).
  const tin = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.8, 0.8, 1.8, 10).translate(0, 0.9, 0), new THREE.MeshLambertMaterial({ color: 0x2b2b30 }), tinacos.length);
  tinacos.forEach(([x, y, z], k) => tin.setMatrixAt(k, m.makeTranslation(x, y, z)));
  scene.add(tin);

  const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
  // setColorAt usa instanceColor; vertexColors exigiría un atributo color que
  // estas geometrías compartidas no tienen y las dibujaría negras.
  const cubeBase = new THREE.MeshLambertMaterial({ color: 0xffffff });
  for (const [nombre, lista] of Object.entries({ bordillos, cruces, balcones, toldos, franjasToldo, cornisas, antepechos, aires, antenas, jardineras, tierraJardineras, puestos, letreros })) {
    agregarLote(scene, cubeGeo, cubeBase, lista);
  }
  const botesMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.32, 0.38, 0.9, 10), cubeBase, botes.length);
  const tapasBote = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.39, 0.39, 0.1, 10), cubeBase, botes.length);
  botes.forEach((b, i) => {
    botesMesh.setMatrixAt(i, m.makeTranslation(b.x, b.y, b.z)); botesMesh.setColorAt(i, new THREE.Color(b.color));
    tapasBote.setMatrixAt(i, m.makeTranslation(b.x, 0.93, b.z)); tapasBote.setColorAt(i, new THREE.Color(b.color));
  });
  scene.add(botesMesh, tapasBote);
  agregarLote(scene, new THREE.BoxGeometry(0.2, 0.035, 0.08), new THREE.MeshLambertMaterial({ color: '#263238' }), botes.map((b) => ({ x: b.x, y: 0.99, z: b.z, sx: 1, sy: 1, sz: 1 })));
  agregarLote(scene, new THREE.CylinderGeometry(2.8, 2.8, 0.56, 12), cubeBase, fuentes.map(([x, z]) => ({ x, y: 0.34, z, sx: 1, sy: 1, sz: 1, color: '#d8c7b2' })));
  agregarLote(scene, new THREE.CylinderGeometry(2.22, 2.22, 0.1, 12), new THREE.MeshBasicMaterial({ color: '#72aeb5' }), fuentes.map(([x, z]) => ({ x, y: 0.66, z, sx: 1, sy: 1, sz: 1 })));
  agregarLote(scene, new THREE.CylinderGeometry(0.22, 0.36, 0.72, 8), cubeBase, fuentes.map(([x, z]) => ({ x, y: 0.96, z, sx: 1, sy: 1, sz: 1, color: '#d8c7b2' })));
  agregarLote(scene, cubeGeo, cubeBase, rejillas);
  agregarLote(scene, new THREE.CylinderGeometry(0.48, 0.48, 0.035, 12), new THREE.MeshStandardMaterial({ color: '#212121', roughness: 0.84, metalness: 0.38 }), tapasRegistro);
  agregarLote(scene, cubeGeo, new THREE.MeshLambertMaterial({ color: '#59636a' }), surcosRegistro);

  // Parabús sobre la banqueta norte, con mupi visible desde la avenida.
  const parada = new THREE.Group(); parada.position.set(12, 0, -14);
  const verdeParada = new THREE.MeshLambertMaterial({ color: '#1b5e20' });
  const vidrioParada = new THREE.MeshStandardMaterial({ color: '#b2ebf2', transparent: true, opacity: 0.52, roughness: 0.2, metalness: 0.1, side: THREE.DoubleSide });
  const maderaParada = new THREE.MeshLambertMaterial({ color: '#d7ccc8' });
  for (const px of [-2.1, 2.1]) {
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.75, 8), verdeParada); poste.position.set(px, 1.38, 0); parada.add(poste);
  }
  const cubierta = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 4.4, 16, 1, true, 0, Math.PI), vidrioParada);
  cubierta.rotation.z = Math.PI / 2; cubierta.position.set(0, 0.55, 0); parada.add(cubierta);
  const panelLateral = new THREE.Mesh(new THREE.PlaneGeometry(4.1, 2.35), vidrioParada); panelLateral.position.set(0, 1.42, -0.12); parada.add(panelLateral);
  for (let i = 0; i < 4; i++) {
    const tablón = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 0.18), maderaParada); tablón.position.set(0, 0.58 + i * 0.13, 0.72 - i * 0.04); parada.add(tablón);
  }
  const marcoMupi = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.28), verdeParada); marcoMupi.position.set(-2.85, 1.46, 0.45); parada.add(marcoMupi);
  const posterCanvas = document.createElement('canvas'); posterCanvas.width = 384; posterCanvas.height = 640;
  const poster = posterCanvas.getContext('2d');
  const posterGrad = poster.createLinearGradient(0, 0, 384, 640); posterGrad.addColorStop(0, '#ffcc80'); posterGrad.addColorStop(1, '#ef7891');
  poster.fillStyle = posterGrad; poster.fillRect(0, 0, 384, 640); poster.fillStyle = '#4e342e'; poster.textAlign = 'center'; poster.font = '900 48px system-ui'; poster.fillText('RUTA', 192, 78); poster.font = '900 88px system-ui'; poster.fillText('SENKU', 192, 180);
  poster.fillStyle = '#fff7e8'; poster.beginPath(); poster.arc(192, 365, 112, 0, Math.PI * 2); poster.fill(); poster.fillStyle = '#d66c61'; poster.beginPath(); poster.arc(192, 382, 80, 0, Math.PI * 2); poster.fill();
  poster.fillStyle = '#fff'; poster.beginPath(); poster.arc(164, 354, 13, 0, Math.PI * 2); poster.arc(220, 354, 13, 0, Math.PI * 2); poster.fill(); poster.fillStyle = '#452c35'; poster.beginPath(); poster.arc(164, 354, 6, 0, Math.PI * 2); poster.arc(220, 354, 6, 0, Math.PI * 2); poster.fill(); poster.font = '700 40px system-ui'; poster.fillText('¡VIAJA JUGANDO!', 192, 560);
  const posterTex = new THREE.CanvasTexture(posterCanvas); posterTex.colorSpace = THREE.SRGBColorSpace;
  const posterMat = new THREE.MeshStandardMaterial({ map: posterTex, emissive: '#ffffff', emissiveMap: posterTex, emissiveIntensity: 0.7, roughness: 0.7 });
  const mupiPoster = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 1.96), posterMat); mupiPoster.position.set(-2.85, 1.46, 0.6); parada.add(mupiPoster);
  mupiPoster.rotation.y = -0.15;
  scene.add(parada);
  const peldaños = [], largueros = [], descansos = [], barandales = [];
  for (const e of escaleras) {
    const niveles = Math.ceil(e.h / 3.2);
    for (let nivel = 0; nivel < niveles; nivel++) {
      const y = Math.min(e.h - 0.8, (nivel + 1) * 3.2), sentido = nivel % 2 ? -1 : 1;
      descansos.push({ x: e.x + 0.48, y, z: e.z, sx: 1.55, sy: 0.12, sz: 2.5, color: '#45515b' });
      const z0 = e.z - sentido * 1.05, z1 = e.z + sentido * 1.05;
      largueros.push({ x: e.x + 0.48, y: y - 1.55, z: (z0 + z1) / 2, sx: 0.12, sy: 0.16, sz: 3.1, rx: -sentido * 0.55, color: '#263238' });
      for (let paso = 0; paso < 6; paso++) peldaños.push({ x: e.x + 0.48, y: y - 2.8 + paso * 0.28, z: z0 + (z1 - z0) * paso / 5, sx: 1.25, sy: 0.08, sz: 0.34, color: '#78909c' });
      for (const lado of [-1, 1]) barandales.push({ x: e.x + 0.48 + lado * 0.72, y: y - 0.55, z: e.z, sx: 0.07, sy: 1.1, sz: 2.6, color: '#263238' });
    }
  }
  agregarLote(scene, cubeGeo, cubeBase, largueros);
  agregarLote(scene, cubeGeo, cubeBase, peldaños);
  agregarLote(scene, cubeGeo, cubeBase, descansos);
  agregarLote(scene, cubeGeo, cubeBase, barandales);
  // Troncos cónicos y copas facetadas en dos niveles, con instancias económicas.
  const troncos = [], copas = [], palmeras = [], raices = [];
  arboles.forEach(([x, y, z, tipo], k) => {
    const h = tipo === 1 ? 5.2 : tipo === 2 ? 6.4 : 4.3;
    troncos.push({ x, y: h / 2, z, sx: tipo === 1 ? 0.34 : 0.55, sy: h, sz: tipo === 1 ? 0.34 : 0.55, color: '#6d4c41' });
    if (tipo !== 1) for (let r = 0; r < 3; r++) {
      const a = r * Math.PI * 2 / 3 + k * 0.7;
      raices.push({ x: x + Math.cos(a) * 0.48, y: 0.16, z: z + Math.sin(a) * 0.48, sx: 0.82, sy: 0.15, sz: 0.18, rotY: -a, color: '#795548' });
    }
    if (tipo === 1) palmeras.push({ x, y: h + 0.3, z, sx: 2.9, sy: 0.55, sz: 0.9, color: '#6eaa76', rotY: k * 0.8 });
    else {
      const escala = tipo === 2 ? 2.7 : 2.2;
      copas.push({ x, y: h + 0.9, z, sx: escala / 1.2, sy: (tipo === 2 ? 3.2 : 2.5) / 1.2, sz: escala / 1.2, color: k % 2 ? '#4caf50' : '#8bc34a' });
      copas.push({ x: x + escala * 0.48, y: h + 0.55, z: z + escala * 0.1, sx: escala * 0.68 / 1.2, sy: escala * 0.75 / 1.2, sz: escala * 0.72 / 1.2, color: k % 2 ? '#8bc34a' : '#4caf50' });
      copas.push({ x: x - escala * 0.34, y: h + 0.05, z: z + escala * 0.06, sx: escala * 0.8 / 1.2, sy: escala * 0.7 / 1.2, sz: escala * 0.82 / 1.2, color: '#2e7d32' });
    }
  });
  agregarLote(scene, new THREE.CylinderGeometry(0.28, 0.68, 1, 8), cubeBase, troncos);
  agregarLote(scene, new THREE.CylinderGeometry(0.06, 0.24, 1, 6), cubeBase, raices);
  agregarLote(scene, new THREE.SphereGeometry(1.2, 7, 5), new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), copas);
  agregarLote(scene, new THREE.ConeGeometry(1, 1, 6), cubeBase, palmeras);
  const listonesBanca = [], patasBanca = [];
  bancas.forEach((b) => {
    const c = Math.cos(b.rotY), s = Math.sin(b.rotY);
    for (const lateral of [-0.19, 0.19]) {
      listonesBanca.push({ x: b.x - lateral * s, y: 0.56, z: b.z + lateral * c, sx: 2.65, sy: 0.16, sz: 0.24, rotY: b.rotY, color: '#a0522d' });
      listonesBanca.push({ x: b.x - lateral * s, y: 0.83, z: b.z + lateral * c, sx: 2.65, sy: 0.15, sz: 0.2, rotY: b.rotY, color: '#a0522d' });
    }
    for (const x of [-0.9, 0.9]) patasBanca.push({ x: b.x + x * c, y: 0.27, z: b.z - x * s, sx: 0.13, sy: 0.55, sz: 0.13, color: '#212121' });
  });
  agregarLote(scene, cubeGeo, cubeBase, listonesBanca);
  agregarLote(scene, new THREE.CylinderGeometry(0.085, 0.13, 1, 7), new THREE.MeshLambertMaterial({ color: '#212121' }), patasBanca);

  // Seis flores de cinco pétalos en las jardineras que rodean los árboles del parque central.
  const petalos = [], centros = [];
  jardineras.filter((_, i) => i < 6).forEach((j, indice) => {
      const a = indice * 1.7;
      const fx = j.x + Math.cos(a) * 0.55, fz = j.z + Math.sin(a) * 0.55;
      const tono = indice % 2 ? '#ff7043' : '#ffee58';
      for (let p = 0; p < 5; p++) {
        const pa = p * Math.PI * 2 / 5;
        petalos.push({ x: fx + Math.cos(pa) * 0.09, y: 0.53, z: fz + Math.sin(pa) * 0.09, sx: 0.15, sy: 0.08, sz: 0.13, rotY: -pa, color: tono });
      }
      centros.push({ x: fx, y: 0.58, z: fz, sx: 0.09, sy: 0.09, sz: 0.09, color: '#ffb300' });
  });
  agregarLote(scene, new THREE.SphereGeometry(1, 6, 4), cubeBase, petalos);
  agregarLote(scene, new THREE.SphereGeometry(1, 6, 4), new THREE.MeshLambertMaterial({ color: '#ffffff' }), centros);
  // Farolas clásicas con báculo inclinado y globo cálido; sin luces ni sombras dinámicas.
  const posteFarol = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.17, 1, 8), new THREE.MeshLambertMaterial({ color: '#37474f' }), faroles.length);
  const brazoFarol = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.1, 1, 7), new THREE.MeshLambertMaterial({ color: '#37474f' }), faroles.length);
  const materialGloboFarol = new THREE.MeshStandardMaterial({ color: '#fff3cc', emissive: '#ffd27f', emissiveIntensity: 0.8, roughness: 0.7 });
  const globoFarol = new THREE.InstancedMesh(new THREE.SphereGeometry(0.3, 8, 6), materialGloboFarol, faroles.length);
  const materialHaloFarol = new THREE.MeshBasicMaterial({ color: 0xffe082, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const halosFarol = new THREE.InstancedMesh(new THREE.CircleGeometry(2.2, 16), materialHaloFarol, faroles.length);
  const arriba = new THREE.Vector3(), abajo = new THREE.Vector3(), direccion = new THREE.Vector3(), dummyFarol = new THREE.Object3D();
  faroles.forEach((p, i) => {
    dummyFarol.position.set(p.x, 3.8, p.z); dummyFarol.scale.set(1, 7.6, 1); dummyFarol.updateMatrix(); posteFarol.setMatrixAt(i, dummyFarol.matrix);
    abajo.set(p.x + 0.12, 7.55, p.z); arriba.set(p.x + 0.68, 7.55, p.z); direccion.subVectors(arriba, abajo);
    dummyFarol.position.copy(abajo).add(arriba).multiplyScalar(0.5); dummyFarol.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direccion.clone().normalize()); dummyFarol.scale.set(1, direccion.length(), 1); dummyFarol.updateMatrix(); brazoFarol.setMatrixAt(i, dummyFarol.matrix);
    dummyFarol.position.set(p.x + 0.72, 7.43, p.z); dummyFarol.scale.set(1, 1, 1); dummyFarol.updateMatrix(); globoFarol.setMatrixAt(i, dummyFarol.matrix);
    dummyFarol.position.set(p.x, 0.035, p.z); dummyFarol.rotation.set(-Math.PI / 2, 0, 0); dummyFarol.updateMatrix(); halosFarol.setMatrixAt(i, dummyFarol.matrix);
  });
  scene.add(posteFarol, brazoFarol, globoFarol, halosFarol);
  // Papeles picados: planos pequeños agrupados, con cuatro colores alegres.
  const geoPapel = new THREE.BufferGeometry();
  geoPapel.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0.5, 0, 0.5, 0.5, 0, 0, -0.5, 0], 3));
  geoPapel.computeVertexNormals();
  agregarLote(scene, geoPapel, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }), banderines);
  // Señalética de taquería sobre material compartido, con texto dibujado una vez.
  if (letreros.length) {
    const lienzo = document.createElement('canvas'); lienzo.width = 512; lienzo.height = 128;
    const g = lienzo.getContext('2d'); g.fillStyle = '#643b42'; g.fillRect(0, 0, 512, 128);
    g.fillStyle = '#ffd56e'; g.font = '900 76px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TACOS', 256, 65);
    const tex = new THREE.CanvasTexture(lienzo); tex.colorSpace = THREE.SRGBColorSpace;
    // La caja de soporte ya está instanciada; el pequeño rótulo ilustrado se comparte.
    const rotulos = new THREE.InstancedMesh(new THREE.PlaneGeometry(3.5, 0.88), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), letreros.length);
    const o = new THREE.Object3D(); letreros.forEach((p, i) => { o.position.set(p.x, p.y, p.z - 0.08); o.updateMatrix(); rotulos.setMatrixAt(i, o.matrix); });
    rotulos.instanceMatrix.needsUpdate = true; rotulos.computeBoundingSphere(); scene.add(rotulos);
  }

  // Cactus: tronco + dos brazos con cápsulas instanciadas.
  const cap = new THREE.CapsuleGeometry(0.35, 1, 3, 8);
  const piezas = [];
  for (const [x, z, h] of cactus) {
    piezas.push(new THREE.Matrix4().makeScale(1, h, 1).setPosition(x, h * 0.8, z));
    piezas.push(new THREE.Matrix4().makeScale(0.7, 0.7, 0.7).setPosition(x + 0.6, h * 0.9, z));
    piezas.push(new THREE.Matrix4().makeScale(0.6, 0.6, 0.6).setPosition(x - 0.55, h * 1.15, z));
  }
  const cac = new THREE.InstancedMesh(cap, new THREE.MeshLambertMaterial({ color: 0x4f9a4a }), piezas.length);
  piezas.forEach((p, k) => cac.setMatrixAt(k, p));
  scene.add(cac);

  const cajasVida = cajas.slice();
  const carteles = crearCarteles(cajas, scene);
  const vida = crearVidaCiudad(scene, cajasVida, coches, nubes);
  vida.vincularFachada(edificio);
  const balizas = cajas.filter((c) => c.max.y > 35 && Math.abs((c.min.x + c.max.x) / 2) < 60 && Math.abs((c.min.z + c.max.z) / 2) < 60).sort((a, b) => b.max.y - a.max.y).slice(0, 2).map((c, i) => {
    const x = (c.min.x + c.max.x) / 2, z = (c.min.z + c.max.z) / 2, y = c.max.y;
    const antena = new THREE.Group();
    const hierro = new THREE.MeshLambertMaterial({ color: '#45515b' });
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 3.6, 5), hierro); poste.position.y = 1.8; antena.add(poste);
    for (const rot of [-0.65, 0.65]) { const riostra = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.5, 4), hierro); riostra.position.y = 1.25; riostra.rotation.z = rot; antena.add(riostra); }
    const materialBaliza = new THREE.MeshStandardMaterial({ color: '#ff1744', emissive: '#ff1744', emissiveIntensity: 1.4, roughness: 0.4 });
    const baliza = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), materialBaliza); baliza.position.y = 3.7; antena.add(baliza);
    antena.position.set(x, y, z); scene.add(antena); return { antena, materialBaliza, fase: i * Math.PI };
  });
  return {
    grupo, edificios, cajas: cajas.map(({ min, max }) => ({ min, max })), churus, domo, vida, tiendita,
    carteles: {
      ...carteles,
      animar(tiempo, noche = 0) {
        carteles.animar(tiempo);
        materialGloboFarol.emissiveIntensity = noche * 0.8;
        materialHaloFarol.opacity = noche * 0.24;
        const pulso = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(tiempo * Math.PI * 2 / 1000));
        for (const baliza of balizas) baliza.materialBaliza.emissiveIntensity = 1.4 * pulso * noche;
      },
    },
  };
}
