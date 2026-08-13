/* =======================================================================
   17/B. NAPPAL ÉS ÉJSZAKA

   A világ órája hat perc alatt fordul egyet: négy perc nappal, kettő
   éjszaka, közte hajnal és alkony. Éjjel a látótáv a felére csökken —
   ezért az éjszakai rajtaütés valódi taktika: közelebb juthatsz észrevétlen.

   A sötétséget nem a ködre rajzoljuk, hanem külön rétegre: a fényforrások
   (bázis, torony, kikötő, tábortüzek) kilyukasztják belőle a maguk körét,
   így meleg fénykörök úsznak a kék éjszakában.

   A beállításokban kikapcsolható.
   ===================================================================== */

const DAY_LEN=360;            // egy teljes nap-éjszaka ciklus másodpercben
const NIGHT_FROM=0.62, NIGHT_TO=0.94;   // az éjszaka a ciklus ezen szakasza
const NIGHT_SIGHT=0.55;       // éjjel ennyiszeres a látótáv
const DUSK=0.07;              // ilyen hosszan úszik át hajnal és alkony

let nightCv=null, nightCtx=null;
let fenyCv=null, melegCv=null;
/* Kivágó fénykorong: kifelé halványuló fekete korong. A sötét rétegből
   ezzel lyukasztunk. */
function fenyKorong(){
  if(fenyCv) return fenyCv;
  const S=128;
  fenyCv=document.createElement('canvas'); fenyCv.width=S; fenyCv.height=S;
  const g=fenyCv.getContext('2d');
  const gr=g.createRadialGradient(S/2,S/2,S*0.07,S/2,S/2,S/2);
  gr.addColorStop(0,'rgba(0,0,0,1)');
  gr.addColorStop(0.55,'rgba(0,0,0,0.55)');
  gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr; g.fillRect(0,0,S,S);
  return fenyCv;
}
/* Meleg lámpafény, amit a sötét fölé keverünk. */
function melegKorong(){
  if(melegCv) return melegCv;
  const S=128;
  melegCv=document.createElement('canvas'); melegCv.width=S; melegCv.height=S;
  const g=melegCv.getContext('2d');
  const gr=g.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);
  gr.addColorStop(0,'rgba(255,190,90,1)');
  gr.addColorStop(1,'rgba(255,190,90,0)');
  g.fillStyle=gr; g.fillRect(0,0,S,S);
  return melegCv;
}

/* Hol tartunk a napban? 0 = hajnal előtt, 0.5 = dél, 0.8 = éjfél */
function timeOfDay(){
  if(!G.dayNight) return 0.25;                  // kikapcsolva: örök délelőtt
  return ((G.t+DAY_LEN*0.18)%DAY_LEN)/DAY_LEN;
}
/* Mennyire sötét van? 0 = teljes nappal, 1 = mély éjszaka */
function nightFactor(){
  if(!G.dayNight) return 0;
  const t=timeOfDay();
  if(t<NIGHT_FROM-DUSK) return 0;
  if(t<NIGHT_FROM) return (t-(NIGHT_FROM-DUSK))/DUSK;      // alkony
  if(t<NIGHT_TO) return 1;                                  // éjszaka
  if(t<NIGHT_TO+DUSK) return 1-(t-NIGHT_TO)/DUSK;           // hajnal
  return 0;
}
function todName(){
  const n=nightFactor();
  if(n<=0.02) return 'nappal';
  if(n>=0.98) return 'éjszaka';
  return (timeOfDay()<NIGHT_FROM+0.1)?'alkony':'hajnal';
}
// A látótáv szorzója — a ködszámítás ezt kéri
function sightMul(){
  return 1-(1-NIGHT_SIGHT)*nightFactor();
}

/* A nap állása. Reggel keleten alacsonyan áll, ezért az árnyék hosszan
   nyugatra nyúlik; délben magasan, rövid árnyékkal; este fordítva.
   A visszaadott érték: az árnyék iránya és hosszszorzója. */
function sunShadow(){
  if(!G.dayNight) return {dx:0.34, dy:0.17, len:1};
  const t=timeOfDay();
  // a nappali szakasz 0..NIGHT_FROM között telik; ezt képezzük -1..1-re
  const nap=Math.min(1,Math.max(0,t/NIGHT_FROM));
  const szog=(nap-0.5)*2;                       // -1 reggel, 0 dél, +1 este
  const magas=Math.cos(szog*1.15);              // délben a legmagasabb
  const hossz=1/Math.max(0.42,magas);           // alacsony nap: hosszú árnyék
  return {
    dx: 0.34*hossz*szog*1.9,                    // reggel nyugatra, este keletre
    dy: 0.17*Math.max(0.5,hossz*0.8),
    len: hossz
  };
}
/* Színhangolás: a napszak festi át a képet. Hajnalban hideg kék, délelőtt
   arany, délben semleges, alkonyatkor borostyán. */
function drawTint(){
  if(!G.dayNight) return;
  const t=timeOfDay();
  let szin=null, ero=0;
  if(t<0.10){        szin=[120,150,210]; ero=0.16*(1-t/0.10); }          // hajnali kék
  else if(t<0.30){   szin=[255,208,130]; ero=0.13*(1-(t-0.10)/0.20); }   // délelőtti arany
  else if(t<0.46){   szin=[255,252,245]; ero=0.05; }                     // déli fehér
  else if(t<NIGHT_FROM){ szin=[248,168,86]; ero=0.06+0.16*((t-0.46)/(NIGHT_FROM-0.46)); } // alkonyi borostyán
  if(!szin||ero<=0.005) return;
  ctx.save();
  ctx.globalCompositeOperation='overlay';
  ctx.fillStyle='rgba('+szin[0]+','+szin[1]+','+szin[2]+','+ero+')';
  ctx.fillRect(0,0,G.vw,G.vh);
  ctx.restore();
}

/* A sötét réteg kirajzolása a világ fölé, a fényekkel együtt. */
function drawNight(){
  const n=nightFactor();
  if(n<=0.01) return;
  /* Takarékos módban nincs fényréteg: csak egy egyszerű sötétítés.
     Így a gyengébb telefon sem esik be az éjszakától. */
  if(G.lowFx||REDUCED){
    ctx.save();
    ctx.fillStyle='rgba(10,18,48,'+(0.42*n).toFixed(3)+')';
    ctx.fillRect(0,0,G.vw,G.vh);
    ctx.restore();
    return;
  }
  /* A fényréteget FÉL felbontáson rajzoljuk, és úgy nagyítjuk vissza.
     A fény lágy, a különbség nem látszik — a teljes képernyős keverés
     költsége viszont a negyedére esik. */
  const FEL=0.5;
  const w=Math.max(1,Math.ceil(G.view.w*FEL)), h=Math.max(1,Math.ceil(G.view.h*FEL));
  if(!nightCv||nightCv.width!==w||nightCv.height!==h){
    nightCv=document.createElement('canvas');
    nightCv.width=w; nightCv.height=h;
    nightCtx=nightCv.getContext('2d');
  }
  if(!nightCtx) return;
  const g=nightCtx;
  g.setTransform(1,0,0,1,0,0);
  g.clearRect(0,0,w,h);
  // az éjszaka színe: hideg kék, alkonykor bíborba hajlik
  const t=timeOfDay();
  const alkony=(t<NIGHT_FROM+0.04&&t>NIGHT_FROM-DUSK);
  g.fillStyle=alkony?'rgba(44,20,52,'+(0.62*n)+')':'rgba(8,16,54,'+(0.74*n)+')';
  g.fillRect(0,0,w,h);

  // a fények kilyukasztják a sötétet
  /* A fénykorongot EGYSZER rajzoljuk meg, és onnantól csak nagyítva
     másoljuk. Korábban minden fényforráshoz új színátmenet készült
     képkockánként — hatvan egységnél ez önmagában 19 ezredmásodperc volt. */
  g.globalCompositeOperation='destination-out';
  const korong=fenyKorong();
  const feny=(x,y,r,ero)=>{
    const sx=(x-G.cam.x)*G.zoom*FEL, sy=(y-G.cam.y)*G.zoom*FEL;
    const R=r*G.zoom*FEL;
    if(sx<-R||sy<-R||sx>w+R||sy>h+R) return;
    g.globalAlpha=ero;
    g.drawImage(korong, sx-R, sy-R, R*2, R*2);
    g.globalAlpha=1;
  };
  for(const b of G.builds){
    if(b.dead||!b.done) continue;
    if(!enyemVagySzovetseges(b.owner)&&!seen(helyiFel(),b)) continue;
    const t2=b.type;
    if(t2==='hq')            feny(b.x,b.y,132,0.82);
    else if(t2==='tower')    feny(b.x,b.y,104,0.78);
    else if(t2==='harbor')   feny(b.x,b.y,92,0.72);
    else if(t2==='smith')    feny(b.x,b.y,84,0.86);   // a kohó erősen világít
    else if(t2==='market'||t2==='hospital'||t2==='temple') feny(b.x,b.y,80,0.66);
    else                     feny(b.x,b.y,58,0.52);
  }
  // az egységek fáklyája
  for(const u of G.units){
    if(u.dead||u.owner!==0) continue;
    feny(u.x,u.y,u.hero?76:40,u.hero?0.7:0.4);   // fáklyafény, szűk körben
  }
  // tüzek és robbanások
  for(const f of G.fx){
    if(f.type==='boom'||f.type==='bomb') feny(f.x,f.y,120,0.95);
  }
  for(const w2 of (G.wrecks||[])) if(w2.becsapodott) feny(w2.x,w2.y,80,0.8);

  g.globalCompositeOperation='source-over';
  // a meleg fény visszacsempészése a lámpák köré
  g.globalCompositeOperation='lighter';
  const meleg=melegKorong();
  for(const b of G.builds){
    if(b.dead||!b.done||(!enyemVagySzovetseges(b.owner)&&!seen(helyiFel(),b))) continue;
    const sx=(b.x-G.cam.x)*G.zoom*FEL, sy=(b.y-G.cam.y)*G.zoom*FEL;
    const R=(b.type==='hq'?90:60)*G.zoom*FEL;
    if(sx<-R||sy<-R||sx>w+R||sy>h+R) continue;
    g.globalAlpha=0.16*n;
    g.drawImage(meleg, sx-R, sy-R, R*2, R*2);
    g.globalAlpha=1;
  }
  g.globalCompositeOperation='source-over';

  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  const dpr=Math.min(window.devicePixelRatio||1,2);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.drawImage(nightCv,0,0,G.view.w,G.view.h);   // fél felbontásról visszanagyítva
  ctx.restore();
}
