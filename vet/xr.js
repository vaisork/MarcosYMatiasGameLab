// vet/xr.js - Módulo WebXR para Meta Quest 3 (AR Passthrough y VR Aula Clínica)
// Nomenclatura en español según Nomina Anatomica Veterinaria (NAV).
// Calidad profesional para UNITEC campus Toluca.

import * as THREE from 'three';
import {
  ExamEngine,
  EXAM_QUESTIONS,
  ExplodedViewLogic,
  SelectionLogic,
  ScalePresets,
  DogPlacementLogic,
  ThumbstickControlLogic,
  GrabLogic
} from './logica.js';

// Sintetizador de audio Web Audio API para respuesta háptico-auditiva clínica
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

    // Rig del jugador para locomoción suave en VR (el usuario se desplaza sin caminar)
    this.playerRig = new THREE.Group();
    this.scene.add(this.playerRig);
    this.playerRig.add(this.camera);

    // Contenedor principal de la anatomía canina y sus elementos 3D
    this.xrRoot = new THREE.Group();
    this.scene.add(this.xrRoot);

    // Guardar referencia original del animal y silueta
    this.animalOriginalParent = animal.parent || scene;
    this.shellOriginalParent = shell.parent || scene;

    // Normalización a tamaño real (~0.75 m de largo, calculado con Box3 del conjunto)
    this.realLifeScale = DogPlacementLogic.calculateRealScale(size, 0.75);
    this.baseScaleUnits = 1.0 / Math.max(extent, 1);
    this.scaleMultiplier = 1.0; // Rango continuo 0.15x a 4.0x
    this.targetScale = this.realLifeScale * this.scaleMultiplier;
    this.currentScale = this.targetScale;

    // Aplicar inmediatamente la escala real para evitar apariciones gigantes
    this.animal.scale.setScalar(this.currentScale);
    this.shell.scale.setScalar(this.currentScale);

    // Estado de colocación AR
    this.arPlaced = false;
    this.arPosition = new THREE.Vector3(0, 1.0, -0.6);

    // Despiece (Vista explotada)
    this.explosionTarget = 0; // 0..1
    this.explosionCurrent = 0;
    this.explosionSteps = [0, 0.25, 0.5, 0.75, 1.0];
    this.explosionDirections = new Map();
    this.originalPiecePositions = new Map();
    this.initExplosionVectors();

    // Capas activas en XR
    this.layers = {
      oseo: true,
      organos: true,
      silueta: false
    };
    this.activeRegion = 'Todas';

    // Sombra de contacto falsa suave bajo el perro
    this.contactShadow = this.createContactShadow();
    this.xrRoot.add(this.contactShadow);

    // Ficha anatómica flotante 3D
    this.selectedPiece = null;
    this.floatingCard = this.createFloatingCard();
    this.xrRoot.add(this.floatingCard.mesh);

    // Pizarra de Modo Examen 3D
    this.examBoard = this.createExamBoard();
    this.xrRoot.add(this.examBoard.mesh);

    // Tarjeta de ayuda inicial con mandos Meta Quest 3
    this.helpCard = this.createHelpCard();
    this.scene.add(this.helpCard.mesh);
    this.helpCard.mesh.visible = false;

    // Panel de disección flotante grande (botones 6+ cm, anclado al lado del perro)
    this.dissectionPanel = this.createFloatingDissectionPanel();
    this.xrRoot.add(this.dissectionPanel.mesh);
    this.dissectionPanel.mesh.position.set(0.55, 0.15, 0);

    // Menú de muñeca 3D
    this.wristHUD = this.createWristHUD();
    this.playerRig.add(this.wristHUD.mesh);

    // Entorno VR (Aula de exploración veterinaria UNITEC con mesa quirúrgica)
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

    // Estado de interacción 6DoF y bimanual
    this.interaction = {
      grabbers: [],
      offset: new THREE.Matrix4(),
      start: null
    };

    // Historial de botones para detección de pulsación única
    this.prevGamepadButtons = {
      a: false,
      b: false,
      x: false,
      y: false
    };

    // Foveación baja y nítida en Quest 3 (0.2)
    if (this.renderer.xr.setFoveation) {
      this.renderer.xr.setFoveation(0.2);
    }
  }

  /* =========================================================
   * SOMBRA DE CONTACTO FALSA BAJO EL PERRO
   * ========================================================= */
  createContactShadow() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
    grad.addColorStop(0, 'rgba(12, 22, 18, 0.72)');
    grad.addColorStop(0.35, 'rgba(15, 28, 23, 0.45)');
    grad.addColorStop(0.7, 'rgba(18, 32, 26, 0.16)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(canvas);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 0.5),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.18;
    return plane;
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
      color: 0xdde6e2,
      roughness: 0.4,
      metalness: 0.08
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    root.add(floor);

    // Cuadrícula sutil del piso
    const grid = new THREE.GridHelper(8, 16, 0xb0c2bc, 0xcdd8d4);
    grid.position.y = 0.002;
    root.add(grid);

    // 2. Pared frontal de aula clínica
    const wallGeo = new THREE.PlaneGeometry(8, 4);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xeef2ef,
      roughness: 0.85,
      metalness: 0.02
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
    ctx.fillStyle = '#146b5b';
    ctx.fillRect(0, 0, 1500, 14);
    ctx.fillRect(0, 0, 14, 450);

    ctx.fillStyle = '#172326';
    ctx.font = 'bold 44px "Georgia", serif';
    ctx.fillText('Propuesta para UNITEC — Medicina Veterinaria, campus Toluca', 50, 75);

    ctx.fillStyle = '#146b5b';
    ctx.font = '600 28px system-ui, sans-serif';
    ctx.fillText('ATLAS ANATÓMICO CANINO 3D EN REALIDAD VIRTUAL (VETAR)', 50, 130);

    ctx.fillStyle = '#556562';
    ctx.font = '24px system-ui, sans-serif';
    ctx.fillText('Canis lupus familiaris · Nomenclatura oficial según Nomina Anatomica Veterinaria (NAV)', 50, 180);
    ctx.fillText('Exploración tridimensional, despiece radial, control háptico 6DoF y evaluación anatómica.', 50, 220);

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
    ctx.fillText('Agarre o pellizco: mover · Dos manos: tamaño y giro · Palanca izq: caminar (VR)', 50, 390);

    const boardTex = new THREE.CanvasTexture(boardCanvas);
    boardTex.colorSpace = THREE.SRGBColorSpace;
    const boardMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.08),
      new THREE.MeshBasicMaterial({ map: boardTex })
    );
    boardMesh.position.set(0, 2.1, -3.76);
    root.add(boardMesh);

    // 4. Mesa de exploración clínica veterinaria (acero quirúrgico)
    // Centrada en z = -0.65 m para que el perro a 0.6 m repose cómodamente sobre la cubierta
    const tableGroup = new THREE.Group();
    const tableZ = -0.65;
    const topGeo = new THREE.BoxGeometry(1.4, 0.05, 0.85);
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xdfe5e2,
      metalness: 0.82,
      roughness: 0.25
    });
    const tableTop = new THREE.Mesh(topGeo, steelMat);
    tableTop.position.set(0, 0.86, tableZ);
    tableGroup.add(tableTop);

    // Tapete clínico antideslizante central
    const matGeo = new THREE.BoxGeometry(1.22, 0.008, 0.72);
    const matMat = new THREE.MeshStandardMaterial({
      color: 0x336259,
      roughness: 0.85,
      metalness: 0.04
    });
    const tableMat = new THREE.Mesh(matGeo, matMat);
    tableMat.position.set(0, 0.887, tableZ);
    tableGroup.add(tableMat);

    // Columna central y base hidráulica
    const colGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.82, 24);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x93a09c, metalness: 0.75, roughness: 0.35 });
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.set(0, 0.43, tableZ);
    tableGroup.add(col);

    const baseGeo = new THREE.BoxGeometry(0.9, 0.04, 0.65);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x76827e, metalness: 0.7, roughness: 0.4 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, 0.02, tableZ);
    tableGroup.add(base);

    root.add(tableGroup);

    // 5. Lámpara de exploración quirúrgica superior y luz suave de volumen
    const lampGroup = new THREE.Group();
    lampGroup.position.set(0, 2.3, tableZ);
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

    // Luz focalizada suave
    const spot = new THREE.DirectionalLight(0xfff8ee, 1.6);
    spot.position.set(0, 2.3, tableZ);
    spot.target.position.set(0, 0.88, tableZ);
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
   * TARJETA DE AYUDA DE MANDOS (HELP CARD)
   * ========================================================= */
  createHelpCard() {
    const W = 1000, H = 720;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.66, 0.66 * (H / W)),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    );
    mesh.position.set(0, 1.25, -0.65);
    mesh.visible = false;

    const buttons = [
      { id: 'hc-close', text: '¡Entendido! Comenzar exploración  (o pulsa B)', x: 100, y: 610, w: 800, h: 80 }
    ];

    const draw = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      // Fondo redondeado elegante
      ctx.fillStyle = 'rgba(12, 26, 22, 0.96)';
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 24);
      ctx.fill();

      // Borde verde clínico
      ctx.strokeStyle = '#25c298';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Encabezado
      ctx.fillStyle = '#22caa0';
      ctx.font = 'bold 32px system-ui, sans-serif';
      ctx.fillText('VETAR · GUÍA DE CONTROLES (META QUEST 3)', 45, 55);

      ctx.fillStyle = '#a6b8b2';
      ctx.font = '20px system-ui, sans-serif';
      ctx.fillText('Atlas anatómico veterinario · Nomenclatura NAV · UNITEC Campus Toluca', 45, 90);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(45, 110);
      ctx.lineTo(W - 45, 110);
      ctx.stroke();

      // Instrucciones detalladas de controles
      const lines = [
        ['🕹️ Palanca Derecha:', 'Arriba/Abajo = Escala continua (0.15× a 4×) · Izquierda/Derecha = Girar perro'],
        ['🚶 Palanca Izquierda:', 'VR = caminar por el aula hacia donde miras · AR = Adelante/Atrás aleja o acerca el perro'],
        ['✊ Agarre (Grip):', '1 mano = el perro se pega a tu mano · 2 manos = abrir/cerrar para tamaño, girar para rotar'],
        ['🔘 Botón A:', '«Traer al frente» (reposiciona a 0.6 m a tamaño real ~0.75 m)'],
        ['🔘 Botón B:', 'Abrir / Ocultar panel de disección flotante'],
        ['🔘 Botones X / Y:', 'Nivel de despiece anterior / siguiente (0%, 25%, 50%, 75%, 100%)'],
        ['🎯 Gatillo:', 'Seleccionar pieza con rayo láser · Muestra ficha flotante legible'],
        ['🖐️ Seguimiento de Manos:', 'Pellizco al vacío = agarrar · Pellizco con las dos = tamaño y giro · Índice = seleccionar']
      ];

      let y = 148;
      for (const [title, desc] of lines) {
        ctx.fillStyle = '#3ee2b2';
        ctx.font = 'bold 21px system-ui, sans-serif';
        ctx.fillText(title, 45, y);

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px system-ui, sans-serif';
        ctx.fillText(desc, 310, y);
        y += 48;
      }

      // Botón cerrar
      const btn = buttons[0];
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 16);
      ctx.fillStyle = '#15705d';
      ctx.fill();
      ctx.strokeStyle = '#38e3b4';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.text, btn.x + btn.w / 2, btn.y + btn.h / 2);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      tex.needsUpdate = true;
    };

    draw();

    return { canvas, tex, mesh, buttons, draw };
  }

  /* =========================================================
   * PANEL DE DISECCIÓN FLOTANTE GRANDE (BOTONES 6+ CM)
   * ========================================================= */
  createFloatingDissectionPanel() {
    const W = 1024, H = 820;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    // Medidas 3D: 0.75 m ancho x 0.60 m alto. A esta escala, 80 px = 6.0 cm (6+ cm garantizado)
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.75, 0.75 * (H / W)),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    );
    mesh.visible = true;

    const regionsList = [
      'Todas',
      'Cabeza',
      'Cuello',
      'Tórax',
      'Columna vertebral',
      'Pelvis y cola',
      'Miembro torácico izquierdo',
      'Miembro torácico derecho',
      'Miembro pélvico izquierdo',
      'Miembro pélvico derecho'
    ];

    const buttons = [
      // Fila 1: Capas (h: 82px >= 6 cm)
      { id: 'dp-layer-oseo', text: 'Óseo: SÍ', x: 40, y: 110, w: 210, h: 82, active: true },
      { id: 'dp-layer-organos', text: 'Órganos: SÍ', x: 265, y: 110, w: 210, h: 82, active: true },
      { id: 'dp-layer-silueta', text: 'Silueta: NO', x: 490, y: 110, w: 210, h: 82, active: false },
      { id: 'dp-region-cycle', text: 'Región: Todas', x: 715, y: 110, w: 269, h: 82, active: false },

      // Fila 2: Despiece radial (h: 80px >= 6 cm)
      { id: 'dp-explode-0', text: '0% Armado', x: 40, y: 220, w: 175, h: 80, active: true },
      { id: 'dp-explode-25', text: '25%', x: 230, y: 220, w: 125, h: 80, active: false },
      { id: 'dp-explode-50', text: '50%', x: 370, y: 220, w: 125, h: 80, active: false },
      { id: 'dp-explode-75', text: '75%', x: 510, y: 220, w: 125, h: 80, active: false },
      { id: 'dp-explode-100', text: '100% Total', x: 650, y: 220, w: 180, h: 80, active: false },
      { id: 'dp-explode-slider', isSlider: true, x: 40, y: 315, w: 944, h: 36 },

      // Fila 3: Inspección (h: 82px)
      { id: 'dp-isolate', text: 'Aislar pieza', x: 40, y: 375, w: 460, h: 82, active: false },
      { id: 'dp-translucent', text: 'Transparencia resto', x: 524, y: 375, w: 460, h: 82, active: false },

      // Fila 4: Tamaño y Altura (h: 82px)
      { id: 'dp-scale-down', text: 'Tamaño −', x: 40, y: 480, w: 220, h: 82 },
      { id: 'dp-scale-up', text: 'Tamaño +', x: 280, y: 480, w: 220, h: 82 },
      { id: 'dp-scale-real', text: 'Tamaño Real 1:1 (~0.75m)', x: 520, y: 480, w: 464, h: 82, active: true },

      { id: 'dp-height-up', text: 'Altura ↑ Subir', x: 40, y: 585, w: 460, h: 82 },
      { id: 'dp-height-down', text: 'Altura ↓ Bajar', x: 524, y: 585, w: 460, h: 82 },

      // Fila 5: Acciones principales (h: 84px)
      { id: 'dp-bring-front', text: '« Traer al frente »', x: 40, y: 695, w: 360, h: 84, accent: true },
      { id: 'dp-exam-toggle', text: 'Modo Examen', x: 420, y: 695, w: 320, h: 84, accentTeal: true },
      { id: 'dp-help', text: 'Ayuda (Controles)', x: 760, y: 695, w: 224, h: 84 },

      // Botón cerrar esquina
      { id: 'dp-close-corner', text: '✕', x: 940, y: 20, w: 56, h: 56, isIcon: true }
    ];

    const draw = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      // Fondo oscuro semitransparente médico
      ctx.fillStyle = 'rgba(12, 26, 22, 0.95)';
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 24);
      ctx.fill();

      // Borde clínico
      ctx.strokeStyle = '#25c298';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Encabezado
      ctx.fillStyle = '#23baa0';
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillText('PANEL DE DISECCIÓN E INSPECCIÓN ANATÓMICA', 40, 52);

      ctx.fillStyle = '#9cb5ad';
      ctx.font = '19px system-ui, sans-serif';
      ctx.fillText('Medicina Veterinaria UNITEC · Botones ergonómicos 6+ cm', 40, 85);

      // Línea divisoria
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, 100);
      ctx.lineTo(W - 40, 100);
      ctx.stroke();

      // Dibujar botones
      for (const b of buttons) {
        if (b.isSlider) {
          // Track del deslizador
          ctx.beginPath();
          ctx.roundRect(b.x, b.y + 10, b.w, 16, 8);
          ctx.fillStyle = 'rgba(30, 56, 48, 0.9)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx.stroke();

          // Barra llena proporcional al despiece
          const fillW = Math.max(16, b.w * this.explosionTarget);
          ctx.beginPath();
          ctx.roundRect(b.x, b.y + 10, fillW, 16, 8);
          ctx.fillStyle = '#24cf9e';
          ctx.fill();

          // Indicador circular / handle
          const handleX = b.x + b.w * this.explosionTarget;
          ctx.beginPath();
          ctx.arc(handleX, b.y + 18, 16, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = '#18866a';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Etiqueta del valor de despiece
          ctx.fillStyle = '#3ce0b2';
          ctx.font = 'bold 18px system-ui, sans-serif';
          ctx.fillText(`Despiece continuo: ${Math.round(this.explosionTarget * 100)}%`, 845, 268);
          continue;
        }

        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 14);

        if (b.isIcon) {
          ctx.fillStyle = 'rgba(60, 30, 30, 0.6)';
        } else if (b.accent) {
          ctx.fillStyle = '#166e5a';
        } else if (b.accentTeal) {
          ctx.fillStyle = b.active ? '#996f2a' : '#227e69';
        } else if (b.active) {
          ctx.fillStyle = '#1b6957';
        } else {
          ctx.fillStyle = 'rgba(28, 48, 42, 0.88)';
        }
        ctx.fill();

        ctx.strokeStyle = b.active || b.accent ? '#3ce0b2' : 'rgba(255,255,255,0.18)';
        ctx.lineWidth = b.active || b.accent ? 2.5 : 1.2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = b.isIcon ? 'bold 28px system-ui, sans-serif' : 'bold 21px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.text, b.x + b.w / 2, b.y + b.h / 2);
      }

      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      tex.needsUpdate = true;
    };

    draw();

    return { canvas, tex, mesh, buttons, regionsList, draw };
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
      { id: 'layer-oseo', text: 'Óseo: SÍ', x: 25, y: 110, w: 235, h: 65, active: true },
      { id: 'layer-organos', text: 'Órganos: SÍ', x: 282, y: 110, w: 235, h: 65, active: true },
      { id: 'layer-silueta', text: 'Silueta: NO', x: 540, y: 110, w: 235, h: 65, active: false },
      { id: 'scale-tabletop', text: 'Escala Mesa', x: 25, y: 195, w: 365, h: 65, active: false },
      { id: 'scale-lifesize', text: 'Escala Real 1:1', x: 410, y: 195, w: 365, h: 65, active: true },
      { id: 'explode-0', text: 'Armado', x: 25, y: 280, w: 235, h: 65, active: true },
      { id: 'explode-50', text: 'Desarmar 50%', x: 282, y: 280, w: 235, h: 65, active: false },
      { id: 'explode-100', text: 'Desarmar 100%', x: 540, y: 280, w: 235, h: 65, active: false },
      { id: 'exam-toggle', text: 'Comenzar Examen', x: 25, y: 365, w: 460, h: 75, active: false, accent: true },
      { id: 'reposition', text: 'Traer al frente', x: 505, y: 365, w: 270, h: 75, active: false },
      { id: 'exit-xr', text: 'Salir del Visor XR', x: 25, y: 460, w: 750, h: 65, danger: true }
    ];

    const draw = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = 'rgba(16, 32, 28, 0.94)';
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 24);
      ctx.fill();

      ctx.strokeStyle = 'rgba(46, 196, 158, 0.45)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#2ec49e';
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillText('VetAR · UNITEC Toluca', 25, 48);

      ctx.fillStyle = '#9fb2ac';
      ctx.font = '19px system-ui, sans-serif';
      ctx.fillText('Menú anatómico en muñeca · Meta Quest 3', 25, 80);

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
      new THREE.PlaneGeometry(0.38, 0.38 * (H / W)),
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

      ctx.fillStyle = 'rgba(14, 28, 24, 0.96)';
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 24);
      ctx.fill();

      ctx.strokeStyle = '#25c298';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = piece && piece.sistema === 'órganos' ? '#c4584c' : '#22aa85';
      ctx.beginPath();
      ctx.roundRect(0, 0, W, 10, [24, 24, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#89baa9';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText((data.category || '').toUpperCase(), 40, 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px "Georgia", serif';
      ctx.fillText(data.nombre || 'Estructura anatómica', 40, 100);

      ctx.fillStyle = '#3ee2b2';
      ctx.font = 'italic 26px "Georgia", serif';
      ctx.fillText(`Nomina Anatomica: ${data.nombreLatino || ''}`, 40, 140);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, 165);
      ctx.lineTo(W - 40, 165);
      ctx.stroke();

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
      new THREE.PlaneGeometry(0.52, 0.52 * (H / W)),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    );
    mesh.position.set(0, 0.55, -0.4);
    mesh.visible = false;

    const buttons = [
      { id: 'exam-close', text: 'Finalizar examen', x: 680, y: 400, w: 270, h: 65 }
    ];

    const update = (feedbackMessage = null, feedbackColor = null) => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      const q = this.examEngine.getCurrentQuestion();
      const stats = this.examEngine.getStats();

      ctx.fillStyle = 'rgba(12, 25, 22, 0.96)';
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 24);
      ctx.fill();

      ctx.strokeStyle = feedbackColor || '#23b58e';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      ctx.fillStyle = '#23b58e';
      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.fillText('EVALUACIÓN ANATÓMICA VETERINARIA — UNITEC', 40, 50);

      ctx.fillStyle = '#d2ded9';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Aciertos: ${stats.score} / ${stats.total}  ·  ${stats.timeFormatted}`, W - 40, 50);
      ctx.textAlign = 'left';

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, 75);
      ctx.lineTo(W - 40, 75);
      ctx.stroke();

      if (stats.finished) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px "Georgia", serif';
        ctx.fillText('¡Examen completado!', 40, 160);

        ctx.fillStyle = '#3ce0b0';
        ctx.font = 'bold 36px system-ui, sans-serif';
        ctx.fillText(`Puntaje final: ${stats.score} de ${stats.total} (${stats.accuracy}%)`, 40, 225);

        ctx.fillStyle = '#b7c8c2';
        ctx.font = '24px system-ui, sans-serif';
        ctx.fillText(`Tiempo total transcurrido: ${stats.timeFormatted}`, 40, 280);
        ctx.fillText('Pulsa "Finalizar examen" para volver al modo libre o inicia otro desde el panel.', 40, 325);
      } else if (q) {
        ctx.fillStyle = '#7caea0';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText(`PREGUNTA ${q.index} DE ${q.total}`, 40, 120);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 46px "Georgia", serif';
        ctx.fillText(`«${q.prompt}»`, 40, 180);

        ctx.fillStyle = '#9cb8af';
        ctx.font = 'italic 23px "Georgia", serif';
        ctx.fillText(`Pista clínica: ${q.pista}`, 40, 230);

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
   * CONTROLADORES Y SEGUIMIENTO DE MANOS
   * ========================================================= */
  setupControllersAndHands() {
    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      controller.userData.index = i;
      controller.addEventListener('selectstart', e => this.onSelectStart(e));
      controller.addEventListener('selectend', e => this.onSelectEnd(e));
      controller.addEventListener('squeezestart', e => this.onSqueezeStart(e));
      controller.addEventListener('squeezeend', e => this.onSqueezeEnd(e));
      this.playerRig.add(controller);
      this.controllers.push(controller);

      // Rayo láser de apuntado
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

      // Grip model
      const grip = this.renderer.xr.getControllerGrip(i);
      const gripModel = this.createStylusModel();
      grip.add(gripModel);
      this.playerRig.add(grip);
      this.controllerGrips.push(grip);

      // Hand tracking
      const hand = this.renderer.xr.getHand(i);
      hand.userData.index = i;

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
      this.playerRig.add(tipDot);
      hand.userData.tipDot = tipDot;

      this.playerRig.add(hand);
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

    // Ajustes de nitidez y foveación para Quest 3
    if (this.renderer.xr.setFramebufferScaleFactor) {
      this.renderer.xr.setFramebufferScaleFactor(1.25);
    }
    if (this.renderer.xr.setFoveation) {
      this.renderer.xr.setFoveation(0.2);
    }

    // Reubicar animal y silueta dentro del contenedor XR
    this.xrRoot.add(this.animal);
    this.xrRoot.add(this.shell);

    // Normalización de escala a tamaño real (~0.75 m de largo)
    this.scaleMultiplier = 1.0;
    this.targetScale = this.realLifeScale;
    this.currentScale = this.realLifeScale;
    this.animal.scale.setScalar(this.currentScale);
    this.shell.scale.setScalar(this.currentScale);

    // Calcular posición inicial usando DogPlacementLogic: a 0.6 m del usuario a altura de pecho/mesa
    const initPos = DogPlacementLogic.calculateInitialPosition({
      cameraPosition: this.camera.position,
      cameraForward: new THREE.Vector3(0, 0, -1),
      distance: 0.6,
      tableHeight: 0.95,
      isAR: kind === 'ar'
    });
    this.xrRoot.position.set(initPos.x, initPos.y, initPos.z);
    this.xrRoot.rotation.set(0, 0, 0);

    // Reset de posición de locomoción
    this.playerRig.position.set(0, 0, 0);

    // Mostrar tarjeta de ayuda inicial con los controles
    this.helpCard.mesh.visible = true;
    this.helpCard.mesh.position.set(0, 1.25, -0.65);
    this.dissectionPanel.mesh.visible = true;

    if (kind === 'vr') {
      this.clinicLab.root.visible = true;
      this.reticle.visible = false;
      this.arPlaced = true;
      this.onToast?.('Modo VR activo: Perro colocado a 0.6 m a tamaño real.');
    } else {
      this.clinicLab.root.visible = false;
      this.reticle.visible = false;
      this.arPlaced = false;
      this.hitTestSourceRequested = false;
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

    this.playerRig.position.set(0, 0, 0);
    this.clinicLab.root.visible = false;
    this.reticle.visible = false;
    this.helpCard.mesh.visible = false;
    this.dissectionPanel.mesh.visible = false;
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
   * ACCIÓN «TRAER AL FRENTE»
   * ========================================================= */
  bringToFront() {
    const fwd = new THREE.Vector3();
    this.camera.getWorldDirection(fwd);
    const camPos = new THREE.Vector3();
    this.camera.getWorldPosition(camPos);

    const targetPos = DogPlacementLogic.calculateInitialPosition({
      cameraPosition: camPos,
      cameraForward: fwd,
      distance: 0.6,
      tableHeight: 0.95,
      isAR: this.xrMode === 'ar'
    });

    this.xrRoot.position.copy(targetPos);
    this.xrRoot.rotation.set(0, 0, 0);
    this.scaleMultiplier = 1.0;
    this.targetScale = this.realLifeScale;
    this.currentScale = this.realLifeScale;
    this.animal.scale.setScalar(this.currentScale);
    this.shell.scale.setScalar(this.currentScale);

    // Actualizar botones de panel y muñeca
    this.updateScaleButtons();
    this.audio.success();
    this.onToast?.('Perro traído al frente a tamaño real (~0.75 m)');
  }

  updateScaleButtons() {
    const isReal = Math.abs(this.scaleMultiplier - 1.0) < 0.05;
    const btnReal = this.dissectionPanel.buttons.find(b => b.id === 'dp-scale-real');
    if (btnReal) btnReal.active = isReal;
    this.dissectionPanel.draw();
  }

  /* =========================================================
   * GESTIÓN DE ESCALAS, CAPAS Y VISTA EXPLOTADA
   * ========================================================= */
  setScaleMultiplier(mul) {
    this.scaleMultiplier = Math.max(0.15, Math.min(4.0, mul));
    this.targetScale = this.realLifeScale * this.scaleMultiplier;
    this.updateScaleButtons();
  }

  setScaleMode(mode) {
    const mul = mode === 'tabletop' ? 0.5 : 1.0;
    this.setScaleMultiplier(mul);
    this.audio.click();

    const bTable = this.wristHUD.buttons.find(b => b.id === 'scale-tabletop');
    const bLife = this.wristHUD.buttons.find(b => b.id === 'scale-lifesize');
    if (bTable) bTable.active = (mode === 'tabletop');
    if (bLife) bLife.active = (mode === 'lifesize');
    this.wristHUD.draw();
  }

  setExplosion(factor) {
    this.explosionTarget = Math.max(0, Math.min(1, factor));
    this.audio.click();

    // Sincronizar botones en panel grande
    for (const b of this.dissectionPanel.buttons) {
      if (b.id === 'dp-explode-0') b.active = Math.abs(factor - 0) < 0.05;
      if (b.id === 'dp-explode-25') b.active = Math.abs(factor - 0.25) < 0.05;
      if (b.id === 'dp-explode-50') b.active = Math.abs(factor - 0.5) < 0.05;
      if (b.id === 'dp-explode-75') b.active = Math.abs(factor - 0.75) < 0.05;
      if (b.id === 'dp-explode-100') b.active = Math.abs(factor - 1.0) < 0.05;
    }
    this.dissectionPanel.draw();

    // Sincronizar muñeca
    const b0 = this.wristHUD.buttons.find(b => b.id === 'explode-0');
    const b50 = this.wristHUD.buttons.find(b => b.id === 'explode-50');
    const b100 = this.wristHUD.buttons.find(b => b.id === 'explode-100');
    if (b0) b0.active = Math.abs(factor - 0) < 0.05;
    if (b50) b50.active = Math.abs(factor - 0.5) < 0.05;
    if (b100) b100.active = Math.abs(factor - 1.0) < 0.05;
    this.wristHUD.draw();
  }

  stepExplosion(direction = 1) {
    const current = this.explosionTarget;
    let nextIndex = 0;
    if (direction > 0) {
      nextIndex = this.explosionSteps.findIndex(s => s > current + 0.04);
      if (nextIndex === -1) nextIndex = this.explosionSteps.length - 1;
    } else {
      for (let i = this.explosionSteps.length - 1; i >= 0; i--) {
        if (this.explosionSteps[i] < current - 0.04) {
          nextIndex = i;
          break;
        }
      }
    }
    this.setExplosion(this.explosionSteps[nextIndex]);
    this.onToast?.(`Despiece: ${Math.round(this.explosionSteps[nextIndex] * 100)}%`);
  }

  toggleLayer(layerKey) {
    if (this.layers[layerKey] !== undefined) {
      this.layers[layerKey] = !this.layers[layerKey];
      this.audio.click();

      // Sincronizar botones en panel grande
      const dpBtn = this.dissectionPanel.buttons.find(b => b.id === `dp-layer-${layerKey}`);
      if (dpBtn) {
        dpBtn.active = this.layers[layerKey];
        dpBtn.text = `${layerKey === 'oseo' ? 'Óseo' : layerKey === 'organos' ? 'Órganos' : 'Silueta'}: ${dpBtn.active ? 'SÍ' : 'NO'}`;
      }
      this.dissectionPanel.draw();

      // Sincronizar muñeca
      const wristBtn = this.wristHUD.buttons.find(b => b.id === `layer-${layerKey}`);
      if (wristBtn) {
        wristBtn.active = this.layers[layerKey];
        wristBtn.text = `${layerKey === 'oseo' ? 'Óseo' : layerKey === 'organos' ? 'Órganos' : 'Silueta'}: ${wristBtn.active ? 'SÍ' : 'NO'}`;
      }
      this.wristHUD.draw();
      this.applyLayers();
    }
  }

  cycleRegion() {
    const list = this.dissectionPanel.regionsList;
    const currentIndex = list.indexOf(this.activeRegion);
    const nextIndex = (currentIndex + 1) % list.length;
    this.activeRegion = list[nextIndex];
    this.audio.click();

    const btn = this.dissectionPanel.buttons.find(b => b.id === 'dp-region-cycle');
    if (btn) {
      const display = this.activeRegion.length > 14 ? this.activeRegion.slice(0, 12) + '…' : this.activeRegion;
      btn.text = `Región: ${display}`;
      btn.active = this.activeRegion !== 'Todas';
    }
    this.dissectionPanel.draw();
    this.applyLayers();
    this.onToast?.(`Filtro por región: ${this.activeRegion}`);
  }

  applyLayers() {
    for (const p of this.catalog) {
      const root = this.objects.get(p.id);
      if (!root) continue;
      const isBone = p.sistema === 'óseo';
      const isOrgan = p.sistema === 'órganos';
      const regionMatch = (this.activeRegion === 'Todas') || (p.region === this.activeRegion);
      const systemMatch = (isBone && this.layers.oseo) || (isOrgan && this.layers.organos);
      root.visible = systemMatch && regionMatch;
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
      const btnWrist = this.wristHUD.buttons.find(b => b.id === 'exam-toggle');
      if (btnWrist) {
        btnWrist.text = 'Comenzar Examen';
        btnWrist.active = false;
      }
      const btnPanel = this.dissectionPanel.buttons.find(b => b.id === 'dp-exam-toggle');
      if (btnPanel) {
        btnPanel.text = 'Modo Examen';
        btnPanel.active = false;
      }
      this.wristHUD.draw();
      this.dissectionPanel.draw();
      this.onToast?.('Examen finalizado.');
    } else {
      this.examEngine.start(8, true);
      this.examBoard.mesh.visible = true;
      this.examBoard.update();
      const btnWrist = this.wristHUD.buttons.find(b => b.id === 'exam-toggle');
      if (btnWrist) {
        btnWrist.text = 'Detener Examen';
        btnWrist.active = true;
      }
      const btnPanel = this.dissectionPanel.buttons.find(b => b.id === 'dp-exam-toggle');
      if (btnPanel) {
        btnPanel.text = 'Detener Examen';
        btnPanel.active = true;
      }
      this.wristHUD.draw();
      this.dissectionPanel.draw();
      this.audio.success();
      this.onToast?.('Modo Examen iniciado: Localiza la estructura solicitada.');
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

    // 1. En AR, si no está fijado y la retícula es visible, anclar perro
    if (this.xrMode === 'ar' && (!this.arPlaced || this.reticle.visible)) {
      if (this.reticle.visible) {
        this.reticle.matrix.decompose(this.xrRoot.position, this.xrRoot.quaternion, new THREE.Vector3());
        this.arPlaced = true;
        this.reticle.visible = false;
        this.audio.success();
        this.onToast?.('Estructura canina fijada en la superficie detectada.');
        return;
      }
    }

    // 2. Comprobar interacción con botones 3D
    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    // Botones de la tarjeta de ayuda
    if (this.helpCard.mesh.visible) {
      const hits = raycaster.intersectObject(this.helpCard.mesh);
      if (hits.length > 0) {
        this.handleHelpCardClick(hits[0].uv);
        return;
      }
    }

    // Botones del panel de disección grande flotante
    if (this.dissectionPanel.mesh.visible) {
      const hits = raycaster.intersectObject(this.dissectionPanel.mesh);
      if (hits.length > 0) {
        this.handleDissectionPanelClick(hits[0].uv);
        return;
      }
    }

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

    // 3. Selección de piezas del perro mediante rayo láser
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
      return;
    }

    // 4. Pellizco o gatillo al vacío: agarrar al perro (manos sin mandos)
    this.startGrab(controller);
  }

  onSelectEnd(event) {
    this.endGrab(event.target);
  }

  onSqueezeStart(event) {
    this.pulseHaptic(event.target.userData.index, 0.5, 40);
    this.startGrab(event.target);
  }

  onSqueezeEnd(event) {
    this.endGrab(event.target);
  }

  // Agarre: 1 mano lleva al perro pegado a la mano; 2 manos escalan, giran y desplazan
  startGrab(controller) {
    const g = this.interaction.grabbers;
    if (g.includes(controller)) return;
    g.push(controller);
    this.beginGrabPose();
  }

  endGrab(controller) {
    const g = this.interaction.grabbers;
    const i = g.indexOf(controller);
    if (i < 0) return;
    g.splice(i, 1);
    this.beginGrabPose();
  }

  beginGrabPose() {
    const g = this.interaction.grabbers;
    this.xrRoot.updateMatrixWorld();
    if (g.length === 1) {
      g[0].updateMatrixWorld();
      this.interaction.offset.copy(g[0].matrixWorld).invert().multiply(this.xrRoot.matrixWorld);
    } else if (g.length >= 2) {
      this.interaction.start = {
        a: g[0].getWorldPosition(new THREE.Vector3()),
        b: g[1].getWorldPosition(new THREE.Vector3()),
        pos: this.xrRoot.position.clone(),
        scale: this.scaleMultiplier
      };
    }
  }

  /* =========================================================
   * MANIPULACIÓN DE CLICS EN PANELES 3D
   * ========================================================= */
  handleHelpCardClick(uv) {
    const px = uv.x * this.helpCard.canvas.width;
    const py = (1 - uv.y) * this.helpCard.canvas.height;
    const hitBtn = this.helpCard.buttons.find(
      b => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h
    );
    if (!hitBtn) return;
    this.audio.click();
    if (hitBtn.id === 'hc-close') {
      this.helpCard.mesh.visible = false;
    }
  }

  handleDissectionPanelClick(uv) {
    const px = uv.x * this.dissectionPanel.canvas.width;
    const py = (1 - uv.y) * this.dissectionPanel.canvas.height;
    const hitBtn = this.dissectionPanel.buttons.find(
      b => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h
    );
    if (!hitBtn) return;

    this.audio.click();

    switch (hitBtn.id) {
      case 'dp-layer-oseo':
        this.toggleLayer('oseo');
        break;
      case 'dp-layer-organos':
        this.toggleLayer('organos');
        break;
      case 'dp-layer-silueta':
        this.toggleLayer('silueta');
        break;
      case 'dp-region-cycle':
        this.cycleRegion();
        break;
      case 'dp-explode-0':
        this.setExplosion(0);
        break;
      case 'dp-explode-25':
        this.setExplosion(0.25);
        break;
      case 'dp-explode-50':
        this.setExplosion(0.5);
        break;
      case 'dp-explode-75':
        this.setExplosion(0.75);
        break;
      case 'dp-explode-100':
        this.setExplosion(1.0);
        break;
      case 'dp-explode-slider': {
        const factor = Math.max(0, Math.min(1, (px - hitBtn.x) / hitBtn.w));
        this.setExplosion(factor);
        break;
      }
      case 'dp-isolate': {
        const active = !hitBtn.active;
        hitBtn.active = active;
        for (const p of this.catalog) {
          const root = this.objects.get(p.id);
          if (!root) continue;
          root.visible = !active || (this.selectedPiece && p.id === this.selectedPiece.id);
        }
        this.dissectionPanel.draw();
        break;
      }
      case 'dp-translucent': {
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
        this.dissectionPanel.draw();
        break;
      }
      case 'dp-scale-down':
        this.setScaleMultiplier(this.scaleMultiplier * 0.85);
        this.onToast?.(`Escala: ${(this.scaleMultiplier).toFixed(2)}×`);
        break;
      case 'dp-scale-up':
        this.setScaleMultiplier(this.scaleMultiplier * 1.15);
        this.onToast?.(`Escala: ${(this.scaleMultiplier).toFixed(2)}×`);
        break;
      case 'dp-scale-real':
        this.setScaleMultiplier(1.0);
        this.onToast?.('Escala restaurada a Tamaño Real 1:1 (~0.75 m)');
        break;
      case 'dp-height-up':
        this.xrRoot.position.y = Math.min(2.2, this.xrRoot.position.y + 0.08);
        break;
      case 'dp-height-down':
        this.xrRoot.position.y = Math.max(0.2, this.xrRoot.position.y - 0.08);
        break;
      case 'dp-bring-front':
        this.bringToFront();
        break;
      case 'dp-exam-toggle':
        this.toggleExam();
        break;
      case 'dp-help':
        this.helpCard.mesh.visible = !this.helpCard.mesh.visible;
        break;
      case 'dp-close-corner':
        this.dissectionPanel.mesh.visible = false;
        break;
    }
  }

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
        this.bringToFront();
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
    const delta = 0.016; // 60-72 fps estables

    // 1. Interpolación suave de despiece radial
    if (Math.abs(this.explosionCurrent - this.explosionTarget) > 0.001) {
      this.explosionCurrent += (this.explosionTarget - this.explosionCurrent) * 0.15;
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

    // 2. Interpolación suave de escala continua
    if (Math.abs(this.currentScale - this.targetScale) > 0.0001) {
      this.currentScale += (this.targetScale - this.currentScale) * 0.18;
      this.animal.scale.setScalar(this.currentScale);
      this.shell.scale.setScalar(this.currentScale);

      // Ajustar posición vertical y tamaño de sombra de contacto falsa
      const scaleRatio = this.currentScale / (this.realLifeScale || 1e-4);
      this.contactShadow.scale.set(scaleRatio, scaleRatio, scaleRatio);
      this.contactShadow.position.y = -0.18 * scaleRatio;
    }

    // 3. Procesamiento de mandos Meta Quest 3 (Palancas y Botones A/B/X/Y)
    if (this.session && this.session.inputSources) {
      let rightGamepad = null;
      let leftGamepad = null;

      for (const source of this.session.inputSources) {
        if (!source.gamepad) continue;
        if (source.handedness === 'right') rightGamepad = source.gamepad;
        if (source.handedness === 'left') leftGamepad = source.gamepad;
      }

      // Palanca derecha: arriba/abajo = escala continua 0.15x a 4x; izq/der = girar perro
      if (rightGamepad && this.interaction.grabbers.length === 0) {
        // En Quest, thumbstick son axes[2] y [3] si axes.length >= 4, o axes[0] y [1]
        const rx = rightGamepad.axes.length >= 4 && (Math.abs(rightGamepad.axes[2]) > 0.05 || Math.abs(rightGamepad.axes[3]) > 0.05)
          ? rightGamepad.axes[2]
          : rightGamepad.axes[0];
        const ry = rightGamepad.axes.length >= 4 && (Math.abs(rightGamepad.axes[2]) > 0.05 || Math.abs(rightGamepad.axes[3]) > 0.05)
          ? rightGamepad.axes[3]
          : rightGamepad.axes[1];

        const rRes = ThumbstickControlLogic.mapRightStick({
          stickX: rx,
          stickY: ry,
          currentScaleMultiplier: this.scaleMultiplier,
          currentRotationY: 0,
          deltaSec: delta
        });

        if (rRes.scaleMultiplier !== this.scaleMultiplier) {
          this.setScaleMultiplier(rRes.scaleMultiplier);
        }
        if (rRes.rotationY) this.xrRoot.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), rRes.rotationY);
      }

      // Palanca izquierda: en VR camina (locomoción suave); en AR adelante/atrás aleja o acerca el perro
      if (leftGamepad) {
        const lx = leftGamepad.axes.length >= 4 && (Math.abs(leftGamepad.axes[2]) > 0.05 || Math.abs(leftGamepad.axes[3]) > 0.05)
          ? leftGamepad.axes[2]
          : leftGamepad.axes[0];
        const ly = leftGamepad.axes.length >= 4 && (Math.abs(leftGamepad.axes[2]) > 0.05 || Math.abs(leftGamepad.axes[3]) > 0.05)
          ? leftGamepad.axes[3]
          : leftGamepad.axes[1];

        const camFwd = new THREE.Vector3();
        this.camera.getWorldDirection(camFwd);
        const camWorldPos = new THREE.Vector3();
        this.camera.getWorldPosition(camWorldPos);

        const lRes = ThumbstickControlLogic.mapLeftStick({
          stickX: lx,
          stickY: ly,
          currentPosition: this.xrRoot.position,
          cameraPosition: camWorldPos,
          cameraForward: camFwd,
          deltaSec: delta,
          isLocomotion: this.xrMode === 'vr',
          cameraRigPosition: this.playerRig.position
        });

        if (lRes.handled === 'locomotion') {
          this.playerRig.position.set(lRes.cameraRigPosition.x, lRes.cameraRigPosition.y, lRes.cameraRigPosition.z);
        } else if (this.interaction.grabbers.length === 0) {
          this.xrRoot.position.set(lRes.position.x, lRes.position.y, lRes.position.z);
        }
      }

      // Botones A, B (mando derecho) y X, Y (mando izquierdo)
      const currentButtons = {
        a: !!(rightGamepad && rightGamepad.buttons[4] && rightGamepad.buttons[4].pressed),
        b: !!(rightGamepad && rightGamepad.buttons[5] && rightGamepad.buttons[5].pressed),
        x: !!(leftGamepad && leftGamepad.buttons[4] && leftGamepad.buttons[4].pressed),
        y: !!(leftGamepad && leftGamepad.buttons[5] && leftGamepad.buttons[5].pressed)
      };

      const actions = ThumbstickControlLogic.processButtons({
        current: currentButtons,
        previous: this.prevGamepadButtons
      });

      for (const act of actions) {
        if (act === 'bring_to_front') {
          this.bringToFront();
        } else if (act === 'toggle_panel') {
          if (this.helpCard.mesh.visible) {
            this.helpCard.mesh.visible = false;
          } else {
            this.dissectionPanel.mesh.visible = !this.dissectionPanel.mesh.visible;
            this.audio.click();
          }
        } else if (act === 'prev_dissection') {
          this.stepExplosion(-1);
        } else if (act === 'next_dissection') {
          this.stepExplosion(1);
        }
      }

      this.prevGamepadButtons = currentButtons;
    }

    // 4. Hit-test en AR (passthrough)
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

    // 5. Posicionamiento del Menú en la Muñeca Izquierda
    const leftController = this.controllers[0];
    if (leftController && leftController.visible) {
      this.wristHUD.mesh.visible = true;
      const pos = new THREE.Vector3(0.08, 0.05, 0.04).applyMatrix4(leftController.matrixWorld);
      this.wristHUD.mesh.position.copy(pos);
      this.wristHUD.mesh.quaternion.copy(leftController.quaternion);
      this.wristHUD.mesh.rotateX(-Math.PI / 4);
    } else {
      this.wristHUD.mesh.visible = false;
    }

    // 6. Orientación de paneles hacia el usuario (Billboard horizontal)
    const camPos = new THREE.Vector3();
    this.camera.getWorldPosition(camPos);
    if (this.floatingCard.mesh.visible) {
      this.floatingCard.mesh.lookAt(camPos);
    }
    if (this.examBoard.mesh.visible) {
      this.examBoard.mesh.lookAt(camPos);
    }
    if (this.helpCard.mesh.visible) {
      this.helpCard.mesh.lookAt(camPos);
    }
    if (this.dissectionPanel.mesh.visible) {
      this.dissectionPanel.mesh.lookAt(camPos);
    }

    // 7. Agarre 6DoF y manipulación bimanual
    const grabbers = this.interaction.grabbers;
    if (grabbers.length === 1) {
      const m = new THREE.Matrix4().multiplyMatrices(grabbers[0].matrixWorld, this.interaction.offset);
      m.decompose(this.xrRoot.position, this.xrRoot.quaternion, new THREE.Vector3());
    } else if (grabbers.length >= 2 && this.interaction.start) {
      const st = this.interaction.start;
      const r = GrabLogic.twoHand({
        startA: st.a, startB: st.b,
        nowA: grabbers[0].getWorldPosition(new THREE.Vector3()),
        nowB: grabbers[1].getWorldPosition(new THREE.Vector3()),
        startPos: st.pos
      });
      this.setScaleMultiplier(st.scale * r.scaleRatio);
      this.xrRoot.position.set(r.position.x, r.position.y, r.position.z);
      this.xrRoot.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), r.yaw - (st.yawApplied || 0));
      st.yawApplied = r.yaw;
    }

    // 8. Hand tracking: toque con el dedo índice (piezas y paneles 3D)
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

        if (time - (hand.userData.lastTouchTime || 0) > 0.7) {
          // Comprobar toque directo en piezas (umbral 4 cm)
          const touchPiece = this.findPieceNearPoint(tipPos, 0.04);
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

  findPieceNearPoint(worldPoint, threshold = 0.04) {
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

    const scaledThreshold = threshold / (this.currentScale || 1e-4);
    return closestDist <= scaledThreshold ? closestPiece : null;
  }
}
