import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PORTALES } from '../src/portales.mjs';
import { IDS_MUNDOS } from '../src/mundos/catalogo.mjs';
import { objetivoNeon, objetivoLuke, objetivoBusqueda } from '../src/mundos/objetivos.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
test('cada cartel con portal tiene mundo registrado y arte', async () => {
  const indice = readFileSync(`${root}src/mundos/indice.js`, 'utf8');
  const registrados = indice.match(/Object\.fromEntries\(\[(.*?)\]\.map/s)?.[1] || '';
  for (const [id, portal] of Object.entries(PORTALES)) if (portal.mundo) {
    assert.ok(IDS_MUNDOS.includes(portal.mundo), `${id}: mundo desconocido ${portal.mundo}`);
    assert.ok(existsSync(`${root}src/mundos/${portal.mundo}.js`), `${id}: falta módulo`);
    assert.match(indice, new RegExp(`import ${portal.mundo} from './${portal.mundo}\\.js'`), `${id}: falta import en indice`);
    assert.match(registrados, new RegExp(`\\b${portal.mundo}\\b`), `${id}: falta entrada de registro`);
    assert.ok(existsSync(`${root}texturas/portales/${portal.mundo}.webp`), `${id}: falta textura`);
  }
});
test('objetivos de Ciudad Neón cuentan rótulos únicos hasta 15', () => { const s={encendidos:new Set()};for(let i=0;i<15;i++)objetivoNeon(s,i);objetivoNeon(s,0);assert.equal(s.encendidos.size,15); });
test('objetivos de Luke cuentan caricias únicas hasta 8', () => { const s={acariciados:new Set()};for(let i=0;i<8;i++)objetivoLuke(s,i);objetivoLuke(s,0);assert.equal(s.acariciados.size,8); });
test('búsqueda exige atrapar y jalar tres veces', () => { const s={capturas:0};objetivoBusqueda(s,true,false);objetivoBusqueda(s,false,true);for(let i=0;i<3;i++){objetivoBusqueda(s,true,true);objetivoBusqueda(s,false,false);}assert.equal(s.capturas,3); });
