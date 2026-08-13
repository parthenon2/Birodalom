/* =======================================================================
   13/B. NÖVÉNYZET — bokrok és magas fűcsomók

   Nem gyűjthető és nem akadály: pusztán a táj kedvéért van. Az y-rendezésbe
   viszont beleszámít, tehát ha valaki mögötte áll, félig áttetszővé válik —
   ugyanúgy, mint az épületek.

   A helyüket nem mentjük külön: egyetlen szám (magszám) alapján bármikor
   ugyanúgy állnak elő. Így a mentés nem hízik meg tőlük.
   ===================================================================== */
const DSPR={};

function decoSprite(kind,variant){
  const key=kind+variant;
  if(DSPR[key]) return DSPR[key];
  const W=(kind==='bush')?52:38, H=(kind==='bush')?44:34;
  const c=document.createElement('canvas');
  c.width=W*SPR_DPR; c.height=H*SPR_DPR;
  const g=c.getContext('2d');
  g.setTransform(SPR_DPR,0,0,SPR_DPR,0,0);
  g.translate(W/2,H-4);
  const R=seedRand(key);
  GX=g;
  if(kind==='bush'){
    // árnyék
    g.fillStyle='rgba(24,40,16,.22)';
    g.beginPath(); g.ellipse(1,1,15,5,0,0,TAU); g.fill();
    // ágak
    g.strokeStyle='#4a3a24'; g.lineWidth=1.6;
    for(let i=-1;i<=1;i++){
      g.beginPath(); g.moveTo(0,0); g.lineTo(i*4,-8-R()*3); g.stroke();
    }
    // lombcsomók
    const zold=['#3f6b2c','#4d7d34','#355c26','#578a3c'];
    for(let i=0;i<7;i++){
      const a=R()*TAU, d=R()*9;
      const x=Math.cos(a)*d, y=-11-Math.sin(a)*6-R()*4, r=6+R()*5;
      g.fillStyle=zold[(i+variant)%4];
      g.beginPath(); g.arc(x,y,r,0,TAU); g.fill();
      g.fillStyle='rgba(255,255,255,.10)';
      g.beginPath(); g.arc(x-r*0.3,y-r*0.35,r*0.42,0,TAU); g.fill();
    }
    if(variant%3===0){                          // bogyók
      g.fillStyle='#a8323a';
      for(let i=0;i<4;i++){
        g.beginPath(); g.arc((R()-0.5)*16,-10-R()*10,1.7,0,TAU); g.fill();
      }
    }
  }else if(kind==='tuft'){
    g.fillStyle='rgba(24,40,16,.18)';
    g.beginPath(); g.ellipse(0,1,11,3.6,0,0,TAU); g.fill();
    const szin=['#4e7a30','#5c8a3a','#6b9a44','#7aa84e'];
    // Hátsó, sötétebb szálak előbb — így mélysége lesz a csomónak
    for(let i=0;i<22;i++){
      const hatso=i<9;
      const x0=(R()-0.5)*(hatso?13:17), h=(hatso?8:11)+R()*(hatso?9:14);
      const lean=(R()-0.5)*10;
      g.strokeStyle=szin[hatso?(i%2):(2+(i+variant)%2)];
      g.lineWidth=(hatso?1.1:1.5)+R()*0.7;
      g.lineCap='round';
      g.beginPath();
      g.moveTo(x0,0);
      g.quadraticCurveTo(x0+lean*0.35,-h*0.55, x0+lean,-h);
      g.stroke();
      if(!hatso&&R()<0.4){                       // világosabb hegy
        g.strokeStyle='#9ec468'; g.lineWidth=1;
        g.beginPath();
        g.moveTo(x0+lean*0.7,-h*0.78); g.lineTo(x0+lean,-h);
        g.stroke();
      }
    }
    if(variant%3===1){                           // néhány kalász
      g.fillStyle='#c9b46a';
      for(let i=0;i<3;i++){
        const x0=(R()-0.5)*12, h=16+R()*8;
        g.beginPath(); g.ellipse(x0,-h,1.6,3.4,(R()-0.5)*0.5,0,TAU); g.fill();
      }
    }
  }else{
    g.fillStyle='rgba(24,40,16,.15)';
    g.beginPath(); g.ellipse(0,1,8,3,0,0,TAU); g.fill();
    const szirom=['#d8d0a8','#c9a8c4','#d8b45c','#b8c8d8'][variant%4];
    for(let i=0;i<9;i++){
      const x0=(R()-0.5)*13, h=6+R()*9;
      g.strokeStyle='#5c8a3a'; g.lineWidth=1.1;
      g.beginPath(); g.moveTo(x0,0); g.lineTo(x0+(R()-0.5)*3,-h); g.stroke();
      if(i%3===0){
        g.fillStyle=szirom;
        g.beginPath(); g.arc(x0,-h-1.4,2,0,TAU); g.fill();
        g.fillStyle='#e8d888';
        g.beginPath(); g.arc(x0,-h-1.4,0.8,0,TAU); g.fill();
      }
    }
  }
  DSPR[key]={img:c,w:W,h:H,ox:W/2,oy:H-4};
  return DSPR[key];
}
// A növényzet helye a magszámból áll elő — mentésbe csak a szám kerül
function genDeco(){
  G.deco=[];
  const M=(typeof curMap==='function')?curMap():null;
  const suru=M?clamp(M.tree,0.3,2.2):1;
  const n=Math.round(340*suru);
  const R=seedRand('deco'+G.decoSeed);
  for(let i=0;i<n;i++){
    const x=40+R()*(WORLD.w-80), y=40+R()*(WORLD.h-80);
    if(isWater(x,y)||isRock(x,y)) continue;
    const t=R();
    const kind=t<0.34?'bush':(t<0.82?'tuft':'flower');
    G.deco.push({kind, x, y, v:(R()*4)|0, kindDeco:true});
  }
}
/* Az épület alá eső növényzet eltávolítása.

   A `felfele` azért kell, mert az épületek a talppontjuktól FELFELÉ
   rajzolódnak: a fal teteje jóval a saját y koordinátája fölött van,
   és az ott álló fűcsomó is beleér. */
function decoTakarit(x, y, w, h, felfele){
  if(!G.deco || !G.deco.length) return 0;
  const fw = (w || 40) * 0.5 + 10;
  const lent = y + (h || 30) * 0.5 + 8;
  const fent = y - (h || 30) * 0.5 - (felfele || 40);
  let db = 0;
  for(let i = G.deco.length - 1; i >= 0; i--){
    const d = G.deco[i];
    if(Math.abs(d.x - x) < fw && d.y > fent && d.y < lent){ G.deco.splice(i, 1); db++; }
  }
  return db;
}

/* A szél hullámként fut végig a tájon: a fázis a helytől függ, így nem
   egyszerre leng minden fűcsomó. A széllökések lassabb ütemben erősödnek
   és gyengülnek. A növény talpa marad a helyén, a teteje hajlik — ezt egy
   nyírás-transzformáció adja. */
function windAt(x,y){
  const lokes=0.55+0.45*Math.sin(G.t*0.37+x*0.0015);
  return Math.sin(G.t*1.7 + x*0.013 + y*0.006)*lokes;
}
const DECO_SWAY={bush:0.05, tuft:0.20, flower:0.14};
function drawDeco(d){
  const x=d.x-G.cam.x, y=d.y-G.cam.y;
  if(x<-60||y<-60||x>G.vw+60||y>G.vh+60) return;
  if(fogAt(d.x,d.y)===0) return;                // felderítetlen terület
  const sp=decoSprite(d.kind,d.v);
  const sway=(REDUCED||G.lowFx)?0:windAt(d.x,d.y)*DECO_SWAY[d.kind];
  if(!sway){
    ctx.drawImage(sp.img, x-sp.ox, y-sp.oy, sp.w, sp.h);
    return;
  }
  ctx.save();
  ctx.translate(x,y);                            // a talp a forgáspont
  ctx.transform(1,0,sway,1,0,0);                 // felfelé növekvő hajlás
  ctx.drawImage(sp.img, -sp.ox, -sp.oy, sp.w, sp.h);
  ctx.restore();
}
