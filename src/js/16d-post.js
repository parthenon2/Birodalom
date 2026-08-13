/* =======================================================================
   16/D. UTÓMUNKA ÉS FÉNY

   Öt réteg, ami a rajzolt képet modernné teszi. Mindegyik olcsó: egyetlen
   teljes képernyős művelet vagy néhány gyorsítótárazott kép.

     KONTAKTÁRNYÉK  — puha folt az egységek alatt. Enélkül a katonák
                      ráragasztottnak látszanak a fűre.
     FÉNYIRÁNY      — a nap felőli oldal világosabb, a túlsó sötétebb.
                      Ugyanabból a napállásból, amiből az árnyék jön.
     SZÍNHANGOLÁS   — a zöld visszafogása. A kontraszt a fényből jöjjön,
                      ne a színerőből.
     RAGYOGÁS       — a tűz, a torkolattűz és a lámpák túlcsordulnak.
     VIGNETTA + SZEMCSE — a kép széle sötétedik, és halvány filmszemcse
                      töri meg a digitális laposságot.
   ===================================================================== */

const POST_DESAT=0.24;      // ennyivel fogjuk vissza a színt
const POST_VIGN=0.40;       // a sarkok sötétedése
const POST_GRAIN=0.030;     // a szemcse erőssége

let glowCv=null, grainCv=null, vignCv=null, vignW=0, vignH=0;

/* ÖNVÉDELEM A DRÁGA RÉTEGEKRE.

   A színhangolás és a tónus teljes képernyős KEVERÉSI műveletek. Erős
   gépen a videokártya végzi, szinte ingyen — gyengén viszont mindkettő
   kétszáz ezredmásodpercbe kerül. Ha a képkockaidő tartósan 38 kép/mp alá
   esik, ez a kettő kimarad; a ragyogás, a vignetta és a szemcse marad,
   mert azok olcsók.

   (Ezt korábban „ingyennek" mértem — de akkor a réteg egyáltalán nem
   futott le, mert a hívása kimaradt a hurokból.) */
function postDraga(){
  return !(typeof frameAvg==='number'&&frameAvg>26);
}

/* Puha fényfolt — a ragyogáshoz és a kontaktárnyékhoz is ez a korong. */
function postGlow(){
  if(glowCv) return glowCv;
  const S=96;
  glowCv=document.createElement('canvas'); glowCv.width=S; glowCv.height=S;
  const g=glowCv.getContext('2d');
  const gr=g.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);
  gr.addColorStop(0,'rgba(255,255,255,1)');
  gr.addColorStop(0.45,'rgba(255,255,255,0.34)');
  gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr; g.fillRect(0,0,S,S);
  return glowCv;
}
/* Filmszemcse: egyszer generált zajlap, amit odébb csúsztatva ismételünk. */
function postGrain(){
  if(grainCv) return grainCv;
  const S=128;
  grainCv=document.createElement('canvas'); grainCv.width=S; grainCv.height=S;
  const g=grainCv.getContext('2d');
  const im=g.createImageData(S,S), d=im.data;
  for(let i=0;i<S*S;i++){
    const v=180+Math.random()*150;
    d[i*4]=v; d[i*4+1]=v; d[i*4+2]=v; d[i*4+3]=255;
  }
  g.putImageData(im,0,0);
  return grainCv;
}

/* --- 1. KONTAKTÁRNYÉK ---
   Az egység alatt puha folt, a naptól elfelé tolva. Az épületeknek már van
   vetett árnyékuk; ez a katonákat és a hajókat teszi a talajra. */
function contactShadow(u){
  if(REDUCED||G.postFx===false) return;
  const s=(typeof sunShadow==='function')?sunShadow():{dx:0.34,dy:0.17};
  const r=(u.r||10)*1.25;
  const ox=r*s.dx*0.9, oy=r*s.dy*0.9+2;
  ctx.save();
  ctx.globalAlpha=u.naval?0.20:0.34;
  ctx.drawImage(postGlow(), u.x-G.cam.x+ox-r, u.y-G.cam.y+oy-r*0.42, r*2, r*0.84);
  ctx.restore();
}

/* --- 2. FÉNYIRÁNY ---
   Egyetlen ferde átmenet az egész képen: a nap felőli sarok melegebb és
   világosabb, a túlsó hidegebb és sötétebb. Ettől a lapos felületek is
   térbelinek tűnnek, mert a szem egységes megvilágítást lát. */
function drawLightDir(){
  if(REDUCED||G.postFx===false||!postDraga()) return;
  const s=(typeof sunShadow==='function')?sunShadow():{dx:0.34,dy:0.17};
  const ej=(typeof nightFactor==='function')?nightFactor():0;
  const ero=0.28*(1-ej*0.8);
  if(ero<0.01) return;
  // a nap iránya: az árnyékkal ELLENTÉTES
  const nx=-s.dx, ny=-Math.abs(s.dy);
  const h=Math.hypot(nx,ny)||1;
  const g=ctx.createLinearGradient(
    G.vw*0.5 - nx/h*G.vw*0.75, G.vh*0.5 - ny/h*G.vh*0.75,
    G.vw*0.5 + nx/h*G.vw*0.75, G.vh*0.5 + ny/h*G.vh*0.75);
  g.addColorStop(0,'rgba(20,26,44,'+(ero*0.9)+')');      // árnyékos oldal
  g.addColorStop(0.5,'rgba(255,246,225,0)');
  g.addColorStop(1,'rgba(255,240,205,'+ero+')');         // napos oldal
  ctx.save();
  ctx.globalCompositeOperation='overlay';
  ctx.fillStyle=g;
  ctx.fillRect(0,0,G.vw,G.vh);
  ctx.restore();
}

/* --- 3-5. UTÓMUNKA --- */
function drawPost(){
  if(REDUCED||G.postFx===false) return;
  const W=G.vw, H=G.vh;

  // SZÍNHANGOLÁS: a telítettség visszafogása. A szürke réteg „saturation"
  // keveréssel pontosan ezt csinálja, alfával adagolva.
  if(POST_DESAT>0.005&&postDraga()){
    ctx.save();
    ctx.globalCompositeOperation='saturation';
    ctx.globalAlpha=POST_DESAT;
    ctx.fillStyle='#808080';
    ctx.fillRect(0,0,W,H);
    ctx.restore();
  }

  // RAGYOGÁS: a fényes effektusok túlcsordulnak a környezetükre
  if(!G.lowFx&&G.fx&&G.fx.length){
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    const gl=postGlow();
    for(const f of G.fx){
      if(f.t<0) continue;
      let r=0, a=0, szin=null;
      if(f.type==='agyu'){ r=34*(f.ero||1); a=0.5*(1-f.t/f.life); szin='#ffd899'; }
      else if(f.type==='boom'||f.type==='bomb'){ r=52; a=0.42*(1-f.t/f.life); szin='#ffb15e'; }
      else if(f.type==='tuz'||f.type==='fire'){ r=30; a=0.34; szin='#ff9a3c'; }
      if(!szin||a<=0.01) continue;
      const x=f.x-G.cam.x, y=f.y-G.cam.y;
      if(x<-r||y<-r||x>W+r||y>H+r) continue;
      ctx.globalAlpha=a;
      // a korong fehér: színezni egy fedő réteggel tudjuk
      ctx.drawImage(gl, x-r, y-r, r*2, r*2);
    }
    ctx.restore();
  }

  /* TÓNUS: a lapos digitális kép attól él, ha az árnyékok hidegek és
     mélyebbek, a csúcsfények pedig melegek. Egy „soft-light" réteg
     pontosan ezt adja, a kép tartalmának megtartásával. */
  if(postDraga()){
    const g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'rgba(255,238,205,0.16)');
    g.addColorStop(0.55,'rgba(128,128,128,0)');
    g.addColorStop(1,'rgba(28,36,62,0.22)');
    ctx.save();
    ctx.globalCompositeOperation='soft-light';
    ctx.fillStyle=g;
    ctx.fillRect(0,0,W,H);
    ctx.restore();
  }

  // VIGNETTA: a sarkok felé sötétedő keret, gyorsítótárazva
  if(!vignCv||vignW!==Math.round(W)||vignH!==Math.round(H)){
    vignW=Math.round(W); vignH=Math.round(H);
    vignCv=document.createElement('canvas');
    vignCv.width=Math.max(1,vignW); vignCv.height=Math.max(1,vignH);
    const g=vignCv.getContext('2d');
    const gr=g.createRadialGradient(vignW/2,vignH/2,Math.min(vignW,vignH)*0.32,
                                    vignW/2,vignH/2,Math.max(vignW,vignH)*0.72);
    gr.addColorStop(0,'rgba(0,0,0,0)');
    gr.addColorStop(1,'rgba(0,0,0,'+POST_VIGN+')');
    g.fillStyle=gr; g.fillRect(0,0,vignW,vignH);
  }
  if(vignCv) ctx.drawImage(vignCv,0,0);

  // FILMSZEMCSE: a zajlapot képkockánként odébb csúsztatjuk
  if(!G.lowFx&&POST_GRAIN>0.004){
    const gc=postGrain();
    ctx.save();
    ctx.globalCompositeOperation='overlay';
    ctx.globalAlpha=POST_GRAIN;
    const ox=-((G.t*37)%128), oy=-((G.t*23)%128);
    for(let y=oy;y<H;y+=128) for(let x=ox;x<W;x+=128) ctx.drawImage(gc,x,y);
    ctx.restore();
  }
}
