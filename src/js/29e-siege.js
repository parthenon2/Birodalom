/* ENID — a HELYI játékos sorszáma. Hálózati játszmában nem feltétlenül
   nulla: te lehetsz a 2. vagy a 4. fél is. Korábban a parancsok, a
   kijelölés és a felület mindenütt a 0-s félre hivatkozott, ezért
   hálózaton nem tudtad kijelölni a saját egységeidet, és nem tudtál
   építeni sem. */
/* =======================================================================
   29/E. VÁROSOK OSTROMA

   A Karib-tenger városai nem díszletek: mindegyiknek van LAKOSSÁGA és
   VÉDELME, és el lehet foglalni őket.

     LAKOSSÁG  — játszmánként más (250–900 fő). Ez a város ellenállása:
                 amíg áll, a partraszállás visszaverhető.
     TORONY    — legfeljebb NÉGY. Amíg torony áll, a hajókra tüzel, és a
                 partraszállást megakadályozza.
     FAL       — a lakosság fogyását lassítja, amíg le nem törik.

   Az ostrom menete:
     1. Ágyúval szét kell lőni a tornyokat — addig a part megközelíthetetlen.
     2. A sortűz ezután a lakosságot fogyasztja.
     3. Ha a lakosság kétszáz alá esik, PARTRA lehet szállni: a kirakott
        legénység elfoglalja a várost.

   A saját városodban épített LAKÓHÁZ növeli a lakosságot — vagyis a
   várost védhetőbbé teszi.
   ===================================================================== */

const VAROS_LAKOS=[250,900];        // ennyi lakossal indulnak
const VAROS_TORONY_MAX=4;
/* --- A KÉT LŐTÁV ---
   A hajó közelebbről lő, mint a város. Ez szándékos:

     hajó  300  — ennyiről tudja lőni a várost
     város 360  — és ennyiről lő vissza a hajókra

   Vagyis a sortűzhöz BE KELL MENNI a város tüzébe. Nem lehet
   biztonságos távolból lassan ledarálni a partot — aki lőni akar, az
   kockáztat. Ez adja meg az ostrom tétjét.

   A hatvan pixel különbség apró, de érezhető: annyi idő, amíg a
   parti ütegek egyszer-kétszer beleeresztenek a közeledő hajóba. */
const OSTROM_TAV=300;               // ekkora körben lő a HAJÓ a városra
const VAROS_TAV=360;                // és ekkorából lő vissza a VÁROS
const VAROS_TUZ_KOZ=2.2;            // ennyi másodpercenként ereszt egy sortüzet
const VAROS_TUZ_ERO=[10,26];        // tornyonkénti sebzés alsó és felső határa
const OSTROM_ERO=0.9;               // ennyi lakos vész el találatonként
/* A partraszállás küszöbe. Régen kétszáz volt, és a város MAGÁTÓL a
   tiéd lett, amint egyetlen katonád partot ért — se védők, se döntés.
   Most a sortűznek gyakorlatilag ki kell üríteni a várost: húsz lakos
   alatt áll ki az utolsó helyőrség, és azt le kell győzni. */
const PARTRA_LAKOS=20;              // ez alatt száll partra a legénység
const HELYORSEG_ALAP=3;             // ennyi védő + nehézségtől függő ráadás
const ZSAKMANY_LAKOS=2.2;           // ennyi arany lakosonként kifosztáskor

function varosInit(){
  G.varos={};
  const R=seedRand('varos'+(G.decoSeed||1));
  for(const v of KIKOTOK){
    const sajat=(portOwner(v.kulcs)===0);
    G.varos[v.kulcs]={
      lakos: sajat? 400 : Math.round(VAROS_LAKOS[0]+R()*(VAROS_LAKOS[1]-VAROS_LAKOS[0])),
      lakosMax: 1200,
      torony: sajat? 1 : Math.floor(R()*(VAROS_TORONY_MAX+1)),
      toronyEredeti: sajat? 1 : Math.floor(R()*(VAROS_TORONY_MAX+1)),
      fal: sajat? 0 : (R()<0.5?1:0),
      tuzT: 0,
      helyorseg: false,               // kiállt-e már az utolsó helyőrség
      dontes: false                   // vár-e döntésre (elfoglalás / kifosztás)
    };
  }
}
function varosAdat(kulcs){
  if(!G.varos) varosInit();
  return G.varos[kulcs]||(G.varos[kulcs]={lakos:400,lakosMax:1200,torony:0,fal:0,tuzT:0});
}
/* A lakóház a SAJÁT városban embert ad — ezért érdemes építeni. */
function varosLakosFrissit(){
  if(!G.varos) varosInit();
  for(const v of KIKOTOK){
    if(portOwner(v.kulcs)!==0) continue;
    const a=varosAdat(v.kulcs);
    let hazak=0, tornyok=0;
    for(const b of portBuilds(v.kulcs)){
      if(!b.done) continue;
      if(b.type==='house') hazak++;
      if(b.type==='tower') tornyok++;
    }
    a.lakosBonusz=hazak*60;
    a.torony=Math.min(VAROS_TORONY_MAX,tornyok);
  }
}
/* Ostrom: a közelben álló hajók lövik a várost. */
function ostromTick(dt){
  if(!G.pirate||!G.on) return;
  if(!G.varos) varosInit();
  varosLakosFrissit();
  for(const v of KIKOTOK){
    const a=varosAdat(v.kulcs);
    const p=portPos(v.kulcs);
    const gazda=portOwner(v.kulcs);
    // ki lövi? a MÁSIK fél hajói
    let tamado=0, tamadoOwner=null;
    for(const u of G.units){
      if(u.dead||!u.naval||!u.dmg) continue;
      if(gazda!==null&&u.owner===gazda) continue;
      if(dist(u.x,u.y,p.x,p.y)>OSTROM_TAV) continue;
      tamado+=1+(u.guns||0)/20;
      tamadoOwner=u.owner;
    }
    /* --- A VÁROS VISSZALŐ ---
       A parti üteg MINDEN közeledő ellenséges hajóra tüzel, nem csak
       arra, amelyik már lövi a várost. Ezért áll ez a rész a „nincs
       támadó” ág ELŐTT: a hajó akkor is kap, ha épp csak arra jár.

       (Először a bombázás ágába tettem, és a próba kimutatta, hogy a 320
       pixelre álló hajót békén hagyta — pedig a város lőtávja 360.)

       A célpont a LEGKÖZELEBBI ellenséges hajó. Nem sorsolunk: minden
       húzás egy újabb esély a szétcsúszásra, a legközelebbi viszont
       egyértelmű, és minden gépen ugyanaz. */
    if(a.torony>0){
      a.visszaT=(a.visszaT||0)+dt;
      if(a.visszaT>=VAROS_TUZ_KOZ){
        a.visszaT=0;
        let cel=null, cd=VAROS_TAV*VAROS_TAV;
        for(const u of G.units){
          if(u.dead||!u.naval) continue;
          if(gazda!==null&&u.owner===gazda) continue;
          if(typeof szovetseges==='function'&&gazda!==null&&szovetseges(u.owner,gazda)) continue;
          const d=(u.x-p.x)*(u.x-p.x)+(u.y-p.y)*(u.y-p.y);
          /* Azonos távolságnál a kisebb azonosító nyer — így a döntés
             sorrendfüggetlen. */
          if(d<cd||(d===cd&&cel&&u.id<cel.id)){ cd=d; cel=u; }
        }
        if(cel){
          const ero=VAROS_TUZ_ERO[0]
                   +(VAROS_TUZ_ERO[1]-VAROS_TUZ_ERO[0])*(a.torony/VAROS_TORONY_MAX);
          damage(cel,ero,{owner:(gazda===null?1:gazda)});
          G.fx.push({x:p.x+rnd(-14,14),y:p.y-8,t:0,life:.5,type:'boom',r:14});
          if(typeof helyHang==='function') helyHang('cannon',p.x,p.y,0.8);
        }
      }
    }

    if(!tamado){
      /* --- ÚJJÁÉPÜLÉS ---
         Az idegen város nem marad örökre romokban. Ha egy ideje nem
         lőtték, a lakosság visszaszivárog, és a tornyokat is felhúzzák.

         Enélkül a kifosztás körbejárható lett volna: a lakosság nullán
         maradt, a város végleg nyitva állt, és percenként újra le
         lehetett volna aratni ugyanazt a zsákmányt. */
      if(gazda===0) continue;                 // a sajátodat a lakóházak gondozzák
      a.bekeT=(a.bekeT||0)+dt;
      if(a.bekeT>10){
        a.lakos=Math.min(a.lakosMax, a.lakos + dt*2.4);
        const cel=(a.toronyEredeti===undefined)?1:a.toronyEredeti;
        if(a.torony<cel && a.lakos>a.lakosMax*0.35){
          a.toronyEpit=(a.toronyEpit||0)+dt;
          if(a.toronyEpit>75){ a.torony++; a.toronyEpit=0; a.toronyHp=1; }
        }
        /* Amint újra van védelme, a döntés és a helyőrség állapota
           alaphelyzetbe kerül — a következő ostrom tiszta lappal indul. */
        if(a.lakos>=PARTRA_LAKOS){ a.helyorseg=false; a.dontes=false; }
      }
      continue;
    }
    a.bekeT=0;
    a.tuzT=(a.tuzT||0)+dt;

    /* Előbb a tornyok dőlnek, utána fogy a lakosság. Amíg egyetlen torony
       is áll, a lakosság védett — a sortűz a védművet bontja. */
    if(a.torony>0){
      a.toronyHp=(a.toronyHp===undefined?1:a.toronyHp)-tamado*dt*0.022;
      if(a.toronyHp<=0){
        a.torony--; a.toronyHp=1;
        if(tamadoOwner===helyiFel()) toast(T('hnToronyLedolt')+' '+a.torony+' '+T('hnAll'));
        G.fx.push({x:p.x+rnd(-20,20),y:p.y+rnd(-20,20),t:0,life:.7,type:'boom',r:22});
      }
      continue;                      // amíg torony áll, a lakosság védett
    }
    const vedelem=a.fal?0.55:1;
    a.lakos=Math.max(0,a.lakos-tamado*dt*OSTROM_ERO*vedelem);
    if(a.fal&&a.lakos<a.lakosMax*0.35){
      a.fal=0;
      if(tamadoOwner===helyiFel()) toast(T('vFalakLeomlottak'));
    }
    /* A füst LÁTVÁNY, ezért Math.random — a szimulációs magból húzva
       elcsúsztatná a húzások számát azon a gépen, amelyik takarékos
       módban fut. */
    if(!REDUCED&&Math.random()<dt*3)
      G.fx.push({x:p.x+rnd(-26,26),y:p.y+rnd(-26,26),t:0,life:1.1,type:'fust'});
  }
}

/* --- A döntés: elfoglalás vagy kifosztás --- */
/* Nyitva áll-e a város a partraszállásra? Akkor, ha a tornyok ledőltek,
   és a sortűz húsz lakos alá szorította a lakosságot. */
function varosNyitva(kulcs){
  const a=varosAdat(kulcs);
  return a.torony<=0 && a.lakos<PARTRA_LAKOS;
}
/* A város élő védői a kikötő körül.

   A `tamado` az a fél, akinek a szemszögéből kérdezzük: védő mindenki,
   aki NEM ő. A régi kód a helyi játékost zárta ki (ENID) — hálózaton
   ettől minden gépen más lett a védők halmaza, és a város sorsa
   gépenként máskor dőlt el. */
function varosVedok(kulcs, tamado){
  const t=(tamado===undefined)?ENID:tamado;
  const p=portPos(kulcs), ki=[];
  for(const u of G.units){
    if(u.dead||u.owner===t||u.naval||u.air) continue;
    if(dist(u.x,u.y,p.x,p.y)<300) ki.push(u);
  }
  return ki;
}
/* Az utolsó helyőrség kiállítása. Egyszer történik városonként: amikor a
   lakosság a küszöb alá esik, a maradék férfinép fegyvert fog és kimegy a
   partra. Ezt kell legyőzni ahhoz, hogy a város sorsáról dönthess. */
function helyorsegKiall(kulcs){
  const a=varosAdat(kulcs);
  if(a.helyorseg) return;
  a.helyorseg=true;
  const p=portPos(kulcs);
  const gazda=portOwner(kulcs);
  const db=HELYORSEG_ALAP+Math.round((G.diff||1)*1.5);
  for(let i=0;i<db;i++){
    const a2=(i/db)*TAU;
    const x=p.x+dcos(a2)*70, y=p.y+dsin(a2)*70;
    if(typeof onLand==='function'&&!onLand(x,y)) continue;
    G.units.push(makeUnit(i%3===0?'ranged':'spear',(gazda===null?1:gazda),x,y,G.age));
  }
}

/* --- PARTRASZÁLLÁS ---
   A sortűz kiüríti a várost, de elfoglalni csak szárazföldi katonával
   lehet. Ez a rész azt méri, ki áll a parton, és mi történik vele. */
function partraSzallasTick(dt){
  if(!G.pirate||!G.on||!G.varos) return;
  const felek=(typeof oldalDb==='function')?oldalDb():2;
  for(const v of KIKOTOK){
    const a=varosAdat(v.kulcs);
    const p=portPos(v.kulcs);
    const birtokos=portOwner(v.kulcs);

    /* A küszöb átlépésekor kiáll az utolsó helyőrség. */
    if(varosNyitva(v.kulcs)) helyorsegKiall(v.kulcs);

    /* MINDEN FÉLRE végigmegyünk, rögzített sorrendben. A régi kód
       ENID-del dolgozott — vagyis a HELYI játékossal —, és mivel a torony
       lövése maghúzással jár, a feltétel gépenként máshol teljesült:
       nálam húzott egyet, a társamnál nem. Egyetlen húzás különbség is
       elég ahhoz, hogy a játszma szétcsúszzon. */
    for(let fel=0; fel<felek; fel++){
      if(fel===birtokos) continue;

      let katona=0;
      for(const u of G.units){
        if(u.dead||u.owner!==fel||u.air||u.role==='worker') continue;
        /* Kalózvilágban a tengeri egységek is ostromolhatják a kikötővárost;
           a szárazföldi katonák kisebb, a hajók nagyobb hatótávon belül
           számítanak. Ez konzisztens a varosDontesJogos feltételével. */
        const hatar=u.naval?320:200;
        if(dist(u.x,u.y,p.x,p.y)<hatar) katona++;
      }
      if(!katona) continue;

      /* Amíg torony áll, a partra tett legénységet lövik. */
      if(!varosNyitva(v.kulcs)){
        if(a.torony>0&&srnd()<dt*1.2){
          for(const u of G.units){
            if(u.dead||u.owner!==fel||u.naval||u.air) continue;
            if(dist(u.x,u.y,p.x,p.y)<200){ damage(u,14,{owner:birtokos}); break; }
          }
        }
        continue;
      }

      /* Amíg él védő, folyik a harc. */
      if(varosVedok(v.kulcs, fel).length) continue;

      /* Nincs több védő: a város döntésre vár. A JELÖLÉST minden gépen
         beállítjuk — az az állapot része —, csak a PÁRBESZÉD nyílik meg
         annál, aki bevette. */
      /* A JELZŐ az állapot része: minden gépen be kell állítani, hogy a
         szimuláció ne csússzon szét.

         Az ABLAK viszont NEM a jelzőtől függ, hanem attól, hogy épp a
         helyi játékos csapata áll-e ott. Ha ugyanis egy másik fél
         állította be a jelzőt előbb, a régi kód a helyi játékostól
         megvonta volna a döntést — a város bevehetetlenné vált volna.
         (A próba pontosan ezt mutatta: az egyik városnál a doboz nem
         nyílt ki, a másiknál igen.) */
      a.dontes=true;
      if(fel===((typeof helyiFel==='function')?helyiFel():0) && !G.varosDontes)
        varosDontesNyit(v.kulcs);
    }
  }
}

function varosDontesNyit(kulcs){
  G.varosDontes=kulcs;
  const v=KIKOTOK.filter(x=>x.kulcs===kulcs)[0];
  const a=varosAdat(kulcs);
  const zs=Math.round(Math.max(60,a.lakosMax*0.18+a.lakos*ZSAKMANY_LAKOS));
  const doboz=$('varosBox');
  if(doboz){
    $('varosCim').textContent=(v?v.nev:'')+' — '+T('vElesett');
    $('varosSzoveg').textContent=T('vDontsd');
    $('varosFoglal').textContent=T('vElfoglalom');
    $('varosFoszt').textContent=T('vKifosztom')+'  ·  '+zs+' '+T('nyArany').toLowerCase();
    doboz.style.display='block';
  }
  G.paused=false;
  SFX.play('ready',1);
}
function varosDontesZar(){
  const doboz=$('varosBox');
  if(doboz) doboz.style.display='none';
  G.varosDontes=null;
}
/* Kifosztás: a város NEM lesz a tiéd. Elviszed, ami mozdítható, a
   lakosság megcsappan, és a hírneved nő — de a hely marad ellenséges,
   és idővel újra megerősödik. */
/* --- A DÖNTÉS PARANCSKÉNT MEGY ---
   Az elfoglalás és a kifosztás megváltoztatja a VÁROS állapotát (lakosság,
   tornyok, falak) és az épületek tulajdonosát — ez a szimuláció része,
   tehát minden gépen le kell futnia, ugyanannál a lépésnél.

   Eddig csak a döntő gépen futott le: a többiek úgy látták volna, hogy a
   város érintetlen, a zsákmány pedig sehol. A játszma azonnal szétcsúszik.

   A `logAdd` a hálózatra teszi; ha nem hálózaton vagyunk, azonnal fut. */
function varosKifoszt(kulcs){
  if(typeof logAdd==='function'&&logAdd('varosFoszt', kulcs)) return;
  varosKifosztVegrehajt(kulcs);
}
/* --- A DÖNTÉS JOGOSSÁGA ---
   A parancs a hálózatról jön, tehát bármi lehet benne. Egy módosított
   kliens egyetlen katona nélkül is küldhetne „elfoglalom” parancsot
   bármelyik városra — a próba szerint működött is: egy ép, tornyos
   várost egy csapásra elvett, majd korlátlanul újrafosztogatott.

   Ezért a parancs VÉGREHAJTÁSAKOR újra ellenőrizzük mindent, amit a
   felület is megkövetel:

     · a város létezik, és nem a cselekvőé
     · nyitva áll (a tornyok ledőltek, a lakosság kifogyott)
     · nincs élő védője a cselekvővel szemben
     · a cselekvőnek VAN ott szárazföldi katonája

   Ez az általános szabály: a felületi feltétel nem védelem, csak
   kényelem. A védelmet a parancs oldalán kell megismételni. */
function varosDontesJogos(kulcs){
  if(!kulcs||typeof kulcs!=='string') return false;
  if(!KIKOTOK.some(v=>v.kulcs===kulcs)) return false;
  const gazda=portOwner(kulcs);
  if(gazda===ENID) return false;                 // a sajátodat nem foglalod el
  if(!varosNyitva(kulcs)) return false;          // még áll a védelem
  if(varosVedok(kulcs, ENID).length) return false;
  const p=portPos(kulcs);
  for(const u of G.units){
    if(u.dead||u.owner!==ENID||u.air||u.role==='worker') continue;
    /* Kalózvilágban tengeri egységek is elfoglalhatják a nyitott várost:
       a legénység partra száll a hajóból. Szárazföldi egységeknél
       kisebb a hatótáv (200), hajóknál nagyobb (320). */
    const hatar=u.naval?320:200;
    if(dist(u.x,u.y,p.x,p.y)<hatar) return true;
  }
  return false;
}

function varosKifosztVegrehajt(kulcs){
  if(!varosDontesJogos(kulcs)) return;
  const a=varosAdat(kulcs);
  const v=KIKOTOK.filter(x=>x.kulcs===kulcs)[0];
  const p=portPos(kulcs);
  const zs=Math.round(Math.max(60,a.lakosMax*0.18+a.lakos*ZSAKMANY_LAKOS));
  /* A zsákmány A CSELEKVŐ FÉLÉ, nem a helyi játékosé. A G.res a helyi
     ablak — hálózaton az a saját készleted, akkor is, ha épp a társad
     fosztogat. */
  const r=(typeof resOf==='function')?resOf(ENID):G.res;
  r.gold=(r.gold||0)+zs;
  r.food=(r.food||0)+Math.round(zs*0.6);
  r.stone=(r.stone||0)+Math.round(zs*0.35);           // kalózvilágban ez a rum
  if(G.earned&&ENID===((typeof helyiFel==='function')?helyiFel():0))
    G.earned.gold=(G.earned.gold||0)+zs;
  /* A város kiürül, de nem tűnik el: a tornyok és a falak odavesznek,
     a lakosság a nullára esik, és onnan nő vissza. */
  a.lakos=0; a.torony=0; a.fal=0;
  a.helyorseg=false; a.dontes=false;
  a.kifosztva=(a.kifosztva||0)+1;
  if(typeof hirnevAd==='function'&&ENID===((typeof helyiFel==='function')?helyiFel():0))
    hirnevAd(10);
  /* Az üzenet csak annak szól, aki csinálta. */
  if(ENID===((typeof helyiFel==='function')?helyiFel():0)){
    toast((v?v.nev:'')+' — '+T('vKifosztva')+': '+zs+' '+T('nyArany').toLowerCase());
    SFX.play('ready',1);
  }
  G.fx.push({x:p.x,y:p.y,t:0,life:1,type:'boom',r:30});
  varosDontesZar();
  syncUI();
}

function varosFoglal(kulcs){
  if(typeof logAdd==='function'&&logAdd('varosFoglal', kulcs)) return;
  varosFoglalVegrehajt(kulcs);
}
function varosFoglalVegrehajt(kulcs){
  if(!varosDontesJogos(kulcs)) return;
  const a=varosAdat(kulcs);
  a.lakos=Math.max(120,a.lakos);      // a megmaradt nép a te fennhatóságod alá kerül
  a.torony=0; a.fal=0;
  a.helyorseg=false; a.dontes=false;
  const p=portPos(kulcs);
  const v=KIKOTOK.filter(x=>x.kulcs===kulcs)[0];
  // a város közelében álló ellenséges épületek gazdát cserélnek
  let db=0;
  for(const b of G.builds){
    if(b.dead||b.owner===ENID) continue;
    /* A cselekvő félhez kerül, nem a 0.-hoz. Hálózaton a 0. fél nem
       feltétlenül az, aki bevette a várost — a parancsot futtató ENID
       viszont mindig ő. */
    if(dist(b.x,b.y,p.x,p.y)<420){ b.owner=ENID; b.hp=Math.max(b.hp,b.maxHp*0.4); db++; }
  }
  // ha nem volt épület, kap egy főhadiszállást, hogy tényleg a tiéd legyen
  if(!db){
    let hely=null;
    for(let r=40;r<=260&&!hely;r+=20)
      for(let k=0;k<16;k++){
        const a2=k*TAU/16;
        const x=snap(p.x+dcos(a2)*r,'hq'), y=snap(p.y+dsin(a2)*r,'hq');
        if(onLand(x,y)&&(typeof canPlace!=='function'||canPlace('hq',x,y))){ hely={x,y}; break; }
      }
    if(hely){
      /* A CSELEKVŐ félé, nem a 0.-é. Hálózaton a 0. fél nem feltétlenül
         az, aki bevette a várost — a régi sor mindig neki adta volna. */
      const b=makeBuild('hq',ENID,hely.x,hely.y,G.age,true);
      G.builds.push(b); G.navVer++;
    }
  }
  if(typeof hirnevAd==='function') hirnevAd(18);      // elfoglalt város
  toast((v?v.nev:'')+' — '+T('vElfoglalva'));
  varosDontesZar();
  SFX.play('ready',1);
  G.fx.push({x:p.x,y:p.y,t:0,life:1,type:'boom',r:34});
  syncUI();
}
