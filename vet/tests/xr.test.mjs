// vet/tests/xr.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const xrCode = await readFile(path.join(root, 'xr.js'), 'utf8');

test('módulo xr.js incluye componentes para Meta Quest 3, AR y VR', () => {
  // Verificación de capacidades XR
  assert.match(xrCode, /VetXRManager/);
  assert.match(xrCode, /immersive-ar/);
  assert.match(xrCode, /immersive-vr/);
  assert.match(xrCode, /hit-test/);
  assert.match(xrCode, /hand-tracking/);
  assert.match(xrCode, /index-finger-tip/);
  assert.match(xrCode, /createClinicLab/);
  assert.match(xrCode, /createWristHUD/);
  assert.match(xrCode, /createFloatingCard/);
  assert.match(xrCode, /createExamBoard/);
  assert.match(xrCode, /createReticle/);
  assert.match(xrCode, /setFoveation/);
  assert.match(xrCode, /ScalePresets/);
  assert.match(xrCode, /ExplodedViewLogic/);
  assert.match(xrCode, /ExamEngine/);
  assert.match(xrCode, /Nomina Anatomica/);
  assert.match(xrCode, /Propuesta para UNITEC/);
});

test('visor index.html conecta el motor XR y mantiene las comprobaciones de integración', () => {
  assert.match(html, /VetXRManager/);
  assert.match(html, /xr\.js/);
  assert.match(html, /Entrar en VR/);
  assert.match(html, /Entrar en AR/);
  assert.match(html, /requestSession\(mode/);
  assert.match(html, /Transparencia/);
  assert.match(html, /Aislar pieza/);
  assert.match(html, /Propuesta para UNITEC/);
  assert.match(html, /Modelos: Virginia Tech Virtual Animal Project \/ VT-ARIES — CC BY-NC-SA 4\.0/);
});
