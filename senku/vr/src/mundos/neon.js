import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { objetivoNeon } from './objetivos.mjs';
function asfaltoMojado() {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');
  c.fillStyle='#191625';c.fillRect(0,0,256,256);let seed=41;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  for(let i=0;i<240;i++){const x=rnd()*256,y=rnd()*256,w=4+rnd()*36,h=2+rnd()*7;c.fillStyle=i%4?'rgba(80,92,115,.14)':'rgba(0,229,255,.14)';c.beginPath();c.ellipse(x,y,w,h,rnd()*Math.PI,0,Math.PI*2);c.fill();}
  for(let i=0;i<18;i++){c.strokeStyle=i%2?'rgba(255,0,127,.2)':'rgba(0,229,255,.2)';c.lineWidth=1+rnd()*2;c.beginPath();c.moveTo(rnd()*256,rnd()*256);c.lineTo(rnd()*256,rnd()*256);c.stroke();}
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);return t;
}
const barra = (grupo, a, b, radio, material) => {
  const inicio=new THREE.Vector3(...a), fin=new THREE.Vector3(...b), delta=fin.clone().sub(inicio);
  const m=new THREE.Mesh(new THREE.CylinderGeometry(radio,radio,delta.length(),6),material);
  m.position.copy(inicio).add(fin).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()); grupo.add(m);
};
export default {
  id: 'neon', nombre: 'Ciudad Neón', ambiente: { cielo: 0x21194f, suelo: 0x59367c, niebla: 0x39265f },
  crear(g, u) {
    const pavimento=u.plataforma(0,-.25,0,32,.5,32,0x161224);
    const cielo = new THREE.TextureLoader().load(new URL('../../texturas/mundos/cielo_noche_estrellada_r9.webp', import.meta.url).href);
    cielo.colorSpace = THREE.SRGBColorSpace;
    const esferaCielo = new THREE.Mesh(new THREE.SphereGeometry(190,32,20),new THREE.MeshBasicMaterial({map:cielo,side:THREE.BackSide,fog:false,depthWrite:false}));
    esferaCielo.renderOrder=-2;g.add(esferaCielo);
    const lunaForma = new THREE.Shape();
    lunaForma.moveTo(0,1.6); lunaForma.bezierCurveTo(-1.35,1.45,-1.55,-.5,-.1,-1.55); lunaForma.bezierCurveTo(-.72,-.55,-.58,.42,0,1.6);
    const luna = new THREE.Mesh(new THREE.ShapeGeometry(lunaForma,20),new THREE.MeshBasicMaterial({color:0xe0f7fa,emissive:0xb2ebf2,emissiveIntensity:1.6,side:THREE.DoubleSide,fog:false}));
    luna.position.set(18,28,-55);g.add(luna);
    pavimento.material=new THREE.MeshStandardMaterial({color:0xffffff,map:asfaltoMojado(),roughness:.22,metalness:.25});
    new GLTFLoader().load('modelos/neon_skyline_r2.glb',({scene})=>{scene.position.y=0;g.add(scene);},undefined,(e)=>console.error('No se pudo cargar skyline neón',e));
    // Torres facetadas en el perímetro: dejan libre la ruta de rótulos del centro.
    const ventanas = new THREE.InstancedMesh(new THREE.BoxGeometry(.72, .95, .12), new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x42c5ff, emissiveIntensity: .8 }), 96);
    const torre = new THREE.Object3D(), ubicaciones = [[-13,-13],[-5,-14],[5,-14],[13,-13],[-14,2],[14,3],[-12,14],[0,14],[12,14]];
    ubicaciones.forEach(([x,z],i) => {
      const alto = 5 + (i * 7 % 6), tono = [0x32274b,0x3b2858,0x253c62][i%3];
      const fuste = new THREE.Mesh(new THREE.CylinderGeometry(1.45,1.8,alto,7),new THREE.MeshLambertMaterial({color:tono}));
      fuste.position.set(x,alto/2,z);g.add(fuste);
      const remate = new THREE.Mesh(new THREE.ConeGeometry(1.65,1.6,7),new THREE.MeshLambertMaterial({color:[0xff48cc,0x00e5ff,0xffdc4d][i%3],emissive:[0x6b123f,0x07506a,0x665012][i%3]}));
      remate.position.set(x,alto+.8,z);g.add(remate);
      for(let floor=0;floor<Math.floor(alto/2);floor++) for(let face=0;face<4;face++) {
        const a=face*Math.PI/2, radius=1.5;
        torre.position.set(x+Math.sin(a)*radius,1.5+floor*1.7,z+Math.cos(a)*radius);
        torre.rotation.set(0,a,0);torre.updateMatrix();ventanas.setMatrixAt(i*10+floor*4+face,torre.matrix);
      }
    });
    g.add(ventanas);
    const escalera=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.07,.07),new THREE.MeshLambertMaterial({color:0x37474f}),72);
    const dummy=new THREE.Object3D();let pel=0;
    ubicaciones.forEach(([x,z],i)=>{const alto=5+(i*7%6);for(const side of [-1,1]){dummy.position.set(x+side*.52,alto*.43,z+1.48);dummy.scale.set(.09,alto*.86,.09);dummy.updateMatrix();escalera.setMatrixAt(pel++,dummy.matrix);}
      for(let r=0;r<6;r++){dummy.position.set(x,.8+r*.7,z+1.48);dummy.scale.set(.92,.07,.07);dummy.updateMatrix();escalera.setMatrixAt(pel++,dummy.matrix);}
      const cabina=new THREE.Mesh(new THREE.BoxGeometry(1.4,.85,1.3),new THREE.MeshLambertMaterial({color:0x263238}));cabina.position.set(x,alto+.38,z);g.add(cabina);
      const mastil=new THREE.Mesh(new THREE.CylinderGeometry(.035,.055,2,6),new THREE.MeshLambertMaterial({color:0x90a4ae}));mastil.position.set(x,alto+1.7,z);g.add(mastil);
    });g.add(escalera);
    const balizas=new THREE.InstancedMesh(new THREE.SphereGeometry(.16,6,4),new THREE.MeshLambertMaterial({color:0xff1744,emissive:0xff1744,emissiveIntensity:1.5}),9);
    ubicaciones.forEach(([x,z],i)=>{const alto=5+(i*7%6);dummy.position.set(x,alto+2.75,z);dummy.scale.setScalar(1);dummy.updateMatrix();balizas.setMatrixAt(i,dummy.matrix);});g.add(balizas);
    const rotulos=[];
    for(let i=0;i<15;i++){
      const x=(i%5-2)*5,z=(Math.floor(i/5)-1)*5-3;
      const metalBase=new THREE.MeshLambertMaterial({color:0x263238});
      const peana=new THREE.Mesh(new THREE.CylinderGeometry(.72,.86,.22,8),metalBase);peana.position.set(x,.11,z);g.add(peana);
      const fuste=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,1.18,8),new THREE.MeshLambertMaterial({color:0x90a4ae}));fuste.position.set(x,.78,z);g.add(fuste);
      const aroBase=new THREE.Mesh(new THREE.TorusGeometry(.32,.065,6,16),new THREE.MeshLambertMaterial({color:0x00e5ff,emissive:0x00e5ff,emissiveIntensity:1.4}));aroBase.rotation.x=Math.PI/2;aroBase.position.set(x,1.44,z);g.add(aroBase);
      const caja=new THREE.Mesh(new THREE.BoxGeometry(1.5,2,.42),new THREE.MeshLambertMaterial({color:0x32274b,emissive:0x271249,emissiveIntensity:.5}));
      caja.position.set(x,2,z);g.add(caja);
      const marco=new THREE.Group(), material=new THREE.MeshLambertMaterial({color:0x00e5ff,emissive:0x00e5ff,emissiveIntensity:1});
      for(const [a,b] of [[[-.82,-1.07,.24],[.82,-1.07,.24]],[[-.82,1.07,.24],[.82,1.07,.24]],[[-.82,-1.07,.24],[-.82,1.07,.24]],[[.82,-1.07,.24],[.82,1.07,.24]]])barra(marco,[x+a[0],2+a[1],z+a[2]],[x+b[0],2+b[1],z+b[2]],.035,material);
      g.add(marco);rotulos.push({m:caja,marco,material,visual:null});
    }
    new GLTFLoader().load('modelos/neon_decorados_r8.glb',({scene})=>{
      const nombres=['cat','taco','bolt'];
      rotulos.forEach((item,i)=>{item.m.visible=false;item.marco.visible=false;const original=scene.getObjectByName(nombres[i%3]);if(!original)return;const visual=original.clone(true);visual.position.set(item.m.position.x,1,item.m.position.z);visual.traverse(o=>{if(o.isMesh&&o.material)o.material=o.material.clone();});g.add(visual);item.visual=visual;});
    },undefined,e=>console.error('No se pudieron cargar los rótulos neón',e));
    return{rotulos,encendidos:new Set(),balizas,reloj:0};
  },
  actualizar(s,dt,ctx){
    s.reloj+=dt;
    s.balizas.material.emissiveIntensity=.7+1.3*(.5+.5*Math.sin(s.reloj*4));
    s.rotulos.forEach(({m,marco,material,visual},i)=>{
      if(!s.encendidos.has(i)){material.emissiveIntensity=.65+Math.sin(s.reloj*3+i)*.35;if(visual)visual.traverse(o=>{if(o.isMesh&&o.material.emissive)o.material.emissiveIntensity=.8+Math.sin(s.reloj*3+i)*.35;});}
      if(ctx.zarpazo(m.position,1.7)||ctx.cerca(m.position,1.3)){
        const n=s.encendidos.size;
        if(objetivoNeon(s,i).encendidos.size>n){const color=[0xff48cc,0x4deeff,0xffdc4d][n%3];m.material.color.setHex(color);m.material.emissive.setHex(color);material.color.setHex(color);material.emissive.setHex(color);material.emissiveIntensity=1.6;if(visual)visual.traverse(o=>{if(o.isMesh&&o.material.emissive){o.material.emissive.setHex(color);o.material.emissiveIntensity=1.7;}});ctx.avisar(s.encendidos.size===15?'¡Ciudad iluminada! Estela neón al volver':'¡Rótulo encendido!');}
      }
    });
    if(s.encendidos.size===15&&!s.premiado){s.premiado=true;this.premio(ctx);}
  },
  premio(ctx){ctx.estelaNeon();},
  objetivo:{texto:'Prende 15 rótulos',meta:15},
};
