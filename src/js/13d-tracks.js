/* =======================================================================
   13/D. NYOMOK, POR ÉS HULLÁMVERÉS

   NYOMOK
     Ahol sokat járnak, lekopik a fű, és ösvény alakul ki. A kopást
     cellánként gyűjtjük, és lassan visszanő. Nem játékelem: nem gyorsít,
     csak látszik — de attól él a táj, hogy meglátszik rajta a használat.

   PORFELHŐ
     Száraz talajon a mozgó egység port ver fel. A lovasság messziről
     látszik róla — ez taktikai jelzés is.

   HULLÁMVERÉS
     A partvonalon fehér habszegély jár előre-hátra.
   ===================================================================== */

const WEAR_MAX=1;              // ennyinél teljesen kitaposott a cella
const WEAR_UP=0.55;            // másodpercenként ennyivel kopik egy egység alatt
const WEAR_DOWN=0.012;         // és ennyivel nő vissza

function wearInit(){ G.wear=new Float32Array(FW*FH); G.wearT=0; }

/* Az egység nyomot hagy maga alatt. */
function wearMark(u,dt){
  if(REDUCED||!G.wear||u.naval||u.air) return;
  const cx=Math.floor(u.x/FOG_CELL), cy=Math.floor(u.y/FOG_CELL);
  if(cx<0||cy<0||cx>=FW||cy>=FH) return;
  const i=cy*FW+cx;
  G.wear[i]=Math.min(WEAR_MAX, G.wear[i]+WEAR_UP*dt);
}
/* A fű lassan visszanő. Ritkán fut, nagy adagokban. */
function wearTick(dt){
  if(!G.on||REDUCED||!G.wear) return;
  G.wearT=(G.wearT||0)+dt;
  if(G.wearT<2) return;
  const el=G.wearT; G.wearT=0;
  const W=G.wear;
  for(let i=0;i<W.length;i++){
    if(W[i]>0) W[i]=Math.max(0,W[i]-WEAR_DOWN*el);
  }
}
/* A kitaposott foltok kirajzolása — csak a látható cellákra. */
function drawWear(){
  if(REDUCED||G.lowFx||G.pirate||!G.wear) return;   // stratégiai nézetben nincs
  const x0=Math.max(0,Math.floor(G.cam.x/FOG_CELL)-1);
  const y0=Math.max(0,Math.floor(G.cam.y/FOG_CELL)-1);
  const x1=Math.min(FW-1,Math.ceil((G.cam.x+G.vw)/FOG_CELL)+1);
  const y1=Math.min(FH-1,Math.ceil((G.cam.y+G.vh)/FOG_CELL)+1);
  ctx.save();
  for(let cy=y0;cy<=y1;cy++) for(let cx=x0;cx<=x1;cx++){
    const w=G.wear[cy*FW+cx];
    if(w<0.12) continue;
    const x=cx*FOG_CELL-G.cam.x, y=cy*FOG_CELL-G.cam.y;
    // a kitaposott föld barnább és világosabb a fűnél
    ctx.fillStyle='rgba(126,106,74,'+(0.42*Math.min(1,w)).toFixed(3)+')';
    ctx.beginPath();
    ctx.ellipse(x+FOG_CELL/2,y+FOG_CELL/2,FOG_CELL*0.62,FOG_CELL*0.5,0,0,TAU);
    ctx.fill();
  }
  ctx.restore();
}

/* Porfelhő a mozgó egység mögött. */
function dustTick(u,dt){
  if(REDUCED||G.lowFx||u.naval||u.air) return;
  if(typeof isWater==='function'&&isWater(u.x,u.y)) return;
  u.dustT=(u.dustT||0)-dt;
  if(u.dustT>0) return;
  u.dustT=(u.role==='melee'&&u.age===3)?0.10:0.22;    // a harckocsi többet ver fel
  const ero=(u.role==='melee'&&u.age===3)?1.6:1;
  G.fx.push({x:u.x-Math.cos(u.face)*7, y:u.y-Math.sin(u.face)*7+3,
             t:0, life:0.8+Math.random()*0.4, type:'por', ero});
}

/* Hullámverés: fehér habszegély a partvonalon, előre-hátra járva. */
function drawFoam(){
  if(REDUCED||G.lowFx||!G.water) return;
  const x0=Math.max(0,Math.floor(G.cam.x/FOG_CELL)-1);
  const y0=Math.max(0,Math.floor(G.cam.y/FOG_CELL)-1);
  const x1=Math.min(FW-1,Math.ceil((G.cam.x+G.vw)/FOG_CELL)+1);
  const y1=Math.min(FH-1,Math.ceil((G.cam.y+G.vh)/FOG_CELL)+1);
  const jaras=Math.sin(G.t*0.9)*0.5+0.5;                 // 0..1 oda-vissza
  ctx.save();
  for(let cy=y0;cy<=y1;cy++) for(let cx=x0;cx<=x1;cx++){
    const i=cy*FW+cx;
    if(!G.water[i]) continue;
    // csak a legkülső vízcellák habzanak
    if(!waterDepth||waterDepth[i]!==1) continue;
    /* A hab foltjai NE rácsban álljanak: a cella azonosítójából sorsolt
       eltolás és méret töri meg a szabályos mintát, ami korábban
       egyértelműen elárulta a négyzethálót. */
    const h=(i*2654435761)>>>0;
    const ex=((h&255)/255-0.5)*FOG_CELL*0.7;
    const ey=(((h>>8)&255)/255-0.5)*FOG_CELL*0.7;
    const m=0.65+((h>>16)&255)/255*0.7;
    const fazis=jaras*(0.6+((h>>24)&255)/255*0.8);
    const x=cx*FOG_CELL-G.cam.x, y=cy*FOG_CELL-G.cam.y;
    const f=(0.13+0.20*fazis)*m;
    ctx.fillStyle='rgba(232,244,246,'+f.toFixed(3)+')';
    ctx.beginPath();
    ctx.ellipse(x+FOG_CELL/2+ex, y+FOG_CELL/2+ey,
                FOG_CELL*(0.34+0.14*fazis)*m, FOG_CELL*(0.20+0.09*fazis)*m,
                (h%7)*0.4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}
