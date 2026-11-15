import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { crearVuelo, sustentacion, actualizarVuelo, resolverChoque, guardarCheckpoint, deltaSegundos, puedeResolverChoque } from '../fisica.mjs';

test('levantar las alas aumenta la sustentación y puede frenar la caída', () => {
  assert.ok(sustentacion(40, 1) > sustentacion(40, -1));
  const vuelo = crearVuelo(); vuelo.vy = -1;
  for (let i = 0; i < 72; i++) actualizarVuelo(vuelo, { pitch: 1 }, 1 / 72);
  assert.ok(vuelo.vy > -1);
});

test('el alabeo gira el rumbo y el picado gana velocidad', () => {
  const vuelo = crearVuelo();
  actualizarVuelo(vuelo, { roll: 1, pitch: -1 }, .2);
  assert.ok(vuelo.yaw > -.35);
  assert.ok(vuelo.velocidad > 38);
});

test('un choque reaparece en el último aro y conserva el contador', () => {
  const vuelo = crearVuelo();
  guardarCheckpoint(vuelo, { x: 15, y: 900, z: 40, yaw: 1 });
  vuelo.x = 90; vuelo.y = 1; vuelo.z = 200;
  assert.equal(resolverChoque(vuelo, 2), true);
  assert.deepEqual([vuelo.x, vuelo.y, vuelo.z, vuelo.yaw], [15, 900, 40, 1]);
  assert.equal(vuelo.choques, 1);
  assert.equal(vuelo.aros, 1);
});

test('cinco segundos neutros sacan a la jugadora del mirador sin NaN ni bucle de choque', () => {
  const bytes=readFileSync(new URL('../assets/terreno-u16.bin',import.meta.url));
  const heights=new Uint16Array(bytes.buffer,bytes.byteOffset,bytes.byteLength/2),world={x:19456,z:29184};
  const mirador={x:(.84-.5)*world.x,z:(.05-.5)*world.z};
  const next={x:(.79-.5)*world.x,z:(.10-.5)*world.z};
  const groundAt=(x,z)=>{const px=Math.max(0,Math.min(511,Math.round((x/world.x+.5)*511))),py=Math.max(0,Math.min(767,Math.round((z/world.z+.5)*767)));return heights[py*512+px]*1.2;};
  const ground=groundAt(mirador.x,mirador.z);
  mirador.y=ground+240;mirador.yaw=Math.atan2(-(next.x-mirador.x),-(next.z-mirador.z));
  const direction={x:-Math.sin(mirador.yaw),z:-Math.cos(mirador.yaw)},vuelo=crearVuelo(mirador);
  vuelo.vy=13;vuelo.checkpoint={x:mirador.x+direction.x*260,y:ground+355,z:mirador.z+direction.z*260,yaw:mirador.yaw};
  let previous=0,choques=0;
  for(let frame=1;frame<=360;frame++){
    const now=frame*1000/72,dt=deltaSegundos(now,previous);previous=now;
    actualizarVuelo(vuelo,{},dt);
    const routeDist=Math.abs((vuelo.x-mirador.x)*direction.z-(vuelo.z-mirador.z)*direction.x),wall=routeDist>540;
    if(puedeResolverChoque(frame/72,mirador,vuelo)&&(vuelo.y<=groundAt(vuelo.x,vuelo.z)+18||wall)){
      resolverChoque(vuelo,groundAt(vuelo.x,vuelo.z)+18,wall);choques++;
    }
    assert.ok(Object.values(vuelo).filter((value)=>typeof value==='number').every(Number.isFinite));
  }
  assert.ok(Math.hypot(vuelo.x-mirador.x,vuelo.z-mirador.z)>100);
  assert.equal(choques,0);
  assert.equal(deltaSegundos(1000,{timestamp:1000}),1/72);
});
