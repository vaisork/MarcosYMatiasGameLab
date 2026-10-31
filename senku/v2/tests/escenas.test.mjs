import test from 'node:test';
import assert from 'node:assert/strict';
import { crearRegistroEscenas, validarEscena } from '../src/core/escenas.mjs';
import { escenaTaqueria } from '../src/data/escenas/taqueria.mjs';

test('validarEscena aprueba una escena con formato correcto', () => {
  const resultado = validarEscena(escenaTaqueria);
  assert.equal(resultado.valida, true);
  assert.equal(resultado.escena.id, 'taqueria');
  assert.equal(resultado.escena.limites.w, 3840);
  assert.equal(resultado.escena.limites.h, 720);
  assert.equal(resultado.escena.plataformas.length, escenaTaqueria.plataformas.length);
});

test('validarEscena rechaza escenas incompletas o corruptas', () => {
  assert.equal(validarEscena(null).valida, false);
  assert.equal(validarEscena({}).valida, false);
  assert.equal(validarEscena({ id: 'test', nombre: 'Test' }).valida, false);
  assert.equal(
    validarEscena({
      id: 'test',
      nombre: 'Test',
      limites: { x: 0, y: 0, w: 100, h: 100 },
      puntoEntrada: { x: 10, y: 10 },
      plataformas: [],
    }).valida,
    false,
    'Debe exigir al menos una plataforma o suelo'
  );
  assert.equal(
    validarEscena({
      id: 'test',
      nombre: 'Test',
      limites: { x: 0, y: 0, w: 0, h: 100 },
      puntoEntrada: { x: 10, y: 10 },
      plataformas: [{ id: 'p1', x: 0, y: 50, w: 50, h: 10 }],
    }).valida,
    false,
    'Límites con dimensión cero o negativa deben ser inválidos'
  );
});

test('crearRegistroEscenas permite registrar, consultar y listar escenas', () => {
  const registro = crearRegistroEscenas();
  assert.equal(registro.contar(), 0);

  const registrada = registro.registrar(escenaTaqueria);
  assert.equal(registrada.id, 'taqueria');
  assert.equal(registro.contar(), 1);
  assert.equal(registro.tiene('taqueria'), true);
  assert.equal(registro.tiene('no_existe'), false);

  const obtenida = registro.obtener('taqueria');
  assert.equal(obtenida.id, 'taqueria');
  assert.equal(obtenida.nombre, 'Taquería');

  const lista = registro.listar();
  assert.equal(lista.length, 1);
  assert.equal(lista[0].id, 'taqueria');
});

test('crearRegistroEscenas lanza error si se intenta registrar una escena inválida', () => {
  const registro = crearRegistroEscenas();
  assert.throws(
    () => registro.registrar({ id: 'invalida' }),
    /Definición de escena inválida/
  );
});

test('escena taquería cumple proporciones 16:9 y salida aprobada hacia la reja', () => {
  const resultado = validarEscena(escenaTaqueria);
  assert.equal(resultado.valida, true);
  const escena = resultado.escena;

  assert.equal(escena.limites.w / 1280, 3);
  assert.equal(escena.limites.h, 720);
  assert.ok(escena.plataformas.some((p) => p.tipo === 'suelo'), 'debe tener un suelo');
  assert.ok(escena.plataformas.filter((p) => p.tipo === 'plataforma').length >= 2, 'debe tener al menos 2-3 plataformas');

  const salida = escena.disparadores.find((d) => d.id === 'camioneta');
  assert.equal(salida.accion, 'subir');
  assert.equal(salida.destino, 'reja');
  assert.equal(salida.requiere, 'llave-camioneta');
});
