import * as THREE from 'three';
import { crearVuelo, actualizarVuelo, resolverChoque, guardarCheckpoint, registrarRozon, deltaSegundos, debeChocar, mapearPC, mapearCelular, mapearQuest, mapearGamepadXR, multiplicadorAltura } from '../fisica.mjs';

const ANCHO = 512, ALTO = 768, MUNDO_X = 19456, MUNDO_Z = 29184, EXAGERA = 1.2;
const $ = (id) => document.getElementById(id);
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.2)); renderer.setSize(innerWidth, innerHeight);
renderer.xr.enabled = true; renderer.shadowMap.enabled = false; renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x9bc6c4); scene.fog = new THREE.Fog(0x9bc6c4, 9000, 23000);
const camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, .1, 28000);
const rig = new THREE.Group(); rig.add(camera); scene.add(rig);
camera.position.set(0, 2.8, 10); camera.lookAt(0, 0, -90);
const estelas = new Float32Array(32 * 6), particulas = Array.from({ length: 32 }, () => ({ x: (Math.random() - .5) * 42, y: (Math.random() - .5) * 25, z: -4 - Math.random() * 76, largo: .18 + Math.random() * .7 }));
const estelasGeo = new THREE.BufferGeometry(); estelasGeo.setAttribute('position', new THREE.BufferAttribute(estelas, 3));
const estelasMesh = new THREE.LineSegments(estelasGeo, new THREE.LineBasicMaterial({ color: 0xe4fff4, transparent: true, opacity: 0, depthTest: false })); estelasMesh.frustumCulled = false; camera.add(estelasMesh);
scene.add(new THREE.HemisphereLight(0xd5f1ec, 0x67483b, 1.45));
const sol = new THREE.DirectionalLight(0xffe0ae, 3.2); sol.position.set(-4500, 7000, -3000); scene.add(sol);
const loader = new THREE.TextureLoader();
let terrain = null, agua = null, anchors = [], rings = [], waterY = 0, routeSamples = [], activeCourse = 'biokovo';
let state = null, running = false, mode = '', elapsed = 0, nextRing = 0, messageUntil = 0, previousFrameTime = null;
const keys = new Set(), input = { pitch: 0, roll: 0 }, latestPointer = { dx: 0, dy: 0 };
let xrHands = [], phoneNeutralBeta = 0, phoneNeutralGamma = 0, lastDeviceOrientation = null;
const [HEIGHTS, BIO14, BIO12, bioMeta] = await Promise.all([
  fetch('assets/terreno-u16.bin').then((r) => r.arrayBuffer()).then((b) => new Uint16Array(b)),
  fetch('assets/biokovo-z14-u16.bin').then((r) => r.arrayBuffer()).then((b) => new Uint16Array(b)),
  fetch('assets/biokovo-z12-u16.bin').then((r) => r.arrayBuffer()).then((b) => new Uint16Array(b)),
  fetch('assets/biokovo.json').then((r) => r.json()),
]);
const pointMap = (u, v) => ({ x: (u - .5) * MUNDO_X, z: (v - .5) * MUNDO_Z });
function altura(x, z) {
  if (activeCourse === 'biokovo') {
    const tileM = 40075016.686 * Math.cos(bioMeta.launch.lat * Math.PI / 180) / 2 ** 14;
    const px = Math.round((x / tileM + bioMeta.launch.tileX14 - bioMeta.detail.x) * 1024 / bioMeta.detail.tilesX);
    const py = Math.round((z / tileM + bioMeta.launch.tileY14 - bioMeta.detail.y) * 1280 / bioMeta.detail.tilesY);
    return BIO14[Math.max(0, Math.min(1279, py)) * 1024 + Math.max(0, Math.min(1023, px))];
  }
  const px = Math.max(0, Math.min(ANCHO - 1, Math.round((x / MUNDO_X + .5) * (ANCHO - 1))));
  const py = Math.max(0, Math.min(ALTO - 1, Math.round((z / MUNDO_Z + .5) * (ALTO - 1))));
  return HEIGHTS[py * ANCHO + px] * EXAGERA;
}
function rutaBarranca() {
  const mapa = [[.84,.05],[.79,.10],[.76,.15],[.71,.20],[.67,.25],[.60,.35],[.57,.40],[.53,.45],[.51,.50],[.50,.60],[.44,.65],[.43,.70],[.40,.75],[.37,.80],[.29,.85],[.32,.90],[.38,.95]];
  return mapa.map(([u,v], i) => {
    const p = pointMap(u,v); p.y = altura(p.x,p.z) + (i === 0 ? 240 : 70);
    const n = mapa[Math.min(mapa.length-1,i+1)], q = pointMap(n[0],n[1]);
    p.yaw = Math.atan2(-(q.x-p.x), -(q.z-p.z)); return p;
  });
}
function rutaBiokovo() {
  const locs = [[43.3425,17.0569],[43.335,17.048],[43.326,17.047],[43.319,17.033],[43.312,17.03],[43.304,17.035],[43.297,17.026],[43.29,17.02]];
  const n = 2 ** 14, launch = bioMeta.launch, tileM = 40075016.686 * Math.cos(launch.lat * Math.PI / 180) / n;
  return locs.map(([lat, lon], i) => {
    const tx = (lon + 180) / 360 * n;
    const ty = (1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * n;
    const p = { x: (tx - launch.tileX14) * tileM, z: (ty - launch.tileY14) * tileM };
    p.y = i === 0 ? Math.max(1760, altura(p.x, p.z)) + 100 : Math.max(altura(p.x, p.z), 4) + (i === locs.length - 1 ? 16 : 90);
    const next = locs[Math.min(locs.length - 1, i + 1)], nx = (next[1] + 180) / 360 * n, ny = (1 - Math.asinh(Math.tan(next[0] * Math.PI / 180)) / Math.PI) / 2 * n;
    p.yaw = Math.atan2(-(nx - tx), -(ny - ty)); return p;
  });
}
function crearMalla(heights, cols, rows, width, depth, offsetX, offsetZ, sourceW, sourceH, sourceOffsetX = 0, sourceOffsetY = 0, hole = null) {
  const geo = new THREE.BufferGeometry(), vertices = [], colors = [], indices = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const sx = Math.round(x * (sourceW - 1) / (cols - 1)) + sourceOffsetX, sy = Math.round(y * (sourceH - 1) / (rows - 1)) + sourceOffsetY;
    const h = heights[sy * sourceW + sx];
    vertices.push(offsetX + x * width / (cols - 1), h, offsetZ + y * depth / (rows - 1));
    const color = h <= 8 ? [0.04, 0.52, 0.62] : h < 760 ? [0.20, 0.39, 0.33] : h > 1500 ? [0.40, 0.43, 0.38] : [0.49, 0.48, 0.41];
    colors.push(...color);
    if (x < cols - 1 && y < rows - 1) {
      const hx=(x+.5)*(sourceW-1)/(cols-1),hy=(y+.5)*(sourceH-1)/(rows-1),inside=hole&&hx>hole.x0&&hx<hole.x1&&hy>hole.y0&&hy<hole.y1;
      if(!inside){const a = y * cols + x, b = a + 1, c = a + cols, d = c + 1; indices.push(a, c, b, b, c, d);}
    }
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geo.setIndex(indices); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true })); mesh.frustumCulled = false; return mesh;
}
function agregarTerreno() {
  const biokovoFar = new THREE.Group(), bioTileM = 40075016.686 * Math.cos(bioMeta.launch.lat * Math.PI / 180) / 2 ** 12;
  const far = bioMeta.far, farScaleX = far.tilesX * bioTileM, farScaleZ = far.tilesY * bioTileM;
  const hole={x0:(bioMeta.detail.x/4-far.x)/far.tilesX*far.width,x1:((bioMeta.detail.x+bioMeta.detail.tilesX*4)/4-far.x)/far.tilesX*far.width,y0:(bioMeta.detail.y/4-far.y)/far.tilesY*far.height,y1:((bioMeta.detail.y+bioMeta.detail.tilesY*4)/4-far.y)/far.tilesY*far.height};
  biokovoFar.add(crearMalla(BIO12, 100, 68, farScaleX, farScaleZ, (far.x - bioMeta.launch.tileX14 / 4) * bioTileM, (far.y - bioMeta.launch.tileY14 / 4) * bioTileM, far.width, far.height,0,0,hole)); scene.add(biokovoFar);
  const d = bioMeta.detail, detailM = bioTileM / 4, detailW = d.tilesX * bioTileM / 4, detailZ = d.tilesY * bioTileM / 4;
  terrain = crearMalla(BIO14, 230, 270, detailW, detailZ, (d.x - bioMeta.launch.tileX14) * detailM, (d.y - bioMeta.launch.tileY14) * detailM, d.width, d.height); scene.add(terrain);
  terrain.userData.course = 'biokovo'; biokovoFar.userData.course = 'biokovo';
  const cols = 256, rows = 384, geo = new THREE.BufferGeometry(), vertices = [], uvs = [], indices = [];
  for (let y=0; y<rows; y++) for (let x=0; x<cols; x++) {
    const sx = Math.round(x*(ANCHO-1)/(cols-1)), sy = Math.round(y*(ALTO-1)/(rows-1));
    vertices.push((sx/(ANCHO-1)-.5)*MUNDO_X, HEIGHTS[sy*ANCHO+sx]*EXAGERA, (sy/(ALTO-1)-.5)*MUNDO_Z);
    uvs.push(x/(cols-1), 1-y/(rows-1));
    if (x<cols-1 && y<rows-1) { const a=y*cols+x,b=a+1,c=a+cols,d=c+1; indices.push(a,c,b,b,c,d); }
  }
  geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); geo.setIndex(indices); geo.computeVertexNormals();
  const map=loader.load('assets/barranca.webp'); map.colorSpace=THREE.SRGBColorSpace; map.anisotropy=2;
  const barranca = new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map})); barranca.frustumCulled=false; barranca.userData.course='barranca'; scene.add(barranca);
  terrain.userData.other = barranca;
}
function crearRuta() {
  const biokovo = activeCourse === 'biokovo';
  anchors = biokovo ? rutaBiokovo() : rutaBarranca();
  const path = new THREE.CatmullRomCurve3(anchors.map((p)=>new THREE.Vector3(p.x,p.y-48,p.z)));
  const camino = path.getPoints(560); routeSamples=path.getPoints(180);
  agua = new THREE.Mesh(new THREE.TubeGeometry(path,560,biokovo?2.5:4,5,false),new THREE.MeshBasicMaterial({color:biokovo?0xf3d28b:0x4ab6b1,transparent:true,opacity:.82})); scene.add(agua); agua.userData.course=activeCourse;agua.userData.route=true;
  for (let i=0;i<8;i++) {
    const t=.006+i*.11, at=path.getPoint(t), tangent=path.getTangent(t);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(25,2.2,7,32),new THREE.MeshBasicMaterial({color:0xf4d085}));
    ring.position.copy(at).add(new THREE.Vector3(0,24,0)); ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),tangent); ring.userData.point={x:ring.position.x,y:ring.position.y,z:ring.position.z,yaw:Math.atan2(-tangent.x,-tangent.z)}; ring.userData.course=activeCourse;ring.userData.route=true; scene.add(ring); rings.push(ring);
  }
  const end=path.getPoint(1); waterY=biokovo?2:anchors.at(-1).y-70;
  const landing=new THREE.Mesh(new THREE.TorusGeometry(58,3,8,40),new THREE.MeshBasicMaterial({color:0x8ffff0}));
  landing.position.set(end.x,waterY+9,end.z); landing.userData.course=activeCourse;landing.userData.route=true; scene.add(landing);
  path.userData={course:activeCourse}; return path;
}
function segmento(mesh, a, b) {
  const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from);
  mesh.position.copy(from.add(to).multiplyScalar(.5));mesh.scale.y=delta.length();mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
}
function crearMembrana() {
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(12),3));
  geo.setIndex([0,1,2,2,1,3]);
  const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xd77a4b,side:THREE.DoubleSide}));
  const edge=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(24),3)),new THREE.LineBasicMaterial({color:0xe5aa68}));
  return {mesh,edge};
}
function crearParapente() {
  const wings=new THREE.Group(), bodyMat=new THREE.MeshLambertMaterial({color:0x263b40}), clothMat=new THREE.MeshBasicMaterial({color:0xd77a4b,side:THREE.DoubleSide});
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.85,3,6),bodyMat);body.rotation.x=Math.PI/2;body.position.z=-3.6;wings.add(body);
  const neck=new THREE.Mesh(new THREE.SphereGeometry(.2,8,6),new THREE.MeshLambertMaterial({color:0xd9aa70}));neck.position.set(0,.03,-3.05);wings.add(neck);
  const armGeo=new THREE.CylinderGeometry(.075,.12,1,5), legGeo=new THREE.CylinderGeometry(.09,.15,1.2,5);
  for(const side of [-1,1]){
    const arm=new THREE.Mesh(armGeo,new THREE.MeshLambertMaterial({color:0x293b3a}));segmento(arm,[side*.35,.22,-3.25],[side*2.05,.5,-3.45]);wings.add(arm);
    const leg=new THREE.Mesh(legGeo,bodyMat);segmento(leg,[side*.2,-.08,-3.9],[side*.42,-.45,-4.8]);wings.add(leg);
    const points=[[side*.45,.2,-3.25],[side*2.05,.5,-3.45],[side*.25,-.05,-3.9],[side*.42,-.45,-4.8]],panel=new THREE.BufferGeometry();panel.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));panel.setIndex([0,1,2,2,1,3]);panel.computeVertexNormals();wings.add(new THREE.Mesh(panel,clothMat));
    const outlinePoints=[points[0],points[1],points[1],points[3],points[3],points[2],points[2],points[0]].flat();
    const outline=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(outlinePoints,3)),new THREE.LineBasicMaterial({color:0xe5aa68}));wings.add(outline);
  }
  const inner=new THREE.BufferGeometry();inner.setAttribute('position',new THREE.Float32BufferAttribute([-.18,-.08,-3.9,.18,-.08,-3.9,-.42,-.45,-4.8,.42,-.45,-4.8],3));inner.setIndex([0,1,2,1,3,2]);inner.computeVertexNormals();wings.add(new THREE.Mesh(inner,clothMat));
  rig.add(wings); return wings;
}
function crearAlasQuest() {
  const wings=new THREE.Group(), sleeves=[],panels=[];
  const sleeveMat=new THREE.MeshLambertMaterial({color:0x293b3a}), sleeveGeo=new THREE.CylinderGeometry(.075,.13,1,6);
  for(let i=0;i<2;i++){
    const panel=crearMembrana();panels.push(panel);wings.add(panel.mesh,panel.edge);
    const sleeve=new THREE.Mesh(sleeveGeo,sleeveMat);wings.add(sleeve);sleeves.push(sleeve);
  }
  const inner=crearMembrana();wings.add(inner.mesh,inner.edge);rig.add(wings);
  return {wings,sleeves,panels,inner};
}
function crearParacaidas() {
  const canopy=new THREE.Group();
  const dome=new THREE.Mesh(new THREE.SphereGeometry(3.4,16,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0xf0a34f,side:THREE.DoubleSide}));
  dome.position.set(0,5,-1);canopy.add(dome);
  const ropes=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3,5,-1),new THREE.Vector3(-.7,.2,-2),new THREE.Vector3(3,5,-1),new THREE.Vector3(.7,.2,-2),new THREE.Vector3(0,6,-1),new THREE.Vector3(0,.2,-2)]);
  canopy.add(new THREE.LineSegments(ropes,new THREE.LineBasicMaterial({color:0xf8e9cc})));
  canopy.visible=false;rig.add(canopy);return canopy;
}
function instanciarBosque(course, points, maxHeight, count = 2100) {
  let seed=53119; const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.22,.38,3.2,5),new THREE.MeshLambertMaterial({color:0x76563b}),count);
  const crown=new THREE.InstancedMesh(new THREE.ConeGeometry(2.2,7,5),new THREE.MeshLambertMaterial({color:0x31553d}),count);
  const rockMap=loader.load('assets/aerial_rocks_02_diff_1k.webp');rockMap.colorSpace=THREE.SRGBColorSpace;
  const rocks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1.6,0),new THREE.MeshLambertMaterial({map:rockMap,color:0xb2a58b}),320),dummy=new THREE.Object3D(); let n=0,rn=0;
  for(let i=0;i<count*5&&n<count;i++){
    const i=Math.floor(rand()*(points.length-1)),p=points[i],q=points[i+1],t=rand(),side=(rand()-.5)*300,dx=q.x-p.x,dz=q.z-p.z,len=Math.hypot(dx,dz)||1;
    const x=p.x+dx*t+dz/len*side,z=p.z+dz*t-dx/len*side,y=altura(x,z);
    if(y<18||y>maxHeight)continue;const h=4+rand()*5;
    dummy.position.set(x,y+h/2,z);dummy.rotation.y=rand()*6.28;dummy.scale.setScalar(.75+rand()*.7);dummy.updateMatrix();trunk.setMatrixAt(n,dummy.matrix);
    dummy.position.y=y+h+2;dummy.scale.setScalar(.8+rand()*.65);dummy.updateMatrix();crown.setMatrixAt(n,dummy.matrix);n++;
    if(n%8===0&&rn<320){dummy.position.set(x,y+1,z);dummy.rotation.set(rand(),rand()*6,rand());dummy.scale.setScalar(.6+rand()*1.4);dummy.updateMatrix();rocks.setMatrixAt(rn++,dummy.matrix);}
  }
  trunk.count=crown.count=n;rocks.count=rn;trunk.userData.course=crown.userData.course=rocks.userData.course=course;scene.add(trunk,crown,rocks);
  if(course==='biokovo'){
    const walls=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0x867b68}),180),wd=new THREE.Object3D();let wn=0;
    for(let i=Math.floor(points.length*.48);i<points.length-1&&wn<180;i+=2){const p=points[i],q=points[i+1],dx=q.x-p.x,dz=q.z-p.z,len=Math.hypot(dx,dz)||1,x=p.x+dz/len*24,z=p.z-dx/len*24,y=altura(x,z);if(y<10||y>1100)continue;wd.position.set(x,y+.8,z);wd.scale.set(5,1.6,1.2);wd.rotation.y=Math.atan2(-dx,-dz);wd.updateMatrix();walls.setMatrixAt(wn++,wd.matrix);}
    walls.count=wn;walls.userData.course=course;scene.add(walls);
  }
}
function agregarMarYMakarska() {
  const pos=[],idx=[],d=bioMeta.detail,cols=96,rows=120,tileM=40075016.686*Math.cos(bioMeta.launch.lat*Math.PI/180)/2**14;
  for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){
    const sx=Math.round(x*1023/cols),sy=Math.round(y*1279/rows),h=BIO14[sy*1024+sx];
    pos.push((d.x-bioMeta.launch.tileX14)*tileM+sx/1024*d.tilesX*tileM,2,(d.y-bioMeta.launch.tileY14)*tileM+sy/1280*d.tilesY*tileM);
    if(x<cols&&y<rows){const a=y*(cols+1)+x,b=a+1,c=a+cols+1,e=c+1,sx2=Math.round((x+1)*1023/cols),sy2=Math.round((y+1)*1279/rows);if(h<8&&BIO14[sy*1024+sx2]<8&&BIO14[sy2*1024+sx]<8&&BIO14[sy2*1024+sx2]<8)idx.push(a,c,b,b,c,e);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const sea=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x18c5cd}));sea.userData.course='biokovo';scene.add(sea);
  const lat=43.296,lon=17.021,n=2**14,tx=(lon+180)/360*n,ty=(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*n,cx=(tx-bioMeta.launch.tileX14)*tileM,cz=(ty-bioMeta.launch.tileY14)*tileM;
  const count=260,houses=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xeee7d5}),count),roofs=new THREE.InstancedMesh(new THREE.ConeGeometry(.72,.48,4),new THREE.MeshLambertMaterial({color:0xc86e43}),count),dummy=new THREE.Object3D();
  for(let i=0;i<count;i++){const a=i*2.39996,r=80+Math.sqrt(i/count)*650,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,y=Math.max(2,altura(x,z)),w=8+(i%5)*2,h=6+(i%4)*2;dummy.position.set(x,y+h/2,z);dummy.scale.set(w,h,8+(i%3)*2);dummy.rotation.y=a;dummy.updateMatrix();houses.setMatrixAt(i,dummy.matrix);dummy.position.y=y+h+2;dummy.scale.set(w*1.1,1,8);dummy.updateMatrix();roofs.setMatrixAt(i,dummy.matrix);}
  houses.userData.course=roofs.userData.course='biokovo';scene.add(houses,roofs);
}
function alturaLOD(x,z){
  const d=bioMeta.detail,tileM=40075016.686*Math.cos(bioMeta.launch.lat*Math.PI/180)/2**14,x0=(d.x-bioMeta.launch.tileX14)*tileM,z0=(d.y-bioMeta.launch.tileY14)*tileM,worldW=d.tilesX*tileM,worldH=d.tilesY*tileM;
  const gx=Math.max(0,Math.min(229,(x-x0)/worldW*229)),gy=Math.max(0,Math.min(269,(z-z0)/worldH*269)),x1=Math.floor(gx),y1=Math.floor(gy),x2=Math.min(229,x1+1),y2=Math.min(269,y1+1),fx=gx-x1,fy=gy-y1,p=terrain.geometry.attributes.position.array;
  const a=p[(y1*230+x1)*3+1],b=p[(y1*230+x2)*3+1],c=p[(y2*230+x1)*3+1],d0=p[(y2*230+x2)*3+1];return (a*(1-fx)+b*fx)*(1-fy)+(c*(1-fx)+d0*fx)*fy;
}
function agregarCorredor(curve,course){
  const segments=800,sides=55,width=500,positions=[],colors=[],indices=[];
  for(let i=0;i<=segments;i++){
    const t=i/segments,p=curve.getPointAt(t),tan=curve.getTangentAt(t),nx=-tan.z,nz=tan.x;
    for(let j=0;j<sides;j++){
      const side=(j/(sides-1)-.5)*width,x=p.x+nx*side,z=p.z+nz*side,raw=altura(x,z),base=alturaLOD(x,z),blend=Math.max(0,Math.min(1,(250-Math.abs(side))/100)),smooth=blend*blend*(3-2*blend),y=base+(raw-base)*smooth+.18;
      positions.push(x,y,z);const c=raw<=8?[.04,.52,.62]:y<760?[.20,.39,.33]:y>1500?[.40,.43,.38]:[.49,.48,.41];colors.push(...c);
      if(i<segments&&j<sides-1){const a=i*sides+j,b=a+1,c0=a+sides,d=c0+1;indices.push(a,b,c0,b,d,c0);}
    }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();const mesh=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));mesh.userData.course=course;scene.add(mesh);
}
function perforarTerreno(curve){
  const geo=terrain.geometry,pos=geo.attributes.position.array,cols=230,rows=270,idx=[];
  const samples=Array.from({length:81},(_,i)=>curve.getPointAt(i/80));
  const lines=samples.slice(0,-1).map((p,i)=>{const q=samples[i+1],dx=q.x-p.x,dz=q.z-p.z;return [p.x,p.z,dx,dz,dx*dx+dz*dz];});
  for(let y=0;y<rows-1;y++)for(let x=0;x<cols-1;x++){
    const a=y*cols+x,b=a+1,c=a+cols,d=c+1,cx=(pos[a*3]+pos[d*3])/2,cz=(pos[a*3+2]+pos[d*3+2])/2;
    let near=false;for(const [sx,sz,dx,dz,len] of lines){const t=Math.max(0,Math.min(1,((cx-sx)*dx+(cz-sz)*dz)/len)),ddx=cx-sx-dx*t,ddz=cz-sz-dz*t;if(ddx*ddx+ddz*ddz<220*220){near=true;break;}}
    if(!near)idx.push(a,c,b,b,c,d);
  }
  geo.setIndex(idx);geo.computeVertexNormals();
}
agregarTerreno();agregarMarYMakarska();
let path,start,checkpointAire;const bosquesListos=new Set(),corredoresListos=new Set();
const avatar=crearParapente(); const questWings=crearAlasQuest(); const chute=crearParacaidas();
function cambiarBajada(course){
  activeCourse=course;scene.children.filter((o)=>o.userData?.route).forEach((o)=>scene.remove(o));scene.children.forEach((o)=>{if(o.userData?.course)o.visible=o.userData.course===course;if(o.userData?.other)o.userData.other.visible=course==='barranca';});
  rings=[];routeSamples=[];anchors=[];path=crearRuta();start=anchors[0];checkpointAire=routeSamples[Math.floor(routeSamples.length*.035)];checkpointAire.y+=115;checkpointAire.yaw=anchors[0].yaw;
  if(course==='biokovo')perforarTerreno(path);
  if(course==='biokovo'&&!corredoresListos.has(course)){agregarCorredor(path,course);corredoresListos.add(course);}
  if(!bosquesListos.has(course)){instanciarBosque(course,routeSamples,course==='biokovo'?1600:1800,2100);bosquesListos.add(course);}
}
cambiarBajada('biokovo');
loader.load('assets/cielo.webp',(sky)=>{sky.mapping=THREE.EquirectangularReflectionMapping;sky.colorSpace=THREE.SRGBColorSpace;scene.background=sky;});

function sonido() {
  const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
  const ctx=new Ctx(), n=ctx.sampleRate*2, buffer=ctx.createBuffer(1,n,ctx.sampleRate), data=buffer.getChannelData(0);
  for(let i=0;i<n;i++)data[i]=Math.random()*2-1;
  const source=ctx.createBufferSource(), filter=ctx.createBiquadFilter(), gain=ctx.createGain();
  source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=650;gain.gain.value=0;source.connect(filter).connect(gain).connect(ctx.destination);source.start();
  return (speed,pitch=0,clearance=100)=>{filter.frequency.setTargetAtTime(300+speed*82+Math.max(0,25-clearance)*35,ctx.currentTime,.08);gain.gain.setTargetAtTime(.012+speed/60*.055+Math.max(0,-pitch)*.04+Math.max(0,25-clearance)/25*.035,ctx.currentTime,.12);};
}
let viento=()=>{};
function aviso(text,seconds=1.5){$('mensaje').textContent=text;$('mensaje').style.opacity='1';messageUntil=elapsed+seconds;}
function actualizarEntrada() {
  input.yaw=0;
  if(mode==='pc'){
    Object.assign(input,mapearPC({teclas:keys,mouseX:latestPointer.dx,mouseY:latestPointer.dy}));
  } else if(mode==='celular'){
    Object.assign(input,mapearCelular(lastDeviceOrientation?.beta??phoneNeutralBeta,lastDeviceOrientation?.gamma??phoneNeutralGamma,phoneNeutralBeta,phoneNeutralGamma));
  } else {
    const session=renderer.xr.getSession(),sources=session?.inputSources||[];
    const stick=mapearGamepadXR(sources);
    if(Math.abs(stick.pitch)+Math.abs(stick.roll)>.12)Object.assign(input,stick);
    else if(xrHands.length>=2&&xrHands.every((hand)=>hand.visible)){
      const xrCamera=renderer.xr.getCamera(camera);
      const hand=(controller)=>xrCamera.worldToLocal(controller.getWorldPosition(new THREE.Vector3()));
      const left=hand(xrHands[0]),right=hand(xrHands[1]);
      Object.assign(input,mapearQuest(left,right,camera.rotation.y));
    } else Object.assign(input,stick);
    input.yaw=Math.max(-1,Math.min(1,camera.rotation.y/.7));
  }
}
function avanzarEstelas(dt,speed){
  estelasMesh.material.opacity=Math.max(0,Math.min(.75,(speed-34)/55));
  particulas.forEach((p,i)=>{p.z+=speed*dt;if(p.z>-2){p.z=-80;p.x=(Math.random()-.5)*42;p.y=(Math.random()-.5)*25;}
    estelas.set([p.x,p.y,p.z,p.x,p.y,p.z-p.largo],i*6);});
  estelasGeo.attributes.position.needsUpdate=true;
}
function startWorld() {
  running=true; elapsed=0; nextRing=0; previousFrameTime=null; state=crearVuelo(start);state.vy=13;state.checkpoint={...checkpointAire};camera.position.set(0,mode==='quest'?0:1.5,mode==='quest'?0:3.8); $('inicio').hidden=true; $('final').hidden=true;document.body.classList.add('jugando');
  if(mode==='celular')document.body.classList.add('tactil');
  $('progreso').textContent='Mirador · aro 0/8'; ventoSound(); aviso(mode==='quest'?'Manos abajo y al frente para bajar · arriba para frenar':mode==='celular'?'Inclina el teléfono hacia adelante para bajar':'S/↓ baja · W/↑ sube · mouse abajo baja',3.2);
}
let ventoSound=()=>{};
async function startPhone(){mode='celular';
  try{if(typeof DeviceOrientationEvent!=='undefined'&&DeviceOrientationEvent.requestPermission)await DeviceOrientationEvent.requestPermission();}catch{}
  if(!lastDeviceOrientation)await new Promise((resolve)=>{const timeout=setTimeout(done,500);function done(){clearTimeout(timeout);removeEventListener('deviceorientation',capture);resolve();}function capture(){done();}addEventListener('deviceorientation',capture,{once:true});});
  phoneNeutralBeta=lastDeviceOrientation?.beta??0;phoneNeutralGamma=lastDeviceOrientation?.gamma??0;
  startWorld();
}
$('celular').addEventListener('click',startPhone);
$('pc').addEventListener('click',()=>{mode='pc';startWorld();});
document.querySelectorAll('[data-bajada]').forEach((button)=>button.addEventListener('click',()=>{
  cambiarBajada(button.dataset.bajada);$('bajada-label').textContent=button.dataset.bajada==='biokovo'?'Biokovo · Croacia':'Barranca del Cobre · Chihuahua, México';
  document.querySelectorAll('[data-bajada]').forEach((b)=>b.setAttribute('aria-pressed',String(b===button)));
}));
$('quest').disabled=true;
if(!navigator.xr)$('estado').textContent='Quest 3: abre esta página en el navegador del visor.';
else navigator.xr.isSessionSupported('immersive-vr').then((ok)=>{$('quest').disabled=!ok;if(!ok)$('estado').textContent='Este navegador no ofrece WebXR. Usa celular o computadora.';}).catch(()=>{$('estado').textContent='WebXR no está disponible. Usa celular o computadora.';});
$('quest').addEventListener('click',async()=>{
  if(!navigator.xr)return;
  try{const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']});renderer.xr.setReferenceSpaceType('local-floor');await renderer.xr.setSession(session);mode='quest';camera.position.set(0,0,0);camera.rotation.set(0,0,0);xrHands=[renderer.xr.getController(0),renderer.xr.getController(1)];xrHands.forEach((h,i)=>{rig.add(h);h.add(new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),new THREE.MeshBasicMaterial({color:i?0xf4be6b:0x65c9c1})));h.addEventListener('selectstart',()=>{if(running){state.vy=Math.max(state.vy,13);aviso('¡Impulso!',1);}});});startWorld();session.addEventListener('end',()=>{running=false;document.body.classList.remove('jugando');$('inicio').hidden=false;camera.position.set(0,2.8,18);camera.rotation.set(0,0,0);});}
  catch(e){$('estado').textContent=`No se pudo iniciar Quest: ${e.message}`;}
});
$('boton-saltar').addEventListener('pointerdown',(e)=>{e.preventDefault();if(running&&mode==='celular')state.vy=Math.max(state.vy,6);});
$('reiniciar').addEventListener('click',()=>{$('final').hidden=true;$('inicio').hidden=false;document.body.classList.remove('jugando','tactil');});
addEventListener('keydown',(e)=>{keys.add(e.key);if([' ','ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();if(e.key===' '&&!running&&mode==='pc')startWorld();});
addEventListener('keyup',(e)=>keys.delete(e.key));
renderer.domElement.addEventListener('pointermove',(e)=>{latestPointer.dx=Math.max(-1,Math.min(1,(e.clientX/innerWidth-.5)*2));latestPointer.dy=Math.max(-1,Math.min(1,(e.clientY/innerHeight-.5)*2));});
addEventListener('deviceorientation',(e)=>{lastDeviceOrientation={beta:e.beta,gamma:e.gamma};},{passive:true});
function tramo(v){let closest=0,min=Infinity;for(let i=0;i<routeSamples.length;i++){const p=routeSamples[i],d=(p.x-v.x)**2+(p.z-v.z)**2;if(d<min){min=d;closest=i;}}return {i:closest,dist:Math.sqrt(min),progress:closest/(routeSamples.length-1)};}
function actualizarPanel(panel,points){
  const pos=panel.mesh.geometry.attributes.position,verts=points.flat();
  pos.array.set(verts);pos.needsUpdate=true;panel.mesh.geometry.computeVertexNormals();panel.mesh.geometry.computeBoundingSphere();
  const edges=panel.edge.geometry.attributes.position.array;
  const pairs=panel.mesh.geometry.index.count===3?[[0,1],[1,2],[2,0]]:[[0,1],[1,3],[3,2],[2,0]];
  pairs.forEach(([a,b],i)=>{edges.set(points[a],i*6);edges.set(points[b],i*6+3);});panel.edge.geometry.attributes.position.needsUpdate=true;panel.edge.geometry.computeBoundingSphere();
}
function finish(){running=false;state.terminado=true;document.body.classList.remove('jugando','rapido','pegado');$('final').querySelector('.marca').textContent=activeCourse==='biokovo'?'Aterrizaje en la playa':'Aterrizaje en el río';$('final').hidden=false;$('resultado').innerHTML=`${state.score.toLocaleString('es-MX')} puntos<br>${Math.floor(state.tiempo/60)}:${String(Math.floor(state.tiempo%60)).padStart(2,'0')} de vuelo<br>${state.choques} choques · ${state.aros}/8 aros`;
}
function paso(now){
  const stamp=Number.isFinite(now)?now:performance.now();
  const dt=previousFrameTime===null?1/72:deltaSegundos(stamp,previousFrameTime);previousFrameTime=stamp;
  if(running){elapsed+=dt;actualizarEntrada();
    if(mode==='quest'&&!state.impulsoQuest){const [left,right]=xrHands.map((h)=>h.position);if(left&&right&&Math.abs(left.x-right.x)>1.15){state.vy=Math.max(state.vy,13);state.impulsoQuest=true;aviso('¡Impulso! Pliega las alas para dirigir',1.4);}}
    actualizarVuelo(state,input,dt);
    const seg=tramo(state);const ground=altura(state.x,state.z);
    if(!state.paracaidas&&debeChocar(state,ground,5)){resolverChoque(state,ground+5);aviso('¡Terreno! Regresas al último aro',1.8);}
    const cercaDelSuelo=multiplicadorAltura(state.y-ground);
    state.score+=Math.round(dt*state.velocidad*.12*cercaDelSuelo);
    if(!state.paracaidas&&registrarRozon(state,Math.abs(470-seg.dist),96))aviso('¡Rozón! +100',1.2);
    if(Math.abs(470-seg.dist)>135)state.rozon=false;
    if(nextRing<rings.length&&state.x**2+state.z**2>=-1){const r=rings[nextRing],d=Math.hypot(state.x-r.position.x,state.y-r.position.y,state.z-r.position.z);if(d<95){guardarCheckpoint(state,r.userData.point);nextRing++;aviso('¡Aro! +250',1.5);}}
    const progress=seg.progress;
    if(progress>.86&&!state.paracaidas){state.paracaidas=true;state.velocidad=Math.min(state.velocidad,24);aviso('¡Paracaídas! Dirígete al río',2.5);}
    if(state.paracaidas){const end=anchors.at(-1);state.velocidad=Math.max(15,state.velocidad-9*dt);const target=waterY+8;state.y+=Math.max(-8,Math.min(0,(target-state.y)*.32))*dt*4;if(progress>.97&&Math.hypot(state.x-end.x,state.z-end.z)<100&&Math.abs(state.y-target)<18)finish();}
    rig.position.set(state.x,state.y,state.z);rig.rotation.set(0,state.yaw,0);avatar.visible=mode!=='quest'&&!state.paracaidas;questWings.wings.visible=mode==='quest'&&!state.paracaidas;chute.visible=state.paracaidas;avatar.rotation.z=state.roll*.3;avatar.rotation.x=-state.pitch*.12;
    if(mode==='quest'){
      const [left,right]=xrHands.map((h)=>h.position),head=camera.position,hip=[0,head.y-1.05,head.z],leftLeg=[-.22,head.y-1.75,head.z-.05],rightLeg=[.22,head.y-1.75,head.z-.05];
      xrHands.forEach((hand,i)=>{const side=i===0?-1:1,h=[hand.position.x,hand.position.y,hand.position.z],shoulder=[side*.2,head.y-.45,head.z],joint=[side*.23,head.y-.95,head.z-.03],ankle=i===0?leftLeg:rightLeg;actualizarPanel(questWings.panels[i],[shoulder,h,joint,ankle]);segmento(questWings.sleeves[i],shoulder,h);});
      actualizarPanel(questWings.inner,[[0,head.y-1.05,head.z],[0,head.y-1.75,head.z-.05],leftLeg,rightLeg]);
    }
    camera.rotation.x=mode==='quest'?0:state.pitch*.16-.44;camera.rotation.z=mode==='quest'?0:-state.roll*.08;
    const sp=Math.round(state.velocidad),clearance=state.y-ground,fov=mode==='quest'?74:74+Math.max(0,state.velocidad-55)*.38;
    if(mode!=='quest'){const shake=Math.max(0,state.velocidad-65)*.00035;camera.position.x=Math.sin(elapsed*43)*shake;camera.position.y=(mode==='pc'?1.5:0)+Math.sin(elapsed*37)*shake;}
    if(Math.abs(camera.fov-fov)>.1){camera.fov=fov;camera.updateProjectionMatrix();}
    $('velocidad').textContent=`${sp} m/s`;$('puntos').textContent=`${state.score.toLocaleString('es-MX')} puntos`;$('progreso').textContent=state.paracaidas?'Paracaídas · a la playa':`${activeCourse==='biokovo'?'Biokovo':'Barranca'} · ${Math.round(progress*100)}% · aro ${nextRing}/8${clearance<25?` · ¡Pegado! x${multiplicadorAltura(clearance).toFixed(1)}`:''}`;
    if(sp>60)document.body.classList.add('rapido');else document.body.classList.remove('rapido');document.body.classList.toggle('pegado',clearance<25);avanzarEstelas(dt,state.velocidad);viento(state.velocidad,state.pitch,clearance);
    if(elapsed>messageUntil)$('mensaje').style.opacity='0';
  }
}
// Un error en la lógica no debe dejar el visor en negro: siempre se dibuja.
let ultimoError='';
function tick(now){
  try{paso(now);}catch(e){const t=String(e?.message||e);if(t!==ultimoError){ultimoError=t;console.error(e);aviso(`Error: ${t}`,6);}}
  renderer.render(scene,camera);
}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.2));renderer.setSize(innerWidth,innerHeight);}
addEventListener('resize',resize);renderer.setAnimationLoop(tick);
// Audio starts only after a player chooses a mode.
ventoSound=()=>{viento=sonido()||(()=>{});};

// Keep the player above the high rim while the mode menu is open.
camera.position.set(0,2.8,18);rig.position.set(start.x,start.y,start.z);rig.rotation.y=start.yaw;
