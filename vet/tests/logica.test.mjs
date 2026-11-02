// vet/tests/logica.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  EXAM_QUESTIONS,
  ExamEngine,
  ExplodedViewLogic,
  SelectionLogic,
  ScalePresets,
  DogPlacementLogic,
  ThumbstickControlLogic
} from '../logica.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pieces = JSON.parse(await readFile(path.join(root, 'datos/piezas.json'), 'utf8'));

test('banco de preguntas de examen veterinario está validado contra el catálogo', () => {
  assert.ok(EXAM_QUESTIONS.length >= 10, 'debe tener al menos 10 preguntas anatómicas');
  const catalogIds = new Set(pieces.map(p => p.id));
  for (const q of EXAM_QUESTIONS) {
    assert.ok(q.id && q.prompt && q.nombre && q.nombreLatino && q.sistema, `pregunta ${q.id} incompleta`);
    assert.ok(q.targetIds.length > 0, `pregunta ${q.id} sin targets`);
    for (const tid of q.targetIds) {
      assert.ok(catalogIds.has(tid), `targetId ${tid} no existe en catálogo de piezas`);
    }
  }
});

test('ExamEngine gestiona ciclo completo de evaluación, tiempos y puntaje', () => {
  const engine = new ExamEngine(pieces, EXAM_QUESTIONS);
  assert.equal(engine.active, false);

  const firstQ = engine.start(5, false); // sin barajar para orden determinista
  assert.ok(firstQ);
  assert.equal(firstQ.index, 1);
  assert.equal(firstQ.total, 5);
  assert.equal(firstQ.id, EXAM_QUESTIONS[0].id);

  // Respuesta incorrecta
  const wrongRes = engine.submitAnswer('non-existent-id');
  assert.equal(wrongRes.correct, false);
  assert.equal(wrongRes.score, 0);
  assert.equal(engine.score, 0);
  assert.equal(engine.attempts, 1);

  // Respuesta correcta al húmero
  const correctTarget = EXAM_QUESTIONS[0].targetIds[0];
  const rightRes = engine.submitAnswer(correctTarget);
  assert.equal(rightRes.correct, true);
  assert.equal(rightRes.score, 1);
  assert.equal(engine.score, 1);
  assert.equal(rightRes.finished, false);

  // Completar las 4 preguntas restantes
  for (let i = 1; i < 5; i++) {
    const q = EXAM_QUESTIONS[i];
    const res = engine.submitAnswer(q.targetIds[0]);
    assert.equal(res.correct, true);
  }

  const stats = engine.getStats();
  assert.equal(stats.active, false);
  assert.equal(stats.score, 5);
  assert.equal(stats.total, 5);
  assert.equal(stats.accuracy, 100);
  assert.equal(stats.finished, true);
  assert.match(stats.timeFormatted, /^\d{2}:\d{2}$/);
});

test('ExplodedViewLogic genera vectores normalizados con sesgo anatómico coherente', () => {
  const headPiece = pieces.find(p => p.region === 'Cabeza');
  const dirHead = ExplodedViewLogic.computeDirection(headPiece, {x: 0, y: 10, z: 20}, {x: 0, y: 0, z: 0});
  const magHead = Math.hypot(dirHead.x, dirHead.y, dirHead.z);
  assert.ok(Math.abs(magHead - 1) < 0.001, 'el vector debe estar normalizado');
  assert.ok(dirHead.z > 0, 'la cabeza debe expandirse hacia adelante');

  const leftLegPiece = pieces.find(p => p.region.includes('izquierdo'));
  const dirLeft = ExplodedViewLogic.computeDirection(leftLegPiece, {x: -10, y: -5, z: 0}, {x: 0, y: 0, z: 0});
  assert.ok(dirLeft.x < 0, 'miembro izquierdo debe expandirse lateralmente a la izquierda');

  const rightLegPiece = pieces.find(p => p.region.includes('derecho'));
  const dirRight = ExplodedViewLogic.computeDirection(rightLegPiece, {x: 10, y: -5, z: 0}, {x: 0, y: 0, z: 0});
  assert.ok(dirRight.x > 0, 'miembro derecho debe expandirse lateralmente a la derecha');

  // Comprobar cálculo de offset con factor
  const offset0 = ExplodedViewLogic.computeOffset(dirHead, 0, 0.5);
  assert.deepEqual(offset0, {x: 0, y: 0, z: 0});

  const offsetHalf = ExplodedViewLogic.computeOffset(dirHead, 0.5, 0.4);
  assert.ok(offsetHalf.z > 0 && Math.abs(offsetHalf.z - (dirHead.z * 0.2)) < 0.001);
});

test('SelectionLogic formatea correctamente la ficha NAV en español y latín', () => {
  const humerus = pieces.find(p => p.id === 'legs-left-front-humerus');
  const card = SelectionLogic.formatCard(humerus);
  assert.equal(card.id, 'legs-left-front-humerus');
  assert.match(card.title, /Húmero \(Humerus\)/);
  assert.match(card.category, /Sistema óseo · Miembro torácico izquierdo/);
  assert.ok(card.description.length > 10);

  const emptyCard = SelectionLogic.formatCard(null);
  assert.equal(emptyCard.title, 'Atlas canino');
  assert.match(emptyCard.category, /UNITEC/);
});

test('ScalePresets define escalas clínica de mesa y real 1:1', () => {
  assert.ok(ScalePresets.TABLETOP.scaleFactor > 0.2 && ScalePresets.TABLETOP.scaleFactor < 0.5);
  assert.ok(ScalePresets.LIFESIZE.scaleFactor >= 0.7 && ScalePresets.LIFESIZE.scaleFactor <= 1.0);
  assert.equal(ScalePresets.TABLETOP.id, 'tabletop');
  assert.equal(ScalePresets.LIFESIZE.id, 'lifesize');
});

test('DogPlacementLogic normaliza el perro a tamaño real (~0.75 m) y lo coloca a 0.6 m', () => {
  // 1. Normalización de escala desde Box3 (longitud ~930 mm a 0.75 m)
  const boxSize = { x: 260, y: 440, z: 930 };
  const realScale = DogPlacementLogic.calculateRealScale(boxSize, 0.75);
  const normalizedLength = boxSize.z * realScale;
  assert.ok(Math.abs(normalizedLength - 0.75) < 0.001, `longitud normalizada ${normalizedLength}`);

  // 2. Colocación inicial en VR: a 0.6 m del usuario a altura de pecho/mesa, nunca encima
  const camPos = { x: 0, y: 1.6, z: 0 };
  const camFwd = { x: 0, y: 0, z: -1 };
  const posVR = DogPlacementLogic.calculateInitialPosition({
    cameraPosition: camPos,
    cameraForward: camFwd,
    distance: 0.6,
    tableHeight: 0.95,
    isAR: false
  });
  assert.equal(posVR.x, 0);
  assert.ok(Math.abs(posVR.z - (-0.6)) < 0.001, `z a 0.6m en frente: ${posVR.z}`);
  assert.ok(posVR.y < camPos.y, `la altura ${posVR.y} nunca debe quedar encima del usuario (${camPos.y})`);
  assert.ok(posVR.y >= 0.65 && posVR.y <= 1.2, `altura adecuada de pecho/mesa: ${posVR.y}`);

  // 3. Colocación en AR con hit-test: usa la superficie detectada
  const hitPose = { x: 0.2, y: 0.72, z: -0.85 };
  const posAR = DogPlacementLogic.calculateInitialPosition({
    cameraPosition: camPos,
    cameraForward: camFwd,
    isAR: true,
    hitTestPose: hitPose
  });
  assert.deepEqual(posAR, hitPose);

  // 4. Colocación en AR sin hit-test: fallback a 0.6 m frente al usuario
  const posARFallback = DogPlacementLogic.calculateInitialPosition({
    cameraPosition: camPos,
    cameraForward: camFwd,
    isAR: true,
    hitTestPose: null
  });
  assert.equal(posARFallback.x, 0);
  assert.ok(Math.abs(posARFallback.z - (-0.6)) < 0.001);
});

test('ThumbstickControlLogic mapea palancas derecha e izquierda y botones con ergonomía VR', () => {
  // 1. Palanca derecha: giro en X y escala continua 0.15x a 4x en Y
  const rightRes = ThumbstickControlLogic.mapRightStick({
    stickX: 0.8, // Girar derecha
    stickY: -0.7, // Empujar adelante -> aumentar tamaño
    currentScaleMultiplier: 1.0,
    currentRotationY: 0,
    deltaSec: 0.1
  });
  assert.ok(rightRes.rotationY < 0, 'debe rotar con stickX');
  assert.ok(rightRes.scaleMultiplier > 1.0, 'debe aumentar tamaño al empujar stick hacia arriba');

  // Límite superior 4x
  const maxScaleRes = ThumbstickControlLogic.mapRightStick({
    stickX: 0,
    stickY: -1.0,
    currentScaleMultiplier: 3.99,
    deltaSec: 1.0,
    maxMultiplier: 4.0
  });
  assert.ok(maxScaleRes.scaleMultiplier <= 4.0);

  // Límite inferior 0.15x
  const minScaleRes = ThumbstickControlLogic.mapRightStick({
    stickX: 0,
    stickY: 1.0,
    currentScaleMultiplier: 0.2,
    deltaSec: 1.0,
    minMultiplier: 0.15
  });
  assert.ok(minScaleRes.scaleMultiplier >= 0.15);

  // 2. Palanca izquierda (modo manipulación perro): subir/bajar y acercar/alejar
  const dogMoveRes = ThumbstickControlLogic.mapLeftStick({
    stickX: -0.6, // Acercar hacia el usuario
    stickY: -0.5, // Subir perro
    currentPosition: { x: 0, y: 0.95, z: -0.8 },
    cameraPosition: { x: 0, y: 1.6, z: 0 },
    deltaSec: 0.1,
    isLocomotion: false
  });
  assert.equal(dogMoveRes.handled, 'dog_move');
  assert.ok(dogMoveRes.position.y > 0.95, 'sube el perro al empujar stick arriba');
  assert.ok(dogMoveRes.position.z > -0.8, 'acerca el perro al mover stick hacia la izquierda');

  // 3. Palanca izquierda (modo locomoción suave en VR manteniendo gatillo)
  const locoRes = ThumbstickControlLogic.mapLeftStick({
    stickX: 0,
    stickY: -1.0, // Avanzar hacia adelante
    cameraForward: { x: 0, y: 0, z: -1 },
    cameraRigPosition: { x: 0, y: 0, z: 0 },
    deltaSec: 0.1,
    isLocomotion: true
  });
  assert.equal(locoRes.handled, 'locomotion');
  assert.ok(locoRes.cameraRigPosition.z < 0, 'avanza el rig del usuario hacia donde mira');

  // 4. Detección de botones A (frente), B (panel), X (despiece ant), Y (despiece sig)
  const actions = ThumbstickControlLogic.processButtons({
    current: { a: true, b: false, x: true, y: false },
    previous: { a: false, b: false, x: false, y: false }
  });
  assert.ok(actions.includes('bring_to_front'));
  assert.ok(actions.includes('prev_dissection'));
  assert.equal(actions.length, 2);
});
