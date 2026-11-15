import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  crearEstadoGallinas,
  actualizarHuida,
  intentarAtraparTelaraña,
  actualizarLlevarGallina,
  alimentarCorral,
  contarGallinasEnCorral,
} from './gallinas-logica.mjs';

function crearCartelTexto(texto, ancho = 512, alto = 256) {
  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext('2d');
  const textura = new THREE.CanvasTexture(lienzo);
  textura.colorSpace = THREE.SRGBColorSpace;
  return {
    textura,
    dibujar(lineas) {
      ctx.fillStyle = '#2d1808';
      ctx.fillRect(0, 0, ancho, alto);
      ctx.strokeStyle = '#d79b4a';
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, ancho - 10, alto - 10);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffecb3';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(lineas[0] || '', ancho / 2, 60);
      ctx.font = 'bold 44px sans-serif';
      ctx.fillStyle = '#ffd54f';
      ctx.fillText(lineas[1] || '', ancho / 2, 130);
      ctx.font = '30px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(lineas[2] || '', ancho / 2, 200);
      textura.needsUpdate = true;
    },
  };
}

function crearModeloGallina() {
  const grupo = new THREE.Group();
  const matBlanco = new THREE.MeshLambertMaterial({ color: 0xfdfbf4 });
  const matRojo = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
  const matPico = new THREE.MeshLambertMaterial({ color: 0xffa000 });
  const matPatas = new THREE.MeshLambertMaterial({ color: 0xffb300 });
  const matNegro = new THREE.MeshBasicMaterial({ color: 0x111111 });

  // Cuerpo
  const cuerpo = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), matBlanco);
  cuerpo.scale.set(1, 0.9, 1.25);
  cuerpo.position.y = 0.42;
  grupo.add(cuerpo);

  // Alas
  const alaIzq = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.45), matBlanco);
  alaIzq.position.set(-0.38, 0.42, 0);
  grupo.add(alaIzq);

  const alaDer = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.45), matBlanco);
  alaDer.position.set(0.38, 0.42, 0);
  grupo.add(alaDer);

  // Cola
  const cola = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 4), matBlanco);
  cola.position.set(0, 0.6, -0.42);
  cola.rotation.x = -Math.PI / 3;
  grupo.add(cola);

  // Cabeza con cresta y pico
  const cabeza = new THREE.Group();
  cabeza.position.set(0, 0.68, 0.32);
  const cráneo = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), matBlanco);
  cabeza.add(cráneo);

  // Cresta roja
  const cresta = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.26), matRojo);
  cresta.position.set(0, 0.2, 0);
  cabeza.add(cresta);

  // Barbilla roja
  const barbilla = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), matRojo);
  barbilla.position.set(0, -0.14, 0.16);
  cabeza.add(barbilla);

  // Pico amarillo
  const pico = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 5), matPico);
  pico.position.set(0, -0.04, 0.26);
  pico.rotation.x = Math.PI / 2;
  cabeza.add(pico);

  // Ojitos
  for (const lado of [-1, 1]) {
    const ojo = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), matNegro);
    ojo.position.set(lado * 0.15, 0.05, 0.12);
    cabeza.add(ojo);
  }
  grupo.add(cabeza);

  // Patas
  for (const lado of [-1, 1]) {
    const pata = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.24, 6), matPatas);
    pata.position.set(lado * 0.14, 0.12, 0);
    grupo.add(pata);
  }

  // Red de telaraña (invisible por defecto)
  const red = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.65, 2),
    new THREE.MeshBasicMaterial({ color: 0x80deea, wireframe: true, transparent: true, opacity: 0.85 })
  );
  red.position.set(0, 0.45, 0);
  red.visible = false;
  grupo.add(red);

  // Corazones de agradecimiento
  const corazones = new THREE.Group();
  corazones.visible = false;
  for (let i = 0; i < 3; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), matRojo);
    c.position.set((i - 1) * 0.25, 0.95 + (i % 2) * 0.15, 0);
    c.rotation.z = Math.PI / 4;
    corazones.add(c);
  }
  grupo.add(corazones);

  return { grupo, cuerpo, cabeza, alaIzq, alaDer, red, corazones };
}

function texturaMadera(color, sombra) {
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,256,256);let seed=8;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  for(let i=0;i<8;i++){const px=i*32;x.fillStyle=i%2?'rgba(255,220,185,.1)':'rgba(50,15,12,.14)';x.fillRect(px,0,2,256);x.fillStyle='#202326';for(const y of [18,235]){x.beginPath();x.arc(px+8+rnd()*14,y,2.5,0,Math.PI*2);x.fill();}}
  for(let i=0;i<55;i++){x.strokeStyle=sombra+(i%3===0?'88':'44');x.lineWidth=1+rnd()*2;x.beginPath();const px=rnd()*256,py=rnd()*256;x.moveTo(px,py);x.bezierCurveTo(px-4,py+12,px+4,py+22,px,py+38);x.stroke();}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}

export default {
  id: 'gallinas',
  nombre: 'Gallinas Escapistas',
  ambiente: { cielo: 0x87ceeb, suelo: 0x4a7c39, niebla: 0xa4d49c },

  crear(grupo, util) {
    const cieloTextura = new THREE.TextureLoader().load(new URL('../../texturas/mundos/gallinas_cielo_dia_r10.webp', import.meta.url).href);
    cieloTextura.colorSpace = THREE.SRGBColorSpace;
    const cielo = new THREE.Mesh(new THREE.SphereGeometry(220, 32, 20), new THREE.MeshBasicMaterial({ map: cieloTextura, side: THREE.BackSide, fog: false, depthWrite: false }));
    cielo.renderOrder = -2; grupo.add(cielo);
    // Terreno pradera
    util.plataforma(0, -0.25, 0, 44, 0.5, 44, 0x4a7c39);
    const cesped = new THREE.TextureLoader().load(new URL('../../texturas/mundos/polyhaven_leafy_grass.webp', import.meta.url).href);
    cesped.colorSpace = THREE.SRGBColorSpace; cesped.wrapS = cesped.wrapT = THREE.RepeatWrapping; cesped.repeat.set(5, 5);
    const pradera = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), new THREE.MeshLambertMaterial({ color: 0x8fd05a, map: cesped }));
    pradera.rotation.x = -Math.PI / 2; pradera.position.y = .012; grupo.add(pradera);
    new GLTFLoader().load('modelos/gallinas_granero_r8.glb',({scene})=>{const rojo=texturaMadera('#c62828','#7b1717'),madera=texturaMadera('#795548','#3e2723');scene.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material])if(m?.name==='barn red'||m?.name==='warm timber'){m.map=m.name==='barn red'?rojo:madera;m.color.set(0xffffff);m.needsUpdate=true;}});scene.position.set(0,0,-28);grupo.add(scene);},undefined,e=>console.error('No se pudo cargar el granero de Gallinas',e));

    // Corral delimitado: x: [-5.5, 5.5], z: [-14.5, -5.5]
    const corralBounds = { minX: -5.5, maxX: 5.5, minZ: -14.5, maxZ: -5.5 };
    // Suelo de paja del corral
    util.plataforma(0, 0.02, -10, 10.8, 0.05, 8.8, 0xdfbc67);
    const paja = new THREE.TextureLoader().load(new URL('../../texturas/mundos/gallinas_suelo_paja.webp', import.meta.url).href);
    paja.colorSpace = THREE.SRGBColorSpace; paja.wrapS = paja.wrapT = THREE.RepeatWrapping; paja.repeat.set(2, 2);
    const pisoCorral = new THREE.Mesh(new THREE.PlaneGeometry(10.8, 8.8), new THREE.MeshLambertMaterial({ color: 0xffffff, map: paja }));
    pisoCorral.rotation.x = -Math.PI / 2; pisoCorral.position.set(0, .052, -10); grupo.add(pisoCorral);
    new GLTFLoader().load('modelos/gallinas_atrezzo_r9.glb', ({ scene }) => grupo.add(scene), undefined, (e) => console.error('No se pudo cargar el atrezzo rural r9', e));

    // Vallas del corral
    const matMadera = new THREE.MeshLambertMaterial({ color: 0x8d5b32 });
    const matRiel = new THREE.MeshLambertMaterial({ color: 0xa66d3b });

    // Valla trasera (z = -14.5)
    for (let x = -5.5; x <= 5.5; x += 1.8) {
      const poste = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.4, 0.24), matMadera);
      poste.position.set(x, 0.7, -14.5);
      grupo.add(poste);
      const punta=new THREE.Mesh(new THREE.ConeGeometry(.17,.34,4),matMadera);punta.position.set(x,1.55,-14.5);grupo.add(punta);
    }
    for (const h of [0.5, 1.0]) {
      const riel = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.15, 0.1), matRiel);
      riel.position.set(0, h, -14.5);
      grupo.add(riel);
    }

    // Vallas laterales (x = -5.5 y x = 5.5)
    for (const side of [-5.5, 5.5]) {
      for (let z = -14.5; z <= -5.5; z += 1.8) {
        const poste = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.4, 0.24), matMadera);
        poste.position.set(side, 0.7, z);
        grupo.add(poste);
        const punta=new THREE.Mesh(new THREE.ConeGeometry(.17,.34,4),matMadera);punta.position.set(side,1.55,z);grupo.add(punta);
      }
      for (const h of [0.5, 1.0]) {
        const riel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 9.2), matRiel);
        riel.position.set(side, h, -10);
        grupo.add(riel);
      }
    }

    // Valla frontal con puerta abierta en el centro (z = -5.5, abertura entre x = -1.6 y 1.6)
    for (const x of [-5.5, -3.6, -1.8, 1.8, 3.6, 5.5]) {
      const poste = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.4, 0.24), matMadera);
      poste.position.set(x, 0.7, -5.5);
      grupo.add(poste);
      const punta=new THREE.Mesh(new THREE.ConeGeometry(.17,.34,4),matMadera);punta.position.set(x,1.55,-5.5);grupo.add(punta);
    }
    for (const h of [0.5, 1.0]) {
      const rielIzq = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.15, 0.1), matRiel);
      rielIzq.position.set(-3.6, h, -5.5);
      grupo.add(rielIzq);
      const rielDer = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.15, 0.1), matRiel);
      rielDer.position.set(3.6, h, -5.5);
      grupo.add(rielDer);
    }

    // Arco de entrada con cartel dinámico
    const arcoPoste1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 0.3), matMadera);
    arcoPoste1.position.set(-1.8, 1.6, -5.5);
    grupo.add(arcoPoste1);
    const arcoPoste2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 0.3), matMadera);
    arcoPoste2.position.set(1.8, 1.6, -5.5);
    grupo.add(arcoPoste2);
    const arcoViga = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.35, 0.3), matMadera);
    arcoViga.position.set(0, 3.2, -5.5);
    grupo.add(arcoViga);

    const cartelHUD = crearCartelTexto('CORRAL', 512, 256);
    const marcoCartel = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 1.7),
      new THREE.MeshBasicMaterial({ map: cartelHUD.textura, side: THREE.DoubleSide })
    );
    marcoCartel.position.set(-5.05, 2.25, -8.1);
    grupo.add(marcoCartel);

    // Comedero de gallinas en el fondo del corral
    const posComedero = { x: 0, y: 0.2, z: -12.5 };
    const artesa = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 0.8), matMadera);
    artesa.position.set(posComedero.x, posComedero.y, posComedero.z);
    grupo.add(artesa);

    // Comida / churus en el comedero (se ilumina en recompensa)
    const comida = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.15, 0.6),
      new THREE.MeshLambertMaterial({ color: 0xffd54f, emissive: 0x443300 })
    );
    comida.position.set(posComedero.x, posComedero.y + 0.18, posComedero.z);
    grupo.add(comida);

    const brilloComedero = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffea00, wireframe: true, transparent: true, opacity: 0 })
    );
    brilloComedero.position.set(posComedero.x, posComedero.y + 0.6, posComedero.z);
    grupo.add(brilloComedero);

    // Obstáculos bajos en el prado (fardos de heno y troncos que saltan)
    const matHeno = new THREE.MeshLambertMaterial({ color: 0xd4a340 });
    const obstaculos = [
      { x: -7, z: 1, radio: 1.2, salto: 3.4 },
      { x: 7, z: 3, radio: 1.2, salto: 3.4 },
      { x: -3, z: 6, radio: 1.2, salto: 3.4 },
      { x: 5, z: -1, radio: 1.2, salto: 3.4 },
      { x: 0, z: 9, radio: 1.2, salto: 3.4 },
    ];
    obstaculos.forEach((obs) => {
      const heno = util.plataforma(obs.x, 0.45, obs.z, 1.6, 0.9, 1.4, 0xd4a340);
      heno.material = matHeno;
    });

    // Fardos decorativos dentro del corral
    const henoCorral = util.plataforma(-3.8, 0.45, -12.5, 1.6, 0.9, 1.4, 0xd4a340);
    henoCorral.material = matHeno;

    // Crear 5 gallinas
    const logica = crearEstadoGallinas({
      total: 5,
      corral: corralBounds,
      posicionesIniciales: [
        { x: -8, y: 0, z: 3 },
        { x: 8, y: 0, z: 5 },
        { x: -5, y: 0, z: 8 },
        { x: 6, y: 0, z: -2 },
        { x: 1, y: 0, z: 11 },
      ],
    });

    const modelosGallinas = logica.gallinas.map((g) => {
      const mod = crearModeloGallina();
      mod.grupo.position.set(g.pos.x, g.pos.y, g.pos.z);
      grupo.add(mod.grupo);
      return { g, mod };
    });
    new GLTFLoader().load('modelos/gallina_toon_r10.glb', ({ scene }) => {
      for (const [x, y, z, escala] of [[3.8, .05, -9.5, .9], [-5.15, 1.05, -8.2, .78]]) {
        const gallina = scene.clone(true); gallina.position.set(x, y, z); gallina.rotation.y = Math.PI; gallina.scale.setScalar(escala); grupo.add(gallina);
      }
    }, undefined, (e) => console.error('No se pudo cargar gallina_toon_r10.glb', e));

    return {
      logica,
      modelosGallinas,
      obstaculos,
      corralBounds,
      posComedero,
      comida,
      brilloComedero,
      cartelHUD,
      reloj: 0,
    };
  },

  actualizar(s, dt, ctx) {
    s.reloj += dt;
    const jugadoraPos = ctx.jugadora?.pos || { x: 0, y: 0, z: 0 };
    const logica = s.logica;

    // 1. Telaraña: recarga visible y captura
    logica.recargaTelaraña = Math.max(0, logica.recargaTelaraña - dt);

    if (logica.recargaTelaraña <= 0) {
      for (const { g } of s.modelosGallinas) {
        if (!g.enCorral && !g.atrapada && !g.llevada) {
          if (ctx.atrapado(g.pos, 2.2)) {
            const res = intentarAtraparTelaraña(logica, { impactoPos: g.pos, radioImpacto: 2.5 });
            if (res.atrapada) {
              ctx.avisar('¡Telaraña acertada! Acércate para cargar la gallina');
              break;
            }
          }
        }
      }
    }

    // 2. Temporizador de gallinas atrapadas
    for (const { g } of s.modelosGallinas) {
      if (g.atrapada && !g.llevada && !g.enCorral) {
        g.tiempoAtrapada -= dt;
        if (g.tiempoAtrapada <= 0) {
          g.atrapada = false;
          g.estado = 'libre';
          ctx.avisar('¡La gallina rompió la red y escapó!');
        }
      }
    }

    // 3. Llevar gallina atrapada hacia el corral
    const llevarRes = actualizarLlevarGallina(logica, jugadoraPos, s.corralBounds);
    if (llevarRes.recogida) {
      ctx.avisar('Llevando gallina... ¡Llévala al corral!');
    } else if (llevarRes.depositada) {
      ctx.avisar(`¡Gallina al corral! (${logica.enCorral}/${logica.total})`);
      if (logica.victoria) {
        ctx.avisar('¡Todas en el corral! Ve al comedero para alimentarlas ♥');
      }
    }

    // 4. IA de huida y movimiento para cada gallina
    for (const { g, mod } of s.modelosGallinas) {
      if (!g.enCorral && !g.atrapada && !g.llevada) {
        actualizarHuida(g, jugadoraPos, s.obstaculos, logica.limites, dt);
      } else if (g.enCorral && g.estado !== 'comiendo') {
        // Paseo tranquilo dentro del corral
        const t = s.reloj * 0.8 + g.id;
        g.pos.x = Math.max(s.corralBounds.minX + 0.8, Math.min(s.corralBounds.maxX - 0.8, g.pos.x + Math.sin(t) * 0.2 * dt));
        g.pos.z = Math.max(s.corralBounds.minZ + 0.8, Math.min(s.corralBounds.maxZ - 0.8, g.pos.z + Math.cos(t) * 0.2 * dt));
      }

      // Sincronizar posición 3D
      mod.grupo.position.set(g.pos.x, g.pos.y, g.pos.z);
      mod.grupo.rotation.y = g.angulo || 0;

      // Estado visual de la red
      mod.red.visible = g.atrapada;
      if (g.atrapada) {
        mod.red.rotation.y += dt * 3;
      }

      // Animación de aleteo y picoteo
      if (g.estado === 'huyendo') {
        const aleteo = Math.sin(s.reloj * 26 + g.id) * 0.7;
        mod.alaIzq.rotation.z = -aleteo;
        mod.alaDer.rotation.z = aleteo;
        mod.cabeza.rotation.x = Math.sin(s.reloj * 16) * 0.25;
      } else if (g.estado === 'comiendo') {
        mod.cabeza.rotation.x = Math.abs(Math.sin(s.reloj * 8 + g.id)) * 0.55;
        mod.alaIzq.rotation.z = Math.sin(s.reloj * 6) * 0.2;
        mod.alaDer.rotation.z = -Math.sin(s.reloj * 6) * 0.2;
        mod.corazones.visible = true;
      } else {
        mod.alaIzq.rotation.z = 0;
        mod.alaDer.rotation.z = 0;
        mod.cabeza.rotation.x = Math.sin(s.reloj * 3 + g.id) * 0.15;
      }
    }

    // 5. Escena de recompensa final
    if (logica.victoria && !logica.premiado) {
      s.brilloComedero.material.opacity = 0.5 + Math.sin(s.reloj * 4) * 0.3;
      s.brilloComedero.rotation.y += dt * 2;

      if (ctx.cerca(s.posComedero, 2.6) || ctx.acariciar(s.posComedero, 2.6)) {
        const premiado = alimentarCorral(logica, jugadoraPos, s.posComedero, 2.6);
        if (premiado) {
          ctx.sumarChurus(50);
          ctx.avisar('¡Corral a salvo! Has alimentado a las gallinas (+50 churus) ♥');
        }
      }
    }

    // 6. Actualizar cartel dinámico
    const textoTelaraña =
      logica.recargaTelaraña <= 0
        ? 'Telaraña: ¡LISTA!'
        : `Telaraña: ${logica.recargaTelaraña.toFixed(1)}s`;
    s.cartelHUD.dibujar([
      'CORRAL DE GALLINAS',
      `Salvadas: ${logica.enCorral} / ${logica.total}`,
      logica.victoria ? '¡CORRAL COMPLETO!' : textoTelaraña,
    ]);
  },

  objetivo: { texto: 'Atrapa las 5 gallinas con telaraña y llévalas al corral', meta: 5 },
};
