/* =======================================================================
   16. RAJZOLÁS — lövedékek, effektek, kijelölőkeret, építés-előnézet
   ===================================================================== */
function drawProj(p){
  if(p.bomb){                                    // zuhanó bomba, alatta árnyék
    const x=p.x-G.cam.x, y=p.y-G.cam.y;
    const k=Math.min(1,p.fall/p.fallT);
    ctx.fillStyle='rgba(0,0,0,'+(0.1+k*0.24)+')';
    ctx.beginPath(); ctx.ellipse(x,y,7-k*3.4,3.4-k*1.6,0,0,TAU); ctx.fill();
    const by=y-p.z;
    ctx.save(); ctx.translate(x,by); ctx.rotate(0.4+k*1.1);
    ctx.fillStyle='#5a6058';
    ctx.beginPath(); ctx.ellipse(0,0,3.4,6.4,0,0,TAU); ctx.fill();
    ctx.fillStyle='#3e433c';                     // vezérsíkok
    ctx.beginPath();
    ctx.moveTo(-3,5); ctx.lineTo(0,9); ctx.lineTo(3,5); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.25)';
    ctx.beginPath(); ctx.ellipse(-1.2,-1.6,1.1,2.6,0,0,TAU); ctx.fill();
    ctx.restore();
    return;
  }
  const x=p.x-G.cam.x,y=p.y-G.cam.y;
  ctx.save(); ctx.translate(x,y); ctx.rotate(p.ang||0);
  if(p.style==='arrow'){ctx.strokeStyle='#e6dcc0';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(5,0);ctx.stroke();}
  else if(p.style==='ball'){ctx.fillStyle='#2b2b2b';ctx.beginPath();ctx.arc(0,0,2.6,0,TAU);ctx.fill();}
  else{ctx.strokeStyle='rgba(255,215,120,.95)';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(4,0);ctx.stroke();}
  ctx.restore();
}
function drawFx(f){
  if(f.t<0) return;                 // késleltetett effektus: még nem szólalt meg
  const x=f.x-G.cam.x,y=f.y-G.cam.y, k=f.t/f.life;
  if(f.type==='atom'){ drawAtomFx(f); return; }
  if(typeof drawBroadsideFx==='function'&&drawBroadsideFx(f,x,y,k)) return;
  if(f.type==='partra'){
    // Partraszállás: fehér vízfröccsenés + két terjedő gyűrű
    const iv=Math.sin(k*Math.PI);
    const a1=Math.max(0,0.9-k*1.1);
    ctx.fillStyle='rgba(230,242,248,'+a1+')';
    ctx.beginPath();
    ctx.ellipse(x,y-iv*14,(f.r||8)*(0.4+iv*0.6),(f.r||8)*(0.2+iv*0.3),0,0,TAU);
    ctx.fill();
    // belső gyűrű
    ctx.strokeStyle='rgba(200,230,245,'+(Math.max(0,0.7-k*0.9))+')';
    ctx.lineWidth=1.8;
    ctx.beginPath(); ctx.ellipse(x,y,6+k*22,(6+k*22)*0.38,0,0,TAU); ctx.stroke();
    // külső gyűrű, késleltetve
    if(k>0.18){
      const k2=(k-0.18)/0.82;
      ctx.strokeStyle='rgba(180,220,238,'+(Math.max(0,0.45-k2*0.5))+')';
      ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.ellipse(x,y,14+k2*34,(14+k2*34)*0.35,0,0,TAU); ctx.stroke();
    }
    return;
  }
  if(f.type==='por'){
    const r=(3+k*9)*(f.ero||1);
    ctx.fillStyle='rgba(168,150,116,'+(0.26*(1-k)*(f.ero||1)).toFixed(3)+')';
    ctx.beginPath(); ctx.ellipse(x,y-k*4,r,r*0.55,0,0,TAU); ctx.fill();
    return;
  }
  if(f.type==='hal'){
    // kiugró hal: rövid ív, majd terjedő gyűrű a vízen
    const iv=Math.sin(k*Math.PI);
    ctx.fillStyle='rgba(180,200,210,'+(0.8*(1-k*0.4))+')';
    ctx.beginPath();
    ctx.ellipse(x,y-iv*9,3.2,1.6,-0.5+iv,0,TAU); ctx.fill();
    ctx.strokeStyle='rgba(220,235,240,'+(0.5*(1-k))+')'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.ellipse(x,y,4+k*16,(4+k*16)*0.4,0,0,TAU); ctx.stroke();
    return;
  }
  if(f.type==='fust'){
    const r=4+k*13;
    ctx.fillStyle='rgba(78,72,66,'+(0.4*(1-k))+')';
    ctx.beginPath(); ctx.arc(x,y-k*10,r,0,TAU); ctx.fill();
    return;
  }
  if(f.type==='bomb'){                           // becsapódás: tűzgömb és por
    const r=BOMB_R*(0.3+k*1.1);
    ctx.fillStyle='rgba(255,196,90,'+Math.max(0,0.85-k*1.2)+')';
    ctx.beginPath(); ctx.arc(x,y-6,r*0.5,0,TAU); ctx.fill();
    ctx.fillStyle='rgba(90,80,66,'+Math.max(0,0.6-k*0.7)+')';
    ctx.beginPath(); ctx.ellipse(x,y,r,r*0.5,0,0,TAU); ctx.fill();
    ctx.strokeStyle='rgba(255,230,170,'+Math.max(0,0.7-k*1.4)+')'; ctx.lineWidth=2.4;
    ctx.beginPath(); ctx.arc(x,y,r*1.2,0,TAU); ctx.stroke();
    return;
  }
  if(f.type==='hit'){
    ctx.strokeStyle='rgba(255,240,190,'+(1-k)+')'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(x,y,5+k*10,0,TAU); ctx.stroke();
  }else{
    ctx.fillStyle='rgba(210,120,50,'+(0.55*(1-k))+')';
    ctx.beginPath(); ctx.arc(x,y,(f.r||14)*(0.5+k*1.4),0,TAU); ctx.fill();
    ctx.fillStyle='rgba(40,35,30,'+(0.4*(1-k))+')';
    ctx.beginPath(); ctx.arc(x,y-k*8,(f.r||14)*(0.3+k),0,TAU); ctx.fill();
  }
}
// Atomrobbanás: villanás, gombafelhő, lökéshullám
function drawAtomFx(f){
  const k=f.t/f.life, x=f.x-G.cam.x, y=f.y-G.cam.y;
  if(k<0.08){                                        // vakító villanás
    ctx.fillStyle='rgba(255,252,235,'+(1-k/0.08)*0.9+')';
    ctx.fillRect(0,0,G.vw,G.vh);
  }
  const R=ATOM_R;
  ctx.strokeStyle='rgba(255,220,150,'+Math.max(0,0.8-k*1.6)+')';  // lökéshullám
  ctx.lineWidth=4;
  ctx.beginPath(); ctx.arc(x,y,R*(0.3+k*2.4),0,TAU); ctx.stroke();
  const rise=k*90;
  ctx.fillStyle='rgba(214,150,70,'+Math.max(0,0.75-k*0.8)+')';    // tűzgömb
  ctx.beginPath(); ctx.arc(x,y-rise*0.9,R*(0.5+k*0.5),0,TAU); ctx.fill();
  ctx.fillStyle='rgba(90,78,64,'+Math.max(0,0.7-k*0.7)+')';       // gombafelhő
  ctx.beginPath(); ctx.ellipse(x,y-40-rise,R*(0.7+k*0.9),R*(0.35+k*0.4),0,0,TAU); ctx.fill();
  ctx.fillStyle='rgba(110,96,78,'+Math.max(0,0.6-k*0.6)+')';      // oszlop
  ctx.fillRect(x-R*0.16,y-40-rise,R*0.32,40+rise);
  ctx.fillStyle='rgba(140,124,100,'+Math.max(0,0.5-k*0.5)+')';    // por a talajon
  ctx.beginPath(); ctx.ellipse(x,y+4,R*(1+k*1.4),R*(0.4+k*0.5),0,0,TAU); ctx.fill();
}
function drawPlaceGhost(){
  // Falsor húzása közben az egész vonalat előre mutatjuk
  if(G.wallDrag){
    const list=wallLine(G.wallDrag.x0,G.wallDrag.y0,G.wallDrag.x1,G.wallDrag.y1);
    const d=BUILDS.wall;
    let money=G.res.stone;
    const cost=buildCost('wall',G.age,ENID).stone||0;
    for(const p of list){
      const free=freeSpot(p.x,p.y,d.w,d.h,padFor('wall'))&&inBuildRange(p.x,p.y,ENID,'wall').ok;
      const afford=money>=cost;
      if(free&&afford) money-=cost;
      ctx.fillStyle=(free&&afford)?'rgba(150,220,150,.28)':'rgba(220,120,110,.28)';
      ctx.fillRect(p.x-d.w/2-G.cam.x,p.y-d.h/2-G.cam.y,d.w,d.h);
      ctx.strokeStyle=(free&&afford)?'rgba(180,240,180,.6)':'rgba(240,150,140,.6)';
      ctx.lineWidth=1;
      ctx.strokeRect(p.x-d.w/2-G.cam.x+.5,p.y-d.h/2-G.cam.y+.5,d.w-1,d.h-1);
    }
    ctx.fillStyle='rgba(20,16,12,.8)';
    ctx.fillRect(G.wallDrag.x1-G.cam.x-26,G.wallDrag.y1-G.cam.y-30,52,16);
    ctx.fillStyle='#e8dcc0'; ctx.font='11px sans-serif'; ctx.textAlign='center';
    ctx.fillText(list.length+' szakasz',G.wallDrag.x1-G.cam.x,G.wallDrag.y1-G.cam.y-19);
    ctx.textAlign='left';
    return;
  }
  if(!G.place) return;
  const d=BUILDS[G.place], gx=snap(G.mouse.wx,G.place), gy=snap(G.mouse.wy,G.place);
  const ok=freeSpot(gx,gy,d.w,d.h,padFor(G.place))&&canPay(buildCost(G.place,G.age,ENID))
           &&inBuildRange(gx,gy,ENID,G.place).ok&&(!d.shore||isShore(gx,gy));
  // az építési hatókör pereme
  ctx.strokeStyle=ok?'rgba(150,220,150,.22)':'rgba(220,120,110,.22)';
  ctx.lineWidth=2; ctx.setLineDash([7,7]);
  for(const b of G.builds){
    if(b.dead||b.owner!==0) continue;
    ctx.beginPath();
    ctx.arc(b.x-G.cam.x,b.y-G.cam.y,BUILD_REACH+Math.max(b.w,b.h)*0.5,0,TAU);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.save();
  ctx.globalAlpha=.55;
  ctx.fillStyle=ok?'rgba(120,200,120,.5)':'rgba(200,80,70,.5)';
  ctx.fillRect(gx-d.w/2-G.cam.x,gy-d.h/2-G.cam.y,d.w,d.h);
  ctx.globalAlpha=1;
  ctx.strokeStyle=ok?'#8fe08f':'#e08a80'; ctx.lineWidth=2;
  ctx.strokeRect(gx-d.w/2-G.cam.x,gy-d.h/2-G.cam.y,d.w,d.h);
  ctx.restore();
}
function drawSelBox(){
  if(!G.mouse.dragging) return;
  const x=Math.min(G.mouse.sx,G.mouse.x), y=Math.min(G.mouse.sy,G.mouse.y);
  const w=Math.abs(G.mouse.x-G.mouse.sx), h=Math.abs(G.mouse.y-G.mouse.sy);
  ctx.fillStyle='rgba(220,200,140,.12)'; ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='rgba(230,215,160,.85)'; ctx.lineWidth=1; ctx.strokeRect(x+.5,y+.5,w,h);
}
