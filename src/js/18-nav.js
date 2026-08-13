/* =======================================================================
   16/C. ÚTKERESÉS

   Ugyanazon a 32 pixeles rácson dolgozunk, mint a ködfátyol. Minden
   parancshoz egyszer felépítünk egy "áramlási mezőt": a célból indított
   szélességi bejárás minden cellába beírja, merre kell lépni. Ezt a
   mezőt a csoport minden egysége használja, tehát száz katona is egyetlen
   bejárásból tájékozódik. Ha a cél elérhetetlen (befalaztad magad),
   az egység visszaáll az egyenes haladásra és nekimegy a falnak — ott
   pedig az automatikus célzás úgyis támadásba kezd.
   ===================================================================== */
/* Az útkereső rács MÉRETE a pályával együtt változik. Korábban ezek
   állandók voltak, a betöltéskori 107×75-tel — a háromszoros kalózpályán
   így a rács a bal felső sarkot fedte le, és a hajók az első kétszáz pixel
   után nekimentek a „világ végének". */
const NAV_CELL=FOG_CELL;
let NAV_W=FW, NAV_H=FH;
/* Teljes alaphelyzet új játszmához.

   A `navVer` verziószám a JÁTÉKÁLLÁSBAN él, és nem nullázódott új
   játéknál — ezért az útkereső azt hitte, a rácsa naprakész, és az ELŐZŐ
   világ térképével vezette az egységeket. A hiba lassan gyűlt: húsz
   másodperc után néhány pixel, aztán egyre több.

   Hálózatban ez azonnali szétcsúszás lenne. */
function navReset(){
  navGrid=null; seaGrid=null;
  navBuiltVer=-1; seaBuiltVer=-1;
  FLOWS.clear(); SEA_FLOWS.clear();
}
function navResize(){
  NAV_W=FW; NAV_H=FH;
  navGrid=null;                       // új méret: új rács kell
  FLOWS.clear();
  navBuiltVer=-1;
  if(typeof seaGrid!=='undefined'){ seaGrid=null; SEA_FLOWS.clear(); seaBuiltVer=-1; }
}
const NDX=[1,-1,0,0,1,1,-1,-1], NDY=[0,0,1,-1,1,-1,1,-1];
let navGrid=null, navBuiltVer=-1;
const FLOWS=new Map();
// A gyorsítótár mérete, a célok összevonása és a képkockánkénti költségvetés.
// Harminc munkás harminc külön fához korábban minden képkockában újraszámolt:
// tíz elem kevés volt, és nem volt felső korlát a bejárások számán.
const FLOW_MAX=64;      // ennyi mezőt tartunk (mezőnként ~8 KB)
const FLOW_Q=2;         // a célt 2x2 cellás (64 px) blokkra kerekítjük
const FLOW_BUDGET=2;    // képkockánként legfeljebb ennyi új bejárás
function buildNav(){
  if(!navGrid||navGrid.length!==NAV_W*NAV_H) navGrid=new Uint8Array(NAV_W*NAV_H);
  navGrid.fill(0);
  /* A KÉSZ ÚTVONALAK is elavulnak. Enélkül az előző játszma áramlási mezői
     itt maradtak, és az új világban a régi térkép szerint vezették az
     egységeket — két azonos maggal indított játszma emiatt eltért. */
  FLOWS.clear();
  if(G.water) for(let i=0;i<navGrid.length;i++) if(G.water[i]) navGrid[i]=1;
  // A hegyek is akadályok az útkeresésben
  if(G.rock) for(let ry=0;ry<FH;ry++) for(let rx=0;rx<FW;rx++){
    if(!G.rock[ry*FW+rx]) continue;
    const x0=Math.floor(rx*FOG_CELL/NAV_CELL), y0=Math.floor(ry*FOG_CELL/NAV_CELL);
    const x1=Math.floor(((rx+1)*FOG_CELL-1)/NAV_CELL), y1=Math.floor(((ry+1)*FOG_CELL-1)/NAV_CELL);
    for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++)
      if(x>=0&&y>=0&&x<NAV_W&&y<NAV_H) navGrid[y*NAV_W+x]=1;
  }
  for(const b of G.builds){
    if(b.dead) continue;
    if(b.done&&BUILDS[b.type].gate) continue;      // a kapu nyitva áll az útkeresésnek
    const pad=9;
    const c0=Math.max(0,Math.floor((b.x-b.w/2-pad)/NAV_CELL));
    const c1=Math.min(NAV_W-1,Math.floor((b.x+b.w/2+pad)/NAV_CELL));
    const r0=Math.max(0,Math.floor((b.y-b.h/2-pad)/NAV_CELL));
    const r1=Math.min(NAV_H-1,Math.floor((b.y+b.h/2+pad)/NAV_CELL));
    for(let ry=r0;ry<=r1;ry++) for(let rx=c0;rx<=c1;rx++) navGrid[ry*NAV_W+rx]=1;
  }
  navBuiltVer=G.navVer;
  FLOWS.clear();
}
function flowFor(tx,ty){
  if(navBuiltVer!==G.navVer) buildNav();
  let gc=clamp(Math.floor(tx/NAV_CELL),0,NAV_W-1);
  let gr=clamp(Math.floor(ty/NAV_CELL),0,NAV_H-1);
  // Az egymáshoz közeli célok ugyanazt a mezőt kapják — az egység úgyis
  // egyenes vonalon fejezi be az utolsó 64 pixelt.
  gc-=gc%FLOW_Q; gr-=gr%FLOW_Q;
  let goal=gr*NAV_W+gc;
  if(navGrid[goal]){                       // ha épületre mutat a cél, keressünk szabad cellát
    let best=-1,bd=1e9;
    for(let r=Math.max(0,gr-5);r<=Math.min(NAV_H-1,gr+5);r++)
      for(let c=Math.max(0,gc-5);c<=Math.min(NAV_W-1,gc+5);c++){
        const i=r*NAV_W+c; if(navGrid[i]) continue;
        const d=(r-gr)*(r-gr)+(c-gc)*(c-gc);
        if(d<bd){bd=d;best=i;}
      }
    if(best<0) return null;
    goal=best;
  }
  const hit=FLOWS.get(goal);
  if(hit){ FLOWS.delete(goal); FLOWS.set(goal,hit); return hit; }   // legutóbb használt előre
  if(G.flowBudget<=0) return null;      // a költségvetés elfogyott, most egyenesen megyünk
  G.flowBudget--;
  const dir=new Uint8Array(NAV_W*NAV_H);
  const q=new Int32Array(NAV_W*NAV_H);
  let qh=0,qt=0;
  q[qt++]=goal; dir[goal]=9;               // 9 = maga a cél
  while(qh<qt){
    const cur=q[qh++], cy=(cur/NAV_W)|0, cx=cur-cy*NAV_W;
    for(let k=0;k<8;k++){
      const nx=cx+NDX[k], ny=cy+NDY[k];
      if(nx<0||ny<0||nx>=NAV_W||ny>=NAV_H) continue;
      const ni=ny*NAV_W+nx;
      if(dir[ni]||navGrid[ni]) continue;
      if(k>=4&&(navGrid[cy*NAV_W+nx]||navGrid[ny*NAV_W+cx])) continue;   // ne vágjon sarkot
      dir[ni]=k+1;
      q[qt++]=ni;
    }
  }
  const f={dir,goal};
  FLOWS.set(goal,f);
  while(FLOWS.size>FLOW_MAX) FLOWS.delete(FLOWS.keys().next().value);
  return f;
}
// Szabad-e az egyenes út? Ha igen, nem kell kerülgetni.
function losClear(x0,y0,x1,y1){
  if(navBuiltVer!==G.navVer) buildNav();
  const d=Math.hypot(x1-x0,y1-y0), n=Math.min(26,Math.ceil(d/NAV_CELL));
  for(let i=1;i<=n;i++){
    const t=i/n, cx=Math.floor((x0+(x1-x0)*t)/NAV_CELL), cy=Math.floor((y0+(y1-y0)*t)/NAV_CELL);
    if(cx<0||cy<0||cx>=NAV_W||cy>=NAV_H) continue;
    if(navGrid[cy*NAV_W+cx]) return false;
  }
  return true;
}
// Haladás a cél felé: egyenesen, ha lehet, egyébként az áramlási mező mentén
function navMove(u,tx,ty,dt){
  if(u.air) return moveTo(u,tx,ty,dt);          // repülő egyenesen
  if(u.naval) return seaMove(u,tx,ty,dt);       // hajó: megkerüli a szigeteket
  const dd=Math.hypot(tx-u.x,ty-u.y);
  if(dd<64||losClear(u.x,u.y,tx,ty)) return moveTo(u,tx,ty,dt);
  const f=flowFor(tx,ty);
  if(!f) return moveTo(u,tx,ty,dt);
  let cx=clamp(Math.floor(u.x/NAV_CELL),0,NAV_W-1);
  let cy=clamp(Math.floor(u.y/NAV_CELL),0,NAV_H-1);
  let code=f.dir[cy*NAV_W+cx];
  if(!code){                                // épület belsejében állunk: nézzünk körbe
    for(let k=0;k<8;k++){
      const nx=cx+NDX[k], ny=cy+NDY[k];
      if(nx<0||ny<0||nx>=NAV_W||ny>=NAV_H) continue;
      const c2=f.dir[ny*NAV_W+nx];
      if(c2){ cx=nx; cy=ny; code=c2; break; }
    }
  }
  if(!code) return moveTo(u,tx,ty,dt);      // elérhetetlen cél
  // három cellányit előrenézünk, így nem cikcakkozik a menet
  let px=cx, py=cy;
  for(let step=0;step<3;step++){
    const c3=f.dir[py*NAV_W+px];
    if(!c3||c3===9) break;
    const k=c3-1;
    px-=NDX[k]; py-=NDY[k];
  }
  return moveTo(u,(px+0.5)*NAV_CELL,(py+0.5)*NAV_CELL,dt);
}

/* =======================================================================
   TENGERI ÚTKERESÉS

   A hajók eddig EGYENES vonalban mentek a cél felé: bármelyik sziget
   megállította őket. Egy kis pályán ez alig látszott, a háromszoros
   Karib-tengeren viszont a flotta ki sem tudott futni az öbölből.

   Ezért a szárazföldi rács mintájára készül egy tengeri is — csak fordítva:
   itt a SZÁRAZFÖLD az akadály. A hajók ugyanúgy áramlási mező mentén
   kerülik meg a szigeteket, mint a katonák a hegyeket.
   ===================================================================== */
let seaGrid=null, seaBuiltVer=-1;
const SEA_FLOWS=new Map();

function buildSea(){
  if(!seaGrid||seaGrid.length!==NAV_W*NAV_H) seaGrid=new Uint8Array(NAV_W*NAV_H);
  seaGrid.fill(1);
  SEA_FLOWS.clear();          // a tengeri útvonalak is elavulnak                                  // alapból minden akadály
  if(G.water) for(let i=0;i<seaGrid.length&&i<G.water.length;i++)
    if(G.water[i]) seaGrid[i]=0;                    // a víz járható
  /* A partot egy cellával beljebb húzzuk: egy hajó nem sodródhat közvetlenül
     a homokra, és így a szűk szorosokban sem akad el a teste. */
  const masol=seaGrid.slice();
  for(let cy=0;cy<NAV_H;cy++) for(let cx=0;cx<NAV_W;cx++){
    if(masol[cy*NAV_W+cx]) continue;
    let part=false;
    for(let k=0;k<8&&!part;k++){
      const nx=cx+NDX[k], ny=cy+NDY[k];
      if(nx<0||ny<0||nx>=NAV_W||ny>=NAV_H){ part=true; break; }
      if(masol[ny*NAV_W+nx]) part=true;
    }
    if(part) seaGrid[cy*NAV_W+cx]=2;                // 2 = járható, de partközeli
  }
  seaBuiltVer=G.navVer;
}
function seaBlocked(i){ return seaGrid[i]===1; }

function seaFlowFor(tx,ty){
  if(seaBuiltVer!==G.navVer||!seaGrid||seaGrid.length!==NAV_W*NAV_H) buildSea();
  let gx=clamp(Math.floor(tx/NAV_CELL),0,NAV_W-1);
  let gy=clamp(Math.floor(ty/NAV_CELL),0,NAV_H-1);
  gx=Math.round(gx/FLOW_Q)*FLOW_Q; gy=Math.round(gy/FLOW_Q)*FLOW_Q;
  gx=clamp(gx,0,NAV_W-1); gy=clamp(gy,0,NAV_H-1);
  let goal=gy*NAV_W+gx;
  if(seaBlocked(goal)){
    /* A cél szárazföldön van — például egy városnál. Ilyenkor a hozzá
       legközelebbi vizet vesszük célnak. A háromszoros pályán a szigetek is
       háromszorosak, ezért messzebbre kell keresni: hat cellánál a hajó nem
       talált vizet Tortuga körül, és egyenesen nekiment a partnak. */
    let best=-1,bd=1e9;
    for(let r=1;r<=40&&best<0;r++)
      for(let y=gy-r;y<=gy+r;y++) for(let x=gx-r;x<=gx+r;x++){
        if(x<0||y<0||x>=NAV_W||y>=NAV_H) continue;
        const i=y*NAV_W+x;
        if(seaBlocked(i)) continue;
        /* NYÍLT vizet keresünk, nem a szigetbe zárt tócsát: legalább három
           vizes szomszéd kell. Enélkül a cél egy sziget belsejébe szorult
           egycellás folt lett, ahonnan az áramlási mező sehova nem vezetett
           — mérve egyetlen cellát ért el az ötvenkilencezerből. */
        let szomszed=0;
        for(let k=0;k<8;k++){
          const nx2=x+NDX[k], ny2=y+NDY[k];
          if(nx2<0||ny2<0||nx2>=NAV_W||ny2>=NAV_H) continue;
          if(!seaBlocked(ny2*NAV_W+nx2)) szomszed++;
        }
        if(szomszed<3) continue;
        const d=(y-gy)*(y-gy)+(x-gx)*(x-gx);
        if(d<bd){bd=d;best=i;}
      }
    if(best<0) return null;
    goal=best;
  }
  const hit=SEA_FLOWS.get(goal);
  if(hit){ SEA_FLOWS.delete(goal); SEA_FLOWS.set(goal,hit); return hit; }
  if(G.flowBudget<=0) return null;
  G.flowBudget--;
  const dir=new Uint8Array(NAV_W*NAV_H);
  const q=new Int32Array(NAV_W*NAV_H);
  let qh=0,qt=0;
  q[qt++]=goal; dir[goal]=9;
  while(qh<qt){
    const cur=q[qh++], cy=(cur/NAV_W)|0, cx=cur-cy*NAV_W;
    for(let k=0;k<8;k++){
      const nx=cx+NDX[k], ny=cy+NDY[k];
      if(nx<0||ny<0||nx>=NAV_W||ny>=NAV_H) continue;
      const ni=ny*NAV_W+nx;
      if(dir[ni]||seaBlocked(ni)) continue;
      if(k>=4&&(seaBlocked(cy*NAV_W+nx)||seaBlocked(ny*NAV_W+cx))) continue;
      dir[ni]=k+1;
      q[qt++]=ni;
    }
  }
  const f={dir,goal};
  SEA_FLOWS.set(goal,f);
  while(SEA_FLOWS.size>FLOW_MAX) SEA_FLOWS.delete(SEA_FLOWS.keys().next().value);
  return f;
}
// Szabad-e a hajónak az egyenes út?
function seaClear(x0,y0,x1,y1){
  if(seaBuiltVer!==G.navVer||!seaGrid) buildSea();
  const d=Math.hypot(x1-x0,y1-y0), n=Math.min(40,Math.ceil(d/NAV_CELL));
  for(let i=1;i<=n;i++){
    const t=i/n, cx=Math.floor((x0+(x1-x0)*t)/NAV_CELL), cy=Math.floor((y0+(y1-y0)*t)/NAV_CELL);
    if(cx<0||cy<0||cx>=NAV_W||cy>=NAV_H) continue;
    if(seaBlocked(cy*NAV_W+cx)) return false;
  }
  return true;
}
/* Hajó haladása: egyenesen, ha szabad az út, egyébként a szigetek megkerülésével. */
function seaMove(u,tx,ty,dt){
  const dd=Math.hypot(tx-u.x,ty-u.y);
  if(dd<70||seaClear(u.x,u.y,tx,ty)) return moveTo(u,tx,ty,dt);
  const f=seaFlowFor(tx,ty);
  if(!f) return moveTo(u,tx,ty,dt);
  let cx=clamp(Math.floor(u.x/NAV_CELL),0,NAV_W-1);
  let cy=clamp(Math.floor(u.y/NAV_CELL),0,NAV_H-1);
  let code=f.dir[cy*NAV_W+cx];
  if(!code){                                  // parton ragadtunk: keressünk kiutat
    for(let k=0;k<8;k++){
      const nx=cx+NDX[k], ny=cy+NDY[k];
      if(nx<0||ny<0||nx>=NAV_W||ny>=NAV_H) continue;
      const c2=f.dir[ny*NAV_W+nx];
      if(c2){ cx=nx; cy=ny; code=c2; break; }
    }
  }
  if(!code) return moveTo(u,tx,ty,dt);
  /* A mező a cél felől terjed, ezért a tárolt irányt KIVONJUK: úgy jutunk
     közelebb. (Először hozzáadtam — a hajók pontosan a céltól elfelé
     indultak, és harminc másodperc alatt húsz pixert tettek meg.)
     Három cellányit előrenézünk, hogy ne cikcakkozzon a hajó. */
  let px=cx, py=cy;
  for(let step=0;step<3;step++){
    const c3=f.dir[py*NAV_W+px];
    if(!c3||c3===9) break;
    const k=c3-1;
    px-=NDX[k]; py-=NDY[k];
  }
  return moveTo(u,(px+0.5)*NAV_CELL,(py+0.5)*NAV_CELL,dt);
}
