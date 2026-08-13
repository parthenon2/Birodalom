/* =======================================================================
   13/G. A TENGER HULLÁMZÁSA

   A víz eddig állt. Most két zajréteg sodródik rajta, eltérő sebességgel
   és irányban — ettől él a tenger anélkül, hogy egyetlen ismétlődő elemet
   látnál. A napcsillanás a hullámokon fut, és a napszakkal halványul.

   (A fű nagyléptékű változatossága NEM itt van: azt a fűcsempébe festjük,
   mert külön rétegként teljes képernyős keverést igényelt volna.)
   ===================================================================== */

let hullamCv=null;

/* Sima értékzaj: rácspontokra sorsolt értékek, közöttük lágy átmenettel. */
function zajKep(meret, racs, mag){
  const c=document.createElement('canvas');
  c.width=meret; c.height=meret;
  const g=c.getContext('2d');
  const R=seedRand('zaj'+meret+racs+mag);
  const pont=[];
  for(let y=0;y<=racs;y++){
    pont[y]=[];
    for(let x=0;x<=racs;x++) pont[y][x]=R();
  }
  for(let y=0;y<racs;y++) pont[y][racs]=pont[y][0];      // vízszintesen ismételhető
  for(let x=0;x<=racs;x++) pont[racs][x]=pont[0][x];     // függőlegesen is
  const im=g.createImageData(meret,meret), d=im.data;
  const lep=meret/racs;
  const lagy=t=>t*t*(3-2*t);                             // sima átmenet
  for(let y=0;y<meret;y++) for(let x=0;x<meret;x++){
    const gx=Math.floor(x/lep), gy=Math.floor(y/lep);
    const tx=lagy((x-gx*lep)/lep), ty=lagy((y-gy*lep)/lep);
    const a=pont[gy][gx], b=pont[gy][gx+1];
    const c2=pont[gy+1][gx], d2=pont[gy+1][gx+1];
    const v=(a+(b-a)*tx)*(1-ty)+(c2+(d2-c2)*tx)*ty;
    const o=(y*meret+x)*4;
    const sz=Math.round(128+(v-0.5)*2*mag);
    d[o]=sz; d[o+1]=sz; d[o+2]=sz; d[o+3]=255;
  }
  g.putImageData(im,0,0);
  return c;
}
const HULLAM_M=190;                  // a csempe végleges mérete a pufferben
/* A hullámcsempe KÖZEPE ÁTLÁTSZÓ: a világos foltok fehérek, a sötétek
   kékesek, közöttük semmi. Így elég sima rárajzolással a képre tenni —
   nem kell „overlay" keverés, ami teljes képernyőn a rajzolási idő felét
   elvitte (244 ezredmásodpercből 160-at). */
function hullamKep(){
  if(hullamCv) return hullamCv;
  const S=96;
  const kicsi=document.createElement('canvas');
  kicsi.width=kicsi.height=S;
  const kg=kicsi.getContext('2d');
  const zaj=zajKep(S,10,64);
  const zd=zaj.getContext('2d').getImageData(0,0,S,S).data;
  const im=kg.createImageData(S,S), d=im.data;
  for(let i=0;i<S*S;i++){
    const v=(zd[i*4]-128)/128;                 // -1 .. 1
    const a=Math.min(1,Math.abs(v)*1.15);
    if(v>0){ d[i*4]=255; d[i*4+1]=252; d[i*4+2]=236; }
    else   { d[i*4]=38;  d[i*4+1]=74;  d[i*4+2]=104; }
    d[i*4+3]=Math.round(255*a);
  }
  kg.putImageData(im,0,0);
  hullamCv=document.createElement('canvas');
  hullamCv.width=HULLAM_M; hullamCv.height=HULLAM_M;
  const g=hullamCv.getContext('2d');
  g.imageSmoothingEnabled=true;
  g.drawImage(kicsi,0,0,HULLAM_M,HULLAM_M);
  return hullamCv;
}

/* --- HULLÁMZÁS: két sodródó zajréteg a vízen ---

   A rétegeket külön vászonra rajzoljuk, majd a LÁGY VÍZMASZKKAL vágjuk ki.
   Első nekifutásra cellánként vágtam, és a négyzetes szélek visszahozták
   pontosan azt a lépcsőzést, amit a partvonalnál megszüntettünk. */
let hullamBuf=null;

function drawWaterMotion(){
  if(REDUCED||G.lowFx||G.postFx===false||!G.water||!wetCv) return;
  /* ÖNVÉDELEM. A hullámzás teljes képernyős művelet: erős gépen ingyen van
     (a videokártya végzi), gyengén viszont drága. Ha a képkockaidő tartósan
     30 kép/mp alá esik, a réteg magától kimarad — inkább legyen sima a
     tenger, mint akadozó a játék. */
  if(typeof frameAvg==='number'&&frameAvg>34) return;
  /* CSAK A LÁTHATÓ VÍZ KÖRÉ dolgozunk. Egy szárazföldi pályán így egyetlen
     műveletet sem végzünk, a parton pedig csak a tengeres sávra. Korábban
     mindig a teljes képernyőt feldolgoztuk. */
  const v=viewCells(), S=FOG_CELL;
  let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9;
  for(let ry=v.r0;ry<=v.r1;ry++) for(let rx=v.c0;rx<=v.c1;rx++){
    if(!G.water[ry*FW+rx]) continue;
    if(rx<bx0)bx0=rx; if(rx>bx1)bx1=rx;
    if(ry<by0)by0=ry; if(ry>by1)by1=ry;
  }
  if(bx1<bx0) return;                                  // nincs víz a képen
  const vx0=Math.max(0,bx0*S-G.cam.x), vy0=Math.max(0,by0*S-G.cam.y);
  const vx1=Math.min(G.vw,(bx1+1)*S-G.cam.x), vy1=Math.min(G.vh,(by1+1)*S-G.cam.y);
  const vW=vx1-vx0, vH=vy1-vy0;
  if(vW<4||vH<4) return;
  const W=Math.max(2,Math.round(vW*0.34)), H=Math.max(2,Math.round(vH*0.34));
  if(!hullamBuf) hullamBuf=document.createElement('canvas');
  if(hullamBuf.width!==W||hullamBuf.height!==H){ hullamBuf.width=W; hullamBuf.height=H; }
  const b=hullamBuf.getContext('2d');
  b.setTransform(1,0,0,1,0,0);
  b.clearRect(0,0,W,H);

  // 1. a két sodródó zajréteg
  const kep=hullamKep();
  const M=HULLAM_M;
  b.imageSmoothingEnabled=false;                 // a csempe már kész méretű
  const retegek=[[0.22, 7, 2.5, 0.55],[0.13, -4.5, 5.5, 0.40]];
  b.globalCompositeOperation='source-over';
  for(const [lept, vx, vy, alfa] of retegek){
    b.globalAlpha=alfa;
    const ox=((-G.cam.x*lept*0.5 + G.t*vx) % M + M) % M;
    const oy=((-G.cam.y*lept*0.5 + G.t*vy) % M + M) % M;
    for(let y=oy-M;y<H;y+=M) for(let x=ox-M;x<W;x+=M)
      b.drawImage(kep, x, y, M, M);
  }

  // 2. napcsillanás a hullámokon
  const ej=(typeof nightFactor==='function')?nightFactor():0;
  if(ej<0.85){
    b.globalCompositeOperation='lighter';
    b.globalAlpha=0.34*(1-ej);
    b.fillStyle='#ffe9b8';
    for(let i=0;i<26;i++){
      const f=(i*0.618)%1;
      const x=((f*W*1.7)+G.t*11+i*27)%(W+40)-20;
      const y=((f*H*2.3)-G.t*4.5+i*19)%(H+40)-20;
      const r=1.2+((i%3)*0.9)+Math.sin(G.t*2+i)*0.5;
      b.beginPath();
      b.ellipse(x,y,r*2.2,r*0.7,-0.25,0,TAU);
      b.fill();
    }
  }

  // 3. kivágás a lágy vízmaszkkal
  b.globalCompositeOperation='destination-in';
  b.globalAlpha=1;
  b.imageSmoothingEnabled=true;
  b.imageSmoothingQuality='high';
  b.drawImage(wetCv,
    (G.cam.x+vx0)/S, (G.cam.y+vy0)/S, vW/S, vH/S,
    0, 0, W, H);

  // 4. rárajzoljuk a képre
  ctx.save();
  ctx.globalAlpha=0.40;               // sima rárajzolás: olcsó és elég
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  ctx.drawImage(hullamBuf, 0,0,W,H, vx0,vy0,vW,vH);
  ctx.restore();
}
