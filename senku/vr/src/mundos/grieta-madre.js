import * as THREE from 'three';
import { objetivoGrietaMadre } from './objetivos.mjs';

export default {
  id: 'grieta-madre',
  nombre: 'La Grieta Madre',
  ambiente: { cielo: 0x180b2a, suelo: 0x271642, niebla: 0x301a50 },
  crear(g, u) {
    u.plataforma(0, -0.25, -2, 26, 0.5, 26, 0x341d59);

    for (const [x, y, z, s] of [[-10, 4, -8, 2], [11, 5, -6, 2.4], [-8, 6, 4, 1.8], [9, 3, 5, 2]]) {
      const roca = new THREE.Mesh(new THREE.DodecahedronGeometry(s), new THREE.MeshLambertMaterial({ color: 0x482d70 }));
      roca.position.set(x, y, z);
      g.add(roca);
    }

    const grieta = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.35, 8, 28), new THREE.MeshBasicMaterial({ color: 0xcc66ff, wireframe: true }));
    grieta.position.set(0, 4.5, -12);
    g.add(grieta);

    const nucleo = new THREE.Mesh(new THREE.OctahedronGeometry(2), new THREE.MeshLambertMaterial({ color: 0x9333ea, emissive: 0x3b0764 }));
    nucleo.position.set(0, 4.5, -12);
    g.add(nucleo);

    const puertas = [];
    const infoPuertas = [
      { id: 0, nombre: 'Puerta Dorada', color: 0xffd700, pos: [-5, 1.6, -6], premioTexto: '¡Sorpresa Dorada: +60 churus!', churus: 60, corazones: 0, escudo: false },
      { id: 1, nombre: 'Puerta Cósmica', color: 0x00f0ff, pos: [0, 1.6, -7.5], premioTexto: '¡Sorpresa Cósmica: Corazones al tope + 35 churus!', churus: 35, corazones: 3, escudo: false },
      { id: 2, nombre: 'Puerta Felina', color: 0xff33aa, pos: [5, 1.6, -6], premioTexto: '¡Sorpresa Felina: +45 churus y escudo 30 s!', churus: 45, corazones: 0, escudo: true },
    ];

    const geomMarco = new THREE.BoxGeometry(2.4, 3.2, 0.35);
    const geomPanel = new THREE.PlaneGeometry(1.8, 2.6);
    const geomCristal = new THREE.OctahedronGeometry(0.45);

    infoPuertas.forEach((info) => {
      const grupo = new THREE.Group();
      grupo.position.set(...info.pos);

      const marco = new THREE.Mesh(geomMarco, new THREE.MeshLambertMaterial({ color: 0x22133a }));
      const matPanel = new THREE.MeshBasicMaterial({ color: info.color, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
      const panel = new THREE.Mesh(geomPanel, matPanel);
      panel.position.z = 0.05;

      const cristal = new THREE.Mesh(geomCristal, new THREE.MeshBasicMaterial({ color: info.color }));
      cristal.position.set(0, 2.1, 0);

      grupo.add(marco, panel, cristal);
      g.add(grupo);

      puertas.push({ ...info, grupo, panel, matPanel, cristal });
    });

    return {
      grieta,
      nucleo,
      puertas,
      elegida: null,
      abierta: false,
      reloj: 0,
      premiado: false,
    };
  },

  actualizar(s, dt, ctx) {
    s.reloj += dt;

    s.grieta.rotation.z += dt * 0.7;
    s.nucleo.rotation.y += dt * 0.5;
    s.nucleo.rotation.x += dt * 0.3;

    if (s.elegida === null) {
      s.puertas.forEach((p, idx) => {
        p.cristal.position.y = 2.1 + Math.sin(s.reloj * 3 + idx) * 0.12;
        p.cristal.rotation.y += dt * 2;

        if (ctx.cerca(p.grupo.position, 1.8) || ctx.zarpazo(p.grupo.position, 2.0) || ctx.atrapado(p.grupo.position, 2.0)) {
          objetivoGrietaMadre(s, idx);
          s.elegida = idx;
          this.aplicarPremio(s, p, ctx);
        }
      });
    } else {
      s.puertas.forEach((p, idx) => {
        if (idx === s.elegida) {
          p.panel.scale.set(1.15, 1.15, 1.15);
          p.matPanel.color.setHex(0xffffff);
        } else {
          p.matPanel.opacity = 0.25;
          p.cristal.visible = false;
        }
      });
    }
  },

  aplicarPremio(s, puerta, ctx) {
    if (s.premiado) return;
    s.premiado = true;
    if (puerta.churus) ctx.sumarChurus(puerta.churus);
    if (puerta.corazones) ctx.sumarCorazon(puerta.corazones);
    if (puerta.escudo) ctx.escudo?.(30);
    ctx.avisar(puerta.premioTexto);
  },

  premio(ctx) {
    ctx.sumarChurus(30);
    ctx.avisar('¡La Grieta Madre te despide con 30 churus!');
  },

  objetivo: { texto: 'Elige 1 de las 3 puertas misteriosas', meta: 1 },
};
