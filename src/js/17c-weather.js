/* =======================================================================
   17/C. IDŐJÁRÁS

   Néhány percenként fordul az idő. Nem díszlet: esőben rosszabb a látás,
   a hó pedig lelassítja a menetet.

     ESŐ  — ferde csíkok, sötétebb és tompább talaj, tócsák a földön.
            A látótáv 12%-kal csökken.
     HÓ   — lassan hulló pelyhek, fehéredő táj. A menet 10%-kal lassabb.
            Csak a 20. században vagy hegyvidéken esik.

   A beállításokban kikapcsolható.
   ===================================================================== */

const W_TISZTA=0, W_ESO=1, W_HO=2, W_KOD=3;

/* --- SÁR ---
   Az eső nem áll el nyomtalanul: a föld felázik, és a menet még sokáig
   nehéz marad. A sár lassan gyűlik az esőben, és még lassabban szárad —
   ezért egy zápor a csata KÖZBEN is megváltoztathatja az erőviszonyokat,
   nem csak amíg esik.

   Ez a szimulációt érinti (sebesség), tehát a szimulációs magból hajtott
   időjárásból következik, és minden gépen ugyanaz. */
const SAR_NO=0.11, SAR_SZARAD=0.017, SAR_LASSU=0.26;
const W_MIN=110, W_MAX=210;          // ennyi másodpercenként fordul az idő
const W_ESELY=0.45;                  // ekkora eséllyel lesz egyáltalán idő

function weatherInit(){
  G.weather={fajta:W_TISZTA, ero:0, cel:0, t:W_MIN+srnd()*(W_MAX-W_MIN)};
  G.puddles=[]; G.snowDepth=0; G.sar=0;
}
function weatherName(){
  const w=G.weather;
  if(!w||w.ero<0.08) return (G.sar>0.25)?T('idoSaros'):T('idoDerult');
  if(w.fajta===W_ESO) return T('idoEso');
  if(w.fajta===W_KOD) return T('idoKod');
  return T('idoHo');
}
// Havazhat-e most? A hó a modern korhoz és a hegyekhez tartozik.
function hoLehet(){
  return G.age>=3 || G.mapType==='hegy' || G.mapType==='puszta';
}
function weatherTick(dt){
  if(!G.on) return;
  if(!G.weatherOn){ if(G.weather) G.weather.ero=0; return; }
  if(!G.weather) weatherInit();
  const w=G.weather;
  // az erősség lassan közelít a célértékhez — nem kapcsol be egyik pillanatról a másikra
  w.ero+=(w.cel-w.ero)*Math.min(1,dt*0.25);
  w.t-=dt;
  if(w.t<=0){
    w.t=W_MIN+srnd()*(W_MAX-W_MIN);
    if(w.cel>0.1){ w.cel=0; }                       // ami esett, most eláll
    else if(srnd()<W_ESELY){
      /* Három fajta: eső, hó, köd. A köd a mélyföldek és a hajnal
         időjárása — mindenütt előfordulhat, de ritkábban. */
      const r=srnd();
      if(hoLehet()&&r<0.42) w.fajta=W_HO;
      else if(r<0.66) w.fajta=W_KOD;
      else w.fajta=W_ESO;
      w.cel=0.55+srnd()*0.45;
      toast(w.fajta===W_ESO?T('idoEsoJon'):(w.fajta===W_KOD?T('idoKodJon'):T('idoHoJon')));
    }
  }
  /* A SÁR gyűlik az esőben és lassan szárad. A hó nem sároz — az fagy,
     nem áztat —, de olvadás után igen; ezt egyszerűsítve úgy vesszük,
     hogy a hó is hagy némi felázást, csak harmadannyit. */
  {
    const eso=(w.fajta===W_ESO)?w.ero:((w.fajta===W_HO)?w.ero*0.34:0);
    if(eso>0.2) G.sar=Math.min(1,(G.sar||0)+SAR_NO*eso*dt);
    else G.sar=Math.max(0,(G.sar||0)-SAR_SZARAD*dt);
  }

  // tócsák gyűlnek esőben, és felszáradnak utána
  if(w.fajta===W_ESO&&w.ero>0.4){
    if(!G.puddles) G.puddles=[];
    if(G.puddles.length<26&&srnd()<dt*3){
      for(let i=0;i<20;i++){
        const x=srange(60,WORLD.w-60), y=srange(60,WORLD.h-60);
        if(onLand(x,y)){ G.puddles.push({x,y,r:9+srnd()*16,a:0}); break; }
      }
    }
    for(const p of G.puddles) p.a=Math.min(1,p.a+dt*0.35);
  }else if(G.puddles){
    for(let i=G.puddles.length-1;i>=0;i--){
      G.puddles[i].a-=dt*0.12;
      if(G.puddles[i].a<=0) G.puddles.splice(i,1);
    }
  }
  // hó gyűlik a földön, majd elolvad
  const cel=(w.fajta===W_HO)?w.ero:0;
  G.snowDepth=(G.snowDepth||0)+(cel-(G.snowDepth||0))*Math.min(1,dt*0.08);
}
/* Az időjárás hatásai — a köd és a mozgás ezeket kérdezi. */
function weatherSight(){
  const w=G.weather;
  if(!w||!G.weatherOn) return 1;
  /* A KÖD a legerősebb látásrontó: sűrűjében alig húsz lépésre látni.
     Ezért ez az egyetlen időjárás, ami önmagában megfordíthat egy
     rajtaütést — aki ismeri a terepet, előnybe kerül. */
  if(w.fajta===W_KOD) return 1-0.45*w.ero;
  if(w.fajta===W_ESO) return 1-0.12*w.ero;
  return 1-0.05*w.ero;
}
function weatherSpeed(){
  const w=G.weather;
  if(!w||!G.weatherOn) return 1;
  let m=1;
  if(w.fajta===W_HO) m*=1-0.10*w.ero;
  /* A SÁR akkor is lassít, ha már elállt az eső. */
  m*=1-SAR_LASSU*(G.sar||0);
  return m;
}
/* --- A TÉL LASSÍTJA A TERMELÉST ---
   A fagyott földből nehezebb kitermelni, a majorság alig ad. Ez az
   ÉVSZAKHOZ kötődik, nem az időjáráshoz: a 20. század tele állandó, nem
   pár percre jön. Így a késői korszakoknak saját gazdasági jellege lesz —
   több egység, de nehezebb ellátni őket. */
function evszakTermeles(){
  const st=(typeof AGES!=='undefined'&&AGES[G.age])?AGES[G.age].style:null;
  if(!st) return 1;
  if(st.evszak==='tel') return 0.82;
  if(st.evszak==='osz') return 0.94;
  return 1;
}

/* --- rajzolás --- */
// A talajra kerülő réteg: tócsák és hótakaró. A világ rajza után jön.
function drawGroundWeather(){
  if(REDUCED||!G.weatherOn) return;
  const w=G.weather;
  if(!w) return;
  // hótakaró
  if((G.snowDepth||0)>0.02){
    ctx.save();
    ctx.fillStyle='rgba(238,244,250,'+(0.42*G.snowDepth).toFixed(3)+')';
    ctx.fillRect(0,0,G.vw,G.vh);
    ctx.restore();
  }
  // tócsák
  if(G.puddles&&G.puddles.length){
    ctx.save();
    for(const p of G.puddles){
      const x=p.x-G.cam.x, y=p.y-G.cam.y;
      if(x<-40||y<-40||x>G.vw+40||y>G.vh+40) continue;
      ctx.fillStyle='rgba(58,78,96,'+(0.30*p.a).toFixed(3)+')';
      ctx.beginPath(); ctx.ellipse(x,y,p.r,p.r*0.42,0,0,TAU); ctx.fill();
      ctx.fillStyle='rgba(180,205,220,'+(0.16*p.a).toFixed(3)+')';
      ctx.beginPath(); ctx.ellipse(x-p.r*0.2,y-p.r*0.1,p.r*0.45,p.r*0.16,0,0,TAU); ctx.fill();
    }
    ctx.restore();
  }
}
// A csapadék maga: minden fölött, a felület alatt.
function drawWeather(){
  if(REDUCED||G.lowFx||!G.weatherOn) return;
  const w=G.weather;
  if(!w||w.ero<0.05) return;
  ctx.save();
  if(w.fajta===W_ESO){
    // az eső tompítja és hűti a színeket
    ctx.fillStyle='rgba(40,54,78,'+(0.20*w.ero).toFixed(3)+')';
    ctx.fillRect(0,0,G.vw,G.vh);
    const db=Math.round(150*w.ero);
    ctx.strokeStyle='rgba(196,214,232,'+(0.34*w.ero).toFixed(3)+')';
    ctx.lineWidth=1.1;
    ctx.beginPath();
    for(let i=0;i<db;i++){
      const f=(i*0.618)%1;
      const x=((f*G.vw*1.7)+(G.t*520)%G.vw*0)%(G.vw+120)-60;
      const y=((f*G.vh*2.3)+G.t*940+i*37)%(G.vh+120)-60;
      ctx.moveTo(x,y); ctx.lineTo(x-7,y+18);
    }
    ctx.stroke();
    // becsapódó cseppek a földön
    ctx.strokeStyle='rgba(210,228,240,'+(0.22*w.ero).toFixed(3)+')';
    ctx.lineWidth=0.9;
    ctx.beginPath();
    for(let i=0;i<Math.round(26*w.ero);i++){
      const x=((i*173+Math.floor(G.t*6)*97)%G.vw);
      const y=((i*311+Math.floor(G.t*6)*53)%G.vh);
      const r=2+((i+Math.floor(G.t*6))%3);
      ctx.moveTo(x-r,y); ctx.arc(x,y,r,Math.PI,TAU);
    }
    ctx.stroke();
  }else{
    // hó: lassan hulló, kissé oldalra sodródó pelyhek
    ctx.fillStyle='rgba(246,250,255,'+(0.75*w.ero).toFixed(3)+')';
    const db=Math.round(120*w.ero);
    for(let i=0;i<db;i++){
      const f=(i*0.618)%1;
      const alap=(f*G.vh*2.1)+G.t*46+i*29;
      const y=alap%(G.vh+60)-30;
      const x=((f*G.vw*1.9)+dsin(G.t*0.7+i)*26)%(G.vw+60)-30;
      const r=1+((i%3)*0.7);
      ctx.beginPath(); ctx.arc(x,y,r,0,TAU); ctx.fill();
    }
  }
  ctx.restore();
}
