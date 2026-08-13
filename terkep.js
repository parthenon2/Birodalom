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
  if(!waterCv||waterCv.width!==FW||waterCv.height!==FH){
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

/* =======================================================================
   6/D. TEREP — magasság, mocsár, sűrű erdő

   A térkép eddig díszlet volt: egyenletes zöld, amin mindenki ugyanúgy
   mozgott és ugyanolyan messzire látott. Ez a réteg ellenféllé teszi.

   Három dolgot vezet be, mind ugyanazon a 32 pixeles cellarácson, amin a
   víz, a szikla és a köd is él — így a négy rendszer együtt tud dolgozni,
   és nem kell külön keresgélni.

     MAGASSÁG (0–3)
       A dombon állva messzebb LÁTSZ és messzebb LŐSZ. Ez egyetlen
       szabály, de átírja a taktikát: hirtelen számít, hol állsz. A
       felfelé menet lassabb is, tehát a magaslat megtartható.

     MOCSÁR
       Mély fekvésű, vízhez közeli cellák. Lassít, és a látótávolságot is
       rontja — a párás mélyföldön nem látni messzire.

     SŰRŰ ERDŐ
       Ahol sok a fa. Lassít, takar (kisebb látótáv), viszont
       védelmet ad: aki benne áll, nehezebben található el.

   MIÉRT DETERMINISZTIKUS?
   Mert a szimulációt érinti — a sebességet és a lőtávot. A mezők a
   világ létrehozásakor, a SZIMULÁCIÓS MAGBÓL készülnek, és onnantól
   csak olvassuk őket. Így minden gépen ugyanaz a domb ugyanott van.
   ===================================================================== */

/* A hatások mértéke. Szándékosan visszafogott: a terep befolyásolja a
   csatát, de nem dönti el helyette. */
const MAGAS_LATAS  = 0.13;   // szintenként ennyivel nő a látótáv
const MAGAS_LOTAV  = 0.10;   // szintenként ennyivel nő a lőtáv
const MAGAS_LASSU  = 0.07;   // szintenként ennyivel lassabb a felfelé menet
const MOCSAR_SEB   = 0.62;   // mocsárban ennyiszeres a sebesség
const MOCSAR_LATAS = 0.80;
const ERDO_SEB     = 0.82;
const ERDO_LATAS   = 0.78;
const ERDO_VEDELEM = 0.85;   // erdőben ennyiszeres az elszenvedett sebzés

const TEREP_SIMA = 0, TEREP_MOCSAR = 1, TEREP_ERDO = 2;

function terepIdx(x, y){
  const cx = Math.floor(x / FOG_CELL), cy = Math.floor(y / FOG_CELL);
  if(cx < 0 || cy < 0 || cx >= FW || cy >= FH) return -1;
  return cy * FW + cx;
}
function magasAt(x, y){
  if(!G.magas) return 0;
  const i = terepIdx(x, y);
  return i >= 0 ? G.magas[i] : 0;
}
function terepAt(x, y){
  if(!G.terep) return TEREP_SIMA;
  const i = terepIdx(x, y);
  return i >= 0 ? G.terep[i] : TEREP_SIMA;
}

/* --- A HATÁSOK ---
   Mindegyik egyetlen szorzót ad vissza, hogy a hívó oldalon egy
   szorzásnál többet ne kelljen érteni. */
function terepLatas(x, y){
  let m = 1 + magasAt(x, y) * MAGAS_LATAS;
  const t = terepAt(x, y);
  if(t === TEREP_MOCSAR) m *= MOCSAR_LATAS;
  else if(t === TEREP_ERDO) m *= ERDO_LATAS;
  return m;
}
function terepLotav(x, y){
  return 1 + magasAt(x, y) * MAGAS_LOTAV;
}
/* A sebesség a CÉLCELLA terepétől és az emelkedőtől függ. Lefelé menet
   nem gyorsít: a lejtőn rohanni sem könnyebb, csak veszélyesebb. */
function terepSebesseg(x, y, honnanX, honnanY){
  let m = 1;
  const t = terepAt(x, y);
  if(t === TEREP_MOCSAR) m *= MOCSAR_SEB;
  else if(t === TEREP_ERDO) m *= ERDO_SEB;
  if(honnanX !== undefined){
    const emelkedo = magasAt(x, y) - magasAt(honnanX, honnanY);
    if(emelkedo > 0) m *= Math.max(0.55, 1 - emelkedo * MAGAS_LASSU);
  }
  return m;
}
function terepVedelem(x, y){
  return terepAt(x, y) === TEREP_ERDO ? ERDO_VEDELEM : 1;
}

/* =======================================================================
   A TEREP LÉTREHOZÁSA

   A magasság két, egymásra rakott zajrétegből áll: néhány nagy, lankás
   dombhát, fölötte apróbb hullámzás. Így nem lesz se lapos, se kockás.

   A sziklák köré magasabb terepet teszünk — a hegy lába természetesen
   emelkedik —, a víz köré alacsonyabbat.
   ===================================================================== */
function genTerep(){
  const N = FW * FH;
  const mag = G.magas = new Uint8Array(N);
  const ter = G.terep = new Uint8Array(N);

  /* Néhány dombközéppont a szimulációs magból. A számuk a térkép
     méretével nő, hogy a nagy pályák se legyenek üresek. */
  /* Hány domb? Az első kimérésnél négy volt, és a térkép 92%-a sík
     maradt — a magaslat így csak elvi lehetőség lett volna, a játékos
     sosem találkozik vele. Most jóval sűrűbben és nagyobb sugárral. */
  const db = Math.max(10, Math.round((FW * FH) / 700));
  const dombok = [];
  for(let i = 0; i < db; i++){
    dombok.push({
      x: srange(0, FW), y: srange(0, FH),
      r: srange(9, 26),                       // cellában mért sugár
      h: srange(0.6, 1.1)
    });
  }

  for(let cy = 0; cy < FH; cy++){
    for(let cx = 0; cx < FW; cx++){
      const i = cy * FW + cx;
      let h = 0;
      for(const d of dombok){
        const dx = cx - d.x, dy = cy - d.y;
        const t = Math.hypot(dx, dy) / d.r;
        if(t < 1) h += d.h * (1 - t * t);     // lágy, gömbölyű lanka
      }
      /* Apró hullámzás, hogy ne legyen műanyagsima. Rácshelyzetből
         számolt álvéletlen: minden gépen ugyanaz, és nem fogyasztja a
         szimulációs magot. */
      const zaj = (((cx * 73856093) ^ (cy * 19349663)) >>> 0) % 1000 / 1000;
      h += zaj * 0.28;

      /* A küszöbök úgy vannak beállítva, hogy a térkép nagyjából fele
         legyen sík, negyede enyhe lanka, a maradék domb és magaslat. Így
         a magasság valódi tényező, de nem lesz belőle holdbéli táj. */
      let szint = h < 0.34 ? 0 : (h < 0.62 ? 1 : (h < 0.98 ? 2 : 3));

      /* A hegy lába emelkedik, a víz partja süllyed. */
      if(G.rock && G.rock[i]) szint = 3;
      if(G.water && G.water[i]) szint = 0;
      mag[i] = szint;
    }
  }

  /* MOCSÁR: mély fekvésű, vízhez közeli szárazföld. A partot magát nem
     tesszük mocsárrá — az a kikötők helye. */
  if(G.water){
    for(let cy = 1; cy < FH - 1; cy++){
      for(let cx = 1; cx < FW - 1; cx++){
        const i = cy * FW + cx;
        if(G.water[i] || (G.rock && G.rock[i])) continue;
        if(mag[i] > 0) continue;
        let viz = 0;
        for(let dy = -3; dy <= 3; dy++) for(let dx = -3; dx <= 3; dx++){
          const nx = cx + dx, ny = cy + dy;
          if(nx < 0 || ny < 0 || nx >= FW || ny >= FH) continue;
          if(G.water[ny * FW + nx]) viz++;
        }
        /* Elég víz a közelben, de ne közvetlenül a parton. */
        if(viz >= 4 && viz <= 16) ter[i] = TEREP_MOCSAR;
      }
    }
  }
  return { dombok: db };
}

/* SŰRŰ ERDŐ: a fa-lelőhelyek sűrűsége alapján, MIUTÁN a nyersanyagok
   kikerültek a térképre. Ezért külön lépés — a genTerep-ben még nem
   tudnánk, hol vannak a fák. */
function genErdoSuruseg(){
  if(!G.terep || !G.nodes) return 0;
  const szamlalo = new Uint8Array(FW * FH);
  for(const n of G.nodes){
    if(n.type !== 'wood') continue;
    const i = terepIdx(n.x, n.y);
    if(i >= 0 && szamlalo[i] < 255) szamlalo[i]++;
  }
  let db = 0;
  for(let cy = 1; cy < FH - 1; cy++){
    for(let cx = 1; cx < FW - 1; cx++){
      const i = cy * FW + cx;
      if(G.terep[i] !== TEREP_SIMA) continue;
      /* A cella és a szomszédjai együtt: így összefüggő erdőfolt lesz,
         nem szórvány. */
      let s = 0;
      for(let dy = -1; dy <= 1; dy++) for(let dx = -1; dx <= 1; dx++)
        s += szamlalo[(cy + dy) * FW + (cx + dx)];
      if(s >= 5){ G.terep[i] = TEREP_ERDO; db++; }
    }
  }
  return db;
}

/* =======================================================================
   6/C. A KARIB-TENGER

   A kalózvilág térképe nem sorsolt, hanem rögzített: Florida csücske,
   Kuba hosszú szigete, a Bahama-szigetek füzére, Jamaica, Hispaniola,
   Tortuga és a Kajmán-szigetek — nagyjából a valódi elrendezés szerint.

   A partokat sokszögekből rajzoljuk a ködráccsal azonos felbontásban.
   Minden érték a pálya arányában (0..1) van megadva, így a világ méretének
   változása nem borítja fel a térképet.
   ===================================================================== */

/* Szárazföldi alakzatok. Minden bejegyzés vagy sokszög (pontok listája),
   vagy ellipszis {e:[x,y,rx,ry,forgás]}. A koordináták 0..1 arányok. */
const KARIB_FOLD=[
  // --- Florida csücske: felül, kissé balra ---
  {p:[[0.24,-0.05],[0.40,-0.05],[0.42,0.05],[0.40,0.12],[0.35,0.17],[0.31,0.15],[0.28,0.08],[0.24,0.03]]},
  // --- Kuba: hosszú, enyhén ívelt sziget a térkép közepén ---
  {p:[[0.10,0.44],[0.20,0.41],[0.30,0.42],[0.40,0.45],[0.50,0.49],[0.58,0.53],[0.66,0.58],[0.70,0.63],
      [0.68,0.67],[0.60,0.64],[0.50,0.60],[0.40,0.56],[0.30,0.53],[0.20,0.50],[0.11,0.50]]},
  // --- Isla de la Juventud: kis sziget Kuba alatt, nyugaton ---
  {e:[0.245,0.575,0.045,0.028,0]},
  // --- Bahama-szigetek: hosszú, keskeny szigetek füzére északkeleten ---
  {e:[0.575,0.07,0.018,0.075,0.2]},
  {e:[0.615,0.135,0.014,0.055,0.35]},
  {e:[0.566,0.205,0.052,0.072,0.12]},         // New Providence — Nassau kikötője
  {e:[0.635,0.235,0.013,0.062,0.25]},
  {e:[0.700,0.30,0.016,0.050,0.30]},
  {e:[0.745,0.375,0.014,0.045,0.20]},
  {e:[0.800,0.42,0.017,0.038,0.45]},
  {e:[0.845,0.30,0.013,0.035,0.10]},
  // --- Kajmán-szigetek: apró pont délnyugaton ---
  {e:[0.335,0.745,0.028,0.016,0.1]},
  // --- Jamaica ---
  {e:[0.545,0.855,0.082,0.050,0.06]},         // Jamaica — Port Royal
  // --- Hispaniola: nagy sziget jobbra lent ---
  {p:[[0.78,0.80],[0.88,0.78],[0.97,0.80],[1.02,0.86],[1.00,0.94],[0.90,0.96],[0.80,0.93],[0.76,0.86]]},
  // --- Tortuga: apró sziget Hispaniola fölött ---
  {e:[0.885,0.695,0.030,0.016,0]},
  // --- Yucatán / a szárazföld pereme balra ---
  {p:[[-0.05,0.40],[0.05,0.42],[0.07,0.52],[0.05,0.62],[-0.05,0.66]]},
  {p:[[-0.05,0.86],[0.06,0.88],[0.08,0.96],[-0.05,1.05]]}
];

/* Nevezetes helyek: innen indulnak a felek. A kalóz Nassauban, a spanyol
   Havannában, az angol Port Royalban (Jamaica). */
/* Nevezetes kikötők. A 18—19. századi Karib-tenger tele volt kikötővárossal,
   ezért jóval több van, mint négy. A pontok a szigetek PARTJÁHOZ közel esnek —
   a karibPont() ráadásul a legközelebbi partszakaszra igazítja őket, hogy egy
   város se kerüljön a sziget közepére. */
const KARIB_HELY={
  nassau:    [0.566,0.235],   // New Providence
  havanna:   [0.150,0.437],   // Kuba észak-nyugat
  santiago:  [0.545,0.585],   // Kuba dél-kelet
  trinidad:  [0.330,0.520],   // Kuba dél
  matanzas:  [0.250,0.430],   // Kuba észak
  portroyal: [0.545,0.878],   // Jamaica
  tortuga:   [0.885,0.712],   // Tortuga
  santodomingo:[0.930,0.905], // Hispaniola dél
  gonaives:  [0.795,0.812],   // Hispaniola nyugat
  eleuthera: [0.640,0.150],   // Bahamák
  exuma:     [0.700,0.318],   // Bahamák dél
  crooked:   [0.800,0.432],   // Bahamák dél-kelet
  caymanbrac:[0.335,0.760],   // Kajmán
  campeche:  [0.030,0.520]    // Yucatán partja
};

/* A pont ráigazítása a legközelebbi partra: olyan szárazföldi cellát
   keresünk, aminek a szomszédjában víz van. Enélkül a városok a szigetek
   belsejébe kerültek volna, és a kikötő értelmét vesztette. */
let KARIB_SNAP=null;
function karibShoreSnap(){
  KARIB_SNAP={};
  for(const k in KARIB_HELY){
    const p=KARIB_HELY[k];
    const cx0=Math.round(p[0]*FW), cy0=Math.round(p[1]*FH);
    let jo=null, bd=1e9;
    for(let r=0;r<=26&&!jo;r++){
      for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){
        if(Math.max(Math.abs(dx),Math.abs(dy))!==r) continue;
        const cx=cx0+dx, cy=cy0+dy;
        if(cx<1||cy<1||cx>=FW-1||cy>=FH-1) continue;
        const i=cy*FW+cx;
        if(G.water[i]) continue;                 // szárazföld kell
        let partE=false;
        for(let k2=0;k2<8&&!partE;k2++){
          const nx=cx+[1,-1,0,0,1,1,-1,-1][k2], ny=cy+[0,0,1,-1,1,-1,1,-1][k2];
          if(G.water[ny*FW+nx]) partE=true;
        }
        if(!partE) continue;
        const d=dx*dx+dy*dy;
        if(d<bd){ bd=d; jo={x:(cx+0.5)*FOG_CELL, y:(cy+0.5)*FOG_CELL}; }
      }
      if(jo) break;
    }
    KARIB_SNAP[k]=jo||{x:p[0]*WORLD.w, y:p[1]*WORLD.h};
  }
}

function karibPont(kulcs){
  if(KARIB_SNAP&&KARIB_SNAP[kulcs]) return KARIB_SNAP[kulcs];
  const p=KARIB_HELY[kulcs]||KARIB_HELY.nassau;
  return {x:p[0]*WORLD.w, y:p[1]*WORLD.h};
}

// Van-e a (px,py) arányos pont a sokszögön belül?
function pontSokszogben(px,py,pts){
  let benn=false;
  for(let i=0,j=pts.length-1;i<pts.length;j=i++){
    const xi=pts[i][0], yi=pts[i][1], xj=pts[j][0], yj=pts[j][1];
    if(((yi>py)!==(yj>py)) && (px < (xj-xi)*(py-yi)/((yj-yi)||1e-9)+xi)) benn=!benn;
  }
  return benn;
}

/* A Karib-tenger felépítése: mindent vízzel öntünk el, majd kivágjuk
   belőle a szárazföldet. */
function genKarib(){
  const W=G.water=new Uint8Array(FW*FH);
  W.fill(1);
  for(let cy=0;cy<FH;cy++){
    const py=(cy+0.5)/FH;
    for(let cx=0;cx<FW;cx++){
      const px=(cx+0.5)/FW;
      let szaraz=false;
      for(const f of KARIB_FOLD){
        if(f.p){ if(pontSokszogben(px,py,f.p)){ szaraz=true; break; } }
        else{
          const [ex,ey,rx,ry,fo]=f.e;
          const dx=px-ex, dy=py-ey;
          const c=dcos(-fo), s=dsin(-fo);
          const ux=(dx*c-dy*s)/rx, uy=(dx*s+dy*c)/ry;
          if(ux*ux+uy*uy<=1){ szaraz=true; break; }
        }
      }
      if(szaraz) W[cy*FW+cx]=0;
    }
  }
  // A partvonal legyen kissé szaggatott, hogy ne látszódjon a mértani forma
  const R=seedRand('karibpart');
  {
    const masol=W.slice();
    for(let cy=1;cy<FH-1;cy++) for(let cx=1;cx<FW-1;cx++){
      const i=cy*FW+cx;
      let szomszedSzaraz=0;
      for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++)
        if(!masol[(cy+dy)*FW+(cx+dx)]) szomszedSzaraz++;
      if(szomszedSzaraz>0&&szomszedSzaraz<9&&R()<0.28) W[i]=masol[i]?0:1;
    }
  }

  /* HAJÓZHATÓSÁG.

     A szaggatott partvonal egycellás nyúlványokat és szorosokat hagy maga
     után, amiken egy hajó nem fér át — mérve a vízsávok 44%-a volt 128
     pixelnél keskenyebb, a legszűkebb 32 pixel. Egy gálya sugara 16, tehát
     beszorul.

     Ezért két menetben elhordjuk azt a szárazföldet, ami körül már túlnyomó
     részt víz van: eltűnnek a tüskék, és a szorosok kiszélesednek. A
     szigetek alakja megmarad, csak a szélük simul. */
  for(let menet=0;menet<3;menet++){
    const masol=W.slice();
    for(let cy=1;cy<FH-1;cy++) for(let cx=1;cx<FW-1;cx++){
      const i=cy*FW+cx;
      if(masol[i]) continue;                     // ez már víz
      let viz=0;
      for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){
        if(!dx&&!dy) continue;
        if(masol[(cy+dy)*FW+(cx+dx)]) viz++;
      }
      if(viz>=5) W[i]=1;                         // nyúlvány vagy szűkület: víz lesz
    }
  }
  /* Külön menet a SZOROSOKRA: ha egy szárazföldi cellának a két szemközti
     oldalán is víz van, akkor az egy egycellás gát két öböl között — azt
     áttörjük, mert egy hajó sosem férne át rajta. */
  {
    const masol=W.slice();
    for(let cy=1;cy<FH-1;cy++) for(let cx=1;cx<FW-1;cx++){
      const i=cy*FW+cx;
      if(masol[i]) continue;
      const bal=masol[cy*FW+cx-1], jobb=masol[cy*FW+cx+1];
      const fent=masol[(cy-1)*FW+cx], lent=masol[(cy+1)*FW+cx];
      if((bal&&jobb)||(fent&&lent)) W[i]=1;
    }
  }
  // a városokat a kész partvonalhoz igazítjuk
  karibShoreSnap();
}

/* =======================================================================
   7. KERESŐK ÉS KÖLTSÉGEK
   ===================================================================== */
function canPay(cost,res){for(const k in cost) if((res||G.res)[k]<cost[k]) return false; return true;}
function pay(cost,res){for(const k in cost)(res||G.res)[k]-=cost[k];}
/* =======================================================================
   NEMZETI BÓNUSZOK
   Minden nemzet egyetlen, jól érezhető előnyt kap, ami a történelmi
   karakteréhez illik. A bónusz a botra is vonatkozik a saját nemzete
   szerint, így a hét nemzet egymás ellen is másképp játszik.
   ===================================================================== */
const BONUS={
  ns:{title:'A Testvériség kódexe',
      text:'A hajók 20%-kal olcsóbbak, a legénység 15%-kal gyorsabban áll ki.',
      unitCost:(role,c)=>{ if(role==='fisher'||role==='warship'||role==='transport') scaleCost(c,0.8); },
      trainTime:0.85},
  bb:{title:'Rettegett hírnév',
      text:'A hajók 20%-kal nagyobbat ütnek, és a legénység 12%-kal szívósabb.',
      unit:u=>{ if(u.naval) u.dmg*=1.2; u.maxHp=Math.round(u.maxHp*1.12); u.hp=u.maxHp; }},
  sb:{title:'Úriember a fedélzeten',
      text:'25%-kal több arany, de a hajók 10%-kal drágábbak.',
      gather:t=>t==='gold'?1.25:1,
      unitCost:(role,c)=>{ if(role==='warship') scaleCost(c,1.1); }},
  nat:{title:'A sziget népe',
      text:'A harcosok 20%-kal gyorsabbak és 15%-kal olcsóbbak, de nem ismerik a fémet.',
      unit:u=>{ u.speed*=1.2; },
      unitCost:(role,c)=>scaleCost(c,0.85)},
  es:{title:'Tengerentúli hódítás',
      text:'A hajók 25%-kal olcsóbbak és 20%-kal szívósabbak, a kikötő 20%-kal olcsóbb.',
      unitCost:(role,c)=>{ if(role==='fisher'||role==='warship') scaleCost(c,0.75); },
      buildCost:(t,c)=>{ if(t==='harbor') scaleCost(c,0.8); },
      unit:u=>{ if(u.naval){ u.maxHp=Math.round(u.maxHp*1.2); u.hp=u.maxHp; } }},
  hu:{title:'Könnyűlovas hagyomány',
      text:'A közelharci egységek 16%-kal gyorsabbak és 15%-kal olcsóbbak.',
      unit:u=>{ if(u.role==='melee') u.speed*=1.16; },
      unitCost:(role,c)=>{ if(role==='melee') scaleCost(c,0.85); }},
  at:{title:'Erődépítő iskola',
      text:'Az épületek 22%-kal szívósabbak, a tornyok 12%-kal messzebbre lőnek.',
      build:b=>{ b.maxHp=Math.round(b.maxHp*1.22); b.hp=Math.round(b.hp*1.22); b.rangeMul=1.12; }},
  pl:{title:'Szárnyas huszárok',
      text:'A közelharci egységek 20%-kal nagyobbat ütnek.',
      unit:u=>{ if(u.role==='melee') u.dmg*=1.2; }},
  de:{title:'Hadiipari fegyelem',
      text:'Az épületek 16%-kal olcsóbbak és 25%-kal gyorsabban készülnek el.',
      buildCost:(t,c)=>scaleCost(c,0.84),
      build:b=>{ b.buildTime=b.buildTime*0.75; }},
  fr:{title:'Felvilágosult udvar',
      text:'A távolsági egységek 12%-kal messzebbre lőnek, a korszakváltás 20%-kal olcsóbb.',
      unit:u=>{ if(u.role==='ranged'||u.role==='spear') u.range*=1.12; },
      ageCost:c=>scaleCost(c,0.8)},
  gb:{title:'Íjász- és tüzérhagyomány',
      text:'A távolsági egységek 20%-kal nagyobbat sebeznek.',
      unit:u=>{ if(u.role==='ranged') u.dmg*=1.2; }},
  ru:{title:'Kimeríthetetlen tartalék',
      text:'Minden egység 16%-kal szívósabb, a munkások 14%-kal gyorsabban gyűjtenek.',
      unit:u=>{ u.maxHp=Math.round(u.maxHp*1.16); u.hp=u.maxHp; if(u.role==='worker') u.gatherMul=1.14; }},
  /* --- KÉSZÜLŐ NEMZETEK ---
     Minden nemzet EGYETLEN, jól érezhető előnyt kap — ugyanaz az elv,
     mint a többinél. A történelmi karakterükhöz illik, nem a
     legerősebbhez. */
  se:{title:'Karolinus fegyelem',
      text:'A gyalogság 15%-kal szívósabb, és 12%-kal gyorsabban áll ki.',
      unit:u=>{ if(!u.naval&&!u.air){ u.maxHp=Math.round(u.maxHp*1.15); u.hp=u.maxHp; } },
      trainTime:0.88},
  ot:{title:'A Fényes Porta',
      text:'A janicsárok olcsóbbak: minden szárazföldi egység 12%-kal kevesebbe kerül.',
      unitCost:(role,c)=>{ if(role!=='warship'&&role!=='galleon') scaleCost(c,0.88); }},
  jp:{title:'A kard útja',
      text:'A közelharci egységek 20%-kal nagyobbat ütnek.',
      unit:u=>{ if(u.role==='melee'||u.role==='cav') u.dmg=Math.round(u.dmg*1.2); }},
  cn:{title:'A Középső Birodalom',
      text:'25%-kal több élelem, és az épületek 15%-kal szívósabbak.',
      gather:t=>t==='food'?1.25:1,
      build:b=>{ b.maxHp=Math.round(b.maxHp*1.15); b.hp=Math.round(b.hp*1.15); }},
  in:{title:'A fűszerek földje',
      text:'30%-kal több arany, de a kőfejtés 10%-kal lassabb.',
      gather:t=>t==='gold'?1.3:(t==='stone'?0.9:1)},
  ml:{title:'A só és az arany útja',
      text:'A piac 35%-kal jobb áron vált, és 20%-kal több arany.',
      gather:t=>t==='gold'?1.2:1,
      market:1.35}
};
/* =======================================================================
   FEJLESZTÉSEK
   Korszakon belül is lehet erősödni: három ág, egyenként három szinttel.
   A bot ugyanezeket vásárolja a saját nyersanyagából, tehát a késői játék
   nem áll meg ott, hogy mindenki elérte a 20. századot.
   ===================================================================== */
/* A fejlesztések két házban laknak:

     KOVÁCSMŰHELY — ami a katonát erősíti: fegyver, páncél, ellátmány.
     AKADÉMIA     — ami a birodalmat: termelés, építés, kiképzés, és a
                    huszadik században az atomprogram.

   A `hol` mező mondja meg, melyik épületben kutatható. */
const UPGRADES={
  weapon:{name:'Fegyverkovács', short:'Fegyver', desc:'+12% sebzés minden egységnek',
          hol:'smith', max:3, cost:{gold:120,wood:70}},
  armor: {name:'Páncélműhely',  short:'Páncél',  desc:'+2 páncél minden egységnek',
          hol:'smith', max:3, cost:{gold:110,stone:100}},
  supply:{name:'Ellátmány',     short:'Ellátás', desc:'+12% életerő minden egységnek',
          hol:'smith', max:3, cost:{food:200,gold:70}},

  // Akadémia: a birodalom működését gyorsítják. Korszakonként egy fokozat,
  // mindegyik 5%-ot ad — négy korszak alatt összesen 20%-ot.
  yield: {name:'Gazdálkodás',   short:'Termelés',desc:'+5% minden nyersanyag kitermelése fokozatonként',
          hol:'academy', max:4, perAge:true, cost:{gold:90,wood:120}},
  labor: {name:'Építőipar',     short:'Építés',  desc:'5%-kal gyorsabb építkezés fokozatonként',
          hol:'academy', max:4, perAge:true, cost:{wood:150,stone:90}},
  drill: {name:'Kiképzőtábor',  short:'Kiképzés',desc:'5%-kal gyorsabb kiképzés fokozatonként',
          hol:'academy', max:4, perAge:true, cost:{gold:110,food:140}},
  cargo: {name:'Hajóács',       short:'Férőhely',desc:'+5 férőhely a csapatszállítókon fokozatonként (10-ről 25-ig)',
          hol:'academy', max:3, cost:{wood:180,gold:120}},

  /* Az akadémia további kutatásai. Mind a birodalom működését javítja,
     nem közvetlenül a katonát — az a kovácsműhely dolga. */
  medicine:{name:'Gyógyszerkészlet', short:'Gyógyítás',
          desc:'A kórház és a tábori sebész 20%-kal gyorsabban gyógyít fokozatonként',
          hol:'academy', max:3, cost:{gold:140,food:180}},
  optics:{name:'Messzelátó',    short:'Látótáv',
          desc:'+12% látótáv minden egységnek és épületnek fokozatonként',
          hol:'academy', max:2, cost:{gold:160,stone:90}},
  storage:{name:'Raktározás',   short:'Teherbírás',
          desc:'A munkások 20%-kal többet cipelnek egy fordulóval fokozatonként',
          hol:'academy', max:3, cost:{wood:160,stone:110}},
  masonry:{name:'Kőművesség',   short:'Falak',
          desc:'Az épületek 12%-kal szívósabbak fokozatonként',
          hol:'academy', max:3, cost:{stone:200,gold:80}},
  ledger: {name:'Számvitel',    short:'Kincstár',
          desc:'Minden egység és épület 4%-kal olcsóbb fokozatonként',
          hol:'academy', max:3, cost:{gold:200,wood:100}},
  atom:  {name:'Atomprogram',   short:'Atom',    desc:'A bombázó atomcsapást mérhet: 2x2 majorságnyi területen minden megsemmisül',
          hol:'academy', max:1, minAge:3, cost:{gold:900,stone:400,coal:350}}
};
const UPG_KEYS=['weapon','armor','supply','yield','labor','drill','cargo',
  'medicine','optics','storage','masonry','ledger','atom'];
// Hány fő fér a csapatszállítóra? Alap tíz, fokozatonként öt, legfeljebb 25.
function cargoCap(owner){
  return Math.min(25, 10 + 5*((upgOf(owner).cargo)||0));
}
// Az akadémiai fokozatok korszakhoz kötöttek: a 15. században egy, a
// 17.-ben kettő, és így tovább. Egyszerre nem lehet mind a négyet megvenni.
function upgCap(key,owner){
  const d=UPGRADES[key];
  if(!d) return 0;
  if(!d.perAge) return d.max;
  return Math.min(d.max, ((typeof korOf==='function')?korOf(owner):(owner?G.ai.age:G.age))+1);
}
/* A fél FEJLESZTÉSEI. A régi alak minden nem-nulla tulajdonost „a gép”-nek
   vett: `owner ? G.ai.upg : G.upg`. Két félnél ez helyes volt, több
   emberrel viszont a 2. játékos az ELSŐ BOT fejlesztéseit kapta volna. */
function upgOf(owner){
  const o=(typeof oldal==='function')?oldal(owner):null;
  if(o&&o.upg) return o.upg;
  return (owner?(G.ai&&G.ai.upg):G.upg)||{};
}
function upgAvailable(key,owner){
  const u=UPGRADES[key], age=(typeof korOf==='function')?korOf(owner):(owner?G.ai.age:G.age);
  if(u.minAge!==undefined&&age<u.minAge) return false;
  // A korszakonkénti fokozatokból csak annyi vehető meg, ahány korszakot elértél
  if(u.perAge&&(upgOf(owner)[key]||0)>=upgCap(key,owner)) return false;
  return true;
}
function upgCost(key,owner){
  const lv=upgOf(owner)[key]||0, age=(typeof korOf==='function')?korOf(owner):(owner?G.ai.age:G.age);
  return scaleCost(costOf(UPGRADES[key].cost,age), 1+lv*0.9);
}
function applyUpg(u){
  const g=upgOf(u.owner);
  if(g.weapon) u.dmg*=1+0.12*g.weapon;
  if(g.armor)  u.armor+=2*g.armor;
  if(g.supply){ const r=u.maxHp?u.hp/u.maxHp:1;
    u.maxHp=Math.round(u.maxHp*(1+0.12*g.supply)); u.hp=u.maxHp*r; }
}
// Egy egység összes módosítójának újraszámolása alapértékekből
function recomputeUnit(u){
  const d=UNITS[u.role], age=u.age, ratio=u.maxHp?u.hp/u.maxHp:1;
  u.maxHp=d.hp[age]; u.dmg=val(d.dmg,age); u.range=val(d.range,age);
  u.speed=val(d.speed,age)*PACE.speed; u.atk=val(d.atk,age); u.r=val(d.r,age);
  u.armor=val(d.armor,age)||0; u.gatherMul=1;
  const bn=bonusOf(u.owner); if(bn.unit) bn.unit(u);
  applyDoct(u);
  applyUpg(u);
  u.hp=u.maxHp*ratio;
}
/* =======================================================================
   ÉPÜLET-PARANCSOK: befejezetlen építkezés folytatása és lerombolás
   ===================================================================== */
let demoArmed=null;
// A kijelölt munkások — vagy ha nincs kijelölve, a három legközelebbi —
// odaindulnak az épülethez befejezni vagy megjavítani.
function sendBuilders(){
  const b=G.selBuild;
  if(!b||b.dead||b.owner!==0||pausedBlock()) return;
  let crew=G.sel.filter(u=>!u.dead&&u.role==='worker');
  if(!crew.length)
    crew=G.units.filter(u=>!u.dead&&u.owner===0&&u.role==='worker')
      .sort((x,y)=>dist(x.x,x.y,b.x,b.y)-dist(y.x,y.y,b.x,b.y)).slice(0,3);
  if(!crew.length){ toast(T('uzNincsMunkas')); SFX.play('deny'); return; }
  for(const u of crew){ u.order={type:'repair',target:b}; u.target=null; }
  toast(crew.length+' munkás elindult: '+BUILDS[b.type].names[b.age]
        +(b.done?' javítása':' befejezése'));
  SFX.play('place',0.7);
}
// Meglévő falszakaszból kaput nyitunk: a sereged átjár rajta, az
// ellenség viszont nem — neki továbbra is fal.
function makeGate(){
  const b=G.selBuild;
  if(!b||b.dead||b.owner!==0||b.type!=='wall'||pausedBlock()) return;
  const c=buildCost('gate',b.age,ENID);
  if(!canPay(c)){ toast(T('uzNincsAnyagKettospont')+' '+costText(c)); SFX.play('deny'); return; }
  pay(c);
  const ratio=b.hp/b.maxHp;
  b.type='gate';
  const bn=bonusOf(0);
  b.maxHp=BUILDS.gate.hp[b.age];
  if(bn.build) bn.build(b);
  b.hp=b.maxHp*ratio;
  b.buildTime=BUILDS.gate.time*PACE.build;
  G.navVer++;
  SFX.at('place',b.x,b.y,1);
  toast(T('uzKapuNyilt'));
  G.btnSig=''; syncUI();
}
function demolish(){
  const b=G.selBuild;
  if(!b||b.dead||b.owner!==0||pausedBlock()) return;
  if(demoArmed!==b){                       // kétlépcsős, hogy ne menjen véletlenül
    demoArmed=b; G.btnSig=''; syncUI();
    toast(T('uzBiztosRombol'));
    SFX.play('deny'); return;
  }
  demoArmed=null;
  const c=buildCost(b.type,b.age,ENID), back={};
  const rate=0.5*(b.done?1:Math.max(0.35,b.prog));   // félkész épületért kevesebb jár
  for(const k in c){ const v=Math.floor(c[k]*rate); if(v>0){ back[k]=v; G.res[k]+=v; } }
  b.dead=true; G.selBuild=null; G.navVer++;
  G.fx.push({x:b.x,y:b.y,t:0,life:.55,type:'boom',r:Math.max(b.w,b.h)*0.45});
  SFX.at('destroy',b.x,b.y,0.75);
  toast(BUILDS[b.type].names[b.age]+' lerombolva'
        +(Object.keys(back).length?' — vissza: '+costText(back):''));
  G.btnSig=''; syncUI();
}
function buyUpgrade(key){
  if(typeof logAdd==='function'&&logAdd('upg', key)) return;
  if((upgOf(0)[key]||0)>=upgCap(key,0)){
    toast(T('uzKovKorszakban')); SFX.play('deny'); return;
  }
  if(pausedBlock()) return;
  const g=G.upg, d=UPGRADES[key];
  if((g[key]||0)>=d.max){ toast(d.name+': már a legmagasabb szinten.'); SFX.play('deny'); return; }
  if(!G.builds.some(b=>b.owner===0&&!b.dead&&b.done&&b.type==='academy')){
    toast(T('uzAkademiaKell')); SFX.play('deny'); return; }
  const c=upgCost(key,0);
  if(!canPay(c)){ toast(T('uzNincsAnyagKettospont')+' '+costText(c)); SFX.play('deny'); return; }
  pay(c); g[key]=(g[key]||0)+1;
  for(const u of G.units) if(!u.dead&&u.owner===0) recomputeUnit(u);
  toast(d.name+' '+g[key]+'. szint — '+d.desc);
  SFX.play('ready'); G.btnSig=''; syncUI();
}
/* =======================================================================
   IDEOLÓGIÁK
   Minden korszakba lépéskor egy doktrínát választasz háromból. A választás
   végleges és halmozódik: a 20. századra négy döntés formálja a birodalmat.
   A hatások ugyanazokon a pontokon kapcsolódnak be, mint a nemzeti bónuszok.
   ===================================================================== */
/* -----------------------------------------------------------------------
   IDEOLÓGIÁK NEMZETENKÉNT

   Minden ország saját irányokat kap, az adott korszak uralkodójához
   kötve: Mátyásnál a fekete sereg zsoldrendszere, Sobieskinél a szárnyas
   huszárok, Bismarcknál a vas és vér, Nagy Péternél a nyugati reform.
   Korszakonként három közül választasz, és a döntések halmozódnak.
   ----------------------------------------------------------------------- */
function dc(key,name,desc,eff){ return Object.assign({key,name,desc},eff||{}); }
const hpUp=m=>({unit:u=>{ u.maxHp=Math.round(u.maxHp*m); u.hp=u.maxHp; }});
const roleHp=(role,m)=>({unit:u=>{ if(u.role===role){ u.maxHp=Math.round(u.maxHp*m); u.hp=u.maxHp; } }});
const roleCheap=(role,m)=>({unitCost:(r,c)=>{ if(r===role) scaleCost(c,m); }});
const rolesCheap=(roles,m)=>({unitCost:(r,c)=>{ if(roles.indexOf(r)>=0) scaleCost(c,m); }});
const bldHp=(types,m)=>({build:b=>{ if(!types||types.indexOf(b.type)>=0){
  b.maxHp=Math.round(b.maxHp*m); b.hp=Math.round(b.hp*m); } }});

const NAT_DOCT={
 /* ---------------- KALÓZFRAKCIÓK ---------------- */
 ns:[[ dc('kodex','A kódex','A zsákmány igazságos: 25%-kal több arany.', {gather:t=>t==='gold'?1.25:1}),
       dc('szavazas','Kapitányválasztás','A legénység 20%-kal gyorsabban áll ki.', {trainTime:0.8}),
       dc('menedek','Szabad kikötő','Az épületek 25%-kal szívósabbak.', bldHp(null,1.25)) ]],
 bb:[[ dc('rettegett','Rettegett hírnév','A hajók 18%-kal nagyobbat ütnek.',
        {unit:u=>{ if(u.naval) u.dmg*=1.18; }}),
       dc('kanoc','Égő kanóc','Minden egység 15%-kal szívósabb.', hpUp(1.15)),
       dc('blokad','Blokád','25%-kal több arany.', {gather:t=>t==='gold'?1.25:1}) ]],
 sb:[[ dc('zsold','Fizetett legénység','A hajók 20%-kal olcsóbbak.',
        {unitCost:(r,c)=>{ if(r==='fisher'||r==='warship'||r==='transport') scaleCost(c,0.8); }}),
       dc('uriember','Úriember','A majorságok 30%-kal több élelmet adnak.', {food:1.3}),
       dc('konyvtar','Hajónapló','20%-kal gyorsabb gyűjtés.', {gather:()=>1.2}) ]],

 /* ---------------- SZIGETLAKÓK (rejtett) ---------------- */
 nat:[
  [ dc('vadaszat','Vadászat','A harcosok 14%-kal erősebbek.', {unit:u=>{ u.dmg*=1.14; }}),
    dc('halaszat','Halászat','A majorságok 25%-kal több élelmet adnak.', {food:1.25}),
    dc('torzsi','Törzsi szövetség','A seregkeret 20-szal nagyobb.', {pop:20}) ],
  [ dc('vadaszat2','Vadászat','A harcosok 14%-kal erősebbek.', {unit:u=>{ u.dmg*=1.14; }}),
    dc('halaszat2','Halászat','A majorságok 25%-kal több élelmet adnak.', {food:1.25}),
    dc('torzsi2','Törzsi szövetség','A seregkeret 20-szal nagyobb.', {pop:20}) ],
  [ dc('vadaszat3','Vadászat','A harcosok 14%-kal erősebbek.', {unit:u=>{ u.dmg*=1.14; }}),
    dc('halaszat3','Halászat','A majorságok 25%-kal több élelmet adnak.', {food:1.25}),
    dc('torzsi3','Törzsi szövetség','A seregkeret 20-szal nagyobb.', {pop:20}) ],
  [ dc('vadaszat4','Vadászat','A harcosok 14%-kal erősebbek.', {unit:u=>{ u.dmg*=1.14; }}),
    dc('halaszat4','Halászat','A majorságok 25%-kal több élelmet adnak.', {food:1.25}),
    dc('torzsi4','Törzsi szövetség','A seregkeret 20-szal nagyobb.', {pop:20}) ] ],

 /* ---------------- SPANYOLORSZÁG ---------------- */
 es:[
  [ dc('reconquista','Reconquista','A félsziget visszahódítása: a közelharci egységek 16%-kal erősebbek.',
       {unit:u=>{ if(u.role==='melee') u.dmg*=1.16; }}),
    dc('karavella','Karavella','Új hajótípus: a hajók 25%-kal olcsóbbak és 20%-kal gyorsabbak.',
       {unitCost:(r,c)=>{ if(r==='fisher'||r==='warship') scaleCost(c,0.75); },
        unit:u=>{ if(u.naval) u.speed*=1.2; }}),
    dc('katolikuskiralyok','A Katolikus Királyok','Két korona egy kézben: a seregkeret 25-tel nagyobb.', {pop:25}) ],
  [ dc('conquistador','Conquistadorok','A hódítók keveset kérnek: minden egység 18%-kal olcsóbb.',
       {unitCost:(r,c)=>scaleCost(c,0.82)}),
    dc('ezustflotta','Ezüstflotta','Az Újvilág kincse: 30%-kal több arany.', {gather:t=>t==='gold'?1.3:1}),
    dc('tercio','Tercio','A spanyol négyszög: a pikások és lövészek 22%-kal szívósabbak.',
       {unit:u=>{ if(u.role==='spear'||u.role==='ranged'){ u.maxHp=Math.round(u.maxHp*1.22); u.hp=u.maxHp; } }}) ],
  [ dc('bourbonreform','Bourbon-reformok','Az építkezés 25%-kal gyorsabb.', {buildTime:0.75}),
    dc('gyarmatiigaz','Gyarmati igazgatás','20%-kal gyorsabb gyűjtés.', {gather:()=>1.2}),
    dc('tengeriskola','Tengerészeti iskola','A hadihajók 25%-kal erősebbek.',
       {unit:u=>{ if(u.role==='warship') u.dmg*=1.25; }}) ],
  [ dc('semlegesseg','Semlegesség','Az épületek 30%-kal szívósabbak.', bldHp(null,1.3)),
    dc('iparositas_es','Iparosítás','Minden egység 16%-kal olcsóbb.', {unitCost:(r,c)=>scaleCost(c,0.84)}),
    dc('nyitas','Nyitás','A majorságok 30%-kal több élelmet adnak.', {food:1.3}) ] ],

 /* ---------------- MAGYARORSZÁG ---------------- */
 hu:[
  [ dc('feketesereg','Fekete sereg','Mátyás zsoldosai: a katonák 15%-kal olcsóbbak, a kiképzés 10%-kal gyorsabb.',
       Object.assign(rolesCheap(['melee','ranged','spear'],0.85),{trainTime:0.9})),
    dc('corvina','Corvina könyvtár','A tudás a hatalom: minden épület 12%-kal olcsóbb, a korszakváltás 10%-kal.',
       {buildCost:(t,c)=>scaleCost(c,0.88), ageCost:0.9}),
    dc('vegvar','Végvárrendszer','A tornyok és falak 30%-kal szívósabbak.', bldHp(['tower','wall','gate'],1.3)) ],
  [ dc('kuruc','Kuruc portya','Rákóczi lovasai 12%-kal gyorsabban járnak.', {unit:u=>{ u.speed*=1.12; }}),
    dc('talpas','Talpas gyalogság','A pikások és lövészek 18%-kal olcsóbbak.', rolesCheap(['spear','ranged'],0.82)),
    dc('erdely','Erdélyi kincstár','25%-kal több arany érkezik a bányákból.', {gather:t=>t==='gold'?1.25:1}) ],
  [ dc('nemzetor','Nemzetőrség','Kossuth toborzása: a seregkeret 25-tel nagyobb.', {pop:25}),
    dc('jobbagy','Jobbágyfelszabadítás','A szabad parasztok 15%-kal gyorsabban gyűjtenek.', {gather:()=>1.15}),
    dc('honved','Honvédsereg','Minden egység 12%-kal szívósabb.', hpUp(1.12)) ],
  [ dc('folyamor','Folyamőrség','A hadihajók 30%-kal szívósabbak.', roleHp('warship',1.3)),
    dc('iparos','Iparosítás','Az építkezés 25%-kal gyorsabb.', {buildTime:0.75}),
    dc('revizio','Revíziós hadsereg','Minden egység 12%-kal nagyobbat üt.', {unit:u=>{ u.dmg*=1.12; }}) ] ],

 /* ---------------- AUSZTRIA ---------------- */
 at:[
  [ dc('hazassag','Házassági politika','Amit más háborúval, azt te frigyekkel: a korszakváltás 18%-kal olcsóbb.', {ageCost:0.82}),
    dc('birgyules','Birodalmi gyűlés','Minden épület 15%-kal olcsóbb.', {buildCost:(t,c)=>scaleCost(c,0.85)}),
    dc('landsknecht','Landsknecht zsold','A gyalogság 15%-kal olcsóbb és gyorsabban áll ki.',
       Object.assign(rolesCheap(['spear','ranged'],0.85),{trainTime:0.88})) ],
  [ dc('barokk','Barokk udvar','A majorságok 28%-kal több élelmet adnak.', {food:1.28}),
    dc('liga','Törökellenes liga','A közelharci egységek 18%-kal szívósabbak.', roleHp('melee',1.18)),
    dc('haditanacs','Császári haditanács','A kiképzés 22%-kal gyorsabb.', {trainTime:0.78}) ],
  [ dc('kiegyezes','Kiegyezés','A kettős monarchia kerete: a seregkeret 22-vel nagyobb.', {pop:22}),
    dc('burokracia','Bürokrácia','Minden egység és épület 12%-kal olcsóbb.',
       {unitCost:(r,c)=>scaleCost(c,0.88), buildCost:(t,c)=>scaleCost(c,0.88)}),
    dc('vasut','Vasúthálózat','18%-kal gyorsabb gyűjtés.', {gather:()=>1.18}) ],
  [ dc('bekepolitika','Békepolitika','Az épületek 28%-kal szívósabbak.', bldHp(null,1.28)),
    dc('hadiipar','Hadiipar','Minden egység 15%-kal olcsóbb.', {unitCost:(r,c)=>scaleCost(c,0.85)}),
    dc('offenziva','Utolsó offenzíva','Minden egység 14%-kal nagyobbat üt.', {unit:u=>{ u.dmg*=1.14; }}) ] ],

 /* ---------------- LENGYELORSZÁG ---------------- */
 pl:[
  [ dc('jagello','Jagelló unió','Két nép egy korona alatt: a seregkeret 25-tel nagyobb.', {pop:25}),
    dc('porosz','Porosz hódoltság','25%-kal több fa és kő érkezik.', {gather:t=>(t==='wood'||t==='stone')?1.25:1}),
    dc('nemesi','Nemesi felkelés','A lovasság 18%-kal olcsóbb.', roleCheap('melee',0.82)) ],
  [ dc('huszar','Szárnyas huszárok','Sobieski rohamlovassága: a lovasok 15%-kal szívósabbak és 12%-kal erősebbek.',
       {unit:u=>{ if(u.role==='melee'){ u.maxHp=Math.round(u.maxHp*1.15); u.hp=u.maxHp; u.dmg*=1.12; } }}),
    dc('kahlenberg','Kahlenbergi roham','Minden egység 14%-kal gyorsabb.', {unit:u=>{ u.speed*=1.14; }}),
    dc('kincstar','Királyi kincstár','25%-kal több arany.', {gather:t=>t==='gold'?1.25:1}) ],
  [ dc('kaszas','Kaszás parasztok','A pikások 25%-kal olcsóbbak és gyorsabban állnak ki.',
       Object.assign(roleCheap('spear',0.75),{trainTime:0.9})),
    dc('mernok','Erődítő mérnök','Kościuszko sáncai: a tornyok és falak 32%-kal szívósabbak.',
       bldHp(['tower','wall','gate'],1.32)),
    dc('felkeles','Felkelés','A kiképzés 25%-kal gyorsabb.', {trainTime:0.75}) ],
  [ dc('legiok','Légiók','Minden egység 14%-kal szívósabb.', hpUp(1.14)),
    dc('varso','Varsói csata','Az épületek 25%-kal szívósabbak, a tornyok messzebbre lőnek.',
       {build:b=>{ b.maxHp=Math.round(b.maxHp*1.25); b.hp=Math.round(b.hp*1.25);
                   b.rangeMul=(b.rangeMul||1)*1.15; }}),
    dc('szanacio','Szanáció','Az építkezés 25%-kal gyorsabb.', {buildTime:0.75}) ] ],

 /* ---------------- NÉMETORSZÁG ---------------- */
 de:[
  [ dc('landsknechtde','Landsknecht ezredek','A gyalogság 16%-kal olcsóbb.', rolesCheap(['spear','ranged'],0.84)),
    dc('birreform','Birodalmi reform','Minden épület 15%-kal olcsóbb.', {buildCost:(t,c)=>scaleCost(c,0.85)}),
    dc('lovagi','Lovagi hagyomány','A lovasság 18%-kal szívósabb.', roleHp('melee',1.18)) ],
  [ dc('allando','Állandó hadsereg','A Nagy Választófejedelem újítása: a kiképzés 25%-kal gyorsabb.', {trainTime:0.75}),
    dc('hugenotta','Hugenotta betelepítés','18%-kal gyorsabb gyűjtés.', {gather:()=>1.18}),
    dc('fegyelem','Porosz fegyelem','Minden egység 15%-kal szívósabb.', hpUp(1.15)) ],
  [ dc('vasesver','Vas és vér','Bismarck útja: minden egység 15%-kal nagyobbat üt.', {unit:u=>{ u.dmg*=1.15; }}),
    dc('vamunio','Vámunió','Minden egység és épület 13%-kal olcsóbb.',
       {unitCost:(r,c)=>scaleCost(c,0.87), buildCost:(t,c)=>scaleCost(c,0.87)}),
    dc('tarsbizt','Társadalombiztosítás','A seregkeret 25-tel nagyobb.', {pop:25}) ],
  [ dc('tannenberg','Tannenberg','Az épületek 28%-kal szívósabbak.', bldHp(null,1.28)),
    dc('hadigazd','Hadigazdaság','Minden egység 16%-kal olcsóbb.', {unitCost:(r,c)=>scaleCost(c,0.84)}),
    dc('vezerkar','Vezérkar','A kiképzés 28%-kal gyorsabb.', {trainTime:0.72}) ] ],

 /* ---------------- FRANCIAORSZÁG ---------------- */
 fr:[
  [ dc('kirposta','Királyi posta','XI. Lajos hírvivői: az építkezés 22%-kal gyorsabb.', {buildTime:0.78}),
    dc('zsoldszerz','Zsoldos szerződések','Minden egység 15%-kal olcsóbb.', {unitCost:(r,c)=>scaleCost(c,0.85)}),
    dc('kozpontos','Központosítás','A korszakváltás 18%-kal olcsóbb.', {ageCost:0.82}) ],
  [ dc('versailles','Versailles','Az udvar ellátása: 30%-kal több élelem.', {food:1.3}),
    dc('vauban','Vauban erődjei','Minden épület 30%-kal szívósabb.', bldHp(null,1.3)),
    dc('napkiraly','A Napkirály hadserege','A seregkeret 25-tel nagyobb.', {pop:25}) ],
  [ dc('grande','Grande Armée','Napóleon serege 15%-kal nagyobbat üt.', {unit:u=>{ u.dmg*=1.15; }}),
    dc('tuzerseg','Tüzérség','A lövészek 20%-kal erősebbek, a tornyok messzebbre lőnek.',
       {unit:u=>{ if(u.role==='ranged') u.dmg*=1.2; },
        build:b=>{ b.rangeMul=(b.rangeMul||1)*1.18; }}),
    dc('codenap','Code Napoléon','Minden egység és épület 13%-kal olcsóbb.',
       {unitCost:(r,c)=>scaleCost(c,0.87), buildCost:(t,c)=>scaleCost(c,0.87)}) ],
  [ dc('szabadfr','Szabad Franciaország','Minden egység 15%-kal szívósabb.', hpUp(1.15)),
    dc('pancelos','Páncélos doktrína','A harckocsik 22%-kal erősebbek és szívósabbak.',
       {unit:u=>{ if(u.role==='melee'&&u.age===3){ u.dmg*=1.22; u.maxHp=Math.round(u.maxHp*1.22); u.hp=u.maxHp; } }}),
    dc('otodik','Ötödik Köztársaság','Az építkezés 26%-kal gyorsabb.', {buildTime:0.74}) ] ],

 /* ---------------- NAGY-BRITANNIA ---------------- */
 gb:[
  [ dc('csillagkamara','Csillagkamara','A rend ára: minden épület 15%-kal olcsóbb.', {buildCost:(t,c)=>scaleCost(c,0.85)}),
    dc('kereskszerz','Kereskedelmi szerződés','28%-kal több arany.', {gather:t=>t==='gold'?1.28:1}),
    dc('ijasz','Íjászhagyomány','A lövészek 20%-kal erősebbek és 12%-kal olcsóbbak.',
       Object.assign(roleCheap('ranged',0.88),{unit:u=>{ if(u.role==='ranged') u.dmg*=1.2; }})) ],
  [ dc('ujmintaju','Új mintájú hadsereg','Cromwell fegyelme: a kiképzés 22%-kal gyorsabb, az egységek 12%-kal szívósabbak.',
       Object.assign(hpUp(1.12),{trainTime:0.78})),
    dc('puritan','Puritán fegyelem','Minden egység 16%-kal olcsóbb.', {unitCost:(r,c)=>scaleCost(c,0.84)}),
    dc('hajozasi','Hajózási törvények','A hajók 30%-kal szívósabbak.',
       {unit:u=>{ if(u.naval){ u.maxHp=Math.round(u.maxHp*1.3); u.hp=u.maxHp; } }}) ],
  [ dc('ipariforr','Ipari forradalom','Az építkezés 28%-kal gyorsabb.', {buildTime:0.72}),
    dc('gyarmat','Gyarmatbirodalom','20%-kal gyorsabb gyűjtés.', {gather:()=>1.2}),
    dc('haditenger','Királyi Haditengerészet','A hadihajók 25%-kal erősebbek.',
       {unit:u=>{ if(u.role==='warship') u.dmg*=1.25; }}) ],
  [ dc('legicsata','Angliai csata','A repülőgépek 25%-kal szívósabbak.',
       {unit:u=>{ if(u.air){ u.maxHp=Math.round(u.maxHp*1.25); u.hp=u.maxHp; } }}),
    dc('hadigazdgb','Hadigazdaság','Minden egység 16%-kal olcsóbb.', {unitCost:(r,c)=>scaleCost(c,0.84)}),
    dc('kitartas','Kitartás','Az épületek 30%-kal szívósabbak.', bldHp(null,1.3)) ] ],

 /* ---------------- OROSZORSZÁG ---------------- */
 ru:[
  [ dc('moszkva','Moszkva egyesítése','A seregkeret 25-tel nagyobb.', {pop:25}),
    dc('kreml','A Kreml falai','Minden épület 30%-kal szívósabb.', bldHp(null,1.3)),
    dc('tatarjarom','A tatár iga vége','Minden egység 15%-kal olcsóbb.', {unitCost:(r,c)=>scaleCost(c,0.85)}) ],
  [ dc('nyugatireform','Nyugati reform','Nagy Péter iskolája: az építkezés 25%-kal gyorsabb.', {buildTime:0.75}),
    dc('flotta','Flottaépítés','A hajók 20%-kal olcsóbbak és 20%-kal szívósabbak.',
       {unitCost:(r,c)=>{ if(r==='fisher'||r==='warship') scaleCost(c,0.8); },
        unit:u=>{ if(u.naval){ u.maxHp=Math.round(u.maxHp*1.2); u.hp=u.maxHp; } }}),
    dc('szentpetervar','Szentpétervár','20%-kal gyorsabb gyűjtés.', {gather:()=>1.2}) ],
  [ dc('felperzselt','Felperzselt föld','Minden egység 18%-kal szívósabb.', hpUp(1.18)),
    dc('kozak','Kozák portyázók','Minden egység 15%-kal gyorsabb.', {unit:u=>{ u.speed*=1.15; }}),
    dc('szentszov','Szent Szövetség','A majorságok 28%-kal több élelmet adnak.', {food:1.28}) ],
  [ dc('nagyhatalom','Ipari nagyhatalom','20%-kal gyorsabb gyűjtés.', {gather:()=>1.2}),
    dc('emberfoleny','Emberfölény','A seregkeret 30-cal nagyobb, a katonák 12%-kal olcsóbbak.',
       {pop:30, unitCost:(r,c)=>scaleCost(c,0.88)}),
    dc('erodvonal','Erődvonal','A tornyok és falak 35%-kal szívósabbak.', bldHp(['tower','wall','gate'],1.35)) ] ],

 /* ---------------- KÉSZÜLŐ NEMZETEK ----------------
    Korszakonként három-három út, a nemzet történelmi karakteréhez
    igazítva. A szerkezet ugyanaz, mint a többinél: minden korszakban
    egyet választasz, és az végigkíséri a játszmát. */
 se:[[ dc('indelningsverk','Beosztásos hadsereg','A gyalogság 12%-kal gyorsabban áll ki.', {trainTime:0.88}),
       dc('bergslagen','Vasvidék','20%-kal több kő.', {gather:t=>t==='stone'?1.2:1}),
       dc('halland','Erődvonal','Az épületek 20%-kal szívósabbak.', bldHp(null,1.2)) ]],
 ot:[[ dc('devsirme','Devsirme','A katonák 15%-kal olcsóbbak.', {unitCost:(r,c)=>scaleCost(c,0.85)}),
       dc('timar','Timár-birtok','20%-kal több élelem.', {gather:t=>t==='food'?1.2:1}),
       dc('nagyagyu','Nagy ágyúk','Az ostromgépek 25%-kal nagyobbat ütnek.',
          {unit:u=>{ if(u.siege) u.dmg=Math.round(u.dmg*1.25); }}) ]],
 jp:[[ dc('busido','Busidó','A közelharc 18%-kal erősebb.',
          {unit:u=>{ if(u.role==='melee'||u.role==='cav') u.dmg=Math.round(u.dmg*1.18); }}),
       dc('sakoku','Zárt ország','Az épületek 25%-kal szívósabbak.', bldHp(null,1.25)),
       dc('kaido','Országút','Minden egység 10%-kal gyorsabb.',
          {unit:u=>{ u.speed=Math.round(u.speed*1.1); }}) ]],
 cn:[[ dc('vizsga','Hivatalnoki vizsga','25%-kal több élelem.', {gather:t=>t==='food'?1.25:1}),
       dc('nagyfal','A Nagy Fal','A védőművek 40%-kal szívósabbak.', bldHp('tower',1.4)),
       dc('selyemut','Selyemút','25%-kal több arany.', {gather:t=>t==='gold'?1.25:1}) ]],
 in:[[ dc('fuszer','Fűszerkereskedelem','30%-kal több arany.', {gather:t=>t==='gold'?1.3:1}),
       dc('elefant','Harci elefántok','A közelharci egységek 20%-kal szívósabbak.',
          {unit:u=>{ if(u.role==='melee'){ u.maxHp=Math.round(u.maxHp*1.2); u.hp=u.maxHp; } }}),
       dc('kezmuves','Kézműves céhek','Az épületek 15%-kal olcsóbbak.',
          {buildCost:(t,c)=>scaleCost(c,0.85)}) ]],
 ml:[[ dc('sokereskedelem','Sókereskedelem','20%-kal több arany.', {gather:t=>t==='gold'?1.2:1}),
       dc('timbuktu','Timbuktu tudósai','A fejlesztések 20%-kal olcsóbbak.',
          {upgCost:(k,c)=>scaleCost(c,0.8)}),
       dc('lovasijasz','Lovas íjászok','A lovasság 15%-kal gyorsabb.',
          {unit:u=>{ if(u.role==='cav') u.speed=Math.round(u.speed*1.15); }}) ]]
};
// Melyik nemzet ideológiái tartoznak a játékoshoz, illetve a bothoz
function doctSet(owner){ return NAT_DOCT[nationOf(owner)]||NAT_DOCT.hu; }
const DOCTRINES=NAT_DOCT.hu;                    // visszafelé kompatibilitás

/* A fél IDEOLÓGIÁI. Ugyanaz a hiba volt benne, mint a fejlesztéseknél:
   minden nem-nulla fél az első bot döntéseit örökölte. */
function doctList(owner){
  const o=(typeof oldal==='function')?oldal(owner):null;
  const src=(o&&o.doct)||(owner?(G.ai&&G.ai.doct):G.doct), out=[];
  for(let a=0;a<DOCTRINES.length;a++){
    const k=src&&src[a]; if(!k) continue;
    const d=doctSet(owner)[a].filter(x=>x.key===k)[0];
    if(d) out.push(d);
  }
  return out;
}
/* Az akadémiai fejlesztések hatása: fokozatonként 5%. */
function upgMul(owner,key){ return 1+((upgOf(owner)[key]||0)*0.05); }
// Ugyanez tetszőleges lépésközzel — a különböző kutatások mást adnak
function upgMul2(owner,key,lepes){ return 1+((upgOf(owner)[key]||0)*(lepes||0.05)); }
function doctMul(owner,field,arg){
  let m=1;
  for(const d of doctList(owner)){
    if(typeof d[field]==='function') m*=d[field](arg);
    else if(typeof d[field]==='number') m*=d[field];
  }
  return m;
}
function applyDoct(u){ for(const d of doctList(u.owner)) if(d.unit) d.unit(u); }
function houseCount(owner){
  let n=0;
  for(const b of G.builds)
    if(!b.dead&&b.owner===owner&&b.type==='house'&&b.done) n++;
  return n;
}
function popCap(){
  let p=90;
  for(const d of doctList(0)) if(d.pop) p+=d.pop;
  p+=houseCount(0)*BUILDS.house.pop;           // minden kész lakóház öt fő
  return p;
}
function scaleCost(c,m){ for(const k in c) c[k]=Math.max(5,Math.round(c[k]*m/5)*5); return c; }
function nationOf(owner){
  /* Több fél esetén mindenkinek saját nemzete van. A tábla hiányában
     (menü, betöltés) a régi kétfeles válasz marad. */
  const o=(typeof oldal==='function')?oldal(owner):null;
  if(o&&o.nemzet) return o.nemzet;
  return owner?(G.ai?G.ai.nation:'de'):G.nation;
}
function bonusOf(owner){ return BONUS[nationOf(owner)]||{}; }

function costOf(base,age){ // a költségek korszakonként 22%-kal nőnek
  const o={},m=1+age*0.22;
  for(const k in base) o[k]=Math.round(base[k]*m/5)*5;
  return o;
}
// Nemzetfüggő költségek
function buildCost(type,age,owner){
  const c=costOf(BUILDS[type].cost,age), b=bonusOf(owner);
  if(b.buildCost) b.buildCost(type,c);
  for(const d of doctList(owner)) if(d.buildCost) d.buildCost(type,c);
  scaleCost(c, 1/upgMul2(owner,'ledger',0.04));    // Számvitel: olcsóbb építkezés
  return c;
}
function unitCost(role,age,owner){
  const c=costOf(UNITS[role].cost,age), b=bonusOf(owner);
  if(b.unitCost) b.unitCost(role,c);
  for(const d of doctList(owner)) if(d.unitCost) d.unitCost(role,c);
  scaleCost(c, 1/upgMul2(owner,'ledger',0.04));    // Számvitel: olcsóbb kiképzés
  return c;
}
function ageCost(age,owner){
  const c=Object.assign({},AGES[age].cost), b=bonusOf(owner);
  if(b.ageCost) b.ageCost(c);
  // Az ideológia szorzóként és függvényként is megadhatja a kedvezményt
  for(const d of doctList(owner)){
    if(typeof d.ageCost==='function') d.ageCost(c);
    else if(typeof d.ageCost==='number') scaleCost(c,d.ageCost);
  }
  return c;
}
// Egy küldetés felülírhatja, mit lehet az adott épületben kiképezni
function trainsOf(b){
  if(b.type==='hq'&&G.mission&&G.mission.hqTrains) return G.mission.hqTrains;
  /* Kalózvilágban a HAJÓKAT a város állítja ki, nem a kikötő: a
     főhadiszállás sólyája elég hozzá. Így kikötő és kaszárnya nélkül is
     lehet flottát építeni — a kalózok is a parton ácsolták a hajóikat. */
  if(G.pirate&&b.type==='hq')
    return ['transport','warship','galleon'];
  return BUILDS[b.type].trains;
}
/* A nyersanyag neve.

   KALÓZVILÁGBAN a kő helyett RUM jár: a szigeteken nem kőbányákból, hanem
   a cukornádból élnek, és a legénységet rummal fizetik. A játékmenet
   ugyanaz — csak a neve, a színe és az ikonja más. */
/* Mennyit termelnek az ÉPÜLETEK egy nyersanyagból másodpercenként?
   Ez az, ami a nyersanyagsávban a szám alatt megjelenik: a majorság, az
   aranybánya, a cukornád-ültetvény és a favágótelep hozama. A munkások
   fordulónkénti behordása ebbe nem számít bele, mert az szakaszos. */
function resIncome(res,owner){
  owner=owner||0;
  let n=0;
  for(const b of G.builds){
    if(b.dead||!b.done||b.owner!==owner) continue;
    const d=BUILDS[b.type];
    if(!d) continue;
    if(res==='food'&&d.food)
      n+=val(d.food,b.age)*PACE.farm*doctMul(owner,'food')*upgMul(owner,'yield');
    if(d.termel&&d.termel[res])
      n+=d.termel[res]*PACE.farm*upgMul(owner,'yield');
  }
  return n;
}
function resName(k){
  if(k==='stone'&&G.pirate){
    const r=T('rum');                        // a sávban végig nagybetűs
    return (LANG==='zh')?r:(r.charAt(0)+r.slice(1).toLowerCase());
  }
  const t={wood:'fa',stone:'ko',gold:'arany',food:'elelem',coal:'szen'}[k];
  if(t&&typeof T==='function'){
    const sz=T(t);
    if(sz&&sz!==t) return sz.charAt(0)+sz.slice(1).toLowerCase();
  }
  return RES_NAMES[k];
}
function costText(c){return Object.keys(c).map(k=>c[k]+' '+resName(k)).join(' · ');}
/* A létszámba a hajók fedélzetén utazók is beleszámítanak. Enélkül be
   lehetne pakolni egy csapatszállítót, új katonákat képezni a felszabadult
   keretre, majd kirakodni — így a seregkeret megkerülhető lenne. */
function popOf(owner){
  let n=0;
  for(const u of G.units){
    if(u.dead||u.owner!==owner) continue;
    n++;
    if(u.cargo&&u.cargo.length)
      for(const c of u.cargo) if(c.owner===owner) n++;
  }
  return n;
}

function nearestNode(x,y,type){
  let best=null,bd=1e9;
  for(const n of G.nodes){ if(n.dead||n.type!==type) continue;
    const d=dist(x,y,n.x,n.y); if(d<bd){bd=d;best=n;} }
  return best;
}
function nearestDrop(u){
  let best=null,bd=1e9;
  const want=u.naval?'navalDrop':'drop';        // a hajó a kikötőbe hordja a fogást
  for(const b of G.builds){ if(b.dead||b.owner!==u.owner||!b.done||!BUILDS[b.type][want]) continue;
    const d=dist(u.x,u.y,b.x,b.y); if(d<bd){bd=d;best=b;} }
  return best;
}
// A "from" a támadó: ha megadják, csak olyan célt adunk vissza, amit el is
// tud érni — a lándzsás nem üldöz repülőt, a bombázó nem vadászik gépre.
/* ÉJSZAKAI REJTŐZÉS.

   Sötétben egy vitorlás sziluettje elvész a tengeren: az ellenség csak
   közelebbről veszi észre. Ettől lesz értelme az éjszakai rajtaütésnek —
   besurransz a városhoz, mielőtt a tornyok tüzet nyitnának. Viharban még
   kevesebbet látni. */
function navalStealth(cel){
  if(!cel||!cel.naval) return 1;
  const ej=(typeof nightFactor==='function')?nightFactor():0;
  let f=1-0.45*ej;
  if(typeof seaSightMul==='function') f*=seaSightMul();
  return Math.max(0.35,f);
}
function nearestEnemy(x,y,owner,rad,from){
  /* SZÖVETSÉGES nem célpont. Korábban minden idegen tulajdonos ellenség
     volt (`u.owner===owner` kizárása) — két fél között ez helyes, de
     csapatban ez azt jelentette volna, hogy a szövetségesedre lő az
     őrtornyod. Az `ellenseg()` a csapatszámot nézi. */
  const ellenfel=(o)=>(typeof ellenseg==='function')?ellenseg(owner,o):(o!==owner);
  let best=null,bd=rad*rad;
  for(const u of G.units){ if(u.dead||!ellenfel(u.owner)||!seen(owner,u)) continue;
    // Az álruhás kémet nem lövik — amíg le nem leplezik
    if(u.disguise&&dist(u.x,u.y,x,y)>SPY_FELISMER) continue;
    // Éjjel és viharban a hajót csak közelebbről veszik észre
    if(u.naval&&dist(u.x,u.y,x,y)>rad*navalStealth(u)) continue;
    if(from&&!canEngage(from,u)) continue;
    // a hittérítő elsődleges célpont: közelebbinek számít, mint amilyen valójában
    const d=((u.x-x)**2+(u.y-y)**2)*(u.role==='priest'?0.3:1);
    if(d<bd){bd=d;best=u;} }
  if(best) return best;
  if(from&&from.air&&!from.bomb) return null;      // vadász nem üt épületet
  bd=rad*rad;
  for(const b of G.builds){ if(b.dead||!ellenfel(b.owner)||!seen(owner,b)) continue;
    const d=(b.x-x)**2+(b.y-y)**2; if(d<bd){bd=d;best=b;} }
  return best;
}
function entAt(wx,wy){ // mi van az egérkurzor alatt? (a ködben rejtőzőt nem adjuk vissza)
  for(const u of G.units)
    if(!u.dead && dist(wx,wy,u.x,u.y)<u.r+7 && (u.owner===0||seen(0,u))) return u;
  for(const b of G.builds){ if(b.dead) continue;
    if(!enyemVagySzovetseges(b.owner)&&!seen(helyiFel(),b)) continue;
    const r=buildRect(b); if(wx>r.x&&wx<r.x+r.w&&wy>r.y&&wy<r.y+r.h) return b; }
  for(const n of G.nodes)
    if(!n.dead && dist(wx,wy,n.x,n.y)<n.r+7 && fogAt(n.x,n.y)>0) return n;
  return null;
}
function hitRadius(e){return e.kind==='build'?Math.max(e.w,e.h)*0.45:e.r;}

/* =======================================================================
   7/B. PIAC

   Nyersanyagcsere aranyért. Az árfolyam mozog: amiből sokat adsz el, annak
   esik az ára; amiből sokat veszel, annak nő. Az árak lassan visszatérnek
   az alapszinthez, tehát türelemmel jobb üzletet köthetsz.

   A piac nem ingyen dolgozik: eladásnál kevesebbet kapsz, mint amennyiért
   ugyanazt megvennéd. Ez a rés a haszna.
   ===================================================================== */

const TRADE_UNIT=100;            // ennyi nyersanyagot cserélünk egyszerre
const TRADE_SELL=55;             // 100 egységért ennyi arany alapáron
const TRADE_BUY=95;              // 100 egység ennyi aranyba kerül
const TRADE_STEP=0.05;           // egy üzlet ennyivel mozdítja az árat
const TRADE_MIN=0.45, TRADE_MAX=2.2;
const TRADE_RES=['wood','stone','food','coal'];
/* A piac nyersanyagnevei. Kalózvilágban a kő helyén rum áll, ezért a
   nevet mindig a resName() adja, nem rögzített szöveg. */
function tradeNev(r){ return (typeof resName==='function')?resName(r):r; }

function marketInit(){
  G.prices={wood:1,stone:1,food:1,coal:1};
}
function hasMarket(owner){
  return G.builds.some(b=>!b.dead&&b.owner===owner&&b.done&&BUILDS[b.type].market);
}
function priceOf(res){
  if(!G.prices) marketInit();
  return G.prices[res]||1;
}
function sellPrice(res){ return Math.max(1,Math.round(TRADE_SELL*priceOf(res))); }
function buyPrice(res){  return Math.max(1,Math.round(TRADE_BUY *priceOf(res))); }

function sellRes(res){
  if(!hasMarket(0)){ toast(T('uzPiacKell')); SFX.play('deny'); return; }
  if((G.res[res]||0)<TRADE_UNIT){ toast(T('uzNincsEleg')+' '+tradeNev(res).toLowerCase()+'.'); SFX.play('deny'); return; }
  const ar=sellPrice(res);
  G.res[res]-=TRADE_UNIT;
  G.res.gold+=ar;
  G.earned.gold=(G.earned.gold||0)+ar;
  G.prices[res]=Math.max(TRADE_MIN, priceOf(res)*(1-TRADE_STEP));
  toast(TRADE_UNIT+' '+tradeNev(res).toLowerCase()+' eladva '+ar+' '+T('uzAranyert')+'.');
  SFX.play('click'); syncUI();
}
function buyRes(res){
  if(!hasMarket(0)){ toast(T('uzPiacKell')); SFX.play('deny'); return; }
  const ar=buyPrice(res);
  if((G.res.gold||0)<ar){ toast(T('uzNincsAranyad')+': '+ar+' kellene.'); SFX.play('deny'); return; }
  G.res.gold-=ar;
  G.res[res]=(G.res[res]||0)+TRADE_UNIT;
  G.prices[res]=Math.min(TRADE_MAX, priceOf(res)*(1+TRADE_STEP));
  toast(TRADE_UNIT+' '+tradeNev(res).toLowerCase()+' '+T('uzMegveve')+' '+ar+' aranyért.');
  SFX.play('click'); syncUI();
}
/* Az árak lassan visszahúzódnak az alapszintre — a piac emlékezete rövid. */
function marketTick(dt){
  if(!G.on) return;
  if(!G.prices) marketInit();
  for(const r of TRADE_RES){
    const p=G.prices[r];
    G.prices[r]=p+(1-p)*0.02*dt;
  }
}

/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   7/C. ELLÁTÁS ÉS KERESKEDELMI ÚTVONAL

   ELLÁTÁS
     A sereg eszik. Minden katona másodpercenként egy keveset fogyaszt a
     készletből; a munkás keveset, a hős és a hajó többet. Ha kifogy az
     élelem, a katonák lassan gyengülni kezdenek — nem halnak meg éhen, de
     harcképtelenné válnak.

     Ettől a nagy sereg döntés lesz, nem automatizmus: a majorság végre
     stratégiai célpont, és az ellenség földjének felégetése is fegyver.

   KERESKEDELMI ÚTVONAL
     Ha áll a kikötőd, időnként kereskedőhajó indul belőle egy semleges
     kikötő felé, és arannyal tér vissza. Az ellenség elsüllyesztheti —
     tehát a jövedelem sebezhető, és őrizni kell.
   ===================================================================== */

/* --- Ellátás --- */
const UPKEEP={
  worker:0.010, melee:0.036, ranged:0.032, spear:0.032, priest:0.026,
  medic:0.024, siege:0.055, hero:0.090,
  fisher:0.018, warship:0.055, transport:0.040,
  scout:0.026, fighter:0.060, bomber:0.075
};
const STARVE_RATE=0.006;        // éhezéskor ennyi életerő fogy másodpercenként

function upkeepOf(owner){
  let n=0;
  for(const u of G.units){
    if(u.dead||u.owner!==owner) continue;
    n+=UPKEEP[u.role]||0.03;
    if(u.cargo) for(const c of u.cargo) if(c.owner===owner) n+=UPKEEP[c.role]||0.03;
  }
  return n;
}
/* A majorságok és a halászok bevétele — ebből látszik, jó úton jársz-e. */
function foodIncome(owner){
  let n=0;
  for(const b of G.builds){
    if(b.dead||!b.done||b.owner!==owner) continue;
    const d=BUILDS[b.type];
    if(d.food) n+=val(d.food,b.age)*PACE.farm*doctMul(owner,'food')*upgMul(owner,'yield');
  }
  return n;
}
function supplyTick(dt){
  /* A hurok a MENÜBEN is fut, amikor még nincs bot: ilyenkor G.ai null.
     Enélkül az ellenőrzés nélkül az egész játékhurok elhalt, és a képernyő
     feketén maradt — miközben a felület látszólag rendben működött. */
  if(!G.on) return;
  for(const owner of [0,1]){
    const store=(typeof resOf==='function')?resOf(owner):(owner?(G.ai&&G.ai.res):G.res);
    if(!store) continue;
    const kell=upkeepOf(owner)*dt;
    if(store.food>=kell){
      store.food-=kell;
      if(!owner) G.starving=false;
      continue;
    }
    // nincs elég: ami van, elfogy, a többiek éheznek
    store.food=0;
    if(!owner){
      if(!G.starving){
        G.starving=true;
        toast(T('uzEhezes'));
        SFX.play('deny',0.9);
      }
    }
    for(const u of G.units){
      if(u.dead||u.owner!==owner||u.role==='worker') continue;
      u.hp-=u.maxHp*STARVE_RATE*dt;
      if(u.hp<1) u.hp=1;                  // az éhezés nem öl, csak harcképtelenné tesz
      u.starved=G.t;
    }
  }
}

/* --- Kereskedelmi útvonal --- */
const TRADE_EVERY=75;           // ennyi másodpercenként indul hajó
const TRADE_GOLD=[110,150,200,260];

function tradeRouteTick(dt){
  if(!G.on) return;
  G.tradeT=(G.tradeT===undefined?TRADE_EVERY:G.tradeT)-dt;
  if(G.tradeT>0) return;
  G.tradeT=TRADE_EVERY;
  /* MINDEN fél kikötője indíthat kereskedőhajót, nem csak a helyi
     játékosé — utóbbi gépenként mást jelentene, és szétcsúszást okozna. */
  const kik=G.builds.filter(b=>!b.dead&&b.done&&b.type==='harbor');
  if(!kik.length) return;
  if(G.units.some(u=>!u.dead&&u.trader)) return;    // egyszerre egy úton
  const h=kik[rndInt(0,kik.length-1)];
  // a semleges kikötő: a térkép túlsó felén, vízen
  let cel=null;
  for(let i=0;i<500&&!cel;i++){
    const x=rnd(60,WORLD.w-60), y=rnd(60,WORLD.h-60);
    if(isWater(x,y)&&dist(x,y,h.x,h.y)>900) cel={x,y};
  }
  if(!cel) return;
  // a kikötő melletti vízre tesszük
  let px=h.x, py=h.y+50;
  for(let r=40;r<=140;r+=20){
    let megvan=false;
    for(let i=0;i<12;i++){
      const a=i*TAU/12;
      const x=h.x+Math.cos(a)*r, y=h.y+Math.sin(a)*r;
      if(isWater(x,y)){ px=x; py=y; megvan=true; break; }
    }
    if(megvan) break;
  }
  /* A hajó ANNAK a félnek a tulajdona, akinek a kikötőjéből indult —
     korábban mindig a 0. fél kapta, tehát több félnél a másik kikötőjéből
     induló hajó is a házigazdának hozta volna az aranyat. */
  const t=makeUnit('fisher',h.owner,px,py,G.age);
  t.trader=true;
  t.homeX=h.x; t.homeY=h.y;
  t.gold=val(TRADE_GOLD,G.age);
  t.maxHp=Math.round(t.maxHp*1.5); t.hp=t.maxHp;
  t.phase='oda';
  t.order={type:'move',x:cel.x,y:cel.y};
  G.units.push(t);
  if(h.owner===(typeof helyiFel==='function'?helyiFel():0))
    toast(T('uzKereskedoIndult')+' — '+t.gold+' '+T('uzArannyalTer'));
}
/* A kereskedőhajó útja: oda, majd vissza. Ha hazaér, fizet. */
function traderTick(u,dt){
  if(!u.trader) return false;
  const o=u.order;
  if(u.phase==='oda'){
    if(!o||dist(u.x,u.y,o.x,o.y)<70){
      u.phase='vissza';
      u.order={type:'move',x:u.homeX,y:u.homeY};
      if(u.owner===(typeof helyiFel==='function'?helyiFel():0)) toast(T('uzKereskedoVissza'));
    }
    return false;
  }
  if(u.phase==='vissza'&&dist(u.x,u.y,u.homeX,u.homeY)<90){
    G.res.gold+=u.gold;
    G.earned.gold=(G.earned.gold||0)+u.gold;
    toast(T('uzKereskedoBeert')+': +'+u.gold+' arany.');
    SFX.at('ready',u.x,u.y,0.9);
    u.dead=true;
    return true;
  }
  return false;
}

/* =======================================================================
   8. HARC — ellenfogás, páncél, sebzésszámítás

   Kő-papír-olló háromszög: a pikás felfogja a lovasrohamot, a lovasság
   szétszórja a lövészeket, a lövészek pedig a lassú pikásokat aprítják.
   A páncél fix levonás, ezért a sok apró találat (puska, géppuska) alig
   karcolja a harckocsit — arra a páncéltörő való.
   ===================================================================== */
const COUNTER={
  siege:{worker:0.6,melee:0.5,ranged:0.6,spear:0.5,priest:0.6,medic:0.6,siege:1,cav:0.55},
  ram:{worker:0.15,melee:0.12,ranged:0.15,spear:0.12,priest:0.15,medic:0.15,siege:0.2,cav:0.12},
  // A védelmi épületek nehézfegyvert hordoznak, ezért a páncél kevésbé fogja ki:
  tower: {melee:1.25, ranged:1.30, spear:1.25, worker:1.2, priest:1.5, cav:1.35},
  /* A pika MINDEN lovas ellen jó — a könnyű ellen még jobban, mert azon
     nincs páncél, ami felfogná a szúrást. */
  spear: {melee:1.85, ranged:0.70, spear:1, worker:1.1, priest:1.6, cav:2.20},
  melee: {ranged:1.70, spear:0.60, melee:1, worker:1.5, priest:1.7, cav:1.15},
  ranged:{spear:1.50, melee:0.75, ranged:1, worker:1.2, priest:1.6, cav:0.80},
  /* A könnyűlovas a lövészre és a munkásra való. Pikára rárohanni
     öngyilkosság, a páncélos nehézlovas ellen pedig nincs mit tennie. */
  cav:   {ranged:1.90, worker:1.80, priest:1.8, spear:0.45, melee:0.75, cav:1},
  worker:{worker:1, melee:1, ranged:1, spear:1, priest:1, cav:1},
  priest:{worker:1, melee:1, ranged:1, spear:1, priest:1, cav:1},
  warship:{worker:1.2, melee:1.1, ranged:1.2, spear:1.2, priest:1.4, fisher:1.6, warship:1, cav:1.2},
  fisher:{}
};
/* Az egységek egymáshoz mért erőssége. Nyelvfüggő, ezért függvény: a
   szótárból olvassuk, hogy nyelvváltáskor a buboréksúgó is forduljon. */
const COUNTER_KEY={priest:'ctPriest',melee:'ctMelee',ranged:'ctRanged',
                   spear:'ctSpear',worker:'ctWorker',cav:'ctCav'};
function counterText(role){
  const k=COUNTER_KEY[role];
  return k?T(k):'';
}
const BUILD_ARMOR=4;
function vsBuilding(a){                 // ki mennyit ér az épületek ellen
  if(a.kind==='build') return 1;
  if(a.ram) return 5;                                // faltörő kos: erre való
  if(a.siege) return 3;                              // ostromgép: falbontásra való
  if(a.role==='melee')  return a.age===3?1.7:1;      // harckocsi: ostromfegyver
  if(a.role==='spear')  return a.age===3?1.1:0.5;
  if(a.role==='warship')return 1.2;                  // hajóágyú a partot lövi
  if(a.role==='ranged') return 0.45;                 // nyíl és golyó nem bont falat
  return 0.5;
}
function effDamage(a,t){
  // A hős aurája: nagyobb ütés a támadónak, több páncél a védőnek
  let d=a.dmg*(1+(a.auraDmg||0))*((typeof formMul==='function')?formMul(a,'dmg'):1);
  /* A hős csatakiáltása: nyolc másodpercig nagyobbat üt, aki hallotta. */
  if(typeof kialtasSebzes==='function') d*=kialtasSebzes(a);
  if(t.kind==='build') d=d*vsBuilding(a)-BUILD_ARMOR;
  else{
    const tab=a.kind==='build'?COUNTER.tower:(COUNTER[a.role]||COUNTER.ranged);
    d=d*((tab[t.role])||1)-((t.armor||0)+(t.auraArmor||0));
    /* Sűrű erdőben nehezebb eltalálni valakit: a fák felfogják a
       lövedékek egy részét, és a közelharcban sem lehet rendesen
       kitörni. Nem páncél, hanem takarás — ezért szorzó, nem levonás. */
    if(typeof terepVedelem==='function') d*=terepVedelem(t.x,t.y);
  }
  return Math.max(1,d);
}
function damage(e,dmg,from,toltet){
  if(e.dead) return;
  /* TÖLTET. Hajó ellen a lövedék fajtája dönti el, mi sérül: a golyó a
     testet, a láncos a vitorlázatot, a kartács a legénységet. */
  let legenySzorzo=1;
  if(toltet&&e.naval&&typeof toltetAdat==='function'){
    const t=toltetAdat(toltet);
    dmg*=t.test;
    legenySzorzo=t.legeny;
    if(t.vitorla){
      e.sailDmg=Math.min(1,(e.sailDmg||0)+t.vitorla*0.09);
      if(!REDUCED) G.fx.push({x:e.x+rnd(-8,8),y:e.y-10,t:0,life:.5,type:'hit'});
    }
  }
  /* Hajón a találat nem csak a testet bontja: embert is öl. Az elesett
     legénység az átszálláskor hiányzik majd — egy szétlőtt hajót könnyebb
     elfoglalni, mint egy épet. */
  if(e.crewMax&&e.crew>0&&e.maxHp>0){
    const arany=Math.min(1,dmg/e.maxHp);
    e.crew=Math.max(0, e.crew - e.crewMax*arany*0.80*legenySzorzo);
  }
  e.hp-=dmg;
  e.hitAt=G.t;
  if(e.hp<=0){
    e.dead=true;
    if(typeof helyHang==='function') helyHang(e.kind==='build'?'destroy':'die', e.x, e.y, 0.85);
    /* A föld emlékszik. Az elesett katona után elhagyott fegyver marad,
       a leomlott épület után égett folt — méretarányosan. */
    if(typeof nyomHozzaad==='function'){
      if(e.kind==='build') nyomHozzaad(NYOM_EGES, e.x, e.y, 1.6+Math.max(e.w||40,e.h||40)/70);
      else if(Math.random()<0.4) nyomHozzaad(NYOM_FEGYVER, e.x, e.y, 1);
    }
    G.fx.push({x:e.x,y:e.y,t:0,life:.5,type:'boom',r:hitRadius(e)});
    SFX.at(e.kind==='build'?'destroy':'die',e.x,e.y,e.kind==='build'?1:0.8);
    if(e.kind==='unit'){
      if(e.air) crashPlane(e);                 // a gép lezuhan és kigyullad
      else if(e.naval&&typeof sinkShip==='function') sinkShip(e);  // a hajó elsüllyed
      else dropCorpse(e);                      // a katona elesik, vértócsa marad
      if(typeof playDeath==='function') playDeath(e.x,e.y);
    }
    if(e.owner===1&&e.kind==='unit') G.kills=(G.kills||0)+1;
    /* HÍRNÉV: minden ellenséges veszteség öregbíti a nevedet — és növeli
       az esélyt, hogy a király hajóhadat küld rád. */
    if(typeof hirnevAd==='function'&&e.owner===1&&from&&from.owner===0)
      hirnevAd(e.kind==='unit'?(e.naval?6:1.2):2);
    if(typeof creditKill==='function') creditKill(from,e);   // veteránság
    if(typeof merchantLoot==='function') merchantLoot(e,from); // kereskedőhajó zsákmánya
    if(e.kind==='build'){ G.navVer++;                      // az épület eltűnt: új útvonalak nyílnak
      if(e.owner===0) toast('Elveszett: '+BUILDS[e.type].names[e.age]); }
  }else if(e.kind==='unit'&&((typeof ellenseg==='function')?ellenseg(from.owner,e.owner):(e.owner!==from.owner))
           &&!e.order&&!e.target){
    e.target=from; // visszavág, ha megtámadják
  }
}
// A puskapor kora: a lőfegyverek szenet égetnek. Ha nincs, néma marad a
// fegyver — a közelharci egységeket ez nem érinti.
let coalWarn=-99;
function coalNeed(a){
  const age=a.age;
  if(age<COAL_AGE) return 0;
  if(a.kind==='build') return BUILDS[a.type].dmg?COAL_COST.tower:0;
  if(a.siege) return COAL_COST.ranged*2.2;          // az ostromgép sok puskaport nyel
  if(a.role==='ranged')  return COAL_COST.ranged;
  // A hajóágyú puskaporral lő, nem szénnel. Korábban a szénhiány néma
  // flottát eredményezett — a tengeri csata megállt a semmi közepén.
  if(a.role==='warship') return 0;
  if(a.role==='melee'&&age===3) return COAL_COST.melee;    // harckocsi
  if(a.role==='spear'&&age===3) return COAL_COST.melee*0.6; // páncéltörő
  return 0;
}
function hasCoal(a){
  const need=coalNeed(a);
  if(!need) return true;
  /* A fél SAJÁT raktára. A régi alak minden nem-nulla tulajdonost „a gép”-nek
     vett, ezért több félnél a 2. játékos nyersanyaga az ELSŐ BOT
     készletébe folyt volna. */
  const store=(typeof resOf==='function')?resOf(a.owner):(a.owner?G.ai.res:G.res);
  if((store.coal||0)<need){
    if(!a.owner&&G.t-coalWarn>12){
      coalWarn=G.t;
      toast(T('uzNincsSzen'));
    }
    return false;
  }
  store.coal-=need;
  return true;
}
// A levegőbe csak a vadász, a 20. századi lövész és a korszerű torony lő.
// A bombázó és a felderítő nem harcol repülővel.
function canEngage(a,t){
  if(!t||t.dead) return false;
  if(t.air){
    if(a.kind==='build') return a.age===3;
    if(a.antiAir) return true;
    return a.age===3&&a.role==='ranged';
  }
  if(a.air) return !!a.bomb;              // csak a bombázó üt földi célt
  return true;
}
/* -----------------------------------------------------------------------
   ATOMCSAPÁS

   Az akadémián kikutatott atomprogram után a bombázó egyszeri csapást
   mérhet: kijelölöd a célpontot, a gép odarepül, és a becsapódás 2x2
   majorságnyi területen mindent megsemmisít — épületet, katonát,
   lelőhelyet egyaránt, függetlenül attól, kié.
   ----------------------------------------------------------------------- */
const ATOM_R=Math.round(Math.max(BUILDS.farm.w,BUILDS.farm.h)*2*0.5+18);
function atomStrike(x,y,owner){
  if(owner===0&&typeof achGet==='function') achGet('atomic');
  SFX.at('boom',x,y,1.6);
  G.shake=Math.max(G.shake||0,1.6);
  G.fx.push({x,y,t:0,life:3.2,type:'atom'});
  for(const u of G.units){
    if(u.dead||u.air) continue;
    if(dist(u.x,u.y,x,y)<ATOM_R) damage(u,99999,null);
  }
  for(const b of G.builds){
    if(b.dead) continue;
    if(dist(b.x,b.y,x,y)<ATOM_R+16) damage(b,99999,null);
  }
  for(const n of G.nodes){
    if(n.dead) continue;
    if(dist(n.x,n.y,x,y)<ATOM_R) { n.dead=true; }
  }
  G.scorch=G.scorch||[];
  G.scorch.push({x,y,r:ATOM_R});
  G.navVer++;
  toast(owner===0?'Atomcsapás! A terület kihalt.':'Atomcsapás érte a birodalmat!');
}
// A becsapódás nem pontszerű: a bomba a környezetét is megtépázza.
const BOMB_R=46;
function bombHit(x,y,dmg,src){
  SFX.at('boom',x,y,1.1);
  G.shake=Math.max(G.shake||0,0.5);
  G.fx.push({x,y,t:0,life:0.7,type:'bomb'});
  const owner=src?src.owner:0;
  for(const u of G.units){
    if(u.dead||u.air||u.owner===owner) continue;
    const d=dist(u.x,u.y,x,y);
    if(d<BOMB_R) damage(u,dmg*(1-d/BOMB_R*0.55),src);
  }
  for(const b of G.builds){
    if(b.dead||b.owner===owner) continue;
    const d=dist(b.x,b.y,x,y);
    if(d<BOMB_R+18) damage(b,dmg*0.8,src);
  }
}
function attack(a,target){
  const p=a.kind==='build'?BUILDS[a.type]:UNITS[a.role];
  const spd=val(p.proj,a.age);
  SFX.at(weaponSound(a.kind==='build'?(a.age===3?'spear':'ranged'):a.role,a.age),
         a.x,a.y,a.kind==='build'?0.9:0.75);
  const dmg=effDamage(a,target);
  if(a.bomb){
    // A bombázó nem lő: kioldja a bombát, az pedig zuhan. A becsapódás
    // helye a célpont MOSTANI helye — mozgó cél elől ki lehet térni.
    SFX.at('place',a.x,a.y,0.5);
    G.projs.push({bomb:true, x:a.x, y:a.y-AIR_ALT, tx:target.x, ty:target.y,
      z:AIR_ALT, dmg, owner:a.owner, src:a, style:'bomb',
      fall:0, fallT:0.85, dead:false});
    return;
  }
  /* --- A HARC HANGJA ---
     A hangkönyvtárban régóta megvolt az `arrow`, a `clang` és a `die`,
     de senki nem szólította meg őket: a csata néma volt. A hangerőt a
     KÉPERNYŐTŐL VALÓ TÁVOLSÁG szabja meg — ami a látótéren kívül esik,
     az halkabb, a nagyon távoli meg sem szólal. Enélkül egy nagy
     térképen mindenki csatája egyszerre dörögne a füledben.

     A hangkönyvtárnak külön szünetideje van hangonként (SFX_CD), tehát
     egy tömegjelenet sem lesz recsegés: a fölösleges hívások eldobódnak. */
  if(typeof harcHang==='function') harcHang(a,target,spd);

  if(spd){ // lövedék
    /* Hajóágyú: nem egy lövés, hanem SORTŰZ. Az ágyúk a célpont felőli
       oldalon sorakoznak, mindegyik villan és füstöl — annyi, amennyi a
       hajón van. Ettől látszik, mekkora hajóval van dolgod. */
    if(a.guns&&!REDUCED&&typeof broadside==='function') broadside(a,target);
    // a hajóágyú töltete a lövedékkel utazik: a becsapódáskor dönti el a hatást
    const tolt=(a.guns&&typeof toltetOf==='function')?toltetOf(a.owner):null;
    G.projs.push({x:a.x,y:a.y-(a.kind==='build'?10:6),target,dmg,spd,owner:a.owner,src:a,toltet:tolt,
      style:a.age===0?'arrow':(a.age<3?'ball':'tracer'),dead:false});
  }else{
    damage(target,dmg,a);
    G.fx.push({x:target.x,y:target.y,t:0,life:.18,type:'hit'});
  }
}

/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   8/B. VETERÁNSÁG ÉS HARCI ÁLLÁS

   VETERÁNSÁG
     Minden egység gyűjti az öléseit. Három ölés után veterán, hat után
     elit. Fokozatonként +10% sebzés és +10% életerő. Egy megélt csapat
     többet ér, mint egy friss — érdemes vigyázni rájuk.

   HARCI ÁLLÁS
     Három viselkedés, egységenként:
       Támadó       — magától célt fog és üldözi (pórázon)
       Tartsd       — nem mozdul, csak arra lő, ami hatótávba ér
       Visszavonul  — ha az életereje 40% alá esik, elhátrál a harcból
   ===================================================================== */

const VET_KILLS=[0,3,6];                      // ennyi ölés kell a fokozathoz
const VET_NEV=['újonc','veterán','elit'];
const VET_BONUS=0.10;                         // fokozatonként ennyivel jobb

function vetRank(u){
  const k=u.kills||0;
  if(k>=VET_KILLS[2]) return 2;
  if(k>=VET_KILLS[1]) return 1;
  return 0;
}
/* Előléptetés. A sebzést és az életerőt is emeljük; a meglévő sebesülés
   arányát megtartjuk, hogy az előléptetés ne gyógyítson teljesen. */
function vetPromote(u){
  const uj=vetRank(u);
  if(uj===(u.vet||0)) return false;
  const arany=u.hp/u.maxHp;
  const regi=1+(u.vet||0)*VET_BONUS, most=1+uj*VET_BONUS;
  u.vet=uj;
  u.dmg=u.dmg/regi*most;
  u.maxHp=Math.round(u.maxHp/regi*most);
  u.hp=Math.min(u.maxHp, Math.max(1, Math.round(u.maxHp*arany)+Math.round(u.maxHp*0.08)));
  u.vetAt=G.t;                                // a rajzolás ebből villan
  if(u.owner===ENID){
    SFX.at('ready',u.x,u.y,0.6);
    toast(UNITS[u.role].names[u.age]+' '+T('uzEloleptetve')+': '+VET_NEV[uj]+'.');
  }
  return true;
}
// Egy ölés jóváírása annak, aki elejtette
function creditKill(oles,aldozat){
  if(!oles||oles.kind!=='unit'||oles.dead) return;
  if(!aldozat||aldozat.kind!=='unit') return;
  if(oles.owner===aldozat.owner) return;
  oles.kills=(oles.kills||0)+1;
  vetPromote(oles);
}

/* --- Alakzatok ---
   Nem csak a felállás más: mindegyik ad valamit, és elvesz valamit.
     VONAL    — széles tűzvonal: a lövészek 10%-kal messzebbre lőnek
     ÉK       — roham: 12%-kal gyorsabb és 12%-kal nagyobbat üt
     NÉGYSZÖG — tömör védelem: +2 páncél, de 15%-kal lassabb menet */
const /* A FORM_NEV a betöltéskor egyszer épül fel, ezért nyelvváltáskor
   frissíteni kell — a `vonal` kulcs korábban magyarul égett bele. */
FORM_NEV={line:T('vonal'), wedge:T('ek'), square:T('negyszog')};
const FORM_LEIRAS={
  line:T('alVonalAl'),
  wedge:T('alEkAl'),
  square:T('alNegyszogAl')
};
function setFormation(f){
  if(typeof logAdd==='function'&&logAdd('form', selIdk(), f)) return;
  /* Az alakzat FÉLENKÉNT külön él. Régen egyetlen G.formation volt — az a
     helyi játékosé —, és a bónusz csak az ő egységeire hatott. Több
     emberrel ez szétcsúszást okozott: nálad a te alakzatod számított,
     nála az övé, tehát ugyanaz a katona más erővel harcolt a két gépen. */
  {
    const o=(typeof oldal==='function')?oldal(ENID):null;
    if(o) o.formation=f;
  }
  G.formation=f;
  toast(T('uzAlakzat')+': '+FORM_NEV[f]+' — '+FORM_LEIRAS[f]);
  SFX.play('click'); syncUI();
}
// Az alakzat szorzói. A terep és a hős aurája ezekre rakódik rá.
function formMul(u,mit){
  /* Az EGYSÉG TULAJDONOSÁNAK alakzata számít, nem a helyi játékosé. */
  const o=(typeof oldal==='function')?oldal(u.owner):null;
  const f=(o&&o.formation)||((u.owner===(G.enIdHelyi||0))?(G.formation||'line'):'line');
  if(!o&&u.owner!==(G.enIdHelyi||0)) return 1;  // régi mentés: marad a régi szabály
  if(u.naval||u.air||u.role==='worker') return 1;
  if(mit==='range')  return (f==='line'&&u.role==='ranged')?1.10:1;
  if(mit==='dmg')    return (f==='wedge')?1.12:1;
  if(mit==='speed')  return (f==='wedge')?1.12:((f==='square')?0.85:1);
  if(mit==='armor')  return (f==='square')?2:0;
  return 1;
}

/* --- Harci állás --- */
const STANCE_NEV={aggro:T('uzTamado'), hold:'Tartsd a vonalat', flee:T('uzVisszavonulas')};
function setStance(s){
  if(typeof logAdd==='function'&&logAdd('stance', selIdk(), s)) return;
  let n=0;
  for(const u of G.sel){
    if(u.dead||u.role==='worker') continue;
    u.stance=s;
    if(s==='hold'){ u.order=null; }           // a helyén marad
    n++;
  }
  if(n){ toast(n+' egység: '+STANCE_NEV[s]); SFX.play('click'); syncUI(); }
}
// Meneküljön-e? Csak a Visszavonulás állásban, és csak megsérülve.
function shouldFlee(u){
  return u.stance==='flee' && u.hp < u.maxHp*0.4;
}
// A menekülés iránya: el a legközelebbi ellenségtől, a bázis felé
function fleeMove(u,dt){
  const e=nearestEnemy(u.x,u.y,u.owner,320,u);
  let tx,ty;
  if(e){ tx=u.x+(u.x-e.x), ty=u.y+(u.y-e.y); }
  else {
    const b=G.builds.filter(b=>!b.dead&&b.owner===u.owner&&b.type==='hq')[0];
    if(!b) return false;
    tx=b.x; ty=b.y;
  }
  navMove(u,clamp(tx,40,WORLD.w-40),clamp(ty,40,WORLD.h-40),dt);
  return true;
}

/* =======================================================================
   9. FRISSÍTÉS — egységek
   ===================================================================== */
// A terep járhatósága két egymás tükörképe szabály: a katona a vízbe nem
// léphet, a hajó pedig a partra nem. Ha az egyik tengely mentén elakad,
// megpróbál a másik mentén elcsúszni a part vonalán.
function passable(u,x,y){
  if(u.air) return true;
  if(isRock(x,y)) return false;          // a hegyet csak a repülő szeli át                      // a gépek mindenek fölött szállnak
  const w=isWater(x,y);
  return u.naval?w:!w;
}
function moveTo(u,tx,ty,dt){
  if(!isFinite(tx)||!isFinite(ty)) return 0;   // hibás célpont: nem mozdulunk
  const dx=tx-u.x, dy=ty-u.y, d=Math.hypot(dx,dy);
  if(d<1) return 0;
  u.face=datan2(dy,dx);
  /* A TEREP lassít: mocsárban a láb elmerül, sűrű erdőben ág akad, és a
     domboldalon felfelé menni nehezebb. A hajókra nem vonatkozik — azok
     vízen járnak, ott nincs se mocsár, se emelkedő. */
  let terepM=1;
  if(!u.naval&&!u.air){
    if(typeof terepSebesseg==='function'){
      const cx=u.x+(tx-u.x)*0.5, cy=u.y+(ty-u.y)*0.5;   // a következő lépés tája
      terepM=terepSebesseg(cx,cy,u.x,u.y);
    }
    /* Az IDŐJÁRÁS is beleszól: a hó és a felázott sár lassít. A hajót és
       a repülőt nem érinti — az egyik vízen jár, a másik fölötte. */
    if(typeof weatherSpeed==='function') terepM*=weatherSpeed();
  }
  /* A csatakiáltás a hajót és a repülőt sem érinti — az a gyalogság
     lendülete. */
  if(!u.naval&&!u.air&&typeof kialtasSebesseg==='function'){
    terepM*=kialtasSebesseg(u);
  }
  const step=Math.min(u.speed*terepM*dt,d);
  const nx=u.x+dx/d*step, ny=u.y+dy/d*step;
  if(passable(u,nx,ny)){ u.x=nx; u.y=ny; }
  else if(passable(u,nx,u.y)) u.x=nx;          // csúszás a part mentén
  else if(passable(u,u.x,ny)) u.y=ny;
  else return d;                                // teljesen elakadt
  u.walk+=step*0.09;

  /* PATADOBOGÁS. Nem minden lépésnél szólal meg — a `walk` a megtett út
     mértéke, és bizonyos szakaszonként egyszer szól. Így a hang a
     TÉNYLEGES sebességhez igazodik: a vágtató lovas sűrűbben dobog, az
     álló nem hallatszik.

     Csak a lovasnak. A gyalogos lépteit szándékosan nem szólaltatjuk
     meg: húsz katonánál az már zizegő zaj lenne, nem hangkép.

     A hangkönyvtár szünetideje (420 ms) amúgy is elnyeli a fölösleget,
     ha egyszerre több lovas is fut a képernyőn. */
  if(u.role==='cav'&&typeof helyHang==='function'){
    if(u.walk-(u.hoofT||0)>2.6){
      u.hoofT=u.walk;
      helyHang('hoof',u.x,u.y,0.7);
    }
  }
  return d-step;
}
// Eltolás csak akkor, ha a cél járható. Enélkül a tömeg vízbe vagy
// sziklába nyomhatja a szélén állót, ahonnan nincs kiút.
function pushSafe(u,dx,dy){
  if(passable(u,u.x+dx,u.y+dy)){ u.x+=dx; u.y+=dy; return; }
  if(passable(u,u.x+dx,u.y)) u.x+=dx;
  else if(passable(u,u.x,u.y+dy)) u.y+=dy;
}
// A kapuban nem lökdösődünk: a szűk átjáróban egymásba érve tudnak csak
// libasorban átjutni. Enélkül a tömeg egymást tolja vissza a kapu előtt.
function inOwnGate(u){
  for(const b of G.builds){
    if(b.dead||!b.done||!BUILDS[b.type].gate||b.owner!==u.owner) continue;
    // A kapu előtti és mögötti sávban is szabad az áthaladás, különben a
    // torlódás a küszöb előtt alakul ki.
    if(Math.abs(u.x-b.x)<b.w/2+44&&Math.abs(u.y-b.y)<b.h/2+44) return true;
  }
  return false;
}
// Mennyire "sürgős" az egységnek: aki közelebb van a céljához, azt kevésbé
// lökik odébb. Így sorbanállás alakul ki tolongás helyett.
function goalDist(u){
  const o=u.order;
  if(!o) return 1e9;                           // tétlen: mindenkinek utat enged
  const tx=o.target?o.target.x:o.x, ty=o.target?o.target.y:o.y;
  if(tx===undefined) return 1e9;
  return Math.hypot(tx-u.x,ty-u.y);
}
function separate(u){
  if(!u.air&&!u.naval&&inOwnGate(u)) return;
  if(u.noSep>G.t) return;                      // torlódásból szabadulóban: átenged // finom egymástól-eltolás, hogy ne csússzanak egybe
  for(const o of G.units){
    if(o===u||o.dead) continue;
    if(!!o.naval!==!!u.naval) continue;         // hajó és gyalogos külön világban jár
    if(!!o.air!==!!u.air) continue;             // a repülő a többiek fölött halad
    const dx=u.x-o.x, dy=u.y-o.y, mind=u.r+o.r;
    const d2=dx*dx+dy*dy;
    if(d2>0.01&&d2<mind*mind){
      const d=Math.sqrt(d2);
      // Aszimmetrikus eltolás: a céljához közelebbi marad, a távolabbi
      // enged. A tétlen egység mindig kitér a parancsot teljesítő elől.
      const mine=goalDist(u), his=goalDist(o);
      let w=0.35;
      if(mine>his*1.15) w=0.62;                // én vagyok hátrébb: én lépek
      else if(his>mine*1.15) w=0.12;           // én vagyok elöl: alig mozdulok
      pushSafe(u,dx/d*(mind-d)*w,dy/d*(mind-d)*w);
    }
  }
}
function blockByBuildings(u){ // falakon és épületeken nem sétál át
  if(u.naval||u.air) return;                     // hajó a vízen, repülő a magasban
  for(const b of G.builds){
    if(b.dead) continue;
    // A saját kapun a te embereid átmennek, az ellenség nem
    if(b.done&&BUILDS[b.type].gate&&b.owner===u.owner) continue;
    const hw=b.w/2+u.r*0.7, hh=b.h/2+u.r*0.7;
    const dx=u.x-b.x, dy=u.y-b.y;
    if(Math.abs(dx)<hw&&Math.abs(dy)<hh){
      // Az épületből kitolás sem vihet járhatatlan terepre: ha a rövidebb
      // irány vízbe vagy sziklába vezetne, a másikat választjuk.
      const ax=b.x+Math.sign(dx||1)*hw, ay=b.y+Math.sign(dy||1)*hh;
      const shortX=(hw-Math.abs(dx)<hh-Math.abs(dy));
      if(shortX&&passable(u,ax,u.y)) u.x=ax;
      else if(!shortX&&passable(u,u.x,ay)) u.y=ay;
      else if(passable(u,u.x,ay)) u.y=ay;
      else if(passable(u,ax,u.y)) u.x=ax;
      else if(shortX) u.x=ax; else u.y=ay;     // végső esetben mégis kitoljuk
    }
  }
}
// Melyik épület körül és mekkora sugárban épülnek fel a sebesültek
const HEAL_R={hq:300, barracks:250, tower:190};
function isHealBuilding(b){ return !!HEAL_R[b.type]; }
// Az átállított egység az új tulajdonos bónuszait és fejlesztéseit kapja meg
function convertUnit(t,by){
  const oldName=UNITS[t.role].names[t.age];
  t.owner=by.owner; t.order=null; t.target=null; t.retreat=false; t.chan=0;
  recomputeUnit(t);
  t.hp=Math.min(t.hp,t.maxHp);
  G.fx.push({x:t.x,y:t.y,t:0,life:.7,type:'boom',r:18});
  /* A becsapódás krátert hagy — ez marad, amikor a füst már elszállt. */
  if(typeof nyomHozzaad==='function') nyomHozzaad(NYOM_KRATER,t.x,t.y,1.1);
  SFX.at('ready',t.x,t.y,1);
  if(t.owner===0) toast(oldName+' átállt a te oldaladra!');
  else toast(T('uzAtallitotta')+' '+oldName.toLowerCase()+' '+T('uzAtallitotta2'));
}
// Amit nem lehet meggyőzni: a harckocsi legénysége zárt páncél mögött ül
function convertible(t){
  return t&&!t.dead&&t.kind==='unit'&&!(t.role==='melee'&&t.age===3);
}
// A közelben álló legközelebbi befejezetlen építkezés. Ha egy munkás végzett
// az egyikkel, magától átmegy a másikra — nem áll meg tétlenül a fél kész
// bázis közepén.
function nextBuildSite(u,range){
  let best=null,bd=(range||560)**2;
  for(const b of G.builds){
    if(b.dead||b.owner!==u.owner||b.done) continue;
    const d=(b.x-u.x)**2+(b.y-u.y)**2;
    if(d<bd){bd=d;best=b;}
  }
  return best;
}
let chainMsgT=-99;
// Vészkijárat: ha egy egység valamiért járhatatlan terepen találja magát
// (hegy alá került, kaput bontottak alatta, tömeg nyomta be), a legközelebbi
// járható pontra léptetjük. Enélkül örökre ott állna.
function unstick(u){
  if(u.air||passable(u,u.x,u.y)) return false;
  for(let r=16;r<=260;r+=16){
    for(let k=0;k<16;k++){
      const a=k/16*TAU;
      const nx=u.x+dcos(a)*r, ny=u.y+dsin(a)*r;
      if(nx<20||ny<20||nx>WORLD.w-20||ny>WORLD.h-20) continue;
      if(passable(u,nx,ny)){ u.x=nx; u.y=ny; return true; }
    }
  }
  return false;
}
// Torlódásfigyelő: ha egy egységnek van parancsa, de sokáig egy helyben
// toporog, rövid időre kikapcsoljuk rá a lökdösődést és oldalra billentjük.
// Így a szűk átjáró előtt összeragadt tömeg magától kibogozódik.
// Épületmentes-e a pont? A saját kapu átjárható, minden más nem.
function clearOfBuildings(u,x,y){
  for(const b of G.builds){
    if(b.dead) continue;
    if(b.done&&BUILDS[b.type].gate&&b.owner===u.owner) continue;
    if(Math.abs(x-b.x)<b.w/2+u.r*0.7&&Math.abs(y-b.y)<b.h/2+u.r*0.7) return false;
  }
  return true;
}
function jamWatch(u,dt){
  if(u.air) return;
  const o=u.order;
  if(!o||o.type==='gather'&&!o.target){ u._jt=0; return; }
  const d2=(u.x-(u._jx||0))**2+(u.y-(u._jy||0))**2;
  if(d2>36){ u._jx=u.x; u._jy=u.y; u._jt=0; return; }
  u._jt=(u._jt||0)+dt;
  if(u._jt>2){
    u._jt=0;
    u.noSep=G.t+3;                           // 1,6 mp-ig nem lökik odébb
    // Oldalirányú billentés — de csak oda, ahol se terep, se épület nincs.
    // Enélkül a billentés átvinné az egységet a falon.
    for(let k=0;k<8;k++){
      /* SZIMULÁCIÓS véletlen: ez a lépés a világot mozgatja, nem a képet.
         Szabad véletlennel a beszorult egység két azonos maggal indított
         játszmában más irányba kerülte ki az akadályt — ez volt az utolsó
         forrása a szétcsúszásnak. */
      const a=srange(0,TAU), s2=u.r*1.1;
      const nx=u.x+dcos(a)*s2, ny=u.y+dsin(a)*s2;
      if(!passable(u,nx,ny)) continue;
      if(!clearOfBuildings(u,nx,ny)) continue;
      u.x=nx; u.y=ny; break;
    }
    if(u.order&&u.order.type==='move') u.repath=0;
  }
}
function updateUnit(u,dt){
  if(unstick(u)) return;                       // előbb kimászunk a szorult helyzetből
  jamWatch(u,dt);
  u.cd-=dt;
  // --- Hittérítő ---
  if(u.role==='priest'){
    const heal=val(UNITS.priest.heal,u.age);
    for(const o of G.units){                        // gyógyítás a közelben
      if(o.dead||o.owner!==u.owner||o===u||o.hp>=o.maxHp) continue;
      if(Math.abs(o.x-u.x)<150&&Math.abs(o.y-u.y)<150&&G.t-(o.hitAt||-99)>3)
        o.hp=Math.min(o.maxHp,o.hp+heal*dt);
    }
    const ord=u.order;
    if(ord&&ord.type==='convert'){
      const t=ord.target;
      if(!convertible(t)||t.owner===u.owner){ u.order=null; u.chan=0; return; }
      const d=dist(u.x,u.y,t.x,t.y);
      const lotav=(u.range>40&&typeof terepLotav==='function')?u.range*terepLotav(u.x,u.y):u.range;
      if(d>lotav){ u.chan=Math.max(0,(u.chan||0)-dt); navMove(u,t.x,t.y,dt); return; }
      u.face=datan2(t.y-u.y,t.x-u.x);
      // A saját bázisuk közelében nehezebb meggyőzni az embereket
      let res=1;
      for(const b of G.builds){
        if(b.dead||b.owner!==t.owner||!b.done||!HEAL_R[b.type]) continue;
        if(dist(b.x,b.y,t.x,t.y)<330){ res=0.5; break; }
      }
      u.chan=(u.chan||0)+dt*res*(1/doctMul(u.owner,'convert'));
      if(u.chan>=val(UNITS.priest.convert,u.age)){ convertUnit(t,u); u.chan=0; u.order=null; }
      return;
    }
    u.chan=Math.max(0,(u.chan||0)-dt*2);
    // A bot papjai maguktól keresnek célpontot a látótávolságon belül
    if(u.owner===1&&!ord){
      let best=null,bd=(u.range*2)**2;
      for(const o of G.units){
        if(o.dead||o.owner===u.owner||!convertible(o)||!seen(1,o)) continue;
        const d=(o.x-u.x)**2+(o.y-u.y)**2;
        if(d<bd){bd=d;best=o;}
      }
      if(best){ u.order={type:'convert',target:best}; u.chan=0; return; }
    }
    if(ord&&(ord.type==='move'||ord.type==='amove')){
      if(navMove(u,ord.x,ord.y,dt)<6) u.order=null;
    }
    return;
  }
  // A bot sebesült katonái kivonulnak a tűzvonalból, és a bázisnál felépülnek
  if(u.owner===1&&u.role!=='worker'){
    if(!u.retreat&&u.hp<u.maxHp*0.25) u.retreat=true;
    else if(u.retreat&&u.hp>u.maxHp*0.7){ u.retreat=false; u.order=null; }
    if(u.retreat){
      const b=nearestOwnBuilding(u);
      if(b&&dist(u.x,u.y,b.x,b.y)>150){
        u.target=null; u.order=null;
        navMove(u,b.x,b.y,dt);
        return;
      }
    }
  }
  // Gyógyulás csak ott, ahol helyőrség és ellátmány van: főhadiszállás,
  // kaszárnya, torony. Egy harminc követ érő fal nem kötözőhely.
  if(u.hp<u.maxHp&&G.t-(u.hitAt||-99)>6){
    for(const b of G.builds){
      if(b.dead||b.owner!==u.owner||!b.done||!HEAL_R[b.type]) continue;
      const r=HEAL_R[b.type];
      if(Math.abs(b.x-u.x)<r&&Math.abs(b.y-u.y)<r){
        u.hp=Math.min(u.maxHp,u.hp+dt*(u.maxHp*0.035));
        break;
      }
    }
  }
  const o=u.order;

  // Ha egy hajó hosszan nem közeledik a céljához, más vízfelületen van:
  // elengedi a parancsot, és keres másikat ahelyett, hogy a partnak feszülne.
  // A csapatszállító kirakodása külön kezelést kíván
  if((u.transport||u.sTower)&&o&&o.type==='unload'){ updateTransport(u,dt); return; }
  if(u.naval&&o&&(o.type==='gather'||o.type==='move'||o.type==='amove'||o.type==='attack')){
    const tx=o.target?o.target.x:o.x, ty=o.target?o.target.y:o.y;
    if(tx!==undefined){
      const d=Math.hypot(tx-u.x,ty-u.y);
      if(u._pd===undefined||d<u._pd-6){ u._pd=d; u._pt=G.t; }
      else if(G.t-(u._pt||G.t)>7){
        u.order=null; u.target=null; u._pd=undefined;
        if(u.role==='fisher'){
          const n2=nearestNode(u.x,u.y,'fish');
          if(n2&&dist(u.x,u.y,n2.x,n2.y)<900) u.order={type:'gather',res:'fish',target:n2};
        }
        return;
      }
    }
  }else if(u.naval) u._pd=undefined;

  // --- Atomcsapás: a bombázó odarepül és ledobja a töltetet ---
  if(o&&o.type==='atom'){
    if(navMove(u,o.x,o.y,dt)<26){
      atomStrike(o.x,o.y,u.owner);
      u.atomLoad=false; u.order=null;
    }
    return;
  }
  // --- Gyűjtés ---
  if(o&&o.type==='gather'){
    let n=o.target;
    if(!n||n.dead){ n=nearestNode(u.x,u.y,o.res); o.target=n;
      if(!n){u.order=null;} }
    if(n){
      if(u.carry>=(UNITS[u.role].carry||12)*upgMul2(u.owner,'storage',0.2)){   // tele a puttony
        const drop=nearestDrop(u);
        if(drop){
          const dp=u.naval?dockOf(drop):drop;
          const thr=u.naval?(u.r+34):(Math.max(drop.w,drop.h)*0.5+u.r+14);
          if(navMove(u,dp.x,dp.y,dt)<thr){
            const store=(typeof resOf==='function')?resOf(u.owner):(u.owner?G.ai.res:G.res);
            const got=Math.round(u.carry);
            const res=(u.carryType==='fish')?'food':u.carryType;   // a hal élelem
            store[res]+=got;
            if(!u.owner) G.earned[res]=(G.earned[res]||0)+got;
            u.carry=0;
          }
        }else{
          // Nincs hova lerakni: a munkás megtartja a rakományt, nem tűnik el
          u.order=null;
          if(u.owner===0&&G.t-G.noDropWarn>12){
            G.noDropWarn=G.t;
            toast(T('uzNincsLerakni'));
          }
        }
      }else{
        if(navMove(u,n.x,n.y,dt)<n.r+10){
          /* Az ÉVSZAK is számít: fagyott földből nehezebb kitermelni. */
          const evszakM=(typeof evszakTermeles==='function')?evszakTermeles():1;
          /* A NEMZETI ELŐNY gyűjtésre vonatkozó része.

             Ez eddig KIMARADT a képletből: a `BONUS[...].gather` sehol
             nem szerepelt, csak a doktrínáé (`doctMul`). Négy nemzet
             előnye épül rá — Kína, India, Mali és Stede Bonnet —, és
             mind a négyé hatástalan volt.

             A hibát az egyensúlypróba fogta meg: négy különböző nemzet
             gazdasága BETŰRE azonos számokat adott, ami csak akkor
             lehetséges, ha a nemzet nem számít. */
          const bn=(typeof bonusOf==='function')?bonusOf(u.owner):null;
          const nemzetM=(bn&&bn.gather)?bn.gather(n.type):1;
          const rate=val(UNITS[u.role].gather||UNITS.worker.gather,u.age)*(u.gatherMul||1)
                     *doctMul(u.owner,'gather',n.type)*upgMul(u.owner,'yield')
                     *nemzetM*evszakM*dt*PACE.gather;
          const got=Math.min(rate,n.amount);
          n.amount-=got; u.carry+=got; u.carryType=n.type; u.lastRes=n.type;
          if(n.amount<=0){n.dead=true;o.target=null;}
        }
      }
    }
    return;
  }

  // --- Javítás ---
  if(o&&o.type==='repair'){
    const b=o.target;
    if(!b||b.dead||(b.done&&b.hp>=b.maxHp-0.5)){
      const nx=nextBuildSite(u);
      if(nx){                                  // van a közelben félkész épület
        u.order={type:'repair',target:nx};
        if(u.owner===0&&G.t-chainMsgT>6){
          chainMsgT=G.t;
          toast(T('uzKovEpitkezes'));
        }
        return;
      }
      // Nincs több építenivaló: visszatér oda, ahol utoljára gyűjtött
      if(u.lastRes){
        const n=nearestNode(u.x,u.y,u.lastRes);
        if(n){ u.order={type:'gather',res:n.type,target:n}; return; }
      }
      u.order=null; return;
    }
    if(navMove(u,b.x,b.y,dt)<Math.max(b.w,b.h)*0.5+u.r+16){
      if(!b.done){
        b.started=true;                          // innentől áll az állvány
        b.prog=Math.min(1,b.prog+dt/(b.buildTime||10));   // egy munkás = névleges ütem
      }
      else b.hp=Math.min(b.maxHp,b.hp+b.maxHp*0.014*dt);                  // ~70 mp egy teljes felújítás
    }
    return;
  }

  if(u.trader&&typeof traderTick==='function'&&traderTick(u,dt)) return;  // kereskedőhajó
  if(typeof spyTick==='function') spyTick(u,dt);           // álca és lelepleződés
  // Mozog-e? A lépésszámláló változásából derül ki — ugyanabból, amiből
  // a rajzolás is tudja, hogy járó vagy álló képet mutasson.
  const megy=(u.walk!==u._pw); u._pw=u.walk;
  if(megy){
    if(typeof wearMark==='function') wearMark(u,dt);       // nyom a földben
    if(typeof dustTick==='function') dustTick(u,dt);       // porfelhő
  }

  // --- Gyújtogatás: a kém odamegy, és felgyújtja az épületet ---
  if(u.order&&u.order.type==='arson'){
    const b=u.order.target;
    if(!b||b.dead){ u.order=null; }
    else{
      const d=dist(u.x,u.y,b.x,b.y);
      if(d>Math.max(b.w,b.h)*0.5+22){ navMove(u,b.x,b.y,dt); return; }
      unmask(u,'A kémed lelepleződött a gyújtogatással.');
      setFire(b,u);
      u.order=null;
      return;
    }
  }
  if(typeof terrainTick==='function') terrainTick(u,dt);   // a terep hatása
  if(typeof moraleTick==='function') moraleTick(u,dt);     // morál

  // --- Megfutamodás: a megingott egység kivonja magát a harcból ---
  if(typeof isRouting==='function'&&isRouting(u)){
    u.target=null;
    if(fleeMove(u,dt)) return;
  }

  // --- Tábori sebész: gyógyítás menet közben is ---
  if(u.role==='medic'&&typeof updateMedic==='function'){
    const dolgozik=updateMedic(u,dt);
    if(dolgozik&&!u.order) return;      // saját parancs nélkül a sebesültnél marad
  }

  // --- Beszállás a csapatszállítóra ---
  if(o&&o.type==='board'){
    const h=o.target;
    if(!h||h.dead||!(h.transport||h.sTower)){ u.order=null; }
    else{
      const d=dist(u.x,u.y,h.x,h.y);
      if(d<h.r+u.r+16){ boardShip(u,h); return; }
      const p=partiPont(h,u.x,u.y);
      navMove(u,p?p.x:h.x,p?p.y:h.y,dt);
      return;
    }
  }

  // --- Menekülés: a Visszavonulás állásban a sebesült elhátrál ---
  if(typeof shouldFlee==='function'&&shouldFlee(u)){
    u.target=null;
    if(fleeMove(u,dt)) return;
  }

  // --- Célpont keresése (támadás / járőrözés) ---
  if(u.target&&u.target.dead) u.target=null;
  if(!u.target&&u.role!=='worker'){
    // Tartsd a vonalat: csak arra lő, ami a hatótávjába ér — nem indul el érte
    const tartsd=(u.stance==='hold');
    const rad=tartsd ? u.range+6 : ((o&&o.type==='move')?0:Math.max(u.range+45,120));
    if(rad>0) u.target=nearestEnemy(u.x,u.y,u.owner,rad,u);
  }
  if(o&&o.type==='attack'){
    if(o.target&&!o.target.dead) u.target=o.target; else u.order=null;
  }

  // --- Harc ---
  if(u.target){
    // Kalózmódban a megtört ellenséges hajót nem lőjük tovább: átszállunk rá
    if(typeof boardable==='function'&&boardable(u,u.target)){
      if(tryBoardEnemy(u,u.target,dt)) u.target=null;
      return;
    }
    // Épületnél a fél átmérőn felül az egység sugarát is hozzáadjuk, különben a
    // falnak ütköző közelharcos sosem érné el a célt.
    const t=u.target;
    /* MAGASLAT: a dombon álló lövész messzebb küldi a nyilat, mert
       lefelé lő. Csak a lövészre hat érdemben — a kardnak mindegy, hol
       áll. Ezért a szorzó a TÁMADÓ helyétől függ, és csak akkor, ha van
       mit nyújtani (a közelharc hatótávja úgyis pár pixel). */
    const magasM=(u.range>40&&typeof terepLotav==='function')?terepLotav(u.x,u.y):1;
    const reach=u.range*magasM+(t.kind==='build'?Math.max(t.w,t.h)*0.5+u.r*0.9:t.r);
    const d=dist(u.x,u.y,t.x,t.y);
    if(d<=reach){
      u.face=datan2(t.y-u.y,t.x-u.x);
      if(u.cd<=0){
        if(hasCoal(u)){ attack(u,t); u.cd=u.atk; }
        else u.cd=0.6;                       // szén nélkül csak vár
      }
    }else{
      /* Üldözés pórázon. Menetparancsnál a katona nem futhat korlátlanul az
         ellenség után: ha a kijelölt céltól messzebb sodródna, elengedi és
         folytatja az útját. Kifejezett támadásparancsnál (jobb klikk az
         ellenségre) nincs korlát — ott ez a szándék. */
      let uldozhet;
      if(u.stance==='hold') uldozhet=false;      // a helyén marad, csak lő
      else if(o&&o.type==='attack') uldozhet=true;
      else if(o&&o.type==='amove'&&o.x!==undefined){
        const LESZ=300;                          // ennyire távolodhat a céljától
        uldozhet=(dist(u.x,u.y,o.x,o.y)<LESZ);
      }else uldozhet=(d<Math.max(u.range+240,320));
      if(uldozhet) navMove(u,t.x,t.y,dt);
      else { u.target=null; return; }            // elengedi, és megy tovább
    }
    return;
  }

  // --- Mozgás ---
  if(o&&(o.type==='move'||o.type==='amove')){
    if(navMove(u,o.x,o.y,dt)<6) u.order=null;
  }
}

/* =======================================================================
   9/B. CSAPATSZÁLLÍTÁS

   A szárazföldi egységek nem tudnak vízre lépni, a hajók nem tudnak
   partra menni. A csapatszállító a kettő között teremt kapcsolatot:

     BESZÁLLÁS  — jelöld ki a katonákat, és kattints jobb gombbal a
                  saját csapatszállítódra. Odagyalogolnak a partra, és
                  felszállnak. A fedélzeten lévők nem sebezhetők.
     KIRAKODÁS  — jelöld ki a hajót, és kattints jobb gombbal a partra.
                  Odahajózik, és kirakja a katonákat.

   A fedélzeten lévő egységek nincsenek a pályán: a hajó `cargo` tömbjében
   utaznak, és kiszálláskor kerülnek vissza.
   ===================================================================== */

// Van-e hely a hajón?
/* Hány fő fér rá? A hajónál az akadémia bővíti, az ostromtoronynál rögzített. */
function jarmuCap(j){
  if(j.sTower) return UNITS.siegetower.carry||6;
  return cargoCap(j.owner);
}
function ferHely(hajo){
  return ((hajo.cargo&&hajo.cargo.length)||0) < jarmuCap(hajo);
}
// A hajó melletti legközelebbi SZÁRAZ pont, ahonnan be lehet szállni
function partiPont(hajo,ux,uy){
  // Az ostromtorony a szárazföldön áll: hozzá közvetlenül lehet menni
  if(hajo.sTower) return {x:hajo.x, y:hajo.y};
  let best=null, bd=1e9;
  for(let r=30;r<=150;r+=14){
    for(let i=0;i<16;i++){
      const a=i*TAU/16;
      const x=hajo.x+dcos(a)*r, y=hajo.y+dsin(a)*r;
      if(!onLand(x,y)) continue;
      const d=(x-ux)**2+(y-uy)**2;
      if(d<bd){ bd=d; best={x,y}; }
    }
    if(best) return best;
  }
  return null;
}
// Beszállás parancs: a kijelölt szárazföldi egységek a hajóhoz indulnak
function boardCommand(hajo,egysegek){
  let n=0;
  for(const u of egysegek){
    if(u.dead||u.naval||u.air||u.owner!==hajo.owner) continue;
    if(u===hajo||u.sTower||u.transport) continue;      // jármű nem száll járműbe
    u.target=null;
    u.order={type:'board', target:hajo};
    n++;
  }
  if(n){
    const fer=jarmuCap(hajo)-((hajo.cargo&&hajo.cargo.length)||0);
    toast(n+' egység beszállásra indult. Szabad hely: '+fer);
    SFX.play('move',0.8);
  }
  return n;
}
// Egy egység felszáll a hajóra
function boardShip(u,hajo){
  hajo.cargo=hajo.cargo||[];
  if(!ferHely(hajo)){
    if(u.owner===0) toast(T('uzHajoMegtelt'));
    u.order=null; return false;
  }
  hajo.cargo.push(u);
  u.dead=true;                       // lekerül a pályáról, de nem pusztul el
  u.aboard=true; u.order=null; u.target=null;
  if(u.owner===0) SFX.at('place',hajo.x,hajo.y,0.4);
  return true;
}
// Kirakodás a megadott part közelébe
function unloadShip(hajo,cx,cy){
  if(!hajo.cargo||!hajo.cargo.length) return 0;
  let n=0;
  for(let i=hajo.cargo.length-1;i>=0;i--){
    const u=hajo.cargo[i];
    // Egyre tágabb körben keresünk szabad partot. Ha a közvetlen környék
    // tele van, távolabb rakjuk ki — de nem hagyjuk a hajón.
    let p=null;
    for(const r of [26+n*4, 50+n*4, 80+n*4, 120]){
      p=freeSpot(cx,cy,r,u.r||10);
      if(p) break;
    }
    if(!p&&onLand(cx,cy)) p={x:cx,y:cy};
    if(!p) break;
    u.x=p.x; u.y=p.y;
    u.dead=false; u.aboard=false; u.hp=Math.max(1,u.hp);
    u.order=null; u.target=null; u.cd=0.3;
    G.units.push(u);
    hajo.cargo.splice(i,1);
    n++;
  }
  if(n&&hajo.owner===0){ toast(n+' egység partra szállt.'); SFX.play('ready',0.8); }
  return n;
}
/* --- A LEGÉNYSÉG PARTRA SZÁLLÁSA ---

   Amelyik hajónak van legénysége, az partra tud tenni belőle néhány
   embert. A kitett katona VALÓDI egység: harcol, meghalhat, és a hajó
   legénysége csökken tőle — tehát az átszállásban gyengébb lesz.

   A legénység nem fogyhat el teljesen: hajót vezetni is kell valakinek.  */
const PARTRA_MAX = 4;              // hajónként ennyi katona egyszerre
const PARTRA_KOLTSEG = 18;         // ennyi fő legénység egy katonáért
const PARTRA_MARAD = 20;           // ennyi legénység mindenképp a fedélzeten marad

function legenysegPartra(hajo, cx, cy){
  if(!hajo || hajo.dead || !hajo.naval) return 0;
  if(hajo.transport || hajo.sTower) return 0;      // azoknak van cargo-juk
  const van = (hajo.crew || 0) - PARTRA_MARAD;
  if(van < PARTRA_KOLTSEG) return 0;               // ennyiből nem telik

  const db = Math.max(1, Math.min(PARTRA_MAX, Math.floor(van / PARTRA_KOLTSEG)));
  let n = 0;
  for(let i = 0; i < db; i++){
    let p = null;
    for(const r of [26 + n * 4, 50 + n * 4, 80 + n * 4, 120]){
      p = freeSpot(cx, cy, r, 10);
      if(p) break;
    }
    if(!p && onLand(cx, cy)) p = { x: cx, y: cy };
    if(!p) break;
    /* A matróz közelharci egység — nem a hajó korából, hanem a
       tulajdonos koráról, mint minden más kiképzett katona. */
    const kor = (typeof korOf === 'function') ? korOf(hajo.owner) : (hajo.age | 0);
    const u = makeUnit('melee', hajo.owner, p.x, p.y, kor);
    u.cd = 0.3;
    G.units.push(u);
    hajo.crew = Math.max(PARTRA_MARAD, (hajo.crew || 0) - PARTRA_KOLTSEG);
    /* PARTRASZÁLLÁS LÁTVÁNYA: vízfröccsenés a parton, ahol a legény
       kilép a csónakból. Minden egységnél egy kis splash-effekt. */
    if(G.fx) G.fx.push({x:p.x,y:p.y,t:0,life:0.7,type:'partra',r:7});
    n++;
  }
  if(n){
    /* Nagyobb splash a hajó és a part között — a csónak útja. */
    if(G.fx){
      const kx=hajo.x+(cx-hajo.x)*0.45, ky=hajo.y+(cy-hajo.y)*0.45;
      G.fx.push({x:kx,y:ky,t:0,life:1.0,type:'partra',r:12});
    }
    if(hajo.owner === ((typeof helyiFel === 'function') ? helyiFel() : 0)){
      toast(n + ' ' + T('uzLegenysegPartra'));
      SFX.play('ready', 0.8);
    }
  }
  return n;
}

// A hajó frissítése: beszállítás közeliekkel, kirakodás a parton
function updateTransport(hajo,dt){
  const o=hajo.order;
  if(!o||o.type!=='unload') return;
  const d=dist(hajo.x,hajo.y,o.x,o.y);
  if(d>70){ moveTo(hajo,o.x,o.y,dt); return; }
  // elég közel: a legközelebbi szárazföldre rakjuk ki
  const p=partiPont(hajo,o.x,o.y)||{x:o.x,y:o.y};
  unloadShip(hajo,p.x,p.y);
  hajo.order=null;
}

/* =======================================================================
   ÁTSZÁLLÁS ÉS HAJÓELFOGLALÁS  (csak a Kalózhadjáratban)

   A kalózok nem süllyesztik el a zsákmányt, ha megszerezhetik. Ha egy
   ellenséges hajó életereje 40% alá esik, a melléje húzódó saját hajóddal
   át lehet szállni rá: a legénység átcsap, és a hajó a tiéd lesz.

   Elsüllyeszteni továbbra is lehet — az ágyú mindig működik.
   ===================================================================== */
/* ÁTSZÁLLÁS — legénységi harc

   Egy hajót nem a teste ad meg, hanem az emberei. Az összekapaszkodás után
   a két legénység egymásnak esik: mindkét oldal annyit veszít, amennyien a
   másikon vannak. Ha a védő legénysége elfogy, a hajó gazdát cserél, és a
   támadó emberei átszállnak rá.

   Ezért érdemes előbb sortűzzel ritkítani a fedélzetet: minden találat
   embert is öl. Egy ép gálya (340 fő) egy szlúpnak (70 fő) esélytelen
   falat jelent — de szétlőve már elvehető.

   Létszám és ágyú osztályonként:
     SZLÚP  ·  70 fő ·  8–12 ágyú
     BRIGG  · 120 fő · 14–20 ágyú
     GÁLYA  · 340 fő · 40–60 ágyú                                        */
const BOARD_HP=0.75;       // ennyire kell megtörni, hogy át lehessen szállni
const BOARD_RATE=0.42;     // a harc gyorsasága: a másik létszámának ekkora hányada másodpercenként
function pirateMode(){ return !!G.pirate; }
function boardable(tamado,cel){
  if(!pirateMode()) return false;
  if(!tamado||!cel||tamado.dead||cel.dead) return false;
  if(!tamado.naval||!cel.naval) return false;
  if(cel.owner===tamado.owner) return false;
  return cel.hp <= cel.maxHp*BOARD_HP;   // előbb meg kell törni a hajót
}
// Elfoglalás: a hajó gazdát cserél, a legénység rendbe hozza
function captureShip(tamado,cel){
  if(tamado.owner===0&&typeof hirnevAd==='function') hirnevAd(9);   // elfoglalt hajó
  cel.owner=tamado.owner;
  cel.hp=Math.max(cel.hp, cel.maxHp*0.5);
  /* A zsákmányra a támadó legénységének fele száll át: a másik fele marad
     a saját hajóján. Egy elfoglalt hajó tehát gyengén megszállt — vissza
     lehet venni. */
  if(tamado.crew>0){
    const at=Math.max(1,Math.round(tamado.crew*0.5));
    cel.crew=Math.min(cel.crewMax||at, at);
    tamado.crew=Math.max(1,tamado.crew-at);
  }else{
    cel.crew=Math.max(1,Math.round((cel.crewMax||20)*0.15));
  }
  cel.target=null; cel.order=null; cel.cd=1.2;
  if(cel.cargo&&cel.cargo.length){          // a rakomány is fogságba esik
    for(const u of cel.cargo) u.owner=tamado.owner;
  }
  G.fx.push({x:cel.x,y:cel.y,t:0,life:.6,type:'boom',r:22});
  if(tamado.owner===0){
    toast('Elfoglaltad: '+UNITS[cel.role].names[cel.age]+'!');
    SFX.play('ready',1);
  }else if(cel.owner===1){
    toast(T('uzHajotElfoglaltak'));
    SFX.play('deny',1);
  }
  return true;
}
// Az átszállás megkísérlése: elég közel kell húzódni
function tryBoardEnemy(tamado,cel,dt){
  const d=dist(tamado.x,tamado.y,cel.x,cel.y);
  const kell=tamado.r+cel.r+10;
  if(d>kell){ moveTo(tamado,cel.x,cel.y,dt); return false; }

  /* Összekapaszkodtak: a két legénység egymásnak esik. Mindkét oldal annyit
     veszít másodpercenként, amennyien a MÁSIKON vannak — tehát a nagyobb
     létszám gyorsan felőrli a kisebbet. */
  /* Csak akkor töltjük fel, ha a mező HIÁNYZIK (régi mentés) — nullánál
     nem! Korábban a `!tamado.crew` a nullára is igaz volt, ezért az
     elfogyott legénység minden ütemben újratöltődött, és egy hetvenfős
     szlúp elvitt egy háromszáznegyvenes gályát. */
  if(tamado.crew===undefined&&tamado.crewMax) tamado.crew=tamado.crewMax;
  const tCrew=tamado.crew||0, vCrew=cel.crew||0;
  if(vCrew<=0) return captureShip(tamado,cel);       // üres fedélzet: azonnal a miénk
  if(tCrew<=0){                                       // a támadó fogyott el
    tamado.order=null; tamado.target=null;
    if(tamado.owner===0) toast(T('uzLegenysegFogyott'));
    return false;
  }
  const veszitVedo =tCrew*BOARD_RATE*dt*(0.85+srnd()*0.3);
  const veszitTamado=vCrew*BOARD_RATE*dt*(0.85+srnd()*0.3);
  cel.crew=Math.max(0, vCrew-veszitVedo);
  tamado.crew=Math.max(0, tCrew-veszitTamado);
  tamado.boarding=G.t; cel.boarding=G.t;              // a rajzolás ebből tudja
  // kardcsattogás a két hajó között
  /* LÁTVÁNY: a szimulációs magból húzni itt is szétcsúszást okoz, mert a
     takarékos módban játszó gép kevesebbet húz. (Ugyanaz a hiba, mint az
     ostromfüstnél — érdemes volt az egészet végigkeresni.) */
  if(!REDUCED&&Math.random()<dt*14)
    G.fx.push({x:(tamado.x+cel.x)/2+rnd(-10,10), y:(tamado.y+cel.y)/2+rnd(-8,8),
               t:0, life:.22, type:'hit'});
  if(cel.crew<=0) return captureShip(tamado,cel);
  return false;
}

/* =======================================================================
   9/C. GYÓGYÍTÁS

   Kétféle van belőle:

     KÓRHÁZ   — a köré gyűlt saját egységeket lassan, egyszerre gyógyítja
                egy kis körben. Nem kell parancsot adni: aki odaáll,
                gyógyul.
     SEBÉSZ   — a fronton dolgozik: mindig a hozzá legközelebbi sebesültet
                keresi meg, odamegy, és talpra állítja. Ha ketten dolgoznak
                ugyanazon, a gyógyulás összeadódik — mindketten a saját
                ütemükkel adnak életerőt.

   A gyógyulás nem kelt életre halottat, és nem lép a maximum fölé.
   ===================================================================== */

// A gyógyítás gyorsaságát az akadémiai Gyógyszerkészlet emeli
function healMul(owner){
  return (typeof upgMul==='function') ? upgMul(owner,'medicine') : 1;
}

/* A kórház aurája: minden frissítéskor a körben lévő saját, sérült
   egységeknek ad egy keveset. */
function hospitalAura(b,dt){
  const d=BUILDS[b.type];
  if(!d||!d.heal||!b.done||b.dead) return;
  const R=d.healR||150, ero=val(d.heal,b.age)*healMul(b.owner)*dt;
  const R2=R*R;
  for(const u of G.units){
    if(u.dead||u.owner!==b.owner||u.hp>=u.maxHp) continue;
    const dx=u.x-b.x, dy=u.y-b.y;
    if(dx*dx+dy*dy>R2) continue;
    u.hp=Math.min(u.maxHp, u.hp + u.maxHp*0.01*ero);
    u.healedAt=G.t;                     // a rajzolás ebből tudja, hogy gyógyul
  }
}

/* A sebész munkája. Ha kapott parancsot, azt teljesíti; egyébként magától
   keresi a legközelebbi sebesültet. */
function updateMedic(u,dt){
  // parancsra mozgás: azt a főciklus intézi, mi csak gyógyítunk közben
  let cel=null, bd=1e9;
  const R=u.range||60, keres=R+220;
  for(const t of G.units){
    if(t.dead||t.owner!==u.owner||t===u) continue;
    if(t.hp>=t.maxHp-0.5) continue;
    const d=dist(u.x,u.y,t.x,t.y);
    if(d>keres) continue;
    // a súlyosabb sebesült előbbre való: a hiányzó életerő arányában
    const suly=d*(0.4+0.6*(t.hp/t.maxHp));
    if(suly<bd){ bd=suly; cel=t; }
  }
  u.healTarget=cel;
  if(!cel) return false;
  const d=dist(u.x,u.y,cel.x,cel.y);
  if(d>R){
    if(!u.order) navMove(u,cel.x,cel.y,dt);   // csak ha nincs saját parancsa
    return true;
  }
  u.face=Math.atan2(cel.y-u.y,cel.x-u.x);
  const ero=val(UNITS.medic.heal,u.age)*healMul(u.owner)*dt;
  cel.hp=Math.min(cel.maxHp, cel.hp+ero);
  cel.healedAt=G.t;
  u.healing=G.t;
  return true;
}

/* =======================================================================
   9/D. A TEREP HATÁSA

   A tájtípusok eddig csak látványban különböztek. Mostantól számítanak is:

     ERDŐ    — fák között +2 páncél. A fedezék véd a nyilaktól és a
               golyóktól, ezért az erdőn átvezető támadás olcsóbb.
     HEGY    — sziklás magaslaton +15% lőtáv. Aki elfoglalja a dombot,
               messzebbre lát és messzebbre lő.
     PART    — a sekély vízparti homokban 20%-kal lassabb a menet.
               Partraszálláskor a védőnek van előnye.

   A hatásokat félmásodpercenként számoljuk újra, nem képkockánként —
   a terep úgysem változik gyorsabban.
   ===================================================================== */

const TERR_ERDO_R=88;        // ennyire kell egy fához, hogy fedezéket adjon
const TERR_FRISS=0.5;        // ennyi másodpercenként számoljuk újra

function terrainAt(u){
  const ki={armor:0, range:1, speed:1, nev:null};
  // hegy: sziklacellán vagy közvetlenül mellette
  if(typeof isRock==='function'){
    const c=FOG_CELL;
    const cx=Math.floor(u.x/c), cy=Math.floor(u.y/c);
    let szikla=false;
    for(let dy=-1;dy<=1&&!szikla;dy++) for(let dx=-1;dx<=1;dx++){
      const nx=cx+dx, ny=cy+dy;
      if(nx<0||ny<0||nx>=FW||ny>=FH) continue;
      if(G.rock&&G.rock[ny*FW+nx]){ szikla=true; break; }
    }
    if(szikla){ ki.range=1.15; ki.nev='magaslat'; }
  }
  // erdő: van-e fa a közelben
  let fa=0;
  for(const n of G.nodes){
    if(n.dead||n.type!=='wood') continue;
    const dx=n.x-u.x, dy=n.y-u.y;
    if(dx*dx+dy*dy<TERR_ERDO_R*TERR_ERDO_R){ fa++; if(fa>=2) break; }
  }
  if(fa>=2){ ki.armor=2; ki.nev=ki.nev?'erdős magaslat':'erdő'; }
  // part: víz a közvetlen szomszédban
  if(typeof isWater==='function'&&!u.naval&&!u.air){
    let viz=false;
    for(let i=0;i<4&&!viz;i++){
      const a=i*TAU/4;
      if(isWater(u.x+dcos(a)*26,u.y+dsin(a)*26)) viz=true;
    }
    if(viz){ ki.speed=0.8; ki.nev=ki.nev||'part'; }
  }
  return ki;
}

/* Az egység terephatásainak frissítése. Az alapértékeket a `base*` mezők
   őrzik, hogy a hatás ne halmozódjon fel újraszámoláskor. */
function terrainTick(u,dt){
  if(u.air||u.kind!=='unit') return;
  u.terrT=(u.terrT||0)-dt;
  if(u.terrT>0) return;
  u.terrT=TERR_FRISS;
  if(u.baseArmor===undefined){ u.baseArmor=u.armor; u.baseRange=u.range; u.baseSpeed=u.speed; }
  const t=terrainAt(u);
  // A terep és az alakzat hatása egyszerre érvényesül
  const fA=(typeof formMul==='function')?formMul(u,'armor'):0;
  const fR=(typeof formMul==='function')?formMul(u,'range'):1;
  const fS=(typeof formMul==='function')?formMul(u,'speed'):1;
  u.armor=u.baseArmor+t.armor+fA;
  u.range=u.baseRange*t.range*fR;
  /* A HAJÓK a tengeri időt érzik, nem a szárazföldit: szélcsendben feleannyi
     sebességgel járnak, viharban is lassabban. */
  const idoSzorzo=u.naval
    ? ((typeof seaSpeedMul==='function')?seaSpeedMul():1)
      * ((typeof sailMul==='function')?sailMul(u):1)   // a széttépett vitorla lassít
    : ((typeof weatherSpeed==='function')?weatherSpeed():1);
  u.speed=u.baseSpeed*t.speed*fS*idoSzorzo;
  u.terrain=t.nev;
}

/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   9/E. HŐSÖK ÉS MORÁL

   HŐS
     Nemzetenként egyetlen példány, mindig a korszak uralkodójának nevében:
     Hunyadi Mátyás, Sobieski, Fekete Szakáll. Erős harcos, de az igazi
     súlya az AURÁJA: a körülötte harcolók nagyobbat ütnek, több páncélt
     viselnek, és nem futamodnak meg.

     Ha elesik, a kórházban visszahívható — a hőst nem lehet végleg
     elveszíteni, csak drágán pótolni.

   MORÁL
     Egy csapat nem harcol az utolsó emberig. Ha a közelben kétszeres
     túlerő van, és az egység már megsérült, megfutamodik: hat másodpercre
     kivonja magát a harcból, majd összeszedi magát.

     A hős aurája és a saját bázis közelsége megtartja őket.
   ===================================================================== */

const MORALE_R=230;          // ekkora körben nézzük az erőviszonyt
const MORALE_ARANY=2.0;      // ennyiszeres túlerőnél inog meg a sor
const MORALE_HP=0.5;         // és csak ha az életereje ez alá esett
const MORALE_IDO=6;          // ennyi ideig fut
const MORALE_FRISS=1.0;      // ennyi másodpercenként vizsgáljuk

// A nemzet hősének neve a korszak uralkodója
function heroName(owner,age){
  const nk=nationOf(owner), n=NATIONS[nk];
  if(!n||!n.rulers) return 'Hős';
  return uralkodoNev(nation,Math.min(3,age||0));
}
// Él-e már hős ezen az oldalon?
function heroAlive(owner){
  for(const u of G.units) if(!u.dead&&u.hero&&u.owner===owner) return u;
  return null;
}

/* A hős aurája. Nem az alapértékeket írja át, hanem külön mezőkbe gyűjti,
   így nem ütközik a terep hatásával, és nem halmozódik fel. */
function heroAura(dt){
  // minden képkockán nullázzuk, majd a hősök újratöltik
  for(const u of G.units){ u.auraDmg=0; u.auraArmor=0; u.auraHero=false; }
  for(const h of G.units){
    if(h.dead||!h.hero) continue;
    const d=UNITS.hero, R=d.auraR||170, R2=R*R;
    for(const u of G.units){
      if(u.dead||u.owner!==h.owner) continue;
      const dx=u.x-h.x, dy=u.y-h.y;
      if(dx*dx+dy*dy>R2) continue;
      u.auraDmg=Math.max(u.auraDmg||0, d.auraDmg||0.15);
      u.auraArmor=Math.max(u.auraArmor||0, d.auraArmor||1);
      u.auraHero=true;                       // a hős mellől nem futnak el
    }
  }
}

/* A hős visszahívása a kórházban. Csak akkor, ha nincs élő hősöd. */
function reviveHero(){
  if(heroAlive(ENID)){ toast(T('uzHosEl')); SFX.play('deny'); return; }
  const k=G.builds.filter(b=>!b.dead&&b.owner===ENID&&b.type==='hospital'&&b.done)[0];
  if(!k){ toast(T('uzKorhazKell')); SFX.play('deny'); return; }
  const c=unitCost('hero',G.age,ENID);
  scaleCost(c,0.6);                          // a visszahívás olcsóbb az elsőnél
  if(!canPay(c)){ toast(T('uzVisszahivashoz')+': '+costText(c)); SFX.play('deny'); return; }
  pay(c);
  const p=freeSpot(k.x,k.y+70,44,12)||{x:k.x,y:k.y+70};
  const h=makeUnit('hero',0,p.x,p.y,G.age);
  h.hp=h.maxHp*0.7;
  G.units.push(h);
  toast(heroName(0,G.age)+' '+T('uzHosVisszatert'));
  SFX.at('ready',h.x,h.y,1);
  G.fx.push({x:h.x,y:h.y,t:0,life:0.9,type:'boom',r:26});
  syncUI();
}

/* --- MORÁL --- */
function moraleTick(u,dt){
  if(u.dead||u.kind!=='unit') return;
  if(u.role==='worker'||u.hero||u.naval||u.air||u.siege) return;
  // a megfutamodás lejárta
  if(u.rout&&G.t>u.rout){ u.rout=0; u.stanceBefore=undefined; }
  u.moraleT=(u.moraleT||0)-dt;
  if(u.moraleT>0) return;
  u.moraleT=MORALE_FRISS;
  if(u.rout) return;
  if(u.hp>=u.maxHp*MORALE_HP) return;        // ép egység nem inog meg
  if(u.auraHero) return;                     // a hős mellől nem futnak el
  // a saját bázis közelében kitartanak
  for(const b of G.builds){
    if(b.dead||b.owner!==u.owner||b.type!=='hq') continue;
    if(dist(u.x,u.y,b.x,b.y)<300) return;
  }
  let sajat=0, ellen=0;
  const R2=MORALE_R*MORALE_R;
  for(const t of G.units){
    if(t.dead||t.role==='worker') continue;
    const dx=t.x-u.x, dy=t.y-u.y;
    if(dx*dx+dy*dy>R2) continue;
    if(t.owner===u.owner) sajat++; else ellen++;
  }
  if(sajat<1) sajat=1;
  if(ellen>=sajat*MORALE_ARANY){
    u.rout=G.t+MORALE_IDO;
    u.target=null; u.order=null;
    if(u.owner===helyiFel()&&Math.random()<0.35)
      toast(UNITS[u.role].names[u.age]+' megfutamodott!');
  }
}
// Menekül-e most? (a Visszavonulás állás mellett a morál is számít)
function isRouting(u){ return !!(u.rout&&G.t<u.rout); }


/* =======================================================================
   A HŐS AKTÍV KÉPESSÉGE — CSATAKIÁLTÁS

   Az aura eddig passzív volt: a hős jelenléte magától adott bátorságot.
   Ez rendben van, de nem KÉRDEZ semmit a játékostól — nincs benne döntés.

   A csatakiáltás igen: nyolc másodpercre megnöveli a közeli saját
   egységek sebzését és sebességét, és felold minden futást. Utána másfél
   perc várakozás. Egy csatában egyszer, legfeljebb kétszer sülhet el —
   tehát számít, MIKOR nyomod meg.

   Miért ez, és nem roham vagy gyógyítás? Mert ez az, ami minden
   korszakban értelmes: a vezér kiált, a sor megindul. A gyógyítás a
   felcseré, a roham a lovasságé — azoknak megvan a maguk egysége.

   HÁLÓZATON parancsként fut, mint minden más, ami a szimulációt érinti.
   ===================================================================== */
const KIALTAS_HATOTAV = 240;      // ekkora körben hat
const KIALTAS_HOSSZ   = 8;        // ennyi másodpercig tart
const KIALTAS_VARAKOZAS = 90;     // és ennyi ideig nem ismételhető
const KIALTAS_SEBZES  = 0.35;     // +35% sebzés
const KIALTAS_SEBESSEG = 0.25;    // +25% sebesség

/* A hős keresése egy félhez. */
function hosOf(owner){
  for(const u of G.units) if(!u.dead && u.owner === owner && u.role === 'hero') return u;
  return null;
}
/* Mennyi ideig kell még várni? A felület ebből rajzolja a visszaszámlálót. */
function kialtasVaro(owner){
  const h = hosOf(owner);
  if(!h) return -1;                          // nincs hős
  return Math.max(0, (h.kialtasT || 0));
}
function kialtasKesz(owner){
  const h = hosOf(owner);
  return !!h && (h.kialtasT || 0) <= 0;
}

/* A JÁTÉKOS oldala: parancsba teszi, ha hálózaton vagyunk. */
function kialtas(){
  if(typeof logAdd === 'function' && logAdd('kialtas')) return;
  kialtasVegrehajt(ENID);
}
/* A TÉNYLEGES hatás. Ez fut le minden gépen, ugyanannál a lépésnél. */
function kialtasVegrehajt(fel){
  const h = hosOf(fel);
  if(!h || (h.kialtasT || 0) > 0) return;
  h.kialtasT = KIALTAS_VARAKOZAS;
  h.kialtasEl = KIALTAS_HOSSZ;               // eddig tart a hatás

  /* A hatás a kiáltás PILLANATÁBAN közel állókra érvényes — aki később
     fut oda, az lemaradt róla. Így a helyezkedés is számít. */
  const R2 = KIALTAS_HATOTAV * KIALTAS_HATOTAV;
  let db = 0;
  for(const u of G.units){
    if(u.dead || u.owner !== fel || u.role === 'worker') continue;
    const dx = u.x - h.x, dy = u.y - h.y;
    if(dx * dx + dy * dy > R2) continue;
    u.kialtasEl = KIALTAS_HOSSZ;
    u.rout = 0;                              // aki futott, megáll
    db++;
  }
  if(fel === (typeof helyiFel === 'function' ? helyiFel() : 0)){
    toast(T('uzKialtas') + (db ? (' — ' + db + ' ' + T('uzKialtasDb')) : ''));
    if(typeof helyHang === 'function') helyHang('alert', h.x, h.y, 0.9);
  }
  if(typeof G.fx !== 'undefined')
    G.fx.push({ x: h.x, y: h.y, t: 0, life: 0.9, type: 'boom', r: 30 });
}
if(typeof parancsRegiszter === 'function') parancsRegiszter('kialtas', kialtasVegrehajt);

/* Az idő múlása. A hősé és az érintett egységeké külön jár le. */
function kialtasTick(dt){
  for(const u of G.units){
    if(u.dead) continue;
    if(u.kialtasT > 0) u.kialtasT = Math.max(0, u.kialtasT - dt);
    if(u.kialtasEl > 0) u.kialtasEl = Math.max(0, u.kialtasEl - dt);
  }
}
/* A szorzók, amiket a harc és a mozgás kérdez. */
function kialtasSebzes(u){ return (u && u.kialtasEl > 0) ? 1 + KIALTAS_SEBZES : 1; }
function kialtasSebesseg(u){ return (u && u.kialtasEl > 0) ? 1 + KIALTAS_SEBESSEG : 1; }

/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   9/F. KÉMKEDÉS

   A felderítő álruhát ölthet: az ellenség színeit viseli, és nem lövik.
   Így be lehet sétálni az idegen földre, látni, mit épít — és fel lehet
   gyújtani a raktárát.

   A leleplezés két úton jöhet:
     - túl közel mégy (60 pixeren belül bárki felismer)
     - te magad támadsz vagy gyújtogatsz

   A gyújtogatás lassú tüzet rak az épületre, ami tizenkét másodpercig ég.
   Az ára: az álca leesik, és a felderítő nem harcol.
   ===================================================================== */

const SPY_FELISMER=60;         // ennyire közel bárki felismeri
const FIRE_IDO=12;             // ennyi ideig ég egy felgyújtott épület
const FIRE_DMG=0.028;          // az épület maximális életerejének ennyi töredéke másodpercenként

function canSpy(u){ return !!(u&&!u.dead&&u.isSpy&&!u.air); }

function toggleDisguise(){
  const l=G.sel.filter(canSpy);
  if(!l.length){ toast(T('uzAlcaFelderito')); SFX.play('deny'); return; }
  const be=!l[0].disguise;
  for(const u of l){
    u.disguise=be;
    u.disguiseAt=G.t;
  }
  toast(be? l.length+' '+T('uzAlcaFel')
          : T('uzAlcaLe'));
  SFX.play(be?'select':'click');
  syncUI();
}
/* Lelepleződés: ha ellenséges egység vagy torony közelébe ér. */
function spyTick(u,dt){
  if(!u.disguise) return;
  for(const t of G.units){
    if(t.dead||t.owner===u.owner) continue;
    if(dist(u.x,u.y,t.x,t.y)<SPY_FELISMER){ unmask(u,T('uzKemLelepleztek')); return; }
  }
  for(const b of G.builds){
    if(b.dead||b.owner===u.owner||!b.done) continue;
    if(!BUILDS[b.type].dmg) continue;                 // csak az őrtorony figyel
    if(dist(u.x,u.y,b.x,b.y)<SPY_FELISMER+40){ unmask(u,T('uzToronyLeleplezte')); return; }
  }
}
function unmask(u,uzenet){
  if(!u.disguise) return;
  u.disguise=false;
  u.unmaskAt=G.t;
  if(u.owner===helyiFel()){ toast(uzenet); SFX.play('deny',0.9); }
  syncUI();
}

/* --- Gyújtogatás --- */
function arsonCommand(cel){
  const l=G.sel.filter(canSpy);
  if(!l.length) return false;
  if(!cel||cel.kind!=='build'||cel.owner===ENID||cel.dead) return false;
  for(const u of l){ u.order={type:'arson',target:cel}; u.target=null; }
  toast(T('uzGyujtogatas')+': '+BUILDS[cel.type].names[cel.age]+' — '+T('uzAlcaLeesik'));
  SFX.play('select',0.9);
  return true;
}
function setFire(b,from){
  if(!b||b.dead) return;
  b.fire={t:0, hossz:FIRE_IDO, dmg:b.maxHp*FIRE_DMG};
  if(from&&from.owner===helyiFel()){
    toast(T('uzLangraKapott')+': '+BUILDS[b.type].names[b.age]+'!');
    SFX.at('boom',b.x,b.y,0.8);
  }
  G.fx.push({x:b.x,y:b.y,t:0,life:0.7,type:'boom',r:18});
}
/* A tűz terjedése és kialvása — az épületfrissítés hívja. */
function fireTick(b,dt){
  if(!b.fire) return;
  b.fire.t+=dt;
  b.hp-=b.fire.dmg*dt;
  b.hitAt=G.t;                                   // a helyőrség nem javítja, amíg ég
  if(!REDUCED&&Math.random()<dt*6)
    G.fx.push({x:b.x+rnd(-b.w*0.4,b.w*0.4), y:b.y+rnd(-b.h*0.4,b.h*0.2),
               t:0, life:0.9, type:'fust'});
  if(b.hp<=0){ b.hp=0; damage(b,1,{owner:1}); b.fire=null; return; }
  if(b.fire.t>=b.fire.hossz) b.fire=null;
}

/* =======================================================================
   09/G. TÖLTETEK

   Ugyanabból az ágyúból három félét lehet lőni. A választás a hajóhad
   egészére vonatkozik, és menet közben váltható:

     GOLYÓ   — a hajótestet töri. Ezzel lehet elsüllyeszteni.
     LÁNCOS  — az árbocot és a kötélzetet tépi: a testet alig sebzi,
               viszont a megsérült vitorlázat LASSÍTJA a hajót. Ezzel
               lehet megállítani a menekülőt.
     KARTÁCS — a fedélzeten söpör végig: a testet szinte nem bántja,
               a legénységet viszont sokszorosan fogyasztja. Ezzel lehet
               előkészíteni az átszállást.

   A vitorla lassan javul magától, ha nem éri újabb találat.
   ===================================================================== */

const TOLTETEK=[
  {k:'golyo',  nev:T('tGolyo'),   mit:T('tGolyoAl'),        test:1.00, legeny:1.0, vitorla:0},
  {k:'lancos', nev:T('tLancos'),  mit:T('tLancosAl'), test:0.35, legeny:0.5, vitorla:1},
  {k:'kartacs',nev:T('tKartacs'), mit:T('tKartacsAl'),  test:0.25, legeny:3.5, vitorla:0}
];
function toltetAdat(k){
  for(const t of TOLTETEK) if(t.k===k) return t;
  return TOLTETEK[0];
}
function toltetValaszt(k){
  if(typeof logAdd==='function'&&logAdd('toltet', k)) return;
  G.toltet=k;
  const t=toltetAdat(k);
  toast(t.nev+' — '+t.mit);
  SFX.play('click');
  if(typeof syncUI==='function'){ G.btnSig=''; syncUI(); }
}
/* A lövő fél töltete. A bot mindig golyót lő. */
function toltetOf(owner){
  return (owner===0)?(G.toltet||'golyo'):'golyo';
}

/* A vitorla sérülése lassít, és lassan javul. */
function sailTick(dt){
  if(!G.on) return;
  for(const u of G.units){
    if(u.dead||!u.naval||!u.sailDmg) continue;
    u.sailDmg=Math.max(0,u.sailDmg-dt*0.035);   // kb. fél perc alatt kifut
  }
}
function sailMul(u){
  return u.sailDmg?Math.max(0.35,1-u.sailDmg*0.6):1;
}

/* =======================================================================
   10. FRISSÍTÉS — épületek, lövedékek
   ===================================================================== */
function updateBuild(b,dt){
  // Építkezés
  if(!b.done){
    /* Kalózmódban nincs jobbágy: a kolóniát a partra tett legénység húzza
       fel, a kapitány pedig a fedélzetről nézi. Az ilyen épület magától
       halad — a sebességet az akadémiai Építőipar gyorsítja. */
    if(b.remote){
      b.started=true;
      b.prog=Math.min(1, (b.prog||0) + dt/Math.max(4,b.buildTime||12));
    }
    // Egyébként az építkezés magától nem halad: munkásoknak kell dolgozniuk
    // rajta. A haladást ők írják bele az építési parancsuk során.
    b.hp=Math.max(b.hp,b.maxHp*(0.25+0.75*Math.min(1,b.prog)));
    if(b.prog>=1){b.done=true;b.hp=b.maxHp;
      if(b.owner===0){SFX.at('ready',b.x,b.y,0.9);
        if(b.type==='hq'||b.type==='barracks'||b.type==='tower') toast(BUILDS[b.type].names[b.age]+' elkészült.');}}
    return;
  }
  // Amit húsz másodperce nem ért támadás, azt a helyőrség lassan rendbe hozza.
  // Enélkül a bázis visszafordíthatatlanul kopna, miközben az egységek gyógyulnak.
  if(b.hp<b.maxHp&&G.t-(b.hitAt||-99)>20)
    b.hp=Math.min(b.maxHp,b.hp+b.maxHp*0.004*dt);
  const d=BUILDS[b.type];
  if(b.fire&&typeof fireTick==='function') fireTick(b,dt);   // felgyújtott épület
  if(d.heal) hospitalAura(b,dt);        // a kórház körüli gyógyulás
  /* TERMELÉS.

     Az épület nem csak élelmet adhat: a kalózvárosokban aranybánya és
     cukornád-ültetvény is áll. Mindegyik ugyanúgy működik, mint a majorság
     — a termést a doktrína és az akadémiai Termelés fejlesztés szorozza. */
  if(d.food||d.termel){
    const store=(typeof resOf==='function')?resOf(b.owner):(b.owner?(G.ai&&G.ai.res):G.res);
    if(store){
      const szorzo=dt*PACE.farm*upgMul(b.owner,'yield');
      if(d.food){
        /* Télen a majorság alig ad: a fagyott föld nem terem. Ettől a
           késői korszakoknak saját gazdasági jellege lesz — több egység,
           de nehezebb ellátni őket. */
        const evszakM=(typeof evszakTermeles==='function')?evszakTermeles():1;
        const gain=val(d.food,b.age)*szorzo*doctMul(b.owner,'food')*evszakM;
        store.food+=gain;
        if(!b.owner) G.earned.food=(G.earned.food||0)+gain;
      }
      if(d.termel) for(const res in d.termel){
        const gain=d.termel[res]*szorzo;
        store[res]=(store[res]||0)+gain;
        if(!b.owner) G.earned[res]=(G.earned[res]||0)+gain;
      }
    }
  }
  /* Toronylövés.

     A torony korábban az ÉPÍTÉSKORI korszak adataival lőtt, és soha nem
     frissült. Egy 15. században emelt őrtorony a 19. században is 155
     pixerre lőtt, miközben az akkori lövészek 165-re — vagyis a saját
     tornyodat kilőtték anélkül, hogy visszalőhetett volna.
     Most a védőépületek a birodalom MOSTANI korszaka szerint harcolnak:
     a helyőrség korszerűsödik, még ha a falak régiek is. */
  if(d.dmg){
    b.cd-=dt;
    const ba=Math.max(b.age, (typeof korOf==='function')?korOf(b.owner):(b.owner?G.ai.age:G.age));
    const t=nearestEnemy(b.x,b.y,b.owner,val(d.range,ba)*(b.rangeMul||1),b);
    if(t&&b.cd<=0&&hasCoal(b)){
      G.projs.push({x:b.x,y:b.y-14,target:t,dmg:val(d.dmg,ba),spd:val(d.proj,ba),
        owner:b.owner,src:b,style:ba===0?'arrow':(ba<3?'ball':'tracer'),dead:false});
      b.cd=val(d.atk,ba);
    }
  }
  // Kiképzési sor
  if(b.queue.length){
    const q=b.queue[0];
    q.t-=dt;
    if(q.t<=0){
      b.queue.shift();
      const age=(typeof korOf==='function')?korOf(b.owner):(b.owner?G.ai.age:G.age);
      let sx2,sy2;
      if(UNITS[q.role].naval){                    // hajó: a kikötő rakodóhelyére
        const dp=dockOf(b);
        sx2=dp.x+srange(-14,14); sy2=dp.y+srange(-14,14);
        if(!isWater(sx2,sy2)){ sx2=dp.x; sy2=dp.y; }
        /* Ha a rakodóhely is szárazon van — például mert az épület nem
           kikötő, hanem egy városi épület —, akkor megkeressük a legközelebbi
           vizet. Enélkül a frissen kiállított hajó a fűben állt. */
        if(!isWater(sx2,sy2)){
          let jo=null;
          for(let r=40;r<=900&&!jo;r+=25)
            for(let k=0;k<24;k++){
              const a=k*TAU/24;
              const x=b.x+dcos(a)*r, y=b.y+dsin(a)*r;
              if(isWater(x,y)){ jo={x,y}; break; }
            }
          if(jo){ sx2=jo.x; sy2=jo.y; }
        }
      }else{
        const a=srange(0,TAU), sp=Math.max(b.w,b.h)*0.6+18;
        sx2=b.x+dcos(a)*sp; sy2=b.y+dsin(a)*sp;
      }
      const u=makeUnit(q.role,b.owner,sx2,sy2,age);
      if(b.rally){
        const r=b.rally;
        if(r.node&&!r.node.dead&&u.role==='worker') u.order={type:'gather',res:r.node.type,target:r.node};
        else if(r.foe&&!r.foe.dead&&u.role!=='worker'){ u.order={type:'attack',target:r.foe}; u.target=r.foe; }
        else u.order={type:'amove',x:r.x,y:r.y};
      }
      G.units.push(u);
      if(b.owner===0) SFX.at('train',b.x,b.y,0.8);
    }
  }
}
function updateProj(p,dt){
  if(p.bomb){                                    // zuhanó bomba
    p.fall+=dt;
    const k=Math.min(1,p.fall/p.fallT);
    p.x=p.x+(p.tx-p.x)*Math.min(1,dt*3.2);       // kissé előre csúszik
    p.y=p.y+(p.ty-p.y)*Math.min(1,dt*3.2);
    p.z=AIR_ALT*(1-k*k);                         // gyorsuló esés
    if(k>=1){
      p.dead=true;
      bombHit(p.tx,p.ty,p.dmg,p.src);
    }
    return;
  }
  const t=p.target;
  if(!t||t.dead){p.dead=true;return;}
  const d=dist(p.x,p.y,t.x,t.y), step=p.spd*dt;
  if(d<=step+2){
    damage(t,p.dmg,p.src||p,p.toltet); p.dead=true;   // a töltet a lövedékkel érkezik
    G.fx.push({x:t.x,y:t.y,t:0,life:.2,type:'hit'});
  }else{
    p.x+=(t.x-p.x)/d*step; p.y+=(t.y-p.y)/d*step;
    p.ang=datan2(t.y-p.y,t.x-p.x);
  }
}

/* =======================================================================
   11. BOTOK (AI)

   Minden bot SAJÁT fejjel gondolkodik. A függvények nem a G.ai-t
   olvassák, hanem a kapott `ai` bejegyzést az oldalak táblájából, és a
   sorszámát (`ai.i`) használják tulajdonosként.

   Korábban minden „1” be volt égetve: `b.owner===1`, `doctSet(1)`,
   `fogAt(x,y,1)`. Két félnél ez helyes volt, négy botnál viszont
   mindegyik ugyanazt a birodalmat építette volna.

   Ellenség: nem a 0. fél, hanem mindenki, aki nincs velünk egy csapatban
   — így a szövetségek is működnek.
   ===================================================================== */
// A bot emlékezete a látott ellenséges hadrendről. Az értékek lassan
// fakulnak, tehát a régi információ magától elavul.
function aiRemember(dt,ai){
  const m=ai.seen;
  const decay=dpow(0.5,dt/25);
  m.melee*=decay; m.ranged*=decay; m.spear*=decay; m.cav=(m.cav||0)*decay;
  for(const u of G.units){
    if(u.dead||u.role==='worker') continue;
    if(!ellenseg(ai.i,u.owner)) continue;       // a szövetségest nem méri fel
    if(fogAt(u.x,u.y,ai.i)!==2) continue;       // csak amit épp lát
    if(m[u.role]!==undefined) m[u.role]+=dt*0.9;
  }
}
// Mit érdemes most kiképezni? Ellenszer a leggyakoribb ellenséges típusra.
function aiPickRole(ai){
  // A szigetlakók nem ismerik a fémet: lándzsával és íjjal harcolnak,
  // lovasságot vagy gépesített egységet nem állítanak ki.
  if(ai.noAge) return schance(0.55)?'spear':'ranged';
  /* A négyes háromszög: a könnyűlovas a lövészre való, a pika minden
     lovasra. A bot ugyanazt a logikát követi, mint a játékos:
     megnézi, miből lát legtöbbet, és annak az ellenszerét képzi. */
  const m=ai.seen, tot=m.melee+m.ranged+m.spear+(m.cav||0);
  if(tot>2.5&&schance(0.65)){
    let dom='melee', db=m.melee;
    if(m.ranged>db){ dom='ranged'; db=m.ranged; }
    if(m.spear>db){ dom='spear'; db=m.spear; }
    if((m.cav||0)>db){ dom='cav'; db=m.cav; }
    /* Lovas ellen pika; lövész ellen lovas (gyorsabb, mint a nehézlovas);
       pika ellen lövész; nehézlovas ellen pika. */
    return {melee:'spear', ranged:'cav', spear:'ranged', cav:'spear'}[dom];
  }
  const rr=srnd();
  /* Alaphelyzetben is kerül lovas a seregbe — enélkül a bot sosem
     használná, és a játékos sem találkozna vele. */
  return rr<0.28?'melee':(rr<0.56?'ranged':(rr<0.82?'spear':'cav'));
}
function nearestOwnBuilding(u){
  let best=null,bd=1e9;
  for(const b of G.builds){
    if(b.dead||b.owner!==u.owner||!b.done||!isHealBuilding(b)) continue;
    const d=dist(u.x,u.y,b.x,b.y); if(d<bd){bd=d;best=b;}
  }
  return best;
}
function aiHQ(i){
  const o=(i===undefined)?1:i;
  return G.builds.find(b=>b.owner===o&&b.type==='hq'&&!b.dead);
}
function nearAnyBuilding(x,y,r){
  for(const b of G.builds) if(!b.dead&&Math.hypot(b.x-x,b.y-y)<r+Math.max(b.w,b.h)*0.5) return true;
  return false;
}
// A kitermelt erdő lassan visszanő, különben hosszú játékban a térkép kimerül
function regrow(dt){
  regrowFish(dt); regrowCoal(dt);
  G.regrowT-=dt;
  if(G.regrowT<=0){
    G.regrowT=13;
    const woods=G.nodes.filter(n=>n.type==='wood');
    if(woods.length<170){
      const seed=woods.length?woods[srangeInt(0,woods.length-1)]:null;
      for(let i=0;i<24;i++){
        const a=srange(0,TAU), d=srange(30,110);
        const x=seed?clamp(seed.x+dcos(a)*d,60,WORLD.w-60):srange(200,WORLD.w-200);
        const y=seed?clamp(seed.y+dsin(a)*d,60,WORLD.h-60):srange(200,WORLD.h-200);
        if(freeSpot(x,y,26,26,4)&&!nearAnyBuilding(x,y,130)){ G.nodes.push(makeNode('wood',x,y)); break; }
      }
    }
  }
  G.regrowT2-=dt;
  if(G.regrowT2<=0){                        // új kő- és aranylelőhelyek is felbukkannak
    G.regrowT2=46;
    for(const type of ['stone','gold']){
      const cnt=G.nodes.filter(n=>n.type===type).length;
      if(cnt>=(type==='stone'?34:22)) continue;
      for(let i=0;i<30;i++){
        const x=srange(160,WORLD.w-160), y=srange(160,WORLD.h-160);
        if(freeSpot(x,y,30,30,6)&&!nearAnyBuilding(x,y,150)){ G.nodes.push(makeNode(type,x,y)); break; }
      }
    }
  }
}
/* Minden bot külön kap szót, mindig ugyanabban a sorrendben — a
   hálózati játszmában ez elengedhetetlen, mert a sorrend a sorsolás
   sorrendjét is meghatározza. */
function updateAI(dt){
  const botok=(typeof botOldalak==='function')?botOldalak():(G.ai?[G.ai]:[]);
  for(const b of botok) if(b) botLep(dt,b);
}
function botLep(dt,ai){
  if(!ai||!ai.res) return;
  const r=ai.res, BOTID=ai.i;
  // Passzív bevétel: az AI nem gyűjt kézzel, hanem növekvő ütemben kap nyersanyagot.
  aiRemember(dt,ai);
  const m=Math.min(2.1,1+ai.age*0.30+G.t/860)*(ai.rate||1);  // küldetésenként hangolható
  const inc=m*PACE.aiIncome*DIFF[G.diff].income;
  r.wood+=1.9*inc*dt; r.stone+=1.1*inc*dt; r.gold+=1.3*inc*dt; r.food+=2.1*inc*dt;
  if(ai.age>=COAL_AGE) r.coal=(r.coal||0)+1.5*inc*dt;

  // Korszakváltás időzítve
  ai.ageT-=dt;
  if(ai.ageT<=0&&ai.age<3){
    ai.age++; ai.ageT=250;
    if(doctSet(BOTID)[ai.age]) ai.doct[ai.age]=doctSet(BOTID)[ai.age][srangeInt(0,2)].key;
    for(const b of G.builds) if(b.owner===BOTID&&!b.dead) upgradeEnt(b,ai.age);
    for(const u of G.units) if(u.owner===BOTID&&!u.dead) upgradeEnt(u,ai.age);
    warmSprites(ai.age,BOTID); pruneSprites();
    /* Csak akkor szólunk, ha a bot ELLENSÉGES a helyi játékosra nézve —
       szövetséges korszakváltásáról nem kell értesíteni. Kettőnél több
       félnél a nemzet nevét is kiírjuk, különben négy bot négy azonos
       üzenetet küldene, és nem derülne ki, melyik lépett. */
    if(ellenseg(G.enId||0,BOTID)){
      const ki=(oldalDb()>2&&NATIONS[nationOf(BOTID)])?(NATIONS[nationOf(BOTID)].name+': '):'';
      toast(ki+T('uzEllenfelKor')+': '+korszakNev(ai.age));
    }
  }

  // Építkezés
  ai.buildT-=dt;
  if(ai.buildT<=0){
    ai.buildT=26;
    const hq=aiHQ(BOTID);
    if(hq){
      const bar=G.builds.filter(b=>b.owner===BOTID&&b.type==='barracks'&&!b.dead).length;
      const aca=G.builds.filter(b=>b.owner===BOTID&&b.type==='academy'&&!b.dead).length;
      const tmp=G.builds.filter(b=>b.owner===BOTID&&b.type==='temple'&&!b.dead).length;
      const tow=G.builds.filter(b=>b.owner===BOTID&&b.type==='tower'&&!b.dead).length;
      const farm=G.builds.filter(b=>b.owner===BOTID&&b.type==='farm'&&!b.dead).length;
      const ist=G.builds.filter(b=>b.owner===BOTID&&b.type==='stable'&&!b.dead).length;
      // Gazdasági sorrend: előbb élelem, aztán kaszárnya, végül védelem.
      // Ha fogytán az élelem, mindent félretesz és majorságot húz fel.
      let type=null;
      if(farm<2) type='farm';
      else if(bar<1) type='barracks';
      else if(r.food<260&&farm<7) type='farm';
      else if(ai.age>=3&&!G.builds.some(b=>b.owner===BOTID&&b.type==='airfield'&&!b.dead))
        type='airfield';                       // a 20. században ez elsőbbséget élvez
      /* Az istálló a második kaszárnya UTÁN jön: előbb a gyalogság áll
         fel, csak azután a lovasság. A kalózvilágban nincs értelme —
         ott szigetek vannak, nem síkság. */
      else if(ist<1&&!G.pirate&&ai.age<3) type='stable';
      else if(aca<1&&ai.age>0) type='academy';
      else if(tmp<1&&ai.age>0) type='temple';
      else if(bar<2+ai.age) type='barracks';
      else if(tow<2+ai.age) type='tower';
      else if(farm<4+ai.age) type='farm';
      if(type){
        const c=buildCost(type,ai.age,BOTID);
        if(canPay(c,r)){
          // A repülőtér nagy: messzebb és több próbálkozással keres helyet
          const big=(BUILDS[type].w>90), tries=big?60:24;
          for(let i=0;i<tries;i++){
            const a=srange(0,TAU), d=srange(big?150:120, big?430:290);
            const x=hq.x+dcos(a)*d, y=hq.y+dsin(a)*d;
            if(freeSpot(x,y,BUILDS[type].w,BUILDS[type].h,14)){
              pay(c,r); G.builds.push(makeBuild(type,BOTID,x,y,ai.age,true)); G.navVer++; break;
            }
          }
        }
      }
    }
  }

  // Kiképzés
  ai.trainT-=dt;
  if(ai.trainT<=0){
    ai.trainT=8;
    const pop=popOf(BOTID);
    const army=G.units.filter(u=>u.owner===BOTID&&u.role!=='worker'&&!u.dead).length;
    // A bot serege csak a rohamok számával együtt nő, így nem húz el az elején
    if(pop<62&&army<8+ai.wave*3){
      // Hittérítők: kevés kell belőlük, de sokat érnek
      const priests=G.units.filter(u=>u.owner===BOTID&&!u.dead&&u.role==='priest').length;
      for(const tb of G.builds){
        if(tb.dead||tb.owner!==BOTID||tb.type!=='temple'||!tb.done||tb.queue.length) continue;
        if(priests>=1+ai.age) break;
        const pc=unitCost('priest',ai.age,BOTID);
        if(canPay(pc,r)){ pay(pc,r); tb.queue.push({role:'priest',t:UNITS.priest.time}); }
        break;
      }
      // Repülőtérről vadászt tart, hogy legyen mit a gépek ellen küldeni
      const af=G.builds.filter(b=>b.owner===BOTID&&b.type==='airfield'&&!b.dead&&b.done);
      if(af.length){
        const planes=G.units.filter(u=>u.owner===BOTID&&!u.dead&&u.air).length;
        if(planes<2+DIFF[G.diff].size){
          const c=unitCost('fighter',ai.age,BOTID);
          if(canPay(c,r)&&af[0].queue.length<2){
            pay(c,r); af[0].queue.push({role:'fighter',t:UNITS.fighter.time*PACE.train});
          }
        }
      }
      // A 20. században félretesz a repülőtérre: amíg nincs, nem költi el
      // az utolsó aranyait katonákra.
      const needAf=(ai.age>=3&&!af.length);
      if(needAf&&r.gold<buildCost('airfield',ai.age,BOTID).gold+60) return;
      /* A LOVAS ISTÁLLÓBAN készül, a gyalogság kaszárnyában. Mivel a
         szerepet épületenként választjuk, előbb az épületet nézzük meg,
         és csak azután kérdezzük, mit érdemes ott képezni: az istállóban
         úgyis csak lovas lehet, a kaszárnyában pedig minden más. */
      const muhelyek=G.builds.filter(b=>b.owner===BOTID&&!b.dead&&b.done
        &&(b.type==='barracks'||b.type==='stable'));
      for(const b of muhelyek){
        if(b.queue.length>1) continue;
        let role;
        if(b.type==='stable'){
          role='cav';
          /* Az istállót nem tömjük tele: a lovas drága és két helyet
             foglal. Ha a sereg nagy része már lovas, kihagyjuk a kört. */
          const sajat=G.units.filter(u=>!u.dead&&u.owner===BOTID&&u.role!=='worker');
          const lovas=sajat.filter(u=>u.role==='cav').length;
          if(sajat.length>6&&lovas>sajat.length*0.34) continue;
        }else{
          role=aiPickRole(ai);                       // ellenfogás a látott hadrendre
          if(role==='cav') role='melee';             // kaszárnyában nincs lovas
        }
        const c=unitCost(role,ai.age,BOTID);
        if(canPay(c,r)){pay(c,r);b.queue.push({role,t:UNITS[role].time*0.8});}
      }
    }
  }

  // Védelem: ha ellenség járkál a bázis körül, a sereg hazafordul
  ai.defT-=dt;
  if(ai.defT<=0){
    ai.defT=3;
    const hq=aiHQ(BOTID);
    if(hq){
      let threat=null,bd=560*560;
      for(const u of G.units){
        if(u.dead||u.role==='worker'||!ellenseg(BOTID,u.owner)) continue;
        const d=(u.x-hq.x)**2+(u.y-hq.y)**2;
        if(d<bd){bd=d;threat=u;}
      }
      if(threat){
        for(const u of G.units){
          if(u.dead||u.owner!==BOTID||u.role==='worker'||u.retreat) continue;
          if(dist(u.x,u.y,hq.x,hq.y)>1100) continue;      // a távoli rohamot nem hívja vissza
          if(!u.target) u.order={type:'amove',x:threat.x,y:threat.y};
        }
      }
    }
  }

  // Fejlesztés: a bot is költ kutatásra, ha futja
  ai.upgT-=dt;
  if(ai.upgT<=0){
    ai.upgT=50;
    if(!DIFF[G.diff].upg) return;
    if(!G.builds.some(b=>b.owner===BOTID&&!b.dead&&b.done&&b.type==='academy')) return;
    for(const k of UPG_KEYS){
      if((ai.upg[k]||0)>=UPGRADES[k].max) continue;
      const c=upgCost(k,BOTID);
      if(canPay(c,r)){
        pay(c,r); ai.upg[k]=(ai.upg[k]||0)+1;
        for(const u of G.units) if(!u.dead&&u.owner===BOTID) recomputeUnit(u);
        break;
      }
    }
  }

  // Felderítés: időnként egyetlen katona indul ismeretlen terület felé
  ai.scoutT-=dt;
  if(ai.scoutT<=0){
    ai.scoutT=22;
    const idle=G.units.filter(u=>u.owner===BOTID&&!u.dead&&u.role!=='worker'&&!u.order);
    if(idle.length){
      const p=unexploredPoint(BOTID);
      idle[srangeInt(0,idle.length-1)].order={type:'amove',x:p.x,y:p.y};
    }
  }

  // Roham
  ai.waveT-=dt;
  if(ai.waveT<=0){
    // A gyógyulni hazaküldött katonák nem tartoznak a rohamerőhöz —
    // különben a hullám papíron nagyobb volna, mint a valóságban.
    const army=G.units.filter(u=>u.owner===BOTID&&u.role!=='worker'&&!u.dead&&!u.retreat);
    const need=Math.max(2,4+ai.wave*2+DIFF[G.diff].size);
    if(army.length>=need){
      ai.wave++; ai.waveT=Math.max(38,72-ai.wave*3)*DIFF[G.diff].wave;
      // A legközelebbi játékos-épület felé indulnak
      const hq=aiHQ(BOTID)||{x:WORLD.w/2,y:WORLD.h/2};
      let tgt=null,bd=1e9;
      for(const b of G.builds){ if(b.dead||!ellenseg(BOTID,b.owner)) continue;
        if(fogAt(b.x,b.y,BOTID)===0) continue;              // amit nem derített fel, azt nem ismeri
        const d=dist(hq.x,hq.y,b.x,b.y); if(d<bd){bd=d;tgt=b;} }
      if(tgt){
        for(const u of army){u.order={type:'amove',x:tgt.x+srange(-70,70),y:tgt.y+srange(-70,70)};u.target=null;}
        /* Riasztás csak akkor, ha a roham RÁD (vagy a szövetségesedre)
           indul. Két bot egymás elleni hadjáratáról nem kapsz üzenetet. */
        if(!ellenseg(G.enId||0,tgt.owner)){
          const ki=(oldalDb()>2&&NATIONS[nationOf(BOTID)])?(NATIONS[nationOf(BOTID)].name+' — '):'';
          toast(ki+T('uzRoham')+' ('+army.length+' '+T('uzEgysegDb')+')');
          SFX.play('alert');
        }
      }else{
        // Nem tudja, hol vagy: a sereg felderítő menetbe kezd. Ilyenkor
        // nincs riasztás — a játékos sem tudhatja, hogy elindultak.
        const p=unexploredPoint(BOTID);
        for(const u of army){u.order={type:'amove',x:p.x,y:p.y};u.target=null;}
      }
    }else ai.waveT=12;
  }
}

/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   12. KORSZAKVÁLTÁS
   ===================================================================== */
function upgradeEnt(e,age){
  e.age=age;
  const bn=bonusOf(e.owner);
  if(e.kind==='build'){
    const ratio=e.hp/e.maxHp;
    e.maxHp=BUILDS[e.type].hp[age];
    if(bn.build){const t={maxHp:e.maxHp,hp:e.maxHp,type:e.type,buildTime:e.buildTime};bn.build(t);
      e.maxHp=t.maxHp; e.rangeMul=t.rangeMul||e.rangeMul;}
    e.hp=e.maxHp*ratio;
  }else{
    const d=UNITS[e.role], ratio=e.hp/e.maxHp;
    e.maxHp=d.hp[age]; e.hp=e.maxHp*ratio;
    e.dmg=val(d.dmg,age); e.range=val(d.range,age);
    e.speed=val(d.speed,age)*PACE.speed; e.atk=val(d.atk,age); e.r=val(d.r,age);
    e.armor=val(d.armor,age)||0;
    if(bn.unit) bn.unit(e);
    applyUpg(e);
  }
}
// A korszakváltáshoz nem elég a nyersanyag: a birodalomnak ki is kell
// épülnie. Fal nem számít bele — abból olcsón lehetne sokat húzni.
const AGE_BUILDS=[7,10,13];   // a kezdőbázis négy épülettel indul
function ageBuildCount(){
  return G.builds.filter(b=>!b.dead&&b.owner===ENID&&b.done&&b.type!=='wall').length;
}
function ageReady(){
  return G.age>=3 || ageBuildCount()>=AGE_BUILDS[G.age];
}
function advanceAge(){
  if(typeof logAdd==='function'&&logAdd('age')) return;
  if(pausedBlock()) return;
  /* Kalózvilágban nincs korszakváltás: a játék végig a kalózkodás
     aranykorában játszódik. */
  if(G.pirate){ toast(T('uzKorszakKalozNincs')); SFX.play('deny'); return; }
  if(G.age>=3){toast(T('uzLegmagasabbKor'));return;}
  if(!ageReady()){
    toast(T('uzEpitsdKi')+': '+AGE_BUILDS[G.age]+' '+T('uzKeszEpulet')+', '
          +'jelenleg '+ageBuildCount()+'.');
    SFX.play('deny'); return;
  }
  const c=ageCost(G.age,0);
  if(!canPay(c)){toast(T('uzNincsAnyagKettospont')+': '+costText(c));SFX.play('deny');return;}
  pay(c); G.age++;
  for(const b of G.builds) if(b.owner===ENID&&!b.dead) upgradeEnt(b,G.age);
  for(const u of G.units) if(u.owner===ENID&&!u.dead) upgradeEnt(u,G.age);
  applyAgeStyle();
  if(typeof MUSIC==='object'&&MUSIC.setEra) MUSIC.setEra(G.age); drawPortrait(); syncUI(); SFX.play('age');
  openDoctrine(G.age);                        // az új korszak új irányt kínál
  warmSprites(G.age,0);                       // az új korszak grafikái előre elkészülnek
  pruneSprites();
  const n=NATIONS[G.nation];
  toast(T('uzUjKorszak')+': '+korszakNev(G.age)+' — '+uralkodoNev(G.nation,G.age)+' '+T('uzVezetesevel'));
}
// A felület színei a korszakot ÉS a választott nemzetet is követik: a
// korszak adja az alaphangulatot, a nemzet ezt a saját színei felé húzza.
function applyAgeStyle(nation){
  const u=AGES[G.age].ui, s=document.documentElement.style;
  const nk=nation||G.nation, n=NATIONS[nk]&&NATIONS[nk].ui;
  const put=(k,base,nat,amt)=>s.setProperty(k, n?mix(base,nat,amt):base);
  // A nemzet dominál: a korszak csak árnyalja, nem nyomja el
  put('--gold',u.gold, n&&n.gold, 0.72);
  put('--panel',u.panel, n&&n.panel, 0.94);
  put('--panel2',u.panel2, n&&n.panel2, 0.94);
  put('--line',u.line, n&&n.line, 0.88);
  s.setProperty('--ink',u.ink);
  s.setProperty('--nat', n?n.gold:u.gold);
  if(typeof natPattern==='function') s.setProperty('--pat', natPattern(nk));
}

/* =======================================================================
   13. RAJZOLÁS — terep
   ===================================================================== */
// Az atomcsapás helyén kiégett folt marad
function drawScorch(){
  if(!G.scorch||!G.scorch.length) return;
  for(const s of G.scorch){
    const x=s.x-G.cam.x, y=s.y-G.cam.y;
    if(x<-s.r*2||y<-s.r*2||x>G.vw+s.r*2||y>G.vh+s.r*2) continue;
    const g=ctx.createRadialGradient(x,y,s.r*0.2,x,y,s.r*1.15);
    g.addColorStop(0,'rgba(28,24,20,.88)');
    g.addColorStop(0.6,'rgba(62,52,40,.7)');
    g.addColorStop(1,'rgba(80,70,50,0)');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.ellipse(x,y,s.r*1.15,s.r*0.62,0,0,TAU); ctx.fill();
  }
}
/* -----------------------------------------------------------------------
   TALAJSZÖVET

   A talaj korábban egyszínű volt néhány folttal — ránézésre unalmas. Most
   nagyobb, 384 pixeles csempét kap, amibe HÁROM lépték kerül bele:

     1. nagy, lágy színfoltok (rétek, kopottabb sávok, földes részek)
     2. közepes csomók és taposott foltok
     3. finom fűszálak, kavicsok, mohapöttyök, apró virágok

   Ráadásul tájtípusonként más a jellege: a Sivatag homokfodros, a
   Hegyvidék köves, a Rengeteg mohás és leveles.

   A csempe egyszer készül el, utána egyetlen kitöltés az egész képernyő.
   ----------------------------------------------------------------------- */
const GRASS_TILE=384;
let grassKey='', grassPat=null, grassLowFx=false;
function grassPattern(base,alt){
  const M=(typeof curMap==='function')?curMap():null;
  const mk=M?M.key:'mezo';
  const key=base+'|'+alt+'|'+mk;
  if(key===grassKey&&grassPat) return grassPat;
  const c=document.createElement('canvas');
  c.width=c.height=GRASS_TILE;
  const g=c.getContext('2d');
  if(!g) return null;
  const T=GRASS_TILE, R=seedRand('talaj'+key);
  /* NAGYLÉPTÉKŰ VÁLTOZATOSSÁG.

     A fű eddig egyetlen zöld volt: a nagy üres területeken nem volt mit
     nézni. A világosabb és sötétebb rétfoltokat MAGÁBA A CSEMPÉBE festjük,
     nem külön rétegként — így képkockánként semmibe nem kerül. (Először
     teljes képernyős keveréssel csináltam: 230 ezredmásodpercet vitt el.)

     A foltok a csempe szélén körbeérnek, ezért az ismétlődés nem látszik
     éles határként. */
  {
    const RN=seedRand('ret'+key), P=5;
    const pont=[];
    for(let y=0;y<=P;y++){ pont[y]=[]; for(let x=0;x<=P;x++) pont[y][x]=RN(); }
    for(let y=0;y<=P;y++) pont[y][P]=pont[y][0];
    for(let x=0;x<=P;x++) pont[P][x]=pont[0][x];
    const lagy=t=>t*t*(3-2*t), lep=T/P;
    const vilagos=mix(base,'#d6e08a',0.5), sotet=mix(base,'#22381c',0.45);
    for(let cy=0;cy<P;cy++) for(let cx=0;cx<P;cx++){
      // minden rácsmezőt kis négyzetekkel töltünk ki, lágyan interpolálva
      for(let sy=0;sy<6;sy++) for(let sx=0;sx<6;sx++){
        const fx=lagy((sx+0.5)/6), fy=lagy((sy+0.5)/6);
        const a=pont[cy][cx], b=pont[cy][cx+1];
        const c2=pont[cy+1][cx], d2=pont[cy+1][cx+1];
        const v=(a+(b-a)*fx)*(1-fy)+(c2+(d2-c2)*fx)*fy;
        const e=(v-0.5)*2;                         // -1 .. 1
        g.globalAlpha=Math.min(0.5,Math.abs(e)*0.42);
        g.fillStyle=e>0?vilagos:sotet;
        g.fillRect(cx*lep+sx*lep/6-0.5, cy*lep+sy*lep/6-0.5, lep/6+1, lep/6+1);
      }
    }
    g.globalAlpha=1;
  }
  const fold=mix(base,'#8a6f42',0.5);            // földes tónus
  const sotet=shade(base,-0.16), vilag=mix(base,alt,0.8);

  g.fillStyle=base; g.fillRect(0,0,T,T);

  // 1. nagy foltok — ezek adják a nagy léptékű változatosságot
  for(let i=0;i<26;i++){
    const x=R()*T, y=R()*T, r=T*(0.09+R()*0.16);
    const t=R();
    g.fillStyle=t<0.4?vilag:(t<0.72?sotet:fold);
    g.globalAlpha=0.1+R()*0.14;
    g.beginPath();
    g.ellipse(x,y,r,r*(0.5+R()*0.5),R()*TAU,0,TAU); g.fill();
    // a csempe szélén átnyúló másolat, hogy ne legyen látható varrat
    if(x<r) { g.beginPath(); g.ellipse(x+T,y,r,r*0.7,0,0,TAU); g.fill(); }
    if(y<r) { g.beginPath(); g.ellipse(x,y+T,r,r*0.7,0,0,TAU); g.fill(); }
  }
  g.globalAlpha=1;

  // 2. közepes csomók és taposott foltok
  for(let i=0;i<70;i++){
    const x=R()*T, y=R()*T, r=8+R()*26;
    g.fillStyle=R()<0.5?mix(base,alt,0.6+R()*0.4):shade(base,-0.08-R()*0.08);
    g.globalAlpha=0.14+R()*0.16;
    g.beginPath(); g.ellipse(x,y,r,r*(0.45+R()*0.35),R()*TAU,0,TAU); g.fill();
  }
  g.globalAlpha=1;

  // 3/a. tájtípus jellege
  if(mk==='sivatag'||mk==='puszta'){             // homokfodrok
    g.strokeStyle='rgba(190,168,120,.20)';
    for(let i=0;i<34;i++){
      const y=R()*T, x=R()*T, w=40+R()*90;
      g.lineWidth=1.4+R()*1.6;
      g.beginPath();
      g.moveTo(x,y);
      g.quadraticCurveTo(x+w*0.5,y-6-R()*8,x+w,y);
      g.stroke();
    }
  }else if(mk==='hegy'||mk==='kopar'){           // több kavics, kopott sávok
    for(let i=0;i<70;i++){
      const x=R()*T, y=R()*T, r=1.4+R()*3.4;
      g.fillStyle='rgba(146,142,128,'+(0.24+R()*0.3)+')';
      g.beginPath(); g.ellipse(x,y,r,r*0.7,R()*TAU,0,TAU); g.fill();
      g.fillStyle='rgba(255,255,255,.16)';
      g.beginPath(); g.ellipse(x-r*0.3,y-r*0.3,r*0.4,r*0.3,0,0,TAU); g.fill();
    }
  }else if(mk==='erdo'||mk==='tavak'){           // moha és lehullott levelek
    for(let i=0;i<60;i++){
      const x=R()*T, y=R()*T, r=4+R()*11;
      g.fillStyle='rgba(74,110,50,'+(0.14+R()*0.18)+')';
      g.beginPath(); g.ellipse(x,y,r,r*0.65,R()*TAU,0,TAU); g.fill();
    }
    for(let i=0;i<26;i++){
      const x=R()*T, y=R()*T, a=R()*TAU;
      g.save(); g.translate(x,y); g.rotate(a);
      g.fillStyle=['rgba(150,110,52,.30)','rgba(122,92,44,.28)','rgba(168,132,60,.26)'][(R()*3)|0];
      g.beginPath(); g.ellipse(0,0,4.4,2.2,0,0,TAU); g.fill();
      g.restore();
    }
  }

  // 3/b. fűszálak — sűrűn, három rétegben
  const dark=shade(base,-0.3), light=shade(alt,0.2), koz=mix(base,alt,0.5);
  const szalak=(mk==='sivatag')?420:(mk==='puszta'?700:1400);
  for(let i=0;i<szalak;i++){
    const x=R()*T, y=R()*T, h=3+R()*9, lean=(R()-0.5)*4.4;
    const t=R();
    g.strokeStyle=t<0.4?dark:(t<0.75?koz:light);
    g.globalAlpha=0.32+R()*0.34;
    g.lineWidth=0.8+R()*0.7;
    g.beginPath();
    g.moveTo(x,y); g.quadraticCurveTo(x+lean*0.5,y-h*0.6,x+lean,y-h);
    g.stroke();
  }
  g.globalAlpha=1;

  // 3/c. kavicsok és apró virágok
  for(let i=0;i<58;i++){
    const x=R()*T, y=R()*T, r=0.8+R()*1.8;
    g.fillStyle='rgba(150,146,132,'+(0.2+R()*0.28)+')';
    g.beginPath(); g.ellipse(x,y,r,r*0.7,0,0,TAU); g.fill();
  }
  if(mk!=='sivatag'&&mk!=='puszta'){
    const szirmok=['#d8d0a8','#c9a8c4','#d8b45c','#e0e0d0','#c86868'];
    for(let i=0;i<44;i++){
      const x=R()*T, y=R()*T;
      g.fillStyle=szirmok[(R()*szirmok.length)|0];
      g.globalAlpha=0.5+R()*0.4;
      g.beginPath(); g.arc(x,y,1+R()*1.3,0,TAU); g.fill();
    }
    g.globalAlpha=1;
  }
  grassPat=ctx.createPattern(c,'repeat');
  grassKey=key;
  return grassPat;
}
function drawGround(){
  const st=AGES[G.age].style;
  const M=(typeof curMap==='function')?curMap():null;
  const g1=(M&&M.ground)?mix(st.ground,M.ground,0.62):st.ground;
  const g2=(M&&M.ground)?mix(st.ground2,M.ground,0.5):st.ground2;
  ctx.fillStyle=g1;
  ctx.fillRect(0,0,G.vw,G.vh);
  // Fűszövet: egyszer megrajzolt, ismétlődő csempe. Fűszálak, apró
  // kavicsok és színárnyalatok — egyetlen kitöltéssel kerül a képre.
  // Takarékos módban a fűszövet kimarad: az egyszínű talaj olcsóbb, és a
  // növényzet (bokrok, fűcsomók) így is megadja a táj karakterét.
  /* G.lowFx a képkocka-sebesség szerint ingadozhat (28-loop.js), ezért
     csak akkor vesszük figyelembe, ha MEGVÁLTOZOTT az előző képkockához
     képest — így a fűszövet nem villódzik a teljesítmény-hullámokkal. */
  if(G.lowFx!==grassLowFx){ grassLowFx=G.lowFx; grassKey=''; grassPat=null; }
  const pat=grassLowFx?null:grassPattern(g1,g2);
  if(pat){
    ctx.save();
    /* MATEMATIKAI maradék: a `%` negatív számnál negatívat ad, és a
       kamera a pálya széle mögött negatív. Enélkül a szövet átugrik. */
    const mod=(a,b)=>((a%b)+b)%b;
    ctx.translate(-mod(G.cam.x,GRASS_TILE), -mod(G.cam.y,GRASS_TILE));
    ctx.fillStyle=pat;
    ctx.fillRect(0,0,G.vw+GRASS_TILE,G.vh+GRASS_TILE);
    ctx.restore();
  }
  // Nagy, lágy foltok a szövet fölé: így nem lesz gépies az ismétlődés
  const S=160, x0=Math.floor(G.cam.x/S)*S, y0=Math.floor(G.cam.y/S)*S;
  ctx.fillStyle=g2; ctx.globalAlpha=0.5;
  for(let x=x0;x<G.cam.x+G.vw+S;x+=S){
    for(let y=y0;y<G.cam.y+G.vh+S;y+=S){
      const h=((x*73856093)^(y*19349663))>>>0;
      const px=x+(h%90), py=y+((h>>7)%90), r=26+((h>>13)%22);
      ctx.beginPath(); ctx.ellipse(px-G.cam.x,py-G.cam.y,r,r*0.62,0,0,TAU); ctx.fill();
    }
  }
  ctx.globalAlpha=1;

  /* --- A TEREP LÁTSZÓDJÉK ---
     A magasság és a mocsár beleszól a játékba, tehát LÁTNI kell, különben
     a játékos csak annyit érzékel, hogy „valamiért lassabb vagyok”.

     Nem rajzolunk domborzatot: elég a fény. A magasabb cella világosabb,
     a mély fekvés sötétebb — ahogy a napfény éri a lankát. A mocsár
     hidegebb, kékesebb foltot kap.

     Cellánként egy téglalap, csak a képernyőn látható tartományban.
     Takarékos módban kimarad. */
  /* A `G.lowFx` MAGÁTÓL kapcsolgat a képfrissítés szerint (28-loop.js):
     ha esik a sebesség, bekapcsol, ha javul, kikapcsol. Ha a terep
     megjelenése ettől függne, a pálya VILLÓDZNA — hol sötétebb, hol
     világosabb zöld, ahogy a réteg jön-megy.

     Márpedig a terep nem díszítés: a magaslat és a mocsár a játékmenetet
     érinti, tehát MINDIG látszania kell. Cserébe olcsóvá tesszük:
     takarékos módban a mocsarat és az erdőt egyben rajzoljuk, árnyalatok
     nélkül. (A `REDUCED` a valódi takarékos mód — az beállítás, nem
     ingadozik.) */
  if(typeof REDUCED!=='undefined'&&!REDUCED&&G.magas&&typeof FOG_CELL!=='undefined'){
    const c0x=Math.max(0,Math.floor(G.cam.x/FOG_CELL));
    const c0y=Math.max(0,Math.floor(G.cam.y/FOG_CELL));
    const c1x=Math.min(FW-1,Math.ceil((G.cam.x+G.vw)/FOG_CELL));
    const c1y=Math.min(FH-1,Math.ceil((G.cam.y+G.vh)/FOG_CELL));
    for(let cy=c0y;cy<=c1y;cy++){
      for(let cx=c0x;cx<=c1x;cx++){
        const i=cy*FW+cx;
        if(G.water&&G.water[i]) continue;
        const px=cx*FOG_CELL-G.cam.x, py=cy*FOG_CELL-G.cam.y;
        const t=G.terep?G.terep[i]:0;
        if(t===1){                                  // mocsár
          ctx.fillStyle='rgba(74,96,86,.34)';
          ctx.fillRect(px,py,FOG_CELL+1,FOG_CELL+1);
        }else if(t===2){                            // sűrű erdő: mélyzöld árnyék
          ctx.fillStyle='rgba(28,46,26,.22)';
          ctx.fillRect(px,py,FOG_CELL+1,FOG_CELL+1);
        }
        const m=G.magas[i];
        if(m>=2){                                   // magaslat: napfény
          ctx.fillStyle=(m>=3)?'rgba(255,246,208,.13)':'rgba(255,246,208,.07)';
          ctx.fillRect(px,py,FOG_CELL+1,FOG_CELL+1);
        }else if(m===0&&t!==1){                     // mélyföld: enyhe árnyék
          ctx.fillStyle='rgba(0,0,0,.05)';
          ctx.fillRect(px,py,FOG_CELL+1,FOG_CELL+1);
        }
      }
    }
  }

  // Térképhatár
  ctx.strokeStyle='rgba(0,0,0,.45)'; ctx.lineWidth=6;
  ctx.strokeRect(-G.cam.x,-G.cam.y,WORLD.w,WORLD.h);
}
/* =======================================================================
   LELŐHELYEK — fa, kő, arany

   A fákat és a köveket egyszer rajzoljuk meg egy-egy rejtett vászonra,
   utána már csak képként másoljuk. Enélkül a több száz lelőhely
   részletes megrajzolása minden képkockán megfeküdné a gépet.

   Minden típusból négy változat készül, és mindegyik három állapotban:
   érintetlen, félig kitermelt, kimerülőben. A készlet fogyását tehát
   látni is lehet a térképen, nem csak a számokból.
   ===================================================================== */
const NODESPR={};
const NSPR={ wood:{w:70,h:100,ox:35,oy:82},
             stone:{w:60,h:46,ox:30,oy:34},
             gold:{w:60,h:46,ox:30,oy:34},
             coal:{w:60,h:46,ox:30,oy:34} };

// --- lombkorona egy csomója ---
function leafClump(cx,cy,r,base,rand){
  GX.fillStyle=shade(base,-0.28);
  GX.beginPath(); GX.arc(cx,cy+r*0.18,r,0,TAU); GX.fill();
  GX.fillStyle=base;
  GX.beginPath(); GX.arc(cx-r*0.08,cy,r*0.92,0,TAU); GX.fill();
  GX.fillStyle=shade(base,0.16);
  GX.beginPath(); GX.arc(cx-r*0.3,cy-r*0.3,r*0.55,0,TAU); GX.fill();
  GX.fillStyle=shade(base,0.24);
  GX.beginPath(); GX.arc(cx-r*0.44,cy-r*0.44,r*0.19,0,TAU); GX.fill();
  // apró levélfoltok a peremen
  for(let i=0;i<7;i++){
    const a=rand()*TAU, d=r*(0.6+rand()*0.45);
    GX.fillStyle=shade(base,(rand()-0.4)*0.34);
    GX.beginPath(); GX.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d*0.9,r*0.13+rand()*r*0.1,0,TAU); GX.fill();
  }
}
function paintTree(rand,stage){
  /* --- A LOMB ÉVSZAKA ---
     A talajszínt korszakonként évszakosra állítottuk; a fák ettől nem
     maradhatnak el, különben nyári zöld korona állna az őszi tarlón.

       tavasz — friss, világoszöld
       nyár   — mély, telt zöld (ez volt az eredeti)
       ősz    — sárga, rozsda, vörös
       tél    — csupasz, szürkésbarna ág, kevés örökzölddel

     Az évszakot a korszak stílusa mondja meg (AGES[..].style.evszak). */
  const EVSZAK_LOMB={
    tavasz:['#5b9a3e','#4f8c36','#6aa848','#468030'],
    nyar:  ['#3f7a32','#356b2a','#48853a','#2f6127'],
    osz:   ['#b5762a','#c9913a','#9a5a24','#7d4a2c'],
    tel:   ['#6b6355','#5a5449','#7a7364','#3f5a3a']
  };
  const evsz=(typeof AGES!=='undefined'&&AGES[G.age]&&AGES[G.age].style)
    ? AGES[G.age].style.evszak : 'nyar';
  const greens=EVSZAK_LOMB[evsz]||EVSZAK_LOMB.nyar;
  const base=greens[Math.floor(rand()*greens.length)];
  const bark='#4a3220', barkL='#66492c';
  GX.fillStyle='rgba(12,20,10,.3)';
  GX.beginPath(); GX.ellipse(3,3,15,6,0,0,TAU); GX.fill();
  if(stage>=2){                                  // kimerülőben: tuskó és ledöntött rönk
    GX.fillStyle=bark;
    GX.beginPath();
    GX.moveTo(-6.5,2); GX.lineTo(-5,-11); GX.lineTo(5,-11); GX.lineTo(6.5,2); GX.closePath(); GX.fill();
    GX.fillStyle=barkL; GX.fillRect(-6,-11,2.4,13);
    GX.fillStyle='#c2a173';                      // frissen vágott lap évgyűrűkkel
    GX.beginPath(); GX.ellipse(0,-11,5.4,2.4,0,0,TAU); GX.fill();
    GX.strokeStyle='rgba(90,66,40,.7)'; GX.lineWidth=0.8;
    for(let i=1;i<4;i++){ GX.beginPath(); GX.ellipse(0,-9,i*1.7,i*0.75,0,0,TAU); GX.stroke(); }
    GX.fillStyle=bark;                           // ledöntött rönk mellette
    GX.save(); GX.translate(12,-2); GX.rotate(0.5);
    GX.fillRect(-9,-2.6,18,5.2);
    GX.fillStyle='#8a6a45'; GX.beginPath(); GX.ellipse(9,0,1.8,2.6,0,0,TAU); GX.fill();
    GX.restore();
    return;
  }
  // törzs: karcsú, alul kiszélesedő gyökérrel
  const th=stage?26:34;
  GX.fillStyle=bark;
  GX.beginPath();
  GX.moveTo(-4.2,2); GX.quadraticCurveTo(-2.2,-th*0.45,-1.7,-th);
  GX.lineTo(1.7,-th); GX.quadraticCurveTo(2.2,-th*0.45,4.2,2);
  GX.closePath(); GX.fill();
  GX.fillStyle=barkL;                            // megvilágított oldal
  GX.beginPath();
  GX.moveTo(-4.2,2); GX.quadraticCurveTo(-2.2,-th*0.45,-1.7,-th);
  GX.lineTo(-0.5,-th); GX.quadraticCurveTo(-0.9,-th*0.45,-1.8,2);
  GX.closePath(); GX.fill();
  GX.fillStyle=shade(bark,-0.3);                 // gyökértalp
  GX.beginPath(); GX.ellipse(0,2,5.2,2,0,0,TAU); GX.fill();
  GX.strokeStyle='rgba(30,20,10,.4)'; GX.lineWidth=0.6;
  for(let i=0;i<3;i++){
    const x=-2.2+i*1.9;
    GX.beginPath(); GX.moveTo(x,0); GX.quadraticCurveTo(x+0.6,-th*0.5,x*0.45,-th+3); GX.stroke();
  }
  // ágak a lomb alá
  GX.strokeStyle=bark; GX.lineWidth=1.9; GX.lineCap='round';
  GX.beginPath();
  GX.moveTo(-1,-th*0.68); GX.lineTo(-9,-th*0.9);
  GX.moveTo(1,-th*0.58);  GX.lineTo(9,-th*0.8);
  GX.moveTo(0,-th*0.85);  GX.lineTo(-5,-th*1.02);
  GX.stroke(); GX.lineCap='butt';
  // lombkorona: egymásra lapoló csomók, felfelé kisebbedve
  const n=stage?4:6, spread=stage?11:15, top=-th-(stage?8:12);
  const pos=[[0,top-2,13.5],[-spread,top+6,11.5],[spread,top+5,11],
             [-spread*0.5,top-9,10.5],[spread*0.55,top-8,10],[0,top-15,8.5]];
  for(let i=0;i<n;i++){
    const p=pos[i];
    leafClump(p[0],p[1],p[2]*(stage?0.86:1),base,rand);
  }
  // néhány lehullott levél a tövénél
  for(let i=0;i<4;i++){
    GX.fillStyle=shade(base,-0.35);
    GX.beginPath(); GX.ellipse(rand()*22-11,rand()*5,1.8,1,rand()*3,0,TAU); GX.fill();
  }
}
// --- egy kőtömb ---
function rockLump(cx,cy,r,base,rand,gold,coal){
  GX.fillStyle=shade(base,-0.34);                // vetett árnyék a kupacban
  GX.beginPath(); GX.ellipse(cx+r*0.12,cy+r*0.3,r,r*0.72,0,0,TAU); GX.fill();
  GX.fillStyle=shade(base,(rand()-0.45)*0.18);   // a kő teste
  GX.beginPath(); GX.ellipse(cx,cy,r,r*0.78,rand()*0.5-0.25,0,TAU); GX.fill();
  GX.fillStyle=shade(base,0.2);                  // felső csillanás
  GX.beginPath(); GX.ellipse(cx-r*0.26,cy-r*0.28,r*0.56,r*0.38,-0.4,0,TAU); GX.fill();
  GX.fillStyle=shade(base,0.4);
  GX.beginPath(); GX.ellipse(cx-r*0.36,cy-r*0.4,r*0.26,r*0.16,-0.4,0,TAU); GX.fill();
  GX.strokeStyle='rgba(30,30,34,.34)'; GX.lineWidth=0.7;   // repedés
  GX.beginPath();
  GX.moveTo(cx-r*0.5,cy+r*0.1);
  GX.lineTo(cx-r*0.1,cy-r*0.05);
  GX.lineTo(cx+r*0.3,cy+r*0.28);
  GX.stroke();
  if(coal){                                      // szén: fényes, szilánkos törésfelület
    GX.fillStyle='rgba(255,255,255,.16)';
    GX.beginPath();
    GX.moveTo(cx-r*0.4,cy-r*0.2); GX.lineTo(cx-r*0.05,cy-r*0.42);
    GX.lineTo(cx+r*0.18,cy-r*0.05); GX.closePath(); GX.fill();
    GX.fillStyle='rgba(120,140,160,.22)';
    GX.beginPath();
    GX.moveTo(cx+r*0.1,cy+r*0.3); GX.lineTo(cx+r*0.44,cy+r*0.02);
    GX.lineTo(cx+r*0.2,cy+r*0.44); GX.closePath(); GX.fill();
  }
  if(gold){                                      // aranyerek és csillanás
    GX.strokeStyle='rgba(226,178,52,.9)'; GX.lineWidth=1.2;
    GX.beginPath();
    GX.moveTo(cx-r*0.45,cy-r*0.1);
    GX.quadraticCurveTo(cx,cy+r*0.12,cx+r*0.45,cy-r*0.18);
    GX.stroke();
    GX.fillStyle='#ffe9a0';
    GX.beginPath(); GX.arc(cx+r*0.2,cy-r*0.3,r*0.13,0,TAU); GX.fill();
    GX.beginPath(); GX.arc(cx-r*0.3,cy+r*0.25,r*0.09,0,TAU); GX.fill();
  }
}
function paintRocks(rand,stage,kind){
  const gold=(kind==='gold'), coal=(kind==='coal');
  const base=gold?'#b98f3e':(coal?'#3b3a3c':'#9aa0a6');
  GX.fillStyle='rgba(12,20,10,.28)';
  GX.beginPath(); GX.ellipse(3,4,21,8,0,0,TAU); GX.fill();
  const counts=[13,8,4], n=counts[stage];
  // kupac: alul szélesebb, fölfelé keskenyedő sorok
  const rows=[
    {y:2,   spread:19, r:6.2, k:5},
    {y:-4,  spread:14, r:6.0, k:4},
    {y:-10, spread:9,  r:5.4, k:3},
    {y:-15, spread:4,  r:4.6, k:1}
  ];
  let left=n;
  for(const row of rows){
    const k=Math.min(row.k,left); left-=k;
    for(let i=0;i<k;i++){
      const t=(k===1)?0:(i/(k-1)-0.5)*2;
      const x=t*row.spread+ (rand()-0.5)*3;
      const y=row.y+(rand()-0.5)*2.4;
      rockLump(x,y,row.r*(0.82+rand()*0.36),base,rand,gold,coal);
    }
    if(left<=0) break;
  }
  // néhány elgurult darab a kupac tövénél
  for(let i=0;i<(stage===2?4:2);i++){
    rockLump(-24+rand()*48,4+rand()*5,2.4+rand()*1.6,base,rand,gold,coal);
  }
}
function nodeSprite(type,variant,stage){
  const key=type+variant+stage;
  if(NODESPR[key]) return NODESPR[key];
  const m=NSPR[type];
  const c=document.createElement('canvas');
  c.width=Math.ceil(m.w*SPR_DPR); c.height=Math.ceil(m.h*SPR_DPR);
  const g=c.getContext('2d');
  g.setTransform(SPR_DPR,0,0,SPR_DPR,0,0);
  g.translate(m.ox,m.oy);
  const prev=GX; GX=g;
  const rand=seedRand('node'+key);
  if(type==='wood') paintTree(rand,stage);
  else paintRocks(rand,stage,type);
  GX=prev;
  NODESPR[key]=c;
  return c;
}
function drawNode(n){
  if(fogAt(n.x,n.y)===0) return;
  const x=n.x-G.cam.x, y=n.y-G.cam.y;
  if(x<-60||y<-70||x>G.vw+60||y>G.vh+60) return;
  if(n.type==='fish'){                            // halraj: hullámgyűrű és halak
    ctx.save(); ctx.translate(x,y);
    ctx.fillStyle='rgba(255,255,255,.16)';
    ctx.beginPath(); ctx.ellipse(0,0,n.r+3,(n.r+3)*0.55,0,0,TAU); ctx.fill();
    const ph=G.t*1.4+n.seed;
    for(let i=0;i<4;i++){
      const a=n.seed+i*1.6+ph*0.35, rr=n.r*0.55;
      const fx=Math.cos(a)*rr, fy=Math.sin(a)*rr*0.5;
      ctx.save(); ctx.translate(fx,fy); ctx.rotate(a+1.6);
      ctx.fillStyle=i%2?'#5b7f96':'#7fa3b6';
      ctx.beginPath(); ctx.ellipse(0,0,4.2,2,0,0,TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-4,0); ctx.lineTo(-7,-2.2); ctx.lineTo(-7,2.2); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle='rgba(255,255,255,.22)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.ellipse(0,0,n.r*(0.6+0.4*((ph%2)/2)),n.r*0.35,0,0,TAU); ctx.stroke();
    ctx.restore(); return;
  }
  // A kitermeltség három fokozatban látszik is
  const f=n.amount/(n.max||1);
  const stage=f>0.62?0:(f>0.26?1:2);
  const sp=nodeSprite(n.type,(n.id||0)%4,stage), m=NSPR[n.type];
  ctx.drawImage(sp,x-m.ox,y-m.oy,m.w,m.h);
}

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
