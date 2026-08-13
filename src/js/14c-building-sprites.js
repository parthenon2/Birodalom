/* =======================================================================
   Sprite gyorsítótár
   ===================================================================== */
const SPRITES={};
const SPR_DPR=Math.min(window.devicePixelRatio||1,2);
function getSprite(type,age,owner){
  const key=type+'|'+age+'|'+owner+'|'+((typeof nationOf==='function')?nationOf(owner):(owner?(G.ai&&G.ai.nation||'de'):G.nation));
  if(SPRITES[key]) return SPRITES[key];
  const d=BUILDS[type], H=bhOf(type,age);
  // A 15. századi őrtorony kúptetője és szélkakasa magasra nyúlik, ezért
  // annak több hely kell felül.
  const padT=(type==='tower'&&age===0)?120:64;
  const padL=46,padR=52,padB=34;
  const cw=d.w+padL+padR, ch=d.h+H+padT+padB;
  const cn=document.createElement('canvas');
  cn.width=Math.ceil(cw*SPR_DPR); cn.height=Math.ceil(ch*SPR_DPR);
  const cg=cn.getContext('2d');
  cg.setTransform(SPR_DPR,0,0,SPR_DPR,0,0);
  const ox=padL+d.w/2, oy=padT+H+d.h/2;     // az épület talpának középpontja
  cg.translate(ox,oy);
  const prev=GX; GX=cg;
  SHADOW_BAKE=true;                        // az árnyék élőben készül, nem a képbe
  PAINT[type](d.w,d.h,H,age,owner,seedRand(key));
  SHADOW_BAKE=false;
  natOverlay(type,d.w,d.h,H,age,owner,seedRand(key+'n'));   // nemzeti karakter
  GX=prev;
  const sp={img:cn,ox,oy,w:cw,h:ch};
  SPRITES[key]=sp; return sp;
}

/* =======================================================================
   Dinamikus rétegek: füst, sérülés, zászló, állványzat
   ===================================================================== */
// Aki rendszerszinten kérte a csökkentett mozgást, annak visszafogjuk a füstöt
// és a lobogást — a játszhatóság nem sérül, csak a nyugtalanság tűnik el.
const REDUCED=(typeof matchMedia==='function')&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function chimneySmoke(sx,sy,seed,scale){
  if(REDUCED||G.lowFx) return;
  for(let i=0;i<4;i++){
    const t=((G.t*0.35)+i*0.25+seed)%1;
    const a=(1-t)*0.30;
    if(a<=0) continue;
    GX.fillStyle='rgba(190,190,185,'+a+')';
    GX.beginPath();
    GX.arc(sx+Math.sin(t*5+seed*6)*7*t, sy-t*34*scale, (3+t*9)*scale, 0, TAU);
    GX.fill();
  }
}
function damageOverlay(b,sx,sy){
  const p=b.hp/b.maxHp;
  if(p>0.62) return;
  const rand=seedRand('dmg'+b.x+b.y);
  GX.save(); GX.translate(sx,sy);
  GX.strokeStyle='rgba(20,16,12,'+(0.55*(1-p))+')'; GX.lineWidth=1.6;
  const n=Math.round((1-p)*7);
  for(let i=0;i<n;i++){
    let x=(rand()-0.5)*b.w*0.8, y=(rand()-0.4)*b.h*0.8;
    GX.beginPath(); GX.moveTo(x,y);
    for(let j=0;j<4;j++){x+=(rand()-0.5)*11;y+=rand()*8;GX.lineTo(x,y);}
    GX.stroke();
  }
  if(p<0.34){                                   // égés és füst
    GX.fillStyle='rgba(60,50,45,.18)';
    GX.beginPath(); GX.ellipse(0,0,b.w*0.4,b.h*0.34,0,0,TAU); GX.fill();
    chimneySmoke((rand()-0.5)*b.w*0.4,-b.h*0.2,rand(),1.3);
    const f=0.5+Math.sin(G.t*9+b.x)*0.5;
    GX.fillStyle='rgba(228,140,50,'+(0.35+f*0.3)+')';
    GX.beginPath(); GX.ellipse(b.w*0.16,-b.h*0.1,4+f*3,7+f*4,0,0,TAU); GX.fill();
  }
  GX.restore();
}
// Amíg egyetlen munkás sem ért oda, csak a kitűzött telek látszik: cövekek,
// kifeszített zsinór és a felásott föld. Állvány még nem áll.
function markedSite(b,sx,sy){
  const w=b.w,h=b.h;
  GX.save(); GX.translate(sx,sy);
  GX.fillStyle='rgba(96,78,50,.42)';
  GX.beginPath(); GX.ellipse(0,2,w*0.56,h*0.36,0,0,TAU); GX.fill();
  GX.strokeStyle='rgba(120,98,62,.5)'; GX.lineWidth=1;
  GX.setLineDash([5,4]);
  GX.strokeRect(-w/2,-h/2,w,h);                  // a leendő alaprajz
  GX.setLineDash([]);
  const cs=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
  GX.strokeStyle='#d8c89a'; GX.lineWidth=1.2;    // kifeszített zsinór
  GX.beginPath();
  for(let i=0;i<4;i++){
    const a=cs[i], c=cs[(i+1)%4];
    GX.moveTo(a[0],a[1]-9); GX.lineTo(c[0],c[1]-9);
  }
  GX.stroke();
  for(const c of cs){                            // cövekek
    GX.fillStyle='#7a5a30'; GX.fillRect(c[0]-1.6,c[1]-12,3.2,12);
    GX.fillStyle='rgba(255,240,205,.25)'; GX.fillRect(c[0]-1.6,c[1]-12,1.4,12);
    GX.fillStyle='#5e4423'; GX.fillRect(c[0]-2.4,c[1]-13,4.8,2);
  }
  // kiterített tervrajz és néhány szerszám
  GX.fillStyle='#e8dfc4';
  GX.save(); GX.translate(-w*0.2,h/2-4); GX.rotate(-0.2);
  GX.fillRect(-7,-5,14,10);
  GX.strokeStyle='rgba(90,70,45,.55)'; GX.lineWidth=0.8;
  GX.strokeRect(-4.5,-3,9,6);
  GX.restore();
  GX.strokeStyle='#6b4a2c'; GX.lineWidth=1.8;
  GX.beginPath(); GX.moveTo(w*0.18,h/2-2); GX.lineTo(w*0.3,h/2-12); GX.stroke();
  GX.fillStyle='#9aa1a8'; GX.fillRect(w*0.28,h/2-15,5,4);
  GX.restore();
}
// Az építkezés látványa: körbeácsolt állvány, ahogy a korabeli építkezéseken.
// A gerendaváz teljes magasságában áll az első pillanattól, az épület pedig
// alulról felfelé nő bele — a rakott kőtömbök, a gerendarakás és a kötélcsomók
// a talpazatnál mutatják, hogy itt munka folyik.
function sitePost(x,baseY,topY,wd){
  GX.fillStyle='#7a5a30'; GX.fillRect(x-wd/2,topY,wd,baseY-topY);
  GX.fillStyle='rgba(255,240,205,.20)'; GX.fillRect(x-wd/2,topY,wd*0.4,baseY-topY);
  GX.fillStyle='rgba(0,0,0,.28)'; GX.fillRect(x+wd*0.15,topY,wd*0.35,baseY-topY);
  GX.fillStyle='#5e4423'; GX.fillRect(x-wd/2-1,topY,wd+2,2.4);      // gerendavég
}
function siteBeam(x0,y0,x1,y1,wd){
  GX.strokeStyle='#8a6534'; GX.lineWidth=wd; GX.lineCap='butt';
  GX.beginPath(); GX.moveTo(x0,y0); GX.lineTo(x1,y1); GX.stroke();
  GX.strokeStyle='rgba(255,240,205,.18)'; GX.lineWidth=wd*0.4;
  GX.beginPath(); GX.moveTo(x0,y0-wd*0.28); GX.lineTo(x1,y1-wd*0.28); GX.stroke();
}
function siteLadder(x,y0,y1,wd){
  GX.strokeStyle='#6e5028'; GX.lineWidth=1.6;
  GX.beginPath(); GX.moveTo(x-wd/2,y0); GX.lineTo(x-wd/2,y1);
  GX.moveTo(x+wd/2,y0); GX.lineTo(x+wd/2,y1); GX.stroke();
  GX.lineWidth=1.2;
  const n=Math.max(2,Math.floor(Math.abs(y1-y0)/6));
  for(let i=1;i<n;i++){
    const y=y0+(y1-y0)*i/n;
    GX.beginPath(); GX.moveTo(x-wd/2,y); GX.lineTo(x+wd/2,y); GX.stroke();
  }
}
function siteRope(x,y,r){
  GX.strokeStyle='#b79a5e'; GX.lineWidth=1.5;
  for(let i=0;i<3;i++){ GX.beginPath(); GX.ellipse(x,y,r-i*1.7,(r-i*1.7)*0.45,0,0,TAU); GX.stroke(); }
}
function siteStones(x,y,n,rand){
  for(let i=0;i<n;i++){
    const px=x+(i%3)*8, py=y-Math.floor(i/3)*5;
    GX.fillStyle=i%2?'#c9c4b8':'#b5b0a4'; GX.fillRect(px,py-5,7.5,5);
    GX.fillStyle='rgba(255,255,255,.25)'; GX.fillRect(px,py-5,7.5,1.4);
    GX.fillStyle='rgba(0,0,0,.22)'; GX.fillRect(px,py-1.4,7.5,1.4);
  }
}
function siteTimber(x,y,n){
  for(let i=0;i<n;i++){
    const py=y-i*4;
    GX.fillStyle=i%2?'#8a6534':'#7a5a30'; GX.fillRect(x,py-4,26,3.6);
    GX.fillStyle='#5e4423'; GX.fillRect(x+24,py-4,2.4,3.6);
  }
}
// Az állvány két rétegben készül: ami az épület mögött van, és ami előtte
function buildSite(b,sx,sy,H,front){
  const w=b.w,h=b.h, top=-H-16;
  GX.save(); GX.translate(sx,sy);
  const backY=-h/2, frontY=h/2;
  const bx=w/2+5;
  if(!front){
    // hátsó oszlopok és korlátok
    sitePost(-bx,backY,backY+top,4.6); sitePost(bx,backY,backY+top,4.6);
    for(let i=1;i<=2;i++){
      const y=backY+top*i/2.4;
      siteBeam(-bx,y,bx,y,2.6);
    }
    siteBeam(-bx,backY+top,bx,backY+top,3.4);
    // földkupac és habarcsgödör a talpazatnál
    GX.fillStyle='rgba(92,74,48,.55)';
    GX.beginPath(); GX.ellipse(0,frontY-2,w*0.62,h*0.34,0,0,TAU); GX.fill();
  }else{
    // elülső oszlopok, korlátok, létra és anyagok
    sitePost(-bx,frontY,frontY+top,5.2); sitePost(bx,frontY,frontY+top,5.2);
    for(let i=1;i<=2;i++){
      const y=frontY+top*i/2.4;
      siteBeam(-bx,y,bx,y,3);
      GX.fillStyle='rgba(120,95,55,.75)';                 // pallók a szinten
      for(let x=-bx+4;x<bx-6;x+=11) GX.fillRect(x,y-2.6,9,2.4);
    }
    siteBeam(-bx,frontY+top,bx,frontY+top,3.8);
    // ferde merevítők
    GX.strokeStyle='rgba(122,90,48,.85)'; GX.lineWidth=2;
    GX.beginPath();
    GX.moveTo(-bx,frontY); GX.lineTo(-bx+w*0.34,frontY+top*0.55);
    GX.moveTo(bx,frontY);  GX.lineTo(bx-w*0.34,frontY+top*0.55);
    GX.stroke();
    // oldalsó összekötők a hátsó oszlopokhoz
    GX.strokeStyle='rgba(110,84,45,.7)'; GX.lineWidth=2.2;
    GX.beginPath();
    GX.moveTo(-bx,frontY+top); GX.lineTo(-bx,backY+top);
    GX.moveTo(bx,frontY+top);  GX.lineTo(bx,backY+top);
    GX.stroke();
    siteLadder(-w*0.18,frontY+2,frontY+top*0.92,7);        // létra a szintekhez
    const rand=seedRand('site'+b.id);
    siteStones(-w*0.46,frontY+4,5,rand);                   // kifaragott kőtömbök
    siteTimber(w*0.16,frontY+5,3);                         // gerendarakás
    siteRope(w*0.44,frontY+2,4.4);                         // kötélcsomó
    siteRope(-w*0.06,frontY+7,3.6);
  }
  GX.restore();
}
/* =======================================================================
   A képernyőre rajzolás
   ===================================================================== */
// A gyülekezőpont zászlócskája: halványan mindig látszik, kijelöléskor vonallal
function drawRally(b,sx,sy,strong){
  const rx=b.rally.x-G.cam.x, ry=b.rally.y-G.cam.y;
  ctx.globalAlpha=strong?0.75:0.32;
  if(strong){
    ctx.strokeStyle='rgba(230,215,160,.7)'; ctx.lineWidth=1.4; ctx.setLineDash([4,5]);
    ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(rx,ry); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.strokeStyle='#3a3128'; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(rx,ry); ctx.lineTo(rx,ry-15); ctx.stroke();
  ctx.fillStyle=b.rally.node?'#8a6234':(b.rally.foe?'#c0392b':ownerAccent(b.owner));
  ctx.beginPath(); ctx.moveTo(rx,ry-15); ctx.lineTo(rx+10,ry-11.5); ctx.lineTo(rx,ry-8); ctx.closePath(); ctx.fill();
  ctx.globalAlpha=1;
}
function drawBuild(b){
  if(!enyemVagySzovetseges(b.owner)&&fogAt(b.x,b.y,helyiFel())===0) return;   // felderítetlenen nem látszik
  const sx=b.x-G.cam.x, sy=b.y-G.cam.y;
  if(sx<-180||sy<-200||sx>G.vw+180||sy>G.vh+180) return;
  GX=ctx;
  const H=bhOf(b.type,b.age), col=ownerColor(b.owner), acc=ownerAccent(b.owner);
  const sp=getSprite(b.type,b.age,b.owner);
  /* A vetett árnyék élőben, a nap állása szerint — a kép alá. */
  if(!REDUCED){
    ctx.save();
    ctx.translate(sx,sy);
    shadowShape(ctx,b.w,b.h,H);
    ctx.restore();
  }

  if(!b.done&&!b.started){
    // Kitűzött telek: a munka még el sem kezdődött
    GX=ctx;
    markedSite(b,sx,sy);
    ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(sx-b.w/2,sy-b.h/2-14,b.w,7);
    ctx.fillStyle='rgba(200,180,120,.7)'; ctx.font='8px sans-serif'; ctx.textAlign='center';
    ctx.fillText('munkásra vár',sx,sy-b.h/2-8);
    ctx.textAlign='left';
  }else if(!b.done){
    // Építkezés: az ácsolt állvány teljes magasságában áll, az épület pedig
    // alulról felfelé nő bele.
    GX=ctx;
    buildSite(b,sx,sy,H,false);                       // ami az épület mögött van
    const total=b.h+H, shown=total*Math.min(1,b.prog);
    ctx.save();
    ctx.beginPath(); ctx.rect(sx-sp.ox,sy+b.h/2-shown,sp.w,shown+2); ctx.clip();
    ctx.drawImage(sp.img,sx-sp.ox,sy-sp.oy,sp.w,sp.h);
    ctx.restore();
    buildSite(b,sx,sy,H,true);                        // ami előtte
    // Építési csík. Ugyanolyan széles és ugyanott ül, mint az életerő-csík,
    // hogy a kettő ne csússzon el egymáshoz képest.
    const csW=b.w*0.8;
    ctx.fillStyle='rgba(0,0,0,.6)';
    ctx.fillRect(sx-csW/2, sy-b.h/2-H-12, csW, 4);
    ctx.fillStyle='#d8b34a';
    ctx.fillRect(sx-csW/2+0.5, sy-b.h/2-H-11.5, (csW-1)*Math.min(1,Math.max(0,b.prog)), 3);
  }else{
    ctx.drawImage(sp.img,sx-sp.ox,sy-sp.oy,sp.w,sp.h);
  }

  // Kéményfüst az ipari és a modern kori épületeknél
  if(b.done){
    if(b.type==='hq'&&b.age===2){ chimneySmoke(sx-b.w*0.36,sy-b.h/2-H-26,0.1,1);
                                  chimneySmoke(sx+b.w*0.36,sy-b.h/2-H-26,0.6,1); }
    if(b.type==='barracks'&&b.age===2) chimneySmoke(sx+b.w*0.3+5,sy-b.h/2-H-16,0.3,0.8);
    if(b.type==='barracks'&&b.age===3) chimneySmoke(sx-b.w*0.36+6,sy-b.h/2-H-20,0.45,0.9);
    if(b.type==='farm'&&b.age===2) chimneySmoke(sx+b.w/2-10,sy-b.h/2-22,0.8,0.6);
  }

  // Zászló a főhadiszálláson és a kaszárnyán (élő lobogás)
  if(b.done&&(b.type==='hq'||b.type==='barracks')){
    // Időalapú fázis: a lobogás sebessége nem függ a képkockaszámtól,
    // és minden épület kicsit máskor hullámzik.
    b.flag=REDUCED?0:(G.t*2.6+(b.id||0)*0.9);
    const nat=(typeof nationOf==='function')?nationOf(b.owner):(b.owner?(G.ai?G.ai.nation:'de'):G.nation);
    const fx=sx+(b.type==='hq'?-b.w/2+9:b.w/2-9);
    // A zászló közvetlenül a tetőn ül: rövid rúd, a lobogó a tető síkjától indul
    const fy=sy-b.h/2-H-(b.age===0?12:4);
    ctx.strokeStyle='#3a3128'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(fx,fy+4); ctx.lineTo(fx,fy-15); ctx.stroke();
    ctx.fillStyle='#c9b27a'; ctx.beginPath(); ctx.arc(fx,fy-16,2,0,TAU); ctx.fill();
    drawWavingFlag(fx+1.5,fy-15,26,0,nat,b.age,b.flag,null);
    ctx.fillStyle=col;                                   // csapatszín a rúd mentén
    ctx.fillRect(fx-2.5,fy-12,5,12);
    ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(fx-2.5,fy-12,5,2);
  }

  damageOverlay(b,sx,sy);
  // Építés közben csak az építési csík látszik. Korábban az életerő-csík
  // is megjelent mellette, más szélességgel — a kettő elcsúszva ült
  // egymáson, mintha a töltés a saját keretén kívül kezdődne.
  if(typeof drawProps==='function') drawProps(b,sx,sy,H);    // kellékek körülötte
  if(typeof drawDamage==='function') drawDamage(b,sx,sy,H);  // repedések, korom
  if(b.done) drawHpBar(b,sx,sy-b.h/2-H-12,b.w*0.8);

  if(G.selBuild===b){
    ctx.strokeStyle=acc; ctx.lineWidth=2; ctx.setLineDash([6,4]);
    ctx.strokeRect(sx-b.w/2-5,sy-b.h/2-5,b.w+10,b.h+10);
    ctx.setLineDash([]);
    if(b.rally) drawRally(b,sx,sy,true);
  }
  if(b.owner===0&&b.rally&&G.selBuild!==b) drawRally(b,sx,sy,false);
  if(b.queue.length){
    const q=b.queue[0], full=UNITS[q.role].time;
    ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(sx-21,sy+b.h/2+5,42,6);
    ctx.fillStyle=acc; ctx.fillRect(sx-20,sy+b.h/2+6,40*(1-q.t/full),4);
    if(b.queue.length>1){                       // hány egység vár még sorára
      ctx.fillStyle='rgba(0,0,0,.6)';
      ctx.beginPath(); ctx.arc(sx+27,sy+b.h/2+8,7,0,TAU); ctx.fill();
      ctx.fillStyle='#e8dcc0'; ctx.font='9px sans-serif'; ctx.textAlign='center';
      ctx.fillText(b.queue.length,sx+27,sy+b.h/2+11);
      ctx.textAlign='left';
    }
  }
}
