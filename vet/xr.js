// vet/xr.js - Módulo WebXR para Meta Quest 3 (AR Passthrough y VR Aula Clínica)
// Nomenclatura en español según Nomina Anatomica Veterinaria (NAV).
// Calidad profesional para UNITEC campus Toluca.

import * as THREE from 'three';
import {
  ExamEngine,
  EXAM_QUESTIONS,
  ExplodedViewLogic,
  SelectionLogic,
  ScalePresets
} from './logica.js';

// Sintetizador simple de audio Web Audio API para respuesta háptico-auditiva clínica
class ClinicalAudio {
  constructor() {
    this.ctx = null;
  }
  ensure() {
    if (!this.ctx && typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }
  click() {
    this.ensure();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }
  success() {
    this.ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.06);
      gain.gain.setValueAtTime(0.12, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.18);
    });
  }
  error() {
    this.ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.15);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }
}

export class VetXRManager {
  constructor({
    renderer,
    scene,
    camera,
    animal,
    shell,
    objects,
    catalog,
    pieceBounds,
    extent,
    size,
    onSelectPiece,
    onApplyModes,
    onToast
  }) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.animal = animal;
    this.shell = shell;
    this.objects = objects;
    this.catalog = catalog;
    this.pieceBounds = pieceBounds;
    this.extent = extent;
    this.size = size;
    this.onSelectPiece = onSelectPiece;
    this.onApplyModes = onApplyModes;
    this.onToast = onToast;

    this.audio = new ClinicalAudio();
    this.examEngine = new ExamEngine(catalog, EXAM_QUESTIONS);

    this.xrMode = null; // 'ar' | 'vr' | null
    this.session = null;
    this.referenceSpace = null;
    this.hitTestSource = null;
    this.hitTestSourceRequested = false;

    // Contenedor XR para posicionar, rotar y escalar el perro completo
    this.xrRoot = new THREE.Group();
    this.scene.add(this.xrRoot);

    // Guardar referencia original del animal y shell
    this.animalOriginalParent = animal.parent || scene;
    this.shellOriginalParent = shell.parent || scene;

    // Factores de escala (Three.js units en XR = metros)
    // El modelo base tiene extent en mm (~850mm), por lo que 1 metro = extent / 0.85
    this.baseScaleUnits = 1.0 / Math.max(extent, 1);
    this.currentScaleMode = 'tabletop';
    this.targetScale = ScalePresets.TABLETOP.scaleFactor * this.baseScaleUnits;
    this.currentScale = this.targetScale;

    // Estado de colocación AR
    this.arPlaced = false;
    this.arPosition = new THREE.Vector3(0, 0, -0.75);

    // Despiece (Vista explotada)
    this.explosionTarget = 0; // 0..1
    this.explosionCurrent = 0;
    this.explosionDirections = new Map();
    this.originalPiecePositions = new Map();
    this.initExplosionVectors();

    // Capas activas en XR
    this.layers = {
      oseo: true,
      organos: true,
      silueta: false
    };

    // Ficha flotante 3D
    this.selectedPiece = null;
    this.floatingCard = this.createFloatingCard();
    this.xrRoot.add(this.floatingCard.mesh);

    // Pizarra de Modo Examen 3D
    this.examBoard = this.createExamBoard();
    this.xrRoot.add(this.examBoard.mesh);

    // Menú de muñeca 3D
    this.wristHUD = this.createWristHUD();
    this.scene.add(this.wristHUD.mesh);

    // Entorno VR (Aula de exploración veterinaria UNITEC)
    this.clinicLab = this.createClinicLab();
    this.scene.add(this.clinicLab.root);
    this.clinicLab.root.visible = false;

    // Retícula de colocación AR (Hit-test)
    this.reticle = this.createReticle();
    this.scene.add(this.reticle);
    this.reticle.visible = false;

    // Controladores y Manos WebXR
    this.controllers = [];
    this.controllerGrips = [];
    this.hands = [];
    this.setupControllersAndHands();

    // Bimanual interaction state
    this.interaction = {
      grabbingController: null,
      initialGripPos: new THREE.Vector3(),
      initialObjectPos: new THREE.Vector3(),
      initialObjectRotY: 0,
      initialGripRotY: 0,
      twoHanded: false,
      initialDistance: 0,
      initialScale: 1
    };

    // Optimizador para Quest 3 (foveation fija)
    if (this.renderer.xr.setFoveation) {
      this.renderer.xr.setFoveation(1.0);
    }
  }

  /* =========================================================
   * INICIALIZACIÓN DE VECTORES DE EXPLOSIÓN
   * ========================================================= */
  initExplosionVectors() {
    const center = new THREE.Vector3(0, 0, 0);
    for (const p of this.catalog) {
      const root = this.objects.get(p.id);
      if (!root) continue;
      this.originalPiecePositions.set(p.id, root.position.clone());
      const box = this.pieceBounds.get(p.id) || new THREE.Box3().setFromObject(root);
      const pieceCenter = box.getCenter(new THREE.Vector3());
      const dir = ExplodedViewLogic.computeDirection(p, pieceCenter, center);
      this.explosionDirections.set(p.id, dir);
    }
  }

  /* =========================================================
   * ENTORNO CLÍNICO VR (AULA / LABORATORIO VETERINARIO UNITEC)
   * ========================================================= */
  createClinicLab() {
    const root = new THREE.Group();

    // 1. Piso de azulejo médico claro
    const floorGeo = new THREE.PlaneGeometry(8, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xdae2df,
      roughness: 0.35,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = false;
    root.add(floor);

    // Cuadrícula sutil del piso
    const grid = new THREE.GridHelper(8, 16, 0xb8c7c2, 0xcdd8d4);
    grid.position.y = 0.002;
    root.add(grid);

    // 2. Pared frontal de aula clínica
    const wallGeo = new THREE.PlaneGeometry(8, 4);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xedf1ee,
      roughness: 0.85,
      metalness: 0.05
    });
    const frontWall = new THREE.Mesh(wallGeo, wallMat);
    frontWall.position.set(0, 2, -3.8);
    root.add(frontWall);

    // Zoclo médico inferior
    const plinthGeo = new THREE.BoxGeometry(8, 0.15, 0.04);
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x145c50, roughness: 0.4 });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.set(0, 0.075, -3.78);
    root.add(plinth);

    // 3. Pizarra institucional UNITEC en la pared frontal
    const boardCanvas = document.createElement('canvas');
    boardCanvas.width = 1500;
    boardCanvas.height = 450;
    const ctx = boardCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1500, 450);
    // Borde superior verde UNITEC
    ctx.fillStyle = '#146b5b';
    ctx.fillRect(0, 0, 1500, 14);
    // Franja lateral
    ctx.fillRect(0, 0, 14, 450);

    ctx.fillStyle = '#172326';
    ctx.font = 'bold 44px "Georgia", serif';
    ctx.fillText('Propuesta para UNITEC — Medicina Veterinaria, campus Toluca', 50, 75);

    ctx.fillStyle = '#146b5b';
    ctx.font = '600 28px system-ui, sans-serif';
    ctx.fillText('ATLAS ANATÓMICO CANINO 3D EN REALIDAD VIRTUAL', 50, 130);

    ctx.fillStyle = '#556562';
    ctx.font = '24px system-ui, sans-serif';
    ctx.fillText('Canis lupus familiaris · Nomenclatura oficial según Nomina Anatomica Veterinaria (NAV)', 50, 180);
    ctx.fillText('Módulo de simulación clínica: exploración tridimensional, despiece y evaluación anatómica.', 50, 220);

    // Atribución de licencia
    ctx.strokeStyle = '#dce2de';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 270);
    ctx.lineTo(1450, 270);
    ctx.stroke();

    ctx.fillStyle = '#7a8884';
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText('Muestra educativa sin fines de lucro · CC BY-NC-SA 4.0', 50, 315);
    ctx.font = '17px system-ui, sans-serif';
    ctx.fillText('Modelos: Virginia Tech Virtual Animal Project / VT-ARIES (Anatomy) · JorgeTAC/vet-anatomy-viewer commit 9d3fa65', 50, 355);
    ctx.fillText('Prohibido el uso comercial sin autorización. Preparado para demostración académica.', 50, 390);

    const boardTex = new THREE.CanvasTexture(boardCanvas);
    boardTex.colorSpace = THREE.SRGBColorSpace;
    const boardMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.08),
      new THREE.MeshBasicMaterial({ map: boardTex })
    );
    boardMesh.position.set(0, 2.1, -3.76);
    root.add(boardMesh);

    // 4. Mesa de exploración clínica veterinaria (acero quirúrgico)
    const tableGroup = new THREE.Group();
    // Cubierta de la mesa (1.4m x 0.85m a 0.86m de altura)
    const topGeo = new THREE.BoxGeometry(1.4, 0.05, 0.85);
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xdde4e1,
      metalness: 0.85,
      roughness: 0.22
    });
    const tableTop = new THREE.Mesh(topGeo, steelMat);
    tableTop.position.set(0, 0.86, -0.9);
    tableGroup.add(tableTop);

    // Tapete clínico antideslizante central
    const matGeo = new THREE.BoxGeometry(1.22, 0.008, 0.72);
    const matMat = new THREE.MeshStandardMaterial({
      color: 0x3d6e65,
      roughness: 0.85,
      metalness: 0.05
    });
    const tableMat = new THREE.Mesh(matGeo, matMat);
    tableMat.position.set(0, 0.887, -0.9);
    tableGroup.add(tableMat);

    // Columna central y base hidráulica
    const colGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.82, 24);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x98a4a0, metalness: 0.8, roughness: 0.3 });
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.set(0, 0.43, -0.9);
    tableGroup.add(col);

    const baseGeo = new THREE.BoxGeometry(0.9, 0.04, 0.65);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x76827e, metalness: 0.7, roughness: 0.4 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, 0.02, -0.9);
    tableGroup.add(base);

    root.add(tableGroup);

    // 5. Lámpara de exploración quirúrgica superior
    const lampGroup = new THREE.Group();
    lampGroup.position.set(0, 2.3, -0.9);
    const lampArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.45, 12),
      new THREE.MeshStandardMaterial({ color: 0x889490, metalness: 0.9 })
    );
    lampArm.position.y = 0.22;
    lampGroup.add(lampArm);

    const lampDome = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.36, 0.08, 24),
      new THREE.MeshStandardMaterial({ color: 0xeef3f1, metalness: 0.6, roughness: 0.25 })
    );
    lampGroup.add(lampDome);

    const lampLens = new THREE.Mesh(
      new THREE.CircleGeometry(0.34, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    lampLens.rotation.x = Math.PI / 2;
    lampLens.position.y = -0.041;
    lampGroup.add(lampLens);

    // Luz clínica focalizada
    const spot = new THREE.DirectionalLight(0xfff8ed, 1.8);
    spot.position.set(0, 2.3, -0.9);
    spot.target.position.set(0, 0.88, -0.9);
    root.add(spot);
    root.add(spot.target);
    root.add(lampGroup);

    return { root, tableGroup, tableMat, spot };
  }

  /* =========================================================
   * RETÍCULA DE COLOCACIÓN PARA REALIDAD AUMENTADA (HIT-TEST)
   * ========================================================= */
  createReticle() {
    const ring = new THREE.Group();
    const outerGeo = new THREE.RingGeometry(0.12, 0.14, 32);
    const innerGeo = new THREE.RingGeometry(0.02, 0.035, 24);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x19a886,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const outer = new THREE.Mesh(outerGeo, mat);
    outer.rotation.x = -Math.PI / 2;
    const inner = new THREE.Mesh(innerGeo, mat);
    inner.rotation.x = -Math.PI / 2;
    ring.add(outer);
    ring.add(inner);

    // 4 marcas cardinales para precisión visual
    for (let i = 0; i < 4; i++) {
      const tick = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.05), mat);
      tick.rotation.x = -Math.PI / 2;
      tick.rotation.z = (i * Math.PI) / 2;
      tick.position.set(
        Math.cos((i * Math.PI) / 2) * 0.17,
        0,
        Math.sin((i * Math.PI) / 2) * 0.17
      );
      ring.add(tick);
    }
    ring.matrixAutoUpdate = false;
    return ring;
  }

  /* =========================================================
   * CONTROLADORES Y MANOS (HAND TRACKING & CONTROLLERS)
   * ========================================================= */
  setupControllersAndHands() {
    // 1. Controladores estándar (0 y 1)
    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      controller.userData.index = i;
      controller.addEventListener('selectstart', e => this.onSelectStart(e));
      controller.addEventListener('selectend', e => this.onSelectEnd(e));
      controller.addEventListener('squeezestart', e => this.onSqueezeStart(e));
      controller.addEventListener('squeezeend', e => this.onSqueezeEnd(e));
      this.scene.add(controller);
      this.controllers.push(controller);

      // Rayo láser quirúrgico tenue
      const rayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -2.5)
      ]);
      const rayMat = new THREE.LineBasicMaterial({
        color: 0x2ec49e,
        transparent: true,
        opacity: 0.65
      });
      const ray = new THREE.Line(rayGeo, rayMat);
      ray.name = 'ray';
      controller.add(ray);

      // Agarre visible estilizado (estilete quirúrgico)
      const grip = this.renderer.xr.getControllerGrip(i);
      const gripModel = this.createStylusModel();
      grip.add(gripModel);
      this.scene.add(grip);
      this.controllerGrips.push(grip);

      // Hand tracking (0 y 1)
      const hand = this.renderer.xr.getHand(i);
      hand.userData.index = i;
      hand.addEventListener('pinchstart', e => this.onPinchStart(e));
      hand.addEventListener('pinchend', e => this.onPinchEnd(e));

      // Indicador táctil en la yema del índice
      const tipDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 16, 16),
        new THREE.MeshBasicMaterial({
          color: 0x22d3a0,
          transparent: true,
          opacity: 0.8
        })
      );
      tipDot.name = 'indexTipDot';
      tipDot.visible = false;
      this.scene.add(tipDot);
      hand.userData.tipDot = tipDot;

      this.scene.add(hand);
      this.hands.push(hand);
    }
  }

  createStylusModel() {
    const stylus = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.015, 0.14, 16),
      new THREE.MeshStandardMaterial({ color: 0x203530, metalness: 0.6, roughness: 0.3 })
    );
    body.rotation.x = Math.PI / 2;
    stylus.add(body);

    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.012, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0x168670, metalness: 0.8, roughness: 0.2 })
    );
    tip.rotation.x = -Math.PI / 2;
    tip.position.z = -0.09;
    stylus.add(tip);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.016, 0.003, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0x25d4a4 })
    );
    ring.position.z = -0.04;
    stylus.add(ring);

    return stylus;
  }

  /* =========================================================
   * MENÚ DE MUÑECA 3D (WRIST HUD)
   * ========================================================= */
  createWristHUD() {
    const W = 800, H = 560;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.24, 0.24 * (H / W)),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    );
    mesh.visible = false;

    const buttons = [
      // Capas
      { id: 'layer-oseo', text: 'Óseo: SÍ', x: 25, y: 110, w: 235, h: 65, active: true },
      { id: 'layer-organos', text: 'Órganos: SÍ', x: 282, y: 110, w: 235, h: 65, active: true },
      { id: 'layer-silueta', text: 'Silueta: NO', x: 540, y: 110, w: 235, h: 65, active: false },

      // Escala
      { id: 'scale-tabletop', text: 'Escala Mesa', x: 25, y: 195, w: 365, h: 65, active: true },
      { id: 'scale-lifesize', text: 'Escala Real 1:1', x: 410, y: 195, w: 365, h: 65, active: false },

      // Desarmar (Vista Explotada)
      { id: 'explode-0', text: 'Armado', x: 25, y: 280, w: 235, h: 65, active: true },
      { id: 'explode-50', text: 'Desarmar 50%', x: 282, y: 280, w: 235, h: 65, active: false },
      { id: 'explode-100', text: 'Desarmar 100%', x: 540, y: 280, w: 235, h: 65, active: false },

      // Modo Examen y Reposicionar
      { id: 'exam-toggle', text: 'Comenzar Examen', x: 25, y: 365, w: 460, h: 75, active: false, accent: true },
      { id: 'reposition', text: 'Fijar en piso/mesa', x: 505, y: 365, w: 270, h: 75, active: false },

      // Salir de sesión
      { id: 'exit-xr', text: 'Salir del Visor XR', x: 25, y: 460, w: 750, h: 65, danger: true }
    ];

    const draw = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      // Fondo redondeado elegante
      ctx.fillStyle = 'rgba(16, 32, 28, 0.94)';
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 24);
      ctx.fill();

      // Borde sutil
      ctx.strokeStyle = 'rgba(46, 196, 158, 0.45)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Encabezado
      ctx.fillStyle = '#2ec49e';
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillText('VetAR · UNITEC Toluca', 25, 48);

      ctx.fillStyle = '#9fb2ac';
      ctx.font = '19px system-ui, sans-serif';
      ctx.fillText('Menú anatómico en muñeca · Meta Quest 3', 25, 80);

      // Dibujar botones
      for (const b of buttons) {
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 12);
        if (b.danger) {
          ctx.fillStyle = 'rgba(180, 50, 50, 0.75)';
        } else if (b.accent) {
          ctx.fillStyle = b.active ? '#106454' : '#1e806d';
        } else if (b.active) {
          ctx.fillStyle = '#1c6858';
        } else {
          ctx.fillStyle = 'rgba(38, 62, 56, 0.85)';
        }
        ctx.fill();

        ctx.strokeStyle = b.active ? '#34d3a4' : 'rgba(255,255,255,0.15)';
        ctx.lineWidth = b.active ? 2.5 : 1;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.text, b.x + b.w / 2, b.y + b.h / 2);
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      tex.needsUpdate = true;
    };

    draw();

    return { canvas, tex, mesh, buttons, draw };
  }

  /* =========================================================
   * FICHA FLOTANTE 3D (FLOATING INFO CARD)
   * ========================================================= */
  createFloatingCard() {
    const W = 880, H = 460;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.36, 0.36 * (H / W)),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    );
    mesh.visible = false;

    const buttons = [
      { id: 'card-isolate', text: 'Aislar pieza', x: 40, y: 360, w: 260, h: 65, active: false },
      { id: 'card-translucent', text: 'Transparencia', x: 320, y: 360, w: 280, h: 65, active: false },
      { id: 'card-close', text: 'Cerrar ✕', x: 620, y: 360, w: 220, h: 65, active: false }
    ];

    const update = (piece, isolated = false, translucent = false) => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      const data = SelectionLogic.formatCard(piece);

      // Fondo clínico oscuro con transparencia
      ctx.fillStyle = 'rgba(16, 28, 25, 0.96)';
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 24);
      ctx.fill();

      // Marco fino verde
      ctx.strokeStyle = '#25c298';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Barra superior de acento
      ctx.fillStyle = piece && piece.sistema === 'órganos' ? '#c4584c' : '#22aa85';
      ctx.beginPath();
      ctx.roundRect(0, 0, W, 10, [24, 24, 0, 0]);
      ctx.fill();

      // Categoría / Región
      ctx.fillStyle = '#89baa9';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText((data.category || '').toUpperCase(), 40, 50);

      // Nombre en español
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px "Georgia", serif';
      ctx.fillText(data.nombre || 'Estructura anatómica', 40, 100);

      // Nombre en latín (Nomina Anatomica Veterinaria)
      ctx.fillStyle = '#3ee2b2';
      ctx.font = 'italic 26px "Georgia", serif';
      ctx.fillText(`Nomina Anatomica: ${data.nombreLatino || ''}`, 40, 140);

      // Línea divisoria
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, 165);
      ctx.lineTo(W - 40, 165);
      ctx.stroke();

      // Descripción clínica en párrafos
      ctx.fillStyle = '#cfdbd6';
      ctx.font = '22px system-ui, sans-serif';
      const desc = data.description || '';
      const words = desc.split(' ');
      let line = '';
      let y = 205;
      for (const w of words) {
        const testLine = line + w + ' ';
        if (ctx.measureText(testLine).width > W - 80) {
          ctx.fillText(line, 40, y);
          line = w + ' ';
          y += 32;
        } else {
          line = testLine;
        }
      }
      if (line) ctx.fillText(line, 40, y);

      // Botones
      buttons[0].text = isolated ? 'Ver todo' : 'Aislar pieza';
      buttons[0].active = isolated;
      buttons[1].active = translucent;

      for (const b of buttons) {
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 12);
        ctx.fillStyle = b.active ? '#1c6858' : 'rgba(38, 58, 52, 0.85)';
        ctx.fill();
        ctx.strokeStyle = b.active ? '#34d3a4' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.text, b.x + b.w / 2, b.y + b.h / 2);
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      tex.needsUpdate = true;
    };

    update(null);

    return { canvas, tex, mesh, buttons, update };
  }

  /* =========================================================
   * PIZARRA DE MODO EXAMEN 3D (EXAM BOARD)
   * ========================================================= */
  createExamBoard() {
    const W = 1000, H = 500;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.5 * (H / W)),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    );
    mesh.position.set(0, 0.55, -0.4);
    mesh.visible = false;

    const buttons = [
      { id: 'exam-close', text: 'Finalizar examen', x: 680, y: 400, w: 270, h: 65 }
    ];

    let lastFeedback = null;

    const update = (feedbackMessage = null, feedbackColor = null) => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      const q = this.examEngine.getCurrentQuestion();
      const stats = this.examEngine.getStats();

      // Fondo pizarra clínica
      ctx.fillStyle = 'rgba(12, 25, 22, 0.96)';
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 24);
      ctx.fill();

      // Borde verde o de retroalimentación
      ctx.strokeStyle = feedbackColor || '#23b58e';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Cabecera institucional
      ctx.fillStyle = '#23b58e';
      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.fillText('EVALUACIÓN ANATÓMICA VETERINARIA — UNITEC', 40, 50);

      // Marcadores superiores (Puntaje y Tiempo)
      ctx.fillStyle = '#d2ded9';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Aciertos: ${stats.score} / ${stats.total}  ·  ${stats.timeFormatted}`, W - 40, 50);
      ctx.textAlign = 'left';

      // Línea
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, 75);
      ctx.lineTo(W - 40, 75);
      ctx.stroke();

      if (stats.finished) {
        // Pantalla final de resultados
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px "Georgia", serif';
        ctx.fillText('¡Examen completado!', 40, 160);

        ctx.fillStyle = '#3ce0b0';
        ctx.font = 'bold 36px system-ui, sans-serif';
        ctx.fillText(`Puntaje final: ${stats.score} de ${stats.total} (${stats.accuracy}%)`, 40, 225);

        ctx.fillStyle = '#b7c8c2';
        ctx.font = '24px system-ui, sans-serif';
        ctx.fillText(`Tiempo total transcurrido: ${stats.timeFormatted}`, 40, 280);
        ctx.fillText('Toca "Finalizar examen" para volver al modo libre o inicia otro desde la muñeca.', 40, 325);
      } else if (q) {
        // Pregunta actual
        ctx.fillStyle = '#7caea0';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText(`PREGUNTA ${q.index} DE ${q.total}`, 40, 120);

        // Prompt en grande
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 46px "Georgia", serif';
        ctx.fillText(`«${q.prompt}»`, 40, 180);

        // Pista clínica
        ctx.fillStyle = '#9cb8af';
        ctx.font = 'italic 23px "Georgia", serif';
        ctx.fillText(`Pista clínica: ${q.pista}`, 40, 230);

        // Mensaje de feedback temporal
        if (feedbackMessage) {
          ctx.fillStyle = feedbackColor || '#ffffff';
          ctx.font = 'bold 26px system-ui, sans-serif';
          ctx.fillText(feedbackMessage, 40, 310);
        } else {
          ctx.fillStyle = '#647e76';
          ctx.font = '20px system-ui, sans-serif';
          ctx.fillText('Toca la estructura con la yema del dedo índice o apúntala con el rayo y presiona gatillo.', 40, 310);
        }
      }

      // Botón finalizar
      const b = buttons[0];
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 12);
      ctx.fillStyle = '#263e37';
      ctx.fill();
      ctx.strokeStyle = '#34d3a4';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.text, b.x + b.w / 2, b.y + b.h / 2);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      tex.needsUpdate = true;
    };

    update();

    return { canvas, tex, mesh, buttons, update };
  }

  /* =========================================================
   * INICIO Y FIN DE SESIÓN WEBXR
   * ========================================================= */
  async startSession(kind) {
    if (!navigator.xr) {
      this.onToast?.('Este navegador no cuenta con soporte WebXR.');
      return false;
    }

    const mode = kind === 'vr' ? 'immersive-vr' : 'immersive-ar';
    const supported = await navigator.xr.isSessionSupported(mode).catch(() => false);
    if (!supported) {
      this.onToast?.(
        kind === 'vr'
          ? 'No se detectó un visor VR compatible.'
          : 'No se detectó compatibilidad con realidad aumentada passthrough.'
      );
      return false;
    }

    const sessionInit = kind === 'vr'
      ? { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] }
      : {
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['local-floor', 'anchors', 'hand-tracking']
        };

    let session;
    try {
      session = await navigator.xr.requestSession(mode, sessionInit);
    } catch (err) {
      // Intento de fallback con hit-test opcional si falla como requerido
      if (kind === 'ar') {
        session = await navigator.xr.requestSession(mode, {
          optionalFeatures: ['hit-test', 'local-floor', 'anchors', 'hand-tracking']
        });
      } else {
        throw err;
      }
    }

    this.session = session;
    this.xrMode = kind;
    await this.renderer.xr.setSession(session);
    this.referenceSpace = this.renderer.xr.getReferenceSpace();

    // Reubicar animal y silueta dentro del contenedor XR
    this.xrRoot.add(this.animal);
    this.xrRoot.add(this.shell);

    if (kind === 'vr') {
      // Configurar laboratorio virtual
      this.clinicLab.root.visible = true;
      this.reticle.visible = false;
      this.arPlaced = true;
      // Posición sobre la mesa de exploración
      this.xrRoot.position.set(0, 0.95, -0.9);
      this.xrRoot.rotation.set(0, 0, 0);
      this.setScaleMode('tabletop');
      this.onToast?.('Modo VR activo: Laboratorio de anatomía UNITEC');
    } else {
      // Modo AR (Passthrough): ocultar laboratorio virtual y activar hit-test
      this.clinicLab.root.visible = false;
      this.reticle.visible = false;
      this.arPlaced = false;
      this.hitTestSourceRequested = false;
      this.xrRoot.position.set(0, 0.1, -0.8);
      this.setScaleMode('tabletop');
      this.onToast?.('Modo AR activo: Apunta a una mesa o piso para colocar el modelo.');
    }

    session.addEventListener('end', () => this.endSession());
    return true;
  }

  endSession() {
    this.xrMode = null;
    this.session = null;
    this.hitTestSource = null;
    this.hitTestSourceRequested = false;

    // Regresar animal al escenario original
    this.animalOriginalParent.add(this.animal);
    this.shellOriginalParent.add(this.shell);
    this.animal.scale.set(1, 1, 1);
    this.animal.position.set(0, 0, 0);
    this.animal.rotation.set(0, 0, 0);
    this.shell.scale.set(1, 1, 1);
    this.shell.position.set(0, 0, 0);
    this.shell.rotation.set(0, 0, 0);

    this.clinicLab.root.visible = false;
    this.reticle.visible = false;
    this.floatingCard.mesh.visible = false;
    this.examBoard.mesh.visible = false;
    this.wristHUD.mesh.visible = false;
    this.examEngine.stop();

    for (const h of this.hands) {
      if (h.userData.tipDot) h.userData.tipDot.visible = false;
    }

    this.onToast?.('Sesión XR finalizada');
  }

  /* =========================================================
   * GESTIÓN DE ESCALAS Y VISTA EXPLOTADA
   * ========================================================= */
  setScaleMode(mode) {
    this.currentScaleMode = mode;
    const factor = mode === 'lifesize'
      ? ScalePresets.LIFESIZE.scaleFactor
      : ScalePresets.TABLETOP.scaleFactor;
    this.targetScale = factor * this.baseScaleUnits;
    this.audio.click();

    // Actualizar botones de muñeca
    const bTable = this.wristHUD.buttons.find(b => b.id === 'scale-tabletop');
    const bLife = this.wristHUD.buttons.find(b => b.id === 'scale-lifesize');
    if (bTable) bTable.active = (mode === 'tabletop');
    if (bLife) bLife.active = (mode === 'lifesize');
    this.wristHUD.draw();
  }

  setExplosion(factor) {
    this.explosionTarget = Math.max(0, Math.min(1, factor));
    this.audio.click();

    // Actualizar botones en muñeca
    const b0 = this.wristHUD.buttons.find(b => b.id === 'explode-0');
    const b50 = this.wristHUD.buttons.find(b => b.id === 'explode-50');
    const b100 = this.wristHUD.buttons.find(b => b.id === 'explode-100');
    if (b0) b0.active = (factor === 0);
    if (b50) b50.active = (factor === 0.5);
    if (b100) b100.active = (factor === 1);
    this.wristHUD.draw();
  }

  toggleLayer(layerKey) {
    if (this.layers[layerKey] !== undefined) {
      this.layers[layerKey] = !this.layers[layerKey];
      this.audio.click();

      const btn = this.wristHUD.buttons.find(b => b.id === `layer-${layerKey}`);
      if (btn) {
        btn.active = this.layers[layerKey];
        btn.text = `${layerKey === 'oseo' ? 'Óseo' : layerKey === 'organos' ? 'Órganos' : 'Silueta'}: ${btn.active ? 'SÍ' : 'NO'}`;
      }
      this.wristHUD.draw();
      this.applyLayers();
    }
  }

  applyLayers() {
    for (const p of this.catalog) {
      const root = this.objects.get(p.id);
      if (!root) continue;
      const isBone = p.sistema === 'óseo';
      const isOrgan = p.sistema === 'órganos';
      root.visible = (isBone && this.layers.oseo) || (isOrgan && this.layers.organos);
    }
    this.shell.visible = !!this.layers.silueta;
  }

  /* =========================================================
   * MODO EXAMEN
   * ========================================================= */
  toggleExam() {
    if (this.examEngine.active) {
      this.examEngine.stop();
      this.examBoard.mesh.visible = false;
      const btn = this.wristHUD.buttons.find(b => b.id === 'exam-toggle');
      if (btn) {
        btn.text = 'Comenzar Examen';
        btn.active = false;
      }
      this.wristHUD.draw();
      this.onToast?.('Examen finalizado.');
    } else {
      this.examEngine.start(8, true);
      this.examBoard.mesh.visible = true;
      this.examBoard.update();
      const btn = this.wristHUD.buttons.find(b => b.id === 'exam-toggle');
      if (btn) {
        btn.text = 'Detener Examen';
        btn.active = true;
      }
      this.wristHUD.draw();
      this.audio.success();
      this.onToast?.('Modo Examen iniciado: Localiza la pieza indicada.');
    }
  }

  handleExamAnswer(pieceId) {
    if (!this.examEngine.active) return;
    const res = this.examEngine.submitAnswer(pieceId);
    if (res.correct) {
      this.audio.success();
      this.pulseHaptic(0, 0.8, 80);
      this.pulseHaptic(1, 0.8, 80);
      this.flashPiece(pieceId, 0x22d3a0, 600);
      this.examBoard.update(res.message, '#3ce0b0');
    } else {
      this.audio.error();
      this.pulseHaptic(0, 0.4, 120);
      this.pulseHaptic(1, 0.4, 120);
      this.flashPiece(pieceId, 0xff4d4d, 600);
      this.examBoard.update(res.message, '#ff6b6b');
    }
  }

  flashPiece(pieceId, hexColor, durationMs = 500) {
    const root = this.objects.get(pieceId);
    if (!root) return;
    root.traverse(o => {
      if (o.isMesh && o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(m => {
          if (m && m.emissive) {
            const old = m.emissive.getHex();
            m.emissive.setHex(hexColor);
            setTimeout(() => {
              if (m && m.emissive) m.emissive.setHex(old);
            }, durationMs);
          }
        });
      }
    });
  }

  pulseHaptic(controllerIndex, strength = 0.6, durationMs = 50) {
    const controller = this.controllers[controllerIndex];
    const source = controller?.userData?.inputSource;
    if (source && source.gamepad && source.gamepad.hapticActuators && source.gamepad.hapticActuators[0]) {
      source.gamepad.hapticActuators[0].pulse(strength, durationMs).catch(() => {});
    }
  }

  /* =========================================================
   * SELECCIÓN DE PIEZAS Y FICHA FLOTANTE
   * ========================================================= */
  selectPiece(p, openCard = true) {
    this.selectedPiece = p;
    this.onSelectPiece?.(p, false);
    this.audio.click();

    if (openCard && p) {
      this.floatingCard.mesh.visible = true;
      this.floatingCard.update(p, false, false);

      // Posicionar la ficha justo arriba de la pieza seleccionada
      const root = this.objects.get(p.id);
      if (root) {
        const box = this.pieceBounds.get(p.id) || new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        this.floatingCard.mesh.position.copy(center).add(new THREE.Vector3(0, this.extent * 0.22, 0));
      }
    }
  }

  /* =========================================================
   * EVENTOS DE ENTRADA (RAYCASTING Y CLICS EN BOTONES Y PIEZAS)
   * ========================================================= */
  onSelectStart(event) {
    const controller = event.target;
    this.pulseHaptic(controller.userData.index, 0.4, 30);

    // 1. Si en AR no está colocado y la retícula es visible, anclar perro
    if (this.xrMode === 'ar' && (!this.arPlaced || this.reticle.visible)) {
      if (this.reticle.visible) {
        this.reticle.matrix.decompose(this.xrRoot.position, this.xrRoot.quaternion, new THREE.Vector3());
        this.arPlaced = true;
        this.reticle.visible = false;
        this.audio.success();
        this.onToast?.('Estructura canina fijada en la superficie.');
        return;
      }
    }

    // 2. Comprobar interacción con botones 3D (Menú de muñeca, ficha, examen)
    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    // Botones de la muñeca
    if (this.wristHUD.mesh.visible) {
      const hits = raycaster.intersectObject(this.wristHUD.mesh);
      if (hits.length > 0) {
        this.handleWristClick(hits[0].uv);
        return;
      }
    }

    // Botones de la ficha flotante
    if (this.floatingCard.mesh.visible) {
      const hits = raycaster.intersectObject(this.floatingCard.mesh);
      if (hits.length > 0) {
        this.handleCardClick(hits[0].uv);
        return;
      }
    }

    // Botones de la pizarra de examen
    if (this.examBoard.mesh.visible) {
      const hits = raycaster.intersectObject(this.examBoard.mesh);
      if (hits.length > 0) {
        this.handleExamBoardClick(hits[0].uv);
        return;
      }
    }

    // 3. Comprobar clic en piezas del perro
    const visibleRoots = this.catalog
      .filter(p => this.objects.has(p.id) && this.objects.get(p.id).visible)
      .map(p => this.objects.get(p.id));

    const hits = raycaster.intersectObjects(visibleRoots, true);
    const hit = hits.find(x => x.object.userData.pieceId);
    if (hit) {
      const pieceId = hit.object.userData.pieceId;
      const piece = this.catalog.find(p => p.id === pieceId);
      if (this.examEngine.active) {
        this.handleExamAnswer(pieceId);
      } else {
        this.selectPiece(piece, true);
      }
    }
  }

  onSelectEnd(event) {
    // Liberar estado si correspondiera
  }

  onSqueezeStart(event) {
    const controller = event.target;
    // Si ambos agarran, iniciar bimanual
    const otherIndex = controller.userData.index === 0 ? 1 : 0;
    const other = this.controllers[otherIndex];
    if (this.interaction.grabbingController !== null) {
      // Iniciar interacción bimanual (dos manos: escalar y rotar)
      this.interaction.twoHanded = true;
      this.interaction.initialDistance = this.controllers[0].position.distanceTo(this.controllers[1].position);
      this.interaction.initialScale = this.currentScale;
    } else {
      // Un solo controlador agarra
      this.interaction.grabbingController = controller;
      this.interaction.initialGripPos.copy(controller.position);
      this.interaction.initialObjectPos.copy(this.xrRoot.position);
      this.interaction.initialObjectRotY = this.xrRoot.rotation.y;
      this.interaction.initialGripRotY = controller.rotation.y;
    }
  }

  onSqueezeEnd(event) {
    const controller = event.target;
    if (this.interaction.twoHanded) {
      this.interaction.twoHanded = false;
      this.interaction.grabbingController = null;
    } else if (this.interaction.grabbingController === controller) {
      this.interaction.grabbingController = null;
    }
  }

  onPinchStart(event) {
    // Hand tracking pinch
    this.onSelectStart({ target: this.controllers[event.target.userData.index] || event.target });
  }

  onPinchEnd(event) {
    this.onSelectEnd({ target: this.controllers[event.target.userData.index] || event.target });
  }

  /* =========================================================
   * ACCIONES DE BOTONES 3D
   * ========================================================= */
  handleWristClick(uv) {
    const px = uv.x * this.wristHUD.canvas.width;
    const py = (1 - uv.y) * this.wristHUD.canvas.height;
    const hitBtn = this.wristHUD.buttons.find(
      b => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h
    );
    if (!hitBtn) return;

    this.audio.click();

    switch (hitBtn.id) {
      case 'layer-oseo':
        this.toggleLayer('oseo');
        break;
      case 'layer-organos':
        this.toggleLayer('organos');
        break;
      case 'layer-silueta':
        this.toggleLayer('silueta');
        break;
      case 'scale-tabletop':
        this.setScaleMode('tabletop');
        break;
      case 'scale-lifesize':
        this.setScaleMode('lifesize');
        break;
      case 'explode-0':
        this.setExplosion(0);
        break;
      case 'explode-50':
        this.setExplosion(0.5);
        break;
      case 'explode-100':
        this.setExplosion(1.0);
        break;
      case 'exam-toggle':
        this.toggleExam();
        break;
      case 'reposition':
        this.arPlaced = false;
        this.reticle.visible = true;
        this.onToast?.('Modo de reposición: Apunta a la superficie y presiona gatillo.');
        break;
      case 'exit-xr':
        if (this.session) this.session.end();
        break;
    }
  }

  handleCardClick(uv) {
    const px = uv.x * this.floatingCard.canvas.width;
    const py = (1 - uv.y) * this.floatingCard.canvas.height;
    const hitBtn = this.floatingCard.buttons.find(
      b => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h
    );
    if (!hitBtn) return;
    this.audio.click();

    if (hitBtn.id === 'card-close') {
      this.floatingCard.mesh.visible = false;
    } else if (hitBtn.id === 'card-isolate') {
      const active = !hitBtn.active;
      hitBtn.active = active;
      for (const p of this.catalog) {
        const root = this.objects.get(p.id);
        if (!root) continue;
        root.visible = !active || (this.selectedPiece && p.id === this.selectedPiece.id);
      }
      this.floatingCard.update(this.selectedPiece, active, false);
    } else if (hitBtn.id === 'card-translucent') {
      const trans = !hitBtn.active;
      hitBtn.active = trans;
      for (const p of this.catalog) {
        const root = this.objects.get(p.id);
        if (!root) continue;
        const dim = trans && this.selectedPiece && p.id !== this.selectedPiece.id;
        root.traverse(o => {
          if (o.isMesh && o.material) {
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach(m => {
              if (m) {
                m.transparent = dim || !!m.userData.baseTransparent;
                m.opacity = dim ? 0.2 : (m.userData.baseOpacity ?? 1);
              }
            });
          }
        });
      }
      this.floatingCard.update(this.selectedPiece, false, trans);
    }
  }

  handleExamBoardClick(uv) {
    const px = uv.x * this.examBoard.canvas.width;
    const py = (1 - uv.y) * this.examBoard.canvas.height;
    const hitBtn = this.examBoard.buttons.find(
      b => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h
    );
    if (hitBtn && hitBtn.id === 'exam-close') {
      this.toggleExam();
    }
  }

  /* =========================================================
   * BUCLE PRINCIPAL DE ACTUALIZACIÓN (RENDER LOOP XR & DESKTOP)
   * ========================================================= */
  update(time, frame) {
    // 1. Interpolación de vista explotada (despiece) activa en escritorio y XR
    if (Math.abs(this.explosionCurrent - this.explosionTarget) > 0.001) {
      this.explosionCurrent += (this.explosionTarget - this.explosionCurrent) * 0.14;
      const maxDist = this.extent * 0.45;
      for (const p of this.catalog) {
        const root = this.objects.get(p.id);
        const dir = this.explosionDirections.get(p.id);
        const base = this.originalPiecePositions.get(p.id);
        if (root && dir && base) {
          const off = ExplodedViewLogic.computeOffset(dir, this.explosionCurrent, maxDist);
          root.position.set(base.x + off.x, base.y + off.y, base.z + off.z);
        }
      }
    }

    if (!this.session || !this.renderer.xr.isPresenting) return;

    // 2. Interpolación de escala suave en XR
    if (Math.abs(this.currentScale - this.targetScale) > 0.0001) {
      this.currentScale += (this.targetScale - this.currentScale) * 0.15;
      this.animal.scale.setScalar(this.currentScale);
      this.shell.scale.setScalar(this.currentScale);
    }

    // 3. Hit-test en AR (passthrough)
    if (this.xrMode === 'ar' && frame) {
      if (!this.hitTestSourceRequested) {
        this.session.requestReferenceSpace('viewer').then(refSpace => {
          this.session.requestHitTestSource({ space: refSpace }).then(source => {
            this.hitTestSource = source;
          }).catch(() => {});
        }).catch(() => {});
        this.hitTestSourceRequested = true;
      }

      if (this.hitTestSource && !this.arPlaced) {
        const hitTestResults = frame.getHitTestResults(this.hitTestSource);
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          const referenceSpace = this.renderer.xr.getReferenceSpace();
          const pose = hit.getPose(referenceSpace);
          if (pose) {
            this.reticle.visible = true;
            this.reticle.matrix.fromArray(pose.transform.matrix);
          }
        } else {
          this.reticle.visible = false;
        }
      }
    }

    // 4. Posicionamiento del Menú en la Muñeca Izquierda
    const leftController = this.controllers[0];
    const leftHand = this.hands[0];
    if (leftController && leftController.visible) {
      // Menú anclado a la muñeca izquierda con orientación natural
      this.wristHUD.mesh.visible = true;
      const pos = new THREE.Vector3(0.08, 0.05, 0.04).applyMatrix4(leftController.matrixWorld);
      this.wristHUD.mesh.position.copy(pos);
      this.wristHUD.mesh.quaternion.copy(leftController.quaternion);
      this.wristHUD.mesh.rotateX(-Math.PI / 4);
    } else {
      this.wristHUD.mesh.visible = false;
    }

    // 5. Billboard para la ficha flotante y pizarra de examen (miran a la cámara)
    if (this.floatingCard.mesh.visible) {
      this.floatingCard.mesh.lookAt(this.camera.position);
    }
    if (this.examBoard.mesh.visible) {
      this.examBoard.mesh.lookAt(this.camera.position);
    }

    // 6. Manipulación bimanual (dos mandos agarrados a la vez)
    if (this.interaction.twoHanded && this.controllers.length >= 2) {
      const dist = this.controllers[0].position.distanceTo(this.controllers[1].position);
      if (this.interaction.initialDistance > 0.01) {
        const scaleMul = dist / this.interaction.initialDistance;
        this.targetScale = Math.max(
          0.1 * this.baseScaleUnits,
          Math.min(2.5 * this.baseScaleUnits, this.interaction.initialScale * scaleMul)
        );
      }
    } else if (this.interaction.grabbingController) {
      // Agarre con una sola mano: traslación y rotación suave
      const deltaPos = new THREE.Vector3().subVectors(
        this.interaction.grabbingController.position,
        this.interaction.initialGripPos
      );
      this.xrRoot.position.copy(this.interaction.initialObjectPos).add(deltaPos);

      const deltaRot = this.interaction.grabbingController.rotation.y - this.interaction.initialGripRotY;
      this.xrRoot.rotation.y = this.interaction.initialObjectRotY + deltaRot;
    }

    // 7. Hand tracking: detección de toque directo con la yema del índice
    for (let i = 0; i < this.hands.length; i++) {
      const hand = this.hands[i];
      if (!hand.visible) continue;
      const indexTipJoint = hand.joints ? hand.joints['index-finger-tip'] : null;
      if (indexTipJoint) {
        const tipPos = new THREE.Vector3();
        tipPos.setFromMatrixPosition(indexTipJoint.matrixWorld);

        if (hand.userData.tipDot) {
          hand.userData.tipDot.visible = true;
          hand.userData.tipDot.position.copy(tipPos);
        }

        // Comprobar distancia a piezas (umbral 3.5 cm)
        if (time - (hand.userData.lastTouchTime || 0) > 0.8) {
          const touchPiece = this.findPieceNearPoint(tipPos, 0.035);
          if (touchPiece) {
            hand.userData.lastTouchTime = time;
            if (this.examEngine.active) {
              this.handleExamAnswer(touchPiece.id);
            } else {
              this.selectPiece(touchPiece, true);
            }
          }
        }
      }
    }
  }

  findPieceNearPoint(worldPoint, threshold = 0.035) {
    const localPoint = this.animal.worldToLocal(worldPoint.clone());
    let closestPiece = null;
    let closestDist = Infinity;

    for (const p of this.catalog) {
      const root = this.objects.get(p.id);
      if (!root || !root.visible) continue;
      const box = this.pieceBounds.get(p.id);
      if (!box) continue;
      const center = box.getCenter(new THREE.Vector3());
      const dist = center.distanceTo(localPoint);
      if (dist < closestDist) {
        closestDist = dist;
        closestPiece = p;
      }
    }

    const scaledThreshold = threshold / (this.currentScale || 1);
    return closestDist <= scaledThreshold ? closestPiece : null;
  }
}
