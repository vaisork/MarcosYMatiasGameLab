import * as THREE from 'three';
import churus from './churus.js';
import vaisgard from './vaisgard.js';
import taqueria from './taqueria.js';
import neon from './neon.js';
import luke from './luke.js';
import busqueda from './busqueda.js';
export const MUNDOS = Object.freeze(Object.fromEntries([churus, vaisgard, taqueria, neon, luke, busqueda].map(m => [m.id, m])));
const caja = (x,y,z,sx,sy,sz) => ({min:{x:x-sx/2,y:y-sy/2,z:z-sz/2},max:{x:x+sx/2,y:y+sy/2,z:z+sz/2}});
export function crearMundos(scene) {
  const mundos={};
  for(const def of Object.values(MUNDOS)){const grupo=new THREE.Group();grupo.visible=false;const util={
    plataforma(x,y,z,sx,sy,sz,color){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),new THREE.MeshLambertMaterial({color}));m.position.set(x,y,z);grupo.add(m);(m.userData.cajas ||= []).push(caja(x,y,z,sx,sy,sz));return m;},
    churu(x,y,z){const m=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.34,3,7),new THREE.MeshBasicMaterial({color:0xffdc70}));m.position.set(x,y,z);grupo.add(m);return {m,base:y,fase:x+z};},
    enemigo(x,y,z,grupoEnemigo){grupoEnemigo.position.set(x,y,z);grupo.add(grupoEnemigo);return {grupo:grupoEnemigo,vivo:true,fase:x};},
    aroSalida(){const aro=new THREE.Mesh(new THREE.TorusGeometry(1.35,.18,7,18),new THREE.MeshBasicMaterial({color:0x79f2e1}));aro.position.set(0,1.6,4);aro.rotation.y=Math.PI;grupo.add(aro);return aro;},
  };const state=def.crear(grupo,util);const salida=util.aroSalida();scene.add(grupo);mundos[def.id]={...def,grupo,state,cajas:grupo.children.flatMap(o=>o.userData.cajas||[]),salida,anclas:grupo};}
  return mundos;
}
