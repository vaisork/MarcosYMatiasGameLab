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
  ScalePresets
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
  assert.ok(ScalePresets.LIFESIZE.scaleFactor >= 0.8 && ScalePresets.LIFESIZE.scaleFactor <= 1.2);
  assert.equal(ScalePresets.TABLETOP.id, 'tabletop');
  assert.equal(ScalePresets.LIFESIZE.id, 'lifesize');
});
