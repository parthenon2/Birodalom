/* =======================================================================
   14/D. APRÓ RÉSZLETEK

   Hat dolog, ami külön-külön semmiség, együtt viszont lakottá teszi a tájat:

     SÉRÜLÉS    — az épületen az életereje arányában jelennek meg repedések,
                  hiányzó cserép, kormos foltok, végül füst
     KELLÉKEK   — farakás a kaszárnyánál, szénakazal és kerítés a majorságnál,
                  kút a házaknál, hordók a kikötőnél
     JÓSZÁG     — birkák legelnek a majorságok körül
     CIVILEK    — a lakóházak között emberek járkálnak

   Minden épülethez ugyanaz a kép tartozik minden alkalommal: az elrendezést
   az épület azonosítójából sorsoljuk, nem képkockánként.
   ===================================================================== */

/* --- Sérülés --- */
function drawDamage(b,sx,sy,H){
  if(REDUCED||!b.done) return;
  const p=b.hp/b.maxHp;
  if(p>0.85) return;
  const R=seedRand('dmg'+b.id);
  const suly=1-p;                       // 0 (ép) .. 1 (romokban)
  ctx.save();
  ctx.translate(sx,sy);
  // repedések a falon
  ctx.strokeStyle='rgba(28,22,16,'+(0.5*suly).toFixed(2)+')';
  ctx.lineWidth=1.2;
  const db=Math.round(2+suly*5);
  for(let i=0;i<db;i++){
    const x0=(R()-0.5)*b.w*0.8, y0=-H*R()*0.9;
    ctx.beginPath();
    ctx.moveTo(x0,y0);
    let x=x0,y=y0;
    for(let s=0;s<3;s++){
      x+=(R()-0.5)*9; y+=4+R()*7;
      ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  // kormos foltok
  if(suly>0.35){
    ctx.fillStyle='rgba(24,20,16,'+(0.3*suly).toFixed(2)+')';
    for(let i=0;i<Math.round(suly*4);i++){
      const x=(R()-0.5)*b.w*0.9, y=-H*(0.2+R()*0.7);
      ctx.beginPath(); ctx.ellipse(x,y,5+R()*8,4+R()*6,R()*TAU,0,TAU); ctx.fill();
    }
  }
  // hiányzó tetőcserép: kis lyukak a tető vonalában
  if(suly>0.5){
    ctx.fillStyle='rgba(20,16,12,.5)';
    for(let i=0;i<Math.round((suly-0.5)*8);i++){
      const x=(R()-0.5)*b.w*0.7, y=-H+(R()*8);
      ctx.fillRect(x,y,3+R()*4,2.4+R()*2);
    }
  }
  ctx.restore();
  // füst a súlyosan sérült épületből
  if(suly>0.6&&!G.lowFx&&Math.random()<0.06){
    G.fx.push({x:b.x+(Math.random()-0.5)*b.w*0.5, y:b.y-H*0.7,
               t:0, life:1.4, type:'fust'});
  }
}

/* --- Kellékek az épületek körül --- */
function drawProps(b,sx,sy,H){
  if(REDUCED||G.lowFx||!b.done) return;
  const R=seedRand('prop'+b.id);
  ctx.save();
  ctx.translate(sx,sy);
  if(b.type==='farm'){
    // kerítés a majorság körül
    ctx.strokeStyle='rgba(122,96,58,.85)'; ctx.lineWidth=1.6;
    const kw=b.w*0.62, kh=b.h*0.5;
    for(let i=-3;i<=3;i++){
      const x=i*(kw/3);
      ctx.beginPath(); ctx.moveTo(x,kh); ctx.lineTo(x,kh-6); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(-kw,kh-3.4); ctx.lineTo(kw,kh-3.4); ctx.stroke();
    // szénakazal
    ctx.fillStyle='#c8a44e';
    ctx.beginPath(); ctx.ellipse(b.w*0.42,b.h*0.28,7,5,0,0,TAU); ctx.fill();
    ctx.fillStyle='#b08c38';
    ctx.beginPath(); ctx.ellipse(b.w*0.42,b.h*0.34,7,2.6,0,0,TAU); ctx.fill();
  }else if(b.type==='barracks'||b.type==='smith'){
    // farakás
    ctx.fillStyle='#6a4a2c';
    for(let i=0;i<3;i++)
      for(let j=0;j<2-Math.floor(i/2);j++)
        ctx.fillRect(-b.w*0.5-10+i*5, b.h*0.2-j*4.4, 4.4, 4);
    ctx.fillStyle='#8a6a44';
    for(let i=0;i<3;i++) ctx.fillRect(-b.w*0.5-10+i*5, b.h*0.2-4.4*(2-Math.floor(i/2))+1, 4.4, 1.4);
  }else if(b.type==='house'||b.type==='hq'){
    // kút
    const wx=b.w*0.5+9, wy=b.h*0.24;
    ctx.fillStyle='#8a8a84';
    ctx.beginPath(); ctx.ellipse(wx,wy,6,3.4,0,0,TAU); ctx.fill();
    ctx.fillStyle='#2a2a26';
    ctx.beginPath(); ctx.ellipse(wx,wy-0.6,4,2.2,0,0,TAU); ctx.fill();
    ctx.strokeStyle='#6a4a2c'; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.moveTo(wx-4,wy-2); ctx.lineTo(wx-4,wy-11); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx+4,wy-2); ctx.lineTo(wx+4,wy-11); ctx.stroke();
    ctx.fillStyle='#7a5a34';
    ctx.beginPath();
    ctx.moveTo(wx-6,wy-10); ctx.lineTo(wx,wy-15); ctx.lineTo(wx+6,wy-10);
    ctx.closePath(); ctx.fill();
  }else if(b.type==='harbor'){
    // hordók és kötélcsomó a mólón
    for(let i=0;i<3;i++){
      const x=-b.w*0.4+i*11, y=b.h*0.26+(i%2)*3;
      ctx.fillStyle='#7a5a34';
      ctx.beginPath(); ctx.ellipse(x,y,4,5,0,0,TAU); ctx.fill();
      ctx.strokeStyle='#5a4028'; ctx.lineWidth=0.9;
      ctx.beginPath(); ctx.moveTo(x-4,y); ctx.lineTo(x+4,y); ctx.stroke();
    }
  }else if(b.type==='market'){
    // ládák és zsákok a piac előtt
    ctx.fillStyle='#8a6a42';
    ctx.fillRect(b.w*0.36,b.h*0.14,9,7);
    ctx.fillStyle='#c8b487';
    ctx.beginPath(); ctx.ellipse(b.w*0.36+14,b.h*0.24,4.4,5.4,0.1,0,TAU); ctx.fill();
  }
  ctx.restore();
}

/* --- Jószág és civilek --- */
function livestockInit(){
  G.stock=[]; G.civil=[];
  const R=seedRand('stock'+(G.decoSeed||1));
  for(const b of G.builds){
    if(b.dead) continue;
    if(b.type==='farm'&&G.stock.length<14){
      const db=1+Math.floor(R()*2);
      for(let i=0;i<db;i++)
        G.stock.push({x:b.x+(R()-0.5)*90, y:b.y+30+R()*50, t:R()*8,
                      face:R()*TAU, v:0, owner:b.owner});
    }
    if((b.type==='house'||b.type==='hq')&&G.civil.length<10){
      G.civil.push({x:b.x+(R()-0.5)*50, y:b.y+30+R()*40, t:R()*6,
                    face:R()*TAU, v:0, owner:b.owner, szin:R()});
    }
  }
}
function livestockTick(dt){
  if(!G.on||REDUCED||G.lowFx) return;
  if(!G.stock) livestockInit();
  for(const lista of [G.stock,G.civil]){
    for(const a of lista){
      a.t-=dt;
      if(a.t<=0){ a.t=3+Math.random()*6; a.face=Math.random()*TAU;
                  a.v=(Math.random()<0.5)?(lista===G.civil?18:9):0; }
      a.x+=Math.cos(a.face)*a.v*dt;
      a.y+=Math.sin(a.face)*a.v*dt;
      a.x=clamp(a.x,30,WORLD.w-30); a.y=clamp(a.y,30,WORLD.h-30);
    }
  }
}
function drawLivestock(){
  if(REDUCED||G.lowFx||G.pirate||!G.stock) return;  // stratégiai nézetben nincs
  for(const s of G.stock){
    const x=s.x-G.cam.x, y=s.y-G.cam.y;
    if(x<-20||y<-20||x>G.vw+20||y>G.vh+20) continue;
    if(fogAt(s.x,s.y)<1) continue;
    ctx.fillStyle='rgba(20,26,16,.2)';
    ctx.beginPath(); ctx.ellipse(x,y+1,5,2,0,0,TAU); ctx.fill();
    ctx.fillStyle='#e8e4d8';                        // birka gyapja
    ctx.beginPath(); ctx.ellipse(x,y-3.4,4.6,3.2,0,0,TAU); ctx.fill();
    ctx.fillStyle='#3a3630';                        // fej és lábak
    const j=Math.cos(s.face)>=0?1:-1;
    ctx.beginPath(); ctx.ellipse(x+j*4.4,y-4.4,1.8,1.5,0,0,TAU); ctx.fill();
    ctx.fillRect(x-2.4,y-1.4,1,2); ctx.fillRect(x+1.4,y-1.4,1,2);
  }
  for(const c of G.civil){
    const x=c.x-G.cam.x, y=c.y-G.cam.y;
    if(x<-20||y<-20||x>G.vw+20||y>G.vh+20) continue;
    if(fogAt(c.x,c.y)<1) continue;
    ctx.fillStyle='rgba(20,26,16,.18)';
    ctx.beginPath(); ctx.ellipse(x,y+1,3.4,1.4,0,0,TAU); ctx.fill();
    ctx.fillStyle=(c.szin<0.33)?'#7a6a4a':((c.szin<0.66)?'#6a5a6a':'#5a6a5a');
    ctx.beginPath();
    ctx.moveTo(x-2.6,y); ctx.lineTo(x-2,y-7); ctx.lineTo(x+2,y-7); ctx.lineTo(x+2.6,y);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle='#d8b48c';
    ctx.beginPath(); ctx.arc(x,y-8.6,2,0,TAU); ctx.fill();
  }
}
