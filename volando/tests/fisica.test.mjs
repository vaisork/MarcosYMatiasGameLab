import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { crearVuelo, actualizarVuelo, resolverChoque, guardarCheckpoint, registrarRozon, deltaSegundos, debeChocar, mapearPC, mapearCelular, mapearQuest, mapearGamepadXR, mapearGamepad, mapearMirada, mapearJoystick, multiplicadorAltura, zonaMuerta, ESCALA_MUNDO, ESCALA_HORIZONTAL } from '../fisica.mjs';
import { BIOKOVO_RUTA, ANCHO_CORREDOR, DISTANCIA_PARED, ESPACIADO_AROS } from '../rutas.mjs';

function volar(vuelo, control, segundos) {
  const y = vuelo.y;
  for (let i = 0; i < segundos * 72; i++) actualizarVuelo(vuelo, control, 1 / 72);
  return y - vuelo.y;
}

test('crucero neutro conserva 65 m/s y baja al menos 150 m cada 10 segundos', () => {
  const vuelo = crearVuelo();
  const descenso = volar(vuelo, {}, 10);
  assert.equal(vuelo.velocidad, 65);
  assert.ok(descenso >= 150);
  assert.ok(vuelo.vy <= -15 && vuelo.vy >= -25);
});

test('picar alcanza 90 m/s y cerca de -40 m/s verticales', () => {
  const vuelo = crearVuelo();
  volar(vuelo, { pitch: -1 }, 2);
  assert.ok(Math.abs(vuelo.velocidad - 90) < .01);
  assert.ok(vuelo.vy <= -39);
});

test('levantar frena y puede cambiar velocidad por altura', () => {
  const maniobra = crearVuelo(); maniobra.vy = -12;
  volar(maniobra, { pitch: 1 }, .4);
  assert.ok(maniobra.velocidad < 53);
  assert.ok(maniobra.vy > -9);
  const vuelo = crearVuelo(); volar(vuelo, { pitch: 1 }, 1.5);
  assert.ok(vuelo.velocidad < 50);
});

test('PC suma mouse y teclas con abajo como picada', () => {
  assert.equal(mapearPC({ teclas: ['w'] }).pitch, -1);
  assert.equal(mapearPC({ mouseY: 1 }).pitch, -1);
  assert.equal(mapearPC({ teclas: ['w'], mouseY: .4 }).pitch, -1);
  assert.equal(mapearPC({ teclas: ['ArrowLeft'] }).roll, 1);
  assert.equal(mapearPC({ mouseX: 1 }).roll, -1);
});

test('celular calibra beta y adelante baja', () => {
  assert.ok(mapearCelular(80, 0, 40).pitch < 0);
  assert.deepEqual(mapearCelular(40, 12, 40, 12), { pitch: 0, roll: 0 });
  assert.ok(mapearCelular(40, 44, 40, 12).roll < 0);
});

test('Quest usa manos relativas a cabeza y sticks como respaldo', () => {
  assert.ok(mapearQuest({ y: -.7, z: -.8 }, { y: -.7, z: -.8 }).pitch < 0);
  assert.equal(mapearQuest({ y: 0, z: -.6 }, { y: 0, z: -.6 }).pitch, 0);
  assert.ok(mapearQuest({ y: .7, z: 0 }, { y: .7, z: 0 }).pitch > 0);
  assert.ok(mapearQuest({ y: 0, z: 0 }, { y: 0, z: 0 }, .35).yaw > 0);
  assert.ok(mapearGamepadXR([{ gamepad: { axes: [0, -1] } }]).pitch < 0);
});

test('palancas separan alabeo, giro rápido, velocidad, gatillo y freno', () => {
  const controls=mapearGamepadXR([
    {handedness:'left',gamepad:{axes:[.8,-1],buttons:[]}},
    {handedness:'right',gamepad:{axes:[.7,-1],buttons:[{value:.8},{pressed:true}]}}
  ]);
  assert.ok(controls.pitch<0&&controls.roll>0&&controls.yaw>0&&controls.throttle>0);
  assert.equal(controls.boost,.8);assert.equal(controls.brake,true);
  const accel=crearVuelo(),brake=crearVuelo();volar(accel,{boost:1},.5);volar(brake,{brake:true},.5);
  assert.ok(accel.velocidad>65&&brake.velocidad<65);
});

test('gamepad PC reserva LT/RT para gatillo y hombros para grip', () => {
  const controls=mapearGamepad([{axes:[.5,-1,.5,-1],buttons:Array.from({length:8},(_,i)=>({value:i===7?.7:0,pressed:i===4}))}]);
  assert.ok(controls.pitch<0&&controls.roll>0&&controls.yaw>0&&controls.throttle>0);
  assert.equal(controls.boost,.7);assert.equal(controls.brake,true);
});

test('joystick virtual adelante pica y respeta inversión opcional', () => {
  assert.ok(mapearJoystick(0,1).pitch<0);
  assert.ok(mapearJoystick(0,1,true).pitch>0);
  assert.ok(mapearJoystick(.8,0).roll>0);
});

test('zona muerta evita deriva; curva mantiene un centro suave', () => {
  assert.equal(zonaMuerta(.12),0);assert.equal(zonaMuerta(-.08),0);
  assert.ok(zonaMuerta(.2)>0&&zonaMuerta(.2)<.03);
  const vuelo=crearVuelo();volar(vuelo,{roll:zonaMuerta(.08)},1);assert.equal(vuelo.yaw,-.35);
});

test('alabeo y giro responden antes de 0.15 s; mirada orienta hacia su rumbo', () => {
  const vuelo=crearVuelo(),initialYaw=vuelo.yaw;volar(vuelo,{roll:1,yaw:.7},.14);
  assert.ok(vuelo.roll>.9);assert.ok(vuelo.yaw>initialYaw);
  assert.ok(mapearMirada(.5)>0);
  const mirar=crearVuelo(),rumbo=mirar.yaw;volar(mirar,{yaw:mapearMirada(.5)},.5);assert.ok(mirar.yaw>rumbo);
});

test('escala mundial conserva corredor y paredes en alcance visual cercano', () => {
  assert.equal(ESCALA_MUNDO,.35);
  assert.equal(ESPACIADO_AROS,300);
  assert.ok(DISTANCIA_PARED*ESCALA_HORIZONTAL>=10&&DISTANCIA_PARED*ESCALA_HORIZONTAL<=40);
  assert.ok(ANCHO_CORREDOR/2*ESCALA_HORIZONTAL<=40);
});

test('ruta Biokovo pierde más de 1200 m hasta la costa', () => {
  const meta=JSON.parse(readFileSync(new URL('../assets/biokovo.json',import.meta.url)));
  const bytes=readFileSync(new URL('../assets/biokovo-z14-u16.bin',import.meta.url));
  const heights=new Uint16Array(bytes.buffer,bytes.byteOffset,bytes.byteLength/2),n=2**14,tileM=40075016.686*Math.cos(meta.launch.lat*Math.PI/180)/n;
  const points=BIOKOVO_RUTA.map(([lat,lon])=>{const tx=(lon+180)/360*n,ty=(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*n,x=(tx-meta.launch.tileX14)*tileM,z=(ty-meta.launch.tileY14)*tileM,px=Math.max(0,Math.min(1023,Math.round((x/tileM+meta.launch.tileX14-meta.detail.x)*1024/meta.detail.tilesX))),py=Math.max(0,Math.min(1279,Math.round((z/tileM+meta.launch.tileY14-meta.detail.y)*1280/meta.detail.tilesY))),ground=heights[py*1024+px];return {x,z,ground,y:Math.max(ground,4)+90};});
  const ys=points.map(({ground,y},i)=>i===0?Math.max(1760,ground)+280:i===points.length-1?Math.max(ground,4)+16:y);
  assert.ok(ys[0]-ys.at(-1)>=1200);
  const horizontal=points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-points[i].x,p.z-points[i].z),0),slope=Math.atan((ys[0]-ys.at(-1))*ESCALA_MUNDO/horizontal/ESCALA_HORIZONTAL)*180/Math.PI;
  assert.ok(slope>=20&&slope<=35,`pendiente visible ${slope.toFixed(1)}°`);
});

test('volar bajo multiplica puntos y rozones respetan su límite', () => {
  assert.equal(multiplicadorAltura(60), 1);
  assert.equal(multiplicadorAltura(0), 4);
  const vuelo = crearVuelo();
  assert.equal(registrarRozon(vuelo, 100), false);
  assert.equal(registrarRozon(vuelo, 90), true);
});

test('sin entrada no hay auto-giro; alabeo responde en menos de 0.25 s y cierra a 75 m', () => {
  const vuelo=crearVuelo({x:0,y:1200,z:0,yaw:.4}),yaw=vuelo.yaw;
  volar(vuelo,{},1);assert.equal(vuelo.yaw,yaw);
  volar(vuelo,{roll:1},.25);
  assert.ok(vuelo.roll>.9);
  const giroInicial=vuelo.yaw;
  volar(vuelo,{roll:1},.3);
  const rapidezHorizontal=Math.hypot(vuelo.vx,vuelo.vz),velocidadAngular=(vuelo.yaw-giroInicial)/.3;
  const radio=rapidezHorizontal/velocidadAngular;
  assert.ok(radio>=60&&radio<=100);
});

test('choque usa margen de 5 m y el mar no cuenta como terreno', () => {
  assert.equal(debeChocar({y:104.9},100),true);
  assert.equal(debeChocar({y:105.1},100),false);
  assert.equal(debeChocar({y:-2},0),false);
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

test('cinco segundos neutros conservan rumbo y estado finito desde el mirador', () => {
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
    if(debeChocar(vuelo,groundAt(vuelo.x,vuelo.z),5)){
      resolverChoque(vuelo,groundAt(vuelo.x,vuelo.z)+5);choques++;
    }
    assert.ok(Object.values(vuelo).filter((value)=>typeof value==='number').every(Number.isFinite));
  }
  assert.ok(Math.hypot(vuelo.x-mirador.x,vuelo.z-mirador.z)>100);
  assert.equal(choques,0);
  assert.equal(deltaSegundos(1000,{timestamp:1000}),1/72);
});

test('mapearGamepadXR acepta XRInputSourceArray (sin .filter, como en Quest)', () => {
  const fuentes = { length: 1, 0: { gamepad: { axes: [0, 0, 0.5, 1] } }, [Symbol.iterator]: function* () { yield this[0]; } };
  const r = mapearGamepadXR(fuentes);
  assert.equal(r.roll, zonaMuerta(.5));
  assert.equal(r.pitch, zonaMuerta(1));
});
