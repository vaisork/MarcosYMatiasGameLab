import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { objetivoSenku2 } from './objetivos.mjs';

function texturaPista(){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#77736b';x.fillRect(0,0,256,256);
  for(let i=0;i<256;i+=32){x.fillStyle=i%64?'#26272b':'#eee9d8';x.fillRect(i,0,32,18);x.fillRect(i,238,32,18);}
  for(let i=-256;i<512;i+=28){x.strokeStyle='#f6c52b';x.lineWidth=10;x.beginPath();x.moveTo(i,256);x.lineTo(i+256,0);x.stroke();x.strokeStyle='#e53935';x.lineWidth=5;x.beginPath();x.moveTo(i+12,256);x.lineTo(i+268,0);x.stroke();}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);return t;
}
function gradas(g,z,y){
  const concreto=new THREE.MeshLambertMaterial({color:0xcfcbbe}),rojo=new THREE.MeshLambertMaterial({color:0xe53935}),blanco=new THREE.MeshLambertMaterial({color:0xffffff});
  for(const side of [-1,1]){const x=side*4.75;
    for(let n=0;n<3;n++){const b=new THREE.Mesh(new THREE.BoxGeometry(2.8,.35,4.6-n*.55),concreto);b.position.set(x,y+.25+n*.35,z);g.add(b);}
    const toldo=new THREE.Mesh(new THREE.BoxGeometry(3.1,.16,5),rojo);toldo.position.set(x,y+1.45,z);g.add(toldo);
    for(let k=0;k<6;k++){const f=new THREE.Mesh(new THREE.BoxGeometry(.25,.04,5),blanco);f.position.set(x-1.55+k*.62,y+1.54,z);g.add(f);}
    for(const dz of [-2,2]){const post=new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,1.6,6),blanco);post.position.set(x,y+.75,z+dz);g.add(post);}
    const tonos=[0xe53935,0xffca28,0x1e88e5];
    for(let fila=0;fila<3;fila++)for(let k=0;k<5;k++){const asiento=new THREE.Mesh(new THREE.BoxGeometry(.42,.2,.48),new THREE.MeshLambertMaterial({color:tonos[(fila+k)%3]}));asiento.position.set(x,y+.48+fila*.35,z-1.55+k*.76);g.add(asiento);}
  }
}

export default {
  id: 'senku2',
  nombre: 'Pista Senku 2',
  ambiente: { cielo: 0x4aa5e6, suelo: 0xf5b565, niebla: 0x8ed0f8 },
  crear(g, u) {
    const textura=texturaPista();
    const salida=u.plataforma(0, -0.25, 0, 12, 0.5, 12, 0xef9a48), llegada=u.plataforma(0, 1.5, -96, 14, 0.5, 14, 0xef9a48);
    for(const p of [salida,llegada])p.material=new THREE.MeshLambertMaterial({color:0xffffff,map:textura});
    gradas(g,0,-.1);gradas(g,-96,1.65);
    const cielo = new THREE.TextureLoader().load(new URL('../../texturas/mundos/senku2_cielo_atardecer_r9.webp', import.meta.url).href);
    cielo.colorSpace = THREE.SRGBColorSpace;
    const horizonte = new THREE.Mesh(new THREE.SphereGeometry(210, 32, 20), new THREE.MeshBasicMaterial({ map: cielo, side: THREE.BackSide, fog: false, depthWrite: false }));
    horizonte.renderOrder = -2; g.add(horizonte);
    new GLTFLoader().load('modelos/senku2_cordillera_r9.glb', ({ scene }) => {
      g.add(scene);
      const lienzo = document.createElement('canvas'); lienzo.width = 1024; lienzo.height = 160;
      const ctx = lienzo.getContext('2d'); ctx.fillStyle = '#e53935'; ctx.fillRect(0, 0, 1024, 160); ctx.font = 'bold 100px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff'; ctx.fillText('SENKU RACING', 512, 80);
      const titulo = new THREE.Mesh(new THREE.PlaneGeometry(5.4, .84), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lienzo), side: THREE.DoubleSide }));
      titulo.material.map.colorSpace = THREE.SRGBColorSpace; titulo.position.set(0, 5.25, -1.98); g.add(titulo);
    }, undefined, (e) => console.error('No se pudo cargar la cordillera r9', e));
    new GLTFLoader().load('modelos/senku2_escenario_r8.glb',({scene})=>g.add(scene),undefined,e=>console.error('No se pudo cargar el escenario Senku 2',e));

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
