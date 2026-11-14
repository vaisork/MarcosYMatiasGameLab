import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { objetivoSenku2 } from './objetivos.mjs';

export default {
  id: 'senku2',
  nombre: 'Pista Senku 2',
  ambiente: { cielo: 0x4aa5e6, suelo: 0xf5b565, niebla: 0x8ed0f8 },
  crear(g, u) {
    u.plataforma(0, -0.25, 0, 12, 0.5, 12, 0xef9a48);
    u.plataforma(0, 1.5, -96, 14, 0.5, 14, 0xef9a48);

    const aros = [];
    const matAro = new THREE.MeshLambertMaterial({ color: 0x00d4ff, emissive: 0x006477, emissiveIntensity: .85 });
    const matBorde = new THREE.MeshLambertMaterial({ color: 0xffd23f, emissive: 0x553800, emissiveIntensity: .5 });
    const geomAro = new THREE.TorusGeometry(1.6, 0.12, 8, 24);
    const geomBorde = new THREE.TorusGeometry(1.82, .09, 8, 24);
    const formaFlecha = new THREE.Shape(); formaFlecha.moveTo(-.12,-.22); formaFlecha.lineTo(.12,-.22); formaFlecha.lineTo(.12,.16); formaFlecha.lineTo(.32,.16); formaFlecha.lineTo(0,.52); formaFlecha.lineTo(-.32,.16); formaFlecha.lineTo(-.12,.16); formaFlecha.closePath();
    const geomFlecha = new THREE.ShapeGeometry(formaFlecha);
    const matFlecha = new THREE.MeshLambertMaterial({ color: 0xffea00, emissive: 0xffb300, emissiveIntensity: 1, side: THREE.DoubleSide });
    const ruta = [
      [0, 2.5, -7],
      [-3, 3.8, -15],
      [-5, 5.0, -23],
      [-2, 5.8, -31],
      [3, 5.5, -39],
      [6, 4.8, -47],
      [4, 5.6, -55],
      [-1, 6.2, -63],
      [-5, 5.8, -71],
      [-3, 4.8, -79],
      [0, 3.8, -87],
      [0, 2.8, -94],
    ];
    new GLTFLoader().load('modelos/acrobacias_balizas_r2.glb',({scene})=>ruta.forEach(([x,y,z],i)=>{if(i%3!==2)return;const kit=scene.clone(true);kit.position.set(x,y-3.25,z);kit.scale.setScalar(.7);g.add(kit);}),undefined,(e)=>console.error('No se pudieron cargar las balizas de la pista',e));

    ruta.forEach(([x, y, z], i) => {
      const aro = new THREE.Group();
      const interior = new THREE.Mesh(geomAro, matAro.clone()), borde = new THREE.Mesh(geomBorde, matBorde.clone());
      const flecha = new THREE.Mesh(geomFlecha, matFlecha); flecha.position.z = .14;
      aro.add(interior,borde,flecha); aro.userData.luz=interior.material; aro.position.set(x,y,z); g.add(aro);
      aros.push(aro);

      const globo = new THREE.Mesh(new THREE.SphereGeometry(.38,8,6),new THREE.MeshLambertMaterial({color:i%2?0xff80ab:0x80deea,emissive:i%2?0x441222:0x123844}));
      globo.position.set(x+2.2,y+1.8,z);g.add(globo);
      const cuerda = new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,1.8,5),new THREE.MeshLambertMaterial({color:0xffd23f}));cuerda.position.set(x+2.2,y+.9,z);g.add(cuerda);

      if (i % 3 === 2) {
        u.plataforma(x, y - 3.5, z, 5, 0.5, 5, 0xdf8437);
      }
    });

    return {
      aros,
      cruzados: new Set(),
      combo: 0,
      reloj: 0,
      premiado: false,
    };
  },

  actualizar(s, dt, ctx) {
    s.reloj += dt;

    s.aros.forEach((aro, i) => {
      aro.rotation.z = Math.sin(s.reloj * 1.5 + i) * 0.15;

      if (!s.cruzados.has(i) && ctx.cerca(aro.position, 2.3)) {
        objetivoSenku2(s, i);
        aro.userData.luz.color.setHex(0xffea00); aro.userData.luz.emissive.setHex(0x776600);
        aro.scale.set(1.2, 1.2, 1.2);
        ctx.sumarChurus(1);
        ctx.avisar(`¡Aro ${s.cruzados.size}/12! Combo ×${s.combo}`);
      }
    });

    if (s.cruzados.size === 12 && !s.premiado) {
      s.premiado = true;
      this.premio(ctx);
    }
  },

  premio(ctx) {
    ctx.sumarChurus(24);
    ctx.avisar('¡Pista Senku 2 completada! Combo máximo +24 churus');
  },

  objetivo: { texto: 'Cruza 12 aros en cadena', meta: 12 },
};
