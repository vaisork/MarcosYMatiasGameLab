import test from 'node:test';
import assert from 'node:assert/strict';
import {
  crearAlmacenMemoria,
  crearAlmacenNavegador,
  crearAlmacenNativo,
  obtenerAlmacen,
} from '../src/core/almacen.mjs';
import { estadoNuevo, cargar, guardar, CLAVE } from '../src/core/store.mjs';
import { iniciar } from '../src/core/migracion.mjs';

test('adaptador memoria: interfaz unificada get/set/remove', () => {
  const m = crearAlmacenMemoria({ clave1: 'valor1' });
  assert.equal(m.tipo, 'memoria');
  assert.equal(m.disponible, true);
  assert.equal(m.bloqueado, false);

  assert.equal(m.get('clave1'), 'valor1');
  assert.equal(m.get('inexistente'), null);

  assert.equal(m.set('clave2', 'valor2'), true);
  assert.equal(m.get('clave2'), 'valor2');

  // Conversión automática a String de valores primitivos
  m.set('numero', 42);
  assert.strictEqual(m.get('numero'), '42');

  assert.equal(m.remove('clave1'), true);
  assert.equal(m.get('clave1'), null);
  assert.equal(m.remove('no_existe'), false);

  m.clear();
  assert.equal(m.get('clave2'), null);
});

test('adaptador memoria: compatibilidad con Storage API y store.mjs', () => {
  const m = crearAlmacenMemoria();
  m.setItem('test_k', 'test_v');
  assert.equal(m.getItem('test_k'), 'test_v');
  m.removeItem('test_k');
  assert.equal(m.getItem('test_k'), null);

  const estado = { ...estadoNuevo(), churus: 25 };
  assert.equal(guardar(m, estado), true);
  const cargado = cargar(m);
  assert.deepEqual(cargado.estado, estado);
});

test('adaptador navegador: funcionamiento normal con localStorage simulado', () => {
  const almacenLocal = new Map();
  const ventanaSimulada = {
    localStorage: {
      getItem: (k) => (almacenLocal.has(k) ? almacenLocal.get(k) : null),
      setItem: (k, v) => { almacenLocal.set(k, String(v)); },
      removeItem: (k) => { almacenLocal.delete(k); },
      clear: () => { almacenLocal.clear(); },
    },
  };

  const nav = crearAlmacenNavegador(ventanaSimulada);
  assert.equal(nav.tipo, 'navegador');
  assert.equal(nav.disponible, true);
  assert.equal(nav.bloqueado, false);

  assert.equal(nav.set('senku_key', 'ok'), true);
  assert.equal(nav.get('senku_key'), 'ok');
  assert.equal(nav.remove('senku_key'), true);
  assert.equal(nav.get('senku_key'), null);

  // Comprobación de ida y vuelta con store.mjs
  const estado = estadoNuevo();
  assert.equal(guardar(nav, estado), true);
  assert.deepEqual(cargar(nav).estado, estado);
});

test('adaptador navegador: tolera ventana sin localStorage o null', () => {
  const navSinStorage = crearAlmacenNavegador({});
  assert.equal(navSinStorage.tipo, 'navegador');
  assert.equal(navSinStorage.disponible, false);
  assert.equal(navSinStorage.bloqueado, true);

  // No debe lanzar excepciones
  assert.equal(navSinStorage.get('k'), null);
  assert.equal(navSinStorage.set('k', 'v'), false);
  assert.equal(navSinStorage.remove('k'), false);

  const navNull = crearAlmacenNavegador(null);
  assert.equal(navNull.disponible, false);
  assert.equal(navNull.get('k'), null);
  assert.equal(navNull.set('k', 'v'), false);
});

test('adaptador navegador: tolera SecurityError en acceso inicial a localStorage', () => {
  const ventanaBloqueada = {
    get localStorage() {
      throw new Error('SecurityError: Access is denied for this document');
    },
  };

  const nav = crearAlmacenNavegador(ventanaBloqueada);
  assert.equal(nav.disponible, false);
  assert.equal(nav.bloqueado, true);

  assert.equal(nav.get('cualquiera'), null);
  assert.equal(nav.set('k', 'v'), false);
  assert.equal(nav.remove('k'), false);

  // Compatibilidad con store.cargar: detecta almacenamiento bloqueado sin lanzar
  const resCargar = cargar(nav);
  assert.equal(resCargar.estado, null);
  assert.equal(resCargar.motivo, 'almacenamiento_bloqueado');

  const resGuardar = guardar(nav, estadoNuevo());
  assert.equal(resGuardar, false);
});

test('adaptador navegador: tolera fallo en tiempo de ejecución (QuotaExceededError)', () => {
  const ventanaCuotaLlena = {
    localStorage: {
      getItem: () => null,
      setItem: () => {
        const error = new Error('QuotaExceededError: DOMException');
        error.name = 'QuotaExceededError';
        throw error;
      },
      removeItem: () => {},
    },
  };

  const nav = crearAlmacenNavegador(ventanaCuotaLlena);
  assert.equal(nav.disponible, true);

  // La interfaz set() devuelve false sin romper la aplicación
  assert.equal(nav.set('partida', 'datos_pesados'), false);

  // store.guardar devuelve false sin lanzar excepciones
  assert.equal(guardar(nav, estadoNuevo()), false);
});

test('adaptador nativo stub: no se activa sin plugin Capacitor Preferences', () => {
  // Ventana sin Capacitor
  const nativoSinPlugin = crearAlmacenNativo({});
  assert.equal(nativoSinPlugin.tipo, 'nativo');
  assert.equal(nativoSinPlugin.disponible, false);
  assert.equal(nativoSinPlugin.bloqueado, true);

  assert.equal(nativoSinPlugin.get('clave'), null);
  assert.equal(nativoSinPlugin.set('clave', 'valor'), false);
  assert.equal(nativoSinPlugin.remove('clave'), false);

  // Métodos Storage API lanzan al no estar disponible el plugin
  assert.throws(() => nativoSinPlugin.getItem('clave'), /almacen_nativo_no_disponible/);
  assert.throws(() => nativoSinPlugin.setItem('clave', 'v'), /almacen_nativo_no_disponible/);
});

test('adaptador nativo stub: reconoce presencia de Capacitor Preferences', () => {
  const pluginMock = {
    get: async () => ({ value: null }),
    set: async () => {},
    remove: async () => {},
  };
  const ventanaConCapacitor = {
    Capacitor: {
      Plugins: {
        Preferences: pluginMock,
      },
    },
  };

  const nativoConPlugin = crearAlmacenNativo(ventanaConCapacitor);
  assert.equal(nativoConPlugin.tipo, 'nativo');
  assert.equal(nativoConPlugin.disponible, true);
  assert.equal(nativoConPlugin.bloqueado, false);
});

test('obtenerAlmacen: resolución automática según entorno', () => {
  // 1. Entorno Capacitor nativo
  const vCapacitor = {
    Capacitor: {
      Plugins: {
        Preferences: {},
      },
    },
  };
  assert.equal(obtenerAlmacen(vCapacitor).tipo, 'nativo');

  // 2. Entorno navegador con localStorage
  const vNavegador = {
    localStorage: {
      getItem: () => null,
      setItem: () => {},
    },
    document: {},
  };
  assert.equal(obtenerAlmacen(vNavegador).tipo, 'navegador');

  // 3. Entorno sin ventana (Node.js) -> memoria
  assert.equal(obtenerAlmacen(null).tipo, 'memoria');

  // 4. Preferencia forzada
  assert.equal(obtenerAlmacen(vNavegador, { preferencia: 'memoria' }).tipo, 'memoria');
});

test('integración con migracion.iniciar usando adaptadores', () => {
  // Caso A: Almacén de memoria nuevo
  const mem = crearAlmacenMemoria();
  const resInicioMem = iniciar(mem);
  assert.equal(resInicioMem.origen, 'nuevo');
  assert.equal(resInicioMem.guardado, true);
  assert.equal(resInicioMem.estado.version, 1);

  // Caso B: Almacén de navegador funcional con datos legacy
  const mapLegacy = new Map([
    ['senku_churus', '150'],
    ['senku_secret', '1'],
    ['senku_skin', 'secret'],
  ]);
  const vLegacy = {
    localStorage: {
      getItem: (k) => (mapLegacy.has(k) ? mapLegacy.get(k) : null),
      setItem: (k, v) => mapLegacy.set(k, String(v)),
      removeItem: (k) => mapLegacy.delete(k),
    },
    document: {},
  };
  const almL = obtenerAlmacen(vLegacy);
  const resInicioL = iniciar(almL);
  assert.equal(resInicioL.origen, 'legacy');
  assert.equal(resInicioL.estado.churus, 150);
  assert.equal(resInicioL.estado.equipado, 'secreto_legacy');
  assert.equal(resInicioL.guardado, true);

  // Caso C: Almacén bloqueado tolera arranque sin romper la aplicación
  const vBloqueada = {
    get localStorage() {
      throw new Error('Almacenamiento restringido');
    },
    document: {},
  };
  const almB = obtenerAlmacen(vBloqueada);
  const resInicioB = iniciar(almB);
  assert.equal(resInicioB.origen, 'nuevo');
  assert.equal(resInicioB.guardado, false);
  assert.ok(resInicioB.estado);
});
