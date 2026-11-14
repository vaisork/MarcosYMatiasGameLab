import * as THREE from 'three';
import { objetivoVuelo } from './objetivos.mjs';

let toqueSalto = 0;
if (typeof document !== 'undefined') {
  document.getElementById('t-saltar')?.addEventListener('pointerdown', () => {
    toqueSalto = performance.now();
  });
}

const vGarra0 = new THREE.Vector3();
const vGarra1 = new THREE.Vector3();
const q0 = new THREE.Quaternion();
const q1 = new THREE.Quaternion();
const vDir0 = new THREE.Vector3();
const vDir1 = new THREE.Vector3();
const vDirManos = new THREE.Vector3();
const vDirVuelo = new THREE.Vector3();

export default {
  id: 'vuelo',
  nombre: 'Cielo de Vuelo',
  ambiente: { cielo: 0x6ed4ff, suelo: 0xa8f5c8, niebla: 0xb2ecff },

  crear(g, u) {
    // Plataforma base donde aparece la jugadora y el aro de retorno
    u.plataforma(0, -0.25, 0, 10, 0.5, 10, 0x8be5a0);

    // Islas flotantes claras y luminosas
    u.plataforma(14, 4, -14, 8, 0.6, 8, 0x9be8b0);
    u.plataforma(-16, 7, -10, 9, 0.6, 9, 0xa3ebb6);
    u.plataforma(10, 10, 12, 7, 0.6, 7, 0x9be8b0);
    u.plataforma(-12, 11, 14, 8, 0.6, 8, 0xa3ebb6);
    u.plataforma(0, 15, -24, 10, 0.6, 10, 0xb0f0c0);

    // Nubes decorativas blancas y esponjosas
    const matNube = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 });
    const nubes = [];
    const centrosNubes = [
      [-8, 8, -6, 1.2],
      [18, 12, 4, 1.4],
      [-10, 16, 20, 1.1],
      [6, 18, -18, 1.3],
      [-20, 9, -20, 1.5],
      [15, 6, 22, 1.0],
      [0, 22, 0, 1.6],
    ];
    centrosNubes.forEach(([cx, cy, cz, escala]) => {
      const nube = new THREE.Group();
      const geomPuff = new THREE.SphereGeometry(1.3 * escala, 7, 5);
      [
        [0, 0, 0, 1.0],
        [-1.1 * escala, -0.2 * escala, 0, 0.8],
        [1.1 * escala, -0.2 * escala, 0, 0.8],
        [0.5 * escala, 0.4 * escala, -0.4 * escala, 0.75],
        [-0.5 * escala, 0.3 * escala, 0.3 * escala, 0.75],
      ].forEach(([ox, oy, oz, s]) => {
        const puff = new THREE.Mesh(geomPuff, matNube);
        puff.position.set(ox, oy, oz);
        puff.scale.setScalar(s);
        nube.add(puff);
      });
      nube.position.set(cx, cy, cz);
      g.add(nube);
      nubes.push(nube);
    });

    // 10 Churus celestes con halos en el aire para recoger volando
    const churus = [];
    const matChuru = new THREE.MeshBasicMaterial({ color: 0xffdc70 });
    const matHalo = new THREE.MeshBasicMaterial({ color: 0x79f2e1, transparent: true, opacity: 0.85 });
    const geomChuru = new THREE.CapsuleGeometry(0.16, 0.45, 4, 8);
    const geomHalo = new THREE.TorusGeometry(0.55, 0.06, 6, 16);

    const posiciones = [
      [0, 6, -10],
      [8, 9, -18],
      [16, 12, -8],
      [12, 15, 8],
      [0, 16, 16],
      [-12, 14, 10],
      [-18, 11, -4],
      [-10, 8, -14],
      [0, 12, 0],
      [0, 20, -5],
    ];

    posiciones.forEach(([x, y, z], i) => {
      const contenedor = new THREE.Group();
      contenedor.position.set(x, y, z);
      const mChuru = new THREE.Mesh(geomChuru, matChuru);
      mChuru.rotation.z = Math.PI / 4;
      const mHalo = new THREE.Mesh(geomHalo, matHalo);
      contenedor.add(mChuru, mHalo);
      g.add(contenedor);
      churus.push({ grupo: contenedor, base: y, fase: x + z, id: i, recogido: false });
    });

    return {
      churus,
      nubes,
      recogidos: new Set(),
      volando: false,
      planeando: false,
      tiempoJuntas: -9999,
      ultimoSalto: 0,
      espacioPrevio: false,
      saltoToquePrevio: 0,
      reloj: 0,
      premiado: false,
    };
  },

  actualizar(s, dt, ctx) {
    s.reloj += dt;

    // Animación suave de nubes
    s.nubes.forEach((n, idx) => {
      n.rotation.y += dt * 0.03 * (idx % 2 ? 1 : -1);
    });

    // Animación de churus en el aire
    s.churus.forEach((item) => {
      if (!item.recogido) {
        item.grupo.position.y = item.base + Math.sin(s.reloj * 2.2 + item.fase) * 0.35;
        item.grupo.rotation.y += dt * 1.6;
      }
    });

    // Gesto en Quest (VR): manos juntas (<0.35 m) y luego separadas (>1.1 m) en <1.5 s
    if (ctx.manos && ctx.manos.length >= 2) {
      ctx.manos[0].garra.getWorldPosition(vGarra0);
      ctx.manos[1].garra.getWorldPosition(vGarra1);
      const distManos = vGarra0.distanceTo(vGarra1);

      if (distManos < 0.35) {
        if (s.volando) {
          s.volando = false;
          s.planeando = true;
          s.tiempoJuntas = s.reloj;
          ctx.avisar?.('Planeando...');
        } else {
          s.tiempoJuntas = s.reloj;
        }
      } else if (distManos > 1.1) {
        if (!s.volando && (s.reloj - s.tiempoJuntas) < 1.5) {
          s.volando = true;
          s.planeando = false;
          ctx.avisar?.('¡Volando! Guía con las manos');
        }
      }
    }

    // Control sin visor (PC / Celular): doble salto activa vuelo y avanza hacia la cámara
    const pulsaEspacio = Boolean(ctx.teclas?.has('Space'));
    const saltoPC = pulsaEspacio && !s.espacioPrevio;
    s.espacioPrevio = pulsaEspacio;

    const saltoMovil = toqueSalto > s.saltoToquePrevio;
    if (saltoMovil) s.saltoToquePrevio = toqueSalto;

    const haySalto = saltoPC || saltoMovil;
    if (haySalto) {
      const ahora = performance.now();
      if (s.volando) {
        s.volando = false;
        s.planeando = true;
        ctx.avisar?.('Planeando...');
      } else {
        if (ahora - s.ultimoSalto < 1500) {
          s.volando = true;
          s.planeando = false;
          ctx.avisar?.('¡Volando! Guía con la vista');
        } else {
          s.ultimoSalto = ahora;
        }
      }
    }

    // Aterrizar detiene el vuelo
    if (ctx.jugadora?.enSuelo) {
      s.volando = false;
      s.planeando = false;
    }

    // Movimiento y física del vuelo
    if (s.volando) {
      vDirVuelo.set(0, 0, 0);

      if (ctx.esVR && ctx.manos && ctx.manos.length >= 2) {
        // En Quest: promedio hacia donde apuntan las manos o la cabeza
        vDir0.set(0, 0, -1).applyQuaternion(ctx.manos[0].control.getWorldQuaternion(q0));
        vDir1.set(0, 0, -1).applyQuaternion(ctx.manos[1].control.getWorldQuaternion(q1));
        vDirManos.addVectors(vDir0, vDir1);

        if (vDirManos.lengthSq() > 0.05) {
          vDirVuelo.copy(vDirManos).normalize();
        } else if (ctx.camara) {
          ctx.camara.getWorldDirection(vDirVuelo);
        }
      } else if (ctx.camara) {
        // Sin visor: dirección de la cámara
        ctx.camara.getWorldDirection(vDirVuelo);
      }

      if (vDirVuelo.lengthSq() === 0) vDirVuelo.set(0, 0, -1);

      const VELOCIDAD = 14;
      const g = typeof ctx.gravedad === 'number' ? ctx.gravedad : -13;

      // Desplaza la velocidad contrarrestando la gravedad
      ctx.jugadora.vel.x = vDirVuelo.x * VELOCIDAD;
      ctx.jugadora.vel.y = vDirVuelo.y * VELOCIDAD - g * dt;
      ctx.jugadora.vel.z = vDirVuelo.z * VELOCIDAD;
    } else if (s.planeando) {
      // Manos juntas: planear / bajar suavemente
      ctx.jugadora.vel.y = Math.max(ctx.jugadora.vel.y, -3);
      ctx.jugadora.vel.x *= 0.99;
      ctx.jugadora.vel.z *= 0.99;
    }

    // Recoger cosas volando
    s.churus.forEach((item) => {
      if (!item.recogido && ctx.cerca(item.grupo.position, 2.0)) {
        const prevSize = s.recogidos.size;
        objetivoVuelo(s, item.id, s.volando);

        if (s.recogidos.size > prevSize) {
          item.recogido = true;
          item.grupo.visible = false;
          ctx.sumarChurus(1);
          ctx.avisar?.(`¡Churu celeste ${s.recogidos.size}/10!`);
        } else if (!s.volando) {
          ctx.avisar?.('¡Vuela para recogerlo!');
        }
      }
    });

    if (s.recogidos.size >= 10 && !s.premiado) {
      s.premiado = true;
      this.premio(ctx);
    }
  },

  premio(ctx) {
    ctx.sumarChurus(50);
    ctx.avisar?.('¡Cielo de Vuelo completado! +50 churus');
  },

  objetivo: { texto: 'Recoge 10 churus celestes volando', meta: 10 },
};
