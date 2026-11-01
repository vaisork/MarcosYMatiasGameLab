// Senku VR: eres Senku, una gatita con garras que se columpia por la ciudad.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { paso, crearCuerda, soltar, tiron, impulsoBrazo, resolverCajas, IMPULSO, AJUSTES } from './fisica.mjs';
import { TIPOS, ZARPAZO, VIDA, crearEnemigo, golpear, esZarpazo, pasoEnemigo, tocaEnemigo, crearVida, recibirDano, tocaPared, escalar, soltarEscalada } from './enemigos.mjs';
import { crearMundo, CUADRA } from './mundo.js';
import { iniciarSonido, sonar } from './sonido.js';
import { NOMBRE_PODER, PODER, CLAVE_PODER, crearBarra, barraLlena, cargarBarra, dispararPoder, masCercano, crearRatoncito, pasoRatoncito, tocaRatoncito } from './poder.mjs';
import { CUERDAS, PATAS, tramoCuerda, muestraCuerda, muestraPata, leerEleccion, guardarEleccion } from './estilos.js';

const ALCANCE = 40, VEL_GARRA = 260, ENFRIAR = 0.35, ENFRIAR_TIRON = 1.0, CUERPO = 1.0;
const CLAVE_RECORD = 'senku_vr_record', CLAVE_TOTAL = 'senku_vr_churus_total';
const ENEMIGOS_MAX = 24, REAPARECER = 3; // Matías pidió más ratones (antes 12 y 5 s)
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
const leerTotal = () => { try { return Number(localStorage.getItem(CLAVE_TOTAL)) || 0; } catch { return 0; } };
let totalChurus = leerTotal(); // churus acumulados (para desbloquear cosas después)
const sumarChurus = (n) => { totalChurus += n; try { localStorage.setItem(CLAVE_TOTAL, String(totalChurus)); } catch { /* sin almacenamiento */ } };
const vida = crearVida();
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
  // Manchas (pata «Luke»): óvalos aplanados sobre el brazo y el dorso de la mano.
  const manchas = [[0.02, 0.043, 0.06, 0.024], [-0.025, 0.04, 0.13, 0.03], [0.015, 0.045, 0.2, 0.022], [-0.03, 0.025, 0.24, 0.018], [0.03, 0.03, 0.0, 0.02]]
    .map(([x, y, z, r]) => pieza(esfera, raya, [x, y, z], [r, 0.006, r * 1.3]));
  g.userData = { unas, rosa, pelo, raya, anillos, manchas };
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
const matMiraRaton = new THREE.MeshBasicMaterial({ color: 0xff5a5a, depthTest: false, transparent: true, opacity: 0.9 });
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
    u.manchas.forEach((a) => { a.visible = Boolean(p.manchas); });
  }
}

const manos = [0, 1].map((i) => {
  const m = {
    i, lado: i === 0 ? 'left' : 'right', garra: crearGarra(), cuerda: null, lanzando: null, destello: 0,
    enfriar: 0, enfriarTiron: 0, enfriarZarpazo: 0, apretado: false, gamepad: null, botones: [], presa: null, escalando: false, velMano: new THREE.Vector3(), deltaMano: new THREE.Vector3(),
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
  m.control.addEventListener('squeezestart', () => agarrar(m));
  m.control.addEventListener('squeezeend', () => soltarAgarre(m));
  rig.add(m.control, m.grip);
  return m;
});

// HUD: en VR va en la muñeca izquierda; sin visor, en HTML.
const hud = crearPanel(0.2, 0.1, 448);
hud.mesh.position.set(0, 0.05, 0.16);
hud.mesh.rotation.x = -1.0;
const aviso = crearPanel(1.4, 0.35);
aviso.mesh.position.set(0, 0.1, -2);
aviso.mesh.visible = false;
camera.add(aviso.mesh);
let avisoHasta = 0;
// Barrita del Ultra Gato en la muñeca, debajo del texto del HUD.
const matBarraFondo = new THREE.MeshBasicMaterial({ color: 0x2a1840, transparent: true, opacity: 0.85, depthTest: false });
const matBarra = new THREE.MeshBasicMaterial({ color: 0xffb13d, depthTest: false });
const barraVR = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.02), matBarraFondo);
const rellenoVR = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.012).translate(0.085, 0, 0), matBarra);
barraVR.position.set(0, -0.064, 0); barraVR.renderOrder = 998;
rellenoVR.position.set(-0.085, 0, 0.001); rellenoVR.renderOrder = 999;
barraVR.add(rellenoVR); hud.mesh.add(barraVR);
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
// Ratón apuntado (antes que el edificio de atrás): devuelve el enemigo o null.
// Se prueba contra una esfera por ratón (nada de triángulos: barato en el Quest).
function golpeEnemigo(origen, dir) {
  raycaster.set(origen, dir);
  let mejor = null, dist = ALCANCE;
  for (const e of enemigos) {
    if (e.estado !== 'camina' && e.estado !== 'golpeado') continue;
    esfera.set(posEnemigo(e), TIPOS[e.tipo].radio + 0.25);
    if (raycaster.ray.intersectSphere(esfera, v2) && origen.distanceTo(v2) < dist) { mejor = e; dist = origen.distanceTo(v2); }
  }
  if (!mejor) return null;
  const p = golpe(origen, dir);
  return p && origen.distanceTo(p) < dist ? null : mejor;
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
  const pe = golpeEnemigo(o, d);
  if (pe && !renderer.xr.isPresenting && o.distanceTo(posEnemigo(pe)) < 2.4) { golpearEnemigo(pe, m); return; } // sin visor: clic de cerca = zarpazo
  const p = pe ? posEnemigo(pe).clone() : buscarAncla(o, d);
  m.lanzando = { objetivo: p || o.clone().addScaledVector(d, ALCANCE), acierta: !!p, presa: pe, t: 0, dist: p ? o.distanceTo(p) : ALCANCE };
  sonar.lanzar(eleccion.cuerda);
  vibrar(m, 0.3, 20);
}

function soltarMano(m) {
  m.apretado = false;
  if (m.presa) { if (m.presa.estado === 'atrapado') m.presa.estado = 'camina'; m.presa = null; m.enfriar = ENFRIAR; }
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

// Botón de agarre: tirón si hay garra enganchada, jalar si atrapaste un ratón,
// escalar si la mano toca una pared; si no, el tirón de siempre hacia donde apuntas.
function agarrar(m) {
  if (!jugando || menuAbierto) return;
  if (m.cuerda) return tirar(m);
  if (m.presa) return jalarPresa(m);
  if (renderer.xr.isPresenting) {
    m.grip.getWorldPosition(v1);
    if (tocaPared(v1, mundo.cajas)) { m.escalando = true; empezar(); sonar.agarrar(); vibrar(m, 0.5, 30); return; }
  }
  tirar(m);
}
function soltarAgarre(m) {
  if (!m.escalando) return;
  m.escalando = false;
  if (!manos.some((x) => x.escalando)) { soltarEscalada(jugadora, m.velMano); if (jugadora.vel.y > 2) sonar.impulso(); }
}

// Sin visor: C frente a una pared te agarra; W/S sube y baja, A/D de lado, espacio salta.
let escaladaTeclado = false;
function alternarEscalada() {
  if (!jugando || menuAbierto) return;
  if (escaladaTeclado) { escaladaTeclado = false; return; }
  camera.getWorldPosition(v1); camera.getWorldDirection(v2);
  const p = golpe(v1, v2), caja = p && tocaPared(p, mundo.cajas, 0.1);
  if (!caja || v1.distanceTo(p) > 2.5) { mostrarAviso(['Acércate a una pared para escalar'], 1.5); sonar.fallo(); return; }
  escaladaTeclado = caja; empezar(); sonar.agarrar();
  v2.y = 0; v2.normalize(); // el cuerpo se pega a la pared (así al llegar arriba pisa la azotea)
  jugadora.pos.x = p.x - v2.x * 0.5; jugadora.pos.z = p.z - v2.z * 0.5;
}
const escalando = () => escaladaTeclado || manos.some((m) => m.escalando);

function saltar() {
  if (!jugando) return;
  if (escaladaTeclado) { escaladaTeclado = false; camera.getWorldDirection(v1); jugadora.vel.y = 7; jugadora.vel.x = -v1.x * 4; jugadora.vel.z = -v1.z * 4; return; }
  if (!jugadora.enSuelo) return;
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
      if (L.presa && L.presa.estado !== 'poof' && L.presa.estado !== 'muerto') { // atrapado: se queda quieto hasta que jales o sueltes
        if (m.apretado) { m.presa = L.presa; L.presa.estado = 'atrapado'; L.presa.t = 0; sonar.enganchar(eleccion.cuerda); vibrar(m, 0.6, 40); }
      } else if (L.acierta && m.apretado) {
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
  } else if (m.presa) {
    if (m.presa.estado !== 'atrapado') m.presa = null;
    else dibujarLinea(m, v1, posEnemigo(m.presa));
  } else if (m.cuerda) {
    dibujarLinea(m, v1, v2.set(m.cuerda.ancla.x, m.cuerda.ancla.y, m.cuerda.ancla.z));
  } else if (m.destello > 0) {
    dibujarLinea(m, v1, m.puntoDestello);
  }

  // Mira: dónde se engancharía la garra ahora mismo (en VR, una por mano; sin visor, la de en medio).
  m.mira.visible = false;
  if (!m.cuerda && !m.presa && !m.lanzando && (renderer.xr.isPresenting || m.i === 0)) {
    const o = new THREE.Vector3(), d = new THREE.Vector3();
    rayo(m, o, d);
    const pe = golpeEnemigo(o, d);
    const p = pe ? posEnemigo(pe) : golpe(o, d);
    if (p) {
      m.mira.visible = true;
      m.mira.material = pe ? matMiraRaton : matMira;
      m.mira.position.copy(p);
      m.mira.lookAt(o);
      m.mira.scale.setScalar(0.5 + o.distanceTo(p) * 0.04);
    }
    if (!renderer.xr.isPresenting) { $('mira').classList.toggle('lista', !!p); $('mira').classList.toggle('raton', !!pe); }
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
      if (nuevo(3)) lanzarPoder(m); // clic en la palanca (derecha; zurdas: cualquiera)
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
  if (e.code === 'KeyC') alternarEscalada();
  if (e.code === 'KeyR') lanzarPoder(manos[1]);
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
boton('t-poder', () => lanzarPoder(manos[1]));
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
  const lineas = ['♥'.repeat(vida.vida) + '♡'.repeat(VIDA.max - vida.vida) + `  Churus ${juntados}/${churus.length}`, `Total ${totalChurus} · Tiempo ${reloj(t)}`, record ? `Récord ${reloj(record)}` : 'Récord: -'];
  const texto = lineas.join('|') + barra.carga;
  if (texto === hudTexto) return;
  hudTexto = texto;
  hud.escribir(lineas);
  const llena = barraLlena(barra);
  $('poder-relleno').style.width = `${(barra.carga / PODER.lleno) * 100}%`;
  $('poder').classList.toggle('lleno', llena); $('t-poder').classList.toggle('lleno', llena);
  rellenoVR.scale.x = Math.max(0.001, barra.carga / PODER.lleno);
  $('hud-texto').innerHTML = lineas.map((l) => `<div>${l}</div>`).join('');
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

// --- Ratones enemigos (v3) ------------------------------------------------------
// Cada GLB se carga una vez; cada ratón es un clon que comparte geometría y
// textura (Lambert solo con color: barato en el Quest). Máximo ENEMIGOS_MAX.
const enemigosGrupo = new THREE.Group();
scene.add(enemigosGrupo);
const enemigos = [];
const vE = new THREE.Vector3(), esfera = new THREE.Sphere();
const posEnemigo = (e) => vE.set(e.pos.x, e.pos.y + 0.3, e.pos.z);
const matPip = new THREE.SpriteMaterial({ map: (() => {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const g = c.getContext('2d'); g.fillStyle = '#ff3b5c'; g.beginPath(); g.arc(16, 16, 12, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(12, 12, 4, 0, 7); g.fill();
  return new THREE.CanvasTexture(c);
})(), depthTest: false });
const matPoof = new THREE.SpriteMaterial({ map: (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'); g.fillStyle = 'rgba(255,255,255,0.9)';
  for (const [x, y, r] of [[32, 32, 18], [16, 36, 12], [48, 36, 12], [24, 20, 11], [40, 20, 11], [32, 48, 10]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  return new THREE.CanvasTexture(c);
})(), transparent: true, depthWrite: false });

// Dónde pueden aparecer: cruces de calles y azotetas anchas (no muy altas).
const nidos = [];
for (let i = -3; i < 3; i++) for (let j = -3; j < 3; j++) nidos.push({ x: (i + 0.5) * CUADRA, y: 0, z: (j + 0.5) * CUADRA, caja: null });
for (const c of mundo.cajas) if (c.max.y < 28 && c.max.x - c.min.x > 8 && c.max.z - c.min.z > 8) nidos.push({ x: (c.min.x + c.max.x) / 2, y: c.max.y, z: (c.min.z + c.max.z) / 2, caja: c });

const modelos = {};
async function cargarModelos() {
  const loader = new GLTFLoader();
  await Promise.all(Object.keys(TIPOS).map(async (tipo) => {
    const g = await loader.loadAsync(`modelos/${tipo === 'negro' ? 'raton_negro' : tipo === 'cafe' ? 'raton_cafe' : 'hamster'}.glb`);
    const malla = g.scene.getObjectByProperty('isMesh', true);
    malla.material = new THREE.MeshLambertMaterial({ map: malla.material.map });
    malla.geometry.computeBoundingBox();
    const b = malla.geometry.boundingBox;
    malla.geometry.translate(0, -b.min.y, 0); // origen en las patas
    modelos[tipo] = { geo: malla.geometry, mat: malla.material, alto: b.max.y - b.min.y };
  }));
  for (let k = 0; k < ENEMIGOS_MAX; k++) aparecer(k % 6 === 5 ? 'hamster' : k % 3 === 2 ? 'cafe' : 'negro');
}
cargarModelos().catch((err) => console.error('No se pudieron cargar los ratones', err));

function aparecer(tipo, viejo = null) {
  const lejos = nidos.filter((n) => Math.hypot(n.x - jugadora.pos.x, n.z - jugadora.pos.z) > 8 && !enemigos.some((e) => e.nido === n && e !== viejo));
  const nido = lejos[Math.floor(Math.random() * lejos.length)];
  if (!nido) return;
  const md = modelos[tipo], T = TIPOS[tipo];
  const e = viejo || crearEnemigo(tipo, nido, nido.caja);
  if (viejo) Object.assign(e, crearEnemigo(tipo, nido, nido.caja), { grupo: e.grupo, malla: e.malla, pips: e.pips, poof: e.poof });
  else {
    e.grupo = new THREE.Group();
    e.malla = new THREE.Mesh(md.geo, md.mat);
    e.malla.scale.setScalar(T.escala);
    e.pips = [0, 1, 2].slice(0, T.golpes).map((k) => { const s = new THREE.Sprite(matPip); s.scale.setScalar(0.16); s.position.set((k - (T.golpes - 1) / 2) * 0.18, md.alto * T.escala + 0.25, 0); return s; });
    e.poof = new THREE.Sprite(matPoof); e.poof.visible = false; e.poof.position.y = 0.4;
    e.grupo.add(e.malla, e.poof, ...e.pips);
    enemigosGrupo.add(e.grupo);
    enemigos.push(e);
  }
  e.nido = nido; e.fase = Math.random() * 6; e.murio = 0;
  e.grupo.visible = true; e.malla.scale.setScalar(T.escala); e.pips.forEach((p) => { p.visible = true; });
}

function golpearEnemigo(e, m, porPoder = false) {
  const r = golpear(e);
  if (!r) return;
  if (m) { if (m.presa === e) m.presa = null; vibrar(m, 0.9, r.vencido ? 120 : 60); }
  empezar();
  e.pips.forEach((p, k) => { p.visible = k < e.golpes; });
  if (r.vencido) {
    sonar.poof();
    e.murio = performance.now();
    e.poof.visible = true; e.poof.scale.setScalar(0.3);
    for (let k = 0; k < r.churus; k++) soltarChuru(e, k);
    // Los vencidos por los ratoncitos no recargan (si no, sería una cadena sin fin).
    const lista = !porPoder && cargarBarra(barra, e.tipo);
    if (!porPoder) guardarBarra();
    if (lista) {
      sonar.listo(); manos.forEach((x) => vibrar(x, 0.6, 80));
      mostrarAviso(['¡ULTRA GATO listo!', renderer.xr.isPresenting ? 'Aprieta la palanca' : matchMedia('(pointer: coarse)').matches ? 'Toca ⚡' : 'Tecla R'], 2.5);
    }
  } else { sonar.zarpazo(); sonar.chillido(); }
}

// Jalar la cuerda con un ratón atrapado: lo acerca de un brinco y lo golpea.
function jalarPresa(m) {
  const e = m.presa;
  if (!e) return;
  v1.set(jugadora.pos.x - e.pos.x, 0, jugadora.pos.z - e.pos.z);
  const d = v1.length();
  if (d > 2) { v1.multiplyScalar(1.5 / d); e.pos.x += v1.x; e.pos.z += v1.z; }
  sonar.tiron();
  golpearEnemigo(e, m);
  m.presa = null; m.enfriar = ENFRIAR;
}

// Churus que sueltan los ratones: vuelan hacia Senku y suman al total acumulado.
const voladores = [];
function soltarChuru(e, k) {
  let v = voladores.find((x) => !x.sprite.visible);
  if (!v) { v = { sprite: new THREE.Sprite(matChuru), desde: new THREE.Vector3(), t: 0 }; v.sprite.scale.set(0.35, 0.93, 1); scene.add(v.sprite); voladores.push(v); }
  v.desde.set(e.pos.x + (k - 1) * 0.4, e.pos.y + 0.6, e.pos.z); v.t = -k * 0.12;
  v.sprite.position.copy(v.desde); v.sprite.visible = true;
}
function actualizarVoladores(dt) {
  v2.set(jugadora.pos.x, jugadora.pos.y + 0.3, jugadora.pos.z);
  for (const v of voladores) {
    if (!v.sprite.visible) continue;
    v.t += dt / 0.8;
    const k = Math.max(0, v.t) ** 2;
    v.sprite.position.lerpVectors(v.desde, v2, Math.min(1, k));
    v.sprite.position.y += Math.sin(Math.min(1, k) * Math.PI) * 1.2;
    if (v.t >= 1) { v.sprite.visible = false; sumarChurus(1); sonar.churu(); manos.forEach((m) => vibrar(m, 0.3, 30)); }
  }
}

function actualizarEnemigos(dt, t) {
  vida.invulnerable = Math.max(0, vida.invulnerable - dt);
  actualizarVoladores(dt);
  for (const m of manos) m.enfriarZarpazo = Math.max(0, m.enfriarZarpazo - dt);
  const cabeza = { x: jugadora.pos.x, y: jugadora.pos.y, z: jugadora.pos.z };
  for (const e of enemigos) {
    const T = TIPOS[e.tipo];
    const camino = pasoEnemigo(e, cabeza, dt, mundo.cajas);
    e.grupo.position.set(e.pos.x, e.pos.y, e.pos.z);
    // Animación procedural: saltitos y balanceo al caminar, aplastarse al golpe, poof al vencer.
    const f = t * 9 + e.fase;
    e.grupo.rotation.y = e.dir;
    if (e.estado === 'camina') { e.grupo.position.y += camino ? Math.abs(Math.sin(f)) * 0.08 : Math.sin(f * 0.3) * 0.01; e.malla.rotation.z = camino ? Math.sin(f) * 0.12 : 0; e.malla.scale.set(T.escala, T.escala, T.escala); }
    else if (e.estado === 'atrapado') { e.malla.rotation.z = Math.sin(t * 40) * 0.2; e.malla.scale.set(T.escala, T.escala, T.escala); }
    else if (e.estado === 'golpeado') { const k = 1 - e.t / 0.35; e.malla.scale.set(T.escala * (1.3 - k * 0.3), T.escala * (0.5 + k * 0.5), T.escala); e.malla.rotation.z = 0; }
    else if (e.estado === 'poof') { const k = 1 - e.t / 0.3; e.malla.scale.setScalar(T.escala * (1 - k)); e.poof.scale.setScalar(0.5 + k * 2.2); e.poof.position.y = 0.4 + k * 0.8; }
    else if (e.estado === 'muerto') {
      e.poof.visible = false; e.grupo.visible = false;
      if (performance.now() - e.murio > REAPARECER * 1000) aparecer(e.tipo, e);
      continue;
    }
    // Zarpazo en VR: mano rápida cerca del ratón.
    if (renderer.xr.isPresenting && (e.estado === 'camina' || e.estado === 'atrapado')) {
      for (const m of manos) {
        if (m.enfriarZarpazo > 0) continue;
        m.garra.getWorldPosition(v1);
        if (esZarpazo(m.velMano.length(), v1, e.pos, TIPOS[e.tipo].radio * 0.5)) { m.enfriarZarpazo = ZARPAZO.enfriar; golpearEnemigo(e, m); }
      }
    }
    // Si te toca, pierdes un corazón y sales empujada.
    if (tocaEnemigo(e, cabeza) && recibirDano(vida)) {
      sonar.dano(); sonar.chillido();
      manos.forEach((m) => vibrar(m, 1, 150));
      v1.set(jugadora.pos.x - e.pos.x, 0, jugadora.pos.z - e.pos.z).normalize();
      jugadora.vel.x += v1.x * 6; jugadora.vel.z += v1.z * 6; jugadora.vel.y = Math.max(jugadora.vel.y, 4);
      e.estado = 'golpeado'; e.t = 0.6;
      if (vida.vida > 0) mostrarAviso([`¡Ay! Te quedan ${vida.vida} ${vida.vida === 1 ? 'corazón' : 'corazones'}`], 1.5);
      else reaparecer();
    }
  }
}

// Sin corazones: vuelves al inicio con tus churus (nada cruel).
function reaparecer() {
  jugadora.pos.x = 0; jugadora.pos.y = CUERPO; jugadora.pos.z = 0;
  jugadora.vel.x = jugadora.vel.y = jugadora.vel.z = 0;
  manos.forEach((m) => { soltarMano(m); m.escalando = false; });
  escaladaTeclado = false;
  Object.assign(vida, crearVida(), { invulnerable: 3 });
  mostrarAviso(['¡Ay! Los ratones te ganaron', 'Vuelves al inicio con tus churus'], 3);
}

// --- Ultra Gato (superpoder de Matías) -------------------------------------------
// Con la barrita llena sale una ráfaga de ratoncitos de cuerda que buscan al ratón
// enemigo más cercano; cada uno da 1 golpe. Los que no encuentran nada: confeti.
const barra = crearBarra((() => { try { return localStorage.getItem(CLAVE_PODER); } catch { return null; } })());
const guardarBarra = () => { try { localStorage.setItem(CLAVE_PODER, String(barra.carga)); } catch { /* sin almacenamiento */ } };
const ratoncitos = [], confetis = [];
const proto = (() => {
  const g = new THREE.Group();
  const gris = new THREE.MeshLambertMaterial({ color: 0x9aa0a8 }), rosa = new THREE.MeshLambertMaterial({ color: 0xf2a6b4 });
  const oro = new THREE.MeshLambertMaterial({ color: 0xffc83d, emissive: 0x6a4400 }), negro = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const esf = new THREE.SphereGeometry(1, 8, 6);
  const pieza = (geo, mat, pos, esc, padre = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(...pos); if (esc) m.scale.set(...esc); padre.add(m); return m; };
  pieza(esf, gris, [0, 0, 0], [0.1, 0.085, 0.15]); // cuerpo (la nariz mira a +z)
  pieza(new THREE.ConeGeometry(0.075, 0.13, 8).rotateX(Math.PI / 2), gris, [0, 0.01, 0.19]);
  pieza(esf, rosa, [0, 0.01, 0.26], [0.018, 0.018, 0.018]);
  for (const x of [-1, 1]) {
    pieza(esf, rosa, [x * 0.055, 0.085, 0.1], [0.04, 0.04, 0.008]);
    pieza(esf, negro, [x * 0.035, 0.04, 0.2], [0.012, 0.012, 0.012]);
  }
  pieza(new THREE.CylinderGeometry(0.008, 0.004, 0.18, 5).rotateX(Math.PI / 2 - 0.4), rosa, [0, 0.03, -0.22]);
  const llave = new THREE.Group(); llave.position.set(0, 0.09, -0.02); g.add(llave);
  pieza(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6), oro, [0, 0.03, 0], null, llave);
  const ala = new THREE.TorusGeometry(0.03, 0.009, 5, 10);
  for (const x of [-1, 1]) pieza(ala, oro, [x * 0.035, 0.07, 0], null, llave);
  g.userData.llave = llave;
  return g;
})();
const matConfeti = new THREE.PointsMaterial({ size: 0.12, vertexColors: true });
const COLORES = [0xff5f8f, 0xffd23f, 0x4fd1a5, 0x5aa9ff, 0xffffff].map((c) => new THREE.Color(c));

function confeti(p) {
  let c = confetis.find((x) => !x.puntos.visible);
  if (!c) {
    const n = 18, geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(Array.from({ length: n }, (_, k) => COLORES[k % COLORES.length].toArray()).flat(), 3));
    c = { puntos: new THREE.Points(geo, matConfeti), vel: Array.from({ length: n }, () => new THREE.Vector3()), t: 0 };
    c.puntos.frustumCulled = false; scene.add(c.puntos); confetis.push(c);
  }
  const pos = c.puntos.geometry.attributes.position;
  c.vel.forEach((v, k) => { v.set(Math.random() - 0.5, Math.random() * 0.8 + 0.2, Math.random() - 0.5).multiplyScalar(5); pos.setXYZ(k, p.x, p.y, p.z); });
  pos.needsUpdate = true; c.t = 0; c.puntos.visible = true;
}

function lanzarPoder(m) {
  if (!jugando || menuAbierto) return;
  const n = dispararPoder(barra, cuerdas.length > 0);
  if (n) guardarBarra();
  if (!n) { sonar.fallo(); if (barra.carga < PODER.lleno) mostrarAviso([`${NOMBRE_PODER}: vence ratones para llenar la barrita`], 1.5); return; }
  empezar();
  const o = new THREE.Vector3(), d = new THREE.Vector3();
  rayo(m, o, d);
  m.garra.getWorldPosition(o); // salen de la mano
  const lado = new THREE.Vector3().crossVectors(d, ARRIBA).normalize();
  for (let k = 0; k < n; k++) {
    let r = ratoncitos.find((x) => !x.malla.visible);
    if (!r) { r = { malla: proto.clone() }; scene.add(r.malla); ratoncitos.push(r); }
    v1.copy(d).addScaledVector(lado, (k - (n - 1) / 2) * 0.22).addScaledVector(ARRIBA, 0.12).setLength(PODER.vel);
    Object.assign(r, crearRatoncito(o, v1), { fase: k });
    r.malla.visible = true; r.malla.position.copy(o);
  }
  sonar.boing();
  vibrar(m, 1, 250);
  mostrarAviso([`¡${NOMBRE_PODER}!`], 1.2);
}

function actualizarPoder(dt, t) {
  for (const r of ratoncitos) {
    if (!r.malla.visible) continue;
    const e = masCercano(r.pos, enemigos);
    const p = e && { x: e.pos.x, y: e.pos.y + 0.3, z: e.pos.z };
    const vivo = pasoRatoncito(r, p, dt);
    r.malla.position.set(r.pos.x, r.pos.y, r.pos.z);
    r.malla.lookAt(v1.copy(r.malla.position).add(r.vel));
    r.malla.rotation.z += Math.sin(t * 25 + r.fase) * 0.15; // patitas de cuerda: tiembla
    r.malla.children.at(-1).rotation.y = t * 18; // la llave da vueltas
    if (e && tocaRatoncito(r, p, TIPOS[e.tipo].radio)) { r.malla.visible = false; golpearEnemigo(e, null, true); }
    else if (!vivo) { r.malla.visible = false; confeti(r.pos); }
  }
  for (const c of confetis) {
    if (!c.puntos.visible) continue;
    c.t += dt;
    const pos = c.puntos.geometry.attributes.position;
    c.vel.forEach((v, k) => { v.y -= 9 * dt; pos.setXYZ(k, pos.getX(k) + v.x * dt, pos.getY(k) + v.y * dt, pos.getZ(k) + v.z * dt); });
    pos.needsUpdate = true;
    if (c.t > 0.9) c.puntos.visible = false;
  }
  // La barrita brilla y late cuando está llena.
  const llena = barraLlena(barra), k = 0.5 + 0.5 * Math.sin(t * 10);
  matBarra.color.setHex(0xffb13d);
  if (llena) matBarra.color.lerp(COLORES[4], k * 0.8);
  barraVR.scale.setScalar(llena ? 1 + k * 0.12 : 1);
}

// --- Escalar (v3) ---------------------------------------------------------------
// VR: el cuerpo se mueve al revés de la(s) mano(s) agarrada(s); sin gravedad.
// Teclado: W/S sube y baja, A/D de lado por la pared. Al llegar a la azotea, pisas.
function actualizarEscalada(dt) {
  const agarradas = manos.filter((m) => m.escalando);
  if (agarradas.length) {
    v1.set(0, 0, 0);
    for (const m of agarradas) v1.add(m.deltaMano);
    v1.divideScalar(agarradas.length);
    if (v1.length() < 1.5) escalar(jugadora, v1); // saltos del seguimiento se ignoran
  } else {
    const my = (teclas.has('KeyW') ? 1 : 0) - (teclas.has('KeyS') ? 1 : 0) + joystick.y;
    const mx = (teclas.has('KeyD') ? 1 : 0) - (teclas.has('KeyA') ? 1 : 0) + joystick.x;
    camera.getWorldDirection(v2); v2.y = 0; v2.normalize(); v2.cross(ARRIBA);
    escalar(jugadora, { x: -v2.x * mx * 2 * dt, y: -my * 3 * dt, z: -v2.z * mx * 2 * dt });
    const c = escaladaTeclado, { x, z } = jugadora.pos; // se acabó la pared por un lado: caes
    if (x < c.min.x - 1.1 || x > c.max.x + 1.1 || z < c.min.z - 1.1 || z > c.max.z + 1.1) escaladaTeclado = false;
    else if (jugadora.pos.y >= c.max.y + AJUSTES.suelo) { // llegaste arriba: te subes a la azotea
      v1.set((c.min.x + c.max.x) / 2 - x, 0, (c.min.z + c.max.z) / 2 - z).normalize();
      jugadora.pos.x += v1.x; jugadora.pos.z += v1.z; jugadora.pos.y = c.max.y + AJUSTES.suelo;
      escaladaTeclado = false;
    }
  }
  jugadora.enSuelo = false;
  if (jugadora.pos.y < AJUSTES.suelo) { jugadora.pos.y = AJUSTES.suelo; jugadora.enSuelo = true; }
  resolverCajas(jugadora, mundo.cajas);
  if (jugadora.enSuelo && escaladaTeclado) escaladaTeclado = false; // llegaste a la azotea (o al suelo)
}

// --- Impulso con el brazo ------------------------------------------------------
// En VR: velocidad de la mano = cambio de la posición del grip relativa al rig
// (así no cuenta el vuelo del cuerpo), girada a orientación de mundo.
function impulsar(dt) {
  impulsando = Math.max(0, impulsando - dt);
  for (const m of manos) {
    let vm = null;
    m.deltaMano.set(0, 0, 0); m.velMano.set(0, 0, 0);
    if (renderer.xr.isPresenting) {
      if (m.manoAntes && dt > 0) {
        m.deltaMano.subVectors(m.grip.position, m.manoAntes).applyQuaternion(rig.quaternion);
        vm = m.velMano.copy(m.deltaMano).divideScalar(dt);
      }
      m.manoAntes = (m.manoAntes || new THREE.Vector3()).copy(m.grip.position);
    } else if ((m.cuerda || m.presa) && jalandoSinVisor()) { // sin visor: como si la mano se alejara del ancla a 3.5 m/s
      const a = m.cuerda ? m.cuerda.ancla : posEnemigo(m.presa);
      vm = v1.set(jugadora.pos.x - a.x, jugadora.pos.y - a.y, jugadora.pos.z - a.z).setLength(3.5);
    }
    if (vm && m.presa) { // jalar la cuerda con el ratón atrapado lo daña
      v2.subVectors(posEnemigo(m.presa), rig.position).normalize();
      if (-vm.dot(v2) > IMPULSO.umbral * 1.5) jalarPresa(m);
      continue;
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
  if (escalando()) actualizarEscalada(dt);
  else for (let k = 0; k < 2; k++) paso(jugadora, cuerdas, dt / 2, { empuje, cajas: mundo.cajas });
  rig.position.set(jugadora.pos.x, jugadora.pos.y - CUERPO, jugadora.pos.z);
  if (!renderer.xr.isPresenting) camera.rotation.set(pitch, yaw, 0);
  rig.updateMatrixWorld(true);
  manos.forEach((m) => actualizarMano(m, dt));
  recogerChurus(ahora / 1000);
  actualizarEnemigos(dt, ahora / 1000);
  actualizarPoder(dt, ahora / 1000);
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
    mostrarAviso(['Palanca izquierda: caminar', 'Agarre en una pared: escalar'], 6);
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

// Para pruebas desde la consola: senku.disparar(0), senku.soltar(0)... y
// senku.avanzar(dt) corre un paso del juego aunque la pestaña esté oculta.
window.senku = { avanzar: (dt) => { if (jugando && !menuAbierto) actualizar(dt); renderer.render(scene, camera); }, jugadora, manos, churus, eleccion, enemigos, vida, abrirMenu, cerrarMenu, menuLienzo, activar, golpearEnemigo, alternarEscalada, total: () => totalChurus, barra, ratoncitos, poder: (i = 1) => lanzarPoder(manos[i]), disparar: (i) => disparar(manos[i]), soltar: (i) => soltarMano(manos[i]), tirar: (i) => tirar(manos[i]), mirar: (y, p) => { yaw = y; pitch = p; } };
