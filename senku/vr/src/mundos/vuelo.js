import * as THREE from 'three';
import { dificultadVuelo, falloIntentoVuelo, objetivoVuelo, tiempoVueloAgotado } from './objetivos.mjs';

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

export function crearEstadoControlVuelo() {
  return { volando: false, planeando: false, tiempoJuntas: -9999, ultimoSalto: 0, espacioPrevio: false, saltoToquePrevio: 0, reloj: 0 };
}

export function actualizarControlVuelo(s, dt, ctx) {
  const volaba = s.volando;

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
  if (saltoPC || saltoMovil) {
    const ahora = performance.now();
    if (s.volando) {
      s.volando = false;
      s.planeando = true;
      ctx.avisar?.('Planeando...');
    } else if (ahora - s.ultimoSalto < 1500) {
      s.volando = true;
      s.planeando = false;
      ctx.avisar?.('¡Volando! Guía con la vista');
    } else {
      s.ultimoSalto = ahora;
    }
  }

  if (ctx.jugadora?.enSuelo) {
    s.volando = false;
    s.planeando = false;
  }

  if (s.volando) {
    vDirVuelo.set(0, 0, 0);
    if (ctx.esVR && ctx.manos && ctx.manos.length >= 2) {
      vDir0.set(0, 0, -1).applyQuaternion(ctx.manos[0].control.getWorldQuaternion(q0));
      vDir1.set(0, 0, -1).applyQuaternion(ctx.manos[1].control.getWorldQuaternion(q1));
      vDirManos.addVectors(vDir0, vDir1);
      if (vDirManos.lengthSq() > 0.05) vDirVuelo.copy(vDirManos).normalize();
      else if (ctx.camara) ctx.camara.getWorldDirection(vDirVuelo);
    } else if (ctx.camara) {
      ctx.camara.getWorldDirection(vDirVuelo);
    }
    if (vDirVuelo.lengthSq() === 0) vDirVuelo.set(0, 0, -1);
    const VELOCIDAD = 14;
    const g = typeof ctx.gravedad === 'number' ? ctx.gravedad : -13;
    ctx.jugadora.vel.x = vDirVuelo.x * VELOCIDAD;
    ctx.jugadora.vel.y = vDirVuelo.y * VELOCIDAD - g * dt;
    ctx.jugadora.vel.z = vDirVuelo.z * VELOCIDAD;
  } else if (s.planeando) {
    ctx.jugadora.vel.y = Math.max(ctx.jugadora.vel.y, -3);
    ctx.jugadora.vel.x *= 0.99;
    ctx.jugadora.vel.z *= 0.99;
  }

  return { inicio: !volaba && s.volando, fin: volaba && !s.volando };
}

export default {
  id: 'vuelo',
  nombre: 'Cielo de Vuelo',
  ambiente: { cielo: 0x6ed4ff, suelo: 0xa8f5c8, niebla: 0xb2ecff },

  crear(g, u) {
    // Plataforma base donde aparece la jugadora y el aro de retorno
    const islas = [[0,-.25,0,10,.5],[14,4,-14,8,.6],[-16,7,-10,9,.6],[10,10,12,7,.6],[-12,11,14,8,.6],[0,15,-24,10,.6]];
    const esferaNube = new THREE.SphereGeometry(1, 8, 6);
    const blancos = [new THREE.MeshLambertMaterial({ color: 0xffffff }), new THREE.MeshLambertMaterial({ color: 0xf2fbff })];
    islas.forEach(([x,y,z,w,h], idx) => {
      const suelo = u.plataforma(x, y, z, w, h, w, [0x8be5a0,0x9be8b0,0xa3ebb6,0x9be8b0,0xa3ebb6,0xb0f0c0][idx]);
      suelo.visible = false;
      const isla = new THREE.Group(), superficie = new THREE.Mesh(esferaNube, blancos[idx % 2]);
      superficie.position.set(x, y + h / 2, z); superficie.scale.set(w * .47, .18, w * .47); isla.add(superficie);
      for (let puff = 0; puff < 6; puff++) {
        const a = puff * Math.PI / 3, tam = w * (puff % 2 ? .25 : .29);
        const nube = new THREE.Mesh(esferaNube, blancos[(idx + puff) % 2]);
        nube.position.set(x + Math.cos(a) * w * .31, y + h / 2 - .02, z + Math.sin(a) * w * .31);
        nube.scale.set(tam, .36 + (puff % 2) * .08, tam); isla.add(nube);
      }
      g.add(isla);
    });
    // Aros de viento dorados marcan el rumbo sin confundirse con los objetivos turquesa.
    const viento = new THREE.Group(), oro = new THREE.MeshLambertMaterial({ color: 0xffd54f, emissive: 0x8a5100, emissiveIntensity: .55 });
    for (const [x,y,z] of [[5,8,-14],[12,11,-4],[5,14,10],[-9,14,12],[-5,19,-22]]) {
      const aro = new THREE.Mesh(new THREE.TorusGeometry(1.4,.075,6,20), oro);
      aro.position.set(x,y,z); viento.add(aro);
      for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
        const brillo = new THREE.Mesh(new THREE.SphereGeometry(.12,6,4), new THREE.MeshBasicMaterial({ color: 0xfff3a1 }));
        brillo.position.set(x + Math.cos(a) * 1.4, y + Math.sin(a) * 1.4, z); viento.add(brillo);
      }
    }
    g.add(viento);

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
      churus.push({ grupo: contenedor, base: y, baseOrigen: { x, y, z }, origen: { x, y, z }, fase: x + z, id: i, recogido: false, movil: false });
    });

    return {
      churus,
      nubes,
      recogidos: new Set(),
      dificultad: dificultadVuelo(0),
      ...crearEstadoControlVuelo(),
      intentandoPerfecto: false,
      inicioIntento: null,
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

    // Animación de churus en el aire; los objetivos móviles recorren más distancia al subir de nivel.
    s.churus.forEach((item) => {
      if (!item.recogido) {
        if (item.movil) {
          const fase = s.reloj * s.dificultad.velocidadMovimiento + item.fase;
          item.grupo.position.x = item.origen.x + Math.sin(fase) * 1.1;
          item.grupo.position.y = item.origen.y + Math.sin(fase * 1.7) * 0.55;
          item.grupo.position.z = item.origen.z + Math.cos(fase) * 1.1;
        } else {
          item.grupo.position.set(item.origen.x, item.origen.y + Math.sin(s.reloj * 2.2 + item.fase) * 0.35, item.origen.z);
        }
        item.grupo.rotation.y += dt * 1.6;
      }
    });

    const { inicio, fin } = actualizarControlVuelo(s, dt, ctx);
    if (inicio) { s.intentandoPerfecto = true; s.inicioIntento = s.reloj; }
    const transcurrido = s.inicioIntento === null ? 0 : s.reloj - s.inicioIntento;
    const agotado = s.intentandoPerfecto && tiempoVueloAgotado(transcurrido, s.dificultad.tiempoLimite);
    const cayendo = ctx.jugadora.pos.y < 0;
    const fallo = s.intentandoPerfecto && falloIntentoVuelo({
      volando: s.volando, aterrizo: Boolean(ctx.jugadora?.enSuelo && !inicio), cayendo,
      tiempoAgotado: agotado, recogidos: s.recogidos.size,
    });
    const falloIntento = fallo && cancelarIntentoVuelo(s, ctx.avisar);

    // Recoger cosas volando
    if (!falloIntento) {
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
    }

    if (s.recogidos.size >= 10 && !s.premiado) {
      s.premiado = true;
      s.intentandoPerfecto = false;
      this.premio(ctx);
      ctx.vueloPerfecto?.();
    }
  },

  premio(ctx) {
    ctx.sumarChurus(50);
    ctx.avisar?.('¡Cielo de Vuelo completado! +50 churus');
  },

  objetivo: { texto: 'Recoge 10 churus celestes volando', meta: 10 },
};

function fallarIntento(s, avisar) {
  s.intentandoPerfecto = false;
  s.inicioIntento = null;
  s.volando = false;
  s.planeando = false;
  s.recogidos.clear();
  s.premiado = false;
  s.churus.forEach((item) => {
    item.recogido = false;
    item.grupo.position.set(item.origen.x, item.origen.y, item.origen.z);
    item.grupo.visible = true;
  });
  avisar?.('Fallaste: aterrizaste, caíste o se acabó el tiempo');
}

export function cancelarIntentoVuelo(s, avisar) {
  if (!s?.intentandoPerfecto || s.recogidos.size >= 10) return false;
  fallarIntento(s, avisar);
  return true;
}

export function reiniciarVuelo(s, perfectos = 0) {
  s.recogidos.clear();
  s.dificultad = dificultadVuelo(perfectos);
  s.churus.forEach((item, i) => {
    const origen = { ...item.baseOrigen };
    if (s.dificultad.nivel >= 3 && [2, 4, 7].includes(i)) { origen.x *= 1.18; origen.y += 2.5; origen.z *= 1.18; }
    if (s.dificultad.nivel >= 4 && [5, 8, 9].includes(i)) { origen.x *= 1.22; origen.y += 3.5; origen.z *= 1.22; }
    Object.assign(item, { recogido: false, origen, fase: item.fase, movil: i < s.dificultad.churusMoviles });
    item.grupo.position.set(origen.x, origen.y, origen.z);
    item.grupo.visible = true;
  });
  Object.assign(s, crearEstadoControlVuelo(), { intentandoPerfecto: false, inicioIntento: null, reloj: 0, premiado: false });
}
