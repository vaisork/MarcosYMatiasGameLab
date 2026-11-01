// Ciudad low-poly del desierto: cielo, suelo con calles, edificios instanciados
// con ventanas en shader, tinacos, cactus y posiciones de churus.
import * as THREE from 'three';
import { CARTELES } from './carteles.mjs';

export const CUADRA = 26; // separación entre centros de manzana (calle incluida)
const N = 6;              // manzanas de -N a N
const HORIZONTE = new THREE.Color('#f6c58f');

function azar(semilla) { // mulberry32: ciudad igual en cada partida
  return () => {
    semilla |= 0; semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cielo() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { sol: { value: new THREE.Vector3(0.45, 0.55, -0.7).normalize() } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 sol; varying vec3 vDir;
      void main(){
        float h = clamp(vDir.y, 0.0, 1.0);
        vec3 c = mix(vec3(0.965,0.773,0.561), vec3(0.98,0.88,0.62), smoothstep(0.0,0.08,h));
        c = mix(c, vec3(0.42,0.70,0.95), smoothstep(0.06,0.5,h));
        float d = max(dot(normalize(vDir), sol), 0.0);
        c += vec3(1.0,0.9,0.6) * (smoothstep(0.9975,0.999,d) + pow(d, 60.0) * 0.35);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(420, 24, 12), mat);
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
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  mat.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vWP = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
        vWN = normalize(mat3(instanceMatrix) * objectNormal);`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        if (vWN.y < 0.5 && vWN.y > -0.5) {
          vec2 c = abs(vWN.x) > 0.5 ? vWP.zy : vWP.xy;
          vec2 celda = floor(c / vec2(3.0, 3.6));
          vec2 g = fract(c / vec2(3.0, 3.6));
          float ventana = step(0.22, g.x) * step(g.x, 0.78) * step(0.3, g.y) * step(g.y, 0.78) * step(3.0, vWP.y);
          float luz = step(0.6, fract(sin(dot(celda, vec2(12.9898, 78.233))) * 43758.5453));
          vec3 vidrio = mix(vec3(0.28, 0.42, 0.58), vec3(0.85, 0.95, 1.0), luz * 0.7);
          diffuseColor.rgb = mix(diffuseColor.rgb, vidrio, ventana);
          diffuseColor.rgb *= 0.92 + 0.08 * step(0.92, g.y); // franja de piso
        } else { diffuseColor.rgb *= 1.12; }`);
  };
  return mat;
}

export function crearMundo(scene) {
  const r = azar(1337);
  scene.background = HORIZONTE;
  scene.fog = new THREE.Fog(HORIZONTE, 70, 300);
  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0xd8a36a, 1.6));
  const sol = new THREE.DirectionalLight(0xfff0d0, 1.8);
  sol.position.set(45, 55, -70);
  scene.add(sol, cielo(), suelo());

  const colores = ['#e07a5f', '#f2cc8f', '#81b29a', '#3d9ca8', '#f4a6b7', '#b8a1d9', '#e9c46a', '#f28f3b', '#9bd36a', '#f7ede2'].map((c) => new THREE.Color(c));
  const cajas = [], tinacos = [], cactus = [], churus = [];
  const vacio = (i, j) => (i === 0 && j === 0) || ((i * 7 + j * 13) % 11 === 0 && Math.abs(i) + Math.abs(j) > 2);

  for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) {
    const cx = i * CUADRA, cz = j * CUADRA;
    if (vacio(i, j)) { // plaza o lote baldío con cactus
      const n = i === 0 && j === 0 ? 6 : 3;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + r();
        const rad = i === 0 && j === 0 ? 7 + r() * 2 : r() * 7;
        cactus.push([cx + Math.cos(a) * rad, cz + Math.sin(a) * rad, 1.6 + r() * 1.6]);
      }
      continue;
    }
    const centro = 1 - Math.min(1, Math.hypot(i, j) / (N * 1.2));
    const partes = r() < 0.35 ? 2 : 1;
    for (let p = 0; p < partes; p++) {
      const w = partes === 1 ? 10 + r() * 7 : 7 + r() * 2;
      const d = 10 + r() * 7;
      const h = 9 + Math.pow(r(), 1.6) * 40 * (0.5 + centro);
      const ox = partes === 1 ? 0 : (p === 0 ? -4.6 : 4.6);
      const x = cx + ox, z = cz;
      cajas.push({ min: { x: x - w / 2, y: 0, z: z - d / 2 }, max: { x: x + w / 2, y: h, z: z + d / 2 }, color: colores[Math.floor(r() * colores.length)] });
      if (r() < 0.6) tinacos.push([x + (r() - 0.5) * (w - 3), h, z + (r() - 0.5) * (d - 3)]);
      if (r() < 0.04) churus.push(new THREE.Vector3(x, h + 1.6, z)); // churu en azotea
    }
  }
  // Churus colgando sobre los cruces de calles, a distintas alturas.
  for (let i = -3; i < 3; i++) for (let j = -3; j < 3; j++) {
    if (r() < 0.4) churus.push(new THREE.Vector3((i + 0.5) * CUADRA, 6 + r() * 22, (j + 0.5) * CUADRA));
  }
  churus.push(new THREE.Vector3(0, 1.3, -6), new THREE.Vector3(0, 12.5, -13)); // uno a pie y uno de práctica

  // Edificios: una sola malla instanciada.
  const caja = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const edificios = new THREE.InstancedMesh(caja, materialEdificio(), cajas.length);
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

  return { edificios, cajas: cajas.map(({ min, max }) => ({ min, max })), churus, carteles };
}
