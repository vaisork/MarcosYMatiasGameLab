// Load through codex-browser eval after entering a disposable QA game.
// qaWalkExit(direction) uses actual client key/draw steps and server actions.
// It never changes avatar coordinates directly. Callers must assert destination.
// Synthetic frame stepping does not certify physical touch or sustained FPS.
window.qaRecords=[];
window.qaWalkExit=async function(direction,portalIndex=0){
  const origin=snapshot.room.id;
  const offered=snapshot.actions.find(a=>a.id==='mover'&&a.target===direction&&!a.disabled);
  if(!offered)throw Error('Exit not offered '+direction);
  const e=scene.exits.filter(e=>e.direction===direction)[portalIndex];
  if(!e)throw Error('Portal not found '+direction+' '+portalIndex);
  const [ex,ey,ew,eh]=e.rect;
  const start=[Math.floor(player.x),Math.floor(player.y)];
  const queue=[[start,[]]], seen=new Set([start.join(',')]);
  let path;
  for(let i=0;i<queue.length;i++){
   const [[x,y],steps]=queue[i];
   if(x+.5>=ex&&x+.5<ex+ew&&y+.5>=ey&&y+.5<ey+eh){path=steps;break;}
   for(const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]]){
    const nx=x+dx,ny=y+dy,k=nx+','+ny;
    if(!seen.has(k)&&!blocked(nx+.5,ny+.5)){seen.add(k);queue.push([[nx,ny],[...steps,[nx+.5,ny+.5]]]);}
   }
  }
  if(!path)throw Error('No walking path '+origin+' '+direction);
  let frames=0;
  for(const [x,y] of path){
   while(snapshot.room.id===origin&&!busy&&(Math.abs(player.x-x)>.055||Math.abs(player.y-y)>.055)){
    keys.clear();
    keys.add(Math.abs(player.x-x)>.055?(player.x<x?'ArrowRight':'ArrowLeft'):(player.y<y?'ArrowDown':'ArrowUp'));
    draw(lastTime+25);if(++frames>3000)throw Error('Walking frame limit');
   }
   if(busy||snapshot.room.id!==origin)break;
  }
  keys.clear();
  for(let n=0;n<200&&busy;n++)await new Promise(r=>setTimeout(r,10));
  if(snapshot.room.id===origin)throw Error('Exit did not transition '+direction);
  const record={from:origin,direction,portalIndex,to:snapshot.room.id,frames,free:!blocked(player.x,player.y)};window.qaRecords.push(record);return record;
 }
;true
