/* =======================================================================
   16/B. KÖDFÁTYOL

   A térképet 32 pixeles rácsra osztjuk, és minden cella három állapot
   egyike: felderítetlen (fekete), felderített (elhomályosított — az
   épületeket még emlékezetből látjuk), illetve belátott. A ködréteget
   egy apró, 107x75-ös vászonra festjük, és felnagyítva rajzoljuk a
   világra, így a böngésző simítása adja a lágy átmenetet — ez sokkal
   olcsóbb, mintha pixelenként rajzolnánk.
   ===================================================================== */
const FOG_CELL=32;
let FW=Math.ceil(WORLD.w/FOG_CELL), FH=Math.ceil(WORLD.h/FOG_CELL);
/* A pálya átméretezése. A ködrács minden tömbje (köd, víz, szikla, kopás)
   új játszmánál készül, ezért elég itt frissíteni a méreteket. */
function setWorldSize(w,h){
  WORLD.w=Math.round(w); WORLD.h=Math.round(h);
  FW=Math.ceil(WORLD.w/FOG_CELL);
  FH=Math.ceil(WORLD.h/FOG_CELL);
  // Az útkereső rács is a pálya méretét követi
  if(typeof navResize==='function') navResize();
}
let fogCv=null,fogCtx=null,fogImg=null,fogMid=null;
function initFog(){
  /* Félenként külön ködréteg. Korábban kettő volt: a tiéd és „a gépé” —
     minden bot ugyanazt a réteget használta. Több féllel ez azt jelentené,
     hogy amit az egyik bot felderít, azt az összes többi is látja.

     A G.fog és a G.fogE megmarad ABLAKNAK: az előbbi a helyi játékosé (ezt
     rajzoljuk ki), az utóbbi az első boté — így a mentés és a rajzolás
     változatlanul működik. */
  const db=Math.max(2,(G.oldalak&&G.oldalak.length)||2);
  G.fogs=[];
  for(let i=0;i<db;i++) G.fogs.push(new Uint8Array(FW*FH));
  G.fog=G.fogs[G.enId||0];
  G.fogE=G.fogs[1];
  G.fogT=0;
  /* A segédvásznakat MINDIG a mostani rácsmérethez igazítjuk.

     Korábban `if(!fogCv)` állt itt: egyszer készültek el, az első játszma
     méretével. Amióta a térkép mérete a felek számához igazodik (v4.8),
     ez elromlott: egy háromfeles játszma nagyobb világot kap, tehát a
     rács is szélesebb lesz — a régi, keskenyebb képadatba írva viszont a
     sorok elcsúsznak egymáshoz képest. A képernyőn ez VÍZSZINTES CSÍKOZÁS
     volt: hol felfedett, hol sötét sávok, össze-vissza.

     Ugyanez érintette a kalózvilágot is (háromszoros térkép), csak ott
     ritkábban került elő, mert a játszma többnyire abból indult. */
  if(!fogCv||fogCv.width!==FW||fogCv.height!==FH){
    if(!fogCv) fogCv=document.createElement('canvas');
    fogCv.width=FW; fogCv.height=FH;
    fogCtx=fogCv.getContext('2d');
    fogImg=fogCtx.createImageData(FW,FH);
    if(!fogMid) fogMid=document.createElement('canvas');
    /* A közbenső vászon fél-világ felbontáson: FOG_CELL/2 pixelt ad
       cellanként. Korábban 4× volt (≈850×600 px), ami 1280 px-es
       képernyőn még 1.5×-es nagyítást igényelt → kockás maradt.
       Fél-világ (≈1712×1200 px) már le kell kicsinyíteni a képernyőre,
       ami soha nem ad látható artefaktot. */
    fogMid.width=FW*(FOG_CELL/2); fogMid.height=FH*(FOG_CELL/2);
  }
}
/* Egy fél ködrétege. Ha nincs ilyen fél (menü, régi mentés), a régi
   kétrétegű válasz marad. */
function fogOf(owner){
  if(G.fogs&&G.fogs[owner]) return G.fogs[owner];
  return owner?G.fogE:G.fog;
}
function fogAt(x,y,owner){
  const f=fogOf(owner);
  if(!f) return 2;
  const cx=Math.floor(x/FOG_CELL), cy=Math.floor(y/FOG_CELL);
  if(cx<0||cy<0||cx>=FW||cy>=FH) return 0;
  return f[cy*FW+cx];
}
// Látja-e az adott fél a megadott egységet/épületet?
function seen(owner,e){
  const v=fogAt(e.x,e.y,owner);
  return e.kind==='build'?v>0:v===2;      // az épületek helyére emlékszünk
}
// Egy még felderítetlen pont keresése — a bot ide küld felderítőt
/* Felderítetlen pont keresése.

   SZIMULÁCIÓS véletlen kell hozzá: a bot ebből választ felderítési célt,
   tehát a világ állapotát érinti. Szabad véletlennel két azonos maggal
   indított játszmában más irányba indult a felderítő — húsz másodperc
   után ezen csúsztak szét a világok. */
function unexploredPoint(owner){
  const f=fogOf(owner)||G.fog;
  for(let i=0;i<120;i++){
    const cx=srangeInt(2,FW-3), cy=srangeInt(2,FH-3);
    if(!f[cy*FW+cx]) return {x:(cx+0.5)*FOG_CELL,y:(cy+0.5)*FOG_CELL};
  }
  return {x:srange(200,WORLD.w-200),y:srange(200,WORLD.h-200)};
}
function updateFog(dt){
  if(!G.fog) return;
  G.fogT-=dt; if(G.fogT>0) return;
  G.fogT=0.22;                                   // másodpercenként ötször elég
  const mark=(f,x,y,r)=>{
    const c0=Math.max(0,Math.floor((x-r)/FOG_CELL)), c1=Math.min(FW-1,Math.floor((x+r)/FOG_CELL));
    const r0=Math.max(0,Math.floor((y-r)/FOG_CELL)), r1=Math.min(FH-1,Math.floor((y+r)/FOG_CELL));
    const rc=r/FOG_CELL, rr=rc*rc, ccx=x/FOG_CELL, ccy=y/FOG_CELL;
    for(let ry=r0;ry<=r1;ry++){
      const dy=ry+0.5-ccy;
      for(let rx=c0;rx<=c1;rx++){
        const dx=rx+0.5-ccx;
        if(dx*dx+dy*dy<=rr) f[ry*FW+rx]=2;
      }
    }
  };
  /* Minden fél látóterét ugyanazzal a szabállyal frissítjük. A rétegek
     előbb fakulnak (2 → 1: „láttam már, de most nem látom”), aztán az
     egységeket és épületeket EGYSZER járjuk végig, és mindenki a saját
     rétegébe jelöl. Korábban félenként végigmentünk az összes egységen —
     tíz féllel az tízszeres munka lett volna. */
  const retegek=G.fogs||[G.fog,G.fogE];
  for(const f of retegek){
    if(!f) continue;
    for(let i=0;i<f.length;i++) if(f[i]===2) f[i]=1;
  }
  /* A napszak, az időjárás és a tengeri vihar az EMBER játékosok
     látótávát szűkíti. A botoknál ez eddig sem érvényesült — ha
     rájuk is kiterjesztenénk, megváltozna a megszokott nehézség. */
  const szorzo=[];
  for(let s=0;s<retegek.length;s++){
    const o=(typeof oldal==='function')?oldal(s):null;
    const ember=o?(o.tipus==='ember'):(s===0);
    const ejjel=(ember?((typeof sightMul==='function')?sightMul():1):1)
      *(ember?((typeof weatherSight==='function')?weatherSight():1):1)
      *(ember?((typeof seaSightMul==='function')?seaSightMul():1):1);
    const optika=(typeof upgMul2==='function')?upgMul2(s,'optics',0.12):1;
    szorzo[s]={egyseg:optika*ejjel, epulet:optika};
  }
  for(const u of G.units){
    const f=retegek[u.owner]; if(u.dead||!f) continue;
    /* A TEREP is beleszól: dombról messzebb látni, mocsárban és sűrű
       erdőben kevesebbet. Ez a legfontosabb következménye a magasságnak
       — nem a sebzés, hanem hogy előbb VESZED ÉSZRE az ellenséget. */
    const terep=(typeof terepLatas==='function')?terepLatas(u.x,u.y):1;
    mark(f,u.x,u.y,(u.role==='worker'?165:212)*(szorzo[u.owner]?szorzo[u.owner].egyseg:1)*terep);
  }
  for(const b of G.builds){
    const f=retegek[b.owner]; if(b.dead||!f) continue;
    mark(f,b.x,b.y,(b.type==='tower'?345:(b.type==='hq'?330:240))
      *(szorzo[b.owner]?szorzo[b.owner].epulet:1));
  }
  /* A kirajzolt köd mindig a HELYI játékosé. */
  const f=(G.fogs&&G.fogs[helyiFel()])||G.fog, d=fogImg.data;
  for(let i=0;i<f.length;i++){
    const v=f[i], o=i*4;
    d[o]=5; d[o+1]=7; d[o+2]=5;
    d[o+3]= v===2?0:(v===1?104:236);
  }
  fogCtx.putImageData(fogImg,0,0);
  // Két lépcsőben nagyítunk: a köztes vászon lágyítja a cellahatárokat,
  // különben a 32x-es nagyítás kockásra hagyná a köd peremét.
  const mg=fogMid.getContext('2d');
  mg.clearRect(0,0,fogMid.width,fogMid.height);
  mg.imageSmoothingEnabled=true;
  mg.imageSmoothingQuality='high';
  mg.drawImage(fogCv,0,0,fogMid.width,fogMid.height);
}
function drawFog(){
  if(!fogMid||!G.fog) return;
  const W=FW*FOG_CELL, H=FH*FOG_CELL;
  ctx.save();
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  // Csak a látható részt másoljuk ki, nem a teljes 3424x2400-as világot
  const vx0=clamp(G.cam.x,0,W), vy0=clamp(G.cam.y,0,H);
  const vx1=clamp(G.cam.x+G.vw,0,W), vy1=clamp(G.cam.y+G.vh,0,H);
  if(vx1>vx0+0.5&&vy1>vy0+0.5){
    ctx.drawImage(fogMid,
      vx0/W*fogMid.width, vy0/H*fogMid.height,
      (vx1-vx0)/W*fogMid.width, (vy1-vy0)/H*fogMid.height,
      vx0-G.cam.x, vy0-G.cam.y, vx1-vx0, vy1-vy0);
  }

  ctx.fillStyle='rgba(5,7,5,.94)';                 // a térképen kívüli sáv is sötét
  ctx.fillRect(-G.cam.x-3000,-G.cam.y+H,W+6000,3000);
  ctx.fillRect(-G.cam.x-3000,-G.cam.y-3000,W+6000,3000);
  ctx.fillRect(-G.cam.x-3000,-G.cam.y,3000,H);
  ctx.fillRect(-G.cam.x+W,-G.cam.y,3000,H);
  ctx.restore();
}
