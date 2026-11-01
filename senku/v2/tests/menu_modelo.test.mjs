import test from 'node:test';
import assert from 'node:assert/strict';
import { crearModelo, accionarTarjeta, mensajeError } from '../src/ui/menu_modelo.mjs';

const catalogoPrueba = [
  {
    id: 'original',
    nombre: 'Senku Original',
    precio: null,
    menu: 'trajes/original/menu.png',
    sprite: 'trajes/original/sprite.png',
  },
  {
    id: 'rata',
    nombre: 'Senku Rata',
    precio: null, // D2: precio null por decisión creativa pendiente
    equivaleA: ['secreto_legacy'],
    menu: 'trajes/rata/menu.png',
    sprite: 'trajes/rata/sprite.png',
  },
  {
    id: 'callejero',
    nombre: 'Senku Callejero',
    precio: 80,
    menu: 'trajes/callejero/menu.png',
    sprite: 'trajes/callejero/sprite.png',
  },
];

test('crearModelo: maneja catálogo nulo o vacío', () => {
  assert.deepEqual(crearModelo(null, null), []);
  assert.deepEqual(crearModelo({ churus: 0 }, []), []);
});

test('crearModelo: clasifica traje equipado', () => {
  const estado = { churus: 50, trajes: ['original'], equipado: 'original' };
  const tarjetas = crearModelo(estado, catalogoPrueba);

  const tOriginal = tarjetas.find((t) => t.id === 'original');
  assert.equal(tOriginal.estado, 'equipado');
  assert.equal(tOriginal.etiqueta, 'Equipado');
  assert.equal(tOriginal.accion, null);
  assert.equal(tOriginal.deshabilitado, true);
  assert.equal(tOriginal.motivo, 'ya_equipado');
});

test('crearModelo: clasifica traje desbloqueado disponible para equipar', () => {
  const estado = { churus: 50, trajes: ['original', 'callejero'], equipado: 'original' };
  const tarjetas = crearModelo(estado, catalogoPrueba);

  const tCallejero = tarjetas.find((t) => t.id === 'callejero');
  assert.equal(tCallejero.estado, 'desbloqueado');
  assert.equal(tCallejero.etiqueta, 'Equipar');
  assert.equal(tCallejero.accion, 'equipar');
  assert.equal(tCallejero.deshabilitado, false);
  assert.equal(tCallejero.motivo, null);
});

test('crearModelo regla: precio null => etiqueta Próximamente y sin botón de compra', () => {
  const estado = { churus: 200, trajes: ['original'], equipado: 'original' };
  const tarjetas = crearModelo(estado, catalogoPrueba);

  const tRata = tarjetas.find((t) => t.id === 'rata');
  assert.equal(tRata.estado, 'bloqueado');
  assert.equal(tRata.precio, null);
  assert.equal(tRata.etiqueta, 'Próximamente');
  assert.equal(tRata.accion, null, 'No debe tener botón de compra');
  assert.equal(tRata.deshabilitado, true);
});

test('crearModelo regla: sin saldo => deshabilitado con motivo saldo_insuficiente', () => {
  const estado = { churus: 30, trajes: ['original'], equipado: 'original' };
  const tarjetas = crearModelo(estado, catalogoPrueba);

  const tCallejero = tarjetas.find((t) => t.id === 'callejero');
  assert.equal(tCallejero.estado, 'bloqueado');
  assert.equal(tCallejero.precio, 80);
  assert.equal(tCallejero.etiqueta, 'Bloqueado');
  assert.equal(tCallejero.accion, 'comprar');
  assert.equal(tCallejero.deshabilitado, true);
  assert.equal(tCallejero.motivo, 'saldo_insuficiente');
});

test('crearModelo: traje secreto indica cómo desbloquearse y no ofrece compra', () => {
  const rata = { id: 'rata', nombre: 'Traje exclusivo', precio: null, condicion: 'Hablar con la rata', menu: 'rata.webp' };
  const [tarjeta] = crearModelo({ churus: 999, trajes: ['original'], equipado: 'original' }, [rata]);
  assert.equal(tarjeta.etiqueta, 'Secreto');
  assert.equal(tarjeta.accion, null);
  assert.equal(tarjeta.motivo, 'secreto');
});

test('crearModelo: con saldo suficiente el botón comprar está habilitado', () => {
  const estado = { churus: 120, trajes: ['original'], equipado: 'original' };
  const tarjetas = crearModelo(estado, catalogoPrueba);

  const tCallejero = tarjetas.find((t) => t.id === 'callejero');
  assert.equal(tCallejero.estado, 'bloqueado');
  assert.equal(tCallejero.deshabilitado, false);
  assert.equal(tCallejero.motivo, null);
  assert.equal(tCallejero.accion, 'comprar');
});

test('crearModelo: reconoce equivalencias legacy (secreto_legacy equivale a rata)', () => {
  const estadoConSecreto = { churus: 0, trajes: ['original', 'secreto_legacy'], equipado: 'secreto_legacy' };
  const tarjetas = crearModelo(estadoConSecreto, catalogoPrueba);

  const tRata = tarjetas.find((t) => t.id === 'rata');
  assert.equal(tRata.estado, 'equipado');
  assert.equal(tRata.etiqueta, 'Equipado');
});

test('accionarTarjeta: equipa un traje desbloqueado', () => {
  const estado = { churus: 50, trajes: ['original', 'callejero'], equipado: 'original' };
  let equiparLlamado = false;

  const economiaMock = {
    equipar(st, id) {
      equiparLlamado = true;
      assert.equal(id, 'callejero');
      return { ...st, equipado: id };
    },
    comprarTraje() {
      throw new Error('No debe llamar a comprarTraje');
    },
  };

  const res = accionarTarjeta(estado, catalogoPrueba, 'callejero', economiaMock);
  assert.equal(equiparLlamado, true);
  assert.deepEqual(res, {
    estado: { churus: 50, trajes: ['original', 'callejero'], equipado: 'callejero' },
  });
});

test('accionarTarjeta: traje ya equipado devuelve el estado sin error', () => {
  const estado = { churus: 50, trajes: ['original'], equipado: 'original' };
  const res = accionarTarjeta(estado, catalogoPrueba, 'original', {});
  assert.deepEqual(res, { estado });
});

test('accionarTarjeta: compra traje bloqueado con saldo suficiente', () => {
  const estado = { churus: 100, trajes: ['original'], equipado: 'original' };
  let comprarLlamado = false;

  const economiaMock = {
    comprarTraje(st, id) {
      comprarLlamado = true;
      assert.equal(id, 'callejero');
      return { ...st, churus: st.churus - 80, trajes: [...st.trajes, id] };
    },
    equipar() {
      throw new Error('No debe llamar a equipar');
    },
  };

  const res = accionarTarjeta(estado, catalogoPrueba, 'callejero', economiaMock);
  assert.equal(comprarLlamado, true);
  assert.equal(res.estado.churus, 20);
  assert.ok(res.estado.trajes.includes('callejero'));
});

test('accionarTarjeta: rechaza compra si precio es null', () => {
  const estado = { churus: 500, trajes: ['original'], equipado: 'original' };
  const res = accionarTarjeta(estado, catalogoPrueba, 'rata', {});

  assert.equal(res.error, 'precio_no_definido');
  assert.equal(res.mensaje, 'Este traje estará disponible próximamente.');
  assert.equal(res.estado, undefined);
});

test('accionarTarjeta: rechaza compra si saldo es insuficiente', () => {
  const estado = { churus: 20, trajes: ['original'], equipado: 'original' };
  const res = accionarTarjeta(estado, catalogoPrueba, 'callejero', {});

  assert.equal(res.error, 'saldo_insuficiente');
  assert.equal(res.mensaje, 'No tienes suficientes Churus.');
});

test('accionarTarjeta: rechaza id desconocido', () => {
  const estado = { churus: 50, trajes: ['original'], equipado: 'original' };
  const res = accionarTarjeta(estado, catalogoPrueba, 'fantasma', {});

  assert.equal(res.error, 'traje_desconocido');
  assert.equal(res.mensaje, 'Traje no encontrado en el catálogo.');
});

test('accionarTarjeta: propaga error de economia.comprarTraje en español', () => {
  const estado = { churus: 100, trajes: ['original'], equipado: 'original' };
  const economiaMock = {
    comprarTraje() {
      return { error: 'saldo_insuficiente' };
    },
  };

  const res = accionarTarjeta(estado, catalogoPrueba, 'callejero', economiaMock);
  assert.equal(res.error, 'saldo_insuficiente');
  assert.equal(res.mensaje, 'No tienes suficientes Churus.');
});

test('mensajeError: devuelve mensaje por defecto si el código no está en el mapa', () => {
  assert.equal(mensajeError('error_desconocido_xyz'), 'No se pudo completar la acción.');
});
