/* =======================================================================
   16/B. ELESETTEK ÉS RONCSOK RAJZOLÁSA

   Az elesett katona a földre dől, alatta vértócsa terül szét. A lezuhanó
   repülő füstcsíkot húz maga után, becsapódáskor kigyullad, és a lángok
   lassan kialszanak. Minden idővel elhalványul.
   ===================================================================== */
function updateRemains(dt){
  const C=G.corpses;
  if(C) for(let i=C.length-1;i>=0;i--){
    const c=C[i];
    c.t+=dt;
    if(c.dol<1) c.dol=Math.min(1,c.dol+dt*3.4);   // eldőlés fél másodperc alatt
    if(c.t>c.life) C.splice(i,1);
  }
  const W=G.wrecks;
  if(W) for(let i=W.length-1;i>=0;i--){
    const w=W[i];
    w.t+=dt;
    if(!w.becsapodott){
      w.vz+=150*dt;                                // gyorsuló zuhanás
      w.z-=w.vz*dt;
      w.x+=w.vx*dt; w.y+=w.vy*dt;
      w.face+=w.forg*dt;
      if(w.t%0.09<dt)                              // füstpamacsok a nyomában
        G.fx.push({x:w.x,y:w.y-w.z,t:0,life:1.1,type:'fust'});
      if(w.z<=0){
        w.z=0; w.becsapodott=true; w.tuzT=0;
        G.fx.push({x:w.x,y:w.y,t:0,life:0.8,type:'bomb'});
        G.shake=Math.max(G.shake||0,0.55);
        if(typeof playSample==='function') playSample('becsapodas',w.x,w.y,0.85);
        G.scorch=G.scorch||[];
        G.scorch.push({x:w.x,y:w.y,r:26});          // kiégett folt marad
      }
    }
    if(w.t>w.life) W.splice(i,1);
  }
}
function drawCorpse(c){
  const x=c.x-G.cam.x, y=c.y-G.cam.y;
  if(x<-50||y<-50||x>G.vw+50||y>G.vh+50) return;
  const halv=Math.min(1,Math.max(0,(c.life-c.t)/6));  // az utolsó hat mp-ben halványul
  ctx.save();
  ctx.globalAlpha=halv;
  // vértócsa: a dőléssel együtt terül szét
  const r=(c.r*0.9+4)*c.dol;
  ctx.fillStyle='rgba(112,22,20,.55)';
  ctx.beginPath(); ctx.ellipse(x,y+2,r*1.25,r*0.55,0,0,TAU); ctx.fill();
  ctx.fillStyle='rgba(74,12,12,.45)';
  ctx.beginPath(); ctx.ellipse(x-r*0.3,y+3,r*0.55,r*0.26,0,0,TAU); ctx.fill();
  // az eldőlt alak: a saját sprite-ja oldalra fordítva
  // Az eldőlt alak a saját álló képe, oldalra forgatva
  const sp=(typeof unitSprite==='function')
    ? unitSprite(c.role,c.age,c.owner,'side','i') : null;
  if(sp){
    const jobbra=(Math.cos(c.face)>=0);
    ctx.translate(x,y);
    ctx.rotate((jobbra?1:-1)*1.42*c.dol);              // arra dől, amerre nézett
    ctx.scale(jobbra?1:-1,1);
    ctx.globalAlpha=halv*0.92;
    ctx.drawImage(sp,-USPR_OX,-USPR_OY,USPR_W,USPR_H);
  }
  ctx.restore();
}
function drawWreck(w){
  const x=w.x-G.cam.x, y=w.y-G.cam.y;
  if(x<-90||y<-90||x>G.vw+90||y>G.vh+90) return;
  const halv=Math.min(1,Math.max(0,(w.life-w.t)/5));
  ctx.save();
  ctx.globalAlpha=halv;
  if(!w.becsapodott){
    // árnyék a talajon, egyre közelebb
    ctx.fillStyle='rgba(0,0,0,'+(0.12+0.2*(1-w.z/AIR_ALT))+')';
    ctx.beginPath(); ctx.ellipse(x,y,12,5,0,0,TAU); ctx.fill();
  }else{
    // kiégett folt és parázs
    ctx.fillStyle='rgba(28,22,16,.6)';
    ctx.beginPath(); ctx.ellipse(x,y,22,10,0,0,TAU); ctx.fill();
  }
  ctx.translate(x,y-w.z);
  ctx.rotate(w.face);
  // A gép a saját képével zuhan, becsapódás után megfeketedve
  const sp=(typeof unitSprite==='function')
    ? unitSprite(w.role,w.age,w.owner,'side','i') : null;
  if(sp){
    if(w.becsapodott&&ctx.filter!==undefined) ctx.filter='brightness(0.4)';
    ctx.drawImage(sp,-USPR_OX,-USPR_OY,USPR_W,USPR_H);
    if(ctx.filter!==undefined) ctx.filter='none';
  }
  ctx.restore();
  // lángok a becsapódás után
  if(w.becsapodott&&!G.lowFx){
    const k=Math.min(1,(w.t-0.0)/w.life);
    const ero=Math.max(0,1-k*1.3);
    for(let i=0;i<4;i++){
      const f=(G.t*3+i*1.7)%1;
      const lx=x+(i-1.5)*6+Math.sin(G.t*4+i)*3;
      const ly=y-f*(16+i*3)*ero;
      ctx.fillStyle='rgba('+(255-f*60)+','+(170-f*110)+',60,'+(0.5*(1-f)*ero)+')';
      ctx.beginPath(); ctx.ellipse(lx,ly,4.4*(1-f*0.5)*ero,7*(1-f*0.4)*ero,0,0,TAU); ctx.fill();
    }
    ctx.fillStyle='rgba(70,64,58,'+(0.22*ero)+')';
    ctx.beginPath(); ctx.ellipse(x,y-26,13,9,0,0,TAU); ctx.fill();
  }
}

/* =======================================================================
   ELSÜLLYEDŐ HAJÓ

   Az elsüllyedt hajó után eddig emberi holttest maradt a vízen — az
   elesettek rendszere minden egységre ugyanazt csinálta. Most a hajó
   megdől, lassan elmerül, közben törmelék és olajfolt marad utána,
   végül a víz összezárul fölötte.
   ===================================================================== */
const SINK_IDO=6.5;             // ennyi idő alatt merül el

function sinkShip(u){
  if(REDUCED) return;
  G.sinks=G.sinks||[];
  while(G.sinks.length>=14) G.sinks.shift();
  G.sinks.push({
    x:u.x, y:u.y, face:u.face||0, t:0, life:SINK_IDO,
    r:u.r||14, galleon:!!u.galleon, dol:(Math.random()<0.5?-1:1),
    owner:u.owner, seed:(Math.random()*1000)|0
  });
  // a süllyedés pillanata: hab és törmelék
  for(let i=0;i<8;i++)
    G.fx.push({x:u.x+rnd(-u.r,u.r), y:u.y+rnd(-u.r*0.6,u.r*0.6),
               t:0, life:0.9+Math.random()*0.5, type:'agyufust', r:5,
               vx:rnd(-14,14), vy:rnd(-14,14)});
  SFX.at('destroy',u.x,u.y,0.7);
}
function updateSinks(dt){
  if(!G.sinks) return;
  for(let i=G.sinks.length-1;i>=0;i--){
    const s=G.sinks[i];
    s.t+=dt;
    if(s.t>=s.life) G.sinks.splice(i,1);
  }
}
function drawSinks(){
  if(!G.sinks||REDUCED) return;
  for(const s of G.sinks){
    const x=s.x-G.cam.x, y=s.y-G.cam.y;
    if(x<-60||y<-60||x>G.vw+60||y>G.vh+60) continue;
    const k=s.t/s.life;                       // 0 = most süllyed, 1 = eltűnt
    ctx.save();
    ctx.translate(x,y);
    // terjedő gyűrű a becsapódás körül
    if(k<0.5){
      ctx.strokeStyle='rgba(226,240,244,'+(0.5*(1-k*2))+')';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.ellipse(0,0,(s.r+6)+k*70,((s.r+6)+k*70)*0.4,0,0,TAU);
      ctx.stroke();
    }
    // olajfolt, ami szétterül és halványul
    ctx.fillStyle='rgba(24,28,34,'+(0.30*(1-k))+')';
    ctx.beginPath();
    ctx.ellipse(0,0,s.r*(1.1+k*1.9),s.r*(0.5+k*0.8),0,0,TAU);
    ctx.fill();
    // a hajótest: megdől és elmerül
    if(k<0.8){
      const merul=k/0.8;
      ctx.save();
      ctx.rotate(s.face);
      ctx.scale(1,1-merul*0.75);              // lapul, ahogy a víz alá megy
      ctx.rotate(s.dol*merul*0.5);            // oldalra dől
      ctx.globalAlpha=1-merul*0.85;
      const L=s.galleon?26:19, H=s.galleon?7:5.5;
      ctx.fillStyle='#4a3a24';
      ctx.beginPath();
      ctx.moveTo(-L,-H*0.2); ctx.quadraticCurveTo(-L*0.5,H,0,H);
      ctx.quadraticCurveTo(L*0.6,H,L,-H*0.2);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle='#3a2c1c';
      ctx.fillRect(-L*0.7,-H*0.4,L*1.4,1.6);
      // a törött árboc még kilóg a vízből
      if(merul<0.6){
        ctx.strokeStyle='#6a5030'; ctx.lineWidth=2;
        ctx.beginPath();
        ctx.moveTo(0,-H*0.3);
        ctx.lineTo(s.dol*7*(1+merul), -16*(1-merul));
        ctx.stroke();
      }
      ctx.restore();
    }
    // úszó törmelék a végén
    if(k>0.3){
      const R=seedRand('roncs'+s.seed);
      ctx.fillStyle='rgba(90,70,44,'+(0.6*(1-k))+')';
      for(let i=0;i<5;i++){
        const a=R()*TAU, d=(s.r+8)+R()*26*k;
        ctx.save();
        ctx.translate(Math.cos(a)*d, Math.sin(a)*d*0.45);
        ctx.rotate(a);
        ctx.fillRect(-3.5,-1,7,2);
        ctx.restore();
      }
    }
    ctx.restore();
  }
}
