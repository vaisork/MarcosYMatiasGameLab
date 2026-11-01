// Senku VR: eres Senku, una gatita con garras que se columpia por la ciudad.
import * as THREE from 'three';
import { paso, crearCuerda, soltar, tiron, impulsoBrazo } from './fisica.mjs';
import { crearMundo } from './mundo.js';
import { iniciarSonido, sonar } from './sonido.js';
import { CUERDAS, PATAS, tramoCuerda, muestraCuerda, muestraPata, leerEleccion, guardarEleccion } from './estilos.js';

const ALCANCE = 40, VEL_GARRA = 260, ENFRIAR = 0.35, ENFRIAR_TIRON = 1.0, CUERPO = 1.0;
const CLAVE_RECORD = 'senku_vr_record';
const $ = (id) => document.getElementById(id);

// --- Render y escena ---------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.xr.enabled = true;
renderer.xr.setFoveation(1);
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.05, 500);
camera.rotation.order = 'YXZ';
camera.position.set(0, 1.6, 0);
const rig = new THREE.Group();
rig.add(camera);
scene.add(rig);
const mundo = crearMundo(scene);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// --- Estado ----------------------------------------------------------------------
const jugadora = { pos: { x: 0, y: CUERPO, z: 0 }, vel: { x: 0, y: 0, z: 0 }, enSuelo: true };
const cuerdas = [];
let jugando = false, inicio = null, fin = null, juntados = 0, reinicioEn = 0;
let vineta = true, yaw = 0, pitch = 0;
const leerRecord = () => { try { return Number(localStorage.getItem(CLAVE_RECORD)) || null; } catch { return null; } };
const guardarRecord = (s) => { try { localStorage.setItem(CLAVE_RECORD, String(s)); } catch { /* sin almacenamiento */ } };
let record = leerRecord();
const eleccion = leerEleccion(); // {cuerda, pata, comodo}
let menuAbierto = false, pausaDesde = 0, impulsando = 0;
const estiloCuerda = () => CUERDAS.find((c) => c.id === eleccion.cuerda) || CUERDAS[0];
const estiloPata = () => PATAS.find((p) => p.id === eleccion.pata) || PATAS[0];

// --- Garras de gato (Senku: atigrada gris con deditos rosas) -------------------
function crearGarra() {
  const g = new THREE.Group();
  const pelo = new THREE.MeshLambertMaterial({ color: 0xeeebe6 });
  const raya = new THREE.MeshLambertMaterial({ color: 0x777a82 });
  const rosa = new THREE.MeshLambertMaterial({ color: 0xf29bb0 });
  const unas = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x552233 });
  const esfera = new THREE.SphereGeometry(1, 14, 10);
  const pieza = (geo, mat, pos, esc) => { const m = new THREE.Mesh(geo, mat); m.position.set(...pos); if (esc) m.scale.set(...esc); g.add(m); return m; };
  pieza(esfera, pelo, [0, 0, 0], [0.055, 0.036, 0.062]);
  const brazo = new THREE.CylinderGeometry(0.042, 0.048, 0.26, 12).rotateX(Math.PI / 2);
  pieza(brazo, pelo, [0, 0.005, 0.15]);
  const anillo = new THREE.CylinderGeometry(0.0445, 0.0475, 0.022, 12).rotateX(Math.PI / 2);
  const anillos = [0, 1, 2, 3, 4].map((k) => pieza(anillo, raya, [0, 0.005, 0.07 + k * 0.045]));
  pieza(esfera, rosa, [0, -0.03, 0.01], [0.026, 0.012, 0.022]);
  const una = new THREE.ConeGeometry(0.0075, 0.05, 6);
  for (let k = 0; k < 4; k++) {
    const x = (k - 1.5) * 0.027, z = -0.056 + Math.abs(k - 1.5) * 0.008;
    pieza(esfera, pelo, [x, 0, z], [0.019, 0.017, 0.02]);
    pieza(esfera, rosa, [x, -0.015, z - 0.004], [0.009, 0.005, 0.009]);
    const u = pieza(una, unas, [x, 0.003, z - 0.03]);
    u.rotation.x = -Math.PI / 2 - 0.3;
  }
  g.userData = { unas, rosa, pelo, raya, anillos };
  return g;
}

function crearPanel(w, h, px = 512) {
  const c = document.createElement('canvas');
  c.width = px; c.height = Math.round(px * h / w);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false }));
  mesh.renderOrder = 998;
  const escribir = (lineas) => {
    const g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    g.fillStyle = 'rgba(40,24,60,0.82)';
    g.beginPath(); g.roundRect(4, 4, c.width - 8, c.height - 8, 28); g.fill();
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const alto = (c.height - 16) / lineas.length;
    lineas.forEach((t, i) => { g.font = `bold ${Math.round(alto * 0.62)}px system-ui, sans-serif`; g.fillText(t, c.width / 2, 8 + alto * (i + 0.5)); });
    tex.needsUpdate = true;
  };
  return { mesh, escribir };
}

const geoCuerda = new THREE.CylinderGeometry(0.02, 0.02, 1, 6).translate(0, 0.5, 0);
const geoGancho = new THREE.SphereGeometry(0.18, 10, 8);
const matGancho = new THREE.MeshBasicMaterial({ color: 0xff6f9a });
const matMira = new THREE.MeshBasicMaterial({ color: 0x7dffb0, depthTest: false, transparent: true, opacity: 0.85 });
const geoMira = new THREE.RingGeometry(0.25, 0.4, 16);

// Material de cuerda propio por mano (cada una repite su textura según su largo).
function materialCuerda(e) {
  const map = e.periodo ? new THREE.CanvasTexture(tramoCuerda(e.id)) : null;
  if (map) { map.wrapS = map.wrapT = THREE.RepeatWrapping; map.colorSpace = THREE.SRGBColorSpace; }
  return new THREE.MeshBasicMaterial({
    color: map ? 0xffffff : e.color, map, transparent: e.id === 'telarana' || !!e.brilla,
    blending: e.brilla ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !e.brilla,
  });
}

function aplicarEstilos() {
  const e = estiloCuerda(), p = estiloPata();
  matGancho.color.set(e.gancho);
  for (const m of manos) {
    m.linea.material.map?.dispose(); m.linea.material.dispose();
    m.linea.material = materialCuerda(e);
    const u = m.garra.userData;
    u.pelo.color.setHex(p.pelo); u.pelo.emissive.setHex(p.metal || 0);
    u.raya.color.setHex(p.raya);
    u.rosa.emissive.setHex(p.brillo || 0);
    u.anillos.forEach((a, k) => { a.visible = p.rayas.includes(k); });
  }
}

const manos = [0, 1].map((i) => {
  const m = {
    i, lado: i === 0 ? 'left' : 'right', garra: crearGarra(), cuerda: null, lanzando: null, destello: 0,
    enfriar: 0, enfriarTiron: 0, apretado: false, gamepad: null, botones: [],
    soporte: new THREE.Object3D(), control: renderer.xr.getController(i), grip: renderer.xr.getControllerGrip(i), manoAntes: null, vibroImp: 0,
    linea: new THREE.Mesh(geoCuerda, materialCuerda(estiloCuerda())), gancho: new THREE.Mesh(geoGancho, matGancho), mira: new THREE.Mesh(geoMira, matMira),
  };
  m.soporte.position.set(i === 0 ? -0.2 : 0.2, -0.2, -0.38);
  m.soporte.rotation.set(0.15, i === 0 ? -0.1 : 0.1, 0);
  m.soporte.add(m.garra);
  camera.add(m.soporte);
  m.linea.frustumCulled = false;
  m.mira.renderOrder = 997;
  scene.add(m.linea, m.gancho, m.mira);
  m.linea.visible = m.gancho.visible = m.mira.visible = false;
  m.control.addEventListener('connected', (e) => { m.gamepad = e.data.gamepad; m.lado = e.data.handedness; colocarHUD(); });
  m.control.addEventListener('disconnected', () => { m.gamepad = null; });
  m.control.addEventListener('selectstart', () => disparar(m));
  m.control.addEventListener('selectend', () => soltarMano(m));
  m.control.addEventListener('squeezestart', () => tirar(m));
  rig.add(m.control, m.grip);
  return m;
});

// HUD: en VR va en la muñeca izquierda; sin visor, en HTML.
const hud = crearPanel(0.17, 0.085, 384);
hud.mesh.position.set(0, 0.05, 0.16);
hud.mesh.rotation.x = -1.0;
const aviso = crearPanel(1.4, 0.35);
aviso.mesh.position.set(0, 0.1, -2);
aviso.mesh.visible = false;
camera.add(aviso.mesh);
let avisoHasta = 0;
function colocarHUD() {
  const m = manos.find((x) => x.lado === 'left') || manos[0];
  m.garra.add(hud.mesh);
  hud.mesh.visible = renderer.xr.isPresenting;
}

// Viñeta anti-mareo: se cierra con la velocidad.
const matVineta = new THREE.ShaderMaterial({
  transparent: true, depthTest: false, depthWrite: false, uniforms: { f: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform float f; varying vec2 vUv;
    void main(){ float r = length(vUv - 0.5) * 2.0; float a = mix(1.25, 0.5, f);
      gl_FragColor = vec4(0.06, 0.03, 0.1, smoothstep(a, a + 0.35, r) * min(1.0, f * 3.0)); }`,
});
const malla = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), matVineta);
malla.position.z = -0.15;
malla.renderOrder = 999;
malla.frustumCulled = false;
camera.add(malla);

// --- Churus ----------------------------------------------------------------------
const texChuru = new THREE.TextureLoader().load('../v2/assets/objetos/churu.png');
texChuru.colorSpace = THREE.SRGBColorSpace;
const brillo = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,240,150,0.9)'); gr.addColorStop(1, 'rgba(255,180,80,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false });
})();
const matChuru = new THREE.SpriteMaterial({ map: texChuru });
const churus = mundo.churus.map((p, k) => {
  const g = new THREE.Group();
  const halo = new THREE.Sprite(brillo); halo.scale.set(2.6, 2.6, 1);
  const s = new THREE.Sprite(matChuru); s.scale.set(0.5, 1.33, 1);
  g.add(halo, s);
  g.position.copy(p);
  g.userData = { base: p.y, fase: k };
  scene.add(g);
  return g;
});

// --- Garras: lanzar, columpiarse, soltar, tirón ----------------------------------
const raycaster = new THREE.Raycaster();
raycaster.far = ALCANCE;
const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), q = new THREE.Quaternion();
const ARRIBA = new THREE.Vector3(0, 1, 0);

function rayo(m, origen, dir) {
  if (renderer.xr.isPresenting) {
    m.control.getWorldPosition(origen);
    dir.set(0, 0, -1).applyQuaternion(m.control.getWorldQuaternion(q));
  } else {
    camera.getWorldPosition(origen);
    camera.getWorldDirection(dir);
  }
}

function golpe(origen, dir) {
  raycaster.set(origen, dir);
  return raycaster.intersectObject(mundo.edificios, false)[0]?.point || null;
}

// Ayuda de puntería para niños: si falla, prueba un conito alrededor.
function buscarAncla(origen, dir) {
  const der = new THREE.Vector3().crossVectors(dir, ARRIBA).normalize();
  const arr = new THREE.Vector3().crossVectors(der, dir);
  for (const [a, b] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const d = dir.clone().addScaledVector(der, a * 0.07).addScaledVector(arr, b * 0.07).normalize();
    const p = golpe(origen, d);
    if (p) return p.clone();
  }
  return null;
}

const vibrar = (m, fuerza, ms) => m.gamepad?.hapticActuators?.[0]?.pulse?.(fuerza, ms);
const empezar = () => { if (inicio === null) inicio = performance.now(); };

function disparar(m) {
  m.apretado = true;
  if (menuAbierto) { if (m.hover) activar(m.hover); return; }
  if (!jugando || m.enfriar > 0 || m.lanzando || m.cuerda) return;
  empezar();
  const o = new THREE.Vector3(), d = new THREE.Vector3();
  rayo(m, o, d);
  const p = buscarAncla(o, d);
  m.lanzando = { objetivo: p || o.clone().addScaledVector(d, ALCANCE), acierta: !!p, t: 0, dist: p ? o.distanceTo(p) : ALCANCE };
  sonar.lanzar(eleccion.cuerda);
  vibrar(m, 0.3, 20);
}

function soltarMano(m) {
  m.apretado = false;
  if (!m.cuerda) return;
  cuerdas.splice(cuerdas.indexOf(m.cuerda), 1);
  m.cuerda = null;
  soltar(jugadora);
  m.enfriar = ENFRIAR;
}

function tirar(m) {
  if (!jugando || m.enfriarTiron > 0) return;
  let punto = m.cuerda?.ancla;
  if (!punto) {
    const o = new THREE.Vector3(), d = new THREE.Vector3();
    rayo(m, o, d);
    punto = buscarAncla(o, d);
    if (!punto) { sonar.fallo(); return; }
    m.destello = 0.18; m.puntoDestello = punto;
  }
  empezar();
  tiron(jugadora, punto);
  m.enfriarTiron = ENFRIAR_TIRON;
  sonar.tiron();
  vibrar(m, 0.8, 60);
}

function saltar() {
  if (!jugando || !jugadora.enSuelo) return;
  jugadora.vel.y = 7.5;
  empezar();
}

function dibujarLinea(m, desde, hasta) {
  v3.subVectors(hasta, desde);
  const l = v3.length();
  m.linea.position.copy(desde);
  m.linea.quaternion.setFromUnitVectors(ARRIBA, v3.divideScalar(l || 1));
  const e = estiloCuerda(), mapa = m.linea.material.map;
  m.linea.scale.set(e.grosor, l, e.grosor);
  if (mapa) { mapa.repeat.set(1, l / e.periodo); if (e.brilla) mapa.offset.y = -performance.now() / 400; }
  m.linea.visible = m.gancho.visible = true;
  m.gancho.position.copy(hasta);
}

function actualizarMano(m, dt) {
  m.enfriar = Math.max(0, m.enfriar - dt);
  m.enfriarTiron = Math.max(0, m.enfriarTiron - dt);
  m.destello = Math.max(0, m.destello - dt);
  const listo = m.enfriar === 0;
  m.garra.userData.unas.color.setHex(listo ? 0xffffff : 0x6d6d6d);
  m.garra.userData.unas.emissive.setHex(listo ? 0x552233 : 0x000000);
  m.garra.userData.rosa.color.setHex(estiloPata().rosa);
  if (m.enfriarTiron > 0) m.garra.userData.rosa.color.multiplyScalar(0.55);

  m.garra.getWorldPosition(v1); // la cuerda sale de la zarpa
  m.linea.visible = m.gancho.visible = false;
  if (m.lanzando) {
    const L = m.lanzando;
    L.t += dt;
    const p = Math.min(1, (L.t * VEL_GARRA) / L.dist);
    dibujarLinea(m, v1, v2.lerpVectors(v1, L.objetivo, p));
    if (p >= 1) {
      m.lanzando = null;
      if (L.acierta && m.apretado) {
        m.cuerda = crearCuerda(jugadora.pos, L.objetivo);
        cuerdas.push(m.cuerda);
        if (jugadora.enSuelo) jugadora.vel.y += 7; // salto de arranque: el columpio empieza en el aire
        sonar.enganchar(eleccion.cuerda);
        vibrar(m, 0.6, 40);
      } else {
        if (!L.acierta) sonar.fallo();
        m.enfriar = ENFRIAR * 0.5;
      }
    }
  } else if (m.cuerda) {
    dibujarLinea(m, v1, v2.set(m.cuerda.ancla.x, m.cuerda.ancla.y, m.cuerda.ancla.z));
  } else if (m.destello > 0) {
    dibujarLinea(m, v1, m.puntoDestello);
  }

  // Mira: dónde se engancharía la garra ahora mismo (en VR, una por mano; sin visor, la de en medio).
  m.mira.visible = false;
  if (!m.cuerda && !m.lanzando && (renderer.xr.isPresenting || m.i === 0)) {
    const o = new THREE.Vector3(), d = new THREE.Vector3();
    rayo(m, o, d);
    const p = golpe(o, d);
    if (p) {
      m.mira.visible = true;
      m.mira.position.copy(p);
      m.mira.lookAt(o);
      m.mira.scale.setScalar(0.5 + o.distanceTo(p) * 0.04);
    }
    if (!renderer.xr.isPresenting) $('mira').classList.toggle('lista', !!p);
  }
}

// --- Controles -------------------------------------------------------------------
const teclas = new Set();
let jalarHasta = 0, jalarToque = false;
const jalandoSinVisor = () => teclas.has('KeyF') || jalarToque || performance.now() < jalarHasta;
const joystick = { x: 0, y: 0 };
let giroArmado = true;
const empuje = { x: 0, y: 0, z: 0 };

function girar(ang) {
  camera.getWorldPosition(v1);
  rig.rotation.y += ang;
  rig.updateMatrixWorld(true);
  camera.getWorldPosition(v2);
  jugadora.pos.x += v1.x - v2.x;
  jugadora.pos.z += v1.z - v2.z;
}

function leerControles(dt) {
  let mx = 0, my = 0; // x = derecha, y = adelante
  if (renderer.xr.isPresenting) {
    for (const m of manos) {
      const gp = m.gamepad;
      if (!gp) continue;
      const ax = gp.axes[2] || 0, ay = gp.axes[3] || 0;
      const pulsado = (k) => !!gp.buttons[k]?.pressed;
      const nuevo = (k) => pulsado(k) && !m.botones[k];
      if (m.lado === 'left') { mx += ax; my -= ay; }
      else if (!eleccion.comodo) { if (Math.abs(ax) > 0.2) girar(-ax * 2.2 * dt); } // giro suave
      else if (Math.abs(ax) > 0.7 && giroArmado) { girar(-Math.sign(ax) * Math.PI / 6); giroArmado = false; } // giro por pasos
      else if (Math.abs(ax) < 0.3) giroArmado = true;
      if (nuevo(4)) saltar();      // A / X
      if (nuevo(5)) alternarMenu(); // B / Y
      m.botones = gp.buttons.map((b) => b.pressed);
    }
  } else {
    mx = (teclas.has('KeyD') ? 1 : 0) - (teclas.has('KeyA') ? 1 : 0) + joystick.x;
    my = (teclas.has('KeyW') ? 1 : 0) - (teclas.has('KeyS') ? 1 : 0) + joystick.y;
  }
  const l = Math.hypot(mx, my);
  if (l > 1) { mx /= l; my /= l; }
  if (l > 0.15) empezar();
  camera.getWorldDirection(v1);
  v1.y = 0; v1.normalize();
  v2.crossVectors(v1, ARRIBA);
  const a = l > 0.15 ? (jugadora.enSuelo ? 45 : 9) : 0;
  empuje.x = (v1.x * my + v2.x * mx) * a;
  empuje.z = (v1.z * my + v2.z * mx) * a;
}

function alternarVineta() {
  vineta = !vineta;
  $('vineta').checked = vineta;
  mostrarAviso([vineta ? 'Sombra anti-mareo: SÍ' : 'Sombra anti-mareo: NO']);
}

addEventListener('keydown', (e) => {
  teclas.add(e.code);
  if (e.repeat) return;
  if (e.code === 'Space') { saltar(); e.preventDefault(); }
  if (e.code === 'KeyQ') tirar(manos[0]);
  if (e.code === 'KeyE') tirar(manos[1]);
  if (e.code === 'KeyV') alternarVineta();
  if (e.code === 'KeyM') alternarMenu();
  if (e.code === 'Escape' && menuAbierto) cerrarMenu();
});
// Rueda del ratón = un jalón corto.
addEventListener('wheel', () => { if (jugando && !menuAbierto) jalarHasta = performance.now() + 180; }, { passive: true });
addEventListener('keyup', (e) => teclas.delete(e.code));
addEventListener('blur', () => teclas.clear());

const lienzo = renderer.domElement;
lienzo.addEventListener('contextmenu', (e) => e.preventDefault());
lienzo.addEventListener('mousedown', (e) => {
  if (!jugando || menuAbierto || renderer.xr.isPresenting) return;
  if (document.pointerLockElement !== lienzo) lienzo.requestPointerLock?.()?.catch?.(() => {});
  if (e.button === 0) disparar(manos[0]);
  if (e.button === 2) disparar(manos[1]);
});
addEventListener('mouseup', (e) => {
  if (e.button === 0) soltarMano(manos[0]);
  if (e.button === 2) soltarMano(manos[1]);
});
addEventListener('mousemove', (e) => {
  if (document.pointerLockElement === lienzo) mirar(e.movementX, e.movementY, 0.0022);
});
function mirar(dx, dy, k) {
  yaw -= dx * k;
  pitch = Math.max(-1.45, Math.min(1.45, pitch - dy * k));
}

// Táctil: mitad izquierda = caminar, mitad derecha = mirar; botones para garras.
const toques = new Map();
lienzo.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch') return;
  toques.set(e.pointerId, { x: e.clientX, y: e.clientY, mover: e.clientX < innerWidth / 2 });
});
lienzo.addEventListener('pointermove', (e) => {
  const t = toques.get(e.pointerId);
  if (!t) return;
  if (t.mover) { joystick.x = Math.max(-1, Math.min(1, (e.clientX - t.x) / 50)); joystick.y = Math.max(-1, Math.min(1, -(e.clientY - t.y) / 50)); }
  else { mirar(e.clientX - t.x, e.clientY - t.y, 0.005); t.x = e.clientX; t.y = e.clientY; }
});
const finToque = (e) => { const t = toques.get(e.pointerId); if (t?.mover) joystick.x = joystick.y = 0; toques.delete(e.pointerId); };
lienzo.addEventListener('pointerup', finToque);
lienzo.addEventListener('pointercancel', finToque);
const boton = (id, abajo, arriba) => {
  const b = $(id);
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); abajo(); });
  if (arriba) for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(ev, arriba);
};
boton('t-izq', () => disparar(manos[0]), () => soltarMano(manos[0]));
boton('t-der', () => disparar(manos[1]), () => soltarMano(manos[1]));
boton('t-tiron', () => tirar(manos[0]));
boton('t-saltar', saltar);
boton('t-jalar', () => { jalarToque = true; }, () => { jalarToque = false; });
$('t-menu').addEventListener('click', () => alternarMenu());

// --- HUD y avisos ----------------------------------------------------------------
const reloj = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
function mostrarAviso(lineas, seg = 2.5) {
  aviso.escribir(lineas);
  aviso.mesh.visible = renderer.xr.isPresenting;
  avisoHasta = performance.now() + seg * 1000;
  $('aviso').textContent = lineas.join(' · ');
  $('aviso').hidden = false;
}
let hudTexto = '';
function actualizarHUD() {
  const t = inicio === null ? 0 : (fin ?? performance.now()) - inicio;
  const lineas = [`Churus ${juntados}/${churus.length}`, `Tiempo ${reloj(t)}`, record ? `Récord ${reloj(record)}` : 'Récord: -'];
  const texto = lineas.join('|');
  if (texto === hudTexto) return;
  hudTexto = texto;
  hud.escribir(lineas);
  $('hud').innerHTML = lineas.map((l) => `<div>${l}</div>`).join('');
}

function recogerChurus(t) {
  v1.set(jugadora.pos.x, jugadora.pos.y + 0.4, jugadora.pos.z);
  for (const c of churus) {
    if (!c.visible) continue;
    c.position.y = c.userData.base + Math.sin(t * 2 + c.userData.fase) * 0.25;
    if (c.position.distanceTo(v1) > 2.2) continue;
    c.visible = false;
    juntados++;
    sonar.churu();
    manos.forEach((m) => vibrar(m, 0.5, 50));
    empezar();
    if (juntados === churus.length) {
      fin = performance.now();
      const ms = fin - inicio;
      const nuevo = !record || ms < record;
      if (nuevo) { record = ms; guardarRecord(ms); sonar.record(); }
      mostrarAviso(['¡Todos los churus!', nuevo ? `¡Nuevo récord! ${reloj(ms)}` : `Tiempo ${reloj(ms)}`], 5);
      reinicioEn = fin + 6000;
    } else if (juntados === 1 || juntados % 5 === 0) {
      mostrarAviso([`¡Churu! ${juntados}/${churus.length}`], 1.5);
    }
  }
}

function reiniciarRonda() {
  churus.forEach((c) => { c.visible = true; });
  juntados = 0; inicio = null; fin = null; reinicioEn = 0;
  mostrarAviso(['¡Nueva ronda! Junta los churus']);
}

// --- Impulso con el brazo ------------------------------------------------------
// En VR: velocidad de la mano = cambio de la posición del grip relativa al rig
// (así no cuenta el vuelo del cuerpo), girada a orientación de mundo.
function impulsar(dt) {
  impulsando = Math.max(0, impulsando - dt);
  for (const m of manos) {
    let vm = null;
    if (renderer.xr.isPresenting) {
      if (m.manoAntes && dt > 0) vm = v1.subVectors(m.grip.position, m.manoAntes).divideScalar(dt).applyQuaternion(rig.quaternion);
      m.manoAntes = (m.manoAntes || new THREE.Vector3()).copy(m.grip.position);
    } else if (m.cuerda && jalandoSinVisor()) { // sin visor: como si la mano se alejara del ancla a 3.5 m/s
      vm = v1.set(jugadora.pos.x - m.cuerda.ancla.x, jugadora.pos.y - m.cuerda.ancla.y, jugadora.pos.z - m.cuerda.ancla.z).setLength(3.5);
    }
    if (!vm || !m.cuerda) continue;
    const a = impulsoBrazo(jugadora, vm, m.cuerda.ancla, dt);
    if (a === 0) continue;
    if (impulsando === 0) sonar.impulso();
    impulsando = 0.25;
    m.vibroImp -= dt;
    if (m.vibroImp <= 0) { vibrar(m, 0.15 + a / 100, 25); m.vibroImp = 0.08; }
  }
}

// --- Menú de garras (todo gratis) ---------------------------------------------
// En VR: panel 3D frente a la jugadora, se apunta con el rayo y se elige con el
// gatillo (la cuerda elegida sale hasta el botón como vista previa). Sin visor: HTML.
const MW = 1040, MH = 640;
const menuLienzo = Object.assign(document.createElement('canvas'), { width: MW, height: MH });
const menuTex = new THREE.CanvasTexture(menuLienzo);
menuTex.colorSpace = THREE.SRGBColorSpace;
const menuMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3 * MH / MW), new THREE.MeshBasicMaterial({ map: menuTex, transparent: true, depthTest: false }));
menuMesh.renderOrder = 1000;
menuMesh.visible = false;
scene.add(menuMesh);

const botonesMenu = [];
const fila = (lista, tipo, y, muestra) => lista.forEach((e, k) => botonesMenu.push({ tipo, id: e.id, texto: e.nombre, x: 21 + k * 202, y, w: 190, h: 190, img: muestra(e.id, 120) }));
fila(CUERDAS, 'cuerda', 100, muestraCuerda);
fila(PATAS, 'pata', 340, muestraPata);
[['comodo', 'Modo cómodo'], ['sombra', 'Sombra'], ['listo', '¡Listo!']].forEach(([tipo, texto], k) => botonesMenu.push({ tipo, texto, x: 21 + k * 340, y: 545, w: 318, h: 80 }));

const elegido = (b) => (b.tipo === 'cuerda' && eleccion.cuerda === b.id) || (b.tipo === 'pata' && eleccion.pata === b.id) || (b.tipo === 'comodo' && eleccion.comodo) || (b.tipo === 'sombra' && vineta);
function dibujarMenu() {
  const g = menuLienzo.getContext('2d');
  g.clearRect(0, 0, MW, MH);
  g.fillStyle = 'rgba(42,24,64,0.94)'; g.beginPath(); g.roundRect(0, 0, MW, MH, 36); g.fill();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
  g.font = 'bold 44px system-ui, sans-serif'; g.fillText('Garras de Senku', MW / 2, 40);
  g.font = 'bold 26px system-ui, sans-serif'; g.fillStyle = '#ffd27a';
  g.fillText('Cuerda', MW / 2, 82); g.fillText('Pata', MW / 2, 322);
  const hover = new Set(manos.map((m) => m.hover));
  for (const b of botonesMenu) {
    g.fillStyle = hover.has(b) ? '#7a4f9a' : '#4a3168';
    g.beginPath(); g.roundRect(b.x, b.y, b.w, b.h, 22); g.fill();
    if (elegido(b)) { g.strokeStyle = '#ff6f9a'; g.lineWidth = 10; g.stroke(); }
    g.fillStyle = '#fff';
    if (b.img) { g.drawImage(b.img, b.x + 35, b.y + 8); g.font = 'bold 28px system-ui, sans-serif'; g.fillText(b.texto, b.x + b.w / 2, b.y + 160); }
    else { g.font = 'bold 34px system-ui, sans-serif'; g.fillText(b.tipo === 'listo' ? b.texto : `${b.texto}: ${elegido(b) ? 'SÍ' : 'NO'}`, b.x + b.w / 2, b.y + b.h / 2); }
  }
  menuTex.needsUpdate = true;
}

function actualizarMenuVR() {
  let cambio = false;
  for (const m of manos) {
    const o = new THREE.Vector3(), d = new THREE.Vector3();
    rayo(m, o, d);
    raycaster.set(o, d);
    const h = raycaster.intersectObject(menuMesh, false)[0];
    const x = h && h.uv.x * MW, y = h && (1 - h.uv.y) * MH;
    const b = h ? botonesMenu.find((k) => x >= k.x && x <= k.x + k.w && y >= k.y && y <= k.y + k.h) || null : null;
    if (b !== m.hover) { m.hover = b; cambio = true; if (b) vibrar(m, 0.1, 10); }
    m.mira.visible = false;
    m.linea.visible = m.gancho.visible = false;
    if (h) { m.garra.getWorldPosition(v1); dibujarLinea(m, v1, h.point); }
  }
  if (cambio) dibujarMenu();
}

// Menú HTML (compu, celular y pantalla de inicio): mismos botones y dibujos.
const menuHTML = $('menu');
for (const [tipo, lista, muestra] of [['cuerda', CUERDAS, muestraCuerda], ['pata', PATAS, muestraPata]]) {
  const cont = $(`menu-${tipo}`);
  for (const e of lista) {
    const b = document.createElement('button');
    b.className = 'opcion'; b.dataset.tipo = tipo; b.dataset.id = e.id;
    b.innerHTML = `<img alt="" src="${muestra(e.id, 96).toDataURL()}"><span>${e.nombre}</span>`;
    b.addEventListener('click', () => activar({ tipo, id: e.id }));
    cont.append(b);
  }
}
$('menu-comodo').addEventListener('change', () => activar({ tipo: 'comodo' }));
$('menu-listo').addEventListener('click', () => cerrarMenu());

function sincronizarMenu() {
  for (const b of menuHTML.querySelectorAll('.opcion')) b.classList.toggle('elegida', eleccion[b.dataset.tipo] === b.dataset.id);
  $('menu-comodo').checked = eleccion.comodo;
  $('vineta').checked = vineta;
  dibujarMenu();
}

function activar(b) {
  if (b.tipo === 'cuerda') { eleccion.cuerda = b.id; iniciarSonido(); sonar.enganchar(b.id); }
  else if (b.tipo === 'pata') eleccion.pata = b.id;
  else if (b.tipo === 'comodo') eleccion.comodo = !eleccion.comodo;
  else if (b.tipo === 'sombra') vineta = !vineta;
  else if (b.tipo === 'listo') { cerrarMenu(); return; }
  manos.forEach((m) => vibrar(m, 0.3, 20));
  guardarEleccion(eleccion);
  aplicarEstilos();
  sincronizarMenu();
}

function abrirMenu() {
  if (menuAbierto) return;
  menuAbierto = true;
  pausaDesde = performance.now();
  sincronizarMenu();
  if (renderer.xr.isPresenting) {
    camera.getWorldPosition(v1); camera.getWorldDirection(v2);
    v2.y = 0; v2.normalize();
    menuMesh.position.copy(v1).addScaledVector(v2, 1.2);
    menuMesh.position.y -= 0.1;
    menuMesh.lookAt(v1.x, menuMesh.position.y, v1.z);
    menuMesh.visible = true;
  } else {
    menuHTML.hidden = false;
    if (document.pointerLockElement) document.exitPointerLock();
  }
}

function cerrarMenu() {
  if (!menuAbierto) return;
  menuAbierto = false;
  const pausa = performance.now() - pausaDesde; // el reloj no corre con el menú abierto
  if (inicio !== null && fin === null) inicio += pausa;
  if (reinicioEn) reinicioEn += pausa;
  menuMesh.visible = false;
  menuHTML.hidden = true;
  manos.forEach((m) => { m.hover = null; m.manoAntes = null; });
  clock.getDelta();
  if (jugando && !renderer.xr.isPresenting && !matchMedia('(pointer: coarse)').matches) lienzo.requestPointerLock?.()?.catch?.(() => {});
}
const alternarMenu = () => (menuAbierto ? cerrarMenu() : abrirMenu());
$('abrir-menu').addEventListener('click', abrirMenu);
aplicarEstilos();

// --- Bucle -----------------------------------------------------------------------
const clock = new THREE.Clock();
let fuerzaVineta = 0;
function actualizar(dt) {
  const ahora = performance.now();
  leerControles(dt);
  impulsar(dt);
  for (let k = 0; k < 2; k++) paso(jugadora, cuerdas, dt / 2, { empuje, cajas: mundo.cajas });
  rig.position.set(jugadora.pos.x, jugadora.pos.y - CUERPO, jugadora.pos.z);
  if (!renderer.xr.isPresenting) camera.rotation.set(pitch, yaw, 0);
  rig.updateMatrixWorld(true);
  manos.forEach((m) => actualizarMano(m, dt));
  recogerChurus(ahora / 1000);
  if (reinicioEn && ahora > reinicioEn) reiniciarRonda();
  if (avisoHasta && ahora > avisoHasta) { aviso.mesh.visible = false; $('aviso').hidden = true; avisoHasta = 0; }

  const rapidez = Math.hypot(jugadora.vel.x, jugadora.vel.y, jugadora.vel.z);
  // Viñeta: el modo cómodo la fuerza y la cierra antes; también al impulsarse.
  let meta = 0;
  if (eleccion.comodo) meta = Math.min(0.95, Math.max(0, (rapidez - 3) / 10));
  else if (vineta) meta = Math.min(0.9, Math.max(0, (rapidez - 4) / 14));
  if (impulsando > 0 && (eleccion.comodo || vineta)) meta = Math.max(meta, eleccion.comodo ? 0.75 : 0.55);
  fuerzaVineta += (meta - fuerzaVineta) * Math.min(1, dt * 4);
  matVineta.uniforms.f.value = fuerzaVineta;
  malla.visible = fuerzaVineta > 0.01;
  sonar.viento(rapidez);
  actualizarHUD();
}

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 1 / 30);
  if (menuAbierto) { if (renderer.xr.isPresenting) actualizarMenuVR(); }
  else if (jugando) actualizar(dt);
  renderer.render(scene, camera);
});

// --- Inicio y VR -----------------------------------------------------------------
function jugar() {
  iniciarSonido();
  vineta = $('vineta').checked;
  jugando = true;
  $('inicio').hidden = true;
  document.body.classList.add('jugando');
  if (matchMedia('(pointer: coarse)').matches) document.body.classList.add('tactil');
  actualizarHUD();
}

$('vineta').addEventListener('change', (e) => { vineta = e.target.checked; });
$('sin-visor').addEventListener('click', () => {
  jugar();
  if (!matchMedia('(pointer: coarse)').matches) lienzo.requestPointerLock?.()?.catch?.(() => {});
});

// Botón propio en español (equivale a VRButton de three).
const botonVR = $('entrar-vr');
let sesion = null;
navigator.xr?.isSessionSupported('immersive-vr').then((ok) => {
  botonVR.disabled = !ok;
  if (!ok) $('sin-vr').hidden = false;
}).catch(() => { $('sin-vr').hidden = false; });
if (!navigator.xr) { botonVR.disabled = true; $('sin-vr').hidden = false; }

botonVR.addEventListener('click', async () => {
  if (sesion) { sesion.end(); return; }
  try {
    const s = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor'] });
    renderer.xr.setReferenceSpaceType('local-floor');
    await renderer.xr.setSession(s);
    sesion = s;
    rig.rotation.y = yaw;
    jugar();
    manos.forEach((m) => m.control.add(m.garra));
    colocarHUD();
    s.addEventListener('end', () => {
      sesion = null;
      rig.rotation.y = 0;
      camera.position.set(0, 1.6, 0);
      manos.forEach((m) => m.soporte.add(m.garra));
      colocarHUD();
      aviso.mesh.visible = false;
      cerrarMenu();
    });
  } catch (err) {
    $('sin-vr').hidden = false;
    $('sin-vr').textContent = 'No se pudo entrar en VR: ' + err.message;
  }
});

// Para pruebas desde la consola: senku.disparar(0), senku.soltar(0)...
window.senku = { jugadora, manos, churus, eleccion, abrirMenu, cerrarMenu, menuLienzo, activar, disparar: (i) => disparar(manos[i]), soltar: (i) => soltarMano(manos[i]), tirar: (i) => tirar(manos[i]), mirar: (y, p) => { yaw = y; pitch = p; } };
