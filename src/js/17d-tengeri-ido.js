/* =======================================================================
   17/D. TENGERI IDŐJÁRÁS

   A Karib-tenger nem szélcsendes tó. Három állapot váltja egymást:

     SZÉLCSEND — a vitorlák lógnak, a hajók FELE sebességgel járnak.
                 A tenger tükörsima, a csillanás elhalványul.
     RENDES     — semmi különös.
     VIHAR      — a látótáv a felére esik, a hullámok sebzik a hajókat,
                 villám csap le, és tölcsér járja a vizet.

   A vihar három veszélye:
     NAGY HULLÁM — folyamatos, kis sebzés minden hajónak a nyílt vízen.
                   A parthoz közel gyengébb.
     VILLÁM      — időnként lecsap egy hajóra: nagy sebzés, és a legénység
                   is fogy. Az árbocot keresi, ezért a nagy hajó veszélyeztetettebb.
     TÖLCSÉR     — vízoszlop, ami vándorol. Ami a közelébe kerül, azt tépi.

   A szárazföldi időjárás (eső, hó) ettől független — az a 17/C modulban van.
   ===================================================================== */

const SEA_SZELCSEND=0, SEA_RENDES=1, SEA_VIHAR=2;
const SEA_NEV=['szélcsend','','vihar'];
const VIHAR_HULLAM=0.45;       // sebzés másodpercenként a nyílt vízen
const VIHAR_LATO=0.5;          // a látótáv szorzója viharban
const SZELCSEND_SEB=0.5;       // a sebesség szorzója szélcsendben

function seaInit(){
  G.sea={fajta:SEA_RENDES, ero:0, cel:0, t:0, kovetkezo:60+srnd()*70,
         villamT:0, villam:null, tolcser:null};
}
function seaAdat(){ if(!G.sea) seaInit(); return G.sea; }
function seaNev(){
  const s=seaAdat();
  if(s.ero<0.25) return '';
  return SEA_NEV[s.fajta]||'';
}
/* A hajók sebességének és látótávjának szorzója. */
function seaSpeedMul(){
  const s=seaAdat();
  if(s.fajta===SEA_SZELCSEND) return 1-(1-SZELCSEND_SEB)*s.ero;
  if(s.fajta===SEA_VIHAR) return 1-0.18*s.ero;
  return 1;
}
function seaSightMul(){
  const s=seaAdat();
  return (s.fajta===SEA_VIHAR)?(1-(1-VIHAR_LATO)*s.ero):1;
}

function seaTick(dt){
  if(!G.on) return;
  if(!G.sea) seaInit();
  const s=G.sea;
  s.t+=dt;
  // az erő lassan követi a célt, hogy ne csapjon át hirtelen
  s.ero+=clamp(s.cel-s.ero,-dt*0.09,dt*0.09);
  s.kovetkezo-=dt;
  if(s.kovetkezo<=0){
    s.kovetkezo=70+srnd()*90;
    const r=srnd();
    if(r<0.22){ s.fajta=SEA_VIHAR;      s.cel=0.55+srnd()*0.3; }
    else if(r<0.55){ s.fajta=SEA_SZELCSEND; s.cel=0.6+srnd()*0.4; }
    else { s.fajta=SEA_RENDES; s.cel=0; }
    if(s.fajta!==SEA_RENDES&&!G.pirate) s.cel*=0.5;   // szárazföldi pályán szelídebb
    if(s.cel>0.3&&G.pirate){
      toast(s.fajta===SEA_VIHAR?'Vihar közeleg a tengeren!':'Elállt a szél — a vitorlák lógnak.');
    }
  }
  if(s.fajta!==SEA_VIHAR||s.ero<0.3){ s.villam=null; s.tolcser=null; return; }

  /* --- NAGY HULLÁM: folyamatos sebzés a nyílt vízen --- */
  for(const u of G.units){
    if(u.dead||!u.naval) continue;
    const parton=(typeof waterDepth!=='undefined'&&waterDepth)
      ? (waterDepth[Math.floor(u.y/FOG_CELL)*FW+Math.floor(u.x/FOG_CELL)]||6) : 6;
    const nyilt=clamp((parton-1)/5,0.25,1);          // a parthoz közel gyengébb
    damage(u, VIHAR_HULLAM*s.ero*nyilt*dt, {owner:-1});
  }

  /* --- VILLÁM: időnként lecsap egy hajóra --- */
  s.villamT-=dt;
  if(s.villamT<=0){
    s.villamT=22+srnd()*30/Math.max(0.4,s.ero);   // jóval ritkábban csap le
    const hajok=G.units.filter(u=>!u.dead&&u.naval);
    if(hajok.length){
      // a magasabb árboc vonzza: a gálya kétszer akkora eséllyel
      const sulyok=hajok.map(u=>u.galleon?3:(u.role==='warship'?2:1));
      let ossz=0; for(const w of sulyok) ossz+=w;
      let r=srnd()*ossz, k=0;
      while(k<hajok.length&&(r-=sulyok[k])>0) k++;
      const cel=hajok[Math.min(k,hajok.length-1)];
      s.villam={x:cel.x, y:cel.y, t:0};
      damage(cel, 16+srnd()*14, {owner:-1});
      if(cel.crew) cel.crew=Math.max(0,cel.crew-cel.crewMax*0.03);
      G.fx.push({x:cel.x,y:cel.y,t:0,life:.8,type:'boom',r:26});
      G.shake=Math.min(1,(G.shake||0)+0.5);
      SFX.at('destroy',cel.x,cel.y,0.9);
      if(cel.owner===0) toast(T('uzVillam'));
    }
  }
  if(s.villam){ s.villam.t+=dt; if(s.villam.t>0.55) s.villam=null; }

  /* --- TÖLCSÉR: vándorló vízoszlop --- */
  if(!s.tolcser&&srnd()<dt*0.06){
    // nyílt vízen születik
    for(let i=0;i<40&&!s.tolcser;i++){
      const x=srnd()*WORLD.w, y=srnd()*WORLD.h;
      if(isWater(x,y)) s.tolcser={x,y, ir:srnd()*TAU, t:0, elet:26+srnd()*22};
    }
  }
  if(s.tolcser){
    const T=s.tolcser;
    T.t+=dt;
    T.ir+=dsin(T.t*0.4)*dt*0.5;
    const seb=42;
    const nx=T.x+dcos(T.ir)*seb*dt, ny=T.y+dsin(T.ir)*seb*dt;
    if(isWater(nx,ny)){ T.x=nx; T.y=ny; } else T.ir+=Math.PI*0.6;
    for(const u of G.units){
      if(u.dead||!u.naval) continue;
      const d=dist(u.x,u.y,T.x,T.y);
      if(d>110) continue;
      const k=1-d/110;
      damage(u, 9*k*dt, {owner:-1});
      // a tölcsér magához húzza a hajót
      const a=datan2(T.y-u.y,T.x-u.x);
      u.x+=dcos(a)*22*k*dt; u.y+=dsin(a)*22*k*dt;
      /* Az üzenet csak a HELYI félnek szól, a maghúzás viszont
         mindenkinél megtörténne — csakhogy a feltétel rövidre zár, tehát
         a másik gépen elmarad. Ettől elcsúszik a húzások száma.

         Megoldás: előbb húzunk (mindenkinél), és csak azután nézzük meg,
         kinek szól. Így a mag azonos ütemben halad minden gépen. */
      const jelez=srnd()<dt*0.6;
      if(jelez&&u.owner===helyiFel()) toast(T('uzTolcser'));
    }
    if(T.t>T.elet) s.tolcser=null;
  }
}

/* --- A vihar látványa --- */
function drawSeaWeather(){
  if(!G.sea||REDUCED) return;
  const s=G.sea;
  if(s.ero<0.15) return;

  // VILLÁM: egész képernyős villanás és a becsapódás vonala
  if(s.villam){
    const k=s.villam.t/0.55;
    ctx.save();
    ctx.globalAlpha=(1-k)*0.55;
    ctx.fillStyle='#e8f0ff';
    ctx.fillRect(0,0,G.vw,G.vh);
    // a becsapódás cikcakkja
    const x=s.villam.x-G.cam.x, y=s.villam.y-G.cam.y;
    ctx.globalAlpha=(1-k);
    ctx.strokeStyle='#ffffff'; ctx.lineWidth=3;
    ctx.beginPath();
    let px=x+srange(-40,40), py=-20;
    ctx.moveTo(px,py);
    for(let i=1;i<=6;i++){
      const t=i/6;
      px=x+(px-x)*0.45+srange(-16,16);
      py=y*t;
      ctx.lineTo(px,py);
    }
    ctx.lineTo(x,y);
    ctx.stroke();
    ctx.restore();
  }
  if(s.fajta!==SEA_VIHAR||s.ero<0.3) return;

  // NAGY HULLÁMOK: hosszú, sodródó tarajok a képen
  ctx.save();
  ctx.globalAlpha=0.20*s.ero;
  ctx.strokeStyle='#dceaf2'; ctx.lineWidth=2.2;
  const N=14;
  for(let i=0;i<N;i++){
    const f=(i*0.618)%1;
    const y=((f*G.vh*1.6)+G.t*46+i*61)%(G.vh+120)-60;
    const x=((f*G.vw)-G.t*30+i*97)%(G.vw+260)-130;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.quadraticCurveTo(x+60,y-9,x+130,y+2);
    ctx.stroke();
  }
  ctx.restore();

  // TÖLCSÉR: forgó vízoszlop
  if(s.tolcser){
    const T=s.tolcser;
    const x=T.x-G.cam.x, y=T.y-G.cam.y;
    if(x>-160&&y>-220&&x<G.vw+160&&y<G.vh+160){
      ctx.save();
      ctx.translate(x,y);
      // a talpánál kavargó víz
      ctx.globalAlpha=0.5;
      ctx.fillStyle='rgba(226,240,246,.6)';
      for(let i=0;i<7;i++){
        const a=T.t*3.2+i*TAU/7;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a)*34, Math.sin(a)*13, 18, 6, a, 0, TAU);
        ctx.fill();
      }
      // a tölcsér teste: felfelé keskenyedő, csavarodó oszlop
      ctx.globalAlpha=0.62;
      const H=190;
      for(let i=0;i<16;i++){
        const t=i/16;
        const yy=-t*H;
        const sz=30*(1-t*0.72);
        const csav=dsin(T.t*2.6+t*7)*10*(1-t*0.4);
        ctx.fillStyle='rgba('+(190-t*40)+','+(206-t*36)+','+(216-t*28)+',0.5)';
        ctx.beginPath();
        ctx.ellipse(csav, yy, sz, sz*0.34, 0, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}
