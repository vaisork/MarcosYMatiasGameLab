// Ciudad low-poly del desierto: cielo, suelo con calles, edificios instanciados
// con ventanas en shader, tinacos, cactus y posiciones de churus.
import * as THREE from 'three';

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

  return { edificios, cajas: cajas.map(({ min, max }) => ({ min, max })), churus };
}
