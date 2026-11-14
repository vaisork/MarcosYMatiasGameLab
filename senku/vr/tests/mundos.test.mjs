import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PORTALES } from '../src/portales.mjs';
import { IDS_MUNDOS } from '../src/mundos/catalogo.mjs';
import { objetivoNeon, objetivoLuke, objetivoBusqueda, objetivoMarcosUV, objetivoFsGato, objetivoRataTaqueria, objetivoColumpiaEstilo, objetivoBotiquin, objetivoSenku2, objetivoGrietaMadre, objetivoVuelo } from '../src/mundos/objetivos.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
test('cada cartel con portal tiene mundo registrado y arte', async () => {
  const indice = readFileSync(`${root}src/mundos/indice.js`, 'utf8');
  const registrados = indice.match(/Object\.fromEntries\(\[(.*?)\]\.map/s)?.[1] || '';
  for (const [id, portal] of Object.entries(PORTALES)) if (portal.mundo) {
    assert.ok(IDS_MUNDOS.includes(portal.mundo), `${id}: mundo desconocido ${portal.mundo}`);
    assert.ok(existsSync(`${root}src/mundos/${portal.mundo}.js`), `${id}: falta módulo`);
    const binding = indice.match(new RegExp(`import (\\w+) from './${portal.mundo}\\.js'`))?.[1];
    assert.ok(binding, `${id}: falta import en indice`);
    assert.match(registrados, new RegExp(`\\b${binding}\\b`), `${id}: falta entrada de registro`);
    assert.ok(existsSync(`${root}texturas/portales/${portal.mundo}.webp`), `${id}: falta textura`);
  }
});
test('objetivos de Ciudad Neón cuentan rótulos únicos hasta 15', () => { const s={encendidos:new Set()};for(let i=0;i<15;i++)objetivoNeon(s,i);objetivoNeon(s,0);assert.equal(s.encendidos.size,15); });
test('objetivos de Luke cuentan caricias únicas hasta 8', () => { const s={acariciados:new Set()};for(let i=0;i<8;i++)objetivoLuke(s,i);objetivoLuke(s,0);assert.equal(s.acariciados.size,8); });
test('búsqueda exige atrapar y jalar tres veces', () => { const s={capturas:0};objetivoBusqueda(s,true,false);objetivoBusqueda(s,false,true);for(let i=0;i<3;i++){objetivoBusqueda(s,true,true);objetivoBusqueda(s,false,false);}assert.equal(s.capturas,3); });
test('objetivos nuevos cuentan hallazgos únicos y atrapes sin repetir el mismo golpe', () => {
  const uv={revelados:new Set()},pecera={reventadas:new Set()},rata={capturas:0},trucos={piruetas:new Set()};
  for(let i=0;i<6;i++)objetivoMarcosUV(uv,i);
  objetivoMarcosUV(uv,0);
  for(let i=0;i<20;i++)objetivoFsGato(pecera,i);
  objetivoFsGato(pecera,0);
  objetivoRataTaqueria(rata,true);objetivoRataTaqueria(rata,true);objetivoRataTaqueria(rata,false);objetivoRataTaqueria(rata,true);
  for(let i=0;i<5;i++)objetivoColumpiaEstilo(trucos,i);
  objetivoColumpiaEstilo(trucos,0);
  assert.equal(uv.revelados.size,6);assert.equal(pecera.reventadas.size,20);assert.equal(rata.capturas,2);assert.equal(trucos.piruetas.size,5);
});
test('objetivos de Botiquín curan 3 pacientes sin repetir', () => { const s={curados:new Set()};for(let i=0;i<3;i++)objetivoBotiquin(s,i);objetivoBotiquin(s,0);assert.equal(s.curados.size,3); });
test('objetivos de Pista Senku 2 cruzan 12 aros y mantienen combo', () => { const s={cruzados:new Set(),combo:0};for(let i=0;i<12;i++)objetivoSenku2(s,i);objetivoSenku2(s,0);assert.equal(s.cruzados.size,12);assert.equal(s.combo,12); });
test('objetivos de La Grieta Madre eligen solo una de las tres puertas', () => { const s={elegida:null,abierta:false};objetivoGrietaMadre(s,1);assert.equal(s.elegida,1);assert.equal(s.abierta,true);objetivoGrietaMadre(s,2);assert.equal(s.elegida,1); });
test('objetivos de Cielo de Vuelo recogen elementos solo volando y sin duplicar', () => {
  const s = { recogidos: new Set() };
  objetivoVuelo(s, 0, false);
  assert.equal(s.recogidos.size, 0);
  for (let i = 0; i < 10; i++) objetivoVuelo(s, i, true);
  objetivoVuelo(s, 0, true);
  assert.equal(s.recogidos.size, 10);
});
