// vet/logica.js - Lógica pura para selección anatómica, modo examen y vista explotada.
// Compatible con Node.js (test) y navegadores ES Modules.

export const EXAM_QUESTIONS = [
  {
    id: 'humerus',
    nombre: 'Húmero',
    nombreLatino: 'Humerus',
    sistema: 'óseo',
    prompt: 'Toca el húmero',
    pista: 'Hueso largo proximal del brazo (miembro torácico).',
    targetIds: ['legs-left-front-humerus', 'legs-right-front-humerus']
  },
  {
    id: 'femur',
    nombre: 'Fémur',
    nombreLatino: 'Os femoris',
    sistema: 'óseo',
    prompt: 'Toca el fémur',
    pista: 'Hueso más robusto del muslo (miembro pélvico).',
    targetIds: ['legs-left-back-femur', 'legs-right-back-femur']
  },
  {
    id: 'scapula',
    nombre: 'Escápula',
    nombreLatino: 'Scapula',
    sistema: 'óseo',
    prompt: 'Toca la escápula',
    pista: 'Hueso plano triangular dorsal en el hombro.',
    targetIds: ['legs-left-front-scapula', 'legs-right-front-scapula']
  },
  {
    id: 'heart',
    nombre: 'Corazón',
    nombreLatino: 'Cor',
    sistema: 'órganos',
    prompt: 'Toca el corazón',
    pista: 'Órgano muscular central situado en la cavidad torácica.',
    targetIds: ['organs-heart']
  },
  {
    id: 'lungs',
    nombre: 'Pulmones',
    nombreLatino: 'Pulmones',
    sistema: 'órganos',
    prompt: 'Toca los pulmones',
    pista: 'Órganos respiratorios pares que rodean al corazón.',
    targetIds: ['organs-lungs']
  },
  {
    id: 'liver',
    nombre: 'Hígado',
    nombreLatino: 'Hepar',
    sistema: 'órganos',
    prompt: 'Toca el hígado',
    pista: 'Órgano glandular voluminoso craneal al estómago y pegado al diafragma.',
    targetIds: ['organs-liver']
  },
  {
    id: 'stomach',
    nombre: 'Estómago',
    nombreLatino: 'Ventriculus',
    sistema: 'órganos',
    prompt: 'Toca el estómago',
    pista: 'Dilatación del tubo digestivo entre el esófago y el duodeno.',
    targetIds: ['organs-stomach']
  },
  {
    id: 'kidneys',
    nombre: 'Riñones',
    nombreLatino: 'Renes',
    sistema: 'órganos',
    prompt: 'Toca los riñones',
    pista: 'Órganos retroperitoneales con forma de haba encargados de la orina.',
    targetIds: ['organs-kidneys']
  },
  {
    id: 'bladder',
    nombre: 'Vejiga urinaria',
    nombreLatino: 'Vesica urinaria',
    sistema: 'órganos',
    prompt: 'Toca la vejiga urinaria',
    pista: 'Reservorio muscular piriforme en la entrada pelviana.',
    targetIds: ['organs-bladder']
  },
  {
    id: 'skull',
    nombre: 'Cráneo',
    nombreLatino: 'Cranium',
    sistema: 'óseo',
    prompt: 'Toca el cráneo',
    pista: 'Caja ósea que protege el encéfalo y da soporte a los órganos sensoriales.',
    targetIds: ['skull-skull']
  },
  {
    id: 'mandible',
    nombre: 'Mandíbula',
    nombreLatino: 'Mandibula',
    sistema: 'óseo',
    prompt: 'Toca la mandíbula',
    pista: 'Hueso móvil inferior que porta los dientes mandibulares.',
    targetIds: ['skull-mandible']
  },
  {
    id: 'patella',
    nombre: 'Rótula',
    nombreLatino: 'Patella',
    sistema: 'óseo',
    prompt: 'Toca la rótula',
    pista: 'Hueso sesamoideo anterior de la articulación femorotibial (rodilla).',
    targetIds: ['legs-left-back-patella', 'legs-right-back-patella']
  },
  {
    id: 'tibia',
    nombre: 'Tibia',
    nombreLatino: 'Tibia',
    sistema: 'óseo',
    prompt: 'Toca la tibia',
    pista: 'Hueso mayor medial de la pierna entre rodilla y tarso.',
    targetIds: ['legs-left-back-tibia', 'legs-right-back-tibia']
  },
  {
    id: 'radius',
    nombre: 'Radio',
    nombreLatino: 'Radius',
    sistema: 'óseo',
    prompt: 'Toca el radio',
    pista: 'Hueso dorsal del antebrazo principal en el soporte del peso.',
    targetIds: ['legs-left-front-radius', 'legs-right-front-radius']
  },
  {
    id: 'pelvis',
    nombre: 'Hueso coxal / Pelvis',
    nombreLatino: 'Os coxae',
    sistema: 'óseo',
    prompt: 'Toca el hueso coxal (pelvis)',
    pista: 'Cintura pelviana formada por ilion, isquion y pubis.',
    targetIds: ['pelvis-tail-os-coxae']
  }
];

export class ExamEngine {
  constructor(catalog = [], questionBank = EXAM_QUESTIONS) {
    this.catalog = catalog;
    this.catalogMap = new Map(catalog.map(p => [p.id, p]));
    this.bank = questionBank;
    this.active = false;
    this.currentIndex = 0;
    this.questions = [];
    this.score = 0;
    this.attempts = 0;
    this.history = [];
    this.startTime = null;
    this.endTime = null;
  }

  start(count = 10, shuffle = true) {
    let pool = [...this.bank];
    if (shuffle) {
      pool.sort(() => Math.random() - 0.5);
    }
    this.questions = pool.slice(0, Math.min(count, pool.length));
    this.active = true;
    this.currentIndex = 0;
    this.score = 0;
    this.attempts = 0;
    this.history = [];
    this.startTime = Date.now();
    this.endTime = null;
    return this.getCurrentQuestion();
  }

  stop() {
    this.active = false;
    this.endTime = Date.now();
    return this.getStats();
  }

  getCurrentQuestion() {
    if (!this.active || this.currentIndex >= this.questions.length) {
      return null;
    }
    const q = this.questions[this.currentIndex];
    return {
      index: this.currentIndex + 1,
      total: this.questions.length,
      id: q.id,
      prompt: `${q.prompt} (${q.nombreLatino})`,
      nombre: q.nombre,
      nombreLatino: q.nombreLatino,
      sistema: q.sistema,
      pista: q.pista,
      targetIds: q.targetIds
    };
  }

  submitAnswer(pieceId) {
    if (!this.active) {
      return { active: false, error: 'Examen no iniciado' };
    }
    const current = this.questions[this.currentIndex];
    if (!current) {
      return { active: false, finished: true };
    }
    this.attempts++;
    const touchedPiece = this.catalogMap.get(pieceId);
    const isCorrect = current.targetIds.includes(pieceId) || (
      touchedPiece && touchedPiece.nombreLatino &&
      touchedPiece.nombreLatino.toLowerCase() === current.nombreLatino.toLowerCase()
    );

    if (isCorrect) {
      this.score++;
      this.history.push({
        questionId: current.id,
        pieceId,
        correct: true,
        attempts: 1
      });
      this.currentIndex++;
      const finished = this.currentIndex >= this.questions.length;
      if (finished) {
        this.active = false;
        this.endTime = Date.now();
      }
      return {
        correct: true,
        message: `¡Correcto! ${current.nombre} (${current.nombreLatino})`,
        score: this.score,
        total: this.questions.length,
        finished,
        nextQuestion: finished ? null : this.getCurrentQuestion()
      };
    } else {
      const actualName = touchedPiece ? `${touchedPiece.nombre} (${touchedPiece.nombreLatino})` : pieceId;
      return {
        correct: false,
        message: `Incorrecto. Tocaste: ${actualName}. Intenta de nuevo: ${current.prompt}.`,
        expected: `${current.nombre} (${current.nombreLatino})`,
        actual: actualName,
        score: this.score,
        total: this.questions.length,
        finished: false
      };
    }
  }

  getStats() {
    const elapsed = ((this.endTime || (this.startTime ? Date.now() : 0)) - (this.startTime || 0)) / 1000;
    const minutes = Math.floor(elapsed / 60);
    const seconds = Math.floor(elapsed % 60);
    const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const total = this.questions.length || 0;
    const accuracy = total > 0 ? Math.round((this.score / total) * 100) : 0;
    return {
      active: this.active,
      score: this.score,
      attempts: this.attempts,
      total,
      accuracy,
      elapsedSeconds: Math.round(elapsed),
      timeFormatted,
      finished: !this.active && total > 0 && this.currentIndex >= total
    };
  }
}

export class ExplodedViewLogic {
  /**
   * Calcula el vector de dirección normalizado en el que debe separarse una pieza.
   * Considera la región anatómica y la posición relativa al centro general del modelo.
   */
  static computeDirection(piece, pieceCenter = {x: 0, y: 0, z: 0}, animalCenter = {x: 0, y: 0, z: 0}) {
    const dx = pieceCenter.x - animalCenter.x;
    const dy = pieceCenter.y - animalCenter.y;
    const dz = pieceCenter.z - animalCenter.z;

    let vx = dx;
    let vy = dy;
    let vz = dz;

    const reg = (piece.region || '').toLowerCase();
    const sis = (piece.sistema || '').toLowerCase();

    // Sesgo anatómico por regiones
    if (reg.includes('cabeza')) {
      vz += 1.8;
      vy += 0.4;
    } else if (reg.includes('cuello')) {
      vz += 1.0;
      vy += 0.8;
    } else if (reg.includes('pelvis') || reg.includes('cola')) {
      vz -= 1.6;
      vy += 0.3;
    } else if (reg.includes('izquierdo')) {
      vx -= 1.4;
      vy -= 0.5;
    } else if (reg.includes('derecho')) {
      vx += 1.4;
      vy -= 0.5;
    } else if (reg.includes('tórax')) {
      vx += (dx >= 0 ? 0.9 : -0.9);
      vy += 0.2;
    } else if (reg.includes('columna')) {
      vy += 1.2;
    }

    if (sis === 'órganos') {
      vy -= 0.8;
      vx += (dx >= 0 ? 0.5 : -0.5);
    }

    const len = Math.hypot(vx, vy, vz) || 1;
    return {
      x: vx / len,
      y: vy / len,
      z: vz / len
    };
  }

  /**
   * Calcula el desplazamiento tridimensional a partir del vector base, el factor (0..1)
   * y la distancia máxima de explosión.
   */
  static computeOffset(direction, factor = 0, maxDistance = 0.4) {
    const f = Math.max(0, Math.min(1, factor));
    return {
      x: direction.x * maxDistance * f,
      y: direction.y * maxDistance * f,
      z: direction.z * maxDistance * f
    };
  }
}

export class SelectionLogic {
  static formatCard(piece) {
    if (!piece) {
      return {
        title: 'Atlas canino',
        latin: 'Canis lupus familiaris',
        category: 'Medicina Veterinaria — UNITEC',
        description: 'Toca una estructura anatómica con el dedo índice o apúntala para consultar sus detalles clínicos.'
      };
    }
    const sis = piece.sistema === 'óseo' ? 'Sistema óseo' : 'Órganos internos';
    return {
      id: piece.id,
      title: `${piece.nombre} (${piece.nombreLatino})`,
      nombre: piece.nombre,
      nombreLatino: piece.nombreLatino,
      category: `${sis} · ${piece.region}`,
      description: piece.descripcion || 'Sin descripción clínica disponible.'
    };
  }
}

export const ScalePresets = {
  TABLETOP: {
    id: 'tabletop',
    name: 'Mesa clínica',
    scaleFactor: 0.38,
    label: 'Escala mesa (38 cm)'
  },
  REAL: {
    id: 'real',
    name: 'Tamaño real (~0.75 m)',
    scaleFactor: 0.75,
    label: 'Tamaño real (75 cm)'
  },
  LIFESIZE: {
    id: 'lifesize',
    name: 'Escala real 1:1',
    scaleFactor: 0.75,
    label: 'Escala real (75 cm)'
  }
};

export class DogPlacementLogic {
  /**
   * Calcula el factor de escala para normalizar el perro a tamaño real (~0.75 m de largo).
   * Determina el largo principal a partir del Box3 (eje longitudinal craneal-caudal).
   */
  static calculateRealScale(boxSize = { x: 1, y: 1, z: 1 }, targetLength = 0.75) {
    const length = Math.max(boxSize.z || 0, boxSize.x || 0, 1e-4);
    return targetLength / length;
  }

  /**
   * Calcula la posición inicial del perro para que aparezca a 0.6 m frente al usuario,
   * a la altura del pecho/mesa, garantizando que nunca quede encima del usuario.
   * En AR con hit-test, se coloca sobre la superficie detectada.
   */
  static calculateInitialPosition({
    cameraPosition = { x: 0, y: 1.6, z: 0 },
    cameraForward = { x: 0, y: 0, z: -1 },
    distance = 0.6,
    tableHeight = 0.95,
    isAR = false,
    hitTestPose = null
  } = {}) {
    if (isAR && hitTestPose) {
      return {
        x: hitTestPose.x,
        y: hitTestPose.y,
        z: hitTestPose.z
      };
    }

    // Dirección horizontal (proyectada en plano XZ)
    let fx = cameraForward.x || 0;
    let fz = cameraForward.z !== undefined ? cameraForward.z : -1;
    const len = Math.hypot(fx, fz);
    if (len < 1e-4) {
      fx = 0;
      fz = -1;
    } else {
      fx /= len;
      fz /= len;
    }

    const camX = cameraPosition.x || 0;
    const camY = cameraPosition.y !== undefined ? cameraPosition.y : 1.6;
    const camZ = cameraPosition.z || 0;

    // Colocar a 0.6 m frente al usuario
    const x = camX + fx * distance;
    const z = camZ + fz * distance;

    // Altura: a la altura de la mesa / pecho, garantizando que esté por debajo de los ojos del usuario
    // (nunca encima del usuario)
    const chestHeight = camY - 0.45;
    const y = Math.max(0.65, Math.min(tableHeight, chestHeight));

    return { x, y, z };
  }
}

export class ThumbstickControlLogic {
  /**
   * Palanca derecha:
   * arriba/abajo = escala continua 0.15× a 4× (suave, alrededor del centro del perro)
   * izquierda/derecha = girar el perro
   */
  static mapRightStick({
    stickX = 0,
    stickY = 0,
    currentScaleMultiplier = 1.0,
    currentRotationY = 0,
    deltaSec = 0.016,
    scaleSpeed = 1.0,
    rotSpeed = 2.0,
    minMultiplier = 0.15,
    maxMultiplier = 4.0,
    deadzone = 0.12
  } = {}) {
    let scaleMultiplier = currentScaleMultiplier;
    let rotationY = currentRotationY;

    if (Math.abs(stickX) > deadzone) {
      // stickX > 0 (derecha) rota el perro
      rotationY -= stickX * rotSpeed * deltaSec;
    }

    if (Math.abs(stickY) > deadzone) {
      // En gamepads stick hacia arriba es negativo. stickY < 0 => agrandar; stickY > 0 => reducir
      const scaleDelta = Math.exp(-stickY * scaleSpeed * deltaSec);
      scaleMultiplier = Math.max(minMultiplier, Math.min(maxMultiplier, currentScaleMultiplier * scaleDelta));
    }

    return { scaleMultiplier, rotationY };
  }

  /**
   * Palanca izquierda:
   * AR: adelante/atrás = alejar/acercar el perro.
   *
   * VR (locomoción):
   * desplaza suavemente la posición del usuario/rig sin tener que caminar físicamente.
   */
  static mapLeftStick({
    stickX = 0,
    stickY = 0,
    currentPosition = { x: 0, y: 0.95, z: -0.6 },
    cameraPosition = { x: 0, y: 1.6, z: 0 },
    cameraForward = { x: 0, y: 0, z: -1 },
    deltaSec = 0.016,
    moveSpeed = 0.7,
    deadzone = 0.12,
    isLocomotion = false,
    cameraRigPosition = { x: 0, y: 0, z: 0 }
  } = {}) {
    if (isLocomotion) {
      // Locomoción suave del usuario en VR
      let fx = cameraForward.x || 0;
      let fz = cameraForward.z !== undefined ? cameraForward.z : -1;
      const flen = Math.hypot(fx, fz) || 1;
      fx /= flen; fz /= flen;
      // Vector perpendicular (strafe derecha)
      const rx = -fz;
      const rz = fx;

      const newRig = { ...cameraRigPosition };
      if (Math.abs(stickY) > deadzone) {
        // stickY < 0 (adelante): avanzar
        const step = -stickY * moveSpeed * deltaSec;
        newRig.x += fx * step;
        newRig.z += fz * step;
      }
      if (Math.abs(stickX) > deadzone) {
        // stickX (lateral): strafe
        const step = stickX * moveSpeed * deltaSec;
        newRig.x += rx * step;
        newRig.z += rz * step;
      }
      return {
        handled: 'locomotion',
        cameraRigPosition: newRig,
        position: currentPosition
      };
    }

    // AR: adelante/atrás aleja o acerca el perro (la altura se ajusta agarrándolo)
    let newX = currentPosition.x;
    const newY = currentPosition.y;
    let newZ = currentPosition.z;

    if (Math.abs(stickY) > deadzone) {
      const dx = currentPosition.x - cameraPosition.x;
      const dz = currentPosition.z - cameraPosition.z;
      const dist = Math.hypot(dx, dz) || 0.6;
      // stickY < 0 (adelante) aleja el perro
      const newDist = Math.max(0.25, Math.min(3.0, dist - stickY * moveSpeed * deltaSec));
      newX = cameraPosition.x + (dx / dist) * newDist;
      newZ = cameraPosition.z + (dz / dist) * newDist;
    }

    return {
      handled: 'dog_move',
      position: { x: newX, y: newY, z: newZ },
      cameraRigPosition
    };
  }

  /**
   * Procesa botones A, B, X, Y con detección de flanco de subida (pulsación única)
   */
  static processButtons({
    current = { a: false, b: false, x: false, y: false },
    previous = { a: false, b: false, x: false, y: false }
  } = {}) {
    const actions = [];
    if (current.a && !previous.a) actions.push('bring_to_front');
    if (current.b && !previous.b) actions.push('toggle_panel');
    if (current.x && !previous.x) actions.push('prev_dissection');
    if (current.y && !previous.y) actions.push('next_dissection');
    return actions;
  }
}

/**
 * Agarre con dos manos: el perro sigue el punto medio entre las manos,
 * escala con la distancia entre ellas y gira con el ángulo horizontal.
 */
export class GrabLogic {
  static twoHand({ startA, startB, nowA, nowB, startPos }) {
    const mid = (p, q) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2, z: (p.z + q.z) / 2 });
    const m0 = mid(startA, startB);
    const m1 = mid(nowA, nowB);
    const d0 = Math.hypot(startB.x - startA.x, startB.y - startA.y, startB.z - startA.z);
    const d1 = Math.hypot(nowB.x - nowA.x, nowB.y - nowA.y, nowB.z - nowA.z);
    const scaleRatio = d0 > 0.01 ? d1 / d0 : 1;
    // Giro sobre el eje vertical (three.js: rotación +y lleva +x hacia -z)
    const yaw = Math.atan2(-(nowB.z - nowA.z), nowB.x - nowA.x)
      - Math.atan2(-(startB.z - startA.z), startB.x - startA.x);
    const ox = (startPos.x - m0.x) * scaleRatio;
    const oz = (startPos.z - m0.z) * scaleRatio;
    const c = Math.cos(yaw), s = Math.sin(yaw);
    return {
      scaleRatio,
      yaw,
      position: {
        x: m1.x + ox * c + oz * s,
        y: m1.y + (startPos.y - m0.y) * scaleRatio,
        z: m1.z - ox * s + oz * c
      }
    };
  }
}
