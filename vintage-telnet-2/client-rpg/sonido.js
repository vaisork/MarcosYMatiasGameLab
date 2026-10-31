'use strict';
// Sonido y música de Vaisgard RPG: todo se sintetiza con Web Audio (sin archivos ni dependencias).
// API: VaisgardSonido.fx(nombre), .musica(idTema|null), .temaSala(room), .temaBatalla(combat,region).
(function(global){
const NOTAS_MODO={
 mayor:[0,2,4,5,7,9,11], menor:[0,2,3,5,7,8,10], dorico:[0,2,3,5,7,9,10],
 lidio:[0,2,4,6,7,9,11], mixolidio:[0,2,4,5,7,9,10], frigio:[0,1,3,5,7,8,10], armonica:[0,2,3,5,7,8,11]
};

// Temas compuestos a mano. Melodía en grados de la escala: 1..7, prefijo b/# altera, ' sube octava, , baja;
// cada token es una corchea, «-» prolonga, «.» silencio, «|» separa compases. Acordes: un grado por compás.
// tonica = MIDI de la tónica de la melodía; bajo y acompañamiento salen de los acordes.
const TEMAS={
 // Pueblos (uno por asentamiento real de content/regions)
 valdren:{nombre:'Valdren',tonica:67,modo:'mayor',bpm:104,compas:8,onda:'triangle',bajo:'pulso',acomp:'arpegio',bateria:null,
  melodia:"1 - 3 - 5 - 3 - | 4 - 6 - 5 - - - | 3 - 2 - 1 - 2 - | 3 - - - 2 - - - | 1 - 3 - 5 - 1' - | 7 - 6 - 5 - 4 - | 3 - 4 - 2 - 7, - | 1 - - - . . . .",
  acordes:"1 4 1 5 1 4 5 1"},
 khariel:{nombre:'Khariel',tonica:62,modo:'lidio',bpm:112,compas:8,onda:'sine',bajo:'pulso',acomp:'arpegio',bateria:'suave',
  melodia:"5, - 1 - 2 - 3 - | 4 - 5 - 3 - - - | 6 - 5 - 3 - 2 - | 1 - - - 5, - - - | 1 - 2 - 3 - 5 - | 6 - 5 - 4 - 3 - | 2 - 3 - 2 - 7, - | 1 - - - - - . .",
  acordes:"1 2 6 1 1 2 5 1"},
 brumak:{nombre:'Brumak',tonica:57,modo:'dorico',bpm:92,compas:8,onda:'square',bajo:'paseo',acomp:'golpes',bateria:'marcha',
  melodia:"1 . 1 3 4 - 5 - | 4 - 3 - 1 - - - | 1 . 1 3 4 - 5 - | 7 - 6 - 5 - - - | 5 - 7 - 1' - 7 - | 6 - 5 - 4 - 3 - | 4 - 3 - 2 - 7, - | 1 - - - . . . .",
  acordes:"1 4 1 7 5 4 7 1"},
 narevia:{nombre:'Narevia',tonica:65,modo:'mayor',bpm:96,compas:6,onda:'triangle',bajo:'vals',acomp:'arpegio',bateria:null,
  melodia:"3 - - 2 1 - | 5, - - - - - | 6, - 1 - 3 - | 2 - - - - - | 3 - - 4 5 - | 6 - 5 - 3 - | 2 - 3 - 7, - | 1 - - - - -",
  acordes:"1 5 4 5 1 4 5 1"},
 velmora:{nombre:'Velmora',tonica:64,modo:'menor',bpm:84,compas:8,onda:'sine',bajo:'nota',acomp:'arpegio',bateria:null,
  melodia:"5, - 1 - 2 - 3 - | 2 - 1 - 7, - 5, - | 6, - 1 - 3 - 5 - | 4 - 3 - 2 - - - | 3 - 5 - 6 - 5 - | 3 - 2 - 1 - 2 - | 3 - 2 - 7, - 2 - | 1 - - - - - . .",
  acordes:"1 7 6 4 3 6 5 1"},
 vaisgard:{nombre:'Vaisgard',tonica:60,modo:'mayor',bpm:120,compas:8,onda:'square',bajo:'paseo',acomp:'golpes',bateria:'suave',
  melodia:"1' - 5 - 3 5 1' - | 2' - 1' - 7 - 5 - | 6 - 4 - 6 1' 2' - | 1' - - - 7 - - - | 1' - 5 - 3 5 1' - | 2' - 1' - 7 - 6 - | 5 - 6 7 1' - 7 - | 1' - - - . . . .",
  acordes:"1 5 4 5 1 5 5 1"},
 descanso:{nombre:'Descanso',tonica:65,modo:'mayor',bpm:72,compas:6,onda:'sine',bajo:'vals',acomp:'colchon',bateria:null,
  melodia:"3 - 2 - 1 - | 5, - - - 6, - | 1 - 2 - 3 - | 2 - - - - - | 3 - 4 - 5 - | 6 - 5 - 3 - | 2 - 1 - 7, - | 1 - - - - -",
  acordes:"1 4 1 5 1 4 5 1"},
 // Lugares fuera de los pueblos
 campo:{nombre:'Campo y caminos',tonica:67,modo:'mayor',bpm:116,compas:8,onda:'square',bajo:'pulso',acomp:'arpegio',bateria:'suave',
  melodia:"1 - - 5, 1 - 2 - | 3 - - 2 3 - 5 - | 4 - - 3 2 - 1 - | 2 - - - 5, - - - | 1 - - 5, 1 - 2 - | 3 - - 2 3 - 6 - | 5 - 4 - 3 - 2 - | 1 - - - - - . .",
  acordes:"1 6 4 5 1 6 5 1"},
 bosque:{nombre:'Bosque',tonica:69,modo:'menor',bpm:96,compas:8,onda:'triangle',bajo:'nota',acomp:'arpegio',bateria:null,
  melodia:"1 - 3 - 5 - 4 3 | 2 - - - 7, - - - | 1 - 3 - 5 - 6 5 | 4 - - - 3 - - - | 6 - 5 - 4 - 3 - | 4 - 3 - 2 - 1 - | 7, - 1 - 2 - 7, - | 1 - - - . . . .",
  acordes:"1 7 1 4 6 4 7 1"},
 rio:{nombre:'Río y pantano',tonica:62,modo:'mayor',bpm:100,compas:8,onda:'triangle',bajo:'pulso',acomp:'arpegio',bateria:null,
  melodia:"5 - 3 - 2 - 3 5 | 6 - 5 - - - - - | 3 - 2 - 1 - 2 3 | 2 - - - - - - - | 5 - 3 - 2 - 3 5 | 6 - 1' - 6 - 5 - | 3 - 2 - 3 - 2 - | 1 - - - - - . .",
  acordes:"1 4 6 5 1 4 5 1"},
 montana:{nombre:'Montaña y roca',tonica:64,modo:'dorico',bpm:108,compas:8,onda:'square',bajo:'paseo',acomp:'golpes',bateria:'marcha',
  melodia:"1 - 5 - 4 - 5 - | 7 - 6 - 5 - - - | 4 - 5 - 6 - 5 4 | 5 - - - - - - - | 1' - 7 - 6 - 5 - | 4 - 5 - 6 - 4 - | 5 - 4 - 3 - 2 - | 1 - - - - - . .",
  acordes:"1 7 4 5 1 4 7 1"},
 cueva:{nombre:'Cuevas y canales',tonica:62,modo:'menor',bpm:76,compas:8,onda:'triangle',bajo:'nota',acomp:null,bateria:null,
  melodia:"1 . . 5, . . 1 . | b2 . . 1 . . 7, . | 1 . . 3 . . 5 . | 4 - - 3 - - - - | 5 . . 4 . . 3 . | 2 . . 1 . . 7, . | 1 . . 3 . 2 . 7, | 1 - - - - - - -",
  acordes:"1 1 6 4 1 5 5 1"},
 mazmorra:{nombre:'Mazmorra',tonica:60,modo:'frigio',bpm:88,compas:8,onda:'square',bajo:'pulso',acomp:'colchon',bateria:'tic',
  melodia:"1 - 2 - 1 - 7, - | 1 - - - 5, - - - | 1 - 2 - 3 - 2 - | 1 - - - - - - - | 5 - 6 - 5 - 4 - | 3 - 2 - 1 - 2 - | 3 - 4 - 2 - 7, - | 1 - - - . . . .",
  acordes:"1 2 1 7 4 2 7 1"},
 // Combate
 batalla:{nombre:'Batalla',tonica:69,modo:'armonica',bpm:152,compas:8,onda:'square',bajo:'motor',acomp:'arpegio',bateria:'batalla',
  melodia:"1' - 7 1' 5 - 3 - | 4 - 5 - 6 - 5 - | 1' - 7 1' 5 - 3 - | 2 - 3 - 7, - - - | 6 - 6 7 1' - 6 - | 5 - 5 6 7 - 5 - | 4 - 3 - 2 - 7, - | 1 - 2 - 3 - 7, -",
  acordes:"1 4 1 5 6 5 4 5"},
 jefe:{nombre:'Jefe',tonica:62,modo:'armonica',bpm:138,compas:8,onda:'sawtooth',bajo:'motor',acomp:'golpes',bateria:'jefe',
  melodia:"1 - - 1 b2 - 1 - | 7, - - - 5, - - - | 1 - - 1 b2 - 3 - | 2 - - - b2 - - - | 5 - - 4 3 - 4 - | 5 - 6 - 5 - 4 - | 3 - 2 - b2 - 7, - | 1 - 5, - 1 - 7, -",
  acordes:"1 5 1 6 4 6 5 5"}
};
// Variante de batalla por región: transposición, timbre y tempo.
const BATALLA_REGION={edran:{t:0,onda:'square',bpm:0},hoshai:{t:2,onda:'triangle',bpm:6},korven:{t:-5,onda:'sawtooth',bpm:-8},lethra:{t:-4,onda:'triangle',bpm:-4},nhal:{t:-2,onda:'sine',bpm:-6},veyra:{t:3,onda:'square',bpm:4}};
for(const [region,v] of Object.entries(BATALLA_REGION))TEMAS[`batalla_${region}`]={...TEMAS.batalla,nombre:`Batalla · ${region}`,tonica:TEMAS.batalla.tonica+v.t,onda:v.onda,bpm:TEMAS.batalla.bpm+v.bpm};

// ---- Mapeo sala → tema (ajustar aquí) ----
const PUEBLO_REGION={edran:'valdren',hoshai:'khariel',korven:'brumak',lethra:'narevia',nhal:'velmora',veyra:'vaisgard'};
// Se evalúan en orden sobre «id nombre» de la sala; la primera coincidencia gana.
const MAPA_SALAS=[
 [/mazmorra|bastion/,'mazmorra'],
 [/_canal_|almacen_(entrada|balanzas|cruce|lateral|fondo)|cueva|tunel|galeria/,'cueva'],
 [/cuidados|cobertizo|reparo|casa_camino|caseta|registro|refugio/,'descanso']
];
// Interiores que forman parte del pueblo (talleres, cocinas, depósitos…).
const INTERIOR_PUEBLO=/^valdren_|taller|cocina|deposito|almacen_grano|archivo/;
// Fuera del pueblo: regiones de un solo bioma, palabras clave y bioma por defecto.
const BIOMA_REGION={nhal:'bosque',lethra:'rio'};
const BIOMA_PALABRAS=[
 [/arbol|arboleda|sauce|pinar|pino|dosel|bosque|helecho/,'bosque'],
 [/agua|acequia|junco|estanque|humed|canales|ribera|orilla|charco|cauce_obs/,'rio'],
 [/roca|piedra|cantera|lajas|cuello|garganta|collado|peldano|meseta|grieta|cascajo|ladera|estribacion/,'montana'],
 [/surco|prado|era$|camino|calzada|vega|pasto|huerta|loma/,'campo']
];
const BIOMA_DEFECTO={edran:'campo',veyra:'campo',hoshai:'montana',korven:'montana',lethra:'rio',nhal:'bosque'};
// Jefes: el dragón y criaturas de rango alto (vida máxima ≥ 120 en el perfil del servidor).
const JEFES=new Set(['dragon_aguas_antiguas']);

function temaSala(room){
 if(!room)return null;
 if(room.kind==='home')return 'descanso';
 const texto=`${room.id||''} ${room.name||''}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
 for(const [re,tema] of MAPA_SALAS)if(re.test(texto))return tema;
 if(room.kind==='settlement'||(room.kind==='interior'&&INTERIOR_PUEBLO.test(room.id||'')))return PUEBLO_REGION[room.region]||'vaisgard';
 if(BIOMA_REGION[room.region])return BIOMA_REGION[room.region];
 for(const [re,tema] of BIOMA_PALABRAS)if(re.test(texto))return tema;
 return BIOMA_DEFECTO[room.region]||'campo';
}
function temaBatalla(combat,region){
 if(!combat)return null;
 if(JEFES.has(combat.creature)||(combat.hp_max||0)>=120)return 'jefe';
 return TEMAS[`batalla_${region}`]?`batalla_${region}`:'batalla';
}

// ---- Partitura → eventos ----
function midiDe(token,t){
 const m=/^([b#]?)([1-7])([',]*)$/.exec(token);if(!m)return null;
 const escala=NOTAS_MODO[t.modo];
 let nota=t.tonica+escala[+m[2]-1]+(m[1]==='b'?-1:m[1]==='#'?1:0);
 for(const c of m[3])nota+=c==="'"?12:-12;
 return nota;
}
function compilar(t){
 const compases=t.melodia.split('|').map(c=>c.trim().split(/\s+/));
 const tokens=compases.flat(), eventos=[];
 tokens.forEach((tok,i)=>{
  const midi=midiDe(tok,t);if(midi===null)return;
  let largo=1;while(tokens[i+largo]==='-')largo++;
  eventos[i]={midi,largo};
 });
 const escala=NOTAS_MODO[t.modo];
 const acordes=t.acordes.split(/\s+/).map(g=>{
  const i=+g-1;return [0,2,4].map(p=>t.tonica-12+escala[(i+p)%7]+12*Math.floor((i+p)/7));
 });
 return {compases,eventos,acordes,pasos:tokens.length};
}

// ---- Motor de audio ----
const PREF_KEY='vaisgard-rpg-sonido';
let prefs={sonido:true,musica:true,efectos:true};
try{const s=JSON.parse(global.localStorage?.getItem(PREF_KEY)||'null');if(s&&typeof s==='object')prefs={...prefs,...s};}catch{}
let ctx=null, master=null, busMusica=null, busFx=null, ruido=null, actual=null, deseado=null, reloj=null;
const VOL_MUSICA=.32, VOL_FX=.8;
const hz=m=>440*Math.pow(2,(m-69)/12);

function crearContexto(){
 const AC=global.AudioContext||global.webkitAudioContext;if(!AC)return false;
 ctx=new AC();
 master=ctx.createGain();master.connect(ctx.destination);
 busMusica=ctx.createGain();busMusica.connect(master);
 busFx=ctx.createGain();busFx.connect(master);
 const len=Math.floor(ctx.sampleRate||44100);
 ruido=ctx.createBuffer(1,len,ctx.sampleRate||44100);
 const d=ruido.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 aplicarPrefs();
 reloj=setInterval(programar,50);
 return true;
}
function aplicarPrefs(){
 if(!ctx)return;
 const t=ctx.currentTime;
 master.gain.setTargetAtTime(prefs.sonido?1:0,t,.05);
 busMusica.gain.setTargetAtTime(prefs.musica?VOL_MUSICA:0,t,.2);
 busFx.gain.setTargetAtTime(prefs.efectos?VOL_FX:0,t,.05);
}
function desbloquear(){
 if(!prefs.sonido)return;
 if(!ctx&&!crearContexto())return;
 if(ctx.state==='suspended'&&!global.document?.hidden)ctx.resume?.();
 if(deseado!==(actual?.id??null))cambiarTema(deseado);
}

// Voz sintética: oscilador con envolvente suave y filtro paso bajo para que no chille.
function voz(t,midi,dur,{onda='square',vol=.1,destino=busFx,hasta=null,corte=2400,ataque=.008}={}){
 const o=ctx.createOscillator(), g=ctx.createGain(), f=ctx.createBiquadFilter();
 o.type=onda;o.frequency.setValueAtTime(hz(midi),t);
 if(hasta!==null)o.frequency.exponentialRampToValueAtTime(hz(hasta),t+dur);
 f.type='lowpass';f.frequency.setValueAtTime(corte,t);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+ataque);
 g.gain.setTargetAtTime(vol*.6,t+ataque,dur*.3);g.gain.setTargetAtTime(0,t+dur*.85,.04);
 o.connect(f);f.connect(g);g.connect(destino);o.start(t);o.stop(t+dur+.25);
}
function golpeRuido(t,dur,{vol=.1,tipo='bandpass',frec=1200,hasta=null,destino=busFx}={}){
 const s=ctx.createBufferSource(), f=ctx.createBiquadFilter(), g=ctx.createGain();
 s.buffer=ruido;f.type=tipo;f.frequency.setValueAtTime(frec,t);
 if(hasta!==null)f.frequency.exponentialRampToValueAtTime(hasta,t+dur);
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
 s.connect(f);f.connect(g);g.connect(destino);s.start(t);s.stop(t+dur+.05);
}
function bombo(t,vol,destino){
 const o=ctx.createOscillator(), g=ctx.createGain();
 o.type='sine';o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);
 o.connect(g);g.connect(destino);o.start(t);o.stop(t+.2);
}

const FX={
 paso:t=>golpeRuido(t,.05,{vol:.05,tipo:'lowpass',frec:500}),
 menu:t=>{voz(t,76,.05,{vol:.07});voz(t+.05,83,.07,{vol:.07});},
 confirmar:t=>[72,79,84].forEach((m,i)=>voz(t+i*.045,m,.07,{vol:.07})),
 cancelar:t=>{voz(t,79,.06,{vol:.06});voz(t+.06,72,.09,{vol:.06});},
 hablar:t=>voz(t,79+[0,2,4,2][Math.floor(Math.random()*4)],.035,{vol:.035,corte:1800}),
 golpe:t=>{golpeRuido(t,.1,{vol:.22,frec:1400,hasta:500});voz(t,55,.1,{vol:.12,hasta:40,corte:1200});},
 herido:t=>{golpeRuido(t,.16,{vol:.2,tipo:'lowpass',frec:900});voz(t,50,.2,{onda:'sawtooth',vol:.1,hasta:38,corte:900});},
 fallo:t=>golpeRuido(t,.18,{vol:.09,frec:3200,hasta:700}),
 critico:t=>{FX.golpe(t);bombo(t,.4,busFx);[88,91,96].forEach((m,i)=>voz(t+.06+i*.05,m,.08,{vol:.06,corte:3500}));},
 curar:t=>[72,76,79,84,88].forEach((m,i)=>voz(t+i*.07,m,.14,{onda:'triangle',vol:.09})),
 nivel:t=>{[72,76,79,84].forEach((m,i)=>voz(t+i*.08,m,.1,{vol:.08}));voz(t+.34,84,.5,{vol:.08});voz(t+.34,88,.5,{vol:.06});voz(t+.34,60,.5,{onda:'triangle',vol:.1});},
 victoria:t=>{[[72,0,.1],[76,.12,.1],[79,.24,.1],[84,.36,.55],[82,.95,.14],[84,1.1,.6]].forEach(([m,d,l])=>{voz(t+d,m,l,{vol:.09});voz(t+d,m-24,l,{onda:'triangle',vol:.1});});voz(t+1.1,79,.6,{vol:.05});},
 derrota:t=>{[[67,0,.3],[66,.32,.3],[65,.64,.3],[64,.96,.9]].forEach(([m,d,l])=>voz(t+d,m,l,{onda:'triangle',vol:.1}));voz(t+.96,52,.9,{onda:'triangle',vol:.1});},
 huir:t=>{golpeRuido(t,.25,{vol:.08,frec:600,hasta:3000});voz(t,60,.25,{vol:.06,hasta:84});},
 batalla:t=>{[60,63,66,69,72].forEach((m,i)=>voz(t+i*.05,m,.06,{vol:.08}));golpeRuido(t,.3,{vol:.12,frec:400,hasta:4000});bombo(t+.27,.4,busFx);golpeRuido(t+.27,.4,{vol:.1,tipo:'highpass',frec:5000});},
 sala:t=>{golpeRuido(t,.3,{vol:.04,frec:400,hasta:1600});voz(t+.08,79,.18,{onda:'triangle',vol:.04});}
};

function fx(nombre,retrasoMs=0){
 if(!ctx||!prefs.sonido||!prefs.efectos||ctx.state!=='running'||!FX[nombre])return;
 FX[nombre](ctx.currentTime+.01+retrasoMs/1000);
}

function cambiarTema(id){
 const t=ctx.currentTime;
 if(actual){const viejo=actual.bus;viejo.gain.cancelScheduledValues(t);viejo.gain.setValueAtTime(viejo.gain.value??1,t);viejo.gain.linearRampToValueAtTime(0,t+.8);setTimeout(()=>viejo.disconnect(),1200);}
 actual=null;
 if(!id||!TEMAS[id])return;
 const bus=ctx.createGain();bus.gain.setValueAtTime(0,t);bus.gain.linearRampToValueAtTime(1,t+.8);bus.connect(busMusica);
 actual={id,def:TEMAS[id],partitura:compilar(TEMAS[id]),bus,paso:0,siguiente:t+.1};
}
function musica(id){
 deseado=id&&TEMAS[id]?id:null;
 if(ctx&&deseado!==(actual?.id??null))cambiarTema(deseado);
}
function programar(){
 if(!actual||!ctx||ctx.state!=='running')return;
 const a=actual, corchea=60/a.def.bpm/2;
 if(a.siguiente<ctx.currentTime)a.siguiente=ctx.currentTime+.05;
 while(a.siguiente<ctx.currentTime+.25){tocarPaso(a,a.paso,a.siguiente,corchea);a.paso=(a.paso+1)%a.partitura.pasos;a.siguiente+=corchea;}
}
function tocarPaso(a,paso,t,c){
 const d=a.def, p=a.partitura, n=d.compas, compas=Math.floor(paso/n), pos=paso%n, acorde=p.acordes[compas%p.acordes.length], bus=a.bus;
 const ev=p.eventos[paso];
 if(ev)voz(t,ev.midi,ev.largo*c*.95,{onda:d.onda,vol:d.onda==='sine'?.13:d.onda==='triangle'?.12:.06,destino:bus,corte:d.onda==='sawtooth'?1400:2000});
 const raiz=acorde[0]-(acorde[0]<52?0:12);
 if(d.bajo==='pulso'&&pos%4===0)voz(t,pos===0?raiz:raiz+7,c*1.8,{onda:'triangle',vol:.14,destino:bus,corte:700});
 if(d.bajo==='paseo'&&pos%2===0)voz(t,[raiz,raiz+7,raiz+12,raiz+7][pos/2%4],c*1.6,{onda:'triangle',vol:.14,destino:bus,corte:700});
 if(d.bajo==='motor')voz(t,pos%2?raiz+12:raiz,c*.9,{onda:'triangle',vol:.15,destino:bus,corte:800});
 if(d.bajo==='vals'&&pos===0)voz(t,raiz,c*n*.9,{onda:'triangle',vol:.14,destino:bus,corte:600});
 if(d.bajo==='nota'&&pos===0)voz(t,raiz,c*n*.95,{onda:'sine',vol:.16,destino:bus,corte:500,ataque:.06});
 if(d.acomp==='arpegio'&&(pos%2===0||d.bpm>130)){const k=d.bpm>130?pos:pos/2;voz(t,acorde[k%3]+(k%6>2?12:0),c*.9,{onda:'square',vol:.025,destino:bus,corte:1300});}
 if(d.acomp==='golpes'&&pos%4===2)acorde.forEach(m=>voz(t,m,c*.8,{onda:'square',vol:.02,destino:bus,corte:1100}));
 if(d.acomp==='colchon'&&pos===0)acorde.forEach(m=>voz(t,m,c*n,{onda:'triangle',vol:.03,destino:bus,corte:900,ataque:.3}));
 const bat=d.bateria;
 if(bat==='suave'&&pos%2===1)golpeRuido(t,.03,{vol:.025,tipo:'highpass',frec:7000,destino:bus});
 if(bat==='tic'&&pos%4===0)golpeRuido(t,.02,{vol:.03,tipo:'highpass',frec:5000,destino:bus});
 if(bat==='marcha'){if(pos%4===0)bombo(t,.25,bus);if(pos===6)golpeRuido(t,.08,{vol:.05,frec:1800,destino:bus});}
 if(bat==='batalla'||bat==='jefe'){
  if(pos%4===0||(bat==='jefe'&&pos%4===3))bombo(t,.35,bus);
  if(pos%4===2)golpeRuido(t,.12,{vol:.08,frec:1800,destino:bus});
  golpeRuido(t,.03,{vol:.025,tipo:'highpass',frec:7000,destino:bus});
 }
}

// ---- Preferencias e interfaz ----
function guardar(){try{global.localStorage?.setItem(PREF_KEY,JSON.stringify(prefs));}catch{}}
function pintarBotones(){
 const doc=global.document;if(!doc?.querySelectorAll)return;
 for(const b of doc.querySelectorAll('.sound-toggle')){b.textContent=prefs.sonido?'🔊':'🔇';b.setAttribute('aria-pressed',String(prefs.sonido));b.setAttribute('aria-label',prefs.sonido?'Silenciar sonido':'Activar sonido');b.title=b.getAttribute('aria-label');}
 const m=doc.getElementById('toggle-music'), e=doc.getElementById('toggle-sfx');
 if(m){m.textContent=`Música: ${prefs.musica?'sí':'no'}`;m.setAttribute('aria-pressed',String(prefs.musica));}
 if(e){e.textContent=`Efectos: ${prefs.efectos?'sí':'no'}`;e.setAttribute('aria-pressed',String(prefs.efectos));}
}
function cambiar(clave){
 prefs[clave]=!prefs[clave];guardar();
 if(clave==='sonido'&&prefs.sonido)desbloquear();
 if(ctx){aplicarPrefs();if(!prefs.sonido)setTimeout(()=>{if(!prefs.sonido)ctx.suspend?.();},150);}
 pintarBotones();
 if(prefs[clave])fx('confirmar');
}
if(global.addEventListener){
 for(const tipo of ['pointerdown','touchend','click','keydown'])global.addEventListener(tipo,desbloquear,{capture:true,passive:true});
}
const doc=global.document;
if(doc?.addEventListener){
 doc.addEventListener('visibilitychange',()=>{if(!ctx)return;if(doc.hidden)ctx.suspend?.();else if(prefs.sonido)ctx.resume?.();});
 const iniciar=()=>{
  for(const b of doc.querySelectorAll('.sound-toggle'))b.addEventListener('click',()=>cambiar('sonido'));
  doc.getElementById('toggle-music')?.addEventListener('click',()=>cambiar('musica'));
  doc.getElementById('toggle-sfx')?.addEventListener('click',()=>cambiar('efectos'));
  pintarBotones();
 };
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',iniciar);else iniciar();
}

global.VaisgardSonido={fx,musica,temaSala,temaBatalla,TEMAS,FX,compilar,prefs:()=>({...prefs}),estado:()=>({audio:ctx?.state||'sin-iniciar',tema:actual?.id||null}),_programar:programar,_desbloquear:desbloquear};
})(globalThis);
