/* =======================================================================
   13/C. ÉLŐVILÁG

   A táj eddig üres díszlet volt: fák, fű, semmi mozgás. Most él.

     MADARAK  — csapatban húznak át az égen, magasan, árnyékkal a földön
     ŐZEK     — erdőszélen legelnek, és szétugranak, ha katona közelít
     SIRÁLYOK — a kikötő és a part fölött köröznek
     HALAK    — a vízben időnként kiugranak, gyűrűt vetve

   Egyik sem játékelem: nem lehet őket megölni, nem takarnak, nem lassítanak.
   Mozgáscsökkentett és takarékos módban kimaradnak.
   ===================================================================== */

const WL_MADAR=3, WL_OZ=5, WL_SIRALY=4;

function wildInit(){
  G.wild={madar:[], oz:[], siraly:[], t:0};
  const R=seedRand('wild'+(G.decoSeed||1));
  // madárcsapatok: egyik szélről a másikra
  for(let i=0;i<WL_MADAR;i++) G.wild.madar.push(ujMadar(R));
  // őzek: erdős foltokban
  for(let i=0;i<WL_OZ;i++){
    const fa=G.nodes.filter(n=>!n.dead&&n.type==='wood');
    if(!fa.length) break;
    const f=fa[Math.floor(R()*fa.length)];
    G.wild.oz.push({x:f.x+R()*90-45, y:f.y+R()*90-45, tx:0, ty:0,
                    v:0, riadt:0, face:R()*TAU, t:R()*10});
  }
  // sirályok a kikötők fölé
  for(let i=0;i<WL_SIRALY;i++) G.wild.siraly.push({
    x:R()*WORLD.w, y:R()*WORLD.h, a:R()*TAU, r:60+R()*70, t:R()*10, cx:0, cy:0
  });
}
function ujMadar(R){
  const balrol=R()<0.5;
  return {
    x: balrol?-80:WORLD.w+80, y:rnd(80,WORLD.h-80),
    vx:(balrol?1:-1)*(28+R()*22), vy:(R()-0.5)*10,
    db:3+Math.floor(R()*4), fazis:R()*TAU, mag:70+R()*40
  };
}

function wildTick(dt){
  if(!G.on||REDUCED||G.lowFx) return;
  if(!G.wild) wildInit();
  const W=G.wild;
  W.t+=dt;
  // madarak
  for(let i=W.madar.length-1;i>=0;i--){
    const m=W.madar[i];
    m.x+=m.vx*dt; m.y+=m.vy*dt; m.fazis+=dt*7;
    if(m.x<-150||m.x>WORLD.w+150) W.madar[i]=ujMadar(Math.random);
  }
  // őzek: legelnek, de szétugranak
  for(const o of W.oz){
    o.t-=dt;
    if(o.riadt>0){
      o.riadt-=dt;
      o.x+=Math.cos(o.face)*120*dt;
      o.y+=Math.sin(o.face)*120*dt;
    }else{
      // katona a közelben?
      for(const u of G.units){
        if(u.dead||u.role==='worker') continue;
        const d=dist(u.x,u.y,o.x,o.y);
        if(d<130){ o.riadt=2.2; o.face=Math.atan2(o.y-u.y,o.x-u.x); break; }
      }
      if(o.t<=0){                       // néha odébb sétál
        o.t=4+Math.random()*7;
        o.face=Math.random()*TAU;
        o.v=(Math.random()<0.6)?14:0;
      }
      o.x+=Math.cos(o.face)*o.v*dt;
      o.y+=Math.sin(o.face)*o.v*dt;
    }
    o.x=clamp(o.x,40,WORLD.w-40); o.y=clamp(o.y,40,WORLD.h-40);
  }
  // sirályok a legközelebbi kikötő vagy part fölött köröznek
  for(const s of W.siraly){
    s.a+=dt*0.6;
    if(!s.cx||Math.random()<dt*0.05){
      const kik=G.builds.filter(b=>!b.dead&&b.type==='harbor');
      if(kik.length){ const k=kik[rndInt(0,kik.length-1)]; s.cx=k.x; s.cy=k.y; }
      else { s.cx=s.x; s.cy=s.y; }
    }
    s.x=s.cx+Math.cos(s.a)*s.r;
    s.y=s.cy+Math.sin(s.a)*s.r*0.6;
  }
  // halak: időnként kiugrik egy a vízből
  if(Math.random()<dt*0.7){
    for(let i=0;i<30;i++){
      const x=rnd(60,WORLD.w-60), y=rnd(60,WORLD.h-60);
      if(isWater(x,y)&&fogAt(x,y)>0){
        G.fx.push({x,y,t:0,life:0.9,type:'hal'});
        break;
      }
    }
  }
}

/* --- rajzolás --- */
function drawWild(){
  if(REDUCED||G.lowFx||G.pirate||!G.wild) return;   // stratégiai nézetben nincs
  const W=G.wild;
  // őzek a földön
  for(const o of W.oz){
    const x=o.x-G.cam.x, y=o.y-G.cam.y;
    if(x<-40||y<-40||x>G.vw+40||y>G.vh+40) continue;
    if(fogAt(o.x,o.y)<1) continue;
    ctx.save(); ctx.translate(x,y);
    ctx.fillStyle='rgba(20,26,16,.22)';
    ctx.beginPath(); ctx.ellipse(0,1,7,2.6,0,0,TAU); ctx.fill();
    const jobbra=Math.cos(o.face)>=0;
    ctx.scale(jobbra?1:-1,1);
    ctx.fillStyle='#8a6a44';                       // test
    ctx.beginPath(); ctx.ellipse(0,-5,6.4,3.6,0,0,TAU); ctx.fill();
    ctx.fillStyle='#7a5c3a';                       // lábak
    for(const lx of [-3.4,-1,1.6,4]) ctx.fillRect(lx,-3,1.2,4);
    ctx.fillStyle='#8a6a44';                       // nyak és fej
    ctx.save(); ctx.translate(5,-7); ctx.rotate(o.riadt>0?-0.5:0.35);
    ctx.fillRect(0,-4.4,2,5);
    ctx.beginPath(); ctx.ellipse(1,-5.4,2.4,1.8,0,0,TAU); ctx.fill();
    ctx.strokeStyle='#6a4e30'; ctx.lineWidth=0.8;  // agancs
    ctx.beginPath(); ctx.moveTo(1,-6.8); ctx.lineTo(0,-9.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2,-6.8); ctx.lineTo(3.2,-9.2); ctx.stroke();
    ctx.restore();
    ctx.fillStyle='#e8e0cc';                       // farok
    ctx.beginPath(); ctx.ellipse(-6,-6,1.6,1.2,0,0,TAU); ctx.fill();
    ctx.restore();
  }
  // sirályok
  for(const s of W.siraly){
    const x=s.x-G.cam.x, y=s.y-G.cam.y;
    if(x<-30||y<-30||x>G.vw+30||y>G.vh+30) continue;
    if(fogAt(s.x,s.y)<1) continue;
    const sz=Math.sin(G.t*8+s.a*3)*0.5+0.5;
    ctx.strokeStyle='rgba(245,245,238,.9)'; ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(x-4,y-14+sz*2); ctx.quadraticCurveTo(x,y-17+sz*3,x+4,y-14+sz*2);
    ctx.stroke();
    ctx.fillStyle='rgba(20,26,16,.14)';
    ctx.beginPath(); ctx.ellipse(x,y,3.4,1.4,0,0,TAU); ctx.fill();
  }
}
/* A madarak MINDEN fölött repülnek: külön hívás a köd után. */
function drawBirds(){
  if(REDUCED||G.lowFx||!G.wild) return;
  for(const m of G.wild.madar){
    for(let i=0;i<m.db;i++){
      const ex=(i-(m.db-1)/2)*11, ey=Math.abs(i-(m.db-1)/2)*7;
      const x=m.x+ex-G.cam.x, y=m.y+ey-m.mag-G.cam.y;
      if(x<-20||y<-20||x>G.vw+20||y>G.vh+20) continue;
      const sz=Math.sin(m.fazis+i*0.7);
      ctx.strokeStyle='rgba(38,34,30,.72)'; ctx.lineWidth=1.4;
      ctx.beginPath();
      ctx.moveTo(x-3.4,y+sz*1.6); ctx.quadraticCurveTo(x,y-2.4+sz*1.2,x+3.4,y+sz*1.6);
      ctx.stroke();
      // árnyék a földön, ha nem éjszaka
      if(typeof nightFactor!=='function'||nightFactor()<0.5){
        ctx.fillStyle='rgba(20,26,16,.10)';
        ctx.beginPath(); ctx.ellipse(x+6,y+m.mag,3,1.2,0,0,TAU); ctx.fill();
      }
    }
  }
}
