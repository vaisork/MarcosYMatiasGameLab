// Ciudad low-poly del desierto: cielo, suelo con calles, edificios instanciados
// con ventanas en shader, tinacos, cactus y posiciones de churus.
import * as THREE from 'three';
import { CARTELES } from './carteles.mjs';
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
  cielo.addColorStop(0, PALETA_CIUDAD.cieloAlto);
  cielo.addColorStop(0.31, '#9a5f7b');
  cielo.addColorStop(0.56, PALETA_CIUDAD.cieloMedio);
  cielo.addColorStop(0.68, PALETA_CIUDAD.horizonte);
  cielo.addColorStop(0.76, '#d68e83');
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
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const m = 128 / CUADRA; // px por metro
  g.fillStyle = '#e3b57a'; g.fillRect(0, 0, 128, 128);              // arena
  g.fillStyle = '#d9cfc0'; g.fillRect(4.5 * m, 4.5 * m, 128 - 9 * m, 128 - 9 * m); // banqueta
  g.fillStyle = '#e8c48f'; g.fillRect(5.5 * m, 5.5 * m, 128 - 11 * m, 128 - 11 * m);
  g.fillStyle = '#5b5560';                                            // asfalto en los bordes
  g.fillRect(0, 0, 128, 4 * m); g.fillRect(0, 128 - 4 * m, 128, 4 * m);
  g.fillRect(0, 0, 4 * m, 128); g.fillRect(128 - 4 * m, 0, 4 * m, 128);
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
  const barras = [], bombillas = [], postes = [], marquesinas = [], neones = [];
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

    const back = 0.54;
    // Perímetro grueso en cuatro piezas y bastidor posterior con largueros.
    const rail = (lx, ly, lz, sx, sy, sz) => barras.push({ x: x + lx * Math.cos(rotY) + lz * Math.sin(rotY), y: y + ly, z: z - lx * Math.sin(rotY) + lz * Math.cos(rotY), sx, sy, sz, rotY, color: item.color });
    for (const edge of [-1, 1]) {
      rail(edge * (ancho / 2 + 0.42), 0, 0, 0.84, alto + 1.68, 0.9);
      rail(0, edge * (alto / 2 + 0.42), 0, ancho + 1.68, 0.84, 0.9);
      rail(edge * ancho * 0.39, 0, -back, 0.36, alto + 0.4, 0.36);
    }
    rail(0, alto * 0.12, -back, ancho * 0.8, 0.34, 0.36);
    agregarBombillas(bombillas, x, y, z + 0.36 * Math.cos(rotY), ancho + 0.9, alto + 0.9, rotY, k * 0.13);

    if (techo) {
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
  const fondos = ['#283c54', '#34505d', '#45394f', '#5c414a'];
  const vidrios = ['#8ec7cf', '#f6c87e', '#91a7dd', '#e8a2a0'];
  for (let i = 0; i < 4; i++) {
    const x = i * 128;
    g.fillStyle = fondos[i]; g.fillRect(x, 0, 128, 128);
    g.fillStyle = '#171f31'; g.fillRect(x + 17, 13, 94, 102);
    const grad = g.createLinearGradient(x + 19, 15, x + 108, 112);
    grad.addColorStop(0, vidrios[i]); grad.addColorStop(0.72, '#b8d7db'); grad.addColorStop(1, '#68899e');
    g.fillStyle = grad; g.fillRect(x + 23, 19, 82, 86);
    g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x + 27, 21, 5, 80);
    g.fillStyle = '#273246'; g.fillRect(x + 61, 18, 5, 88); g.fillRect(x + 21, 59, 87, 5);
    g.fillStyle = '#d9c3a2'; g.fillRect(x + 12, 108, 104, 9); g.fillRect(x + 14, 8, 100, 7);
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
    o.position.set(Math.sin(a) * radio, -1 + p.alto * 0.5, -Math.cos(a) * radio);
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

function crearVidaCiudad(scene, cajas, rutasCoche) {
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

export function crearMundo(scene) {
  const r = azar(1337);
  scene.background = HORIZONTE;
  scene.fog = new THREE.Fog(HORIZONTE, 105, 540);
  scene.add(new THREE.HemisphereLight(0xffd8c2, 0x806779, 1.42));
  const sol = new THREE.DirectionalLight(0xffe4c2, 1.15);
  sol.position.set(45, 55, -70);
  const domo = cielo();
  scene.add(sol, domo, crearSol(), suelo());
  crearCordillera(scene);
  crearSkyline(scene, 197, 0);
  crearSkyline(scene, 249, 1);
  crearMar(scene);

  const cajas = [], tinacos = [], cactus = [], churus = [];
  const arboles = [], jardineras = [], fuentes = [], bancas = [], faroles = [], puestos = [], coches = [];
  const balcones = [], toldos = [], cornisas = [], aires = [], antenas = [], escaleras = [];
  const cruces = [], bordillos = [], banderines = [], letreros = [];
  const vacio = (i, j) => (i === 0 && j === 0) || ((i * 7 + j * 13) % 11 === 0 && Math.abs(i) + Math.abs(j) > 2) || (i === -3 && j === -2);

  for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) {
    const cx = i * CUADRA, cz = j * CUADRA;
    if (vacio(i, j)) { // plaza central y pequeño parque de barrio
      if ((i === 0 && j === 0) || (i === -3 && j === -2)) {
        const parque = i === 0 && j === 0;
        const n = parque ? 12 : 8;
        for (let k = 0; k < n; k++) {
          const a = k * Math.PI * 2 / n, rad = parque ? 8.2 : 7.4;
          arboles.push([cx + Math.cos(a) * rad, 0, cz + Math.sin(a) * rad, k % 3]);
          if (k % 3 !== 0) jardineras.push({ x: cx + Math.cos(a) * 10.2, y: 0.38, z: cz + Math.sin(a) * 10.2, sx: 2.8, sy: 0.76, sz: 1.8, rotY: -a, color: ['#d88e69', '#6f9c7c', '#d9b76d'][k % 3] });
        }
        if (parque) {
          // Fuente baja poligonal con pedestal, agua y surtidor; sin luces.
          fuentes.push([cx, cz]);
        }
        for (let k = 0; k < (parque ? 6 : 4); k++) {
          const a = k * Math.PI * 2 / (parque ? 6 : 4), rad = parque ? 5.8 : 5.3;
          bancas.push({ x: cx + Math.cos(a) * rad, y: 0.55, z: cz + Math.sin(a) * rad, sx: 2.6, sy: 0.18, sz: 0.68, rotY: -a, color: '#865b46' });
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
      const paleta = barrio === 'centro' ? ['#72839a', '#9b8790', '#788d87', '#b59079', '#6c7b9c'] : ['#e06e58', '#f2c568', '#6eaaa0', '#f09aaa', '#8c79bb', '#f28e45', '#88b86c', '#f7e7c8'];
      const color = new THREE.Color(paleta[Math.floor(r() * paleta.length)]);
      cajas.push({ min: { x: x - w / 2, y: 0, z: z - d / 2 }, max: { x: x + w / 2, y: h, z: z + d / 2 }, color, barrio });
      if (r() < 0.6) tinacos.push([x + (r() - 0.5) * (w - 3), h, z + (r() - 0.5) * (d - 3)]);
      const frente = (p) => {
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
  churus.push(new THREE.Vector3(0, 1.3, -6), new THREE.Vector3(0, 12.5, -13)); // uno a pie y uno de práctica

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

  // Tinacos negros (como los de las azoteas mexicanas).
  const tin = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.8, 0.8, 1.8, 10).translate(0, 0.9, 0), new THREE.MeshLambertMaterial({ color: 0x2b2b30 }), tinacos.length);
  tinacos.forEach(([x, y, z], k) => tin.setMatrixAt(k, m.makeTranslation(x, y, z)));
  scene.add(tin);

  const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
  // setColorAt usa instanceColor; vertexColors exigiría un atributo color que
  // estas geometrías compartidas no tienen y las dibujaría negras.
  const cubeBase = new THREE.MeshLambertMaterial({ color: 0xffffff });
  for (const [nombre, lista] of Object.entries({ bordillos, cruces, balcones, toldos, cornisas, aires, antenas, jardineras, bancas, faroles, puestos, letreros })) {
    agregarLote(scene, cubeGeo, cubeBase, lista);
  }
  agregarLote(scene, new THREE.CylinderGeometry(2.8, 2.8, 0.56, 12), cubeBase, fuentes.map(([x, z]) => ({ x, y: 0.34, z, sx: 1, sy: 1, sz: 1, color: '#d8c7b2' })));
  agregarLote(scene, new THREE.CylinderGeometry(2.22, 2.22, 0.1, 12), new THREE.MeshBasicMaterial({ color: '#72aeb5' }), fuentes.map(([x, z]) => ({ x, y: 0.66, z, sx: 1, sy: 1, sz: 1 })));
  agregarLote(scene, new THREE.CylinderGeometry(0.22, 0.36, 0.72, 8), cubeBase, fuentes.map(([x, z]) => ({ x, y: 0.96, z, sx: 1, sy: 1, sz: 1, color: '#d8c7b2' })));
  const peldaños = [], largueros = [];
  for (const e of escaleras) {
    for (const lado of [-1, 1]) largueros.push({ x: e.x, y: e.h / 2, z: e.z + lado * 0.95, sx: 0.14, sy: e.h, sz: 0.14, color: '#756678' });
    for (let y = 1.3; y < e.h; y += 2.2) peldaños.push({ x: e.x - 0.02, y, z: e.z, sx: 0.24, sy: 0.12, sz: 2.0, color: '#bca9a2' });
  }
  agregarLote(scene, cubeGeo, cubeBase, largueros);
  agregarLote(scene, cubeGeo, cubeBase, peldaños);
  // Árboles de copa redonda, palmera y ciprés en tres lotes; troncos/copa con color por instancia.
  const troncos = [], copas = [], palmeras = [];
  arboles.forEach(([x, y, z, tipo], k) => {
    const h = tipo === 1 ? 5.2 : tipo === 2 ? 6.4 : 4.3;
    troncos.push({ x, y: h / 2, z, sx: tipo === 1 ? 0.34 : 0.55, sy: h, sz: tipo === 1 ? 0.34 : 0.55, color: '#72533f' });
    if (tipo === 1) palmeras.push({ x, y: h + 0.3, z, sx: 2.9, sy: 0.55, sz: 0.9, color: '#6eaa76', rotY: k * 0.8 });
    else copas.push({ x, y: h + 0.9, z, sx: tipo === 2 ? 2.7 : 2.2, sy: tipo === 2 ? 3.4 : 2.5, sz: tipo === 2 ? 2.7 : 2.2, color: ['#6d9b69', '#85ab72', '#89a87d'][k % 3] });
  });
  agregarLote(scene, new THREE.CylinderGeometry(0.5, 0.65, 1, 7), cubeBase, troncos);
  agregarLote(scene, new THREE.IcosahedronGeometry(1, 1), cubeBase, copas);
  agregarLote(scene, new THREE.ConeGeometry(1, 1, 6), cubeBase, palmeras);
  const patasBanca = [];
  bancas.forEach((b) => {
    const c = Math.cos(b.rotY), s = Math.sin(b.rotY);
    for (const x of [-0.9, 0.9]) patasBanca.push({ x: b.x + x * c, y: 0.27, z: b.z - x * s, sx: 0.14, sy: 0.55, sz: 0.14, color: '#51424a' });
  });
  agregarLote(scene, cubeGeo, cubeBase, patasBanca);
  const bombillaFarolMat = new THREE.MeshBasicMaterial({ color: '#596170', toneMapped: false });
  const bombillasFarol = faroles.map((p) => ({ x: p.x, y: 7.82, z: p.z, sx: 0.62, sy: 0.48, sz: 0.62, color: '#ffd793' }));
  agregarLote(scene, new THREE.SphereGeometry(0.5, 7, 5), bombillaFarolMat, bombillasFarol);
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

  const carteles = crearCarteles(cajas, scene);
  const vida = crearVidaCiudad(scene, cajas, coches);
  vida.vincularFachada(edificio);
  let farolesDesde = null;

  return {
    edificios, cajas: cajas.map(({ min, max }) => ({ min, max })), churus, domo, vida,
    carteles: {
      ...carteles,
      encenderFaroles(tiempo) { farolesDesde = tiempo; },
      animar(tiempo) {
        carteles.animar(tiempo);
        if (farolesDesde === null) return;
        const encendido = Math.max(0, Math.min(1, (tiempo - farolesDesde) / 3200));
        bombillaFarolMat.color.setRGB(0.35 + encendido * 0.65, 0.38 + encendido * 0.48, 0.5 + encendido * 0.23);
      },
    },
  };
}
