import test from 'node:test';
import assert from 'node:assert/strict';
import {
  crearEstadoGallinas,
  contarGallinasEnCorral,
  estaEnCorral,
  actualizarHuida,
  intentarAtraparTelaraña,
  actualizarLlevarGallina,
  actualizarRonda,
  alimentarCorral,
} from '../src/mundos/gallinas-logica.mjs';

test('crearEstadoGallinas inicializa 5 gallinas libres y telaraña lista', () => {
  const estado = crearEstadoGallinas({ total: 5 });
  assert.equal(estado.total, 5);
  assert.equal(estado.enCorral, 0);
  assert.equal(estado.gallinas.length, 5);
  assert.equal(estado.recargaTelaraña, 0);
  assert.equal(estado.victoria, false);
  assert.equal(estado.alimentadas, false);
  assert.ok(estado.gallinas.every((g) => g.estado === 'libre' && !g.enCorral && !g.atrapada));
});

test('IA de huida: la gallina corre alejándose de Senku al acercarse', () => {
  const gallina = {
    id: 0,
    pos: { x: 0, y: 0, z: 0 },
    vel: { x: 0, y: 0, z: 0 },
    estado: 'libre',
    enCorral: false,
    atrapada: false,
    llevada: false,
  };
  const senkuCerca = { x: 2, y: 0, z: 0 };
  actualizarHuida(gallina, senkuCerca, [], { minX: -20, maxX: 20, minZ: -20, maxZ: 20 }, 0.5);

  assert.equal(gallina.estado, 'huyendo');
  assert.ok(gallina.vel.x < 0, 'debe moverse hacia x negativo (alejándose de Senku que está en x=2)');
  assert.ok(gallina.pos.x < 0);
});

test('IA de huida: salta obstáculos bajos cuando están en su camino', () => {
  const gallina = {
    id: 0,
    pos: { x: 0, y: 0, z: 0 },
    vel: { x: 0, y: 0, z: 0 },
    estado: 'libre',
    enCorral: false,
    atrapada: false,
    llevada: false,
  };
  const senku = { x: -3, y: 0, z: 0 };
  const obstaculo = { x: 0.5, z: 0, radio: 0.8, salto: 3.5 };

  actualizarHuida(gallina, senku, [obstaculo], { minX: -20, maxX: 20, minZ: -20, maxZ: 20 }, 0.1);
  assert.ok(gallina.saltando, 'la gallina debe saltar al detectar obstáculo cercano');
  assert.ok(gallina.pos.y > 0, 'la posición y debe elevarse');
});

test('IA de huida: respeta los límites del terreno', () => {
  const gallina = {
    id: 0,
    pos: { x: 17.5, y: 0, z: 0 },
    vel: { x: 5, y: 0, z: 0 },
    estado: 'huyendo',
    enCorral: false,
    atrapada: false,
    llevada: false,
  };
  const senku = { x: 15, y: 0, z: 0 };
  const limites = { minX: -18, maxX: 18, minZ: -18, maxZ: 18 };
  actualizarHuida(gallina, senku, [], limites, 0.5);

  assert.ok(gallina.pos.x <= 18, 'no debe rebasar el límite este');
});

test('captura con telaraña: atrapa gallina cercana e impone recarga', () => {
  const estado = crearEstadoGallinas({
    total: 3,
    enfriamientoTelaraña: 4.0,
    posicionesIniciales: [{ x: 5, y: 0, z: 5 }],
  });

  const res = intentarAtraparTelaraña(estado, { impactoPos: { x: 5.2, z: 5.1 }, radioImpacto: 2.0 });
  assert.equal(res.atrapada, true);
  assert.equal(res.gallina.atrapada, true);
  assert.equal(res.gallina.estado, 'atrapada');
  assert.equal(estado.recargaTelaraña, 4.0);

  const res2 = intentarAtraparTelaraña(estado, { impactoPos: { x: 5.2, z: 5.1 }, radioImpacto: 2.0 });
  assert.equal(res2.atrapada, false);
  assert.equal(res2.motivo, 'recargando');
});

test('captura con telaraña: gallina atrapada no se mueve por huida y escapa al vencer el tiempo', () => {
  const estado = crearEstadoGallinas({
    total: 1,
    duracionAtrapada: 2.0,
    posicionesIniciales: [{ x: 0, y: 0, z: 0 }],
  });

  intentarAtraparTelaraña(estado, { impactoPos: { x: 0, z: 0 }, radioImpacto: 2.0 });
  const g = estado.gallinas[0];
  const senkuLejos = { x: 10, y: 0, z: 10 };

  actualizarRonda(estado, 0.5, senkuLejos);
  assert.equal(g.atrapada, true);
  assert.equal(g.pos.x, 0, 'atrapada no debe huir');

  actualizarRonda(estado, 1.6, senkuLejos);
  assert.equal(g.atrapada, false, 'al agotarse el tiempo debe liberarse si no fue llevada');
  assert.equal(g.estado, 'libre');
});

test('llevar gallina: Senku recoge gallina atrapada cercana y la deposita en el corral', () => {
  const estado = crearEstadoGallinas({
    total: 1,
    corral: { minX: 10, maxX: 15, minZ: 10, maxZ: 15 },
    posicionesIniciales: [{ x: 0, y: 0, z: 0 }],
  });

  intentarAtraparTelaraña(estado, { impactoPos: { x: 0, z: 0 }, radioImpacto: 2.0 });
  const senkuCerca = { x: 0.5, y: 0, z: 0 };

  const rec = actualizarLlevarGallina(estado, senkuCerca, estado.corral);
  assert.equal(rec.recogida, true);
  assert.equal(estado.gallinaLlevada, estado.gallinas[0]);

  const senkuCaminando = { x: 5, y: 0, z: 5 };
  actualizarLlevarGallina(estado, senkuCaminando, estado.corral);
  assert.equal(estado.gallinas[0].pos.x, 5);

  const senkuEnCorral = { x: 12, y: 0, z: 12 };
  const dep = actualizarLlevarGallina(estado, senkuEnCorral, estado.corral);
  assert.equal(dep.depositada, true);
  assert.equal(estado.gallinaLlevada, null);
  assert.equal(estado.gallinas[0].enCorral, true);
  assert.equal(estado.enCorral, 1);
  assert.equal(estado.victoria, true);
});

test('conteo y fin de ronda: todas las gallinas en corral activan victoria y escena de recompensa', () => {
  const estado = crearEstadoGallinas({ total: 2 });
  assert.equal(contarGallinasEnCorral(estado.gallinas), 0);

  estado.gallinas[0].enCorral = true;
  assert.equal(contarGallinasEnCorral(estado.gallinas), 1);

  estado.gallinas[1].enCorral = true;
  actualizarRonda(estado, 0.1, { x: 0, y: 0, z: 0 });
  assert.equal(estado.enCorral, 2);
  assert.equal(estado.victoria, true);

  const comedero = { x: 0, y: 0, z: -10 };
  const senkuLejos = { x: 10, y: 0, z: 10 };
  assert.equal(alimentarCorral(estado, senkuLejos, comedero), false);

  const senkuComedero = { x: 0.5, y: 0, z: -9.8 };
  assert.equal(alimentarCorral(estado, senkuComedero, comedero), true);
  assert.equal(estado.alimentadas, true);
  assert.equal(estado.premiado, true);
  assert.ok(estado.gallinas.every((g) => g.estado === 'comiendo'));

  assert.equal(alimentarCorral(estado, senkuComedero, comedero), false, 'no alimenta ni premia dos veces');
});
