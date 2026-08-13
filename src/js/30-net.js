/* =======================================================================
   30. HÁLÓZAT — LÉPÉSZÁRAS TÖBBJÁTÉKOS

   Ugyanaz az elv, amit az Age of Mythology használ: nem a világállapotot
   küldjük át, hanem a PARANCSOKAT. Mindkét gép ugyanazt a szimulációt
   futtatja, ugyanabból a magból.

   A KÉSLELTETÉS a lényeg. Amikor parancsot adsz, az nem azonnal hat,
   hanem a mostani lépés + NET_KESES lépésnél — így a másik gépnek van
   ideje megkapni. Hat lépés = 300 ezredmásodperc: ennyi késés még nem
   érződik, viszont elbírja a hálózat ingadozását.

   Minden lépéshez KELL a másik fél üzenete, akkor is, ha nem adott
   parancsot („üres kör"). Ha nem érkezett meg, a szimuláció VÁR — ettől
   akadozik a játék rossz kapcsolatnál, de sosem csúszik szét.

   Az ELLENŐRZŐ ÖSSZEGET másodpercenként cseréljük. Ha eltér, a két világ
   szétcsúszott: azonnal megállunk, mert onnantól két külön játék menne.
   ===================================================================== */

const NET_KESES=6;                 // ennyi lépéssel indul a parancsok ütemezése
const NET_KESES_MAX=24;            // eddig nőhet, ha lassú a kapcsolat
/* Ennél több lépéssel előre nem fogadunk el csomagot. A szabályos
   előretartás legfeljebb NET_KESES_MAX (24) lépés; a 300 tehát bőven
   elég a hálózati ingadozásra is.

   Miért kell? Mert a lépéscsomagokat a jövőbeli lépés száma alatt
   tároljuk, és amíg a szimuláció oda nem ér, ott ülnek a memóriában. Egy
   gyorsabb — vagy rosszindulatú — kliens ezerszámra küldhetne előre
   csomagokat, és elfogyaszthatná a gépedet. Terheléspróbán 1388 függőben
   lévő csomag gyűlt össze, 1389 lépéssel előre. */
const NET_ELORE_MAX=300;

/* A KÉSLELTETÉS ALKALMAZKODIK a kapcsolathoz.

   Egy lépés ötven ezredmásodperc, a kiinduló hat lépés tehát 300 ms
   tartalékot ad. Ez ugyanazon a wifin bőven elég, interneten át viszont
   kevés lehet: ha a csomag később ér oda, mint ahány lépéssel előre
   ütemeztük, a szimuláció megáll és megvárja — ettől akadozik a játék.

   Ha sokat várakozunk, megnöveljük a saját késleltetésünket. Ez
   BIZTONSÁGOS, és nem kell egyeztetni a többiekkel: a parancs a saját
   lépésszámát viszi magával, és mindenki ANNÁL a lépésnél futtatja. Csak
   annyi a követelmény, hogy időben odaérjen — a nagyobb késleltetés
   pedig épp ezt segíti.

   Csökkenteni viszont nem csökkentünk játszma közben: az már küldött
   csomagokat érvénytelenítene. */
function netKesesNoveles(n){
  if(n.keses===undefined) n.keses=NET_KESES;
  if(n.keses>=NET_KESES_MAX) return;
  n.keses=Math.min(NET_KESES_MAX, n.keses+2);
  n.kesesJelzett=(n.kesesJelzett||0)+1;
  /* Egyszer szólunk, nem minden emelésnél — különben üzenetözön lenne. */
  if(n.kesesJelzett===2&&typeof toast==='function') toast(T('netLassu'));
}
const NET_ELL_LEPES=20;            // ennyi lépésenként ellenőrző összeg

/* A böngészőmotor neve. A lebegőpontos függvények (szinusz, koszinusz)
   motoronként eltérhetnek egy-egy bitnyit — ugyanaz a motor mindkét
   oldalon a biztos megoldás. Az operációs rendszer NEM számít: a Chrome
   Windowson és Macen ugyanazt számolja. */
function netMotor(){
  if(typeof navigator==='undefined') return 'node';
  const u=navigator.userAgent||'';
  if(/Edg\//.test(u)) return 'Edge';
  if(/OPR\//.test(u)) return 'Opera';
  if(/Chrome\//.test(u)) return 'Chrome';
  if(/Firefox\//.test(u)) return 'Firefox';
  if(/Safari\//.test(u)) return 'Safari';
  return 'ismeretlen';
}
function netAllapot(){
  return G.net||(G.net={
    kapcs:null, allapot:'ki', kod:'', hazigazda:false, tarsNev:'',
    hely:0,                         // a SAJÁT helyszámunk (0 = házigazda)
    jatekosok:[],                   // [{hely, nev}] — a szoba névsora
    kilepett:{},                    // helyszám -> igaz, ha kiesett a játszmából
    kiesikTol:{},                   // helyszám -> ettől a lépéstől nem várunk rá
    bejovo:{},                      // lépés -> { helyszám: parancsok }
    sajat:{},                       // lépés -> a saját parancsaink
    kimeno:[],                      // a mostani lépésre gyűlő saját parancsok
    kuldottIg:-1, ellenor:{}, hiba:null, varakozas:0,
    keses:NET_KESES, kesesJelzett:0
  });
}
/* Kiktől várunk még csomagot? A kilépettektől nem. A saját helyünk is
   benne van: a saját parancsainkat ugyanúgy a jövőbe ütemezzük. */
/* Egy fél kiesésének kihirdetése: ettől a lépéstől nem várunk rá többé,
   ÉS a közbeeső lépéseit üresre töltjük.

   A kitöltés nélkül nem jutnánk el a kihirdetett lépésig: épp arra
   várnánk, akit ki akarunk ejteni. A távozó úgysem küld semmit, tehát az
   üres parancslista a helyes tartalom — és mivel a lépésszám (`tol`)
   minden gépen ugyanaz, a kitöltés is mindenhol azonos. */
function netKiesesKihirdet(n, hely, tol){
  if(n.kiesikTol[hely]!==undefined&&n.kiesikTol[hely]<=tol) return;
  n.kiesikTol[hely]=tol;
  for(let l=(G.lepes||0)+1; l<tol; l++){
    if(!n.bejovo[l]) n.bejovo[l]={};
    if(n.bejovo[l][hely]===undefined) n.bejovo[l][hely]=[];
  }
}
function netResztvevok(){
  const n=netAllapot();
  const kov=(G.lepes||0)+1;
  const ki=[];
  for(const j of (n.jatekosok||[])){
    if(n.kilepett[j.hely]) continue;
    /* Akire már kiadták a kiesést, arra a kihirdetett lépéstől kezdve nem
       várunk — enélkül a saját kiesési parancsunkra várnánk örökké. */
    const tol=n.kiesikTol[j.hely];
    if(tol!==undefined&&kov>=tol) continue;
    ki.push(j.hely);
  }
  if(!ki.length) ki.push(n.hely);
  return ki.sort((a,b)=>a-b);
}
function netAktiv(){ return !!(G.net&&G.net.allapot==='jatek'); }

/* --- Kapcsolat --- */
/* A `nev` a saját játékosneved: ezt látják a többiek a szobában, a
   ponttáblán és a kilépési üzenetekben. Ha nem kapunk nevet, marad a
   régi, általános megnevezés — így a régi hívások sem törnek el. */
/* =======================================================================
   MEGHÍVÓ

   Eddig két mezőt kellett kitölteni: a szerver hosszú címét és a
   négybetűs kódot. Az alagútcím harminc karakter fölött van, és
   változik is — kézzel átgépelni kínszenvedés, felolvasni telefonon
   pedig reménytelen.

   Innentől EGY sor is elég:

     szurke-macska-1234.trycloudflare.com#4DGM

   A házigazda egy gombbal a vágólapra teszi, elküldi bármilyen
   üzenetküldőn, a vendég pedig beilleszti egyetlen mezőbe.

   Az értelmező elnéző: elfogadja `#`, `/` vagy szóköz elválasztóval, a
   `ws://` és `wss://` előtaggal vagy anélkül, és külön beírt kóddal is.
   ===================================================================== */
function meghivoBont(szoveg, alapCim){
  const t=String(szoveg||'').trim();
  if(!t) return {cim:alapCim||'', kod:''};

  /* Csak a kód? Négy betű-szám, semmi más. */
  if(/^[A-Za-z0-9]{4}$/.test(t)) return {cim:alapCim||'', kod:t.toUpperCase()};

  /* Cím és kód együtt. Az elválasztó lehet #, / vagy szóköz. */
  let cim=t, kod='';
  const m=t.match(/^(.*?)[#\s\/]+([A-Za-z0-9]{4})\s*$/);
  if(m){ cim=m[1].trim(); kod=m[2].toUpperCase(); }

  cim=cim.replace(/[#\/\s]+$/,'');

  /* --- A CÍM SZŰRÉSE ---
     A meghívó MÁSTÓL érkezik, tehát bármi lehet benne. Egy gépnév
     betűkből, számokból, pontból, kötőjelből, kapuszámból és útvonalból
     áll — semmi másból.

     Ha valami ezen kívül esik (más protokoll, jelölőnyelv, idézőjel),
     azt eldobjuk. Enélkül a `javascript:` vagy `data:` kezdetű
     szövegekből is „cím” lett, amit aztán a játék megpróbált megnyitni.
     Kárt nem okozott — a WebSocket úgysem nyitja meg —, de az
     állapotsorban zavaros üzenet jelent meg, és a szűrés amúgy is
     olcsóbb, mint a bizakodás. */
  const csakCim=/^[A-Za-z0-9._~\-]+(:\d{1,5})?(\/[A-Za-z0-9._~\-\/]*)?$/;
  const elotagNelkul=cim.replace(/^wss?:\/\//i,'');
  if(!csakCim.test(elotagNelkul)) return {cim:alapCim||'', kod};
  /* Előtag pótlása. A trycloudflare és minden más nyilvános alagút
     titkosított, ezért ott wss://; a saját gépen ws:// a szokás. */
  if(cim&&!/^wss?:\/\//i.test(cim)){
    const helyi=/^(localhost|127\.|192\.168\.|10\.|0\.0\.0\.0)/i.test(cim);
    cim=(helyi?'ws://':'wss://')+cim;
  }
  return {cim, kod};
}
/* A megosztható meghívó előállítása: a cím előtagja lekerül, mert a
   másik oldal úgyis kitalálja — így rövidebb az üzenet. */
function meghivoSzoveg(cim, kod){
  const rovid=String(cim||'').replace(/^wss?:\/\//i,'');
  return rovid+(kod?('#'+kod):'');
}

function netCsatlakoz(cim, mod, kod, kesz, nev){
  const n=netAllapot();
  /* A postaládákat ITT ürítjük, a kapcsolat legelején — ekkor még
     biztosan nem érkezett semmi a társtól. */
  n.bejovo={}; n.sajat={}; n.kimeno=[]; n.ellenor={}; n.kuldottIg=-1;
  n.hiba=null; n.varakozas=0; n.varInditas=null;
  try{ n.kapcs=new WebSocket(cim); }
  catch(e){ toast(T('netHibasCim')+': '+cim); return; }
  n.allapot='kapcsolodik';
  n.mod=mod;                      // az üzenetkezelőnek is kell (lásd 'szoba-lista')
  n.kapcs.onopen=()=>{
    /* A „lista” mód nem lép be sehová: csak megkérdezi, mely szobák
       várnak még játékosra. Így nem kell kódot gépelni ahhoz, hogy lásd,
       van-e egyáltalán kihez csatlakozni. */
    if(mod==='lista'){ netKuld({t:'szoba-lista'}); return; }
    const sajatNev=(nev&&String(nev).trim())||
      (mod==='nyit'?T('netHazigazda'):T('netVendeg'));
    n.sajatNev=sajatNev;
    netKuld(mod==='nyit'
      ? {t:'szoba-nyit', nev:sajatNev}
      : {t:'szoba-csatlakoz', kod:(kod||'').toUpperCase(), nev:sajatNev});
  };
  n.kapcs.onmessage=(ev)=>{
    let m; try{ m=JSON.parse(ev.data); }catch(e){ return; }
    netFogad(m, kesz);
  };
  n.kapcs.onclose=()=>{
    if(n.mod==='lista'){ n.allapot='ki'; return; }   // csendben zárul
    if(n.allapot==='jatek') netHiba(T('netMegszakadt'));
    else { n.allapot='ki'; toast(T('netLezarult')); }
  };
  n.kapcs.onerror=()=>{
    /* A SZOBALISTA-KÉRÉS nem játszma: ha nem sikerül, csak a lista
       marad üres. A netHiba viszont hibaállapotba teszi az egész
       hálózatot ÉS SZÜNETRE ÁLLÍTJA A JÁTÉKOT — vagyis egy elgépelt
       szervercím megállította volna a futó egyszemélyes játszmát is.

       (A hibát a beszúrásom okozta: a jelzés egy sorba került a netHiba
       hívásával, így az is lefutott. Ezért van most külön blokkban.) */
    if(n.mod==='lista'){
      n.allapot='ki';
      if(typeof netListaHiba==='function') netListaHiba();
      return;
    }
    netHiba(T('netNemSikerult')+': '+cim);
  };
}
function netKuld(obj){
  const n=netAllapot();
  if(n.kapcs&&n.kapcs.readyState===1) n.kapcs.send(JSON.stringify(obj));
}
function netHiba(szoveg){
  const n=netAllapot();
  n.hiba=szoveg; n.allapot='hiba';
  G.paused=true;
  toast(szoveg);
}
/* A kapcsolat bontása ÉS a teljes hálózati állapot alaphelyzetbe
   állítása. A régi netZar csak a postaládákat ürítette, a névsort, a
   helyszámot, a szobakódot és a kiesetteket bent hagyta — így egy
   következő, EGYSZEMÉLYES játszma is „hálózatinak” látszott: a
   szimuláció a lépészárra várt, a ponttábla szobakódot mutatott, és a
   Kezdés gomb a szerverre próbált küldeni.

   A `G.oldalTerv` törlése azért kell ide, mert azt a szoba állítja be, és
   ha bent marad, az Új játék menüből indított játszma is a régi
   felállással jönne létre — több emberrel, közülük eggyel „te” jelöléssel.
   Innen jött a sötét térkép is: ha a helyi fél a másik játékos helyére
   került, a saját ködrétege üres maradt. */
function netZar(){
  const n=netAllapot();
  if(n.kapcs) try{ n.kapcs.close(); }catch(e){}
  n.kapcs=null;
  n.allapot='ki';
  n.kod=''; n.hazigazda=false; n.tarsNev='';
  n.hely=0; n.jatekosok=[]; n.kilepett={}; n.kiesikTol={};
  n.bejovo={}; n.sajat={}; n.kimeno=[]; n.ellenor={};
  n.kuldottIg=-1; n.hiba=null; n.varakozas=0;
  n.keses=NET_KESES; n.kesesJelzett=0; n.keszek=0; n.varInditas=null;
  G.oldalTerv=null;
}
/* Hálózaton kívüli játszma indítása előtt. Nem bontja a kapcsolatot, ha
   nincs is — csak gondoskodik róla, hogy semmi ne maradjon a nyakunkon. */
function netTisztaLap(){
  if(typeof G==='undefined') return;
  const n=G.net;
  if(n&&(n.kapcs||n.allapot!=='ki')) netZar();
  G.oldalTerv=null;
}

/* --- Üzenetek --- */
function netFogad(m, kesz){
  const n=netAllapot();
  if(m.t==='szoba-nyilt'){
    n.kod=m.kod; n.hazigazda=true; n.allapot='varakozik';
    n.hely=(m.hely===undefined)?0:m.hely;
    if(kesz) kesz('nyilt', m.kod);
  }
  else if(m.t==='csatlakozott'){
    n.kod=m.kod; n.hazigazda=false; n.allapot='varakozik';
    n.hely=(m.hely===undefined)?1:m.hely;
    if(kesz) kesz('csatlakozott', m.kod);
  }
  else if(m.t==='szoba-lista'){
    n.szobak=m.szobak||[];
    if(typeof netSzobaLista==='function') netSzobaLista(n.szobak);
    if(kesz) kesz('szobalista', n.szobak);
    /* A lekérdező kapcsolat elvégezte a dolgát: lezárjuk, és
       visszaállunk kikapcsolt állapotba. Enélkül nyitva maradna egy
       fölösleges vonal, és a következő lekérdezést a saját védelmünk
       tiltaná le. */
    if(n.mod==='lista'){
      /* A kezelőket ELŐBB leválasztjuk, csak azután zárunk. Enélkül a
         záródás `onclose`-a még lefutna — és ha addigra a játékos már
         rákattintott a Belépésre, az épp születő ÚJ kapcsolat állapotát
         írná felül. A próbapadon pontosan ez történt: a belépés után a
         helyszám nulla maradt, az állapot pedig „ki”. */
      const regi=n.kapcs;
      n.allapot='ki'; n.kapcs=null; n.mod=null;
      if(regi){
        try{ regi.onclose=null; regi.onerror=null; regi.onmessage=null; }catch(e){}
        try{ regi.close(); }catch(e){}
      }
    }
  }
  else if(m.t==='szoba-allapot'){
    /* A szerver minden változásnál elküldi a teljes névsort — így a
       szobaképernyő mindenkinél ugyanazt mutatja, és nem kell a
       részüzenetekből összerakni. */
    n.jatekosok=m.jatekosok||[];
    if(typeof szobaHalozat==='function') szobaHalozat(n);
    if(kesz) kesz('nevsor', n.jatekosok);
  }
  else if(m.t==='szoba-valaszt'){
    /* Egy társ nemzetet — és mostantól csapatot is — választott. */
    if(typeof szobaValasztVett==='function')
      szobaValasztVett((m.hely===undefined)?m.f:m.hely, m.nemzet, m.csapat);
  }
  else if(m.t==='szoba-kesz'){
    /* Készenlét-jelzés. A HELYSZÁM a szerver bélyegzőjéből jön (m.f):
       a saját üzenetében bárki bármit írhatna, de a szerver felülírja —
       így senki nem jelentheti késznek a másikat. */
    if(typeof szobaKeszVett==='function')
      szobaKeszVett((m.f===undefined)?m.hely:m.f, !!m.kesz);
  }
  else if(m.t==='tars-erkezett'){
    n.tarsNev=m.nev||'Vendég';
    if(kesz) kesz('tars', n.tarsNev);
    /* Először a VÁLTOZATOT és a böngészőmotort egyeztetjük.

       Eltérő változat = eltérő szimuláció: a két világ az első
       másodpercben szétcsúszna. Eltérő motor (például Chrome és Safari)
       pedig a lebegőpontos függvényekben térhet el egy-egy bitnyit — ez
       is elég a szétcsúszáshoz. Ilyenkor figyelmeztetünk. */
    /* Régen a társ megérkezése AZONNAL elindította a játszmát. Több
       emberrel ez nem járható: meg kell várni, míg mindenki beül, és a
       házigazda összeállítja a felállást a szobában. Innentől csak a
       változatot egyeztetjük; az indítás a Kezdés gombra történik. */
    if(n.hazigazda) netKuld({t:'egyeztet', v:GAME_VERSION, motor:netMotor()});
  }
  else if(m.t==='egyeztet'){
    if(m.v!==GAME_VERSION){
      netHiba(T('netElteroValtozat')+' '+GAME_VERSION+', '+T('netTarsnal')+' '+m.v+
              '. '+T('netUgyanaz'));
      return;
    }
    /* A böngészőmotor MÁR NEM SZÁMÍT: a szimuláció saját, minden motoron
       bitre azonos szögfüggvényeket használ. Csak tájékoztatásul jegyezzük
       meg, ki mivel játszik. */
    n.tarsMotor=m.motor||'';
    netKuld({t:'egyeztet-ok', v:GAME_VERSION, motor:netMotor()});
  }
  else if(m.t==='egyeztet-ok'){
    if(m.v!==GAME_VERSION){
      netHiba(T('netElteroValtozat')+' '+GAME_VERSION+', '+T('netTarsnal')+' '+m.v+'.');
      return;
    }
    n.tarsMotor=m.motor||'';
  }
  else if(m.t==='indulas'){
    /* CSAK A HÁZIGAZDÁTÓL fogadjuk el.

       A szerver minden továbbított üzenetre ráírja a feladó helyszámát
       (`m.f`), és a házigazda mindig a nulladik. Enélkül BÁRMELYIK
       vendég elindíthatta a játszmát — saját felállással, saját maggal,
       akár a többiek beleegyezése nélkül. A támadási próbán ez sikerült
       is: a vendég `indulas` üzenetére a házigazda gépe azonnal
       világot generált és játékba lépett.

       Egy elrontott felállás így nem csak kellemetlen: a támadó
       megválaszthatta volna a nemzeteket, a nehézséget és a magot is. */
    if(m.f!==undefined&&m.f!==0){
      console.warn('indulás nem a házigazdától:', m.f);
      return;
    }
    /* A TERV alakja is számít: ha hiányzik vagy üres, nincs mit
       felépíteni — a régi kód ilyenkor is nekiindult volna. */
    if(!Array.isArray(m.terv)||!m.terv.length) return;
    netJatekIndit(m.mag, m.terv, m.beall, false);
    netKuld({t:'keszen'});
  }
  else if(m.t==='keszen'){
    /* A vendégek visszajelzése. A házigazda már elindult (ő küldte az
       indulást), ezért itt nincs teendő — csak jegyezzük. */
    n.keszek=(n.keszek||0)+1;
  }
  else if(m.t==='lepes'){
    /* A csomagot a FELADÓ helyszáma alá tesszük. A szerver írja bele az
       `f` mezőt; ha hiányoznék (régi szerver), az első társnak vesszük. */
    const f=(m.f===undefined)?((n.hely===0)?1:0):m.f;
    const l=+m.l;
    if(!(l>=0)) return;                                  // hibás lépésszám
    /* Csak a TÚL TÁVOLI JÖVŐT dobjuk el. A már elhagyott lépéseket NEM:
       azok ártalmatlanok (a takarítás úgyis törli őket), viszont ha
       eldobnánk, egy lemaradt társ csomagjai elveszhetnének, és a
       lépészár véglegesen megakadna — pontosan ezt láttam a
       terheléspróbán, ahol a játék a 349. lépésnél befagyott. */
    if(l>(G.lepes||0)+NET_ELORE_MAX) return;
    if(!n.bejovo[l]) n.bejovo[l]={};
    n.bejovo[l][f]=m.p||[];
    /* --- HOLTPONT-FELOLDÁS ---
       Ha a csomagban KIESÉS parancs van, azt már MOST feljegyezzük, nem
       csak akkor, amikor a szimuláció odaér.

       Miért? Mert a kiesés parancsa a jövőbe van ütemezve — de ha épp
       arra a játékosra várunk, akit ki akarunk ejteni, azt a lépést soha
       nem érjük el. A lépészár örökre megállt: a parancs a jövőben
       várakozott, a jövő pedig sosem jött el. Terheléspróbán pontosan ez
       fagyasztotta be a meccset az 509. lépésnél.

       A lépésszám (`l`) minden gépen ugyanaz, tehát a kizárás
       determinista marad. */
    for(const cs of (m.p||[]))
      if(cs&&cs.p==='netKilepett'&&cs.a&&cs.a.length)
        netKiesesKihirdet(n, cs.a[0], l);
  }
  else if(m.t==='ell'){
    /* A KILÉPETTEK összegeit eldobjuk. Aki távozik, annak az utolsó
       csomagjai még úton lehetnek, és azokat a világ már a kiesése ELŐTTI
       állapotában számolta — a többiek viszont a kiesés UTÁNIT. Az
       eltérés ilyenkor természetes, nem szétcsúszás.

       Enélkül a házigazda kilépésekor mindenki „A két játék szétcsúszott”
       üzenetet kapott, holott az összegek valójában egyeztek. */
    if(m.f!==undefined&&n.kilepett[m.f]) return;
    const kulcs=m.l;
    const sajat=n.ellenor[kulcs];
    if(sajat&&sajat!==m.e){
      /* Eltérésnél MEGŐRIZZÜK a részleteket. Korábban a különböző értéket
         egyszerűen eldobtuk, és utólag már nem lehetett megmondani,
         melyik lépésnél és mennyivel tért el a két világ — a naplóban
         minden egyformának látszott. */
      n.szetcsuszas={lepes:kulcs, sajat:sajat, tars:m.e, kitol:m.f};
      if(typeof console!=='undefined'&&console.warn)
        console.warn('szétcsúszás a(z) '+kulcs+'. lépésnél: nálam '+sajat+', a(z) '+m.f+'. félnél '+m.e);
      netHiba(T('netSzetcsuszott')+' ('+kulcs+'. lépés)');
    }else n.ellenor[kulcs]=m.e;
  }
  else if(m.t==='tars-lelepett'){
    /* Kilépés a SZOBÁBÓL még indulás előtt: csak a névsor változik.
       Kilépés JÁTSZMA KÖZBEN: nem állunk meg, mint eddig — a többiek
       játszanak tovább, a kilépő birodalma pedig magára marad.

       A kiesés pillanatát a HÁZIGAZDA hirdeti ki egy ütemezett
       paranccsal, hogy minden gépen UGYANANNÁL a lépésnél történjen.
       Enélkül az egyik gépen hamarabb tűnne el, mint a másikon — és a
       két világ szétcsúszna. */
    const hely=m.hely;
    if(n.allapot!=='jatek'){
      toast(T('netTarsKilepett'));
    }else if(hely!==undefined){
      /* KI hirdeti ki a kiesést? Régen a házigazda — csakhogy ha ÉPP Ő
         lép ki, nincs aki megtegye, és a többiek örökre rá várnak: a
         lépészár megáll, a játszma befagy.

         Ezért nem a házigazda, hanem a LEGKISEBB SORSZÁMÚ TALPON MARADT
         fél a bejelentő. Ezt mindenki ugyanúgy ki tudja számolni a saját
         gépén, tehát pontosan egy valaki fogja elküldeni — és sosem az,
         aki épp távozik. */
      const maradok=netResztvevok().filter(h=>h!==hely);
      if(maradok.length&&maradok[0]===n.hely){
        netKiesesKihirdet(n, hely, (G.lepes||0)+(n.keses||NET_KESES));
        netParancs('netKilepett',[hely]);
      }
    }
  }
  else if(m.t==='hiba'){
    toast(m.ok||T('netHiba'));
    n.allapot='ki';
  }
}
function netJatekIndit(mag, terv, beall, hazigazda){
  const n=netAllapot();
  G.simMag=mag>>>0;
  beall=beall||{};
  G.pirate=!!beall.kaloz;
  if(beall.nehez!==undefined) G.diff=beall.nehez;
  if(beall.era!==undefined)   G.startAge=beall.era;
  if(beall.map)               G.mapPick=beall.map;

  /* A TERV mindenkinél ugyanaz, csak a `helyi` jelölés más: mindenki a
     SAJÁT helyszámán ül. Ezt itt állítjuk be, mert a terv a hálózaton
     jelöletlenül utazik. */
  /* Mindenki a SAJÁT helyszáma alapján jelöli ki magát. A `hely` mező a
     tervben utazik; ha hiányoznék (régi változat), a sorszám a tartalék. */
  const sajatTerv=terv.map((h,i)=>Object.assign({}, h, {
    helyi: (h.hely!==undefined) ? (h.hely===n.hely) : (i===n.hely)
  }));
  /* Biztonsági háló: ha egyetlen helyet sem jelöltünk sajátnak, a világ
     felállna ugyan, de a te ködréteged üres maradna — teljesen fekete
     térkép, idegen birodalommal. Inkább essünk vissza az elsőre. */
  if(!sajatTerv.some(h=>h.helyi)&&sajatTerv.length) sajatTerv[0].helyi=true;
  G.oldalTerv=sajatTerv;
  const enyem=sajatTerv.filter(h=>h.helyi)[0]||sajatTerv[0];
  /* SZABAD játszma indul, küldetés NÉLKÜL — kalózmódban is.

     Régen itt `G.pirate?0:-1` állt: a kalózvilág a hadjárat 0. küldetését
     töltötte be, mert a világgenerálás anélkül nem működött. Csakhogy a
     küldetéslista a HELYI nemzethez tartozik (setCampaign(nationKey)),
     tehát `CAMPAIGN[0].enemy` gépenként MÁS: a Nassaut vezetőnél angol, a
     Fekete Szakállnál spanyol.

     Ebből a gyarmati bot nemzete is más lett — más nemzet, más bónusz —,
     és a hálózati kalózjátszma az első másodpercekben szétcsúszott. A
     hibát öt másik szétcsúszás mögött találtam meg, utolsóként.

     A küldetés nélküli kalózvilág azóta működik (lásd a v9.3 javításait),
     ezért itt is -1 jár. */
  newGame(enyem.nemzet||'hu', -1);
  n.allapot='jatek';
  /* A BEJÖVŐ postaláda ÉRINTETLEN marad.

     A két gép nem egyszerre indul: a vendég a „indulas” üzenetre kezd, a
     házigazda csak a válaszul kapott „keszen”-re. Addigra a vendég már
     elküldte az első hét üres kört — ha itt kiürítenénk a ládát, azok
     elvesznének, és a házigazda örökre a 0. lépésnél várna a társára.
     Pontosan ez történt: házigazda 0. lépés, vendég 6., mindkettő állva. */
  n.sajat={}; n.kimeno=[]; n.kuldottIg=-1;
  // az első néhány lépésre üres kört küldünk mindkét oldalról
  n.keses=NET_KESES; n.kesesJelzett=0;
  for(let i=0;i<=n.keses;i++) netKuld({t:'lepes', l:i, p:[]});
  n.kuldottIg=n.keses;
  $('menu').style.display='none';
  if(typeof langBoxShow==='function') langBoxShow(false);
  toast(T('netJatszmaIndul')+(hazigazda?' — '+T('netTeVagyHazigazda'):''));

  /* --- A KAMERA A SAJÁT BÁZISODRA ---
     Egyszemélyes játékban ezt az indító gomb intézte; a hálózati út
     kimaradt belőle. Emiatt a világ ugyan felállt, de a kamera a térkép
     alapállásában maradt: üres füvet láttál, a jobbágyaid valahol
     odébb dolgoztak. A parancssáv jelezte is őket („7× Jobbágy”), csak
     épp nem voltak a képen.

     A mobilböngésző címsora az indítás pillanatában még mozoghat, ezért
     a méretet és a kamerát az első képkockák után újra beállítjuk. */
  G.paused=false;                       // hálózati játszma sosem indul szünetben
  if(typeof $==='function'&&$('pauseTag')) $('pauseTag').style.display='none';
  const kamera=()=>{
    if(typeof resize==='function') resize();
    if(typeof centerOnBase==='function') centerOnBase();
  };
  kamera();
  if(typeof requestAnimationFrame==='function') requestAnimationFrame(kamera);
  setTimeout(kamera,300);
  setTimeout(kamera,900);
  if(typeof syncUI==='function') syncUI();
}

/* --- A hálózati lépés ---
   Igaz értéket ad, ha a szimuláció léphet. */
function netLephet(){
  const n=netAllapot();
  if(n.allapot!=='jatek') return true;
  const kov=(G.lepes||0)+1;
  /* MINDEN résztvevő csomagja kell — a sajátunké is, amit a jövőbe
     ütemeztünk. Aki kilépett, attól már nem várunk. Egyetlen hiányzó
     csomag megállítja a szimulációt: ettől akadozik a játék rossz
     kapcsolatnál, de sosem csúszik szét. */
  const lada=n.bejovo[kov]||{};
  const hianyzok=[];
  for(const h of netResztvevok()){
    if(h===n.hely) continue;                 // a sajátunk a n.sajat-ban van
    if(lada[h]===undefined) hianyzok.push(h);
  }
  if(hianyzok.length){
    n.varakozas++;
    /* Húsz egymás utáni üres kör nagyjából egy másodpercnyi állás —
       ilyenkor érdemes nagyobb tartalékkal dolgozni. */
    if(n.varakozas>20&&(n.varakozas%20)===0) netKesesNoveles(n);
    /* BIZTONSÁGI KAPCSOLÓ. Ha húsz másodpercen át egyetlen csomag sem jön
       valakitől, és a szerver sem szólt a kilépéséről (elszállt a gépe,
       megszakadt a vonala), a legkisebb sorszámú talpon maradt fél kiejti
       a játszmából.

       MINDET egyszerre ejtjük ki, nem egyesével: ha három gép szakad meg
       egyszerre, a régi, soronkénti megoldás húsz másodpercenként csak
       egyet vett ki, és a többiek percekig araszoltak.

       Az időt mérjük, nem a képkockákat: amikor a szimuláció áll, a
       képkockák is ritkulnak. */
    if(!n.varakozasOta) n.varakozasOta=Date.now();
    if(Date.now()-n.varakozasOta>20000){
      const elok=netResztvevok().filter(x=>hianyzok.indexOf(x)<0);
      if(elok.length&&elok[0]===n.hely){
        toast(T('netNemaTars'));
        const tol=(G.lepes||0)+(n.keses||NET_KESES);
        for(const h of hianyzok){
          if(n.kilepett[h]) continue;
          netKiesesKihirdet(n, h, tol);
          netParancs('netKilepett',[h]);
        }
      }
      n.varakozas=0; n.varakozasOta=0;
    }
    return false;
  }
  n.varakozas=0; n.varakozasOta=0;
  return true;
}
/* A saját parancsainkat a jövőbe ütemezzük, és elküldjük. */
function netLepesKuld(){
  const n=netAllapot();
  if(n.allapot!=='jatek') return;
  const cel=(G.lepes||0)+(n.keses||NET_KESES);
  while(n.kuldottIg<cel){
    n.kuldottIg++;
    const p=(n.kuldottIg===cel)?n.kimeno:[];
    if(n.kuldottIg===cel) n.kimeno=[];
    /* A SAJÁT parancs ugyanúgy a jövőbe kerül, mint a társé — és a saját
       gépen is CSAK AKKOR fut le. Enélkül nálad azonnal hatna, a társnál
       hat lépéssel később: a két világ első paranccsal szétcsúszna. */
    if(p.length) n.sajat[n.kuldottIg]=p;
    netKuld({t:'lepes', l:n.kuldottIg, p});
  }
}
/* A társ parancsainak végrehajtása a mostani lépésben. */
/* MINDKÉT fél parancsai lefutnak ebben a lépésben — előbb a sajátunk,
   utána a társé. A sorrend fix, hogy a két gépen azonos legyen. */
function netTarsParancsok(){
  const n=netAllapot();
  if(n.allapot!=='jatek') return;
  const futtat=(lista)=>{
    if(!lista) return;
    for(const cs of lista){
      const fn=PARANCS_TABLA[cs.p];
      if(fn) try{ fn.apply(null,cs.a); }catch(e){}
    }
  };
  /* A kijelölés a KÉPERNYŐHÖZ tartozik, nem a világhoz: mindenki a magáét
     látja. A parancsok viszont azonosítókkal dolgoznak, és a végrehajtás
     közben átállítják a G.sel-t — utána vissza kell tenni a sajátunkat,
     különben a társak minden kattintására kiugrana a kijelölésünk.

     A G.parancsFut jelzés arról gondoskodik, hogy az itt lefutó parancsok
     ne kerüljenek ÚJRA a hálózatra: végtelen halasztás lenne belőle. */
  const sajatSel=G.sel, sajatEp=G.selBuild;
  G.parancsFut=true;
  /* A végrehajtás sorrendje a HELYSZÁM szerint növekvő — mindenkinél
     ugyanaz. Két félnél ezt a „házigazda elöl” szabály adta; több
     emberrel a helyszám a rendezőelv. */
  const lada=n.bejovo[G.lepes]||{};
  for(const h of netResztvevok()){
    /* --- KI CSELEKSZIK? ---
       A parancsok a FELADÓ nevében futnak, nem a helyi játékoséban.
       Enélkül a társad korszakváltása a TE korszakodat léptette volna, a
       kiképzése a TE kaszárnyádban indult volna, az építkezése a TE
       nyersanyagodból ment volna el. A `sel` és a `cmd` működött, mert
       azok az egységek azonosítóit viszik — a többi parancs viszont a
       helyi állapotból dolgozik.

       A megoldás egyetlen sor: átállítjuk, ki a cselekvő. A G.res, a
       G.age, a G.doct, a G.upg és az ENID mind a G.enId-re mutató ablak,
       tehát MINDEN érintett függvény magától a feladó birodalmán dolgozik.
       A képernyő ettől nem zavarodik össze: a kamera, a köd és a
       ponttábla a helyiFel()-t nézi. */
    G.enId=h;
    futtat((h===n.hely) ? n.sajat[G.lepes] : lada[h]);
  }
  G.enId=(G.enIdHelyi!==undefined)?G.enIdHelyi:0;
  G.parancsFut=false;
  G.sel=sajatSel.filter(u=>!u.dead);
  G.selBuild=(sajatEp&&!sajatEp.dead)?sajatEp:null;
  delete n.sajat[G.lepes];
  delete n.bejovo[G.lepes];
}
/* Egy játékos kiesése. A házigazda ütemezi, tehát minden gépen UGYANANNÁL
   a lépésnél fut le — enélkül a világok szétcsúsznának. A birodalma a
   helyén marad, csak nem irányítja senki. */
function netKilepett(hely){
  const n=netAllapot();
  if(n.kilepett[hely]) return;
  /* Csak a KIJELÖLT BEJELENTŐ ejtheti ki a játékosokat: a legkisebb
     sorszámú talpon maradt fél. Ezt mindenki ugyanúgy kiszámolja, tehát
     egy módosított kliens nem tudja kirúgni a többieket — a parancsa
     egyszerűen hatástalan marad.

     A G.enId a parancs futása alatt a feladóra van állítva. */
  const maradok=netResztvevok().filter(x=>x!==hely);
  if(maradok.length&&G.enId!==undefined&&G.enId!==maradok[0]) return;
  n.kilepett[hely]=true;
  /* A korábbi összegek a távozó adataival készültek — töröljük őket,
     hogy ne hasonlítsuk össze a mostaniakkal. */
  n.ellenor={};
  const o=(typeof oldal==='function')?oldal(hely):null;
  if(o) o.tipus='ures';
  const nev=(o&&o.nev)||('#'+hely);
  toast(nev+' — '+T('netTarsKilepett'));
}
if(typeof parancsRegiszter==='function') parancsRegiszter('netKilepett', netKilepett);

/* Ellenőrző összeg cseréje. */
function netEllenor(){
  const n=netAllapot();
  if(n.allapot!=='jatek') return;
  if((G.lepes%NET_ELL_LEPES)!==0) return;
  const e=simChecksum();
  if(n.ellenor[G.lepes]&&n.ellenor[G.lepes]!==e)
    netHiba('A két játék szétcsúszott — a játszma megáll.');
  else n.ellenor[G.lepes]=e;
  netKuld({t:'ell', l:G.lepes, e});
  // a régi bejegyzések takarítása
  for(const k in n.ellenor) if(k<G.lepes-200) delete n.ellenor[k];
  /* A lemaradt csomagok is takarításra szorulnak. A 0. lépés ládája
     például sosem fut le (az első feldolgozott lépés az 1.), és
     ottragadna a játszma végéig. */
  for(const k in n.bejovo) if(k<G.lepes-5) delete n.bejovo[k];
  for(const k in n.sajat)  if(k<G.lepes-5) delete n.sajat[k];
}
/* A saját parancs a naplóba ÉS a hálózatra is megy. */
function netParancs(parancs, adat){
  const n=netAllapot();
  if(n.allapot!=='jatek') return false;
  n.kimeno.push({p:parancs, a:adat});
  return true;
}
