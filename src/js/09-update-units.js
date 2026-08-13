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
