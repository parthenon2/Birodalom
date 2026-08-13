/* =======================================================================
   EGYSÉG-SPRITE GYORSÍTÓTÁR

   Az épületekhez hasonlóan az egységeket is egyszer rajzoljuk meg, majd
   képként másoljuk. A figura kinézetét öt dolog határozza meg: szerep,
   korszak, tulajdonos, nézési póz és mozgásfázis — ezekből áll a kulcs.
   Ami képkockánként változik (árnyék, csapatszín, kijelölés, lőporfüst,
   hátizsák, életcsík), az továbbra is élőben kerül a kép fölé.
   ===================================================================== */
const USPR={}, USPR_W=58, USPR_H=40, USPR_OX=22, USPR_OY=30;
const USPR_DPR=Math.min(window.devicePixelRatio||1,2);
function unitSprite(role,age,owner,pose,mode){
  const key=role+age+owner+pose+mode;
  if(USPR[key]) return USPR[key];
  const c=document.createElement('canvas');
  c.width=Math.ceil(USPR_W*USPR_DPR); c.height=Math.ceil(USPR_H*USPR_DPR);
  const g=c.getContext('2d');
  g.setTransform(USPR_DPR,0,0,USPR_DPR,0,0);
  g.translate(USPR_OX,USPR_OY);
  // mód: 'i' álló, 'w0'..'w3' járás, 'f' tüzelés, 'g0'..'g3' gyűjtés
  const walking=mode[0]==='w', busy=mode[0]==='g', fired=mode==='f';
  const phase=(walking||busy)?(+mode[1])*TAU/4:0;
  const col=ownerColor(owner), acc=ownerAccent(owner);
  const proto={role,age,owner,carry:0,carryType:null,walk:phase,
               r:val(UNITS[role].r,age)};
  const prev=UX; UX=g;
  if(walking) g.translate(0,-Math.abs(Math.sin(phase))*0.9);
  if(role==='worker')      paintWorker(proto,pose,phase,walking,busy,col,acc);
  else if(role==='melee')  paintMelee(proto,pose,phase,walking,fired,col,acc);
  else if(role==='spear')  paintSpear(proto,pose,phase,walking,fired,0,col,acc);
  else if(role==='cav')    paintCav(proto,pose,phase,walking,fired,col,acc);
  else if(role==='priest') paintPriest(proto,pose,phase,walking,fired,0,col,acc);
  else if(role==='medic') paintMedic(proto,pose,walking,fired,col,acc);
  else if(role==='siege') paintSiege(proto,pose,walking,fired,col,acc);
  else if(role==='hero')  paintHero(proto,pose,walking,fired,col,acc);
  else if(role==='spy')   paintSpy(proto,pose,walking,fired,col,acc);
  else if(role==='ram')   paintRam(proto,pose,walking,fired,col,acc);
  else if(role==='siegetower') paintSiegeTower(proto,pose,walking,fired,col,acc);
  else                     paintRanged(proto,pose,phase,walking,fired,0,col,acc);
  UX=prev;
  USPR[key]=c;
  return c;
}
// A korszakváltás egyetlen képkockán öt-hat sprite-ot generálna, ami
// megrándulna. Ezért sorba tesszük őket, és képkockánként egyet készítünk el.
function warmSprites(age,owner){
  for(const t of BUILD_ORDER) G.warmQ.push({kind:'b',type:t,age,owner});
  for(const r of ROLES) if(!UNITS[r].naval) for(const po of ['front','back','side'])
    G.warmQ.push({kind:'u',role:r,age,owner,pose:po});
}
function tickWarm(){
  let n=2;                                    // képkockánként kettő, hogy ne akadjon
  while(n-->0&&G.warmQ.length){
    const w=G.warmQ.shift();
    try{
      if(w.kind==='b') getSprite(w.type,w.age,w.owner);
      else unitSprite(w.role,w.age,w.owner,w.pose,'i');
    }catch(e){}
  }
}
// A korszakváltáskor feleslegessé vált sprite-ok eldobása
function pruneSprites(){
  /* Melyik korszakok képeit tartsuk meg? MINDEN fél korszakát, különben
     a több félnél folyton újra kellene rajzolni őket. */
  const keep=(G.oldalak&&G.oldalak.length)?G.oldalak.map(o=>o.age||0):[G.age,G.ai?G.ai.age:0];
  for(const k in USPR){ const a=+k.replace(/^[a-z]+/,'')[0];
    if(keep.indexOf(a)<0) delete USPR[k]; }
  for(const k in SPRITES){ const a=+k.split('|')[1];
    if(keep.indexOf(a)<0) delete SPRITES[k]; }
}

/* ---------- fő rajzoló ---------- */
// A gép a talaj fölött 34 pixerrel repül: a képen feljebb rajzoljuk, és
// alá külön árnyékot vetünk, hogy érezhető legyen a magasság.
const AIR_ALT=34;
// Járművek mindig oldalnézetben: szemből nézve a harckocsi és a repülő
// laposnak és zavarosnak látszana. A tükrözés csak akkor vált, ha az irány
// egyértelműen balra vagy jobbra mutat — a küszöb körüli ingadozásnál
// megtartjuk az előzőt, különben a rajz ide-oda ugrálna.
function sideFlip(u){
  const c=Math.cos(u.face);
  if(u._flip===undefined) u._flip=(c<0)?-1:1;
  if(c>0.22) u._flip=1;
  else if(c<-0.22) u._flip=-1;
  return u._flip;
}
function drawUnit(u){
  if(u.air&&!u.dead){
    const sx=u.x-G.cam.x, sy=u.y-G.cam.y;
    if(!(sx<-70||sy<-80||sx>G.vw+70||sy>G.vh+70)){
      ctx.save();
      ctx.fillStyle='rgba(0,0,0,.22)';
      ctx.beginPath(); ctx.ellipse(sx+6,sy+4,u.r*0.9,u.r*0.42,u.face,0,TAU); ctx.fill();
      ctx.restore();
    }
  }
  if(!enyemVagySzovetseges(u.owner)&&fogAt(u.x,u.y,helyiFel())!==2) return;   // ellenséget csak belátott cellán
  const x=u.x-G.cam.x, y=u.y-G.cam.y-(u.air?AIR_ALT:0);
  if(x<-70||y<-80||x>G.vw+70||y>G.vh+70) return;
  const col=ownerColor(u.owner), acc=ownerAccent(u.owner);
  const moving=(u.walk!==u._lw); u._lw=u.walk;
  const def=UNITS[u.role];
  const atk=val(def.atk,u.age)||1;
  const sinceFire=atk-u.cd;                       // mennyi ideje lőtt/csapott
  const fired=u.cd>0&&sinceFire<0.13;
  const fireT=clamp(sinceFire/0.55,0,2);
  const busy=!!(u.order&&(u.order.type==='gather'||u.order.type==='repair')&&!moving);
  const s=u.r/9.2;
  UX=ctx;

  /* KONTAKTÁRNYÉK: puha folt a talajon, a naptól elfelé tolva. A régi
     kemény ellipszis helyett ez teszi az egységet a fűre — enélkül
     ráragasztottnak látszott. */
  if(typeof contactShadow==='function') contactShadow(u);
  ctx.save(); ctx.translate(x,y);
  if(!u.naval){                                   // a hajónak nincs vetett árnyéka
    ctx.fillStyle='rgba(0,0,0,.14)';              // halvány mag a puha folt fölé
    ctx.beginPath(); ctx.ellipse(2*s,3.4*s,u.r*0.7,u.r*0.3,0,0,TAU); ctx.fill();
  }
  // csapatszín-gyűrű: kis nagyításnál is elkülöníti a feleket.
  // Az ellenségé szaggatott, hogy ne csak a szín különböztesse meg.
  ctx.globalAlpha=.6; ctx.strokeStyle=col; ctx.lineWidth=2;
  if(u.owner) ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.ellipse(0,3.4*s,u.r*0.95,u.r*0.42,0,0,TAU); ctx.stroke();
  ctx.setLineDash([]); ctx.globalAlpha=1;
  // A hős aurája: halvány aranykör; a hatása alatt állóknál apró csillám
  if(u.hero&&!REDUCED){
    const R=(UNITS.hero.auraR||170);
    ctx.save();
    ctx.strokeStyle='rgba(230,200,110,'+(0.16+0.06*Math.sin(G.t*1.6))+')';
    ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.ellipse(0,3.4*s,R/ (s||1),R*0.45/(s||1),0,0,TAU); ctx.stroke();
    ctx.restore();
  }else if(u.auraHero&&!REDUCED){
    ctx.fillStyle='rgba(230,200,110,.5)';
    ctx.beginPath(); ctx.arc(u.r*0.8,-u.r*1.4,1.3,0,TAU); ctx.fill();
  }
  // Megfutamodás: fehér kendő a fej fölött
  if(typeof isRouting==='function'&&isRouting(u)){
    ctx.fillStyle='rgba(240,238,230,.85)';
    ctx.beginPath();
    ctx.moveTo(0,-u.r*2.1); ctx.lineTo(6,-u.r*2.1-3); ctx.lineTo(6,-u.r*2.1+2);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(60,54,44,.7)'; ctx.lineWidth=0.9;
    ctx.beginPath(); ctx.moveTo(0,-u.r*2.1-4); ctx.lineTo(0,-u.r*1.2); ctx.stroke();
  }

  /* Veteránsávok a talpgyűrűn: egy sáv a veteránnak, kettő az elitnek.
     Előléptetéskor rövid aranyvillanás jelzi a rangot. */
  if(u.vet){
    const sy=3.4*s+u.r*0.42+2.6;
    ctx.fillStyle=(u.vet>1)?'#f0d060':'#d8d4c8';
    for(let i=0;i<u.vet;i++){
      const x=-3.2+i*4.2;
      ctx.beginPath();
      ctx.moveTo(x,sy); ctx.lineTo(x+2.4,sy-2.6); ctx.lineTo(x+3.4,sy-2.6);
      ctx.lineTo(x+1,sy); ctx.closePath(); ctx.fill();
    }
    if(u.vetAt&&G.t-u.vetAt<1.2&&!REDUCED){
      const k=(G.t-u.vetAt)/1.2;
      ctx.strokeStyle='rgba(240,208,96,'+(0.8*(1-k))+')'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.ellipse(0,3.4*s,(u.r+4)*(1+k*0.9),(u.r+4)*0.45*(1+k*0.9),0,0,TAU);
      ctx.stroke();
    }
  }
  // Visszavonulás állásban halvány jelzés a talpon
  if(u.stance==='flee'&&u.hp<u.maxHp*0.4){
    ctx.strokeStyle='rgba(220,180,60,.5)'; ctx.lineWidth=1.4; ctx.setLineDash([2,3]);
    ctx.beginPath(); ctx.ellipse(0,3.4*s,u.r+2,(u.r+2)*0.45,0,0,TAU); ctx.stroke();
    ctx.setLineDash([]);
  }
  // kijelölő gyűrű a talp alatt
  if(G.sel.includes(u)){
    ctx.strokeStyle=acc; ctx.lineWidth=1.8;
    ctx.beginPath(); ctx.ellipse(0,3.4*s,u.r+3.5,(u.r+3.5)*0.45,0,0,TAU); ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.ellipse(0,3.4*s+1,u.r+3.5,(u.r+3.5)*0.45,0,0,TAU); ctx.stroke();
  }
  // Erősen kicsinyített nézetben egyszerűsített alak — így telefonon is folyékony
  if(G.zoom<0.6){
    ctx.fillStyle=col;
    ctx.beginPath(); ctx.arc(0,-4*s,u.r*0.78,0,TAU); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.35)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(0,-4*s,u.r*0.78,0,TAU); ctx.stroke();
    ctx.fillStyle=u.role==='worker'?'#c9a06a':acc;
    ctx.beginPath(); ctx.arc(0,-7*s,u.r*0.38,0,TAU); ctx.fill();
    ctx.restore();
    drawHpBar(u,x,y-14*s,Math.max(18,u.r*2));
    return;
  }
  if(u.air){                                      // repülő: felülnézet, szabad forgás
    UX=ctx;
    ctx.scale(sideFlip(u),1);                   // a gép mindig oldalról
    paintPlane(u,'side',moving,fired,col,acc);
    ctx.restore();
    drawHpBar(u,x,y-26,32);
    return;
  }
  if(u.naval){                                    // hajó: ugyanaz a hármas póz, mint a gyalogságnál
    UX=ctx;
    // Álruhás kém: az ellenség színeit viseli, a talpán szaggatott gyűrűvel
  if(u.disguise){
    col=ownerColor(u.owner?0:1);
    acc=ownerAccent(u.owner?0:1);
  }
  /* Tétlen mozdulat: az álló katona nem szobor. Lassú, apró súlyáthelyezés
     és néha egy körülnézés — a sprite-ot nem cseréljük, csak megdöntjük. */
  if(!moving&&!u.naval&&!u.air&&!REDUCED&&u.kind==='unit'){
    const f=(u.id||0)*0.7;
    const leng=Math.sin(G.t*0.9+f)*0.012+Math.sin(G.t*0.31+f*1.7)*0.008;
    ctx.transform(1,0,leng,1,0,0);
    ctx.translate(0,Math.sin(G.t*0.45+f)*0.35);
  }
  const po=poseOf(u.face);
    ctx.scale(po.f,1);
    paintShip(u,po.p,moving,fired,col,acc);
    ctx.restore();
    drawHpBar(u,x,y-24,u.role==='warship'?34:26);
    return;
  }
  if(u.role==='melee'&&u.age===3){                // harckocsi: szabadon forog, élőben rajzoljuk
    ctx.scale(s*0.62,s*0.62);
    ctx.scale(sideFlip(u),1);                   // a harckocsi mindig oldalról
    paintTank(u,'side',moving,fired,col,acc);
    ctx.restore();
    drawHpBar(u,x,y-26,30);
    return;
  }
  const po=poseOf(u.face);
  // mozgásfázis kvantálása a gyorsítótárhoz
  let mode;
  if(fired) mode='f';
  else if(busy) mode='g'+(Math.floor(G.t*7)%4);
  else if(moving) mode='w'+(Math.floor(u.walk/(TAU/4))%4);
  else mode='i';
  const sp=unitSprite(u.role,u.age,u.owner,po.p,mode);
  ctx.scale(s*po.f,s);
  ctx.drawImage(sp,-USPR_OX,-USPR_OY,USPR_W,USPR_H);
  // élő rétegek a sprite fölé
  if(u.carry>0){                                   // a munkás hátizsákja
    UX=ctx;
    const c2=u.carryType==='wood'?'#7a5230':(u.carryType==='stone'?'#9a9ca0':'#d4af37');
    ctx.fillStyle='#8a6a45';
    ctx.beginPath(); ctx.ellipse(po.p==='back'?0:-4.4,-9.5,3.2,3.8,0.2,0,TAU); ctx.fill();
    ctx.fillStyle=c2;
    ctx.beginPath(); ctx.ellipse(po.p==='back'?0:-4.4,-10.6,2.4,1.8,0.2,0,TAU); ctx.fill();
  }
  if((u.role==='ranged'||u.role==='spear')&&u.age>0&&fireT<0.8){
    UX=ctx;                                        // lőporfüst a csőnél
    const o={side:[19,-10.6],front:[13,-4],back:[13,-16]}[po.p];
    powderSmoke(o[0],o[1],po.p==='side'?-0.5:(po.p==='front'?0.5:-1.2),fireT);
  }
  ctx.restore();
  // A térítés fénye: szaggatott vonal a célpontig és haladást mutató ív
  if(u.role==='priest'&&u.order&&u.order.type==='convert'&&u.chan>0){
    const t=u.order.target;
    if(t&&!t.dead){
      const tx=t.x-G.cam.x, ty=t.y-G.cam.y;
      ctx.strokeStyle='rgba(232,201,106,.65)'; ctx.lineWidth=2; ctx.setLineDash([5,5]);
      ctx.beginPath(); ctx.moveTo(x,y-13*s); ctx.lineTo(tx,ty-10); ctx.stroke();
      ctx.setLineDash([]);
      const p=clamp(u.chan/val(UNITS.priest.convert,u.age),0,1);
      ctx.strokeStyle='rgba(0,0,0,.45)'; ctx.lineWidth=3.4;
      ctx.beginPath(); ctx.arc(tx,ty-17,11,0,TAU); ctx.stroke();
      ctx.strokeStyle='#e8c96a'; ctx.lineWidth=2.6;
      ctx.beginPath(); ctx.arc(tx,ty-17,11,-Math.PI/2,-Math.PI/2+p*TAU); ctx.stroke();
    }
  }
  drawHpBar(u,x,y-25*s,Math.max(22,u.r*2.4));
  // Kijelölt gyűjtőnél kiírjuk, mennyi rakomány van nála
  if(u.carry>0&&G.sel.includes(u)){
    const cap=UNITS[u.role].carry||12;
    const c2=u.carryType==='wood'?'#8a6234':(u.carryType==='stone'?'#9aa0a6':
             (u.carryType==='gold'?'#d4af37':'#7fa3b6'));
    const txt=Math.floor(u.carry)+'/'+cap;
    ctx.font='9px sans-serif'; ctx.textAlign='left';
    const wpx=ctx.measureText(txt).width+15;
    const bx=x-wpx/2, by=y-33*s;
    ctx.fillStyle='rgba(20,16,12,.82)';
    ctx.fillRect(bx,by,wpx,12);
    ctx.strokeStyle='rgba(0,0,0,.4)'; ctx.lineWidth=1; ctx.strokeRect(bx+.5,by+.5,wpx-1,11);
    ctx.fillStyle=c2;
    ctx.beginPath(); ctx.arc(bx+6,by+6,3.4,0,TAU); ctx.fill();
    ctx.fillStyle='#e8dcc0'; ctx.fillText(txt,bx+11.5,by+9);
    ctx.textAlign='left';
  }
}
