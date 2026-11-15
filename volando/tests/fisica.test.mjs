import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { crearVuelo, actualizarVuelo, resolverChoque, guardarCheckpoint, registrarRozon, deltaSegundos, puedeResolverChoque, mapearPC, mapearCelular, mapearQuest, mapearGamepadXR, multiplicadorAltura } from '../fisica.mjs';

function volar(vuelo, control, segundos) {
  const y = vuelo.y;
  for (let i = 0; i < segundos * 72; i++) actualizarVuelo(vuelo, control, 1 / 72);
  return y - vuelo.y;
}

test('el vuelo neutro desciende cerca de 3:1', () => {
  const vuelo = crearVuelo();
  volar(vuelo, {}, 2);
  assert.ok(vuelo.vy < 0);
  assert.ok(-vuelo.vy >= vuelo.velocidad / 4 && -vuelo.vy <= vuelo.velocidad / 2.5);
});

test('cinco segundos de picada aceleran y pierden más de 200 m', () => {
  const vuelo = crearVuelo();
  const descenso = volar(vuelo, { pitch: -1 }, 5);
  assert.ok(vuelo.velocidad > 70);
  assert.ok(descenso > 200);
});

test('levantar frena y puede cambiar velocidad por altura', () => {
  const maniobra = crearVuelo(); maniobra.vy = -12;
  volar(maniobra, { pitch: 1 }, .4);
  assert.ok(maniobra.velocidad < 34);
  assert.ok(maniobra.vy > -4);
  const vuelo = crearVuelo(); volar(vuelo, { pitch: 1 }, 1.5);
  assert.ok(vuelo.velocidad <= 26);
});

test('PC suma mouse y teclas con abajo como picada', () => {
  assert.equal(mapearPC({ teclas: ['s'] }).pitch, -1);
  assert.equal(mapearPC({ mouseY: 1 }).pitch, -1);
  assert.equal(mapearPC({ teclas: ['s'], mouseY: .4 }).pitch, -1);
  assert.equal(mapearPC({ teclas: ['ArrowLeft'] }).roll, -1);
});

test('celular calibra beta y adelante baja', () => {
  assert.ok(mapearCelular(80, 0, 40).pitch < 0);
  assert.deepEqual(mapearCelular(40, 12, 40, 12), { pitch: 0, roll: 0 });
  assert.ok(mapearCelular(40, 44, 40, 12).roll > 0);
});

test('Quest usa manos relativas a cabeza y sticks como respaldo', () => {
  assert.ok(mapearQuest({ y: -.7, z: -.8 }, { y: -.7, z: -.8 }).pitch < 0);
  assert.equal(mapearQuest({ y: 0, z: -.6 }, { y: 0, z: -.6 }).pitch, 0);
  assert.ok(mapearQuest({ y: .7, z: 0 }, { y: .7, z: 0 }).pitch > 0);
  assert.ok(mapearGamepadXR([{ gamepad: { axes: [0, -1] } }]).pitch < 0);
});

test('volar bajo multiplica puntos y rozones respetan su límite', () => {
  assert.equal(multiplicadorAltura(60), 1);
  assert.equal(multiplicadorAltura(0), 2);
  const vuelo = crearVuelo();
  assert.equal(registrarRozon(vuelo, 100), false);
  assert.equal(registrarRozon(vuelo, 90), true);
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

test('cinco segundos neutros mantienen rumbo y estado finito desde el mirador', () => {
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
    if(puedeResolverChoque(frame/72,mirador,vuelo)&&(vuelo.y<=groundAt(vuelo.x,vuelo.z)+9||wall)){
      resolverChoque(vuelo,groundAt(vuelo.x,vuelo.z)+9,wall);choques++;
    }
    assert.ok(Object.values(vuelo).filter((value)=>typeof value==='number').every(Number.isFinite));
  }
  assert.ok(Math.hypot(vuelo.x-mirador.x,vuelo.z-mirador.z)>100);
  assert.equal(choques,0);
  assert.equal(deltaSegundos(1000,{timestamp:1000}),1/72);
});
