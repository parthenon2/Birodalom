/* =======================================================================
   6/B. VÍZ — tenger, tavak, folyó

   A vizet ugyanazon a 32 pixeles rácson tartjuk nyilván, mint a ködöt és
   az útkeresést, így a három rendszer együtt tud dolgozni. A víz a
   szárazföldi egységeknek járhatatlan, a hajóknak viszont az egyetlen
   járható terep — ez a két szabály egymás tükörképe.

   A generálás után külön ellenőrizzük, hogy a két bázis között maradt-e
   szárazföldi út. Ha nem, gázlót vágunk: a víz sosem zárhatja el a
   játékot önmagától.
   ===================================================================== */
let waterCv=null, waterCtx=null, waterImg=null, waterMid=null;

function waterIdx(x,y){
  const cx=Math.floor(x/FOG_CELL), cy=Math.floor(y/FOG_CELL);
  if(cx<0||cy<0||cx>=FW||cy>=FH) return -1;
  return cy*FW+cx;
}
function isWater(x,y){
  if(!G.water) return false;
  const i=waterIdx(x,y);
  return i>=0 && G.water[i]===1;
}
// Partvonal: szárazföldi cella, aminek van vizes szomszédja
function isShore(x,y){
  if(!G.water) return false;
  const cx=Math.floor(x/FOG_CELL), cy=Math.floor(y/FOG_CELL);
  if(cx<0||cy<0||cx>=FW||cy>=FH) return false;
  if(G.water[cy*FW+cx]) return false;
  for(let dy=-3;dy<=3;dy++) for(let dx=-3;dx<=3;dx++){
    const nx=cx+dx, ny=cy+dy;
    if(nx<0||ny<0||nx>=FW||ny>=FH) continue;
    if(G.water[ny*FW+nx]) return true;
  }
  return false;
}
// Egy terület vízmentesítése (a bázisok környéke)
function dryOut(x,y,r){
  const W=G.water, rc=r/FOG_CELL;
  const cx=x/FOG_CELL, cy=y/FOG_CELL;
  for(let gy=Math.max(0,Math.floor(cy-rc));gy<=Math.min(FH-1,Math.ceil(cy+rc));gy++)
    for(let gx=Math.max(0,Math.floor(cx-rc));gx<=Math.min(FW-1,Math.ceil(cx+rc));gx++){
      const dx=gx+0.5-cx, dy=gy+0.5-cy;
      if(dx*dx+dy*dy<=rc*rc) W[gy*FW+gx]=0;
    }
}
function genWater(){
  const W=G.water=new Uint8Array(FW*FH);
  const set=(cx,cy)=>{ if(cx>=0&&cy>=0&&cx<FW&&cy<FH) W[cy*FW+cx]=1; };
  const disc=(cx,cy,r)=>{
    for(let y=cy-r;y<=cy+r;y++) for(let x=cx-r;x<=cx+r;x++){
      const dx=x-cx,dy=y-cy;
      if(dx*dx+dy*dy<=r*r) set(x,y);
    }
  };
  // --- tenger a térkép egyik szélén, hullámos partvonallal ---
  const M=curMap();
  const side=srangeInt(0,3), depth=Math.round((4+srangeInt(0,3))*M.sea), ph=srange(0,TAU);
  if(M.sea>0){                                    // tenger csak ott, ahol a típus kéri
    const len=(side<2)?FW:FH;
    for(let i=0;i<len;i++){
      const d=Math.max(1,Math.round(depth+dsin(i*0.17+ph)*2.4+dsin(i*0.061)*2));
      for(let j=0;j<d;j++){
        if(side===0) set(i,j);
        else if(side===1) set(i,FH-1-j);
        else if(side===2) set(j,i);
        else set(FW-1-j,i);
      }
    }
  }
  // --- tavak ---
  for(let k=0;k<M.lakes;k++){
    const cx=srangeInt(14,FW-15), cy=srangeInt(10,FH-11), r=3+srangeInt(0,2);
    disc(cx,cy,r);
    for(let m=0;m<5;m++) disc(cx+srangeInt(-r,r),cy+srangeInt(-r,r),Math.max(2,r-1));
  }
  // --- folyók: a típus szerinti számban, a tengerből vagy a szélről indulva ---
  for(let riv=0;riv<M.rivers;riv++) makeRiver(set,disc,side,depth);
}
function makeRiver(set,disc,side,depth){
  let rx,ry,dx,dy;
  if(side===0){ rx=srangeInt(10,FW-11); ry=depth; dx=0; dy=1; }
  else if(side===1){ rx=srangeInt(10,FW-11); ry=FH-1-depth; dx=0; dy=-1; }
  else if(side===2){ rx=depth; ry=srangeInt(8,FH-9); dx=1; dy=0; }
  else { rx=FW-1-depth; ry=srangeInt(8,FH-9); dx=-1; dy=0; }
  const steps=Math.round(((side<2)?FH:FW)*srange(0.35,0.55));
  let wob=srange(0,TAU);
  for(let i=0;i<steps;i++){
    const wide=Math.max(1,Math.round(2.6-2.2*i/steps));
    disc(Math.round(rx),Math.round(ry),wide);
    wob+=srange(-0.35,0.35);
    rx+=dx+(dx?0:dsin(wob)*1.1);
    ry+=dy+(dy?0:dsin(wob)*1.1);
    if(rx<1||ry<1||rx>FW-2||ry>FH-2) break;
  }
}
// Van-e szárazföldi út a két pont között? Ha nincs, gázlót vágunk.
function ensureLandPath(ax,ay,bx,by){
  const W=G.water;
  const start=waterIdx(ax,ay), goal=waterIdx(bx,by);
  if(start<0||goal<0) return;
  const seen=new Uint8Array(FW*FH), q=new Int32Array(FW*FH);
  let qh=0,qt=0;
  q[qt++]=start; seen[start]=1;
  const NX=[1,-1,0,0], NY=[0,0,1,-1];
  while(qh<qt){
    const cur=q[qh++];
    if(cur===goal) return;                       // van út, nincs teendő
    const cy=(cur/FW)|0, cx=cur-cy*FW;
    for(let k=0;k<4;k++){
      const nx=cx+NX[k], ny=cy+NY[k];
      if(nx<0||ny<0||nx>=FW||ny>=FH) continue;
      const ni=ny*FW+nx;
      if(seen[ni]||W[ni]) continue;
      seen[ni]=1; q[qt++]=ni;
    }
  }
  // Nincs átjárás: három cella széles gázlót vágunk a két bázis között
  const n=Math.ceil(Math.hypot(bx-ax,by-ay)/(FOG_CELL*0.5));
  for(let i=0;i<=n;i++){
    const t=i/n;
    dryOut(ax+(bx-ax)*t, ay+(by-ay)*t, FOG_CELL*1.6);
  }
}

// Halrajok a nyílt vízen, a parttól nem túl messze — hogy a kikötőből
// elérhetők legyenek, de azért ki kelljen hajózni értük.
function scatterFish(){
  let placed=0;
  for(let tries=0;tries<4000&&placed<26;tries++){
    const x=srange(60,WORLD.w-60), y=srange(60,WORLD.h-60);
    if(!isWater(x,y)) continue;
    let close=false;
    for(const n of G.nodes) if(n.type==='fish'&&dist(n.x,n.y,x,y)<90){close=true;break;}
    if(close) continue;
    G.nodes.push(makeNode('fish',x,y)); placed++;
  }
}

// Egy parti épület rakodóhelye: a hozzá legközelebbi nyílt víz. A hajó
// ide hozza a fogást, nem az épület közepéhez — oda ugyanis nem tudna
// eljutni, mert a kikötő szárazon áll.
function dockOf(b){
  if(b._dock) return b._dock;
  for(let r=24;r<=240;r+=8)
    for(let k=0;k<28;k++){
      const a=k/28*TAU, x=b.x+dcos(a)*r, y=b.y+dsin(a)*r;
      if(isWater(x,y)){ b._dock={x,y}; return b._dock; }
    }
  b._dock={x:b.x,y:b.y};
  return b._dock;
}

// A halrajok is pótlódnak, különben a vízi gazdaság végleg kiszárad —
// a szárazföldi lelőhelyek már eddig is visszanőttek.
// A szén is pótlódik, mint a többi lelőhely
function regrowCoal(dt){
  G.coalT=(G.coalT===undefined?60:G.coalT)-dt;
  if(G.coalT>0) return;
  G.coalT=55;
  if(G.nodes.filter(n=>n.type==='coal'&&!n.dead).length>=14) return;
  for(let i=0;i<500;i++){
    const x=srange(120,WORLD.w-120), y=srange(120,WORLD.h-120);
    if(isWater(x,y)) continue;
    let close=false;
    for(const n of G.nodes) if(!n.dead&&dist(n.x,n.y,x,y)<120){close=true;break;}
    if(close) continue;
    G.nodes.push(makeNode('coal',x,y));
    return;
  }
}
function regrowFish(dt){
  G.fishT=(G.fishT===undefined?38:G.fishT)-dt;
  if(G.fishT>0) return;
  G.fishT=44;
  const cnt=G.nodes.filter(n=>n.type==='fish'&&!n.dead).length;
  if(cnt>=22) return;
  for(let i=0;i<600;i++){
    const x=srange(60,WORLD.w-60), y=srange(60,WORLD.h-60);
    if(!isWater(x,y)) continue;
    let close=false;
    for(const n of G.nodes) if(n.type==='fish'&&!n.dead&&dist(n.x,n.y,x,y)<110){close=true;break;}
    if(close) continue;
    G.nodes.push(makeNode('fish',x,y));
    return;
  }
}

/* ---------- megjelenítés ----------

   A víz két rétegben készül, mert a kettőnek más a költsége:

   1. A NYÍLT VÍZ egyszínű. Ezt cellasorokból összefűzött téglalapokkal
      töltjük ki — egyetlen kitöltés, gyakorlatilag ingyen.
   2. A PARTVONAL az, ami szép: sekélyedő víz és homoksáv, lágy átmenettel.
      Ez marad felnagyított kép simítással, de már csak a partsávra, nem
      az egész képernyőre.

   Korábban a teljes vízfelület felnagyított képként került a vászonra,
   és a szoftveres rajzoló minden képpontot kétszer mintavételezett. Nyílt
   víz fölött ez 162 ms volt képkockánként.
   ------------------------------------------------------------------ */
let edgeMask=null, waterDepth=null, wetCv=null;
const DEEP='#0c2e4a';
function paintWater(){
  if(!waterCv){
    waterCv=document.createElement('canvas'); waterCv.width=FW; waterCv.height=FH;
    waterCtx=waterCv.getContext('2d'); waterImg=waterCtx.createImageData(FW,FH);
    waterMid=document.createElement('canvas');
    /* Fél-világ felbontás: FOG_CELL/2 px/cella → le kell kicsinyíteni a
       képernyőre, nem nagyítani, tehát nincs kockásodás. */
    waterMid.width=FW*(FOG_CELL/2); waterMid.height=FH*(FOG_CELL/2);
  }
  const W=G.water, d=waterImg.data;
  edgeMask=new Uint8Array(FW*FH);
  /* A víz színe a parttól mért távolságtól függ: a sekély szegély türkiz,
     a nyílt víz mély kék. A távolságot egyszerű hullámterjesztéssel
     számoljuk a szárazföldtől kifelé. */
  const MELY_MAX=6;
  waterDepth=new Uint8Array(FW*FH);
  {
    let sor=[];
    for(let i=0;i<W.length;i++){
      if(W[i]) continue;
      const cy=(i/FW)|0, cx=i-cy*FW;
      for(let yy=-1;yy<=1;yy++) for(let xx=-1;xx<=1;xx++){
        const nx=cx+xx, ny=cy+yy;
        if(nx<0||ny<0||nx>=FW||ny>=FH) continue;
        const j=ny*FW+nx;
        if(W[j]&&!waterDepth[j]){ waterDepth[j]=1; sor.push(j); }
      }
    }
    for(let szint=1;szint<MELY_MAX&&sor.length;szint++){
      const kov=[];
      for(const i of sor){
        const cy=(i/FW)|0, cx=i-cy*FW;
        for(let yy=-1;yy<=1;yy++) for(let xx=-1;xx<=1;xx++){
          const nx=cx+xx, ny=cy+yy;
          if(nx<0||ny<0||nx>=FW||ny>=FH) continue;
          const j=ny*FW+nx;
          if(W[j]&&!waterDepth[j]){ waterDepth[j]=szint+1; kov.push(j); }
        }
      }
      sor=kov;
    }
  }
  const deepC=[12,46,74], shallowC=[62,148,164], sandC=[196,178,132];
  // Első menet: melyik cella tartozik a partsávhoz?
  for(let i=0;i<W.length;i++){
    const cy=(i/FW)|0, cx=i-cy*FW;
    let mixed=false;
    for(let yy=-1;yy<=1&&!mixed;yy++) for(let xx=-1;xx<=1;xx++){
      const nx=cx+xx, ny=cy+yy;
      if(nx<0||ny<0||nx>=FW||ny>=FH) continue;
      if(!!W[ny*FW+nx]!==!!W[i]){ mixed=true; break; }
    }
    if(mixed) edgeMask[i]=1;
    // a lágy átmenethez a part KÖRÜLI cellák is kellenek
    if(mixed) for(let yy=-1;yy<=1;yy++) for(let xx=-1;xx<=1;xx++){
      const nx=cx+xx, ny=cy+yy;
      if(nx<0||ny<0||nx>=FW||ny>=FH) continue;
      edgeMask[ny*FW+nx]=1;
    }
  }
  /* NEDVESSÉG-MEZŐ.

     A partvonal korábban cellánként kapott színt: víz vagy homok, éles
     határral. Felnagyítva ez lépcsőzött, és ez volt a kép legrégiesebb
     eleme.

     Most minden cellához FOLYTONOS értéket számolunk (0 = száraz,
     1 = nyílt víz), és ezt kétszer elsimítjuk. A színt ebből az értékből
     olvassuk ki — így a part lágy görbe lesz, nem lépcső. A JÁTÉKMENET
     változatlan: az `isWater()` továbbra is a nyers rácsból dolgozik,
     csak a kép lett szebb. */
  let ned=new Float32Array(FW*FH);
  for(let i=0;i<W.length;i++) ned[i]=W[i]?1:0;
  for(let menet=0;menet<2;menet++){
    const be=ned, ki=new Float32Array(FW*FH);
    for(let cy=0;cy<FH;cy++) for(let cx=0;cx<FW;cx++){
      let sum=0, db=0;
      for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){
        const nx=cx+dx, ny=cy+dy;
        if(nx<0||ny<0||nx>=FW||ny>=FH) continue;
        const w=(dx&&dy)?1:2;                 // az átlós szomszéd kevesebbet nyom
        sum+=be[ny*FW+nx]*w; db+=w;
      }
      ki[cy*FW+cx]=sum/db;
    }
    ned=ki;
  }

  // A partsáv képe. A nyílt víz átlátszó marad, azt téglalapokkal töltjük.
  for(let i=0;i<W.length;i++){
    const o=i*4;
    const melyseg=waterDepth[i];
    /* MINDEN vízcella kap színt, nem csak a partsáv. Korábban a nyílt víz
       átlátszó maradt, és a felnagyításkor a kép széle beleolvadt az
       átlátszóba — a lapos mélyvíz-kitöltéssel varrat keletkezett, ami
       négyzetes foltokként látszott. Átlátszó csak a szárazföld belseje. */
    if(!W[i]&&!edgeMask[i]){ d[o+3]=0; continue; }
    const n=ned[i];
    if(n<0.46){
      // száraz oldal: homok, a víz felé erősödve
      const t=clamp(n/0.46,0,1);
      d[o]=sandC[0]; d[o+1]=sandC[1]; d[o+2]=sandC[2];
      d[o+3]=Math.round(120+135*t);
    }else if(n<0.62){
      // a vízvonal: homokból sekély vízbe olvad
      const t=(n-0.46)/0.16;
      d[o]  =sandC[0]+(shallowC[0]-sandC[0])*t;
      d[o+1]=sandC[1]+(shallowC[1]-sandC[1])*t;
      d[o+2]=sandC[2]+(shallowC[2]-sandC[2])*t;
      d[o+3]=255;
    }else{
      // sekélyből mélybe, a parttól mért távolság szerint
      const t=clamp((melyseg-1)/6,0,1);
      d[o]  =shallowC[0]+(deepC[0]-shallowC[0])*t;
      d[o+1]=shallowC[1]+(deepC[1]-shallowC[1])*t;
      d[o+2]=shallowC[2]+(deepC[2]-shallowC[2])*t;
      d[o+3]=255;
    }
  }
  /* LÁGY VÍZMASZK. A hullámzás rétegének pontosan ott kell látszania, ahol
     víz van — de a partvonal már NEM cellahatár, hanem lágy görbe. Ezért a
     maszkot is a nedvesség-mezőből készítjük: felnagyítva ugyanazt a görbét
     követi, így a hullámzás széle nem vág négyzetes lyukat a partba. */
  if(!wetCv){ wetCv=document.createElement('canvas'); }
  if(wetCv.width!==FW||wetCv.height!==FH){ wetCv.width=FW; wetCv.height=FH; }
  {
    const wg=wetCv.getContext('2d');
    const wi=wg.createImageData(FW,FH), wd=wi.data;
    for(let i=0;i<FW*FH;i++){
      const n=ned[i];
      const a=n<=0.52?0:Math.min(1,(n-0.52)/0.22);
      wd[i*4]=255; wd[i*4+1]=255; wd[i*4+2]=255;
      wd[i*4+3]=Math.round(255*a*a*(3-2*a));
    }
    wg.putImageData(wi,0,0);
  }
  waterCtx.putImageData(waterImg,0,0);
  const mg=waterMid.getContext('2d');
  mg.clearRect(0,0,waterMid.width,waterMid.height);
  mg.imageSmoothingEnabled=true;
  mg.imageSmoothingQuality='high';
  mg.drawImage(waterCv,0,0,waterMid.width,waterMid.height);
}
// A látható cellatartomány
function viewCells(){
  return { c0:Math.max(0,Math.floor(G.cam.x/FOG_CELL)-1),
           c1:Math.min(FW-1,Math.ceil((G.cam.x+G.vw)/FOG_CELL)+1),
           r0:Math.max(0,Math.floor(G.cam.y/FOG_CELL)-1),
           r1:Math.min(FH-1,Math.ceil((G.cam.y+G.vh)/FOG_CELL)+1) };
}
function drawWater(){
  if(!waterMid||!G.water||!edgeMask) return;
  const v=viewCells(), W=G.water, S=FOG_CELL;
  let anyWater=false;
  // --- 1. nyílt víz: sorokba fűzött téglalapok, egyetlen kitöltéssel ---
  ctx.beginPath();
  for(let ry=v.r0;ry<=v.r1;ry++){
    let run=-1;
    for(let rx=v.c0;rx<=v.c1+1;rx++){
      const i=ry*FW+rx;
      const inW=(rx<=v.c1)&&W[i]&&!edgeMask[i];
      if(W[i]) anyWater=true;
      if(inW&&run<0) run=rx;
      else if(!inW&&run>=0){
        ctx.rect(run*S-G.cam.x,ry*S-G.cam.y,(rx-run)*S,S);
        run=-1;
      }
    }
  }
  ctx.fillStyle=DEEP; ctx.fill();
  if(!anyWater) return;
  /* --- 2. a víz képe: EGYETLEN felnagyítás a látható területre ---
     Korábban futamonként rajzoltuk, ami a futamok szélén varratot hagyott.
     Egyben rajzolva nincs határ, és gyorsabb is: egy drawImage sok helyett. */
  ctx.save();
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  const sc=waterMid.width/FW;                     // képpont / cella
  const x0=v.c0, x1=v.c1+1, y0=v.r0, y1=v.r1+1;
  ctx.drawImage(waterMid,
    x0*sc, y0*sc, (x1-x0)*sc, (y1-y0)*sc,
    x0*S-G.cam.x, y0*S-G.cam.y, (x1-x0)*S, (y1-y0)*S);
  ctx.restore();
  // --- 3. csillogás: néhány lassan úszó fénysáv, a vízre vágva ---
  if(REDUCED||G.lowFx) return;
  ctx.save();
  ctx.beginPath();
  for(let ry=v.r0;ry<=v.r1;ry++){
    let run=-1;
    for(let rx=v.c0;rx<=v.c1+1;rx++){
      const i=ry*FW+rx, inW=(rx<=v.c1)&&W[i];
      if(inW&&run<0) run=rx;
      else if(!inW&&run>=0){ ctx.rect(run*S-G.cam.x,ry*S-G.cam.y,(rx-run)*S,S); run=-1; }
    }
  }
  ctx.clip();
  ctx.fillStyle='rgba(150,205,230,.06)';
  for(let i=0;i<2;i++){                           // két sáv is elég a mozgáshoz
    const y=((G.t*9+i*300)%(G.vh+400))-200;
    ctx.beginPath();
    ctx.ellipse(G.cam.x+G.vw*0.5-G.cam.x, y, G.vw*0.62, 26+i*6, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/* =======================================================================
   HEGYEK

   A hegyvonulat ugyanazon a cellarácson él, mint a víz, de szárazon:
   járhatatlan sziklatömeg, amit sem gyalogos, sem hajó nem tud átlépni —
   csak a repülő. A völgyeket szándékosan meghagyjuk, és a két bázis
   között mindig marad átjáró.
   ===================================================================== */
let rockCv,rockCtx,rockImg,rockMid;

function isRock(x,y){
  if(!G.rock) return false;
  const i=waterIdx(x,y);
  return i>=0 && !!G.rock[i];
}
// Hegyvonulat: kanyargó gerinc, körülötte lankákkal
function genMountains(){
  const R=G.rock=new Uint8Array(FW*FH);
  const M=curMap();
  const n=M.mountains||0;
  if(!n) return;
  const set=(cx,cy)=>{ if(cx>=0&&cy>=0&&cx<FW&&cy<FH&&!G.water[cy*FW+cx]) R[cy*FW+cx]=1; };
  const disc=(cx,cy,r)=>{
    for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++)
      if(dx*dx+dy*dy<=r*r) set(cx+dx,cy+dy);
  };
  for(let k=0;k<n;k++){
    let x=srangeInt(8,FW-9), y=srangeInt(6,FH-7);
    let a=srange(0,TAU);
    const len=18+srangeInt(0,16);
    for(let i=0;i<len;i++){
      const r=1+((i>len*0.2&&i<len*0.8)?srangeInt(1,2):0);
      disc(Math.round(x),Math.round(y),r);
      a+=srange(-0.5,0.5);
      x+=dcos(a)*1.7; y+=dsin(a)*1.7;
      if(x<4||x>FW-5||y<3||y>FH-4){ a+=Math.PI; x=clamp(x,4,FW-5); y=clamp(y,3,FH-4); }
    }
  }
}
// A bázisok körül elhordjuk a sziklát, hogy legyen hely építkezni
function clearRock(x,y,r){
  if(!G.rock) return;
  const cx=Math.floor(x/FOG_CELL), cy=Math.floor(y/FOG_CELL), cr=Math.ceil(r/FOG_CELL);
  for(let dy=-cr;dy<=cr;dy++) for(let dx=-cr;dx<=cr;dx++){
    const nx=cx+dx, ny=cy+dy;
    if(nx<0||ny<0||nx>=FW||ny>=FH) continue;
    if(dx*dx+dy*dy<=cr*cr) G.rock[ny*FW+nx]=0;
  }
}
// Szárazföldi átjáró a hegyek között is: ha nincs, hágót vágunk
function ensureRockPath(ax,ay,bx,by){
  if(!G.rock) return;
  const start=waterIdx(ax,ay), goal=waterIdx(bx,by);
  if(start<0||goal<0) return;
  const blocked=i=>G.water[i]||G.rock[i];
  const seen=new Uint8Array(FW*FH), q=new Int32Array(FW*FH);
  let h=0,t=0; q[t++]=start; seen[start]=1;
  while(h<t){
    const i=q[h++];
    if(i===goal) return;                       // van út, nincs teendő
    const cx=i%FW, cy=(i/FW)|0;
    for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=cx+d[0], ny=cy+d[1];
      if(nx<0||ny<0||nx>=FW||ny>=FH) continue;
      const j=ny*FW+nx;
      if(seen[j]||blocked(j)) continue;
      seen[j]=1; q[t++]=j;
    }
  }
  // nincs átjáró: egyenes hágót vágunk a két pont között
  const steps=Math.ceil(Math.hypot(bx-ax,by-ay)/FOG_CELL)*2;
  for(let s=0;s<=steps;s++){
    const px=ax+(bx-ax)*s/steps, py=ay+(by-ay)*s/steps;
    clearRock(px,py,FOG_CELL*1.6);
  }
}
/* ---------- a hegyek képe ----------
   A sziklafelületet EGYSZER rajzoljuk meg egy nagyobb felbontású képre:
   a tömeget, a megvilágított gerincet és a törésfelületeket is. Korábban
   ez képkockánként készült, ami önmagában 109 ms-ot vitt el — most a
   rajzolás annyi, mint egy képmásolás.
   ------------------------------------------------------------------ */
function paintRock(){
  if(!G.rock) return;
  const SC=FOG_CELL/2;                           // képpont / cella (fél-világ felbontás)
  if(!rockCv){
    rockCv=document.createElement('canvas'); rockCv.width=FW; rockCv.height=FH;
    rockCtx=rockCv.getContext('2d'); rockImg=rockCtx.createImageData(FW,FH);
    rockMid=document.createElement('canvas'); rockMid.width=FW*SC; rockMid.height=FH*SC;
  }
  const R=G.rock, d=rockImg.data;
  for(let i=0;i<R.length;i++){
    const o=i*4, cy=(i/FW)|0, cx=i-cy*FW;
    if(!R[i]){ d[o+3]=0; continue; }
    let n=0;
    for(let yy=-1;yy<=1;yy++) for(let xx=-1;xx<=1;xx++){
      const nx=cx+xx, ny=cy+yy;
      if(nx<0||ny<0||nx>=FW||ny>=FH){n++;continue;}
      if(R[ny*FW+nx]) n++;
    }
    const t=clamp((n-4)/5,0,1);
    const base=[74,72,64], top=[138,134,124];
    d[o]  =base[0]+(top[0]-base[0])*t;
    d[o+1]=base[1]+(top[1]-base[1])*t;
    d[o+2]=base[2]+(top[2]-base[2])*t;
    d[o+3]=255;
  }
  rockCtx.putImageData(rockImg,0,0);
  const mg=rockMid.getContext('2d');
  mg.setTransform(1,0,0,1,0,0);
  mg.clearRect(0,0,rockMid.width,rockMid.height);
  mg.imageSmoothingEnabled=true;
  mg.imageSmoothingQuality='high';
  // A vetett árnyék is ide kerül, jobbra-lefelé csúsztatva. Így rajzoláskor
  // EGYETLEN képmásolás elég — korábban kettő kellett, ami a legrosszabb
  // esetben (teli képernyős hegy) megduplázta a költséget.
  mg.globalAlpha=0.34;
  mg.filter='brightness(0.12)';
  mg.drawImage(rockCv,SC*0.22,SC*0.28,rockMid.width,rockMid.height);
  mg.filter='none';
  mg.globalAlpha=1;
  mg.drawImage(rockCv,0,0,rockMid.width,rockMid.height);
  // megvilágított gerinc: ugyanaz a kép feljebb csúsztatva, halványan
  mg.globalAlpha=0.3;
  mg.drawImage(rockCv,-SC*0.9,-SC*1.7,rockMid.width,rockMid.height);
  mg.globalAlpha=1;
  // törésfelületek és repedések — egyszer, a képbe sütve
  mg.save();
  mg.beginPath();
  for(let i=0;i<R.length;i++) if(R[i]){
    const cy=(i/FW)|0, cx=i-cy*FW;
    mg.rect(cx*SC,cy*SC,SC,SC);
  }
  mg.clip();
  for(let i=0;i<R.length;i++){
    if(!R[i]) continue;
    const cy=(i/FW)|0, cx=i-cy*FW;
    let sd=(i*2654435761)>>>0;
    const rr=()=>{ sd=(sd*1664525+1013904223)>>>0; return sd/4294967296; };
    for(let k=0;k<3;k++){
      const px=cx*SC+rr()*SC, py=cy*SC+rr()*SC, w2=1.3+rr()*2.8, h2=1+rr()*2.2;
      mg.fillStyle=rr()<0.5?'rgba(226,226,220,.13)':'rgba(34,32,28,.26)';
      mg.beginPath();
      mg.moveTo(px,py); mg.lineTo(px+w2,py-h2*0.4);
      mg.lineTo(px+w2*0.7,py+h2); mg.lineTo(px-w2*0.2,py+h2*0.6);
      mg.closePath(); mg.fill();
    }
    mg.strokeStyle='rgba(38,36,32,.28)'; mg.lineWidth=0.5;
    mg.beginPath();
    mg.moveTo(cx*SC+rr()*SC,cy*SC);
    mg.lineTo(cx*SC+rr()*SC,cy*SC+SC*0.6);
    mg.lineTo(cx*SC+rr()*SC,cy*SC+SC);
    mg.stroke();
  }
  mg.restore();
}
function drawRocks(){
  if(!rockMid||!G.rock) return;
  const v=viewCells(), S=FOG_CELL;
  // A látható sziklák befoglaló doboza. Soronkénti másolásnál minden
  // képpont háromszor rajzolódott volna — egyetlen másolás sokkal olcsóbb,
  // a doboz üres részei pedig átlátszóak.
  let a0=1e9,b0=-1e9,c0=1e9,d0=-1e9;
  for(let ry=v.r0;ry<=v.r1;ry++) for(let rx=v.c0;rx<=v.c1;rx++){
    if(!G.rock[ry*FW+rx]) continue;
    if(rx<a0)a0=rx; if(rx>b0)b0=rx; if(ry<c0)c0=ry; if(ry>d0)d0=ry;
  }
  if(b0<a0) return;                              // nincs szikla a képen
  const x0=Math.max(0,a0-1), x1=Math.min(FW,b0+2);
  const y0=Math.max(0,c0-1), y1=Math.min(FH,d0+2);
  const sc=rockMid.width/FW;
  ctx.save();
  // Takarékos módban a simítás is kimarad: a hegy szélei szögletesebbek
  // lesznek, cserébe a másolás töredékébe kerül.
  ctx.imageSmoothingEnabled=!G.lowFx;
  if(!G.lowFx) ctx.imageSmoothingQuality='high';
  const blit=(dx,dy,alpha)=>{
    if(alpha!==undefined) ctx.globalAlpha=alpha;
    ctx.drawImage(rockMid, x0*sc,y0*sc,(x1-x0)*sc,(y1-y0)*sc,
                  x0*S-G.cam.x+dx, y0*S-G.cam.y+dy, (x1-x0)*S, (y1-y0)*S);
    ctx.globalAlpha=1;
  };
  blit(0,0);                                     // a sziklatömeg, árnyékkal együtt
  ctx.restore();
}
