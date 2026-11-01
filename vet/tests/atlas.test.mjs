import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pieces = JSON.parse(await readFile(path.join(root, 'datos/piezas.json'), 'utf8'));
const html = await readFile(path.join(root, 'index.html'), 'utf8');

async function glbs(dir) {
  const entries = await readdir(dir, {withFileTypes: true});
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? glbs(path.join(dir, entry.name))
    : entry.name.endsWith('.glb') ? [path.join(dir, entry.name)] : []))).flat();
}

test('catálogo incluye las 138 estructuras caninas y campos completos', () => {
  assert.equal(pieces.length, 138);
  assert.equal(pieces.filter(p => p.sistema === 'óseo').length, 121);
  assert.equal(pieces.filter(p => p.sistema === 'órganos').length, 17);
  assert.equal(new Set(pieces.map(p => p.id)).size, pieces.length);
  for (const p of pieces) {
    for (const key of ['id', 'archivo', 'region', 'sistema', 'nombre', 'nombreLatino', 'descripcion']) {
      assert.ok(typeof p[key] === 'string' && p[key].trim(), `${p.id}: ${key}`);
    }
    assert.ok(p.descripcion.length <= 220, `${p.id}: descripción demasiado larga`);
  }
});

test('modelos optimizados existen y el conjunto queda bajo 15 MiB', async () => {
  const files = await glbs(path.join(root, 'modelos'));
  assert.equal(files.length, pieces.length);
  let bytes = 0;
  for (const p of pieces) {
    const file = path.resolve(root, p.archivo);
    assert.ok(file.startsWith(path.join(root, 'modelos') + path.sep));
    bytes += (await stat(file)).size;
  }
  assert.ok(bytes < 15 * 1024 * 1024, `peso ${bytes} bytes`);
});

test('visor incluye Three.js 0.170, navegación anatómica y modos XR', () => {
  assert.match(html, /three@0\.170\.0/);
  assert.match(html, /setMeshoptDecoder\(MeshoptDecoder\)/);
  assert.match(html, /Entrar en VR/);
  assert.match(html, /Entrar en AR/);
  assert.match(html, /requestSession\(mode/);
  assert.match(html, /Transparencia/);
  assert.match(html, /Aislar pieza/);
  assert.match(html, /Propuesta para UNITEC/);
  assert.match(html, /Modelos: Virginia Tech Virtual Animal Project \/ VT-ARIES — CC BY-NC-SA 4\.0/);
});
