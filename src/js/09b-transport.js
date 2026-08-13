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
